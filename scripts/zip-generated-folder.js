#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const variant = (process.argv[2] || '').toLowerCase();
const allowedVariants = ['free', 'plus', 'premium'];

if (!allowedVariants.includes(variant)) {
    console.error('Usage: node scripts/zip-generated-folder.js <free|plus|premium>');
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

// Built directly with adm-zip instead of shelling out to PowerShell's
// Compress-Archive.
//
// HISTORY: Compress-Archive (a Windows/.NET quirk) could write zip entry
// names with "\" instead of the ZIP-spec-required "/". Windows-native
// extraction tolerates it, but Linux/PHP's ZipArchive treats "\" as a
// literal filename character, flattening every nested file into the plugin
// root with a mangled name (confirmed live on a DreamHost install on
// 2026-06-18: "includes\class-adaire-blocks-config.php" sat as one flat
// file, so require_once 'includes/...' couldn't find it).
//
// A first fix added a normalizeZipPathSeparators() post-process step that
// reopened the zip via PowerShell's [System.IO.Compression.ZipFile] and
// rewrote any "\" entry to "/". That step turned out to be broken in
// practice: "Add-Type -AssemblyName System.IO.Compression.FileSystem" does
// not reliably make [System.IO.Compression.ZipArchiveMode] resolvable in
// every PowerShell/.NET environment ("Unable to find type
// [System.IO.Compression.ZipArchiveMode]"), so $zip was never assigned,
// every following line failed with "method on a null-valued expression",
// and the function silently reported "Normalized 0 backslash-separated
// entries" while hundreds of entries were still broken underneath it.
//
// Building the zip directly in Node with adm-zip sidesteps all of this:
// addDirectory() below always joins entry names with "/" itself, so there
// is no OS-dependent path separator that can ever leak into the zip, and no
// PowerShell/.NET assembly-loading step that can silently fail.
const zip = new AdmZip();
addDirectory(zip, generatedDir, '');
zip.writeZip(zipPath);

verifyZipStructure(zipPath);

const sizeMb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
console.log(`Created ${zipPath} (${sizeMb} MB)`);

/**
 * Recursively add every non-excluded file under sourceDir into zip, always
 * using "/" to join entry names regardless of the host OS — this is what
 * guarantees the zip can never end up with a backslash path separator.
 */
function addDirectory(zip, sourceDir, zipPrefix) {
    for (const item of fs.readdirSync(sourceDir)) {
        if (excludeNames.has(item)) {
            continue;
        }

        const sourcePath = path.join(sourceDir, item);
        const zipEntryName = zipPrefix ? `${zipPrefix}/${item}` : item;
        const stat = fs.statSync(sourcePath);

        if (stat.isDirectory()) {
            addDirectory(zip, sourcePath, zipEntryName);
        } else {
            zip.addFile(zipEntryName, fs.readFileSync(sourcePath));
        }
    }
}

function verifyZipStructure(zipPathToCheck) {
    const z = new AdmZip(zipPathToCheck);
    const entries = z.getEntries().map(entry => entry.entryName);

    const hasRootPluginFile = entries.includes('adaire-blocks.php');
    const doubledWrapper = entries.some(e => new RegExp(`^${folderName}[\\\\/]${folderName}[\\\\/]`).test(e));
    const backslashEntries = entries.filter(e => e.includes('\\'));

    if (doubledWrapper) {
        throw new Error(
            `Zip has a doubled wrapper folder (${folderName}/${folderName}/...). ` +
            `First few entries: ${entries.slice(0, 8).join(', ')}`
        );
    }

    if (!hasRootPluginFile) {
        throw new Error(
            `adaire-blocks.php was not found at the zip root. First few entries: ${entries.slice(0, 8).join(', ')}`
        );
    }

    if (backslashEntries.length > 0) {
        throw new Error(
            `Zip contains ${backslashEntries.length} entr${backslashEntries.length === 1 ? 'y' : 'ies'} with a ` +
            `backslash "\\" path separator instead of "/" — these will flatten into mangled filenames on ` +
            `Linux/PHP ZipArchive extraction instead of real subdirectories. ` +
            `Examples: ${backslashEntries.slice(0, 5).join(', ')}`
        );
    }

    console.log('Zip structure verified: adaire-blocks.php at root, no wrapper folder, no backslash separators');
}
