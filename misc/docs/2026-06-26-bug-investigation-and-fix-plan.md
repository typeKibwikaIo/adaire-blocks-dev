# Adaire Blocks — Issue Investigation & Fix Plan

**Date:** 2026-06-26
**Scope:** the 16-item bug/enhancement list (plus a 17th, partially-received item) submitted this date. Every item below was checked against the actual current code (`block.json`, `edit.js`, `save.js`, `render.php`, `style.scss`) before writing this — nothing here is guessed from the bug titles alone. No code has been changed yet; this is the investigation + proposed priority order, as requested.

## Priority order (recommended)

| # | Item | Status in code | Effort |
|---|------|-----------------|--------|
| 17 | CTA border-radius "doesn't respond" (Header) | Root cause found (needs user's full report to confirm) | Small |
| 1 | Row width settings not working | Confirmed bug, CSS-only fix | Small |
| 8 | Feature Grid fixed-column layout | Confirmed — control just missing, data/CSS already there | Small |
| 13 | Old plugin can't be deleted | Not a code bug — hosting/file-permission issue | N/A (no code fix) |
| 11 | Footer accent color "not working" | No defect found in code | Verify live first |
| 5 / 7 | Feature Grid icon size / font color | No defect found in code | Verify live first |
| 12 | Footer missing tagline control | Confirmed missing, simple addition | Small |
| 6 | Feature Grid "hide titles" toggle | Confirmed missing, simple addition | Small |
| 15 | Hamburger menu — position control | Confirmed missing (rest of #15 already exists) | Small |
| 16 | Header WooCommerce cart / payment icons | Confirmed absent — new feature, existing pattern to copy | Medium |
| 9 | Unwanted spacing between blocks | Confirmed, mechanical across several blocks | Medium |
| 2 | Can't edit blocks nested in a Row | Plausible cause found, needs live confirmation | Medium |
| 14 | Buttons should inherit theme colors | Confirmed gap, needs a design decision first | Medium–Large |
| 3 | Row: flexible column count / row↔column nesting | Confirmed missing, new UI + logic | Large |
| 10 | Missing typography controls (font family, etc.) | Confirmed, plugin-wide architectural gap | Large |
| 4 | Feature Grid device-style inconsistency | Likely editor-UX confusion, not a frontend CSS bug | Verify live first |

---

## 17. Header CTA border-radius "doesn't respond" *(message was cut off — root cause is a strong hypothesis, not yet confirmed)*

The Header block has one shared `buttonShape` control (Square/Rounded/Pill) whose help text says it applies to "Sign In, Sign Up and CTA buttons." But the CTA also has its own independent `ctaBorderRadius` number attribute. In `style.scss`:

```
border-radius: var(--adaire-header-cta-radius, var(--adaire-header-action-radius, 999px));
```

The CTA checks its own override (`--adaire-header-cta-radius`) **first**, and only falls back to the shared shape value if that override was never touched. So once a user has ever moved the CTA's own border-radius slider — even once — the shared "Button shape" control silently stops affecting the CTA. That matches "border radius does not respond" exactly.

**Fix:** once we have the rest of the user's report, either remove the standalone CTA radius override in favor of the shared control, or make the Inspector clearly show "custom radius is overriding Button Shape" with a reset option.

## 1. Row width settings not working

`row-block/style.scss` sets `.adaire-row { width: 100%; }` unconditionally — there's no `&.alignwide` / `&.alignfull` / default-contained branching anywhere in the file, even though `block.json` declares a real `align` attribute (default `"wide"`). The attribute is never even read in `edit.js`/`save.js`. Whatever width option is picked, the CSS always renders full width.

**Fix:** add real width rules per alignment class (contained max-width by default, full bleed only for `alignfull`, etc.) — CSS-only change, no data model change needed.

## 8. Feature Grid (`infogrid-2-block`) fixed-column layout

`responsiveGridColumns` is a fully responsive attribute and is already read by both the editor preview and `save.js`/`style.scss`'s real per-breakpoint media queries — but `edit.js` never renders a control to *write* it. The column count is structurally stuck at the hardcoded default (3) because there's simply no UI for it yet, even though everything downstream already supports it.

**Fix:** add one Inspector control (a `RangeControl`/`SelectControl` per breakpoint, same pattern as the other `responsive*` controls already in this file). Small — the hard part (responsive data + CSS) is already built.

## 13. Old Adaire Blocks installs can't be deleted

Checked `adaire-blocks.php`, `includes/`, and `admin/` for anything that could block deletion — `register_uninstall_hook`, `register_deactivation_hook`, filesystem credential calls, `chmod`: zero matches anywhere. The plugin's own code never touches file permissions or hooks into deletion. "Deactivate" only flips a database option; "Delete" requires the web server to have write/delete permission on every file in the folder. The classic cause of "deactivatable but not deletable" is a leftover install whose files have the wrong ownership/permissions from a prior problematic upload — which lines up with this repo's own documented zip-permission history (the 0700-bits issue from 2026-06-18, now fixed for new builds).

**Recommendation:** this isn't a code fix. Check actual file permissions on the affected host for the stuck folder before writing any code.

## 11. Footer accent color / 5 & 7. Feature Grid icon size & font color

All three of these already look correctly wired end-to-end in the current code:

- Footer: `ColorPicker` → `accentColor` attribute → `render.php` sets `--footer-accent-color` → 21 separate consumers in `style.scss` (buttons, links, borders, hover states).
- Feature Grid icon size: `UnitControl` → `responsiveIconSize` → consumed in both the editor preview and real frontend media queries.
- Feature Grid title color: `PanelColorSettings`/`TypographySection` → `responsiveTitleColor` → same full pipeline.

No code-level defect was found for any of these three. Possible explanations: already fixed since the report was written, a caching artifact (common with "changed setting has no effect" reports), or the report is about a different, similarly-named block (`infogrid-block`, `infogrid-3-block`, `infogrid-4-block`, and `icon-box-block` all exist and look similar). **Recommend re-testing live on the current build before spending fix time here** — there's a real risk of "fixing" something that isn't broken.

## 12. Footer missing tagline control

Confirmed missing. The footer's brand column only has a `brandName` field — there's no `brandDescription`/tagline attribute anywhere in `block.json` or `edit.js`. The descriptive text visible in the block's static example/preview ("We create amazing digital experiences...") is just inserter-preview markup, not a real field.

**Fix:** add a `brandDescription` RichText attribute + control, same pattern as `brandName`. Small.

## 6. Feature Grid "hide titles" toggle

Confirmed missing. `showHeading` only controls the block's single H2 — there's no toggle anywhere for the per-item `h3` titles.

**Fix:** add a `hideItemTitles` boolean + conditional render in both `edit.js` and `save.js`. Small.

## 15. Hamburger menu

Most of this is already built: there are already three icon styles (Bars/Dots/Plus-X), plus border/border-color/border-radius controls. Confirmed missing: no `hamburgerPosition` (left/right) attribute exists anywhere — placement is hardcoded.

The reported "shape works in backend but not in preview" couldn't be confirmed from code — `edit.js` and `render.php` both compute the same CSS variable from `attributes.hamburgerBorderRadius` identically, and there's exactly one (non-conflicting) CSS rule consuming it. This needs a live side-by-side check (editor canvas vs. the actual Preview/live page) before a fix can be scoped.

**Fix:** add the position control (small). Hold the shape-preview bug until it's reproduced live.

## 16. Header WooCommerce cart / payment icons

Confirmed absent, not broken — there is zero reference to WooCommerce/cart/payment-icons anywhere in the Header block. This is new feature work, not a bug fix. The block already has an established pattern for icon rows (its existing social-icons feature) that a cart icon + payment-icons row can be modeled on, gated behind `class_exists('WooCommerce')`.

## 9. Unwanted spacing between blocks

Confirmed, and it's systemic rather than one bug. Checked `supports.spacing` across 10 blocks: `saas-hero-block`, `website-footer-block`, `header-block`, `about-us-block`, `timeline-block`, and `card-scroll-block` declare **no** spacing support at all, so WordPress's native margin/padding control is completely absent on them. Combined with each block's own hardcoded internal vertical padding, stacking a few of these "section" blocks on a page produces large gaps the user has no way to reduce.

**Fix:** add `supports.spacing: { margin: true, padding: true }` to the affected blocks — mechanical, but touches several files.

## 2. Can't edit blocks nested inside a Row

`row-block` and `column-block`'s actual `InnerBlocks` setup is clean — no overlay, no `pointer-events` rules, no click-interception, correct `templateLock: false` in both. Row > Column > Heading/Paragraph should be editable normally. The likely explanation: Row restricts direct children to `adaire/column-block` only — if a Heading/Paragraph ever lands as a *direct* child of Row (e.g. via drag-and-drop bypassing that restriction), that's invalid nesting and would explain exactly the reported symptom (must drag out to edit, drag back in).

**Recommend confirming live** (try to reproduce by dragging a block directly into a Row, not into one of its Columns) before fixing. If confirmed, the fix is likely either hardening Row to reject/auto-wrap non-Column children, or auditing existing content for already-broken nesting.

## 14. Buttons should inherit theme colors

Confirmed gap. `button-block` declares no `supports.color` at all, and its background defaults to `'transparent'` with zero connection to any site color palette or primary/secondary concept — every button currently requires the user to manually pick a color from scratch.

**This needs a design decision before coding:** where should "theme color" come from — the site's actual `theme.json` palette via `useSetting('color.palette')`, or a plugin-wide primary/secondary setting independent of the active theme? Worth a quick decision before scoping the build.

## 3. Row: flexible column count / row↔column nesting

Confirmed missing — and it's a real feature request, not a bug. `row-block/edit.js` has **zero** `InspectorControls` at all; column count is only ever set once via a fixed preset at insertion time, with no add/remove-column UI afterward (the footer block already has an `addColumn`/`removeColumn` pattern that could be a model). Nesting a Row inside a Column is already structurally possible today (Column has no `allowedBlocks` restriction), so that part may just need confirming/exposing rather than building from scratch.

## 10. Missing typography controls

Confirmed, and this is the largest item on the list — a real architectural gap, not a quick fix. Font Family has **zero implementations anywhere** checked in the plugin (not just missing controls — the capability doesn't exist in any block sampled). Font size/weight/line-height/letter-spacing/text-transform exist as a full pattern (`TypographySection`) only in `infogrid-2-block`, partially in `website-footer-block` and `header-block`, and are entirely absent in `saas-hero-block`, `about-us-block`, `timeline-block`. `saas-hero-block` additionally has three hardcoded `text-transform: uppercase` rules with no override at all — directly matching "text fixed to capital letters."

**Fix:** the pattern to copy already exists (`TypographySection`); this is rolling it out to the remaining blocks plus building Font Family support from scratch. Should be scoped as its own multi-block project, not folded into a quick patch.

## 4. Feature Grid device-style inconsistency

The block's own internal 5-breakpoint device switcher (Mobile/Tablet/Small Laptop/Desktop/Big Desktop) is completely independent of WordPress's own top-toolbar resize-preview buttons — switching WP's preview width does not change which of this block's own breakpoints is being displayed; only this block's own device buttons do. That alone could produce the reported "switching device views shows wrong styling" experience without there being an actual CSS bug. The real frontend `@media` CSS looked correctly wired with proper desktop fallback for every property checked.

**Recommend live verification first** — specifically whether "text disappears" / "content becomes blurry" reproduce on the actual published page (real bug) or only inside the editor's device-preview (most likely an editor-UX/expectation issue, not a frontend defect).
