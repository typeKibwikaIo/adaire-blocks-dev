# WordPress Block Template

A comprehensive, production-ready WordPress block template with container width, padding, margin, and responsive constrained settings.

## 📦 What's Included

This template provides everything you need to create a WordPress block with professional container and spacing controls, based on proven patterns from `tabs-block`, `accordion-block`, and `posts-grid-block`.

### Template Files

| File | Purpose | Description |
|------|---------|-------------|
| `block-template.json` | Block configuration | Contains all attributes for container, margins, and padding |
| `block-template-edit.js` | Editor component | Full UI with InspectorControls panels |
| `block-template-save.js` | Frontend component | Save function with same styling as editor |
| `block-template-style.scss` | Frontend stylesheet | Responsive CSS for frontend display |
| `block-template-editor.scss` | Editor stylesheet | Editor-specific styles for proper preview |
| `block-template-index.js` | Entry point | Block registration file |

### Documentation Files

| File | Purpose |
|------|---------|
| `BLOCK_TEMPLATE.md` | Overview and attribute patterns |
| `BLOCK_TEMPLATE_USAGE.md` | Comprehensive usage guide with examples |
| `BLOCK_TEMPLATE_QUICK_REFERENCE.md` | Quick copy-paste snippets |
| `BLOCK_TEMPLATE_README.md` | This file - getting started guide |

## 🎯 Features

### ✅ Container Settings
- **Full Width Mode**: Block spans full container width
- **Constrained Mode**: Centered with max-width
- **Responsive Max Width**: Desktop, tablet, mobile breakpoints
- **Multiple Units**: px, %, rem, vw support

### ✅ Spacing Controls
- **Responsive Margins**: Device-specific margins (top, right, bottom, left)
- **Responsive Padding**: Device-specific padding (top, right, bottom, left)
- **BoxControl UI**: WordPress native spacing control
- **Device Preview**: Easy desktop/tablet/mobile switching

### ✅ WordPress Integration
- **Block Editor Support**: Works seamlessly in Gutenberg
- **Alignment Support**: Works with alignwide and alignfull
- **CSS Variables**: Easy customization and theming
- **Mobile Preview**: Responsive in editor preview modes

## 🚀 Quick Start

### Option 1: New Block from Template

```bash
# 1. Create new block folder
mkdir src/my-awesome-block
cd src/my-awesome-block

# 2. Copy template files
cp ../../block-template.json ./block.json
cp ../../block-template-edit.js ./edit.js
cp ../../block-template-save.js ./save.js
cp ../../block-template-style.scss ./style.scss
cp ../../block-template-index.js ./index.js

# 3. Find and replace in all files:
# - "your-block-name" → "my-awesome-block"
# - "your-block" → "my-awesome-block"
# - "Your Block Title" → "My Awesome Block"
```

### Option 2: Add to Existing Block

1. Open `BLOCK_TEMPLATE_QUICK_REFERENCE.md`
2. Copy the attributes you need to your `block.json`
3. Copy the InspectorControls panels to your `edit.js`
4. Copy the CSS variable setup to your `blockProps.style`
5. Copy the responsive styles to your `.scss` file

## 📖 Documentation

### For Beginners
Start with **BLOCK_TEMPLATE_USAGE.md** - it includes:
- Step-by-step setup instructions
- Customization examples
- Common patterns
- Troubleshooting guide

### For Quick Reference
Use **BLOCK_TEMPLATE_QUICK_REFERENCE.md** - it provides:
- Copy-paste snippets
- Attribute patterns
- CSS variable patterns
- JSX examples

### For Understanding Patterns
Read **BLOCK_TEMPLATE.md** - it explains:
- Attribute structure
- CSS variable usage
- Different margin patterns
- Block architecture

## 🎨 Customization Guide

### Step 1: Update Block Metadata

Edit `block.json`:
```json
{
    "name": "create-block/my-block",
    "title": "My Custom Block",
    "category": "widgets",
    "icon": "admin-settings",
    "description": "My block description"
}
```

### Step 2: Add Your Attributes

Add block-specific attributes to `block.json`:
```json
"backgroundColor": {
    "type": "string",
    "default": "#ffffff"
},
"textColor": {
    "type": "string",
    "default": "#000000"
}
```

### Step 3: Add UI Controls

Add controls to `edit.js` InspectorControls:
```javascript
<PanelBody title={__('Colors', 'my-block')}>
    <ColorPalette 
        value={backgroundColor} 
        onChange={(v) => setAttributes({ backgroundColor: v })} 
    />
</PanelBody>
```

### Step 4: Style Your Block

Add styles to `style.scss`:
```scss
.my-block {
    &__content {
        background-color: var(--background-color, #ffffff);
        color: var(--text-color, #000000);
    }
}
```

### Step 5: Build and Test

```bash
npm run build
# or
npm run start
```

## 🏗️ Architecture

```
your-block/
├── block.json           ← Block configuration & attributes
├── index.js             ← Block registration
├── edit.js              ← Editor component
├── save.js              ← Frontend output
├── style.scss           ← Frontend & editor styles
└── editor.scss          ← Editor-only styles (REQUIRED for proper spacing preview)
```

### Data Flow

1. **Attributes** defined in `block.json`
2. **UI Controls** in `edit.js` InspectorControls
3. **CSS Variables** set in `blockProps.style`
4. **Styles** applied via `style.scss`
5. **Output** generated by `save.js`

## 🔍 Pattern Comparison

This template combines the best patterns from three blocks:

| Feature | tabs-block | accordion-block | posts-grid-block | Template |
|---------|-----------|----------------|------------------|----------|
| Container Mode | ✅ | ✅ | ✅ | ✅ |
| Responsive Max Width | ✅ | ✅ | ✅ | ✅ |
| Simple Margins | ✅ | Partial | ❌ | ✅ (optional) |
| Responsive Margins | ❌ | Horizontal only | ✅ | ✅ |
| Responsive Padding | ❌ | ❌ | ❌ | ✅ |
| BoxControl | ❌ | ❌ | ✅ | ✅ |

## 📱 Responsive Breakpoints

```scss
// Desktop (default)
.your-block { }

// Tablet
@media (max-width: 1024px) { }

// Mobile  
@media (max-width: 768px) { }
```

## 🎯 Use Cases

### Perfect For:
- Content blocks requiring layout control
- Section blocks with spacing needs
- Container blocks with max-width
- Responsive layout blocks
- Any block needing margin/padding controls

### Not Needed For:
- Simple inline elements
- Blocks without layout requirements
- Core blocks (use WordPress defaults)

## ⚙️ Advanced Features

### Dynamic Block Rendering
Convert to PHP-rendered block for server-side logic:
- See "Example 3" in `BLOCK_TEMPLATE_USAGE.md`

### Custom Breakpoints
Modify breakpoints in `style.scss`:
```scss
@media (max-width: 1280px) { /* Custom tablet */ }
@media (max-width: 640px)  { /* Custom mobile */ }
```

### Additional Spacing
Add more spacing options:
```json
"gapBetweenItems": {
    "type": "object",
    "default": { "desktop": 20, "tablet": 16, "mobile": 12 }
}
```

## 🐛 Troubleshooting

### Common Issues

**Q: Margins not showing in editor**  
A: Ensure inline styles are set in `blockProps.style`

**Q: Container not centering**  
A: Check `.is-constrained` class has `margin: 0 auto`

**Q: Responsive values not working**  
A: Verify CSS variables are defined and media queries exist

**Q: BoxControl showing NaN**  
A: Always parse values: `parseInt(value.top) || 0`

See `BLOCK_TEMPLATE_USAGE.md` for more troubleshooting tips.

## 📚 Resources

### WordPress Documentation
- [Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [Block API Reference](https://developer.wordpress.org/block-editor/reference-guides/block-api/)
- [Components Reference](https://developer.wordpress.org/block-editor/reference-guides/components/)

### This Template
- [Usage Guide](./BLOCK_TEMPLATE_USAGE.md) - Comprehensive guide
- [Quick Reference](./BLOCK_TEMPLATE_QUICK_REFERENCE.md) - Copy-paste snippets
- [Overview](./BLOCK_TEMPLATE.md) - Patterns and architecture

## 💪 Best Practices

1. ✅ Always provide fallback values with `??`
2. ✅ Use semantic class names (BEM methodology)
3. ✅ Set unique `blockId` on mount
4. ✅ Test across all breakpoints
5. ✅ Use CSS variables for easy customization
6. ✅ Follow WordPress coding standards
7. ✅ Document custom attributes
8. ✅ Keep editor and frontend styles consistent

## 🤝 Contributing

Found an improvement? Create a pull request or open an issue!

## 📄 License

This template follows the same license as your WordPress plugin.

## 🎉 Credits

Based on successful patterns from:
- **tabs-block** - Container mode implementation
- **accordion-block** - Horizontal margins pattern
- **posts-grid-block** - Full responsive controls

---

**Ready to build?** Start with `BLOCK_TEMPLATE_USAGE.md` for step-by-step instructions! 🚀

