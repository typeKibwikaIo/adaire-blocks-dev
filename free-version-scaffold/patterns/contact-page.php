<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

register_block_pattern( 'adaire-blocks/contact-page', array(
    'title'         => __( 'Contact Page', 'adaire-blocks' ),
    'description'   => __( 'Hero section with a two-column contact layout.', 'adaire-blocks' ),
    'categories'    => array( 'adaire-blocks-templates' ),
    'keywords'      => array( 'contact', 'get in touch', 'form', 'location' ),
    'blockTypes'    => array( 'core/post-content' ),
    'templateTypes' => array( 'page' ),
    'viewportWidth' => 1400,
    'content'       => '<!-- wp:create-block/saas-hero-block -->
<section class="wp-block-create-block-saas-hero-block adaire-saas-hero layout-centered bg-type-solid" style="--ad-accent:#6366f1;--ad-color:#111827;--ad-bg-color:#ffffff;--ad-bg-gradient:linear-gradient(135deg, #6366f1, #8b5cf6);--ad-bg-image:none;--ad-bg-image-size:cover;--ad-bg-image-position:center;--ad-bg-image-repeat:no-repeat;--ad-button-primary-color:#ffffff;--ad-button-primary-bg:#6366f1;--ad-button-secondary-color:#111827;--ad-button-secondary-bg:#ffffff;--ad-button-hover-color:#ffffff;--ad-button-hover-bg:#111827;--ad-button-hover-border:#111827;--ad-radius:12px;--ad-padding:80px;--ad-font-size:16px;--ad-pill-bg:#dbeafe;--ad-pill-color:#1e40af;--ad-gradient-start:#6366f1;--ad-gradient-end:#8b5cf6;--ad-cta-gap:16px;--ad-cta-padding-v:14px;--ad-cta-padding-h:32px;--ad-cta-radius:12px;--ad-cta-align:center;--ad-media-radius:12px;--ad-media-spacing:48px;--ad-media-shadow:0 20px 60px rgba(0, 0, 0, 0.15);--ad-effect-gradient-overlay:linear-gradient(135deg, #6366f1, #8b5cf6);--ad-effect-gradient-overlay-opacity:0.3;--ad-effect-glow-color:#6366f1;--ad-rating-align:center;--ad-font-family:inherit;--ad-eyebrow-font-size:14px;--ad-eyebrow-font-weight:600;--ad-eyebrow-line-height:normal;--ad-eyebrow-letter-spacing:1px;--ad-eyebrow-text-transform:uppercase;--ad-heading-font-size:clamp(36px, 5vw, 64px);--ad-heading-font-weight:800;--ad-heading-line-height:1.2;--ad-heading-letter-spacing:normal;--ad-heading-text-transform:none;--ad-body-text-font-weight:400;--ad-body-text-line-height:1.6;--ad-body-text-letter-spacing:normal;--ad-body-text-text-transform:none;--ad-pill-font-size:14px;--ad-pill-font-weight:600;--ad-pill-line-height:normal;--ad-pill-letter-spacing:normal;--ad-pill-text-transform:none;--ad-button-font-size:16px;--ad-button-font-weight:600;--ad-button-line-height:normal;--ad-button-letter-spacing:normal;--ad-button-text-transform:none;--ad-micro-copy-font-size:14px;--ad-micro-copy-font-weight:400;--ad-micro-copy-line-height:normal;--ad-micro-copy-letter-spacing:normal;--ad-micro-copy-text-transform:none"><div class="adaire-saas-hero__container"><div class="adaire-saas-hero__pill"><span>New: v2.0 Release</span></div><div class="adaire-saas-hero__content"><div class="adaire-saas-hero__text"><p class="adaire-saas-hero__eyebrow">Scale faster</p><h1 class="adaire-saas-hero__heading has-gradient">Launch your SaaS faster</h1><p class="adaire-saas-hero__text">A modern hero section for software products, startups, and landing pages.</p><div class="adaire-saas-hero__cta"><a href="#" class="adaire-saas-hero__button adaire-saas-hero__button--primary">Get Started</a><a href="#" class="adaire-saas-hero__button adaire-saas-hero__button--secondary">Book a Demo</a></div></div></div></div></section>
<!-- /wp:create-block/saas-hero-block -->
<!-- wp:columns {"style":{"spacing":{"padding":{"top":"4rem","bottom":"4rem"}}}} -->
<!-- wp:column -->
<!-- wp:heading {"level":3} --><h3>Get In Touch</h3><!-- /wp:heading -->
<p class="wp-block-paragraph">Reach out and we\'ll get back to you as soon as possible.</p>
<!-- wp:paragraph --><p>&#128231; hello@yoursite.com</p><!-- /wp:paragraph -->
<!-- wp:paragraph --><p>&#128222; +1 (555) 000-0000</p><!-- /wp:paragraph -->
<!-- /wp:column -->
<!-- wp:column -->
<!-- wp:heading {"level":3} --><h3>Send a Message</h3><!-- /wp:heading -->
<!-- wp:paragraph --><p>Add your contact form here.</p><!-- /wp:paragraph -->
<!-- /wp:column -->
<!-- /wp:columns -->',
) );
