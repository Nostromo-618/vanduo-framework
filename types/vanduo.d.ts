/**
 * Vanduo Framework — TypeScript declarations for the runtime object.
 *
 * These cover the `Vanduo` runtime surface (init / lifecycle / registry).
 * Per-component option and instance types are intentionally out of scope for
 * now; component objects are typed loosely as `VanduoComponent`.
 */

/** A node that can scope component initialization. */
export type VanduoRoot = Document | Element | DocumentFragment;

/** Options accepted when registering a component. */
export interface VanduoRegisterOptions {
  /** Alternate names that resolve to this component. */
  aliases?: string[];
}

/**
 * A registered component. Components self-register via `Vanduo.register` and
 * typically expose `init` / `destroyAll`. Additional members vary per component
 * and are intentionally untyped here.
 */
export interface VanduoComponent {
  init?(root?: VanduoRoot): void;
  destroyAll?(root?: VanduoRoot): void;
  [key: string]: unknown;
}

/** The Vanduo framework runtime object (also available as `window.Vanduo`). */
export interface VanduoStatic {
  /** Framework version (matches package.json). */
  readonly version: string;
  /** Registered components keyed by canonical name. */
  readonly components: Record<string, VanduoComponent>;
  /** Alias → canonical-name map. */
  readonly aliases: Record<string, string>;

  /** Resolve an alias to its canonical component name. */
  resolveComponentName(name: string): string;

  /**
   * Initialize the framework. With no argument (or `document`) it waits for DOM
   * ready and initializes every component; with an element/fragment it
   * initializes components within that scope immediately.
   */
  init(root?: VanduoRoot): void;

  /** Initialize all registered components within `root` (defaults to document). */
  initComponents(root?: VanduoRoot): void;

  /** Register a component under `name`, optionally with aliases. */
  register(name: string, component: VanduoComponent, options?: VanduoRegisterOptions): void;

  /** Register an additional alias for an existing component. */
  registerAlias(alias: string, name: string): void;

  /** Destroy then re-initialize a single component within `root`. */
  reinit(name: string, root?: VanduoRoot): void;

  /** Destroy component instances within `root` (defaults to document). */
  destroy(root?: VanduoRoot): void;

  /** Destroy all component instances across the document. */
  destroyAll(): void;

  /** Get a registered component by (canonical or alias) name, or `null`. */
  getComponent(name: string): VanduoComponent | null;
}

export const Vanduo: VanduoStatic;
export default Vanduo;

declare global {
  interface Window {
    Vanduo: VanduoStatic;
  }
}
