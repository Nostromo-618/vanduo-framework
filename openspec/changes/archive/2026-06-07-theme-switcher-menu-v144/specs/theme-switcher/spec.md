# theme-switcher Specification

## Purpose

Lightweight theme preference UI (system, light, dark) with persistence, ThemeCustomizer coordination, and multiple UI variants including the recommended icon-only menu.

## Requirements

### Requirement: Preference persistence

The ThemeSwitcher SHALL persist preference to `localStorage` key `vanduo-theme-preference` with values `system`, `light`, or `dark`.

#### Scenario: Default preference

- GIVEN no stored preference
- WHEN ThemeSwitcher initializes
- THEN preference is `system`

#### Scenario: Restore on reload

- GIVEN stored preference `dark`
- WHEN the page reloads and Vanduo.init runs
- THEN `document.documentElement` has `data-theme="dark"`

### Requirement: Menu variant toggle behavior

Elements matching `.vd-theme-switcher[data-theme-ui="menu"]` SHALL open a menu on toggle click without changing theme.

#### Scenario: Toggle opens menu

- GIVEN preference is `dark` and menu is closed
- WHEN the user clicks `.vd-theme-switcher-toggle`
- THEN the menu has class `is-open`
- AND `data-theme` remains `dark`
- AND toggle has `aria-expanded="true"`

#### Scenario: Toggle does not cycle theme

- GIVEN preference is `dark`
- WHEN the user clicks `.vd-theme-switcher-toggle` once
- THEN preference remains `dark`

### Requirement: Menu variant selection

Menu options with `data-theme-value` SHALL apply theme immediately and close the menu.

#### Scenario: Select light from menu

- GIVEN menu is open and preference is `system`
- WHEN the user clicks the option with `data-theme-value="light"`
- THEN preference becomes `light`
- AND `document.documentElement` has `data-theme="light"`
- AND the menu closes

#### Scenario: Active option state

- GIVEN preference is `light`
- WHEN updateUI runs
- THEN the light option has class `is-active` and `aria-checked="true"`

### Requirement: Menu variant icon and labels

The toggle icon and accessible name SHALL reflect the current preference.

#### Scenario: Icon updates for dark

- GIVEN preference is `dark`
- WHEN updateUI runs
- THEN `[data-theme-icon]` reflects the dark icon mapping
- AND toggle `aria-label` includes "Dark"

### Requirement: Menu keyboard accessibility

The menu variant SHALL support keyboard operation.

#### Scenario: Escape closes menu

- GIVEN menu is open
- WHEN the user presses Escape
- THEN the menu closes and focus returns to the toggle

#### Scenario: Arrow navigation

- GIVEN menu is open
- WHEN the user presses ArrowDown
- THEN focus moves to the next menu option

### Requirement: Cycle variant (unchanged)

`button[data-toggle="theme"]` outside a menu wrapper SHALL cycle system → light → dark → system on click.

#### Scenario: Button cycle

- GIVEN preference is `system`
- WHEN the user clicks the cycle button
- THEN preference becomes `light`

### Requirement: Select variant (unchanged)

`select[data-toggle="theme"]` SHALL set preference on change event.

#### Scenario: Select change

- GIVEN a theme select
- WHEN the user selects `dark`
- THEN preference becomes `dark`

### Requirement: Tooltips

Menu toggle and options with `data-tooltip` SHALL be initialized by the Tooltips component after menu binding.

#### Scenario: Tooltip attributes present

- GIVEN a menu variant with `data-tooltip` on toggle and options
- WHEN renderUI completes
- THEN Tooltips.init is called on the switcher root
