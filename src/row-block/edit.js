import { useBlockProps, useInnerBlocksProps, ButtonBlockAppender } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import { useDispatch } from '@wordpress/data';
import PresetIcon from './PresetIcon';

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
  const { layout: layoutAttr } = attributes;

  const { columnWidths = [] } = attributes;
  const gridTemplateColumns = columnWidths.length
    ? columnWidths.map( ( w ) => `${ w }fr` ).join( ' ' )
    : '1fr';

  const blockProps = useBlockProps( {
    className: `adaire-row adaire-row--cols-${ columnWidths.length }`,
    style: { gridTemplateColumns },
  } );

  // Use the store name string — compatible with all Gutenberg versions.
  const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );

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
    );
  }

  return <div { ...innerBlocksProps } />;
}
