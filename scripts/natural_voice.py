#!/usr/bin/env python3
"""
Natural Hindi Voice Engine (free-plan friendly)
================================================
Problem solved:
  - Library/professional ElevenLabs voices (Armaan, Bunty, ...) return HTTP 402
    on a free plan -> the old pipeline silently fell back to Edge-TTS, which is
    what sounded "AI generated".
  - Generated/cloned Hindi voices on the same account DO work via the API.
  - Those voices still insert 0.5-0.7s "रुक-रुक" pauses at sentence boundaries.

Solution:
  1. Synthesize with a working generated Hindi voice (R -> XYZ fallback) using
     /with-timestamps (character-level alignment).
  2. Detect long silences (>0.30s) and compress each to 0.15s with an exact
     FFmpeg aselect timeline splice (keep first 0.15s of the pause, drop rest).
  3. Remap every word timestamp through the compressed timeline, so captions,
     foley cues and 60fps beat boundaries stay frame-perfect.

Result: natural human Hindi/Hinglish diction, no stutter, ~175-185 WPM.
"""

import base64
import re
import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from key_manager import make_request_with_rotation

# Working Hindi voices on the current free plan (verified 2026-11-17).
# 'R' is smoother than 'XYZ' (shorter pauses, better pace); XYZ is the backup.
NATURAL_VOICE_CANDIDATES = [
    ("q1R2Hozu3EhS1EtqVHdJ", "R - Natural Hindi (primary)"),
    ("pLmUIUShfYkGCWFqfsqZ", "XYZ - Natural Hindi (backup)"),
]

VOICE_SETTINGS = {
    "stability": 0.50,
    "similarity_boost": 0.75,
    "style": 0.05,
    "use_speaker_boost": True,
    "speed": 0.88,  # slower than 1.0 so compressed pauses still land ~178 WPM
}

MODEL_ID = "eleven_multilingual_v2"
PAUSE_THRESHOLD = 0.30  # only compress pauses longer than this
PAUSE_KEEP = 0.15       # keep 0.15s micro-breath instead of 0.5-0.7s stall
SILENCE_DB = "-38dB"


def get_audio_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    return float(out)


def detect_silences(path: Path) -> list:
    """Return [(start, end)] for silences >= 0.12s detected by FFmpeg."""
    proc = subprocess.run(
        ["ffmpeg", "-i", str(path), "-af",
         f"silencedetect=noise={SILENCE_DB}:d=0.12", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", proc.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", proc.stderr)]
    return list(zip(starts, ends))


def build_compression(silences: list, total_duration: float):
    """
    Return (segments, mapping_spans, total_removed).

    segments: [(start, end)] kept from the original timeline.
    mapping_spans: (s, e, kept_until, shift_before, shift_after) used to map
                   original word times onto the compressed timeline.
    """
    long_pauses = []
    for s, e in silences:
        if e - s <= PAUSE_THRESHOLD:
            continue
        long_pauses.append((s, e))

    segments = []
    mapping_spans = []
    cursor = 0.0
    shift = 0.0

    for s, e in long_pauses:
        if e >= total_duration - 0.05:
            # trailing silence: drop entirely
            segments.append((cursor, s))
            mapping_spans.append((s, e, s, shift, shift))
            shift += e - s
            cursor = e
        else:
            kept_until = s + PAUSE_KEEP
            removed = e - kept_until
            segments.append((cursor, kept_until))
            mapping_spans.append((s, e, kept_until, shift, shift + removed))
            shift += removed
            cursor = e

    segments.append((cursor, total_duration))
    return segments, mapping_spans, shift


def make_time_mapper(mapping_spans: list):
    """Build t_original -> t_compressed from mapping spans."""
    def map_time(t: float) -> float:
        for s, e, kept_until, shift_before, shift_after in mapping_spans:
            if t <= kept_until:
                return max(0.0, t - shift_before)
            if t < e:
                return max(0.0, kept_until - shift_before)
        if mapping_spans:
            return max(0.0, t - mapping_spans[-1][4])
        return t
    return map_time


def parse_alignment(alignment: dict) -> list:
    """Convert ElevenLabs character alignment into local word timestamps."""
    chars = alignment.get("characters", [])
    starts = alignment.get("character_start_times_seconds", [])
    ends = alignment.get("character_end_times_seconds", [])
    words = []
    curr = []
    w_start = None
    for c, s, e in zip(chars, starts, ends):
        if not c.strip():
            if curr and w_start is not None:
                words.append({"word": "".join(curr), "start": w_start, "end": e})
                curr, w_start = [], None
        else:
            if w_start is None:
                w_start = s
            curr.append(c)
    if curr and w_start is not None:
        words.append({
            "word": "".join(curr),
            "start": w_start,
            "end": ends[-1] if ends else w_start + 0.2,
        })
    return words


def compress_audio(raw_path: Path, out_path: Path, segments: list):
    """Splice kept segments into a new MP3 with an exact rebased timeline."""
    expr = "+".join(f"between(t,{a:.4f},{b:.4f})" for a, b in segments if b > a)
    af = f"aselect='{expr}',asetpts=N/SR/TB"
    proc = subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(raw_path), "-af", af,
         "-c:a", "libmp3lame", "-b:a", "192k", str(out_path)],
        capture_output=True, text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"FFmpeg pause compression failed: {proc.stderr[:300]}")


def synthesize_natural_beat(text: str, raw_out: Path, smooth_out: Path):
    """
    Synthesize one beat with a working natural Hindi voice and compress its
    stutter pauses. Returns word timestamps in the NEW (compressed) timeline.

    Raises RuntimeError if every voice candidate / API key fails, so the caller
    can fall back to Edge-TTS cleanly.
    """
    payload = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": VOICE_SETTINGS,
    }

    data = None
    used_voice = None
    last_error = None
    for voice_id, label in NATURAL_VOICE_CANDIDATES:
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps"
        try:
            data = make_request_with_rotation(url, payload)
            used_voice = label
            break
        except Exception as exc:
            last_error = exc
            print(f"  ⚠️ Voice '{label}' unavailable ({str(exc)[:120]}) → trying next natural voice...")
            continue

    if data is None:
        raise RuntimeError(f"All natural Hindi voices failed: {last_error}")

    raw_out.parent.mkdir(parents=True, exist_ok=True)
    raw_out.write_bytes(base64.b64decode(data["audio_base64"]))

    raw_duration = get_audio_duration(raw_out)
    silences = detect_silences(raw_out)
    segments, spans, removed = build_compression(silences, raw_duration)
    if removed > 0.01:
        compress_audio(raw_out, smooth_out, segments)
    else:
        smooth_out.write_bytes(raw_out.read_bytes())

    map_time = make_time_mapper(spans)
    local_words = []
    for w in parse_alignment(data.get("alignment", {})):
        local_words.append({
            "word": w["word"],
            "start": round(map_time(w["start"]), 3),
            "end": round(map_time(w["end"]), 3),
        })

    print(f"  🎙️ Natural voice: {used_voice} | pauses compressed: {len(spans)} "
          f"({removed:.2f}s removed) | {raw_duration:.2f}s → {get_audio_duration(smooth_out):.2f}s")
    return local_words


if __name__ == "__main__":
    # Quick smoke test (costs a few credits). Usage:
    #   python3 scripts/natural_voice.py "ये टेस्ट है।"
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("text", nargs="?", default="सोमवार का रूटीन बुधवार को मरा? दोष विलपॉवर का नहीं.")
    args = parser.parse_args()
    tmp = Path("public/audio")
    words = synthesize_natural_beat(
        args.text, tmp / "natural_raw.mp3", tmp / "natural_smooth.mp3"
    )
    print(f"✅ {len(words)} words | smooth audio: {tmp / 'natural_smooth.mp3'}")
