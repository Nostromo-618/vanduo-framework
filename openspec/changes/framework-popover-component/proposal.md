# Framework Popover Component — Proposal

## Why

The framework already ships `.vd-bubble` (click-only rich HTML popover, see `js/components/bubble.js`) but the docs catalog `docs/sections/components/popover.html` documents a **separate, more general primitive** with three triggers (click, hover, focus), auto-placement flip, and external-panel composition. The legacy docs page is referenced from `openspec/specs/theme-switcher-consumer/` and other consumer specs as the canonical popover primitive.

## What

Add a new `popover` component:

- `framework/css/components/popover.css` — `.vd-popover-panel` base + `.vd-popover-sm` / `.vd-popover-lg` size variants; arrow positioned via `data-placement`. Reuses `--vd-card-bg`, `--vd-text-primary`, `--vd-border-color`, `--vd-border-radius`, `--vd-font-size-sm`.
- `framework/js/components/popover.js` — `window.VanduoPopover` with `init / destroy / destroyAll / show / hide / flipPlacement`. Triggers supported: `click`, `hover`, `focus` (combinable via space-separated `data-vd-popover-trigger`). Placement flip on viewport overflow (toggleable via `data-vd-popover-flip="false"`).
- `framework/css/vanduo.css` — add `@import url('components/popover.css')` after the bubble import.
- `framework/js/index.js` — register the new side-effect module.
- `framework/tests/fixtures/popover.html` — fixture used by `tests/components/popover.spec.ts`.
- `framework/tests/components/popover.spec.ts` — Playwright component spec covering rendering, ARIA, all triggers, placement, flip, events, lifecycle.

## Scope

In scope:

- The popover component itself.
- Tests + fixture.
- OpenSpec specs/ folder (normative acceptance).

Out of scope:

- Replacing `.vd-bubble` (kept for backward compatibility; bubble remains the click-only rich HTML primitive).
- Any visual redesign of bubble.
- vh-popover aliases (the legacy `data-vd-popover-*` attributes are NOT aliased — `.vd-popover-trigger` is the canonical class).

## Rollout

1. Land framework changes; bump framework to `1.6.0`; publish to CDN.
2. vd2 branch `vd2-capability-completion` consumes `1.6.0` for the popover page.