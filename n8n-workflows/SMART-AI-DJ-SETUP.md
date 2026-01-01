# 🎙️ Smart AI DJ - Voice Over Announcements Setup

This workflow makes your AI DJ talk OVER the music at the perfect moments, just like a real radio DJ!

## 🎯 What It Does

- **Monitors your stream** every 5 seconds
- **Detects perfect moments** to announce:
  - Song outros (last 10-15 seconds) - "That was..."
  - Song intros (first 15-30 seconds) - "Coming up next..."
  - Random moments (keeps it natural)
- **Generates AI voice** using ElevenLabs
- **Plays OVER the music** (not between tracks)

---

## 🚀 Setup Instructions

### Step 1: Import the Workflow

1. Open N8N: http://localhost:5678
2. Click **"Add workflow"** → **"Import from File"**
3. Select: `n8n-workflows/smart-ai-dj-announcements.json`

### Step 2: Configure the Function Node

1. Open the **"Detect Announcement Moment"** node
2. Delete the placeholder code
3. Copy ALL the code from `n8n-workflows/smart-announcement-detector.js`
4. Paste it into the function node
5. Click **"Execute Node"** to test

### Step 3: Test the Detection

1. Click **"Execute Workflow"** 
2. Check the output - it should show:
   ```json
   {
     "shouldAnnounce": true/false,
     "announcementType": "intro/outro/random",
     "reason": "Why it decided to announce",
     "currentSong": {...}
   }
   ```

### Step 4: Make Sure Local Server is Running

```bash
cd /Users/devadmin/urban-all-in-1-radio
npm start
```

The server should be running on http://localhost:3000

### Step 5: Activate the Workflow

1. Click the **toggle switch** at the top to activate
2. The workflow will now run every 5 seconds
3. Watch the executions panel for activity

---

## 🎵 How It Works

### Detection Logic

**OUTRO ANNOUNCEMENTS** (Last 10-15 seconds)
- Perfect for: "That was [Artist] with [Song]"
- Timing: When `remaining` time is 10-15 seconds

**INTRO ANNOUNCEMENTS** (First 15-30 seconds)
- Perfect for: "You're listening to Urban All-in-One Radio"
- Timing: When `elapsed` time is 15-30 seconds
- Only for Hip-Hop/Rap (songs with long intros)

**COOLDOWN PROTECTION**
- Won't announce more than once every 3 minutes
- Prevents being annoying

---

## 🔧 Customization

### Change Announcement Frequency

Edit the function node:

```javascript
// Line 52: Change cooldown period
const cooldownPeriod = 3 * 60 * 1000; // 3 minutes (change this)
```

### Change Timing Windows

```javascript
// Line 31: Outro timing
if (remaining >= 10 && remaining <= 15) {  // Change these numbers

// Line 38: Intro timing  
else if (elapsed >= 15 && elapsed <= 30) {  // Change these numbers
```

### Add More Announcement Types

```javascript
// Add after line 50:
else if (elapsed === 60) {  // Exactly 1 minute in
  shouldAnnounce = true;
  announcementType = 'mid-song';
  reason = 'Mid-song announcement';
}
```

---

## 🎙️ Announcement Types

The AI will generate different announcements based on timing:

- **`intro`** - Station IDs, greetings, "You're listening to..."
- **`outro`** - "That was...", artist/song info
- **`random`** - Time checks, shoutouts, general announcements

---

## 🐛 Troubleshooting

### No announcements playing?

1. Check N8N executions - are they running?
2. Check local server - is it running on port 3000?
3. Check AzuraCast - are files uploading?

### Too many announcements?

Increase the cooldown period (line 52 in function)

### Announcements at wrong time?

Adjust the timing windows (lines 31 and 38)

---

## 📊 Monitoring

Watch the N8N execution log to see:
- When announcements are triggered
- Why they were triggered
- What was generated
- Upload status

---

## 🎯 Next Steps

Once this is working, you can:
1. Add more announcement types
2. Integrate listener location data
3. Add weather/news announcements
4. Create time-based announcements (morning/evening)

---

**Ready to go live!** 🚀

