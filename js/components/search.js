/**
 * Vanduo Framework - Search Helper
 *
 * Small registry that lets consumers plug named data sources into a search
 * overlay. The framework does not ship a UI — overlays like
 * `GlobalSearchModal` consume the registry.
 *
 * Source shape:
 *   {
 *     name: 'sections',                        // unique key
 *     label: 'Documentation Sections',        // display name in groups
 *     icon: 'ph-book-open',                    // optional Phosphor class
 *     limit: 10,                                // optional cap (default 10)
 *     fetch: async (query, signal) => [...]   // returns Result[]
 *   }
 *
 * Result shape:
 *   { title, subtitle?, href, group?, icon? }
 *
 * Public API (window.VanduoSearch):
 *   register(source)                  Add a source. Throws on duplicate name.
 *   unregister(name)                  Remove a source. Returns boolean.
 *   list()                            Return registered sources (frozen array).
 *   query(text, options?)             Search every source in parallel.
 *                                      options: { signal?, limitPerSource? }
 *                                      Returns { sources: { name, results, error? }[] }
 */

(function () {
  'use strict';

  const DEFAULT_LIMIT = 10;

  const sources = new Map();

  function register(source) {
    if (!source || typeof source.name !== 'string' || source.name.length === 0) {
      throw new Error('VanduoSearch.register: source.name is required');
    }
    if (typeof source.fetch !== 'function') {
      throw new Error('VanduoSearch.register: source.fetch must be a function');
    }
    if (sources.has(source.name)) {
      throw new Error('VanduoSearch.register: source "' + source.name + '" already registered');
    }
    sources.set(source.name, Object.freeze({
      name: source.name,
      label: source.label || source.name,
      icon: source.icon || null,
      limit: typeof source.limit === 'number' ? source.limit : DEFAULT_LIMIT,
      fetch: source.fetch
    }));
  }

  function unregister(name) {
    return sources.delete(name);
  }

  function list() {
    return Object.freeze(Array.from(sources.values()));
  }

  function query(text, options) {
    options = options || {};
    const signal = options.signal;
    const limitPerSource = typeof options.limitPerSource === 'number'
      ? options.limitPerSource
      : null;
    const queryText = (text || '').trim();
    const allSources = Array.from(sources.values());

    if (queryText.length === 0) {
      return Promise.resolve({
        text: queryText,
        sources: allSources.map(function (src) {
          return { name: src.name, label: src.label, results: [] };
        })
      });
    }

    const promises = allSources.map(function (src) {
      const effectiveLimit = limitPerSource != null ? limitPerSource : src.limit;
      return Promise.resolve()
        .then(function () { return src.fetch(queryText, { signal: signal, limit: effectiveLimit }); })
        .then(function (results) {
          const safe = Array.isArray(results) ? results : [];
          return { name: src.name, label: src.label, results: safe };
        })
        .catch(function (error) {
          if (error && error.name === 'AbortError') throw error;
          return { name: src.name, label: src.label, results: [], error: error.message || 'fetch failed' };
        });
    });

    return Promise.all(promises).then(function (perSource) {
      return { text: queryText, sources: perSource };
    });
  }

  const Search = { register: register, unregister: unregister, list: list, query: query };

  if (typeof window !== 'undefined') {
    if (typeof window.Vanduo !== 'undefined' && typeof window.Vanduo.register === 'function') {
      window.Vanduo.register('search', Search);
    }
    window.VanduoSearch = Search;
  }
})();