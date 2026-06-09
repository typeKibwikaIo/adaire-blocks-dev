# WordPress Block Template

This template includes container width, padding, margin, and responsive constrained settings based on the patterns from tabs-block, accordion-block, and posts-grid-block.

## Files Included

1. `block-template.json` - Block configuration with all necessary attributes
2. `block-template-edit.js` - Edit component with UI controls
3. `block-template-style.scss` - SCSS showing how to use the CSS variables
4. `block-template-save.js` - Save component example

## Features

- **Container Mode**: Full width or Constrained
- **Responsive Container Max Width**: Desktop, Tablet, Mobile with multiple units (px, %, rem, vw)
- **Responsive Margins**: Device-specific margins (top, right, bottom, left)
- **Responsive Padding**: Device-specific padding (top, right, bottom, left) - optional
- **Device Preview Toggle**: Desktop, Tablet, Mobile icons for easy switching

## Usage

1. Copy the relevant sections from the template files
2. Adjust the block name, title, and category
3. Customize the default values as needed
4. Add your block-specific attributes and controls

## Attributes Pattern

### Container Mode
```json
"containerMode": { 
    "type": "string", 
    "default": "full" 
}
```

### Container Max Width (Responsive)
```json
"containerMaxWidth": {
    "type": "object",
    "default": {
        "desktop": { "value": 1200, "unit": "px" },
        "tablet": { "value": 100, "unit": "%" },
        "mobile": { "value": 100, "unit": "%" }
    }
}
```

### Margins (Responsive - Object Pattern)
```json
"marginTop": { 
    "type": "object",
    "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
},
"marginRight": { 
    "type": "object",
    "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
},
"marginBottom": { 
    "type": "object",
    "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
},
"marginLeft": { 
    "type": "object",
    "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
}
```

### Alternative: Margins (Simple Number Pattern)
```json
"marginTop": { "type": "number", "default": 0 },
"marginRight": { "type": "number", "default": 0 },
"marginBottom": { "type": "number", "default": 0 },
"marginLeft": { "type": "number", "default": 0 }
```

## CSS Variables Pattern

### In edit.js blockProps style:
```javascript
style: {
    '--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
    '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
    '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
    
    // For object-based margins
    marginTop: `${marginTop?.desktop ?? 0}px`,
    marginRight: `${marginRight?.desktop ?? 0}px`,
    marginBottom: `${marginBottom?.desktop ?? 0}px`,
    marginLeft: `${marginLeft?.desktop ?? 0}px`,
    
    '--margin-top-tablet': `${marginTop?.tablet ?? 0}px`,
    '--margin-right-tablet': `${marginRight?.tablet ?? 0}px`,
    '--margin-bottom-tablet': `${marginBottom?.tablet ?? 0}px`,
    '--margin-left-tablet': `${marginLeft?.tablet ?? 0}px`,
    
    '--margin-top-mobile': `${marginTop?.mobile ?? 0}px`,
    '--margin-right-mobile': `${marginRight?.mobile ?? 0}px`,
    '--margin-bottom-mobile': `${marginBottom?.mobile ?? 0}px`,
    '--margin-left-mobile': `${marginLeft?.mobile ?? 0}px`,
}
```

### In SCSS:
```scss
.your-block {
    &__container {
        &.is-constrained {
            max-width: var(--container-max-width, 1200px);
            margin-left: auto;
            margin-right: auto;
            
            @media (max-width: 1024px) {
                max-width: var(--container-max-width-tablet, 100%);
            }
            
            @media (max-width: 768px) {
                max-width: var(--container-max-width-mobile, 100%);
            }
        }
    }
    
    // Responsive margins
    @media (max-width: 1024px) {
        margin-top: var(--margin-top-tablet, 0) !important;
        margin-right: var(--margin-right-tablet, 0) !important;
        margin-bottom: var(--margin-bottom-tablet, 0) !important;
        margin-left: var(--margin-left-tablet, 0) !important;
    }
    
    @media (max-width: 768px) {
        margin-top: var(--margin-top-mobile, 0) !important;
        margin-right: var(--margin-right-mobile, 0) !important;
        margin-bottom: var(--margin-bottom-mobile, 0) !important;
        margin-left: var(--margin-left-mobile, 0) !important;
    }
}
```

## Notes

- **posts-grid-block** uses object-based margins (responsive)
- **tabs-block** uses simple number margins (non-responsive)
- **accordion-block** uses both patterns (marginTop as number, marginHorizontal as object)
- Choose the pattern that fits your needs best
- The container max width pattern is consistent across all blocks

