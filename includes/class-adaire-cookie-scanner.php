<?php
/**
 * Passive Cookie Scanner — the "hand in hand with WordPress" equivalent of
 * CookieYes's cloud crawler. Instead of a remote service crawling the site,
 * the Cookie Banner block's own front-end script (already loaded wherever
 * the banner is placed) quietly notes the document.cookie / localStorage /
 * sessionStorage KEY NAMES it sees on real visits — never values — and
 * reports any name it hasn't reported before to this class, which stores it
 * in WordPress's own database and tries to auto-categorize it against the
 * built-in known-tracker table (includes/cookie-known-trackers.php).
 *
 * The admin reviews what's been detected on the Cookie Manager -> Detected
 * tab and either approves it into the curated Cookie List (the list that
 * actually drives the banner's preferences panel) or dismisses it.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'AdaireCookieScanner' ) ) {

	class AdaireCookieScanner {

		const TABLE_VERSION_OPTION = 'adaire_cookie_scan_db_version';
		const TABLE_VERSION        = '1.0';
		const STATUS_NEW           = 'new';
		const STATUS_ADDED         = 'added';
		const STATUS_IGNORED       = 'ignored';

		/**
		 * @return string Fully-qualified table name.
		 */
		public static function table_name() {
			global $wpdb;
			return $wpdb->prefix . 'adaire_cookie_scan';
		}

		/**
		 * Create (or upgrade) the detected-cookies table. Cheap to call
		 * repeatedly — only issues DDL when the schema version differs, and
		 * gated to at most once per request via a static flag.
		 */
		public static function ensure_table() {
			static $checked = false;
			if ( $checked ) {
				return;
			}
			$checked = true;

			if ( get_option( self::TABLE_VERSION_OPTION ) === self::TABLE_VERSION ) {
				return;
			}

			global $wpdb;
			$table_name      = self::table_name();
			$charset_collate = $wpdb->get_charset_collate();

			$sql = "CREATE TABLE {$table_name} (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				name VARCHAR(255) NOT NULL,
				storage_type VARCHAR(20) NOT NULL,
				status VARCHAR(20) NOT NULL DEFAULT 'new',
				suggested_category VARCHAR(50) NULL,
				suggested_provider VARCHAR(100) NULL,
				suggested_purpose VARCHAR(255) NULL,
				suggested_duration VARCHAR(50) NULL,
				page_url VARCHAR(500) NULL,
				seen_count BIGINT UNSIGNED NOT NULL DEFAULT 1,
				first_seen DATETIME NOT NULL,
				last_seen DATETIME NOT NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY name_type (name, storage_type),
				KEY status (status)
			) {$charset_collate};";

			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
			dbDelta( $sql );

			update_option( self::TABLE_VERSION_OPTION, self::TABLE_VERSION, false );
		}

		/**
		 * Record one sighting — a cookie or storage key name observed on a
		 * real page load. Upserts: a name seen before just bumps seen_count
		 * and last_seen, a new name gets inserted with a best-effort guess
		 * from the known-tracker table.
		 *
		 * @param string $name         Cookie or storage key name (never a value).
		 * @param string $storage_type 'cookie' | 'localStorage' | 'sessionStorage'.
		 * @param string $page_url     Page the sighting happened on (informational only).
		 * @return void
		 */
		public static function record_sighting( $name, $storage_type, $page_url = '' ) {
			self::ensure_table();
			global $wpdb;

			$name = sanitize_text_field( substr( (string) $name, 0, 255 ) );
			if ( '' === $name ) {
				return;
			}

			$storage_type = in_array( $storage_type, array( 'cookie', 'localStorage', 'sessionStorage' ), true )
				? $storage_type
				: 'cookie';

			// Cookies WordPress itself/the banner sets are never useful in a
			// "third-party cookies to disclose" list — never insert them as a
			// pending Detected row, but harmless if a stray row already exists.
			if ( self::is_own_infrastructure_cookie( $name ) ) {
				return;
			}

			$table = self::table_name();
			$now   = current_time( 'mysql', true );

			$existing_id = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT id FROM {$table} WHERE name = %s AND storage_type = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$name,
					$storage_type
				)
			);

			if ( $existing_id ) {
				$wpdb->query(
					$wpdb->prepare(
						"UPDATE {$table} SET seen_count = seen_count + 1, last_seen = %s WHERE id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
						$now,
						(int) $existing_id
					)
				);
				return;
			}

			$match = function_exists( 'adaire_cookie_match_known_tracker' ) ? adaire_cookie_match_known_tracker( $name ) : null;

			// A name that's already in the admin's own curated Cookie List
			// doesn't need to show up as "new" to review — mark it added
			// immediately so Detected only ever surfaces genuinely unreviewed items.
			$status = self::already_in_curated_list( $name ) ? self::STATUS_ADDED : self::STATUS_NEW;

			$wpdb->insert(
				$table,
				array(
					'name'               => $name,
					'storage_type'       => $storage_type,
					'status'             => $status,
					'suggested_category' => $match['category'] ?? null,
					'suggested_provider' => $match['provider'] ?? null,
					'suggested_purpose'  => $match['purpose'] ?? null,
					'suggested_duration' => $match['duration'] ?? null,
					'page_url'           => $page_url ? esc_url_raw( substr( (string) $page_url, 0, 500 ) ) : null,
					'seen_count'         => 1,
					'first_seen'         => $now,
					'last_seen'          => $now,
				),
				array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s' )
			);
		}

		/**
		 * @param string $name Cookie/storage key name.
		 * @return bool Whether this name belongs to the plugin's own consent
		 *              storage or common WP session cookies — never worth
		 *              flagging as a "third-party cookie to disclose".
		 */
		private static function is_own_infrastructure_cookie( $name ) {
			$ignored_prefixes = array( 'adaireCookieConsent', 'wordpress_test_cookie' );
			foreach ( $ignored_prefixes as $prefix ) {
				if ( 0 === strpos( $name, $prefix ) ) {
					return true;
				}
			}
			return false;
		}

		/**
		 * @param string $name Cookie/storage key name.
		 * @return bool Whether this exact name is already a row in the
		 *              admin-curated Cookie List (admin/cookie-categories-page.php).
		 */
		private static function already_in_curated_list( $name ) {
			if ( ! function_exists( 'adaire_get_cookie_manager_list' ) ) {
				return false;
			}
			foreach ( adaire_get_cookie_manager_list() as $cookie ) {
				if ( isset( $cookie['name'] ) && $cookie['name'] === $name ) {
					return true;
				}
			}
			return false;
		}

		/**
		 * @param string $status One of the STATUS_* constants.
		 * @return array[]
		 */
		public static function get_by_status( $status = self::STATUS_NEW ) {
			self::ensure_table();
			global $wpdb;
			$table = self::table_name();
			$rows  = $wpdb->get_results(
				$wpdb->prepare( "SELECT * FROM {$table} WHERE status = %s ORDER BY last_seen DESC LIMIT 200", $status ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				ARRAY_A
			);
			return $rows ?: array();
		}

		/**
		 * @return int Count of rows still awaiting review.
		 */
		public static function get_new_count() {
			self::ensure_table();
			global $wpdb;
			$table = self::table_name();
			return (int) $wpdb->get_var(
				$wpdb->prepare( "SELECT COUNT(*) FROM {$table} WHERE status = %s", self::STATUS_NEW ) // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			);
		}

		/**
		 * @param int    $id     Row id.
		 * @param string $status One of the STATUS_* constants.
		 * @return bool
		 */
		public static function set_status( $id, $status ) {
			self::ensure_table();
			global $wpdb;
			if ( ! in_array( $status, array( self::STATUS_NEW, self::STATUS_ADDED, self::STATUS_IGNORED ), true ) ) {
				return false;
			}
			$result = $wpdb->update(
				self::table_name(),
				array( 'status' => $status ),
				array( 'id' => (int) $id ),
				array( '%s' ),
				array( '%d' )
			);
			return false !== $result;
		}

		/**
		 * @param int $id Row id.
		 * @return array|null
		 */
		public static function get_row( $id ) {
			self::ensure_table();
			global $wpdb;
			$table = self::table_name();
			$row   = $wpdb->get_row(
				$wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", (int) $id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				ARRAY_A
			);
			return $row ?: null;
		}
	}
}

if ( ! function_exists( 'adaire_cookie_scanner_activate' ) ) {
	function adaire_cookie_scanner_activate() {
		AdaireCookieScanner::ensure_table();
	}
}
register_activation_hook( ADAIRE_BLOCKS_PLUGIN_FILE, 'adaire_cookie_scanner_activate' );

/**
 * REST API — one public write endpoint the front-end script calls to report
 * newly-seen cookie/storage names. No read endpoint: the admin UI reads
 * straight from the database (admin/cookie-categories-page.php), same
 * pattern as the consent log.
 */
if ( ! function_exists( 'adaire_cookie_scanner_register_routes' ) ) {
	function adaire_cookie_scanner_register_routes() {
		register_rest_route(
			'adaire-blocks/v1',
			'/cookie-scan',
			array(
				'methods'             => 'POST',
				'callback'            => 'adaire_cookie_scanner_rest_report',
				'permission_callback' => '__return_true', // Any site visitor's browser reports its own cookie/storage key names.
			)
		);
	}
}
add_action( 'rest_api_init', 'adaire_cookie_scanner_register_routes' );

if ( ! function_exists( 'adaire_cookie_scanner_rest_report' ) ) {
	function adaire_cookie_scanner_rest_report( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}

		$page_url = isset( $body['pageUrl'] ) ? (string) $body['pageUrl'] : '';
		$items    = isset( $body['items'] ) && is_array( $body['items'] ) ? $body['items'] : array();

		// Hard cap per request — this is a diagnostic feed, not arbitrary
		// client data storage; a single page never legitimately has hundreds
		// of distinct cookie/storage keys.
		$items = array_slice( $items, 0, 100 );

		$recorded = 0;
		foreach ( $items as $item ) {
			if ( ! is_array( $item ) || empty( $item['name'] ) ) {
				continue;
			}
			AdaireCookieScanner::record_sighting( $item['name'], $item['type'] ?? 'cookie', $page_url );
			$recorded++;
		}

		return new WP_REST_Response( array( 'recorded' => $recorded ), 201 );
	}
}
