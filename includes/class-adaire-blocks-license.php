<?php
/**
 * License Management Class for Adaire Blocks
 *
 * @package AdaireBlocks
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AdaireBlocksLicense {
    
    private static $instance = null;
    private $table_name;
    
    // Validation server configuration
    private $validation_server_url;
    
    private function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'adaire_blocks_licenses';
        
        // Load validation server configuration
        $this->validation_server_url = AdaireBlocksValidationConfig::get_validation_server_url();
        
        // Initialize on admin init
        add_action('admin_init', array($this, 'init'));
        add_action('wp_ajax_adaire_activate_license', array($this, 'ajax_activate_license'));
        add_action('wp_ajax_adaire_deactivate_license', array($this, 'ajax_deactivate_license'));
        add_action('wp_ajax_adaire_validate_license', array($this, 'ajax_validate_license'));
        add_action('wp_ajax_adaire_test_api', array($this, 'ajax_test_api'));
        add_action('wp_ajax_adaire_test_auth', array($this, 'ajax_test_auth'));
        add_action('wp_ajax_adaire_save_activation', array($this, 'ajax_save_activation'));
        add_action('wp_ajax_adaire_save_deactivation', array($this, 'ajax_save_deactivation'));
        add_action('wp_ajax_adaire_update_license_data', array($this, 'ajax_update_license_data'));
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
     * Initialize license system
     */
    public function init() {
        $this->create_license_table();
        $this->check_license_status();
    }
    
    /**
     * Extract and sanitize license key from URL if full URL is provided
     */
    private function extract_license_key($input) {
        // If it's a URL, extract the license key from the end
        if (strpos($input, 'http') === 0) {
            $parts = explode('/', trim($input, '/'));
            $license_key = end($parts);
            error_log('Adaire Blocks License: Extracted license key from URL: ' . $license_key);
        } else {
            // If it's already just a license key, use as is
            $license_key = $input;
        }
        
        // Sanitize the license key - remove spaces and special characters
        $license_key = trim($license_key);
        $license_key = preg_replace('/\s+/', '', $license_key); // Remove all whitespace
        $license_key = preg_replace('/[^a-zA-Z0-9]/', '', $license_key); // Keep only alphanumeric
        
        error_log('Adaire Blocks License: Sanitized license key: ' . $license_key);
        
        // Validate that we have a valid license key after sanitization
        if (empty($license_key)) {
            error_log('Adaire Blocks License: ERROR - License key is empty after sanitization');
            return false;
        }
        
        if (strlen($license_key) < 5) {
            error_log('Adaire Blocks License: WARNING - License key seems too short: ' . $license_key);
        }
        
        return $license_key;
    }
    
    /**
     * Create license table
     */
    private function create_license_table() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$this->table_name} (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            license_key varchar(255) NOT NULL,
            activation_token varchar(255) DEFAULT NULL,
            status varchar(20) DEFAULT 'inactive',
            times_activated int(11) DEFAULT 0,
            times_activated_max int(11) DEFAULT 0,
            remaining_activations int(11) DEFAULT 0,
            last_checked datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY license_key (license_key)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Check license status on plugin load
     */
    private function check_license_status() {
        $license_data = $this->get_license_data();
        
        if (!$license_data) {
            return;
        }
        
        // Check if license needs validation (every 24 hours)
        $last_checked = $license_data['last_checked'];
        $should_check = false;
        
        if (!$last_checked) {
            $should_check = true;
        } else {
            $last_checked_time = strtotime($last_checked);
            $should_check = (time() - $last_checked_time) > (24 * 60 * 60); // 24 hours
        }
        
        if ($should_check) {
            $result = $this->validate_license($license_data['license_key']);
            
            // If validation fails, show error notice
            if (!$result) {
                add_action('admin_notices', function() {
                    adaire_blocks_license_error_notice('License validation failed. Please check your license key.');
                });
            }
        }
    }
    
    /**
     * Get license data from database
     */
    public function get_license_data() {
        global $wpdb;
        
        $result = $wpdb->get_row(
            "SELECT * FROM {$this->table_name} ORDER BY id DESC LIMIT 1",
            ARRAY_A
        );
        
        return $result;
    }
    
    /**
     * Save license data to database
     */
    private function save_license_data($license_key, $data = array()) {
        global $wpdb;
        
        error_log('Adaire Blocks License: Saving license data');
        error_log('Adaire Blocks License: License key: ' . substr($license_key, 0, 8) . '...');
        error_log('Adaire Blocks License: Data to save: ' . print_r($data, true));
        
        $existing = $this->get_license_data();
        error_log('Adaire Blocks License: Existing license data: ' . print_r($existing, true));
        
        $license_data = array(
            'license_key' => $license_key,
            'last_checked' => current_time('mysql')
        );
        
        // Merge with provided data
        $license_data = array_merge($license_data, $data);
        error_log('Adaire Blocks License: Final license data to save: ' . print_r($license_data, true));
        
        if ($existing) {
            // Update existing record
            error_log('Adaire Blocks License: Updating existing license record');
            $result = $wpdb->update(
                $this->table_name,
                $license_data,
                array('id' => $existing['id'])
            );
            error_log('Adaire Blocks License: Update result: ' . print_r($result, true));
            error_log('Adaire Blocks License: Last error: ' . $wpdb->last_error);
        } else {
            // Insert new record
            error_log('Adaire Blocks License: Inserting new license record');
            $result = $wpdb->insert($this->table_name, $license_data);
            error_log('Adaire Blocks License: Insert result: ' . print_r($result, true));
            error_log('Adaire Blocks License: Insert ID: ' . $wpdb->insert_id);
            error_log('Adaire Blocks License: Last error: ' . $wpdb->last_error);
        }
    }
    
    /**
     * Validate license with validation server
     */
    public function validate_license($license_key) {
        // Development bypass for "douglasmasho." key
        if ($license_key === 'douglasmasho') {
            error_log('Adaire Blocks License: Development bypass validation for key: douglasmasho');
            
            // Return mock validation data for development
            return array(
                'timesActivated' => 1,
                'timesActivatedMax' => 999,
                'remainingActivations' => 999
            );
        }
        
        $url = $this->validation_server_url . '/?action=validate&license_key=' . urlencode($license_key);
        
        error_log('Adaire Blocks License: Starting license validation via validation server');
        error_log('Adaire Blocks License: License Key: ' . substr($license_key, 0, 8) . '...');
        error_log('Adaire Blocks License: Validation server URL: ' . $url);
        
        $response = wp_remote_get($url, array(
            'timeout' => 30,
            'headers' => array(
                'Accept' => 'application/json',
                'User-Agent' => 'Adaire-Blocks-WordPress/1.1.1'
            )
        ));
        
        if (is_wp_error($response)) {
            error_log('Adaire Blocks License: API request failed - ' . $response->get_error_message());
            error_log('Adaire Blocks License: Error code: ' . $response->get_error_code());
            
            // If it's a network error, don't invalidate the license immediately
            // Just log the error and return false for this validation attempt
            return false;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_headers = wp_remote_retrieve_headers($response);
        $body = wp_remote_retrieve_body($response);
        
        error_log('Adaire Blocks License: Response Code: ' . $response_code);
        error_log('Adaire Blocks License: Response Headers: ' . print_r($response_headers, true));
        error_log('Adaire Blocks License: Response Body: ' . $body);
        
        if ($response_code !== 200) {
            error_log('Adaire Blocks License: API returned HTTP ' . $response_code);
            return false;
        }
        
        $data = json_decode($body, true);
        
        if (!$data) {
            error_log('Adaire Blocks License: Failed to decode JSON response');
            error_log('Adaire Blocks License: Raw response: ' . $body);
            return false;
        }
        
        error_log('Adaire Blocks License: Decoded response: ' . print_r($data, true));
        
        if (!isset($data['success'])) {
            error_log('Adaire Blocks License: Response missing success field');
            return false;
        }
        
        if (!$data['success']) {
            error_log('Adaire Blocks License: API returned success=false');
            if (isset($data['data']['errors'])) {
                error_log('Adaire Blocks License: API errors: ' . print_r($data['data']['errors'], true));
            }
            return false;
        }
        
        if (!isset($data['data'])) {
            error_log('Adaire Blocks License: Response missing data field');
            return false;
        }
        
        // The validation server wraps the response, so data could be nested
        // Check if data.data exists (validation server wrapping the license API response)
        $license_info = isset($data['data']['data']) ? $data['data']['data'] : $data['data'];
        
        error_log('Adaire Blocks License: Raw data from server: ' . print_r($data['data'], true));
        error_log('Adaire Blocks License: Extracted license info: ' . print_r($license_info, true));
        
        // Check if there are any active activations
        if (isset($license_info['timesActivated']) && $license_info['timesActivated'] == 0) {
            error_log('Adaire Blocks License: No active activations found (timesActivated = 0), deactivating license');
            
            // Deactivate the license
            $this->save_license_data($license_key, array(
                'status' => 'inactive',
                'activation_token' => null,
                'times_activated' => 0,
                'times_activated_max' => $license_info['timesActivatedMax'] ?? 0,
                'remaining_activations' => $license_info['remainingActivations'] ?? 0
            ));
            
            return false; // Return false to indicate license is not active
        }
        
        // Save license data
        $this->save_license_data($license_key, array(
            'status' => 'active',
            'times_activated' => $license_info['timesActivated'] ?? 0,
            'times_activated_max' => $license_info['timesActivatedMax'] ?? 0,
            'remaining_activations' => $license_info['remainingActivations'] ?? 0
        ));
        
        error_log('Adaire Blocks License: License validation successful');
        return $license_info;
    }
    
    /**
     * Activate license
     */
    public function activate_license($license_key) {
        error_log('Adaire Blocks License: ===== LICENSE ACTIVATION DEBUG =====');
        error_log('Adaire Blocks License: Raw License Key Received: ' . $license_key);
        error_log('Adaire Blocks License: License Key Length: ' . strlen($license_key));
        error_log('Adaire Blocks License: License Key Type: ' . gettype($license_key));
        
        // Extract license key if full URL was provided
        $original_key = $license_key;
        $license_key = $this->extract_license_key($license_key);
        
        if ($original_key !== $license_key) {
            error_log('Adaire Blocks License: Extracted license key from URL in activate_license method');
            error_log('Adaire Blocks License: Original input: ' . $original_key);
            error_log('Adaire Blocks License: Extracted key: ' . $license_key);
        }
        
        // Development bypass for "douglasmasho." key
        if ($license_key === 'douglasmasho') {
            error_log('Adaire Blocks License: Development bypass activated for key: douglasmasho');
            
            // Save license data with development bypass
            $this->save_license_data($license_key, array(
                'activation_token' => 'dev-bypass-token-' . time(),
                'status' => 'active',
                'times_activated' => 1,
                'times_activated_max' => 999,
                'remaining_activations' => 999
            ));
            
            return array(
                'success' => true,
                'message' => 'License activated successfully (Development Mode)',
                'token' => 'dev-bypass-token-' . time()
            );
        }
        
        $url = $this->validation_server_url . '/?action=activate&license_key=' . urlencode($license_key);
        
        error_log('Adaire Blocks License: Starting license activation via validation server');
        error_log('Adaire Blocks License: License Key: ' . substr($license_key, 0, 8) . '...');
        
        // Log the exact request being made
        error_log('Adaire Blocks License: Making GET request to validation server: ' . $url);
        
        // Use minimal request args for validation server
        $request_args = array(
            'timeout' => 30,
            'method' => 'GET',
            'sslverify' => true,
            'httpversion' => '1.1',
            'blocking' => true,
            'headers' => array(
                'Accept' => 'application/json',
                'User-Agent' => 'Adaire-Blocks-WordPress/1.1.1'
            )
        );
        
        error_log('Adaire Blocks License: Request arguments: ' . print_r($request_args, true));
        
        $response = wp_remote_request($url, $request_args);
        
        // Log the actual request that was made (WordPress might modify it)
        if (is_wp_error($response)) {
            error_log('Adaire Blocks License: WordPress request error: ' . $response->get_error_message());
        } else {
            $response_code = wp_remote_retrieve_response_code($response);
            error_log('Adaire Blocks License: WordPress response code: ' . $response_code);
            
            // Check if WordPress modified our request
            $response_headers = wp_remote_retrieve_headers($response);
            error_log('Adaire Blocks License: Response headers from server: ' . print_r($response_headers->getAll(), true));
        }
        
        // If that fails, try with cURL directly (bypass WordPress HTTP completely)
        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) === 401) {
            error_log('Adaire Blocks License: WordPress request failed, trying direct cURL');
            $response = $this->make_direct_curl_request($url);
        }
        
        if (is_wp_error($response)) {
            error_log('Adaire Blocks License: Activation API request failed - ' . $response->get_error_message());
            error_log('Adaire Blocks License: Error code: ' . $response->get_error_code());
            
            return array(
                'success' => false,
                'message' => 'Network error: ' . $response->get_error_message()
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_headers = wp_remote_retrieve_headers($response);
        $body = wp_remote_retrieve_body($response);
        
        error_log('Adaire Blocks License: ===== ACTIVATION API RESPONSE START =====');
        error_log('Adaire Blocks License: Response Code: ' . $response_code);
        error_log('Adaire Blocks License: Response Headers: ' . print_r($response_headers->getAll(), true));
        error_log('Adaire Blocks License: Raw Response Body: ' . $body);
        error_log('Adaire Blocks License: Response Body Length: ' . strlen($body));
        error_log('Adaire Blocks License: Response Body Type: ' . gettype($body));
        
        // Log first 500 characters for quick inspection
        error_log('Adaire Blocks License: Response Body Preview: ' . substr($body, 0, 500));
        error_log('Adaire Blocks License: ===== ACTIVATION API RESPONSE END =====');
        
        error_log('Adaire Blocks License: ===== JSON DECODING START =====');
        $data = json_decode($body, true);
        $json_error = json_last_error();
        $json_error_msg = json_last_error_msg();
        
        error_log('Adaire Blocks License: JSON Decode Result: ' . print_r($data, true));
        error_log('Adaire Blocks License: JSON Error Code: ' . $json_error);
        error_log('Adaire Blocks License: JSON Error Message: ' . $json_error_msg);
        
        if (!$data) {
            error_log('Adaire Blocks License: Failed to decode activation JSON response');
            error_log('Adaire Blocks License: Raw activation response: ' . $body);
            error_log('Adaire Blocks License: JSON Error: ' . $json_error_msg);
            
            return array(
                'success' => false,
                'message' => 'Invalid JSON response from license server: ' . $json_error_msg
            );
        }
        
        error_log('Adaire Blocks License: ===== JSON DECODING SUCCESS =====');
        error_log('Adaire Blocks License: Decoded activation response: ' . print_r($data, true));
        error_log('Adaire Blocks License: Response data type: ' . gettype($data));
        error_log('Adaire Blocks License: Response keys: ' . print_r(array_keys($data), true));
        error_log('Adaire Blocks License: ===== JSON DECODING END =====');
        
        if (!isset($data['success'])) {
            error_log('Adaire Blocks License: Activation response missing success field');
            error_log('Adaire Blocks License: Available fields in response: ' . print_r(array_keys($data), true));
            return array(
                'success' => false,
                'message' => 'Invalid response format from license server - missing success field'
            );
        }
        
        if (!$data['success']) {
            error_log('Adaire Blocks License: Activation API returned success=false');
            
            // Check for activation limit error
            if (isset($data['data']['errors']['lmfwc_rest_data_error'])) {
                $error_message = $data['data']['errors']['lmfwc_rest_data_error'][0];
                error_log('Adaire Blocks License: Activation limit error: ' . $error_message);
                
                return array(
                    'success' => false,
                    'message' => $error_message
                );
            }
            
            // Log any other errors
            if (isset($data['data']['errors'])) {
                error_log('Adaire Blocks License: Activation errors: ' . print_r($data['data']['errors'], true));
            }
            
            return array(
                'success' => false,
                'message' => 'License activation failed'
            );
        }
        
        // Handle different response structures
        $token = null;
        $activation_data = null;
        
        if (isset($data['data'])) {
            // Standard structure: {success: true, data: {token: "..."}}
            $activation_data = $data['data'];
            $token = $activation_data['token'] ?? null;
            error_log('Adaire Blocks License: Using standard data structure');
        } else {
            // Alternative structure: {success: true, token: "..."}
            $token = $data['token'] ?? null;
            $activation_data = $data;
            error_log('Adaire Blocks License: Using alternative response structure');
        }
        
        error_log('Adaire Blocks License: Activation data: ' . print_r($activation_data, true));
        
        if (!$token) {
            error_log('Adaire Blocks License: No activation token received in response');
            return array(
                'success' => false,
                'message' => 'No activation token received'
            );
        }
        
        error_log('Adaire Blocks License: Received activation token: ' . substr($token, 0, 8) . '...');
        
        // Extract activation limits from the response data
        $times_activated = 1; // Default to 1 since we just activated
        $times_activated_max = 0;
        $remaining_activations = 0;
        
        if (isset($activation_data['timesActivated'])) {
            $times_activated = $activation_data['timesActivated'];
        }
        if (isset($activation_data['timesActivatedMax'])) {
            $times_activated_max = $activation_data['timesActivatedMax'];
        }
        if (isset($activation_data['remainingActivations'])) {
            $remaining_activations = $activation_data['remainingActivations'];
        }
        
        // Save license data with correct limits
        $this->save_license_data($license_key, array(
            'activation_token' => $token,
            'status' => 'active',
            'times_activated' => $times_activated,
            'times_activated_max' => $times_activated_max,
            'remaining_activations' => $remaining_activations
        ));
        
        error_log('Adaire Blocks License: License activation successful');
        
        return array(
            'success' => true,
            'message' => 'License activated successfully',
            'token' => $token
        );
    }
    
    /**
     * Deactivate license
     */
    public function deactivate_license($license_key, $token) {
        $url = $this->validation_server_url . '/?action=deactivate&license_key=' . urlencode($license_key) . '&token=' . urlencode($token);
        
        error_log('Adaire Blocks License: Starting license deactivation via validation server');
        error_log('Adaire Blocks License: License Key: ' . substr($license_key, 0, 8) . '...');
        error_log('Adaire Blocks License: Token: ' . substr($token, 0, 8) . '...');
        error_log('Adaire Blocks License: Validation server URL: ' . $url);
        
        $response = wp_remote_get($url, array(
            'timeout' => 30,
            'headers' => array(
                'Accept' => 'application/json',
                'User-Agent' => 'Adaire-Blocks-WordPress/1.1.1'
            )
        ));
        
        if (is_wp_error($response)) {
            error_log('Adaire Blocks License: Deactivation API request failed - ' . $response->get_error_message());
            error_log('Adaire Blocks License: Error code: ' . $response->get_error_code());
            
            return array(
                'success' => false,
                'message' => 'Network error: ' . $response->get_error_message()
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_headers = wp_remote_retrieve_headers($response);
        $body = wp_remote_retrieve_body($response);
        
        error_log('Adaire Blocks License: Deactivation Response Code: ' . $response_code);
        error_log('Adaire Blocks License: Deactivation Response Headers: ' . print_r($response_headers, true));
        error_log('Adaire Blocks License: Deactivation Response Body: ' . $body);
        
        $data = json_decode($body, true);
        
        if (!$data) {
            error_log('Adaire Blocks License: Failed to decode deactivation JSON response');
            error_log('Adaire Blocks License: Raw deactivation response: ' . $body);
        } else {
            error_log('Adaire Blocks License: Decoded deactivation response: ' . print_r($data, true));
        }
        
        // Update license status regardless of API response
        $this->save_license_data($license_key, array(
            'status' => 'inactive',
            'activation_token' => null
        ));
        
        error_log('Adaire Blocks License: License deactivated successfully');
        
        return array(
            'success' => true,
            'message' => 'License deactivated successfully'
        );
    }
    
    /**
     * Check if license is active
     */
    public function is_license_active() {
        $license_data = $this->get_license_data();
        
        if (!$license_data) {
            return false;
        }
        
        // Development bypass for "douglasmasho." key
        if ($license_data['license_key'] === 'douglasmasho') {
            error_log('Adaire Blocks License: Development bypass - license is active for key: douglasmasho');
            return true;
        }
        
        return $license_data['status'] === 'active' && !empty($license_data['activation_token']);
    }
    
    /**
     * Get license status for display
     */
    public function get_license_status() {
        $license_data = $this->get_license_data();
        
        if (!$license_data) {
            return array(
                'status' => 'inactive',
                'message' => 'No license found'
            );
        }
        
        // Development bypass for "douglasmasho." key
        if ($license_data['license_key'] === 'douglasmasho') {
            error_log('Adaire Blocks License: Development bypass - returning active status for key: douglasmasho');
            return array(
                'status' => 'active',
                'message' => 'License is active (Development Mode)',
                'remaining_activations' => 999,
                'times_activated' => 1,
                'times_activated_max' => 999
            );
        }
        
        if ($license_data['status'] === 'active') {
            return array(
                'status' => 'active',
                'message' => 'License is active',
                'remaining_activations' => $license_data['remaining_activations'],
                'times_activated' => $license_data['times_activated'],
                'times_activated_max' => $license_data['times_activated_max']
            );
        }
        
        return array(
            'status' => 'inactive',
            'message' => 'License is not active'
        );
    }
    
    /**
     * AJAX handler for license activation
     */
    public function ajax_activate_license() {
        error_log('Adaire Blocks License: AJAX activation request received');
        error_log('Adaire Blocks License: POST data: ' . print_r($_POST, true));
        
        check_ajax_referer('adaire_license_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            error_log('Adaire Blocks License: AJAX activation - insufficient permissions');
            wp_die('Insufficient permissions');
        }
        
        $license_key = sanitize_text_field($_POST['license_key']);
        error_log('Adaire Blocks License: AJAX activation - raw license key: ' . $license_key);
        error_log('Adaire Blocks License: AJAX activation - sanitized license key: ' . substr($license_key, 0, 8) . '...');
        
        if (empty($license_key)) {
            error_log('Adaire Blocks License: AJAX activation - empty license key');
            wp_send_json_error(array('message' => 'License key is required'));
        }
        
        // Extract and sanitize license key if full URL was provided
        $original_key = $license_key;
        $license_key = $this->extract_license_key($license_key);
        
        if ($license_key === false) {
            error_log('Adaire Blocks License: AJAX activation - license key extraction failed');
            wp_send_json_error(array('message' => 'Invalid license key format. Please enter a valid license key.'));
        }
        
        if ($original_key !== $license_key) {
            error_log('Adaire Blocks License: AJAX activation - extracted and sanitized license key');
            error_log('Adaire Blocks License: Original input: ' . $original_key);
            error_log('Adaire Blocks License: Sanitized key: ' . $license_key);
        }
        
        $result = $this->activate_license($license_key);
        error_log('Adaire Blocks License: ===== AJAX RESPONSE TO FRONTEND =====');
        error_log('Adaire Blocks License: AJAX activation result: ' . print_r($result, true));
        error_log('Adaire Blocks License: Result success: ' . ($result['success'] ? 'true' : 'false'));
        error_log('Adaire Blocks License: Result message: ' . ($result['message'] ?? 'No message'));
        error_log('Adaire Blocks License: ===== AJAX RESPONSE END =====');
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }
    
    /**
     * AJAX handler for license deactivation
     */
    public function ajax_deactivate_license() {
        error_log('Adaire Blocks License: AJAX deactivation request received');
        error_log('Adaire Blocks License: POST data: ' . print_r($_POST, true));
        
        check_ajax_referer('adaire_license_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            error_log('Adaire Blocks License: AJAX deactivation - insufficient permissions');
            wp_die('Insufficient permissions');
        }
        
        $license_data = $this->get_license_data();
        error_log('Adaire Blocks License: AJAX deactivation - license data: ' . print_r($license_data, true));
        
        if (!$license_data || !$license_data['activation_token']) {
            error_log('Adaire Blocks License: AJAX deactivation - no active license found');
            wp_send_json_error(array('message' => 'No active license found'));
        }
        
        $result = $this->deactivate_license($license_data['license_key'], $license_data['activation_token']);
        error_log('Adaire Blocks License: AJAX deactivation result: ' . print_r($result, true));
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }
    
    /**
     * AJAX handler for license validation
     */
    public function ajax_validate_license() {
        error_log('Adaire Blocks License: AJAX validation request received');
        error_log('Adaire Blocks License: POST data: ' . print_r($_POST, true));
        
        check_ajax_referer('adaire_license_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            error_log('Adaire Blocks License: AJAX validation - insufficient permissions');
            wp_die('Insufficient permissions');
        }
        
        $license_data = $this->get_license_data();
        error_log('Adaire Blocks License: AJAX validation - license data: ' . print_r($license_data, true));
        
        if (!$license_data) {
            error_log('Adaire Blocks License: AJAX validation - no license found');
            wp_send_json_error(array('message' => 'No license found'));
        }
        
        $result = $this->validate_license($license_data['license_key']);
        error_log('Adaire Blocks License: AJAX validation result: ' . print_r($result, true));
        
        if ($result) {
            wp_send_json_success(array(
                'message' => 'License validated successfully',
                'data' => $result
            ));
        } else {
            wp_send_json_error(array('message' => 'License validation failed'));
        }
    }
    
    /**
     * Clear license data
     */
    public function clear_license_data() {
        global $wpdb;
        
        $wpdb->query("DELETE FROM {$this->table_name}");
    }
    
    /**
     * Test API endpoint to debug response format
     */
    public function ajax_test_api() {
        check_ajax_referer('adaire_license_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $license_key = sanitize_text_field($_POST['license_key'] ?? '');
        
        if (empty($license_key)) {
            wp_send_json_error(array('message' => 'License key is required for testing'));
        }
        
        // Test validation server endpoint
        $url = $this->validation_server_url . '/?action=activate&license_key=' . urlencode($license_key);
        
        error_log('Adaire Blocks License: Testing validation server endpoint');
        error_log('Adaire Blocks License: Validation server URL: ' . $url);
        
        $response = wp_remote_get($url, array(
            'timeout' => 30,
            'headers' => array(
                'Accept' => 'application/json',
                'User-Agent' => 'Adaire-Blocks-WordPress/1.1.1'
            )
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => 'Network error: ' . $response->get_error_message(),
                'error_code' => $response->get_error_code()
            ));
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_headers = wp_remote_retrieve_headers($response);
        $body = wp_remote_retrieve_body($response);
        
        $data = json_decode($body, true);
        
        // Log the complete response for debugging
        error_log('Adaire Blocks License: ===== TEST API COMPLETE RESPONSE =====');
        error_log('Adaire Blocks License: URL: ' . $url);
        error_log('Adaire Blocks License: Response Code: ' . $response_code);
        error_log('Adaire Blocks License: Response Headers: ' . print_r($response_headers->getAll(), true));
        error_log('Adaire Blocks License: Raw Body: ' . $body);
        error_log('Adaire Blocks License: Decoded Data: ' . print_r($data, true));
        error_log('Adaire Blocks License: Data Type: ' . gettype($data));
        error_log('Adaire Blocks License: Data Keys: ' . (is_array($data) ? print_r(array_keys($data), true) : 'Not an array'));
        error_log('Adaire Blocks License: ===== TEST API RESPONSE END =====');
        
        wp_send_json_success(array(
            'url' => $url,
            'response_code' => $response_code,
            'response_headers' => $response_headers->getAll(),
            'raw_body' => $body,
            'decoded_data' => $data,
            'data_type' => gettype($data),
            'data_keys' => is_array($data) ? array_keys($data) : 'Not an array'
        ));
    }
    
    /**
     * Test query parameter authentication only
     */
    public function ajax_test_auth() {
        check_ajax_referer('adaire_license_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $license_key = sanitize_text_field($_POST['license_key'] ?? '');
        
        if (empty($license_key)) {
            wp_send_json_error(array('message' => 'License key is required for testing'));
        }
        
        // Extract and sanitize license key if full URL was provided
        $original_key = $license_key;
        $license_key = $this->extract_license_key($license_key);
        
        if ($license_key === false) {
            error_log('Adaire Blocks License: Test Auth - license key extraction failed');
            wp_send_json_error(array('message' => 'Invalid license key format. Please enter a valid license key.'));
        }
        
        if ($original_key !== $license_key) {
            error_log('Adaire Blocks License: Test Auth - extracted and sanitized license key');
            error_log('Adaire Blocks License: Original input: ' . $original_key);
            error_log('Adaire Blocks License: Sanitized key: ' . $license_key);
        }
        
        $url = $this->validation_server_url . '/?action=activate&license_key=' . urlencode($license_key);
        
        // Test validation server
        error_log('Adaire Blocks License: ===== TESTING VALIDATION SERVER =====');
        
        // Log the exact request being made
        error_log('Adaire Blocks License: Making GET request to validation server: ' . $url);
        
        // Use minimal request args for validation server
        $request_args = array(
            'timeout' => 30,
            'method' => 'GET',
            'sslverify' => true,
            'httpversion' => '1.1',
            'blocking' => true,
            'headers' => array(
                'Accept' => 'application/json',
                'User-Agent' => 'Adaire-Blocks-WordPress/1.1.1'
            )
        );
        
        error_log('Adaire Blocks License: Request arguments: ' . print_r($request_args, true));
        
        // Try with wp_remote_request for more control
        $response = wp_remote_request($url, $request_args);
        
        // Log the actual request that was made (WordPress might modify it)
        if (is_wp_error($response)) {
            error_log('Adaire Blocks License: WordPress request error: ' . $response->get_error_message());
        } else {
            $response_code = wp_remote_retrieve_response_code($response);
            error_log('Adaire Blocks License: WordPress response code: ' . $response_code);
            
            // Check if WordPress modified our request
            $response_headers = wp_remote_retrieve_headers($response);
            error_log('Adaire Blocks License: Response headers from server: ' . print_r($response_headers->getAll(), true));
        }
        
        // If that fails, try with cURL directly (bypass WordPress HTTP completely)
        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) === 401) {
            error_log('Adaire Blocks License: WordPress request failed, trying direct cURL');
            $response = $this->make_direct_curl_request($url);
        }
        
        $result = array(
            'url' => $url,
            'response_code' => wp_remote_retrieve_response_code($response),
            'body' => wp_remote_retrieve_body($response),
            'is_error' => is_wp_error($response),
            'headers' => wp_remote_retrieve_headers($response)->getAll()
        );
        
        error_log('Adaire Blocks License: ===== QUERY PARAM AUTH TEST RESULT =====');
        error_log('Adaire Blocks License: Test Result: ' . print_r($result, true));
        
        wp_send_json_success($result);
    }
    
    /**
     * AJAX handler to save activation result to database
     */
    public function ajax_save_activation() {
        error_log('Adaire Blocks License: AJAX save activation request received');
        error_log('Adaire Blocks License: POST data: ' . print_r($_POST, true));
        
        check_ajax_referer('adaire_license_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            error_log('Adaire Blocks License: AJAX save activation - insufficient permissions');
            wp_die('Insufficient permissions');
        }
        
        $license_key = sanitize_text_field($_POST['license_key']);
        
        error_log('Adaire Blocks License: License key: ' . substr($license_key, 0, 8) . '...');
        error_log('Adaire Blocks License: POST data: ' . print_r($_POST, true));
        
        if (empty($license_key)) {
            error_log('Adaire Blocks License: AJAX save activation - missing license key');
            wp_send_json_error(array('message' => 'Missing license key'));
        }
        
        // Handle activation data - it might be an array or JSON string
        $activation_data = null;
        if (isset($_POST['activation_data'])) {
            if (is_array($_POST['activation_data'])) {
                // Already an array
                $activation_data = $_POST['activation_data'];
                error_log('Adaire Blocks License: Activation data received as array');
            } else {
                // Try to decode as JSON
                $activation_data = json_decode($_POST['activation_data'], true);
                error_log('Adaire Blocks License: Activation data received as JSON string');
            }
        }
        
        if (!$activation_data) {
            error_log('Adaire Blocks License: AJAX save activation - invalid activation data');
            wp_send_json_error(array('message' => 'Invalid activation data format'));
        }
        
        error_log('Adaire Blocks License: Parsed activation data: ' . print_r($activation_data, true));
        
        // Extract token from activation data
        $token = null;
        if (isset($activation_data['data']['token'])) {
            $token = $activation_data['data']['token'];
        } elseif (isset($activation_data['data']['activationData']['token'])) {
            $token = $activation_data['data']['activationData']['token'];
        } elseif (isset($activation_data['token'])) {
            $token = $activation_data['token'];
        }
        
        if (!$token) {
            error_log('Adaire Blocks License: AJAX save activation - no token found in response');
            wp_send_json_error(array('message' => 'No activation token found in response'));
        }
        
        error_log('Adaire Blocks License: Extracted token: ' . substr($token, 0, 8) . '...');
        
        // Extract activation limits from the activation data
        $times_activated = 1; // Default to 1 since we just activated
        $times_activated_max = 0;
        $remaining_activations = 0;
        
        if (isset($activation_data['data']['timesActivated'])) {
            $times_activated = $activation_data['data']['timesActivated'];
        }
        if (isset($activation_data['data']['timesActivatedMax'])) {
            $times_activated_max = $activation_data['data']['timesActivatedMax'];
        }
        if (isset($activation_data['data']['remainingActivations'])) {
            $remaining_activations = $activation_data['data']['remainingActivations'];
        }
        
        // Save license data to database with correct limits
        $this->save_license_data($license_key, array(
            'activation_token' => $token,
            'status' => 'active',
            'times_activated' => $times_activated,
            'times_activated_max' => $times_activated_max,
            'remaining_activations' => $remaining_activations
        ));
        
        error_log('Adaire Blocks License: License activation saved to database successfully');
        
        // Verify the save worked by retrieving the data
        $saved_data = $this->get_license_data();
        error_log('Adaire Blocks License: Verification - saved license data: ' . print_r($saved_data, true));
        
        wp_send_json_success(array(
            'message' => 'License activation saved successfully',
            'token' => $token,
            'saved_data' => $saved_data
        ));
    }
    
    /**
     * AJAX handler to save deactivation result to database
     */
    public function ajax_save_deactivation() {
        error_log('Adaire Blocks License: AJAX save deactivation request received');
        
        check_ajax_referer('adaire_license_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            error_log('Adaire Blocks License: AJAX save deactivation - insufficient permissions');
            wp_die('Insufficient permissions');
        }
        
        // Get current license data
        $license_data = $this->get_license_data();
        
        if (!$license_data) {
            error_log('Adaire Blocks License: AJAX save deactivation - no license data found');
            wp_send_json_error(array('message' => 'No license data found'));
        }
        
        // Update license status to inactive
        $this->save_license_data($license_data['license_key'], array(
            'status' => 'inactive',
            'activation_token' => null
        ));
        
        error_log('Adaire Blocks License: License deactivation saved to database successfully');
        
        wp_send_json_success(array(
            'message' => 'License deactivation saved successfully'
        ));
    }
    
    /**
     * AJAX handler to update license data with validation results
     */
    public function ajax_update_license_data() {
        error_log('Adaire Blocks License: AJAX update license data request received');
        
        check_ajax_referer('adaire_license_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            error_log('Adaire Blocks License: AJAX update license data - insufficient permissions');
            wp_die('Insufficient permissions');
        }
        
        // Handle validation data - it might be an array or JSON string
        $validation_data = null;
        if (isset($_POST['validation_data'])) {
            if (is_array($_POST['validation_data'])) {
                // Already an array
                $validation_data = $_POST['validation_data'];
                error_log('Adaire Blocks License: Validation data received as array');
            } else {
                // Try to decode as JSON
                $validation_data = json_decode($_POST['validation_data'], true);
                error_log('Adaire Blocks License: Validation data received as JSON string');
            }
        }
        
        if (!$validation_data) {
            error_log('Adaire Blocks License: AJAX update license data - invalid validation data');
            wp_send_json_error(array('message' => 'Invalid validation data format'));
        }
        
        error_log('Adaire Blocks License: Validation data: ' . print_r($validation_data, true));
        
        // Get current license data
        $license_data = $this->get_license_data();
        
        if (!$license_data) {
            error_log('Adaire Blocks License: AJAX update license data - no license data found');
            wp_send_json_error(array('message' => 'No license data found'));
        }
        
        // Update license data with validation results
        $update_data = array(
            'status' => 'active',
            'times_activated' => $validation_data['timesActivated'] ?? $license_data['times_activated'],
            'times_activated_max' => $validation_data['timesActivatedMax'] ?? $license_data['times_activated_max'],
            'remaining_activations' => $validation_data['remainingActivations'] ?? $license_data['remaining_activations']
        );
        
        $this->save_license_data($license_data['license_key'], $update_data);
        
        error_log('Adaire Blocks License: License data updated successfully');
        
        wp_send_json_success(array(
            'message' => 'License data updated successfully'
        ));
    }
    
    /**
     * Make direct cURL request bypassing WordPress HTTP completely
     */
    private function make_direct_curl_request($url) {
        error_log('Adaire Blocks License: Making direct cURL request to: ' . $url);
        
        if (!function_exists('curl_init')) {
            error_log('Adaire Blocks License: cURL not available');
            return new WP_Error('curl_not_available', 'cURL is not available on this server');
        }
        
        $ch = curl_init();
        
        curl_setopt_array($ch, array(
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json',
                'Accept: application/json',
                'User-Agent: PostmanRuntime/7.32.3'
            ),
            CURLOPT_VERBOSE => true,
            CURLOPT_STDERR => fopen('php://temp', 'w+')
        ));
        
        $response_body = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        
        // Get verbose output
        rewind(curl_getinfo($ch, CURLOPT_STDERR));
        $verbose_output = stream_get_contents(curl_getinfo($ch, CURLOPT_STDERR));
        
        curl_close($ch);
        
        error_log('Adaire Blocks License: cURL HTTP Code: ' . $http_code);
        error_log('Adaire Blocks License: cURL Response Body: ' . $response_body);
        error_log('Adaire Blocks License: cURL Error: ' . $curl_error);
        error_log('Adaire Blocks License: cURL Verbose Output: ' . $verbose_output);
        
        if ($curl_error) {
            return new WP_Error('curl_error', $curl_error);
        }
        
        // Create a WordPress-compatible response array
        return array(
            'headers' => array(),
            'body' => $response_body,
            'response' => array(
                'code' => $http_code,
                'message' => 'OK'
            ),
            'cookies' => array(),
            'filename' => null
        );
    }
}
