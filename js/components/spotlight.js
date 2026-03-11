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

    init: function () {
      // Spotlight is triggered programmatically, not auto-init
    },

    start: function (steps) {
      if (this._active) this.stop();
      if (!steps || steps.length === 0) return;

      this._steps = steps;
      this._currentStep = 0;
      this._active = true;

      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'vd-spotlight-overlay';
      document.body.appendChild(overlay);

      // Create tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'vd-spotlight-tooltip';
      tooltip.setAttribute('role', 'dialog');
      tooltip.setAttribute('aria-modal', 'true');
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

      if (step.title) {
        const title = document.createElement('h4');
        title.className = 'vd-spotlight-title';
        title.textContent = step.title;
        tooltip.appendChild(title);
      }

      if (step.description) {
        const desc = document.createElement('p');
        desc.className = 'vd-spotlight-description';
        desc.textContent = step.description;
        tooltip.appendChild(desc);
      }

      // Footer
      const footer = document.createElement('div');
      footer.className = 'vd-spotlight-footer';

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
        detail: { step: index, total, data: step }
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

      document.dispatchEvent(new CustomEvent('spotlight:end'));
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
