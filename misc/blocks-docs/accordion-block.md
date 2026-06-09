# Accordion Block Documentation

## Overview

In this article, we look at the Accordion Block, a powerful block that creates collapsible content sections with smooth animations and extensive customization options. This block features configurable accordion items with customizable colors, typography, spacing, and animation settings. The accordion is fully responsive and works seamlessly across all device sizes. This block doesn't require you to mess around with complex Gutenberg patterns, saving you time and making the website development process smoother. Just click, add items, and you're ready to go.

## Adding the Accordion Block to your page

### Locate and add the Accordion Block

1. Type "/" and then type in "accordion"
2. Select the Accordion Block
3. The block will appear with one default accordion item

## Content Settings

### Accordion Items

The Accordion Block allows you to add multiple collapsible items. Each item consists of a title and content.

**Per Accordion Item Settings:**

- **Title** - The clickable header text for each accordion item
  - Editable through RichText in the editor
  - Supports formatting: bold, italic, strikethrough
  - Default: "Accordion Item 1"

- **Content** - The collapsible content that appears when the item is opened
  - Editable through RichText in the editor
  - Supports formatting: bold, italic, strikethrough, links
  - Default: "Lorem ipsum dolor sit amet."

- **Open State** - Whether the item is open by default
  - Default: First item is open, others are closed

**Item Management:**
- **Add Item** - Add new accordion items to the block
- **Remove Item** - Remove individual accordion items
- **Toggle Item** - Click the header to open/close items in the editor

## Container Settings

### Container Mode

**Full Width** - Accordion spans the full width of the container
- Default mode
- No width constraints

**Constrained** - Accordion has a maximum width constraint
- Allows you to set responsive max-width controls
- Desktop, tablet, and mobile max-width settings

### Container Max Width (when constrained)

**Desktop Max Width** - Maximum width for desktop screens
- Range: Configurable
- Units: px, %, rem, vw
- Default: 1200px

**Tablet Max Width** - Maximum width for tablet screens
- Range: Configurable
- Units: px, %, rem, vw
- Default: 100%

**Mobile Max Width** - Maximum width for mobile screens
- Range: Configurable
- Units: px, %, rem, vw
- Default: 100%

## Items Settings

### Layout Controls

**Gap** - Space between accordion items
- Range: 0px to 48px
- Default: 12px

**Padding** - Internal padding within each accordion item
- Range: 0px to 48px
- Default: 20px

**Radius** - Border radius for accordion items
- Range: 0px to 48px
- Default: 12px
- Controls the rounded corners of accordion items

### Behavior Settings

**Allow Multiple Open** - Toggle whether multiple items can be open simultaneously
- Default: Disabled (false)
- When enabled: Multiple accordion items can be open at the same time
- When disabled: Opening one item automatically closes others

## Typography Settings

### Font Sizes

**Title Size** - Font size for accordion item titles
- Range: 10px to 60px
- Default: 20px

**Content Size** - Font size for accordion item content
- Range: 10px to 48px
- Default: 16px

### Font Weights

**Title Weight** - Font weight for accordion item titles
- Options: 300 (Light), 400 (Normal), 500 (Medium), 600 (Semi-bold), 700 (Bold), 800 (Extra-bold)
- Default: 600 (Semi-bold)

**Content Weight** - Font weight for accordion item content
- Options: 300 (Light), 400 (Normal), 500 (Medium), 600 (Semi-bold), 700 (Bold), 800 (Extra-bold)
- Default: 400 (Normal)

## Color Settings

### Text Colors

**Title Color** - Text color for accordion item titles
- Default: #1a1a1a (dark gray)

**Content Color** - Text color for accordion item content
- Default: #4a5568 (medium gray)

### Background Colors

**Background Color** - Background color for accordion items
- Default: #ffffff (white)

**Content Background Color** - Background color for the content panel
- Default: #f8fafc (light gray)
- Provides visual separation between header and content

### Icon Colors

**Chevron Color** - Color of the expand/collapse chevron icon
- Default: #4a5568 (medium gray)

### Divider Settings

**Divider Line Color** - Color of the divider line between items
- Default: #e2e8f0 (light gray)

**Divider Line Thickness** - Thickness of the divider line
- Range: 0px to 10px
- Step: 1px
- Default: 1px
- Set to 0 to hide dividers

## Spacing & Margins

### Vertical Margins

**Margin Top** - Top margin for the accordion block
- Range: 0px to 100px
- Default: 0px

**Margin Bottom** - Bottom margin for the accordion block
- Range: 0px to 100px
- Default: 0px

### Horizontal Margins (Responsive)

**Horizontal Margin (Desktop)** - Left and right margins for desktop
- Range: 0px to 100px
- Default: 0px

**Horizontal Margin (Tablet)** - Left and right margins for tablet
- Range: 0px to 100px
- Default: 0px

**Horizontal Margin (Mobile)** - Left and right margins for mobile
- Range: 0px to 100px
- Default: 0px

## Effects Settings

### Shadow

**Shadow Intensity** - Intensity of the box shadow effect
- Range: 0.0 to 0.5
- Step: 0.01
- Default: 0.08
- Higher values create more pronounced shadows
- Set to 0 to disable shadows

## Animation Settings

### Animation Control

**Duration (ms)** - Duration of the open/close animation
- Range: 100ms to 1500ms
- Step: 50ms
- Default: 300ms
- Controls how quickly accordion items expand and collapse

**Easing** - Animation easing function
- Options:
  - **ease** - Default easing (default)
  - **linear** - Constant speed
  - **ease-in** - Slow start, fast end
  - **ease-out** - Fast start, slow end
  - **ease-in-out** - Slow start and end, fast middle
- Default: ease

## Responsive Behavior

### Desktop (> 1024px)
- Full typography sizes as configured
- Standard spacing and margins
- Max-width constraints apply when container mode is constrained

### Tablet (768px - 1024px)
- Responsive max-width settings apply
- Horizontal margins adjust for tablet
- Maintains readability and spacing

### Mobile (< 768px)
- Responsive max-width settings apply
- Horizontal margins adjust for mobile
- Optimized spacing for touch interactions
- Touch-friendly accordion headers

## Animation Features

### Smooth Transitions
- **Height Animation** - Smooth height transitions when opening/closing items
- **Icon Rotation** - Chevron icon rotates when items open/close
- **CSS Transitions** - Hardware-accelerated CSS transitions for smooth performance
- **Customizable Timing** - Adjustable duration and easing functions

### Interactive Behavior
- **Click to Toggle** - Click headers to open/close items
- **Single or Multiple Open** - Configure whether multiple items can be open
- **Smooth Collapse** - Items smoothly collapse when closed
- **Visual Feedback** - Clear visual indication of open/closed state

## Technical Features

### CSS Custom Properties
All settings are applied via CSS custom properties (variables) for efficient styling:
- `--acc-title-color` - Title text color
- `--acc-content-color` - Content text color
- `--acc-bg` - Background color
- `--acc-chevron` - Chevron icon color
- `--acc-title-size` - Title font size
- `--acc-content-size` - Content font size
- `--acc-gap` - Gap between items
- `--acc-radius` - Border radius
- `--acc-padding` - Internal padding
- `--acc-duration` - Animation duration
- `--acc-easing` - Animation easing
- `--acc-title-weight` - Title font weight
- `--acc-content-weight` - Content font weight
- `--acc-shadow-intensity` - Shadow intensity
- `--acc-content-bg` - Content background color
- `--acc-divider-color` - Divider line color
- `--acc-divider-thickness` - Divider thickness
- `--acc-container-max-width` - Container max width (desktop)
- `--acc-container-max-width-tablet` - Container max width (tablet)
- `--acc-container-max-width-mobile` - Container max width (mobile)

### JavaScript Functionality
- **Automatic Height Calculation** - Dynamically calculates content height for smooth animations
- **Multiple Open Support** - Handles single or multiple open items based on settings
- **Event Handling** - Efficient click event handling for accordion headers
- **State Management** - Proper state tracking for open/closed items

## Usage Tips

1. **Start with Content** - Add your accordion items with titles and content first
2. **Configure Behavior** - Decide if multiple items should be open simultaneously
3. **Customize Colors** - Adjust colors to match your brand
4. **Set Typography** - Configure font sizes and weights for optimal readability
5. **Adjust Spacing** - Fine-tune gap, padding, and margins for your layout
6. **Test Animations** - Adjust animation duration and easing to match your site's style
7. **Responsive Testing** - Preview on different screen sizes to ensure optimal display

## Best Practices

- **Content Organization** - Use accordions to organize related content that doesn't need to be visible all at once
- **Clear Titles** - Make accordion titles descriptive and clear
- **Consistent Styling** - Keep color and typography consistent across all items
- **Animation Speed** - Moderate animation speeds (200-400ms) provide the best user experience
- **Multiple Open** - Use "Allow Multiple Open" for FAQ sections where users might want to compare answers
- **Single Open** - Use single-open mode for focused content exploration
- **Responsive Margins** - Adjust horizontal margins for different screen sizes to prevent edge-to-edge issues

## Accessibility

- **Keyboard Navigation** - Accordion headers are fully keyboard accessible
- **ARIA Attributes** - Proper ARIA labels and states for screen readers
- **Focus Management** - Clear focus indicators for keyboard users
- **Semantic HTML** - Uses proper button elements for accordion headers
- **Screen Reader Support** - Content is properly announced when items open/close

## Browser Compatibility

- **Modern Browsers** - Fully supported in Chrome, Firefox, Safari, and Edge
- **Mobile Browsers** - Optimized for iOS Safari and Chrome Mobile
- **Animation Support** - Uses CSS transitions with JavaScript enhancement
- **Fallback Support** - Graceful degradation for older browsers

All of these settings can be configured through the WordPress block editor interface, with most having real-time preview capabilities in the editor.

## Screenshots

### Desktop View
- Clean accordion layout with customizable spacing
- Smooth animations when opening/closing items
- Professional appearance with shadows and rounded corners

### Tablet View
- Responsive layout with adjusted max-width
- Optimized spacing for tablet screens
- Touch-friendly interactions

### Mobile View
- Single-column layout optimized for mobile
- Compact spacing and typography
- Easy-to-tap accordion headers

