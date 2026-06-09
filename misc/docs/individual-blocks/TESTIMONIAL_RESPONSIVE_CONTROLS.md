# Testimonial Block - Responsive Width & Slides Controls

## Overview
Enhanced the testimonial block with comprehensive responsive controls for card widths and slides per view at different breakpoints.

## New Features Added

### 1. Responsive Slides Per View
Control how many testimonial cards are visible at each major breakpoint:

- **Mobile (< 768px)**: Default 1 slide
- **Tablet (768px - 1024px)**: Default 2 slides  
- **Desktop (> 1024px)**: Default 3 slides

**Location in Editor**: Settings Panel → Carousel Settings → "Responsive Slides Per View"

### 2. Card Width Controls
Control the width of individual testimonial cards at each breakpoint:

- **Desktop Card Width**: Default 100%
- **Tablet Card Width**: Default 100%
- **Mobile Card Width**: Default 100%

**Location in Editor**: Settings Panel → "Card Width Settings"

Each breakpoint supports multiple units:
- `px` (pixels)
- `%` (percentage)
- `rem` (relative em)
- `vw` (viewport width)

## Files Modified

### Block Configuration
- `src/testimonial-block/block.json` - Added new attributes:
  - `cardWidth` (object with desktop/tablet/mobile)
  - `slidesPerViewMobile` (number)
  - `slidesPerViewTablet` (number)
  - `slidesPerViewDesktop` (number)

### JavaScript Files
- `src/testimonial-block/edit.js`:
  - Added UI controls for responsive slides per view
  - Added "Card Width Settings" panel with responsive controls
  - Updated Swiper breakpoints to use new attributes
  - Added CSS custom properties for card widths
  - Updated useEffect dependencies

- `src/testimonial-block/save.js`:
  - Added new attributes to destructuring
  - Added CSS custom properties for card widths
  - Added data attributes for responsive slides per view

- `src/testimonial-block/view.js`:
  - Added reading of new data attributes
  - Updated Swiper breakpoints configuration

### Styles
- `src/testimonial-block/style.scss`:
  - Added responsive card width CSS variables
  - Applied width controls with media queries

## Usage Examples

### Example 1: Full-Width Cards on Mobile
To make testimonial cards take the full width on mobile devices (preventing constrained appearance):

1. Open the testimonial block settings
2. Go to "Card Width Settings"
3. Set "Mobile Card Width" to `100` with unit `%`

### Example 2: Show Single Card on Mobile
To display only one card at a time on mobile:

1. Go to "Carousel Settings"
2. Under "Responsive Slides Per View"
3. Set "Mobile (< 768px)" to `1`

### Example 3: Partial Card Preview
To show a partial preview of the next card (creates carousel effect):

1. Set "Mobile Card Width" to `90` with unit `%`
2. Set "Mobile" slides per view to `1`

This will show 90% of the current card plus 10% of the next card, indicating more content.

## CSS Variables Available

The following CSS custom properties are now available:

- `--card-width-desktop`: Width of cards on desktop
- `--card-width-tablet`: Width of cards on tablet
- `--card-width-mobile`: Width of cards on mobile

These are automatically applied via media queries in the stylesheet.

## Data Attributes

The block now includes these data attributes for frontend JavaScript:

- `data-slides-per-view-mobile`: Number of slides on mobile
- `data-slides-per-view-tablet`: Number of slides on tablet
- `data-slides-per-view-desktop`: Number of slides on desktop

## Technical Details

### Breakpoints Used
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px and above

### Default Values
```json
{
  "cardWidth": {
    "desktop": { "value": 100, "unit": "%" },
    "tablet": { "value": 100, "unit": "%" },
    "mobile": { "value": 100, "unit": "%" }
  },
  "slidesPerViewMobile": 1,
  "slidesPerViewTablet": 2,
  "slidesPerViewDesktop": 3
}
```

## Swiper Configuration

The Swiper carousel now uses responsive breakpoints:

```javascript
breakpoints: {
  320: {
    slidesPerView: slidesPerViewMobile,
    spaceBetween: 20,
    centeredSlides: false
  },
  768: {
    slidesPerView: slidesPerViewTablet,
    spaceBetween: 30,
    centeredSlides: true
  },
  1024: {
    slidesPerView: slidesPerViewDesktop,
    spaceBetween: spaceBetween,
    centeredSlides: true
  }
}
```

## Benefits

1. **Better Mobile Experience**: Cards can now be optimized for mobile viewing
2. **Flexible Layouts**: Control exactly how cards appear at different screen sizes
3. **No More Constrained Cards**: Full-width option prevents cards from being too narrow
4. **Carousel Effects**: Partial card widths can create engaging carousel previews
5. **Consistent API**: Uses the same responsive control pattern as other block settings

## Backward Compatibility

All new attributes have sensible defaults that maintain the existing behavior:
- Mobile: 1 slide, 100% width
- Tablet: 2 slides, 100% width
- Desktop: 3 slides, 100% width

Existing testimonial blocks will continue to work without modification.

## Build Status

✅ Successfully built and compiled
✅ No breaking changes
✅ All attributes properly saved and loaded
✅ Styles compiled with responsive media queries

## Testing Recommendations

1. Test on actual mobile devices (< 768px width)
2. Test with different card width values (80%, 90%, 100%)
3. Test with different slidesPerView values (1, 2, 3)
4. Verify carousel navigation still works correctly
5. Test with varying numbers of testimonials (1, 2, 3, 4+)

---

**Last Updated**: 2025-10-22
**Version**: Compatible with current testimonial block version

