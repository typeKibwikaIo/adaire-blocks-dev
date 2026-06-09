# Modal Content Block Documentation

## Overview

In this article, we look at the Modal Content Block, the inner block that defines the body of a modal created with the Modal Block. It provides a dedicated canvas for headlines, imagery, forms, or any Gutenberg blocks you want to display when the modal opens. The block is inserted automatically as part of the modal structure and inherits styling from the parent.

## Adding the Modal Content Block to your page

### Locate and add the Modal Content Block

1. Insert a Modal Block (`/modal`)
2. The Modal Content Block is added automatically inside the modal layout
3. Select the modal canvas or use the List View to edit the content area

## Content Settings

### Inner Blocks

- Supports any Gutenberg blocks: headings, paragraphs, buttons, forms, videos, etc.
- Use layout blocks (Group, Columns, Stack) to structure the modal’s interior.
- Combine with spacing blocks to control padding, alignment, and layout flow.

### Styling

- Background colors, padding, border radius, and overlay styling are configured on the parent Modal Block.
- Add additional styling with Group blocks or custom classes inside the content area.
- Leverage the parent’s width/height controls to align the modal’s content with your design.

## Interaction Behavior

- The content becomes visible when the associated Modal Trigger is activated.
- Focus is trapped within the modal until the close control is triggered, ensuring accessibility.
- Keyboard shortcuts (Escape key) and overlay clicks close the modal unless disabled in the parent block.

## Responsive Behavior

### Desktop (> 1024px)
- Modal content appears centered with generous padding and max width.
- Use Columns or Grid blocks to present multi-column layouts within the modal.

### Tablet (768px - 1024px)
- Layout adapts to narrower widths; consider stacking elements vertically.
- Maintain adequate padding for touch interactions.

### Mobile (< 768px)
- Modal content stacks in a single column for readability.
- Keep forms and buttons full-width for easy tapping.
- Ensure the modal height remains comfortable; add vertical scroll if needed.

## Technical Features

- Declared as a child of `create-block/modal-block`; it cannot be inserted independently.
- No standalone attributes—styling and behavior come from the Modal Block.
- Renders with a scoped class (e.g., `.adaire-modal__content`) for theme overrides.
- Inherits accessibility attributes (role, aria-modal, aria-labelledby) from the parent.

## Usage Tips

1. **Structure Content Clearly** - Lead with a heading and concise message for quick comprehension.
2. **Focus on Conversion** - Place primary buttons or forms near the top for immediate interaction.
3. **Limit Height** - Use short copy or collapsible sections to keep content within view without scrolling.
4. **Add Media Wisely** - Lightweight images or icons can improve engagement without overwhelming.
5. **Combine with Blocks** - Embed forms, pricing tables, or testimonials to create high-impact modals.

## Best Practices

- **Keep Modals Purposeful** - Use for focused actions (newsletter signup, quick contact, announcements).
- **Provide Close Controls** - Ensure the modal has visible close buttons and overlay click support.
- **Respect Accessibility** - Avoid auto-opening modals without user intent; announce the content clearly.
- **Optimize for Mobile** - Test on phones to confirm content fits and buttons remain reachable.
- **Avoid Overuse** - Use modals sparingly to prevent disruption or fatigue.

## Accessibility

- **Semantic Structure** - Use headings, paragraphs, and lists for screen reader clarity.
- **Focusable Elements** - All interactive elements remain keyboard-accessible within the modal.
- **Escape & Overlay** - Ensure closing methods remain available for keyboard and screen reader users.
- **Announce Content** - Pair with aria labels or headings in the parent modal for clear announcements.

## Browser Compatibility

- **Modern Browsers** - Works in Chrome, Firefox, Safari, and Edge.
- **Mobile Browsers** - Responsive layouts render correctly on iOS and Android.
- **Fallback** - If JavaScript fails, modal content remains in the DOM; consider providing alternative navigation.

## Screenshots

### Desktop View
- Centered modal with headline, paragraph, and call-to-action buttons
- Balanced padding and responsive layout structure
- Close icon visible in the top corner

### Tablet View
- Content stacked vertically with comfortable spacing
- Buttons sized for touch interaction
- Modal width adapts to narrower screens

### Mobile View
- Full-width modal body with single-column layout
- Large close button and full-width CTA
- Scrollable content if the modal height exceeds viewport



