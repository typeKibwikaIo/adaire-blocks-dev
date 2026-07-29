<?php
/**
 * Block Migration Tool
 * Batch-update all posts to re-save blocks with current save.js structure
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add migration submenu to Adaire Blocks admin menu
 */
function adaire_blocks_add_migration_menu() {
	add_submenu_page(
		'adaire-blocks-settings',
		'Block Migration',
		'Migration',
		'manage_options',
		'adaire-blocks-migration',
		'adaire_blocks_migration_page'
	);
}
add_action( 'admin_menu', 'adaire_blocks_add_migration_menu' );

/**
 * Enqueue migration page styles and scripts.
 *
 * The hook for a submenu under 'adaire-blocks-settings' is:
 *   adaire-blocks-settings_page_adaire-blocks-migration
 */
function adaire_blocks_enqueue_migration_assets( $hook ) {
	if ( $hook !== 'adaire-blocks-settings_page_adaire-blocks-migration' ) {
		return;
	}

	$version = defined( 'ADAIRE_BLOCKS_VERSION' ) ? ADAIRE_BLOCKS_VERSION : '1.0.0';

	wp_enqueue_style(
		'adaire-admin-theme',
		plugin_dir_url( __FILE__ ) . 'css/adaire-admin-theme.css',
		array(),
		$version
	);

	wp_enqueue_style(
		'adaire-blocks-migration',
		plugin_dir_url( __FILE__ ) . 'css/block-migration.css',
		array( 'adaire-admin-theme' ),
		$version
	);

	wp_enqueue_script(
		'adaire-blocks-migration',
		plugin_dir_url( __FILE__ ) . 'js/block-migration.js',
		array(),
		$version,
		true
	);

	wp_localize_script(
		'adaire-blocks-migration',
		'adaireMigration',
		array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'adaire_migration' ),
			'postUrl' => admin_url( 'post.php' ),
		)
	);
}
add_action( 'admin_enqueue_scripts', 'adaire_blocks_enqueue_migration_assets' );

/**
 * Enqueue the editor-side receiver script inside the hidden iframe.
 *
 * Only loaded when ?adaire_auto_migrate=1 is in the URL so it adds zero
 * overhead to normal editor sessions.
 */
function adaire_blocks_enqueue_migration_editor_script() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only feature-flag gate for whether to enqueue a script; capability-checked below, nothing is written or acted on.
	if ( empty( $_GET['adaire_auto_migrate'] ) ) {
		return;
	}
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$version = defined( 'ADAIRE_BLOCKS_VERSION' ) ? ADAIRE_BLOCKS_VERSION : '1.0.0';

	wp_enqueue_script(
		'adaire-blocks-migration-editor',
		plugin_dir_url( __FILE__ ) . 'js/block-migration-editor.js',
		array( 'wp-data', 'wp-blocks', 'wp-block-editor', 'wp-editor' ),
		$version,
		true
	);
}
add_action( 'enqueue_block_editor_assets', 'adaire_blocks_enqueue_migration_editor_script' );

/**
 * Migration page HTML
 */
function adaire_blocks_migration_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Unauthorized access' );
	}
	?>
	<div class="wrap">
	<div class="aa-page">
		<div class="aa-header">
			<div class="aa-header-text">
				<div class="aa-eyebrow">Maintenance</div>
				<h1>Block Migration</h1>
				<p>Find every post, page, custom post type, and reusable pattern containing Adaire Blocks and re-save it with the current block structure. Use this after updating the plugin to fix block validation errors.</p>
			</div>
		</div>

		<div class="aa-card" style="max-width: 800px;">
			<div class="aa-card-title">Update All Blocks (Queue-Based Migration)</div>
			<p class="aa-card-subtitle" style="margin-bottom: 20px;">A queue-based tool that finds every post, page, custom post type, and reusable pattern containing Adaire Blocks, then re-saves each one with the current block structure — run this after updating the plugin to clear up block validation errors.</p>

			<div class="adaire-migration-info-grid">
				<div class="adaire-migration-info-card">
					<div class="adaire-migration-info-title">
						<span class="dashicons dashicons-yes-alt" style="color: var(--aa-success, #16a34a);"></span>
						What this does
					</div>
					<ul>
						<li>Finds all content with Adaire Blocks across all post types</li>
						<li>Loads each item in the block editor and saves it with the current block structure</li>
						<li>Processes items one at a time to avoid server timeouts</li>
						<li>Preserves all block settings, content, and post status</li>
					</ul>
				</div>

				<div class="adaire-migration-info-card is-warning">
					<div class="adaire-migration-info-title">
						<span class="dashicons dashicons-warning" style="color: var(--aa-danger, #dc2626);"></span>
						Important
					</div>
					<ul>
						<li>Back up your database before running this on a live site</li>
						<li>Do not close this page while migration is running</li>
						<li>You can cancel at any time — already-processed items remain migrated</li>
					</ul>
				</div>
			</div>

			<div id="migration-status" class="adaire-migration-status" style="display: none;">
				<div id="migration-progress">
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
						<div>
							<p style="margin: 0;"><strong>Status:</strong> <span id="status-text">Preparing...</span></p>
							<p style="margin: 5px 0 0 0; font-size: 12px; color: var(--aa-muted, #6b7280);">
								<span id="queue-status">Queue: Initializing...</span>
							</p>
						</div>
						<div style="text-align: right;">
							<p style="margin: 0;"><strong>Progress:</strong> <span id="progress-text">0/0</span></p>
							<p style="margin: 5px 0 0 0; font-size: 12px; color: var(--aa-muted, #6b7280);">
								<span id="stats-text">✅ 0 | ❌ 0</span>
							</p>
						</div>
					</div>
					<div class="aa-progress-track" style="height: 10px; margin: 12px 0;">
						<div id="progress-bar" class="aa-progress-fill" style="width: 0%; display: flex; align-items: center; justify-content: flex-end;">
							<span id="progress-percent" style="font-size: 10px; font-weight: 700; color: #fff; padding-right: 6px;"></span>
						</div>
					</div>
					<div id="migration-log" class="adaire-migration-log"></div>
				</div>
				<div id="migration-complete" style="display: none;">
					<p style="color: var(--aa-success, #16a34a); font-weight: bold; font-size: 16px;">✅ Migration completed!</p>
					<p id="completion-summary"></p>
				</div>
			</div>

			<p style="display: flex; gap: 10px;">
				<button id="start-migration" class="aa-btn aa-btn-primary" onclick="startMigration()">
					Start Migration
				</button>
				<button id="cancel-migration" class="aa-btn aa-btn-secondary" onclick="cancelMigration()" style="display: none;">
					Cancel
				</button>
			</p>

			<p class="aa-card-subtitle" style="margin-top: 20px; margin-bottom: 0;">
				<strong>Note:</strong> Scans all public post types that support the block editor,
				plus reusable block patterns (wp_block).
			</p>
		</div>
	</div>
	</div>

	<style>
		.adaire-migration-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 4px; }
		@media (max-width: 782px) { .adaire-migration-info-grid { grid-template-columns: 1fr; } }
		.adaire-migration-info-card { background: var(--aa-bg, #f6f7fb); border-radius: var(--aa-radius-md, 12px); padding: 16px 18px; }
		.adaire-migration-info-card.is-warning { background: var(--aa-danger-soft, rgba(220,38,38,0.08)); }
		.adaire-migration-info-title { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13.5px; color: var(--aa-ink, #14181f); margin-bottom: 10px; }
		.adaire-migration-info-card ul { margin: 0; padding-left: 18px; }
		.adaire-migration-info-card li { font-size: 13px; color: var(--aa-muted, #6b7280); margin-bottom: 6px; }
		.adaire-migration-info-card li:last-child { margin-bottom: 0; }
		.adaire-migration-status { margin: 20px 0; padding: 18px; background: var(--aa-bg, #f6f7fb); border-radius: var(--aa-radius-md, 12px); }
		.adaire-migration-log { max-height: 300px; overflow-y: auto; background: #fff; padding: 12px; margin-top: 10px; border-radius: var(--aa-radius-sm, 8px); border: 1px solid var(--aa-line, rgba(20,24,31,0.1)); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
	</style>
	<?php
}

/**
 * AJAX: discover all items containing Adaire Blocks.
 *
 * Scans all public post types that support the block editor, plus wp_block
 * (reusable patterns). Returns only items that actually contain at least one
 * create-block/* block so the queue stays as short as possible.
 */
function adaire_get_posts_to_migrate() {
	check_ajax_referer( 'adaire_migration', 'nonce' );

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_send_json_error( array( 'message' => 'Unauthorized' ) );
	}

	// Collect all public post types that use the block editor.
	$scannable_types = array();
	foreach ( get_post_types( array( 'public' => true ), 'objects' ) as $type ) {
		if ( $type->name === 'attachment' || $type->name === 'wp_block' ) {
			continue;
		}
		if ( post_type_supports( $type->name, 'editor' ) ) {
			$scannable_types[] = $type->name;
		}
	}

	// Allow site owners to narrow or extend the list.
	$scannable_types = apply_filters( 'adaire_migration_post_types', $scannable_types );

	$items_to_migrate = array();
	$posts_count      = 0;
	$patterns_count   = 0;
	$posts_checked    = 0;
	$patterns_checked = 0;

	// --- posts / pages / custom post types ---
	if ( ! empty( $scannable_types ) ) {
		$all_posts = get_posts(
			array(
				'post_type'      => $scannable_types,
				'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
				'posts_per_page' => -1,
				'fields'         => 'all',
				'no_found_rows'  => true,
			)
		);

		$posts_checked = count( $all_posts );

		foreach ( $all_posts as $post ) {
			if ( has_blocks( $post->post_content ) && adaire_has_adaire_blocks( parse_blocks( $post->post_content ) ) ) {
				$items_to_migrate[] = array(
					'id'    => $post->ID,
					'title' => $post->post_title ?: "(no title — ID {$post->ID})",
					'type'  => 'post',
				);
				++$posts_count;
			}
		}
	}

	// --- reusable block patterns (wp_block) ---
	$all_patterns = get_posts(
		array(
			'post_type'      => 'wp_block',
			'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
			'posts_per_page' => -1,
			'fields'         => 'all',
			'no_found_rows'  => true,
		)
	);

	$patterns_checked = count( $all_patterns );

	foreach ( $all_patterns as $pattern ) {
		if ( has_blocks( $pattern->post_content ) && adaire_has_adaire_blocks( parse_blocks( $pattern->post_content ) ) ) {
			$items_to_migrate[] = array(
				'id'    => $pattern->ID,
				'title' => $pattern->post_title ?: "Untitled Pattern (ID {$pattern->ID})",
				'type'  => 'pattern',
			);
			++$patterns_count;
		}
	}

	wp_send_json_success(
		array(
			'items'            => $items_to_migrate,
			'posts_count'      => $posts_count,
			'patterns_count'   => $patterns_count,
			'posts_checked'    => $posts_checked,
			'patterns_checked' => $patterns_checked,
		)
	);
}
add_action( 'wp_ajax_adaire_get_posts_to_migrate', 'adaire_get_posts_to_migrate' );

/**
 * Recursively check whether a parsed blocks array contains at least one
 * Adaire Blocks block (namespace create-block/).
 */
function adaire_has_adaire_blocks( $blocks ) {
	foreach ( $blocks as $block ) {
		if ( isset( $block['blockName'] ) && strpos( $block['blockName'], 'create-block/' ) === 0 ) {
			return true;
		}
		if ( ! empty( $block['innerBlocks'] ) && adaire_has_adaire_blocks( $block['innerBlocks'] ) ) {
			return true;
		}
	}
	return false;
}
