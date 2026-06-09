# Changelog - Version 1.2.5

**Release Date:** TBD

## Summary

Version 1.2.5 adds the **Horizontal Scroll Carousel** and **Horizontal Scroll Card** blocks (Plus tier): a scroll-scrubbed horizontal track whose motion is driven by vertical page scroll, with nested cards for titles, body copy, media, CTAs, and per-card styling. Front-end behavior uses GSAP ScrollTrigger for pinning, scrubbed translation, and reliable re-measurement when images load.

## Features

### Horizontal Scroll Carousel (Plus)

- **Scroll-linked horizontal motion** – As the visitor scrolls down, the card track moves horizontally; scrolling up reverses the motion. The section pins while the animation runs so the effect stays in view.
- **Editor controls** – Section background, optional heading (text, typography, color), responsive section padding, responsive card width and gap, responsive horizontal padding on the track, and **scrub speed** to tune how closely the animation follows scroll.
- **Wide / full alignment** – Block supports wide and full alignments where the theme allows.
- **Front-end script** – `view.js` registers ScrollTrigger, scopes cleanup to `.adaire-hsc` instances, and computes scroll distance from the last card’s layout so the final card clears the viewport with consistent padding.

### Horizontal Scroll Card (nested)

- **Parent-only insertion** – Cards are child blocks of the carousel (`inserter: false` in `block.json`); they only appear inside the carousel in the editor.
- **Content** – Rich title and description, featured image with alt text, responsive image width and card padding per breakpoint (mobile through big-desktop).
- **Styling** – Card background, border radius, box-shadow controls, optional border (color, width, style), title and body colors and typography, flex alignment and gap for internal regions.
- **Inner blocks** – Slot for **`create-block/button-block`**, **`core/buttons`**, and **`core/button`** for CTAs per card.

## Improvements

- **`config/blocks-config.json`** – Both blocks are enabled with documented feature tags for Plus / marketing use (scroll-driven animation, scrub control, responsive layout, rich card content, etc.).
- **Block registration** – Carousel and card modules imported from `src/index.js` so they build with the main editor bundle.

## Technical details

### Block metadata

| Block | `block.json` name | Category | View script |
|-------|-------------------|----------|-------------|
| Horizontal Scroll Carousel (Plus) | `create-block/horizontal-scroll-carousel-block` | `adaire-blocks-plus` | `file:./view.js` |
| Horizontal Scroll Card | `create-block/horizontal-scroll-card-block` | `adaire-blocks-plus` | _(none; carousel owns motion)_ |

### Front-end (`view.js`)

- GSAP + `ScrollTrigger`: `pin`, `scrub` from `data-scrub` / dataset, `start: 'center center'`, dynamic `end` from measured horizontal overflow.
- `onRefreshInit` resets track transform to `x: 0` before measurement so width/overflow math stays correct.
- `invalidateOnRefresh: true` and image `load` listeners reduce layout bugs when media resolves after first paint.
- Existing triggers on `.adaire-hsc` are killed before re-init to limit duplicate triggers on repeat initialization.

### File changes

- `adaire-blocks.php` – Version **1.2.5**.
- `config/blocks-config.json` – Entries for `horizontal-scroll-carousel-block` and `horizontal-scroll-card-block` (enabled, features).
- `src/index.js` – Imports `./horizontal-scroll-carousel-block` and `./horizontal-scroll-card-block`.
- `src/horizontal-scroll-carousel-block/block.json`
- `src/horizontal-scroll-carousel-block/index.js`
- `src/horizontal-scroll-carousel-block/edit.js`
- `src/horizontal-scroll-carousel-block/save.js`
- `src/horizontal-scroll-carousel-block/style.scss`
- `src/horizontal-scroll-carousel-block/editor.scss`
- `src/horizontal-scroll-carousel-block/view.js`
- `src/horizontal-scroll-card-block/block.json`
- `src/horizontal-scroll-card-block/index.js`
- `src/horizontal-scroll-card-block/edit.js`
- `src/horizontal-scroll-card-block/save.js`
- `src/horizontal-scroll-card-block/style.scss`
- `src/horizontal-scroll-card-block/editor.scss`
- `misc/releases/v1.2.5.md` – Developer-facing release notes.
- `misc/releases/v1.2.5-user-facing.md` – User-facing release notes.
- `misc/docs/CHANGELOG-v1.2.5.md` – This changelog.
- `readme.txt` – Stable tag and changelog entry for 1.2.5.

_(Compiled `build/` outputs are produced by the normal npm build; they are not listed as source files.)_

## Upgrade impact

- **Additive only** – No migrations; existing posts are unchanged.
- **Plus** – Blocks appear only for sites/builds that expose Plus-tier blocks.
- **Build** – Run the usual build so `view.js` and block assets are generated in `build/`.

## Backward compatibility

- New block types and attributes only; no breaking changes to previously saved blocks.

**Version:** 1.2.5
