# Tokens

## Token Tiers

Vanduo `1.4.0` uses three token tiers.

### 1. Palette Tokens

Raw implementation scales:

- `--primary-*`
- `--secondary-*`
- `--gray-*`
- `--success-*`
- `--warning-*`
- `--danger-*`

These are not the primary public API.

### 2. Canonical Semantic Tokens

The canonical Vanduo API lives under `--vd-*`:

- `--vd-color-*`
- `--vd-bg-*`
- `--vd-text-*`
- `--vd-border-*`
- `--vd-shadow-*`

Framework authoring should prefer these semantic tokens whenever an equivalent exists.

### 3. Compatibility Aliases

Legacy semantic aliases remain available through the `1.4.x` line:

- `--color-*`
- `--bg-*`
- `--text-*`
- `--border-*`

These aliases map back to the canonical `--vd-*` tokens in `css/core/vd-aliases.css`.

## Source of Truth

- Palette values originate in `css/core/colors.css`.
- Canonical semantic tokens are defined in `css/core/tokens.css`.
- Compatibility aliases are defined in `css/core/vd-aliases.css`.

## Authoring Rules

- Prefer `var(--vd-color-primary)` over `var(--color-primary)`.
- Prefer `var(--vd-text-secondary)` over `var(--text-secondary)`.
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

## Deferred Work

The raw palette namespace is intentionally unchanged in `1.4.0`. A future release can decide whether `--primary-*` and similar scales should also move behind a Vanduo-prefixed public namespace.
