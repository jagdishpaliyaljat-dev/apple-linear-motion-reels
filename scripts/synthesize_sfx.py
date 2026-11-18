#!/usr/bin/env python3
"""
scripts/synthesize_sfx.py — Generates 15 custom motion graphics sound effects
using NumPy and standard Python wave module + FFmpeg encoding.
Zero external dependencies (no scipy required).
"""

import os
import wave
import subprocess
import numpy as np

SAMPLE_RATE = 44100
SFX_DIR = "public/sfx"
ASSETS_DIR = "public/assets"
os.makedirs(SFX_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

def export_sfx(samples: np.ndarray, filename: str, peak_db: float = -1.5):
    target_sfx = os.path.join(SFX_DIR, filename)
    target_asset = os.path.join(ASSETS_DIR, filename)
    temp_wav = target_sfx.replace(".mp3", ".wav")

    max_val = np.max(np.abs(samples))
    if max_val > 0:
        peak_target = 10 ** (peak_db / 20.0)
        samples = (samples / max_val) * peak_target

    int16_samples = (samples * 32767).astype(np.int16)
    with wave.open(temp_wav, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(int16_samples.tobytes())

    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", temp_wav, "-c:a", "libmp3lame", "-b:a", "192k", target_sfx],
        check=True
    )
    if os.path.exists(temp_wav):
        os.remove(temp_wav)

    # Mirror to public/assets
    subprocess.run(["cp", target_sfx, target_asset], check=True)
    print(f"  ✓ {filename:<22} ({os.path.getsize(target_sfx)/1024.0:4.1f} KB)")

def synth_pop():
    dur = 0.085
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    freq = 950 * np.exp(-t * 24)
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    env = (np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.5) * np.exp(-t * 36)
    export_sfx(np.sin(phase) * env, "pop.mp3")

def synth_whoosh():
    dur = 0.22
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    noise = np.random.normal(0, 1, len(t))
    env = np.sin(np.pi * (t / dur)) ** 2.2
    sweep_tone = np.sin(2 * np.pi * (180 + 550 * np.sin(np.pi * t / dur)) * t)
    export_sfx((noise * 0.55 + sweep_tone * 0.45) * env, "whoosh.mp3")

def synth_click():
    dur = 0.032
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    impulse = np.random.normal(0, 1, len(t)) * np.exp(-t * 150)
    tone = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 180)
    export_sfx(impulse * 0.70 + tone * 0.30, "click.mp3")

def synth_chime():
    dur = 0.55
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    f1, f2, f3 = 1046.5, 1318.5, 1567.98
    env = np.exp(-t * 8.5)
    wave = (0.50 * np.sin(2 * np.pi * f1 * t) +
            0.30 * np.sin(2 * np.pi * f2 * t) +
            0.20 * np.sin(2 * np.pi * f3 * t)) * env
    export_sfx(wave, "chime.mp3")

def synth_sub_thud():
    dur = 0.18
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    freq = 85 * np.exp(-t * 8)
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.3 * np.exp(-t * 14)
    wave = np.tanh((np.sin(phase) * env) * 1.5)
    export_sfx(wave, "sub_thud.mp3")

def synth_ding_notification():
    dur = 0.35
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    env = np.exp(-t * 11)
    wave = (0.7 * np.sin(2 * np.pi * 2093.0 * t) + 0.3 * np.sin(2 * np.pi * 2637.0 * t)) * env
    export_sfx(wave, "ding_notification.mp3")

def synth_marker_draw():
    dur = 0.18
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    noise = np.random.normal(0, 1, len(t))
    env = np.sin(np.pi * (t / dur)) ** 1.5
    mod = np.sin(2 * np.pi * 320 * t) * 0.4 + 0.6
    export_sfx(noise * env * mod, "marker_draw.mp3")

def synth_clock_tick():
    dur = 0.025
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    tone = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 220)
    noise = np.random.normal(0, 1, len(t)) * np.exp(-t * 280)
    export_sfx(tone * 0.65 + noise * 0.35, "clock_tick.mp3")

def synth_magic_sparkle():
    dur = 0.45
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    wave = np.zeros_like(t)
    pitches = [1200, 1500, 1800, 2400, 3000]
    for i, p in enumerate(pitches):
        delay = i * 0.04
        t_sub = np.clip(t - delay, 0, None)
        env = np.exp(-t_sub * 16) * (t >= delay)
        wave += 0.2 * np.sin(2 * np.pi * p * t_sub) * env
    export_sfx(wave, "magic_sparkle.mp3")

def synth_coin_clink():
    dur = 0.18
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    env = np.exp(-t * 22)
    wave = (0.6 * np.sin(2 * np.pi * 3200.0 * t) + 0.4 * np.sin(2 * np.pi * 5800.0 * t)) * env
    export_sfx(wave, "coin_clink.mp3")

def synth_sparkle_zap():
    dur = 0.12
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    freq = np.linspace(1200, 4200, len(t))
    env = np.sin(np.pi * (t / dur)) ** 0.8
    export_sfx(np.sin(2 * np.pi * freq * t) * env * 0.8, "sparkle_zap.mp3")

def synth_haptic_hum():
    dur = 0.15
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    mod = np.sin(2 * np.pi * 35 * t) * 0.5 + 0.5
    env = np.sin(np.pi * (t / dur))
    export_sfx(np.sin(2 * np.pi * 78.0 * t) * mod * env, "haptic_hum.mp3")

def synth_error_buzz():
    dur = 0.14
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    square_like = np.sign(np.sin(2 * np.pi * 140.0 * t)) * 0.6 + np.sin(2 * np.pi * 210.0 * t) * 0.4
    env = np.exp(-t * 14)
    export_sfx(square_like * env, "error_buzz.mp3")

def synth_riser():
    dur = 1.35
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    freq = 90.0 * ((3200.0 / 90.0) ** (t / dur))
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    tone = np.sin(phase)
    noise = np.random.normal(0, 0.4, len(t))
    env = (t / dur) ** 2.4
    export_sfx((tone * 0.7 + noise * 0.3) * env, "riser.mp3")

def synth_sub_drop():
    dur = 0.85
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    freq = 36.0 + (115.0 - 36.0) * np.exp(-t * 7.5)
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    sub = np.sin(phase)
    punch = np.sin(2 * np.pi * 260.0 * t) * np.exp(-t * 70.0)
    raw = sub * 0.85 + punch * 0.35
    env = np.exp(-t * 4.2)
    export_sfx(np.tanh(raw * 1.6) * env, "sub_drop.mp3")

def main():
    print("🎵 Synthesizing 15 Motion Graphics UI Sound Effects...")
    synth_pop()
    synth_whoosh()
    synth_click()
    synth_chime()
    synth_sub_thud()
    synth_ding_notification()
    synth_marker_draw()
    synth_clock_tick()
    synth_magic_sparkle()
    synth_coin_clink()
    synth_sparkle_zap()
    synth_haptic_hum()
    synth_error_buzz()
    synth_riser()
    synth_sub_drop()
    print("✅ All 15 Sound Effects synthesized successfully!")

if __name__ == "__main__":
    main()
