<?php
/**
 * Plugin Name:       Adaire Blocks
 * Description:       A powerful WordPress plugin that helps developers and designers create visually stunning, high-performance websites with ease right inside the Gutenberg editor.
 * Version:           1.3.0
 * Requires at least: 6.7
 * Requires PHP:      7.0
 * Author:            <a href="https://adaireblocks.com" target="_blank">Adaire Digital</a>
 * License:           GPL-3.0
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       adaire-blocks
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( ! function_exists( 'adaire_blocks_hex_to_rgba' ) ) {
	/**
	 * Convert hex color values to rgba string.
	 *
	 * @param string $color Hex color string.
	 * @param float  $alpha Alpha channel between 0 and 1.
	 *
	 * @return string
	 */
	function adaire_blocks_hex_to_rgba( $color, $alpha = 1 ) {
		$color = trim( (string) $color );
		if ( '' === $color ) {
			$color = '#000000';
		}

		$alpha = max( 0, min( 1, floatval( $alpha ) ) );
		$color = ltrim( $color, '#' );

		if ( 3 === strlen( $color ) ) {
			$color = preg_replace( '/(.)/', '$1$1', $color );
		}

		if ( 6 !== strlen( $color ) ) {
			return sprintf( 'rgba(0, 0, 0, %.3f)', $alpha );
		}

		$r = hexdec( substr( $color, 0, 2 ) );
		$g = hexdec( substr( $color, 2, 2 ) );
		$b = hexdec( substr( $color, 4, 2 ) );

		return sprintf( 'rgba(%d, %d, %d, %.3f)', $r, $g, $b, $alpha );
	}
}

// =========================
// Plugin Update Checker
// =========================
require_once __DIR__ . '/plugin-update-checker/plugin-update-checker.php';
use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$myUpdateChecker = PucFactory::buildUpdateChecker(
    'https://raw.githubusercontent.com/helloadaire/Adaire-Blocks-Update-JSON/main/update-info.json',
    __FILE__,
    'adaire-blocks'
);



// =========================
// Version Rollback
// =========================

// Clear version cache when plugin is updated
add_action('upgrader_process_complete', function($upgrader, $hook_extra) {
    if (isset($hook_extra['plugin']) && $hook_extra['plugin'] === plugin_basename(__FILE__)) {
        delete_transient('adaire-blocks_latest_version');
        error_log('[Adaire Blocks Rollback] Plugin updated - cleared version cache');
    }
}, 10, 2);

// Also clear cache when plugin is activated (in case version changed)
add_action('activated_plugin', function($plugin) {
    if ($plugin === plugin_basename(__FILE__)) {
        delete_transient('adaire-blocks_latest_version');
        error_log('[Adaire Blocks Rollback] Plugin activated - cleared version cache');
    }
});

// Add rollback link in plugin row (only if current version is the latest)
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
    // Get current version dynamically from plugin header
    $plugin_data = get_plugin_data(__FILE__);
    $current_version = $plugin_data['Version'];
    $is_latest_version = true;
    
    // Log the current version
    error_log('[Adaire Blocks Rollback] Current version: ' . $current_version);
    
    // Check if there's a newer version available by directly checking the JSON file
    // Cache the result for 1 hour to avoid checking too frequently
    $cache_key = 'adaire-blocks_latest_version';
    $cached_version = get_transient($cache_key);
    
    // Force refresh cache if we're on a newer version than what's cached
    if ($cached_version !== false && $cached_version !== 'error') {
        if (version_compare($current_version, $cached_version, '>')) {
            error_log('[Adaire Blocks Rollback] Current version is newer than cached version - clearing cache');
            delete_transient($cache_key);
            $cached_version = false;
        }
    }
    
    if ($cached_version === false) {
        // Cache expired or doesn't exist, fetch from JSON
        $json_url = 'https://raw.githubusercontent.com/helloadaire/Adaire-Blocks-Update-JSON/main/update-info.json';
        $response = wp_remote_get($json_url, array('timeout' => 5));
        
        if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
            $json_data = json_decode(wp_remote_retrieve_body($response), true);
            if ($json_data && isset($json_data['version'])) {
                $latest_version = $json_data['version'];
                error_log('[Adaire Blocks Rollback] Latest available version from JSON: ' . $latest_version);
                
                // Cache the result for 1 hour
                set_transient($cache_key, $latest_version, HOUR_IN_SECONDS);
                
                if (version_compare($current_version, $latest_version, '<')) {
                    $is_latest_version = false;
                    error_log('[Adaire Blocks Rollback] Hiding rollback link - newer version available: ' . $latest_version);
                }
            } else {
                error_log('[Adaire Blocks Rollback] Invalid JSON data received');
                set_transient($cache_key, 'error', HOUR_IN_SECONDS);
            }
        } else {
            error_log('[Adaire Blocks Rollback] Failed to fetch JSON: ' . (is_wp_error($response) ? $response->get_error_message() : 'HTTP ' . wp_remote_retrieve_response_code($response)));
            set_transient($cache_key, 'error', HOUR_IN_SECONDS);
        }
    } else {
        // Use cached version
        if ($cached_version !== 'error') {
            error_log('[Adaire Blocks Rollback] Using cached latest version: ' . $cached_version);
            if (version_compare($current_version, $cached_version, '<')) {
                $is_latest_version = false;
                error_log('[Adaire Blocks Rollback] Hiding rollback link - newer version available: ' . $cached_version);
            }
        } else {
            error_log('[Adaire Blocks Rollback] Using cached error state - showing rollback link');
        }
    }
    
    // Only show rollback link if current version is the latest
    if ($is_latest_version) {
        error_log('[Adaire Blocks Rollback] Showing rollback link - current version is latest');
        $links[] = '<a href="' . esc_url(admin_url('admin-post.php?action=my_plugin_rollback&_wpnonce=' . wp_create_nonce('my_plugin_rollback'))) . '" class="my-plugin-rollback-btn">Rollback</a>';
    }
    
    return $links;
});

// Handle rollback request
add_action('admin_post_my_plugin_rollback', function () {
    if (!current_user_can('update_plugins')) {
        wp_die('Unauthorized');
    }

		if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'my_plugin_rollback' ) ) {
			error_log( '[Adaire Blocks Rollback] Nonce verification failed' );
			wp_die( 'Security check failed.' );
		}

    // URL to the previous version ZIP
    $previous_version_zip = 'https://github.com/helloadaire/Adaire-Blocks/releases/download/v1.2.4.alpha/adaire-blocks.1.2.4.alpha.zip';
    error_log('[Adaire Blocks Rollback] Attempting rollback to: ' . $previous_version_zip);

    require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/misc.php';

    $plugin_slug = plugin_basename(__FILE__);

    // Deactivate current plugin
    deactivate_plugins($plugin_slug);
    error_log('[Adaire Blocks Rollback] Plugin deactivated.');

    // Delete current plugin folder
    $plugin_dir = plugin_dir_path(__FILE__);
    if (WP_Filesystem()) {
        global $wp_filesystem;
        if ($wp_filesystem->delete($plugin_dir, true, true)) {
            error_log('[Adaire Blocks Rollback] Plugin folder deleted successfully.');
        } else {
            error_log('[Adaire Blocks Rollback] Failed to delete plugin folder.');
            wp_die('Failed to delete current plugin folder. Check debug.log.');
        }
    }

    // Install previous version using Automatic_Upgrader_Skin (shows standard WP install page)
    $upgrader = new Plugin_Upgrader(new Automatic_Upgrader_Skin());
    $result = $upgrader->install($previous_version_zip);

    if ($result && !is_wp_error($result)) {
        activate_plugin($plugin_slug);
        error_log('[Adaire Blocks Rollback] Rollback successful and plugin activated.');
        wp_safe_redirect(admin_url('plugins.php?rollback=success'));
    } else {
        error_log('[Adaire Blocks Rollback] Rollback failed: ' . print_r($result, true));
        wp_safe_redirect(admin_url('plugins.php?rollback=failed'));
    }

    exit;
});

// Show admin notice
add_action(
	'admin_notices',
	function () {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Read-only status flag for a UI notice; the actual rollback action is nonce-verified above.
		if ( ! isset( $_GET['rollback'] ) ) {
			return;
		}

		$rollback_status = sanitize_text_field( wp_unslash( $_GET['rollback'] ) );
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		if ( 'success' === $rollback_status ) {
			echo '<div class="notice notice-success is-dismissible"><p>Plugin rolled back successfully and activated.</p></div>';
		} elseif ( 'failed' === $rollback_status ) {
			echo '<div class="notice notice-error is-dismissible"><p>Rollback failed. Check debug.log for details.</p></div>';
		}
	}
);




// End of version rollback code

// Define plugin constants
define('ADAIRE_BLOCKS_VERSION', '1.3.0');
define('ADAIRE_BLOCKS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ADAIRE_BLOCKS_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('ADAIRE_BLOCKS_PLUGIN_FILE', __FILE__);

// Define premium version flag (free version will override this)
if (!defined('ADAIRE_BLOCKS_IS_FREE')) {
    define('ADAIRE_BLOCKS_IS_FREE', false);
}

// Include configuration manager
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-blocks-config.php';

// Include validation server configuration
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-blocks-validation-config.php';

// Include license manager
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-blocks-license.php';

// Include settings page
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/settings-page.php';

// Include license page
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/license-page.php';

/**
 * Check if premium features are available
 */
function adaire_blocks_is_premium_available() {
	$license_manager = AdaireBlocksLicense::get_instance();
	return $license_manager->is_license_active();
}

/**
 * Show license activation notice
 */
function adaire_blocks_license_notice() {
	$license_manager = AdaireBlocksLicense::get_instance();
	$license_status = $license_manager->get_license_status();
	
	// Only show notice if we're on admin pages and license is not active
	if (!is_admin() || $license_status['status'] === 'active') {
		return;
	}
	
	$license_page_url = admin_url('admin.php?page=adaire-blocks-license');
	?>
	<div class="notice notice-warning is-dismissible">
		<p>
			<strong>Adaire Blocks:</strong> 
			Your license is not active. 
			<a href="<?php echo esc_url($license_page_url); ?>">Activate your license</a> 
			to unlock all features and receive updates.
		</p>
	</div>
	<?php
}

/**
 * Show license error notice for specific errors
 */
function adaire_blocks_license_error_notice($message) {
	if (!is_admin()) {
		return;
	}
	
	$license_page_url = admin_url('admin.php?page=adaire-blocks-license');
	?>
	<div class="notice notice-error is-dismissible">
		<p>
			<strong>Adaire Blocks License Error:</strong> 
			<?php echo esc_html($message); ?>
			<a href="<?php echo esc_url($license_page_url); ?>">Check your license</a>
		</p>
	</div>
	<?php
}

/**
 * Helper function to render blocks with upgrade notices
 * Use this in your render callbacks to automatically handle free/premium differences
 */
function adaire_render_block_with_notice($block_name, $attributes, $render_callback, $content = '') {
    $config = AdaireBlocksConfig::get_instance();
    $license_manager = AdaireBlocksLicense::get_instance();
    
    // Check license status first
    if (!$license_manager->is_license_active()) {
        // Show license activation notice for premium blocks
        $premium_blocks = array(
            'video-hero-block',
            'portfolio-block', 
            'particles-block',
            'services-block',
            'posts-grid-block',
            'project-block',
            'scroll-text-block',
            'questions-block'
        );
        
        if (in_array($block_name, $premium_blocks)) {
            return adaire_render_license_notice($block_name);
        }
    }
    
    
    // Check if we should show upgrade notice instead of rendering
    if ($config->should_show_upgrade_notice($block_name, $attributes)) {
        return $config->render_upgrade_notice($block_name);
    }
    
    // Render the block, respecting the callback's expected parameters
    $callable = $render_callback;
    if (is_array($callable)) {
        $reflection = new ReflectionMethod($callable[0], $callable[1]);
    } else {
        $reflection = new ReflectionFunction($callable);
    }
    $param_count = $reflection->getNumberOfParameters();

    if ($param_count >= 2) {
        return call_user_func($callable, $attributes, $content);
    }

    return call_user_func($callable, $attributes);
}

/**
 * Render license activation notice for premium blocks
 */
function adaire_render_license_notice($block_name) {
    $license_page_url = admin_url('admin.php?page=adaire-blocks-license');
    $block_title = ucwords(str_replace('-', ' ', $block_name));
    
    ob_start();
    ?>
    <div class="adaire-license-notice" style="
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 4px;
        padding: 20px;
        margin: 20px 0;
        text-align: center;
    ">
        <h3 style="margin: 0 0 10px 0; color: #856404;">
            <span class="dashicons dashicons-lock" style="margin-right: 8px;"></span>
            Pro Feature
        </h3>
        <p style="margin: 0 0 15px 0; color: #856404;">
            The <strong><?php echo esc_html($block_title); ?></strong> is a pro feature.
            Activate your license to unlock this block and many more pro features.
        </p>
        <a href="<?php echo esc_url($license_page_url); ?>" 
           class="button button-primary" 
           style="text-decoration: none;">
            Activate License
        </a>
    </div>
    <?php
    return ob_get_clean();
}

// Include block migration tool
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/block-migration.php';

// Cookie Banner consent log — server-side record of visitor decisions,
// backs the Cookie Dashboard's Recent/Full History toggle.
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-cookie-consent-log.php';

// Built-in known-tracker signature table + the passive cookie scanner that
// uses it — the Cookie Dashboard's Cookie Manager -> Detected tab.
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/cookie-known-trackers.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-cookie-scanner.php';

// Site-wide Cookie Categories admin page (Pro Cookie Banner block).
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/cookie-categories-page.php';

// Make the free Cookie Notice block render on every front-end page, not just
// the one page/post it's inserted into.
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/cookie-notice-global.php';

// Mega Menu: centrally-managed mega panels (adaire_mega_panel CPT), the
// panel-assignment fields added to native nav menu items, the Core
// Navigation editor extension, and the Mega Menu dashboard screen.
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-mega-panel-item-sanitizer.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-mega-panel-post-type.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-mega-panel-migration.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-mega-panel-editor.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-mega-panel-renderer.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-mega-menu-nav-item-fields.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-mega-menu-editor.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/mega-menu-page.php';

// Case Studies Management — adaire_case_study custom post type + taxonomies,
// nested under the Adaire Blocks admin menu. All Case Studies block content
// is sourced live from this CPT (see src/case-studies-block/render.php).
// The render helpers are shared between the block and the single case-study
// page template, so they're required once here rather than duplicated.
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/case-studies-render-helpers.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-case-studies-cpt.php';
AdaireCaseStudiesCPT::get_instance();
// Standard activation/deactivation rewrite-rule flush. The version-gated
// flush inside the class itself (maybe_flush_rewrite_rules, hooked to init)
// stays in place as a fallback for sites where this CPT was added to an
// already-active install and activation never re-fires.
register_activation_hook( __FILE__, array( 'AdaireCaseStudiesCPT', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'AdaireCaseStudiesCPT', 'deactivate' ) );

// Deactivation feedback modal — asks for a reason on the Plugins screen
// before the plugin actually deactivates.
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/deactivation-modal.php';
Adaire_Deactivation_Modal::get_instance();

// Deactivation feedback log + SendGrid test page.
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/deactivation-log-page.php';
Adaire_Deactivation_Log_Page::get_instance();

// Diagnostics tool removed

/**
 * AJAX handler to sideload remote media into the WP Media Library.
 */
function adaire_sideload_media_ajax() {
    if ( ! current_user_can( 'upload_files' ) ) {
        wp_send_json_error( array( 'message' => 'Unauthorized' ), 403 );
    }

	if ( empty( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'adaire_sideload_media' ) ) {
		wp_send_json_error( array( 'message' => 'Security check failed.' ), 403 );
	}

	if ( empty( $_POST['url'] ) ) {
		wp_send_json_error( array( 'message' => 'Missing URL' ), 400 );
	}

    $url = esc_url_raw( wp_unslash( $_POST['url'] ) );
    $media_kind = isset( $_POST['media_kind'] ) ? sanitize_text_field( wp_unslash( $_POST['media_kind'] ) ) : 'video';

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    // Download to temp location
    $tmp = download_url( $url );
    if ( is_wp_error( $tmp ) ) {
        wp_send_json_error( array( 'message' => 'Download failed', 'error' => $tmp->get_error_message() ), 400 );
    }

    // Build file array for media_handle_sideload
    $file = array();
    $file['name']     = wp_basename( $url );
    $file['tmp_name'] = $tmp;

    $override = array( 'test_form' => false );

    $results = media_handle_sideload( $file, 0 );

    if ( is_wp_error( $results ) ) {
        @unlink( $tmp );
        wp_send_json_error( array( 'message' => 'Sideload failed', 'error' => $results->get_error_message() ), 500 );
    }

    $attachment_id = $results;
    $attachment_url = wp_get_attachment_url( $attachment_id );

    wp_send_json_success( array( 'id' => $attachment_id, 'url' => $attachment_url ) );
}
add_action( 'wp_ajax_adaire_sideload_media', 'adaire_sideload_media_ajax' );

/**
 * Render callback for counter-block (Dynamic Block)
 * This PHP function outputs the HTML - JavaScript logic in view.js
 */
function render_counter_block($attributes) {
    // Use the helper function to automatically handle upgrade notices
    return adaire_render_block_with_notice('counter-block', $attributes, function($attrs) {
        // Debug: Check if function is called
        error_log('Counter Block Render Called with attributes: ' . print_r($attrs, true));
    
        $block_id = $attrs['blockId'] ?? '';
        $container_mode = $attrs['containerMode'] ?? 'full';
        $container_max_width = $attrs['containerMaxWidth'] ?? array();
        $margin_top = $attrs['marginTop'] ?? array();
        $margin_right = $attrs['marginRight'] ?? array();
        $margin_bottom = $attrs['marginBottom'] ?? array();
        $margin_left = $attrs['marginLeft'] ?? array();
        $padding_top = $attrs['paddingTop'] ?? array();
        $padding_right = $attrs['paddingRight'] ?? array();
        $padding_bottom = $attrs['paddingBottom'] ?? array();
        $padding_left = $attrs['paddingLeft'] ?? array();
        $starting_number = $attrs['startingNumber'] ?? 100;
        $ending_number = $attrs['endingNumber'] ?? 200;
        $duration = $attrs['duration'] ?? 3000;
        $delay_bool = $attrs['delayBool'] ?? false;
        $delay_time = $attrs['delayTime'] ?? 500;
        $font_size = $attrs['fontSize'] ?? 48;
        $font_weight = $attrs['fontWeight'] ?? '700';
        $color = $attrs['color'] ?? '#1a1a1a';
        $letter_spacing = $attrs['letterSpacing'] ?? 0;
        $prefix = $attrs['prefix'] ?? '';
        $suffix = $attrs['suffix'] ?? '';
        $counter_direction = $attrs['counterDirection'] ?? 'up';
        $caption = $attrs['caption'] ?? '';
        $caption_position = $attrs['captionPosition'] ?? 'bottom';
        $caption_font_size = $attrs['captionFontSize'] ?? 16;
        $caption_color = $attrs['captionColor'] ?? '#666666';
    
    // Build CSS variables
    $desktop_max_width = ($container_max_width['desktop']['value'] ?? 1200) . ($container_max_width['desktop']['unit'] ?? 'px');
    $tablet_max_width = ($container_max_width['tablet']['value'] ?? 100) . ($container_max_width['tablet']['unit'] ?? '%');
    $mobile_max_width = ($container_max_width['mobile']['value'] ?? 100) . ($container_max_width['mobile']['unit'] ?? '%');
    
    $styles = array(
        '--container-max-width' => $desktop_max_width,
        '--container-max-width-tablet' => $tablet_max_width,
        '--container-max-width-mobile' => $mobile_max_width,
        'margin-top' => ($margin_top['desktop'] ?? 0) . 'px',
        'margin-right' => ($margin_right['desktop'] ?? 0) . 'px',
        'margin-bottom' => ($margin_bottom['desktop'] ?? 0) . 'px',
        'margin-left' => ($margin_left['desktop'] ?? 0) . 'px',
        '--margin-top-tablet' => ($margin_top['tablet'] ?? 0) . 'px',
        '--margin-right-tablet' => ($margin_right['tablet'] ?? 0) . 'px',
        '--margin-bottom-tablet' => ($margin_bottom['tablet'] ?? 0) . 'px',
        '--margin-left-tablet' => ($margin_left['tablet'] ?? 0) . 'px',
        '--margin-top-mobile' => ($margin_top['mobile'] ?? 0) . 'px',
        '--margin-right-mobile' => ($margin_right['mobile'] ?? 0) . 'px',
        '--margin-bottom-mobile' => ($margin_bottom['mobile'] ?? 0) . 'px',
        '--margin-left-mobile' => ($margin_left['mobile'] ?? 0) . 'px',
        'padding-top' => ($padding_top['desktop'] ?? 0) . 'px',
        'padding-right' => ($padding_right['desktop'] ?? 0) . 'px',
        'padding-bottom' => ($padding_bottom['desktop'] ?? 0) . 'px',
        'padding-left' => ($padding_left['desktop'] ?? 0) . 'px',
        '--padding-top-tablet' => ($padding_top['tablet'] ?? 0) . 'px',
        '--padding-right-tablet' => ($padding_right['tablet'] ?? 0) . 'px',
        '--padding-bottom-tablet' => ($padding_bottom['tablet'] ?? 0) . 'px',
        '--padding-left-tablet' => ($padding_left['tablet'] ?? 0) . 'px',
        '--padding-top-mobile' => ($padding_top['mobile'] ?? 0) . 'px',
        '--padding-right-mobile' => ($padding_right['mobile'] ?? 0) . 'px',
        '--padding-bottom-mobile' => ($padding_bottom['mobile'] ?? 0) . 'px',
        '--padding-left-mobile' => ($padding_left['mobile'] ?? 0) . 'px',
    );
    
    $style_string = '';
    foreach ($styles as $prop => $value) {
        $style_string .= "$prop:$value;";
    }
    
    $container_class = $container_mode === 'constrained' ? 'is-constrained' : '';
    
    ob_start();
    ?>
    <div class="ab-counter-block counter-block" 
         style="<?php echo esc_attr($style_string); ?>"
         data-block-id="<?php echo esc_attr($block_id); ?>"
         data-starting-number="<?php echo esc_attr($starting_number); ?>"
         data-ending-number="<?php echo esc_attr($ending_number); ?>"
         data-duration="<?php echo esc_attr($duration); ?>"
         data-delay-bool="<?php echo esc_attr($delay_bool ? 'true' : 'false'); ?>"
         data-delay-time="<?php echo esc_attr($delay_time); ?>"
         data-counter-direction="<?php echo esc_attr($counter_direction); ?>"
         data-prefix="<?php echo esc_attr($prefix); ?>"
         data-suffix="<?php echo esc_attr($suffix); ?>">
        <div class="ab-counter-block__container <?php echo esc_attr($container_class); ?>">
            <?php if ($caption && $caption_position === 'top'): ?>
                <div class="ab-counter-block__caption ab-counter-block__caption--top"
                     style="font-size: <?php echo esc_attr($caption_font_size); ?>px; color: <?php echo esc_attr($caption_color); ?>; margin-bottom: 16px; text-align: center;">
                    <?php echo esc_html($caption); ?>
                </div>
            <?php endif; ?>
            
            <div class="ab-counter-block__content" style="text-align: center;">
                <span class="ab-counter-block__number"
                      style="font-size: <?php echo esc_attr($font_size); ?>px; font-weight: <?php echo esc_attr($font_weight); ?>; color: <?php echo esc_attr($color); ?>; letter-spacing: <?php echo esc_attr($letter_spacing); ?>px;">
                    <?php if ($prefix): ?><span class="ab-counter-block__prefix"><?php echo esc_html($prefix); ?></span><?php endif; ?>
                    <span class="displayNumber"><?php echo esc_html($starting_number); ?></span>
                    <?php if ($suffix): ?><span class="ab-counter-block__suffix"><?php echo esc_html($suffix); ?></span><?php endif; ?>
                </span>
            </div>
            
            <?php if ($caption && $caption_position === 'bottom'): ?>
                <div class="ab-counter-block__caption ab-counter-block__caption--bottom"
                     style="font-size: <?php echo esc_attr($caption_font_size); ?>px; color: <?php echo esc_attr($caption_color); ?>; margin-top: 16px; text-align: center;">
                    <?php echo esc_html($caption); ?>
                </div>
            <?php endif; ?>
        </div>
        </div>
        <?php
        return ob_get_clean();
    });
}

if ( ! function_exists( 'adaire_mega_menu_register_nav_menu_locations' ) ) {
	/**
	 * Plugin-owned nav menu location slugs used to resolve the "Primary
	 * Menu" / "Footer Menu" Navigation Source options — the same two
	 * locations header-menu-block and website-footer-block already use (see
	 * register_nav_menus() elsewhere in this file). Reusing them means a
	 * menu a site owner already assigned under Appearance > Menus for their
	 * header or footer can power the mega menu too, with nothing new to
	 * configure.
	 */
	function adaire_mega_menu_register_nav_menu_locations() {
		return array(
			'primary' => 'adaire-blocks-primary',
			'footer'  => 'adaire-blocks-footer',
		);
	}
}

if ( ! function_exists( 'adaire_mega_menu_resolve_menu_object' ) ) {
	/**
	 * Resolves a WP_Term menu object for navigationSource "primary",
	 * "footer", or "menu". Returns null if nothing is assigned/selected yet
	 * so callers can gracefully fall back to the legacy menuItems.
	 */
	function adaire_mega_menu_resolve_menu_object( $attributes ) {
		$source = isset( $attributes['navigationSource'] ) ? $attributes['navigationSource'] : 'legacy';

		if ( 'menu' === $source ) {
			$menu_id = ! empty( $attributes['selectedMenuId'] ) ? (int) $attributes['selectedMenuId'] : 0;
			if ( ! $menu_id ) {
				return null;
			}
			$menu = wp_get_nav_menu_object( $menu_id );
			return $menu ? $menu : null;
		}

		if ( 'primary' === $source || 'footer' === $source ) {
			$locations_map = adaire_mega_menu_register_nav_menu_locations();
			$location_slug = $locations_map[ $source ];
			$locations     = get_nav_menu_locations();

			if ( empty( $locations[ $location_slug ] ) ) {
				return null;
			}

			$menu = wp_get_nav_menu_object( $locations[ $location_slug ] );
			return $menu ? $menu : null;
		}

		return null;
	}
}

if ( ! function_exists( 'adaire_mega_menu_label_from_url' ) ) {
	/**
	 * Derives a human-readable label from a menu item's URL, used when WP
	 * has nothing usable for the title (see adaire_mega_menu_friendly_label()).
	 */
	function adaire_mega_menu_label_from_url( $url ) {
		$path = trim( (string) wp_parse_url( (string) $url, PHP_URL_PATH ), '/' );
		if ( '' === $path ) {
			return __( 'Menu item', 'mega-menu-block' );
		}
		$segments = explode( '/', $path );
		$slug     = end( $segments );
		$slug     = str_replace( array( '-', '_' ), ' ', $slug );
		$slug     = trim( $slug );
		return '' !== $slug ? ucwords( $slug ) : __( 'Menu item', 'mega-menu-block' );
	}
}

if ( ! function_exists( 'adaire_mega_menu_friendly_label' ) ) {
	/**
	 * wp_get_nav_menu_items()/wp_setup_nav_menu_item() falls back to a raw
	 * "#123 (no title)" string when a menu item has no custom label AND its
	 * linked object has no title (deleted/trashed/genuinely-untitled target).
	 * That debug-style string (with a raw DB post ID) should never reach a
	 * site visitor or the editor, so swap it for a label derived from the
	 * item's URL instead. A real custom label or resolved object title
	 * always takes priority and passes through unchanged.
	 */
	function adaire_mega_menu_friendly_label( $title, $url ) {
		$title = trim( (string) $title );
		if ( '' !== $title && ! preg_match( '/^#\d+\s*\(no title\)$/i', $title ) ) {
			return $title;
		}
		return adaire_mega_menu_label_from_url( $url );
	}
}

if ( ! function_exists( 'adaire_mega_menu_build_menu_tree' ) ) {
	/**
	 * Assembles a flat wp_get_nav_menu_items() result into the nested shape
	 * the existing render loop below already expects from the manually-
	 * authored `menuItems` attribute — id/title/url/isBold/openInNewTab/
	 * children — so no changes are needed to the (large, already-working)
	 * markup loop itself, only to where its input data comes from. Every
	 * mega-menu-specific field the loop also reads (canvasImageUrl,
	 * bannerDescription, per-item font/color overrides, etc.) is optional
	 * there via `??` fallbacks, so simply omitting them here is enough for
	 * WP-menu-sourced items to render with the block's global styling.
	 *
	 * Depth is capped at 3 levels (dropdown > sub-dropdown > sub-menu leaf)
	 * to match what the render loop actually supports — a WP menu can nest
	 * deeper, but the 4th level and beyond would have nowhere to render, so
	 * it's dropped rather than silently producing broken markup.
	 */
	function adaire_mega_menu_build_menu_tree( $menu_items, $max_depth = 3 ) {
		$by_parent = array();
		foreach ( $menu_items as $item ) {
			$parent = (int) $item->menu_item_parent;
			if ( ! isset( $by_parent[ $parent ] ) ) {
				$by_parent[ $parent ] = array();
			}
			$by_parent[ $parent ][] = $item;
		}

		$build = function ( $parent_id, $depth ) use ( &$build, $by_parent, $max_depth ) {
			if ( $depth > $max_depth || empty( $by_parent[ $parent_id ] ) ) {
				return array();
			}
			$nodes = array();
			foreach ( $by_parent[ $parent_id ] as $item ) {
				$nodes[] = array(
					'id'           => (int) $item->ID,
					'title'        => adaire_mega_menu_friendly_label( $item->title, $item->url ),
					'url'          => $item->url,
					'isBold'       => false,
					'openInNewTab' => '_blank' === $item->target,
					'children'     => $build( (int) $item->ID, $depth + 1 ),
				);
			}
			return $nodes;
		};

		return $build( 0, 1 );
	}
}

if ( ! function_exists( 'adaire_mega_menu_resolve_menu_items' ) ) {
	/**
	 * Single entry point used by the render callback: decides between the
	 * legacy `menuItems` attribute and a live WordPress menu.
	 *
	 * IMPORTANT: once a dynamic source ("primary"/"footer"/"menu") is
	 * explicitly selected, this never falls back to the legacy items, even
	 * if nothing is assigned/resolved yet — matching header-menu-block's same
	 * rule (see adaire_header_resolve_nav() in header-menu-block/render.php) so
	 * a stale or unrelated placeholder menu never silently renders instead
	 * of the real selected one.
	 */
	function adaire_mega_menu_resolve_menu_items( $attributes ) {
		$source        = isset( $attributes['navigationSource'] ) ? $attributes['navigationSource'] : 'legacy';
		$legacy_items  = ( isset( $attributes['menuItems'] ) && is_array( $attributes['menuItems'] ) ) ? $attributes['menuItems'] : array();

		if ( 'legacy' === $source || empty( $source ) ) {
			return $legacy_items;
		}

		$menu = adaire_mega_menu_resolve_menu_object( $attributes );
		if ( ! $menu ) {
			return array();
		}

		$menu_items = wp_get_nav_menu_items( $menu->term_id, array( 'update_post_term_cache' => false ) );
		if ( ! $menu_items ) {
			return array();
		}

		return adaire_mega_menu_build_menu_tree( $menu_items );
	}
}

/**
 * Render callback for mega-menu-block (Dynamic Block)
 * This PHP function outputs the HTML - JavaScript logic in view.js
 */
function render_mega_menu_block($attributes, $content) {
    // Use the helper function to automatically handle upgrade notices
    return adaire_render_block_with_notice('mega-menu-block', $attributes, function($attrs, $inner_content) {
        // Extract all attributes with defaults
        $block_id = $attrs['blockId'] ?? '';
        $logo_url = $attrs['logoUrl'] ?? '';
        $logo_alt = $attrs['logoAlt'] ?? 'Logo';
        $logo_link_url = $attrs['logoLinkUrl'] ?? '/';
        $logo_size = $attrs['logoSize'] ?? 40;
        $menu_items = adaire_mega_menu_resolve_menu_items( $attrs );
        $backgroundColor = $attrs['backgroundColor'] ?? '#ffffff';
        $textColor = $attrs['textColor'] ?? '#000000';
        $hoverColor = $attrs['hoverColor'] ?? '#428aff';
        $activeColor = $attrs['activeColor'] ?? '#000000';
        $level1HoverColor = $attrs['level1HoverColor'] ?? '#428aff';
        $level1ShowHoverUnderline = $attrs['level1ShowHoverUnderline'] ?? true;
        $level1UnderlineWidth = $attrs['level1UnderlineWidth'] ?? 3;
        $level1UnderlineColor = $attrs['level1UnderlineColor'] ?? '#428aff';
        $level1UnderlineBorderRadius = $attrs['level1UnderlineBorderRadius'] ?? 0;
        $level1HoverBgColor = $attrs['level1HoverBgColor'] ?? 'transparent';
        $level1HoverPadding = $attrs['level1HoverPadding'] ?? array('top' => 10, 'right' => 5, 'bottom' => 10, 'left' => 5);
        $level2HoverColor = $attrs['level2HoverColor'] ?? '#428aff';
        $level2HoverTextColorEnabled = $attrs['level2HoverTextColorEnabled'] ?? false;
        $level2ShowHoverUnderline = $attrs['level2ShowHoverUnderline'] ?? true;
        $level2HoverBgColor = $attrs['level2HoverBgColor'] ?? 'rgba(0, 0, 0, 0.05)';
        $level2HoverPadding = $attrs['level2HoverPadding'] ?? array('top' => 8, 'right' => 12, 'bottom' => 8, 'left' => 12);
        $level2HeaderSpacing = $attrs['level2HeaderSpacing'] ?? 16;
        $level3HoverColor = $attrs['level3HoverColor'] ?? '#428aff';
        $level3ShowHoverUnderline = $attrs['level3ShowHoverUnderline'] ?? true;
        $level3ItemSpacing = $attrs['level3ItemSpacing'] ?? 8;
        $level3UnderlineWidth = $attrs['level3UnderlineWidth'] ?? 3;
        $level3UnderlineColor = $attrs['level3UnderlineColor'] ?? '#428aff';
        $level3HoverBgColor = $attrs['level3HoverBgColor'] ?? 'rgba(0, 0, 0, 0.05)';
        $level3HoverPadding = $attrs['level3HoverPadding'] ?? array('top' => 8, 'right' => 12, 'bottom' => 8, 'left' => 12);
        $level1FontSize = $attrs['level1FontSize'] ?? 16;
        $level1FontWeight = $attrs['level1FontWeight'] ?? '400';
        $level1FontColor = $attrs['level1FontColor'] ?? '#000000';
        $level1HoverBorderRadius = $attrs['level1HoverBorderRadius'] ?? 4;
        $level2FontSize = $attrs['level2FontSize'] ?? 14;
        $level2FontWeight = $attrs['level2FontWeight'] ?? '400';
        $level2FontColor = $attrs['level2FontColor'] ?? '#000000';
        $level3FontSize = $attrs['level3FontSize'] ?? 12;
        $level3FontWeight = $attrs['level3FontWeight'] ?? '400';
        $level3FontColor = $attrs['level3FontColor'] ?? '#000000';
        $canvasFontSize = $attrs['canvasFontSize'] ?? 18;
        $canvasFontWeight = $attrs['canvasFontWeight'] ?? '600';
        $canvasFontColor = $attrs['canvasFontColor'] ?? '#000000';
        $canvasImageBorderRadius = $attrs['canvasImageBorderRadius'] ?? 8;
        $menuCanvasBorderRadius = $attrs['menuCanvasBorderRadius'] ?? 0;
        $menuBorderRadius = $attrs['menuBorderRadius'] ?? 0;
        $showCanvasTitle = $attrs['showCanvasTitle'] ?? false;
        $fontSize = $attrs['fontSize'] ?? 16;
        $fontWeight = $attrs['fontWeight'] ?? '400';
        $boldWeight = $attrs['boldWeight'] ?? '700';
        $fontFamily = $attrs['fontFamily'] ?? 'inherit';
        $underlineColor = $attrs['underlineColor'] ?? '#000000';
        $isSticky = $attrs['isSticky'] ?? true;
        $containerMode = $attrs['containerMode'] ?? 'full';
        $containerMaxWidth = $attrs['containerMaxWidth'] ?? array('desktop' => array('value' => 1200, 'unit' => 'px'), 'tablet' => array('value' => 100, 'unit' => '%'), 'mobile' => array('value' => 100, 'unit' => '%'));
        $padding = $attrs['padding'] ?? array('top' => 20, 'right' => 20, 'bottom' => 20, 'left' => 20);
        $margin = $attrs['margin'] ?? array('top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0);
        $keepCanvasOpenOnClick = $attrs['keepCanvasOpenOnClick'] ?? false;
        $increaseOpacity = $attrs['increaseOpacity'] ?? false;
        $scrollBackgroundColor = $attrs['scrollBackgroundColor'] ?? '#ffffff';
        $menuItemsColorTop = $attrs['menuItemsColorTop'] ?? '#ffffff';
        $menuItemsColorScroll = $attrs['menuItemsColorScroll'] ?? '#000000';
        $menuItemsUnderlineColorTop = $attrs['menuItemsUnderlineColorTop'] ?? $level1UnderlineColor;
        $menuItemsUnderlineColorScroll = $attrs['menuItemsUnderlineColorScroll'] ?? $level1UnderlineColor;
        $menuImageAtTop = $attrs['menuImageAtTop'] ?? '';
        $menuImageAtTopAlt = $attrs['menuImageAtTopAlt'] ?? 'Menu Image at Top';
        $menuImageOnScroll = $attrs['menuImageOnScroll'] ?? '';
        $menuImageOnScrollAlt = $attrs['menuImageOnScrollAlt'] ?? 'Menu Image on Scroll';
        $menuImageSize = $attrs['menuImageSize'] ?? 40;
        $ribbonEnabled = $attrs['ribbonEnabled'] ?? false;
        $ribbonText = $attrs['ribbonText'] ?? __("We're celebrating 25 years of innovation.", "mega-menu-block");
        $ribbonBackgroundColor = $attrs['ribbonBackgroundColor'] ?? '#111111';
        $ribbonTextColor = $attrs['ribbonTextColor'] ?? '#ffffff';
        $ribbonFontSize = $attrs['ribbonFontSize'] ?? 14;
        $ribbonFontWeight = $attrs['ribbonFontWeight'] ?? '500';
        $ribbonLinkLabel = $attrs['ribbonLinkLabel'] ?? __("Learn more", "mega-menu-block");
        $ribbonLinkUrl = $attrs['ribbonLinkUrl'] ?? '';
        $ribbonLinkColor = $attrs['ribbonLinkColor'] ?? '#ffffff';
        $ribbonLinkFontWeight = $attrs['ribbonLinkFontWeight'] ?? '600';
        $ribbonLinkOpenInNewTab = $attrs['ribbonLinkOpenInNewTab'] ?? false;
        $ribbonLinkUnderline = $attrs['ribbonLinkUnderline'] ?? true;
        $ribbonLinkUnderlineColor = $attrs['ribbonLinkUnderlineColor'] ?? '#ffffff';
        $ribbonLinkUnderlineWidth = $attrs['ribbonLinkUnderlineWidth'] ?? 1;
        $ribbonHeight = $attrs['ribbonHeight'] ?? 48;
        $ribbonPaddingTop = $attrs['ribbonPaddingTop'] ?? 8;
        $ribbonPaddingBottom = $attrs['ribbonPaddingBottom'] ?? 8;
        $ribbonLinkArrowEnabled = $attrs['ribbonLinkArrowEnabled'] ?? false;
        $ribbonLinkArrowColor = isset( $attrs['ribbonLinkArrowColor'] ) ? (string) $attrs['ribbonLinkArrowColor'] : '';
        $ribbonLinkArrowSize = isset( $attrs['ribbonLinkArrowSize'] ) ? (int) $attrs['ribbonLinkArrowSize'] : 16;
        $ribbonLinkArrowRotation = isset( $attrs['ribbonLinkArrowRotation'] ) ? (float) $attrs['ribbonLinkArrowRotation'] : 0;
        $centerMenu = $attrs['centerMenu'] ?? true;
        $ctaButtonEnabled = $attrs['ctaButtonEnabled'] ?? true;
        $ctaButtonText = $attrs['ctaButtonText'] ?? __('Contact us', 'mega-menu-block');
        $ctaButtonLink = $attrs['ctaButtonLink'] ?? '#';
        $ctaButtonOpenInNewTab = $attrs['ctaButtonOpenInNewTab'] ?? false;
        $ctaButtonShowIcon = $attrs['ctaButtonShowIcon'] ?? true;
        $ctaButtonStyle = $attrs['ctaButtonStyle'] ?? 'border';
        $ctaButtonHoverAnimation = $attrs['ctaButtonHoverAnimation'] ?? 'none';
        $ctaButtonFontSize = $attrs['ctaButtonFontSize'] ?? 16;
        $ctaButtonFontWeight = $attrs['ctaButtonFontWeight'] ?? '600';
        $ctaButtonColor = $attrs['ctaButtonColor'] ?? '#111111';
        $ctaButtonBackgroundColor = $attrs['ctaButtonBackgroundColor'] ?? 'transparent';
        $ctaButtonHoverColor = $attrs['ctaButtonHoverColor'] ?? '#ffffff';
        $ctaButtonHoverBackgroundColor = $attrs['ctaButtonHoverBackgroundColor'] ?? '#111111';
        $ctaButtonUnderlineColor = $attrs['ctaButtonUnderlineColor'] ?? '#111111';
        $ctaButtonBlurAmount = $attrs['ctaButtonBlurAmount'] ?? 0;
        $ctaButtonBorderRadius = $attrs['ctaButtonBorderRadius'] ?? 999;
        $ctaButtonBorderWidth = $attrs['ctaButtonBorderWidth'] ?? 1;
        $ctaButtonBorderColor = $attrs['ctaButtonBorderColor'] ?? '#111111';
        $ctaButtonHoverBorderColor = $attrs['ctaButtonHoverBorderColor'] ?? '#111111';
        $ctaButtonBorderStyle = $attrs['ctaButtonBorderStyle'] ?? 'solid';
        $ctaButtonPadding = $attrs['ctaButtonPadding'] ?? array(
            'top' => '10px',
            'right' => '24px',
            'bottom' => '10px',
            'left' => '24px',
        );
        $ctaButtonMargin = $attrs['ctaButtonMargin'] ?? array(
            'top' => '0px',
            'right' => '0px',
            'bottom' => '0px',
            'left' => '0px',
        );
        $ctaButtonColorScroll = $attrs['ctaButtonColorScroll'] ?? '#ffffff';
        $ctaButtonBackgroundColorScroll = $attrs['ctaButtonBackgroundColorScroll'] ?? '#111111';
        $ctaButtonBorderColorScroll = $attrs['ctaButtonBorderColorScroll'] ?? '#111111';
        $ctaButtonHoverColorScroll = $attrs['ctaButtonHoverColorScroll'] ?? '#111111';
        $ctaButtonHoverBackgroundColorScroll = $attrs['ctaButtonHoverBackgroundColorScroll'] ?? '#ffffff';
        $ctaButtonHoverBorderColorScroll = $attrs['ctaButtonHoverBorderColorScroll'] ?? '#ffffff';
        $ctaMobileUseSeparateStyles = $attrs['ctaMobileUseSeparateStyles'] ?? false;
        $ctaMobileButtonColor = $attrs['ctaMobileButtonColor'] ?? '';
        $ctaMobileButtonBackgroundColor = $attrs['ctaMobileButtonBackgroundColor'] ?? '';
        $ctaMobileButtonBorderColor = $attrs['ctaMobileButtonBorderColor'] ?? '';
        $ctaMobileButtonHoverColor = $attrs['ctaMobileButtonHoverColor'] ?? '';
        $ctaMobileButtonHoverBackgroundColor = $attrs['ctaMobileButtonHoverBackgroundColor'] ?? '';
        $ctaMobileButtonHoverBorderColor = $attrs['ctaMobileButtonHoverBorderColor'] ?? '';
        $ctaMobileButtonBorderRadius = $attrs['ctaMobileButtonBorderRadius'] ?? 999;
        $ctaMobileButtonBorderWidth = $attrs['ctaMobileButtonBorderWidth'] ?? 1;
        $ctaMobileButtonPadding = $attrs['ctaMobileButtonPadding'] ?? array(
            'top' => '10px',
            'right' => '24px',
            'bottom' => '10px',
            'left' => '24px',
        );
        $ctaMobileButtonFontSize = $attrs['ctaMobileButtonFontSize'] ?? 16;
        $ctaMobileButtonFontWeight = $attrs['ctaMobileButtonFontWeight'] ?? '';
        $ctaMobileButtonShowIcon = array_key_exists('ctaMobileButtonShowIcon', $attrs) ? $attrs['ctaMobileButtonShowIcon'] : true;
        $ctaMobileButtonStyle = $attrs['ctaMobileButtonStyle'] ?? 'inherit';
        $ctaMobileButtonHoverAnimation = $attrs['ctaMobileButtonHoverAnimation'] ?? 'inherit';
        $menuPanelGap = $attrs['menuPanelGap'] ?? 16;
        $menuPanelPaddingBottom = $attrs['menuPanelPaddingBottom'] ?? 16;
        $canvasBannerBackgroundColor = $attrs['canvasBannerBackgroundColor'] ?? '#ff3131';
        $canvasBannerWidth = $attrs['canvasBannerWidth'] ?? 100;
        $canvasBannerPaddingTop = $attrs['canvasBannerPaddingTop'] ?? 10;
        $canvasBannerPaddingBottom = $attrs['canvasBannerPaddingBottom'] ?? 10;
        $canvasBannerPaddingLeft = $attrs['canvasBannerPaddingLeft'] ?? 20;
        $canvasBannerPaddingRight = $attrs['canvasBannerPaddingRight'] ?? 20;
        $canvasBannerTitleFontSize = $attrs['canvasBannerTitleFontSize'] ?? 30;
        $canvasBannerTitleColor = $attrs['canvasBannerTitleColor'] ?? '#ffffff';
        $canvasBannerTitleFontWeight = $attrs['canvasBannerTitleFontWeight'] ?? '300';
        $canvasBannerDescriptionFontSize = $attrs['canvasBannerDescriptionFontSize'] ?? 20;
        $canvasBannerDescriptionColor = $attrs['canvasBannerDescriptionColor'] ?? '#ffffff';
        $canvasBannerDescriptionFontWeight = $attrs['canvasBannerDescriptionFontWeight'] ?? '300';
        $canvasListPaddingLeft = $attrs['canvasListPaddingLeft'] ?? 20;
        $canvasListPaddingRight = $attrs['canvasListPaddingRight'] ?? 20;
        $canvasStoryTitleFontSize = $attrs['canvasStoryTitleFontSize'] ?? 28;
        $canvasStoryTitleFontWeight = $attrs['canvasStoryTitleFontWeight'] ?? '600';
        $canvasStoryTitleColor = $attrs['canvasStoryTitleColor'] ?? '#1a1a1a';
        $canvasStoryTitleMarginTop = $attrs['canvasStoryTitleMarginTop'] ?? 0;
        $canvasStoryTitleMarginBottom = $attrs['canvasStoryTitleMarginBottom'] ?? 12;
        $canvasStoryDescriptionFontSize = $attrs['canvasStoryDescriptionFontSize'] ?? 16;
        $canvasStoryDescriptionFontWeight = $attrs['canvasStoryDescriptionFontWeight'] ?? '400';
        $canvasStoryDescriptionColor = $attrs['canvasStoryDescriptionColor'] ?? '#3d3d3d';
        $canvasStoryDescriptionMarginTop = $attrs['canvasStoryDescriptionMarginTop'] ?? 12;
        $canvasStoryDescriptionMarginBottom = $attrs['canvasStoryDescriptionMarginBottom'] ?? 16;
        $canvasStoryLinkFontSize = $attrs['canvasStoryLinkFontSize'] ?? 15;
        $canvasStoryLinkFontWeight = $attrs['canvasStoryLinkFontWeight'] ?? '600';
        $canvasStoryLinkColor = $attrs['canvasStoryLinkColor'] ?? '#4b2aad';
        $canvasStoryLinkMarginTop = $attrs['canvasStoryLinkMarginTop'] ?? 6;
        $canvasStoryLinkMarginBottom = $attrs['canvasStoryLinkMarginBottom'] ?? 0;
        $canvasStoryDividerEnabled = $attrs['canvasStoryDividerEnabled'] ?? false;
        $canvasStoryDividerWidth = $attrs['canvasStoryDividerWidth'] ?? 2;
        $canvasStoryDividerHeight = $attrs['canvasStoryDividerHeight'] ?? 70;
        $canvasStoryDividerColor = $attrs['canvasStoryDividerColor'] ?? '#d7d7d7';
        $canvasStoryDividerAlpha = $attrs['canvasStoryDividerAlpha'] ?? 0.4;
        $mobileMenuBgColor = $attrs['mobileMenuBgColor'] ?? '#ffffff';
        $mobileLevel1FontSize = $attrs['mobileLevel1FontSize'] ?? 16;
        $mobileLevel1FontWeight = $attrs['mobileLevel1FontWeight'] ?? '600';
        $mobileLevel1FontColor = $attrs['mobileLevel1FontColor'] ?? '#111111';
        $mobileLevel2FontSize = $attrs['mobileLevel2FontSize'] ?? 15;
        $mobileLevel2FontWeight = $attrs['mobileLevel2FontWeight'] ?? '500';
        $mobileLevel2FontColor = $attrs['mobileLevel2FontColor'] ?? '#222222';
        $mobileLevel3FontSize = $attrs['mobileLevel3FontSize'] ?? 14;
        $mobileLevel3FontWeight = $attrs['mobileLevel3FontWeight'] ?? '400';
        $mobileLevel3FontColor = $attrs['mobileLevel3FontColor'] ?? '#333333';
        $mobileMenuItemBgColor = $attrs['mobileMenuItemBgColor'] ?? '#ffffff';
        $mobileMenuItemHoverBgColor = $attrs['mobileMenuItemHoverBgColor'] ?? '#f8f8f8';
        $mobileChevronSize = $attrs['mobileChevronSize'] ?? 20;
        $mobileChevronColor = $attrs['mobileChevronColor'] ?? '#666666';
        $mobileMenuIconColor = $attrs['mobileMenuIconColor'] ?? '#111111';
        $mobileMenuIconColorScroll = $attrs['mobileMenuIconColorScroll'] ?? '#ffffff';
        $menuDropdownOffset = $attrs['menuDropdownOffset'] ?? 70;
        $mobileImmersiveMode = $attrs['mobileImmersiveMode'] ?? false;
        $mobileImmersiveBgType = $attrs['mobileImmersiveBgType'] ?? 'solid';
        $mobileImmersiveBgColor = $attrs['mobileImmersiveBgColor'] ?? '#ffffff';
        $mobileImmersiveGradientType = $attrs['mobileImmersiveGradientType'] ?? 'linear';
        $mobileImmersiveGradientAngle = $attrs['mobileImmersiveGradientAngle'] ?? 180;
        $mobileImmersiveGradientColor1 = $attrs['mobileImmersiveGradientColor1'] ?? '#000000';
        $mobileImmersiveGradientColor2 = $attrs['mobileImmersiveGradientColor2'] ?? '#ffffff';
        $mobileImmersiveGradientStartStop = $attrs['mobileImmersiveGradientStartStop'] ?? 0;
        $mobileImmersiveGradientEndStop = $attrs['mobileImmersiveGradientEndStop'] ?? 100;
        $mobileImmersiveBgImage = $attrs['mobileImmersiveBgImage'] ?? '';
        $mobileImmersiveBgImageSize = $attrs['mobileImmersiveBgImageSize'] ?? 'cover';
        $mobileImmersiveBgImagePosition = $attrs['mobileImmersiveBgImagePosition'] ?? 'center center';
        $mobileImmersiveOverlayColor = $attrs['mobileImmersiveOverlayColor'] ?? '#000000';
        $mobileImmersiveOverlayOpacity = $attrs['mobileImmersiveOverlayOpacity'] ?? 0.5;
        $mobileImmersiveIconSize = $attrs['mobileImmersiveIconSize'] ?? 24;
        $mobileImmersiveIconColor = $attrs['mobileImmersiveIconColor'] ?? '#ffffff';
        $mobileImmersiveButtonRowPadding = $attrs['mobileImmersiveButtonRowPadding'] ?? array('top' => 0, 'right' => 0, 'bottom' => 32, 'left' => 0);

        // Helper function to get level colors
        $getLevelColors = function($level) use ($level1HoverColor, $level1ShowHoverUnderline, $level1UnderlineWidth, $level1UnderlineColor, $level1UnderlineBorderRadius, $level1FontSize, $level1FontWeight, $level1FontColor, $level2HoverColor, $level2ShowHoverUnderline, $level2FontSize, $level2FontWeight, $level2FontColor, $level3HoverColor, $level3ShowHoverUnderline, $level3UnderlineWidth, $level3UnderlineColor, $level3FontSize, $level3FontWeight, $level3FontColor) {
            switch ($level) {
                case 0:
                    return array(
                        'hoverColor' => $level1HoverColor,
                        'showHoverUnderline' => $level1ShowHoverUnderline,
                        'underlineWidth' => $level1UnderlineWidth,
                        'underlineColor' => $level1UnderlineColor,
                        'underlineBorderRadius' => $level1UnderlineBorderRadius,
                        'fontSize' => $level1FontSize,
                        'fontWeight' => $level1FontWeight,
                        'fontColor' => $level1FontColor,
                    );
                case 1:
                    return array(
                        'hoverColor' => $level2HoverColor,
                        'showHoverUnderline' => $level2ShowHoverUnderline,
                        'fontSize' => $level2FontSize,
                        'fontWeight' => $level2FontWeight,
                        'fontColor' => $level2FontColor,
                    );
                case 2:
                    return array(
                        'hoverColor' => $level3HoverColor,
                        'showHoverUnderline' => $level3ShowHoverUnderline,
                        'underlineWidth' => $level3UnderlineWidth,
                        'underlineColor' => $level3UnderlineColor,
                        'underlineBorderRadius' => 0,
                        'fontSize' => $level3FontSize,
                        'fontWeight' => $level3FontWeight,
                        'fontColor' => $level3FontColor,
                    );
                default:
                    return array(
                        'hoverColor' => $level1HoverColor,
                        'showHoverUnderline' => $level1ShowHoverUnderline,
                        'underlineWidth' => $level1UnderlineWidth,
                        'underlineColor' => $level1UnderlineColor,
                        'underlineBorderRadius' => $level1UnderlineBorderRadius,
                        'fontSize' => $level1FontSize,
                        'fontWeight' => $level1FontWeight,
                        'fontColor' => $level1FontColor,
                    );
            }
        };

        // Find canvas image heights for CSS variables
        $canvasImageHeightDesktop = '200px';
        $canvasImageHeightTablet = '150px';
        $canvasImageHeightMobile = '120px';
        foreach ($menu_items as $item) {
            if (isset($item['canvasImageHeight']['desktop'])) {
                $canvasImageHeightDesktop = ($item['canvasImageHeight']['desktop']['value'] ?? 200) . ($item['canvasImageHeight']['desktop']['unit'] ?? 'px');
                break;
            }
        }
        foreach ($menu_items as $item) {
            if (isset($item['canvasImageHeight']['tablet'])) {
                $canvasImageHeightTablet = ($item['canvasImageHeight']['tablet']['value'] ?? 150) . ($item['canvasImageHeight']['tablet']['unit'] ?? 'px');
                break;
            }
        }
        foreach ($menu_items as $item) {
            if (isset($item['canvasImageHeight']['mobile'])) {
                $canvasImageHeightMobile = ($item['canvasImageHeight']['mobile']['value'] ?? 120) . ($item['canvasImageHeight']['mobile']['unit'] ?? 'px');
                break;
            }
        }

        // Build CSS variables
        $styles = array(
            '--mega-menu-bg-color' => $backgroundColor,
            '--mega-menu-text-color' => $textColor,
            '--mega-menu-hover-color' => $hoverColor,
            '--mega-menu-active-color' => $activeColor,
            '--mega-menu-font-size' => $fontSize . 'px',
            '--mega-menu-font-weight' => $fontWeight,
            '--mega-menu-bold-weight' => $boldWeight,
            '--mega-menu-font-family' => $fontFamily,
            '--mega-menu-underline-color' => $underlineColor,
            '--mega-menu-padding-top' => ($padding['top'] ?? 20) . 'px',
            '--mega-menu-padding-right' => ($padding['right'] ?? 20) . 'px',
            '--mega-menu-padding-bottom' => ($padding['bottom'] ?? 20) . 'px',
            '--mega-menu-padding-left' => ($padding['left'] ?? 20) . 'px',
            '--mega-menu-margin-top' => ($margin['top'] ?? 0) . 'px',
            '--mega-menu-margin-right' => ($margin['right'] ?? 0) . 'px',
            '--mega-menu-margin-bottom' => ($margin['bottom'] ?? 0) . 'px',
            '--mega-menu-margin-left' => ($margin['left'] ?? 0) . 'px',
            '--mega-menu-border-radius' => $menuCanvasBorderRadius . 'px',
            '--mega-menu-menu-border-radius' => $menuBorderRadius . 'px',
            '--canvas-image-desktop-height' => $canvasImageHeightDesktop,
            '--canvas-image-tablet-height' => $canvasImageHeightTablet,
            '--canvas-image-mobile-height' => $canvasImageHeightMobile,
            '--mega-menu-logo-size' => $logo_size . 'px',
            '--container-max-width' => ($containerMaxWidth['desktop']['value'] ?? 1200) . ($containerMaxWidth['desktop']['unit'] ?? 'px'),
            '--container-max-width-tablet' => ($containerMaxWidth['tablet']['value'] ?? 100) . ($containerMaxWidth['tablet']['unit'] ?? '%'),
            '--container-max-width-mobile' => ($containerMaxWidth['mobile']['value'] ?? 100) . ($containerMaxWidth['mobile']['unit'] ?? '%'),
            // Dropdown panels span the full navbar width and stay centered
            // under it rather than pinned to the right edge (see __menu in
            // style.scss) — capped to the same width as the navbar's own
            // content when the menu is in "constrained" mode, unconstrained
            // (edge-to-edge) otherwise, so the panel never reads wider than
            // the nav bar it drops from.
            '--mega-menu-dropdown-max-width' => ($containerMode === 'constrained')
                ? ($containerMaxWidth['desktop']['value'] ?? 1200) . ($containerMaxWidth['desktop']['unit'] ?? 'px')
                : 'none',
            '--mobile-menu-bg' => $mobileMenuBgColor,
            '--mobile-level1-font-size' => $mobileLevel1FontSize . 'px',
            '--mobile-level1-font-weight' => $mobileLevel1FontWeight,
            '--mobile-level1-font-color' => $mobileLevel1FontColor,
            '--mobile-level2-font-size' => $mobileLevel2FontSize . 'px',
            '--mobile-level2-font-weight' => $mobileLevel2FontWeight,
            '--mobile-level2-font-color' => $mobileLevel2FontColor,
            '--mobile-level3-font-size' => $mobileLevel3FontSize . 'px',
            '--mobile-level3-font-weight' => $mobileLevel3FontWeight,
            '--mobile-level3-font-color' => $mobileLevel3FontColor,
            '--mobile-menu-item-bg' => $mobileMenuItemBgColor,
            '--mobile-menu-item-hover-bg' => $mobileMenuItemHoverBgColor,
            '--mobile-chevron-size' => $mobileChevronSize . 'px',
            '--mobile-chevron-color' => $mobileChevronColor,
            '--mobile-menu-icon-color' => $mobileMenuIconColor,
            '--mobile-menu-icon-color-scroll' => $mobileMenuIconColorScroll ?: $mobileMenuIconColor,
            '--mobile-menu-icon-color-current' => $mobileMenuIconColor,
            '--level1-hover-bg-color' => $level1HoverBgColor,
            '--level1-hover-padding-top' => ($level1HoverPadding['top'] ?? 10) . 'px',
            '--level1-hover-padding-right' => ($level1HoverPadding['right'] ?? 5) . 'px',
            '--level1-hover-padding-bottom' => ($level1HoverPadding['bottom'] ?? 10) . 'px',
            '--level1-hover-padding-left' => ($level1HoverPadding['left'] ?? 5) . 'px',
            '--level1-hover-border-radius' => $level1HoverBorderRadius . 'px',
            '--level2-hover-bg-color' => $level2HoverBgColor,
            '--level2-hover-padding-top' => ($level2HoverPadding['top'] ?? 8) . 'px',
            '--level2-hover-padding-right' => ($level2HoverPadding['right'] ?? 12) . 'px',
            '--level2-hover-padding-bottom' => ($level2HoverPadding['bottom'] ?? 8) . 'px',
            '--level2-hover-padding-left' => ($level2HoverPadding['left'] ?? 12) . 'px',
            '--level2-header-spacing' => $level2HeaderSpacing . 'px',
            '--level3-hover-bg-color' => $level3HoverBgColor,
            '--level3-hover-padding-top' => ($level3HoverPadding['top'] ?? 8) . 'px',
            '--level3-hover-padding-right' => ($level3HoverPadding['right'] ?? 12) . 'px',
            '--level3-hover-padding-bottom' => ($level3HoverPadding['bottom'] ?? 8) . 'px',
            '--level3-hover-padding-left' => ($level3HoverPadding['left'] ?? 12) . 'px',
            '--level3-item-spacing' => $level3ItemSpacing . 'px',
            '--menu-items-underline-color-top' => $menuItemsUnderlineColorTop ?? $level1UnderlineColor,
            '--menu-items-underline-color-scroll' => $menuItemsUnderlineColorScroll ?? $level1UnderlineColor,
            '--ribbon-bg-color' => $ribbonBackgroundColor,
            '--ribbon-text-color' => $ribbonTextColor,
            '--ribbon-font-size' => $ribbonFontSize . 'px',
            '--ribbon-font-weight' => $ribbonFontWeight,
            '--ribbon-link-color' => $ribbonLinkColor,
            '--ribbon-link-font-weight' => $ribbonLinkFontWeight ?? '600',
            '--ribbon-link-underline' => ($ribbonLinkUnderline !== false) ? 'underline' : 'none',
            '--ribbon-link-underline-color' => $ribbonLinkUnderlineColor,
            '--ribbon-link-underline-width' => $ribbonLinkUnderlineWidth . 'px',
            '--ribbon-height' => $ribbonHeight . 'px',
            '--mega-menu-navbar-offset' => $ribbonEnabled ? $ribbonHeight . 'px' : '0px',
            '--ribbon-padding-top' => $ribbonPaddingTop . 'px',
            '--ribbon-padding-bottom' => $ribbonPaddingBottom . 'px',
            '--ribbon-link-arrow-color' => ( '' !== $ribbonLinkArrowColor ) ? $ribbonLinkArrowColor : $ribbonLinkColor,
            '--ribbon-link-arrow-size' => max( 1, $ribbonLinkArrowSize ) . 'px',
            '--ribbon-link-arrow-rotate' => $ribbonLinkArrowRotation . 'deg',
            '--mega-menu-dropdown-top' => $menuDropdownOffset . 'px',
            '--cta-button-color-top' => $ctaButtonColor,
            '--cta-button-color-scroll' => $ctaButtonColorScroll ?: $ctaButtonColor,
            '--cta-button-bg-top' => $ctaButtonBackgroundColor,
            '--cta-button-bg-scroll' => $ctaButtonBackgroundColorScroll ?: $ctaButtonBackgroundColor,
            '--cta-button-border-color-top' => $ctaButtonBorderColor,
            '--cta-button-border-color-scroll' => $ctaButtonBorderColorScroll ?: $ctaButtonBorderColor,
            '--cta-button-hover-color-top' => $ctaButtonHoverColor,
            '--cta-button-hover-color-scroll' => $ctaButtonHoverColorScroll ?: $ctaButtonHoverColor,
            '--cta-button-hover-bg-top' => $ctaButtonHoverBackgroundColor ?: $ctaButtonBackgroundColor,
            '--cta-button-hover-bg-scroll' => $ctaButtonHoverBackgroundColorScroll ?: $ctaButtonHoverBackgroundColor ?: $ctaButtonBackgroundColor,
            '--cta-button-hover-border-color-top' => $ctaButtonHoverBorderColor ?: $ctaButtonBorderColor,
            '--cta-button-hover-border-color-scroll' => $ctaButtonHoverBorderColorScroll ?: $ctaButtonHoverBorderColor ?: $ctaButtonBorderColor,
            '--cta-button-underline-color' => $ctaButtonUnderlineColor,
            '--cta-button-font-size' => $ctaButtonFontSize . 'px',
            '--cta-button-font-weight-top' => $ctaButtonFontWeight,
            '--cta-button-font-weight-scroll' => $ctaButtonFontWeight,
            '--cta-button-blur' => $ctaButtonBlurAmount . 'px',
            '--cta-button-border-radius' => $ctaButtonBorderRadius . 'px',
            '--cta-button-border-width' => $ctaButtonBorderWidth . 'px',
            '--cta-button-border-style' => $ctaButtonBorderStyle,
            '--cta-button-padding-top' => $ctaButtonPadding['top'] ?? '10px',
            '--cta-button-padding-right' => $ctaButtonPadding['right'] ?? '24px',
            '--cta-button-padding-bottom' => $ctaButtonPadding['bottom'] ?? '10px',
            '--cta-button-padding-left' => $ctaButtonPadding['left'] ?? '24px',
            '--cta-button-margin-top' => $ctaButtonMargin['top'] ?? '0px',
            '--cta-button-margin-right' => $ctaButtonMargin['right'] ?? '0px',
            '--cta-button-margin-bottom' => $ctaButtonMargin['bottom'] ?? '0px',
            '--cta-button-margin-left' => $ctaButtonMargin['left'] ?? '0px',
            '--cta-button-color-current' => $ctaButtonColor,
            '--cta-button-bg-current' => $ctaButtonBackgroundColor,
            '--cta-button-border-color-current' => $ctaButtonBorderColor,
            '--cta-button-hover-color-current' => $ctaButtonHoverColor,
            '--cta-button-hover-bg-current' => $ctaButtonHoverBackgroundColor ?: $ctaButtonBackgroundColor,
            '--cta-button-hover-border-color-current' => $ctaButtonHoverBorderColor ?: $ctaButtonBorderColor,
            '--cta-mobile-button-color' => $ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonColor !== '' ? $ctaMobileButtonColor : ($ctaButtonColorScroll ?: $ctaButtonColor ?: '#111111'))
                : ($ctaButtonColorScroll ?: $ctaButtonColor ?: '#111111'),
            '--cta-mobile-button-bg' => $ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonBackgroundColor !== '' ? $ctaMobileButtonBackgroundColor : ($ctaButtonBackgroundColorScroll ?: $ctaButtonBackgroundColor ?: 'transparent'))
                : ($ctaButtonBackgroundColorScroll ?: $ctaButtonBackgroundColor ?: 'transparent'),
            '--cta-mobile-button-border-color' => $ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonBorderColor !== '' ? $ctaMobileButtonBorderColor : ($ctaButtonBorderColorScroll ?: $ctaButtonBorderColor ?: '#111111'))
                : ($ctaButtonBorderColorScroll ?: $ctaButtonBorderColor ?: '#111111'),
            '--cta-mobile-button-hover-color' => $ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonHoverColor !== '' ? $ctaMobileButtonHoverColor : ($ctaButtonHoverColorScroll ?: $ctaButtonHoverColor ?: '#ffffff'))
                : ($ctaButtonHoverColorScroll ?: $ctaButtonHoverColor ?: '#ffffff'),
            '--cta-mobile-button-hover-bg' => $ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonHoverBackgroundColor !== '' ? $ctaMobileButtonHoverBackgroundColor : ($ctaButtonHoverBackgroundColorScroll ?: $ctaButtonHoverBackgroundColor ?: $ctaButtonBackgroundColor ?: 'transparent'))
                : ($ctaButtonHoverBackgroundColorScroll ?: $ctaButtonHoverBackgroundColor ?: $ctaButtonBackgroundColor ?: 'transparent'),
            '--cta-mobile-button-hover-border-color' => $ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonHoverBorderColor !== '' ? $ctaMobileButtonHoverBorderColor : ($ctaButtonHoverBorderColorScroll ?: $ctaButtonHoverBorderColor ?: $ctaButtonBorderColor))
                : ($ctaButtonHoverBorderColorScroll ?: $ctaButtonHoverBorderColor ?: $ctaButtonBorderColor),
            '--cta-mobile-button-border-radius' => ($ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonBorderRadius ?? $ctaButtonBorderRadius ?? 999)
                : ($ctaButtonBorderRadius ?? 999)) . 'px',
            '--cta-mobile-button-border-width' => ($ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonBorderWidth ?? $ctaButtonBorderWidth ?? 1)
                : ($ctaButtonBorderWidth ?? 1)) . 'px',
            '--cta-mobile-button-padding-top' => $ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonPadding['top'] ?? $ctaButtonPadding['top'] ?? '10px')
                : ($ctaButtonPadding['top'] ?? '10px'),
            '--cta-mobile-button-padding-right' => $ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonPadding['right'] ?? $ctaButtonPadding['right'] ?? '24px')
                : ($ctaButtonPadding['right'] ?? '24px'),
            '--cta-mobile-button-padding-bottom' => $ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonPadding['bottom'] ?? $ctaButtonPadding['bottom'] ?? '10px')
                : ($ctaButtonPadding['bottom'] ?? '10px'),
            '--cta-mobile-button-padding-left' => $ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonPadding['left'] ?? $ctaButtonPadding['left'] ?? '24px')
                : ($ctaButtonPadding['left'] ?? '24px'),
            '--cta-mobile-button-font-size' => ($ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonFontSize ?? $ctaButtonFontSize ?? 16)
                : ($ctaButtonFontSize ?? 16)) . 'px',
            '--cta-mobile-button-font-weight' => $ctaMobileUseSeparateStyles
                ? ($ctaMobileButtonFontWeight !== '' ? $ctaMobileButtonFontWeight : ($ctaButtonFontWeight ?? '600'))
                : ($ctaButtonFontWeight ?? '600'),
            '--menu-panel-gap' => ($menuPanelGap ?? 16) . 'px',
            '--menu-panel-padding-bottom' => ($menuPanelPaddingBottom ?? 16) . 'px',
            '--canvas-banner-bg-color' => $canvasBannerBackgroundColor ?: '#ff3131',
            '--canvas-banner-width' => ($canvasBannerWidth ?? 100) . '%',
            '--canvas-banner-padding-top' => ($canvasBannerPaddingTop ?? 10) . 'px',
            '--canvas-banner-padding-bottom' => ($canvasBannerPaddingBottom ?? 10) . 'px',
            '--canvas-banner-padding-left' => ($canvasBannerPaddingLeft ?? 20) . 'px',
            '--canvas-banner-padding-right' => ($canvasBannerPaddingRight ?? 20) . 'px',
            '--canvas-banner-title-font-size' => ($canvasBannerTitleFontSize ?? 30) . 'px',
            '--canvas-banner-title-color' => $canvasBannerTitleColor ?: '#ffffff',
            '--canvas-banner-title-font-weight' => $canvasBannerTitleFontWeight ?: '300',
            '--canvas-banner-description-font-size' => ($canvasBannerDescriptionFontSize ?? 20) . 'px',
            '--canvas-banner-description-color' => $canvasBannerDescriptionColor ?: '#ffffff',
            '--canvas-banner-description-font-weight' => $canvasBannerDescriptionFontWeight ?: '300',
            '--canvas-list-padding-left' => ($canvasListPaddingLeft ?? 20) . 'px',
            '--canvas-list-padding-right' => ($canvasListPaddingRight ?? 20) . 'px',
            '--canvas-story-title-font-size' => ($canvasStoryTitleFontSize ?? 28) . 'px',
            '--canvas-story-title-font-weight' => $canvasStoryTitleFontWeight ?? '600',
            '--canvas-story-title-color' => $canvasStoryTitleColor ?? '#1a1a1a',
            '--canvas-story-title-margin-top' => ($canvasStoryTitleMarginTop ?? 0) . 'px',
            '--canvas-story-title-margin-bottom' => ($canvasStoryTitleMarginBottom ?? 12) . 'px',
            '--canvas-story-description-font-size' => ($canvasStoryDescriptionFontSize ?? 16) . 'px',
            '--canvas-story-description-font-weight' => $canvasStoryDescriptionFontWeight ?? '400',
            '--canvas-story-description-color' => $canvasStoryDescriptionColor ?? '#3d3d3d',
            '--canvas-story-description-margin-top' => ($canvasStoryDescriptionMarginTop ?? 12) . 'px',
            '--canvas-story-description-margin-bottom' => ($canvasStoryDescriptionMarginBottom ?? 16) . 'px',
            '--canvas-story-link-font-size' => ($canvasStoryLinkFontSize ?? 15) . 'px',
            '--canvas-story-link-font-weight' => $canvasStoryLinkFontWeight ?? '600',
            '--canvas-story-link-color' => $canvasStoryLinkColor ?? '#4b2aad',
            '--canvas-story-link-margin-top' => ($canvasStoryLinkMarginTop ?? 6) . 'px',
            '--canvas-story-link-margin-bottom' => ($canvasStoryLinkMarginBottom ?? 0) . 'px',
            '--canvas-story-link-hover-color' => $canvasStoryLinkHoverColor ?? $canvasStoryLinkColor ?? '#4b2aad',
            '--canvas-story-link-underline-color' => $canvasStoryLinkUnderlineColor ?? $canvasStoryLinkColor ?? '#4b2aad',
            '--canvas-story-link-underline-height' => ($canvasStoryLinkUnderlineHeight ?? 2) . 'px',
            '--canvas-story-link-underline-radius' => ($canvasStoryLinkUnderlineBorderRadius ?? 0) . 'px',
            '--canvas-story-divider-width' => ($canvasStoryDividerWidth ?? 2) . 'px',
            '--canvas-story-divider-height' => ($canvasStoryDividerHeight ?? 70) . '%',
            '--canvas-story-divider-color' => adaire_blocks_hex_to_rgba(
                $canvasStoryDividerColor ?? '#d7d7d7',
                $canvasStoryDividerAlpha ?? 0.4
            ),
        );

        // Build immersive mode background CSS
        $immersive_bg = '';
        if ($mobileImmersiveMode) {
            switch ($mobileImmersiveBgType) {
                case 'solid':
                    $immersive_bg = $mobileImmersiveBgColor;
                    break;
                case 'gradient':
                    if ($mobileImmersiveGradientType === 'linear') {
                        $immersive_bg = sprintf(
                            'linear-gradient(%ddeg, %s %d%%, %s %d%%)',
                            $mobileImmersiveGradientAngle,
                            $mobileImmersiveGradientColor1,
                            $mobileImmersiveGradientStartStop,
                            $mobileImmersiveGradientColor2,
                            $mobileImmersiveGradientEndStop
                        );
                    } else {
                        $immersive_bg = sprintf(
                            'radial-gradient(circle, %s %d%%, %s %d%%)',
                            $mobileImmersiveGradientColor1,
                            $mobileImmersiveGradientStartStop,
                            $mobileImmersiveGradientColor2,
                            $mobileImmersiveGradientEndStop
                        );
                    }
                    break;
                case 'image':
                    if ($mobileImmersiveBgImage) {
                        $immersive_bg = sprintf(
                            "url('%s')",
                            esc_url($mobileImmersiveBgImage)
                        );
                        $styles['--immersive-bg-size'] = $mobileImmersiveBgImageSize;
                        $styles['--immersive-bg-position'] = $mobileImmersiveBgImagePosition;
                    }
                    break;
                case 'image-overlay':
                    if ($mobileImmersiveBgImage) {
                        $immersive_bg = sprintf(
                            "url('%s')",
                            esc_url($mobileImmersiveBgImage)
                        );
                        $styles['--immersive-bg-size'] = $mobileImmersiveBgImageSize;
                        $styles['--immersive-bg-position'] = $mobileImmersiveBgImagePosition;
                        $overlay_rgba = adaire_blocks_hex_to_rgba(
                            $mobileImmersiveOverlayColor,
                            $mobileImmersiveOverlayOpacity
                        );
                        $styles['--immersive-overlay-bg'] = $overlay_rgba;
                        $styles['--immersive-overlay-opacity'] = (string)$mobileImmersiveOverlayOpacity;
                    }
                    break;
            }
            if ($immersive_bg) {
                $styles['--immersive-bg'] = $immersive_bg;
            }
            // Add immersive mode icon and button row variables
            $styles['--immersive-icon-size'] = $mobileImmersiveIconSize . 'px';
            $styles['--immersive-icon-color'] = $mobileImmersiveIconColor;
            
            // Helper function to normalize padding values (handle both numbers and strings with/without units)
            $normalizePadding = function($value, $default = 0) {
                if ($value === null || $value === '') {
                    return $default . 'px';
                }
                // If it's already a string with units, return as is
                if (is_string($value) && preg_match('/^\d+(\.\d+)?(px|em|rem|%|vh|vw)$/i', $value)) {
                    return $value;
                }
                // If it's a number or numeric string, append px
                $num = is_numeric($value) ? floatval($value) : floatval(preg_replace('/[^0-9.-]/', '', $value));
                return $num . 'px';
            };
            
            $styles['--immersive-button-row-padding-top'] = $normalizePadding($mobileImmersiveButtonRowPadding['top'] ?? null, 0);
            $styles['--immersive-button-row-padding-right'] = $normalizePadding($mobileImmersiveButtonRowPadding['right'] ?? null, 0);
            $styles['--immersive-button-row-padding-bottom'] = $normalizePadding($mobileImmersiveButtonRowPadding['bottom'] ?? null, 32);
            $styles['--immersive-button-row-padding-left'] = $normalizePadding($mobileImmersiveButtonRowPadding['left'] ?? null, 0);
        }

        $style_string = '';
        foreach ($styles as $prop => $value) {
            $style_string .= esc_attr($prop) . ':' . esc_attr($value) . ';';
        }

        $render_cta_button = function( $extra_class = '', $is_mobile = false ) use (
            $ctaButtonEnabled,
            $ctaButtonText,
            $ctaButtonLink,
            $ctaButtonOpenInNewTab,
            $ctaButtonShowIcon,
            $ctaButtonStyle,
            $ctaButtonHoverAnimation,
            $ctaMobileUseSeparateStyles,
            $ctaMobileButtonStyle,
            $ctaMobileButtonHoverAnimation,
            $ctaMobileButtonShowIcon
        ) {
            if ( ! $ctaButtonEnabled ) {
                return '';
            }

            $button_style = $ctaButtonStyle ?: 'underline';
            $hover_animation = $ctaButtonHoverAnimation ?: 'none';
            $show_icon = $ctaButtonShowIcon !== false;

            if ( $is_mobile && $ctaMobileUseSeparateStyles ) {
                if ( ! empty( $ctaMobileButtonStyle ) && 'inherit' !== $ctaMobileButtonStyle ) {
                    $button_style = $ctaMobileButtonStyle;
                }
                if ( ! empty( $ctaMobileButtonHoverAnimation ) && 'inherit' !== $ctaMobileButtonHoverAnimation ) {
                    $hover_animation = $ctaMobileButtonHoverAnimation;
                }
                $show_icon = $ctaMobileButtonShowIcon !== false;
            }

            if ( ! $button_style || 'inherit' === $button_style ) {
                $button_style = $ctaButtonStyle ?: 'underline';
            }

            if ( ! $hover_animation ) {
                $hover_animation = 'none';
            }

            $classes = array(
                'adaire-mega-menu__action-button',
            );

            $classes[] = 'adaire-mega-menu__action-button--' . sanitize_html_class( $button_style );

            if ( $hover_animation && 'none' !== $hover_animation ) {
                $classes[] = 'adaire-mega-menu__action-button--' . sanitize_html_class( $hover_animation );
            }

            if ( ! empty( $extra_class ) ) {
                $classes[] = $extra_class;
            }

            ob_start();
            ?>
            <a
                class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
                href="<?php echo esc_url( $ctaButtonLink ?: '#' ); ?>"
                <?php if ( $ctaButtonOpenInNewTab ) : ?>
                    target="_blank" rel="noopener noreferrer"
                <?php endif; ?>
            >
                <span class="adaire-mega-menu__action-button-label">
                    <?php echo esc_html( $ctaButtonText ); ?>
                </span>
                <?php if ( $show_icon ) : ?>
                    <span class="adaire-mega-menu__action-button-icon" aria-hidden="true">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7 17L17 7M17 7H7M17 7V17"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </span>
                <?php endif; ?>
            </a>
            <?php
            return ob_get_clean();
        };

        ob_start();
        $root_classes = array(
            'adaire-mega-menu',
            'wp-block-create-block-mega-menu-block',
            'testagain',
        );

        if ( $level2HoverTextColorEnabled ) {
            $root_classes[] = 'adaire-mega-menu--level2-hover-text';
        }

        ?>
        <div class="<?php echo esc_attr( implode( ' ', $root_classes ) ); ?>" 
             style="<?php echo esc_attr($style_string); ?>"
             data-block-id="<?php echo esc_attr($block_id); ?>"
             data-sticky="<?php echo esc_attr($isSticky ? 'true' : 'false'); ?>"
             data-keep-canvas-open="<?php echo esc_attr($keepCanvasOpenOnClick ? 'true' : 'false'); ?>"
             data-increase-opacity="<?php echo esc_attr($increaseOpacity ? 'true' : 'false'); ?>"
             data-scroll-bg-color="<?php echo esc_attr($scrollBackgroundColor); ?>"
             data-menu-item-color-top="<?php echo esc_attr($menuItemsColorTop); ?>"
            data-menu-items-color-scroll="<?php echo esc_attr($menuItemsColorScroll); ?>"
            data-menu-items-underline-color-top="<?php echo esc_attr($menuItemsUnderlineColorTop); ?>"
            data-menu-items-underline-color-scroll="<?php echo esc_attr($menuItemsUnderlineColorScroll); ?>"
             data-menu-image-at-top="<?php echo esc_attr($menuImageAtTop); ?>"
             data-menu-image-on-scroll="<?php echo esc_attr($menuImageOnScroll); ?>">
            <div class="adaire-mega-menu__container testagain">
                <?php if ( $ribbonEnabled ) : ?>
                    <div class="adaire-mega-menu__ribbon">
                        <div class="adaire-mega-menu__ribbon-content">
                            <span class="adaire-mega-menu__ribbon-text"><?php echo esc_html( $ribbonText ); ?></span>
                            <?php if ( ! empty( $ribbonLinkUrl ) ) : ?>
                                <a class="adaire-mega-menu__ribbon-link" href="<?php echo esc_url( $ribbonLinkUrl ); ?>" <?php if ( $ribbonLinkOpenInNewTab ) : ?>target="_blank" rel="noopener noreferrer"<?php endif; ?>>
                                    <span class="adaire-mega-menu__ribbon-link-label"><?php echo esc_html( $ribbonLinkLabel ?: __( 'Learn more', 'mega-menu-block' ) ); ?></span>
                                    <?php if ( $ribbonLinkArrowEnabled ) : ?>
                                        <span class="adaire-mega-menu__ribbon-link-arrow" aria-hidden="true">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                                        </span>
                                    <?php endif; ?>
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endif; ?>
                <nav class="adaire-mega-menu__navbar <?php echo ($containerMode === 'constrained' ? 'is-constrained' : ''); ?> <?php echo ($containerMode === 'constrained' && $centerMenu ? 'center-menu' : ''); ?>">
                    <div class="adaire-mega-menu__brand">
                        <a class="adaire-mega-menu__brand-link" href="<?php echo esc_url( $logo_link_url ?: '/' ); ?>">
                            <?php if ($menuImageAtTop): ?>
                                <img src="<?php echo esc_url($menuImageAtTop); ?>" 
                                     alt="<?php echo esc_attr($menuImageAtTopAlt); ?>" 
                                     class="adaire-mega-menu__menu-image adaire-mega-menu__menu-image--top"
                                     style="--mega-menu-image-size: <?php echo esc_attr($menuImageSize); ?>px;">
                            <?php endif; ?>
                            <?php if ($menuImageOnScroll): ?>
                                <img src="<?php echo esc_url($menuImageOnScroll); ?>" 
                                     alt="<?php echo esc_attr($menuImageOnScrollAlt); ?>" 
                                     class="adaire-mega-menu__menu-image adaire-mega-menu__menu-image--scroll"
                                     style="--mega-menu-image-size: <?php echo esc_attr($menuImageSize); ?>px;">
                            <?php endif; ?>
                            <?php if (!$menuImageAtTop && !$menuImageOnScroll): ?>
                                <?php if ($logo_url): ?>
                                    <img src="<?php echo esc_url($logo_url); ?>" 
                                         alt="<?php echo esc_attr($logo_alt); ?>" 
                                         class="adaire-mega-menu__logo">
                                <?php else: ?>
                                    <span class="adaire-mega-menu__brand-text">Brand</span>
                                <?php endif; ?>
                            <?php endif; ?>
                        </a>
                    </div>

                    <div class="adaire-mega-menu__menu-container">
                        <ul class="adaire-mega-menu__mega-menu">
                            <?php
                            foreach ( $menu_items as $item ) :
                                $level0Colors                   = $getLevelColors( 0 );
                                $item_id                        = $item['id'] ?? '';
                                $item_title                     = $item['title'] ?? '';
                                $item_url                       = $item['url'] ?? '#';
                                $item_is_bold                   = $item['isBold'] ?? false;
                                $item_open_in_new_tab           = $item['openInNewTab'] ?? false;
                                $item_children                  = $item['children'] ?? array();
                                $item_canvas_image_url          = $item['canvasImageUrl'] ?? '';
                                $item_canvas_image_alt          = $item['canvasImageAlt'] ?? 'Canvas Image';
                                $item_canvas_image_position     = $item['canvasImagePosition'] ?? 'left';
                                $item_canvas_image_width        = $item['canvasImageWidth'] ?? array(
                                    'desktop' => array(
                                        'value' => 300,
                                        'unit'  => 'px',
                                    ),
                                );
                                $item_canvas_image_height       = $item['canvasImageHeight'] ?? array(
                                    'desktop' => array(
                                        'value' => 200,
                                        'unit'  => 'px',
                                    ),
                                );
                                $item_banner_description        = $item['bannerDescription'] ?? '';
                                $item_canvas_story_title        = $item['canvasStoryTitle'] ?? '';
                                $item_canvas_story_description  = $item['canvasStoryDescription'] ?? '';
                                $item_canvas_story_link_label   = $item['canvasStoryLinkLabel'] ?? '';
                                $item_canvas_story_link_url     = $item['canvasStoryLinkUrl'] ?? '';
                                $item_canvas_story_link_new_tab = $item['canvasStoryLinkOpenInNewTab'] ?? false;
                                $item_canvas_banner_enabled     = array_key_exists( 'canvasBannerEnabled', $item ) ? (bool) $item['canvasBannerEnabled'] : true;
                                $item_canvas_is_smallest        = ! empty( $item['canvasIsSmallest'] );
                                $should_render_canvas_story     = ! empty( $item_canvas_image_url )
                                    || '' !== trim( (string) $item_canvas_story_title )
                                    || '' !== trim( (string) $item_canvas_story_description )
                                    || '' !== trim( (string) $item_canvas_story_link_label );
                                // Opt-in alternative content source: instead of the manual
                                // banner/canvas-story/children fields above, this top-level item
                                // can point at a centrally-managed Mega Panel post (built in the
                                // Mega Menu dashboard) -- same panels adaire/mega-menu-item uses.
                                // is_publicly_usable() is the same guard used everywhere else this
                                // checks a panel id, so a draft/disabled/deleted panel degrades to
                                // "no dropdown" for this item rather than a broken render.
                                $item_content_source = $item['contentSource'] ?? 'manual';
                                $item_panel_id       = absint( $item['panelId'] ?? 0 );
                                $item_uses_panel     = 'panel' === $item_content_source
                                    && $item_panel_id
                                    && class_exists( 'AdaireMegaPanelPostType' )
                                    && class_exists( 'AdaireMegaPanelRenderer' )
                                    && AdaireMegaPanelPostType::is_publicly_usable( $item_panel_id );
                                ?>
                                <li class="adaire-mega-menu__dropdown">
                                    <a href="<?php echo esc_url( $item_url ); ?>" 
                                        class="adaire-mega-menu__dropdown-header"
                                        <?php
                                        if ( $item_open_in_new_tab ) :
                                            ?>
                                            target="_blank" rel="noopener noreferrer"<?php endif; ?>
                                        style="font-size: <?php echo esc_attr( $level0Colors['fontSize'] ); ?>px; font-weight: <?php echo esc_attr( $level0Colors['fontWeight'] ); ?>; --item-color: <?php echo esc_attr( $level0Colors['fontColor'] ); ?>; --item-hover-color: <?php echo esc_attr( $level0Colors['hoverColor'] ); ?>; --item-underline-color: <?php echo esc_attr( $level0Colors['underlineColor'] ?? '#428aff' ); ?>; --item-underline-width: <?php echo esc_attr( $level0Colors['underlineWidth'] ?? 3 ); ?>px; --item-underline-border-radius: <?php echo esc_attr( $level0Colors['underlineBorderRadius'] ?? 0 ); ?>px; --item-underline-enabled: <?php echo ( $level0Colors['showHoverUnderline'] ? 1 : 0 ); ?>;">
                                        <span class="<?php echo ( $item_is_bold ? 'adaire-mega-menu__bold' : '' ); ?>">
                                            <?php echo esc_html( $item_title ); ?>
                                        </span>
                                        <?php if ( ! empty( $item_children ) || $item_uses_panel ) : ?>
                                            <span class="adaire-mega-menu__chevron">▼</span>
                                        <?php endif; ?>
                                    </a>
                                    <?php if ( ! empty( $item_children ) || $item_uses_panel ) : ?>
                                        <?php if ( $item_uses_panel ) : ?>
                                            <div class="adaire-mega-menu__menu adaire-mega-menu__menu--panel">
                                                <?php echo AdaireMegaPanelRenderer::render( get_post( $item_panel_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- AdaireMegaPanelRenderer::render() escapes every field itself, per its own class docblock. ?>
                                            </div>
                                        <?php else : ?>
                                            <?php
                                            $menu_classes = array( 'adaire-mega-menu__menu' );
                                            if ( ! empty( $item['canvasIsSmaller'] ) ) {
                                                $menu_classes[] = 'smaller';
                                            }
                                            if ( $item_canvas_is_smallest ) {
                                                $menu_classes[] = 'smallest';
                                            }
                                            if ( ! $item_canvas_banner_enabled ) {
                                                $menu_classes[] = 'no-banner';
                                            }
                                            ?>
                                        <div class="<?php echo esc_attr( implode( ' ', $menu_classes ) ); ?>">
                                            <?php if ( $item_canvas_banner_enabled ) : ?>
                                                <div class="adaire-mega-menu__menu__banner">
                                                    <h1 class="adaire-mega-menu__menu__banner__title"><?php echo esc_html( $item_title ); ?></h1>
                                                    <?php if ( ! empty( $item_banner_description ) ) : ?>
                                                        <p class="adaire-mega-menu__menu__banner__description">
                                                            <?php echo esc_html( $item_banner_description ); ?>
                                                        </p>
                                                    <?php endif; ?>
                                                </div>
                                            <?php endif; ?>
                                        <ul class="adaire-mega-menu__menu__list">
                                            <?php if ( $showCanvasTitle ) : ?>
                                                <li>
                                                    <a href="<?php echo esc_url( $item_url ); ?>" 
                                                        style="font-size: <?php echo esc_attr( $canvasFontSize ); ?>px; font-weight: <?php echo esc_attr( $canvasFontWeight ); ?>; color: <?php echo esc_attr( $canvasFontColor ); ?>;">
                                                        <?php echo esc_html( $item_title ); ?>
                                                    </a>
                                                </li>
                                            <?php endif; ?>

                                            <?php foreach ( $item_children as $child ) :
                                                $level1Colors          = $getLevelColors( 1 );
                                                $child_id              = $child['id'] ?? '';
                                                $child_title           = $child['title'] ?? '';
                                                $child_url             = $child['url'] ?? '#';
                                                $child_is_bold         = $child['isBold'] ?? false;
                                                $child_open_in_new_tab = $child['openInNewTab'] ?? false;
                                                $child_children        = $child['children'] ?? array();
                                                ?>
                                                <li class="adaire-mega-menu__sub-dropdown">
                                                    <a href="<?php echo esc_url( $child_url ); ?>" 
                                                        class="adaire-mega-menu__sub-dropdown-header"
                                                        <?php if ( $child_open_in_new_tab ) : ?>target="_blank" rel="noopener noreferrer"<?php endif; ?>
                                                        style="font-size: <?php echo esc_attr( $level1Colors['fontSize'] ); ?>px; font-weight: <?php echo esc_attr( $level1Colors['fontWeight'] ); ?>; --item-color: <?php echo esc_attr( $level1Colors['fontColor'] ); ?>; --item-hover-color: <?php echo esc_attr( $level1Colors['hoverColor'] ); ?>;">
                                                        <span class="<?php echo ( $child_is_bold ? 'adaire-mega-menu__bold' : '' ); ?>">
                                                            <?php echo esc_html( $child_title ); ?>
                                                        </span>
                                                    </a>
                                                    <?php if ( ! empty( $child_children ) ) : ?>
                                                        <ul class="adaire-mega-menu__sub-menu">
                                                            <?php foreach ( $child_children as $grandchild ) :
                                                                $level2Colors               = $getLevelColors( 2 );
                                                                $grandchild_id              = $grandchild['id'] ?? '';
                                                                $grandchild_title           = $grandchild['title'] ?? '';
                                                                $grandchild_url             = $grandchild['url'] ?? '#';
                                                                $grandchild_is_bold         = $grandchild['isBold'] ?? false;
                                                                $grandchild_open_in_new_tab = $grandchild['openInNewTab'] ?? false;
                                                                ?>
                                                                <li>
                                                                    <a href="<?php echo esc_url( $grandchild_url ); ?>" 
                                                                        class="<?php echo ( $grandchild_is_bold ? 'adaire-mega-menu__bold' : '' ); ?>"
                                                                        <?php if ( $grandchild_open_in_new_tab ) : ?>target="_blank" rel="noopener noreferrer"<?php endif; ?>
                                                                        style="font-size: <?php echo esc_attr( $level2Colors['fontSize'] ); ?>px; font-weight: <?php echo esc_attr( $level2Colors['fontWeight'] ); ?>; --item-color: <?php echo esc_attr( $level2Colors['fontColor'] ); ?>; --item-hover-color: <?php echo esc_attr( $level2Colors['hoverColor'] ); ?>; --item-underline-color: <?php echo esc_attr( $level2Colors['underlineColor'] ?? $level3UnderlineColor ); ?>; --item-underline-width: <?php echo esc_attr( $level2Colors['underlineWidth'] ?? $level3UnderlineWidth ); ?>px; --item-underline-border-radius: <?php echo esc_attr( $level2Colors['underlineBorderRadius'] ?? 0 ); ?>px; --item-underline-enabled: <?php echo ( $level2Colors['showHoverUnderline'] ? 1 : 0 ); ?>;">
                                                                        <?php echo esc_html( $grandchild_title ); ?>
                                                                    </a>
                                                                </li>
                                                            <?php endforeach; ?>
                                                        </ul>
                                                    <?php endif; ?>
                                                </li>
                                            <?php endforeach; ?>

                                            <?php if ( $should_render_canvas_story ) : ?>
                                                <?php if ( $canvasStoryDividerEnabled ) : ?>
                                                    <li class="adaire-mega-menu__canvas-divider adaire-mega-menu__canvas-divider--<?php echo esc_attr( $item_canvas_image_position ); ?>" aria-hidden="true"></li>
                                                <?php endif; ?>
                                                <li class="adaire-mega-menu__canvas-story adaire-mega-menu__canvas-story--<?php echo esc_attr( $item_canvas_image_position ); ?>">
                                                    <?php if ( '' !== trim( (string) $item_canvas_story_title ) ) : ?>
                                                        <h3 class="adaire-mega-menu__canvas-story-title">
                                                            <?php echo esc_html( $item_canvas_story_title ); ?>
                                                        </h3>
                                                    <?php endif; ?>

                                                    <?php if ( $item_canvas_image_url ) : ?>
                                                        <div class="adaire-mega-menu__canvas-story-media">
                                                            <img src="<?php echo esc_url( $item_canvas_image_url ); ?>"
                                                                alt="<?php echo esc_attr( $item_canvas_image_alt ); ?>"
                                                                style="width: <?php echo esc_attr( ( $item_canvas_image_width['desktop']['value'] ?? 300 ) . ( $item_canvas_image_width['desktop']['unit'] ?? 'px' ) ); ?>; height: <?php echo esc_attr( ( $item_canvas_image_height['desktop']['value'] ?? 200 ) . ( $item_canvas_image_height['desktop']['unit'] ?? 'px' ) ); ?>; border-radius: <?php echo esc_attr( $canvasImageBorderRadius ); ?>px; object-fit: cover;">
                                                        </div>
                                                    <?php endif; ?>

                                                    <?php if ( '' !== trim( (string) $item_canvas_story_description ) ) : ?>
                                                        <p class="adaire-mega-menu__canvas-story-description">
                                                            <?php echo esc_html( $item_canvas_story_description ); ?>
                                                        </p>
                                                    <?php endif; ?>

                                                    <?php if ( '' !== trim( (string) $item_canvas_story_link_label ) ) : ?>
                                                        <a class="adaire-mega-menu__canvas-story-link"
                                                            href="<?php echo esc_url( $item_canvas_story_link_url ?: '#' ); ?>"
                                                            <?php if ( $item_canvas_story_link_new_tab ) : ?>target="_blank" rel="noopener noreferrer"<?php endif; ?>>
                                                            <?php echo esc_html( $item_canvas_story_link_label ); ?>
                                                        </a>
                                                    <?php endif; ?>
                                                </li>
                                            <?php endif; ?>
                                        </ul>
                                        </div>
                                        <?php endif; ?>

                                    <?php endif; ?>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>

                    <div class="adaire-mega-menu__buttons">
                        <?php echo $render_cta_button(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $render_cta_button() builds its markup with esc_attr()/esc_url()/esc_html() internally. ?>
                        <button class="adaire-mega-menu__menu-btn">
                            <span class="adaire-mega-menu__menu-icon">☰</span>
                        </button>
                    </div>
                </nav>

                <!-- Mobile Menu Overlay -->
                    <div class="adaire-mega-menu__mobile-overlay">
                        <div class="adaire-mega-menu__mobile-container<?php echo $mobileImmersiveMode ? ' immersive-mode' : ''; ?>">
                            <div class="adaire-mega-menu__mobile-content">
                                <!-- Mobile menu content will be dynamically rendered here -->
                            </div>
                            <div class="adaire-mobile-menu__inner-blocks">
                                <?php echo $render_cta_button( 'adaire-mega-menu__action-button--mobile', true ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $render_cta_button() builds its markup with esc_attr()/esc_url()/esc_html() internally. ?>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
            <?php
            return ob_get_clean();
        },
        $content
    );
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
 */
function create_block_gsap_hero_block_block_init() {
	// Check license status first
	$license_manager = AdaireBlocksLicense::get_instance();
	$is_license_active = $license_manager->is_license_active();
	
	// If license is not active, show license notice and limit functionality
	if (!$is_license_active) {
		add_action('admin_notices', 'adaire_blocks_license_notice');
		// Still allow basic blocks to work, but with limitations
	}
	
	// Get settings instance
	$settings = AdaireBlocksSettings::get_instance();
	$block_settings = $settings->get_settings();
	
	// Get available blocks dynamically
	$available_blocks = $settings->get_available_blocks();
	$block_mapping = array();
	
	// Build mapping from available blocks
	foreach ($available_blocks as $settings_key => $block_data) {
		$block_mapping[$settings_key] = $block_data['block_name'];
	}
	
	/**
	 * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
	 * based on the registered block metadata.
	 * Added in WordPress 6.8 to simplify the block metadata registration process added in WordPress 6.7.
	 *
	 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
	 */
	if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		// Filter blocks based on settings before registration
		$manifest_data = require __DIR__ . '/build/blocks-manifest.php';
		$filtered_manifest = array();
		
		foreach ( $manifest_data as $block_name => $block_data ) {
			$block_key = array_search( $block_name, $block_mapping );
			// If block is in mapping and enabled, or if it's a new block not yet in settings (enable by default)
			if ( $block_key !== false ) {
				// Check if enabled in settings, or if not in settings yet (new block - enable by default)
				$is_enabled = isset( $block_settings[ $block_key ] ) ? $block_settings[ $block_key ] : true;
				if ( $is_enabled ) {
					$filtered_manifest[ $block_name ] = $block_data;
				}
			}
		}
		
		// Register enabled blocks individually
		// Use $filtered_manifest as the source so new blocks (not yet in DB settings) are also registered.
		foreach ( $filtered_manifest as $block_name => $block_data ) {
			
			// Check if this is a premium block and license is not active
			$premium_blocks = array(
				'video-hero-block',
				'portfolio-block', 
				'particles-block',
				'services-block',
				'posts-grid-block',
				'project-block',
				'scroll-text-block',
				'questions-block'
			);
			
			if ( in_array( $block_name, $premium_blocks ) && ! $is_license_active ) {
				continue; // Skip premium blocks if license is not active
			}
			
			$block_path = __DIR__ . '/build/' . $block_name;
			
			// Special handling for dynamic blocks (have render callbacks)
			if ( $block_name === 'counter-block' ) {
				register_block_type( $block_path, array(
					'render_callback' => 'render_counter_block'
				) );
			} elseif ( $block_name === 'mega-menu-block' ) {
				register_block_type( $block_path, array(
					'render_callback' => 'render_mega_menu_block'
				) );
			} elseif ( $block_name === 'header-menu-block' ) {
				// Register normally under the current slug.
				register_block_type( $block_path );
				// Backward-compatible alias: this block was renamed from
				// header-block to header-menu-block so its slug matches its
				// display name. It's a dynamic block (render.php), so
				// existing published headers still have
				// `<!-- wp:create-block/header-block -->` baked into
				// post_content — registering that old name too, pointed at
				// the same build folder, keeps them rendering. inserter is
				// explicitly disabled here (redundant with the JS-side alias
				// setting the same thing) so this old name never shows up
				// as a second, duplicate "Header Menu (Free)" card in the
				// block inserter — only the new header-menu-block name does.
				register_block_type( $block_path, array(
					'name'     => 'create-block/header-block',
					'supports' => array(
						'html'            => false,
						'anchor'          => true,
						'customClassName' => true,
						'inserter'        => false,
					),
				) );
			} else {
				// Register block normally
				register_block_type( $block_path );
			}
		}
		return;
	}

	/**
	 * Registers the block(s) metadata from the `blocks-manifest.php` file.
	 * Added to WordPress 6.7 to improve the performance of block type registration.
	 * For WordPress 6.7 and older versions
	 *
	 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
	 */
	
	// Build filtered manifest for WordPress 6.7 and older
	$manifest_data = require __DIR__ . '/build/blocks-manifest.php';
	$filtered_manifest_fallback = array();
	$counter_block_enabled_fallback = false;
	
	foreach ( array_keys( $manifest_data ) as $block_type ) {
		$block_key = array_search( $block_type, $block_mapping );
		if ( $block_key !== false && isset( $block_settings[ $block_key ] ) && $block_settings[ $block_key ] ) {
			if ( $block_type === 'counter-block' ) {
				$counter_block_enabled_fallback = true;
			} else {
				$filtered_manifest_fallback[ $block_type ] = $manifest_data[ $block_type ];
			}
		}
	}
	
	// Register metadata collection (6.7+)
	if ( function_exists( 'wp_register_block_metadata_collection' ) && ! empty( $filtered_manifest_fallback ) ) {
		// Create temp manifest without counter-block
		$temp_manifest_path_fallback = __DIR__ . '/build/blocks-manifest-fallback.php';
		file_put_contents( $temp_manifest_path_fallback, '<?php return ' . var_export( $filtered_manifest_fallback, true ) . ';' );
		
		wp_register_block_metadata_collection( __DIR__ . '/build', $temp_manifest_path_fallback );
		
		// Clean up
		if ( file_exists( $temp_manifest_path_fallback ) ) {
			unlink( $temp_manifest_path_fallback );
		}
	}
	
	/**
	 * Registers the block type(s) in the `blocks-manifest.php` file.
	 *
	 * @see https://developer.wordpress.org/reference/functions/register_block_type/
	 */
	foreach ( array_keys( $filtered_manifest_fallback ) as $block_type ) {
		// Check if this is a premium block and license is not active
		$premium_blocks = array(
			'video-hero-block',
			'portfolio-block', 
			'particles-block',
			'services-block',
			'posts-grid-block',
			'project-block',
			'scroll-text-block',
			'questions-block'
		);
		
		if ( in_array( $block_type, $premium_blocks ) && ! $is_license_active ) {
			continue; // Skip premium blocks if license is not active
		}
		
		register_block_type( __DIR__ . "/build/{$block_type}" );

		// Backward-compatible alias for the header-block -> header-menu-block
		// rename (see the matching branch in the WP 6.8+ loop above for the
		// full explanation of why this is needed for a dynamic block).
		if ( $block_type === 'header-menu-block' ) {
			register_block_type( __DIR__ . "/build/{$block_type}", array(
				'name'     => 'create-block/header-block',
				'supports' => array(
					'html'            => false,
					'anchor'          => true,
					'customClassName' => true,
					'inserter'        => false,
				),
			) );
		}
	}

	// Register dynamic blocks separately with render callbacks (for WordPress 6.7 and older)
	$settings_fallback = AdaireBlocksSettings::get_instance();
	$block_settings_fallback = $settings_fallback->get_settings();
	$available_blocks_fallback = $settings_fallback->get_available_blocks();
	$block_mapping_fallback = array();
	
	foreach ( $available_blocks_fallback as $settings_key => $block_data ) {
		$block_mapping_fallback[$settings_key] = $block_data['block_name'];
	}
	
	// Counter block is free, so no license check needed
	if ( $counter_block_enabled_fallback ) {
		register_block_type( __DIR__ . '/build/counter-block', array(
			'render_callback' => 'render_counter_block'
		) );
	}
	
	// Mega menu block (check if enabled)
	$mega_menu_block_key = array_search( 'mega-menu-block', $block_mapping_fallback );
	if ( $mega_menu_block_key !== false && isset( $block_settings_fallback[ $mega_menu_block_key ] ) && $block_settings_fallback[ $mega_menu_block_key ] ) {
		register_block_type( __DIR__ . '/build/mega-menu-block', array(
			'render_callback' => 'render_mega_menu_block'
		) );
	}
}
add_action( 'init', 'create_block_gsap_hero_block_block_init' );

/**
 * Explicitly register row-block and column-block (adaire/ namespace) to ensure they appear in the editor.
 * These blocks use a different namespace than the rest (create-block/) and need direct registration.
 */
add_action( 'init', function() {
	$row_block_path    = __DIR__ . '/build/row-block';
	$column_block_path = __DIR__ . '/build/column-block';

	if ( file_exists( $row_block_path . '/block.json' ) && ! WP_Block_Type_Registry::get_instance()->is_registered( 'adaire/row-block' ) ) {
		register_block_type( $row_block_path );
	}

	if ( file_exists( $column_block_path . '/block.json' ) && ! WP_Block_Type_Registry::get_instance()->is_registered( 'adaire/column-block' ) ) {
		register_block_type( $column_block_path );
	}
}, 12 );

/**
 * Explicitly register adaire/mega-menu-item — an infrastructure block (a
 * Core Navigation child, not a standalone insertable block in most
 * contexts) that should always be available regardless of the free/pro
 * block toggle grid, same reasoning as row-block/column-block above.
 */
add_action(
	'init',
	function () {
		$mega_menu_item_path = __DIR__ . '/build/mega-menu-item';

		if ( file_exists( $mega_menu_item_path . '/block.json' ) && ! WP_Block_Type_Registry::get_instance()->is_registered( 'adaire/mega-menu-item' ) ) {
			register_block_type( $mega_menu_item_path );
		}
	},
	12
);

/**
 * Register plugin-owned navigation menu locations so site owners can assign
 * WordPress menus to them from Appearance > Menus. These power the Header
 * block's "Primary Menu" / "Footer Menu" Navigation Source options (see
 * src/header-menu-block/render.php). Purely additive — does not affect existing
 * block registration or any other plugin behaviour.
 */
add_action( 'init', function() {
	register_nav_menus( array(
		'adaire-blocks-primary' => __( 'Adaire Blocks — Primary Navigation', 'adaire-blocks' ),
		'adaire-blocks-footer'  => __( 'Adaire Blocks — Footer Navigation', 'adaire-blocks' ),
	) );
} );

/**
 * Register plugin-owned widget areas (sidebars) so site owners can place
 * classic widgets into them from Appearance > Widgets. These back the
 * Footer block's "Widget Area" column type (see
 * src/website-footer-block/render.php). Purely additive.
 */
add_action( 'init', function() {
	for ( $i = 1; $i <= 4; $i++ ) {
		register_sidebar( array(
			'id'            => 'adaire-footer-widget-' . $i,
			/* translators: %d: widget area number. */
			'name'          => sprintf( __( 'Adaire Blocks — Footer Widget Area %d', 'adaire-blocks' ), $i ),
			'description'   => __( 'Used by the Adaire Blocks Footer block\'s Widget Area column type.', 'adaire-blocks' ),
			'before_widget' => '<div class="website-footer-block__widget %1$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4 class="website-footer-block__widget-title">',
			'after_title'   => '</h4>',
		) );
	}
} );

/**
 * Register custom block categories for Adaire Blocks (Free, Pro)
 */
function adaire_blocks_register_block_categories( $categories, $editor_context ) {
	$registered_slugs = wp_list_pluck( $categories, 'slug' );

	$custom_categories = array(
		array(
			'slug'  => 'adaire-blocks-pro',
			'title' => __( 'Adaire Blocks PRO', 'adaire-blocks' ),
			'icon'  => null,
		),
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
add_filter( 'block_categories', 'adaire_blocks_register_block_categories', 10, 2 );

// Filter to prevent disabled blocks from appearing in the block editor
add_filter( 'block_editor_rest_api_preload_paths', 'adaire_blocks_filter_block_editor_blocks' );
function adaire_blocks_filter_block_editor_blocks( $preload_paths ) {
	// Get settings
	$settings = AdaireBlocksSettings::get_instance();
	$block_settings = $settings->get_settings();
	$available_blocks = $settings->get_available_blocks();
	
	// Remove disabled blocks from the block editor
	foreach ( $available_blocks as $settings_key => $block_data ) {
		if ( isset( $block_settings[ $settings_key ] ) && ! $block_settings[ $settings_key ] ) {
			// Remove the block from available blocks in the editor
			wp_deregister_script( 'create-block-' . str_replace( '-', '-', $block_data['block_name'] ) );
		}
	}
	
	return $preload_paths;
}

// Filter to prevent disabled blocks from being registered
add_filter( 'register_block_type_args', 'adaire_blocks_prevent_disabled_blocks', 10, 2 );
function adaire_blocks_prevent_disabled_blocks( $args, $name ) {
	// Only filter our blocks
	if ( strpos( $name, 'create-block/' ) !== 0 ) {
		return $args;
	}
	
	// Get settings
	$settings = AdaireBlocksSettings::get_instance();
	$block_settings = $settings->get_settings();
	$available_blocks = $settings->get_available_blocks();
	
	// Find the block key for this block
	$block_name = str_replace( 'create-block/', '', $name );
	$block_key = null;
	
	foreach ( $available_blocks as $settings_key => $block_data ) {
		if ( $block_data['block_name'] === $block_name ) {
			$block_key = $settings_key;
			break;
		}
	}
	
	// If block is disabled, prevent registration by returning empty args
	if ( $block_key && isset( $block_settings[ $block_key ] ) && ! $block_settings[ $block_key ] ) {
		return array();
	}
	
	return $args;
}

// Filter to prevent disabled blocks from being available in the editor
add_action( 'enqueue_block_editor_assets', 'adaire_blocks_filter_editor_blocks' );
function adaire_blocks_filter_editor_blocks() {
	// Get settings
	$settings = AdaireBlocksSettings::get_instance();
	$block_settings = $settings->get_settings();
	$available_blocks = $settings->get_available_blocks();
	
	// Create JavaScript to remove disabled blocks from the editor
	$disabled_blocks = array();
	foreach ( $available_blocks as $settings_key => $block_data ) {
		if ( isset( $block_settings[ $settings_key ] ) && ! $block_settings[ $settings_key ] ) {
			$disabled_blocks[] = 'create-block/' . $block_data['block_name'];
		}
	}
	
	if ( ! empty( $disabled_blocks ) ) {
		wp_add_inline_script( 'wp-blocks', '
			wp.domReady( function() {
				var disabledBlocks = ' . json_encode( $disabled_blocks ) . ';
				disabledBlocks.forEach( function( blockName ) {
					if ( wp.blocks.unregisterBlockType ) {
						wp.blocks.unregisterBlockType( blockName );
					}
				});
			});
		');
	}
}

// Expose the plugin URL to block editor JS so blocks that need to load an
// asset directly (e.g. feature-grid-free's iframe-safe Bootstrap Icons link,
// see src/feature-grid-free/edit.js) can build a local URL instead of hardcoding one.
function adaire_blocks_expose_plugin_url_to_editor() {
	wp_add_inline_script(
		'wp-blocks',
		'window.AdaireBlocksPluginUrl = ' . wp_json_encode( ADAIRE_BLOCKS_PLUGIN_URL ) . ';',
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'adaire_blocks_expose_plugin_url_to_editor', 1 );

// Enqueue Locomotive Scroll assets if the locomotive-block is present on the page
function enqueue_locomotive_scroll_assets() {
    if ( is_admin() ) {
        return;
    }
    global $post;
    if ( ! $post ) {
        return;
    }
    if ( has_block( 'create-block/locomotive-block', $post ) ) {
        // Enqueue Locomotive Scroll JS and CSS from CDN or local
        wp_enqueue_script(
            'locomotive-scroll',
            'https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.js',
            array(),
            '4.1.4',
            true
        );
        wp_enqueue_style(
            'locomotive-scroll',
            'https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.css',
            array(),
            '4.1.4'
        );
    }
}
add_action( 'wp_enqueue_scripts', 'enqueue_locomotive_scroll_assets' );

// Enqueue Bootstrap Icons CSS (bundled locally — see assets/vendor/bootstrap-icons/)
// if any block that uses Bootstrap icons is present on the page.
function enqueue_bootstrap_icons_assets() {
    if ( is_admin() ) {
        return;
    }
    global $post;
    if ( ! $post ) {
        return;
    }
    if (
        has_block( 'create-block/icon-box-block', $post ) ||
        has_block( 'create-block/social-banner-block', $post ) ||
        has_block( 'create-block/industries-block', $post ) ||
        has_block( 'create-block/our-process-block', $post ) ||
        has_block( 'create-block/social-share-block', $post ) ||
        has_block( 'create-block/feature-grid-free', $post ) ||
        has_block( 'create-block/saas-hero-block', $post ) ||
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

// Also enqueue for the block-editor canvas. The canvas renders inside a same-origin
// iframe that WordPress rebuilds from the 'enqueue_block_assets' action (see
// _wp_get_iframed_editor_assets() in wp-includes/block-editor.php) — it deliberately
// does NOT replay 'admin_enqueue_scripts', so a style enqueued there only ever reaches
// the outer wp-admin document, never the iframe where the block's own preview renders.
function enqueue_bootstrap_icons_editor() {
    if ( ! is_admin() ) {
        return;
    }
    wp_enqueue_style(
        'bootstrap-icons',
        ADAIRE_BLOCKS_PLUGIN_URL . 'assets/vendor/bootstrap-icons/bootstrap-icons.min.css',
        array(),
        '1.13.1'
    );
}
add_action( 'enqueue_block_assets', 'enqueue_bootstrap_icons_editor' );

// Hide Gutenberg breadcrumb anchor badges (the ID pill shown in block breadcrumbs).
add_action(
	'enqueue_block_editor_assets',
	function () {
		$css = '.block-editor-block-breadcrumb__anchor{display:none;}';
		wp_add_inline_style( 'wp-edit-blocks', $css );
	},
	20
);

// video-hero-block reads its own config from the block element's data-*
// attributes (see save.js / view.js); no server-side data injection needed.

// Pass block data to frontend for services-block
function enqueue_services_block_data() {
    if ( is_admin() ) {
        return;
    }
    global $post;
    if ( ! $post ) {
        return;
    }
    if ( has_block( 'create-block/services-block', $post ) ) {
        // Get all services-block instances on the page
        $blocks = parse_blocks( $post->post_content );
        $services_blocks = array();
        
        // Recursive function to find blocks in nested structures
        function find_services_blocks($blocks, &$services_blocks) {
            foreach ( $blocks as $block ) {
                if ( $block['blockName'] === 'create-block/services-block' ) {
                    $block_id = $block['attrs']['blockId'] ?? uniqid('services-');
                    // Ensure we have the full attributes array
                    $attrs = $block['attrs'] ?? array();
                    
                    // Process slides to ensure image URLs are properly set
                    if ( isset( $attrs['slides'] ) && is_array( $attrs['slides'] ) ) {
                        foreach ( $attrs['slides'] as $key => $slide ) {
                            // If slideImg is empty or missing but slideImgId exists, convert ID to URL
                            if ( ( empty( $slide['slideImg'] ) || ! isset( $slide['slideImg'] ) ) && ! empty( $slide['slideImgId'] ) && is_numeric( $slide['slideImgId'] ) ) {
                                $image_url = wp_get_attachment_image_url( intval( $slide['slideImgId'] ), 'full' );
                                if ( $image_url ) {
                                    $attrs['slides'][$key]['slideImg'] = $image_url;
                                }
                            }
                            // Ensure slideImgId is an integer
                            if ( isset( $slide['slideImgId'] ) ) {
                                $attrs['slides'][$key]['slideImgId'] = intval( $slide['slideImgId'] );
                            }
                            // Ensure slideImg is a string (can be empty)
                            if ( ! isset( $slide['slideImg'] ) ) {
                                $attrs['slides'][$key]['slideImg'] = '';
                            }
                        }
                    }
                    
                    $services_blocks[$block_id] = $attrs;
                }
                // Recursively search in inner blocks
                if ( ! empty( $block['innerBlocks'] ) ) {
                    find_services_blocks( $block['innerBlocks'], $services_blocks );
                }
            }
        }
        
        find_services_blocks($blocks, $services_blocks);
        
        // Always add the script, even if empty, for debugging
        add_action( 'wp_footer', function() use ($services_blocks) {
            echo '<script>console.log("PHP Debug - services_blocks:", ' . json_encode($services_blocks) . ');</script>';
            echo '<script>console.log("PHP Debug - slides in first block:", ' . json_encode($services_blocks[array_keys($services_blocks)[0]]['slides'] ?? 'NOT FOUND') . ');</script>';
            echo '<script>window.servicesBlockData = ' . json_encode($services_blocks) . ';</script>';
        });
    }
}
add_action( 'wp_enqueue_scripts', 'enqueue_services_block_data' );

// Add REST API endpoint for block data
function register_video_hero_rest_route() {
    register_rest_route('adaire-blocks/v1', '/video-hero-data/(?P<post_id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'get_video_hero_block_data',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'register_video_hero_rest_route');

function get_video_hero_block_data($request) {
    $post_id = $request['post_id'];
    $post = get_post($post_id);
    
    if (!$post) {
        return new WP_Error('post_not_found', 'Post not found', array('status' => 404));
    }
    
    $blocks = parse_blocks($post->post_content);
    $video_hero_blocks = array();
    
    foreach ($blocks as $block) {
        if ($block['blockName'] === 'create-block/video-hero-block') {
            $block_id = $block['attrs']['blockId'] ?? uniqid('video-hero-');
            $video_hero_blocks[$block_id] = $block['attrs'];
        }
    }
    
    return $video_hero_blocks;
}

// Include Posts Grid Block PHP functionality (if file exists)
$posts_grid_render = plugin_dir_path(__FILE__) . 'src/posts-grid-block/render.php';
if (file_exists($posts_grid_render)) {
    require_once $posts_grid_render;
}

// Ensure REST API settings are available on the frontend
function adaire_blocks_add_rest_api_settings() {
	// Only needed on frontend
	if (is_admin()) {
		return;
	}

	// Add REST API settings to the page head
	// This ensures wpApiSettings is always available for our blocks
	?>
	<script>
	if (typeof window.wpApiSettings === 'undefined') {
		window.wpApiSettings = {
			root: <?php echo json_encode(esc_url_raw(rest_url())); ?>,
			nonce: <?php echo json_encode(wp_create_nonce('wp_rest')); ?>,
			versionString: 'wp/v2/'
		};
		console.log('[Adaire Blocks] wpApiSettings initialized:', window.wpApiSettings);
	}
	</script>
	<?php
}
add_action('wp_head', 'adaire_blocks_add_rest_api_settings', 1);

// Auto Block Recovery - Automatically recover blocks on editor load
function adaire_blocks_enqueue_auto_recovery() {
	// Always load in admin, let the script decide if it should run
	if ( ! is_admin() ) {
		return;
	}

	// Check if the auto-recovery file exists
	$script_path = ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/js/auto-block-recovery.js';
	if ( ! file_exists( $script_path ) ) {
		error_log( '[Adaire Blocks] Auto-recovery script not found at: ' . $script_path );
		return;
	}

	// Enqueue the auto-recovery script
	wp_enqueue_script(
		'adaire-auto-block-recovery',
		ADAIRE_BLOCKS_PLUGIN_URL . 'admin/js/auto-block-recovery.js',
		array( 'wp-blocks', 'wp-data', 'wp-block-editor', 'wp-notices', 'wp-element', 'wp-editor' ),
		ADAIRE_BLOCKS_VERSION,
		true // Load in footer to ensure dependencies are loaded
	);

	// Add inline script to verify loading
	$script_url = ADAIRE_BLOCKS_PLUGIN_URL . 'admin/js/auto-block-recovery.js';
	$inline_script = sprintf(
		'console.log("[Adaire Blocks] Inline script executing...");
		console.log("[Adaire Blocks] Version: %s");
		console.log("[Adaire Blocks] Script URL: %s");
		console.log("[Adaire Blocks] Plugin path exists:", %s);
		window.adaireBlocksAutoRecoveryLoaded = true;
		window.adaireBlocksVersion = "%s";',
		esc_js(ADAIRE_BLOCKS_VERSION),
		esc_js($script_url),
		file_exists($script_path) ? 'true' : 'false',
		esc_js(ADAIRE_BLOCKS_VERSION)
	);
	
	wp_add_inline_script(
		'adaire-auto-block-recovery',
		$inline_script,
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'adaire_blocks_enqueue_auto_recovery' );

// Pass block configuration to editor
function adaire_blocks_localize_editor_config() {
	// This hook (enqueue_block_editor_assets) only fires when a block editor
	// is actually active — post editor, Site Editor, or widgets screen — so
	// no extra screen-base gate is needed here. A prior `$screen->base !== 'post'`
	// check excluded the Site Editor (base 'site-editor'), leaving
	// window.adaireBlocksConfig undefined there and breaking every Pro gate
	// that reads it (e.g. testimonial-block's scroll effect) for blocks
	// placed in templates/template parts.

	// Get configuration
	$config = AdaireBlocksConfig::get_instance();
	$plugin_version = $config->get_plugin_version();
	$is_premium = $config->is_premium();
	
	// Build blocks configuration
	$blocks_config = array();
	$available_blocks = $config->get_available_blocks();
	
	foreach ( $available_blocks as $block_name ) {
		$block_config = $config->get_block_config( $block_name );
		$blocks_config[ $block_name ] = array(
			'enabled' => $block_config['enabled'] ?? true,
			'limits' => $config->get_block_limits( $block_name ),
			'upgradeMessage' => $config->get_upgrade_message( $block_name )
		);
	}
	
	// Prepare configuration for JavaScript
	$editor_config = array(
		'isPremium' => $is_premium,
		'pluginVersion' => $plugin_version,
		'blocks'        => $blocks_config,
		'sideloadNonce' => wp_create_nonce( 'adaire_sideload_media' ),
	);
	
	// Localize script with configuration
	wp_localize_script(
		'wp-block-editor',
		'adaireBlocksConfig',
		$editor_config
	);
	
	// Also add to editor settings for useBlockLimits hook
	add_filter( 'block_editor_settings_all', function( $settings ) use ( $editor_config ) {
		$settings['adaireBlocksConfig'] = $editor_config;
		return $settings;
	});
}
add_action( 'enqueue_block_editor_assets', 'adaire_blocks_localize_editor_config' );

// Enqueue custom block icons for admin pages
function adaire_blocks_enqueue_admin_icons() {
	// Only load on admin pages
	if ( ! is_admin() ) {
		return;
	}
	
	// Enqueue the admin icons script
	wp_enqueue_script(
		'adaire-blocks-admin-icons',
		ADAIRE_BLOCKS_PLUGIN_URL . 'admin/js/block-icons-admin.js',
		array(),
		ADAIRE_BLOCKS_VERSION,
		true
	);
	
	// Enqueue the admin icons CSS
	wp_enqueue_style(
		'adaire-blocks-admin-icons',
		ADAIRE_BLOCKS_PLUGIN_URL . 'admin/css/block-icons-admin.css',
		array(),
		ADAIRE_BLOCKS_VERSION
	);
}
add_action( 'admin_enqueue_scripts', 'adaire_blocks_enqueue_admin_icons' );
