/**
 * Vanduo Framework - Stepper Component
 * Multi-step progress indicator with state management
 */

(function () {
  'use strict';

  const Stepper = {
    instances: new Map(),

    init: function (root) {
      const steppers = window.Vanduo.queryAll(root, '.vd-stepper');
      steppers.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (el) {
      const cleanup = [];
      const items = Array.from(el.querySelectorAll('.vd-stepper-item'));
      const isClickable = el.classList.contains('vd-stepper-clickable');
      let currentIndex = items.findIndex(i => i.classList.contains('is-active'));
      if (currentIndex === -1) currentIndex = 0;

      const setStep = (index) => {
        if (index < 0 || index >= items.length) return;
        const prev = currentIndex;
        currentIndex = index;

        items.forEach((item, i) => {
          item.classList.remove('is-active', 'is-completed');
          if (i < index) item.classList.add('is-completed');
          else if (i === index) item.classList.add('is-active');
        });

        el.dispatchEvent(new CustomEvent('stepper:change', {
          detail: { current: index, previous: prev, total: items.length },
          bubbles: true
        }));
      };

      if (isClickable) {
        items.forEach((item, i) => {
          const handler = () => setStep(i);
          item.addEventListener('click', handler);
          cleanup.push(() => item.removeEventListener('click', handler));
        });
      }

      // Initialize current state
      setStep(currentIndex);

      this.instances.set(el, {
        cleanup,
        setStep,
        next: () => setStep(currentIndex + 1),
        prev: () => setStep(currentIndex - 1),
        getCurrent: () => currentIndex
      });
    },

    setStep: function (el, index) {
      const inst = this.instances.get(el);
      if (inst) inst.setStep(index);
    },

    next: function (el) {
      const inst = this.instances.get(el);
      if (inst) inst.next();
    },

    prev: function (el) {
      const inst = this.instances.get(el);
      if (inst) inst.prev();
    },

    destroy: function (el) {
      const inst = this.instances.get(el);
      if (!inst) return;
      inst.cleanup.forEach(fn => fn());
      this.instances.delete(el);
    },

    destroyAll: function () {
      this.instances.forEach((_, el) => this.destroy(el));
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('stepper', Stepper);
  }

  window.VanduoStepper = Stepper;

})();
