# Modal Block Documentation

## Overview

The Modal Block pairs a trigger block with a modal content block so you can launch rich dialogs anywhere on the page. Each modal instance ships with device-specific sizing controls, overlay styling, and a close button that you can skin to match your brand. Both the trigger and the content areas accept any Gutenberg blocks, so you can build buttons, cards, or icon links that open copy, media, forms, or embeds without extra coding.

## Adding the Modal Block to your page

### Locate and add the Modal Block

cal1. Type `/` inside the editor and search for “Modal”.
2. Select **Modal Block** from the Adaire collection.
3. A trigger area and a modal content area appear as nested blocks so you can start editing immediately.

## Block Structure

### Modal Trigger Block

- Holds the element that opens the dialog (button by default).
- Accepts any Gutenberg block (buttons, icons, columns, etc.).
- Stays inline with surrounding content so it never breaks layout flow.
- Handles keyboard activation automatically (Enter/Space).

### Modal Content Block

- Houses the content that displays inside the dialog.
- Starts with a heading + paragraph placeholder but accepts any block stack.
- Remains hidden on the front end until the modal is opened.
- Honors the sizing, padding, and border settings defined in the parent block.

## Settings

### Device-specific dimensions

**Device selector** – Switch between Desktop, Tablet, and Mobile presets to edit measurements per breakpoint.  
**Modal width** – Sets the content width for the active device. Units: `px`, `%`, `vw`, `rem` (min 0). Defaults: 600 px (desktop), 90 % (tablet/mobile).  
**Modal height** – Sets the content height for the active device. Units: `px`, `%`, `vh`, `auto`. Defaults: 400 px (desktop/tablet) and 360 px (mobile). When `auto` is selected the numeric input is disabled.

### Color and surface styling

- **Background color** – Modal body fill, full color picker with alpha (default `#ffffff`).
- **Overlay color** – Backdrop tint that sits behind the modal (default `rgba(0,0,0,.6)`).
- **Border color** – Outline color for the modal container (default `#e0e0e0`).
- **Border width** – 0–12 px slider (default 1 px); set to 0 for a frameless look.
- **Border radius** – 0–48 px slider (default 16 px) for rounded corners.
- **Padding** – 0–80 px slider (step 2, default 24 px) controlling inner spacing; automatically clamps on smaller screens.

### Close button controls

- **Icon color** – Color for the × glyph (default `#111111`).
- **Background** – Behind-the-icon pill color with alpha support (default `rgba(255,255,255,0.9)`).
- **Size** – 24–64 px slider (default 36 px) that scales both the button container and the icon.

### Preview tools

- **Preview modal overlay** – Editor-only toggle that forces the modal open so you can inspect spacing and overlay styling without leaving the editor canvas.

## Content management

### Trigger block

1. Click inside the trigger placeholder.
2. Insert any block stack you want to act as the launcher (buttons, Flex layouts, icons, etc.).
3. Style the trigger using that block’s native controls; no special attributes are required.

### Modal content block

1. Click inside the modal content area.
2. Add headings, copy, images, forms, or embeds as needed.
3. Content taller than the configured height becomes scrollable while the body scroll is locked.

## Responsive behavior

### Desktop
- Uses Desktop width/height tokens.
- Fixed overlay and centered modal with focus trap enforced.
- Close button sits in the top-right corner with your chosen size.

### Tablet
- Applies Tablet width/height values with a built-in max width of ~700 px.
- Padding automatically scales down to keep content readable.
- Overlay and focus management mirror desktop behavior.

### Mobile
- Defaults to 90 % width and 360 px height with reduced border radius.
- Padding is clamped between 16 px and your configured value.
- Works nicely as a pseudo full-screen sheet while still supporting the close button.

## Modal functionality

### Opening interactions
- Click or tap the trigger block.
- Press Enter/Space while the trigger has focus.
- Dispatch the `modal:open` custom event from your own scripts.

### Closing interactions
- Click the close button.
- Click the overlay outside the dialog.
- Press Escape.
- Dispatch the `modal:close` custom event.

### Inline placement

The parent wrapper uses `display: inline-block` (inline-flex inside the editor) so you can drop modals within paragraphs or stack multiple modals without extra layout wrappers.

## Technical details

### CSS custom properties

- `--modal-width-desktop`, `--modal-width-tablet`, `--modal-width-mobile`
- `--modal-height-desktop`, `--modal-height-tablet`, `--modal-height-mobile`
- `--modal-background`, `--modal-overlay-color`
- `--modal-border-color`, `--modal-border-width`, `--modal-border-radius`
- `--modal-padding`
- `--modal-close-color`, `--modal-close-bg`, `--modal-close-size`

### Block classes

- `.adaire-modal-block` – Parent wrapper.
- `.adaire-modal-block.is-open` – Applied while the dialog is visible.
- `.adaire-modal-block__overlay`, `__modal`, `__content`, `__close` – Structural elements rendered by the block.
- `.adaire-modal-trigger-block` / `.adaire-modal-content-block` – Inner block wrappers you can target in theme CSS.

### Data attributes & events

- `data-modal-block` and `data-preview-open` help the script locate and manage each instance.
- `data-modal-role="trigger"` / `"content"` live on the inner blocks for focus handling.
- Custom events `modal:open` and `modal:close` let you control the dialog from external JS.

## Usage tips

1. Configure Desktop dimensions first, then adjust Tablet/Mobile as needed.
2. Use percentage or viewport units when you want responsive widths without extra media queries.
3. Keep overlays semi-transparent so the underlying page context is still visible.
4. Test the Preview toggle after styling to confirm spacing and focus order.
5. Consider `auto` height for text-heavy content so the modal grows naturally.
6. Pair the trigger with contextual copy (“View pricing”, “Watch demo”) for clarity.
7. Duplicate the block when you need multiple modals—each instance keeps its own settings.

## Best practices

- Keep modal content focused on a single task to avoid overwhelming visitors.
- Ensure the trigger clearly communicates what will happen when clicked.
- Use contrasting colors for the close button so it is easy to find.
- Avoid putting critical navigation inside a modal; treat it as supplemental content.
- Validate that long content scrolls smoothly and doesn’t hide the close button.

## Accessibility

- Keyboard users can open the modal via Enter/Space and close it with Escape.
- Focus automatically moves into the modal and returns to the trigger on close.
- Tab focus is trapped within the dialog while it is open.
- ARIA attributes and `role="dialog"` are provided for screen readers.
- Body scroll is locked to prevent background content from moving while the dialog is active.

## Browser compatibility

- Works in current Chrome, Edge, Firefox, and Safari releases.
- Fully responsive on iOS and Android browsers with touch-friendly hit targets.
- Uses CSS custom properties and standard DOM events; no legacy polyfills required.

## Screenshots

### Editor view
- Shows trigger + modal inner blocks with inspector panels for dimensions, styling, close button, and Preview toggle.

### Desktop view
- Centered modal with overlay and custom close button showcasing brand colors.

### Tablet view
- Narrower dialog using Tablet presets with touch-safe spacing.

### Mobile view
- 90 % width sheet with clamped padding, rounded corners, and scrollable content.