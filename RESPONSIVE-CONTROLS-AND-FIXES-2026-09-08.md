# Responsive Controls and Bug Fixes, 2026-09-08

This documents three separate pieces of work done in this session: adding responsive breakpoint controls to 14 blocks, removing the newsletter call-to-action from the Hero Block (Pro), and fixing a gradient picker bug in the Hero Banner (Free).

## 1. Responsive breakpoint controls added to 14 blocks

### What was wrong

A stabilization pass (`stabilization-analysis.md`) identified a set of blocks with no way to set different padding, font size, or corner radius values per device. Any value a user picked applied identically on desktop, tablet, and mobile, which is a common source of layouts that look fine on desktop but cramped or oversized on phones.

Six of those blocks (`app-download-block`, `live-streamer-block`, `pdf-upload-block`, `promo-banner-block`, `reader-block`, `skill-bar-block`) had a second, more serious problem underneath: their existing padding, font size, and radius controls wrote to attributes that were never declared in `block.json`. WordPress silently drops any attribute not declared in a block's schema when it saves, so those controls appeared to work in the editor but the chosen value was lost every time the page reloaded.

### What was changed

Each of the following blocks now has a "Responsive" panel with a desktop/tablet/mobile switcher, using the same `DeviceSwitcher` component already used elsewhere in the plugin: `app-download-block`, `container-block`, `form-block`, `live-streamer-block`, `pdf-reader-block`, `pdf-upload-block`, `progress-block`, `promo-banner-block`, `reader-block`, `saas-hero-block` (background padding only), `scroll-text-block`, `skill-bar-block`, `social-share-block`, and `timeline-block`.

For the six blocks with the attribute persistence bug, the missing attributes were declared in `block.json` and wired into `save.js`/`edit.js` correctly. Where an already-published block could have a genuinely working legacy value (for example `pdf-upload-block`'s `borderRadius`, or `promo-banner-block`'s `padding`), that legacy value is used as the desktop-tier fallback, so existing content keeps its current appearance until someone explicitly opens the new Responsive panel and changes it.

Two blocks that were flagged by the same stabilization pass were deliberately left unchanged: `cookie-notice-block` already handles narrow screens with fluid CSS (`clamp()`, viewport-relative sizing) and has no value that would benefit from a fixed per-device number. `project-block`'s visual design is not attribute-driven at all (the relevant attributes are unused leftovers from an earlier version of the block) and already has its own multi-breakpoint CSS, so there was nothing to make responsive without inventing a new feature from scratch.

### Verification

Every change was checked with a full `npm run build`, which stayed at the same 44 pre-existing warnings and 0 errors throughout. Each modified file was also linted; the only findings were pre-existing formatting-style and unused-import warnings unrelated to this work.

## 2. Newsletter call-to-action removed from Hero Block (Pro)

### What was wrong

The Hero Block (Pro) had a "Email Form" call-to-action option that posted to a newsletter signup endpoint. This is being removed from the block.

### What was changed

The `email-form` option was removed from the `ctaType` choice in `block.json`, along with the `emailPlaceholder` and `submitButtonText` attributes and their editor controls. `view.js`, which existed only to submit that form to the newsletter REST endpoint, was deleted, since nothing else in the block needed it.

This block saves static HTML, so any page already published with the email-form option chosen has that markup permanently stored in its content. To keep those pages from showing a "block contains invalid content" error the next time someone opens them in the editor, the previous rendering logic and its full attribute list were frozen into a new entry in `deprecated.js`. Already-published pages keep validating and rendering as before; the option is simply no longer offered for new content.

The shared newsletter backend (the subscribers database table and the `/subscribe` REST endpoint in `class-adaire-blocks-subscribers.php`) was left in place, since the Booking Form block's own "subscribe to updates" checkbox still depends on it.

A "Responsive" panel for the section's background padding was added to this block at the same time, matching the pattern from part 1.

### Verification

Checked with a full `npm run build` (same 44 pre-existing warnings, 0 errors) and a scoped lint pass on every changed file, with no new issues found.

## 3. Gradient picker drag bug fixed in Hero Banner (Free)

### What was wrong

Dragging a color stop in the Background Gradient or Overlay Gradient picker (Appearance tab, Background panel) did not track the mouse cursor smoothly. The stop appeared to jump around instead of following the drag.

### Root cause

The Hero Banner's editor component is large, and both gradient pickers were committing directly to `setAttributes()` on every single pixel of a drag. Each of those calls re-rendered the entire editor component, and the re-render could not keep up with the speed of the mouse movement, so the dragged stop's on-screen position lagged behind the cursor.

### What was changed

Both pickers now keep their displayed value in local component state that updates immediately on every drag frame, so the picker itself always tracks the cursor. The actual save to the block's attributes (the expensive step that also creates an undo-history entry) is now debounced by 120 milliseconds, so it only happens once the user pauses rather than on every pixel. The live preview of the banner's background still updates in real time during the drag, using the same local value, so only the underlying attribute write is delayed, not the visual feedback.

### Verification

Checked with a full `npm run build` (same 44 pre-existing warnings, 0 errors) and a scoped lint pass, with no new issues found.
