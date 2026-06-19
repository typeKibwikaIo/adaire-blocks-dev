<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Adaire_Welcome_Screen {

    public static function register() {
        add_action( 'admin_menu', array( __CLASS__, 'add_menu_page' ) );
        add_action( 'admin_menu', array( __CLASS__, 'move_to_top' ), 999 );
        add_action( 'wp_ajax_adaire_create_starter_page', array( __CLASS__, 'create_starter_page' ) );
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
            'post_content' => wp_slash( $pattern['content'] ),
        ) );

        if ( is_wp_error( $page_id ) ) {
            wp_send_json_error( array( 'message' => $page_id->get_error_message() ) );
        }

        wp_send_json_success( array( 'edit_url' => get_edit_post_link( $page_id, 'raw' ) ) );
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

        $templates = array(
            array(
                'slug'        => 'adaire-blocks/landing-page',
                'icon'        => '🚀',
                'title'       => __( 'Landing Page', 'adaire-blocks' ),
                'description' => __( 'Hero, features, testimonial & CTA.', 'adaire-blocks' ),
                'homepage'    => true,
            ),
            array(
                'slug'        => 'adaire-blocks/about-page',
                'icon'        => '👥',
                'title'       => __( 'About Page', 'adaire-blocks' ),
                'description' => __( 'Hero, about section, timeline & testimonial.', 'adaire-blocks' ),
                'homepage'    => false,
            ),
            array(
                'slug'        => 'adaire-blocks/services-page',
                'icon'        => '⚙️',
                'title'       => __( 'Services Page', 'adaire-blocks' ),
                'description' => __( 'Hero, info grid & pricing table.', 'adaire-blocks' ),
                'homepage'    => false,
            ),
            array(
                'slug'        => 'adaire-blocks/blog-landing',
                'icon'        => '📝',
                'title'       => __( 'Blog Landing', 'adaire-blocks' ),
                'description' => __( 'Hero with a posts grid.', 'adaire-blocks' ),
                'homepage'    => false,
            ),
            array(
                'slug'        => 'adaire-blocks/contact-page',
                'icon'        => '✉️',
                'title'       => __( 'Contact Page', 'adaire-blocks' ),
                'description' => __( 'Hero with a two-column contact layout.', 'adaire-blocks' ),
                'homepage'    => false,
            ),
        );
        ?>
        <div class="wrap">
        <style>
            .adaire-welcome { max-width: 960px; margin: 30px auto 60px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
            .adaire-welcome-hero { background: linear-gradient(135deg, #a01f2f 0%, #d5293f 100%); border-radius: 12px; padding: 48px 40px; color: #fff; margin-bottom: 36px; display: flex; align-items: center; gap: 32px; }
            .adaire-welcome-hero-text h1 { color: #fff; font-size: 28px; margin: 0 0 8px; }
            .adaire-welcome-hero-text p { color: rgba(255,255,255,0.85); font-size: 15px; margin: 0; }
            .adaire-welcome-hero-badge { background: rgba(255,255,255,0.15); border-radius: 8px; padding: 6px 14px; font-size: 13px; white-space: nowrap; margin-top: 12px; display: inline-block; }

            .adaire-welcome-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 36px; }
            .adaire-step { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; }
            .adaire-step-num { width: 32px; height: 32px; background: #fdf0f1; color: #d5293f; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; margin-bottom: 12px; }
            .adaire-step h3 { font-size: 14px; margin: 0 0 6px; color: #1e293b; }
            .adaire-step p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }

            .adaire-section-title { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 20px; }
            .adaire-section-subtitle { font-size: 13px; color: #64748b; margin: -12px 0 20px; }

            .adaire-templates { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 36px; }
            .adaire-template-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; transition: border-color .15s, box-shadow .15s; }
            .adaire-template-card:hover { border-color: #f4a0aa; box-shadow: 0 4px 16px rgba(213,41,63,.1); }
            .adaire-template-icon { font-size: 28px; margin-bottom: 10px; display: block; }
            .adaire-template-card h3 { font-size: 14px; margin: 0 0 4px; color: #1e293b; display: flex; align-items: center; gap: 6px; }
            .adaire-template-card p { font-size: 12px; color: #64748b; margin: 0 0 14px; line-height: 1.4; }
            .adaire-template-card .adaire-home-badge { background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; text-transform: uppercase; letter-spacing: .3px; }
            .adaire-create-btn { display: inline-flex; align-items: center; gap: 6px; background: #d5293f; color: #fff; border: none; border-radius: 6px; padding: 8px 16px; font-size: 13px; cursor: pointer; text-decoration: none; transition: background .15s; }
            .adaire-create-btn:hover { background: #b5233a; color: #fff; }
            .adaire-create-btn.loading { opacity: .6; pointer-events: none; }
            .adaire-create-btn.secondary { background: transparent; color: #d5293f; border: 1px solid #fccdd2; }
            .adaire-create-btn.secondary:hover { background: #fdf0f1; color: #b5233a; }

            .adaire-resources { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 36px; }
            .adaire-resource { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; text-decoration: none; color: inherit; transition: border-color .15s; display: block; }
            .adaire-resource:hover { border-color: #f4a0aa; color: inherit; text-decoration: none; }
            .adaire-resource-icon { font-size: 24px; margin-bottom: 8px; display: block; }
            .adaire-resource h3 { font-size: 14px; margin: 0 0 4px; color: #1e293b; }
            .adaire-resource p { font-size: 12px; color: #64748b; margin: 0; }

            .adaire-homepage-tip { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin-bottom: 36px; font-size: 13px; color: #92400e; display: flex; align-items: flex-start; gap: 12px; }
            .adaire-homepage-tip a { color: #b45309; }

            .adaire-hf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 36px; }
            .adaire-hf-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; transition: border-color .15s, box-shadow .15s; }
            .adaire-hf-card:hover { border-color: #f4a0aa; box-shadow: 0 4px 16px rgba(213,41,63,.1); color: inherit; text-decoration: none; }
            .adaire-hf-card.is-add { border-style: dashed; background: #fafafa; }
            .adaire-hf-icon { font-size: 26px; flex-shrink: 0; }
            .adaire-hf-card h3 { font-size: 14px; font-weight: 600; margin: 0 0 3px; color: #1e293b; }
            .adaire-hf-card p { font-size: 12px; color: #64748b; margin: 0; line-height: 1.4; }
            .adaire-hf-arrow { margin-left: auto; color: #cbd5e1; font-size: 18px; flex-shrink: 0; }
            .adaire-hf-theme-tag { display: inline-block; font-size: 11px; background: #f1f5f9; color: #475569; border-radius: 4px; padding: 2px 7px; margin-bottom: 16px; }
            .adaire-hf-classic-note { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #64748b; margin-bottom: 36px; }
        </style>

        <div class="adaire-welcome">

            <div class="adaire-welcome-hero">
                <div class="adaire-welcome-hero-text">
                    <h1><?php esc_html_e( '👋 Welcome to GutenBlocks Free', 'adaire-blocks' ); ?></h1>
                    <p><?php esc_html_e( "You're set up and ready to build. Create a starter page below or explore the blocks in the editor.", 'adaire-blocks' ); ?></p>
                    <span class="adaire-welcome-hero-badge">v<?php echo esc_html( ADAIRE_BLOCKS_VERSION ); ?> — Free</span>
                </div>
            </div>

            <div class="adaire-welcome-steps">
                <div class="adaire-step">
                    <div class="adaire-step-num">1</div>
                    <h3><?php esc_html_e( 'Choose a starter template', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Pick one of the ready-made page layouts below. A draft page opens in the editor.', 'adaire-blocks' ); ?></p>
                </div>
                <div class="adaire-step">
                    <div class="adaire-step-num">2</div>
                    <h3><?php esc_html_e( 'Customise the content', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Replace the placeholder text and images with your own. Every block is editable.', 'adaire-blocks' ); ?></p>
                </div>
                <div class="adaire-step">
                    <div class="adaire-step-num">3</div>
                    <h3><?php esc_html_e( 'Publish & set as homepage', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Publish the page, then go to Settings → Reading to set it as your static front page.', 'adaire-blocks' ); ?></p>
                </div>
            </div>

            <div id="adaire-homepage-tip" class="adaire-homepage-tip" style="display:none;">
                ✅ &nbsp;<span id="adaire-tip-text"></span>
                <a href="<?php echo esc_url( admin_url( 'options-reading.php' ) ); ?>" style="margin-left:8px; white-space:nowrap;">
                    <?php esc_html_e( 'Set as homepage →', 'adaire-blocks' ); ?>
                </a>
            </div>

            <p class="adaire-section-title"><?php esc_html_e( 'Starter Page Templates', 'adaire-blocks' ); ?></p>
            <p class="adaire-section-subtitle"><?php esc_html_e( 'Each button creates a draft page pre-filled with that layout and opens the editor.', 'adaire-blocks' ); ?></p>

            <div class="adaire-templates">
                <?php foreach ( $templates as $tpl ) : ?>
                <div class="adaire-template-card">
                    <span class="adaire-template-icon"><?php echo $tpl['icon']; // phpcs:ignore WordPress.Security.EscapeOutput -- emoji literal ?></span>
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
                        ＋ <?php esc_html_e( 'Create Page', 'adaire-blocks' ); ?>
                    </button>
                </div>
                <?php endforeach; ?>
            </div>

            <p class="adaire-section-title"><?php esc_html_e( 'Header &amp; Footer', 'adaire-blocks' ); ?></p>
            <p class="adaire-section-subtitle"><?php esc_html_e( 'Edit your theme\'s header or footer directly in the Site Editor.', 'adaire-blocks' ); ?></p>
            <span class="adaire-hf-theme-tag"><?php echo esc_html( __( 'Active theme: ', 'adaire-blocks' ) . $theme_name ); ?></span>

            <?php if ( $is_block_theme ) : ?>
            <div class="adaire-hf-grid">
                <a href="<?php echo esc_url( $header_url ); ?>" class="adaire-hf-card">
                    <span class="adaire-hf-icon">🔝</span>
                    <div>
                        <h3><?php esc_html_e( 'Edit Header', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Logo, navigation &amp; top bar', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow">›</span>
                </a>
                <a href="<?php echo esc_url( $footer_url ); ?>" class="adaire-hf-card">
                    <span class="adaire-hf-icon">⬇️</span>
                    <div>
                        <h3><?php esc_html_e( 'Edit Footer', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Links, copyright &amp; social icons', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow">›</span>
                </a>
                <a href="<?php echo esc_url( $all_parts_url ); ?>" class="adaire-hf-card is-add">
                    <span class="adaire-hf-icon">🧩</span>
                    <div>
                        <h3><?php esc_html_e( 'All Template Parts', 'adaire-blocks' ); ?></h3>
                        <p><?php esc_html_e( 'Browse, add or manage all parts', 'adaire-blocks' ); ?></p>
                    </div>
                    <span class="adaire-hf-arrow">›</span>
                </a>
            </div>
            <?php else : ?>
            <div class="adaire-hf-classic-note">
                ℹ️ &nbsp;<?php printf(
                    /* translators: %s: theme name */
                    esc_html__( 'Your active theme (%s) is a classic theme. Header and footer editing is available for block themes via the Site Editor. Switch to a block theme (e.g. Twenty Twenty-Four) to use these shortcuts.', 'adaire-blocks' ),
                    '<strong>' . esc_html( $theme_name ) . '</strong>'
                ); ?>
                <a href="<?php echo esc_url( admin_url( 'themes.php' ) ); ?>" style="margin-left:6px;"><?php esc_html_e( 'Browse themes →', 'adaire-blocks' ); ?></a>
            </div>
            <?php endif; ?>

            <p class="adaire-section-title"><?php esc_html_e( 'Resources', 'adaire-blocks' ); ?></p>

            <div class="adaire-resources">
                <a href="<?php echo esc_url( $docs_url . 'getting-started/' ); ?>" target="_blank" class="adaire-resource">
                    <span class="adaire-resource-icon">📖</span>
                    <h3><?php esc_html_e( 'Getting Started Guide', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Step-by-step walkthrough of every block and setting.', 'adaire-blocks' ); ?></p>
                </a>
                <a href="<?php echo esc_url( $docs_url . 'blocks/' ); ?>" target="_blank" class="adaire-resource">
                    <span class="adaire-resource-icon">🧩</span>
                    <h3><?php esc_html_e( 'Block Reference', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Attributes, options, and examples for all free blocks.', 'adaire-blocks' ); ?></p>
                </a>
                <a href="<?php echo esc_url( $support_url ); ?>" target="_blank" class="adaire-resource">
                    <span class="adaire-resource-icon">💬</span>
                    <h3><?php esc_html_e( 'Support', 'adaire-blocks' ); ?></h3>
                    <p><?php esc_html_e( 'Submit a ticket or browse answered questions.', 'adaire-blocks' ); ?></p>
                </a>
            </div>

        </div><!-- .adaire-welcome -->
        </div><!-- .wrap -->

        <script>
        (function() {
            var nonce   = <?php echo wp_json_encode( $nonce ); ?>;
            var ajaxUrl = <?php echo wp_json_encode( $ajax_url ); ?>;

            document.querySelectorAll('.adaire-create-btn[data-pattern]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var pattern  = btn.dataset.pattern;
                    var title    = btn.dataset.title;
                    var isHome   = btn.dataset.homepage === '1';
                    var original = btn.textContent;

                    btn.classList.add('loading');
                    btn.textContent = '⏳ Creating…';

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
        })();
        </script>
        <?php
    }
}
