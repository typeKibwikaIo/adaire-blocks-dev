<?php
register_block_pattern( 'adaire-blocks/blog-landing', array(
    'title'         => __( 'Blog Landing', 'adaire-blocks' ),
    'description'   => __( 'Hero section followed by a posts grid.', 'adaire-blocks' ),
    'categories'    => array( 'adaire-blocks-templates' ),
    'keywords'      => array( 'blog', 'posts', 'articles', 'grid' ),
    'blockTypes'    => array( 'core/post-content' ),
    'templateTypes' => array( 'page' ),
    'viewportWidth' => 1400,
    'content'       => '<!-- wp:create-block/hero-1-block /-->
<!-- wp:create-block/posts-grid-block /-->',
) );
