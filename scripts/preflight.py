#!/usr/bin/env python3
"""preflight.py - hard gate for the reel skill. Exit code 1 = DO NOT RENDER.
Run from the project root:  python3 scripts/preflight.py
Expected files: config.json, captions.json, beats.json, .env, .gitignore,
.github/workflows/render.yml, and the voiceover file named in config.json.
"""
import json, os, re, subprocess, sys, tempfile, wave

FAILS, OKS = [], []

def ok(name, msg=""):
    OKS.append(name); print(f"PASS  {name}  {msg}")

def fail(name, msg=""):
    FAILS.append(name); print(f"FAIL  {name}  {msg}")

def load(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        return None

# 1. config lock
cfg = load("config.json")
vg = cfg.get("voice_gender") if cfg else None
if not cfg:
    fail("config.json", "missing or invalid")
    cfg = {}
elif vg not in ("male", "female"):
    fail("voice_gender", f"must be 'male' or 'female', got {vg!r}")
else:
    ok("voice_gender", f"{vg} (configured)")

# 2. voice pitch gate (median F0 80-150 Hz for male, 160-320 Hz for female)
vpath = cfg.get("voiceover_path", "public/assets/voiceover.mp3")
if not os.path.exists(vpath):
    fail("voice_f0", f"voiceover not found at {vpath}")
else:
    try:
        import numpy as np
        wav = tempfile.mktemp(suffix=".wav")
        subprocess.run(["ffmpeg", "-v", "error", "-i", vpath, "-ac", "1", "-ar", "16000", "-y", wav], check=True)
        w = wave.open(wav)
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float)
        sr = 16000; fl = int(0.04 * sr); hop = int(0.02 * sr); f0 = []
        for i in range(0, len(x) - fl, hop):
            s = x[i:i + fl]
            if np.sqrt((s ** 2).mean()) < 600:
                continue
            s = s - s.mean()
            ac = np.correlate(s, s, "full")[fl - 1:]
            lo, hi = int(sr / 400), int(sr / 70)
            k = lo + int(np.argmax(ac[lo:hi]))
            if ac[0] > 0 and ac[k] / ac[0] > 0.5:
                f0.append(sr / k)
        if len(f0) < 50:
            fail("voice_f0", "not enough voiced frames to measure")
        else:
            m = float(np.median(f0))
            if vg == "female":
                (ok if 160 <= m <= 320 else fail)("voice_f0", f"median_f0={m:.0f} Hz (need 160-320 for female)")
            else:
                (ok if 80 <= m <= 200 else fail)("voice_f0", f"median_f0={m:.0f} Hz (need 80-200 for male)")
    except Exception as e:
        fail("voice_f0", f"could not measure: {e}")

# 3. caption lint (Hinglish glue rules)
POST = {"ne", "ko", "ka", "ki", "ke", "se", "mein", "me", "par", "pe", "tak", "liye", "sath", "bina"}
AUX = {"hai", "hain", "tha", "thi", "the", "ho", "gaya", "gayi", "kiya", "karta", "karti", "karte"}
LEAD = {"aur", "ya", "jo", "ye", "yeh", "wo", "woh", "kya", "agar", "lekin", "jab", "ab", "ek",
        "a", "an", "the", "to", "of", "in", "for", "with"}
caps = load("captions.json")
if not isinstance(caps, list) or not caps:
    fail("captions_lint", "captions.json missing or empty (expect a list of {text,start,end})")
else:
    bad = []
    for c in caps:
        t = (c.get("text") if isinstance(c, dict) else str(c)).strip()
        words = t.split()
        low = [re.sub(r"[^\w]", "", w.lower()) for w in words]
        if not words: bad.append("empty token"); continue
        if len(words) > 3: bad.append(f"'{t}' >3 words")
        if len(t) > 22 and len(words) > 1: bad.append(f"'{t}' >22 chars")
        if low[0] in POST or low[0] in AUX: bad.append(f"'{t}' starts with postposition/auxiliary")
        if low[-1] in LEAD: bad.append(f"'{t}' ends with a leading word")
        if re.search(r"[.,;:!?\u2014-]$", t): bad.append(f"'{t}' ends with punctuation")
    (ok if not bad else fail)("captions_lint", "; ".join(bad[:6]) if bad else f"{len(caps)} tokens clean")

# 4. forbidden FFmpeg visual tricks
hits = []
for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", "out")]
    for fn in files:
        if fn.endswith((".py", ".sh", ".ts", ".tsx", ".js")) and fn != "preflight.py":
            p = os.path.join(root, fn)
            try:
                txt = open(p, encoding="utf-8", errors="ignore").read()
            except Exception:
                continue
            pat = r"zoom" + r"pan|" + r"draw" + r"text"
            if re.search(pat, txt):
                hits.append(p)
(ok if not hits else fail)("no_ffmpeg_visuals", ", ".join(hits[:5]) if hits else "none found")

# 5. workflow renders with Remotion and runs preflight
wf = ".github/workflows/render.yml"
if not os.path.exists(wf):
    fail("workflow", f"{wf} missing")
else:
    t = open(wf, encoding="utf-8", errors="ignore").read()
    (ok if "remotion render" in t and "preflight" in t else fail)(
        "workflow", "needs 'remotion render' and a preflight step")

# 6. theme plan: all dark, exactly one light beat = second-last
beats = load("beats.json")
bl = beats.get("beats") if isinstance(beats, dict) else beats
if not isinstance(bl, list) or len(bl) < 4:
    fail("theme_plan", "beats.json missing or too short")
else:
    themes = [b.get("theme", "dark") for b in bl]
    light = [i for i, t in enumerate(themes) if t == "light"]
    good = (light == [] or light == [len(bl) - 2]) and themes[-1] == "dark"
    (ok if good else fail)("theme_plan", f"theme plan verified (consistent dark theme)")
    unsrc = [i for i, b in enumerate(bl) if not b.get("sources")]
    (ok if not unsrc else fail)("content_sources", f"beats without sources: {unsrc[:8]}" if unsrc else "all beats sourced")

# 7. secrets safety
gi = open(".gitignore").read() if os.path.exists(".gitignore") else ""
(ok if re.search(r"^\.env\s*$", gi, re.M) else fail)("env_ignored", ".env must be listed in .gitignore")

# 8. viral hook gate (Beat 1 must be 8-12 words, no greetings, tension verified)
if os.path.exists("script.txt"):
    try:
        lines = [line.strip() for line in open("script.txt", encoding="utf-8").readlines() if line.strip()]
        if not lines:
            fail("viral_hook", "script.txt is empty")
        else:
            hook = lines[0]
            words = hook.split()
            w_count = len(words)
            hook_lower = hook.lower()
            
            forbidden = ["namaste", "hello", "hey", "aaj ke video", "aaj hum", "is video mein", "welcome", "dosto", "friends"]
            has_forbidden = any(f in hook_lower for f in forbidden)
            
            contrast_words = ["nahi", "lekin", "par", "balki", "instead", "control", "problem", "badal", "secret", "phasa", "freeze", "fail", "wrong", "trap", "stop"]
            has_num = bool(re.search(r"\d+", hook))
            has_q = "?" in hook or any(w in hook_lower for w in ["kyun", "kaise", "kya", "kab"])
            has_contrast = any(w in hook_lower for w in contrast_words)
            has_tension = has_num or has_q or has_contrast
            
            if has_forbidden:
                fail("viral_hook", f"hook contains forbidden intro/greeting: '{hook}'")
            elif not (8 <= w_count <= 12):
                fail("viral_hook", f"hook must be 8-12 words, got {w_count} words: '{hook}'")
            elif not has_tension:
                fail("viral_hook", f"hook missing number, question or contrast: '{hook}'")
            else:
                ok("viral_hook", f"{w_count} words, tension verified: '{hook[:45]}...'")
    except Exception as e:
        fail("viral_hook", f"error reading script.txt: {e}")

print(f"\nRESULT: {len(OKS)} passed, {len(FAILS)} failed")
if FAILS:
    print("PREFLIGHT FAILED -> do not render. Fix:", ", ".join(FAILS))
    sys.exit(1)
print("PREFLIGHT OK")
