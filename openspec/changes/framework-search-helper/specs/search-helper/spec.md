# Search Helper

## Purpose

Process-global registry that lets consumers plug named data sources into a search overlay. The framework ships no UI — overlays consume the registry.

## Requirements

### Requirement: Register a source

`register(source)` SHALL add a source to the registry. The source MUST have a non-empty `name` string and a `fetch` function. The registered entry SHALL be frozen so consumers cannot mutate it.

#### Scenario: Valid registration
- **WHEN** `register({ name: 'sections', fetch: async () => [] })` is called
- **THEN** `list()` includes the source

#### Scenario: Duplicate registration
- **WHEN** `register()` is called twice with the same `name`
- **THEN** the second call throws an error containing the text `"already registered"`

#### Scenario: Missing name
- **WHEN** `register({ fetch: ... })` is called without `name`
- **THEN** the call throws `"source.name is required"`

#### Scenario: Missing fetch
- **WHEN** `register({ name: 'x' })` is called without `fetch`
- **THEN** the call throws `"source.fetch must be a function"`

### Requirement: Unregister

`unregister(name)` SHALL remove a source by name and return `true`. If the source is not present, it SHALL return `false`.

#### Scenario: Remove existing
- **WHEN** a source with the given name is registered and `unregister(name)` is called
- **THEN** the source is removed and the return value is `true`

#### Scenario: Remove absent
- **WHEN** `unregister(name)` is called for a name that is not registered
- **THEN** the return value is `false` and no error is thrown

### Requirement: List is read-only

`list()` SHALL return a frozen array of frozen source objects.

#### Scenario: list() returns frozen array
- **WHEN** `list()` is called
- **THEN** the returned array and each entry is `Object.isFrozen`

### Requirement: Query fans out to every source

`query(text, options?)` SHALL run the trimmed `text` through every registered source's `fetch` in parallel and return `{ text, sources }` where `sources[i]` contains `{ name, label, results }` for source `i`. The text passed to `fetch` SHALL be the trimmed input.

#### Scenario: Empty query short-circuits
- **WHEN** `query('   ')` is called
- **THEN** no `fetch` is invoked and every source's `results` is `[]`

#### Scenario: Non-empty query fans out
- **WHEN** `query('button')` is called with N registered sources
- **THEN** every source's `fetch` is called once with `'button'` (trimmed) and the returned results are merged into `sources[i].results`

### Requirement: Per-source limit caps results

The system SHALL pass a `limit` option to each `fetch` call. The limit defaults to the source's `limit` (or 10 if unset). If `options.limitPerSource` is provided, that value overrides the source-level limit for the query only.

#### Scenario: Default limit
- **WHEN** a source is registered with `limit: 5` and `query(text)` is called
- **THEN** that source's `fetch` is called with `{ limit: 5 }`

#### Scenario: Per-query override
- **WHEN** `query(text, { limitPerSource: 2 })` is called
- **THEN** every source's `fetch` is called with `{ limit: 2 }`

### Requirement: Source failures are captured

When a source's `fetch` rejects, the rejection MUST be captured as `sources[i].error` and MUST NOT reject the `query()` promise.

#### Scenario: One source rejects
- **WHEN** source A succeeds and source B rejects with `Error('boom')`
- **THEN** the resolved value has `sources[A].results` populated and `sources[B].error === 'boom'`

### Requirement: AbortError propagation

When a source's `fetch` rejects with an `AbortError` (name === `'AbortError'`), the `query()` promise SHALL reject with the same error. Other rejection reasons SHALL be captured per-source.

#### Scenario: AbortError rejects the whole query
- **WHEN** a source's `fetch` rejects with an `AbortError`
- **THEN** the `query()` promise rejects with the same `AbortError`

## Out of Scope

- UI / overlay.
- Keyboard shortcut handling (overlay-owned).
- Result deduplication across sources.
- Async-result streaming (the full `Promise.all` result is delivered at once).