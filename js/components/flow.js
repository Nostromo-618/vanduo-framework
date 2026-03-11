/**
 * Vanduo Framework - Flow (Carousel/Slider) Component
 * Touch-enabled carousel with slide/fade transitions, autoplay, indicators
 */

(function () {
  'use strict';

  const Flow = {
    instances: new Map(),

    init: function () {
      const carousels = document.querySelectorAll('.vd-flow, .vd-carousel');
      carousels.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (el) {
      const track = el.querySelector('.vd-flow-track');
      if (!track) return;

      const slides = Array.from(track.querySelectorAll('.vd-flow-slide'));
      if (slides.length === 0) return;

      const isFade = el.classList.contains('vd-flow-fade');
      const autoplay = el.hasAttribute('data-vd-autoplay');
      const interval = parseInt(el.getAttribute('data-vd-interval'), 10) || 5000;
      const loop = el.getAttribute('data-vd-loop') !== 'false';

      const state = {
        current: 0,
        total: slides.length,
        autoplayTimer: null,
        isFade: isFade,
        loop: loop,
        isDragging: false,
        startX: 0,
        currentX: 0,
        threshold: 50
      };

      const cleanup = [];

      // Set initial active slide
      slides.forEach((slide, i) => {
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', 'Slide ' + (i + 1) + ' of ' + slides.length);
        if (i === 0) slide.classList.add('is-active');
      });

      el.setAttribute('role', 'region');
      el.setAttribute('aria-roledescription', 'carousel');
      if (!el.getAttribute('aria-label')) {
        el.setAttribute('aria-label', 'Carousel');
      }

      // Live region for announcements
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
      el.appendChild(liveRegion);

      const goTo = (index, announce) => {
        if (announce === undefined) announce = true;
        let target = index;
        if (state.loop) {
          target = ((index % state.total) + state.total) % state.total;
        } else {
          target = Math.max(0, Math.min(index, state.total - 1));
        }

        const prev = state.current;
        state.current = target;

        if (state.isFade) {
          slides.forEach((s, i) => {
            s.classList.toggle('is-active', i === target);
          });
        } else {
          track.style.transform = 'translateX(-' + (target * 100) + '%)';
        }

        // Update indicators
        const indicators = el.querySelectorAll('.vd-flow-indicator');
        indicators.forEach((ind, i) => {
          ind.classList.toggle('is-active', i === target);
          ind.setAttribute('aria-selected', i === target ? 'true' : 'false');
        });

        // Update slide ARIA
        slides.forEach((s, i) => {
          s.setAttribute('aria-hidden', i !== target ? 'true' : 'false');
        });

        if (announce) {
          liveRegion.textContent = 'Slide ' + (target + 1) + ' of ' + state.total;
        }

        el.dispatchEvent(new CustomEvent('flow:change', {
          detail: { current: target, previous: prev, total: state.total }
        }));
      };

      const next = () => goTo(state.current + 1);
      const prev = () => goTo(state.current - 1);

      // Controls
      const prevBtn = el.querySelector('.vd-flow-prev');
      const nextBtn = el.querySelector('.vd-flow-next');

      if (prevBtn) {
        const h = () => prev();
        prevBtn.addEventListener('click', h);
        cleanup.push(() => prevBtn.removeEventListener('click', h));
      }
      if (nextBtn) {
        const h = () => next();
        nextBtn.addEventListener('click', h);
        cleanup.push(() => nextBtn.removeEventListener('click', h));
      }

      // Indicators
      const indicators = el.querySelectorAll('.vd-flow-indicator');
      indicators.forEach((ind, i) => {
        ind.setAttribute('role', 'tab');
        ind.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        ind.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        const h = () => goTo(i);
        ind.addEventListener('click', h);
        cleanup.push(() => ind.removeEventListener('click', h));
      });

      // Keyboard navigation
      const keyHandler = (e) => {
        if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
        if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
      };
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', keyHandler);
      cleanup.push(() => el.removeEventListener('keydown', keyHandler));

      // Touch / pointer support
      const pointerDown = (e) => {
        state.isDragging = true;
        state.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        state.currentX = state.startX;
        el.classList.add('is-dragging');
      };

      const pointerMove = (e) => {
        if (!state.isDragging) return;
        state.currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      };

      const pointerUp = () => {
        if (!state.isDragging) return;
        state.isDragging = false;
        el.classList.remove('is-dragging');
        const diff = state.startX - state.currentX;
        if (Math.abs(diff) > state.threshold) {
          if (diff > 0) next();
          else prev();
        }
      };

      el.addEventListener('mousedown', pointerDown);
      el.addEventListener('mousemove', pointerMove);
      el.addEventListener('mouseup', pointerUp);
      el.addEventListener('mouseleave', pointerUp);
      el.addEventListener('touchstart', pointerDown, { passive: true });
      el.addEventListener('touchmove', pointerMove, { passive: true });
      el.addEventListener('touchend', pointerUp);

      cleanup.push(
        () => el.removeEventListener('mousedown', pointerDown),
        () => el.removeEventListener('mousemove', pointerMove),
        () => el.removeEventListener('mouseup', pointerUp),
        () => el.removeEventListener('mouseleave', pointerUp),
        () => el.removeEventListener('touchstart', pointerDown),
        () => el.removeEventListener('touchmove', pointerMove),
        () => el.removeEventListener('touchend', pointerUp)
      );

      // Autoplay
      const startAutoplay = () => {
        stopAutoplay();
        state.autoplayTimer = setInterval(next, interval);
      };

      const stopAutoplay = () => {
        if (state.autoplayTimer) {
          clearInterval(state.autoplayTimer);
          state.autoplayTimer = null;
        }
      };

      if (autoplay) {
        startAutoplay();
        const pauseHandler = () => stopAutoplay();
        const resumeHandler = () => startAutoplay();
        el.addEventListener('mouseenter', pauseHandler);
        el.addEventListener('mouseleave', resumeHandler);
        el.addEventListener('focusin', pauseHandler);
        el.addEventListener('focusout', resumeHandler);
        cleanup.push(
          () => el.removeEventListener('mouseenter', pauseHandler),
          () => el.removeEventListener('mouseleave', resumeHandler),
          () => el.removeEventListener('focusin', pauseHandler),
          () => el.removeEventListener('focusout', resumeHandler),
          () => stopAutoplay()
        );
      }

      // Initial ARIA state
      goTo(0, false);

      this.instances.set(el, {
        cleanup: cleanup,
        goTo: goTo,
        next: next,
        prev: prev,
        getState: () => ({ ...state })
      });
    },

    goTo: function (el, index) {
      const instance = this.instances.get(el);
      if (instance) instance.goTo(index);
    },

    next: function (el) {
      const instance = this.instances.get(el);
      if (instance) instance.next();
    },

    prev: function (el) {
      const instance = this.instances.get(el);
      if (instance) instance.prev();
    },

    destroy: function (el) {
      const instance = this.instances.get(el);
      if (!instance) return;
      instance.cleanup.forEach(fn => fn());
      this.instances.delete(el);
    },

    destroyAll: function () {
      this.instances.forEach((_, el) => this.destroy(el));
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('flow', Flow);
  }

  window.VanduoFlow = Flow;

})();
