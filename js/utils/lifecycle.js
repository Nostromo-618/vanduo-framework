/**
 * Vanduo Framework - Lifecycle Manager
 * Central registry for scoped init/destroy, instance cleanup, and DOM queries.
 */

(function () {
  'use strict';

  function normalizeCallbacks(value) {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter(function (fn) {
        return typeof fn === 'function';
      });
    }
    return typeof value === 'function' ? [value] : [];
  }

  function normalizeOptions(options) {
    if (typeof options === 'function') {
      return { onDestroy: [options] };
    }
    return options || {};
  }

  function callSafely(label, fn) {
    try {
      fn();
    } catch (error) {
      console.warn('[Vanduo Lifecycle] ' + label + ' error:', error);
    }
  }

  const Lifecycle = {
    // Map<Element, Map<componentName, { cleanup, onDestroy, registeredAt }>>
    instances: new Map(),

    isRoot: function (root) {
      return !!root && (root === document || root.nodeType === 1 || root.nodeType === 9 || root.nodeType === 11);
    },

    normalizeRoot: function (root) {
      return this.isRoot(root) ? root : document;
    },

    isInRoot: function (root, element) {
      const scope = this.normalizeRoot(root);
      if (!(element instanceof Element)) return false;
      if (scope === document) {
        return document.documentElement ? document.documentElement.contains(element) : document.contains(element);
      }
      if (scope === element) return true;
      return typeof scope.contains === 'function' && scope.contains(element);
    },

    queryAll: function (root, selector) {
      const scope = this.normalizeRoot(root);
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

    queryOne: function (root, selector) {
      const matches = this.queryAll(root, selector);
      return matches.length ? matches[0] : null;
    },

    runInRoot: function (root, fn) {
      const scope = this.normalizeRoot(root);
      return fn(scope);
    },

    register: function (element, componentName, cleanupFns, options) {
      if (!(element instanceof Element) || !componentName) return;

      const optionBag = normalizeOptions(options);
      const cleanup = normalizeCallbacks(cleanupFns);
      const onDestroy = normalizeCallbacks(optionBag.onDestroy);
      const componentEntries = this.instances.get(element) || new Map();
      const existing = componentEntries.get(componentName);

      if (existing) {
        existing.cleanup = existing.cleanup.concat(cleanup);
        existing.onDestroy = existing.onDestroy.concat(onDestroy);
        return;
      }

      componentEntries.set(componentName, {
        component: componentName,
        cleanup: cleanup,
        onDestroy: onDestroy,
        registeredAt: Date.now()
      });

      this.instances.set(element, componentEntries);
    },

    unregister: function (element, componentName) {
      const componentEntries = this.instances.get(element);
      if (!componentEntries) return;

      if (componentName) {
        const entry = componentEntries.get(componentName);
        if (!entry) return;

        componentEntries.delete(componentName);
        if (!componentEntries.size) {
          this.instances.delete(element);
        }

        entry.cleanup.forEach(function (fn) {
          callSafely('Cleanup', fn);
        });
        entry.onDestroy.forEach(function (fn) {
          callSafely('Destroy', fn);
        });
        return;
      }

      const entries = Array.from(componentEntries.values());
      this.instances.delete(element);
      entries.forEach(function (entry) {
        entry.cleanup.forEach(function (fn) {
          callSafely('Cleanup', fn);
        });
        entry.onDestroy.forEach(function (fn) {
          callSafely('Destroy', fn);
        });
      });
    },

    destroyAll: function (componentName) {
      const toRemove = [];
      this.instances.forEach(function (componentEntries, element) {
        if (!componentName) {
          toRemove.push([element, null]);
          return;
        }

        if (componentEntries.has(componentName)) {
          toRemove.push([element, componentName]);
        }
      });

      toRemove.forEach(function (entry) {
        Lifecycle.unregister(entry[0], entry[1] || undefined);
      });

      return toRemove.length;
    },

    destroyAllInContainer: function (container, componentName) {
      const scope = this.normalizeRoot(container);
      const toRemove = [];

      this.instances.forEach(function (componentEntries, element) {
        if (!Lifecycle.isInRoot(scope, element)) return;

        if (!componentName) {
          toRemove.push([element, null]);
          return;
        }

        if (componentEntries.has(componentName)) {
          toRemove.push([element, componentName]);
        }
      });

      toRemove.forEach(function (entry) {
        Lifecycle.unregister(entry[0], entry[1] || undefined);
      });

      return toRemove.length;
    },

    getAll: function () {
      const result = [];
      this.instances.forEach(function (componentEntries, element) {
        componentEntries.forEach(function (entry) {
          result.push({
            element: element,
            component: entry.component,
            registeredAt: entry.registeredAt
          });
        });
      });
      return result;
    },

    has: function (element, componentName) {
      const componentEntries = this.instances.get(element);
      if (!componentEntries) return false;
      return componentName ? componentEntries.has(componentName) : componentEntries.size > 0;
    }
  };

  window.addEventListener('beforeunload', function () {
    Lifecycle.destroyAll();
  });

  window.VanduoLifecycle = Lifecycle;
})();
