## Context

Theme Switcher is JS-only today with two UI bindings: cycle button and native select. Docs navbar uses cycle button with docs-only icon sync in `app.js`. Dropdown component exists but adds markup weight; menu is self-contained in ThemeSwitcher for ~3KB footprint.

## Goals / Non-Goals

**Goals:**
- Toggle click opens menu without changing theme
- Menu option click calls `setPreference()` and closes menu
- Icon reflects current preference; active option highlighted
- Tooltips on toggle and options
- Keyboard: Escape, arrows, Enter/Space
- Backward compatible cycle and select variants

**Non-Goals:**
- Replacing ThemeCustomizer
- Icon library dependency (consumer supplies Phosphor or any icon markup)
- Navbar.js built-in hook (consumers add markup manually)

## Decisions

### 1. Markup contract

```html
<div class="vd-theme-switcher vd-theme-switcher-menu-end" data-theme-ui="menu">
  <button type="button" class="vd-theme-switcher-toggle" aria-label="Theme: System" data-tooltip="Theme: System">
    <i class="ph ph-desktop" data-theme-icon aria-hidden="true"></i>
  </button>
  <div class="vd-theme-switcher-menu" role="menu" aria-hidden="true">
    <button type="button" role="menuitemradio" data-theme-value="system" data-tooltip="Use system preference" aria-checked="true">
      <i class="ph ph-desktop" aria-hidden="true"></i>
    </button>
    <!-- light, dark -->
  </div>
</div>
```

Detection: `.vd-theme-switcher[data-theme-ui="menu"]`. Cycle: `button[data-toggle="theme"]` not inside menu wrapper.

### 2. Icon sync

Framework updates `[data-theme-icon]` className from a built-in map (desktop/sun/moon Phosphor classes). Consumers may override icons in HTML; JS updates class on the icon element only.

### 3. Self-contained menu JS

Reuse patterns from dropdown.js (outside click, Escape, aria-expanded) inline — no init-order dependency on Dropdown component.

### 4. Tooltips

After menu bind, call `Vanduo.getComponent('tooltips')?.init(switcherElement)` so `data-tooltip` on toggle and options works.

### 5. CSS

New `theme-switcher.css` with tokens aligned to dropdown.css. `.vd-theme-switcher-menu-end` right-aligns menu for navbar.

## Risks / Trade-offs

- **Icon class assumptions** — Default map uses Phosphor `ph ph-*`; documented as convention, not required
- **Tooltip re-init** — Menu nodes exist at init; single init per switcher is sufficient

## Migration

Existing `data-toggle="theme"` buttons unchanged. Docs migrate navbar to menu markup and remove `initDarkModeToggleIconSync`.
