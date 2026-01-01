# AI DJ Announce - Supabase Edge Function

## 🎯 Purpose
Generates AI-powered DJ announcements using ElevenLabs and integrates with AzuraCast.

## 🚀 Deployment

### 1. Install Supabase CLI
```bash
brew install supabase/tap/supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link to Your Project
```bash
supabase link --project-ref your-project-ref
```

### 4. Set Environment Variables
In Supabase Dashboard → Edge Functions → Secrets:
- `ELEVENLABS_API_KEY` - Your ElevenLabs API key
- `AZURACAST_API_KEY` - Your AzuraCast API key
- `AZURACAST_URL` - Your AzuraCast URL (e.g., https://radio.example.com)
- `ELEVENLABS_VOICE_ID` - Voice ID (default: pNInz6obpgDQGcFmaJgB)

### 5. Deploy Function
```bash
supabase functions deploy ai-dj-announce
```

## 📡 API Usage

### Endpoint
```
POST https://your-project-ref.supabase.co/functions/v1/ai-dj-announce
```

### Headers
```
Authorization: Bearer YOUR_ANON_KEY
Content-Type: application/json
```

### Request Body
```json
{
  "type": "listener_connect",
  "context": {
    "listenerCount": 5,
    "currentTrack": "Urban Vibes Mix",
    "listenerLocation": "London",
    "timeOfDay": "20:30"
  }
}
```

### Response
```json
{
  "success": true,
  "announcementText": "Big up to our listeners from London!...",
  "audioBase64": "base64_encoded_audio_data",
  "filename": "ai-dj-1234567890.mp3",
  "uploadResult": {...},
  "context": {...}
}
```

## 🔧 Testing Locally

```bash
supabase functions serve ai-dj-announce
```

Then test with:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/ai-dj-announce' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"type":"listener_connect","context":{"listenerLocation":"London"}}'
```

## 💡 N8N Integration

Use HTTP Request node:
- Method: POST
- URL: `https://your-project-ref.supabase.co/functions/v1/ai-dj-announce`
- Authentication: Header Auth
  - Name: `Authorization`
  - Value: `Bearer YOUR_ANON_KEY`
- Body: JSON with type and context

## 🎤 Announcement Types

- `listener_connect` - When new listener joins
- `peak_hours` - During peak listening times
- `general` - General station IDs

## 📊 Features

✅ AI-generated announcements
✅ Location-based shoutouts
✅ Listener count mentions
✅ Current track integration
✅ Time-aware messaging
✅ Multiple voice templates
✅ AzuraCast integration ready
✅ Base64 audio response
✅ Error handling
✅ CORS enabled

## 🔐 Security

- API keys stored as Supabase secrets (encrypted)
- No keys in N8N (free tier compatible!)
- CORS configured for web access
- Bearer token authentication

