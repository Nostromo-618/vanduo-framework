/**
 * Vanduo Framework - Image Box Component
 * Lightbox-style image enlargement with smooth transitions
 * 
 * Features:
 * - Click to enlarge images with data-image-box attribute
 * - Smooth scale and opacity transitions
 * - Dismiss via click, ESC key, or scroll
 * - Magnifying glass cursor on hover
 * - Accessible with ARIA attributes
 * - Reduced motion support
 */

(function () {
  'use strict';

  /**
   * Image Box Component
   */
  const ImageBox = {
    backdrop: null,
    container: null,
    img: null,
    closeBtn: null,
    caption: null,
    currentTrigger: null,
    scrollThreshold: 50,
    initialScrollY: 0,
    isOpen: false,

    // Store cleanup functions for event listeners
    _cleanupFunctions: [],

    /**
     * Initialize Image Box component
     */
    init: function () {
      this.createBackdrop();
      this.bindTriggers();
    },

    /**
     * Create backdrop elements
     */
    createBackdrop: function () {
      // Prevent duplicate backdrop creation
      if (this.backdrop || document.querySelector('.vd-image-box-backdrop')) {
        // If backdrop already exists in DOM, reuse it
        if (!this.backdrop) {
          this.backdrop = document.querySelector('.vd-image-box-backdrop');
          this.container = this.backdrop.querySelector('.vd-image-box-container');
          this.img = this.backdrop.querySelector('.vd-image-box-img');
          this.closeBtn = this.backdrop.querySelector('.vd-image-box-close');
          this.caption = this.backdrop.querySelector('.vd-image-box-caption');
          this.bindBackdropEvents();
        }
        return;
      }

      // Create backdrop
      this.backdrop = document.createElement('div');
      this.backdrop.className = 'vd-image-box-backdrop';
      this.backdrop.setAttribute('role', 'dialog');
      this.backdrop.setAttribute('aria-modal', 'true');
      this.backdrop.setAttribute('aria-label', 'Image viewer');
      this.backdrop.setAttribute('tabindex', '-1');

      // Create container
      this.container = document.createElement('div');
      this.container.className = 'vd-image-box-container';

      // Create image
      this.img = document.createElement('img');
      this.img.className = 'vd-image-box-img';
      this.img.alt = '';

      // Create close button
      this.closeBtn = document.createElement('button');
      this.closeBtn.className = 'vd-image-box-close';
      this.closeBtn.setAttribute('aria-label', 'Close image viewer');
      this.closeBtn.innerHTML = '&times;';

      // Create caption element
      this.caption = document.createElement('div');
      this.caption.className = 'vd-image-box-caption';

      // Assemble
      this.container.appendChild(this.img);
      this.backdrop.appendChild(this.closeBtn);
      this.backdrop.appendChild(this.container);
      this.backdrop.appendChild(this.caption);
      document.body.appendChild(this.backdrop);

      // Bind backdrop events
      this.bindBackdropEvents();
    },

    /**
     * Bind events to backdrop elements
     */
    bindBackdropEvents: function () {
      const self = this;

      // Close on backdrop click (but not when clicking the image)
      const backdropClickHandler = function (e) {
        if (e.target === self.backdrop || e.target === self.container) {
          self.close();
        }
      };
      this.backdrop.addEventListener('click', backdropClickHandler);
      this._cleanupFunctions.push(() => this.backdrop.removeEventListener('click', backdropClickHandler));

      // Close on image click
      const imgClickHandler = function () {
        self.close();
      };
      this.img.addEventListener('click', imgClickHandler);
      this._cleanupFunctions.push(() => this.img.removeEventListener('click', imgClickHandler));

      // Close on close button click
      const closeBtnHandler = function () {
        self.close();
      };
      this.closeBtn.addEventListener('click', closeBtnHandler);
      this._cleanupFunctions.push(() => this.closeBtn.removeEventListener('click', closeBtnHandler));

      // ESC key handler
      const escHandler = function (e) {
        if (e.key === 'Escape' && self.isOpen) {
          self.close();
        }
      };
      document.addEventListener('keydown', escHandler);
      this._cleanupFunctions.push(() => document.removeEventListener('keydown', escHandler));

      // Scroll handler for dismissal
      const scrollHandler = function () {
        if (!self.isOpen) return;

        const currentScrollY = window.scrollY;
        const scrollDelta = Math.abs(currentScrollY - self.initialScrollY);

        if (scrollDelta > self.scrollThreshold) {
          self.close();
        }
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });
      this._cleanupFunctions.push(() => window.removeEventListener('scroll', scrollHandler));
    },

    /**
     * Bind triggers to all images with data-image-box attribute
     */
    bindTriggers: function () {
      const self = this;
      const triggers = document.querySelectorAll('[data-image-box]');

      triggers.forEach(function (trigger) {
        // Skip if already initialized
        if (trigger.dataset.imageBoxInitialized) return;
        trigger.dataset.imageBoxInitialized = 'true';

        // Add trigger class
        trigger.classList.add('vd-image-box-trigger');

        // Handle broken images
        if (trigger.tagName === 'IMG') {
          // Check if already in error state
          if (trigger.complete && trigger.naturalWidth === 0) {
            trigger.classList.add('is-broken');
          }

          // Listen for error events
          const errorHandler = function () {
            trigger.classList.add('is-broken');
          };
          trigger.addEventListener('error', errorHandler);

          // Listen for successful load
          const loadHandler = function () {
            trigger.classList.remove('is-broken');
          };
          trigger.addEventListener('load', loadHandler);
        }

        // Bind click event
        const clickHandler = function (e) {
          e.preventDefault();
          self.open(trigger);
        };
        trigger.addEventListener('click', clickHandler);

        // Store cleanup
        trigger._imageBoxCleanup = () => trigger.removeEventListener('click', clickHandler);

        // Keyboard accessibility for non-button triggers
        if (trigger.tagName !== 'BUTTON' && trigger.tagName !== 'A') {
          trigger.setAttribute('role', 'button');
          trigger.setAttribute('tabindex', '0');
          trigger.setAttribute('aria-label', 'View enlarged image');

          const keyHandler = function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              self.open(trigger);
            }
          };
          trigger.addEventListener('keydown', keyHandler);

          const originalCleanup = trigger._imageBoxCleanup;
          trigger._imageBoxCleanup = () => {
            originalCleanup();
            trigger.removeEventListener('keydown', keyHandler);
          };
        }
      });
    },

    /**
     * Open image box
     * @param {HTMLElement} trigger - The trigger element
     */
    open: function (trigger) {
      if (this.isOpen) return;

      this.currentTrigger = trigger;
      this.isOpen = true;
      this.initialScrollY = window.scrollY;

      // Get image source - support dual images (thumbnail + full-size)
      // data-image-box-full-src takes precedence for the lightbox
      const imgSrc = trigger.dataset.imageBoxFullSrc ||
        trigger.dataset.imageBoxSrc ||
        trigger.src ||
        trigger.href;

      if (!imgSrc) {
        console.warn('[Vanduo ImageBox] No image source found for trigger:', trigger);
        return;
      }

      // Get caption
      const captionText = trigger.dataset.imageBoxCaption || trigger.alt || '';

      // Set image source
      this.img.src = imgSrc;
      this.img.alt = trigger.alt || '';

      // Set caption
      if (captionText) {
        this.caption.textContent = captionText;
        this.caption.style.display = 'block';
      } else {
        this.caption.style.display = 'none';
      }

      // Calculate scrollbar width and lock body scroll
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.body.classList.add('body-image-box-open');

      // Show backdrop
      this.backdrop.classList.add('is-visible');

      // Focus management
      this.backdrop.focus();

      // Dispatch event
      trigger.dispatchEvent(new CustomEvent('imageBox:open', {
        bubbles: true,
        detail: { src: imgSrc }
      }));

      // Handle image load
      if (!this.img.complete) {
        this.img.style.opacity = '0';
        this.img.onload = () => {
          this.img.style.opacity = '';
        };
      }
    },

    /**
     * Close image box
     */
    close: function () {
      if (!this.isOpen) return;

      this.isOpen = false;

      // Hide backdrop
      this.backdrop.classList.remove('is-visible');

      // Unlock body scroll
      document.body.classList.remove('body-image-box-open');
      document.body.style.removeProperty('--scrollbar-width');

      // Return focus to trigger
      if (this.currentTrigger) {
        this.currentTrigger.focus();
        this.currentTrigger.dispatchEvent(new CustomEvent('imageBox:close', { bubbles: true }));
        this.currentTrigger = null;
      }

      // Clear image after transition
      setTimeout(() => {
        if (!this.isOpen) {
          this.img.src = '';
          this.img.alt = '';
        }
      }, 300);
    },

    /**
     * Reinitialize - useful after dynamic DOM changes
     */
    reinit: function () {
      this.bindTriggers();
    },

    /**
     * Destroy component and clean up
     */
    destroy: function () {
      // Close if open
      if (this.isOpen) {
        this.close();
      }

      // Remove backdrop
      if (this.backdrop && this.backdrop.parentNode) {
        this.backdrop.parentNode.removeChild(this.backdrop);
      }

      // Run cleanup functions
      this._cleanupFunctions.forEach(fn => fn());
      this._cleanupFunctions = [];

      // Remove trigger bindings
      const triggers = document.querySelectorAll('[data-image-box-initialized]');
      triggers.forEach(trigger => {
        trigger.classList.remove('vd-image-box-trigger');
        if (trigger._imageBoxCleanup) {
          trigger._imageBoxCleanup();
          delete trigger._imageBoxCleanup;
        }
        delete trigger.dataset.imageBoxInitialized;
      });

      this.backdrop = null;
      this.container = null;
      this.img = null;
      this.closeBtn = null;
      this.caption = null;
      this.currentTrigger = null;
      this.isOpen = false;
    },

    destroyAll: function () {
      this.destroy();
    }
  };

  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('imageBox', ImageBox);
  }

  // Expose globally
  window.VanduoImageBox = ImageBox;

})();
