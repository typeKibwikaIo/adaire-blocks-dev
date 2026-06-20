<?php
/**
 * Block Migration Tool
 * Batch-update all posts to re-save blocks with current save.js structure
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add migration submenu to GutenBlocks admin menu
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
add_action('admin_menu', 'adaire_blocks_add_migration_menu');

/**
 * Enqueue migration page styles and scripts.
 *
 * The hook for a submenu under 'adaire-blocks-settings' is:
 *   adaire-blocks-settings_page_adaire-blocks-migration
 */
function adaire_blocks_enqueue_migration_assets($hook) {
    if ($hook !== 'adaire-blocks-settings_page_adaire-blocks-migration') {
        return;
    }

    $version = defined('ADAIRE_BLOCKS_VERSION') ? ADAIRE_BLOCKS_VERSION : '1.0.0';

    wp_enqueue_style(
        'adaire-blocks-migration',
        plugin_dir_url(__FILE__) . 'css/block-migration.css',
        [],
        $version
    );

    wp_enqueue_script(
        'adaire-blocks-migration',
        plugin_dir_url(__FILE__) . 'js/block-migration.js',
        [],
        $version,
        true
    );

    wp_localize_script('adaire-blocks-migration', 'adaireMigration', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('adaire_migration'),
        'postUrl' => admin_url('post.php'),
    ]);
}
add_action('admin_enqueue_scripts', 'adaire_blocks_enqueue_migration_assets');

/**
 * Enqueue the editor-side receiver script inside the hidden iframe.
 *
 * Only loaded when ?adaire_auto_migrate=1 is in the URL so it adds zero
 * overhead to normal editor sessions.
 */
function adaire_blocks_enqueue_migration_editor_script() {
    if ( empty( $_GET['adaire_auto_migrate'] ) ) {
        return;
    }
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    $version = defined('ADAIRE_BLOCKS_VERSION') ? ADAIRE_BLOCKS_VERSION : '1.0.0';

    wp_enqueue_script(
        'adaire-blocks-migration-editor',
        plugin_dir_url(__FILE__) . 'js/block-migration-editor.js',
        ['wp-data', 'wp-blocks', 'wp-block-editor', 'wp-editor'],
        $version,
        true
    );
}
add_action('enqueue_block_editor_assets', 'adaire_blocks_enqueue_migration_editor_script');

/**
 * Migration page HTML
 */
function adaire_blocks_migration_page() {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized access');
    }
    ?>
    <div class="wrap">
        <h1>GutenBlocks Migration Tool</h1>

        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>Update All Blocks (Queue-Based Migration)</h2>
            <p>
                This tool uses a queue-based system to find all posts, pages, custom post types,
                and reusable block patterns that contain GutenBlocks and re-save them
                with the current block structure. Use this after updating the plugin to fix
                block validation errors.
            </p>

            <p><strong>What this does:</strong></p>
            <ul>
                <li>Finds all content with GutenBlocks across all post types</li>
                <li>Loads each item in the block editor and saves it with the current block structure</li>
                <li>Processes items one at a time to avoid server timeouts</li>
                <li>Preserves all block settings, content, and post status</li>
            </ul>

            <p><strong>⚠️ Important:</strong></p>
            <ul>
                <li>Back up your database before running this on a live site</li>
                <li>Do not close this page while migration is running</li>
                <li>You can cancel at any time — already-processed items remain migrated</li>
            </ul>

            <div id="migration-status" style="margin: 20px 0; padding: 15px; background: #f0f0f1; border-radius: 4px; display: none;">
                <div id="migration-progress">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <p style="margin: 0;"><strong>Status:</strong> <span id="status-text">Preparing...</span></p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                                <span id="queue-status">Queue: Initializing...</span>
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0;"><strong>Progress:</strong> <span id="progress-text">0/0</span></p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                                <span id="stats-text">✅ 0 | ❌ 0</span>
                            </p>
                        </div>
                    </div>
                    <div style="background: #fff; border-radius: 4px; height: 30px; margin: 10px 0; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                        <div id="progress-bar" style="background: linear-gradient(90deg, #2271b1, #135e96); height: 100%; width: 0%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
                            <span id="progress-percent" style="text-shadow: 0 1px 2px rgba(0,0,0,0.3);"></span>
                        </div>
                    </div>
                    <div id="migration-log" style="max-height: 300px; overflow-y: auto; background: #fff; padding: 10px; margin-top: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);"></div>
                </div>
                <div id="migration-complete" style="display: none;">
                    <p style="color: #00a32a; font-weight: bold; font-size: 16px;">✅ Migration completed!</p>
                    <p id="completion-summary"></p>
                </div>
            </div>

            <p>
                <button id="start-migration" class="button button-primary button-large" onclick="startMigration()">
                    Start Migration
                </button>
                <button id="cancel-migration" class="button button-large" onclick="cancelMigration()" style="display: none;">
                    Cancel
                </button>
            </p>

            <p style="margin-top: 20px; font-size: 13px; color: #666;">
                <strong>Note:</strong> Scans all public post types that support the block editor,
                plus reusable block patterns (wp_block).
            </p>
        </div>
    </div>
    <?php
}

/**
 * AJAX: discover all items containing GutenBlocks.
 *
 * Scans all public post types that support the block editor, plus wp_block
 * (reusable patterns). Returns only items that actually contain at least one
 * create-block/* block so the queue stays as short as possible.
 */
function adaire_get_posts_to_migrate() {
    check_ajax_referer('adaire_migration', 'nonce');

    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'Unauthorized']);
    }

    // Collect all public post types that use the block editor.
    $scannable_types = [];
    foreach (get_post_types(['public' => true], 'objects') as $type) {
        if ($type->name === 'attachment' || $type->name === 'wp_block') {
            continue;
        }
        if (post_type_supports($type->name, 'editor')) {
            $scannable_types[] = $type->name;
        }
    }

    // Allow site owners to narrow or extend the list.
    $scannable_types = apply_filters('adaire_migration_post_types', $scannable_types);

    $items_to_migrate = [];
    $posts_count      = 0;
    $patterns_count   = 0;
    $posts_checked    = 0;
    $patterns_checked = 0;

    // --- posts / pages / custom post types ---
    if (!empty($scannable_types)) {
        $all_posts = get_posts([
            'post_type'      => $scannable_types,
            'post_status'    => ['publish', 'draft', 'pending', 'private'],
            'posts_per_page' => -1,
            'fields'         => 'all',
            'no_found_rows'  => true,
        ]);

        $posts_checked = count($all_posts);

        foreach ($all_posts as $post) {
            if (has_blocks($post->post_content) && adaire_has_adaire_blocks(parse_blocks($post->post_content))) {
                $items_to_migrate[] = [
                    'id'    => $post->ID,
                    'title' => $post->post_title ?: "(no title — ID {$post->ID})",
                    'type'  => 'post',
                ];
                $posts_count++;
            }
        }
    }

    // --- reusable block patterns (wp_block) ---
    $all_patterns = get_posts([
        'post_type'      => 'wp_block',
        'post_status'    => ['publish', 'draft', 'pending', 'private'],
        'posts_per_page' => -1,
        'fields'         => 'all',
        'no_found_rows'  => true,
    ]);

    $patterns_checked = count($all_patterns);

    foreach ($all_patterns as $pattern) {
        if (has_blocks($pattern->post_content) && adaire_has_adaire_blocks(parse_blocks($pattern->post_content))) {
            $items_to_migrate[] = [
                'id'    => $pattern->ID,
                'title' => $pattern->post_title ?: "Untitled Pattern (ID {$pattern->ID})",
                'type'  => 'pattern',
            ];
            $patterns_count++;
        }
    }

    wp_send_json_success([
        'items'            => $items_to_migrate,
        'posts_count'      => $posts_count,
        'patterns_count'   => $patterns_count,
        'posts_checked'    => $posts_checked,
        'patterns_checked' => $patterns_checked,
    ]);
}
add_action('wp_ajax_adaire_get_posts_to_migrate', 'adaire_get_posts_to_migrate');

/**
 * Recursively check whether a parsed blocks array contains at least one
 * GutenBlocks block (namespace create-block/).
 */
function adaire_has_adaire_blocks($blocks) {
    foreach ($blocks as $block) {
        if (isset($block['blockName']) && strpos($block['blockName'], 'create-block/') === 0) {
            return true;
        }
        if (!empty($block['innerBlocks']) && adaire_has_adaire_blocks($block['innerBlocks'])) {
            return true;
        }
    }
    return false;
}
