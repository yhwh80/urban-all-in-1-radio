# ZAP 2: AI Host Smart Announcements

## Overview
Randomly generate AI DJ announcements (5-10% of songs) with location-based shoutouts.

---

## Zapier Setup

### TRIGGER: Webhooks by Zapier
```
App: Webhooks by Zapier
Event: Catch Hook

Setup:
1. Use SAME webhook as ZAP 1
   OR create new webhook for separate control
2. Copy webhook URL
3. Add to AzuraCast webhooks
```

---

## ACTION 1: Filter (Only 10% of songs)

```
App: Filter by Zapier
Event: Only continue if...

Setup:
Use Zapier's built-in randomizer:

Condition:
- {{zap_meta_human_now}} mod 10 equals 0

This continues only ~10% of the time!
Saves tasks and prevents annoying listeners.
```

---

## ACTION 2: Get Current Listeners

```
App: Webhooks by Zapier
Event: GET Request

URL: https://a7.asurahosting.com/api/station/546/listeners
Method: GET
Headers:
- X-API-Key: d32e677c71441ab0:72813a8356bb52b6eae1bf629660c4ee

This gets list of current listeners with IP addresses.
```

---

## ACTION 3: Call AI Host API

```
App: Webhooks by Zapier
Event: POST Request

URL: https://your-server.com/api/ai-host/announce
Method: POST
Headers:
- Content-Type: application/json

Body (JSON):
{
  "type": "random",
  "listenerIP": "{{listeners__0__ip}}"
}

This generates smart announcement based on:
- Current listener location
- Time of day
- Now playing info
```

### Response Data:
```
{{text}} = "We've got a listener from London!"
{{audioPath}} = "/path/to/generated-audio.mp3"
{{location__city}} = "London"
```

---

## ACTION 4: Upload to AzuraCast (Optional)

```
App: Webhooks by Zapier
Event: POST Request

URL: https://a7.asurahosting.com/api/station/546/files
Method: POST
Headers:
- X-API-Key: d32e677c71441ab0:72813a8356bb52b6eae1bf629660c4ee
- Content-Type: multipart/form-data

Body:
- file: {{audioPath}}
- path: /DJ-Announcements/Live/

This uploads the generated announcement to AzuraCast.
```

---

## ACTION 5: Post to Discord (Notification)

```
App: Discord
Event: Send Channel Message

Channel: #dj-announcements (or #now-playing)

Message:
🎤 **AI DJ ANNOUNCEMENT**

"{{text}}"

Location: {{location__city}}, {{location__country}}
Generated: {{zap_meta_human_now}}

This lets you see what announcements are being generated!
```

---

## Expected Result

Every ~10 songs:
```
1. AI Host generates announcement:
   "We've got a listener from Manchester!"
   
2. Voice is generated via ElevenLabs

3. Audio file is created

4. (Optional) Uploaded to AzuraCast

5. Discord notification posted

6. You can manually queue it to play on air!
```

---

## Task Usage

- Songs per day: ~100
- AI announcements: ~10 per day (10%)
- Tasks per announcement: 5 actions
- Total tasks: ~50 per day = ~1,500/month

Perfect for Professional plan!

---

## Cost Breakdown

### Zapier Tasks:
- ~1,500 tasks/month
- Included in Professional plan ($49/month)

### ElevenLabs API:
- ~10 announcements/day = 300/month
- ~40 characters each = 12,000 characters/month
- Well within Creator plan (30,000 chars)
- Cost: $11/month

### Total: $60/month for full automation!

---

## Optional: Manual Queue Instead of Auto-Play

If you want to review before playing:

SKIP Action 4 (Upload to AzuraCast)

Instead:
1. AI generates announcement
2. Saves to your server
3. Discord notifies you
4. You manually upload/queue when ready

This gives you control while still automating generation!

---

## Turn On Zap!

Test thoroughly, then publish! 🔥

