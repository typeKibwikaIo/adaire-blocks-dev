<?php
register_block_pattern( 'adaire-blocks/landing-page', array(
    'title'         => __( 'Home Page', 'adaire-blocks' ),
    'description'   => __( 'SaaS hero, advanced features grid, pricing plans, timeline, and customer reviews.', 'adaire-blocks' ),
    'categories'    => array( 'adaire-blocks-templates' ),
    'keywords'      => array( 'home', 'landing', 'saas', 'hero', 'features', 'pricing', 'timeline', 'reviews' ),
    'blockTypes'    => array( 'core/post-content' ),
    'templateTypes' => array( 'page' ),
    'viewportWidth' => 1400,
    'content'       => '<!-- wp:create-block/saas-hero-block /-->
<!-- wp:create-block/infogrid-2-block {"containerMode":"constrained","responsiveMaxWidth":{"mobile":{"value":100,"unit":"%"},"tablet":{"value":100,"unit":"%"},"smallLaptop":{"value":1340,"unit":"px"},"desktop":{"value":1340,"unit":"px"},"bigDesktop":{"value":1340,"unit":"px"}}} /-->
<!-- wp:create-block/pricing-table-block {"containerMode":"constrained","containerMaxWidth":{"desktop":{"value":1340,"unit":"px"},"tablet":{"value":100,"unit":"%"},"mobile":{"value":100,"unit":"%"}}} /-->
<!-- wp:create-block/timeline-block /-->
<!-- wp:create-block/testimonial-block {"containerMode":"constrained","containerMaxWidth":{"desktop":{"value":1340,"unit":"px"},"tablet":{"value":100,"unit":"%"},"mobile":{"value":100,"unit":"%"}}} /-->',
) );
