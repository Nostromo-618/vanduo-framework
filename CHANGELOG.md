# Changelog

All notable changes to the Vanduo Framework are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Full release notes — covering the framework, the documentation site, and
ecosystem packages side by side — live at <https://vanduo.dev/#changelog>.

## [1.5.0] - 2026-06-18

### Added
- **Layout primitives** — CSS-only `.vd-box`, `.vd-stack`, `.vd-inline`, and `.vd-center` containers (`css/primitives/primitives.css`) with a `data-*` API consuming the existing Fibonacci spacing/radius and semantic tokens. The composition layer between utilities and components; sub-1KB, zero JS, no new public tokens. Unit specs in `tests/unit/primitives.spec.ts`.

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
