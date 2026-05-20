# Contributing

Thanks for your interest in Vanduo Framework.

## Current Status

The framework is in an early stage and we are not yet accepting external contributions. This helps us move quickly while the architecture and roadmap are still settling.

We genuinely appreciate your enthusiasm. Please check back later as we plan to open contributions once the project stabilizes.

## Development Setup

### Prerequisites

- **Node.js ≥ 18** (20+ recommended)
- **Corepack enabled**: `corepack enable` (ships with Node.js, activates pnpm)

### First-time Setup

```sh
corepack enable          # Activates pnpm from packageManager field
pnpm install             # Installs dependencies
pnpm run build           # Verifies build works
pnpm test                # Runs test suite
```

### Useful Release Checks

```sh
pnpm run lint
pnpm run build
pnpm run check:versions
pnpm run stats:css
pnpm audit --audit-level=moderate
```

### Security Rules

1. **Never use `npm install` or `yarn`** — always use `pnpm`
2. **Never run `--ignore-scripts` globally** — use `pnpm.allowedBuilds` in `package.json`
3. **Review `pnpm audit`** output before merging PRs
4. **Pin exact versions** — `save-exact=true` is enforced by `.npmrc`
5. **Adding new dependencies** requires team review (PR description must justify the addition)

## How You Can Help Right Now

Even though code contributions are paused, you can still support the project by:

- Reporting bugs or documentation issues via GitHub Issues
- Suggesting ideas or feature requests with clear use cases
- Sharing the project with others who might find it useful

## Future Contributions

When contributions open up, we plan to accept:

- Documentation improvements
- Bug fixes
- New components or enhancements

We will update this file with full guidelines, coding standards, and workflow details at that time.

## Internal Authoring Notes

### CSS Layer Order

`css/vanduo.css` imports layers in this order:

1. Reset
2. Foundation
3. Icons
4. Utilities
5. Components
6. Effects
7. Print

### Token Rules

- Prefer canonical semantic `--vd-*` tokens in framework authoring.
- Treat `--color-*`, `--bg-*`, and `--text-*` as compatibility aliases.
- Use raw palette scales only when defining semantic tokens.

### Selector Rules

- New component styling should prefer `.vd-*` hooks.
- New raw element selectors belong in reset or base layers only.
- The main bundle still includes native form defaults by design.

### CSS Maintenance Hotspots

As of `1.4.0`, the largest CSS files are:

- `css/core/helpers.css`
- `css/components/forms.css`
- `css/core/grid.css`
- `css/core/colors.css`
- `css/components/theme-customizer.css`

Use `pnpm run stats:css` before large CSS work so size changes stay intentional.

## Communication

Please use GitHub Issues for questions, bug reports, or feedback. If your report is security-related, follow the instructions in SECURITY.md.

---

Thank you for your patience and support.
