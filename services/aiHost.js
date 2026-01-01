require('dotenv').config();
const axios = require('axios');
const voiceGen = require('./voiceGenerator');
const geoLocation = require('./geoLocation');

/**
 * Smart AI Host
 * Generates contextual, intelligent announcements
 */

const AZURACAST_BASE_URL = process.env.AZURACAST_BASE_URL;
const AZURACAST_API_KEY = process.env.AZURACAST_API_KEY;
const AZURACAST_STATION_ID = process.env.AZURACAST_STATION_ID;

/**
 * Get current playing song from AzuraCast
 */
async function getNowPlaying() {
    try {
        const response = await axios.get(
            `${AZURACAST_BASE_URL}/api/nowplaying/${AZURACAST_STATION_ID}`
        );
        return response.data;
    } catch (error) {
        console.error('Error getting now playing:', error.message);
        return null;
    }
}

/**
 * Generate contextual announcement based on current state
 * @param {string} type - Type of announcement (location, nowplaying, time, random)
 * @returns {Promise<object>} - { text, audioPath }
 */
async function generateSmartAnnouncement(type = 'random') {
    const nowPlaying = await getNowPlaying();
    const currentHour = new Date().getHours();
    
    let text = '';
    
    switch (type) {
        case 'location':
            text = await generateLocationAnnouncement();
            break;
            
        case 'nowplaying':
            text = await generateNowPlayingAnnouncement(nowPlaying);
            break;
            
        case 'time':
            text = generateTimeAnnouncement(currentHour);
            break;
            
        case 'random':
        default:
            // Randomly choose announcement type
            const types = ['location', 'nowplaying', 'time', 'generic'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            return await generateSmartAnnouncement(randomType);
    }
    
    // Generate voice
    const filename = `ai-host-${Date.now()}.mp3`;
    const audioPath = await voiceGen.generateVoice(text, filename);
    
    return { text, audioPath };
}

/**
 * Generate location-based announcement
 */
async function generateLocationAnnouncement() {
    const cities = await geoLocation.getListenerCities();
    
    if (cities.length === 0) {
        const generic = [
            "Big up to everyone listening right now!",
            "Much love to all our listeners out there!",
            "Thanks for tuning in to Urban All-in-One Radio!"
        ];
        return generic[Math.floor(Math.random() * generic.length)];
    }
    
    if (cities.length === 1) {
        const templates = [
            `We've got a listener tuning in from ${cities[0]} right now!`,
            `Shoutout to our listener in ${cities[0]}!`,
            `Big up to ${cities[0]}!`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }
    
    if (cities.length === 2) {
        return `Shoutout to our listeners in ${cities[0]} and ${cities[1]}!`;
    }
    
    // Multiple cities
    const lastCity = cities.pop();
    const citiesList = cities.slice(0, 3).join(', '); // Limit to 3 cities
    return `Big up to listeners in ${citiesList}, and ${lastCity}!`;
}

/**
 * Generate now playing announcement
 */
async function generateNowPlayingAnnouncement(nowPlaying) {
    if (!nowPlaying || !nowPlaying.now_playing) {
        return "More heat coming up next!";
    }
    
    const song = nowPlaying.now_playing.song;
    const artist = song.artist || 'Unknown Artist';
    const title = song.title || 'Unknown Track';
    
    const templates = [
        `That was ${artist} with ${title}.`,
        `You just heard ${title} by ${artist}.`,
        `${artist}, ${title}. More music coming up.`,
        `That was ${artist}. Stay tuned for more heat.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Generate time-based announcement
 */
function generateTimeAnnouncement(hour) {
    const time = new Date().toLocaleTimeString('en-GB', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    let greeting = '';
    if (hour >= 5 && hour < 12) {
        greeting = 'Good morning!';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'Good afternoon!';
    } else if (hour >= 17 && hour < 22) {
        greeting = 'Good evening!';
    } else {
        greeting = 'Late night vibes!';
    }
    
    const templates = [
        `${greeting} It's ${time} on Urban All-in-One Radio.`,
        `It's ${time}. ${greeting}`,
        `${greeting} The time is ${time}.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Should we play an announcement now?
 * Smart logic to avoid being annoying
 * @returns {boolean}
 */
function shouldPlayAnnouncement() {
    // Play announcement 10% of the time (1 in 10 calls)
    return Math.random() < 0.1;
}

module.exports = {
    generateSmartAnnouncement,
    getNowPlaying,
    shouldPlayAnnouncement
};

