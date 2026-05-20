/**
 * Vanduo Framework — Timeline animated reveal
 * Opt-in: add `.vd-timeline-animated` to a `.vd-timeline` container.
 * Uses IntersectionObserver to add `.is-revealed` per item with staggered delays.
 * Optional: `.vd-timeline-playback` with `[data-vd-timeline-prev|next|play|pause]` for stepped control.
 */

(function () {
  'use strict';

  const STAGGER_MS = 140;
  const MAX_STAGGER_INDEX = 7;
  const PLAY_INTERVAL_MS = 800;

  function countRevealedPrefix(items) {
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      if (!items[i].classList.contains('is-revealed')) break;
      count++;
    }
    return count;
  }

  function findPlaybackControls(container) {
    return container.parentElement || document.body;
  }

  function initPlayback(container, items, cleanup) {
    items.forEach(function (item) {
      item.classList.remove('is-revealed');
    });

    const scope = findPlaybackControls(container);
    const prevBtn = scope.querySelector('[data-vd-timeline-prev]');
    const nextBtn = scope.querySelector('[data-vd-timeline-next]');
    const playBtn = scope.querySelector('[data-vd-timeline-play]');
    const pauseBtn = scope.querySelector('[data-vd-timeline-pause]');

    let playTimer = null;
    let isPlaying = false;
    let playToken = 0;

    function updateNavButtons() {
      const k = countRevealedPrefix(items);
      const n = items.length;
      if (prevBtn) {
        const atStart = k === 0;
        prevBtn.disabled = atStart;
        prevBtn.setAttribute('aria-disabled', atStart ? 'true' : 'false');
      }
      if (nextBtn) {
        const atEnd = k >= n;
        nextBtn.disabled = atEnd;
        nextBtn.setAttribute('aria-disabled', atEnd ? 'true' : 'false');
      }
      if (playBtn) {
        playBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
      }
      if (pauseBtn) {
        pauseBtn.disabled = !isPlaying;
      }
    }

    function stepNext() {
      const k = countRevealedPrefix(items);
      if (k < items.length) {
        items[k].classList.add('is-revealed');
      }
      updateNavButtons();
    }

    function stepPrev() {
      const k = countRevealedPrefix(items);
      if (k > 0) {
        items[k - 1].classList.remove('is-revealed');
      }
      updateNavButtons();
    }

    function scheduleNext() {
      const token = ++playToken;
      playTimer = setTimeout(function () {
        playTimer = null;

        if (!isPlaying || token !== playToken) {
          return;
        }

        if (countRevealedPrefix(items) >= items.length) {
          pause();
          return;
        }

        stepNext();

        if (countRevealedPrefix(items) >= items.length) {
          pause();
          return;
        }

        scheduleNext();
      }, PLAY_INTERVAL_MS);
    }

    function play() {
      if (isPlaying) return;
      isPlaying = true;
      scheduleNext();
      updateNavButtons();
    }

    function pause() {
      isPlaying = false;
      playToken++;
      if (playTimer) {
        clearTimeout(playTimer);
        playTimer = null;
      }
      updateNavButtons();
    }

    function addClick(el, fn) {
      if (!el) return;
      const handler = function (e) {
        e.preventDefault();
        fn();
      };
      el.addEventListener('click', handler);
      cleanup.push(function () {
        el.removeEventListener('click', handler);
      });
    }

    addClick(prevBtn, stepPrev);
    addClick(nextBtn, stepNext);
    addClick(playBtn, play);
    addClick(pauseBtn, pause);

    cleanup.push(function () {
      pause();
    });

    updateNavButtons();

    return {
      stepNext: stepNext,
      stepPrev: stepPrev,
      play: play,
      pause: pause
    };
  }

  const Timeline = {
    instances: new Map(),

    init: function (root) {
      window.Vanduo.queryAll(root, '.vd-timeline.vd-timeline-animated').forEach(function (el) {
        if (Timeline.instances.has(el)) return;
        Timeline.initInstance(el);
      });
    },

    reinit: function (root) {
      Timeline.destroyAll(root);
      Timeline.init(root);
    },

    initInstance: function (container) {
      const cleanup = [];
      const items = Array.prototype.filter.call(container.children, function (child) {
        return child.classList && child.classList.contains('vd-timeline-item');
      });

      items.forEach(function (item, i) {
        const idx = Math.min(i, MAX_STAGGER_INDEX);
        item.style.setProperty('--vd-timeline-reveal-delay', (idx * STAGGER_MS) + 'ms');
      });

      const reducedMotion = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion) {
        items.forEach(function (item) {
          item.classList.add('is-revealed');
        });
        Timeline.instances.set(container, { cleanup: cleanup });
        return;
      }

      const playback = container.classList && container.classList.contains('vd-timeline-playback');

      if (playback) {
        const playbackApi = initPlayback(container, items, cleanup);
        Timeline.instances.set(container, { cleanup: cleanup, playback: playbackApi });
        return;
      }

      if (typeof IntersectionObserver === 'undefined') {
        items.forEach(function (item) {
          item.classList.add('is-revealed');
        });
        Timeline.instances.set(container, { cleanup: cleanup });
        return;
      }

      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15
      });

      items.forEach(function (item) {
        observer.observe(item);
      });

      cleanup.push(function () {
        observer.disconnect();
      });

      Timeline.instances.set(container, { cleanup: cleanup });
    },

    destroy: function (container) {
      const inst = this.instances.get(container);
      if (!inst) return;
      inst.cleanup.forEach(function (fn) {
        fn();
      });
      this.instances.delete(container);
    },

    destroyAll: function (root) {
      const scope = window.Vanduo && typeof window.Vanduo._normalizeRoot === 'function'
        ? window.Vanduo._normalizeRoot(root)
        : document;

      this.instances.forEach(function (_, el) {
        if (scope !== document && scope !== el && (!scope.contains || !scope.contains(el))) return;
        Timeline.destroy(el);
      });
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('timeline', Timeline);
  }

  window.VanduoTimeline = Timeline;
})();
