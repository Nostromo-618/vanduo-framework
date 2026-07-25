# Popover

## Purpose

General-purpose popover primitive with multi-trigger support (click, hover, focus), auto-placement flip on viewport overflow, and externally-authored panel DOM. Sibling to `.vd-bubble` (click-only rich HTML); this is the canonical popover documented in `docs/sections/components/popover.html`.

## Requirements

### Requirement: Trigger element wiring

The system SHALL mark every element matching `.vd-popover-trigger` inside the init root with `aria-haspopup="dialog"`, `aria-expanded="false"`, and `aria-controls="<panel-id>"` during init.

#### Scenario: Trigger gains ARIA on init
- **WHEN** `VanduoPopover.init()` runs against a root containing `.vd-popover-trigger` with `data-vd-popover-target` pointing to an existing element
- **THEN** the trigger has `aria-haspopup="dialog"`, `aria-expanded="false"`, and `aria-controls` equal to the resolved panel's `id`

### Requirement: Panel identification

The system SHALL resolve the panel element by reading `data-vd-popover-target` as a CSS selector and locating it in the trigger's owner document. If the resolved element does not have `.vd-popover-panel`, the system SHALL add the class.

#### Scenario: Missing target selector
- **WHEN** a trigger has no `data-vd-popover-target`
- **THEN** initInstance MUST skip that trigger without throwing

#### Scenario: External panel gets `.vd-popover-panel`
- **WHEN** a trigger's target is a `<div>` without `.vd-popover-panel`
- **THEN** after init the resolved panel element has class `.vd-popover-panel`

### Requirement: Click trigger

The system SHALL open the panel on the first click of a click-triggered trigger and close it on the second click. The trigger's `aria-expanded` MUST toggle between `"false"` and `"true"` accordingly.

#### Scenario: Click opens
- **WHEN** the user clicks a click-triggered trigger whose panel is hidden
- **THEN** the panel becomes visible and the trigger's `aria-expanded` is `"true"`

#### Scenario: Click closes (toggle)
- **WHEN** the user clicks a click-triggered trigger whose panel is visible
- **THEN** the panel becomes hidden and the trigger's `aria-expanded` is `"false"`

### Requirement: Outside-click dismissal

The system SHALL close the visible click-triggered popover when the user clicks anywhere outside both the trigger and the panel.

#### Scenario: Outside click closes
- **WHEN** a click-triggered popover is open and the user clicks an element that is not the trigger and is not inside the panel
- **THEN** the panel becomes hidden

### Requirement: Escape dismissal

The system SHALL close the most recently opened popover when the user presses Escape. If no popover is open, Escape SHALL be a no-op.

#### Scenario: Escape closes visible popover
- **WHEN** a popover is open and the user presses Escape
- **THEN** the visible popover becomes hidden

### Requirement: Hover trigger

The system SHALL open the panel when the cursor enters a hover-triggered trigger and close it 80 ms after the cursor leaves both the trigger and the panel. The 80 ms grace period MUST allow the cursor to cross the gap between trigger and panel without flicker.

#### Scenario: Hover opens
- **WHEN** the cursor enters a `data-vd-popover-trigger="hover"` trigger
- **THEN** the panel becomes visible

#### Scenario: Hover-out closes after grace period
- **WHEN** the cursor leaves both the trigger and the panel
- **THEN** after 80 ms the panel becomes hidden

### Requirement: Focus trigger

The system SHALL open the panel when the trigger gains focus and close it when the trigger loses focus, unless focus moves into the panel.

#### Scenario: Focus opens
- **WHEN** the trigger receives focus
- **THEN** the panel becomes visible

#### Scenario: Blur to outside closes
- **WHEN** the trigger loses focus and the new focus target is not inside the panel
- **THEN** the panel becomes hidden

### Requirement: Placement positioning

The system SHALL position the panel relative to the trigger using the requested placement (`top` | `bottom` | `left` | `right`, default `bottom`) with an 8 px gap. The position SHALL be clamped to at least 8 px from the viewport edges.

#### Scenario: Default bottom placement
- **WHEN** `data-vd-popover-placement` is unset and the panel is shown
- **THEN** the panel's `data-placement` attribute is `"bottom"` and its computed top is below the trigger's bottom

### Requirement: Placement flip on overflow

When `data-vd-popover-flip` is unset or `"true"` and the panel is visible, the system SHALL flip the placement to the opposite axis (`top ↔ bottom`, `left ↔ right`) if the current placement would overflow the viewport on resize or scroll.

#### Scenario: Bottom placement flips when trigger is near the bottom edge
- **WHEN** the trigger is in the bottom 20 % of the viewport with `placement="bottom"`
- **AND** the user scrolls the page
- **THEN** the panel's `data-placement` becomes `"top"`

### Requirement: Event emission

The system SHALL dispatch a bubbling `popover:show` event on the trigger when the panel opens and a `popover:hide` event when the panel closes. The `popover:show` event detail MUST include the resolved placement.

#### Scenario: popover:show event
- **WHEN** the panel opens
- **THEN** a `popover:show` event fires on the trigger with `detail.placement` set

### Requirement: Lifecycle cleanup

`destroyAll(root)` SHALL tear down every instance whose trigger is contained by `root` (when provided), remove document-level listeners, and clear the global cleanups list when no instances remain.

#### Scenario: Destroy prevents future show
- **WHEN** `destroyAll()` runs against a click trigger
- **AND** the user subsequently clicks the trigger
- **THEN** the panel does not open

### Requirement: Idempotent init

`init()` SHALL be safe to call multiple times on the same trigger — each trigger has at most one instance.

#### Scenario: Double init
- **WHEN** `init()` runs twice against a root containing the same trigger
- **THEN** the trigger still has exactly one set of listeners

## Out of Scope

- Long-press touch gesture support (mobile currently uses tap-on-button only).
- `prefers-reduced-motion` conditional animation (the 180 ms enter animation is short; could be added later).
- HTML sanitization on panel content (panels are authored DOM; consumers control content).