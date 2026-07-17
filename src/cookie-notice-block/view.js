// Cookie Notice Block (Free) — frontend runtime.
// Shows a floating Accept All / Decline / Customize banner once, then
// remembers the visitor's choice (in both localStorage and an actual
// browser cookie, so server-side code can read it too) so it never
// reappears for them again — until it expires or the site owner bumps
// the consent-policy version.

const STORAGE_KEY = 'adaireCookieNoticeConsent';
const COOKIE_NAME = 'adaire_cookie_consent';
const DEFAULT_EXPIRATION_DAYS = 365;
const CATEGORIES = [ 'preferences', 'analytics', 'marketing' ];

function getCookieRaw( name ) {
	const match = document.cookie.match(
		new RegExp( '(?:^|; )' + name.replace( /([.$?*|{}()[\]\\/+^])/g, '\\$1' ) + '=([^;]*)' )
	);
	return match ? decodeURIComponent( match[ 1 ] ) : null;
}

function setCookie( name, value, expiresAtIso ) {
	try {
		const parts = [ name + '=' + encodeURIComponent( value ), 'path=/', 'SameSite=Lax' ];
		if ( expiresAtIso ) {
			parts.push( 'expires=' + new Date( expiresAtIso ).toUTCString() );
		}
		if ( window.location.protocol === 'https:' ) {
			parts.push( 'Secure' );
		}
		document.cookie = parts.join( '; ' );
	} catch ( e ) {
		// Ignore — the localStorage copy is still authoritative for the JS side.
	}
}

function clearCookie( name ) {
	try {
		document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
	} catch ( e ) {
		// Ignore.
	}
}

function clearConsent() {
	try {
		window.localStorage.removeItem( STORAGE_KEY );
	} catch ( e ) {
		// Ignore.
	}
	clearCookie( COOKIE_NAME );
}

function readConsent( expirationDays, consentVersion ) {
	let raw;
	try {
		raw = window.localStorage.getItem( STORAGE_KEY );
	} catch ( e ) {
		raw = null;
	}
	if ( ! raw ) {
		// localStorage was cleared (or unavailable) but the cookie may still be
		// there — e.g. a visitor cleared site data on one device only.
		raw = getCookieRaw( COOKIE_NAME );
	}
	if ( ! raw ) {
		return null;
	}

	let parsed;
	try {
		parsed = JSON.parse( raw );
	} catch ( e ) {
		return null;
	}
	if ( ! parsed || ! parsed.status ) {
		return null;
	}

	// The site owner changed the consent policy (new version string) — treat
	// any prior choice as stale and ask again.
	if ( consentVersion && parsed.version !== consentVersion ) {
		clearConsent();
		return null;
	}

	const days = Number( expirationDays ) > 0 ? Number( expirationDays ) : DEFAULT_EXPIRATION_DAYS;
	const expiresAtMs = parsed.expiresAt ? new Date( parsed.expiresAt ).getTime() : 0;
	const fallbackExpiresAtMs = parsed.consentedAt
		? new Date( parsed.consentedAt ).getTime() + days * 24 * 60 * 60 * 1000
		: 0;
	const effectiveExpiresAtMs = expiresAtMs || fallbackExpiresAtMs;

	if ( effectiveExpiresAtMs && Date.now() > effectiveExpiresAtMs ) {
		clearConsent();
		return null;
	}

	return parsed;
}

function writeConsent( status, categories, expirationDays, consentVersion ) {
	const days = Number( expirationDays ) > 0 ? Number( expirationDays ) : DEFAULT_EXPIRATION_DAYS;
	const now = new Date();
	const expires = new Date( now.getTime() + days * 24 * 60 * 60 * 1000 );

	const payload = {
		version: consentVersion || '1',
		status,
		necessary: true,
		preferences: !! ( categories && categories.preferences ),
		analytics: !! ( categories && categories.analytics ),
		marketing: !! ( categories && categories.marketing ),
		consentedAt: now.toISOString(),
		expiresAt: expires.toISOString(),
	};

	try {
		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( payload ) );
	} catch ( e ) {
		// Ignore storage errors — the cookie below is a second, independent copy.
	}
	setCookie( COOKIE_NAME, JSON.stringify( payload ), payload.expiresAt );

	window.adaireCookieNoticeConsent = payload;
	window.dispatchEvent(
		new CustomEvent( 'adaireCookieNoticeChange', { detail: payload } )
	);

	return payload;
}

function initNotice( root ) {
	const panelWrap = root.querySelector( '.adaire-cookie-notice-panel-wrap' );
	const acceptBtn = root.querySelector( '[data-cookie-action="accept"]' );
	const declineBtn = root.querySelector( '[data-cookie-action="decline"]' );
	const customizeBtn = root.querySelector( '[data-cookie-action="customize"]' );
	const savePrefsBtn = root.querySelector( '[data-cookie-action="save-preferences"]' );
	const reopenBtn = root.querySelector( '[data-cookie-action="reopen"]' );
	const prefsPanel = root.querySelector( '[data-cookie-prefs]' );

	if ( ! panelWrap ) {
		return;
	}

	const expirationDays = root.dataset.expirationDays;
	const consentVersion = root.dataset.consentVersion;

	const categoryInput = ( category ) =>
		prefsPanel && prefsPanel.querySelector( `[data-cookie-category="${ category }"]` );

	const fillPrefsFrom = ( consent ) => {
		if ( ! prefsPanel ) {
			return;
		}
		CATEGORIES.forEach( ( category ) => {
			const input = categoryInput( category );
			if ( input ) {
				input.checked = !! ( consent && consent[ category ] );
			}
		} );
	};

	const readPrefsFromInputs = () => {
		const categories = {};
		CATEGORIES.forEach( ( category ) => {
			const input = categoryInput( category );
			categories[ category ] = !! ( input && input.checked );
		} );
		return categories;
	};

	// Three states: the full consent panel (first visit, or reopened), the
	// panel with the per-category preferences view expanded, or just the
	// small reopen icon (a choice has already been recorded). The icon stays
	// on screen permanently once a decision is made, so visitors can always
	// come back and change their mind.
	const showPanel = () => {
		root.classList.remove( 'is-reopen-visible', 'is-prefs-open' );
		root.classList.add( 'is-panel-visible' );
	};

	const showReopenIcon = () => {
		root.classList.remove( 'is-panel-visible', 'is-prefs-open' );
		root.classList.add( 'is-reopen-visible' );
	};

	const openPrefs = () => {
		fillPrefsFrom( existingRef.current );
		root.classList.add( 'is-prefs-open' );
	};

	// Mutable box so openPrefs() (defined once) always sees the latest choice.
	const existingRef = { current: readConsent( expirationDays, consentVersion ) };
	if ( existingRef.current ) {
		window.adaireCookieNoticeConsent = existingRef.current;
	}

	requestAnimationFrame( () => {
		if ( existingRef.current ) {
			showReopenIcon();
		} else {
			showPanel();
		}
	} );

	const decide = ( status, categories ) => {
		existingRef.current = writeConsent( status, categories, expirationDays, consentVersion );
		showReopenIcon();
	};

	if ( acceptBtn ) {
		acceptBtn.addEventListener( 'click', () =>
			decide( 'accepted', { preferences: true, analytics: true, marketing: true } )
		);
	}
	if ( declineBtn ) {
		declineBtn.addEventListener( 'click', () =>
			decide( 'declined', { preferences: false, analytics: false, marketing: false } )
		);
	}
	if ( customizeBtn ) {
		customizeBtn.addEventListener( 'click', openPrefs );
	}
	if ( savePrefsBtn ) {
		savePrefsBtn.addEventListener( 'click', () => decide( 'custom', readPrefsFromInputs() ) );
	}
	if ( reopenBtn ) {
		reopenBtn.addEventListener( 'click', showPanel );
	}
}

function initAll() {
	document
		.querySelectorAll( '.adaire-cookie-notice-block' )
		.forEach( initNotice );
}

// Guard against the script executing after DOMContentLoaded has already
// fired — WordPress can enqueue view scripts with a defer/module strategy,
// and the timing of that relative to DOMContentLoaded isn't identical across
// browser engines. If the listener is registered too late, 'DOMContentLoaded'
// never fires again and initNotice() (and therefore every click handler,
// including the ones that write to localStorage) never runs — which looks
// exactly like "consent isn't saved" in whichever browser loses that race.
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initAll );
} else {
	initAll();
}
