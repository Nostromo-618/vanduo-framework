/**
 * Vanduo Framework - Search Component
 * Client-side search functionality for content pages
 * 
 * @example Basic usage (initialize with defaults)
 * // HTML:
 * // <div class="doc-search">
 * //   <input type="search" class="doc-search-input" placeholder="Search...">
 * //   <div class="vd-doc-search-results"></div>
 * // </div>
 * 
 * @example Custom configuration
 * var search = Search.create({
 *   containerSelector: '.my-search',
 *   contentSelector: 'article[id]',
 *   titleSelector: 'h2, h3',
 *   maxResults: 5,
 *   onSelect: function(result) {
 *     console.log('Selected:', result.title);
 *   }
 * });
 * 
 * @example With custom data source
 * var search = Search.create({
 *   containerSelector: '.my-search',
 *   data: [
 *     { id: 'item1', title: 'First Item', content: 'Description...', category: 'Category A' },
 *     { id: 'item2', title: 'Second Item', content: 'Description...', category: 'Category B' }
 *   ]
 * });
 */

(function() {
  'use strict';

  /**
   * Default configuration
   */
  var DEFAULTS = {
    // Behavior
    minQueryLength: 2,
    maxResults: 10,
    debounceMs: 150,
    highlightTag: 'mark',
    keyboardShortcut: true,  // Enable Cmd/Ctrl+K shortcut
    
    // Selectors (for DOM-based indexing)
    containerSelector: '.vd-doc-search',
    inputSelector: '.vd-doc-search-input',
    resultsSelector: '.vd-doc-search-results',
    contentSelector: '.doc-content section[id]',
    titleSelector: '.demo-title, h2, h3',
    navSelector: '.doc-nav-link',
    sectionSelector: '.doc-nav-section',
    
    // Content extraction
    excludeFromContent: 'pre, code, script, style',
    maxContentLength: 500,
    
    // Custom data source (alternative to DOM indexing)
    data: null,
    
    // Category icons mapping
    categoryIcons: {
      'getting-started': 'ph-rocket-launch',
      'core': 'ph-cube',
      'components': 'ph-puzzle-piece',
      'interactive': 'ph-cursor-click',
      'data-display': 'ph-table',
      'feedback': 'ph-bell',
      'meta': 'ph-info',
      'default': 'ph-file-text'
    },
    
    // Callbacks
    onSelect: null,      // function(result) - called when result is selected
    onSearch: null,      // function(query, results) - called after search
    onOpen: null,        // function() - called when results open
    onClose: null,       // function() - called when results close
    
    // Text customization
    emptyTitle: 'No results found',
    emptyText: 'Try different keywords or check spelling',
    placeholder: 'Search...'
  };

  /**
   * Search Component Factory
   * Creates a new search instance with the given configuration
   * 
   * @param {Object} options - Configuration options
   * @returns {Object} Search instance
   */
  function createSearch(options) {
    var config = Object.assign({}, DEFAULTS, options || {});
    
    // Instance state
    var state = {
      index: [],
      results: [],
      activeIndex: -1,
      isOpen: false,
      query: '',
      container: null,
      input: null,
      resultsContainer: null,
      debounceTimer: null,
      boundHandlers: {}
    };

    /**
     * Initialize the search component
     */
    function init() {
      state.container = document.querySelector(config.containerSelector);
      if (!state.container) {
        return null;
      }

      state.input = state.container.querySelector(config.inputSelector);
      state.resultsContainer = state.container.querySelector(config.resultsSelector);

      if (!state.input || !state.resultsContainer) {
        return null;
      }

      // Set placeholder if configured
      if (config.placeholder) {
        state.input.setAttribute('placeholder', config.placeholder);
      }

      // Build search index
      buildIndex();

      // Bind events
      bindEvents();

      // Set up ARIA attributes
      setupAria();

      return instance;
    }

    /**
     * Build search index from DOM or custom data
     */
    function buildIndex() {
      state.index = [];
      
      // Use custom data if provided
      if (config.data && Array.isArray(config.data)) {
        config.data.forEach(function(item) {
          state.index.push({
            id: item.id || slugify(item.title),
            title: item.title || '',
            category: item.category || '',
            categorySlug: slugify(item.category || ''),
            content: item.content || '',
            keywords: item.keywords || extractKeywordsFromText(item.title + ' ' + item.content),
            url: item.url || '#' + (item.id || slugify(item.title))
          });
        });
        return;
      }

      // Build from DOM
      var sections = document.querySelectorAll(config.contentSelector);
      var categoryMap = buildCategoryMap();

      sections.forEach(function(section) {
        var id = section.id;
        if (!id) return;

        var titleEl = section.querySelector(config.titleSelector);
        var title = titleEl ? titleEl.textContent.replace(/v[\d.]+/g, '').trim() : id;
        var category = categoryMap[id] || 'Documentation';
        var content = extractContent(section);
        var keywords = extractKeywords(section, title);

        state.index.push({
          id: id,
          title: title,
          category: category,
          categorySlug: slugify(category),
          content: content,
          keywords: keywords,
          url: '#' + id
        });
      });
    }

    /**
     * Build a map of section IDs to their categories
     */
    function buildCategoryMap() {
      var map = {};
      var currentCategory = 'Documentation';
      var navItems = document.querySelectorAll(config.navSelector + ', ' + config.sectionSelector);

      navItems.forEach(function(item) {
        if (item.classList.contains('doc-nav-section')) {
          currentCategory = item.textContent.trim();
        } else {
          var href = item.getAttribute('href');
          if (href && href.startsWith('#')) {
            var id = href.substring(1);
            map[id] = currentCategory;
          }
        }
      });

      return map;
    }

    /**
     * Extract searchable content from a section
     */
    function extractContent(section) {
      var clone = section.cloneNode(true);
      
      var toRemove = clone.querySelectorAll(config.excludeFromContent);
      toRemove.forEach(function(el) {
        el.remove();
      });

      var text = clone.textContent || '';
      text = text.replace(/\s+/g, ' ').trim();
      
      return text.substring(0, config.maxContentLength);
    }

    /**
     * Extract keywords from a section
     */
    function extractKeywords(section, title) {
      var keywords = [];
      
      // Add title words
      title.toLowerCase().split(/\s+/).forEach(function(word) {
        if (word.length > 2) {
          keywords.push(word);
        }
      });

      // Add class names from code examples
      var codeBlocks = section.querySelectorAll('code');
      codeBlocks.forEach(function(code) {
        var text = code.textContent || '';
        var classMatches = text.match(/\.([\w-]+)/g);
        if (classMatches) {
          classMatches.forEach(function(match) {
            keywords.push(match.substring(1).toLowerCase());
          });
        }
      });

      // Add data attributes
      var dataAttrs = section.querySelectorAll('[data-tooltip], [data-modal]');
      dataAttrs.forEach(function(el) {
        var attrs = el.getAttributeNames().filter(function(name) {
          return name.startsWith('data-');
        });
        attrs.forEach(function(attr) {
          keywords.push(attr.replace('data-', ''));
        });
      });

      return Array.from(new Set(keywords));
    }

    /**
     * Extract keywords from text string
     */
    function extractKeywordsFromText(text) {
      var words = text.toLowerCase().split(/\s+/);
      return words.filter(function(word) {
        return word.length > 2;
      });
    }

    /**
     * Convert string to slug
     */
    function slugify(str) {
      return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
      // Store bound handlers for cleanup
      state.boundHandlers.handleInput = function(e) {
        handleInput(e);
      };
      state.boundHandlers.handleFocus = function() {
        if (state.query.length >= config.minQueryLength) {
          open();
        }
      };
      state.boundHandlers.handleKeydown = function(e) {
        handleKeydown(e);
      };
      state.boundHandlers.handleOutsideClick = function(e) {
        if (!state.container.contains(e.target)) {
          close();
        }
      };
      state.boundHandlers.handleGlobalKeydown = function(e) {
        if (config.keyboardShortcut && (e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          state.input.focus();
          state.input.select();
        }
      };
      state.boundHandlers.handleResultClick = function(e) {
        var result = e.target.closest('.vd-doc-search-result');
        if (result) {
          var index = parseInt(result.dataset.index, 10);
          select(index);
        }
      };

      // Input events
      state.input.addEventListener('input', state.boundHandlers.handleInput);
      state.input.addEventListener('focus', state.boundHandlers.handleFocus);
      state.input.addEventListener('keydown', state.boundHandlers.handleKeydown);

      // Close on outside click
      document.addEventListener('click', state.boundHandlers.handleOutsideClick);

      // Global keyboard shortcut
      document.addEventListener('keydown', state.boundHandlers.handleGlobalKeydown);

      // Result click handling
      state.resultsContainer.addEventListener('click', state.boundHandlers.handleResultClick);
    }

    /**
     * Unbind event listeners
     */
    function unbindEvents() {
      if (state.input) {
        state.input.removeEventListener('input', state.boundHandlers.handleInput);
        state.input.removeEventListener('focus', state.boundHandlers.handleFocus);
        state.input.removeEventListener('keydown', state.boundHandlers.handleKeydown);
      }
      document.removeEventListener('click', state.boundHandlers.handleOutsideClick);
      document.removeEventListener('keydown', state.boundHandlers.handleGlobalKeydown);
      if (state.resultsContainer) {
        state.resultsContainer.removeEventListener('click', state.boundHandlers.handleResultClick);
      }
    }

    /**
     * Set up ARIA attributes
     */
    function setupAria() {
      var resultsId = state.resultsContainer.id || 'search-results-' + Math.random().toString(36).substr(2, 9);
      state.resultsContainer.id = resultsId;
      
      state.input.setAttribute('role', 'combobox');
      state.input.setAttribute('aria-autocomplete', 'list');
      state.input.setAttribute('aria-controls', resultsId);
      state.input.setAttribute('aria-expanded', 'false');
      
      state.resultsContainer.setAttribute('role', 'listbox');
      state.resultsContainer.setAttribute('aria-label', 'Search results');
    }

    /**
     * Handle input changes
     */
    function handleInput(e) {
      var query = e.target.value.trim();

      if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
      }

      state.debounceTimer = setTimeout(function() {
        state.query = query;

        if (query.length < config.minQueryLength) {
          close();
          return;
        }

        state.results = search(query);
        state.activeIndex = -1;
        render();
        open();

        // Callback
        if (typeof config.onSearch === 'function') {
          config.onSearch(query, state.results);
        }
      }, config.debounceMs);
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeydown(e) {
      if (!state.isOpen) {
        if (e.key === 'ArrowDown' && state.query.length >= config.minQueryLength) {
          e.preventDefault();
          state.results = search(state.query);
          render();
          open();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          navigate(1);
          break;

        case 'ArrowUp':
          e.preventDefault();
          navigate(-1);
          break;

        case 'Enter':
          e.preventDefault();
          if (state.activeIndex >= 0) {
            select(state.activeIndex);
          } else if (state.results.length > 0) {
            select(0);
          }
          break;

        case 'Escape':
          e.preventDefault();
          close();
          break;

        case 'Tab':
          close();
          break;
      }
    }

    /**
     * Perform search
     */
    function search(query) {
      var terms = query.toLowerCase().split(/\s+/).filter(function(t) {
        return t.length > 0;
      });
      var scored = [];

      state.index.forEach(function(entry) {
        var score = 0;
        var titleLower = entry.title.toLowerCase();
        var categoryLower = entry.category.toLowerCase();
        var contentLower = entry.content.toLowerCase();

        terms.forEach(function(term) {
          // Title match - highest priority
          if (titleLower.includes(term)) {
            score += 100;
            if (titleLower === term) {
              score += 50;
            } else if (titleLower.startsWith(term)) {
              score += 25;
            }
          }

          // Category match
          if (categoryLower.includes(term)) {
            score += 50;
          }

          // Keyword match
          var keywordMatch = entry.keywords.some(function(k) {
            return k.includes(term);
          });
          if (keywordMatch) {
            score += 30;
          }

          // Content match
          if (contentLower.includes(term)) {
            score += 10;
          }
        });

        if (score > 0) {
          scored.push({
            id: entry.id,
            title: entry.title,
            category: entry.category,
            categorySlug: entry.categorySlug,
            content: entry.content,
            url: entry.url,
            score: score
          });
        }
      });

      scored.sort(function(a, b) {
        return b.score - a.score;
      });

      return scored.slice(0, config.maxResults);
    }

    /**
     * Render search results
     */
    function render() {
      if (state.results.length === 0) {
        state.resultsContainer.innerHTML = renderEmpty();
        return;
      }

      var html = '<ul class="vd-doc-search-results-list" role="listbox">';

      state.results.forEach(function(result, index) {
        var isActive = index === state.activeIndex;
        var icon = getCategoryIcon(result.categorySlug);
        var excerpt = getExcerpt(result.content, state.query);

        html += '<li class="vd-doc-search-result' + (isActive ? ' is-active' : '') + '"' +
          ' role="option"' +
          ' id="vd-doc-search-result-' + index + '"' +
          ' data-index="' + index + '"' +
          ' data-category="' + result.categorySlug + '"' +
          ' aria-selected="' + isActive + '"' +
          '>' +
          '<div class="vd-doc-search-result-icon">' +
          '<i class="ph ' + icon + '"></i>' +
          '</div>' +
          '<div class="vd-doc-search-result-content">' +
          '<div class="vd-doc-search-result-title">' + highlight(result.title, state.query) + '</div>' +
          '<div class="vd-doc-search-result-category">' + result.category + '</div>' +
          '<div class="vd-doc-search-result-excerpt">' + highlight(excerpt, state.query) + '</div>' +
          '</div>' +
          '</li>';
      });

      html += '</ul>';
      html += renderFooter();

      state.resultsContainer.innerHTML = html;
    }

    /**
     * Render empty state
     */
    function renderEmpty() {
      return '<div class="vd-doc-search-empty">' +
        '<div class="vd-doc-search-empty-icon"><i class="ph ph-magnifying-glass"></i></div>' +
        '<div class="vd-doc-search-empty-title">' + escapeHtml(config.emptyTitle) + '</div>' +
        '<div class="vd-doc-search-empty-text">' + escapeHtml(config.emptyText) + '</div>' +
        '</div>';
    }

    /**
     * Render footer with keyboard hints
     */
    function renderFooter() {
      return '<div class="vd-doc-search-footer">' +
        '<span class="vd-doc-search-footer-item"><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>' +
        '<span class="vd-doc-search-footer-item"><kbd>↵</kbd> to select</span>' +
        '<span class="vd-doc-search-footer-item"><kbd>esc</kbd> to close</span>' +
        '</div>';
    }

    /**
     * Get icon for category
     */
    function getCategoryIcon(categorySlug) {
      return config.categoryIcons[categorySlug] || config.categoryIcons['default'] || 'ph-file-text';
    }

    /**
     * Get excerpt from content
     */
    function getExcerpt(content, query) {
      var terms = query.toLowerCase().split(/\s+/);
      var contentLower = content.toLowerCase();
      var excerptLength = 100;

      var matchPos = -1;
      for (var i = 0; i < terms.length; i++) {
        var pos = contentLower.indexOf(terms[i]);
        if (pos !== -1 && (matchPos === -1 || pos < matchPos)) {
          matchPos = pos;
        }
      }

      if (matchPos === -1) {
        return content.substring(0, excerptLength) + '...';
      }

      var start = Math.max(0, matchPos - 30);
      var end = Math.min(content.length, matchPos + excerptLength);
      var excerpt = content.substring(start, end);

      if (start > 0) {
        excerpt = '...' + excerpt;
      }
      if (end < content.length) {
        excerpt = excerpt + '...';
      }

      return excerpt;
    }

    /**
     * Highlight matched terms in text
     */
    function highlight(text, query) {
      if (!query) return escapeHtml(text);

      var terms = query.toLowerCase().split(/\s+/).filter(function(t) {
        return t.length > 0;
      });
      var escaped = escapeHtml(text);

      terms.forEach(function(term) {
        // Skip overly long terms to prevent ReDoS
        if (term.length > 50) return;
        var regex = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        escaped = escaped.replace(regex, '<' + config.highlightTag + '>$1</' + config.highlightTag + '>');
      });

      return escaped;
    }

    /**
     * Escape HTML entities
     */
    function escapeHtml(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * Navigate results with keyboard
     */
    function navigate(direction) {
      var newIndex = state.activeIndex + direction;

      if (newIndex < 0) {
        newIndex = state.results.length - 1;
      } else if (newIndex >= state.results.length) {
        newIndex = 0;
      }

      setActiveIndex(newIndex);
    }

    /**
     * Set active result index
     */
    function setActiveIndex(index) {
      var prevActive = state.resultsContainer.querySelector('.vd-doc-search-result.is-active');
      if (prevActive) {
        prevActive.classList.remove('is-active');
        prevActive.setAttribute('aria-selected', 'false');
      }

      state.activeIndex = index;

      var newActive = state.resultsContainer.querySelector('[data-index="' + index + '"]');
      if (newActive) {
        newActive.classList.add('is-active');
        newActive.setAttribute('aria-selected', 'true');
        state.input.setAttribute('aria-activedescendant', 'vd-doc-search-result-' + index);
        newActive.scrollIntoView({ block: 'nearest' });
      }
    }

    /**
     * Select a result
     */
    function select(index) {
      var result = state.results[index];
      if (!result) return;

      // Close search
      close();
      state.input.value = '';
      state.query = '';

      // Custom callback
      if (typeof config.onSelect === 'function') {
        config.onSelect(result);
        return;
      }

      // Default behavior: navigate to section
      var section = document.querySelector(result.url);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', result.url);
        updateSidebarActive(result.id);
      }
    }

    /**
     * Update sidebar navigation active state
     */
    function updateSidebarActive(sectionId) {
      var navLinks = document.querySelectorAll(config.navSelector);
      navLinks.forEach(function(link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
          link.classList.add('active');
        }
      });
    }

    /**
     * Open results dropdown
     */
    function open() {
      if (state.isOpen) return;

      state.isOpen = true;
      state.resultsContainer.classList.add('is-open');
      state.input.setAttribute('aria-expanded', 'true');

      if (typeof config.onOpen === 'function') {
        config.onOpen();
      }
    }

    /**
     * Close results dropdown
     */
    function close() {
      if (!state.isOpen) return;

      state.isOpen = false;
      state.activeIndex = -1;
      state.resultsContainer.classList.remove('is-open');
      state.input.setAttribute('aria-expanded', 'false');
      state.input.removeAttribute('aria-activedescendant');

      if (typeof config.onClose === 'function') {
        config.onClose();
      }
    }

    /**
     * Destroy the component
     */
    function destroy() {
      unbindEvents();
      
      state.index = [];
      state.results = [];
      state.isOpen = false;
      state.query = '';

      if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
      }

      if (state.resultsContainer) {
        state.resultsContainer.innerHTML = '';
      }
    }

    /**
     * Rebuild the search index
     */
    function rebuild() {
      buildIndex();
    }

    /**
     * Update configuration
     */
    function setConfig(newConfig) {
      Object.assign(config, newConfig);
    }

    /**
     * Get current configuration
     */
    function getConfig() {
      return Object.assign({}, config);
    }

    /**
     * Get search index
     */
    function getIndex() {
      return state.index.slice();
    }

    // Public instance API
    var instance = {
      init: init,
      destroy: destroy,
      rebuild: rebuild,
      search: search,
      open: open,
      close: close,
      setConfig: setConfig,
      getConfig: getConfig,
      getIndex: getIndex
    };

    return instance;
  }

  /**
   * Search Component (singleton for backward compatibility)
   */
  var Search = {
    // Factory method
    create: createSearch,
    
    // Default instance
    _instance: null,
    
    // Configuration (for default instance)
    config: Object.assign({}, DEFAULTS),

    /**
     * Initialize the default search instance
     */
    init: function(options) {
      if (this._instance) {
        this._instance.destroy();
      }
      
      if (options) {
        Object.assign(this.config, options);
      }
      
      this._instance = createSearch(this.config);
      return this._instance ? this._instance.init() : null;
    },

    /**
     * Destroy the default instance
     */
    destroy: function() {
      if (this._instance) {
        this._instance.destroy();
        this._instance = null;
      }
    },

    destroyAll: function() {
      this.destroy();
    },

    /**
     * Rebuild the default instance index
     */
    rebuild: function() {
      if (this._instance) {
        this._instance.rebuild();
      }
    },

    /**
     * Search using the default instance
     */
    search: function(query) {
      return this._instance ? this._instance.search(query) : [];
    },

    /**
     * Open the default instance
     */
    open: function() {
      if (this._instance) {
        this._instance.open();
      }
    },

    /**
     * Close the default instance
     */
    close: function() {
      if (this._instance) {
        this._instance.close();
      }
    }
  };

  // Register with Vanduo framework if available
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('search', Search);
  }

  // Expose globally (both names for compatibility)
  window.Search = Search;
  window.DocSearch = Search;  // Backward compatibility

})();
