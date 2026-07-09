/**
 * Prepare Plugin Submission Package
 * 
 * This script creates a clean copy of the plugin for WordPress.org submission,
 * excluding development files and creating a ready-to-submit ZIP file.
 * 
 * Usage: node scripts/prepare-submission.js
 */

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

const config = {
    pluginSlug: 'adaire-blocks',
    version: '1.1.0',
    sourceDir: path.resolve(__dirname, '..'),
    outputDir: path.resolve(__dirname, '..', '..', 'submission'),
    excludePatterns: [
        'node_modules',
        '.git',
        '.gitignore',
        '.DS_Store',
        'scripts/prepare-submission.js',
        'docs/WORDPRESS-ORG-SUBMISSION-GUIDE.md',
        'docs/SUBMISSION-CHECKLIST.md',
        '*.md',
        'package.json',
        'package-lock.json',
        'webpack.config.js',
        '.eslintrc.js',
        '.prettierrc',
        'BACKUP.JS',
        'src', // Source files (we only need build/)
        'block-template', // Template files
    ],
    includeFiles: [
        'README.md', // Keep main README
    ]
};

console.log('🚀 Preparing Adaire Blocks for WordPress.org submission...\n');

async function prepareSubmission() {
    try {
        // 1. Create output directory
        console.log('📁 Creating submission directory...');
        const pluginDir = path.join(config.outputDir, config.pluginSlug);
        await fs.ensureDir(pluginDir);
        console.log(`   ✓ Created: ${pluginDir}\n`);

        // 2. Copy plugin files
        console.log('📋 Copying plugin files...');
        const files = await fs.readdir(config.sourceDir);
        
        for (const file of files) {
            const sourcePath = path.join(config.sourceDir, file);
            const destPath = path.join(pluginDir, file);

            // Skip excluded patterns
            if (shouldExclude(file)) {
                console.log(`   ⊗ Skipped: ${file}`);
                continue;
            }

            // Copy file or directory
            const stat = await fs.stat(sourcePath);
            if (stat.isDirectory()) {
                await fs.copy(sourcePath, destPath, {
                    filter: (src) => !shouldExclude(path.basename(src))
                });
                console.log(`   ✓ Copied directory: ${file}`);
            } else {
                await fs.copy(sourcePath, destPath);
                console.log(`   ✓ Copied file: ${file}`);
            }
        }

        console.log('\n✅ All files copied successfully!\n');

        // 3. Verify required files exist
        console.log('🔍 Verifying required files...');
        const requiredFiles = [
            'adaire-blocks.php',
            'readme.txt',
            'build',
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(pluginDir, file);
            if (await fs.pathExists(filePath)) {
                console.log(`   ✓ ${file} exists`);
            } else {
                console.log(`   ✗ ${file} MISSING!`);
                throw new Error(`Required file ${file} is missing!`);
            }
        }

        console.log('\n✅ All required files present!\n');

        // 4. Create ZIP file
        console.log('📦 Creating ZIP file...');
        const zipPath = path.join(config.outputDir, `${config.pluginSlug}-v${config.version}.zip`);
        await createZip(pluginDir, zipPath);
        console.log(`   ✓ Created: ${zipPath}\n`);

        // 5. Summary
        console.log('═══════════════════════════════════════════════════════');
        console.log('✨ Plugin submission package ready!');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`\n📍 Location: ${config.outputDir}`);
        console.log(`📦 ZIP File: ${path.basename(zipPath)}`);
        console.log(`\n📋 Next Steps:`);
        console.log(`   1. Test the plugin by installing ${path.basename(zipPath)}`);
        console.log(`   2. Create assets (icons, screenshots)`);
        console.log(`   3. Submit to https://wordpress.org/plugins/developers/add/`);
        console.log(`\n📖 See docs/WORDPRESS-ORG-SUBMISSION-GUIDE.md for full instructions\n`);

    } catch (error) {
        console.error('\n❌ Error preparing submission:', error.message);
        process.exit(1);
    }
}

function shouldExclude(filename) {
    return config.excludePatterns.some(pattern => {
        if (pattern.includes('*')) {
            // Handle wildcard patterns
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(filename);
        }
        return filename === pattern || filename.startsWith(pattern);
    }) && !config.includeFiles.includes(filename);
}

function createZip(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
            console.log(`   ✓ ZIP size: ${sizeMB} MB`);
            resolve();
        });

        archive.on('error', reject);
        archive.pipe(output);
        
        // Add the plugin directory to the ZIP
        archive.directory(sourceDir, config.pluginSlug);
        archive.finalize();
    });
}

// Run the script
prepareSubmission();

