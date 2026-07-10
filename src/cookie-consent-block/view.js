/**
 * Cookie Banner — front-end behavior.
 *
 * Responsibilities:
 *  - Show the banner on first visit, restore a prior decision from
 *    localStorage on later visits (with expiration + version support).
 *  - Wire up Accept All / Reject All / Manage / Save Preferences / Close /
 *    Reopen actions.
 *  - Dispatch `window.adaireCookieConsentChange` (CustomEvent) + set
 *    `window.adaireCookieConsent` on every decision, so any script on the
 *    page can react without depending on our internals.
 *  - Optionally push category decisions into Google Consent Mode v2
 *    (`gtag('consent','update', …)`) when a `gtag` function is present.
 *  - Optionally activate consent-gated inline scripts: give any <script>
 *    `type="text/plain" data-cookie-consent="analytics"` (or another
 *    category key) and it is only executed once that category is granted.
 */
( function () {
	var STORAGE_PREFIX = 'adaireCookieConsent';

	function storageKey( version ) {
		return STORAGE_PREFIX + '_v' + version;
	}

	function readConsent( version ) {
		try {
			var raw = window.localStorage.getItem( storageKey( version ) );
			if ( ! raw ) return null;
			var parsed = JSON.parse( raw );
			if ( parsed && parsed.expiresAt && Date.now() > parsed.expiresAt ) return null;
			return parsed;
		} catch ( e ) {
			return null;
		}
	}

	function writeConsent( version, status, categories, days ) {
		var record = {
			status: status,
			categories: categories,
			timestamp: Date.now(),
			expiresAt: Date.now() + ( Number( days ) || 180 ) * 86400000,
		};
		try {
			window.localStorage.setItem( storageKey( version ), JSON.stringify( record ) );
		} catch ( e ) {
			/* localStorage unavailable (private mode / disabled) — consent still applies for this page view */
		}
		return record;
	}

	function dispatchConsentEvent( record ) {
		try {
			window.adaireCookieConsent = record;
			window.dispatchEvent( new CustomEvent( 'adaireCookieConsentChange', { detail: record } ) );
		} catch ( e ) {
			/* no-op */
		}
	}

	function updateGoogleConsentMode( categories ) {
		if ( typeof window.gtag !== 'function' ) return;
		var granted = function ( key ) {
			return categories && categories[ key ] ? 'granted' : 'denied';
		};
		window.gtag( 'consent', 'update', {
			analytics_storage: granted( 'analytics' ),
			ad_storage: granted( 'marketing' ) === 'granted' || granted( 'advertising' ) === 'granted' ? 'granted' : 'denied',
			ad_user_data: granted( 'marketing' ) === 'granted' || granted( 'advertising' ) === 'granted' ? 'granted' : 'denied',
			ad_personalization: granted( 'marketing' ) === 'granted' || granted( 'advertising' ) === 'granted' ? 'granted' : 'denied',
			functionality_storage: granted( 'functional' ),
			personalization_storage: granted( 'preferences' ),
		} );
	}

	function activateGatedScripts( categories ) {
		var nodes = document.querySelectorAll( 'script[type="text/plain"][data-cookie-consent]' );
		nodes.forEach( function ( node ) {
			var category = node.getAttribute( 'data-cookie-consent' );
			if ( ! categories || ! categories[ category ] ) return;
			if ( node.dataset.adaireActivated === '1' ) return;

			var replacement = document.createElement( 'script' );
			Array.prototype.forEach.call( node.attributes, function ( attr ) {
				if ( attr.name === 'type' || attr.name === 'data-cookie-consent' ) return;
				replacement.setAttribute( attr.name, attr.value );
			} );
			replacement.text = node.text || node.textContent || '';
			node.dataset.adaireActivated = '1';
			node.parentNode.insertBefore( replacement, node.nextSibling );
		} );
	}

	// Build a { key: bool } map from the block's category config. When
	// `overrides` is null, every non-required category falls back to its
	// configured "on by default" state (used for the Accept All action).
	function categoriesFromConfig( configList, overrides ) {
		var out = {};
		configList.forEach( function ( cat ) {
			if ( cat.required ) {
				out[ cat.key ] = true;
			} else if ( overrides ) {
				out[ cat.key ] = !! overrides[ cat.key ];
			} else {
				out[ cat.key ] = !! cat.defaultChecked;
			}
		} );
		return out;
	}

	function setPrefCheckboxes( panel, categories ) {
		if ( ! panel ) return;
		panel.querySelectorAll( 'input[type="checkbox"][data-category]' ).forEach( function ( box ) {
			var key = box.getAttribute( 'data-category' );
			if ( categories[ key ] !== undefined ) box.checked = !! categories[ key ];
		} );
	}

	function readPrefCheckboxes( panel, configList ) {
		var out = {};
		configList.forEach( function ( cat ) {
			if ( cat.required ) {
				out[ cat.key ] = true;
				return;
			}
			var box = panel && panel.querySelector( 'input[type="checkbox"][data-category="' + cat.key + '"]' );
			out[ cat.key ] = box ? !! box.checked : !! cat.defaultChecked;
		} );
		return out;
	}

	function initBanner( root ) {
		var version = root.getAttribute( 'data-consent-version' ) || '1';
		var days = root.getAttribute( 'data-consent-days' ) || 180;
		var autoHide = root.getAttribute( 'data-auto-hide' ) === '1';
		var autoHideDelay = Number( root.getAttribute( 'data-auto-hide-delay' ) || 300 );
		var googleConsentMode = root.getAttribute( 'data-google-consent-mode' ) === '1';
		var blockScripts = root.getAttribute( 'data-block-scripts' ) === '1';
		var configList = [];
		try {
			configList = JSON.parse( root.getAttribute( 'data-categories' ) || '[]' );
		} catch ( e ) {
			configList = [];
		}

		var panel = root.querySelector( '.adaire-cookie-banner__panel' );
		var prefsPanel = root.querySelector( '.adaire-cookie-banner__prefs' );
		var reopenBtn = root.querySelector( '.adaire-cookie-banner__reopen' );

		function focusFirst() {
			var target = panel && panel.querySelector( 'button, a, input' );
			if ( target ) target.focus( { preventScroll: true } );
		}

		function showBanner() {
			root.classList.remove( 'is-hidden' );
			root.classList.add( 'is-visible' );
			if ( reopenBtn ) reopenBtn.hidden = true;
			window.requestAnimationFrame( focusFirst );
		}

		function hideBanner() {
			var finish = function () {
				root.classList.add( 'is-hidden' );
				root.classList.remove( 'is-visible' );
				if ( prefsPanel ) prefsPanel.hidden = true;
				if ( reopenBtn ) reopenBtn.hidden = false;
			};
			if ( autoHide ) {
				setTimeout( finish, autoHideDelay );
			} else {
				finish();
			}
		}

		function commit( status, categories ) {
			var record = writeConsent( version, status, categories, days );
			dispatchConsentEvent( record );
			if ( googleConsentMode ) updateGoogleConsentMode( categories );
			if ( blockScripts ) activateGatedScripts( categories );
			hideBanner();
		}

		// ── Restore prior consent, or show the banner for a first-time visitor ──
		var existing = readConsent( version );
		if ( existing && existing.categories ) {
			setPrefCheckboxes( prefsPanel, existing.categories );
			if ( googleConsentMode ) updateGoogleConsentMode( existing.categories );
			if ( blockScripts ) activateGatedScripts( existing.categories );
			root.classList.add( 'is-hidden' );
			if ( reopenBtn ) reopenBtn.hidden = false;
		} else {
			if ( googleConsentMode ) {
				// Default to "denied" for every non-required category until a decision is made.
				updateGoogleConsentMode( categoriesFromConfig( configList, {} ) );
			}
			if ( reopenBtn ) reopenBtn.hidden = true;
			showBanner();
		}

		root.addEventListener( 'click', function ( e ) {
			var target = e.target.closest( '[data-cookie-action]' );
			if ( ! target ) return;
			var action = target.getAttribute( 'data-cookie-action' );

			if ( action === 'accept' ) {
				commit( 'accepted', categoriesFromConfig( configList, null ) );
			} else if ( action === 'reject' ) {
				commit( 'rejected', categoriesFromConfig( configList, {} ) );
			} else if ( action === 'manage' ) {
				if ( prefsPanel ) prefsPanel.hidden = ! prefsPanel.hidden;
			} else if ( action === 'save-prefs' ) {
				commit( 'custom', readPrefCheckboxes( prefsPanel, configList ) );
			} else if ( action === 'reopen' ) {
				var stored = readConsent( version );
				if ( stored && stored.categories ) setPrefCheckboxes( prefsPanel, stored.categories );
				showBanner();
			} else if ( action === 'dismiss' || action === 'dismiss-overlay' ) {
				var kept = readConsent( version );
				if ( ! kept ) {
					commit( 'dismissed', categoriesFromConfig( configList, {} ) );
				} else {
					hideBanner();
				}
			}
		} );

		root.addEventListener( 'keydown', function ( e ) {
			if ( e.key === 'Escape' && root.classList.contains( 'is-visible' ) ) {
				var kept = readConsent( version );
				if ( kept ) hideBanner();
			}
		} );
	}

	function ready( fn ) {
		if ( document.readyState !== 'loading' ) fn();
		else document.addEventListener( 'DOMContentLoaded', fn );
	}

	ready( function () {
		document.querySelectorAll( '.adaire-cookie-banner' ).forEach( initBanner );
	} );
} )();
