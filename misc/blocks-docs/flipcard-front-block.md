# Flip Card Front Block Documentation

## Overview

In this article, we look at the Flip Card Front Block, the dedicated front-face container for the Flip Card Block. It provides a structured area to place headlines, icons, imagery, and supporting text that users see before the card flips. The block is automatically inserted inside a Flip Card and cannot exist independently.

## Adding the Flip Card Front Block to your page

### Locate and add the Flip Card Front Block

1. Insert a Flip Card Block (`/flip card`)
2. The Flip Card Front Block is added automatically as the first inner block
3. Select the front face in the canvas to edit its inner content

## Content Settings

### Inner Blocks

- Supports any Gutenberg blocks: headings, paragraphs, buttons, image blocks, icons, etc.
- Use the block inserter within the front face to add or rearrange content.
- Keep layouts concise so the front face communicates value quickly.

### Styling Inheritance

- Front-face colors, padding, and border radius are controlled by the parent Flip Card Block settings.
- Additional styles can be applied using group blocks or custom classes within the front face.
- Leverage core blocks (Group, Stack, Columns) to build structured layouts.

## Interaction Behavior

- On hover (desktop) or tap (mobile), the card flips to reveal the back face.
- The front face remains the primary visible surface until interaction occurs.
- Content remains accessible in the DOM even when the back face is shown.

## Responsive Behavior

### Desktop (> 1024px)
- Displays full parent-defined width and height.
- Hover triggers the flip while keeping front content crisp and centered.
- Ideal for icon-and-text combos or product imagery.

### Tablet (768px - 1024px)
- Inherits responsive dimensions from the parent card.
- Tap once to flip; tap outside or again to return to the front.
- Maintain readable font sizes and balanced padding inside group blocks.

### Mobile (< 768px)
- Occupies full card width for clear presentation.
- Touch-friendly: single tap flips to the back face.
- Use vertical stacks and centered text for small-screen clarity.

## Technical Features

### Structural Notes

- Declared as a child of `create-block/flipcard-block`; cannot be inserted elsewhere.
- Contains no standalone attributes—relies entirely on parent block styling.
- Renders a wrapper element with `adaire-flipcard__front` (or similar) class for scoped CSS.
- Fully supports nested inner blocks, including reusable layouts.

## Usage Tips

1. **Lead with a Headline** - Use a short title or value proposition for immediate clarity.
2. **Add Visuals** - Pair headings with icons or images to increase engagement.
3. **Keep It Minimal** - Save detailed copy for the back face to encourage interaction.
4. **Add Callouts** - Badges or labels (e.g., "New", "Featured") grab attention quickly.
5. **Balance Alignment** - Centered layouts work well; left-aligned text suits multi-card grids.

## Best Practices

- **Consistent Design** - Match typography and colors across all front faces in a section.
- **Accessible Messaging** - Ensure front content conveys purpose even without flipping.
- **Contrast & Readability** - Choose colors and font sizes that remain legible at a glance.
- **Test Touch Devices** - Verify tap areas are large enough for mobile users.
- **Progressive Disclosure** - Tease information on the front, reveal details on the back.

## Accessibility

- **Semantic Content** - Use appropriate heading levels and lists for screen readers.
- **Focusable Elements** - Buttons or links inside the front face remain keyboard-accessible.
- **Motion Considerations** - Provide the most important information on the front for users who cannot trigger motion effects.
- **Descriptive Text** - Ensure labels and alt text describe imagery meaningfully.

## Browser Compatibility

- **Modern Browsers** - Fully supported in Chrome, Firefox, Safari, and Edge.
- **Mobile Browsers** - Works with touch interactions on iOS and Android.
- **Fallback** - If flip animations are disabled, the front content remains visible as the primary state.

## Screenshots

### Desktop View
- Front face showing icon, heading, and short description
- Clean padding and border radius inherited from parent card
- Hover indicator (e.g., subtle shadow) signalling interactivity

### Tablet View
- Centered layout within responsive card dimensions
- Balanced typography for mid-sized screens
- Touch-ready spacing between elements

### Mobile View
- Full-width front face with vertical stack layout
- Large touch targets for imagery or buttons
- Readable text and clear cues before flipping



