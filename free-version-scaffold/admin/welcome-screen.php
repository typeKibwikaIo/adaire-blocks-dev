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
     * Inline SVG icon set for this screen. Each icon uses a 24x24 viewBox
     * and a single `currentColor` stroke; size and colour are set by the
     * wrapping element's CSS (`color` + `width`/`height`).
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

        $nonce       = wp_create_nonce( 'adaire_create_page' );
        $ajax_url    = admin_url( 'admin-ajax.php' );
        $docs_url    = 'https://adaire.digital/docs/';
        $support_url = 'https://adaire.digital/support/';

        $is_block_theme = function_exists( 'wp_is_block_theme' ) && wp_is_block_theme();
        $theme_name      = wp_get_theme()->get( 'Name' );
        $theme_slug      = get_stylesheet();
        $header_url      = admin_url( 'site-editor.php?postType=wp_template_part&postId=' . rawurlencode( $theme_slug . '//header' ) );
        $footer_url      = admin_url( 'site-editor.php?postType=wp_template_part&postId=' . rawurlencode( $theme_slug . '//footer' ) );
        $all_parts_url   = admin_url( 'site-editor.php?path=%2Fwp_template_part%2Fall' );

        // Sidebar / quick-action destinations.
        $settings_url  = admin_url( 'admin.php?page=adaire-blocks-settings' );
        $migration_url = admin_url( 'admin.php?page=adaire-blocks-migration' );
        $themes_url    = admin_url( 'themes.php' );
        $exit_url      = admin_url();

        // Bundled screenshots used as the hero visual.
        $hero_image_url     = plugins_url( 'images/welcome-hero.png', __FILE__ );
        $showcase_image_url = plugins_url( 'images/welcome-showcase.png', __FILE__ );

        // Reference imagery for the template gallery and resource cards.
        // External preview assets; replace with self-hosted screenshots
        // before a production build.
        $preview_images = array(
            'landing'  => 'https://s3-figma-hubfile-images-production.figma.com/hub/file/carousel/img/99645573e15e412a5bbde37b293767e199538427',
            'about'    => 'https://elements-resized.envatousercontent.com/elements-cover-images/78d6a416-f0fa-4bef-803c-5409f46e8292?w=433&cf_fit=scale-down&q=85&format=auto&s=361f8685cc0bd6a084e3bf83cb1da9bed7d8ccbb8e6a657c8dfe4e420dc2efee',
            'services' => 'https://marketstorage.b-cdn.net/users/rQMICWgf9EOBfrmE4CyLbdj4iiEgeWxc/previews/e22e1216-ce7b-475f-9c17-7143589e4f48/Dribbble-shot-HD-8.png',
            'blog'     => 'https://firmbee.com/wp-content/uploads/Mockup.webdesign2-1-900x856.png',
        );

        $templates = array(
            array(
                'slug'        => 'adaire-blocks/landing-page',
                'icon'        => 'rocket',
                'title'       => __( 'Landing Page', 'adaire-blocks' ),
                'description' => __( 'Hero, features, testimonial & CTA.', 'adaire-blocks' ),
                'homepage'    => true,
                'image'       => $preview_images['landing'],
            ),
            array(
                'slug'        => 'adaire-blocks/about-page',
                'icon'        => 'users',
                'title'       => __( 'About Page', 'adaire-blocks' ),
                'description' => __( 'Hero, about section, timeline & testimonial.', 'adaire-blocks' ),
                'homepage'    => false,
                'image'       => $preview_images['about'],
            ),
            array(
                'slug'        => 'adaire-blocks/services-page',
                'icon'        => 'settings',
                'title'       => __( 'Services Page', 'adaire-blocks' ),
                'description' => __( 'Hero, info grid & pricing table.', 'adaire-blocks' ),
                'homepage'    => false,
                'image'       => $preview_images['services'],
            ),
            array(
                'slug'        => 'adaire-blocks/blog-landing',
                'icon'        => 'file-text',
                'title'       => __( 'Blog Landing', 'adaire-blocks' ),
                'description' => __( 'Hero with a posts grid.', 'adaire-blocks' ),
                'homepage'    => false,
                'image'       => $preview_images['blog'],
            ),
            array(
                'slug'        => 'adaire-blocks/contact-page',
                'icon'        => 'mail',
                'title'       => __( 'Contact Page', 'adaire-blocks' ),
                'description' => __( 'Hero with a two-column contact layout.', 'adaire-blocks' ),
                'homepage'    => false,
                'image'       => '',
            ),
        );

        $resources = array(
            array(
                'href'  => $docs_url . 'getting-started/',
                'tag'   => __( 'Guide', 'adaire-blocks' ),
                'title' => __( 'Getting Started Guide', 'adaire-blocks' ),
                'desc'  => __( 'Step-by-step walkthrough of every block and setting.', 'adaire-blocks' ),
                'cta'   => __( 'Read the guide', 'adaire-blocks' ),
                'image' => $preview_images['blog'],
            ),
            array(
                'href'  => $docs_url . 'blocks/',
                'tag'   => __( 'Reference', 'adaire-blocks' ),
                'title' => __( 'Block Reference', 'adaire-blocks' ),
                'desc'  => __( 'Attributes, options, and examples for all free blocks.', 'adaire-blocks' ),
                'cta'   => __( 'Browse reference', 'adaire-blocks' ),
                'image' => $preview_images['landing'],
            ),
            array(
                'href'  => $support_url,
                'tag'   => __( 'Help', 'adaire-blocks' ),
                'title' => __( 'Support', 'adaire-blocks' ),
                'desc'  => __( 'Submit a ticket or browse answered questions.', 'adaire-blocks' ),
                'cta'   => __( 'Get support', 'adaire-blocks' ),
                'image' => $preview_images['services'],
            ),
        );
        ?>
        <div class="wrap adaire-wrap-shell">
        <style>
            .adaire-welcome, .adaire-welcome *, .adaire-shell-sidebar, .adaire-shell-sidebar * { box-sizing: border-box; }
            .adaire-welcome svg, .adaire-shell-sidebar svg { display: block; }

            /* ================= Design tokens ================= */
            .adaire-shell {
                --ab-brand: #d5293f;
                --ab-brand-dark: #a01f2f;
                --ab-brand-tint: #fdf0f1;
                --ab-ink: #0f172a;
                --ab-ink-2: #1e293b;
                --ab-body: #475569;
                --ab-muted: #64748b;
                --ab-faint: #94a3b8;
                --ab-line: rgba(15, 23, 42, .10);
                --ab-line-soft: rgba(15, 23, 42, .06);
                --ab-r-sm: 10px;
                --ab-r-md: 14px;
                --ab-r-lg: 20px;
                --ab-r-xl: 28px;
                --ab-r-pill: 999px;
                --ab-shadow-1: 0 1px 2px rgba(15, 23, 42, .05);
                --ab-shadow-2: 0 10px 26px rgba(15, 23, 42, .08);
                --ab-shadow-3: 0 26px 56px rgba(15, 23, 42, .14);
                --ab-shadow-brand: 0 18px 40px rgba(213, 41, 63, .20);
                --ab-ease: cubic-bezier(.22, 1, .36, 1);
                --ab-fs-h1: clamp(3.25rem, 2rem + 5.4vw, 6.75rem);
                --ab-fs-h2: clamp(1.5rem, 1.3rem + 1vw, 2.25rem);
                --ab-fs-lead: clamp(1.0625rem, 1rem + .3vw, 1.25rem);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }

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

            /* Shared flat white background for the sidebar and main column. */
            .adaire-shell {
                display: grid;
                grid-template-columns: 264px 1fr;
                min-height: 100vh;
                position: relative;
                background: #ffffff;
            }

            /* ---------- Sidebar (transparent: shows the shared canvas through it) ---------- */
            .adaire-shell-sidebar {
                position: sticky;
                top: 0;
                height: 100vh;
                overflow-y: auto;
                background: #ffffff;
                border-right: 1px solid var(--ab-line-soft);
                padding: 24px 16px;
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
                z-index: 3;
            }
            .adaire-shell-brand { display: flex; align-items: center; gap: 10px; padding: 4px 10px 26px; }
            .adaire-shell-brand-mark { width: 22px; height: 22px; color: var(--ab-brand); flex-shrink: 0; }
            .adaire-shell-brand-mark svg { width: 100%; height: 100%; }
            .adaire-shell-brand-name { font-size: 14.5px; font-weight: 700; color: var(--ab-ink); letter-spacing: -.2px; }
            .adaire-shell-nav { display: flex; flex-direction: column; gap: 2px; }
            .adaire-shell-link { display: flex; align-items: center; gap: 10px; min-height: 40px; padding: 9px 12px; border-radius: var(--ab-r-sm); font-size: 13.5px; font-weight: 600; color: var(--ab-body); text-decoration: none; transition: background .18s var(--ab-ease), color .18s var(--ab-ease); }
            .adaire-shell-link svg { width: 16px; height: 16px; flex-shrink: 0; }
            .adaire-shell-link:hover { background: rgba(15, 23, 42, .045); color: var(--ab-ink-2); text-decoration: none; }
            .adaire-shell-link.is-active { background: var(--ab-brand-tint); color: var(--ab-brand-dark); }
            .adaire-shell-nav-divider { height: 1px; background: var(--ab-line-soft); margin: 16px 10px; }
            .adaire-shell-nav-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--ab-faint); padding: 0 12px 8px; }
            .adaire-shell-link-ext { justify-content: space-between; }
            .adaire-shell-link-label { display: flex; align-items: center; gap: 10px; }
            .adaire-shell-ext-icon { display: inline-flex; width: 12px; height: 12px; color: #cbd5e1; flex-shrink: 0; }
            .adaire-shell-ext-icon svg { width: 100%; height: 100%; }
            .adaire-shell-spacer { flex: 1; }
            .adaire-shell-sidebar-foot { padding: 16px 12px 4px; border-top: 1px solid var(--ab-line-soft); margin-top: 12px; }
            .adaire-shell-exit { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--ab-faint); text-decoration: none; margin-bottom: 10px; min-height: 32px; transition: color .18s var(--ab-ease); }
            .adaire-shell-exit svg { width: 13px; height: 13px; }
            .adaire-shell-exit:hover { color: var(--ab-body); text-decoration: none; }
            .adaire-shell-version { font-size: 11px; color: #cbd5e1; padding: 0 12px; }

            .adaire-shell-main { min-width: 0; overflow-x: hidden; position: relative; z-index: 1; }

            .adaire-welcome { max-width: 1320px; margin: 0 auto; padding: clamp(28px, 4vw, 56px) clamp(20px, 4vw, 48px) 96px; }

            @media (min-width: 1800px) {
                .adaire-welcome { max-width: 1480px; }
            }

            @media (max-width: 900px) {
                .adaire-shell { grid-template-columns: 1fr; }
                .adaire-shell-sidebar { position: relative; height: auto; flex-direction: row; align-items: center; overflow-x: auto; overflow-y: visible; border-right: none; border-bottom: 1px solid var(--ab-line-soft); padding: 14px 16px; gap: 18px; }
                .adaire-shell-brand { padding: 0; }
                .adaire-shell-nav { flex-direction: row; }
                .adaire-shell-nav-divider, .adaire-shell-nav-label, .adaire-shell-spacer { display: none; }
                .adaire-shell-sidebar-foot { border-top: none; margin: 0; padding: 0; display: flex; align-items: center; }
                .adaire-shell-version { display: none; }
            }

            /* ---------- Icon / pattern system (replaces emoji) ---------- */
            .adaire-icon-badge { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--ab-r-sm); background: var(--ab-brand-tint); color: var(--ab-brand); flex-shrink: 0; transition: transform .3s var(--ab-ease); }
            .adaire-icon-badge svg { width: 20px; height: 20px; }

            .adaire-swatch { position: relative; width: 52px; height: 52px; border-radius: var(--ab-r-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; transition: transform .35s var(--ab-ease), box-shadow .35s var(--ab-ease); box-shadow: inset 0 0 0 1px rgba(15, 23, 42, .05); }
            .adaire-swatch::before { content: ''; position: absolute; inset: 0; background: linear-gradient(160deg, rgba(255, 255, 255, .55) 0%, transparent 48%); }
            .adaire-swatch svg { width: 21px; height: 21px; position: relative; z-index: 1; }
            .adaire-swatch img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
            .adaire-swatch.has-image::before { background: linear-gradient(180deg, transparent 50%, rgba(15, 23, 42, .55) 100%); z-index: 1; }
            .adaire-swatch.has-image svg { position: relative; z-index: 2; width: 17px; height: 17px; color: #fff; }
            .adaire-swatch-1 { background: linear-gradient(160deg, #f7e2e4, #ecc3c8); color: #9c2236; }
            .adaire-swatch-2 { background: linear-gradient(160deg, #eaedf2, #d9dfe7); color: #3c4758; }
            .adaire-swatch-3 { background: linear-gradient(160deg, #f3ecdf, #e4d6bc); color: #80591c; }
            .adaire-swatch-4 { background: linear-gradient(160deg, #e6efe9, #cfe2d6); color: #2c6644; }
            .adaire-swatch-5 { background: linear-gradient(160deg, #e7edf4, #d2deec); color: #2b4d83; }
            .adaire-swatch-6 { background: linear-gradient(160deg, #ede7f0, #ddd0e3); color: #654074; }
            .adaire-hf-card:hover .adaire-swatch,
            .adaire-step:hover .adaire-icon-badge { transform: scale(1.08); }

            .adaire-pill-icon { display: inline-flex; width: 13px; height: 13px; }
            .adaire-pill-icon svg { width: 100%; height: 100%; }
            .adaire-tip-icon, .adaire-note-icon { display: inline-flex; width: 18px; height: 18px; flex-shrink: 0; }
            .adaire-tip-icon svg, .adaire-note-icon svg { width: 100%; height: 100%; }
            .adaire-tip-icon { color: #15803d; }
            .adaire-note-icon { color: var(--ab-faint); margin-top: 1px; }
            .adaire-btn-icon { display: inline-flex; width: 13px; height: 13px; }
            .adaire-btn-icon svg { width: 100%; height: 100%; }

            /* ---------- Focus states (accessibility) ---------- */
            .adaire-welcome a:focus-visible,
            .adaire-welcome button:focus-visible,
            .adaire-shell-link:focus-visible,
            .adaire-shell-exit:focus-visible {
                outline: 2px solid var(--ab-brand);
                outline-offset: 3px;
                border-radius: var(--ab-r-sm);
            }

            /* ---------- Fade-in-on-scroll ---------- */
            .adaire-fade { opacity: 0; transform: translateY(20px) scale(.98); filter: blur(6px); transition: opacity .65s var(--ab-ease), transform .65s var(--ab-ease), filter .65s var(--ab-ease); }
            .adaire-fade.is-visible { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }

            /* ================= Hero ================= */
            .adaire-hero { position: relative; padding: clamp(24px, 3vw, 40px) 0 clamp(56px, 7vw, 88px); margin-bottom: clamp(40px, 5vw, 64px); }
            .adaire-hero-grid { position: relative; z-index: 2; display: grid; grid-template-columns: .8fr 1.35fr; gap: clamp(32px, 4vw, 64px); align-items: center; }
            .adaire-hero-inner { position: relative; z-index: 2; transition: transform .2s ease-out; }
            .adaire-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(253, 240, 241, .85); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); color: var(--ab-brand-dark); font-size: 12px; font-weight: 700; padding: 7px 16px; border-radius: var(--ab-r-pill); margin-bottom: 24px; border: 1px solid rgba(213, 41, 63, .14); }
            .adaire-hero-title { font-weight: 700; font-size: var(--ab-fs-h1); line-height: 1.06; letter-spacing: -.02em; color: var(--ab-ink); margin: 0 0 18px; }
            .adaire-hero-title .adaire-accent { color: var(--ab-brand); }
            .adaire-hero-sub { font-size: var(--ab-fs-lead); color: var(--ab-body); line-height: 1.65; margin: 0 0 32px; max-width: 480px; }
            .adaire-hero-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 26px; }

            .adaire-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; font-size: 14.5px; font-weight: 600; text-decoration: none; border-radius: var(--ab-r-sm); padding: 13px 26px; cursor: pointer; border: none; transition: transform .25s var(--ab-ease), box-shadow .25s var(--ab-ease), background .25s var(--ab-ease), color .25s var(--ab-ease); }
            .adaire-btn-primary { position: relative; overflow: hidden; background: linear-gradient(135deg, var(--ab-brand-dark) 0%, var(--ab-brand) 100%); color: #fff; box-shadow: var(--ab-shadow-brand); }
            .adaire-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 22px 48px rgba(213, 41, 63, .28); color: #fff; }
            .adaire-ripple { position: absolute; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: rgba(255, 255, 255, .55); transform: scale(0); animation: adaire-ripple .6s ease-out; pointer-events: none; }
            @keyframes adaire-ripple { to { transform: scale(20); opacity: 0; } }
            .adaire-btn-arrow { display: inline-block; transition: transform .25s var(--ab-ease); }
            .adaire-btn-primary:hover .adaire-btn-arrow { transform: translateX(4px); }
            .adaire-btn-ghost { background: transparent; color: var(--ab-body); padding: 13px 6px; border: none; }
            .adaire-btn-ghost:hover { color: var(--ab-ink-2); text-decoration: underline; }
            .adaire-hero-version { display: inline-block; font-size: 12px; color: var(--ab-faint); }

            /* ---------- Hero visual ---------- */
            .adaire-hero-visual { position: relative; isolation: isolate; }
            .adaire-hero-visual::before {
                content: '';
                position: absolute;
                inset: -10% -16% -10% -8%;
                background: radial-gradient(circle at 60% 35%, rgba(213, 41, 63, .16), transparent 60%);
                filter: blur(36px);
                z-index: -1;
            }
            .adaire-hero-shot { position: relative; border-radius: 0; overflow: hidden; box-shadow: var(--ab-shadow-3); border: 1px solid rgba(255, 255, 255, .6); background: #1e1f24; }
            .adaire-hero-shot-bar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #25262b; }
            .adaire-hero-shot-dot { width: 9px; height: 9px; border-radius: 50%; background: #4a4b52; }
            .adaire-hero-shot-dot:first-child { background: #e5594f; }
            .adaire-hero-shot-dot:nth-child(2) { background: #e6b73f; }
            .adaire-hero-shot-dot:nth-child(3) { background: #59b860; }
            .adaire-hero-shot img { display: block; width: 100%; height: auto; }
            .adaire-hero-shot-tag { position: absolute; left: 20px; bottom: 20px; display: inline-flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, .8); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); color: #fff; font-size: 11.5px; font-weight: 600; padding: 8px 14px; border-radius: var(--ab-r-pill); }
            .adaire-hero-shot-tag .adaire-pill-icon { color: #fda4af; }
            .adaire-hero-shot-float { position: absolute; bottom: -42px; right: -48px; width: 60%; border-radius: 0; overflow: hidden; box-shadow: var(--ab-shadow-3); border: 6px solid #fff; animation: adaire-float 8s ease-in-out infinite; }
            .adaire-hero-shot-float img { display: block; width: 100%; height: auto; }
            @keyframes adaire-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
            @media (prefers-reduced-motion: reduce) { .adaire-fade, .adaire-hero-inner, .adaire-hero-shot-float { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; filter: none !important; } }

            @media (min-width: 1600px) {
                .adaire-hero-grid { grid-template-columns: .72fr 1.4fr; gap: 72px; }
                .adaire-hero-shot-float { width: 56%; }
            }
            @media (max-width: 1199px) {
                .adaire-hero-grid { grid-template-columns: 1fr 1.1fr; gap: 36px; }
            }
            @media (max-width: 900px) {
                .adaire-hero-grid { grid-template-columns: 1fr; }
                .adaire-hero-sub { max-width: 100%; }
                .adaire-hero-shot-float { width: 50%; right: -14px; bottom: -28px; }
            }
            @media (max-width: 480px) {
                .adaire-hero-actions { flex-direction: column; align-items: stretch; gap: 12px; }
                .adaire-btn { width: 100%; }
                .adaire-hero-shot-float { display: none; }
            }

            /* ================= Section headings ================= */
            .adaire-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 6px; }
            .adaire-section-title { font-size: var(--ab-fs-h2); font-weight: 700; letter-spacing: -.01em; color: var(--ab-ink-2); margin: 0 0 8px; }
            .adaire-section-subtitle { font-size: 14.5px; color: var(--ab-muted); margin: 0 0 28px; line-height: 1.6; max-width: 640px; }

            /* ================= Steps (stepper) ================= */
            .adaire-welcome-steps { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-bottom: clamp(48px, 6vw, 72px); }
            .adaire-welcome-steps::before { content: ''; position: absolute; top: 30px; left: 28px; right: 28px; height: 1px; background: var(--ab-line); z-index: 0; }
            .adaire-step { position: relative; z-index: 1; padding: 0 4px; }
            .adaire-step-num { position: relative; width: 44px; height: 44px; background: #fff; border: 1px solid var(--ab-line); color: var(--ab-brand); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; margin-bottom: 18px; transition: transform .25s var(--ab-ease), border-color .25s var(--ab-ease), box-shadow .25s var(--ab-ease); }
            .adaire-step:hover .adaire-step-num { transform: scale(1.08); border-color: var(--ab-brand); box-shadow: var(--ab-shadow-2); }
            .adaire-step h3 { font-size: 16px; font-weight: 600; margin: 0 0 8px; color: var(--ab-ink-2); }
            .adaire-step p { font-size: 13.5px; color: var(--ab-muted); margin: 0; line-height: 1.6; }

            @media (max-width: 700px) {
                .adaire-welcome-steps { grid-template-columns: 1fr; gap: 24px; }
                .adaire-welcome-steps::before { display: none; }
            }

            /* ================= Starter template gallery ================= */
            .adaire-slider-nav { display: flex; gap: 10px; margin-bottom: 28px; flex-shrink: 0; }
            .adaire-slider-btn { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--ab-line); background: rgba(255, 255, 255, .7); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); color: var(--ab-body); cursor: pointer; transition: background .2s var(--ab-ease), color .2s var(--ab-ease), border-color .2s var(--ab-ease), transform .2s var(--ab-ease); }
            .adaire-slider-btn svg { width: 17px; height: 17px; }
            .adaire-slider-btn:hover { background: var(--ab-brand); color: #fff; border-color: var(--ab-brand); transform: translateY(-1px); }
            .adaire-slider { overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; margin: 0 -4px 64px; padding: 4px; }
            .adaire-slider::-webkit-scrollbar { display: none; }
            .adaire-slider-track { display: flex; gap: 24px; }

            .adaire-template-card { flex: 0 0 320px; scroll-snap-align: start; display: flex; flex-direction: column; border: 1px solid var(--ab-line); border-radius: 0; overflow: hidden; background: transparent; box-shadow: var(--ab-shadow-1); transition: transform .35s var(--ab-ease), border-color .35s var(--ab-ease), box-shadow .35s var(--ab-ease); }
            .adaire-template-card:hover { transform: translateY(-6px); border-color: rgba(213, 41, 63, .3); box-shadow: var(--ab-shadow-3); }
            .adaire-template-media { position: relative; aspect-ratio: 4 / 3; overflow: hidden; }
            .adaire-template-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .6s var(--ab-ease); }
            .adaire-template-card:hover .adaire-template-media img { transform: scale(1.07); }
            .adaire-template-media::after { content: ''; position: absolute; inset: 0; z-index: 2; pointer-events: none; background: linear-gradient(115deg, transparent 42%, rgba(255, 255, 255, .35) 50%, transparent 58%); background-size: 240% 240%; background-position: -60% -60%; opacity: 0; transition: opacity .2s var(--ab-ease), background-position 1s var(--ab-ease); }
            .adaire-template-card:hover .adaire-template-media::after { opacity: 1; background-position: 140% 140%; }
            .adaire-template-media-pattern { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; background: transparent; border-bottom: 1px solid var(--ab-line); }
            .adaire-template-media-pattern::before { content: ''; position: absolute; inset: -20%; background: radial-gradient(circle at 26% 26%, rgba(213, 41, 63, .14), transparent 46%), radial-gradient(circle at 80% 72%, rgba(99, 102, 241, .10), transparent 50%); filter: blur(18px); }
            .adaire-template-media-pattern svg { width: 22%; height: 22%; position: relative; z-index: 1; opacity: .9; color: var(--ab-brand); }
            .adaire-home-badge { position: absolute; top: 14px; left: 14px; z-index: 2; background: rgba(255, 255, 255, .92); color: #15803d; font-size: 10.5px; font-weight: 700; padding: 5px 11px; border-radius: var(--ab-r-pill); text-transform: uppercase; letter-spacing: .4px; box-shadow: var(--ab-shadow-1); }
            .adaire-template-body { padding: 24px 24px 26px; display: flex; flex-direction: column; flex: 1; }
            .adaire-template-card h3 { font-size: 17.5px; font-weight: 700; margin: 0 0 7px; color: var(--ab-ink-2); letter-spacing: -.01em; }
            .adaire-template-card p { font-size: 13.5px; color: var(--ab-muted); margin: 0 0 20px; line-height: 1.55; min-height: 34px; }
            .adaire-create-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; width: 100%; min-height: 44px; background: var(--ab-ink); color: #fff; border: none; border-radius: var(--ab-r-sm); padding: 10px 16px; font-size: 13.5px; font-weight: 600; cursor: pointer; text-decoration: none; margin-top: auto; transition: background .2s var(--ab-ease), transform .15s var(--ab-ease); }
            .adaire-create-btn:hover { background: var(--ab-brand); transform: translateY(-1px); }
            .adaire-create-btn.loading { opacity: .75; pointer-events: none; transform: none; }
            .adaire-create-btn.loading::before { content: ''; width: 12px; height: 12px; border: 2px solid rgba(255, 255, 255, .4); border-top-color: #fff; border-radius: 50%; animation: adaire-spin .6s linear infinite; }
            @keyframes adaire-spin { to { transform: rotate(360deg); } }

            .adaire-homepage-tip { background: transparent; border-left: 3px solid #15803d; border-radius: 0 var(--ab-r-sm) var(--ab-r-sm) 0; padding: 14px 20px; margin-bottom: 40px; font-size: 13.5px; color: #14532d; display: flex; align-items: flex-start; gap: 12px; }
            .adaire-homepage-tip a { color: #15803d; font-weight: 600; }

            @media (max-width: 600px) {
                .adaire-template-card { flex: 0 0 86vw; }
            }

            /* ================= Header & footer quick-link cards ================= */
            .adaire-hf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: clamp(48px, 6vw, 72px); }
            .adaire-hf-card { background: transparent; border: 1px solid var(--ab-line); border-radius: 0; padding: 22px 24px; display: flex; align-items: center; gap: 17px; min-height: 44px; text-decoration: none; color: inherit; box-shadow: var(--ab-shadow-1); transition: transform .25s var(--ab-ease), box-shadow .25s var(--ab-ease), border-color .25s var(--ab-ease); }
            .adaire-hf-card:hover { transform: translateY(-4px); border-color: rgba(213, 41, 63, .3); box-shadow: var(--ab-shadow-2); color: inherit; text-decoration: none; }
            .adaire-hf-card.is-add { border-style: dashed; }
            .adaire-hf-card h3 { font-size: 15.5px; font-weight: 600; margin: 0 0 4px; color: var(--ab-ink-2); letter-spacing: -.005em; }
            .adaire-hf-card p { font-size: 12.5px; color: var(--ab-muted); margin: 0; line-height: 1.5; }
            .adaire-hf-arrow { margin-left: auto; color: #cbd5e1; flex-shrink: 0; width: 16px; height: 16px; transition: transform .25s var(--ab-ease), color .25s var(--ab-ease); }
            .adaire-hf-arrow svg { width: 100%; height: 100%; }
            .adaire-hf-card:hover .adaire-hf-arrow { transform: translateX(4px); color: var(--ab-brand); }
            .adaire-hf-theme-tag { display: inline-block; font-size: 11.5px; background: rgba(15, 23, 42, .05); color: var(--ab-body); border-radius: var(--ab-r-sm); padding: 4px 10px; margin-bottom: 20px; }
            .adaire-hf-classic-note { background: transparent; border-left: 3px solid var(--ab-faint); border-radius: 0 var(--ab-r-sm) var(--ab-r-sm) 0; padding: 14px 20px; font-size: 13.5px; color: var(--ab-body); margin-bottom: 40px; display: flex; align-items: flex-start; gap: 10px; }

            /* ================= Resource cards (image-led) ================= */
            .adaire-resources { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: clamp(48px, 6vw, 72px); }
            .adaire-resource { display: flex; flex-direction: column; border: 1px solid var(--ab-line); border-radius: 0; overflow: hidden; background: transparent; box-shadow: var(--ab-shadow-1); text-decoration: none; color: inherit; transition: transform .3s var(--ab-ease), box-shadow .3s var(--ab-ease), border-color .3s var(--ab-ease); }
            .adaire-resource:hover { transform: translateY(-5px); border-color: rgba(213, 41, 63, .3); box-shadow: var(--ab-shadow-2); color: inherit; text-decoration: none; }
            .adaire-resource-media { position: relative; aspect-ratio: 16 / 9; overflow: hidden; }
            .adaire-resource-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .6s var(--ab-ease); }
            .adaire-resource:hover .adaire-resource-media img { transform: scale(1.07); }
            .adaire-resource-media::after { content: ''; position: absolute; inset: 0; z-index: 2; pointer-events: none; background: linear-gradient(115deg, transparent 42%, rgba(255, 255, 255, .32) 50%, transparent 58%); background-size: 240% 240%; background-position: -60% -60%; opacity: 0; transition: opacity .2s var(--ab-ease), background-position 1s var(--ab-ease); }
            .adaire-resource:hover .adaire-resource-media::after { opacity: 1; background-position: 140% 140%; }
            .adaire-resource-tag { position: absolute; top: 12px; left: 12px; z-index: 2; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; color: var(--ab-brand-dark); background: rgba(255, 255, 255, .92); border-radius: var(--ab-r-sm); padding: 5px 10px; }
            .adaire-resource-body { padding: 20px 22px 24px; display: flex; flex-direction: column; flex: 1; }
            .adaire-resource h3 { font-size: 16px; font-weight: 700; margin: 0 0 7px; color: var(--ab-ink-2); letter-spacing: -.01em; }
            .adaire-resource p { font-size: 13px; color: var(--ab-muted); margin: 0 0 18px; line-height: 1.55; flex: 1; }
            .adaire-resource-foot { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--ab-brand); }
            .adaire-resource-foot svg { width: 13px; height: 13px; transition: transform .2s var(--ab-ease); }
            .adaire-resource:hover .adaire-resource-foot svg { transform: translateX(3px); }

            /* ================= FAQ ================= */
            .adaire-faq-layout { display: grid; grid-template-columns: .82fr 1.18fr; gap: 40px; align-items: start; }
            .adaire-faq-visual { position: relative; border-radius: 0; overflow: hidden; box-shadow: var(--ab-shadow-2); aspect-ratio: 4 / 5; }
            .adaire-faq-visual img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .7s var(--ab-ease); }
            .adaire-faq-visual:hover img { transform: scale(1.05); }
            .adaire-faq-visual::after { content: ''; position: absolute; inset: 0; background: linear-gradient(190deg, transparent 38%, rgba(15, 23, 42, .82) 100%); }
            .adaire-faq-visual-card { position: absolute; left: 20px; right: 20px; bottom: 20px; z-index: 2; display: flex; align-items: flex-start; gap: 12px; }
            .adaire-faq-visual-icon { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: var(--ab-r-sm); background: rgba(255, 255, 255, .16); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); color: #fff; flex-shrink: 0; }
            .adaire-faq-visual-icon svg { width: 18px; height: 18px; }
            .adaire-faq-visual-card h3 { font-size: 15px; font-weight: 600; margin: 0 0 4px; color: #fff; }
            .adaire-faq-visual-card p { font-size: 12.5px; margin: 0; color: rgba(255, 255, 255, .8); line-height: 1.5; }
            @media (max-width: 900px) {
                .adaire-faq-layout { grid-template-columns: 1fr; }
                .adaire-faq-visual { aspect-ratio: 16 / 9; }
            }
            .adaire-faq { margin-bottom: 24px; }
            .adaire-faq-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
            .adaire-faq-chip { background: transparent; border: 1px solid var(--ab-line); border-radius: var(--ab-r-pill); padding: 11px 20px; min-height: 44px; font-size: 13.5px; font-weight: 600; color: var(--ab-body); cursor: pointer; transition: background .25s var(--ab-ease), border-color .25s var(--ab-ease), color .25s var(--ab-ease), transform .25s var(--ab-ease), box-shadow .25s var(--ab-ease); }
            .adaire-faq-chip:hover { border-color: rgba(213, 41, 63, .35); color: var(--ab-ink-2); }
            .adaire-faq-chip[aria-pressed="true"] { background: linear-gradient(135deg, var(--ab-brand-dark) 0%, var(--ab-brand) 100%); border-color: transparent; color: #fff; box-shadow: var(--ab-shadow-brand); transform: translateY(-1px); }
            .adaire-faq-answer-wrap { border-top: 1px solid var(--ab-line); }
            .adaire-faq-answer { padding: 24px 2px 4px; margin: 0; font-size: 14.5px; color: var(--ab-body); line-height: 1.75; min-height: 24px; opacity: 0; transform: translateY(6px); filter: blur(4px); transition: opacity .3s var(--ab-ease), transform .3s var(--ab-ease), filter .3s var(--ab-ease); }
            .adaire-faq-answer.is-active { opacity: 1; transform: translateY(0); filter: blur(0); }
            @media (prefers-reduced-motion: reduce) { .adaire-faq-chip, .adaire-faq-answer { transition: none !important; transform: none !important; filter: none !important; } }

            /* ================= Responsive grid collapse ================= */
            @media (max-width: 1199px) {
                .adaire-hf-grid, .adaire-resources { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 700px) {
                .adaire-hf-grid, .adaire-resources { grid-template-columns: 1fr; }
            }
            @media (max-width: 420px) {
                .adaire-welcome { padding-left: 16px; padding-right: 16px; }
                .adaire-template-body, .adaire-hf-card, .adaire-resource-body { padding-left: 16px; padding-right: 16px; }
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
                <div class="adaire-hero-grid">
                    <div class="adaire-hero-inner">
                        <span class="adaire-pill"><span class="adaire-pill-icon"><?php echo self::icon( 'sparkle' ); ?></span> <?php esc_html_e( 'Free plan', 'adaire-blocks' ); ?></span>
                        <h1 class="adaire-hero-title"><?php esc_html_e( 'Welcome to', 'adaire-blocks' ); ?> <span class="adaire-accent">GutenBlocks</span></h1>
                        <p class="adaire-hero-sub"><?php esc_html_e( 'Create a starter page from a ready-made layout, or explore the full block library directly in the editor.', 'adaire-blocks' ); ?></p>
                        <div class="adaire-hero-actions">
                            <a href="#adaire-templates" class="adaire-btn adaire-btn-primary">
                                <?php esc_html_e( 'Start Building', 'adaire-blocks' ); ?>
                                <span class="adaire-btn-arrow">→</span>
                            </a>
                            <a href="<?php echo esc_url( $docs_url . 'getting-started/' ); ?>" target="_blank" class="adaire-btn adaire-btn-ghost">
                                <?php esc_html_e( 'View Docs', 'adaire-blocks' ); ?>
                            </a>
                        </div>
                        <span class="adaire-hero-version">v<?php echo esc_html( ADAIRE_BLOCKS_VERSION ); ?> · <?php esc_html_e( 'Free plan', 'adaire-blocks' ); ?></span>
                    </div>
                    <div class="adaire-hero-visual">
                        <div class="adaire-hero-shot">
                            <div class="adaire-hero-shot-bar">
                                <span class="adaire-hero-shot-dot"></span>
                                <span class="adaire-hero-shot-dot"></span>
                                <span class="adaire-hero-shot-dot"></span>
                            </div>
                            <img src="<?php echo esc_url( $hero_image_url ); ?>" alt="<?php esc_attr_e( 'A GutenBlocks block in the WordPress editor', 'adaire-blocks' ); ?>" loading="eager" decoding="async" />
                            <span class="adaire-hero-shot-tag"><?php echo self::icon( 'sparkle' ); ?> <?php esc_html_e( 'Built with GutenBlocks', 'adaire-blocks' ); ?></span>
                        </div>
                        <div class="adaire-hero-shot-float">
                            <img src="<?php echo esc_url( $showcase_image_url ); ?>" alt="<?php esc_attr_e( 'Another GutenBlocks block layout', 'adaire-blocks' ); ?>" loading="lazy" decoding="async" />
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
                        <div class="adaire-template-media">
                            <?php if ( $tpl['homepage'] ) : ?>
                                <span class="adaire-home-badge"><?php esc_html_e( 'Homepage', 'adaire-blocks' ); ?></span>
                            <?php endif; ?>
                            <?php if ( ! empty( $tpl['image'] ) ) : ?>
                                <img src="<?php echo esc_url( $tpl['image'] ); ?>" alt="<?php echo esc_attr( $tpl['title'] ); ?>" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
                            <?php else : ?>
                                <div class="adaire-template-media-pattern">
                                    <?php echo self::icon( $tpl['icon'] ); ?>
                                </div>
                            <?php endif; ?>
                        </div>
                        <div class="adaire-template-body">
                            <h3><?php echo esc_html( $tpl['title'] ); ?></h3>
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
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <p class="adaire-section-title"><?php esc_html_e( 'Jumpstart Your Workflow', 'adaire-blocks' ); ?></p>
            <p class="adaire-section-subtitle"><?php esc_html_e( 'Quick links to the screens you\'ll use most: site editing, block management, and migration.', 'adaire-blocks' ); ?></p>
            <span class="adaire-hf-theme-tag"><?php echo esc_html( __( 'Active theme: ', 'adaire-blocks' ) . $theme_name ); ?></span>

            <?php if ( $is_block_theme ) : ?>
            <div class="adaire-hf-grid">
                <a href="<?php echo esc_url( $header_url ); ?>" class="adaire-hf-card adaire-fade">
                    <span class="adaire-swatch adaire-swatch-2"><?php echo self::icon( 'layout-top' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Edit Header', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Logo, navigation &amp; top bar', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $footer_url ); ?>" class="adaire-hf-card adaire-fade" style="transition-delay:.06s">
                    <span class="adaire-swatch adaire-swatch-5"><?php echo self::icon( 'layout-bottom' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Edit Footer', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Links, copyright &amp; social icons', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $all_parts_url ); ?>" class="adaire-hf-card is-add adaire-fade" style="transition-delay:.12s">
                    <span class="adaire-swatch adaire-swatch-6"><?php echo self::icon( 'grid' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'All Template Parts', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Browse, add or manage all parts', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $settings_url ); ?>" class="adaire-hf-card adaire-fade" style="transition-delay:.18s">
                    <span class="adaire-swatch adaire-swatch-3"><?php echo self::icon( 'settings' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Block Settings', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Enable or disable individual blocks', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $migration_url ); ?>" class="adaire-hf-card adaire-fade" style="transition-delay:.24s">
                    <span class="adaire-swatch adaire-swatch-4"><?php echo self::icon( 'sync' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Migration Tool', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Move old blocks over to GutenBlocks', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $docs_url ); ?>" target="_blank" rel="noopener" class="adaire-hf-card adaire-fade" style="transition-delay:.3s">
                    <span class="adaire-swatch adaire-swatch-1"><?php echo self::icon( 'book-open' ); ?></span>
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
                <a href="<?php echo esc_url( $themes_url ); ?>" style="margin-left:6px;"><?php esc_html_e( 'Browse themes →', 'adaire-blocks' ); ?></a></span>
            </div>
            <div class="adaire-hf-grid">
                <a href="<?php echo esc_url( $settings_url ); ?>" class="adaire-hf-card adaire-fade">
                    <span class="adaire-swatch adaire-swatch-3"><?php echo self::icon( 'settings' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Block Settings', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Enable or disable individual blocks', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $migration_url ); ?>" class="adaire-hf-card adaire-fade" style="transition-delay:.06s">
                    <span class="adaire-swatch adaire-swatch-4"><?php echo self::icon( 'sync' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Migration Tool', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Move old blocks over to GutenBlocks', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow"><?php echo self::icon( 'chevron-right' ); ?></span>
                </a>
                <a href="<?php echo esc_url( $docs_url ); ?>" target="_blank" rel="noopener" class="adaire-hf-card adaire-fade" style="transition-delay:.12s">
                    <span class="adaire-swatch adaire-swatch-1"><?php echo self::icon( 'book-open' ); ?></span>
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
                <?php foreach ( $resources as $i => $res ) : ?>
                <a href="<?php echo esc_url( $res['href'] ); ?>" target="_blank" rel="noopener" class="adaire-resource adaire-fade" style="transition-delay:<?php echo esc_attr( $i * 0.06 ); ?>s">
                    <div class="adaire-resource-media">
                        <img src="<?php echo esc_url( $res['image'] ); ?>" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
                        <span class="adaire-resource-tag"><?php echo esc_html( $res['tag'] ); ?></span>
                    </div>
                    <div class="adaire-resource-body">
                        <h3><?php echo esc_html( $res['title'] ); ?></h3>
                        <p><?php echo esc_html( $res['desc'] ); ?></p>
                        <span class="adaire-resource-foot"><?php echo esc_html( $res['cta'] ); ?> <?php echo self::icon( 'chevron-right' ); ?></span>
                    </div>
                </a>
                <?php endforeach; ?>
            </div>

            <p class="adaire-section-title"><?php esc_html_e( 'Frequently Asked Questions', 'adaire-blocks' ); ?></p>
            <p class="adaire-section-subtitle"><?php esc_html_e( 'Answers to common questions about templates, blocks, and themes.', 'adaire-blocks' ); ?></p>

            <div class="adaire-faq-layout">
            <div class="adaire-faq-visual adaire-fade">
                <img src="<?php echo esc_url( $preview_images['about'] ); ?>" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
                <div class="adaire-faq-visual-card">
                    <span class="adaire-faq-visual-icon"><?php echo self::icon( 'book-open' ); ?></span>
                    <div>
                        <h3><?php esc_html_e( 'Still have questions?', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'The full documentation covers every block in detail.', 'adaire-blocks' ); ?></p>
                    </div>
                </div>
            </div>
            <div class="adaire-faq">
                <?php
                $faqs = array(
                    array(
                        'q' => __( 'How do I set a starter page as my homepage?', 'adaire-blocks' ),
                        'a' => __( 'Create the Landing Page template, publish it, then go to Settings → Reading and set it as your static front page.', 'adaire-blocks' ),
                    ),
                    array(
                        'q' => __( 'Can I edit the templates after they\'re created?', 'adaire-blocks' ),
                        'a' => __( 'Yes. Every template is just regular GutenBlocks blocks on a draft page. Open it in the editor and replace any text, image, or section.', 'adaire-blocks' ),
                    ),
                    array(
                        'q' => __( 'What\'s the difference between the free and paid blocks?', 'adaire-blocks' ),
                        'a' => __( 'The free plan includes a curated set of layout, hero, and content blocks. Visit GutenBlocks Settings to see which blocks are included and what upgrading unlocks.', 'adaire-blocks' ),
                    ),
                    array(
                        'q' => __( 'Why doesn\'t my theme show header/footer editing?', 'adaire-blocks' ),
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
            </div><!-- .adaire-faq-layout -->

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
                    slider.scrollBy({ left: dir * 344, behavior: 'smooth' });
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
                    heroInner.style.transform = 'translate(' + (px * -8).toFixed(2) + 'px,' + (py * -6).toFixed(2) + 'px)';
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
