var Vanduo = (() => {
  // js/vanduo.js
  (function() {
    "use strict";
    const Vanduo = {
      version: "1.0.0",
      components: {},
      /**
       * Initialize framework
       */
      init: function() {
        if (typeof ready !== "undefined") {
          ready(() => {
            this.initComponents();
          });
        } else {
          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
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
        console.log("Vanduo Framework initialized");
      },
      /**
       * Register a component
       * @param {string} name - Component name
       * @param {Object} component - Component object with init method
       */
      register: function(name, component) {
        this.components[name] = component;
        if (component.init && typeof component.init === "function") {
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
        if (component && component.init && typeof component.init === "function") {
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
          if (component && component.destroyAll && typeof component.destroyAll === "function") {
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
    Vanduo.init();
    window.Vanduo = Vanduo;
    if (typeof module !== "undefined" && module.exports) {
      module.exports = Vanduo;
    }
  })();
})();
//# sourceMappingURL=vanduo.js.map
