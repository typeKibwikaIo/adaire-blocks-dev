# 🚀 WordPress Block Template - START HERE

> **A complete, production-ready WordPress block template with container width, padding, margin, and responsive constrained settings**

## 📌 What You Got

I've created a complete block template system with **container width, padding, margin, and responsive settings** based on the proven patterns from your `tabs-block`, `accordion-block`, and `posts-grid-block`.

## ✨ Quick Summary

### Template Files (6 files to copy)
```
block-template.json         ← Block configuration
block-template-edit.js      ← Editor component with all controls
block-template-save.js      ← Frontend output
block-template-style.scss   ← Frontend responsive styles
block-template-editor.scss  ← Editor-only styles for proper preview
block-template-index.js     ← Block registration
```

### Documentation Files (6 guides)
```
START_HERE.md                          ← This file - your starting point
BLOCK_TEMPLATE_README.md               ← Getting started guide
BLOCK_TEMPLATE_USAGE.md                ← Comprehensive usage guide
BLOCK_TEMPLATE_QUICK_REFERENCE.md      ← Copy-paste code snippets
BLOCK_TEMPLATE_EXAMPLE.md              ← Complete hero section example
BLOCK_TEMPLATE.md                      ← Technical overview
BLOCK_TEMPLATE_FILES.md                ← Complete file index
```

## 🎯 Features Included

### ✅ Container Settings
- Full Width or Constrained mode
- Responsive max-width (Desktop, Tablet, Mobile)
- Multiple units (px, %, rem, vw)
- Auto-centering for constrained mode

### ✅ Spacing Controls
- **Responsive Margins** - All 4 sides, all 3 breakpoints
- **Responsive Padding** - All 4 sides, all 3 breakpoints
- WordPress BoxControl UI
- Device preview toggle (Desktop/Tablet/Mobile icons)

### ✅ Developer Experience
- CSS Variables for easy customization
- Mobile-first responsive design
- WordPress best practices
- BEM naming convention
- Comprehensive documentation
- Working example included

## 🚀 How to Use This Template

### Option 1: Create a New Block (Recommended for learning)

```bash
# 1. Create a new folder
mkdir src/my-new-block
cd src/my-new-block

# 2. Copy the 6 template files
cp ../../block-template.json ./block.json
cp ../../block-template-edit.js ./edit.js
cp ../../block-template-save.js ./save.js
cp ../../block-template-style.scss ./style.scss
cp ../../block-template-editor.scss ./editor.scss
cp ../../block-template-index.js ./index.js

# 3. Find and replace in ALL files:
#    "your-block-name" → "my-new-block"
#    "your-block" → "my-new-block"
#    "Your Block Title" → "My New Block"

# 4. Customize block.json:
#    - Update title, description, icon, category

# 5. Add your custom attributes and controls

# 6. Build and test
npm run build
```

### Option 2: Add to Existing Block (Quick integration)

1. Open `BLOCK_TEMPLATE_QUICK_REFERENCE.md`
2. Copy the attributes from the reference to your `block.json`
3. Copy the Container Settings panel to your `edit.js`
4. Copy the Margins panel (with BoxControl)
5. Copy the Padding panel (if needed)
6. Copy the CSS variable setup to your `blockProps.style`
7. Copy the responsive SCSS to your stylesheet

## 📖 Where to Go Next

### If you're a beginner:
1. **Read**: `BLOCK_TEMPLATE_README.md` (10 min)
2. **Follow**: The quick start above
3. **Study**: `BLOCK_TEMPLATE_EXAMPLE.md` (complete hero section)
4. **Reference**: `BLOCK_TEMPLATE_USAGE.md` while building

### If you're experienced:
1. **Study**: `BLOCK_TEMPLATE_EXAMPLE.md` (15 min)
2. **Use**: `BLOCK_TEMPLATE_QUICK_REFERENCE.md` for snippets
3. **Reference**: `BLOCK_TEMPLATE_USAGE.md` for advanced patterns

### If you just want code:
1. **Open**: `BLOCK_TEMPLATE_QUICK_REFERENCE.md`
2. **Copy**: The sections you need
3. **Paste**: Into your block files

## 📚 Documentation Overview

| File | Purpose | Read Time |
|------|---------|-----------|
| `BLOCK_TEMPLATE_README.md` | Complete getting started guide | 10 min |
| `BLOCK_TEMPLATE_USAGE.md` | Deep dive with customization examples | 20 min |
| `BLOCK_TEMPLATE_QUICK_REFERENCE.md` | Code snippets for copy-paste | Reference |
| `BLOCK_TEMPLATE_EXAMPLE.md` | Full hero section block example | 15 min |
| `BLOCK_TEMPLATE.md` | Pattern explanation & architecture | 10 min |
| `BLOCK_TEMPLATE_FILES.md` | Complete file navigation guide | 5 min |

## 🎓 Example: See It In Action

The `BLOCK_TEMPLATE_EXAMPLE.md` file contains a complete, working **Hero Section** block that demonstrates:

- ✅ All container and spacing controls
- ✅ Background image with MediaUpload
- ✅ Typography controls
- ✅ Color pickers
- ✅ RichText editing
- ✅ Responsive defaults
- ✅ Professional structure

**This is a production-ready example you can learn from!**

## 🎨 What the Template Includes

### In block.json
```json
✅ blockId
✅ containerMode (full/constrained)
✅ containerMaxWidth (responsive with units)
✅ marginTop/Right/Bottom/Left (responsive)
✅ paddingTop/Right/Bottom/Left (responsive)
```

### In edit.js
```javascript
✅ Device type state (desktop/tablet/mobile)
✅ Container Settings panel with:
   - Full/Constrained toggle
   - Max width controls per device
   - Unit selector (px/rem/%/vw)
✅ Margins panel with BoxControl
✅ Padding panel with BoxControl
✅ CSS variables setup
✅ Responsive inline styles
```

### In style.scss
```scss
✅ Container with auto-centering
✅ Responsive max-width
✅ Responsive margins (@media queries)
✅ Responsive padding (@media queries)
✅ CSS custom properties
✅ Mobile-first approach
```

## 🔑 Key Patterns

### Pattern 1: Responsive Object Attributes
```json
"marginTop": { 
    "type": "object",
    "default": { "desktop": 0, "tablet": 0, "mobile": 0 }
}
```

### Pattern 2: Container Max Width
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

### Pattern 3: CSS Variables
```javascript
style: {
    '--container-max-width': `${containerMaxWidth?.desktop?.value}${containerMaxWidth?.desktop?.unit}`,
    marginTop: `${marginTop?.desktop}px`,
    '--margin-top-tablet': `${marginTop?.tablet}px`,
    '--margin-top-mobile': `${marginTop?.mobile}px`,
}
```

## 💡 Pro Tips

1. **Keep Quick Reference Open**: Have `BLOCK_TEMPLATE_QUICK_REFERENCE.md` open while coding
2. **Study the Example**: `BLOCK_TEMPLATE_EXAMPLE.md` shows everything working together
3. **Use CSS Variables**: They make customization and theming much easier
4. **Test Responsiveness**: Use WordPress editor's device preview modes
5. **Start Simple**: Copy the template, get it working, then customize

## 🎯 Common Use Cases

### Use this template for:
- ✅ Hero sections
- ✅ Content sections
- ✅ Call-to-action blocks
- ✅ Feature grids
- ✅ Testimonials
- ✅ Any block needing layout control

### Not needed for:
- ❌ Simple inline elements
- ❌ Blocks without spacing needs
- ❌ Extremely simple blocks

## 🔍 Quick Search

**I want to...**

| Goal | Go to |
|------|-------|
| Get started quickly | `BLOCK_TEMPLATE_README.md` |
| Copy some code | `BLOCK_TEMPLATE_QUICK_REFERENCE.md` |
| See a working example | `BLOCK_TEMPLATE_EXAMPLE.md` |
| Learn how to customize | `BLOCK_TEMPLATE_USAGE.md` |
| Understand the patterns | `BLOCK_TEMPLATE.md` |
| Find specific files | `BLOCK_TEMPLATE_FILES.md` |

## ✅ Next Steps

1. ✅ You've read this START_HERE file
2. → **Choose your path**:
   - Beginner? → Read `BLOCK_TEMPLATE_README.md`
   - Experienced? → Study `BLOCK_TEMPLATE_EXAMPLE.md`
   - Just need code? → Open `BLOCK_TEMPLATE_QUICK_REFERENCE.md`
3. → Copy the template files
4. → Start building! 🚀

## 🙋 Questions?

All documentation is comprehensive and includes:
- Step-by-step instructions
- Code examples
- Best practices
- Troubleshooting guides
- Common patterns

Check the relevant documentation file - answers are there! 📖

---

**Ready to build amazing WordPress blocks?** 

Start with `BLOCK_TEMPLATE_README.md` or dive right into `BLOCK_TEMPLATE_EXAMPLE.md` to see it all in action! 🎉

