import { useBlockProps, useInnerBlocksProps, ButtonBlockAppender, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, Button, RangeControl, __experimentalToggleGroupControl as ToggleGroupControl, __experimentalToggleGroupControlOption as ToggleGroupControlOption } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import { select, useDispatch, useSelect } from '@wordpress/data';
import PresetIcon from './PresetIcon';
import { getRowWidthClass } from './width-utils';

/**
 * Evenly distributes 100% across `count` columns as whole numbers, putting
 * any leftover percentage point(s) on the first column so widths always
 * sum to exactly 100.
 *
 * @param {number} count Number of columns to distribute width across.
 * @return {number[]} Width percentages, one per column.
 */
function distributeWidths( count ) {
	const even = Math.floor( 100 / count );
	const remainder = 100 - even * count;
	return Array.from( { length: count }, ( _, index ) =>
		index === 0 ? even + remainder : even
	);
}

const MIN_COLUMN_WIDTH = 5;

/**
 * Resizes one column to `newWidth` and proportionally redistributes the
 * remaining percentage across its siblings (keeping their relative ratios
 * to each other), so the row keeps summing to ~100% without the user having
 * to manually adjust every other column by hand.
 *
 * Intentionally duplicated (in near-identical form) in column-block/edit.js,
 * which needs the same math to drive its own per-column width control —
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

const WIDTH_OPTIONS = [
  { label: __( 'Contained', 'adaire-row' ), value: '' },
  { label: __( 'Wide', 'adaire-row' ),      value: 'wide' },
  { label: __( 'Full', 'adaire-row' ),      value: 'full' },
];

const PRESETS = [
  { id: '1-col',           label: __( '1 Column (100)',         'adaire-row' ), widths: [ 100 ] },
  { id: '2-col-50-50',     label: __( '2 Columns (50/50)',      'adaire-row' ), widths: [ 50, 50 ] },
  { id: '3-col-33-33-33',  label: __( '3 Columns (33/33/33)',   'adaire-row' ), widths: [ 33, 33, 34 ] },
  { id: '4-col-25-25-25-25', label: __( '4 Columns (25/25/25/25)', 'adaire-row' ), widths: [ 25, 25, 25, 25 ] },
  { id: '2-col-66-33',     label: __( '2 Columns (66/33)',      'adaire-row' ), widths: [ 66, 34 ] },
  { id: '2-col-33-66',     label: __( '2 Columns (33/66)',      'adaire-row' ), widths: [ 34, 66 ] },
  { id: '3-col-25-50-25',  label: __( '3 Columns (25/50/25)',   'adaire-row' ), widths: [ 25, 50, 25 ] },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
  const { layout: layoutAttr, align } = attributes;

  const { columnWidths = [] } = attributes;
  const gridTemplateColumns = columnWidths.length
    ? columnWidths.map( ( w ) => `${ w }fr` ).join( ' ' )
    : '1fr';

  const widthControls = (
    <InspectorControls>
      <PanelBody title={ __( 'Width', 'adaire-row' ) } initialOpen={ true }>
        <ToggleGroupControl
          label={ __( 'Row Width', 'adaire-row' ) }
          value={ align || '' }
          isBlock
          onChange={ ( value ) => setAttributes( { align: value || undefined } ) }
          help={ __( 'Contained keeps the row within the theme content width. Wide and Full expand it using the standard alignment classes.', 'adaire-row' ) }
        >
          { WIDTH_OPTIONS.map( ( option ) => (
            <ToggleGroupControlOption
              key={ option.value || 'contained' }
              value={ option.value }
              label={ option.label }
            />
          ) ) }
        </ToggleGroupControl>
      </PanelBody>
    </InspectorControls>
  );

  const blockProps = useBlockProps( {
    className: `adaire-row adaire-row--cols-${ columnWidths.length } ${ getRowWidthClass( align ) }`,
    style: { gridTemplateColumns },
  } );

  // Use the store name string — compatible with all Gutenberg versions.
  const { replaceInnerBlocks, insertBlock, removeBlock, updateBlockAttributes } =
    useDispatch( 'core/block-editor' );

  // Reactive list of this row's column blocks, used by the "Column widths"
  // quick-edit summary below — re-renders live as columns are added/removed
  // or resized (from here or from a column's own Inspector panel).
  const currentColumns = useSelect(
    ( selectFn ) => selectFn( 'core/block-editor' ).getBlocks( clientId ),
    [ clientId ]
  );

  const handleColumnWidthChange = ( targetClientId, newWidth ) => {
    const siblings = select( 'core/block-editor' ).getBlocks( clientId );
    if ( siblings.length <= 1 ) {
      return;
    }

    const newWidths = redistributeWidths( targetClientId, newWidth, siblings );

    siblings.forEach( ( block, index ) => {
      updateBlockAttributes( block.clientId, { width: newWidths[ index ] } );
    } );
    setAttributes( { columnWidths: newWidths } );
  };

  const applyPreset = ( preset ) => {
    setAttributes( { layout: preset.id, columnWidths: preset.widths } );
    const innerBlocks = preset.widths.map( ( width ) =>
      createBlock( 'adaire/column-block', { width } )
    );
    replaceInnerBlocks( clientId, innerBlocks, false );
  };

  const skipToManual = () => {
    setAttributes( { layout: 'manual', columnWidths: [ 100 ] } );
    replaceInnerBlocks( clientId, [ createBlock( 'adaire/column-block', { width: 100 } ) ], false );
  };

  // Switching layout (preset or column count) after the row already has
  // content keeps as many existing columns — and whatever's nested inside
  // them — as possible, instead of wiping everything via replaceInnerBlocks.
  const resizeColumnsTo = ( targetWidths, newLayout ) => {
    const currentColumns = select( 'core/block-editor' ).getBlocks( clientId );
    const currentCount = currentColumns.length;
    const targetCount = targetWidths.length;
    const keepCount = Math.min( currentCount, targetCount );

    currentColumns.slice( 0, keepCount ).forEach( ( block, index ) => {
      updateBlockAttributes( block.clientId, { width: targetWidths[ index ] } );
    } );

    if ( targetCount < currentCount ) {
      currentColumns.slice( targetCount ).forEach( ( block ) => {
        removeBlock( block.clientId, false );
      } );
    } else if ( targetCount > currentCount ) {
      for ( let index = currentCount; index < targetCount; index++ ) {
        insertBlock(
          createBlock( 'adaire/column-block', { width: targetWidths[ index ] } ),
          index,
          clientId,
          false
        );
      }
    }

    setAttributes( { layout: newLayout, columnWidths: targetWidths } );
  };

  const switchPreset = ( preset ) => resizeColumnsTo( preset.widths, preset.id );

  const addColumn = () => {
    const currentCount = select( 'core/block-editor' ).getBlocks( clientId ).length;
    resizeColumnsTo( distributeWidths( currentCount + 1 ), 'manual' );
  };

  const removeColumn = () => {
    const currentCount = select( 'core/block-editor' ).getBlocks( clientId ).length;
    if ( currentCount <= 1 ) {
      return;
    }
    resizeColumnsTo( distributeWidths( currentCount - 1 ), 'manual' );
  };

  const currentColumnCount = columnWidths.length || 1;

  const columnControls = (
    <InspectorControls>
      <PanelBody title={ __( 'Columns', 'adaire-row' ) } initialOpen={ true }>
        <p className="adaire-row-columns-count">
          { sprintf(
            /* translators: %d: number of columns */
            __( '%d column(s)', 'adaire-row' ),
            currentColumnCount
          ) }
        </p>
        <div className="adaire-row-columns-actions">
          <Button
            variant="secondary"
            onClick={ addColumn }
          >
            { __( '+ Add Column', 'adaire-row' ) }
          </Button>
          <Button
            variant="secondary"
            isDestructive
            disabled={ currentColumnCount <= 1 }
            onClick={ removeColumn }
          >
            { __( '− Remove Column', 'adaire-row' ) }
          </Button>
        </div>
        { currentColumns.length > 1 && (
          <>
            <p className="adaire-row-columns-label">
              { __( 'Column widths:', 'adaire-row' ) }
            </p>
            <div className="adaire-row-columns-widths">
              { currentColumns.map( ( block, index ) => (
                <RangeControl
                  key={ block.clientId }
                  label={ sprintf(
                    /* translators: %d: column number */
                    __( 'Column %d (%%)', 'adaire-row' ),
                    index + 1
                  ) }
                  value={ block.attributes.width ?? Math.round( 100 / currentColumns.length ) }
                  onChange={ ( newWidth ) => handleColumnWidthChange( block.clientId, newWidth ) }
                  min={ MIN_COLUMN_WIDTH }
                  max={ 100 }
                />
              ) ) }
            </div>
          </>
        ) }
        <p className="adaire-row-columns-label">
          { __( 'Or switch to a preset layout (existing content is kept where possible):', 'adaire-row' ) }
        </p>
        <div className="adaire-row-columns-presets">
          { PRESETS.map( ( preset ) => (
            <button
              key={ preset.id }
              className={
                'adaire-row-preset-btn' +
                ( layoutAttr === preset.id ? ' is-active' : '' )
              }
              onClick={ () => switchPreset( preset ) }
            >
              <PresetIcon widths={ preset.widths } />
              <span>{ preset.label }</span>
            </button>
          ) ) }
        </div>
      </PanelBody>
    </InspectorControls>
  );

  // Hooks must be called unconditionally — before any early return.
  const innerBlocksProps = useInnerBlocksProps( blockProps, {
    allowedBlocks: [ 'adaire/column-block' ],
    templateLock: false,
    renderAppender: ( rootClientId ) => (
      <ButtonBlockAppender rootClientId={ rootClientId } />
    ),
  } );

  // Show layout picker when no layout is chosen yet.
  if ( ! layoutAttr ) {
    return (
      <>
        { widthControls }
        <div { ...blockProps }>
          <div className="adaire-row-placeholder">
            <div className="adaire-row-placeholder__header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3"  y="3" width="7" height="18" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="14" y="3" width="7" height="18" rx="1" fill="currentColor" opacity="0.5" />
              </svg>
              <span>{ __( 'Row', 'adaire-row' ) }</span>
            </div>
            <p className="adaire-row-placeholder__label">
              { __( 'Select a column layout to start.', 'adaire-row' ) }
            </p>
            <div className="adaire-row-placeholder__grid">
              { PRESETS.map( ( preset ) => (
                <button
                  key={ preset.id }
                  className="adaire-row-preset-btn"
                  onClick={ () => applyPreset( preset ) }
                >
                  <PresetIcon widths={ preset.widths } />
                  <span>{ preset.label }</span>
                </button>
              ) ) }
            </div>
            <button className="adaire-row-placeholder__skip" onClick={ skipToManual }>
              { __( 'Skip and add columns manually', 'adaire-row' ) }
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      { widthControls }
      { columnControls }
      <div { ...innerBlocksProps } />
    </>
  );
}
