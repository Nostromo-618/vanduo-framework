# Framework Popover Component — Design

## Class & attribute contract

```html
<button class="vd-popover-trigger"
        data-vd-popover-target="#my-panel"
        data-vd-popover-placement="top|bottom|left|right"
        data-vd-popover-trigger="click|hover|focus"
        data-vd-popover-flip="true|false">
  Trigger
</button>
<div id="my-panel" class="vd-popover-panel" role="dialog" hidden>
  Panel content (any HTML)
</div>
```

The panel element is **authored in the DOM** (not generated) so consumers retain full control over its content and can compose it from framework primitives (cards, forms, etc.). `init()` finds the panel via `data-vd-popover-target` selector, adds `.vd-popover-panel` if missing, and wires the trigger.

## Placement algorithm

1. On `show()`, position is computed using the trigger's bounding rect + requested `data-vd-popover-placement` and `DEFAULT_GAP = 8px`.
2. Position is clamped to `8px` viewport padding minimum.
3. On `resize` / `scroll`, `flipPlacement()` checks whether the **current** placement would overflow. If so, it flips to the opposite axis (`top ↔ bottom`, `left ↔ right`). It does NOT cycle through all placements — only one flip is attempted.
4. Setting `data-vd-popover-flip="false"` disables auto-flip.

## Trigger model

`data-vd-popover-trigger` accepts a space-separated list. Valid tokens: `click`, `hover`, `focus`. Default (when attribute is missing) is `click focus` (matches button semantics). Multiple triggers can be combined:

- `data-vd-popover-trigger="hover focus"` — both `mouseenter` and `focus` open the panel.
- `data-vd-popover-trigger="click focus"` — focus opens but click does NOT toggle; this is the default combo.

For `hover`, a 80 ms grace period on `mouseleave` lets the cursor cross the gap between trigger and panel without closing it. The grace period is reset by either trigger or panel `mouseenter`.

## Lifecycle integration

`window.VanduoPopover.init(root)` is idempotent — calling it twice on the same trigger is a no-op (instances Map keyed by trigger element). `destroyAll(root)` accepts an optional root selector to scope teardown.

The component registers itself with `window.Vanduo.register('popover', Popover)` so framework consumers using the scoped `Vanduo.init(root)` / `Vanduo.destroy(root)` API automatically get popover lifecycle for free.

## ARIA

- Trigger: `aria-haspopup="dialog"`, `aria-expanded="false|true"`, `aria-controls="<panel-id>"`.
- Panel: `role="dialog"` (default; consumer can override), `aria-modal="false"`.
- Events: `popover:show` and `popover:hide` are dispatched on the trigger, bubbling.

## Security

Popover panels use `textContent` semantics by default (caller-supplied DOM). If a consumer must inject HTML, they are responsible for sanitization — the framework does NOT add an HTML escape layer because panels are authored DOM. This mirrors the bubble component's posture.

## Out of scope (deferred)

- Animation preference media query (`prefers-reduced-motion`). The `vd-popover-enter` keyframe is short (180 ms) and could be conditional in a future release.
- Touch gesture support (long-press to open) — mobile currently uses tap-on-button only.