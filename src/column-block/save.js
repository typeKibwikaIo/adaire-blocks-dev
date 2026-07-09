import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
  const { horizontalAlign = '', verticalAlign = '' } = attributes;

  const blockProps = useBlockProps.save({
    className: [
      'adaire-column',
      horizontalAlign && `adaire-column--halign-${ horizontalAlign }`,
      verticalAlign && `adaire-column--valign-${ verticalAlign }`,
    ].filter( Boolean ).join( ' ' ),
  });

  return (
    <div {...blockProps}>
      <InnerBlocks.Content />
    </div>
  );
}