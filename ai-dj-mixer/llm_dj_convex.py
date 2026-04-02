#!/usr/bin/env python3
"""
LLM-Powered AI DJ - Convex Version
Fetches secrets from Convex instead of .env files.
"""

import os
import json
import random
import subprocess
import base64
import requests
from datetime import datetime
from pathlib import Path

# Try to import Convex client, fall back to env vars
USE_CONVEX = os.getenv("USE_CONVEX", "false").lower() == "true"
CONVEX_SITE_URL = os.getenv("CONVEX_SITE_URL", "")

_config_cache = None

def get_config():
    """Get configuration from Convex or environment variables."""
    global _config_cache

    if _config_cache:
        return _config_cache

    if USE_CONVEX and CONVEX_SITE_URL:
        print("📡 Fetching secrets from Convex...")
        try:
            from convex_client import get_secrets
            secrets = get_secrets()
            _config_cache = {
                'PERPLEXITY_API_KEY': secrets['perplexity']['apiKey'],
                'ELEVENLABS_API_KEY': secrets['elevenLabs']['apiKey'],
                'ELEVENLABS_VOICE_ID': secrets['elevenLabs']['voiceId'],
                'AZURACAST_BASE_URL': secrets['azuraCast']['apiUrl'],
                'AZURACAST_API_KEY': secrets['azuraCast']['apiKey'],
                'AZURACAST_STATION_ID': secrets['azuraCast']['stationId'],
                'OPENWEATHER_API_KEY': secrets['openWeather']['apiKey'],
                'CITY': secrets['openWeather']['city'].split(',')[0],
                'DISCORD_WEBHOOK_URL': secrets['discord']['webhookUrl'],
            }
            print("✅ Secrets loaded from Convex")
            return _config_cache
        except Exception as e:
            print(f"⚠️ Convex error, falling back to env: {e}")

    # Fall back to environment variables
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / '.env')

    _config_cache = {
        'PERPLEXITY_API_KEY': os.getenv('PERPLEXITY_API_KEY'),
        'GEMINI_API_KEY': os.getenv('GEMINI_API_KEY'),
        'GEMINI_VOICE': os.getenv('GEMINI_VOICE', 'Aoede'),
        'ELEVENLABS_API_KEY': os.getenv('ELEVENLABS_API_KEY'),
        'ELEVENLABS_VOICE_ID': os.getenv('ELEVENLABS_VOICE_ID'),
        'AZURACAST_BASE_URL': os.getenv('AZURACAST_BASE_URL'),
        'AZURACAST_API_KEY': os.getenv('AZURACAST_API_KEY'),
        'AZURACAST_STATION_ID': os.getenv('AZURACAST_STATION_ID'),
        'OPENWEATHER_API_KEY': os.getenv('OPENWEATHER_API_KEY'),
        'CITY': os.getenv('OPENWEATHER_CITY', 'London').split(',')[0],
        'DISCORD_WEBHOOK_URL': os.getenv('DISCORD_WEBHOOK_URL'),
    }
    return _config_cache


STATION_NAME = "Urban All-in-1 Radio"
OUTPUT_DIR = Path(__file__).parent.parent / 'output' / 'voice'


def get_icecast_metadata():
    """Get current song from Icecast/Liquidsoap stream."""
    try:
        url = "https://stream.urbanallin1radio.co.uk/status-json.xsl"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Icecast returns title as "Artist - Title"
        source = data.get('icestats', {}).get('source', {})
        full_title = source.get('title', 'Unknown - Unknown')
        listeners = source.get('listeners', 0)

        # Split "Artist - Title" format
        if ' - ' in full_title:
            parts = full_title.split(' - ', 1)
            artist = parts[0].strip()
            title = parts[1].strip()
        else:
            artist = 'Unknown'
            title = full_title

        return {
            'current_artist': artist,
            'current_title': title,
            'next_artist': None,  # Icecast doesn't have next track info
            'next_title': None,
            'listeners': listeners
        }
    except Exception as e:
        print(f"Error getting Icecast metadata: {e}")
        return None


def get_weather():
    """Get current weather."""
    config = get_config()
    api_key = config.get('OPENWEATHER_API_KEY')
    city = config.get('CITY', 'London')

    if not api_key:
        return None

    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        return {
            'temp': round(data['main']['temp']),
            'description': data['weather'][0]['description'],
            'city': city
        }
    except Exception as e:
        print(f"Weather API error: {e}")
        return None


def get_music_news():
    """Get latest music news using OpenAI."""
    api_key = os.getenv('OPENAI_API_KEY')

    if not api_key:
        return None

    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a music news reporter. Give only a short headline, no intro or explanation."
                },
                {
                    "role": "user",
                    "content": "Give me ONE short UK urban music news headline about any of these artists (pick a DIFFERENT one each time, not always the same): Central Cee, Dave, Skepta, Rema, Burna Boy, Little Simz, Jorja Smith, Headie One, Aitch, Stormzy, Wizkid, Knucks, Tion Wayne, M Huncho. Just the headline, under 15 words."
                }
            ],
            "max_tokens": 50,
            "temperature": 0.9
        }

        response = requests.post(url, json=data, headers=headers, timeout=15)
        response.raise_for_status()
        result = response.json()

        return result['choices'][0]['message']['content'].strip().strip('"\'')
    except Exception as e:
        print(f"OpenAI news error: {e}")
        return None


def generate_dj_script(context_type='auto', talk_over_intro=False):
    """Use OpenAI to generate a DJ announcement."""
    api_key = os.getenv('OPENAI_API_KEY')

    if not api_key:
        raise ValueError("OPENAI_API_KEY not configured")

    # Gather context
    metadata = get_icecast_metadata()
    weather = get_weather()
    news = get_music_news() if context_type in ['auto', 'news'] else None

    # Current time info
    now = datetime.now()
    hour = now.hour
    time_str = now.strftime('%I:%M %p').lstrip('0')
    day_part = "morning" if hour < 12 else "afternoon" if hour < 18 else "evening"

    # Build context for LLM
    context_parts = [f"Current time: {time_str} ({day_part})"]

    if metadata:
        context_parts.append(f"Currently playing: {metadata['current_artist']} - {metadata['current_title']}")
        if metadata.get('next_artist') and metadata.get('next_title'):
            context_parts.append(f"Up next: {metadata['next_artist']} - {metadata['next_title']}")
        context_parts.append(f"Listeners: {metadata['listeners']}")

    if weather:
        context_parts.append(f"Weather: {weather['temp']}°C, {weather['description']} in {weather['city']}")

    if news:
        context_parts.append(f"Music news: {news}")

    context = "\n".join(context_parts)

    # Decide what type of announcement
    if context_type == 'auto':
        options = ['now_playing', 'now_playing', 'time_check', 'station_id']
        if weather:
            options.append('weather')
        if news:
            options.append('news')
        context_type = random.choice(options)

    # Create prompt based on type
    prompts = {
        'next_song': f"Introduce the next song coming up. Mention the artist and song title naturally. Maybe add a quick fact or hype.",
        'now_playing': f"Introduce the song that's playing right now. Mention the artist and title naturally. Maybe add a quick fact or hype.",
        'time_check': f"Give a quick time check. It's {time_str}. Keep it brief and natural.",
        'station_id': f"Do a quick station ID for {STATION_NAME}. Make it memorable but not cheesy.",
        'weather': f"Give a quick weather update. It's {weather['temp'] if weather else 'nice'}°C. Tie it into the music vibe.",
        'news': f"Share this music news briefly: {news}. React to it naturally."
    }

    # Adjust length based on intro
    if talk_over_intro:
        length_instruction = "Keep it under 25 words max. You have a short intro to talk over."
    else:
        length_instruction = "Keep it VERY SHORT - maximum 15 words. The vocals start immediately so be brief."

    print(f"🤖 Asking OpenAI for {context_type} announcement...")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": f"You are an AI DJ host for Urban All-in-1 Radio, a UK urban music station. Your personality: Cool, confident, authentic UK urban vibe. Use natural UK slang sparingly (safe, sick, big tune, mad, vibes). Be CONCISE - say your piece and stop. NEVER repeat yourself or pad sentences. Each announcement must be UNIQUE and DIFFERENT from any previous one. NEVER mention the same artist twice in a row. You ONLY output the DJ script - no quotes, no emojis, no hashtags, no labels."
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nTask: {prompts.get(context_type, prompts['station_id'])}\n\n{length_instruction}"
            }
        ],
        "max_tokens": 60,
        "temperature": 0.9
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=data,
        timeout=30
    )
    response.raise_for_status()
    result = response.json()

    script = result['choices'][0]['message']['content'].strip().strip('"\'')
    print(f"📝 Generated: {script}")
    return script, context_type


def generate_voice_gemini(text, output_path):
    """Generate voice using Google Gemini 2.5 Flash TTS (FREE tier)."""
    # Read directly from env (Convex doesn't store Gemini keys)
    api_key = os.getenv('GEMINI_API_KEY')
    voice_name = os.getenv('GEMINI_VOICE', 'Kore')

    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured")

    print(f"🎤 Generating voice with Gemini TTS (voice: {voice_name})...")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={api_key}"

    # Wrap text as a clear transcript instruction so Gemini doesn't try to generate its own text
    tts_prompt = f"Please read the following transcript aloud exactly as written, with natural speech intonation:\n\n{text}"

    payload = {
        "contents": [{
            "parts": [{"text": tts_prompt}]
        }],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": voice_name
                    }
                }
            }
        }
    }

    response = requests.post(url, json=payload, timeout=60)
    response.raise_for_status()
    result = response.json()

    # Extract base64 audio from response
    candidates = result.get('candidates', [])
    if not candidates:
        raise ValueError("No candidates in Gemini TTS response")

    parts = candidates[0].get('content', {}).get('parts', [])
    audio_part = None
    for part in parts:
        if 'inlineData' in part:
            audio_part = part['inlineData']
            break

    if not audio_part:
        raise ValueError("No audio data in Gemini TTS response")

    # Decode base64 PCM16 audio (24kHz, mono, s16le)
    audio_bytes = base64.b64decode(audio_part['data'])
    print(f"📦 Received {len(audio_bytes)} bytes of PCM16 audio")

    # Write raw PCM to temp file, then convert to MP3 with ffmpeg
    pcm_path = "/tmp/gemini_voice_raw.pcm"
    with open(pcm_path, 'wb') as f:
        f.write(audio_bytes)

    # Convert PCM16 (24kHz, mono, s16le) to MP3
    subprocess.run([
        'ffmpeg', '-y',
        '-f', 's16le',        # raw PCM format
        '-ar', '24000',       # 24kHz sample rate (Gemini default)
        '-ac', '1',           # mono
        '-i', pcm_path,
        '-ar', '44100',       # resample to 44.1kHz for broadcast
        '-ac', '2',           # stereo
        '-b:a', '192k',       # 192kbps MP3
        str(output_path),
        '-loglevel', 'quiet'
    ], check=True)

    # Clean up temp PCM
    os.remove(pcm_path)

    print(f"✅ Voice saved: {output_path}")
    return output_path


def generate_voice_elevenlabs(text, output_path):
    """Generate voice using ElevenLabs (premium fallback)."""
    config = get_config()
    api_key = config.get('ELEVENLABS_API_KEY')
    voice_id = config.get('ELEVENLABS_VOICE_ID')

    if not api_key or not voice_id:
        raise ValueError("ElevenLabs API key or voice ID not configured")

    print(f"🎤 Generating voice with ElevenLabs...")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }
    data = {
        "text": text,
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.5,
            "use_speaker_boost": True
        }
    }

    response = requests.post(url, json=data, headers=headers, timeout=30)
    response.raise_for_status()

    with open(output_path, 'wb') as f:
        f.write(response.content)

    print(f"✅ Voice saved: {output_path}")
    return output_path


def generate_voice(text, output_path):
    """Generate voice - uses Gemini TTS (free) by default, falls back to ElevenLabs."""
    config = get_config()
    tts_engine = os.getenv('TTS_ENGINE', 'gemini').lower()

    if tts_engine == 'elevenlabs':
        return generate_voice_elevenlabs(text, output_path)

    # Default: try Gemini first, fall back to ElevenLabs
    try:
        return generate_voice_gemini(text, output_path)
    except Exception as e:
        print(f"⚠️ Gemini TTS failed: {e}")
        if config.get('ELEVENLABS_API_KEY'):
            print("🔄 Falling back to ElevenLabs...")
            return generate_voice_elevenlabs(text, output_path)
        raise


def trigger_liquidsoap(voice_path):
    """Send voice to Liquidsoap mixer for live playback with ducking."""
    import socket
    try:
        wav_path = "/tmp/voice-to-play.wav"
        subprocess.run([
            'ffmpeg', '-y', '-i', str(voice_path),
            '-ar', '44100', '-ac', '2',
            wav_path, '-loglevel', 'quiet'
        ], check=True)

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect(("127.0.0.1", 1234))
        sock.send(f"request_queue.push {wav_path}\n".encode())
        response = sock.recv(1024).decode()
        sock.close()

        print(f"📡 Liquidsoap response: {response.strip()}")
        if "END" in response:
            print("🔊 Playing on air with ducking!")
            return True
        return False

    except ConnectionRefusedError:
        print("⚠️  Liquidsoap not running")
        return False
    except Exception as e:
        print(f"⚠️  Liquidsoap error: {e}")
        return False


def log_to_convex(announcement_type, script, played):
    """Log announcement to Convex (optional)."""
    if USE_CONVEX and CONVEX_SITE_URL:
        try:
            from convex_client import log_announcement
            log_announcement(announcement_type, script, played=played)
            print("📊 Logged to Convex")
        except Exception as e:
            print(f"⚠️ Failed to log to Convex: {e}")


def run_ai_dj(announcement_type='auto', talk_over_intro=False):
    """Main function to run the AI DJ."""
    print("\n" + "="*50)
    print("🎙️  AI DJ STARTING")
    if USE_CONVEX:
        print("☁️  Using Convex for secrets")
    if talk_over_intro:
        print("🎤  INTRO MODE - Can talk over beginning of next track!")
    print("="*50 + "\n")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Generate script with LLM
    script, actual_type = generate_dj_script(announcement_type, talk_over_intro=talk_over_intro)

    # Generate voice
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    voice_path = OUTPUT_DIR / f'llm_dj_{actual_type}_{timestamp}.mp3'
    generate_voice(script, voice_path)

    # Play through Liquidsoap (ducks music and plays voice over it)
    played = trigger_liquidsoap(voice_path)

    # Log to Convex
    log_to_convex(actual_type, script, played)

    print("\n" + "="*50)
    print(f"✅ AI DJ Complete!")
    print(f"   Type: {actual_type}")
    print(f"   Script: {script}")
    print(f"   Played live: {'Yes - ducking on air!' if played else 'No (Liquidsoap not running)'}")
    print("="*50 + "\n")

    return {
        'success': True,
        'type': actual_type,
        'script': script,
        'voice_file': str(voice_path),
        'played_live': played
    }


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='LLM-Powered AI DJ (Convex)')
    parser.add_argument('--type', choices=['auto', 'next_song', 'time_check', 'station_id', 'weather', 'news'],
                        default='auto', help='Type of announcement')
    parser.add_argument('--convex', action='store_true', help='Use Convex for secrets')
    args = parser.parse_args()

    if args.convex:
        os.environ['USE_CONVEX'] = 'true'

    result = run_ai_dj(args.type)
    print(json.dumps(result, indent=2))
