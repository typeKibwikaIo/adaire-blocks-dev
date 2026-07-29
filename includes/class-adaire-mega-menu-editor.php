<?php
/**
 * Editor-only wiring for the mega-menu-item block: extends Core Navigation's
 * allowed inner blocks so "GutenBlocks Mega Menu Item" can be inserted
 * inside it, per the block.json `"parent": ["core/navigation"]` contract.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extends Core Navigation's allowed blocks in the editor.
 */
class AdaireMegaMenuEditor {

	/**
	 * Singleton instance.
	 *
	 * @var AdaireMegaMenuEditor|null
	 */
	private static $instance = null;

	/**
	 * Registers the hooks this class needs.
	 */
	private function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_nav_extension' ) );
	}

	/**
	 * Gets the singleton instance.
	 *
	 * @return AdaireMegaMenuEditor
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * A small inline script (no build step needed) that adds
	 * adaire/mega-menu-item to core/navigation's allowedBlocks exactly
	 * once, guarding against the filter being applied more than once (e.g.
	 * if another plugin re-triggers block registration).
	 */
	public function enqueue_nav_extension() {
		$script = <<<'JS'
( function ( wp ) {
	if ( ! wp || ! wp.hooks || ! wp.hooks.addFilter ) {
		return;
	}

	var FILTER_NAME = 'gutenblocks/add-mega-menu-to-navigation';

	if ( wp.hooks.hasFilter( 'blocks.registerBlockType', FILTER_NAME ) ) {
		return;
	}

	wp.hooks.addFilter(
		'blocks.registerBlockType',
		FILTER_NAME,
		function ( settings, blockName ) {
			if ( blockName !== 'core/navigation' ) {
				return settings;
			}

			var allowedBlocks = settings.allowedBlocks || [];

			if ( allowedBlocks.indexOf( 'adaire/mega-menu-item' ) !== -1 ) {
				return settings;
			}

			return Object.assign( {}, settings, {
				allowedBlocks: allowedBlocks.concat( [ 'adaire/mega-menu-item' ] ),
			} );
		}
	);
} )( window.wp );
JS;

		wp_add_inline_script( 'wp-blocks', $script, 'after' );
	}
}

AdaireMegaMenuEditor::get_instance();
