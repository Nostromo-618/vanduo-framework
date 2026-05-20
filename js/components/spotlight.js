/**
 * Vanduo Framework - Spotlight (Feature Discovery) Component
 * Guided tour with overlay highlight and step-through tooltip
 */

(function () {
  'use strict';

  const Spotlight = {
    _active: false,
    _steps: [],
    _currentStep: 0,
    _elements: {},
    _cleanup: [],
    _boundTriggers: new WeakMap(),
    _triggerElement: null,

    init: function (root) {
      const triggers = window.Vanduo.queryAll(root, '[data-vd-spotlight]');

      triggers.forEach(trigger => {
        if (this._boundTriggers.has(trigger)) return;

        const clickHandler = (event) => {
          event.preventDefault();

          const steps = this._parseSteps(trigger.getAttribute('data-vd-spotlight'));
          if (steps.length === 0) return;

          this.start(steps, { trigger });
        };

        trigger.addEventListener('click', clickHandler);
        this._boundTriggers.set(trigger, clickHandler);
      });
    },

    _parseSteps: function (raw) {
      if (typeof raw !== 'string' || raw.trim() === '') return [];

      try {
        const parsed = JSON.parse(raw);
        return this._normalizeSteps(parsed);
      } catch (error) {
        console.error('VanduoSpotlight: invalid data-vd-spotlight payload.', error);
        return [];
      }
    },

    _normalizeStep: function (step) {
      if (!step || typeof step !== 'object') return null;

      const target = step.target;
      const hasSelectorTarget = typeof target === 'string' && target.trim() !== '';
      const hasElementTarget = typeof Element !== 'undefined' && target instanceof Element;

      if (!hasSelectorTarget && !hasElementTarget) return null;

      const title = typeof step.title === 'string' ? step.title : '';
      const description = typeof step.description === 'string'
        ? step.description
        : (typeof step.content === 'string' ? step.content : '');

      return {
        target,
        title,
        description
      };
    },

    _normalizeSteps: function (steps) {
      if (!Array.isArray(steps)) return [];

      return steps
        .map(step => this._normalizeStep(step))
        .filter(Boolean);
    },

    start: function (steps, options) {
      if (this._active) this.stop();

      const normalizedSteps = this._normalizeSteps(steps);
      if (normalizedSteps.length === 0) return;

      const startOptions = options || {};

      this._steps = normalizedSteps;
      this._currentStep = 0;
      this._active = true;
      this._triggerElement = startOptions.trigger || (document.activeElement instanceof HTMLElement ? document.activeElement : null);

      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'vd-spotlight-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);

      // Create tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'vd-spotlight-tooltip';
      tooltip.setAttribute('role', 'dialog');
      tooltip.setAttribute('aria-modal', 'true');
      tooltip.tabIndex = -1;
      document.body.appendChild(tooltip);

      this._elements = { overlay, tooltip };

      // ESC to close
      const escHandler = (e) => { if (e.key === 'Escape') this.stop(); };
      document.addEventListener('keydown', escHandler);
      this._cleanup.push(() => document.removeEventListener('keydown', escHandler));

      // Overlay click to close
      overlay.addEventListener('click', () => this.stop());

      this._showStep(this._currentStep);
    },

    _showStep: function (index) {
      const step = this._steps[index];
      if (!step) return;

      const target = typeof step.target === 'string' ? document.querySelector(step.target) : step.target;
      const { tooltip } = this._elements;

      // Remove previous highlight
      document.querySelectorAll('.vd-spotlight-target').forEach(el => {
        el.classList.remove('vd-spotlight-target');
      });

      // Highlight target
      if (target) {
        target.classList.add('vd-spotlight-target');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Build tooltip content
      const total = this._steps.length;
      tooltip.innerHTML = '';
      tooltip.removeAttribute('aria-labelledby');
      tooltip.removeAttribute('aria-describedby');

      if (step.title) {
        const title = document.createElement('h4');
        title.className = 'vd-spotlight-title';
        title.id = 'vd-spotlight-title-' + index + '-' + Date.now();
        title.textContent = step.title;
        tooltip.appendChild(title);
        tooltip.setAttribute('aria-labelledby', title.id);
      }

      if (step.description) {
        const desc = document.createElement('p');
        desc.className = 'vd-spotlight-description';
        desc.id = 'vd-spotlight-description-' + index + '-' + Date.now();
        desc.textContent = step.description;
        tooltip.appendChild(desc);
        tooltip.setAttribute('aria-describedby', desc.id);
      }

      // Footer
      const footer = document.createElement('div');
      footer.className = 'vd-spotlight-footer';
      footer.setAttribute('aria-label', 'Step ' + (index + 1) + ' of ' + total);

      const counter = document.createElement('span');
      counter.className = 'vd-spotlight-counter';
      counter.textContent = (index + 1) + ' / ' + total;

      const actions = document.createElement('div');
      actions.className = 'vd-spotlight-actions';

      if (index > 0) {
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'vd-spotlight-btn';
        prevBtn.textContent = 'Back';
        prevBtn.addEventListener('click', () => this.prev());
        actions.appendChild(prevBtn);
      }

      const skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      skipBtn.className = 'vd-spotlight-btn';
      skipBtn.textContent = 'Skip';
      skipBtn.addEventListener('click', () => this.stop());
      actions.appendChild(skipBtn);

      if (index < total - 1) {
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'vd-spotlight-btn vd-spotlight-btn-primary';
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => this.next());
        actions.appendChild(nextBtn);
      } else {
        const doneBtn = document.createElement('button');
        doneBtn.type = 'button';
        doneBtn.className = 'vd-spotlight-btn vd-spotlight-btn-primary';
        doneBtn.textContent = 'Done';
        doneBtn.addEventListener('click', () => this.stop());
        actions.appendChild(doneBtn);
      }

      footer.appendChild(counter);
      footer.appendChild(actions);
      tooltip.appendChild(footer);

      // Position tooltip near target
      if (target) {
        requestAnimationFrame(() => {
          const rect = target.getBoundingClientRect();
          const tRect = tooltip.getBoundingClientRect();
          let top = rect.bottom + 12 + window.scrollY;
          let left = rect.left + (rect.width - tRect.width) / 2 + window.scrollX;

          // Keep in viewport
          left = Math.max(8, Math.min(left, window.innerWidth - tRect.width - 8));
          if (top + tRect.height > window.innerHeight + window.scrollY) {
            top = rect.top - tRect.height - 12 + window.scrollY;
          }

          tooltip.style.top = top + 'px';
          tooltip.style.left = left + 'px';
        });
      }

      document.dispatchEvent(new CustomEvent('spotlight:step', {
        detail: { index, step: index, total, data: step }
      }));
    },

    next: function () {
      if (this._currentStep < this._steps.length - 1) {
        this._currentStep++;
        this._showStep(this._currentStep);
      }
    },

    prev: function () {
      if (this._currentStep > 0) {
        this._currentStep--;
        this._showStep(this._currentStep);
      }
    },

    stop: function () {
      if (!this._active) return;

      const total = this._steps.length;
      const detail = {
        completedSteps: total === 0 ? 0 : Math.min(this._currentStep + 1, total),
        total,
        completed: total > 0 && this._currentStep >= total - 1
      };

      this._active = false;

      document.querySelectorAll('.vd-spotlight-target').forEach(el => {
        el.classList.remove('vd-spotlight-target');
      });

      if (this._elements.overlay && this._elements.overlay.parentNode) {
        this._elements.overlay.parentNode.removeChild(this._elements.overlay);
      }
      if (this._elements.tooltip && this._elements.tooltip.parentNode) {
        this._elements.tooltip.parentNode.removeChild(this._elements.tooltip);
      }

      this._cleanup.forEach(fn => fn());
      this._cleanup = [];
      this._elements = {};
      this._steps = [];
      this._currentStep = 0;

      if (this._triggerElement && this._triggerElement.isConnected && typeof this._triggerElement.focus === 'function') {
        this._triggerElement.focus();
      }
      this._triggerElement = null;

      document.dispatchEvent(new CustomEvent('spotlight:end', { detail }));
    },

    destroyAll: function () {
      this.stop();
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('spotlight', Spotlight);
  }

  window.VanduoSpotlight = Spotlight;

})();
