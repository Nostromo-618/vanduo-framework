/**
 * Vanduo Framework - Toast Component
 * Popup notifications for user feedback
 */

(function() {
  'use strict';

  /**
   * Toast Component
   */
  const Toast = {
    // Default options
    defaults: {
      position: 'top-right',
      duration: 5000,
      dismissible: true,
      showProgress: true,
      pauseOnHover: true
    },

    // Container cache
    containers: {},

    /**
     * Get or create a toast container for a position
     * @param {string} position - Container position
     * @returns {HTMLElement} Toast container element
     */
    getContainer: function(position) {
      if (this.containers[position]) {
        return this.containers[position];
      }

      const container = document.createElement('div');
      container.className = `vd-toast-container vd-toast-container-${position}`;
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'false');
      document.body.appendChild(container);
      this.containers[position] = container;

      return container;
    },

    /**
     * Show a toast notification
     * @param {Object|string} options - Toast options or message string
     * @param {string} [type] - Toast type (success, error, warning, info)
     * @param {number} [duration] - Auto-dismiss duration in ms
     * @returns {HTMLElement} Toast element
     */
    show: function(options, type, duration) {
      // Support simple API: Toast.show('Message', 'success', 3000)
      if (typeof options === 'string') {
        options = {
          message: options,
          type: type,
          duration: duration
        };
      }

      const config = Object.assign({}, this.defaults, options);
      const container = this.getContainer(config.position);

      // Create toast element
      const toast = document.createElement('div');
      toast.className = 'vd-toast';

      if (config.type) {
        toast.classList.add(`vd-toast-${config.type}`);
      }

      if (config.solid) {
        toast.classList.add('vd-toast-solid');
      }

      if (config.showProgress && config.duration > 0) {
        toast.classList.add('vd-toast-with-progress');
      }

      // Build toast content
      let html = '';

      // Icon (sanitize custom icons, default icons are trusted SVG)
      if (config.icon) {
        const safeIcon = typeof sanitizeHtml === 'function' ? sanitizeHtml(config.icon) : escapeHtml(config.icon);
        html += `<span class="vd-toast-icon">${safeIcon}</span>`;
      } else if (config.type) {
        html += `<span class="vd-toast-icon">${this.getDefaultIcon(config.type)}</span>`;
      }

      // Content (escape text to prevent injection)
      html += '<div class="vd-toast-content">';
      if (config.title) {
        const safeTitle = typeof escapeHtml === 'function' ? escapeHtml(config.title) : config.title;
        html += `<div class="vd-toast-title">${safeTitle}</div>`;
      }
      if (config.message) {
        const safeMessage = typeof escapeHtml === 'function' ? escapeHtml(config.message) : config.message;
        html += `<div class="vd-toast-message">${safeMessage}</div>`;
      }
      html += '</div>';

      // Close button
      if (config.dismissible) {
        html += '<button type="button" class="vd-toast-close" aria-label="Close"></button>';
      }

      // Progress bar
      if (config.showProgress && config.duration > 0) {
        html += `<div class="vd-toast-progress" style="animation-duration: ${config.duration}ms"></div>`;
      }

      toast.innerHTML = html;

      // Add to container
      container.appendChild(toast);

      toast._toastCleanup = [];

      // Set up close button handler
      if (config.dismissible) {
        const closeBtn = toast.querySelector('.vd-toast-close');
        const onClose = () => {
          this.dismiss(toast);
        };
        closeBtn.addEventListener('click', onClose);
        toast._toastCleanup.push(() => closeBtn.removeEventListener('click', onClose));
      }

      // Pause on hover
      let timeoutId = null;
      let remainingTime = config.duration;
      let startTime = null;

      const startTimer = () => {
        if (config.duration > 0) {
          startTime = Date.now();
          timeoutId = setTimeout(() => {
            this.dismiss(toast);
          }, remainingTime);
          toast._toastTimeoutId = timeoutId;

          // Resume progress animation
          const progress = toast.querySelector('.vd-toast-progress');
          if (progress) {
            progress.style.animationPlayState = 'running';
          }
        }
      };

      const pauseTimer = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
          toast._toastTimeoutId = null;
          remainingTime -= Date.now() - startTime;

          // Pause progress animation
          const progress = toast.querySelector('.vd-toast-progress');
          if (progress) {
            progress.style.animationPlayState = 'paused';
          }
        }
      };

      if (config.pauseOnHover) {
        toast.addEventListener('mouseenter', pauseTimer);
        toast.addEventListener('mouseleave', startTimer);
        toast._toastCleanup.push(
          () => toast.removeEventListener('mouseenter', pauseTimer),
          () => toast.removeEventListener('mouseleave', startTimer)
        );
      }

      // Trigger enter animation
      requestAnimationFrame(() => {
        toast.classList.add('is-visible');
        startTimer();
      });

      // Store config on element for later access
      toast._toastConfig = config;

      // Dispatch show event
      const showEvent = new CustomEvent('toast:show', {
        bubbles: true,
        detail: { toast, config }
      });
      toast.dispatchEvent(showEvent);

      return toast;
    },

    /**
     * Dismiss a toast
     * @param {HTMLElement} toast - Toast element to dismiss
     */
    dismiss: function(toast) {
      if (!toast || toast.classList.contains('is-exiting')) return;

      if (toast._toastTimeoutId) {
        clearTimeout(toast._toastTimeoutId);
        toast._toastTimeoutId = null;
      }

      toast.classList.remove('is-visible');
      toast.classList.add('is-exiting');

      // Dispatch dismiss event
      const dismissEvent = new CustomEvent('toast:dismiss', {
        bubbles: true,
        detail: { toast }
      });
      toast.dispatchEvent(dismissEvent);

      // Remove after animation
      const handleTransitionEnd = () => {
        toast.removeEventListener('transitionend', handleTransitionEnd);
        if (toast._toastCleanup) {
          toast._toastCleanup.forEach(fn => fn());
          delete toast._toastCleanup;
        }
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      };

      toast.addEventListener('transitionend', handleTransitionEnd);

      // Fallback removal if transition doesn't fire
      setTimeout(() => {
        if (toast._toastCleanup) {
          toast._toastCleanup.forEach(fn => fn());
          delete toast._toastCleanup;
        }
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 400);
    },

    /**
     * Destroy all toasts and containers
     */
    destroyAll: function() {
      Object.keys(this.containers).forEach(position => {
        const container = this.containers[position];
        if (!container) return;

        const toasts = container.querySelectorAll('.vd-toast');
        toasts.forEach(toast => {
          if (toast._toastTimeoutId) {
            clearTimeout(toast._toastTimeoutId);
          }
          if (toast._toastCleanup) {
            toast._toastCleanup.forEach(fn => fn());
            delete toast._toastCleanup;
          }
          if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
          }
        });

        if (container.parentElement) {
          container.parentElement.removeChild(container);
        }
      });

      this.containers = {};
    },

    /**
     * Dismiss all toasts
     * @param {string} [position] - Optional position to clear (clears all if not specified)
     */
    dismissAll: function(position) {
      if (position && this.containers[position]) {
        const toasts = this.containers[position].querySelectorAll('.vd-toast');
        toasts.forEach(toast => this.dismiss(toast));
      } else {
        Object.values(this.containers).forEach(container => {
          const toasts = container.querySelectorAll('.vd-toast');
          toasts.forEach(toast => this.dismiss(toast));
        });
      }
    },

    /**
     * Get default icon SVG for a type
     * @param {string} type - Toast type
     * @returns {string} SVG icon markup
     */
    getDefaultIcon: function(type) {
      const icons = {
        success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
      };

      return icons[type] || '';
    },

    /**
     * Convenience methods for common toast types
     */
    success: function(message, options) {
      return this.show(Object.assign({ message, type: 'success' }, options));
    },

    error: function(message, options) {
      return this.show(Object.assign({ message, type: 'error' }, options));
    },

    warning: function(message, options) {
      return this.show(Object.assign({ message, type: 'warning' }, options));
    },

    info: function(message, options) {
      return this.show(Object.assign({ message, type: 'info' }, options));
    }
  };

  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('toast', Toast);
  }

  // Also expose globally for convenience
  window.Toast = Toast;

})();
