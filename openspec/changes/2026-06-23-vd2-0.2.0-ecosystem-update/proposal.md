## Why

The framework repo currently does not mention its Vue 3 docs-site
sibling `@vanduo-oss/vd2` anywhere in the README or release notes.
With `vd2 v0.2.0` now release-ready (changelog, CI, CONTRIBUTING,
OpenSpec folder in place), the framework repo should acknowledge it
as part of the Vanduo ecosystem so downstream readers can discover
the Vue 3 docs site without leaving the framework's release notes.

This change is intentionally light: a single README link in the
framework's Release Notes section. No code, no docs migration, no
build changes. The actual upstreaming of layout primitives from vd2
into the framework (the `promote-layout-to-framework` migration) is
tracked under a separate, larger OpenSpec folder and is **out of
scope** for this change.

## What Changes

- Add `framework/openspec/changes/2026-06-23-vd2-0.2.0-ecosystem-update/`
  with `proposal.md`, `tasks.md`, and `specs/ecosystem-update/spec.md`.
- Add a one-line link to `https://github.com/vanduo-oss/vd2` (or the
  npm package `@vanduo-oss/vd2`) in `framework/README.md`'s Release
  Notes section.
- Commit locally on a `vd2-0.2.0-release-prep` dev branch. **No
  push, no `main` edit.**

## Impact

- Zero behavior change in the framework.
- Zero test count change.
- Zero visual diff.
- ~3 lines added to `framework/README.md`.

## Out of Scope (this change)

- Pushing the dev branch.
- Promoting layout primitives from vd2 into the framework (separate
  OpenSpec change folder).
- Replacing or augmenting the framework's existing docs with vd2.
- Migrating the framework's own CI / packaging / release flow.

## Linked changes

- `vd2/openspec/changes/release-0.2-pre-release-polish/` — the
  vd2-side milestone this change tracks.
- `docs/openspec/changes/vd2-0.2.0-ecosystem-update/` — the
  parallel docs-side reference update.
