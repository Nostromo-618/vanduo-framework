## 1. Audit harness

- [x] 1.1 Create `tests/fixtures/background-clip-audit.html`
- [x] 1.2 Create `tests/audit/background-clip-audit.ts`
- [x] 1.3 Create `tests/audit/background-clip-audit.spec.ts` (`@audit`)
- [x] 1.4 Run audit and write `test-results/background-clip-audit.json`

## 2. Tier 2 fix

- [x] 2.1 Add `background-clip: padding-box` to `.vd-input-group-prefix, .vd-input-group-suffix`
- [x] 2.2 Re-run audit — `vd-input-group-prefix` visualBleed false
- [x] 2.3 `pnpm run build` and targeted Playwright tests
