<?php
/**
 * Cookie Categories admin page (Pro).
 *
 * Site-wide storage for the Cookie Banner block's consent categories, so
 * every instance of the block across the site shares one definition instead
 * of each block having its own separately-editable category list. The block
 * renders dynamically (see src/cookie-consent-block/render.php) and reads
 * this option directly on every page load, so a change here is reflected
 * everywhere immediately — no need to re-save any post.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'ADAIRE_COOKIE_CATEGORIES_OPTION' ) ) {
	define( 'ADAIRE_COOKIE_CATEGORIES_OPTION', 'adaire_cookie_categories' );
}

if ( ! function_exists( 'adaire_cookie_banner_find_instance' ) ) {
	/**
	 * Whether the Cookie Banner block is actually placed somewhere on the
	 * site, and if so, where — powers the dashboard's status card. A plain
	 * LIKE search over post_content, same technique already used for the
	 * free Cookie Notice block's site-wide render (see
	 * includes/cookie-notice-global.php) — the block comment string is
	 * still present in post_content even though this block renders
	 * dynamically (its save() is empty).
	 *
	 * @return array{post_id:int,edit_url:string}|null
	 */
	function adaire_cookie_banner_find_instance() {
		global $wpdb;
		$post_id = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT ID FROM {$wpdb->posts} WHERE post_status IN ('publish','private') AND post_content LIKE %s LIMIT 1",
				'%' . $wpdb->esc_like( 'wp:create-block/cookie-consent-block' ) . '%'
			)
		);

		if ( ! $post_id ) {
			return null;
		}

		return array(
			'post_id'  => (int) $post_id,
			'edit_url' => get_edit_post_link( $post_id, 'raw' ),
		);
	}
}

if ( ! function_exists( 'adaire_cookie_categories_default' ) ) {
	/**
	 * The category list every Pro install starts with — matches what the
	 * Cookie Banner block previously shipped as its own attribute default,
	 * so a fresh install (or a site upgrading from a version predating this
	 * page) sees identical behavior until an admin customizes it here.
	 *
	 * @return array[]
	 */
	function adaire_cookie_categories_default() {
		return array(
			array(
				'key'            => 'necessary',
				'label'          => 'Strictly Necessary',
				'description'    => 'Required for the website to function properly. These cannot be disabled.',
				'required'       => true,
				'defaultChecked' => true,
			),
			array(
				'key'            => 'functional',
				'label'          => 'Functional',
				'description'    => 'Enable enhanced functionality and personalization.',
				'required'       => false,
				'defaultChecked' => true,
			),
			array(
				'key'            => 'preferences',
				'label'          => 'Preferences',
				'description'    => 'Remember your settings and preferences across visits.',
				'required'       => false,
				'defaultChecked' => true,
			),
			array(
				'key'            => 'analytics',
				'label'          => 'Analytics',
				'description'    => 'Help us understand how visitors interact with our website.',
				'required'       => false,
				'defaultChecked' => true,
			),
			array(
				'key'            => 'marketing',
				'label'          => 'Marketing',
				'description'    => 'Used to deliver relevant ads and marketing campaigns.',
				'required'       => false,
				'defaultChecked' => false,
			),
			array(
				'key'            => 'advertising',
				'label'          => 'Advertising',
				'description'    => 'Used by advertising partners to build a profile of your interests.',
				'required'       => false,
				'defaultChecked' => false,
			),
			array(
				'key'            => 'performance',
				'label'          => 'Performance',
				'description'    => 'Help us measure and improve site speed and performance.',
				'required'       => false,
				'defaultChecked' => true,
			),
			array(
				'key'            => 'social',
				'label'          => 'Social Media',
				'description'    => 'Enable social media features, embeds, and sharing.',
				'required'       => false,
				'defaultChecked' => false,
			),
		);
	}
}

if ( ! function_exists( 'adaire_get_cookie_categories' ) ) {
	/**
	 * The current site-wide category list — every Cookie Banner block
	 * instance (editor preview and front end alike) reads from this.
	 *
	 * @return array[]
	 */
	function adaire_get_cookie_categories() {
		$stored = get_option( ADAIRE_COOKIE_CATEGORIES_OPTION );
		if ( is_array( $stored ) && ! empty( $stored ) ) {
			return $stored;
		}
		return adaire_cookie_categories_default();
	}
}

if ( ! function_exists( 'adaire_cookie_categories_add_menu' ) ) {
	function adaire_cookie_categories_add_menu() {
		add_submenu_page(
			'adaire-blocks-settings',
			'Cookie Dashboard',
			'Cookie Categories',
			'manage_options',
			'adaire-blocks-cookie-categories',
			'adaire_cookie_categories_page'
		);
	}
}
add_action( 'admin_menu', 'adaire_cookie_categories_add_menu' );

if ( ! function_exists( 'adaire_cookie_categories_enqueue_theme' ) ) {
	/**
	 * The hook for a submenu under 'adaire-blocks-settings' is:
	 *   adaire-blocks-settings_page_adaire-blocks-cookie-categories
	 */
	function adaire_cookie_categories_enqueue_theme( $hook ) {
		if ( $hook !== 'adaire-blocks-settings_page_adaire-blocks-cookie-categories' ) {
			return;
		}
		$version = defined( 'ADAIRE_BLOCKS_VERSION' ) ? ADAIRE_BLOCKS_VERSION : '1.0.0';
		wp_enqueue_style(
			'adaire-admin-theme',
			plugin_dir_url( __FILE__ ) . 'css/adaire-admin-theme.css',
			array(),
			$version
		);
	}
}
add_action( 'admin_enqueue_scripts', 'adaire_cookie_categories_enqueue_theme' );

if ( ! function_exists( 'adaire_cookie_categories_localize_editor' ) ) {
	/**
	 * Expose the current site-wide category list to the block editor so the
	 * Cookie Banner block's Inspector can show a live read-only preview of
	 * what render.php will actually output — without it, editors would have
	 * no way to see the categories short of publishing and checking the
	 * front end.
	 */
	function adaire_cookie_categories_localize_editor() {
		$data = array(
			'categories' => adaire_get_cookie_categories(),
			'manageUrl'  => admin_url( 'admin.php?page=adaire-blocks-cookie-categories' ),
		);
		wp_add_inline_script(
			'wp-block-editor',
			'window.adaireCookieCategoriesData = ' . wp_json_encode( $data ) . ';',
			'before'
		);
	}
}
add_action( 'enqueue_block_editor_assets', 'adaire_cookie_categories_localize_editor' );

if ( ! function_exists( 'adaire_cookie_categories_sanitize_submission' ) ) {
	/**
	 * Turn the raw $_POST rows into a clean category array, dropping any row
	 * left with an empty key (the trailing "add another" row when unused).
	 *
	 * @param array $rows Raw POSTed rows: key => [key, label, description, required, defaultChecked].
	 * @return array[]
	 */
	function adaire_cookie_categories_sanitize_submission( $rows ) {
		$clean = array();
		$seen_keys = array();

		foreach ( $rows as $row ) {
			$key = isset( $row['key'] ) ? sanitize_key( $row['key'] ) : '';
			if ( '' === $key || isset( $seen_keys[ $key ] ) ) {
				continue;
			}
			$seen_keys[ $key ] = true;

			$required = ! empty( $row['required'] );

			$clean[] = array(
				'key'            => $key,
				'label'          => isset( $row['label'] ) ? sanitize_text_field( $row['label'] ) : $key,
				'description'    => isset( $row['description'] ) ? sanitize_text_field( $row['description'] ) : '',
				// A required category is always active, so its "default checked"
				// state is meaningless — force it true for consistency.
				'required'       => $required,
				'defaultChecked' => $required ? true : ! empty( $row['defaultChecked'] ),
			);
		}

		return $clean;
	}
}

if ( ! function_exists( 'adaire_cookie_categories_page' ) ) {
	function adaire_cookie_categories_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Unauthorized access' );
		}

		$notice = '';
		$notice_type = '';

		if ( isset( $_POST['adaire_cookie_categories_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['adaire_cookie_categories_nonce'] ) ), 'adaire_cookie_categories_save' ) ) {
			$rows = isset( $_POST['category'] ) && is_array( $_POST['category'] ) ? wp_unslash( $_POST['category'] ) : array();
			$categories = adaire_cookie_categories_sanitize_submission( $rows );

			if ( empty( $categories ) ) {
				$notice = 'At least one category is required — changes were not saved.';
				$notice_type = 'error';
			} else {
				update_option( ADAIRE_COOKIE_CATEGORIES_OPTION, $categories, false );
				$notice = 'Cookie categories saved. Every Cookie Banner block on the site now reflects this list.';
				$notice_type = 'success';
			}
		} elseif ( isset( $_POST['adaire_cookie_categories_reset'] ) && isset( $_POST['adaire_cookie_categories_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['adaire_cookie_categories_nonce'] ) ), 'adaire_cookie_categories_save' ) ) {
			delete_option( ADAIRE_COOKIE_CATEGORIES_OPTION );
			$notice = 'Reset to the default category list.';
			$notice_type = 'success';
		}

		$categories = adaire_get_cookie_categories();

		$banner_instance = adaire_cookie_banner_find_instance();
		$required_count  = 0;
		$optional_count  = 0;
		$on_by_default   = 0;
		foreach ( $categories as $cat ) {
			if ( ! empty( $cat['required'] ) ) {
				$required_count++;
			} else {
				$optional_count++;
				if ( ! empty( $cat['defaultChecked'] ) ) {
					$on_by_default++;
				}
			}
		}
		?>
		<div class="wrap">
			<div class="aa-page">
				<div class="aa-header">
					<div class="aa-header-text">
						<div class="aa-eyebrow">Pro · Cookie Banner</div>
						<h1>Cookie Dashboard</h1>
						<p>Define the consent categories shown in every Cookie Banner block's preferences panel across the site. Blocks read this list live — there's nothing else to re-save after changing it here.</p>
					</div>
				</div>

				<?php if ( $notice ) : ?>
					<div class="aa-notice aa-notice-<?php echo esc_attr( $notice_type ); ?>"><?php echo esc_html( $notice ); ?></div>
				<?php endif; ?>

				<div class="aa-grid adaire-cookie-dashboard-summary">
					<div class="aa-card" style="margin-bottom: 0;">
						<div class="aa-card-title"><?php echo esc_html( wp_parse_url( home_url(), PHP_URL_HOST ) ); ?></div>
						<?php if ( $banner_instance ) : ?>
							<div class="aa-notice aa-notice-success" style="display: flex; align-items: center; gap: 10px; margin-top: 12px;">
								<span class="dashicons dashicons-yes-alt" style="color: var(--aa-success, #16a34a);"></span>
								<span>
									<strong>Cookie Banner: Active</strong><br />
									<span style="font-weight: 400;">Placed on <a href="<?php echo esc_url( $banner_instance['edit_url'] ); ?>">this page</a>.</span>
								</span>
							</div>
						<?php else : ?>
							<div class="aa-notice aa-notice-error" style="display: flex; align-items: center; gap: 10px; margin-top: 12px;">
								<span class="dashicons dashicons-warning" style="color: var(--aa-danger, #dc2626);"></span>
								<span>
									<strong>Cookie Banner: Not placed yet</strong><br />
									<span style="font-weight: 400;">Add the Cookie Banner block to a template or page so visitors actually see it.</span>
								</span>
							</div>
						<?php endif; ?>
					</div>

					<div class="aa-card" style="margin-bottom: 0;">
						<div class="aa-card-title">Cookie categories</div>
						<div style="display: flex; gap: 24px; margin-top: 12px;">
							<div>
								<div style="font-size: 26px; font-weight: 800; color: var(--aa-ink, #14181f);"><?php echo esc_html( count( $categories ) ); ?></div>
								<div class="aa-card-subtitle" style="margin: 0;">Total categories</div>
							</div>
							<div>
								<div style="font-size: 26px; font-weight: 800; color: var(--aa-ink, #14181f);"><?php echo esc_html( $required_count ); ?></div>
								<div class="aa-card-subtitle" style="margin: 0;">Always required</div>
							</div>
							<div>
								<div style="font-size: 26px; font-weight: 800; color: var(--aa-ink, #14181f);"><?php echo esc_html( $on_by_default ); ?>/<?php echo esc_html( $optional_count ); ?></div>
								<div class="aa-card-subtitle" style="margin: 0;">Optional, on by default</div>
							</div>
						</div>
					</div>
				</div>

				<div class="aa-card">
					<div class="aa-card-title">Categories</div>
					<p class="aa-card-subtitle">Visitors can toggle any non-required category on or off in the preferences panel.</p>

					<form method="post">
						<?php wp_nonce_field( 'adaire_cookie_categories_save', 'adaire_cookie_categories_nonce' ); ?>

						<table class="widefat adaire-cookie-categories__table" id="adaire-cookie-categories-table">
							<thead>
								<tr>
									<th style="width:14%">Key</th>
									<th style="width:18%">Label</th>
									<th>Description</th>
									<th style="width:9%">Required</th>
									<th style="width:9%">On by default</th>
									<th style="width:6%"></th>
								</tr>
							</thead>
							<tbody>
								<?php foreach ( $categories as $i => $cat ) : ?>
									<?php adaire_cookie_categories_render_row( $i, $cat ); ?>
								<?php endforeach; ?>
							</tbody>
						</table>

						<p>
							<button type="button" class="aa-btn aa-btn-secondary" id="adaire-cookie-categories-add-row">+ Add category</button>
						</p>

						<template id="adaire-cookie-categories-row-template">
							<?php adaire_cookie_categories_render_row( '__INDEX__', array(), true ); ?>
						</template>

						<p class="submit" style="display:flex; gap:10px;">
							<button type="submit" class="aa-btn aa-btn-primary">Save Categories</button>
							<button type="submit" name="adaire_cookie_categories_reset" value="1" class="aa-btn aa-btn-danger" onclick="return confirm('Reset to the default category list? This discards any customization made here.');">Reset to Defaults</button>
						</p>
					</form>
				</div>
			</div>
		</div>

		<style>
			.adaire-cookie-dashboard-summary { grid-template-columns: 1fr 1fr; margin-bottom: 20px; }
			@media (max-width: 900px) {
				.adaire-cookie-dashboard-summary { grid-template-columns: 1fr; }
			}
			.adaire-cookie-categories__table { border: 1px solid var(--aa-line, rgba(20,24,31,0.1)); border-radius: var(--aa-radius-md, 12px); box-shadow: none; overflow: hidden; border-collapse: separate; border-spacing: 0; }
			.adaire-cookie-categories__table thead th { background: var(--aa-bg, #f6f7fb); border-bottom: 1px solid var(--aa-line, rgba(20,24,31,0.1)); }
			.adaire-cookie-categories__table th { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; color: var(--aa-muted, #6b7280); padding: 10px 8px; }
			.adaire-cookie-categories__table td { vertical-align: middle; padding: 10px 8px; border-bottom: 1px solid var(--aa-line, rgba(20,24,31,0.1)); }
			.adaire-cookie-categories__table tbody tr:last-child td { border-bottom: none; }
			.adaire-cookie-categories__table tbody tr:hover { background: var(--aa-bg, #f6f7fb); }
			.adaire-cookie-categories__table input[type="text"] { width: 100%; }
			.adaire-cookie-categories__table input[type="checkbox"] { transform: scale(1.2); }
			.adaire-cookie-categories__remove-row {
				display: inline-flex; align-items: center; justify-content: center;
				width: 26px; height: 26px; border-radius: 50%;
				color: var(--aa-danger, #dc2626); font-size: 16px; line-height: 1;
				transition: background-color 0.15s ease;
			}
			.adaire-cookie-categories__remove-row:hover { background: var(--aa-danger-soft, rgba(220,38,38,0.08)); }
		</style>

		<script>
			(function () {
				var table = document.getElementById( 'adaire-cookie-categories-table' );
				var tbody = table.querySelector( 'tbody' );
				var template = document.getElementById( 'adaire-cookie-categories-row-template' );
				var addBtn = document.getElementById( 'adaire-cookie-categories-add-row' );
				var nextIndex = <?php echo (int) count( $categories ); ?>;

				addBtn.addEventListener( 'click', function () {
					var html = template.innerHTML.replace( /__INDEX__/g, String( nextIndex ) );
					var wrapper = document.createElement( 'tbody' );
					wrapper.innerHTML = html;
					tbody.appendChild( wrapper.firstElementChild );
					nextIndex++;
				} );

				tbody.addEventListener( 'click', function ( e ) {
					var btn = e.target.closest( '.adaire-cookie-categories__remove-row' );
					if ( ! btn ) return;
					e.preventDefault();
					var row = btn.closest( 'tr' );
					if ( row ) row.remove();
				} );
			})();
		</script>
		<?php
	}
}

if ( ! function_exists( 'adaire_cookie_categories_render_row' ) ) {
	/**
	 * Render one editable table row, either bound to a stored category or as
	 * the blank `<template>` row cloned client-side for "Add category".
	 *
	 * @param int|string $index      Row index (numeric, or the literal "__INDEX__" placeholder for the template).
	 * @param array      $cat        Category data, empty array for a blank row.
	 * @param bool       $is_template Whether this is the hidden template row.
	 */
	function adaire_cookie_categories_render_row( $index, $cat = array(), $is_template = false ) {
		$key            = $cat['key'] ?? '';
		$label          = $cat['label'] ?? '';
		$description    = $cat['description'] ?? '';
		$required       = ! empty( $cat['required'] );
		$default_checked = ! empty( $cat['defaultChecked'] );
		$name           = 'category[' . $index . ']';
		?>
		<tr<?php echo $is_template ? ' class="adaire-cookie-categories__template-row"' : ''; ?>>
			<td><input type="text" name="<?php echo esc_attr( $name ); ?>[key]" value="<?php echo esc_attr( $key ); ?>" placeholder="e.g. analytics" /></td>
			<td><input type="text" name="<?php echo esc_attr( $name ); ?>[label]" value="<?php echo esc_attr( $label ); ?>" placeholder="e.g. Analytics" /></td>
			<td><input type="text" name="<?php echo esc_attr( $name ); ?>[description]" value="<?php echo esc_attr( $description ); ?>" placeholder="Shown under the label in the preferences panel" /></td>
			<td><input type="checkbox" name="<?php echo esc_attr( $name ); ?>[required]" value="1" <?php checked( $required ); ?> /></td>
			<td><input type="checkbox" name="<?php echo esc_attr( $name ); ?>[defaultChecked]" value="1" <?php checked( $default_checked ); ?> /></td>
			<td><button type="button" class="button-link adaire-cookie-categories__remove-row" aria-label="Remove category">&times;</button></td>
		</tr>
		<?php
	}
}
