<?php
/**
 * Validation Server Configuration
 * Centralized configuration for validation server settings
 *
 * @package AdaireBlocks
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AdaireBlocksValidationConfig {
    
    /**
     * Validation server base URL
     * Change this to point to your validation server
     */
    const VALIDATION_SERVER_URL = 'https://adaireblocks.com/validation-server';
    
    /**
     * Get the validation server URL
     * 
     * @return string
     */
    public static function get_validation_server_url() {
        return self::VALIDATION_SERVER_URL;
    }
    
    /**
     * Get validation server URL for a specific action
     * 
     * @param string $action The action (validate, activate, deactivate)
     * @param string $license_key The license key
     * @param string $token Optional token for deactivation
     * @return string
     */
    public static function get_validation_url($action, $license_key, $token = null) {
        $url = self::VALIDATION_SERVER_URL . '/?action=' . $action . '&license_key=' . urlencode($license_key);
        
        if ($token && $action === 'deactivate') {
            $url .= '&token=' . urlencode($token);
        }
        
        return $url;
    }
    
    /**
     * Get JavaScript configuration for frontend
     * 
     * @return array
     */
    public static function get_js_config() {
        return array(
            'validationServerUrl' => self::VALIDATION_SERVER_URL
        );
    }
}
?>
