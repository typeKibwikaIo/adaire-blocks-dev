<?php
/**
 * Free Cookie Notice block — site-wide rendering.
 *
 * The Cookie Notice block (`create-block/cookie-notice-block`) is meant to be
 * placed once, anywhere on the site (its block.json already declares
 * "multiple": false), then shown on every front-end page — not just the one
 * page/post it happens to be inserted into. Regular Gutenberg blocks only
 * render wherever they sit in post_content, so this file adds the missing
 * "everywhere else" half:
 *
 *   1. Whenever a post/page is saved, scan its content for the block and
 *      cache its serialized markup (and source post ID) in a single option.
 *   2. On every front-end request, if the *current* singular page doesn't
 *      already contain the block in its own content (so it isn't rendered
 *      twice), print the cached markup via wp_footer and enqueue its
 *      script/style (which otherwise only auto-load on pages where the block
 *      is actually present in content).
 *   3. A one-time fallback scan backfills the cache for sites that already
 *      had the block placed before this file existed.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'ADAIRE_COOKIE_NOTICE_BLOCK_NAME' ) ) {
	define( 'ADAIRE_COOKIE_NOTICE_BLOCK_NAME', 'create-block/cookie-notice-block' );
}
if ( ! defined( 'ADAIRE_COOKIE_NOTICE_OPTION' ) ) {
	define( 'ADAIRE_COOKIE_NOTICE_OPTION', 'adaire_cookie_notice_global' );
}

if ( ! function_exists( 'adaire_cookie_notice_find_block' ) ) {
	/**
	 * Recursively search a parse_blocks() tree for the cookie notice block.
	 *
	 * @param array $blocks Parsed block tree.
	 * @return array|null The block array if found, otherwise null.
	 */
	function adaire_cookie_notice_find_block( $blocks ) {
		foreach ( $blocks as $block ) {
			if ( isset( $block['blockName'] ) && ADAIRE_COOKIE_NOTICE_BLOCK_NAME === $block['blockName'] ) {
				return $block;
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$inner = adaire_cookie_notice_find_block( $block['innerBlocks'] );
				if ( $inner ) {
					return $inner;
				}
			}
		}
		return null;
	}
}

if ( ! function_exists( 'adaire_cookie_notice_sync_on_save' ) ) {
	/**
	 * Keep the cached global instance in sync whenever any post/page is saved.
	 * Whichever post currently contains the block becomes the site-wide
	 * source; removing the block from that post clears the cache again.
	 *
	 * @param int     $post_id Post ID being saved.
	 * @param WP_Post $post    Post object being saved.
	 */
	function adaire_cookie_notice_sync_on_save( $post_id, $post ) {
		if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return;
		}

		if ( ! ( $post instanceof WP_Post ) ) {
			return;
		}

		$stored          = get_option( ADAIRE_COOKIE_NOTICE_OPTION );
		$was_this_source = $stored && isset( $stored['post_id'] ) && (int) $stored['post_id'] === (int) $post_id;

		if ( ! in_array( $post->post_status, array( 'publish', 'private' ), true ) ) {
			if ( $was_this_source ) {
				delete_option( ADAIRE_COOKIE_NOTICE_OPTION );
			}
			return;
		}

		$found = adaire_cookie_notice_find_block( parse_blocks( $post->post_content ) );

		if ( $found ) {
			update_option(
				ADAIRE_COOKIE_NOTICE_OPTION,
				array(
					'post_id'    => $post_id,
					'serialized' => serialize_block( $found ),
				),
				false
			);
		} elseif ( $was_this_source ) {
			// The block was removed from the post that used to be its source.
			delete_option( ADAIRE_COOKIE_NOTICE_OPTION );
		}
	}
}
add_action( 'save_post', 'adaire_cookie_notice_sync_on_save', 20, 2 );

if ( ! function_exists( 'adaire_cookie_notice_get_global_instance' ) ) {
	/**
	 * Get the cached global banner instance, backfilling it once via a direct
	 * DB scan if a site already had the block placed before this file
	 * shipped. Cheap after the first successful run — it returns immediately
	 * once the option exists.
	 *
	 * @return array{post_id:int,serialized:string}|null
	 */
	function adaire_cookie_notice_get_global_instance() {
		$stored = get_option( ADAIRE_COOKIE_NOTICE_OPTION );
		if ( ! empty( $stored['serialized'] ) ) {
			return $stored;
		}

		// Direct query, no caching wrapper: this is the one-time backfill scan
		// described in the file header — it only runs when the
		// ADAIRE_COOKIE_NOTICE_OPTION cache (checked just above) has no
		// 'serialized' value yet, and its result is written straight into
		// that option below, so it effectively runs at most once per site.
		// There's also no WP_Query equivalent for "post_content LIKE this
		// serialized block string", which is why this drops to $wpdb.
		global $wpdb;
		$post_id = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"SELECT ID FROM {$wpdb->posts} WHERE post_status IN ('publish','private') AND post_content LIKE %s LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.PreparedSQL.NotPrepared -- table name is $wpdb->posts, safe; schema-change sniff false-positives on the LIKE '%...%' wildcard syntax here, this is a plain SELECT.
				'%' . $wpdb->esc_like( 'wp:create-block/cookie-notice-block' ) . '%'
			)
		);

		if ( ! $post_id ) {
			return null;
		}

		$post = get_post( $post_id );
		if ( ! $post ) {
			return null;
		}

		$found = adaire_cookie_notice_find_block( parse_blocks( $post->post_content ) );
		if ( ! $found ) {
			return null;
		}

		$stored = array(
			'post_id'    => (int) $post_id,
			'serialized' => serialize_block( $found ),
		);
		update_option( ADAIRE_COOKIE_NOTICE_OPTION, $stored, false );

		return $stored;
	}
}

if ( ! function_exists( 'adaire_cookie_notice_already_on_page' ) ) {
	/**
	 * Whether the current request is a singular page/post that already
	 * contains the block in its own content — used to avoid rendering (or
	 * enqueueing assets for) the banner a second time on the one page it's
	 * actually inserted into. Deliberately conservative on non-singular
	 * views (archives, search, 404) where there's no single post content to
	 * check, since get_queried_object_id() doesn't return a post ID there.
	 *
	 * @return bool
	 */
	function adaire_cookie_notice_already_on_page() {
		if ( ! is_singular() ) {
			return false;
		}
		return has_block( ADAIRE_COOKIE_NOTICE_BLOCK_NAME, get_queried_object_id() );
	}
}

if ( ! function_exists( 'adaire_cookie_notice_maybe_enqueue_global_assets' ) ) {
	/**
	 * Enqueue the block's own script/style on pages where it isn't naturally
	 * present, since normal WP block-asset auto-loading only fires for
	 * blocks that actually appear in the page being rendered.
	 */
	function adaire_cookie_notice_maybe_enqueue_global_assets() {
		if ( is_admin() || adaire_cookie_notice_already_on_page() ) {
			return;
		}

		if ( ! adaire_cookie_notice_get_global_instance() ) {
			return;
		}

		if ( wp_style_is( 'create-block-cookie-notice-block-style', 'registered' ) ) {
			wp_enqueue_style( 'create-block-cookie-notice-block-style' );
		}
		if ( wp_script_is( 'create-block-cookie-notice-block-view-script', 'registered' ) ) {
			wp_enqueue_script( 'create-block-cookie-notice-block-view-script' );
		}
	}
}
add_action( 'wp_enqueue_scripts', 'adaire_cookie_notice_maybe_enqueue_global_assets', 20 );

if ( ! function_exists( 'adaire_cookie_notice_maybe_render_global' ) ) {
	/**
	 * Print the cached banner on every front-end page that doesn't already
	 * render it as part of its own content.
	 */
	function adaire_cookie_notice_maybe_render_global() {
		if ( is_admin() || adaire_cookie_notice_already_on_page() ) {
			return;
		}

		$stored = adaire_cookie_notice_get_global_instance();
		if ( ! $stored ) {
			return;
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- this replays the block's own save() output, which the block itself is responsible for escaping.
		echo do_blocks( $stored['serialized'] );
	}
}
add_action( 'wp_footer', 'adaire_cookie_notice_maybe_render_global', 20 );
