# Icon Box Block Documentation

## Overview

In this article, we look at the Icon Box Block, a flexible component for highlighting services, features, or stats with an icon-centric design. It ships with an integrated UXWing icon picker, styling controls for hover states, and link options so you can turn any icon into a navigational element or quick call-to-action.

## Adding the Icon Box Block to your page

### Locate and add the Icon Box Block

1. Type "/" and then type in "icon box"
2. Select the Icon Box Block
3. The block appears with a placeholder icon and default styling ready to customize

## Icon Settings

### Icon Selection

**Icon Picker** - Choose from 3,000+ UXWing icons via the modal picker  
- Search by keyword or browse categories  
- Selected icon name and SVG markup are stored in the block attributes  
- Default: No icon selected (placeholder displayed)

**Icon Size** - Controls the rendered icon size in pixels  
- Range: 16px to 120px  
- Default: 48px  
- Adjust to match the hierarchy of surrounding content

### Colors & Hover States

**Icon Color** - Primary color of the icon  
- Default: #333333  
- Apply brand colors to align with your design system

**Icon Hover Color** - Color applied on hover/focus  
- Default: #000000  
- Choose contrasting tones to create interactive feedback

**Background Color** - Background behind the icon  
- Default: Transparent  
- Useful for pill or badge-style icon boxes

**Background Hover Color** - Hover/focus background color  
- Default: Transparent  
- Combine with border radius to create circular hover states

## Layout & Spacing

### Alignment

**Block Alignment** - Align the icon left, center, or right  
- Options: Left, Center, Right  
- Default: Center  
- Affects both the icon and any additional content in the box

### Padding & Borders

**Internal Padding** - Padding around the icon container  
- Default: 20px on all sides  
- Adjustable via unit controls (px, %, rem) for precise spacing

**Border Radius** - Rounds the icon container corners  
- Range: 0px to 100px  
- Default: 0px  
- Set to 100px for circular badges

**Border Width & Color** - Outline options around the container  
- Width Range: 0px to 10px  
- Default Width: 0px (no border)  
- Border Color Default: #333333  
- Combine with hover background for elevated card effects

## Link Settings

**Link URL** - Optional link wrapped around the entire icon box  
- Supports internal links, external URLs, and anchor links  
- Default: Empty (no link)

**Link Target** - Control how the link opens  
- Options: Same Window (`_self`), New Window (`_blank`)  
- Default: `_self`  
- When set to `_blank`, the block adds `rel="noopener noreferrer"` automatically

## Spacing Controls

**Margins** - Outer spacing per device (desktop/tablet/mobile)  
- Default: 0px on all sides  
- Use to separate icon boxes in grids or sections

**Additional Padding Controls** - Advanced per-device padding (top/right/bottom/left)  
- Default: 0px  
- Useful when the box sits inside a column or group with its own padding

## Responsive Behavior

### Desktop (> 1024px)
- Default 48px icon size maintains strong visual presence  
- Align multiple icon boxes in columns or grids  
- Hover states provide interactive feedback with color transitions

### Tablet (768px - 1024px)
- Icons and padding adapt to available width  
- Consider reducing icon size (32–40px) to balance layout  
- Ensure margin controls provide enough breathing room

### Mobile (< 768px)
- Icons stack vertically with center alignment by default  
- Large touch targets make links accessible for thumb interactions  
- Lower icon sizes (28–32px) help maintain clear hierarchy in narrow layouts

## Technical Features

### CSS Custom Properties

- `--icon-box-size`, `--icon-box-color`, `--icon-box-hover-color`  
- `--icon-box-background`, `--icon-box-background-hover`  
- `--icon-box-border-radius`, `--icon-box-border-width`, `--icon-box-border-color`  
- Margin and padding variables per breakpoint for theme overrides

### Accessibility Notes

- Icons are rendered as inline SVG for crisp scaling  
- If linking the icon, ensure surrounding text or `aria-label` communicates purpose  
- Hover colors also apply on focus to support keyboard users

## Usage Tips

1. **Use Consistent Sizes** - Match icon sizes across a section for visual rhythm.
2. **Add Supporting Text** - Pair with a Heading and Paragraph block in a Group for richer feature cards.
3. **Create Hover Cards** - Combine background hover color, border radius, and box shadow (via custom CSS) for interactive cards.
4. **Link Strategically** - Use the link option for feature callouts, service navigation, or quick contact actions.
5. **Duplicate Blocks** - Configure one icon box, then duplicate to maintain consistent styling across the layout.

## Best Practices

- **Contrast Matters** - Ensure icon colors contrast with backgrounds for readability.
- **Thoughtful Hover States** - Use subtle color shifts to signal interactivity without overwhelming users.
- **Brand Alignment** - Stick to your brand palette for icon and background colors.
- **Spacing Balance** - Adjust margins so icon boxes breathe when stacked vertically on mobile.
- **Fallback Content** - Provide text near icons to describe their meaning for all users.

## Accessibility

- **Descriptive Links** - When linking the icon, include accessible text (e.g., add a screen reader-only span) describing the destination.
- **Keyboard Navigation** - Link wrappers receive keyboard focus and hover styles double as focus styles.
- **Color Contrast** - Verify hover/background combinations meet WCAG requirements.
- **Semantic Structure** - Wrap the icon box in a Group with headings to give context in screen readers.

## Browser Compatibility

- **Modern Browsers** - Fully supported in Chrome, Firefox, Safari, Edge.
- **Mobile Browsers** - SVG rendering and hover/focus states behave on iOS and Android.
- **Fallback** - If SVG fails to load, provide alternative text nearby for clarity.

## Screenshots

### Desktop View
- Icon centered within a padded container
- Hover transition changing icon and background colors
- Optional border radius creating rounded badge effect

### Tablet View
- Multiple icon boxes arranged in a responsive grid
- Reduced icon size with balanced spacing
- Clear alignment adjustments for mid-sized screens

### Mobile View
- Stacked icon boxes with centered alignment
- Touch-friendly spacing and contrast
- Tap reveals color-change feedback for linked icons



