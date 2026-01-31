/**
 * Vanduo Framework - Theme Switcher
 * Handles light/dark/system theme toggling and persistence
 */

(function () {
  'use strict';

  const ThemeSwitcher = {
    init: function () {
      this.STORAGE_KEY = 'vanduo-theme-preference';
      this.state = {
        preference: this.getPreference() // 'light', 'dark', or 'system'
      };

      this.applyTheme();
      this.listenForSystemChanges();
      this.renderUI();

      console.log('Vanduo Theme Switcher initialized');
    },

    getPreference: function () {
      return localStorage.getItem(this.STORAGE_KEY) || 'system';
    },

    setPreference: function (pref) {
      this.state.preference = pref;
      localStorage.setItem(this.STORAGE_KEY, pref);
      this.applyTheme();
      this.updateUI();
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
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', _e => {
        if (this.state.preference === 'system') {
          // Re-apply (effectively just to ensure consistency, though removing attribute usually suffices)
          this.applyTheme();
        }
      });
    },

    // Helper to facilitate UI creation if needed, though often UI is in HTML
    renderUI: function () {
      // Look for any uninitialized theme toggles
      const toggles = document.querySelectorAll('[data-toggle="theme"]');
      toggles.forEach(toggle => {
        // Simplified UI Binding - assumes a select or a button cycle
        if (toggle.tagName === 'SELECT') {
          toggle.value = this.state.preference;
          toggle.addEventListener('change', (e) => {
            this.setPreference(e.target.value);
          });
        } else {
          // Button implementation (cycle)
          toggle.addEventListener('click', () => {
            const modes = ['system', 'light', 'dark'];
            const nextIndex = (modes.indexOf(this.state.preference) + 1) % modes.length;
            this.setPreference(modes[nextIndex]);
          });
        }
        // Mark as initialized
        toggle.setAttribute('data-initialized', 'true');
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
    }
  };

  // Register component
  if (window.Vanduo) {
    window.Vanduo.register('themeSwitcher', ThemeSwitcher);
  } else {
    // Standalone init if Vanduo core isn't present
    document.addEventListener('DOMContentLoaded', () => {
      ThemeSwitcher.init();
    });
  }
})();
