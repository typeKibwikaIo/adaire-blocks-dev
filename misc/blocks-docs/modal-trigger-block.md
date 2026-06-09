# Modal Trigger Block Documentation

## Overview

In this article, we look at the Modal Trigger Block, the interactive element that opens a modal created with the Modal Block. It allows you to design custom buttons, links, or call-to-action content that launch the modal when clicked or tapped. The trigger is inserted automatically and can include any Gutenberg blocks for flexible styling.

## Adding the Modal Trigger Block to your page

### Locate and add the Modal Trigger Block

1. Insert a Modal Block (`/modal`)
2. The Modal Trigger Block appears automatically alongside the modal content block
3. Select the trigger area in the canvas or List View to customize its content

## Content Settings

### Inner Blocks

- Supports any Gutenberg blocks: Buttons, Headings, Paragraphs, Icon Boxes, Images, etc.
- Combine with layout blocks (Group, Stack) to build multi-element triggers (e.g., icon + text).
- Style the trigger using core block controls (colors, borders, typography).

### Linking

- The trigger inherits its modal-opening behavior from the parent block; no extra settings are required.
- If you include standard buttons or links, the block ensures the modal opens while preserving semantic markup.

## Interaction Behavior

- Clicking or tapping the trigger opens the associated modal overlay.
- The trigger remains accessible for keyboard users (Enter/Space).
- Multiple triggers can be used for the same modal by duplicating the block or using reusable patterns.

## Responsive Behavior

### Desktop (> 1024px)
- Triggers can be styled as buttons, badges, or entire cards.
- Pair with animations or hover states using core block controls for visual feedback.

### Tablet (768px - 1024px)
- Ensure trigger size remains large enough for touch interactions.
- Consider using full-width buttons or stacked layouts for clarity.

### Mobile (< 768px)
- Use full-width buttons, text links, or icon triggers with generous padding.
- Keep copy short to avoid wrapping in narrow layouts.

## Technical Features

- Declared as a child of `create-block/modal-block`; it cannot be inserted independently.
- Contains no standalone attributes; behavior is handled by the parent modal logic.
- Renders with a scoped class (e.g., `.adaire-modal__trigger`) for theme-level customization.
- Works with the parent’s accessibility features to ensure focus management and announcements.

## Usage Tips

1. **Use Clear Labels** - Make the trigger text action-oriented (e.g., “Open Demo”, “Join Waitlist”).
2. **Pair with Icons** - Enhance recognition by combining icons with descriptive text.
3. **Duplicate for Multiple Spots** - Add triggers in different sections that open the same modal for convenience.
4. **Combine with Buttons Block** - Use core button styling for consistency with other CTAs.
5. **Keep It Obvious** - Ensure the trigger stands out visually so users know a modal will open.

## Best Practices

- **Accessible Copy** - Avoid vague labels like “Click Here”; describe the action instead.
- **Touch-Friendly Design** - Provide sufficient padding and hit area for touch devices.
- **Consistent Styling** - Align trigger styles with other primary CTAs on the page.
- **Limit Prominence** - Use modals for focused actions; avoid cluttering pages with too many triggers.
- **Test Keyboard Flow** - Confirm that pressing Enter/Space opens the modal and focus moves inside.

## Accessibility

- **Keyboard Navigation** - Trigger is focusable; pressing Enter/Space opens the modal.
- **ARIA Considerations** - Parent modal adds appropriate aria attributes for announcing modal state.
- **Visible Focus** - Ensure your theme provides clear focus indicators for the trigger.
- **Screen Reader Clarity** - Combine text and aria labels (if needed) to explain what will happen.

## Browser Compatibility

- **Modern Browsers** - Compatible with Chrome, Firefox, Safari, Edge.
- **Mobile Browsers** - Works with tap interactions on iOS and Android.
- **Graceful Fallback** - If JavaScript fails, the trigger behaves like a static link or button; provide alternative navigation if necessary.

## Screenshots

### Desktop View
- Primary button labeled “Learn More” that opens a modal on click
- Hover state with color change for visual feedback
- Positioned within a hero section alongside supporting copy

### Tablet View
- Full-width trigger button with larger touch target
- Clear text label and optional icon for quick recognition
- Centered layout within responsive sections

### Mobile View
- Stacked layout with full-width trigger button
- Large padding and text size for accessibility
- Tap interaction launches the modal smoothly



