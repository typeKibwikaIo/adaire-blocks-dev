# Industries Block Documentation

## Overview

The Industries Block is a hero-style module that pairs bold copy with icon tiles for each industry vertical you serve. It ships with container presets, device-specific typography controls, Bootstrap icon pickers, optional linking per tile, and a media frame so you can reuse the section in any layout without touching code.

## Adding the Industries Block to your page

### Locate and add the block

1. Use the “/” inserter and search for “Industries”.
2. Add **Industries Block** from the Adaire collection.
3. You’ll see three headline lines, intro/description text, six sample industries, and an image placeholder you can customize immediately.

## Layout controls

### Container mode

- **Full Width** (default) lets the background stretch edge to edge.
- **Constrained** adds a centered max-width wrapper so the block aligns with other constrained sections.

### Container max width per device

- Desktop defaults to 1200 px; Tablet and Mobile default to 100 %.
- Range sliders plus unit buttons (`px`, `%`, `rem`, `vw`) are available for Desktop, Tablet, and Mobile.
- Use this when a constrained container still needs a custom width on certain breakpoints.

### Visibility toggles

- **Show Title**, **Show Intro Text**, **Show Image** – Turn key areas on/off while preserving layout spacing.
- **Hide First Two Industries** – Removes the hero squares so every tile appears in the lower grid (useful for symmetrical layouts).

## Copy & imagery settings

- **Headline lines (×3)** – Each line is a RichText field so you can edit without leaving the canvas. Defaults echo “Sharpen your edge / Lead your industry / Build the future”.
- **Intro text** – Short paragraph that lives under the hero heading (used across breakpoints).
- **Description text** – Longer paragraph that sits beside the image on desktop and inside the detail column on smaller screens.
- **Feature image** – Media picker with Select, Replace, and Remove actions. Upload custom art or leave the gradient placeholder.

## Industry tiles

- Each tile includes:
  - **Bootstrap icon class** (picked via the in-editor icon modal).
  - **Label** (RichText).
  - **Optional link URL** plus **Open in new tab** toggle.
- Tiles can be reordered with up/down arrows or removed entirely (at least one tile must remain).
- Use **Add Industry** to append more entries; the layout automatically reflows in both grids.

## Color settings

Available through the **Colors** panel (preloaded with Adaire palette tokens):

- Background (`--industries-bg`)
- Headline color + Headline accent color
- Chevron color
- Tile border, icon, and icon background colors
- Tile hover background and hover text colors

## Typography & spacing

- **Headline font weight** – Numeric or keyword values (default 400).
- **Headline / Intro / Description font sizes** – Device-specific sliders with unit selectors (`px`, `rem`, `em`, `vw`) so you can scale typography independently per breakpoint.
- **Chevron size** – 12–48 px.
- **Tile padding (desktop/mobile)** – Separate sliders for generous desktop spacing and compact mobile spacing.
- **Tile border radius** – 0–48 px.
- **Tile icon size** – 16–64 px.
- **Tile title font size** – 16–48 px.

## Responsive behavior

### Desktop
- Two-column layout: hero copy + hero squares on the left, description + image + stacked tiles on the right.
- Hovering a tile lifts it slightly, reveals the chevron, and swaps to your hover colors.

### Tablet
- Layout stacks vertically: copy first, then the mobile grid, followed by the description/image column.
- Desktop-only description blocks collapse, leaving the intro copy to keep things concise.

### Mobile
- Single-column tile list with reduced padding values.
- Icons and text sit side by side for faster scanning; hover colors appear on tap-capable devices.

## Technical details

- CSS custom properties (see below) mirror every inspector setting, so theme developers can override styles globally.
- Bootstrap Icons are enqueued automatically as soon as the block is present on the page or editor.
- Tiles render as `<a>` elements when a URL is provided, complete with `rel="noopener noreferrer"` for new-tab links; otherwise they render as `<div>`s.
- Feature images load via the standard `wp.media` picker and respect alt text you provide.

### Key CSS variables

- `--industries-bg`
- `--industries-header-color`, `--industries-header-accent-color`, `--industries-header-weight`
- `--industries-header-size` (+ tablet/mobile variants)
- `--industries-intro-size`, `--industries-description-size`
- `--industries-chevron-color`, `--industries-chevron-size`
- `--industries-tile-padding`, `--industries-tile-padding-mobile`, `--industries-tile-radius`
- `--industries-tile-border-color`, `--industries-icon-color`, `--industries-icon-bg`, `--industries-icon-size`
- `--industries-title-size`
- `--industries-tile-hover-bg`, `--industries-tile-hover-text`
- `--container-max-width` (+ tablet/mobile variants)

## Usage tips

1. Start by dialing in container mode and max widths so the section matches the rest of your page grid.
2. Use the built-in icon picker to stay within the Bootstrap icon set—consistency keeps the tiles polished.
3. Keep tile labels short (1–3 words) to avoid wrapping on narrow screens.
4. When linking tiles, use descriptive URLs or anchors so visitors know where they’re headed.
5. Pair the block with a CTA or contact section to turn vertical interest into action.

## Best practices

- Limit the hero copy to three succinct lines for maximum impact.
- Stick to six or eight tiles; large counts can dilute the message and crowd the grids.
- Pick hover colors with sufficient contrast (WCAG AA+) against both the default and hover backgrounds.
- Use **Hide First Two Industries** when every tile needs identical emphasis rather than a hero treatment.

## Accessibility

- All headline and paragraph areas are semantic RichText fields.
- Icons are marked `aria-hidden="true"` so they don’t clutter screen reader output.
- Linked tiles include focus outlines plus keyboard-accessible hover states.
- Provide alt text for the feature image if it conveys meaning; leave blank for decorative visuals.

## Browser compatibility

- Fully supported in current Chrome, Edge, Firefox, and Safari versions.
- Layout relies on Flexbox/Grid, both widely supported across evergreen browsers.
- Hover transitions use hardware-accelerated transforms with graceful fallback on touch-only devices.

## Screenshots

### Desktop view
- Split hero layout showing the dual grids, descriptive copy, and feature image.

### Tablet view
- Stacked copy with two-column tile grid and responsive typography.

### Mobile view
- Single-column tile stack with compact padding and tap-friendly hit targets.
