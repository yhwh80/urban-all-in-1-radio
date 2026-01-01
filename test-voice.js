/**
 * Test the AI DJ Voice Generator
 * Run: node test-voice.js
 */

const voiceGen = require('./services/voiceGenerator');

async function testVoiceGenerator() {
    console.log('🎤 Testing AI DJ Voice Generator...\n');

    try {
        // Test 1: Station ID
        console.log('1️⃣ Generating Station ID...');
        await voiceGen.generateStationID();
        console.log('');

        // Test 2: Now Playing
        console.log('2️⃣ Generating Now Playing...');
        await voiceGen.generateNowPlaying('Skepta', 'Shutdown');
        console.log('');

        // Test 3: Time Check
        console.log('3️⃣ Generating Time Check...');
        await voiceGen.generateTimeCheck();
        console.log('');

        // Test 4: Shoutout
        console.log('4️⃣ Generating Shoutout...');
        await voiceGen.generateShoutout('London');
        console.log('');

        // Test 5: Custom Announcement
        console.log('5️⃣ Generating Custom Announcement...');
        await voiceGen.generateCustom('You\'re listening to Urban All-in-One Radio. More music coming up.');
        console.log('');

        console.log('✅ All tests complete!');
        console.log('📁 Check the output/voice/ folder for generated audio files.');
        console.log('🎧 Play them to hear your AI DJ voice!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the tests
testVoiceGenerator();

