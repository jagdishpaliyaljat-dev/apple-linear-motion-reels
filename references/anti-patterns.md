# Anti-Patterns — Instant Fail

Any of these found in generated code or output = reject and redo immediately.

---

## ❌ Rendering Anti-Patterns

| Anti-pattern | Why it fails |
|---|---|
| `ffmpeg ... zoompan ... drawtext` for visuals | Can only produce static image + zoom + text overlay. No springs, no blur-in words, no cursors. |
| `color=c=... zoompan ...` pipeline for scenes | Produces slideshow, not motion graphics. BANNED. |
| Trying to render on the phone locally | Termux has no Chromium. All Remotion renders = GitHub Actions. |
| Faking a render (pretending it ran) | Never acceptable. Always use `gh run watch`. |

---

## ❌ Content Anti-Patterns

| Anti-pattern | Example | Correct approach |
|---|---|---|
| Generic placeholder text | "CRITICAL FAILURE MODE DETECTED", "PASSIVE DECAY -78%", "RETENTION DROP -78%" | Use REAL topic data from `research.json` |
| Invented statistics | "4.2x speedup", "NEAR ZERO cognitive load" | Only use numbers from official sources |
| Fixed 7-scene template | Same 7 scenes for every topic | 10–13 beats derived from script sentences |
| Full-sentence captions | "AI agents perceive, reason and execute tasks autonomously." | 1–3 words at a time: "AI agents" / "perceive" / "reason" |
| Hard-coded pixel coordinates | `top: 540, left: 80` copied between topics | Compute from canvas size: `1920 * 0.28` etc. |
| Emoji anywhere | `✓` as emoji | Use SVG check path or CSS shape |
| Padding duration to 45–60s | Adding filler beats | Duration = script word count ÷ WPM |

---

## ❌ Layout Anti-Patterns

| Anti-pattern | Correct |
|---|---|
| Single centered box, plain bg | Min 3 layers: grid + main UI + floating chip |
| `height: 600px` fixed card height | `height: 'auto'`, `padding: '36px 32px'` |
| Text overflowing card border | `overflow: 'hidden'`, min 32px clearance |
| Satellite pill text floating above border | `display: flex, alignItems: center, justifyContent: center` inside pill |
| Orbital hub without traveling dots | Each connector must have one animated dot |
| BrowserWindow without real URL | URL bar must show real domain from research |
| TerminalLog without spinner on active line | Last active line always has spinner |

---

## ❌ Quality Gate Anti-Patterns

| Anti-pattern | Correct |
|---|---|
| Self-declaring QA pass ("✅ verified") | Must run `qa_frames.py` and read `qa/report.json` |
| Skipping QA gate to save time | ALWAYS mandatory, every render |
| "Mean pixel diff < 2%" beat accepted | Static beat = fail = fix |
| Not checking caption vs words.json | OCR must match voiceover words |

---

## ❌ Audio Anti-Patterns

| Anti-pattern | Correct |
|---|---|
| No ambient pad | Always mix a −28 dB ambient pad |
| No whoosh on beat cuts | Whoosh SFX at every beat boundary |
| Raw loudness not normalized | Always `loudnorm=I=-16:LRA=11:TP=-1.5` |
