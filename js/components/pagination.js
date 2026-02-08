/**
 * Vanduo Framework - Pagination Component
 * JavaScript functionality for dynamic pagination
 */

(function() {
  'use strict';

  /**
   * Pagination Component
   */
  const Pagination = {
    // Store initialized paginations and their cleanup functions
    instances: new Map(),

    /**
     * Initialize pagination components
     */
    init: function() {
      const paginations = document.querySelectorAll('.vd-pagination[data-pagination]');

      paginations.forEach(pagination => {
        if (this.instances.has(pagination)) {
          return;
        }
        this.initPagination(pagination);
      });
    },

    /**
     * Initialize a pagination
     * @param {HTMLElement} pagination - Pagination container
     */
    initPagination: function(pagination) {
      const totalPages = parseInt(pagination.dataset.totalPages) || 1;
      const currentPage = parseInt(pagination.dataset.currentPage) || 1;
      const maxVisible = parseInt(pagination.dataset.maxVisible) || 7;

      this.render(pagination, {
        totalPages: totalPages,
        currentPage: currentPage,
        maxVisible: maxVisible
      });

      // Handle clicks (event delegation)
      const clickHandler = (e) => {
        const link = e.target.closest('.vd-pagination-link');
        if (!link || link.closest('.vd-pagination-item.disabled') || link.closest('.vd-pagination-item.active')) {
          return;
        }

        e.preventDefault();

        const item = link.closest('.vd-pagination-item');
        const page = item.dataset.page;

        if (page) {
          this.goToPage(pagination, parseInt(page));
        } else if (item.classList.contains('pagination-prev')) {
          this.prevPage(pagination);
        } else if (item.classList.contains('pagination-next')) {
          this.nextPage(pagination);
        }
      };
      pagination.addEventListener('click', clickHandler);

      this.instances.set(pagination, {
        cleanup: [() => pagination.removeEventListener('click', clickHandler)]
      });
    },
    
    /**
     * Render pagination
     * @param {HTMLElement} pagination - Pagination container
     * @param {Object} options - Pagination options
     */
    render: function(pagination, options) {
      const { totalPages, currentPage, maxVisible } = options;
      
      if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
      }
      
      let html = '';
      
      // Previous button
      html += `<li class="vd-pagination-item vd-pagination-prev pagination-item pagination-prev ${currentPage === 1 ? 'disabled' : ''}">`;
      html += `<a class="vd-pagination-link pagination-link" href="#" aria-label="Previous">Previous</a>`;
      html += `</li>`;
      
      // Calculate page range
      const pages = this.calculatePages(currentPage, totalPages, maxVisible);
      
      // Page numbers
      let lastPage = 0;
      pages.forEach(page => {
        if (page === 'ellipsis') {
          html += `<li class="vd-pagination-item pagination-item"><span class="vd-pagination-ellipsis pagination-ellipsis">…</span></li>`;
        } else {
          if (page !== lastPage + 1 && lastPage > 0) {
            html += `<li class="vd-pagination-item pagination-item"><span class="vd-pagination-ellipsis pagination-ellipsis">…</span></li>`;
          }
          html += `<li class="vd-pagination-item pagination-item ${page === currentPage ? 'active' : ''}" data-page="${page}">`;
          html += `<a class="vd-pagination-link pagination-link" href="#" aria-label="Page ${page}">${page}</a>`;
          html += `</li>`;
          lastPage = page;
        }
      });
      
      // Next button
      html += `<li class="vd-pagination-item vd-pagination-next pagination-item pagination-next ${currentPage === totalPages ? 'disabled' : ''}">`;
      html += `<a class="vd-pagination-link pagination-link" href="#" aria-label="Next">Next</a>`;
      html += `</li>`;
      
      pagination.innerHTML = html;
      
      // Update data attributes
      pagination.dataset.currentPage = currentPage;
    },
    
    /**
     * Calculate which pages to show
     * @param {number} currentPage - Current page
     * @param {number} totalPages - Total pages
     * @param {number} maxVisible - Maximum visible pages
     * @returns {Array} Array of page numbers or 'ellipsis'
     */
    calculatePages: function(currentPage, totalPages, maxVisible) {
      const pages = [];
      const half = Math.floor(maxVisible / 2);
      
      if (totalPages <= maxVisible) {
        // Show all pages
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);
        
        let start = Math.max(2, currentPage - half);
        let end = Math.min(totalPages - 1, currentPage + half);
        
        // Adjust if we're near the start
        if (currentPage <= half + 1) {
          end = Math.min(totalPages - 1, maxVisible - 1);
        }
        
        // Adjust if we're near the end
        if (currentPage >= totalPages - half) {
          start = Math.max(2, totalPages - maxVisible + 2);
        }
        
        // Add ellipsis before if needed
        if (start > 2) {
          pages.push('ellipsis');
        }
        
        // Add middle pages
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        // Add ellipsis after if needed
        if (end < totalPages - 1) {
          pages.push('ellipsis');
        }
        
        // Always show last page
        if (totalPages > 1) {
          pages.push(totalPages);
        }
      }
      
      return pages;
    },
    
    /**
     * Go to specific page
     * @param {HTMLElement} pagination - Pagination container
     * @param {number} page - Page number
     */
    goToPage: function(pagination, page) {
      const totalPages = parseInt(pagination.dataset.totalPages) || 1;
      const maxVisible = parseInt(pagination.dataset.maxVisible) || 7;
      
      if (page < 1 || page > totalPages) {
        return;
      }
      
      this.render(pagination, {
        totalPages: totalPages,
        currentPage: page,
        maxVisible: maxVisible
      });
      
      // Dispatch event
      pagination.dispatchEvent(new CustomEvent('pagination:change', {
        bubbles: true,
        detail: { page, totalPages }
      }));
    },
    
    /**
     * Go to previous page
     * @param {HTMLElement} pagination - Pagination container
     */
    prevPage: function(pagination) {
      const currentPage = parseInt(pagination.dataset.currentPage) || 1;
      if (currentPage > 1) {
        this.goToPage(pagination, currentPage - 1);
      }
    },
    
    /**
     * Go to next page
     * @param {HTMLElement} pagination - Pagination container
     */
    nextPage: function(pagination) {
      const currentPage = parseInt(pagination.dataset.currentPage) || 1;
      const totalPages = parseInt(pagination.dataset.totalPages) || 1;
      if (currentPage < totalPages) {
        this.goToPage(pagination, currentPage + 1);
      }
    },
    
    /**
     * Update pagination
     * @param {HTMLElement|string} pagination - Pagination container or selector
     * @param {Object} options - Pagination options
     */
    update: function(pagination, options) {
      const el = typeof pagination === 'string' ? document.querySelector(pagination) : pagination;
      if (el) {
        if (options.totalPages !== undefined) {
          el.dataset.totalPages = options.totalPages;
        }
        if (options.currentPage !== undefined) {
          el.dataset.currentPage = options.currentPage;
        }
        if (options.maxVisible !== undefined) {
          el.dataset.maxVisible = options.maxVisible;
        }
        
        this.render(el, {
          totalPages: parseInt(el.dataset.totalPages) || 1,
          currentPage: parseInt(el.dataset.currentPage) || 1,
          maxVisible: parseInt(el.dataset.maxVisible) || 7
        });
      }
    },

    /**
     * Destroy a pagination instance and clean up event listeners
     * @param {HTMLElement} pagination - Pagination container
     */
    destroy: function(pagination) {
      const instance = this.instances.get(pagination);
      if (!instance) return;

      instance.cleanup.forEach(fn => fn());
      this.instances.delete(pagination);
    },

    /**
     * Destroy all pagination instances
     */
    destroyAll: function() {
      this.instances.forEach((instance, pagination) => {
        this.destroy(pagination);
      });
    }
  };
  
  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('pagination', Pagination);
  }
  
  // Expose globally
  window.VanduoPagination = Pagination;
  
})();

