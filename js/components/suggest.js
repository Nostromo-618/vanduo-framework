/**
 * Vanduo Framework - Suggest (Autocomplete) Component
 * Dropdown suggestion list with keyboard navigation, static/async data sources
 */

(function () {
  'use strict';

  /**
   * Allow same-origin URLs by default, or an explicit allowlist of origins.
   * @param {string} url
   * @param {string[]} allowlist
   * @returns {boolean}
   */
  function _isSafeUrl(url, allowlist) {
    try {
      const resolved = new URL(url, window.location.href);
      if (resolved.origin === window.location.origin) return true;
      return allowlist.includes(resolved.origin);
    } catch (_e) {
      return false;
    }
  }

  const Suggest = {
    instances: new Map(),

    init: function (root) {
      const inputs = window.Vanduo.queryAll(root, '[data-vd-suggest], [data-vd-autocomplete]');
      inputs.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (input) {
      const cleanup = [];
      const minChars = parseInt(input.getAttribute('data-vd-suggest-min-chars') || '1', 10);
      const url = input.getAttribute('data-vd-suggest-url') || '';
      const allowlistAttr = input.getAttribute('data-vd-suggest-allowlist') || '';
      const allowlist = allowlistAttr
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
      const staticData = input.getAttribute('data-vd-suggest') || input.getAttribute('data-vd-autocomplete') || '';
      let items = [];

      try { items = JSON.parse(staticData); } catch (_e) {
        items = staticData.split(',').map(s => s.trim()).filter(Boolean);
      }

      // Wrap input if not already wrapped
      let wrapper = input.closest('.vd-suggest-wrapper, .vd-autocomplete-wrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'vd-suggest-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
      }

      // Create dropdown list
      const list = document.createElement('ul');
      list.className = 'vd-suggest-list';
      list.setAttribute('role', 'listbox');
      const listId = 'vd-suggest-' + Math.random().toString(36).slice(2, 9);
      list.id = listId;
      wrapper.appendChild(list);

      // ARIA
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('aria-controls', listId);
      input.setAttribute('autocomplete', 'off');

      let highlighted = -1;
      let currentItems = [];
      let debounceTimer = null;

      const renderItems = (filtered, query) => {
        list.innerHTML = '';
        currentItems = filtered;
        highlighted = -1;

        if (filtered.length === 0) {
          const empty = document.createElement('li');
          empty.className = 'vd-suggest-empty';
          empty.textContent = 'No results';
          list.appendChild(empty);
          return;
        }

        filtered.forEach((item, i) => {
          const li = document.createElement('li');
          li.className = 'vd-suggest-item';
          li.setAttribute('role', 'option');
          li.id = listId + '-item-' + i;

          const text = typeof item === 'object' ? (item.label || item.text || String(item)) : String(item);
          if (query) {
            const lowerText = text.toLowerCase();
            const lowerQuery = query.toLowerCase();
            let start = 0;
            let matchIndex = lowerText.indexOf(lowerQuery, start);
            while (matchIndex !== -1) {
              if (matchIndex > start) {
                li.appendChild(document.createTextNode(text.slice(start, matchIndex)));
              }
              const matchSpan = document.createElement('span');
              matchSpan.className = 'vd-suggest-match';
              matchSpan.textContent = text.slice(matchIndex, matchIndex + query.length);
              li.appendChild(matchSpan);
              start = matchIndex + query.length;
              matchIndex = lowerText.indexOf(lowerQuery, start);
            }
            if (start < text.length) {
              li.appendChild(document.createTextNode(text.slice(start)));
            }
          } else {
            li.textContent = text;
          }

          li.addEventListener('click', () => selectItem(i));
          list.appendChild(li);
        });
      };

      const open = () => {
        list.classList.add('is-open');
        input.setAttribute('aria-expanded', 'true');
      };

      const close = () => {
        list.classList.remove('is-open');
        input.setAttribute('aria-expanded', 'false');
        highlighted = -1;
        input.removeAttribute('aria-activedescendant');
      };

      const selectItem = (index) => {
        const item = currentItems[index];
        const value = typeof item === 'object' ? (item.value || item.label || String(item)) : String(item);
        input.value = value;
        close();
        input.dispatchEvent(new CustomEvent('suggest:select', {
          detail: { value, item, index },
          bubbles: true
        }));
      };

      const highlight = (index) => {
        const listItems = list.querySelectorAll('.vd-suggest-item');
        listItems.forEach(li => li.classList.remove('is-highlighted'));
        if (index >= 0 && index < listItems.length) {
          highlighted = index;
          listItems[index].classList.add('is-highlighted');
          input.setAttribute('aria-activedescendant', listItems[index].id);
          listItems[index].scrollIntoView({ block: 'nearest' });
        }
      };

      const doSearch = async (query) => {
        if (query.length < minChars) { close(); return; }

        let filtered;
        if (url) {
          try {
            if (!_isSafeUrl(url, allowlist)) {
              console.warn('[VanduoSuggest] Blocked non-allowlisted URL:', url);
              filtered = [];
            } else {
              const separator = url.includes('?') ? '&' : '?';
              const res = await window.fetch(url + separator + 'q=' + encodeURIComponent(query));
              filtered = await res.json();
            }
          } catch (_e) {
            filtered = [];
          }
        } else {
          const lower = query.toLowerCase();
          filtered = items.filter(item => {
            const text = typeof item === 'object' ? (item.label || item.text || String(item)) : String(item);
            return text.toLowerCase().includes(lower);
          });
        }

        renderItems(filtered, query);
        if (filtered.length > 0) open();
        else open(); // show "no results"
      };

      const inputHandler = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => doSearch(input.value), 200);
      };

      const keyHandler = (e) => {
        if (!list.classList.contains('is-open')) {
          if (e.key === 'ArrowDown') { doSearch(input.value); e.preventDefault(); }
          return;
        }

        const total = currentItems.length;
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            highlight(highlighted < total - 1 ? highlighted + 1 : 0);
            break;
          case 'ArrowUp':
            e.preventDefault();
            highlight(highlighted > 0 ? highlighted - 1 : total - 1);
            break;
          case 'Enter':
            e.preventDefault();
            if (highlighted >= 0) selectItem(highlighted);
            break;
          case 'Escape':
            close();
            break;
        }
      };

      const blurHandler = () => {
        setTimeout(close, 200);
      };
      const focusHandler = () => {
        if (input.value.length >= minChars) {
          doSearch(input.value);
        }
      };

      input.addEventListener('input', inputHandler);
      input.addEventListener('keydown', keyHandler);
      input.addEventListener('blur', blurHandler);
      input.addEventListener('focus', focusHandler);

      cleanup.push(
        () => input.removeEventListener('input', inputHandler),
        () => input.removeEventListener('keydown', keyHandler),
        () => input.removeEventListener('blur', blurHandler),
        () => input.removeEventListener('focus', focusHandler),
        () => clearTimeout(debounceTimer),
        () => { if (list.parentNode) list.parentNode.removeChild(list); }
      );

      this.instances.set(input, { cleanup, list, close });
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
    window.Vanduo.register('suggest', Suggest);
  }

  window.VanduoSuggest = Suggest;

})();
