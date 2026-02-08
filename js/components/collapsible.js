/**
 * Vanduo Framework - Collapsible Component
 * JavaScript functionality for collapsible/accordion components
 */

(function() {
  'use strict';

  /**
   * Collapsible Component
   */
  const Collapsible = {
    // Store initialized containers and their cleanup functions
    instances: new Map(),

    /**
     * Initialize collapsible components
     */
    init: function() {
      const collapsibles = document.querySelectorAll('.vd-collapsible, .accordion');

      collapsibles.forEach(container => {
        if (this.instances.has(container)) {
          return;
        }
        this.initCollapsible(container);
      });
    },

    /**
     * Initialize a collapsible container
     * @param {HTMLElement} container - Collapsible container
     */
    initCollapsible: function(container) {
      const isAccordion = container.classList.contains('accordion');
      const items = container.querySelectorAll('.vd-collapsible-item, .accordion-item');
      const cleanupFunctions = [];

      items.forEach(item => {
        const header = item.querySelector('.vd-collapsible-header, .accordion-header');
        const body = item.querySelector('.vd-collapsible-body, .accordion-body');
        const trigger = item.querySelector('.vd-collapsible-trigger, .accordion-trigger') || header;

        if (!header || !body) {
          return;
        }

        // Set initial state
        if (item.classList.contains('is-open')) {
          this.openItem(item, body, false);
        } else {
          this.closeItem(item, body, false);
        }

        // Add click handler
        const clickHandler = (e) => {
          e.preventDefault();
          this.toggleItem(item, body, container, isAccordion);
        };
        trigger.addEventListener('click', clickHandler);
        cleanupFunctions.push(() => trigger.removeEventListener('click', clickHandler));
      });

      this.instances.set(container, { cleanup: cleanupFunctions });
    },
    
    /**
     * Toggle collapsible item
     * @param {HTMLElement} item - Collapsible item
     * @param {HTMLElement} body - Collapsible body
     * @param {HTMLElement} container - Collapsible container
     * @param {boolean} isAccordion - Whether in accordion mode
     */
    toggleItem: function(item, body, container, isAccordion) {
      const isOpen = item.classList.contains('is-open');
      
      if (isOpen) {
        this.closeItem(item, body);
      } else {
        // If accordion mode, close other open items
        if (isAccordion) {
          const otherOpenItems = container.querySelectorAll('.vd-collapsible-item.is-open, .accordion-item.is-open');
          otherOpenItems.forEach(otherItem => {
            if (otherItem !== item) {
              const otherBody = otherItem.querySelector('.vd-collapsible-body, .accordion-body');
              this.closeItem(otherItem, otherBody);
            }
          });
        }
        
        this.openItem(item, body);
      }
    },
    
    /**
     * Open collapsible item
     * @param {HTMLElement} item - Collapsible item
     * @param {HTMLElement} body - Collapsible body
     * @param {boolean} animate - Whether to animate
     */
    openItem: function(item, body, animate = true) {
      if (!animate) {
        body.style.transition = 'none';
      }
      
      item.classList.add('is-open');
      item.setAttribute('aria-expanded', 'true');
      
      // Set max-height to actual height
      const height = body.scrollHeight;
      body.style.maxHeight = `${height}px`;
      
      // Reset transition after a brief delay
      if (!animate) {
        setTimeout(() => {
          body.style.transition = '';
        }, 0);
      }
      
      // Dispatch event
      item.dispatchEvent(new CustomEvent('collapsible:open', { bubbles: true }));
    },
    
    /**
     * Close collapsible item
     * @param {HTMLElement} item - Collapsible item
     * @param {HTMLElement} body - Collapsible body
     * @param {boolean} animate - Whether to animate
     */
    closeItem: function(item, body, animate = true) {
      if (!animate) {
        body.style.transition = 'none';
      }
      
      item.classList.remove('is-open');
      item.setAttribute('aria-expanded', 'false');
      body.style.maxHeight = '0';
      
      // Reset transition after a brief delay
      if (!animate) {
        setTimeout(() => {
          body.style.transition = '';
        }, 0);
      }
      
      // Dispatch event
      item.dispatchEvent(new CustomEvent('collapsible:close', { bubbles: true }));
    },
    
    /**
     * Open item programmatically
     * @param {HTMLElement|string} item - Collapsible item or selector
     */
    open: function(item) {
      const el = typeof item === 'string' ? document.querySelector(item) : item;
      if (el) {
        const body = el.querySelector('.vd-collapsible-body, .accordion-body');
        if (body) {
          this.openItem(el, body);
        }
      }
    },
    
    /**
     * Close item programmatically
     * @param {HTMLElement|string} item - Collapsible item or selector
     */
    close: function(item) {
      const el = typeof item === 'string' ? document.querySelector(item) : item;
      if (el) {
        const body = el.querySelector('.vd-collapsible-body, .accordion-body');
        if (body) {
          this.closeItem(el, body);
        }
      }
    },
    
    /**
     * Toggle item programmatically
     * @param {HTMLElement|string} item - Collapsible item or selector
     */
    toggle: function(item) {
      const el = typeof item === 'string' ? document.querySelector(item) : item;
      if (el) {
        const body = el.querySelector('.vd-collapsible-body, .accordion-body');
        const container = el.closest('.vd-collapsible, .accordion');
        const isAccordion = container && container.classList.contains('accordion');

        if (body) {
          this.toggleItem(el, body, container, isAccordion);
        }
      }
    },

    /**
     * Destroy a collapsible instance and clean up event listeners
     * @param {HTMLElement} container - Collapsible container
     */
    destroy: function(container) {
      const instance = this.instances.get(container);
      if (!instance) return;

      instance.cleanup.forEach(fn => fn());
      this.instances.delete(container);
    },

    /**
     * Destroy all collapsible instances
     */
    destroyAll: function() {
      this.instances.forEach((instance, container) => {
        this.destroy(container);
      });
    }
  };
  
  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('collapsible', Collapsible);
  }
  
  // Expose globally
  window.VanduoCollapsible = Collapsible;
  
})();

