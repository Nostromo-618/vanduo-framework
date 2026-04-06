/**
 * Vanduo Framework - Music Player Component
 * HTML5 Audio-based music player with transport controls, volume,
 * and optional shuffle, seek bar, and playlist features.
 *
 * Options (passed to MusicPlayer.init or data-music-player-options):
 *   tracks        {Array}   - [{name, url}] — required
 *   volume        {number}  - Initial volume 0–1 (default 0.5)
 *   shuffle       {boolean} - Shuffle on init (default false)
 *   showProgress  {boolean} - Show seek/progress bar (default false)
 *   showPlaylist  {boolean} - Show expandable playlist panel (default false)
 *   autoAdvance   {boolean} - Auto-play next track on end (default true)
 *
 * Custom events (all bubble, dispatched on container):
 *   musicplayer:play         — playback started
 *   musicplayer:pause        — playback paused
 *   musicplayer:trackchange  — detail: { index, name, url }
 *   musicplayer:volumechange — detail: { volume }
 *   musicplayer:ended        — last track ended (autoAdvance=false only)
 *
 * Programmatic API:
 *   MusicPlayer.init(container?, options?)
 *   MusicPlayer.play(container)
 *   MusicPlayer.pause(container)
 *   MusicPlayer.toggle(container)
 *   MusicPlayer.next(container)
 *   MusicPlayer.previous(container)
 *   MusicPlayer.setVolume(container, value)
 *   MusicPlayer.setTrack(container, index)
 *   MusicPlayer.shuffle(container)
 *   MusicPlayer.getState(container)
 *   MusicPlayer.destroy(container)
 *   MusicPlayer.destroyAll()
 */

(function () {
  'use strict';

  /* ─── Helpers ─────────────────────────────────────────── */

  /**
   * Fisher-Yates shuffle (returns new array).
   * @param {Array} arr
   * @returns {Array}
   */
  function shuffleArray(arr) {
    const shuffled = arr.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    return shuffled;
  }

  /**
   * Format seconds as m:ss.
   * @param {number} seconds
   * @returns {string}
   */
  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /**
   * Set CSS background-size on a range input to visually fill the track.
   * @param {HTMLInputElement} input
   */
  function updateRangeFill(input) {
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 1;
    const val = parseFloat(input.value) || 0;
    const pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty('--fill', pct + '%');
    // Fallback inline gradient for browsers without ::-moz-range-progress
    input.style.backgroundImage =
      'linear-gradient(to right, var(--music-player-track-fill, currentColor) 0%, ' +
      'var(--music-player-track-fill, currentColor) ' + pct + '%, ' +
      'var(--music-player-track-bg, #ccc) ' + pct + '%, ' +
      'var(--music-player-track-bg, #ccc) 100%)';
  }

  /* ─── Phosphor icon helper (matches framework icon style) ─ */

  /**
   * Return an <i class="ph ph-{name}"> element (Phosphor icon).
   * @param {string} name
   * @returns {HTMLElement}
   */
  function icon(name) {
    const el = document.createElement('i');
    el.className = 'ph ph-' + name;
    el.setAttribute('aria-hidden', 'true');
    return el;
  }

  /* ─── Component ───────────────────────────────────────── */

  const MusicPlayer = {
    /** @type {Map<HTMLElement, Object>} */
    instances: new Map(),

    /**
     * Default options.
     */
    defaults: {
      tracks: [],
      volume: 0.5,
      shuffle: false,
      showProgress: false,
      showPlaylist: false,
      autoAdvance: true,
    },

    /**
     * Auto-initialize all .vd-music-player / [data-music-player] elements.
     * Options can be provided via data-music-player-options (JSON string).
     */
    init: function () {
      document.querySelectorAll('.vd-music-player, [data-music-player]').forEach((el) => {
        if (this.instances.has(el)) return;

        let opts = {};
        const attr = el.getAttribute('data-music-player-options');
        if (attr) {
          try { opts = JSON.parse(attr); } catch (_) { /* ignore malformed JSON */ }
        }
        this.initPlayer(el, opts);
      });
    },

    /**
     * Initialize a single player element.
     * @param {HTMLElement} container
     * @param {Object} [options]
     */
    initPlayer: function (container, options) {
      const opts = Object.assign({}, this.defaults, options || {});

      // Validate and normalise tracks
      const rawTracks = Array.isArray(opts.tracks) ? opts.tracks : [];
      const tracks = rawTracks.filter((t) => t && typeof t.url === 'string' && t.url.trim());

      // Build shuffled working copy without mutating opts
      const trackList = opts.shuffle ? shuffleArray(tracks) : tracks.slice();

      /* ── State ─────────────────────────────────────────── */
      const state = {
        tracks: trackList,
        originalTracks: tracks.slice(),
        currentIndex: 0,
        isPlaying: false,
        volume: Math.max(0, Math.min(1, opts.volume)),
        shuffle: opts.shuffle,
        showProgress: opts.showProgress,
        showPlaylist: opts.showPlaylist,
        autoAdvance: opts.autoAdvance,
        audio: null,
      };

      /* ── Audio element ─────────────────────────────────── */
      const audio = new Audio();
      audio.volume = state.volume;
      audio.preload = 'metadata';
      state.audio = audio;

      /* ── Build DOM ─────────────────────────────────────── */
      this._buildDOM(container, state);

      // Grab references after DOM build
      const refs = {
        btnPlay: container.querySelector('.vd-music-player-btn-play'),
        btnPrev: container.querySelector('.vd-music-player-btn-prev'),
        btnNext: container.querySelector('.vd-music-player-btn-next'),
        btnShuffle: container.querySelector('.vd-music-player-btn-shuffle'),
        btnPlaylist: container.querySelector('.vd-music-player-btn-playlist'),
        trackName: container.querySelector('.vd-music-player-track-name'),
        volumeSlider: container.querySelector('.vd-music-player-volume-slider'),
        volumeIcon: container.querySelector('.vd-music-player-volume-icon'),
        progressBar: container.querySelector('.vd-music-player-progress-bar'),
        timeElapsed: container.querySelector('.vd-music-player-time-elapsed'),
        timeDuration: container.querySelector('.vd-music-player-time-duration'),
        playlistPanel: container.querySelector('.vd-music-player-playlist'),
      };

      /* ── Internal render helpers ───────────────────────── */

      const renderPlayIcon = () => {
        const btn = refs.btnPlay;
        if (!btn) return;
        btn.innerHTML = '';
        btn.appendChild(icon(state.isPlaying ? 'pause' : 'play'));
        btn.setAttribute('aria-label', state.isPlaying ? 'Pause' : 'Play');
        btn.classList.toggle('is-active', state.isPlaying);
      };

      const renderTrackName = () => {
        const el = refs.trackName;
        if (!el) return;
        const track = state.tracks[state.currentIndex];
        if (track) {
          el.textContent = track.name || 'Unknown Track';
          el.classList.remove('is-idle');
        } else {
          el.textContent = 'No tracks loaded';
          el.classList.add('is-idle');
        }
      };

      const renderVolumeIcon = () => {
        const el = refs.volumeIcon;
        if (!el) return;
        el.innerHTML = '';
        const v = state.volume;
        const name = v === 0 ? 'speaker-none' : v < 0.5 ? 'speaker-low' : 'speaker-high';
        el.appendChild(icon(name));
      };

      const renderShuffleBtn = () => {
        const btn = refs.btnShuffle;
        if (!btn) return;
        btn.classList.toggle('is-active', state.shuffle);
        btn.setAttribute('aria-pressed', state.shuffle ? 'true' : 'false');
      };

      const renderPlaylistItems = () => {
        const panel = refs.playlistPanel;
        if (!panel) return;
        panel.innerHTML = '';
        state.tracks.forEach((track, i) => {
          const item = document.createElement('button');
          item.className =
            'vd-music-player-playlist-item' + (i === state.currentIndex ? ' is-active' : '');
          item.type = 'button';
          item.setAttribute('data-index', String(i));
          item.setAttribute('aria-current', i === state.currentIndex ? 'true' : 'false');

          const num = document.createElement('span');
          num.className = 'vd-music-player-playlist-num';
          num.textContent = String(i + 1);

          const name = document.createElement('span');
          name.className = 'vd-music-player-playlist-name';
          name.textContent = track.name || 'Track ' + (i + 1);

          item.appendChild(num);
          item.appendChild(name);
          panel.appendChild(item);
        });
      };

      const renderProgress = () => {
        const bar = refs.progressBar;
        if (!bar || !audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        bar.value = String(pct);
        updateRangeFill(bar);
        if (refs.timeElapsed) refs.timeElapsed.textContent = formatTime(audio.currentTime);
        if (refs.timeDuration) refs.timeDuration.textContent = formatTime(audio.duration);
      };

      /* ── Load track ─────────────────────────────────────── */

      const loadTrack = (index, autoPlay) => {
        const track = state.tracks[index];
        if (!track) return;
        state.currentIndex = index;
        audio.src = track.url;
        renderTrackName();
        renderPlaylistItems();

        // Reset progress
        if (refs.progressBar) {
          refs.progressBar.value = '0';
          updateRangeFill(refs.progressBar);
        }
        if (refs.timeElapsed) refs.timeElapsed.textContent = '0:00';
        if (refs.timeDuration) refs.timeDuration.textContent = '0:00';

        container.dispatchEvent(
          new CustomEvent('musicplayer:trackchange', {
            bubbles: true,
            detail: { index, name: track.name, url: track.url },
          })
        );

        if (autoPlay) {
          audio.play().catch(() => { /* browser may block autoplay */ });
        }
      };

      /* ── Audio event listeners ─────────────────────────── */
      const cleanupFunctions = [];

      const onPlay = () => {
        state.isPlaying = true;
        renderPlayIcon();
        container.dispatchEvent(new CustomEvent('musicplayer:play', { bubbles: true }));
      };

      const onPause = () => {
        state.isPlaying = false;
        renderPlayIcon();
        container.dispatchEvent(new CustomEvent('musicplayer:pause', { bubbles: true }));
      };

      const onEnded = () => {
        if (state.autoAdvance && state.tracks.length > 1) {
          const next = (state.currentIndex + 1) % state.tracks.length;
          loadTrack(next, true);
        } else {
          state.isPlaying = false;
          renderPlayIcon();
          container.dispatchEvent(new CustomEvent('musicplayer:ended', { bubbles: true }));
        }
      };

      const onTimeUpdate = () => {
        if (state.showProgress) renderProgress();
      };

      const onLoadedMetadata = () => {
        if (refs.timeDuration) refs.timeDuration.textContent = formatTime(audio.duration);
        if (refs.progressBar) {
          refs.progressBar.max = '100';
          updateRangeFill(refs.progressBar);
        }
      };

      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      cleanupFunctions.push(() => {
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.pause();
        audio.src = '';
      });

      /* ── Control button listeners ──────────────────────── */

      if (refs.btnPlay) {
        const handler = () => {
          if (!audio.src && state.tracks.length) loadTrack(state.currentIndex, false);
          if (state.isPlaying) {
            audio.pause();
          } else {
            audio.play().catch(() => {});
          }
        };
        refs.btnPlay.addEventListener('click', handler);
        cleanupFunctions.push(() => refs.btnPlay.removeEventListener('click', handler));

        // Keyboard: Space / Enter  (already native for <button>; guard for edge cases)
        const keyHandler = (e) => {
          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handler(); }
        };
        refs.btnPlay.addEventListener('keydown', keyHandler);
        cleanupFunctions.push(() => refs.btnPlay.removeEventListener('keydown', keyHandler));
      }

      if (refs.btnPrev) {
        const handler = () => {
          if (!state.tracks.length) return;
          // If more than 3s into track, restart; otherwise go to previous
          if (audio.currentTime > 3) {
            audio.currentTime = 0;
          } else {
            const prev =
              state.currentIndex === 0 ? state.tracks.length - 1 : state.currentIndex - 1;
            loadTrack(prev, state.isPlaying);
          }
        };
        refs.btnPrev.addEventListener('click', handler);
        cleanupFunctions.push(() => refs.btnPrev.removeEventListener('click', handler));
      }

      if (refs.btnNext) {
        const handler = () => {
          if (!state.tracks.length) return;
          const next = (state.currentIndex + 1) % state.tracks.length;
          loadTrack(next, state.isPlaying);
        };
        refs.btnNext.addEventListener('click', handler);
        cleanupFunctions.push(() => refs.btnNext.removeEventListener('click', handler));
      }

      if (refs.btnShuffle) {
        const handler = () => {
          state.shuffle = !state.shuffle;
          if (state.shuffle) {
            const current = state.tracks[state.currentIndex];
            state.tracks = shuffleArray(state.tracks);
            // Keep current track at position 0 of the new order
            const newIdx = state.tracks.findIndex((t) => t === current);
            if (newIdx > 0) {
              state.tracks.splice(newIdx, 1);
              state.tracks.unshift(current);
            }
            state.currentIndex = 0;
          } else {
            // Restore original order, keep same track
            const current = state.tracks[state.currentIndex];
            state.tracks = state.originalTracks.slice();
            state.currentIndex = state.tracks.findIndex((t) => t === current);
            if (state.currentIndex < 0) state.currentIndex = 0;
          }
          renderShuffleBtn();
          renderPlaylistItems();
        };
        refs.btnShuffle.addEventListener('click', handler);
        cleanupFunctions.push(() => refs.btnShuffle.removeEventListener('click', handler));
      }

      if (refs.btnPlaylist) {
        const handler = () => {
          const panel = refs.playlistPanel;
          if (!panel) return;
          const isOpen = panel.classList.toggle('is-open');
          refs.btnPlaylist.classList.toggle('is-active', isOpen);
          refs.btnPlaylist.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        };
        refs.btnPlaylist.addEventListener('click', handler);
        cleanupFunctions.push(() => refs.btnPlaylist.removeEventListener('click', handler));
      }

      if (refs.volumeSlider) {
        const handler = (e) => {
          const v = parseFloat(e.target.value);
          state.volume = v;
          audio.volume = v;
          renderVolumeIcon();
          updateRangeFill(refs.volumeSlider);
          container.dispatchEvent(
            new CustomEvent('musicplayer:volumechange', { bubbles: true, detail: { volume: v } })
          );
        };
        refs.volumeSlider.addEventListener('input', handler);
        cleanupFunctions.push(() => refs.volumeSlider.removeEventListener('input', handler));
        // Initial fill
        updateRangeFill(refs.volumeSlider);
      }

      if (refs.progressBar) {
        const handler = (e) => {
          if (!audio.duration) return;
          const pct = parseFloat(e.target.value);
          audio.currentTime = (pct / 100) * audio.duration;
          updateRangeFill(refs.progressBar);
        };
        refs.progressBar.addEventListener('input', handler);
        cleanupFunctions.push(() => refs.progressBar.removeEventListener('input', handler));
      }

      // Playlist item click (event delegation)
      if (refs.playlistPanel) {
        const panelHandler = (e) => {
          const item = e.target.closest('.vd-music-player-playlist-item');
          if (!item) return;
          const idx = parseInt(item.getAttribute('data-index'), 10);
          if (!isNaN(idx)) loadTrack(idx, true);
        };
        refs.playlistPanel.addEventListener('click', panelHandler);
        cleanupFunctions.push(() =>
          refs.playlistPanel.removeEventListener('click', panelHandler)
        );
      }

      /* ── Initial render ─────────────────────────────────── */
      renderPlayIcon();
      renderTrackName();
      renderVolumeIcon();
      if (opts.showPlaylist) renderPlaylistItems();

      /* ── Persist instance ───────────────────────────────── */
      this.instances.set(container, { state, audio, refs, cleanup: cleanupFunctions });
      container.setAttribute('data-music-player-initialized', 'true');
    },

    /* ─── DOM builder ─────────────────────────────────────── */

    /**
     * Build the inner DOM structure inside container.
     * Pre-existing inner content is replaced only if it has no
     * recognised child elements (allows server-rendered markup).
     * @param {HTMLElement} container
     * @param {Object} state
     */
    _buildDOM: function (container, state) {
      // Skip if already has the expected structure
      if (container.querySelector('.vd-music-player-controls')) return;

      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Music Player');

      if (state.showProgress) container.classList.add('has-progress');
      if (state.showPlaylist) container.classList.add('has-playlist');

      // Track info row
      const info = document.createElement('div');
      info.className = 'vd-music-player-info';

      const iconWrap = document.createElement('span');
      iconWrap.className = 'vd-music-player-icon';
      iconWrap.setAttribute('aria-hidden', 'true');
      iconWrap.appendChild(icon('music-note'));

      const trackName = document.createElement('span');
      trackName.className = 'vd-music-player-track-name';
      trackName.setAttribute('aria-live', 'polite');
      trackName.setAttribute('aria-atomic', 'true');

      info.appendChild(iconWrap);
      info.appendChild(trackName);
      container.appendChild(info);

      // Controls row
      const controls = document.createElement('div');
      controls.className = 'vd-music-player-controls';
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', 'Playback controls');

      const btnPrev = document.createElement('button');
      btnPrev.type = 'button';
      btnPrev.className = 'vd-music-player-btn vd-music-player-btn-prev';
      btnPrev.setAttribute('aria-label', 'Previous track');
      btnPrev.appendChild(icon('skip-back'));

      const btnPlay = document.createElement('button');
      btnPlay.type = 'button';
      btnPlay.className = 'vd-music-player-btn vd-music-player-btn-play';
      btnPlay.setAttribute('aria-label', 'Play');
      btnPlay.appendChild(icon('play'));

      const btnNext = document.createElement('button');
      btnNext.type = 'button';
      btnNext.className = 'vd-music-player-btn vd-music-player-btn-next';
      btnNext.setAttribute('aria-label', 'Next track');
      btnNext.appendChild(icon('skip-forward'));

      controls.appendChild(btnPrev);
      controls.appendChild(btnPlay);
      controls.appendChild(btnNext);

      // Optional shuffle button
      if (state.showPlaylist || state.shuffle !== undefined) {
        // Always render shuffle so it can be shown when shuffle option is used
        const btnShuffle = document.createElement('button');
        btnShuffle.type = 'button';
        btnShuffle.className = 'vd-music-player-btn vd-music-player-btn-shuffle';
        btnShuffle.setAttribute('aria-label', 'Shuffle');
        btnShuffle.setAttribute('aria-pressed', state.shuffle ? 'true' : 'false');
        btnShuffle.appendChild(icon('shuffle'));
        controls.appendChild(btnShuffle);
      }

      // Spacer
      const spacer = document.createElement('span');
      spacer.className = 'vd-music-player-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      controls.appendChild(spacer);

      // Volume
      const volumeWrap = document.createElement('div');
      volumeWrap.className = 'vd-music-player-volume';

      const volumeIcon = document.createElement('span');
      volumeIcon.className = 'vd-music-player-volume-icon';
      volumeIcon.setAttribute('aria-hidden', 'true');

      const volumeSlider = document.createElement('input');
      volumeSlider.type = 'range';
      volumeSlider.className = 'vd-music-player-volume-slider';
      volumeSlider.min = '0';
      volumeSlider.max = '1';
      volumeSlider.step = '0.01';
      volumeSlider.value = String(state.volume);
      volumeSlider.setAttribute('aria-label', 'Volume');

      volumeWrap.appendChild(volumeIcon);
      volumeWrap.appendChild(volumeSlider);
      controls.appendChild(volumeWrap);

      // Optional playlist toggle button
      if (state.showPlaylist) {
        const btnPlaylist = document.createElement('button');
        btnPlaylist.type = 'button';
        btnPlaylist.className = 'vd-music-player-btn vd-music-player-btn-playlist';
        btnPlaylist.setAttribute('aria-label', 'Show playlist');
        btnPlaylist.setAttribute('aria-expanded', 'false');
        btnPlaylist.appendChild(icon('playlist'));
        controls.appendChild(btnPlaylist);
      }

      container.appendChild(controls);

      // Optional progress bar
      if (state.showProgress) {
        const progressRow = document.createElement('div');
        progressRow.className = 'vd-music-player-progress';

        const timeElapsed = document.createElement('span');
        timeElapsed.className = 'vd-music-player-time vd-music-player-time-elapsed';
        timeElapsed.textContent = '0:00';
        timeElapsed.setAttribute('aria-hidden', 'true');

        const progressBar = document.createElement('input');
        progressBar.type = 'range';
        progressBar.className = 'vd-music-player-progress-bar';
        progressBar.min = '0';
        progressBar.max = '100';
        progressBar.step = '0.1';
        progressBar.value = '0';
        progressBar.setAttribute('aria-label', 'Seek');

        const timeDuration = document.createElement('span');
        timeDuration.className = 'vd-music-player-time vd-music-player-time-duration';
        timeDuration.textContent = '0:00';
        timeDuration.setAttribute('aria-hidden', 'true');

        progressRow.appendChild(timeElapsed);
        progressRow.appendChild(progressBar);
        progressRow.appendChild(timeDuration);
        container.appendChild(progressRow);
      }

      // Optional playlist panel (hidden until toggled)
      if (state.showPlaylist) {
        const playlist = document.createElement('div');
        playlist.className = 'vd-music-player-playlist';
        playlist.setAttribute('aria-label', 'Playlist');
        container.appendChild(playlist);
      }
    },

    /* ─── Public API ──────────────────────────────────────── */

    /**
     * @param {HTMLElement} container
     */
    play: function (container) {
      const inst = this.instances.get(container);
      if (!inst) return;
      if (!inst.audio.src && inst.state.tracks.length) {
        inst.audio.src = inst.state.tracks[inst.state.currentIndex].url;
      }
      inst.audio.play().catch(() => {});
    },

    /**
     * @param {HTMLElement} container
     */
    pause: function (container) {
      const inst = this.instances.get(container);
      if (inst) inst.audio.pause();
    },

    /**
     * @param {HTMLElement} container
     */
    toggle: function (container) {
      const inst = this.instances.get(container);
      if (!inst) return;
      if (inst.state.isPlaying) {
        this.pause(container);
      } else {
        this.play(container);
      }
    },

    /**
     * @param {HTMLElement} container
     */
    next: function (container) {
      const inst = this.instances.get(container);
      if (!inst || !inst.state.tracks.length) return;
      const next = (inst.state.currentIndex + 1) % inst.state.tracks.length;
      this._loadTrack(inst, next, inst.state.isPlaying);
    },

    /**
     * @param {HTMLElement} container
     */
    previous: function (container) {
      const inst = this.instances.get(container);
      if (!inst || !inst.state.tracks.length) return;
      const len = inst.state.tracks.length;
      const prev = (inst.state.currentIndex - 1 + len) % len;
      this._loadTrack(inst, prev, inst.state.isPlaying);
    },

    /**
     * @param {HTMLElement} container
     * @param {number} value - 0 to 1
     */
    setVolume: function (container, value) {
      const inst = this.instances.get(container);
      if (!inst) return;
      const v = Math.max(0, Math.min(1, value));
      inst.state.volume = v;
      inst.audio.volume = v;
      if (inst.refs.volumeSlider) {
        inst.refs.volumeSlider.value = String(v);
        updateRangeFill(inst.refs.volumeSlider);
      }
      container.dispatchEvent(
        new CustomEvent('musicplayer:volumechange', { bubbles: true, detail: { volume: v } })
      );
    },

    /**
     * @param {HTMLElement} container
     * @param {number} index - Track index
     */
    setTrack: function (container, index) {
      const inst = this.instances.get(container);
      if (!inst) return;
      this._loadTrack(inst, index, inst.state.isPlaying);
    },

    /**
     * Shuffle or un-shuffle the track list.
     * @param {HTMLElement} container
     */
    shuffle: function (container) {
      const inst = this.instances.get(container);
      if (!inst || !inst.refs.btnShuffle) return;
      inst.refs.btnShuffle.click();
    },

    /**
     * Return a shallow copy of the current player state.
     * @param {HTMLElement} container
     * @returns {Object|null}
     */
    getState: function (container) {
      const inst = this.instances.get(container);
      if (!inst) return null;
      const s = inst.state;
      return {
        isPlaying: s.isPlaying,
        currentIndex: s.currentIndex,
        currentTrack: s.tracks[s.currentIndex] || null,
        volume: s.volume,
        shuffle: s.shuffle,
        tracks: s.tracks.slice(),
      };
    },

    /**
     * Stop playback, clean up listeners, remove instance.
     * @param {HTMLElement} container
     */
    destroy: function (container) {
      const inst = this.instances.get(container);
      if (!inst) return;
      inst.cleanup.forEach((fn) => fn());
      this.instances.delete(container);
      container.removeAttribute('data-music-player-initialized');
    },

    /**
     * Destroy all instances.
     */
    destroyAll: function () {
      this.instances.forEach((_, container) => this.destroy(container));
    },

    /* ─── Internal helpers ────────────────────────────────── */

    /**
     * Load track by index on an already-initialised instance object.
     * @param {Object} inst
     * @param {number} index
     * @param {boolean} autoPlay
     */
    _loadTrack: function (inst, index, autoPlay) {
      const track = inst.state.tracks[index];
      if (!track) return;
      const container = this._containerOf(inst);

      inst.state.currentIndex = index;
      inst.audio.src = track.url;

      if (inst.refs.trackName) {
        inst.refs.trackName.textContent = track.name || 'Unknown Track';
        inst.refs.trackName.classList.remove('is-idle');
      }

      // Update playlist highlights
      if (inst.refs.playlistPanel) {
        inst.refs.playlistPanel.querySelectorAll('.vd-music-player-playlist-item').forEach((item, i) => {
          const active = i === index;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-current', active ? 'true' : 'false');
        });
      }

      // Reset progress
      if (inst.refs.progressBar) {
        inst.refs.progressBar.value = '0';
        updateRangeFill(inst.refs.progressBar);
      }
      if (inst.refs.timeElapsed) inst.refs.timeElapsed.textContent = '0:00';
      if (inst.refs.timeDuration) inst.refs.timeDuration.textContent = '0:00';

      if (container) {
        container.dispatchEvent(
          new CustomEvent('musicplayer:trackchange', {
            bubbles: true,
            detail: { index, name: track.name, url: track.url },
          })
        );
      }

      if (autoPlay) inst.audio.play().catch(() => {});
    },

    /**
     * Reverse-lookup the container element for a given instance object.
     * @param {Object} inst
     * @returns {HTMLElement|null}
     */
    _containerOf: function (inst) {
      for (const [container, i] of this.instances) {
        if (i === inst) return container;
      }
      return null;
    },
  };

  // Register with Vanduo framework
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('musicPlayer', MusicPlayer);
  }

  // Convenience global
  window.VanduoMusicPlayer = MusicPlayer;
})();
