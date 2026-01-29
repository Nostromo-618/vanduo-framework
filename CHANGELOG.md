# Vanduo Framework - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2025-01-29

### Changed

#### Website Restructuring
- **Restructured from single-page to multi-page architecture:**
  - `index.html` — Clean home page with framework overview, core philosophy, and quick start
  - `documentation.html` — Full component documentation with sticky sidebar navigation and scroll-spy
  - `showcase.html` — Template gallery (elevated from `templates/index.html`)
- **Navbar simplified** from 21 section links to 3 page links (Home, Documentation, Showcase)
- **Documentation page** features sticky sidebar with scroll-spy, grouped section navigation, and mobile-responsive collapse
- **SEO improved:** Each page has unique meta tags, canonical URLs, and JSON-LD structured data
- **Sitemap updated** from hash-fragment URLs to actual page URLs for proper search engine indexing
- **`templates/index.html`** now redirects to `showcase.html` for backward compatibility

### Added

#### Code Snippet Component
- **Files:** `css/components/code-snippet.css`, `js/components/code-snippet.js`
- Tabbed interface for HTML/CSS/JS code display
- One-click copy to clipboard functionality
- Collapsible "View Code" toggle
- CSS-based syntax highlighting (no external dependencies)
- Dark mode support
- Keyboard accessible
- Mobile responsive

#### Phosphor Icons Integration
- **Directory:** `icons/phosphor/` - All 6 font weights (regular, fill, bold, light, thin, duotone)
- **Files:** `css/icons/icons.css` (default), `css/icons/icons-all.css` (all weights)
- 1,500+ icons bundled locally, no CDN required
- MIT licensed with attribution
- Usage: `<i class="ph ph-heart"></i>` or `<i class="ph-fill ph-star"></i>`

#### CSS Reset/Normalization
- **File:** `css/core/reset.css`
- Modern CSS reset with box-sizing, margin/padding normalization
- Typography defaults and reduced-motion support

#### Print Styles
- **File:** `css/utilities/print.css`
- Print media stylesheet that hides navigation
- Optimizes layout for printing
- Includes `.d-print-*` utility classes

#### Responsive Spacing Utilities
- **File:** `css/core/helpers.css`
- Added responsive margin/padding classes: `.m-sm-*`, `.m-md-*`, `.m-lg-*`, `.m-xl-*`, `.p-sm-*`, etc.

#### Loading Button States
- **File:** `css/components/buttons.css`
- Added `.btn.is-loading` class with animated spinner for form submissions

#### Skip Navigation Component
- **File:** `css/core/helpers.css`
- Added `.skip-link` utility class for accessible skip navigation

### Fixed

#### Accessibility
- **Focus States:** Replaced all `:focus` selectors with `:focus-visible` for keyboard-only focus styling
  - Files: `buttons.css`, `forms.css`, `typography.css`
- **Reduced Motion:** Added `@media (prefers-reduced-motion: reduce)` to disable animations
  - File: `transitions.css`
- **Touch Targets:** Added mobile media query ensuring 44px minimum touch targets on form elements
  - File: `forms.css`

#### Performance
- **Modal Focus Trap Memory Leak:** Focus trap handler is now stored and removed on modal close
  - File: `modals.js`
- **Modal Z-Index Reset:** Z-index counter now resets to 1050 when all modals are closed
  - File: `modals.js`
- **Event Listener Cleanup:** Added instance-based event listener storage with `destroy()` and `destroyAll()` methods
  - File: `navbar.js`
- **Tooltip Repositioning:** Replaced multiple style assignments with single `transform: translate()` for better performance
  - File: `tooltips.js`

#### Browser Compatibility
- **CSS Variable Fallbacks:** Added fallback values to all color utility classes
  - File: `colors.css`
- **Dark Mode SVG Colors:** Added dark mode overrides for select dropdown arrow colors
  - File: `forms.css`

#### Code Quality
- **Duplicate Selectors:** Removed duplicate `select.input-sm` and `select.input-lg` selectors
  - File: `forms.css`
- **JS Breakpoint Sync:** Added `getBreakpoint()` function that reads `--breakpoint-lg` CSS variable with 992px fallback
  - File: `navbar.js`
- **Console Warnings:** Added `console.warn()` calls for invalid selectors and uninitialized modals
  - File: `modals.js`

### Changed

#### Project Structure
- Moved `examples/index.html` to root `index.html` for cleaner project structure
- Updated all CSS/JS paths from `../css/` and `../js/` to `./css/` and `./js/`
- Replaced `ISSUES_AND_IMPROVEMENTS.md` with `CHANGELOG.md` and `ROADMAP.md`

---

## Summary of Completed Fixes

| Category | Issue | Files Modified |
|----------|-------|----------------|
| Accessibility | `:focus` → `:focus-visible` | buttons.css, forms.css, typography.css |
| Accessibility | `prefers-reduced-motion` | transitions.css |
| Accessibility | Touch target sizes | forms.css |
| Performance | Modal focus trap leak | modals.js |
| Performance | Z-index reset | modals.js |
| Performance | Event listener cleanup | navbar.js |
| Performance | Tooltip transforms | tooltips.js |
| Browser | CSS fallbacks | colors.css |
| Browser | Dark mode SVG colors | forms.css |
| Code Quality | Duplicate selectors | forms.css |
| Code Quality | JS breakpoint sync | navbar.js |
| Code Quality | Console warnings | modals.js |
| Feature | CSS Reset | reset.css (new), vanduo.css |
| Feature | Responsive spacing | helpers.css |
| Feature | Loading button state | buttons.css |
| Feature | Print styles | print.css (new) |
| Feature | Skip link utility | helpers.css |
| Feature | Code snippet component | code-snippet.css (new), code-snippet.js (new) |
