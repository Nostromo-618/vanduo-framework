/**
 * Vanduo Framework — Expanding flex cards
 * Click / Enter / Space / Arrow keys to change the active card.
 *
 * Usage:
 *   <div class="vd-expanding-cards" data-vd-expanding-cards>
 *   Use data-vd-expanding-cards="manual" to skip auto-init.
 */

(function () {
  'use strict';

  const ExpandingCards = {
    instances: new Map(),

    init: function () {
      document.querySelectorAll('.vd-expanding-cards').forEach(function (el) {
        if (el.getAttribute('data-vd-expanding-cards') === 'manual') return;
        if (ExpandingCards.instances.has(el)) return;
        ExpandingCards.initContainer(el);
      });
    },

    initContainer: function (container) {
      const cleanup = [];

      const getCards = function () {
        return Array.prototype.slice.call(container.querySelectorAll('.vd-expanding-card'));
      };

      const setActive = function (card) {
        const cards = getCards();
        if (!card || cards.indexOf(card) === -1) return;
        cards.forEach(function (c) {
          c.classList.toggle('is-active', c === card);
        });
        card.focus({ preventScroll: true });
      };

      const onClick = function (e) {
        const t = e.target;
        const card = t.closest ? t.closest('.vd-expanding-card') : null;
        if (!card || !container.contains(card)) return;
        setActive(card);
      };

      const onKeydown = function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') {
          return;
        }
        const cards = getCards().filter(function (c) {
          return c.offsetParent !== null || c.getClientRects().length > 0;
        });
        if (!cards.length) return;
        const activeEl = document.activeElement;
        let idx = cards.indexOf(activeEl);
        if (idx < 0) {
          idx = cards.findIndex(function (c) {
            return c.classList.contains('is-active');
          });
        }
        if (idx < 0) idx = 0;

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setActive(cards[Math.max(0, idx - 1)]);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setActive(cards[Math.min(cards.length - 1, idx + 1)]);
        } else if (e.key === 'Home') {
          e.preventDefault();
          setActive(cards[0]);
        } else if (e.key === 'End') {
          e.preventDefault();
          setActive(cards[cards.length - 1]);
        }
      };

      container.addEventListener('click', onClick);
      cleanup.push(function () {
        container.removeEventListener('click', onClick);
      });

      container.addEventListener('keydown', onKeydown);
      cleanup.push(function () {
        container.removeEventListener('keydown', onKeydown);
      });

      getCards().forEach(function (card) {
        if (!card.hasAttribute('tabindex')) {
          card.setAttribute('tabindex', '0');
        }
        card.setAttribute('role', 'button');
        if (!card.hasAttribute('aria-pressed')) {
          card.setAttribute('aria-pressed', card.classList.contains('is-active') ? 'true' : 'false');
        }
      });

      const syncAria = function () {
        getCards().forEach(function (card) {
          card.setAttribute('aria-pressed', card.classList.contains('is-active') ? 'true' : 'false');
        });
      };

      const mo = new MutationObserver(syncAria);
      mo.observe(container, { attributes: true, subtree: true, attributeFilter: ['class'] });
      cleanup.push(function () {
        mo.disconnect();
      });
      syncAria();

      ExpandingCards.instances.set(container, { cleanup: cleanup });
    },

    destroy: function (container) {
      const inst = this.instances.get(container);
      if (!inst) return;
      inst.cleanup.forEach(function (fn) {
        fn();
      });
      this.instances.delete(container);
    },

    destroyAll: function () {
      this.instances.forEach(function (_, el) {
        ExpandingCards.destroy(el);
      });
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('expandingCards', ExpandingCards);
  }

  window.VanduoExpandingCards = ExpandingCards;
})();
