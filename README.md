# Vanduo Framework v1.3.8

<p align="center">
  <img src="vanduo-banner.svg" alt="Vanduo Framework Banner" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@vanduo-oss/framework"><img src="https://img.shields.io/npm/v/@vanduo-oss/framework?style=flat-square&color=3b82f6" alt="NPM Version"></a>
  <a href="https://github.com/vanduo-oss/framework/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/vanduo-oss/framework/ci.yml?branch=main&style=flat-square&color=10b981" alt="Build Status"></a>
  <a href="https://github.com/vanduo-oss/framework/blob/main/LICENSE"><img src="https://img.shields.io/github/license/vanduo-oss/framework?style=flat-square&color=64748b" alt="License"></a>
</p>

**Essential just like water is.**

Vanduo is a lightweight, zero-dependency UI framework built with pure HTML, CSS, and JavaScript. It ships 47+ components, responsive utilities, dark mode support, and a flexible theming system.

[Browse Docs](https://vanduo.dev/#docs)

## Highlights

- Pure CSS/JS with no runtime dependencies
- Modular architecture with optional per-component imports
- 47+ components, including Expanding Cards and animated Timeline controls in v1.3.8
- Niche canvas hex-grid support is distributed as `@vanduo-oss/hex-grid`
- Built-in dark/light/system theme switching
- Runtime Theme Customizer for color, font, and radius tokens
- Accessibility-focused components and utilities

## Quick Start

### CDN (recommended)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/vanduo-oss/framework@v1.3.8/dist/vanduo.min.css">
<script src="https://cdn.jsdelivr.net/gh/vanduo-oss/framework@v1.3.8/dist/vanduo.min.js"></script>
<script>Vanduo.init();</script>
```

### Local dist files

```html
<link rel="stylesheet" href="dist/vanduo.min.css">
<script src="dist/vanduo.min.js"></script>
<script>Vanduo.init();</script>
```

### Package install (bundlers)

```bash
pnpm add @vanduo-oss/framework
```

```js
import '@vanduo-oss/framework/css';
import { Vanduo } from '@vanduo-oss/framework';

Vanduo.init();
```

## Docs and Resources

- Website: [vanduo.dev](https://vanduo.dev)
- Docs: [vanduo.dev/#docs](https://vanduo.dev/#docs)
- npm: [@vanduo-oss/framework](https://www.npmjs.com/package/@vanduo-oss/framework)
- Releases: [GitHub Releases](https://github.com/vanduo-oss/framework/releases)
- LLM reference: [`llms.txt`](llms.txt)

## Project Structure

```text
vanduo-framework/
├── dist/          # Production bundles
├── css/           # Core, components, utilities, effects
├── js/            # Framework runtime and components
├── fonts/         # Bundled web fonts
├── icons/         # Phosphor icons bundle
└── tests/         # Playwright + linting
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

MIT - see [LICENSE](LICENSE).  
Third-party notices are listed in [THIRD-PARTY-LICENSES](THIRD-PARTY-LICENSES).

## Credits

- [Open Color](https://yeun.github.io/open-color/) (MIT)
- [Phosphor Icons](https://phosphoricons.com/) (MIT)
