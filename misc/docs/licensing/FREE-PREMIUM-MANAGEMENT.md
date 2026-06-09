# Free vs Premium Plugin Management

This document explains how to maintain both free and premium versions of Adaire Blocks using the new modular system.

## 🎯 Overview

The new system allows you to maintain **one codebase** while automatically generating both free and premium versions through configuration-driven feature management.

## 📁 File Structure

```
adaire-blocks/
├── config/
│   └── blocks-config.json          # Feature configuration
├── includes/
│   └── class-adaire-blocks-config.php  # Configuration manager
├── scripts/
│   └── generate-free-version.js    # Free version generator
├── src/
│   └── components/
│       └── UpgradeNotice.js        # Upgrade prompts
└── docs/
    └── FREE-PREMIUM-MANAGEMENT.md  # This file
```

## ⚙️ Configuration System

### Version Detection

The system automatically detects whether it's running in free or premium mode:

1. **Free Version**: Has `ADAIRE_BLOCKS_IS_FREE` constant set to `true`
2. **Premium Version**: Has active license or no free constant defined
3. **Fallback**: Development version defaults to premium

### Block Configuration (`config/blocks-config.json`)

Each block can have different configurations for free vs premium:

```json
{
  "free": {
    "accordion-block": {
      "enabled": true,
      "limits": {
        "maxItems": 3
      },
      "upgradeMessage": "Go pro to add more accordion items."
    },
    "video-hero-block": {
      "enabled": false,
      "upgradeMessage": "Video Hero Block is a Premium feature."
    }
  },
  "premium": {
    "accordion-block": {
      "enabled": true,
      "limits": {},
      "features": ["unlimited-items", "advanced-styling"]
    },
    "video-hero-block": {
      "enabled": true,
      "limits": {},
      "features": ["multiple-videos", "advanced-controls"]
    }
  }
}
```

### Configuration Options

- **`enabled`**: Whether the block is available in this version
- **`limits`**: Restrictions for free version (e.g., max items, duration limits)
- **`features`**: Available features for premium version
- **`upgradeMessage`**: Message shown when users hit limits or try to use premium features

## 🚀 Usage

### 1. Adding New Blocks

When adding a new block:

1. **Add to configuration** in `config/blocks-config.json`
2. **Set limits** for free version
3. **Add upgrade message**
4. **Implement limits** in block code using `AdaireBlocksConfig`

### 2. Implementing Limits in Blocks

Use the `useBlockLimits` hook for automatic limit checking:

```javascript
// In block edit component
import { useBlockLimits } from '../components/useBlockLimits';
import UpgradeNotice from '../components/UpgradeNotice';

const Edit = (props) => {
    const { attributes, setAttributes } = props;
    
    // Automatically check limits for this block
    const { isLimitReached, showUpgradeNotice, upgradeMessage } = useBlockLimits(
        'accordion-block', 
        attributes.items || [], 
        'accordion'
    );
    
    const addItem = () => {
        if (isLimitReached) {
            return; // Don't add if limit reached
        }
        // Add item logic here
    };
    
    return (
        <div>
            <Button 
                onClick={addItem}
                disabled={isLimitReached}
            >
                Add Item
            </Button>
            
            {showUpgradeNotice && (
                <UpgradeNotice 
                    variant="inline"
                    itemType="accordion"
                    message={upgradeMessage}
                />
            )}
        </div>
    );
};
```

### 3. PHP Integration

#### Automatic Upgrade Notices for Render Callbacks

Use the helper function for automatic upgrade notices:

```php
function render_my_block($attributes) {
    // Automatically handles upgrade notices for free users
    return adaire_render_block_with_notice('my-block', $attributes, function($attrs) {
        // Your block rendering logic here
        return '<div>Block content</div>';
    });
}
```

#### Manual Configuration Checks

```php
// Check if feature is available
$config = AdaireBlocksConfig::get_instance();
if (!$config->is_feature_available('accordion-block', 'unlimited-items')) {
    // Show upgrade notice or limit functionality
}

// Check limits
if ($config->is_limit_reached('accordion-block', 'maxItems', $item_count)) {
    // Handle limit reached
}

// Render upgrade notice manually
echo $config->render_upgrade_notice('accordion-block');
```

## 🔧 Generating Free Version

### Automatic Generation

```bash
# Generate free version
npm run generate:free

# Or build and zip for distribution
npm run deploy:free
```

### Manual Generation

```bash
# Run the generator script directly
node scripts/generate-free-version.js
```

### What the Generator Does

1. **Creates free version directory** (`../adaire-blocks-free/`)
2. **Copies core files** (excluding premium-specific files)
3. **Modifies configuration** to use only free settings
4. **Updates plugin headers** for free version
5. **Builds the plugin** with free configuration
6. **Generates changelog** documenting differences

## 📋 Best Practices

### 1. Block Development

- **Always check limits** before allowing user actions
- **Show upgrade notices** when limits are reached
- **Gracefully degrade** premium features for free users
- **Test both versions** after changes

### 2. Configuration Management

- **Keep limits reasonable** for free version
- **Make upgrade messages compelling** but not intrusive
- **Document all limits** in configuration
- **Version control configuration** changes

### 3. Testing

- **Test free version** after generation
- **Verify limits work** as expected
- **Check upgrade notices** appear correctly
- **Ensure premium features** work in premium version

## 🎨 Customization

### Adding New Limit Types

1. **Add to configuration**:
```json
{
  "limits": {
    "maxDuration": 3000,
    "maxItems": 5,
    "customLimit": 10
  }
}
```

2. **Check in code**:
```javascript
const customLimit = config.limits?.customLimit || Infinity;
const isCustomLimitReached = value >= customLimit;
```

### Custom Upgrade Messages

```json
{
  "upgradeMessage": "Custom message for this specific block. Upgrade to unlock unlimited features!"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Free version shows premium blocks**
   - Check `blocks-config.json` configuration
   - Ensure `enabled: false` for premium blocks

2. **Limits not working**
   - Verify `AdaireBlocksConfig` is included
   - Check limit values in configuration
   - Ensure limit checks are implemented in block code

3. **Generator fails**
   - Check file permissions
   - Ensure all required files exist
   - Verify Node.js dependencies

### Debug Mode

Enable debug logging by adding to `wp-config.php`:

```php
define('ADAIRE_BLOCKS_DEBUG', true);
```

## 📈 Version Management

### Version Numbering

- **Premium**: `1.0.9.1`
- **Free**: `1.0.0-free`

### Release Process

1. **Update premium version**
2. **Test all features**
3. **Generate free version**: `npm run generate:free`
4. **Test free version**
5. **Deploy both versions**

### Changelog Management

The generator automatically creates `CHANGELOG-FREE.md` documenting:
- Available free blocks
- Limitations
- Premium blocks requiring upgrade
- Upgrade instructions

## 🔄 Workflow

### Daily Development

1. **Work on premium version** (main codebase)
2. **Test features** with premium configuration
3. **Generate free version** when ready to release
4. **Test free version** thoroughly
5. **Deploy both versions**

### Adding New Features

1. **Develop feature** in premium version
2. **Add to configuration** with appropriate limits
3. **Implement limit checks** in code
4. **Add upgrade notices** where needed
5. **Test both versions**
6. **Generate and deploy**

This system ensures you maintain one codebase while providing different experiences for free and premium users, making development and maintenance much more efficient!