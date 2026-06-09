<?php
if (!defined('ABSPATH')) {
    exit;
}

// Step 0: read the SendGrid API key from config.
function adaire_blocks_get_sendgrid_api_key()
{
    if (defined('ADAIRE_SENDGRID_API_KEY') && is_string(ADAIRE_SENDGRID_API_KEY) && ADAIRE_SENDGRID_API_KEY !== '') {
        return ADAIRE_SENDGRID_API_KEY;
    }

    $env_key = getenv('SENDGRID_API_KEY');
    if (is_string($env_key) && $env_key !== '') {
        return $env_key;
    }

    return null;
}

// Step 1: send a single email via SendGrid.
function adaire_blocks_send_via_sendgrid($to, $subject, $message, $reply_to = null)
{
    $api_key = adaire_blocks_get_sendgrid_api_key();
    if (!$api_key) {
        return [
            'sent' => false,
            'provider' => 'sendgrid',
            'status' => null,
            'error' => 'Missing SENDGRID_API_KEY',
            'from_email' => null,
        ];
    }

    $from_email = get_option('admin_email');
    if (!$from_email || !is_email($from_email)) {
        $from_email = 'wordpress@example.com';
    }
    $from_email = apply_filters('adaire_blocks_deactivation_feedback_from', $from_email, []);
    $from_name = apply_filters('adaire_blocks_deactivation_feedback_from_name', 'Adaire Blocks', []);

    $payload = [
        'personalizations' => [
            [
                'to' => is_array($to) ? array_map(fn($t) => ['email' => $t], $to) : [['email' => $to]],
                'subject' => $subject,
            ],
        ],
        'from' => [
            'email' => $from_email,
            'name' => $from_name,
        ],
        'content' => [
            [
                'type' => 'text/plain',
                'value' => $message,
            ],
        ],
    ];
    if ($reply_to && is_email($reply_to)) {
        $payload['reply_to'] = ['email' => $reply_to];
    }

    $response = wp_remote_post('https://api.sendgrid.com/v3/mail/send', [
        'timeout' => 15,
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type' => 'application/json',
        ],
        'body' => wp_json_encode($payload),
    ]);

    if (is_wp_error($response)) {
        return [
            'sent' => false,
            'provider' => 'sendgrid',
            'status' => null,
            'error' => $response->get_error_message(),
            'from_email' => $from_email,
            'message_id' => null,
        ];
    }

    $status = (int) wp_remote_retrieve_response_code($response);
    $body = (string) wp_remote_retrieve_body($response);

    if ($status >= 200 && $status < 300) {
        return [
            'sent' => true,
            'provider' => 'sendgrid',
            'status' => $status,
            'error' => null,
            'from_email' => $from_email,
        ];
    }

    return [
        'sent' => false,
        'provider' => 'sendgrid',
        'status' => $status,
        'error' => substr($body, 0, 800) ?: ('HTTP ' . $status),
        'from_email' => $from_email,
    ];
}
