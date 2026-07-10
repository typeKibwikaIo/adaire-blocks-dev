<?php
register_block_pattern( 'adaire-blocks/contact-page', array(
    'title'         => __( 'Contact Page', 'adaire-blocks' ),
    'description'   => __( 'Hero section with a two-column contact layout.', 'adaire-blocks' ),
    'categories'    => array( 'adaire-blocks-templates' ),
    'keywords'      => array( 'contact', 'get in touch', 'form', 'location' ),
    'blockTypes'    => array( 'core/post-content' ),
    'templateTypes' => array( 'page' ),
    'viewportWidth' => 1400,
    'content'       => '<!-- wp:create-block/saas-hero-block -->
<section class="adaire-saas-hero layout-centered bg-type-solid" style="--ad-accent:#6366f1;--ad-color:#111827;--ad-bg-color:#ffffff;--ad-bg-gradient:linear-gradient(135deg, #6366f1, #8b5cf6);--ad-bg-image:none;--ad-bg-image-size:cover;--ad-bg-image-position:center;--ad-bg-image-repeat:no-repeat;--ad-button-primary-color:#ffffff;--ad-button-primary-bg:#6366f1;--ad-button-secondary-color:#111827;--ad-button-secondary-bg:#ffffff;--ad-button-hover-color:#ffffff;--ad-button-hover-bg:#111827;--ad-button-hover-border:#111827;--ad-radius:12px;--ad-padding:80px;--ad-font-size:16px;--ad-pill-bg:#dbeafe;--ad-pill-color:#1e40af;--ad-gradient-start:#6366f1;--ad-gradient-end:#8b5cf6;--ad-cta-gap:16px;--ad-cta-padding-v:14px;--ad-cta-padding-h:32px;--ad-cta-radius:12px;--ad-cta-align:center;--ad-media-radius:12px;--ad-media-spacing:48px;--ad-media-shadow:0 20px 60px rgba(0, 0, 0, 0.15);--ad-trust-item-width:auto;--ad-trust-item-gap:32px;--ad-trust-logo-max-height:32px;--ad-trust-carousel-speed:30s;--ad-trust-visible-items:5;--ad-trust-dir:-1;--ad-effect-gradient-overlay:linear-gradient(135deg, #6366f1, #8b5cf6);--ad-effect-gradient-overlay-opacity:0.3;--ad-effect-glow-color:#6366f1;--ad-rating-align:center;--ad-security-bg:#f8fafc;--ad-security-color:#111827"><div class="adaire-saas-hero__container"><div class="adaire-saas-hero__pill"><span>New: v2.0 Release</span></div><div class="adaire-saas-hero__content"><div class="adaire-saas-hero__text"><p class="adaire-saas-hero__eyebrow">Scale faster</p><h1 class="adaire-saas-hero__heading has-gradient">Launch your SaaS faster</h1><p class="adaire-saas-hero__text">A modern hero section for software products, startups, and landing pages.</p><div class="adaire-saas-hero__cta"><a href="#" class="adaire-saas-hero__button adaire-saas-hero__button--primary">Get Started</a><a href="#" class="adaire-saas-hero__button adaire-saas-hero__button--secondary">Book a Demo</a></div></div></div><div class="adaire-saas-hero__trust-bar trust-layout-row   is-pause-on-hover"><p class="adaire-saas-hero__trust-title">Trusted by</p><div class="adaire-saas-hero__trust-logos-wrap"><div class="adaire-saas-hero__trust-logos"><span class="adaire-saas-hero__trust-logo"><span class="adaire-saas-hero__trust-logo-text">Acme</span></span><span class="adaire-saas-hero__trust-logo"><span class="adaire-saas-hero__trust-logo-text">Velocity</span></span><span class="adaire-saas-hero__trust-logo"><span class="adaire-saas-hero__trust-logo-text">Atlas</span></span><span class="adaire-saas-hero__trust-logo"><span class="adaire-saas-hero__trust-logo-text">Nexus</span></span><span class="adaire-saas-hero__trust-logo"><span class="adaire-saas-hero__trust-logo-text">Prime</span></span></div></div></div></div></section>
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
