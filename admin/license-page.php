<?php
/**
 * License Management Page for Adaire Blocks
 *
 * @package AdaireBlocks
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AdaireBlocksLicensePage {
    
    private static $instance = null;
    private $license_manager;
    
    private function __construct() {
        $this->license_manager = AdaireBlocksLicense::get_instance();
        add_action('admin_menu', array($this, 'add_license_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_license_scripts'));
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
     * Add license menu page
     */
    public function add_license_menu() {
        add_submenu_page(
            'adaire-blocks-settings',
            'License Management',
            'License',
            'manage_options',
            'adaire-blocks-license',
            array($this, 'license_page')
        );
    }
    
    /**
     * Enqueue license page scripts
     */
    public function enqueue_license_scripts($hook) {
        if ($hook !== 'adaire-blocks_page_adaire-blocks-license') {
            return;
        }
        
        wp_enqueue_style(
            'adaire-blocks-license',
            plugin_dir_url(__FILE__) . 'css/license-page.css',
            array(),
            ADAIRE_BLOCKS_VERSION
        );
        
        wp_enqueue_script(
            'adaire-blocks-license',
            plugin_dir_url(__FILE__) . 'js/license-page.js',
            array('jquery'),
            ADAIRE_BLOCKS_VERSION,
            true
        );
        
        // Localize script with AJAX data
        wp_localize_script('adaire-blocks-license', 'adaireLicense', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('adaire_license_nonce'),
            'validationServerUrl' => AdaireBlocksValidationConfig::get_validation_server_url(),
            'strings' => array(
                'activating' => __('Activating...', 'adaire-blocks'),
                'deactivating' => __('Deactivating...', 'adaire-blocks'),
                'validating' => __('Validating...', 'adaire-blocks'),
                'activate' => __('Activate License', 'adaire-blocks'),
                'deactivate' => __('Deactivate License', 'adaire-blocks'),
                'validate' => __('Validate License', 'adaire-blocks'),
                'success' => __('Success!', 'adaire-blocks'),
                'error' => __('Error!', 'adaire-blocks'),
                'licenseKeyRequired' => __('License key is required', 'adaire-blocks'),
                'confirmDeactivate' => __('Are you sure you want to deactivate this license?', 'adaire-blocks')
            )
        ));
    }
    
    /**
     * License page HTML
     */
    public function license_page() {
        $license_status = $this->license_manager->get_license_status();
        $license_data = $this->license_manager->get_license_data();
        
        // If license is active, refresh data from validation endpoint
        if ($license_status['status'] === 'active' && !empty($license_data['license_key'])) {
            $this->refresh_license_data_from_api($license_data['license_key']);
            // Get updated data after refresh
            $license_status = $this->license_manager->get_license_status();
            $license_data = $this->license_manager->get_license_data();
        }
        
        ?>
        <div class="wrap">
            <h1>
                <svg width="24" height="24" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px; vertical-align: middle;">
                    <path d="M408.523 321.353H163.388V393.981H401.889V483.583H195.142C156 483.583 125 516.017 125 556.18V645.814C125 685.978 156 718.411 195.142 718.411H401.889V645.814H201.776V556.18H401.889V645.814H477.941V393.981C477.941 353.818 446.941 321.353 408.523 321.353Z" fill="currentColor"/>
                    <path d="M603.247 267.692V357.441H801.292C842.251 357.441 875 389.932 875 429.647V643.346C875 686.658 838.511 718.412 793.842 718.412H592.057C553.348 718.412 522.059 688.102 522.059 650.569V189C566.728 189 603.217 224.381 603.217 267.692H603.247ZM603.247 650.569H793.842V429.647H603.247V650.569Z" fill="currentColor"/>
                </svg>
                License Management
            </h1>
            
            <div class="adaire-license-container" data-license-key="<?php echo esc_attr($license_data['license_key'] ?? ''); ?>">
                <div class="adaire-license-header">
                    <h2>Adaire Blocks License</h2>
                    <p class="description">Manage your Adaire Blocks license activation and status.</p>
                </div>
                
                <div class="adaire-license-content">
                    <!-- License Status Card -->
                    <div class="adaire-license-card">
                        <div class="adaire-license-card-header">
                            <h3>License Status</h3>
                            <span class="adaire-license-status-badge status-<?php echo esc_attr($license_status['status']); ?>">
                                <?php echo esc_html(ucfirst($license_status['status'])); ?>
                            </span>
                        </div>
                        
                        <div class="adaire-license-card-content">
                            <?php if ($license_status['status'] === 'active'): ?>
                                <div class="adaire-license-info">
                                    <p><strong>Status:</strong> <span class="status-active">Active</span></p>
                                    <?php if (isset($license_status['remaining_activations'])): ?>
                                        <p><strong>Remaining Activations:</strong> <?php echo esc_html($license_status['remaining_activations']); ?></p>
                                    <?php endif; ?>
                                    <?php if (isset($license_status['times_activated'])): ?>
                                        <p><strong>Times Activated:</strong> <?php echo esc_html($license_status['times_activated']); ?> / <?php echo esc_html($license_status['times_activated_max']); ?></p>
                                    <?php endif; ?>
                                    <?php if ($license_data && $license_data['last_checked']): ?>
                                        <p><strong>Last Checked:</strong> <?php echo esc_html(date('M j, Y g:i A', strtotime($license_data['last_checked']))); ?></p>
                                    <?php endif; ?>
                                </div>
                            <?php else: ?>
                                <div class="adaire-license-info">
                                    <p><strong>Status:</strong> <span class="status-inactive">Inactive</span></p>
                                    <p class="adaire-license-message"><?php echo esc_html($license_status['message']); ?></p>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <!-- License Actions Card -->
                    <div class="adaire-license-card">
                        <div class="adaire-license-card-header">
                            <h3>License Actions</h3>
                        </div>
                        
                        <div class="adaire-license-card-content">
                            <?php if ($license_status['status'] === 'active'): ?>
                                <!-- Active License Actions -->
                                <div class="adaire-license-actions">
                                    <button type="button" class="button button-secondary" id="validate-license">
                                        <span class="dashicons dashicons-yes-alt"></span>
                                        Validate License
                                    </button>
                                    <button type="button" class="button button-secondary" id="deactivate-license">
                                        <span class="dashicons dashicons-dismiss"></span>
                                        Deactivate License
                                    </button>
                                    <button type="button" class="button button-secondary" id="refresh-status">
                                        <span class="dashicons dashicons-update"></span>
                                        Refresh Status
                                    </button>
                                </div>
                            <?php else: ?>
                                <!-- Inactive License Actions -->
                                <form id="adaire-license-form" class="adaire-license-form">
                                    <div class="adaire-license-input-group">
                                        <label for="license-key">License Key</label>
                                        <input type="text" 
                                               id="license-key" 
                                               name="license_key" 
                                               placeholder="Enter your license key"
                                               value="<?php echo esc_attr($license_data['license_key'] ?? ''); ?>"
                                               required>
                                        <p class="description">Enter your Adaire Blocks license key to activate the plugin.</p>
                                    </div>
                                    
                                    <div class="adaire-license-actions">
                                        <button type="submit" class="button button-primary" id="activate-license">
                                            <span class="dashicons dashicons-yes"></span>
                                            Activate License
                                        </button>
                                        <button type="button" class="button button-secondary" id="refresh-status">
                                            <span class="dashicons dashicons-update"></span>
                                            Refresh Status
                                        </button>
                                    </div>
                                </form>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <!-- License Information Card -->
                    <div class="adaire-license-card">
                        <div class="adaire-license-card-header">
                            <h3>License Information</h3>
                        </div>
                        
                        <div class="adaire-license-card-content">
                            <div class="adaire-license-info-text">
                                <h4>How License Activation Works</h4>
                                <ul>
                                    <li>Each license key has its own activation limit (varies by license type)</li>
                                    <li>You can deactivate a license to free up an activation slot</li>
                                    <li>License status is automatically validated every 24 hours</li>
                                    <li>You can manually validate your license at any time</li>
                                </ul>
                                
                                <h4>Need Help?</h4>
                                <p>If you're having trouble with license activation, please contact our support team at <a href="mailto:support@adaireblocks.com">support@adaireblocks.com</a></p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Messages Container -->
                <div id="adaire-license-messages" class="adaire-license-messages"></div>
            </div>
        </div>
        
        <?php
    }
    
    /**
     * Refresh license data from validation endpoint
     */
    private function refresh_license_data_from_api($license_key) {
        error_log('Adaire Blocks License: Refreshing license data from API on page load');
        
        try {
            // Call the validation endpoint to get current data
            $validation_result = $this->license_manager->validate_license($license_key);
            
            if ($validation_result) {
                error_log('Adaire Blocks License: License data refreshed successfully from API');
                error_log('Adaire Blocks License: Updated data: ' . print_r($validation_result, true));
            } else {
                error_log('Adaire Blocks License: Failed to refresh license data from API');
            }
        } catch (Exception $e) {
            error_log('Adaire Blocks License: Error refreshing license data: ' . $e->getMessage());
        }
    }
    
}

// Initialize license page
AdaireBlocksLicensePage::get_instance();