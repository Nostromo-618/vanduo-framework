---
name: vanduo-framework
description: Use when building UIs with @vanduo-oss/framework — the zero-build "Vanilla" HTML/CSS/JS engine of the Vanduo design system (data-attribute components + an imperative window.Vanduo runtime). Covers install (CDN/ESM/IIFE), the runtime API, the --vd-* token model, security, and caveats.
---

# @vanduo-oss/framework

The **Vanilla (zero-build) engine** of the Vanduo design system: drop-in HTML/CSS/JS — 48+ components driven by `.vd-*` classes + `data-vd-*` attributes, an imperative `window.Vanduo` runtime, and a strict `--vd-*` token API. Consumes the values from `@vanduo-oss/core`. No build step required.

## Install

```sh
pnpm add @vanduo-oss/framework        # Node >=18
```

```html
<!-- or CDN (pin a version; add SRI in production) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/vanduo-oss/framework@v1.7.1/dist/vanduo.min.css">
<script src="https://cdn.jsdelivr.net/gh/vanduo-oss/framework@v1.7.1/dist/vanduo.min.js"></script>
<script>Vanduo.init()</script>
```

Build variants in `dist/`: `vanduo.min.css` (or `vanduo-core.min.css`, no bundled icons), `vanduo.esm.js` (bundler), `vanduo.cjs.js` (CJS), `vanduo.min.js` (IIFE → global `window.Vanduo`). Subpaths: `@vanduo-oss/framework/css`, `/css/core`, `/iife`.

## Architecture

- **Component model** — `.vd-*` classes for styling + `data-vd-*` attributes that the runtime wires up (modal, flow, bubble, stepper, etc.).
- **Runtime** — `Vanduo.init()` once on load auto-initializes components; `reinit`/`destroy` handle dynamic DOM.
- **Tokens** — everything themable via `--vd-*` CSS custom properties (Open Color default; opt-in Fibonacci palette via `data-palette="fibonacci"` on `<html>`).
- **ESM vs IIFE** — ESM bundles into an app; IIFE runs standalone and populates `window.Vanduo`.

## API

Runtime (`window.Vanduo`): `init(root?)`, `initComponents(root?)`, `reinit(name, root?)`, `destroy(root?)`, `destroyAll()`, `getComponent(name)`, `register(name, comp, opts?)`. Registry names are `lowerCamelCase`.

Component methods via `Vanduo.components.*` — e.g. `toast.show({title,message,type,duration})`, `flow.next/prev/goTo`, `bubble.show/hide`, `stepper.setStep/next/prev`, `rating.get/setValue`, `transfer.getSelected`, `tree.getChecked`, `spotlight.start/next/prev/stop`, `validate.validateForm/addRule`, `waypoint.refresh`.

Helpers (global): `sanitizeHtml(html, {allowStyle?, allowSvg?})`, `escapeHtml(str)`, `ready(cb)`, `safeStorageGet/Set`, `debounce`, `throttle`.

CSS entrypoints: `/css` (full), `/css/core` (tokens + components, no icons). Token namespaces: `--vd-color/bg/text/border/shadow-*`, `--vd-btn/card/morph-*`, palette scales `--vd-oc-*` / `--vd-fib-*`.

## Security

- `sanitizeHtml()` — whitelist-based; **denies inline `style` by default** (attribute-injection vector), opt back in only for trusted source. Bubble/Popover restrict links to `http/https/mailto`.
- `escapeHtml()` is quote-safe for attribute contexts.
- ESLint flags raw `innerHTML` assignment outside the sanitize helpers (`no-restricted-syntax`).
- No bundled-style nonce injection — apply your own CSP; harden CDN tags with Subresource Integrity.

## Caveats

- No-build consumers use CDN or local `/dist`; bare ESM specifiers need a bundler/import map.
- ES2022, modern browsers (no IE11 shims).
- Theming persists to `localStorage` (`vanduo-theme-preference`); `data-palette="fibonacci"` is runtime opt-in (Open Color is default).
- Hex grid and music player are **separate packages** (`@vanduo-oss/hex-grid`, `@vanduo-oss/music-player`).

## Docs

Full documentation and live demos: https://vanduo.dev
