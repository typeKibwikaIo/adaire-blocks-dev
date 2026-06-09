# WordPress Best Practices Guide

This document outlines the WordPress coding standards and best practices used in the Adaire Blocks plugin.

## Table of Contents
1. [Enqueuing Scripts and Styles](#enqueuing-scripts-and-styles)
2. [Security Practices](#security-practices)
3. [Version Management](#version-management)
4. [Code Organization](#code-organization)

---

## Enqueuing Scripts and Styles

### ✅ DO: Use WordPress Enqueue Functions

**Always use WordPress enqueue functions instead of inline scripts/styles:**

```php
// ✅ CORRECT: Properly enqueue scripts
function enqueue_admin_assets($hook) {
    if ($hook !== 'my-admin-page') {
        return;
    }
    
    // Get plugin version for cache busting
    $main_plugin_file = dirname(dirname(__FILE__)) . '/adaire-blocks.php';
    $plugin_version = '1.0.0';
    if (file_exists($main_plugin_file)) {
        $plugin_data = get_file_data($main_plugin_file, array('Version' => 'Version'), false);
        $plugin_version = !empty($plugin_data['Version']) ? $plugin_data['Version'] : '1.0.0';
    }
    
    // Enqueue styles
    wp_enqueue_style(
        'my-plugin-style',
        plugin_dir_url(__FILE__) . 'css/my-style.css',
        array(), // Dependencies
        $plugin_version // Version for cache busting
    );
    
    // Enqueue scripts
    wp_enqueue_script(
        'my-plugin-script',
        plugin_dir_url(__FILE__) . 'js/my-script.js',
        array(), // Dependencies (e.g., array('jquery'))
        $plugin_version, // Version
        true // Load in footer
    );
    
    // Pass PHP data to JavaScript using wp_localize_script
    wp_localize_script(
        'my-plugin-script',
        'myPluginData', // JavaScript object name
        array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('my_action'),
            'postUrl' => admin_url('post.php'),
        )
    );
}
add_action('admin_enqueue_scripts', 'enqueue_admin_assets');
```

### ❌ DON'T: Use Inline Scripts/Styles

**Never output scripts/styles directly in PHP:**

```php
// ❌ WRONG: Inline script tag
<script>
    var ajaxUrl = '<?php echo admin_url('admin-ajax.php'); ?>';
    // ... JavaScript code ...
</script>

// ❌ WRONG: Inline style tag
<style>
    .my-class { color: red; }
</style>
```

### JavaScript File Structure

**When creating JavaScript files, access PHP data through localized script:**

```javascript
// ✅ CORRECT: Access PHP data via localized script
fetch(myPluginData.ajaxUrl, {
    method: 'POST',
    body: 'action=my_action&nonce=' + myPluginData.nonce
});

// ❌ WRONG: Hardcoded URLs or embedded PHP
fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
    // This won't work in external JS files
});
```

---

## Security Practices

### 1. Output Escaping

**Always escape output using appropriate WordPress functions:**

```php
// ✅ CORRECT: Escape HTML output
echo esc_html($variable);
echo esc_attr($attribute_value);
echo esc_url($url);
echo esc_js($javascript_value);
echo esc_textarea($textarea_content);

// ❌ WRONG: Unescaped output
echo $variable; // Security risk!
```

### 2. Input Sanitization

**Always sanitize user input:**

```php
// ✅ CORRECT: Sanitize input
if (isset($_GET['settings-updated'])) {
    $settings_updated = sanitize_text_field(wp_unslash($_GET['settings-updated']));
    // Use sanitized value
}

// ❌ WRONG: Direct use of superglobals
$value = $_GET['settings-updated']; // Security risk!
```

### 3. Nonce Verification

**Always verify nonces for form submissions and AJAX requests:**

```php
// ✅ CORRECT: Verify nonce
if (isset($_REQUEST['_wpnonce'])) {
    $nonce = sanitize_text_field(wp_unslash($_REQUEST['_wpnonce']));
    if (wp_verify_nonce($nonce, 'my_action')) {
        // Process request
    }
}

// For AJAX requests
function my_ajax_handler() {
    check_ajax_referer('my_action', 'nonce');
    // Process AJAX request
}
add_action('wp_ajax_my_action', 'my_ajax_handler');
```

### 4. Capability Checks

**Always check user capabilities:**

```php
// ✅ CORRECT: Check capability
if (!current_user_can('manage_options')) {
    wp_die('Unauthorized access');
}

// ❌ WRONG: No capability check
// Anyone could access this!
```

### 5. SVG Content Escaping

**Use wp_kses() for SVG content:**

```php
// ✅ CORRECT: Escape SVG with allowed tags
$allowed_svg = array(
    'svg' => array(
        'xmlns' => true,
        'width' => true,
        'height' => true,
        'viewBox' => true,
        'fill' => true,
    ),
    'path' => array(
        'd' => true,
        'fill' => true,
        'stroke' => true,
    ),
);
echo wp_kses($svg_content, $allowed_svg);

// ❌ WRONG: Direct SVG output
echo $svg_content; // Security risk!
```

---

## Version Management

### Plugin Version Detection

**Always include version numbers for cache busting:**

```php
// ✅ CORRECT: Get version from plugin file
function get_plugin_version() {
    $main_plugin_file = dirname(dirname(__FILE__)) . '/adaire-blocks.php';
    $plugin_version = '1.0.0';
    if (file_exists($main_plugin_file)) {
        $plugin_data = get_file_data($main_plugin_file, array('Version' => 'Version'), false);
        $plugin_version = !empty($plugin_data['Version']) ? $plugin_data['Version'] : '1.0.0';
    }
    return $plugin_version;
}

// Use in enqueue functions
wp_enqueue_style('my-style', $url, array(), get_plugin_version());
```

---

## Code Organization

### 1. Separate JavaScript Files

**Keep JavaScript in separate files, not inline:**

```
admin/
├── js/
│   ├── admin-settings.js
│   ├── block-migration.js
│   └── auto-block-recovery.js
├── css/
│   └── admin-settings.css
└── settings-page.php
```

### 2. Debug Code

**Wrap debug code in WP_DEBUG checks:**

```php
// ✅ CORRECT: Debug code only in development
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('Debug message: ' . print_r($data, true));
}

// ❌ WRONG: Debug code in production
error_log('Debug message'); // Runs in production!
```

### 3. Function Naming

**Use descriptive, prefixed function names:**

```php
// ✅ CORRECT: Prefixed function names
function adaire_blocks_enqueue_assets() { }
function adaire_blocks_migration_page() { }

// ❌ WRONG: Generic function names
function enqueue_assets() { } // Could conflict with other plugins
```

---

## WordPress Hooks

### Admin Enqueue Hooks

**Use appropriate hooks for admin pages:**

```php
// For admin pages
add_action('admin_enqueue_scripts', 'my_admin_enqueue_function');

// For frontend
add_action('wp_enqueue_scripts', 'my_frontend_enqueue_function');

// For block editor
add_action('enqueue_block_editor_assets', 'my_editor_enqueue_function');
```

### Hook Priority

**Use appropriate priorities:**

```php
// Default priority is 10
add_action('init', 'my_function');

// Higher priority = earlier execution
add_action('init', 'my_early_function', 5);

// Lower priority = later execution
add_action('init', 'my_late_function', 20);
```

---

## Checklist

Before submitting code, ensure:

- [ ] All scripts/styles are enqueued using `wp_enqueue_script()` / `wp_enqueue_style()`
- [ ] No inline `<script>` or `<style>` tags in PHP files
- [ ] All output is escaped (`esc_html()`, `esc_attr()`, `esc_url()`, etc.)
- [ ] All input is sanitized (`sanitize_text_field()`, `wp_unslash()`, etc.)
- [ ] Nonces are verified for form submissions and AJAX requests
- [ ] User capabilities are checked (`current_user_can()`)
- [ ] Version numbers are included in enqueue functions
- [ ] Debug code is wrapped in `WP_DEBUG` checks
- [ ] Function names are prefixed with plugin name
- [ ] PHP data is passed to JavaScript via `wp_localize_script()`

---

## References

- [WordPress Plugin Handbook - Enqueuing Scripts](https://developer.wordpress.org/plugins/plugin-basics/including-css-javascript/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
- [WordPress Security Best Practices](https://developer.wordpress.org/advanced-administration/security/)
- [WordPress Script API](https://developer.wordpress.org/reference/functions/wp_enqueue_script/)
- [WordPress Style API](https://developer.wordpress.org/reference/functions/wp_enqueue_style/)

---

**Last Updated:** 2024
**Maintained by:** Adaire Blocks Development Team

