# SaaS Hero Block Documentation

## Overview

The **SaaS Hero** block (`create-block/saas-hero-block`) is a focused hero section for
software products, startups, and landing pages: an eyebrow label, headline, supporting
text, a configurable call-to-action, an optional hero image, a rating/app-store badge
strip, and a set of purely decorative background effects. It does not include a
Trusted-By logo bar, a security/feature grid, or an FAQ accordion — those were removed
(see **Removed sections & migration** below).

## Adding the Block

1. Type "/" and then "SaaS Hero" in the block inserter, or search "SaaS Hero" in the
   block library.
2. The block appears pre-filled with demo copy ("Launch your SaaS faster") and a
   dual-button CTA that you can edit directly in the canvas or via the sidebar.

## Content Settings

### Layout
- **Layout Style** — Centered, Split Layout (Left), or Split Layout (Right). Split
  layouts place the hero image beside the text instead of below/above it.

### Top Pill
- **Show Top Pill** — toggles a small rounded label above the headline (e.g. "New: v2.0
  Release"), editable inline.

### Headline
- **Eyebrow** — small label above the headline.
- **Heading** — the main headline (rich text).
- **Use Gradient on Headline** — renders the headline with a two-color gradient fill.
- **Text** — supporting paragraph under the headline.

### CTA Content
- **CTA Type** — Dual Buttons, Email Form, or Single Button.
  - *Dual Buttons*: primary + secondary button text/URL.
  - *Email Form*: an email input with a placeholder and submit button label (frontend
    markup only — no submit handler is wired up by the block itself).
  - *Single Button*: one button plus an optional micro-copy line underneath.

### Media Asset
- **Show Hero Image** — toggles the hero image.
- **Hero Image** — image picker.
- **Image Position** — Below Text or Above Text (centered layout only; split layouts
  already imply left/right position via Layout Style).

### Ratings & Badges
- **Show ratings / app-store badges** — toggles a row of badges above the headline
  (e.g. a star rating, an app-store score, a review count).
- **Alignment** — Left, Center, or Right.
- Each badge has an icon (Bootstrap Icons, via the same picker used elsewhere in this
  plugin) or an uploaded image, plus a text/subtext line (e.g. "5.0/5" / "Reviews").

### Hero Effects & Decorations
Purely decorative, `aria-hidden`, CSS-only (no JavaScript), and respect
`prefers-reduced-motion`:
- **Industry preset** — None, Sports, Gym / Fitness, E-commerce, Business,
  Medical / Hospital, Gaming, or Custom. Presets just batch-set the toggles below; you
  can still tweak anything afterward.
- **Dot pattern**, **Gradient overlay** (+ two colors and opacity), **Abstract shapes**,
  **Glow** (+ color), **Blur blob**, **Floating elements**, **Animated accents**.

## Styling & Colors

- **Background type** — Solid color, Gradient (raw CSS), or Image (with size/position
  controls).
- **Accent color** / **Text color**.
- **Headline Gradient Colors** — start/end colors used when "Use Gradient on Headline"
  is on.
- **Top Pill Colors** — background/text color for the pill.
- **CTA Colors & Hover** — primary/secondary button text & background colors, plus
  hover text/background/border colors.
- **CTA Spacing & Alignment** — button alignment, gap between buttons, vertical/
  horizontal padding, and border radius (defaults to the block's global radius until
  changed).
- **Media Shadow & Spacing** — drop shadow toggle, image border radius, and spacing
  above the image.
- **Global Spacing & Radius** — section padding, font size, and the global border
  radius other radius controls default to.

## Technical Details

- **Type**: static block (content is saved as HTML in `post_content`, not
  server-rendered).
- **API version**: 3.
- **Supports**: custom anchor.
- **CSS custom properties**: colors, spacing, and effect settings are exposed as
  `--ad-*` CSS variables on the wrapper element (e.g. `--ad-accent`, `--ad-cta-radius`,
  `--ad-effect-glow-color`) — see `getStyleVars()` in `shared.js`.
- **Frontend script**: none — this block has no `view.js`; everything (including hero
  effects) is pure CSS.

### Removed sections & migration

Earlier versions of this block also included a Trusted-By logo bar, a Security/partner
feature grid, and an FAQ accordion. All three were dropped outright — Ratings & Badges
was considered for the same treatment (a separate standalone `rating-badge-block` now
also exists) but was kept inline here since it's still actively used.

Pages saved with the old sections are handled by a block deprecation
(`deprecated.js`, entry `v4`): opening them in the editor validates against the old
markup so they don't show "invalid content." Since this is a static block, their
frontend HTML keeps rendering exactly as before until the page is re-saved in the
editor — at which point the removed sections' content is dropped (there's no automatic
conversion of old Trusted-By/Security/FAQ content into anything new, since those
sections no longer exist).

## Best Practices

- Keep the eyebrow + heading + text combination short — this is a hero, not a landing
  page's full pitch.
- Use Split Layout when you have a hero image; Centered layout works best without one
  or with a small illustrative image below the CTA.
- Turn on at most one or two Hero Effects at a time — stacking several (e.g. glow +
  floating elements + animated accents) can get visually noisy.
- If you need a Trusted-By logo row or an FAQ section, add the corresponding dedicated
  block below the hero instead (e.g. the Client Logos block or an Accordion block).
