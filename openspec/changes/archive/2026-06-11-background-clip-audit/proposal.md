> **ABANDONED — 2026-07-25.** The Vanduo legacy (dual-engine) line was retired
> before this change shipped. It is kept here as a record of intent, not as work in
> progress. Development continues in the perspective line — `@vanduo-oss/vd3` and
> `@vanduo-oss/vd3-cbun`. See `openspec/changes/archive/retire-*` for the decision.

## Why

After fixing draggable corner bleed, we need automated verification of whether the same `background-clip: border-box` pattern affects other bordered components at `data-radius="0.5"`.

## What Changes

- Add Playwright background-clip audit fixture, helper, and `@audit` spec
- Write `test-results/background-clip-audit.json` report
- Fix `vd-input-group-prefix` / `vd-input-group-suffix` (Tier 2 visual bleed confirmed)

## Capabilities

### New Capabilities

- `background-clip-audit`: Automated Tier 1/Tier 2 corner bleed verification harness

### Modified Capabilities

- `draggable`: (already fixed in prior change)

## Impact

- `tests/fixtures/background-clip-audit.html`
- `tests/audit/background-clip-audit.ts`
- `tests/audit/background-clip-audit.spec.ts`
- `css/components/forms.css` — input-group addons only (Tier 2 confirmed)

## Audit findings

- **11 components** flagged Tier 1 `styleRisk` (latent same CSS pattern as draggable)
- **1 component** flagged Tier 2 `visualBleed`: `vd-input-group-prefix`
- **Controls pass**: `vd-draggable`, `vd-modal-content` (`padding-box`)
- **Negative control passes**: `vd-btn-primary` (matching border/bg)
- Other Tier 1 flags (inputs, dropdown, toast, etc.) did not meet Tier 2 threshold with current corner pixel probe on isolated dark background
