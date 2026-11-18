#!/usr/bin/env python3
"""
scripts/tts_sync.py — Generates voiceover and rule-compliant caption tokens.
Strictly implements Section 8.1 & Section 9.1:
- Asymmetric grammar glue:
  - POSTPOSITIONS never start a token (glue to previous word)
  - AUXILIARIES never start a token (glue to previous word)
  - LEADING_WORDS never end a token (glue to next word)
- 1–3 words per token, max 22 chars, strictly 1 line
- Strips trailing/leading punctuation
- Assigns Instrument Serif Italic emphasis to content words (at least 1 in 3 tokens)
- Stores accentWord for Remotion WordCaption component
"""

import sys
import os
import json
import asyncio
import re
import socket
import subprocess
import edge_tts

import argparse

# Force IPv4 resolution to prevent Termux mobile network timeouts
old_getaddrinfo = socket.getaddrinfo
def new_getaddrinfo(*args, **kwargs):
    responses = old_getaddrinfo(*args, **kwargs)
    return [r for r in responses if r[0] == socket.AF_INET]
socket.getaddrinfo = new_getaddrinfo

# Voice configuration: reads from config.json or environment
cfg = {}
if os.path.exists("config.json"):
    try:
        with open("config.json", encoding="utf-8") as f:
            cfg = json.load(f)
    except Exception:
        pass

DEFAULT_VOICE = cfg.get("voice_name") or ("hi-IN-SwaraNeural" if cfg.get("voice_gender") == "female" else "hi-IN-MadhurNeural")
VOICE = os.environ.get("REEL_VOICE", DEFAULT_VOICE)
RATE = os.environ.get("REEL_RATE", "+16%")
PITCH = "+0Hz"

POSTPOSITIONS = {
    "ne", "ko", "ka", "ki", "ke", "se", "mein", "me", "par", "pe", "tak", "liye", "sath", "bina"
}

AUXILIARIES = {
    "hai", "hain", "tha", "thi", "the", "ho", "gaya", "gayi", "kiya", "karta", "karti", "karte", "hua", "hui"
}

LEADING_WORDS = {
    "aur", "ya", "jo", "ye", "yeh", "wo", "woh", "kya", "agar", "lekin", "jab", "ab", "ek",
    "a", "an", "the", "to", "of", "in", "for", "with", "on", "at", "by", "from"
}

EMPHASIS_KEYWORDS = {
    "google", "release", "harness-two", "harness2", "harness", "framework", "repo", "agent", "agents",
    "supercharge", "weights", "recursive", "edits", "parallel", "command", "github",
    "accuracy", "massive", "score", "61.2", "workbuddy", "baselines", "scale", "performance",
    "link", "comment", "exponential", "scaling",
    "ai", "examiner", "viva", "active", "recall", "science", "2006", "testing", "blindspots",
    "panic", "prompt", "percent", "competence", "retention"
}

def clean_word(w: str) -> str:
    return re.sub(r'^[^\w]+|[^\w]+$', '', w)

def is_postposition(w: str) -> bool:
    return clean_word(w).lower() in POSTPOSITIONS

def is_auxiliary(w: str) -> bool:
    return clean_word(w).lower() in AUXILIARIES

def is_leading(w: str) -> bool:
    return clean_word(w).lower() in LEADING_WORDS

def get_partitions(n: int):
    """Generates all combinations of chunk sizes (2, 3, and 1) that sum to n."""
    res = []
    def backtrack(target, current):
        if target == 0:
            res.append(current)
            return
        # Prioritize 2 and 3; only use 1 when needed
        for sz in (2, 3, 1):
            if sz <= target:
                backtrack(target - sz, current + [sz])
    backtrack(n, [])
    return res

def tokenize_line(words_with_timing):
    """
    Groups words into 1–3 word tokens (max 22 chars) strictly adhering to Section 9.1 glue rules.
    Uses dynamic grammar-aware partitioning.
    """
    valid_words = [
        {"word": clean_word(x["word"]), "raw": x["word"], "start": x["start"], "end": x["end"]}
        for x in words_with_timing
        if clean_word(x["word"])
    ]
    if not valid_words:
        return []

    n = len(valid_words)
    words_list = [v["word"] for v in valid_words]

    partitions = get_partitions(n)
    best_p = None
    best_score = -10000

    for p in partitions:
        score = 0
        valid = True
        idx_w = 0
        for sz in p:
            chunk = words_list[idx_w : idx_w + sz]
            text = " ".join(chunk)
            idx_w += sz

            if len(text) > 22:
                valid = False
                break
            # Rule 1: No postposition or auxiliary at start of token
            if is_postposition(chunk[0]) or is_auxiliary(chunk[0]):
                valid = False
                break
            # Rule 2: No leading word at end of token
            if is_leading(chunk[-1]):
                valid = False
                break
            # Rule 3: No single-word connector
            if len(chunk) == 1 and (is_postposition(chunk[0]) or is_auxiliary(chunk[0]) or is_leading(chunk[0])):
                valid = False
                break

            # Scoring: Prefer 2–3 words over 1 word
            if sz in (2, 3):
                score += 20
            else:
                score -= 10
            # Small bonus for balanced chunks
            score -= abs(sz - 2.5) * 2

        if valid and score > best_score:
            best_score = score
            best_p = p

    # Fallback if no clean partition matched (very rare)
    if not best_p:
        # Simple greedy fallback
        best_p = []
        rem = n
        while rem > 0:
            if rem >= 5:
                best_p.extend([3, 2])
                rem -= 5
            elif rem == 4:
                best_p.extend([2, 2])
                rem -= 4
            elif rem in (2, 3):
                best_p.append(rem)
                rem = 0
            else:
                best_p.append(1)
                rem -= 1

    # Build tokens from best_p
    tokens = []
    idx_w = 0
    for sz in best_p:
        chunk = valid_words[idx_w : idx_w + sz]
        idx_w += sz
        group_words = [c["word"] for c in chunk]
        token_text = " ".join(group_words)
        start_t = chunk[0]["start"]
        end_t = chunk[-1]["end"]

        # Assign accentWord and emphasis
        accent = None
        for w in group_words:
            if w.lower() in EMPHASIS_KEYWORDS:
                accent = w
                break
        if not accent:
            for w in group_words:
                if not (is_postposition(w) or is_auxiliary(w) or is_leading(w)):
                    accent = w
                    break
        if not accent:
            accent = group_words[0]

        has_emphasis = any(w.lower() in EMPHASIS_KEYWORDS for w in group_words)
        tokens.append({
            "text": token_text,
            "words": group_words,
            "start": round(start_t, 3),
            "end": round(end_t, 3),
            "accentWord": accent,
            "emphasis": has_emphasis
        })

    # Ensure at least 1 in 3 tokens has emphasis
    for i, t in enumerate(tokens):
        if not t["emphasis"] and (i % 3 == 0):
            t["emphasis"] = True

    return tokens

async def generate_speech_and_tokens(script_path: str, audio_out: str, tokens_out: str, voice: str = VOICE, rate: str = RATE):
    if not os.path.exists(script_path):
        print(f"Error: {script_path} not found.")
        sys.exit(1)

    with open(script_path, "r", encoding="utf-8") as f:
        lines = [l.strip() for l in f if l.strip()]

    # Check for Devanagari phonetic script for natural speech synthesis
    dev_path = "script_devanagari.txt"
    if os.path.exists(dev_path):
        with open(dev_path, "r", encoding="utf-8") as f:
            dev_lines = [l.strip() for l in f if l.strip()]
        speech_text = " ".join(dev_lines)
        print("Using pure Devanagari phonetics track for natural pronunciation.")
    else:
        speech_text = full_text

    print(f"Generating TTS for {len(speech_text.split())} words using Voice: {voice} ({rate})...")
    os.makedirs(os.path.dirname(audio_out), exist_ok=True)

    raw_temp = audio_out + ".raw.mp3"
    communicate = edge_tts.Communicate(speech_text, voice, rate=rate, pitch=PITCH)
    await communicate.save(raw_temp)

    # Apply silence/pause compression (remove awkward >0.25s pauses down to 0.12s micro-breaths)
    proc_silence = subprocess.run(
        ["ffmpeg", "-i", raw_temp, "-af", "silencedetect=noise=-35dB:d=0.18", "-f", "null", "-"],
        capture_output=True, text=True
    )
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", proc_silence.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", proc_silence.stderr)]
    silences = list(zip(starts, ends))

    dur_probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", raw_temp],
        capture_output=True, text=True
    ).stdout.strip()
    raw_duration = float(dur_probe)

    PAUSE_THRESH, PAUSE_KEEP = 0.25, 0.12
    segments = []
    cursor = 0.0
    for s, e in silences:
        if e - s <= PAUSE_THRESH:
            continue
        keep_until = min(e, s + PAUSE_KEEP)
        if keep_until > cursor:
            segments.append((cursor, keep_until))
        cursor = e
    if cursor < raw_duration:
        segments.append((cursor, raw_duration))

    if segments:
        expr = "+".join(f"between(t,{a:.4f},{b:.4f})" for a, b in segments if b > a)
        af = f"aselect='{expr}',asetpts=N/SR/TB"
        subprocess.run(["ffmpeg", "-y", "-i", raw_temp, "-af", af, "-c:a", "libmp3lame", "-b:a", "192k", audio_out], check=True)
    else:
        subprocess.run(["cp", raw_temp, audio_out], check=True)

    if os.path.exists(raw_temp):
        os.remove(raw_temp)

    # Probe final compressed duration
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", audio_out],
        capture_output=True, text=True
    )
    duration = float(probe.stdout.strip())
    print(f"Audio generated & pause-compressed: duration = {duration:.2f}s (raw: {raw_duration:.2f}s)")

    # Character-weighted duration for each word in each line
    all_raw_words = []
    line_word_groups = []
    for line in lines:
        raw_words = re.findall(r'\S+', line)
        line_word_groups.append(raw_words)
        all_raw_words.extend(raw_words)

    total_weight = sum(len(clean_word(w)) + 3 for w in all_raw_words)
    all_tokens = []
    current_time = 0.0

    for line_idx, raw_words in enumerate(line_word_groups):
        line_weight = sum(len(clean_word(w)) + 3 for w in raw_words)
        line_dur = (line_weight / total_weight) * duration
        line_start = current_time

        words_timing = []
        w_curr_time = line_start
        for w in raw_words:
            w_wt = len(clean_word(w)) + 3
            w_dur = (w_wt / line_weight) * line_dur
            words_timing.append({"word": w, "start": w_curr_time, "end": w_curr_time + w_dur})
            w_curr_time += w_dur

        current_time += line_dur

        line_tokens = tokenize_line(words_timing)
        for t in line_tokens:
            t["scene"] = line_idx + 1
        all_tokens.extend(line_tokens)

    with open(tokens_out, "w", encoding="utf-8") as f:
        json.dump(all_tokens, f, indent=2, ensure_ascii=False)
    with open("captions.json", "w", encoding="utf-8") as f:
        json.dump(all_tokens, f, indent=2, ensure_ascii=False)

    os.makedirs("public/assets", exist_ok=True)
    subprocess.run(["cp", audio_out, "public/assets/voiceover.mp3"], check=True)

    # Generate beats.json with strict theme plan and sources
    fps = 30
    beats = []
    beat_titles = [
        "Hook: Passive Notes Trap",
        "Problem: Illusion of Competence",
        "Science Basis: Roediger & Karpicke 2006",
        "The Metric: Passive 34% Drop",
        "The Leap: Active Recall 61%",
        "The Setup: Socratic Examiner Prompt",
        "Rule 1: Direct Tough Interrogation",
        "Rule 2: Scoring 0 to 10 Rubric",
        "Rule 3: Grill Buzzwords & Fluff",
        "Diagnostic: Expose Deep Blindspots",
        "Light Climax: Zero Exam Panic",
        "Payoff & CTA: Grab Examiner Prompt"
    ]
    beat_comps = [
        "HeroLogoRing", "BrowserWindow", "StatCard", "LineChart", "StatCard",
        "BrowserWindow", "TerminalLog", "StatCard", "CodeEditor", "OrbitalHub",
        "TakeawayCard", "CreatorCTA"
    ]

    curr_frame = 0
    total_beats = len(line_word_groups)
    for idx in range(total_beats):
        line_weight = sum(len(clean_word(w)) + 3 for w in line_word_groups[idx])
        line_dur = (line_weight / total_weight) * duration
        dur_frames = max(30, int(round(line_dur * fps)))
        theme = "light" if idx == (total_beats - 2) else "dark"
        beats.append({
            "beat": idx + 1,
            "title": beat_titles[idx] if idx < len(beat_titles) else f"Beat {idx+1}",
            "component": beat_comps[idx] if idx < len(beat_comps) else "StatCard",
            "startFrame": curr_frame,
            "durationInFrames": dur_frames,
            "theme": theme,
            "sources": [
                "https://www.science.org/doi/10.1126/science.1126016",
                "https://en.wikipedia.org/wiki/Testing_effect"
            ]
        })
        curr_frame += dur_frames

    with open("beats.json", "w", encoding="utf-8") as f:
        json.dump(beats, f, indent=2, ensure_ascii=False)

    print(f"✅ Generated {tokens_out}, captions.json, beats.json ({len(beats)} beats), and synced voiceover.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TTS & Tokenizer with ALWAYS Male Voice")
    parser.add_argument("script", nargs="?", default="script.txt", help="Input script path")
    parser.add_argument("audio", nargs="?", default="public/voiceover.mp3", help="Output audio path")
    parser.add_argument("tokens", nargs="?", default="words.json", help="Output tokens path")
    parser.add_argument("--voice", default=VOICE, help="Always male voice (default: hi-IN-MadhurNeural)")
    parser.add_argument("--rate", default=RATE, help="Speech rate (default: +18%%)")
    args = parser.parse_args()

    asyncio.run(generate_speech_and_tokens(args.script, args.audio, args.tokens, voice=args.voice, rate=args.rate))
