# ZAP 1: Auto-Post Now Playing to Discord

## Overview
Every time a song changes on AzuraCast, automatically post to Discord with album art.

---

## Zapier Setup

### TRIGGER: Webhooks by Zapier
```
App: Webhooks by Zapier
Event: Catch Hook

Setup:
1. Click "Continue"
2. Copy the webhook URL (looks like: https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/)
3. Save this URL - we'll add it to AzuraCast
```

### TEST TRIGGER:
```
1. Go to AzuraCast → Webhooks
2. Create new webhook:
   - Name: "Zapier - Now Playing"
   - Trigger: Song Change
   - URL: [paste Zapier webhook URL]
   - Format: JSON
3. Click "Test" in AzuraCast
4. Go back to Zapier
5. Click "Test trigger"
6. You should see song data!
```

---

## ACTION 1: Get Now Playing Info from AzuraCast API

```
App: Webhooks by Zapier
Event: GET Request

Setup:
URL: https://a7.asurahosting.com/api/nowplaying/546
Method: GET
Headers: (leave empty - public API)

This gets full song info including album art!
```

### Map Data:
```
Artist: {{now_playing__song__artist}}
Title: {{now_playing__song__title}}
Album: {{now_playing__song__album}}
Album Art: {{now_playing__song__art}}
Genre: {{now_playing__song__genre}}
```

---

## ACTION 2: Post to Discord

```
App: Discord
Event: Send Channel Message

Setup:
1. Connect your Discord account
2. Choose your server
3. Choose channel (e.g., #now-playing)

Message:
🎵 **NOW PLAYING**

**{{Artist}} - {{Title}}**

Genre: {{Genre}}
Album: {{Album}}

🎧 Listen live: https://a7.asurahosting.com:6660/radio.mp3

Image URL: {{Album Art}}
```

---

## Expected Result

Every song change:
```
Discord post appears:
┌─────────────────────────────────────┐
│ 🎵 NOW PLAYING                      │
│                                     │
│ Skepta - Shutdown                   │
│                                     │
│ Genre: Grime                        │
│ Album: Konnichiwa                   │
│                                     │
│ 🎧 Listen live: [link]              │
│                                     │
│ [Album Art Image]                   │
└─────────────────────────────────────┘
```

---

## Task Usage

- Songs per day: ~50-100
- Tasks per month: ~1,500-3,000
- Zapier plan needed: Professional ($49/month)

If on Starter plan (750 tasks):
- Limit to 25 posts per day
- Add Filter: Only post every 2nd or 3rd song

---

## Optional Enhancements

### Add Filter (Save Tasks):
```
Between Action 1 and 2, add:

App: Filter by Zapier
Condition: 
- Only continue if Genre contains "Grime" OR "Afrobeats" OR "UK Rap"
- This filters out non-urban tracks
- Saves tasks!
```

### Add Formatter:
```
App: Formatter by Zapier
Event: Text
Transform: Truncate
Field: {{Title}}
Max Length: 50

This prevents super long titles breaking the format
```

---

## Turn On Zap!

Once tested, click "Publish" and your Zap is LIVE! 🔥

