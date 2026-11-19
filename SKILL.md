---
name: apple-linear-motion-reels
description: Autonomous video director for studio-grade motion-graphic reels (1080x1920 @ 30fps). Renders ONLY via Remotion on GitHub Actions. Topic-driven, research-first, real data always. 10–13 beats, ~3s each. Word-level kinetic captions. Layered composition (browser + terminal). GitHub Actions CI renders; phone only does research/write/push.
---

# Apple / Linear Motion Reels

## HARD GATES
- viral hook gate: Beat 1 (0–3s) must open with an 8–12 word viral hook stopping the scroll in <2s, creating an open loop with payoff at the end, and having a number, contrast, or question. Script checklist table must pass 6/6 before TTS synthesis.
- verified voice pitch gate: Voiceover must use verified male voice (median F0 80–200 Hz, e.g. ElevenLabs Voice R / hi-IN-MadhurNeural).
- natural pronunciation standards: Common English loanwords ("exam", "examiner", "AI", "active recall", "summarize") must use natural, clean phonetics without robotic accents or over-inflected Devanagari spellings.
- motion-graphics sound effects architecture: Visual animation entries must have synchronized tactile UI sound effects (pops on bento/stat cards, clicks on code/terminal, whooshes on beat cuts, thuds on danger alerts, risers/sub-drops on climaxes, chimes on metric leaps).
- Remotion only on GitHub Actions: Visual rendering runs exclusively on GitHub Actions Ubuntu runner (Chromium); local phone never renders video.
- Hinglish caption glue rules: 1–3 words per token, max 22 chars, no postpositions/auxiliaries starting tokens, no leading words ending tokens, trailing punctuation stripped.
- theme = all dark except the SECOND-LAST beat: Beats 1 to N-2 and last beat are dark (#09090B); beat N-1 (second-last) is light (#F5F5F0).
- no invented names/quotes/stats: All labels, benchmark numbers, model names, and tags must exist in research.json from real sources.
- fill the canvas (>=70% below caption): Active content bounding box must cover at least 70% of canvas height below the caption; main card width >= 88%.
- preflight must pass before any render: python3 scripts/preflight.py must exit 0 with "PREFLIGHT OK" prior to dispatching any render.

## HOOK RULES — SCRIPT MUST OPEN WITH A VIRAL HOOK (NON-NEGOTIABLE)

### Where it lives
The FIRST beat (0–3 seconds) of `script.txt` is the hook. Nothing else may come before it: no "Namaste", no "aaj hum baat karenge", no topic introduction, no logo line.

### What a hook must do (all 3 required)
1. **STOP the scroll in under 2 seconds**: a bold claim, a surprising number from research, a question that hurts, or a "wrong belief" reversal.
2. **Create an open loop**: promise something the viewer wants but does not yet have ("ye 1 setting badal ke screen time 66% kam hoti hai, par ye setting koi nahi batata").
3. **Be specific**: a number, a name, or a contrast. Vague hooks ("ye bahut important hai", "dekho kya hota hai") are FAIL.

### Allowed hook patterns (pick one, adapt to the topic)
- **Wrong belief**: "Willpower ki kami nahi, app ka design tumhe phasa raha hai." (11 words)
- **Shocking number** (must be in research.json with a source): "Ek average user din me 150 baar phone check karta hai."
- **Direct challenge**: "Agar tum ye 3 cheezein nahi badlogi, to 2 saal baad bhi yahi problem hogi."
- **Before/after tease**: "Maine 10 din me screen time aadha kiya. Sirf ye 1 cheez badli."
- **Question that the viewer must answer in their head**: "Tumhara phone tumhe control karta hai, ya tum usse?"

### Forbidden hooks (FAIL)
- Any greeting or channel intro ("Namaste", "Hello dosto", "Hey guys")
- "Aaj ke video mein..." / "Is video mein hum dekhenge..."
- Topic named without tension ("Aaj hum revision ke baare mein baat karenge")
- A hook with no number, no contrast and no question
- A hook longer than 12 words (must be readable in 2 seconds on screen)

### Length and delivery
- **Hook**: 8–12 words, one sentence or two short ones.
- **On screen**: The hook is the FIRST caption block, large, with the key word in Instrument Serif Italic. Not a small label.
- **Voice**: Spoken with energy (+8% rate, no long pause in the first 1.5 seconds).
- **First frame**: The first frame must already show the main visual (no fade-in from black longer than 4 frames).

### Script checklist (agent must output this table before the script)
| Check | Required | Result |
|---|---|---|
| Hook is the first sentence | yes | PASS/FAIL |
| Hook has a number, contrast or question | yes | PASS/FAIL |
| Hook is 8–12 words | yes | PASS/FAIL |
| Hook has no greeting or topic-only line | yes | PASS/FAIL |
| Open loop present (promise in hook, payoff at end) | yes | PASS/FAIL |
| Every number in script exists in research.json with source | yes | PASS/FAIL |

*Rule: If any row is FAIL, rewrite the hook. Do not continue to the voiceover.*

### Payoff rule
The ending must answer the open loop of the hook in one sentence, then give one action (CTA). A hook promise with no payoff = FAIL.


## PRONUNCIATION & VOICE STANDARDS
- Primary Engine: ElevenLabs `eleven_multilingual_v2` using Voice R (`q1R2Hozu3EhS1EtqVHdJ`) with multi-key rotation and silence/pause compression (>0.25s pauses reduced to 0.12s micro-breaths).
- Loanwords Dictionary:
  - "exam" -> natural English phonetic `exam` / `इग्ज़ैम` (never `एग्ज़ाम`)
  - "examiner" -> `examiner` / `इग्ज़ामिनर`
  - "AI" -> `एआई` / `A.I.`
  - "active recall" -> `active recall` / `एक्टिव रिकॉल`
  - "competence" -> `कॉम्पिटेंस`
  - "retention" -> `रिटेंशन`
  - "blindspots" -> `ब्लाइंडस्पॉट्स`

## MOTION GRAPHICS SFX ENGINE (15 PROCEDURAL SOUND EFFECTS)
- Beat Cuts & Whip Transitions: `whoosh.mp3` (-7 dB)
- Bento & Card Reveals: `pop.mp3` (-5 dB)
- Terminal Typing & Code Reveals: `click.mp3` (-4 dB)
- Mouse Clicks on Buttons: `click.mp3` (-1 dB)
- Metric Leaps & Successes: `chime.mp3` (-3 dB) + `coin_clink.mp3` (-3 dB)
- Hook & Trap Impact Alerts: `sub_thud.mp3` (-2 dB) + `error_buzz.mp3` (-4 dB)
- Orbital Radar & System Scans: `sparkle_zap.mp3` (-4 dB)
- Climax Transformation: `riser.mp3` (-3 dB) + `sub_drop.mp3` (-2 dB) + `ding_notification.mp3` (-3 dB)
- Ambient Foundation: 55Hz sub-bass dark-tech pulse pad (-22 dB)
- Audio Master Target: EBU R128 (-16 LUFS, True-Peak <= -1.5 dBTP, 48kHz Stereo AAC 192k)
- Theme Architecture: Single consistent dark background (`#09090B`) across all beats or optional second-last beat light theme.
- Engagement CTA Architecture: Interactive CommentSheet with "Send in DM" button (`✓ DM Sent`) and "Comment 'KEYWORD' — prompt main aapko DM me send kar dunga 📩" prompt.

## SPECIFICATION LINKS
- Section 0: The Target Definition (37s, 30fps, 1080x1920 reference traits) -> [reel-skill-hardcore-prompt.md#0-the-target](reel-skill-hardcore-prompt.md)
- Section 1: Render Architecture (Termux phone = code/push, GitHub Actions = Remotion Chromium render) -> [reel-skill-hardcore-prompt.md#1-render-architecture](reel-skill-hardcore-prompt.md)
- Section 2: Modular Folder Structure (components/, references/, scripts/) -> [reel-skill-hardcore-prompt.md#2-the-new-skill-folder-structure](reel-skill-hardcore-prompt.md)
- Section 3: Sequential Pipeline (Research -> Script -> TTS -> Beats -> Build -> Render -> Master -> QA -> Deliver) -> [reel-skill-hardcore-prompt.md#3-pipeline](reel-skill-hardcore-prompt.md)
- Section 4: Component Specs & Motion Physics (WordCaption, CameraRig, BrowserWindow, TerminalLog, OrbitalHub, HeroLogoRing, StatCard, LineChart, SelectionBox, Cursor, CommentSheet) -> [reel-skill-hardcore-prompt.md#4-component-specs](reel-skill-hardcore-prompt.md)
- Section 5: Automated QA Gate (3 frames/beat, pixel diff > 1.5%, text bounds, element count) -> [reel-skill-hardcore-prompt.md#5-qa-gate](reel-skill-hardcore-prompt.md)
- Section 6: Anti-Patterns & Instant Fails (No emojis, no full-sentence captions, no static frames, no fake text) -> [reel-skill-hardcore-prompt.md#6-anti-patterns](reel-skill-hardcore-prompt.md)
- Section 7: Beat Map & Reference Orchestration (12 contiguous reference beats) -> [reel-skill-hardcore-prompt.md#7-first-action](reel-skill-hardcore-prompt.md)
- Section 8: Fidelity Fixes (Caption tokenizer, scale & dead space, source verification, multicolor logo, theme tokens, collision avoidance, density, loudness EBU R128 -16 LUFS) -> [reel-skill-hardcore-prompt.md#8-fixes-from-output-v1](reel-skill-hardcore-prompt.md)
- Section 9: Language, Theme & Efficiency Upgrades (Bilingual grammar glue rules, exact theme transition plan, safe areas) -> [reel-skill-hardcore-prompt.md#9-language-theme-and-efficiency-upgrades](reel-skill-hardcore-prompt.md)
- Section 11: Voice & Audio Standards (Male voice F0 80–200 Hz, natural diction, loudness EBU R128 TP<=-1.5dBTP) -> [reel-skill-hardcore-prompt.md](reel-skill-hardcore-prompt.md)

## PIPELINE COMMANDS
- Config: `cat config.json`
- Preflight: `python3 scripts/preflight.py`
- Voice: `python3 scripts/tts_sync.py`
- SFX Suite: `python3 scripts/synthesize_sfx.py`
- Build & Push: `git add . && git commit -m "build" && git push origin main`
- Watch & Deliver: `gh run watch --exit-status && gh run download`
