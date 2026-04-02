# AI DJ Mixer

Generates AI DJ announcements with instrumental beds and automatic audio ducking.

## What It Does

1. Gets the **next song** from AzuraCast metadata
2. Looks up **artist facts** from the knowledge base
3. Generates **AI voice** announcement via ElevenLabs
4. Mixes voice **over instrumental** with ducking (music goes quiet when DJ speaks)
5. Uploads to **AzuraCast jingles playlist**
6. **Queues it to play next** (before the upcoming song)

## Setup

### 1. Install Dependencies

```bash
cd ai-dj-mixer
pip install requests python-dotenv
```

### 2. Install FFmpeg (for audio mixing)

**Mac:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

### 3. Add Instrumentals

Put 3-5 instrumental MP3s in the `instrumentals/` folder:

```
ai-dj-mixer/
  instrumentals/
    chill-beat.mp3
    hype-beat.mp3
    smooth-rnb.mp3
    urban-vibe.mp3
    lo-fi-bed.mp3
```

**Tips for instrumentals:**
- 15-30 seconds long (or longer, script will trim)
- Chill/ambient vibes work best (not too busy)
- No vocals
- Royalty-free or licensed for broadcast

### 4. Customize Knowledge Base

Edit `knowledge_base.json` to add facts about artists you play:

```json
{
  "artists": {
    "Artist Name": [
      "Fact 1 about them",
      "Fact 2 about them",
      "Fact 3 about them"
    ]
  }
}
```

## Usage

### Test Mode (no upload)
```bash
python mixer.py --test
```
Creates a test jingle locally without uploading.

### Generate & Queue
```bash
python mixer.py
```
Generates jingle and queues it to play next.

### Generate & Add to Playlist Only
```bash
python mixer.py --no-queue
```
Adds to jingles playlist but doesn't force play next.

## n8n Integration

In your n8n workflow, replace the HTTP call to your server with:

```bash
cd /path/to/urban-all-in-1-radio/ai-dj-mixer && python mixer.py
```

Or call it via an HTTP endpoint if you wrap it in a Flask/FastAPI server.

## Configuration

Edit `config.py` to adjust:

- `JINGLE_LENGTH_SECONDS` - Target jingle length (default: 15)
- `DUCK_LEVEL_DB` - How much to lower music (default: -12dB)
- `VOICE_LEVEL_DB` - Voice volume adjustment (default: 0)
- `FADE_DURATION_MS` - Fade in/out duration (default: 500ms)
- `JINGLES_PLAYLIST_ID` - Your AzuraCast jingles playlist ID

## Troubleshooting

**"No instrumentals found"**
- Add .mp3 or .wav files to the `instrumentals/` folder

**"Upload failed"**
- Check your AzuraCast API key in .env
- Make sure the station ID is correct

**"File goes to Unassigned"**
- The script now waits 2 seconds for indexing before adding to playlist
- If still failing, increase the sleep time in `generate_jingle()`

**Voice only, no mixing**
- Make sure FFmpeg is installed: `ffmpeg -version`
- Check the instrumentals folder has valid audio files

## Files

```
ai-dj-mixer/
  config.py           # Settings
  mixer.py            # Main script
  knowledge_base.json # Artist facts
  instrumentals/      # Your instrumental beds
  output/             # Generated jingles (auto-created)
```
