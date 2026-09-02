<?php
/**
 * Newsletter subscribers — storage, public subscribe endpoint, unsubscribe.
 *
 * Blocks that collect an email address (Hero Block Pro's email-form CTA, the
 * Form block) POST to `adaire-blocks/v1/subscribe`. Addresses land in a custom
 * table rather than a CPT: the list is expected to grow well past what
 * wp_posts wants to hold, every lookup is by email or status, and a UNIQUE
 * index on email is the cheapest way to make re-submission idempotent.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Adaire_Blocks_Subscribers' ) ) {

	class Adaire_Blocks_Subscribers {

		/**
		 * Bump when the CREATE TABLE below changes, so ensure_table() re-runs
		 * dbDelta on sites that upgrade the plugin without deactivating (which
		 * never re-fires register_activation_hook).
		 */
		const TABLE_VERSION        = '1.0.0';
		const TABLE_VERSION_OPTION = 'adaire_blocks_subscribers_db_version';

		/** Max subscribe attempts allowed from one IP inside RATE_WINDOW. */
		const RATE_LIMIT  = 5;
		const RATE_WINDOW = 600;

		public static function table_name() {
			global $wpdb;
			return $wpdb->prefix . 'adaire_subscribers';
		}

		/**
		 * Create or upgrade the table. Cheap to call repeatedly — gated on a
		 * stored schema version and a per-request static flag.
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

			// email is VARCHAR(191) so the UNIQUE index fits inside MySQL's
			// 767-byte key limit on utf8mb4 (191 * 4 = 764).
			$sql = "CREATE TABLE {$table_name} (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
				email VARCHAR(191) NOT NULL,
				name VARCHAR(191) NULL,
				status VARCHAR(20) NOT NULL DEFAULT 'subscribed',
				source VARCHAR(50) NULL,
				source_url VARCHAR(500) NULL,
				token VARCHAR(64) NOT NULL,
				ip_hash VARCHAR(64) NULL,
				created_at DATETIME NOT NULL,
				unsubscribed_at DATETIME NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY email (email),
				KEY status (status),
				KEY created_at (created_at)
			) {$charset_collate};";

			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
			dbDelta( $sql );

			update_option( self::TABLE_VERSION_OPTION, self::TABLE_VERSION, false );
		}

		/**
		 * Hash an IP for rate limiting and abuse tracing without storing a
		 * plain address (same approach as the cookie consent log).
		 */
		private static function ip_hash() {
			$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
			if ( '' === $ip ) {
				return '';
			}
			return hash( 'sha256', $ip . wp_salt( 'auth' ) );
		}

		private static function rate_limited() {
			$hash = self::ip_hash();
			if ( '' === $hash ) {
				return false;
			}

			$key   = 'adaire_sub_rate_' . substr( $hash, 0, 32 );
			$count = (int) get_transient( $key );

			if ( $count >= self::RATE_LIMIT ) {
				return true;
			}

			set_transient( $key, $count + 1, self::RATE_WINDOW );
			return false;
		}

		/**
		 * Add (or re-activate) a subscriber.
		 *
		 * @param array $args email, name, source, source_url.
		 * @return array { bool success, string code, string message }
		 */
		public static function add( $args ) {
			self::ensure_table();

			$email = isset( $args['email'] ) ? sanitize_email( $args['email'] ) : '';

			if ( '' === $email || ! is_email( $email ) ) {
				return array(
					'success' => false,
					'code'    => 'invalid_email',
					'message' => __( 'Please enter a valid email address.', 'adaire-blocks' ),
				);
			}

			global $wpdb;
			$table = self::table_name();

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$existing = $wpdb->get_row(
				$wpdb->prepare( "SELECT id, status FROM {$table} WHERE email = %s", $email ) // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			);

			if ( $existing ) {
				if ( 'subscribed' === $existing->status ) {
					// Idempotent on purpose: don't leak list membership by
					// telling an anonymous visitor this address is already on it.
					return array(
						'success' => true,
						'code'    => 'already_subscribed',
						'message' => self::success_message(),
					);
				}

				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->update(
					$table,
					array(
						'status'          => 'subscribed',
						'unsubscribed_at' => null,
						'created_at'      => current_time( 'mysql' ),
					),
					array( 'id' => $existing->id ),
					array( '%s', '%s', '%s' ),
					array( '%d' )
				);

				return array(
					'success' => true,
					'code'    => 'resubscribed',
					'message' => self::success_message(),
				);
			}

			$name = isset( $args['name'] ) ? sanitize_text_field( $args['name'] ) : '';

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$inserted = $wpdb->insert(
				$table,
				array(
					'email'      => $email,
					'name'       => $name,
					'status'     => 'subscribed',
					'source'     => isset( $args['source'] ) ? sanitize_key( $args['source'] ) : 'unknown',
					'source_url' => isset( $args['source_url'] ) ? esc_url_raw( $args['source_url'] ) : '',
					'token'      => wp_generate_password( 32, false, false ),
					'ip_hash'    => self::ip_hash(),
					'created_at' => current_time( 'mysql' ),
				),
				array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
			);

			if ( ! $inserted ) {
				return array(
					'success' => false,
					'code'    => 'db_error',
					'message' => __( 'Sorry, we could not save your address. Please try again.', 'adaire-blocks' ),
				);
			}

			self::notify_admin( $email, $name, isset( $args['source'] ) ? $args['source'] : '' );

			/**
			 * Fires after a new address joins the list.
			 *
			 * @param string $email
			 * @param array  $args
			 */
			do_action( 'adaire_blocks_subscriber_added', $email, $args );

			return array(
				'success' => true,
				'code'    => 'subscribed',
				'message' => self::success_message(),
			);
		}

		private static function success_message() {
			$custom = get_option( 'adaire_blocks_subscribe_success', '' );
			if ( is_string( $custom ) && '' !== trim( $custom ) ) {
				return $custom;
			}
			return __( 'Thanks — you are on the list.', 'adaire-blocks' );
		}

		/**
		 * Tell the site admin a new address arrived. Plain text on purpose:
		 * this is an internal notification, not a designed email.
		 */
		private static function notify_admin( $email, $name, $source ) {
			if ( ! get_option( 'adaire_blocks_subscribe_notify', true ) ) {
				return;
			}

			$to = get_option( 'adaire_blocks_subscribe_notify_email', '' );
			if ( ! is_email( $to ) ) {
				$to = get_option( 'admin_email' );
			}

			$site = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );

			$body = sprintf(
				/* translators: 1: email address, 2: subscriber name, 3: block the form was in, 4: date */
				__( "New newsletter subscriber on %1\$s\n\nEmail: %2\$s\nName: %3\$s\nSource: %4\$s\nDate: %5\$s\n", 'adaire-blocks' ),
				$site,
				$email,
				'' !== $name ? $name : __( '(not given)', 'adaire-blocks' ),
				'' !== $source ? $source : __( '(unknown)', 'adaire-blocks' ),
				current_time( 'mysql' )
			);

			wp_mail(
				$to,
				/* translators: %s: site name */
				sprintf( __( '[%s] New newsletter subscriber', 'adaire-blocks' ), $site ),
				$body
			);
		}

		/* ── Queries used by the admin dashboard ─────────────────────────── */

		public static function count_by_status( $status = 'subscribed' ) {
			self::ensure_table();
			global $wpdb;
			$table = self::table_name();

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			return (int) $wpdb->get_var(
				$wpdb->prepare( "SELECT COUNT(*) FROM {$table} WHERE status = %s", $status ) // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			);
		}

		public static function get_page( $args = array() ) {
			self::ensure_table();
			global $wpdb;
			$table = self::table_name();

			$per_page = isset( $args['per_page'] ) ? max( 1, (int) $args['per_page'] ) : 50;
			$page     = isset( $args['page'] ) ? max( 1, (int) $args['page'] ) : 1;
			$offset   = ( $page - 1 ) * $per_page;
			$search   = isset( $args['search'] ) ? trim( (string) $args['search'] ) : '';
			$status   = isset( $args['status'] ) ? (string) $args['status'] : '';

			$where  = 'WHERE 1=1';
			$params = array();

			if ( '' !== $status ) {
				$where   .= ' AND status = %s';
				$params[] = $status;
			}

			if ( '' !== $search ) {
				$where   .= ' AND (email LIKE %s OR name LIKE %s)';
				$like     = '%' . $wpdb->esc_like( $search ) . '%';
				$params[] = $like;
				$params[] = $like;
			}

			$sql = "SELECT * FROM {$table} {$where} ORDER BY created_at DESC LIMIT %d OFFSET %d";

			$params[] = $per_page;
			$params[] = $offset;

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			return $wpdb->get_results( $wpdb->prepare( $sql, $params ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}

		/**
		 * Every subscribed address, for a campaign send. Returns id + email +
		 * token so the sender can build a per-recipient unsubscribe link.
		 */
		public static function get_sendable( $limit, $after_id = 0 ) {
			self::ensure_table();
			global $wpdb;
			$table = self::table_name();

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			return $wpdb->get_results(
				$wpdb->prepare(
					"SELECT id, email, name, token FROM {$table} WHERE status = 'subscribed' AND id > %d ORDER BY id ASC LIMIT %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$after_id,
					$limit
				)
			);
		}

		public static function delete( $id ) {
			self::ensure_table();
			global $wpdb;
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			return (bool) $wpdb->delete( self::table_name(), array( 'id' => (int) $id ), array( '%d' ) );
		}

		public static function unsubscribe_url( $token ) {
			return add_query_arg( 'adaire_unsubscribe', rawurlencode( $token ), home_url( '/' ) );
		}

		/**
		 * Handle ?adaire_unsubscribe=TOKEN. A one-click link with no
		 * confirmation step, which is what mail clients and CAN-SPAM expect.
		 */
		public static function handle_unsubscribe() {
			if ( empty( $_GET['adaire_unsubscribe'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				return;
			}

			$token = sanitize_text_field( wp_unslash( $_GET['adaire_unsubscribe'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			if ( '' === $token ) {
				return;
			}

			self::ensure_table();
			global $wpdb;
			$table = self::table_name();

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$updated = $wpdb->update(
				$table,
				array(
					'status'          => 'unsubscribed',
					'unsubscribed_at' => current_time( 'mysql' ),
				),
				array( 'token' => $token ),
				array( '%s', '%s' ),
				array( '%s' )
			);

			$message = $updated
				? __( 'You have been unsubscribed. Sorry to see you go.', 'adaire-blocks' )
				: __( 'That unsubscribe link is no longer valid.', 'adaire-blocks' );

			wp_die(
				esc_html( $message ),
				esc_html__( 'Unsubscribe', 'adaire-blocks' ),
				array(
					'response'  => 200,
					'back_link' => true,
				)
			);
		}

		/* ── REST ─────────────────────────────────────────────────────────── */

		public static function register_routes() {
			register_rest_route(
				'adaire-blocks/v1',
				'/subscribe',
				array(
					'methods'  => 'POST',
					'callback' => array( __CLASS__, 'rest_subscribe' ),
					/*
					 * Public by design: this is a newsletter signup on a cached
					 * front end, where a wp_rest nonce is frequently stale or
					 * absent for logged-out visitors. Abuse is handled by the
					 * honeypot, the per-IP rate limit and strict email
					 * validation instead — the same trade-off the cookie
					 * consent endpoint in this plugin already makes.
					 */
					'permission_callback' => '__return_true',
					'args'                => array(
						'email' => array(
							'required' => true,
							'type'     => 'string',
						),
					),
				)
			);
		}

		public static function rest_subscribe( WP_REST_Request $request ) {
			$body = $request->get_json_params();
			if ( ! is_array( $body ) ) {
				$body = array();
			}

			// Honeypot: a real browser leaves this empty, bots fill every field.
			if ( ! empty( $body['company'] ) ) {
				// Answer as if it worked so the bot doesn't learn to adapt.
				return new WP_REST_Response(
					array(
						'success' => true,
						'message' => self::success_message(),
					),
					200
				);
			}

			if ( self::rate_limited() ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'message' => __( 'Too many attempts. Please try again shortly.', 'adaire-blocks' ),
					),
					429
				);
			}

			$result = self::add(
				array(
					'email'      => isset( $body['email'] ) ? $body['email'] : '',
					'name'       => isset( $body['name'] ) ? $body['name'] : '',
					'source'     => isset( $body['source'] ) ? $body['source'] : 'unknown',
					'source_url' => isset( $body['source_url'] ) ? $body['source_url'] : '',
				)
			);

			return new WP_REST_Response(
				array(
					'success' => $result['success'],
					'message' => $result['message'],
				),
				$result['success'] ? 200 : 400
			);
		}

		/**
		 * Publish the REST endpoint to the front end.
		 *
		 * Registered with src=false purely as a carrier for the inline config:
		 * the block view scripts get their handle generated by block.json, so
		 * localising onto them by name would be guessing at a WordPress
		 * implementation detail. A standalone handle is stable.
		 */
		public static function enqueue_config() {
			wp_register_script( 'adaire-blocks-newsletter-config', false, array(), null, true );
			wp_enqueue_script( 'adaire-blocks-newsletter-config' );

			wp_add_inline_script(
				'adaire-blocks-newsletter-config',
				'window.adaireBlocksNewsletter = ' . wp_json_encode(
					array(
						'endpoint'     => esc_url_raw( rest_url( 'adaire-blocks/v1/subscribe' ) ),
						'formEndpoint' => esc_url_raw( rest_url( 'adaire-blocks/v1/form-submit' ) ),
						// May be stale on a cached page; the endpoint does not
						// require it, but it attributes logged-in submissions.
						'nonce'    => wp_create_nonce( 'wp_rest' ),
					)
				) . ';',
				'before'
			);
		}
	}
}

add_action( 'rest_api_init', array( 'Adaire_Blocks_Subscribers', 'register_routes' ) );
add_action( 'wp_enqueue_scripts', array( 'Adaire_Blocks_Subscribers', 'enqueue_config' ) );
add_action( 'init', array( 'Adaire_Blocks_Subscribers', 'handle_unsubscribe' ) );
add_action( 'admin_init', array( 'Adaire_Blocks_Subscribers', 'ensure_table' ) );

if ( ! function_exists( 'adaire_blocks_subscribers_activate' ) ) {
	function adaire_blocks_subscribers_activate() {
		Adaire_Blocks_Subscribers::ensure_table();
	}
}
register_activation_hook( ADAIRE_BLOCKS_PLUGIN_FILE, 'adaire_blocks_subscribers_activate' );
