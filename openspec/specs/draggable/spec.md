# draggable Specification

## Purpose

Draggable UI surfaces (items, containers, drop zones) with rounded borders and opaque or semi-transparent backgrounds.

## Requirements

### Requirement: Rounded-corner background clipping

Elements `.vd-draggable`, `.vd-draggable-item`, `.vd-draggable-container`, and `.vd-drop-zone` SHALL use `background-clip: padding-box` so backgrounds do not bleed past the rounded border arc at any `data-radius` preset.

#### Scenario: Large radius preset on contrasting background

- GIVEN `data-radius="0.5"` on `document.documentElement`
- AND a `.vd-draggable` rendered on a contrasting page background
- WHEN the element is painted
- THEN no visible background fill SHALL appear outside the rounded border arc

#### Scenario: Drop zone with dashed border

- GIVEN a `.vd-drop-zone` with semi-transparent `background-color` and dashed border
- WHEN the element is painted at any radius preset
- THEN the background SHALL be clipped inside the padding edge
- AND the dashed border SHALL remain fully visible

#### Scenario: Dragging state inherits clip

- GIVEN a `.vd-draggable-item` with class `is-dragging`
- WHEN the dragging background color is applied
- THEN `background-clip: padding-box` SHALL still apply (inherited from base rule)
