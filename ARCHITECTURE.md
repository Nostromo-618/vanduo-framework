# Architecture

## Runtime Contract

`window.Vanduo` is the public runtime surface:

```js
Vanduo.init(root);
Vanduo.initComponents(root);
Vanduo.reinit(name, root);
Vanduo.destroy(root);
Vanduo.destroyAll();
Vanduo.getComponent(name);
```

- Omit `root` to target the whole document.
- Pass a `Document` or `Element` to scope initialization or teardown to a subtree.
- Registry names are canonical `lowerCamelCase`.

## Lifecycle

`js/utils/lifecycle.js` is the shared cleanup registry.

- `register(element, componentName, cleanupFns, options)`
- `unregister(element, componentName?)`
- `destroyAll(componentName?)`
- `destroyAllInContainer(container, componentName?)`
- `has(element, componentName?)`
- `getAll()`

Stateful components should either:

1. Register cleanup directly with `VanduoLifecycle`, or
2. Keep instance state in a `Map<Element, ...>` so the runtime can synchronize lifecycle cleanup automatically.

## Scoped Initialization

The preferred dynamic-DOM flow is:

```js
const container = document.getElementById('partial-root');
Vanduo.init(container);
```

Use `reinit(name, root)` when a single component needs a targeted reset after DOM replacement.

`lazyLoad` now follows this model and reinitializes only the injected container instead of calling `Vanduo.init()` globally.

## Component Conventions

- Registry names: `lazyLoad`, `docSearch`, `fontSwitcher`, `gridLayout`
- Filenames: kebab-case
- DOM hooks: kebab-case `data-*`
- Convenience globals may remain PascalCase-prefixed for compatibility, such as `window.VanduoLazyLoad`

## CSS Structure

`css/vanduo.css` imports layers in this order:

1. Reset
2. Foundation (`colors.css`, `tokens.css`, `vd-aliases.css`, typography, grid, helpers)
3. Icons
4. Utilities
5. Components
6. Effects
7. Print

The main bundle intentionally includes framework-wide defaults for native form controls. New component work should prefer `.vd-*` selectors over new raw element selectors.
