/**
 * Vanduo Framework - Glass Scroll Activation
 * Generic scroll-aware glass activation via IntersectionObserver.
 *
 * Usage:
 *   Add `data-glass-scroll` to any element carrying a `.vd-glass*` class.
 *   By default the previous sibling is used as the sentinel.
 *   Point to a custom sentinel via `data-glass-sentinel="<CSS selector>"`.
 *
 * Behaviour:
 *   - Adds `.is-glass-active` when the sentinel leaves the viewport (scrolled past).
 *   - Removes `.is-glass-active` when the sentinel re-enters the viewport.
 */
(function () {
  'use strict';

  const GlassScroll = {
    /** @type {Map<Element, IntersectionObserver>} */
    observers: new Map(),

    init: function () {
      document.querySelectorAll('[data-glass-scroll]').forEach(el => {
        if (this.observers.has(el)) return;
        this.initElement(el);
      });
    },

    /**
     * Wire up a single scroll-activated glass element.
     * @param {HTMLElement} el
     */
    initElement: function (el) {
      const sentinelSelector = el.dataset.glassSentinel;
      let sentinel;

      if (sentinelSelector) {
        sentinel = document.querySelector(sentinelSelector);
      }

      if (!sentinel) {
        // Fall back to the previous sibling element
        sentinel = el.previousElementSibling;
      }

      if (!sentinel) {
        // No sentinel available — activate immediately so glass is always shown
        el.classList.add('is-glass-active');
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            // Active when sentinel is NOT intersecting (scrolled past it)
            el.classList.toggle('is-glass-active', !entry.isIntersecting);
          });
        },
        { threshold: 0, rootMargin: '0px' }
      );

      observer.observe(sentinel);
      this.observers.set(el, observer);
    },

    /**
     * Disconnect and remove a single element's observer.
     * @param {HTMLElement} el
     */
    destroy: function (el) {
      const observer = this.observers.get(el);
      if (observer) {
        observer.disconnect();
        this.observers.delete(el);
      }
    },

    destroyAll: function () {
      this.observers.forEach((observer, el) => this.destroy(el));
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('glassScroll', GlassScroll);
  }

  window.VanduoGlassScroll = GlassScroll;
})();
