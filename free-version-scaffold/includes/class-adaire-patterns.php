<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Adaire_Patterns {

    public static function init() {
        register_block_pattern_category( 'adaire-blocks-templates', array(
            'label'       => __( 'Guten-Blocks Templates', 'adaire-blocks' ),
            'description' => __( 'Starter page templates built with Guten-Blocks.', 'adaire-blocks' ),
        ) );

        $pattern_dir = ADAIRE_BLOCKS_PLUGIN_PATH . 'patterns/';

        if ( ! is_dir( $pattern_dir ) ) {
            return;
        }

        foreach ( glob( $pattern_dir . '*.php' ) as $file ) {
            require $file;
        }
    }
}
