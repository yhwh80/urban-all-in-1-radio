# 🎵 Urban - All in 1 Radio Website

**Modern, sleek, urban radio station landing page**

---

## ✨ Features

- ✅ **Modern Dark Theme** with neon cyan/magenta accents
- ✅ **Live Radio Player** with play/pause and volume control
- ✅ **Now Playing Display** (connects to AzuraCast API)
- ✅ **Animated Visualizer** that responds to playback
- ✅ **Fully Responsive** (mobile, tablet, desktop)
- ✅ **Smooth Animations** and hover effects
- ✅ **Schedule Section** showing your programming
- ✅ **About Section** with feature highlights

---

## 🚀 Quick Start

### 1. **Configure Your Stream**

Open `js/player.js` and update these lines:

```javascript
const CONFIG = {
    // Your AzuraCast stream URL
    streamUrl: 'https://your-azuracast-url.com/radio/8000/radio.mp3',
    
    // Your AzuraCast API endpoint
    nowPlayingUrl: 'https://your-azuracast-url.com/api/nowplaying/your-station',
    
    updateInterval: 10000 // Update every 10 seconds
};
```

### 2. **Test Locally**

Simply open `index.html` in your browser!

Or use a local server:
```bash
# Python
python3 -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

### 3. **Deploy**

Upload all files to your web hosting:
- **Netlify** (drag & drop)
- **Vercel** (connect to GitHub)
- **GitHub Pages** (free hosting)
- **Your own server** (via FTP/SSH)

---

## 📁 File Structure

```
website/
├── index.html          # Main page
├── css/
│   └── style.css       # All styles
├── js/
│   └── player.js       # Radio player logic
└── README.md           # This file
```

---

## 🎨 Customization

### **Change Colors**

Edit `css/style.css` - look for the `:root` section:

```css
:root {
    --bg-dark: #0a0a0f;           /* Background color */
    --bg-card: #1a1a2e;           /* Card backgrounds */
    --accent-primary: #00f5ff;    /* Cyan accent */
    --accent-secondary: #ff00ff;  /* Magenta accent */
    --text-primary: #ffffff;      /* Main text */
    --text-secondary: #b0b0b0;    /* Secondary text */
}
```

### **Change Station Name**

Edit `index.html` - find the logo section:

```html
<h1 class="logo">
    <span class="logo-urban">URBAN</span>
    <span class="logo-subtitle">All in 1 Radio</span>
</h1>
```

### **Update Schedule**

Edit `index.html` - find the schedule section and update times/shows:

```html
<div class="schedule-item">
    <div class="time">6AM - 12PM</div>
    <div class="show">Your Show Name</div>
    <div class="desc">Description</div>
</div>
```

### **Add Social Links**

Edit `index.html` - find the footer section:

```html
<div class="social-links">
    <a href="https://instagram.com/yourpage" aria-label="Instagram">📷</a>
    <a href="https://twitter.com/yourpage" aria-label="Twitter">🐦</a>
    <a href="https://discord.gg/yourserver" aria-label="Discord">💬</a>
</div>
```

---

## 🔧 AzuraCast Integration

### **Get Your Stream URL**

1. Log into AzuraCast
2. Go to your station
3. Click "Profile"
4. Copy the **Stream URL** (usually ends in `/radio.mp3`)

### **Get Your API Endpoint**

Format: `https://your-azuracast-domain.com/api/nowplaying/station-name`

Example: `https://radio.example.com/api/nowplaying/urban`

### **Test the API**

Visit your API URL in a browser - you should see JSON data like:

```json
{
  "now_playing": {
    "song": {
      "artist": "Artist Name",
      "title": "Track Title"
    }
  }
}
```

---

## 🎯 Next Steps

### **Phase 2B - Add More Pages:**
- News/Blog section
- Gaming hub
- Podcast archive
- Contact page

### **Phase 3 - Advanced Features:**
- User accounts
- Request system
- Chat integration
- Playlist voting

---

## 💡 Tips

- **Test on mobile** - Most listeners will be on phones!
- **Optimize images** - Keep file sizes small for fast loading
- **Add analytics** - Use Google Analytics or similar
- **SEO** - Add meta tags for better search visibility
- **Backup regularly** - Don't lose your files again! 😉

---

## 🆘 Troubleshooting

### **Player won't start:**
- Check stream URL is correct
- Check CORS settings in AzuraCast
- Open browser console for errors

### **Now Playing not updating:**
- Check API URL is correct
- Verify API is publicly accessible
- Check browser console for errors

### **Visualizer not animating:**
- Make sure player is actually playing
- Check CSS animations are enabled

---

## 📝 License

Free to use for your radio station!

---

**Built with ❤️ for Urban - All in 1 Radio**

