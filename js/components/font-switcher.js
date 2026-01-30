/**
 * Vanduo Framework - Font Switcher
 * Handles font selection and persistence for previewing different typefaces
 */

(function() {
  'use strict';

  const FontSwitcher = {
    STORAGE_KEY: 'vanduo-font-preference',

    // Available fonts configuration
    fonts: {
      'system': {
        name: 'System Default',
        family: null // Uses CSS default
      },
      'inter': {
        name: 'Inter',
        family: "'Inter', sans-serif"
      },
      'source-sans': {
        name: 'Source Sans 3',
        family: "'Source Sans 3', sans-serif"
      },
      'fira-sans': {
        name: 'Fira Sans',
        family: "'Fira Sans', sans-serif"
      },
      'ibm-plex': {
        name: 'IBM Plex Sans',
        family: "'IBM Plex Sans', sans-serif"
      },
      'jetbrains-mono': {
        name: 'JetBrains Mono',
        family: "'JetBrains Mono', monospace"
      }
    },

    init: function() {
      this.state = {
        preference: this.getPreference()
      };

      this.applyFont();
      this.renderUI();

      console.log('Vanduo Font Switcher initialized');
    },

    /**
     * Get saved font preference from localStorage
     * @returns {string} Font key or 'jetbrains-mono' (default)
     */
    getPreference: function() {
      return localStorage.getItem(this.STORAGE_KEY) || 'jetbrains-mono';
    },

    /**
     * Set font preference and apply it
     * @param {string} fontKey - The font key to apply
     */
    setPreference: function(fontKey) {
      if (!this.fonts[fontKey]) {
        console.warn('Unknown font:', fontKey);
        return;
      }

      this.state.preference = fontKey;
      localStorage.setItem(this.STORAGE_KEY, fontKey);
      this.applyFont();
      this.updateUI();

      // Dispatch custom event for other components to listen to
      const event = new CustomEvent('font:change', {
        bubbles: true,
        detail: { font: fontKey, fontData: this.fonts[fontKey] }
      });
      document.dispatchEvent(event);
    },

    /**
     * Apply the current font preference to the document
     */
    applyFont: function() {
      const fontKey = this.state.preference;

      if (fontKey === 'system') {
        // Remove data-font attribute to use system default
        document.documentElement.removeAttribute('data-font');
      } else {
        // Set data-font attribute which triggers CSS variable override
        document.documentElement.setAttribute('data-font', fontKey);
      }
    },

    /**
     * Initialize UI elements with data-toggle="font"
     */
    renderUI: function() {
      const toggles = document.querySelectorAll('[data-toggle="font"]');

      toggles.forEach(toggle => {
        if (toggle.getAttribute('data-font-initialized')) return;

        if (toggle.tagName === 'SELECT') {
          // Set initial value
          toggle.value = this.state.preference;

          // Listen for changes
          toggle.addEventListener('change', (e) => {
            this.setPreference(e.target.value);
          });
        } else {
          // Button implementation - cycle through fonts
          toggle.addEventListener('click', () => {
            const fontKeys = Object.keys(this.fonts);
            const currentIndex = fontKeys.indexOf(this.state.preference);
            const nextIndex = (currentIndex + 1) % fontKeys.length;
            this.setPreference(fontKeys[nextIndex]);
          });
        }

        toggle.setAttribute('data-font-initialized', 'true');
      });
    },

    /**
     * Update all UI elements to reflect current state
     */
    updateUI: function() {
      const toggles = document.querySelectorAll('[data-toggle="font"]');

      toggles.forEach(toggle => {
        if (toggle.tagName === 'SELECT') {
          toggle.value = this.state.preference;
        } else {
          // Update button text if it has a label span
          const label = toggle.querySelector('.font-current-label');
          if (label) {
            label.textContent = this.fonts[this.state.preference].name;
          }
        }
      });
    },

    /**
     * Get the current font preference
     * @returns {string} Current font key
     */
    getCurrentFont: function() {
      return this.state.preference;
    },

    /**
     * Get font data for a given key
     * @param {string} fontKey - The font key
     * @returns {Object|null} Font data or null
     */
    getFontData: function(fontKey) {
      return this.fonts[fontKey] || null;
    }
  };

  // Register component
  if (window.Vanduo) {
    window.Vanduo.register('fontSwitcher', FontSwitcher);
  } else {
    // Standalone init if Vanduo core isn't present
    document.addEventListener('DOMContentLoaded', () => {
      FontSwitcher.init();
    });
  }

  // Expose globally for convenience
  window.FontSwitcher = FontSwitcher;
})();
