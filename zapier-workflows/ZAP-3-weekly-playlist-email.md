# ZAP 3: Automated Weekly Playlist Email

## Overview
Every Friday at 9am, automatically send top 20 tracks to your email list.

---

## Zapier Setup

### TRIGGER: Schedule by Zapier
```
App: Schedule by Zapier
Event: Every Week

Setup:
- Day: Friday
- Time: 9:00 AM
- Timezone: Europe/London
```

---

## ACTION 1: Get Now Playing History

```
App: Webhooks by Zapier
Event: GET Request

URL: https://a7.asurahosting.com/api/station/546/history
Method: GET
Query Parameters:
- start: {{7 days ago timestamp}}
- end: {{now timestamp}}

This gets all songs played in the last 7 days.
```

---

## ACTION 2: Format Data with Code (Python)

```
App: Code by Zapier
Event: Run Python

Input Data:
- history: {{history from Action 1}}

Code:
```python
# Count song plays
from collections import Counter

songs = input_data['history']
song_counts = Counter()

for song in songs:
    artist = song.get('song', {}).get('artist', 'Unknown')
    title = song.get('song', {}).get('title', 'Unknown')
    key = f"{artist} - {title}"
    song_counts[key] += 1

# Get top 20
top_20 = song_counts.most_common(20)

# Format as list
playlist = []
for i, (song, count) in enumerate(top_20, 1):
    playlist.append(f"{i}. {song}")

output = {
    'playlist_text': '\n'.join(playlist),
    'top_20': top_20
}
```

Output:
```
{{playlist_text}} = 
"1. Skepta - Shutdown
2. Dave - Starlight
3. Central Cee - Doja
..."
```

---

## ACTION 3: Create Beautiful Email HTML

```
App: Formatter by Zapier
Event: Text
Transform: Replace

Input: {{playlist_text}}
Find: \n
Replace: <br>

This converts line breaks to HTML.
```

---

## ACTION 4: Send via Mailchimp

```
App: Mailchimp
Event: Send Campaign

Setup:
1. Connect Mailchimp account
2. Select your list
3. Create campaign

Campaign Settings:
- Subject: 🔥 This Week's Top 20 UK Urban Tracks
- Preview: The hottest tracks from Urban All-in-One Radio
- From Name: Urban All-in-One Radio
- From Email: your-email@domain.com

Email Content (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
        h1 { color: #FF6B00; }
        .track { padding: 10px; border-bottom: 1px solid #eee; }
        .cta { background: #FF6B00; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🔥 This Week's Top 20 UK Urban Tracks</h1>
    
    <p>Hey there!</p>
    
    <p>Here are the hottest tracks we played this week on Urban All-in-One Radio:</p>
    
    <div class="playlist">
        {{playlist_text}}
    </div>
    
    <a href="https://a7.asurahosting.com:6660/radio.mp3" class="cta">
        🎧 Listen Live Now
    </a>
    
    <p>See you next Friday!</p>
    <p><strong>Urban All-in-One Radio</strong><br>
    UK's #1 Urban Music Station</p>
    
    <p style="font-size: 12px; color: #999;">
        Don't want these emails? <a href="*|UNSUB|*">Unsubscribe</a>
    </p>
</body>
</html>
```

---

## ACTION 5: Post to Discord (Notification)

```
App: Discord
Event: Send Channel Message

Channel: #announcements

Message:
📧 **WEEKLY PLAYLIST SENT!**

Sent to {{subscriber_count}} subscribers

Top 3 tracks this week:
{{top_20__0}}
{{top_20__1}}
{{top_20__2}}

Check your inbox! 🔥
```

---

## Expected Result

Every Friday at 9am:
```
1. Zapier gets last 7 days of songs
2. Counts which were played most
3. Creates top 20 list
4. Formats beautiful email
5. Sends to entire Mailchimp list
6. Posts notification to Discord

✅ FULLY AUTOMATED!
```

---

## Task Usage

- Runs: Once per week (Friday)
- Actions: 5 per run
- Tasks per month: ~20 tasks

Very efficient! Leaves plenty of tasks for other Zaps.

---

## Alternative: Use Google Sheets

If you want more control:

### Modified Workflow:

**ZAP 3A: Track Songs Daily**
```
TRIGGER: Song Change (from AzuraCast)
ACTION: Add row to Google Sheets
- Sheet: "Song History"
- Columns: Artist, Title, Timestamp, Genre

Tasks: ~100/day = 3,000/month
```

**ZAP 3B: Weekly Email**
```
TRIGGER: Schedule (Friday 9am)
ACTION 1: Get Google Sheets data (last 7 days)
ACTION 2: Count & sort in Code by Zapier
ACTION 3: Send via Mailchimp

Tasks: ~5/week = 20/month
```

**Total: ~3,020 tasks/month**
(Needs Professional plan or higher)

---

## Mailchimp Free Tier Limits

```
FREE:
✅ Up to 500 subscribers
✅ 1,000 sends per month
✅ Basic templates

If you have:
- 100 subscribers = 400 sends/month (4 emails each)
- 500 subscribers = 2,000 sends/month (4 emails each)

You'll need paid plan when you hit 500 subscribers!
```

---

## Turn On Zap!

Test with a small list first, then go live! 🔥

