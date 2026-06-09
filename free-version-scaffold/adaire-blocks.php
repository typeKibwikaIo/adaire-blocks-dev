<?php
/**
 * Plugin Name: Adaire Blocks
 * Plugin URI: https://adaire.digital/adaire-blocks/
 * Description: Professional WordPress blocks for Gutenberg editor with GSAP animations and modern design.
 * Version: 1.2.4
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
define('ADAIRE_BLOCKS_VERSION', '1.2.2');
define('ADAIRE_BLOCKS_PLUGIN_FILE', __FILE__);
define('ADAIRE_BLOCKS_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('ADAIRE_BLOCKS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ADAIRE_BLOCKS_IS_FREE', true);

// Include the main plugin class
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-blocks-config.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/sendgrid.php';

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
            register_block_type($block_dir);
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

function adaire_blocks_register_block_categories( $categories, $editor_context ) {
    $registered_slugs = wp_list_pluck( $categories, 'slug' );

    $custom_categories = array(
        array( 'slug' => 'adaire-blocks-free', 'title' => __( 'Gutenblocks FREE', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'gutenblocks-alignment-layout-structure', 'title' => __( 'Alignment, Layout & Structure (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-hero-sections', 'title' => __( 'Hero & Navigation (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-layout-sections', 'title' => __( 'Layout Sections (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-marketing', 'title' => __( 'Marketing (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-media', 'title' => __( 'Media (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-business', 'title' => __( 'Business (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-testimonial', 'title' => __( 'Testimonials (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-social', 'title' => __( 'Social (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-blog-publishing', 'title' => __( 'Blog & Publishing (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-start-actions', 'title' => __( 'Start & Actions (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-information-blocks', 'title' => __( 'Information Blocks (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-effects-interactions', 'title' => __( 'Effects & Interactions (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-interactive', 'title' => __( 'Interactive (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-layout-navigation', 'title' => __( 'Layout & Navigation (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-blog-content', 'title' => __( 'Blog & Content (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-content-expandable', 'title' => __( 'Expandable Content (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-content-info', 'title' => __( 'Content & Info (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-content-tabs', 'title' => __( 'Tabs & Content (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-layout-hero', 'title' => __( 'Layout & Hero (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-marketing-conversion', 'title' => __( 'Marketing & Conversion (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-media-images', 'title' => __( 'Media & Images (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-media-videos', 'title' => __( 'Media & Videos (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-reviews-trust', 'title' => __( 'Reviews & Trust (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-social-engagement', 'title' => __( 'Social & Engagement (Gutenblocks)', 'adaire-blocks' ), 'icon' => null ),
    );

    $custom_categories_to_add = array();

    foreach ( $custom_categories as $custom_category ) {
        if ( ! in_array( $custom_category['slug'], $registered_slugs, true ) ) {
            $custom_categories_to_add[] = $custom_category;
        }
    }

    return array_merge( $custom_categories_to_add, $categories );
}
add_filter( 'block_categories_all', 'adaire_blocks_register_block_categories', 10, 2 );
add_filter( 'block_categories', 'adaire_blocks_register_block_categories', 10, 2 );

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

    // Deactivation feedback modal
    require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/deactivation-modal.php';
    Adaire_Deactivation_Modal::get_instance();

    // Deactivation feedback log + SendGrid test page
    require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/deactivation-log-page.php';
    Adaire_Deactivation_Log_Page::get_instance();
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
