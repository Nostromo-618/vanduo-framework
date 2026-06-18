# Vanduo Framework v1.5.0

<p align="center">
  <img src="vanduo-banner.svg" alt="Vanduo Framework Banner" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@vanduo-oss/framework"><img src="https://img.shields.io/npm/v/@vanduo-oss/framework?style=flat-square&color=3b82f6" alt="NPM Version"></a>
  <a href="https://github.com/vanduo-oss/framework/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/vanduo-oss/framework/ci.yml?branch=main&style=flat-square&color=10b981" alt="Build Status"></a>
  <a href="https://github.com/vanduo-oss/framework/blob/main/LICENSE"><img src="https://img.shields.io/github/license/vanduo-oss/framework?style=flat-square&color=64748b" alt="License"></a>
</p>

Vanduo is a zero-dependency UI framework built with HTML, CSS, and vanilla JavaScript. It ships a full component bundle, scoped runtime initialization, and a strict canonical `--vd-*` token API.

[Browse Docs](https://vanduo.dev/#docs)

## Highlights

- Zero runtime dependencies
- 47+ components across layout, navigation, overlays, search, and effects
- Scoped runtime APIs for dynamic DOM work
- Strict design token API under `--vd-*`
- Built-in dark, light, and system theming
- Theme customizer with color, font, and radius controls
- Theme Switcher menu variant for icon-only light/dark/system selection in navbars
- Playwright-based browser coverage across Chromium, Firefox, and WebKit

## What's New in 1.5.0

- **Layout primitives** — new CSS-only layout containers — `.vd-box`, `.vd-stack`, `.vd-inline`, `.vd-center`, `.vd-frame` (golden-ratio aspect box), `.vd-cover`, and `.vd-switcher` (container-query-free responsive row→column) — with a `data-*` API (`data-pad`, `data-gap`, `data-align`, `data-justify`, `data-round`, `data-ratio`…) that consumes the existing Fibonacci spacing/radius and semantic tokens. They are the composition layer between utilities and components — *utilities style an element; primitives arrange elements*. Zero JS, zero new public tokens.
- **Hex grid is now a standalone package** — `VdHexGrid` was never part of the bundle; its source has moved out of the framework tree. Install [`@vanduo-oss/hex-grid`](https://www.npmjs.com/package/@vanduo-oss/hex-grid) directly.

## Previous: 1.4.6

- **Leaner default CSS** — `css/vanduo.css` now bundles the `regular` + `fill` icon weights only (~45% smaller minified CSS). Need all six weights? Import `css/icons/icons-all.css`.
- **No-icons core build** — new `dist/vanduo-core.min.css` (`@vanduo-oss/framework/css/core`) drops the bundled icons entirely (~123 KB lighter) for consumers who ship their own icon set.
- **Smaller package** — the build ships only the icon weights the bundle actually uses into `dist/icons/`, instead of all six.
- **TypeScript types** — a hand-written `dist/vanduo.d.ts` for the `Vanduo` runtime, exposed via the `types` field.
- **In-repo changelog** — a new [CHANGELOG.md](CHANGELOG.md) (Keep a Changelog), now validated by `check:versions`.
- **Version-consistency now covers prose** — `pnpm check:versions` validates README, `SECURITY.md`, `llms.txt`, and `CHANGELOG.md`, not just the dist banners.
- **Lint guard** — raw `innerHTML` assignment is now flagged by ESLint outside the sanitization helpers.
- **Parallax & print fixes (now tested)** — speed/direction classes and the print stylesheet's hide-list now use the canonical `vd-` prefix, with new Playwright regression specs; removed the unused internal `doc-tabs` styles from the bundle.

## Previous: 1.4.5

- **Rounded-corner background fixes** — draggable surfaces and input-group addons use `background-clip: padding-box` so opaque fills no longer bleed past border arcs at large `data-radius` presets.
- **Background-clip audit** — Playwright `@audit` harness at `tests/audit/background-clip-audit.spec.ts` for regression checks.
- Normative API: [openspec/specs/draggable/spec.md](openspec/specs/draggable/spec.md).

## Quick Start

### CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/vanduo-oss/framework@v1.5.0/dist/vanduo.min.css">
<script src="https://cdn.jsdelivr.net/gh/vanduo-oss/framework@v1.5.0/dist/vanduo.min.js"></script>
<script>
  Vanduo.init();
</script>
```

> **Production tip:** harden CDN tags with Subresource Integrity — add `integrity="sha384-…" crossorigin="anonymous"`. Copy the hash from [jsdelivr.com](https://www.jsdelivr.com/) (per-file "SRI" button) or generate it with `openssl dgst -sha384 -binary dist/vanduo.min.js | openssl base64 -A`.

### Local Dist Files

```html
<link rel="stylesheet" href="dist/vanduo.min.css">
<script src="dist/vanduo.min.js"></script>
<script>
  Vanduo.init();
</script>
```

### Package Install

```bash
pnpm add @vanduo-oss/framework
```

```js
import '@vanduo-oss/framework/css';
import { Vanduo } from '@vanduo-oss/framework';

Vanduo.init();
```

## Runtime API

```js
Vanduo.init(root);
Vanduo.initComponents(root);
Vanduo.reinit('lazyLoad', root);
Vanduo.destroy(root);
Vanduo.destroyAll();
Vanduo.getComponent('docSearch');
```

- Omit `root` to target the full document.
- Pass an `Element` to initialize or destroy only a subtree.
- Canonical component registry names use `lowerCamelCase`.
- `LazyLoad` remains available as a compatibility alias for `lazyLoad` in `1.4.x`.

## Token API

Vanduo `1.4.1` treats `--vd-*` as the only shipped custom-property namespace:

- Palette: `--vd-red-*`, `--vd-primary-*`, `--vd-gray-*`, and related scales
- Colors: `--vd-color-*`
- Backgrounds: `--vd-bg-*`
- Text: `--vd-text-*`
- Borders: `--vd-border-*`
- Shadows: `--vd-shadow-*`
- Components/effects: `--vd-btn-*`, `--vd-card-*`, `--vd-morph-*`, and related internals

Legacy unprefixed token aliases were removed in `1.4.1`; update custom themes and overrides to use the `--vd-*` equivalents.

```css
.cta {
  color: var(--vd-text-inverse);
  background: var(--vd-color-primary);
  border-color: var(--vd-border-color);
}
```

More detail lives in [TOKENS.md](TOKENS.md).

## CSS Bundle Notes

- `css/vanduo.css` remains the main framework entrypoint in `1.4.1`.
- The main bundle still includes framework-wide form defaults for native inputs and textareas.
- New component styling should prefer `.vd-*` hooks over new raw element selectors.

## Project Structure

```text
framework/
├── css/          # Foundation, utilities, effects, components
├── js/           # Runtime, lifecycle, components
├── dist/         # Built artifacts
├── tests/        # Playwright fixtures and specs
├── scripts/      # Build, verification, and inventory scripts
├── openspec/     # Spec-driven change proposals and component specs
└── docs/*.md     # Release and architecture notes
```

## Development

```bash
corepack enable
pnpm install
pnpm run lint
pnpm run build
pnpm run check:versions
pnpm test
pnpm run stats:css
```

CI runs **Chromium Desktop smoke tests on pull requests** and the **full cross-browser Playwright matrix on push to `main`** (see [`.github/workflows/tests.yml`](.github/workflows/tests.yml) and [QA-Automation-Strategy.md](QA-Automation-Strategy.md)).

## Release Notes

- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Architecture notes: [ARCHITECTURE.md](ARCHITECTURE.md)
- Token model: [TOKENS.md](TOKENS.md)
- Theme Switcher spec: [openspec/specs/theme-switcher/spec.md](openspec/specs/theme-switcher/spec.md)
- Draggable spec: [openspec/specs/draggable/spec.md](openspec/specs/draggable/spec.md)
- Changelog policy: [openspec/specs/changelog/spec.md](openspec/specs/changelog/spec.md)
- QA strategy: [QA-Automation-Strategy.md](QA-Automation-Strategy.md)
- Contributor workflow: [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT - see [LICENSE](LICENSE).  
Third-party notices are listed in [THIRD-PARTY-LICENSES](THIRD-PARTY-LICENSES).
