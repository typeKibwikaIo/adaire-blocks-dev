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

if ( ! defined( 'ADAIRE_COOKIE_MANAGER_OPTION' ) ) {
	define( 'ADAIRE_COOKIE_MANAGER_OPTION', 'adaire_cookie_manager_list' );
}

if ( ! defined( 'ADAIRE_COOKIE_POLICY_OPTION' ) ) {
	define( 'ADAIRE_COOKIE_POLICY_OPTION', 'adaire_cookie_policy_settings' );
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
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-off dashboard status check, not a hot path; content search isn't practical to cache.
		$post_id = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT ID FROM {$wpdb->posts} WHERE post_status IN ('publish','private') AND post_content LIKE %s LIMIT 1",
				'%' . $wpdb->esc_like( 'wp:create-block/cookie-consent-block' ) . '%' // phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange -- False positive: matches the word "create" inside the LIKE search pattern, this is a SELECT, not DDL.
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

if ( ! function_exists( 'adaire_cookie_manager_default' ) ) {
	/**
	 * Seed data for the Cookie Manager tab — the individual cookies most
	 * sites end up needing to disclose, pre-mapped to the default category
	 * list (adaire_cookie_categories_default()). An admin-curated list
	 * rather than a live scanner: see the "Cookie Manager data" decision —
	 * scanning for real document.cookie / third-party cookies is a much
	 * larger feature (can't see httpOnly or cross-origin iframe cookies
	 * from JS anyway) and was explicitly deferred.
	 *
	 * @return array[]
	 */
	function adaire_cookie_manager_default() {
		return array(
			array(
				'name'     => 'adaireCookieConsent_v1',
				'category' => 'necessary',
				'provider' => 'This website',
				'purpose'  => 'Stores your cookie consent choices.',
				'duration' => '180 days',
			),
			array(
				'name'     => '_ga',
				'category' => 'analytics',
				'provider' => 'Google Analytics',
				'purpose'  => 'Distinguishes unique visitors for site analytics.',
				'duration' => '2 years',
			),
			array(
				'name'     => '_ga_*',
				'category' => 'analytics',
				'provider' => 'Google Analytics',
				'purpose'  => 'Persists session state for GA4 property analytics.',
				'duration' => '2 years',
			),
			array(
				'name'     => '_fbp',
				'category' => 'marketing',
				'provider' => 'Meta / Facebook',
				'purpose'  => 'Delivers a series of advertisement products.',
				'duration' => '3 months',
			),
		);
	}
}

if ( ! function_exists( 'adaire_get_cookie_manager_list' ) ) {
	/**
	 * @return array[]
	 */
	function adaire_get_cookie_manager_list() {
		$stored = get_option( ADAIRE_COOKIE_MANAGER_OPTION );
		if ( is_array( $stored ) && ! empty( $stored ) ) {
			return $stored;
		}
		return adaire_cookie_manager_default();
	}
}

if ( ! function_exists( 'adaire_cookie_manager_sanitize_submission' ) ) {
	/**
	 * @param array $rows Raw POSTed rows: index => [name, category, provider, purpose, duration].
	 * @return array[]
	 */
	function adaire_cookie_manager_sanitize_submission( $rows ) {
		$clean = array();

		foreach ( $rows as $row ) {
			$name = isset( $row['name'] ) ? sanitize_text_field( $row['name'] ) : '';
			if ( '' === $name ) {
				continue;
			}

			$clean[] = array(
				'name'     => $name,
				'category' => isset( $row['category'] ) ? sanitize_key( $row['category'] ) : '',
				'provider' => isset( $row['provider'] ) ? sanitize_text_field( $row['provider'] ) : '',
				'purpose'  => isset( $row['purpose'] ) ? sanitize_text_field( $row['purpose'] ) : '',
				'duration' => isset( $row['duration'] ) ? sanitize_text_field( $row['duration'] ) : '',
			);
		}

		return $clean;
	}
}

if ( ! function_exists( 'adaire_cookie_policy_defaults' ) ) {
	/**
	 * @return array
	 */
	function adaire_cookie_policy_defaults() {
		return array(
			'cookiePolicyText'  => 'Cookie Policy',
			'cookiePolicyUrl'   => '',
			'privacyPolicyText' => 'Privacy Policy',
			'privacyPolicyUrl'  => '',
			'termsText'         => 'Terms & Conditions',
			'termsUrl'          => '',
			'expirationDays'    => 180,
			'consentVersion'    => '1',
		);
	}
}

if ( ! function_exists( 'adaire_get_cookie_policy_settings' ) ) {
	/**
	 * Site-wide defaults for policy links + consent expiration/version.
	 * The Cookie Banner block still has its own per-instance attributes for
	 * all of these (see src/cookie-consent-block/block.json) — render.php
	 * only falls back to this option when a block was left at its own
	 * blank/placeholder default, so existing configured blocks are
	 * untouched and new/unconfigured ones inherit the site-wide setting.
	 *
	 * @return array
	 */
	function adaire_get_cookie_policy_settings() {
		$stored = get_option( ADAIRE_COOKIE_POLICY_OPTION );
		$stored = is_array( $stored ) ? $stored : array();
		return wp_parse_args( $stored, adaire_cookie_policy_defaults() );
	}
}

if ( ! function_exists( 'adaire_cookie_policy_sanitize_submission' ) ) {
	/**
	 * @param array $data Raw $_POST['policy'].
	 * @return array
	 */
	function adaire_cookie_policy_sanitize_submission( $data ) {
		$defaults = adaire_cookie_policy_defaults();
		return array(
			'cookiePolicyText'  => isset( $data['cookiePolicyText'] ) && '' !== $data['cookiePolicyText'] ? sanitize_text_field( $data['cookiePolicyText'] ) : $defaults['cookiePolicyText'],
			'cookiePolicyUrl'   => isset( $data['cookiePolicyUrl'] ) ? esc_url_raw( $data['cookiePolicyUrl'] ) : '',
			'privacyPolicyText' => isset( $data['privacyPolicyText'] ) && '' !== $data['privacyPolicyText'] ? sanitize_text_field( $data['privacyPolicyText'] ) : $defaults['privacyPolicyText'],
			'privacyPolicyUrl'  => isset( $data['privacyPolicyUrl'] ) ? esc_url_raw( $data['privacyPolicyUrl'] ) : '',
			'termsText'         => isset( $data['termsText'] ) && '' !== $data['termsText'] ? sanitize_text_field( $data['termsText'] ) : $defaults['termsText'],
			'termsUrl'          => isset( $data['termsUrl'] ) ? esc_url_raw( $data['termsUrl'] ) : '',
			'expirationDays'    => isset( $data['expirationDays'] ) ? max( 1, min( 730, (int) $data['expirationDays'] ) ) : $defaults['expirationDays'],
			'consentVersion'    => isset( $data['consentVersion'] ) && '' !== $data['consentVersion'] ? sanitize_text_field( $data['consentVersion'] ) : $defaults['consentVersion'],
		);
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

if ( ! function_exists( 'adaire_consent_log_browser_label' ) ) {
	/**
	 * Turn a stored User-Agent string into a short "Browser on OS" label for
	 * the consent log table — the raw UA string is too long/noisy to show
	 * in a table cell, and admins care about "which browser" not the exact
	 * UA, matching what CookieYes-style dashboards display.
	 *
	 * @param string $user_agent Raw User-Agent header, as stored by AdaireCookieConsentLog::insert().
	 * @return string e.g. "Chrome on Windows", or '' if unrecognized/empty.
	 */
	function adaire_consent_log_browser_label( $user_agent ) {
		$user_agent = (string) $user_agent;
		if ( '' === $user_agent ) {
			return '';
		}

		$browser = 'Browser';
		if ( stripos( $user_agent, 'Edg/' ) !== false || stripos( $user_agent, 'Edge' ) !== false ) {
			$browser = 'Edge';
		} elseif ( stripos( $user_agent, 'OPR/' ) !== false || stripos( $user_agent, 'Opera' ) !== false ) {
			$browser = 'Opera';
		} elseif ( stripos( $user_agent, 'Firefox' ) !== false ) {
			$browser = 'Firefox';
		} elseif ( stripos( $user_agent, 'Chrome' ) !== false ) {
			$browser = 'Chrome';
		} elseif ( stripos( $user_agent, 'Safari' ) !== false ) {
			$browser = 'Safari';
		}

		$os = '';
		if ( stripos( $user_agent, 'Windows' ) !== false ) {
			$os = 'Windows';
		} elseif ( stripos( $user_agent, 'Mac OS' ) !== false ) {
			$os = 'macOS';
		} elseif ( stripos( $user_agent, 'Android' ) !== false ) {
			$os = 'Android';
		} elseif ( stripos( $user_agent, 'iPhone' ) !== false || stripos( $user_agent, 'iPad' ) !== false ) {
			$os = 'iOS';
		} elseif ( stripos( $user_agent, 'Linux' ) !== false ) {
			$os = 'Linux';
		}

		return $os ? $browser . ' on ' . $os : $browser;
	}
}

if ( ! function_exists( 'adaire_render_consent_log_table' ) ) {
	/**
	 * Render a table of consent log rows (shared by the Recent and Full
	 * History views — both pull from AdaireCookieConsentLog and hand the
	 * result here).
	 *
	 * @param array[] $rows Rows from AdaireCookieConsentLog::get_recent()/get_history().
	 */
	function adaire_render_consent_log_table( $rows ) {
		$status_labels = array(
			'accepted'  => 'Accepted All',
			'rejected'  => 'Rejected All',
			'custom'    => 'Custom',
			'dismissed' => 'Dismissed',
		);
		?>
		<table class="widefat adaire-consent-log__table" style="margin-top:12px;">
			<thead>
				<tr>
					<th>Date</th>
					<th>Decision</th>
					<th>Categories saved</th>
					<th>Page</th>
					<th>Browser</th>
					<th>Expires</th>
					<th>Version</th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $rows as $row ) : ?>
					<?php
					$accepted_keys = array();
					foreach ( (array) $row['categories'] as $key => $on ) {
						if ( $on ) {
							$accepted_keys[] = $key;
						}
					}
					$status     = isset( $row['status'] ) ? $row['status'] : '';
					$ts         = isset( $row['created_at'] ) ? strtotime( $row['created_at'] . ' UTC' ) : false;
					$expires_ts = ! empty( $row['expires_at'] ) ? strtotime( $row['expires_at'] . ' UTC' ) : false;
					$browser    = function_exists( 'adaire_consent_log_browser_label' ) ? adaire_consent_log_browser_label( isset( $row['user_agent'] ) ? $row['user_agent'] : '' ) : '';
					?>
					<tr>
						<td><?php echo $ts ? esc_html( date_i18n( 'M j, Y g:i a', $ts ) ) : '&mdash;'; ?></td>
						<td><span class="aa-pill aa-pill-muted"><?php echo esc_html( $status_labels[ $status ] ?? ucfirst( $status ) ); ?></span></td>
						<td><?php echo $accepted_keys ? esc_html( implode( ', ', $accepted_keys ) ) : '&mdash;'; ?></td>
						<td><?php echo isset( $row['page_url'] ) && $row['page_url'] ? '<a href="' . esc_url( $row['page_url'] ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( wp_parse_url( $row['page_url'], PHP_URL_PATH ) ?: $row['page_url'] ) . '</a>' : '&mdash;'; ?></td>
						<td><?php echo esc_html( $browser ?: '&mdash;' ); ?></td>
						<td><?php echo $expires_ts ? esc_html( date_i18n( 'M j, Y', $expires_ts ) ) : '&mdash;'; ?></td>
						<td><?php echo isset( $row['consent_version'] ) && '' !== $row['consent_version'] && null !== $row['consent_version'] ? esc_html( $row['consent_version'] ) : '&mdash;'; ?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
		<?php
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
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Each field is sanitized in adaire_cookie_categories_sanitize_submission() below (sanitize_text_field() per row).
			$rows       = isset( $_POST['category'] ) && is_array( $_POST['category'] ) ? wp_unslash( $_POST['category'] ) : array();
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
		} elseif ( isset( $_POST['adaire_cookie_manager_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['adaire_cookie_manager_nonce'] ) ), 'adaire_cookie_manager_save' ) ) {
			$rows       = isset( $_POST['manager_cookie'] ) && is_array( $_POST['manager_cookie'] ) ? wp_unslash( $_POST['manager_cookie'] ) : array();
			$manager_list = adaire_cookie_manager_sanitize_submission( $rows );
			update_option( ADAIRE_COOKIE_MANAGER_OPTION, $manager_list, false );
			$notice      = 'Cookie Manager list saved.';
			$notice_type = 'success';
		} elseif ( isset( $_POST['adaire_cookie_policy_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['adaire_cookie_policy_nonce'] ) ), 'adaire_cookie_policy_save' ) ) {
			$policy_data = isset( $_POST['policy'] ) && is_array( $_POST['policy'] ) ? wp_unslash( $_POST['policy'] ) : array();
			update_option( ADAIRE_COOKIE_POLICY_OPTION, adaire_cookie_policy_sanitize_submission( $policy_data ), false );
			$notice      = 'Policy & expiration settings saved. Blocks left at their default policy links will now use these.';
			$notice_type = 'success';
		} elseif ( isset( $_POST['adaire_cookie_detected_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['adaire_cookie_detected_nonce'] ) ), 'adaire_cookie_detected_action' ) && class_exists( 'AdaireCookieScanner' ) ) {
			$detected_id = isset( $_POST['detected_id'] ) ? (int) $_POST['detected_id'] : 0;
			$row         = $detected_id ? AdaireCookieScanner::get_row( $detected_id ) : null;

			if ( ! $row ) {
				$notice      = 'That detected item no longer exists.';
				$notice_type = 'error';
			} elseif ( isset( $_POST['adaire_detected_add'] ) ) {
				$manager_list   = adaire_get_cookie_manager_list();
				$manager_list[] = array(
					'name'     => $row['name'],
					'category' => isset( $_POST['detected_category'] ) ? sanitize_key( wp_unslash( $_POST['detected_category'] ) ) : ( $row['suggested_category'] ?: '' ),
					'provider' => isset( $_POST['detected_provider'] ) ? sanitize_text_field( wp_unslash( $_POST['detected_provider'] ) ) : ( $row['suggested_provider'] ?: '' ),
					'purpose'  => isset( $_POST['detected_purpose'] ) ? sanitize_text_field( wp_unslash( $_POST['detected_purpose'] ) ) : ( $row['suggested_purpose'] ?: '' ),
					'duration' => isset( $_POST['detected_duration'] ) ? sanitize_text_field( wp_unslash( $_POST['detected_duration'] ) ) : ( $row['suggested_duration'] ?: '' ),
				);
				update_option( ADAIRE_COOKIE_MANAGER_OPTION, $manager_list, false );
				AdaireCookieScanner::set_status( $detected_id, AdaireCookieScanner::STATUS_ADDED );
				$notice      = '"' . $row['name'] . '" added to the Cookie List.';
				$notice_type = 'success';
			} elseif ( isset( $_POST['adaire_detected_ignore'] ) ) {
				AdaireCookieScanner::set_status( $detected_id, AdaireCookieScanner::STATUS_IGNORED );
				$notice      = '"' . $row['name'] . '" dismissed.';
				$notice_type = 'success';
			}
		}

		$categories       = adaire_get_cookie_categories();
		$manager_list     = adaire_get_cookie_manager_list();
		$policy_settings  = adaire_get_cookie_policy_settings();
		$aa_tab = isset( $_GET['aa_tab'] ) && in_array( $_GET['aa_tab'], array( 'dashboard', 'banner', 'manager', 'languages', 'policygen' ), true ) ? sanitize_key( wp_unslash( $_GET['aa_tab'] ) ) : 'dashboard'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$aa_sub = isset( $_GET['aa_sub'] ) && in_array( $_GET['aa_sub'], array( 'categories', 'list', 'history', 'detected' ), true ) ? sanitize_key( wp_unslash( $_GET['aa_sub'] ) ) : 'categories'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$config     = class_exists( 'AdaireBlocksConfig' ) ? AdaireBlocksConfig::get_instance() : null;
		$is_pro     = $config ? $config->is_premium() : false;

		$consent_log_view = ( isset( $_GET['aa_log_view'] ) && 'history' === $_GET['aa_log_view'] ) ? 'history' : 'recent'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$consent_log_paged = isset( $_GET['aa_log_paged'] ) ? max( 1, (int) $_GET['aa_log_paged'] ) : 1; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		$consent_recent  = class_exists( 'AdaireCookieConsentLog' ) ? AdaireCookieConsentLog::get_recent() : array();
		$consent_total   = class_exists( 'AdaireCookieConsentLog' ) ? AdaireCookieConsentLog::get_total_count() : 0;
		$consent_history = null;
		if ( 'history' === $consent_log_view && $is_pro && class_exists( 'AdaireCookieConsentLog' ) ) {
			$consent_history = AdaireCookieConsentLog::get_history( $consent_log_paged );
		}

		$detected_new   = class_exists( 'AdaireCookieScanner' ) ? AdaireCookieScanner::get_by_status( AdaireCookieScanner::STATUS_NEW ) : array();
		$detected_count = count( $detected_new );

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

		// key => category row, so the Detected tab can show a category's label
		// instead of its raw key next to each guessed match.
		$categories_by_key = array();
		foreach ( $categories as $cat ) {
			if ( ! empty( $cat['key'] ) ) {
				$categories_by_key[ $cat['key'] ] = $cat;
			}
		}

		// Per-category cookie counts for the Cookie List left rail.
		$manager_counts_by_category = array();
		foreach ( $manager_list as $cookie ) {
			$cat_key = isset( $cookie['category'] ) ? $cookie['category'] : '';
			if ( '' === $cat_key ) {
				continue;
			}
			$manager_counts_by_category[ $cat_key ] = ( $manager_counts_by_category[ $cat_key ] ?? 0 ) + 1;
		}

		$policy_configured = ! empty( $policy_settings['cookiePolicyUrl'] ) || ! empty( $policy_settings['privacyPolicyUrl'] );
		$license_page_url  = admin_url( 'admin.php?page=adaire-blocks-license' );
		?>
		<div class="wrap adaire-cd">
			<div class="adaire-cd__brandbar">
				<div class="adaire-cd__brand">
					<span class="adaire-cd__logo" aria-hidden="true">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="white" fill-opacity="0.16"/><path d="M12 4C9 7 7 9.8 7 12.5A5 5 0 0 0 12 17.5A5 5 0 0 0 17 12.5C17 9.8 15 7 12 4Z" fill="white"/><circle cx="10.5" cy="11.5" r="0.9" fill="#6366F1"/><circle cx="13" cy="14" r="0.7" fill="#6366F1"/></svg>
					</span>
					<span class="adaire-cd__brand-name">Adaire Cookie Banner</span>
				</div>
			</div>

			<div class="adaire-cd__tabs">
				<?php
				$aa_top_tabs = array(
					'dashboard' => 'Dashboard',
					'banner'    => 'Cookie Banner',
					'manager'   => 'Cookie Manager',
					'languages' => 'Languages',
					'policygen' => 'Policy Generators',
				);
				foreach ( $aa_top_tabs as $tab_slug => $tab_label ) :
					?>
					<a href="<?php echo esc_url( add_query_arg( 'aa_tab', $tab_slug, remove_query_arg( array( 'aa_sub', 'aa_log_view', 'aa_log_paged' ) ) ) ); ?>" class="adaire-cd__tab<?php echo $aa_tab === $tab_slug ? ' is-active' : ''; ?>"><?php echo esc_html( $tab_label ); ?></a>
				<?php endforeach; ?>
			</div>

			<div class="adaire-cd__body">

				<?php if ( $notice ) : ?>
					<div class="aa-notice aa-notice-<?php echo esc_attr( $notice_type ); ?>"><?php echo esc_html( $notice ); ?></div>
				<?php endif; ?>

				<?php if ( 'dashboard' === $aa_tab ) : ?>

					<div class="aa-card adaire-cd__getstarted">
						<div class="aa-card-title">Get started with Adaire Cookie Banner</div>
						<p class="aa-card-subtitle">To become legally compliant for your use of cookies, here's what to do.</p>

						<div class="adaire-cd__checklist">
							<div class="adaire-cd__checklist-item<?php echo $banner_instance ? ' is-done' : ''; ?>">
								<span class="adaire-cd__checklist-dot"><?php echo $banner_instance ? '&#10003;' : ''; ?></span>
								<div>
									<strong>Place your Cookie Banner</strong>
									<p><?php echo $banner_instance ? 'Well done! You have a Cookie Banner block placed on <a href="' . esc_url( $banner_instance['edit_url'] ) . '">this page</a>.' : 'Add the Cookie Banner block to a template or page so visitors actually see it.'; ?></p>
								</div>
							</div>
							<div class="adaire-cd__checklist-item<?php echo ! empty( $categories ) ? ' is-done' : ''; ?>">
								<span class="adaire-cd__checklist-dot"><?php echo ! empty( $categories ) ? '&#10003;' : ''; ?></span>
								<div>
									<strong>Configure your cookie categories</strong>
									<p><?php echo esc_html( count( $categories ) ); ?> categories configured. <a href="<?php echo esc_url( add_query_arg( array( 'aa_tab' => 'manager', 'aa_sub' => 'categories' ) ) ); ?>">Review categories</a>.</p>
								</div>
							</div>
							<div class="adaire-cd__checklist-item<?php echo $policy_configured ? ' is-done' : ''; ?>">
								<span class="adaire-cd__checklist-dot"><?php echo $policy_configured ? '&#10003;' : ''; ?></span>
								<div>
									<strong>Link your Cookie &amp; Privacy Policy</strong>
									<p><?php echo $policy_configured ? 'Policy links are set below.' : 'Add your policy links so visitors can read them from the banner.'; ?> <a href="#adaire-cd-policy">Edit policy links</a>.</p>
								</div>
							</div>
						</div>
					</div>

					<div class="aa-card">
						<div class="aa-card-title">Overview</div>
						<div class="adaire-cd__overview">
							<div class="adaire-cd__overview-card">
								<div class="adaire-cd__overview-icon">&#127991;</div>
								<div class="adaire-cd__overview-label">Banner status</div>
								<div class="adaire-cd__overview-value" style="color:<?php echo $banner_instance ? 'var(--aa-success,#16a34a)' : 'var(--aa-danger,#dc2626)'; ?>"><?php echo $banner_instance ? 'Active' : 'Not placed'; ?></div>
							</div>
							<div class="adaire-cd__overview-card">
								<div class="adaire-cd__overview-icon">&#128274;</div>
								<div class="adaire-cd__overview-label">Categories</div>
								<div class="adaire-cd__overview-value"><?php echo esc_html( count( $categories ) ); ?> total</div>
							</div>
							<div class="adaire-cd__overview-card">
								<div class="adaire-cd__overview-icon">&#128203;</div>
								<div class="adaire-cd__overview-label">Consent decisions</div>
								<div class="adaire-cd__overview-value"><?php echo esc_html( number_format_i18n( $consent_total ) ); ?> logged</div>
							</div>
							<div class="adaire-cd__overview-card">
								<div class="adaire-cd__overview-icon">&#11088;</div>
								<div class="adaire-cd__overview-label">License</div>
								<div class="adaire-cd__overview-value"><?php echo $is_pro ? 'Pro &mdash; active' : 'Free'; ?></div>
							</div>
						</div>
						<p style="margin-top:14px;"><a class="aa-btn aa-btn-secondary" href="<?php echo esc_url( add_query_arg( 'aa_tab', 'banner' ) ); ?>">Customise Banner</a></p>
					</div>

					<div class="aa-card" id="adaire-cd-policy">
						<div class="aa-card-title">Policy &amp; Expiration</div>
						<p class="aa-card-subtitle">Site-wide defaults for the cookie/privacy/terms links and consent expiration. A Cookie Banner block still has its own fields in the editor (Inspector &rarr; Links) that take priority when filled in &mdash; these settings only fill the gap for blocks left at their defaults.</p>

						<form method="post" class="adaire-cookie-policy-form">
							<?php wp_nonce_field( 'adaire_cookie_policy_save', 'adaire_cookie_policy_nonce' ); ?>

							<table class="form-table" role="presentation">
								<tbody>
									<tr>
										<th scope="row"><label for="aa-policy-cookie-text">Cookie Policy</label></th>
										<td>
											<input type="text" id="aa-policy-cookie-text" name="policy[cookiePolicyText]" value="<?php echo esc_attr( $policy_settings['cookiePolicyText'] ); ?>" placeholder="Link text" style="margin-bottom:6px;width:260px;" />
											<input type="url" name="policy[cookiePolicyUrl]" value="<?php echo esc_attr( $policy_settings['cookiePolicyUrl'] ); ?>" placeholder="https://example.com/cookie-policy" style="width:100%;max-width:420px;" />
										</td>
									</tr>
									<tr>
										<th scope="row"><label for="aa-policy-privacy-text">Privacy Policy</label></th>
										<td>
											<input type="text" id="aa-policy-privacy-text" name="policy[privacyPolicyText]" value="<?php echo esc_attr( $policy_settings['privacyPolicyText'] ); ?>" placeholder="Link text" style="margin-bottom:6px;width:260px;" />
											<input type="url" name="policy[privacyPolicyUrl]" value="<?php echo esc_attr( $policy_settings['privacyPolicyUrl'] ); ?>" placeholder="https://example.com/privacy-policy" style="width:100%;max-width:420px;" />
										</td>
									</tr>
									<tr>
										<th scope="row"><label for="aa-policy-terms-text">Terms &amp; Conditions</label></th>
										<td>
											<input type="text" id="aa-policy-terms-text" name="policy[termsText]" value="<?php echo esc_attr( $policy_settings['termsText'] ); ?>" placeholder="Link text" style="margin-bottom:6px;width:260px;" />
											<input type="url" name="policy[termsUrl]" value="<?php echo esc_attr( $policy_settings['termsUrl'] ); ?>" placeholder="https://example.com/terms (optional)" style="width:100%;max-width:420px;" />
										</td>
									</tr>
									<tr>
										<th scope="row"><label for="aa-policy-expiration">Default consent expiration</label></th>
										<td>
											<input type="number" id="aa-policy-expiration" name="policy[expirationDays]" value="<?php echo esc_attr( $policy_settings['expirationDays'] ); ?>" min="1" max="730" style="width:100px;" /> days
											<p class="description">A returning visitor is automatically re-prompted once this many days have passed since their last decision.</p>
										</td>
									</tr>
									<tr>
										<th scope="row"><label for="aa-policy-version">Default consent version</label></th>
										<td>
											<input type="text" id="aa-policy-version" name="policy[consentVersion]" value="<?php echo esc_attr( $policy_settings['consentVersion'] ); ?>" style="width:100px;" />
											<p class="description">Bump this (e.g. "1" &rarr; "2") after a material policy change to re-prompt every visitor, even ones inside their expiration window.</p>
										</td>
									</tr>
								</tbody>
							</table>

							<p class="submit">
								<button type="submit" class="aa-btn aa-btn-primary">Save Policy &amp; Expiration</button>
							</p>
						</form>
					</div>

				<?php elseif ( 'banner' === $aa_tab ) : ?>

					<div class="aa-card">
						<div class="aa-card-title">Cookie Banner</div>
						<p class="aa-card-subtitle">Layout, colours, text, and behaviour are all configured on the Cookie Banner block itself, in the page editor &mdash; that Inspector panel is the single source of truth, so there's nothing to duplicate here.</p>

						<?php if ( $banner_instance ) : ?>
							<div class="aa-notice aa-notice-success" style="display:flex;align-items:center;gap:10px;">
								<span class="dashicons dashicons-yes-alt" style="color:var(--aa-success,#16a34a);"></span>
								<span><strong>Cookie Banner: Active</strong> &mdash; placed on one of your pages.</span>
							</div>
							<p style="margin-top:14px;"><a class="aa-btn aa-btn-primary" href="<?php echo esc_url( $banner_instance['edit_url'] ); ?>">Edit Cookie Banner in the block editor</a></p>
						<?php else : ?>
							<div class="aa-notice aa-notice-error" style="display:flex;align-items:center;gap:10px;">
								<span class="dashicons dashicons-warning" style="color:var(--aa-danger,#dc2626);"></span>
								<span><strong>No Cookie Banner block found yet.</strong> Add it to a page or template, then this card will link straight to it.</span>
							</div>
							<p style="margin-top:14px;"><a class="aa-btn aa-btn-primary" href="<?php echo esc_url( admin_url( 'edit.php?post_type=page' ) ); ?>">Go to Pages</a></p>
						<?php endif; ?>
					</div>

				<?php elseif ( 'manager' === $aa_tab ) : ?>

					<div class="adaire-cd__subtabs">
						<a href="<?php echo esc_url( add_query_arg( array( 'aa_tab' => 'manager', 'aa_sub' => 'categories' ), remove_query_arg( array( 'aa_log_view', 'aa_log_paged' ) ) ) ); ?>" class="adaire-cd__subtab<?php echo 'categories' === $aa_sub ? ' is-active' : ''; ?>">Categories</a>
						<a href="<?php echo esc_url( add_query_arg( array( 'aa_tab' => 'manager', 'aa_sub' => 'list' ), remove_query_arg( array( 'aa_log_view', 'aa_log_paged' ) ) ) ); ?>" class="adaire-cd__subtab<?php echo 'list' === $aa_sub ? ' is-active' : ''; ?>">Cookie List</a>
						<a href="<?php echo esc_url( add_query_arg( array( 'aa_tab' => 'manager', 'aa_sub' => 'history' ), remove_query_arg( array( 'aa_log_view', 'aa_log_paged' ) ) ) ); ?>" class="adaire-cd__subtab<?php echo 'history' === $aa_sub ? ' is-active' : ''; ?>">Scan History<?php if ( ! $is_pro ) : ?> <span class="dashicons dashicons-lock" style="font-size:13px;width:13px;height:13px;vertical-align:-2px;"></span><?php endif; ?></a>
						<a href="<?php echo esc_url( add_query_arg( array( 'aa_tab' => 'manager', 'aa_sub' => 'detected' ), remove_query_arg( array( 'aa_log_view', 'aa_log_paged' ) ) ) ); ?>" class="adaire-cd__subtab<?php echo 'detected' === $aa_sub ? ' is-active' : ''; ?>">Detected<?php if ( $detected_count > 0 ) : ?> <span class="aa-pill aa-pill-muted" style="margin-left:4px;"><?php echo esc_html( $detected_count ); ?></span><?php endif; ?></a>
					</div>

					<?php if ( 'categories' === $aa_sub ) : ?>

						<div class="aa-card">
							<div class="aa-card-title">Categories</div>
							<p class="aa-card-subtitle">Visitors can toggle any non-required category on or off in the preferences panel. Every cookie in the Cookie List below belongs to one of these.</p>

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

					<?php elseif ( 'list' === $aa_sub ) : ?>

						<div class="adaire-cm-list">
							<div class="adaire-cm-rail">
								<div class="adaire-cm-rail__item is-active" data-cm-filter="">All <span><?php echo esc_html( count( $manager_list ) ); ?></span></div>
								<?php foreach ( $categories as $cat ) : ?>
									<div class="adaire-cm-rail__item" data-cm-filter="<?php echo esc_attr( $cat['key'] ); ?>"><?php echo esc_html( $cat['label'] ?? $cat['key'] ); ?> <span><?php echo esc_html( $manager_counts_by_category[ $cat['key'] ] ?? 0 ); ?></span></div>
								<?php endforeach; ?>
							</div>

							<div class="aa-card adaire-cm-list__main">
								<div class="aa-card-title" style="display:flex;align-items:center;justify-content:space-between;">
									<span>Cookie List</span>
								</div>
								<p class="aa-card-subtitle">The individual cookies visitors see listed under each category in the preferences panel &mdash; name, provider, purpose, and how long each one lasts. Purely informational; the category toggle still controls what's actually granted.</p>

								<form method="post">
									<?php wp_nonce_field( 'adaire_cookie_manager_save', 'adaire_cookie_manager_nonce' ); ?>

									<table class="widefat adaire-cookie-categories__table" id="adaire-cookie-manager-table">
										<thead>
											<tr>
												<th style="width:18%">Cookie name</th>
												<th style="width:14%">Category</th>
												<th style="width:16%">Provider</th>
												<th>Purpose</th>
												<th style="width:12%">Duration</th>
												<th style="width:6%"></th>
											</tr>
										</thead>
										<tbody>
											<?php foreach ( $manager_list as $i => $cookie ) : ?>
												<?php adaire_cookie_manager_render_row( $i, $cookie, false, $categories ); ?>
											<?php endforeach; ?>
										</tbody>
									</table>

									<p>
										<button type="button" class="aa-btn aa-btn-secondary" id="adaire-cookie-manager-add-row">+ Add cookie</button>
									</p>

									<template id="adaire-cookie-manager-row-template">
										<?php adaire_cookie_manager_render_row( '__INDEX__', array(), true, $categories ); ?>
									</template>

									<p class="submit">
										<button type="submit" class="aa-btn aa-btn-primary">Save Cookie List</button>
									</p>
								</form>
							</div>
						</div>

					<?php elseif ( 'history' === $aa_sub ) : ?>

						<div class="aa-card adaire-consent-log-card">
							<div class="aa-card-title" style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
								<span>Scan History</span>
								<span class="aa-pill aa-pill-muted"><?php echo esc_html( number_format_i18n( $consent_total ) ); ?> saved <?php echo esc_html( _n( 'decision', 'decisions', $consent_total, 'adaire-blocks' ) ); ?></span>
							</div>
							<p class="aa-card-subtitle">Every Accept / Reject / Save Preferences decision a visitor makes on this site is recorded here, so you can see what cookies each client actually saved &mdash; not just what your own browser shows.</p>

							<div class="adaire-consent-log__tabs">
								<a href="<?php echo esc_url( add_query_arg( 'aa_log_view', 'recent', remove_query_arg( array( 'aa_log_paged' ) ) ) ); ?>" class="adaire-consent-log__tab<?php echo 'recent' === $consent_log_view ? ' is-active' : ''; ?>">Recent</a>
								<a href="<?php echo esc_url( add_query_arg( 'aa_log_view', 'history', remove_query_arg( array( 'aa_log_paged' ) ) ) ); ?>" class="adaire-consent-log__tab<?php echo 'history' === $consent_log_view ? ' is-active' : ''; ?>">
									Full History
									<?php if ( ! $is_pro ) : ?><span class="dashicons dashicons-lock" style="font-size:14px; width:14px; height:14px; vertical-align:-2px;"></span><?php endif; ?>
								</a>
							</div>

							<?php if ( 'recent' === $consent_log_view ) : ?>

								<?php if ( empty( $consent_recent ) ) : ?>
									<p class="aa-card-subtitle" style="margin-top:12px;">No consent decisions have been recorded yet.</p>
								<?php else : ?>
									<?php adaire_render_consent_log_table( $consent_recent ); ?>
									<?php if ( $consent_total > count( $consent_recent ) ) : ?>
										<p class="aa-card-subtitle" style="margin-top:10px;">Showing the <?php echo esc_html( count( $consent_recent ) ); ?> most recent of <?php echo esc_html( number_format_i18n( $consent_total ) ); ?> &mdash; switch to Full History to see the rest.</p>
									<?php endif; ?>
								<?php endif; ?>

							<?php elseif ( ! $is_pro ) : ?>

								<?php
								/**
								 * Free tier: tease Full History the way CookieYes' Scan History
								 * does — a centered "Connect / Upgrade" modal card floating over
								 * a dimmed, blurred preview of the visitor's own real "Recent"
								 * rows (already free-tier data, nothing extra is exposed).
								 */
								?>
								<div class="adaire-consent-log__blur-wrap">
									<?php if ( ! empty( $consent_recent ) ) : ?>
										<div class="adaire-consent-log__blurred" aria-hidden="true">
											<?php
											$preview_rows = $consent_recent;
											while ( count( $preview_rows ) < 12 && ! empty( $consent_recent ) ) {
												$preview_rows = array_merge( $preview_rows, $consent_recent );
											}
											adaire_render_consent_log_table( array_slice( $preview_rows, 0, 12 ) );
											?>
											<div class="adaire-consent-log__pagination">
												<?php for ( $p = 1; $p <= 5; $p++ ) : ?>
													<a href="#" tabindex="-1" class="<?php echo 1 === $p ? 'is-active' : ''; ?>"><?php echo esc_html( $p ); ?></a>
												<?php endfor; ?>
											</div>
										</div>
									<?php endif; ?>

									<div class="adaire-consent-log__paywall">
										<span class="dashicons dashicons-lock"></span>
										<h3>Scan your site's full consent history</h3>
										<p>See every consent decision ever recorded on this site &mdash; searchable, paginated, and exportable.</p>
										<p class="adaire-consent-log__paywall-meta">Available in: <strong>Pro</strong></p>
										<a class="aa-btn aa-btn-primary" href="<?php echo esc_url( $license_page_url ); ?>">Upgrade to Pro</a>
									</div>
								</div>

							<?php elseif ( $consent_history ) : ?>

								<?php if ( empty( $consent_history['rows'] ) ) : ?>
									<p class="aa-card-subtitle" style="margin-top:12px;">No consent decisions have been recorded yet.</p>
								<?php else : ?>
									<?php adaire_render_consent_log_table( $consent_history['rows'] ); ?>
									<?php
									$total_pages = max( 1, (int) ceil( $consent_history['total'] / $consent_history['per_page'] ) );
									if ( $total_pages > 1 ) :
										?>
										<div class="adaire-consent-log__pagination">
											<?php for ( $p = 1; $p <= $total_pages; $p++ ) : ?>
												<a href="<?php echo esc_url( add_query_arg( array( 'aa_log_view' => 'history', 'aa_log_paged' => $p ) ) ); ?>" class="<?php echo $p === $consent_history['page'] ? 'is-active' : ''; ?>"><?php echo esc_html( $p ); ?></a>
											<?php endfor; ?>
										</div>
									<?php endif; ?>
								<?php endif; ?>

							<?php endif; ?>
						</div>

					<?php elseif ( 'detected' === $aa_sub ) : ?>

						<div class="aa-card">
							<div class="aa-card-title" style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
								<span>Detected Cookies</span>
								<span class="aa-pill aa-pill-muted"><?php echo esc_html( $detected_count ); ?> awaiting review</span>
							</div>
							<p class="aa-card-subtitle">Picked up automatically from real visits &mdash; the Cookie Banner script quietly notes any cookie, localStorage, or sessionStorage key name it sees on a page (never values) and reports anything new here. Known trackers get a category guessed for you; review and add each one to the Cookie List, or dismiss it.</p>

							<?php if ( empty( $detected_new ) ) : ?>
								<p class="aa-card-subtitle" style="margin-top:12px;">Nothing new detected yet &mdash; this fills in as real visitors browse the site with the Cookie Banner in place.</p>
							<?php else : ?>
								<table class="widefat adaire-cookie-categories__table" style="margin-top:12px;">
									<thead>
										<tr>
											<th style="width:18%">Name</th>
											<th style="width:12%">Type</th>
											<th style="width:14%">Guessed category</th>
											<th style="width:16%">Guessed provider</th>
											<th style="width:10%">First seen</th>
											<th style="width:10%">Last seen</th>
											<th style="width:20%"></th>
										</tr>
									</thead>
									<tbody>
										<?php foreach ( $detected_new as $row ) : ?>
											<tr>
												<td><code><?php echo esc_html( $row['name'] ); ?></code></td>
												<td><?php echo esc_html( $row['storage_type'] ); ?></td>
												<td><?php echo esc_html( $row['suggested_category'] ? ( $categories_by_key[ $row['suggested_category'] ]['label'] ?? $row['suggested_category'] ) : '—' ); ?></td>
												<td><?php echo esc_html( $row['suggested_provider'] ?: '—' ); ?></td>
												<td><?php echo esc_html( mysql2date( 'M j, Y', $row['first_seen'] ) ); ?></td>
												<td><?php echo esc_html( mysql2date( 'M j, Y', $row['last_seen'] ) ); ?> <span class="aa-card-subtitle" style="margin:0;">(&times;<?php echo esc_html( $row['seen_count'] ); ?>)</span></td>
												<td style="display:flex; gap:6px; flex-wrap:wrap;">
													<form method="post" style="display:inline;">
														<?php wp_nonce_field( 'adaire_cookie_detected_action', 'adaire_cookie_detected_nonce' ); ?>
														<input type="hidden" name="detected_id" value="<?php echo esc_attr( $row['id'] ); ?>" />
														<input type="hidden" name="detected_category" value="<?php echo esc_attr( $row['suggested_category'] ); ?>" />
														<input type="hidden" name="detected_provider" value="<?php echo esc_attr( $row['suggested_provider'] ); ?>" />
														<input type="hidden" name="detected_purpose" value="<?php echo esc_attr( $row['suggested_purpose'] ); ?>" />
														<input type="hidden" name="detected_duration" value="<?php echo esc_attr( $row['suggested_duration'] ); ?>" />
														<button type="submit" name="adaire_detected_add" value="1" class="aa-btn aa-btn-secondary" style="padding:4px 10px;font-size:12px;">Add to List</button>
													</form>
													<form method="post" style="display:inline;">
														<?php wp_nonce_field( 'adaire_cookie_detected_action', 'adaire_cookie_detected_nonce' ); ?>
														<input type="hidden" name="detected_id" value="<?php echo esc_attr( $row['id'] ); ?>" />
														<button type="submit" name="adaire_detected_ignore" value="1" class="aa-btn aa-btn-danger" style="padding:4px 10px;font-size:12px;" onclick="return confirm('Dismiss this detected item?');">Ignore</button>
													</form>
												</td>
											</tr>
										<?php endforeach; ?>
									</tbody>
								</table>
							<?php endif; ?>
						</div>

					<?php endif; // $aa_sub ?>

				<?php elseif ( 'languages' === $aa_tab ) : ?>

					<div class="aa-card">
						<div class="aa-card-title" style="display:flex;align-items:center;justify-content:space-between;">
							<span>Languages</span>
							<button type="button" class="aa-btn aa-btn-primary" disabled title="Coming soon">+ Add Language</button>
						</div>
						<p class="aa-card-subtitle">Translate your Cookie Banner's text for visitors in different locales.</p>

						<table class="widefat adaire-consent-log__table" style="margin-top:12px;">
							<thead>
								<tr>
									<th>Language</th>
									<th>Code</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>English</td>
									<td>EN</td>
									<td><span class="aa-pill aa-pill-muted">Default</span></td>
								</tr>
							</tbody>
						</table>

						<div class="adaire-cd__comingsoon">
							<span class="dashicons dashicons-translation"></span>
							<h3>Multi-language banners</h3>
							<p>Manage translated banner text for every language your visitors use. This is coming in a future update.</p>
							<span class="aa-pill aa-pill-muted">Coming soon</span>
						</div>
					</div>

				<?php elseif ( 'policygen' === $aa_tab ) : ?>

					<div class="aa-grid adaire-cd__policygen">
						<div class="aa-card">
							<div class="adaire-cd__policygen-icon">&#128274;</div>
							<div class="aa-card-title">Privacy Policy Generator</div>
							<p class="aa-card-subtitle">Create a privacy policy to inform users about the data collection practices of your website.</p>
							<ul class="adaire-cd__policygen-list">
								<li>&#10003; Answer a simple questionnaire</li>
								<li>&#10003; Generate policy in minutes</li>
								<li>&#10003; Copy as text/HTML</li>
								<li>&#10003; Customise as required</li>
							</ul>
							<button type="button" class="aa-btn aa-btn-primary" disabled title="Coming soon">Generate Privacy Policy</button>
							<span class="aa-pill aa-pill-muted" style="margin-left:8px;">Coming soon</span>
						</div>
						<div class="aa-card">
							<div class="adaire-cd__policygen-icon">&#128220;</div>
							<div class="aa-card-title">Cookie Policy Generator</div>
							<p class="aa-card-subtitle">Generate a custom cookie policy and inform users about your site's use of cookies.</p>
							<ul class="adaire-cd__policygen-list">
								<li>&#10003; Instantly generate custom policy</li>
								<li>&#10003; Built from your Cookie List</li>
								<li>&#10003; Copy as text/HTML</li>
								<li>&#10003; Customise as required</li>
							</ul>
							<button type="button" class="aa-btn aa-btn-primary" disabled title="Coming soon">Generate Cookie Policy</button>
							<span class="aa-pill aa-pill-muted" style="margin-left:8px;">Coming soon</span>
						</div>
					</div>

				<?php endif; // $aa_tab ?>

			</div>
		</div>

		<style>
			.adaire-cd { max-width: 100%; }
			.adaire-cd__brandbar { background: var(--aa-accent, #6366f1); border-radius: var(--aa-radius-md, 12px) var(--aa-radius-md, 12px) 0 0; padding: 14px 20px; }
			.adaire-cd__brand { display: flex; align-items: center; gap: 10px; }
			.adaire-cd__logo { display: inline-flex; }
			.adaire-cd__brand-name { color: #fff; font-size: 17px; font-weight: 800; letter-spacing: -0.01em; }
			.adaire-cd__tabs { display: flex; gap: 4px; background: #fff; border: 1px solid var(--aa-line, rgba(20,24,31,0.1)); border-top: none; padding: 0 12px; flex-wrap: wrap; }
			.adaire-cd__tab { display: inline-flex; align-items: center; padding: 13px 14px; font-size: 13px; font-weight: 700; color: var(--aa-muted, #6b7280); text-decoration: none; border-bottom: 2px solid transparent; margin-bottom: -1px; }
			.adaire-cd__tab:hover { color: var(--aa-ink, #14181f); }
			.adaire-cd__tab.is-active { color: var(--aa-accent, #6366f1); border-bottom-color: var(--aa-accent, #6366f1); }
			.adaire-cd__body { padding-top: 18px; }
			.adaire-cd__subtabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid var(--aa-line, rgba(20,24,31,0.1)); flex-wrap: wrap; }
			.adaire-cd__subtab { display: inline-flex; align-items: center; gap: 6px; padding: 10px 14px; font-size: 13px; font-weight: 700; color: var(--aa-muted, #6b7280); text-decoration: none; border-bottom: 2px solid transparent; margin-bottom: -1px; }
			.adaire-cd__subtab:hover { color: var(--aa-ink, #14181f); }
			.adaire-cd__subtab.is-active { color: var(--aa-accent, #6366f1); border-bottom-color: var(--aa-accent, #6366f1); }

			.adaire-cd__getstarted { margin-bottom: 20px; }
			.adaire-cd__checklist { margin-top: 14px; }
			.adaire-cd__checklist-item { display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid var(--aa-line, rgba(20,24,31,0.1)); }
			.adaire-cd__checklist-item:first-child { border-top: none; }
			.adaire-cd__checklist-item p { margin: 2px 0 0; color: var(--aa-muted, #6b7280); font-size: 13px; }
			.adaire-cd__checklist-dot { flex: none; width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--aa-line, rgba(20,24,31,0.2)); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #fff; }
			.adaire-cd__checklist-item.is-done .adaire-cd__checklist-dot { background: var(--aa-success, #16a34a); border-color: var(--aa-success, #16a34a); }

			.adaire-cd__overview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 14px; }
			@media (max-width: 900px) { .adaire-cd__overview { grid-template-columns: 1fr 1fr; } }
			.adaire-cd__overview-card { background: var(--aa-bg, #f6f7fb); border: 1px solid var(--aa-line, rgba(20,24,31,0.1)); border-radius: var(--aa-radius-md, 12px); padding: 14px; }
			.adaire-cd__overview-icon { font-size: 18px; }
			.adaire-cd__overview-label { font-size: 12px; color: var(--aa-muted, #6b7280); margin-top: 6px; }
			.adaire-cd__overview-value { font-size: 16px; font-weight: 800; color: var(--aa-ink, #14181f); margin-top: 2px; }

			.adaire-cm-list { display: grid; grid-template-columns: 220px 1fr; gap: 18px; align-items: start; }
			@media (max-width: 900px) { .adaire-cm-list { grid-template-columns: 1fr; } }
			.adaire-cm-rail { background: #fff; border: 1px solid var(--aa-line, rgba(20,24,31,0.1)); border-radius: var(--aa-radius-md, 12px); overflow: hidden; }
			.adaire-cm-rail__item { display: flex; justify-content: space-between; padding: 11px 14px; font-size: 13px; font-weight: 600; color: var(--aa-muted, #6b7280); cursor: pointer; border-bottom: 1px solid var(--aa-line, rgba(20,24,31,0.1)); }
			.adaire-cm-rail__item:last-child { border-bottom: none; }
			.adaire-cm-rail__item span { color: var(--aa-muted, #6b7280); font-weight: 700; }
			.adaire-cm-rail__item:hover { background: var(--aa-bg, #f6f7fb); }
			.adaire-cm-rail__item.is-active { color: var(--aa-accent, #6366f1); background: var(--aa-bg, #f6f7fb); box-shadow: inset 3px 0 0 var(--aa-accent, #6366f1); }
			.adaire-cm-list__main { margin-bottom: 0; }

			.adaire-cd__comingsoon { text-align: center; padding: 28px 16px; margin-top: 16px; background: var(--aa-bg, #f6f7fb); border: 1px dashed var(--aa-line, rgba(20,24,31,0.2)); border-radius: var(--aa-radius-md, 12px); }
			.adaire-cd__comingsoon .dashicons { font-size: 26px; width: 26px; height: 26px; color: var(--aa-accent, #6366f1); }
			.adaire-cd__comingsoon h3 { margin: 8px 0 4px; font-size: 15px; }
			.adaire-cd__comingsoon p { margin: 0 0 10px; color: var(--aa-muted, #6b7280); font-size: 13px; }

			.adaire-cd__policygen { grid-template-columns: 1fr 1fr; }
			@media (max-width: 900px) { .adaire-cd__policygen { grid-template-columns: 1fr; } }
			.adaire-cd__policygen-icon { font-size: 22px; margin-bottom: 6px; }
			.adaire-cd__policygen-list { margin: 12px 0 16px; padding: 0; list-style: none; font-size: 13px; color: var(--aa-muted, #6b7280); }
			.adaire-cd__policygen-list li { padding: 3px 0; }

			.adaire-consent-log-card { margin-bottom: 20px; }
			.adaire-consent-log__tabs { display: flex; gap: 4px; margin-top: 14px; border-bottom: 1px solid var(--aa-line, rgba(20,24,31,0.1)); }
			.adaire-consent-log__tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--aa-muted, #6b7280); text-decoration: none; border-bottom: 2px solid transparent; margin-bottom: -1px; }
			.adaire-consent-log__tab:hover { color: var(--aa-ink, #14181f); }
			.adaire-consent-log__tab.is-active { color: var(--aa-accent, #6366f1); border-bottom-color: var(--aa-accent, #6366f1); }
			.adaire-consent-log__table { border: 1px solid var(--aa-line, rgba(20,24,31,0.1)); border-radius: var(--aa-radius-md, 12px); box-shadow: none; overflow: hidden; border-collapse: separate; border-spacing: 0; }
			.adaire-consent-log__table thead th { background: var(--aa-bg, #f6f7fb); border-bottom: 1px solid var(--aa-line, rgba(20,24,31,0.1)); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; color: var(--aa-muted, #6b7280); padding: 10px 8px; }
			.adaire-consent-log__table td { vertical-align: middle; padding: 10px 8px; border-bottom: 1px solid var(--aa-line, rgba(20,24,31,0.1)); font-size: 13px; }
			.adaire-consent-log__table tbody tr:last-child td { border-bottom: none; }
			.adaire-consent-log__pagination { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
			.adaire-consent-log__pagination a { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 6px; border-radius: 6px; border: 1px solid var(--aa-line, rgba(20,24,31,0.1)); font-size: 12px; font-weight: 600; color: var(--aa-ink, #14181f); text-decoration: none; }
			.adaire-consent-log__pagination a.is-active { background: var(--aa-accent, #6366f1); border-color: var(--aa-accent, #6366f1); color: #fff; }

			/* Free-tier "Scan History" tease: real recent rows, blurred and
			   dimmed, with a small centered modal card floating on top — same
			   pattern CookieYes' own Scan History tab uses for its "Connect to
			   Web App to Access" gate. */
			.adaire-consent-log__blur-wrap { position: relative; margin-top: 12px; min-height: 260px; overflow: hidden; border-radius: var(--aa-radius-md, 12px); }
			.adaire-consent-log__blurred { filter: blur(6px) saturate(0.9); pointer-events: none; user-select: none; }
			.adaire-consent-log__blurred .adaire-consent-log__pagination { justify-content: center; }
			.adaire-consent-log__blur-wrap::before {
				content: "";
				position: absolute;
				inset: 0;
				background: rgba(255,255,255,0.55);
			}
			.adaire-consent-log__blur-wrap .adaire-consent-log__paywall {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				margin: 0;
				width: 100%;
				max-width: 360px;
				background: #fff;
				border: 1px solid var(--aa-line, rgba(20,24,31,0.1));
				border-radius: var(--aa-radius-md, 12px);
				box-shadow: 0 12px 32px rgba(20,24,31,0.18);
			}
			.adaire-consent-log__paywall-meta { font-size: 12px !important; color: var(--aa-muted, #6b7280) !important; margin-bottom: 6px !important; }
			.adaire-consent-log__paywall { text-align: center; padding: 32px 16px; margin-top: 12px; background: var(--aa-bg, #f6f7fb); border: 1px solid var(--aa-line, rgba(20,24,31,0.1)); border-radius: var(--aa-radius-md, 12px); }
			.adaire-consent-log__paywall .dashicons { font-size: 28px; width: 28px; height: 28px; color: var(--aa-accent, #6366f1); }
			.adaire-consent-log__paywall h3 { margin: 10px 0 6px; font-size: 16px; }
			.adaire-consent-log__paywall p { margin: 0 0 16px; color: var(--aa-muted, #6b7280); }

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
			// Generic "editable table with Add/Remove row" wiring, shared by
			// whichever editable table is present on the active tab/sub-tab.
			// Only one of the tables exists in the DOM at a time, so every
			// lookup is null-guarded.
			function adaireWireEditableTable( tableId, templateId, addBtnId, removeClass, startIndex ) {
				var table = document.getElementById( tableId );
				var template = document.getElementById( templateId );
				var addBtn = document.getElementById( addBtnId );
				if ( ! table || ! template || ! addBtn ) return;

				var tbody = table.querySelector( 'tbody' );
				var nextIndex = startIndex;

				addBtn.addEventListener( 'click', function () {
					var html = template.innerHTML.replace( /__INDEX__/g, String( nextIndex ) );
					var wrapper = document.createElement( 'tbody' );
					wrapper.innerHTML = html;
					tbody.appendChild( wrapper.firstElementChild );
					nextIndex++;
				} );

				tbody.addEventListener( 'click', function ( e ) {
					var btn = e.target.closest( '.' + removeClass );
					if ( ! btn ) return;
					e.preventDefault();
					var row = btn.closest( 'tr' );
					if ( row ) row.remove();
				} );
			}

			adaireWireEditableTable(
				'adaire-cookie-categories-table',
				'adaire-cookie-categories-row-template',
				'adaire-cookie-categories-add-row',
				'adaire-cookie-categories__remove-row',
				<?php echo (int) count( $categories ); ?>
			);

			adaireWireEditableTable(
				'adaire-cookie-manager-table',
				'adaire-cookie-manager-row-template',
				'adaire-cookie-manager-add-row',
				'adaire-cookie-categories__remove-row',
				<?php echo (int) count( $manager_list ); ?>
			);

			// Cookie List left rail: client-side filter of the manager table by
			// category, reading each row's live <select> value so it stays
			// accurate even after an inline edit (no page reload needed).
			(function () {
				var rail = document.querySelectorAll( '.adaire-cm-rail__item' );
				var table = document.getElementById( 'adaire-cookie-manager-table' );
				if ( ! rail.length || ! table ) return;

				rail.forEach( function ( item ) {
					item.addEventListener( 'click', function () {
						rail.forEach( function ( i ) { i.classList.remove( 'is-active' ); } );
						item.classList.add( 'is-active' );
						var filter = item.getAttribute( 'data-cm-filter' ) || '';
						table.querySelectorAll( 'tbody tr' ).forEach( function ( row ) {
							var select = row.querySelector( 'select' );
							var val = select ? select.value : '';
							row.style.display = ( ! filter || val === filter ) ? '' : 'none';
						} );
					} );
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

if ( ! function_exists( 'adaire_cookie_manager_render_row' ) ) {
	/**
	 * Render one editable Cookie Manager row (or the blank `<template>` row).
	 *
	 * @param int|string $index       Row index, or the literal "__INDEX__" placeholder for the template.
	 * @param array      $cookie      Cookie data, empty array for a blank row.
	 * @param bool       $is_template Whether this is the hidden template row.
	 * @param array[]    $categories  Site-wide category list, for the category <select>.
	 */
	function adaire_cookie_manager_render_row( $index, $cookie = array(), $is_template = false, $categories = array() ) {
		$cookie_name = $cookie['name'] ?? '';
		$category    = $cookie['category'] ?? '';
		$provider    = $cookie['provider'] ?? '';
		$purpose     = $cookie['purpose'] ?? '';
		$duration    = $cookie['duration'] ?? '';
		$name        = 'manager_cookie[' . $index . ']';
		?>
		<tr<?php echo $is_template ? ' class="adaire-cookie-categories__template-row"' : ''; ?>>
			<td><input type="text" name="<?php echo esc_attr( $name ); ?>[name]" value="<?php echo esc_attr( $cookie_name ); ?>" placeholder="e.g. _ga" /></td>
			<td>
				<select name="<?php echo esc_attr( $name ); ?>[category]">
					<option value="">&mdash;</option>
					<?php foreach ( $categories as $cat ) : ?>
						<option value="<?php echo esc_attr( $cat['key'] ); ?>" <?php selected( $category, $cat['key'] ); ?>><?php echo esc_html( $cat['label'] ?? $cat['key'] ); ?></option>
					<?php endforeach; ?>
				</select>
			</td>
			<td><input type="text" name="<?php echo esc_attr( $name ); ?>[provider]" value="<?php echo esc_attr( $provider ); ?>" placeholder="e.g. Google Analytics" /></td>
			<td><input type="text" name="<?php echo esc_attr( $name ); ?>[purpose]" value="<?php echo esc_attr( $purpose ); ?>" placeholder="What it's used for" /></td>
			<td><input type="text" name="<?php echo esc_attr( $name ); ?>[duration]" value="<?php echo esc_attr( $duration ); ?>" placeholder="e.g. 2 years" /></td>
			<td><button type="button" class="button-link adaire-cookie-categories__remove-row" aria-label="Remove cookie">&times;</button></td>
		</tr>
		<?php
	}
}
