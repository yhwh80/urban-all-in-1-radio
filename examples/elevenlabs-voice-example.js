// Example: How to use your cloned voice with ElevenLabs API
// This shows how to generate announcements in YOUR voice!

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Your ElevenLabs credentials from .env
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID; // Your cloned voice!

/**
 * Generate speech in YOUR cloned voice
 * @param {string} text - What you want your voice to say
 * @param {string} outputFile - Where to save the audio file
 */
async function generateVoiceAnnouncement(text, outputFile) {
  try {
    console.log(`Generating: "${text}"`);
    
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
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: parseFloat(process.env.ELEVENLABS_STABILITY) || 0.5,
          similarity_boost: parseFloat(process.env.ELEVENLABS_SIMILARITY) || 0.75
        }
      },
      responseType: 'arraybuffer'
    });

    // Save the audio file
    fs.writeFileSync(outputFile, response.data);
    console.log(`✅ Saved to: ${outputFile}`);
    
    return outputFile;
  } catch (error) {
    console.error('❌ Error generating voice:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// EXAMPLES - Try these!
// ============================================

async function runExamples() {
  console.log('🎤 Generating announcements in YOUR voice...\n');

  // Example 1: Station ID
  await generateVoiceAnnouncement(
    "Urban All-in-One Radio. UK urban music.",
    "output/station-id.mp3"
  );

  // Example 2: Song Introduction
  await generateVoiceAnnouncement(
    "Next up: Skepta - Shutdown.",
    "output/song-intro-skepta.mp3"
  );

  // Example 3: Time Check
  const currentTime = new Date().toLocaleTimeString('en-GB', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  await generateVoiceAnnouncement(
    `It's ${currentTime} on Urban All-in-One Radio.`,
    "output/time-check.mp3"
  );

  // Example 4: Shoutout
  await generateVoiceAnnouncement(
    "Big up to everyone listening in London.",
    "output/shoutout-london.mp3"
  );

  // Example 5: News Announcement (from Perplexity)
  await generateVoiceAnnouncement(
    "Breaking news: Stormzy just announced a new album dropping next month.",
    "output/news-announcement.mp3"
  );

  // Example 6: Generic Filler
  await generateVoiceAnnouncement(
    "You're listening to Urban All-in-One Radio. More music coming up.",
    "output/generic-filler.mp3"
  );

  console.log('\n✅ All announcements generated!');
  console.log('Check the output/ folder for the audio files.');
}

// ============================================
// DYNAMIC ANNOUNCEMENT GENERATOR
// ============================================

/**
 * Generate a song introduction announcement
 */
async function generateSongIntro(artist, song) {
  const text = `Next up: ${artist} - ${song}.`;
  const filename = `output/intro-${artist.toLowerCase().replace(/\s+/g, '-')}.mp3`;
  return await generateVoiceAnnouncement(text, filename);
}

/**
 * Generate a time check announcement
 */
async function generateTimeCheck() {
  const time = new Date().toLocaleTimeString('en-GB', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const text = `It's ${time} on Urban All-in-One Radio.`;
  const filename = `output/time-check-${Date.now()}.mp3`;
  return await generateVoiceAnnouncement(text, filename);
}

/**
 * Generate a news announcement from Perplexity data
 */
async function generateNewsAnnouncement(newsText) {
  const filename = `output/news-${Date.now()}.mp3`;
  return await generateVoiceAnnouncement(newsText, filename);
}

// ============================================
// RUN IT!
// ============================================

// Create output directory if it doesn't exist
if (!fs.existsSync('output')) {
  fs.mkdirSync('output');
}

// Run examples
runExamples().catch(console.error);

// Export functions for use in other files
module.exports = {
  generateVoiceAnnouncement,
  generateSongIntro,
  generateTimeCheck,
  generateNewsAnnouncement
};

