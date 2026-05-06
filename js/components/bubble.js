/**
 * Vanduo Framework - Bubble (Popover) Component
 * Click-triggered rich HTML popover, reuses tooltip positioning concepts
 */

(function () {
  'use strict';

  const Bubble = {
    instances: new Map(),
    _globalCleanups: [],

    init: function () {
      const triggers = document.querySelectorAll('[data-vd-bubble], [data-vd-popover]');
      triggers.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });

      if (this._globalCleanups.length === 0) {
        const outsideClick = (e) => {
          this.instances.forEach((inst, trigger) => {
            if (!inst.popover.contains(e.target) && !trigger.contains(e.target)) {
              this.hide(trigger);
            }
          });
        };
        const escHandler = (e) => {
          if (e.key === 'Escape') {
            this.instances.forEach((_, trigger) => this.hide(trigger));
          }
        };
        document.addEventListener('click', outsideClick, true);
        document.addEventListener('keydown', escHandler);
        this._globalCleanups.push(
          () => document.removeEventListener('click', outsideClick, true),
          () => document.removeEventListener('keydown', escHandler)
        );
      }
    },

    initInstance: function (trigger) {
      const cleanup = [];
      const placement = trigger.getAttribute('data-vd-bubble-placement') ||
                         trigger.getAttribute('data-vd-popover-placement') || 'bottom';

      // Build popover element
      const popover = document.createElement('div');
      popover.className = 'vd-bubble-content';
      popover.setAttribute('role', 'dialog');
      popover.setAttribute('aria-modal', 'false');
      popover.setAttribute('data-placement', placement);

      const title = trigger.getAttribute('data-vd-bubble-title') ||
                    trigger.getAttribute('data-vd-popover-title');
      const content = trigger.getAttribute('data-vd-bubble') ||
                      trigger.getAttribute('data-vd-popover') || '';
      const htmlContent = trigger.getAttribute('data-vd-bubble-html') ||
              trigger.getAttribute('data-vd-popover-html');
      const allowSvg = trigger.hasAttribute('data-vd-bubble-allow-svg') ||
               trigger.hasAttribute('data-vd-popover-allow-svg');

      if (title) {
        const header = document.createElement('div');
        header.className = 'vd-bubble-header';
        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;
        const closeBtn = document.createElement('button');
        closeBtn.className = 'vd-bubble-close';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = '&times;';
        header.appendChild(titleSpan);
        header.appendChild(closeBtn);
        popover.appendChild(header);

        const closeHandler = (e) => { e.stopPropagation(); this.hide(trigger); };
        closeBtn.addEventListener('click', closeHandler);
        cleanup.push(() => closeBtn.removeEventListener('click', closeHandler));
      }

      const body = document.createElement('div');
      body.className = 'vd-bubble-body';
      if (htmlContent) {
        if (typeof sanitizeHtml === 'function') {
          body.innerHTML = sanitizeHtml(htmlContent, { allowSvg });
        } else {
          body.textContent = htmlContent;
        }
      } else {
        body.textContent = content;
      }
      popover.appendChild(body);

      document.body.appendChild(popover);

      // ARIA on trigger
      const popId = 'vd-bubble-' + Math.random().toString(36).slice(2, 9);
      popover.id = popId;
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', popId);

      // Toggle on click
      const toggleHandler = (e) => {
        e.stopPropagation();
        if (popover.classList.contains('is-visible')) {
          this.hide(trigger);
        } else {
          this.hideAll();
          this.show(trigger);
        }
      };
      trigger.addEventListener('click', toggleHandler);
      cleanup.push(() => trigger.removeEventListener('click', toggleHandler));

      this.instances.set(trigger, { popover, cleanup, placement });
    },

    position: function (trigger, popover, placement) {
      const rect = trigger.getBoundingClientRect();
      const popRect = popover.getBoundingClientRect();
      const gap = 10;
      let top, left;

      switch (placement) {
        case 'top':
          top = rect.top - popRect.height - gap + window.scrollY;
          left = rect.left + (rect.width - popRect.width) / 2 + window.scrollX;
          break;
        case 'left':
          top = rect.top + (rect.height - popRect.height) / 2 + window.scrollY;
          left = rect.left - popRect.width - gap + window.scrollX;
          break;
        case 'right':
          top = rect.top + (rect.height - popRect.height) / 2 + window.scrollY;
          left = rect.right + gap + window.scrollX;
          break;
        default: // bottom
          top = rect.bottom + gap + window.scrollY;
          left = rect.left + (rect.width - popRect.width) / 2 + window.scrollX;
      }

      // Clamp to viewport
      left = Math.max(8, Math.min(left, window.innerWidth - popRect.width - 8));
      top = Math.max(8, top);

      popover.style.top = top + 'px';
      popover.style.left = left + 'px';
    },

    show: function (trigger) {
      const instance = this.instances.get(trigger);
      if (!instance) return;
      const { popover, placement } = instance;

      popover.style.display = 'block';
      popover.classList.add('is-visible');
      trigger.setAttribute('aria-expanded', 'true');

      requestAnimationFrame(() => {
        this.position(trigger, popover, placement);
      });

      trigger.dispatchEvent(new CustomEvent('bubble:show', {
        bubbles: true,
        detail: { trigger: trigger, placement: placement }
      }));
    },

    hide: function (trigger) {
      const instance = this.instances.get(trigger);
      if (!instance) return;
      instance.popover.classList.remove('is-visible');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.dispatchEvent(new CustomEvent('bubble:hide', {
        bubbles: true,
        detail: { trigger: trigger }
      }));
    },

    hideAll: function () {
      this.instances.forEach((_, trigger) => this.hide(trigger));
    },

    destroy: function (trigger) {
      const instance = this.instances.get(trigger);
      if (!instance) return;
      instance.cleanup.forEach(fn => fn());
      if (instance.popover.parentNode) {
        instance.popover.parentNode.removeChild(instance.popover);
      }
      trigger.removeAttribute('aria-haspopup');
      trigger.removeAttribute('aria-expanded');
      trigger.removeAttribute('aria-controls');
      this.instances.delete(trigger);
    },

    destroyAll: function () {
      this.instances.forEach((_, trigger) => this.destroy(trigger));
      this._globalCleanups.forEach(fn => fn());
      this._globalCleanups = [];
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('bubble', Bubble);
  }

  window.VanduoBubble = Bubble;

})();
