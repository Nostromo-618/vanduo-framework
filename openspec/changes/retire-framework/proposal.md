# Retire framework — Proposal

## Why

Vanduo is consolidating on a single product line. The **perspective** line (`@vanduo-oss/vd3`,
`@vanduo-oss/vd3-cbun`, `vd3-docs`) is now the only line that is maintained, improved, and
released. The **legacy** line — this repository among them — is retired as of 2026-07-25.

`@vanduo-oss/framework` shipped the zero-build "Vanilla" engine — 48+ components driven by `.vd-*` classes and `data-vd-*` attributes, plus the imperative `window.Vanduo` runtime. Its final release is `1.7.1`.

This change records that decision in the repository itself, so that anyone arriving here later —
human or agent — learns it from the README, the changelog, and this proposal rather than from
inference about a stale commit date.

## What

**There is no vanilla successor.** The perspective line is Vue-3-only by contract: [`@vanduo-oss/vd3`](https://www.npmjs.com/package/@vanduo-oss/vd3) carries `vue >=3.3` as its only peer dependency, ships no IIFE build, and exposes no `window.Vanduo*` globals.

If you need a build-free drop-in, **pin `@vanduo-oss/framework@1.7.1`** — it stays on npm indefinitely, and the jsDelivr paths (`@vanduo-oss/framework@v1.7.1/dist/…`) keep resolving. Retirement means no further releases, not removal.

If you can adopt Vue 3, vd3 preserves the parts that matter: the same `.vd-*` class names, the same `--vd-*` token API, and the same `data-palette` / `-primary` / `-neutral` / `-radius` / `-theme` / `-font` theming attributes. What you give up is the DOM-scan auto-init and the imperative runtime; every interaction is a composable instead.

## Scope

In scope:

- A retirement notice at the top of `README.md` (visible on the npm package page).
- A `## Retired` entry in `CHANGELOG.md`.
- A retirement note in `SKILL.md`, so an agent loading the skill sees it immediately.
- Moving every unshipped OpenSpec change under `openspec/changes/archive/`, each marked **ABANDONED**.
- Pinning transitive **dev**-dependency advisories (postcss, brace-expansion, fast-uri) via `overrides` in
  `pnpm-workspace.yaml`, so the final CI run and the archived state are clean. These
  advisories were published after the last green run on `main` (2026-07-20) and are
  unrelated to this change; overrides apply to this repo's own install only and do not
  propagate to consumers of the published package.
- An annotated git tag `retired-v1.7.1` pinning the final state.

Out of scope:

- Any code, CSS, or behaviour change. Nothing shipped is altered and no version is bumped.
- Unpublishing from npm. Unpublishing would break every existing lockfile; the package is deprecated on the registry instead, which is advisory only.
- Taking down the CDN paths.

## Rollout

1. Land this change on `main`.
2. `npm deprecate @vanduo-oss/framework "…"` pointing at the successor.
3. Close open Dependabot PRs, disable Dependabot, sweep stale branches.
4. Archive the repository on GitHub (read-only; Actions and Dependabot stop, Pages keeps serving).
