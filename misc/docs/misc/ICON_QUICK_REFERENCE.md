# Icon Quick Reference

## Quick Setup for New Blocks

### 1. Create Icon Component
```bash
# Create file: src/icons/your-block-name.js
```

```javascript
import React from "react";

const YourBlockIcon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Your SVG content here */}
        </svg>
    );
};

export default YourBlockIcon;
```

### 2. Use in Block Registration
```javascript
// In src/your-block/index.js
import YourBlockIcon from '../icons/your-block-name';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    icon: YourBlockIcon,  // ← Add this line
});
```

### 3. Build Plugin
```bash
npm run build
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Full build with icon updates |
| `npm run update-icons` | Update icons only |
| `npm run start` | Development mode |

## File Locations

- **Icon Components**: `src/icons/your-block-name.js`
- **Block Registration**: `src/your-block/index.js`
- **Auto-generated**: `src/your-block/block.json` (icon property)

## Troubleshooting

### Icons not showing?
1. Check if icon component exists: `ls src/icons/your-block-name.js`
2. Verify import in `index.js`: `import YourBlockIcon from '../icons/your-block-name';`
3. Run: `npm run update-icons`

### Build errors?
1. Check icon component syntax
2. Verify file paths
3. Clear build: `rm -rf build/ && npm run build`

## Icon Requirements

- **Size**: 24x24 viewBox
- **Format**: SVG with proper xmlns
- **Export**: Default export as React component
- **Naming**: PascalCase component name, kebab-case file name
