# Animation on Scroll Block Documentation

## Overview

In this article, we look at the Animation on Scroll Block, a flexible wrapper that plays entrance animations when the wrapped content enters the viewport. The block supports fade, fly, grow, shrink, bounce, flip, rotate, and blur effects, with fine-grained control over timing, distance, thresholds, and easing. Use it to bring attention to hero sections, callouts, or any stack of inner blocks without writing custom JavaScript.

## Adding the Animation on Scroll Block to your page

### Locate and add the Animation on Scroll Block

1. Type "/" and then type in "animation on scroll"
2. Select the Animation on Scroll Block
3. The block appears with a placeholder group that you can replace with any inner blocks

## Animation Settings

### Animation Type

**Animation Type** - Choose how the content appears as it scrolls into view  
- Options:
  - **Fade In / Fade Out / Fade Left / Fade Right**
  - **Fly Up / Fly Down / Fly Left / Fly Right**
  - **Grow / Shrink / Bounce**
  - **Flip** (with axis and direction controls)
  - **Rotate**
  - **Blur In / Blur Out**
- Default: Fade In
- Applies animation-specific transforms and opacity before the block becomes visible

**Distance (px)** - Travel distance for fly and directional fade effects  
- Range: 0 to 300  
- Step: 10  
- Default: 50  
- Disabled when the selected animation type does not rely on translation

**Flip Axis** - Axis used for flip animations  
- Options: Horizontal, Vertical  
- Default: Horizontal  
- Only appears when the animation type is set to Flip

**Flip Direction** - Rotation direction for flip animations  
- Options: Clockwise, Anti-clockwise  
- Default: Clockwise  
- Only appears when the animation type is set to Flip

### Timing and Behavior

**Duration (ms)** - Length of the animation  
- Range: 100 to 3000  
- Step: 100  
- Default: 1000  
- Higher values slow the animation for dramatic entrances

**Delay (ms)** - Wait time before the animation starts  
- Range: 0 to 2000  
- Step: 100  
- Default: 0  
- Helpful for staggering multiple blocks down the page

**Easing** - Motion curve for the animation  
- Options: Ease Out, Ease In, Ease In Out, Linear, Ease Out Back, Ease Out Quart, Spring  
- Default: Ease Out  
- Choose Spring or Back for playful movement

**Threshold (0-1)** - How much of the block must be visible before triggering  
- Range: 0.0 to 1.0  
- Step: 0.1  
- Default: 0.2  
- Lower values trigger earlier; higher values wait until more of the block is visible

**Reverse on Scroll Out** - Rewind the animation when the block leaves the viewport  
- Default: Off  
- Enable to let the block animate again when scrolled back into view

**Animate Once** - Play the animation only on the first entry  
- Default: On  
- Disable to re-run the animation every time the block re-enters the viewport

## Container Settings

### Layout Controls

**Container Mode** - Determines how wide the animated wrapper can grow  
- Options: Full Width, Constrained  
- Default: Full Width  
- Constrained mode exposes max-width sliders per device

**Max Width** - Device-specific width in constrained mode  
- Desktop: 600px to 1600px (default 1200px)  
- Tablet: 50% to 100% (default 100%)  
- Mobile: 50% to 100% (default 100%)  
- Units: px, %, rem, vw  
- Adjust with the device toggle icons in the inspector

### Spacing Controls

**Margins** - Outer spacing with desktop/tablet/mobile overrides  
- Default: 0px on all sides  
- Use for vertical spacing between animated sections

**Padding** - Inner spacing with desktop/tablet/mobile overrides  
- Default: 0px on all sides  
- Add breathing room around inner content while keeping the animation wrapper tight

## Inner Blocks

The Animation on Scroll Block supports full inner block editing:
- Default template inserts a group with a placeholder paragraph
- Replace the placeholder with any layout (columns, images, call-to-action stacks)
- Animations apply to the wrapper regardless of inner block complexity

## Responsive Behavior

### Desktop (> 1024px)
- Respects desktop max-width and spacing values
- Animations play once the configured threshold of the viewport is reached
- Full-width alignment stretches edge-to-edge

### Tablet (768px - 1024px)
- Uses tablet max-width, margin, and padding overrides
- Animations rely on the same IntersectionObserver threshold for consistent behavior

### Mobile (< 768px)
- Uses mobile max-width, margin, and padding overrides
- Flip, grow, and rotate animations are optimized to avoid jarring motion on small screens
- Touch interactions do not interrupt the animation playback

## Technical Features

### CSS Custom Properties

The block exposes several CSS variables for theming:
- `--container-max-width`, `--container-max-width-tablet`, `--container-max-width-mobile`
- `--margin-*` and `--padding-*` per breakpoint
- Animation-specific values (duration, easing, distance) are passed through inline styles and data attributes for the frontend script

### JavaScript Behavior

- Uses `IntersectionObserver` to detect when the block enters or leaves the viewport
- Applies GPU-accelerated transforms for smooth motion
- Supports re-running animations based on `once` and `reverseOnScrollOut` toggles
- Frontend script (`view.js`) handles animation classes while the editor provides live previews

## Usage Tips

1. **Start with Fade In** - Use a simple animation while laying out the page, then experiment with more advanced options.
2. **Stagger Animations** - Combine delay offsets (100ms, 200ms, 300ms) to create a cascading effect down the page.
3. **Match Easing to Brand** - Choose Spring or Ease Out Back for playful brands; Linear or Ease Out for professional designs.
4. **Control Movement** - Reduce the distance slider for subtle effects, or increase it for dramatic fly-ins.
5. **Test Responsiveness** - Preview on tablet and mobile to ensure motion remains smooth and non-intrusive.

## Best Practices

- **Keep Threshold Low for Hero Sections** - Values between 0.1 and 0.3 trigger quickly and feel responsive.
- **Use Animate Once for Performance** - One-time animations reduce CPU usage on scroll-heavy pages.
- **Avoid Overuse** - Mix animated and static sections to prevent animation fatigue.
- **Coordinate with Content** - Align animation direction with the layout (e.g., fly-in from the left for left-aligned content).
- **Accessibility First** - Pair motion with clear headings and concise text so the message lands immediately.

## Accessibility

- **Keyboard Support** - Inner blocks remain fully accessible; animations do not trap focus.
- **Reduced Motion** - Respect user prefers-reduced-motion settings when implemented in theme-level CSS.
- **Readable Content** - Content is present in the DOM before animation, ensuring screen readers capture it.
- **Contrast** - Combine animations with high-contrast typography for legibility.

## Browser Compatibility

- **Modern Browsers** - Fully supported in current versions of Chrome, Firefox, Safari, and Edge.
- **Mobile Browsers** - Optimized for iOS Safari and Chrome on Android.
- **Fallbacks** - If IntersectionObserver is unavailable, content remains visible without animation.
- **CSS Transforms** - Leverages GPU-accelerated transforms for smooth playback.

## Screenshots

### Desktop View
- Content blocks animating into view with smooth easing
- Wide layout constrained by optional max-width control
- Overlapping or staggered sections remain synchronized

### Tablet View
- Same animation timing with tablet-specific spacing
- Touch-friendly layout that avoids excessive motion
- Balanced presentation within constrained viewport width

### Mobile View
- Vertical layout with mobile spacing overrides
- Lightweight animations that avoid directional overload
- Clear typography and call-to-action visibility on small screens



