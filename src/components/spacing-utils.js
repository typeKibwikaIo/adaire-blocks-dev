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
