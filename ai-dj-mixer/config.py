"""
AI DJ Mixer Configuration v2
"""
import os
from dotenv import load_dotenv

# Load .env from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# =============================================================================
# STATION INFO
# =============================================================================
STATION_NAME = "Urban All-in-One Radio"
CITY = "London"  # For weather announcements

# =============================================================================
# AZURACAST
# =============================================================================
AZURACAST_BASE_URL = os.getenv('AZURACAST_BASE_URL', 'http://72.62.210.209')
AZURACAST_API_KEY = os.getenv('AZURACAST_API_KEY')
AZURACAST_STATION_ID = os.getenv('AZURACAST_STATION_ID', '1')
JINGLES_PLAYLIST_ID = 5344  # Your jingles playlist ID

# =============================================================================
# AI VOICE (ElevenLabs)
# =============================================================================
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
ELEVENLABS_VOICE_ID = os.getenv('ELEVENLABS_VOICE_ID')

# =============================================================================
# NEWS & WEATHER APIs
# =============================================================================
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')

# OpenWeather API (free tier) - Get yours at: https://openweathermap.org/api
# Optional - if not set, weather jingles will fall back to station ID
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')

# =============================================================================
# AUDIO MIXER SETTINGS
# =============================================================================
JINGLE_LENGTH_SECONDS = 15  # Target length for jingles
DUCK_LEVEL_DB = -12         # How much to lower music when voice plays (negative = quieter)
VOICE_LEVEL_DB = 0          # Voice volume adjustment (0 = unchanged)
FADE_DURATION_MS = 500      # Fade in/out duration for ducking

# =============================================================================
# PATHS
# =============================================================================
INSTRUMENTALS_DIR = os.path.join(os.path.dirname(__file__), 'instrumentals')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')
KNOWLEDGE_BASE_PATH = os.path.join(os.path.dirname(__file__), 'knowledge_base.json')
