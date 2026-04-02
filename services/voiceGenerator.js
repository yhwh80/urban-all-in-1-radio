require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * AI DJ Voice Generator
 * Generates announcements using Chatterbox TTS (local, free)
 * Falls back to ElevenLabs if Chatterbox is unavailable
 */

// Chatterbox (primary - free, local)
const CHATTERBOX_URL = process.env.CHATTERBOX_URL || 'http://localhost:4123';

// ElevenLabs (fallback - paid)
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const ELEVENLABS_STABILITY = parseFloat(process.env.ELEVENLABS_STABILITY) || 0.5;
const ELEVENLABS_SIMILARITY = parseFloat(process.env.ELEVENLABS_SIMILARITY) || 0.75;
const ELEVENLABS_STYLE = parseFloat(process.env.ELEVENLABS_STYLE) || 0.5;
const ELEVENLABS_SPEAKER_BOOST = process.env.ELEVENLABS_SPEAKER_BOOST === 'true';

// Output directory for generated audio
const OUTPUT_DIR = path.join(__dirname, '../output/voice');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate speech using Chatterbox TTS (local, free)
 */
async function generateWithChatterbox(text, outputPath, options = {}) {
    const response = await axios({
        method: 'POST',
        url: `${CHATTERBOX_URL}/v1/audio/speech`,
        headers: { 'Content-Type': 'application/json' },
        data: {
            input: text,
            voice: 'default',
            response_format: 'wav',
            exaggeration: options.exaggeration || 0.5,
            cfg_weight: options.cfg_weight || 0.5,
            temperature: options.temperature || 0.8
        },
        responseType: 'arraybuffer',
        timeout: 120000
    });

    fs.writeFileSync(outputPath, response.data);
    return outputPath;
}

/**
 * Generate speech using ElevenLabs (paid fallback)
 */
async function generateWithElevenLabs(text, outputPath, options = {}) {
    const response = await axios({
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
        },
        data: {
            text: text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
                stability: options.stability || ELEVENLABS_STABILITY,
                similarity_boost: options.similarity || ELEVENLABS_SIMILARITY,
                style: options.style || ELEVENLABS_STYLE,
                use_speaker_boost: options.speakerBoost !== undefined ? options.speakerBoost : ELEVENLABS_SPEAKER_BOOST
            }
        },
        responseType: 'arraybuffer'
    });

    fs.writeFileSync(outputPath, response.data);
    return outputPath;
}

/**
 * Generate speech from text — tries Chatterbox first, falls back to ElevenLabs
 * @param {string} text - Text to convert to speech
 * @param {string} filename - Output filename (without path)
 * @param {object} options - Optional voice settings override
 * @returns {Promise<string>} - Path to generated audio file
 */
async function generateVoice(text, filename, options = {}) {
    const outputPath = path.join(OUTPUT_DIR, filename);

    try {
        console.log(`🎤 Generating (Chatterbox): "${text}"`);
        await generateWithChatterbox(text, outputPath, options);
        console.log(`✅ Saved (Chatterbox): ${filename}`);
        return outputPath;
    } catch (chatterboxError) {
        console.warn(`⚠️ Chatterbox unavailable: ${chatterboxError.message}`);

        if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
            throw new Error('Chatterbox unavailable and ElevenLabs not configured');
        }

        try {
            console.log(`🎤 Falling back to ElevenLabs: "${text}"`);
            await generateWithElevenLabs(text, outputPath, options);
            console.log(`✅ Saved (ElevenLabs fallback): ${filename}`);
            return outputPath;
        } catch (elevenLabsError) {
            console.error('❌ Both TTS engines failed');
            throw elevenLabsError;
        }
    }
}

/**
 * Generate a "Now Playing" announcement
 * @param {string} artist - Artist name
 * @param {string} song - Song title
 * @returns {Promise<string>} - Path to audio file
 */
async function generateNowPlaying(artist, song) {
    const text = `Next up: ${artist} - ${song}.`;
    const filename = `now-playing-${Date.now()}.mp3`;
    return await generateVoice(text, filename);
}

/**
 * Generate a station ID announcement
 * @returns {Promise<string>} - Path to audio file
 */
async function generateStationID() {
    const text = "Urban All-in-One Radio. UK urban music.";
    const filename = `station-id-${Date.now()}.mp3`;
    return await generateVoice(text, filename, {
        stability: 0.7, // More consistent for station IDs
        similarity: 0.85
    });
}

/**
 * Generate a time check announcement
 * @returns {Promise<string>} - Path to audio file
 */
async function generateTimeCheck() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    const text = `It's ${time} on Urban All-in-One Radio.`;
    const filename = `time-check-${Date.now()}.mp3`;
    return await generateVoice(text, filename);
}

/**
 * Generate a shoutout announcement
 * @param {string} location - City/location to shout out
 * @returns {Promise<string>} - Path to audio file
 */
async function generateShoutout(location = 'across the UK') {
    const text = `Big up to everyone listening in ${location}.`;
    const filename = `shoutout-${Date.now()}.mp3`;
    return await generateVoice(text, filename);
}

/**
 * Generate a news announcement
 * @param {string} headline - News headline
 * @returns {Promise<string>} - Path to audio file
 */
async function generateNewsAnnouncement(headline) {
    const text = `Breaking news: ${headline}`;
    const filename = `news-${Date.now()}.mp3`;
    return await generateVoice(text, filename);
}

/**
 * Generate a custom announcement
 * @param {string} text - Custom text to announce
 * @returns {Promise<string>} - Path to audio file
 */
async function generateCustom(text) {
    const filename = `custom-${Date.now()}.mp3`;
    return await generateVoice(text, filename);
}

module.exports = {
    generateVoice,
    generateNowPlaying,
    generateStationID,
    generateTimeCheck,
    generateShoutout,
    generateNewsAnnouncement,
    generateCustom
};

