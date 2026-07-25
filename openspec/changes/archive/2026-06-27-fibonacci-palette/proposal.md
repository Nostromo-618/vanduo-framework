> **ABANDONED — 2026-07-25.** The Vanduo legacy (dual-engine) line was retired
> before this change shipped. It is kept here as a record of intent, not as work in
> progress. Development continues in the perspective line — `@vanduo-oss/vd3` and
> `@vanduo-oss/vd3-cbun`. See `openspec/changes/archive/retire-*` for the decision.

## Why

The Vanduo framework is built on the Fibonacci / Golden-Ratio design
system, but its color palette is entirely Open Color — Fibonacci/phi only
shaped spacing, type, and grid. To make color a first-class part of the
brand, the framework should ship a **golden-angle generated** palette as
the default, while still supporting Open Color as an opt-in choice.

## What Changes

- Add `css/core/colors-fib-base.css` defining the raw scales for both
  palettes: `--vd-oc-<family>-<step>` (Open Color, today's values) and
  `--vd-fib-<family>-<step>` (the generated Fibonacci values, plus a
  `--vd-golden-1..8-*` accent track). Generated from the shared core
  generator so the two repos cannot drift.
- Update `css/core/colors.css` so the active raw scales
  `--vd-<family>-<step>` default to `var(--vd-fib-*)`, and add
  `[data-palette="open-color"]` / `[data-palette="fibonacci"]` switch
  blocks. The existing `[data-primary]` / `[data-neutral]` remaps and
  `[data-theme="dark"]` overrides keep working on the active scales.
- Make the hardcoded indigo RGB/alpha tokens in `css/core/tokens.css`
  palette-agnostic via `color-mix()` on the semantic `--vd-color-*` tokens.
- Add palette switching to `js/components/theme-customizer.js`
  (`applyPalette`, `data-palette`, storage key `vanduo-palette`,
  `DEFAULTS.PALETTE: 'fibonacci'`) and a palette toggle in the customizer
  UI (`css/components/theme-customizer.css`).
- Update `README.md` / `TOKENS.md`; keep the Open Color attribution in
  `THIRD-PARTY-LICENSES` (now the optional palette).

## Impact

- **Semver: minor.** Default colors change (visual diff), but the public
  `--vd-color-*` / `--vd-*` token API and `data-*` contract are preserved
  and extended. `data-toggle="theme"` consumers are unaffected.
- New Playwright fixture + spec (`palette-switch`). Existing color tests
  may need baseline/value refresh.
- No new runtime dependencies.

## Out of scope

- Migrating the framework to consume core's CSS directly (still deferred).
- Pushing branches / publishing.

## Linked changes

- `core/openspec/changes/fibonacci-palette/` — token source of truth + generator.
- `vd2/openspec/changes/fibonacci-palette/` — docs site + customizer selector.
