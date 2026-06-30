<?php
/**
 * Uninstall handler for Adaire Blocks.
 *
 * WordPress runs this file (instead of the main plugin file) when the
 * plugin is deleted from the Plugins screen, but only after it has
 * already been deactivated. It is intentionally separate from
 * adaire-blocks.php, which previously had no uninstall routine at all —
 * the plugin's options, transient, and custom license table were never
 * cleaned up, and old installations could not be fully removed.
 *
 * Note: this file controls data cleanup once WordPress has agreed to
 * delete the plugin's files. It does not by itself fix filesystem-level
 * "cannot delete plugin" errors — those are almost always caused by the
 * plugin's files/folders being owned by a different system user than the
 * one PHP/the web server runs as (e.g. files uploaded via SFTP as root,
 * or a server migration that changed ownership). If deletion still fails
 * after this file is in place, check file ownership/permissions on the
 * plugin directory on the server (`ls -la wp-content/plugins/`) rather
 * than looking for another code-level cause.
 *
 * @package AdaireBlocks
 */

// If uninstall.php is not called by WordPress, exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Remove all Adaire Blocks data for a single site (options, transients,
 * and the custom license table).
 */
function adaire_blocks_uninstall_cleanup_site() {
	global $wpdb;

	// Options created by includes/class-adaire-blocks-license.php and
	// adaire-blocks.php's update-checker transient.
	delete_option( 'adaire_blocks_license_key' );
	delete_option( 'adaire_blocks_license_status' );
	delete_transient( 'adaire-blocks_latest_version' );

	// Custom table created by AdaireBlocksLicense::create_license_table().
	$table_name = $wpdb->prefix . 'adaire_blocks_licenses';
	$wpdb->query( "DROP TABLE IF EXISTS `{$table_name}`" ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- table name is built from $wpdb->prefix, not user input.
}

if ( is_multisite() ) {
	$site_ids = get_sites( array( 'fields' => 'ids' ) );

	foreach ( $site_ids as $site_id ) {
		switch_to_blog( $site_id );
		adaire_blocks_uninstall_cleanup_site();
		restore_current_blog();
	}
} else {
	adaire_blocks_uninstall_cleanup_site();
}
