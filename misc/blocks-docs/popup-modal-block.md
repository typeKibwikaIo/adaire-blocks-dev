# Popup Modal Block Documentation

## Overview

The Popup Modal Block is a single block that combines a trigger button and a modal dialog. Unlike the earlier three-block design (`modal-block` + `modal-trigger-block` + `modal-content-block`), the trigger is now a flat, styleable button attribute — not a nested block — while the modal body is the block's own free-form InnerBlocks area, accepting any Gutenberg blocks.

This is a **Pro** block (`popup-modal-block`).

## Adding the block to your page

1. Type `/` inside the editor and search for "Popup Modal".
2. Select **Popup Modal** from the Adaire Blocks collection.
3. A trigger button and a modal body placeholder (heading + paragraph) appear — edit both directly in the canvas.

## Block structure

- **Trigger** — a real `<button>` element, edited inline via RichText for its label. Style controls (text color, background, border radius, padding, font size/weight) live in the "Trigger Style" panel. Can be inline (appears where the block is placed) or floating (fixed to a screen corner, e.g. for chat/support widgets).
- **Modal body** — the block's own InnerBlocks region. Starts with a heading + paragraph placeholder but accepts any block stack (images, forms, embeds, columns, etc.). Hidden on the front end until the modal is opened.

## Settings

### Trigger

- **Type** — Inline or Floating.
- **Floating position** — anchor corner (bottom-right/left, top-right/left) plus horizontal/vertical offset, when floating.
- **Style** — text color, background color, border radius, horizontal/vertical padding, font size, font weight.

### Device-specific dimensions

Device selector switches between Mobile/Tablet/Small Laptop/Desktop/Big Desktop to edit width/height per breakpoint. Width units: `px`, `vw`, `rem`. Height units: `px`, `vh`, `%`. Defaults: 600px desktop width, 90vw mobile/tablet width, 400px desktop height, 360px mobile height.

### Color and surface styling

- **Background color** — Modal body fill (default `#ffffff`).
- **Overlay color** — Backdrop tint (default `rgba(0,0,0,.6)`).
- **Border color/width/radius** — Modal container outline.
- **Padding** — Inner spacing around the modal body (0–80px).
- **Content padding** — Separate top/right/bottom/left padding around the InnerBlocks content itself.

### Close button

- **Position** — top-right/left, or outside the modal edge (top-right/left).
- **Shape** — circle, rounded, or square.
- **Icon color / background / size**.

### Position & animation

- **Position** — center, top, bottom-sheet, drawer-right, drawer-left.
- **Animation** — fade, slide up/down, zoom in/out, bounce, or none. Configurable duration and easing.
- **Shadow & blur** — optional depth shadow and frosted-glass backdrop blur.

### Behavior

- **Auto-open** — manual (button click only), page-load delay, or exit-intent.
- **Close on overlay click** — toggle.
- **Show close button** — toggle.
- **Preview modal overlay** — editor-only toggle to inspect the open state without leaving the canvas.

## Modal functionality

### Opening

- Click/tap the trigger button (native `<button>`, so Enter/Space work automatically when focused).
- Dispatch a `modal:open` custom event on the block element from your own scripts.

### Closing

- Click the close button, click the overlay, press Escape, or dispatch `modal:close`.

## Technical details

### CSS custom properties

- `--modal-width-*`, `--modal-height-*` (per breakpoint)
- `--modal-background`, `--modal-overlay-color`, `--modal-border-*`, `--modal-padding`
- `--modal-close-color`, `--modal-close-bg`, `--modal-close-size`
- `--content-padding-*`
- `--trigger-color`, `--trigger-bg`, `--trigger-radius`, `--trigger-padding-x`, `--trigger-padding-y`, `--trigger-font-size`, `--trigger-font-weight`
- `--floating-offset-x`, `--floating-offset-y` (floating trigger only)

### Block classes

- `.adaire-popup-modal-block` — wrapper (gets `.is-open` while the dialog is visible).
- `.adaire-popup-modal-block__trigger` — the trigger button.
- `.adaire-popup-modal-block__overlay`, `__modal`, `__content`, `__close`, `__body` — structural elements.

### Data attributes & events

- `data-modal-block` on the wrapper for JS discovery.
- `data-modal-role="trigger"` / `"content"` mark the two functional pieces (the view.js script queries by these attributes, not by DOM structure, so this contract must be preserved by any future markup changes).
- Custom events `modal:open` / `modal:close` for external control.

## Accessibility

- Keyboard users open the modal via Enter/Space (native button behavior) and close via Escape.
- Focus moves into the modal on open and returns to the trigger on close.
- Tab focus is trapped within the dialog while open.
- `role="dialog"`, `aria-modal`, and `aria-haspopup="dialog"` are set for screen readers.
- Body scroll is locked while any modal is open.

## Migrating from the old three-block design

`modal-block` / `modal-trigger-block` / `modal-content-block` no longer exist — they were merged into `popup-modal-block`. There is no automatic content migration; existing pages using the old blocks will need the Popup Modal block re-inserted. If the old trigger used a nested `core/button` with rich styling beyond text/color/radius/padding/font, recreate that look using the new Trigger Style panel.
