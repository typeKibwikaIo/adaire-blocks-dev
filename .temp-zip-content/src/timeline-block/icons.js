// Shared SVG icon map — used by both edit.js and save.js so WP can serialise them cleanly.

export const ICON_SVGS = {
	shield: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
		</svg>
	),
	zap: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
		</svg>
	),
	check: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<polyline points="20 6 9 17 4 12"/>
		</svg>
	),
	globe: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="10"/>
			<line x1="2" y1="12" x2="22" y2="12"/>
			<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
		</svg>
	),
	star: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
		</svg>
	),
	users: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
			<circle cx="9" cy="7" r="4"/>
			<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
			<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
		</svg>
	),
	lock: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
			<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
		</svg>
	),
	arrow: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<line x1="5" y1="12" x2="19" y2="12"/>
			<polyline points="12 5 19 12 12 19"/>
		</svg>
	),
	wallet: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
			<path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
		</svg>
	),
	settings: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="3"/>
			<path d="M19.07 4.93A10 10 0 1 0 4.93 19.07A10 10 0 0 0 19.07 4.93z"/>
		</svg>
	),
	layers: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<polygon points="12 2 2 7 12 12 22 7 12 2"/>
			<polyline points="2 17 12 22 22 17"/>
			<polyline points="2 12 12 17 22 12"/>
		</svg>
	),
	target: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="10"/>
			<circle cx="12" cy="12" r="6"/>
			<circle cx="12" cy="12" r="2"/>
		</svg>
	),
};

export const ICON_OPTIONS = Object.keys( ICON_SVGS ).map( ( k ) => ( {
	label: k.charAt( 0 ).toUpperCase() + k.slice( 1 ),
	value: k,
} ) );
