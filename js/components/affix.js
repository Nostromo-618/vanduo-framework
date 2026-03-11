/**
 * Vanduo Framework - Affix (Sticky) Component
 * Uses IntersectionObserver to toggle .is-stuck class with placeholder for layout stability
 */

(function () {
  'use strict';

  const Affix = {
    instances: new Map(),

    init: function () {
      const elements = document.querySelectorAll('.vd-affix, .vd-sticky, [data-vd-affix]');
      elements.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (el) {
      const cleanup = [];
      const offset = parseInt(el.getAttribute('data-vd-affix-offset') || '0', 10);

      // Create sentinel element (placed right before the affix element)
      const sentinel = document.createElement('div');
      sentinel.style.cssText = 'height:0;width:0;visibility:hidden;pointer-events:none;';
      el.parentNode.insertBefore(sentinel, el);

      // Create placeholder to reserve space when element becomes fixed
      const placeholder = document.createElement('div');
      placeholder.className = 'vd-affix-placeholder';
      el.parentNode.insertBefore(placeholder, el);

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            // Sentinel scrolled out — stick the element
            const rect = el.getBoundingClientRect();
            placeholder.style.height = rect.height + 'px';
            placeholder.classList.add('is-active');
            el.classList.add('is-stuck');
            el.style.setProperty('--affix-top-offset', offset + 'px');
            el.dispatchEvent(new CustomEvent('affix:stuck', { bubbles: true }));
          } else {
            // Sentinel visible — unstick
            placeholder.classList.remove('is-active');
            el.classList.remove('is-stuck');
            el.dispatchEvent(new CustomEvent('affix:unstuck', { bubbles: true }));
          }
        });
      }, {
        rootMargin: '-' + offset + 'px 0px 0px 0px',
        threshold: 0
      });

      observer.observe(sentinel);

      cleanup.push(
        () => observer.disconnect(),
        () => { if (sentinel.parentNode) sentinel.parentNode.removeChild(sentinel); },
        () => { if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder); }
      );

      this.instances.set(el, { cleanup, observer, sentinel, placeholder });
    },

    destroy: function (el) {
      const instance = this.instances.get(el);
      if (!instance) return;
      instance.cleanup.forEach(fn => fn());
      el.classList.remove('is-stuck');
      this.instances.delete(el);
    },

    destroyAll: function () {
      this.instances.forEach((_, el) => this.destroy(el));
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('affix', Affix);
  }

  window.VanduoAffix = Affix;

})();
