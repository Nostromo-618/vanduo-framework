# Vanduo Framework v1.4.1

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
- Playwright-based browser coverage across Chromium, Firefox, and WebKit

## Quick Start

### CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/vanduo-oss/framework@v1.4.1/dist/vanduo.min.css">
<script src="https://cdn.jsdelivr.net/gh/vanduo-oss/framework@v1.4.1/dist/vanduo.min.js"></script>
<script>
  Vanduo.init();
</script>
```

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

## Release Notes

- Architecture notes: [ARCHITECTURE.md](ARCHITECTURE.md)
- Token model: [TOKENS.md](TOKENS.md)
- `1.4.1` token migration notes: [changes-v141.md](changes-v141.md)
- QA strategy: [QA-Automation-Strategy.md](QA-Automation-Strategy.md)
- Contributor workflow: [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT - see [LICENSE](LICENSE).  
Third-party notices are listed in [THIRD-PARTY-LICENSES](THIRD-PARTY-LICENSES).
