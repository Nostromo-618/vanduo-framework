# QA Automation Strategy

## Scope

Vanduo uses Playwright as the single browser-test dependency. The suite covers:

- Chromium, Firefox, and WebKit desktop
- Chromium and WebKit mobile
- Chromium and WebKit tablet
- Component behavior, DOM state, keyboard flows, and integration behavior

Visual pixel-diff testing is not part of the active release gate.

## CI Tiers (1.4.4+)

GitHub Actions runs a two-tier strategy via [`.github/workflows/tests.yml`](.github/workflows/tests.yml):

| Trigger | Job | Coverage |
|---|---|---|
| Pull request to `main` | `pr-smoke-tests` | Chromium Desktop only |
| Push to `main` / `workflow_dispatch` | Full matrix | Chromium, Firefox, WebKit desktop + mobile + tablet |
| Push to `main` / `workflow_dispatch` | `@a11y` | Accessibility-tagged tests |
| Push to `main` / `workflow_dispatch` | Tablet | Chromium and WebKit tablet projects |

PR smoke keeps feedback fast; merge to `main` runs the full cross-browser gate.

## Release Gates

For `1.4.4`, the local pre-release gate is:

```bash
pnpm run lint
pnpm run build
pnpm run check:versions
pnpm test
pnpm audit --audit-level=moderate
```

Run the full Playwright suite locally before tagging a release even though PR CI uses smoke tests only.

## What We Verify

- Component initialization and teardown
- Scoped runtime behavior for dynamic DOM updates
- Cross-browser interaction parity
- Accessibility-oriented DOM and ARIA state
- Sanitization and safe HTML handling
- Build output consistency and version alignment
- Theme Switcher menu variant: open/select/persistence/keyboard (see `tests/components/theme-switcher.spec.ts`)

## Notes for 1.4.4

- Theme Switcher menu variant tests cover toggle-open, option select, persistence, Escape/arrow keyboard nav, and outside-click close.
- The timeline playback tests rely on deterministic polling instead of fragile fixed sleeps.
- Lazy-load behavior is verified with scoped reinitialization expectations.
- Token compatibility remains covered indirectly through fixture rendering and component tests.

## Manual QA

Automated checks are necessary, not sufficient. Verify Theme Switcher menu UX in a real navbar before publishing `1.4.4`.
