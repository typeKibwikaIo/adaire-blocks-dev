# CTA Block Documentation

## Overview

In this article, we look at the CTA (Call-to-Action) Block, a powerful block that creates visually stunning call-to-action sections with animated carousels and glowing gradient backgrounds. This block features extensive customization options with smooth GSAP animations and a Splide-powered carousel. The block is fully responsive and works seamlessly across all device sizes. This block doesn't require you to mess around with complex Gutenberg patterns, saving you time and making the website development process smoother. Just click, add content, and you're ready to go.

## Adding the CTA Block to your page

### Locate and add the CTA Block

1. Type "/" and then type in "cta"
2. Select the CTA Block
3. The block will appear with default content including a main title, subtitle, and carousel items

## Content Settings

### Main Section Content

**Main Title** - The primary heading text for the CTA section
- Editable through RichText in the editor
- Supports HTML formatting
- Default: "Adaire Blocks"

**Subtitle** - The secondary heading text below the main title
- Editable through RichText in the editor
- Supports HTML formatting
- Default: "Coming soon! Sign up for our Preview"

### Carousel Items

The CTA Block includes a carousel that displays multiple items. You can add, remove, and customize each carousel item.

**Per Carousel Item Settings:**

- **Title** - The display text for each carousel item
- **Description** - The detailed description text for each carousel item
- **Background Image** - Upload an image to display as the background for each carousel item
  - Images are displayed with cover sizing and centered positioning
  - Images can be removed or replaced at any time
  - Supports all standard WordPress image formats

**Carousel Management:**
- **Add Carousel Item** - Add new items to the carousel
- **Remove Item** - Remove individual carousel items (minimum 1 item required)

## Color Settings

### Background Colors

**Block Background Color** - The main background color for the entire block
- Default: #1a1a1a (dark gray)

**Gradient Color 1 (Primary)** - The primary color for the glowing gradient effect
- Default: #ff4444 (red)

**Gradient Color 2 (Secondary)** - The secondary color for the glowing gradient effect
- Default: #ff6666 (lighter red)

**Gradient Opacity** - Controls the opacity/intensity of the gradient glow effect
- Range: 0.0 to 1.0
- Step: 0.1
- Default: 0.1
- Higher values create more intense glow effects

### Text Colors

**Main Title Color** - Text color for the main title
- Default: #ffffff (white)

**Subtitle Color** - Text color for the subtitle
- Default: #ffffff (white)

**Carousel Text Color** - Text color for carousel item titles and descriptions
- Default: #ffffff (white)

## Typography Settings

### Main Section Typography

**Main Title Font Size** - Text size for the main title
- Range: 24px to 100px
- Default: 48px

**Main Title Font Weight** - Boldness of the main title text
- Range: 100 to 900
- Step: 100
- Default: 700 (bold)
- Common values: 300 (light), 400 (normal), 500 (medium), 600 (semi-bold), 700 (bold)

**Subtitle Font Size** - Text size for the subtitle
- Range: 14px to 50px
- Default: 24px

**Subtitle Font Weight** - Boldness of the subtitle text
- Range: 100 to 900
- Step: 100
- Default: 400 (normal)

### Carousel Typography

**Carousel Font Size** - Base font size for carousel items
- Range: 14px to 40px
- Default: 20px

**Carousel Title Font Weight** - Boldness of carousel item titles
- Range: 100 to 900
- Step: 100
- Default: 700 (bold)

**Carousel Description Font Weight** - Boldness of carousel item descriptions
- Range: 100 to 900
- Step: 100
- Default: 400 (normal)

## Animation Settings

### GSAP Animation Controls

**Animation Speed** - Controls the speed of GSAP scroll-triggered animations
- Range: 0.1 to 3.0
- Step: 0.1
- Default: 1.0
- Lower values = slower animations
- Higher values = faster animations
- Help text: "Controls the speed of GSAP animations. Lower values = slower, higher values = faster."

### Carousel Animation Settings

**Carousel Speed (ms)** - Time between carousel transitions in milliseconds
- Range: 1000ms to 8000ms
- Step: 500ms
- Default: 3000ms
- Help text: "Time between carousel transitions in milliseconds."

## Autoplay Settings

**Enable Autoplay** - Toggle automatic carousel transitions
- Default: Enabled (true)
- When enabled, carousel automatically advances through slides

**Autoplay Delay (ms)** - Time between automatic slide transitions
- Range: 1000ms to 10000ms
- Step: 500ms
- Default: 4000ms
- Only visible when autoplay is enabled
- Help text: "Time between automatic slide transitions."

## Block Settings

**Block ID** - Add a custom ID to this block for CSS targeting or anchor links
- Optional field
- Useful for custom CSS styling or creating anchor links
- Leave empty if not needed

## Responsive Behavior

### Desktop (> 1024px)
- Carousel displays 3 items per page
- Full typography sizes as configured
- Standard padding and spacing

### Tablet (768px - 1024px)
- Carousel displays 2 items per page
- Font sizes automatically scale down (70-80% of desktop)
- Reduced padding for optimal viewing

### Mobile (< 768px)
- Carousel displays 1 item per page
- Font sizes further reduced (50-70% of desktop)
- Minimal padding for small screens
- Carousel height optimized for mobile viewing

**Responsive Breakpoints:**
- Desktop: 1024px and above (3 slides visible)
- Tablet: 768px to 1024px (2 slides visible)
- Mobile: Below 768px (1 slide visible)
- Small Mobile: Below 480px (further optimizations)

## Animation Features

### GSAP Animations
- **Scroll-Triggered Entrance Animations** - Elements animate in as they enter the viewport
- **Fade In Up Effect** - Title and subtitle fade in with upward motion
- **Staggered Animations** - Elements animate in sequence for smooth visual flow
- **Hardware-Accelerated** - Optimized for smooth performance

### Gradient Glow Effect
- **Pulsing Animation** - Gradient background pulses with smooth animation
- **Radial Gradient** - Creates a glowing effect from center outward
- **Blur Effect** - Applies blur filter for dreamy glow appearance
- **Customizable Intensity** - Control opacity to adjust glow strength

### Carousel Animations
- **Smooth Transitions** - Splide-powered smooth slide transitions
- **Navigation Arrows** - Previous/next arrow controls
- **Pagination Dots** - Visual indicators for current slide position
- **Loop Mode** - Continuous looping through carousel items

## Technical Features

### Splide Carousel Integration
- **Type**: Loop carousel for continuous scrolling
- **Per Page**: Responsive (3 desktop, 2 tablet, 1 mobile)
- **Per Move**: 1 slide at a time
- **Gap**: 0px between slides
- **Navigation**: Arrows and pagination dots
- **Speed**: 800ms transition speed

### GSAP ScrollTrigger
- **Entrance Animations** - Elements animate on scroll
- **Performance Optimized** - Hardware-accelerated animations
- **Smooth Transitions** - Professional-grade animation timing

### CSS Custom Properties
All settings are applied via CSS custom properties (variables) for efficient styling:
- `--gradient-color-1` - Primary gradient color
- `--gradient-color-2` - Secondary gradient color
- `--gradient-opacity` - Gradient opacity
- `--title-font-size` - Main title font size
- `--subtitle-font-size` - Subtitle font size
- `--carousel-font-size` - Carousel font size
- `--title-font-weight` - Main title font weight
- `--subtitle-font-weight` - Subtitle font weight
- `--title-font-weight` - Carousel title font weight
- `--description-font-weight` - Carousel description font weight
- `--title-color` - Main title color
- `--subtitle-color` - Subtitle color
- `--carousel-text-color` - Carousel text color
- `--animation-speed` - GSAP animation speed
- `--carousel-speed` - Carousel transition speed

## Usage Tips

1. **Start with Content** - Add your main title, subtitle, and carousel items first
2. **Customize Colors** - Adjust background and gradient colors to match your brand
3. **Set Typography** - Configure font sizes and weights for optimal readability
4. **Add Images** - Upload background images for carousel items to create visual interest
5. **Fine-tune Animations** - Adjust animation speed and carousel timing to match your site's style
6. **Test Responsiveness** - Preview on different screen sizes to ensure optimal display
7. **Use Block ID** - Add a custom ID if you need to target this block with custom CSS

## Best Practices

- **Image Optimization** - Use optimized images for carousel backgrounds to ensure fast loading
- **Content Length** - Keep carousel item titles and descriptions concise for best visual impact
- **Color Contrast** - Ensure text colors contrast well with background colors for readability
- **Animation Speed** - Moderate animation speeds (0.8-1.5) provide the best user experience
- **Autoplay Timing** - Set autoplay delay to 3-5 seconds for optimal user engagement
- **Responsive Testing** - Always test on mobile devices to ensure proper display

## Accessibility

- **ARIA Labels** - Carousel includes proper ARIA labels for screen readers
- **Keyboard Navigation** - Carousel supports keyboard navigation
- **Focus Management** - Proper focus indicators for interactive elements
- **Semantic HTML** - Uses proper heading hierarchy (h1, h2, h3)

## Browser Compatibility

- **Modern Browsers** - Fully supported in Chrome, Firefox, Safari, and Edge
- **Mobile Browsers** - Optimized for iOS Safari and Chrome Mobile
- **Animation Support** - Uses CSS animations with JavaScript enhancement
- **Fallback Support** - Graceful degradation for older browsers

All of these settings can be configured through the WordPress block editor interface, with most having real-time preview capabilities in the editor.

## Screenshots

### Desktop View
- Full-width CTA section with gradient glow
- Main title and subtitle prominently displayed
- Carousel showing 3 items with navigation arrows

### Tablet View
- Responsive layout with adjusted spacing
- Carousel displaying 2 items per page
- Optimized typography for tablet screens

### Mobile View
- Single-column carousel layout
- Compact spacing and typography
- Touch-friendly navigation controls

