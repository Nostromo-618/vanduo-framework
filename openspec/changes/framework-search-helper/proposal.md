# Framework Search Helper — Proposal

## Why

The framework ships a global search overlay (`js/components/doc-search.js`) but no public API for consumers to register **their own data sources** with a search overlay. vd2's `GlobalSearchModal` currently hand-rolls its registry, and the legacy docs `docs/sections/interactive/search.html` documents a `VdSearch` data-source pattern that does not exist as a framework primitive.

## What

Add a `search` helper:

- `framework/js/components/search.js` — small registry exposing `window.VanduoSearch` with `register(source)`, `unregister(name)`, `list()`, `query(text, options?)`. Sources return `Promise<Result[]>`; results are merged across sources.
- `framework/js/index.js` — register the new side-effect module.
- `framework/tests/fixtures/search.html` — fixture used by `tests/components/search.spec.ts`.
- `framework/tests/components/search.spec.ts` — Playwright component spec covering register/unregister/list/query, error capture, per-source limit.

## Scope

In scope:

- The registry + query API.
- Tests + fixture.
- OpenSpec specs.

Out of scope:

- Any UI (no overlay ships in the framework; vd2's `GlobalSearchModal` and docs' `js/app.js` overlay are the UIs that consume the registry).
- Keyboard shortcut handling (the overlay owns that).
- Result dedup across sources (caller responsibility; trivial if needed).

## Rollout

1. Land framework changes; release with framework `1.6.0`.
2. vd2 branch `vd2-capability-completion` registers `sections`, `guides`, `ecosystem` sources on app mount.