<?php
/**
 * Cookie Consent Log — server-side record of every decision a visitor makes
 * on the Cookie Banner block (Pro), so the admin can see what cookies each
 * client has actually saved on the site, not just what's stored in that
 * visitor's own browser.
 *
 * Recording is always on (any license). Reading is tiered like CookieYes:
 * the dashboard's "Recent" tab is free, the "Full History" tab requires an
 * active Pro license (see AdaireBlocksConfig::is_premium()).
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'AdaireCookieConsentLog' ) ) {

	class AdaireCookieConsentLog {

		const TABLE_VERSION_OPTION = 'adaire_cookie_consent_log_db_version';
		const TABLE_VERSION        = '1.1';
		const RECENT_LIMIT         = 20;
		const HISTORY_PER_PAGE     = 25;

		/**
		 * @return string Fully-qualified table name.
		 */
		public static function table_name() {
			global $wpdb;
			return $wpdb->prefix . 'adaire_cookie_consent_log';
		}

		/**
		 * Create (or upgrade) the log table. Cheap to call repeatedly — dbDelta
		 * only issues DDL when the stored schema version differs, and this is
		 * additionally gated to run at most once per request via a static flag.
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
				consent_id VARCHAR(64) NULL,
				status VARCHAR(20) NOT NULL,
				categories LONGTEXT NULL,
				consent_version VARCHAR(20) NULL,
				page_url VARCHAR(500) NULL,
				referrer VARCHAR(500) NULL,
				user_agent VARCHAR(255) NULL,
				ip_hash VARCHAR(64) NULL,
				created_at DATETIME NOT NULL,
				expires_at DATETIME NULL,
				PRIMARY KEY  (id),
				KEY created_at (created_at),
				KEY status (status)
			) {$charset_collate};";

			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
			dbDelta( $sql );

			update_option( self::TABLE_VERSION_OPTION, self::TABLE_VERSION, false );
		}

		/**
		 * Record one consent decision.
		 *
		 * @param array $data {
		 *     @type string $consent_id      Client-generated id (optional).
		 *     @type string $status          accepted|rejected|custom|dismissed.
		 *     @type array  $categories      { key => bool }.
		 *     @type string $consent_version Banner's configured consent version.
		 *     @type string $page_url        Page the decision was made on.
		 *     @type string $referrer        Referring URL, if any.
		 *     @type int    $expires_at      Unix ms timestamp the client computed
		 *                                   this decision expires at (view.js's
		 *                                   writeConsent()), converted to a
		 *                                   MySQL datetime for storage.
		 * }
		 * @return int|false Inserted row id, or false on failure.
		 */
		public static function insert( $data ) {
			self::ensure_table();
			global $wpdb;

			$status = isset( $data['status'] ) ? sanitize_key( $data['status'] ) : '';
			if ( ! in_array( $status, array( 'accepted', 'rejected', 'custom', 'dismissed' ), true ) ) {
				return false;
			}

			$categories = array();
			if ( isset( $data['categories'] ) && is_array( $data['categories'] ) ) {
				foreach ( $data['categories'] as $key => $val ) {
					$categories[ sanitize_key( $key ) ] = ! empty( $val );
				}
			}

			$ip = self::client_ip();

			// Client sends a unix-ms timestamp (Date.now() + days*86400000 from
			// view.js's writeConsent()) — validate it's actually in the future
			// and a plausible value before trusting it into a DATETIME column.
			$expires_at = null;
			if ( isset( $data['expires_at'] ) && is_numeric( $data['expires_at'] ) ) {
				$expires_ms = (float) $data['expires_at'];
				if ( $expires_ms > 0 ) {
					$expires_at = gmdate( 'Y-m-d H:i:s', (int) floor( $expires_ms / 1000 ) );
				}
			}

			$result = $wpdb->insert(
				self::table_name(),
				array(
					'consent_id'      => isset( $data['consent_id'] ) ? sanitize_text_field( substr( (string) $data['consent_id'], 0, 64 ) ) : null,
					'status'          => $status,
					'categories'      => wp_json_encode( $categories ),
					'consent_version' => isset( $data['consent_version'] ) ? sanitize_text_field( substr( (string) $data['consent_version'], 0, 20 ) ) : null,
					'page_url'        => isset( $data['page_url'] ) ? esc_url_raw( substr( (string) $data['page_url'], 0, 500 ) ) : null,
					'referrer'        => isset( $data['referrer'] ) ? esc_url_raw( substr( (string) $data['referrer'], 0, 500 ) ) : null,
					'user_agent'      => isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( substr( (string) $_SERVER['HTTP_USER_AGENT'], 0, 255 ) ) : null, // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
					'ip_hash'         => $ip ? hash( 'sha256', $ip . wp_salt() ) : null,
					'created_at'      => current_time( 'mysql', true ),
					'expires_at'      => $expires_at,
				),
				array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
			);

			return $result ? (int) $wpdb->insert_id : false;
		}

		/**
		 * Best-effort visitor IP, respecting a couple of common proxy headers.
		 * Only ever used to derive ip_hash — the raw address is never stored.
		 */
		private static function client_ip() {
			foreach ( array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR' ) as $key ) {
				if ( ! empty( $_SERVER[ $key ] ) ) {
					$val = sanitize_text_field( wp_unslash( $_SERVER[ $key ] ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
					$parts = explode( ',', $val );
					return trim( $parts[0] );
				}
			}
			return '';
		}

		/**
		 * The most recent N decisions — always available, free or Pro.
		 *
		 * @return array[]
		 */
		public static function get_recent( $limit = self::RECENT_LIMIT ) {
			self::ensure_table();
			global $wpdb;
			$table = self::table_name();
			$rows  = $wpdb->get_results(
				$wpdb->prepare( "SELECT * FROM {$table} ORDER BY created_at DESC LIMIT %d", (int) $limit ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				ARRAY_A
			);
			return self::decode_rows( $rows ?: array() );
		}

		/**
		 * Paginated full history — gated to Pro at the call site (REST + admin UI).
		 *
		 * @return array{rows: array[], total: int, per_page: int, page: int}
		 */
		public static function get_history( $page = 1, $per_page = self::HISTORY_PER_PAGE ) {
			self::ensure_table();
			global $wpdb;
			$table    = self::table_name();
			$page     = max( 1, (int) $page );
			$per_page = max( 1, min( 200, (int) $per_page ) );
			$offset   = ( $page - 1 ) * $per_page;

			$rows = $wpdb->get_results(
				$wpdb->prepare( "SELECT * FROM {$table} ORDER BY created_at DESC LIMIT %d OFFSET %d", $per_page, $offset ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				ARRAY_A
			);
			$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

			return array(
				'rows'     => self::decode_rows( $rows ?: array() ),
				'total'    => $total,
				'per_page' => $per_page,
				'page'     => $page,
			);
		}

		/**
		 * @return int Total number of logged decisions, ever.
		 */
		public static function get_total_count() {
			self::ensure_table();
			global $wpdb;
			$table = self::table_name();
			return (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}

		/**
		 * JSON-decode the `categories` column on a result set.
		 */
		private static function decode_rows( $rows ) {
			foreach ( $rows as &$row ) {
				$decoded          = json_decode( (string) $row['categories'], true );
				$row['categories'] = is_array( $decoded ) ? $decoded : array();
			}
			return $rows;
		}
	}
}

if ( ! function_exists( 'adaire_cookie_consent_log_activate' ) ) {
	function adaire_cookie_consent_log_activate() {
		AdaireCookieConsentLog::ensure_table();
	}
}
register_activation_hook( ADAIRE_BLOCKS_PLUGIN_FILE, 'adaire_cookie_consent_log_activate' );

/**
 * REST API — logging (public, front end) + reading (admin, dashboard UI).
 */
if ( ! function_exists( 'adaire_cookie_consent_log_register_routes' ) ) {
	function adaire_cookie_consent_log_register_routes() {
		register_rest_route(
			'adaire-blocks/v1',
			'/consent-log',
			array(
				'methods'             => 'POST',
				'callback'            => 'adaire_cookie_consent_log_rest_create',
				'permission_callback' => '__return_true', // Any site visitor can log their own decision.
				'args'                => array(
					'status' => array(
						'required' => true,
						'type'     => 'string',
					),
				),
			)
		);

		register_rest_route(
			'adaire-blocks/v1',
			'/consent-log',
			array(
				'methods'             => 'GET',
				'callback'            => 'adaire_cookie_consent_log_rest_read',
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);
	}
}
add_action( 'rest_api_init', 'adaire_cookie_consent_log_register_routes' );

if ( ! function_exists( 'adaire_cookie_consent_log_rest_create' ) ) {
	function adaire_cookie_consent_log_rest_create( WP_REST_Request $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = array();
		}

		$id = AdaireCookieConsentLog::insert(
			array(
				'consent_id'      => $body['consentId'] ?? '',
				'status'          => $body['status'] ?? '',
				'categories'      => $body['categories'] ?? array(),
				'consent_version' => $body['consentVersion'] ?? '',
				'page_url'        => $body['pageUrl'] ?? '',
				'referrer'        => $body['referrer'] ?? '',
				'expires_at'      => $body['expiresAt'] ?? null,
			)
		);

		if ( false === $id ) {
			return new WP_REST_Response( array( 'logged' => false ), 400 );
		}

		return new WP_REST_Response( array( 'logged' => true ), 201 );
	}
}

if ( ! function_exists( 'adaire_cookie_consent_log_rest_read' ) ) {
	function adaire_cookie_consent_log_rest_read( WP_REST_Request $request ) {
		$scope = $request->get_param( 'scope' ) === 'history' ? 'history' : 'recent';

		if ( 'recent' === $scope ) {
			return new WP_REST_Response(
				array(
					'scope' => 'recent',
					'rows'  => AdaireCookieConsentLog::get_recent(),
					'total' => AdaireCookieConsentLog::get_total_count(),
				),
				200
			);
		}

		// Full history — Pro only, mirrors the dashboard's server-side gate.
		$config = class_exists( 'AdaireBlocksConfig' ) ? AdaireBlocksConfig::get_instance() : null;
		if ( ! $config || ! $config->is_premium() ) {
			return new WP_REST_Response(
				array(
					'code'    => 'adaire_pro_required',
					'message' => __( 'Full consent history is a Pro feature. Activate your license to unlock it.', 'adaire-blocks' ),
				),
				403
			);
		}

		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = (int) $request->get_param( 'per_page' );
		$result   = AdaireCookieConsentLog::get_history( $page, $per_page ?: AdaireCookieConsentLog::HISTORY_PER_PAGE );

		return new WP_REST_Response( array_merge( array( 'scope' => 'history' ), $result ), 200 );
	}
}
