# Framework Search Helper — Design

## Source shape

```ts
type Source = {
  name: string;          // unique key (e.g. 'sections')
  label?: string;        // display name in result groups (default = name)
  icon?: string;         // optional Phosphor class for the group header
  limit?: number;        // max results per source (default 10)
  fetch: (query, opts) => Promise<Result[]>;
};

type Result = {
  title: string;         // required
  subtitle?: string;     // optional secondary line
  href: string;          // navigation target
  group?: string;        // optional override of source label
  icon?: string;         // optional icon override
};

type FetchOptions = {
  signal?: AbortSignal;  // pass-through for cancellation
  limit?: number;        // resolved limit (caller may override per-query)
};
```

## API contract

```ts
window.VanduoSearch.register(source): void      // throws on duplicate / invalid
window.VanduoSearch.unregister(name): boolean   // true if removed, false if absent
window.VanduoSearch.list(): ReadonlyArray<Source>
window.VanduoSearch.query(text, options?): Promise<{
  text: string,
  sources: Array<{ name: string, label: string, results: Result[], error?: string }>
}>
```

## Query semantics

- `query()` runs every registered source in parallel.
- Each source's `fetch()` is called with the trimmed query text and `{ signal, limit }`.
- A rejected promise from a source is **captured** as `source.error` rather than rejecting the whole query — the rest of the results still come back.
- If the trimmed query is empty, `query()` short-circuits to a per-source empty `results` array (no fetch calls fire).
- Per-query `limitPerSource` overrides the source-level `limit` for that call only.

## Error handling

- `register()` throws synchronously for invalid input (missing `name` or `fetch`).
- `query()` captures async failures per-source; only `AbortError` propagates (caller's responsibility to attach a signal).

## Lifecycle

The registry is process-global (no destroy). The framework does NOT manage source lifetimes; consumers register on mount and unregister on unmount as appropriate.