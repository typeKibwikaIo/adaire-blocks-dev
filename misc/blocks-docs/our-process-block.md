# Our Process Block Documentation

## Overview
The **Our Process Block** is a responsive grid of process steps with icon support, headlines, and pill-like tiles. Each step can display an icon, title, and optional link target, making it perfect for showcasing methodologies, services, or onboarding flows. The layout is fully configurable per breakpoint, so you can display more columns on desktop and stack steps vertically on mobile.

## Adding the Block
1. In the block inserter, search for “Our Process”.
2. Drop the block onto the canvas – six demo steps are provided so you can see the layout immediately.
3. Click any step to edit its title, icon, or link URL directly in the sidebar.

## Content Controls
- **Heading & Subheading** – Rich text fields for section intro copy.
- **Process Steps** – Add, remove, reorder, or duplicate steps. Each step stores:
  - `icon` (Bootstrap Icon picker)
  - `title`
  - `description` (hidden by default but ready for future expansion)
  - `linkUrl` and `openInNewTab`
- **Icon Picker** – Opens the Bootstrap icon browser with search and reset actions.

## Layout & Responsive Controls
- **Container Mode** – Full width or constrained with device-specific max-width sliders.
- **Grid Columns** – Independent column counts for desktop, tablet, and mobile (1–6 columns).
- **Grid Gap** – Desktop/tablet/mobile spacing controls for the process grid.
- **Box Padding & Radius** – Adjust tile padding, border radius, and border width.

## Styling Controls
- **Background & Tile Colors** – Set overall background plus tile background/border/hover colors.
- **Typography** – Separate typography controls for headings, subheading, step titles, and icon size.
- **Icon & Title Colors** – Customize icon color, hover color, and text color tokens.

## Linking & Accessibility
- Each step can become a clickable link; entering `/landing-page` automatically resolves against the site root.
- `openInNewTab` toggles apply `rel="noopener noreferrer"` when enabled.
- Icons include `aria-hidden="true"` and focus states are expressed via CSS variables, keeping the list fully keyboard accessible.

## Tips
- Use higher column counts (4–6) for desktop and relax to 1–2 columns on mobile.
- Keep step titles short (1–3 words) for best wrapping on small screens.
- Set hover background/border colors with sufficient contrast so linked steps feel interactive.

