import { useBlockProps, useInnerBlocksProps, ButtonBlockAppender, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import {
  PanelBody,
  Button,
  RangeControl,
  SelectControl,
  ToggleControl,
  BaseControl,
  TextControl,
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import InspectorTabs from '../components/InspectorTabs';
import PresetIcon from './PresetIcon';
import { getRowWidthClass } from './width-utils';
import BoundColorPalette from '../components/BoundColorPalette';
import { boxToCss, normalizeBoxUnits } from '../components/spacing-utils';
import AnimationSettings from '../components/AnimationSettings';
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute, THREE_TIERS, BreakpointNote } from '../components/DeviceSwitcher';
import useEditorDevice from '../components/useEditorDevice';

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
  { label: __( 'Contained', 'adaire-blocks' ), value: '' },
  { label: __( 'Wide', 'adaire-blocks' ),      value: 'wide' },
  { label: __( 'Full', 'adaire-blocks' ),      value: 'full' },
];

const BORDER_STYLE_OPTIONS = [
  { label: __( 'Solid', 'adaire-blocks' ),  value: 'solid' },
  { label: __( 'Dashed', 'adaire-blocks' ), value: 'dashed' },
  { label: __( 'Dotted', 'adaire-blocks' ), value: 'dotted' },
  { label: __( 'Double', 'adaire-blocks' ), value: 'double' },
  { label: __( 'Groove', 'adaire-blocks' ), value: 'groove' },
];

const PRESETS = [
  { id: '1-col',           label: __( '1 Column (100)',         'adaire-blocks' ), widths: [ 100 ] },
  { id: '2-col-50-50',     label: __( '2 Columns (50/50)',      'adaire-blocks' ), widths: [ 50, 50 ] },
  { id: '3-col-33-33-33',  label: __( '3 Columns (33/33/33)',   'adaire-blocks' ), widths: [ 33, 33, 34 ] },
  { id: '4-col-25-25-25-25', label: __( '4 Columns (25/25/25/25)', 'adaire-blocks' ), widths: [ 25, 25, 25, 25 ] },
  { id: '2-col-66-33',     label: __( '2 Columns (66/33)',      'adaire-blocks' ), widths: [ 66, 34 ] },
  { id: '2-col-33-66',     label: __( '2 Columns (33/66)',      'adaire-blocks' ), widths: [ 34, 66 ] },
  { id: '3-col-25-50-25',  label: __( '3 Columns (25/50/25)',   'adaire-blocks' ), widths: [ 25, 50, 25 ] },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
  const [deviceType, setDeviceType] = useState('desktop');
  useEditorDevice(deviceType, setDeviceType);
  const { layout: layoutAttr, align } = attributes;

  const {
    columnWidths = [],
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
    backgroundImageId = 0,
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
    responsiveGap,
    responsivePadding,
    responsiveMargin,
  } = attributes;

  const selectedLayout = getDeviceValue(attributes.responsiveLayout, deviceType, layoutAttr || 'manual');
  const selectedWidths = attributes.responsiveColumnWidths?.[deviceType] || columnWidths;
  const selectedDirection = getDeviceValue(attributes.responsiveDirection, deviceType, 'horizontal');

  // Padding/Margin are still stored at the same `style.spacing` attribute
  // path WordPress core's native "spacing" block support (declared in
  // block.json) uses — a { top, right, bottom, left } object, each side its
  // own CSS length string like "16px" — but the Inspector UI only exposes
  // two sliders per Padding/Margin (Vertical and Horizontal) instead of
  // separate controls for all four sides, per user request. Vertical writes
  // the same value to both top & bottom; Horizontal writes the same value to
  // both left & right — so a row's padding/margin is always symmetric
  // top/bottom and symmetric left/right, never four independent values.
  // (A row saved by an older version of this block, back when all four sides
  // really could differ independently, still renders correctly here — the
  // Vertical/Horizontal fields just show that row's `top`/`left` values as
  // their starting point, same as always happens the first time any control
  // reads existing data.)
  //
  // The native support does NOT reliably auto-apply these to a block whose
  // edit.js/save.js build their own explicit `style` object for useBlockProps
  // (confirmed by hands-on testing: Row Width worked but Padding/Margin did
  // not take effect at all) — so, exactly like the Border panel above,
  // padding/margin are converted to a CSS shorthand string here and merged
  // into the same manually-built style object, and save.js does the same.
  //
  // normalizeBoxUnits() guards against a second, separate bug: a unitless
  // non-zero length ("16" instead of "16px") is invalid CSS and gets
  // silently dropped by the browser, which is why padding/margin looked like
  // they "didn't work" even once they were wired into the style object
  // above. Reading it here means any already-published row whose stored
  // value is missing its unit self-heals automatically.
  const rowPadding = blockStyle?.spacing?.padding || {};
  const rowMargin = blockStyle?.spacing?.margin || {};
  const paddingCss = boxToCss( normalizeBoxUnits( rowPadding ) );
  const marginCss = boxToCss( normalizeBoxUnits( rowMargin ) );

  // Reads a stored side value ("16px", "16", or undefined) back out as a
  // plain number for the RangeControl sliders below.
  const parsePx = ( value ) => {
    const num = parseInt( value, 10 );
    return Number.isNaN( num ) ? 0 : num;
  };

  // Helper functions for responsive values
  const getResponsiveGap = () => getDeviceValue(responsiveGap, deviceType, 16);
  const getResponsivePadding = () => responsivePadding?.[deviceType] || responsivePadding?.desktop || { top: '0px', right: '0px', bottom: '0px', left: '0px' };
  const getResponsiveMargin = () => responsiveMargin?.[deviceType] || responsiveMargin?.desktop || { top: '0px', right: '0px', bottom: '0px', left: '0px' };

  const paddingVertical = parsePx( getResponsivePadding().top ?? getResponsivePadding().bottom );
  const paddingHorizontal = parsePx( getResponsivePadding().left ?? getResponsivePadding().right );
  const marginVertical = parsePx( getResponsiveMargin().top ?? getResponsiveMargin().bottom );
  const marginHorizontal = parsePx( getResponsiveMargin().left ?? getResponsiveMargin().right );

  // key: 'padding' | 'margin'. axis: 'vertical' (writes top+bottom) or
  // 'horizontal' (writes left+right) — always keeping the pair in sync so
  // there are never four independently-set sides going forward.
  const updateSpacingAxis = ( key, axis, value ) => {
    const px = `${ value ?? 0 }px`;
    const sides = axis === 'vertical' ? { top: px, bottom: px } : { left: px, right: px };
    setAttributes( {
      style: {
        ...blockStyle,
        spacing: {
          ...blockStyle?.spacing,
          [ key ]: { ...blockStyle?.spacing?.[ key ], ...sides },
        },
      },
    } );
  };

  const gridTemplateColumns = selectedWidths.length
    ? selectedWidths.map( ( w ) => `${ w }fr` ).join( ' ' )
    : '1fr';

  // Only emit border-related inline styles when the user has actually turned
  // the border on — keeps this attribute set 100% backward compatible with
  // rows saved before this feature existed (their borderEnabled default is
  // false, so save() renders byte-for-byte the same style attribute as
  // before and Gutenberg's block validation never flags them as invalid).
  const borderStyleVars = borderEnabled
    ? {
      borderWidth: `${ borderWidth }px`,
      borderStyle: borderStyle || 'solid',
      borderColor: borderColor || undefined,
      borderRadius: borderRadius ? `${ borderRadius }px` : undefined,
    }
    : {};

  // ─── Row Layout (functional / positional — tagged "layout" per the
  // AdaireBlocks free-tier InspectorTabs reorg) ──
  const responsivePanel = (
    <PanelBody section="layout" title={ __( 'Responsive', 'adaire-blocks' ) } initialOpen={ true }>
      <DeviceSwitcher
        deviceType={ deviceType }
        setDeviceType={ setDeviceType }
        label={ __( 'Breakpoint', 'adaire-blocks' ) }
        tiers={ THREE_TIERS }
      />
      <BreakpointNote deviceType={ deviceType } tiers={ THREE_TIERS } />
    </PanelBody>
  );

  const rowLayoutPanel = (
    <PanelBody section="layout" title={ __( 'Row Layout', 'adaire-blocks' ) } initialOpen={ true }>
      <SelectControl
        label={ __( 'Columns at this breakpoint', 'adaire-blocks' ) }
        value={ selectedLayout }
        options={ PRESETS.map( ( preset ) => ( { label: preset.label, value: preset.id } ) ) }
        onChange={ ( value ) => {
          const preset = PRESETS.find( ( item ) => item.id === value );
          setAttributes( {
            responsiveLayout: { ...( attributes.responsiveLayout || {} ), [ deviceType ]: value },
            responsiveColumnWidths: { ...( attributes.responsiveColumnWidths || {} ), [ deviceType ]: preset?.widths || selectedWidths },
          } );
        } }
      />
      <ToggleGroupControl
        label={ __( 'Column Direction', 'adaire-blocks' ) }
        value={ selectedDirection }
        isBlock
        onChange={ ( value ) => setAttributes( { responsiveDirection: { ...( attributes.responsiveDirection || {} ), [ deviceType ]: value } } ) }
      >
        <ToggleGroupControlOption value="horizontal" label={ __( 'Horizontal', 'adaire-blocks' ) } />
        <ToggleGroupControlOption value="vertical" label={ __( 'Vertical', 'adaire-blocks' ) } />
      </ToggleGroupControl>
      <ToggleGroupControl
        label={ __( 'Row Width', 'adaire-blocks' ) }
        value={ align || '' }
        isBlock
        onChange={ ( value ) => setAttributes( { align: value || undefined } ) }
        help={ __( 'Contained keeps the row within the theme content width. Wide and Full expand it using the standard alignment classes.', 'adaire-blocks' ) }
      >
        { WIDTH_OPTIONS.map( ( option ) => (
          <ToggleGroupControlOption
            key={ option.value || 'contained' }
            value={ option.value }
            label={ option.label }
          />
        ) ) }
      </ToggleGroupControl>
      <ToggleGroupControl
        label={ __( 'Vertical Alignment', 'adaire-blocks' ) }
        value={ verticalAlign || 'stretch' }
        isBlock
        onChange={ ( value ) => setAttributes( { verticalAlign: value === 'stretch' ? '' : value } ) }
        help={ __( 'Controls how columns line up when they have different heights. Updates instantly.', 'adaire-blocks' ) }
      >
        <ToggleGroupControlOption value="stretch" label={ __( 'Stretch', 'adaire-blocks' ) } />
        <ToggleGroupControlOption value="top" label={ __( 'Top', 'adaire-blocks' ) } />
        <ToggleGroupControlOption value="center" label={ __( 'Center', 'adaire-blocks' ) } />
        <ToggleGroupControlOption value="bottom" label={ __( 'Bottom', 'adaire-blocks' ) } />
      </ToggleGroupControl>
      { columnWidths.length > 1 && (
        <ToggleGroupControl
          label={ __( 'Mobile Columns', 'adaire-blocks' ) }
          value={ mobileColumns || 'auto' }
          isBlock
          onChange={ ( value ) => setAttributes( { mobileColumns: value === 'auto' ? '' : value } ) }
          help={ __( 'Auto wraps as many columns as fit. 1 stacks columns into a single column on phones. 2 keeps exactly two per row.', 'adaire-blocks' ) }
        >
          <ToggleGroupControlOption value="auto" label={ __( 'Auto', 'adaire-blocks' ) } />
          <ToggleGroupControlOption value="1" label={ __( '1 per row', 'adaire-blocks' ) } />
          <ToggleGroupControlOption value="2" label={ __( '2 per row', 'adaire-blocks' ) } />
        </ToggleGroupControl>
      ) }
    </PanelBody>
  );

  // ─── Spacing (visual — tagged "style"/medium per the AdaireBlocks
  // free-tier InspectorTabs reorg) ──
  const spacingPanel = (
    <PanelBody section="layout" title={ __( 'Spacing', 'adaire-blocks' ) } initialOpen={ false }>
      <BreakpointNote deviceType={deviceType} tiers={THREE_TIERS} />
      <RangeControl
        label={ __( 'Gap Between Columns (px)', 'adaire-blocks' ) }
        value={ getResponsiveGap() }
        onChange={ ( val ) => setAttributes( { responsiveGap: updateDeviceAttribute(responsiveGap, deviceType, val) } ) }
        min={ 0 }
        max={ 80 }
        help={ __( 'Set to 0 to remove the space columns leave on the sides.', 'adaire-blocks' ) }
      />
      <RangeControl
        label={ __( 'Padding — Top & Bottom (px)', 'adaire-blocks' ) }
        value={ paddingVertical }
        onChange={ ( value ) => {
          const currentPadding = getResponsivePadding();
          setAttributes({
            responsivePadding: {
              ...(responsivePadding || {}),
              [deviceType]: {
                ...currentPadding,
                top: `${ value }px`,
                bottom: `${ value }px`
              }
            }
          });
        }}
        min={ 0 }
        max={ 200 }
      />
      <RangeControl
        label={ __( 'Padding — Left & Right (px)', 'adaire-blocks' ) }
        value={ paddingHorizontal }
        onChange={ ( value ) => {
          const currentPadding = getResponsivePadding();
          setAttributes({
            responsivePadding: {
              ...(responsivePadding || {}),
              [deviceType]: {
                ...currentPadding,
                left: `${ value }px`,
                right: `${ value }px`
              }
            }
          });
        }}
        min={ 0 }
        max={ 200 }
      />
      <RangeControl
        label={ __( 'Margin — Top & Bottom (px)', 'adaire-blocks' ) }
        value={ marginVertical }
        onChange={ ( value ) => {
          const currentMargin = getResponsiveMargin();
          setAttributes({
            responsiveMargin: {
              ...(responsiveMargin || {}),
              [deviceType]: {
                ...currentMargin,
                top: `${ value }px`,
                bottom: `${ value }px`
              }
            }
          });
        }}
        min={ 0 }
        max={ 200 }
      />
      <RangeControl
        label={ __( 'Margin — Left & Right (px)', 'adaire-blocks' ) }
        value={ marginHorizontal }
        onChange={ ( value ) => {
          const currentMargin = getResponsiveMargin();
          setAttributes({
            responsiveMargin: {
              ...(responsiveMargin || {}),
              [deviceType]: {
                ...currentMargin,
                left: `${ value }px`,
                right: `${ value }px`
              }
            }
          });
        }}
        min={ 0 }
        max={ 200 }
      />
    </PanelBody>
  );

  // ─── Border (visual — tagged "style"/medium per the AdaireBlocks free-tier
  // InspectorTabs reorg) ──
  // Applies to the row container itself (the whole grid, not individual
  // columns — see column-block/edit.js for the equivalent per-column control).
  const borderPanel = (
    <PanelBody section="style" priority="medium" title={ __( 'Border', 'adaire-blocks' ) } initialOpen={ false }>
      <ToggleControl
        label={ __( 'Enable Border', 'adaire-blocks' ) }
        checked={ borderEnabled }
        onChange={ ( val ) => setAttributes( { borderEnabled: val } ) }
        help={ __( 'Adds a border around the entire row (outside all columns).', 'adaire-blocks' ) }
      />
      { borderEnabled && (
        <>
          <RangeControl
            label={ __( 'Border Width (px)', 'adaire-blocks' ) }
            value={ borderWidth }
            onChange={ ( val ) => setAttributes( { borderWidth: val } ) }
            min={ 1 }
            max={ 20 }
          />
          <SelectControl
            label={ __( 'Border Type', 'adaire-blocks' ) }
            value={ borderStyle }
            options={ BORDER_STYLE_OPTIONS }
            onChange={ ( val ) => setAttributes( { borderStyle: val } ) }
          />
          <BaseControl label={ __( 'Border Color', 'adaire-blocks' ) }>
            <BoundColorPalette
              value={ borderColor }
              onChange={ ( v ) => setAttributes( { borderColor: v || '' } ) }
            />
          </BaseControl>
          <RangeControl
            label={ __( 'Border Radius (px)', 'adaire-blocks' ) }
            value={ borderRadius }
            onChange={ ( val ) => setAttributes( { borderRadius: val } ) }
            min={ 0 }
            max={ 60 }
          />
        </>
      ) }
      { shadowEnabled && (
        <BaseControl label={ __( 'Shadow Color', 'adaire-blocks' ) }>
          <BoundColorPalette
            value={ shadowColor }
            onChange={ ( v ) => setAttributes( { shadowColor: v || 'rgba(0, 0, 0, 0.15)' } ) }
          />
        </BaseControl>
      ) }
    </PanelBody>
  );

  // ─── Background Color (tagged "style"/high — a pure color/CSS concern) ──
  const backgroundColorPanel = (
    <PanelBody section="style" priority="high" title={ __( 'Background Color', 'adaire-blocks' ) } initialOpen={ false }>
      <BaseControl label={ __( 'Background Color', 'adaire-blocks' ) }>
        <BoundColorPalette
          value={ backgroundColor }
          onChange={ ( v ) => setAttributes( { backgroundColor: v || '' } ) }
        />
      </BaseControl>
      <p style={ { marginTop: '8px', color: '#757575', fontSize: '12px' } }>
        { __( 'Sits behind the background image (if one is set) in the Content tab.', 'adaire-blocks' ) }
      </p>
    </PanelBody>
  );

  // ─── Background Media (tagged "content" — the block's own media) ──
  const backgroundMediaPanel = (
    <PanelBody section="content" title={ __( 'Background Media', 'adaire-blocks' ) } initialOpen={ false }>
      <MediaUploadCheck>
        <MediaUpload
          onSelect={ ( media ) => setAttributes( {
            backgroundImageUrl: media.url,
            backgroundImageId: media.id,
            backgroundImageAlt: media.alt || '',
          } ) }
          allowedTypes={ [ 'image' ] }
          value={ backgroundImageId }
          render={ ( { open } ) => (
            <div className="adaire-row-bg-media">
              { backgroundImageUrl && (
                <img
                  src={ backgroundImageUrl }
                  alt=""
                  style={ { width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, marginBottom: 8 } }
                />
              ) }
              <Button variant="secondary" onClick={ open }>
                { backgroundImageUrl ? __( 'Replace image', 'adaire-blocks' ) : __( 'Upload background image', 'adaire-blocks' ) }
              </Button>
              { backgroundImageUrl && (
                <Button
                  variant="link"
                  isDestructive
                  onClick={ () => setAttributes( { backgroundImageUrl: '', backgroundImageId: 0, backgroundImageAlt: '' } ) }
                >
                  { __( 'Remove image', 'adaire-blocks' ) }
                </Button>
              ) }
            </div>
          ) }
        />
      </MediaUploadCheck>
      { backgroundImageUrl && (
        <>
          <TextControl
            label={ __( 'Alt Text (for screen readers)', 'adaire-blocks' ) }
            value={ backgroundImageAlt }
            onChange={ ( value ) => setAttributes( { backgroundImageAlt: value } ) }
            help={ __( 'Leave blank if this image is purely decorative.', 'adaire-blocks' ) }
          />
          <SelectControl
            label={ __( 'Position', 'adaire-blocks' ) }
            value={ backgroundImagePosition }
            options={ [
              { label: __( 'Center', 'adaire-blocks' ), value: 'center center' },
              { label: __( 'Top', 'adaire-blocks' ), value: 'center top' },
              { label: __( 'Bottom', 'adaire-blocks' ), value: 'center bottom' },
              { label: __( 'Left', 'adaire-blocks' ), value: 'left center' },
              { label: __( 'Right', 'adaire-blocks' ), value: 'right center' },
            ] }
            onChange={ ( value ) => setAttributes( { backgroundImagePosition: value } ) }
          />
          <SelectControl
            label={ __( 'Size', 'adaire-blocks' ) }
            value={ backgroundImageSize }
            options={ [
              { label: __( 'Cover (fill)', 'adaire-blocks' ), value: 'cover' },
              { label: __( 'Contain (fit inside)', 'adaire-blocks' ), value: 'contain' },
              { label: __( 'Auto', 'adaire-blocks' ), value: 'auto' },
            ] }
            onChange={ ( value ) => setAttributes( { backgroundImageSize: value } ) }
          />
          <SelectControl
            label={ __( 'Repeat', 'adaire-blocks' ) }
            value={ backgroundImageRepeat }
            options={ [
              { label: __( 'No repeat', 'adaire-blocks' ), value: 'no-repeat' },
              { label: __( 'Repeat', 'adaire-blocks' ), value: 'repeat' },
              { label: __( 'Repeat X', 'adaire-blocks' ), value: 'repeat-x' },
              { label: __( 'Repeat Y', 'adaire-blocks' ), value: 'repeat-y' },
            ] }
            onChange={ ( value ) => setAttributes( { backgroundImageRepeat: value } ) }
          />
        </>
      ) }
    </PanelBody>
  );

  // ─── Effects (tagged "layout" — a structural/depth effect, not a
  // color/typography concern, per this block's Content/Layout/Style split) ──
  const effectsPanel = (
    <PanelBody section="layout" title={ __( 'Effects', 'adaire-blocks' ) } initialOpen={ false }>
      <ToggleControl
        label={ __( 'Enable Shadow', 'adaire-blocks' ) }
        checked={ shadowEnabled }
        onChange={ ( val ) => setAttributes( { shadowEnabled: val } ) }
      />
      { shadowEnabled && (
        <>
          <RangeControl
            label={ __( 'Horizontal Offset (px)', 'adaire-blocks' ) }
            value={ shadowX }
            onChange={ ( val ) => setAttributes( { shadowX: val } ) }
            min={ -60 }
            max={ 60 }
          />
          <RangeControl
            label={ __( 'Vertical Offset (px)', 'adaire-blocks' ) }
            value={ shadowY }
            onChange={ ( val ) => setAttributes( { shadowY: val } ) }
            min={ -60 }
            max={ 60 }
          />
          <RangeControl
            label={ __( 'Blur (px)', 'adaire-blocks' ) }
            value={ shadowBlur }
            onChange={ ( val ) => setAttributes( { shadowBlur: val } ) }
            min={ 0 }
            max={ 100 }
          />
          <RangeControl
            label={ __( 'Spread (px)', 'adaire-blocks' ) }
            value={ shadowSpread }
            onChange={ ( val ) => setAttributes( { shadowSpread: val } ) }
            min={ -40 }
            max={ 40 }
          />
        </>
      ) }
    </PanelBody>
  );

  const backgroundImageVars = backgroundImageUrl
    ? {
      backgroundImage: `url(${ backgroundImageUrl })`,
      backgroundPosition: backgroundImagePosition,
      backgroundSize: backgroundImageSize,
      backgroundRepeat: backgroundImageRepeat,
    }
    : {};

  const shadowStyleVars = shadowEnabled
    ? { boxShadow: `${ shadowX }px ${ shadowY }px ${ shadowBlur }px ${ shadowSpread }px ${ shadowColor }` }
    : {};

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

  const rowClassName = [
    'adaire-row',
    `adaire-row--cols-${ selectedWidths.length }`,
    selectedDirection === 'vertical' ? `adaire-row--direction-${ deviceType }-vertical` : '',
    getRowWidthClass( align ),
    verticalAlign ? `adaire-row--valign-${ verticalAlign }` : '',
    mobileColumns ? `adaire-row--mobile-cols-${ mobileColumns }` : '',
    animationEnabled ? 'adaire-scroll-animate' : '',
  ].filter( Boolean ).join( ' ' );

  const blockProps = useBlockProps( {
    className: rowClassName,
    style: {
      gridTemplateColumns,
      display: selectedDirection === 'vertical' ? 'flex' : undefined,
      flexDirection: selectedDirection === 'vertical' ? 'column' : undefined,
      gap: `${ getResponsiveGap() }px`,
      ...borderStyleVars,
      backgroundColor: backgroundColor || undefined,
      ...backgroundImageVars,
      ...shadowStyleVars,
      padding: boxToCss(normalizeBoxUnits(getResponsivePadding())) || undefined,
      margin: boxToCss(normalizeBoxUnits(getResponsiveMargin())) || undefined,
    },
    ...animationDataAttrs,
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

  // ─── Columns (functional — tagged "content" per the AdaireBlocks free-tier
  // InspectorTabs reorg) ──────────────────
  const columnsPanel = (
    <PanelBody section="content" title={ __( 'Columns', 'adaire-blocks' ) } initialOpen={ true }>
      <p className="adaire-row-columns-count">
        { sprintf(
          /* translators: %d: number of columns */
          __( '%d column(s)', 'adaire-blocks' ),
          currentColumnCount
        ) }
      </p>
      <div className="adaire-row-columns-actions">
        <Button
          variant="secondary"
          onClick={ addColumn }
        >
          { __( '+ Add Column', 'adaire-blocks' ) }
        </Button>
        <Button
          variant="secondary"
          isDestructive
          disabled={ currentColumnCount <= 1 }
          onClick={ removeColumn }
        >
          { __( '− Remove Column', 'adaire-blocks' ) }
        </Button>
      </div>
      { currentColumns.length > 1 && (
        <>
          <p className="adaire-row-columns-label">
            { __( 'Column widths:', 'adaire-blocks' ) }
          </p>
          <div className="adaire-row-columns-widths">
            { currentColumns.map( ( block, index ) => (
              <RangeControl
                key={ block.clientId }
                label={ sprintf(
                  /* translators: %d: column number */
                  __( 'Column %d (%%)', 'adaire-blocks' ),
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
        { __( 'Or switch to a preset layout (existing content is kept where possible):', 'adaire-blocks' ) }
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
        <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
          { responsivePanel }
          { rowLayoutPanel }
          { backgroundColorPanel }
          { backgroundMediaPanel }
          { effectsPanel }
          <AnimationSettings attributes={ attributes } setAttributes={ setAttributes } />
          { spacingPanel }
          { borderPanel }
        </InspectorTabs>
        <div { ...blockProps }>
          <div className="adaire-row-placeholder">
            <div className="adaire-row-placeholder__header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3"  y="3" width="7" height="18" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="14" y="3" width="7" height="18" rx="1" fill="currentColor" opacity="0.5" />
              </svg>
              <span>{ __( 'Row', 'adaire-blocks' ) }</span>
            </div>
            <p className="adaire-row-placeholder__label">
              { __( 'Select a column layout to start.', 'adaire-blocks' ) }
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
              { __( 'Skip and add columns manually', 'adaire-blocks' ) }
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
        { responsivePanel }
        { rowLayoutPanel }
        { columnsPanel }
        { backgroundColorPanel }
        { backgroundMediaPanel }
        { effectsPanel }
        <AnimationSettings attributes={ attributes } setAttributes={ setAttributes } />
        { spacingPanel }
        { borderPanel }
      </InspectorTabs>
      <div { ...innerBlocksProps } />
    </>
  );
}

