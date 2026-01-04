/**
 * Vanduo Framework - Main JavaScript File
 * Initializes all framework components
 */

// Import utilities
// Note: In a real module system, you would use import/export
// For now, we'll assume helpers.js is loaded before this file

(function() {
  'use strict';

  /**
   * Vanduo Framework Object
   */
  const Vanduo = {
    version: '1.0.0',
    components: {},
    
    /**
     * Initialize framework
     */
    init: function() {
      // Initialize components when DOM is ready
      if (typeof ready !== 'undefined') {
        ready(() => {
          this.initComponents();
        });
      } else {
        // Fallback if helpers.js is not loaded
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            this.initComponents();
          });
        } else {
          this.initComponents();
        }
      }
    },
    
    /**
     * Initialize all components
     */
    initComponents: function() {
      // Component initialization
      // Note: Navbar auto-initializes when navbar.js is loaded
      // Other components will be added here as they are developed
      // Example:
      // this.initModals();
      // this.initDropdowns();
      // this.initTooltips();
      // this.initCollapsible();
      // this.initSidenav();
      // this.initParallax();
      
      console.log('Vanduo Framework initialized');
    },
    
    /**
     * Register a component
     * @param {string} name - Component name
     * @param {Object} component - Component object with init method
     */
    register: function(name, component) {
      this.components[name] = component;
      if (component.init && typeof component.init === 'function') {
        component.init();
      }
    },
    
    /**
     * Get component instance
     * @param {string} name - Component name
     * @returns {Object|null}
     */
    getComponent: function(name) {
      return this.components[name] || null;
    }
  };

  // Auto-initialize when script loads
  Vanduo.init();

  // Expose to global scope
  window.Vanduo = Vanduo;

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Vanduo;
  }
})();

