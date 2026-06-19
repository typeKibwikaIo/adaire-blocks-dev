<?php
register_block_pattern( 'adaire-blocks/services-page', array(
    'title'         => __( 'Services Page', 'adaire-blocks' ),
    'description'   => __( 'Hero, info grid, pricing table, and call-to-action.', 'adaire-blocks' ),
    'categories'    => array( 'adaire-blocks-templates' ),
    'keywords'      => array( 'services', 'pricing', 'features', 'grid' ),
    'blockTypes'    => array( 'core/post-content' ),
    'templateTypes' => array( 'page' ),
    'viewportWidth' => 1400,
    'content'       => '<!-- wp:create-block/hero-1-block /-->
<!-- wp:create-block/infogrid-block /-->
<!-- wp:create-block/pricing-table-block /-->
<!-- wp:create-block/button-block /-->',
) );
