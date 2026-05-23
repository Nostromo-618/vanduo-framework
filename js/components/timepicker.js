/**
 * Vanduo Framework - Timepicker Component
 * Dropdown time selection with 12h/24h format and configurable step intervals
 */

(function () {
  'use strict';

  function positionAnchoredPopup(anchor, popup, gap) {
    const padding = 8;
    const offset = gap != null ? gap : 4;
    const rect = anchor.getBoundingClientRect();

    popup.style.minWidth = Math.max(rect.width, 0) + 'px';

    let top = rect.bottom + offset;
    let left = rect.left;
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';

    const popRect = popup.getBoundingClientRect();
    if (popRect.bottom > window.innerHeight - padding && rect.top - popRect.height > padding) {
      top = rect.top - popRect.height - offset;
      popup.style.top = top + 'px';
    }

    const alignedRect = popup.getBoundingClientRect();
    left = rect.left;
    if (left + alignedRect.width > window.innerWidth - padding) {
      left = window.innerWidth - alignedRect.width - padding;
    }
    popup.style.left = Math.max(padding, left) + 'px';
  }

  const Timepicker = {
    instances: new Map(),

    init: function (root) {
      const inputs = window.Vanduo.queryAll(root, '[data-vd-timepicker]');
      inputs.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (input) {
      const cleanup = [];
      const is24h = input.getAttribute('data-vd-timepicker-format') === '24h';
      const step = parseInt(input.getAttribute('data-vd-timepicker-step') || '30', 10);

      // Create wrapper
      let wrapper = input.closest('.vd-suggest-wrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
      }

      // Create popup
      const popup = document.createElement('div');
      popup.className = 'vd-timepicker-popup';
      popup.setAttribute('role', 'listbox');
      document.body.appendChild(popup);

      // Generate time slots
      const times = [];
      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += step) {
          const hh24 = String(h).padStart(2, '0');
          const mm = String(m).padStart(2, '0');

          if (is24h) {
            times.push({ display: hh24 + ':' + mm, value: hh24 + ':' + mm });
          } else {
            const period = h < 12 ? 'AM' : 'PM';
            const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
            const display = h12 + ':' + mm + ' ' + period;
            times.push({ display, value: hh24 + ':' + mm });
          }
        }
      }

      const render = () => {
        popup.innerHTML = '';
        times.forEach(t => {
          const item = document.createElement('div');
          item.className = 'vd-timepicker-item';
          item.setAttribute('role', 'option');
          item.textContent = t.display;

          if (input.value === t.value || input.value === t.display) {
            item.classList.add('is-selected');
          }

          item.addEventListener('click', () => {
            input.value = t.display;
            popup.querySelectorAll('.vd-timepicker-item').forEach(i => i.classList.remove('is-selected'));
            item.classList.add('is-selected');
            close();
            input.dispatchEvent(new CustomEvent('timepicker:select', {
              detail: { display: t.display, value: t.value },
              bubbles: true
            }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          });

          popup.appendChild(item);
        });
      };

      const positionPopup = () => {
        if (!popup.classList.contains('is-open')) return;
        positionAnchoredPopup(input, popup);
      };

      const repositionHandler = () => {
        positionPopup();
      };

      const open = () => {
        render();
        popup.classList.add('is-open');
        input.setAttribute('aria-expanded', 'true');
        requestAnimationFrame(() => {
          positionPopup();
          const selected = popup.querySelector('.is-selected');
          if (selected) selected.scrollIntoView({ block: 'center' });
        });
      };

      const close = () => {
        popup.classList.remove('is-open');
        input.setAttribute('aria-expanded', 'false');
      };

      const focusHandler = () => open();
      const outsideHandler = (e) => {
        if (!input.contains(e.target) && !popup.contains(e.target)) close();
      };
      const escHandler = (e) => { if (e.key === 'Escape') close(); };

      input.addEventListener('focus', focusHandler);
      document.addEventListener('click', outsideHandler, true);
      document.addEventListener('keydown', escHandler);
      window.addEventListener('resize', repositionHandler);
      window.addEventListener('scroll', repositionHandler, true);
      input.setAttribute('aria-haspopup', 'listbox');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('autocomplete', 'off');
      input.readOnly = true;

      cleanup.push(
        () => input.removeEventListener('focus', focusHandler),
        () => document.removeEventListener('click', outsideHandler, true),
        () => document.removeEventListener('keydown', escHandler),
        () => window.removeEventListener('resize', repositionHandler),
        () => window.removeEventListener('scroll', repositionHandler, true),
        () => popup.remove()
      );

      this.instances.set(input, { cleanup, open, close });
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
    window.Vanduo.register('timepicker', Timepicker);
  }

  window.VanduoTimepicker = Timepicker;

})();
