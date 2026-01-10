# Vanduo Framework - Issues & Improvement Plan

Analysis of the framework as a modern, copy-paste friendly, no-dependency CSS/JS framework.

---

## Critical Issues

### 1. ~~Accessibility: Focus States Use `:focus` Instead of `:focus-visible`~~ FIXED
**Files:** `css/components/buttons.css`, `css/components/forms.css`, `css/core/typography.css`

Replaced all `:focus` selectors with `:focus-visible` for keyboard-only focus styling.

### 2. ~~Accessibility: No `prefers-reduced-motion` Support~~ FIXED
**File:** `css/utilities/transitions.css`

Added `@media (prefers-reduced-motion: reduce)` to disable animations for users with vestibular disorders.

### 3. ~~Modal Focus Trap Memory Leak~~ FIXED
**File:** `js/components/modals.js`

Focus trap handler is now stored and removed on modal close to prevent memory leaks.

### 4. ~~Hardcoded Colors in SVG Data URIs~~ FIXED
**File:** `css/components/forms.css`

Added dark mode overrides for select dropdown arrow colors with `[data-theme="dark"]` selectors.

---

## Missing Features

### 5. No CSS Reset/Normalization
Framework lacks base reset. Components may render inconsistently when used standalone without full `vanduo.css`.

### 6. ~~No Responsive Spacing Utilities~~ FIXED
**File:** `css/core/helpers.css`

Added responsive margin/padding classes: `.m-sm-*`, `.m-md-*`, `.m-lg-*`, `.m-xl-*`, `.p-sm-*`, etc.

### 7. ~~No Loading Button States~~ FIXED
**File:** `css/components/buttons.css`

Added `.btn.is-loading` class with animated spinner for form submissions.

### 8. ~~No Print Styles~~ FIXED
**File:** `css/utilities/print.css`

Created print media stylesheet that hides navigation, optimizes for printing, and includes `.d-print-*` utility classes.

### 9. No Fluid Typography
Font sizes are fixed. Modern frameworks use `clamp()` for responsive scaling.

### 10. ~~No Skip Navigation Component~~ FIXED
**File:** `css/core/helpers.css`

Added `.skip-link` utility class for accessible skip navigation.

---

## Developer Experience Issues

### 11. Hardcoded Breakpoint in JavaScript
**File:** `js/components/navbar.js:63, 82`

CSS defines `--breakpoint-lg: 992px` but JS doesn't read it.

### 12. No Dynamic Component Initialization
Components only initialize on page load. Dynamically added HTML (via AJAX) won't work without manual `Component.init()` calls.

### 13. ~~Silent Failures in Components~~ FIXED
**File:** `js/components/modals.js`

Added `console.warn()` calls for invalid selectors and uninitialized modals.

### 14. Inconsistent Component APIs
- Modal: `.open()`, `.close()`, fires events
- Dropdown: uses class toggle only
- Select: different initialization pattern

### 15. No TypeScript Definitions
No `.d.ts` files for IDE autocomplete when using `window.Vanduo`.

---

## Responsive & Mobile Issues

### 16. ~~Form Inputs Too Small for Touch~~ FIXED
**File:** `css/components/forms.css`

Added mobile media query ensuring 44px minimum touch targets on form elements.

### 17. Modal Responsive Sizing Gap
Only `.modal-fullscreen-sm-down` exists. Missing medium/large responsive variants for tablets.

### 18. Breadcrumb Overflow on Mobile
Long breadcrumbs don't collapse or truncate on small screens.

---

## Browser Compatibility

### 19. No CSS Variable Fallbacks
```css
color: var(--color-primary); /* No fallback if variable fails */
```

### 20. Placeholder Styling Incomplete
**File:** `css/components/forms.css:82-86`

Missing vendor prefixes for full browser support.

---

## Performance Issues

### 21. ~~Modal Z-Index Never Resets~~ FIXED
**File:** `js/components/modals.js`

Z-index counter now resets to 1050 when all modals are closed.

### 22. Global Event Listeners Accumulate
Components add `document.addEventListener('click', ...)` without cleanup. Performance degrades over time.

### 23. ~~Tooltip Repositioning Causes Repaints~~ FIXED
**File:** `js/components/tooltips.js`

Replaced multiple style assignments with single `transform: translate()` for better performance.

---

## Documentation Gaps

### 24. Theme Switching Not Documented
Dark mode exists via `[data-theme="dark"]` and `theme-switcher.js`, but README doesn't mention it.

### 25. CSS Variable Customization Undocumented
No guide on how to override `--color-primary`, `--btn-border-radius`, etc.

### 26. Modular Import Strategy Unclear
README shows file structure but doesn't explain how to import only specific components.

---

## CSS Quality Issues

### 27. High Specificity Selectors
**File:** `css/components/buttons.css`

```css
.btn-primary:hover:not(:disabled):not(.disabled)
```
Hard to override without `!important`.

### 28. ~~Duplicate Selectors~~ FIXED
**File:** `css/components/forms.css`

Removed duplicate `select.input-sm` and `select.input-lg` selectors.

---

## Implementation Summary

### Completed Fixes

| Issue | Status | Files Modified |
|-------|--------|----------------|
| 1. `:focus` → `:focus-visible` | DONE | buttons.css, forms.css, typography.css |
| 2. `prefers-reduced-motion` | DONE | transitions.css |
| 3. Modal focus trap leak | DONE | modals.js |
| 4. Dark mode SVG colors | DONE | forms.css |
| 6. Responsive spacing | DONE | helpers.css |
| 7. Loading button state | DONE | buttons.css |
| 8. Print styles | DONE | print.css (new) |
| 10. Skip link utility | DONE | helpers.css |
| 13. Console warnings | DONE | modals.js |
| 16. Touch target sizes | DONE | forms.css |
| 21. Z-index reset | DONE | modals.js |
| 23. Tooltip transforms | DONE | tooltips.js |
| 28. Duplicate selectors | DONE | forms.css |

### Remaining Issues

| Issue | Priority | Effort |
|-------|----------|--------|
| 5. CSS Reset | Medium | Medium |
| 9. Fluid typography | Low | Medium |
| 11. JS breakpoint sync | Low | Low |
| 12. Dynamic init | Medium | High |
| 14. API consistency | Medium | High |
| 15. TypeScript defs | Low | Medium |
| 17. Modal responsive | Low | Low |
| 18. Breadcrumb overflow | Low | Low |
| 19. CSS fallbacks | Medium | Medium |
| 20. Placeholder prefixes | Low | Low |
| 22. Event listener cleanup | Medium | High |
| 24-26. Documentation | Medium | Low |
| 27. Specificity | Low | High |
