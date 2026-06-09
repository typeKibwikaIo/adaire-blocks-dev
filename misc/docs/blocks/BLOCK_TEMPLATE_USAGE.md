# Block Template Usage Guide

This template provides a complete WordPress block structure with container width, padding, margin, and responsive constrained settings based on the proven patterns from `tabs-block`, `accordion-block`, and `posts-grid-block`.

## 📁 Files Included

1. **block-template.json** - Block configuration with all responsive attributes
2. **block-template-edit.js** - Editor component with full UI controls
3. **block-template-save.js** - Frontend save component
4. **block-template-style.scss** - Complete stylesheet with responsive patterns
5. **block-template-editor.scss** - Editor-only styles for proper spacing preview
6. **block-template-index.js** - Block registration file

## 🚀 Quick Start

### Method 1: Create a New Block

1. Create a new folder in `src/` (e.g., `src/my-new-block/`)
2. Copy all template files to your new folder
3. Rename files:
   - `block-template.json` → `block.json`
   - `block-template-edit.js` → `edit.js`
   - `block-template-save.js` → `save.js`
   - `block-template-style.scss` → `style.scss`
   - `block-template-editor.scss` → `editor.scss`
   - `block-template-index.js` → `index.js`
4. Update `block.json`:
   - Change `name` to `create-block/my-new-block`
   - Change `title` to your block title
   - Change `textdomain` to `my-new-block`
5. Search and replace in all files:
   - `your-block-name` → `my-new-block`
   - `your-block` → `my-new-block` (CSS class)
   - `Your Block Title` → Your actual block title
6. Add block-specific attributes to `block.json`
7. Add block-specific UI controls to `edit.js`
8. Update `style.scss` with your custom styles

### Method 2: Add to Existing Block

1. Open your existing `block.json`
2. Copy the container and spacing attributes from `block-template.json`
3. Copy the InspectorControls panels from `block-template-edit.js` to your `edit.js`
4. Copy the CSS variable setup from the template's `blockProps.style` to your block
5. Copy the responsive styles from `block-template-style.scss` to your stylesheet

## 📊 Features Breakdown

### Container Settings

- **Full Width Mode**: Block spans the full width of its parent container
- **Constrained Mode**: Block is centered with a maximum width
- **Responsive Max Width**: Different max-widths for desktop, tablet, and mobile
- **Multiple Units**: Support for px, %, rem, and vw units

### Spacing Controls

- **Responsive Margins**: Independent margin values for each breakpoint
- **Responsive Padding**: Independent padding values for each breakpoint
- **Device Preview**: Easy switching between desktop, tablet, and mobile views
- **BoxControl UI**: WordPress native spacing control for better UX

## 🎨 Customization Examples

### Example 1: Add Background Color

**In block.json:**
```json
"backgroundColor": {
    "type": "string",
    "default": "#ffffff"
}
```

**In edit.js:**
```javascript
import { ColorPalette } from '@wordpress/components';

// In InspectorControls:
<PanelBody title={__('Colors', 'your-block-name')}>
    <p>{__('Background Color', 'your-block-name')}</p>
    <ColorPalette 
        value={backgroundColor} 
        onChange={(v) => setAttributes({ backgroundColor: v })} 
    />
</PanelBody>

// In blockProps.style:
backgroundColor: backgroundColor,
```

**In style.scss:**
```scss
.your-block {
    background-color: var(--background-color, #ffffff);
}
```

### Example 2: Add Typography Controls

**In block.json:**
```json
"fontSize": {
    "type": "number",
    "default": 16
},
"fontWeight": {
    "type": "string",
    "default": "400"
}
```

**In edit.js:**
```javascript
<PanelBody title={__('Typography', 'your-block-name')}>
    <RangeControl
        label={__('Font Size', 'your-block-name')}
        value={fontSize}
        onChange={(v) => setAttributes({ fontSize: v })}
        min={12}
        max={48}
    />
    <SelectControl
        label={__('Font Weight', 'your-block-name')}
        value={fontWeight}
        options={[
            { label: 'Normal', value: '400' },
            { label: 'Medium', value: '500' },
            { label: 'Semi Bold', value: '600' },
            { label: 'Bold', value: '700' }
        ]}
        onChange={(v) => setAttributes({ fontWeight: v })}
    />
</PanelBody>
```

### Example 3: Convert to Dynamic Block (PHP Render)

If you need server-side rendering:

1. **Remove the save function** from index.js:
```javascript
registerBlockType(metadata.name, {
    edit: Edit,
    // No save function = dynamic block
});
```

2. **Create a render callback** in your main plugin file:
```php
register_block_type(__DIR__ . '/build/my-new-block', array(
    'render_callback' => 'render_my_new_block',
));

function render_my_new_block($attributes, $content) {
    $container_mode = $attributes['containerMode'] ?? 'full';
    $block_id = $attributes['blockId'] ?? '';
    
    // Build inline styles
    $styles = array(
        '--container-max-width' => ($attributes['containerMaxWidth']['desktop']['value'] ?? 1200) . ($attributes['containerMaxWidth']['desktop']['unit'] ?? 'px'),
        'margin-top' => ($attributes['marginTop']['desktop'] ?? 0) . 'px',
        // ... add all other CSS variables
    );
    
    $style_string = '';
    foreach ($styles as $prop => $value) {
        $style_string .= "$prop: $value; ";
    }
    
    ob_start();
    ?>
    <div class="your-block" style="<?php echo esc_attr($style_string); ?>" data-block-id="<?php echo esc_attr($block_id); ?>">
        <div class="your-block__container <?php echo $container_mode === 'constrained' ? 'is-constrained' : ''; ?>">
            <!-- Your dynamic content here -->
        </div>
    </div>
    <?php
    return ob_get_clean();
}
```

## 📱 Responsive Breakpoints

The template uses the following breakpoints:

- **Desktop**: Default (no media query)
- **Tablet**: `@media (max-width: 1024px)`
- **Mobile**: `@media (max-width: 768px)`

To customize breakpoints, update them in your `style.scss` file.

## 🔧 Advanced Patterns

### Pattern 1: Horizontal Margins Only (Accordion Style)

If you only need horizontal margins to be responsive:

**In block.json:**
```json
"marginTop": { "type": "number", "default": 0 },
"marginBottom": { "type": "number", "default": 0 },
"marginHorizontal": {
    "type": "object",
    "default": {
        "desktop": 0,
        "tablet": 0,
        "mobile": 0
    }
}
```

**In edit.js:**
```javascript
marginLeft: `${marginHorizontal?.desktop ?? 0}px`,
marginRight: `${marginHorizontal?.desktop ?? 0}px`,
'--margin-h-tablet': `${marginHorizontal?.tablet ?? 0}px`,
'--margin-h-mobile': `${marginHorizontal?.mobile ?? 0}px`,
```

### Pattern 2: Simple Margins (Tabs Style)

For non-responsive margins:

**In block.json:**
```json
"marginTop": { "type": "number", "default": 0 },
"marginRight": { "type": "number", "default": 0 },
"marginBottom": { "type": "number", "default": 0 },
"marginLeft": { "type": "number", "default": 0 }
```

**In edit.js:**
```javascript
<RangeControl
    label={__('Margin Top', 'your-block-name')}
    value={marginTop}
    onChange={(v) => setAttributes({ marginTop: v })}
    min={0}
    max={200}
/>
// Repeat for all sides
```

## 🎯 Best Practices

1. **Always set blockId**: This ensures unique identification for animations and JavaScript
2. **Use CSS Variables**: Makes it easier to override styles and maintain consistency
3. **Mobile-First Approach**: Start with mobile design, then enhance for larger screens
4. **Fallback Values**: Always provide fallback values with `??` operator
5. **Test Responsiveness**: Use WordPress editor's device preview to test all breakpoints
6. **Consistent Naming**: Follow WordPress naming conventions for better compatibility

## 🎨 Understanding editor.scss

The `editor.scss` file is **crucial** for making the spacing and container controls work properly in the WordPress editor. Here's why:

### Why You Need It

1. **Editor Preview Accuracy**: Without editor.scss, your block won't look correct in the editor even though it works on the frontend
2. **Constrained Mode**: The container centering and max-width only work in the editor with proper CSS
3. **Responsive Preview**: WordPress editor responsive preview modes need these styles
4. **Margin/Padding Display**: Editor needs special handling to show spacing correctly

### What It Does

```scss
// Centers the container when in constrained mode
&__container.is-constrained {
    max-width: var(--container-max-width, 1200px);
    margin-left: auto;
    margin-right: auto;
}

// Applies responsive margins in editor preview
@media (max-width: 1024px) {
    margin-top: var(--margin-top-tablet, 0) !important;
}

// Handles WordPress alignment classes
&.alignfull {
    width: 100vw;
    max-width: none;
}
```

### Pattern Used

The `editor.scss` follows the pattern from `accordion-block` which:
- ✅ Checks for constrained mode using CSS classes
- ✅ Applies max-width and auto-centering
- ✅ Handles responsive breakpoints
- ✅ Supports WordPress alignment classes (alignwide, alignfull)
- ✅ Includes WordPress editor preview mode support

### Important Notes

- The `!important` flags are necessary to override WordPress editor defaults
- Media queries must match those in `style.scss`
- CSS variables must match those set in `blockProps.style`

## 🐛 Common Issues & Solutions

### Issue 1: Container not centering in editor
**Solution**: Make sure `editor.scss` is imported and includes the `.is-constrained` styles

### Issue 2: Margins not applying in editor
**Solution**: Check that:
1. Inline styles are set in `blockProps.style` 
2. `editor.scss` includes the responsive media queries
3. CSS variable names match exactly

### Issue 3: Container not centering on frontend
**Solution**: Ensure `style.scss` has the same `.is-constrained` pattern as `editor.scss`

### Issue 4: Responsive values not updating
**Solution**: Check that:
1. CSS variables are properly defined in `blockProps.style`
2. SCSS media queries exist in both `style.scss` AND `editor.scss`
3. Variable names match exactly (e.g., `--margin-top-tablet`)

### Issue 5: BoxControl showing NaN
**Solution**: Always convert values to numbers and provide defaults:
```javascript
onChange={(value) => {
    setAttributes({
        marginTop: { ...marginTop, [deviceType]: parseInt(value.top) || 0 }
    });
}}
```

### Issue 6: Block looks different in editor vs frontend
**Solution**: This usually means `editor.scss` is missing or incomplete. Make sure:
1. `editor.scss` is imported in `edit.js`
2. All responsive styles from `style.scss` are mirrored in `editor.scss`
3. WordPress alignment class support is included

## 📚 References

This template is based on the following blocks in this plugin:

- **tabs-block**: Container mode, simple margins
- **accordion-block**: Horizontal responsive margins, container max width
- **posts-grid-block**: Full responsive margins with BoxControl

## 💡 Tips

- Use `containerMode === 'constrained'` to conditionally show max-width controls
- The `deviceType` state allows for a single device switcher across all panels
- BoxControl automatically handles linked/unlinked spacing values
- CSS custom properties make it easy to override styles from parent themes

## 🚀 Next Steps

1. Copy the template files to your new block folder
2. Customize the block.json metadata
3. Add your block-specific attributes
4. Implement your block content in edit.js and save.js
5. Style your block in style.scss
6. Test across all breakpoints
7. Build and deploy!

Happy blocking! 🎉

