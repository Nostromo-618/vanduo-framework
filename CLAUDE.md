# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vanduo is a zero-dependency, pure HTML/CSS/JS framework for building static websites. No build tools, no transpilation, no npm packages in the framework itself.

## Development Commands

```bash
# Start development server (port 4860)
cd devUtils && npm install && npm start

# Custom port
PORT=3000 npm start
```

No build, test, or lint commands exist by design.

## Architecture

### CSS Structure (`css/`)
Layered architecture imported via `css/vanduo.css`:
- **core/** - Foundation: colors (CSS variables), typography, 12-column grid, spacing/display helpers
- **components/** - 15 UI components (buttons, forms, cards, navbar, modals, dropdowns, etc.)
- **utilities/** - shadows, transitions, media utilities, table styling
- **effects/** - parallax scroll effects

### JavaScript Structure (`js/`)
- **vanduo.js** - Main entry point with component registry
- **utils/helpers.js** - Shared DOM utilities used by all components (`$`, `$$`, `on`, `ready`, `debounce`, etc.)
- **components/** - 11 interactive component modules (navbar, modals, dropdown, tooltips, select, etc.)

### Key Patterns

**Component Registration:**
```javascript
// All components use IIFE pattern and self-register
(function() {
  'use strict';
  const Component = { init: function() { /* ... */ } };
  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('componentName', Component);
  }
})();
```

**State Management:**
- CSS classes for state: `.is-open`, `.is-active`, `.disabled`
- Data attributes for config: `data-modal`, `data-tooltip-position`, `data-backdrop`
- Theme stored in localStorage key `vanduo-theme-preference`

**Theming:**
- CSS variables defined in `css/core/colors.css`
- Theme switching via `[data-theme="dark"]` on `<html>`
- Supports light/dark/system preference

### Responsive Breakpoints
- sm: 576px, md: 768px, lg: 992px, xl: 1200px, 2xl: 1400px

## Key Files

- `examples/index.html` - Full documentation and component demos
- `js/utils/helpers.js` - DOM utilities (read this to understand component patterns)
- `css/core/colors.css` - CSS variable definitions for theming
- `js/vanduo.js` - Framework initialization and component registry
