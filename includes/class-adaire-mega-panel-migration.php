<?php
/**
 * Versioned, non-destructive, repeat-safe migration runner for the
 * adaire_mega_panel schema.
 *
 * Runs at most once per version bump (gated by a site option so it isn't
 * re-scanning every mega panel on every admin request), and is always safe
 * to run again — every step here is additive or defaulting, never
 * destructive, so re-running against already-migrated data is a no-op.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Runs schema migrations for adaire_mega_panel posts.
 */
class AdaireMegaPanelMigration {

	const OPTION_NAME = 'adaire_mega_panel_migrated_version';

	/**
	 * Singleton instance.
	 *
	 * @var AdaireMegaPanelMigration|null
	 */
	private static $instance = null;

	/**
	 * Registers the hooks this class needs.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'maybe_run' ), 20 );
	}

	/**
	 * Gets the singleton instance.
	 *
	 * @return AdaireMegaPanelMigration
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Runs any pending migration steps, then records the new version so
	 * this is skipped on every subsequent request until the next bump.
	 * Priority 20 on init: after AdaireMegaPanelPostType::register_post_type()
	 * (default priority 10) so the post type exists before this queries it.
	 */
	public function maybe_run() {
		$migrated_version = (int) get_option( self::OPTION_NAME, 0 );

		if ( $migrated_version >= AdaireMegaPanelPostType::CURRENT_SCHEMA_VERSION ) {
			return;
		}

		if ( $migrated_version < 1 ) {
			$this->migrate_to_v1();
		}

		update_option( self::OPTION_NAME, AdaireMegaPanelPostType::CURRENT_SCHEMA_VERSION, false );
	}

	/**
	 * Migration to v1: the layout + structured items schema. Every mega panel that
	 * predates this (created before the schema version meta existed) is
	 * stamped as schema version 1, layout "standard" — the layout it was
	 * already effectively rendering as (block-editor content only), so
	 * this changes no stored content and no rendered output, only adds
	 * the version marker future migrations can build on.
	 */
	private function migrate_to_v1() {
		$panel_ids = get_posts(
			array(
				'post_type'      => AdaireMegaPanelPostType::POST_TYPE,
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- One-time migration pass, not a hot path; runs at most once per schema bump.
					array(
						'key'     => AdaireMegaPanelPostType::META_SCHEMA_VERSION,
						'compare' => 'NOT EXISTS',
					),
				),
			)
		);

		foreach ( $panel_ids as $panel_id ) {
			if ( '' === get_post_meta( $panel_id, AdaireMegaPanelPostType::META_LAYOUT, true ) ) {
				update_post_meta( $panel_id, AdaireMegaPanelPostType::META_LAYOUT, 'standard' );
			}
			update_post_meta( $panel_id, AdaireMegaPanelPostType::META_SCHEMA_VERSION, 1 );
		}
	}
}

AdaireMegaPanelMigration::get_instance();
