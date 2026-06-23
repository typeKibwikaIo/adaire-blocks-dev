import { __ } from '@wordpress/i18n';

// Curated set of small, stroke-based icons for the button's optional
// trailing/leading icon. Kept visually consistent with the original
// hardcoded arrow (24x24, stroke="currentColor", strokeWidth 2, round
// caps/joins) so switching icons doesn't change the button's weight/feel.
export const BUTTON_ICON_OPTIONS = [
	{ label: __( 'Diagonal Arrow', 'button-block' ), value: 'arrow-diagonal' },
	{ label: __( 'Arrow Right', 'button-block' ), value: 'arrow-right' },
	{ label: __( 'Chevron Right', 'button-block' ), value: 'chevron-right' },
	{ label: __( 'Plus', 'button-block' ), value: 'plus' },
	{ label: __( 'External Link', 'button-block' ), value: 'external-link' },
];

const ICON_PATHS = {
	'arrow-diagonal': (
		<path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	),
	'arrow-right': (
		<path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	),
	'chevron-right': (
		<path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	),
	plus: (
		<path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	),
	'external-link': (
		<>
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</>
	),
};

// Renders the button's icon. Used identically by edit.js (canvas preview)
// and save.js (static frontend markup) so the two never drift — both just
// pass the `iconType` attribute straight through. Unknown/empty values
// (e.g. content saved before this attribute existed) fall back to the
// original diagonal arrow, matching the block's pre-existing appearance.
export default function ButtonIcon( { type } ) {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			{ ICON_PATHS[ type ] || ICON_PATHS[ 'arrow-diagonal' ] }
		</svg>
	);
}
