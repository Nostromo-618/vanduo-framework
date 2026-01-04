/**
 * Vanduo Framework - Navbar Component
 * JavaScript functionality for navbar mobile menu
 */

(function() {
  'use strict';

  /**
   * Navbar Component
   */
  const Navbar = {
    /**
     * Initialize navbar component
     */
    init: function() {
      const navbars = document.querySelectorAll('.navbar');
      
      navbars.forEach(navbar => {
        this.initNavbar(navbar);
      });
    },
    
    /**
     * Initialize a single navbar
     * @param {HTMLElement} navbar - Navbar element
     */
    initNavbar: function(navbar) {
      const toggle = navbar.querySelector('.navbar-toggle, .navbar-burger');
      const menu = navbar.querySelector('.navbar-menu');
      const overlay = navbar.querySelector('.navbar-overlay') || this.createOverlay(navbar);
      
      if (!toggle || !menu) {
        return;
      }
      
      // Toggle menu on button click
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMenu(navbar, toggle, menu, overlay);
      });
      
      // Close menu on overlay click
      if (overlay) {
        overlay.addEventListener('click', () => {
          this.closeMenu(navbar, toggle, menu, overlay);
        });
      }
      
      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
          this.closeMenu(navbar, toggle, menu, overlay);
        }
      });
      
      // Close menu on window resize (if resizing to desktop)
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (window.innerWidth >= 992 && menu.classList.contains('is-open')) {
            this.closeMenu(navbar, toggle, menu, overlay);
          }
        }, 250);
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (menu.classList.contains('is-open') && 
            !navbar.contains(e.target) && 
            !menu.contains(e.target)) {
          this.closeMenu(navbar, toggle, menu, overlay);
        }
      });
      
      // Handle dropdown toggles in mobile menu
      const dropdownToggles = menu.querySelectorAll('.navbar-dropdown > .nav-link');
      dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
          if (window.innerWidth < 992) {
            e.preventDefault();
            const dropdown = toggle.parentElement;
            const dropdownMenu = dropdown.querySelector('.navbar-dropdown-menu');
            
            if (dropdownMenu) {
              dropdownMenu.classList.toggle('is-open');
            }
          }
        });
      });
    },
    
    /**
     * Toggle mobile menu
     * @param {HTMLElement} navbar - Navbar element
     * @param {HTMLElement} toggle - Toggle button
     * @param {HTMLElement} menu - Menu element
     * @param {HTMLElement} overlay - Overlay element
     */
    toggleMenu: function(navbar, toggle, menu, overlay) {
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
    openMenu: function(navbar, toggle, menu, overlay) {
      menu.classList.add('is-open');
      toggle.classList.add('is-active');
      
      if (overlay) {
        overlay.classList.add('is-active');
      }
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
      
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
    closeMenu: function(navbar, toggle, menu, overlay) {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      
      if (overlay) {
        overlay.classList.remove('is-active');
      }
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Close all dropdown menus
      const dropdownMenus = menu.querySelectorAll('.navbar-dropdown-menu.is-open');
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
    createOverlay: function(navbar) {
      const overlay = document.createElement('div');
      overlay.className = 'navbar-overlay';
      document.body.appendChild(overlay);
      return overlay;
    }
  };
  
  // Initialize when DOM is ready
  if (typeof ready !== 'undefined') {
    ready(() => {
      Navbar.init();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        Navbar.init();
      });
    } else {
      Navbar.init();
    }
  }
  
  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('navbar', Navbar);
  }
  
  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navbar;
  }
})();

