# Call To Action Block Documentation

## Overview

In this article, we look at the Call To Action Block, a hero-style banner that combines rich background imagery, gradients, and responsive layouts to highlight a primary message and button group. The block ships with multiple layout presets (split, stacked, overlay) and gives you full control over typography, spacing, overlay treatments, and background motion. It is ideal for promotional sections, product highlights, or conversion-focused hero areas.

## Adding the Call To Action Block to your page

### Locate and add the Call To Action Block

1. Type "/" and then type in "call to action"
2. Select the Call To Action Block
3. The block appears with demo copy and image placeholders that you can replace with your own assets

## Layout Settings

### Block Structure

**Layout Preset** - Controls the overall structure of the CTA  
- Options: Split Left, Split Right, Stacked, Overlay  
- Default: Split Left  
- Split layouts display copy on one side and imagery on the other; stacked layouts move the image below the content on smaller screens.

**Minimum Height** - Ensures the section has enough vertical space  
- Range: 200px to 900px  
- Default: 400px  
- Increase for immersive hero banners.

**Content Justify** - Aligns content vertically within the block  
- Options: Flex Start, Center, Flex End  
- Default: Center  
- Use Flex End for bottom-heavy CTAs.

**Content Align** - Aligns items horizontally inside the content column  
- Options: Flex Start, Center, Flex End  
- Default: Flex Start  
- Combine with text alignment controls for precise positioning.

## Background & Overlay Settings

### Imagery

**Background Image** - Upload or choose from the media library  
- Default: None  
- Supports focal point, size, and position controls.

**Background Size** - Scales the background image  
- Options: Cover, Contain, Auto  
- Default: Cover  
- Cover fills the area; Contain keeps the full image visible.

**Background Position** - Anchors the image  
- Options: Top, Center, Bottom, Left, Right combinations  
- Default: Center  
- Adjust to keep the subject visible on different screens.

**Image Width** - Percentage width of the media column in split layouts  
- Range: 20% to 80%  
- Default: 50%  
- Smaller values emphasize copy; larger values emphasize imagery.

### Gradient Treatments

**Section Gradient** - Apply a glowing gradient behind the entire block  
- Type: None, Linear, Radial  
- Colors: Customizable start and end colors  
- Direction: Any angle (default 135°)  
- Opacity: 0 to 1 (default 0.1)

**Content Gradient** - Gradient overlay behind the text column  
- Same controls as section gradient  
- Default: Disabled  
- Great for making text pop over busy imagery.

**Overlay Gradient** - Gradient overlay on the image or overlay layout  
- Controls: Type, color 1, color 2, direction, opacity, origin  
- Default: None  
- Use higher opacity (0.4–0.6) for legible overlay copy.

### Overlay Mode

**Overlay Background Color** - Solid color overlay for the overlay layout  
- Default: #000000  
- Combine with opacity for semi-transparent scrims.

**Overlay Opacity** - Transparency of the overlay  
- Range: 0 to 1  
- Default: 0.5  
- Lower values show more of the background image.

**Overlay Content Width** - Responsive width of the overlay content column  
- Desktop Default: 50%  
- Tablet Default: 70%  
- Mobile Default: 90%  
- Keeps overlay text readable across devices.

**Overlay Text Colors** - Overrides for header, body, and general text when overlay mode is active  
- Defaults: All set to white for contrast.

## Typography Settings

### Heading

**Heading Text** - Short, action-oriented phrase  
- Default: "Header Text"  
- Supports inline formatting in the editor.

**Heading Font Size** - Responsive sizes for desktop/tablet/mobile  
- Defaults: 40px / 32px / 24px  
- Range: 12px to 80px depending on breakpoint.

**Heading Color** - Default: #333333  
- Choose brand colors or white over dark overlays.

**Heading Margin Bottom** - Responsive spacing below the heading  
- Defaults: 20px / 16px / 12px  
- Adjust to tighten or loosen the layout.

**Heading Alignment & Weight**  
- Alignment options: Left, Center, Right  
- Default: Left  
- Weight options: 300–700 (default 300 for a light hero style).

### Body Copy

**Body Text** - Supporting description for the CTA  
- Default: Placeholder lorem ipsum  
- Supports inline formatting.

**Body Font Size** - Responsive sizes (default 16px / 14px / 12px)  
- Adjust for readability on smaller screens.

**Body Color** - Default: #666666  
- Pick a lighter color when overlay mode is enabled.

**Body Margin Bottom** - Spacing below paragraph content  
- Defaults: 20px / 16px / 12px  
- Use to control space before buttons.

**Body Alignment & Weight**  
- Alignment: Left, Center, Right  
- Weight: 300–500  
- Default alignment: Left; default weight: 300.

## Button & Content Area Settings

- The block supports inner blocks (button groups, icons, additional paragraphs) inside the content column.
- `contentPadding` adds padding around the text column (default 20px on all sides) and can be adjusted for breathing room.
- `contentBackgroundColor` adds a solid background for the copy column in split layouts.
- `contentBorderRadius` rounds the container (default 0; increase to 12–24px for softer cards).
- `stackedImageHeight` controls the height of the image in stacked mode with responsive units (desktop 500px, tablet 400px, mobile 300px).
- `stackedContentWidth` lets you reduce the text column width when stacked (defaults: 50/70/90).

## Spacing & Container Settings

### Outer Spacing

**Margins** - Desktop/tablet/mobile control for all four sides  
- Default: 0px  
- Use margin top/bottom to separate CTAs from adjacent sections.

### Container Width

**Container Mode** - Determines whether the block stretches full width or stays constrained  
- Options: Full (default), Constrained  
- Constrained mode activates the max-width sliders per device.

**Container Max Width** - Responsive width when constrained  
- Desktop: 1200px (adjustable)  
- Tablet: 100%  
- Mobile: 100%  
- Units supported: px, %, rem, vw.

## Responsive Behavior

### Desktop (> 1024px)
- Split layouts display copy and media side-by-side according to `imageWidth`.
- Overlay mode keeps content within the configured width and centers it vertically.
- Gradient and background image render at full resolution.

### Tablet (768px - 1024px)
- Columns stack or shrink based on layout selection and responsive width settings.
- Typography scales down to maintain readable proportions.
- Padding and margins adopt tablet-specific overrides for balanced spacing.

### Mobile (< 768px)
- Content stacks vertically with mobile font sizes and widths.
- Buttons remain full-width for easy tapping.
- Overlays and gradients maintain contrast while preserving image visibility.

## Technical Features

### CSS Custom Properties

The block exposes numerous CSS variables for theme overrides:
- `--cta-min-height`, `--cta-image-width`, `--cta-overlay-opacity`
- `--cta-heading-font-size-*`, `--cta-body-font-size-*`
- `--cta-container-max-width-*` for desktop/tablet/mobile
- Padding and margin variables per breakpoint for precise layout control

### JavaScript Enhancements

- Frontend script (`view.js`) handles animated backgrounds and optional carousel behaviors.
- Reactively updates classes for the selected layout to drive editor and frontend styling.
- Generates unique block IDs for targeting in custom CSS.

## Usage Tips

1. **Start with Split Layout** - Pair a bold hero image with concise copy for instant impact.
2. **Leverage Gradients** - Use subtle gradients to create depth behind text without obscuring imagery.
3. **Adjust Padding** - Increase `contentPadding` on desktop for premium spacing; reduce on mobile.
4. **Overlay Mode for Busy Images** - Apply a dark overlay with 0.4–0.6 opacity and white text to ensure readability.
5. **Combine with Buttons** - Nest the Button Block or CTA Button Inner Block to drive clear actions.

## Best Practices

- **Keep Copy Short** - Limit headings to one sentence and body copy to 2–3 lines for clarity.
- **Use High-Quality Imagery** - Choose images that reinforce the call to action and maintain contrast when overlays are applied.
- **Maintain Consistent Alignment** - Align heading, body, and buttons consistently to avoid visual clutter.
- **Test on Multiple Devices** - Preview tablet/mobile to confirm readable text and appropriate image cropping.
- **Optimize Performance** - Compress hero images and avoid auto-play videos for faster loading.

## Accessibility

- **Semantic Structure** - Headings and paragraphs use semantic HTML for screen readers.
- **Focusable Buttons** - Button inner blocks remain fully keyboard-navigable.
- **Contrast Checks** - Ensure chosen text and overlay colors meet WCAG contrast ratios.
- **Reduced Motion** - Avoid enabling excessive animation if your audience may prefer reduced motion.
- **Alt Text** - Provide descriptive alt text for background images when using decorator elements or inline images.

## Browser Compatibility

- **Modern Browsers** - Supported in current Chrome, Firefox, Safari, and Edge releases.
- **Mobile Browsers** - Tested on iOS Safari and Android Chrome.
- **Fallbacks** - If gradients are not supported, solid background colors are applied.
- **Flexbox Layout** - Uses flexbox for layout; widely supported across modern browsers.

## Screenshots

### Desktop View
- Split layout with background imagery and contrasting overlay
- Large headline, supporting copy, and prominent buttons
- Subtle animated glow around the CTA container

### Tablet View
- Responsive stacking with centered content
- Balanced typography and padding adjustments
- Image scales to maintain focus without crowding text

### Mobile View
- Full-width content with easy-to-tap buttons
- Mobile typography for clear hierarchy
- Overlay or gradient ensures text remains readable



