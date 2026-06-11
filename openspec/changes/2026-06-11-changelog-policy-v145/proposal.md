## Why

Changelog entries were mixing a separate "Docs" product column. Release notes should only track Framework and Ecosystem packages.

## What Changes

- Publish `openspec/specs/changelog/spec.md` (Framework + Ecosystem only)
- Add changelog rules to `openspec/config.yaml`
- Docs consumer spec at `docs/openspec/specs/changelog/spec.md`

## Impact

- `docs/sections/changelog.html` — v1.4.5 fixes entry; v1.4.4 Docs column removed
