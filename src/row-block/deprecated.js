/**
 * Row block deprecations — most recent first.
 *
 * v2  Frozen copy of the save() from the very first pass of the Padding/
 *     Margin feature, before a follow-up fix normalized each side's CSS
 *     unit. That first pass read the BoxControl's `style.spacing.padding`/
 *     `.margin` values as-is — but BoxControl can hand back a bare number
 *     ("16") instead of "16px", and a unitless non-zero length is invalid
 *     CSS that browsers silently drop, which is why padding/margin appeared
 *     to have no effect even though the values really were being saved.
 *     The fix runs every side through `normalizeBoxUnits()` before building
 *     the CSS shorthand. Any row saved during that first pass has frozen
 *     markup with unitless `padding-top:204;...` etc. in its style
 *     attribute — re-running the *current* (unit-normalized) save() against
 *     that same stored data would no longer match and Gutenberg would flag
 *     it as invalid. This entry reproduces that exact unnormalized output so
 *     those rows keep validating; `migrate` is a no-op since no attribute
 *     shape changed, only how the style string is built from it.
 *
 * v1  Frozen copy of the save() that shipped before the row width fix added
 *     an explicit, theme-independent width control (Contained/Wide/Full).
 *     That fix appends an `adaire-row--width-(contained|wide|full)` modifier
 *     class to the saved markup's className. Rows saved before this change
 *     don't have that class, so re-running the *current* save() against them
 *     would no longer match the stored markup and Gutenberg would flag them
 *     as invalid ("This block contains unexpected or invalid content") —
 *     which locks the block and prevents editing anything nested inside the
 *     row until the user runs block recovery. This deprecated entry keeps
 *     those older posts validating correctly. No attribute schema changed,
 *     so `migrate` is a no-op identity function and this entry doesn't need
 *     its own `attributes` key (Gutenberg falls back to the current
 *     block.json attributes when parsing a deprecated entry that omits one).
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getRowWidthClass } from './width-utils';
import { boxToCss } from '../components/spacing-utils';

const deprecatedV2 = {
	migrate( attributes ) {
		return attributes;
	},

	save( { attributes } ) {
		const {
			columnWidths = [],
			align,
			gap = 16,
			verticalAlign = '',
			mobileColumns = '',
			borderEnabled = false,
			borderWidth = 1,
			borderStyle = 'solid',
			borderColor = '',
			borderRadius = 0,
			style: blockStyle,
		} = attributes;

		// Deliberately NOT run through normalizeBoxUnits() — this entry exists
		// specifically to reproduce the old unnormalized output byte-for-byte.
		const paddingCss = boxToCss( blockStyle?.spacing?.padding );
		const marginCss = boxToCss( blockStyle?.spacing?.margin );

		const gridTemplateColumns = columnWidths.length
			? columnWidths.map( ( w ) => `${ w }fr` ).join( ' ' )
			: '1fr';

		const borderStyleVars = borderEnabled
			? {
				borderWidth: `${ borderWidth }px`,
				borderStyle: borderStyle || 'solid',
				borderColor: borderColor || undefined,
				borderRadius: borderRadius ? `${ borderRadius }px` : undefined,
			}
			: {};

		const blockProps = useBlockProps.save( {
			className: `adaire-row adaire-row--cols-${ columnWidths.length } ${ getRowWidthClass( align ) } ${ verticalAlign ? `adaire-row--valign-${ verticalAlign }` : '' } ${ mobileColumns ? `adaire-row--mobile-cols-${ mobileColumns }` : '' }`,
			style: {
				gridTemplateColumns,
				gap: `${ gap }px`,
				...borderStyleVars,
				padding: paddingCss || undefined,
				margin: marginCss || undefined,
			},
		} );

		return (
			<div { ...blockProps }>
				<InnerBlocks.Content />
			</div>
		);
	},
};

const deprecatedV1 = {
	migrate( attributes ) {
		return attributes;
	},

	save( { attributes } ) {
		const { columnWidths = [] } = attributes;
		const gridTemplateColumns = columnWidths.length
			? columnWidths.map( ( w ) => `${ w }fr` ).join( ' ' )
			: '1fr';

		const blockProps = useBlockProps.save( {
			className: `adaire-row adaire-row--cols-${ columnWidths.length }`,
			style: { gridTemplateColumns },
		} );

		return (
			<div { ...blockProps }>
				<InnerBlocks.Content />
			</div>
		);
	},
};

export default [ deprecatedV2, deprecatedV1 ];
