/**
 * Vanduo Framework - Tree View Component
 * Hierarchical collapsible tree with checkbox selection and keyboard navigation
 */

(function () {
  'use strict';

  const Tree = {
    instances: new Map(),

    init: function (root) {
      const trees = window.Vanduo.queryAll(root, '[data-vd-tree]');
      trees.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (el) {
      const cleanup = [];
      const cascade = el.getAttribute('data-vd-tree-cascade') !== 'false';

      let data;
      try { data = JSON.parse(el.getAttribute('data-vd-tree') || '[]'); } catch (_e) { data = []; }

      el.classList.add('vd-tree');
      el.setAttribute('role', 'tree');

      const render = (items, parent) => {
        parent.innerHTML = '';
        items.forEach(item => {
          const node = document.createElement('li');
          node.className = 'vd-tree-node';
          node.setAttribute('role', 'treeitem');
          node.setAttribute('aria-expanded', item.open ? 'true' : 'false');
          if (item.open) node.classList.add('is-open');

          const content = document.createElement('div');
          content.className = 'vd-tree-node-content';

          // Toggle
          if (item.children && item.children.length > 0) {
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'vd-tree-toggle';
            toggle.setAttribute('aria-label', 'Toggle');
            toggle.addEventListener('click', (e) => {
              e.stopPropagation();
              item.open = !item.open;
              node.classList.toggle('is-open');
              node.setAttribute('aria-expanded', item.open ? 'true' : 'false');
            });
            content.appendChild(toggle);
          } else {
            const ph = document.createElement('span');
            ph.className = 'vd-tree-toggle-placeholder';
            content.appendChild(ph);
          }

          // Checkbox
          if (el.hasAttribute('data-vd-tree-checkbox')) {
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'vd-tree-checkbox';
            cb.checked = !!item.checked;
            cb.setAttribute('aria-label', item.label);
            cb.addEventListener('change', (e) => {
              e.stopPropagation();
              item.checked = cb.checked;
              if (cascade && item.children) {
                setChildChecked(item.children, cb.checked);
                render(data, el);
              }
              el.dispatchEvent(new CustomEvent('tree:check', {
                detail: { id: item.id, checked: cb.checked, label: item.label },
                bubbles: true
              }));
            });
            content.appendChild(cb);
          }

          // Icon
          if (item.icon) {
            const icon = document.createElement('span');
            icon.className = 'vd-tree-icon ' + item.icon;
            content.appendChild(icon);
          }

          // Label
          const label = document.createElement('span');
          label.className = 'vd-tree-label';
          label.textContent = item.label || '';
          content.appendChild(label);

          node.appendChild(content);

          // Children
          if (item.children && item.children.length > 0) {
            const childList = document.createElement('ul');
            childList.className = 'vd-tree-children';
            childList.setAttribute('role', 'group');
            render(item.children, childList);
            node.appendChild(childList);
          }

          parent.appendChild(node);
        });
      };

      const setChildChecked = (items, checked) => {
        items.forEach(item => {
          item.checked = checked;
          if (item.children) setChildChecked(item.children, checked);
        });
      };

      // Keyboard
      const keyHandler = (e) => {
        const focused = document.activeElement;
        if (!el.contains(focused)) return;

        const nodes = Array.from(el.querySelectorAll('.vd-tree-node-content'));
        const idx = nodes.indexOf(focused.closest('.vd-tree-node-content'));
        if (idx === -1) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            if (idx < nodes.length - 1) {
              const next = nodes[idx + 1].querySelector('.vd-tree-toggle, .vd-tree-label');
              if (next) next.focus();
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (idx > 0) {
              const prev = nodes[idx - 1].querySelector('.vd-tree-toggle, .vd-tree-label');
              if (prev) prev.focus();
            }
            break;
        }
      };

      el.addEventListener('keydown', keyHandler);
      cleanup.push(() => el.removeEventListener('keydown', keyHandler));

      render(data, el);

      this.instances.set(el, {
        cleanup,
        getData: () => data,
        getChecked: () => {
          const checked = [];
          const collect = (items) => {
            items.forEach(i => {
              if (i.checked) checked.push(i.id || i.label);
              if (i.children) collect(i.children);
            });
          };
          collect(data);
          return checked;
        }
      });
    },

    getChecked: function (el) {
      const inst = this.instances.get(el);
      return inst ? inst.getChecked() : [];
    },

    destroy: function (el) {
      const inst = this.instances.get(el);
      if (!inst) return;
      inst.cleanup.forEach(fn => fn());
      el.innerHTML = '';
      this.instances.delete(el);
    },

    destroyAll: function () {
      this.instances.forEach((_, el) => this.destroy(el));
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('tree', Tree);
  }

  window.VanduoTree = Tree;

})();
