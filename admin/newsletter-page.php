<?php
/**
 * Newsletter dashboard — subscribers, compose & send, sent history, settings.
 *
 * Nests under the existing 'adaire-blocks-settings' menu rather than
 * registering its own top-level page, for the reason documented at length in
 * admin/settings-page.php: two add_menu_page() calls on the same slug corrupt
 * the admin menu's routing when both the free and pro plugins are around.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Adaire_Blocks_Newsletter_Page' ) ) {

	class Adaire_Blocks_Newsletter_Page {

		const SLUG     = 'adaire-blocks-newsletter';
		const PER_PAGE = 50;

		public static function init() {
			add_action( 'admin_menu', array( __CLASS__, 'add_page' ), 11 );
			add_action( 'admin_post_adaire_newsletter_action', array( __CLASS__, 'handle_post' ) );
			add_action( 'admin_post_adaire_subscribers_export', array( __CLASS__, 'handle_export' ) );
		}

		public static function add_page() {
			add_submenu_page(
				'adaire-blocks-settings',
				__( 'Newsletter', 'adaire-blocks' ),
				__( 'Newsletter', 'adaire-blocks' ),
				'manage_options',
				self::SLUG,
				array( __CLASS__, 'render' )
			);
		}

		private static function url( $args = array() ) {
			return add_query_arg(
				array_merge( array( 'page' => self::SLUG ), $args ),
				admin_url( 'admin.php' )
			);
		}

		private static function current_tab() {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only tab switch.
			$tab = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'subscribers';
			return in_array( $tab, array( 'subscribers', 'compose', 'sent', 'entries', 'settings' ), true ) ? $tab : 'subscribers';
		}

		/* ── POST handling ────────────────────────────────────────────────── */

		public static function handle_post() {
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( esc_html__( 'You are not allowed to do that.', 'adaire-blocks' ) );
			}

			check_admin_referer( 'adaire_newsletter_action' );

			$action = isset( $_POST['adaire_action'] ) ? sanitize_key( wp_unslash( $_POST['adaire_action'] ) ) : '';

			switch ( $action ) {
				case 'send':
				case 'test':
					self::handle_send( $action );
					break;

				case 'delete_subscriber':
					$id = isset( $_POST['subscriber_id'] ) ? (int) $_POST['subscriber_id'] : 0;
					Adaire_Blocks_Subscribers::delete( $id );
					self::redirect( 'subscribers', 'deleted' );
					break;

				case 'save_settings':
					self::handle_settings();
					break;

				default:
					self::redirect( 'subscribers', 'unknown_action' );
			}
		}

		private static function handle_send( $action ) {
			$subject = isset( $_POST['subject'] ) ? sanitize_text_field( wp_unslash( $_POST['subject'] ) ) : '';
			$body    = isset( $_POST['body'] ) ? wp_kses_post( wp_unslash( $_POST['body'] ) ) : '';

			if ( '' === trim( $subject ) || '' === trim( wp_strip_all_tags( $body ) ) ) {
				self::redirect( 'compose', 'empty' );
			}

			$campaign_id = Adaire_Blocks_Newsletter::create( $subject, $body );

			if ( is_wp_error( $campaign_id ) ) {
				self::redirect( 'compose', 'create_failed' );
			}

			if ( 'test' === $action ) {
				$to     = isset( $_POST['test_email'] ) ? sanitize_email( wp_unslash( $_POST['test_email'] ) ) : '';
				$result = Adaire_Blocks_Newsletter::send_test( $campaign_id, $to );

				// A test shouldn't leave a phantom campaign in the history.
				wp_delete_post( $campaign_id, true );

				self::redirect( 'compose', is_wp_error( $result ) ? 'test_failed' : 'test_sent' );
			}

			$started = Adaire_Blocks_Newsletter::start( $campaign_id );

			if ( is_wp_error( $started ) ) {
				wp_delete_post( $campaign_id, true );
				self::redirect( 'compose', $started->get_error_code() );
			}

			self::redirect( 'sent', 'queued' );
		}

		private static function handle_settings() {
			$from_name  = isset( $_POST['from_name'] ) ? sanitize_text_field( wp_unslash( $_POST['from_name'] ) ) : '';
			$from_email = isset( $_POST['from_email'] ) ? sanitize_email( wp_unslash( $_POST['from_email'] ) ) : '';
			$notify     = isset( $_POST['notify_email'] ) ? sanitize_email( wp_unslash( $_POST['notify_email'] ) ) : '';
			$success    = isset( $_POST['success_message'] ) ? sanitize_text_field( wp_unslash( $_POST['success_message'] ) ) : '';

			update_option( 'adaire_blocks_newsletter_from_name', $from_name );
			update_option( 'adaire_blocks_newsletter_from_email', $from_email );
			update_option( 'adaire_blocks_subscribe_notify_email', $notify );
			update_option( 'adaire_blocks_subscribe_notify', ! empty( $_POST['notify_on_signup'] ) );
			update_option( 'adaire_blocks_subscribe_success', $success );
			update_option( 'adaire_blocks_form_notify_email', isset( $_POST['form_notify_email'] ) ? sanitize_email( wp_unslash( $_POST['form_notify_email'] ) ) : '' );

			self::redirect( 'settings', 'saved' );
		}

		private static function redirect( $tab, $notice ) {
			wp_safe_redirect( self::url( array( 'tab' => $tab, 'notice' => $notice ) ) );
			exit;
		}

		public static function handle_export() {
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( esc_html__( 'You are not allowed to do that.', 'adaire-blocks' ) );
			}

			check_admin_referer( 'adaire_subscribers_export' );

			$rows = Adaire_Blocks_Subscribers::get_page(
				array(
					'per_page' => 100000,
					'page'     => 1,
				)
			);

			nocache_headers();
			header( 'Content-Type: text/csv; charset=utf-8' );
			header( 'Content-Disposition: attachment; filename=adaire-subscribers-' . gmdate( 'Y-m-d' ) . '.csv' );

			$out = fopen( 'php://output', 'w' );
			fputcsv( $out, array( 'email', 'name', 'status', 'source', 'source_url', 'created_at', 'unsubscribed_at' ) );

			foreach ( $rows as $row ) {
				fputcsv(
					$out,
					array(
						$row->email,
						$row->name,
						$row->status,
						$row->source,
						$row->source_url,
						$row->created_at,
						$row->unsubscribed_at,
					)
				);
			}

			fclose( $out );
			exit;
		}

		/* ── Rendering ────────────────────────────────────────────────────── */

		private static function notice() {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- display only.
			$notice = isset( $_GET['notice'] ) ? sanitize_key( wp_unslash( $_GET['notice'] ) ) : '';

			$messages = array(
				'queued'         => array( 'success', __( 'Newsletter queued. Delivery runs in the background — watch the counts below.', 'adaire-blocks' ) ),
				'test_sent'      => array( 'success', __( 'Test email sent.', 'adaire-blocks' ) ),
				'test_failed'    => array( 'error', __( 'The test could not be sent. Check the site mail configuration.', 'adaire-blocks' ) ),
				'empty'          => array( 'error', __( 'A newsletter needs both a subject and a body.', 'adaire-blocks' ) ),
				'no_subscribers' => array( 'error', __( 'Nothing was sent — there are no subscribed addresses yet.', 'adaire-blocks' ) ),
				'create_failed'  => array( 'error', __( 'The newsletter could not be saved.', 'adaire-blocks' ) ),
				'already_sent'   => array( 'error', __( 'That newsletter has already been sent.', 'adaire-blocks' ) ),
				'deleted'        => array( 'success', __( 'Subscriber removed.', 'adaire-blocks' ) ),
				'saved'          => array( 'success', __( 'Settings saved.', 'adaire-blocks' ) ),
			);

			if ( ! isset( $messages[ $notice ] ) ) {
				return;
			}

			printf(
				'<div class="notice notice-%1$s is-dismissible"><p>%2$s</p></div>',
				esc_attr( $messages[ $notice ][0] ),
				esc_html( $messages[ $notice ][1] )
			);
		}

		public static function render() {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			Adaire_Blocks_Subscribers::ensure_table();
			$tab = self::current_tab();

			$tabs = array(
				'subscribers' => __( 'Subscribers', 'adaire-blocks' ),
				'compose'     => __( 'Compose', 'adaire-blocks' ),
				'sent'        => __( 'Sent', 'adaire-blocks' ),
				'entries'     => __( 'Form entries', 'adaire-blocks' ),
				'settings'    => __( 'Settings', 'adaire-blocks' ),
			);

			echo '<div class="wrap">';
			echo '<h1>' . esc_html__( 'Newsletter', 'adaire-blocks' ) . '</h1>';

			self::notice();

			echo '<h2 class="nav-tab-wrapper">';
			foreach ( $tabs as $key => $label ) {
				printf(
					'<a href="%1$s" class="nav-tab%2$s">%3$s</a>',
					esc_url( self::url( array( 'tab' => $key ) ) ),
					$key === $tab ? ' nav-tab-active' : '',
					esc_html( $label )
				);
			}
			echo '</h2>';

			switch ( $tab ) {
				case 'compose':
					self::render_compose();
					break;
				case 'sent':
					self::render_sent();
					break;
				case 'entries':
					self::render_entries();
					break;
				case 'settings':
					self::render_settings();
					break;
				default:
					self::render_subscribers();
			}

			echo '</div>';
		}

		private static function render_subscribers() {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only filters.
			$search = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$paged = isset( $_GET['paged'] ) ? max( 1, (int) $_GET['paged'] ) : 1;

			$subscribed   = Adaire_Blocks_Subscribers::count_by_status( 'subscribed' );
			$unsubscribed = Adaire_Blocks_Subscribers::count_by_status( 'unsubscribed' );

			$rows = Adaire_Blocks_Subscribers::get_page(
				array(
					'per_page' => self::PER_PAGE,
					'page'     => $paged,
					'search'   => $search,
				)
			);

			echo '<p style="margin:16px 0;">';
			printf(
				/* translators: 1: subscribed count, 2: unsubscribed count */
				esc_html__( '%1$s subscribed · %2$s unsubscribed', 'adaire-blocks' ),
				'<strong>' . esc_html( number_format_i18n( $subscribed ) ) . '</strong>',
				'<strong>' . esc_html( number_format_i18n( $unsubscribed ) ) . '</strong>'
			);
			echo '</p>';

			echo '<form method="get" style="margin-bottom:12px;">';
			echo '<input type="hidden" name="page" value="' . esc_attr( self::SLUG ) . '">';
			echo '<input type="search" name="s" value="' . esc_attr( $search ) . '" placeholder="' . esc_attr__( 'Search email or name', 'adaire-blocks' ) . '">';
			submit_button( __( 'Search', 'adaire-blocks' ), 'secondary', '', false );
			echo '</form>';

			echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" style="margin-bottom:12px;">';
			wp_nonce_field( 'adaire_subscribers_export' );
			echo '<input type="hidden" name="action" value="adaire_subscribers_export">';
			submit_button( __( 'Export CSV', 'adaire-blocks' ), 'secondary', '', false );
			echo '</form>';

			echo '<table class="wp-list-table widefat fixed striped">';
			echo '<thead><tr>';
			echo '<th>' . esc_html__( 'Email', 'adaire-blocks' ) . '</th>';
			echo '<th>' . esc_html__( 'Name', 'adaire-blocks' ) . '</th>';
			echo '<th>' . esc_html__( 'Status', 'adaire-blocks' ) . '</th>';
			echo '<th>' . esc_html__( 'Source', 'adaire-blocks' ) . '</th>';
			echo '<th>' . esc_html__( 'Added', 'adaire-blocks' ) . '</th>';
			echo '<th></th>';
			echo '</tr></thead><tbody>';

			if ( empty( $rows ) ) {
				echo '<tr><td colspan="6">' . esc_html__( 'No subscribers yet. Addresses collected by a Hero Block or Form block appear here.', 'adaire-blocks' ) . '</td></tr>';
			}

			foreach ( $rows as $row ) {
				echo '<tr>';
				echo '<td>' . esc_html( $row->email ) . '</td>';
				echo '<td>' . esc_html( $row->name ) . '</td>';
				echo '<td>' . esc_html( $row->status ) . '</td>';
				echo '<td>' . esc_html( $row->source ) . '</td>';
				echo '<td>' . esc_html( $row->created_at ) . '</td>';
				echo '<td>';
				echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
				wp_nonce_field( 'adaire_newsletter_action' );
				echo '<input type="hidden" name="action" value="adaire_newsletter_action">';
				echo '<input type="hidden" name="adaire_action" value="delete_subscriber">';
				echo '<input type="hidden" name="subscriber_id" value="' . esc_attr( $row->id ) . '">';
				echo '<button type="submit" class="button-link delete">' . esc_html__( 'Delete', 'adaire-blocks' ) . '</button>';
				echo '</form>';
				echo '</td>';
				echo '</tr>';
			}

			echo '</tbody></table>';

			$total_pages = (int) ceil( ( $subscribed + $unsubscribed ) / self::PER_PAGE );
			if ( $total_pages > 1 ) {
				echo '<div class="tablenav"><div class="tablenav-pages">';
				echo wp_kses_post(
					paginate_links(
						array(
							'base'    => self::url( array( 'tab' => 'subscribers', 'paged' => '%#%', 's' => $search ) ),
							'format'  => '',
							'current' => $paged,
							'total'   => $total_pages,
						)
					)
				);
				echo '</div></div>';
			}
		}

		private static function render_compose() {
			$count = Adaire_Blocks_Subscribers::count_by_status( 'subscribed' );

			echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
			wp_nonce_field( 'adaire_newsletter_action' );
			echo '<input type="hidden" name="action" value="adaire_newsletter_action">';

			echo '<table class="form-table" role="presentation"><tbody>';

			echo '<tr><th scope="row"><label for="adaire-subject">' . esc_html__( 'Subject', 'adaire-blocks' ) . '</label></th>';
			echo '<td><input type="text" id="adaire-subject" name="subject" class="regular-text" required></td></tr>';

			echo '<tr><th scope="row">' . esc_html__( 'Message', 'adaire-blocks' ) . '</th><td>';
			wp_editor(
				'',
				'adaire_newsletter_body',
				array(
					'textarea_name' => 'body',
					'textarea_rows' => 14,
					'media_buttons' => true,
				)
			);
			echo '<p class="description">';
			esc_html_e( 'Placeholders: {name}, {email}, {site}, {unsubscribe_url}. An unsubscribe link is appended to every email automatically.', 'adaire-blocks' );
			echo '</p></td></tr>';

			echo '<tr><th scope="row"><label for="adaire-test-email">' . esc_html__( 'Send a test to', 'adaire-blocks' ) . '</label></th>';
			echo '<td><input type="email" id="adaire-test-email" name="test_email" class="regular-text" value="' . esc_attr( get_option( 'admin_email' ) ) . '"></td></tr>';

			echo '</tbody></table>';

			echo '<p>';
			echo '<button type="submit" name="adaire_action" value="test" class="button button-secondary">' . esc_html__( 'Send test', 'adaire-blocks' ) . '</button> ';
			printf(
				'<button type="submit" name="adaire_action" value="send" class="button button-primary" onclick="return confirm(%1$s);">%2$s</button>',
				esc_attr(
					wp_json_encode(
						sprintf(
							/* translators: %s: number of subscribers */
							__( 'Send this newsletter to %s subscribers? This cannot be undone.', 'adaire-blocks' ),
							number_format_i18n( $count )
						)
					)
				),
				esc_html(
					sprintf(
						/* translators: %s: number of subscribers */
						__( 'Send to %s subscribers', 'adaire-blocks' ),
						number_format_i18n( $count )
					)
				)
			);
			echo '</p>';

			echo '</form>';
		}

		private static function render_sent() {
			$campaigns = Adaire_Blocks_Newsletter::get_campaigns( 30 );

			echo '<table class="wp-list-table widefat fixed striped">';
			echo '<thead><tr>';
			echo '<th>' . esc_html__( 'Subject', 'adaire-blocks' ) . '</th>';
			echo '<th>' . esc_html__( 'Status', 'adaire-blocks' ) . '</th>';
			echo '<th>' . esc_html__( 'Sent', 'adaire-blocks' ) . '</th>';
			echo '<th>' . esc_html__( 'Failed', 'adaire-blocks' ) . '</th>';
			echo '<th>' . esc_html__( 'Started', 'adaire-blocks' ) . '</th>';
			echo '</tr></thead><tbody>';

			if ( empty( $campaigns ) ) {
				echo '<tr><td colspan="5">' . esc_html__( 'Nothing sent yet.', 'adaire-blocks' ) . '</td></tr>';
			}

			foreach ( $campaigns as $campaign ) {
				$status = get_post_meta( $campaign->ID, '_adaire_status', true );

				echo '<tr>';
				echo '<td><strong>' . esc_html( $campaign->post_title ) . '</strong></td>';
				echo '<td>' . esc_html( $status ? $status : 'draft' ) . '</td>';
				echo '<td>' . esc_html( number_format_i18n( (int) get_post_meta( $campaign->ID, '_adaire_sent_count', true ) ) ) . '</td>';
				echo '<td>' . esc_html( number_format_i18n( (int) get_post_meta( $campaign->ID, '_adaire_failed_count', true ) ) ) . '</td>';
				echo '<td>' . esc_html( get_post_meta( $campaign->ID, '_adaire_started_at', true ) ) . '</td>';
				echo '</tr>';
			}

			echo '</tbody></table>';

			echo '<p class="description" style="margin-top:12px;">';
			esc_html_e( 'Sending runs on WP-Cron in batches. A campaign stuck on "sending" usually means cron is not firing — visit the site front end, or set up a real system cron.', 'adaire-blocks' );
			echo '</p>';
		}

		private static function render_entries() {
			$entries = class_exists( 'Adaire_Blocks_Submissions' )
				? Adaire_Blocks_Submissions::get_entries( 50 )
				: array();

			echo '<p class="description" style="margin:16px 0;">';
			esc_html_e( 'Submissions from the Form block. Each one is also emailed to the notification address on the Settings tab.', 'adaire-blocks' );
			echo '</p>';

			echo '<table class="wp-list-table widefat fixed striped">';
			echo '<thead><tr>';
			echo '<th style="width:180px;">' . esc_html__( 'Received', 'adaire-blocks' ) . '</th>';
			echo '<th>' . esc_html__( 'Submission', 'adaire-blocks' ) . '</th>';
			echo '</tr></thead><tbody>';

			if ( empty( $entries ) ) {
				echo '<tr><td colspan="2">' . esc_html__( 'No form entries yet.', 'adaire-blocks' ) . '</td></tr>';
			}

			foreach ( $entries as $entry ) {
				$fields = get_post_meta( $entry->ID, '_adaire_fields', true );
				$source = get_post_meta( $entry->ID, '_adaire_source_url', true );

				echo '<tr>';
				echo '<td>' . esc_html( get_the_date( 'Y-m-d H:i', $entry ) ) . '</td>';
				echo '<td>';

				if ( is_array( $fields ) && ! empty( $fields ) ) {
					echo '<dl style="margin:0;display:grid;grid-template-columns:auto 1fr;gap:2px 12px;">';
					foreach ( $fields as $label => $value ) {
						echo '<dt style="font-weight:600;">' . esc_html( $label ) . '</dt>';
						echo '<dd style="margin:0;">' . nl2br( esc_html( $value ) ) . '</dd>';
					}
					echo '</dl>';
				} else {
					echo esc_html__( '(no fields recorded)', 'adaire-blocks' );
				}

				if ( $source ) {
					echo '<p style="margin:6px 0 0;"><a href="' . esc_url( $source ) . '">' . esc_html( $source ) . '</a></p>';
				}

				echo '</td></tr>';
			}

			echo '</tbody></table>';
		}

		private static function render_settings() {
			echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
			wp_nonce_field( 'adaire_newsletter_action' );
			echo '<input type="hidden" name="action" value="adaire_newsletter_action">';
			echo '<input type="hidden" name="adaire_action" value="save_settings">';

			echo '<table class="form-table" role="presentation"><tbody>';

			printf(
				'<tr><th scope="row"><label for="from_name">%1$s</label></th><td><input type="text" id="from_name" name="from_name" class="regular-text" value="%2$s"></td></tr>',
				esc_html__( 'From name', 'adaire-blocks' ),
				esc_attr( get_option( 'adaire_blocks_newsletter_from_name', get_bloginfo( 'name' ) ) )
			);

			printf(
				'<tr><th scope="row"><label for="from_email">%1$s</label></th><td><input type="email" id="from_email" name="from_email" class="regular-text" value="%2$s"><p class="description">%3$s</p></td></tr>',
				esc_html__( 'From address', 'adaire-blocks' ),
				esc_attr( get_option( 'adaire_blocks_newsletter_from_email', get_option( 'admin_email' ) ) ),
				esc_html__( 'Use an address on this domain. A From address on a domain you do not control gets the mail spam-filtered.', 'adaire-blocks' )
			);

			printf(
				'<tr><th scope="row">%1$s</th><td><label><input type="checkbox" name="notify_on_signup" value="1" %2$s> %3$s</label></td></tr>',
				esc_html__( 'Signup notification', 'adaire-blocks' ),
				checked( (bool) get_option( 'adaire_blocks_subscribe_notify', true ), true, false ),
				esc_html__( 'Email me when someone subscribes', 'adaire-blocks' )
			);

			printf(
				'<tr><th scope="row"><label for="notify_email">%1$s</label></th><td><input type="email" id="notify_email" name="notify_email" class="regular-text" value="%2$s" placeholder="%3$s"></td></tr>',
				esc_html__( 'Send notifications to', 'adaire-blocks' ),
				esc_attr( get_option( 'adaire_blocks_subscribe_notify_email', '' ) ),
				esc_attr( get_option( 'admin_email' ) )
			);

			printf(
				'<tr><th scope="row"><label for="form_notify_email">%1$s</label></th><td><input type="email" id="form_notify_email" name="form_notify_email" class="regular-text" value="%2$s" placeholder="%3$s"><p class="description">%4$s</p></td></tr>',
				esc_html__( 'Form entries go to', 'adaire-blocks' ),
				esc_attr( get_option( 'adaire_blocks_form_notify_email', '' ) ),
				esc_attr( get_option( 'admin_email' ) ),
				esc_html__( 'Where Form block submissions are emailed.', 'adaire-blocks' )
			);

			printf(
				'<tr><th scope="row"><label for="success_message">%1$s</label></th><td><input type="text" id="success_message" name="success_message" class="regular-text" value="%2$s" placeholder="%3$s"></td></tr>',
				esc_html__( 'Signup success message', 'adaire-blocks' ),
				esc_attr( get_option( 'adaire_blocks_subscribe_success', '' ) ),
				esc_attr__( 'Thanks — you are on the list.', 'adaire-blocks' )
			);

			echo '</tbody></table>';

			submit_button( __( 'Save settings', 'adaire-blocks' ) );
			echo '</form>';
		}
	}

	Adaire_Blocks_Newsletter_Page::init();
}
