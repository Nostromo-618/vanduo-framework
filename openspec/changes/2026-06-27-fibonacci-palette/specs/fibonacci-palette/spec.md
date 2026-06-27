# Fibonacci palette (framework) — Spec

## Requirements

### R1 — Fibonacci is the default palette

The framework SHALL render the Fibonacci (golden-angle) palette by default.

#### Scenario: default active scales
- **Given** a document with no `data-palette` attribute
- **When** Vanduo CSS is applied
- **Then** each active `--vd-<family>-<step>` resolves to the
  corresponding `--vd-fib-<family>-<step>` value

### R2 — Open Color remains available

Open Color SHALL remain selectable at runtime via `data-palette`.

#### Scenario: switch to Open Color
- **Given** `document.documentElement` with `data-palette="open-color"`
- **Then** each active `--vd-<family>-<step>` resolves to the
  corresponding `--vd-oc-<family>-<step>` value

#### Scenario: namespaced scales always present
- **Given** the loaded framework CSS
- **Then** `--vd-oc-<family>-<step>` and `--vd-fib-<family>-<step>` are
  defined for every family regardless of the active palette

### R3 — Theming contract preserved

Existing theme controls SHALL keep working under either palette.

#### Scenario: primary remap under a palette
- **Given** `data-palette="open-color"` and `data-primary="red"`
- **Then** `--vd-color-primary` resolves to the Open Color red scale

#### Scenario: dark mode under default palette
- **Given** `data-theme="dark"` and the default palette
- **Then** the dark-mode semantic overrides apply over Fibonacci values

### R4 — Customizer palette control

`Vanduo.themeCustomizer` SHALL expose palette selection.

#### Scenario: apply + persist
- **Given** an initialized customizer
- **When** `applyPalette('open-color')` runs
- **Then** `data-palette="open-color"` is set on the root
- **And** the choice is stored under `vanduo-palette` and restored on reload

#### Scenario: default palette
- **Given** no stored preference
- **Then** the effective palette is `fibonacci`
