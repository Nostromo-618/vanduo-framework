/**
 * Vanduo Framework Build Script
 * Bundles and minifies CSS and JS files for production
 */

import { transform } from 'lightningcss';
import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync } from 'fs';
import { resolve, dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

// Ensure dist directory exists
if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
}

const isMinify = process.argv.includes('--minify');

// Read package.json for version
const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));

/**
 * Get the current git commit hash (short)
 */
function getGitCommit() {
    try {
        return execSync('git rev-parse --short HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
    } catch {
        return 'unknown';
    }
}

/**
 * Get build info object
 */
function getBuildInfo() {
    const now = new Date();
    return {
        version: pkg.version,
        builtAt: now.toISOString(),
        commit: getGitCommit(),
        mode: isMinify ? 'production' : 'development'
    };
}

/**
 * Generate build banner comment
 */
function getBanner(buildInfo) {
    return `/*! Vanduo v${buildInfo.version} | Built: ${buildInfo.builtAt} | git:${buildInfo.commit} | ${buildInfo.mode} */`;
}

/**
 * Write build-info.json to dist
 */
function writeBuildInfo(buildInfo) {
    const buildInfoPath = resolve(distDir, 'build-info.json');
    writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    console.log('📋 build-info.json generated');
}

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
 * Read CSS file and resolve @import statements.
 * Rewrites url() references in imported files to be relative to the entry
 * CSS directory so that asset paths survive inlining.
 */
function resolveCSSImports(filePath, basePath, entryDir) {
    if (!entryDir) entryDir = basePath;
    let css = readFileSync(filePath, 'utf8');

    // Rewrite non-import url() references to be relative to the entry CSS
    // directory. This ensures font/icon asset paths stay valid after CSS
    // files from different directory depths are inlined together.
    if (basePath !== entryDir) {
        // Temporarily replace @import lines with placeholders so they are
        // not affected by the url() rewriting below.
        const imports = [];
        css = css.replace(/@import\s+url\([^)]+\);?/g, (m) => {
            imports.push(m);
            return `__IMPORT_PLACEHOLDER_${imports.length - 1}__`;
        });

        // Rewrite remaining url() references (fonts, icons, images, etc.)
        css = css.replace(/url\(\s*['"]?(?!data:|https?:|#)([^'")\s]+)['"]?\s*\)/g, (match, urlPath) => {
            const absoluteUrl = resolve(basePath, urlPath);
            const newPath = relative(entryDir, absoluteUrl);
            return `url('${newPath}')`;
        });

        // Restore @import lines
        css = css.replace(/__IMPORT_PLACEHOLDER_(\d+)__/g, (_, i) => imports[parseInt(i)]);
    }

    // Find all @import url('...') statements
    const importRegex = /@import\s+url\(['"']?([^'")\s]+)['"']?\);?/g;
    let match;

    while ((match = importRegex.exec(css)) !== null) {
        const importPath = match[1];
        const fullPath = resolve(basePath, importPath);

        if (existsSync(fullPath)) {
            const importedCSS = resolveCSSImports(fullPath, dirname(fullPath), entryDir);
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
    // Rewrite font paths: any number of ../ followed by fonts/ -> ./fonts/
    css = css.replace(/url\(\s*['"]?(?:\.\.\/)+fonts\//g, "url('./fonts/");

    // Rewrite icon paths: any number of ../ followed by icons/ -> ./icons/
    css = css.replace(/url\(\s*['"]?(?:\.\.\/)+icons\//g, "url('./icons/");

    return css;
}

// Build CSS
async function buildCSS(banner) {
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

        // Prepend banner to CSS
        const finalCSS = banner + '\n' + code.toString();
        writeFileSync(outputPath, finalCSS);
        if (map) {
            writeFileSync(outputPath + '.map', map);
        }

        const sizeKB = (finalCSS.length / 1024).toFixed(1);
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
async function buildJS(banner) {
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
            // NOTE: Do NOT use globalName here. All components register
            // themselves via side effects (window.Vanduo.register(...)).
            // Using globalName would cause esbuild to assign the module's
            // export wrapper { default: ..., __esModule: true } to a global,
            // which would shadow the real window.Vanduo object.
            target: ['es2020'],
            banner: { js: banner },
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

// Build JS - ESM format (for modern bundlers)
async function buildJSESM(banner) {
    const inputPath = resolve(rootDir, 'js/index.js');
    const outputPath = resolve(distDir, isMinify ? 'vanduo.esm.min.js' : 'vanduo.esm.js');

    try {
        await esbuild.build({
            entryPoints: [inputPath],
            bundle: true,
            minify: isMinify,
            sourcemap: true,
            outfile: outputPath,
            format: 'esm',
            target: ['es2020'],
            banner: { js: banner },
            logLevel: 'warning'
        });

        const stats = readFileSync(outputPath);
        const sizeKB = (stats.length / 1024).toFixed(1);
        console.log(`✅ JS (ESM): ${isMinify ? 'vanduo.esm.min.js' : 'vanduo.esm.js'} (${sizeKB} KB)`);
    } catch (error) {
        console.error('❌ JS ESM build failed:', error.message);
        process.exit(1);
    }
}

// Build JS - CJS format (for Node.js/require)
async function buildJSCJS(banner) {
    const inputPath = resolve(rootDir, 'js/index.js');
    const outputPath = resolve(distDir, isMinify ? 'vanduo.cjs.min.js' : 'vanduo.cjs.js');

    try {
        await esbuild.build({
            entryPoints: [inputPath],
            bundle: true,
            minify: isMinify,
            sourcemap: true,
            outfile: outputPath,
            format: 'cjs',
            target: ['es2020'],
            banner: { js: banner },
            logLevel: 'warning'
        });

        const stats = readFileSync(outputPath);
        const sizeKB = (stats.length / 1024).toFixed(1);
        console.log(`✅ JS (CJS): ${isMinify ? 'vanduo.cjs.min.js' : 'vanduo.cjs.js'} (${sizeKB} KB)`);
    } catch (error) {
        console.error('❌ JS CJS build failed:', error.message);
        process.exit(1);
    }
}

// Run builds
async function build() {
    const buildInfo = getBuildInfo();
    const banner = getBanner(buildInfo);

    console.log(`📌 Version: ${buildInfo.version} | Commit: ${buildInfo.commit}`);
    console.log('─'.repeat(50));

    copyAssets();
    writeBuildInfo(buildInfo);
    await buildCSS(banner);
    await buildJS(banner);
    await buildJSESM(banner);
    await buildJSCJS(banner);
    console.log('─'.repeat(50));
    console.log('🎉 Build complete!');
}

build();
