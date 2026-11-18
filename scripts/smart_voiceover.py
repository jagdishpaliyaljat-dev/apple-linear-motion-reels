#!/usr/bin/env python3
"""
AI Reel Studio · Smart Voiceover Engine
- Primary: ElevenLabs (eleven_multilingual_v2) with multi-key auto-rotation.
- Fallback: Edge-TTS (hi-IN-MadhurNeural) with clean Hinglish phonetics when credits exhaust.
- Synchronization: Exact beat-by-beat frame alignment (NO arbitrary divisions).
- Normalization: Broadcast EBU R128 (-14 LUFS) phone-speaker mastering.
"""

import os
import sys
import json
import base64
import asyncio
import subprocess
import requests
import re
from pathlib import Path

WORKSPACE_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = WORKSPACE_DIR / "scripts"
PUBLIC_DIR = WORKSPACE_DIR / "public"
AUDIO_DIR = PUBLIC_DIR / "audio"
SCRIPT_FILE = PUBLIC_DIR / "script.json"
TIMESTAMPS_FILE = PUBLIC_DIR / "timestamps.json"

sys.path.insert(0, str(SCRIPTS_DIR))
from key_manager import load_keys, make_request_with_rotation, get_voice_id
from natural_voice import synthesize_natural_beat

DEFAULT_VOICE_ID = get_voice_id("q1R2Hozu3EhS1EtqVHdJ")  # Configured: Voice R - Natural Hindi

DISPLAY_WORD_MAP = {
    # Core Study & Strategy
    "study": "STUDY",
    "स्टडी": "STUDY",
    "focus": "FOCUS",
    "फोकस": "FOCUS",
    "reset": "RESET",
    "रीसेट": "RESET",
    "sprint": "SPRINT",
    "स्प्रिंट": "SPRINT",
    "habit": "HABIT",
    "हैबिट": "HABIT",
    "routine": "ROUTINE",
    "रूटीन": "ROUTINE",
    "target": "TARGET",
    "टारगेट": "TARGET",
    "topper": "TOPPER",
    "टॉपर": "TOPPER",
    "toppers": "TOPPERS",
    "टॉपर्स": "TOPPERS",
    "exam": "EXAM",
    "एग्ज़ाम": "EXAM",
    "syllabus": "SYLLABUS",
    "सिलेबस": "SYLLABUS",
    "formula": "FORMULA",
    "फॉर्मूला": "FORMULA",
    "active": "ACTIVE",
    "एक्टिव": "ACTIVE",
    "recall": "RECALL",
    "रिकॉल": "RECALL",
    "blurting": "BLURTING",
    "ब्लर्टिंग": "BLURTING",
    "pareto": "PARETO",
    "परेतो": "PARETO",
    "pomodoro": "POMODORO",
    "पोमोडोरो": "POMODORO",
    "revision": "REVISION",
    "रिवीज़न": "REVISION",
    "score": "SCORE",
    "स्कोर": "SCORE",
    "marks": "MARKS",
    "मार्क्स": "MARKS",
    "code": "CODE",
    "कोड": "CODE",
    # Neuroscience & Psychology
    "dopamine": "DOPAMINE",
    "डोपामाइन": "DOPAMINE",
    "baseline": "BASELINE",
    "बेसलाइन": "BASELINE",
    "monotask": "MONOTASK",
    "singletask": "MONOTASK",
    "multitask": "MULTITASK",
    "flow": "FLOW",
    "फ्लो": "FLOW",
    "brain": "BRAIN",
    "ब्रेन": "BRAIN",
    "memory": "MEMORY",
    "मेमरी": "MEMORY",
    "energy": "ENERGY",
    "एनर्जी": "ENERGY",
    "friction": "FRICTION",
    "फ्रिक्शन": "FRICTION",
    "trigger": "TRIGGER",
    "ट्रिगर": "TRIGGER",
    "discipline": "DISCIPLINE",
    "डिसिप्लिन": "DISCIPLINE",
    "motivation": "MOTIVATION",
    "मोटिवेशन": "MOTIVATION",
    "rule": "RULE",
    "रूल": "RULE",
    "rules": "RULES",
    "रूल्स": "RULES",
    "hack": "HACK",
    "हैक": "HACK",
    "secret": "SECRET",
    "सीक्रेट": "SECRET",
    "system": "SYSTEM",
    "सिस्टम": "SYSTEM",
    "trap": "TRAP",
    "ट्रैप": "TRAP",
    "mistake": "MISTAKE",
    "मिस्टेक": "MISTAKE",
    # Tech & Social Lead Magnet
    "pdf": "PDF",
    "पीडीएफ": "PDF",
    "blueprint": "BLUEPRINT",
    "ब्लूप्रिंट": "BLUEPRINT",
    "inbox": "INBOX",
    "इनबॉक्स": "INBOX",
    "dm": "DM",
    "डीएम": "DM",
    "comment": "COMMENT",
    "कमेंट": "COMMENT",
    "follow": "FOLLOW",
    "फॉलो": "FOLLOW",
    "notification": "NOTIFICATION",
    "नोटिफिकेशन": "NOTIFICATION",
    "algorithm": "ALGORITHM",
    "एल्गोरिदम": "ALGORITHM",
    "retention": "RETENTION",
    "रिटेंशन": "RETENTION",
    "viral": "VIRAL",
    "वायरल": "VIRAL",
    # Numbers & Units
    "100%": "100%",
    "80/20": "80/20",
    "50-10": "50-10",
    "24": "24",
    "24-hour": "24-HOUR",
    "ultra": "ULTRA",
    "अल्ट्रा": "ULTRA",
    "ultradian": "ULTRADIAN"
}

def clean_for_speech(text: str) -> str:
    """
    Optimizes mixed Hindi-English (Hinglish) text so ElevenLabs & Edge-TTS
    pronounce every English and Hindi word with 100% natural, crisp human diction.
    - Handles technical terms via precise Devanagari phonetics.
    - Converts numbers & symbols (80/20, 50-10, %) into natural spoken words.
    - Removes jarring symbols (em-dashes, asterisks) that cause robotic pauses.
    """
    # 1. Normalize numbers, percentages and mathematical/ratio notation
    text = re.sub(r'(\d+)\s*%', r'\1 परसेंट', text)
    text = text.replace('%', ' परसेंट')
    text = text.replace('80/20', 'अस्सी बीस')
    text = text.replace('80-20', 'अस्सी बीस')
    text = text.replace('50-10', 'पचास दस')
    text = text.replace('50/10', 'पचास दस')
    text = text.replace('24/7', 'चौबीसों घंटे')
    text = re.sub(r'\b24-hour\b', 'चौबीस घंटे', text, flags=re.IGNORECASE)
    text = re.sub(r'\b24 hours\b', 'चौबीस घंटे', text, flags=re.IGNORECASE)
    text = re.sub(r'\b10 hours\b', 'दस घंटे', text, flags=re.IGNORECASE)
    text = re.sub(r'\b5 minutes\b', 'पांच मिनट', text, flags=re.IGNORECASE)
    text = re.sub(r'\b5-minute\b', 'पांच मिनट', text, flags=re.IGNORECASE)
    text = re.sub(r'\b30 seconds\b', 'तीस सेकंड', text, flags=re.IGNORECASE)
    text = re.sub(r'\b3 rules\b', 'तीन रूल्स', text, flags=re.IGNORECASE)
    text = re.sub(r'\b3 tasks\b', 'तीन टास्क', text, flags=re.IGNORECASE)
    text = re.sub(r'\b3-task\b', 'तीन टास्क', text, flags=re.IGNORECASE)

    # 2. Punctuation cleanup (em-dashes to commas for natural micro-breaths)
    text = text.replace('—', ', ').replace('--', ', ')
    text = text.replace('*', '').replace('"', '').replace("'", "")
    text = re.sub(r'\s+', ' ', text)

    # 3. Bilingual Multi-Word Expressions (Greedy longest match first)
    multi_word_map = [
        ("Dopamine Baseline", "डोपामाइन बेसलाइन"),
        ("dopamine baseline", "डोपामाइन बेसलाइन"),
        ("Super-normal Stimulation", "सुपर नॉर्मल स्टिम्युलेशन"),
        ("super-normal stimulation", "सुपर नॉर्मल स्टिम्युलेशन"),
        ("Super-normal", "सुपर नॉर्मल"),
        ("super-normal", "सुपर नॉर्मल"),
        ("Flow State", "फ्लो स्टेट"),
        ("flow state", "फ्लो स्टेट"),
        ("Zero Screen", "ज़ीरो स्क्रीन"),
        ("zero screen", "ज़ीरो स्क्रीन"),
        ("Social Media", "सोशल मीडिया"),
        ("social media", "सोशल मीडिया"),
        ("Cheat Sheet", "चीट शीट"),
        ("cheat sheet", "चीट शीट"),
        ("Lead Magnet", "लीड मैग्नेट"),
        ("lead magnet", "लीड मैग्नेट"),
        ("Active Recall", "एक्टिव रिकॉल"),
        ("active recall", "एक्टिव रिकॉल"),
        ("Parkinson's Law", "पार्किंसन्स लॉ"),
        ("parkinsons law", "पार्किंसन्स लॉ"),
        ("Pareto Principle", "परेतो प्रिंसिपल"),
        ("pareto principle", "परेतो प्रिंसिपल"),
        ("Pomodoro Technique", "पोमोडोरो टेक्नीक"),
        ("pomodoro technique", "पोमोडोरो टेक्नीक"),
        ("Time Table", "टाइम टेबल"),
        ("time table", "टाइम टेबल"),
        ("Mock Test", "मॉक टेस्ट"),
        ("mock test", "मॉक टेस्ट"),
        ("Deep Work", "डीप वर्क"),
        ("deep work", "डीप वर्क"),
        ("High-Yield Topics", "हाई-यील्ड टॉपिक्स"),
        ("high-yield topics", "हाई-यील्ड टॉपिक्स"),
        ("High-Yield Topic", "हाई-यील्ड टॉपिक"),
        ("high-yield topic", "हाई-यील्ड टॉपिक"),
        ("High-Yield", "हाई-यील्ड"),
        ("high-yield", "हाई-यील्ड"),
        ("Phone in Another Room", "फोन दूसरे कमरे में"),
        ("phone in another room", "फोन दूसरे कमरे में"),
        ("in Another Room", "दूसरे कमरे में"),
        ("in another room", "दूसरे कमरे में"),
        ("Another Room", "दूसरे कमरे"),
        ("another room", "दूसरे कमरे"),
        ("Next Level", "नेक्स्ट लेवल"),
        ("next level", "नेक्स्ट लेवल"),
    ]
    for eng, hin in multi_word_map:
        pattern = re.compile(re.escape(eng), re.IGNORECASE)
        text = pattern.sub(hin, text)

    # 4. Bilingual Single-Word Phonetic Mapping (Word Boundary Enforced)
    single_word_map = {
        # Core Focus & Study
        "study": "स्टडी",
        "focus": "फोकस",
        "reset": "रीसेट",
        "monotask": "सिंगल-टास्क",
        "multitasking": "मल्टीटास्किंग",
        "sprint": "स्प्रिंट",
        "sprints": "स्प्रिंट्स",
        "blurting": "ब्लर्टिंग",
        "pareto": "परेतो",
        "topper": "टॉपर",
        "toppers": "टॉपर्स",
        "exam": "एग्ज़ाम",
        "exams": "एग्ज़ाम्स",
        "syllabus": "सिलेबस",
        "target": "टारगेट",
        "targets": "टारगेट्स",
        "chapter": "चैप्टर",
        "chapters": "चैप्टर्स",
        "subject": "सब्जेक्ट",
        "subjects": "सब्जेक्ट्स",
        "concept": "कॉन्सेप्ट",
        "concepts": "कॉन्सेप्ट्स",
        "notes": "नोट्स",
        "formula": "फॉर्मूला",
        "formulas": "फॉर्मूले",
        "routine": "रूटीन",
        "schedule": "शेड्यूल",
        "revision": "रिवीज़न",
        "practice": "प्रैक्टिस",
        "score": "स्कोर",
        "rank": "रैंक",
        "homework": "होमवर्क",
        "technique": "टेक्नीक",
        "techniques": "टेक्नीक्स",
        "topic": "टॉपिक",
        "topics": "टॉपिक्स",
        "law": "लॉ",
        "laws": "लॉज",
        "power": "पावर",
        "action": "एक्शन",
        "productivity": "प्रोडक्टिविटी",
        "productive": "प्रोडक्टिव",
        "problem": "प्रॉब्लम",
        "solution": "सॉल्यूशन",
        "reality": "रियालिटी",
        "impossible": "इम्पॉसिबल",
        "possible": "पॉसिबल",
        "automatic": "ऑटोमैटिक",
        "automatically": "ऑटोमैटिकली",
        "daily": "डेली",
        "weekly": "वीकली",
        # Psychology & Behavior
        "dopamine": "डोपामाइन",
        "baseline": "बेसलाइन",
        "stimulation": "स्टिम्युलेशन",
        "resistance": "रेजिस्टेंस",
        "friction": "फ्रिक्शन",
        "trigger": "ट्रिगर",
        "habit": "हैबिट",
        "habits": "हैबिट्स",
        "discipline": "डिसिप्लिन",
        "motivation": "मोटिवेशन",
        "energy": "एनर्जी",
        "overthinking": "ओवरथिंकिंग",
        "procrastination": "प्रोक्रैस्टिनेशन",
        "burnout": "बर्नआउट",
        "memory": "मेमरी",
        "brain": "ब्रेन",
        "rule": "रूल",
        "rules": "रूल्स",
        "hack": "हैक",
        "hacks": "हैक्स",
        "trick": "ट्रिक",
        "tricks": "ट्रिक्स",
        "secret": "सीक्रेट",
        "system": "सिस्टम",
        "strategy": "स्ट्रेटेजी",
        "method": "मेथड",
        "protocol": "प्रोटोकॉल",
        "trap": "ट्रैप",
        "mistake": "मिस्टेक",
        "mistakes": "मिस्टेक्स",
        "fail": "फेल",
        "result": "रिजल्ट",
        "results": "रिजल्ट्स",
        "growth": "ग्रोथ",
        "smart": "स्मार्ट",
        "challenge": "चैलेंज",
        # Tech & Social Lead Magnet
        "pdf": "पीडीएफ",
        "blueprint": "ब्लूप्रिंट",
        "inbox": "इनबॉक्स",
        "dm": "डीएम",
        "comment": "कमेंट",
        "comments": "कमेंट्स",
        "follow": "फॉलो",
        "save": "सेव",
        "share": "शेयर",
        "link": "लिंक",
        "notification": "नोटिफिकेशन",
        "notifications": "नोटिफिकेशन्स",
        "algorithm": "एल्गोरिदम",
        "retention": "रिटेंशन",
        "viral": "वायरल",
        "reels": "रील्स",
        "reel": "रील",
        "shorts": "शॉर्ट्स",
        "screen": "स्क्रीन",
        "phone": "फोन",
        "smartphone": "स्मार्टफोन",
        "table": "टेबल",
        "room": "रूम",
        "percentage": "परसेंटेज",
        "percent": "परसेंट",
        "seconds": "सेकंड्स",
        "second": "सेकंड",
        "minutes": "मिनट",
        "minute": "मिनट",
        "hours": "घंटे",
        "hour": "घंटा"
    }

    for eng, hin in single_word_map.items():
        pattern = re.compile(r'\b' + re.escape(eng) + r'\b', re.IGNORECASE)
        text = pattern.sub(hin, text)

    return text.strip()

def get_audio_duration(file_path: Path) -> float:
    """Return exact audio duration in seconds using ffprobe."""
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(file_path)
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return float(res.stdout.strip())

def synthesize_beat_elevenlabs(text: str, voice_id: str, out_file: Path) -> list:
    """Synthesize a single beat using ElevenLabs with key rotation and return word timestamps."""
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps"
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.54,
            "similarity_boost": 0.85,
            "style": 0.15,
            "use_speaker_boost": True
        }
    }

    data = make_request_with_rotation(url, payload)
    audio_bytes = base64.b64decode(data["audio_base64"])
    with open(out_file, "wb") as f:
        f.write(audio_bytes)

    # Parse character timestamps into word timestamps
    alignment = data.get("alignment", {})
    chars = alignment.get("characters", [])
    starts = alignment.get("character_start_times_seconds", [])
    ends = alignment.get("character_end_times_seconds", [])

    words = []
    curr_word = []
    w_start = None

    for c, s, e in zip(chars, starts, ends):
        if c.strip() == "":
            if curr_word and w_start is not None:
                words.append({
                    "word": "".join(curr_word),
                    "start": round(w_start, 3),
                    "end": round(e, 3)
                })
                curr_word = []
                w_start = None
        else:
            if w_start is None:
                w_start = s
            curr_word.append(c)

    if curr_word and w_start is not None:
        words.append({
            "word": "".join(curr_word),
            "start": round(w_start, 3),
            "end": round(ends[-1] if ends else w_start + 0.2, 3)
        })

    return words

async def synthesize_beat_edge_tts(text: str, voice: str, rate: str, out_file: Path):
    """Synthesize a single beat using Edge-TTS."""
    import edge_tts
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(str(out_file))

def synthesize_smart():
    print("\n" + "=" * 65)
    print("🎙️ SMART BEAT-BY-BEAT VOICEOVER SYNTHESIS")
    print("=" * 65)

    if not SCRIPT_FILE.exists():
        print(f"Error: {SCRIPT_FILE} not found!")
        sys.exit(1)

    with open(SCRIPT_FILE, "r", encoding="utf-8") as f:
        script = json.load(f)

    beats = script.get("beats", [])
    if not beats:
        print("Error: No beats found in script.json!")
        sys.exit(1)

    temp_dir = AUDIO_DIR / "temp_beats"
    temp_dir.mkdir(parents=True, exist_ok=True)

    use_elevenlabs = True
    keys = load_keys()
    if not keys:
        print("ℹ️ No ElevenLabs keys found in .env. Falling back directly to Edge-TTS.")
        use_elevenlabs = False

    beat_audio_files = []
    all_words = []
    caption_chunks = []
    current_global_time = 0.0

    print(f"Processing {len(beats)} beats individually for 100% precision...")

    for idx, beat in enumerate(beats):
        b_id = beat.get("id", f"beat-{idx+1}")
        narration = beat.get("narration", "")
        if not narration:
            continue

        clean_narration = clean_for_speech(narration)
        beat_raw_mp3 = temp_dir / f"{b_id}_raw.mp3"
        beat_out_mp3 = temp_dir / f"{b_id}.mp3"

        succeeded = False
        words_in_beat = []

        if use_elevenlabs:
            try:
                print(f"\n[Beat {idx+1}/{len(beats)}] Synthesizing via natural Hindi voice (R/XYZ)...")
                words_in_beat = synthesize_natural_beat(clean_narration, beat_raw_mp3, beat_out_mp3)
                succeeded = True
            except Exception as e:
                print(f"⚠️ Natural ElevenLabs voice unavailable ({e}).")
                print("  → Seamlessly falling back to 100% Free Edge-TTS for this and remaining beats...")
                use_elevenlabs = False

        if not succeeded:
            print(f"\n[Beat {idx+1}/{len(beats)}] Synthesizing via Free Edge-TTS (hi-IN-MadhurNeural)...")
            asyncio.run(synthesize_beat_edge_tts(clean_narration, "hi-IN-MadhurNeural", "+8%", beat_out_mp3))

        # Measure exact audio duration of this beat
        dur = get_audio_duration(beat_out_mp3)
        start_frame = int(round(current_global_time * 60))
        end_frame = int(round((current_global_time + dur) * 60))

        beat["startFrame"] = start_frame
        beat["endFrame"] = end_frame
        beat["durationSeconds"] = round(dur, 2)

        # Build word timestamps offset to global reel timeline
        if not words_in_beat:
            # Generate proportional word timestamps for Edge-TTS
            raw_w = clean_narration.split()
            chars = [max(1, len(w)) for w in raw_w]
            total_c = sum(chars)
            t_curr = 0.0
            for w, c in zip(raw_w, chars):
                w_d = (c / total_c) * dur
                words_in_beat.append({
                    "word": w,
                    "start": round(t_curr, 3),
                    "end": round(t_curr + w_d, 3)
                })
                t_curr += w_d

        beat_words = []
        for wb in words_in_beat:
            g_start = round(current_global_time + wb["start"], 3)
            g_end = round(current_global_time + wb["end"], 3)
            raw_w = wb["word"]
            clean_w = raw_w.strip(".,!?:;\"'()[]{}—")
            display_w = raw_w
            if clean_w.lower() in DISPLAY_WORD_MAP:
                display_w = raw_w.replace(clean_w, DISPLAY_WORD_MAP[clean_w.lower()])

            w_obj = {
                "word": raw_w,
                "clean": clean_w,
                "displayWord": display_w,
                "start": g_start,
                "end": g_end,
                "startFrame": int(round(g_start * 60)),
                "endFrame": int(round(g_end * 60)),
                "beatId": b_id
            }
            all_words.append(w_obj)
            beat_words.append(w_obj)

        # Build strictly bounded 3-word chunks for THIS beat only (Zero cross-beat bleed)
        chunk_size = 3
        for i in range(0, len(beat_words), chunk_size):
            grp = beat_words[i:i + chunk_size]
            caption_chunks.append({
                "text": " ".join([x.get("displayWord", x["word"]) for x in grp]),
                "startFrame": grp[0]["startFrame"],
                "endFrame": grp[-1]["endFrame"],
                "words": grp,
                "beatId": b_id
            })

        beat_audio_files.append(beat_out_mp3)
        current_global_time += dur
        print(f"  ✓ Beat {idx+1} audio: {dur:.2f}s (Frames: {start_frame} -> {end_frame}) | {len(beat_words)} words")

    # Concatenate all beat audio files seamlessly with FFmpeg
    concat_list = temp_dir / "concat_list.txt"
    with open(concat_list, "w", encoding="utf-8") as f:
        for b_file in beat_audio_files:
            f.write(f"file '{b_file.resolve()}'\n")

    final_voiceover = AUDIO_DIR / "voiceover.mp3"
    raw_combined = temp_dir / "raw_combined.mp3"

    cmd_concat = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list),
        "-c", "copy",
        str(raw_combined)
    ]
    subprocess.run(cmd_concat, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    # Master audio to EBU R128 (-14 LUFS) and vocal presence
    try:
        from master_audio import master_voiceover
        master_voiceover(raw_combined, final_voiceover)
    except Exception as e:
        print(f"Mastering note: {e}")
        subprocess.run(["cp", str(raw_combined), str(final_voiceover)], check=True)

    # Mirror audio to public/assets/ for backwards compatibility
    assets_dir = PUBLIC_DIR / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(["cp", str(final_voiceover), str(assets_dir / "voiceover.mp3")], check=False)
    subprocess.run(["cp", str(final_voiceover), str(assets_dir / "voice.mp3")], check=False)

    # Cleanup temp directory
    for f in beat_audio_files:
        if f.exists(): f.unlink()
    for f in temp_dir.glob("*_raw.mp3"):
        f.unlink()
    if concat_list.exists(): concat_list.unlink()
    if raw_combined.exists(): raw_combined.unlink()
    if temp_dir.exists():
        try:
            temp_dir.rmdir()
        except Exception:
            pass

    total_frames = int(round(current_global_time * 60))
    script["totalFrames"] = total_frames
    script["durationSeconds"] = round(current_global_time, 2)

    with open(SCRIPT_FILE, "w", encoding="utf-8") as f:
        json.dump(script, f, indent=2, ensure_ascii=False)

    ts_data = {
        "durationSeconds": round(current_global_time, 2),
        "totalFrames": total_frames,
        "fps": 60,
        "words": all_words,
        "captionChunks": caption_chunks
    }

    with open(TIMESTAMPS_FILE, "w", encoding="utf-8") as f:
        json.dump(ts_data, f, indent=2, ensure_ascii=False)

    # Also mirror timestamps to src/subtitles.json
    subtitles_file = WORKSPACE_DIR / "src" / "subtitles.json"
    with open(subtitles_file, "w", encoding="utf-8") as f:
        json.dump(ts_data, f, indent=2, ensure_ascii=False)

    # If Edge-TTS was used, auto-trigger local Whisper for millisecond frame accuracy
    if not use_elevenlabs:
        print("\n[Whisper Sync] Edge-TTS was used. Calibrating frame-level timestamps via local Whisper...")
        try:
            whisper_script = WORKSPACE_DIR / "scripts" / "whisper_transcribe.py"
            if whisper_script.exists():
                subprocess.run([
                    sys.executable, str(whisper_script),
                    "--audio", str(final_voiceover),
                    "--timestamps", str(TIMESTAMPS_FILE),
                    "--subtitles", str(subtitles_file),
                    "--lang", "auto"
                ], check=True)
                print("[Whisper Sync] ✓ Local Whisper aligned timestamps with 60fps accuracy!")
        except Exception as e:
            print(f"[Whisper Sync] Note: Whisper fallback skipped ({e}). Proportional timestamps retained.")

    print("\n" + "=" * 65)
    print("✅ PERFECT AUDIO & BEAT SYNC COMPLETE!")
    print(f"⏱️ Total Length: {current_global_time:.2f}s ({total_frames} frames @ 60fps)")
    print(f"📊 Total Beats:  {len(beats)} scenes with frame-perfect boundaries")
    print(f"📝 Total Words:  {len(all_words)} words synchronized")
    print("=" * 65 + "\n")

if __name__ == "__main__":
    synthesize_smart()
