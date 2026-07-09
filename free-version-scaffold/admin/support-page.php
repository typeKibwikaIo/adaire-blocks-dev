<?php
/**
 * Support Page
 * Simple in-admin support/contact screen for Guten-Blocks users.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add Support submenu to the Guten-Blocks admin menu
 */
function adaire_blocks_add_support_menu() {
    add_submenu_page(
        'adaire-blocks-settings',
        __('Support', 'adaire-blocks'),
        __('Support', 'adaire-blocks'),
        'manage_options',
        'adaire-blocks-support',
        'adaire_blocks_support_page'
    );
}
add_action('admin_menu', 'adaire_blocks_add_support_menu');

/**
 * Support page HTML — kept intentionally simple: heading, description, image.
 */
function adaire_blocks_support_page() {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized access');
    }
    ?>
    <div class="wrap adaire-support-page">
        <style>
            .adaire-support-page { max-width: 720px; }
            .adaire-support-page h1 { font-size: 28px; margin-bottom: 12px; }
            .adaire-support-page .adaire-support-desc { font-size: 15px; line-height: 1.7; color: #3c434a; max-width: 620px; margin-bottom: 28px; }
            .adaire-support-page .adaire-support-desc a { font-weight: 600; text-decoration: none; }
            .adaire-support-page .adaire-support-image { width: 100%; max-width: 620px; height: auto; border-radius: 12px; box-shadow: 0 10px 26px rgba(15, 23, 42, .08); display: block; }
        </style>

        <h1><?php esc_html_e('Got a question about using Guten-Blocks?', 'adaire-blocks'); ?></h1>

        <p class="adaire-support-desc">
            <?php
            printf(
                /* translators: %s: support email address link */
                esc_html__('This is the place to start. Reach out to our support team directly at %s and we\'ll get back to you as soon as we can.', 'adaire-blocks'),
                '<a href="mailto:support@adaire.com">support@adaire.com</a>'
            );
            ?>
        </p>

        <img
            class="adaire-support-image"
            src="https://adaire.com/wp-content/uploads/2026/04/Scenarios-5-1-1.png"
            alt="<?php esc_attr_e('The Adaire support team', 'adaire-blocks'); ?>"
        />
    </div>
    <?php
}
