<?php
if (!defined('ABSPATH')) {
    exit;
}

class Adaire_Deactivation_Modal
{
    private static $instance = null;
    private const DEFAULT_FEEDBACK_EMAIL = 'simeonlleni@gmail.com';

    // Step 0: singleton access for the modal controller.
    public static function get_instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    // Step 0: register hooks for assets, UI, and AJAX.
    private function __construct()
    {
        add_action('admin_footer', [$this, 'render_modal']);
        add_action('admin_enqueue_scripts', [$this, 'load_modal_assets']);
        add_action('wp_ajax_adaire_deactivation_feedback', [$this, 'handle_feedback']);
    }

    // Step 1: load assets for the plugins page only.
    public function load_modal_assets($admin_hook)
    {
        if ($admin_hook !== 'plugins.php') {
            return;
        }

        wp_enqueue_style(
            'adaire-deactivation-modal',
            ADAIRE_BLOCKS_PLUGIN_URL . 'admin/css/deactivation-modal.css',
            [],
            ADAIRE_BLOCKS_VERSION
        );
        wp_enqueue_script(
            'adaire-deactivation-modal',
            ADAIRE_BLOCKS_PLUGIN_URL . 'admin/js/deactivation-modal.js',
            ['jquery'],
            ADAIRE_BLOCKS_VERSION,
            true
        );

        wp_localize_script('adaire-deactivation-modal', 'adaireDeactivation', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('adaire_deactivation_nonce'),
        ]);
    }

    // Step 1: render the feedback modal markup on the plugins page.
    public function render_modal()
    {
        global $pagenow;
        if ($pagenow !== 'plugins.php') {
            return;
        }
        ?>
        <div id="adaire-deactivation-modal" class="adaire-modal-overlay" style="display:none;">
            <div class="adaire-modal-container">
                <h3>Quick feedback</h3>
                <p>We'd love to know why you're deactivating....................................... It helps us improve the blocks.</p>

                <form id="adaire-deactivation-form">
                    <div class="adaire-reasons-list">
                        <label><input type="radio" name="adaire_reason" value="no_longer_needed"> No longer needed</label>
                        <label><input type="radio" name="adaire_reason" value="found_better"> Found a better plugin</label>
                        <label><input type="radio" name="adaire_reason" value="not_working"> Not working as expected</label>
                        <label><input type="radio" name="adaire_reason" value="temporary"> Temporary deactivation</label>
                        <label><input type="radio" name="adaire_reason" value="other"> Other</label>
                    </div>

                    <div id="adaire-other-details" style="display:none;">
                        <textarea id="adaire-deactivation-details" placeholder="Tell us more..."></textarea>
                    </div>

                    <div class="adaire-field">
                        <label>Your email (optional)</label>
                        <input type="email" id="adaire-deactivation-email" placeholder="you@example.com">
                    </div>

                    <div class="adaire-modal-btns">
                        <button type="submit" class="button button-primary adaire-submit-btn">Submit & Deactivate</button>
                        <button type="button" class="button adaire-skip-btn">Skip</button>
                    </div>
                </form>
            </div>
        </div>
        <?php
    }

    // Step 2: receive feedback, send email, and log the result.
    public function handle_feedback()
    {
        check_ajax_referer('adaire_deactivation_nonce', 'nonce');

        if (!current_user_can('activate_plugins') && !current_user_can('manage_network_plugins')) {
            wp_send_json_error(['message' => 'Unauthorized'], 403);
        }

        $feedback = $this->sanitize_feedback_payload($_POST);
        $default_recipient = defined('ADAIRE_FEEDBACK_EMAIL') ? ADAIRE_FEEDBACK_EMAIL : self::DEFAULT_FEEDBACK_EMAIL;
        $feedback_recipient = apply_filters('adaire_blocks_deactivation_feedback_to', $default_recipient, $feedback);

        $subject = 'Adaire Blocks Deactivation Feedback';
        $message = $this->build_feedback_message($feedback);

        $send_result = $this->send_feedback_email($feedback_recipient, $subject, $message, $feedback['email']);
        $this->log_feedback_attempt($feedback, $send_result, $feedback_recipient);

        if (!$send_result['sent']) {
            $payload = ['message' => 'Failed to send feedback email'];
            if (!empty($send_result['error'])) {
                $payload['error'] = $send_result['error'];
            }
            wp_send_json_error($payload, 500);
        }

        wp_send_json_success(['sent' => true]);
    }

    // Step 2a: sanitize incoming feedback fields.
    private function sanitize_feedback_payload(array $raw_feedback_input)
    {
        return [
            'reason' => sanitize_text_field($raw_feedback_input['reason'] ?? ''),
            'email' => sanitize_email($raw_feedback_input['email'] ?? ''),
            'details' => sanitize_textarea_field($raw_feedback_input['details'] ?? ''),
            'site' => $this->get_public_plugin_url(),
        ];
    }

    // Step 2b: build the plain-text email body.
    private function build_feedback_message(array $feedback)
    {
        $reason_text = $feedback['reason'] ?: 'Not provided';
        $details_text = $feedback['details'] ?: 'Not provided';
        $email_text = $feedback['email'] ?: 'Not provided';

        return implode("\n", [
            'A user has deactivated the Adaire Blocks Free plugin.',
            '',
            'Site: ' . $feedback['site'],
            'Reason: ' . $reason_text,
            'Details: ' . $details_text,
            'User Email: ' . $email_text,
        ]);
    }

    // Step 2c: send feedback via SendGrid.
    private function send_feedback_email($recipient, $subject, $message, $reply_to)
    {
        $reply_to_email = $reply_to && is_email($reply_to) ? $reply_to : null;

        if (!function_exists('adaire_blocks_get_sendgrid_api_key') || !adaire_blocks_get_sendgrid_api_key()) {
            return [
                'sent' => false,
                'provider' => 'sendgrid',
                'error' => 'SendGrid is not configured',
            ];
        }

        $sendgrid_result = adaire_blocks_send_via_sendgrid($recipient, $subject, $message, $reply_to_email);
        return [
            'sent' => (bool) ($sendgrid_result['sent'] ?? false),
            'provider' => $sendgrid_result['provider'] ?? 'sendgrid',
            'error' => $sendgrid_result['error'] ?? null,
        ];
    }

    // Step 2d: store a log entry for troubleshooting.
    private function log_feedback_attempt(array $feedback, array $send_result, $feedback_recipient)
    {
        $existing_logs = get_option('adaire_deact_log', []);
        if (!is_array($existing_logs)) {
            $existing_logs = [];
        }

        $from_email = get_option('admin_email');
        if (!$from_email || !is_email($from_email)) {
            $from_email = 'wordpress@example.com';
        }

        $existing_logs[] = [
            'date' => current_time('mysql'),
            'reason' => $feedback['reason'],
            'email' => $feedback['email'],
            'details' => $feedback['details'],
            'site' => $feedback['site'],
            'mail_sent' => (bool) ($send_result['sent'] ?? false),
            'mail_provider' => $send_result['provider'] ?? 'sendgrid',
            'mail_status' => $send_result['status'] ?? null,
            'mail_error' => $send_result['error'] ?? null,
            'to_email' => is_array($feedback_recipient) ? implode(', ', $feedback_recipient) : (string) $feedback_recipient,
            'from_email' => $from_email,
        ];

        update_option('adaire_deact_log', $existing_logs);
    }

    // Step 2e: get the public plugin URL (WordPress.org listing).
    private function get_public_plugin_url()
    {
        if (!function_exists('get_plugin_data')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $plugin_data = get_plugin_data(ADAIRE_BLOCKS_PLUGIN_FILE, false, false);
        return $plugin_data['PluginURI'] ?? '';
    }
}
