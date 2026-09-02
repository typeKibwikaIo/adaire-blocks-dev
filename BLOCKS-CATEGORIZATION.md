# Blocks Categorization

This document shows the categorization of all blocks in the Adaire Blocks plugin. Each block is distinct and appears only in its designated category.

## Free Blocks

These blocks are available in the free version without limitations.

- **Accordion** (`accordion-block`)
- **Button Block** (`button-block`)
- **Video Player Block** (`video-player-block`)
- **Icon Box Block** (`icon-box-block`)
- **Social Banner Block** (`social-banner-block`)
- **Social Share Block** (`social-share-block`)
- **Testimonial** (`testimonial-block`)
- **Posts Grid** (`posts-grid-block`)
- **Posts Carousel** (`posts-carousel-block`)
- **Tabs** (`tabs-block`)
- **Animation on Scroll** (`animation-scroll-block`)
- **Content Toggle** (`content-toggle-block`)
- **Flip Card** (`flipcard-block`)
- **Swiper Carousel** (`swiper-carousel-block`)
- **Our Process** (`our-process-block`)
- **Hero 1** (`hero-1-block`)
- **Feature Grid (Pro)** (`infogrid-block`)
- **Feature Grid (Free)** (`feature-grid-free`)
- **Image Composition** (`image-composition-block`)
- **Website Footer** (`website-footer-block`)
- **Row** (`row-block`)
- **Container** (`container-block`)
- **Progress Bar** (`progress-block`)

## Plus Blocks

These blocks are available in Plus and Premium versions.

- **Call To Action (Plus)** (`call-to-action-block`)
- **Counter (Plus)** (`counter-block`)
- **Location Map (Plus)** (`location-map`)
- **Questions (Plus)** (`questions-block`)
- **Portfolio (Plus)** (`portfolio-block`)
- **Services (Plus)** (`services-block`)
- **Logos (Plus)** (`logos-block`)
- **Video Hero (Plus)** (`video-hero-block`)
- **Scroll Text (Plus)** (`scroll-text-block`)
- **Mega Menu (Plus)** (`mega-menu-block`)
- **Testimonial (Plus)** (`testimonial2-block`)
- **Pricing Table (Plus)** (`pricing-table-block`)
- **Feature Grid Pro (Legacy)** (`infogrid-3-block`) — archived, hidden from the inserter; kept registered so existing pages keep rendering
- **Info Grid 4** (`bento-grid-block`)
- **Case Studies (Plus)** (`case-studies-block`)
- **Video Carousel (Plus)** (`video-carousel-block`)

## Premium Blocks

These blocks are only available in the Premium version.

- **Particles Block (Premium)** (`particles-block`)
- **Project Block (Premium)** (`project-block`)
- **Industries (Premium)** (`industries-block`)
- **Popup Modal (Pro)** (`popup-modal-block`)
- **Testimonial (Premium)** (`testimonial3-block`)

## Freemium Blocks

These blocks ship in their own standalone "Freemium" distribution (`npm run deploy:freemium`), separate from Free/Plus/Premium. They register under the `adaire-freemium` inserter category and are tracked in `config/blocks-config.json` under a `freemium` tier.

- **Cookie Banner** (`cookie-consent-block`) — GDPR/CCPA/ePrivacy-style cookie consent banner. Content (title, description, categories, button labels, policy links) is edited inline via RichText/QuickZone; 9 layout positions (bottom/top bar, 4 floating corners, center modal, 2 slide-in variants); full color, typography (responsive per device), spacing, border, shadow, and button-style controls via InspectorTabs; consent categories are a fully editable repeater (label/description/required/default-on) with sensible GDPR-style defaults; behavior controls cover consent expiration, versioning, auto-hide, and a reopen "Cookie Settings" tab. Front end (`view.js`) stores consent in `localStorage`, dispatches a `window.adaireCookieConsentChange` event + `window.adaireCookieConsent` global, optionally drives Google Consent Mode v2 (`gtag('consent','update', …)`), and can gate `<script type="text/plain" data-cookie-consent="category-key">` tags until that category is accepted.

