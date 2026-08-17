# Location Map Block Changes — 2026-08-12

This summarizes everything done in this session on the block now called **Location Map** (`src/location-map`, formerly `map-block`).

## What was wrong

Three separate requests came in over the course of the session:

1. The block's Inspector sidebar used a flat stack of six panels instead of the plugin's standard "Content / Layout / Style" tabbed convention, and had no on-canvas quick-editing — every other recently-updated block in the plugin had both.
2. There was no written design spec for the block, and its `block.json` description didn't clearly explain what the block does. A reference screenshot ("Google Maps Road Map Layout" — a single centered map with heading/subheading, no location list) was floated as a possible alternative design and needed to be evaluated against the block's current design.
3. The block's title ("Location Map", later briefly "Map Block") didn't match its internal slug (`map-block`), and the wording was inconsistent.

## What was changed

**Inspector & editor UX.** `edit.js` was restructured to use the shared `InspectorTabs` component: the Locations repeater is now tagged `section="content"`; Container Settings, Behavior (single-map fly mode, fly speed), Margins, and Padding are tagged `section="layout"`; Appearance (nav colors, font weight) is tagged `section="style"`. The three raw `ColorPicker` fields in Appearance were swapped for the shared `AdaireColorControl` (palette + custom picker), matching every other block. On-canvas `QuickZone` pen-icon popovers were added: the location list's country label is now directly editable via `RichText`, each address panel got a "Contact Details" QuickZone (address lines, phone, email), and each map panel got a "Map Embed" QuickZone (embed URL) — for both single-map mode and the normal multi-location view. A small `editor.scss` rule was added so the QuickZone wrapper doesn't collapse the absolutely-positioned map iframe in the editor canvas.

**Design spec & description.** A design spec (`misc/blocks-docs/map-block-design-spec.md`) was written documenting the block's appearance, styling, and behavior in detail, alongside the reference-image layout as an alternative. The current multi-location tabbed design was reviewed and approved as final; the reference-image layout is kept in the doc only as a rejected alternative, not built. `block.json`'s `description` was rewritten to plainly state what the block does (multi-location interactive map with fly-to navigation, or a single map, with customizable colors/spacing).

**Slug rename.** The block's internal identifier was renamed end-to-end from `map-block` to `location-map`, and the title was set to "Location Map":
- Folder: `src/map-block` → `src/location-map`
- `block.json`: `name` → `create-block/location-map`, `title` → `Location Map`
- `edit.js`: both feature-gating lookups (`window.adaireBlocksConfig?.blocks?.['map-block']`) → `['location-map']`
- `src/index.js`: import path updated
- Config: `config/blocks-config.json`, `config/block-icon-mapping.json`, and their `free-version-scaffold/config/` counterparts — every key keyed on `map-block` renamed
- `scripts/update-block-categories.js` category mapping key renamed
- Docs updated to match: `BLOCKS-CATEGORIZATION.md`, `COMPLETE_BLOCK_DOCUMENTATION.md`, `misc/categorization.md`, the design spec

`misc/releases/v1.1.7.md` (a historical changelog entry) was deliberately left untouched, since it's a record of a past release, not current documentation.

## Verification

Every JSON file touched (`block.json`, both `blocks-config.json`, both `block-icon-mapping.json`) was checked for valid JSON. `edit.js`, `save.js`, `index.js`, and `src/index.js` were all checked with Babel's own parser to confirm no syntax errors. The four default sample locations (Namibia, Switzerland, UK, Ghana) were confirmed to each have a valid `mapEmbedUrl`, so the map renders out of the box. `save.js` and `view.js` (frontend rendering/behavior) were intentionally left untouched, so `singleMapMode`, `flyDuration`, and container settings all still behave exactly as before. A final repo-wide search confirmed no remaining functional references to the old `map-block` key anywhere outside of historical/doc files.

## What still needs to happen on your end

**This is a breaking change.** Any page that already has this block placed will show as an "unrecognized block" until it's removed and re-added, since WordPress matches blocks by their internal name and `create-block/map-block` no longer exists.

**A rebuild is required.** WordPress registers this block from the compiled `/build/location-map` folder, not `/src`. A full `npm run build` was attempted in this session but the plugin's full build (~80+ blocks) is too large to finish inside the sandbox's time limit, so it didn't complete. You'll need to run `npm run build` (or your normal CI/deploy build) before this takes effect live. The old `build/map-block` folder is now stale and can be deleted once the new build succeeds and `build/location-map` exists.

No demo page work was done — none exists in this repo for any block, and you asked to skip creating one.
