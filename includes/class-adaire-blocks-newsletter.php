<?php
/**
 * Newsletter campaigns — compose, queue, send in batches over WP-Cron.
 *
 * Campaigns are stored as a private post type rather than a table: a campaign
 * is a title plus a body plus a handful of counters, which is exactly what
 * wp_posts is good at, and it gives autosave and revisions for free while the
 * admin is drafting.
 *
 * Sending never happens inside the admin request. A send of any real size
 * would blow past max_execution_time and leave the list half-mailed with no
 * record of where it stopped, so the admin screen only marks the campaign
 * `sending` and schedules the first batch; each batch mails a slice, records
 * the last subscriber id it reached, and schedules the next one.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Adaire_Blocks_Newsletter' ) ) {

	class Adaire_Blocks_Newsletter {

		const POST_TYPE  = 'adaire_campaign';
		const CRON_HOOK  = 'adaire_blocks_newsletter_batch';
		const BATCH_SIZE = 25;

		public static function register_post_type() {
			register_post_type(
				self::POST_TYPE,
				array(
					'labels'          => array(
						'name'          => __( 'Newsletters', 'adaire-blocks' ),
						'singular_name' => __( 'Newsletter', 'adaire-blocks' ),
					),
					'public'          => false,
					'show_ui'         => false,
					'show_in_menu'    => false,
					'show_in_rest'    => false,
					'supports'        => array( 'title', 'editor' ),
					'capability_type' => 'post',
					'map_meta_cap'    => true,
				)
			);
		}

		/**
		 * How many recipients one cron batch mails. Lower it on hosts with a
		 * strict per-hour mail cap.
		 */
		public static function batch_size() {
			return (int) apply_filters( 'adaire_blocks_newsletter_batch_size', self::BATCH_SIZE );
		}

		public static function create( $subject, $body ) {
			$id = wp_insert_post(
				array(
					'post_type'    => self::POST_TYPE,
					'post_title'   => sanitize_text_field( $subject ),
					'post_content' => wp_kses_post( $body ),
					'post_status'  => 'publish',
				),
				true
			);

			if ( is_wp_error( $id ) ) {
				return $id;
			}

			update_post_meta( $id, '_adaire_status', 'draft' );
			update_post_meta( $id, '_adaire_sent_count', 0 );
			update_post_meta( $id, '_adaire_failed_count', 0 );
			update_post_meta( $id, '_adaire_last_id', 0 );

			return $id;
		}

		/**
		 * Mark a campaign as sending and schedule the first batch.
		 *
		 * @return true|WP_Error
		 */
		public static function start( $campaign_id ) {
			$campaign = get_post( $campaign_id );

			if ( ! $campaign || self::POST_TYPE !== $campaign->post_type ) {
				return new WP_Error( 'not_found', __( 'That newsletter no longer exists.', 'adaire-blocks' ) );
			}

			$status = get_post_meta( $campaign_id, '_adaire_status', true );
			if ( 'sending' === $status || 'sent' === $status ) {
				return new WP_Error( 'already_sent', __( 'That newsletter has already been sent.', 'adaire-blocks' ) );
			}

			if ( 0 === Adaire_Blocks_Subscribers::count_by_status( 'subscribed' ) ) {
				return new WP_Error( 'no_subscribers', __( 'There are no subscribed addresses to send to.', 'adaire-blocks' ) );
			}

			update_post_meta( $campaign_id, '_adaire_status', 'sending' );
			update_post_meta( $campaign_id, '_adaire_started_at', current_time( 'mysql' ) );

			self::schedule_next( $campaign_id, 0 );

			return true;
		}

		private static function schedule_next( $campaign_id, $delay = 60 ) {
			$args = array( (int) $campaign_id );

			if ( ! wp_next_scheduled( self::CRON_HOOK, $args ) ) {
				wp_schedule_single_event( time() + $delay, self::CRON_HOOK, $args );
			}
		}

		/**
		 * Send one batch, then queue the next. Runs on cron, never in an
		 * admin page load.
		 */
		public static function run_batch( $campaign_id ) {
			$campaign = get_post( $campaign_id );

			if ( ! $campaign || self::POST_TYPE !== $campaign->post_type ) {
				return;
			}

			if ( 'sending' !== get_post_meta( $campaign_id, '_adaire_status', true ) ) {
				return;
			}

			$last_id     = (int) get_post_meta( $campaign_id, '_adaire_last_id', true );
			$subscribers = Adaire_Blocks_Subscribers::get_sendable( self::batch_size(), $last_id );

			if ( empty( $subscribers ) ) {
				update_post_meta( $campaign_id, '_adaire_status', 'sent' );
				update_post_meta( $campaign_id, '_adaire_finished_at', current_time( 'mysql' ) );
				return;
			}

			$sent   = (int) get_post_meta( $campaign_id, '_adaire_sent_count', true );
			$failed = (int) get_post_meta( $campaign_id, '_adaire_failed_count', true );

			// wp_mail() defaults to text/plain; switch it for this batch only
			// so the filter can't leak into unrelated mail sent afterwards.
			add_filter( 'wp_mail_content_type', array( __CLASS__, 'html_content_type' ) );

			foreach ( $subscribers as $subscriber ) {
				$ok = wp_mail(
					$subscriber->email,
					wp_specialchars_decode( $campaign->post_title, ENT_QUOTES ),
					self::render_body( $campaign, $subscriber ),
					self::headers()
				);

				if ( $ok ) {
					++$sent;
				} else {
					++$failed;
				}

				$last_id = (int) $subscriber->id;
			}

			remove_filter( 'wp_mail_content_type', array( __CLASS__, 'html_content_type' ) );

			update_post_meta( $campaign_id, '_adaire_sent_count', $sent );
			update_post_meta( $campaign_id, '_adaire_failed_count', $failed );
			update_post_meta( $campaign_id, '_adaire_last_id', $last_id );

			// More to go — queue the next slice a minute out so a big list is
			// spread across cron runs rather than hammering the mail server.
			self::schedule_next( $campaign_id, 60 );
		}

		public static function html_content_type() {
			return 'text/html';
		}

		private static function headers() {
			$from_name  = get_option( 'adaire_blocks_newsletter_from_name', get_bloginfo( 'name' ) );
			$from_email = get_option( 'adaire_blocks_newsletter_from_email', get_option( 'admin_email' ) );

			if ( ! is_email( $from_email ) ) {
				$from_email = get_option( 'admin_email' );
			}

			return array(
				sprintf( 'From: %s <%s>', wp_specialchars_decode( $from_name, ENT_QUOTES ), $from_email ),
			);
		}

		/**
		 * Merge a campaign body for one recipient and append the unsubscribe
		 * footer. The footer is not optional — a bulk mail without a working
		 * opt-out is the thing that gets a domain blacklisted.
		 */
		private static function render_body( $campaign, $subscriber ) {
			$unsubscribe = Adaire_Blocks_Subscribers::unsubscribe_url( $subscriber->token );

			$body = str_replace(
				array( '{name}', '{email}', '{site}', '{unsubscribe_url}' ),
				array(
					esc_html( $subscriber->name ? $subscriber->name : '' ),
					esc_html( $subscriber->email ),
					esc_html( wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ) ),
					esc_url( $unsubscribe ),
				),
				wpautop( $campaign->post_content )
			);

			$footer = sprintf(
				'<hr style="margin:32px 0;border:none;border-top:1px solid #e0e0e0;">
				<p style="font-size:12px;color:#666;">%1$s<br><a href="%2$s">%3$s</a></p>',
				esc_html( wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ) ),
				esc_url( $unsubscribe ),
				esc_html__( 'Unsubscribe from these emails', 'adaire-blocks' )
			);

			return $body . $footer;
		}

		/**
		 * Send one copy to an arbitrary address, without touching the
		 * campaign's counters or its send state.
		 */
		public static function send_test( $campaign_id, $to ) {
			$campaign = get_post( $campaign_id );

			if ( ! $campaign || self::POST_TYPE !== $campaign->post_type ) {
				return new WP_Error( 'not_found', __( 'That newsletter no longer exists.', 'adaire-blocks' ) );
			}

			if ( ! is_email( $to ) ) {
				return new WP_Error( 'invalid_email', __( 'Enter a valid address to send the test to.', 'adaire-blocks' ) );
			}

			$stub = (object) array(
				'email' => $to,
				'name'  => __( 'Test recipient', 'adaire-blocks' ),
				'token' => 'test-token-not-a-real-subscriber',
			);

			add_filter( 'wp_mail_content_type', array( __CLASS__, 'html_content_type' ) );

			$ok = wp_mail(
				$to,
				'[TEST] ' . wp_specialchars_decode( $campaign->post_title, ENT_QUOTES ),
				self::render_body( $campaign, $stub ),
				self::headers()
			);

			remove_filter( 'wp_mail_content_type', array( __CLASS__, 'html_content_type' ) );

			if ( ! $ok ) {
				return new WP_Error( 'send_failed', __( 'WordPress could not send the test. Check the site mail configuration.', 'adaire-blocks' ) );
			}

			return true;
		}

		public static function get_campaigns( $limit = 20 ) {
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

add_action( 'init', array( 'Adaire_Blocks_Newsletter', 'register_post_type' ) );
add_action( 'adaire_blocks_newsletter_batch', array( 'Adaire_Blocks_Newsletter', 'run_batch' ), 10, 1 );
