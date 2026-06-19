<?php
register_block_pattern( 'adaire-blocks/landing-page', array(
    'title'         => __( 'Landing Page', 'adaire-blocks' ),
    'description'   => __( 'Hero, features grid, testimonial, and call-to-action.', 'adaire-blocks' ),
    'categories'    => array( 'adaire-blocks-templates' ),
    'keywords'      => array( 'landing', 'marketing', 'hero', 'features', 'cta' ),
    'blockTypes'    => array( 'core/post-content' ),
    'templateTypes' => array( 'page' ),
    'viewportWidth' => 1400,
    'content'       => '<!-- wp:create-block/saas-hero-block /-->
<!-- wp:create-block/icon-box-block /-->
<!-- wp:create-block/testimonial-block /-->
<!-- wp:create-block/button-block /-->',
) );
