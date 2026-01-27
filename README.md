# Vanduo Framework

**Essential just like Water is. From Lithuania 🇱🇹 with love ❤️.** 

- **Pure HTML, CSS, JS** — just peace of mind and clarity.
- **No libraries. No NPM. No build tools. No vulnerabilities. No nonsense.**
- **FOSS now and forever.**

_Banzai!_



A lightweight, pure HTML/CSS/JS framework for designing beautiful static websites. No dependencies, no build tools, just clean and simple code.

## Features

- 🎨 **Pure CSS/JS** - No libraries, no dependencies
- 🚀 **Lightweight** - Minimal file size, maximum performance
- 📱 **Responsive** - Mobile-first design approach
- 🎯 **Utility-First** - Flexible utility classes for rapid development
- 🧩 **Modular** - Import only what you need
- ♿ **Accessible** - Built with accessibility in mind
- 🔍 **SEO-Ready** - Comprehensive meta tags, structured data, and sitemap

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
└── examples/              # Example pages
    └── index.html
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

See [SEO-IMPLEMENTATION.md](SEO-IMPLEMENTATION.md) for detailed implementation guide and deployment checklist.

## Development Server

A development server is included for easy testing and collaboration:

```bash
cd devUtils
npm install
npm start
```

The server will start on `http://localhost:3000` and serve the example page. See [devUtils/README.md](devUtils/README.md) for more details.

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Vanduo Framework - Built with ❤️ for the web.

