# Validation Server Configuration

## 🔧 Quick Setup

To change the validation server URL, you only need to update **ONE** file:

### **File: `includes/class-adaire-blocks-validation-config.php`**

```php
class AdaireBlocksValidationConfig {
    /**
     * Validation server base URL
     * Change this to point to your validation server
     */
    const VALIDATION_SERVER_URL = 'https://adaireblocks.com/validation-server';
}
```

## 📍 What Gets Updated Automatically

When you change the URL in the config file, it automatically updates:

- ✅ **PHP License Class** - All API calls use the new URL
- ✅ **JavaScript Frontend** - All AJAX calls use the new URL  
- ✅ **Test Methods** - Debug endpoints use the new URL
- ✅ **All License Operations** - Validate, Activate, Deactivate

## 🚀 Deployment Examples

### **Option 1: Subdomain**
```php
const VALIDATION_SERVER_URL = 'https://validation.adaireblocks.com';
```

### **Option 2: Subdirectory**
```php
const VALIDATION_SERVER_URL = 'https://adaire.digital/validation-server';
```

### **Option 3: Different Domain**
```php
const VALIDATION_SERVER_URL = 'https://api.adaireblocks.com/license';
```

## 🔄 How It Works

1. **Config Class** - Centralized URL storage
2. **License Class** - Loads URL from config
3. **License Page** - Passes URL to JavaScript
4. **JavaScript** - Uses URL for all API calls

## 🛠️ Advanced Configuration

You can also use the helper methods:

```php
// Get base URL
$url = AdaireBlocksValidationConfig::get_validation_server_url();

// Get URL for specific action
$validate_url = AdaireBlocksValidationConfig::get_validation_url('validate', 'license-key');
$activate_url = AdaireBlocksValidationConfig::get_validation_url('activate', 'license-key');
$deactivate_url = AdaireBlocksValidationConfig::get_validation_url('deactivate', 'license-key', 'token');
```

## ✅ Benefits

- **Single Point of Control** - Change URL in one place
- **No Code Duplication** - URL defined once, used everywhere
- **Easy Deployment** - Simple configuration for different environments
- **Type Safety** - PHP constants prevent typos
- **Maintainable** - Clear separation of configuration and logic
