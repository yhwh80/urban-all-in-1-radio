/**
 * N8N Function Node: Smart Announcement Detector - TESTING VERSION
 * 
 * This version triggers MORE OFTEN for testing purposes
 * Use this to see the system working, then switch back to the normal version
 */

// Get the now playing data from previous node
const nowPlaying = $input.item.json;

// Extract song info
const song = nowPlaying.now_playing;
const elapsed = song.elapsed || 0;
const duration = song.duration || 0;
const remaining = duration - elapsed;

// Song details
const artist = song.song.artist || 'Unknown';
const title = song.song.title || 'Unknown';
const genre = song.song.genre || '';

// ============================================
// TESTING MODE - TRIGGERS MORE OFTEN
// ============================================

let shouldAnnounce = false;
let announcementType = '';
let announcementTiming = '';
let reason = '';

// 1. OUTRO DETECTION (Last 60 seconds instead of 10-15)
// TESTING: Much wider window to catch announcements
if (remaining >= 10 && remaining <= 60) {
  shouldAnnounce = true;
  announcementType = 'outro';
  announcementTiming = 'end';
  reason = `TESTING: Song ending in ${remaining} seconds - outro announcement`;
}

// 2. INTRO DETECTION (First 60 seconds instead of 15-30)
// TESTING: Wider window and works for ALL genres
else if (elapsed >= 10 && elapsed <= 60) {
  shouldAnnounce = true;
  announcementType = 'intro';
  announcementTiming = 'start';
  reason = `TESTING: Song at ${elapsed} seconds - intro announcement`;
}

// 3. RANDOM ANNOUNCEMENT (50% chance instead of 5%)
// TESTING: Much higher chance
else if (Math.random() < 0.5) {
  shouldAnnounce = true;
  announcementType = 'random';
  announcementTiming = 'middle';
  reason = 'TESTING: Random announcement (50% chance)';
}

// ============================================
// TESTING: NO COOLDOWN - Always announce when detected
// ============================================

// In testing mode, we always announce when we detect a moment
// No cooldown applied

// ============================================
// OUTPUT
// ============================================

return {
  json: {
    shouldAnnounce: shouldAnnounce,
    announcementType: announcementType,
    announcementTiming: announcementTiming,
    reason: reason,
    
    // Song info for announcement generation
    currentSong: {
      artist: artist,
      title: title,
      genre: genre,
      elapsed: elapsed,
      duration: duration,
      remaining: remaining
    },
    
    // Timing info
    timing: {
      elapsed: elapsed,
      remaining: remaining,
      duration: duration,
      percentage: Math.round((elapsed / duration) * 100)
    },
    
    // Debug info
    debug: {
      testingMode: true,
      message: 'TESTING VERSION - Triggers much more often!'
    }
  }
};

