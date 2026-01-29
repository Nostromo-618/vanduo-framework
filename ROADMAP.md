# Vanduo Framework - Roadmap

Planned features and improvements for the Vanduo Framework.

---

## High Priority

### Documentation
- [x] **Multi-page Documentation** - Site restructured into Home, Documentation, and Showcase pages with dedicated navigation
- [ ] **Theme Switching Documentation** - Dark mode exists via `[data-theme="dark"]` and `theme-switcher.js`, but README doesn't mention it
- [ ] **CSS Variable Customization Guide** - No guide on how to override `--color-primary`, `--btn-border-radius`, etc.
- [ ] **Modular Import Strategy** - README shows file structure but doesn't explain how to import only specific components

### Developer Experience
- [ ] **Dynamic Component Initialization** - Components only initialize on page load. Dynamically added HTML (via AJAX) won't work without manual `Component.init()` calls
- [ ] **Consistent Component APIs** - Standardize APIs across components:
  - Modal: `.open()`, `.close()`, fires events
  - Dropdown: uses class toggle only
  - Select: different initialization pattern

---

## Medium Priority

### Responsive & Mobile
- [ ] **Modal Responsive Sizing** - Only `.modal-fullscreen-sm-down` exists. Add medium/large responsive variants for tablets
- [ ] **Breadcrumb Overflow** - Long breadcrumbs don't collapse or truncate on small screens

### CSS Quality
- [ ] **High Specificity Selectors** - Reduce specificity of selectors like `.btn-primary:hover:not(:disabled):not(.disabled)` which are hard to override without `!important`

### Browser Compatibility
- [ ] **Placeholder Styling** - Add vendor prefixes for full browser support in `css/components/forms.css`

---

## Low Priority

### Features
- [ ] **Fluid Typography** - Font sizes are fixed. Consider using `clamp()` for responsive scaling
- [ ] **TypeScript Definitions** - Add `.d.ts` files for IDE autocomplete when using `window.Vanduo`

---

## Future Considerations

### Components
- [ ] Carousel/Slider component
- [ ] Date picker component
- [ ] File upload component with drag-and-drop
- [ ] Stepper/Wizard component
- [ ] Timeline component

### Utilities
- [ ] CSS Grid utilities
- [ ] Aspect ratio utilities
- [ ] Container queries support

### Accessibility
- [ ] ARIA live regions for dynamic content
- [ ] Screen reader announcements for component state changes
- [ ] High contrast mode support

### Performance
- [ ] Critical CSS extraction guide
- [ ] Lazy loading patterns for components
- [ ] Bundle size optimization guide

---

## Issue Reference

These items were originally tracked in `ISSUES_AND_IMPROVEMENTS.md` and have been migrated to this roadmap:

| Original # | Description | Priority |
|------------|-------------|----------|
| 9 | Fluid typography | Low |
| 12 | Dynamic component initialization | High |
| 14 | Consistent component APIs | High |
| 15 | TypeScript definitions | Low |
| 17 | Modal responsive sizing | Medium |
| 18 | Breadcrumb overflow | Medium |
| 20 | Placeholder vendor prefixes | Medium |
| 24-26 | Documentation gaps | High |
| 27 | High specificity selectors | Medium |
