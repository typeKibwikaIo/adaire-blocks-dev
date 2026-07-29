<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Adaire_Deactivation_Log_Page {

	private static $instance = null;

	// Step 0: singleton access for the log page.
	public static function get_instance() {
		if ( self::$instance === null ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	// Step 0: register the admin page.
	private function __construct() {
		add_action( 'admin_menu', array( $this, 'register_page' ) );
	}

	// Step 1: add the Tools page used for SendGrid testing.
	public function register_page() {
		$capability = 'activate_plugins';
		add_management_page(
			'Adaire Blocks Deactivation Logs',
			'Adaire Blocks Deactivation Logs',
			$capability,
			'adaire-deactivation-logs',
			array( $this, 'render' )
		);
	}

	// Step 2: render the test form and recent log table.
	public function render() {
		if ( ! current_user_can( 'activate_plugins' ) && ! current_user_can( 'manage_network_plugins' ) ) {
			return;
		}

		$test_result = $this->handle_test_request();
		$recent_logs = $this->get_recent_logs();

		echo '<div class="wrap">';
		echo '<h1>Adaire Blocks Deactivation Logs</h1>';

		$this->render_test_result_notice( $test_result );
		$this->render_test_form();
		$this->render_log_table( $recent_logs );

		echo '</div>';
	}

	// Step 2a: handle the SendGrid test submission.
	private function handle_test_request() {
		if ( ! isset( $_POST['adaire_send_test'] ) ) {
			return null;
		}

		check_admin_referer( 'adaire_send_test' );

		$test_recipient_email = defined( 'ADAIRE_FEEDBACK_EMAIL' ) ? ADAIRE_FEEDBACK_EMAIL : get_option( 'admin_email' );
		$subject              = 'Adaire Blocks SendGrid Test ' . current_time( 'mysql' );
		$message              = "Adaire Blocks SendGrid test message.\n\nTime: " . current_time( 'mysql' ) . "\nSite: " . get_bloginfo( 'url' ) . "\n";

		$sendgrid_result = array(
			'sent'       => false,
			'provider'   => 'sendgrid',
			'status'     => null,
			'error'      => 'SendGrid not configured',
			'from_email' => null,
		);

		if ( function_exists( 'adaire_blocks_get_sendgrid_api_key' ) && adaire_blocks_get_sendgrid_api_key() ) {
			$sendgrid_result = adaire_blocks_send_via_sendgrid( $test_recipient_email, $subject, $message, null );
		}

		$this->append_test_log( $sendgrid_result, $test_recipient_email );

		return $sendgrid_result;
	}

	// Step 2b: store the test result in the log.
	private function append_test_log( array $result, $to_email ) {
		$existing = get_option( 'adaire_deact_log', array() );
		if ( ! is_array( $existing ) ) {
			$existing = array();
		}

		$existing[] = array(
			'date'          => current_time( 'mysql' ),
			'reason'        => 'test',
			'email'         => '',
			'details'       => '',
			'site'          => get_bloginfo( 'url' ),
			'mail_sent'     => (bool) ( $result['sent'] ?? false ),
			'from_email'    => $result['from_email'] ?? null,
			'mail_provider' => $result['provider'] ?? null,
			'mail_status'   => $result['status'] ?? null,
			'mail_error'    => $result['error'] ?? null,
			'to_email'      => $to_email,
		);

		update_option( 'adaire_deact_log', $existing );
	}

	// Step 2c: fetch the most recent log entries.
	private function get_recent_logs() {
		$logs = get_option( 'adaire_deact_log', array() );
		if ( ! is_array( $logs ) ) {
			return array();
		}

		$logs = array_reverse( $logs );
		return array_slice( $logs, 0, 30 );
	}

	// Step 2d: show the test result summary.
	private function render_test_result_notice( $test_result ) {
		if ( ! is_array( $test_result ) ) {
			return;
		}

		$sent     = ! empty( $test_result['sent'] ) ? 'yes' : 'no';
		$provider = $test_result['provider'] ?? '';
		$status   = (string) ( $test_result['status'] ?? '' );
		$from     = $test_result['from_email'] ?? '';
		$error    = $test_result['error'] ?? '';
		if ( is_array( $error ) ) {
			$error = wp_json_encode( $error );
		}
		$error = (string) $error;

		echo '<div class="notice notice-info"><p>';
		echo 'Test sent: <strong>' . esc_html( $sent ) . '</strong> | Provider: <strong>' . esc_html( $provider ) . '</strong> | Status: <strong>' . esc_html( $status ) . '</strong> | From: <strong>' . esc_html( $from ) . '</strong>';
		if ( $error !== '' ) {
			echo ' | Error: <strong>' . esc_html( $error ) . '</strong>';
		}
		echo '</p></div>';
	}

	// Step 2e: show the SendGrid test form.
	private function render_test_form() {
		echo '<form method="post" style="margin:12px 0 18px 0;">';
		wp_nonce_field( 'adaire_send_test' );
		echo '<input type="hidden" name="adaire_send_test" value="1" />';
		echo '<button type="submit" class="button button-primary">Send Test Email</button>';
		echo '<p class="description">Sends a SendGrid test email to ADAIRE_FEEDBACK_EMAIL. Remove this page in production.</p>';
		echo '</form>';
	}

	// Step 2f: render the logs table.
	private function render_log_table( array $logs ) {
		if ( ! $logs ) {
			echo '<p>No logs found.</p>';
			return;
		}

		echo '<table class="widefat striped">';
		echo '<thead><tr>';
		echo '<th>Date</th><th>Site</th><th>Reason</th><th>Sent</th><th>Provider</th><th>Status</th><th>From</th><th>To</th><th>Error</th>';
		echo '</tr></thead><tbody>';

		foreach ( $logs as $row ) {
			$date     = $row['date'] ?? '';
			$site     = $row['site'] ?? '';
			$reason   = $row['reason'] ?? '';
			$sent     = ! empty( $row['mail_sent'] ) ? 'yes' : 'no';
			$provider = $row['mail_provider'] ?? 'sendgrid';
			$status   = (string) ( $row['mail_status'] ?? '' );
			$from     = $row['from_email'] ?? '';
			$to       = $row['to_email'] ?? '';
			$error    = $row['mail_error'] ?? '';
			if ( is_array( $error ) ) {
				$error = wp_json_encode( $error );
			}
			$error = (string) $error;

			echo '<tr>';
			echo '<td>' . esc_html( $date ) . '</td>';
			echo '<td>' . esc_html( $site ) . '</td>';
			echo '<td>' . esc_html( $reason ) . '</td>';
			echo '<td>' . esc_html( $sent ) . '</td>';
			echo '<td>' . esc_html( $provider ) . '</td>';
			echo '<td>' . esc_html( $status ) . '</td>';
			echo '<td>' . esc_html( $from ) . '</td>';
			echo '<td>' . esc_html( $to ) . '</td>';
			echo '<td style="max-width:520px;white-space:pre-wrap;">' . esc_html( $error ) . '</td>';
			echo '</tr>';
		}

		echo '</tbody></table>';
	}
}
