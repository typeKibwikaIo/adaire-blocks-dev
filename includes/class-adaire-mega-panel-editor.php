<?php
/**
 * Registers the Panel Layout & Items meta box on the adaire_mega_panel edit
 * screen, and mounts the React editor (src/dashboard/mega-menu/panel-editor.js)
 * into it. Saving goes through @wordpress/api-fetch straight to the post
 * type's own REST route (no full page reload, no separate form submit) —
 * this box has no <form> fields of its own to save server-side.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Mounts the Mega Panel layout/items admin editor.
 */
class AdaireMegaPanelEditor {

	const ROOT_ELEMENT_ID = 'adaire-mega-panel-editor-root';

	/**
	 * Singleton instance.
	 *
	 * @var AdaireMegaPanelEditor|null
	 */
	private static $instance = null;

	/**
	 * Registers the hooks this class needs.
	 */
	private function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Gets the singleton instance.
	 *
	 * @return AdaireMegaPanelEditor
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Registers the meta box on the mega panel edit screen.
	 */
	public function add_meta_box() {
		add_meta_box(
			'adaire_mega_panel_layout_items',
			__( 'Panel Layout & Items', 'adaire-blocks' ),
			array( $this, 'render_meta_box' ),
			AdaireMegaPanelPostType::POST_TYPE,
			'normal',
			'high'
		);
	}

	/**
	 * Renders the meta box container the React app mounts into. All actual
	 * UI lives in JS — this is deliberately just a mount point plus a
	 * no-JS fallback notice.
	 *
	 * @param WP_Post $post Current post.
	 */
	public function render_meta_box( $post ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- Fixed callback signature required by add_meta_box(); actual data lives in the React app's localized config instead.
		?>
		<div id="<?php echo esc_attr( self::ROOT_ELEMENT_ID ); ?>">
			<p><?php esc_html_e( 'Loading panel editor…', 'adaire-blocks' ); ?></p>
		</div>
		<?php
	}

	/**
	 * Enqueues the panel editor script/style, only on this post type's
	 * edit screens (post.php / post-new.php for adaire_mega_panel).
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_assets( $hook ) {
		if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( ! $screen || AdaireMegaPanelPostType::POST_TYPE !== $screen->post_type ) {
			return;
		}

		global $post;
		if ( ! $post ) {
			return;
		}

		$asset_file = ADAIRE_BLOCKS_PLUGIN_PATH . 'build/dashboard/mega-menu/panel-editor.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return;
		}
		$asset = require $asset_file;

		wp_enqueue_script(
			'adaire-mega-panel-editor',
			ADAIRE_BLOCKS_PLUGIN_URL . 'build/dashboard/mega-menu/panel-editor.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		if ( file_exists( ADAIRE_BLOCKS_PLUGIN_PATH . 'build/dashboard/mega-menu/panel-editor.css' ) ) {
			wp_enqueue_style(
				'adaire-mega-panel-editor',
				ADAIRE_BLOCKS_PLUGIN_URL . 'build/dashboard/mega-menu/panel-editor.css',
				array( 'wp-components' ),
				$asset['version']
			);
		}

		$layout          = get_post_meta( $post->ID, AdaireMegaPanelPostType::META_LAYOUT, true );
		$items           = get_post_meta( $post->ID, AdaireMegaPanelPostType::META_ITEMS, true );
		$default_active  = get_post_meta( $post->ID, AdaireMegaPanelPostType::META_DEFAULT_ACTIVE_ID, true );
		$dynamic_source  = get_post_meta( $post->ID, AdaireMegaPanelPostType::META_DYNAMIC_SOURCE, true );

		wp_localize_script(
			'adaire-mega-panel-editor',
			'adaireMegaPanelEditor',
			array(
				'postId'            => $post->ID,
				'restUrl'           => esc_url_raw( rest_url( 'wp/v2/adaire-mega-panels/' . $post->ID ) ),
				'nonce'             => wp_create_nonce( 'wp_rest' ),
				'rootElementId'     => self::ROOT_ELEMENT_ID,
				'layout'            => $layout ? $layout : 'standard',
				'items'             => is_array( $items ) ? $items : array(),
				'defaultActiveId'   => $default_active ? $default_active : '',
				'dynamicSource'     => is_array( $dynamic_source ) ? $dynamic_source : array( 'type' => 'none' ),
				'wooCommerceActive' => class_exists( 'WooCommerce' ),
				'allowedLayouts'    => AdaireMegaPanelPostType::ALLOWED_LAYOUTS,
				'mediaTitle'        => __( 'Select an image', 'adaire-blocks' ),
			)
		);
	}
}

AdaireMegaPanelEditor::get_instance();
