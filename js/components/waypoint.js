/**
 * Vanduo Framework - Waypoint (Scrollspy) Component
 * Highlights navigation links based on scroll position using IntersectionObserver
 */

(function () {
  'use strict';

  const Waypoint = {
    instances: new Map(),

    init: function (root) {
      const navs = window.Vanduo.queryAll(root, '[data-vd-waypoint-nav], [data-vd-scrollspy-nav]');
      navs.forEach(nav => {
        if (this.instances.has(nav)) return;
        this.initInstance(nav);
      });
    },

    initInstance: function (nav) {
      const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
      if (links.length === 0) return;

      const cleanup = [];
      const offset = parseInt(nav.getAttribute('data-vd-waypoint-offset') || '80', 10);
      const sections = [];

      links.forEach(link => {
        const id = link.getAttribute('href').slice(1);
        const section = document.getElementById(id);
        if (section) {
          section.setAttribute('data-vd-waypoint-section', '');
          sections.push({ id, link, section });
        }
      });

      if (sections.length === 0) return;

      const activeSections = new Set();

      const setActive = (id) => {
        links.forEach(l => l.classList.remove('is-active'));
        const target = links.find(l => l.getAttribute('href') === '#' + id);
        if (target) {
          target.classList.add('is-active');
          nav.dispatchEvent(new CustomEvent('waypoint:change', {
            detail: { activeId: id, link: target }
          }));
        }
      };

      const rootMargin = '-' + offset + 'px 0px -40% 0px';

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            activeSections.add(entry.target.id);
          } else {
            activeSections.delete(entry.target.id);
          }
        });

        // Pick the topmost visible section
        for (let i = 0; i < sections.length; i++) {
          if (activeSections.has(sections[i].id)) {
            setActive(sections[i].id);
            return;
          }
        }
      }, {
        rootMargin: rootMargin,
        threshold: 0
      });

      sections.forEach(s => observer.observe(s.section));

      // Smooth scroll on click
      links.forEach(link => {
        const clickHandler = (e) => {
          e.preventDefault();
          const id = link.getAttribute('href').slice(1);
          const section = document.getElementById(id);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            setActive(id);
          }
        };
        link.addEventListener('click', clickHandler);
        cleanup.push(() => link.removeEventListener('click', clickHandler));
      });

      cleanup.push(() => observer.disconnect());

      this.instances.set(nav, { observer, cleanup, sections, setActive });
    },

    refresh: function (nav) {
      this.destroy(nav);
      this.initInstance(nav);
    },

    destroy: function (nav) {
      const instance = this.instances.get(nav);
      if (!instance) return;
      instance.cleanup.forEach(fn => fn());
      this.instances.delete(nav);
    },

    destroyAll: function () {
      this.instances.forEach((_, nav) => this.destroy(nav));
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('waypoint', Waypoint);
  }

  window.VanduoWaypoint = Waypoint;

})();
