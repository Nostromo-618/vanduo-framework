# Vanduo Framework v1.0.0

**Essential just like water is.** 

- **Pure HTML, CSS, JS** — just peace of mind and clarity.
- **No libraries. No NPM. No build tools. No vulnerabilities. No nonsense.**
- **FOSS now and forever.**

A lightweight, pure HTML/CSS/JS framework for designing beautiful static websites. No dependencies, no build tools, just clean and simple code.

![Built with Kilo](https://img.shields.io/badge/Editor-Kilo-0c8599?style=flat-square)

## Features

- 🎨 **Pure CSS/JS** - No libraries, no dependencies
- 🚀 **Lightweight** - Minimal file size, maximum performance
- 📱 **Responsive** - Mobile-first design approach
- 🎯 **Utility-First** - Flexible utility classes for rapid development
- 🧩 **Modular** - Import only what you need
- ♿ **Accessible** - Built with accessibility in mind (WCAG 2.1 AA)
- 🌙 **Dark Mode** - Automatic OS preference detection + manual toggle
- 🎛️ **Theme Customizer** - Real-time color, radius, font, and mode customization
- 🔍 **SEO-Ready** - Comprehensive meta tags, structured data, and sitemap

---

## Dark Mode

Vanduo includes a two-layer dark mode system that works out of the box.

### How It Works

1. **Automatic** — Respects `prefers-color-scheme: dark` system preference
2. **Manual Override** — Use `data-theme="dark"` attribute on `<html>`

### Usage

```html
<!-- Automatic (uses system preference) -->
<html lang="en">

<!-- Force dark mode -->
<html lang="en" data-theme="dark">

<!-- Force light mode (overrides system preference) -->
<html lang="en" data-theme="light">
```

### JavaScript Theme Toggle

```javascript
// Toggle between light and dark
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
}

// Persist preference
localStorage.setItem('theme', 'dark');
document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || '');
```

### CSS Variables in Dark Mode

All semantic color variables automatically adjust in dark mode:

| Variable | Light Mode | Dark Mode |
|----------|------------|-----------|
| `--bg-primary` | White | Gray-9 |
| `--bg-secondary` | Gray-0 | Gray-8 |
| `--text-primary` | Gray-9 | Gray-0 |
| `--text-secondary` | Gray-7 | Gray-4 |
| `--border-color` | Gray-3 | Gray-7 |

---

## Theme Customizer

Vanduo includes a powerful Theme Customizer component that allows users to personalize the framework's appearance in real-time.

### Features

- **Primary Color**: 18 color options from the Open Color palette
- **Neutral Color**: 5 gray scale variants (Gray, Slate, Zinc, Neutral, Stone)
- **Border Radius**: 5 presets (0, 0.125rem, 0.25rem, 0.375rem, 0.5rem)
- **Font Family**: 6 bundled fonts (JetBrains Mono is default)
- **Color Mode**: System (default), Dark, or Light

All preferences are persisted to `localStorage` and restored on page load.

### Quick Start

```html
<!-- Add trigger button to your navbar -->
<button class="theme-customizer-trigger" 
        data-theme-customizer-trigger 
        aria-label="Open theme customizer">
    <i class="ph ph-sliders-horizontal"></i>
</button>

<!-- Include the JS component -->
<script src="js/components/theme-customizer.js"></script>
```

### JavaScript API

```javascript
// Access the component
const customizer = Vanduo.components.themeCustomizer;

// Open/close programmatically
customizer.open();
customizer.close();
customizer.toggle();

// Get current state
const state = customizer.getState();
// Returns: { primary, neutral, radius, font, theme }

// Set values programmatically
customizer.setPrimary('violet');
customizer.setNeutral('slate');
customizer.setRadius('0.375');
customizer.setFont('inter');
customizer.setTheme('dark');

// Reset to defaults
customizer.reset();
```

### localStorage Keys

| Key | Default | Description |
|-----|---------|-------------|
| `vanduo-primary-color` | `cyan` | Primary brand color |
| `vanduo-neutral-color` | `gray` | Neutral/gray scale |
| `vanduo-radius` | `0.25` | Border radius scale |
| `vanduo-font-preference` | `jetbrains-mono` | Font family |
| `vanduo-theme-preference` | `system` | Color mode |

### Data Attributes

The Theme Customizer sets these attributes on `<html>`:

| Attribute | Example Values | Description |
|-----------|----------------|-------------|
| `data-primary` | `cyan`, `violet`, `rose` | Remaps `--primary-*` CSS variables |
| `data-neutral` | `gray`, `slate`, `zinc` | Remaps `--gray-*` CSS variables |
| `data-radius` | `0`, `0.125`, `0.25`, `0.375`, `0.5` | Sets `--radius-scale` |
| `data-font` | `jetbrains-mono`, `inter` | Sets `--font-family-base` |
| `data-theme` | `light`, `dark` | Forces light/dark mode |

---

## CSS Customization

Vanduo uses CSS custom properties (variables) for theming. Override them to customize your design.

### Primary Theme Colors

```css
:root {
  /* Change primary color to indigo */
  --color-primary: var(--indigo-6);
  --color-primary-light: var(--indigo-5);
  --color-primary-dark: var(--indigo-7);
  
  /* Change secondary color */
  --color-secondary: var(--violet-6);
}
```

### Typography

```css
:root {
  /* Custom font family */
  --font-family-base: 'Your Font', system-ui, sans-serif;
  
  /* Adjust base font size (scales all typography) */
  --font-size-base: 1rem;
  
  /* Custom line height */
  --line-height-base: 1.618; /* Golden ratio */
}
```

### Spacing & Layout

```css
:root {
  /* Container max-widths (Fibonacci-based) */
  --container-sm: 521px;   /* Lucas */
  --container-md: 610px;   /* Fibonacci */
  --container-lg: 987px;   /* Fibonacci */
  --container-xl: 1364px;  /* Lucas */
  --container-2xl: 1597px; /* Fibonacci */
  
  /* Border radius (Fibonacci-based) */
  --radius-sm: 0.125rem;  /* 2px */
  --radius-md: 0.25rem;   /* 4px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.8125rem; /* 13px */
}
```

### Color Palette

Vanduo uses [Open Color](https://yeun.github.io/open-color/) with 10 shades (0-9) for each color:

```css
/* Available color scales */
--gray-0 to --gray-9
--red-0 to --red-9
--orange-0 to --orange-9
--yellow-0 to --yellow-9
--green-0 to --green-9
--teal-0 to --teal-9
--cyan-0 to --cyan-9
--blue-0 to --blue-9
--indigo-0 to --indigo-9
--violet-0 to --violet-9
--pink-0 to --pink-9

/* Semantic aliases */
--color-primary        /* Default: cyan-6 */
--color-secondary      /* Default: gray-6 */
--color-success        /* Default: green-6 */
--color-error          /* Default: red-6 */
--color-warning        /* Default: yellow-6 */
--color-info           /* Default: blue-6 */

/* Alpha variants for overlays/hover states */
--color-primary-alpha-10   /* 10% opacity */
--color-primary-alpha-20   /* 20% opacity */
```

---

## Modular Import Guide

For optimal performance, import only what you need. **Order matters** — dependencies must load first.

### Required (Core)

Always include these first, in this exact order:

```html
<!-- 1. Reset (must be first) -->
<link rel="stylesheet" href="css/core/reset.css">

<!-- 2. Colors (defines all CSS variables) -->
<link rel="stylesheet" href="css/core/colors.css">

<!-- 3. Typography (depends on colors) -->
<link rel="stylesheet" href="css/core/typography.css">

<!-- 4. Grid (layout system) -->
<link rel="stylesheet" href="css/core/grid.css">

<!-- 5. Helpers (spacing, display, etc.) -->
<link rel="stylesheet" href="css/core/helpers.css">
```

### Optional (Pick What You Need)

After core, add components in any order:

```html
<!-- Components -->
<link rel="stylesheet" href="css/components/buttons.css">
<link rel="stylesheet" href="css/components/forms.css">
<link rel="stylesheet" href="css/components/cards.css">
<link rel="stylesheet" href="css/components/navbar.css">
<link rel="stylesheet" href="css/components/modals.css">
<!-- ... add more as needed -->

<!-- Utilities -->
<link rel="stylesheet" href="css/utilities/shadow.css">
<link rel="stylesheet" href="css/utilities/transitions.css">
```

### Dependency Map

| Component | Requires |
|-----------|----------|
| All components | `core/colors.css` |
| `forms.css` | `core/typography.css` |
| `navbar.css` | `components/buttons.css` (optional) |
| `modals.css` | `utilities/transitions.css` (recommended) |
| `tooltips.css` | `utilities/shadow.css` |

### All-in-One (Quick Start)

For prototyping, just use the bundled file:

```html
<link rel="stylesheet" href="css/vanduo.css">
```

---

## Accessibility (WCAG 2.1)

Vanduo is built with accessibility as a priority.

### Keyboard Navigation

- ✅ All interactive elements are focusable
- ✅ `focus-visible` for keyboard-only focus rings
- ✅ Skip links supported via `.skip-link` class
- ✅ Dropdown/modal keyboard navigation (Arrow keys, Escape, Tab)

### Visual

- ✅ Minimum 4.5:1 contrast ratio for text (WCAG AA)
- ✅ 3:1 contrast ratio for large text and UI components
- ✅ Focus indicators visible in both light and dark mode
- ✅ Color is not the only indicator of state (icons/text accompany colors)

### Motion

- ✅ `prefers-reduced-motion` respected
- ✅ Animations can be disabled system-wide

### Touch

- ✅ Minimum 44×44px touch targets on mobile
- ✅ Adequate spacing between interactive elements

### Screen Readers

- ✅ Semantic HTML structure
- ✅ ARIA labels on icon-only buttons
- ✅ Live regions for dynamic content (toasts)

---

## Utility Reference

### Z-Index Scale

Vanduo uses a standardized z-index scale (steps of 10) to manage stacking order.

| Class | Value | Usage |
|-------|-------|-------|
| `.z-negative` | -1 | Background elements |
| `.z-0` | 0 | Default content |
| `.z-10` | 10 | Dropdowns, tooltips |
| `.z-20` | 20 | Sticky headers |
| `.z-30` | 30 | Fixed overlays |
| `.z-40` | 40 | Modals, dialogs |
| `.z-50` | 50 | High priority notifications (toasts) |

---

## Backend Integration

Vanduo is a static framework, but you can easily add backend functionality to forms.

### Contact Forms

For static sites, we recommend using a service like [Formspree](https://formspree.io) or Netlify Forms.

#### Example (Formspree)

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" name="email" id="email" class="input" required>
  </div>
  <div class="form-group">
    <label for="message">Message</label>
    <textarea name="message" id="message" class="textarea" required></textarea>
  </div>
  <button type="submit" class="btn btn-primary">Send</button>
</form>
```

#### Example (Netlify)

```html
<form name="contact" method="POST" data-netlify="true">
  <!-- ... fields ... -->
</form>
```

---

## Browser Compatibility

### Fully Supported

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 105+ | Full support |
| Firefox | 121+ | Full support |
| Safari | 15.4+ | Full support |
| Edge | 105+ | Full support (Chromium-based) |

### Modern CSS Features Used

| Feature | Support | Fallback |
|---------|---------|----------|
| CSS Custom Properties | ✅ All modern | — |
| `color-mix()` | ✅ Chrome 111+, Firefox 113+, Safari 16.2+ | Solid fallback colors |
| `:has()` selector | ✅ Chrome 105+, Firefox 121+, Safari 15.4+ | JS alternatives available |
| `@container` queries | ✅ Chrome 105+, Safari 16+ | Width-based media queries |
| `gap` in flexbox | ✅ All modern | Margin fallbacks |

### Not Supported

- Internet Explorer (any version)
- Chrome < 105
- Firefox < 113
- Safari < 15.4

### Testing Your Site

```bash
# Check feature support for your target browsers
npx browserslist "last 2 Chrome versions, last 2 Firefox versions, last 2 Safari versions"
```


## Quick Start

### Installation

Simply download or clone this repository and include the framework files in your HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <!-- Include Vanduo Framework -->
    <link rel="stylesheet" href="css/vanduo.css">
</head>
<body>
    <!-- Your content here -->
    
    <!-- Include Vanduo JavaScript (optional, only if using interactive components) -->
    <script src="js/vanduo.js"></script>
</body>
</html>
```

### Modular Usage

Import only the components you need:

```html
<!-- Core foundation -->
<link rel="stylesheet" href="css/core/colors.css">
<link rel="stylesheet" href="css/core/typography.css">
<link rel="stylesheet" href="css/core/grid.css">
<link rel="stylesheet" href="css/core/helpers.css">

<!-- Components -->
<link rel="stylesheet" href="css/components/buttons.css">
<link rel="stylesheet" href="css/components/cards.css">

<!-- Utilities -->
<link rel="stylesheet" href="css/utilities/shadow.css">
<link rel="stylesheet" href="css/utilities/transitions.css">
```

## Project Structure

```
vanduo-framework/
├── css/
│   ├── vanduo.css          # Main framework file (imports all)
│   ├── core/               # Foundation styles
│   │   ├── colors.css
│   │   ├── typography.css
│   │   ├── grid.css
│   │   └── helpers.css
│   ├── components/         # UI components
│   │   ├── buttons.css
│   │   ├── forms.css
│   │   ├── cards.css
│   │   ├── theme-customizer.css
│   │   └── ...
│   ├── utilities/          # Utility classes
│   │   ├── media.css
│   │   ├── shadow.css
│   │   ├── transitions.css
│   │   └── table.css
│   └── effects/            # Visual effects
│       └── parallax.css
├── js/
│   ├── vanduo.js          # Main framework file
│   ├── components/        # Component JavaScript
│   └── utils/            # Utility functions
├── icons/                 # Phosphor Icons
├── fonts/                 # Web fonts
├── templates/             # Starter templates
├── index.html             # Framework homepage
└── documentation.html     # Full documentation
```

## Usage Examples

### Buttons

```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-outline">Outline Button</button>
```

### Cards

```html
<div class="card">
    <div class="card-header">
        <h3>Card Title</h3>
    </div>
    <div class="card-body">
        <p>Card content goes here.</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">Action</button>
    </div>
</div>
```

### Grid System

```html
<div class="container">
    <div class="row">
        <div class="col-12 col-md-6 col-lg-4">
            Column 1
        </div>
        <div class="col-12 col-md-6 col-lg-4">
            Column 2
        </div>
        <div class="col-12 col-md-12 col-lg-4">
            Column 3
        </div>
    </div>
</div>
```

### Forms

```html
<form>
    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" class="input" placeholder="Enter your email">
    </div>
    <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" class="textarea" rows="4"></textarea>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

## Development Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed component development phases and priorities.

### Current Status

- ✅ Project structure
- ✅ Phase 1: Foundation (Complete)
  - ✅ Colors - Color system with CSS variables
  - ✅ Typography - Font system, headings, text utilities
  - ✅ Grid - Responsive 12-column grid system
  - ✅ Helpers - Spacing, display, positioning utilities
- ✅ Phase 2: Essential UI Components (Complete)
  - ✅ Shadow Utilities - Elevation and shadow system
  - ✅ Buttons - All variants, sizes, and states
  - ✅ Forms - Inputs, textareas, labels, validation
  - ✅ Cards - Content containers with variants
- ✅ Phase 3: Navigation & Layout (Complete)
  - ✅ Navbar - Responsive navigation with mobile menu
  - ✅ Footer - Multi-column footer layouts
  - ✅ Breadcrumbs - Navigation hierarchy
- ✅ Phase 4: Form Elements (Complete)
  - ✅ Transitions - Animation and transition utilities
  - ✅ Checkboxes - Custom styled checkboxes with all states
  - ✅ Radio Buttons - Custom styled radio buttons
  - ✅ Range - Custom slider/range inputs
  - ✅ Switches - Toggle switches with variants
  - ✅ Select - Enhanced select with JavaScript
- ✅ Phase 5: Interactive Components (Complete)
  - ✅ Tooltips - Contextual information with positioning
  - ✅ Collapsible - Expandable content with accordion mode
  - ✅ Dropdown - Dropdown menus with keyboard navigation
  - ✅ Modals - Modal dialogs with focus management
- ✅ Phase 6: Advanced Features (Complete)
  - ✅ Badges - Status indicator badges with variants
  - ✅ Collections - List/item collection components
  - ✅ Pagination - Page navigation with dynamic JS
  - ✅ Sidenav - Side navigation drawer with responsive behavior
- ✅ Phase 7: Polish & Effects (Complete)
  - ✅ Media Utilities - Responsive images, object-fit, aspect ratios
  - ✅ Table Utilities - Table styling with variants and responsive wrappers
  - ✅ Preloader/Progress Bars - Loading spinners and progress indicators
  - ✅ Parallax - Performance-optimized parallax scroll effects

## Framework Complete! 🎉

Vanduo Framework is now complete with all 7 phases implemented. The framework provides a comprehensive set of components, utilities, and effects for building beautiful static websites with pure HTML, CSS, and JavaScript.

## SEO Implementation

The framework now includes comprehensive SEO features:
- ✅ robots.txt and sitemap.xml
- ✅ Open Graph and Twitter Card meta tags
- ✅ JSON-LD structured data (SoftwareApplication, BreadcrumbList, Organization)
- ✅ Canonical URLs and proper meta tags
- ✅ Favicon support

## Icons

Vanduo includes [Phosphor Icons](https://phosphoricons.com) - a flexible icon family with 1,500+ icons in 6 weights.

### Quick Start

```html
<!-- Include default weights (regular + fill) -->
<link rel="stylesheet" href="css/icons/icons.css">

<!-- Use icons -->
<i class="ph ph-heart"></i>
<i class="ph-fill ph-star"></i>
```

### Available Weights

| Weight | Class | File |
|--------|-------|------|
| Regular | `ph` | `icons/phosphor/regular/style.css` |
| Fill | `ph-fill` | `icons/phosphor/fill/style.css` |
| Bold | `ph-bold` | `icons/phosphor/bold/style.css` |
| Light | `ph-light` | `icons/phosphor/light/style.css` |
| Thin | `ph-thin` | `icons/phosphor/thin/style.css` |
| Duotone | `ph-duotone` | `icons/phosphor/duotone/style.css` |

### Import Options

```html
<!-- Default (regular + fill) - Recommended -->
<link rel="stylesheet" href="css/icons/icons.css">

<!-- All weights (~3MB) -->
<link rel="stylesheet" href="css/icons/icons-all.css">

<!-- Individual weights -->
<link rel="stylesheet" href="icons/phosphor/bold/style.css">
```

### Styling Icons

Icons are font-based and can be styled with CSS:

```html
<i class="ph ph-heart" style="font-size: 32px; color: red;"></i>
```

> **Note:** For SVG icons or advanced use cases, visit [phosphoricons.com](https://phosphoricons.com) to download individual SVG files.

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- **Color System**: [Open Color](https://yeun.github.io/open-color/) by Heeyeun Jeong (MIT License)
- **Icons**: [Phosphor Icons](https://phosphoricons.com) (MIT License)

Vanduo Framework - Built with ❤️ for the web.
