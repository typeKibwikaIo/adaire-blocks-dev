# Project Block Documentation

## Overview

The Project Block delivers a cinematic project spotlight: blur-backed hero copy on the left, an interactive gallery grid, and a GSAP-powered preview pane on the right that animates between case studies. Use it for case-study pages, product showcases, or agency portfolios where you need metadata, imagery, and narrative text tightly choreographed.

## Adding the Project Block to your page

### Locate and add the Project Block

1. Type `/` inside the editor and search for “Project”.
2. Select **Project Block**.
3. The block loads with a sample company profile, metadata rows, and one gallery card so you can start customizing immediately.

## Content Settings

### Company details

- **Project/Company Name** – Headline that appears above the description.
- **Company Description** – Rich text (textarea) that supports multiple sentences.
- **Client, Country, Industry, Language, Technology** – Displayed in the left-hand metadata list to reinforce credibility.
- **Site URL** – Optional link to the live experience; surfaced in the preview when provided.

### Gallery items

Each gallery item contains:

- **Title** – Used inside the hero preview and on hover states.
- **Copy** – Descriptive paragraph. Line breaks are preserved and animated line-by-line.
- **Image** – Upload via the Media Library. Thumbnails fill the grid; the active image powers the blurred background and hero preview.

Use **Add Gallery Item** to stack multiple entries and **Remove Item** to prune the list. Items appear in the order listed; clicking a thumbnail or the “Next” label will advance through them.

### Next button label

- Customize the CTA text (`Next`, `View more`, etc.) to match your tone.
- The button only renders when more than one gallery item exists; it gracefully disappears on the last item.

### Block ID

- Optional custom ID for anchor links or targeted CSS (`#my-project`).

## Visual Styling

- **Background Color** – Sets the dark canvas behind the entire section (default `#0a0a0a`).
- **Text Color** – Governs body copy, metadata labels, and CTA text (default `#ffffff`).
- **Section Height** – Controls the vertical height (in viewport percentages) of the experience.
- **Title/Text Typography** – Device-agnostic font size and font-family controls. Defaults: 40 px headings, 18 px body text with inherited fonts, keeping the block cohesive with your theme.

## Interaction & Animation

- **Blurred Backdrop** – The active gallery image is duplicated and blurred behind the grid, creating depth that updates during transitions.
- **Next button** – Clicking the CTA animates to the next gallery item, unless you’re already on the final card.
- **Thumbnail clicks** – Click any gallery thumbnail to jump directly to that project; the active thumb receives a highlight.
- **Fullscreen modal** – Clicking the hero preview image opens an overlay with a close button and Escape-key support.
- **GSAP + SplitType** – Titles, paragraphs, and buttons animate with staged translations and opacity fades; paragraph text is split into lines so each line animates independently.

## Responsive Behavior

### Desktop
- Two-column layout (metadata/galleries left, preview right).
- Gallery grid scroll bubble is capped so metadata stays visible.
- Blur backdrop fills the container edge-to-edge.

### Tablet
- Columns stack vertically as needed, but the grid and preview keep their interactions.
- Typography scales through the font-size controls; consider lowering section height for shorter devices.

### Mobile
- Layout collapses into a single column.
- Gallery cards become tap-friendly; preview sits below the metadata.
- Fullscreen modal uses the entire viewport with close-on-tap support.

## Technical Features

- **CSS Custom Properties** – Colors, typography, paddings, and heights expose CSS variables so themes can override them globally.
- **Inline JSON payload** – Gallery data is printed inside a `<script type="application/json">`, which the frontend script parses to sync GSAP transitions.
- **`blockId` attribute** – Ensures multiple Project Blocks on one page don’t conflict; each instance scopes its animations.
- **External libraries** – Uses GSAP for motion and SplitType for line splitting; both are bundled automatically when the block renders.

## Usage Tips

1. **Lead with your hero project** – Place your flagship work first; it becomes the default preview.
2. **Keep copy scannable** – Use short paragraphs or deliberate line breaks; the animation calls each line into view.
3. **Prep high-resolution imagery** – The blurred background magnifies artifacts, so export clean 2× assets.
4. **Label the CTA** – Renaming the “Next” CTA to “View APST research” or “See next project” adds context.
5. **Link to the live site** – Populate the Site URL field so viewers can explore the work directly.

## Best Practices

- Limit gallery items to 3–6 for performant transitions.
- Provide 3:2 or 4:3 imagery to avoid aggressive cropping.
- Use contrasting metadata labels (e.g., lighter labels, bold values) for readability.
- Pair Project Block with a CTA or testimonial block to continue the story down the page.

## Accessibility

- Metadata is rendered as semantic headings and paragraphs.
- Buttons and thumbnail divs are focusable/clickable, with `event.preventDefault()` only where needed.
- Fullscreen modal listens for Escape and overlay clicks to close.
- Provide descriptive `alt` text on gallery images to describe the work showcased.

## Browser Compatibility

- Optimized for modern evergreen browsers (Chrome, Edge, Firefox, Safari).
- Animations leverage hardware-accelerated transforms; falls back to instant swaps if GSAP isn’t available.
- Mobile Safari/Chrome handle the fullscreen overlay with smooth fade-ins and taps-to-dismiss.

## Screenshots

### Desktop View
- Dual-column layout with blurred hero background, metadata stack, gallery grid, and animated hero preview.

### Tablet View
- Stacked layout with gallery cards and preview still interactive.

### Mobile View
- Single-column storytelling with tap-to-open preview images and simplified metadata rows.

