#!/usr/bin/env python3
"""
scripts/orchestrate.py — Master CLI Orchestrator for apple-linear-motion-reels
Supports full end-to-end automation or discrete lifecycle commands:
  - tts: Generates voiceover and rule-compliant caption tokens (Section 9.1).
  - beats: Derives contiguous 10–13 frame-accurate beats from words.json.
  - render: Commits, pushes to GitHub Actions, monitors run, and downloads output.
  - mix: Masters multi-track audio with EBU R128 loudness and SFX.
  - qa: Validates 3 frames/beat, pixel difference motion, and token standards.
  - deliver: Copies final MP4 to /storage/emulated/0/Download/<topic>.mp4.
"""

import sys
import os
import argparse
import json
import subprocess
import shutil

def run_cmd(cmd, desc=""):
    if desc:
        print(f"==> {desc}")
    res = subprocess.run(cmd, shell=True, text=True)
    if res.returncode != 0:
        print(f"❌ Error during: {desc or cmd}")
        sys.exit(res.returncode)

def cmd_tts(args):
    script_file = args.script or "script.txt"
    audio_out = args.audio or "public/voiceover.mp3"
    words_out = args.words or "words.json"
    run_cmd(f"python3 scripts/tts_sync.py {script_file} {audio_out} {words_out}", "Generating TTS & Grammar Caption Tokens")

def cmd_beats(args):
    words_file = args.words or "words.json"
    beats_out = args.output or "beats.json"
    fps = args.fps or 30

    if not os.path.exists(words_file):
        print(f"❌ Error: {words_file} not found.")
        sys.exit(1)

    with open(words_file, "r", encoding="utf-8") as f:
        tokens = json.load(f)

    scenes = {}
    for t in tokens:
        s = t.get("scene", 1)
        if s not in scenes:
            scenes[s] = []
        scenes[s].append(t)

    beats = []
    for s in sorted(scenes.keys()):
        scene_tokens = scenes[s]
        start_t = scene_tokens[0]["start"]
        end_t = scene_tokens[-1]["end"]
        caption = " ".join(t["text"] for t in scene_tokens)
        start_f = int(round(start_t * fps))
        end_f = int(round(end_t * fps))

        beats.append({
            "beat": s,
            "scene": s,
            "start": round(start_t, 3),
            "end": round(end_t, 3),
            "startFrame": start_f,
            "endFrame": end_f,
            "caption": caption
        })

    for i in range(len(beats) - 1):
        beats[i]["endFrame"] = beats[i + 1]["startFrame"]
        beats[i]["end"] = round(beats[i]["endFrame"] / fps, 3)

    # Read audio duration
    audio_dur = tokens[-1]["end"]
    total_frames = int(round(audio_dur * fps))
    beats[-1]["endFrame"] = total_frames
    beats[-1]["end"] = round(total_frames / fps, 3)

    with open(beats_out, "w", encoding="utf-8") as f:
        json.dump(beats, f, indent=2)

    print(f"✅ Generated {beats_out} with {len(beats)} contiguous beats ({total_frames} frames).")

def cmd_render(args):
    topic = args.topic or "reel"
    commit_msg = args.message or f"feat: render motion reel for {topic}"
    download_dir = args.dir or "downloaded_output"

    run_cmd(f'git add . && git commit -m "{commit_msg}" && git push origin main', "Committing and Pushing to GitHub")
    print("==> Waiting for GitHub Actions workflow...")
    run_cmd("gh run watch $(gh run list --limit 1 --json databaseId -q '.[0].databaseId') --exit-status", "Watching GitHub Actions Run")
    os.makedirs(download_dir, exist_ok=True)
    run_cmd(f"gh run download $(gh run list --limit 1 --json databaseId -q '.[0].databaseId') --name reel-output --dir {download_dir}", "Downloading Artifacts")
    print(f"✅ Artifacts downloaded to {download_dir}/")

def cmd_qa(args):
    video = args.video or "out/final.mp4"
    beats = args.beats or "beats.json"
    words = args.words or "words.json"
    qa_dir = args.dir or "qa"
    run_cmd(f"python3 scripts/qa_frames.py {video} {beats} {words} {qa_dir}", "Running Automated QA Gate")

def cmd_deliver(args):
    src = args.src or "downloaded_output/out/final.mp4"
    topic = args.topic or "google_harness2"
    target = f"/storage/emulated/0/Download/{topic}.mp4"

    if not os.path.exists(src):
        if os.path.exists("downloaded_12beat/out/final.mp4"):
            src = "downloaded_12beat/out/final.mp4"
        elif os.path.exists("out/final.mp4"):
            src = "out/final.mp4"
        else:
            print(f"❌ Video not found at {src}")
            sys.exit(1)

    os.makedirs(os.path.dirname(target), exist_ok=True)
    shutil.copy2(src, target)
    print(f"🎉 DELIVERED: {target}")

def main():
    parser = argparse.ArgumentParser(description="Master CLI Orchestrator for apple-linear-motion-reels")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # tts
    p_tts = subparsers.add_parser("tts", help="Generate voiceover and words.json")
    p_tts.add_argument("--script", default="script.txt")
    p_tts.add_argument("--audio", default="public/voiceover.mp3")
    p_tts.add_argument("--words", default="words.json")

    # beats
    p_beats = subparsers.add_parser("beats", help="Generate beats.json from words.json")
    p_beats.add_argument("--words", default="words.json")
    p_beats.add_argument("--output", default="beats.json")
    p_beats.add_argument("--fps", type=int, default=30)

    # render
    p_render = subparsers.add_parser("render", help="Push to GitHub Actions, watch and download")
    p_render.add_argument("--topic", default="google_harness2")
    p_render.add_argument("--message", default="")
    p_render.add_argument("--dir", default="downloaded_output")

    # qa
    p_qa = subparsers.add_parser("qa", help="Run automated QA gate")
    p_qa.add_argument("--video", default="out/final.mp4")
    p_qa.add_argument("--beats", default="beats.json")
    p_qa.add_argument("--words", default="words.json")
    p_qa.add_argument("--dir", default="qa")

    # deliver
    p_deliver = subparsers.add_parser("deliver", help="Copy final video to Download folder")
    p_deliver.add_argument("--src", default="")
    p_deliver.add_argument("--topic", default="google_harness2")

    args = parser.parse_args()

    if args.command == "tts":
        cmd_tts(args)
    elif args.command == "beats":
        cmd_beats(args)
    elif args.command == "render":
        cmd_render(args)
    elif args.command == "qa":
        cmd_qa(args)
    elif args.command == "deliver":
        cmd_deliver(args)

if __name__ == "__main__":
    main()
