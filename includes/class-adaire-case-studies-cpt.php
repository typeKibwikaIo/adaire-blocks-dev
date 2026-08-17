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
 * Data model — kept deliberately simple:
 *   - Hero Image: the post's native Featured Image. This is the single
 *     canonical preview used everywhere the case study is represented —
 *     the block's card grid, the popup, navigation "peek" previews, and
 *     the large hero at the top of the case study's own page. Nothing else
 *     generates its own preview independently.
 *   - Website URL (META_LINK_URL): a separate, optional field used only for
 *     the "Open Live Site" link and the hostname shown in the browser-chrome
 *     bar — it is never used to auto-generate the Hero Image.
 *   - Content: the case study's actual write-up/body uses WordPress' native
 *     'editor' support (the standard block editor on post_content) so
 *     authors have a fully free-form page — any mix of text, headings,
 *     images, galleries, video, quotes, etc. — instead of being forced into
 *     fixed Challenge/Solution/Results-style sections.
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
	const META_LIKES         = '_adaire_case_likes';
	// Alternative to uploading a Hero Image — a direct image URL, used only
	// as a fallback when no Featured Image has been set (see
	// AdaireCaseStudiesCPT::get_hero_image_url()).
	const META_HERO_IMAGE_URL = '_adaire_case_hero_image_url';
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
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
		// Full single case-study page (hero, info grid, long-form content,
		// "Read more case studies"), themeable via single-adaire_case_study.php.
		add_filter( 'template_include', array( $this, 'single_template' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_single_template_assets' ) );
		// Let this CPT show up on standard WordPress author archives
		// (example.com/author/jane/) alongside regular posts, so the
		// "See profile" link in the Case Studies popup's "More by [author]"
		// section resolves to something meaningful instead of a 404/empty page.
		add_action( 'pre_get_posts', array( $this, 'include_in_author_archive' ) );

		// Quick Edit support for the Hero Image (the list-table field
		// requested alongside Industries): a hidden per-row data column
		// carries the current thumbnail so JS can pre-fill Quick Edit, a
		// `quick_edit_custom_box` field renders the picker itself, and
		// save_meta_box() (already hooked above) picks up the posted
		// thumbnail id. Industries/Capabilities need no extra save code —
		// naming the checkboxes `tax_input[{taxonomy}][]` lets WordPress'
		// own edit_post()/wp_update_post() save them automatically, exactly
		// like the built-in Categories checkbox box does.
		add_filter( 'manage_' . self::POST_TYPE . '_posts_columns', array( $this, 'add_hero_data_column' ) );
		add_action( 'manage_' . self::POST_TYPE . '_posts_custom_column', array( $this, 'render_hero_data_column' ), 10, 2 );
		add_action( 'quick_edit_custom_box', array( $this, 'render_quick_edit_fields' ), 10, 2 );
		add_action( 'admin_print_footer_scripts-edit.php', array( $this, 'print_quick_edit_script' ) );
	}

	/**
	 * Adds `adaire_case_study` to the queried post types on author archives
	 * so `get_author_posts_url()` links (used by the popup's "See profile")
	 * actually list that author's case studies instead of coming up empty.
	 */
	public function include_in_author_archive( $query ) {
		if ( is_admin() || ! $query->is_main_query() || ! $query->is_author() ) {
			return;
		}

		$post_types = $query->get( 'post_type' );
		if ( empty( $post_types ) ) {
			$post_types = array( 'post' );
		} elseif ( ! is_array( $post_types ) ) {
			$post_types = array( $post_types );
		}

		if ( ! in_array( self::POST_TYPE, $post_types, true ) ) {
			$post_types[] = self::POST_TYPE;
			$query->set( 'post_type', $post_types );
		}
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

		// The "Read more"/"Similar" grids on this page reuse the Case
		// Studies block's own card markup (adaire_case_studies_render_card())
		// so they visually match the block everywhere else it appears — but
		// WordPress only auto-enqueues a block's compiled style.css when
		// that block is actually rendered via render_block() on the current
		// page, which this standalone template never does. Load the
		// block's compiled stylesheet explicitly so those card classes
		// resolve here too.
		$block_style_path = ADAIRE_BLOCKS_PLUGIN_PATH . 'build/case-studies-block/style-index.css';
		$block_style_deps = array();
		if ( file_exists( $block_style_path ) ) {
			wp_enqueue_style(
				'adaire-case-studies-block-style',
				ADAIRE_BLOCKS_PLUGIN_URL . 'build/case-studies-block/style-index.css',
				array(),
				filemtime( $block_style_path )
			);
			$block_style_deps[] = 'adaire-case-studies-block-style';
		}

		wp_enqueue_style(
			'adaire-case-study-single',
			ADAIRE_BLOCKS_PLUGIN_URL . 'templates/single-case-study.css',
			$block_style_deps,
			file_exists( ADAIRE_BLOCKS_PLUGIN_PATH . 'templates/single-case-study.css' )
				? filemtime( ADAIRE_BLOCKS_PLUGIN_PATH . 'templates/single-case-study.css' )
				: false
		);
	}

	/**
	 * Loads the media uploader on this post type's edit screen only, so the
	 * "Choose Hero Image" button in the Case Study Details box (top of the
	 * page, impossible to miss) can open it. Uses wp.media.featuredImage —
	 * WordPress' own helper for keeping a custom "set featured image"
	 * trigger in sync with the native Featured Image panel — so there's
	 * only ever one stored image, however the admin chose to set it.
	 */
	public function enqueue_admin_assets( $hook ) {
		if ( ! in_array( $hook, array( 'post.php', 'post-new.php', 'edit.php' ), true ) ) {
			return;
		}
		$screen = get_current_screen();
		if ( ! $screen || self::POST_TYPE !== $screen->post_type ) {
			return;
		}

		// The edit.php list screen only needs the media modal itself — the
		// Quick Edit picker's own binding script is added separately via
		// print_quick_edit_script(), once WP has built the #inline-edit row.
		wp_enqueue_media();

		if ( 'edit.php' === $hook ) {
			return;
		}

		$inline_js = <<<'JS'
jQuery(function ($) {
	var $preview = $('#adaire-case-hero-preview');
	var $chooseBtn = $('#adaire-case-hero-choose');
	var $removeBtn = $('#adaire-case-hero-remove');
	var frame = null;

	function showImage(url) {
		if (url) {
			$preview.html('<img src="' + url + '" alt="" style="max-width:100%;height:auto;display:block;border-radius:4px;" />');
			$removeBtn.show();
		} else {
			$preview.html('<span style="color:#888;">No hero image selected yet.</span>');
			$removeBtn.hide();
		}
	}

	$chooseBtn.on('click', function (e) {
		e.preventDefault();
		if (!frame) {
			frame = wp.media({
				title: 'Select Hero Image',
				multiple: false,
				library: { type: 'image' }
			});
			frame.on('select', function () {
				var attachment = frame.state().get('selection').first().toJSON();
				if (wp.media.featuredImage) {
					wp.media.featuredImage.set(attachment.id);
				}
				var url = (attachment.sizes && attachment.sizes.large) ? attachment.sizes.large.url : attachment.url;
				showImage(url);
			});
		}
		frame.open();
	});

	$removeBtn.on('click', function (e) {
		e.preventDefault();
		if (wp.media.featuredImage) {
			wp.media.featuredImage.remove();
		}
		showImage('');
	});
});
JS;

		wp_add_inline_script( 'media-editor', $inline_js );
	}

	/**
	 * Adds a hidden, data-only column to the list table — not a real
	 * visible column (see print_quick_edit_script(), which hides it via
	 * CSS) — that carries each row's current Hero Image + Industries into
	 * the page so Quick Edit's JS can pre-fill itself when opened. This is
	 * the standard pattern for feeding custom data into Quick Edit, which
	 * otherwise only knows how to read WordPress' own built-in fields.
	 */
	public function add_hero_data_column( $columns ) {
		$columns['adaire_hero_data'] = '';
		return $columns;
	}

	/**
	 * Outputs this row's Hero Image + Industries as hidden data attributes
	 * — read by the Quick Edit JS in print_quick_edit_script().
	 */
	public function render_hero_data_column( $column, $post_id ) {
		if ( 'adaire_hero_data' !== $column ) {
			return;
		}
		$thumb_id   = get_post_thumbnail_id( $post_id );
		$thumb_url  = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'medium' ) : '';
		$industries = wp_get_post_terms( $post_id, self::TAX_INDUSTRY, array( 'fields' => 'names' ) );
		$industries = is_wp_error( $industries ) ? array() : $industries;
		printf(
			'<div class="hidden" data-thumb-id="%1$d" data-thumb-url="%2$s" data-industries="%3$s"></div>',
			(int) $thumb_id,
			esc_attr( $thumb_url ),
			esc_attr( wp_json_encode( $industries ) )
		);
	}

	/**
	 * Renders the Hero Image picker + Industries checkbox list into the
	 * shared #inline-edit Quick Edit template. Fires once per column WP
	 * iterates (including its own built-in ones), so it's guarded to only
	 * render for our one hidden data column.
	 *
	 * The Industries checkboxes are named `tax_input[adaire_case_industry][]`
	 * so WordPress' own edit_post()/wp_update_post() saves them
	 * automatically on Quick Edit submit — the same mechanism the built-in
	 * Categories checkbox box relies on. No custom save code needed for
	 * that part; only the Hero Image (post thumbnail) needs handling in
	 * save_meta_box().
	 */
	public function render_quick_edit_fields( $column_name, $post_type ) {
		if ( 'adaire_hero_data' !== $column_name || self::POST_TYPE !== $post_type ) {
			return;
		}

		wp_nonce_field( self::NONCE_ACTION, self::NONCE_FIELD );

		$all_industries = get_terms(
			array(
				'taxonomy'   => self::TAX_INDUSTRY,
				'hide_empty' => false,
			)
		);
		$all_industries = is_wp_error( $all_industries ) ? array() : $all_industries;
		?>
		<fieldset class="inline-edit-col-right adaire-quick-edit-fields">
			<div class="inline-edit-col">
				<label class="adaire-qe-label"><?php esc_html_e( 'Hero Image', 'adaire-blocks' ); ?></label>
				<div class="adaire-qe-hero-preview" id="adaire-qe-hero-preview">
					<span style="color:#888;"><?php esc_html_e( 'No hero image selected yet.', 'adaire-blocks' ); ?></span>
				</div>
				<p>
					<button type="button" class="button" id="adaire-qe-hero-choose"><?php esc_html_e( 'Choose Hero Image', 'adaire-blocks' ); ?></button>
					<button type="button" class="button" id="adaire-qe-hero-remove" style="display:none;"><?php esc_html_e( 'Remove', 'adaire-blocks' ); ?></button>
				</p>
				<input type="hidden" name="adaire_quick_thumbnail_id" id="adaire-qe-hero-input" value="" />

				<label class="adaire-qe-label" style="margin-top:10px;"><?php esc_html_e( 'Industries', 'adaire-blocks' ); ?></label>
				<div class="adaire-qe-industries-list">
					<?php if ( empty( $all_industries ) ) : ?>
						<span style="color:#888;"><?php esc_html_e( 'No industries created yet — add one from a case study first.', 'adaire-blocks' ); ?></span>
					<?php else : ?>
						<?php foreach ( $all_industries as $term ) : ?>
							<label class="adaire-qe-checkbox-label">
								<input type="checkbox" name="tax_input[<?php echo esc_attr( self::TAX_INDUSTRY ); ?>][]" value="<?php echo esc_attr( $term->name ); ?>" class="adaire-qe-industry-checkbox" />
								<?php echo esc_html( $term->name ); ?>
							</label>
						<?php endforeach; ?>
					<?php endif; ?>
				</div>
			</div>
		</fieldset>
		<?php
	}

	/**
	 * Quick Edit's JS only knows how to pre-fill WordPress' own built-in
	 * fields, so this overrides `inlineEditPost.edit` (the standard way to
	 * extend Quick Edit) to also populate the Hero Image preview and
	 * pre-check the Industries this row already has, reading both from the
	 * hidden data column rendered by render_hero_data_column(). Also wires
	 * the Choose/Remove buttons to the media modal.
	 */
	public function print_quick_edit_script() {
		$screen = get_current_screen();
		if ( ! $screen || self::POST_TYPE !== $screen->post_type ) {
			return;
		}
		?>
		<style>
			.column-adaire_hero_data { display: none; }
			.adaire-qe-label { display: block; font-weight: 600; margin-bottom: 4px; }
			.adaire-qe-hero-preview { max-width: 160px; margin-bottom: 6px; }
			.adaire-qe-hero-preview img { max-width: 100%; height: auto; display: block; border-radius: 4px; }
			.adaire-qe-industries-list { max-height: 120px; overflow-y: auto; border: 1px solid #dcdcde; padding: 6px 10px; background: #fff; }
			.adaire-qe-checkbox-label { display: block; font-weight: normal; margin-bottom: 2px; }
		</style>
		<script>
		jQuery(function ($) {
			if (typeof inlineEditPost === 'undefined') {
				return;
			}
			var wpInlineEdit = inlineEditPost.edit;

			inlineEditPost.edit = function (postId) {
				wpInlineEdit.apply(this, arguments);

				var id = 0;
				if (typeof postId === 'object') {
					id = parseInt(this.getId(postId), 10);
				} else {
					id = parseInt(postId, 10);
				}
				if (!id) {
					return;
				}

				var $data = $('#post-' + id).find('.hidden[data-thumb-url], .hidden[data-industries]').first();
				if (!$data.length) {
					return;
				}

				var thumbId = parseInt($data.attr('data-thumb-id'), 10) || 0;
				var thumbUrl = $data.attr('data-thumb-url') || '';
				var industries = [];
				try {
					industries = JSON.parse($data.attr('data-industries') || '[]');
				} catch (e) {
					industries = [];
				}

				var $editRow = $('#edit-' + id);
				var $preview = $editRow.find('#adaire-qe-hero-preview');

				$editRow.find('#adaire-qe-hero-input').val(thumbId);
				if (thumbUrl) {
					$preview.html('<img src="' + thumbUrl + '" alt="" />');
					$editRow.find('#adaire-qe-hero-remove').show();
				} else {
					$preview.html('<span style="color:#888;">No hero image selected yet.</span>');
					$editRow.find('#adaire-qe-hero-remove').hide();
				}

				$editRow.find('.adaire-qe-industry-checkbox').each(function () {
					$(this).prop('checked', industries.indexOf($(this).val()) > -1);
				});
			};

			$(document).on('click', '.adaire-quick-edit-fields #adaire-qe-hero-choose', function (e) {
				e.preventDefault();
				var $editRow = $(this).closest('fieldset').closest('tr, .inline-edit-row');
				var frame = wp.media({
					title: 'Select Hero Image',
					multiple: false,
					library: { type: 'image' }
				});
				frame.on('select', function () {
					var attachment = frame.state().get('selection').first().toJSON();
					var url = (attachment.sizes && attachment.sizes.thumbnail) ? attachment.sizes.thumbnail.url : attachment.url;
					$editRow.find('#adaire-qe-hero-input').val(attachment.id);
					$editRow.find('#adaire-qe-hero-preview').html('<img src="' + url + '" alt="" />');
					$editRow.find('#adaire-qe-hero-remove').show();
				});
				frame.open();
			});

			$(document).on('click', '.adaire-quick-edit-fields #adaire-qe-hero-remove', function (e) {
				e.preventDefault();
				var $editRow = $(this).closest('fieldset').closest('tr, .inline-edit-row');
				$editRow.find('#adaire-qe-hero-input').val('0');
				$editRow.find('#adaire-qe-hero-preview').html('<span style="color:#888;">No hero image selected yet.</span>');
				$(this).hide();
			});
		});
		</script>
		<?php
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
			'featured_image'        => __( 'Hero Image', 'adaire-blocks' ),
			'set_featured_image'    => __( 'Set hero image', 'adaire-blocks' ),
			'remove_featured_image' => __( 'Remove hero image', 'adaire-blocks' ),
			'use_featured_image'    => __( 'Use as hero image', 'adaire-blocks' ),
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
	 * Register the Industries and Capabilities taxonomies. Both are flat,
	 * tag-style taxonomies (like Tags, not Categories) so a case study can
	 * have one or more of each — comma-separated entry, proper Quick Edit
	 * support — mapping onto the `industries` and `capabilities` array
	 * fields the block already uses for its filter pills/dropdowns.
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
					'popular_items' => __( 'Popular Industries', 'adaire-blocks' ),
					'all_items'     => __( 'All Industries', 'adaire-blocks' ),
					'edit_item'     => __( 'Edit Industry', 'adaire-blocks' ),
					'add_new_item'  => __( 'Add New Industry', 'adaire-blocks' ),
					'separate_items_with_commas' => __( 'Separate industries with commas', 'adaire-blocks' ),
					'add_or_remove_items'        => __( 'Add or remove industries', 'adaire-blocks' ),
					'choose_from_most_used'      => __( 'Choose from the most used industries', 'adaire-blocks' ),
				),
				'hierarchical'      => false,
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
			self::META_CLIENT          => __( 'Client', 'adaire-blocks' ),
			self::META_COUNTRY         => __( 'Country', 'adaire-blocks' ),
			self::META_LANGUAGE        => __( 'Language', 'adaire-blocks' ),
			self::META_TECHNOLOGY      => __( 'Technology', 'adaire-blocks' ),
			self::META_LINK_URL        => __( 'Website URL', 'adaire-blocks' ),
			self::META_HERO_IMAGE_URL  => __( 'Hero Image URL', 'adaire-blocks' ),
		);

		$url_fields = array( self::META_LINK_URL, self::META_HERO_IMAGE_URL );

		foreach ( $string_fields as $meta_key => $label ) {
			register_post_meta(
				self::POST_TYPE,
				$meta_key,
				array(
					'type'              => 'string',
					'single'            => true,
					'default'           => '',
					'sanitize_callback' => in_array( $meta_key, $url_fields, true ) ? 'esc_url_raw' : 'sanitize_text_field',
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

		// Manually-set "like" count shown with a heart icon on cards and in
		// the popup header (Made-in-Webflow-style showcase stat). There's no
		// visitor-facing voting mechanism — this is an editorial number the
		// site owner sets, the same way they'd set any other display detail.
		register_post_meta(
			self::POST_TYPE,
			self::META_LIKES,
			array(
				'type'              => 'integer',
				'single'            => true,
				'default'           => 0,
				'sanitize_callback' => 'absint',
				'show_in_rest'      => true,
				'auth_callback'     => function () {
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
		// Marks this save as coming from the full editor (as opposed to
		// Quick Edit, which shares the same nonce action but only ever
		// posts a handful of fields) — see save_meta_box(), which uses
		// this to avoid wiping fields Quick Edit's smaller form never sent.
		echo '<input type="hidden" name="adaire_full_edit" value="1" />';

		$client        = get_post_meta( $post->ID, self::META_CLIENT, true );
		$country       = get_post_meta( $post->ID, self::META_COUNTRY, true );
		$language      = get_post_meta( $post->ID, self::META_LANGUAGE, true );
		$technology    = get_post_meta( $post->ID, self::META_TECHNOLOGY, true );
		$link_url      = get_post_meta( $post->ID, self::META_LINK_URL, true );
		$open_new_tab  = get_post_meta( $post->ID, self::META_OPEN_NEW_TAB, true );
		$summary       = get_post_meta( $post->ID, self::META_SUMMARY, true );
		$likes         = get_post_meta( $post->ID, self::META_LIKES, true );
		$hero_image_url = get_post_meta( $post->ID, self::META_HERO_IMAGE_URL, true );
		// Default to checked for posts that have never saved this meta yet.
		$open_new_tab  = ( '' === $open_new_tab ) ? true : (bool) $open_new_tab;
		?>
		<style>
			.adaire-case-study-fields p { margin: 0 0 14px; }
			.adaire-case-study-fields label { display: block; font-weight: 600; margin-bottom: 4px; }
			.adaire-case-study-fields input[type="text"],
			.adaire-case-study-fields input[type="url"] { width: 100%; max-width: 480px; }
			.adaire-case-study-fields input[type="number"] { width: 120px; }
			.adaire-case-study-fields textarea { width: 100%; max-width: 700px; }
			.adaire-case-hero-box { margin: 0 0 20px; padding: 16px; background: #f6f7f7; border: 1px solid #dcdcde; border-radius: 4px; }
			.adaire-case-hero-preview { max-width: 360px; margin-bottom: 12px; }
			.adaire-case-hero-preview img { max-width: 100%; height: auto; display: block; border-radius: 4px; }
		</style>
		<div class="adaire-case-study-fields">
			<div class="adaire-case-hero-box">
				<label style="margin-bottom:8px;"><?php esc_html_e( 'Hero Image', 'adaire-blocks' ); ?></label>
				<div id="adaire-case-hero-preview" class="adaire-case-hero-preview">
					<?php if ( has_post_thumbnail( $post->ID ) ) : ?>
						<?php echo get_the_post_thumbnail( $post->ID, 'large' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-generated <img> markup. ?>
					<?php else : ?>
						<span style="color:#888;"><?php esc_html_e( 'No hero image selected yet.', 'adaire-blocks' ); ?></span>
					<?php endif; ?>
				</div>
				<p style="margin:0 0 8px;">
					<button type="button" class="button button-primary" id="adaire-case-hero-choose"><?php esc_html_e( 'Choose Hero Image', 'adaire-blocks' ); ?></button>
					<button type="button" class="button" id="adaire-case-hero-remove" style="<?php echo has_post_thumbnail( $post->ID ) ? '' : 'display:none;'; ?>"><?php esc_html_e( 'Remove', 'adaire-blocks' ); ?></button>
				</p>
				<span style="color:#666;font-style:italic;"><?php esc_html_e( 'This is the single image used everywhere this case study is shown: the listing card, the popup, navigation previews, and the large hero at the top of the case study page. No image here means the card shows "No preview image" — pick one to fix that, or set the Hero Image URL field below instead if you\'d rather link an image than upload one.', 'adaire-blocks' ); ?></span>
			</div>
			<p>
				<label for="adaire_case_summary"><?php esc_html_e( 'Short Summary', 'adaire-blocks' ); ?></label>
				<textarea id="adaire_case_summary" name="adaire_case_summary" rows="3"><?php echo esc_textarea( $summary ); ?></textarea>
				<span style="color:#666;font-style:italic;"><?php esc_html_e( 'A one/two-sentence blurb shown near the top of the case study page. Write the full case study — text, images, galleries, whatever the project needs — in the main content editor above.', 'adaire-blocks' ); ?></span>
			</p>
			<p>
				<label for="adaire_case_link_url"><?php esc_html_e( 'Live Website URL', 'adaire-blocks' ); ?></label>
				<input type="url" id="adaire_case_link_url" name="adaire_case_link_url" placeholder="https://..." value="<?php echo esc_attr( $link_url ); ?>" />
				<span style="color:#666;font-style:italic;"><?php esc_html_e( '"Visit Live Site" links here, and its hostname is shown in the preview\'s browser bar. This is not used to generate the Hero Image above.', 'adaire-blocks' ); ?></span>
			</p>
			<p>
				<label>
					<input type="checkbox" id="adaire_case_open_new_tab" name="adaire_case_open_new_tab" value="1" <?php checked( $open_new_tab ); ?> />
					<?php esc_html_e( '"Visit Live Site" button opens in a new tab', 'adaire-blocks' ); ?>
				</label>
			</p>
			<p>
				<label for="adaire_case_hero_image_url"><?php esc_html_e( 'Hero Image URL (optional)', 'adaire-blocks' ); ?></label>
				<input type="url" id="adaire_case_hero_image_url" name="adaire_case_hero_image_url" placeholder="https://.../image.jpg" value="<?php echo esc_attr( $hero_image_url ); ?>" />
				<span style="color:#666;font-style:italic;"><?php esc_html_e( 'Link directly to an image instead of uploading one above. If a Hero Image is uploaded above, the uploaded image is used and this link is ignored — this is only a fallback for when no image has been uploaded.', 'adaire-blocks' ); ?></span>
			</p>
			<p>
				<label for="adaire_case_likes"><?php esc_html_e( 'Like count', 'adaire-blocks' ); ?></label>
				<input type="number" min="0" step="1" id="adaire_case_likes" name="adaire_case_likes" value="<?php echo esc_attr( $likes ); ?>" />
				<span style="color:#666;font-style:italic;"><?php esc_html_e( 'Shown next to the heart icon on the card and in the popup header.', 'adaire-blocks' ); ?></span>
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
			<p style="color:#666;font-style:italic;">
				<?php esc_html_e( 'Use Industries / Capabilities (right sidebar) for filtering and tags.', 'adaire-blocks' ); ?>
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

		// Quick Edit shares this same save_post hook/nonce action but only
		// ever posts a handful of fields (see render_quick_edit_fields()).
		// Only the full editor (render_meta_box()) sends this marker, so
		// skip the fields below entirely on a Quick Edit save rather than
		// wiping them to empty because they're simply absent from $_POST.
		if ( isset( $_POST['adaire_full_edit'] ) ) {
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

			$likes = isset( $_POST['adaire_case_likes'] ) ? absint( wp_unslash( $_POST['adaire_case_likes'] ) ) : 0;
			update_post_meta( $post_id, self::META_LIKES, $likes );

			$hero_image_url = isset( $_POST['adaire_case_hero_image_url'] ) ? esc_url_raw( wp_unslash( $_POST['adaire_case_hero_image_url'] ) ) : '';
			update_post_meta( $post_id, self::META_HERO_IMAGE_URL, $hero_image_url );
		}

		// Hero Image from Quick Edit's picker (see render_quick_edit_fields()
		// / print_quick_edit_script()) — only present on a Quick Edit save.
		// '0' means "Remove" was clicked; a positive id sets that attachment
		// as the post thumbnail, same as the full editor's picker does live
		// via wp.media.featuredImage.
		if ( isset( $_POST['adaire_quick_thumbnail_id'] ) ) {
			$thumb_id = absint( $_POST['adaire_quick_thumbnail_id'] );
			if ( $thumb_id > 0 ) {
				set_post_thumbnail( $post_id, $thumb_id );
			} else {
				delete_post_thumbnail( $post_id );
			}
		}
	}

	/**
	 * Resolves the Hero Image for a case study: the uploaded Featured Image
	 * always wins when set; the Hero Image URL field (META_HERO_IMAGE_URL)
	 * is only used as a fallback when no image has been uploaded. This is
	 * the single place that decision is made, so the block grid, popup, and
	 * single case-study page can never disagree on which image to show.
	 */
	public static function get_hero_image_url( $post_id, $size = 'large' ) {
		$uploaded = get_the_post_thumbnail_url( $post_id, $size );
		if ( $uploaded ) {
			return $uploaded;
		}
		$url = get_post_meta( $post_id, self::META_HERO_IMAGE_URL, true );
		return $url ? $url : '';
	}
}
