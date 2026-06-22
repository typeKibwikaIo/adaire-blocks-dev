# Work Report — June 19, 2026

## QuickZone interaction behavior

Changed the shared `QuickZone` component (`src/components/QuickZone.js`) so the inline quick-edit popover opens only on a pen-icon click, not on hover. Hover now just cancels any pending close timer, so the popover stays open if the cursor moves back in during the grace period.

## Bug fixes

Three separate root causes were found and fixed under the single complaint about popovers "breaking" and opening randomly:

**Footer block (`src/website-footer-block/edit.js`)** — nav, social, and button items inside footer columns reused plain item ids (e.g. `1`, `2`, `3`) that collided across different columns in the default content. Editing one column's item was opening an unrelated item in another column because both resolved to the same QuickZone id. Fixed by prefixing all three id strings with the parent column's id (`footer-navitem-${column.id}-${item.id}`, and the equivalent for social and button items).

**Timeline block (`src/timeline-block/edit.js`)** — the QuickZone call site used a nonexistent prop API (`isActive` / `onActivate` / `onDeactivate`) instead of the real one (`id` / `activeZone` / `setActiveZone` / `content`). Because the real component computes `isOpen = activeZone === id`, and both were `undefined`, every milestone's popover rendered open at once, and clicking would throw since `setActiveZone` was never actually passed in. Rewrote the call site to the correct API.

**QuickZone.js defensive guard** — added `isOpen = !!id && activeZone === id` so any future caller that omits `id` can't trigger the same `undefined === undefined` failure mode again.

## Popover positioning

The popover previously positioned itself based on where it sat in the render tree rather than next to the pen icon, so it could appear far from the trigger on tall sections. Added a `triggerRef` on the pen button and pass it to `<Popover anchor={triggerRef.current} placement="left-start" offset={8} shift />`, so the popover now always opens directly next to the pen.

## Verification

All edits were re-read after the change to confirm balanced JSX and correct hook usage in `QuickZone.js`, `timeline-block/edit.js`, and the three id sites in `website-footer-block/edit.js`. Also audited every other block using QuickZone inside a `.map()` loop (`infogrid-block`, `infogrid-2-block`, `pricing-table-block`, `pricing-comparison-block`, `header-block`) for the same id-collision pattern — none were affected, since each already used either flat unique ids or loop indexes.

## In progress

Started auditing footer social-icon styling per a follow-up request. Found that the per-column "social" column type already has full styling and hover controls (size, color, background, hover color/background, border, border radius, spacing, transition), but the top-bar `socialLinks` and bottom-bar `socialIcons` sections only expose platform/URL/visibility — no dedicated icon color, background, hover, size, border, or spacing controls. This work is not yet implemented.
