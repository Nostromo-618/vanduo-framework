## 1. OpenSpec

- [x] 1.1 Create change folder `openspec/changes/2026-06-11-draggable-corner-clip/`
- [x] 1.2 Add proposal, design, tasks, and `specs/draggable/spec.md`

## 2. Framework CSS

- [x] 2.1 Add `background-clip: padding-box` to `.vd-draggable`
- [x] 2.2 Add `background-clip: padding-box` to `.vd-drop-zone`
- [x] 2.3 Add `background-clip: padding-box` to `.vd-draggable-container`
- [x] 2.4 Add `background-clip: padding-box` to `.vd-draggable-item`

## 3. Tests

- [x] 3.1 Run `pnpm test` — `tests/components/draggable.spec.ts` passes (Chromium Desktop)

## 4. Build

- [x] 4.1 Run `pnpm run build:min`

## 5. Docs (separate repo)

- [x] 5.1 `pnpm run sync:framework`
- [x] 5.2 Manual visual check on `http://localhost:8787/#docs/draggable` (computed `background-clip: padding-box` on all four selectors at `data-radius="0.5"`)

## 6. Archive

- [x] 6.1 Archive change to `openspec/changes/archive/`
- [x] 6.2 Promote `specs/draggable/spec.md` to `openspec/specs/draggable/spec.md`
