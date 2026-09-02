<?php
/**
 * Plugin Name: Adaire Blocks
 * Plugin URI: https://adaire.digital/adaire-blocks/
 * Description: A library of custom Gutenberg blocks for building responsive, animated WordPress pages.
 * Version: 1.2.8
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
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
define( 'ADAIRE_BLOCKS_VERSION', '1.2.8' );
define( 'ADAIRE_BLOCKS_PLUGIN_FILE', __FILE__ );
define( 'ADAIRE_BLOCKS_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'ADAIRE_BLOCKS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'ADAIRE_BLOCKS_IS_FREE', true );

// Include the main plugin class
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-blocks-config.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/sendgrid.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-patterns.php';

// Make the free Cookie Notice block render on every front-end page, not just
// the one page/post it's inserted into.
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/cookie-notice-global.php';

// Initialize the plugin
function adaire_blocks_init() {
	// Get settings instance
	$settings = AdaireBlocksConfig::get_instance();

	// Register blocks
	adaire_blocks_register_blocks();

	// Register starter page patterns (landing/about/services/blog/contact)
	Adaire_Patterns::init();
}
add_action( 'init', 'adaire_blocks_init' );

/**
 * Register all blocks
 */
function adaire_blocks_register_blocks() {
	$blocks_dir = ADAIRE_BLOCKS_PLUGIN_PATH . 'build/';

	if ( ! is_dir( $blocks_dir ) ) {
					return;
	}

	$block_dirs = glob( $blocks_dir . '*', GLOB_ONLYDIR );

	foreach ( $block_dirs as $block_dir ) {
		$block_name = basename( $block_dir );
		$block_json = $block_dir . '/block.json';

		if ( file_exists( $block_json ) ) {
			register_block_type( $block_dir );

			// Backward-compatible alias: this block was renamed from
			// header-block to header-menu-block so its slug matches its
			// display name. It's a dynamic block (render.php), so existing
			// published headers still have
			// `<!-- wp:create-block/header-block -->` baked into
			// post_content — registering that old name too, pointed at the
			// same build/header-menu-block/render.php, keeps them
			// rendering. inserter is disabled here so this old name never
			// shows up as a second "Header Menu (Free)" card in the
			// inserter.
			if ( $block_name === 'header-menu-block' ) {
				register_block_type( $block_dir, array(
					'name'     => 'create-block/header-block',
					'supports' => array(
						'html'            => false,
						'anchor'          => true,
						'customClassName' => true,
						'inserter'        => false,
					),
				) );
			}

			// Backward-compatible alias: this block was renamed from
			// map-block to location-map. It's a static block (markup is
			// baked into post_content at save time, no render.php), so
			// existing published pages still have
			// `<!-- wp:create-block/map-block -->` in their content.
			// Without this alias WordPress no longer recognizes that name,
			// so it never enqueues build/location-map's style-index.css or
			// view.js on those pages — the saved HTML still prints, just
			// with no styling and no interactivity. save.js is unchanged
			// by the rename, so this alias alone fully restores it.
			if ( $block_name === 'location-map' ) {
				register_block_type( $block_dir, array(
					'name'     => 'create-block/map-block',
					'supports' => array(
						'html'            => false,
						'anchor'          => true,
						'align'           => array( 'wide', 'full' ),
						'customClassName' => true,
						'inserter'        => false,
					),
				) );
			}
		}
	}
}

/**
 * Register plugin-owned navigation menu locations so site owners can assign
 * WordPress menus to them from Appearance > Menus. These power the Header
 * block's "Primary Menu" / "Footer Menu" Navigation Source options (see
 * build/header-menu-block/render.php). Purely additive — does not affect
 * existing block registration or any other plugin behaviour.
 */
function adaire_blocks_register_nav_menu_locations() {
	register_nav_menus(
		array(
			'adaire-blocks-primary' => __( 'Adaire Blocks — Primary Navigation', 'adaire-blocks' ),
			'adaire-blocks-footer'  => __( 'Adaire Blocks — Footer Navigation', 'adaire-blocks' ),
		)
	);
}
add_action( 'init', 'adaire_blocks_register_nav_menu_locations' );


function adaire_blocks_register_block_categories( $categories, $editor_context ) {
	$registered_slugs = wp_list_pluck( $categories, 'slug' );

	$custom_categories = array(
		array(
			'slug'  => 'adaire-blocks-free',
			'title' => __( 'Adaire Blocks FREE', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-blocks-alignment-layout-structure',
			'title' => __( 'Alignment, Layout & Structure (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-hero-sections',
			'title' => __( 'Hero & Navigation (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-layout-sections',
			'title' => __( 'Layout Sections (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-marketing',
			'title' => __( 'Marketing (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-media',
			'title' => __( 'Media (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-business',
			'title' => __( 'Business (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-testimonial',
			'title' => __( 'Testimonials (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-social',
			'title' => __( 'Social (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-blog-publishing',
			'title' => __( 'Blog & Publishing (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-start-actions',
			'title' => __( 'Start & Actions (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-information-blocks',
			'title' => __( 'Information Blocks (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-effects-interactions',
			'title' => __( 'Effects & Interactions (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-interactive',
			'title' => __( 'Interactive (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-layout-navigation',
			'title' => __( 'Layout & Navigation (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-blog-content',
			'title' => __( 'Blog & Content (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-content-expandable',
			'title' => __( 'Expandable Content (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-content-info',
			'title' => __( 'Content & Info (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-content-tabs',
			'title' => __( 'Tabs & Content (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-layout-hero',
			'title' => __( 'Layout & Hero (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-marketing-conversion',
			'title' => __( 'Marketing & Conversion (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-media-images',
			'title' => __( 'Media & Images (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-media-videos',
			'title' => __( 'Media & Videos (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-reviews-trust',
			'title' => __( 'Reviews & Trust (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
		array(
			'slug'  => 'adaire-social-engagement',
			'title' => __( 'Social & Engagement (Adaire Blocks)', 'adaire-blocks' ),
			'icon'  => null,
		),
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
// NOTE: the legacy `block_categories` filter is deliberately NOT hooked. It was
// deprecated in WP 5.8 and core fires it through apply_filters_deprecated(), which
// emits a PHP deprecation notice for every callback attached to it. This plugin
// requires WP 6.7+, so `block_categories_all` above covers every supported version.

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
		has_block( 'create-block/feature-grid-free', $post ) ||
		has_block( 'create-block/rating-badge-block', $post )
	) {
		wp_enqueue_style(
			'bootstrap-icons',
			ADAIRE_BLOCKS_PLUGIN_URL . 'assets/vendor/bootstrap-icons/bootstrap-icons.min.css',
			array(),
			'1.13.1'
		);
	}
}
add_action( 'wp_enqueue_scripts', 'enqueue_bootstrap_icons_assets' );

// Enqueue Bootstrap Icons inside the block editor canvas (iframed in WP 6.3+).
// A plain wp_enqueue_style() on enqueue_block_editor_assets is NOT enough on
// its own: WordPress only carries a stylesheet enqueued that way into the
// iframe if it contains at least one of .editor-styles-wrapper, .wp-block,
// or .wp-block-* — generic third-party CSS like this icon font doesn't, so
// it silently never reached the canvas (or the icon picker modal, which
// shares the same stylesheet). add_editor_style() is the mechanism
// WordPress documents specifically for this — it isn't subject to that
// selector restriction and is designed to reach every editor context
// (post editor iframe, site editor, widget editor, and the outer admin
// page where Modals/Popovers render).
function enqueue_bootstrap_icons_editor() {
	$bootstrap_icons_url = ADAIRE_BLOCKS_PLUGIN_URL . 'assets/vendor/bootstrap-icons/bootstrap-icons.min.css';

	wp_enqueue_style(
		'bootstrap-icons',
		$bootstrap_icons_url,
		array(),
		'1.13.1'
	);

	add_editor_style( $bootstrap_icons_url );
}
add_action( 'enqueue_block_editor_assets', 'enqueue_bootstrap_icons_editor' );

// add_editor_style() above is a documented no-op unless
// add_theme_support( 'editor-styles' ) has been declared — by the active
// theme, or, as here, by this plugin. This declaration didn't exist
// anywhere in the codebase, so the add_editor_style() call two lines up,
// despite being correct, has had zero effect. Declaring it here rather than
// relying on the active theme means the icon font reaches the editor
// regardless of which theme the site is running.
add_action( 'after_setup_theme', function () {
	add_theme_support( 'editor-styles' );
} );

// Belt-and-suspenders #2: force an @font-face declaration with an ABSOLUTE
// font URL directly into the block-editor iframe's own styles array.
// bootstrap-icons.min.css declares its @font-face with a relative path
// (url("fonts/bootstrap-icons.woff2?...")); the iframe often pulls in
// editor-style CSS by inlining a file's contents into its own <style> tag
// without rebasing relative url() references, which silently breaks that
// path regardless of the add_editor_style() call above. Building the font
// URL from ADAIRE_BLOCKS_PLUGIN_URL here means it's already absolute before
// it reaches the iframe, so there's no relative path left to mishandle.
add_filter( 'block_editor_settings_all', function ( $settings ) {
	$font_base = ADAIRE_BLOCKS_PLUGIN_URL . 'assets/vendor/bootstrap-icons/fonts/';
	$css       = "@font-face{font-family:bootstrap-icons;font-display:block;src:url('{$font_base}bootstrap-icons.woff2') format('woff2'),url('{$font_base}bootstrap-icons.woff') format('woff')}";

	if ( ! isset( $settings['styles'] ) || ! is_array( $settings['styles'] ) ) {
		$settings['styles'] = array();
	}
	$settings['styles'][] = array( 'css' => $css );

	return $settings;
} );

/**
 * Expose the free-tier block configuration to editor JavaScript.
 *
 * Blocks read window.adaireBlocksConfig (and the matching editor setting via
 * useBlockLimits) to enforce free-tier limits — e.g. tabs-block locks its
 * animation controls when limits.customAnimations is false, gallery-block
 * caps images via limits.maxItems. Without this the free build silently
 * behaves as if unrestricted. Shape mirrors the dev/pro plugin:
 * { isPremium, pluginVersion, blocks: { name: { enabled, limits, upgradeMessage } } }.
 */
function adaire_blocks_localize_editor_config() {
	$blocks_config = array();
	$config_file   = ADAIRE_BLOCKS_PLUGIN_PATH . 'config/blocks-config.json';

	if ( file_exists( $config_file ) ) {
		$config_data = json_decode( file_get_contents( $config_file ), true );
		$free_blocks = isset( $config_data['free'] ) && is_array( $config_data['free'] )
			? $config_data['free']
			: array();

		foreach ( $free_blocks as $block_name => $block_config ) {
			$blocks_config[ $block_name ] = array(
				'enabled'        => ! empty( $block_config['enabled'] ),
				'limits'         => isset( $block_config['limits'] ) ? $block_config['limits'] : array(),
				'upgradeMessage' => isset( $block_config['upgradeMessage'] ) ? $block_config['upgradeMessage'] : '',
			);
		}
	}

	$editor_config = array(
		'isPremium'     => false,
		'pluginVersion' => 'free',
		'blocks'        => $blocks_config,
	);

	wp_localize_script( 'wp-block-editor', 'adaireBlocksConfig', $editor_config );

	// Also add to editor settings for the useBlockLimits hook
	add_filter(
		'block_editor_settings_all',
		function ( $settings ) use ( $editor_config ) {
			$settings['adaireBlocksConfig'] = $editor_config;
			return $settings;
		}
	);
}
add_action( 'enqueue_block_editor_assets', 'adaire_blocks_localize_editor_config' );

// Bootstrap admin settings (register menu, assets, etc.)
if ( is_admin() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
	require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/settings-page.php';
	if ( class_exists( 'AdaireBlocksSettings' ) ) {
		AdaireBlocksSettings::get_instance();
	}
}

if ( is_admin() ) {
	// Include block migration tool
	require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/block-migration.php';

	// Support page
	require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/support-page.php';

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
	add_option( 'adaire_blocks_version', ADAIRE_BLOCKS_VERSION );

	// Send the user to the Welcome / Quick Start screen on their next
	// admin page load (see Adaire_Welcome_Screen::maybe_redirect_after_activation()).
	if ( class_exists( 'Adaire_Welcome_Screen' ) ) {
		Adaire_Welcome_Screen::queue_activation_redirect();
	}
}
register_activation_hook( __FILE__, 'adaire_blocks_activate' );

/**
 * Plugin deactivation hook
 */
function adaire_blocks_deactivate() {
	// Clean up if needed
}
register_deactivation_hook( __FILE__, 'adaire_blocks_deactivate' );
