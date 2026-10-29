/* ---------------------------------------------------------------------------
   Player + now-playing. Shared by every page; reads config from window.STATION
   so the stream URL exists in exactly one place.
   --------------------------------------------------------------------------- */
(function () {
    var audio = document.getElementById('radioStream');
    var playBtn = document.getElementById('playBtn');
    var playIcon = document.getElementById('playIcon');
    var volume = document.getElementById('volumeSlider');
    var viz = document.getElementById('visualizer');
    var playing = false;

    /* ---------- visualiser bars ---------- */
    if (viz) {
        for (var i = 0; i < 16; i++) {
            var b = document.createElement('span');
            b.className = 'bar';
            b.style.height = (18 + Math.random() * 42) + '%';
            viz.appendChild(b);
        }
    }

    /* ---------- playback ---------- */
    if (audio) {
        audio.src = window.STATION.stream;
        var saved = null;
        try { saved = localStorage.getItem('urbanRadioVolume'); } catch (e) { }
        audio.volume = saved !== null ? parseFloat(saved) : 0.7;
        if (volume) volume.value = audio.volume * 100;
    }

    function setPlaying(on) {
        playing = on;
        if (playIcon) playIcon.textContent = on ? 'pause' : 'play_arrow';
        if (viz) viz.classList.toggle('visualizer-idle', on);
        try { localStorage.setItem('urbanRadioPlaying', on ? 'true' : 'false'); } catch (e) { }
    }

    if (playBtn && audio) {
        playBtn.addEventListener('click', function () {
            if (playing) {
                audio.pause();
                setPlaying(false);
            } else {
                /* Re-assigning src forces a fresh connection. A live stream that
                   has been paused goes stale — resuming plays buffered audio
                   from minutes ago, or nothing at all. */
                audio.src = window.STATION.stream;
                audio.play().then(function () { setPlaying(true); })
                    .catch(function (e) { console.error('playback blocked:', e); });
            }
        });
    }

    if (volume && audio) {
        volume.addEventListener('input', function (e) {
            audio.volume = e.target.value / 100;
            try { localStorage.setItem('urbanRadioVolume', audio.volume); } catch (e2) { }
        });
    }

    /* ---------- marquee for titles too long to fit ---------- */
    function marquee(el) {
        if (!el || !el.parentElement) return;
        el.classList.remove('marquee-run');
        el.style.removeProperty('--shift');
        var over = el.scrollWidth - el.parentElement.clientWidth;
        if (over > 8) {
            el.style.setProperty('--shift', '-' + (over + 12) + 'px');
            el.classList.add('marquee-run');
        }
    }

    /* ---------- now playing ---------- */
    var elTitle = document.getElementById('trackTitle');
    var elArtist = document.getElementById('trackArtist');
    var elGenre = document.getElementById('genreBadge');
    var elArt = document.getElementById('art');
    var elArtFb = document.getElementById('artFallback');
    var elNextWrap = document.getElementById('nextWrap');
    var elNextText = document.getElementById('nextText');
    var elHistory = document.getElementById('history');
    var elDot = document.getElementById('liveDot');
    var elLabel = document.getElementById('liveLabel');
    var lastArt = null;

    function offline(isOff) {
        if (elDot) elDot.className = 'size-2 rounded-full ' + (isOff ? 'bg-white/30' : 'bg-primary animate-pulse');
        if (elLabel) {
            elLabel.textContent = isOff ? 'OFFLINE' : 'LIVE';
            elLabel.className = 'text-[11px] font-bold tracking-[0.12em] ' + (isOff ? 'text-white/40' : 'text-primary');
        }
    }

    function refresh() {
        fetch(window.STATION.nowPlaying, { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                offline(d.is_online === false);

                var np = d.now_playing || {};
                var song = np.song || {};

                if (elTitle) { elTitle.textContent = song.title || 'Unknown track'; marquee(elTitle); }
                if (elArtist) { elArtist.textContent = song.artist || ''; marquee(elArtist); }
                if (elGenre) elGenre.textContent = (np.playlist || 'LIVE').toUpperCase();

                var art = window.safeUrl(song.art);
                if (elArt && art && art !== lastArt) {
                    lastArt = art;
                    elArt.onload = function () {
                        elArt.style.opacity = 1;
                        if (elArtFb) elArtFb.style.opacity = 0;
                    };
                    elArt.onerror = function () {
                        elArt.style.opacity = 0;
                        if (elArtFb) elArtFb.style.opacity = 1;
                    };
                    elArt.src = art;
                }

                var nx = (d.playing_next || {}).song;
                if (elNextWrap) {
                    if (nx && nx.title) {
                        elNextText.textContent = (nx.artist ? nx.artist + ' — ' : '') + nx.title;
                        elNextWrap.classList.remove('hidden');
                        elNextWrap.classList.add('flex');
                    } else {
                        elNextWrap.classList.add('hidden');
                        elNextWrap.classList.remove('flex');
                    }
                }

                if (elHistory) {
                    var rows = (d.song_history || []).slice(0, 6).map(function (h) {
                        var s = h.song || {};
                        var a = window.safeUrl(s.art);
                        return '<div class="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-dark/60 p-2.5">' +
                            '<div class="size-11 shrink-0 overflow-hidden rounded-lg bg-white/5">' +
                            (a ? '<img src="' + window.esc(a) + '" alt="" class="size-full object-cover" ' +
                                'onerror="this.style.display=\'none\'">' : '') +
                            '</div><div class="min-w-0"><p class="truncate text-sm font-medium">' +
                            window.esc(s.title || 'Unknown') + '</p>' +
                            '<p class="truncate text-xs text-white/45">' + window.esc(s.artist || '') +
                            '</p></div></div>';
                    }).join('');
                    elHistory.innerHTML = rows || '<p class="text-sm text-white/30">Nothing logged yet.</p>';
                }
            })
            .catch(function () { /* transient — keep the last good render */ });
    }

    refresh();
    setInterval(refresh, window.STATION.pollMs);
    window.addEventListener('resize', function () { marquee(elTitle); marquee(elArtist); });
})();
