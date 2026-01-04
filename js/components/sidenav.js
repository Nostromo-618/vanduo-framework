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
    
    /**
     * Initialize sidenav components
     */
    init: function() {
      const sidenavs = document.querySelectorAll('.sidenav');
      
      sidenavs.forEach(sidenav => {
        if (!sidenav.dataset.sidenavInitialized) {
          this.initSidenav(sidenav);
        }
      });
      
      // Handle toggle buttons
      const toggles = document.querySelectorAll('[data-sidenav-toggle]');
      toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = toggle.dataset.sidenavToggle;
          const sidenav = document.querySelector(targetId);
          if (sidenav) {
            this.toggle(sidenav);
          }
        });
      });
      
      // Handle responsive behavior
      this.handleResize();
      window.addEventListener('resize', () => {
        this.handleResize();
      });
    },
    
    /**
     * Initialize a single sidenav
     * @param {HTMLElement} sidenav - Sidenav element
     */
    initSidenav: function(sidenav) {
      sidenav.dataset.sidenavInitialized = 'true';
      
      const overlay = this.createOverlay(sidenav);
      const closeButton = sidenav.querySelector('.sidenav-close');
      
      // Set ARIA attributes
      sidenav.setAttribute('role', 'navigation');
      sidenav.setAttribute('aria-hidden', 'true');
      
      // Close button handler
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          this.close(sidenav);
        });
      }
      
      // Overlay click handler
      overlay.addEventListener('click', () => {
        if (sidenav.dataset.backdrop !== 'static') {
          this.close(sidenav);
        }
      });
      
      // ESC key handler
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidenav.classList.contains('is-open')) {
          if (sidenav.dataset.keyboard !== 'false') {
            this.close(sidenav);
          }
        }
      });
      
      this.sidenavs.set(sidenav, { overlay });
    },
    
    /**
     * Create overlay element
     * @param {HTMLElement} sidenav - Sidenav element
     * @returns {HTMLElement} Overlay element
     */
    createOverlay: function(sidenav) {
      let overlay = sidenav.querySelector('.sidenav-overlay');
      
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidenav-overlay';
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
    }
  };
  
  // Initialize when DOM is ready
  if (typeof ready !== 'undefined') {
    ready(() => {
      Sidenav.init();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        Sidenav.init();
      });
    } else {
      Sidenav.init();
    }
  }
  
  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('sidenav', Sidenav);
  }
  
  // Expose globally
  window.VanduoSidenav = Sidenav;
  
  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sidenav;
  }
})();

