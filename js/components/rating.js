/**
 * Vanduo Framework - Rating Component
 * Star-based rating input with hover preview and read-only mode
 */

(function () {
  'use strict';

  const Rating = {
    instances: new Map(),

    init: function (root) {
      const ratings = window.Vanduo.queryAll(root, '[data-vd-rating]');
      ratings.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (el) {
      const cleanup = [];
      const max = parseInt(el.getAttribute('data-vd-rating-max') || '5', 10);
      const initialValue = parseFloat(el.getAttribute('data-vd-rating-value') || '0');
      const readonly = el.classList.contains('vd-rating-readonly') || el.hasAttribute('data-vd-rating-readonly');
      let currentValue = initialValue;

      el.classList.add('vd-rating');
      el.setAttribute('role', 'radiogroup');
      el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Rating');

      // Clear existing stars
      el.innerHTML = '';

      // Create stars
      const stars = [];
      for (let i = 1; i <= max; i++) {
        const star = document.createElement('button');
        star.type = 'button';
        star.className = 'vd-rating-star';
        star.setAttribute('role', 'radio');
        star.setAttribute('aria-label', i + ' star' + (i > 1 ? 's' : ''));
        star.setAttribute('aria-checked', i <= currentValue ? 'true' : 'false');
        if (readonly) star.tabIndex = -1;
        stars.push(star);
        el.appendChild(star);
      }

      // Value display
      const valueDisplay = document.createElement('span');
      valueDisplay.className = 'vd-rating-value';
      valueDisplay.textContent = currentValue > 0 ? currentValue.toString() : '';
      el.appendChild(valueDisplay);

      const updateStars = (value) => {
        stars.forEach((star, i) => {
          star.classList.remove('is-active', 'is-half');
          const starNum = i + 1;
          if (starNum <= Math.floor(value)) {
            star.classList.add('is-active');
          } else if (starNum - 0.5 <= value) {
            star.classList.add('is-half');
          }
          star.setAttribute('aria-checked', starNum <= value ? 'true' : 'false');
        });
        valueDisplay.textContent = value > 0 ? value.toString() : '';
      };

      updateStars(currentValue);

      if (!readonly) {
        stars.forEach((star, i) => {
          const enterHandler = () => {
            stars.forEach((s, j) => {
              s.classList.toggle('is-hovered', j <= i);
            });
          };
          const leaveHandler = () => {
            stars.forEach(s => s.classList.remove('is-hovered'));
          };
          const clickHandler = () => {
            currentValue = i + 1;
            el.setAttribute('data-vd-rating-value', currentValue);
            updateStars(currentValue);
            el.dispatchEvent(new CustomEvent('rating:change', {
              detail: { value: currentValue, max },
              bubbles: true
            }));
          };

          star.addEventListener('mouseenter', enterHandler);
          star.addEventListener('mouseleave', leaveHandler);
          star.addEventListener('click', clickHandler);

          cleanup.push(
            () => star.removeEventListener('mouseenter', enterHandler),
            () => star.removeEventListener('mouseleave', leaveHandler),
            () => star.removeEventListener('click', clickHandler)
          );
        });

        // Keyboard
        const keyHandler = (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentValue < max) {
              currentValue++;
              updateStars(currentValue);
              stars[currentValue - 1].focus();
              el.dispatchEvent(new CustomEvent('rating:change', { detail: { value: currentValue, max }, bubbles: true }));
            }
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentValue > 1) {
              currentValue--;
              updateStars(currentValue);
              stars[currentValue - 1].focus();
              el.dispatchEvent(new CustomEvent('rating:change', { detail: { value: currentValue, max }, bubbles: true }));
            }
          }
        };
        el.addEventListener('keydown', keyHandler);
        cleanup.push(() => el.removeEventListener('keydown', keyHandler));
      }

      this.instances.set(el, {
        cleanup,
        getValue: () => currentValue,
        setValue: (v) => { currentValue = v; updateStars(v); }
      });
    },

    getValue: function (el) {
      const inst = this.instances.get(el);
      return inst ? inst.getValue() : 0;
    },

    setValue: function (el, value) {
      const inst = this.instances.get(el);
      if (inst) inst.setValue(value);
    },

    destroy: function (el) {
      const inst = this.instances.get(el);
      if (!inst) return;
      inst.cleanup.forEach(fn => fn());
      this.instances.delete(el);
    },

    destroyAll: function () {
      this.instances.forEach((_, el) => this.destroy(el));
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('rating', Rating);
  }

  window.VanduoRating = Rating;

})();
