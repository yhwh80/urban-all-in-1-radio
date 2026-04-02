#!/usr/bin/env python3
"""
Convex client for fetching API keys via HTTP endpoints.
Works with the convex-api-keys project.
"""

import os
import requests
import time
from typing import Optional, Dict, Any

# Convex site URL - set this after deploying (use .site not .cloud for HTTP routes)
CONVEX_SITE_URL = os.getenv("CONVEX_SITE_URL", "")

# Optional access token for auth
API_ACCESS_TOKEN = os.getenv("API_ACCESS_TOKEN", "")

# Cache secrets to avoid too many API calls
_secrets_cache: Dict[str, Any] = {}
_cache_timestamp: float = 0
CACHE_DURATION = 300  # 5 minutes


def get_all_keys() -> Dict[str, str]:
    """
    Fetch all API keys from Convex via HTTP endpoint.
    Returns cached version if available and not expired.
    """
    global _secrets_cache, _cache_timestamp

    now = time.time()
    if _secrets_cache and (now - _cache_timestamp) < CACHE_DURATION:
        return _secrets_cache

    if not CONVEX_SITE_URL:
        raise ValueError("CONVEX_SITE_URL not set. Deploy Convex and set the URL.")

    url = f"{CONVEX_SITE_URL}/api/keys"
    headers = {"Content-Type": "application/json"}

    if API_ACCESS_TOKEN:
        headers["Authorization"] = f"Bearer {API_ACCESS_TOKEN}"

    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        _secrets_cache = response.json()
        _cache_timestamp = now
        return _secrets_cache
    except Exception as e:
        print(f"⚠️ Failed to fetch keys from Convex: {e}")
        # Return cached version even if expired, as fallback
        if _secrets_cache:
            return _secrets_cache
        raise


def get_key(name: str) -> Optional[str]:
    """Fetch a single API key by name."""
    if not CONVEX_SITE_URL:
        raise ValueError("CONVEX_SITE_URL not set.")

    url = f"{CONVEX_SITE_URL}/api/keys/{name}"
    headers = {"Content-Type": "application/json"}

    if API_ACCESS_TOKEN:
        headers["Authorization"] = f"Bearer {API_ACCESS_TOKEN}"

    try:
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code == 404:
            return None
        response.raise_for_status()
        return response.json().get("value")
    except Exception as e:
        print(f"⚠️ Failed to fetch key {name}: {e}")
        return None


def get_secrets() -> Dict[str, Any]:
    """
    Get all secrets in the format expected by llm_dj_convex.py
    Maps the flat key-value format to the nested format.
    """
    keys = get_all_keys()

    return {
        'perplexity': {
            'apiKey': keys.get('PERPLEXITY_API_KEY'),
        },
        'elevenLabs': {
            'apiKey': keys.get('ELEVENLABS_API_KEY'),
            'voiceId': keys.get('ELEVENLABS_VOICE_ID'),
        },
        'azuraCast': {
            'apiUrl': keys.get('AZURACAST_API_URL') or keys.get('AZURACAST_BASE_URL'),
            'apiKey': keys.get('AZURACAST_API_KEY'),
            'stationId': keys.get('AZURACAST_STATION_ID'),
        },
        'openWeather': {
            'apiKey': keys.get('OPENWEATHER_API_KEY'),
            'city': keys.get('OPENWEATHER_CITY', 'London,UK'),
        },
        'discord': {
            'webhookUrl': keys.get('DISCORD_WEBHOOK_URL'),
        },
    }


def health_check() -> bool:
    """Check if Convex is reachable."""
    if not CONVEX_SITE_URL:
        return False

    try:
        response = requests.get(f"{CONVEX_SITE_URL}/health", timeout=10)
        return response.status_code == 200
    except:
        return False


# Convenience functions
def get_perplexity_key() -> str:
    return get_secrets()["perplexity"]["apiKey"]


def get_elevenlabs_config() -> Dict[str, str]:
    return get_secrets()["elevenLabs"]


def get_azuracast_config() -> Dict[str, str]:
    return get_secrets()["azuraCast"]


def get_openweather_config() -> Dict[str, str]:
    return get_secrets()["openWeather"]


def get_discord_webhook() -> str:
    return get_secrets()["discord"]["webhookUrl"]


if __name__ == "__main__":
    # Test the client
    print("Testing Convex HTTP connection...")
    print(f"CONVEX_SITE_URL: {CONVEX_SITE_URL or '(not set)'}")

    if not CONVEX_SITE_URL:
        print("❌ CONVEX_SITE_URL not set!")
        print("Set it with: export CONVEX_SITE_URL=https://your-deployment.convex.site")
    else:
        if health_check():
            print("✅ Convex is reachable!")

            try:
                keys = get_all_keys()
                print(f"✅ Found {len(keys)} API keys:")
                for name in keys:
                    masked = keys[name][:4] + "..." + keys[name][-4:] if len(keys[name]) > 8 else "***"
                    print(f"   {name}: {masked}")
            except Exception as e:
                print(f"❌ Error: {e}")
        else:
            print("❌ Cannot reach Convex health endpoint")
