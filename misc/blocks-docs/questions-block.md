# Questions Block Documentation

## Overview

The Questions Block is a GSAP-powered FAQ/storytelling panel that pins itself on scroll and steps through three oversized prompts (“What?”, “Why?”, “Who?” by default). As visitors scroll, the active question scales up, its content fades in, and an optional progress indicator fills to show how far they are in the narrative. Perfect for About pages, process walkthroughs, or any story you want to deliver one beat at a time.

## Adding the Questions Block to your page

### Locate and add the block
1. Type `/` in the editor and search for “Questions”.
2. Insert **Questions Block**.
3. You’ll see three placeholder question/answer pairs, a vertical progress line, and the scroll-pin interaction ready to preview.

## Content settings

### Question titles & content
- **Question 1/2/3 Title** – Large headings displayed in the left column (defaults: “Who?”, “You?”, “What?” depending on your template).
- **Question 1/2/3 Content** – Rich text areas that support paragraphs, bullet-style lines, and manual line breaks. Content appears in the right column and animates into view as each question becomes active.
- **Convert Selection to List** button – Highlight text inside any content textarea and click this button to prefix each line with a bullet (•) automatically, keeping formatting consistent.
- **Active Section Selector** – Use the dropdown to focus a specific question while editing; the preview highlights whichever section you choose so you can tweak typography and copy without scrolling.

## Color & typography

- **Background Color** – Sets the entire panel’s backdrop (default: deep charcoal `#070707`).
- **Body Text Color** – Controls the content column text color.
- **Active Title Color / Inactive Title Color** – Customize the contrast between the current question (e.g., bright white) and upcoming ones (so they appear subdued).
- Typography inherits from your theme, but you can use the editor’s RichText controls for inline emphasis or additional wrappers.

## Scroll & pin behavior

- **Scroll Distance (Desktop)** – Percentage value (100–500) that decides how far the user must scroll for the block to unpin. Higher values deliver slower, more dramatic transitions.
- **Scroll Distance (Mobile)** – Separate slider (default 170) so you can shorten the experience on phones.
- GSAP ScrollTrigger pins the block and scrubs animations, so the layout stays fixed while titles/content swap.

## Progress indicator

- **Show Progress Indicator** – Toggle to show/hide the vertical line next to the titles column.
- **Progress Line Color / Fill Color** – Choose the stroke and animated fill colors independently.
- **Progress Line Width** – 1–10 px slider to match your brand weight.
- The fill animates in sync with scroll progress (0% → 100%).

## Block settings

- **Block ID** – Optional custom ID for anchor links (`#questions-block`) or theme-level styling.

## Responsive behavior

### Desktop
- Section pins and occupies the viewport height.
- Titles stay fixed in the left column; content slides/ fades to the right.
- Progress indicator sits between the columns.

### Tablet
- Scroll distance automatically switches to the mobile value if the viewport ≤1024 px.
- Layout remains two-column but titles shrink to preserve space.

### Mobile
- Columns stack vertically; content sits below the titles.
- Pinning still works, but the shorter scroll distance prevents the block from feeling too long.
- Progress indicator can be toggled off if space is limited.

## Technical features

- **GSAP ScrollTrigger** handles pinning, scrubbing, and active-state transitions.
- **CSS custom properties** expose colors, widths, and scroll distances for theme overrides (`--title-color`, `--progress-indicator-width`, etc.).
- **Data attributes** (`data-scroll-distance`, `data-scroll-distance-mobile`) pass device-specific values to the frontend script.
- **Reduced DOM** – Only three question nodes; content swaps via class toggles instead of re-rendering.

## Usage tips

1. Keep question titles short (1–3 words) so they don’t wrap even when scaled up.
2. Break long answers into multiple paragraphs or bulleted lines; the animation handles multi-line content gracefully.
3. Experiment with scroll distances: 250% delivers a leisurely storytelling pace, 150% feels more snappy.
4. Hide the progress line if your design already includes another vertical accent.
5. Pair with CTA blocks below the fold to give visitors a next action after reading through the questions.

## Best practices

- Maintain high contrast between active/inactive titles for accessibility.
- Avoid more than three sections—ScrollTrigger thresholds are tuned for a trio; for longer FAQs use the Accordion Block instead.
- Test on touch devices to ensure scroll feels smooth and the block height isn’t overwhelming.
- If you use bullet formatting, keep lines concise; long bullets can feel cramped in the pinned layout.

## Accessibility

- Headings and content areas are output as semantic HTML via `RichText`.
- Keyboard scroll works because the block uses standard page scrolling (no custom wheel hijacking).
- Progress indicator is decorative; ensure the text alone conveys the story.
- Provide descriptive language in the answers so users relying on screen readers don’t miss context.

## Browser compatibility

- Works in current Chrome, Edge, Firefox, and Safari (desktop + mobile).
- Uses hardware-accelerated transforms; if GSAP isn’t available, the block still displays all questions stacked without animation.
- ScrollTrigger refreshes on resize for consistent behavior when rotating tablets/phones.

## Screenshots

### Desktop View
- Pinned layout with oversized “What/Why/Who” titles on the left, active content on the right, and a vertical progress bar filling as you scroll.

### Tablet View
- Slightly smaller titles with the progress indicator still visible; content column adapts to the narrower viewport.

### Mobile View
- Stacked layout with touch-friendly text blocks; scroll distance shortened so the section doesn’t overstay its welcome.

