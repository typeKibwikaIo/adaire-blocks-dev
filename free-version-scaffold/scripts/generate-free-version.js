#!/usr/bin/env node

/**
 * Free Version Generator for GutenBlocks
 * 
 * This script generates a clean free version of the plugin by:
 * 1. Creating a minimal plugin structure
 * 2. Including only free blocks
 * 3. Removing all license/premium code
 * 4. Building a WordPress.org compliant plugin
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FreeVersionGenerator {
    constructor() {
        this.sourceDir = process.cwd();
        this.freeVersionDir = path.join(this.sourceDir, '../adaire-blocks-free');
        this.configFile = path.join(this.sourceDir, 'config/blocks-config.json');
    }

    /**
     * Main generation process
     */
    async generate() {
        console.log('🚀 Starting Clean Free Version Generation...');
        
        try {
            // Step 1: Create clean directory structure
            await this.createCleanDirectory();
            
            // Step 2: Generate minimal plugin file
            await this.generatePluginFile();
            
            // Step 3: Copy only free blocks
            await this.copyFreeBlocks();
            
            // Step 4: Copy essential files
            await this.copyEssentialFiles();
            
            // Step 4.1: Sanitize settings page for free version (no upgrade/license)
            await this.sanitizeSettingsPage();
            
            // Step 5: Generate clean package.json
            await this.generatePackageJson();
            
            // Step 6: Generate clean readme.txt
            await this.generateReadme();
            
            // Step 7: Build the free version
            await this.buildFreeVersion();
            
            // Step 8: Verify generation
            await this.verifyGeneration();
            
            console.log('\n✅ Clean free version generated successfully!');
            console.log(`📁 Location: ${this.freeVersionDir}`);
            
        } catch (error) {
            console.error('❌ Error generating free version:', error.message);
            process.exit(1);
        }
    }
    
    /**
     * Create clean directory structure
     */
    async createCleanDirectory() {
        console.log('📁 Creating clean directory structure...');
        
        if (fs.existsSync(this.freeVersionDir)) {
            fs.rmSync(this.freeVersionDir, { recursive: true, force: true });
        }
        
        fs.mkdirSync(this.freeVersionDir, { recursive: true });
        
        // Create essential subdirectories
        const subdirs = [
            'admin',
            'admin/css',
            'admin/js',
            'build',
            'config',
            'includes',
            'src',
            'src/components',
            'src/icons',
            'src/icons/icon-svgs'
        ];
        
        subdirs.forEach(dir => {
            fs.mkdirSync(path.join(this.freeVersionDir, dir), { recursive: true });
        });
    }

    /**
     * Generate minimal plugin file
     */
    async generatePluginFile() {
        console.log('📝 Generating clean plugin file...');
        
        // Get version from source
        const sourcePluginFile = path.join(this.sourceDir, 'adaire-blocks.php');
        const sourceContent = fs.readFileSync(sourcePluginFile, 'utf8');
        const versionMatch = sourceContent.match(/Version:\s*([^\n]*)/);
        const currentVersion = versionMatch ? versionMatch[1].trim() : '1.0.0';
        
        const pluginContent = `<?php
/**
 * Plugin Name: GutenBlocks
 * Plugin URI: https://adaire.digital/adaire-blocks/
 * Description: Professional WordPress blocks for Gutenberg editor with GSAP animations and modern design.
 * Version: ${currentVersion}
 * Author: Adaire
 * Author URI: https://adaire.digital/
 * License: GPL-3.0
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: adaire-blocks
 * Requires at least: 6.7
 * Tested up to: 6.8
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('ADAIRE_BLOCKS_VERSION', '${currentVersion}');
define('ADAIRE_BLOCKS_PLUGIN_FILE', __FILE__);
define('ADAIRE_BLOCKS_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('ADAIRE_BLOCKS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ADAIRE_BLOCKS_IS_FREE', true);

// Include the main plugin class
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-blocks-config.php';

// Initialize the plugin
function adaire_blocks_init() {
    // Get settings instance
    $settings = AdaireBlocksConfig::get_instance();
    
    // Register blocks
    adaire_blocks_register_blocks();
}
add_action('init', 'adaire_blocks_init');

/**
 * Register all blocks
 */
function adaire_blocks_register_blocks() {
    $blocks_dir = ADAIRE_BLOCKS_PLUGIN_PATH . 'build/';
    
    if (!is_dir($blocks_dir)) {
                    return;
                }
                
    $block_dirs = glob($blocks_dir . '*', GLOB_ONLYDIR);
    
    foreach ($block_dirs as $block_dir) {
        $block_name = basename($block_dir);
        $block_json = $block_dir . '/block.json';
        
        if (file_exists($block_json)) {
            register_block_type($block_json);
        }
    }
}

/**
 * Enqueue block assets
 */
function adaire_blocks_enqueue_assets() {
    $blocks_dir = ADAIRE_BLOCKS_PLUGIN_PATH . 'build/';
    
    if (!is_dir($blocks_dir)) {
            return;
        }
        
    $block_dirs = glob($blocks_dir . '*', GLOB_ONLYDIR);
    
    foreach ($block_dirs as $block_dir) {
        $block_name = basename($block_dir);
        $asset_file = $block_dir . '/index.asset.php';
        
        if (file_exists($asset_file)) {
            $asset = require $asset_file;
            $dependencies = $asset['dependencies'] ?? [];
            $version = $asset['version'] ?? ADAIRE_BLOCKS_VERSION;
            
            // Enqueue block script
            wp_enqueue_script(
                'adaire-blocks-' . $block_name,
                ADAIRE_BLOCKS_PLUGIN_URL . 'build/' . $block_name . '/index.js',
                $dependencies,
                $version,
                true
            );
            
            // Enqueue block style
            $style_file = $block_dir . '/style-index.css';
            if (file_exists($style_file)) {
                wp_enqueue_style(
                    'adaire-blocks-' . $block_name . '-style',
                    ADAIRE_BLOCKS_PLUGIN_URL . 'build/' . $block_name . '/style-index.css',
                    [],
                    $version
                );
            }
        }
    }
}
add_action('wp_enqueue_scripts', 'adaire_blocks_enqueue_assets');
add_action('enqueue_block_editor_assets', 'adaire_blocks_enqueue_assets');

// Enqueue Bootstrap Icons CSS if any block that uses Bootstrap icons is present on the page
function enqueue_bootstrap_icons_assets() {
    if ( is_admin() ) {
        return;
    }
    global $post;
    if ( ! $post ) {
        return;
    }
    // Check for free blocks that use Bootstrap icons
    if (
        has_block( 'create-block/icon-box-block', $post ) ||
        has_block( 'create-block/social-banner-block', $post ) ||
        has_block( 'create-block/social-share-block', $post ) ||
        has_block( 'create-block/our-process-block', $post )
    ) {
        // Enqueue Bootstrap Icons CSS from CDN
        wp_enqueue_style(
            'bootstrap-icons',
            'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css',
            array(),
            '1.13.1'
        );
    }
}
add_action( 'wp_enqueue_scripts', 'enqueue_bootstrap_icons_assets' );

// Also enqueue in editor - use a later hook to avoid interfering with block.json parsing
function enqueue_bootstrap_icons_editor() {
    // Use admin_enqueue_scripts instead to avoid interfering with block registration
    wp_enqueue_style(
        'bootstrap-icons',
        'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css',
        array(),
        '1.13.1'
    );
}
add_action( 'admin_enqueue_scripts', 'enqueue_bootstrap_icons_editor' );

// Bootstrap admin settings (register menu, assets, etc.)
if (is_admin()) {
    require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/settings-page.php';
    if (class_exists('AdaireBlocksSettings')) {
        AdaireBlocksSettings::get_instance();
    }
    
    // Include block migration tool
    require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/block-migration.php';
}

/**
 * Plugin activation hook
 */
function adaire_blocks_activate() {
    // Set default options
    add_option('adaire_blocks_version', ADAIRE_BLOCKS_VERSION);
}
register_activation_hook(__FILE__, 'adaire_blocks_activate');

/**
 * Plugin deactivation hook
 */
function adaire_blocks_deactivate() {
    // Clean up if needed
}
register_deactivation_hook(__FILE__, 'adaire_blocks_deactivate');
`;

        fs.writeFileSync(path.join(this.freeVersionDir, 'adaire-blocks.php'), pluginContent);
        console.log('   ✓ Clean plugin file generated');
    }

    /**
     * Copy only free blocks
     */
    async copyFreeBlocks() {
        console.log('📦 Copying free blocks...');
        
        const enabledBlocks = this.getEnabledBlocks();
        const srcPath = path.join(this.freeVersionDir, 'src');
        
        enabledBlocks.forEach(blockName => {
            const sourceBlockPath = path.join(this.sourceDir, 'src', blockName);
            const destBlockPath = path.join(srcPath, blockName);
            
            if (fs.existsSync(sourceBlockPath)) {
                this.copyDirectoryRecursive(sourceBlockPath, destBlockPath);
                console.log(`   ✓ Copied ${blockName}`);
            }
        });
        
        // Copy components and icons
        const componentsSource = path.join(this.sourceDir, 'src', 'components');
        const componentsDest = path.join(srcPath, 'components');
        if (fs.existsSync(componentsSource)) {
            this.copyDirectoryRecursive(componentsSource, componentsDest);
        }
        
        const iconsSource = path.join(this.sourceDir, 'src', 'icons');
        const iconsDest = path.join(srcPath, 'icons');
        if (fs.existsSync(iconsSource)) {
            this.copyDirectoryRecursive(iconsSource, iconsDest);
        }
        
        // Copy index.js
        const indexPath = path.join(this.sourceDir, 'src', 'index.js');
        if (fs.existsSync(indexPath)) {
            fs.copyFileSync(indexPath, path.join(srcPath, 'index.js'));
        }
    }

    /**
     * Copy essential files
     */
    async copyEssentialFiles() {
        console.log('📋 Copying essential files...');
        
        // Copy includes directory (only essential files)
        const includesSource = path.join(this.sourceDir, 'includes');
        const includesDest = path.join(this.freeVersionDir, 'includes');
        
        if (fs.existsSync(includesSource)) {
            const files = fs.readdirSync(includesSource);
            files.forEach(file => {
                if (file === 'class-adaire-blocks-config.php') {
                    fs.copyFileSync(
                        path.join(includesSource, file),
                        path.join(includesDest, file)
                    );
                }
            });
        }
        
        // Copy admin files (only essential)
        const adminSource = path.join(this.sourceDir, 'admin');
        const adminDest = path.join(this.freeVersionDir, 'admin');
        
        if (fs.existsSync(adminSource)) {
            const files = fs.readdirSync(adminSource);
            files.forEach(file => {
                const sourcePath = path.join(adminSource, file);
                const destPath = path.join(adminDest, file);
                
                // Always copy settings-page.php
                if (file === 'settings-page.php' && fs.statSync(sourcePath).isFile()) {
                    fs.copyFileSync(sourcePath, destPath);
                    return;
                }
                
                // Always copy block-migration.php
                if (file === 'block-migration.php' && fs.statSync(sourcePath).isFile()) {
                    fs.copyFileSync(sourcePath, destPath);
                    return;
                }
                
                // Copy css and js directories recursively
                if (file === 'css' || file === 'js') {
                    if (fs.statSync(sourcePath).isDirectory()) {
                        this.copyDirectoryRecursive(sourcePath, destPath);
                    }
                    return;
                }
                
                // Copy any loose css/js files at root if present
                if (fs.statSync(sourcePath).isFile() && (file.endsWith('.css') || file.endsWith('.js'))) {
                    fs.copyFileSync(sourcePath, destPath);
                }
            });
        }
        
        // Copy readme.txt
        const readmeSource = path.join(this.sourceDir, 'readme.txt');
        if (fs.existsSync(readmeSource)) {
            fs.copyFileSync(readmeSource, path.join(this.freeVersionDir, 'readme.txt'));
        }
        
        // Copy scripts directory (needed for prebuild icon updates)
        const scriptsSource = path.join(this.sourceDir, 'scripts');
        const scriptsDest = path.join(this.freeVersionDir, 'scripts');
        if (fs.existsSync(scriptsSource)) {
            this.copyDirectoryRecursive(scriptsSource, scriptsDest);
            console.log('   ✓ Copied scripts directory');
        }
        
        // Copy config directory (needed for prebuild icon updates)
        const configSource = path.join(this.sourceDir, 'config');
        const configDest = path.join(this.freeVersionDir, 'config');
        if (fs.existsSync(configSource)) {
            // Copy block-icon-mapping.json (required for prebuild)
            const mappingSource = path.join(configSource, 'block-icon-mapping.json');
            const mappingDest = path.join(configDest, 'block-icon-mapping.json');
            if (fs.existsSync(mappingSource)) {
                if (!fs.existsSync(configDest)) {
                    fs.mkdirSync(configDest, { recursive: true });
                }
                fs.copyFileSync(mappingSource, mappingDest);
                console.log('   ✓ Copied config/block-icon-mapping.json');
            }
            
            // Copy blocks-config.json (may be needed)
            const blocksConfigSource = path.join(configSource, 'blocks-config.json');
            const blocksConfigDest = path.join(configDest, 'blocks-config.json');
            if (fs.existsSync(blocksConfigSource)) {
                if (!fs.existsSync(configDest)) {
                    fs.mkdirSync(configDest, { recursive: true });
                }
                fs.copyFileSync(blocksConfigSource, blocksConfigDest);
                console.log('   ✓ Copied config/blocks-config.json');
            }
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
        
        // Force free behavior in get_available_blocks
        content = content.replace(/\$upgrade_message\s*=\s*\$config->get_upgrade_message\([^)]*\);/g, "$upgrade_message = '';");
        content = content.replace(/\$limits\s*=\s*\$config->get_block_limits\([^)]*\);/g, "$limits = array();");
        content = content.replace(/\$is_premium_block\s*=\s*!\$config->is_premium\(\)\s*&&\s*!\$config->is_block_enabled\([^)]*\);/g, "$is_premium_block = false;");
        
        // If template echoes premium badges or upgrade prompts, neutralize by renaming classes used for styling
        content = content.replace(/adaire-block-premium-badge/g, 'adaire-block-badge');
        content = content.replace(/adaire-block-premium/g, 'adaire-block');
        content = content.replace(/adaire-block-upgrade-prompt/g, 'adaire-block-note');
        content = content.replace(/adaire-upgrade-button/g, 'adaire-hidden-upgrade-button');
        
        // Remove any direct calls to license checks if present
        content = content.replace(/adaire_blocks_license_[a-z_]+\([^)]*\);?/g, '');
        
        fs.writeFileSync(settingsPath, content);
        console.log('   ✓ Sanitized admin settings page for free version');
    }

    /**
     * Generate clean package.json
     */
    async generatePackageJson() {
        console.log('📝 Generating clean package.json...');
        
        const sourcePackagePath = path.join(this.sourceDir, 'package.json');
        const sourcePackage = JSON.parse(fs.readFileSync(sourcePackagePath, 'utf8'));
        
        // Get version from main plugin file
        const pluginFile = path.join(this.sourceDir, 'adaire-blocks.php');
        const pluginContent = fs.readFileSync(pluginFile, 'utf8');
        const versionMatch = pluginContent.match(/Version:\s*([^\n]*)/);
        const currentVersion = versionMatch ? versionMatch[1].trim() : sourcePackage.version;
        
        const freePackage = {
            name: 'adaire-blocks-free',
            version: currentVersion,
            description: 'Free version of GutenBlocks - Professional WordPress blocks for Gutenberg editor',
            main: 'src/index.js',
            scripts: {
                prebuild: 'node scripts/apply-new-icons.js && node scripts/update-block-icons.js',
                build: 'wp-scripts build --blocks-manifest',
                start: 'wp-scripts start --blocks-manifest',
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
        
        // Copy package-lock.json if it exists
        const packageLockSource = path.join(this.sourceDir, 'package-lock.json');
        if (fs.existsSync(packageLockSource)) {
            fs.copyFileSync(packageLockSource, path.join(this.freeVersionDir, 'package-lock.json'));
        }
    }

    /**
     * Verify what was generated
     */
    async verifyGeneration() {
        console.log('\n🔍 Verifying generated free version...');
        
        // Check which blocks are in src/
        const srcPath = path.join(this.freeVersionDir, 'src');
        if (fs.existsSync(srcPath)) {
            const blocks = fs.readdirSync(srcPath)
                .filter(item => {
                    const itemPath = path.join(srcPath, item);
                    return fs.statSync(itemPath).isDirectory() && item.endsWith('-block');
                });
            
            console.log(`\n📦 Blocks included in FREE version (${blocks.length}):`);
            blocks.forEach(block => console.log(`   ✓ ${block}`));
        }
        
        // Check if plugin file exists and is clean
        const phpFile = path.join(this.freeVersionDir, 'adaire-blocks.php');
        if (fs.existsSync(phpFile)) {
            const phpContent = fs.readFileSync(phpFile, 'utf8');
            const hasLicenseCode = phpContent.includes('license_manager') || phpContent.includes('is_license_active') || phpContent.includes('premium');
            const hasUpdateChecker = phpContent.includes('plugin-update-checker') || phpContent.includes('PucFactory');
            
            if (hasLicenseCode || hasUpdateChecker) {
                console.log('\n⚠️  WARNING: Plugin file may contain license or update checker code!');
                                        } else {
                console.log('\n✓ Plugin file is clean (no license or update checker code)');
            }
        }
        
        // Check if icons exist
        const iconsPath = path.join(this.freeVersionDir, 'src', 'icons');
        if (fs.existsSync(iconsPath)) {
            const iconFiles = fs.readdirSync(iconsPath).filter(f => f.endsWith('.js'));
            console.log(`\n✓ Icons directory exists with ${iconFiles.length} icon files`);
        }
    }

    /**
     * Recursively copy directory
     */
    copyDirectoryRecursive(source, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const files = fs.readdirSync(source);
        
        files.forEach(file => {
            const sourcePath = path.join(source, file);
            const destPath = path.join(dest, file);
            
            if (fs.statSync(sourcePath).isDirectory()) {
                this.copyDirectoryRecursive(sourcePath, destPath);
            } else {
                fs.copyFileSync(sourcePath, destPath);
            }
        });
    }

    /**
     * Get list of enabled blocks for free version
     * Only includes blocks that are:
     * 1. Listed in config.free with enabled: true
     * 2. Have category "adaire-blocks-free" in their block.json
     */
    getEnabledBlocks() {
        const configPath = path.join(this.sourceDir, 'config', 'blocks-config.json');
        
        if (!fs.existsSync(configPath)) {
            // Default free blocks if no config
            return [
                'accordion-block',
                'button-block',
                'testimonial-block'
            ];
        }
        
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const freeConfig = config.free || {};
        
        // Get blocks from config that are enabled
        const enabledFromConfig = Object.keys(freeConfig).filter(blockName => 
            freeConfig[blockName]?.enabled === true
        );
        
        // Filter to only include blocks that have "adaire-blocks-free" category
        const freeBlocks = enabledFromConfig.filter(blockName => {
            const blockJsonPath = path.join(this.sourceDir, 'src', blockName, 'block.json');
            
            if (!fs.existsSync(blockJsonPath)) {
                console.log(`   ⚠️  block.json not found for ${blockName}, skipping`);
                return false;
            }
            
            try {
                const blockJson = JSON.parse(fs.readFileSync(blockJsonPath, 'utf8'));
                // Only include if category is "adaire-blocks-free"
                const isFree = blockJson.category === 'adaire-blocks-free';
                if (!isFree) {
                    console.log(`   ⚠️  ${blockName} is not a free block (category: ${blockJson.category}), excluding from free version`);
                }
                return isFree;
            } catch (error) {
                console.log(`   ⚠️  Error reading block.json for ${blockName}: ${error.message}`);
                return false;
            }
        });
        
        return freeBlocks;
    }

    /**
     * Build the free version
     */
    async buildFreeVersion() {
        console.log('🔨 Building free version...');
        
        // Store original working directory
        const originalDir = process.cwd();
        
        try {
            // Verify src/index.js exists before modifying
            const indexPath = path.join(this.freeVersionDir, 'src', 'index.js');
            if (!fs.existsSync(indexPath)) {
                throw new Error(`src/index.js does not exist at ${indexPath}. Blocks may not have been copied correctly.`);
            }
            
            // Modify src/index.js to only include enabled blocks
            this.modifyIndexJs();
            
            // Run npm install
            process.chdir(this.freeVersionDir);
            console.log(`   📍 Changed to directory: ${this.freeVersionDir}`);
            
            console.log('   📦 Installing dependencies...');
            execSync('npm install', { stdio: 'inherit' });
            
            // IMPORTANT: Run prebuild to update block.json icons before building
            console.log('🎨 Running prebuild to update block icons...');
            try {
                execSync('npm run prebuild', { stdio: 'inherit' });
                console.log('   ✓ Prebuild completed successfully');
            } catch (prebuildError) {
                console.log('   ⚠️  Prebuild failed, but continuing with build...');
                console.log('   Error:', prebuildError.message);
            }
            
            // Run build script
            console.log('   🔨 Running build...');
            try {
                execSync('npm run build', { 
                    stdio: 'inherit',
                    cwd: this.freeVersionDir
                });
            } catch (buildError) {
                // Check build directory status
                const buildDir = path.join(this.freeVersionDir, 'build');
                const srcDir = path.join(this.freeVersionDir, 'src');
                
                console.error('\n   ❌ Build command failed. Checking directories...');
                
                // Check if src directory exists and has blocks
                if (fs.existsSync(srcDir)) {
                    const srcContents = fs.readdirSync(srcDir).filter(item => {
                        const itemPath = path.join(srcDir, item);
                        return fs.statSync(itemPath).isDirectory() && item.endsWith('-block');
                    });
                    console.error(`   📦 Found ${srcContents.length} blocks in src/`);
                    if (srcContents.length > 0) {
                        console.error(`   Blocks: ${srcContents.join(', ')}`);
                    }
                } else {
                    console.error('   ⚠️  src/ directory does not exist!');
                }
                
                // Check if build directory exists
                if (fs.existsSync(buildDir)) {
                    const buildContents = fs.readdirSync(buildDir);
                    console.error(`   📁 Build directory exists with ${buildContents.length} items`);
                    if (buildContents.length > 0) {
                        console.error(`   Contents: ${buildContents.slice(0, 10).join(', ')}${buildContents.length > 10 ? '...' : ''}`);
                    }
                } else {
                    console.error('   ⚠️  Build directory was not created');
                }
                
                // Check package.json
                const packageJsonPath = path.join(this.freeVersionDir, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                    console.error(`   📝 package.json exists with build script: ${packageJson.scripts?.build || 'NOT FOUND'}`);
                }
                
                // Re-throw with more context
                throw new Error(`Build failed: ${buildError.message}`);
            }
            
            // Verify build output
            const buildDir = path.join(this.freeVersionDir, 'build');
            if (!fs.existsSync(buildDir)) {
                throw new Error('Build directory was not created');
            }
            
            const buildContents = fs.readdirSync(buildDir);
            if (buildContents.length === 0) {
                throw new Error('Build directory is empty - build may have failed');
            }
            
            console.log(`   ✓ Build completed successfully (${buildContents.length} items in build folder)`);
            
        } catch (error) {
            // Restore original directory before throwing
            process.chdir(originalDir);
            console.error('\n❌ Build process failed!');
            console.error('Error:', error.message);
            if (error.stdout) {
                console.error('stdout:', error.stdout.toString());
            }
            if (error.stderr) {
                console.error('stderr:', error.stderr.toString());
            }
            throw error; // Re-throw to stop the generation process
        } finally {
            // Always restore original directory
            process.chdir(originalDir);
        }
    }
    
    /**
     * Modify src/index.js to only include enabled blocks
     */
    modifyIndexJs() {
        console.log('📝 Modifying src/index.js for free version...');
        
        const indexPath = path.join(this.freeVersionDir, 'src', 'index.js');
        
        if (!fs.existsSync(indexPath)) {
            return;
        }
        
        const enabledBlocks = this.getEnabledBlocks();
        
        // Create new index.js content with only enabled blocks
        let indexContent = `// GutenBlocks Free Version
// This file is automatically generated - do not edit manually

`;
        
        // Add imports for enabled blocks only
        enabledBlocks.forEach(blockName => {
            indexContent += `import './${blockName}';\n`;
        });
        
        fs.writeFileSync(indexPath, indexContent);
        console.log(`   ✓ Updated index.js with ${enabledBlocks.length} enabled blocks`);
    }

    /**
     * Generate clean readme.txt for free version
     */
    async generateReadme() {
        console.log('📋 Generating clean readme.txt...');
        
        // Get version from main plugin file
        const pluginFile = path.join(this.sourceDir, 'adaire-blocks.php');
        const pluginContent = fs.readFileSync(pluginFile, 'utf8');
        const versionMatch = pluginContent.match(/Version:\s*([^\n]*)/);
        const currentVersion = versionMatch ? versionMatch[1].trim() : '1.0.0';
        
        const enabledBlocks = this.getEnabledBlocks();
        
        // Read block titles and descriptions from block.json files
        const enabledBlockList = enabledBlocks.map(blockName => {
            const blockJsonPath = path.join(this.sourceDir, 'src', blockName, 'block.json');
            
            let title = blockName.replace('-block', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            let description = 'Custom block for enhanced functionality';
            
            if (fs.existsSync(blockJsonPath)) {
                try {
                    const blockJson = JSON.parse(fs.readFileSync(blockJsonPath, 'utf8'));
                    title = blockJson.title || title;
                    description = blockJson.description || description;
                } catch (error) {
                    console.log(`   ⚠️  Could not read block.json for ${blockName}: ${error.message}`);
                }
            }
            
            return `* **${title}** - ${description}`;
        }).join('\n');
        
        const readmeContent = `=== GutenBlocks ===
Contributors: adairedigital
Donate link: https://adaire.digital/
Source code: https://github.com/helloadaire/Adaire-Blocks-Free
Tags: blocks, gutenberg, gsap, animation
Requires at least: 6.7
Tested up to: 6.8
Stable tag: ${currentVersion}
Requires PHP: 7.4
License: GPL-3.0
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Professional WordPress blocks for Gutenberg editor with GSAP animations and modern design.

== Description ==

GutenBlocks is a WordPress plugin that provides custom Gutenberg blocks to create visually appealing websites. Built with modern web technologies including GSAP, React, and optimized for performance.

**Available Blocks:**

${enabledBlockList}

**Features:**

* Built with modern JavaScript (ES6+), React, and GSAP
* Optimized for performance with efficient block registration
* Compatible with WordPress 6.7+ and PHP 7.4+
* Responsive design with mobile-first approach
* GSAP-powered animations with scroll triggers
* Smooth transitions and micro-interactions
* GPL-3.0 licensed for maximum flexibility

== Installation ==

1. Upload the plugin files to the \`/wp-content/plugins/adaire-blocks\` directory
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Start using the custom blocks in the Gutenberg editor

== Frequently Asked Questions ==

= What WordPress version is required? =

This plugin requires WordPress 6.7 or higher and PHP 7.4 or higher.

= Are the blocks compatible with all themes? =

The blocks are designed to work with most modern WordPress themes and can be customized through the block editor settings.

= Can I customize the animations and styles? =

Yes, all blocks include extensive customization options in the block editor, including colors, fonts, animation speeds, and layout settings.

= Do the blocks work on mobile devices? =

Yes, all blocks are fully responsive and optimized for mobile devices.

== Changelog ==

= ${currentVersion} =
* Initial release with core blocks
* GSAP-powered animations
* Responsive design
* Block editor integration

== Support ==

For support, please visit our website at https://adaire.digital/ or contact us through the WordPress.org support forums.
`;
        
        fs.writeFileSync(path.join(this.freeVersionDir, 'readme.txt'), readmeContent);
        console.log('   ✓ Clean readme.txt generated');
    }
}

// Run the generator
if (require.main === module) {
    const generator = new FreeVersionGenerator();
    generator.generate();
}

module.exports = FreeVersionGenerator;