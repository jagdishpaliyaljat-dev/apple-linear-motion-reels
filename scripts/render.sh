#!/usr/bin/env bash
set -euo pipefail

# scripts/render.sh — Orchestrates render and mastering pipeline on GitHub Actions
# Called by .github/workflows/render.yml

echo "=== STEP 1: Rendering Remotion Composition ==="
mkdir -p out qa/frames
npx remotion render src/index.ts Reel out/raw.mp4 \
  --concurrency=2 \
  --codec=h264 \
  --crf=18 \
  --pixel-format=yuv420p

echo "=== STEP 2: Multi-Track Audio Mastering ==="
bash scripts/mix_audio.sh out/raw.mp4 out/final.mp4

echo "=== STEP 3: Automated QA Gate ==="
python3 scripts/qa_frames.py out/final.mp4 beats.json words.json qa

echo "=== PIPELINE COMPLETED SUCCESSFULLY ==="
