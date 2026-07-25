# Framework Popover Component — Tasks

- [x] 1. Create `framework/css/components/popover.css` with `.vd-popover-panel` base + size variants + arrow CSS for all four placements.
- [x] 2. Create `framework/js/components/popover.js` implementing `window.VanduoPopover` with `init/destroy/destroyAll/show/hide/flipPlacement`.
- [x] 3. Register the new CSS in `framework/css/vanduo.css` (after bubble import).
- [x] 4. Register the new JS module in `framework/js/index.js` (after spotlight import).
- [x] 5. Create `framework/tests/fixtures/popover.html` with click/hover/focus/top/large variants.
- [x] 6. Create `framework/tests/components/popover.spec.ts` covering rendering, ARIA, all triggers, placement, events, lifecycle.
- [x] 7. Create `framework/openspec/changes/framework-popover-component/specs/popover/spec.md` with normative requirements + scenarios.
- [x] 8. Run `pnpm test` and confirm all popover + search specs pass on Chromium Desktop.
- [x] 9. Run `pnpm run lint` and `pnpm run stylelint`.
- [x] 10. Bump framework version in `framework/package.json` to `1.6.0`; add CHANGELOG entry; publish.