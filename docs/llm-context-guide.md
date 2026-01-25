# LLM Context Guide for Urban All-in-1 Radio

This document helps any AI assistant understand the project structure and how to work with it.

---

## Project Overview

**Urban All-in-1 Radio** is a UK urban music station with:
- A static website (HTML/CSS/JS)
- An AI DJ system that generates voice announcements
- Streaming via AzuraCast + Liquidsoap mixer

---

## Repository Structure

There are **TWO separate Git repositories** in this workspace:

### 1. Website Repository
| Property | Value |
|----------|-------|
| **Local Path** | `/Users/devadmin/urban-all-in-1-radio` |
| **GitHub** | `https://github.com/yhwh80/urban-all-in-1-radio.git` |
| **Contains** | Website files, docs, images |
| **Deploy** | Static hosting (auto-deploys on push) |

### 2. AI DJ Repository (nested inside website folder)
| Property | Value |
|----------|-------|
| **Local Path** | `/Users/devadmin/urban-all-in-1-radio/ai-dj-mixer` |
| **GitHub** | `https://github.com/yhwh80/ai-dj-server.git` |
| **Contains** | Python AI DJ code, Liquidsoap config |
| **Deploy** | Coolify (Docker) - requires manual redeploy |

> ⚠️ **Critical**: The `ai-dj-mixer` folder is a SEPARATE git repo. Always `cd` into it before running git commands for AI DJ changes.

---

## Key Files

### Website
- `website/index.html` - Desktop landing page
- `website/mobile/player.html` - Mobile player
- `website/js/player.js` - Player configuration (stream URL, metadata API)
- `website/images/` - Logos, favicons, OG images

### AI DJ
- `ai-dj-mixer/llm_dj_convex.py` - Main AI DJ script generator
- `ai-dj-mixer/liquidsoap.liq` - Audio mixing/ducking config
- `ai-dj-mixer/config.py` - Configuration settings

---

## How to Push Changes

### Website changes:
```bash
cd /Users/devadmin/urban-all-in-1-radio
git add .
git commit -m "Description of changes"
git push origin main
```

### AI DJ changes:
```bash
cd /Users/devadmin/urban-all-in-1-radio/ai-dj-mixer
git add .
git commit -m "Description of changes"
git push origin main
# Then: Redeploy in Coolify!
```

---

## Streaming Architecture

```
AzuraCast AutoDJ (music source)
    ↓
https://a7.asurahosting.com:6660/radio.mp3
    ↓
Liquidsoap Mixer (adds AI voice with ducking)
    ↓
https://stream.urbanallin1radio.co.uk/radio.mp3 (public stream)
```

**Metadata API**: `https://a7.asurahosting.com/api/nowplaying/urban_-_all_in_1_radio`

---

## AI DJ System

- Uses **Gemini** for script generation (OpenAI-compatible API)
- Uses **Gemini TTS** (Aoede voice) for free voice synthesis
- Prompts defined in `llm_dj_convex.py` lines 208-215
- Context types: `next_song`, `now_playing`, `time_check`, `station_id`, `weather`, `news`

---

## Common Tasks

### Add new DJ prompt type
1. Edit `ai-dj-mixer/llm_dj_convex.py`
2. Add to `prompts` dictionary (~line 208)
3. Add to `options` list (~line 200) if it should be auto-selected
4. Push to GitHub and redeploy in Coolify

### Update website stream URL
1. Edit `website/js/player.js` - update `CONFIG.streamUrl`
2. Also update mobile versions in `website/mobile/js/`
3. Push to GitHub

### Add Open Graph tags to new page
1. Copy the meta tag block from `website/index.html` (lines 4-30)
2. Update `og:url`, `og:title`, `og:description` for the new page
3. For mobile pages, use `../images/` paths for favicons

---

## Verification Commands

```bash
# Check which repo you're in
git remote -v

# Check for uncommitted changes
git status

# View recent commits
git log --oneline -5
```

