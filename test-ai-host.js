/**
 * Test the Smart AI Host
 * Run: node test-ai-host.js
 */

const aiHost = require('./services/aiHost');
const geoLocation = require('./services/geoLocation');

async function testAIHost() {
    console.log('🎤 TESTING SMART AI HOST\n');
    console.log('=' .repeat(60));
    
    try {
        // Test 1: Location-based announcement
        console.log('\n1️⃣ Testing Location-Based Announcement...');
        console.log('Getting current listener locations...');
        const cities = await geoLocation.getListenerCities();
        console.log(`📍 Listeners from: ${cities.join(', ') || 'No listeners currently'}`);
        
        const locationAnnouncement = await aiHost.generateSmartAnnouncement('location');
        console.log(`🎤 Generated: "${locationAnnouncement.text}"`);
        console.log(`📁 Audio: ${locationAnnouncement.audioPath}`);
        
        // Test 2: Now Playing announcement
        console.log('\n2️⃣ Testing Now Playing Announcement...');
        const nowPlaying = await aiHost.getNowPlaying();
        if (nowPlaying && nowPlaying.now_playing) {
            const song = nowPlaying.now_playing.song;
            console.log(`🎵 Currently playing: ${song.artist} - ${song.title}`);
        }
        
        const nowPlayingAnnouncement = await aiHost.generateSmartAnnouncement('nowplaying');
        console.log(`🎤 Generated: "${nowPlayingAnnouncement.text}"`);
        console.log(`📁 Audio: ${nowPlayingAnnouncement.audioPath}`);
        
        // Test 3: Time-based announcement
        console.log('\n3️⃣ Testing Time-Based Announcement...');
        const timeAnnouncement = await aiHost.generateSmartAnnouncement('time');
        console.log(`🎤 Generated: "${timeAnnouncement.text}"`);
        console.log(`📁 Audio: ${timeAnnouncement.audioPath}`);
        
        // Test 4: Random announcement
        console.log('\n4️⃣ Testing Random Announcement...');
        const randomAnnouncement = await aiHost.generateSmartAnnouncement('random');
        console.log(`🎤 Generated: "${randomAnnouncement.text}"`);
        console.log(`📁 Audio: ${randomAnnouncement.audioPath}`);
        
        // Test 5: IP Geolocation
        console.log('\n5️⃣ Testing IP Geolocation...');
        const testIPs = [
            '8.8.8.8',           // Google DNS (US)
            '151.101.1.140',     // Reddit (US)
            '2.16.254.1'         // UK IP
        ];
        
        for (const ip of testIPs) {
            const location = await geoLocation.getLocationFromIP(ip);
            console.log(`📍 ${ip} → ${location.city}, ${location.country}`);
        }
        
        // Test 6: Should play logic
        console.log('\n6️⃣ Testing "Should Play" Logic...');
        let playCount = 0;
        const testRuns = 100;
        for (let i = 0; i < testRuns; i++) {
            if (aiHost.shouldPlayAnnouncement()) {
                playCount++;
            }
        }
        console.log(`📊 Out of ${testRuns} calls, would play ${playCount} times (~${playCount}%)`);
        console.log(`   This prevents being annoying!`);
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS COMPLETE!');
        console.log('\n📁 Check output/voice/ for generated audio files');
        console.log('🎧 Play them to hear your Smart AI Host!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the tests
testAIHost();

