/**
 * Vanduo Framework - Select Component
 * Custom select dropdown with enhanced functionality
 */

(function () {
  'use strict';

  /**
   * Select Component
   */
  const Select = {
    // Store initialized selects and their cleanup functions
    instances: new Map(),
    // Typeahead state
    _typeaheadBuffer: '',
    _typeaheadTimer: null,

    /**
     * Initialize select components
     */
    init: function () {
      const selects = document.querySelectorAll('select.vd-custom-select-input, select[data-custom-select]');

      selects.forEach(select => {
        if (this.instances.has(select)) {
          return;
        }
        this.initSelect(select);
      });
    },

    /**
     * Initialize a single select
     * @param {HTMLSelectElement} select - Select element
     */
    initSelect: function (select) {
      // Skip if already has custom wrapper
      if (select.closest('.vd-custom-select-wrapper')) {
        return;
      }

      const cleanupFunctions = [];

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);

      // Create custom button
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'custom-select-button';
      button.setAttribute('aria-haspopup', 'listbox');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-labelledby', select.id || this.generateId(select));

      // Create dropdown
      const dropdown = document.createElement('div');
      dropdown.className = 'custom-select-dropdown';
      dropdown.setAttribute('role', 'listbox');

      // Create search input if searchable
      if (select.dataset.searchable === 'true') {
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'custom-select-search';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'input input-sm';
        searchInput.placeholder = 'Search...';
        searchInput.setAttribute('aria-label', 'Search options');
        searchWrapper.appendChild(searchInput);
        dropdown.appendChild(searchWrapper);

        const filterFn = (e) => {
          this.filterOptions(dropdown, e.target.value);
        };
        const searchHandler = typeof debounce === 'function' ? debounce(filterFn, 150) : filterFn;
        searchInput.addEventListener('input', searchHandler);
        cleanupFunctions.push(() => searchInput.removeEventListener('input', searchHandler));
      }

      // Build options
      this.buildOptions(select, dropdown, button);

      wrapper.appendChild(button);
      wrapper.appendChild(dropdown);

      // Update button text
      this.updateButtonText(select, button);

      // Event listeners
      const buttonClickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown(button, dropdown);
      };
      button.addEventListener('click', buttonClickHandler);
      cleanupFunctions.push(() => button.removeEventListener('click', buttonClickHandler));

      // Close on outside click
      const documentClickHandler = (e) => {
        if (!wrapper.contains(e.target) && dropdown.classList.contains('is-open')) {
          this.closeDropdown(button, dropdown);
        }
      };
      document.addEventListener('click', documentClickHandler);
      cleanupFunctions.push(() => document.removeEventListener('click', documentClickHandler));

      // Keyboard navigation
      const keydownHandler = (e) => {
        this.handleKeydown(e, select, button, dropdown);
      };
      button.addEventListener('keydown', keydownHandler);
      cleanupFunctions.push(() => button.removeEventListener('keydown', keydownHandler));

      // Update on select change
      const changeHandler = () => {
        this.updateButtonText(select, button);
        this.updateSelectedOptions(select, dropdown);
      };
      select.addEventListener('change', changeHandler);
      cleanupFunctions.push(() => select.removeEventListener('change', changeHandler));

      this.instances.set(select, { wrapper, button, dropdown, cleanup: cleanupFunctions });
    },

    /**
     * Build options in dropdown
     * @param {HTMLSelectElement} select - Select element
     * @param {HTMLElement} dropdown - Dropdown container
     * @param {HTMLElement} button - Button element
     */
    buildOptions: function (select, dropdown, button) {
      const options = select.querySelectorAll('option');
      const fragment = document.createDocumentFragment();

      options.forEach((option, index) => {
        if (option.parentElement.tagName === 'OPTGROUP') {
          // Handle option groups
          const group = option.parentElement;
          if (!dropdown.querySelector(`[data-group="${group.label}"]`)) {
            const groupElement = document.createElement('div');
            groupElement.className = 'custom-select-option-group';
            groupElement.textContent = group.label;
            groupElement.dataset.group = group.label;
            fragment.appendChild(groupElement);
          }
        }

        if (option.value === '' && !option.textContent.trim()) {
          return; // Skip empty options
        }

        const optionElement = document.createElement('div');
        optionElement.className = 'custom-select-option';
        optionElement.textContent = option.textContent;
        optionElement.setAttribute('role', 'option');
        optionElement.setAttribute('data-value', option.value);
        optionElement.setAttribute('data-index', index);

        if (option.selected) {
          optionElement.classList.add('is-selected');
          optionElement.setAttribute('aria-selected', 'true');
        }

        if (option.disabled) {
          optionElement.classList.add('is-disabled');
          optionElement.setAttribute('aria-disabled', 'true');
        }

        optionElement.addEventListener('click', (_e) => {
          if (!option.disabled) {
            this.selectOption(select, option, optionElement, button, dropdown);
          }
        });

        fragment.appendChild(optionElement);
      });

      dropdown.appendChild(fragment);
    },

    /**
     * Select an option
     * @param {HTMLSelectElement} select - Select element
     * @param {HTMLOptionElement} option - Option element
     * @param {HTMLElement} optionElement - Custom option element
     * @param {HTMLElement} button - Button element
     * @param {HTMLElement} dropdown - Dropdown container
     */
    selectOption: function (select, option, optionElement, button, dropdown) {
      if (select.multiple) {
        // Multi-select
        option.selected = !option.selected;
        optionElement.classList.toggle('is-selected');
        optionElement.setAttribute('aria-selected', option.selected);
      } else {
        // Single select
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        this.closeDropdown(button, dropdown);
      }

      this.updateButtonText(select, button);
    },

    /**
     * Update button text
     * @param {HTMLSelectElement} select - Select element
     * @param {HTMLElement} button - Button element
     */
    updateButtonText: function (select, button) {
      if (select.multiple) {
        const selected = Array.from(select.selectedOptions);
        if (selected.length === 0) {
          button.textContent = select.dataset.placeholder || 'Select options...';
        } else if (selected.length === 1) {
          button.textContent = selected[0].textContent;
        } else {
          button.textContent = `${selected.length} selected`;
        }
      } else {
        const selectedOption = select.options[select.selectedIndex];
        button.textContent = selectedOption ? selectedOption.textContent : (select.dataset.placeholder || 'Select...');
      }
    },

    /**
     * Update selected options in dropdown
     * @param {HTMLSelectElement} select - Select element
     * @param {HTMLElement} dropdown - Dropdown container
     */
    updateSelectedOptions: function (select, dropdown) {
      const options = dropdown.querySelectorAll('.vd-custom-select-option');
      const selectedValues = Array.from(select.selectedOptions).map(opt => opt.value);

      options.forEach(optionEl => {
        const value = optionEl.dataset.value;
        if (selectedValues.includes(value)) {
          optionEl.classList.add('is-selected');
          optionEl.setAttribute('aria-selected', 'true');
        } else {
          optionEl.classList.remove('is-selected');
          optionEl.setAttribute('aria-selected', 'false');
        }
      });
    },

    /**
     * Toggle dropdown
     * @param {HTMLElement} button - Button element
     * @param {HTMLElement} dropdown - Dropdown container
     */
    toggleDropdown: function (button, dropdown) {
      const isOpen = dropdown.classList.contains('is-open');

      if (isOpen) {
        this.closeDropdown(button, dropdown);
      } else {
        this.openDropdown(button, dropdown);
      }
    },

    /**
     * Open dropdown
     * @param {HTMLElement} button - Button element
     * @param {HTMLElement} dropdown - Dropdown container
     */
    openDropdown: function (button, dropdown) {
      dropdown.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');

      // Focus first option
      const firstOption = dropdown.querySelector('.vd-custom-select-option:not(.is-disabled)');
      if (firstOption) {
        firstOption.focus();
      }
    },

    /**
     * Close dropdown
     * @param {HTMLElement} button - Button element
     * @param {HTMLElement} dropdown - Dropdown container
     */
    closeDropdown: function (button, dropdown) {
      dropdown.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    },

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     * @param {HTMLSelectElement} select - Select element
     * @param {HTMLElement} button - Button element
     * @param {HTMLElement} dropdown - Dropdown container
     */
    handleKeydown: function (e, select, button, dropdown) {
      const isOpen = dropdown.classList.contains('is-open');
      const options = Array.from(dropdown.querySelectorAll('.vd-custom-select-option:not(.is-disabled)'));
      const currentIndex = options.findIndex(opt => opt === document.activeElement);

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && currentIndex >= 0) {
            const optionEl = options[currentIndex];
            const option = select.options[parseInt(optionEl.dataset.index)];
            this.selectOption(select, option, optionEl, button, dropdown);
          } else {
            this.openDropdown(button, dropdown);
          }
          break;

        case 'Escape':
          if (isOpen) {
            e.preventDefault();
            this.closeDropdown(button, dropdown);
            button.focus();
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            this.openDropdown(button, dropdown);
          } else {
            const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
            options[nextIndex].focus();
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
            options[prevIndex].focus();
          }
          break;

        case 'Home':
          if (isOpen) {
            e.preventDefault();
            options[0].focus();
          }
          break;

        case 'End':
          if (isOpen) {
            e.preventDefault();
            options[options.length - 1].focus();
          }
          break;

        default:
          // Typeahead: jump to matching option when typing printable characters
          if (isOpen && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            clearTimeout(this._typeaheadTimer);
            this._typeaheadBuffer += e.key.toLowerCase();

            const match = options.find(opt =>
              opt.textContent.trim().toLowerCase().startsWith(this._typeaheadBuffer)
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
     * Filter options by search term
     * @param {HTMLElement} dropdown - Dropdown container
     * @param {string} searchTerm - Search term
     */
    filterOptions: function (dropdown, searchTerm) {
      const options = dropdown.querySelectorAll('.vd-custom-select-option');
      const term = searchTerm.toLowerCase();

      options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(term)) {
          option.style.display = 'block';
        } else {
          option.style.display = 'none';
        }
      });
    },

    /**
     * Generate unique ID
     * @param {HTMLElement} element - Element
     * @returns {string} Generated ID
     */
    generateId: function (element) {
      if (element.id) {
        return element.id;
      }
      return 'select-' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Destroy a select instance and clean up event listeners
     * @param {HTMLSelectElement} select - Select element
     */
    destroy: function (select) {
      const instance = this.instances.get(select);
      if (!instance) return;

      instance.cleanup.forEach(fn => fn());

      // Unwrap the select element back to its original parent
      if (instance.wrapper && instance.wrapper.parentNode) {
        instance.wrapper.parentNode.insertBefore(select, instance.wrapper);
        instance.wrapper.parentNode.removeChild(instance.wrapper);
      }

      this.instances.delete(select);
    },

    /**
     * Destroy all select instances
     */
    destroyAll: function () {
      this.instances.forEach((instance, select) => {
        this.destroy(select);
      });
    }
  };

  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('select', Select);
  }

})();

