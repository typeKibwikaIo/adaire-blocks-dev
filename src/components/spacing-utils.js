/**
 * Shared spacing helpers for the structured editor sidebar.
 * Converts a BoxControl-style object ({ top, right, bottom, left }) into a
 * CSS shorthand string. Returns '' when the box has no values so that
 * untouched blocks keep producing identical markup (no save validation break).
 */
export function boxToCss( box ) {
	if ( ! box || typeof box !== 'object' ) {
		return '';
	}

	const { top = '', right = '', bottom = '', left = '' } = box;

	if ( ! top && ! right && ! bottom && ! left ) {
		return '';
	}

	return `${ top || '0' } ${ right || '0' } ${ bottom || '0' } ${ left || '0' }`;
}

/**
 * Ensures every side of a BoxControl-style object has a CSS unit before it
 * reaches `boxToCss()`. Some `__experimentalBoxControl` interactions (e.g.
 * typing a number in the single/"linked" input) can hand back a bare numeric
 * string like "16" instead of "16px" — a unitless non-zero length is invalid
 * CSS, so browsers silently drop that declaration entirely, which looked
 * like "padding/margin doesn't work" even though the value really was being
 * saved. Only touches values that are purely numeric; anything that already
 * has a unit ("16px", "2em", "10%") or is empty passes through unchanged —
 * so this is a no-op for already-well-formed data and self-heals any
 * already-published block whose stored value is missing its unit.
 */
export function normalizeBoxUnits( box ) {
	if ( ! box || typeof box !== 'object' ) {
		return box;
	}

	const withUnit = ( value ) => {
		if ( value === undefined || value === null || value === '' ) {
			return value;
		}
		const str = String( value ).trim();
		return /^-?\d+(\.\d+)?$/.test( str ) ? `${ str }px` : str;
	};

	return {
		top: withUnit( box.top ),
		right: withUnit( box.right ),
		bottom: withUnit( box.bottom ),
		left: withUnit( box.left ),
	};
}
