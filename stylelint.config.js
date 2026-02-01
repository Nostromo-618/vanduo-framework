export default {
    extends: ['stylelint-config-standard'],
    rules: {
        // === Naming & Patterns ===
        'custom-property-pattern': null,
        'selector-class-pattern': null,
        'keyframes-name-pattern': null,

        // === Specificity & Structure ===
        'no-descending-specificity': null,
        'no-duplicate-selectors': null,

        // === Color ===
        'color-hex-length': null,
        'color-function-notation': null,
        'alpha-value-notation': null,
        'color-function-alias-notation': null,

        // === Values ===
        'value-keyword-case': null,
        'shorthand-property-no-redundant-values': null,
        'number-max-precision': null,

        // === Declaration blocks ===
        'declaration-block-no-shorthand-property-overrides': null,
        'declaration-block-single-line-max-declarations': null,
        'declaration-block-no-redundant-longhand-properties': null,

        // === Fonts ===
        'font-family-no-missing-generic-family-keyword': null,
        'font-family-name-quotes': null,

        // === Empty lines ===
        'block-no-empty': null,
        'comment-empty-line-before': null,
        'custom-property-empty-line-before': null,
        'rule-empty-line-before': null,
        'at-rule-empty-line-before': null,

        // === Deprecated properties ===
        'property-no-deprecated': null,
        'declaration-property-value-keyword-no-deprecated': null,

        // === Vendor prefixes ===
        'property-no-vendor-prefix': null,
        'selector-no-vendor-prefix': null,
        'value-no-vendor-prefix': null,

        // === Import ===
        'import-notation': null,

        // === Selectors ===
        'selector-not-notation': null,

        // === Media ===
        'media-feature-range-notation': null,

        // === Length ===
        'length-zero-no-unit': null
    }
};
