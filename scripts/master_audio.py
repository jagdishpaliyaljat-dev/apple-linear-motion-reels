#!/usr/bin/env python3
"""
Broadcast-Grade Audio Master & Normalizer (EBU R128 @ -14 LUFS)
Specially engineered for mobile phone speakers on Instagram Reels & YouTube Shorts.
Pipeline:
1. High-Pass Filter (80Hz cut) -> Eliminates phone speaker muddiness
2. Vocal Presence EQ (+2.5dB @ 3.2kHz) -> Crystal clear voice cutting through BGM
3. Fast Dynamic Limiter / Compand -> Consistent punchy voice projection
4. EBU R128 Loudness Normalization (Integrated -14 LUFS, Peak -1.5dB, LRA 11)
5. Smooth Ducked BGM Layering (-22dB)
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"
AUDIO_DIR = PUBLIC_DIR / "audio"
ASSETS_DIR = PUBLIC_DIR / "assets"

def run_ffmpeg(cmd, desc=""):
    if desc:
        print(f"🎛️  {desc}...")
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"Error: {res.stderr}")
        raise RuntimeError(f"FFmpeg failed: {res.stderr}")

def master_voiceover(input_wav: Path, output_mp3: Path, add_bgm: bool = False, bgm_path: Path = None):
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    temp_stage1 = AUDIO_DIR / "temp_eq_comp.wav"
    temp_stage2 = AUDIO_DIR / "temp_loudnorm.wav"

    print(f"\n==================================================")
    print(f"🎛️ AUDIO MASTERING: EBU R128 (-14 LUFS)")
    print(f"==================================================")
    print(f"Input: {input_wav.name}")

    # Step 1: Vocal Clarity EQ + Tight Dynamic Compressor
    # highpass 80Hz -> equalizer 3200Hz +2.5dB -> acompressor (fast attack, smooth release)
    eq_comp_filter = (
        "highpass=f=80,"
        "equalizer=f=3200:t=q:w=1.2:g=2.5,"
        "acompressor=threshold=-18dB:ratio=3:attack=15:release=120:makeup=2dB"
    )
    cmd1 = [
        "ffmpeg", "-y", "-i", str(input_wav),
        "-af", eq_comp_filter,
        "-ar", "44100",
        str(temp_stage1)
    ]
    run_ffmpeg(cmd1, "Applying Phone-Speaker EQ & Vocal Compressor")

    # Step 2: EBU R128 Loudness Normalization (-14 LUFS, Peak -1.5 dB, LRA 11)
    # The gold standard for Instagram Reels, TikTok, and YouTube Shorts
    loudnorm_filter = "loudnorm=I=-14:TP=-1.5:LRA=11"
    cmd2 = [
        "ffmpeg", "-y", "-i", str(temp_stage1),
        "-af", loudnorm_filter,
        "-ar", "44100",
        str(temp_stage2)
    ]
    run_ffmpeg(cmd2, "Normalizing to EBU R128 (-14 LUFS)")

    # Step 3: Optional Master BGM Ducking Mix
    if add_bgm and bgm_path and bgm_path.exists():
        print(f"🎵 Mixing Ducked Lo-Fi BGM ({bgm_path.name}) at -23dB...")
        # amix with ducking: BGM lowered to volume 0.08
        mix_cmd = [
            "ffmpeg", "-y",
            "-i", str(temp_stage2),
            "-stream_loop", "-1", "-i", str(bgm_path),
            "-filter_complex",
            "[1:a]volume=0.08,aloop=loop=-1:size=2e+09[bgm];"
            "[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[out]",
            "-map", "[out]",
            "-c:a", "libmp3lame",
            "-b:a", "192k",
            str(output_mp3)
        ]
        run_ffmpeg(mix_cmd, "Rendering Final Master with Ducked BGM")
    else:
        # Just convert mastered audio to high-bitrate MP3
        cmd3 = [
            "ffmpeg", "-y", "-i", str(temp_stage2),
            "-c:a", "libmp3lame",
            "-b:a", "192k",
            str(output_mp3)
        ]
        run_ffmpeg(cmd3, "Encoding Master MP3 (192 kbps)")

    # Clean up temp files
    for t in [temp_stage1, temp_stage2]:
        if t.exists():
            t.unlink()

    print(f"✅ Audio Master complete: {output_mp3.name} ({output_mp3.stat().st_size // 1024} KB)")
    print(f"==================================================\n")

def main():
    parser = argparse.ArgumentParser(description="Broadcast Audio Master & EBU R128 Normalizer")
    parser.add_argument("--input", default=str(AUDIO_DIR / "voiceover.mp3"), help="Input audio file")
    parser.add_argument("--output", default=str(AUDIO_DIR / "voiceover.mp3"), help="Output audio file")
    parser.add_argument("--with-bgm", action="store_true", help="Bake ducked BGM directly into output")
    parser.add_argument("--bgm", default=str(ASSETS_DIR / "bgm.mp3"), help="BGM file path")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        # Fallback check
        alt = PUBLIC_DIR / "assets" / "voiceover.mp3"
        if alt.exists():
            input_path = alt
        else:
            print(f"Error: Input audio not found: {input_path}")
            sys.exit(1)

    master_voiceover(
        input_wav=input_path,
        output_mp3=Path(args.output),
        add_bgm=args.with_bgm,
        bgm_path=Path(args.bgm)
    )

if __name__ == "__main__":
    main()
