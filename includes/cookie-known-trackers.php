<?php
/**
 * Built-in signature table used to auto-categorize cookies the passive
 * scanner (class-adaire-cookie-scanner.php) sees on real page loads —
 * mirrors CookieYes's "categorization based on domain names and scripts"
 * behaviour, without calling out to any external service. Purely a local
 * lookup: name (or name pattern, `*` = wildcard suffix match) => category/
 * provider/purpose/duration guess. Anything that doesn't match stays
 * Uncategorized for the admin to fill in by hand.
 *
 * @package AdaireBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'adaire_cookie_known_trackers' ) ) {
	/**
	 * @return array[] Each row: name, category, provider, purpose, duration.
	 */
	function adaire_cookie_known_trackers() {
		static $table = null;
		if ( null !== $table ) {
			return $table;
		}

		$table = array(
			// WordPress core / this site — always Necessary.
			array( 'name' => 'wordpress_logged_in_*', 'category' => 'necessary', 'provider' => 'WordPress', 'purpose' => 'Keeps you logged in to wp-admin.', 'duration' => 'Session' ),
			array( 'name' => 'wordpress_sec_*', 'category' => 'necessary', 'provider' => 'WordPress', 'purpose' => 'Secure authentication for wp-admin.', 'duration' => 'Session' ),
			array( 'name' => 'wp-settings-*', 'category' => 'necessary', 'provider' => 'WordPress', 'purpose' => 'Remembers your wp-admin UI preferences.', 'duration' => '1 year' ),
			array( 'name' => 'wordpress_test_cookie', 'category' => 'necessary', 'provider' => 'WordPress', 'purpose' => 'Checks whether cookies are enabled in your browser.', 'duration' => 'Session' ),
			array( 'name' => 'PHPSESSID', 'category' => 'necessary', 'provider' => 'This website', 'purpose' => 'Maintains your session on the server.', 'duration' => 'Session' ),
			array( 'name' => 'adaireCookieConsent_*', 'category' => 'necessary', 'provider' => 'This website', 'purpose' => 'Stores your cookie consent choices.', 'duration' => '180 days' ),

			// WooCommerce.
			array( 'name' => 'woocommerce_cart_hash', 'category' => 'necessary', 'provider' => 'WooCommerce', 'purpose' => 'Detects when the cart contents change.', 'duration' => 'Session' ),
			array( 'name' => 'woocommerce_items_in_cart', 'category' => 'necessary', 'provider' => 'WooCommerce', 'purpose' => 'Tracks how many items are in the cart.', 'duration' => 'Session' ),
			array( 'name' => 'wp_woocommerce_session_*', 'category' => 'necessary', 'provider' => 'WooCommerce', 'purpose' => 'Maintains your shopping cart and session.', 'duration' => '2 days' ),

			// Google Analytics / Ads.
			array( 'name' => '_ga', 'category' => 'analytics', 'provider' => 'Google Analytics', 'purpose' => 'Distinguishes unique visitors for site analytics.', 'duration' => '2 years' ),
			array( 'name' => '_ga_*', 'category' => 'analytics', 'provider' => 'Google Analytics', 'purpose' => 'Persists session state for GA4 property analytics.', 'duration' => '2 years' ),
			array( 'name' => '_gid', 'category' => 'analytics', 'provider' => 'Google Analytics', 'purpose' => 'Distinguishes unique visitors, short-lived.', 'duration' => '24 hours' ),
			array( 'name' => '_gat', 'category' => 'analytics', 'provider' => 'Google Analytics', 'purpose' => 'Throttles the rate of analytics requests.', 'duration' => '1 minute' ),
			array( 'name' => '_gat_*', 'category' => 'analytics', 'provider' => 'Google Analytics', 'purpose' => 'Throttles the rate of analytics requests.', 'duration' => '1 minute' ),
			array( 'name' => '_gcl_au', 'category' => 'advertising', 'provider' => 'Google Ads', 'purpose' => 'Stores ad click conversion data.', 'duration' => '3 months' ),
			array( 'name' => 'IDE', 'category' => 'advertising', 'provider' => 'Google / DoubleClick', 'purpose' => 'Used to serve and measure targeted ads.', 'duration' => '1 year' ),
			array( 'name' => 'test_cookie', 'category' => 'advertising', 'provider' => 'Google / DoubleClick', 'purpose' => 'Checks whether your browser supports cookies for ads.', 'duration' => '15 minutes' ),
			array( 'name' => 'NID', 'category' => 'advertising', 'provider' => 'Google', 'purpose' => 'Remembers preferences for Google-hosted ads.', 'duration' => '6 months' ),
			array( 'name' => '1P_JAR', 'category' => 'advertising', 'provider' => 'Google', 'purpose' => 'Gathers site statistics and measures ad effectiveness.', 'duration' => '1 month' ),

			// Meta / Facebook.
			array( 'name' => '_fbp', 'category' => 'marketing', 'provider' => 'Meta / Facebook', 'purpose' => 'Delivers a series of advertisement products.', 'duration' => '3 months' ),
			array( 'name' => '_fbc', 'category' => 'marketing', 'provider' => 'Meta / Facebook', 'purpose' => 'Stores the last Facebook ad click for attribution.', 'duration' => '2 years' ),
			array( 'name' => 'fr', 'category' => 'marketing', 'provider' => 'Meta / Facebook', 'purpose' => 'Delivers, measures, and improves ad relevance.', 'duration' => '3 months' ),

			// Analytics / heatmaps.
			array( 'name' => '_hjSessionUser_*', 'category' => 'analytics', 'provider' => 'Hotjar', 'purpose' => 'Persists the Hotjar user ID across sessions.', 'duration' => '1 year' ),
			array( 'name' => '_hjSession_*', 'category' => 'analytics', 'provider' => 'Hotjar', 'purpose' => 'Holds the current Hotjar session state.', 'duration' => '30 minutes' ),
			array( 'name' => '_hjFirstSeen', 'category' => 'analytics', 'purpose' => 'Identifies a visitor\'s first Hotjar session.', 'provider' => 'Hotjar', 'duration' => '30 minutes' ),
			array( 'name' => '_clck', 'category' => 'analytics', 'provider' => 'Microsoft Clarity', 'purpose' => 'Persists the Clarity user ID across sessions.', 'duration' => '1 year' ),
			array( 'name' => '_clsk', 'category' => 'analytics', 'provider' => 'Microsoft Clarity', 'purpose' => 'Connects page views into a single Clarity session.', 'duration' => '1 day' ),
			array( 'name' => '_gcl_dc', 'category' => 'advertising', 'provider' => 'Google Ads', 'purpose' => 'Stores ad click conversion data (DoubleClick).', 'duration' => '3 months' ),

			// Marketing / CRM.
			array( 'name' => 'hubspotutk', 'category' => 'marketing', 'provider' => 'HubSpot', 'purpose' => 'Tracks visitor identity for HubSpot forms/chat.', 'duration' => '1 year' ),
			array( 'name' => '__hstc', 'category' => 'marketing', 'provider' => 'HubSpot', 'purpose' => 'Tracks visitor and session for analytics.', 'duration' => '1 year' ),
			array( 'name' => '__hssc', 'category' => 'marketing', 'provider' => 'HubSpot', 'purpose' => 'Tracks sessions for analytics.', 'duration' => '30 minutes' ),
			array( 'name' => '__hssrc', 'category' => 'marketing', 'provider' => 'HubSpot', 'purpose' => 'Detects whether a new session has started.', 'duration' => 'Session' ),
			array( 'name' => '_ttp', 'category' => 'marketing', 'provider' => 'TikTok', 'purpose' => 'Enables ad tracking across TikTok and this site.', 'duration' => '13 months' ),
			array( 'name' => 'li_sugr', 'category' => 'marketing', 'provider' => 'LinkedIn', 'purpose' => 'Identifies browser ID for LinkedIn ad tracking.', 'duration' => '3 months' ),
			array( 'name' => 'bcookie', 'category' => 'marketing', 'provider' => 'LinkedIn', 'purpose' => 'Identifies the browser for LinkedIn ads.', 'duration' => '1 year' ),
			array( 'name' => 'lidc', 'category' => 'marketing', 'provider' => 'LinkedIn', 'purpose' => 'Routes LinkedIn traffic for performance.', 'duration' => '24 hours' ),

			// Payments.
			array( 'name' => '__stripe_mid', 'category' => 'necessary', 'provider' => 'Stripe', 'purpose' => 'Fraud prevention for payments.', 'duration' => '1 year' ),
			array( 'name' => '__stripe_sid', 'category' => 'necessary', 'provider' => 'Stripe', 'purpose' => 'Fraud prevention for payments, per session.', 'duration' => '30 minutes' ),

			// Video embeds.
			array( 'name' => 'VISITOR_INFO1_LIVE', 'category' => 'advertising', 'provider' => 'YouTube', 'purpose' => 'Estimates bandwidth for embedded videos.', 'duration' => '6 months' ),
			array( 'name' => 'YSC', 'category' => 'advertising', 'provider' => 'YouTube', 'purpose' => 'Tracks embedded video views on this site.', 'duration' => 'Session' ),
			array( 'name' => 'yt-remote-*', 'category' => 'functional', 'provider' => 'YouTube', 'purpose' => 'Remembers your YouTube player preferences.', 'duration' => 'Session' ),
			array( 'name' => 'vuid', 'category' => 'advertising', 'provider' => 'Vimeo', 'purpose' => 'Collects usage data for embedded Vimeo videos.', 'duration' => '2 years' ),

			// Infrastructure — necessary/performance, not tracking.
			array( 'name' => '__cf_bm', 'category' => 'performance', 'provider' => 'Cloudflare', 'purpose' => 'Bot-management, distinguishes humans from bots.', 'duration' => '30 minutes' ),
			array( 'name' => 'cf_clearance', 'category' => 'necessary', 'provider' => 'Cloudflare', 'purpose' => 'Confirms you passed a security check.', 'duration' => '1 year' ),
			array( 'name' => '_cfuvid', 'category' => 'performance', 'provider' => 'Cloudflare', 'purpose' => 'Supports Cloudflare bot management across requests.', 'duration' => 'Session' ),
		);

		return $table;
	}
}

if ( ! function_exists( 'adaire_cookie_match_known_tracker' ) ) {
	/**
	 * Look up one cookie/storage-key name against the known-tracker table.
	 * Supports a trailing-wildcard pattern (`_ga_*` matches `_ga_ABC123`).
	 *
	 * @param string $name Cookie or storage key name to look up.
	 * @return array|null Matching row (name/category/provider/purpose/duration), or null.
	 */
	function adaire_cookie_match_known_tracker( $name ) {
		$name = (string) $name;
		if ( '' === $name ) {
			return null;
		}

		foreach ( adaire_cookie_known_trackers() as $row ) {
			$pattern = $row['name'];
			if ( false !== strpos( $pattern, '*' ) ) {
				$prefix = rtrim( substr( $pattern, 0, strpos( $pattern, '*' ) ) );
				if ( '' !== $prefix && 0 === strpos( $name, $prefix ) ) {
					return $row;
				}
			} elseif ( $pattern === $name ) {
				return $row;
			}
		}

		return null;
	}
}
