/**
 * N8N Function Node: Smart Announcement Detector
 * 
 * This detects the perfect moments to play announcements:
 * - During song outros (last 10-15 seconds)
 * - During song intros (first 15-30 seconds if instrumental)
 * 
 * Paste this into an N8N "Function" node
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
// SMART DETECTION LOGIC
// ============================================

let shouldAnnounce = false;
let announcementType = '';
let announcementTiming = '';
let reason = '';

// 1. OUTRO DETECTION (Last 10-15 seconds of song)
if (remaining >= 10 && remaining <= 15) {
  shouldAnnounce = true;
  announcementType = 'outro';
  announcementTiming = 'end';
  reason = `Song ending in ${remaining} seconds - perfect for outro announcement`;
}

// 2. INTRO DETECTION (First 15-30 seconds of song)
// Only if we haven't announced recently
else if (elapsed >= 15 && elapsed <= 30) {
  // Check if this is likely an instrumental intro
  // Hip-hop/rap songs often have long intros
  const hasLongIntro = genre.toLowerCase().includes('hip hop') || 
                       genre.toLowerCase().includes('rap') ||
                       genre.toLowerCase().includes('urban');
  
  if (hasLongIntro) {
    shouldAnnounce = true;
    announcementType = 'intro';
    announcementTiming = 'start';
    reason = `Song has been playing for ${elapsed} seconds - likely instrumental intro`;
  }
}

// 3. RANDOM ANNOUNCEMENT (Every 5-10 songs)
// Add a random chance to keep it natural
else if (Math.random() < 0.05) { // 5% chance
  shouldAnnounce = true;
  announcementType = 'random';
  announcementTiming = 'middle';
  reason = 'Random announcement to keep engagement';
}

// ============================================
// COOLDOWN LOGIC (Prevent too many announcements)
// ============================================

// Use random chance instead of static data for cooldown
// This gives approximately 1 announcement every 3 minutes
// (5 second interval × 36 checks = 3 minutes, so 1/36 = ~2.8% chance)
if (shouldAnnounce) {
  const randomChance = Math.random();
  if (randomChance > 0.028) { // Only ~2.8% of detections will actually announce
    shouldAnnounce = false;
    reason = `Cooldown skip - random chance to prevent too many announcements`;
  }
}

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
      randomChanceUsed: true,
      approximateFrequency: '~1 announcement every 3 minutes'
    }
  }
};

