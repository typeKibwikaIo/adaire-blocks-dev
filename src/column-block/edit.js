import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl, __experimentalToggleGroupControl as ToggleGroupControl, __experimentalToggleGroupControlOption as ToggleGroupControlOption } from '@wordpress/components';
import { select, useDispatch } from '@wordpress/data';

const MIN_COLUMN_WIDTH = 5;

/**
 * Resizes one column to `newWidth` and proportionally redistributes the
 * remaining percentage across its siblings (keeping their relative ratios
 * to each other), so the row keeps summing to ~100% without the user having
 * to manually adjust every other column by hand.
 *
 * Intentionally duplicated (in near-identical form) in row-block/edit.js,
 * which needs the same math to drive its own per-column width summary —
 * kept as a small local pure function in each block folder rather than a
 * shared cross-folder import, since each block here is otherwise self-contained.
 *
 * @param {string} targetClientId clientId of the column being resized.
 * @param {number} newWidth       Requested width (%) for that column.
 * @param {Array}  siblings       All column blocks in the row, in order.
 * @return {number[]} New width values, in the same order as `siblings`.
 */
function redistributeWidths( targetClientId, newWidth, siblings ) {
	const others = siblings.filter( ( block ) => block.clientId !== targetClientId );

	if ( others.length === 0 ) {
		return [ 100 ];
	}

	const maxWidth = 100 - others.length * MIN_COLUMN_WIDTH;
	const clamped = Math.round( Math.min( Math.max( newWidth, MIN_COLUMN_WIDTH ), maxWidth ) );
	const remaining = 100 - clamped;

	const othersCurrentTotal =
		others.reduce( ( sum, block ) => sum + ( block.attributes.width || 0 ), 0 ) ||
		others.length;

	const shares = others.map( ( block ) => {
		const current = block.attributes.width || othersCurrentTotal / others.length;
		return Math.round( Math.max( MIN_COLUMN_WIDTH, ( current / othersCurrentTotal ) * remaining ) );
	} );

	// Rounding correction so widths sum to exactly 100.
	const total = clamped + shares.reduce( ( a, b ) => a + b, 0 );
	shares[ shares.length - 1 ] += 100 - total;

	return siblings.map( ( block ) =>
		block.clientId === targetClientId
			? clamped
			: shares[ others.findIndex( ( o ) => o.clientId === block.clientId ) ]
	);
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { width, horizontalAlign = '', verticalAlign = '' } = attributes;

	const blockProps = useBlockProps( {
		className: [
			'adaire-column',
			horizontalAlign && `adaire-column--halign-${ horizontalAlign }`,
			verticalAlign && `adaire-column--valign-${ verticalAlign }`,
		].filter( Boolean ).join( ' ' ),
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		templateLock: false,
	} );

	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	const handleWidthChange = ( newWidth ) => {
		const rootClientId = select( 'core/block-editor' ).getBlockRootClientId( clientId );
		const siblings = rootClientId
			? select( 'core/block-editor' ).getBlocks( rootClientId )
			: [];

		if ( ! rootClientId || siblings.length <= 1 ) {
			setAttributes( { width: 100 } );
			if ( rootClientId ) {
				updateBlockAttributes( rootClientId, { columnWidths: [ 100 ] } );
			}
			return;
		}

		const newWidths = redistributeWidths( clientId, newWidth, siblings );

		siblings.forEach( ( block, index ) => {
			updateBlockAttributes( block.clientId, { width: newWidths[ index ] } );
		} );
		updateBlockAttributes( rootClientId, { columnWidths: newWidths } );
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Width', 'adaire-column' ) } initialOpen={ true }>
					<RangeControl
						label={ __( 'Column Width (%)', 'adaire-column' ) }
						value={ width }
						onChange={ handleWidthChange }
						min={ MIN_COLUMN_WIDTH }
						max={ 100 }
						help={ __( 'Other columns in this row adjust automatically to fill the remaining space.', 'adaire-column' ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Alignment', 'adaire-column' ) } initialOpen={ false }>
					<ToggleGroupControl
						label={ __( 'Horizontal Alignment', 'adaire-column' ) }
						value={ horizontalAlign || 'stretch' }
						isBlock
						onChange={ ( value ) => setAttributes( { horizontalAlign: value === 'stretch' ? '' : value } ) }
						help={ __( 'Aligns this column\'s content. Updates instantly.', 'adaire-column' ) }
					>
						<ToggleGroupControlOption value="stretch" label={ __( 'Stretch', 'adaire-column' ) } />
						<ToggleGroupControlOption value="left" label={ __( 'Left', 'adaire-column' ) } />
						<ToggleGroupControlOption value="center" label={ __( 'Center', 'adaire-column' ) } />
						<ToggleGroupControlOption value="right" label={ __( 'Right', 'adaire-column' ) } />
					</ToggleGroupControl>
					<ToggleGroupControl
						label={ __( 'Vertical Alignment', 'adaire-column' ) }
						value={ verticalAlign || 'top' }
						isBlock
						onChange={ ( value ) => setAttributes( { verticalAlign: value === 'top' ? '' : value } ) }
					>
						<ToggleGroupControlOption value="top" label={ __( 'Top', 'adaire-column' ) } />
						<ToggleGroupControlOption value="center" label={ __( 'Center', 'adaire-column' ) } />
						<ToggleGroupControlOption value="bottom" label={ __( 'Bottom', 'adaire-column' ) } />
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}