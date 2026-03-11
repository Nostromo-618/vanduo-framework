/**
 * Vanduo Framework - Timepicker Component
 * Dropdown time selection with 12h/24h format and configurable step intervals
 */

(function () {
  'use strict';

  const Timepicker = {
    instances: new Map(),

    init: function () {
      const inputs = document.querySelectorAll('[data-vd-timepicker]');
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
      wrapper.appendChild(popup);

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

      const open = () => {
        render();
        popup.classList.add('is-open');
        input.setAttribute('aria-expanded', 'true');
        // Scroll to selected
        const selected = popup.querySelector('.is-selected');
        if (selected) selected.scrollIntoView({ block: 'center' });
      };

      const close = () => {
        popup.classList.remove('is-open');
        input.setAttribute('aria-expanded', 'false');
      };

      const focusHandler = () => open();
      const outsideHandler = (e) => {
        if (!wrapper.contains(e.target)) close();
      };
      const escHandler = (e) => { if (e.key === 'Escape') close(); };

      input.addEventListener('focus', focusHandler);
      document.addEventListener('click', outsideHandler, true);
      document.addEventListener('keydown', escHandler);
      input.setAttribute('aria-haspopup', 'listbox');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('autocomplete', 'off');
      input.readOnly = true;

      cleanup.push(
        () => input.removeEventListener('focus', focusHandler),
        () => document.removeEventListener('click', outsideHandler, true),
        () => document.removeEventListener('keydown', escHandler)
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
