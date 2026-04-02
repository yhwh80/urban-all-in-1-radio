# AI DJ System - Setup Guide

## Quick Start

```bash
# 1. Start the DJ server
./start-all.sh

# 2. Import the n8n workflow
# File: ../n8n-workflows/smart-ai-dj-v3-llm.json
# Import this into n8n and activate it!

# 3. (Optional) Start Liquidsoap for voice ducking
cd ../liquidsoap-mixer && ./start-mixer.sh
```

## How It Works

### n8n Workflow (smart-ai-dj-v3-llm.json)
- Polls AzuraCast every 3 seconds
- Detects when a song is about to end (8 seconds before)
- Triggers DJ announcement every 2-4 songs (random)
- Sends notification to Discord
- Passes "intro" flag for tracks with "(intro)" in the name

### DJ Server (dj_server.py)
- Runs on port 3001
- Receives triggers from n8n
- Generates LLM script via Perplexity
- Creates voice with ElevenLabs
- Sends to Liquidsoap for playback

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/trigger` | GET | Trigger DJ announcement |
| `/trigger?type=next_song` | GET | Announce next song |
| `/trigger?type=weather` | GET | Weather update |
| `/trigger?type=news` | GET | Music news |
| `/trigger?type=station_id` | GET | Station ID |
| `/trigger?type=time_check` | GET | Time check |
| `/trigger?intro=true` | GET | Longer announcement (for intro tracks) |

## Manual Testing

```bash
# Test health
curl http://localhost:3001/health

# Trigger announcement
curl "http://localhost:3001/trigger?type=auto"

# Trigger with intro mode (longer)
curl "http://localhost:3001/trigger?type=next_song&intro=true"
```

## Alternative: Track Monitor

If you don't want to use n8n, run the track monitor instead:

```bash
python track_monitor.py
```

This monitors AzuraCast directly and triggers DJ automatically.

## Files

- `llm_dj.py` - Main LLM DJ logic (Perplexity + ElevenLabs)
- `dj_server.py` - HTTP server for n8n
- `track_monitor.py` - Alternative auto-trigger (no n8n needed)
- `mixer.py` - Legacy mixer (not used with Liquidsoap)
- `dj.sh` - Quick manual trigger script
- `start-all.sh` - Start everything

## Configuration

All config is in `../.env`:
- `PERPLEXITY_API_KEY` - For LLM script generation
- `ELEVENLABS_API_KEY` - For voice generation
- `ELEVENLABS_VOICE_ID` - Your voice ID
- `AZURACAST_*` - Radio station config
- `OPENWEATHER_API_KEY` - For weather announcements
