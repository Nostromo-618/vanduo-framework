## Why

The navbar theme toggle cycles through system → light → dark on every click, which can accidentally flash an unwanted theme (e.g. light while the user prefers dark). A compact icon-only dropdown lets users pick explicitly without surprise. v1.4.4 ships this as the recommended UX while keeping the cycle button as a documented variant.

## What Changes

- Add **menu variant** (`.vd-theme-switcher[data-theme-ui="menu"]`) — toggle opens icon-only menu; option click applies theme immediately
- Add **theme-switcher.css** for menu layout, active state, and right-aligned navbar positioning
- Move icon/label sync from docs into framework `updateUI` for menu variant
- Integrate **tooltips** via existing `data-tooltip` on toggle and menu options
- Keep **cycle variant** (`button[data-toggle="theme"]`) and **select variant** unchanged
- Extend Playwright tests and fixture for menu behavior
- Bump version to 1.4.4

## Capabilities

### New Capabilities

- `theme-switcher`: Menu variant UI, ARIA, keyboard nav, tooltips, and CSS API for theme selection

### Modified Capabilities

- (none — no prior published OpenSpec specs)

## Impact

- `js/components/theme-switcher.js` — menu binding, keyboard, outside-click
- `css/components/theme-switcher.css` — new file
- `css/vanduo.css` — import
- `tests/fixtures/theme-switcher.html`, `tests/components/theme-switcher.spec.ts`
- Docs repo consumes via sync-framework-assets (navbar + doc page)
