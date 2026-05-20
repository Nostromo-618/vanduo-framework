# Vanduo Framework Analysis Report

Date: 2026-05-19

Scope: `framework/`

## Executive Summary

Vanduo is a browser-native, zero-runtime-dependency UI framework. Its core identity is clear: CSS-first design, progressive JavaScript enhancement, direct browser APIs, and distributable artifacts for package and browser consumption. The codebase is unusually transparent for a UI framework: components are plain modules, CSS is organized by theme and component, and the build system is small enough to audit.

The strongest parts of the framework are its low dependency surface, practical package hygiene, readable component implementations, and robust test volume. The main risks are around lifecycle consistency, global reinitialization behavior, selector invasiveness, security hardening edges, and some drift between comments, docs, tooling, and actual behavior.

The framework is not fragile, but it has reached the point where its architecture wants stronger contracts. The next improvements should focus less on adding features and more on consolidating lifecycle, initialization scope, sanitizer policy, CSS boundaries, and CI signal quality.

## Methodology

This review inspected:

- Package metadata, build scripts, exports, and dependency configuration.
- JavaScript entrypoints, utilities, and components.
- CSS architecture, token layers, themes, component styles, and selector behavior.
- Security posture in dependency policy, DOM insertion, sanitization, URL handling, and public config.
- Comment and documentation culture.
- Lint, audit, and test behavior.

Verification performed:

- `pnpm run lint`: passed.
- `pnpm audit`: completed after network escalation and found one moderate vulnerability.
- `pnpm test`: ran the full suite and completed with one failing Firefox test.

No source files were changed during the analysis.

## Core Essence

The framework's core essence is:

- Browser-native first: no runtime dependencies and no framework runtime abstraction.
- CSS-led: design tokens, utility classes, components, layouts, themes, and responsive behavior carry much of the product surface.
- Progressive enhancement: JavaScript components attach behavior to existing DOM via `data-vd-*` attributes and class conventions.
- Global orchestration: `window.Vanduo` acts as the central runtime registry and initializer.
- Distribution-conscious: the package emits ESM, CJS, CSS, and IIFE/browser builds.

This is a good fit for documentation sites, marketing/product pages, lightweight apps, design systems, and server-rendered projects that want rich behavior without adopting a client framework.

It is a weaker fit for applications that need strict component isolation, deeply nested client state, complex hydration, or untrusted third-party rich HTML unless additional safety layers are added.

## Strengths

### 1. Strong Product Identity

The README positions Vanduo clearly as an essential, lightweight framework. The implementation matches that promise: it avoids heavy dependencies and keeps browser behavior close to the platform.

### 2. Low Runtime Attack Surface

`package.json` contains no production runtime dependencies. This substantially reduces supply-chain and bundle complexity compared with many UI frameworks.

### 3. Good Package Hygiene

The package exposes multiple build targets and has a security-aware `.npmrc`:

- `ignore-scripts=true`
- `minimum-release-age=1440`
- `trust-policy=no-downgrade`
- `block-exotic-subdeps=true`
- `save-exact=true`
- `strict-peer-dependencies=true`

These settings show mature package-security instincts.

### 4. Readable Component Style

Most JavaScript components are plain modules with direct DOM logic. That makes them easy to inspect, debug, and reason about. The code favors explicit behavior over hidden abstraction.

### 5. Meaningful Test Investment

The project has substantial test coverage. The authored test source is large, and the full test run completed with thousands of passing tests:

- 4,439 passed.
- 26 skipped.
- 1 failed.

That is a strong base for framework hardening.

## Structure

### Main Areas

- `css/`: tokens, themes, utilities, layouts, components, and framework CSS manifest.
- `js/`: JavaScript entrypoint, runtime registry, utilities, and components.
- `dist/`: generated distribution artifacts.
- `tests/`: component, visual, accessibility, and framework behavior tests.
- `scripts/`: build and analysis helpers.
- `.github/`: CI and repository automation.

### Source Size Estimate

Approximate authored source inspected:

- JavaScript: about 15,102 LOC.
- CSS: about 22,059 LOC.
- Tests: about 8,084 LOC.

The repository is much larger on disk because it includes generated distribution files, icon assets, fonts, images, and `node_modules`.

## Architecture Findings

### A1. The Global Runtime Is the Real Architecture Center

The framework is orchestrated by `window.Vanduo` in `js/vanduo.js`. Components register themselves through `window.Vanduo.register(...)`, and initialization is performed globally through `init()` / `initComponents()`.

This makes adoption simple, but it also means correctness depends heavily on every component being idempotent. Any global reinitialization can cause subtle duplicate listeners, duplicate state, or timing-dependent behavior unless every component defends perfectly.

Recommendation:

- Keep the global registry, but introduce a scoped initialization path that accepts a root node.
- Prefer scoped init after dynamic content insertion.
- Define a clear component contract: registration name, selector, init behavior, destroy behavior, idempotency expectations.

### A2. Lifecycle Manager Exists But Is Not Integrated

`js/utils/lifecycle.js` defines a central lifecycle registry with `instances: new Map()` and methods such as register, unregister, and destroyAll. However, component source does not appear to call `VanduoLifecycle.register`.

This creates architecture ambiguity:

- Either lifecycle management is meant to be central, but integration is incomplete.
- Or components are intentionally self-managed, making the lifecycle utility misleading.

Recommendation:

- Decide whether `VanduoLifecycle` is a real runtime primitive.
- If yes, wire components into it and make teardown consistent.
- If no, remove or clearly mark it as experimental/internal to avoid false confidence.

### A3. Lazy Loading Reinitializes the Whole Framework

`js/components/lazy-load.js` injects fetched content and then calls `window.Vanduo.init()` after insertion.

Risk:

- A local content fetch can re-run initialization across the entire document.
- This relies on every component being globally idempotent.
- It can create performance and listener duplication issues as the page grows.

Recommendation:

- Replace full global reinitialization with scoped initialization against the injected container.
- Example contract: `window.Vanduo.init(rootElement)`.

### A4. Component Naming Is Inconsistent

Registration names vary in style:

- `LazyLoad`
- `fontSwitcher`
- `docSearch`
- `gridLayout`

This is not catastrophic, but framework APIs become easier to use and document when public names follow one convention.

Recommendation:

- Pick a public registration naming convention.
- Maintain aliases if needed for backward compatibility.

### A5. CSS Is Powerful But Broad

The CSS architecture is rich and comprehensive. However, some selectors apply to raw platform elements rather than only framework-prefixed classes.

Example:

- `css/components/forms.css` styles raw input selectors such as `input[type=...]` alongside `.vd-input`.

Risk:

- Embedding Vanduo in an existing app can unexpectedly restyle unrelated forms.
- This can make adoption harder in mixed systems.

Recommendation:

- Prefer `.vd-*` scoped selectors for component styling.
- Keep raw element styles only in an explicit reset/base layer.
- Document whether Vanduo expects to own the whole page or coexist inside another app.

### A6. Token System Has Multiple Truth Sources

The CSS token architecture is extensive, but aliases and design tokens are distributed across multiple files. This is flexible, but it can become hard to reason about which token is canonical.

Recommendation:

- Define one canonical token layer.
- Keep aliases mechanically mapped or clearly marked as compatibility names.
- Add token documentation or generated token tables.

## Coding Quality

### C1. Code Is Generally Readable And Direct

The JavaScript favors clear DOM APIs and explicit control flow. That is a good match for the framework's zero-dependency goal.

The codebase is approachable: new contributors can usually understand a component without learning a private framework layer first.

### C2. Idempotency Is A Hidden Requirement

Because global initialization can re-run, components must be carefully idempotent. Some code shows awareness of this, but the contract is not enforced centrally.

Recommendation:

- Add tests that call initialization multiple times against the same DOM.
- Treat duplicate listener prevention as part of the component contract.

### C3. Event Listener Cleanup Is Uneven

Some components clean up explicitly; others rely on DOM removal or lack central lifecycle tracking. One concrete example found:

- `js/components/suggest.js` adds a focus listener with an inline arrow function but cleanup only removes some other listeners.

Risk:

- Repeated initialization or long-lived pages may accumulate listeners.

Recommendation:

- Store listener references for removal.
- Prefer lifecycle-managed cleanup for interactive components.

### C4. Tooling Rules Are Permissive

`eslint.config.js` allows or only warns on several rules that would catch quality issues:

- `no-unused-vars`: warning.
- `no-console`: off.
- `no-redeclare`: warning.

`stylelint.config.js` disables many structural, naming, and specificity checks.

This may be intentional while the project is evolving, but a framework benefits from stricter gates as it stabilizes.

Recommendation:

- Gradually promote important warnings to errors.
- Keep exceptions local and documented.
- Use stricter checks for public package source than for tests or build scripts.

## Comments And Documentation Culture

### D1. Comments Are Mostly Helpful

The code generally uses comments to explain structure, intent, and public surfaces rather than narrating every line. That is healthy.

### D2. Some Comments Have Drifted From Behavior

One notable drift:

- `js/index.js` comments describe IIFE behavior using `globalName: 'VanduoBundle'`.
- `scripts/build.js` explicitly avoids `globalName`.

This is a small example, but important because build comments shape how maintainers reason about package output.

Recommendation:

- Update comments near distribution and build behavior when build config changes.
- Keep architectural comments close to the code that enforces them.

### D3. QA Documentation Is Behind Reality

`QA-Automation-Strategy.md` lists integration, E2E, and performance testing as planned, while the current suite already contains E2E-style and component tests.

Recommendation:

- Refresh QA docs to reflect the current test suite.
- Separate roadmap items from completed capabilities.

## Security Findings

### S1. Moderate Dependency Vulnerability Is Present

`pnpm audit` found one moderate vulnerability:

- Package: `brace-expansion`
- Current override: `5.0.5`
- Patched version: `>=5.0.6`
- Advisory: `GHSA-jxxr-4gwj-5jf2`
- Path: `. > eslint > minimatch > brace-expansion`

The project pins `brace-expansion` to `5.0.5` in `package.json`, while the patched line is `>=5.0.6`.

CI and pre-commit currently use `pnpm audit --audit-level=high`, so this moderate issue does not fail the gate.

Recommendation:

- Update the override to `5.0.6` or newer.
- Consider whether framework CI should fail on moderate vulnerabilities, at least for direct overrides.

### S2. HTML Sanitizer Is Useful But Not A Full Trust Boundary

`js/utils/helpers.js` includes a whitelist-based `sanitizeHtml()` and correctly warns that DOMPurify or server-side sanitization should be used for stronger guarantees.

Concern:

- The sanitizer allows `style` attributes.
- Inline style can be risky for untrusted rich content and can enable UI deception or CSS-based exfiltration tricks depending on browser behavior and context.

Recommendation:

- Remove `style` from allowed attributes for untrusted content.
- If style support is required, parse and allowlist specific CSS properties and value patterns.
- Clearly document the trust level expected for any HTML passed into this helper.

### S3. Lazy Load HTML Injection Is Cautious But Still High-Impact

`lazy-load.js` performs same-origin URL checks and sanitizes injected HTML through `_safeInjectHtml`. It strips dangerous tags and attributes, which is good.

The main remaining concern is not just injection, but the follow-up global `window.Vanduo.init()` call after insertion.

Recommendation:

- Keep same-origin checks.
- Keep sanitization.
- Add scoped initialization to reduce behavioral blast radius.

### S4. Search Highlight Tag Is Not Validated

`js/components/doc-search.js` escapes highlighted text but interpolates `config.highlightTag` into generated markup.

Risk:

- If configuration is attacker-controlled or accidentally invalid, tag interpolation can create malformed or unsafe HTML.

Recommendation:

- Validate `highlightTag` against a small allowlist such as `mark`, `strong`, `em`, or `span`.
- Default to `mark`.

### S5. Supply-Chain Posture Is Better Than Average

Despite the moderate audit finding, the package security posture is strong:

- No runtime dependencies.
- Script execution disabled for dependency installation.
- Minimum release age configured.
- Strict peer dependencies.
- Explicit registry.

The main supply-chain improvement is to align the current override with the patched advisory version.

## Verification Results

### Lint

Command:

```sh
pnpm run lint
```

Result:

- Passed.

### Audit

Command:

```sh
pnpm audit
```

Result:

- Failed with one moderate vulnerability.
- Vulnerability: `brace-expansion >=5.0.0 <5.0.6`.
- Patched: `>=5.0.6`.

### Tests

Command:

```sh
pnpm test
```

Result:

- 4,439 passed.
- 26 skipped.
- 1 failed.

Failing test:

- `tests/components/timeline.spec.ts:113`
- Browser/project: Firefox Desktop.
- Test: `Timeline Component @component > playback pause stops auto-advance`.

Failure detail:

- Expected revealed timeline item count: `1`.
- Received: `2`.

Relevant implementation detail:

- `js/components/timeline.js` uses `PLAY_INTERVAL_MS = 800`.
- The test waits `1100ms`, pauses, then expects only one item to remain revealed.

Likely issue:

- Timing is close enough that Firefox can advance twice before the pause assertion.
- The test may be timing-sensitive, or the component pause/playback behavior may need a stricter state guard.

Recommendation:

- Make the test deterministic by controlling time or using a tighter observable signal.
- Verify whether component behavior should reveal immediately on play or only after the first interval.

### Test Output Quality

Local test output was extremely noisy because the Playwright webserver logs many requests locally. `playwright.config.ts` suppresses logs only in CI.

Recommendation:

- Consider suppressing local webserver request logging by default.
- Provide a verbose mode when request-level logging is needed.

## Priority Actions

### P0

1. Update `brace-expansion` override to `5.0.6` or newer.
2. Decide whether moderate audit findings should fail CI for this package.

### P1

1. Add scoped framework initialization and replace lazy-load global reinit.
2. Decide whether `VanduoLifecycle` is a real runtime primitive and either integrate it or retire it.
3. Remove or strictly sanitize inline `style` support in `sanitizeHtml()`.
4. Validate `docSearch.highlightTag` against a small allowlist.
5. Fix or stabilize the Firefox timeline playback test.

### P2

1. Tighten component registration naming conventions.
2. Reduce raw element selector styling in component CSS.
3. Refresh comments around build output and IIFE behavior.
4. Update QA strategy documentation to match the existing test suite.
5. Gradually promote important lint warnings to errors.

## Architectural Recommendation

The highest-leverage architectural move is to turn the current global registry into a scoped, lifecycle-aware runtime while preserving the simple browser-native public API.

Suggested direction:

```js
window.Vanduo.init(document);
window.Vanduo.init(rootElement);
window.Vanduo.destroy(rootElement);
window.Vanduo.getComponent(name);
```

Each component should then expose a consistent contract:

```js
{
  name: 'docSearch',
  selector: '[data-vd-doc-search]',
  init(root) {},
  destroy(root) {}
}
```

This would preserve Vanduo's philosophy while reducing the biggest long-term maintenance risks:

- Reinitialization side effects.
- Memory leaks.
- Dynamic content hazards.
- Inconsistent teardown.
- Component behavior drift.

## Final Assessment

Vanduo has a coherent heart: small, browser-native, CSS-first, dependency-light, and practical. The framework is already usable and thoughtfully built. The next phase should be about making its implicit contracts explicit.

The codebase does not need a conceptual rewrite. It needs contract hardening: lifecycle, scoped initialization, sanitizer boundaries, CSS scoping, and CI gates. Those changes would make the framework easier to embed, safer to evolve, and more trustworthy as a public package.
