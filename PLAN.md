# Urban - All in 1 Radio 🎵
## Master Project Plan

---

## 🎯 PROJECT VISION

**"Urban - All in 1 Radio"** is a complete media ecosystem combining:
- 24/7 Radio streaming with automated DJ mixing
- News hub covering music industry, urban culture, tech, and gaming
- Spiritual podcast series with modern takes on wisdom
- Multiplayer gaming hub (Solitaire, Pool, Spades)
- AI assistant (future) trained on all content

---

## 📋 PROJECT PHASES

### **PHASE 1: Radio Foundation** 🎵
**Goal:** Get radio streaming with smart mixing

#### Approach: Smart Hybrid (AI-Assisted + Manual Control)

**You do:**
- Set cue in/out points on tracks (where to start/end mixing)
- Tag tracks with BPM (AI can detect this!)
- Organize playlists by genre/energy

**AI does:**
- Detect BPM automatically
- Suggest cue points
- Choose intelligent track order
- Mix smoothly using your cue points

#### Phase 1A: Proof of Concept (CURRENT) ✅
- [x] Build BPM detection tool
- [ ] Test with 5-10 sample tracks
- [ ] Verify BPM accuracy
- [ ] Check suggested cue points
- [ ] Decide: Continue with AI or stick to manual pre-mixing

#### Phase 1B: Simple Setup (If POC works)
- [ ] Upload tracks to AzuraCast
- [ ] Use BPM detector on full library
- [ ] Set cue points (AI-suggested or manual)
- [ ] Configure AzuraCast crossfading (8-12 sec for house)
- [ ] Create playlists by genre/BPM range
- [ ] Schedule playlists by time of day
- [ ] Test and go LIVE!

#### Phase 1C: Advanced (Optional - Later)
- [ ] Build smart playlist generator (AI chooses track order)
- [ ] Harmonic mixing (key detection)
- [ ] Energy flow analysis
- [ ] Pre-mix special sets in Virtual DJ for peak hours

#### Tech Stack:
- AzuraCast (managed by Asura Hosting)
- Python + librosa (BPM detection)
- Liquidsoap (smart crossfading - built into AzuraCast)
- Virtual DJ (optional - for pre-mixing special sets)

---

### **PHASE 2: Landing Page & Player** 🌐
**Goal:** Create modern website with live radio player

#### Tasks:
- [ ] Design wireframe/mockup
- [ ] Choose color scheme (dark theme with urban vibe)
- [ ] Build HTML/CSS structure
- [ ] Implement radio player (HTML5 Audio or Howler.js)
- [ ] Integrate AzuraCast API for metadata (track names)
- [ ] Real-time "Now Playing" display
- [ ] Responsive design (mobile-friendly)
- [ ] Add social media links

#### Tech Stack:
- HTML5, CSS3, JavaScript
- Tailwind CSS or Bootstrap
- AzuraCast API
- Socket.io (for real-time updates)

---

### **PHASE 3: Content Hub** 📰
**Goal:** News sections + Spiritual podcast area

#### 3A: News Hub
Topics: Music Industry, Urban Culture, Tech, Gaming

- [ ] Design news section layout
- [ ] Create content categories
- [ ] Set up CMS or static content system
- [ ] Embed latest articles/posts
- [ ] RSS feed integration (optional)

#### 3B: Spiritual Podcast Section
- [ ] Design podcast player/gallery
- [ ] YouTube video embed area
- [ ] Episode list with descriptions
- [ ] Transcript display (optional)

#### Content Workflow:
1. Research YouTube videos on spiritual topics
2. Use NotebookLLM to analyze and extract key points
3. Create script outline (under 10 min)
4. Refine script with AI assistance
5. Generate video with HeyGen (podcast studio style)
6. Upload to YouTube
7. Embed on website

---

### **PHASE 4: Gaming Hub** 🎮
**Goal:** Multiplayer games for community engagement

#### Tasks:
- [ ] Choose approach: Build from scratch vs embed existing games
- [ ] Set up game framework (Phaser.js, PixiJS, or embed)
- [ ] Implement Solitaire
- [ ] Implement Pool
- [ ] Implement Spades
- [ ] Add multiplayer functionality (Socket.io)
- [ ] User accounts/leaderboards (optional)
- [ ] Chat feature for players

#### Tech Stack:
- Phaser.js or PixiJS (game engine)
- Socket.io (multiplayer)
- Node.js backend
- Or embed existing games initially

---

### **PHASE 5: YouTube Integration** 📺
**Goal:** Showcase latest videos from your channel

#### Tasks:
- [ ] Create YouTube channel
- [ ] Set up YouTube API access
- [ ] Build video gallery on website
- [ ] Auto-update latest videos
- [ ] Embed video player
- [ ] Playlist organization

---

### **PHASE 6: Branding & Design** 🎨
**Goal:** Professional look and feel

#### Tasks:
- [ ] Create logo (Canva, Fiverr, or AI tools)
- [ ] Define color palette
- [ ] Choose typography
- [ ] Design graphics/banners
- [ ] Create favicon
- [ ] Social media graphics

#### Design Direction:
- Modern urban aesthetic
- Dark theme with neon/vibrant accents
- Clean, no clutter
- Mobile-first approach

---

### **PHASE 7: AI Assistant** 🤖 *(Future Phase)*
**Goal:** Intelligent chatbot trained on your content

#### Tasks:
- [ ] Collect all content (podcasts, articles, track data)
- [ ] Set up vector database (Pinecone/Weaviate)
- [ ] Train AI on your content (RAG approach)
- [ ] Build chat interface
- [ ] Embed chat widget on website
- [ ] Define AI personality (urban, spiritual, helpful)
- [ ] Test and refine responses

#### Features:
- Answer questions about radio, music, content
- Guide users around website
- Music recommendations
- Game help
- Content discovery

#### Tech Stack:
- OpenAI API or Claude API
- Vector database (Pinecone, Weaviate, or Supabase)
- RAG (Retrieval Augmented Generation)
- Chat widget (custom or Intercom-style)

---

### **PHASE 8: E-Commerce (Clothing Brand)** 👕 *(Future Phase)*
**Goal:** Sell your clothing brand merchandise

#### IMPORTANT - Legal Protection FIRST:
- [ ] **Trademark/Copyright your brand name** (BEFORE launching!)
  - Research existing trademarks (USPTO.gov or UK IPO)
  - File trademark application
  - Wait for approval (can take 6-12 months)
  - Protect logo, brand name, slogans

#### E-Commerce Tasks:
- [ ] Choose platform (Shopify, WooCommerce, custom)
- [ ] Design product pages
- [ ] Set up payment processing (Stripe, PayPal)
- [ ] Inventory management
- [ ] Shipping integration
- [ ] Product photography
- [ ] Size charts and descriptions
- [ ] Shopping cart integration on website

#### Integration with Radio Site:
- [ ] "Shop" section in main navigation
- [ ] Featured products on homepage
- [ ] Merch announcements during radio shows
- [ ] Exclusive drops for radio listeners
- [ ] Bundle deals (radio + merch)

#### Tech Stack:
- Shopify (easiest) or WooCommerce (WordPress)
- Stripe/PayPal for payments
- Printful/Printify (print-on-demand option)
- Or custom with Node.js + Stripe

#### Legal Checklist:
- [ ] Trademark registration
- [ ] Business license
- [ ] Terms & Conditions
- [ ] Privacy Policy
- [ ] Return/Refund policy
- [ ] Tax registration (if required)

---

## 🛠️ TECH STACK SUMMARY

### Frontend:
- HTML5, CSS3, JavaScript
- Tailwind CSS or Bootstrap
- Socket.io (real-time)
- Phaser.js/PixiJS (games)

### Backend:
- Node.js + Express
- AzuraCast API
- YouTube API
- Socket.io server

### Streaming:
- AzuraCast (Shoutcast)
- Virtual DJ
- Automation scripts (Python/Bash)

### Content Creation:
- NotebookLLM (analysis)
- HeyGen (video generation)
- YouTube (hosting)

### Future AI:
- OpenAI/Claude API
- Vector database
- RAG system

---

## 📅 RECOMMENDED TIMELINE

**Month 1:** Phase 1 (Radio) + Phase 2 (Landing Page)
**Month 2:** Phase 3 (Content Hub) + Phase 6 (Branding)
**Month 3:** Phase 4 (Gaming Hub) + Phase 5 (YouTube)
**Month 4+:** Phase 7 (AI Assistant)
**Month 6+:** Phase 8 (E-Commerce) - *Start trademark process early!*

---

## 🚀 NEXT IMMEDIATE STEPS

1. ✅ Finalize color scheme and design direction
2. ✅ Set up Virtual DJ streaming to AzuraCast
3. ✅ Create basic landing page with player
4. ✅ Design logo
5. ✅ Build automation script for Virtual DJ

---

## 📝 NOTES

- Start simple, iterate and improve
- Test each phase before moving to next
- Collect user feedback early
- Document everything
- Have fun building! 🎉

---

**Project Location:** `/Users/devadmin/urban-all-in-1-radio`
**Created:** December 11, 2024

