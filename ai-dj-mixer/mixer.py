#!/usr/bin/env python3
"""
AI DJ Mixer v2
Generates variety of announcements with instrumental beds and audio ducking.
- Next song intros with artist facts
- Music news (via Perplexity)
- Time checks
- Weather updates
- Station IDs
"""

import os
import json
import random
import subprocess
import requests
from pathlib import Path
from datetime import datetime

# Import config
from config import (
    AZURACAST_BASE_URL, AZURACAST_API_KEY, AZURACAST_STATION_ID,
    ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID,
    JINGLE_LENGTH_SECONDS, DUCK_LEVEL_DB, VOICE_LEVEL_DB, FADE_DURATION_MS,
    INSTRUMENTALS_DIR, OUTPUT_DIR, KNOWLEDGE_BASE_PATH, JINGLES_PLAYLIST_ID,
    PERPLEXITY_API_KEY, OPENWEATHER_API_KEY, STATION_NAME, CITY
)


# =============================================================================
# JINGLE TYPES - Weighted for variety
# =============================================================================
JINGLE_TYPES = {
    'next_song': 40,      # 40% - Announce next song with artist fact
    'music_news': 20,     # 20% - Today's music news
    'time_check': 15,     # 15% - Time announcement
    'station_id': 15,     # 15% - Station ID/branding
    'weather': 10,        # 10% - Weather update
}


def pick_jingle_type():
    """Randomly pick a jingle type based on weights."""
    total = sum(JINGLE_TYPES.values())
    r = random.randint(1, total)
    cumulative = 0
    for jingle_type, weight in JINGLE_TYPES.items():
        cumulative += weight
        if r <= cumulative:
            return jingle_type
    return 'next_song'  # fallback


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def ensure_dirs():
    """Create output directory if it doesn't exist."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(INSTRUMENTALS_DIR, exist_ok=True)


def load_knowledge_base():
    """Load artist facts from knowledge base."""
    try:
        with open(KNOWLEDGE_BASE_PATH, 'r') as f:
            data = json.load(f)
            return data.get('artists', {})
    except Exception as e:
        print(f"Warning: Could not load knowledge base: {e}")
        return {}


def get_artist_fact(artist_name, knowledge_base):
    """Get a random fact about an artist."""
    if artist_name in knowledge_base:
        return random.choice(knowledge_base[artist_name])

    for name, facts in knowledge_base.items():
        if name.lower() == artist_name.lower():
            return random.choice(facts)

    for name, facts in knowledge_base.items():
        if name.lower() in artist_name.lower() or artist_name.lower() in name.lower():
            return random.choice(facts)

    defaults = knowledge_base.get('_default', ['Big tune coming up'])
    return random.choice(defaults)


def get_now_playing():
    """Get currently playing song from AzuraCast."""
    try:
        url = f"{AZURACAST_BASE_URL}/api/nowplaying/{AZURACAST_STATION_ID}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        now_playing = data.get('now_playing', {}).get('song', {})
        playing_next = data.get('playing_next', {}).get('song', {})
        listeners = data.get('listeners', {}).get('current', 0)

        return {
            'current': {
                'artist': now_playing.get('artist', 'Unknown'),
                'title': now_playing.get('title', 'Unknown')
            },
            'next': {
                'artist': playing_next.get('artist', 'Unknown'),
                'title': playing_next.get('title', 'Unknown')
            },
            'listeners': listeners
        }
    except Exception as e:
        print(f"Error getting now playing: {e}")
        return None


# =============================================================================
# JINGLE GENERATORS
# =============================================================================

def generate_next_song_text(song_info, knowledge_base):
    """Generate next song announcement with artist fact."""
    if not song_info or not song_info.get('next'):
        return "More music coming up on " + STATION_NAME + "."

    artist = song_info['next']['artist']
    title = song_info['next']['title']
    fact = get_artist_fact(artist, knowledge_base)

    templates = [
        f"Coming up next, {artist} with {title}. {fact}.",
        f"Up next, we've got {artist}. {fact}. This is {title}.",
        f"{fact}. Here's {artist} with {title}.",
        f"Next up on {STATION_NAME}, {artist}, {title}. {fact}.",
        f"Keep it locked. {artist} coming in hot with {title}. {fact}.",
        f"Don't touch that dial. {artist}, {title}, coming up. {fact}.",
    ]

    return random.choice(templates)


def generate_time_check_text():
    """Generate time check announcement."""
    now = datetime.now()
    hour = now.strftime('%I').lstrip('0')  # 12-hour format, no leading zero
    minute = now.strftime('%M')
    ampm = now.strftime('%p').lower()

    # Handle "o'clock" for :00
    if minute == '00':
        time_str = f"{hour} o'clock"
    else:
        time_str = f"{hour} {minute}"

    day_part = "morning" if now.hour < 12 else "afternoon" if now.hour < 18 else "evening"

    templates = [
        f"It's {time_str} {ampm}. You're locked into {STATION_NAME}.",
        f"The time is {time_str}. Good {day_part}, this is {STATION_NAME}.",
        f"{time_str} {ampm} right now. Stay tuned to {STATION_NAME}.",
        f"Time check: {time_str}. You're vibing with {STATION_NAME}.",
        f"It's {time_str} on a beautiful {day_part}. {STATION_NAME} keeping you company.",
    ]

    return random.choice(templates)


def generate_station_id_text():
    """Generate station ID/branding announcement."""
    templates = [
        f"You're listening to {STATION_NAME}. UK's finest urban music.",
        f"{STATION_NAME}. The sound of the streets.",
        f"This is {STATION_NAME}. All vibes, all day.",
        f"{STATION_NAME}. Your home for urban music.",
        f"Locked in with {STATION_NAME}. The best in UK urban.",
        f"{STATION_NAME}. Real music for real people.",
        f"You already know. {STATION_NAME}.",
        f"Turn it up. This is {STATION_NAME}.",
    ]

    return random.choice(templates)


def generate_weather_text():
    """Generate weather announcement using OpenWeather API."""
    if not OPENWEATHER_API_KEY:
        # Fallback if no API key
        return generate_station_id_text()

    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        temp = round(data['main']['temp'])
        description = data['weather'][0]['description']

        templates = [
            f"Weather check: It's {temp} degrees in {CITY} right now. {description.capitalize()}. Stay warm, stay tuned to {STATION_NAME}.",
            f"Currently {temp} degrees with {description} in {CITY}. Perfect weather for some tunes on {STATION_NAME}.",
            f"{temp} degrees outside. {description.capitalize()}. Keep it locked to {STATION_NAME}.",
        ]

        return random.choice(templates)

    except Exception as e:
        print(f"Weather API error: {e}")
        return generate_station_id_text()


def generate_music_news_text():
    """Generate music news using Perplexity API."""
    if not PERPLEXITY_API_KEY:
        # Fallback if no API key
        return generate_station_id_text()

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
                    "role": "system",
                    "content": "You are a UK urban radio DJ giving a quick music news update. Keep it to ONE short sentence (under 20 words). Sound natural and hype. Focus on UK artists like Stormzy, Central Cee, Dave, Skepta, Little Simz, Burna Boy, or major hip-hop/R&B news. No hashtags, no emojis."
                },
                {
                    "role": "user",
                    "content": "Give me one quick UK urban music news headline from today. Just the headline, nothing else."
                }
            ],
            "max_tokens": 100,
            "temperature": 0.7
        }

        response = requests.post(url, json=data, headers=headers, timeout=15)
        response.raise_for_status()
        result = response.json()

        news = result['choices'][0]['message']['content'].strip()
        # Clean up any quotes
        news = news.strip('"\'')

        templates = [
            f"Quick news update: {news}. More music coming up on {STATION_NAME}.",
            f"Just in: {news}. Stay locked to {STATION_NAME}.",
            f"Music news: {news}. You heard it here first on {STATION_NAME}.",
        ]

        return random.choice(templates)

    except Exception as e:
        print(f"Perplexity API error: {e}")
        return generate_station_id_text()


# =============================================================================
# LIQUIDSOAP INTEGRATION
# =============================================================================

def trigger_liquidsoap_playback(voice_path):
    """Send voice file to Liquidsoap mixer for immediate playback with ducking."""
    try:
        import socket

        # Convert MP3 to WAV first
        wav_path = "/tmp/voice-to-play.wav"
        convert_cmd = [
            'ffmpeg', '-y', '-i', voice_path,
            '-ar', '44100', '-ac', '2',
            wav_path,
            '-loglevel', 'quiet'
        ]
        result = subprocess.run(convert_cmd, capture_output=True)

        if result.returncode != 0:
            print("⚠️  Failed to convert voice to WAV for Liquidsoap")
            return False

        # Send to Liquidsoap via telnet
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect(("127.0.0.1", 1234))

        command = f"voice_queue.push file://{wav_path}\n"
        sock.send(command.encode())

        response = sock.recv(1024).decode()
        sock.close()

        if "0" not in response.split('\n')[0]:
            print("🔊 Voice sent to Liquidsoap mixer for live playback!")
            return True
        else:
            print("⚠️  Liquidsoap rejected the voice file")
            return False

    except ConnectionRefusedError:
        print("⚠️  Liquidsoap mixer not running (connection refused)")
        return False
    except Exception as e:
        print(f"⚠️  Could not send to Liquidsoap: {e}")
        return False


# =============================================================================
# VOICE & AUDIO
# =============================================================================

def generate_voice(text, output_path):
    """Generate voice using ElevenLabs API."""
    if not ELEVENLABS_API_KEY or not ELEVENLABS_VOICE_ID:
        raise ValueError("ElevenLabs API key or Voice ID not configured")

    print(f"🎤 Generating voice: \"{text}\"")

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


def get_random_instrumental():
    """Get a random instrumental from the instrumentals folder."""
    instrumentals = list(Path(INSTRUMENTALS_DIR).glob('*.mp3')) + \
                   list(Path(INSTRUMENTALS_DIR).glob('*.wav'))

    if not instrumentals:
        print("⚠️  No instrumentals found in", INSTRUMENTALS_DIR)
        return None

    return str(random.choice(instrumentals))


def get_audio_duration(file_path):
    """Get duration of audio file in seconds using ffprobe."""
    try:
        result = subprocess.run([
            'ffprobe', '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            file_path
        ], capture_output=True, text=True)
        return float(result.stdout.strip())
    except:
        return 0


def mix_with_ducking(voice_path, instrumental_path, output_path):
    """Mix voice with instrumental using FFmpeg (ducking effect)."""
    print(f"🎚️  Mixing voice with instrumental...")

    voice_duration = get_audio_duration(voice_path)
    total_duration = voice_duration + 2  # 1 second padding each side

    filter_simple = f"""
    [0:a]atrim=0:{total_duration},volume={DUCK_LEVEL_DB}dB,afade=t=in:st=0:d=0.3,afade=t=out:st={total_duration-0.3}:d=0.3[bed];
    [1:a]adelay=1000|1000,volume={VOICE_LEVEL_DB}dB[voice];
    [bed][voice]amix=inputs=2:duration=first:dropout_transition=0[out]
    """

    cmd = [
        'ffmpeg', '-y',
        '-i', instrumental_path,
        '-i', voice_path,
        '-filter_complex', filter_simple,
        '-map', '[out]',
        '-ac', '2',
        '-ar', '44100',
        '-b:a', '192k',
        output_path
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"❌ FFmpeg error: {result.stderr}")
        raise Exception("FFmpeg mixing failed")

    print(f"✅ Mixed audio saved: {output_path}")
    return output_path


# =============================================================================
# AZURACAST UPLOAD
# =============================================================================

def upload_to_azuracast(file_path, filename):
    """Upload file to AzuraCast."""
    print(f"📤 Uploading to AzuraCast: {filename}")

    # Use the upload endpoint (not files endpoint)
    url = f"{AZURACAST_BASE_URL}/api/station/{AZURACAST_STATION_ID}/files/upload"

    with open(file_path, 'rb') as f:
        file_content = f.read()

    # AzuraCast expects multipart form with 'path' first, then 'file'
    files = {
        'path': (None, f'ai-dj-jingles/{filename}'),
        'file': (filename, open(file_path, 'rb'), 'audio/mpeg')
    }
    headers = {'X-API-Key': AZURACAST_API_KEY}

    response = requests.post(url, files=files, headers=headers, timeout=60)

    if response.status_code not in [200, 201]:
        print(f"❌ Upload error: {response.status_code} - {response.text}")
        raise Exception(f"Upload failed: {response.status_code}")

    print(f"✅ Uploaded successfully!")
    return response.json() if response.text else {'success': True}


def add_to_playlist(file_id, playlist_id=JINGLES_PLAYLIST_ID):
    """Add uploaded file to the jingles playlist."""
    print(f"📋 Adding file {file_id} to playlist {playlist_id}...")

    url = f"{AZURACAST_BASE_URL}/api/station/{AZURACAST_STATION_ID}/file/{file_id}"
    headers = {
        'X-API-Key': AZURACAST_API_KEY,
        'Content-Type': 'application/json'
    }
    data = {'playlists': [playlist_id]}

    response = requests.put(url, json=data, headers=headers, timeout=30)

    if response.status_code not in [200, 201]:
        print(f"❌ Playlist error: {response.status_code} - {response.text}")
        return False

    print(f"✅ Added to playlist!")
    return True


def request_next(file_id):
    """Request the file to play next."""
    print(f"⏭️  Requesting file {file_id} to play next...")

    url = f"{AZURACAST_BASE_URL}/api/station/{AZURACAST_STATION_ID}/requests"
    headers = {
        'X-API-Key': AZURACAST_API_KEY,
        'Content-Type': 'application/json'
    }
    data = {'media_id': file_id}

    response = requests.post(url, json=data, headers=headers, timeout=30)

    if response.status_code not in [200, 201]:
        print(f"❌ Request error: {response.status_code} - {response.text}")
        return False

    print(f"✅ Queued to play next!")
    return True


def find_file_by_path(filename):
    """Find uploaded file by searching the files list."""
    url = f"{AZURACAST_BASE_URL}/api/station/{AZURACAST_STATION_ID}/files"
    headers = {'X-API-Key': AZURACAST_API_KEY}

    response = requests.get(url, headers=headers, timeout=30)

    if response.status_code == 200:
        files = response.json()
        for f in files:
            if filename in f.get('path', ''):
                return f
    return None


# =============================================================================
# MAIN JINGLE GENERATOR
# =============================================================================

def generate_jingle(jingle_type=None, play_next=True):
    """
    Generate a complete DJ jingle with voice over instrumental.

    Args:
        jingle_type: Type of jingle (next_song, music_news, time_check, station_id, weather)
                     If None, picks randomly based on weights.
        play_next: If True, queue the jingle to play next.

    Returns:
        dict with success status and file info
    """
    ensure_dirs()

    # Pick jingle type if not specified
    if jingle_type is None:
        jingle_type = pick_jingle_type()

    print(f"\n🎙️  Generating {jingle_type} jingle...\n")

    # Load knowledge base for next_song type
    knowledge_base = load_knowledge_base()
    song_info = get_now_playing()

    # Generate announcement text based on type
    if jingle_type == 'next_song':
        text = generate_next_song_text(song_info, knowledge_base)
    elif jingle_type == 'music_news':
        text = generate_music_news_text()
    elif jingle_type == 'time_check':
        text = generate_time_check_text()
    elif jingle_type == 'station_id':
        text = generate_station_id_text()
    elif jingle_type == 'weather':
        text = generate_weather_text()
    else:
        text = generate_station_id_text()

    print(f"📝 Announcement: {text}\n")

    # Generate timestamp for unique filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Create voice file
    voice_path = os.path.join(OUTPUT_DIR, f'voice_{timestamp}.mp3')
    generate_voice(text, voice_path)

    # Send to Liquidsoap for immediate live playback (voice only, radio provides music bed)
    trigger_liquidsoap_playback(voice_path)

    # Get instrumental and mix
    instrumental_path = get_random_instrumental()

    if instrumental_path:
        output_filename = f'jingle_{jingle_type}_{timestamp}.mp3'
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        mix_with_ducking(voice_path, instrumental_path, output_path)
        os.remove(voice_path)
    else:
        print("⚠️  No instrumentals found, using voice only")
        output_filename = f'jingle_{jingle_type}_{timestamp}.mp3'
        output_path = voice_path

    # Upload to AzuraCast
    try:
        upload_to_azuracast(output_path, output_filename)

        import time
        time.sleep(2)

        file_info = find_file_by_path(output_filename)

        if file_info:
            file_id = file_info.get('id')
            add_to_playlist(file_id)

            # Note: request_next removed - AzuraCast will play jingles automatically
            # based on playlist settings

            return {
                'success': True,
                'type': jingle_type,
                'text': text,
                'file_id': file_id,
                'filename': output_filename,
                'added_to_playlist': True
            }
        else:
            return {
                'success': True,
                'type': jingle_type,
                'text': text,
                'filename': output_filename,
                'warning': 'File uploaded but could not verify'
            }

    except Exception as e:
        print(f"❌ Error uploading: {e}")
        return {
            'success': False,
            'type': jingle_type,
            'error': str(e),
            'local_file': output_path
        }


# =============================================================================
# CLI
# =============================================================================

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='AI DJ Jingle Generator v2')
    parser.add_argument('--type', choices=['next_song', 'music_news', 'time_check', 'station_id', 'weather'],
                        help='Force a specific jingle type (default: random)')
    parser.add_argument('--no-queue', action='store_true',
                        help="Don't queue to play next, just add to playlist")
    parser.add_argument('--test', action='store_true',
                        help="Test mode: generate but don't upload")
    args = parser.parse_args()

    if args.test:
        ensure_dirs()
        jingle_type = args.type or pick_jingle_type()
        print(f"\n🧪 TEST MODE - Jingle type: {jingle_type}\n")

        knowledge_base = load_knowledge_base()
        song_info = get_now_playing()

        if jingle_type == 'next_song':
            text = generate_next_song_text(song_info, knowledge_base)
        elif jingle_type == 'music_news':
            text = generate_music_news_text()
        elif jingle_type == 'time_check':
            text = generate_time_check_text()
        elif jingle_type == 'station_id':
            text = generate_station_id_text()
        elif jingle_type == 'weather':
            text = generate_weather_text()

        print(f"📝 Would announce: {text}\n")

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        voice_path = os.path.join(OUTPUT_DIR, f'test_voice_{timestamp}.mp3')
        generate_voice(text, voice_path)

        instrumental = get_random_instrumental()
        if instrumental:
            output_path = os.path.join(OUTPUT_DIR, f'test_jingle_{jingle_type}_{timestamp}.mp3')
            mix_with_ducking(voice_path, instrumental, output_path)
            print(f"\n✅ Test jingle created: {output_path}")
        else:
            print(f"\n✅ Test voice created: {voice_path}")
            print("💡 Add .mp3 files to 'instrumentals/' folder to enable mixing!")
    else:
        result = generate_jingle(jingle_type=args.type, play_next=not args.no_queue)
        print(f"\nResult: {json.dumps(result, indent=2)}")
