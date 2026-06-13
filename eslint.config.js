import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',  // These are not ES modules
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                navigator: 'readonly',
                location: 'readonly',
                performance: 'readonly',
                getComputedStyle: 'readonly',
                MutationObserver: 'readonly',
                ResizeObserver: 'readonly',
                IntersectionObserver: 'readonly',
                Audio: 'readonly',
                HTMLElement: 'readonly',
                Element: 'readonly',
                Node: 'readonly',
                Event: 'readonly',
                CustomEvent: 'readonly',
                KeyboardEvent: 'readonly',
                MouseEvent: 'readonly',
                DOMParser: 'readonly',
                URL: 'readonly',
                CSS: 'readonly',

                // CommonJS globals for UMD compatibility
                module: 'readonly',
                exports: 'readonly',
                define: 'readonly',

                // Vanduo framework globals
                Vanduo: 'writable',
                __VANDUO_VERSION__: 'readonly',
                ready: 'readonly',
                debounce: 'readonly',
                escapeHtml: 'readonly',
                sanitizeHtml: 'readonly'
            }
        },
        rules: {
            // Enforce modern declarations
            'no-var': 'error',
            'prefer-const': 'error',

            // Require strict mode, allowing either global or function form
            strict: ['error', 'safe'],

            // Safer equality while allowing common null checks
            eqeqeq: ['error', 'smart'],

            // Keep framework source tidy; helpers.js stays exempt below.
            'no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }],

            // Runtime logging should stay intentional.
            'no-console': ['error', { allow: ['warn', 'error'] }],

            // Allow empty functions
            'no-empty-function': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }],

            // Disallow accidental shadowing/redeclaration.
            'no-redeclare': 'error',

            // Clean up stale regex/string escapes.
            'no-useless-escape': 'error',

            // Guard raw innerHTML assignment — HTML should be routed through
            // sanitizeHtml()/escapeHtml() or built with the DOM API. Shipped as
            // a warning while the existing call sites are reviewed; promote to
            // 'error' once each is verified or annotated.
            'no-restricted-syntax': ['warn', {
                selector: "AssignmentExpression[left.type='MemberExpression'][left.property.name='innerHTML']",
                message: 'Avoid assigning to innerHTML directly; sanitize via sanitizeHtml()/escapeHtml() or build nodes with the DOM API.'
            }]
        }
    },
    {
        // Override for ES module entry point
        files: ['js/index.js', 'js/components/vd-hex.js', 'js/utils/hex-math.js'],
        languageOptions: {
            sourceType: 'module'
        },
        rules: {
            // ESM is always strict; no directive required
            strict: 'off'
        }
    },
    {
        // Override for helpers.js - these are global utility definitions
        files: ['js/utils/helpers.js'],
        rules: {
            'no-redeclare': 'off',
            'no-unused-vars': 'off',  // These are intentionally global utilities
            // Helpers are top-level globals; strict is enforced by file directive.
            strict: 'off'
        }
    },
    {
        // Ignore dist folder and vendor files
        ignores: ['dist/**', 'phosphor-icons/**', 'devUtils/**', 'scripts/**']
    }
];
