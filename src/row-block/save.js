import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getRowWidthClass } from './width-utils';
import { boxToCss, normalizeBoxUnits } from '../components/spacing-utils';

export default function save( { attributes } ) {
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
    backgroundColor = '',
    backgroundImageUrl = '',
    backgroundImageAlt = '',
    backgroundImagePosition = 'center center',
    backgroundImageSize = 'cover',
    backgroundImageRepeat = 'no-repeat',
    shadowEnabled = false,
    shadowColor = 'rgba(0, 0, 0, 0.15)',
    shadowX = 0,
    shadowY = 4,
    shadowBlur = 12,
    shadowSpread = 0,
    animationEnabled = false,
    animationType = 'fade-in',
    animationDuration = 1000,
    animationDelay = 0,
    animationEasing = 'ease-out',
    animationDistance = 50,
    animationThreshold = 0.2,
    animationOnce = false,
    animationReverseOnScrollOut = false,
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

  // Only emit background-image styles when an image is actually set — same
  // backward-compatibility rule as border above (rows saved before this
  // feature existed have an empty backgroundImageUrl and render byte-for-
  // byte the same style object as before).
  const backgroundImageVars = backgroundImageUrl
    ? {
      backgroundImage: `url(${ backgroundImageUrl })`,
      backgroundPosition: backgroundImagePosition,
      backgroundSize: backgroundImageSize,
      backgroundRepeat: backgroundImageRepeat,
    }
    : {};

  // Only emit box-shadow when the user has actually turned it on.
  const shadowStyleVars = shadowEnabled
    ? { boxShadow: `${ shadowX }px ${ shadowY }px ${ shadowBlur }px ${ shadowSpread }px ${ shadowColor }` }
    : {};

  // Only emit data-animation-* attributes when animation is enabled — read
  // by view.js's shared scroll-animation runtime on the front end.
  const animationDataAttrs = animationEnabled
    ? {
      'data-animation-enabled': 'true',
      'data-animation-type': animationType,
      'data-animation-duration': animationDuration,
      'data-animation-delay': animationDelay,
      'data-animation-easing': animationEasing,
      'data-animation-distance': animationDistance,
      'data-animation-threshold': animationThreshold,
      'data-animation-once': animationOnce ? 'true' : 'false',
      'data-animation-reverse-scroll': animationReverseOnScrollOut ? 'true' : 'false',
    }
    : {};

  // A CSS background-image is decorative to assistive tech by default;
  // when the user has described it, expose that via role="img" +
  // aria-label on the row itself rather than silently dropping it.
  const backgroundA11yAttrs = backgroundImageUrl && backgroundImageAlt
    ? { role: 'img', 'aria-label': backgroundImageAlt }
    : {};

  const rowClassName = [
    'adaire-row',
    `adaire-row--cols-${ columnWidths.length }`,
    getRowWidthClass( align ),
    verticalAlign ? `adaire-row--valign-${ verticalAlign }` : '',
    mobileColumns ? `adaire-row--mobile-cols-${ mobileColumns }` : '',
    animationEnabled ? 'adaire-scroll-animate' : '',
  ].filter( Boolean ).join( ' ' );

  const blockProps = useBlockProps.save( {
    className: rowClassName,
    style: {
      gridTemplateColumns,
      gap: `${ gap }px`,
      ...borderStyleVars,
      backgroundColor: backgroundColor || undefined,
      ...backgroundImageVars,
      ...shadowStyleVars,
      padding: paddingCss || undefined,
      margin: marginCss || undefined,
    },
    ...animationDataAttrs,
    ...backgroundA11yAttrs,
  } );

  return (
    <div { ...blockProps }>
      <InnerBlocks.Content />
    </div>
  );
}
