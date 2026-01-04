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
    /**
     * Initialize dropdown components
     */
    init: function() {
      const dropdowns = document.querySelectorAll('.dropdown');
      
      dropdowns.forEach(dropdown => {
        if (!dropdown.dataset.dropdownInitialized) {
          this.initDropdown(dropdown);
        }
      });
    },
    
    /**
     * Initialize a single dropdown
     * @param {HTMLElement} dropdown - Dropdown container
     */
    initDropdown: function(dropdown) {
      dropdown.dataset.dropdownInitialized = 'true';
      
      const toggle = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      if (!toggle || !menu) {
        return;
      }
      
      // Set ARIA attributes
      toggle.setAttribute('aria-haspopup', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-hidden', 'true');
      
      // Toggle on click
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown(dropdown, toggle, menu);
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && menu.classList.contains('is-open')) {
          this.closeDropdown(dropdown, toggle, menu);
        }
      });
      
      // Keyboard navigation
      toggle.addEventListener('keydown', (e) => {
        this.handleKeydown(e, dropdown, toggle, menu);
      });
      
      // Handle item clicks
      const items = menu.querySelectorAll('.dropdown-item:not(.disabled):not(.is-disabled)');
      items.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          this.selectItem(item, dropdown, toggle, menu);
        });
        
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectItem(item, dropdown, toggle, menu);
          }
        });
      });
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
      const otherOpen = document.querySelectorAll('.dropdown-menu.is-open');
      otherOpen.forEach(otherMenu => {
        if (otherMenu !== menu) {
          const otherDropdown = otherMenu.closest('.dropdown');
          const otherToggle = otherDropdown.querySelector('.dropdown-toggle');
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
      const firstItem = menu.querySelector('.dropdown-item:not(.disabled):not(.is-disabled)');
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
        menu.classList.add('dropdown-menu-end');
        menu.classList.remove('dropdown-menu-start');
      }
      
      // Check if menu overflows bottom (for top positioning)
      if (menu.classList.contains('dropdown-menu-top')) {
        if (rect.top - menuRect.height < padding) {
          menu.classList.remove('dropdown-menu-top');
        }
      } else {
        if (rect.bottom + menuRect.height > viewportHeight - padding) {
          menu.classList.add('dropdown-menu-top');
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
      const items = Array.from(menu.querySelectorAll('.dropdown-item:not(.disabled):not(.is-disabled)'));
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
      menu.querySelectorAll('.dropdown-item').forEach(i => {
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
        const toggle = el.querySelector('.dropdown-toggle');
        const menu = el.querySelector('.dropdown-menu');
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
        const toggle = el.querySelector('.dropdown-toggle');
        const menu = el.querySelector('.dropdown-menu');
        if (toggle && menu) {
          this.closeDropdown(el, toggle, menu);
        }
      }
    }
  };
  
  // Initialize when DOM is ready
  if (typeof ready !== 'undefined') {
    ready(() => {
      Dropdown.init();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        Dropdown.init();
      });
    } else {
      Dropdown.init();
    }
  }
  
  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('dropdown', Dropdown);
  }
  
  // Expose globally
  window.VanduoDropdown = Dropdown;
  
  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dropdown;
  }
})();

