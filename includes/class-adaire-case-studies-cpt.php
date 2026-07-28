<?php
/**
 * Case Studies Management — custom post type for the Case Studies block.
 *
 * Registers the `adaire_case_study` post type (plus two taxonomies:
 * Industries and Capabilities) so site owners can add/edit case studies
 * from the WordPress dashboard instead of the block's own repeater UI.
 * Everything is nested under the existing top-level "Adaire Blocks" admin
 * menu (see admin/settings-page.php, menu slug `adaire-blocks-settings`).
 *
 * The Case Studies block (src/case-studies-block) reads this data live at
 * render time — see src/case-studies-block/render.php — as its sole data
 * source; there's no manual per-block data entry. Each case study also gets
 * its own full detail page (templates/single-adaire_case_study.php) that
 * the block's cards link straight to.
 *
 * @package AdaireBlocks
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AdaireCaseStudiesCPT {

	private static $instance = null;

	const POST_TYPE          = 'adaire_case_study';
	const TAX_INDUSTRY       = 'adaire_case_industry';
	const TAX_CAPABILITY     = 'adaire_case_capability';
	const PARENT_MENU_SLUG   = 'adaire-blocks-settings';
	const META_CLIENT        = '_adaire_case_client';
	const META_COUNTRY       = '_adaire_case_country';
	const META_LANGUAGE      = '_adaire_case_language';
	const META_TECHNOLOGY    = '_adaire_case_technology';
	const META_LINK_URL      = '_adaire_case_link_url';
	const META_OPEN_NEW_TAB  = '_adaire_case_open_in_new_tab';
	const META_SUMMARY       = '_adaire_case_summary';
	const NONCE_ACTION       = 'adaire_case_study_save_details';
	const NONCE_FIELD        = 'adaire_case_study_nonce';

	// Bump this whenever the post type/taxonomy rewrite structure changes
	// (slug, has_archive, etc.) to force every site running this plugin to
	// re-flush its rewrite rules once on the next request.
	const REWRITE_VERSION    = 2;
	const REWRITE_OPTION     = 'adaire_case_studies_rewrite_version';

	private function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'init', array( $this, 'register_taxonomies' ) );
		add_action( 'init', array( $this, 'register_meta' ) );
		// Priority 20 so this always runs after the registrations above have
		// already executed earlier in the same 'init' pass.
		add_action( 'init', array( $this, 'maybe_flush_rewrite_rules' ), 20 );
		add_action( 'add_meta_boxes_' . self::POST_TYPE, array( $this, 'add_meta_boxes' ) );
		add_action( 'save_post_' . self::POST_TYPE, array( $this, 'save_meta_box' ), 10, 2 );
		// Full single case-study page (hero, info grid, long-form content,
		// "Read more case studies"), themeable via single-adaire_case_study.php.
		add_filter( 'template_include', array( $this, 'single_template' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_single_template_assets' ) );
	}

	/**
	 * Serves a bundled single-case-study template unless the active theme
	 * provides its own `single-adaire_case_study.php`, matching the standard
	 * plugin-provided-fallback-template pattern.
	 */
	public function single_template( $template ) {
		if ( ! is_singular( self::POST_TYPE ) ) {
			return $template;
		}

		$theme_template = locate_template( 'single-' . self::POST_TYPE . '.php' );
		if ( $theme_template ) {
			return $theme_template;
		}

		$plugin_template = ADAIRE_BLOCKS_PLUGIN_PATH . 'templates/single-' . self::POST_TYPE . '.php';
		if ( file_exists( $plugin_template ) ) {
			return $plugin_template;
		}

		return $template;
	}

	/**
	 * Loads the single-case-study stylesheet only on that template — no
	 * point loading it site-wide.
	 */
	public function enqueue_single_template_assets() {
		if ( ! is_singular( self::POST_TYPE ) ) {
			return;
		}

		wp_enqueue_style(
			'adaire-case-study-single',
			ADAIRE_BLOCKS_PLUGIN_URL . 'templates/single-case-study.css',
			array(),
			file_exists( ADAIRE_BLOCKS_PLUGIN_PATH . 'templates/single-case-study.css' )
				? filemtime( ADAIRE_BLOCKS_PLUGIN_PATH . 'templates/single-case-study.css' )
				: false
		);
	}

	/**
	 * Registering a new post type/taxonomy doesn't take effect for actual
	 * front-end URLs until WordPress's rewrite rules are regenerated —
	 * normally that only happens when a theme/plugin is activated or
	 * someone visits Settings > Permalinks and saves. Since this CPT was
	 * added to an already-active plugin, single case study URLs (and the
	 * archive) would 404 until that flush happens. This runs it once,
	 * automatically, the next time any page loads — no manual Permalinks
	 * visit required — and re-runs it again only if REWRITE_VERSION changes.
	 */
	public function maybe_flush_rewrite_rules() {
		if ( (int) get_option( self::REWRITE_OPTION ) !== self::REWRITE_VERSION ) {
			flush_rewrite_rules();
			update_option( self::REWRITE_OPTION, self::REWRITE_VERSION );
		}
	}

	/**
	 * register_activation_hook() callback (wired up in adaire-blocks.php).
	 * The "correct" way to flush rewrite rules for a CPT — only on
	 * activation/deactivation, never on every request. Registers the post
	 * type/taxonomies first so they exist in the rewrite rules WordPress is
	 * about to generate, matching the standard recommended pattern.
	 */
	public static function activate() {
		$instance = self::get_instance();
		$instance->register_post_type();
		$instance->register_taxonomies();
		flush_rewrite_rules();
		update_option( self::REWRITE_OPTION, self::REWRITE_VERSION );
	}

	/**
	 * register_deactivation_hook() callback.
	 */
	public static function deactivate() {
		flush_rewrite_rules();
	}

	/**
	 * Get singleton instance
	 */
	public static function get_instance() {
		if ( self::$instance === null ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Register the `adaire_case_study` custom post type.
	 *
	 * `show_in_menu` points at the plugin's existing top-level "Adaire
	 * Blocks" admin menu, so WordPress nests "Case Studies" / "Add New"
	 * under it automatically instead of adding a second top-level item.
	 */
	public function register_post_type() {
		$labels = array(
			'name'                  => __( 'Case Studies', 'adaire-blocks' ),
			'singular_name'         => __( 'Case Study', 'adaire-blocks' ),
			'menu_name'             => __( 'Case Studies', 'adaire-blocks' ),
			'add_new'               => __( 'Add New', 'adaire-blocks' ),
			'add_new_item'          => __( 'Add New Case Study', 'adaire-blocks' ),
			'edit_item'             => __( 'Edit Case Study', 'adaire-blocks' ),
			'new_item'              => __( 'New Case Study', 'adaire-blocks' ),
			'view_item'             => __( 'View Case Study', 'adaire-blocks' ),
			'view_items'            => __( 'View Case Studies', 'adaire-blocks' ),
			'search_items'          => __( 'Search Case Studies', 'adaire-blocks' ),
			'not_found'             => __( 'No case studies found.', 'adaire-blocks' ),
			'not_found_in_trash'    => __( 'No case studies found in Trash.', 'adaire-blocks' ),
			'all_items'             => __( 'Case Studies', 'adaire-blocks' ),
			'archives'              => __( 'Case Study Archives', 'adaire-blocks' ),
			'featured_image'        => __( 'Card / Cover Image', 'adaire-blocks' ),
			'set_featured_image'    => __( 'Set card image', 'adaire-blocks' ),
			'remove_featured_image' => __( 'Remove card image', 'adaire-blocks' ),
			'use_featured_image'    => __( 'Use as card image', 'adaire-blocks' ),
		);

		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => $labels,
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => self::PARENT_MENU_SLUG,
				'show_in_admin_bar'   => false,
				'show_in_rest'        => true,
				'rest_base'           => 'adaire-case-studies',
				'menu_position'       => null,
				'has_archive'         => 'case-studies',
				'exclude_from_search' => false,
				'hierarchical'        => false,
				'supports'            => array( 'title', 'editor', 'excerpt', 'thumbnail', 'custom-fields' ),
				'rewrite'             => array( 'slug' => 'case-studies' ),
			)
		);
	}

	/**
	 * Register the Industries (hierarchical, like Category) and
	 * Capabilities (flat, like Tags) taxonomies. Both map directly onto
	 * the `industry` (single value) and `capabilities` (array) fields the
	 * block already uses for its filter dropdowns.
	 */
	public function register_taxonomies() {
		register_taxonomy(
			self::TAX_INDUSTRY,
			array( self::POST_TYPE ),
			array(
				'labels'            => array(
					'name'          => __( 'Industries', 'adaire-blocks' ),
					'singular_name' => __( 'Industry', 'adaire-blocks' ),
					'search_items'  => __( 'Search Industries', 'adaire-blocks' ),
					'all_items'     => __( 'All Industries', 'adaire-blocks' ),
					'edit_item'     => __( 'Edit Industry', 'adaire-blocks' ),
					'add_new_item'  => __( 'Add New Industry', 'adaire-blocks' ),
				),
				'hierarchical'      => true,
				'public'            => true,
				'show_in_rest'      => true,
				'show_admin_column' => true,
				'rewrite'           => array( 'slug' => 'case-study-industry' ),
			)
		);

		register_taxonomy(
			self::TAX_CAPABILITY,
			array( self::POST_TYPE ),
			array(
				'labels'            => array(
					'name'          => __( 'Capabilities', 'adaire-blocks' ),
					'singular_name' => __( 'Capability', 'adaire-blocks' ),
					'search_items'  => __( 'Search Capabilities', 'adaire-blocks' ),
					'all_items'     => __( 'All Capabilities', 'adaire-blocks' ),
					'edit_item'     => __( 'Edit Capability', 'adaire-blocks' ),
					'add_new_item'  => __( 'Add New Capability', 'adaire-blocks' ),
				),
				'hierarchical'      => false,
				'public'            => true,
				'show_in_rest'      => true,
				'show_admin_column' => true,
				'rewrite'           => array( 'slug' => 'case-study-capability' ),
			)
		);
	}

	/**
	 * Registers the extra Case Study fields as post meta, exposed to the
	 * REST API (`show_in_rest`) for the editor-side preview count fetch and
	 * for any future headless/REST use — the frontend render itself
	 * (render.php) reads these directly via get_post_meta(), no REST
	 * round-trip needed.
	 */
	public function register_meta() {
		$string_fields = array(
			self::META_CLIENT     => __( 'Client', 'adaire-blocks' ),
			self::META_COUNTRY    => __( 'Country', 'adaire-blocks' ),
			self::META_LANGUAGE   => __( 'Language', 'adaire-blocks' ),
			self::META_TECHNOLOGY => __( 'Technology', 'adaire-blocks' ),
			self::META_LINK_URL   => __( 'Website URL', 'adaire-blocks' ),
		);

		foreach ( $string_fields as $meta_key => $label ) {
			register_post_meta(
				self::POST_TYPE,
				$meta_key,
				array(
					'type'              => 'string',
					'single'            => true,
					'default'           => '',
					'sanitize_callback' => ( self::META_LINK_URL === $meta_key ) ? 'esc_url_raw' : 'sanitize_text_field',
					'show_in_rest'      => true,
					'auth_callback'     => function () {
						return current_user_can( 'edit_posts' );
					},
				)
			);
		}

		// Project Summary — the short paragraph shown at the top of the
		// single case-study page, above the Client/Country/Industry/
		// Language/Technology info grid. Distinct from the excerpt (used as
		// the card/subtitle blurb) and from the_content() (the long-form
		// Challenge/Solution/Results write-up).
		register_post_meta(
			self::POST_TYPE,
			self::META_SUMMARY,
			array(
				'type'              => 'string',
				'single'            => true,
				'default'           => '',
				'sanitize_callback' => 'sanitize_textarea_field',
				'show_in_rest'      => true,
				'auth_callback'     => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);

		register_post_meta(
			self::POST_TYPE,
			self::META_OPEN_NEW_TAB,
			array(
				'type'          => 'boolean',
				'single'        => true,
				'default'       => true,
				'show_in_rest'  => true,
				'auth_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	/**
	 * Adds the "Case Study Details" meta box (client/country/language/
	 * technology/website — the fields that don't map to a core field or a
	 * taxonomy) below the block editor content area.
	 */
	public function add_meta_boxes() {
		add_meta_box(
			'adaire_case_study_details',
			__( 'Case Study Details', 'adaire-blocks' ),
			array( $this, 'render_meta_box' ),
			self::POST_TYPE,
			'normal',
			'high'
		);
	}

	public function render_meta_box( $post ) {
		wp_nonce_field( self::NONCE_ACTION, self::NONCE_FIELD );

		$client        = get_post_meta( $post->ID, self::META_CLIENT, true );
		$country       = get_post_meta( $post->ID, self::META_COUNTRY, true );
		$language      = get_post_meta( $post->ID, self::META_LANGUAGE, true );
		$technology    = get_post_meta( $post->ID, self::META_TECHNOLOGY, true );
		$link_url      = get_post_meta( $post->ID, self::META_LINK_URL, true );
		$open_new_tab  = get_post_meta( $post->ID, self::META_OPEN_NEW_TAB, true );
		$summary       = get_post_meta( $post->ID, self::META_SUMMARY, true );
		// Default to checked for posts that have never saved this meta yet.
		$open_new_tab  = ( '' === $open_new_tab ) ? true : (bool) $open_new_tab;
		?>
		<style>
			.adaire-case-study-fields p { margin: 0 0 14px; }
			.adaire-case-study-fields label { display: block; font-weight: 600; margin-bottom: 4px; }
			.adaire-case-study-fields input[type="text"],
			.adaire-case-study-fields input[type="url"] { width: 100%; max-width: 480px; }
			.adaire-case-study-fields textarea { width: 100%; max-width: 700px; }
		</style>
		<div class="adaire-case-study-fields">
			<p>
				<label for="adaire_case_summary"><?php esc_html_e( 'Project Summary', 'adaire-blocks' ); ?></label>
				<textarea id="adaire_case_summary" name="adaire_case_summary" rows="4"><?php echo esc_textarea( $summary ); ?></textarea>
				<span style="color:#666;font-style:italic;"><?php esc_html_e( 'Shown at the top of the case study page, above the Client/Country/Industry details. Write the Challenge/Solution/Results write-up below in the main content editor.', 'adaire-blocks' ); ?></span>
			</p>
			<p>
				<label for="adaire_case_client"><?php esc_html_e( 'Client', 'adaire-blocks' ); ?></label>
				<input type="text" id="adaire_case_client" name="adaire_case_client" value="<?php echo esc_attr( $client ); ?>" />
			</p>
			<p>
				<label for="adaire_case_country"><?php esc_html_e( 'Country', 'adaire-blocks' ); ?></label>
				<input type="text" id="adaire_case_country" name="adaire_case_country" value="<?php echo esc_attr( $country ); ?>" />
			</p>
			<p>
				<label for="adaire_case_language"><?php esc_html_e( 'Language', 'adaire-blocks' ); ?></label>
				<input type="text" id="adaire_case_language" name="adaire_case_language" value="<?php echo esc_attr( $language ); ?>" />
			</p>
			<p>
				<label for="adaire_case_technology"><?php esc_html_e( 'Technology', 'adaire-blocks' ); ?></label>
				<input type="text" id="adaire_case_technology" name="adaire_case_technology" value="<?php echo esc_attr( $technology ); ?>" />
			</p>
			<p>
				<label for="adaire_case_link_url"><?php esc_html_e( 'Website URL', 'adaire-blocks' ); ?></label>
				<input type="url" id="adaire_case_link_url" name="adaire_case_link_url" placeholder="https://..." value="<?php echo esc_attr( $link_url ); ?>" />
			</p>
			<p>
				<label>
					<input type="checkbox" id="adaire_case_open_new_tab" name="adaire_case_open_new_tab" value="1" <?php checked( $open_new_tab ); ?> />
					<?php esc_html_e( 'Open website in a new tab', 'adaire-blocks' ); ?>
				</label>
			</p>
			<p style="color:#666;font-style:italic;">
				<?php esc_html_e( 'Use the Card / Cover Image panel (bottom right) for the card image, and Industries / Capabilities (right sidebar) for filtering.', 'adaire-blocks' ); ?>
			</p>
		</div>
		<?php
	}

	public function save_meta_box( $post_id, $post ) {
		if ( ! isset( $_POST[ self::NONCE_FIELD ] ) || ! wp_verify_nonce( wp_unslash( $_POST[ self::NONCE_FIELD ] ), self::NONCE_ACTION ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( wp_is_post_revision( $post_id ) ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		$fields = array(
			'adaire_case_client'     => self::META_CLIENT,
			'adaire_case_country'    => self::META_COUNTRY,
			'adaire_case_language'   => self::META_LANGUAGE,
			'adaire_case_technology' => self::META_TECHNOLOGY,
		);
		foreach ( $fields as $field => $meta_key ) {
			$value = isset( $_POST[ $field ] ) ? sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) : '';
			update_post_meta( $post_id, $meta_key, $value );
		}

		$summary = isset( $_POST['adaire_case_summary'] ) ? sanitize_textarea_field( wp_unslash( $_POST['adaire_case_summary'] ) ) : '';
		update_post_meta( $post_id, self::META_SUMMARY, $summary );

		$link_url = isset( $_POST['adaire_case_link_url'] ) ? esc_url_raw( wp_unslash( $_POST['adaire_case_link_url'] ) ) : '';
		update_post_meta( $post_id, self::META_LINK_URL, $link_url );

		update_post_meta( $post_id, self::META_OPEN_NEW_TAB, ! empty( $_POST['adaire_case_open_new_tab'] ) );
	}
}
