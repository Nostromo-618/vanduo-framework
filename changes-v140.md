# Vanduo 1.4.0 Changes

## Architecture

- Added scoped runtime APIs for subtree init, reinit, and destroy flows.
- Promoted `VanduoLifecycle` to the central cleanup registry for stateful components.
- Reworked lazy-load content hydration to initialize only the injected container.
- Updated `codeSnippet` to support scoped initialization and automatic syntax highlighting for standard snippet panes, so subtree hydration can activate code examples without full-document reinit.

## Naming

- Canonical component registry names are now `lowerCamelCase`.
- `lazyLoad` is the canonical registry key for the lazy-load component.
- `LazyLoad` remains as a compatibility alias throughout `1.4.x`.

## Tokens

- `--vd-*` is now the canonical Vanduo semantic token API.
- Framework CSS authoring now prefers `--vd-color-*`, `--vd-bg-*`, `--vd-text-*`, and related families.
- Legacy semantic aliases such as `--color-*`, `--bg-*`, and `--text-*` remain supported in `1.4.x`.

## Security and Hygiene

- Added `allowStyle` to `sanitizeHtml()`.
- Internal bubble, tooltip, and toast sanitization now disables inline styles unless explicitly needed.
- `docSearch.highlightTag` now falls back to a safe allowlist.
- Audit threshold moved from `high` to `moderate`.

## CSS Governance

- Documented bundle layer order and form-selector boundaries.
- Added `pnpm run stats:css` for CSS size inventory.
- Re-enabled targeted lint rules for duplicate selectors and zero units, with explicit local exceptions where the cascade is intentional.

## Compatibility Notes

- No public CSS bundle split was introduced in `1.4.0`.
- Native input styling remains part of the main bundle.
- Raw palette tokens such as `--primary-*` and `--gray-*` are unchanged in this release.
