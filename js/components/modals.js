/**
 * Vanduo Framework - Modals Component
 * JavaScript functionality for modal dialogs
 */

(function () {
  'use strict';

  /**
   * Modals Component
   */
  const Modals = {
    modals: new Map(),
    openModals: [],
    zIndexCounter: 1050,
    __vanduoScopedDestroyAll: true,

    // Store trigger cleanup functions
    _triggerCleanups: [],
    // Shared ESC key handler (installed once)
    _sharedEscHandler: null,

    getPortalState: function (modal) {
      if (!modal._vdPortalState) {
        modal._vdPortalState = {
          originalParent: null,
          originalNextSibling: null,
          placeholder: null
        };
      }
      return modal._vdPortalState;
    },

    portalToBody: function (modal) {
      if (!modal || modal.parentNode === document.body) {
        return;
      }

      const state = this.getPortalState(modal);
      state.originalParent = modal.parentNode;
      state.originalNextSibling = modal.nextSibling;

      if (!state.placeholder) {
        state.placeholder = document.createComment('vd-modal-placeholder');
      }

      state.originalParent.insertBefore(state.placeholder, modal);
      document.body.appendChild(modal);
      modal.dataset.vdPortaled = 'true';
    },

    restoreFromPortal: function (modal) {
      if (!modal) {
        return;
      }

      const state = this.getPortalState(modal);
      if (!state.placeholder) {
        delete modal.dataset.vdPortaled;
        return;
      }

      if (state.placeholder.parentNode) {
        state.placeholder.parentNode.insertBefore(modal, state.placeholder);
        state.placeholder.parentNode.removeChild(state.placeholder);
      } else if (state.originalParent && state.originalParent.isConnected) {
        if (state.originalNextSibling && state.originalNextSibling.parentNode === state.originalParent) {
          state.originalParent.insertBefore(modal, state.originalNextSibling);
        } else {
          state.originalParent.appendChild(modal);
        }
      }

      state.originalParent = null;
      state.originalNextSibling = null;
      state.placeholder = null;
      delete modal.dataset.vdPortaled;
    },

    /**
     * Initialize modals
     */
    init: function (root) {
      const modals = window.Vanduo.queryAll(root, '.vd-modal');

      modals.forEach(modal => {
        if (this.modals.has(modal)) {
          return;
        }
        this.initModal(modal);
      });

      // Handle data-modal triggers
      const triggers = window.Vanduo && typeof window.Vanduo.queryAll === 'function'
        ? window.Vanduo.queryAll(root, '[data-modal]')
        : document.querySelectorAll('[data-modal]');
      triggers.forEach(trigger => {
        if (trigger.dataset.modalTriggerInitialized) return;
        trigger.dataset.modalTriggerInitialized = 'true';

        const triggerClickHandler = (e) => {
          e.preventDefault();
          const modalId = trigger.dataset.modal;
          const modal = document.querySelector(modalId);
          if (modal) {
            this.open(modal);
          }
        };
        trigger.addEventListener('click', triggerClickHandler);
        trigger._modalTriggerCleanup = () => trigger.removeEventListener('click', triggerClickHandler);
      });
    },

    /**
     * Initialize a single modal
     * @param {HTMLElement} modal - Modal element
     */
    initModal: function (modal) {
      const backdrop = this.createBackdrop(modal);
      const closeButtons = modal.querySelectorAll('.vd-modal-close, [data-dismiss="modal"]');
      const dialog = modal.querySelector('.vd-modal-dialog');

      if (!dialog) {
        return;
      }

      const cleanupFunctions = [];

      // Set ARIA attributes
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');

      // Generate ID if not exists
      if (!modal.id) {
        modal.id = 'modal-' + Math.random().toString(36).substr(2, 9);
      }

      // Set aria-labelledby
      const title = modal.querySelector('.vd-modal-title');
      if (title && !title.id) {
        title.id = modal.id + '-title';
        modal.setAttribute('aria-labelledby', title.id);
      }

      // Close button handlers
      closeButtons.forEach(button => {
        const closeHandler = () => {
          this.close(modal);
        };
        button.addEventListener('click', closeHandler);
        cleanupFunctions.push(() => button.removeEventListener('click', closeHandler));
      });

      // Backdrop click handler
      const backdropClickHandler = (e) => {
        if (e.target === backdrop && modal.dataset.backdrop !== 'static') {
          this.close(modal);
        }
      };
      backdrop.addEventListener('click', backdropClickHandler);
      cleanupFunctions.push(() => backdrop.removeEventListener('click', backdropClickHandler));

      // ESC key handler — use a single shared handler instead of one-per-modal
      if (!this._sharedEscHandler) {
        this._sharedEscHandler = (e) => {
          if (e.key === 'Escape' && this.openModals.length > 0) {
            const topModal = this.openModals[this.openModals.length - 1];
            if (topModal.dataset.keyboard !== 'false') {
              this.close(topModal);
            }
          }
        };
        document.addEventListener('keydown', this._sharedEscHandler);
      }

      this.modals.set(modal, { backdrop, dialog, trapHandler: null, cleanup: cleanupFunctions });
    },

    /**
     * Create backdrop element
     * @param {HTMLElement} modal - Modal element
     * @returns {HTMLElement} Backdrop element
     */
    createBackdrop: function (modal) {
      let backdrop = modal.querySelector('.vd-modal-backdrop');

      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'vd-modal-backdrop';
        document.body.appendChild(backdrop);
      }

      return backdrop;
    },

    /**
     * Open modal
     * @param {HTMLElement|string} modal - Modal element or selector
     */
    open: function (modal) {
      const el = typeof modal === 'string' ? document.querySelector(modal) : modal;

      if (!el) {
        console.warn('[Vanduo Modals] Modal element not found:', modal);
        return;
      }

      if (!this.modals.has(el)) {
        console.warn('[Vanduo Modals] Modal not initialized:', el);
        return;
      }

      const modalData = this.modals.get(el);
      const { backdrop, dialog: _dialog } = modalData;

      this.portalToBody(el);

      // Increment z-index for stacking
      this.zIndexCounter += 10;
      el.style.zIndex = this.zIndexCounter;
      backdrop.style.zIndex = this.zIndexCounter - 1;

      // Add to open modals stack
      this.openModals.push(el);

      // Show backdrop
      backdrop.classList.add('is-visible');

      // Show modal
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');

      // Lock body scroll
      if (this.openModals.length === 1) {
        document.body.classList.add('body-modal-open');
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      }

      // Focus trap (store handler for cleanup)
      const trapHandler = this.trapFocus(el);
      modalData.trapHandler = trapHandler;

      // Auto-focus first focusable element
      setTimeout(() => {
        const firstFocusable = this.getFocusableElements(el)[0];
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }, 100);

      // Dispatch event
      el.dispatchEvent(new CustomEvent('modal:open', { bubbles: true }));
    },

    /**
     * Close modal
     * @param {HTMLElement|string} modal - Modal element or selector
     */
    close: function (modal) {
      const el = typeof modal === 'string' ? document.querySelector(modal) : modal;

      if (!el) {
        console.warn('[Vanduo Modals] Modal element not found:', modal);
        return;
      }

      if (!this.modals.has(el)) {
        console.warn('[Vanduo Modals] Modal not initialized:', el);
        return;
      }

      const modalData = this.modals.get(el);
      const { backdrop, trapHandler } = modalData;

      // Remove focus trap event listener to prevent memory leak
      if (trapHandler) {
        el.removeEventListener('keydown', trapHandler);
        modalData.trapHandler = null;
      }

      // Remove from open modals stack
      const index = this.openModals.indexOf(el);
      if (index > -1) {
        this.openModals.splice(index, 1);
      }

      // Hide modal
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');

      // Hide backdrop if no other modals open
      if (this.openModals.length === 0) {
        backdrop.classList.remove('is-visible');
        document.body.classList.remove('body-modal-open');
        document.body.style.paddingRight = '';
        // Reset z-index counter to prevent indefinite growth
        this.zIndexCounter = 1050;
      } else {
        // Show backdrop for top modal
        const topModal = this.openModals[this.openModals.length - 1];
        const topBackdrop = this.modals.get(topModal).backdrop;
        topBackdrop.classList.add('is-visible');
      }

      // Return focus to trigger
      const trigger = document.querySelector(`[data-modal="#${el.id}"]`);
      if (trigger) {
        trigger.focus();
      }

      // Dispatch event
      el.dispatchEvent(new CustomEvent('modal:close', { bubbles: true }));

      this.restoreFromPortal(el);
    },

    /**
     * Trap focus within modal
     * @param {HTMLElement} modal - Modal element
     * @returns {Function} The trap handler function for cleanup
     */
    trapFocus: function (modal) {
      const self = this;

      const trapHandler = function (e) {
        if (e.key !== 'Tab') {
          return;
        }

        const focusableElements = self.getFocusableElements(modal);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      modal.addEventListener('keydown', trapHandler);
      return trapHandler;
    },

    /**
     * Get focusable elements within modal
     * @param {HTMLElement} modal - Modal element
     * @returns {Array<HTMLElement>} Focusable elements
     */
    getFocusableElements: function (modal) {
      const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(modal.querySelectorAll(selector)).filter(el => {
        return !el.hasAttribute('disabled') &&
          el.offsetWidth > 0 &&
          el.offsetHeight > 0;
      });
    },

    /**
     * Toggle modal
     * @param {HTMLElement|string} modal - Modal element or selector
     */
    toggle: function (modal) {
      const el = typeof modal === 'string' ? document.querySelector(modal) : modal;
      if (el) {
        if (el.classList.contains('is-open')) {
          this.close(el);
        } else {
          this.open(el);
        }
      }
    },

    /**
     * Destroy a modal instance and clean up event listeners
     * @param {HTMLElement} modal - Modal element
     */
    destroy: function (modal) {
      const modalData = this.modals.get(modal);
      if (!modalData) return;

      if (modal.classList.contains('is-open')) {
        const index = this.openModals.indexOf(modal);
        if (index > -1) {
          this.openModals.splice(index, 1);
        }
        modalData.backdrop.classList.remove('is-visible');
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        if (this.openModals.length === 0) {
          document.body.classList.remove('body-modal-open');
          document.body.style.paddingRight = '';
          this.zIndexCounter = 1050;
        }
      }

      this.restoreFromPortal(modal);

      // Run all cleanup functions
      if (modalData.cleanup) {
        modalData.cleanup.forEach(fn => fn());
      }

      // Remove created backdrop
      if (modalData.backdrop && modalData.backdrop.parentNode) {
        modalData.backdrop.parentNode.removeChild(modalData.backdrop);
      }

      this.modals.delete(modal);
    },

    /**
     * Destroy all modal instances
     */
    destroyAll: function (root) {
      const scope = window.Vanduo && typeof window.Vanduo._normalizeRoot === 'function'
        ? window.Vanduo._normalizeRoot(root)
        : (root || document);

      this.modals.forEach((data, modal) => {
        if (scope === document || scope === modal || (typeof scope.contains === 'function' && scope.contains(modal))) {
          this.destroy(modal);
        }
      });

      const triggers = window.Vanduo && typeof window.Vanduo.queryAll === 'function'
        ? window.Vanduo.queryAll(scope, '[data-modal][data-modal-trigger-initialized]')
        : document.querySelectorAll('[data-modal][data-modal-trigger-initialized]');
      triggers.forEach(trigger => {
        if (trigger._modalTriggerCleanup) {
          trigger._modalTriggerCleanup();
          delete trigger._modalTriggerCleanup;
        }
        delete trigger.dataset.modalTriggerInitialized;
      });

      if (scope === document && this._sharedEscHandler) {
        document.removeEventListener('keydown', this._sharedEscHandler);
        this._sharedEscHandler = null;
      }
    }
  };

  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('modals', Modals);
  }

  // Expose globally
  window.VanduoModals = Modals;

})();
