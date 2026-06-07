## 1. Framework CSS

- [x] 1.1 Create `css/components/theme-switcher.css`
- [x] 1.2 Import in `css/vanduo.css`

## 2. Framework JS

- [x] 2.1 Extend `theme-switcher.js` with menu variant detection and binding
- [x] 2.2 Implement open/close, outside click, Escape, arrow keys
- [x] 2.3 Icon sync via `[data-theme-icon]` and aria-label/tooltip updates
- [x] 2.4 Tooltips.init on switcher root after bind
- [x] 2.5 destroyAll cleanup for menu instances

## 3. Tests

- [x] 3.1 Add menu fixture to `tests/fixtures/theme-switcher.html`
- [x] 3.2 Add Playwright tests for menu open/select/persistence
- [x] 3.3 Verify cycle and select regression tests pass

## 4. Build

- [x] 4.1 Run `pnpm run build:min`
- [x] 4.2 Run `pnpm run check:versions` (after version bump)

## 5. Docs (separate repo)

- [x] 5.1 sync-framework-assets
- [x] 5.2 Navbar + templates menu markup
- [x] 5.3 Rewrite theme-switcher doc page live demo
- [x] 5.4 Remove initDarkModeToggleIconSync and demo-btn handler
