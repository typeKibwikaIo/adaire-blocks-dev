# Changelog - Version 1.2.2

**Release Date:** [TBD]

## Layout Consistency Improvements

### Unified Layout Settings System
- **Standardized Layout Controls**: All infogrid blocks (infogrid, infogrid2, infogrid3, infogrid4) now share identical layout settings panels
- **Consistent Interface**: Same controls for Container Width, Max Width, and Block Padding across all blocks
- **Unified Device Selector**: All blocks use the same 5-breakpoint device selector (Mobile, Tablet, Small Laptop, Desktop, Big Desktop)
- **Real-time Preview**: Editor preview updates immediately when layout settings change

### Infogrid Block (Free) Enhancements
- **Added Layout Settings Panel**: Replaced old "Container Settings" with new "Layout Settings" panel matching infogrid3/infogrid4
- **Added Responsive Padding**: Full responsive padding controls (top, right, bottom, left) for all 5 breakpoints
- **Enhanced Max Width Controls**: RangeControl with unit selection (px, %, rem, vw) matching other blocks
- **Device Toggle Integration**: Added device selector with custom icons for all breakpoints
- **CSS Variable System**: Implemented responsive padding CSS variables for all breakpoints

### Infogrid2 Block Updates
- **Replaced Grid Layout Panel**: Removed old "Grid Layout" panel, replaced with "Layout Settings" panel
- **Added Container Mode**: Full Width/Constrained toggle for flexible container control
- **Added Max Width Controls**: Responsive max-width settings with RangeControl (max 10000px) and unit selection
- **Added Block Padding**: BoxControl for responsive padding on all 5 breakpoints
- **Fixed Visual Issues**: Removed black outline/border issues by consolidating border properties

### Call to Action Block Enhancements
- **Added Layout Settings**: Implemented same layout controls as infogrid blocks
- **Extended Breakpoint Support**: Added Small Laptop & Big Desktop breakpoints (now 5 total)
- **Real-time Editor Preview**: Fixed constrained/full-width settings to update in editor preview
- **Responsive Padding**: Added responsive padding controls matching infogrid blocks

## Breakpoint Standardization

### Unified Breakpoint System
All blocks now use consistent breakpoint definitions based on hero1 block:
- **Mobile**: `max-width: 600px`
- **Tablet**: `min-width: 601px and max-width: 1024px`
- **Small Laptop**: `min-width: 1025px and max-width: 1300px`
- **Desktop**: `min-width: 1301px and max-width: 1920px`
- **Big Desktop**: `min-width: 1921px`

### Blocks Updated
- Infogrid (Free)
- Infogrid2
- Infogrid3 (already standardized)
- Infogrid4 (already standardized)
- Call to Action
- Hero1 (source of truth)

## Technical Improvements

### Code Quality
- **Fixed Duplicate Imports**: Removed duplicate `RangeControl` import in call-to-action-block
- **Function Scope Fixes**: Moved `formatDimensionValue` outside component scope to prevent dependency issues
- **Consistent Attribute Structure**: All blocks use same structure for `responsiveMaxWidth` and `responsivePadding`
- **Proper CSS Fallbacks**: Responsive padding CSS variables with fallback chain

### Editor Experience
- **Device Toggle Component**: Standardized device selector with custom icons
- **Helper Functions**: Added `formatDimensionValue` and `updateContainerDimension` for consistent dimension handling
- **CSS Variable Naming**: Consistent naming convention for responsive CSS variables
- **Editor Styles**: Added device toggle styling to editor.scss

## Validation Server Updates

### Domain Migration
- **Updated Endpoint**: Changed from `adairedigital.com` to `adaireblocks.com`
- **License API**: Updated to `https://adaireblocks.com/wp-json/lmfwc/v2/licenses/`
- **Support Links**: Updated all support email links to `support@adaireblocks.com`
- **Documentation**: Updated validation server documentation with new domain

## Bug Fixes

- **Fixed Black Outline**: Removed unwanted black outline/border in infogrid2 block
- **Fixed Editor Preview**: Constrained/full-width settings now update in call-to-action block editor preview
- **Fixed Compilation Errors**: Resolved duplicate import issues causing webpack errors
- **Fixed Dependency Issues**: Resolved formatDimensionValue function dependency problems

## File Changes

### Modified Files
- `src/infogrid-block/edit.js` - Added layout settings panel, device selector, responsive padding
- `src/infogrid-block/save.js` - Added responsive padding CSS variables
- `src/infogrid-block/style.scss` - Added responsive padding styles for all breakpoints
- `src/infogrid-block/editor.scss` - Added device toggle styles
- `src/infogrid-2-block/edit.js` - Replaced grid layout with layout settings, added helpers
- `src/infogrid-2-block/save.js` - Added containerMode class and responsive CSS variables
- `src/infogrid-2-block/style.scss` - Fixed border issues, added responsive padding/max-width
- `src/call-to-action-block/edit.js` - Fixed duplicate imports, added layout settings
- `src/call-to-action-block/save.js` - Added responsive padding CSS variables
- `src/call-to-action-block/style.scss` - Added responsive padding styles
- `includes/class-adaire-blocks-validation-config.php` - Updated validation server URL
- `admin/js/license-page.js` - Updated validation server URL and added error logging
- `admin/license-page.php` - Updated support email
- `admin/css/license-page.css` - Removed dark mode styles
- `misc/Validation server/index.php` - Updated domain and API endpoint

## Performance Considerations

- No performance impact on frontend or editor
- CSS variables efficiently handle responsive styles
- Editor preview updates are optimized
- Breakpoint mixins reduce SCSS duplication

## Upgrade Impact

### No Breaking Changes
- All existing blocks continue to work as before
- Existing block configurations are preserved
- Layout settings default to sensible values if not set

### Backward Compatibility
- Old block configurations remain valid
- Responsive padding defaults provide fallback values
- Container mode defaults maintain current behavior

### Migration Required
- No migration required for existing installations
- Blocks automatically use new layout settings when edited
- Old settings remain functional until manually updated

