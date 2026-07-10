<?php
/**
 * Configuration Manager for Adaire Blocks
 * Handles free vs premium feature availability
 *
 * @package AdaireBlocks
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AdaireBlocksConfig {
    
    private static $instance = null;
    private $config_file;
    private $config_data;
    private $plugin_version;
    
    private function __construct() {
        $this->config_file = ADAIRE_BLOCKS_PLUGIN_PATH . 'config/blocks-config.json';
        $this->plugin_version = $this->detect_plugin_version();
        $this->load_config();
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
     * Detect plugin version (free or premium)
     */
    private function detect_plugin_version() {
        // Method 1: Check config file for version flag
        // This is the WordPress.org compliant way
        if (file_exists($this->config_file)) {
            $config_content = file_get_contents($this->config_file);
            $config = json_decode($config_content, true);
            
            // Check if config has a version indicator
            if (isset($config['version']) && $config['version'] === 'free') {
                return 'free';
            }
            
            // Check if premium config is empty (indicates free version)
            if (isset($config['premium']) && empty($config['premium'])) {
                return 'free';
            }
        }
        
        // Method 2: Check for premium-only files (NOT update-checker related)
        // Check for a premium-specific admin file
        $premium_marker = ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/premium-features.php';
        if (!file_exists($premium_marker)) {
            // No premium marker file = likely free version
            // But only if we have the free config
            if (file_exists($this->config_file)) {
                $config_content = file_get_contents($this->config_file);
                $config = json_decode($config_content, true);
                if (isset($config['free'])) {
                    return 'free';
                }
            }
        }
        
        // Method 3: Check if premium license is active
        if ($this->is_premium_license_active()) {
            return 'premium';
        }
        
        // Default to free version when license is inactive
        return 'free';
    }
    
    /**
     * Check if premium license is active
     */
    private function is_premium_license_active() {
        // Use the new license system
        if (class_exists('AdaireBlocksLicense')) {
            $license_manager = AdaireBlocksLicense::get_instance();
            $license_status = $license_manager->get_license_status();
            
            return $license_status['status'] === 'active';
        }
        
        // Fallback to old system if new license system not available
        $license_key = get_option('adaire_blocks_license_key', '');
        $license_status = get_option('adaire_blocks_license_status', 'inactive');
        
        return !empty($license_key) && $license_status === 'active';
    }
    
    /**
     * Load configuration from JSON file
     */
    private function load_config() {
        if (!file_exists($this->config_file)) {
            $this->config_data = array();
            return;
        }
        
        $config_content = file_get_contents($this->config_file);
        $this->config_data = json_decode($config_content, true);
        
        if (!$this->config_data) {
            $this->config_data = array();
        }
    }
    
    /**
     * Get block configuration for current version
     */
    public function get_block_config($block_name) {
        $version_config = $this->config_data[$this->plugin_version] ?? array();
        
        // Check if block exists in current version config
        if (isset($version_config[$block_name])) {
            return $version_config[$block_name];
        }
        
        // For premium users, also check the plus category
        if ($this->plugin_version === 'premium' && isset($this->config_data['plus'][$block_name])) {
            return $this->config_data['plus'][$block_name];
        }
        
        return array();
    }
    
    /**
     * Check if block is enabled for current version
     */
    public function is_block_enabled($block_name) {
        $config = $this->get_block_config($block_name);
        return isset($config['enabled']) ? $config['enabled'] : false;
    }
    
    /**
     * Get block limits for current version
     */
    public function get_block_limits($block_name) {
        $config = $this->get_block_config($block_name);
        return $config['limits'] ?? array();
    }
    
    /**
     * Get block features for current version
     */
    public function get_block_features($block_name) {
        $config = $this->get_block_config($block_name);
        return $config['features'] ?? array();
    }
    
    /**
     * Get upgrade message for block
     */
    public function get_upgrade_message($block_name) {
        $config = $this->get_block_config($block_name);
        return $config['upgradeMessage'] ?? 'Upgrade to Premium for more features.';
    }
    
    /**
     * Check if feature is available
     */
    public function is_feature_available($block_name, $feature) {
        if ($this->plugin_version === 'premium') {
            return true;
        }
        
        $features = $this->get_block_features($block_name);
        return in_array($feature, $features);
    }
    
    /**
     * Check if limit is reached
     */
    public function is_limit_reached($block_name, $limit_key, $current_value) {
        if ($this->plugin_version === 'premium') {
            return false;
        }
        
        $limits = $this->get_block_limits($block_name);
        $limit_value = $limits[$limit_key] ?? null;
        
        if ($limit_value === null) {
            return false;
        }
        
        return $current_value >= $limit_value;
    }
    
    /**
     * Get current plugin version (public accessor)
     */
    public function get_plugin_version() {
        return $this->plugin_version;
    }
    
    /**
     * Check if premium features are available
     */
    public function is_premium() {
        return $this->plugin_version === 'premium';
    }
    
    /**
     * Get all available blocks for current version
     */
    public function get_available_blocks() {
        $version_config = $this->config_data[$this->plugin_version] ?? array();
        $available_blocks = array();
        
        foreach ($version_config as $block_name => $config) {
            if (isset($config['enabled']) && $config['enabled']) {
                $available_blocks[] = $block_name;
            }
        }
        
        // For premium users, also include plus blocks
        if ($this->plugin_version === 'premium' && isset($this->config_data['plus'])) {
            foreach ($this->config_data['plus'] as $block_name => $config) {
                if (isset($config['enabled']) && $config['enabled']) {
                    $available_blocks[] = $block_name;
                }
            }
        }
        
        return $available_blocks;
    }
    
    /**
     * Get upgrade notice for disabled blocks
     */
    public function get_upgrade_notices() {
        $version_config = $this->config_data[$this->plugin_version] ?? array();
        $notices = array();
        
        foreach ($version_config as $block_name => $config) {
            if (isset($config['enabled']) && !$config['enabled'] && isset($config['upgradeMessage'])) {
                $notices[$block_name] = $config['upgradeMessage'];
            }
        }
        
        return $notices;
    }
    
    /**
     * Render upgrade notice HTML for PHP render callbacks
     */
    public function render_upgrade_notice($block_name, $custom_message = null) {
        $message = $custom_message ?: $this->get_upgrade_message($block_name);
        
        ob_start();
        ?>
        <div class="adaire-upgrade-notice-php" style="
            background: #f0f6fc;
            border: 1px solid #0073aa;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
            <div style="margin-bottom: 15px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #0073aa; display: inline-block; vertical-align: middle;">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    <path d="M19 15L20.09 17.26L23 18L20.09 18.74L19 21L17.91 18.74L15 18L17.91 17.26L19 15Z" fill="currentColor"/>
                </svg>
            </div>
            <h3 style="margin: 0 0 10px 0; color: #0073aa; font-size: 18px;">
                <?php echo esc_html__('Premium Feature', 'adaire-blocks'); ?>
            </h3>
            <p style="margin: 0 0 15px 0; color: #333; line-height: 1.5;">
                <?php echo esc_html($message); ?>
            </p>
            <a href="https://adaireblocks.com/premium" 
               target="_blank" 
               rel="noopener noreferrer"
               style="
                   background: #0073aa;
                   color: white;
                   padding: 12px 24px;
                   text-decoration: none;
                   border-radius: 4px;
                   font-weight: 600;
                   display: inline-block;
                   transition: background-color 0.2s;
               "
               onmouseover="this.style.backgroundColor='#005177'"
               onmouseout="this.style.backgroundColor='#0073aa'">
                <?php echo esc_html__('Upgrade to Premium', 'adaire-blocks'); ?>
            </a>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Check if block should show upgrade notice instead of rendering
     */
    public function should_show_upgrade_notice($block_name, $attributes = array()) {
        // If block is disabled, always show upgrade notice
        if (!$this->is_block_enabled($block_name)) {
            return true;
        }
        
        // If block is enabled but has limits, check if limits are exceeded
        $limits = $this->get_block_limits($block_name);
        
        foreach ($limits as $limit_key => $limit_value) {
            if (isset($attributes[$limit_key]) && $this->is_limit_reached($block_name, $limit_key, $attributes[$limit_key])) {
                return true;
            }
        }
        
        return false;
    }
}
