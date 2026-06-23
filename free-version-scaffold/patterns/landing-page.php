<?php
register_block_pattern( 'adaire-blocks/landing-page', array(
    'title'         => __( 'Home Page', 'adaire-blocks' ),
    'description'   => __( 'SaaS hero, advanced features grid, pricing plans, customer reviews, and card slider.', 'adaire-blocks' ),
    'categories'    => array( 'adaire-blocks-templates' ),
    'keywords'      => array( 'home', 'landing', 'saas', 'hero', 'features', 'pricing', 'reviews' ),
    'blockTypes'    => array( 'core/post-content' ),
    'templateTypes' => array( 'page' ),
    'viewportWidth' => 1400,
    'content'       => '<!-- wp:create-block/saas-hero-block /-->
<!-- wp:create-block/infogrid-2-block /-->
<!-- wp:create-block/pricing-table-block /-->
<!-- wp:create-block/testimonial-block /-->
<!-- wp:create-block/card-scroll-block --><!-- wp:create-block/card-scroll-item-block {"title":"Discover the Product","description":"Get a feel for what makes our platform different — explore the features that teams love most."} --><!-- /wp:create-block/card-scroll-item-block --><!-- wp:create-block/card-scroll-item-block {"title":"Set Up in Minutes","description":"Connect your tools, import your content, and go live faster than you thought possible."} --><!-- /wp:create-block/card-scroll-item-block --><!-- wp:create-block/card-scroll-item-block {"title":"Grow with Confidence","description":"Scale your presence knowing our infrastructure handles the load so you never miss a beat."} --><!-- /wp:create-block/card-scroll-item-block --><!-- /wp:create-block/card-scroll-block -->',
) );
