# Posts Grid Block Documentation

## Overview

In this article, we look at the Posts Grid Block, a dynamic layout for showcasing WordPress posts or custom post types with GSAP-powered entrance animations, category filters, and multiple card layouts. Use it to build news sections, resource hubs, or blog listings with consistent styling across the site.

## Adding the Posts Grid Block to your page

### Locate and add the Posts Grid Block

1. Type "/" and then type in "posts grid"
2. Select the Posts Grid Block
3. The block loads with sample cards and default query settings pulling recent posts

## Query Settings

### Content Source

- **Post Type** - Choose between posts, pages, or custom types (default: post)
- **Posts Per Page** - Number of items to display at once (default: 6)
- **Selected Categories / Posts** - Filter to specific taxonomies or individual posts
- **Exclude Current Post** - Prevents showing the current post when inserted inside singular templates (default: on)

### Pagination & Filtering

- **Enable Pagination** - Display numeric or "Load More" pagination (default: off; style defaults to numbers)
- **Enable Filtering** - Adds category filters above the grid (default: off), with position and pill/list styles configurable
- **Filter Style & Radius** - Customize pill radius (default 16px) and alignment

## Card Layout & Appearance

### Grid Configuration

- **Layout Type** - Normal, masonry, spotlight, and other layout variations
- **Columns** - Number of columns on desktop (default: 3), responsive breakpoints handled automatically
- **Card Gap & Padding** - Control spacing between cards (default gap 24px, padding 20px)
- **Card Radius** - Round card corners (default 8px)

### Media & Content

- **Image Height** - Fixed height for featured images (default: 200px)
- **Image Fit** - Cover, contain, or custom fit (default: cover)
- **Meta Display Toggles** - Show/hide categories, date, author, read time, excerpt
- **Excerpt Length** - Cutoff length in words (default: 20)

### Typography & Colors

- **Title** - Color (#1f2937 default), size (18px), weight (600)
- **Excerpt** - Color (#6b7280), size (14px), weight (400)
- **Meta** - Color (#9ca3af), size (12px), weight (400)
- **Category Badges** - Text color (#3b82f6), background (#f1f5f9), border radius (16px)

## Animation & Hover Effects

- **Enable Animations** - Toggle GSAP reveal animations (default: on)
- **Animation Type** - FadeUp, FadeIn, SlideUp, etc. (default: fadeUp)
- **Transition Animation** - Fade or slide when switching filters (default: fade)
- **Duration / Delay / Ease** - 0.6s duration, 0.1s stagger, easing `power2.out` by default
- **Hover Effects** - Scale cards (default 1.05), add shadow, and overlay gradients (opacity 0.4)

## Layout & Container Controls

- **Text Align** - Align card content left, center, or right (default: left)
- **Container Mode** - Full-width or constrained wrapper (default: full) with responsive max width controls
- **Margins** - Device-specific spacing to separate the grid from surrounding sections

## Responsive Behavior

### Desktop (> 1024px)
- Three-column layout with animations triggered on initial load
- Filters (when enabled) appear above the grid in the chosen style
- Cards scale on hover with optional shadow for emphasis

### Tablet (768px - 1024px)
- Grid drops to two columns for readability
- Filter pills remain touch-friendly with spacing adjustments
- Images and typography scale to maintain visual balance

### Mobile (< 768px)
- Single-column stack with full-width cards
- Pagination converts to stacked numbers or load-more buttons for easy tapping
- Hover effects adjust to tap interactions (shadow without scale)

## Technical Features

- Unique `blockId` applied for per-instance CSS and GSAP timelines
- `view.js` handles initial load animations, filtering transitions, and hover effects
- Uses `WP_Query` parameters to fetch posts server-side (rendered in PHP save callback)
- CSS variables expose colors, fonts, and spacing for theme-level overrides

## Usage Tips

1. **Curate Categories** - Enable filtering for content hubs with multiple topics.
2. **Limit Excerpt Length** - Keep excerpts short (15–25 words) for consistent card heights.
3. **Adjust Columns** - Use two columns for content-heavy cards, three for image-focused layouts.
4. **Optimize Images** - Ensure featured images share similar aspect ratios to avoid jumpy layouts.
5. **Combine With Query Loop** - Use separate Post Grid blocks for featured vs. latest content sections.

## Best Practices

- **Keep Filters Manageable** - Limit to 5–7 categories to avoid clutter.
- **Ensure Contrast** - Adjust card text colors when using dark backgrounds.
- **Monitor Performance** - Disable animations on low-power sections if needed.
- **Test Pagination** - Verify pagination works when embedded in archives or the homepage.
- **Use Consistent Design** - Align card styling with other listing components across the site.

## Accessibility

- Semantic markup with article headings and link titles for screen readers
- Filters rendered as buttons with ARIA attributes for state changes
- Keyboard navigation supported for cards, filters, and pagination controls
- Ensure overlay gradients preserve text contrast for users with low vision

## Browser Compatibility

- Works in modern browsers (Chrome, Firefox, Safari, Edge) with hardware-accelerated animations
- Mobile browsers support touch interactions and filter toggles
- Graceful fallback: if JS disabled, grid displays static cards without animation/filtering

## Screenshots

### Desktop View
- Three-column layout with category pills above the grid
- Animated card entrance and hover shadow/scale effects
- Meta details and excerpts uniformly styled

### Tablet View
- Two-column layout with stacked filters
- Cards resized for mid-sized screens with consistent spacing
- Pagination accessible via touch

### Mobile View
- Single column cards with full-width images
- Filters and pagination converted to mobile-friendly controls
- Clear typography and tap targets for each post



