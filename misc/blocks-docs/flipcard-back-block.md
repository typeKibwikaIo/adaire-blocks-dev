# Flip Card Back Block Documentation

## Overview

In this article, we look at the Flip Card Back Block, the secondary face that appears when a Flip Card is flipped. It is designed for supporting details, longer descriptions, and calls to action that expand on the information shown on the front face. The block is restricted to the Flip Card parent and inherits styling and layout controls from the parent block.

## Adding the Flip Card Back Block to your page

### Locate and add the Flip Card Back Block

1. Insert a Flip Card Block (`/flip card`)
2. The Flip Card Back Block is automatically included as the second inner block
3. Select the back panel in the list view or flip the card in the editor to edit its content

## Content Settings

### Inner Blocks

- Supports all standard Gutenberg blocks (paragraphs, headings, buttons, lists, images).
- Use layout blocks (Group, Stack, Columns) to create structured back-face content.
- Ideal for extended descriptions, feature lists, social links, or contact info.

### Styling Inheritance

- Background color, padding, border radius, and shadow are controlled via the parent Flip Card Block.
- Add additional styling by wrapping content in Group blocks with custom classes.
- Use contrastive colors and typography to differentiate the back face from the front.

## Interaction Behavior

- Displays when the card rotates 180° in response to hover (desktop) or tap (mobile).
- Remains hidden until triggered, but content stays in the DOM for accessibility tools.
- Consider adding close buttons or prompts when including interactive elements.

## Responsive Behavior

### Desktop (> 1024px)
- Back face occupies the same dimensions as the front for seamless flipping.
- Plenty of space for bullet lists, icons, and call-to-action buttons.
- Hover interaction reveals the back instantly.

### Tablet (768px - 1024px)
- Touch interactions toggle the back panel; ensure buttons and links are spaced appropriately.
- Responsive typography and padding inherited from the parent keep content legible.
- Consider simplifying content for mid-sized screens.

### Mobile (< 768px)
- Full-width layout with vertical stacking for readability.
- Tap to reveal; ensure essential information is near the top to avoid excessive scrolling inside the card.
- Preview on devices to confirm that content fits within the default 250px height or adjust parent settings.

## Technical Features

### Structural Notes

- Declared as a child of `create-block/flipcard-block`; cannot be inserted independently.
- Contains no standalone attributes, relying entirely on parent configuration.
- Renders with a back-face class (e.g., `.adaire-flipcard__back`) for targeted CSS overrides.
- Works seamlessly with the front block to create cohesive flip card experiences.

## Usage Tips

1. **Provide Details** - Use the back face for specifications, feature lists, or summary bullets.
2. **Add CTAs** - Place buttons or links on the back to encourage next steps after users engage.
3. **Highlight Differences** - Vary background color or typography slightly to indicate the flip state.
4. **Keep It Scannable** - Use bullet points or short paragraphs to avoid overwhelming users.
5. **Include Contact Info** - Great spot for email addresses, phone numbers, or social links on team cards.

## Best Practices

- **Information Hierarchy** - Front face grabs attention; back face delivers detail or conversion elements.
- **Consistent Styling** - Align fonts and colors with the front face to maintain cohesion.
- **Limit Length** - Keep content within the visible area to avoid requiring scroll within the card.
- **Accessibility** - Repeat essential information elsewhere for users who cannot trigger the flip.
- **Test Motion** - Ensure the flip animation remains smooth even when the back face contains images or embeds.

## Accessibility

- **Semantic Markup** - Place interactive elements (buttons, links) inside meaningful containers.
- **Keyboard Access** - Ensure interactive elements on the back face are reachable via keyboard navigation.
- **Motion Alternatives** - Provide crucial details in nearby static content for users who avoid motion effects.
- **Clear Language** - Use descriptive headings and labels so users understand the revealed information quickly.

## Browser Compatibility

- **Modern Browsers** - Chrome, Firefox, Safari, and Edge support the 3D rotation used by the block.
- **Mobile Browsers** - Works on iOS Safari and Android Chrome with touch interactions.
- **Fallback** - If transforms are unavailable, the front face remains visible and the back content is accessible via alternative content placements.

## Screenshots

### Desktop View
- Back panel showing detailed description, bullet list, and button
- Distinct background color differentiating it from the front face
- Smooth 180° rotation animation

### Tablet View
- Responsive layout ensuring touch targets are finger-friendly
- Balanced spacing and legible text within the card height
- Subtle shadow reinforcing depth

### Mobile View
- Full-width card with stacked content
- Prominent call-to-action button and concise copy
- Gesture-friendly layout that works with tap-to-flip behavior



