<?php
/**
 * Block Migration Tool
 * Batch-update all posts to re-save blocks with current save.js structure
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add migration submenu to Adaire Blocks admin menu
 */
function adaire_blocks_add_migration_menu() {
    add_submenu_page(
        'adaire-blocks-settings',  // Parent slug (Adaire Blocks menu)
        'Block Migration',          // Page title
        'Migration',                // Menu title (shorter for submenu)
        'manage_options',
        'adaire-blocks-migration',
        'adaire_blocks_migration_page'
    );
}
add_action('admin_menu', 'adaire_blocks_add_migration_menu');

/**
 * Enqueue migration page styles and scripts
 */
function adaire_blocks_enqueue_migration_assets($hook) {
    if ($hook !== 'adaire-blocks_page_adaire-blocks-migration') {
        return;
    }
    
    // Get plugin version for cache busting
    $main_plugin_file = dirname(dirname(__FILE__)) . '/adaire-blocks.php';
    $plugin_version = '1.0.0';
    if (file_exists($main_plugin_file)) {
        $plugin_data = get_file_data($main_plugin_file, array('Version' => 'Version'), false);
        $plugin_version = !empty($plugin_data['Version']) ? $plugin_data['Version'] : '1.0.0';
    }
    
    // Enqueue styles
    wp_enqueue_style(
        'adaire-blocks-migration',
        plugin_dir_url(__FILE__) . 'css/block-migration.css',
        array(),
        $plugin_version
    );
    
    // Enqueue scripts
    wp_enqueue_script(
        'adaire-blocks-migration',
        plugin_dir_url(__FILE__) . 'js/block-migration.js',
        array(),
        $plugin_version,
        true
    );
    
    // Localize script with PHP data
    wp_localize_script(
        'adaire-blocks-migration',
        'adaireMigration',
        array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('adaire_migration'),
            'postUrl' => admin_url('post.php'),
        )
    );
}
add_action('admin_enqueue_scripts', 'adaire_blocks_enqueue_migration_assets');

/**
 * Migration page HTML
 */
function adaire_blocks_migration_page() {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized access');
    }
    ?>
    <div class="wrap">
        <h1>Adaire Blocks Migration Tool</h1>
        
        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2> Update All Blocks (Queue-Based Migration)</h2>
            <p>
                This tool uses a fast queue-based system to find all posts, pages, and reusable block patterns that contain Adaire Blocks 
                and re-save them with the current block structure. This is useful when you've made changes to block 
                code that cause validation errors.
            </p>
            
            <p><strong>What this does:</strong></p>
            <ul>
                <li> Finds all posts/pages and patterns with Adaire Blocks</li>
                <li> Processes each item one at a time in a queue</li>
                <li> Automatically recovers and fixes validation errors</li>
                <li> Re-saves each item with the current block structure</li>
                <li> Preserves all block settings and content</li>
                <li> Cleans up resources after each item for optimal performance</li>
            </ul>
            
            <p><strong>⚠️ Important:</strong></p>
            <ul>
                <li> Faster than previous version - processes posts sequentially with optimized timeouts</li>
                <li> It's recommended to backup your database first</li>
                <li>Do not close this page while migration is running</li>
                <li> You can cancel at any time - already processed posts will remain migrated</li>
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
                <strong>Note:</strong> This tool will process both posts/pages and reusable block patterns (wp_block) that contain Adaire Blocks.
            </p>
        </div>
    </div>
    <?php
}

/**
 * AJAX: Get posts and patterns that need migration
 */
function adaire_get_posts_to_migrate() {
    check_ajax_referer('adaire_migration', 'nonce');

    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'Unauthorized']);
    }

    $items_to_migrate = [];
    $posts_count = 0;
    $patterns_count = 0;

    // Get all posts and pages that might contain blocks
    $args = [
        'post_type' => ['post', 'page'],
        'post_status' => ['publish', 'draft', 'pending', 'private'],
        'posts_per_page' => -1,
        'fields' => 'ids',
    ];

    $all_posts = get_posts($args);
    $posts_checked = count($all_posts);

    // Filter posts that contain Adaire Blocks
    foreach ($all_posts as $post_id) {
        $content = get_post_field('post_content', $post_id);
        
        // Check if post contains any Adaire Blocks
        if (has_blocks($content)) {
            $blocks = parse_blocks($content);
            if (adaire_has_adaire_blocks($blocks)) {
                $post = get_post($post_id);
                $items_to_migrate[] = [
                    'id' => $post_id,
                    'title' => $post->post_title,
                    'type' => 'post',
                ];
                $posts_count++;
            }
        }
    }

    // Get all reusable blocks/patterns (wp_block post type)
    $pattern_args = [
        'post_type' => 'wp_block',
        'post_status' => ['publish', 'draft', 'pending', 'private'],
        'posts_per_page' => -1,
        'fields' => 'ids',
    ];

    $all_patterns = get_posts($pattern_args);
    $patterns_checked = count($all_patterns);

    // Filter patterns that contain Adaire Blocks
    foreach ($all_patterns as $pattern_id) {
        $content = get_post_field('post_content', $pattern_id);
        
        // Check if pattern contains any Adaire Blocks
        if (has_blocks($content)) {
            $blocks = parse_blocks($content);
            if (adaire_has_adaire_blocks($blocks)) {
                $pattern = get_post($pattern_id);
                $items_to_migrate[] = [
                    'id' => $pattern_id,
                    'title' => $pattern->post_title ? $pattern->post_title : 'Untitled Pattern',
                    'type' => 'pattern',
                ];
                $patterns_count++;
            }
        }
    }

    wp_send_json_success([
        'items' => $items_to_migrate,
        'posts_count' => $posts_count,
        'patterns_count' => $patterns_count,
        'posts_checked' => $posts_checked,
        'patterns_checked' => $patterns_checked,
    ]);
}
add_action('wp_ajax_adaire_get_posts_to_migrate', 'adaire_get_posts_to_migrate');

/**
 * Check if blocks array contains any Adaire Blocks
 */
function adaire_has_adaire_blocks($blocks) {
    foreach ($blocks as $block) {
        // Check if it's an Adaire Block (starts with 'create-block/')
        if (isset($block['blockName']) && strpos($block['blockName'], 'create-block/') === 0) {
            return true;
        }
        
        // Check inner blocks recursively
        if (!empty($block['innerBlocks'])) {
            if (adaire_has_adaire_blocks($block['innerBlocks'])) {
                return true;
            }
        }
    }
    
    return false;
}

// Note: Migration now happens via JavaScript in hidden iframes
// Each post is loaded in the editor context where auto-recovery runs
// This ensures blocks are actually recovered using the current save.js