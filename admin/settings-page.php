<?php
/**
 * Settings page for GutenBlocks Blocks
 *
 * @package AdaireBlocks
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AdaireBlocksSettings {
    
    private static $instance = null;
    private $option_name = 'adaire_blocks_settings';
    private $settings;
    
    private function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'init_settings'));
        add_action('admin_init', array($this, 'sync_block_registry'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('wp_ajax_adaire_blocks_save_settings', array($this, 'ajax_save_settings'));
        add_action('wp_ajax_adaire_blocks_reset_settings', array($this, 'ajax_reset_settings'));
        add_filter('plugin_action_links', array($this, 'add_plugin_settings_link'), 10, 2);
    }
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        // Custom SVG icon for the admin menu
        // Note: Remove background, use fill="black" for proper WordPress admin menu color handling
        $svg_icon = 'data:image/svg+xml;base64,' . base64_encode('<svg width="20" height="20" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d="M408.523 321.353H163.388V393.981H401.889V483.583H195.142C156 483.583 125 516.017 125 556.18V645.814C125 685.978 156 718.411 195.142 718.411H401.889V645.814H201.776V556.18H401.889V645.814H477.941V393.981C477.941 353.818 446.941 321.353 408.523 321.353Z" fill="black"/><path d="M603.247 267.692V357.441H801.292C842.251 357.441 875 389.932 875 429.647V643.346C875 686.658 838.511 718.412 793.842 718.412H592.057C553.348 718.412 522.059 688.102 522.059 650.569V189C566.728 189 603.217 224.381 603.217 267.692H603.247ZM603.247 650.569H793.842V429.647H603.247V650.569Z" fill="black"/></svg>');
        
        add_menu_page(
            'GutenBlocks Blocks',
            'GutenBlocks Blocks',
            'manage_options',
            'adaire-blocks-settings',
            array($this, 'settings_page'),
            $svg_icon,
            30
        );
    }
    
    /**
     * Initialize settings
     */
    public function init_settings() {
        register_setting(
            'adaire_blocks_settings_group',
            $this->option_name,
            array($this, 'sanitize_settings')
        );
        
        // Get default settings
        $this->settings = get_option($this->option_name, $this->get_default_settings());
        
        // // Debug: Log settings (only in debug mode)
        // if (defined('WP_DEBUG') && WP_DEBUG) {
        //     error_log('GutenBlocks Blocks Settings: ' . print_r($this->settings, true));
        // }
    }
    
    /**
     * Get default settings based on available blocks
     */
    private function get_default_settings() {
        $defaults = array();
        $available_blocks = $this->get_available_blocks();
        
        // Set all available blocks (including auxiliary child blocks) to enabled by default.
        // Auxiliary blocks are always synced to their parent, but still need a stored setting.
        foreach ($available_blocks as $block_key => $block_data) {
            $defaults[$block_key] = true;
        }
        
        return $defaults;
    }
    
    /**
     * Sanitize settings
     */
    public function sanitize_settings($input) {
        // // Debug: Log what's being submitted (only in debug mode)
        // if (defined('WP_DEBUG') && WP_DEBUG) {
        //     error_log('GutenBlocks Blocks Sanitize Input: ' . print_r($input, true));
        // }
        
        $sanitized = array();
        $available_blocks = $this->get_available_blocks();
        
        // Get current settings to preserve disabled blocks
        $current_settings = get_option($this->option_name, $this->get_default_settings());
        
        // First, read the submitted values for all blocks.
        foreach ($available_blocks as $block_key => $block_data) {
            // If the checkbox is checked, it will be in the input array.
            // If it's unchecked, it won't be in the input array, so we set it to false.
            $sanitized[$block_key] = isset($input[$block_key]) && $input[$block_key] ? true : false;
        }

        // Ensure auxiliary/child blocks always follow their parent block's setting.
        foreach ($available_blocks as $block_key => $block_data) {
            if (!empty($block_data['is_auxiliary']) && !empty($block_data['parent_key'])) {
                $parent_key = $block_data['parent_key'];

                if (isset($sanitized[$parent_key])) {
                    $sanitized[$block_key] = $sanitized[$parent_key];
                } else {
                    // If for some reason the parent is missing, default the child to enabled.
                    $sanitized[$block_key] = true;
                }
            }
        }
        
        // // Debug: Log what's being saved (only in debug mode)
        // if (defined('WP_DEBUG') && WP_DEBUG) {
        //     error_log('GutenBlocks Blocks Sanitized Output: ' . print_r($sanitized, true));
        // }
        
        return $sanitized;
    }
    
    /**
     * Get available blocks by scanning the build directory and checking configuration
     */
    public function get_available_blocks() {
        $blocks = array();
        $build_dir = ADAIRE_BLOCKS_PLUGIN_PATH . 'build/';
        $config = AdaireBlocksConfig::get_instance();
        
        // Check if build directory exists
        if (!is_dir($build_dir)) {
            return $blocks;
        }
        
        // Scan for block directories
        $directories = glob($build_dir . '*', GLOB_ONLYDIR);
        
        foreach ($directories as $dir) {
            $block_name = basename($dir);
            
            // Skip if it's not a block directory or doesn't have block.json
            if (!file_exists($dir . '/block.json')) {
                continue;
            }
            
            // Load all blocks - we'll handle premium/free logic in the display
            
            // Read block.json to get block information
            $block_json = file_get_contents($dir . '/block.json');
            $block_data = json_decode($block_json, true);
            
            if (!$block_data) {
                continue;
            }
            
            // Convert block name to settings key
            $settings_key = str_replace('-', '_', $block_name);
            
            // Get block metadata
            $name        = isset($block_data['title']) ? $block_data['title'] : ucwords(str_replace('-', ' ', $block_name));
            $description = isset($block_data['description']) ? $block_data['description'] : 'Custom block for ' . $name;

            // Raw category slug from block.json (e.g. adaire-blocks-free / adaire-blocks-plus / adaire-blocks-premium).
            $category_slug = isset($block_data['category']) ? $block_data['category'] : '';

            // Human-readable category label for display.
            switch ($category_slug) {
                case 'adaire-blocks-free':
                    $category_label = 'Free';
                    break;
                case 'adaire-blocks-plus':
                    $category_label = 'Plus';
                    break;
                case 'adaire-blocks-premium':
                    $category_label = 'Premium';
                    break;
                case 'adaire-hero-sections':
                    $category_label = 'Hero & Navigation';
                    break;
                case 'adaire-layout-sections':
                    $category_label = 'Layout Sections';
                    break;
                case 'adaire-marketing':
                    $category_label = 'Marketing';
                    break;
                case 'adaire-media':
                    $category_label = 'Media';
                    break;
                case 'adaire-business':
                    $category_label = 'Business';
                    break;
                case 'adaire-testimonial':
                    $category_label = 'Testimonials';
                    break;
                case 'adaire-social':
                    $category_label = 'Social';
                    break;
                case 'adaire-blog-publishing':
                    $category_label = 'Blog & Publishing';
                    break;
                case 'adaire-start-actions':
                    $category_label = 'Start & Actions';
                    break;
                case 'adaire-information-blocks':
                    $category_label = 'Information Blocks';
                    break;
                case 'adaire-effects-interactions':
                    $category_label = 'Effects & Interactions';
                    break;
                case 'adaire-interactive':
                    $category_label = 'Interactive';
                    break;
                case 'adaire-layout-navigation':
                    $category_label = 'Layout & Navigation';
                    break;
                case 'adaire-blog-content':
                    $category_label = 'Blog & Content';
                    break;
                case 'adaire-content-expandable':
                    $category_label = 'Expandable Content';
                    break;
                case 'adaire-content-info':
                    $category_label = 'Content & Info';
                    break;
                case 'adaire-content-tabs':
                    $category_label = 'Tabs & Content';
                    break;
                case 'adaire-layout-hero':
                    $category_label = 'Layout & Hero';
                    break;
                case 'adaire-marketing-conversion':
                    $category_label = 'Marketing & Conversion';
                    break;
                case 'adaire-media-images':
                    $category_label = 'Media & Images';
                    break;
                case 'adaire-media-videos':
                    $category_label = 'Media & Videos';
                    break;
                case 'adaire-reviews-trust':
                    $category_label = 'Reviews & Trust';
                    break;
                case 'adaire-social-engagement':
                    $category_label = 'Social & Engagement';
                    break;
                default:
                    $category_label = $category_slug ? ucwords(str_replace('-', ' ', $category_slug)) : 'Widgets';
                    break;
            }

            $icon = isset($block_data['icon']) ? $block_data['icon'] : 'admin-generic';
            
            // Determine if this is an auxiliary "child" block that should be hidden in the UI
            // but still follow its parent block's enabled/disabled state.
            $is_auxiliary = false;
            $parent_key   = null;

            if (isset($block_data['parent']) && is_array($block_data['parent']) && !empty($block_data['parent'])) {
                // Use the first declared parent as the "owning" block.
                $parent_name = $block_data['parent'][0];

                // Normalise to the slug used for build directory (strip common prefixes).
                $parent_slug = preg_replace('#^(create-block/|adaire/|adaire-blocks/)#', '', $parent_name);
                $parent_key  = str_replace('-', '_', $parent_slug);

                // Treat any block with a parent as an auxiliary block for settings UI purposes.
                $is_auxiliary = true;
            }
            
            // Add upgrade message if block has limitations
            $upgrade_message = $config->get_upgrade_message($block_name);
            $limits = $config->get_block_limits($block_name);
            
            // Determine if this is a premium block (disabled in free version)
            $is_premium_block = !$config->is_premium() && !$config->is_block_enabled($block_name);
            
            // // Debug: Log block status (only in debug mode)
            // if (defined('WP_DEBUG') && WP_DEBUG) {
            //     error_log("GutenBlocks Blocks Settings: Block $block_name - enabled: " . ($config->is_block_enabled($block_name) ? 'true' : 'false') . ", premium: " . ($is_premium_block ? 'true' : 'false'));
            // }
            
            $blocks[$settings_key] = array(
                'name'            => $name,
                'description'     => $description,
                'category'        => $category_label,
                'category_slug'   => $category_slug,
                'icon'            => $icon,
                'block_name'      => $block_name,
                'upgrade_message' => $upgrade_message,
                'limits'          => $limits,
                'is_premium'      => $is_premium_block,
                // Auxiliary (child/inner) blocks are hidden from the UI but kept in settings.
                'is_auxiliary'    => $is_auxiliary,
                'parent_key'      => $parent_key,
            );
        }
        
        return $blocks;
    }

    public function sync_block_registry() {
        $available_blocks = $this->get_available_blocks();

        if (empty($available_blocks)) {
            $this->log_registration_failure('No available blocks were found while syncing the block registry.');
            // Return true to not block settings save - blocks might not be built yet
            return true;
        }

        $saved_settings = get_option($this->option_name, array());
        $registry = get_option('adaire_blocks_registry', array());
        $settings_changed = false;
        $registry_changed = false;

        foreach ($available_blocks as $block_key => $block_data) {
            $block_name = isset($block_data['block_name']) ? $block_data['block_name'] : '';

            if (!$block_name || !$this->block_exists($block_name)) {
                $this->log_registration_failure('Block registry sync failed for key "' . $block_key . '". Missing build directory or block.json.');
                continue; // Skip this block but continue with others
            }

            if (!array_key_exists($block_key, $saved_settings)) {
                $saved_settings[$block_key] = true;
                $settings_changed = true;
            }

            $registry[$block_key] = array(
                'block_name'    => $block_name,
                'registered_at' => current_time('mysql'),
                'category'      => isset($block_data['category_slug']) ? $block_data['category_slug'] : '',
                'visible'       => isset($saved_settings[$block_key]) ? (bool) $saved_settings[$block_key] : true,
            );
            $registry_changed = true;
        }

        // Try to update settings, but don't fail if update_option returns false (no changes)
        if ($settings_changed) {
            update_option($this->option_name, $saved_settings);
        }

        // Try to update registry, but don't fail if update_option returns false (no changes)
        if ($registry_changed) {
            update_option('adaire_blocks_registry', $registry);
        }

        $this->refresh_block_cache();

        return true;
    }

    public function register_rest_routes() {
        register_rest_route('adaire-blocks/v1', '/blocks', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'get_registered_blocks_response'),
            'permission_callback' => function() {
                return current_user_can('manage_options');
            },
        ));
    }

    public function get_registered_blocks_response() {
        $synced = $this->sync_block_registry();
        $available_blocks = $this->get_available_blocks();
        $settings = $this->get_settings();
        $registry = get_option('adaire_blocks_registry', array());
        $validation = $this->validate_block_registry($available_blocks, $registry);

        return rest_ensure_response(array(
            'success' => $synced && empty($validation['errors']),
            'blocks' => $available_blocks,
            'settings' => $settings,
            'registry' => $registry,
            'validation' => $validation,
        ));
    }

    private function validate_block_registry($available_blocks, $registry) {
        $errors = array();

        foreach ($available_blocks as $block_key => $block_data) {
            if (empty($registry[$block_key])) {
                $errors[] = 'Missing registry record for ' . $block_key;
                continue;
            }

            if (empty($block_data['block_name']) || !$this->block_exists($block_data['block_name'])) {
                $errors[] = 'Missing build registration files for ' . $block_key;
            }
        }

        foreach ($errors as $error) {
            $this->log_registration_failure($error);
        }

        return array(
            'total_available' => count($available_blocks),
            'total_registry' => count($registry),
            'errors' => $errors,
        );
    }

    private function refresh_block_cache() {
        wp_cache_delete($this->option_name, 'options');
        wp_cache_delete('adaire_blocks_registry', 'options');
        delete_transient('adaire_blocks_available_blocks');
    }

    private function log_registration_failure($message) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GutenBlocks Blocks Registry: ' . $message);
        }
    }

    /**
     * Allowed SVG tags/attributes for block icons.
     */
    private function get_allowed_svg_tags() {
        static $allowed_svg = null;

        if ($allowed_svg !== null) {
            return $allowed_svg;
        }

        $shared_attributes = array(
            'fill' => true,
            'stroke' => true,
            'stroke-width' => true,
            'stroke-linecap' => true,
            'stroke-linejoin' => true,
            'stroke-miterlimit' => true,
            'stroke-dasharray' => true,
            'stroke-dashoffset' => true,
            'strokewidth' => true,
            'strokelinecap' => true,
            'strokelinejoin' => true,
            'opacity' => true,
            'fill-opacity' => true,
            'stroke-opacity' => true,
            'style' => true,
            'class' => true,
            'id' => true,
            'transform' => true,
            'clip-path' => true,
            'clip-rule' => true,
            'mask' => true,
            'vector-effect' => true
        );

        $allowed_svg = array(
            'svg' => array_merge(
                $shared_attributes,
                array(
                    'xmlns' => true,
                    'xmlns:xlink' => true,
                    'width' => true,
                    'height' => true,
                    'viewbox' => true,
                    'viewBox' => true,
                    'preserveAspectRatio' => true,
                    'aria-hidden' => true,
                    'role' => true,
                    'focusable' => true
                )
            ),
            'g' => $shared_attributes,
            'path' => array_merge($shared_attributes, array('d' => true)),
            'rect' => array_merge($shared_attributes, array('x' => true, 'y' => true, 'width' => true, 'height' => true, 'rx' => true, 'ry' => true)),
            'circle' => array_merge($shared_attributes, array('cx' => true, 'cy' => true, 'r' => true)),
            'ellipse' => array_merge($shared_attributes, array('cx' => true, 'cy' => true, 'rx' => true, 'ry' => true)),
            'line' => array_merge($shared_attributes, array('x1' => true, 'y1' => true, 'x2' => true, 'y2' => true)),
            'polyline' => array_merge($shared_attributes, array('points' => true)),
            'polygon' => array_merge($shared_attributes, array('points' => true)),
            'defs' => $shared_attributes,
            'lineargradient' => array_merge(
                $shared_attributes,
                array(
                    'id' => true,
                    'gradientunits' => true,
                    'gradienttransform' => true,
                    'x1' => true,
                    'x2' => true,
                    'y1' => true,
                    'y2' => true
                )
            ),
            'radialgradient' => array_merge(
                $shared_attributes,
                array(
                    'id' => true,
                    'gradientunits' => true,
                    'gradienttransform' => true,
                    'cx' => true,
                    'cy' => true,
                    'r' => true,
                    'fx' => true,
                    'fy' => true
                )
            ),
            'stop' => array(
                'offset' => true,
                'stop-color' => true,
                'stop-opacity' => true,
                'style' => true
            ),
            'clippath' => array_merge($shared_attributes, array('id' => true)),
            'mask' => array_merge($shared_attributes, array('id' => true, 'x' => true, 'y' => true, 'width' => true, 'height' => true)),
            'title' => array(),
            'desc' => array(),
            'use' => array_merge($shared_attributes, array('xlink:href' => true, 'href' => true)),
            'symbol' => array_merge($shared_attributes, array('viewbox' => true, 'viewBox' => true)),
            'pattern' => array_merge($shared_attributes, array('id' => true, 'patternunits' => true, 'patterntransform' => true, 'width' => true, 'height' => true))
        );

        return $allowed_svg;
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        // Get plugin version for cache busting
        $main_plugin_file = dirname(dirname(__FILE__)) . '/adaire-blocks.php';
        $plugin_version = '1.0.0';
        if (file_exists($main_plugin_file)) {
            $plugin_data = get_file_data($main_plugin_file, array('Version' => 'Version'), false);
            $plugin_version = !empty($plugin_data['Version']) ? $plugin_data['Version'] : '1.0.0';
        }
        
        wp_register_style('adaire-blocks-admin-menu', false, array(), $plugin_version);
        wp_enqueue_style('adaire-blocks-admin-menu');
        wp_add_inline_style(
            'adaire-blocks-admin-menu',
            '#adminmenu .toplevel_page_adaire-blocks-settings .wp-menu-image:before,' . PHP_EOL .
            '#adminmenu .current .toplevel_page_adaire-blocks-settings div.wp-menu-image:before,' . PHP_EOL .
            '#adminmenu .wp-has-current-submenu .toplevel_page_adaire-blocks-settings div.wp-menu-image:before,' . PHP_EOL .
            '#adminmenu a.current:hover .toplevel_page_adaire-blocks-settings div.wp-menu-image:before,' . PHP_EOL .
            '#adminmenu a.wp-has-current-submenu:hover .toplevel_page_adaire-blocks-settings div.wp-menu-image:before,' . PHP_EOL .
            '#adminmenu li.wp-has-current-submenu a:focus .toplevel_page_adaire-blocks-settings div.wp-menu-image:before,' . PHP_EOL .
            '#adminmenu li.wp-has-current-submenu.opensub .toplevel_page_adaire-blocks-settings div.wp-menu-image:before,' . PHP_EOL .
            '#adminmenu li.wp-has-current-submenu:hover .toplevel_page_adaire-blocks-settings div.wp-menu-image:before {' . PHP_EOL .
            '    display: none !important;' . PHP_EOL .
            '}'
        );

        if ($hook !== 'toplevel_page_adaire-blocks-settings') {
            return;
        }
        
        wp_register_style(
            'adaire-blocks-admin',
            plugin_dir_url(__FILE__) . 'css/admin-settings.css',
            array(),
            $plugin_version
        );
        wp_enqueue_style('adaire-blocks-admin');
        
        wp_register_script(
            'adaire-blocks-admin',
            plugin_dir_url(__FILE__) . 'js/admin-settings.js',
            array('jquery', 'wp-api-fetch'),
            '1.0.0',
            true
        );
        wp_enqueue_script('adaire-blocks-admin');
        wp_localize_script(
            'adaire-blocks-admin',
            'AdaireBlocksAdminData',
            array(
                'ajaxUrl'    => admin_url('admin-ajax.php'),
                'restUrl'    => esc_url_raw(rest_url('adaire-blocks/v1/blocks')),
                'nonce'      => wp_create_nonce('adaire_blocks_settings'),
                'optionName' => $this->option_name,
                'strings'    => array(
                    'saveSuccess' => esc_html__('Settings saved successfully!', 'adaire-blocks'),
                    'saveError'   => esc_html__('Unable to save settings. Please try again.', 'adaire-blocks'),
                ),
            )
        );
    }
    
    /**
     * Settings page HTML
     */
    public function settings_page() {
        // Debug: Check if class exists
        if (!class_exists('AdaireBlocksConfig')) {
            wp_die('Error: AdaireBlocksConfig class not found. Please check if the plugin is properly loaded.');
        }
        
        $config = AdaireBlocksConfig::get_instance();
        
        // Safety check - ensure config is loaded
        if (!$config) {
            wp_die('Error: GutenBlocks Blocks configuration not loaded. Please try refreshing the page.');
        }
        
        // // Debug: Log config status (only in debug mode)
        // if (defined('WP_DEBUG') && WP_DEBUG) {
        //     error_log('GutenBlocks Blocks Settings: Config loaded - is_premium: ' . ($config->is_premium() ? 'true' : 'false'));
        //     error_log('GutenBlocks Blocks Settings: Plugin version: ' . $config->get_plugin_version());
        // }
        
        
        $available_blocks = $this->get_available_blocks();
        $settings = $this->get_settings();
        
        // Show success message if settings were just saved
        // Note: WordPress core handles nonce verification during form submission via settings_fields().
        // The settings-updated parameter is set by WordPress core on redirect after successful save.
        // We verify both capability and nonce/referer to ensure security.
        if (isset($_GET['settings-updated']) && current_user_can('manage_options')) {
            // Verify nonce if present, or check admin referer
            // On redirect, nonce may not be in URL, so we check referer as fallback
            $nonce_action = 'adaire_blocks_settings_group-options';
            $nonce_verified = false;
            
            if (isset($_REQUEST['_wpnonce'])) {
                $nonce = sanitize_text_field(wp_unslash($_REQUEST['_wpnonce']));
                if (wp_verify_nonce($nonce, $nonce_action)) {
                    $nonce_verified = true;
                }
            }
            
            if (!$nonce_verified && check_admin_referer($nonce_action, '', false)) {
                // check_admin_referer with false parameter only checks referer, not nonce
                $nonce_verified = true;
            }
            
            // Only proceed if nonce/referer is verified
            if ($nonce_verified) {
                // Sanitize and verify the input
                $settings_updated = sanitize_text_field(wp_unslash($_GET['settings-updated']));
                // Only show message if value is 'true' or '1' (WordPress core sets it to 'true')
                if ($settings_updated === 'true' || $settings_updated === '1') {
                    echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Settings saved successfully!', 'adaire-blocks') . '</p></div>';
                }
            }
        }
        ?>
        <div class="wrap">
            <h1>
                <svg width="24" height="24" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px; vertical-align: middle;">
                    <path d="M408.523 321.353H163.388V393.981H401.889V483.583H195.142C156 483.583 125 516.017 125 556.18V645.814C125 685.978 156 718.411 195.142 718.411H401.889V645.814H201.776V556.18H401.889V645.814H477.941V393.981C477.941 353.818 446.941 321.353 408.523 321.353Z" fill="currentColor"/>
                    <path d="M603.247 267.692V357.441H801.292C842.251 357.441 875 389.932 875 429.647V643.346C875 686.658 838.511 718.412 793.842 718.412H592.057C553.348 718.412 522.059 688.102 522.059 650.569V189C566.728 189 603.217 224.381 603.217 267.692H603.247ZM603.247 650.569H793.842V429.647H603.247V650.569Z" fill="currentColor"/>
                </svg>
                <?php echo esc_html(get_admin_page_title()); ?>
            </h1>
            
            <div class="adaire-blocks-settings-container">
                <div class="adaire-blocks-header">
                    <div class="adaire-blocks-logo">
                        <h2>Block Management</h2>
                        <p class="description">Manage which blocks are available in the Gutenberg editor. Toggle blocks on/off to customize your editing experience.</p>
                        <p class="description" style="font-size: 12px; color: #666; margin-top: 10px;">
                            <strong>Available Blocks:</strong> 
                            <?php 
                            // Only count non-auxiliary blocks in the summary to match what is shown below.
                            $total_blocks = 0;
                            $free_blocks = 0;
                            $premium_blocks = 0;
                            
                            foreach ($available_blocks as $block_key => $block_data) {
                                if (!empty($block_data['is_auxiliary'])) {
                                    continue;
                                }

                                $total_blocks++;

                                if ($block_data['is_premium']) {
                                    $premium_blocks++;
                                } else {
                                    $free_blocks++;
                                }
                            }
                            
                            echo esc_html( $total_blocks ) . ' blocks available';
                            if ($config && !$config->is_premium()) {
                                echo ' (' . esc_html( $free_blocks ) . ' free, ' . esc_html( $premium_blocks ) . ' premium)';
                            }
                            ?>
                        </p>
                        <p class="description" style="font-size: 12px; color: #666; margin-top: 5px;">
                            <strong>Current Settings:</strong> 
                            <?php 
                            $enabled_count = 0;
                            $total_free = 0;
                            foreach ($settings as $key => $value) {
                                // Only count settings for free, non-auxiliary blocks.
                                if (isset($available_blocks[$key])) {
                                    $block_data = $available_blocks[$key];

                                    if (!empty($block_data['is_auxiliary'])) {
                                        continue;
                                    }

                                    if (!$block_data['is_premium']) {
                                        $total_free++;
                                        if ($value) {
                                            $enabled_count++;
                                        }
                                    }
                                }
                            }
                            echo esc_html( $enabled_count ) . ' enabled, ' . esc_html( $total_free - $enabled_count ) . ' disabled';
                            if ($config && !$config->is_premium() && $premium_blocks > 0) {
                                echo ' (' . esc_html( $premium_blocks ) . ' premium blocks require upgrade)';
                            }
                            ?>
                        </p>
                    </div>
                </div>
                
                <form method="post" action="options.php" class="adaire-blocks-form" data-option-name="<?php echo esc_attr($this->option_name); ?>">
                    <input type="hidden" name="redirect_to" value="<?php echo esc_url(admin_url('admin.php?page=adaire-blocks-settings&settings-updated=1')); ?>" />
                    <?php
                    settings_fields('adaire_blocks_settings_group');
                    do_settings_sections('adaire_blocks_settings_group');
                    ?>
                    
                    <div class="adaire-blocks-controls">
                        <div class="adaire-blocks-bulk-actions">
                            <button type="button" class="button" id="enable-all-blocks">Enable All Blocks</button>
                            <button type="button" class="button" id="disable-all-blocks">Disable All Blocks</button>
                            <button type="button" class="button" id="reset-to-defaults">Reset to Defaults</button>
                        </div>
                    </div>
                    
                    <?php
                    // Group blocks by their respective categories
                    $category_grouping = array(
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

                    $grouped_blocks = array();
                    foreach ($available_blocks as $block_key => $block_data) {
                        if (!empty($block_data['is_auxiliary'])) {
                            continue;
                        }
                        $category_slug = $block_data['category_slug'];
                        if (!isset($grouped_blocks[$category_slug])) {
                            $grouped_blocks[$category_slug] = array();
                        }
                        $grouped_blocks[$category_slug][$block_key] = $block_data;
                    }

                    // Sort categories by their defined order
                    uksort($grouped_blocks, function($a, $b) use ($category_grouping) {
                        $a_order = array_search($a, array_keys($category_grouping));
                        $b_order = array_search($b, array_keys($category_grouping));
                        return ($a_order === false ? 999 : $a_order) <=> ($b_order === false ? 999 : $b_order);
                    });

                    if (!empty($grouped_blocks)):
                        foreach ($grouped_blocks as $category_slug => $blocks_in_category):
                            $category_title = isset($category_grouping[$category_slug]) ? $category_grouping[$category_slug] : ucwords(str_replace('-', ' ', $category_slug));
                    ?>
                        <h2 class="adaire-blocks-tier-heading"><?php echo esc_html($category_title); ?> <span class="adaire-block-count">(<?php echo count($blocks_in_category); ?>)</span></h2>
                        <div class="adaire-blocks-grid">
                            <?php foreach ($blocks_in_category as $block_key => $block_data): ?>
                                <div class="adaire-block-card <?php echo $block_data['is_premium'] ? 'adaire-block-premium' : ''; ?>">
                                    <?php if ($block_data['is_premium']): ?>
                                        <div class="adaire-block-premium-badge">
                                            <span class="dashicons dashicons-star-filled"></span>
                                            Premium
                                        </div>
                                    <?php endif; ?>
                                    <div class="adaire-block-header">
                                        <div class="adaire-block-icon">
                                            <?php 
                                            $allowed_svg = $this->get_allowed_svg_tags();
                                            // Check if icon is SVG content (starts with <svg)
                                            if (strpos($block_data['icon'], '<svg') === 0) {
                                                echo wp_kses( $block_data['icon'], $allowed_svg );
                                            } elseif (strpos($block_data['icon'], 'data:image/svg+xml;base64,') === 0) {
                                                // Decode base64 SVG and render it (fallback for old format)
                                                $svg_data = base64_decode(str_replace('data:image/svg+xml;base64,', '', $block_data['icon']));
                                                echo wp_kses( $svg_data, $allowed_svg );
                                            } else {
                                            // Use dashicon for non-SVG icons
                                                echo '<span class="dashicons dashicons-' . esc_attr($block_data['icon']) . '"></span>';
                                            }
                                            ?>
                                        </div>
                                        <div class="adaire-block-info">
                                            <h3><?php echo esc_html($block_data['name']); ?></h3>
                                        </div>
                                        <div class="adaire-block-toggle">
                                            <?php if ($block_data['is_premium']): ?>
                                                <div class="adaire-block-upgrade-prompt">
                                                    <a href="https://adaireblocks.com/shop-blocks" target="_blank" class="adaire-upgrade-button">
                                                        <span class="dashicons dashicons-external"></span>
                                                        Upgrade
                                                    </a>
                                                </div>
                                            <?php else: ?>
                                                <label class="adaire-toggle-switch">
                                                    <!-- Hidden input to ensure unchecked boxes send a value -->
                                                    <input type="hidden" name="<?php echo esc_attr($this->option_name); ?>[<?php echo esc_attr($block_key); ?>]" value="0" />
                                                    <input type="checkbox" 
                                                        name="<?php echo esc_attr($this->option_name); ?>[<?php echo esc_attr($block_key); ?>]" 
                                                        value="1" 
                                                        <?php checked(isset($settings[$block_key]) ? $settings[$block_key] : true, true); ?>>
                                                    <span class="adaire-toggle-slider"></span>
                                                </label>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    <div class="adaire-block-description">
                                        <p><?php echo esc_html($block_data['description']); ?></p>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php 
                        endforeach;
                    else:
                    ?>
                        <p class="adaire-no-blocks">No blocks available.</p>
                    <?php endif; ?>
                    
                    <div class="adaire-blocks-footer">
                        <?php submit_button('Save Settings', 'primary', 'submit', false); ?>
                        <span class="adaire-blocks-status">
                            <span class="dashicons dashicons-info"></span>
                            Changes will take effect immediately after saving.
                        </span>
                    </div>
                </form>
            </div>
        </div>
        <?php
    }
    
    /**
     * Get settings
     * Automatically merges in new blocks that aren't in saved settings (enabled by default)
     */
    public function get_settings() {
        $saved_settings = get_option($this->option_name, array());
        $default_settings = $this->get_default_settings();
        $has_new_blocks = false;
        
        // Start with saved settings, then add any new blocks from defaults
        $merged_settings = $saved_settings;
        
        // Check for new blocks that exist in defaults but not in saved settings
        foreach ($default_settings as $block_key => $default_value) {
            if (!isset($saved_settings[$block_key])) {
                // New block detected - enable it by default
                $merged_settings[$block_key] = true;
                $has_new_blocks = true;
            }
        }
        
        // Save the merged settings if new blocks were added (to persist the defaults)
        if ($has_new_blocks) {
            update_option($this->option_name, $merged_settings);
        }
        
        return $merged_settings;
    }
    
    /**
     * Check if block is enabled
     */
    public function is_block_enabled($block_key) {
        $settings = $this->get_settings();
        return isset($settings[$block_key]) ? $settings[$block_key] : true;
    }
    
    /**
     * Check if a block exists in the build directory
     */
    public function block_exists($block_name) {
        $build_dir = ADAIRE_BLOCKS_PLUGIN_PATH . 'build/' . $block_name;
        return is_dir($build_dir) && file_exists($build_dir . '/block.json');
    }
    
    /**
     * AJAX handler for saving settings
     */
    public function ajax_save_settings() {
        check_ajax_referer('adaire_blocks_settings', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $form_data = isset($_POST['formData']) ? wp_unslash($_POST['formData']) : '';
        if (empty($form_data)) {
            wp_send_json_error(esc_html__('No settings data received.', 'adaire-blocks'));
        }

        parse_str($form_data, $parsed_form);
        $input_settings = isset($parsed_form[$this->option_name]) ? (array) $parsed_form[$this->option_name] : array();

        $settings = $this->sanitize_settings($input_settings);
        $previous_settings = get_option($this->option_name, array());

        // Always update the option to ensure it's saved
        update_option($this->option_name, $settings);

        // Attempt to sync block registry, but don't fail the save if it has issues
        $synced = $this->sync_block_registry();

        // Check if settings actually changed
        $settings_changed = ($previous_settings !== $settings);

        if ($settings_changed) {
            wp_send_json_success(array(
                'message' => esc_html__('Settings saved successfully!', 'adaire-blocks'),
                'settings' => $settings,
                'registrySynced' => $synced
            ));
        } else {
            wp_send_json_success(array(
                'message' => esc_html__('Settings saved successfully (no changes detected).', 'adaire-blocks'),
                'settings' => $settings,
                'registrySynced' => $synced
            ));
        }
    }
    
    /**
     * AJAX handler for resetting settings
     */
    public function ajax_reset_settings() {
        check_ajax_referer('adaire_blocks_settings', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $default_settings = $this->get_default_settings();
        update_option($this->option_name, $default_settings);
        $this->sync_block_registry();
        
        wp_send_json_success(array(
            'message' => 'Settings reset to defaults!',
            'settings' => $default_settings
        ));
    }
    
    /**
     * Add settings link to plugins page
     */
    public function add_plugin_settings_link($links, $file) {
        // Check if this is our plugin file
        if (strpos($file, 'adaire-blocks.php') !== false) {
            $settings_link = '<a href="' . admin_url('admin.php?page=adaire-blocks-settings') . '">' . __('Settings', 'adaire-blocks') . '</a>';
            array_unshift($links, $settings_link);
        }
        return $links;
    }
}

// Initialize settings using singleton pattern
AdaireBlocksSettings::get_instance();
