## Why

Draggable elements (`.vd-draggable`, `.vd-draggable-item`, `.vd-draggable-container`, `.vd-drop-zone`) show visible light/white wedges at rounded corners when `border-radius` is scaled up via Theme Customizer `data-radius` presets. The opaque `background-color` paints to the default `border-box` clip region, bleeding past the visible border arc.

## What Changes

- Add `background-clip: padding-box` to four base draggable selectors in `css/components/draggable.css`
- Publish first OpenSpec capability spec for draggable corner rendering

## Capabilities

### New Capabilities

- `draggable`: Visual rendering requirement for rounded-corner background clipping

### Modified Capabilities

- (none — no prior published draggable OpenSpec spec)

## Impact

- **Semver:** Patch — CSS-only; no markup or JS API changes
- **Compatibility:** Existing `.vd-draggable*` markup and drag behavior unchanged
- `css/components/draggable.css` — four `background-clip` declarations
- `tests/components/draggable.spec.ts` — must continue to pass (no fixture changes)
- Docs repo consumes via `sync-framework-assets` after dist rebuild
