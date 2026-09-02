<?php
/**
 * Form block submissions — store the entry, then email it to the site owner.
 *
 * The Form block used to call preventDefault() and write "Thanks, your
 * submission was received" straight into the page without sending anything
 * anywhere, so every enquiry was silently discarded. Storing first and mailing
 * second is deliberate: if the host's mail is misconfigured the entry is still
 * recoverable from the admin screen instead of being lost twice.
 *
 * Entries are a private post type. Unlike the subscriber list these are
 * low-volume, arbitrary-shaped records that an admin reads one at a time —
 * exactly what wp_posts and post meta are for.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Adaire_Blocks_Submissions' ) ) {

	class Adaire_Blocks_Submissions {

		const POST_TYPE = 'adaire_submission';

		/** Max submissions allowed from one IP inside RATE_WINDOW seconds. */
		const RATE_LIMIT  = 10;
		const RATE_WINDOW = 600;

		/** Hard cap on stored fields/length, so a crafted POST can't bloat the DB. */
		const MAX_FIELDS = 40;
		const MAX_LENGTH = 5000;

		public static function register_post_type() {
			register_post_type(
				self::POST_TYPE,
				array(
					'labels'          => array(
						'name'          => __( 'Form entries', 'adaire-blocks' ),
						'singular_name' => __( 'Form entry', 'adaire-blocks' ),
					),
					'public'          => false,
					'show_ui'         => false,
					'show_in_menu'    => false,
					'show_in_rest'    => false,
					'supports'        => array( 'title' ),
					'capability_type' => 'post',
					'map_meta_cap'    => true,
				)
			);
		}

		private static function rate_limited() {
			$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';

			if ( '' === $ip ) {
				return false;
			}

			$key   = 'adaire_form_rate_' . substr( hash( 'sha256', $ip . wp_salt( 'auth' ) ), 0, 32 );
			$count = (int) get_transient( $key );

			if ( $count >= self::RATE_LIMIT ) {
				return true;
			}

			set_transient( $key, $count + 1, self::RATE_WINDOW );
			return false;
		}

		/**
		 * Reduce an arbitrary posted payload to something safe to store.
		 * Keys become sanitised text, values are stripped of tags and clipped.
		 */
		private static function clean_fields( $fields ) {
			$clean = array();

			if ( ! is_array( $fields ) ) {
				return $clean;
			}

			$i = 0;
			foreach ( $fields as $key => $value ) {
				if ( ++$i > self::MAX_FIELDS ) {
					break;
				}

				$label = sanitize_text_field( (string) $key );

				if ( '' === $label || 'company' === $label ) {
					continue; // 'company' is the honeypot, never store it.
				}

				if ( is_array( $value ) ) {
					$value = implode( ', ', array_map( 'strval', $value ) );
				}

				$clean[ $label ] = mb_substr( sanitize_textarea_field( (string) $value ), 0, self::MAX_LENGTH );
			}

			return $clean;
		}

		public static function register_routes() {
			register_rest_route(
				'adaire-blocks/v1',
				'/form-submit',
				array(
					'methods'  => 'POST',
					'callback' => array( __CLASS__, 'rest_submit' ),
					// Public for the same reason as /subscribe: a nonce is
					// unreliable for logged-out visitors on a cached page.
					// Honeypot + rate limit + strict sanitising instead.
					'permission_callback' => '__return_true',
				)
			);
		}

		public static function rest_submit( WP_REST_Request $request ) {
			$body = $request->get_json_params();

			if ( ! is_array( $body ) ) {
				$body = array();
			}

			$fields = isset( $body['fields'] ) && is_array( $body['fields'] ) ? $body['fields'] : array();

			// Honeypot — answer as success so bots don't learn to adapt.
			if ( ! empty( $fields['company'] ) || ! empty( $body['company'] ) ) {
				return new WP_REST_Response( array( 'success' => true ), 200 );
			}

			if ( self::rate_limited() ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'message' => __( 'Too many submissions. Please try again shortly.', 'adaire-blocks' ),
					),
					429
				);
			}

			$clean = self::clean_fields( $fields );

			if ( empty( $clean ) ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'message' => __( 'Please fill in the form before submitting.', 'adaire-blocks' ),
					),
					400
				);
			}

			$email      = isset( $clean['email'] ) ? sanitize_email( $clean['email'] ) : '';
			$source_url = isset( $body['source_url'] ) ? esc_url_raw( $body['source_url'] ) : '';

			$title = sprintf(
				/* translators: 1: submitter email or name, 2: date */
				__( 'Enquiry from %1$s — %2$s', 'adaire-blocks' ),
				$email ? $email : ( isset( $clean['name'] ) ? $clean['name'] : __( 'website', 'adaire-blocks' ) ),
				current_time( 'mysql' )
			);

			$post_id = wp_insert_post(
				array(
					'post_type'   => self::POST_TYPE,
					'post_title'  => $title,
					'post_status' => 'publish',
				),
				true
			);

			if ( is_wp_error( $post_id ) ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'message' => __( 'Sorry, we could not record your message. Please try again.', 'adaire-blocks' ),
					),
					500
				);
			}

			update_post_meta( $post_id, '_adaire_fields', $clean );
			update_post_meta( $post_id, '_adaire_source_url', $source_url );

			self::notify_admin( $clean, $source_url );

			// A form that asks for consent and gets it also joins the list.
			if ( $email && ! empty( $body['subscribe'] ) && class_exists( 'Adaire_Blocks_Subscribers' ) ) {
				Adaire_Blocks_Subscribers::add(
					array(
						'email'      => $email,
						'name'       => isset( $clean['name'] ) ? $clean['name'] : '',
						'source'     => 'form_block',
						'source_url' => $source_url,
					)
				);
			}

			/**
			 * Fires after a form entry is stored.
			 *
			 * @param int   $post_id
			 * @param array $clean
			 */
			do_action( 'adaire_blocks_form_submitted', $post_id, $clean );

			return new WP_REST_Response( array( 'success' => true ), 200 );
		}

		private static function notify_admin( $fields, $source_url ) {
			$to = get_option( 'adaire_blocks_form_notify_email', '' );

			if ( ! is_email( $to ) ) {
				$to = get_option( 'admin_email' );
			}

			$site  = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
			$lines = array();

			foreach ( $fields as $label => $value ) {
				$lines[] = $label . ': ' . $value;
			}

			if ( $source_url ) {
				$lines[] = '';
				$lines[] = __( 'Submitted from:', 'adaire-blocks' ) . ' ' . $source_url;
			}

			$reply_to = isset( $fields['email'] ) && is_email( $fields['email'] )
				? array( 'Reply-To: ' . sanitize_email( $fields['email'] ) )
				: array();

			wp_mail(
				$to,
				/* translators: %s: site name */
				sprintf( __( '[%s] New form submission', 'adaire-blocks' ), $site ),
				implode( "\n", $lines ),
				$reply_to
			);
		}

		public static function get_entries( $limit = 50 ) {
			return get_posts(
				array(
					'post_type'      => self::POST_TYPE,
					'post_status'    => 'publish',
					'posts_per_page' => (int) $limit,
					'orderby'        => 'date',
					'order'          => 'DESC',
				)
			);
		}
	}
}

add_action( 'init', array( 'Adaire_Blocks_Submissions', 'register_post_type' ) );
add_action( 'rest_api_init', array( 'Adaire_Blocks_Submissions', 'register_routes' ) );
