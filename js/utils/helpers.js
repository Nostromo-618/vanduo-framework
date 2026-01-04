/**
 * Vanduo Framework - Utility Helpers
 * Common utility functions used across the framework
 */

/**
 * Check if element exists
 * @param {string|HTMLElement} selector - CSS selector or element
 * @returns {HTMLElement|null}
 */
function $(selector) {
  if (typeof selector === 'string') {
    return document.querySelector(selector);
  }
  return selector;
}

/**
 * Get all elements matching selector
 * @param {string} selector - CSS selector
 * @returns {NodeList}
 */
function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Wait for DOM to be ready
 * @param {Function} callback - Function to execute when DOM is ready
 */
function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Add event listener with delegation support
 * @param {string|HTMLElement} target - Target element or selector
 * @param {string} event - Event type
 * @param {string|Function} handlerOrSelector - Event handler or selector for delegation
 * @param {Function} handler - Event handler (if using delegation)
 */
function on(target, event, handlerOrSelector, handler) {
  const element = typeof target === 'string' ? $(target) : target;
  
  if (!element) return;
  
  if (typeof handlerOrSelector === 'function') {
    // Direct event binding
    element.addEventListener(event, handlerOrSelector);
  } else {
    // Event delegation
    element.addEventListener(event, function(e) {
      const delegateTarget = e.target.closest(handlerOrSelector);
      if (delegateTarget && element.contains(delegateTarget)) {
        handler.call(delegateTarget, e);
      }
    });
  }
}

/**
 * Remove event listener
 * @param {string|HTMLElement} target - Target element or selector
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 */
function off(target, event, handler) {
  const element = typeof target === 'string' ? $(target) : target;
  if (element) {
    element.removeEventListener(event, handler);
  }
}

/**
 * Toggle class on element
 * @param {string|HTMLElement} selector - CSS selector or element
 * @param {string} className - Class name to toggle
 */
function toggleClass(selector, className) {
  const element = typeof selector === 'string' ? $(selector) : selector;
  if (element) {
    element.classList.toggle(className);
  }
}

/**
 * Add class to element
 * @param {string|HTMLElement} selector - CSS selector or element
 * @param {string} className - Class name to add
 */
function addClass(selector, className) {
  const element = typeof selector === 'string' ? $(selector) : selector;
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remove class from element
 * @param {string|HTMLElement} selector - CSS selector or element
 * @param {string} className - Class name to remove
 */
function removeClass(selector, className) {
  const element = typeof selector === 'string' ? $(selector) : selector;
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Check if element has class
 * @param {string|HTMLElement} selector - CSS selector or element
 * @param {string} className - Class name to check
 * @returns {boolean}
 */
function hasClass(selector, className) {
  const element = typeof selector === 'string' ? $(selector) : selector;
  return element ? element.classList.contains(className) : false;
}

/**
 * Get or set data attribute
 * @param {HTMLElement} element - Element
 * @param {string} name - Data attribute name (without data- prefix)
 * @param {string} value - Value to set (optional)
 * @returns {string|undefined}
 */
function data(element, name, value) {
  if (value !== undefined) {
    element.setAttribute(`data-${name}`, value);
    return value;
  }
  return element.getAttribute(`data-${name}`);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function}
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if element is visible
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
function isVisible(element) {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

/**
 * Get element position relative to viewport
 * @param {HTMLElement} element - Element
 * @returns {Object} - Object with top, left, right, bottom, width, height
 */
function getPosition(element) {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height
  };
}

// Export utilities (for module systems if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    $,
    $$,
    ready,
    on,
    off,
    toggleClass,
    addClass,
    removeClass,
    hasClass,
    data,
    debounce,
    throttle,
    isVisible,
    getPosition
  };
}

