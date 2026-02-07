/**
 * Vanduo Framework - Lifecycle Manager
 * Central registry for component instances and cleanup
 * Prevents memory leaks in SPAs by tracking event listeners
 */

(function() {
  'use strict';

  /**
   * Lifecycle Manager
   * Simple registry that tracks component instances and their cleanup functions
   */
  const Lifecycle = {
    // Map of element -> { componentName, cleanupFunctions }
    instances: new Map(),

    /**
     * Register a component instance
     * @param {HTMLElement} element - The DOM element
     * @param {string} componentName - Name of the component
     * @param {Array<Function>} cleanupFns - Functions to call on destroy
     */
    register: function(element, componentName, cleanupFns = []) {
      if (this.instances.has(element)) {
        // Already registered, merge cleanup functions
        const existing = this.instances.get(element);
        existing.cleanup = existing.cleanup.concat(cleanupFns);
        return;
      }

      this.instances.set(element, {
        component: componentName,
        cleanup: cleanupFns,
        registeredAt: Date.now()
      });
    },

    /**
     * Unregister a single element and run its cleanup
     * @param {HTMLElement} element - The element to unregister
     */
    unregister: function(element) {
      const instance = this.instances.get(element);
      if (!instance) return;

      // Run all cleanup functions
      instance.cleanup.forEach(function(fn) {
        try {
          fn();
        } catch (e) {
          console.warn('[Vanduo Lifecycle] Cleanup error:', e);
        }
      });

      this.instances.delete(element);
    },

    /**
     * Destroy all instances of a specific component
     * @param {string} componentName - Optional component name filter
     */
    destroyAll: function(componentName) {
      const toRemove = [];

      this.instances.forEach(function(instance, element) {
        if (!componentName || instance.component === componentName) {
          toRemove.push(element);
        }
      });

      toRemove.forEach(function(element) {
        Lifecycle.unregister(element);
      });
    },

    /**
     * Destroy all instances within a specific container
     * Useful for SPAs when navigating between pages
     * @param {HTMLElement} container - Container element
     */
    destroyAllInContainer: function(container) {
      const toRemove = [];

      this.instances.forEach(function(instance, element) {
        if (container.contains(element)) {
          toRemove.push(element);
        }
      });

      toRemove.forEach(function(element) {
        Lifecycle.unregister(element);
      });
    },

    /**
     * Get all registered instances (for debugging)
     * @returns {Array} Array of instance info objects
     */
    getAll: function() {
      const result = [];
      this.instances.forEach(function(instance, element) {
        result.push({
          element: element,
          component: instance.component,
          registeredAt: instance.registeredAt
        });
      });
      return result;
    },

    /**
     * Check if an element is registered
     * @param {HTMLElement} element - The element to check
     * @returns {boolean}
     */
    has: function(element) {
      return this.instances.has(element);
    }
  };

  // Auto-cleanup on page unload
  window.addEventListener('beforeunload', function() {
    Lifecycle.destroyAll();
  });

  // Expose globally
  window.VanduoLifecycle = Lifecycle;

  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('lifecycle', Lifecycle);
  }

})();
