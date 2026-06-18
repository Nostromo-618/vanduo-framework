# Tokens

## Token Tiers

Vanduo `1.4.1` uses a strict `--vd-*` custom-property namespace for every shipped design token.

### 1. Palette Tokens

Raw implementation scales:

- `--vd-primary-*`
- `--vd-secondary-*`
- `--vd-gray-*`
- `--vd-success-*`
- `--vd-warning-*`
- `--vd-danger-*`

These are not the primary public API.

### 2. Canonical Semantic Tokens

The canonical Vanduo API lives under `--vd-*`:

- `--vd-color-*`
- `--vd-bg-*`
- `--vd-text-*`
- `--vd-border-*`
- `--vd-shadow-*`

Framework authoring should prefer these semantic tokens whenever an equivalent exists.

### 3. Component, Utility, and Runtime Tokens

Component, utility, effect, and JS-set custom properties also use `--vd-*`:

- `--vd-btn-*`
- `--vd-card-*`
- `--vd-spacing-*`
- `--vd-morph-*`
- `--vd-affix-top-offset`
- `--vd-box-*` / `--vd-stack-*` / `--vd-inline-*` / `--vd-center-*` — layout-primitive internals (see `css/primitives/primitives.css`); each defaults from a semantic/spacing token and is remapped by `data-*` attributes.

Unprefixed token aliases are not shipped in `1.4.1`.

## Source of Truth

- Palette values originate in `css/core/colors.css`.
- Canonical semantic tokens are defined in `css/core/tokens.css`.
- Component, utility, effect, and runtime tokens are defined near their owning CSS or JS modules.
- Layout-primitive internal tokens are defined in `css/primitives/primitives.css`.

## Authoring Rules

- Every framework custom property must start with `--vd-`.
- Prefer semantic tokens over raw palette tokens in component CSS.
- Use raw palette tokens only when defining or composing semantic tokens.

## Example

```css
.notice {
  color: var(--vd-text-primary);
  background: var(--vd-bg-secondary);
  border-color: var(--vd-border-color);
}
```

## Migration Note

The `1.4.1` release removes unprefixed aliases such as color-primary, bg-primary, primary-5, and component-local names like card-bg. Replace each override with its `--vd-*` counterpart.
