/**
 * Vanduo Framework - Modals Component
 * JavaScript functionality for modal dialogs
 */

(function() {
  'use strict';

  /**
   * Modals Component
   */
  const Modals = {
    modals: new Map(),
    openModals: [],
    zIndexCounter: 1050,
    
    /**
     * Initialize modals
     */
    init: function() {
      const modals = document.querySelectorAll('.modal');
      
      modals.forEach(modal => {
        if (!modal.dataset.modalInitialized) {
          this.initModal(modal);
        }
      });
      
      // Handle data-modal triggers
      const triggers = document.querySelectorAll('[data-modal]');
      triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const modalId = trigger.dataset.modal;
          const modal = document.querySelector(modalId);
          if (modal) {
            this.open(modal);
          }
        });
      });
    },
    
    /**
     * Initialize a single modal
     * @param {HTMLElement} modal - Modal element
     */
    initModal: function(modal) {
      modal.dataset.modalInitialized = 'true';
      
      const backdrop = this.createBackdrop(modal);
      const closeButtons = modal.querySelectorAll('.modal-close, [data-dismiss="modal"]');
      const dialog = modal.querySelector('.modal-dialog');
      
      if (!dialog) {
        return;
      }
      
      // Set ARIA attributes
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      
      // Generate ID if not exists
      if (!modal.id) {
        modal.id = 'modal-' + Math.random().toString(36).substr(2, 9);
      }
      
      // Set aria-labelledby
      const title = modal.querySelector('.modal-title');
      if (title && !title.id) {
        title.id = modal.id + '-title';
        modal.setAttribute('aria-labelledby', title.id);
      }
      
      // Close button handlers
      closeButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.close(modal);
        });
      });
      
      // Backdrop click handler
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop && modal.dataset.backdrop !== 'static') {
          this.close(modal);
        }
      });
      
      // ESC key handler
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.openModals.length > 0) {
          const topModal = this.openModals[this.openModals.length - 1];
          if (topModal.dataset.keyboard !== 'false') {
            this.close(topModal);
          }
        }
      });
      
      this.modals.set(modal, { backdrop, dialog, trapHandler: null });
    },
    
    /**
     * Create backdrop element
     * @param {HTMLElement} modal - Modal element
     * @returns {HTMLElement} Backdrop element
     */
    createBackdrop: function(modal) {
      let backdrop = modal.querySelector('.modal-backdrop');
      
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        document.body.appendChild(backdrop);
      }
      
      return backdrop;
    },
    
    /**
     * Open modal
     * @param {HTMLElement|string} modal - Modal element or selector
     */
    open: function(modal) {
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
      const { backdrop, dialog } = modalData;
      
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
    close: function(modal) {
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
    },
    
    /**
     * Trap focus within modal
     * @param {HTMLElement} modal - Modal element
     * @returns {Function} The trap handler function for cleanup
     */
    trapFocus: function(modal) {
      const self = this;

      const trapHandler = function(e) {
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
    getFocusableElements: function(modal) {
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
    toggle: function(modal) {
      const el = typeof modal === 'string' ? document.querySelector(modal) : modal;
      if (el) {
        if (el.classList.contains('is-open')) {
          this.close(el);
        } else {
          this.open(el);
        }
      }
    }
  };
  
  // Initialize when DOM is ready
  if (typeof ready !== 'undefined') {
    ready(() => {
      Modals.init();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        Modals.init();
      });
    } else {
      Modals.init();
    }
  }
  
  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('modals', Modals);
  }
  
  // Expose globally
  window.VanduoModals = Modals;
  
  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modals;
  }
})();

