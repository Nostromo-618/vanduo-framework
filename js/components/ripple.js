/**
 * Vanduo Framework - Ripple (Waves Effect) Component
 * Adds expanding circle animation on click at pointer position
 */

(function () {
  'use strict';

  const Ripple = {
    instances: new Map(),

    init: function (root) {
      const elements = window.Vanduo.queryAll(root, '.vd-ripple, [data-vd-ripple]');
      elements.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (el) {
      const cleanup = [];

      const createWave = (e) => {
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = (e.clientX || (e.touches && e.touches[0].clientX) || rect.left + rect.width / 2) - rect.left - size / 2;
        const y = (e.clientY || (e.touches && e.touches[0].clientY) || rect.top + rect.height / 2) - rect.top - size / 2;

        const wave = document.createElement('span');
        wave.className = 'vd-ripple-wave';
        wave.style.width = size + 'px';
        wave.style.height = size + 'px';
        wave.style.left = x + 'px';
        wave.style.top = y + 'px';

        el.appendChild(wave);

        wave.addEventListener('animationend', () => {
          if (wave.parentNode) wave.parentNode.removeChild(wave);
        });
      };

      el.addEventListener('mousedown', createWave);
      el.addEventListener('touchstart', createWave, { passive: true });

      cleanup.push(
        () => el.removeEventListener('mousedown', createWave),
        () => el.removeEventListener('touchstart', createWave)
      );

      this.instances.set(el, { cleanup });
    },

    destroy: function (el) {
      const instance = this.instances.get(el);
      if (!instance) return;
      instance.cleanup.forEach(fn => fn());
      // Remove any lingering wave elements
      el.querySelectorAll('.vd-ripple-wave').forEach(w => w.remove());
      this.instances.delete(el);
    },

    destroyAll: function () {
      this.instances.forEach((_, el) => this.destroy(el));
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('ripple', Ripple);
  }

  window.VanduoRipple = Ripple;

})();
