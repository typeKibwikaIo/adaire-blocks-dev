# Map Block — Design Specification

**Status: Approved.** Design 1 (Multi-Location Tabbed Map) is the finalized design for `src/map-block`. Design 2 is kept below for reference only — it was evaluated against a "Google Maps Road Map Layout" screenshot and not selected; no code was built for it.

---

## Design 1 — Multi-Location Tabbed Map (approved, final)

### Appearance
- A rounded card (24px radius) split into three columns: a location list, an address panel, and the map.
- Grid: `280px | 1fr | 1.2fr` on desktop, `220px | 1fr | 1fr` on tablet, single column (stacked, map last) on mobile.
- Each location in the list is a clickable row; the active row gets a solid background, a color change, and a small triangular pointer on its right edge nudging toward the map.
- The address panel next to it shows the selected location's title, address lines, phone, and email.
- The map itself is a Google Maps iframe embed that cross-fades/slides in when a new location is selected.

### Styling
| Property | Value |
|---|---|
| Card radius | 24px |
| Card shadow | `0 1px 3px rgba(0,0,0,0.06)` |
| Locations panel background | `#f7f7f8` |
| Locations panel border | `1px solid #eee` |
| Nav text color (inactive) | `#333333` (`navTextColor`) |
| Nav active background | `#d52d3a` (`navActiveBgColor`) |
| Nav active text | `#ffffff` (`navActiveTextColor`) |
| Nav font weight | `600` (`navFontWeight`, options 300–700) |
| Map min-height | 360px (320px on mobile) |
| Fly/transition duration | 0.9s (`flyDuration`, range 0.2–3s) |

Container supports full-width or constrained (max-width 1200px desktop) modes, plus per-device margin/padding — all standard block controls already in `block.json`.

### Behavior
- Clicking a location tab swaps the active `activeIndex`, cross-fades the address panel, and slides/fades the map iframe to the new location's `mapEmbedUrl`.
- `singleMapMode` toggle hides the location list entirely and shows one map + one address block (no tabs).
- Default sample data ships with 4 locations (Namibia, Switzerland, UK, Ghana) — fully editable via the block inspector.
- Responsive: side-by-side on desktop, list-above-map on tablet, fully stacked on mobile.
- Keyboard-accessible tabs (Tab + Enter/Space).

**Best for:** businesses with multiple branches/offices that want an address directory alongside the map.

### Editor UX (finalized)
- Inspector uses the standard Adaire Blocks **Content / Layout / Style** tabs (`InspectorTabs`), matching every other block in the plugin:
  - **Content** — the Locations repeater (add/remove/reorder locations, address lines, phone, email, embed URL, lat/lng).
  - **Layout** — Container Settings, Behavior (single map fly mode, fly speed), Margins, Padding.
  - **Style → Appearance** — nav text/active colors (via the shared `AdaireColorControl` palette) and nav font weight.
- On-canvas **QuickZone** quick-editing (pen-icon popovers) lets editors update content without opening the sidebar:
  - Country label is directly editable (`RichText`) in the location list.
  - Each address panel has a "Contact Details" QuickZone (address lines, phone, email).
  - Each map panel has a "Map Embed" QuickZone (embed URL).

---

## Design 2 — Single Road Map Layout (reference only, not selected)

### Appearance
- Full-bleed colored section (solid brand-blue background with a faint world-map silhouette texture behind everything).
- Centered white heading ("Google Maps Road Map Layout" style) with a shorter centered subheading/description paragraph beneath it, max-width constrained so it doesn't span edge-to-edge.
- Below the text: a single large map embed in a white-bordered, rounded-corner, drop-shadowed card, centered and constrained (not full-bleed like the background).
- Standard Google Maps chrome is visible and functional: "Map / Satellite" toggle tab (top-left), fullscreen icon (top-right), Street View pegman + compass/zoom controls (right side), one red location pin with a small info card ("New York, NY, USA" + close ✕), and the standard Google attribution row (logo, keyboard shortcuts, map data credit, terms) along the bottom edge.
- No location list, no tabs, no address/contact panel — this design is map + heading only.

### Styling
| Property | Suggested value |
|---|---|
| Section background | Solid brand color (blue in reference), optional subtle world-map/pattern overlay |
| Heading | Large, bold, centered, white/light text for contrast on colored background |
| Subheading | Regular weight, centered, muted/light color, ~500–650px max-width |
| Map card radius | ~8–12px |
| Map card border | Thin light border (`1–2px`, near-white) |
| Map card shadow | Soft drop shadow to lift it off the background |
| Map card max-width | Constrained (e.g. 1200–1400px), centered |
| Map height | Fixed height (e.g. 480–560px desktop), scales down on smaller screens |
| Section padding | Generous vertical padding (top/bottom) around heading + map |

### Behavior
- Single fixed location — no navigation/switching, since there's only one map instance.
- All interaction is native to the embedded Google Map itself: pan, zoom (+/−), Map/Satellite toggle, fullscreen, Street View, and clicking the pin to open/close the info card — no custom JS needed beyond loading the embed.
- Heading and subheading text editable via RichText, same as any other heading block.
- Responsive: heading/subheading font-size and map card height scale down on tablet/mobile; map stays edge-padded so it never touches the viewport edge.
- No fly-to animation or location-switching logic required (simpler `view.js`, or none at all if using a plain iframe).

**Best for:** a single-location business wanting a clean, visual "find us" section rather than a directory.

---

## Approval

Design 1 is approved and is the block's final design — no rebuild needed. Design 2 remains documented above purely as a rejected alternative, in case a single-location layout is requested as a **separate** block in the future.

Block metadata has been updated to match:
- **Title:** `Location Map` — drops the generic "Block" wording in favor of a name that describes what it actually shows.
- **Description:** rewritten to describe the approved multi-location behavior (see block.json).
- **Internal slug:** renamed end-to-end from `map-block` to `location-map` — folder is now `src/location-map`, block.json `name` is `create-block/location-map`, and every config key that referenced `map-block` (feature-gating config, icon mapping, category mapping) now reads `location-map`. This is a breaking change for any site that already had this block placed — see the top-level rename note for the full file list and required rebuild step.
