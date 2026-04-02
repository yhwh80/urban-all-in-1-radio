#!/usr/bin/env python3
"""
Track Monitor - Triggers AI DJ announcements at the end of tracks.
Monitors AzuraCast for track timing and triggers DJ when song is ending.
"""

import os
import time
import requests
import random
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

AZURACAST_BASE_URL = os.getenv('AZURACAST_BASE_URL')
AZURACAST_API_KEY = os.getenv('AZURACAST_API_KEY')
AZURACAST_STATION_ID = os.getenv('AZURACAST_STATION_ID')

# Configuration
TRIGGER_BEFORE_END = 5  # Trigger DJ this many seconds before song ends
MIN_SONGS_BETWEEN_DJ = 2  # Minimum songs between DJ announcements
MAX_SONGS_BETWEEN_DJ = 4  # Maximum songs before forcing a DJ announcement
CHECK_INTERVAL = 2  # How often to check (seconds)

# Track state
songs_since_last_dj = 0
last_song_id = None
dj_triggered_for_current = False


def get_now_playing():
    """Get current song info from AzuraCast including elapsed/remaining time."""
    try:
        url = f"{AZURACAST_BASE_URL}/api/nowplaying/{AZURACAST_STATION_ID}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        now_playing = data.get('now_playing', {})
        song = now_playing.get('song', {})

        next_song = data.get('playing_next', {}).get('song', {})
        next_title = next_song.get('title', 'Unknown')

        # Check if next track has intro marker in the title/filename
        # Common patterns: "(Intro)", "[Intro]", "- Intro", "_intro"
        next_title_lower = next_title.lower()
        has_intro = any(marker in next_title_lower for marker in [
            '(intro)', '[intro]', '- intro', '_intro', 'intro)', 'intro]',
            '(clean intro)', '[clean intro]', 'radio intro'
        ])

        return {
            'song_id': song.get('id'),
            'artist': song.get('artist', 'Unknown'),
            'title': song.get('title', 'Unknown'),
            'elapsed': now_playing.get('elapsed', 0),
            'duration': now_playing.get('duration', 0),
            'remaining': now_playing.get('remaining', 0),
            'next_artist': next_song.get('artist', 'Unknown'),
            'next_title': next_title,
            'next_has_intro': has_intro,
        }
    except Exception as e:
        print(f"Error getting now playing: {e}")
        return None


def trigger_ai_dj(announcement_type='next_song', has_intro=False):
    """Trigger the AI DJ announcement."""
    try:
        from llm_dj import run_ai_dj
        print(f"\n🎙️ TRIGGERING AI DJ ({announcement_type})...")
        result = run_ai_dj(announcement_type, talk_over_intro=has_intro)
        return result.get('success', False)
    except Exception as e:
        print(f"Error triggering AI DJ: {e}")
        return False


def should_trigger_dj():
    """Decide if we should trigger a DJ announcement."""
    global songs_since_last_dj

    # Random chance based on songs since last DJ
    if songs_since_last_dj >= MAX_SONGS_BETWEEN_DJ:
        return True
    elif songs_since_last_dj >= MIN_SONGS_BETWEEN_DJ:
        # 50% chance after minimum songs
        return random.random() > 0.5
    return False


def pick_announcement_type():
    """Pick what type of announcement to make."""
    hour = datetime.now().hour

    # Weighted random selection
    options = [
        ('next_song', 50),      # 50% - intro next song
        ('station_id', 20),     # 20% - station ID
        ('time_check', 15),     # 15% - time check
        ('weather', 10),        # 10% - weather
        ('news', 5),            # 5% - music news
    ]

    # Adjust weights based on time
    if hour in [0, 6, 12, 18]:  # Top of major hours
        options = [('time_check', 70), ('next_song', 30)]

    total = sum(w for _, w in options)
    r = random.randint(1, total)
    cumulative = 0
    for opt, weight in options:
        cumulative += weight
        if r <= cumulative:
            return opt
    return 'next_song'


def run_monitor():
    """Main monitoring loop."""
    global songs_since_last_dj, last_song_id, dj_triggered_for_current

    print("="*60)
    print("🎵 TRACK MONITOR STARTED")
    print("="*60)
    print(f"   Trigger {TRIGGER_BEFORE_END}s before track ends")
    print(f"   DJ every {MIN_SONGS_BETWEEN_DJ}-{MAX_SONGS_BETWEEN_DJ} songs")
    print(f"   Checking every {CHECK_INTERVAL}s")
    print("="*60)
    print()

    while True:
        try:
            info = get_now_playing()

            if not info:
                time.sleep(CHECK_INTERVAL)
                continue

            current_song_id = info['song_id']
            remaining = info['remaining']

            # Detect song change
            if current_song_id != last_song_id:
                if last_song_id is not None:
                    songs_since_last_dj += 1
                    print(f"\n🎵 NEW TRACK: {info['artist']} - {info['title']}")
                    print(f"   Duration: {info['duration']}s | Songs since DJ: {songs_since_last_dj}")

                last_song_id = current_song_id
                dj_triggered_for_current = False

            # Check if we should trigger DJ
            if (remaining <= TRIGGER_BEFORE_END and
                remaining > 0 and
                not dj_triggered_for_current and
                should_trigger_dj()):

                has_intro = info.get('next_has_intro', False)

                print(f"\n⏰ {remaining}s remaining - TRIGGERING DJ!")
                print(f"   Next up: {info['next_artist']} - {info['next_title']}")
                if has_intro:
                    print(f"   🎤 INTRO DETECTED - DJ can talk over the beginning!")

                ann_type = pick_announcement_type()
                # Pass intro info to the DJ
                success = trigger_ai_dj(ann_type, has_intro=has_intro)

                if success:
                    songs_since_last_dj = 0
                    dj_triggered_for_current = True
                    print("✅ DJ announcement played!")
                else:
                    print("❌ DJ trigger failed")

            # Status update every 30 seconds
            if int(time.time()) % 30 == 0:
                print(f"📻 Playing: {info['artist']} - {info['title']} | {remaining}s left | Songs since DJ: {songs_since_last_dj}")

            time.sleep(CHECK_INTERVAL)

        except KeyboardInterrupt:
            print("\n\n👋 Track monitor stopped")
            break
        except Exception as e:
            print(f"Error in monitor loop: {e}")
            time.sleep(CHECK_INTERVAL)


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Track Monitor for AI DJ')
    parser.add_argument('--trigger-before', type=int, default=5,
                        help='Seconds before track end to trigger DJ (default: 5)')
    parser.add_argument('--min-songs', type=int, default=2,
                        help='Minimum songs between DJ (default: 2)')
    parser.add_argument('--max-songs', type=int, default=4,
                        help='Maximum songs between DJ (default: 4)')
    args = parser.parse_args()

    TRIGGER_BEFORE_END = args.trigger_before
    MIN_SONGS_BETWEEN_DJ = args.min_songs
    MAX_SONGS_BETWEEN_DJ = args.max_songs

    run_monitor()
