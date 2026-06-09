# Button Block Documentation

## Overview

In this article, we look at the Button Block, a versatile and customizable button component with multiple style options, hover animations, and extensive styling controls. This block features various button styles including underline, fill, border, gradient, and glass effects, along with multiple hover animation options. The button is fully customizable with color controls, typography settings, spacing options, and supports both internal and external links. This block doesn't require you to mess around with complex Gutenberg patterns, saving you time and making the website development process smoother. Just click, configure, and you're ready to go.

## Adding the Button Block to your page

### Locate and add the Button Block

1. Type "/" and then type in "button"
2. Select the Button Block
3. The block will appear with default text "Click Here"

## Button Settings

### Basic Button Configuration

**Button Text** - The text displayed on the button
- Default: "Click Here"
- Editable text field
- Supports any text content

**Button Link** - The URL destination for the button
- Default: "#"
- Supports relative paths, absolute URLs, and anchor links
- Type: URL field

**Open in New Tab** - Toggle whether the link opens in a new browser tab
- Default: Disabled (false)
- When enabled: Link opens in new tab with `target="_blank"` and `rel="noopener noreferrer"`
- When disabled: Link opens in the same tab

## Button Styling

### Color Settings

**Button Color** - Text color for the button
- Default: #000000 (black)
- Controls the default text color

**Button Background Color** - Background color for the button
- Default: transparent
- Supports full color picker with alpha/opacity support
- Can be set to transparent or any color with opacity
- "Clear Background Color" button available to reset to transparent

**Hover Text Color** - Text color when hovering over the button
- Default: #ffffff (white)
- Controls the text color on hover

**Hover Background Color** - Background color when hovering over the button
- Default: transparent
- Supports full color picker with alpha/opacity support
- Can be set to transparent or any color with opacity
- "Clear Hover Background Color" button available to reset to transparent

**Underline Color** - Color of the underline effect (for underline style)
- Default: #ff4242 (red)
- Only applies when button style is set to "Underline"

### Button Style Options

**Button Style** - Visual style of the button
- Options:
  - **Underline** - Text with animated underline effect (default)
  - **Background Fill** - Solid background color button
  - **Border** - Outlined button with border
  - **Gradient** - Gradient background button
  - **Glass Effect** - Glassmorphism effect with blur
- Default: underline

### Hover Animation Options

**Hover Animation** - Animation effect when hovering over the button
- Options:
  - **Slide Underline** - Animated underline slides in (default)
  - **Scale** - Button scales up slightly
  - **Bounce** - Bouncing animation effect
  - **Glow** - Glowing shadow effect
  - **Shake** - Shaking animation
  - **None** - No animation, only color changes
- Default: slide-underline

### Visual Effects

**Blur Amount (px)** - Blur effect intensity (for glass effect)
- Range: 0px to 20px
- Step: 1px
- Default: 0px
- Primarily affects the glass button style

**Show Icon** - Toggle visibility of the arrow icon
- Default: Enabled (true)
- When enabled: Arrow icon appears next to button text
- When disabled: Only button text is displayed

## Typography Settings

### Font Configuration

**Font Size (px)** - Text size for the button
- Range: 12px to 48px
- Step: 1px
- Default: 18px

**Font Weight** - Boldness of the button text
- Options:
  - Thin (100)
  - Extra Light (200)
  - Light (300)
  - Normal (400)
  - Medium (500) - Default
  - Semi Bold (600)
  - Bold (700)
  - Extra Bold (800)
  - Black (900)
- Default: 500 (Medium)

## Spacing Settings

### Padding

**Button Padding** - Internal spacing within the button
- Controls padding for all sides independently
- Units: px, em, rem
- Default values:
  - Top: 10px
  - Right: 20px
  - Bottom: 10px
  - Left: 20px

### Margin

**Button Margin** - External spacing around the button
- Controls margin for all sides independently
- Units: px, em, rem
- Default values:
  - Top: 20px
  - Right: 0px
  - Bottom: 20px
  - Left: 0px

## Advanced Settings

### Layout Controls

**Z-Index** - Stacking order of the button
- Range: 0 to 100
- Step: 1
- Default: 1
- Controls the layering order when elements overlap

**Border Radius (px)** - Roundness of the button corners
- Range: 0px to 50px
- Step: 1px
- Default: 0px
- Creates rounded corners on the button

### Block Settings

**Block ID** - Add a custom ID to this block for CSS targeting or anchor links
- Optional field
- Useful for custom CSS styling or creating anchor links
- Leave empty if not needed

## Button Style Details

### Underline Style
- Text with animated underline that slides in on hover
- Underline color can be customized
- Smooth slide animation from left to right
- Default style option

### Background Fill Style
- Solid background color button
- Background color customizable
- Hover background color for hover state
- Border radius applies to rounded corners

### Border Style
- Outlined button with border
- Border color matches button text color
- On hover, fills with background color
- Text color changes on hover

### Gradient Style
- Gradient background using button and hover background colors
- 45-degree gradient direction
- Gradient reverses on hover for animation effect
- Smooth color transition

### Glass Effect Style
- Glassmorphism effect with backdrop blur
- Semi-transparent background
- Blur amount customizable
- Subtle border for glass effect
- Modern, elegant appearance

## Hover Animation Details

### Slide Underline
- Default animation for underline style
- Underline slides in from left to right on hover
- Smooth, professional animation

### Scale
- Button scales up by 5% on hover
- Smooth scaling transition
- Provides visual feedback

### Bounce
- Bouncing animation effect
- Button bounces up and down on hover
- Playful, dynamic interaction

### Glow
- Glowing shadow effect around button
- Shadow color matches button text color
- Creates a luminous effect

### Shake
- Shaking animation on hover
- Side-to-side movement
- Attention-grabbing effect

### None
- No animation effects
- Only color changes on hover
- Minimal, subtle interaction

## Icon Behavior

### Arrow Icon
- Displays an arrow icon next to button text
- Icon color matches button text color
- Slides to the right on hover (4px translation)
- Can be hidden via "Show Icon" toggle
- SVG icon for crisp rendering at any size

## Responsive Behavior

### Desktop
- Full typography and spacing as configured
- All hover effects work as expected
- Optimal button sizing

### Tablet
- Maintains button functionality
- Touch-friendly hover states
- Responsive font sizing

### Mobile
- Touch-optimized interactions
- Hover effects work on touch devices
- Maintains readability and usability

## Technical Features

### CSS Custom Properties
All settings are applied via CSS custom properties (variables) for efficient styling:
- `--button-color` - Button text color
- `--button-bg-color` - Button background color
- `--button-hover-color` - Hover text color
- `--button-hover-bg-color` - Hover background color
- `--button-underline-color` - Underline color
- `--button-blur` - Blur amount for glass effect
- `--button-font-size` - Font size
- `--button-font-weight` - Font weight
- `--button-padding-top/right/bottom/left` - Padding values
- `--button-margin-top/right/bottom/left` - Margin values
- `--button-z-index` - Z-index value
- `--button-border-radius` - Border radius

### Link Attributes
- **Target**: Automatically set to `_blank` when "Open in new tab" is enabled
- **Rel**: Automatically includes `noopener noreferrer` for security when opening in new tab
- **Href**: Supports any valid URL format

## Usage Tips

1. **Start with Content** - Add your button text and link first
2. **Choose Style** - Select the button style that matches your design
3. **Customize Colors** - Adjust colors to match your brand
4. **Set Typography** - Configure font size and weight for readability
5. **Add Animation** - Choose hover animation that fits your site's style
6. **Adjust Spacing** - Fine-tune padding and margin for optimal placement
7. **Test Hover Effects** - Preview hover animations to ensure desired effect
8. **Consider Context** - Choose button style that works with your page design

## Best Practices

- **Color Contrast** - Ensure text color contrasts well with background for readability
- **Link Targets** - Use "Open in new tab" for external links, same tab for internal navigation
- **Button Text** - Keep button text concise and action-oriented
- **Animation Speed** - Default animations are optimized, but can be customized via CSS
- **Accessibility** - Button includes proper focus states for keyboard navigation
- **Spacing** - Use margins to create proper spacing between buttons and other elements
- **Style Consistency** - Use consistent button styles across your site for brand cohesion
- **Glass Effect** - Glass effect works best on backgrounds with visual content

## Accessibility

- **Keyboard Navigation** - Button is fully keyboard accessible
- **Focus Indicators** - Clear focus outline for keyboard users
- **ARIA Attributes** - Proper semantic HTML with anchor tags
- **Screen Reader Support** - Button text is properly announced
- **Link Semantics** - Uses proper anchor element for navigation

## Browser Compatibility

- **Modern Browsers** - Fully supported in Chrome, Firefox, Safari, and Edge
- **Mobile Browsers** - Optimized for iOS Safari and Chrome Mobile
- **Animation Support** - Uses CSS transitions and animations with JavaScript enhancement
- **Backdrop Filter** - Glass effect uses backdrop-filter (modern browsers)
- **Fallback Support** - Graceful degradation for older browsers

All of these settings can be configured through the WordPress block editor interface, with most having real-time preview capabilities in the editor.

## Screenshots

### Desktop View
- Button with various style options
- Hover effects in action
- Different button styles side by side

### Tablet View
- Touch-friendly button interactions
- Responsive sizing
- Maintained visual appeal

### Mobile View
- Optimized for mobile interactions
- Touch-optimized hover states
- Readable button text

