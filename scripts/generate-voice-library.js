/**
 * Voice Library Generator
 * Generate ALL announcements ONCE and reuse them forever!
 * 
 * Run: node scripts/generate-voice-library.js
 */

const voiceGen = require('../services/voiceGenerator');
const fs = require('fs');
const path = require('path');

// Library configuration
const LIBRARY_DIR = path.join(__dirname, '../output/voice-library');
const CATALOG_FILE = path.join(LIBRARY_DIR, 'catalog.json');

// Create library directory structure
const CATEGORIES = {
    stationIds: path.join(LIBRARY_DIR, 'station-ids'),
    timeChecks: path.join(LIBRARY_DIR, 'time-checks'),
    shoutouts: path.join(LIBRARY_DIR, 'shoutouts'),
    fillers: path.join(LIBRARY_DIR, 'fillers'),
    news: path.join(LIBRARY_DIR, 'news')
};

// Create all directories
Object.values(CATEGORIES).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Announcement templates
const TEMPLATES = {
    stationIds: [
        "Urban All-in-One Radio. UK urban music.",
        "You're listening to Urban All-in-One Radio.",
        "This is Urban All-in-One Radio, bringing you the best in UK urban music.",
        "Urban All-in-One Radio. Non-stop heat.",
        "You're tuned to Urban All-in-One Radio.",
        "Urban All-in-One Radio. The home of UK urban.",
        "This is Urban All-in-One Radio. More music, less talk.",
        "Urban All-in-One Radio. Your number one for urban music.",
        "You're locked into Urban All-in-One Radio.",
        "Urban All-in-One Radio. UK's finest urban station."
    ],
    
    timeChecks: [
        // Generate for each hour (0-23)
        ...Array.from({ length: 24 }, (_, i) => {
            const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
            const period = i < 12 ? 'AM' : 'PM';
            return `It's ${hour} ${period} on Urban All-in-One Radio.`;
        })
    ],
    
    shoutouts: [
        "Big up to everyone listening in London.",
        "Big up to everyone listening in Birmingham.",
        "Big up to everyone listening in Manchester.",
        "Big up to everyone listening in Leeds.",
        "Big up to everyone listening in Bristol.",
        "Big up to everyone listening in Liverpool.",
        "Big up to everyone listening in Nottingham.",
        "Big up to everyone listening in Sheffield.",
        "Big up to everyone listening in Glasgow.",
        "Big up to everyone listening across the UK.",
        "Shoutout to all our listeners in London.",
        "Shoutout to all our listeners in Manchester.",
        "Sending love to everyone tuning in from Birmingham.",
        "Big vibes to all our listeners out there.",
        "Much love to everyone listening right now."
    ],
    
    fillers: [
        "More music coming up.",
        "Stay tuned for more heat.",
        "Non-stop UK urban music.",
        "Keep it locked.",
        "We'll be right back with more music.",
        "More bangers on the way.",
        "Coming up next, more of the best in UK urban.",
        "You're listening to the best in urban music.",
        "More fire tracks coming your way.",
        "Stay with us for more non-stop music."
    ]
};

// Catalog to track all generated files
let catalog = {
    generatedAt: new Date().toISOString(),
    totalFiles: 0,
    totalCharacters: 0,
    categories: {}
};

/**
 * Generate a single announcement and save it
 */
async function generateAndSave(text, category, filename) {
    const outputPath = path.join(CATEGORIES[category], filename);
    
    // Skip if already exists
    if (fs.existsSync(outputPath)) {
        console.log(`⏭️  Skipped (exists): ${filename}`);
        return { skipped: true, path: outputPath, text, characters: text.length };
    }
    
    try {
        console.log(`🎤 Generating: "${text}"`);
        await voiceGen.generateVoice(text, filename);
        
        // Move from temp location to library
        const tempPath = path.join(__dirname, '../output/voice', filename);
        if (fs.existsSync(tempPath)) {
            fs.renameSync(tempPath, outputPath);
        }
        
        console.log(`✅ Saved: ${filename}`);
        return { success: true, path: outputPath, text, characters: text.length };
        
    } catch (error) {
        console.error(`❌ Failed: ${filename}`, error.message);
        return { error: true, path: outputPath, text, characters: text.length };
    }
}

/**
 * Generate entire library
 */
async function generateLibrary() {
    console.log('🎤 VOICE LIBRARY GENERATOR');
    console.log('=' .repeat(50));
    console.log('This will generate ALL announcements ONCE.');
    console.log('You can then reuse them forever!\n');
    
    let totalCharacters = 0;
    let totalFiles = 0;
    
    // Generate Station IDs
    console.log('\n📻 Generating Station IDs...');
    catalog.categories.stationIds = [];
    for (let i = 0; i < TEMPLATES.stationIds.length; i++) {
        const text = TEMPLATES.stationIds[i];
        const filename = `station-id-${String(i + 1).padStart(2, '0')}.mp3`;
        const result = await generateAndSave(text, 'stationIds', filename);
        catalog.categories.stationIds.push(result);
        if (!result.skipped) totalCharacters += result.characters;
        if (result.success || result.skipped) totalFiles++;
    }
    
    // Generate Time Checks
    console.log('\n⏰ Generating Time Checks...');
    catalog.categories.timeChecks = [];
    for (let i = 0; i < TEMPLATES.timeChecks.length; i++) {
        const text = TEMPLATES.timeChecks[i];
        const hour = String(i).padStart(2, '0');
        const filename = `time-check-${hour}00.mp3`;
        const result = await generateAndSave(text, 'timeChecks', filename);
        catalog.categories.timeChecks.push(result);
        if (!result.skipped) totalCharacters += result.characters;
        if (result.success || result.skipped) totalFiles++;
    }
    
    // Generate Shoutouts
    console.log('\n📢 Generating Shoutouts...');
    catalog.categories.shoutouts = [];
    for (let i = 0; i < TEMPLATES.shoutouts.length; i++) {
        const text = TEMPLATES.shoutouts[i];
        const filename = `shoutout-${String(i + 1).padStart(2, '0')}.mp3`;
        const result = await generateAndSave(text, 'shoutouts', filename);
        catalog.categories.shoutouts.push(result);
        if (!result.skipped) totalCharacters += result.characters;
        if (result.success || result.skipped) totalFiles++;
    }

    // Generate Fillers
    console.log('\n🎵 Generating Fillers...');
    catalog.categories.fillers = [];
    for (let i = 0; i < TEMPLATES.fillers.length; i++) {
        const text = TEMPLATES.fillers[i];
        const filename = `filler-${String(i + 1).padStart(2, '0')}.mp3`;
        const result = await generateAndSave(text, 'fillers', filename);
        catalog.categories.fillers.push(result);
        if (!result.skipped) totalCharacters += result.characters;
        if (result.success || result.skipped) totalFiles++;
    }

    // Update catalog totals
    catalog.totalFiles = totalFiles;
    catalog.totalCharacters = totalCharacters;

    // Save catalog
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2));

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ LIBRARY GENERATION COMPLETE!');
    console.log('='.repeat(50));
    console.log(`📁 Total Files: ${totalFiles}`);
    console.log(`📝 Total Characters: ${totalCharacters.toLocaleString()}`);
    console.log(`💰 Cost: ~${(totalCharacters / 1000).toFixed(1)}k characters`);
    console.log(`📊 Remaining (30k limit): ${(30000 - totalCharacters).toLocaleString()} characters`);
    console.log(`\n📂 Library Location: ${LIBRARY_DIR}`);
    console.log(`📋 Catalog: ${CATALOG_FILE}`);
    console.log('\n🎉 You can now reuse these files FOREVER!');
    console.log('💡 Upload them to AzuraCast and schedule them to play automatically.');
}

// Run the generator
generateLibrary().catch(error => {
    console.error('❌ Library generation failed:', error);
    process.exit(1);
});

