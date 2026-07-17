# Inspector Controls Reorg — Free-Tier Blocks

Summary of the Inspector Controls standardization work completed across the plugin's
free-tier blocks. Covers the shared `InspectorTabs` component, the shared responsive
`DeviceSwitcher` component, removal of the `smartwatch` breakpoint tier, and cleanup
of duplicate/misplaced Advanced-tab content.

**Scope (free blocks only):** accordion-block, animation-scroll-block, button-block,
container-block, content-toggle-block, content-toggle-panel-block, hero-1-block,
icon-box-block, image-composition-block, infogrid-2-block, posts-carousel-block,
posts-grid-block, pricing-table-block, row-block, social-banner-block,
social-share-block, tab-panel-block, tabs-block, testimonial-block, timeline-block,
video-player-block.

(`content-toggle-panel-block` and `tab-panel-block` were deliberately left untouched
throughout — they're inner-block-only, no top-level Inspector tabs.)

---

## 1. Shared `InspectorTabs` component (`src/components/InspectorTabs.js`)

### Panel classification
Replaced ad hoc/keyword-guessed panel placement with an explicit `section` prop on
each `PanelBody` passed into `<InspectorTabs>`:

```jsx
<PanelBody section="content" title="Testimonials">…</PanelBody>
<PanelBody section="layout"  title="Container Settings">…</PanelBody>
<PanelBody section="style" priority="high" title="Typography">…</PanelBody>
```

`section` is one of `"content" | "layout" | "style"`. `priority` (`"high" | "medium"`)
further orders panels within the Style tab. Panels with no `section` prop still fall
back to a legacy keyword classifier (style vs. layout only — content is never
guessed), preserving behavior for any block outside this reorg.

All 21 in-scope blocks were audited and tagged; `row-block` was additionally migrated
off raw `InspectorControls` onto `InspectorTabs` entirely (it previously had no
tabbed UI at all).

### Advanced tab — removed entirely
The sidebar now has **three tabs: Content, Layout, Style.** The Advanced tab and all
of its supporting code were removed:

- Deleted the shared "builtin" Advanced panel (auto-injected CSS ID, Additional CSS
  Classes, Margin, Padding, Z-Index controls). Confirmed dead/redundant first:
  - No block declares `AdaireBlocksMargin` / `AdaireBlocksPadding`.
  - Z-Index was already handled per-block where it mattered (button-block).
  - CSS ID / CSS Classes duplicated **WordPress core's own native "Advanced" panel**
    (HTML Anchor / Additional CSS Class(es)), which auto-renders below every block's
    `InspectorControls` for any block with `supports.anchor` /
    `supports.customClassName` — regardless of which custom tab is active. That's
    the actual mechanism, not a rendering bug in `InspectorTabs.js`.
  - This native WordPress panel is unaffected and still there for every block —
    only our own duplicate copy was removed.
- Removed the `advanced` entry from the tab strip, the `AdvancedIcon`, the
  `advancedChildren` partitioning logic, and `'advanced'` from `VALID_SECTIONS`.
  Removed the now-dead `.adaire-inspector-tabs__panel--advanced` and
  `.adaire-inspector-adv-label` CSS hooks.
- **"Block Id" fields** (real functional attributes, not decorative — used for
  `data-block-id` / CSS targeting) that used to live in an Advanced-tab "Block
  Settings" panel were relocated, not deleted, to the **bottom of each block's
  Content tab**:

  | Block | Where Block Id now lives |
  |---|---|
  | `button-block` | End of "Button Settings" (its only Content panel), followed by its Z-Index `RangeControl` (also relocated from the old Advanced panel) |
  | `hero-1-block` | End of "Media (Image/Video)" (its last Content panel) |
  | `testimonial-block` | End of "Testimonials" (its only Content panel) |

  All other in-scope blocks only ever used `blockId` internally (auto-generated on
  mount for `data-block-id` targeting) with no UI field — nothing to move.

---

## 2. Shared `DeviceSwitcher` component (`src/components/DeviceSwitcher.js`)

Confirmed the one shared responsive-tier switcher (desktop/tablet/mobile[/smartwatch])
is used consistently instead of ad hoc per-block switcher UI. Found and fixed several
leftover hand-rolled switchers that predated the shared component:

- `social-banner-block` — inline `ButtonGroup` switcher → `DeviceSwitcher`.
- `testimonial-block` — leftover duplicate inline switcher → `DeviceSwitcher`.
- `posts-carousel-block` — inline `TabPanel`-based switcher → `DeviceSwitcher`.
- `pricing-table-block` — 11 always-visible Desktop/Tablet/Mobile field triples
  collapsed into single controls driven by `DeviceSwitcher`.

Added a new `THREE_TIERS` export (desktop/tablet/mobile, no smartwatch) alongside the
existing `DEFAULT_TIERS` (which still includes smartwatch and is left untouched,
since several **premium/out-of-scope** blocks still rely on it — see §3).

---

## 3. Removed the `smartwatch` breakpoint tier

Removed entirely from the 8 free-tier blocks that had real (non-dead) smartwatch
usage — `block.json` attribute schemas, `edit.js`/`save.js` CSS-var generation,
`style.scss`/`editor.scss` `@media (max-width: 320px)` rules, and any
`DeviceSwitcher` tier lists:

- **accordion-block, button-block, image-composition-block, tabs-block,
  testimonial-block, video-player-block** — full removal across attributes, JS, and
  CSS.
- **hero-1-block, icon-box-block** — dead-schema-only cleanup (smartwatch existed in
  `block.json` defaults but was never read by `edit.js`/`save.js`).
- **tabs-block/transforms.js** — dropped `smartwatch` from the legacy
  content-toggle→tabs migration helper.
- **pricing-table-block** — no literal `smartwatch` in its own files, but its
  `DeviceSwitcher` calls had no `tiers` prop and were silently inheriting the
  4-tier default, producing a phantom "Watch" tab with no backing attribute. Fixed
  by passing `tiers={THREE_TIERS}` explicitly.

**Left untouched, on purpose:**
- `src/responsive-system.js` / `.scss` and `get-started-tour.js` — a separate,
  editor-wide device-preview system (global toolbar + generic per-block "Responsive
  View/Visibility/Properties" panels) that applies to **every** block in the plugin
  via a `create-block/` / `adaire/` name-prefix filter, including premium blocks.
  Confirmed several premium blocks (counter, gallery, portfolio, progress, services,
  swiper-carousel, video-carousel) still consume it — removing smartwatch there would
  have silently broken their UI.
- `DeviceSwitcher.js`'s `DEFAULT_TIERS` — same reasoning; several premium blocks call
  `<DeviceSwitcher>` without a custom `tiers` prop and rely on the 4-tier default.
- Existing `deprecated.js` snapshots (button/tabs/testimonial-block) — frozen
  `save()` output for unrelated prior changes (theme-color inheritance, typography
  additions), not something this pass added; left as historical snapshots.
- Bootstrap icon named "Smartwatch" in `icon-box-block` / `social-banner-block`'s
  icon pickers — unrelated false positive, not a responsive tier.

---

## 4. Verified in the live editor

Confirmed via a running Local WP instance (Playwright) that WordPress's native
Advanced panel (HTML Anchor / Additional CSS Class(es)) is untouched and still
functions independently of these changes, and that the custom tab strip renders
Content / Layout / Style only.

---

## Net result

- Every in-scope block's Inspector sidebar has exactly three tabs: **Content,
  Layout, Style** — no duplicate "Advanced" accordion, no leftover empty panels.
- No saved markup, attribute values, or `block.json` schemas changed except the
  explicitly-scoped `smartwatch` removal (pre-launch, no live content to migrate)
  and the `customClassName`/`anchor` support additions confirmed earlier in this
  effort (button-block, testimonial-block, row-block).
- All responsive tiers across the 8 cleaned-up blocks now correctly cascade
  desktop → tablet → mobile, with mobile as the smallest tier.

