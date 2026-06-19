<?php
register_block_pattern( 'adaire-blocks/about-page', array(
    'title'         => __( 'About Page', 'adaire-blocks' ),
    'description'   => __( 'Hero, about section, timeline, and testimonial.', 'adaire-blocks' ),
    'categories'    => array( 'adaire-blocks-templates' ),
    'keywords'      => array( 'about', 'story', 'team', 'timeline', 'history' ),
    'blockTypes'    => array( 'core/post-content' ),
    'templateTypes' => array( 'page' ),
    'viewportWidth' => 1400,
    'content'       => '<!-- wp:create-block/hero-1-block /-->
<!-- wp:create-block/about-us-block /-->
<!-- wp:create-block/timeline-block /-->
<!-- wp:create-block/testimonial-block /-->',
) );
