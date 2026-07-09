/**
 * Shared helper for resolving the Row block's width modifier class.
 *
 * The block keeps using WordPress core's native `align` attribute/support
 * (so the standard alignwide/alignfull toolbar + className behaviour keeps
 * working), but visual width is driven by our own class + CSS variables so
 * the three width options render identically regardless of whether the
 * active theme declares `add_theme_support( 'align-wide' )` or ships its own
 * alignwide/alignfull CSS.
 *
 * @param {string} align Raw block `align` attribute value ('', 'wide', 'full').
 * @return {string} Modifier class: adaire-row--width-(contained|wide|full)
 */
export function getRowWidthClass( align ) {
	const type = align === 'wide' || align === 'full' ? align : 'contained';
	return `adaire-row--width-${ type }`;
}
