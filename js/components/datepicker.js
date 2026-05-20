/**
 * Vanduo Framework - Datepicker Component
 * Calendar popup attached to input field with month/year navigation
 */

(function () {
  'use strict';

  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function escapeRegexChar(c) {
    return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function buildParseFormat(format) {
    let regex = '^';
    const order = [];
    let i = 0;
    while (i < format.length) {
      const slice = format.slice(i);
      if (slice.toLowerCase().startsWith('yyyy')) {
        regex += '(\\d{4})';
        order.push('y');
        i += 4;
      } else if (slice.toLowerCase().startsWith('mm')) {
        regex += '(\\d{2})';
        order.push('m');
        i += 2;
      } else if (slice.toLowerCase().startsWith('dd')) {
        regex += '(\\d{2})';
        order.push('d');
        i += 2;
      } else {
        regex += escapeRegexChar(format[i]);
        i++;
      }
    }
    regex += '$';
    return { regex: new RegExp(regex), order };
  }

  function parseDateFromFormat(value, format) {
    if (!value || !format) return null;
    const { regex, order } = buildParseFormat(format);
    const m = value.trim().match(regex);
    if (!m) return null;
    let y;
    let mo;
    let d;
    let ci = 1;
    for (let k = 0; k < order.length; k++) {
      const part = order[k];
      const v = parseInt(m[ci++], 10);
      if (Number.isNaN(v)) return null;
      if (part === 'y') y = v;
      else if (part === 'm') mo = v - 1;
      else if (part === 'd') d = v;
    }
    if (y === undefined || mo === undefined || d === undefined) return null;
    const dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
    return dt;
  }

  function formatDate(d, format) {
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    let out = '';
    let i = 0;
    while (i < format.length) {
      const slice = format.slice(i);
      if (slice.toLowerCase().startsWith('yyyy')) {
        out += yyyy;
        i += 4;
      } else if (slice.toLowerCase().startsWith('mm')) {
        out += mm;
        i += 2;
      } else if (slice.toLowerCase().startsWith('dd')) {
        out += dd;
        i += 2;
      } else {
        out += format[i];
        i++;
      }
    }
    return out;
  }

  function dateKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function addDays(d, n) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  }

  function addMonthsClamped(d, n) {
    return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
  }

  function parseYmdLocal(ymd) {
    if (!ymd || typeof ymd !== 'string') return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
    if (!m) return null;
    const y = +m[1];
    const mo = +m[2] - 1;
    const day = +m[3];
    const dt = new Date(y, mo, day);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== day) return null;
    return dt;
  }

  function startOfWeekSunday(d) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = x.getDay();
    x.setDate(x.getDate() - day);
    return x;
  }

  function endOfWeekSunday(d) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = x.getDay();
    x.setDate(x.getDate() + (6 - day));
    return x;
  }

  const Datepicker = {
    instances: new Map(),

    init: function (root) {
      const inputs = window.Vanduo.queryAll(root, '[data-vd-datepicker]');
      inputs.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (input) {
      const cleanup = [];
      const format = input.getAttribute('data-vd-datepicker-format') || 'YYYY-MM-DD';
      const minStr = input.getAttribute('data-vd-datepicker-min');
      const maxStr = input.getAttribute('data-vd-datepicker-max');
      const minDate = minStr ? parseYmdLocal(minStr) : null;
      const maxDate = maxStr ? parseYmdLocal(maxStr) : null;

      const today = new Date();
      let viewYear = today.getFullYear();
      let viewMonth = today.getMonth();
      let selectedDate = null;
      let viewMode = 'days'; // days | months | years
      let focusedDate = null;
      /** Prevents focus() after close from immediately re-opening the popup */
      let skipNextFocusOpen = false;

      const isDisabled = (d) => {
        if (minDate) {
          const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          if (t < minDate.getTime()) return true;
        }
        if (maxDate) {
          const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          if (t > maxDate.getTime()) return true;
        }
        return false;
      };

      const ensureMonthInRange = (y, m) => {
        if (!minDate && !maxDate) return { y: y, m: m };
        const first = new Date(y, m, 1);
        const last = new Date(y, m + 1, 0);
        if (minDate && last.getTime() < minDate.getTime()) {
          return { y: minDate.getFullYear(), m: minDate.getMonth() };
        }
        if (maxDate && first.getTime() > maxDate.getTime()) {
          return { y: maxDate.getFullYear(), m: maxDate.getMonth() };
        }
        return { y: y, m: m };
      };

      const firstSelectableInMonth = (y, m) => {
        const last = new Date(y, m + 1, 0).getDate();
        for (let day = 1; day <= last; day++) {
          const dt = new Date(y, m, day);
          if (!isDisabled(dt)) return dt;
        }
        return new Date(y, m, 1);
      };

      if (input.value) {
        const trimmed = input.value.trim();
        let parsed = parseDateFromFormat(trimmed, format);
        if (!parsed) {
          const fallback = new Date(trimmed);
          if (!isNaN(fallback.getTime())) parsed = fallback;
        }
        if (parsed) {
          selectedDate = parsed;
          viewYear = parsed.getFullYear();
          viewMonth = parsed.getMonth();
        }
      }

      const clampedInit = ensureMonthInRange(viewYear, viewMonth);
      viewYear = clampedInit.y;
      viewMonth = clampedInit.m;

      // Create popup
      const popup = document.createElement('div');
      popup.className = 'vd-datepicker-popup';
      popup.setAttribute('role', 'dialog');
      popup.setAttribute('aria-label', 'Choose date');
      popup.tabIndex = -1;

      const wrapper = document.createElement('div');
      wrapper.className = 'vd-suggest-wrapper';
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      wrapper.appendChild(popup);

      const isSameDay = (a, b) => a && b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

      const selectDate = (date) => {
        selectedDate = date;
        viewYear = date.getFullYear();
        viewMonth = date.getMonth();
        input.value = formatDate(date, format);
        skipNextFocusOpen = true;
        close();
        input.dispatchEvent(new CustomEvent('datepicker:select', {
          detail: { date: date, formatted: input.value },
          bubbles: true
        }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.focus();
      };

      const focusFocusedDay = () => {
        if (viewMode !== 'days' || !focusedDate) return;
        const key = dateKey(focusedDate);
        const btn = popup.querySelector('[data-vd-date="' + key + '"]');
        if (btn && !btn.classList.contains('is-outside') && btn.getAttribute('aria-disabled') !== 'true') {
          btn.focus();
        }
      };

      const skipDisabled = (d, stepDir, maxSteps) => {
        let x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const step = stepDir > 0 ? 1 : -1;
        for (let i = 0; i < maxSteps; i++) {
          if (!isDisabled(x)) return x;
          x = addDays(x, step);
        }
        return d;
      };

      const createDayBtn = (day, outside, date) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'vd-datepicker-day';
        btn.textContent = day;
        btn.setAttribute('role', 'gridcell');

        if (outside) {
          btn.classList.add('is-outside');
          btn.tabIndex = -1;
          btn.setAttribute('aria-disabled', 'true');
          return btn;
        }

        btn.setAttribute('data-vd-date', dateKey(date));

        if (date && isSameDay(date, today)) btn.classList.add('is-today');
        if (date && isSameDay(date, selectedDate)) btn.classList.add('is-selected');
        if (date && isDisabled(date)) {
          btn.classList.add('is-disabled');
          btn.setAttribute('aria-disabled', 'true');
          btn.tabIndex = -1;
          return btn;
        }

        if (date) {
          const isFocused = focusedDate && isSameDay(date, focusedDate);
          btn.tabIndex = isFocused ? 0 : -1;

          btn.addEventListener('click', () => {
            selectedDate = date;
            viewYear = date.getFullYear();
            viewMonth = date.getMonth();
            focusedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            input.value = formatDate(date, format);
            skipNextFocusOpen = true;
            close();
            input.dispatchEvent(new CustomEvent('datepicker:select', {
              detail: { date: date, formatted: input.value },
              bubbles: true
            }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.focus();
          });
        }

        return btn;
      };

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
          const gridWrap = document.createElement('div');
          gridWrap.className = 'vd-datepicker-grid';
          gridWrap.setAttribute('role', 'grid');
          gridWrap.setAttribute('aria-label', 'Calendar');

          const weekdays = document.createElement('div');
          weekdays.className = 'vd-datepicker-weekdays';
          weekdays.setAttribute('role', 'row');
          DAYS.forEach(function (d) {
            const span = document.createElement('span');
            span.setAttribute('role', 'columnheader');
            span.setAttribute('aria-label', d);
            span.textContent = d;
            weekdays.appendChild(span);
          });
          gridWrap.appendChild(weekdays);

          const firstDay = new Date(viewYear, viewMonth, 1).getDay();
          const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
          const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

          const cells = [];

          for (let i = firstDay - 1; i >= 0; i--) {
            const dayNum = daysInPrev - i;
            const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
            const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
            const date = new Date(prevYear, prevMonth, dayNum);
            cells.push({ day: dayNum, outside: true, date: date });
          }

          for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(viewYear, viewMonth, d);
            cells.push({ day: d, outside: false, date: date });
          }

          const totalCells = firstDay + daysInMonth;
          const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
          for (let i = 1; i <= remaining; i++) {
            const date = new Date(viewYear, viewMonth + 1, i);
            cells.push({ day: i, outside: true, date: date });
          }

          for (let r = 0; r < cells.length; r += 7) {
            const row = document.createElement('div');
            row.className = 'vd-datepicker-row';
            row.setAttribute('role', 'row');
            for (let c = 0; c < 7; c++) {
              const cell = cells[r + c];
              row.appendChild(createDayBtn(cell.day, cell.outside, cell.date));
            }
            gridWrap.appendChild(row);
          }

          popup.appendChild(gridWrap);
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

      const handleGridKeydown = (e) => {
        if (!popup.classList.contains('is-open') || viewMode !== 'days') return;
        const grid = popup.querySelector('.vd-datepicker-grid');
        if (!grid || !grid.contains(e.target)) return;

        const key = e.key;
        if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown' &&
            key !== 'Home' && key !== 'End' && key !== 'PageUp' && key !== 'PageDown' &&
            key !== 'Enter' && key !== ' ' && key !== 'Escape') {
          return;
        }

        if (key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          skipNextFocusOpen = true;
          close();
          input.focus();
          return;
        }

        if (!focusedDate) {
          focusedDate = firstSelectableInMonth(viewYear, viewMonth);
        }

        if (key === 'Enter' || key === ' ') {
          e.preventDefault();
          if (focusedDate && !isDisabled(focusedDate)) {
            selectDate(new Date(focusedDate.getFullYear(), focusedDate.getMonth(), focusedDate.getDate()));
          }
          return;
        }

        e.preventDefault();

        let next = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), focusedDate.getDate());
        let skipDir = 1;

        if (key === 'ArrowLeft') {
          next = addDays(next, -1);
          skipDir = -1;
        } else if (key === 'ArrowRight') {
          next = addDays(next, 1);
          skipDir = 1;
        } else if (key === 'ArrowUp') {
          next = addDays(next, -7);
          skipDir = -1;
        } else if (key === 'ArrowDown') {
          next = addDays(next, 7);
          skipDir = 1;
        } else if (key === 'Home') {
          next = startOfWeekSunday(next);
          skipDir = 1;
        } else if (key === 'End') {
          next = endOfWeekSunday(next);
          skipDir = -1;
        } else if (key === 'PageUp') {
          next = addMonthsClamped(next, -1);
          skipDir = -1;
        } else if (key === 'PageDown') {
          next = addMonthsClamped(next, 1);
          skipDir = 1;
        }

        next = skipDisabled(next, skipDir, 400);

        if (next.getMonth() !== viewMonth || next.getFullYear() !== viewYear) {
          viewYear = next.getFullYear();
          viewMonth = next.getMonth();
          const cl = ensureMonthInRange(viewYear, viewMonth);
          viewYear = cl.y;
          viewMonth = cl.m;
        }

        focusedDate = next;
        render();
        requestAnimationFrame(focusFocusedDay);
      };

      const open = () => {
        viewMode = 'days';
        if (selectedDate) {
          viewYear = selectedDate.getFullYear();
          viewMonth = selectedDate.getMonth();
        }
        const cl = ensureMonthInRange(viewYear, viewMonth);
        viewYear = cl.y;
        viewMonth = cl.m;

        if (selectedDate) {
          focusedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        } else {
          focusedDate = firstSelectableInMonth(viewYear, viewMonth);
        }

        render();
        popup.classList.add('is-open');
        input.setAttribute('aria-expanded', 'true');
        requestAnimationFrame(focusFocusedDay);
      };

      const close = () => {
        popup.classList.remove('is-open');
        input.setAttribute('aria-expanded', 'false');
        viewMode = 'days';
      };

      const focusHandler = () => {
        if (skipNextFocusOpen) {
          skipNextFocusOpen = false;
          return;
        }
        open();
      };
      const outsideHandler = (e) => {
        if (!wrapper.contains(e.target)) close();
      };
      const escHandler = (e) => {
        if (e.key === 'Escape' && popup.classList.contains('is-open')) {
          skipNextFocusOpen = true;
          close();
          input.focus();
        }
      };

      input.addEventListener('focus', focusHandler);
      document.addEventListener('click', outsideHandler, true);
      document.addEventListener('keydown', escHandler);
      popup.addEventListener('keydown', handleGridKeydown);

      input.setAttribute('aria-haspopup', 'dialog');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('autocomplete', 'off');

      cleanup.push(
        () => input.removeEventListener('focus', focusHandler),
        () => document.removeEventListener('click', outsideHandler, true),
        () => document.removeEventListener('keydown', escHandler),
        () => popup.removeEventListener('keydown', handleGridKeydown)
      );

      this.instances.set(input, { cleanup: cleanup, open: open, close: close, popup: popup });
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
