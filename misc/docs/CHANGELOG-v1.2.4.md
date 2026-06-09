# Changelog - Version 1.2.4

**Release Date:** [TBD]

## Summary

Version 1.2.4 adds custom block icons for the recently added blocks (Hero 1, Image Composition, Info Grid, Info Grid 2, Info Grid 3, Info Grid 4, Card Scroll, Card Scroll Item, Footer), ensures those icons display correctly in the block picker (inserter), and fixes free-plugin block categorization so free blocks appear under "ADAIRE BLOCKS FREE" instead of uncategorized.

## New / Updated Block Icons

### Blocks with new or updated custom icons

| Block | Tier | Change |
|-------|------|--------|
| Hero 1 | Free | New custom icon; displays in block picker and admin |
| Image Composition | Free | New custom icon; displays in block picker and admin |
| Info Grid | Free | Updated to part5 icon; displays in block picker and admin |
| Info Grid 2 | Free | New custom icon; displays in block picker and admin |
| Info Grid 3 | Plus | New custom icon; displays in block picker and admin |
| Info Grid 4 | Plus | New custom icon; displays in block picker and admin |
| Card Scroll | Free | New custom icon; displays in block picker and admin |
| Card Scroll Item | Free | Uses Card Scroll icon; displays in block picker and admin |
| Footer | Free | New custom icon; displays in block picker and admin |

## Improvements

### Block picker (inserter) icons

- **Issue:** Custom icons for the above blocks did not show in the block inserter (only in block management admin).
- **Cause:** Blocks were relying on the `icon` value from `block.json` (raw SVG string), which WordPress can sanitize or not render in the inserter.
- **Fix:** Each of these blocks now passes a **React icon component** (e.g. `Hero1Icon`, `InfoGrid2Icon`) to `registerBlockType()`, so the inserter receives a React element and displays the icon correctly.
- **Result:** Icons are consistent between block management and the block picker.

### Free plugin – block category

- **Issue:** In the free build, blocks appeared uncategorized in the block picker.
- **Cause:** The generated free plugin file did not register the "adaire-blocks-free" block category.
- **Fix:** The free-version generator (`scripts/generate-free-version.js`) now adds block category registration so the free plugin registers "ADAIRE BLOCKS FREE" and free blocks appear under that category.
- **Result:** Free users see all free blocks under one category in the inserter.

## Technical details

### Icon system

- New SVG assets added under `src/icons/new-icons/part5/` (and, for free blocks, copied to `src/icons/new-icons/Free Blocks/`).
- `config/block-icon-mapping.json` updated with `blockIconMap` and `newIconMap` entries for: hero-1-block, image-composition-block, infogrid-block, infogrid-2-block, infogrid-3-block, infogrid-4-block, card-scroll-block, footer-block.
- `npm run prebuild` (apply-new-icons.js and update-block-icons.js) generates or updates React icon components and writes the SVG into each block’s `block.json`.

### Block registration (icon component)

- **hero-1-block:** `icon: Hero1Icon` from `../icons/hero-1`
- **image-composition-block:** `icon: ImageCompositionIcon` from `../icons/image-composition`
- **infogrid-2-block:** `icon: InfoGrid2Icon` from `../icons/info-grid-2`
- **infogrid-3-block:** `icon: InfoGrid3Icon` from `../icons/info-grid-3`
- **infogrid-4-block:** `icon: InfoGrid4Icon` from `../icons/info-grid-4`
- **card-scroll-block:** `icon: CardScrollIcon` from `../icons/card-scroll`
- **card-scroll-item-block:** `icon: CardScrollIcon` from `../icons/card-scroll`
- **footer-block:** `icon: ContainerIcon` from `../icons/container`
- **infogrid-block:** Already used `InfoGridIcon`; no change to registration.

### Icons index

- `src/icons/index.js` now exports: `Hero1Icon`, `ImageCompositionIcon`, `InfoGridIcon`, `InfoGrid2Icon`, `InfoGrid3Icon`, `InfoGrid4Icon`, `CardScrollIcon`, `ContainerIcon` (plus existing exports).

### File changes

- `adaire-blocks.php` – Version set to 1.2.4; rollback URL set to v1.2.3.alpha.
- `config/block-icon-mapping.json` – New/updated blockIconMap and newIconMap entries.
- `src/icons/index.js` – New exports for icon components.
- `src/hero-1-block/index.js` – Use Hero1Icon.
- `src/image-composition-block/index.js` – Use ImageCompositionIcon.
- `src/infogrid-2-block/index.js` – Use InfoGrid2Icon.
- `src/infogrid-3-block/index.js` – Use InfoGrid3Icon.
- `src/infogrid-4-block/index.js` – Use InfoGrid4Icon.
- `src/card-scroll-block/index.js` – Use CardScrollIcon.
- `src/card-scroll-item-block/index.js` – Use CardScrollIcon.
- `src/footer-block/index.js` – Use ContainerIcon.
- `scripts/generate-free-version.js` – Register "ADAIRE BLOCKS FREE" block category in generated plugin file.
- New: `misc/update-jsons/1.2.4.json`, `misc/releases/v1.2.4.md`, `misc/releases/v1.2.4-user-facing.md`, `misc/testing-notes/v1.2.4-testing.md`, `misc/docs/CHANGELOG-v1.2.4.md`.
- `readme.txt` – Stable tag and changelog updated for 1.2.4.

## Upgrade impact

- No breaking changes. No attribute or save format changes for any block.
- Users get the new icons and (on the free build) the new category automatically after updating.
- Free build: regenerate with `node scripts/generate-free-version.js` and rebuild to include the new category and icons.

## Backward compatibility

- All changes are additive. The only metadata change is the `icon` field in `block.json` (SVG string), which does not affect saved content or front-end output.

**Version:** 1.2.4
