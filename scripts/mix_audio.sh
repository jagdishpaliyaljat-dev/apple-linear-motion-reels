#!/usr/bin/env bash
set -euo pipefail

# scripts/mix_audio.sh — Motion-Graphics Synchronized Audio Mastering Engine
# Compliant with Section 8.8 & EBU R128 Standards:
# - Video: H.264 High profile, yuv420p, BT.709 tagged, VBR 8 to 12 Mbps (max 15 Mbps), keyframe every 1s
# - Audio: AAC 192 kbps, stereo, 48kHz
# - Integrated Loudness: -16 LUFS (EBU R128: loudnorm=I=-16:LRA=11:TP=-1.5)
# - True Peak: <= -1.5 dBTP (alimiter=limit=-1.5dB)
# - Ambient Pad: procedural 55Hz sub-bass dark-tech pulse pad at -28 dB
# - Tactile Motion Graphics SFX: 15 procedural Foley sound effects precisely matched to visual entry keyframes

RAW_VIDEO="${1:-out/raw.mp4}"
FINAL_VIDEO="${2:-out/tech_harness2_hinglish_v3.mp4}"
VOICEOVER="public/voiceover.mp3"
SFX_DIR="public/sfx"

mkdir -p out "$SFX_DIR"

# 1. Synthesize SFX suite if missing
if [ ! -f "$SFX_DIR/pop.mp3" ] || [ ! -f "$SFX_DIR/whoosh.mp3" ] || [ ! -f "$SFX_DIR/riser.mp3" ]; then
  echo "Synthesizing Motion Graphics SFX suite..."
  python3 scripts/synthesize_sfx.py
fi

# 2. Procedural Ambient Pad (55Hz sub-bass dark-tech pulse pad at -28 dB)
AMBIENT="$SFX_DIR/ambient.mp3"
if [ ! -f "$AMBIENT" ]; then
  ffmpeg -y -v error -f lavfi -i "sine=frequency=55:sample_rate=48000:duration=60,volume=-28dB" "$AMBIENT"
fi

echo "Mastering audio & video into $FINAL_VIDEO with Motion-Graphics SFX Layering..."

# Audio Layers:
# 1:a -> Voiceover (0 ms)
# 2:a -> Ambient Pad (55Hz, -28 dB)
# 3:a -> Whoosh (-24 dB)
# 4:a -> Pop (-22 dB)
# 5:a -> Click (-20 dB)
# 6:a -> Sub Thud (-18 dB)
# 7:a -> Chime (-20 dB)
# 8:a -> Magic Sparkle (-22 dB)
# 9:a -> Error Buzz (-22 dB)
# 10:a -> Sparkle Zap (-22 dB)
# 11:a -> Coin Clink (-20 dB)
# 12:a -> Riser (-20 dB)
# 13:a -> Sub Drop (-18 dB)
# 14:a -> Ding Notification (-20 dB)

ffmpeg -y \
  -i "$RAW_VIDEO" \
  -i "$VOICEOVER" \
  -i "$AMBIENT" \
  -i "$SFX_DIR/whoosh.mp3" \
  -i "$SFX_DIR/pop.mp3" \
  -i "$SFX_DIR/click.mp3" \
  -i "$SFX_DIR/sub_thud.mp3" \
  -i "$SFX_DIR/chime.mp3" \
  -i "$SFX_DIR/magic_sparkle.mp3" \
  -i "$SFX_DIR/error_buzz.mp3" \
  -i "$SFX_DIR/sparkle_zap.mp3" \
  -i "$SFX_DIR/coin_clink.mp3" \
  -i "$SFX_DIR/riser.mp3" \
  -i "$SFX_DIR/sub_drop.mp3" \
  -i "$SFX_DIR/ding_notification.mp3" \
  -filter_complex "
    [1:a]adelay=0|0[vo];
    [2:a]volume=-22dB,adelay=0|0[amb];
    [3:a]volume=-7dB,adelay=0|0[w1];
    [3:a]volume=-7dB,adelay=2333|2333[w2];
    [3:a]volume=-7dB,adelay=5233|5233[w3];
    [3:a]volume=-7dB,adelay=7100|7100[w4];
    [3:a]volume=-7dB,adelay=10866|10866[w5];
    [3:a]volume=-7dB,adelay=14333|14333[w6];
    [3:a]volume=-7dB,adelay=16566|16566[w7];
    [3:a]volume=-7dB,adelay=19333|19333[w8];
    [3:a]volume=-7dB,adelay=21500|21500[w9];
    [3:a]volume=-7dB,adelay=24266|24266[w10];
    [3:a]volume=-7dB,adelay=29700|29700[w12];
    [4:a]volume=-5dB,adelay=2333|2333[p_browser];
    [4:a]volume=-5dB,adelay=5233|5233[p_science];
    [4:a]volume=-5dB,adelay=7100|7100[p_drop];
    [4:a]volume=-5dB,adelay=14333|14333[p_prompt];
    [4:a]volume=-5dB,adelay=19333|19333[p_score1];
    [4:a]volume=-5dB,adelay=19800|19800[p_score2];
    [4:a]volume=-5dB,adelay=20300|20300[p_score3];
    [4:a]volume=-5dB,adelay=29700|29700[p_sheet];
    [5:a]volume=-4dB,adelay=17000|17000[c_term1];
    [5:a]volume=-4dB,adelay=17500|17500[c_term2];
    [5:a]volume=-4dB,adelay=18000|18000[c_term3];
    [5:a]volume=-4dB,adelay=18500|18500[c_term4];
    [5:a]volume=-4dB,adelay=21500|21500[c_code];
    [5:a]volume=-1dB,adelay=30366|30366[c_mouse];
    [6:a]volume=-2dB,adelay=200|200[thud_hook];
    [7:a]volume=-3dB,adelay=10866|10866[chime_leap];
    [8:a]volume=-5dB,adelay=11500|11500[sparkle_neural];
    [9:a]volume=-4dB,adelay=3300|3300[err_trap];
    [10:a]volume=-4dB,adelay=24266|24266[zap_orbital];
    [11:a]volume=-3dB,adelay=20800|20800[coin_viva];
    [12:a]volume=-3dB,adelay=25800|25800[rise_climax];
    [13:a]volume=-2dB,adelay=26766|26766[drop_light];
    [14:a]volume=-3dB,adelay=26766|26766[ding_light];
    [vo][amb][w1][w2][w3][w4][w5][w6][w7][w8][w9][w10][w12][p_browser][p_science][p_drop][p_prompt][p_score1][p_score2][p_score3][p_sheet][c_term1][c_term2][c_term3][c_term4][c_code][c_mouse][thud_hook][chime_leap][sparkle_neural][err_trap][zap_orbital][coin_viva][rise_climax][drop_light][ding_light]amix=inputs=36:weights=1.0 0.10 0.65 0.65 0.65 0.65 0.65 0.65 0.65 0.65 0.65 0.65 0.65 0.70 0.70 0.70 0.70 0.70 0.70 0.70 0.70 0.75 0.75 0.75 0.75 0.75 0.85 0.80 0.75 0.65 0.70 0.70 0.75 0.70 0.80 0.75[mixed];
    [mixed]loudnorm=I=-16:LRA=11:TP=-1.5,alimiter=limit=-1.5dB:level=false[aout]
  " \
  -map 0:v -map "[aout]" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -b:v 10M -maxrate 14M -bufsize 20M \
  -g 30 -keyint_min 30 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -shortest \
  "$FINAL_VIDEO"

# Copy to out/final.mp4 for convenience
cp "$FINAL_VIDEO" out/final.mp4

echo "✅ Audio mastering completed: $FINAL_VIDEO & out/final.mp4"
