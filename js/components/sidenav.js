/**
 * Vanduo Framework - Sidenav Component
 * JavaScript functionality for side navigation drawer
 */

(function() {
  'use strict';

  /**
   * Sidenav Component
   */
  const Sidenav = {
    sidenavs: new Map(),
    breakpoint: 992, // Desktop breakpoint
    
    // Global cleanup functions (toggles, resize)
    _globalCleanups: [],

    /**
     * Initialize sidenav components
     */
    init: function() {
      const sidenavs = document.querySelectorAll('.vd-sidenav');

      sidenavs.forEach(sidenav => {
        if (this.sidenavs.has(sidenav)) {
          return;
        }
        this.initSidenav(sidenav);
      });

      // Handle toggle buttons
      const toggles = document.querySelectorAll('[data-sidenav-toggle]');
      toggles.forEach(toggle => {
        if (toggle.dataset.sidenavToggleInitialized) return;
        toggle.dataset.sidenavToggleInitialized = 'true';

        const toggleClickHandler = (e) => {
          e.preventDefault();
          const targetId = toggle.dataset.sidenavToggle;
          const sidenav = document.querySelector(targetId);
          if (sidenav) {
            this.toggle(sidenav);
          }
        };
        toggle.addEventListener('click', toggleClickHandler);
        this._globalCleanups.push(() => toggle.removeEventListener('click', toggleClickHandler));
      });

      // Handle responsive behavior
      this.handleResize();
      const resizeHandler = () => {
        this.handleResize();
      };
      window.addEventListener('resize', resizeHandler);
      this._globalCleanups.push(() => window.removeEventListener('resize', resizeHandler));
    },

    /**
     * Initialize a single sidenav
     * @param {HTMLElement} sidenav - Sidenav element
     */
    initSidenav: function(sidenav) {
      const overlay = this.createOverlay(sidenav);
      const closeButton = sidenav.querySelector('.vd-sidenav-close');
      const cleanupFunctions = [];

      // Set ARIA attributes
      sidenav.setAttribute('role', 'navigation');
      sidenav.setAttribute('aria-hidden', 'true');

      // Close button handler
      if (closeButton) {
        const closeHandler = () => {
          this.close(sidenav);
        };
        closeButton.addEventListener('click', closeHandler);
        cleanupFunctions.push(() => closeButton.removeEventListener('click', closeHandler));
      }

      // Overlay click handler
      const overlayClickHandler = () => {
        if (sidenav.dataset.backdrop !== 'static') {
          this.close(sidenav);
        }
      };
      overlay.addEventListener('click', overlayClickHandler);
      cleanupFunctions.push(() => overlay.removeEventListener('click', overlayClickHandler));

      // ESC key handler
      const escKeyHandler = (e) => {
        if (e.key === 'Escape' && sidenav.classList.contains('is-open')) {
          if (sidenav.dataset.keyboard !== 'false') {
            this.close(sidenav);
          }
        }
      };
      document.addEventListener('keydown', escKeyHandler);
      cleanupFunctions.push(() => document.removeEventListener('keydown', escKeyHandler));

      this.sidenavs.set(sidenav, { overlay, cleanup: cleanupFunctions });
    },
    
    /**
     * Create overlay element
     * @param {HTMLElement} sidenav - Sidenav element
     * @returns {HTMLElement} Overlay element
     */
    createOverlay: function(sidenav) {
      let overlay = sidenav.querySelector('.vd-sidenav-overlay');
      
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'vd-sidenav-overlay';
        document.body.appendChild(overlay);
      }
      
      return overlay;
    },
    
    /**
     * Open sidenav
     * @param {HTMLElement|string} sidenav - Sidenav element or selector
     */
    open: function(sidenav) {
      const el = typeof sidenav === 'string' ? document.querySelector(sidenav) : sidenav;
      
      if (!el || !this.sidenavs.has(el)) {
        return;
      }
      
      const { overlay } = this.sidenavs.get(el);
      
      // Show overlay (if not fixed)
      if (!el.classList.contains('sidenav-fixed')) {
        overlay.classList.add('is-visible');
      }
      
      // Open sidenav
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      
      // Lock body scroll
      document.body.classList.add('body-sidenav-open');
      
      // Handle push variant
      if (el.classList.contains('sidenav-push')) {
        this.handlePushVariant(el, true);
      }
      
      // Dispatch event
      el.dispatchEvent(new CustomEvent('sidenav:open', { bubbles: true }));
    },
    
    /**
     * Close sidenav
     * @param {HTMLElement|string} sidenav - Sidenav element or selector
     */
    close: function(sidenav) {
      const el = typeof sidenav === 'string' ? document.querySelector(sidenav) : sidenav;
      
      if (!el || !this.sidenavs.has(el)) {
        return;
      }
      
      const { overlay } = this.sidenavs.get(el);
      
      // Hide overlay
      overlay.classList.remove('is-visible');
      
      // Close sidenav
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      
      // Unlock body scroll
      document.body.classList.remove('body-sidenav-open');
      
      // Handle push variant
      if (el.classList.contains('sidenav-push')) {
        this.handlePushVariant(el, false);
      }
      
      // Dispatch event
      el.dispatchEvent(new CustomEvent('sidenav:close', { bubbles: true }));
    },
    
    /**
     * Toggle sidenav
     * @param {HTMLElement|string} sidenav - Sidenav element or selector
     */
    toggle: function(sidenav) {
      const el = typeof sidenav === 'string' ? document.querySelector(sidenav) : sidenav;
      if (el) {
        if (el.classList.contains('is-open')) {
          this.close(el);
        } else {
          this.open(el);
        }
      }
    },
    
    /**
     * Handle push variant
     * @param {HTMLElement} sidenav - Sidenav element
     * @param {boolean} isOpen - Whether sidenav is open
     */
    handlePushVariant: function(sidenav, isOpen) {
      // Find the main content wrapper
      const content = document.querySelector('main, .main-content, .content, [role="main"]') || document.body;
      
      if (isOpen) {
        if (window.innerWidth >= this.breakpoint) {
          if (sidenav.classList.contains('sidenav-right')) {
            content.style.marginRight = sidenav.offsetWidth + 'px';
          } else {
            content.style.marginLeft = sidenav.offsetWidth + 'px';
          }
        }
      } else {
        content.style.marginLeft = '';
        content.style.marginRight = '';
      }
    },
    
    /**
     * Handle window resize
     */
    handleResize: function() {
      this.sidenavs.forEach(({ overlay }, sidenav) => {
        // Close overlay sidenavs on resize to desktop if they're open
        if (window.innerWidth >= this.breakpoint) {
          if (sidenav.classList.contains('sidenav-fixed') && !sidenav.classList.contains('is-open')) {
            // Fixed sidenavs should be visible on desktop
            sidenav.classList.add('is-open');
            sidenav.setAttribute('aria-hidden', 'false');
            overlay.classList.remove('is-visible');
          }
        } else {
          // On mobile, fixed sidenavs become overlay
          if (sidenav.classList.contains('sidenav-fixed') && sidenav.classList.contains('is-open')) {
            this.close(sidenav);
          }
        }
      });
    },

    /**
     * Destroy a sidenav instance and clean up event listeners
     * @param {HTMLElement} sidenav - Sidenav element
     */
    destroy: function(sidenav) {
      const data = this.sidenavs.get(sidenav);
      if (!data) return;

      // Close if open
      if (sidenav.classList.contains('is-open')) {
        this.close(sidenav);
      }

      data.cleanup.forEach(fn => fn());

      // Remove created overlay
      if (data.overlay && data.overlay.parentNode) {
        data.overlay.parentNode.removeChild(data.overlay);
      }

      this.sidenavs.delete(sidenav);
    },

    /**
     * Destroy all sidenav instances
     */
    destroyAll: function() {
      this.sidenavs.forEach((data, sidenav) => {
        this.destroy(sidenav);
      });
      this._globalCleanups.forEach(fn => fn());
      this._globalCleanups = [];
    }
  };
  
  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('sidenav', Sidenav);
  }
  
  // Expose globally
  window.VanduoSidenav = Sidenav;
  
})();

