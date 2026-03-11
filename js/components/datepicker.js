/**
 * Vanduo Framework - Datepicker Component
 * Calendar popup attached to input field with month/year navigation
 */

(function () {
  'use strict';

  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const Datepicker = {
    instances: new Map(),

    init: function () {
      const inputs = document.querySelectorAll('[data-vd-datepicker]');
      inputs.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (input) {
      const cleanup = [];
      const format = input.getAttribute('data-vd-datepicker-format') || 'yyyy-mm-dd';
      const minStr = input.getAttribute('data-vd-datepicker-min');
      const maxStr = input.getAttribute('data-vd-datepicker-max');
      const minDate = minStr ? new Date(minStr) : null;
      const maxDate = maxStr ? new Date(maxStr) : null;

      const today = new Date();
      let viewYear = today.getFullYear();
      let viewMonth = today.getMonth();
      let selectedDate = null;
      let viewMode = 'days'; // days | months | years

      // Parse existing value
      if (input.value) {
        const parsed = new Date(input.value);
        if (!isNaN(parsed.getTime())) {
          selectedDate = parsed;
          viewYear = parsed.getFullYear();
          viewMonth = parsed.getMonth();
        }
      }

      // Create popup
      const popup = document.createElement('div');
      popup.className = 'vd-datepicker-popup';
      popup.setAttribute('role', 'dialog');
      popup.setAttribute('aria-label', 'Choose date');

      const wrapper = document.createElement('div');
      wrapper.className = 'vd-suggest-wrapper';
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      wrapper.appendChild(popup);

      const formatDate = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return format.replace('yyyy', yyyy).replace('mm', mm).replace('dd', dd);
      };

      const isDisabled = (d) => {
        if (minDate && d < minDate) return true;
        if (maxDate && d > maxDate) return true;
        return false;
      };

      const isSameDay = (a, b) => a && b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

      const render = () => {
        popup.innerHTML = '';

        // Header
        const header = document.createElement('div');
        header.className = 'vd-datepicker-header';

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'vd-datepicker-prev';
        prevBtn.innerHTML = '&#8249;';
        prevBtn.setAttribute('aria-label', 'Previous');

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'vd-datepicker-next';
        nextBtn.innerHTML = '&#8250;';
        nextBtn.setAttribute('aria-label', 'Next');

        const title = document.createElement('span');
        title.className = 'vd-datepicker-title';

        if (viewMode === 'days') {
          title.textContent = MONTHS[viewMonth] + ' ' + viewYear;
          title.addEventListener('click', () => { viewMode = 'months'; render(); });
          prevBtn.addEventListener('click', () => { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } render(); });
          nextBtn.addEventListener('click', () => { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } render(); });
        } else if (viewMode === 'months') {
          title.textContent = String(viewYear);
          title.addEventListener('click', () => { viewMode = 'years'; render(); });
          prevBtn.addEventListener('click', () => { viewYear--; render(); });
          nextBtn.addEventListener('click', () => { viewYear++; render(); });
        } else {
          const decadeStart = Math.floor(viewYear / 10) * 10;
          title.textContent = decadeStart + ' - ' + (decadeStart + 9);
          prevBtn.addEventListener('click', () => { viewYear -= 10; render(); });
          nextBtn.addEventListener('click', () => { viewYear += 10; render(); });
        }

        header.appendChild(prevBtn);
        header.appendChild(title);
        header.appendChild(nextBtn);
        popup.appendChild(header);

        if (viewMode === 'days') {
          // Weekday headers
          const weekdays = document.createElement('div');
          weekdays.className = 'vd-datepicker-weekdays';
          DAYS.forEach(d => {
            const span = document.createElement('span');
            span.textContent = d;
            weekdays.appendChild(span);
          });
          popup.appendChild(weekdays);

          // Days grid
          const grid = document.createElement('div');
          grid.className = 'vd-datepicker-days';

          const firstDay = new Date(viewYear, viewMonth, 1).getDay();
          const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
          const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

          // Previous month padding
          for (let i = firstDay - 1; i >= 0; i--) {
            const btn = createDayBtn(daysInPrev - i, true);
            grid.appendChild(btn);
          }

          // Current month
          for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(viewYear, viewMonth, d);
            const btn = createDayBtn(d, false, date);
            grid.appendChild(btn);
          }

          // Next month padding
          const totalCells = firstDay + daysInMonth;
          const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
          for (let i = 1; i <= remaining; i++) {
            const btn = createDayBtn(i, true);
            grid.appendChild(btn);
          }

          popup.appendChild(grid);
        } else if (viewMode === 'months') {
          const grid = document.createElement('div');
          grid.className = 'vd-datepicker-months';
          MONTHS.forEach((name, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'vd-datepicker-month-btn';
            btn.textContent = name.slice(0, 3);
            if (selectedDate && selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === i) {
              btn.classList.add('is-selected');
            }
            btn.addEventListener('click', () => { viewMonth = i; viewMode = 'days'; render(); });
            grid.appendChild(btn);
          });
          popup.appendChild(grid);
        } else {
          const grid = document.createElement('div');
          grid.className = 'vd-datepicker-years';
          const decadeStart = Math.floor(viewYear / 10) * 10;
          for (let y = decadeStart - 1; y <= decadeStart + 10; y++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'vd-datepicker-year-btn';
            btn.textContent = y;
            if (selectedDate && selectedDate.getFullYear() === y) btn.classList.add('is-selected');
            if (y < decadeStart || y > decadeStart + 9) btn.style.opacity = '0.4';
            btn.addEventListener('click', () => { viewYear = y; viewMode = 'months'; render(); });
            grid.appendChild(btn);
          }
          popup.appendChild(grid);
        }
      };

      const createDayBtn = (day, outside, date) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'vd-datepicker-day';
        btn.textContent = day;

        if (outside) {
          btn.classList.add('is-outside');
          btn.tabIndex = -1;
          return btn;
        }

        if (date && isSameDay(date, today)) btn.classList.add('is-today');
        if (date && isSameDay(date, selectedDate)) btn.classList.add('is-selected');
        if (date && isDisabled(date)) {
          btn.classList.add('is-disabled');
          return btn;
        }

        if (date) {
          btn.addEventListener('click', () => {
            selectedDate = date;
            viewYear = date.getFullYear();
            viewMonth = date.getMonth();
            input.value = formatDate(date);
            close();
            input.dispatchEvent(new CustomEvent('datepicker:select', {
              detail: { date, formatted: input.value },
              bubbles: true
            }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          });
        }

        return btn;
      };

      const open = () => {
        render();
        popup.classList.add('is-open');
        input.setAttribute('aria-expanded', 'true');
      };

      const close = () => {
        popup.classList.remove('is-open');
        input.setAttribute('aria-expanded', 'false');
        viewMode = 'days';
      };

      // Events
      const focusHandler = () => open();
      const outsideHandler = (e) => {
        if (!wrapper.contains(e.target)) close();
      };
      const escHandler = (e) => { if (e.key === 'Escape') close(); };

      input.addEventListener('focus', focusHandler);
      document.addEventListener('click', outsideHandler, true);
      document.addEventListener('keydown', escHandler);
      input.setAttribute('aria-haspopup', 'dialog');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('autocomplete', 'off');

      cleanup.push(
        () => input.removeEventListener('focus', focusHandler),
        () => document.removeEventListener('click', outsideHandler, true),
        () => document.removeEventListener('keydown', escHandler)
      );

      this.instances.set(input, { cleanup, open, close, popup });
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
    window.Vanduo.register('datepicker', Datepicker);
  }

  window.VanduoDatepicker = Datepicker;

})();
