// Cookie Notice Block (Free) — frontend runtime.
// Shows a floating Accept All / Decline banner once, then remembers the
// visitor's choice in localStorage so it never reappears for them again.

const STORAGE_KEY = 'adaireCookieNoticeConsent';

function readConsent() {
	try {
		const raw = window.localStorage.getItem( STORAGE_KEY );
		if ( ! raw ) {
			return null;
		}
		const parsed = JSON.parse( raw );
		return parsed && parsed.status ? parsed : null;
	} catch ( e ) {
		// localStorage unavailable (private mode, disabled, etc.) — fail open
		// and just show the banner every visit rather than breaking the page.
		return null;
	}
}

function writeConsent( status ) {
	const payload = { status, ts: Date.now() };
	try {
		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( payload ) );
	} catch ( e ) {
		// Ignore storage errors — the banner will just reappear next visit.
	}
	window.adaireCookieNoticeConsent = payload;
	window.dispatchEvent(
		new CustomEvent( 'adaireCookieNoticeChange', { detail: payload } )
	);
}

function initNotice( root ) {
	const panelWrap = root.querySelector( '.adaire-cookie-notice-panel-wrap' );
	const acceptBtn = root.querySelector( '[data-cookie-action="accept"]' );
	const declineBtn = root.querySelector( '[data-cookie-action="decline"]' );
	const reopenBtn = root.querySelector( '[data-cookie-action="reopen"]' );

	if ( ! panelWrap ) {
		return;
	}

	// Two states: the consent panel showing (first visit, or the visitor
	// clicked the reopen icon to revisit their choice), or just the small
	// reopen icon showing (a choice has already been recorded). The icon
	// stays on screen permanently once a decision is made, so visitors can
	// always come back and change their mind.
	const showPanel = () => {
		root.classList.remove( 'is-reopen-visible' );
		root.classList.add( 'is-panel-visible' );
	};

	const showReopenIcon = () => {
		root.classList.remove( 'is-panel-visible' );
		root.classList.add( 'is-reopen-visible' );
	};

	const existing = readConsent();
	if ( existing ) {
		window.adaireCookieNoticeConsent = existing;
	}

	requestAnimationFrame( () => {
		if ( existing ) {
			showReopenIcon();
		} else {
			showPanel();
		}
	} );

	const decide = ( status ) => {
		writeConsent( status );
		showReopenIcon();
	};

	if ( acceptBtn ) {
		acceptBtn.addEventListener( 'click', () => decide( 'accepted' ) );
	}
	if ( declineBtn ) {
		declineBtn.addEventListener( 'click', () => decide( 'declined' ) );
	}
	if ( reopenBtn ) {
		reopenBtn.addEventListener( 'click', showPanel );
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	document
		.querySelectorAll( '.adaire-cookie-notice-block' )
		.forEach( initNotice );
} );
