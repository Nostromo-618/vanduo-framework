/**
 * Vanduo Framework - Popover Component
 *
 * Multi-trigger popover (click | hover | focus) with auto-placement flip.
 * Distinct from .vd-bubble (which is click-only rich HTML); popover is the
 * general-purpose primitive documented in `sections/components/popover.html`.
 *
 * Markup:
 *   <button class="vd-popover-trigger"
 *           data-vd-popover-target="#my-panel"
 *           data-vd-popover-placement="top|bottom|left|right"
 *           data-vd-popover-trigger="click|hover|focus"
 *           aria-haspopup="dialog">…</button>
 *   <div id="my-panel" class="vd-popover-panel" role="dialog" hidden>…</div>
 *
 * Public API (window.VanduoPopover):
 *   init(root)        Scan root for triggers, wire instances. Idempotent.
 *   destroy(trigger)  Tear down one instance.
 *   destroyAll(root)  Tear down every instance inside root.
 *   show(trigger)     Open one trigger's panel.
 *   hide(trigger)     Close one trigger's panel.
 *   flipPlacement(trigger) Recompute placement; flips when overflow detected.
 */

(function () {
  'use strict';

  const PLACEMENTS = ['top', 'bottom', 'left', 'right'];
  const TRIGGERS = ['click', 'hover', 'focus'];
  const DEFAULT_GAP = 8;

  function resolvePlacement(preferred) {
    return PLACEMENTS.indexOf(preferred) !== -1 ? preferred : 'bottom';
  }

  function resolveTrigger(value) {
    if (!value) return ['click', 'focus'];
    return value
      .split(/\s+/)
      .filter(function (t) { return TRIGGERS.indexOf(t) !== -1; });
  }

  function findPanel(trigger) {
    const targetSelector = trigger.getAttribute('data-vd-popover-target');
    if (!targetSelector) return null;
    const doc = trigger.ownerDocument || document;
    const panel = doc.querySelector(targetSelector);
    if (!panel) return null;
    if (!panel.classList.contains('vd-popover-panel')) {
      panel.classList.add('vd-popover-panel');
    }
    return panel;
  }

  const Popover = {
    instances: new Map(),
    _globalCleanups: [],

    init: function (root) {
      const scope = root || document;
      const triggers = (scope.querySelectorAll
        ? scope.querySelectorAll('.vd-popover-trigger')
        : document.querySelectorAll('.vd-popover-trigger'));

      Array.prototype.forEach.call(triggers, function (trigger) {
        if (Popover.instances.has(trigger)) return;
        Popover.initInstance(trigger);
      });

      if (Popover._globalCleanups.length === 0) {
        const outsideClick = function (event) {
          Popover.instances.forEach(function (inst, trigger) {
            if (inst.trigger !== 'click') return;
            if (inst.panel.contains(event.target) || trigger.contains(event.target)) return;
            Popover.hide(trigger);
          });
        };
        const escHandler = function (event) {
          if (event.key !== 'Escape') return;
          let lastOpen = null;
          Popover.instances.forEach(function (inst, trigger) {
            if (inst.panel.hasAttribute('hidden') === false) lastOpen = trigger;
          });
          if (lastOpen) Popover.hide(lastOpen);
        };
        document.addEventListener('click', outsideClick, true);
        document.addEventListener('keydown', escHandler);
        Popover._globalCleanups.push(function () {
          document.removeEventListener('click', outsideClick, true);
        });
        Popover._globalCleanups.push(function () {
          document.removeEventListener('keydown', escHandler);
        });
      }
    },

    initInstance: function (trigger) {
      const panel = findPanel(trigger);
      if (!panel) return;
      const cleanup = [];
      const placement = resolvePlacement(trigger.getAttribute('data-vd-popover-placement'));
      const triggers = resolveTrigger(trigger.getAttribute('data-vd-popover-trigger'));
      const allowFlip = trigger.getAttribute('data-vd-popover-flip') !== 'false';

      if (!panel.id) {
        panel.id = 'vd-popover-' + Math.random().toString(36).slice(2, 9);
      }
      if (!panel.hasAttribute('role')) panel.setAttribute('role', 'dialog');
      if (!panel.hasAttribute('aria-modal')) panel.setAttribute('aria-modal', 'false');

      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', panel.id);

      if (triggers.indexOf('click') !== -1) {
        const clickHandler = function (event) {
          event.stopPropagation();
          const expanded = trigger.getAttribute('aria-expanded') === 'true';
          if (expanded) Popover.hide(trigger);
          else {
            Popover._closeOthers(trigger);
            Popover.show(trigger);
          }
        };
        trigger.addEventListener('click', clickHandler);
        cleanup.push(function () { trigger.removeEventListener('click', clickHandler); });
      }

      if (triggers.indexOf('hover') !== -1) {
        const enterHandler = function () { Popover.show(trigger); };
        const leaveHandler = function () {
          setTimeout(function () {
            if (!panel.matches(':hover') && !trigger.matches(':hover')) Popover.hide(trigger);
          }, 80);
        };
        trigger.addEventListener('mouseenter', enterHandler);
        trigger.addEventListener('mouseleave', leaveHandler);
        panel.addEventListener('mouseenter', enterHandler);
        panel.addEventListener('mouseleave', leaveHandler);
        cleanup.push(function () { trigger.removeEventListener('mouseenter', enterHandler); });
        cleanup.push(function () { trigger.removeEventListener('mouseleave', leaveHandler); });
        cleanup.push(function () { panel.removeEventListener('mouseenter', enterHandler); });
        cleanup.push(function () { panel.removeEventListener('mouseleave', leaveHandler); });
      }

      if (triggers.indexOf('focus') !== -1) {
        const focusHandler = function () { Popover.show(trigger); };
        const blurHandler = function (event) {
          if (panel.contains(event.relatedTarget)) return;
          Popover.hide(trigger);
        };
        trigger.addEventListener('focus', focusHandler);
        trigger.addEventListener('blur', blurHandler);
        cleanup.push(function () { trigger.removeEventListener('focus', focusHandler); });
        cleanup.push(function () { trigger.removeEventListener('blur', blurHandler); });
      }

      const resizeHandler = function () { Popover.flipPlacement(trigger); };
      window.addEventListener('resize', resizeHandler);
      window.addEventListener('scroll', resizeHandler, true);
      cleanup.push(function () { window.removeEventListener('resize', resizeHandler); });
      cleanup.push(function () { window.removeEventListener('scroll', resizeHandler, true); });

      Popover.instances.set(trigger, {
        panel: panel,
        cleanup: cleanup,
        placement: placement,
        trigger: triggers.join(' '),
        allowFlip: allowFlip
      });
    },

    show: function (trigger) {
      const inst = Popover.instances.get(trigger);
      if (!inst) return;
      inst.panel.hidden = false;
      // Two rAFs: first lets layout settle, second positions after styles applied.
      requestAnimationFrame(function () {
        Popover.position(trigger, inst.panel, inst.placement);
        trigger.setAttribute('aria-expanded', 'true');
        inst.panel.setAttribute('data-placement', inst.placement);
        trigger.dispatchEvent(new CustomEvent('popover:show', {
          bubbles: true,
          detail: { trigger: trigger, placement: inst.placement }
        }));
      });
    },

    hide: function (trigger) {
      const inst = Popover.instances.get(trigger);
      if (!inst) return;
      inst.panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.dispatchEvent(new CustomEvent('popover:hide', {
        bubbles: true,
        detail: { trigger: trigger }
      }));
    },

    _closeOthers: function (currentTrigger) {
      Popover.instances.forEach(function (_inst, trigger) {
        if (trigger !== currentTrigger) Popover.hide(trigger);
      });
    },

    position: function (trigger, panel, placement) {
      const rect = trigger.getBoundingClientRect();
      const popRect = panel.getBoundingClientRect();
      const gap = DEFAULT_GAP;
      let top;
      let left;
      const win = panel.ownerDocument.defaultView || window;
      const scrollX = win.pageXOffset || 0;
      const scrollY = win.pageYOffset || 0;

      switch (placement) {
        case 'top':
          top = rect.top - popRect.height - gap + scrollY;
          left = rect.left + (rect.width - popRect.width) / 2 + scrollX;
          break;
        case 'left':
          top = rect.top + (rect.height - popRect.height) / 2 + scrollY;
          left = rect.left - popRect.width - gap + scrollX;
          break;
        case 'right':
          top = rect.top + (rect.height - popRect.height) / 2 + scrollY;
          left = rect.right + gap + scrollX;
          break;
        default: // bottom
          top = rect.bottom + gap + scrollY;
          left = rect.left + (rect.width - popRect.width) / 2 + scrollX;
      }

      left = Math.max(8, Math.min(left, win.innerWidth - popRect.width - 8));
      top = Math.max(8, top);

      panel.style.position = 'absolute';
      panel.style.top = top + 'px';
      panel.style.left = left + 'px';
    },

    flipPlacement: function (trigger) {
      const inst = Popover.instances.get(trigger);
      if (!inst || !inst.allowFlip) return;
      if (inst.panel.hidden) return;
      const win = inst.panel.ownerDocument.defaultView || window;
      const rect = trigger.getBoundingClientRect();
      const popRect = inst.panel.getBoundingClientRect();
      const gap = DEFAULT_GAP;
      let flipped = null;
      const current = inst.placement;

      if (current === 'top' && rect.top - popRect.height - gap < 0) flipped = 'bottom';
      else if (current === 'bottom' && rect.bottom + popRect.height + gap > win.innerHeight) flipped = 'top';
      else if (current === 'left' && rect.left - popRect.width - gap < 0) flipped = 'right';
      else if (current === 'right' && rect.right + popRect.width + gap > win.innerWidth) flipped = 'left';

      if (flipped) {
        inst.placement = flipped;
        Popover.position(trigger, inst.panel, flipped);
        inst.panel.setAttribute('data-placement', flipped);
      }
    },

    destroy: function (trigger) {
      const inst = Popover.instances.get(trigger);
      if (!inst) return;
      inst.cleanup.forEach(function (fn) { fn(); });
      Popover.hide(trigger);
      trigger.removeAttribute('aria-haspopup');
      trigger.removeAttribute('aria-expanded');
      trigger.removeAttribute('aria-controls');
      Popover.instances.delete(trigger);
    },

    destroyAll: function (root) {
      const triggers = [];
      Popover.instances.forEach(function (_inst, trigger) {
        if (!root || (trigger.closest && trigger.closest(root))) triggers.push(trigger);
      });
      triggers.forEach(function (trigger) { Popover.destroy(trigger); });
      if (Popover.instances.size === 0) {
        Popover._globalCleanups.forEach(function (fn) { fn(); });
        Popover._globalCleanups = [];
      }
    }
  };

  if (typeof window !== 'undefined') {
    if (typeof window.Vanduo !== 'undefined' && typeof window.Vanduo.register === 'function') {
      window.Vanduo.register('popover', Popover);
    }
    window.VanduoPopover = Popover;
  }
})();