import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
  const {
    horizontalAlign = '',
    verticalAlign = '',
    borderEnabled = false,
    borderWidth = 1,
    borderStyle = 'solid',
    borderColor = '',
    borderRadius = 0,
  } = attributes;

  // Only emit border-related inline styles when the user has actually
  // turned the border on — see matching comment in edit.js for why this
  // keeps pre-existing published columns byte-for-byte identical.
  const borderStyleVars = borderEnabled
    ? {
      borderWidth: `${ borderWidth }px`,
      borderStyle: borderStyle || 'solid',
      borderColor: borderColor || undefined,
      borderRadius: borderRadius ? `${ borderRadius }px` : undefined,
    }
    : {};

  const blockProps = useBlockProps.save({
    className: [
      'adaire-column',
      horizontalAlign && `adaire-column--halign-${ horizontalAlign }`,
      verticalAlign && `adaire-column--valign-${ verticalAlign }`,
    ].filter( Boolean ).join( ' ' ),
    style: borderStyleVars,
  });

  return (
    <div {...blockProps}>
      <InnerBlocks.Content />
    </div>
  );
}
