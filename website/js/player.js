// ===================================
// URBAN RADIO // DIRECTOR'S CUT
// ===================================

const CONFIG = {
	streamUrl: 'https://stream.urbanallin1radio.co.uk/radio.mp3',
	nowPlayingUrl: 'https://stream.urbanallin1radio.co.uk/status-json.xsl',
	updateInterval: 10000,
	particleCount: 200,
	connectionRadius: 100,
	mouseRadius: 150
};

// DOM Elements
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const radioStream = document.getElementById('radioStream');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const connectionStatus = document.getElementById('connectionStatus');
const statusDot = document.querySelector('.status-dot');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const volumeSlider = document.getElementById('volumeSlider');
const volValue = document.getElementById('volValue');
const centerHint = document.querySelector('.hud-center-hint');

// State
let isPlaying = false;
let particles = [];
let animationId;
let mouse = { x: null, y: null };
let audioContext, analyser, dataArray, source;
let audioInitialized = false;

// Resize Canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}
window.addEventListener('resize', resize);

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.baseColor = '#00f5ff';
        this.color = this.baseColor;
    }

    update(audioData) {
        // Basic movement
        this.x += this.vx;
        this.y += this.vy;

        // Audio reactivity (speed boost)
        if (audioData) {
            const boost = audioData / 255; // 0 to 1
            this.x += this.vx * boost * 5;
            this.y += this.vy * boost * 5;
        }

        // Mouse interaction
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONFIG.mouseRadius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (CONFIG.mouseRadius - distance) / CONFIG.mouseRadius;
                const directionX = forceDirectionX * force * 5;
                const directionY = forceDirectionY * force * 5;

                this.x -= directionX;
                this.y -= directionY;
            }
        }

        // Screen wrap
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push(new Particle());
    }
}

const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');

const navSchedule = document.getElementById('navSchedule');
const navDiscover = document.getElementById('navDiscover');
const navNews = document.getElementById('navNews');

const scheduleOverlay = document.getElementById('scheduleOverlay');
const closeScheduleBtn = document.getElementById('closeScheduleBtn');

const discoverOverlay = document.getElementById('discoverOverlay');
const closeDiscoverBtn = document.getElementById('closeDiscoverBtn');

// Toggle Menu Dropdown
function toggleMenu() {
    menuDropdown.classList.toggle('active');
}

// Close Menu
function closeMenu() {
    menuDropdown.classList.remove('active');
}

// Toggle Overlays
function showSchedule() {
    closeMenu();
    discoverOverlay.classList.remove('active');
    scheduleOverlay.classList.add('active');
}

function showDiscover() {
    closeMenu();
    scheduleOverlay.classList.remove('active');
    discoverOverlay.classList.add('active');
}

function closeAllOverlays() {
    scheduleOverlay.classList.remove('active');
    discoverOverlay.classList.remove('active');
}

// Event Listeners
if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (menuDropdown && menuDropdown.classList.contains('active')) {
        if (!menuDropdown.contains(e.target) && e.target !== menuBtn) {
            closeMenu();
        }
    }
});

if (navSchedule) navSchedule.addEventListener('click', showSchedule);
if (navDiscover) navDiscover.addEventListener('click', showDiscover);
if (navNews) navNews.addEventListener('click', () => window.location.href = 'news.html');

if (closeScheduleBtn) closeScheduleBtn.addEventListener('click', closeAllOverlays);
if (closeDiscoverBtn) closeDiscoverBtn.addEventListener('click', closeAllOverlays);

// Close on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllOverlays();
        closeMenu();
    }
});

// Schedule Auto-Highlight
function updateScheduleHighlight() {
    const now = new Date();
    const hour = now.getHours();
    const items = document.querySelectorAll('.schedule-item');

    items.forEach(item => {
        const start = parseInt(item.dataset.start);
        const end = parseInt(item.dataset.end);

        item.classList.remove('active');

        // Handle normal ranges (e.g., 6-12) and crossing midnight (e.g., 18-6)
        if (start < end) {
            if (hour >= start && hour < end) {
                item.classList.add('active');
            }
        } else {
            // Crosses midnight (e.g., 18 to 6)
            if (hour >= start || hour < end) {
                item.classList.add('active');
            }
        }
    });
}

// Update on load and every minute
updateScheduleHighlight();
setInterval(updateScheduleHighlight, 60000);

// Audio Context Setup (Must be user triggered)
function initAudioContext() {
    if (audioInitialized) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    // Connect audio element to analyser
    source = audioContext.createMediaElementSource(radioStream);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    audioInitialized = true;
}

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get audio data if playing
    let audioValue = 0;
    if (isPlaying && audioInitialized) {
        analyser.getByteFrequencyData(dataArray);
        // Calculate average volume for reactivity
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        audioValue = sum / dataArray.length;
    }

    // Update and draw particles
    particles.forEach(p => {
        p.update(audioValue);
        p.draw();
    });

    // Draw connections
    connectParticles(audioValue);

    animationId = requestAnimationFrame(animate);
}

function connectParticles(audioValue) {
    let opacityValue = 1;
    let maxDist = CONFIG.connectionRadius;

    // Increase connection distance on beat
    if (audioValue > 0) {
        maxDist += audioValue / 2;
    }

    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDist) {
                opacityValue = 1 - (distance / maxDist);
                ctx.strokeStyle = `rgba(0, 245, 255, ${opacityValue * 0.5})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

// Player Logic
function togglePlay() {
    if (!audioInitialized) {
        initAudioContext();
        // Resume context if suspended (browser policy)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    // If currently playing, pause the stream and show a clear paused state
    if (isPlaying) {
        radioStream.pause();
        playIcon.textContent = '▶';
        connectionStatus.textContent = 'PAUSED';
        statusDot.classList.remove('active');
        playBtn.classList.remove('pulse');
        centerHint.style.display = 'block';
        centerHint.querySelector('span').textContent = 'SYSTEM_PAUSED – PRESS PLAY TO RESUME';
        isPlaying = false;
        localStorage.setItem('urbanRadioPlaying', 'false');
        return;
    }

    // If currently paused/stopped, try to start playback and handle errors
    radioStream
        .play()
        .then(() => {
            playIcon.textContent = '⏸';
            connectionStatus.textContent = 'LIVE_SIGNAL';
            playBtn.classList.remove('pulse');
            statusDot.classList.add('active');
            centerHint.style.display = 'none';
            isPlaying = true;
            localStorage.setItem('urbanRadioPlaying', 'true');
        })
        .catch((e) => {
            console.error('Error starting stream playback:', e);
            playIcon.textContent = '▶';
            connectionStatus.textContent = 'CONNECTION_ERROR';
            statusDot.classList.remove('active');
            playBtn.classList.remove('pulse');
            centerHint.style.display = 'block';
            centerHint.querySelector('span').textContent = 'UNABLE_TO_CONNECT – TRY AGAIN';
            isPlaying = false;
            localStorage.setItem('urbanRadioPlaying', 'false');
        });
}

// Event Listeners
playBtn.addEventListener('click', togglePlay);

volumeSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    radioStream.volume = val / 100;
    volValue.textContent = `${val}%`;
    localStorage.setItem('urbanRadioVolume', radioStream.volume);
});

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Now Playing
async function fetchNowPlaying() {
    try {
        const response = await fetch(CONFIG.nowPlayingUrl);
        const data = await response.json();

        // Icecast format: icestats.source.title contains "Artist - Title"
        if (data && data.icestats && data.icestats.source) {
            const source = data.icestats.source;
            const title = source.title || '';

            // Split "Artist - Title" format
            if (title.includes(' - ')) {
                const parts = title.split(' - ');
                trackArtist.textContent = parts[0].trim();
                trackTitle.textContent = parts.slice(1).join(' - ').trim();
            } else {
                trackTitle.textContent = title;
                trackArtist.textContent = '';
            }
        }
    } catch (e) {
        console.error('Error fetching now playing:', e);
    }
}
setInterval(fetchNowPlaying, CONFIG.updateInterval);

// Init
radioStream.src = CONFIG.streamUrl;

// Restore volume from localStorage or default to 0.7
const savedVolume = localStorage.getItem('urbanRadioVolume');
radioStream.volume = savedVolume ? parseFloat(savedVolume) : 0.7;
volumeSlider.value = radioStream.volume * 100;
volValue.textContent = `${Math.round(radioStream.volume * 100)}%`;

resize();
initParticles();
animate();
fetchNowPlaying();

// Auto-resume if was playing before
if (localStorage.getItem('urbanRadioPlaying') === 'true') {
    // Small delay to ensure everything is loaded
    setTimeout(() => togglePlay(), 500);
} else {
    // Add pulse animation to play button to draw attention on first load
    playBtn.classList.add('pulse');
}
