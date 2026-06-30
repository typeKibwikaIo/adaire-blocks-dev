import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getRowWidthClass } from './width-utils';

export default function save({ attributes }) {
  const { columnWidths = [], align } = attributes;
  const gridTemplateColumns = columnWidths.length
    ? columnWidths.map( ( w ) => `${ w }fr` ).join( ' ' )
    : '1fr';

  const blockProps = useBlockProps.save({
    className: `adaire-row adaire-row--cols-${ columnWidths.length } ${ getRowWidthClass( align ) }`,
    style: { gridTemplateColumns },
  });

  return (
    <div {...blockProps}>
      <InnerBlocks.Content />
    </div>
  );
}