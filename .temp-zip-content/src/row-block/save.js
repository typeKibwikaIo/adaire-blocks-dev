import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
  const { columnWidths = [] } = attributes;
  const gridTemplateColumns = columnWidths.length
    ? columnWidths.map( ( w ) => `${ w }fr` ).join( ' ' )
    : '1fr';

  const blockProps = useBlockProps.save({
    className: `adaire-row adaire-row--cols-${ columnWidths.length }`,
    style: { gridTemplateColumns },
  });

  return (
    <div {...blockProps}>
      <InnerBlocks.Content />
    </div>
  );
}