# Block Settings Specification

**Purpose:** Define where every block setting lives in the inspector panel, so that all blocks in the library behave identically from a user's point of view.

**Audience:** Developers and AI coding agents working on blocks in this plugin. Read this before adding, moving, or renaming any control in a block's sidebar.

**Status:** Draft — derived from the block settings UX discussion. Layout is the first tab to be brought into line; the rest follow incrementally.

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
- Gap and spacing *between* elements
- Padding and margin
- Order, direction, wrapping, stacking
- Responsive breakpoint behaviour for any of the above
- Show/hide toggles for structural sub-elements (e.g. "show arrows", "show caption"), because hiding one removes it from the DOM

**Test:** if turning the setting on or off would add or remove an element, or move elements relative to each other, it is Layout.

### Style
Does this setting only change CSS applied to elements that already exist?

Goes here:
- Colours: text, background, border, icon, hover, active
- Typography: font family, size, weight, line height, letter spacing, transform
- Borders, border radius, box shadow
- Opacity, filters, overlays
- Transitions and animation timing (the visual treatment, not the structure)
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

**Spacing.** Padding, margin, and gap are Layout, not Style, even though they are CSS. They change the spatial arrangement of elements, which is the Layout test. Be consistent — do not split padding into Style and gap into Layout.

**Animations and hover effects.** Split by what they do:
- The *decision* to have an effect at all, and any effect that reveals or removes an element → Layout
- The visual character of the effect — duration, easing, colour change → Style

If in doubt on a specific effect, default to Style and flag it for review rather than inventing a fourth tab.

**Show/hide toggles.** Layout. Hiding removes the element from the DOM, which is a structural change.

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
5. **Order within a tab is predictable.** Within Layout, structure before alignment before spacing. Within Style, colour before typography before borders and effects.

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
- [ ] Any ambiguous setting has been flagged rather than guessed at

---

## 9. Open items

These were raised and are not yet resolved. Do not resolve them unilaterally.

- **Quick edit.** Its relationship to the three tabs is undefined. Deferred.
- **Premium block gating.** Changes made in one place are propagating to the main environment when they should not. Needs a fix; out of scope for this spec but relevant to anyone touching shared settings.
- **Global settings location.** The target location inside the block panel needs a design decision before implementation.
