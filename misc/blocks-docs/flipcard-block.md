# Flip Card Block Documentation

## Overview

In this article, we look at the Flip Card Block, an interactive container that reveals additional content when hovered or tapped. The block pairs with the Flip Card Front and Flip Card Back inner blocks, allowing you to design two sides of a card with any Gutenberg blocks. Configure dimensions, animation direction, easing, and styling to build feature grids, team cards, or service highlights.

## Adding the Flip Card Block to your page

### Locate and add the Flip Card Block

1. Type "/" and then type in "flip card"
2. Select the Flip Card Block
3. The block appears with front and back placeholder panels ready for customization

## Flip Settings

### Dimensions

**Width** - Responsive card width per device  
- Desktop Default: 300px  
- Tablet Default: 100%  
- Mobile Default: 100%  
- Units: px, %, rem, vw  
- Controls the overall footprint of the card.

**Height** - Responsive card height per device  
- Desktop Default: 300px  
- Tablet Default: 300px  
- Mobile Default: 250px  
- Units: px  
- Adjust to accommodate content within the card faces.

### Animation

**Flip Direction** - Orientation of the flip animation  
- Options: Horizontal, Vertical  
- Default: Horizontal  
- Horizontal rotates around the Y-axis; vertical uses the X-axis.

**Flip Rotation** - Direction of the rotation  
- Options: Clockwise, Counter-Clockwise  
- Default: Clockwise  
- Useful for coordinating motion across multiple cards.

**Animation Duration** - Length of the flip animation in seconds  
- Range: 0.2s to 2s  
- Default: 0.6s  
- Shorter durations feel snappier; longer durations emphasize the reveal.

**Animation Easing** - Motion curve applied to the flip  
- Options: ease, ease-in, ease-out, ease-in-out, linear (via custom input)  
- Default: Ease-in-out  
- Choose smoother curves for polished interactions.

### Card Appearance

**Front Background Color** - Background for the front face  
- Default: #ffffff  
- Combine with padding for clean layouts.

**Back Background Color** - Background for the back face  
- Default: #f5f5f5  
- Adjust for contrast when revealing additional content.

**Front/Back Border Color** - Optional border for each face  
- Default: Transparent  
- Set both color and width to display.

**Front/Back Border Width** - Thickness of the border in pixels  
- Default: 0  
- Increase to frame content subtly.

**Border Radius** - Rounds the corners of both faces  
- Range: 0px to 50px  
- Default: 8px  
- Higher values create pill-shaped cards.

**Padding** - Inner spacing applied to both faces  
- Default: 20px  
- Increase when stacking text and buttons inside.

**Shadow Intensity** - Drop-shadow strength  
- Range: 0 to 0.5  
- Default: 0.1  
- Adds depth; set to 0 for flat designs.

## Inner Blocks

- The Flip Card Block enforces two dedicated slots: `flipcard-front-block` and `flipcard-back-block`.
- Each side accepts any core or custom blocks (images, headings, buttons, icons).
- Hover (desktop) or tap (mobile) triggers the flip; ensure backface content is concise for readability.

## Responsive Behavior

### Desktop (> 1024px)
- Fixed width/height drive consistent grid layouts.
- Hover triggers the flip animation instantly.
- Box shadows emphasize depth on large screens.

### Tablet (768px - 1024px)
- Width defaults to 100% for single-column layouts inside responsive containers.
- Height remains controlled to avoid overly tall cards.
- Touch events toggle the back face with a tap.

### Mobile (< 768px)
- Cards expand to full width for readability.
- Reduced default height (250px) ensures content stays visible above the fold.
- Tap triggers the flip; consider adding prompts or icons for clarity.

## Technical Features

### CSS Custom Properties

- `--flipcard-width-*` and `--flipcard-height-*` per breakpoint
- `--flipcard-duration`, `--flipcard-easing`
- `--flipcard-front-bg`, `--flipcard-back-bg`
- `--flipcard-border-radius`, `--flipcard-padding`, `--flipcard-shadow`
- These variables enable theme-level overrides or custom animations.

### Structure & Scripts

- Generates a unique block ID (`blockId`) for targeting.
- Uses CSS 3D transforms for smooth hardware-accelerated flips.
- Supports nested inner blocks rendered via `InnerBlocks`.
- No frontend JavaScript required beyond initial setup—animations run on pure CSS.

## Usage Tips

1. **Keep Back Content Concise** - Limit text to short paragraphs or bullet points for quick scanning.
2. **Use Icons on Front** - Combine a large icon and heading on the front with details on the back.
3. **Match Heights** - Ensure each card in a grid uses the same height for consistent layouts.
4. **Highlight CTAs** - Place buttons or links on the back face to encourage interaction.
5. **Adjust Padding** - Increase padding when placing media or complex layouts inside the card.

## Best Practices

- **Consistent Motion** - Use the same flip axis and direction when presenting multiple cards together.
- **Contrast Faces** - Differentiate front/back colors to signal the flip visually.
- **Accessible Content** - Repeat critical information outside the flip card if necessary for users who do not engage with hover effects.
- **Fallbacks** - Provide descriptive headings and summary text on the front for users who cannot view the back.
- **Test Touch Devices** - Confirm tap targets work reliably on tablets and phones.

## Accessibility

- **Keyboard Support** - Wrap cards with additional buttons or links for keyboard users to access back-face content.
- **Semantic Content** - Inner blocks remain semantic; use headings and lists appropriately.
- **Focus Indicators** - Add focus styles via custom CSS if front/back content includes interactive elements.
- **Informative Copy** - Ensure the front face communicates the purpose even if the flip is not triggered.

## Browser Compatibility

- **Modern Browsers** - Works in Chrome, Firefox, Safari, and Edge with 3D transform support.
- **Mobile Browsers** - iOS and Android fully support touch-triggered flips.
- **Graceful Degradation** - If transforms are unavailable, the front face remains visible with no animation.

## Screenshots

### Desktop View
- Grid of cards with hover-triggered flips
- Front face showing icon and headline, back face with details
- Subtle box shadow and rounded corners

### Tablet View
- Single-column stacked cards with tap flipping
- Responsive height maintaining aspect ratio
- Clear typography with balanced padding

### Mobile View
- Full-width cards occupying the viewport width
- Touch-friendly interaction with large tap areas
- Front face conveys summary; back face reveals supporting text



