/**
 * Vanduo Framework - Font Switcher
 * Handles font selection and persistence for previewing different typefaces
 */

(function() {
  'use strict';

  const FontSwitcher = {
    STORAGE_KEY: 'vanduo-font-preference',
    isInitialized: false,

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
      },
      'ubuntu': {
        name: 'Ubuntu',
        family: "'Ubuntu', sans-serif",
        category: 'sans-serif',
        description: 'Friendly, humanist sans-serif'
      },
      'open-sans': {
        name: 'Open Sans',
        family: "'Open Sans', sans-serif",
        category: 'sans-serif',
        description: 'Neutral, highly readable'
      },
      'rubik': {
        name: 'Rubik',
        family: "'Rubik', sans-serif",
        category: 'sans-serif',
        description: 'Modern, geometric'
      },
      'titillium-web': {
        name: 'Titillium Web',
        family: "'Titillium Web', sans-serif",
        category: 'sans-serif',
        description: 'Technical, elegant'
      }
    },

    init: function() {
      this.state = {
        preference: this.getPreference()
      };

      if (this.isInitialized) {
        this.applyFont();
        this.renderUI();
        this.updateUI();
        return;
      }

      this.isInitialized = true;

      this.applyFont();
      this.renderUI();

      console.log('Vanduo Font Switcher initialized');
    },

    /**
     * Get saved font preference from localStorage
     * @returns {string} Font key or 'ubuntu' (default)
     */
    getPreference: function() {
      return this.getStorageValue(this.STORAGE_KEY, 'ubuntu');
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
      this.setStorageValue(this.STORAGE_KEY, fontKey);
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
        if (toggle.getAttribute('data-font-initialized') === 'true') {
          if (toggle.tagName === 'SELECT') {
            toggle.value = this.state.preference;
          }
          return;
        }

        if (toggle.tagName === 'SELECT') {
          // Set initial value
          toggle.value = this.state.preference;

          // Listen for changes
          const onChange = (e) => {
            this.setPreference(e.target.value);
          };
          toggle.addEventListener('change', onChange);
          toggle._fontToggleHandler = onChange;
        } else {
          // Button implementation - cycle through fonts
          const onClick = () => {
            const fontKeys = Object.keys(this.fonts);
            const currentIndex = fontKeys.indexOf(this.state.preference);
            const nextIndex = (currentIndex + 1) % fontKeys.length;
            this.setPreference(fontKeys[nextIndex]);
          };
          toggle.addEventListener('click', onClick);
          toggle._fontToggleHandler = onClick;
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
    },

    destroyAll: function() {
      const toggles = document.querySelectorAll('[data-toggle="font"][data-font-initialized="true"]');
      toggles.forEach(toggle => {
        if (toggle._fontToggleHandler) {
          const eventName = toggle.tagName === 'SELECT' ? 'change' : 'click';
          toggle.removeEventListener(eventName, toggle._fontToggleHandler);
          delete toggle._fontToggleHandler;
        }
        toggle.removeAttribute('data-font-initialized');
      });

      this.isInitialized = false;
    },

    getStorageValue: function(key, fallback) {
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

    setStorageValue: function(key, value) {
      if (typeof safeStorageSet === 'function') {
        return safeStorageSet(key, value);
      }
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (_e) {
        return false;
      }
    }
  };

  // Register component
  if (window.Vanduo) {
    window.Vanduo.register('fontSwitcher', FontSwitcher);
  }

  // Expose globally for convenience
  window.FontSwitcher = FontSwitcher;
})();
