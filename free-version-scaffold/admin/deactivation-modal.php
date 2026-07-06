<?php
if (!defined('ABSPATH')) {
    exit;
}

class Adaire_Deactivation_Modal
{
    private static $instance = null;
    private const DEFAULT_FEEDBACK_EMAIL = 'support@adaire.com';

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
            'ajaxUrl'    => admin_url('admin-ajax.php'),
            'nonce'      => wp_create_nonce('adaire_deactivation_nonce'),
            'adminEmail' => sanitize_email(get_option('admin_email', '')),
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

                <div class="adaire-modal-header" style="background:linear-gradient(135deg,#E8272A 0%,#c01f22 100%);padding:22px 24px 18px;color:#fff;position:relative;border-radius:16px 16px 0 0;">
                    <button type="button" class="adaire-modal-close" aria-label="<?php esc_attr_e( 'Close', 'adaire-blocks' ); ?>" style="position:absolute;top:12px;right:12px;width:26px;height:26px;border:none;background:rgba(255,255,255,0.18);color:#fff;border-radius:50%;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;">&#x2715;</button>
                    <div class="adaire-modal-header-inner" style="display:flex;align-items:center;gap:12px;">
                        <div class="adaire-modal-icon" style="width:38px;height:38px;background:rgba(255,255,255,0.18);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                        </div>
                        <div>
                            <h3 style="margin:0 0 2px;font-size:16px;font-weight:700;color:#fff;"><?php esc_html_e( 'Before you go…', 'adaire-blocks' ); ?></h3>
                            <p style="margin:0;font-size:12.5px;color:rgba(255,255,255,0.82);"><?php esc_html_e( 'Your feedback helps us build better blocks for everyone.', 'adaire-blocks' ); ?></p>
                        </div>
                    </div>
                </div>

                <div class="adaire-modal-body">

                    <div class="adaire-modal-form-area">
                        <form id="adaire-deactivation-form">

                            <p><?php esc_html_e( 'Why are you deactivating? (optional)', 'adaire-blocks' ); ?></p>

                            <div class="adaire-reasons-list">
                                <label>
                                    <input type="radio" name="adaire_reason" value="no_longer_needed">
                                    <?php esc_html_e( 'No longer needed', 'adaire-blocks' ); ?>
                                </label>
                                <label>
                                    <input type="radio" name="adaire_reason" value="found_better">
                                    <?php esc_html_e( 'Found a better plugin', 'adaire-blocks' ); ?>
                                </label>
                                <label>
                                    <input type="radio" name="adaire_reason" value="not_working">
                                    <?php esc_html_e( 'Not working as expected', 'adaire-blocks' ); ?>
                                </label>
                                <label>
                                    <input type="radio" name="adaire_reason" value="missing_feature">
                                    <?php esc_html_e( 'Missing a feature I need', 'adaire-blocks' ); ?>
                                </label>
                                <label>
                                    <input type="radio" name="adaire_reason" value="too_complex">
                                    <?php esc_html_e( 'Too complex / hard to use', 'adaire-blocks' ); ?>
                                </label>
                                <label>
                                    <input type="radio" name="adaire_reason" value="temporary">
                                    <?php esc_html_e( 'Temporary deactivation', 'adaire-blocks' ); ?>
                                </label>
                                <label>
                                    <input type="radio" name="adaire_reason" value="other">
                                    <?php esc_html_e( 'Other', 'adaire-blocks' ); ?>
                                </label>
                            </div>

                            <div class="adaire-followup" style="display:none;">
                                <textarea id="adaire-deactivation-details" rows="3" placeholder=""></textarea>
                            </div>

                            <div class="adaire-field">
                                <label for="adaire-deactivation-email"><?php esc_html_e( 'Email (optional — so we can follow up)', 'adaire-blocks' ); ?></label>
                                <input type="email" id="adaire-deactivation-email" placeholder="you@example.com">
                            </div>

                            <div class="adaire-modal-btns">
                                <button type="submit" class="button button-primary adaire-submit-btn"><?php esc_html_e( 'Submit &amp; Deactivate', 'adaire-blocks' ); ?></button>
                                <button type="button" class="button adaire-skip-btn"><?php esc_html_e( 'Skip', 'adaire-blocks' ); ?></button>
                            </div>

                        </form>
                    </div>

                    <div class="adaire-modal-success" style="display:none;">
                        <div class="adaire-success-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <h4><?php esc_html_e( 'Thanks for the feedback!', 'adaire-blocks' ); ?></h4>
                        <p><?php esc_html_e( 'We\'ll use it to make Guten-Blocks better. See you next time.', 'adaire-blocks' ); ?></p>
                    </div>

                </div><!-- .adaire-modal-body -->
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

        $subject = 'Guten-Blocks Deactivation Feedback';
        $message = $this->build_feedback_message($feedback);

        $send_result = $this->send_feedback_email($feedback_recipient, $subject, $message, $feedback);
        $this->log_feedback_attempt($feedback, $send_result, $feedback_recipient);

        // Always return success — deactivation proceeds regardless of email delivery.
        // The attempt is logged to adaire_deact_log for later review if mail fails.
        wp_send_json_success(['sent' => $send_result['sent']]);
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
            'A user has deactivated the Guten-Blocks Free plugin.',
            '',
            'Site: ' . $feedback['site'],
            'Reason: ' . $reason_text,
            'Details: ' . $details_text,
            'User Email: ' . $email_text,
        ]);
    }

    // Step 2c: send feedback via Adaire webhook (SendGrid on our end, no key in plugin).
    private function send_feedback_email($recipient, $subject, $message, array $feedback)
    {
        $response = wp_remote_post( 'https://adaire.com/feedback-handler.php', [
            'timeout' => 10,
            'body'    => [
                'token'   => 'gb-feedback-k7x2m9p4',
                'reason'  => $feedback['reason']  ?? '',
                'details' => $feedback['details'] ?? '',
                'email'   => $feedback['email']   ?? '',
                'site'    => $feedback['site']    ?? home_url(),
            ],
        ] );

        $sent = ! is_wp_error( $response ) && (int) wp_remote_retrieve_response_code( $response ) === 200;

        return [
            'sent'     => $sent,
            'provider' => 'adaire-webhook',
            'error'    => $sent ? null : ( is_wp_error( $response ) ? $response->get_error_message() : 'Webhook returned HTTP ' . wp_remote_retrieve_response_code( $response ) ),
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
