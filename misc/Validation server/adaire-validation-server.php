<?php
/**
 * Plugin Name: Adaire Validation Server
 * Description: License validation server for Adaire Blocks
 * Version: 1.0.0
 * Author: Adaire
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add rewrite rule for validation server endpoint
add_action('init', 'adaire_validation_server_rewrite_rules');
function adaire_validation_server_rewrite_rules() {
    add_rewrite_rule(
        '^validation-server/?$',
        'index.php?adaire_validation_server=1',
        'top'
    );
}

// Add query var
add_filter('query_vars', 'adaire_validation_server_query_vars');
function adaire_validation_server_query_vars($vars) {
    $vars[] = 'adaire_validation_server';
    return $vars;
}

// Handle the validation server request
add_action('template_redirect', 'adaire_validation_server_handler');
function adaire_validation_server_handler() {
    if (get_query_var('adaire_validation_server')) {
        // Include the validation server logic
        include plugin_dir_path(__FILE__) . 'index.php';
        exit;
    }
}

// Flush rewrite rules on activation
register_activation_hook(__FILE__, 'adaire_validation_server_activate');
function adaire_validation_server_activate() {
    adaire_validation_server_rewrite_rules();
    flush_rewrite_rules();
}

// Flush rewrite rules on deactivation
register_deactivation_hook(__FILE__, 'adaire_validation_server_deactivate');
function adaire_validation_server_deactivate() {
    flush_rewrite_rules();
}
?>
