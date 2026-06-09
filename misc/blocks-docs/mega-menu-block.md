# Mega Menu Block Documentation

## Overview

In this article, we look at the Mega Menu Block, an advanced navigation system that supports multi-level menus, media-rich canvas panels, sticky behavior, and extensive styling controls. The block works well for large sites that need to organize content into columns, feature callouts, or promotional areas within the menu.

## Adding the Mega Menu Block to your page

### Locate and add the Mega Menu Block

1. Type "/" and then type in "mega menu"
2. Select the Mega Menu Block
3. The block appears with a default menu structure, placeholder logo, and example submenus

## Identity & Branding

### Logo Controls

**Logo Image** - Upload a custom logo for the navigation bar  
- Fields: URL and alt text  
- Default: Empty URL with alt text “Logo”  
- Pair with `logoSize` to adjust the rendered height (default 40px)
- **Logo Link URL** - Control where the brand logo points; defaults to `/` (site home) but can be updated to any internal or external URL

**Menu Images** - Optional branding images for top and sticky states  
- `menuImageAtTop` / `menuImageOnScroll` allow swapping graphics when scrolling  
- `menuImageSize` defines the rendered size (default 40px)

### Colors & Backgrounds

- **Background Color** - Base background of the menu bar (default #ffffff)  
- **Scroll Background Color** - Background after sticky scroll (default #ffffff)  
- **Text Color** - Primary text color for top-level items (default #000000)  
- **Hover / Active Colors** - Customize hover and active states to match brand accents  
- **Mobile Menu Backgrounds** - Separate colors for mobile panel and hover states

## Menu Structure

### Menu Items (Level 1)

**Menu Items Array** - Manage navigation links, URLs, bold styling, and canvas settings  
- Reorder items to match site hierarchy  
- Toggle **Open in New Tab** per item  
- Canvas options: image URL, alignment (left/right), width/height per device, optional canvas title
- **Banner Description** - Add custom supporting copy for every top-level item; the text feeds the canvas banner that appears above the dropdown content

**Typography & Underlines**  
- Font size (default 16px), weight (default 400), color, bold weight (default 700)  
- Hover underline controls: enable/disable, thickness, color, border radius

**Sticky Behavior**  
- `isSticky` keeps the menu fixed to the top on scroll (default: true)  
 - `keepCanvasOpenOnClick` (Persistent Canvas Mode) keeps the dropdown canvas open after hover so visitors can move into the panel without holding their cursor on the trigger  
- `increaseOpacity` enhances canvas visibility on hover

### Subitems (Level 2 & 3)

- Each parent item can include Level 2 entries with their own font size (default 14px) and hover styling  
- Level 2 items support underline toggles, hover background colors, and nested Level 3 lists  
- Level 3 entries inherit fonts (default 12px) with hover color and background options  
- Canvas-specific typography controls (font size, weight, color) style callout headings inside dropdown panels

### Canvas Layout

- Attach images or content sections to menu items using the Mega Menu Canvas inner block  
- `canvasImagePosition` aligns imagery left/right of the dropdown content  
- `canvasImageBorderRadius` softens image corners (default 8px)  
- `menuCanvasBorderRadius` shapes the whole dropdown container (default 0)

## Layout & Spacing

### Container

**Container Mode** - Full width or constrained layout  
- Options: Full (default), Constrained  
- Constrained mode uses responsive max-width (desktop 1200px by default)

### Padding & Margin

- **Padding** - Inner spacing around the menu bar (default 20px on all sides)  
- **Margin** - Outer spacing (default 0)  
- Adjust to integrate with surrounding headers or sections

### Centering & Alignment

- **Center Menu** - Toggle to center the main navigation links (default: true)  
- Combine with align-wide/full options to stretch the menu to screen edges

## Mobile Menu

- Dedicated controls for font sizes, weights, and colors per level (Level 1 default 16px/weight 600)  
- Background and hover colors ensure contrast within the mobile drawer  
- Chevron size and color customize expand/collapse icons  
- Mobile layout inherits menu items while keeping canvas content accessible via toggles
- Mobile CTA button now has its own color, padding, border, and icon controls independent of the desktop header button
- Canvas banner spacing, background, padding, and typography can be tuned from the new Canvas Banner panel to stay in sync with the PHP render and editor preview

## Inner Blocks

- Supports inner blocks for constructing mega menu content within dropdown panels  
- Use Mega Menu Canvas blocks to insert columns, buttons, or promotional content  
- Combine with Group, Columns, Buttons, or Media blocks for rich layouts

## Responsive Behavior

### Desktop (> 1024px)
- Sticky behavior keeps navigation visible during scroll  
- Canvas content appears on hover/focus, supporting multi-column layouts  
- Hover underlines and color transitions signal interactive items clearly

### Tablet (768px - 1024px)
- Menu adapts to available width; consider enabling mobile drawer earlier for complex menus  
- Canvas images resize based on responsive width/height settings  
- Touch-friendly hover states ensure submenus remain accessible

### Mobile (< 768px)
- Collapsible drawer layout with customizable typography per level  
- Chevron icons indicate expandable sections  
- Canvas content can be stacked below parent items for mobile-friendly presentations

## Technical Features

### CSS Custom Properties

- Level-specific variables for font size, weight, colors, hover states  
- Canvas sizing variables for images and dropdown containers  
- Sticky states and background colors exposed for theme overrides

### JavaScript & Accessibility

- Frontend script handles sticky behavior, pointer interactions, and keyboard navigation  
- ARIA attributes ensure submenus and toggles announce expanded/collapsed states  
- Supports focus trapping within open mega menu panels for keyboard users

## Usage Tips

1. **Plan Information Architecture** - Group related links and limit top-level items to 5–7 for clarity.
2. **Use Canvas Strategically** - Add featured links, images, or promos in dropdown panels to drive engagement.
3. **Balance Hover Effects** - Ensure underline widths and colors complement the brand without overwhelming users.
4. **Optimize for Mobile** - Customize mobile font sizes and background colors to keep the drawer legible.
5. **Preview Sticky States** - Test how the menu looks at page top versus scrolled state, especially with swapped logos.

## Best Practices

- **Consistent Typography** - Maintain predictable font sizes per level for quick scanning.
- **High Contrast** - Ensure top-level and sub-level items remain readable on all backgrounds.
- **Limit Depth** - Use Level 3 sparingly to avoid overwhelming visitors with too many options.
- **Update Links Regularly** - Keep URLs and callouts current to avoid broken experiences.
- **Test Interaction** - Validate hover, click, and keyboard navigation across devices and browsers.

## Accessibility

- **Keyboard Navigation** - Arrow keys move between menu items; Enter/Space toggles dropdowns.
- **Focus Styles** - Ensure focus outlines are visible on links and buttons within the menu.
- **ARIA Support** - Role, aria-expanded, and aria-controls attributes are applied for assistive technologies.
- **Descriptive Text** - Provide meaningful link titles; avoid duplicates that only differ visually.
- **Motion Considerations** - Keep transitions subtle to support users sensitive to motion.

## Browser Compatibility

- **Modern Browsers** - Works in Chrome, Firefox, Safari, Edge with CSS grid/flex support.
- **Mobile Browsers** - Tested on iOS Safari and Android Chrome for touch interactions.
- **Fallback** - If JavaScript fails, menus degrade into stacked lists to maintain navigation access.

## Screenshots

### Desktop View
- Horizontal navigation with logo, centered menu items, and mega panels on hover
- Rich dropdown featuring columns of links and optional imagery
- Sticky behavior keeping the bar fixed after scrolling

### Tablet View
- Collapsible or hover-triggered submenus with adjusted spacing
- Canvas content resized for mid-width layouts
- Touch-friendly interactive elements

### Mobile View
- Drawer-style menu with stacked navigation levels
- Chevron toggles for expanding sections
- Optional canvas content and buttons displayed inline beneath parent links



