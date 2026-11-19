# 🎬 Apple / Linear Motion Reels Skill

> **Autonomous Video Director for Studio-Grade Motion-Graphic Reels (1080x1920 @ 30fps)**  
> Built for Antigravity, Remotion, ElevenLabs, and GitHub Actions Cloud Rendering.

---

## 🌟 Overview

The `apple-linear-motion-reels` skill transforms topic briefs into high-converting, viral vertical reels (30–45s) using Apple/Linear style design aesthetics:
- **Layered Compositions**: Browser windows with live traffic lights, streaming dark terminal logs, floating stat badges, and code editors.
- **Word-Level Kinetic Captions**: 1–3 words at a time with blur-in/blur-out physics, Inter + Instrument Serif Italic accents, and zero full-sentence text clutters.
- **15-SFX High-Impact Audio Engine**: 15 procedural Foley sound effects (+10dB boosted punch) precisely synchronized to visual keyframes.
- **Human-Grade Voiceover**: ElevenLabs Voice R (`q1R2Hozu3EhS1EtqVHdJ`) with natural loanword phonetics, pause compression, and male pitch verification.
- **Cloud Render Architecture**: Lightweight code generation on mobile/Termux, high-speed 60/30fps rendering on GitHub Actions Ubuntu Chromium runners.

---

## 📂 Repository Structure

```
apple-linear-motion-reels/
├── SKILL.md                  # Main Antigravity Skill Specification (Quality Gates & Pipeline)
├── README.md                 # Complete documentation & usage guide
├── reel-skill-hardcore-prompt.md # Deep specification & reference orchestration
├── components/               # Production TypeScript React Remotion components
│   ├── WordCaption.tsx       # Word-level kinetic blur-in captions
│   ├── CameraRig.tsx         # Smooth spring-based camera push-in and pan
│   ├── BrowserWindow.tsx     # Safari/Chrome macOS browser with traffic lights
│   ├── TerminalLog.tsx       # Streaming CLI logs with green checks & spinners
│   ├── CodeEditor.tsx        # VS Code style editor with highlighted diffs
│   ├── OrbitalHub.tsx        # Central AI radar with orbiting satellite nodes
│   ├── HeroLogoRing.tsx      # Glowing 3D logo showcase with metadata pills
│   ├── StatCard.tsx          # Spring count-up metrics & benchmark cards
│   ├── LineChart.tsx         # Animated draw-on SVG line graphs
│   ├── SelectionBox.tsx      # Interactive bounding boxes with drag handles
│   ├── Cursor.tsx            # Animated macOS mouse pointer with click states
│   └── CommentSheet.tsx      # Engagement bottom sheet with interactive "Send in DM" CTA
├── references/               # Design tokens, beat maps, and anti-pattern checklists
│   ├── beat-map.md           # 12-beat contiguous pacing reference
│   ├── design-tokens.md      # Colors, typography, spacing, and spring physics
│   └── anti-patterns.md      # Strict rules preventing flat slides & generic filler
├── scripts/                  # Automated pipeline scripts
│   ├── mix_audio.sh          # +10dB SFX audio mastering with EBU R128 (-16 LUFS)
│   ├── synthesize_sfx.py     # Standalone procedural generator for all 15 SFX
│   ├── preflight.py          # 8-point automated preflight quality gate
│   ├── tts_sync.py           # TTS synchronization and caption tokenization
│   ├── natural_voice.py      # ElevenLabs Voice R synthesis with pause compression
│   ├── key_manager.py        # Multi-key rotation manager
│   ├── qa_frames.py          # Frame extraction and pixel-diff QA auditor
│   ├── render.sh             # Cloud runner dispatch script
│   └── research.md           # Fact & metric extraction guidelines
└── template/                 # Ready-to-use Remotion starter project
    ├── .github/workflows/render.yml
    ├── package.json
    ├── tsconfig.json
    ├── remotion.config.ts
    └── src/
        ├── index.ts
        ├── Root.tsx
        └── Reel.tsx
```

---

## 🚀 The 9-Step Sequential Pipeline

1. **RESEARCH** (`research.json`): Collect real facts, metrics, logos, and benchmarks. No invented statistics.
2. **SCRIPT & VIRAL HOOK** (`script.txt` & `script_devanagari.txt`): 80–120 words, 10–13 beats.
   - **Hook Gate (Beat 1, 0–3s)**: 8–12 words, stopping scroll in <2s, creating an open loop with payoff at the end, and having a number, contrast, or question.
   - **6-Point Pre-Script Checklist**: All 6 checks must PASS before voiceover synthesis.
3. **VOICEOVER & TIMESTAMPS** (`words.json`): Synthesized with ElevenLabs Voice R, silence-compressed, verified pitch (80–200 Hz).
4. **BEAT PLAN** (`beats.json`): Map every beat to a component, real facts, and camera choreography.
5. **COMPONENTS & SCENE GRAPH** (`src/Reel.tsx`): Assemble layered Remotion compositions using `components/`.
6. **PREFLIGHT QUALITY GATE** (`python3 scripts/preflight.py`): 9/9 automated checks must pass (including viral hook gate).
7. **CLOUD RENDER**: Git push to main triggers GitHub Actions Chromium runner.
8. **AUDIO MASTERING** (`scripts/mix_audio.sh`): 15-SFX layering, +10dB boosted punch, normalized to -16 LUFS True-Peak <= -1.5 dBTP.
9. **DELIVERY**: Video copied to Android `Download/`, `Movies/`, and `DCIM/` with media scanner broadcast.

---

## 🎧 15 Procedural Sound Effects Engine

| SFX Element | Target Volume | Action / Visual Entry |
| :--- | :--- | :--- |
| `whoosh.mp3` | `-7 dB` | Beat cuts and camera whip transitions |
| `pop.mp3` | `-5 dB` | Bento cards, browser reveal, and score pills |
| `click.mp3` | `-4 dB` | Terminal log streaming and code editor lines |
| `mouse_click` | `-1 dB` | Interactive cursor clicking "Send in DM" |
| `sub_thud.mp3` | `-2 dB` | Beat 1 Hook impact and alert boxes |
| `chime.mp3` | `-3 dB` | +61% Metric leap and achievement rings |
| `sparkle_zap.mp3` | `-4 dB` | Orbital radar scan and multi-agent activation |
| `coin_clink.mp3` | `-3 dB` | Viva test score count-up finish |
| `riser.mp3` | `-3 dB` | Pre-climax ascending tension swell |
| `sub_drop.mp3` | `-2 dB` | Climax transformation bass drop |
| `ding_notification.mp3` | `-3 dB` | Result notification highlight |
| `ambient.mp3` | `-22 dB` | 55Hz sub-bass dark-tech pulse bed |

---

## 📦 Installation & Usage

### Installing via Antigravity Skills Manager
```bash
ag-skills install --global apple-linear-motion-reels
```

### Manual Clone
```bash
git clone https://github.com/jagdishpaliyaljat-dev/apple-linear-motion-reels.git ~/.gemini/config/skills/apple-linear-motion-reels
```

---

## 📄 License

MIT License © 2026 Jagdish Paliyal
