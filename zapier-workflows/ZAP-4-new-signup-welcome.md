# ZAP 4: New Signup Welcome & DJ Mix Delivery

## Overview
When someone signs up, instantly send welcome email with exclusive DJ mix download.

---

## Zapier Setup

### TRIGGER: Mailchimp
```
App: Mailchimp
Event: New Subscriber

Setup:
1. Connect Mailchimp
2. Select your list: "Urban Radio Email List"
3. Test trigger
```

---

## ACTION 1: Send Welcome Email

```
App: Gmail (or Mailchimp)
Event: Send Email

To: {{email}}
Subject: 🎉 Welcome to Urban All-in-One Radio!

Body (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #FF6B00; }
        .box { background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .cta { background: #FF6B00; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🎉 Welcome to Urban All-in-One Radio!</h1>
    
    <p>Hey {{first_name | default: "there"}}!</p>
    
    <p>Thanks for signing up! You're now part of the UK's hottest urban music community.</p>
    
    <div class="box">
        <h2>🎁 Here's What You Get:</h2>
        <ul>
            <li>✅ <strong>Weekly Top 20 Playlist</strong> - Every Friday in your inbox</li>
            <li>✅ <strong>Exclusive 60-Min DJ Mix</strong> - Download below!</li>
            <li>✅ <strong>Contest Entries</strong> - Win concert tickets monthly</li>
        </ul>
    </div>
    
    <h2>🎧 Download Your Exclusive DJ Mix</h2>
    <p>This 60-minute mix features the best UK urban tracks and is NOT available anywhere else!</p>
    
    <a href="https://your-dropbox-link.com/dj-mix.mp3" class="cta">
        📥 Download DJ Mix (60 mins)
    </a>
    
    <h2>🎵 Listen Live Now</h2>
    <p>We're playing non-stop heat right now!</p>
    
    <a href="https://a7.asurahosting.com:6660/radio.mp3" class="cta">
        🎧 Listen Live
    </a>
    
    <p>Your first weekly playlist arrives this Friday at 9am!</p>
    
    <p>Big up!</p>
    <p><strong>Urban All-in-One Radio</strong><br>
    UK's #1 Urban Music Station</p>
    
    <hr>
    <p style="font-size: 12px; color: #999;">
        You're receiving this because you signed up at urban-radio.com<br>
        <a href="*|UNSUB|*">Unsubscribe</a> | <a href="*|UPDATE_PROFILE|*">Update preferences</a>
    </p>
</body>
</html>
```

---

## ACTION 2: Add to Google Sheets (Tracking)

```
App: Google Sheets
Event: Create Spreadsheet Row

Setup:
1. Connect Google account
2. Select spreadsheet: "Email Subscribers"
3. Select worksheet: "All Signups"

Row Data:
- Email: {{email}}
- Name: {{first_name}} {{last_name}}
- Signup Date: {{zap_meta_human_now}}
- Source: Website
- Status: Active
```

---

## ACTION 3: Post to Discord (Team Notification)

```
App: Discord
Event: Send Channel Message

Channel: #new-subscribers

Message:
🎉 **NEW SUBSCRIBER!**

Email: {{email}}
Name: {{first_name}} {{last_name}}
Signed up: {{zap_meta_human_now}}

Total subscribers: {{subscriber_count}}

Welcome email sent! ✅
```

---

## ACTION 4: Add to Contest Entries (Optional)

```
App: Google Sheets
Event: Create Spreadsheet Row

Spreadsheet: "Contest Entries"
Worksheet: "Current Month"

Row Data:
- Email: {{email}}
- Name: {{first_name}} {{last_name}}
- Entry Date: {{zap_meta_human_now}}
- Entry Method: Signup
```

---

## Expected Result

When someone signs up:
```
1. ✅ Instant welcome email
2. ✅ DJ mix download link
3. ✅ Added to tracking sheet
4. ✅ Team notified on Discord
5. ✅ Entered in contest
6. ✅ Will receive weekly playlist Friday

All happens in 5 seconds! ⚡
```

---

## Task Usage

- New signups per day: ~5-20
- Actions per signup: 4
- Tasks per month: ~600-2,400

Fits in Professional plan!

---

## Where to Host DJ Mix

### Option 1: Dropbox (FREE)
```
1. Upload DJ mix to Dropbox
2. Get shareable link
3. Use in email

Pros: Free, easy
Cons: Limited bandwidth on free tier
```

### Option 2: Google Drive (FREE)
```
1. Upload to Google Drive
2. Set to "Anyone with link can view"
3. Get shareable link

Pros: Free, unlimited bandwidth
Cons: Requires Google account
```

### Option 3: Your Server (FREE)
```
1. Upload to your server
2. Link: https://your-server.com/downloads/dj-mix.mp3

Pros: Full control
Cons: Uses your bandwidth
```

### Option 4: SoundCloud (FREE)
```
1. Upload to SoundCloud
2. Enable downloads
3. Get embed link

Pros: Free, streaming + download
Cons: Public (anyone can find it)
```

**Recommendation: Google Drive (free + unlimited)**

---

## Personalization Tips

### Use Mailchimp Merge Tags:
```
{{first_name | default: "there"}}
- Shows first name if available
- Falls back to "there" if not

{{subscriber_count}}
- Shows total subscribers
- "Join 1,234 other fans!"

{{date_subscribed}}
- When they signed up
```

### A/B Test Subject Lines:
```
Version A: "🎉 Welcome! Here's Your Free DJ Mix"
Version B: "🎁 Your Exclusive 60-Min Mix is Ready"
Version C: "Welcome to UK's #1 Urban Radio 🔥"

Mailchimp will test and send the best one!
```

---

## Turn On Zap!

Test with your own email first! 🔥

