#!/usr/bin/env node

/**
 * Freemium Version Generator for Adaire Blocks (Guten-Blocks)
 *
 * Mirrors scripts/generate-free-version.js — same scaffold, same build/zip
 * safety checks (blocks-manifest presence, adm-zip forward-slash paths,
 * dependency-install verification) — but ships only the blocks tagged
 * under the "freemium" tier in config/blocks-config.json (currently just
 * the Cookie Banner block) instead of the "free" tier list.
 *
 * Do NOT edit free-version-scaffold/ contents from here — it's shared,
 * authoritative source for the base plugin shell (adaire-blocks.php,
 * readme.txt, deactivation modal, sendgrid) used by every generated
 * distribution.
 */

const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

class FreemiumVersionGenerator {
    constructor() {
        this.sourceDir = process.cwd();
        this.scaffoldDir = path.join(this.sourceDir, 'free-version-scaffold');
        this.freeVersionDir = path.join(this.sourceDir, '../adaire-blocks-freemium');
        this.configFile = path.join(this.sourceDir, 'config/blocks-config.json');
    }

    async generate() {
        console.log('Starting Freemium Version Generation...');

        if (!fs.existsSync(this.scaffoldDir)) {
            throw new Error(
                `Scaffold directory not found at ${this.scaffoldDir}.\n` +
                'Expected: free-version-scaffold/ in the plugin root.'
            );
        }

        try {
            await this.createCleanDirectory();
            await this.copyScaffoldFiles();
            await this.copyFreemiumBlocks();
            await this.copySharedFiles();
            await this.sanitizeSettingsPage();
            await this.ensureSettingsPageRendersAllCategories();
            await this.generatePackageJson();
            await this.buildFreemiumVersion();
            await this.verifyGeneration();
            await this.createZipFile();

            console.log('\nFreemium version generated successfully!');
            console.log(`Location: ${this.freeVersionDir}`);
        } catch (error) {
            console.error('Error generating freemium version:', error.message);
            process.exit(1);
        }
    }

    async createCleanDirectory() {
        console.log('Creating clean output directory...');
        if (fs.existsSync(this.freeVersionDir)) {
            fs.rmSync(this.freeVersionDir, { recursive: true, force: true });
        }
        fs.mkdirSync(this.freeVersionDir, { recursive: true });
    }

    async copyScaffoldFiles() {
        console.log('Copying scaffold files...');
        const skipFiles = ['SCAFFOLD-README.md'];
        this.copyDirectoryRecursive(this.scaffoldDir, this.freeVersionDir, skipFiles);
        console.log('   ✓ Scaffold files copied');
        this.patchPluginVersion();
    }

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
        outContent = outContent.replace(/^(\s*\*\s*Version:\s*)(.+)$/m, `$1${version}`);
        outContent = outContent.replace(
            /define\(\s*'ADAIRE_BLOCKS_VERSION'\s*,\s*'[^']*'\s*\)/,
            `define('ADAIRE_BLOCKS_VERSION', '${version}')`
        );
        fs.writeFileSync(outPluginFile, outContent);
        console.log(`   ✓ Version patched to ${version}`);
    }

    /**
     * Copy only the blocks enabled under config.freemium, plus the shared
     * src/ files every block needs at runtime (components, icons, the
     * category registry, and the responsive-system helpers).
     */
    async copyFreemiumBlocks() {
        console.log('Copying freemium blocks...');

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

        // Shared src/ files needed at runtime: components (InspectorTabs,
        // AdaireColorControl, QuickZone, DeviceSwitcher, ...), icons, the
        // category registry (registers "adaire-freemium" so the block shows
        // under the right inserter group instead of falling back to
        // Uncategorized), and the responsive device-preview helper.
        const sharedSrcDirs = ['components', 'icons'];
        const sharedSrcSkip = ['new-icons'];
        sharedSrcDirs.forEach(dir => {
            const src = path.join(this.sourceDir, 'src', dir);
            const dest = path.join(srcPath, dir);
            if (fs.existsSync(src)) {
                this.copyDirectoryRecursive(src, dest, sharedSrcSkip);
            }
        });

        ['categories.js', 'responsive-system.js', 'responsive-system.scss', 'index.js'].forEach(file => {
            const src = path.join(this.sourceDir, 'src', file);
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, path.join(srcPath, file));
            }
        });
    }

    async copySharedFiles() {
        console.log('Copying shared admin/includes files from main plugin...');

        const includesSrc = path.join(this.sourceDir, 'includes');
        const includesDest = path.join(this.freeVersionDir, 'includes');
        fs.mkdirSync(includesDest, { recursive: true });
        if (fs.existsSync(includesSrc)) {
            fs.readdirSync(includesSrc).forEach(file => {
                const dest = path.join(includesDest, file);
                if (!fs.existsSync(dest) && file === 'class-adaire-blocks-config.php') {
                    fs.copyFileSync(path.join(includesSrc, file), dest);
                }
            });
        }

        const adminSrc = path.join(this.sourceDir, 'admin');
        const adminDest = path.join(this.freeVersionDir, 'admin');
        fs.mkdirSync(adminDest, { recursive: true });
        if (fs.existsSync(adminSrc)) {
            fs.readdirSync(adminSrc).forEach(file => {
                const srcPath = path.join(adminSrc, file);
                const destPath = path.join(adminDest, file);
                const stat = fs.statSync(srcPath);
                if (stat.isFile()) {
                    if (
                        (file === 'settings-page.php' || file === 'block-migration.php') &&
                        !fs.existsSync(destPath)
                    ) {
                        fs.copyFileSync(srcPath, destPath);
                    }
                } else if (stat.isDirectory() && (file === 'css' || file === 'js')) {
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

        const configSrc = path.join(this.sourceDir, 'config');
        const configDest = path.join(this.freeVersionDir, 'config');
        if (fs.existsSync(configSrc)) {
            fs.mkdirSync(configDest, { recursive: true });
            ['block-icon-mapping.json', 'blocks-config.json'].forEach(file => {
                const src = path.join(configSrc, file);
                const dest = path.join(configDest, file);
                if (fs.existsSync(src)) {
                    fs.copyFileSync(src, dest);
                    console.log(`   ✓ Copied config/${file} (from dev plugin)`);
                }
            });
        }

        const scriptsSrc = path.join(this.sourceDir, 'scripts');
        const scriptsDest = path.join(this.freeVersionDir, 'scripts');
        if (fs.existsSync(scriptsSrc)) {
            this.copyDirectoryRecursive(scriptsSrc, scriptsDest);
            console.log('   ✓ Copied scripts/');
        }
    }

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
        console.log('   ✓ Sanitized settings page for freemium version');
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
        // Best-effort only — if the scaffold's settings-page.php doesn't match the
        // expected pattern, the block still installs and works; only the admin
        // "Block Management" grouping label may fall back to a slugified title.
        console.log('   ⚠️  Could not confirm settings page category renderer — continuing anyway (non-fatal).');
    }

    async generatePackageJson() {
        console.log('Generating package.json...');
        const sourcePackage = JSON.parse(fs.readFileSync(path.join(this.sourceDir, 'package.json'), 'utf8'));
        const pluginContent = fs.readFileSync(path.join(this.sourceDir, 'adaire-blocks.php'), 'utf8');
        const versionMatch = pluginContent.match(/Version:\s*([^\n]*)/);
        const currentVersion = versionMatch ? versionMatch[1].trim() : sourcePackage.version;

        const freemiumPackage = {
            name: 'adaire-blocks-freemium',
            version: currentVersion,
            description: 'Freemium blocks for Adaire Blocks (Guten-Blocks) — starting with the Cookie Banner consent block.',
            main: 'src/index.js',
            scripts: {
                prebuild: 'node scripts/apply-new-icons.js && node scripts/update-block-icons.js',
                build: 'node --max-old-space-size=8192 node_modules/@wordpress/scripts/bin/wp-scripts.js build --blocks-manifest',
                start: 'node --max-old-space-size=8192 node_modules/@wordpress/scripts/bin/wp-scripts.js start',
                'plugin-zip': 'wp-scripts plugin-zip',
                'deploy:freemium': 'npm run build && npm run plugin-zip',
                test: 'wp-scripts test-unit-js',
            },
            dependencies: sourcePackage.dependencies || {},
            devDependencies: sourcePackage.devDependencies || {},
            keywords: sourcePackage.keywords || [],
            author: sourcePackage.author || 'Adaire',
            license: 'GPL-3.0',
            repository: sourcePackage.repository || {},
            bugs: sourcePackage.bugs || {},
            homepage: sourcePackage.homepage || 'https://adaire.digital/',
        };

        fs.writeFileSync(path.join(this.freeVersionDir, 'package.json'), JSON.stringify(freemiumPackage, null, 2));

        const packageLockSrc = path.join(this.sourceDir, 'package-lock.json');
        if (fs.existsSync(packageLockSrc)) {
            fs.copyFileSync(packageLockSrc, path.join(this.freeVersionDir, 'package-lock.json'));
        }

        console.log(`   ✓ package.json generated (version ${currentVersion})`);
    }

    async buildFreemiumVersion() {
        console.log('Building freemium version...');
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
            path.join(this.freeVersionDir, 'node_modules', '@wordpress', 'scripts', 'config', 'webpack.config.js'),
        ];

        const missingFiles = requiredFiles.filter(file => {
            if (!fs.existsSync(file)) return true;
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
            if (!fs.existsSync(file)) return true;
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
     * Rewrite src/index.js to import the category registry, the responsive
     * helper, and only the enabled freemium blocks.
     */
    modifyIndexJs() {
        console.log('Updating src/index.js for freemium blocks...');
        const indexPath = path.join(this.freeVersionDir, 'src', 'index.js');
        if (!fs.existsSync(indexPath)) {
            return;
        }

        const enabledBlocks = this.getEnabledBlocks();

        let indexContent = `// Adaire Blocks Freemium Version - auto-generated, do not edit manually\n\n`;
        indexContent += `import './categories';\n`;
        if (fs.existsSync(path.join(this.freeVersionDir, 'src', 'responsive-system.js'))) {
            indexContent += `import './responsive-system';\n`;
        }
        enabledBlocks.forEach(blockName => {
            indexContent += `import './${blockName}';\n`;
        });

        fs.writeFileSync(indexPath, indexContent);
        console.log(`   ✓ index.js updated (${enabledBlocks.length} block(s) + categories + responsive-system)`);
    }

    async verifyGeneration() {
        console.log('\nVerifying generated freemium version...');

        const srcPath = path.join(this.freeVersionDir, 'src');
        if (fs.existsSync(srcPath)) {
            const blocks = fs.readdirSync(srcPath).filter(item =>
                fs.statSync(path.join(srcPath, item)).isDirectory() && item.endsWith('-block')
            );
            console.log(`\n Blocks included (${blocks.length}):`);
            blocks.forEach(b => console.log(`   ✓ ${b}`));
        }

        const manifestFile = path.join(this.freeVersionDir, 'build', 'blocks-manifest.php');
        if (!fs.existsSync(manifestFile)) {
            throw new Error(
                `build/blocks-manifest.php not found at ${manifestFile} — the build ran without ` +
                'the --blocks-manifest flag. adaire-blocks.php requires this file to register any ' +
                'blocks; without it the plugin installs but shows 0 blocks available.'
            );
        }
        console.log('✓ build/blocks-manifest.php: present');

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

        const modalFile = path.join(this.freeVersionDir, 'admin', 'deactivation-modal.php');
        const sendgridFile = path.join(this.freeVersionDir, 'includes', 'sendgrid.php');
        console.log(`\n✓ Deactivation modal: ${fs.existsSync(modalFile) ? 'present' : 'MISSING'}`);
        console.log(`✓ SendGrid integration: ${fs.existsSync(sendgridFile) ? 'present' : 'MISSING'}`);

        const iconsPath = path.join(this.freeVersionDir, 'src', 'icons');
        if (fs.existsSync(iconsPath)) {
            const iconFiles = fs.readdirSync(iconsPath).filter(f => f.endsWith('.js'));
            console.log(`✓ Icons: ${iconFiles.length} icon files`);
        }
    }

    async createZipFile() {
        console.log('\nCreating zip file...');
        try {
            const buildDir = path.join(this.freeVersionDir, 'build');
            if (!fs.existsSync(buildDir)) {
                throw new Error(
                    `build/ not found at ${buildDir} — buildFreemiumVersion() must run before createZipFile(), ` +
                    'otherwise the shipped plugin will install but register zero blocks.'
                );
            }

            execFileSync('node', [
                path.join(this.sourceDir, 'scripts', 'zip-generated-folder.js'),
                'freemium',
            ], { stdio: 'inherit', cwd: this.sourceDir });
        } catch (error) {
            console.error('   ⚠️  Warning: Zip file creation failed:', error.message);
            console.log('   You can manually create the zip by running: npm run plugin-zip:freemium');
        }
    }

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
     * Return the list of block folder names enabled under config.freemium.
     */
    getEnabledBlocks() {
        const configPath = path.join(this.sourceDir, 'config', 'blocks-config.json');

        if (!fs.existsSync(configPath)) {
            return ['cookie-consent-block'];
        }

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const freemiumConfig = config.freemium || {};

        const enabledBlocks = Object.keys(freemiumConfig).filter(
            blockName => freemiumConfig[blockName]?.enabled === true
        );

        const verified = enabledBlocks.filter(blockName => {
            const blockJsonPath = path.join(this.sourceDir, 'src', blockName, 'block.json');
            if (!fs.existsSync(blockJsonPath)) {
                console.log(`   ⚠️  block.json not found for ${blockName}, skipping`);
                return false;
            }
            try {
                const blockJson = JSON.parse(fs.readFileSync(blockJsonPath, 'utf8'));
                console.log(`   ✓ ${blockName} marked freemium (category: ${blockJson.category || 'uncategorized'})`);
                return true;
            } catch (error) {
                console.log(`   ⚠️  Error reading block.json for ${blockName}: ${error.message}`);
                return false;
            }
        });

        console.log(`   Freemium tier blocks: ${verified.length}`);
        return verified;
    }
}

if (require.main === module) {
    const generator = new FreemiumVersionGenerator();
    generator.generate();
}

module.exports = FreemiumVersionGenerator;
