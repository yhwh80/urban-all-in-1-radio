#!/usr/bin/env python3
"""
LLM-Powered AI DJ
Uses OpenAI to generate creative, contextual DJ announcements.
"""

import os
import json
import random
import subprocess
import requests
import socket
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
ELEVENLABS_VOICE_ID = os.getenv('ELEVENLABS_VOICE_ID')
AZURACAST_BASE_URL = os.getenv('AZURACAST_BASE_URL')
AZURACAST_API_KEY = os.getenv('AZURACAST_API_KEY')
AZURACAST_STATION_ID = os.getenv('AZURACAST_STATION_ID')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')

STATION_NAME = "Urban All-in-1 Radio"
CITY = "London"
OUTPUT_DIR = Path(__file__).parent.parent / 'output' / 'voice'

# DJ Personality System Prompt
DJ_PERSONALITY = """You are an AI DJ for Urban All-in-1 Radio, a UK urban music station.

Your personality:
- Cool, confident, authentic UK urban vibe
- Use natural UK slang (safe, sick, big tune, etc.) but don't overdo it
- Warm and engaging, like you're talking to friends
- Knowledgeable about UK urban music scene (grime, UK rap, afrobeats, R&B)
- Keep it real, no fake hype

Rules:
- Keep announcements SHORT (2-3 sentences max, under 30 words total)
- Sound natural, not scripted
- Never use hashtags or emojis
- Don't say "yo yo yo" or cliche radio phrases
- Mention the station name naturally, not forced
"""


def get_azuracast_metadata():
    """Get current and next song from AzuraCast."""
    try:
        url = f"{AZURACAST_BASE_URL}/api/nowplaying/{AZURACAST_STATION_ID}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        now_playing = data.get('now_playing', {}).get('song', {})
        playing_next = data.get('playing_next', {}).get('song', {})
        listeners = data.get('listeners', {}).get('current', 0)

        return {
            'current_artist': now_playing.get('artist', 'Unknown'),
            'current_title': now_playing.get('title', 'Unknown'),
            'next_artist': playing_next.get('artist', 'Unknown'),
            'next_title': playing_next.get('title', 'Unknown'),
            'listeners': listeners
        }
    except Exception as e:
        print(f"Error getting AzuraCast metadata: {e}")
        return None


def get_weather():
    """Get current weather."""
    if not OPENWEATHER_API_KEY:
        return None

    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        return {
            'temp': round(data['main']['temp']),
            'description': data['weather'][0]['description'],
            'city': CITY
        }
    except Exception as e:
        print(f"Weather API error: {e}")
        return None


def get_music_news():
    """Get latest music news from Perplexity."""
    if not PERPLEXITY_API_KEY:
        return None

    try:
        url = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "sonar",
            "messages": [
                {
                    "role": "user",
                    "content": "Give me ONE short UK urban music news headline from today (Stormzy, Central Cee, Dave, Skepta, etc). Just the headline, under 15 words, no intro."
                }
            ],
            "max_tokens": 50,
            "temperature": 0.7
        }

        response = requests.post(url, json=data, headers=headers, timeout=15)
        response.raise_for_status()
        result = response.json()

        return result['choices'][0]['message']['content'].strip().strip('"\'')
    except Exception as e:
        print(f"Perplexity API error: {e}")
        return None


def generate_dj_script(context_type='auto', talk_over_intro=False):
    """Use Perplexity to generate a DJ announcement.

    Args:
        context_type: Type of announcement
        talk_over_intro: If True, DJ can talk longer as next track has an intro
    """
    if not PERPLEXITY_API_KEY:
        raise ValueError("Perplexity API key not configured")

    # Gather context
    metadata = get_azuracast_metadata()
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
        context_parts.append(f"Up next: {metadata['next_artist']} - {metadata['next_title']}")
        context_parts.append(f"Listeners: {metadata['listeners']}")

    if weather:
        context_parts.append(f"Weather: {weather['temp']}°C, {weather['description']} in {weather['city']}")

    if news:
        context_parts.append(f"Music news: {news}")

    context = "\n".join(context_parts)

    # Decide what type of announcement
    if context_type == 'auto':
        options = ['next_song', 'next_song', 'next_song', 'time_check', 'station_id']
        if weather:
            options.append('weather')
        if news:
            options.append('news')
        context_type = random.choice(options)

    # Create prompt based on type
    prompts = {
        'next_song': f"Introduce the next song coming up. Mention the artist and song title naturally. Maybe add a quick fact or hype.",
        'time_check': f"Give a quick time check. It's {time_str}. Keep it brief and natural.",
        'station_id': f"Do a quick station ID for {STATION_NAME}. Make it memorable but not cheesy.",
        'weather': f"Give a quick weather update. It's {weather['temp'] if weather else 'nice'}°C in {CITY}. Tie it into the music vibe.",
        'news': f"Share this music news briefly: {news}. React to it naturally."
    }

    # Adjust length based on whether next track has an intro
    if talk_over_intro:
        length_instruction = "You can be a bit longer (30-50 words) since the next track has an intro you can talk over."
    else:
        length_instruction = "Keep it SHORT (under 30 words) since the vocals start right away."

    user_prompt = f"""You are an AI DJ for Urban All-in-1 Radio, a UK urban music station.

Your personality: Cool, confident, authentic UK urban vibe. Use natural UK slang (safe, sick, big tune) but don't overdo it. Warm and engaging.

Context:
{context}

Task: {prompts.get(context_type, prompts['station_id'])}

IMPORTANT: {length_instruction} Natural, authentic UK urban style. No emojis, hashtags, or quotes. Just the DJ script, nothing else."""

    # Call Perplexity
    print(f"🤖 Asking Perplexity for {context_type} announcement...")

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "sonar",
        "messages": [
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": 100,
        "temperature": 0.8
    }

    response = requests.post(
        "https://api.perplexity.ai/chat/completions",
        headers=headers,
        json=data,
        timeout=30
    )
    response.raise_for_status()
    result = response.json()

    script = result['choices'][0]['message']['content'].strip()
    # Clean up any quotes
    script = script.strip('"\'')

    print(f"📝 Generated: {script}")
    return script, context_type


def generate_voice(text, output_path):
    """Generate voice using ElevenLabs."""
    print(f"🎤 Generating voice...")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
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


def trigger_liquidsoap(voice_path):
    """Send voice to Liquidsoap mixer for live playback."""
    try:
        # Convert to WAV
        wav_path = "/tmp/voice-to-play.wav"
        subprocess.run([
            'ffmpeg', '-y', '-i', str(voice_path),
            '-ar', '44100', '-ac', '2',
            wav_path, '-loglevel', 'quiet'
        ], check=True)

        # Send to Liquidsoap
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect(("127.0.0.1", 1234))
        sock.send(f"voice_queue.push file://{wav_path}\n".encode())
        response = sock.recv(1024).decode()
        sock.close()

        if "0" not in response.split('\n')[0]:
            print("🔊 Playing on air NOW!")
            return True
        return False

    except ConnectionRefusedError:
        print("⚠️  Liquidsoap not running")
        return False
    except Exception as e:
        print(f"⚠️  Liquidsoap error: {e}")
        return False


def run_ai_dj(announcement_type='auto', talk_over_intro=False):
    """Main function to run the AI DJ.

    Args:
        announcement_type: Type of announcement (auto, next_song, weather, etc.)
        talk_over_intro: If True, next track has an intro we can talk over
    """
    print("\n" + "="*50)
    print("🎙️  AI DJ STARTING")
    if talk_over_intro:
        print("🎤  INTRO MODE - Can talk over beginning of next track!")
    print("="*50 + "\n")

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Generate script with LLM
    script, actual_type = generate_dj_script(announcement_type, talk_over_intro=talk_over_intro)

    # Generate voice
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    voice_path = OUTPUT_DIR / f'llm_dj_{actual_type}_{timestamp}.mp3'
    generate_voice(script, voice_path)

    # Play through Liquidsoap
    played = trigger_liquidsoap(voice_path)

    print("\n" + "="*50)
    print(f"✅ AI DJ Complete!")
    print(f"   Type: {actual_type}")
    print(f"   Script: {script}")
    print(f"   Played live: {'Yes' if played else 'No (Liquidsoap not running)'}")
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

    parser = argparse.ArgumentParser(description='LLM-Powered AI DJ')
    parser.add_argument('--type', choices=['auto', 'next_song', 'time_check', 'station_id', 'weather', 'news'],
                        default='auto', help='Type of announcement (default: auto)')
    args = parser.parse_args()

    result = run_ai_dj(args.type)
    print(json.dumps(result, indent=2))
