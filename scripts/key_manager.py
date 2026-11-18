#!/usr/bin/env python3
"""
ElevenLabs Multi-Key Rotation & Auto-Failover Manager
- Automatically rotates through multiple API keys when one exhausts its quota (401/429/character limit).
- Persists all keys safely in .env.
- Allows seamless addition of new keys in the future.
"""

import os
import re
import sys
import json
import socket
from pathlib import Path

# Force IPv4 in Termux/Android to avoid IPv6 hanging on Cloudflare/ElevenLabs
try:
    import urllib3.util.connection as urllib3_cn
    urllib3_cn.allowed_gai_family = lambda: socket.AF_INET
except Exception:
    pass

import requests

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

def load_keys():
    """Load all ElevenLabs API keys from .env as a list."""
    keys = []
    if ENV_PATH.exists():
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("ELEVENLABS_API_KEYS="):
                    raw = line.split("=", 1)[1].strip().strip('"').strip("'")
                    for k in raw.split(","):
                        k = k.strip()
                        if k and k not in keys:
                            keys.append(k)
                elif line.startswith("ELEVENLABS_API_KEY="):
                    raw = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if raw and raw not in keys:
                        keys.append(raw)
    
    # Also check os.environ
    env_keys = os.getenv("ELEVENLABS_API_KEYS", "")
    for k in env_keys.split(","):
        k = k.strip()
        if k and k not in keys:
            keys.append(k)
    single_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    if single_key and single_key not in keys:
        keys.append(single_key)

    return keys

def get_voice_id(default="q1R2Hozu3EhS1EtqVHdJ"):
    """Load ELEVENLABS_VOICE_ID from .env or os.environ."""
    if os.getenv("ELEVENLABS_VOICE_ID"):
        return os.getenv("ELEVENLABS_VOICE_ID").strip()
    if ENV_PATH.exists():
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("ELEVENLABS_VOICE_ID="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        return val
    return default

def add_api_key(new_key: str):
    """Save a new API key to the .env pool without duplicates."""
    new_key = new_key.strip()
    if not new_key:
        return
    keys = load_keys()
    if new_key not in keys:
        keys.append(new_key)
    
    # Update .env
    env_lines = []
    if ENV_PATH.exists():
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                if not line.startswith("ELEVENLABS_API_KEYS=") and not line.startswith("ELEVENLABS_API_KEY="):
                    env_lines.append(line.rstrip("\n"))
    
    env_lines.append(f"ELEVENLABS_API_KEYS={','.join(keys)}")
    env_lines.append(f"ELEVENLABS_API_KEY={keys[0]}")

    with open(ENV_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(env_lines) + "\n")
    print(f"✓ Saved new ElevenLabs API key. Total active pool: {len(keys)} keys.")

def check_all_keys():
    """Check health and remaining character quotas of all saved keys."""
    keys = load_keys()
    print(f"\n🔑 ElevenLabs Key Pool Status ({len(keys)} keys registered):")
    print("-" * 65)
    for idx, k in enumerate(keys, 1):
        masked = f"{k[:10]}...{k[-4:]}"
        headers = {"xi-api-key": k}
        try:
            resp = requests.get("https://api.elevenlabs.io/v1/user/subscription", headers=headers, timeout=10)
            if resp.status_code == 200:
                sub = resp.json()
                used = sub.get("character_count", 0)
                limit = sub.get("character_limit", 0)
                rem = limit - used
                status = "ACTIVE" if rem > 100 else "EXHAUSTED"
                print(f"[{idx}] {masked} | Status: {status} | Remaining: {rem:,}/{limit:,} chars ({sub.get('tier')})")
            else:
                # Test if voice generation works anyway
                v_resp = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers, timeout=10)
                if v_resp.status_code == 200:
                    print(f"[{idx}] {masked} | Status: ACTIVE (Scoped TTS key)")
                else:
                    print(f"[{idx}] {masked} | Status: ERROR ({resp.status_code})")
        except Exception as e:
            print(f"[{idx}] {masked} | Status: FAILED TO CONNECT ({e})")
    print("-" * 65 + "\n")

def make_request_with_rotation(url: str, payload: dict, timeout=60):
    """
    Sends request to ElevenLabs with automatic key failover.
    If a key returns 401 or 429 (quota exhausted or rate limited), rotates to the next key.
    """
    keys = load_keys()
    if not keys:
        raise RuntimeError("No ElevenLabs API keys found in pool (.env)!")

    last_error = None
    for idx, k in enumerate(keys, 1):
        masked = f"{k[:10]}...{k[-4:]}"
        headers = {
            "xi-api-key": k,
            "Content-Type": "application/json"
        }
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=timeout)
            if resp.status_code == 200:
                print(f"✓ ElevenLabs request succeeded using Key [{idx}] ({masked})")
                return resp.json()
            elif resp.status_code == 404:
                print(f"⚠️ Voice not found on Key [{idx}] ({masked}) (custom voice only exists on creator account).")
                print(f"  → Automatically checking next key in pool...")
                last_error = resp.text
                continue
            elif resp.status_code in [401, 402, 429] or "quota" in resp.text.lower() or "character_limit" in resp.text.lower():
                print(f"⚠️ Key [{idx}] ({masked}) exhausted/restricted ({resp.status_code}): {resp.text[:80]}...")
                print(f"  → Automatically rotating to next key in pool...")
                last_error = resp.text
                continue
            else:
                print(f"❌ ElevenLabs error on Key [{idx}] ({resp.status_code}): {resp.text[:120]}")
                last_error = resp.text
                continue
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Network error on Key [{idx}]: {e}. Trying next key...")
            last_error = str(e)
            continue

    raise RuntimeError(f"All {len(keys)} ElevenLabs API keys in pool failed or exhausted! Last error: {last_error}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="ElevenLabs Key Pool Manager")
    parser.add_argument("--add", type=str, help="Add a new API key to the pool")
    parser.add_argument("--status", action="store_true", help="Check status of all keys")
    args = parser.parse_args()

    if args.add:
        add_api_key(args.add)
    if args.status or not args.add:
        check_all_keys()
