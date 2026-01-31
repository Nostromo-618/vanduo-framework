/**
 * Vanduo Framework Build Script
 * Bundles and minifies CSS and JS files for production
 */

import { transform } from 'lightningcss';
import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

// Ensure dist directory exists
if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
}

const isMinify = process.argv.includes('--minify');

console.log(`🌊 Vanduo Build ${isMinify ? '(production)' : '(development)'}`);
console.log('─'.repeat(50));

/**
 * Recursively copy a directory
 */
function copyDir(src, dest) {
    if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
    }

    const entries = readdirSync(src);

    for (const entry of entries) {
        const srcPath = join(src, entry);
        const destPath = join(dest, entry);
        const stat = statSync(srcPath);

        if (stat.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Copy fonts and icons to dist
 */
function copyAssets() {
    console.log('📦 Copying assets...');

    // Copy fonts
    const fontsDir = resolve(rootDir, 'fonts');
    const distFontsDir = resolve(distDir, 'fonts');
    if (existsSync(fontsDir)) {
        copyDir(fontsDir, distFontsDir);
        console.log('   ✅ fonts/');
    }

    // Copy icons
    const iconsDir = resolve(rootDir, 'icons');
    const distIconsDir = resolve(distDir, 'icons');
    if (existsSync(iconsDir)) {
        copyDir(iconsDir, distIconsDir);
        console.log('   ✅ icons/');
    }
}

/**
 * Read CSS file and resolve @import statements
 */
function resolveCSSImports(filePath, basePath) {
    let css = readFileSync(filePath, 'utf8');

    // Find all @import url('...') statements
    const importRegex = /@import\s+url\(['"]?([^'")\s]+)['"]?\);?/g;
    let match;

    while ((match = importRegex.exec(css)) !== null) {
        const importPath = match[1];
        const fullPath = resolve(basePath, importPath);

        if (existsSync(fullPath)) {
            const importedCSS = resolveCSSImports(fullPath, dirname(fullPath));
            css = css.replace(match[0], importedCSS);
        } else {
            console.warn(`⚠️  Import not found: ${importPath}`);
        }
    }

    return css;
}

/**
 * Rewrite asset paths in CSS for dist folder structure
 */
function rewriteAssetPaths(css) {
    // Rewrite font paths: ../../fonts/ -> ./fonts/
    css = css.replace(/url\(['"]?\.\.\/\.\.\/fonts\//g, "url('./fonts/");

    // Rewrite icon paths: ../../icons/ -> ./icons/
    css = css.replace(/url\(['"]?\.\.\/\.\.\/icons\//g, "url('./icons/");

    return css;
}

// Build CSS
async function buildCSS() {
    const inputPath = resolve(rootDir, 'css/vanduo.css');
    const outputPath = resolve(distDir, isMinify ? 'vanduo.min.css' : 'vanduo.css');

    try {
        // Resolve all imports into one file
        let bundledCSS = resolveCSSImports(inputPath, dirname(inputPath));

        // Rewrite asset paths for dist folder structure
        bundledCSS = rewriteAssetPaths(bundledCSS);

        // Transform/minify with LightningCSS
        const { code, map } = transform({
            filename: 'vanduo.css',
            code: Buffer.from(bundledCSS),
            minify: isMinify,
            sourceMap: true
        });

        writeFileSync(outputPath, code);
        if (map) {
            writeFileSync(outputPath + '.map', map);
        }

        const sizeKB = (code.length / 1024).toFixed(1);
        console.log(`✅ CSS: ${isMinify ? 'vanduo.min.css' : 'vanduo.css'} (${sizeKB} KB)`);
    } catch (error) {
        console.error('❌ CSS build failed:', error.message);
        if (error.loc) {
            console.error(`   at line ${error.loc.line}, column ${error.loc.column}`);
        }
        process.exit(1);
    }
}

// Build JS
async function buildJS() {
    const inputPath = resolve(rootDir, 'js/index.js');
    const outputPath = resolve(distDir, isMinify ? 'vanduo.min.js' : 'vanduo.js');

    try {
        await esbuild.build({
            entryPoints: [inputPath],
            bundle: true,
            minify: isMinify,
            sourcemap: true,
            outfile: outputPath,
            format: 'iife',
            globalName: 'Vanduo',
            target: ['es2020'],
            logLevel: 'warning'
        });

        const stats = readFileSync(outputPath);
        const sizeKB = (stats.length / 1024).toFixed(1);
        console.log(`✅ JS:  ${isMinify ? 'vanduo.min.js' : 'vanduo.js'} (${sizeKB} KB)`);
    } catch (error) {
        console.error('❌ JS build failed:', error.message);
        process.exit(1);
    }
}

// Run builds
async function build() {
    copyAssets();
    await buildCSS();
    await buildJS();
    console.log('─'.repeat(50));
    console.log('🎉 Build complete!');
}

build();
