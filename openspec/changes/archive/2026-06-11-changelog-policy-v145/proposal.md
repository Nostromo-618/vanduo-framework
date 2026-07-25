> **ABANDONED — 2026-07-25.** The Vanduo legacy (dual-engine) line was retired
> before this change shipped. It is kept here as a record of intent, not as work in
> progress. Development continues in the perspective line — `@vanduo-oss/vd3` and
> `@vanduo-oss/vd3-cbun`. See `openspec/changes/archive/retire-*` for the decision.

## Why

Changelog entries were mixing a separate "Docs" product column. Release notes should only track Framework and Ecosystem packages.

## What Changes

- Publish `openspec/specs/changelog/spec.md` (Framework + Ecosystem only)
- Add changelog rules to `openspec/config.yaml`
- Docs consumer spec at `docs/openspec/specs/changelog/spec.md`

## Impact

- `docs/sections/changelog.html` — v1.4.5 fixes entry; v1.4.4 Docs column removed
