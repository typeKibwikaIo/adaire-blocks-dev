<?php
/**
 * Adaire Blocks License Validation Server
 * 
 * This server handles all license validation, activation, and deactivation operations
 * to keep client credentials secure on the server side.
 * 
 * Deployed at: https://adaireblocks.com/validation-server/
 * 
 * @package AdaireBlocks
 */

// Enable CORS for WordPress plugin requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration - Store credentials securely on server
// Use $GLOBALS to ensure config is accessible across all function scopes
$GLOBALS['config'] = [
    'consumer_key' => 'ck_5a9271d84ab660911a7c48dfd3f89e1691d9e286',
    'consumer_secret' => 'cs_d92b496a59e64042539c7e6eb14f17697d347827',
    'base_url' => 'https://adaireblocks.com/wp-json/lmfwc/v2/licenses/',
    'timeout' => 30,
    'log_file' => defined('WP_CONTENT_DIR') ? WP_CONTENT_DIR . '/debug.log' : __DIR__ . '/../../debug.log'
];

// Also set as local variable for backward compatibility
$config = $GLOBALS['config'];

/**
 * Custom logging function that writes to WordPress debug.log
 */
function writeToDebugLog($message) {
    global $config;
    
    // Fallback to error_log if config is not available
    if (!isset($config['log_file']) || empty($config['log_file'])) {
        error_log($message);
        return;
    }
    
    $log_file = $config['log_file'];
    $timestamp = date('Y-m-d H:i:s');
    $formatted_message = "[{$timestamp}] {$message}\n";
    
    // Write to file with error handling
    try {
        @file_put_contents($log_file, $formatted_message, FILE_APPEND | LOCK_EX);
    } catch (Exception $e) {
        // Fallback to error_log if file write fails
        error_log($message);
    }
    
    // Also use error_log as backup
    error_log($message);
}

/**
 * Log server operations for debugging
 */
function logServerOperation($operation, $data) {
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'operation' => $operation,
        'data' => $data,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
        'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
    ];
    
    writeToDebugLog('Adaire Validation Server: ' . json_encode($log_entry, JSON_PRETTY_PRINT));
}

/**
 * Log detailed request information
 */
function logRequestDetails() {
    $request_info = [
        'timestamp' => date('Y-m-d H:i:s'),
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
        'uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
        'query_string' => $_SERVER['QUERY_STRING'] ?? '',
        'headers' => getallheaders(),
        'get_params' => $_GET,
        'post_params' => $_POST,
        'raw_input' => file_get_contents('php://input'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    writeToDebugLog('=== VALIDATION SERVER REQUEST START ===');
    writeToDebugLog('REQUEST DETAILS: ' . json_encode($request_info, JSON_PRETTY_PRINT));
    writeToDebugLog('=== VALIDATION SERVER REQUEST END ===');
}

/**
 * Log detailed response information
 */
function logResponseDetails($response) {
    $response_info = [
        'timestamp' => date('Y-m-d H:i:s'),
        'response' => $response,
        'response_size' => strlen(json_encode($response))
    ];
    
    writeToDebugLog('=== VALIDATION SERVER RESPONSE START ===');
    writeToDebugLog('RESPONSE DETAILS: ' . json_encode($response_info, JSON_PRETTY_PRINT));
    writeToDebugLog('=== VALIDATION SERVER RESPONSE END ===');
}

/**
 * Make authenticated request to license API
 */
function makeLicenseRequest($endpoint, $method = 'GET', $data = []) {
    global $config;
    
    $url = $config['base_url'] . $endpoint;
    
    // Check if endpoint already has query parameters
    $separator = (strpos($endpoint, '?') !== false) ? '&' : '?';
    
    $url .= $separator . 'consumer_key=' . urlencode($config['consumer_key']);
    $url .= '&consumer_secret=' . urlencode($config['consumer_secret']);
    
    // Log the API request details
    $request_log = [
        'endpoint' => $endpoint,
        'method' => $method,
        'url' => $url,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    writeToDebugLog('=== LICENSE API REQUEST START ===');
    writeToDebugLog('API REQUEST: ' . json_encode($request_log, JSON_PRETTY_PRINT));
    
    // Create a temporary stream for verbose output
    $verbose_stream = fopen('php://temp', 'w+');
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => $config['timeout'],
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'User-Agent: Adaire-Blocks-Validation-Server/1.0'
        ],
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_VERBOSE => true,
        CURLOPT_STDERR => $verbose_stream
    ]);
    
    if ($method === 'POST' && !empty($data)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Content-Type: application/json',
            'User-Agent: Adaire-Blocks-Validation-Server/1.0'
        ]);
    }
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    // Get verbose output safely
    $verbose_output = '';
    if (is_resource($verbose_stream)) {
        rewind($verbose_stream);
        $verbose_output = stream_get_contents($verbose_stream);
        fclose($verbose_stream);
    }
    
    curl_close($ch);
    
    // Log the API response details
    $response_log = [
        'http_code' => $http_code,
        'error' => $error,
        'response_length' => strlen($response),
        'response_preview' => substr($response, 0, 500),
        'verbose_output' => $verbose_output,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    writeToDebugLog('API RESPONSE: ' . json_encode($response_log, JSON_PRETTY_PRINT));
    writeToDebugLog('=== LICENSE API REQUEST END ===');
    
    if ($error) {
        // Create a sanitized version of the URL for debugging (mask credentials)
        $debug_url_sanitized = preg_replace(
            '/consumer_key=[^&]+&consumer_secret=[^&]+/',
            'consumer_key=***HIDDEN***&consumer_secret=***HIDDEN***',
            $url
        );
        
        return [
            'success' => false,
            'error' => 'CURL Error: ' . $error,
            'debug_url' => $url,  // Full URL for server logs
            'debug_url_safe' => $debug_url_sanitized  // Sanitized URL for client display
        ];
    }
    
    $decoded_response = json_decode($response, true);
    
    // Create a sanitized version of the URL for debugging (mask credentials)
    $debug_url_sanitized = preg_replace(
        '/consumer_key=[^&]+&consumer_secret=[^&]+/',
        'consumer_key=***HIDDEN***&consumer_secret=***HIDDEN***',
        $url
    );
    
    return [
        'success' => $http_code >= 200 && $http_code < 300,
        'http_code' => $http_code,
        'data' => $decoded_response,
        'raw_response' => $response,
        'debug_url' => $url,  // Full URL for server logs
        'debug_url_safe' => $debug_url_sanitized  // Sanitized URL for client display
    ];
}

/**
 * Validate license key
 */
function validateLicense($license_key) {
    logServerOperation('validate', ['license_key' => $license_key]);
    
    if (empty($license_key)) {
        return [
            'success' => false,
            'error' => 'License key is required'
        ];
    }
    
    $result = makeLicenseRequest('validate/' . $license_key);
    
    if (!$result['success']) {
        return [
            'success' => false,
            'error' => 'Validation request failed',
            'details' => $result,
            'debug_url' => $result['debug_url'] ?? null
        ];
    }
    
    return [
        'success' => true,
        'data' => $result['data'],
        'debug_url' => $result['debug_url'] ?? null
    ];
}

/**
 * Activate license key
 */
function activateLicense($license_key) {
    logServerOperation('activate', ['license_key' => $license_key]);
    
    if (empty($license_key)) {
        return [
            'success' => false,
            'error' => 'License key is required'
        ];
    }
    
    $result = makeLicenseRequest('activate/' . $license_key);
    
    if (!$result['success']) {
        return [
            'success' => false,
            'error' => 'Activation request failed',
            'details' => $result,
            'debug_url' => $result['debug_url'] ?? null
        ];
    }
    
    // Normalize the response structure to ensure token is accessible
    // LMFWC API might return token in different locations, so we extract and normalize it
    $api_response = $result['data'];
    $token = null;
    $normalized_data = $api_response;
    
    // Try to extract token from various possible locations in the API response
    if (is_array($api_response)) {
        // Check direct token location
        if (isset($api_response['token'])) {
            $token = $api_response['token'];
        }
        // Check nested in data.data.token
        elseif (isset($api_response['data']['token'])) {
            $token = $api_response['data']['token'];
            $normalized_data = $api_response['data']; // Use the nested data
        }
        // Check nested in data.data.data.token (double nesting)
        elseif (isset($api_response['data']['data']['token'])) {
            $token = $api_response['data']['data']['token'];
            $normalized_data = $api_response['data']['data']; // Use the double-nested data
        }
        // Check in activationData.token
        elseif (isset($api_response['activationData']['token'])) {
            $token = $api_response['activationData']['token'];
        }
        // Check in data.activationData.token
        elseif (isset($api_response['data']['activationData']['token'])) {
            $token = $api_response['data']['activationData']['token'];
        }
        
        // Ensure token is at the top level of data for easy access
        if ($token && is_array($normalized_data)) {
            $normalized_data['token'] = $token;
        }
        
        // Log the extraction for debugging
        writeToDebugLog('Adaire Validation Server: Token extraction - ' . 
            ($token ? 'Token found: ' . substr($token, 0, 8) . '...' : 'No token found in response'));
        writeToDebugLog('Adaire Validation Server: Original API response structure: ' . json_encode($api_response));
        writeToDebugLog('Adaire Validation Server: Normalized data structure: ' . json_encode($normalized_data));
    }
    
    return [
        'success' => true,
        'data' => $normalized_data,
        'debug_url' => $result['debug_url'] ?? null
    ];
}

/**
 * Deactivate license key
 */
function deactivateLicense($license_key, $token = null) {
    logServerOperation('deactivate', ['license_key' => $license_key, 'token' => $token]);
    
    if (empty($license_key)) {
        return [
            'success' => false,
            'error' => 'License key is required'
        ];
    }
    
    $endpoint = 'deactivate/' . $license_key;
    if ($token) {
        // Add token as a query parameter - makeLicenseRequest will handle the separator
        $endpoint .= '?token=' . urlencode($token);
    }
    
    $result = makeLicenseRequest($endpoint);
    
    if (!$result['success']) {
        return [
            'success' => false,
            'error' => 'Deactivation request failed',
            'details' => $result,
            'debug_url' => $result['debug_url'] ?? null
        ];
    }
    
    return [
        'success' => true,
        'data' => $result['data'],
        'debug_url' => $result['debug_url'] ?? null
    ];
}

/**
 * Health check endpoint
 */
function healthCheck() {
    logServerOperation('health_check', []);
    
    // Test basic server functionality
    $server_info = [
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s'),
        'server_time' => time(),
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'Unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
        'remote_ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown'
    ];
    
    // Test cURL availability
    if (function_exists('curl_init')) {
        $server_info['curl_available'] = true;
        
        // Test basic connectivity to license API
        global $config;
        $test_url = $config['base_url'] . '?consumer_key=' . urlencode($config['consumer_key']) . '&consumer_secret=' . urlencode($config['consumer_secret']);
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $test_url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_NOBODY => true, // HEAD request only
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_FOLLOWLOCATION => true
        ]);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        $server_info['license_api_connectivity'] = [
            'reachable' => !$error && $http_code > 0,
            'http_code' => $http_code,
            'error' => $error ?: null
        ];
    } else {
        $server_info['curl_available'] = false;
        $server_info['license_api_connectivity'] = [
            'reachable' => false,
            'error' => 'cURL not available'
        ];
    }
    
    return [
        'success' => true,
        'data' => $server_info
    ];
}

/**
 * Handle incoming requests
 */
function handleRequest() {
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    $license_key = $_GET['license_key'] ?? $_POST['license_key'] ?? '';
    $token = $_GET['token'] ?? $_POST['token'] ?? null;
    
    // Sanitize inputs
    $license_key = trim($license_key);
    $token = $token ? trim($token) : null;
    
    switch ($action) {
        case 'health':
        case 'healthcheck':
        case 'status':
            $result = healthCheck();
            break;
            
        case 'validate':
            $result = validateLicense($license_key);
            break;
            
        case 'activate':
            $result = activateLicense($license_key);
            break;
            
        case 'deactivate':
            $result = deactivateLicense($license_key, $token);
            break;
            
        default:
            $result = [
                'success' => false,
                'error' => 'Invalid action. Supported actions: health, validate, activate, deactivate'
            ];
    }
    
    return $result;
}

// Main execution
try {
    // Log detailed request information
    logRequestDetails();
    
    $result = handleRequest();
    
    // Log detailed response information
    logResponseDetails($result);
    
    echo json_encode($result);
} catch (Exception $e) {
    $error_response = [
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ];
    
    logServerOperation('error', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
    logResponseDetails($error_response);
    
    echo json_encode($error_response);
}
?>
