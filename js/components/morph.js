/**
 * Vanduo Framework - Water Morph Effect Component
 * Liquid wave content-swap animation on click
 *
 * Usage:
 *   Add .vd-morph or [data-vd-morph] to any element.
 *   Provide .vd-morph-content.vd-morph-current and .vd-morph-content.vd-morph-next children.
 *   Wave and shine layers are auto-created if absent.
 *
 * JS API:
 *   VanduoMorph.morph(el)       — trigger morph programmatically (from center)
 *   VanduoMorph.destroy(el)     — tear down listeners for one element
 *   VanduoMorph.destroyAll()    — tear down all instances
 */

(function () {
  'use strict';

  const MORPH_DURATION_MS = 750;

  const Morph = {
    instances: new Map(),

    init: function (root) {
      const elements = window.Vanduo.queryAll(root, '.vd-morph, [data-vd-morph]');
      elements.forEach(function (el) {
        if (Morph.instances.has(el)) return;
        if (el.getAttribute('data-vd-morph') === 'manual') return;
        Morph.initInstance(el);
      });
    },

    initInstance: function (el) {
      Morph._ensureLayers(el);

      const cleanup = [];
      let morphing = false;

      const handleClick = function (e) {
        if (morphing) return;
        Morph._runMorph(el, e, function () { morphing = false; });
        morphing = true;
      };

      el.addEventListener('click', handleClick);
      cleanup.push(function () { el.removeEventListener('click', handleClick); });

      this.instances.set(el, { cleanup: cleanup });
    },

    morph: function (el) {
      if (!el) return;
      if (!this.instances.has(el)) this.initInstance(el);
      this._runMorph(el, null, null);
    },

    destroy: function (el) {
      const instance = this.instances.get(el);
      if (!instance) return;
      instance.cleanup.forEach(function (fn) { fn(); });
      this.instances.delete(el);
    },

    destroyAll: function () {
      this.instances.forEach(function (_, el) { Morph.destroy(el); });
    },

    /* ── Internal helpers ── */

    _ensureLayers: function (el) {
      if (!el.querySelector('.vd-morph-wave')) {
        const wave = document.createElement('span');
        wave.className = 'vd-morph-wave';
        wave.setAttribute('aria-hidden', 'true');
        el.insertBefore(wave, el.firstChild);
      }
      if (!el.querySelector('.vd-morph-shine')) {
        const shine = document.createElement('span');
        shine.className = 'vd-morph-shine';
        shine.setAttribute('aria-hidden', 'true');
        const waveEl = el.querySelector('.vd-morph-wave');
        if (waveEl && waveEl.nextSibling) {
          el.insertBefore(shine, waveEl.nextSibling);
        } else {
          el.insertBefore(shine, el.firstChild);
        }
      }
    },

    _runMorph: function (el, pointerEvent, onComplete) {
      const wave = el.querySelector('.vd-morph-wave');
      if (wave) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const px = pointerEvent ? (pointerEvent.clientX || cx) : cx;
        const py = pointerEvent ? (pointerEvent.clientY || cy) : cy;
        wave.style.left = (px - rect.left) + 'px';
        wave.style.top  = (py - rect.top)  + 'px';
      }

      el.classList.add('is-morphing');

      let duration = MORPH_DURATION_MS;
      const custom = getComputedStyle(el).getPropertyValue('--morph-duration');
      if (custom) {
        const parsed = parseFloat(custom);
        if (!isNaN(parsed)) duration = parsed * (custom.indexOf('ms') !== -1 ? 1 : 1000);
      }

      setTimeout(function () {
        el.classList.remove('is-morphing');

        const current = el.querySelector('.vd-morph-current');
        const next    = el.querySelector('.vd-morph-next');
        if (current && next) {
          current.classList.remove('vd-morph-current');
          current.classList.add('vd-morph-next');
          next.classList.remove('vd-morph-next');
          next.classList.add('vd-morph-current');
        }

        if (typeof onComplete === 'function') onComplete();
      }, duration);
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('morph', Morph);
  }

  window.VanduoMorph = Morph;

})();
