import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getRowWidthClass } from './width-utils';
import { boxToCss, normalizeBoxUnits } from '../components/spacing-utils';

export default function save({ attributes }) {
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

  // Mirrors edit.js: padding/margin are converted from the BoxControl-shaped
  // `style.spacing.padding`/`.margin` attribute into a CSS shorthand string
  // and merged into this block's own manually-built style object, since the
  // native WP spacing support does not reliably auto-apply here (see the
  // matching comment in edit.js).
  const paddingCss = boxToCss( normalizeBoxUnits( blockStyle?.spacing?.padding ) );
  const marginCss = boxToCss( normalizeBoxUnits( blockStyle?.spacing?.margin ) );

  const gridTemplateColumns = columnWidths.length
    ? columnWidths.map( ( w ) => `${ w }fr` ).join( ' ' )
    : '1fr';

  // Only emit border-related inline styles when the user has actually turned
  // the border on — keeps this attribute set 100% backward compatible with
  // rows saved before this feature existed (see matching comment in edit.js).
  const borderStyleVars = borderEnabled
    ? {
      borderWidth: `${ borderWidth }px`,
      borderStyle: borderStyle || 'solid',
      borderColor: borderColor || undefined,
      borderRadius: borderRadius ? `${ borderRadius }px` : undefined,
    }
    : {};

  const blockProps = useBlockProps.save({
    className: `adaire-row adaire-row--cols-${ columnWidths.length } ${ getRowWidthClass( align ) } ${ verticalAlign ? `adaire-row--valign-${ verticalAlign }` : '' } ${ mobileColumns ? `adaire-row--mobile-cols-${ mobileColumns }` : '' }`,
    style: {
      gridTemplateColumns,
      gap: `${ gap }px`,
      ...borderStyleVars,
      padding: paddingCss || undefined,
      margin: marginCss || undefined,
    },
  });

  return (
    <div {...blockProps}>
      <InnerBlocks.Content />
    </div>
  );
}
