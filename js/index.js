/**
 * Vanduo Framework - Bundle Entry Point
 * This file imports all framework components for bundling.
 *
 * All component files are side-effect modules that:
 *   1. Define their component object
 *   2. Register with window.Vanduo via Vanduo.register()
 *   3. Expose a convenience global (e.g. window.VanduoTooltips)
 *
 * The IIFE build uses `globalName: 'VanduoBundle'` so that esbuild's
 * wrapper variable does NOT shadow the real `window.Vanduo` that the
 * side-effect scripts create. After the bundle executes, `window.Vanduo`
 * is the fully-populated framework object.
 *
 * For ESM/CJS consumers we re-export `window.Vanduo` as the default
 * and named export so `import { Vanduo }` and `const { Vanduo } = require()`
 * both work.
 */

// Utilities (must load first — helpers defines `ready()`, `safeStorageGet()` etc.)
import './utils/helpers.js';
import './utils/lifecycle.js';

// Core framework object (creates window.Vanduo)
import './vanduo.js';

// Components (each registers itself with window.Vanduo)
import './components/code-snippet.js';
import './components/collapsible.js';
import './components/dropdown.js';
import './components/font-switcher.js';
import './components/grid.js';
import './components/image-box.js';
import './components/modals.js';
import './components/navbar.js';
import './components/pagination.js';
import './components/parallax.js';
import './components/preloader.js';
import './components/select.js';
import './components/sidenav.js';
import './components/tabs.js';
import './components/theme-customizer.js';
import './components/theme-switcher.js';
import './components/toast.js';
import './components/tooltips.js';
import './components/doc-search.js';
import './components/draggable.js';
import './components/lazy-load.js';

// Effects (glass scroll activation)
import './components/glass.js';

// Phase 10 (v1.2.7) components
import './components/flow.js';
import './components/bubble.js';
import './components/waypoint.js';
import './components/ripple.js';
import './components/affix.js';
import './components/suggest.js';
import './components/validate.js';
import './components/datepicker.js';
import './components/timepicker.js';
import './components/stepper.js';
import './components/rating.js';
import './components/transfer.js';
import './components/tree.js';
import './components/spotlight.js';
import './components/music-player.js';

// Re-export for ESM / CJS consumers
const Vanduo = window.Vanduo;
export { Vanduo };
export default Vanduo;
