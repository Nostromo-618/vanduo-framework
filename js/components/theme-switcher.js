/**
 * Vanduo Framework - Theme Switcher
 * Handles light/dark/system theme toggling and persistence
 */

(function () {
  'use strict';

  const ThemeSwitcher = {
    isInitialized: false,
    _mediaQuery: null,
    _onMediaChange: null,

    init: function () {
      this.STORAGE_KEY = 'vanduo-theme-preference';
      this.state = {
        preference: this.getPreference() // 'light', 'dark', or 'system'
      };

      if (this.isInitialized) {
        this.applyTheme();
        this.renderUI();
        this.updateUI();
        return;
      }

      this.isInitialized = true;

      this.applyTheme();
      this.listenForSystemChanges();
      this.renderUI();

      console.log('Vanduo Theme Switcher initialized');
    },

    getPreference: function () {
      return this.getStorageValue(this.STORAGE_KEY, 'system');
    },

    setPreference: function (pref) {
      this.state.preference = pref;
      this.setStorageValue(this.STORAGE_KEY, pref);
      this.applyTheme();
      this.updateUI();
    },

    getStorageValue: function (key, fallback) {
      if (typeof safeStorageGet === 'function') {
        return safeStorageGet(key, fallback);
      }
      try {
        const value = localStorage.getItem(key);
        return value !== null ? value : fallback;
      } catch (_e) {
        return fallback;
      }
    },

    setStorageValue: function (key, value) {
      if (typeof safeStorageSet === 'function') {
        return safeStorageSet(key, value);
      }
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (_e) {
        return false;
      }
    },

    applyTheme: function () {
      const pref = this.state.preference;
      let themeToApply = pref;

      if (pref === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        themeToApply = systemDark ? 'dark' : 'light';
        // When in system mode, we remove the data attribute to let the media query take over
        // or we can explicitly set it. Explicitly setting it ensures consistency if we rely on [data-theme]
        // But if we rely on @media in CSS, we might want to remove attributes.
        // However, our CSS strategy uses :root:not([data-theme="light"]) inside media query for system dark fallback
        // which is a bit complex.

        // Simpler approach: 
        // If preference is system, REMOVE data-theme attribute. Let CSS media queries handle it.
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', themeToApply);
      }
    },

    listenForSystemChanges: function () {
      if (this._mediaQuery && this._onMediaChange) {
        return;
      }

      this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this._onMediaChange = _e => {
        if (this.state.preference === 'system') {
          // Re-apply (effectively just to ensure consistency, though removing attribute usually suffices)
          this.applyTheme();
        }
      };
      this._mediaQuery.addEventListener('change', this._onMediaChange);
    },

    // Helper to facilitate UI creation if needed, though often UI is in HTML
    renderUI: function () {
      // Look for any uninitialized theme toggles
      const toggles = document.querySelectorAll('[data-toggle="theme"]');
      toggles.forEach(toggle => {
        if (toggle.getAttribute('data-theme-initialized') === 'true') {
          if (toggle.tagName === 'SELECT') {
            toggle.value = this.state.preference;
          }
          return;
        }

        // Simplified UI Binding - assumes a select or a button cycle
        if (toggle.tagName === 'SELECT') {
          toggle.value = this.state.preference;
          const onChange = (e) => {
            this.setPreference(e.target.value);
          };
          toggle.addEventListener('change', onChange);
          toggle._themeToggleHandler = onChange;
        } else {
          // Button implementation (cycle)
          const onClick = () => {
            const modes = ['system', 'light', 'dark'];
            const nextIndex = (modes.indexOf(this.state.preference) + 1) % modes.length;
            this.setPreference(modes[nextIndex]);
          };
          toggle.addEventListener('click', onClick);
          toggle._themeToggleHandler = onClick;
        }
        // Mark as initialized
        toggle.setAttribute('data-theme-initialized', 'true');
      });
    },

    updateUI: function () {
      const toggles = document.querySelectorAll('[data-toggle="theme"]');
      toggles.forEach(toggle => {
        if (toggle.tagName === 'SELECT') {
          toggle.value = this.state.preference;
        } else {
          // Update button text/icon if needed
          // e.g. toggle.textContent = this.state.preference;
          // For now, assume the user handles visual state or generic text

          // If there is an icon or text span inside, update it
          const span = toggle.querySelector('.theme-current-label');
          if (span) {
            span.textContent = this.state.preference.charAt(0).toUpperCase() + this.state.preference.slice(1);
          }
        }
      });
    },

    destroyAll: function () {
      const toggles = document.querySelectorAll('[data-toggle="theme"][data-theme-initialized="true"]');
      toggles.forEach(toggle => {
        if (toggle._themeToggleHandler) {
          const eventName = toggle.tagName === 'SELECT' ? 'change' : 'click';
          toggle.removeEventListener(eventName, toggle._themeToggleHandler);
          delete toggle._themeToggleHandler;
        }
        toggle.removeAttribute('data-theme-initialized');
      });

      if (this._mediaQuery && this._onMediaChange) {
        this._mediaQuery.removeEventListener('change', this._onMediaChange);
      }

      this._mediaQuery = null;
      this._onMediaChange = null;
      this.isInitialized = false;
    }
  };

  // Register component
  if (window.Vanduo) {
    window.Vanduo.register('themeSwitcher', ThemeSwitcher);
  }
})();
