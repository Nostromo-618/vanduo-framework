# Vanduo Framework Migration Guide

## v1.0.x → v1.1.0

This guide helps you migrate from Vanduo Framework v1.0.x to v1.1.0. This is a **breaking change** release.

---

## Breaking Changes Summary

1. **All CSS classes now use `vd-` prefix** (e.g., `.btn` → `.vd-btn`)
2. **Manual initialization required** (no more auto-init)
3. **New ESM/CJS module formats** available

---

## 1. CSS Class Prefixing

All CSS classes now use the `vd-` prefix to prevent collisions with other frameworks.

### Quick Reference: Common Classes

| Old Class | New Class |
|-----------|-----------|
| `.container` | `.vd-container` |
| `.container-fluid` | `.vd-container-fluid` |
| `.row` | `.vd-row` |
| `.col-*` | `.vd-col-*` |
| `.btn` | `.vd-btn` |
| `.btn-primary` | `.vd-btn-primary` |
| `.card` | `.vd-card` |
| `.navbar` | `.vd-navbar` |
| `.modal` | `.vd-modal` |
| `.dropdown` | `.vd-dropdown` |
| `.alert` | `.vd-alert` |
| `.badge` | `.vd-badge` |
| `.form-control` | `.vd-form-control` |
| `.text-center` | `.vd-text-center` |
| `.font-bold` | `.vd-font-bold` |
| `.m-1`, `.p-2` | `.vd-m-1`, `.vd-p-2` |
| `.d-flex` | `.vd-d-flex` |

### Migration Script (Node.js)

```javascript
// migration-script.js
const fs = require('fs');
const path = require('path');

const classMappings = {
  // Layout
  'container': 'vd-container',
  'container-fluid': 'vd-container-fluid',
  'container-xl': 'vd-container-xl',
  'container-wide': 'vd-container-wide',
  'row': 'vd-row',
  'col-': 'vd-col-',
  'offset-': 'vd-offset-',
  'order-': 'vd-order-',

  // Components
  'btn': 'vd-btn',
  'btn-group': 'vd-btn-group',
  'card': 'vd-card',
  'navbar': 'vd-navbar',
  'nav-link': 'vd-nav-link',
  'modal': 'vd-modal',
  'dropdown': 'vd-dropdown',
  'dropdown-toggle': 'vd-dropdown-toggle',
  'dropdown-menu': 'vd-dropdown-menu',
  'tabs': 'vd-tabs',
  'tab': 'vd-tab',
  'alert': 'vd-alert',
  'badge': 'vd-badge',
  'toast': 'vd-toast',
  'tooltip': 'vd-tooltip',
  'popover': 'vd-popover',
  'spinner': 'vd-spinner',
  'progress': 'vd-progress',
  'collapsible': 'vd-collapsible',
  'sidenav': 'vd-sidenav',
  'pagination': 'vd-pagination',
  'breadcrumb': 'vd-breadcrumb',
  'chip': 'vd-chip',
  'avatar': 'vd-avatar',
  'skeleton': 'vd-skeleton',

  // Forms
  'form-control': 'vd-form-control',
  'form-select': 'vd-form-select',
  'form-check': 'vd-form-check',
  'input-group': 'vd-input-group',

  // Typography
  'text-': 'vd-text-',
  'font-': 'vd-font-',
  'display-': 'vd-display-',

  // Utilities
  'd-': 'vd-d-',
  'm-': 'vd-m-',
  'mt-': 'vd-mt-',
  'mr-': 'vd-mr-',
  'mb-': 'vd-mb-',
  'ml-': 'vd-ml-',
  'mx-': 'vd-mx-',
  'my-': 'vd-my-',
  'p-': 'vd-p-',
  'pt-': 'vd-pt-',
  'pr-': 'vd-pr-',
  'pb-': 'vd-pb-',
  'pl-': 'vd-pl-',
  'px-': 'vd-px-',
  'py-': 'vd-py-',
  'gap-': 'vd-gap-',
  'shadow-': 'vd-shadow-',
};

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [oldClass, newClass] of Object.entries(classMappings)) {
    // Replace class="old" with class="new"
    const regex = new RegExp(`class="([^"]*)\\b${oldClass}\\b([^"]*)"`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `class="$1${newClass}$2"`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migrated: ${filePath}`);
  }
}

// Usage: node migration-script.js path/to/your/html/files
const targetDir = process.argv[2] || '.';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.htm')) {
      migrateFile(filePath);
    }
  }
}

processDirectory(targetDir);
console.log('Migration complete!');
```

---

## 2. Manual Initialization

The framework no longer auto-initializes. You must explicitly call `Vanduo.init()`.

### Before (v1.0.x)
```html
<script src="vanduo.min.js"></script>
<!-- Components auto-initialized -->
```

### After (v1.1.0)
```html
<script src="vanduo.min.js"></script>
<script>Vanduo.init();</script>
```

### For Dynamic Content (SPAs)
```javascript
// After adding new content to DOM
// Some components cache instances; destroy before re-init for new DOM
Vanduo.destroyAll();         // Or call component.destroyAll() if available
Vanduo.init();               // Re-init all components

// If you only need one component:
Vanduo.getComponent('dropdown')?.destroyAll?.();
Vanduo.reinit('dropdown');
```

### Cleanup (SPAs)
```javascript
// Before navigating away / removing content
Vanduo.destroyAll();  // Cleans up all event listeners
```

---

## 3. Module Format Changes

### CDN Usage (unchanged)
```html
<!-- IIFE format (same as before) -->
<script src="https://cdn.jsdelivr.net/gh/Nostromo-618/vanduo-framework@v1.1.0/dist/vanduo.min.js"></script>
<script>Vanduo.init();</script>
```

### ES Modules (new)
```javascript
// Using ES modules
import { Vanduo } from 'vanduo-framework';

Vanduo.init();
```

### CommonJS (new)
```javascript
// Using CommonJS
const { Vanduo } = require('vanduo-framework');

Vanduo.init();
```

### Package.json Exports
```json
{
  "exports": {
    ".": {
      "import": "./dist/vanduo.esm.js",
      "require": "./dist/vanduo.cjs.js"
    },
    "./css": "./dist/vanduo.min.css"
  }
}
```

---

## 4. Lifecycle Manager (Advanced)

For SPAs and dynamic applications, use the lifecycle manager to prevent memory leaks:

```javascript
// Register a custom component with cleanup
const myComponent = {
  init: function() {
    const elements = document.querySelectorAll('.my-element');
    elements.forEach(el => {
      const handler = () => console.log('clicked');
      el.addEventListener('click', handler);

      // Register for cleanup
      VanduoLifecycle.register(el, 'myComponent', [
        () => el.removeEventListener('click', handler)
      ]);
    });
  },

  destroyAll: function() {
    VanduoLifecycle.destroyAll('myComponent');
  }
};

// Cleanup before page navigation
window.addEventListener('beforeunload', () => {
  Vanduo.destroyAll();
});
```

---

## Complete Before/After Example

### v1.0.x
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="vanduo.min.css">
</head>
<body>
  <div class="container">
    <div class="card">
      <button class="btn btn-primary">Click me</button>
    </div>
  </div>
  <script src="vanduo.min.js"></script>
</body>
</html>
```

### v1.1.0
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="vanduo.min.css">
</head>
<body>
  <div class="vd-container">
    <div class="vd-card">
      <button class="vd-btn vd-btn-primary">Click me</button>
    </div>
  </div>
  <script src="vanduo.min.js"></script>
  <script>Vanduo.init();</script>
</body>
</html>
```

---

## Benefits of v1.1.0

1. **No CSS Collisions**: `vd-` prefix ensures Vanduo doesn't conflict with Bootstrap, Tailwind, etc.
2. **Tree-Shaking**: ESM format allows bundlers to remove unused components
3. **Memory Safety**: Lifecycle manager prevents leaks in SPAs
4. **Explicit Control**: Manual init gives you control over when components initialize

---

## Need Help?

- [Full Documentation](https://vanduo.dev/documentation.html)
- [GitHub Issues](https://github.com/Nostromo-618/vanduo-framework/issues)
- [Changelog](https://vanduo.dev/changelog.html)
