#!/usr/bin/env node

/**
 * Full ("pro"/entire) Plugin Zip Exporter for Adaire Blocks
 *
 * `wp-scripts plugin-zip` only packages a hardcoded WordPress Plugin
 * Handbook layout — admin/, build/, includes/, languages/, public/,
 * <slug>.php, uninstall.php, block.json, changelog.*, license.*, readme.*
 * (see node_modules/@wordpress/scripts/scripts/plugin-zip.js). This plugin
 * ALSO requires:
 *   - config/               loaded by includes/class-adaire-blocks-config.php
 *   - plugin-update-checker/  required unconditionally at the top of
 *                             adaire-blocks.php (require_once, ~line 57)
 * Neither directory is in that hardcoded list, so a zip built with
 * `wp-scripts plugin-zip` installs but fatals on activation:
 *   Fatal error: ... Failed opening required
 *   '.../plugin-update-checker/plugin-update-checker.php'
 *
 * This script bypasses wp-scripts plugin-zip and copies an explicit
 * allowlist of what the shipped plugin actually needs directly into the
 * archive instead.
 *
 * Output: plugin-zips/adaire-blocks-pro.zip INSIDE this project folder
 * (unlike the sibling-project version of this script, which writes one
 * directory above the plugin root).
 *
 * Run `npm run build` first if you want the zip to reflect the latest
 * source changes — this script does not rebuild on its own.
 *
 * Usage: node scripts/zip-full-plugin.js
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'plugin-zips');
const zipRootFolder = 'adaire-blocks';
const zipPath = path.join(outputDir, 'adaire-blocks-pro.zip');

// Everything a working install needs — the WordPress Plugin Handbook layout
// PLUS config/ and plugin-update-checker/, which wp-scripts plugin-zip's
// hardcoded glob doesn't know about.
//
// 'assets' and 'templates' were both missing from this list (found while
// debugging why bootstrap-icons.min.css 404'd on every zip-installed site
// no matter what PHP/JS fixes were made — the file was never packaged into
// the zip in the first place). assets/vendor/bootstrap-icons/ is required
// by every block that uses Bootstrap Icons (Icon Box, Social Banner,
// Industries, Our Process, Social Share, Feature Grid Free, SaaS Hero,
// Rating Badge); templates/ is required at runtime by
// includes/class-adaire-case-studies-cpt.php, which loads
// templates/single-adaire_case_study.php and templates/single-case-study.css
// by direct file path — both were silently broken in every previously
// built zip, independent of any editor/front-end enqueue logic.
const includeItems = [
    'admin',
    'assets',
    'build',
    'config',
    'includes',
    'plugin-update-checker',
    'templates',
    'adaire-blocks.php',
    'uninstall.php',
    'readme.txt',
    'README.md',
];

const buildManifest = path.join(rootDir, 'build', 'blocks-manifest.php');
if (!fs.existsSync(buildManifest)) {
    console.error(`build/blocks-manifest.php not found at ${buildManifest}.`);
    console.error('Run `npm run build` first — without it the plugin installs but registers zero blocks.');
    process.exit(1);
}

const zip = new AdmZip();
const missing = [];

includeItems.forEach((item) => {
    const sourcePath = path.join(rootDir, item);
    if (!fs.existsSync(sourcePath)) {
        missing.push(item);
        return;
    }
    const stat = fs.statSync(sourcePath);
    if (stat.isDirectory()) {
        addDirectory(zip, sourcePath, `${zipRootFolder}/${item}`);
    } else {
        zip.addFile(`${zipRootFolder}/${item}`, fs.readFileSync(sourcePath));
    }
});

if (missing.length > 0) {
    console.log(`Note: not present, skipped: ${missing.join(', ')}`);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.rmSync(zipPath, { force: true });
zip.writeZip(zipPath);

const sizeMb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
console.log(`Created ${zipPath} (${sizeMb} MB)`);

function addDirectory(zipInstance, sourceDir, zipPrefix) {
    for (const item of fs.readdirSync(sourceDir)) {
        const sourcePath = path.join(sourceDir, item);
        const entryName = `${zipPrefix}/${item}`;
        const stat = fs.statSync(sourcePath);
        if (stat.isDirectory()) {
            addDirectory(zipInstance, sourcePath, entryName);
        } else {
            zipInstance.addFile(entryName, fs.readFileSync(sourcePath));
        }
    }
}
