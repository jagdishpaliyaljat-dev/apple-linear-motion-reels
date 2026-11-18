# Beat Map — Reference Reel ("Google harness2", 37s, 720×1280, 30fps)

This is the ground-truth beat breakdown. Every reel must match this density and layering.

---

## Beat-by-Beat Reference

| Beat | Time | Component | What's on screen | Camera move |
|------|------|-----------|-----------------|-------------|
| 1 | 0–3s | HeroLogoRing | Google logo in thin white ring, radial blue+red glow, 12 particles floating, pills: "NEW · JUST RELEASED" (top) + "Open source · Apache 2.0" (bottom) | slow push-in 0.95→1.03 |
| 2 | 3–6s | OrbitalHub + RepoCard | Repo card: "google-research / harness2", green "Public" pill; behind it OrbitalHub with 8 satellite pills on ellipse + traveling dots | punch-in 0.93→1.05 |
| 3 | 6–9s | HeroLogoRing (brain icon) | Glowing brain SVG (or neural net icon) in ring, 2 pulsing rings, 6 particles | slow push 1.0→1.1 |
| 4 | 9–12s | OrbitalHub (tool ring) | "model / fixed weights" text in center ring, 6 tool cards around it (web search, code exec, etc.) | rotation + zoom 1.0→1.12 |
| 5 | 12–15s | CodeEditor | Dark editor, 8 lines of Python/bash code revealed one by one, line 5 highlighted (blue bg), blinking caret, bottom status bar: "manual edits 42 · 3h 14m · score 61.2" | detail zoom into line 5, 1.1→1.22 |
| 6 | 15–18s | TerminalLog (giant) | GIANT monospace text "`--k 1 --mode parallel`" blurred window behind, giant text drawn over it centred, then pulls back | hard zoom in 1.0→1.5 on text, then pullback 1.5→1.05 |
| 7 | 18–21s | BrowserWindow + TerminalLog | Light browser top (harness2.github.io, SelectionBox around "same task"), dark terminal bottom (log lines ticking, spinner active) | slow push 1.0→1.08 |
| 8 | 21–24s | StatCard × 4 | Four StatCards counting up: +6.0, +0.3, +11.5, +4.5 — older cards dim to 0.35 when new one arrives | horizontal pan left→right |
| 9 | 24–27s | StatCard + Score | Final stat +11.8, then large "score 61.2" card, emerald glow | zoom into score card 1.0→1.14 |
| 10 | 27–31s | THEME FLIP → LineChart | 12-frame wipe to off-white (#F5F5F0) grid; diagram card: solid green curve vs dashed blue, draw-on, end dot, legend, "v9" pill | slow push 0.98→1.06 |
| 11 | 31–34s | LineChart (full) | Full chart visible, x-axis labels (gpt-4o, claude, gemini), round end dot glowing | detail zoom onto end dot |
| 12 | 34–37s | CommentSheet + Cursor | Dark "Comments" sheet, "Add a comment…" input, Post button, Cursor moves in and clicks Post | zoom 1.0→1.1, micro-recoil on click |

---

## Density Rules (derived from reference)

- Every beat has: background (grid/glow), primary UI card, at least 1 floating chip or badge
- Terminal log lines: reveal every 8–10 frames  
- StatCard count-up: 24 frames from 0 to target  
- OrbitalHub rotation: 0.15 deg/frame  
- All text matches voiceover words exactly  
- SelectionBox animates 0→full size in 8 frames  
