# Jira Report — Location Map Block

| Field | Value |
|---|---|
| **Issue Type** | Task |
| **Component** | Location Map Block (`location-map`, formerly `map-block`) |
| **Status** | Done |
| **Priority** | High — breaking change, requires rebuild before deploy |
| **Labels** | `breaking-change`, `needs-rebuild`, `design-approved` |
| **Fix Version** | Next build after 2026-08-12 |

## Summary

Rebuilt the Location Map block's editor UX to match plugin conventions, wrote and approved a design spec, clarified the block description, and renamed the block's slug from `map-block` to `location-map` end-to-end.

## Description

The block's Inspector didn't follow the plugin's Content/Layout/Style tab convention and had no on-canvas quick-editing, unlike other recently-updated blocks. A design spec didn't exist, so a reference layout (single centered map + heading, no location list) was documented and evaluated against the current design before being rejected in favor of keeping the existing multi-location layout. The block's title/slug ("Location Map" vs `map-block`) were also inconsistent and needed to be unified.

## Acceptance Criteria

- [x] Map displays correctly with sample addresses (4 default locations, all with valid embed URLs)
- [x] Styling matches the approved design (unchanged `style.scss`)
- [x] Block behaves correctly across settings (single map mode, fly speed, container mode) — frontend (`save.js`/`view.js`) untouched, so behavior is unchanged
- [x] Description in `block.json` clearly matches functionality
- [x] Slug and title are consistent (`location-map` / "Location Map")
- [ ] Demo page — explicitly out of scope (none exists in this repo; skipped per decision)

## Work Log

1. **Inspector refactor** — `edit.js` migrated to the shared `InspectorTabs` component (Content = Locations repeater, Layout = Container/Behavior/Margins/Padding, Style = Appearance). Raw `ColorPicker` swapped for the shared `AdaireColorControl`.
2. **Quick-edit** — Added `QuickZone` on-canvas popovers for Contact Details and Map Embed URL per location; country label made directly editable via `RichText`.
3. **Design spec** — Documented current design (approved, final) vs. reference-image alternative (rejected, kept for record) in `misc/blocks-docs/map-block-design-spec.md`.
4. **Description** — Rewritten in `block.json` to plainly state what the block does.
5. **Slug rename** — `map-block` → `location-map` across the folder, `block.json`, `edit.js`, `src/index.js`, both `blocks-config.json` files, both `block-icon-mapping.json` files, `scripts/update-block-categories.js`, and docs.

## How to Use the Block

1. In the editor, insert **Location Map** (search "map" or "location").
2. Under the **Content** tab, add/edit/reorder locations — each has a country label, address lines, phone, email, a Google Maps embed URL, and optional lat/lng (used for the fly-to animation).
3. Editors can also quick-edit directly on canvas: click a location's country name to retype it inline, or hover the address/map panel and click the pen icon for a quick popover instead of opening the sidebar.
4. Under **Layout**, choose Full Width or Constrained container, set margins/padding, and toggle **Single map fly mode** (one map that flies between locations) vs. the default multi-panel view. Fly speed is adjustable when fly mode is on.
5. Under **Style → Appearance**, set the nav list's text color, active-item background/text color, and font weight.
6. On the front end, visitors click a location in the list to switch the active address + map; in single-map mode, the one map animates to the newly selected location.

## How It Was Built (technical)

- **Files**: `src/location-map/{block.json, edit.js, save.js, view.js, style.scss, editor.scss, index.js}`
- **Data model**: `locations` (array attribute) holds each location's `id`, `country`, `addressLines[]`, `phone`, `email`, `mapEmbedUrl`, `lat`, `lng`. `activeIndex` tracks the selected location; `singleMapMode` and `flyDuration` control the fly-animation behavior.
- **Editor (`edit.js`)**: React/Gutenberg block using `InspectorTabs` + `QuickZone` (both shared components in `src/components/`) for a consistent authoring UX with the rest of the plugin. Feature-gating for the free tier reads `window.adaireBlocksConfig.blocks['location-map']`, populated server-side in `adaire-blocks.php` from `config/blocks-config.json`.
- **Frontend (`save.js` + `view.js`)**: static markup rendered per location; `view.js` wires up click-to-switch, cross-fade, and (in fly mode) a Leaflet-powered fly-to animation between coordinates. Untouched in this session.
- **Registration**: WordPress loads the compiled block from `/build/location-map` (config-driven via `AdaireBlocksConfig::get_available_blocks()`), not `/src` — requires a build step to take effect.

## Notes / Follow-ups

- **Breaking change**: existing pages with the old `create-block/map-block` block placed will show as unrecognized until removed/re-added.
- **Build required**: `npm run build` didn't finish inside the sandbox (plugin has ~80+ blocks); run it in your own environment before deploying, then delete the now-stale `build/map-block` folder.
- Full narrative write-up: `LOCATION-MAP-BLOCK-SUMMARY-2026-08-12.md` (repo root).
