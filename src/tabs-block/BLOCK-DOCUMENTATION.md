# Tabbed Content Block

Organize content into clickable tabs or pill-style switchers with smooth GSAP transitions, per-device styling, and a live animation preview in the editor.

> **Naming:** the block is titled **"Tabbed Content"** in paid (Plus/Pro) builds and **"Tabbed Content Free"** in the free distribution. Same block, same slug (`create-block/tabs-block`) — only the display title differs (see [Distribution differences](#distribution-differences)).

## Description

The Tabbed Content block lets visitors switch between panels of content without leaving the page — perfect for feature overviews, pricing sections, FAQs, service breakdowns, or step-by-step guides. It absorbed the former **Content Switcher** block: its pill-style toggle design is now the "Pills" tab design, so one block covers both looks.

**Key Features:**
- 🎨 Two tab designs: classic **Underline** tabs or **Pills** (content-switcher style, 4 variants)
- ↔️ Horizontal or vertical orientation, tab bar above/below or beside the content
- 📱 Device-specific settings (Desktop/Tablet/Mobile) for widths, typography fine-tuning, and padding
- ⚡ GSAP-powered fade/slide transitions with **smooth height animation** — content below the block glides instead of jumping
- 👁️ Live animation preview while editing
- ⌨️ Full keyboard navigation and ARIA tab semantics on the frontend
- 🔄 One-click transform from legacy Content Switcher blocks

---

# User Guide

## Getting Started

1. In the editor, insert **Tabbed Content** (search "tabs", "switcher", "toggle", or "pills").
2. The block starts with three tabs (Features / Pricing / FAQ) pre-filled with demo content.
3. Click a tab title in the canvas to switch panels; click into a panel to edit its content — each panel accepts any blocks (headings, paragraphs, images, columns…).
4. Hover a tab title in the canvas for a quick inline title editor.

The sidebar is organized into three tabs: **Layout** (what the block does), **Style** (how it looks), and **Advanced** (CSS id/classes).

## Managing Tabs (Layout → Tabs)

Each tab appears as a card:

- **Show / Showing** — which tab is displayed in the editor preview. The highlighted (purple) card is the one you're editing.
- **↑ / ↓** — reorder tabs. Panel content moves with its tab.
- **🗑** — remove a tab (the last remaining tab can't be removed).
- **Add Tab** — appends a new tab. In the free version a limit may apply; an upgrade notice appears when it's reached.
- **First Tab Shown** — the tab visitors see when the page loads (also follows whichever tab is marked "Showing").

## Choosing a Look (Layout → Layout)

- **Tab Design**
  - **Underline** — text titles with an animated underline that slides to the active tab.
  - **Pills** — rounded button-style tabs. Four pill styles: **Default** (outlined until active), **Rounded** (fully round ends), **Outlined** (border only, never fills), **Filled** (solid background, no border).
- **Orientation** — Horizontal (tab bar in a row) or Vertical (tab column beside the content).
- **Tab Bar Position** — Above/Below content (horizontal) or Left/Right of content (vertical).
- **Tab Alignment** — Left / Center / Right / Space Between (top/center/bottom in vertical).
- **Space Between Tabs** — gap between tab titles or pills.
- **Block Width** — Full Width, or Constrained with a per-device max width (px/%/rem/vw).

## Styling (Style tab)

Panels shown depend on the chosen Tab Design — pill controls only appear in Pills mode, underline controls only in Underline mode.

- **Tab Colors** (Underline mode) — inactive/active title colors; in vertical layout, also the active tab's background highlight.
- **Pill Colors** (Pills mode) — background, text, and border, each with a normal and an "active" variant. Active colors also apply on hover.
- **Typography** — font family, title size, normal/active weight, plus per-device line height, letter spacing, and text case.
- **Underline Style** (Underline mode) — thickness and color of the animated underline.
- **Pill Shape & Padding** (Pills mode) — pill style, corner roundness, and inner padding.
- **Content Area Styling** — background, corner roundness, per-device width, and padding of the panel that holds each tab's content.
- **Wrapper Spacing** — background and per-device padding of the outer box around tab bar + content together.
- **Margins** — space between this block and neighboring blocks.

Colors use the site's Global Styles palette (via BoundColorPalette), so tabs follow your theme.

## Animation (Layout → Animation)

- **Duration** — how long the panel transition takes (0.1–2s).
- **Transition Feel** — Smooth (default), Smoother, Snappy, Elastic bounce, or Slight overshoot.

Switching tabs in the editor plays the real transition, so you can feel the difference immediately.

> **Free version:** animation settings are a paid feature. Free sites always use the default smooth transition (0.6s); the controls are visible but locked with an upgrade notice.

## What Visitors Experience

- Panels crossfade with a subtle upward slide; panel children stagger in.
- If tabs have different content lengths, the block's height **animates smoothly**, so everything below the block is pushed down/up gradually instead of jumping.
- The underline (Underline design, horizontal desktop) slides to the active tab. On tablet/mobile the active tab shows a static underline instead.
- Keyboard: **← →** move between tabs, **Home/End** jump to first/last; proper `role="tablist"` / `aria-selected` semantics for assistive tech.

## Migrating from Content Switcher (legacy)

The old **Content Switcher** block is hidden from the inserter but existing ones keep working. To upgrade one: select it → click its block icon in the toolbar → **Transform to Tabbed Content**. Labels, colors, spacing, position, animation settings, and all panel content carry over; the result uses the Pills design.

---

# Developer Reference

## File Map (`src/tabs-block/`)

| File | Role |
|---|---|
| `block.json` | Metadata + all attributes. Title here is the **paid** title ("Tabbed Content"); the free generator overrides it. |
| `index.js` | Registers the block with `edit`, `save`, `deprecated`, `transforms`, custom icon. |
| `edit.js` | Editor UI (InspectorTabs panels), freemium gating, inline animation preview. |
| `save.js` | Static save: CSS custom properties on the wrapper + tab buttons + `InnerBlocks.Content`. |
| `view.js` | Frontend runtime: GSAP panel switching, animated wrapper height, underline, keyboard nav. |
| `deprecated.js` | v2 (pre-Content-Switcher-merge save) and v1 (pre-typography save), most recent first. |
| `transforms.js` | `from` transform: `content-toggle-block` → `tabs-block` (pills mode). |
| `style.scss` | Frontend + editor styles, including pill variants and responsive rules. |
| `editor.scss` | Editor-only styles. |

Child block: **`tab-panel-block`** (`create-block/tab-panel-block`) — one per tab, `parent: ["create-block/tabs-block"]`, hidden from the inserter. The parent renders inner blocks with `templateLock: 'all'`, so panels are only added/removed through the tabs UI. Panel attributes: `tabTitle`, `tabId`, `tabIndex`, `isActive`.

## Data Model (attribute groups)

- **Tabs**: `tabs` (`[{ title, id }]`), `activeTab` (index shown initially and in the editor).
- **Design**: `tabStyle` (`underline` | `pills`), `pillStyle` (`default`/`rounded`/`outlined`/`filled`), `tabLayout` (`horizontal`/`vertical`), `tabPosition` (`top`/`bottom`/`left`/`right`), `tabsAlign`.
- **Pill styling**: `pillBackgroundColor`, `pillActiveBackgroundColor`, `pillTextColor`, `pillActiveTextColor`, `pillBorderColor`, `pillActiveBorderColor`, `pillBorderRadius`, `pillPadding` (`{top,right,bottom,left}`).
- **Typography**: `fontFamily`, `tabTitleFontSize`, `tabTitleFontWeight`, `tabTitleActiveFontWeight`, `tabTitleLineHeight`, `tabTitleLetterSpacing`, `tabTitleTextTransform` (the last three are per-device objects).
- **Underline**: `tabUnderlineColor`, `underlineHeight`, `tabTitleColor`, `tabTitleActiveColor`, `verticalActiveBgColor`.
- **Sizing/spacing**: `containerMode` (`full`/`constrained`), `containerMaxWidth` (per-device `{value,unit}`), `tabGap`, `contentPaddingTop/Right/Bottom/Left`, `marginTop/Right/Bottom/Left`, `contentWidth` (per-device `{value,unit}`), `contentBackgroundColor`, `contentBorderRadius`, `wrapperBackgroundColor`, `wrapperPadding` (per-device `{top,right,bottom,left}`).
- **Animation**: `animationDuration` (default `0.6`), `animationEase` (default `power2.out`).

> **Legacy quirk:** several numeric attributes (`tabGap`, `tabTitleFontSize`, `underlineHeight`, content paddings, margins) are *typed* as per-device objects with device defaults, but their controls write plain numbers once touched. Both shapes are handled everywhere via `value?.desktop ?? value ?? fallback`. Don't "fix" this without a deprecation — it changes stored markup.

## Save Output & CSS Contract

`save()` emits one wrapper `div.adaire-tabs` carrying `data-block-id`, `data-animation-duration`, `data-animation-ease`, `data-active-tab`, `data-tab-layout`, `data-tab-position`, `data-tab-style`, and ~70 CSS custom properties (`--tab-*`, `--pill-*`, `--tabs-content-*`, `--wrapper-*`, `--container-max-width*`). All styling flows through these variables; `style.scss` consumes them with the same defaults the attributes declare.

Key classes: `.adaire-tabs__container` (+ `is-constrained`, `is-vertical`, `is-bottom`, `is-right`, `is-pills`), `.adaire-tabs__header`, `.adaire-tabs__list` (+ `--pills`, `--pill-{style}` modifiers), `.adaire-tabs__tab`, `.adaire-tabs__underline` (omitted in pills mode), `.adaire-tabs__panels`, and per-panel `.adaire-tab-panel` (+ `is-active`).

**Deprecation policy:** the block has real static save markup, so *any* change to `save()` output — even a new unconditional CSS variable — requires freezing the previous `save()` as a new entry at the head of `deprecated.js`. New attributes so far have been additive with no-op defaults, so `migrate` is identity. Follow the documented pattern in that file (v2 = pre-merge, v1 = pre-typography).

## Frontend Runtime (`view.js`)

Per block instance:
1. Reads duration/ease/initial tab from data attributes; shows the initial panel, hides the rest.
2. **Switching** (`switchToTab`): toggles `is-active` classes (visibility is class-driven in `tab-panel-block/style.scss` with `!important` rules), crossfades old→new panel with GSAP, staggers the new panel's children.
3. **Smooth height**: before the crossfade it measures the incoming panel — hidden panels are locked down by `!important` CSS, so measurement temporarily applies inline `!important` overrides (`style.setProperty(prop, value, 'important')`), reads `offsetHeight`, then removes them. The `.adaire-tabs__panels` wrapper is pinned at its current height and tweened to the target over the full switch (`duration × 1.1`, `power2.inOut`), then released to `height: auto`. `killTweensOf` guards against rapid clicking.
4. **Underline**: slides to the active tab (horizontal + underline mode only; skipped for `data-tab-style="pills"` and vertical layout); repositioned on window resize.
5. **Keyboard**: ArrowLeft/ArrowRight/Home/End per WAI-ARIA tabs pattern.

## Editor Behavior (`edit.js`)

- Panels are declared through `InspectorTabs`, which auto-sorts them by title keywords into Layout/Style/Advanced sidebar tabs — **panel titles are load-bearing** ("Pill Colors" → Style/Appearance, "Wrapper Spacing" → Style/Effects, "Layout" → Layout tab). Renaming a panel can silently move it to another tab.
- Pill vs underline panels render conditionally on `tabStyle`.
- **Inline animation preview**: a `useEffect` watches `activeTab`; on change it plays the frontend's fade/slide on the newly shown `.adaire-tab-panel` inside a container ref, using the configured duration/ease, with `clearProps` so GSAP hands styling back to React afterwards. Skips the initial mount.
- Tab management writes to `tabs`/`activeTab`; inner `tab-panel-block`s are regenerated from the template (locked).

## Freemium Gating

Runtime config is injected by `adaire-blocks.php` as `window.adaireBlocksConfig` (`{ isPremium, blocks: { 'tabs-block': { limits, upgradeMessage } } }`), sourced from `config/blocks-config.json`.

- **Animation lock**: `config/blocks-config.json` → `free['tabs-block'].limits.customAnimations: false`. When `!isPremium && customAnimations === false`, the Animation controls are disabled behind an `UpgradeNotice` **and** a `useEffect` force-resets `animationDuration`/`animationEase` to defaults (belt-and-braces — saved markup can't smuggle custom values into free). Because it's config-driven, the AdaireBlocks.com freemium distribution can unlock it without a rebuild.
- **Tab count limit**: `useBlockLimits('tabs-block', tabs, 'tab')` respects `limits.maxItems` if ever set in config (none currently).

## Transforms & Legacy Content Switcher

`transforms.js` converts `create-block/content-toggle-block` → `tabs-block` with `tabStyle: 'pills'`: toggles→tabs, `activeToggle`→`activeTab`, `togglePosition`→`tabPosition`, `pillAlign`→`tabsAlign`, pill/content/wrapper/animation attributes copied, single-value pill typography expanded to per-device objects, and each `content-toggle-panel-block`'s inner blocks re-parented into new `tab-panel-block`s.

The legacy blocks (`content-toggle-block`, `content-toggle-panel-block`) remain **registered** (existing content keeps rendering) but have `supports.inserter: false` and "Legacy" descriptions. Do not delete them from `blocks-config.json`'s free tier — that would drop them from the generated free plugin and break existing sites.

## Distribution Differences

| | Free (wp.org / AdaireBlocks.com) | Plus / Pro |
|---|---|---|
| Display title | Tabbed Content **Free** | Tabbed Content |
| Animation controls | Locked (defaults enforced) | Unlocked |

The free title comes from `FREE_TITLE_OVERRIDES` in `scripts/generate-free-version.js`, which patches the *copied* `block.json` before the free build — so it lands in the free manifest and settings page, while the dev source keeps the paid title. (The editor bundle tree-shakes the JSON import down to `metadata.name`; the displayed title always comes from the server-registered `block.json`.)

## Build & Editing Rules

- Edit **only** in `AdaireBlocks/src/tabs-block/` (dev source). `adaire-blocks-free/` is generated by `npm run build:free` and wiped on every regeneration.
- The free pipeline: copies free blocks per `blocks-config.json`, applies title overrides, runs icon prebuild scripts (these rewrite `block.json` icons — expected), builds with `wp-scripts build --blocks-manifest`, and zips to `plugin-zips/adaire-blocks-free.zip`.
- Requires GSAP (bundled dependency) in both the frontend `view.js` and, since the inline preview, the editor bundle.

