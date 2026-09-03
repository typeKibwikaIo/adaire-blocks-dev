# Inspector Controls Reorg — Free-Tier Blocks

**Sections 1–4 shipped in 1.3.0. Sections 5–6 shipped in 1.3.2.**
The rules this log implements are specified in `AGENTS/BLOCK_SETTINGS_SPEC.md`;
user-facing summaries are in the `readme.txt` changelog, and `AGENTS/VERSIONING.md`
covers how releases are numbered and which files have to agree.

Summary of the Inspector Controls standardization work completed across the plugin's
free-tier blocks. Covers the shared `InspectorTabs` component, the shared responsive
`DeviceSwitcher` component, removal of the `smartwatch` breakpoint tier, and cleanup
of duplicate/misplaced Advanced-tab content.

**Scope (free blocks only):** accordion-block, animation-scroll-block, button-block,
container-block, content-toggle-block, content-toggle-panel-block, hero-1-block,
icon-box-block, image-composition-block, feature-grid-free, posts-carousel-block,
posts-grid-block, pricing-table-block, row-block, social-banner-block,
social-share-block, tab-panel-block, tabs-block, testimonial-block, timeline-block,
video-player-block.

(`content-toggle-panel-block` and `tab-panel-block` were deliberately left untouched
throughout — they're inner-block-only, no top-level Inspector tabs.)

---

## 1. Shared `InspectorTabs` component (`src/components/InspectorTabs.js`) (1.3.0)

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

## 2. Shared `DeviceSwitcher` component (`src/components/DeviceSwitcher.js`) (1.3.0)

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

## 3. Removed the `smartwatch` breakpoint tier (1.3.0)

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


---

## 5. Follow-up: settings unified against BLOCK_SETTINGS_SPEC.md (1.3.2)

The pass above put every in-scope block on a three-tab sidebar, but it only
decided *which tab* a panel sat in. It did not settle what a panel is called,
what order panels appear in, or which tab owns a given kind of setting — so
spacing was Style in one block and Layout in another, and the same control was
"Device Preview", "Device View" or "Breakpoint" depending on where you clicked.

`AGENTS/BLOCK_SETTINGS_SPEC.md` now rules on all three. This follow-up applies it
to the five live blocks in the hero / button / feature-grid families.

### New shared code

- **`src/components/inspector-vocabulary.js`** — canonical panel titles (`PANEL`),
  recurring control labels (`LABEL`), declared within-tab order (`PANEL_ORDER`),
  and the Style-tab priority group for each Style panel (`STYLE_PRIORITY`).
- **`BreakpointNote`** (exported from `DeviceSwitcher.js`) — the one way a panel
  states which breakpoint its controls edit. Replaces three competing idioms: a
  bold "Current Breakpoint: Desktop" paragraph, a grey "Configuring: Desktop"
  hint, and device names baked into labels (`Button Padding (Desktop)`).

### `InspectorTabs.js` changes

- Sorts each tab's panels by `PANEL_ORDER` instead of trusting authoring order.
- Reads a Style panel's priority group from `STYLE_PRIORITY` when the panel
  doesn't pass `priority` explicitly.
- **Hides a tab with no panels** rather than rendering the "This block has no …"
  placeholder, per spec §8. `.adaire-inspector-empty` removed from the SCSS.
- Renamed the medium Style group from "Effects & Spacing" to **"Effects"** —
  spacing is a Layout setting now, so nothing spacing-related lands there.

### Per-block moves

| Block | What moved |
|---|---|
| `saas-hero-block` | Was fully untagged and relied on the keyword classifier, which put "Headline" in Style and left the **Content tab empty**. Now explicitly tagged: pill/CTA/badge text → Content, media asset → Content, decoration *toggles* → Layout, decoration *colours* → Style. |
| `hero-banner-block` | 14 panels rebuilt into the canonical set. `Container Layout` split across Structure / Alignment / Dimensions; `Container Spacing` and all margins → Layout; the four colour controls split out of `Typography` into `Colors`; media border radius → Style, media sizes → Layout. |
| `button-block` | `Spacing` (padding/margin) Style → Layout. `Button Variant` Layout → Style as `Variant` (it only swaps CSS). `Icon Settings` split: asset → Content, visibility and position → Layout. Z-Index Content → Layout. `Border & Effects` split into `Border` and `Effects`. |
| `feature-grid-free` | `Container Spacing` and `Item Padding` → Layout. Text alignment → Layout `Alignment`. `Item Styles` reduced to Style, split into `Colors` and `Border`. **Added missing Columns and Gap controls** — see below. |
| `infogrid-block` | Was untagged, with a hand-rolled device toggle rendered as a bare `<div>` child. Now uses the shared `DeviceSwitcher` in a `Responsive` panel; item padding, gap, block padding and margin → Layout `Spacing`; container sizing → Layout `Dimensions`. |

### One functional fix

`feature-grid-free` read `responsiveGridColumns` and `responsiveGridGap` when
generating its grid CSS, but exposed **no controls for either** — the values were
always whatever `block.json` defaulted to. Feature Grid (Pro) has always offered
both. Added `Columns` and `Gap` to the free block's Layout > Structure panel,
writing the attributes that were already wired up.

### Deliberately unchanged

- `src/hero-1-block` and `src/infogrid-3-block` — both `inserter: false`,
  back-compat registrations for content saved before a rename. They can't be
  inserted, so nobody learns their sidebar.
- Saved markup, attribute names, ranges, option lists and help text. Controls
  were lifted verbatim between panels; a before/after diff of hero-banner's
  control labels is identical at 64 controls.
- Global spacing / global style consolidation (spec §5) — still an open item
  pending a design decision on where it lives.

---

## 6. Corrections after review (1.3.2)

Four issues found on the first pass through the unified sidebars.

### Spacing and Effects were the wrong way round

Padding, margin and gap are **Style**, not Layout: they are CSS applied to elements
that already exist — nothing is added, removed or reordered. Layout owns the
*arrangement* (how many columns, in what order, aligned how, at what size); spacing
is the trim applied once that arrangement is settled.

Effects are **Layout**, not Style: the hover treatments blocks offer here — scale,
bounce, shake, slide-underline — displace the element relative to its neighbours,
which is the Layout test. An effect that only repaints (colour transition, glow,
blur, fade) stays in Style.

Applied to all five blocks, plus `PANEL_ORDER` / `STYLE_PRIORITY` in
`inspector-vocabulary.js` and spec §3, §4 and §6.5, which said the opposite.

### Two tab strips, not one

Any block declaring a style-generating `supports` entry (`spacing`, `color`,
`typography`, `border`…) gets a tab strip **from WordPress** — "Settings | Styles"
— with the plugin's own three tabs nested inside the Settings half. Two tabs, one
holding three more.

`blockInspectorTabs` is core's own switch for this (`getShowTabs()` /
`useInspectorControlsTabs()` in `wp-includes/js/dist/block-editor.js`). Keyed false
for a block name, core renders its inspector fills in a single column with no tab
strip. Filtered in both `adaire-blocks.php` and `free-version-scaffold/adaire-blocks.php`
for every `create-block/` and `adaire/` block. Core's tab *chrome* is hidden;
nothing is unregistered, no control is removed, other plugins' blocks are untouched.

Eight blocks plugin-wide declared such a `supports` entry: about-us, card-scroll,
column, feature-grid-free, gallery, mega-menu-item, row, saas-hero.

### Redundant `supports.spacing` on two blocks

The filter hides the extra tab but not the duplicate panel under it, so for the two
in-scope blocks the redundant support was removed outright:

- **`feature-grid-free`** already had responsive padding, and `responsiveMargin` was
  generating margin CSS but **had no control** — so the only way to set a block
  margin was WordPress's non-responsive Dimensions panel, writing a different
  attribute. Dropped `supports.spacing`, added the missing per-breakpoint `Margin`
  control to Style > Spacing.
- **`saas-hero-block`** had its own section padding but no margin. Dropped
  `supports.spacing`, added a `margin` attribute, its four CSS vars in `shared.js`,
  the rule in `style.scss`, and a `Margin` BoxControl — so the capability moves into
  the plugin's own panel rather than disappearing.

### Rating badges were a dead feature

`showRatingBadges`, `ratingBadgesAlignment` and `ratingBadges` were read by
`edit.js` and `save.js` but **declared nowhere in `block.json`**. Undeclared
attributes are dropped when the block is parsed, so nothing the user set survived a
reload and the badges never rendered.

All three are now declared, with `ratingBadges` seeded with two placeholder entries.
`showRatingBadges` defaults to `false` — matching the effective behaviour of every
saved block to date, so no existing content invalidates.

Separately, the Content panel for the badges (and for the hero image) was gated on
its own Layout toggle, so it rendered empty when the toggle was off — no way to set
the content up before switching it on, no clue the toggle was what was missing. Both
panels now show their controls unconditionally, with a note pointing at the toggle.
On canvas the badge row renders whether or not it's switched on, dimmed and outlined
via `.adaire-is-editor-hidden` when off; `save()` still emits nothing. This is now a
rule in spec §4.
