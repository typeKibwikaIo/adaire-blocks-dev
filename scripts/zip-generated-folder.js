#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const variant = (process.argv[2] || '').toLowerCase();
const allowedVariants = ['free', 'pro'];

if (!allowedVariants.includes(variant)) {
    console.error('Usage: node scripts/zip-generated-folder.js <free|pro>');
    process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const parentDir = path.resolve(rootDir, '..');
const folderName = `adaire-blocks-${variant}`;
const generatedDir = path.join(parentDir, folderName);
const outputDir = path.join(parentDir, 'plugin-zips');
const zipPath = path.join(outputDir, `${folderName}.zip`);

const excludeNames = new Set([
    'node_modules',
    '.git',
    '.github',
    '.wordpress-org',
    'src',
    'coverage',
    '.DS_Store',
    'package-lock.json',
    'package.json',
    'webpack.config.js',
    '.eslintrc.js',
    '.prettierrc',
]);

if (!fs.existsSync(generatedDir)) {
    console.error(`Generated ${variant} folder not found: ${generatedDir}`);
    console.error(`Run the ${variant} generator/build first, then retry this zip command.`);
    process.exit(1);
}

if (!fs.existsSync(path.join(generatedDir, 'adaire-blocks.php'))) {
    console.error(`Invalid plugin folder: ${generatedDir}`);
    console.error('Expected adaire-blocks.php in the generated plugin folder.');
    process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.rmSync(zipPath, { force: true });

// adm-zip writes RFC-compliant forward-slash separators in zip entry names,
// which PHP's ZipArchive (used by WordPress's plugin installer) requires on
// Linux servers. PowerShell's Compress-Archive uses backslashes, causing
// WordPress to treat backslashes as literal filename characters instead of
// path separators — so the plugin extracts as a flat pile of misnamed files.
const zip = new AdmZip();
addDirectory(zip, generatedDir, '');
zip.writeZip(zipPath);

const sizeMb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
console.log(`Created ${zipPath} (${sizeMb} MB)`);

function addDirectory(zip, sourceDir, zipPrefix) {
    for (const item of fs.readdirSync(sourceDir)) {
        if (excludeNames.has(item)) {
            continue;
        }

        const sourcePath = path.join(sourceDir, item);
        const entryName = zipPrefix ? `${zipPrefix}/${item}` : item;
        const stat = fs.statSync(sourcePath);

        if (stat.isDirectory()) {
            addDirectory(zip, sourcePath, entryName);
        } else {
            zip.addFile(entryName, fs.readFileSync(sourcePath));
        }
    }
}
