<?php
register_block_pattern( 'adaire-blocks/contact-page', array(
    'title'         => __( 'Contact Page', 'adaire-blocks' ),
    'description'   => __( 'Hero section with a two-column contact layout.', 'adaire-blocks' ),
    'categories'    => array( 'adaire-blocks-templates' ),
    'keywords'      => array( 'contact', 'get in touch', 'form', 'location' ),
    'blockTypes'    => array( 'core/post-content' ),
    'templateTypes' => array( 'page' ),
    'viewportWidth' => 1400,
    'content'       => '<!-- wp:create-block/hero-1-block /-->
<!-- wp:columns {"style":{"spacing":{"padding":{"top":"4rem","bottom":"4rem"}}}} -->
<!-- wp:column -->
<!-- wp:heading {"level":3} --><h3>Get In Touch</h3><!-- /wp:heading -->
<!-- wp:paragraph --><p>Reach out and we\'ll get back to you as soon as possible.</p><!-- /wp:paragraph -->
<!-- wp:paragraph --><p>📧 hello@yoursite.com</p><!-- /wp:paragraph -->
<!-- wp:paragraph --><p>📞 +1 (555) 000-0000</p><!-- /wp:paragraph -->
<!-- /wp:column -->
<!-- wp:column -->
<!-- wp:heading {"level":3} --><h3>Send a Message</h3><!-- /wp:heading -->
<!-- wp:paragraph --><p>Add your contact form here.</p><!-- /wp:paragraph -->
<!-- /wp:column -->
<!-- /wp:columns -->',
) );
