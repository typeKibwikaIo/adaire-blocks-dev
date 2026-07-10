# Block Icons Guide

This guide explains how to add custom icons to your WordPress blocks and the complete workflow for managing them.

## Overview

The Adaire Blocks plugin uses a custom icon system that allows you to:
- Define custom SVG icons for each block
- Display icons in both the WordPress editor and admin block management page
- Automatically sync icons between your React components and WordPress block registration

## How It Works

1. **Icon Components**: SVG icons are defined as React components in `src/icons/`
2. **Block Registration**: Icons are imported and used in block `index.js` files
3. **Build Process**: The `update-block-icons.js` script automatically updates `block.json` files with actual SVG content
4. **Admin Display**: The admin settings page renders the actual SVG icons instead of dashicons

## Adding Icons to New Blocks

### Step 1: Create the Icon Component

Create a new file in `src/icons/` with your block name:

**File**: `src/icons/your-block-name.js`

```javascript
import React from "react";

const YourBlockIcon = () => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Your SVG paths here */}
            <path
                d="M0 5C0 2.23858 2.23858 0 5 0H19C21.7614 0 24 2.23858 24 5V19C24 21.7614 21.7614 24 19 24H5C2.23858 24 0 21.7614 0 19V5Z"
                fill="#F0F0F1"
            />
            <path
                d="M7 6H17C17.5523 6 18 6.44772 18 7V17C18 17.5523 17.5523 18 17 18H7C6.44772 18 6 17.5523 6 17V7C6 6.44772 6.44772 6 7 6Z"
                fill="#F0F0F1"
                stroke="black"
            />
        </svg>
    );
};

export default YourBlockIcon;
```

### Step 2: Use Icon in Block Registration

In your block's `index.js` file:

```javascript
import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

// Import your custom icon
import YourBlockIcon from '../icons/your-block-name';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    icon: YourBlockIcon,  // ← This is where you define the icon
});
```

### Step 3: Build the Plugin

Run the build process to automatically update the `block.json` files:

```bash
npm run build
```

This will:
1. Run `update-block-icons.js` as a prebuild step
2. Extract SVG content from your icon components
3. Update the `block.json` files with actual SVG content
4. Build the plugin with updated icons

## Icon Component Guidelines

### SVG Structure
- Use a 24x24 viewBox for consistency
- Include proper `xmlns` attribute
- Use semantic path elements
- Keep colors consistent with your design system

### Naming Convention
- File name: `your-block-name.js` (kebab-case)
- Component name: `YourBlockIcon` (PascalCase)
- Export as default

### Example Icon Component

```javascript
import React from "react";

const AccordionIcon = () => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0 5C0 2.23858 2.23858 0 5 0H19C21.7614 0 24 2.23858 24 5V19C24 21.7614 21.7614 24 19 24H5C2.23858 24 0 21.7614 0 19V5Z"
                fill="#F0F0F1"
            />
            <g clipPath="url(#clip0_2_11)">
                <path
                    d="M19.2083 2.375H5.79167C3.93921 2.375 2.4375 3.81142 2.4375 5.58333V18.4167C2.4375 20.1886 3.93921 21.625 5.79167 21.625H19.2083C21.0608 21.625 22.5625 20.1886 22.5625 18.4167V5.58333C22.5625 3.81142 21.0608 2.375 19.2083 2.375Z"
                    fill="#F0F0F1"
                    stroke="black"
                />
                {/* Additional paths... */}
            </g>
            <defs>
                <clipPath id="clip0_2_11">
                    <rect
                        width="23"
                        height="22"
                        fill="white"
                        transform="translate(1 1)"
                    />
                </clipPath>
            </defs>
        </svg>
    );
};

export default AccordionIcon;
```

## Build Process

### Automatic Icon Updates

The build process automatically handles icon updates:

```bash
# This runs update-block-icons.js automatically
npm run build
```

### Manual Icon Updates

If you need to update icons without a full build:

```bash
npm run update-icons
```

This will:
- Scan all block directories
- Read icon components from `src/icons/`
- Extract SVG content using regex
- Update `block.json` files with actual SVG content

## Admin Page Integration

The admin settings page (`admin/settings-page.php`) automatically displays custom icons by:

1. **Reading `block.json` files** from the build directory
2. **Checking for SVG content** (starts with `<svg`)
3. **Rendering actual SVG** instead of dashicons
4. **Falling back to dashicons** for blocks without custom icons

## Troubleshooting

### Icons Not Showing in Admin

1. **Check if `block.json` has SVG content**:
   ```bash
   cat src/your-block/block.json | grep -A 5 '"icon"'
   ```

2. **Verify icon component exists**:
   ```bash
   ls src/icons/your-block-name.js
   ```

3. **Run manual icon update**:
   ```bash
   npm run update-icons
   ```

### Build Issues

1. **Clear build directory**:
   ```bash
   rm -rf build/
   npm run build
   ```

2. **Check for syntax errors** in icon components

3. **Verify file paths** in block registration

## File Structure

```
src/
├── icons/
│   ├── accordion.js
│   ├── button.js
│   ├── counter.js
│   └── your-block.js
├── your-block/
│   ├── index.js          # ← Import and use icon here
│   ├── edit.js
│   ├── save.js
│   ├── style.scss
│   └── block.json        # ← Auto-updated with SVG content
└── ...
```

## Best Practices

1. **Keep icons simple** - avoid complex animations in SVG
2. **Use consistent colors** - match your design system
3. **Test in both editor and admin** - ensure icons display correctly
4. **Version control your icons** - keep icon components in source control
5. **Document custom icons** - add comments for complex SVG structures

## Available Commands

- `npm run build` - Full build with icon updates
- `npm run update-icons` - Update icons only
- `npm run start` - Development mode with hot reload

## Support

For issues with the icon system:
1. Check the console for build errors
2. Verify icon component syntax
3. Ensure proper file paths
4. Test with a simple icon first
