/**
 * Vanduo Framework - Tooltips Component
 * JavaScript functionality for tooltips
 */

(function() {
  'use strict';

  /**
   * Tooltips Component
   */
  const Tooltips = {
    tooltips: new Map(),
    delayTimers: new Map(),
    
    /**
     * Basic HTML sanitizer (whitelist-based) — runs in the browser without external libs.
     * Keeps a small set of tags and strips disallowed tags and attributes. Safe for
     * simple rich text in tooltips (use server-side or DOMPurify for stronger guarantees).
     * @param {string} input
     * @returns {string} sanitized HTML
     */
    sanitizeHtml: function(input) {
      if (!input) return '';
      const doc = new DOMParser().parseFromString(input, 'text/html');
      const allowed = ['B','STRONG','I','EM','BR','A','SPAN','U'];

      const sanitizeNode = (node) => {
        const children = Array.from(node.childNodes);
        children.forEach(child => {
          if (child.nodeType === Node.TEXT_NODE) return; // text is safe

          if (!allowed.includes(child.nodeName)) {
            // Replace disallowed element with its text content
            const text = document.createTextNode(child.textContent);
            node.replaceChild(text, child);
            return;
          }

          // Allowed element: sanitize attributes
          if (child.nodeName === 'A') {
            const href = child.getAttribute('href') || '';
            try {
              const url = new URL(href, location.href);
              if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) {
                child.removeAttribute('href');
              }
            } catch (e) {
              child.removeAttribute('href');
            }
            // Remove potentially dangerous attributes
            child.removeAttribute('target');
            child.removeAttribute('rel');
          } else {
            // Remove all attributes on other tags for safety
            const attrs = Array.from(child.attributes || []);
            attrs.forEach(a => child.removeAttribute(a.name));
          }

          // Recurse
          sanitizeNode(child);
        });
      };

      sanitizeNode(doc.body);
      return doc.body.innerHTML;
    },
    
    /**
     * Initialize tooltips
     */
    init: function() {
      const elements = document.querySelectorAll('[data-tooltip], [data-tooltip-html]');
      
      elements.forEach(element => {
        if (!element.dataset.tooltipInitialized) {
          this.initTooltip(element);
        }
      });
    },
    
    /**
     * Initialize a single tooltip
     * @param {HTMLElement} element - Element with tooltip
     */
    initTooltip: function(element) {
      element.dataset.tooltipInitialized = 'true';
      
      const tooltip = this.createTooltip(element);
      this.tooltips.set(element, tooltip);
      
      // Show on hover/focus
      element.addEventListener('mouseenter', () => {
        this.showTooltip(element, tooltip);
      });
      
      element.addEventListener('mouseleave', () => {
        this.hideTooltip(element, tooltip);
      });
      
      element.addEventListener('focus', () => {
        this.showTooltip(element, tooltip);
      });
      
      element.addEventListener('blur', () => {
        this.hideTooltip(element, tooltip);
      });
    },
    
    /**
     * Create tooltip element
     * @param {HTMLElement} element - Target element
     * @returns {HTMLElement} Tooltip element
     */
    createTooltip: function(element) {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.setAttribute('role', 'tooltip');
      tooltip.setAttribute('aria-hidden', 'true');
      
      // Get content
      const htmlContent = element.dataset.tooltipHtml;
      const textContent = element.dataset.tooltip;
      
      if (htmlContent) {
        tooltip.innerHTML = this.sanitizeHtml(htmlContent);
        tooltip.classList.add('tooltip-html');
      } else if (textContent) {
        tooltip.textContent = textContent;
      }
      
      // Get placement
      const placement = element.dataset.tooltipPlacement || 'top';
      tooltip.setAttribute('data-placement', placement);
      tooltip.classList.add(`tooltip-${placement}`);
      
      // Get variant
      if (element.dataset.tooltipVariant) {
        tooltip.classList.add(`tooltip-${element.dataset.tooltipVariant}`);
      }
      
      // Get size
      if (element.dataset.tooltipSize) {
        tooltip.classList.add(`tooltip-${element.dataset.tooltipSize}`);
      }
      
      // Get delay
      const delay = parseInt(element.dataset.tooltipDelay) || 0;
      tooltip.dataset.delay = delay;
      
      document.body.appendChild(tooltip);
      
      return tooltip;
    },
    
    /**
     * Show tooltip
     * @param {HTMLElement} element - Target element
     * @param {HTMLElement} tooltip - Tooltip element
     */
    showTooltip: function(element, tooltip) {
      const delay = parseInt(tooltip.dataset.delay) || 0;
      
      if (delay > 0) {
        const timer = setTimeout(() => {
          this.positionTooltip(element, tooltip);
          tooltip.classList.add('is-visible');
          tooltip.setAttribute('aria-hidden', 'false');
        }, delay);
        this.delayTimers.set(element, timer);
      } else {
        this.positionTooltip(element, tooltip);
        tooltip.classList.add('is-visible');
        tooltip.setAttribute('aria-hidden', 'false');
      }
    },
    
    /**
     * Hide tooltip
     * @param {HTMLElement} element - Target element
     * @param {HTMLElement} tooltip - Tooltip element
     */
    hideTooltip: function(element, tooltip) {
      // Clear delay timer if exists
      const timer = this.delayTimers.get(element);
      if (timer) {
        clearTimeout(timer);
        this.delayTimers.delete(element);
      }
      
      tooltip.classList.remove('is-visible');
      tooltip.setAttribute('aria-hidden', 'true');
    },
    
    /**
     * Position tooltip relative to element
     * @param {HTMLElement} element - Target element
     * @param {HTMLElement} tooltip - Tooltip element
     */
    positionTooltip: function(element, tooltip) {
      const placement = tooltip.dataset.placement || 'top';
      const rect = element.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let top = 0;
      let left = 0;
      
      switch (placement) {
        case 'top':
          top = rect.top + scrollTop - tooltipRect.height - 8;
          left = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = rect.bottom + scrollTop + 8;
          left = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = rect.top + scrollTop + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.left + scrollLeft - tooltipRect.width - 8;
          break;
        case 'right':
          top = rect.top + scrollTop + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.right + scrollLeft + 8;
          break;
      }
      
      // Prevent overflow
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 8;
      
      if (left < padding) {
        left = padding;
      } else if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding;
      }
      
      if (top < scrollTop + padding) {
        top = scrollTop + padding;
      } else if (top + tooltipRect.height > scrollTop + viewportHeight - padding) {
        top = scrollTop + viewportHeight - tooltipRect.height - padding;
      }
      
      // Use single style assignment with transform for better performance
      tooltip.style.cssText = `position: absolute; top: 0; left: 0; transform: translate(${left}px, ${top}px);`;
    },
    
    /**
     * Show tooltip programmatically
     * @param {HTMLElement|string} element - Target element or selector
     */
    show: function(element) {
      const el = typeof element === 'string' ? document.querySelector(element) : element;
      if (el && this.tooltips.has(el)) {
        const tooltip = this.tooltips.get(el);
        this.showTooltip(el, tooltip);
      }
    },
    
    /**
     * Hide tooltip programmatically
     * @param {HTMLElement|string} element - Target element or selector
     */
    hide: function(element) {
      const el = typeof element === 'string' ? document.querySelector(element) : element;
      if (el && this.tooltips.has(el)) {
        const tooltip = this.tooltips.get(el);
        this.hideTooltip(el, tooltip);
      }
    },
    
    /**
     * Update tooltip content
     * @param {HTMLElement|string} element - Target element or selector
     * @param {string} content - New content
     * @param {boolean} isHtml - Whether content is HTML
     */
    update: function(element, content, isHtml = false) {
      const el = typeof element === 'string' ? document.querySelector(element) : element;
      if (el && this.tooltips.has(el)) {
        const tooltip = this.tooltips.get(el);
        if (isHtml) {
          tooltip.innerHTML = this.sanitizeHtml(content);
          tooltip.classList.add('tooltip-html');
        } else {
          tooltip.textContent = content;
          tooltip.classList.remove('tooltip-html');
        }
      }
    }
  };
  
  // Initialize when DOM is ready
  if (typeof ready !== 'undefined') {
    ready(() => {
      Tooltips.init();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        Tooltips.init();
      });
    } else {
      Tooltips.init();
    }
  }
  
  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('tooltips', Tooltips);
  }
  
  // Expose globally
  window.VanduoTooltips = Tooltips;
  
  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tooltips;
  }
})();

