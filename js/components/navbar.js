/**
 * Vanduo Framework - Navbar Component
 * JavaScript functionality for navbar mobile menu
 */

(function () {
  'use strict';

  /**
   * Navbar Component
   */
  const Navbar = {
    // Store initialized navbars and their cleanup functions
    instances: new Map(),

    /**
     * Get the breakpoint value from CSS variable or use fallback
     * @returns {number} Breakpoint in pixels
     */
    getBreakpoint: function () {
      const root = getComputedStyle(document.documentElement);
      const breakpointValue = root.getPropertyValue('--vd-breakpoint-lg').trim();

      // Parse the value (could be "992px" or just "992")
      const parsed = parseInt(breakpointValue, 10);
      return isNaN(parsed) ? 992 : parsed;
    },

    /**
     * Initialize navbar component
     */
    init: function (root) {
      const navbars = window.Vanduo.queryAll(root, '.vd-navbar');

      navbars.forEach(navbar => {
        // Skip if already initialized
        if (this.instances.has(navbar)) {
          return;
        }
        this.initNavbar(navbar);
      });
    },

    /**
     * Initialize scroll-aware glass/transparent behaviour for a navbar.
     * Adds/removes `.vd-navbar-scrolled` when the page scrolls past a threshold.
     * Threshold: `data-scroll-threshold` attribute (px) or the navbar's own height.
     * @param {HTMLElement} navbar - Navbar element
     * @returns {Function|null} Cleanup function, or null if not applicable
     */
    initScrollWatcher: function (navbar) {
      const isGlass = navbar.classList.contains('vd-navbar-glass');
      const isTransparent = navbar.classList.contains('vd-navbar-transparent');

      if (!isGlass && !isTransparent) {
        return null;
      }

      const getThreshold = () => {
        const attr = parseInt(navbar.dataset.scrollThreshold, 10);
        return isNaN(attr) ? (navbar.offsetHeight || 60) : attr;
      };

      const onScroll = () => {
        const scrolled = window.scrollY > getThreshold();
        navbar.classList.toggle('vd-navbar-scrolled', scrolled);
      };

      onScroll(); // set initial state without waiting for first scroll
      window.addEventListener('scroll', onScroll, { passive: true });

      return () => window.removeEventListener('scroll', onScroll);
    },

    /**
     * Initialize a single navbar
     * @param {HTMLElement} navbar - Navbar element
     */
    initNavbar: function (navbar) {
      const toggle = navbar.querySelector('.vd-navbar-toggle, .vd-navbar-burger');
      const menu = navbar.querySelector('.vd-navbar-menu');
      const overlay = navbar.querySelector('.vd-navbar-overlay') || this.createOverlay(navbar);

      // Store cleanup functions for this navbar instance
      const cleanupFunctions = [];

      // Wire up scroll-aware glass/transparent behaviour regardless of mobile menu
      const scrollWatcherCleanup = this.initScrollWatcher(navbar);
      if (scrollWatcherCleanup) {
        cleanupFunctions.push(scrollWatcherCleanup);
      }

      if (!toggle || !menu) {
        // Still store the instance so scroll-watcher cleanup is tracked
        if (cleanupFunctions.length) {
          this.instances.set(navbar, { toggle: null, menu: null, overlay: null, cleanup: cleanupFunctions });
        }
        return;
      }

      // Toggle menu on button click
      const toggleClickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMenu(navbar, toggle, menu, overlay);
      };
      toggle.addEventListener('click', toggleClickHandler);
      cleanupFunctions.push(() => toggle.removeEventListener('click', toggleClickHandler));

      // Close menu on overlay click
      if (overlay) {
        const overlayClickHandler = () => {
          this.closeMenu(navbar, toggle, menu, overlay);
        };
        overlay.addEventListener('click', overlayClickHandler);
        cleanupFunctions.push(() => overlay.removeEventListener('click', overlayClickHandler));
      }

      // Close menu on escape key
      const keydownHandler = (e) => {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
          this.closeMenu(navbar, toggle, menu, overlay);
        }
      };
      document.addEventListener('keydown', keydownHandler);
      cleanupFunctions.push(() => document.removeEventListener('keydown', keydownHandler));

      // Close menu on window resize (if resizing to desktop)
      let resizeTimer;
      const resizeHandler = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const breakpoint = this.getBreakpoint();
          if (window.innerWidth >= breakpoint && menu.classList.contains('is-open')) {
            this.closeMenu(navbar, toggle, menu, overlay);
          }
        }, 250);
      };
      window.addEventListener('resize', resizeHandler);
      cleanupFunctions.push(() => {
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', resizeHandler);
      });

      // Close menu when clicking outside
      const documentClickHandler = (e) => {
        if (menu.classList.contains('is-open') &&
          !navbar.contains(e.target) &&
          !menu.contains(e.target)) {
          this.closeMenu(navbar, toggle, menu, overlay);
        }
      };
      document.addEventListener('click', documentClickHandler);
      cleanupFunctions.push(() => document.removeEventListener('click', documentClickHandler));

      // Handle dropdown toggles in mobile menu
      const dropdownToggles = menu.querySelectorAll('.vd-navbar-dropdown > .vd-nav-link, .vd-navbar-dropdown > .nav-link');
      dropdownToggles.forEach(dropdownToggle => {
        const dropdownClickHandler = (e) => {
          const breakpoint = this.getBreakpoint();
          if (window.innerWidth < breakpoint) {
            e.preventDefault();
            const dropdown = dropdownToggle.parentElement;
            const dropdownMenu = dropdown.querySelector('.vd-navbar-dropdown-menu');

            if (dropdownMenu) {
              dropdownMenu.classList.toggle('is-open');
            }
          }
        };
        dropdownToggle.addEventListener('click', dropdownClickHandler);
        cleanupFunctions.push(() => dropdownToggle.removeEventListener('click', dropdownClickHandler));
      });

      // Store instance with cleanup functions
      this.instances.set(navbar, {
        toggle,
        menu,
        overlay,
        cleanup: cleanupFunctions
      });
    },

    /**
     * Destroy a navbar instance and clean up event listeners
     * @param {HTMLElement} navbar - Navbar element
     */
    destroy: function (navbar) {
      const instance = this.instances.get(navbar);
      if (!instance) {
        return;
      }

      // Run all cleanup functions
      instance.cleanup.forEach(fn => fn());

      // Remove created overlay if it exists
      if (instance.overlay && instance.overlay.parentNode) {
        instance.overlay.parentNode.removeChild(instance.overlay);
      }

      // Remove from instances map
      this.instances.delete(navbar);
    },

    /**
     * Destroy all navbar instances
     */
    destroyAll: function () {
      this.instances.forEach((instance, navbar) => {
        this.destroy(navbar);
      });
    },

    /**
     * Toggle mobile menu
     * @param {HTMLElement} navbar - Navbar element
     * @param {HTMLElement} toggle - Toggle button
     * @param {HTMLElement} menu - Menu element
     * @param {HTMLElement} overlay - Overlay element
     */
    toggleMenu: function (navbar, toggle, menu, overlay) {
      const isOpen = menu.classList.contains('is-open');

      if (isOpen) {
        this.closeMenu(navbar, toggle, menu, overlay);
      } else {
        this.openMenu(navbar, toggle, menu, overlay);
      }
    },

    /**
     * Open mobile menu
     * @param {HTMLElement} navbar - Navbar element
     * @param {HTMLElement} toggle - Toggle button
     * @param {HTMLElement} menu - Menu element
     * @param {HTMLElement} overlay - Overlay element
     */
    openMenu: function (navbar, toggle, menu, overlay) {
      menu.classList.add('is-open');
      toggle.classList.add('is-active');

      if (overlay) {
        overlay.classList.add('is-active');
      }

      // Prevent body scroll when menu is open (use class to avoid conflicts with modals)
      document.body.classList.add('body-navbar-open');

      // Set ARIA attributes
      toggle.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
    },

    /**
     * Close mobile menu
     * @param {HTMLElement} navbar - Navbar element
     * @param {HTMLElement} toggle - Toggle button
     * @param {HTMLElement} menu - Menu element
     * @param {HTMLElement} overlay - Overlay element
     */
    closeMenu: function (navbar, toggle, menu, overlay) {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');

      if (overlay) {
        overlay.classList.remove('is-active');
      }

      // Restore body scroll
      document.body.classList.remove('body-navbar-open');

      // Close all dropdown menus
      const dropdownMenus = menu.querySelectorAll('.vd-navbar-dropdown-menu.is-open');
      dropdownMenus.forEach(dropdownMenu => {
        dropdownMenu.classList.remove('is-open');
      });

      // Set ARIA attributes
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    },

    /**
     * Create overlay element if it doesn't exist
     * @param {HTMLElement} navbar - Navbar element
     * @returns {HTMLElement} Overlay element
     */
    createOverlay: function (_navbar) {
      const overlay = document.createElement('div');
      overlay.className = 'vd-navbar-overlay';
      document.body.appendChild(overlay);
      return overlay;
    }
  };

  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('navbar', Navbar);
  }

  // Expose globally
  window.VanduoNavbar = Navbar;

})();
