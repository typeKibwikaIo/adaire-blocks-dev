<?php
/**
 * Registers the adaire_mega_panel custom post type.
 *
 * Mega panels are reusable dropdown content blocks, authored with the block
 * editor and managed centrally from the Mega Menu dashboard, then referenced
 * (never duplicated) by the adaire/mega-menu-item block and by nav menu
 * items via the panel-assignment fields added to Appearance > Menus.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and manages the adaire_mega_panel post type.
 */
class AdaireMegaPanelPostType {

	const POST_TYPE              = 'adaire_mega_panel';
	const META_ENABLED           = '_adaire_mega_panel_enabled';
	const META_LAYOUT            = '_adaire_mega_panel_layout';
	const META_ITEMS             = '_adaire_mega_panel_items';
	const META_SCHEMA_VERSION    = '_adaire_mega_panel_schema_version';
	const META_DEFAULT_ACTIVE_ID = '_adaire_mega_panel_default_active_id';
	const META_DYNAMIC_SOURCE    = '_adaire_mega_panel_dynamic_source';
	const CURRENT_SCHEMA_VERSION = 1;

	const ALLOWED_LAYOUTS = array( 'standard', 'tabbed', 'showcase', 'gallery', 'link-list' );

	/**
	 * Singleton instance.
	 *
	 * @var AdaireMegaPanelPostType|null
	 */
	private static $instance = null;

	/**
	 * Registers the hooks this class needs.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'add_meta_boxes', array( $this, 'add_enabled_meta_box' ) );
		add_action( 'save_post_' . self::POST_TYPE, array( $this, 'save_enabled_meta' ) );
	}

	/**
	 * Gets the singleton instance.
	 *
	 * @return AdaireMegaPanelPostType
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Register the adaire_mega_panel post type.
	 *
	 * Not public/queryable: panels are never standalone pages and never
	 * appear in public search or archives. They are only reachable through
	 * the block editor (for authoring) and the REST API (for the mega-menu
	 * item block's panel picker and the render callback's content lookup).
	 */
	public function register_post_type() {
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => array(
					'name'               => __( 'Mega Panels', 'adaire-blocks' ),
					'singular_name'      => __( 'Mega Panel', 'adaire-blocks' ),
					'add_new'            => __( 'Add New Panel', 'adaire-blocks' ),
					'add_new_item'       => __( 'Add New Mega Panel', 'adaire-blocks' ),
					'edit_item'          => __( 'Edit Mega Panel', 'adaire-blocks' ),
					'new_item'           => __( 'New Mega Panel', 'adaire-blocks' ),
					'view_item'          => __( 'View Mega Panel', 'adaire-blocks' ),
					'search_items'       => __( 'Search Mega Panels', 'adaire-blocks' ),
					'not_found'          => __( 'No mega panels found', 'adaire-blocks' ),
					'not_found_in_trash' => __( 'No mega panels found in Trash', 'adaire-blocks' ),
				),
				'public'              => false,
				'publicly_queryable'  => false,
				'show_ui'             => true,
				'show_in_menu'        => false,
				'show_in_admin_bar'   => false,
				'show_in_rest'        => true,
				'rest_base'           => 'adaire-mega-panels',
				'exclude_from_search' => true,
				'has_archive'         => false,
				'rewrite'             => false,
				'query_var'           => false,
				// 'custom-fields' is required for WP_REST_Posts_Controller to
				// expose a 'meta' property in this post type's REST schema at
				// all -- without it, register_post_meta()'s show_in_rest is
				// silently ignored for this post type (the field never appears
				// in GET responses or POST bodies), which would break the panel
				// editor's entire save/load path even though every individual
				// meta field is registered correctly. This does not add the
				// classic-editor custom-fields meta box UI, since that panel is
				// opt-in per screen, not forced on by this support flag alone.
				'supports'            => array( 'title', 'editor', 'revisions', 'custom-fields' ),
				// Deliberately NOT a custom 'capabilities' array: mapping more
				// than one meta capability (edit_post/read_post/delete_post) to
				// the same string corrupts WordPress's global
				// $post_type_meta_caps lookup table, which breaks
				// current_user_can( 'manage_options' ) site-wide for every
				// user (WP's own map_meta_cap() falls through to the last
				// mapping registered and re-checks it as a meta capability
				// with no object, which always denies). Plain 'post'
				// capability_type gives exactly the desired "administrators
				// (and anyone else with post-editing capabilities) can
				// manage panels" behaviour with zero custom capability
				// strings, so there is nothing to collide.
				'capability_type'     => 'post',
				'map_meta_cap'        => true,
			)
		);

		$this->register_meta();
	}

	/**
	 * Registers the panel-layout and structured-items meta fields, exposed
	 * through the post type's own REST route (no separate REST controller
	 * needed — register_post_meta()'s show_in_rest already validates
	 * against the given schema and applies sanitize_callback on write).
	 */
	private function register_meta() {
		register_post_meta(
			self::POST_TYPE,
			self::META_LAYOUT,
			array(
				'type'              => 'string',
				'single'            => true,
				'default'           => 'standard',
				'show_in_rest'      => array(
					'schema' => array(
						'type' => 'string',
						'enum' => self::ALLOWED_LAYOUTS,
					),
				),
				'sanitize_callback' => array( __CLASS__, 'sanitize_layout' ),
				'auth_callback'     => array( __CLASS__, 'can_edit_meta' ),
			)
		);

		register_post_meta(
			self::POST_TYPE,
			self::META_ITEMS,
			array(
				'type'              => 'array',
				'single'            => true,
				'default'           => array(),
				'show_in_rest'      => array(
					'schema' => array(
						'type'  => 'array',
						'items' => AdaireMegaPanelItemSanitizer::get_item_schema(),
					),
				),
				'sanitize_callback' => array( 'AdaireMegaPanelItemSanitizer', 'sanitize_items' ),
				'auth_callback'     => array( __CLASS__, 'can_edit_meta' ),
			)
		);

		register_post_meta(
			self::POST_TYPE,
			self::META_SCHEMA_VERSION,
			array(
				'type'              => 'integer',
				'single'            => true,
				'default'           => self::CURRENT_SCHEMA_VERSION,
				'show_in_rest'      => true,
				'sanitize_callback' => 'absint',
				'auth_callback'     => array( __CLASS__, 'can_edit_meta' ),
			)
		);

		register_post_meta(
			self::POST_TYPE,
			self::META_DEFAULT_ACTIVE_ID,
			array(
				'type'              => 'string',
				'single'            => true,
				'default'           => '',
				'show_in_rest'      => true,
				'sanitize_callback' => 'sanitize_key',
				'auth_callback'     => array( __CLASS__, 'can_edit_meta' ),
			)
		);

		// Used by the flat gallery/link-list layouts only: populates the
		// panel's top-level items from a live query instead of the
		// manually-authored items, when set to anything other than 'none'.
		register_post_meta(
			self::POST_TYPE,
			self::META_DYNAMIC_SOURCE,
			array(
				'type'              => 'object',
				'single'            => true,
				'default'           => array( 'type' => 'none' ),
				'show_in_rest'      => array(
					'schema' => AdaireMegaPanelItemSanitizer::get_dynamic_source_schema(),
				),
				'sanitize_callback' => array( 'AdaireMegaPanelItemSanitizer', 'sanitize_dynamic_source' ),
				'auth_callback'     => array( __CLASS__, 'can_edit_meta' ),
			)
		);
	}

	/**
	 * Sanitizes the layout meta value, falling back to "standard" for
	 * anything not in the allowed enum rather than saving an invalid value.
	 *
	 * @param mixed $value Raw layout value.
	 * @return string
	 */
	public static function sanitize_layout( $value ) {
		$value = sanitize_key( (string) $value );
		return in_array( $value, self::ALLOWED_LAYOUTS, true ) ? $value : 'standard';
	}

	/**
	 * Auth callback for the panel meta fields: only users who could edit
	 * the panel itself may read/write its structured layout data via REST.
	 *
	 * @param bool   $allowed   Whether the value may be edited (default false).
	 * @param string $meta_key  Meta key being checked.
	 * @param int    $post_id   Post the meta belongs to.
	 * @return bool
	 */
	public static function can_edit_meta( $allowed, $meta_key, $post_id ) {
		return current_user_can( 'edit_post', $post_id );
	}

	/**
	 * A simple publish/disable toggle distinct from post_status. Publishing
	 * the post makes the *content* ready; disabling lets an editor pull a
	 * panel from every location it's referenced in without deleting or
	 * unpublishing it (e.g. temporarily, or while it's being reworked).
	 */
	public function add_enabled_meta_box() {
		add_meta_box(
			'adaire_mega_panel_enabled',
			__( 'Mega Panel Status', 'adaire-blocks' ),
			array( $this, 'render_enabled_meta_box' ),
			self::POST_TYPE,
			'side',
			'high'
		);
	}

	/**
	 * Renders the enabled/disabled checkbox meta box.
	 *
	 * @param WP_Post $post Current post.
	 */
	public function render_enabled_meta_box( $post ) {
		wp_nonce_field( 'adaire_mega_panel_enabled_save', 'adaire_mega_panel_enabled_nonce' );
		$enabled = self::is_enabled( $post->ID );
		?>
		<label for="adaire_mega_panel_enabled_field">
			<input
				type="checkbox"
				id="adaire_mega_panel_enabled_field"
				name="adaire_mega_panel_enabled_field"
				value="1"
				<?php checked( $enabled ); ?>
			/>
			<?php esc_html_e( 'Enabled (visible everywhere it is assigned)', 'adaire-blocks' ); ?>
		</label>
		<p class="description">
			<?php esc_html_e( 'Disabling a panel hides it from every menu item and block that references it, without unpublishing or deleting it.', 'adaire-blocks' ); ?>
		</p>
		<?php
	}

	/**
	 * Saves the enabled/disabled checkbox on post save.
	 *
	 * @param int $post_id Post being saved.
	 */
	public function save_enabled_meta( $post_id ) {
		if ( ! isset( $_POST['adaire_mega_panel_enabled_nonce'] ) ||
			! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['adaire_mega_panel_enabled_nonce'] ) ), 'adaire_mega_panel_enabled_save' )
		) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		$enabled = isset( $_POST['adaire_mega_panel_enabled_field'] );
		update_post_meta( $post_id, self::META_ENABLED, $enabled ? '1' : '0' );
	}

	/**
	 * Whether a panel is enabled. Defaults to enabled so existing panels
	 * (created before this meta existed) keep working.
	 *
	 * @param int $post_id Panel post id.
	 * @return bool
	 */
	public static function is_enabled( $post_id ) {
		$value = get_post_meta( $post_id, self::META_ENABLED, true );
		return '' === $value || '1' === $value;
	}

	/**
	 * Whether a given post ID is a usable, publicly-safe mega panel: it
	 * exists, is the right post type, is published, and is enabled. This is
	 * the single source of truth the render callback and REST filtering
	 * should both use so a draft or disabled panel is never exposed.
	 *
	 * @param int $post_id Panel post id.
	 * @return bool
	 */
	public static function is_publicly_usable( $post_id ) {
		$panel = get_post( $post_id );

		if ( ! $panel || self::POST_TYPE !== $panel->post_type || 'publish' !== $panel->post_status ) {
			return false;
		}

		return self::is_enabled( $panel->ID );
	}
}

AdaireMegaPanelPostType::get_instance();
