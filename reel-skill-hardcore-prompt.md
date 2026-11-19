# HARDCORE PROMPT — apple-linear-motion-reels specification

You are going to REWRITE the skill `apple-linear-motion-reels` from scratch. The current SKILL.md (1336 lines) is a failure: it produces flat slides, not real motion-graphic reels. Read this whole prompt, then execute. Do not ask questions. Do not summarize this prompt back to me.

---

## 0. THE TARGET (this is the only definition of "correct")

The reference is a 37s, 720x1280, 30fps reel ("Google harness2"). It has these exact traits. Every reel the skill makes must have ALL of them:

1. **REAL topic content, not generic filler.** It shows the real Google logo, a real repo card ("google-research / harness2"), real site UI ("harness2.github.io"), real numbers (+6.0, +0.3, +11.5, +4.5, +11.8, score 61.2). The skill must RESEARCH the topic first (web search / provided links) and put real names, logos, version numbers, stats in the UI. Invented placeholder text like "CRITICAL FAILURE -78%" is BANNED.
2. **Fast beats: 10–13 beats, ~3s each**, each beat locked to a spoken phrase. NOT 7 fixed scenes of 6–9s.
3. **Word-by-word kinetic caption at the top**: 1–3 words on screen at a time, small (about 5% of canvas height), Inter (white/grey) mixed with Instrument Serif Italic for emphasis words. Each word blurs in (blur 8→0, translateY 12→0) and the previous word blurs out. Captions NEVER show a full sentence.
4. **Dense micro-detail UI**: tiny status pills ("every call", "UPDATED", "NEW · JUST RELEASED"), tab bars, line numbers, footers ("manual edits 42 · 3h 14m · score 61.2"), traffic lights, URL bars. Cards look like screenshots of a real product, not a wireframe.
5. **Layered composition**: a light browser window in the upper area + a dark terminal log streaming in the bottom third, at the same time. Terminal lines tick in one by one with green check icons and a spinner on the active line.
6. **Camera behaviour inside a beat**: slow push-in, then a hard zoom INTO one detail (example: the text `--k 1 --mode parallel` blown up giant in monospace over a blurred window), then pull back.
7. **Selection / highlight interactions**: a blue selection rectangle with 4 corner handles drawn around "same task"; a blinking text caret; a highlighted code line; a cursor that moves and clicks.
8. **Count-up numbers** (+0 → +11.5) with easing, cards that dim when the next card takes focus.
9. **Mid-video theme flip**: dark (#09090B) → off-white grid (#F5F5F0 style) around 55–70% of the runtime, then a clean chart (solid green curve vs dashed blue curve, draw-on animation, end dot).
10. **Orbital hub scene**: central ring labelled "AI agent / running", 8 satellite pills around it with green plus icons, thin dashed orbit ring, particles drifting.
11. **Hero logo scene**: brand logo inside a thin glowing ring, 2 badge pills (top: NEW · JUST RELEASED, bottom: Open source · Apache 2.0), small colored particles floating.
12. **End CTA**: dark "Comments" sheet with a fake comment box ("Add a comment…", Post button) and a cursor clicking it.
13. Duration is decided by the script: **30–45 seconds**. Stop forcing 45–60s.

---

## 1. RENDER ARCHITECTURE (mobile = code, GitHub Actions = render)

Environment facts: the agent runs on a phone (Termux). The phone has NO Chromium and cannot preview video. ALL rendering happens on **GitHub Actions** (ubuntu runner, Chromium available).

The old skill rendered with FFmpeg `color source + zoompan + drawtext`. That can only make a static image slowly zooming with text. It CANNOT make springs, blur-in words, cursors, count-ups, draw-on charts or layered UI. **If any output looks flat, this is why.** It is now FORBIDDEN.

New rules:

- Visuals are rendered ONLY by **Remotion** (React + Chromium) on GitHub Actions. Real components, real `spring()`, `interpolate()`, `useCurrentFrame()`.
- FFmpeg is allowed ONLY for: audio mixing, loudnorm, muxing, frame extraction for QA. `zoompan` / `drawtext` for visuals = instant fail.
- The phone only does: research, script, TTS, word timestamps, writing TSX/JSON, git push, and downloading results. It never tries to render video itself.
- Project must contain `.github/workflows/render.yml`:
  - trigger: `workflow_dispatch` and push to `main` touching `src/**`, `public/**`, `beats.json`
  - steps: checkout, setup-node 20, `npm ci`, `npx remotion browser ensure`, `npx remotion render src/index.ts Reel out/raw.mp4 --concurrency=2 --codec=h264`, install ffmpeg, run `scripts/mix_audio.sh`, run `scripts/qa_frames.py`
  - upload artifacts: `final.mp4`, `qa/frames/*.png`, `qa/report.json`
- Agent loop on phone: `git add . && git commit && git push` -> `gh run watch` -> `gh run download` -> read `qa/report.json` and view the QA frames -> fix -> push again. Max 3 loops.
- If `gh` is not logged in, STOP and print exactly: `NEED: gh auth login`. Never fake a render locally.
- Final delivery: copy `final.mp4` to `/storage/emulated/0/Download/` and print the path.
- Canvas 1080x1920, 30fps. Keep scenes light (no huge blur on full-screen layers) so the runner finishes in under 8 minutes.

---

## 2. THE NEW SKILL FOLDER STRUCTURE (split it, do not write one giant file)

```
apple-linear-motion-reels/
├── SKILL.md                  (MAX 150 lines: pipeline + hard rules + links)
├── references/
│   ├── beat-map.md           (the reference reel, beat by beat, with seconds)
│   ├── design-tokens.md
│   └── anti-patterns.md
├── components/               (real .tsx files, tested, importable)
│   ├── WordCaption.tsx       (word-level blur caption)
│   ├── CameraRig.tsx
│   ├── BrowserWindow.tsx
│   ├── TerminalLog.tsx
│   ├── CodeEditor.tsx
│   ├── OrbitalHub.tsx
│   ├── HeroLogoRing.tsx
│   ├── StatCard.tsx          (count-up)
│   ├── LineChart.tsx         (draw-on, solid + dashed)
│   ├── SelectionBox.tsx
│   ├── Cursor.tsx
│   └── CommentSheet.tsx
└── scripts/
    ├── research.md           (how to collect real facts + logo)
    ├── tts_sync.py           (edge-tts + word timestamps -> words.json)
    ├── render.sh             (called by the GitHub workflow, not the phone)
    ├── qa_frames.py          (extract + diff check)
    └── mix_audio.sh
```

Why: a 63KB SKILL.md makes the agent skim and ignore rules. Short SKILL.md + real component files = the agent reuses working code instead of improvising.

---

## 3. PIPELINE (strict order, each step must write a file proving it happened)

1. **RESEARCH** -> `research.json`: official name, logo (SVG or PNG from the official source, saved to `public/logos/`), 5–8 real facts, real numbers, repo/site URL, 1 benchmark or before/after metric. If no logo can be fetched, draw a clean monogram, never a random icon.
2. **SCRIPT** -> `script.txt`: Hinglish voiceover, 80–120 words, one idea per sentence, each sentence = one beat. **Hook must open in the first 2 seconds (non-negotiable)**.

### Mandatory Viral Hook Rules (Step 2 Hard Gate):
- **Where it lives**: Beat 1 (0–3 seconds) of `script.txt`. No greetings ("Namaste", "Hey guys"), no "aaj hum baat karenge", no intro.
- **What a hook must do (All 3 required)**:
  1. STOP scroll in <2 seconds: bold claim, shocking number from research, question that hurts, or wrong belief reversal.
  2. Create an open loop: promise something the viewer wants but doesn't have yet.
  3. Be specific: concrete number, name, or contrast. Vague hooks are instant FAIL.
- **Allowed Patterns**:
  - Wrong belief: "Willpower ki kami nahi, app ka design tumhe phasa raha hai." (11 words)
  - Shocking number (sourced in research.json): "Ek average user din me 150 baar phone check karta hai."
  - Direct challenge: "Agar tum ye 3 cheezein nahi badlogi, to 2 saal baad bhi yahi problem hogi."
  - Before/after tease: "Maine 10 din me screen time aadha kiya. Sirf ye 1 cheez badli."
  - Mental question: "Tumhara phone tumhe control karta hai, ya tum usse?"
- **Forbidden Hooks (FAIL)**: Any greeting/channel intro, "Aaj ke video mein...", topic named without tension, no number/contrast/question, longer than 12 words.
- **Length & Delivery**: 8–12 words. Key word in Instrument Serif Italic on screen. Spoken with +8% rate. First frame shows visual.
- **Pre-Script Checklist (Mandatory Gate)**:
  | Check | Required | Result |
  |---|---|---|
  | Hook is the first sentence | yes | PASS/FAIL |
  | Hook has a number, contrast or question | yes | PASS/FAIL |
  | Hook is 8–12 words | yes | PASS/FAIL |
  | Hook has no greeting or topic-only line | yes | PASS/FAIL |
  | Open loop present (promise in hook, payoff at end) | yes | PASS/FAIL |
  | Every number in script exists in research.json with source | yes | PASS/FAIL |
  *(If any row is FAIL, rewrite before proceeding to TTS).*
- **Payoff Rule**: The ending must resolve the open loop in one sentence before the CTA.

3. **TTS + WORD TIMESTAMPS** -> `words.json` (`[{word,start,end}]`). Beat boundaries are derived from this file. Captions are generated FROM this file, word by word. Never hand-type caption timing.
4. **BEAT PLAN** -> `beats.json`: for every beat: start, end, spoken words, which component, which REAL data goes inside, camera move. A beat with generic placeholder data = plan rejected, redo.
5. **BUILD** Remotion comp using only `components/`. Each beat = layered scene (min 3 layers: background grid, main UI, floating detail chip). Every scene wrapped in CameraRig.
6. **RENDER** on GitHub Actions (Section 1) -> `raw.mp4`
7. **AUDIO** -> voice + soft ambient pad + whoosh on each beat cut + pop on each pill/badge + click on cursor click -> loudnorm -16 LUFS -> `final.mp4`
8. **QA GATE** (Section 5). Fail = fix and re-render. Max 3 loops.
9. **DELIVER** to `/storage/emulated/0/Download/` and print the path.

---

## 4. COMPONENT SPECS (fidelity bar)

- **WordCaption**: top 8–10% of canvas, centered, font-size ~54px at 1080 wide. Words appear one at a time (or 2–3 for short ones). Emphasis words use Instrument Serif Italic, others Inter 500/700. Enter: blur 8->0, y 12->0, opacity 0->1 over 6 frames. Exit: reverse over 5 frames. A word must be fully readable for at least 6 frames. Caption text must match voiceover words exactly.
- **BrowserWindow**: 3 traffic dots, centered pill URL bar with favicon + real domain, light theme (#FFFFFF, border rgba(0,0,0,.08)), radius 18, soft shadow. Content is cropped so only the relevant section shows, and it slowly scrolls/pans.
- **TerminalLog**: dark navy (#0E1424) card, header row with tool name + right-aligned meta pills ("jb · k 1 · parallel"), each log line: green check icon + text + right-aligned grey status. Active line has a spinner. Final line shows a green metric ("+11.5 pts"). Lines reveal every 8–10 frames.
- **OrbitalHub**: center circle with 2 concentric rings (inner solid green, outer dashed), 8 pill satellites on an ellipse, each pill has label + tiny green plus badge, dashed connectors, one traveling dot per connector. Slow rotation 0.15deg/frame.
- **HeroLogoRing**: logo 200–260px inside a 1px light ring, radial blue/red glow behind, 2 pills, 10–14 tiny particles with sinusoidal drift.
- **StatCard**: label (tiny grey), big number (Inter 700, 64px), sub-label. Count-up with Easing.out(cubic) over 24 frames. When a new card arrives, older cards dim to opacity .35.
- **LineChart**: SVG path draw-on via strokeDashoffset, one solid green line + one dashed blue line, 3 x-axis labels, legend with two entries, round end-dot with glow, "v9" pill top right.
- **SelectionBox**: 1.5px blue border, 4 white square handles, light blue fill 8%, animates from 0 to full size in 8 frames.
- **Cursor**: SVG arrow with Bezier path (not a straight line), scale .85 on click, ripple ring.
- **Theme flip**: a 12-frame wipe or cross-fade, grid lines change color too, text color tokens switch together. Do it once.

Motion physics for everything: `spring({damping:18, stiffness:120, mass:0.8})`. Every element that enters has a blur-to-sharp (4px->0) and a 6–10px y-offset. Nothing pops in without easing.

---

## 5. QA GATE (the agent must PROVE quality, not tick boxes)

`qa_frames.py` runs inside the GitHub workflow and must:
1. Extract 3 frames per beat (start, middle, end) as PNG.
2. Compute frame difference between the three frames of every beat. If mean pixel difference < 2%, that beat is STATIC -> FAIL.
3. OCR or read the caption region for each beat and check the words match `words.json`.
4. Check no text is clipped outside its card (compare text bounding boxes to card bounds).
5. Check count of distinct on-screen elements per beat >= 4 (grid, main UI, chip, caption).
6. Print a table: beat | static? | caption ok | clipping | elements. ANY failure = re-render.
7. Open 6 of the extracted frames with the image viewer and describe them honestly versus Section 0. If a frame looks like "text on a plain background" -> FAIL.

The old 15-point self-declared checklist is DELETED. Checkbox self-approval is not allowed.

---

## 6. ANTI-PATTERNS (instant fail)

- Full-sentence captions
- Fixed 7-scene template reused for every topic
- Generic text: "CRITICAL FAILURE", "PASSIVE DECAY", "-78% RETENTION DROP" unless the topic truly has that data
- Plain color background with only text
- Hard-coded pixel coordinates copied between topics (positions must be computed from layout)
- Emojis anywhere
- FFmpeg zoompan/drawtext visuals
- Delivering a video without running the QA gate
- Padding the duration to hit 45–60s

---

## 7. FIRST ACTION

1. Back up the old SKILL.md as `SKILL.old.md`.
2. Build `components/` and test each one by rendering a 2-second still/video of it alone.
3. Write the new short SKILL.md and `references/beat-map.md` using the reference reel beats:
   - 0–3s hero logo ring + badges
   - 3–6s repo card + orbital hub (8 pills)
   - 6–9s glowing brain icon
   - 9–12s tool cards around a "model / fixed weights" ring
   - 12–15s code editor, typed lines, highlighted line, status footer
   - 15–18s giant zoom on a terminal command
   - 18–27s light browser (selection box, stat cards counting up) + dark terminal log below
   - 27–31s theme flip to off-white grid + diagram card
   - 31–34s line chart draw-on
   - 34–37s comment sheet + cursor click CTA
4. Run the full pipeline once with the topic: **"Google harness2"** and compare your output frame by frame with the beat list above. Report which beats still differ and fix them before finishing.

---

## 8. FIXES FROM OUTPUT v1 (google_harness2.mp4, 1080x1920, 44.6s) — MANDATORY

v1 proved the Remotion path works. These defects remain. Fix ALL of them.

**8.1 CAPTION TOKENIZER (current captions are garbage: "ne abhi", "hai. Model", "retraining. Par", "dash k", "kya aap")**
- Captions are built from whole words of the script, never from raw TTS chunks or sub-word splits.
- Strip trailing punctuation from every caption token (no "hai." "Par," on screen).
- Group by meaning: 1–3 words per token. See Section 9.1 for the exact Hinglish glue rules (they override this line).
- Hinglish voiceover: caption text is the same English/Hinglish word that was spoken, spelled correctly. Spell-check every caption token against the script. Hyphen/em-dash tokens ("context—continuously") must be split.
- Strictly ONE line. If a token does not fit in one line, split it into two tokens.
- Typeface: Inter 500 for normal words, Instrument Serif Italic for emphasis words (at least 1 emphasis word per 3 tokens). Current single heavy sans is wrong.
- Caption color is a THEME TOKEN. In the light theme the caption must be #09090B (v1 had near-white caption on off-white = unreadable at ~29s).

**8.2 SCALE AND DEAD SPACE (v1 cards are tiny, bottom 40% of many frames is empty black)**
- Main card width >= 88% of canvas width (about 950px of 1080). Body text >= 30px, small labels >= 22px at 1080 wide. Anything smaller = fail.
- Below the caption, the scene content bounding box must cover >= 70% of the remaining height. Stack layers (browser + terminal, chart + stat chips, sheet + preview) to fill it.
- Orbital hub: scale the whole graph to 90% of canvas width, pills >= 26px text.
- Comment sheet must occupy the bottom 55–60% of the canvas with 2–3 fake comment rows above the input, not an empty glow above a tiny box.
- Background radial glow: max 15% opacity, never a giant blue disc.

**8.3 NO INVENTED FACTS (v1 invented benchmark names SWE BENCH / INTERCODE / GAIA BENCH / WEBARENA, model names GPT-4o / Claude 3.5 / Gemini 1.5, "Zero Latency Drift", "Task ID: 4198", "61.2 over baseline")**
- Every label, benchmark name, model name, number, tag and sentence shown inside a UI must exist in `research.json` with a source URL.
- If research did not find it, do NOT make it up. Use neutral UI chrome only (tabs, icons, URL bar) or skip that element.
- Numbers must be attached to their REAL labels. A real number with a fake label is worse than no number.
- QA step: print every on-screen string and its source key from research.json; any string without a source (excluding generic UI chrome like "Comments", "Post") = FAIL.

**8.4 REAL LOGO (v1 shows a plain blue letter "G")**
- The hero ring must show the official multicolor logo asset from `public/logos/`. A letter/monogram fallback is allowed ONLY if the fetch failed twice, and then the final report must say "LOGO FALLBACK USED".

**8.5 THEME TOKENS MUST COVER EVERY LAYER (v1 flip changed only the background; chart card stayed dark on off-white)**
- In the light theme: card surface #FFFFFF, border rgba(0,0,0,.08), text #09090B, chart card white with green solid + blue dashed lines. Browser window stays white, terminal stays dark navy (it is a deliberate contrast layer).
- Theme plan is fixed: ALL beats dark except the SECOND-LAST beat, which is light; the LAST beat (CTA) is dark again. Details in Section 9.2.

**8.6 COLLISIONS AND CLIPPING (v1: selection tag overlaps the heading text; cursor and ripple cover the Post label)**
- Selection box and its tag sit OUTSIDE the text they select, with 6px padding. The tag never overlaps neighbouring text.
- The cursor stops 12px left of the button label, then clicks; the ripple is drawn under the label.
- QA: run a text-bounding-box overlap test per frame; any overlap between two text boxes = FAIL.

**8.7 DENSITY**
- Terminal log: 5 lines (propose, probe, compose, refined, score) with spinner on the active line, never fewer than 4.
- Browser window must show the real section of the real site (use a screenshot-style recreation of the actual page headings and cards from research), not a generic invented hero.
- The giant command-zoom beat must zoom INTO the previous scene's window (same layer scaled up and blurred behind), not a new standalone card.

**8.8 PACING AND AUDIO**
- Target 36–42s. v1 ran 44.6s. Cut any beat longer than 3.5s.
- True peak must be <= -1.5 dBTP (v1 peak -1.1 dB). Run loudnorm with `TP=-1.5` and verify with `ffmpeg -af ebur128=peak=true`.

**8.9 EXTRA QA CHECKS (add to qa_frames.py)**
1. Caption contrast ratio vs the local background >= 4.5:1 on every beat.
2. Caption token lint: no token ends with punctuation or a connector word, none longer than 3 words.
3. Canvas coverage: non-background pixels below the caption >= 70% of that region.
4. Source check from 8.3.
5. Report each check as pass/fail per beat in `qa/report.json` and print the table. Any fail = re-render (max 3 loops).


---

## 9. LANGUAGE, THEME AND EFFICIENCY UPGRADES (final rules, override anything earlier that conflicts)

### 9.1 Bilingual captions (Hindi + English, Roman script)
Voiceover and captions are Hinglish. Captions stay in Roman script and use the exact words spoken (English words stay English, Hindi words in simple Roman spelling). Config flag `caption_script: roman` (default). Only if the user asks for Devanagari, bundle Noto Sans Devanagari and use it for Hindi tokens.

Hindi grammar glue rules (v2 broke them: "ne release kiya", "ko adapt karti hai", "ke liye recursive", "hain without ground"):
- POSTPOSITIONS follow their noun, so they glue to the PREVIOUS word and can NEVER start a token: ne, ko, ka, ki, ke, se, mein, me, par, pe, tak, liye, sath, bina. Example: "Google ne" | "release kiya", "model ko" | "adapt karti hai".
- AUXILIARIES and verb endings glue to the PREVIOUS word: hai, hain, tha, thi, the, ho, gaya, gayi, kiya, karta, karti, karte. Example: "adapt karti hai" stays together, "chala gaya" stays together.
- LEADING words glue to the NEXT word: aur, ya, jo, ye, yeh, wo, woh, kya, agar, lekin, jab, ab, ek, English articles and prepositions (a, an, the, to, of, in, for, with).
- A token never starts with a postposition or auxiliary, never ends with a leading word, and never exceeds 3 words or 22 characters.
- Run a lint over `captions.json` before the build: print every token and FAIL if any rule is broken. Spell-check each token against the script text (v2 had "mukable").
- Emphasis (Instrument Serif Italic) goes ONLY on the key content word of a phrase: a product name, a number, a verb of action. Never on postpositions, auxiliaries or filler.
- Hindi tokens and English tokens use the same size and weight so mixed captions look like one line of type.

### 9.2 Theme plan (exact)
- Beats 1 to N-3 and the last beat: dark (#09090B).
- Beat N-1 (second-last): light (#F5F5F0 grid) with white cards. Minimum 4 seconds on screen.
- Last beat (CTA): dark again.
- Transition into light: 14-frame radial or diagonal wipe, with every layer switching tokens during the wipe (background, grid, caption color, card surface, borders, shadows). Transition out of light: 10-frame cross-fade to dark.
- Never do a hard cut between themes. QA: sample luminance every frame across the transition; the change must spread over >= 8 frames.

### 9.3 Fix list from v2 (all mandatory)
1. Tokenizer: Section 9.1.
2. Scale: Section 8.2 is NOT optional. QA must reject any frame where body text < 22px at 1080 width or where the empty bottom band is > 20% of canvas height.
3. Edge clipping: nothing important may touch or cross the safe area (60px sides, 220px top, 260px bottom) unless it is a deliberate camera pan that ends fully inside the safe area. Orbital pills must be re-laid out to fit.
4. Giant command zoom: scale the SAME terminal/browser layer up to fill 100% of canvas width with a 14-frame spring, blur the rest, then pull back. Do not draw a second small card.
5. De-duplication: the same visual (hero ring, command card, 61.2 card) may appear in ONE beat only. Maximum 1 beat per concept. No three consecutive beats showing the same number.
6. Cursor/click choreography: cursor follows a Bezier path, arrives at the button 6 frames BEFORE the click, scale .85 on the click frame, ripple starts on the click frame, button state changes on the click frame +2. Cursor must be on the button when state changes. QA frame check at click+3 must find the cursor inside the button bounds.
7. Chart: x-axis labels and legend never overlap (legend goes above the plot or in a reserved row). X labels must come from research.json, else use "task 1 / task 5 / task 9" style neutral labels.
8. Content integrity (hard fail): NO invented people, quotes, comment authors, model names, benchmark names or numbers. For the comments sheet, use clearly generic placeholders ("User", "Viewer") with neutral text such as "Great breakdown" or leave the rows as grey skeleton bars. Never attach text to a real person's name unless it is a verbatim quote in research.json with a URL.
9. Number logic: one number, one meaning. If 61.2 is a "score" in research, display exactly "score 61.2" where research shows it; do not turn it into "overall evaluation score +X over baseline" unless research says so.
10. Audio: add dynamics. Voice ducks the ambient bed by 8 dB while speaking. SFX at beat cuts (soft whoosh), pill/badge pops, one click. Target -16 LUFS, LRA >= 4 LU, true peak <= -1.5 dBTP; verify with ebur128 and print the three numbers.

### 9.4 EFFICIENCY: make the loop fast and cheap

**A. Data-driven build (biggest saver).** All content lives in `beats.json`, `captions.json`, `research.json`. TSX components only read JSON. A fix = edit JSON, not rewrite TSX. Never regenerate components that already passed their test.

**B. Three-pass render, cheapest first.**
1. LINT PASS (seconds, on the phone): caption lint, source check (8.3), safe-area/overlap check on `beats.json` geometry, spell-check, duration check. No render yet.
2. STILL PASS (about 1 minute, GitHub): `npx remotion still` at 3 frames per beat (start, middle, end) at `--scale=0.5`. Run `qa_frames.py` on these stills. Fix everything here.
3. FULL PASS (only when passes 1 and 2 are clean): full render at 1080x1920, then audio mix and final QA.
Never run the full render to discover a caption typo.

**C. Re-render only what changed.** For a fix in one beat, render only that frame range with `--frames=START-END` and concatenate with the cached segments (`out/seg_XX.mp4`). Keep segment cache keyed by a hash of the beat's JSON.

**D. GitHub Actions speed.**
- Cache `node_modules`, `~/.cache/puppeteer`/Remotion browser and the `public/` assets with `actions/cache`.
- `--concurrency=2` (the standard runner has 2–4 vCPUs), `--gl=angle`.
- Avoid heavy per-frame cost: no full-screen `filter: blur()` bigger than 24px, no 5+ stacked radial gradients, no `box-shadow` blur > 60px on large layers. Pre-render glows as small PNGs and scale them. Use `<Img>` with pre-sized assets.
- Draft mode flag (`--scale=0.5 --crf=28`) for review loops, full quality only for the final.
- Set `timeout-minutes: 15` and fail fast on the first QA error.

**E. Cache what never changes.** TTS audio and `words.json` are cached per script hash. `research.json` and logos are cached per topic. If only visuals changed, skip TTS and research entirely.

**F. Agent behavior (saves time and tokens).**
- Read `SKILL.md` (max 150 lines) once, then load only the component files needed for the current beat plan.
- After each GitHub run, read ONLY `qa/report.json` (not the whole log). The report lists failing beats and the failing check; fix only those.
- Maximum 3 fix loops. If still failing, print the failing checks and stop instead of looping.
- Print a final summary: duration, LUFS, number of beats, checks passed/failed, output path.

### 9.5 Definition of done
The reel is done only when ALL are true: lint pass clean, still pass clean, full render QA clean, theme plan matches 9.2, no Section 9.3 item violated, loudness numbers printed, and the file is copied to `/storage/emulated/0/Download/`.

---

## 10. VOICE RULE — MALE VOICE ALWAYS (hard requirement, never overridden)

The narrator is ALWAYS a male voice. Not female, not neutral, not "whatever is the default". Earlier outputs failed this (measured median pitch: ~262 Hz and ~267 Hz = female range; ~193 Hz = too high). The latest reel measured ~111 Hz = correct male voice. Keep it that way.

- Write `voice_gender: male` in `config.json` and treat it as locked. No step may change it.
- edge-tts male voices (use these): Hindi/Hinglish script -> `hi-IN-MadhurNeural`; English-heavy script -> `en-IN-PrabhatNeural`. NEVER use Swara, Neerja or any female voice. If a voice name is unknown or unavailable, STOP and print `VOICE BLOCKED: no male voice available`; do not fall back to a different voice.
- ElevenLabs or any other TTS: pick a male voice id and store it in `config.json`; never auto-select.
- Rate +6% to +8%. Do NOT raise pitch. Pitch offset must be 0 Hz or negative.
- Voice QA (add to `qa_frames.py` or a new `qa_voice.py`): extract the voice track, estimate fundamental frequency on voiced frames, and compute the median.
  - PASS only if median F0 is between 80 and 150 Hz.
  - FAIL if median F0 > 150 Hz. Re-run TTS with the male voice, do not just lower pitch artificially.
  - Print: `voice_gender=male, median_f0=XXX Hz, PASS/FAIL`.
- The voice check runs BEFORE the render, on `voiceover.mp3`, so a wrong voice never costs a full render.
- Voice mix: duck the ambient bed 8 dB under speech, keep sentence gaps 0.25–0.35s, leave about 1.0s of tail after the last word, target -16 to -14 LUFS, true peak <= -1.5 dBTP.

---

## 11. REUSE THE VOICE PIPELINE FROM THE OLD "AI REEL STUDIO" (the user liked that voice)

The older project lives at `/storage/emulated/0/Ai Reel Studio/`. Do NOT rebuild voice from scratch. COPY and reuse its working pieces:

- `scripts/smart_voiceover.py` (bilingual phonetic engine + TTS call)
- `scripts/natural_voice.py` (pause compression + caption re-alignment)
- `scripts/master_audio.py` (broadcast mastering)
- `.env` keys `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_VOICE_NAME`. Read them from the old `.env` and copy into this project's `.env`. NEVER print, log or commit API keys. `.env` must be in `.gitignore`.

### 11.1 Voice priority (try in this order; the male gate in 11.4 decides)
1. ElevenLabs voice from `ELEVENLABS_VOICE_ID` in `.env` (the old Studio default). 
2. "Armaan - Raw & Natural Storyteller" (`EiZFMlHIpvPmk5JNyNfh`). Works through the API only on a paid ElevenLabs plan; otherwise the user drops a downloaded file at `public/assets/voiceover.mp3` and the pipeline must use that file as-is (skip TTS, still run alignment, pause compression, mastering and QA).
3. "Liam" (`TX3LPaxmHKxFdv7VOQHJ`) for high-energy hooks.
4. Free fallback: edge-tts `hi-IN-MadhurNeural` (male), rate +8%, pitch offset 0 or negative.
If ElevenLabs fails (quota, network, 401), switch to step 4 automatically and print which voice was used. Never switch to a female voice.

### 11.2 Text handling (keeps captions Roman while the voice sounds natural)
- Keep TWO text tracks: `caption_text` (what appears on screen: Roman Hinglish, English tech terms in English) and `tts_text` (what is sent to TTS: technical English terms converted to Devanagari phonetics by the phonetic engine, e.g. Dopamine, Focus, Sprint, Active Recall, PDF).
- Keep a mapping table `caption_word <-> tts_word` so word timestamps from TTS can be mapped back to caption tokens. Captions follow the SPOKEN timing, not the text order.
- Obtain timing from ElevenLabs `with-timestamps` (character-level) when available; edge-tts gives word boundaries. Save as `words.json`.

### 11.3 Natural delivery and mastering (settings the user already approved)
- Pause compression: any gap longer than 0.35s becomes about 0.15s (micro-breath). After compression, RE-ALIGN every caption token and every beat start to the new timeline, then rebuild `words.json`. Never compress audio without re-aligning captions.
- Mastering chain: 80 Hz high-pass, about +2.5 dB peaking boost at 3.2 kHz, then loudnorm to -14 LUFS with true peak <= -1.5 dBTP. (This replaces the -16 LUFS target stated earlier.)
- Voice stays on top of the music: duck the ambient bed 8 dB while speaking.
- Speaking pace target 150–178 wpm. Do not exceed 180.

### 11.4 Male-voice gate (Section 10 still wins)
Before rendering, run the F0 check on `voiceover.mp3`: median F0 must be 80–150 Hz. If the ElevenLabs voice in `.env` fails the gate, DO NOT render. Print `VOICE GATE FAILED: <voice name> median_f0=<x> Hz` and move to the next voice in 11.1. Print the final chosen voice and F0 in the summary.
At the start of the very first run, generate a 5-second sample with each voice in 11.1 and print each one's median F0 so the user can see which ones pass.

### 11.5 What to reuse vs not
Reuse: voice selection, phonetic engine, pause compression, mastering. Do NOT reuse the old Studio's visuals or its 60fps assumption (this skill renders at 30fps on GitHub Actions per Section 1).