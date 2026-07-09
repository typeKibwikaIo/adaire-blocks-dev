# Pricing Plans Block Documentation

## Overview

The **Pricing Plans** block (`create-block/pricing-table-block`) displays a responsive grid of pricing cards — ideal for SaaS pricing pages, service tiers, or subscription plans. Each card shows a plan name, tagline, monthly price, a feature list, and a call-to-action button. One card can be highlighted as "Featured" to draw attention to a recommended plan.

The block only displays **monthly pricing** — there is no yearly/monthly billing toggle.

## Adding the Block

1. Type "/" and then "pricing" in the block inserter, or search "Pricing Plans" in the block library.
2. Select the **Pricing Plans** block.
3. The block appears pre-filled with three demo plans (Basic, Standard, Unlimited) that you can edit directly in the canvas or via the sidebar.

## Content Settings

### Heading & Subheading
- **Heading** — editable rich text, defaults to "Simple, transparent pricing".
- **Subheading** — editable rich text, defaults to "Choose the plan that best fits your project."

### Cards
Each plan is a card in the `cards` array. Per-card fields (editable inline or via the sidebar "Cards" panel):
- **Plan Name** — e.g. "Basic", "Standard".
- **Tagline** — short description under the plan name.
- **Currency Symbol** — e.g. `$`.
- **Monthly Price** — the number shown as the price.
- **Price Suffix** — text after the price, defaults to `/mo`.
- **Features** — a list of feature lines; add, edit, or remove individual features.
- **Button Label / URL / Target** — the card's call-to-action link. Target can be "Same Window" or "New Tab".
- **Highlight as Featured** — toggle to visually promote a card (adds an accent background and text color).

### Managing Cards
- **Add Card** — appends a new plan with default placeholder content.
- **Reorder** — move a card up or down using the arrow buttons on its control panel.
- **Remove** — delete a card (at least one card must remain).

## Layout Settings

- **Container Mode** — `Full Width` or `Constrained`, with a responsive max-width (desktop/tablet/mobile, with unit support).
- **Grid Columns** — number of columns per device (desktop/tablet/mobile).
- **Grid Gap** — spacing between cards per device.
- **Card Padding** — inner padding per side (top/right/bottom/left).
- **Card Border Radius / Border Width**.
- **Card Text Alignment** — left, center, or right (also drives price/feature list alignment).
- **Card Button Alignment** — left, center, or right.

## Styling & Colors

- **Background Color** — block section background.
- **Card Background** / **Featured Card Background** / **Featured Card Text**.
- **Card Border** / **Card Hover Border**.
- **Card Hover Background** / **Card Hover Text** (optional overrides applied on hover).
- **Heading Color** / **Subheading Color**.
- **Plan Name Color** / **Price Color** / **Feature Text Color**.
- **Button Text** / **Button Background** / **Button Hover Background**.
- **Button Glow** — an optional colored glow behind CTA buttons, with an opacity slider (0–100).

## Typography

Responsive (desktop/tablet/mobile) font-size controls for:
- Heading, Subheading
- Plan Name
- Price, Price Prefix, Price Suffix
- Feature list text
- Button label

## Technical Details

- **Type**: static block (content is saved as HTML in `post_content`, not server-rendered).
- **API version**: 3.
- **Supports**: custom anchor, wide/full alignment, custom class name.
- **CSS custom properties**: the block renders all colors, font sizes, spacing, and grid settings as `--pricing-*` CSS variables on the wrapper element (e.g. `--pricing-bg`, `--pricing-price-size`, `--pricing-grid-columns`), so custom CSS or theme overrides can hook into them.
- **Frontend script (`view.js`)**: currently only powers the optional pricing/feature comparison toggle (`adaire-pricing-table__comparison-toggle`), if present; the pricing cards themselves need no JavaScript to render correctly.

### Migration from the old Monthly/Yearly toggle

Earlier versions of this block included a Monthly/Yearly billing toggle with a "Save 20%" badge and a separate yearly price per card. That feature has been removed — the block now only ever shows the monthly price.

Pages saved with the old toggle markup are handled by a block deprecation (`deprecated.js`): opening them in the editor automatically migrates the stored attributes to the current (monthly-only) shape, dropping the removed `billingMode`, `monthlyLabel`, `yearlyLabel`, `yearlyBadgeText`, `yearlyBadgeBackgroundColor`, `toggleFontSize`, `badgeFontSize`, and per-card `yearlyPrice` fields. Until a page is re-saved, its frontend HTML still reflects whatever was last saved (this is a static block, so old markup keeps rendering as-is until you open and update it).

## Best Practices

- Keep plan names and taglines short so cards stay visually balanced across breakpoints.
- Use **Highlight as Featured** on only one card at a time to keep the recommended plan clear.
- Keep the feature list length consistent across cards where possible, for a cleaner grid.
- Use a Button Glow color sparingly — it's most effective on the Featured card's CTA.
- Test Grid Columns on tablet/mobile; 1 column is usually best on small screens for readability.
