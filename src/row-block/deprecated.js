/**
 * Row block deprecations — most recent first.
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

export default [ deprecatedV1 ];
