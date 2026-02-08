/**
 * Vanduo Framework - Dropdown Component
 * JavaScript functionality for dropdown menus
 */

(function() {
  'use strict';

  /**
   * Dropdown Component
   */
  const Dropdown = {
    // Store initialized dropdowns and their cleanup functions
    instances: new Map(),
    // Typeahead state
    _typeaheadBuffer: '',
    _typeaheadTimer: null,

    /**
     * Initialize dropdown components
     */
    init: function() {
      const dropdowns = document.querySelectorAll('.vd-dropdown');

      dropdowns.forEach(dropdown => {
        if (this.instances.has(dropdown)) {
          return;
        }
        this.initDropdown(dropdown);
      });
    },

    /**
     * Initialize a single dropdown
     * @param {HTMLElement} dropdown - Dropdown container
     */
    initDropdown: function(dropdown) {
      const toggle = dropdown.querySelector('.vd-dropdown-toggle');
      const menu = dropdown.querySelector('.vd-dropdown-menu');

      if (!toggle || !menu) {
        return;
      }

      const cleanupFunctions = [];

      // Set ARIA attributes
      toggle.setAttribute('aria-haspopup', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-hidden', 'true');

      // Toggle on click
      const toggleClickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown(dropdown, toggle, menu);
      };
      toggle.addEventListener('click', toggleClickHandler);
      cleanupFunctions.push(() => toggle.removeEventListener('click', toggleClickHandler));

      // Close on outside click
      const documentClickHandler = (e) => {
        if (!dropdown.contains(e.target) && menu.classList.contains('is-open')) {
          this.closeDropdown(dropdown, toggle, menu);
        }
      };
      document.addEventListener('click', documentClickHandler);
      cleanupFunctions.push(() => document.removeEventListener('click', documentClickHandler));

      // Keyboard navigation
      const keydownHandler = (e) => {
        this.handleKeydown(e, dropdown, toggle, menu);
      };
      toggle.addEventListener('keydown', keydownHandler);
      cleanupFunctions.push(() => toggle.removeEventListener('keydown', keydownHandler));

      // Handle item clicks
      const items = menu.querySelectorAll('.vd-dropdown-item:not(.disabled):not(.is-disabled)');
      items.forEach(item => {
        const itemClickHandler = (e) => {
          e.preventDefault();
          this.selectItem(item, dropdown, toggle, menu);
        };
        item.addEventListener('click', itemClickHandler);
        cleanupFunctions.push(() => item.removeEventListener('click', itemClickHandler));

        const itemKeydownHandler = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectItem(item, dropdown, toggle, menu);
          }
        };
        item.addEventListener('keydown', itemKeydownHandler);
        cleanupFunctions.push(() => item.removeEventListener('keydown', itemKeydownHandler));
      });

      this.instances.set(dropdown, { toggle, menu, cleanup: cleanupFunctions });
    },
    
    /**
     * Toggle dropdown
     * @param {HTMLElement} dropdown - Dropdown container
     * @param {HTMLElement} toggle - Toggle button
     * @param {HTMLElement} menu - Dropdown menu
     */
    toggleDropdown: function(dropdown, toggle, menu) {
      const isOpen = menu.classList.contains('is-open');
      
      if (isOpen) {
        this.closeDropdown(dropdown, toggle, menu);
      } else {
        this.openDropdown(dropdown, toggle, menu);
      }
    },
    
    /**
     * Open dropdown
     * @param {HTMLElement} dropdown - Dropdown container
     * @param {HTMLElement} toggle - Toggle button
     * @param {HTMLElement} menu - Dropdown menu
     */
    openDropdown: function(dropdown, toggle, menu) {
      // Close other open dropdowns
      const otherOpen = document.querySelectorAll('.vd-dropdown-menu.is-open');
      otherOpen.forEach(otherMenu => {
        if (otherMenu !== menu) {
          const otherDropdown = otherMenu.closest('.vd-dropdown');
          const otherToggle = otherDropdown.querySelector('.vd-dropdown-toggle');
          this.closeDropdown(otherDropdown, otherToggle, otherMenu);
        }
      });
      
      dropdown.classList.add('is-open');
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      
      // Position menu
      this.positionMenu(dropdown, menu);
      
      // Focus first item
      const firstItem = menu.querySelector('.vd-dropdown-item:not(.disabled):not(.is-disabled)');
      if (firstItem) {
        setTimeout(() => firstItem.focus(), 0);
      }
    },
    
    /**
     * Close dropdown
     * @param {HTMLElement} dropdown - Dropdown container
     * @param {HTMLElement} toggle - Toggle button
     * @param {HTMLElement} menu - Dropdown menu
     */
    closeDropdown: function(dropdown, toggle, menu) {
      dropdown.classList.remove('is-open');
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      
      // Return focus to toggle
      toggle.focus();
    },
    
    /**
     * Position dropdown menu
     * @param {HTMLElement} dropdown - Dropdown container
     * @param {HTMLElement} menu - Dropdown menu
     */
    positionMenu: function(dropdown, menu) {
      const rect = dropdown.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 8;
      
      // Check if menu overflows right
      if (rect.left + menuRect.width > viewportWidth - padding) {
        menu.classList.add('vd-dropdown-menu-end');
        menu.classList.remove('vd-dropdown-menu-start');
      }
      
      // Check if menu overflows bottom (for top positioning)
      if (menu.classList.contains('dropdown-menu-top')) {
        if (rect.top - menuRect.height < padding) {
          menu.classList.remove('vd-dropdown-menu-top');
        }
      } else {
        if (rect.bottom + menuRect.height > viewportHeight - padding) {
          menu.classList.add('vd-dropdown-menu-top');
        }
      }
    },
    
    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     * @param {HTMLElement} dropdown - Dropdown container
     * @param {HTMLElement} toggle - Toggle button
     * @param {HTMLElement} menu - Dropdown menu
     */
    handleKeydown: function(e, dropdown, toggle, menu) {
      const isOpen = menu.classList.contains('is-open');
      const items = Array.from(menu.querySelectorAll('.vd-dropdown-item:not(.disabled):not(.is-disabled)'));
      const currentIndex = items.findIndex(item => item === document.activeElement);
      
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            this.openDropdown(dropdown, toggle, menu);
          } else if (e.key === 'ArrowDown') {
            const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            items[nextIndex].focus();
          }
          break;
          
        case 'ArrowUp':
          if (isOpen) {
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            items[prevIndex].focus();
          }
          break;
          
        case 'Escape':
          if (isOpen) {
            e.preventDefault();
            this.closeDropdown(dropdown, toggle, menu);
          }
          break;
          
        case 'Home':
          if (isOpen) {
            e.preventDefault();
            items[0].focus();
          }
          break;
          
        case 'End':
          if (isOpen) {
            e.preventDefault();
            items[items.length - 1].focus();
          }
          break;

        default:
          // Typeahead: jump to matching item when typing printable characters
          if (isOpen && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            clearTimeout(this._typeaheadTimer);
            this._typeaheadBuffer += e.key.toLowerCase();

            const match = items.find(item =>
              item.textContent.trim().toLowerCase().startsWith(this._typeaheadBuffer)
            );
            if (match) {
              match.focus();
            }

            this._typeaheadTimer = setTimeout(() => {
              this._typeaheadBuffer = '';
            }, 500);
          }
          break;
      }
    },
    
    /**
     * Select dropdown item
     * @param {HTMLElement} item - Dropdown item
     * @param {HTMLElement} dropdown - Dropdown container
     * @param {HTMLElement} toggle - Toggle button
     * @param {HTMLElement} menu - Dropdown menu
     */
    selectItem: function(item, dropdown, toggle, menu) {
      // Remove active from all items
      menu.querySelectorAll('.vd-dropdown-item').forEach(i => {
        i.classList.remove('active', 'is-active');
      });
      
      // Add active to selected item
      item.classList.add('active', 'is-active');
      
      // Update toggle text if it's a button
      if (toggle.tagName === 'BUTTON' || toggle.classList.contains('btn')) {
        toggle.textContent = item.textContent.trim();
      }
      
      // Close dropdown
      this.closeDropdown(dropdown, toggle, menu);
      
      // Dispatch event
      item.dispatchEvent(new CustomEvent('dropdown:select', { 
        bubbles: true,
        detail: { item, value: item.dataset.value || item.textContent }
      }));
    },
    
    /**
     * Open dropdown programmatically
     * @param {HTMLElement|string} dropdown - Dropdown container or selector
     */
    open: function(dropdown) {
      const el = typeof dropdown === 'string' ? document.querySelector(dropdown) : dropdown;
      if (el) {
        const toggle = el.querySelector('.vd-dropdown-toggle');
        const menu = el.querySelector('.vd-dropdown-menu');
        if (toggle && menu) {
          this.openDropdown(el, toggle, menu);
        }
      }
    },
    
    /**
     * Close dropdown programmatically
     * @param {HTMLElement|string} dropdown - Dropdown container or selector
     */
    close: function(dropdown) {
      const el = typeof dropdown === 'string' ? document.querySelector(dropdown) : dropdown;
      if (el) {
        const toggle = el.querySelector('.vd-dropdown-toggle');
        const menu = el.querySelector('.vd-dropdown-menu');
        if (toggle && menu) {
          this.closeDropdown(el, toggle, menu);
        }
      }
    },

    /**
     * Destroy a dropdown instance and clean up event listeners
     * @param {HTMLElement} dropdown - Dropdown element
     */
    destroy: function(dropdown) {
      const instance = this.instances.get(dropdown);
      if (!instance) return;

      instance.cleanup.forEach(fn => fn());
      this.instances.delete(dropdown);
    },

    /**
     * Destroy all dropdown instances
     */
    destroyAll: function() {
      this.instances.forEach((instance, dropdown) => {
        this.destroy(dropdown);
      });
    }
  };
  
  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('dropdown', Dropdown);
  }
  
  // Expose globally
  window.VanduoDropdown = Dropdown;
  
})();

