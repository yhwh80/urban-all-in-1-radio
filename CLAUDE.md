# Urban All-in-1 Radio

## Project Overview
Complete media ecosystem: 24/7 radio streaming with AI DJ, news hub, gaming hub, and future e-commerce.
- **Owner**: SGP (yhwh80 on GitHub)
- **Stream**: https://stream.urbanallin1radio.co.uk/radio.mp3
- **Genres**: RnB, Hip-Hop, Afrobeats, House, UK Garage

## Architecture

### Main App (Node.js)
- `server.js` — Express API server (port 3000)
- `routes/aiHostWebhook.js` — AI Host endpoints (`/api/ai-host/*`)
- `services/aiHost.js` — Smart announcement generator
- `services/voiceGenerator.js` — ElevenLabs TTS (voice: Adam)
- `services/geoLocation.js` — IP geolocation for listener shoutouts

### AI DJ Mixer (Python) — `ai-dj-mixer/`
- `llm_dj_convex.py` — **PRODUCTION** version (OpenAI + Gemini TTS, cheapest)
- `llm_dj.py` — Legacy version (Perplexity + ElevenLabs, expensive)
- `dj_server.py` — HTTP server on port 3001 (n8n calls this)
- `track_monitor.py` — Standalone monitor (alternative to n8n)
- `mixer.py` — Legacy audio mixer (superseded by llm_dj variants)
- `liquidsoap.liq` — Real-time voice ducking over music stream
- `icecast.xml` — Streaming server config (port 8001)
- `Dockerfile` + `supervisord.conf` — Docker deployment

### Website — `website/`
- Static frontend, dark theme with neon cyan/magenta accents
- Particle visualiser responsive to audio
- Desktop + mobile versions
- Connects to AzuraCast API for now-playing metadata

### Supabase Edge Functions — `supabase/functions/`
- `ai-dj-announce/` — Serverless AI announcement generation
- `get-news/` — News fetching (Perplexity + NewsAPI)

### Automation
- `n8n-workflows/` — Smart AI DJ announcement workflow
- `zapier-workflows/` — Discord, email, announcement automations

## External Services
- **AzuraCast**: http://72.62.210.209 (Station 1, self-hosted)
- **Chatterbox TTS**: Primary voice (free, local at localhost:4123, cloned from ElevenLabs DJ voice)
- **ElevenLabs**: Fallback voice synthesis (Adam voice: pNInz6obpgDQGcFmaJgB)
- **Perplexity**: News + LLM announcements
- **OpenAI**: gpt-4o-mini for DJ scripts (llm_dj_convex.py)
- **Google Gemini**: Free TTS (llm_dj_convex.py)
- **OpenWeather**: Weather data for DJ announcements
- **Render**: Deployment (2 services: API + static site)
- **Supabase**: Edge functions
- **Convex**: Secrets management for DJ server (optional)

## Key Patterns
- DJ server uses telnet (port 1234) to send voice files to Liquidsoap
- Liquidsoap ducks music to 15% volume when DJ voice plays
- track_monitor.py triggers DJ every 2-4 songs with weighted announcement types
- Top-of-hour: 70% time_check, 30% next_song

## Development
```bash
# Main server
npm install && npm start  # Port 3000

# AI DJ (Python)
cd ai-dj-mixer
pip install -r requirements.txt
python dj_server.py       # Port 3001

# Docker (full stack: Icecast + Liquidsoap + DJ server)
cd ai-dj-mixer
docker build -t ai-dj .
docker run -p 3001:3001 -p 8001:8001 ai-dj
```

## Project Status
- Phase 1 (Radio): Mostly complete — streaming, AI DJ, automation working
- Phase 2 (Website): Complete — player, visualiser, responsive design
- Phase 3 (Content): Partial — news fetching works, pages need content
- Phase 4-8: Not started (Gaming, YouTube, Branding, AI Assistant, E-commerce)
