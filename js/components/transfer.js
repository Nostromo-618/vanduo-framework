/**
 * Vanduo Framework - Transfer (Dual-list) Component
 * Source-to-target list transfer with search, select-all, and move actions
 */

(function () {
  'use strict';

  const Transfer = {
    instances: new Map(),

    init: function () {
      const transfers = document.querySelectorAll('[data-vd-transfer]');
      transfers.forEach(el => {
        if (this.instances.has(el)) return;
        this.initInstance(el);
      });
    },

    initInstance: function (el) {
      const cleanup = [];
      el.classList.add('vd-transfer');

      let sourceData, targetData;
      try {
        const raw = JSON.parse(el.getAttribute('data-vd-transfer') || '[]');
        sourceData = raw.map((item, i) => ({
          id: item.id || 'item-' + i,
          label: item.label || item.text || String(item),
          selected: false
        }));
      } catch (_e) {
        sourceData = [];
      }
      targetData = [];

      const sourceSelected = new Set();
      const targetSelected = new Set();

      const render = () => {
        el.innerHTML = '';

        // Source panel
        const sourcePanel = createPanel('Source', sourceData, sourceSelected, 'source');
        // Actions
        const actions = document.createElement('div');
        actions.className = 'vd-transfer-actions';

        const moveRightBtn = document.createElement('button');
        moveRightBtn.type = 'button';
        moveRightBtn.className = 'vd-transfer-btn';
        moveRightBtn.innerHTML = '&#8250;';
        moveRightBtn.setAttribute('aria-label', 'Move to target');
        moveRightBtn.disabled = sourceSelected.size === 0;
        moveRightBtn.addEventListener('click', () => moveRight());

        const moveLeftBtn = document.createElement('button');
        moveLeftBtn.type = 'button';
        moveLeftBtn.className = 'vd-transfer-btn';
        moveLeftBtn.innerHTML = '&#8249;';
        moveLeftBtn.setAttribute('aria-label', 'Move to source');
        moveLeftBtn.disabled = targetSelected.size === 0;
        moveLeftBtn.addEventListener('click', () => moveLeft());

        actions.appendChild(moveRightBtn);
        actions.appendChild(moveLeftBtn);

        // Target panel
        const targetPanel = createPanel('Target', targetData, targetSelected, 'target');

        el.appendChild(sourcePanel);
        el.appendChild(actions);
        el.appendChild(targetPanel);
      };

      const createPanel = (title, data, selected, _side) => {
        const panel = document.createElement('div');
        panel.className = 'vd-transfer-panel';

        const header = document.createElement('div');
        header.className = 'vd-transfer-header';
        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;
        const count = document.createElement('span');
        count.className = 'vd-transfer-count';
        count.textContent = selected.size + '/' + data.length;
        header.appendChild(titleSpan);
        header.appendChild(count);
        panel.appendChild(header);

        // Search
        const searchDiv = document.createElement('div');
        searchDiv.className = 'vd-transfer-search';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search...';
        searchInput.setAttribute('aria-label', 'Search ' + title.toLowerCase());
        searchDiv.appendChild(searchInput);
        panel.appendChild(searchDiv);

        // List
        const list = document.createElement('ul');
        list.className = 'vd-transfer-list';
        list.setAttribute('role', 'listbox');

        const renderList = (filter) => {
          list.innerHTML = '';
          const filtered = filter ? data.filter(d => {
            const label = (d.label || d.text || String(d)).toLowerCase();
            return label.includes(filter.toLowerCase());
          }) : data;
          filtered.forEach(item => {
            const li = document.createElement('li');
            li.className = 'vd-transfer-item';
            li.setAttribute('role', 'option');
            if (selected.has(item.id)) li.classList.add('is-selected');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = selected.has(item.id);
            checkbox.setAttribute('aria-label', item.label);

            const label = document.createElement('span');
            label.textContent = item.label;

            li.addEventListener('click', () => {
              if (selected.has(item.id)) selected.delete(item.id);
              else selected.add(item.id);
              render();
            });

            li.appendChild(checkbox);
            li.appendChild(label);
            list.appendChild(li);
          });
        };

        searchInput.addEventListener('input', () => renderList(searchInput.value));
        renderList('');

        panel.appendChild(list);
        return panel;
      };

      const moveRight = () => {
        const toMove = sourceData.filter(d => sourceSelected.has(d.id));
        sourceData = sourceData.filter(d => !sourceSelected.has(d.id));
        targetData = targetData.concat(toMove);
        sourceSelected.clear();
        render();
        fireChange();
      };

      const moveLeft = () => {
        const toMove = targetData.filter(d => targetSelected.has(d.id));
        targetData = targetData.filter(d => !targetSelected.has(d.id));
        sourceData = sourceData.concat(toMove);
        targetSelected.clear();
        render();
        fireChange();
      };

      const fireChange = () => {
        el.dispatchEvent(new CustomEvent('transfer:change', {
          detail: {
            source: sourceData.map(d => d.id),
            target: targetData.map(d => d.id)
          },
          bubbles: true
        }));
      };

      render();

      this.instances.set(el, {
        cleanup,
        getTarget: () => targetData.map(d => d.id),
        getSource: () => sourceData.map(d => d.id)
      });
    },

    getSelected: function (el) {
      const inst = this.instances.get(el);
      return inst ? inst.getTarget() : [];
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
    window.Vanduo.register('transfer', Transfer);
  }

  window.VanduoTransfer = Transfer;

})();
