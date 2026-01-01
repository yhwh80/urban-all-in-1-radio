# 🎤 Voice Library System

## 📖 Overview

This system generates a **reusable library** of AI DJ announcements that you create **ONCE** and use **FOREVER**!

### ✅ Benefits:
- **Generate once, use forever** - No recurring API costs
- **Organized library** - Easy to find and manage
- **Smart catalog** - Track what you have
- **Cost-effective** - ~2,500 characters ONE TIME instead of 30,000/month

---

## 🚀 Quick Start

### Step 1: Generate Your Library

```bash
node scripts/generate-voice-library.js
```

This will create:
- **10 Station IDs** (different variations)
- **24 Time Checks** (one for each hour)
- **15 Shoutouts** (different cities)
- **10 Fillers** (generic announcements)

**Total: ~59 files using ~2,500 characters**

### Step 2: Check Your Library

```bash
ls -R output/voice-library/
```

You'll see:
```
output/voice-library/
├── catalog.json
├── station-ids/
│   ├── station-id-01.mp3
│   ├── station-id-02.mp3
│   └── ...
├── time-checks/
│   ├── time-check-0000.mp3 (12 AM)
│   ├── time-check-0100.mp3 (1 AM)
│   └── ...
├── shoutouts/
│   ├── shoutout-01.mp3
│   ├── shoutout-02.mp3
│   └── ...
└── fillers/
    ├── filler-01.mp3
    ├── filler-02.mp3
    └── ...
```

### Step 3: Upload to AzuraCast

1. Go to AzuraCast → Media
2. Create folders:
   - `DJ-Announcements/Station-IDs`
   - `DJ-Announcements/Time-Checks`
   - `DJ-Announcements/Shoutouts`
   - `DJ-Announcements/Fillers`
3. Upload the MP3 files to their respective folders

### Step 4: Schedule Them

Create playlists in AzuraCast:
- **Station IDs** - Play every 2 hours
- **Time Checks** - Play at the top of each hour
- **Shoutouts** - Play randomly 3-5 times per day
- **Fillers** - Play between songs

---

## 📊 What's Included

### 🎙️ Station IDs (10 variations)
```
1. "Urban All-in-One Radio. UK urban music."
2. "You're listening to Urban All-in-One Radio."
3. "This is Urban All-in-One Radio, bringing you the best in UK urban music."
... and 7 more!
```

### ⏰ Time Checks (24 hours)
```
12 AM: "It's 12 AM on Urban All-in-One Radio."
1 AM: "It's 1 AM on Urban All-in-One Radio."
... for every hour!
```

### 📢 Shoutouts (15 cities)
```
- London
- Birmingham
- Manchester
- Leeds
- Bristol
... and 10 more!
```

### 🎵 Fillers (10 variations)
```
1. "More music coming up."
2. "Stay tuned for more heat."
3. "Non-stop UK urban music."
... and 7 more!
```

---

## 💰 Cost Analysis

### One-Time Generation:
```
Total Files: 59
Total Characters: ~2,500
Cost: ONE TIME (not monthly!)
Remaining quota: 27,500 characters
```

### Monthly Savings:
```
Without library: 30,000 characters/month
With library: 500 characters/month (only new content)
Savings: 95% of your quota!
```

---

## 🔄 Re-running the Script

The script is **smart**:
- ✅ Skips files that already exist
- ✅ Only generates new files
- ✅ Updates the catalog

So you can safely run it again to add more announcements!

---

## 📝 Catalog File

The `catalog.json` file tracks everything:
```json
{
  "generatedAt": "2025-12-29T21:00:00.000Z",
  "totalFiles": 59,
  "totalCharacters": 2500,
  "categories": {
    "stationIds": [...],
    "timeChecks": [...],
    "shoutouts": [...],
    "fillers": [...]
  }
}
```

---

## 🎯 Next Steps

### Add More Announcements

Edit `scripts/generate-voice-library.js` and add to the templates:

```javascript
shoutouts: [
    "Big up to everyone listening in Newcastle.",
    "Shoutout to all our listeners in Cardiff.",
    // Add your own!
]
```

Then run the script again - it will only generate the new ones!

### Generate Dynamic Content

For things that change (news, now playing), use the regular voice generator:

```javascript
const voiceGen = require('./services/voiceGenerator');
await voiceGen.generateNewsAnnouncement('Breaking: New album drops today!');
```

---

## 🎉 You're Done!

You now have a **permanent library** of AI DJ announcements that you can use **forever** without any additional API costs!

Upload them to AzuraCast and let your AI DJ run 24/7! 🔥

