# Tasks

## 1. CSS

- [ ] 1.1 Add `css/core/colors-fib-base.css` (`--vd-oc-*`, `--vd-fib-*`,
      `--vd-golden-*`), generated from the shared core generator.
- [ ] 1.2 `@import` the base partial before `colors.css` in
      `css/vanduo.css`.
- [ ] 1.3 In `css/core/colors.css`: default active scales to
      `var(--vd-fib-*)`, add `[data-palette]` switch blocks ahead of the
      `[data-primary]` / `[data-neutral]` remaps, add fib variants for the
      hardcoded `amber` / `black` primary scales.
- [ ] 1.4 In `css/core/tokens.css`: replace hardcoded indigo RGB/alpha
      tokens with palette-agnostic `color-mix()` equivalents.

## 2. JS + UI

- [ ] 2.1 `js/components/theme-customizer.js`: add `applyPalette`,
      `DEFAULTS.PALETTE: 'fibonacci'`, storage key `vanduo-palette`,
      load/persist on init.
- [ ] 2.2 `css/components/theme-customizer.css`: palette toggle styles.

## 3. Docs

- [ ] 3.1 Update `README.md` and `TOKENS.md` (Fibonacci default,
      Open Color optional, `data-palette` contract).

## 4. Tests

- [ ] 4.1 Add `tests/fixtures/palette-switch.html`.
- [ ] 4.2 Add `tests/components/palette-switch.spec.ts` (default fib,
      switch to Open Color, persistence, `@a11y` contrast).
- [ ] 4.3 `pnpm build:min` and `pnpm test` green.
