/**
 * Vanduo Framework - Main JavaScript File
 */

(function () {
  'use strict';

  const VANDUO_VERSION = typeof __VANDUO_VERSION__ !== 'undefined' ? __VANDUO_VERSION__ : '0.0.0-dev';
  const hasOwn = Object.prototype.hasOwnProperty;

  /**
   * Vanduo Framework Object
   */
  const Vanduo = {
    version: VANDUO_VERSION,
    components: {},
    aliases: {},
    _decoratedComponents: new WeakSet(),

    resolveComponentName: function (name) {
      return this.aliases[name] || name;
    },

    _isRoot: function (root) {
      if (typeof window.VanduoLifecycle !== 'undefined' && typeof window.VanduoLifecycle.isRoot === 'function') {
        return window.VanduoLifecycle.isRoot(root);
      }

      return !!root && (root === document || root.nodeType === 1 || root.nodeType === 9 || root.nodeType === 11);
    },

    _normalizeRoot: function (root) {
      return this._isRoot(root) ? root : document;
    },

    _queryAll: function (root, selector) {
      const scope = this._normalizeRoot(root);
      const matches = [];

      if (scope instanceof Element && typeof scope.matches === 'function' && scope.matches(selector)) {
        matches.push(scope);
      }

      if (typeof scope.querySelectorAll === 'function') {
        const descendants = scope.querySelectorAll(selector);
        for (let i = 0; i < descendants.length; i++) {
          matches.push(descendants[i]);
        }
      }

      return matches;
    },

    _runWithScopedQueries: function (root, fn) {
      const scope = this._normalizeRoot(root);
      const lifecycle = window.VanduoLifecycle;

      if (scope === document) {
        return fn();
      }

      if (lifecycle && typeof lifecycle.runInRoot === 'function') {
        return lifecycle.runInRoot(scope, fn);
      }

      const originalQuerySelectorAll = document.querySelectorAll.bind(document);
      document.querySelectorAll = (selector) => this._queryAll(scope, selector);

      try {
        return fn();
      } finally {
        document.querySelectorAll = originalQuerySelectorAll;
      }
    },

    _isLifecycleManagedComponent: function (component) {
      if (!component || typeof component !== 'object') return false;

      for (const key in component) {
        if (hasOwn.call(component, key) && component[key] instanceof Map) {
          return true;
        }
      }

      return false;
    },

    _syncComponentLifecycle: function (name, component, root) {
      const lifecycle = window.VanduoLifecycle;
      if (!lifecycle || !this._isLifecycleManagedComponent(component)) return;

      const componentName = this.resolveComponentName(name);
      const scope = this._normalizeRoot(root);

      for (const key in component) {
        if (!hasOwn.call(component, key) || !(component[key] instanceof Map)) {
          continue;
        }

        component[key].forEach(function (instance, element) {
          if (!(element instanceof Element) || !lifecycle.isInRoot(scope, element) || lifecycle.has(element, componentName)) {
            return;
          }

          if (typeof component.destroy === 'function') {
            lifecycle.register(element, componentName, [], function () {
              component.destroy(element);
            });
            return;
          }

          const cleanup = instance && Array.isArray(instance.cleanup) ? instance.cleanup : [];
          lifecycle.register(element, componentName, cleanup, function () {
            component[key].delete(element);
          });
        });
      }
    },

    _decorateComponent: function (name, component) {
      const framework = this;
      const lifecycle = window.VanduoLifecycle;
      if (!component || typeof component !== 'object' || this._decoratedComponents.has(component)) {
        return;
      }

      const originalInit = typeof component.init === 'function' ? component.init : null;
      if (originalInit) {
        component.init = function (...args) {
          const scopedRoot = framework._isRoot(args[0]) ? args[0] : null;
          const run = () => originalInit.apply(this, args);
          const result = scopedRoot ? framework._runWithScopedQueries(scopedRoot, run) : run();

          if (window.Vanduo) {
            const syncRoot = scopedRoot || document;
            window.Vanduo._syncComponentLifecycle(name, this, syncRoot);
          }

          return result;
        };
      }

      const originalDestroyAll = typeof component.destroyAll === 'function' ? component.destroyAll : null;
      if (originalDestroyAll) {
        component.destroyAll = function (...args) {
          const scopedRoot = framework._isRoot(args[0]) ? args[0] : null;
          const componentName = window.Vanduo ? window.Vanduo.resolveComponentName(name) : name;

          if (lifecycle && window.Vanduo && window.Vanduo._isLifecycleManagedComponent(this)) {
            if (scopedRoot && scopedRoot !== document) {
              lifecycle.destroyAllInContainer(scopedRoot, componentName);
              if (this.__vanduoScopedDestroyAll === true) {
                return originalDestroyAll.apply(this, args);
              }
              return;
            }

            lifecycle.destroyAll(componentName);
          }

          return originalDestroyAll.apply(this, args);
        };
      }

      this._decoratedComponents.add(component);
    },

    /**
     * Initialize framework
     * Call this after DOM is ready and all components are loaded
     */
    init: function (root) {
      const scope = this._normalizeRoot(root);

      if (scope !== document) {
        this.initComponents(scope);
        return;
      }

      if (typeof ready !== 'undefined') {
        ready(() => {
          this.initComponents(document);
        });
        return;
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.initComponents(document);
        });
        return;
      }

      this.initComponents(document);
    },

    /**
     * Initialize all components
     */
    initComponents: function (root) {
      const scope = this._normalizeRoot(root);

      Object.keys(this.components).forEach((name) => {
        const component = this.components[name];
        if (component.init && typeof component.init === 'function') {
          try {
            component.init(scope);
          } catch (e) {
            console.warn('[Vanduo] Failed to initialize component "' + name + '":', e);
          }
        }
      });
    },

    /**
     * Register a component
     * @param {string} name - Component name
     * @param {Object} component - Component object with init method
     */
    register: function (name, component, options) {
      const opts = options || {};
      this._decorateComponent(name, component);
      this.components[name] = component;

      if (Array.isArray(opts.aliases)) {
        opts.aliases.forEach((alias) => {
          this.aliases[alias] = name;
        });
      }
    },

    registerAlias: function (alias, name) {
      const canonicalName = this.resolveComponentName(name);
      if (this.components[canonicalName]) {
        this.aliases[alias] = canonicalName;
      }
    },

    /**
     * Re-initialize a component (useful after dynamic DOM changes)
     * @param {string} name - Component name
     */
    reinit: function (name, root) {
      const scope = this._normalizeRoot(root);
      const componentName = this.resolveComponentName(name);
      const component = this.components[componentName];
      if (component && component.init && typeof component.init === 'function') {
        try {
          if (component.destroyAll && typeof component.destroyAll === 'function') {
            component.destroyAll(scope);
          }
          component.init(scope);
        } catch (e) {
          console.warn('[Vanduo] Failed to reinitialize component "' + componentName + '":', e);
        }
      }
    },

    /**
     * Destroy component instances within the provided root.
     */
    destroy: function (root) {
      const scope = this._normalizeRoot(root);
      const names = Object.keys(this.components);

      for (let i = 0; i < names.length; i++) {
        const component = this.components[names[i]];
        if (component && component.destroyAll && typeof component.destroyAll === 'function') {
          try {
            component.destroyAll(scope);
          } catch (e) {
            console.warn('[Vanduo] Failed to destroy component "' + names[i] + '":', e);
          }
        }
      }
    },

    /**
     * Destroy all component instances and clean up event listeners.
     */
    destroyAll: function () {
      this.destroy(document);
    },

    /**
     * Get component instance
     * @param {string} name - Component name
     * @returns {Object|null}
     */
    getComponent: function (name) {
      const componentName = this.resolveComponentName(name);
      return this.components[componentName] || null;
    }
  };

  // Expose to global scope
  window.Vanduo = Vanduo;

})();
