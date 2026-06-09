import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	PanelColorSettings,
	RichText,
	MediaUpload,
	MediaUploadCheck,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	Button,
	BaseControl,
	TextControl,
	TextareaControl,
	__experimentalBoxControl  as BoxControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useState, useCallback, useRef, useEffect, createElement } from '@wordpress/element';
import { desktop, tablet, mobile } from '@wordpress/icons';

// â”€â”€â”€ Breakpoints (project standard â€” matches BREAKPOINTS.md) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const smallLaptopIcon = createElement(
	'svg',
	{ width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
	createElement( 'path', { d: 'M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z', stroke: 'currentColor', strokeWidth: '1.5', fill: 'none' } ),
	createElement( 'path', { d: 'M2 19H22', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round' } )
);

const bigDesktopIcon = createElement(
	'svg',
	{ width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
	createElement( 'rect', { x: '3', y: '4', width: '18', height: '12', rx: '1', stroke: 'currentColor', strokeWidth: '1.5', fill: 'none' } ),
	createElement( 'path', { d: 'M8 20H16', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round' } ),
	createElement( 'rect', { x: '10', y: '20', width: '4', height: '2', rx: '0.5', fill: 'currentColor' } )
);

const BREAKPOINTS = [
	{ name: 'mobile',      icon: mobile,          label: __( 'Mobile',       'adaire-blocks-dev2' ) },
	{ name: 'tablet',      icon: tablet,          label: __( 'Tablet',       'adaire-blocks-dev2' ) },
	{ name: 'smallLaptop', icon: smallLaptopIcon, label: __( 'Small Laptop', 'adaire-blocks-dev2' ) },
	{ name: 'desktop',     icon: desktop,         label: __( 'Desktop',      'adaire-blocks-dev2' ) },
	{ name: 'bigDesktop',  icon: bigDesktopIcon,  label: __( 'Big Desktop',  'adaire-blocks-dev2' ) },
];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const hexToRgba = ( hex, opacity ) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
	if ( ! result ) return `rgba(0,0,0,${ opacity })`;
	return `rgba(${ parseInt( result[ 1 ], 16 ) },${ parseInt( result[ 2 ], 16 ) },${ parseInt( result[ 3 ], 16 ) },${ opacity })`;
};

const buildBoxShadow = ( type, blur, spread, color, opacity ) => {
	const prefix = type === 'inset' ? 'inset ' : '';
	return `${ prefix }0 4px ${ blur }px ${ spread }px ${ hexToRgba( color, opacity ) }`;
};

const buildCardVars = ( rcp, riw ) => ( {
	// â”€â”€ Inner padding â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	'--hsc-card-pt-mobile':       rcp?.mobile?.top        || '32px',
	'--hsc-card-pr-mobile':       rcp?.mobile?.right      || '24px',
	'--hsc-card-pb-mobile':       rcp?.mobile?.bottom     || '32px',
	'--hsc-card-pl-mobile':       rcp?.mobile?.left       || '24px',
	'--hsc-card-pt-tablet':       rcp?.tablet?.top        || '40px',
	'--hsc-card-pr-tablet':       rcp?.tablet?.right      || '32px',
	'--hsc-card-pb-tablet':       rcp?.tablet?.bottom     || '40px',
	'--hsc-card-pl-tablet':       rcp?.tablet?.left       || '32px',
	'--hsc-card-pt-small-laptop': rcp?.smallLaptop?.top   || '48px',
	'--hsc-card-pr-small-laptop': rcp?.smallLaptop?.right || '40px',
	'--hsc-card-pb-small-laptop': rcp?.smallLaptop?.bottom || '48px',
	'--hsc-card-pl-small-laptop': rcp?.smallLaptop?.left  || '40px',
	'--hsc-card-pt-desktop':      rcp?.desktop?.top       || '48px',
	'--hsc-card-pr-desktop':      rcp?.desktop?.right     || '48px',
	'--hsc-card-pb-desktop':      rcp?.desktop?.bottom    || '48px',
	'--hsc-card-pl-desktop':      rcp?.desktop?.left      || '48px',
	'--hsc-card-pt-big-desktop':  rcp?.bigDesktop?.top    || '60px',
	'--hsc-card-pr-big-desktop':  rcp?.bigDesktop?.right  || '60px',
	'--hsc-card-pb-big-desktop':  rcp?.bigDesktop?.bottom || '60px',
	'--hsc-card-pl-big-desktop':  rcp?.bigDesktop?.left   || '60px',
	// â”€â”€ Image column width â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
	'--hsc-img-w-mobile':         riw?.mobile             || '100%',
	'--hsc-img-w-tablet':         riw?.tablet             || '50%',
	'--hsc-img-w-small-laptop':   riw?.smallLaptop        || '45%',
	'--hsc-img-w-desktop':        riw?.desktop            || '45%',
	'--hsc-img-w-big-desktop':    riw?.bigDesktop         || '45%',
} );

const FONT_WEIGHTS = [
	{ label: __( '100 â€” Thin',        'adaire-blocks-dev2' ), value: '100' },
	{ label: __( '200 â€” Extra Light', 'adaire-blocks-dev2' ), value: '200' },
	{ label: __( '300 â€” Light',       'adaire-blocks-dev2' ), value: '300' },
	{ label: __( '400 â€” Regular',     'adaire-blocks-dev2' ), value: '400' },
	{ label: __( '500 â€” Medium',      'adaire-blocks-dev2' ), value: '500' },
	{ label: __( '600 â€” Semi Bold',   'adaire-blocks-dev2' ), value: '600' },
	{ label: __( '700 â€” Bold',        'adaire-blocks-dev2' ), value: '700' },
	{ label: __( '800 â€” Extra Bold',  'adaire-blocks-dev2' ), value: '800' },
	{ label: __( '900 â€” Black',       'adaire-blocks-dev2' ), value: '900' },
];

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Edit( { attributes, setAttributes } ) {
	const {
		cardTitle,
		cardText,
		imageId,
		imageUrl,
		imageAlt,
		backgroundColor,
		borderRadius,
		shadowBlur,
		shadowSpread,
		shadowColor,
		shadowOpacity,
		shadowType,
		borderEnabled,
		borderColor,
		borderWidth,
		borderStyle,
		titleColor,
		textColor,
		titleFontSize,
		titleFontWeight,
		textFontSize,
		textFontWeight,
		cardLeftJustify,
		cardLeftGap,
		cardInnerJustify,
		cardInnerGap,
		responsiveImageWidth,
		responsiveCardPadding,
	} = attributes;

	const [ deviceType, setDeviceType ] = useState( 'desktop' );

	const attributesRef = useRef( attributes );
	useEffect( () => { attributesRef.current = attributes; }, [ attributes ] );

	const updateResponsive = useCallback( ( attr, bp, value ) => {
		setAttributes( {
			[ attr ]: {
				...( attributesRef.current[ attr ] || {} ),
				[ bp ]: value,
			},
		} );
	}, [ setAttributes ] );

	const boxShadow = buildBoxShadow( shadowType, shadowBlur, shadowSpread, shadowColor, shadowOpacity );
	const border    = borderEnabled ? `${ borderWidth }px ${ borderStyle } ${ borderColor }` : 'none';

	const blockProps = useBlockProps( {
		className: 'adaire-hsc__card',
		style: {
			backgroundColor,
			borderRadius: `${ borderRadius }px`,
			boxShadow,
			border,
			...buildCardVars( responsiveCardPadding, responsiveImageWidth ),
		},
	} );

	const buttonBlocksProps = useInnerBlocksProps(
		{
			className: 'adaire-hsc__card-cta',
			// Zero out the SCSS margin-top:auto so justify-content governs spacing
			style: { marginTop: 0 },
		},
		{
			allowedBlocks: [ 'create-block/button-block', 'core/buttons', 'core/button' ],
			template: [ [ 'create-block/button-block', { text: 'Explore' } ] ],
			templateLock: false,
		}
	);

	const activeLabel = BREAKPOINTS.find( ( b ) => b.name === deviceType )?.label;

	return (
		<>
			<InspectorControls>
				{ /* â”€â”€ Device toggle â”€â”€ */ }
				<div className="adaire-device-toggle">
					<p className="adaire-device-toggle-label">
						{ __( 'Device View', 'adaire-blocks-dev2' ) }
					</p>
					<div className="adaire-device-toggle-group">
						{ BREAKPOINTS.map( ( bp ) => (
							<Button
								key={ bp.name }
								isPrimary={ deviceType === bp.name }
								onClick={ () => setDeviceType( bp.name ) }
								icon={ bp.icon }
							>
								<span>{ bp.label }</span>
							</Button>
						) ) }
					</div>
					<p className="adaire-device-toggle-status">
						{ __( 'Configuring:', 'adaire-blocks-dev2' ) }{ ' ' }
						<strong>{ activeLabel }</strong>
					</p>
				</div>

				{ /* â”€â”€ Card Content â”€â”€ */ }
				<PanelBody title={ __( 'Card Content', 'adaire-blocks-dev2' ) } initialOpen={ true }>
					<TextControl
						label={ __( 'Title', 'adaire-blocks-dev2' ) }
						value={ cardTitle }
						onChange={ ( val ) => setAttributes( { cardTitle: val } ) }
						placeholder={ __( 'Card titleâ€¦', 'adaire-blocks-dev2' ) }
					/>
					<TextareaControl
						label={ __( 'Description', 'adaire-blocks-dev2' ) }
						value={ cardText }
						onChange={ ( val ) => setAttributes( { cardText: val } ) }
						placeholder={ __( 'Card descriptionâ€¦', 'adaire-blocks-dev2' ) }
						rows={ 4 }
						help={ __( 'Also editable inline by clicking on the canvas.', 'adaire-blocks-dev2' ) }
					/>
				</PanelBody>

				{ /* â”€â”€ Typography â”€â”€ */ }
				<PanelBody title={ __( 'Typography', 'adaire-blocks-dev2' ) } initialOpen={ false }>
					<p style={ { margin: '0 0 8px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#1e1e1e' } }>
						{ __( 'Card Title', 'adaire-blocks-dev2' ) }
					</p>
					<UnitControl
						label={ __( 'Font Size', 'adaire-blocks-dev2' ) }
						value={ titleFontSize }
						onChange={ ( val ) => setAttributes( { titleFontSize: val || '1.75rem' } ) }
						help={ __( 'Supports rem, px, em, vw', 'adaire-blocks-dev2' ) }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'adaire-blocks-dev2' ) }
						value={ titleFontWeight }
						options={ FONT_WEIGHTS }
						onChange={ ( val ) => setAttributes( { titleFontWeight: val } ) }
					/>
					<p style={ { margin: '16px 0 8px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#1e1e1e' } }>
						{ __( 'Body Text', 'adaire-blocks-dev2' ) }
					</p>
					<UnitControl
						label={ __( 'Font Size', 'adaire-blocks-dev2' ) }
						value={ textFontSize }
						onChange={ ( val ) => setAttributes( { textFontSize: val || '0.9375rem' } ) }
						help={ __( 'Supports rem, px, em, vw', 'adaire-blocks-dev2' ) }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'adaire-blocks-dev2' ) }
						value={ textFontWeight }
						options={ FONT_WEIGHTS }
						onChange={ ( val ) => setAttributes( { textFontWeight: val } ) }
					/>
				</PanelBody>

			{ /* â”€â”€ Card Style â”€â”€ */ }
				<PanelBody title={ __( 'Card Style', 'adaire-blocks-dev2' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Border Radius (px)', 'adaire-blocks-dev2' ) }
						value={ borderRadius }
						onChange={ ( val ) => setAttributes( { borderRadius: val } ) }
						min={ 0 }
						max={ 64 }
					/>
					<BoxControl
						label={ `${ __( 'Card Padding', 'adaire-blocks-dev2' ) } (${ activeLabel })` }
						values={ responsiveCardPadding?.[ deviceType ] || {} }
						onChange={ ( val ) => updateResponsive( 'responsiveCardPadding', deviceType, val ) }
					/>
					<SelectControl
						label={ __( 'Left Column Layout', 'adaire-blocks-dev2' ) }
						value={ cardLeftJustify }
						options={ [
							{ label: __( 'Space Between â€” content top, button bottom', 'adaire-blocks-dev2' ), value: 'space-between' },
							{ label: __( 'Space Around â€” equal spacing around each item', 'adaire-blocks-dev2' ), value: 'space-around' },
							{ label: __( 'Flex Start â€” stack from top, button under text', 'adaire-blocks-dev2' ), value: 'flex-start' },
						] }
						onChange={ ( val ) => setAttributes( { cardLeftJustify: val } ) }
						help={ __( 'Controls how title, body, and button are spaced vertically.', 'adaire-blocks-dev2' ) }
					/>
					<UnitControl
						label={ __( 'Left Column Gap', 'adaire-blocks-dev2' ) }
						value={ cardLeftGap }
						onChange={ ( val ) => setAttributes( { cardLeftGap: val || '16px' } ) }
						help={ __( 'Gap between title, body text, and button.', 'adaire-blocks-dev2' ) }
					/>
				</PanelBody>

				{ /* â”€â”€ Row & Image Layout â”€â”€ */ }
				<PanelBody title={ __( 'Row & Image Layout', 'adaire-blocks-dev2' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Row Alignment', 'adaire-blocks-dev2' ) }
						value={ cardInnerJustify }
						options={ [
							{ label: __( 'Flex Start â€” text left, image right', 'adaire-blocks-dev2' ),   value: 'flex-start'   },
							{ label: __( 'Space Between â€” push columns to edges', 'adaire-blocks-dev2' ), value: 'space-between' },
							{ label: __( 'Space Around â€” equal space around columns', 'adaire-blocks-dev2' ), value: 'space-around' },
							{ label: __( 'Center â€” columns centred together', 'adaire-blocks-dev2' ),      value: 'center'       },
						] }
						onChange={ ( val ) => setAttributes( { cardInnerJustify: val } ) }
						help={ __( 'justify-content of the two-column row inside the card.', 'adaire-blocks-dev2' ) }
					/>
					<UnitControl
						label={ __( 'Column Gap', 'adaire-blocks-dev2' ) }
						value={ cardInnerGap }
						onChange={ ( val ) => setAttributes( { cardInnerGap: val || '32px' } ) }
						help={ __( 'Space between the text column and the image.', 'adaire-blocks-dev2' ) }
					/>
					<p style={ { margin: '16px 0 8px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#1e1e1e' } }>
						{ __( 'Image Width', 'adaire-blocks-dev2' ) }
					</p>
					<p style={ { margin: '0 0 8px', fontSize: '11px', color: '#757575' } }>
						{ __( `Configuring: ${ BREAKPOINTS.find( b => b.name === deviceType )?.label }`, 'adaire-blocks-dev2' ) }
					</p>
					<UnitControl
						label={ __( 'Image Column Width', 'adaire-blocks-dev2' ) }
						value={ responsiveImageWidth?.[ deviceType ] || '45%' }
						onChange={ ( val ) => updateResponsive( 'responsiveImageWidth', deviceType, val ) }
						help={ __( 'Supports %, px, vw. Use the device buttons above to set per-breakpoint.', 'adaire-blocks-dev2' ) }
					/>
				</PanelBody>

			{ /* â”€â”€ Shadow â”€â”€ */ }
				<PanelBody title={ __( 'Shadow', 'adaire-blocks-dev2' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Shadow Type', 'adaire-blocks-dev2' ) }
						value={ shadowType }
						options={ [
							{ label: 'Outer (drop shadow)', value: '' },
							{ label: 'Inner (inset)',        value: 'inset' },
						] }
						onChange={ ( val ) => setAttributes( { shadowType: val } ) }
					/>
					<RangeControl
						label={ __( 'Blur (px)', 'adaire-blocks-dev2' ) }
						value={ shadowBlur }
						onChange={ ( val ) => setAttributes( { shadowBlur: val } ) }
						min={ 0 } max={ 100 }
					/>
					<RangeControl
						label={ __( 'Spread (px)', 'adaire-blocks-dev2' ) }
						value={ shadowSpread }
						onChange={ ( val ) => setAttributes( { shadowSpread: val } ) }
						min={ -50 } max={ 50 }
					/>
					<RangeControl
						label={ __( 'Opacity', 'adaire-blocks-dev2' ) }
						value={ shadowOpacity }
						onChange={ ( val ) => setAttributes( { shadowOpacity: val } ) }
						min={ 0 } max={ 1 } step={ 0.01 }
					/>
					<BaseControl label={ __( 'Shadow Color', 'adaire-blocks-dev2' ) }>
						<input
							type="color"
							value={ shadowColor }
							onChange={ ( e ) => setAttributes( { shadowColor: e.target.value } ) }
							style={ { width: '100%', height: 36, borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' } }
						/>
					</BaseControl>
				</PanelBody>

				{ /* â”€â”€ Border â”€â”€ */ }
				<PanelBody title={ __( 'Border', 'adaire-blocks-dev2' ) } initialOpen={ false }>
					<ToggleControl
						label={ __( 'Enable Border', 'adaire-blocks-dev2' ) }
						checked={ borderEnabled }
						onChange={ ( val ) => setAttributes( { borderEnabled: val } ) }
					/>
					{ borderEnabled && (
						<>
							<RangeControl
								label={ __( 'Border Width (px)', 'adaire-blocks-dev2' ) }
								value={ borderWidth }
								onChange={ ( val ) => setAttributes( { borderWidth: val } ) }
								min={ 1 } max={ 10 }
							/>
							<SelectControl
								label={ __( 'Border Style', 'adaire-blocks-dev2' ) }
								value={ borderStyle }
								options={ [
									{ label: 'Solid',  value: 'solid'  },
									{ label: 'Dashed', value: 'dashed' },
									{ label: 'Dotted', value: 'dotted' },
									{ label: 'Double', value: 'double' },
									{ label: 'Groove', value: 'groove' },
								] }
								onChange={ ( val ) => setAttributes( { borderStyle: val } ) }
							/>
							<BaseControl label={ __( 'Border Color', 'adaire-blocks-dev2' ) }>
								<input
									type="color"
									value={ borderColor }
									onChange={ ( e ) => setAttributes( { borderColor: e.target.value } ) }
									style={ { width: '100%', height: 36, borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' } }
								/>
							</BaseControl>
						</>
					) }
				</PanelBody>

				{ /* â”€â”€ Right Image â”€â”€ */ }
				<PanelBody title={ __( 'Right Image', 'adaire-blocks-dev2' ) } initialOpen={ false }>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( media ) => setAttributes( { imageId: media.id, imageUrl: media.url, imageAlt: media.alt || '' } ) }
							allowedTypes={ [ 'image' ] }
							value={ imageId }
							render={ ( { open } ) => (
								<>
									{ imageUrl && (
										<img
											src={ imageUrl }
											alt={ imageAlt }
											style={ { width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8, display: 'block' } }
										/>
									) }
									<Button variant="secondary" onClick={ open } style={ { width: '100%', marginBottom: 8 } }>
										{ imageUrl ? __( 'Replace Image', 'adaire-blocks-dev2' ) : __( 'Select Image', 'adaire-blocks-dev2' ) }
									</Button>
									{ imageUrl && (
										<Button variant="tertiary" isDestructive onClick={ () => setAttributes( { imageId: 0, imageUrl: '', imageAlt: '' } ) } style={ { width: '100%' } }>
											{ __( 'Remove Image', 'adaire-blocks-dev2' ) }
										</Button>
									) }
								</>
							) }
						/>
					</MediaUploadCheck>
				</PanelBody>

				{ /* â”€â”€ Colors â”€â”€ */ }
				<PanelColorSettings
					title={ __( 'Colors', 'adaire-blocks-dev2' ) }
					initialOpen={ false }
					colorSettings={ [
						{ value: backgroundColor, onChange: ( val ) => setAttributes( { backgroundColor: val || '#ffffff' } ), label: __( 'Card Background', 'adaire-blocks-dev2' ) },
						{ value: titleColor,       onChange: ( val ) => setAttributes( { titleColor: val || '#111111' } ),       label: __( 'Title',           'adaire-blocks-dev2' ) },
						{ value: textColor,        onChange: ( val ) => setAttributes( { textColor: val || '#555555' } ),        label: __( 'Body Text',       'adaire-blocks-dev2' ) },
					] }
				/>
			</InspectorControls>

			{ /* â”€â”€ Card canvas â”€â”€ */ }
			<div { ...blockProps }>
				<div
					className="adaire-hsc__card-inner"
					style={ { justifyContent: cardInnerJustify, gap: cardInnerGap } }
				>
					<div
						className="adaire-hsc__card-left"
						style={ { justifyContent: cardLeftJustify, gap: cardLeftGap } }
					>
					<RichText
						tagName="h3"
						className="adaire-hsc__card-title"
						value={ cardTitle }
						onChange={ ( val ) => setAttributes( { cardTitle: val } ) }
						placeholder={ __( 'Card titleâ€¦', 'adaire-blocks-dev2' ) }
						style={ {
							color:      titleColor,
							fontSize:   titleFontSize,
							fontWeight: titleFontWeight,
						} }
					/>
					<RichText
						tagName="p"
						className="adaire-hsc__card-text"
						value={ cardText }
						onChange={ ( val ) => setAttributes( { cardText: val } ) }
						placeholder={ __( 'Card descriptionâ€¦', 'adaire-blocks-dev2' ) }
						style={ {
							color:      textColor,
							fontSize:   textFontSize,
							fontWeight: textFontWeight,
						} }
					/>
						<div { ...buttonBlocksProps } />
					</div>

					<div className="adaire-hsc__card-right">
						{ imageUrl ? (
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ ( media ) => setAttributes( { imageId: media.id, imageUrl: media.url, imageAlt: media.alt || '' } ) }
									allowedTypes={ [ 'image' ] }
									value={ imageId }
									render={ ( { open } ) => (
										<img
											src={ imageUrl }
											alt={ imageAlt }
											className="adaire-hsc__card-image"
											onClick={ open }
											style={ { cursor: 'pointer' } }
											title={ __( 'Click to replace image', 'adaire-blocks-dev2' ) }
										/>
									) }
								/>
							</MediaUploadCheck>
						) : (
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ ( media ) => setAttributes( { imageId: media.id, imageUrl: media.url, imageAlt: media.alt || '' } ) }
									allowedTypes={ [ 'image' ] }
									value={ imageId }
									render={ ( { open } ) => (
										<div
											className="adaire-hsc__card-image-placeholder"
											onClick={ open }
											role="button"
											tabIndex={ 0 }
											onKeyDown={ ( e ) => e.key === 'Enter' && open() }
											aria-label={ __( 'Upload image', 'adaire-blocks-dev2' ) }
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
												<rect x="3" y="3" width="18" height="18" rx="2" />
												<circle cx="8.5" cy="8.5" r="1.5" />
												<polyline points="21 15 16 10 5 21" />
											</svg>
											<span>{ __( 'Click to add image', 'adaire-blocks-dev2' ) }</span>
										</div>
									) }
								/>
							</MediaUploadCheck>
						) }
					</div>
				</div>
			</div>
		</>
	);
}



