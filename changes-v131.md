# Changes v1.3.1 — Security & Correctness Fixes

All issues identified in `plans/analysis-v131.md`. Build ✅ | Tests ✅ (1377 passed, 0 failed)

---

## Critical Fixes

### 1. XSS in Suggest Component
**File:** `js/components/suggest.js`
- Added `_escapeHtml()` helper inside the IIFE
- `renderItems()` now escapes text **before** applying the highlight regex via `innerHTML`
- Previously, raw server/user data was inserted directly — a malicious suggestion like `<img src=x onerror=alert(1)>` would execute

### 5. Select Component — Broken CSS Selectors
**File:** `js/components/select.js`
- Fixed 3 querySelector calls using `.vd-custom-select-option` to match the actual class `.custom-select-option`
- Affected: `updateSelectedOptions()`, `openDropdown()`, `handleKeydown()`
- Previously: keyboard navigation and programmatic updates silently failed

### 6. Select Component — `generateId()` Never Assigned ID
**File:** `js/components/select.js`
- `generateId()` now assigns the generated ID to `element.id` before returning
- Previously: ARIA `aria-labelledby` pointed to a nonexistent ID

---

## Medium Severity Fixes

### 2. Code Snippet — Copy Event Always Reports Success
**File:** `js/components/code-snippet.js`
- `codesnippet:copy` event now passes the actual `copySuccess` result instead of hardcoded `true`

### 3. Modals — O(n) Document ESC Listeners
**File:** `js/components/modals.js`
- Replaced per-modal `document.addEventListener('keydown', ...)` with a single shared handler
- Shared handler installed on first modal init, removed on `destroyAll()`
- Eliminates redundant event processing on pages with many modals

### 4. Dropdown + Select — Shared Typeahead Buffer
**Files:** `js/components/dropdown.js`, `js/components/select.js`
- Moved `_typeaheadBuffer` and `_typeaheadTimer` from module-level to per-instance state
- Stored in the `instances` Map alongside cleanup functions
- Previously: typing in one dropdown corrupted the typeahead state of another

### 7. Navbar — Body Scroll Lock Conflicts
**Files:** `js/components/navbar.js`, `css/components/navbar.css`
- Replaced `document.body.style.overflow = 'hidden'` with CSS class `body-navbar-open`
- Added `.body-navbar-open { overflow: hidden; }` to navbar.css
- Prevents navbar and modal scroll locks from clobbering each other

### 11. Helpers — `on()` Delegation Unremovable
**File:** `js/utils/helpers.js`
- `on()` now returns the actual bound wrapper function for delegation
- Callers can pass the return value to `off()` to remove delegation listeners
- Direct event bindings also return the handler for consistency

### 13. Validate — ReDoS Risk in Pattern Rule
**File:** `js/components/validate.js`
- Added 100-character length limit on user-supplied regex patterns
- Prevents catastrophic backtracking from excessively complex patterns

### 14. Validate — Selector Injection in Match Rule
**File:** `js/components/validate.js`
- `match` rule now uses `CSS.escape()` on the `param` before building the querySelector
- Wrapped in try/catch to handle invalid selectors gracefully

---

## Low Severity Fixes

### 9. Image Box — `onload` Handler Cleanup
**File:** `js/components/image-box.js`
- Replaced DOM0 `this.img.onload = ...` with `addEventListener('load', ..., { once: true })`
- Clean up handler in `close()` if image hasn't loaded yet

### 12. Theme Customizer — Duplicate `applyTheme()` in Reset
**File:** `js/components/theme-customizer.js`
- Removed redundant second `this.applyTheme(this.DEFAULTS.THEME)` call in `reset()`

---

## Deferred

### 10. Helpers — `$()` Global Namespace Pollution
- Renaming `$` / `$$` to `vd$` / `vd$$` is a **breaking API change** affecting all consumers
- Deferred for a major version discussion

---

## Files Modified

| File | Fixes |
|------|-------|
| `js/components/suggest.js` | #1 |
| `js/components/select.js` | #4, #5, #6 |
| `js/components/code-snippet.js` | #2 |
| `js/components/dropdown.js` | #4 |
| `js/components/modals.js` | #3 |
| `js/components/navbar.js` | #7 |
| `css/components/navbar.css` | #7 |
| `js/utils/helpers.js` | #11 |
| `js/components/validate.js` | #13, #14 |
| `js/components/image-box.js` | #9 |
| `js/components/theme-customizer.js` | #12 |
