#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const packagePath = path.join(rootDir, 'package.json');
const buildInfoPath = path.join(distDir, 'build-info.json');

const bannerFiles = [
    'vanduo.css',
    'vanduo.min.css',
    'vanduo.js',
    'vanduo.min.js',
    'vanduo.esm.js',
    'vanduo.esm.min.js',
    'vanduo.cjs.js',
    'vanduo.cjs.min.js'
];

const jsFiles = [
    'vanduo.js',
    'vanduo.min.js',
    'vanduo.esm.js',
    'vanduo.esm.min.js',
    'vanduo.cjs.js',
    'vanduo.cjs.min.js'
];

const errors = [];

function fail(message) {
    errors.push(message);
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readJsonFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Validate version-bound prose (README, SECURITY, llms.txt). Targeted/anchored
 * checks only — these files legitimately cite historical versions (e.g.
 * "new in v1.3.5", "Theme Switcher (v1.4.4)"), so a blanket scan would
 * false-positive. We only assert the lines that must track the current release.
 */
function checkProseVersions(version) {
    const [major, minor] = version.split('.');
    const minorWildcard = `${major}.${minor}.x`;

    // Every pinned jsDelivr CDN reference must point at the current release.
    const cdnFiles = ['README.md'];
    const cdnRegex = /vanduo-oss\/framework@v(\d+\.\d+\.\d+)/g;
    for (const fileName of cdnFiles) {
        const filePath = path.join(rootDir, fileName);
        if (!fs.existsSync(filePath)) {
            fail(`${fileName} not found for prose version check.`);
            continue;
        }
        const content = fs.readFileSync(filePath, 'utf8');
        let cdnMatch;
        while ((cdnMatch = cdnRegex.exec(content)) !== null) {
            if (cdnMatch[1] !== version) {
                fail(`${fileName}: CDN reference framework@v${cdnMatch[1]} should be v${version}`);
            }
        }
    }

    // Anchored lines that must reference the current version verbatim. (The
    // README's current-version reference is its pinned CDN URL, already checked
    // above; the lean README no longer carries a version title or "What's New".)
    const requiredPatterns = [
        { file: 'SECURITY.md', regex: new RegExp(`\\|\\s*${escapeRegExp(minorWildcard)}\\s*\\|`), label: `SECURITY.md supported-versions row "${minorWildcard}"` }
    ];
    for (const { file, regex, label } of requiredPatterns) {
        const filePath = path.join(rootDir, file);
        if (!fs.existsSync(filePath)) {
            fail(`${file} not found for prose version check.`);
            continue;
        }
        const content = fs.readFileSync(filePath, 'utf8');
        if (!regex.test(content)) {
            fail(`Prose version drift: missing ${label}`);
        }
    }

    // CHANGELOG.md: the newest "## [X.Y.Z]" entry must be the current release.
    const changelogPath = path.join(rootDir, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) {
        fail('CHANGELOG.md not found for prose version check.');
    } else {
        const changelog = fs.readFileSync(changelogPath, 'utf8');
        const firstEntry = changelog.match(/^##\s*\[(\d+\.\d+\.\d+)\]/m);
        if (!firstEntry) {
            fail('CHANGELOG.md has no "## [X.Y.Z]" version entry.');
        } else if (firstEntry[1] !== version) {
            fail(`CHANGELOG.md latest entry is [${firstEntry[1]}], expected [${version}]`);
        }
    }
}

if (!fs.existsSync(packagePath)) {
    fail('package.json not found.');
}

if (!fs.existsSync(distDir)) {
    fail('dist/ directory not found. Run `pnpm run build` first.');
}

let packageVersion = null;
if (errors.length === 0) {
    const pkg = readJsonFile(packagePath);
    packageVersion = pkg.version;

    if (!packageVersion) {
        fail('`version` is missing in package.json.');
    }
}

if (packageVersion && fs.existsSync(buildInfoPath)) {
    const buildInfo = readJsonFile(buildInfoPath);
    if (buildInfo.version !== packageVersion) {
        fail(`build-info.json version mismatch: expected ${packageVersion}, found ${buildInfo.version}`);
    }
} else if (packageVersion) {
    fail('dist/build-info.json is missing.');
}

if (packageVersion) {
    for (const fileName of bannerFiles) {
        const filePath = path.join(distDir, fileName);

        if (!fs.existsSync(filePath)) {
            fail(`Missing dist file for banner check: ${fileName}`);
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const firstLine = content.split('\n', 1)[0] || '';

        if (!firstLine.includes(`Vanduo v${packageVersion}`)) {
            fail(`Banner version mismatch in ${fileName}: expected Vanduo v${packageVersion}`);
        }
    }

    const directVersionPattern = new RegExp(`version\\s*:\\s*["']${escapeRegExp(packageVersion)}["']`);
    const injectedVersionPattern = new RegExp(`VANDUO_VERSION[^\\n]*["']${escapeRegExp(packageVersion)}["']`);
    const injectedReferencePattern = /version\s*:\s*VANDUO_VERSION/;
    const aliasedVersionDeclarationPattern = new RegExp(`(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*["']${escapeRegExp(packageVersion)}["']`);

    for (const fileName of jsFiles) {
        const filePath = path.join(distDir, fileName);

        if (!fs.existsSync(filePath)) {
            fail(`Missing dist JS file for runtime check: ${fileName}`);
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf8');

        const hasDirectVersion = directVersionPattern.test(content);
        const hasInjectedVersion = injectedVersionPattern.test(content) && injectedReferencePattern.test(content);
        const aliasMatch = content.match(aliasedVersionDeclarationPattern);
        const hasAliasedVersion = !!(aliasMatch && new RegExp(`version\\s*:\\s*${escapeRegExp(aliasMatch[1])}\\b`).test(content));

        if (!hasDirectVersion && !hasInjectedVersion && !hasAliasedVersion) {
            fail(`Runtime version mismatch in ${fileName}: missing version:${packageVersion}`);
        }

    }

    checkProseVersions(packageVersion);
}

if (errors.length > 0) {
    console.error('❌ Version consistency check failed:');
    errors.forEach((message) => console.error(` - ${message}`));
    process.exit(1);
}

console.log(`✅ Version consistency check passed for v${packageVersion}`);
