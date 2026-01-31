# Vanduo Framework v1.0.0

**Essential just like water is.** 

- **Pure HTML, CSS, JS** — just peace of mind and clarity.
- **No libraries. No NPM. No build tools. No vulnerabilities. No nonsense.**
- **FOSS now and forever.**

![Built with Kilo](https://img.shields.io/badge/Editor-Kilo-0c8599?style=flat-square)

## Overview

A lightweight, pure HTML/CSS/JS framework for designing beautiful static websites. No dependencies, no build tools, just clean and simple code.

[**Browse Full Documentation &rarr;**](documentation.html)

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

## Quick Start

### Option 1: Production Bundle (Recommended)

The fastest way to get started. Copy the `dist/` folder to your project:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <!-- Minified CSS (includes all components, fonts, icons) -->
    <link rel="stylesheet" href="dist/vanduo.min.css">
</head>
<body>
    <!-- Your content here -->
    
    <!-- Minified JS (includes all interactive components) -->
    <script src="dist/vanduo.min.js"></script>
</body>
</html>
```

The `dist/` folder is **self-contained** (CSS, JS, Fonts, Icons).

### Option 2: Development/Source Files

For development or when you need more control:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <!-- Full unminified CSS -->
    <link rel="stylesheet" href="css/vanduo.css">
</head>
<body>
    <!-- Your content here -->
    
    <!-- Core framework + individual components as needed -->
    <script src="js/vanduo.js"></script>
</body>
</html>
```

---

## Documentation

Comprehensive documentation for all components, utilities, and customization options is included in the project.

[**View Documentation (documentation.html)**](documentation.html)

### Key Capabilities

*   **Dark Mode**: Works automatically with system preferences. Can be forced via `data-theme="dark"` on `<html>`.
*   **Theme Customizer**: Built-in runtime tool to change colors, fonts, and radius.
*   **Modular Imports**: Import only specific components (e.g., `css/components/buttons.css`) to keep your site lean.
*   **Icons**: Includes [Phosphor Icons](https://phosphoricons.com) (Regular + Fill weights bundled).

---

## Project Structure

```
vanduo-framework/
├── dist/                  # Production ready files (minified)
├── css/
│   ├── vanduo.css         # Main framework file (imports all)
│   ├── core/              # Foundation (colors, typography, grid)
│   ├── components/        # UI components (buttons, cards, etc)
│   ├── utilities/         # Utility classes
│   └── effects/           # Visual effects
├── js/
│   ├── vanduo.js          # Main entry point
│   └── components/        # Component logic
├── icons/                 # Phosphor Icons
├── fonts/                 # Web fonts
├── index.html             # Framework homepage
└── documentation.html     # Full documentation
```

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
