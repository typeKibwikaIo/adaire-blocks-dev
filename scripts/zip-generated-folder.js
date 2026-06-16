#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

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
const stagingDir = path.join(outputDir, folderName);

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
fs.rmSync(stagingDir, { recursive: true, force: true });
fs.rmSync(zipPath, { force: true });
copyPluginFiles(generatedDir, stagingDir);

execFileSync('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    `Compress-Archive -Path '${escapePowerShellPath(stagingDir)}' -DestinationPath '${escapePowerShellPath(zipPath)}' -Force`
], { stdio: 'inherit' });

fs.rmSync(stagingDir, { recursive: true, force: true });

const sizeMb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
console.log(`Created ${zipPath} (${sizeMb} MB)`);

function copyPluginFiles(source, destination) {
    fs.mkdirSync(destination, { recursive: true });

    for (const item of fs.readdirSync(source)) {
        if (excludeNames.has(item)) {
            continue;
        }

        const sourcePath = path.join(source, item);
        const destinationPath = path.join(destination, item);
        const stat = fs.statSync(sourcePath);

        if (stat.isDirectory()) {
            copyPluginFiles(sourcePath, destinationPath);
        } else {
            fs.copyFileSync(sourcePath, destinationPath);
        }
    }
}

function escapePowerShellPath(value) {
    return value.replace(/'/g, "''");
}
