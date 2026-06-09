#!/usr/bin/env node

/**
 * Free Version Generator for Adaire Blocks
 *
 * Generates the free version by:
 * 1. Copying every file from free-version-scaffold/ (the authoritative template)
 * 2. Patching the plugin version from the main dev plugin
 * 3. Copying only free blocks from the main plugin's src/
 * 4. Copying shared admin/includes files from the main plugin
 * 5. Sanitizing the settings page for free use
 * 6. Generating package.json
 * 7. Building the free version
 *
 * To customise the generated free version (readme, deactivation modal, sendgrid, etc.)
 * edit files in free-version-scaffold/ — do NOT edit this script.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FreeVersionGenerator {
    constructor() {
        this.sourceDir = process.cwd();
        this.scaffoldDir = path.join(this.sourceDir, 'free-version-scaffold');
        this.freeVersionDir = path.join(this.sourceDir, '../adaire-blocks-free');
        this.configFile = path.join(this.sourceDir, 'config/blocks-config.json');
    }

    /**
     * Main generation process
     */
    async generate() {
        console.log('Starting Free Version Generation...');

        if (!fs.existsSync(this.scaffoldDir)) {
            throw new Error(
                `Scaffold directory not found at ${this.scaffoldDir}.\n` +
                'Expected: free-version-scaffold/ in the plugin root.'
            );
        }

        try {
            // Step 1: Create clean output directory
            await this.createCleanDirectory();

            // Step 2: Copy scaffold files (plugin file, readme, deactivation modal, sendgrid, etc.)
            await this.copyScaffoldFiles();

            // Step 3: Copy only free blocks from main plugin
            await this.copyFreeBlocks();

            // Step 4: Copy shared admin/includes files from main plugin
            await this.copySharedFiles();

            // Step 5: Sanitize settings page for free version (no upgrade/license UI)
            await this.sanitizeSettingsPage();

            // Step 6: Generate package.json
            await this.generatePackageJson();

            // Step 7: Build the free version
            await this.buildFreeVersion();

            // Step 8: Verify generation
            await this.verifyGeneration();

            console.log('\nFree version generated successfully!');
            console.log(`Location: ${this.freeVersionDir}`);

        } catch (error) {
            console.error('Error generating free version:', error.message);
            process.exit(1);
        }
    }

    /**
     * Create clean output directory
     */
    async createCleanDirectory() {
        console.log('Creating clean output directory...');

        if (fs.existsSync(this.freeVersionDir)) {
            fs.rmSync(this.freeVersionDir, { recursive: true, force: true });
        }

        fs.mkdirSync(this.freeVersionDir, { recursive: true });
    }

    /**
     * Copy every file from the scaffold into the output directory, then patch the
     * plugin version in adaire-blocks.php to match the main dev plugin.
     *
     * The scaffold is the single source of truth for:
     *   - adaire-blocks.php
     *   - readme.txt
     *   - .gitignore
     *   - admin/deactivation-modal.php
     *   - admin/deactivation-log-page.php
     *   - admin/css/deactivation-modal.css
     *   - admin/js/deactivation-modal.js
     *   - includes/sendgrid.php
     *   - docs/sendgrid-setup.md
     */
    async copyScaffoldFiles() {
        console.log('Copying scaffold files...');

        // Skip the developer-facing README — it is not part of the plugin itself
        const skipFiles = ['SCAFFOLD-README.md'];

        this.copyDirectoryRecursive(this.scaffoldDir, this.freeVersionDir, skipFiles);
        console.log('   ✓ Scaffold files copied');

        // Patch the version number in the copied adaire-blocks.php
        this.patchPluginVersion();
    }

    /**
     * Read the current version from the dev plugin and write it into the
     * scaffold-sourced adaire-blocks.php in the output directory.
     */
    patchPluginVersion() {
        const devPluginFile = path.join(this.sourceDir, 'adaire-blocks.php');
        const outPluginFile = path.join(this.freeVersionDir, 'adaire-blocks.php');

        if (!fs.existsSync(devPluginFile) || !fs.existsSync(outPluginFile)) {
            return;
        }

        const devContent = fs.readFileSync(devPluginFile, 'utf8');
        const versionMatch = devContent.match(/^\s*\*\s*Version:\s*(.+)$/m);
        if (!versionMatch) {
            console.log('   ⚠️  Could not read version from dev plugin, skipping version patch');
            return;
        }

        const version = versionMatch[1].trim();
        let outContent = fs.readFileSync(outPluginFile, 'utf8');

        // Patch the header comment version
        outContent = outContent.replace(
            /^(\s*\*\s*Version:\s*)(.+)$/m,
            `$1${version}`
        );

        // Patch the define() constant
        outContent = outContent.replace(
            /define\(\s*'ADAIRE_BLOCKS_VERSION'\s*,\s*'[^']*'\s*\)/,
            `define('ADAIRE_BLOCKS_VERSION', '${version}')`
        );

        fs.writeFileSync(outPluginFile, outContent);
        console.log(`   ✓ Version patched to ${version}`);
    }

    /**
     * Copy only free blocks from the main plugin's src/
     */
    async copyFreeBlocks() {
        console.log('Copying free blocks...');

        const enabledBlocks = this.getEnabledBlocks();
        const srcPath = path.join(this.freeVersionDir, 'src');

        fs.mkdirSync(srcPath, { recursive: true });

        enabledBlocks.forEach(blockName => {
            const sourceBlockPath = path.join(this.sourceDir, 'src', blockName);
            const destBlockPath = path.join(srcPath, blockName);

            if (fs.existsSync(sourceBlockPath)) {
                this.copyDirectoryRecursive(sourceBlockPath, destBlockPath);
                console.log(`   ✓ Copied ${blockName}`);
            }
        });

        // Copy shared src/ subdirectories
        const sharedSrcDirs = ['components', 'icons'];
        sharedSrcDirs.forEach(dir => {
            const src = path.join(this.sourceDir, 'src', dir);
            const dest = path.join(srcPath, dir);
            if (fs.existsSync(src)) {
                this.copyDirectoryRecursive(src, dest);
            }
        });

        // Copy src/index.js (will be rewritten by modifyIndexJs later)
        const indexSrc = path.join(this.sourceDir, 'src', 'index.js');
        if (fs.existsSync(indexSrc)) {
            fs.copyFileSync(indexSrc, path.join(srcPath, 'index.js'));
        }
    }

    /**
     * Copy admin and includes files that live in the main dev plugin
     * (settings page, block migration, css/js assets, config, scripts).
     *
     * Scaffold files already copied in copyScaffoldFiles() take precedence —
     * this step only fills in what the scaffold does not own.
     */
    async copySharedFiles() {
        console.log('Copying shared admin/includes files from main plugin...');

        // --- includes ---
        const includesSrc = path.join(this.sourceDir, 'includes');
        const includesDest = path.join(this.freeVersionDir, 'includes');
        fs.mkdirSync(includesDest, { recursive: true });

        if (fs.existsSync(includesSrc)) {
            fs.readdirSync(includesSrc).forEach(file => {
                const dest = path.join(includesDest, file);
                // Don't overwrite files that came from the scaffold
                if (!fs.existsSync(dest) && file === 'class-adaire-blocks-config.php') {
                    fs.copyFileSync(path.join(includesSrc, file), dest);
                }
            });
        }

        // --- admin ---
        const adminSrc = path.join(this.sourceDir, 'admin');
        const adminDest = path.join(this.freeVersionDir, 'admin');
        fs.mkdirSync(adminDest, { recursive: true });

        if (fs.existsSync(adminSrc)) {
            fs.readdirSync(adminSrc).forEach(file => {
                const srcPath = path.join(adminSrc, file);
                const destPath = path.join(adminDest, file);
                const stat = fs.statSync(srcPath);

                if (stat.isFile()) {
                    // Only copy specific PHP files; don't overwrite scaffold files
                    if (
                        (file === 'settings-page.php' || file === 'block-migration.php') &&
                        !fs.existsSync(destPath)
                    ) {
                        fs.copyFileSync(srcPath, destPath);
                    }
                } else if (stat.isDirectory() && (file === 'css' || file === 'js')) {
                    // Merge css/js directories: copy files that scaffold did not already place
                    fs.mkdirSync(destPath, { recursive: true });
                    fs.readdirSync(srcPath).forEach(assetFile => {
                        const assetDest = path.join(destPath, assetFile);
                        if (!fs.existsSync(assetDest)) {
                            fs.copyFileSync(path.join(srcPath, assetFile), assetDest);
                        }
                    });
                }
            });
        }

        // --- config (always from dev plugin — must stay current) ---
        const configSrc = path.join(this.sourceDir, 'config');
        const configDest = path.join(this.freeVersionDir, 'config');
        if (fs.existsSync(configSrc)) {
            fs.mkdirSync(configDest, { recursive: true });
            ['block-icon-mapping.json', 'blocks-config.json'].forEach(file => {
                const src = path.join(configSrc, file);
                const dest = path.join(configDest, file);
                if (fs.existsSync(src)) {
                    fs.copyFileSync(src, dest); // always overwrite scaffold version
                    console.log(`   ✓ Copied config/${file} (from dev plugin)`);
                }
            });
        }

        // --- scripts ---
        const scriptsSrc = path.join(this.sourceDir, 'scripts');
        const scriptsDest = path.join(this.freeVersionDir, 'scripts');
        if (fs.existsSync(scriptsSrc)) {
            this.copyDirectoryRecursive(scriptsSrc, scriptsDest);
            console.log('   ✓ Copied scripts/');
        }
    }

    /**
     * Sanitize admin/settings-page.php to remove upgrade/licensing and premium UI
     */
    async sanitizeSettingsPage() {
        const settingsPath = path.join(this.freeVersionDir, 'admin', 'settings-page.php');
        if (!fs.existsSync(settingsPath)) {
            return;
        }
        let content = fs.readFileSync(settingsPath, 'utf8');

        content = content.replace(/\$upgrade_message\s*=\s*\$config->get_upgrade_message\([^)]*\);/g, "$upgrade_message = '';");
        content = content.replace(/\$limits\s*=\s*\$config->get_block_limits\([^)]*\);/g, "$limits = array();");
        content = content.replace(/\$is_premium_block\s*=\s*!\$config->is_premium\(\)\s*&&\s*!\$config->is_block_enabled\([^)]*\);/g, "$is_premium_block = false;");
        content = content.replace(/adaire-block-premium-badge/g, 'adaire-block-badge');
        content = content.replace(/adaire-block-premium/g, 'adaire-block');
        content = content.replace(/adaire-block-upgrade-prompt/g, 'adaire-block-note');
        content = content.replace(/adaire-upgrade-button/g, 'adaire-hidden-upgrade-button');
        content = content.replace(/adaire_blocks_license_[a-z_]+\([^)]*\);?/g, '');

        fs.writeFileSync(settingsPath, content);
        console.log('   ✓ Sanitized settings page for free version');
    }

    /**
     * Generate package.json for the free version
     */
    async generatePackageJson() {
        console.log('Generating package.json...');

        const sourcePackage = JSON.parse(
            fs.readFileSync(path.join(this.sourceDir, 'package.json'), 'utf8')
        );

        const pluginContent = fs.readFileSync(
            path.join(this.sourceDir, 'adaire-blocks.php'), 'utf8'
        );
        const versionMatch = pluginContent.match(/Version:\s*([^\n]*)/);
        const currentVersion = versionMatch ? versionMatch[1].trim() : sourcePackage.version;

        const freePackage = {
            name: 'adaire-blocks-free',
            version: currentVersion,
            description: 'Free version of Adaire Blocks - Professional WordPress blocks for Gutenberg editor',
            main: 'src/index.js',
            scripts: {
                prebuild: 'node scripts/apply-new-icons.js && node scripts/update-block-icons.js',
                build: 'wp-scripts build --blocks-manifest',
                start: 'wp-scripts start --blocks-manifest',
                'plugin-zip': 'wp-scripts plugin-zip',
                'deploy:free': 'npm run build && npm run plugin-zip',
                test: 'wp-scripts test-unit-js'
            },
            dependencies: sourcePackage.dependencies || {},
            devDependencies: sourcePackage.devDependencies || {},
            keywords: sourcePackage.keywords || [],
            author: sourcePackage.author || 'Adaire',
            license: 'GPL-3.0',
            repository: sourcePackage.repository || {},
            bugs: sourcePackage.bugs || {},
            homepage: sourcePackage.homepage || 'https://adaire.digital/'
        };

        fs.writeFileSync(
            path.join(this.freeVersionDir, 'package.json'),
            JSON.stringify(freePackage, null, 2)
        );

        const packageLockSrc = path.join(this.sourceDir, 'package-lock.json');
        if (fs.existsSync(packageLockSrc)) {
            fs.copyFileSync(packageLockSrc, path.join(this.freeVersionDir, 'package-lock.json'));
        }

        console.log(`   ✓ package.json generated (version ${currentVersion})`);
    }

    /**
     * Build the free version
     */
    async buildFreeVersion() {
        console.log('Building free version...');

        const originalDir = process.cwd();

        try {
            const indexPath = path.join(this.freeVersionDir, 'src', 'index.js');
            if (!fs.existsSync(indexPath)) {
                throw new Error(`src/index.js not found at ${indexPath}. Blocks may not have been copied.`);
            }

            this.modifyIndexJs();

            process.chdir(this.freeVersionDir);
            console.log(`   Changed to: ${this.freeVersionDir}`);

            console.log('   Installing dependencies...');
            execSync('npm ci', { stdio: 'inherit' });
            this.verifyDependencyInstall();

            console.log('   Running prebuild...');
            try {
                execSync('npm run prebuild', { stdio: 'inherit' });
                console.log('   ✓ Prebuild completed');
            } catch (prebuildError) {
                console.log('   ⚠️  Prebuild failed, continuing...');
                console.log('   Error:', prebuildError.message);
            }

            console.log('   Running build...');
            try {
                execSync('npm run build', { stdio: 'inherit', cwd: this.freeVersionDir });
            } catch (buildError) {
                const buildDir = path.join(this.freeVersionDir, 'build');
                const srcDir = path.join(this.freeVersionDir, 'src');

                console.error('\n   Build command failed. Diagnostics:');

                if (fs.existsSync(srcDir)) {
                    const blocks = fs.readdirSync(srcDir).filter(item =>
                        fs.statSync(path.join(srcDir, item)).isDirectory() && item.endsWith('-block')
                    );
                    console.error(`   src/ contains ${blocks.length} block(s): ${blocks.join(', ')}`);
                } else {
                    console.error('   src/ directory does not exist!');
                }

                if (fs.existsSync(buildDir)) {
                    const contents = fs.readdirSync(buildDir);
                    console.error(`   build/ exists with ${contents.length} item(s)`);
                } else {
                    console.error('   build/ was not created');
                }

                throw new Error(`Build failed: ${buildError.message}`);
            }

            const buildDir = path.join(this.freeVersionDir, 'build');
            if (!fs.existsSync(buildDir) || fs.readdirSync(buildDir).length === 0) {
                throw new Error('Build directory is empty — build may have failed');
            }

            console.log(`   ✓ Build completed (${fs.readdirSync(buildDir).length} items in build/)`);

        } catch (error) {
            process.chdir(originalDir);
            throw error;
        } finally {
            process.chdir(originalDir);
        }
    }

    verifyDependencyInstall() {
        const requiredFiles = [
            path.join(this.freeVersionDir, 'node_modules', 'source-map-js', 'lib', 'base64.js'),
            path.join(this.freeVersionDir, 'node_modules', 'source-map-js', 'lib', 'base64-vlq.js'),
            path.join(this.freeVersionDir, 'node_modules', 'common-path-prefix', 'index.js'),
            path.join(this.freeVersionDir, 'node_modules', '@wordpress', 'scripts', 'config', 'webpack.config.js')
        ];

        const missingFiles = requiredFiles.filter(file => {
            if (!fs.existsSync(file)) {
                return true;
            }

            return fs.statSync(file).size === 0;
        });

        if (missingFiles.length === 0) {
            console.log('   ✓ Dependency install verified');
            return;
        }

        console.log('   ⚠️  Dependency install appears incomplete. Reinstalling once...');
        missingFiles.forEach(file => console.log(`      Missing or empty: ${path.relative(this.freeVersionDir, file)}`));

        fs.rmSync(path.join(this.freeVersionDir, 'node_modules'), { recursive: true, force: true });
        execSync('npm cache verify', { stdio: 'inherit' });
        execSync('npm ci', { stdio: 'inherit' });

        const stillMissingFiles = requiredFiles.filter(file => {
            if (!fs.existsSync(file)) {
                return true;
            }

            return fs.statSync(file).size === 0;
        });

        if (stillMissingFiles.length > 0) {
            throw new Error(
                'Dependency install is incomplete after retry. Missing files: ' +
                stillMissingFiles.map(file => path.relative(this.freeVersionDir, file)).join(', ')
            );
        }

        console.log('   ✓ Dependency install verified after retry');
    }

    /**
     * Rewrite src/index.js to import only the enabled free blocks
     */
    modifyIndexJs() {
        console.log('Updating src/index.js for free blocks...');

        const indexPath = path.join(this.freeVersionDir, 'src', 'index.js');
        if (!fs.existsSync(indexPath)) {
            return;
        }

        const enabledBlocks = this.getEnabledBlocks();

        let indexContent = `// Adaire Blocks Free Version - auto-generated, do not edit manually\n\n`;
        enabledBlocks.forEach(blockName => {
            indexContent += `import './${blockName}';\n`;
        });

        fs.writeFileSync(indexPath, indexContent);
        console.log(`   ✓ index.js updated (${enabledBlocks.length} blocks)`);
    }

    /**
     * Verify what was generated
     */
    async verifyGeneration() {
        console.log('\nVerifying generated free version...');

        // Blocks
        const srcPath = path.join(this.freeVersionDir, 'src');
        if (fs.existsSync(srcPath)) {
            const blocks = fs.readdirSync(srcPath).filter(item =>
                fs.statSync(path.join(srcPath, item)).isDirectory() && item.endsWith('-block')
            );
            console.log(`\n Blocks included (${blocks.length}):`);
            blocks.forEach(b => console.log(`   ✓ ${b}`));
        }

        // Plugin file cleanliness
        const phpFile = path.join(this.freeVersionDir, 'adaire-blocks.php');
        if (fs.existsSync(phpFile)) {
            const content = fs.readFileSync(phpFile, 'utf8');
            const hasPremium = content.includes('license_manager') ||
                               content.includes('is_license_active') ||
                               content.includes('premium');
            const hasUpdateChecker = content.includes('plugin-update-checker') ||
                                     content.includes('PucFactory');

            if (hasPremium || hasUpdateChecker) {
                console.log('\n  WARNING: Plugin file may contain license or update-checker code!');
            } else {
                console.log('\n✓ Plugin file is clean (no license or update-checker code)');
            }
        }

        // Deactivation modal
        const modalFile = path.join(this.freeVersionDir, 'admin', 'deactivation-modal.php');
        const sendgridFile = path.join(this.freeVersionDir, 'includes', 'sendgrid.php');
        console.log(`\n✓ Deactivation modal: ${fs.existsSync(modalFile) ? 'present' : 'MISSING'}`);
        console.log(`✓ SendGrid integration: ${fs.existsSync(sendgridFile) ? 'present' : 'MISSING'}`);

        // Icons
        const iconsPath = path.join(this.freeVersionDir, 'src', 'icons');
        if (fs.existsSync(iconsPath)) {
            const iconFiles = fs.readdirSync(iconsPath).filter(f => f.endsWith('.js'));
            console.log(`✓ Icons: ${iconFiles.length} icon files`);
        }
    }

    /**
     * Recursively copy a directory.
     * Optionally skip files by name (basename only).
     */
    copyDirectoryRecursive(source, dest, skipFiles = []) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        fs.readdirSync(source).forEach(file => {
            if (skipFiles.includes(file)) {
                return;
            }

            const srcPath = path.join(source, file);
            const destPath = path.join(dest, file);

            if (fs.statSync(srcPath).isDirectory()) {
                this.copyDirectoryRecursive(srcPath, destPath, skipFiles);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }

    /**
     * Return list of free block names from blocks-config.json.
     * Tier membership is controlled by config/blocks-config.json.
     * block.json category is only the WordPress inserter category.
     */
    getEnabledBlocks() {
        const configPath = path.join(this.sourceDir, 'config', 'blocks-config.json');

        if (!fs.existsSync(configPath)) {
            return ['accordion-block', 'button-block', 'testimonial-block'];
        }

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const freeConfig = config.free || {};
        const premiumConfig = config.premium || {};
        const plusConfig = config.plus || {};

        const enabledFromConfig = Object.keys(freeConfig).filter(
            blockName => freeConfig[blockName]?.enabled === true
        );

        const enabledBlocks = enabledFromConfig.filter(blockName => {
            const blockJsonPath = path.join(this.sourceDir, 'src', blockName, 'block.json');

            if (!fs.existsSync(blockJsonPath)) {
                console.log(`   ⚠️  block.json not found for ${blockName}, skipping`);
                return false;
            }

            try {
                const blockJson = JSON.parse(fs.readFileSync(blockJsonPath, 'utf8'));
                const paidTiers = [];

                if (premiumConfig[blockName]?.enabled === true) {
                    paidTiers.push('premium');
                }

                if (plusConfig[blockName]?.enabled === true) {
                    paidTiers.push('plus');
                }

                if (paidTiers.length > 0) {
                    console.log(`   ℹ️  ${blockName} is free and also has ${paidTiers.join('/')} upgrade rules`);
                }

                console.log(`   ✓ ${blockName} marked free (category: ${blockJson.category || 'uncategorized'})`);
                return true;
            } catch (error) {
                console.log(`   ⚠️  Error reading block.json for ${blockName}: ${error.message}`);
                return false;
            }
        });

        const paidOnlyBlocks = new Set([
            ...Object.keys(premiumConfig).filter(blockName => premiumConfig[blockName]?.enabled === true),
            ...Object.keys(plusConfig).filter(blockName => plusConfig[blockName]?.enabled === true)
        ]);

        enabledBlocks.forEach(blockName => paidOnlyBlocks.delete(blockName));

        console.log(`   Free tier blocks: ${enabledBlocks.length}`);
        console.log(`   Paid-only blocks excluded: ${paidOnlyBlocks.size}`);

        return enabledBlocks;
    }
}

// Run the generator
if (require.main === module) {
    const generator = new FreeVersionGenerator();
    generator.generate();
}

module.exports = FreeVersionGenerator;
