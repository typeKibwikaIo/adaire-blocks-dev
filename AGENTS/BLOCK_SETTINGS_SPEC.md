# Block Settings Specification

**Purpose:** Define where every block setting lives in the inspector panel, so that all blocks in the library behave identically from a user's point of view.

**Audience:** Developers and AI coding agents working on blocks in this plugin. Read this before adding, moving, or renaming any control in a block's sidebar.

**Status:** Active. The categorisation rule and the three-tab structure are settled and enforced in code (Section 10). Five blocks are compliant; the rest of the library follows incrementally using the same shared components.

---

## 1. The problem

Settings are currently scattered inconsistently across tabs. The same kind of control lives under Content in one block and under Style in another. A user who learns one block has to relearn the next one. Competitor plugins get this right: their tab structure is predictable, so a user only learns it once.

The fix is not a redesign. It is a single categorisation rule applied consistently to every existing block, then to every new block.

---

## 2. The tabs

Every block exposes the same three tabs, in this order:

| Tab | Owns |
|---|---|
| **Content** | The actual content of the block and how that content is configured |
| **Layout** | Anything that changes the structure — the arrangement of elements in space |
| **Style** | Anything that is purely CSS presentation |

There is no Advanced tab. Settings that used to be filed as "advanced" are
categorised by the same rule as everything else and live in whichever of the three
tabs Section 3 puts them in — see "Former 'advanced' settings" in Section 3.

A tab with no applicable settings for a given block is hidden, not shown empty.

**These three are the only tabs on screen.** WordPress adds a tab strip of its own
— "Settings | Styles" — to any block declaring a style-generating `supports` entry
(`spacing`, `color`, `typography`, `border`…), and nests the block's own inspector
inside the Settings half. The result is two tabs, one of which contains three more.
That is the same "learn it twice" problem in Section 1, so core's strip is
suppressed plugin-wide; see Section 10.

---

## 3. The categorisation rule

Apply these tests in order. The first one that matches wins.

### Content
Does this setting change *what* the block displays?

Goes here:
- Text, headings, labels, button text
- Media: images, icons, videos (the choice of asset, not its styling)
- Links and link targets
- Item collections — accordion items, carousel slides, menu entries, card entries
- Per-item behaviour that is part of the content definition (e.g. "open by default" on an accordion item)
- Data source and query settings

### Layout
Does this setting change the structure — either by adding/removing DOM elements, or by changing the spatial relationship between elements?

Goes here:
- Number of columns, column widths, grid definitions
- Alignment and justification
- Order, direction, wrapping, stacking
- Width, height, and other element dimensions
- Motion effects that displace an element — hover scale, bounce, shake, slide
- Responsive breakpoint behaviour for any of the above
- Show/hide toggles for structural sub-elements (e.g. "show arrows", "show caption"), because hiding one removes it from the DOM

**Test:** if turning the setting on or off would add or remove an element, or move elements relative to each other, it is Layout.

### Style
Does this setting only change CSS applied to elements that already exist?

Goes here:
- Colours: text, background, border, icon, hover, active
- Typography: font family, size, weight, line height, letter spacing, transform
- Borders, border radius, box shadow
- Padding, margin, and gap
- Opacity, filters, overlays
- Transitions and animation timing (the visual treatment, not the displacement)
- Hover and focus state styling

**Test:** if the setting maps to a CSS property and does not move or remove anything, it is Style.

### Former "advanced" settings

There is no Advanced bucket. Anything previously treated as advanced is filed by the
tests above. The recurring cases resolve as follows — do not re-litigate them per
block:

| Setting | Tab | Why |
|---|---|---|
| HTML Anchor, Additional CSS Class(es) | *(neither — see below)* | WordPress core renders these itself |
| Block ID / custom identifier used for CSS or JS targeting | Content | It is a property of the block instance, and it is functional, not presentational |
| Z-Index | Layout | Stacking is a spatial relationship between elements |
| Visibility / responsive show-hide | Layout | Hiding removes the element from the DOM |
| Custom CSS, inline style overrides | Style | Pure CSS presentation |

**HTML Anchor and Additional CSS Class(es) are not ours to place.** WordPress core
renders its own panel for them, below the block's `InspectorControls`, for any block
declaring `supports.anchor` / `supports.customClassName`. It appears regardless of
which tab is active. Do not re-implement either control inside a tab — that produces
two fields writing the same attribute.

---

## 4. Edge cases and how to resolve them

These come up repeatedly. Resolve them this way, not by personal judgement.

**Spacing.** Padding, margin, and gap are **Style, not Layout.** They are CSS properties applied to elements that already exist — nothing is added, removed, or reordered. Be consistent: do not split padding into Style and gap into Layout.

Layout owns the *arrangement* of elements — how many columns, in what order, aligned how, at what size. Spacing is the trim applied once that arrangement is settled, which is why it sits with the other CSS in Style.

**Animations and hover effects.** Split by what they do:
- An effect that **moves** an element — scale, bounce, shake, slide — or that reveals or removes one → Layout, in the `Effects` panel
- An effect that only **repaints** an element — a colour transition, a glow, a blur, a fade → Style
- The decision to have an effect at all → Layout, with the effect itself

If in doubt on a specific effect, ask whether the element occupies different space while the effect runs. If it does, it is Layout.

**Show/hide toggles.** Layout. Hiding removes the element from the DOM, which is a structural change.

**A Content panel is never gated on its Layout toggle.** The toggle controls what
the front end renders; the Content tab is where the thing is authored. Wrapping a
Content panel in `{ showThing && … }` leaves it rendering empty whenever the toggle
is off, so there is no way to set the content up before switching it on and no clue
that the toggle is what is missing. Show the controls unconditionally, seeded with
placeholder defaults, and say where the toggle lives:

```jsx
<PanelBody section="content" title={ PANEL.BADGES }>
    { ! attributes.showRatingBadges && (
        <p className="adaire-help-note">
            { __( 'These badges are hidden on the front end. Turn on "Show Ratings & Badges" in Layout > Structure to display them.' ) }
        </p>
    ) }
    <RepeaterField … />
</PanelBody>
```

The same applies on canvas: draw the zone so it can be clicked and edited, mark it
as hidden (`.adaire-is-editor-hidden`), and let `save()` continue to emit nothing.

**Icon choice vs icon colour.** The icon itself is Content. Its size, colour, and spacing are Style and Layout respectively.

**Anything genuinely ambiguous.** Do not guess and do not create a new tab or section. Flag it in the PR with the property name and the two candidate tabs, and it gets ruled on and added to this document.

---

## 5. Global settings

Global spacing and global style settings currently sit outside the per-block panel in a separate location. These should be surfaced inside the block settings panel so users find them in one place rather than hunting between two.

Consequence: the existing separate entry point is removed once the settings are consolidated, so there is exactly one place to change a given value. This is a follow-up to the tab work, not a blocker for it — but do not build new controls against the old location.

---

## 6. Consistency requirements

Beyond tab placement, the following must be true across every block:

1. **Tab order is identical.** Content, Layout, Style. No exceptions.
2. **Naming is identical.** The same setting is called the same thing in every block. "Gap" is not "Spacing" in one block and "Gutter" in another.
3. **Control types are identical.** The same kind of setting uses the same control everywhere — a colour is always a colour picker, a spacing value always uses the same unit control.
4. **Icons are one system.** Icons used in the inspector come from a single set. Do not mix icon sets between blocks.
5. **Order within a tab is predictable.** Within Layout, structure before alignment before dimensions before effects. Within Style, colour before typography before borders before spacing.

Requirements 1, 2 and 5 are enforced in code rather than by review — see Section 10.

---

## 7. Scope and sequencing

Work incrementally against the blocks that already exist. Do not wait for a full-library redesign.

1. **Layout first.** Audit every existing block, move all Layout-category settings into the Layout tab, apply consistent naming and ordering.
2. **Style second.** Same process.
3. **Content third.**
4. **Global settings consolidation.**
5. **Quick edit.** Out of scope for now — how quick edit maps onto these categories is deferred and will be specified separately.

---

## 8. Definition of done for a block

A block is compliant when:

- [ ] Every setting has been tested against Section 3 and sits in the correct tab
- [ ] Tab order matches Section 6.1
- [ ] Setting names match the shared vocabulary — no block-specific synonyms
- [ ] Control types match the shared patterns
- [ ] Icons come from the single approved set
- [ ] Within-tab ordering follows Section 6.5
- [ ] Empty tabs are hidden, not shown blank
- [ ] No custom Advanced tab or Advanced panel; HTML Anchor / Additional CSS Class(es) are left to WordPress core, not duplicated
- [ ] No `supports` entry duplicates a control the block already owns
- [ ] No Content panel is gated on a Layout show/hide toggle
- [ ] Every attribute the block reads is declared in `block.json` — an undeclared attribute does not survive a reload
- [ ] Any ambiguous setting has been flagged rather than guessed at

---

## 9. Open items

These were raised and are not yet resolved. Do not resolve them unilaterally.

- **Quick edit.** Its relationship to the three tabs is undefined. Deferred.
- **Premium block gating.** Changes made in one place are propagating to the main environment when they should not. Needs a fix; out of scope for this spec but relevant to anyone touching shared settings.
- **Global settings location.** The target location inside the block panel needs a design decision before implementation.
- **Icon sets (Section 6.4).** The inspector's own chrome is one set — the tab glyphs in `InspectorTabs.js`. Block-level icon *pickers* are not: `saas-hero-block`, `feature-grid-free` and `infogrid-block` offer Bootstrap Icons, while `button-block` offers its own small arrow/chevron set (`src/button-block/icons.js`). These are content assets the visitor sees, not sidebar chrome, so 6.4 arguably does not reach them. Flagged rather than unified — needs a ruling.
- **Visual presets vs. structural variants.** `PANEL.VARIANT` (Style) is for a preset that only swaps CSS treatments — button fill/outline/glass. `PANEL.STRUCTURE` (Layout) is for one that rearranges elements — the hero's centered/split-left/split-right. The two read alike to a user but land in different tabs. Confirm that split is what we want before more blocks adopt it.

---

## 10. How this is enforced

Three pieces of shared code carry the rules, so a block gets them by using them
rather than by remembering them.

**`src/components/inspector-vocabulary.js`** is the single source of panel titles
(`PANEL`), the labels of settings that recur across blocks (`LABEL`), the declared
within-tab order (`PANEL_ORDER`), and each Style panel's priority group
(`STYLE_PRIORITY`). A block imports its titles; it does not type them.

```jsx
import { PANEL, LABEL } from '../components/inspector-vocabulary';

<PanelBody section="layout" title={ PANEL.SPACING }>
    <BoxControl label={ LABEL.PADDING } … />
</PanelBody>
```

Adding a name means adding it there first. If nothing in the list fits, that is
usually a sign the panel is doing two jobs and should be split along Section 3.

**`src/components/InspectorTabs.js`** takes the panels a block declares and:

- routes each into the tab named by its `section` prop (`"content" | "layout" | "style"`);
- sorts them within that tab by `PANEL_ORDER`, so authoring order can't change what the user sees;
- reads each Style panel's priority group from `STYLE_PRIORITY` unless a `priority` prop overrides it;
- hides a tab that has no panels, rather than rendering it empty (Section 8).

An untagged panel still falls back to the legacy keyword classifier, so blocks
outside this work keep rendering as before — but a panel with no `section` prop
is a block that has not been done yet, not a supported state.

**`blockInspectorTabs`** (filtered in `adaire-blocks.php`) turns off WordPress's own
tab strip for every block whose name starts `create-block/` or `adaire/`. Core then
renders its inspector fills in a single column with no tabs of its own, so the only
tabs on screen are the plugin's three. This hides core's *tab chrome only* —
nothing is unregistered and no control is removed. Blocks from core and other
plugins keep their normal tabbed inspector.

Prefer removing a redundant `supports` entry over relying on the filter alone. If a
block already owns a control for something (`feature-grid-free` has responsive
padding and margin), declaring `supports.spacing` gives the user two controls for
one job that write different attributes — the filter hides the extra tab but not
the duplicate panel underneath it. Where a `supports` entry is dropped, its
capability must be replaced by an equivalent control in the block's own panels, not
silently lost.

**`BreakpointNote`** (exported from `src/components/DeviceSwitcher.js`) is the one
approved way a panel says which breakpoint its controls are editing. Responsive
controls end up in panels away from the switcher, so each such panel states the
active tier. Do not hand-roll a "Current Breakpoint: X" paragraph and do not bake
the device name into control labels (`Button Padding (Desktop)`).

### Compliant blocks

| Block | Directory |
|---|---|
| Hero Block (Pro) | `src/saas-hero-block` |
| Hero Banner | `src/hero-banner-block` |
| Button (Free) | `src/button-block` |
| Feature Grid (Free) | `src/feature-grid-free` |
| Feature Grid (Pro) | `src/infogrid-block` |

Deliberately out of scope: `src/hero-1-block` (Hero Banner (Legacy)) and
`src/infogrid-3-block` (Feature Grid Pro (Legacy)). Both are `inserter: false`
back-compat registrations for content saved before a rename — they cannot be
inserted, so no user learns their sidebar.

---
