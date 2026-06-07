/**
 * Vanduo Framework - Theme Switcher
 * Handles light/dark/system theme toggling and persistence
 */

(function () {
  'use strict';

  const THEME_MODES = ['system', 'light', 'dark'];

  const THEME_ICON_CLASSES = {
    system: 'ph ph-desktop',
    light: 'ph ph-sun',
    dark: 'ph ph-moon'
  };

  const THEME_LABELS = {
    system: 'Theme: System',
    light: 'Theme: Light',
    dark: 'Theme: Dark'
  };

  const THEME_OPTION_TOOLTIPS = {
    system: 'Use system preference',
    light: 'Light theme',
    dark: 'Dark theme'
  };

  const ThemeSwitcher = {
    isInitialized: false,
    _mediaQuery: null,
    _onMediaChange: null,
    menuInstances: new Map(),

    getToggles: function (root) {
      const scope = root || document;
      const toggles = window.Vanduo && typeof window.Vanduo.queryAll === 'function'
        ? window.Vanduo.queryAll(scope, '[data-toggle="theme"]')
        : Array.from(scope.querySelectorAll('[data-toggle="theme"]'));

      return toggles.filter(function (toggle) {
        return !toggle.closest('.vd-theme-switcher[data-theme-ui="menu"]');
      });
    },

    getMenuSwitchers: function (root) {
      if (window.Vanduo && typeof window.Vanduo.queryAll === 'function') {
        return window.Vanduo.queryAll(root, '.vd-theme-switcher[data-theme-ui="menu"]');
      }

      return Array.from(document.querySelectorAll('.vd-theme-switcher[data-theme-ui="menu"]'));
    },

    init: function (root) {
      this.STORAGE_KEY = 'vanduo-theme-preference';
      this.state = {
        preference: this.getPreference()
      };

      if (this.isInitialized) {
        this.applyTheme();
        this.renderUI(root);
        this.updateUI(root);
        return;
      }

      this.isInitialized = true;

      this.applyTheme();
      this.listenForSystemChanges();
      this.renderUI(root);
    },

    getPreference: function () {
      return this.getStorageValue(this.STORAGE_KEY, 'system');
    },

    setPreference: function (pref) {
      if (!THEME_MODES.includes(pref)) {
        return;
      }

      this.state.preference = pref;
      this.setStorageValue(this.STORAGE_KEY, pref);
      this.applyTheme();

      if (window.ThemeCustomizer && window.ThemeCustomizer.applyTheme && !window.ThemeCustomizer._isApplying) {
        window.ThemeCustomizer.applyTheme(pref);
      }

      this.updateUI();
    },

    getStorageValue: function (key, fallback) {
      if (typeof window.safeStorageGet === 'function') {
        return window.safeStorageGet(key, fallback);
      }
      try {
        const value = localStorage.getItem(key);
        return value !== null ? value : fallback;
      } catch (_e) {
        return fallback;
      }
    },

    setStorageValue: function (key, value) {
      if (typeof window.safeStorageSet === 'function') {
        return window.safeStorageSet(key, value);
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

      if (pref === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', pref);
      }
    },

    listenForSystemChanges: function () {
      if (this._mediaQuery && this._onMediaChange) {
        return;
      }

      this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this._onMediaChange = _e => {
        if (this.state.preference === 'system') {
          this.applyTheme();
          if (window.ThemeCustomizer && typeof window.ThemeCustomizer.applyTheme === 'function' && !window.ThemeCustomizer._isApplying) {
            window.ThemeCustomizer.applyTheme('system');
          }
        }
      };
      this._mediaQuery.addEventListener('change', this._onMediaChange);
    },

    renderUI: function (root) {
      this.renderMenuSwitchers(root);

      const toggles = this.getToggles(root);
      toggles.forEach(toggle => {
        if (toggle.getAttribute('data-theme-initialized') === 'true') {
          if (toggle.tagName === 'SELECT') {
            toggle.value = this.state.preference;
          }
          return;
        }

        if (toggle.tagName === 'SELECT') {
          toggle.value = this.state.preference;
          const onChange = (e) => {
            this.setPreference(e.target.value);
          };
          toggle.addEventListener('change', onChange);
          toggle._themeToggleHandler = onChange;
        } else {
          const onClick = () => {
            const modes = THEME_MODES;
            const nextIndex = (modes.indexOf(this.state.preference) + 1) % modes.length;
            this.setPreference(modes[nextIndex]);
          };
          toggle.addEventListener('click', onClick);
          toggle._themeToggleHandler = onClick;
        }

        toggle.setAttribute('data-theme-initialized', 'true');
      });

      this.updateUI(root);
    },

    renderMenuSwitchers: function (root) {
      const switchers = this.getMenuSwitchers(root);

      switchers.forEach(switcher => {
        if (switcher.getAttribute('data-theme-menu-initialized') === 'true') {
          return;
        }

        const toggle = switcher.querySelector('.vd-theme-switcher-toggle');
        const menu = switcher.querySelector('.vd-theme-switcher-menu');

        if (!toggle || !menu) {
          return;
        }

        const options = menu.querySelectorAll('[data-theme-value]');
        const cleanupFunctions = [];

        toggle.setAttribute('aria-haspopup', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');

        const toggleClickHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleMenu(switcher, toggle, menu);
        };
        toggle.addEventListener('click', toggleClickHandler);
        cleanupFunctions.push(() => toggle.removeEventListener('click', toggleClickHandler));

        options.forEach(option => {
          const optionClickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const value = option.getAttribute('data-theme-value');
            if (value) {
              this.setPreference(value);
            }
            this.closeMenu(switcher, toggle, menu);
          };
          option.addEventListener('click', optionClickHandler);
          cleanupFunctions.push(() => option.removeEventListener('click', optionClickHandler));

          const optionKeydownHandler = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              optionClickHandler(e);
            }
          };
          option.addEventListener('keydown', optionKeydownHandler);
          cleanupFunctions.push(() => option.removeEventListener('keydown', optionKeydownHandler));
        });

        const toggleKeydownHandler = (e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!menu.classList.contains('is-open')) {
              this.openMenu(switcher, toggle, menu);
            }
          } else if (e.key === 'Escape' && menu.classList.contains('is-open')) {
            e.preventDefault();
            this.closeMenu(switcher, toggle, menu);
          }
        };
        toggle.addEventListener('keydown', toggleKeydownHandler);
        cleanupFunctions.push(() => toggle.removeEventListener('keydown', toggleKeydownHandler));

        const menuKeydownHandler = (e) => {
          this.handleMenuKeydown(e, switcher, toggle, menu, options);
        };
        menu.addEventListener('keydown', menuKeydownHandler);
        cleanupFunctions.push(() => menu.removeEventListener('keydown', menuKeydownHandler));

        const documentClickHandler = (e) => {
          if (!switcher.contains(e.target) && menu.classList.contains('is-open')) {
            this.closeMenu(switcher, toggle, menu);
          }
        };
        document.addEventListener('click', documentClickHandler);
        cleanupFunctions.push(() => document.removeEventListener('click', documentClickHandler));

        this.menuInstances.set(switcher, { toggle, menu, cleanup: cleanupFunctions });
        switcher.setAttribute('data-theme-menu-initialized', 'true');

        this.initMenuTooltips(switcher);
      });
    },

    initMenuTooltips: function (switcher) {
      const tooltips = window.Vanduo && typeof window.Vanduo.getComponent === 'function'
        ? window.Vanduo.getComponent('tooltips')
        : null;

      if (tooltips && typeof tooltips.init === 'function') {
        tooltips.init(switcher);
      }
    },

    closeOtherMenus: function (exceptMenu) {
      this.menuInstances.forEach((instance, switcher) => {
        if (instance.menu !== exceptMenu && instance.menu.classList.contains('is-open')) {
          this.closeMenu(switcher, instance.toggle, instance.menu);
        }
      });
    },

    toggleMenu: function (switcher, toggle, menu) {
      if (menu.classList.contains('is-open')) {
        this.closeMenu(switcher, toggle, menu);
      } else {
        this.openMenu(switcher, toggle, menu);
      }
    },

    openMenu: function (switcher, toggle, menu) {
      this.closeOtherMenus(menu);
      switcher.classList.add('is-open');
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');

      const activeOption = menu.querySelector('[data-theme-value].is-active')
        || menu.querySelector('[data-theme-value]');
      if (activeOption) {
        setTimeout(() => activeOption.focus(), 0);
      }
    },

    closeMenu: function (switcher, toggle, menu) {
      switcher.classList.remove('is-open');
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    },

    handleMenuKeydown: function (e, switcher, toggle, menu, options) {
      const items = Array.from(options);
      const currentIndex = items.indexOf(document.activeElement);

      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeMenu(switcher, toggle, menu);
        toggle.focus();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex].focus();
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex].focus();
      }
    },

    updateMenuSwitcher: function (switcher) {
      const toggle = switcher.querySelector('.vd-theme-switcher-toggle');
      const menu = switcher.querySelector('.vd-theme-switcher-menu');
      if (!toggle || !menu) {
        return;
      }

      const pref = this.state.preference;
      const icon = toggle.querySelector('[data-theme-icon]');
      const label = THEME_LABELS[pref] || THEME_LABELS.system;

      if (icon) {
        icon.className = THEME_ICON_CLASSES[pref] || THEME_ICON_CLASSES.system;
      }

      toggle.setAttribute('aria-label', label);
      if (toggle.hasAttribute('data-tooltip')) {
        toggle.setAttribute('data-tooltip', label);
        this.refreshTooltipContent(toggle, label);
      }

      menu.querySelectorAll('[data-theme-value]').forEach(option => {
        const value = option.getAttribute('data-theme-value');
        const isActive = value === pref;
        option.classList.toggle('is-active', isActive);
        option.setAttribute('aria-checked', isActive ? 'true' : 'false');

        const tooltipText = THEME_OPTION_TOOLTIPS[value];
        if (tooltipText && option.hasAttribute('data-tooltip')) {
          option.setAttribute('data-tooltip', tooltipText);
          this.refreshTooltipContent(option, tooltipText);
        }
      });
    },

    refreshTooltipContent: function (element, text) {
      const tooltips = window.Vanduo && typeof window.Vanduo.getComponent === 'function'
        ? window.Vanduo.getComponent('tooltips')
        : null;

      if (!tooltips || !tooltips.tooltips || !tooltips.tooltips.has(element)) {
        return;
      }

      const entry = tooltips.tooltips.get(element);
      if (entry && entry.tooltip) {
        entry.tooltip.textContent = text;
      }
    },

    updateUI: function (root) {
      const toggles = this.getToggles(root);
      toggles.forEach(toggle => {
        if (toggle.tagName === 'SELECT') {
          toggle.value = this.state.preference;
        } else {
          const span = toggle.querySelector('.theme-current-label');
          if (span) {
            span.textContent = this.state.preference.charAt(0).toUpperCase() + this.state.preference.slice(1);
          }
        }
      });

      this.getMenuSwitchers(root).forEach(switcher => {
        this.updateMenuSwitcher(switcher);
      });
    },

    destroyAll: function (root) {
      const scope = root || document;

      this.getMenuSwitchers(scope).forEach(switcher => {
        const instance = this.menuInstances.get(switcher);
        if (instance) {
          instance.cleanup.forEach(fn => fn());
          this.closeMenu(switcher, instance.toggle, instance.menu);
          this.menuInstances.delete(switcher);
        }
        switcher.removeAttribute('data-theme-menu-initialized');
      });

      const toggles = this.getToggles(scope).filter(function (toggle) {
        return toggle.getAttribute('data-theme-initialized') === 'true';
      });
      toggles.forEach(toggle => {
        if (toggle._themeToggleHandler) {
          const eventName = toggle.tagName === 'SELECT' ? 'change' : 'click';
          toggle.removeEventListener(eventName, toggle._themeToggleHandler);
          delete toggle._themeToggleHandler;
        }
        toggle.removeAttribute('data-theme-initialized');
      });

      if (scope === document && this._mediaQuery && this._onMediaChange) {
        this._mediaQuery.removeEventListener('change', this._onMediaChange);
      }

      if (scope === document) {
        this._mediaQuery = null;
        this._onMediaChange = null;
        this.isInitialized = false;
      }
    }
  };

  if (window.Vanduo) {
    window.Vanduo.register('themeSwitcher', ThemeSwitcher);
  }
})();
