# 🔥 MASTER ZAPIER AUTOMATION SETUP GUIDE

## Overview
Complete automation system for Urban All-in-One Radio using Zapier.

---

## 📋 WHAT YOU'LL AUTOMATE

```
✅ Now Playing → Discord (every song)
✅ AI Host Announcements (10% of songs)
✅ Weekly Playlist Email (every Friday)
✅ New Signup Welcome (instant)
✅ Facebook Posts (optional)
✅ Contest Management (optional)
```

---

## 🛠️ PREREQUISITES

### 1. Zapier Account
```
✅ You already have this!
Plan: Starter/Professional/Team
Login: zapier.com
```

### 2. AzuraCast Access
```
✅ URL: https://a7.asurahosting.com
✅ Station ID: 546
✅ API Key: d32e677c71441ab0:72813a8356bb52b6eae1bf629660c4ee
```

### 3. Mailchimp Account (FREE)
```
Sign up: mailchimp.com
Plan: Free (up to 500 subscribers)
Create list: "Urban Radio Email List"
```

### 4. Discord Server (FREE)
```
Create server: discord.com
Create channels:
- #now-playing
- #new-subscribers
- #announcements
```

### 5. Your Server (for AI Host)
```
✅ Already built!
URL: https://your-server.com
Endpoints:
- /api/ai-host/announce
- /api/ai-host/listener-connected
```

---

## 🚀 SETUP ORDER

### STEP 1: Set Up Discord (5 mins)

1. Create Discord server
2. Create webhook:
   - Server Settings → Integrations → Webhooks
   - Create webhook for #now-playing
   - Copy webhook URL
   - Save for later

### STEP 2: Set Up Mailchimp (10 mins)

1. Sign up at mailchimp.com
2. Create audience/list:
   - Name: "Urban Radio Email List"
   - Default from email: your-email@domain.com
   - Default from name: "Urban All-in-One Radio"
3. Create signup form:
   - Audience → Signup forms → Embedded forms
   - Copy code
   - Add to your website

### STEP 3: Deploy Your Server (if not done)

```bash
# Make sure your server is running
cd /Users/devadmin/urban-all-in-1-radio
npm start

# Or deploy to Render/Heroku
# So Zapier can reach it
```

### STEP 4: Create Zaps (30 mins)

Follow these guides in order:
1. ✅ ZAP-1-now-playing-to-discord.md
2. ✅ ZAP-2-ai-host-smart-announcements.md
3. ✅ ZAP-3-weekly-playlist-email.md
4. ✅ ZAP-4-new-signup-welcome.md

### STEP 5: Configure AzuraCast Webhooks (5 mins)

1. Login to AzuraCast
2. Go to: Stations → Urban All-in-One Radio → Webhooks
3. Add webhook:
   - Name: "Zapier - Now Playing"
   - Triggers: ☑️ Song Change
   - URL: [from Zap 1]
   - Format: JSON
4. Test webhook
5. Save

---

## 📊 TASK USAGE CALCULATOR

### Zapier Plan Limits:
```
Starter: 750 tasks/month
Professional: 2,000 tasks/month
Team: 2,000 tasks/month
```

### Your Expected Usage:

**ZAP 1: Now Playing to Discord**
```
Songs per day: ~100
Tasks per song: 2 actions
Daily: 200 tasks
Monthly: ~6,000 tasks ❌ TOO MUCH!

SOLUTION: Add filter
- Only post every 3rd song
- Or only post certain genres
- Reduces to ~2,000 tasks/month ✅
```

**ZAP 2: AI Host Announcements**
```
Songs per day: ~100
Filter: 10% only
Announcements: ~10/day
Tasks per announcement: 5 actions
Daily: 50 tasks
Monthly: ~1,500 tasks ✅
```

**ZAP 3: Weekly Playlist**
```
Runs: Once per week
Tasks per run: 5 actions
Monthly: ~20 tasks ✅
```

**ZAP 4: New Signups**
```
Signups per day: ~10
Tasks per signup: 4 actions
Daily: 40 tasks
Monthly: ~1,200 tasks ✅
```

**TOTAL: ~4,720 tasks/month**

### Optimization for Starter Plan (750 tasks):
```
Option 1: Disable Zap 1 (Now Playing)
- Use only AI Host, Playlist, Signups
- Total: ~2,720 tasks/month
- Still too much!

Option 2: Reduce AI Host to 5%
- AI announcements: 5/day
- Total: ~3,970 tasks/month
- Still too much!

Option 3: Manual Discord posts
- Disable Zap 1
- Reduce AI Host to 5%
- Total: ~1,970 tasks/month
- Still too much!

RECOMMENDATION: Upgrade to Professional ($49/month)
- 2,000 tasks is enough
- Or reduce AI Host to 2-3% only
```

---

## 💰 TOTAL COST BREAKDOWN

```
Zapier Professional: $49/month
Mailchimp Free: $0/month (up to 500 subs)
Discord: $0/month
ElevenLabs Creator: $11/month
Your Server (Render): $0-7/month

TOTAL: $60-67/month

For FULL automation! 🔥
```

---

## 🎯 RECOMMENDED SETUP (BUDGET-FRIENDLY)

### If on Zapier Starter ($20/month):

**Keep These Zaps:**
```
✅ ZAP 3: Weekly Playlist (20 tasks/month)
✅ ZAP 4: New Signups (1,200 tasks/month)

Total: ~1,220 tasks/month
Fits in Starter plan! ✅
```

**Manual/Alternative:**
```
❌ ZAP 1: Post to Discord manually
   - Or use our free webhook (no Zapier)
   
❌ ZAP 2: Generate AI announcements manually
   - Run: node test-ai-host.js
   - Upload to AzuraCast yourself
```

### If on Zapier Professional ($49/month):

**Keep All Zaps:**
```
✅ ZAP 1: Now Playing (filtered to 2,000 tasks)
✅ ZAP 2: AI Host (1,500 tasks)
✅ ZAP 3: Weekly Playlist (20 tasks)
✅ ZAP 4: New Signups (1,200 tasks)

Total: ~4,720 tasks/month
Need to optimize Zap 1! ⚠️
```

**Optimization:**
```
ZAP 1 Filter Options:
1. Only post every 3rd song (reduces to 2,000)
2. Only post Afrobeats/Grime (reduces to 1,500)
3. Only post 8am-10pm (reduces to 1,800)

Pick one to fit in 2,000 task limit!
```

---

## 🔥 NEXT STEPS

1. ✅ Read each Zap guide
2. ✅ Set up Discord & Mailchimp
3. ✅ Create Zaps in order
4. ✅ Test each one
5. ✅ Monitor task usage
6. ✅ Optimize if needed
7. ✅ Go live! 🚀

---

## 📞 SUPPORT

If you get stuck:
- Check Zapier's task history
- Test each action individually
- Check webhook logs in AzuraCast
- Check server logs for AI Host

Let's build this! 🔥

