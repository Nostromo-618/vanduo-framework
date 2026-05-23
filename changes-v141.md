# Vanduo v1.4.1 Token Migration

Vanduo `1.4.1` completes the design-token migration started in `1.4.0`.

## Breaking Change

All shipped CSS custom properties now use the `--vd-*` namespace. Legacy unprefixed tokens are no longer defined by the framework.

Examples:

- color-primary -> `--vd-color-primary`
- bg-primary -> `--vd-bg-primary`
- primary-5 -> `--vd-primary-5`
- card-bg -> `--vd-card-bg`
- morph-duration -> `--vd-morph-duration`

## Validation

The release adds static token-prefix coverage and runtime checks for JS-set custom properties so future components stay inside the `--vd-*` token system.
