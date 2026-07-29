<?php
/**
 * Adds mega-panel assignment fields to native nav menu items.
 *
 * Menus themselves stay 100% WordPress-native (Appearance > Menus already
 * provides create/edit/reorder/delete/nest for free — duplicating that
 * inside the GutenBlocks dashboard would be parallel architecture for no
 * benefit). This class only adds the mega-panel assignment + presentation
 * fields WordPress doesn't have a built-in field for, stored as menu item
 * post meta (nav menu items are themselves posts, so this is plain,
 * WordPress-native storage — no custom tables).
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Adds mega-panel assignment fields to individual nav menu items.
 */
class AdaireMegaMenuNavItemFields {

	const META_PANEL_ID   = '_adaire_mega_panel_id';
	const META_LAYOUT     = '_adaire_mega_panel_layout';
	const META_TRIGGER    = '_adaire_mega_panel_trigger';
	const META_BREAKPOINT = '_adaire_mega_panel_breakpoint';
	const META_ANIMATION  = '_adaire_mega_panel_animation';
	const NONCE_ACTION    = 'adaire_mega_menu_nav_item_save';
	const NONCE_FIELD     = 'adaire_mega_menu_nav_item_nonce';

	/**
	 * Singleton instance.
	 *
	 * @var AdaireMegaMenuNavItemFields|null
	 */
	private static $instance = null;

	/**
	 * Registers the hooks this class needs.
	 */
	private function __construct() {
		add_action( 'wp_nav_menu_item_custom_fields', array( $this, 'render_fields' ), 10, 4 );
		add_action( 'wp_update_nav_menu_item', array( $this, 'save_fields' ), 10, 2 );
	}

	/**
	 * Gets the singleton instance.
	 *
	 * @return AdaireMegaMenuNavItemFields
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Fetches the panels available for assignment.
	 *
	 * @return WP_Post[]
	 */
	private static function get_panel_choices() {
		$panels = get_posts(
			array(
				'post_type'      => AdaireMegaPanelPostType::POST_TYPE,
				'post_status'    => array( 'publish', 'draft' ),
				'posts_per_page' => -1,
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);

		return $panels;
	}

	/**
	 * Renders the mega-panel assignment fields for a single nav menu item
	 * inside Appearance > Menus. Only meaningful for top-level items, but
	 * WordPress renders this callback for every item regardless of depth —
	 * the JS in admin/js/mega-menu-nav-item.js hides it for nested items.
	 *
	 * @param int      $item_id Menu item DB id.
	 * @param WP_Post  $item    Menu item object.
	 * @param int      $depth   Depth of the item in the menu tree.
	 * @param stdClass $args    Wp_nav_menu() args (unused here).
	 */
	public function render_fields( $item_id, $item, $depth, $args ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- Fixed callback signature required by the wp_nav_menu_item_custom_fields action.
		$panels         = self::get_panel_choices();
		$assigned_panel = (int) get_post_meta( $item_id, self::META_PANEL_ID, true );
		$layout         = get_post_meta( $item_id, self::META_LAYOUT, true );
		$layout         = $layout ? $layout : 'contained';
		$trigger        = get_post_meta( $item_id, self::META_TRIGGER, true );
		$trigger        = $trigger ? $trigger : 'hover';
		$breakpoint     = get_post_meta( $item_id, self::META_BREAKPOINT, true );
		$animation      = get_post_meta( $item_id, self::META_ANIMATION, true );
		$animation      = $animation ? $animation : 'fade-slide';

		wp_nonce_field( self::NONCE_ACTION, self::NONCE_FIELD );
		?>
		<p class="description description-wide adaire-mega-menu-item-fields" data-depth="<?php echo esc_attr( $depth ); ?>">
			<label for="edit-menu-item-adaire-mega-panel-<?php echo esc_attr( $item_id ); ?>">
				<?php esc_html_e( 'GutenBlocks Mega Panel', 'adaire-blocks' ); ?><br />
				<select
					id="edit-menu-item-adaire-mega-panel-<?php echo esc_attr( $item_id ); ?>"
					name="menu-item-adaire-mega-panel[<?php echo esc_attr( $item_id ); ?>]"
					class="widefat edit-menu-item-adaire-mega-panel"
				>
					<option value="0"><?php esc_html_e( '— None —', 'adaire-blocks' ); ?></option>
					<?php foreach ( $panels as $panel ) : ?>
						<option value="<?php echo esc_attr( $panel->ID ); ?>" <?php selected( $assigned_panel, $panel->ID ); ?>>
							<?php echo esc_html( $panel->post_title ? $panel->post_title : __( '(no title)', 'adaire-blocks' ) ); ?>
							<?php if ( 'publish' !== $panel->post_status ) : ?>
								(<?php echo esc_html( $panel->post_status ); ?>)
							<?php endif; ?>
						</option>
					<?php endforeach; ?>
				</select>
			</label>
		</p>

		<p class="description description-thin adaire-mega-menu-item-fields">
			<label for="edit-menu-item-adaire-mega-layout-<?php echo esc_attr( $item_id ); ?>">
				<?php esc_html_e( 'Panel width', 'adaire-blocks' ); ?><br />
				<select
					id="edit-menu-item-adaire-mega-layout-<?php echo esc_attr( $item_id ); ?>"
					name="menu-item-adaire-mega-layout[<?php echo esc_attr( $item_id ); ?>]"
					class="widefat"
				>
					<option value="contained" <?php selected( $layout, 'contained' ); ?>><?php esc_html_e( 'Contained', 'adaire-blocks' ); ?></option>
					<option value="wide" <?php selected( $layout, 'wide' ); ?>><?php esc_html_e( 'Wide', 'adaire-blocks' ); ?></option>
					<option value="full" <?php selected( $layout, 'full' ); ?>><?php esc_html_e( 'Full viewport', 'adaire-blocks' ); ?></option>
				</select>
			</label>
		</p>

		<p class="description description-thin adaire-mega-menu-item-fields">
			<label for="edit-menu-item-adaire-mega-trigger-<?php echo esc_attr( $item_id ); ?>">
				<?php esc_html_e( 'Activation trigger', 'adaire-blocks' ); ?><br />
				<select
					id="edit-menu-item-adaire-mega-trigger-<?php echo esc_attr( $item_id ); ?>"
					name="menu-item-adaire-mega-trigger[<?php echo esc_attr( $item_id ); ?>]"
					class="widefat"
				>
					<option value="hover" <?php selected( $trigger, 'hover' ); ?>><?php esc_html_e( 'Hover', 'adaire-blocks' ); ?></option>
					<option value="click" <?php selected( $trigger, 'click' ); ?>><?php esc_html_e( 'Click', 'adaire-blocks' ); ?></option>
					<option value="hover-focus" <?php selected( $trigger, 'hover-focus' ); ?>><?php esc_html_e( 'Hover and keyboard focus', 'adaire-blocks' ); ?></option>
				</select>
			</label>
		</p>

		<p class="description description-thin adaire-mega-menu-item-fields">
			<label for="edit-menu-item-adaire-mega-breakpoint-<?php echo esc_attr( $item_id ); ?>">
				<?php esc_html_e( 'Mobile breakpoint (px)', 'adaire-blocks' ); ?><br />
				<input
					type="number"
					id="edit-menu-item-adaire-mega-breakpoint-<?php echo esc_attr( $item_id ); ?>"
					name="menu-item-adaire-mega-breakpoint[<?php echo esc_attr( $item_id ); ?>]"
					class="widefat"
					min="320"
					max="1600"
					step="1"
					value="<?php echo esc_attr( $breakpoint ? $breakpoint : 1024 ); ?>"
				/>
			</label>
		</p>

		<p class="description description-thin adaire-mega-menu-item-fields">
			<label for="edit-menu-item-adaire-mega-animation-<?php echo esc_attr( $item_id ); ?>">
				<?php esc_html_e( 'Animation', 'adaire-blocks' ); ?><br />
				<select
					id="edit-menu-item-adaire-mega-animation-<?php echo esc_attr( $item_id ); ?>"
					name="menu-item-adaire-mega-animation[<?php echo esc_attr( $item_id ); ?>]"
					class="widefat"
				>
					<option value="none" <?php selected( $animation, 'none' ); ?>><?php esc_html_e( 'None', 'adaire-blocks' ); ?></option>
					<option value="fade" <?php selected( $animation, 'fade' ); ?>><?php esc_html_e( 'Fade', 'adaire-blocks' ); ?></option>
					<option value="fade-slide" <?php selected( $animation, 'fade-slide' ); ?>><?php esc_html_e( 'Fade and slide', 'adaire-blocks' ); ?></option>
					<option value="scale" <?php selected( $animation, 'scale' ); ?>><?php esc_html_e( 'Scale', 'adaire-blocks' ); ?></option>
				</select>
			</label>
		</p>
		<?php
	}

	/**
	 * Saves the mega-panel assignment fields for one menu item. Fires once
	 * per item on every menu save (native WordPress behaviour).
	 *
	 * @param int $menu_id        Nav menu term id (unused, all fields are per-item).
	 * @param int $menu_item_db_id Menu item post id.
	 */
	public function save_fields( $menu_id, $menu_item_db_id ) {
		if ( ! isset( $_POST[ self::NONCE_FIELD ] ) ||
			! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST[ self::NONCE_FIELD ] ) ), self::NONCE_ACTION )
		) {
			return;
		}

		if ( ! current_user_can( 'edit_theme_options' ) ) {
			return;
		}

		$panel_id = isset( $_POST['menu-item-adaire-mega-panel'][ $menu_item_db_id ] )
			? absint( $_POST['menu-item-adaire-mega-panel'][ $menu_item_db_id ] )
			: 0;
		update_post_meta( $menu_item_db_id, self::META_PANEL_ID, $panel_id );

		$layout = isset( $_POST['menu-item-adaire-mega-layout'][ $menu_item_db_id ] )
			? sanitize_key( wp_unslash( $_POST['menu-item-adaire-mega-layout'][ $menu_item_db_id ] ) )
			: 'contained';
		if ( ! in_array( $layout, array( 'contained', 'wide', 'full' ), true ) ) {
			$layout = 'contained';
		}
		update_post_meta( $menu_item_db_id, self::META_LAYOUT, $layout );

		$trigger = isset( $_POST['menu-item-adaire-mega-trigger'][ $menu_item_db_id ] )
			? sanitize_key( wp_unslash( $_POST['menu-item-adaire-mega-trigger'][ $menu_item_db_id ] ) )
			: 'hover';
		if ( ! in_array( $trigger, array( 'hover', 'click', 'hover-focus' ), true ) ) {
			$trigger = 'hover';
		}
		update_post_meta( $menu_item_db_id, self::META_TRIGGER, $trigger );

		$breakpoint = isset( $_POST['menu-item-adaire-mega-breakpoint'][ $menu_item_db_id ] )
			? absint( $_POST['menu-item-adaire-mega-breakpoint'][ $menu_item_db_id ] )
			: 1024;
		if ( $breakpoint < 320 || $breakpoint > 1600 ) {
			$breakpoint = 1024;
		}
		update_post_meta( $menu_item_db_id, self::META_BREAKPOINT, $breakpoint );

		$animation = isset( $_POST['menu-item-adaire-mega-animation'][ $menu_item_db_id ] )
			? sanitize_key( wp_unslash( $_POST['menu-item-adaire-mega-animation'][ $menu_item_db_id ] ) )
			: 'fade-slide';
		if ( ! in_array( $animation, array( 'none', 'fade', 'fade-slide', 'scale' ), true ) ) {
			$animation = 'fade-slide';
		}
		update_post_meta( $menu_item_db_id, self::META_ANIMATION, $animation );
	}

	/**
	 * Reads a menu item's mega-panel assignment, resolved down to only what
	 * the renderer needs. Returns null when no panel is assigned.
	 *
	 * @param int $menu_item_id Menu item post id.
	 * @return array{panelId:int,layout:string,trigger:string,breakpoint:int,animation:string}|null
	 */
	public static function get_assignment( $menu_item_id ) {
		$panel_id = (int) get_post_meta( $menu_item_id, self::META_PANEL_ID, true );

		if ( ! $panel_id ) {
			return null;
		}

		$layout     = get_post_meta( $menu_item_id, self::META_LAYOUT, true );
		$trigger    = get_post_meta( $menu_item_id, self::META_TRIGGER, true );
		$breakpoint = get_post_meta( $menu_item_id, self::META_BREAKPOINT, true );
		$animation  = get_post_meta( $menu_item_id, self::META_ANIMATION, true );

		return array(
			'panelId'    => $panel_id,
			'layout'     => $layout ? $layout : 'contained',
			'trigger'    => $trigger ? $trigger : 'hover',
			'breakpoint' => $breakpoint ? (int) $breakpoint : 1024,
			'animation'  => $animation ? $animation : 'fade-slide',
		);
	}
}

AdaireMegaMenuNavItemFields::get_instance();
