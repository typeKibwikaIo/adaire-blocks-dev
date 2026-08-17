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

	public static function queue_activation_redirect() {
		set_transient( 'adaire_blocks_activation_redirect', true, MINUTE_IN_SECONDS );
	}

	public static function maybe_redirect_after_activation() {
		if ( ! get_transient( 'adaire_blocks_activation_redirect' ) ) {
			return;
		}
		delete_transient( 'adaire_blocks_activation_redirect' );
		if (
			wp_doing_ajax() ||
			( is_multisite() && is_network_admin() ) ||
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only check for WP core's own bulk-activation query flag, not form data.
			isset( $_GET['activate-multi'] ) ||
			! current_user_can( 'manage_options' )
		) {
			return;
		}
		wp_safe_redirect( admin_url( 'admin.php?page=adaire-blocks-welcome' ) );
		exit;
	}

	/**
	 * Register the admin menu.
	 *
	 * Unlike the standalone free plugin (where admin/settings-page.php always
	 * registers the top-level 'adaire-blocks-settings' page via add_menu_page()
	 * regardless of whether this Welcome screen is present), the Pro plugin's
	 * admin/settings-page.php deliberately SKIPS add_menu_page() whenever this
	 * class exists — it nests itself as a "Pro Settings" submenu instead, to
	 * avoid registering a competing top-level menu when the free plugin (which
	 * also defines Adaire_Welcome_Screen) is active alongside Pro. That means
	 * when Pro supplies its own bundled copy of this class (i.e. the free
	 * plugin isn't active), nobody else will call add_menu_page() — so this
	 * method must register the top-level page itself.
	 */
	public static function add_menu_page() {
		$svg_icon = 'data:image/svg+xml;base64,' . base64_encode( '<svg width="20" height="20" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d="M408.523 321.353H163.388V393.981H401.889V483.583H195.142C156 483.583 125 516.017 125 556.18V645.814C125 685.978 156 718.411 195.142 718.411H401.889V645.814H201.776V556.18H401.889V645.814H477.941V393.981C477.941 353.818 446.941 321.353 408.523 321.353Z" fill="black"/><path d="M603.247 267.692V357.441H801.292C842.251 357.441 875 389.932 875 429.647V643.346C875 686.658 838.511 718.412 793.842 718.412H592.057C553.348 718.412 522.059 688.102 522.059 650.569V189C566.728 189 603.217 224.381 603.217 267.692H603.247ZM603.247 650.569H793.842V429.647H603.247V650.569Z" fill="black"/></svg>' );

		add_menu_page(
			__( 'Adaire Blocks', 'adaire-blocks' ),
			__( 'Adaire Blocks', 'adaire-blocks' ),
			'manage_options',
			'adaire-blocks-settings',
			array( __CLASS__, 'render' ),
			$svg_icon,
			30
		);

		add_submenu_page(
			'adaire-blocks-settings',
			__( 'Welcome to Adaire Blocks', 'adaire-blocks' ),
			__( 'Welcome / Quick Start', 'adaire-blocks' ),
			'manage_options',
			'adaire-blocks-welcome',
			array( __CLASS__, 'render' )
		);
	}

	/**
	 * Pin the "Adaire Blocks" submenu into a deterministic order:
	 * Welcome / Quick Start first (so the top-level "Adaire Blocks" link —
	 * whose href WP derives from whichever submenu item is first in this
	 * array — always opens the Welcome screen), then Case Studies (if the
	 * Pro plugin's `AdaireCaseStudiesCPT` registered it, via its
	 * `edit.php?post_type=adaire_case_study` slug) right after it, with
	 * everything else left in its original relative order. Without this,
	 * both items are only ordered by hook-registration timing, which is
	 * not guaranteed and previously let a differently-ordered submenu
	 * change which page the top-level link opened.
	 */
	public static function move_to_top() {
		global $submenu;
		$parent = 'adaire-blocks-settings';
		if ( empty( $submenu[ $parent ] ) ) {
			return;
		}

		$pinned_slugs = array(
			'adaire-blocks-welcome',
			'edit.php?post_type=adaire_case_study',
		);

		$pinned  = array();
		$rest    = array();
		foreach ( $submenu[ $parent ] as $item ) {
			if ( isset( $item[2] ) && in_array( $item[2], $pinned_slugs, true ) ) {
				$pinned[ $item[2] ] = $item;
			} else {
				$rest[] = $item;
			}
		}

		if ( empty( $pinned ) ) {
			return;
		}

		$ordered = array();
		foreach ( $pinned_slugs as $slug ) {
			if ( isset( $pinned[ $slug ] ) ) {
				$ordered[] = $pinned[ $slug ];
			}
		}

		$submenu[ $parent ] = array_merge( $ordered, $rest );
	}

	public static function create_starter_page() {
		check_ajax_referer( 'adaire_create_page', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Insufficient permissions.', 'adaire-blocks' ) ) );
		}
		$pattern_slug = sanitize_text_field( wp_unslash( $_POST['pattern'] ?? 'adaire-blocks/landing-page' ) );
		$registry     = WP_Block_Patterns_Registry::get_instance();
		$pattern      = $registry->get_registered( $pattern_slug );
		if ( ! $pattern ) {
			wp_send_json_error( array( 'message' => __( 'Pattern not found.', 'adaire-blocks' ) ) );
		}
		$page_id = wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'draft',
				'post_title'   => $pattern['title'],
				'post_content' => $pattern['content'],
			),
			true
		);
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

	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized', 'adaire-blocks' ) );
		}

		$nonce         = wp_create_nonce( 'adaire_create_page' );
		$ajax_url      = admin_url( 'admin-ajax.php' );
		$docs_url      = 'https://adaire.digital/docs/';
		$support_url   = 'https://adaire.digital/support/';
		// The free plugin's Settings page keeps the shared 'adaire-blocks-settings'
		// slug. The Pro plugin nests its Settings page under 'adaire-blocks-pro-settings'
		// instead (see admin/settings-page.php), since 'adaire-blocks-settings' is this
		// Welcome screen's own top-level slug when Pro supplies this class itself.
		$is_free_build = defined( 'ADAIRE_BLOCKS_IS_FREE' ) && ADAIRE_BLOCKS_IS_FREE;
		$settings_url  = admin_url( 'admin.php?page=' . ( $is_free_build ? 'adaire-blocks-settings' : 'adaire-blocks-pro-settings' ) );
		$migration_url = admin_url( 'admin.php?page=adaire-blocks-migration' );
		$exit_url      = admin_url();
		$new_page_url  = admin_url( 'post-new.php?post_type=page' );

		$templates_json = wp_json_encode(
			array(
				array(
					'slug'  => 'adaire-blocks/landing-page',
					'label' => 'Landing Page',
					'desc'  => 'Hero, features, testimonials & CTA',
					'color' => '#C9463F',
					'rec'   => true,
				),
				array(
					'slug'  => 'adaire-blocks/about-page',
					'label' => 'About Page',
					'desc'  => 'Story, timeline & testimonials',
					'color' => '#3B82F6',
					'rec'   => false,
				),
				array(
					'slug'  => 'adaire-blocks/services-page',
					'label' => 'Services Page',
					'desc'  => 'Hero, info grid & pricing table',
					'color' => '#8B5CF6',
					'rec'   => false,
				),
				array(
					'slug'  => 'adaire-blocks/blog-landing',
					'label' => 'Blog Landing',
					'desc'  => 'Hero with a posts grid',
					'color' => '#10B981',
					'rec'   => false,
				),
				array(
					'slug'  => 'adaire-blocks/contact-page',
					'label' => 'Contact Page',
					'desc'  => 'Hero with two-column contact layout',
					'color' => '#F59E0B',
					'rec'   => false,
				),
				array(
					'slug'  => '',
					'label' => 'Blank Canvas',
					'desc'  => 'Start from scratch',
					'color' => '#64748B',
					'rec'   => false,
				),
			)
		);

		// Welcome images (shown in step 1 collage scene).
		$img_base     = plugins_url( 'images/', __FILE__ );
		$img_hero     = file_exists( __DIR__ . '/images/welcome-hero.png' ) ? $img_base . 'welcome-hero.png' : '';
		$img_showcase = file_exists( __DIR__ . '/images/welcome-showcase.png' ) ? $img_base . 'welcome-showcase.png' : '';

		// Build Lottie URL map — only includes files that actually exist on disk.
		// Step 2 maps each option to {left, right} using name1.json / name2.json pairs.
		$lottie_base = plugins_url( 'lottie/', __FILE__ );
		$lottie_dir  = __DIR__ . '/lottie/';
		$lottie_map  = array();

		// Step 1 — single file per option (overlay on scene).
		$step1_files = array( 'myself', 'business', 'client', 'exploring' );
		foreach ( $step1_files as $idx => $slug ) {
			$f = $lottie_dir . 'step-1-who/' . $slug . '.json';
			if ( file_exists( $f ) ) {
				$lottie_map[0][ $idx ] = $lottie_base . 'step-1-who/' . $slug . '.json';
			}
		}

		// Step 2 — name1.json (left corner) + name2.json (right corner) per option.
		$step2_opts = array( 'business', 'store', 'company', 'blog', 'landing', 'portfolio', 'booking', 'other' );
		foreach ( $step2_opts as $idx => $slug ) {
			$pair = array();
			$f1   = $lottie_dir . 'step-2-topic/' . $slug . '1.json';
			$f2   = $lottie_dir . 'step-2-topic/' . $slug . '2.json';
			if ( file_exists( $f1 ) ) {
				$pair['left'] = $lottie_base . 'step-2-topic/' . $slug . '1.json';
			}
			if ( file_exists( $f2 ) ) {
				$pair['right'] = $lottie_base . 'step-2-topic/' . $slug . '2.json';
			}
			if ( ! empty( $pair ) ) {
				$lottie_map[1][ $idx ] = $pair;
			}
		}

		// Steps 3–5 — single file per option (overlay).
		$other_steps = array(
			2 => array(
				'dir'   => 'step-3-experience',
				'files' => array( 'beginner', 'intermediate', 'advanced' ),
			),
			3 => array(
				'dir'   => 'step-4-template',
				'files' => array( 'landing-page', 'about-page', 'services-page', 'blog-landing', 'contact-page', 'blank-canvas' ),
			),
			4 => array(
				'dir'   => 'step-5-features',
				'files' => array( 'testimonials', 'pricing-table', 'counter', 'flip-card', 'animation-scroll', 'mega-menu', 'modal-popup', 'video-hero' ),
			),
		);
		foreach ( $other_steps as $step_idx => $step ) {
			foreach ( $step['files'] as $opt_idx => $filename ) {
				$f = $lottie_dir . $step['dir'] . '/' . $filename . '.json';
				if ( file_exists( $f ) ) {
					$lottie_map[ $step_idx ][ $opt_idx ] = $lottie_base . $step['dir'] . '/' . $filename . '.json';
				}
			}
		}

		$version   = defined( 'ADAIRE_BLOCKS_VERSION' ) ? ADAIRE_BLOCKS_VERSION : '1.0';
		$brand_svg = '<svg viewBox="0 0 1000 1000" fill="currentColor"><path d="M408.523 321.353H163.388V393.981H401.889V483.583H195.142C156 483.583 125 516.017 125 556.18V645.814C125 685.978 156 718.411 195.142 718.411H401.889V645.814H201.776V556.18H401.889V645.814H477.941V393.981C477.941 353.818 446.941 321.353 408.523 321.353Z"/><path d="M603.247 267.692V357.441H801.292C842.251 357.441 875 389.932 875 429.647V643.346C875 686.658 838.511 718.412 793.842 718.412H592.057C553.348 718.412 522.059 688.102 522.059 650.569V189C566.728 189 603.217 224.381 603.217 267.692H603.247ZM603.247 650.569H793.842V429.647H603.247V650.569Z"/></svg>';
		?>
		<div class="wrap abw-shell">
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
		<script src="<?php echo esc_url( plugins_url( 'js/lottie.min.js', __FILE__ ) ); ?>"></script>
		<style>
		/* ── WP chrome reset ── */
		.abw-shell{margin:0!important;max-width:none!important;padding:0!important;}
		#wpadminbar,#adminmenumain,#adminmenuback,#adminmenuwrap,#wpfooter,.update-nag,.notice{display:none!important;}
		html.wp-toolbar{padding-top:0!important;}
		#wpcontent,#wpbody,#wpbody-content{margin-left:0!important;padding-left:0!important;padding-bottom:0!important;}
		#wpbody-content>div:not(.abw-shell){display:none!important;}
		html,body,#wpwrap{height:100%;}

		/* ── Tokens ── */
		.abw{
			--bg:#F4F8FA;
			--panel:#fff;
			--ink:#14181F;
			--ink2:#1e293b;
			--muted:#6B7280;
			--faint:#94a3b8;
			--accent:#C9463F;
			--accent-d:#AE3A34;
			--accent-t:rgba(201,70,63,.08);
			--line:rgba(20,24,31,.10);
			--line-s:rgba(20,24,31,.06);
			--sh1:0 1px 3px rgba(20,24,31,.06);
			--sh2:0 10px 28px rgba(20,24,31,.10);
			--sh3:0 24px 56px rgba(20,24,31,.16);
			--sh-acc:0 14px 36px rgba(201,70,63,.28);
			--ease:cubic-bezier(.22,1,.36,1);
			--r-sm:10px;--r-md:14px;--r-lg:20px;--r-pill:999px;
			font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
			background:var(--bg);
			color:var(--ink);
			height:100vh;
			display:flex;
			flex-direction:column;
			overflow:hidden;
		}
		.abw *{box-sizing:border-box;}
		.abw svg{display:block;}

		/* ── Topbar ── */
		.abw-top{
			display:flex;align-items:center;justify-content:space-between;
			padding:14px 28px;background:var(--panel);
			border-bottom:1px solid var(--line);flex-shrink:0;z-index:10;
		}
		.abw-brand{display:flex;align-items:center;gap:9px;}
		.abw-brand-icon{width:22px;height:22px;color:var(--accent);}
		.abw-brand-icon svg{width:100%;height:100%;}
		.abw-brand-name{font-family:'Poppins',sans-serif;font-weight:800;font-size:17px;letter-spacing:-.02em;color:var(--ink);}
		.abw-top-right{display:flex;align-items:center;gap:18px;}
		.abw-counter{font-size:12px;font-weight:600;color:var(--faint);letter-spacing:.01em;}
		.abw-top-exit{font-size:13px;font-weight:600;color:var(--muted);text-decoration:none;transition:color .18s;}
		.abw-top-exit:hover{color:var(--ink);text-decoration:none;}
		.abw-upgrade{background:var(--accent);color:#fff;padding:7px 16px;border-radius:var(--r-pill);font-size:12.5px;font-weight:600;border:none;cursor:pointer;text-decoration:none;transition:background .18s;}
		.abw-upgrade:hover{background:var(--accent-d);color:#fff;text-decoration:none;}

		/* ── Progress ── */
		.abw-prog-track{height:3px;background:var(--line);flex-shrink:0;}
		.abw-prog-fill{height:100%;width:0%;background:var(--accent);}

		/* ── Stage ── */
		.abw-stage{flex:1;display:flex;min-height:0;}
		.abw-left{
			width:46%;padding:clamp(36px,5vh,68px) clamp(28px,5vw,68px);
			display:flex;flex-direction:column;justify-content:center;
			overflow-y:auto;flex-shrink:0;
		}
		.abw-right{flex:1;padding:20px 20px 20px 0;}
		.abw-scene-panel{
			height:100%;border-radius:var(--r-lg);position:relative;overflow:hidden;
			background:radial-gradient(120% 100% at 20% 0%,#CFE3EC 0%,#A9CDDD 60%,#EAB7A0 130%);
		}
		#abw-scene{position:absolute;inset:0;}

		/* ── Question area ── */
		.abw-eyebrow{
			display:inline-flex;font-size:12.5px;font-weight:600;color:var(--accent-d);
			background:var(--accent-t);padding:6px 14px;border-radius:var(--r-pill);
			margin-bottom:20px;letter-spacing:.01em;
		}
		.abw-question{
			font-family:'Poppins',sans-serif;font-weight:700;
			font-size:clamp(21px,2.4vw,31px);letter-spacing:-.02em;line-height:1.18;
			color:var(--ink);margin:0 0 10px;max-width:480px;
		}
		.abw-sub{font-size:13.5px;color:var(--muted);line-height:1.65;margin:0 0 30px;max-width:440px;}

		/* ── Option cards ── */
		.abw-opts{display:grid;gap:10px;max-width:480px;}
		.abw-opts.cols-2{grid-template-columns:1fr 1fr;}
		.abw-opt{
			background:var(--panel);border:1.5px solid var(--line);border-radius:var(--r-md);
			padding:14px 17px;cursor:pointer;text-align:left;font-family:'Inter',sans-serif;
			font-size:13.5px;font-weight:500;color:var(--ink);
			transition:border-color .18s,background .18s,transform .12s,box-shadow .18s;
			position:relative;display:flex;flex-direction:column;gap:4px;will-change:transform;
		}
		.abw-opt:hover{border-color:rgba(201,70,63,.4);transform:translateY(-2px);box-shadow:var(--sh2);}
		.abw-opt.selected{border-color:var(--accent);background:var(--accent-t);box-shadow:0 0 0 1px var(--accent);}
		.abw-opt-label{font-weight:600;font-size:13.5px;}
		.abw-opt-desc{font-size:12px;color:var(--muted);font-weight:400;}
		.abw-opt-icon{width:19px;height:19px;margin-bottom:3px;color:var(--accent);}
		.abw-opt-icon svg{width:100%;height:100%;stroke:var(--accent);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;}
		.abw-badge-pro{position:absolute;top:9px;right:9px;font-size:9px;font-weight:700;letter-spacing:.05em;color:var(--accent);background:var(--accent-t);padding:2px 7px;border-radius:5px;text-transform:uppercase;}
		.abw-badge-rec{position:absolute;top:-8px;left:14px;font-size:9px;font-weight:700;color:#fff;background:var(--accent);padding:2px 9px;border-radius:var(--r-pill);text-transform:uppercase;letter-spacing:.03em;}
		.abw-badge-free{position:absolute;top:9px;right:9px;font-size:9px;font-weight:700;letter-spacing:.04em;color:#15803d;background:rgba(21,128,61,.1);padding:2px 7px;border-radius:5px;text-transform:uppercase;}
		.abw-color-dot{width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0;align-self:flex-start;margin-top:3px;}

		/* ── Final state ── */
		.abw-final{display:none;flex-direction:column;}
		.abw-final.is-on{display:flex;}
		.abw-final-check{
			width:54px;height:54px;border-radius:50%;flex-shrink:0;
			background:linear-gradient(135deg,var(--accent-d),var(--accent));
			display:flex;align-items:center;justify-content:center;
			margin-bottom:22px;box-shadow:var(--sh-acc);
		}
		.abw-final-check svg{width:24px;height:24px;stroke:#fff;stroke-width:2.4;fill:none;stroke-linecap:round;stroke-linejoin:round;}
		.abw-final-pill{display:inline-flex;font-size:12.5px;font-weight:600;color:var(--accent-d);background:var(--accent-t);padding:6px 14px;border-radius:var(--r-pill);margin-bottom:14px;}
		.abw-final-title{font-family:'Poppins',sans-serif;font-weight:700;font-size:clamp(22px,2.6vw,33px);letter-spacing:-.02em;color:var(--ink);margin:0 0 10px;}
		.abw-final-sub{font-size:13.5px;color:var(--muted);line-height:1.65;margin:0 0 28px;max-width:440px;}
		.abw-create{
			display:inline-flex;align-items:center;gap:10px;
			background:linear-gradient(135deg,var(--accent-d),var(--accent));
			color:#fff;border:none;padding:14px 26px;border-radius:var(--r-pill);
			font-family:'Inter',sans-serif;font-weight:600;font-size:14.5px;cursor:pointer;
			box-shadow:var(--sh-acc);transition:transform .25s var(--ease),box-shadow .25s var(--ease);
			margin-bottom:28px;
		}
		.abw-create:hover{transform:translateY(-2px);box-shadow:0 20px 46px rgba(201,70,63,.36);}
		.abw-create.loading{opacity:.75;pointer-events:none;}
		.abw-create.loading::before{content:'';width:13px;height:13px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:abw-spin .6s linear infinite;flex-shrink:0;}
		@keyframes abw-spin{to{transform:rotate(360deg);}}
		.abw-final-links{display:flex;flex-direction:column;gap:9px;}
		.abw-final-link{
			display:flex;align-items:center;gap:12px;padding:13px 16px;
			border-radius:var(--r-md);background:var(--panel);border:1.5px solid var(--line);
			text-decoration:none;color:var(--ink);font-size:13px;font-weight:600;
			transition:border-color .2s,transform .2s;
		}
		.abw-final-link:hover{border-color:rgba(201,70,63,.35);transform:translateX(3px);color:var(--ink);text-decoration:none;}
		.abw-fl-icon{width:17px;height:17px;color:var(--accent);flex-shrink:0;}
		.abw-fl-icon svg{width:100%;height:100%;}
		.abw-fl-meta{font-size:11.5px;color:var(--muted);font-weight:400;margin-top:1px;}

		/* ── Footer ── */
		.abw-foot{
			display:flex;align-items:center;justify-content:space-between;
			padding:15px 28px;border-top:1px solid var(--line);
			background:var(--panel);flex-shrink:0;z-index:10;
		}
		.abw-back{
			display:flex;align-items:center;gap:6px;background:none;border:none;
			font-size:13px;font-weight:600;color:var(--ink);cursor:pointer;opacity:.6;
			transition:opacity .18s;font-family:'Inter',sans-serif;
		}
		.abw-back svg{width:15px;height:15px;}
		.abw-back:hover{opacity:1;}
		.abw-back:disabled{opacity:.22;cursor:default;}
		.abw-foot-r{display:flex;gap:10px;}
		.abw-skip{
			background:var(--panel);border:1.5px solid var(--line);color:var(--ink);
			font-family:'Inter',sans-serif;font-size:13px;font-weight:600;
			padding:9px 17px;border-radius:var(--r-pill);cursor:pointer;transition:border-color .18s;
		}
		.abw-skip:hover{border-color:rgba(20,24,31,.25);}
		.abw-cont{
			background:var(--accent);border:none;color:#fff;
			font-family:'Inter',sans-serif;font-size:13px;font-weight:600;
			padding:9px 20px;border-radius:var(--r-pill);cursor:pointer;
			transition:background .18s,transform .18s;
		}
		.abw-cont:hover{background:var(--accent-d);transform:translateY(-1px);}
		.abw-cont:disabled{background:#D7DDE1;color:#9aa1a8;cursor:default;transform:none;}

		/* ── Scenes ── */
		/* Collage */
		.abw-mc{position:absolute;background:#fff;border-radius:10px;box-shadow:0 14px 32px -14px rgba(20,24,31,.3);padding:9px;}
		.abw-mb{background:#EEF2F5;border-radius:4px;height:7px;margin-bottom:5px;}
		.abw-mp{background:#DCE6EA;border-radius:6px;margin-bottom:7px;}
		/* Site mockup (word/topic scene) */
		.abw-ws-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:32px;}
		.abw-ws-card{position:relative;width:300px;background:#fff;border-radius:16px;box-shadow:0 22px 54px -18px rgba(20,24,31,.35);overflow:hidden;}
		.abw-ws-nav{height:26px;background:#F5F7F9;display:flex;align-items:center;gap:5px;padding:0 10px;}
		.abw-ws-nav>span{width:6px;height:6px;border-radius:50%;background:#D7DDE1;flex-shrink:0;}
		.abw-ws-url{margin-left:8px;flex:1;background:#fff;border-radius:5px;height:16px;display:flex;align-items:center;gap:5px;padding:0 8px;font-size:9px;font-family:'Inter',sans-serif;color:var(--muted);font-weight:500;overflow:hidden;white-space:nowrap;}
		.abw-ws-dot{width:5px;height:5px;border-radius:50%;background:#22C55E;flex-shrink:0;}
		.abw-ws-hero{height:96px;position:relative;overflow:hidden;background:linear-gradient(120deg,var(--accent),#E5847D);transition:background .5s ease;}
		.abw-ws-hero::after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent 20%,rgba(255,255,255,.35) 40%,transparent 60%);background-size:200% 100%;animation:abwShimmer 2.6s ease-in-out infinite;}
		.abw-ws-body{padding:16px;display:flex;flex-direction:column;align-items:center;gap:9px;}
		.abw-ws-icon{width:34px;height:34px;border-radius:50%;background:var(--accent-t);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0;transition:color .3s ease,background .3s ease;}
		.abw-ws-icon svg{width:18px;height:18px;stroke-width:1.8;}
		.abw-ws-label{font-family:'Poppins',sans-serif;font-weight:700;font-size:14.5px;color:var(--ink);}
		.abw-ws-row{width:100%;height:8px;border-radius:5px;background:#EEF2F5;}
		@keyframes abwShimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
		/* Level */
		.abw-lv-wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:40px;}
		.abw-lv-word{font-family:'Poppins',sans-serif;font-weight:800;color:#fff;font-size:clamp(34px,6vw,62px);letter-spacing:-.02em;text-transform:uppercase;}
		.abw-lv-track{width:78%;height:5px;background:rgba(255,255,255,.25);border-radius:3px;overflow:hidden;}
		.abw-lv-fill{height:100%;width:0%;background:#fff;border-radius:3px;}
		/* Template stack */
		.abw-sk{position:absolute;left:50%;top:50%;width:268px;height:182px;background:#fff;border-radius:14px;box-shadow:0 18px 44px -18px rgba(20,24,31,.35);overflow:hidden;}
		.abw-sk-hero{height:78px;}
		.abw-sk-body{padding:13px;}
		.abw-sk-bar{background:#EEF2F5;border-radius:5px;height:8px;margin-bottom:8px;}
		.abw-sk-lbl{font-size:9.5px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;font-family:'Inter',sans-serif;}
		/* Page builder (feature spotlight scene) */
		.abw-pg-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;}
		.abw-pg-card{position:relative;width:300px;background:#fff;border-radius:16px;box-shadow:0 22px 54px -18px rgba(20,24,31,.35);overflow:hidden;display:flex;flex-direction:column;}
		.abw-pg-nav{height:24px;background:#F5F7F9;display:flex;align-items:center;gap:5px;padding:0 10px;flex-shrink:0;}
		.abw-pg-nav span{width:6px;height:6px;border-radius:50%;background:#D7DDE1;}
		.abw-pg-hero{height:64px;flex-shrink:0;position:relative;overflow:hidden;background:linear-gradient(120deg,var(--accent),#E5847D);}
		.abw-pg-hero::after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent 20%,rgba(255,255,255,.3) 40%,transparent 60%);background-size:200% 100%;animation:abwShimmer 2.8s ease-in-out infinite;}
		.abw-pg-body{padding:12px;display:flex;flex-direction:column;gap:10px;max-height:260px;overflow-y:auto;}
		.abw-pg-empty{font-size:11.5px;color:var(--faint);text-align:center;padding:22px 8px;font-family:'Inter',sans-serif;}
		.abw-pg-sec{background:#F8FAFB;border:1px solid var(--line-s);border-radius:10px;padding:10px;}
		.abw-pg-sec-lbl{font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;font-family:'Inter',sans-serif;}
		.abw-pg-pro-tag{color:var(--accent);}
		/* Testimonials */
		.abw-pg-testi-row{display:flex;gap:8px;}
		.abw-pg-testi-card{flex:1;background:#fff;border-radius:8px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:4px;box-shadow:0 2px 6px rgba(20,24,31,.06);}
		.abw-pg-avatar{width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#E5847D);}
		.abw-pg-stars{font-size:8px;color:#F59E0B;letter-spacing:1px;}
		.abw-pg-line{width:80%;height:5px;border-radius:3px;background:#EEF2F5;}
		/* Pricing table */
		.abw-pg-price-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;}
		.abw-pg-price-col{background:#fff;border-radius:8px;padding:8px 6px;display:flex;flex-direction:column;align-items:center;gap:5px;box-shadow:0 2px 6px rgba(20,24,31,.06);}
		.abw-pg-price-col.featured{background:var(--accent-t);box-shadow:0 0 0 1.5px var(--accent);transform:scale(1.05);}
		.abw-pg-price-h{width:60%;height:5px;border-radius:3px;background:#EEF2F5;}
		.abw-pg-price-num{font-family:'Poppins',sans-serif;font-weight:800;font-size:13px;color:var(--ink);}
		.abw-pg-price-l{width:80%;height:4px;border-radius:3px;background:#EEF2F5;}
		/* Counter */
		.abw-pg-counter-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;}
		.abw-pg-counter-item{display:flex;flex-direction:column;gap:2px;}
		.abw-pg-counter-num{font-family:'Poppins',sans-serif;font-weight:800;font-size:17px;color:var(--accent);}
		.abw-pg-counter-lbl{font-size:8.5px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.04em;}
		/* Flip card */
		.abw-pg-flip-card{width:100%;height:64px;perspective:600px;}
		.abw-pg-flip-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:abwPgFlip 3.6s ease-in-out infinite;}
		.abw-pg-flip-front,.abw-pg-flip-back{position:absolute;inset:0;backface-visibility:hidden;border-radius:8px;}
		.abw-pg-flip-front{background:linear-gradient(135deg,var(--accent),#E5847D);}
		.abw-pg-flip-back{background:#EEF2F5;transform:rotateY(180deg);}
		@keyframes abwPgFlip{0%,38%{transform:rotateY(0deg);}50%,88%{transform:rotateY(180deg);}100%{transform:rotateY(360deg);}}
		/* Generic (pro placeholder) */
		.abw-pg-generic-bar{height:8px;border-radius:5px;background:#EEF2F5;margin-bottom:6px;}
		.abw-pg-generic-bar:last-child{margin-bottom:0;}
		/* Complete */
		.abw-cf{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:286px;background:#fff;border-radius:16px;box-shadow:0 22px 54px -18px rgba(20,24,31,.35);overflow:hidden;}
		.abw-cf-nav{height:22px;background:#F5F7F9;display:flex;align-items:center;gap:5px;padding:0 10px;}
		.abw-cf-nav span{width:5px;height:5px;border-radius:50%;background:#D7DDE1;}
		.abw-cf-body{padding:13px;display:grid;gap:9px;}
		.abw-cf-hero{height:56px;border-radius:8px;background:linear-gradient(120deg,var(--accent),#E5847D);}
		.abw-cf-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;}
		.abw-cf-row div{height:30px;border-radius:6px;background:#EEF2F5;}
		.abw-ring{position:absolute;border:1.4px solid rgba(255,255,255,.55);border-radius:50%;}
		/* Floating particles */
		.abw-dot{position:absolute;border-radius:50%;background:rgba(255,255,255,.6);}

		/* ── Responsive ── */
		@media(max-width:900px){
			.abw-stage{flex-direction:column;overflow-y:auto;}
			.abw-left,.abw-right{width:100%;}
			.abw-right{height:250px;padding:0 16px 16px;}
			.abw-scene-panel{border-radius:var(--r-md);}
		}
		@media(max-width:600px){
			.abw-opts.cols-2{grid-template-columns:1fr;}
			.abw-top{padding:12px 16px;}
			.abw-foot{padding:13px 16px;}
			.abw-left{padding:26px 18px;}
		}
		/* ── Lottie scene overlay (steps 3-5 decorative layer above GSAP scene) ── */
		#abw-scene .abw-scene-lottie{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:32px;box-sizing:border-box;pointer-events:none;z-index:2;}
		#abw-scene .abw-scene-lottie svg{display:block;width:100%!important;height:100%!important;}
		/* ── Word scene corner Lotties (step 2) ── */
		.abw-swl{position:absolute;bottom:-20px;width:300px;height:300px;pointer-events:none;z-index:3;}
		.abw-swl-l{left:-30px;}
		.abw-swl-r{right:-30px;}

		/* ── Scene complete ring animations ── */
		@keyframes abwRingIn { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
		@keyframes abwRingPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.05)} }

		@media(prefers-reduced-motion:reduce){
			.abw,.abw *{animation:none!important;transition:none!important;}
		}

		/* ── Pro upgrade popup ── */
		.abw-pro-overlay{position:fixed;inset:0;background:rgba(20,24,31,.55);backdrop-filter:blur(3px);z-index:9999;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .22s ease;}
		.abw-pro-overlay.is-open{opacity:1;pointer-events:all;}
		.abw-pro-modal{background:#fff;border-radius:var(--r-lg);padding:36px 32px 28px;width:360px;max-width:calc(100vw - 32px);box-shadow:var(--sh3);position:relative;transform:translateY(18px) scale(.96);transition:transform .28s cubic-bezier(0.34,1.56,0.64,1);}
		.abw-pro-overlay.is-open .abw-pro-modal{transform:translateY(0) scale(1);}
		.abw-pro-close{position:absolute;top:14px;right:14px;background:none;border:none;cursor:pointer;color:var(--faint);padding:4px;line-height:1;border-radius:6px;transition:color .15s,background .15s;}
		.abw-pro-close:hover{color:var(--ink);background:var(--line);}
		.abw-pro-icon{width:48px;height:48px;background:var(--accent-t);border-radius:14px;display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:16px;}
		.abw-pro-icon svg{width:24px;height:24px;}
		.abw-pro-feat{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);margin-bottom:6px;}
		.abw-pro-title{font-family:'Poppins',sans-serif;font-size:20px;font-weight:700;color:var(--ink);margin:0 0 10px;line-height:1.25;}
		.abw-pro-desc{font-size:13.5px;color:var(--muted);line-height:1.6;margin:0 0 24px;}
		.abw-pro-cta{display:block;width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r-pill);font-size:14px;font-weight:600;cursor:pointer;text-align:center;text-decoration:none;transition:background .18s;}
		.abw-pro-cta:hover{background:var(--accent-d);color:#fff;text-decoration:none;}
		.abw-pro-later{display:block;text-align:center;margin-top:12px;font-size:12.5px;color:var(--faint);cursor:pointer;background:none;border:none;width:100%;padding:4px;transition:color .15s;}
		.abw-pro-later:hover{color:var(--ink);}
		</style>

		<div class="abw" id="abw">

			<nav class="abw-top">
				<div class="abw-brand">
					<span class="abw-brand-icon"><?php echo $brand_svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Hardcoded static SVG markup literal, not user input. ?></span>
					<span class="abw-brand-name">AdaireBlocks</span>
				</div>
				<div class="abw-top-right">
					<span class="abw-counter" id="abw-counter">Step 1 of 5</span>
					<a href="<?php echo esc_url( $exit_url ); ?>" class="abw-top-exit"><?php esc_html_e( 'Skip setup →', 'adaire-blocks' ); ?></a>
					<a href="https://AdaireBlocks.com/pro/" target="_blank" rel="noopener" class="abw-upgrade"><?php esc_html_e( 'Upgrade', 'adaire-blocks' ); ?></a>


				</div>
			</nav>

			<div class="abw-prog-track"><div class="abw-prog-fill" id="abw-prog"></div></div>

			<main class="abw-stage">
				<div class="abw-left">
					<div id="abw-qblock">
						<div class="abw-eyebrow" id="abw-eyebrow"></div>
						<h2 class="abw-question" id="abw-question"></h2>
						<p class="abw-sub" id="abw-sub"></p>
						<div class="abw-opts" id="abw-opts"></div>
					</div>
					<div class="abw-final" id="abw-final"></div>
				</div>
				<div class="abw-right">
					<div class="abw-scene-panel">
						<div id="abw-scene"></div>
					</div>
				</div>
			</main>

			<footer class="abw-foot">
				<button class="abw-back" id="abw-back" disabled>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="11 18 5 12 11 6"/></svg>
					<?php esc_html_e( 'Back', 'adaire-blocks' ); ?>
				</button>
				<div class="abw-foot-r">
					<button class="abw-skip" id="abw-skip"><?php esc_html_e( 'Skip this step', 'adaire-blocks' ); ?></button>
					<button class="abw-cont" id="abw-cont" disabled><?php esc_html_e( 'Continue →', 'adaire-blocks' ); ?></button>
				</div>
			</footer>

			<div class="abw-pro-overlay" id="abw-pro-overlay" role="dialog" aria-modal="true">
				<div class="abw-pro-modal">
					<button class="abw-pro-close" id="abw-pro-close" aria-label="Close">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
					<div class="abw-pro-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
					</div>
					<div class="abw-pro-feat" id="abw-pro-feat">Pro Feature</div>
					<h3 class="abw-pro-title" id="abw-pro-title">Unlock this feature</h3>
					<p class="abw-pro-desc"><?php esc_html_e( 'This feature is available on AdaireBlocks Pro. Upgrade to access advanced blocks, animations, and more — all inside the editor you already love.', 'adaire-blocks' ); ?></p>
					<a href="https://AdaireBlocks.com/pro/" target="_blank" rel="noopener" class="abw-pro-cta"><?php esc_html_e( 'Upgrade to Pro →', 'adaire-blocks' ); ?></a>
					<button class="abw-pro-later" id="abw-pro-later"><?php esc_html_e( 'Maybe later', 'adaire-blocks' ); ?></button>
				</div>
			</div>
		</div>

		<script>
		(function(){
		'use strict';

		var NONCE      = <?php echo wp_json_encode( $nonce ); ?>;
		var AJAX_URL   = <?php echo wp_json_encode( $ajax_url ); ?>;
		var SETTINGS   = <?php echo wp_json_encode( $settings_url ); ?>;
		var MIGRATION  = <?php echo wp_json_encode( $migration_url ); ?>;
		var DOCS       = <?php echo wp_json_encode( $docs_url ); ?>;
		var SUPPORT    = <?php echo wp_json_encode( $support_url ); ?>;
		var NEW_PAGE   = <?php echo wp_json_encode( $new_page_url ); ?>;
		var TEMPLATES    = <?php echo $templates_json; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Already produced by wp_json_encode() above. ?>;
		var LOTTIE_MAP   = <?php echo wp_json_encode( $lottie_map ); ?>;
		var IMG_HERO     = <?php echo wp_json_encode( $img_hero ); ?>;
		var IMG_SHOWCASE = <?php echo wp_json_encode( $img_showcase ); ?>;

		/* ── Steps ── */
		var STEPS = [
			{
				eyebrow:  "Hey there! Let's get you set up.",
				question: "Who are you building this site for?",
				sub:      "This helps us personalise your block editor experience.",
				type:     "single",
				scene:    "collage",
				opts: [
					{ label:"Myself or someone I know" },
					{ label:"My business or workplace" },
					{ label:"A client" },
					{ label:"Just exploring" }
				]
			},
			{
				eyebrow:  "Good to know!",
				question: "What is your site about?",
				sub:      "Choose anything that applies — you can change this later.",
				type:     "multi",
				cols:     2,
				scene:    "word",
				opts: [
					{ label:"Business",     icon:"briefcase" },
					{ label:"Online Store", icon:"store"     },
					{ label:"Company",      icon:"building"  },
					{ label:"Blog",         icon:"doc"       },
					{ label:"Landing Page", icon:"layout"    },
					{ label:"Portfolio",    icon:"image"     },
					{ label:"Booking",      icon:"calendar"  },
					{ label:"Other",        icon:"search"    }
				]
			},
			{
				eyebrow:  "Great — let's calibrate your workspace.",
				question: "How experienced are you with the block editor?",
				sub:      "We'll adjust hints and suggestions to match your level.",
				type:     "single",
				scene:    "level",
				levels:   [28, 62, 100],
				opts: [
					{ label:"Just getting started",         desc:"New to Gutenberg blocks" },
					{ label:"Some experience",              desc:"I've built a few pages" },
					{ label:"Very comfortable with blocks", desc:"Blocks are my thing" }
				]
			},
			{
				eyebrow:  "Let's build something great.",
				question: "Pick a starter template for your first page",
				sub:      "We'll create an editable draft page in the editor — ready to customise.",
				type:     "single",
				scene:    "template",
				opts:     TEMPLATES.map(function(t){ return { label:t.label, desc:t.desc, color:t.color, slug:t.slug, rec:t.rec }; })
			},
			{
				eyebrow:  "Almost done!",
				question: "What features matter most to you?",
				sub:      "We'll highlight these in your editor. Items marked Free are included in your plan.",
				type:     "multi",
				cols:     2,
				scene:    "spotlight",
				opts: [
					{ label:"Testimonials",       free:true  },
					{ label:"Pricing Table",       free:true  },
					{ label:"Counter",              free:true  },
					{ label:"Flip Card",           free:true  },
					{ label:"Animation on Scroll", pro:true   },
					{ label:"Mega Menu",           pro:true   },
					{ label:"Modal Popup",         pro:true   },
					{ label:"Video Hero",          pro:true   }
				]
			},
			{ final:true, scene:"complete" }
		];

		var TOTAL_Q   = STEPS.filter(function(s){ return !s.final; }).length;
		var current   = 0;
		var sel       = {};
		var selTpl    = TEMPLATES[0];

		var E = {
			eyebrow:  document.getElementById('abw-eyebrow'),
			question: document.getElementById('abw-question'),
			sub:      document.getElementById('abw-sub'),
			opts:     document.getElementById('abw-opts'),
			qblock:   document.getElementById('abw-qblock'),
			final:    document.getElementById('abw-final'),
			scene:    document.getElementById('abw-scene'),
			prog:     document.getElementById('abw-prog'),
			counter:  document.getElementById('abw-counter'),
			back:     document.getElementById('abw-back'),
			skip:     document.getElementById('abw-skip'),
			cont:     document.getElementById('abw-cont')
		};

		/* ── Pro upgrade popup ── */
		var _proOverlay  = document.getElementById('abw-pro-overlay');
		var _proFeat     = document.getElementById('abw-pro-feat');
		var _proTitle    = document.getElementById('abw-pro-title');
		var _proClose    = document.getElementById('abw-pro-close');
		var _proLater    = document.getElementById('abw-pro-later');

		function showProUpgrade(featureName){
			if(_proFeat)  _proFeat.textContent  = featureName + ' — Pro Feature';
			if(_proTitle) _proTitle.textContent  = 'Unlock ' + featureName;
			if(_proOverlay) _proOverlay.classList.add('is-open');
		}
		function closeProUpgrade(){
			if(_proOverlay) _proOverlay.classList.remove('is-open');
		}
		if(_proClose)  _proClose.addEventListener('click', closeProUpgrade);
		if(_proLater)  _proLater.addEventListener('click', closeProUpgrade);
		if(_proOverlay) _proOverlay.addEventListener('click', function(e){ if(e.target===_proOverlay) closeProUpgrade(); });
		document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeProUpgrade(); });

		var ICONS = {
			briefcase: '<rect x="3" y="7" width="18" height="12" rx="1.5"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/>',
			store:     '<path d="M3 9l1-5h16l1 5"/><rect x="4" y="9" width="16" height="11" rx="1"/>',
			building:  '<rect x="4" y="2" width="16" height="20" rx="1.5"/><path d="M9 22V13h6v9"/><circle cx="9" cy="7" r=".8" fill="currentColor"/><circle cx="15" cy="7" r=".8" fill="currentColor"/>',
			doc:       '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>',
			layout:    '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
			image:     '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
			calendar:  '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
			search:    '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
			settings:  '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M3 12h2.5M18.5 12H21M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
			book:      '<path d="M12 6.5c-1.5-1-4-1.5-6-1v12.5c2-.4 4.5 0 6 1 1.5-1 4-1.4 6-1V5.5c-2-.5-4.5 0-6 1z"/><path d="M12 6.5v12"/>',
			chat:      '<path d="M21 11.5a8.38 8.38 0 01-1.9 5.4c-1.6 2-4 3.1-6.6 3.1-1 0-2-.2-2.9-.5L4 21l1.5-4.2A8.3 8.3 0 013 11.5 8.5 8.5 0 0112 3a8.5 8.5 0 019 8.5z"/>',
			sync:      '<path d="M3 12a9 9 0 0115.4-6.4L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-15.4 6.4L3 16"/><path d="M3 21v-5h5"/>'
		};

		var TOPIC_COLORS = { 0:'#3B82F6', 1:'#10B981', 2:'#8B5CF6', 3:'#F59E0B', 4:'#C9463F', 5:'#EC4899', 6:'#06B6D4', 7:'#64748B' };

		/* ── Helpers ── */
		function icon(name){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[name]||'')+'</svg>'; }

		/* ── CSS tween helper (GPL-compatible, no GSAP) ── */
		var _ease={
			'power3.out':'cubic-bezier(0.33,1,0.68,1)',
			'power2.out':'cubic-bezier(0.33,1,0.68,1)',
			'power2.inOut':'cubic-bezier(0.45,0,0.55,1)',
			'power1.out':'ease-out',
			'sine.inOut':'cubic-bezier(0.37,0,0.63,1)',
			'back.out(1.4)':'cubic-bezier(0.34,1.56,0.64,1)',
			'back.out(1.5)':'cubic-bezier(0.34,1.61,0.64,1)',
			'back.out(1.6)':'cubic-bezier(0.34,1.66,0.64,1)',
			'back.out(1.7)':'cubic-bezier(0.34,1.72,0.64,1)',
			'back.out(1.8)':'cubic-bezier(0.34,1.77,0.64,1)',
			'back.out(2)':'cubic-bezier(0.34,1.88,0.64,1)',
			'back.out(2.2)':'cubic-bezier(0.34,1.99,0.64,1)'
		};
		var _tfMap=typeof WeakMap!=='undefined'?new WeakMap():null;
		function _getTf(el){return(_tfMap&&_tfMap.get(el))||{xPercent:null,x:0,y:0,scale:1,rotation:0};}
		function _buildTf(tf){
			var t='';
			if(tf.xPercent!==null&&tf.xPercent!==undefined)t+='translateX('+tf.xPercent+'%) ';
			if(tf.x)t+='translateX('+tf.x+'px) ';
			if(tf.y)t+='translateY('+tf.y+'px) ';
			if(tf.scale!==undefined&&tf.scale!==1)t+='scale('+tf.scale+') ';
			if(tf.rotation)t+='rotate('+tf.rotation+'deg) ';
			return t||'none';
		}
		function _applyTf(el,tf){if(_tfMap)_tfMap.set(el,tf);el.style.transform=_buildTf(tf);}
		function _setProps(el,props){
			var tf=Object.assign({},_getTf(el)),changed=false;
			['xPercent','x','y','scale','rotation'].forEach(function(k){
				if(props[k]!==undefined){tf[k]=props[k];changed=true;}
			});
			if(changed)_applyTf(el,tf);
			if(props.opacity!==undefined)el.style.opacity=props.opacity;
			if(props.filter!==undefined)el.style.filter=props.filter;
			if(props.width!==undefined)el.style.width=(typeof props.width==='number'?props.width+'px':props.width);
		}
		function _transKeys(props){
			var seen={},out=[];
			Object.keys(props).forEach(function(k){
				var p=(k==='opacity'||k==='filter'||k==='width')?k:'transform';
				if(!seen[p]){seen[p]=1;out.push(p);}
			});
			return out;
		}
		function tSet(el,props){el.style.transition='none';_setProps(el,props);}
		function tTo(el,props,dur,ease,delay,onComplete){
			var eStr=_ease[ease]||'ease',d=dur||0.3,dl=delay||0;
			el.style.transition=_transKeys(props).map(function(p){return p+' '+d+'s '+eStr+' '+dl+'s';}).join(', ');
			_setProps(el,props);
			if(onComplete){
				var done=false;
				el.addEventListener('transitionend',function h(e){
					if(e.target!==el||done)return;done=true;
					el.removeEventListener('transitionend',h);onComplete();
				});
				setTimeout(function(){if(!done){done=true;onComplete();}}, (d+dl+0.1)*1000);
			}
		}
		function tFromTo(el,from,to,dur,ease,delay,onComplete){
			el.style.transition='none';_setProps(el,from);void el.offsetWidth;
			tTo(el,to,dur,ease,delay,onComplete);
		}
		function tKill(el){el.style.transition='none';killFloat(el);}
		function tToAll(els,props,dur,ease,stagger,delay,onComplete){
			var arr=Array.isArray(els)?els:Array.from(els);
			arr.forEach(function(el,i){tTo(el,props,dur,ease,(delay||0)+i*(stagger||0),i===arr.length-1?onComplete:null);});
		}
		function tFromToAll(els,from,to,dur,ease,stagger,delay,onComplete){
			var arr=Array.isArray(els)?els:Array.from(els);
			arr.forEach(function(el,i){tFromTo(el,from,to,dur,ease,(delay||0)+i*(stagger||0),i===arr.length-1?onComplete:null);});
		}

		/* ── Float loop system (replaces GSAP yoyo repeat:-1) ── */
		var _floats=[],_floatRaf=null;
		function _tickFloats(now){
			_floats=_floats.filter(function(f){return f.active!==false;});
			_floats.forEach(function(f){
				var elapsed=now-f.start;
				if(elapsed<0)return;
				var wave=Math.sin((elapsed/(f.dur*1000))%1*Math.PI*2);
				var tf=Object.assign({},_getTf(f.el));
				tf.y=f.baseY+wave*f.dy;
				if(f.dx!==undefined)tf.x=f.baseX+wave*f.dx;
				_applyTf(f.el,tf);
			});
			if(_floats.length>0)_floatRaf=requestAnimationFrame(_tickFloats);
			else _floatRaf=null;
		}
		function floatEl(el,dy,dur,delay,dx){
			el.style.transition='none';
			var tf=_getTf(el);
			_floats.push({el:el,baseY:tf.y||0,dy:dy,baseX:tf.x||0,dx:dx,dur:dur,start:performance.now()+(delay||0)*1000,active:true});
			if(!_floatRaf)_floatRaf=requestAnimationFrame(_tickFloats);
		}
		function killFloat(el){_floats.forEach(function(f){if(f.el===el)f.active=false;});}
		function killAllFloats(){
			_floats.forEach(function(f){f.active=false;});_floats=[];
			if(_floatRaf){cancelAnimationFrame(_floatRaf);_floatRaf=null;}
		}

		function updateProgress(){
			var pct=(current/(STEPS.length-1))*100;
			E.prog.style.transition='width .55s cubic-bezier(0.33,1,0.68,1)';
			E.prog.style.width=pct+'%';
			E.counter.textContent=STEPS[current].final?'Complete!':'Step '+(current+1)+' of '+TOTAL_Q;
		}

		function canCont(step){
			if(step.final)return true;
			if(step.type==='single')return sel[current]!==undefined;
			return true;
		}

		/* ── Lottie scene helpers ── */
		var _sceneAnims=[],_lottieSwitchId=0;

		function destroySceneLotties(){
			_lottieSwitchId++;
			_sceneAnims.forEach(function(a){try{a.destroy();}catch(e){}});
			_sceneAnims=[];
		}

		function removeLottieOverlay(){
			_lottieSwitchId++;
			var wrap=E.scene.querySelector('.abw-scene-lottie');
			if(!wrap)return;
			tTo(wrap,{opacity:0,scale:0.88},0.25,'',0,function(){
				_sceneAnims=_sceneAnims.filter(function(a){
					if(a._isOverlay){try{a.destroy();}catch(e){}return false;}
					return true;
				});
				if(wrap.parentNode)wrap.parentNode.removeChild(wrap);
			});
		}

		function untuckCollage(){
			var ch=E.scene.querySelector('.abw-ch');
			var cs=E.scene.querySelector('.abw-cs');
			if(ch){
				tKill(ch);
				tTo(ch,{opacity:1,scale:1},.5,'power2.out',0,function(){
					ch.style.transition='none';floatEl(ch,-9,3.2,.6);
				});
			}
			if(cs){
				tKill(cs);
				tTo(cs,{opacity:1,scale:1},.5,'power2.out',.1,function(){
					cs.style.transition='none';floatEl(cs,9,2.9,.9);
				});
			}
		}

		function sceneLottie(url){
			var wrap=E.scene.querySelector('.abw-scene-lottie');
			var switchId=++_lottieSwitchId;
			var ch=E.scene.querySelector('.abw-ch');
			var cs=E.scene.querySelector('.abw-cs');
			if(ch){tKill(ch);tTo(ch,{opacity:.15,scale:.5},.38,'power2.inOut');}
			if(cs){tKill(cs);tTo(cs,{opacity:0,scale:.4},.28,'power2.inOut');}
			function _load(container){
				if(switchId!==_lottieSwitchId)return;
				_sceneAnims=_sceneAnims.filter(function(a){
					if(a._isOverlay){try{a.destroy();}catch(e){}return false;}
					return true;
				});
				if(typeof lottie!=='undefined'){
					var anim=lottie.loadAnimation({container:container,renderer:'svg',loop:true,autoplay:true,path:url});
					anim._isOverlay=true;_sceneAnims.push(anim);
				}
				tFromTo(container,{opacity:0,scale:0.85},{opacity:1,scale:1},0.45,'back.out(1.4)');
			}
			if(wrap){
				tTo(wrap,{opacity:0,scale:0.9},0.2,'',0,function(){
					if(switchId!==_lottieSwitchId)return;
					wrap.innerHTML='';_load(wrap);
				});
			} else {
				var newWrap=document.createElement('div');
				newWrap.className='abw-scene-lottie';
				E.scene.appendChild(newWrap);
				_load(newWrap);
			}
		}

		function sceneWordLotties(leftUrl,rightUrl){
			_sceneAnims=_sceneAnims.filter(function(a){
				if(a._isWordLottie){try{a.destroy();}catch(e){}return false;}
				return true;
			});
			E.scene.querySelectorAll('.abw-swl').forEach(function(el){el.parentNode&&el.parentNode.removeChild(el);});
			if(typeof lottie==='undefined')return;
			[[leftUrl,'abw-swl abw-swl-l'],[rightUrl,'abw-swl abw-swl-r']].forEach(function(pair){
				if(!pair[0])return;
				var el=document.createElement('div');
				el.className=pair[1];
				E.scene.appendChild(el);
				var anim=lottie.loadAnimation({container:el,renderer:'svg',loop:true,autoplay:true,path:pair[0]});
				anim._isWordLottie=true;_sceneAnims.push(anim);
				tFromTo(el,{opacity:0,scale:0.4},{opacity:1,scale:1},0.4,'back.out(2.2)');
			});
		}

		/* ── Option rendering ── */
		function renderOpts(step){
			E.opts.innerHTML='';
			E.opts.className='abw-opts'+(step.cols===2?' cols-2':'');
			(step.opts||[]).forEach(function(opt,i){
				var btn=document.createElement('button');
				btn.type='button';btn.className='abw-opt';
				var isSel=step.type==='single'?sel[current]===i:(sel[current]||[]).indexOf(i)>-1;
				if(isSel)btn.classList.add('selected');
				var html='';
				if(opt.rec)   html+='<span class="abw-badge-rec">Recommended</span>';
				if(opt.pro)   html+='<span class="abw-badge-pro">Pro</span>';
				if(opt.free)  html+='<span class="abw-badge-free">Free</span>';
				if(opt.color) html+='<span class="abw-color-dot" style="background:'+opt.color+'"></span>';
				if(opt.icon&&ICONS[opt.icon])html+='<span class="abw-opt-icon">'+icon(opt.icon)+'</span>';
				html+='<span class="abw-opt-label">'+opt.label+'</span>';
				if(opt.desc)html+='<span class="abw-opt-desc">'+opt.desc+'</span>';
				btn.innerHTML=html;
				btn.addEventListener('click',function(){
					if(step.scene==='spotlight'&&opt.pro){ showProUpgrade(opt.label); return; }
					var stepLotties=(LOTTIE_MAP&&LOTTIE_MAP[current])?LOTTIE_MAP[current]:{};
					if(step.type==='single'){
						if(sel[current]===i){
							sel[current]=undefined;
							removeLottieOverlay();
							if(step.scene==='collage')untuckCollage();
						} else {
							sel[current]=i;
							if(step.scene==='template'&&opt.slug!==undefined){
								selTpl={slug:opt.slug,label:opt.label,color:opt.color};
								sceneTemplateUpdate(opt.color,opt.label);
							}
							if(step.scene==='level'&&step.levels)sceneLevelUpdate(step.levels[i]||0);
							if(stepLotties[i])sceneLottie(stepLotties[i]);
						}
					} else {
						var arr=sel[current]?sel[current].slice():[];
						var idx=arr.indexOf(i);
						if(idx>-1)arr.splice(idx,1);else arr.push(i);
						sel[current]=arr;
						if(step.scene==='word'){
							var selArr=sel[current]||[];
							if(selArr.length>0){
								var showIdx=selArr[selArr.length-1];
								sceneWordUpdate(step.opts[showIdx],showIdx);
								var pair=stepLotties[showIdx]||null;
								sceneWordLotties(pair?(pair.left||null):null,pair?(pair.right||null):null);
							} else {
								sceneWordReset();
								sceneWordLotties(null,null);
							}
						}
						if(step.scene==='spotlight')renderPageSections();
					}
					renderOpts(step);
					E.cont.disabled=!canCont(step);
				});
				E.opts.appendChild(btn);
				tFromTo(btn,{opacity:0,y:14,scale:.97},{opacity:1,y:0,scale:1},.4,'power2.out',i*.05);
			});
		}

		/* ── Scenes ── */
		function clearScene(cb){
			destroySceneLotties();
			killAllFloats();
			tTo(E.scene,{opacity:0,scale:.95,filter:'blur(5px)'},.22,'',0,function(){
				E.scene.innerHTML='';
				tSet(E.scene,{opacity:1,scale:1,filter:'blur(0px)'});
				if(cb)cb();
			});
		}

		function addParticles(){
			for(var p=0;p<6;p++){
				var d=document.createElement('div');
				d.className='abw-dot';
				var sz=4+Math.random()*8;
				d.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+(10+Math.random()*80)+'%;top:'+(10+Math.random()*80)+'%;opacity:'+(0.2+Math.random()*.35)+';';
				E.scene.appendChild(d);
				floatEl(d,(Math.random()>0.5?-14:14),2.5+Math.random()*2,Math.random()*2,(Math.random()>0.5?-8:8));
			}
		}

		function sceneCollage(){
			if(IMG_HERO||IMG_SHOWCASE){
				if(IMG_HERO){
					var hero=document.createElement('div');
					hero.className='abw-ch';
					hero.style.cssText='position:absolute;top:5%;left:50%;width:86%;border-radius:10px;overflow:hidden;box-shadow:0 10px 36px rgba(0,0,0,.26);z-index:1;';
					var heroImg=document.createElement('img');
					heroImg.src=IMG_HERO;heroImg.style.cssText='width:100%;height:auto;display:block;';
					hero.appendChild(heroImg);E.scene.appendChild(hero);
					tSet(hero,{xPercent:-50});
					tFromTo(hero,{opacity:0,y:28,scale:.93},{opacity:1,y:0,scale:1,rotation:-2},.72,'power3.out',0,function(){
						hero.style.transition='none';floatEl(hero,-9,3.2,.6);
					});
				}
				if(IMG_SHOWCASE){
					var showcase=document.createElement('div');
					showcase.className='abw-cs';
					showcase.style.cssText='position:absolute;bottom:5%;right:5%;width:42%;border-radius:8px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.32);z-index:2;';
					var showImg=document.createElement('img');
					showImg.src=IMG_SHOWCASE;showImg.style.cssText='width:100%;height:auto;display:block;';
					showcase.appendChild(showImg);E.scene.appendChild(showcase);
					tFromTo(showcase,{opacity:0,y:36,scale:.82},{opacity:1,y:0,scale:1,rotation:3},.68,'power3.out',.22,function(){
						showcase.style.transition='none';floatEl(showcase,9,2.9,.9);
					});
				}
			} else {
				var cards=[
					{w:130,top:'11%',left:'7%',rot:-2.5,dy:-9,content:'<div class="abw-mp" style="height:38px;"></div><div class="abw-mb" style="width:100%;"></div><div class="abw-mb" style="width:62%;"></div>'},
					{w:138,top:'48%',left:'4%',rot:2.5,dy:9,content:'<div class="abw-mb" style="width:78%;"></div><div class="abw-mb" style="width:100%;"></div><div class="abw-mp" style="height:30px;margin-bottom:0;"></div>'},
					{w:136,top:'16%',right:'6%',rot:2.5,dy:-9,content:'<div class="abw-mp" style="height:46px;"></div><div class="abw-mb" style="width:82%;"></div>'},
					{w:140,top:'58%',right:'8%',rot:-2.5,dy:9,content:'<div class="abw-mb" style="width:50%;"></div><div class="abw-mp" style="height:42px;margin-bottom:0;"></div>'}
				];
				cards.forEach(function(c,i){
					var el=document.createElement('div');
					el.className='abw-mc';el.style.width=c.w+'px';
					if(c.top)el.style.top=c.top;
					if(c.left)el.style.left=c.left;
					if(c.right)el.style.right=c.right;
					el.innerHTML=c.content;E.scene.appendChild(el);
					tFromTo(el,{opacity:0,y:30,scale:.9,rotation:0},{opacity:1,y:0,scale:1,rotation:c.rot},.65,'power3.out',i*.09,function(){
						el.style.transition='none';floatEl(el,c.dy,2.4+i*.35,i*.25);
					});
				});
			}
			addParticles();
		}

		function sceneWord(){
			E.scene.innerHTML='<div class="abw-ws-wrap"><div class="abw-ws-card" id="abw-ws-card">'+
				'<div class="abw-ws-nav"><span></span><span></span><span></span><div class="abw-ws-url"><span class="abw-ws-dot"></span><span id="abw-ws-url-text">yoursite.com</span></div></div>'+
				'<div class="abw-ws-hero" id="abw-ws-hero"></div>'+
				'<div class="abw-ws-body">'+
					'<div class="abw-ws-icon" id="abw-ws-icon">'+icon('layout')+'</div>'+
					'<div class="abw-ws-label" id="abw-ws-label">Your Site</div>'+
					'<div class="abw-ws-row"></div>'+
					'<div class="abw-ws-row" style="width:70%"></div>'+
				'</div>'+
			'</div></div>';
			tFromTo(E.scene.querySelector('.abw-ws-card'),{opacity:0,scale:.88,y:22},{opacity:1,scale:1,y:0},.6,'back.out(1.6)');
			addParticles();
		}

		function sceneWordUpdate(opt,idx){
			var card=document.getElementById('abw-ws-card');
			if(!card)return;
			var hero=document.getElementById('abw-ws-hero');
			var iconEl=document.getElementById('abw-ws-icon');
			var label=document.getElementById('abw-ws-label');
			var urlText=document.getElementById('abw-ws-url-text');
			var color=TOPIC_COLORS[idx]||'#C9463F';
			if(hero)hero.style.background='linear-gradient(120deg,'+color+','+color+'bb)';
			if(iconEl){
				iconEl.style.color=color;iconEl.style.background=color+'14';
				iconEl.innerHTML=opt.icon?icon(opt.icon):icon('layout');
			}
			if(label)label.textContent=opt.label;
			if(urlText)urlText.textContent='yoursite.com/'+opt.label.toLowerCase().replace(/\s+/g,'-');
			tFromTo(card,{scale:.96},{scale:1},.4,'back.out(1.8)');
		}

		function sceneWordReset(){
			var hero=document.getElementById('abw-ws-hero');
			var iconEl=document.getElementById('abw-ws-icon');
			var label=document.getElementById('abw-ws-label');
			var urlText=document.getElementById('abw-ws-url-text');
			if(hero)hero.style.background='linear-gradient(120deg,var(--accent),#E5847D)';
			if(iconEl){iconEl.style.color='var(--accent)';iconEl.style.background='var(--accent-t)';iconEl.innerHTML=icon('layout');}
			if(label)label.textContent='Your Site';
			if(urlText)urlText.textContent='yoursite.com';
		}

		function sceneLevel(){
			E.scene.innerHTML='<div class="abw-lv-wrap"><div class="abw-lv-word" id="abw-lw">BLOCKS</div><div class="abw-lv-track"><div class="abw-lv-fill" id="abw-lf"></div></div></div>';
			tFromTo(E.scene.querySelector('.abw-lv-word'),{opacity:0,scale:.88,filter:'blur(8px)'},{opacity:1,scale:1,filter:'blur(0px)'},.55,'power3.out');
			addParticles();
		}

		function sceneLevelUpdate(pct){
			var fill=document.getElementById('abw-lf');
			if(fill){fill.style.transition='width .55s cubic-bezier(0.33,1,0.68,1)';fill.style.width=pct+'%';}
		}

		function sceneTemplate(){
			var c=selTpl.color||'#C9463F',lbl=selTpl.label||'Template';
			var rotations=[6,-4,0],offsets=[28,-22,0],bgColors=['#D7DDE1','#b5bec9',c];
			bgColors.forEach(function(col,i){
				var card=document.createElement('div');
				card.className='abw-sk';
				card.style.transform='translate(-50%,-50%) rotate('+rotations[i]+'deg) translateX('+offsets[i]+'px)';
				card.style.opacity='0';card.style.zIndex=i;
				card.innerHTML='<div class="abw-sk-hero" style="background:linear-gradient(130deg,'+col+','+col+'bb);"></div>'+
					'<div class="abw-sk-body">'+(i===2?'<div class="abw-sk-lbl" id="abw-sk-lbl">'+lbl+'</div>':'')+
					'<div class="abw-sk-bar" style="width:'+(50+i*18)+'%"></div>'+
					'<div class="abw-sk-bar" style="width:'+(65+i*12)+'%"></div></div>';
				E.scene.appendChild(card);
			});
			var cardEls=E.scene.querySelectorAll('.abw-sk');
			[[.35,0],[.65,.08],[1,.16]].forEach(function(oa,i){
				var el=cardEls[i];
				el.style.transition='opacity .6s cubic-bezier(0.33,1,0.68,1) '+oa[1]+'s';
				el.style.opacity=oa[0];
			});
			addParticles();
		}

		function sceneTemplateUpdate(color,label){
			var cards=E.scene.querySelectorAll('.abw-sk');
			if(!cards.length)return;
			var top=cards[cards.length-1];
			var topHero=top.querySelector('.abw-sk-hero');
			var topLbl=top.querySelector('#abw-sk-lbl');
			if(!topHero)return;
			topHero.style.transition='background .4s ease';
			topHero.style.background='linear-gradient(130deg,'+color+','+color+'bb)';
			if(topLbl)topLbl.textContent=label;
			var base=top.style.transform.replace(/\s*scale\([^)]*\)/g,'');
			top.style.transition='none';
			top.style.transform=base+' scale(0.95)';
			void top.offsetWidth;
			top.style.transition='transform .4s cubic-bezier(0.34,1.56,0.64,1)';
			top.style.transform=base;
		}

		function sceneSpotlight(){
			E.scene.innerHTML='<div class="abw-pg-wrap"><div class="abw-pg-card">'+
				'<div class="abw-pg-nav"><span></span><span></span><span></span></div>'+
				'<div class="abw-pg-hero"></div>'+
				'<div class="abw-pg-body" id="abw-pg-body"><div class="abw-pg-empty">Pick features below to build your page →</div></div>'+
			'</div></div>';
			tFromTo(E.scene.querySelector('.abw-pg-card'),{opacity:0,scale:.9,y:20},{opacity:1,scale:1,y:0},.55,'back.out(1.6)');
			addParticles();
		}

		function featureSectionHTML(idx,opt){
			switch(idx){
				case 0: return '<div class="abw-pg-sec abw-pg-testi" data-f="0">'+
						'<div class="abw-pg-sec-lbl">Testimonials</div>'+
						'<div class="abw-pg-testi-row">'+
							'<div class="abw-pg-testi-card"><span class="abw-pg-avatar"></span><span class="abw-pg-stars">★★★★★</span><span class="abw-pg-line"></span></div>'+
							'<div class="abw-pg-testi-card"><span class="abw-pg-avatar"></span><span class="abw-pg-stars">★★★★★</span><span class="abw-pg-line"></span></div>'+
						'</div></div>';
				case 1: return '<div class="abw-pg-sec abw-pg-pricing" data-f="1">'+
						'<div class="abw-pg-sec-lbl">Pricing Table</div>'+
						'<div class="abw-pg-price-row">'+
							'<div class="abw-pg-price-col"><span class="abw-pg-price-h"></span><span class="abw-pg-price-num">$9</span><span class="abw-pg-price-l"></span></div>'+
							'<div class="abw-pg-price-col featured"><span class="abw-pg-price-h"></span><span class="abw-pg-price-num">$29</span><span class="abw-pg-price-l"></span></div>'+
							'<div class="abw-pg-price-col"><span class="abw-pg-price-h"></span><span class="abw-pg-price-num">$49</span><span class="abw-pg-price-l"></span></div>'+
						'</div></div>';
				case 2: return '<div class="abw-pg-sec abw-pg-counter" data-f="2">'+
						'<div class="abw-pg-sec-lbl">Counter</div>'+
						'<div class="abw-pg-counter-row">'+
							'<div class="abw-pg-counter-item"><span class="abw-pg-counter-num" data-target="250">0</span><span class="abw-pg-counter-lbl">Clients</span></div>'+
							'<div class="abw-pg-counter-item"><span class="abw-pg-counter-num" data-target="1200">0</span><span class="abw-pg-counter-lbl">Projects</span></div>'+
							'<div class="abw-pg-counter-item"><span class="abw-pg-counter-num" data-target="98">0</span><span class="abw-pg-counter-lbl">Happy %</span></div>'+
						'</div></div>';
				case 3: return '<div class="abw-pg-sec abw-pg-flip" data-f="3">'+
						'<div class="abw-pg-sec-lbl">Flip Card</div>'+
						'<div class="abw-pg-flip-card"><div class="abw-pg-flip-inner"><div class="abw-pg-flip-front"></div><div class="abw-pg-flip-back"></div></div></div>'+
						'</div>';
				default: return '<div class="abw-pg-sec abw-pg-generic" data-f="'+idx+'">'+
						'<div class="abw-pg-sec-lbl">'+opt.label+(opt.pro?' <span class="abw-pg-pro-tag">· Pro</span>':'')+'</div>'+
						'<div class="abw-pg-generic-bar"></div><div class="abw-pg-generic-bar" style="width:70%"></div>'+
						'</div>';
			}
		}

		function animateCounters(container){
			var nums=container.querySelectorAll('.abw-pg-counter-num');
			nums.forEach(function(n){
				var target=parseInt(n.getAttribute('data-target'),10)||0;
				var start=performance.now(),dur=900;
				function step(now){
					var t=Math.min(1,(now-start)/dur);
					var eased=1-Math.pow(1-t,3);
					n.textContent=Math.round(target*eased);
					if(t<1)requestAnimationFrame(step);
				}
				requestAnimationFrame(step);
			});
		}

		function renderPageSections(){
			var body=document.getElementById('abw-pg-body');
			if(!body)return;
			var step=STEPS[current];
			var selArr=(sel[current]||[]).slice().sort(function(a,b){return a-b;});
			var empty=body.querySelector('.abw-pg-empty');
			var existing={};
			Array.prototype.forEach.call(body.querySelectorAll('.abw-pg-sec'),function(el){existing[el.getAttribute('data-f')]=el;});
			Object.keys(existing).forEach(function(k){
				if(selArr.indexOf(parseInt(k,10))===-1){
					var el=existing[k];
					tTo(el,{opacity:0,y:-8,scale:.94},.22,'',0,function(){el.parentNode&&el.parentNode.removeChild(el);});
				}
			});
			selArr.forEach(function(idx,order){
				if(existing[idx]){body.appendChild(existing[idx]);return;}
				var opt=step.opts[idx];
				var tmp=document.createElement('div');
				tmp.innerHTML=featureSectionHTML(idx,opt);
				var el=tmp.firstChild;
				body.appendChild(el);
				tFromTo(el,{opacity:0,y:14,scale:.96},{opacity:1,y:0,scale:1},.4,'back.out(1.5)',order*.05);
				if(idx===2)animateCounters(el);
			});
			if(empty)empty.style.display=selArr.length?'none':'';
		}

		function sceneComplete(){
			E.scene.innerHTML=
				'<div class="abw-ring" style="width:150px;height:150px;left:50%;top:50%;margin:-75px 0 0 -75px;opacity:0;"></div>'+
				'<div class="abw-ring" style="width:230px;height:230px;left:50%;top:50%;margin:-115px 0 0 -115px;opacity:0;"></div>'+
				'<div class="abw-ring" style="width:320px;height:320px;left:50%;top:50%;margin:-160px 0 0 -160px;opacity:0;"></div>'+
				'<div class="abw-cf">'+
					'<div class="abw-cf-nav"><span></span><span></span><span></span></div>'+
					'<div class="abw-cf-body">'+
						'<div class="abw-cf-hero"></div>'+
						'<div class="abw-cf-row"><div></div><div></div><div></div></div>'+
						'<div class="abw-cf-row" style="grid-template-columns:1fr 1fr;"><div></div><div></div></div>'+
					'</div>'+
				'</div>';
			E.scene.querySelectorAll('.abw-ring').forEach(function(r,i){
				r.style.animationName='abwRingIn,abwRingPulse';
				r.style.animationDuration='1.1s,2.2s';
				r.style.animationDelay=(i*.18)+'s,'+(1.3+i*.48)+'s';
				r.style.animationTimingFunction='ease-out,ease-in-out';
				r.style.animationFillMode='both,none';
				r.style.animationIterationCount='1,infinite';
			});
			var cf=E.scene.querySelector('.abw-cf');
			if(cf)tFromTo(cf,{opacity:0,y:26,scale:.9},{opacity:1,y:0,scale:1},.65,'back.out(1.6)',.18);
		}

		function renderScene(step){
			var stepIdx=current;
			clearScene(function(){
				if(step.scene==='collage')        sceneCollage();
				else if(step.scene==='word')      sceneWord();
				else if(step.scene==='level')     sceneLevel();
				else if(step.scene==='template')  sceneTemplate();
				else if(step.scene==='spotlight'){ sceneSpotlight(); renderPageSections(); }
				else if(step.scene==='complete')  sceneComplete();
				var stepLotties=(LOTTIE_MAP&&LOTTIE_MAP[stepIdx])?LOTTIE_MAP[stepIdx]:{};
				if(step.scene==='word'){
					var selArr=sel[stepIdx]||[];
					if(selArr.length>0){
						var lastIdx=selArr[selArr.length-1];
						sceneWordUpdate(step.opts[lastIdx],lastIdx);
						var pair=stepLotties[lastIdx]||null;
						if(pair)sceneWordLotties(pair.left||null,pair.right||null);
					}
				} else {
					var lottieUrl=null;
					if(step.type==='single'&&sel[stepIdx]!==undefined)
						lottieUrl=stepLotties[sel[stepIdx]]||null;
					if(lottieUrl)sceneLottie(lottieUrl);
				}
			});
		}

		/* ── Final state ── */
		function renderFinal(){
			var lbl=selTpl?selTpl.label:'Starter';
			var slug=selTpl?selTpl.slug:'';
			var btnTxt=slug?'Create '+lbl+' Page →':'Open Editor →';
			E.final.innerHTML=
				'<div class="abw-final-check" id="abw-fc"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'+
				'<span class="abw-final-pill">You\'re all set!</span>'+
				'<h2 class="abw-final-title">Your blocks are ready.</h2>'+
				'<p class="abw-final-sub">Jump into the editor and start building. Everything is editable — come back any time to adjust your block settings.</p>'+
				'<button class="abw-create" id="abw-create" data-slug="'+slug+'" data-label="'+lbl+'">'+btnTxt+'</button>'+
				'<div class="abw-final-links">'+
					'<a href="'+SETTINGS+'" class="abw-final-link"><span class="abw-fl-icon">'+icon('settings')+'</span><div><div>Block Settings</div><div class="abw-fl-meta">Enable, disable or configure individual blocks</div></div></a>'+
					'<a href="'+MIGRATION+'" class="abw-final-link"><span class="abw-fl-icon">'+icon('sync')+'</span><div><div>Migration Tool</div><div class="abw-fl-meta">Move old blocks over to AdaireBlocks</div></div></a>'+
					'<a href="'+DOCS+'" target="_blank" rel="noopener" class="abw-final-link"><span class="abw-fl-icon">'+icon('book')+'</span><div><div>Documentation</div><div class="abw-fl-meta">Guides for every block and setting</div></div></a>'+
					'<a href="'+SUPPORT+'" target="_blank" rel="noopener" class="abw-final-link"><span class="abw-fl-icon">'+icon('chat')+'</span><div><div>Support</div><div class="abw-fl-meta">Submit a ticket or browse answered questions</div></div></a>'+
				'</div>';
			var fc=document.getElementById('abw-fc');
			var pills=E.final.querySelectorAll('.abw-final-pill,.abw-final-title,.abw-final-sub');
			var createBtn=document.getElementById('abw-create');
			var links=E.final.querySelectorAll('.abw-final-link');
			if(fc)tFromTo(fc,{scale:0,opacity:0},{scale:1,opacity:1},.5,'back.out(2)',.1);
			tFromToAll(pills,{opacity:0,y:14},{opacity:1,y:0},.45,'power2.out',.07,.25);
			if(createBtn)tFromTo(createBtn,{opacity:0,y:18,scale:.95},{opacity:1,y:0,scale:1},.45,'back.out(1.5)',.52);
			tFromToAll(links,{opacity:0,x:-14},{opacity:1,x:0},.4,'',.06,.65);
			if(createBtn){
				createBtn.addEventListener('click',function(){
					var s=createBtn.dataset.slug,lbl2=createBtn.dataset.label;
					if(!s){window.location.href=NEW_PAGE;return;}
					createBtn.classList.add('loading');createBtn.textContent='Creating…';
					var body=new URLSearchParams({action:'adaire_create_starter_page',nonce:NONCE,pattern:s});
					fetch(AJAX_URL,{method:'POST',body:body,credentials:'same-origin'})
						.then(function(r){return r.json();})
						.then(function(data){
							if(data.success){window.location.href=data.data.edit_url;}
							else{alert(data.data.message||'Something went wrong.');createBtn.classList.remove('loading');createBtn.textContent=btnTxt;}
						})
						.catch(function(){alert('Request failed. Please try again.');createBtn.classList.remove('loading');createBtn.textContent=btnTxt;});
				});
			}
		}

		/* ── Step rendering ── */
		function renderStep(dir){
			var step=STEPS[current];
			updateProgress();
			E.back.disabled=current===0;
			if(step.final){
				tTo(E.qblock,{opacity:0,x:-28},.24,'',0,function(){
					E.qblock.style.display='none';
					E.final.classList.add('is-on');
					renderFinal();
				});
				E.skip.style.display='none';E.cont.style.display='none';E.back.disabled=false;
			} else {
				E.skip.style.display='';E.cont.style.display='';
				var fromX=(dir===undefined||dir>=0)?32:-32;
				var toX=(dir===undefined||dir>=0)?-32:32;
				if(dir!==undefined){
					E.opts.innerHTML='';
					var textEls=[E.eyebrow,E.question,E.sub];
					tToAll(textEls,{opacity:0,x:toX},.22,'',0,0,function(){
						[E.eyebrow,E.question,E.sub].forEach(function(el){tSet(el,{x:fromX});});
						E.eyebrow.textContent=step.eyebrow;
						E.question.textContent=step.question;
						E.sub.textContent=step.sub||'';
						renderOpts(step);
						tToAll(textEls,{opacity:1,x:0},.38,'power2.out',.05,0);
					});
				} else {
					E.eyebrow.textContent=step.eyebrow;
					E.question.textContent=step.question;
					E.sub.textContent=step.sub||'';
					renderOpts(step);
					tFromToAll([E.eyebrow,E.question,E.sub],{opacity:0,y:18},{opacity:1,y:0},.45,'power2.out',.06,0);
				}
				E.cont.disabled=!canCont(step);
			}
			renderScene(step);
		}

		/* ── Navigation ── */
		E.back.addEventListener('click',function(){
			if(current<=0)return;
			if(STEPS[current].final){
				E.final.classList.remove('is-on');E.final.innerHTML='';
				E.qblock.style.display='';
				tSet(E.qblock,{opacity:0,x:0});
				E.skip.style.display='';E.cont.style.display='';
			}
			current--;renderStep(-1);
		});
		E.skip.addEventListener('click',function(){if(current<STEPS.length-1){current++;renderStep(1);}});
		E.cont.addEventListener('click',function(){if(current<STEPS.length-1){current++;renderStep(1);}});

		/* ── Boot ── */
		renderStep();

		})();
		</script>
		</div>
		<?php
	}
}

