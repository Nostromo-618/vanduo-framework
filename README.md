<p align="center">
  <img src="vanduo-banner.svg" alt="Vanduo Framework" width="100%">
</p>

# @vanduo-oss/framework

[![npm](https://img.shields.io/npm/v/@vanduo-oss/framework.svg)](https://www.npmjs.com/package/@vanduo-oss/framework)
[![CI](https://img.shields.io/github/actions/workflow/status/vanduo-oss/framework/ci.yml?branch=main)](https://github.com/vanduo-oss/framework/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> The zero-build **Vanilla** engine of the Vanduo design system.

Drop-in HTML/CSS/JS — 48+ components driven by `.vd-*` classes and `data-vd-*` attributes, an imperative `window.Vanduo` runtime, and a strict `--vd-*` token API. Zero runtime dependencies; consumes design tokens from [`@vanduo-oss/core`](https://www.npmjs.com/package/@vanduo-oss/core). Need Vue 3 instead? See [`@vanduo-oss/vue`](https://www.npmjs.com/package/@vanduo-oss/vue).

## Install

```sh
pnpm add @vanduo-oss/framework
```

```js
import "@vanduo-oss/framework/css";
import { Vanduo } from "@vanduo-oss/framework";

Vanduo.init();
```

## Quick start (no build)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/vanduo-oss/framework@v1.7.1/dist/vanduo.min.css">
<script src="https://cdn.jsdelivr.net/gh/vanduo-oss/framework@v1.7.1/dist/vanduo.min.js"></script>
<script>
  Vanduo.init();
</script>
```

> **Production tip:** pin the version and add Subresource Integrity (`integrity="sha384-…" crossorigin="anonymous"`) to CDN tags. Get the hash from the per-file "SRI" button on [jsdelivr.com](https://www.jsdelivr.com/).

## Documentation

- Docs & live demos — https://vanduo.dev
- Agent / LLM reference — [SKILL.md](./SKILL.md)
- Token model — [TOKENS.md](./TOKENS.md) · Architecture — [ARCHITECTURE.md](./ARCHITECTURE.md)
- Changelog — [CHANGELOG.md](./CHANGELOG.md) · Security — [SECURITY.md](./SECURITY.md)

## License

[MIT](./LICENSE) © Vanduo — third-party notices in [THIRD-PARTY-LICENSES](./THIRD-PARTY-LICENSES).
