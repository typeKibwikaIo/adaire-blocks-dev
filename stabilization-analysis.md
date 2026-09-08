# Stabilization Analysis — Responsive Controls & Inspector Grouping

Scope: read-only investigation of `src/` (74 blocks) in the `adaire-main` checkout, feeding the manual-tracker triage. No source files were modified.

---

## 1. Systemic pattern verdict

### 1a. "Missing Device View Settings" (per-breakpoint controls)

**Verdict: MIXED — a shared component exists and is well-formed, but adoption is a block-by-block problem. Fixing this is NOT a single shared-component patch; it requires per-block wiring (and in ~14 cases, ripping out a duplicated ad-hoc implementation first).**

Evidence:

- A real shared component exists: `src/components/DeviceSwitcher.js` — exported `DeviceSwitcher` (button-group device tab UI, 3/4/5-tier configurable via `tiers` prop, `localStorage`-persisted, syncs across blocks via a `window` custom event `adaire-responsive-device-change`), plus helpers `DeviceControlInput`, `getDeviceValue`, `updateDeviceAttribute`, `generateDeviceCSSVariables`, `getFlatDeviceValue`/`setFlatDeviceValue`. Its own docblock calls it "the one shared responsive device switcher used across every AdaireBlocks block" — but that claim is aspirational, not current state (see adoption counts below).
- A companion hook `src/components/useResponsiveAttribute.js` provides `updateResponsive(attrName, breakpointKey, value)` for merging per-breakpoint values into a nested-object attribute without clobbering siblings.
- **Adoption is partial**: of 74 blocks, only **31** import *and* render `<DeviceSwitcher …>` in `edit.js` (verified — every import found also has ≥1 JSX usage, no dead imports). **43 blocks do not use it at all.**
- The hook `useResponsiveAttribute` is used by only **2** blocks (`horizontal-scroll-card-block`, `horizontal-scroll-carousel-block`); every other DeviceSwitcher-using block rolls its own inline `setAttributes` merge logic instead of the shared hook.
- Of the 43 blocks not using `DeviceSwitcher`, at least **14 have independently reimplemented the same pattern by hand** — a local `useState('desktop')` + `<ButtonGroup>` device switcher, copy-pasted with small variations. Confirmed instances (file:line of the `useState` call):
  - `src/call-to-action-block/edit.js:83`
  - `src/mega-menu-block/edit.js:128`
  - `src/industries-block/edit.js:138`
  - `src/testimonial3-block/edit.js:87`
  - `src/testimonial2-block/edit.js:82`
  - `src/infogrid-block/edit.js:137`
  - `src/infogrid-3-block/edit.js:175`
  - `src/our-process-block/edit.js:152`
  - `src/location-map/edit.js:22`
  - `src/card-scroll-block/edit.js:52`
  - `src/card-scroll-item-block/edit.js:109`
  - `src/flipcard-block/edit.js:21`
  - `src/swiper-slide-block/edit.js:183`
  - (plus a distinct third pattern, not a switcher at all: `src/case-studies-block/edit.js:31-36` defines its own 5-tier `DEVICE_TYPES` array and renders **all 5 device fields inline side-by-side** — no active-tab switcher — a third, structurally different approach again.)
- A **fourth**, separate mechanism also exists and applies automatically to every block: `src/responsive-system.js`, loaded once via `src/index.js`, registers WordPress filters (`blocks.registerBlockType`, `editor.BlockEdit`, `editor.BlockListBlock`, `blocks.getSaveContent.extraProps`) that inject a generic `responsive` attribute and "Responsive View / Responsive Visibility / Responsive Properties" panels into **every** block whose name starts with `create-block/` or `adaire/` (confirmed: all sampled `block.json` files use the `create-block/` prefix, so this covers all 74 blocks). However: **this generic system is disconnected from every block's real, block-specific device-keyed attributes** (e.g. `buttonPadding.desktop/tablet/mobile/smartwatch` in `button-block/block.json`). Confirmed by grep: zero `save.js`/`render.php` files reference `attributes.responsive`, and no `block.json` declares its own `responsive` attribute (it's purely injected by the filter, generic CSS-property text fields, not tied to what the block actually renders with its named attributes). It does add visibility-hiding classes/CSS vars to the saved wrapper via the `extraProps` filter, but that's independent of, and does not substitute for, the per-block device-specific controls the tracker complaints are about.
- **Two more partial/degraded patterns** worth flagging separately:
  - `src/pricing-comparison-block/edit.js:452-457` — attribute (`containerMaxWidth`) is schema'd per-device, but the Inspector UI only exposes the `desktop` value; tablet/mobile are silently unreachable from the UI.
  - `src/header-menu-block/edit.js` and `src/mega-menu-item/edit.js` — no tiered switcher at all; only a single hard-coded "mobile" settings subsection (e.g. `mobileMenuStyle`, `mobileSlideDirection`, `mobilePanelPadding`), no desktop/tablet granularity.
- **22 blocks have zero desktop/tablet/mobile references in `edit.js` at all** — no shared component, no ad hoc switcher, nothing. Of these, 6 are inner/child blocks with `parent` set in `block.json` (`accordion-item-block`, `column-block`, `content-toggle-panel-block`, `flipcard-back-block`, `flipcard-front-block`, `tab-panel-block`) — plausibly by design (they inherit layout context from their parent block; `flipcard-back-block`/`flipcard-front-block` declare `"attributes": {}` entirely). The other **16 are standalone, top-level blocks with genuinely no responsive controls**: `app-download-block`, `container-block`, `cookie-notice-block`, `form-block`, `live-streamer-block`, `pdf-reader-block`, `pdf-upload-block`, `progress-block`, `project-block`, `promo-banner-block`, `reader-block`, `saas-hero-block`, `scroll-text-block`, `skill-bar-block`, `social-share-block`, `timeline-block`.

**Bottom line for 1a:** There is one well-built shared component (`DeviceSwitcher` + `useResponsiveAttribute`), but only 31/74 blocks (42%) use it. The remaining 43 blocks split across at least 4 other shapes (ad hoc switcher ×14, flat-fields ×1, partial-exposure ×1, mobile-only ×2, nothing ×22 more precisely 25 minus overlaps — see exact list in §2). Because the fix is "go wire the existing component into each block's `edit.js`" (and for the ad hoc group, first delete the duplicated local implementation), this is fundamentally a **block-by-block effort**, just one made faster by not having to design new UI — the component to reuse already exists and doesn't need to be built.

### 1b. "Missing Layout, Feature and Style Settings" (Inspector Controls grouping)

**Verdict: MOSTLY a shared-component success — adoption is much higher (49/74, 66%) than for responsive controls, and the remaining gaps are smaller and mostly explainable. Residual work is still block-by-block, but far less of it.**

Evidence:

- `src/components/InspectorTabs.js` is a mature, documented shared wrapper: splits a block's Inspector sidebar into Content / Layout / Style tabs via `<InspectorTabs>`, reading a `section="content"|"layout"|"style"` prop on each child `<PanelBody>`, with a legacy keyword-classifier fallback (`classifyTitle()`, matching panel `title` strings against `HIGH_KEYWORDS`/`MEDIUM_KEYWORDS`) for untagged panels.
- **49 of 74 blocks** import and render `<InspectorTabs>` (confirmed — all 49 have ≥1 JSX usage, no dead imports; `row-block` uses it twice).
  - Of those 49, **35 blocks use explicit `section=` props** on at least one child panel (tagged deliberately).
  - **14 blocks use `<InspectorTabs>` but pass zero explicit `section` props** — they render correctly but rely entirely on the legacy keyword fallback to sort panels into Layout vs. Style: `about-us-block`, `card-scroll-block`, `card-scroll-item-block`, `column-block`, `cookie-consent-block`, `cookie-notice-block`, `gallery-block`, `infogrid-block`, `our-process-block`, `progress-block`, `saas-hero-block`, `swiper-carousel-block`, `swiper-slide-block`, `website-footer-block`. These are functional (fallback classifier degrades gracefully to Layout/Style, per the component's own docblock) but not the "true" tagged pattern — this is not a systemic gap, more an incomplete-tagging debt.
- **25 blocks do not use `InspectorTabs` at all.** Of these:
  - **21 still use plain `<InspectorControls>`** (untabbed) — they have real settings panels, just not grouped into the Content/Layout/Style structure.
  - **4 have zero `InspectorControls` usage of any kind**: `content-toggle-panel-block`, `flipcard-back-block`, `flipcard-front-block`, `tab-panel-block`. All four declare a `parent` in `block.json` (they are inner/child blocks of `content-toggle-block`, `flipcard-block`, and `tabs-block` respectively), and `flipcard-back-block`/`flipcard-front-block` declare `"attributes": {}` — i.e. by design, not a bug: these are structural inner blocks with no settings of their own.

**Bottom line for 1b:** `InspectorTabs` adoption (49/74) is much better than `DeviceSwitcher` adoption (31/74). The 21 blocks using plain `InspectorControls` are "structured differently, not missing functionality" — their settings exist, just ungrouped. Only the 4 zero-`InspectorControls` blocks look like an actual gap, and all 4 are explainable by being attribute-less inner blocks. This pattern needs far less remediation than 1a.

---

## 2. Blocks affected by the systemic pattern

Flat lists, one block folder per line, for spreadsheet paste.

### Missing per-device (responsive) controls — no `DeviceSwitcher` usage (43 blocks)

```
src/about-us-block
src/accordion-item-block
src/app-download-block
src/call-to-action-block
src/card-scroll-block
src/card-scroll-item-block
src/case-studies-block
src/column-block
src/container-block
src/content-toggle-panel-block
src/cookie-notice-block
src/flipcard-back-block
src/flipcard-block
src/flipcard-front-block
src/form-block
src/header-menu-block
src/industries-block
src/infogrid-3-block
src/infogrid-block
src/live-streamer-block
src/location-map
src/mega-menu-block
src/mega-menu-item
src/our-process-block
src/pdf-reader-block
src/pdf-upload-block
src/pricing-comparison-block
src/progress-block
src/project-block
src/promo-banner-block
src/questions-block
src/reader-block
src/row-block
src/saas-hero-block
src/scroll-text-block
src/skill-bar-block
src/social-share-block
src/swiper-slide-block
src/tab-panel-block
src/testimonial2-block
src/testimonial3-block
src/timeline-block
src/website-footer-block
```

### Missing Inspector Controls grouping — no `InspectorTabs` usage (25 blocks)

```
src/accordion-item-block
src/app-download-block
src/call-to-action-block
src/content-toggle-panel-block
src/counter-block
src/flipcard-back-block
src/flipcard-front-block
src/form-block
src/industries-block
src/infogrid-3-block
src/live-streamer-block
src/mega-menu-block
src/pdf-upload-block
src/portfolio-block
src/pricing-comparison-block
src/project-block
src/promo-banner-block
src/questions-block
src/reader-block
src/scroll-text-block
src/skill-bar-block
src/tab-panel-block
src/testimonial2-block
src/testimonial3-block
src/video-carousel-block
```

### Missing BOTH (22 blocks — intersection of the two lists above)

```
src/accordion-item-block
src/app-download-block
src/call-to-action-block
src/content-toggle-panel-block
src/flipcard-back-block
src/flipcard-front-block
src/form-block
src/industries-block
src/infogrid-3-block
src/live-streamer-block
src/mega-menu-block
src/pdf-upload-block
src/pricing-comparison-block
src/project-block
src/promo-banner-block
src/questions-block
src/reader-block
src/scroll-text-block
src/skill-bar-block
src/tab-panel-block
src/testimonial2-block
src/testimonial3-block
```

### Reference counts

| Pattern | Have it wired | Missing it | Total blocks |
|---|---|---|---|
| Responsive controls (`DeviceSwitcher`) | 31 | 43 | 74 |
| Inspector grouping (`InspectorTabs`) | 49 | 25 | 74 |
| Missing both | — | 22 | 74 |

Note: 6 of the "missing" blocks in each list (`accordion-item-block`, `column-block`, `content-toggle-panel-block`, `flipcard-back-block`, `flipcard-front-block`, `tab-panel-block`) are inner/child blocks (`parent` set in `block.json`) where the absence may be by design rather than a defect — flagged in §1 but left in the flat lists above since the task asked for "missing/not using," not a judgment filter.

---

## 3. Broken blocks — root cause per block

Blocked: no Block Status Matrix data was provided in this pass — cannot cross-reference which blocks are marked Broken.

---

## 4. Not Published blocks — actual state

Blocked: no Block Status Matrix data was provided.

---

## 5. Discrepancies between manual tracker and actual code

Blocked: no Block Status Matrix data was provided.

---

## 6. Recommended fix order

Based only on the systemic-pattern findings in §1–§2:

1. **Do the Inspector Controls grouping pass first.** It's the cheaper, higher-leverage fix: 49/74 blocks already work correctly, 21 more just need existing `<InspectorControls>` panels wrapped in `<InspectorTabs>` (mechanical, low-risk since the legacy fallback classifier means even untagged panels degrade safely), and only 4 blocks are true no-op cases (by-design inner blocks, skip them). This clears one of the two tracker complaints for the majority of the block library quickly.
2. **Tag the 14 blocks currently relying on the legacy keyword fallback** (`about-us-block`, `card-scroll-block`, `card-scroll-item-block`, `column-block`, `cookie-consent-block`, `cookie-notice-block`, `gallery-block`, `infogrid-block`, `our-process-block`, `progress-block`, `saas-hero-block`, `swiper-carousel-block`, `swiper-slide-block`, `website-footer-block`) with explicit `section=` props — low effort per block, removes reliance on string-matching panel titles.
3. **Responsive controls is the larger effort and should be sequenced block-by-block, prioritizing the 14 blocks with an ad hoc `useState('desktop')` + `ButtonGroup` switcher already in place** (§1a list) — these are the cheapest to convert since the state/data model already exists; it's a swap-in-the-shared-component refactor, not new UI. Save the 16 blocks with zero responsive control of any kind for last, since those require both new UI and confirming/adding the underlying per-device attribute schema in `block.json` first.
4. **Do not attempt to leverage `src/responsive-system.js`** as a shortcut for item 3 — it is confirmed disconnected from every block's actual save output (no `save.js`/`render.php` consumes its generic `responsive` attribute), so it does not reduce the per-block work required.
