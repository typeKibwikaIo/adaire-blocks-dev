# Editor.scss - Essential Guide

## 🎯 Why This File Is Critical

The `block-template-editor.scss` file ensures your block's **container width, margins, and padding display correctly in the WordPress editor**. Without it, your spacing controls won't work in the editor preview.

## ⚠️ Common Problem

**Symptom**: Your block looks perfect on the frontend but spacing doesn't work in the editor.

**Cause**: Missing or incomplete `editor.scss` file.

**Solution**: Copy `block-template-editor.scss` to your block folder as `editor.scss`.

## 📋 Quick Implementation

### Step 1: Copy the File
```bash
cp block-template-editor.scss src/your-block/editor.scss
```

### Step 2: Import in edit.js
```javascript
import './editor.scss'; // Add this line after other imports
```

### Step 3: Update CSS class names
Search and replace in `editor.scss`:
- `your-block` → your block's class name (e.g., `hero-section`)

## 🔍 What It Does

### 1. Container Centering (Constrained Mode)
```scss
&__container.is-constrained {
    max-width: var(--container-max-width, 1200px);
    margin-left: auto;
    margin-right: auto;
}
```
**Effect**: Centers your content when "Constrained" mode is selected.

### 2. Responsive Max Width
```scss
@media (max-width: 1024px) {
    max-width: var(--container-max-width-tablet, 100%);
}
```
**Effect**: Applies different max-widths for tablet and mobile in editor.

### 3. Responsive Margins
```scss
@media (max-width: 768px) {
    margin-top: var(--margin-top-mobile, 0) !important;
    // ... other margins
}
```
**Effect**: Shows mobile margins when you resize the editor window.

### 4. Responsive Padding
```scss
@media (max-width: 768px) {
    padding-top: var(--padding-top-mobile, 0) !important;
    // ... other padding
}
```
**Effect**: Shows mobile padding when you resize the editor window.

### 5. WordPress Alignment Support
```scss
&.alignfull {
    width: 100vw;
    max-width: none;
    margin-left: calc(50% - 50vw);
}
```
**Effect**: Handles full-width and wide alignment correctly.

### 6. WordPress Preview Modes
```scss
.is-tablet-preview .your-block {
    margin-top: var(--margin-top-tablet, 0) !important;
}
```
**Effect**: Works with WordPress responsive preview buttons.

## 📊 Comparison: With vs Without editor.scss

| Feature | Without editor.scss | With editor.scss |
|---------|-------------------|------------------|
| Container centering | ❌ Doesn't work | ✅ Works perfectly |
| Responsive margins | ❌ Shows desktop only | ✅ Updates on resize |
| Responsive padding | ❌ Shows desktop only | ✅ Updates on resize |
| Max-width preview | ❌ Incorrect | ✅ Accurate |
| WordPress preview modes | ❌ Broken | ✅ Works |
| Alignment classes | ❌ Doesn't work | ✅ Works |

## 🎓 Pattern Source

This pattern comes from the `accordion-block` in your plugin:

```scss
// From src/accordion-block/editor.scss
.adaire-accordion {
    &[style*="--acc-container-mode: constrained"] {
        .adaire-accordion__container {
            max-width: var(--acc-container-max-width, 1200px);
            margin-left: auto;
            margin-right: auto;
        }
    }
}
```

The template improves on this by:
- ✅ Using class-based detection (`.is-constrained`)
- ✅ Adding full responsive padding support
- ✅ Including WordPress preview mode support
- ✅ Better alignment class handling
- ✅ **Using `!important` flags** - Required to override WordPress editor defaults

## ⚠️ Critical: Why !important Is Required

WordPress editor injects its own CSS that sets max-widths on block elements. Without `!important`, your constrained settings won't work because WordPress defaults will override them.

```scss
// ❌ Won't work - WordPress defaults override this
&__container.is-constrained {
    max-width: var(--container-max-width, 1200px);
}

// ✅ Works - Forces your max-width to apply
&__container.is-constrained {
    max-width: var(--container-max-width, 1200px) !important;
}
```

**Always use `!important` for max-width in constrained mode!**

## 🔧 Customization

### Change Breakpoints
```scss
// Default: 1024px for tablet
@media (max-width: 1024px) { }

// Custom: 1280px for tablet
@media (max-width: 1280px) { }
```

### Add Debug Mode
Uncomment the debugging section at the bottom of `editor.scss`:
```scss
.your-block {
    &__container.is-constrained {
        background-color: rgba(59, 130, 246, 0.05);
        border: 1px dashed rgba(59, 130, 246, 0.3);
    }
}
```

### Apply Padding to Container Instead of Root
Use the alternative pattern (commented out in the template):
```scss
.your-block {
    &__container {
        padding-top: var(--padding-top-desktop, 0);
        // ... etc
    }
}
```

## ✅ Checklist

After adding `editor.scss`, verify:

- [ ] File is copied to your block folder
- [ ] Imported in `edit.js` with `import './editor.scss';`
- [ ] Class names updated to match your block
- [ ] Container centers in editor when "Constrained" selected
- [ ] Margins update when you change device (Desktop/Tablet/Mobile)
- [ ] Padding updates when you change device
- [ ] Max-width changes for different devices
- [ ] Full-width alignment works
- [ ] Wide alignment works
- [ ] WordPress preview modes work

## 🐛 Troubleshooting

### Container not centering
```scss
// Check this exists in editor.scss:
&__container.is-constrained {
    margin-left: auto;
    margin-right: auto;
}
```

### Margins not updating in editor
```scss
// Make sure media queries exist:
@media (max-width: 1024px) {
    margin-top: var(--margin-top-tablet, 0) !important;
}
```

### Styles not applying at all
```javascript
// Check edit.js has the import:
import './editor.scss';
```

### Wrong class names
```scss
// Replace all instances of 'your-block':
.your-block → .hero-section
your-block → hero-section
```

## 📚 Related Files

| File | Purpose | Relationship |
|------|---------|--------------|
| `style.scss` | Frontend styles | Same responsive patterns as editor.scss |
| `editor.scss` | Editor styles | Mirrors style.scss for editor |
| `edit.js` | Editor component | Sets CSS variables used by editor.scss |
| `block.json` | Configuration | Specifies `editorStyle` property |

## 🎯 Key Takeaways

1. **Essential File**: `editor.scss` is not optional—it's required for spacing to work
2. **Mirror Frontend**: It should mirror the responsive patterns from `style.scss`
3. **Import Required**: Must be imported in `edit.js`
4. **CSS Variables**: Uses the same variables set in `blockProps.style`
5. **Media Queries**: Must match breakpoints in `style.scss`

## 💡 Pro Tips

1. **Keep in Sync**: When you update `style.scss`, update `editor.scss` too
2. **Test Both**: Always test in both editor and frontend
3. **Use Preview**: Use WordPress responsive preview buttons to test
4. **Debug Mode**: Enable debugging helpers during development
5. **Match Exactly**: CSS variable names must match exactly between files

---

**Bottom Line**: Without `editor.scss`, your beautiful spacing controls won't work in the editor. It's a must-have! ✨

