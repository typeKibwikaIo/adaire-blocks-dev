<?php
/**
 * Plugin Name: Adaire Blocks
 * Plugin URI: https://adaire.digital/adaire-blocks/
 * Description: Professional WordPress blocks for Gutenberg editor with GSAP animations and modern design.
 * Version: 1.2.6
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
define('ADAIRE_BLOCKS_VERSION', '1.2.6');
define('ADAIRE_BLOCKS_PLUGIN_FILE', __FILE__);
define('ADAIRE_BLOCKS_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('ADAIRE_BLOCKS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ADAIRE_BLOCKS_IS_FREE', true);

// Include the main plugin class
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-blocks-config.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/sendgrid.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-patterns.php';

// Initialize the plugin
function adaire_blocks_init() {
    // Get settings instance
    $settings = AdaireBlocksConfig::get_instance();

    // Register blocks
    adaire_blocks_register_blocks();

    // Register starter page patterns (landing/about/services/blog/contact)
    Adaire_Patterns::init();
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
 * Register plugin-owned navigation menu locations so site owners can assign
 * WordPress menus to them from Appearance > Menus. These power the Header
 * block's "Primary Menu" / "Footer Menu" Navigation Source options (see
 * build/header-block/render.php). Purely additive — does not affect
 * existing block registration or any other plugin behaviour.
 */
function adaire_blocks_register_nav_menu_locations() {
    register_nav_menus( array(
        'adaire-blocks-primary' => __( 'Adaire Blocks — Primary Navigation', 'adaire-blocks' ),
        'adaire-blocks-footer'  => __( 'Adaire Blocks — Footer Navigation', 'adaire-blocks' ),
    ) );
}
add_action('init', 'adaire_blocks_register_nav_menu_locations');


function adaire_blocks_register_block_categories( $categories, $editor_context ) {
    $registered_slugs = wp_list_pluck( $categories, 'slug' );

    $custom_categories = array(
        array( 'slug' => 'adaire-blocks-free', 'title' => __( 'Adaire Blocks FREE', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-blocks-alignment-layout-structure', 'title' => __( 'Alignment, Layout & Structure (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-hero-sections', 'title' => __( 'Hero & Navigation (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-layout-sections', 'title' => __( 'Layout Sections (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-marketing', 'title' => __( 'Marketing (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-media', 'title' => __( 'Media (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-business', 'title' => __( 'Business (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-testimonial', 'title' => __( 'Testimonials (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-social', 'title' => __( 'Social (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-blog-publishing', 'title' => __( 'Blog & Publishing (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-start-actions', 'title' => __( 'Start & Actions (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-information-blocks', 'title' => __( 'Information Blocks (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-effects-interactions', 'title' => __( 'Effects & Interactions (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-interactive', 'title' => __( 'Interactive (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-layout-navigation', 'title' => __( 'Layout & Navigation (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-blog-content', 'title' => __( 'Blog & Content (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-content-expandable', 'title' => __( 'Expandable Content (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-content-info', 'title' => __( 'Content & Info (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-content-tabs', 'title' => __( 'Tabs & Content (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-layout-hero', 'title' => __( 'Layout & Hero (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-marketing-conversion', 'title' => __( 'Marketing & Conversion (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-media-images', 'title' => __( 'Media & Images (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-media-videos', 'title' => __( 'Media & Videos (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-reviews-trust', 'title' => __( 'Reviews & Trust (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
        array( 'slug' => 'adaire-social-engagement', 'title' => __( 'Social & Engagement (Adaire Blocks)', 'adaire-blocks' ), 'icon' => null ),
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
        has_block( 'create-block/our-process-block', $post ) ||
        has_block( 'create-block/infogrid-2-block', $post )
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

// Enqueue Bootstrap Icons inside the block editor canvas (iframed in WP 6.3+).
// enqueue_block_editor_assets injects into the editor iframe; admin_enqueue_scripts
// only reaches the outer admin shell and is invisible inside the canvas.
function enqueue_bootstrap_icons_editor() {
    wp_enqueue_style(
        'bootstrap-icons',
        'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css',
        array(),
        '1.13.1'
    );
}
add_action( 'enqueue_block_editor_assets', 'enqueue_bootstrap_icons_editor' );
add_action( 'admin_enqueue_scripts', 'enqueue_bootstrap_icons_editor' );

// Bootstrap admin settings (register menu, assets, etc.)
if (is_admin() || wp_doing_ajax() || (defined('REST_REQUEST') && REST_REQUEST)) {
    require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/settings-page.php';
    if (class_exists('AdaireBlocksSettings')) {
        AdaireBlocksSettings::get_instance();
    }
}

if (is_admin()) {
    // Include block migration tool
    require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/block-migration.php';

    // Deactivation feedback modal
    require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/deactivation-modal.php';
    Adaire_Deactivation_Modal::get_instance();

    // Deactivation feedback log + SendGrid test page
    require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/deactivation-log-page.php';
    Adaire_Deactivation_Log_Page::get_instance();

    // Welcome / Quick Start screen with starter page templates
    require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/welcome-screen.php';
    Adaire_Welcome_Screen::register();
}

/**
 * Plugin activation hook
 */
function adaire_blocks_activate() {
    // Set default options
    add_option('adaire_blocks_version', ADAIRE_BLOCKS_VERSION);

    // Send the user to the Welcome / Quick Start screen on their next
    // admin page load (see Adaire_Welcome_Screen::maybe_redirect_after_activation()).
    if (class_exists('Adaire_Welcome_Screen')) {
        Adaire_Welcome_Screen::queue_activation_redirect();
    }
}
register_activation_hook(__FILE__, 'adaire_blocks_activate');

/**
 * Plugin deactivation hook
 */
function adaire_blocks_deactivate() {
    // Clean up if needed
}
register_deactivation_hook(__FILE__, 'adaire_blocks_deactivate');
