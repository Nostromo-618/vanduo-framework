# Changelog

All notable changes to the Vanduo Framework are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Full release notes — covering the framework, the documentation site, and
ecosystem packages side by side — live at <https://vanduo.dev/#changelog>.

## [2.0.0] - 2026-06-27

Major release. Adds the Popover and Search primitives and promotes the
Fibonacci palette to the default; contains breaking changes — review before
upgrading.

### Added
- **Popover component** (`window.VanduoPopover`) — a general popover primitive separate from `.vd-bubble`: click / hover / focus triggers (combinable via `data-vd-popover-trigger`), external-panel composition through `data-vd-popover-target`, `.vd-popover-sm` / `.vd-popover-lg` size variants, and auto-placement flip on viewport overflow (`data-vd-popover-flip`). New `css/components/popover.css` + `js/components/popover.js`, wired into `css/vanduo.css` and `js/index.js`. Playwright spec at `tests/components/popover.spec.ts`.
- **Search helper** (`window.VanduoSearch`) — a registry so consumers can register their own data sources: `register(source)` / `unregister(name)` / `list()` / `query(text, options?)`. Sources return `Promise<Result[]>`; results merge across sources with an optional per-source limit. New `js/components/search.js`; spec at `tests/components/search.spec.ts`.

### Changed
- **BREAKING — Fibonacci palette is the default.** The golden-angle (Fibonacci) palette now ships as the out-of-the-box look, switchable at runtime via `data-palette`. Set `data-palette="open-color"` on `<html>` to restore the previous defaults.
- Dependencies updated to latest; pnpm config migrated to `pnpm-workspace.yaml`.

### Security
- **BREAKING — `sanitizeHtml` denies inline `style` by default.** Rich HTML passed to Bubble / Popover now has `style` attributes stripped unless explicitly allowed, closing an attribute-injection vector. Move inline styles to classes.
- `escapeHtml` is now quote-safe for attribute contexts.

## [1.5.1] - 2026-06-20

### Enhanced
- **Expanding Cards — mobile** — Below `768px`, panels stack vertically and expand in place using the same flex-grow redistribution as the desktop strip (replacing progressive hide and non-animatable `order` reorder). Inactive rows render as compact stripes with icon + title; labels and subtitles transition smoothly. `ArrowUp`/`ArrowDown` keyboard navigation added alongside left/right.

### Fixed
- **Expanding Cards — photo backgrounds** — Active panels use `background-size: cover` and `background-repeat: no-repeat` so wide expanded cards no longer show tiled repeats on the sides.
- **Expanding Cards — mobile polish** — Resolved mobile layout overflow clipping and keyboard focus edge cases.

## [1.5.0] - 2026-06-18

### Added
- **Layout primitives** — CSS-only `.vd-box`, `.vd-stack`, `.vd-inline`, `.vd-center`, `.vd-frame` (golden-ratio aspect box), `.vd-cover`, and `.vd-switcher` (responsive row→column without a media query) containers (`css/primitives/primitives.css`) with a `data-*` API consuming the existing Fibonacci spacing/radius and semantic tokens. The composition layer between utilities and components; zero JS, no new public tokens. Unit specs in `tests/unit/primitives.spec.ts`.

### Removed
- **Hex grid source** (`js/components/vd-hex.js`, `js/utils/hex-math.js`) and its tests. `VdHexGrid` was never bundled; it now ships solely as the standalone `@vanduo-oss/hex-grid` package.

### Changed
- Removed the unused empty `packages/` workspace and `pnpm-workspace.yaml` (the esbuild build-approval remains in `package.json` `pnpm.allowedBuilds`).

## [1.4.6] - 2026-06-12

### Added
- Hand-written `dist/vanduo.d.ts` declaring the `Vanduo` runtime, exposed via the package `types` field.
- No-icons `vanduo-core.css` / `vanduo-core.min.css` build artifact (`@vanduo-oss/framework/css/core`) for consumers who ship their own icon set.
- This `CHANGELOG.md`.
- Playwright regression coverage for the parallax component and the print stylesheet.

### Changed
- `css/vanduo.css` now bundles only the `regular` + `fill` icon weights, cutting the minified stylesheet ~47%. Import `css/icons/icons-all.css` for all six weights.
- The build now ships only the icon weights the bundle references into `dist/icons/`; the full six-weight set still ships under `icons/` for `icons-all.css` consumers.
- `check:versions` now also validates `README.md`, `SECURITY.md`, `llms.txt`, and this changelog — not just the dist banners.

### Fixed
- Parallax speed/direction modifiers and the print stylesheet's element hide-list now use the canonical `vd-` prefix left behind by the 1.4.1 rename. The parallax JS still accepts the legacy unprefixed `parallax-*` / `data-speed` forms for back-compat.

### Removed
- Unused internal `doc-tabs` styles dropped from the bundle.

### Security
- Documented Subresource Integrity (`integrity` + `crossorigin`) for CDN tags; an ESLint rule now flags raw `innerHTML` assignment. The docs site ships a Content Security Policy restricting origins to self + jsDelivr.

## [1.4.5] - 2026-06-11

### Fixed
- Rounded-corner background bleed on draggable surfaces and input-group addons (`background-clip: padding-box`) at large `data-radius` presets.

## [1.4.4] - 2026-06-07

### Added
- Theme Switcher icon-menu variant (System / Light / Dark) with tooltips and keyboard navigation; cycle and select variants remain available.

## [1.4.3] - 2026-05-27

### Changed
- Music Player moved out of the core bundle into the ecosystem.

### Fixed
- Suggest autocomplete uses DOM-safe match highlighting.
- Code Snippet HTML highlighting no longer corrupts extracted markup.

## [1.4.2] - 2026-05-23

### Fixed
- Modal and dialog size tiers render as real desktop width steps matching the documented API.

## [1.4.1] - 2026-05-23

### Changed
- Strict `--vd-*` token API: legacy unprefixed token aliases removed (see [TOKENS.md](TOKENS.md) for migration).
- Removed the legacy font-preference migration path.

## [1.4.0] - 2026-05-19

### Changed
- Scoped runtime and lifecycle architecture; canonical `lowerCamelCase` registry names.
- Security and hygiene hardening across components.

---

Releases prior to 1.4.0 are documented at <https://vanduo.dev/#changelog>.
