# 🆓 FREE ALTERNATIVE: Direct Webhooks (No Zapier Tasks)

## Overview
Save Zapier tasks by handling some automations directly on your server.

---

## 💡 THE PROBLEM

```
Zapier Starter: 750 tasks/month
Your needs: ~4,720 tasks/month

❌ Not enough tasks!
❌ Need to upgrade to Professional ($49/month)

OR

✅ Use FREE webhooks for high-volume tasks
✅ Save Zapier for complex workflows only
```

---

## 🎯 SOLUTION: HYBRID APPROACH

### Use Zapier For:
```
✅ Weekly Playlist Email (20 tasks/month)
✅ New Signup Welcome (1,200 tasks/month)
✅ AI Host Announcements (1,500 tasks/month)

Total: ~2,720 tasks/month
Fits in Professional plan! ✅
```

### Use FREE Webhooks For:
```
✅ Now Playing → Discord (0 Zapier tasks!)
✅ Now Playing → Facebook (0 Zapier tasks!)
✅ Song Tracking (0 Zapier tasks!)

Handled by your Node.js server!
```

---

## 🚀 HOW TO SET UP FREE WEBHOOKS

### STEP 1: Add Discord Webhook to Your Server

We already have the webhook endpoint, let's enhance it:

```javascript
// Add to server.js

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Webhook endpoint for AzuraCast
app.post('/webhook/now-playing', async (req, res) => {
    try {
        const { now_playing } = req.body;
        
        if (!now_playing || !now_playing.song) {
            return res.json({ success: false, error: 'No song data' });
        }
        
        const song = now_playing.song;
        const artist = song.artist || 'Unknown Artist';
        const title = song.title || 'Unknown Track';
        const album = song.album || '';
        const art = song.art || '';
        
        // Post to Discord
        if (DISCORD_WEBHOOK_URL) {
            await axios.post(DISCORD_WEBHOOK_URL, {
                embeds: [{
                    title: '🎵 NOW PLAYING',
                    description: `**${artist} - ${title}**`,
                    fields: [
                        { name: 'Album', value: album || 'N/A', inline: true },
                        { name: 'Genre', value: song.genre || 'N/A', inline: true }
                    ],
                    image: { url: art },
                    color: 0xFF6B00,
                    footer: {
                        text: 'Urban All-in-One Radio',
                        icon_url: 'https://your-logo-url.com/logo.png'
                    },
                    timestamp: new Date().toISOString()
                }]
            });
        }
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
```

### STEP 2: Add Discord Webhook URL to .env

```bash
# Add to .env file
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### STEP 3: Configure AzuraCast Webhook

```
1. Go to AzuraCast → Webhooks
2. Add new webhook:
   - Name: "Direct - Now Playing"
   - Trigger: Song Change
   - URL: https://your-server.com/webhook/now-playing
   - Format: JSON
3. Save & Test
```

---

## 📊 TASK SAVINGS

### Before (All Zapier):
```
Now Playing: 6,000 tasks/month
AI Host: 1,500 tasks/month
Weekly Email: 20 tasks/month
New Signups: 1,200 tasks/month

TOTAL: 8,720 tasks/month
Cost: $49/month (Professional) + need optimization
```

### After (Hybrid):
```
Now Playing: 0 tasks (FREE webhook!)
AI Host: 1,500 tasks/month (Zapier)
Weekly Email: 20 tasks/month (Zapier)
New Signups: 1,200 tasks/month (Zapier)

TOTAL: 2,720 tasks/month
Cost: $49/month (Professional) - no optimization needed!
```

---

## 🔥 BONUS: Add Facebook Auto-Posting (FREE)

### Add to webhook endpoint:

```javascript
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

// In the webhook handler, add:

// Post to Facebook
if (FACEBOOK_PAGE_ID && FACEBOOK_ACCESS_TOKEN) {
    await axios.post(
        `https://graph.facebook.com/${FACEBOOK_PAGE_ID}/feed`,
        {
            message: `🎵 Now Playing: ${artist} - ${title}\n\n🎧 Listen live: https://a7.asurahosting.com:6660/radio.mp3`,
            link: 'https://a7.asurahosting.com:6660/radio.mp3'
        },
        {
            params: {
                access_token: FACEBOOK_ACCESS_TOKEN
            }
        }
    );
}
```

### Get Facebook Access Token:

```
1. Go to: developers.facebook.com
2. Create app (Business type)
3. Add Facebook Login product
4. Get Page Access Token
5. Add to .env
```

---

## 🎯 COMPLETE HYBRID SETUP

### Your Server Handles (FREE):
```
✅ Now Playing → Discord
✅ Now Playing → Facebook
✅ Song tracking to database
✅ Listener location detection

Cost: $0 (runs on your server)
Zapier tasks: 0
```

### Zapier Handles (PAID):
```
✅ AI Host announcements (complex logic)
✅ Weekly playlist email (scheduled)
✅ New signup welcome (Mailchimp integration)
✅ Contest management (Google Sheets)

Cost: $49/month
Zapier tasks: ~2,720/month
```

---

## 💰 FINAL COST COMPARISON

### Option 1: All Zapier
```
Zapier Professional: $49/month
Tasks needed: ~8,720/month
Problem: Need to heavily optimize ❌
```

### Option 2: Hybrid (Recommended)
```
Zapier Professional: $49/month
Tasks needed: ~2,720/month
Your server: $0-7/month (Render)
Problem: None! ✅

TOTAL: $49-56/month
```

### Option 3: All Manual
```
Zapier: $0/month
Your server: $0-7/month
Problem: You do everything manually ❌
```

---

## 🚀 IMPLEMENTATION STEPS

1. ✅ Add webhook endpoint to server.js
2. ✅ Add Discord webhook URL to .env
3. ✅ Deploy your server (Render/Heroku)
4. ✅ Configure AzuraCast webhook
5. ✅ Test Discord posting
6. ✅ (Optional) Add Facebook posting
7. ✅ Use Zapier only for complex workflows

---

## 📝 SUMMARY

```
HIGH-VOLUME TASKS → Your Server (FREE)
- Now Playing posts
- Simple webhooks
- Real-time updates

COMPLEX WORKFLOWS → Zapier (PAID)
- AI Host logic
- Email campaigns
- Multi-step automations

RESULT:
✅ Save Zapier tasks
✅ Lower costs
✅ More control
✅ Best of both worlds!
```

---

## 🔥 READY TO IMPLEMENT?

Want me to:
1. Add the webhook code to your server.js
2. Help you get Discord webhook URL
3. Set up Facebook integration
4. Deploy to Render

Let's do it! 🚀

