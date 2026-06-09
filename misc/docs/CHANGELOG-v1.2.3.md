# Changelog - Version 1.2.3

**Release Date:** [TBD]

## Summary

Version 1.2.3 focuses on improving carousel functionality, enhancing responsive controls, and adding better mobile interactions. The Video Carousel and Swiper Carousel blocks have been migrated to Swiper.js for smoother performance, the Modal block now supports full responsive dimensions, the Flip Card block supports touch interactions, and the Social Banner block has been significantly enhanced with advanced positioning and styling options.

## Enhancements

### Video Carousel Block

#### Swiper.js Migration
- **Migrated from Splide.js to Swiper.js**: Complete migration to Swiper.js for improved carousel functionality and smoother performance
- **Enhanced Loop Logic**: Improved bidirectional looping with better `loopedSlides` calculation based on max slides per view
- **Mobile Peek Support**: Added support for showing adjacent cards on mobile when slides per view is 1
- **Centered Slides**: Automatic centering when slides per view is set to 1 at any breakpoint
- **Better Mobile Handling**: Improved touch interactions and smoother scrolling on mobile devices

#### Technical Details
- Updated `view.js` to use Swiper.js initialization instead of Splide.js
- Enhanced loop calculation: `loopedSlides = Math.max(maxSlidesPerView, totalSlides)`
- Added `centeredSlides: true` when `slidesPerView` is 1
- Set `slidesPerView: 1.2` (or similar) to show peeks of adjacent cards
- Updated Swiper breakpoint values to align with `BREAKPOINTS.md`

#### File Changes
- `src/video-carousel-block/view.js` - Migrated to Swiper.js, enhanced loop logic
- `src/video-carousel-block/save.js` - Updated markup for Swiper.js
- `src/video-carousel-block/style.scss` - Updated styles for Swiper.js
- `src/video-carousel-block/edit.js` - Updated controls for Swiper.js settings
- `src/video-carousel-block/block.json` - Updated attributes for Swiper.js

### Swiper Carousel Block

#### Complete Overhaul
- **Swiper.js Integration**: Complete overhaul to use Swiper.js matching Video Carousel mechanics
- **Responsive Slide Height**: Added height controls with unit options (px, %, rem, vw) for all 5 breakpoints
- **Pagination Controls**: Added visibility toggle and color controls (active/inactive) for pagination dots
- **Comprehensive Styling**: Full breakpoint support for all styling controls
- **Drag Indicator**: Added drag cursor with customizable text, size, colors, and styling
- **Container Controls**: Added container mode and max-width controls matching Video Carousel
- **List Padding**: Added responsive padding-left controls for all breakpoints

#### Swiper Slide Block Enhancements
- **Comprehensive Typography Controls**: Added responsive typography settings for all breakpoints
- **Typography Properties**: Font size, weight, line height, letter spacing, text transform, color, margin bottom
- **Real-time Preview**: Typography updates in real-time in editor preview
- **Scoped Styles**: Styles properly scoped to Swiper Carousel context to avoid interference

#### Technical Details
- Updated `view.js` to use Swiper.js with observer settings
- Added `observer: true` and `observeParents: true` for dynamic content
- Added `swiper.update()` after initialization
- Conditional pagination rendering based on `paginationVisible` attribute
- CSS variables for pagination active and inactive colors

#### File Changes
- `src/swiper-carousel-block/view.js` - Complete overhaul to use Swiper.js
- `src/swiper-carousel-block/save.js` - Updated markup and CSS variables
- `src/swiper-carousel-block/style.scss` - Updated styles for Swiper.js
- `src/swiper-carousel-block/edit.js` - Added comprehensive styling controls
- `src/swiper-carousel-block/editor.scss` - Enhanced editor preview
- `src/swiper-carousel-block/block.json` - Added new attributes
- `src/swiper-slide-block/edit.js` - Added typography controls
- `src/swiper-slide-block/save.js` - Added typography CSS variables
- `src/swiper-slide-block/style.scss` - Scoped styles and added typography variables
- `src/swiper-slide-block/index.js` - Added deprecated save version for auto-recovery

### Modal Block

#### Responsive Dimensions
- **Full Breakpoint Support**: Added responsive width and height controls for all 5 breakpoints (mobile, tablet, small-laptop, desktop, big-desktop)
- **Removed Percentage Width**: Removed percentage option for width as modal is freely floating without a parent reference
- **Enhanced Z-index**: Increased z-index to 99999 (modal) and 99998 (overlay) to ensure modal appears above navbar
- **Consistent Breakpoints**: Aligned with standard breakpoint system

#### Technical Details
- Updated `edit.js` to include all 5 breakpoints for width and height controls
- Updated `save.js` to output CSS variables for all breakpoints
- Updated `style.scss` to use standard breakpoint mixins
- Removed `'%'` from `unitOptionsWidth` in edit.js

#### File Changes
- `src/modal-block/edit.js` - Added responsive controls for all breakpoints
- `src/modal-block/save.js` - Updated CSS variables for responsive dimensions
- `src/modal-block/style.scss` - Updated styles for responsive dimensions
- `src/modal-block/block.json` - Updated attributes for responsive dimensions

### Flip Card Block

#### Touch Interaction Support
- **Touch Device Detection**: Automatic detection of touch devices with CSS class application
- **Flip Back on Tap**: Cards can now flip back when tapped again on mobile and tablet devices
- **Touch-Friendly**: Hover effects are disabled on touch devices, replaced with class-based flipping
- **Smooth Animations**: Maintained smooth 3D transitions for touch interactions

#### Technical Details
- Added `view.js` to handle touch/click events
- Added `--touch-device` class detection
- Added `--flipped` class toggle for animation
- Updated `style.scss` to disable hover effects on touch devices
- Registered view script in `block.json`

#### File Changes
- `src/flipcard-block/view.js` - Added touch interaction detection and flip functionality
- `src/flipcard-block/style.scss` - Added touch device styles and class-based flipping
- `src/flipcard-block/block.json` - Registered view script

### Social Banner Block

#### Major Enhancements
- **Position Type Options**: Added fixed, absolute, and relative positioning options
- **Display Type Control**: Added block and inline display options for easier positioning
- **Horizontal Offset Controls**: Added left/right offset controls matching existing vertical offset functionality
- **Background Color Control**: Added color picker for background color customization
- **Responsive Padding**: Added comprehensive padding controls (top, right, bottom, left) for all 5 breakpoints
- **Background Border Radius**: Added border radius control for background styling
- **Real-time Preview**: Enhanced editor preview with real-time updates for all background settings

#### Technical Details
- Added `positionType` attribute with options: fixed, absolute, relative
- Added `displayType` attribute with options: block, inline
- Added `horizontalOffsetFrom`, `horizontalOffset`, `horizontalOffsetUnit` attributes
- Added `backgroundColor` and `backgroundBorderRadius` attributes
- Added `responsivePadding` object with all 5 breakpoints
- Removed conflicting `position` attribute
- Updated CSS to use modifier classes for positioning
- Added CSS variables for all new controls
- Fixed React error #130 by correcting PanelColorSettings import

#### File Changes
- `src/social-banner-block/edit.js` - Added all new controls and fixed imports
- `src/social-banner-block/save.js` - Added CSS variables for all new controls
- `src/social-banner-block/style.scss` - Added styles for all new options
- `src/social-banner-block/editor.scss` - Enhanced editor preview with CSS variable support
- `src/social-banner-block/block.json` - Added new attributes

## Bug Fixes

### React Error Fixes
- **Fixed React Error #130**: Corrected PanelColorSettings import in Social Banner Block from `@wordpress/components` to `@wordpress/block-editor`

### Editor Preview Fixes
- **Fixed Background Settings**: Background color and border radius now update in real-time in Social Banner Block editor
- **Fixed Pagination Visibility**: Pagination dots now properly hide when toggle is off in Swiper Carousel Block
- **Fixed Slide Stacking**: Swiper slides now display correctly in a row in editor preview (not stacked)
- **Fixed Appender Position**: Appender button now positioned correctly at the end of slides in Swiper Carousel Block
- **Fixed Typography Updates**: Typography settings now update in real-time in Swiper Slide Block editor

### Auto-Recovery Fixes
- **Fixed Inner Block Recovery**: Auto block recovery now works correctly for Swiper Slide inner blocks
- **Fixed Deprecated Markup**: Added deprecated save version to handle old Splide.js markup

### Style Interference Fixes
- **Fixed Style Separation**: Swiper Slide block styles no longer interfere with Video Carousel block
- **Fixed Padding Interference**: Padding on Swiper Slide block no longer affects Video Carousel block

## Technical Improvements

### Code Quality
- **Import Corrections**: Fixed component imports to use correct WordPress packages
- **CSS Variable Handling**: Improved handling of empty color values with proper fallbacks
- **Breakpoint Consistency**: Standardized breakpoint mixins across all blocks
- **Observer Support**: Added Swiper observer settings for dynamic content updates

### Editor Experience
- **Real-time Updates**: Improved real-time preview updates for all responsive settings
- **Breakpoint Consistency**: All blocks now use consistent 5-breakpoint system
- **CSS Variable System**: Enhanced CSS variable usage for responsive styling
- **Editor Styles**: Improved editor preview styling for better accuracy

### Performance
- **Swiper.js Performance**: Swiper.js provides better performance than Splide.js
- **Optimized Animations**: Enhanced GSAP animations for drag cursor with better performance
- **CSS Variable Efficiency**: Improved CSS variable usage reduces style recalculation

## File Changes Summary

### Modified Files (30+)
- Video Carousel Block: 5 files
- Swiper Carousel Block: 6 files
- Swiper Slide Block: 4 files
- Modal Block: 4 files
- Flip Card Block: 3 files
- Social Banner Block: 5 files
- Main plugin file: 1 file (version update)

### New Files
- `misc/docs/BREAKPOINTS.md` - Documentation for standard breakpoint system

## Upgrade Impact

### Breaking Changes
- None. All changes are backward compatible.

### Migration Notes
- Video Carousel blocks will automatically migrate from Splide.js to Swiper.js markup
- Swiper Carousel blocks will automatically migrate from Splide.js to Swiper.js markup
- Flip Card blocks will automatically gain touch interaction support
- Social Banner blocks will maintain existing positioning but gain new options

### Backward Compatibility
- All existing blocks remain fully functional
- Auto-recovery system handles markup changes automatically
- Deprecated save versions ensure smooth transitions

## Performance Considerations

### Improvements
- Swiper.js provides better performance than Splide.js for carousel functionality
- Unified carousel library reduces overall JavaScript footprint
- Enhanced GSAP animations with better performance
- Improved CSS variable usage reduces style recalculation

### Considerations
- Swiper.js is slightly larger than Splide.js but provides better functionality
- Touch interaction detection adds minimal overhead
- Responsive padding controls add CSS variables but with minimal performance impact

## Developer Benefits

### Code Consistency
- Unified carousel implementation across Video Carousel and Swiper Carousel blocks
- Consistent breakpoint system across all blocks
- Standardized CSS variable naming conventions

### Enhanced Controls
- More granular control over carousel behavior
- Comprehensive responsive styling options
- Better mobile experience with touch interactions

### Improved Editor Experience
- Real-time preview updates for all settings
- Better visual feedback in editor
- Consistent control interfaces across blocks

---

**Version:** 1.2.3
**Release Date:** [TBD]

