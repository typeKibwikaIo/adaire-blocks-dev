<?php
/**
 * GutenBlocks Deactivation Feedback Handler
 *
 * Upload this file to your server at:
 *   https://adaire.com/feedback-handler.php
 *
 * Set your SendGrid API key below — this file never ships in the plugin.
 */

define( 'ADAIRE_SENDGRID_API_KEY', 'YOUR_SENDGRID_API_KEY_HERE' );
define( 'ADAIRE_FEEDBACK_TOKEN',   'gb-feedback-k7x2m9p4' );
define( 'ADAIRE_FEEDBACK_TO',      'support@adaire.com' );
define( 'ADAIRE_FEEDBACK_FROM',    'noreply@adaire.com' );

// -------------------------------------------------------------------------

if ( $_SERVER['REQUEST_METHOD'] !== 'POST' ) {
    http_response_code( 405 );
    exit( 'Method Not Allowed' );
}

$token = trim( $_POST['token'] ?? '' );
if ( ! hash_equals( ADAIRE_FEEDBACK_TOKEN, $token ) ) {
    http_response_code( 403 );
    exit( 'Forbidden' );
}

$reason  = sanitize( $_POST['reason']  ?? 'Not provided' );
$details = sanitize( $_POST['details'] ?? '' );
$email   = sanitize( $_POST['email']   ?? '' );
$site    = sanitize( $_POST['site']    ?? 'Not provided' );

$lines = [
    'A GutenBlocks user has deactivated the free plugin.',
    '',
    'Site:    ' . $site,
    'Reason:  ' . ( $reason  ?: 'Not provided' ),
    'Details: ' . ( $details ?: 'Not provided' ),
    'Email:   ' . ( $email   ?: 'Not provided' ),
    '',
    'Sent: ' . gmdate( 'Y-m-d H:i:s' ) . ' UTC',
];
$body = implode( "\n", $lines );

$payload = [
    'personalizations' => [
        [
            'to'      => [ [ 'email' => ADAIRE_FEEDBACK_TO ] ],
            'subject' => 'GutenBlocks Deactivation Feedback',
        ],
    ],
    'from'    => [ 'email' => ADAIRE_FEEDBACK_FROM, 'name' => 'GutenBlocks' ],
    'content' => [ [ 'type' => 'text/plain', 'value' => $body ] ],
];

if ( filter_var( $email, FILTER_VALIDATE_EMAIL ) ) {
    $payload['reply_to'] = [ 'email' => $email ];
}

$ch = curl_init( 'https://api.sendgrid.com/v3/mail/send' );
curl_setopt_array( $ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . ADAIRE_SENDGRID_API_KEY,
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode( $payload ),
] );

$response = curl_exec( $ch );
$status   = (int) curl_getinfo( $ch, CURLINFO_HTTP_CODE );
$curl_err = curl_error( $ch );
curl_close( $ch );

if ( $status >= 200 && $status < 300 ) {
    http_response_code( 200 );
    echo json_encode( [ 'ok' => true ] );
} else {
    http_response_code( 500 );
    echo json_encode( [ 'ok' => false, 'status' => $status, 'error' => $curl_err ?: substr( $response, 0, 200 ) ] );
}

// -------------------------------------------------------------------------

function sanitize( $value ) {
    return htmlspecialchars( strip_tags( trim( (string) $value ) ), ENT_QUOTES, 'UTF-8' );
}
