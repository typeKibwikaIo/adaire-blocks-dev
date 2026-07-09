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
const { execSync, execFileSync } = require('child_process');

/**
 * Block titles that differ between distributions. Keys are block folder
 * names; values replace block.json "title" in the generated free source
 * before it is built. Paid builds (plus/premium) compile straight from
 * the dev src/ and keep the original titles.
 */
const FREE_TITLE_OVERRIDES = {
    'tabs-block': 'Tabbed Content Free',
};

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
            await this.ensureSettingsPageRendersAllCategories();

            // Step 6: Generate package.json
            await this.generatePackageJson();

            // Step 7: Build the free version
            await this.buildFreeVersion();

            // Step 8: Verify generation
            await this.verifyGeneration();

            // Step 9: Create zip file
            await this.createZipFile();

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
                this.applyFreeTitleOverride(blockName, destBlockPath);
            }
        });

        // Copy shared src/ subdirectories
        // 'new-icons' under src/icons is dev-only raw SVG source material
        // (consumed only by scripts/apply-new-icons.js at prebuild time to
        // bake src/icons/*.js icon components — nothing at runtime reads it).
        // It also nests folders named "Free Blocks" / "Plus Blocks" /
        // "Premium Blocks", which leaks paid-tier assets into the free zip
        // and has been observed to break WordPress's plugin-zip installer
        // ("Could not copy file." for that directory) on at least one
        // Windows host, so it is skipped here unconditionally.
        const sharedSrcDirs = ['components', 'icons'];
        const sharedSrcSkip = ['new-icons'];
        sharedSrcDirs.forEach(dir => {
            const src = path.join(this.sourceDir, 'src', dir);
            const dest = path.join(srcPath, dir);
            if (fs.existsSync(src)) {
                this.copyDirectoryRecursive(src, dest, sharedSrcSkip);
            }
        });

        // Copy src/index.js (will be rewritten by modifyIndexJs later)
        const indexSrc = path.join(this.sourceDir, 'src', 'index.js');
        if (fs.existsSync(indexSrc)) {
            fs.copyFileSync(indexSrc, path.join(srcPath, 'index.js'));
        }
    }

    /**
     * Rewrite a copied block.json title for the free distribution
     * (see FREE_TITLE_OVERRIDES). Runs before the free build, so the
     * override lands in both the bundled editor JS and the manifest.
     */
    applyFreeTitleOverride(blockName, destBlockPath) {
        const overrideTitle = FREE_TITLE_OVERRIDES[blockName];
        if (!overrideTitle) {
            return;
        }

        const blockJsonPath = path.join(destBlockPath, 'block.json');
        if (!fs.existsSync(blockJsonPath)) {
            console.log(`   ⚠️  block.json missing for ${blockName}, cannot patch title`);
            return;
        }

        const blockJson = JSON.parse(fs.readFileSync(blockJsonPath, 'utf8'));
        blockJson.title = overrideTitle;
        fs.writeFileSync(blockJsonPath, JSON.stringify(blockJson, null, 4));
        console.log(`   ✓ Patched ${blockName} title to "${overrideTitle}"`);
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

    async ensureSettingsPageRendersAllCategories() {
        const settingsPath = path.join(this.freeVersionDir, 'admin', 'settings-page.php');
        if (!fs.existsSync(settingsPath)) {
            return;
        }

        let content = fs.readFileSync(settingsPath, 'utf8');
        if (content.includes('$category_titles = array(') && content.includes('foreach ($grouped_blocks as $category_slug => $blocks_for_category)')) {
            console.log('   ✓ Settings page renders all block categories');
            return;
        }

        const oldRenderBlockPattern = /                    \/\/ Render tiers in the desired order: Free, Plus, Premium, then any others\.\r?\n\s+\$render_tier\(\s*'Free Blocks',\s+\$grouped_blocks\['adaire-free'\]\s*\);\r?\n\s+\$render_tier\(\s*'Plus Blocks',\s+\$grouped_blocks\['adaire-plus'\]\s*\);\r?\n\s+\$render_tier\(\s*'Premium Blocks',\s+\$grouped_blocks\['adaire-premium'\]\s*\);\r?\n\r?\n\s+\/\/ Render any non-standard categories under "Other Blocks"\.\r?\n\s+\$other_blocks = \$grouped_blocks\['other'\];\r?\n\s+if \(!empty\(\$other_blocks\)\) \{\r?\n\s+\$render_tier\(\s*'Other Blocks',\s+\$other_blocks\s*\);\r?\n\s+\}/;

        const newRenderBlock = `                    $category_titles = array(
                        'adaire-free' => 'Free Blocks',
                        'adaire-plus' => 'Plus Blocks',
                        'adaire-premium' => 'Premium Blocks',
                        'other' => 'Other Blocks',
                        'adaire-hero-sections' => 'Hero & Navigation',
                        'adaire-layout-sections' => 'Layout Sections',
                        'adaire-marketing' => 'Marketing',
                        'adaire-media' => 'Media',
                        'adaire-business' => 'Business',
                        'adaire-testimonial' => 'Testimonials',
                        'adaire-social' => 'Social',
                        'adaire-blog-publishing' => 'Blog & Publishing',
                        'adaire-start-actions' => 'Start & Actions',
                        'adaire-information-blocks' => 'Information Blocks',
                        'adaire-effects-interactions' => 'Effects & Interactions',
                        'adaire-interactive' => 'Interactive',
                        'adaire-layout-navigation' => 'Layout & Navigation',
                        'adaire-blog-content' => 'Blog & Content',
                        'adaire-content-expandable' => 'Expandable Content',
                        'adaire-content-info' => 'Content & Info',
                        'adaire-content-tabs' => 'Tabs & Content',
                        'adaire-layout-hero' => 'Layout & Hero',
                        'adaire-marketing-conversion' => 'Marketing & Conversion',
                        'adaire-media-images' => 'Media & Images',
                        'adaire-media-videos' => 'Media & Videos',
                        'adaire-reviews-trust' => 'Reviews & Trust',
                        'adaire-social-engagement' => 'Social & Engagement',
                    );

                    foreach ($grouped_blocks as $category_slug => $blocks_for_category) {
                        if (empty($blocks_for_category)) {
                            continue;
                        }

                        $title = isset($category_titles[$category_slug]) ? $category_titles[$category_slug] : ucwords(str_replace('-', ' ', $category_slug));
                        $render_tier($title, $blocks_for_category);
                    }`;

        if (!oldRenderBlockPattern.test(content)) {
            throw new Error('Could not update settings page category renderer. Expected render block was not found.');
        }

        content = content.replace(oldRenderBlockPattern, newRenderBlock);
        fs.writeFileSync(settingsPath, content);
        console.log('   ✓ Updated settings page to render all block categories');
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
                build: 'node --max-old-space-size=8192 node_modules/@wordpress/scripts/bin/wp-scripts.js build --blocks-manifest',
                start: 'node --max-old-space-size=8192 node_modules/@wordpress/scripts/bin/wp-scripts.js start',
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

            console.log('   Linking node_modules from main plugin...');
            const sourceNodeModules = path.join(this.sourceDir, 'node_modules');
            const targetNodeModules = path.join(this.freeVersionDir, 'node_modules');
            if (fs.existsSync(sourceNodeModules)) {
                if (fs.existsSync(targetNodeModules)) {
                    fs.rmSync(targetNodeModules, { recursive: true, force: true });
                }
                fs.symlinkSync(sourceNodeModules, targetNodeModules, 'junction');
                console.log('   ✓ node_modules linked (junction)');
            } else {
                console.log('   ⚠️  node_modules not found in main plugin, falling back to npm install...');
                execSync('npm install', { stdio: 'inherit', shell: true, env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=8192' } });
            }
            this.verifyDependencyInstall();

            console.log('   Running prebuild...');
            try {
                execSync('npm run prebuild', { stdio: 'inherit', shell: true, env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=8192' } });
                console.log('   ✓ Prebuild completed');
            } catch (prebuildError) {
                console.log('   ⚠️  Prebuild failed, continuing...');
                console.log('   Error:', prebuildError.message);
            }

            console.log('   Running build...');
            try {
                // Call wp-scripts directly with explicit heap size so memory limit is
                // guaranteed regardless of how npm propagates NODE_OPTIONS on Windows.
                // Prebuild already ran above, so skip it here via --ignore-scripts.
                const wpScriptsBin = path.join(this.freeVersionDir, 'node_modules', '@wordpress', 'scripts', 'bin', 'wp-scripts.js');
                execSync(
                    `node --max-old-space-size=8192 "${wpScriptsBin}" build --blocks-manifest`,
                    { stdio: 'inherit', cwd: this.freeVersionDir, shell: true }
                );
            } catch (buildError) {
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

                console.error(`   Error: ${buildError.message}`);
                throw new Error(`Build failed: ${buildError.message}`);
            }

            console.log(`   ✓ Build completed successfully`);

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
        execSync('npm cache verify', { stdio: 'inherit', shell: true, env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=8192' } });
        execSync('npm ci', { stdio: 'inherit', shell: true, env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=8192' } });

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

        // build/blocks-manifest.php — adaire-blocks.php does a hard
        // `require __DIR__ . '/build/blocks-manifest.php'` during block
        // registration. If this file is missing (e.g. the build ran without
        // the `--blocks-manifest` flag), the require fails and ZERO blocks
        // get registered — installs cleanly but shows "0 blocks available"
        // in Block Management. Fail loudly here instead of shipping that.
        const manifestFile = path.join(this.freeVersionDir, 'build', 'blocks-manifest.php');
        if (!fs.existsSync(manifestFile)) {
            throw new Error(
                `build/blocks-manifest.php not found at ${manifestFile} — the build ran without ` +
                'the --blocks-manifest flag. adaire-blocks.php requires this file to register any ' +
                'blocks; without it the plugin installs but shows 0 blocks available.'
            );
        }
        console.log('✓ build/blocks-manifest.php: present');

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
     * Create zip file of the free version.
     *
     * IMPORTANT: Compress-Archive is a PowerShell cmdlet, not a cmd.exe command.
     * It must be invoked via `powershell.exe` directly (execFileSync) — running it
     * through `execSync(cmd, { shell: true })` shells out to cmd.exe on Windows,
     * which doesn't recognize Compress-Archive and fails immediately. On top of
     * that, the previous implementation joined multiple absolute paths into a
     * single space-separated string and passed it as one quoted -Path argument;
     * PowerShell treats a quoted string as one literal path, so a path containing
     * literal spaces never resolves, and Compress-Archive errors with
     * "Cannot find path ... because it does not exist." Either failure means no
     * zip is ever produced (silently, since the outer catch just logs a warning),
     * which is what was actually shipping as "adaire-blocks-free.zip" — either a
     * stale/missing file, or one assembled by hand from the generated folder with
     * the wrong nesting, both of which WordPress rejects with
     * "No valid plugins were found" (its installer only looks for a *.php file
     * with a valid header at the top level of the extracted archive, or exactly
     * one level inside a single wrapping folder).
     *
     * Fix: stage the shipped files into a single `adaire-blocks-free/` folder and
     * compress that folder itself (mirrors the already-working approach in
     * scripts/zip-generated-folder.js) via an explicit `powershell.exe` call with
     * a single, properly quoted path.
     */
    async createZipFile() {
        console.log('\nCreating zip file...');
        try {
            const buildDir = path.join(this.freeVersionDir, 'build');
            if (!fs.existsSync(buildDir)) {
                throw new Error(
                    `build/ not found at ${buildDir} — buildFreeVersion() must run before createZipFile(), ` +
                    'otherwise the shipped plugin will install but register zero blocks.'
                );
            }

            // Delegate to zip-generated-folder.js which uses a canonical exclusion
            // list (strips src/, node_modules, dev config, etc.) and is the single
            // source of truth for what belongs in a shipped zip.
            execFileSync('node', [
                path.join(this.sourceDir, 'scripts', 'zip-generated-folder.js'),
                'free',
            ], { stdio: 'inherit', cwd: this.sourceDir });
        } catch (error) {
            console.error('   ⚠️  Warning: Zip file creation failed:', error.message);
            console.log('   You can manually create the zip by running: npm run plugin-zip:free');
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

/**
 * Escape a path for safe interpolation inside a single-quoted PowerShell string
 * (PowerShell escapes an embedded single quote by doubling it).
 */
function escapePowerShellPath(value) {
    return value.replace(/'/g, "''");
}

// Run the generator
if (require.main === module) {
    const generator = new FreeVersionGenerator();
    generator.generate();
}

module.exports = FreeVersionGenerator;
