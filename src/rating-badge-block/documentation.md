# Rating Badges Block Documentation

## Overview

The **Rating Badges** block (`create-block/rating-badge-block`) displays a row of
star-rating / app-store-style trust badges — e.g. "4.8/5 · 500+ App Store reviews" —
each with an icon (or uploaded image) and a text/subtext pair. It's a standalone
extraction of the rating badge strip that used to live inside the SaaS Hero block, so it
can be placed anywhere on a page independently of any hero section.

## Adding the Block

1. Type "/" and then "Rating Badges" in the block inserter, or search "Rating Badges" in
   the block library.
2. The block appears pre-filled with three demo badges ("4.8/5", "4.7/5", "Excellent")
   that you can edit via the sidebar.

## Content Settings

### Badges
Each badge is an item in the `badges` array, managed via the sidebar's "Badges" panel:
- **Icon** — opens an icon picker (Bootstrap Icons) for the badge's glyph. Disabled
  while an image is set.
- **Badge image** — optional uploaded image that replaces the icon when set (same
  footprint, so layout doesn't shift between icon and image badges). "Remove image" to
  switch back to the icon.
- **Text** — the bold headline text (e.g. "4.8/5", "Excellent").
- **Subtext** — the smaller supporting text (e.g. "500+ App Store reviews").

### Managing Badges
- **Add badge** — appends a new badge with placeholder content.
- **Reorder** — move a badge up or down using the arrow buttons on its control panel.
- **Remove** — delete a badge.

## Layout Settings

- **Container Width** — Full Width or Constrained, with a "Max Width (Desktop)" slider
  when constrained (tablet/mobile default to 100% width).
- **Alignment** — Left, Center, or Right; controls how the badge row is justified.

## Styling & Colors

- **Accent color** — drives the icon background tint and icon color.
- **Text color** — the block's base text color.

## Technical Details

- **Type**: static block (content is saved as HTML in `post_content`, not
  server-rendered).
- **API version**: 3.
- **Supports**: custom anchor, wide/full alignment, custom class name.
- **CSS custom properties**: `--ad-accent`, `--ad-color`, `--ad-align`, plus
  `--container-max-width*` — see `getStyleVars()` in `shared.js`.
- **Frontend script**: none — purely CSS, no JavaScript needed to render.
- **Icon picker**: uses the same Bootstrap Icons dataset (`src/icon-box-block/
  bootstrapIcons.js`) and `BootstrapIconPicker` modal pattern used by several other
  blocks in this plugin (each block keeps its own local copy rather than a shared
  component, matching this repo's convention — see the SaaS Hero block's history for
  why).

### Migrated from SaaS Hero

This block replaces the "Ratings & Badges" section that used to be built into the SaaS
Hero block. If you're rebuilding a page that previously used that section, add a Rating
Badges block wherever the badge strip appeared (typically right below the hero's CTA).
There's no automatic migration of old hero content into this block — the SaaS Hero
block's own deprecation only makes old pages keep validating, it doesn't recreate a
Rating Badges block from that content.

## Best Practices

- Keep badge text short — "4.8/5" or "Excellent" reads better than a full sentence.
- Use 2–4 badges; more than that starts to wrap awkwardly on narrower screens.
- Prefer uploaded logo images (App Store, Google Play, Trustpilot, etc.) over icons when
  brand recognition matters more than a generic star rating.
- Keep accent color consistent with the surrounding section for a cohesive look.
