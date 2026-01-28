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
        try {
          component.init();
        } catch (e) {
          console.warn('[Vanduo] Failed to initialize component "' + name + '":', e);
        }
      }
    },

    /**
     * Re-initialize a component (useful after dynamic DOM changes)
     * @param {string} name - Component name
     */
    reinit: function(name) {
      var component = this.components[name];
      if (component && component.init && typeof component.init === 'function') {
        try {
          component.init();
        } catch (e) {
          console.warn('[Vanduo] Failed to reinitialize component "' + name + '":', e);
        }
      }
    },

    /**
     * Destroy all component instances and clean up event listeners
     */
    destroyAll: function() {
      var names = Object.keys(this.components);
      for (var i = 0; i < names.length; i++) {
        var component = this.components[names[i]];
        if (component && component.destroyAll && typeof component.destroyAll === 'function') {
          try {
            component.destroyAll();
          } catch (e) {
            console.warn('[Vanduo] Failed to destroy component "' + names[i] + '":', e);
          }
        }
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

