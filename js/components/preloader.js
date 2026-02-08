/**
 * Vanduo Framework - Preloader Component
 * JavaScript functionality for progress bars and loaders
 */

(function() {
  'use strict';

  /**
   * Preloader Component
   */
  const Preloader = {
    /**
     * Initialize preloader components
     */
    init: function() {
      const progressBars = document.querySelectorAll('.progress-bar[data-progress]');
      
      progressBars.forEach(bar => {
        if (!bar.dataset.progressInitialized) {
          this.initProgressBar(bar);
        }
      });
    },
    
    /**
     * Initialize a progress bar
     * @param {HTMLElement} bar - Progress bar element
     */
    initProgressBar: function(bar) {
      bar.dataset.progressInitialized = 'true';
      
      const initialValue = parseInt(bar.dataset.progress) || 0;
      this.setProgress(bar, initialValue, false);
    },
    
    /**
     * Set progress value
     * @param {HTMLElement|string} bar - Progress bar element or selector
     * @param {number} value - Progress value (0-100)
     * @param {boolean} animate - Whether to animate
     */
    setProgress: function(bar, value, animate = true) {
      const el = typeof bar === 'string' ? document.querySelector(bar) : bar;
      
      if (!el) {
        return;
      }
      
      // Clamp value between 0 and 100
      value = Math.max(0, Math.min(100, value));
      
      // Update width
      if (animate) {
        el.style.transition = 'width var(--transition-duration-slow) var(--transition-ease)';
      } else {
        el.style.transition = 'none';
        setTimeout(() => {
          el.style.transition = '';
        }, 0);
      }
      
      el.style.width = value + '%';
      el.setAttribute('aria-valuenow', value);
      el.setAttribute('aria-valuemin', 0);
      el.setAttribute('aria-valuemax', 100);
      
      // Update text if exists
      const text = el.querySelector('.progress-text');
      if (text) {
        text.textContent = value + '%';
      }
      
      // Dispatch event
      el.dispatchEvent(new CustomEvent('progress:update', {
        bubbles: true,
        detail: { value, max: 100 }
      }));
      
      // Complete event
      if (value >= 100) {
        el.dispatchEvent(new CustomEvent('progress:complete', {
          bubbles: true,
          detail: { value, max: 100 }
        }));
      }
    },
    
    /**
     * Animate progress from current to target
     * @param {HTMLElement|string} bar - Progress bar element or selector
     * @param {number} targetValue - Target progress value (0-100)
     * @param {number} duration - Animation duration in ms
     */
    animateProgress: function(bar, targetValue, duration = 1000) {
      const el = typeof bar === 'string' ? document.querySelector(bar) : bar;
      
      if (!el) {
        return;
      }
      
      const startValue = parseInt(el.style.width) || 0;
      const difference = targetValue - startValue;
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (difference * easeOut);
        
        this.setProgress(el, currentValue, false);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    },
    
    /**
     * Show preloader
     * @param {HTMLElement|string} preloader - Preloader element or selector
     */
    show: function(preloader) {
      const el = typeof preloader === 'string' ? document.querySelector(preloader) : preloader;
      if (el) {
        el.style.display = 'inline-block';
        el.setAttribute('aria-hidden', 'false');
      }
    },
    
    /**
     * Hide preloader
     * @param {HTMLElement|string} preloader - Preloader element or selector
     */
    hide: function(preloader) {
      const el = typeof preloader === 'string' ? document.querySelector(preloader) : preloader;
      if (el) {
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
      }
    },
    
    /**
     * Toggle preloader
     * @param {HTMLElement|string} preloader - Preloader element or selector
     */
    toggle: function(preloader) {
      const el = typeof preloader === 'string' ? document.querySelector(preloader) : preloader;
      if (el) {
        if (el.style.display === 'none' || el.getAttribute('aria-hidden') === 'true') {
          this.show(el);
        } else {
          this.hide(el);
        }
      }
    },

    /**
     * Destroy all progress bar instances
     */
    destroyAll: function() {
      const progressBars = document.querySelectorAll('.progress-bar[data-progress-initialized="true"]');
      progressBars.forEach(bar => {
        delete bar.dataset.progressInitialized;
      });
    }
  };
  
  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('preloader', Preloader);
  }
  
  // Expose globally
  window.VanduoPreloader = Preloader;
  
})();

