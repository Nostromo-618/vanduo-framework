/**
 * Vanduo Framework - Tabs Component
 * Tabbed content navigation with keyboard support
 */

(function() {
  'use strict';

  /**
   * Tabs Component
   */
  const Tabs = {
    // Store initialized tab containers and their cleanup functions
    instances: new Map(),

    /**
     * Initialize all tab components
     */
    init: function() {
      const tabContainers = document.querySelectorAll('.vd-tabs, [data-tabs]');

      tabContainers.forEach(container => {
        if (this.instances.has(container)) {
          return;
        }
        this.initTabs(container);
      });
    },

    /**
     * Initialize a single tab container
     * @param {HTMLElement} container - Tabs container element
     */
    initTabs: function(container) {
      const tabList = container.querySelector('.vd-tab-list, [role="tablist"]');
      const tabLinks = container.querySelectorAll('.vd-tab-link, [data-tab]');
      const tabPanes = container.querySelectorAll('.vd-tab-pane, [data-tab-pane]');

      if (!tabList || tabLinks.length === 0) return;

      const cleanupFunctions = [];

      // Set up ARIA attributes
      tabList.setAttribute('role', 'tablist');

      tabLinks.forEach((link, index) => {
        const tabId = link.dataset.tab || link.getAttribute('href')?.replace('#', '') || `tab-${index}`;
        const pane = this.findPane(container, tabId, tabPanes);

        // Set up tab attributes
        link.setAttribute('role', 'tab');
        link.setAttribute('aria-selected', link.classList.contains('is-active') ? 'true' : 'false');
        link.setAttribute('tabindex', link.classList.contains('is-active') ? '0' : '-1');

        if (!link.id) {
          link.id = `tab-btn-${tabId}`;
        }

        // Set up pane attributes
        if (pane) {
          pane.setAttribute('role', 'tabpanel');
          pane.setAttribute('aria-labelledby', link.id);
          if (!pane.id) {
            pane.id = `tab-pane-${tabId}`;
          }
          link.setAttribute('aria-controls', pane.id);
        }

        // Click handler
        const clickHandler = (e) => {
          e.preventDefault();
          if (!link.classList.contains('disabled') && !link.disabled) {
            this.activateTab(container, link, tabLinks, tabPanes);
          }
        };
        link.addEventListener('click', clickHandler);
        cleanupFunctions.push(() => link.removeEventListener('click', clickHandler));

        // Keyboard navigation
        const keydownHandler = (e) => {
          this.handleKeydown(e, container, link, tabLinks, tabPanes);
        };
        link.addEventListener('keydown', keydownHandler);
        cleanupFunctions.push(() => link.removeEventListener('keydown', keydownHandler));
      });

      // Ensure one tab is active
      const activeTab = container.querySelector('.vd-tab-link.is-active, [data-tab].is-active');
      if (!activeTab && tabLinks.length > 0) {
        this.activateTab(container, tabLinks[0], tabLinks, tabPanes);
      }

      this.instances.set(container, { cleanup: cleanupFunctions });
    },

    /**
     * Find the pane associated with a tab
     * @param {HTMLElement} container - Tabs container
     * @param {string} tabId - Tab identifier
     * @param {NodeList} tabPanes - All tab panes
     * @returns {HTMLElement|null} The matching pane
     */
    findPane: function(container, tabId, tabPanes) {
      // Try data attribute first
      let pane = container.querySelector(`[data-tab-pane="${tabId}"]`);

      // Try ID
      if (!pane) {
        pane = container.querySelector(`#${tabId}`);
      }

      // Try matching by index
      if (!pane) {
        const tabLinks = container.querySelectorAll('.vd-tab-link, [data-tab]');
        tabLinks.forEach((link, index) => {
          const linkTabId = link.dataset.tab || link.getAttribute('href')?.replace('#', '');
          if (linkTabId === tabId && tabPanes[index]) {
            pane = tabPanes[index];
          }
        });
      }

      return pane;
    },

    /**
     * Activate a tab
     * @param {HTMLElement} container - Tabs container
     * @param {HTMLElement} tab - Tab to activate
     * @param {NodeList} allTabs - All tab links
     * @param {NodeList} allPanes - All tab panes
     */
    activateTab: function(container, tab, allTabs, allPanes) {
      const tabId = tab.dataset.tab || tab.getAttribute('href')?.replace('#', '') || tab.id;

      // Deactivate all tabs
      allTabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');

        // Also handle parent li if exists
        if (t.parentElement && t.parentElement.classList.contains('tab-item')) {
          t.parentElement.classList.remove('is-active');
        }
      });

      // Hide all panes
      allPanes.forEach(p => {
        p.classList.remove('is-active');
      });

      // Activate selected tab
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');

      // Also handle parent li if exists
      if (tab.parentElement && tab.parentElement.classList.contains('tab-item')) {
        tab.parentElement.classList.add('is-active');
      }

      // Show corresponding pane
      const pane = this.findPane(container, tabId, allPanes);
      if (pane) {
        pane.classList.add('is-active');
      }

      // Dispatch custom event
      const event = new CustomEvent('tab:change', {
        bubbles: true,
        detail: {
          tab: tab,
          pane: pane,
          tabId: tabId
        }
      });
      container.dispatchEvent(event);
    },

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     * @param {HTMLElement} container - Tabs container
     * @param {HTMLElement} currentTab - Currently focused tab
     * @param {NodeList} allTabs - All tab links
     * @param {NodeList} allPanes - All tab panes
     */
    handleKeydown: function(e, container, currentTab, allTabs, allPanes) {
      const isVertical = container.classList.contains('tabs-vertical');
      const tabs = Array.from(allTabs).filter(t => !t.classList.contains('disabled') && !t.disabled);
      const currentIndex = tabs.indexOf(currentTab);

      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowLeft':
          if (!isVertical) {
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          }
          break;

        case 'ArrowRight':
          if (!isVertical) {
            e.preventDefault();
            newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          }
          break;

        case 'ArrowUp':
          if (isVertical) {
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          }
          break;

        case 'ArrowDown':
          if (isVertical) {
            e.preventDefault();
            newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          }
          break;

        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          newIndex = tabs.length - 1;
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          this.activateTab(container, currentTab, allTabs, allPanes);
          return;

        default:
          return;
      }

      // Focus and activate new tab
      if (newIndex !== currentIndex) {
        tabs[newIndex].focus();
        this.activateTab(container, tabs[newIndex], allTabs, allPanes);
      }
    },

    /**
     * Programmatically show a tab
     * @param {string|HTMLElement} tab - Tab identifier or element
     */
    show: function(tab) {
      let tabElement;

      if (typeof tab === 'string') {
        tabElement = document.querySelector(`[data-tab="${tab}"], [href="#${tab}"]`);
      } else {
        tabElement = tab;
      }

      if (!tabElement) return;

      const container = tabElement.closest('.vd-tabs, [data-tabs]');
      if (!container) return;

      const allTabs = container.querySelectorAll('.vd-tab-link, [data-tab]');
      const allPanes = container.querySelectorAll('.vd-tab-pane, [data-tab-pane]');

      this.activateTab(container, tabElement, allTabs, allPanes);
    },

    /**
     * Destroy a tabs instance and clean up event listeners
     * @param {HTMLElement} container - Tabs container
     */
    destroy: function(container) {
      const instance = this.instances.get(container);
      if (!instance) return;

      instance.cleanup.forEach(fn => fn());
      this.instances.delete(container);
    },

    /**
     * Destroy all tabs instances
     */
    destroyAll: function() {
      this.instances.forEach((instance, container) => {
        this.destroy(container);
      });
    }
  };

  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('tabs', Tabs);
  }

})();
