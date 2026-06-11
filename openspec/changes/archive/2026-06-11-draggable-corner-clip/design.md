## Context

Draggable components use `border-radius: var(--vd-btn-border-radius)` with opaque or semi-transparent `background-color` and thin borders. At `data-radius="0.5"`, `--vd-radius-fib-5` scales to `0.625rem` (10px), making the default `background-clip: border-box` corner bleed highly visible — especially in light theme where `--vd-draggable-bg` is `--vd-color-white`.

## Goals / Non-Goals

**Goals:**

- Constrain background paint to inside the padding edge on all four draggable surface selectors
- Match existing framework precedent (`.vd-modal-content` uses `background-clip: padding-box`)
- Preserve drag ghost, box-shadow, transform, and focus outline behavior

**Non-Goals:**

- Framework-wide audit of alerts, buttons, chips, etc.
- `overflow: hidden` on `.vd-draggable-container`
- New Playwright visual-regression tests

## Decisions

### 1. Use `background-clip: padding-box`

Constrains background to the padding box, which follows `border-radius` curvature without clipping children, shadows, or scaled drag states.

### 2. Do not add `overflow: hidden` on containers

Dragging state applies `transform: scale(1.02)`, `box-shadow`, and `z-index: 1000`. Container clipping could truncate these affordances. Per-element `background-clip` fixes the reported issue independently.

### 3. Apply on base rules only

`:hover`, `.is-dragging`, and `[aria-grabbed="true"]` only override `background-color`; `background-clip` inherits from the base selector.

## Precedent

- `css/components/modals.css` — `.vd-modal-content { background-clip: padding-box; }`
- `css/components/cards.css` — intentionally uses `border-box` for card surfaces (different visual intent)
