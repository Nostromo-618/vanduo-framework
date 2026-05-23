/**
 * Vanduo Framework - Affix (Sticky) Component
 * Uses IntersectionObserver to toggle .is-stuck within the nearest scrollable parent
 */

(function () {
  'use strict';

  function isScrollable(element) {
    if (!element || element === document.body) return false;

    const style = window.getComputedStyle(element);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const canScrollY = /(auto|scroll|overlay)/.test(overflowY) && element.scrollHeight > element.clientHeight;
    const canScrollX = /(auto|scroll|overlay)/.test(overflowX) && element.scrollWidth > element.clientWidth;

    return canScrollY || canScrollX;
  }

  function getScrollParent(element) {
    let parent = element.parentElement;

    while (parent && parent !== document.body && parent !== document.documentElement) {
      if (isScrollable(parent)) return parent;
      parent = parent.parentElement;
    }

    return null;
  }

  const Affix = {
    instances: new Map(),

    init: function (root) {
      const elements = window.Vanduo.queryAll(root, '.vd-affix, .vd-sticky, [data-vd-affix]');
      elements.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (el) {
      const cleanup = [];
      const parsedOffset = parseInt(el.getAttribute('data-vd-affix-offset') || '0', 10);
      const offset = Number.isNaN(parsedOffset) ? 0 : parsedOffset;
      const scrollParent = getScrollParent(el);
      let isStuck = false;

      const sentinel = document.createElement('div');
      sentinel.style.cssText = 'display:block;height:1px;margin-bottom:-1px;visibility:hidden;pointer-events:none;';
      el.parentNode.insertBefore(sentinel, el);

      el.style.setProperty('--vd-affix-top-offset', offset + 'px');

      function stick() {
        if (isStuck) return;
        isStuck = true;
        el.classList.add('is-stuck');
        el.dispatchEvent(new CustomEvent('affix:stuck', {
          bubbles: true,
          detail: {
            offset: offset,
            root: scrollParent || window
          }
        }));
      }

      function unstick() {
        if (!isStuck) return;
        isStuck = false;
        el.classList.remove('is-stuck');
        el.dispatchEvent(new CustomEvent('affix:unstuck', {
          bubbles: true,
          detail: {
            offset: offset,
            root: scrollParent || window
          }
        }));
      }

      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            stick();
          } else {
            unstick();
          }
        });
      }, {
        root: scrollParent,
        rootMargin: '-' + offset + 'px 0px 0px 0px',
        threshold: 0
      });

      observer.observe(sentinel);

      cleanup.push(
        () => observer.disconnect(),
        () => { if (sentinel.parentNode) sentinel.parentNode.removeChild(sentinel); },
        () => {
          el.classList.remove('is-stuck');
          el.style.removeProperty('--vd-affix-top-offset');
        }
      );

      this.instances.set(el, { cleanup, observer, sentinel, scrollParent });
    },

    destroy: function (el) {
      const instance = this.instances.get(el);
      if (!instance) return;
      instance.cleanup.forEach(fn => fn());
      el.classList.remove('is-stuck');
      this.instances.delete(el);
    },

    destroyAll: function () {
      this.instances.forEach((_, el) => this.destroy(el));
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('affix', Affix);
  }

  window.VanduoAffix = Affix;

})();
