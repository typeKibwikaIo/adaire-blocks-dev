# Social Banner Block Documentation

## Overview

In this article, we look at the Social Banner Block, a powerful block that creates a sticky social media banner on the side of the screen with customizable icons, colors, links, and hover animations. This block features extensive customization options with multiple hover animation types, customizable animation duration and easing, and support for unlimited icon entries. The banner is fully responsive and works seamlessly across all device sizes. This block doesn't require you to mess around with complex Gutenberg patterns, saving you time and making the website development process smoother. Just click, add icons, and you're ready to go.

## Adding the Social Banner Block to your page

### Locate and add the Social Banner Block

1. Type "/" and then type in "social banner"
2. Select the Social Banner Block
3. The block will appear with a placeholder message prompting you to add icon entries

## Position Settings

### Banner Position

**Position** - Which side of the screen the banner appears on
- Options:
  - **Left** - Banner appears on the left side of the screen
  - **Right** - Banner appears on the right side of the screen (default)
- Default: Right

### Offset Settings

**Offset From** - Position the banner from top or bottom of the screen
- Options:
  - **Top** - Position from the top of the screen (default)
  - **Bottom** - Position from the bottom of the screen
- Default: Top

**Offset** - Distance from the top or bottom edge
- Range: 0 to 500 (when using pixels) or 0 to 100 (when using percentage)
- Default: 100
- Controls how far from the edge the banner appears

**Unit** - Unit of measurement for the offset
- Options:
  - **px** - Pixels (fixed positioning)
  - **%** - Percentage (responsive positioning)
- Default: px
- Use percentage for responsive positioning (e.g., 50% = middle of screen)
- Use pixels for fixed positioning (e.g., 100px from top)

## Icon Settings

### Icon Appearance

**Icon Size** - Size of the icons in the banner
- Range: 16px to 64px
- Step: 1px
- Default: 24px
- Controls the size of all icons in the banner

**Spacing Between Icons** - Gap between icon entries
- Range: 0px to 30px
- Step: 1px
- Default: 10px
- Controls the vertical spacing between icons

**Border Radius** - Roundness of icon container corners
- Range: 0px to 50px
- Step: 1px
- Default: 0px
- Creates rounded corners on icon containers
- Set to 50% for circular icons

### Hover Animation

**Hover Animation** - Animation effect when hovering over icons
- Options:
  - **Up** - Moves upward on hover (default)
  - **Down** - Moves downward on hover
  - **Left** - Moves left on hover
  - **Right** - Moves right on hover
  - **Pulse** - Pulsing scale animation
  - **Scale Up** - Grows larger on hover
  - **Scale Down** - Shrinks smaller on hover
  - **Rotate** - Rotates and scales on hover
  - **Shake** - Horizontal shake animation
  - **Bounce** - Bouncing animation
  - **Glow** - Glowing effect with brightness
  - **None** - No animation
- Default: Up

**Animation Duration** - Speed of hover animations
- Range: 0.1s to 2.0s
- Step: 0.1s
- Default: 0.3s
- Controls how quickly animations complete
- Lower values = faster animations
- Higher values = slower animations
- Help text: "Duration in seconds"

**Animation Easing** - Easing function for animations
- Options:
  - **Ease** - Default easing (default)
  - **Ease In** - Slow start, fast end
  - **Ease Out** - Fast start, slow end
  - **Ease In Out** - Slow start and end, fast middle
  - **Linear** - Constant speed
  - **Cubic Bezier (Smooth)** - Smooth, professional easing
  - **Cubic Bezier (Bounce)** - Playful, bouncy easing
- Default: Ease
- Controls the acceleration/deceleration of animations

## Icon Entries

The Social Banner Block allows you to add multiple icon entries. Each entry consists of an icon, colors, and optional link settings.

### Adding Icon Entries

**Add Icon Entry** - Button to add new icon entries to the banner
- Click to add a new icon entry
- Each entry is displayed in a collapsible panel
- Panels are collapsed by default for easier management

### Per Icon Entry Settings

**Bootstrap Icon** - Icon selection for each entry
- Click "Choose Icon" button to open icon picker modal
- Access to 1,998+ Bootstrap Icons
- Search functionality to find icons quickly
- Pagination for browsing through icons
- Selected icon displays in the panel title
- Default: No icon selected

**Icon Color** - Text color for the icon
- Default: #ffffff (white)
- Full color picker support
- Controls the color of the icon itself

**Background Color** - Background color for the icon container
- Default: #000000 (black)
- Full color picker support
- Controls the background color behind the icon

**Link URL** - URL destination for the icon
- Optional field
- Supports relative paths, absolute URLs, and anchor links
- Leave empty if icon should not be clickable
- Default: Empty (no link)

**Link Target** - How the link opens
- Options:
  - **Same Window** - Link opens in the same tab (default: _self)
  - **New Window** - Link opens in a new tab (default: _blank)
- Default: New Window
- When set to new window, automatically includes `rel="noopener noreferrer"` for security

### Icon Entry Management

**Collapsible Panels** - Each icon entry is in its own collapsible panel
- Panels are collapsed by default (`initialOpen={false}`)
- Click panel header to expand/collapse
- Panel title shows entry number and icon name (if icon is selected)
- Makes it easier to manage multiple entries

**Remove Entry** - Remove individual icon entries
- "Remove" button in each panel
- Destructive action (red link button)
- Removes the specific icon entry from the banner

## Responsive Behavior

### Desktop (> 768px)
- Banner displays on the selected side (left or right)
- Icons stack vertically
- All hover animations work as expected
- Fixed positioning keeps banner visible while scrolling

### Tablet (768px - 1024px)
- Banner maintains position and functionality
- Icons remain properly sized
- Touch-friendly interactions
- Hover effects work on touch devices

### Mobile (< 768px)
- Banner displays correctly on mobile devices
- Icons are touch-friendly and properly sized
- Hover effects work on touch interactions
- Maintains sticky positioning

## Animation Features

### Hover Animations

**Transform Animations** - Position-based animations
- **Up** - Translates upward by 5px with shadow
- **Down** - Translates downward by 5px with shadow
- **Left** - Translates left by 5px with shadow
- **Right** - Translates right by 5px with shadow
- **Scale Up** - Scales to 115% with enhanced shadow
- **Scale Down** - Scales to 90% with shadow
- **Rotate** - Rotates 15 degrees and scales to 110%

**Keyframe Animations** - Complex animation sequences
- **Pulse** - Scales from 100% to 110% and back
- **Shake** - Horizontal shaking motion (left-right)
- **Bounce** - Vertical bouncing motion (up-down)

**Visual Effects** - Non-transform animations
- **Glow** - Glowing shadow effect with brightness filter
- **None** - No animation, only color transitions

### Animation Customization

**Duration Control** - Adjustable animation speed
- All animations respect the custom duration setting
- Keyframe animations (pulse, shake, bounce) use the duration variable
- Transform animations use CSS transitions with custom duration

**Easing Functions** - Customizable animation curves
- Standard easing options (ease, ease-in, ease-out, ease-in-out, linear)
- Advanced cubic-bezier functions for unique effects
- All animations respect the easing setting

## Technical Features

### CSS Custom Properties

All settings are applied via CSS custom properties (variables) for efficient styling:
- `--banner-position` - Left or right positioning
- `--banner-offset-from` - Top or bottom offset direction
- `--banner-offset` - Offset value with unit (px or %)
- `--icon-size` - Size of icons in pixels
- `--icon-spacing` - Gap between icons in pixels
- `--icon-border-radius` - Border radius value in pixels
- `--animation-duration` - Animation duration in seconds
- `--animation-easing` - Animation easing function
- `--icon-color` - Individual icon color (per entry)

### Block Classes

- `.adaire-social-banner` - Main container class
- `.adaire-social-banner--hover-{animation}` - Animation modifier class
  - Examples: `--hover-up`, `--hover-pulse`, `--hover-glow`
- `.adaire-social-banner__list` - Icon list container
- `.adaire-social-banner__item` - Individual icon item wrapper
- `.adaire-social-banner__icon` - Icon element (Bootstrap Icon)

### Positioning System

**Fixed Positioning** - Banner uses `position: fixed`
- Stays visible while scrolling
- Positioned relative to viewport, not document flow
- Z-index: 9999 to ensure visibility above content

**Offset System** - Flexible positioning
- Top/Bottom offset selection
- Pixel or percentage units
- Percentage units provide responsive positioning
- Pixel units provide fixed positioning

### Icon Entry Structure

Each icon entry is stored as an object with the following properties:
- `id` - Unique identifier (timestamp-based)
- `icon` - Bootstrap Icon class (e.g., "bi bi-facebook")
- `iconColor` - Hex color code for icon
- `backgroundColor` - Hex color code for background
- `linkUrl` - URL string (optional)
- `linkTarget` - "_self" or "_blank"

## Usage Tips

1. **Start with Position** - Configure banner position and offset first
2. **Add Icon Entries** - Add your social media icons one by one
3. **Choose Icons** - Use the icon picker to find the perfect icons
4. **Customize Colors** - Match icon and background colors to your brand
5. **Add Links** - Add URLs to make icons clickable
6. **Set Animation** - Choose hover animation that fits your site's style
7. **Fine-tune Timing** - Adjust animation duration and easing for desired effect
8. **Test Responsiveness** - Preview on different screen sizes
9. **Use Collapsible Panels** - Collapse entries you're not editing to keep interface clean

## Best Practices

- **Icon Selection** - Choose icons that are easily recognizable and match your brand
- **Color Contrast** - Ensure icon colors contrast well with background colors for visibility
- **Link Testing** - Always test links to ensure they work correctly
- **Animation Performance** - Use shorter durations (0.2-0.4s) for better performance
- **Mobile Consideration** - Test on mobile devices to ensure icons are easily tappable
- **Positioning** - Use percentage offsets for responsive designs that work across screen sizes
- **Accessibility** - Ensure link URLs are descriptive and icons have proper labels
- **Icon Count** - Don't add too many icons (5-8 is optimal) to avoid clutter
- **Animation Consistency** - Use the same animation type for all icons for cohesive design
- **Offset Values** - Use 50% offset for centered positioning, or 100px for fixed spacing

## Accessibility

- **Keyboard Navigation** - Icon links are fully keyboard accessible
- **Focus Indicators** - Clear focus outline for keyboard users
- **ARIA Labels** - Icons include aria-label attributes when linked
- **Screen Reader Support** - Link text is properly announced
- **Link Semantics** - Uses proper anchor elements for navigation
- **Color Contrast** - Ensure sufficient contrast between icon and background colors

## Browser Compatibility

- **Modern Browsers** - Fully supported in Chrome, Firefox, Safari, and Edge
- **Mobile Browsers** - Optimized for iOS Safari and Chrome Mobile
- **Animation Support** - Uses CSS transitions and keyframe animations
- **Fixed Positioning** - Works in all modern browsers
- **CSS Variables** - Uses CSS custom properties (supported in all modern browsers)
- **Fallback Support** - Graceful degradation for older browsers

All of these settings can be configured through the WordPress block editor interface, with most having real-time preview capabilities in the editor.

## Screenshots

### Desktop View
- Sticky banner on the side of the screen
- Vertical stack of social media icons
- Hover animations in action
- Professional appearance with customizable colors

### Tablet View
- Banner maintains position and functionality
- Touch-friendly icon interactions
- Responsive spacing and sizing
- Optimized for tablet screens

### Mobile View
- Banner displays correctly on mobile
- Touch-optimized icon sizes
- Easy-to-tap icon buttons
- Maintains sticky positioning