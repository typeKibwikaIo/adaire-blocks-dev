<?php
/**
 * Mega Menu dashboard for Adaire Blocks.
 *
 * Menus stay 100% WordPress-native — Appearance > Menus already provides a
 * full create/edit/reorder/delete/nest experience, so this screen is an
 * overview + status layer on top of wp_get_nav_menus(), not a parallel
 * menu editor. Mega Panels get a real management screen here because
 * adaire_mega_panel is a plugin-owned post type with no native admin UI.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'adaire_mega_menu_add_admin_menu' ) ) {
	/**
	 * Registers the Mega Menu dashboard submenu page.
	 */
	function adaire_mega_menu_add_admin_menu() {
		add_submenu_page(
			'adaire-blocks-settings',
			__( 'Mega Menu', 'adaire-blocks' ),
			__( 'Mega Menu', 'adaire-blocks' ),
			'manage_options',
			'adaire-blocks-mega-menu',
			'adaire_mega_menu_dashboard_page'
		);
	}
}
add_action( 'admin_menu', 'adaire_mega_menu_add_admin_menu' );

if ( ! function_exists( 'adaire_mega_menu_enqueue_assets' ) ) {
	/**
	 * The hook for a submenu under 'adaire-blocks-settings' is:
	 *   adaire-blocks-settings_page_adaire-blocks-mega-menu
	 *
	 * @param string $hook Current admin page hook.
	 */
	function adaire_mega_menu_enqueue_assets( $hook ) {
		if ( 'adaire-blocks-settings_page_adaire-blocks-mega-menu' !== $hook ) {
			return;
		}
		$version = defined( 'ADAIRE_BLOCKS_VERSION' ) ? ADAIRE_BLOCKS_VERSION : '1.0.0';
		wp_enqueue_style(
			'adaire-admin-theme',
			plugin_dir_url( __DIR__ ) . 'admin/css/adaire-admin-theme.css',
			array(),
			$version
		);
	}
}
add_action( 'admin_enqueue_scripts', 'adaire_mega_menu_enqueue_assets' );

if ( ! function_exists( 'adaire_mega_menu_disabled_menu_ids' ) ) {
	/**
	 * Gets the list of nav menu term ids marked disabled via this dashboard.
	 *
	 * @return int[]
	 */
	function adaire_mega_menu_disabled_menu_ids() {
		$disabled = get_option( 'adaire_mega_menu_disabled_menus', array() );
		return is_array( $disabled ) ? array_map( 'absint', $disabled ) : array();
	}
}

if ( ! function_exists( 'adaire_mega_menu_dashboard_page' ) ) {
	/**
	 * Renders the Mega Menu dashboard page and handles its form actions.
	 */
	function adaire_mega_menu_dashboard_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized access', 'adaire-blocks' ) );
		}

		$active_tab = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'menus';
		if ( ! in_array( $active_tab, array( 'menus', 'panels', 'settings' ), true ) ) {
			$active_tab = 'menus';
		}

		$notice      = '';
		$notice_type = '';

		// -----------------------------------------------------------------
		// Handle actions (each nonce-checked and capability-checked before
		// doing anything; every mutation redirects afterwards so a page
		// refresh never resubmits the action).
		// -----------------------------------------------------------------
		if ( isset( $_POST['adaire_mega_menu_action'] ) && isset( $_POST['adaire_mega_menu_nonce'] ) &&
			wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['adaire_mega_menu_nonce'] ) ), 'adaire_mega_menu_dashboard' )
		) {
			$action = sanitize_key( wp_unslash( $_POST['adaire_mega_menu_action'] ) );

			if ( 'toggle_menu' === $action ) {
				$menu_id  = absint( $_POST['menu_id'] ?? 0 );
				$disabled = adaire_mega_menu_disabled_menu_ids();
				if ( in_array( $menu_id, $disabled, true ) ) {
					$disabled = array_diff( $disabled, array( $menu_id ) );
				} else {
					$disabled[] = $menu_id;
				}
				update_option( 'adaire_mega_menu_disabled_menus', array_values( $disabled ) );
				wp_safe_redirect(
					add_query_arg(
						array(
							'page'    => 'adaire-blocks-mega-menu',
							'tab'     => 'menus',
							'updated' => '1',
						),
						admin_url( 'admin.php' )
					)
				);
				exit;
			}

			if ( 'toggle_panel' === $action && class_exists( 'AdaireMegaPanelPostType' ) ) {
				$panel_id = absint( $_POST['panel_id'] ?? 0 );
				if ( current_user_can( 'edit_post', $panel_id ) ) {
					$enabled = AdaireMegaPanelPostType::is_enabled( $panel_id );
					update_post_meta( $panel_id, AdaireMegaPanelPostType::META_ENABLED, $enabled ? '0' : '1' );
				}
				wp_safe_redirect(
					add_query_arg(
						array(
							'page'    => 'adaire-blocks-mega-menu',
							'tab'     => 'panels',
							'updated' => '1',
						),
						admin_url( 'admin.php' )
					)
				);
				exit;
			}

			if ( 'duplicate_panel' === $action && class_exists( 'AdaireMegaPanelPostType' ) ) {
				$panel_id = absint( $_POST['panel_id'] ?? 0 );
				$source   = get_post( $panel_id );

				if ( $source && AdaireMegaPanelPostType::POST_TYPE === $source->post_type && current_user_can( 'edit_post', $panel_id ) ) {
					$new_id = wp_insert_post(
						array(
							/* translators: %s: original panel title. */
							'post_title'   => sprintf( __( '%s (Copy)', 'adaire-blocks' ), $source->post_title ),
							'post_content' => $source->post_content,
							'post_type'    => AdaireMegaPanelPostType::POST_TYPE,
							'post_status'  => 'draft',
						),
						true
					);

					if ( ! is_wp_error( $new_id ) ) {
						$source_enabled = get_post_meta( $panel_id, AdaireMegaPanelPostType::META_ENABLED, true );
						update_post_meta( $new_id, AdaireMegaPanelPostType::META_ENABLED, $source_enabled ? $source_enabled : '1' );
					}
				}
				wp_safe_redirect(
					add_query_arg(
						array(
							'page'    => 'adaire-blocks-mega-menu',
							'tab'     => 'panels',
							'updated' => '1',
						),
						admin_url( 'admin.php' )
					)
				);
				exit;
			}

			if ( 'delete_panel' === $action && class_exists( 'AdaireMegaPanelPostType' ) ) {
				$panel_id = absint( $_POST['panel_id'] ?? 0 );
				if ( current_user_can( 'delete_post', $panel_id ) ) {
					wp_trash_post( $panel_id );
				}
				wp_safe_redirect(
					add_query_arg(
						array(
							'page'    => 'adaire-blocks-mega-menu',
							'tab'     => 'panels',
							'updated' => '1',
						),
						admin_url( 'admin.php' )
					)
				);
				exit;
			}

			if ( 'save_settings' === $action ) {
				$settings = array(
					'defaultLayout'     => in_array( sanitize_key( wp_unslash( $_POST['default_layout'] ?? '' ) ), array( 'contained', 'wide', 'full' ), true ) ? sanitize_key( wp_unslash( $_POST['default_layout'] ) ) : 'contained',
					'defaultMaxWidth'   => absint( $_POST['default_max_width'] ?? 960 ),
					'defaultBreakpoint' => absint( $_POST['default_breakpoint'] ?? 1024 ),
					'defaultTrigger'    => in_array( sanitize_key( wp_unslash( $_POST['default_trigger'] ?? '' ) ), array( 'hover', 'click', 'hover-focus' ), true ) ? sanitize_key( wp_unslash( $_POST['default_trigger'] ) ) : 'hover',
					'defaultAnimation'  => in_array( sanitize_key( wp_unslash( $_POST['default_animation'] ?? '' ) ), array( 'none', 'fade', 'fade-slide', 'scale' ), true ) ? sanitize_key( wp_unslash( $_POST['default_animation'] ) ) : 'fade-slide',
					'animationDuration' => absint( $_POST['animation_duration'] ?? 200 ),
					'openDelay'         => absint( $_POST['open_delay'] ?? 100 ),
					'closeDelay'        => absint( $_POST['close_delay'] ?? 200 ),
					'enableClassic'     => isset( $_POST['enable_classic'] ),
					'enableFse'         => isset( $_POST['enable_fse'] ),
					'removeOnUninstall' => isset( $_POST['remove_on_uninstall'] ),
				);
				update_option( 'adaire_mega_menu_settings', $settings );
				$notice      = __( 'Mega Menu settings saved.', 'adaire-blocks' );
				$notice_type = 'success';
			}
		}

		if ( isset( $_GET['updated'] ) ) {
			$notice      = __( 'Done.', 'adaire-blocks' );
			$notice_type = 'success';
		}
		?>
		<div class="wrap">
			<div class="aa-page">
				<div class="aa-header">
					<div class="aa-header-text">
						<div class="aa-eyebrow"><?php esc_html_e( 'Adaire Blocks', 'adaire-blocks' ); ?></div>
						<h1><?php esc_html_e( 'Mega Menu', 'adaire-blocks' ); ?></h1>
						<p><?php esc_html_e( 'Manage centrally-owned mega panels and see where your menus are used. Menu structure itself is edited natively under Appearance > Menus.', 'adaire-blocks' ); ?></p>
					</div>
				</div>

				<?php if ( $notice ) : ?>
					<div class="aa-notice aa-notice-<?php echo esc_attr( $notice_type ); ?>"><?php echo esc_html( $notice ); ?></div>
				<?php endif; ?>

				<h2 class="nav-tab-wrapper">
					<a href="
					<?php
					echo esc_url(
						add_query_arg(
							array(
								'page' => 'adaire-blocks-mega-menu',
								'tab'  => 'menus',
							),
							admin_url( 'admin.php' )
						)
					);
					?>
					" class="nav-tab <?php echo 'menus' === $active_tab ? 'nav-tab-active' : ''; ?>">
						<?php esc_html_e( 'Menus', 'adaire-blocks' ); ?>
					</a>
					<a href="
					<?php
					echo esc_url(
						add_query_arg(
							array(
								'page' => 'adaire-blocks-mega-menu',
								'tab'  => 'panels',
							),
							admin_url( 'admin.php' )
						)
					);
					?>
					" class="nav-tab <?php echo 'panels' === $active_tab ? 'nav-tab-active' : ''; ?>">
						<?php esc_html_e( 'Mega Panels', 'adaire-blocks' ); ?>
					</a>
					<a href="
					<?php
					echo esc_url(
						add_query_arg(
							array(
								'page' => 'adaire-blocks-mega-menu',
								'tab'  => 'settings',
							),
							admin_url( 'admin.php' )
						)
					);
					?>
					" class="nav-tab <?php echo 'settings' === $active_tab ? 'nav-tab-active' : ''; ?>">
						<?php esc_html_e( 'Settings', 'adaire-blocks' ); ?>
					</a>
				</h2>

				<div class="aa-card" style="margin-top: 20px;">
					<?php
					if ( 'menus' === $active_tab ) {
						adaire_mega_menu_render_menus_tab();
					} elseif ( 'panels' === $active_tab ) {
						adaire_mega_menu_render_panels_tab();
					} else {
						adaire_mega_menu_render_settings_tab();
					}
					?>
				</div>
			</div>
		</div>
		<?php
	}
}

if ( ! function_exists( 'adaire_mega_menu_render_menus_tab' ) ) {
	/**
	 * Renders the Menus tab: a status overview of native WordPress nav menus.
	 */
	function adaire_mega_menu_render_menus_tab() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only list search/filter, not a state-changing action.
		$search = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only list search/filter, not a state-changing action.
		$status    = isset( $_GET['status'] ) ? sanitize_key( wp_unslash( $_GET['status'] ) ) : 'all';
		$menus     = wp_get_nav_menus();
		$disabled  = adaire_mega_menu_disabled_menu_ids();
		$locations = get_nav_menu_locations();
		?>
		<div class="aa-card-title"><?php esc_html_e( 'Menus', 'adaire-blocks' ); ?></div>
		<p class="aa-card-subtitle">
			<?php esc_html_e( 'Structure, ordering, and links are managed natively under Appearance > Menus. This is a status overview — assign a mega panel to any top-level item from the native menu editor.', 'adaire-blocks' ); ?>
		</p>

		<form method="get" style="display:flex; gap:8px; align-items:center; margin-bottom:14px;">
			<input type="hidden" name="page" value="adaire-blocks-mega-menu" />
			<input type="hidden" name="tab" value="menus" />
			<input type="search" name="s" value="<?php echo esc_attr( $search ); ?>" placeholder="<?php esc_attr_e( 'Search menus…', 'adaire-blocks' ); ?>" />
			<select name="status">
				<option value="all" <?php selected( $status, 'all' ); ?>><?php esc_html_e( 'All statuses', 'adaire-blocks' ); ?></option>
				<option value="enabled" <?php selected( $status, 'enabled' ); ?>><?php esc_html_e( 'Enabled', 'adaire-blocks' ); ?></option>
				<option value="disabled" <?php selected( $status, 'disabled' ); ?>><?php esc_html_e( 'Disabled', 'adaire-blocks' ); ?></option>
			</select>
			<button type="submit" class="aa-btn aa-btn-secondary"><?php esc_html_e( 'Filter', 'adaire-blocks' ); ?></button>
			<a href="<?php echo esc_url( admin_url( 'nav-menus.php?action=edit&menu=0' ) ); ?>" class="aa-btn aa-btn-primary" style="margin-left:auto;">
				<?php esc_html_e( 'Create Menu', 'adaire-blocks' ); ?>
			</a>
		</form>

		<?php
		$filtered = array_filter(
			$menus,
			function ( $menu ) use ( $search, $status, $disabled ) {
				if ( $search && stripos( $menu->name, $search ) === false ) {
					return false;
				}
				$is_disabled = in_array( $menu->term_id, $disabled, true );
				if ( 'enabled' === $status && $is_disabled ) {
					return false;
				}
				if ( 'disabled' === $status && ! $is_disabled ) {
					return false;
				}
				return true;
			}
		);

		if ( empty( $filtered ) ) :
			?>
			<div class="aa-notice aa-notice-error">
				<?php esc_html_e( 'No menus found. Create one under Appearance > Menus, then it will appear here.', 'adaire-blocks' ); ?>
			</div>
			<?php
			return;
		endif;
		?>
		<table class="widefat striped">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Menu name', 'adaire-blocks' ); ?></th>
					<th><?php esc_html_e( 'ID', 'adaire-blocks' ); ?></th>
					<th><?php esc_html_e( 'Assigned location', 'adaire-blocks' ); ?></th>
					<th><?php esc_html_e( 'Top-level items', 'adaire-blocks' ); ?></th>
					<th><?php esc_html_e( 'Theme compatibility', 'adaire-blocks' ); ?></th>
					<th><?php esc_html_e( 'Status', 'adaire-blocks' ); ?></th>
					<th><?php esc_html_e( 'Actions', 'adaire-blocks' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $filtered as $menu ) : ?>
					<?php
					$items          = wp_get_nav_menu_items( $menu->term_id );
					$top_level      = $items ? array_filter(
						$items,
						function ( $item ) {
							return 0 === (int) $item->menu_item_parent;
						}
					) : array();
					$assigned_slugs = array_keys(
						array_filter(
							$locations,
							function ( $term_id ) use ( $menu ) {
								return (int) $term_id === (int) $menu->term_id;
							}
						)
					);
					$is_disabled    = in_array( $menu->term_id, $disabled, true );
					?>
					<tr>
						<td><strong><?php echo esc_html( $menu->name ); ?></strong></td>
						<td>#<?php echo esc_html( $menu->term_id ); ?></td>
						<td><?php echo $assigned_slugs ? esc_html( implode( ', ', $assigned_slugs ) ) : '—'; ?></td>
						<td><?php echo esc_html( count( $top_level ) ); ?></td>
						<td>
							<?php
							if ( in_array( 'adaire-blocks-primary', $assigned_slugs, true ) || in_array( 'adaire-blocks-footer', $assigned_slugs, true ) ) {
								esc_html_e( 'Classic & FSE (via Header/Mega Menu blocks)', 'adaire-blocks' );
							} else {
								esc_html_e( 'Not assigned to a location', 'adaire-blocks' );
							}
							?>
						</td>
						<td>
							<span class="aa-pill <?php echo $is_disabled ? 'aa-pill-muted' : 'aa-pill-success'; ?>">
								<?php echo $is_disabled ? esc_html__( 'Disabled', 'adaire-blocks' ) : esc_html__( 'Enabled', 'adaire-blocks' ); ?>
							</span>
						</td>
						<td>
							<a href="<?php echo esc_url( admin_url( 'nav-menus.php?action=edit&menu=' . $menu->term_id ) ); ?>"><?php esc_html_e( 'Edit', 'adaire-blocks' ); ?></a>
							|
							<form method="post" style="display:inline;">
								<?php wp_nonce_field( 'adaire_mega_menu_dashboard', 'adaire_mega_menu_nonce' ); ?>
								<input type="hidden" name="adaire_mega_menu_action" value="toggle_menu" />
								<input type="hidden" name="menu_id" value="<?php echo esc_attr( $menu->term_id ); ?>" />
								<button type="submit" class="button-link"><?php echo $is_disabled ? esc_html__( 'Enable', 'adaire-blocks' ) : esc_html__( 'Disable', 'adaire-blocks' ); ?></button>
							</form>
							|
							<a href="<?php echo esc_url( admin_url( 'nav-menus.php?action=delete&menu=' . $menu->term_id ) ); ?>" onclick="return confirm('<?php echo esc_js( __( 'Delete this menu? This cannot be undone.', 'adaire-blocks' ) ); ?>');">
								<?php esc_html_e( 'Delete', 'adaire-blocks' ); ?>
							</a>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
		<?php
	}
}

if ( ! function_exists( 'adaire_mega_menu_render_panels_tab' ) ) {
	/**
	 * Renders the Mega Panels tab: list, search, filter, and row actions.
	 */
	function adaire_mega_menu_render_panels_tab() {
		if ( ! class_exists( 'AdaireMegaPanelPostType' ) ) {
			echo '<div class="aa-notice aa-notice-error">' . esc_html__( 'Mega panel post type is not available.', 'adaire-blocks' ) . '</div>';
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only list search/filter, not a state-changing action.
		$search = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only list search/filter, not a state-changing action.
		$status = isset( $_GET['status'] ) ? sanitize_key( wp_unslash( $_GET['status'] ) ) : 'all';

		$query_args = array(
			'post_type'      => AdaireMegaPanelPostType::POST_TYPE,
			'posts_per_page' => 50,
			'orderby'        => 'modified',
			'order'          => 'DESC',
			's'              => $search,
		);

		if ( 'publish' === $status || 'draft' === $status ) {
			$query_args['post_status'] = $status;
		} else {
			$query_args['post_status'] = array( 'publish', 'draft' );
		}

		$panels = get_posts( $query_args );
		?>
		<div class="aa-card-title"><?php esc_html_e( 'Mega Panels', 'adaire-blocks' ); ?></div>
		<p class="aa-card-subtitle">
			<?php esc_html_e( 'Reusable dropdown content, built with the block editor. Assign a panel to a menu item under Appearance > Menus, or select it directly in a Mega Menu Item block inside Core Navigation.', 'adaire-blocks' ); ?>
		</p>

		<form method="get" style="display:flex; gap:8px; align-items:center; margin-bottom:14px;">
			<input type="hidden" name="page" value="adaire-blocks-mega-menu" />
			<input type="hidden" name="tab" value="panels" />
			<input type="search" name="s" value="<?php echo esc_attr( $search ); ?>" placeholder="<?php esc_attr_e( 'Search panels…', 'adaire-blocks' ); ?>" />
			<select name="status">
				<option value="all" <?php selected( $status, 'all' ); ?>><?php esc_html_e( 'All statuses', 'adaire-blocks' ); ?></option>
				<option value="publish" <?php selected( $status, 'publish' ); ?>><?php esc_html_e( 'Published', 'adaire-blocks' ); ?></option>
				<option value="draft" <?php selected( $status, 'draft' ); ?>><?php esc_html_e( 'Draft', 'adaire-blocks' ); ?></option>
			</select>
			<button type="submit" class="aa-btn aa-btn-secondary"><?php esc_html_e( 'Filter', 'adaire-blocks' ); ?></button>
			<a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=' . AdaireMegaPanelPostType::POST_TYPE ) ); ?>" class="aa-btn aa-btn-primary" style="margin-left:auto;">
				<?php esc_html_e( 'Create Panel', 'adaire-blocks' ); ?>
			</a>
		</form>

		<?php if ( empty( $panels ) ) : ?>
			<div class="aa-notice aa-notice-error">
				<?php esc_html_e( 'No mega panels yet. Create one to start building reusable dropdown content.', 'adaire-blocks' ); ?>
			</div>
			<?php
			return;
		endif;
		?>
		<table class="widefat striped">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Title', 'adaire-blocks' ); ?></th>
					<th><?php esc_html_e( 'ID', 'adaire-blocks' ); ?></th>
					<th><?php esc_html_e( 'Status', 'adaire-blocks' ); ?></th>
					<th><?php esc_html_e( 'Last modified', 'adaire-blocks' ); ?></th>
					<th><?php esc_html_e( 'Actions', 'adaire-blocks' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $panels as $panel ) : ?>
					<?php $enabled = AdaireMegaPanelPostType::is_enabled( $panel->ID ); ?>
					<tr>
						<td><strong><?php echo esc_html( $panel->post_title ? $panel->post_title : __( '(no title)', 'adaire-blocks' ) ); ?></strong></td>
						<td>#<?php echo esc_html( $panel->ID ); ?></td>
						<td>
							<span class="aa-pill <?php echo 'publish' === $panel->post_status ? 'aa-pill-success' : 'aa-pill-muted'; ?>">
								<?php echo esc_html( ucfirst( $panel->post_status ) ); ?>
							</span>
							<span class="aa-pill <?php echo $enabled ? 'aa-pill-accent' : 'aa-pill-muted'; ?>">
								<?php echo $enabled ? esc_html__( 'Enabled', 'adaire-blocks' ) : esc_html__( 'Disabled', 'adaire-blocks' ); ?>
							</span>
						</td>
						<td><?php echo esc_html( get_the_modified_date( '', $panel ) ); ?></td>
						<td>
							<a href="<?php echo esc_url( get_edit_post_link( $panel->ID, 'raw' ) ); ?>"><?php esc_html_e( 'Edit', 'adaire-blocks' ); ?></a>
							|
							<form method="post" style="display:inline;">
								<?php wp_nonce_field( 'adaire_mega_menu_dashboard', 'adaire_mega_menu_nonce' ); ?>
								<input type="hidden" name="adaire_mega_menu_action" value="duplicate_panel" />
								<input type="hidden" name="panel_id" value="<?php echo esc_attr( $panel->ID ); ?>" />
								<button type="submit" class="button-link"><?php esc_html_e( 'Duplicate', 'adaire-blocks' ); ?></button>
							</form>
							|
							<form method="post" style="display:inline;">
								<?php wp_nonce_field( 'adaire_mega_menu_dashboard', 'adaire_mega_menu_nonce' ); ?>
								<input type="hidden" name="adaire_mega_menu_action" value="toggle_panel" />
								<input type="hidden" name="panel_id" value="<?php echo esc_attr( $panel->ID ); ?>" />
								<button type="submit" class="button-link"><?php echo $enabled ? esc_html__( 'Disable', 'adaire-blocks' ) : esc_html__( 'Enable', 'adaire-blocks' ); ?></button>
							</form>
							|
							<form method="post" style="display:inline;" onsubmit="return confirm('<?php echo esc_js( __( 'Move this panel to Trash?', 'adaire-blocks' ) ); ?>');">
								<?php wp_nonce_field( 'adaire_mega_menu_dashboard', 'adaire_mega_menu_nonce' ); ?>
								<input type="hidden" name="adaire_mega_menu_action" value="delete_panel" />
								<input type="hidden" name="panel_id" value="<?php echo esc_attr( $panel->ID ); ?>" />
								<button type="submit" class="button-link" style="color:#b32d2e;"><?php esc_html_e( 'Delete', 'adaire-blocks' ); ?></button>
							</form>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
		<?php
	}
}

if ( ! function_exists( 'adaire_mega_menu_get_settings' ) ) {
	/**
	 * Gets the Mega Menu global default settings, merged over defaults.
	 *
	 * @return array
	 */
	function adaire_mega_menu_get_settings() {
		$defaults = array(
			'defaultLayout'     => 'contained',
			'defaultMaxWidth'   => 960,
			'defaultBreakpoint' => 1024,
			'defaultTrigger'    => 'hover',
			'defaultAnimation'  => 'fade-slide',
			'animationDuration' => 200,
			'openDelay'         => 100,
			'closeDelay'        => 200,
			'enableClassic'     => true,
			'enableFse'         => true,
			'removeOnUninstall' => false,
		);
		$stored   = get_option( 'adaire_mega_menu_settings', array() );
		return is_array( $stored ) ? array_merge( $defaults, $stored ) : $defaults;
	}
}

if ( ! function_exists( 'adaire_mega_menu_render_settings_tab' ) ) {
	/**
	 * Renders the Settings tab: global defaults form.
	 */
	function adaire_mega_menu_render_settings_tab() {
		$settings = adaire_mega_menu_get_settings();
		?>
		<div class="aa-card-title"><?php esc_html_e( 'Global Defaults', 'adaire-blocks' ); ?></div>
		<p class="aa-card-subtitle"><?php esc_html_e( 'Applied as fallbacks; each block instance can override these individually.', 'adaire-blocks' ); ?></p>

		<form method="post">
			<?php wp_nonce_field( 'adaire_mega_menu_dashboard', 'adaire_mega_menu_nonce' ); ?>
			<input type="hidden" name="adaire_mega_menu_action" value="save_settings" />

			<table class="form-table">
				<tr>
					<th><label for="default_layout"><?php esc_html_e( 'Default dropdown width', 'adaire-blocks' ); ?></label></th>
					<td>
						<select name="default_layout" id="default_layout">
							<option value="contained" <?php selected( $settings['defaultLayout'], 'contained' ); ?>><?php esc_html_e( 'Contained', 'adaire-blocks' ); ?></option>
							<option value="wide" <?php selected( $settings['defaultLayout'], 'wide' ); ?>><?php esc_html_e( 'Wide', 'adaire-blocks' ); ?></option>
							<option value="full" <?php selected( $settings['defaultLayout'], 'full' ); ?>><?php esc_html_e( 'Full viewport', 'adaire-blocks' ); ?></option>
						</select>
					</td>
				</tr>
				<tr>
					<th><label for="default_max_width"><?php esc_html_e( 'Default maximum width (px)', 'adaire-blocks' ); ?></label></th>
					<td><input type="number" name="default_max_width" id="default_max_width" value="<?php echo esc_attr( $settings['defaultMaxWidth'] ); ?>" min="320" max="1600" /></td>
				</tr>
				<tr>
					<th><label for="default_breakpoint"><?php esc_html_e( 'Default mobile breakpoint (px)', 'adaire-blocks' ); ?></label></th>
					<td><input type="number" name="default_breakpoint" id="default_breakpoint" value="<?php echo esc_attr( $settings['defaultBreakpoint'] ); ?>" min="320" max="1600" /></td>
				</tr>
				<tr>
					<th><label for="default_trigger"><?php esc_html_e( 'Default trigger', 'adaire-blocks' ); ?></label></th>
					<td>
						<select name="default_trigger" id="default_trigger">
							<option value="hover" <?php selected( $settings['defaultTrigger'], 'hover' ); ?>><?php esc_html_e( 'Hover', 'adaire-blocks' ); ?></option>
							<option value="click" <?php selected( $settings['defaultTrigger'], 'click' ); ?>><?php esc_html_e( 'Click', 'adaire-blocks' ); ?></option>
							<option value="hover-focus" <?php selected( $settings['defaultTrigger'], 'hover-focus' ); ?>><?php esc_html_e( 'Hover and keyboard focus', 'adaire-blocks' ); ?></option>
						</select>
					</td>
				</tr>
				<tr>
					<th><label for="default_animation"><?php esc_html_e( 'Default animation', 'adaire-blocks' ); ?></label></th>
					<td>
						<select name="default_animation" id="default_animation">
							<option value="none" <?php selected( $settings['defaultAnimation'], 'none' ); ?>><?php esc_html_e( 'None', 'adaire-blocks' ); ?></option>
							<option value="fade" <?php selected( $settings['defaultAnimation'], 'fade' ); ?>><?php esc_html_e( 'Fade', 'adaire-blocks' ); ?></option>
							<option value="fade-slide" <?php selected( $settings['defaultAnimation'], 'fade-slide' ); ?>><?php esc_html_e( 'Fade and slide', 'adaire-blocks' ); ?></option>
							<option value="scale" <?php selected( $settings['defaultAnimation'], 'scale' ); ?>><?php esc_html_e( 'Scale', 'adaire-blocks' ); ?></option>
						</select>
					</td>
				</tr>
				<tr>
					<th><label for="animation_duration"><?php esc_html_e( 'Default animation duration (ms)', 'adaire-blocks' ); ?></label></th>
					<td><input type="number" name="animation_duration" id="animation_duration" value="<?php echo esc_attr( $settings['animationDuration'] ); ?>" min="0" max="800" /></td>
				</tr>
				<tr>
					<th><label for="open_delay"><?php esc_html_e( 'Default open delay (ms)', 'adaire-blocks' ); ?></label></th>
					<td><input type="number" name="open_delay" id="open_delay" value="<?php echo esc_attr( $settings['openDelay'] ); ?>" min="0" max="1000" /></td>
				</tr>
				<tr>
					<th><label for="close_delay"><?php esc_html_e( 'Default close delay (ms)', 'adaire-blocks' ); ?></label></th>
					<td><input type="number" name="close_delay" id="close_delay" value="<?php echo esc_attr( $settings['closeDelay'] ); ?>" min="0" max="1000" /></td>
				</tr>
				<tr>
					<th><?php esc_html_e( 'Integrations', 'adaire-blocks' ); ?></th>
					<td>
						<label><input type="checkbox" name="enable_classic" <?php checked( $settings['enableClassic'] ); ?> /> <?php esc_html_e( 'Enable classic-theme integration', 'adaire-blocks' ); ?></label><br />
						<label><input type="checkbox" name="enable_fse" <?php checked( $settings['enableFse'] ); ?> /> <?php esc_html_e( 'Enable FSE integration', 'adaire-blocks' ); ?></label>
					</td>
				</tr>
				<tr>
					<th><?php esc_html_e( 'Uninstall', 'adaire-blocks' ); ?></th>
					<td>
						<label><input type="checkbox" name="remove_on_uninstall" <?php checked( $settings['removeOnUninstall'] ); ?> /> <?php esc_html_e( 'Remove all Mega Menu data on uninstall', 'adaire-blocks' ); ?></label>
					</td>
				</tr>
			</table>

			<button type="submit" class="aa-btn aa-btn-primary"><?php esc_html_e( 'Save Settings', 'adaire-blocks' ); ?></button>
		</form>
		<?php
	}
}
