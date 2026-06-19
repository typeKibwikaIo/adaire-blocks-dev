<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Adaire_Welcome_Screen {

    public static function register() {
        add_action( 'admin_menu', array( __CLASS__, 'add_menu_page' ) );
        add_action( 'admin_menu', array( __CLASS__, 'move_to_top' ), 999 );
        add_action( 'wp_ajax_adaire_create_starter_page', array( __CLASS__, 'create_starter_page' ) );
        add_action( 'admin_init', array( __CLASS__, 'maybe_redirect_after_activation' ) );
    }

    /**
     * Called from the plugin's activation hook (adaire_blocks_activate() in
     * adaire-blocks.php). Sets a short-lived transient that
     * maybe_redirect_after_activation() picks up on the very next admin
     * request to send the user straight to this screen.
     *
     * A transient (rather than redirecting directly inside the activation
     * hook) is the standard WP pattern here: the activation hook itself
     * runs before WordPress has finished the activation request, and firing
     * a redirect from inside it gets clobbered by WordPress's own redirect
     * back to the plugins list.
     */
    public static function queue_activation_redirect() {
        set_transient( 'adaire_blocks_activation_redirect', true, MINUTE_IN_SECONDS );
    }

    public static function maybe_redirect_after_activation() {
        if ( ! get_transient( 'adaire_blocks_activation_redirect' ) ) {
            return;
        }

        delete_transient( 'adaire_blocks_activation_redirect' );

        // Skip the redirect for bulk activation, network activation, and
        // AJAX/REST requests so it only fires for a normal single-plugin
        // "Activate" click in wp-admin.
        if (
            wp_doing_ajax() ||
            ( is_multisite() && is_network_admin() ) ||
            isset( $_GET['activate-multi'] ) ||
            ! current_user_can( 'manage_options' )
        ) {
            return;
        }

        wp_safe_redirect( admin_url( 'admin.php?page=adaire-blocks-welcome' ) );
        exit;
    }

    public static function add_menu_page() {
        add_submenu_page(
            'adaire-blocks-settings',
            __( 'Welcome to GutenBlocks', 'adaire-blocks' ),
            __( 'Welcome / Quick Start', 'adaire-blocks' ),
            'manage_options',
            'adaire-blocks-welcome',
            array( __CLASS__, 'render' )
        );
    }

    public static function move_to_top() {
        global $submenu;

        $parent = 'adaire-blocks-settings';

        if ( empty( $submenu[ $parent ] ) ) {
            return;
        }

        $welcome_item = null;
        $welcome_key  = null;

        foreach ( $submenu[ $parent ] as $key => $item ) {
            if ( isset( $item[2] ) && $item[2] === 'adaire-blocks-welcome' ) {
                $welcome_item = $item;
                $welcome_key  = $key;
                break;
            }
        }

        if ( $welcome_item === null ) {
            return;
        }

        unset( $submenu[ $parent ][ $welcome_key ] );
        array_unshift( $submenu[ $parent ], $welcome_item );
    }

    public static function create_starter_page() {
        check_ajax_referer( 'adaire_create_page', 'nonce' );

        if ( ! current_user_can( 'edit_pages' ) ) {
            wp_send_json_error( array( 'message' => __( 'Insufficient permissions.', 'adaire-blocks' ) ) );
        }

        $pattern_slug = sanitize_text_field( wp_unslash( $_POST['pattern'] ?? 'adaire-blocks/landing-page' ) );

        $registry = WP_Block_Patterns_Registry::get_instance();
        $pattern  = $registry->get_registered( $pattern_slug );

        if ( ! $pattern ) {
            wp_send_json_error( array( 'message' => __( 'Pattern not found.', 'adaire-blocks' ) ) );
        }

        $page_id = wp_insert_post( array(
            'post_type'    => 'page',
            'post_status'  => 'draft',
            'post_title'   => $pattern['title'],
            'post_content' => $pattern['content'],
        ), true );

        if ( is_wp_error( $page_id ) || empty( $page_id ) ) {
            $message = is_wp_error( $page_id ) ? $page_id->get_error_message() : __( 'Failed to create page.', 'adaire-blocks' );
            wp_send_json_error( array( 'message' => $message ) );
        }

        $edit_url = get_edit_post_link( $page_id, 'raw' );

        if ( empty( $edit_url ) ) {
            wp_send_json_error( array( 'message' => __( 'Page created but could not get edit URL.', 'adaire-blocks' ) ) );
        }

        wp_send_json_success( array( 'edit_url' => $edit_url ) );
    }

    /**
     * Tiny inline-SVG icon set used throughout this screen instead of
     * emoji, so the page reads as a real icon system rather than
     * pictographic glyphs. Every icon shares a 24x24 viewBox, a single
     * `currentColor` stroke, and rounded caps/joins for consistent
     * weight — colour and size are controlled entirely by the wrapping
     * element's CSS (`color` + `width`/`height`).
     */
    private static function icon( $name ) {
        $icons = array(
            'sparkle'        => '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.7 5.6L19 9l-5.3 1.4L12 16l-1.7-5.6L5 9l5.3-1.4L12 2z"/></svg>',
            'plus'           => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
            'rocket'         => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c2.5 1.5 4 4.5 4 8 0 2-1 4-2 5l-2 2-2-2c-1-1-2-3-2-5 0-3.5 1.5-6.5 4-8z"/><path d="M9 14l-3 1 1-3"/><path d="M15 14l3 1-1-3"/><circle cx="12" cy="9" r="1.4"/></svg>',
            'users'          => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c2.4.3 4.5 2.4 4.5 5.8"/></svg>',
            'settings'       => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M3 12h2.5M18.5 12H21M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/></svg>',
            'file-text'      => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 15.5h6M9 8.5h2"/></svg>',
            'mail'           => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></svg>',
            'layout-top'     => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><line x1="3.5" y1="9" x2="20.5" y2="9"/></svg>',
            'layout-bottom'  => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><line x1="3.5" y1="15" x2="20.5" y2="15"/></svg>',
            'grid'           => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
            'book-open'      => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5c-1.5-1-4-1.5-6-1v12.5c2-.4 4.5 0 6 1 1.5-1 4-1.4 6-1V5.5c-2-.5-4.5 0-6 1z"/><path d="M12 6.5v12"/></svg>',
            'blocks'         => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="9.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="15.5" width="7" height="5" rx="1.5"/></svg>',
            'message-circle' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-1.9 5.4c-1.6 2-4 3.1-6.6 3.1-1 0-2-.2-2.9-.5L4 21l1.5-4.2A8.3 8.3 0 013 11.5 8.5 8.5 0 0112 3a8.5 8.5 0 019 8.5z"/></svg>',
            'check-circle'   => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.4 2.4 4.6-5.4"/></svg>',
            'info'           => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.7" r="0.9" fill="currentColor" stroke="none"/></svg>',
            'chevron-left'   => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
            'chevron-right'  => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
            'brand-mark'     => '<svg viewBox="0 0 1000 1000" fill="currentColor"><path d="M408.523 321.353H163.388V393.981H401.889V483.583H195.142C156 483.583 125 516.017 125 556.18V645.814C125 685.978 156 718.411 195.142 718.411H401.889V645.814H201.776V556.18H401.889V645.814H477.941V393.981C477.941 353.818 446.941 321.353 408.523 321.353Z"/><path d="M603.247 267.692V357.441H801.292C842.251 357.441 875 389.932 875 429.647V643.346C875 686.658 838.511 718.412 793.842 718.412H592.057C553.348 718.412 522.059 688.102 522.059 650.569V189C566.728 189 603.217 224.381 603.217 267.692H603.247ZM603.247 650.569H793.842V429.647H603.247V650.569Z"/></svg>',
            'sync'           => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0115.4-6.4L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-15.4 6.4L3 16"/><path d="M3 21v-5h5"/></svg>',
            'arrow-left'     => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="11 18 5 12 11 6"/></svg>',
            'external-link'  => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4L10 14"/><path d="M18 13.5V19a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 19V8A1.5 1.5 0 016 6.5h5.5"/></svg>',
        );

        return isset( $icons[ $name ] ) ? $icons[ $name ] : '';
    }

    public static function render() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'Unauthorized', 'adaire-blocks' ) );
        }

        $nonce     = wp_create_nonce( 'adaire_create_page' );
        $ajax_url  = admin_url( 'admin-ajax.php' );
        $docs_url  = 'https://adaire.digital/docs/';
        $support_url = 'https://adaire.digital/support/';

        $is_block_theme = function_exists( 'wp_is_block_theme' ) && wp_is_block_theme();
        $theme_name     = wp_get_theme()->get( 'Name' );
        $theme_slug     = get_stylesheet();
        $header_url     = admin_url( 'site-editor.php?postType=wp_template_part&postId=' . rawurlencode( $theme_slug . '//header' ) );
        $footer_url     = admin_url( 'site-editor.php?postType=wp_template_part&postId=' . rawurlencode( $theme_slug . '//footer' ) );
        $all_parts_url  = admin_url( 'site-editor.php?path=%2Fwp_template_part%2Fall' );

        // Real sidebar/quick-action destinations — everything here is an
        // existing, navigable admin screen (no fabricated features).
        $settings_url   = admin_url( 'admin.php?page=adaire-blocks-settings' );
        $migration_url  = admin_url( 'admin.php?page=adaire-blocks-migration' );
        $themes_url     = admin_url( 'themes.php' );
        $exit_url       = admin_url();

        // Real bundled screenshots of GutenBlocks blocks in the editor —
        // used in place of stock photography or inline illustration.
        $hero_image_url      = plugins_url( 'images/welcome-hero.png', __FILE__ );
        $showcase_image_url  = plugins_url( 'images/welcome-showcase.png', __FILE__ );

        $templates = array(
            array(
                'slug'        => 'adaire-blocks/landing-page',
                'icon'        => 'rocket',
                'title'       => __( 'Landing Page', 'adaire-blocks' ),
                'description' => __( 'Hero, features, testimonial & CTA.', 'adaire-blocks' ),
                'homepage'    => true,
            ),
            array(
                'slug'        => 'adaire-blocks/about-page',
                'icon'        => 'users',
                'title'       => __( 'About Page', 'adaire-blocks' ),
                'description' => __( 'Hero, about section, timeline & testimonial.', 'adaire-blocks' ),
                'homepage'    => false,
            ),
            array(
                'slug'        => 'adaire-blocks/services-page',
                'icon'        => 'settings',
                'title'       => __( 'Services Page', 'adaire-blocks' ),
                'description' => __( 'Hero, info grid & pricing table.', 'adaire-blocks' ),
                'homepage'    => false,
            ),
            array(
                'slug'        => 'adaire-blocks/blog-landing',
                'icon'        => 'file-text',
                'title'       => __( 'Blog Landing', 'adaire-blocks' ),
                'description' => __( 'Hero with a posts grid.', 'adaire-blocks' ),
                'homepage'    => false,
            ),
            array(
                'slug'        => 'adaire-blocks/contact-page',
                'icon'        => 'mail',
                'title'       => __( 'Contact Page', 'adaire-blocks' ),
                'description' => __( 'Hero with a two-column contact layout.', 'adaire-blocks' ),
                'homepage'    => false,
            ),
        );
        ?>
        <div class="wrap adaire-wrap-shell">
        <style>
            .adaire-welcome * { box-sizing: border-box; }
            .adaire-welcome { max-width: 980px; margin: 0 auto; padding: 36px 40px 64px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
            .adaire-welcome svg { display: block; }

            /* ---------- App shell: replace native wp-admin chrome on this screen ---------- */
            .adaire-wrap-shell { margin: 0 !important; max-width: none !important; }
            #wpadminbar,
            #adminmenumain,
            #adminmenuback,
            #adminmenuwrap,
            #wpfooter,
            .update-nag,
            .notice { display: none !important; }
            html.wp-toolbar { padding-top: 0 !important; }
            #wpcontent, #wpbody, #wpbody-content { margin-left: 0 !important; padding-left: 0 !important; padding-bottom: 0 !important; }
            #wpbody-content > div:not(.adaire-wrap-shell) { display: none !important; }

            .adaire-shell { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }

            /* ---------- Sidebar ---------- */
            .adaire-shell-sidebar { position: sticky; top: 0; height: 100vh; overflow-y: auto; background: #fff; border-right: 1px solid #e2e8f0; padding: 22px 16px; display: flex; flex-direction: column; flex-shrink: 0; }
            .adaire-shell-brand { display: flex; align-items: center; gap: 10px; padding: 4px 10px 22px; }
            .adaire-shell-brand-mark { width: 22px; height: 22px; color: #d5293f; flex-shrink: 0; }
            .adaire-shell-brand-mark svg { width: 100%; height: 100%; }
            .adaire-shell-brand-name { font-size: 14px; font-weight: 700; color: #0f172a; letter-spacing: -.2px; }
            .adaire-shell-nav { display: flex; flex-direction: column; gap: 2px; }
            .adaire-shell-link { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569; text-decoration: none; transition: background .15s ease, color .15s ease; }
            .adaire-shell-link svg { width: 16px; height: 16px; flex-shrink: 0; }
            .adaire-shell-link:hover { background: #f8fafc; color: #1e293b; text-decoration: none; }
            .adaire-shell-link.is-active { background: #fdf0f1; color: #b5233a; }
            .adaire-shell-nav-divider { height: 1px; background: #e2e8f0; margin: 14px 8px; }
            .adaire-shell-nav-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; color: #94a3b8; padding: 0 10px 6px; }
            .adaire-shell-link-ext { justify-content: space-between; }
            .adaire-shell-link-label { display: flex; align-items: center; gap: 10px; }
            .adaire-shell-ext-icon { display: inline-flex; width: 12px; height: 12px; color: #cbd5e1; flex-shrink: 0; }
            .adaire-shell-ext-icon svg { width: 100%; height: 100%; }
            .adaire-shell-spacer { flex: 1; }
            .adaire-shell-sidebar-foot { padding: 14px 10px 4px; border-top: 1px solid #e2e8f0; margin-top: 10px; }
            .adaire-shell-exit { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #94a3b8; text-decoration: none; margin-bottom: 8px; transition: color .15s ease; }
            .adaire-shell-exit svg { width: 13px; height: 13px; }
            .adaire-shell-exit:hover { color: #475569; text-decoration: none; }
            .adaire-shell-version { font-size: 11px; color: #cbd5e1; padding: 0 10px; }

            .adaire-shell-main { min-width: 0; overflow-x: hidden; }

            @media (max-width: 900px) {
                .adaire-shell { grid-template-columns: 1fr; }
                .adaire-shell-sidebar { position: relative; height: auto; flex-direction: row; align-items: center; overflow-x: auto; overflow-y: visible; border-right: none; border-bottom: 1px solid #e2e8f0; padding: 12px 14px; gap: 18px; }
                .adaire-shell-brand { padding: 0; }
                .adaire-shell-nav { flex-direction: row; }
                .adaire-shell-nav-divider, .adaire-shell-nav-label, .adaire-shell-spacer { display: none; }
                .adaire-shell-sidebar-foot { border-top: none; margin: 0; padding: 0; display: flex; align-items: center; }
                .adaire-shell-version { display: none; }
                .adaire-welcome { padding: 28px 20px 50px; }
            }

            /* ---------- Hero (two-column: copy + real screenshots) ---------- */
            .adaire-hero-grid { position: relative; z-index: 2; display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 44px; align-items: center; }
            .adaire-hero-visual { position: relative; }
            .adaire-hero-shot { position: relative; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 50px rgba(15,23,42,.18); border: 1px solid rgba(255,255,255,.4); transform: rotate(0.4deg); }
            .adaire-hero-shot img { display: block; width: 100%; height: auto; }
            .adaire-hero-shot-tag { position: absolute; left: 16px; bottom: 16px; display: inline-flex; align-items: center; gap: 6px; background: rgba(15,23,42,.78); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); color: #fff; font-size: 11px; font-weight: 600; padding: 7px 12px; border-radius: 999px; }
            .adaire-hero-shot-tag .adaire-pill-icon { color: #fda4af; }
            .adaire-hero-shot-float { position: absolute; top: -22px; right: -24px; width: 44%; border-radius: 10px; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,.22); border: 4px solid #fff; transform: rotate(-4deg); animation: adaire-float 7s ease-in-out infinite; }
            .adaire-hero-shot-float img { display: block; width: 100%; height: auto; }
            @media (max-width: 900px) { .adaire-hero-grid { grid-template-columns: 1fr; } .adaire-hero-shot-float { display: none; } }

            /* ---------- Icon system (replaces emoji) ---------- */
            .adaire-icon-badge { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px; background: #fdf0f1; color: #d5293f; flex-shrink: 0; transition: transform .25s ease, background .25s ease; }
            .adaire-icon-badge svg { width: 20px; height: 20px; }
            .adaire-template-card .adaire-icon-badge,
            .adaire-resource .adaire-icon-badge { margin-bottom: 12px; }
            .adaire-template-card:hover .adaire-icon-badge,
            .adaire-hf-card:hover .adaire-icon-badge,
            .adaire-resource:hover .adaire-icon-badge { transform: scale(1.12) rotate(-4deg); background: #fcdfe3; }
            .adaire-pill-icon { display: inline-flex; width: 13px; height: 13px; }
            .adaire-pill-icon svg { width: 100%; height: 100%; }
            .adaire-tip-icon, .adaire-note-icon { display: inline-flex; width: 18px; height: 18px; flex-shrink: 0; }
            .adaire-tip-icon svg, .adaire-note-icon svg { width: 100%; height: 100%; }
            .adaire-tip-icon { color: #15803d; }
            .adaire-note-icon { color: #94a3b8; margin-top: 1px; }
            .adaire-btn-icon { display: inline-flex; width: 13px; height: 13px; }
            .adaire-btn-icon svg { width: 100%; height: 100%; }

            /* ---------- Fade-in-on-scroll (scale + blur + translate — fade alone is not enough motion) ---------- */
            .adaire-fade { opacity: 0; transform: translateY(18px) scale(.97); filter: blur(6px); transition: opacity .6s ease, transform .6s ease, filter .6s ease; }
            .adaire-fade.is-visible { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }

            /* ---------- Hero ---------- */
            .adaire-hero { position: relative; overflow: hidden; border-radius: 20px; padding: 48px 44px; margin-bottom: 40px; text-align: left; background: #fafafa; background-image: radial-gradient(circle, #e2e8f0 1.4px, transparent 1.4px); background-size: 24px 24px; --adaire-glow-y: 20%; }
            .adaire-hero::before { content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(circle at 50% var(--adaire-glow-y, 20%), rgba(213,41,63,.10), transparent 60%); }
            .adaire-hero::after { content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: .035; mix-blend-mode: overlay; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
            .adaire-hero-shape { position: absolute; pointer-events: none; z-index: 1; }
            .adaire-hero-shape.circle { border: 1.5px solid #e2e8f0; border-radius: 50%; animation: adaire-float 7s ease-in-out infinite; }
            .adaire-hero-shape.dot { background: #cbd5e1; border-radius: 50%; animation: adaire-float 5s ease-in-out infinite; }
            .adaire-hero-shape.square { border: 1.5px solid #f4a0aa; border-radius: 10px; animation: adaire-float 8s ease-in-out infinite; }
            @keyframes adaire-float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-16px) rotate(6deg); } }
            @media (prefers-reduced-motion: reduce) { .adaire-hero-shape, .adaire-fade, .adaire-hero-inner, .adaire-btn-primary, .adaire-hero-shot-float { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; filter: none !important; } }

            .adaire-hero-inner { position: relative; z-index: 2; transition: transform .2s ease-out; }
            .adaire-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(253,240,241,.75); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); color: #b5233a; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 999px; margin-bottom: 20px; animation: adaire-pop .5s ease; }
            @keyframes adaire-pop { 0% { opacity: 0; transform: scale(.8); } 100% { opacity: 1; transform: scale(1); } }
            .adaire-hero-title { font-family: Georgia, 'Times New Roman', serif; font-weight: 600; font-size: 36px; line-height: 1.2; color: #0f172a; margin: 0 0 14px; }
            .adaire-hero-title .adaire-accent { color: #d5293f; }
            .adaire-hero-sub { font-size: 15px; color: #64748b; line-height: 1.6; margin: 0 0 28px; max-width: 460px; }
            .adaire-hero-actions { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-bottom: 22px; }

            .adaire-btn { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; padding: 12px 22px; cursor: pointer; border: none; transition: transform .2s ease, box-shadow .2s ease, background .2s ease, color .2s ease; }
            .adaire-btn-primary { position: relative; overflow: hidden; background: linear-gradient(135deg, #a01f2f 0%, #d5293f 100%); color: #fff; box-shadow: 0 4px 14px rgba(213,41,63,.25); animation: adaire-glow-pulse 2.6s ease-in-out infinite; }
            .adaire-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(213,41,63,.32); color: #fff; animation-play-state: paused; }
            @keyframes adaire-glow-pulse { 0%, 100% { box-shadow: 0 4px 14px rgba(213,41,63,.25); } 50% { box-shadow: 0 4px 22px rgba(213,41,63,.45); } }
            .adaire-ripple { position: absolute; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: rgba(255,255,255,.55); transform: scale(0); animation: adaire-ripple .6s ease-out; pointer-events: none; }
            @keyframes adaire-ripple { to { transform: scale(20); opacity: 0; } }
            .adaire-btn-arrow { display: inline-block; transition: transform .25s ease; }
            .adaire-btn-primary:hover .adaire-btn-arrow { transform: translateX(4px); }
            .adaire-btn-ghost { background: transparent; color: #475569; padding: 12px 4px; }
            .adaire-btn-ghost:hover { color: #1e293b; text-decoration: underline; }
            .adaire-hero-version { display: inline-block; font-size: 12px; color: #94a3b8; }

            /* ---------- Steps ---------- */
            .adaire-welcome-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .adaire-step { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
            .adaire-step:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(15,23,42,.06); border-color: #f4a0aa; }
            .adaire-step-num { width: 32px; height: 32px; background: #fdf0f1; color: #d5293f; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; margin-bottom: 12px; transition: transform .2s ease; }
            .adaire-step:hover .adaire-step-num { transform: scale(1.12); }
            .adaire-step h3 { font-size: 14px; margin: 0 0 6px; color: #1e293b; }
            .adaire-step p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }

            .adaire-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 4px; }
            .adaire-section-title { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 6px; }
            .adaire-section-subtitle { font-size: 13px; color: #64748b; margin: 0 0 20px; }

            /* ---------- Template slider ---------- */
            .adaire-slider-nav { display: flex; gap: 8px; margin-bottom: 20px; flex-shrink: 0; }
            .adaire-slider-btn { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; border: 1px solid #e2e8f0; background: rgba(255,255,255,.75); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); color: #475569; cursor: pointer; transition: background .2s ease, color .2s ease, border-color .2s ease, transform .15s ease; }
            .adaire-slider-btn svg { width: 16px; height: 16px; }
            .adaire-slider-btn:hover { background: #d5293f; color: #fff; border-color: #d5293f; transform: translateY(-1px); }
            .adaire-slider { overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; margin: 0 -4px 40px; padding: 4px; }
            .adaire-slider::-webkit-scrollbar { display: none; }
            .adaire-slider-track { display: flex; gap: 16px; }
            .adaire-template-card { flex: 0 0 250px; scroll-snap-align: start; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease; }
            .adaire-template-card:hover { transform: translateY(-4px); border-color: #f4a0aa; box-shadow: 0 12px 28px rgba(213,41,63,.14); }
            .adaire-template-card h3 { font-size: 14px; margin: 0 0 4px; color: #1e293b; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
            .adaire-template-card p { font-size: 12px; color: #64748b; margin: 0 0 14px; line-height: 1.4; min-height: 32px; }
            .adaire-template-card .adaire-home-badge { background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; text-transform: uppercase; letter-spacing: .3px; }
            .adaire-create-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; width: 100%; background: #d5293f; color: #fff; border: none; border-radius: 6px; padding: 8px 16px; font-size: 13px; cursor: pointer; text-decoration: none; transition: background .2s ease, transform .15s ease; }
            .adaire-create-btn:hover { background: #b5233a; color: #fff; transform: translateY(-1px); }
            .adaire-create-btn.loading { opacity: .75; pointer-events: none; transform: none; }
            .adaire-create-btn.loading::before { content: ''; width: 12px; height: 12px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: adaire-spin .6s linear infinite; }
            @keyframes adaire-spin { to { transform: rotate(360deg); } }

            .adaire-homepage-tip { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin-bottom: 36px; font-size: 13px; color: #92400e; display: flex; align-items: flex-start; gap: 12px; }
            .adaire-homepage-tip a { color: #b45309; }

            /* ---------- Header & footer cards ---------- */
            .adaire-hf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
            .adaire-hf-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
            .adaire-hf-card:hover { transform: translateY(-3px); border-color: #f4a0aa; box-shadow: 0 10px 24px rgba(213,41,63,.12); color: inherit; text-decoration: none; }
            .adaire-hf-card.is-add { border-style: dashed; background: #fafafa; }
            .adaire-hf-card h3 { font-size: 14px; font-weight: 600; margin: 0 0 3px; color: #1e293b; }
            .adaire-hf-card p { font-size: 12px; color: #64748b; margin: 0; line-height: 1.4; }
            .adaire-hf-arrow { margin-left: auto; color: #cbd5e1; flex-shrink: 0; width: 16px; height: 16px; transition: transform .2s ease, color .2s ease; }
            .adaire-hf-arrow svg { width: 100%; height: 100%; }
            .adaire-hf-card:hover .adaire-hf-arrow { transform: translateX(4px); color: #d5293f; }
            .adaire-hf-theme-tag { display: inline-block; font-size: 11px; background: #f1f5f9; color: #475569; border-radius: 4px; padding: 2px 7px; margin-bottom: 16px; }
            .adaire-hf-classic-note { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #64748b; margin-bottom: 40px; display: flex; align-items: flex-start; gap: 10px; }

            /* ---------- Resources ("Expand Your Toolkit" cards) ---------- */
            .adaire-resources { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
            .adaire-resource { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-decoration: none; color: inherit; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; display: flex; flex-direction: column; }
            .adaire-resource:hover { transform: translateY(-3px); border-color: #f4a0aa; box-shadow: 0 10px 24px rgba(213,41,63,.12); color: inherit; text-decoration: none; }
            .adaire-resource-tag { display: inline-block; align-self: flex-start; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; color: #b5233a; background: #fdf0f1; border-radius: 5px; padding: 3px 7px; margin-bottom: 10px; }
            .adaire-resource h3 { font-size: 14px; margin: 0 0 4px; color: #1e293b; }
            .adaire-resource p { font-size: 12px; color: #64748b; margin: 0 0 14px; flex: 1; }
            .adaire-resource-foot { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #d5293f; }
            .adaire-resource-foot svg { width: 13px; height: 13px; transition: transform .2s ease; }
            .adaire-resource:hover .adaire-resource-foot svg { transform: translateX(3px); }

            /* ---------- FAQ (chip-style — click a question, the answer below transitions in) ---------- */
            .adaire-faq { margin-bottom: 20px; }
            .adaire-faq-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
            .adaire-faq-chip { background: #fff; border: 1px solid #e2e8f0; border-radius: 999px; padding: 10px 18px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: background .25s ease, border-color .25s ease, color .25s ease, transform .25s ease, box-shadow .25s ease, opacity .25s ease; }
            .adaire-faq-chip:hover { border-color: #f4a0aa; color: #1e293b; }
            .adaire-faq-chip[aria-pressed="true"] { background: linear-gradient(135deg, #a01f2f 0%, #d5293f 100%); border-color: transparent; color: #fff; box-shadow: 0 6px 16px rgba(213,41,63,.25); transform: translateY(-1px); }
            .adaire-faq-chip:not([aria-pressed="true"]) { opacity: .8; }
            .adaire-faq-answer-wrap { position: relative; }
            .adaire-faq-answer { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 22px; margin: 0; font-size: 13px; color: #475569; line-height: 1.7; min-height: 24px; opacity: 0; transform: translateY(6px) scale(.985); filter: blur(4px); transition: opacity .3s ease, transform .3s ease, filter .3s ease; }
            .adaire-faq-answer.is-active { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
            @media (prefers-reduced-motion: reduce) { .adaire-faq-chip, .adaire-faq-answer { transition: none !important; transform: none !important; filter: none !important; } }

            /* ---------- Narrow-viewport collapse for the card grids ---------- */
            @media (max-width: 700px) {
                .adaire-welcome-steps,
                .adaire-hf-grid,
                .adaire-resources { grid-template-columns: 1fr; }
            }
        </style>

        <div class="adaire-shell">
            <aside class="adaire-shell-sidebar">
                <div class="adaire-shell-brand">
                    <span class="adaire-shell-brand-mark"><?php echo self::icon( 'brand-mark' ); ?></span>
                    <span class="adaire-shell-brand-name"><?php esc_html_e( 'GutenBlocks', 'adaire-blocks' ); ?></span>
                </div>

                <nav class="adaire-shell-nav">
                    <a href="<?php echo esc_url( admin_url( 'admin.php?page=adaire-blocks-welcome' ) ); ?>" class="adaire-shell-link is-active">
                        <?php echo self::icon( 'rocket' ); ?> <?php esc_html_e( 'Quick Start', 'adaire-blocks' ); ?>
                    </a>
                    <a href="<?php echo esc_url( $settings_url ); ?>" class="adaire-shell-link">
                        <?php echo self::icon( 'settings' ); ?> <?php esc_html_e( 'Block Settings', 'adaire-blocks' ); ?>
                    </a>
                    <a href="<?php echo esc_url( $migration_url ); ?>" class="adaire-shell-link">
                        <?php echo self::icon( 'sync' ); ?> <?php esc_html_e( 'Migration Tool', 'adaire-blocks' ); ?>
                    </a>

                    <div class="adaire-shell-nav-divider"></div>
                    <span class="adaire-shell-nav-label"><?php esc_html_e( 'Resources', 'adaire-blocks' ); ?></span>

                    <a href="<?php echo esc_url( $docs_url ); ?>" target="_blank" rel="noopener" class="adaire-shell-link adaire-shell-link-ext">
                        <span class="adaire-shell-link-label"><?php echo self::icon( 'book-open' ); ?> <?php esc_html_e( 'Documentation', 'adaire-blocks' ); ?></span>
                        <span class="adaire-shell-ext-icon"><?php echo self::icon( 'external-link' ); ?></span>
                    </a>
                    <a href="<?php echo esc_url( $support_url ); ?>" target="_blank" rel="noopener" class="adaire-shell-link adaire-shell-link-ext">
                        <span class="adaire-shell-link-label"><?php echo self::icon( 'message-circle' ); ?> <?php esc_html_e( 'Support', 'adaire-blocks' ); ?></span>
                        <span class="adaire-shell-ext-icon"><?php echo self::icon( 'external-link' ); ?></span>
                    </a>
                </nav>

                <div class="adaire-shell-spacer"></div>

                <div class="adaire-shell-sidebar-foot">
                    <a href="<?php echo esc_url( $exit_url ); ?>" class="adaire-shell-exit">
                        <?php echo self::icon( 'arrow-left' ); ?> <?php esc_html_e( 'Exit to WordPress', 'adaire-blocks' ); ?>
                    </a>
                    <span class="adaire-shell-version">GutenBlocks v<?php echo esc_html( ADAIRE_BLOCKS_VERSION ); ?></span>
                </div>
            </aside>

            <main class="adaire-shell-main">
        <div class="adaire-welcome">

            <div class="adaire-hero">
                <span class="adaire-hero-shape circle" style="width:90px;height:90px;top:8%;left:5%;"></span>
                <span class="adaire-hero-shape dot" style="width:10px;height:10px;top:38%;left:13%;"></span>
                <span class="adaire-hero-shape square" style="width:42px;height:42px;top:68%;left:9%;transform:rotate(10deg);"></span>
                <span class="adaire-hero-shape dot" style="width:8px;height:8px;top:20%;right:10%;"></span>
                <span class="adaire-hero-shape circle" style="width:54px;height:54px;top:62%;right:7%;"></span>
                <span class="adaire-hero-shape square" style="width:30px;height:30px;top:14%;right:22%;transform:rotate(-8deg);"></span>

                <div class="adaire-hero-grid">
                    <div class="adaire-hero-inner">
                        <span class="adaire-pill"><span class="adaire-pill-icon"><?php echo self::icon( 'sparkle' ); ?></span> <?php esc_html_e( 'Free Plan Active', 'adaire-blocks' ); ?></span>
                        <h1 class="adaire-hero-title"><?php esc_html_e( 'Welcome to', 'adaire-blocks' ); ?> <span class="adaire-accent">GutenBlocks</span></h1>
                        <p class="adaire-hero-sub"><?php esc_html_e( "You're set up and ready to build. Create a starter page below or explore the blocks in the editor.", 'adaire-blocks' ); ?></p>
                        <div class="adaire-hero-actions">
                            <a href="#adaire-templates" class="adaire-btn adaire-btn-primary">
                                <?php esc_html_e( 'Start Building', 'adaire-blocks' ); ?>
                                <span class="adaire-btn-arrow">→</span>
                            </a>
                            <a href="<?php echo esc_url( $docs_url . 'getting-started/' ); ?>" target="_blank" class="adaire-btn adaire-btn-ghost">
                                <?php esc_html_e( 'View Docs', 'adaire-blocks' ); ?>
                            </a>
                        </div>
                        <span class="adaire-hero-version">v<?php echo esc_html( ADAIRE_BLOCKS_VERSION ); ?> — Free</span>
                    </div>
                    <div class="adaire-hero-visual">
                        <div class="adaire-hero-shot">
                            <img src="<?php echo esc_url( $hero_image_url ); ?>" alt="<?php esc_attr_e( 'A GutenBlocks block in the WordPress editor', 'adaire-blocks' ); ?>" loading="eager" />
                            <span class="adaire-hero-shot-tag"><?php echo self::icon( 'sparkle' ); ?> <?php esc_html_e( 'Built with GutenBlocks', 'adaire-blocks' ); ?></span>
                        </div>
                        <div class="adaire-hero-shot-float">
                            <img src="<?php echo esc_url( $showcase_image_url ); ?>" alt="<?php esc_attr_e( 'Another GutenBlocks block layout', 'adaire-blocks' ); ?>" loading="lazy" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="adaire-welcome-steps">
                <div class="adaire-step adaire-fade">
                    <div class="adaire-step-num">1</div>
                    <h3><?php esc_html_e( 'Choose a starter template', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Pick one of the ready-made page layouts below. A draft page opens in the editor.', 'adaire-blocks' ); ?></p>
                </div>
                <div class="adaire-step adaire-fade" style="transition-delay:.08s">
                    <div class="adaire-step-num">2</div>
                    <h3><?php esc_html_e( 'Customise the content', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Replace the placeholder text and images with your own. Every block is editable.', 'adaire-blocks' ); ?></p>
                </div>
                <div class="adaire-step adaire-fade" style="transition-delay:.16s">
                    <div class="adaire-step-num">3</div>
                    <h3><?php esc_html_e( 'Publish & set as homepage', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Publish the page, then go to Settings → Reading to set it as your static front page.', 'adaire-blocks' ); ?></p>
                </div>
            </div>

            <div id="adaire-homepage-tip" class="adaire-homepage-tip" style="display:none;">
                <span class="adaire-tip-icon"><?php echo self::icon( 'check-circle' ); ?></span>
                <span id="adaire-tip-text"></span>
                <a href="<?php echo esc_url( admin_url( 'options-reading.php' ) ); ?>" style="margin-left:8px; white-space:nowrap;">
                    <?php esc_html_e( 'Set as homepage →', 'adaire-blocks' ); ?>
                </a>
            </div>

            <div id="adaire-templates" class="adaire-section-head">
                <div>
                    <p class="adaire-section-title"><?php esc_html_e( 'Starter Page Templates', 'adaire-blocks' ); ?></p>
                    <p class="adaire-section-subtitle"><?php esc_html_e( 'Each button creates a draft page pre-filled with that layout and opens the editor.', 'adaire-blocks' ); ?></p>
                </div>
                <div class="adaire-slider-nav">
                    <button type="button" class="adaire-slider-btn" data-dir="-1" aria-label="<?php esc_attr_e( 'Scroll templates left', 'adaire-blocks' ); ?>"><?php echo self::icon( 'chevron-left' ); ?></button>
                    <button type="button" class="adaire-slider-btn" data-dir="1" aria-label="<?php esc_attr_e( 'Scroll templates right', 'adaire-blocks' ); ?>"><?php echo self::icon( 'chevron-right' ); ?></button>
                </div>
            </div>

            <div class="adaire-slider" id="adaire-template-slider">
                <div class="adaire-slider-track">
                    <?php foreach ( $templates as $i => $tpl ) : ?>
                    <div class="adaire-template-card adaire-fade" style="transition-delay:<?php echo esc_attr( $i * 0.06 ); ?>s">
                        <span class="adaire-icon-badge"><?php echo self::icon( $tpl['icon'] ); ?></span>
                        <h3>
                            <?php echo esc_html( $tpl['title'] ); ?>
                            <?php if ( $tpl['homepage'] ) : ?>
                                <span class="adaire-home-badge"><?php esc_html_e( 'Homepage', 'adaire-blocks' ); ?></span>
                            <?php endif; ?>
                        </h3>
                        <p><?php echo esc_html( $tpl['description'] ); ?></p>
                        <button
                            class="adaire-create-btn"
                            data-pattern="<?php echo esc_attr( $tpl['slug'] ); ?>"
                            data-title="<?php echo esc_attr( $tpl['title'] ); ?>"
                            data-homepage="<?php echo $tpl['homepage'] ? '1' : '0'; ?>"
                        >
                            <span class="adaire-btn-icon"><?php echo self::icon( 'plus' ); ?></span> <?php esc_html_e( 'Create Page', 'adaire-blocks' ); ?>
                        </button>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <p class="adaire-section-title"><?php esc_html_e( 'Jumpstart Your Workflow', 'adaire-blocks' ); ?></p>
            <p class="adaire-section-subtitle"><?php esc_html_e( 'Quick links to the screens you\'ll use most — site editing, block management, and migration.', 'adaire-blocks' ); ?></p>
            <span class="adaire-hf-theme-tag"><?php echo esc_html( __( 'Active theme: ', 'adaire-blocks' ) . $theme_name ); ?></span>

            <?php if ( $is_block_theme ) : ?>
            <div class="adaire-hf-grid">
                <a href="<?php echo esc_url( $header_url ); ?>" class="adaire-hf-card adaire-fade">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'layout-top' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Edit Header', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Logo, navigation &amp; top bar', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $footer_url ); ?>" class="adaire-hf-card adaire-fade" style="transition-delay:.06s">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'layout-bottom' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Edit Footer', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Links, copyright &amp; social icons', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $all_parts_url ); ?>" class="adaire-hf-card is-add adaire-fade" style="transition-delay:.12s">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'grid' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'All Template Parts', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Browse, add or manage all parts', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $settings_url ); ?>" class="adaire-hf-card adaire-fade" style="transition-delay:.18s">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'settings' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Block Settings', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Enable or disable individual blocks', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $migration_url ); ?>" class="adaire-hf-card adaire-fade" style="transition-delay:.24s">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'sync' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Migration Tool', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Move old blocks over to GutenBlocks', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $docs_url ); ?>" target="_blank" rel="noopener" class="adaire-hf-card adaire-fade" style="transition-delay:.3s">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'book-open' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Documentation', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Guides for every block and setting', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
            </div>
            <?php else : ?>
            <div class="adaire-hf-classic-note">
                <span class="adaire-note-icon"><?php echo self::icon( 'info' ); ?></span>
                <span><?php printf(
                    /* translators: %s: theme name */
                    esc_html__( 'Your active theme (%s) is a classic theme. Header and footer editing is available for block themes via the Site Editor. Switch to a block theme (e.g. Twenty Twenty-Four) to use these shortcuts.', 'adaire-blocks' ),
                    '<strong>' . esc_html( $theme_name ) . '</strong>'
                ); ?>
                <a href="<?php echo esc_url( admin_url( 'themes.php' ) ); ?>" style="margin-left:6px;"><?php esc_html_e( 'Browse themes →', 'adaire-blocks' ); ?></a></span>
            </div>
            <div class="adaire-hf-grid">
                <a href="<?php echo esc_url( $settings_url ); ?>" class="adaire-hf-card adaire-fade">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'settings' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Block Settings', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Enable or disable individual blocks', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $migration_url ); ?>" class="adaire-hf-card adaire-fade" style="transition-delay:.06s">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'sync' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Migration Tool', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Move old blocks over to GutenBlocks', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $docs_url ); ?>" target="_blank" rel="noopener" class="adaire-hf-card adaire-fade" style="transition-delay:.12s">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'book-open' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Documentation', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Guides for every block and setting', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
            </div>
            <?php endif; ?>

            <p class="adaire-section-title"><?php esc_html_e( 'Expand Your Toolkit', 'adaire-blocks' ); ?></p>
            <p class="adaire-section-subtitle"><?php esc_html_e( 'Guides and support to help you get more out of GutenBlocks.', 'adaire-blocks' ); ?></p>

            <div class="adaire-resources">
                <a href="<?php echo esc_url( $docs_url . 'getting-started/' ); ?>" target="_blank" rel="noopener" class="adaire-resource adaire-fade">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'book-open' ); ?></span>
                    <span class="adaire-resource-tag"><?php esc_html_e( 'Guide', 'adaire-blocks' ); ?></span>
                    <h3><?php esc_html_e( 'Getting Started Guide', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Step-by-step walkthrough of every block and setting.', 'adaire-blocks' ); ?></p>
                    <span class="adaire-resource-foot"><?php esc_html_e( 'Read the guide', 'adaire-blocks' ); ?> <?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $docs_url . 'blocks/' ); ?>" target="_blank" rel="noopener" class="adaire-resource adaire-fade" style="transition-delay:.06s">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'blocks' ); ?></span>
                    <span class="adaire-resource-tag"><?php esc_html_e( 'Reference', 'adaire-blocks' ); ?></span>
                    <h3><?php esc_html_e( 'Block Reference', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Attributes, options, and examples for all free blocks.', 'adaire-blocks' ); ?></p>
                    <span class="adaire-resource-foot"><?php esc_html_e( 'Browse reference', 'adaire-blocks' ); ?> <?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $support_url ); ?>" target="_blank" rel="noopener" class="adaire-resource adaire-fade" style="transition-delay:.12s">
                    <span class="adaire-icon-badge"><?php echo self::icon( 'message-circle' ); ?></span>
                    <span class="adaire-resource-tag"><?php esc_html_e( 'Help', 'adaire-blocks' ); ?></span>
                    <h3><?php esc_html_e( 'Support', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Submit a ticket or browse answered questions.', 'adaire-blocks' ); ?></p>
                    <span class="adaire-resource-foot"><?php esc_html_e( 'Get support', 'adaire-blocks' ); ?> <?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
            </div>

            <p class="adaire-section-title"><?php esc_html_e( 'Frequently Asked Questions', 'adaire-blocks' ); ?></p>

            <div class="adaire-faq">
                <?php
                $faqs = array(
                    array(
                        'q' => __( 'How do I set a starter page as my homepage?', 'adaire-blocks' ),
                        'a' => __( 'Create the Landing Page template, publish it, then go to Settings → Reading and set it as your static front page.', 'adaire-blocks' ),
                    ),
                    array(
                        'q' => __( 'Can I edit the templates after they\'re created?', 'adaire-blocks' ),
                        'a' => __( 'Yes — every template is just regular GutenBlocks blocks on a draft page. Open it in the editor and replace any text, image, or section.', 'adaire-blocks' ),
                    ),
                    array(
                        'q' => __( 'What\'s the difference between the free and paid blocks?', 'adaire-blocks' ),
                        'a' => __( 'The free plan includes a curated set of layout, hero, and content blocks. Visit GutenBlocks Settings to see which blocks are included and what upgrading unlocks.', 'adaire-blocks' ),
                    ),
                    array(
                        'q' => __( 'My theme doesn\'t show header/footer editing — why?', 'adaire-blocks' ),
                        'a' => __( 'Header and footer editing via the Site Editor only works with block themes. Classic themes manage these areas through their own theme settings or widgets.', 'adaire-blocks' ),
                    ),
                );
                ?>
                <div class="adaire-faq-chips" id="adaire-faq-chips" data-answers="<?php echo esc_attr( wp_json_encode( wp_list_pluck( $faqs, 'a' ) ) ); ?>">
                    <?php foreach ( $faqs as $i => $faq ) : ?>
                        <button type="button" class="adaire-faq-chip" data-index="<?php echo esc_attr( $i ); ?>" aria-pressed="<?php echo 0 === $i ? 'true' : 'false'; ?>">
                            <?php echo esc_html( $faq['q'] ); ?>
                        </button>
                    <?php endforeach; ?>
                </div>
                <div class="adaire-faq-answer-wrap">
                    <p class="adaire-faq-answer is-active" id="adaire-faq-answer"><?php echo esc_html( $faqs[0]['a'] ); ?></p>
                </div>
            </div>

        </div><!-- .adaire-welcome -->
            </main>
        </div><!-- .adaire-shell -->
        </div><!-- .wrap -->

        <script>
        (function() {
            var nonce   = <?php echo wp_json_encode( $nonce ); ?>;
            var ajaxUrl = <?php echo wp_json_encode( $ajax_url ); ?>;

            // ---------- Starter page creation ----------
            document.querySelectorAll('.adaire-create-btn[data-pattern]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var pattern  = btn.dataset.pattern;
                    var title    = btn.dataset.title;
                    var isHome   = btn.dataset.homepage === '1';
                    var original = btn.innerHTML;

                    btn.classList.add('loading');
                    btn.textContent = 'Creating…';
                    btn.dataset.restoreHtml = original;

                    var body = new URLSearchParams({
                        action:  'adaire_create_starter_page',
                        nonce:   nonce,
                        pattern: pattern,
                    });

                    fetch(ajaxUrl, { method: 'POST', body: body, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(data) {
                            if (data.success) {
                                if (isHome) {
                                    var tip = document.getElementById('adaire-homepage-tip');
                                    var txt = document.getElementById('adaire-tip-text');
                                    txt.textContent = title + ' page created as a draft.';
                                    tip.style.display = 'flex';
                                }
                                window.location.href = data.data.edit_url;
                            } else {
                                alert(data.data.message || 'Something went wrong.');
                                btn.classList.remove('loading');
                                btn.textContent = original;
                            }
                        })
                        .catch(function() {
                            alert('Request failed. Please try again.');
                            btn.classList.remove('loading');
                            btn.textContent = original;
                        });
                });
            });

            // ---------- Template slider arrows ----------
            var slider = document.getElementById('adaire-template-slider');
            document.querySelectorAll('.adaire-slider-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    if (!slider) { return; }
                    var dir = parseInt(btn.dataset.dir, 10) || 1;
                    slider.scrollBy({ left: dir * 280, behavior: 'smooth' });
                });
            });

            // ---------- FAQ chips ----------
            var faqChips = document.getElementById('adaire-faq-chips');
            var faqAnswer = document.getElementById('adaire-faq-answer');
            if (faqChips && faqAnswer) {
                var faqAnswers = [];
                try { faqAnswers = JSON.parse(faqChips.dataset.answers || '[]'); } catch (e) {}

                faqChips.querySelectorAll('.adaire-faq-chip').forEach(function(chip) {
                    chip.addEventListener('click', function() {
                        if (chip.getAttribute('aria-pressed') === 'true') { return; }

                        faqChips.querySelectorAll('.adaire-faq-chip').forEach(function(c) {
                            c.setAttribute('aria-pressed', 'false');
                        });
                        chip.setAttribute('aria-pressed', 'true');

                        var idx = parseInt(chip.dataset.index, 10);
                        faqAnswer.classList.remove('is-active');
                        setTimeout(function() {
                            faqAnswer.textContent = faqAnswers[idx] || '';
                            faqAnswer.classList.add('is-active');
                        }, 160);
                    });
                });
            }

            var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // ---------- Hero mouse parallax ----------
            var heroEl    = document.querySelector('.adaire-hero');
            var heroInner = document.querySelector('.adaire-hero-inner');
            if (heroEl && heroInner && !reduceMotion) {
                heroEl.addEventListener('mousemove', function(e) {
                    var rect = heroEl.getBoundingClientRect();
                    var px = (e.clientX - rect.left) / rect.width - 0.5;
                    var py = (e.clientY - rect.top) / rect.height - 0.5;
                    heroInner.style.transform = 'translate(' + (px * -10).toFixed(2) + 'px,' + (py * -8).toFixed(2) + 'px)';
                });
                heroEl.addEventListener('mouseleave', function() {
                    heroInner.style.transform = 'translate(0,0)';
                });
            }

            // ---------- Hero CTA ripple ----------
            document.querySelectorAll('.adaire-btn-primary').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    var rect = btn.getBoundingClientRect();
                    var ripple = document.createElement('span');
                    ripple.className = 'adaire-ripple';
                    ripple.style.left = (e.clientX - rect.left) + 'px';
                    ripple.style.top  = (e.clientY - rect.top) + 'px';
                    btn.appendChild(ripple);
                    ripple.addEventListener('animationend', function() { ripple.remove(); });
                });
            });

            // ---------- Scroll-driven hero glow shift ----------
            if (heroEl && !reduceMotion) {
                var glowTicking = false;
                window.addEventListener('scroll', function() {
                    if (glowTicking) { return; }
                    glowTicking = true;
                    requestAnimationFrame(function() {
                        var rect = heroEl.getBoundingClientRect();
                        var span = rect.height + window.innerHeight;
                        var progress = Math.min(Math.max(1 - (rect.bottom / span), 0), 1);
                        heroEl.style.setProperty('--adaire-glow-y', (20 + progress * 50) + '%');
                        glowTicking = false;
                    });
                }, { passive: true });
            }

            // ---------- Fade-in-on-scroll ----------
            var faders = document.querySelectorAll('.adaire-fade');
            if ('IntersectionObserver' in window) {
                var observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.15 });
                faders.forEach(function(el) { observer.observe(el); });
            } else {
                faders.forEach(function(el) { el.classList.add('is-visible'); });
            }
        })();
        </script>
        <?php
    }
}
