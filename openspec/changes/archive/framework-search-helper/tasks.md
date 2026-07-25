# Framework Search Helper — Tasks

- [x] 1. Create `framework/js/components/search.js` implementing `window.VanduoSearch` with `register/unregister/list/query`.
- [x] 2. Register the new JS module in `framework/js/index.js` (after popover import).
- [x] 3. Create `framework/tests/fixtures/search.html` with two registered sources.
- [x] 4. Create `framework/tests/components/search.spec.ts` covering register validation, list, query (empty + non-empty), per-source limit, error capture, unregister.
- [x] 5. Create `framework/openspec/changes/framework-search-helper/specs/search-helper/spec.md`.
- [x] 6. Run `pnpm test` and confirm search specs pass on Chromium Desktop.
- [x] 7. Run `pnpm run lint`.
- [x] 8. Ship with framework `1.6.0`.