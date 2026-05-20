# QA Automation Strategy

## Scope

Vanduo uses Playwright as the single browser-test dependency. The suite covers:

- Chromium, Firefox, and WebKit desktop
- Chromium and WebKit mobile
- Chromium and WebKit tablet
- Component behavior, DOM state, keyboard flows, and integration behavior

Visual pixel-diff testing is not part of the active release gate.

## Release Gates

For `1.4.0`, the automated gate is:

```bash
pnpm run lint
pnpm run build
pnpm run check:versions
pnpm test
pnpm audit --audit-level=moderate
```

## What We Verify

- Component initialization and teardown
- Scoped runtime behavior for dynamic DOM updates
- Cross-browser interaction parity
- Accessibility-oriented DOM and ARIA state
- Sanitization and safe HTML handling
- Build output consistency and version alignment

## Notes for 1.4.0

- The timeline playback tests now rely on deterministic polling instead of fragile fixed sleeps.
- Lazy-load behavior is verified with scoped reinitialization expectations.
- Token compatibility remains covered indirectly through fixture rendering and component tests.

## Manual QA

Automated checks are necessary, not sufficient. The `1.4.0` release stays local on `dev-v140` until manual QA is complete.
