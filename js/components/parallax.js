/**
 * Vanduo Framework - Parallax Component
 * JavaScript functionality for parallax scroll effects
 */

(function () {
  'use strict';

  /**
   * Parallax Component
   */
  const Parallax = {
    parallaxElements: new Map(),
    ticking: false,
    isMobile: window.innerWidth < 768,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isInitialized: false,
    _onScroll: null,
    _onResize: null,

    /**
     * Initialize parallax components
     */
    init: function () {
      if (this.isInitialized) {
        this.refresh();
        return;
      }

      this.isInitialized = true;

      // Check for reduced motion preference
      if (this.reducedMotion) {
        return; // Don't initialize if user prefers reduced motion
      }

      const parallaxElements = document.querySelectorAll('.vd-parallax');

      parallaxElements.forEach(element => {
        if (!element.dataset.parallaxInitialized) {
          this.initParallax(element);
        }
      });

      // Handle scroll
      this.handleScroll();
      this._onScroll = () => {
        this.handleScroll();
      };
      window.addEventListener('scroll', this._onScroll, { passive: true });

      // Handle resize
      this._onResize = () => {
        this.isMobile = window.innerWidth < 768;
        this.updateAll();
      };
      window.addEventListener('resize', this._onResize);
    },

    /**
     * Initialize a parallax element
     * @param {HTMLElement} element - Parallax container
     */
    initParallax: function (element) {
      element.dataset.parallaxInitialized = 'true';

      // Check if disabled on mobile
      const disableMobile = element.classList.contains('parallax-disable-mobile');
      if (disableMobile && this.isMobile) {
        return;
      }

      const layers = element.querySelectorAll('.vd-parallax-layer, .vd-parallax-bg');
      const speed = this.getSpeed(element);
      const direction = element.classList.contains('parallax-horizontal') ? 'horizontal' : 'vertical';

      this.parallaxElements.set(element, {
        layers: Array.from(layers),
        speed: speed,
        direction: direction,
        disableMobile: disableMobile
      });

      // Initial update
      this.updateParallax(element);
    },

    /**
     * Get parallax speed from element
     * @param {HTMLElement} element - Parallax element
     * @returns {number} Speed multiplier
     */
    getSpeed: function (element) {
      if (element.classList.contains('parallax-slow')) {
        return 0.5;
      } else if (element.classList.contains('parallax-fast')) {
        return 1.5;
      }
      return 1; // Default medium speed
    },

    /**
     * Handle scroll event
     */
    handleScroll: function () {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.updateAll();
          this.ticking = false;
        });
        this.ticking = true;
      }
    },

    /**
     * Update all parallax elements
     */
    updateAll: function () {
      this.parallaxElements.forEach((config, element) => {
        // Skip if disabled on mobile
        if (config.disableMobile && this.isMobile) {
          return;
        }

        this.updateParallax(element);
      });
    },

    /**
     * Update parallax for a single element
     * @param {HTMLElement} element - Parallax element
     */
    updateParallax: function (element) {
      const config = this.parallaxElements.get(element);
      if (!config) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Calculate scroll progress (0 to 1)
      const scrollProgress = Math.max(0, Math.min(1,
        (windowHeight - elementTop) / (windowHeight + elementHeight)
      ));

      // Calculate offset based on speed and direction
      const offset = (scrollProgress - 0.5) * config.speed * 100;

      config.layers.forEach((layer, _index) => {
        // Different layers can have different speeds
        const layerSpeed = layer.dataset.parallaxSpeed ? parseFloat(layer.dataset.parallaxSpeed) : 1;
        const layerOffset = offset * layerSpeed;

        if (config.direction === 'horizontal') {
          layer.style.transform = `translateX(${layerOffset}px)`;
        } else {
          layer.style.transform = `translateY(${layerOffset}px)`;
        }
      });
    },

    /**
     * Destroy parallax element
     * @param {HTMLElement|string} element - Parallax element or selector
     */
    destroy: function (element) {
      const el = typeof element === 'string' ? document.querySelector(element) : element;
      if (el && this.parallaxElements.has(el)) {
        const config = this.parallaxElements.get(el);
        config.layers.forEach(layer => {
          layer.style.transform = '';
        });
        this.parallaxElements.delete(el);
      }
    },

    /**
     * Refresh parallax (recalculate positions)
     */
    refresh: function () {
      this.updateAll();
    },

    destroyAll: function () {
      this.parallaxElements.forEach((_config, element) => {
        this.destroy(element);
      });
      this.parallaxElements.clear();

      if (this._onScroll) {
        window.removeEventListener('scroll', this._onScroll);
        this._onScroll = null;
      }

      if (this._onResize) {
        window.removeEventListener('resize', this._onResize);
        this._onResize = null;
      }

      this.isInitialized = false;
    }
  };

  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('parallax', Parallax);
  }

  // Expose globally
  window.VanduoParallax = Parallax;

})();

