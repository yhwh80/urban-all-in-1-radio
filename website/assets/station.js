/* ---------------------------------------------------------------------------
   Single source of truth for everything that talks to the station.

   Previously the stream URL was hardcoded in six separate files. When the
   Coolify proxy died, every one of them had to be found and changed by hand,
   and the mobile pages drifted out of sync with the desktop ones. One object,
   one place.
   --------------------------------------------------------------------------- */
window.STATION = {
  name: 'Urban All in 1 Radio',
  site: 'https://urbanallin1radio.co.uk',
  stream: 'https://stream.urbanallin1radio.co.uk/listen/urban_all_in_1_radio/radio.mp3',
  nowPlaying: 'https://stream.urbanallin1radio.co.uk/api/nowplaying/urban_all_in_1_radio',
  news: 'https://hip-hummingbird-200.convex.site/news',
  pollMs: 10000,
};

/* Feed and API text is third-party input; it must never reach innerHTML raw. */
window.esc = function (v) {
  return String(v ?? '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};

/* A feed could supply javascript: — only http(s) is rendered. */
window.safeUrl = function (u) {
  try {
    var p = new URL(u);
    return (p.protocol === 'http:' || p.protocol === 'https:') ? p.href : '';
  } catch (e) { return ''; }
};

window.timeAgo = function (ts) {
  var mins = Math.floor((Date.now() - ts) / 60000);
  if (!ts || mins < 0) return 'Recent';
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  var days = Math.floor(hrs / 24);
  return days === 1 ? 'Yesterday' : days + 'd ago';
};
