import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
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
	TextControl,
	TextareaControl,
	__experimentalBoxControl  as BoxControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import AdaireColorControl from '../components/AdaireColorControl';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher, { FIVE_TIERS } from '../components/DeviceSwitcher';
import useResponsiveAttribute from '../components/useResponsiveAttribute';
import { FONT_WEIGHTS } from '../components/FontWeights';

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const hexToRgba = ( hex, opacity ) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
	if ( ! result ) return `rgba(0,0,0,${ opacity })`;
	return `rgba(${ parseInt( result[ 1 ], 16 ) },${ parseInt( result[ 2 ], 16 ) },${ parseInt( result[ 3 ], 16 ) },${ opacity })`;
};

const buildBoxShadow = ( type, blur, spread, color, opacity ) => {
	const prefix = type === 'inset' ? 'inset ' : '';
	return `${ prefix }0 4px ${ blur }px ${ spread }px ${ hexToRgba( color, opacity ) }`;
};

// Deepened variant shown on hover — same shadow, just bigger/darker.
const buildHoverBoxShadow = ( type, blur, spread, color, opacity ) => {
	return buildBoxShadow( type, blur + 16, spread + 2, color, Math.min( 1, opacity + 0.15 ) );
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
	'--hsc-img-w-tablet':         riw?.tablet             || '45%',
	'--hsc-img-w-small-laptop':   riw?.smallLaptop        || '45%',
	'--hsc-img-w-desktop':        riw?.desktop            || '45%',
	'--hsc-img-w-big-desktop':    riw?.bigDesktop         || '45%',
} );

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

	const updateResponsive = useResponsiveAttribute( attributes, setAttributes );

	const boxShadow = buildBoxShadow( shadowType, shadowBlur, shadowSpread, shadowColor, shadowOpacity );
	const boxShadowHover = buildHoverBoxShadow( shadowType, shadowBlur, shadowSpread, shadowColor, shadowOpacity );
	const border    = borderEnabled ? `${ borderWidth }px ${ borderStyle } ${ borderColor }` : 'none';

	const blockProps = useBlockProps( {
		className: 'adaire-hsc__card',
		style: {
			backgroundColor,
			borderRadius: `${ borderRadius }px`,
			'--hsc-card-shadow': boxShadow,
			'--hsc-card-shadow-hover': boxShadowHover,
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

	const activeLabel = FIVE_TIERS.find( ( t ) => t.key === deviceType )?.label;

	return (
		<>
			<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
				{ /* â”€â”€ Card Content â”€â”€ */ }
				<PanelBody section="content" title={ __( 'Card Content', 'adaire-blocks' ) } initialOpen={ true }>
					<TextControl
						label={ __( 'Title', 'adaire-blocks' ) }
						value={ cardTitle }
						onChange={ ( val ) => setAttributes( { cardTitle: val } ) }
						placeholder={ __( 'Card titleâ€¦', 'adaire-blocks' ) }
					/>
					<TextareaControl
						label={ __( 'Description', 'adaire-blocks' ) }
						value={ cardText }
						onChange={ ( val ) => setAttributes( { cardText: val } ) }
						placeholder={ __( 'Card descriptionâ€¦', 'adaire-blocks' ) }
						rows={ 4 }
						help={ __( 'Also editable inline by clicking on the canvas.', 'adaire-blocks' ) }
					/>
				</PanelBody>

				{ /* â”€â”€ Typography â”€â”€ */ }
				<PanelBody section="style" priority="high" title={ __( 'Typography', 'adaire-blocks' ) } initialOpen={ false }>
					<p style={ { margin: '0 0 8px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#1e1e1e' } }>
						{ __( 'Card Title', 'adaire-blocks' ) }
					</p>
					<UnitControl
						label={ __( 'Font Size', 'adaire-blocks' ) }
						value={ titleFontSize }
						onChange={ ( val ) => setAttributes( { titleFontSize: val || '1.75rem' } ) }
						help={ __( 'Supports rem, px, em, vw', 'adaire-blocks' ) }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'adaire-blocks' ) }
						value={ titleFontWeight }
						options={ FONT_WEIGHTS }
						onChange={ ( val ) => setAttributes( { titleFontWeight: val } ) }
					/>
					<p style={ { margin: '16px 0 8px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#1e1e1e' } }>
						{ __( 'Body Text', 'adaire-blocks' ) }
					</p>
					<UnitControl
						label={ __( 'Font Size', 'adaire-blocks' ) }
						value={ textFontSize }
						onChange={ ( val ) => setAttributes( { textFontSize: val || '0.9375rem' } ) }
						help={ __( 'Supports rem, px, em, vw', 'adaire-blocks' ) }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'adaire-blocks' ) }
						value={ textFontWeight }
						options={ FONT_WEIGHTS }
						onChange={ ( val ) => setAttributes( { textFontWeight: val } ) }
					/>
				</PanelBody>

			{ /* â”€â”€ Card Style â”€â”€ */ }
				<PanelBody section="style" priority="medium" title={ __( 'Card Style', 'adaire-blocks' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Border Radius (px)', 'adaire-blocks' ) }
						value={ borderRadius }
						onChange={ ( val ) => setAttributes( { borderRadius: val } ) }
						min={ 0 }
						max={ 64 }
					/>
					<DeviceSwitcher
						deviceType={ deviceType }
						setDeviceType={ setDeviceType }
						tiers={ FIVE_TIERS }
						label={ __( 'Configuring', 'adaire-blocks' ) }
					/>
					<BoxControl
						label={ `${ __( 'Card Padding', 'adaire-blocks' ) } (${ activeLabel })` }
						values={ responsiveCardPadding?.[ deviceType ] || {} }
						onChange={ ( val ) => updateResponsive( 'responsiveCardPadding', deviceType, val ) }
					/>
				</PanelBody>

				{ /* â”€â”€ Left Column Layout â”€â”€ */ }
				<PanelBody section="layout" title={ __( 'Left Column Layout', 'adaire-blocks' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Layout Direction', 'adaire-blocks' ) }
						value={ cardLeftJustify }
						options={ [
							{ label: __( 'Space Between â€” content top, button bottom', 'adaire-blocks' ), value: 'space-between' },
							{ label: __( 'Space Around â€” equal spacing around each item', 'adaire-blocks' ), value: 'space-around' },
							{ label: __( 'Flex Start â€” stack from top, button under text', 'adaire-blocks' ), value: 'flex-start' },
						] }
						onChange={ ( val ) => setAttributes( { cardLeftJustify: val } ) }
						help={ __( 'Controls how title, body, and button are spaced vertically.', 'adaire-blocks' ) }
					/>
					<UnitControl
						label={ __( 'Left Column Gap', 'adaire-blocks' ) }
						value={ cardLeftGap }
						onChange={ ( val ) => setAttributes( { cardLeftGap: val || '16px' } ) }
						help={ __( 'Gap between title, body text, and button.', 'adaire-blocks' ) }
					/>
				</PanelBody>

				{ /* â”€â”€ Row & Image Layout â”€â”€ */ }
				<PanelBody section="layout" title={ __( 'Row & Image Layout', 'adaire-blocks' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Row Alignment', 'adaire-blocks' ) }
						value={ cardInnerJustify }
						options={ [
							{ label: __( 'Flex Start â€” text left, image right', 'adaire-blocks' ),   value: 'flex-start'   },
							{ label: __( 'Space Between â€” push columns to edges', 'adaire-blocks' ), value: 'space-between' },
							{ label: __( 'Space Around â€” equal space around columns', 'adaire-blocks' ), value: 'space-around' },
							{ label: __( 'Center â€” columns centred together', 'adaire-blocks' ),      value: 'center'       },
						] }
						onChange={ ( val ) => setAttributes( { cardInnerJustify: val } ) }
						help={ __( 'justify-content of the two-column row inside the card.', 'adaire-blocks' ) }
					/>
					<UnitControl
						label={ __( 'Column Gap', 'adaire-blocks' ) }
						value={ cardInnerGap }
						onChange={ ( val ) => setAttributes( { cardInnerGap: val || '32px' } ) }
						help={ __( 'Space between the text column and the image.', 'adaire-blocks' ) }
					/>
					<p style={ { margin: '16px 0 8px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#1e1e1e' } }>
						{ __( 'Image Width', 'adaire-blocks' ) }
					</p>
					<DeviceSwitcher
						deviceType={ deviceType }
						setDeviceType={ setDeviceType }
						tiers={ FIVE_TIERS }
						label={ __( 'Configuring', 'adaire-blocks' ) }
					/>
					<UnitControl
						label={ __( 'Image Column Width', 'adaire-blocks' ) }
						value={ responsiveImageWidth?.[ deviceType ] || '45%' }
						onChange={ ( val ) => updateResponsive( 'responsiveImageWidth', deviceType, val ) }
						help={ __( 'Supports %, px, vw. Use the device buttons above to set per-breakpoint.', 'adaire-blocks' ) }
					/>
				</PanelBody>

			{ /* â”€â”€ Shadow â”€â”€ */ }
				<PanelBody section="style" priority="medium" title={ __( 'Shadow', 'adaire-blocks' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Shadow Type', 'adaire-blocks' ) }
						value={ shadowType }
						options={ [
							{ label: 'Outer (drop shadow)', value: '' },
							{ label: 'Inner (inset)',        value: 'inset' },
						] }
						onChange={ ( val ) => setAttributes( { shadowType: val } ) }
					/>
					<RangeControl
						label={ __( 'Blur (px)', 'adaire-blocks' ) }
						value={ shadowBlur }
						onChange={ ( val ) => setAttributes( { shadowBlur: val } ) }
						min={ 0 } max={ 100 }
					/>
					<RangeControl
						label={ __( 'Spread (px)', 'adaire-blocks' ) }
						value={ shadowSpread }
						onChange={ ( val ) => setAttributes( { shadowSpread: val } ) }
						min={ -50 } max={ 50 }
					/>
					<RangeControl
						label={ __( 'Opacity', 'adaire-blocks' ) }
						value={ shadowOpacity }
						onChange={ ( val ) => setAttributes( { shadowOpacity: val } ) }
						min={ 0 } max={ 1 } step={ 0.01 }
					/>
					<AdaireColorControl
						label={ __( 'Shadow Color', 'adaire-blocks' ) }
						value={ shadowColor }
						onChange={ ( value ) => setAttributes( { shadowColor: value } ) }
					/>
				</PanelBody>

				{ /* â”€â”€ Border â”€â”€ */ }
				<PanelBody section="style" priority="medium" title={ __( 'Border', 'adaire-blocks' ) } initialOpen={ false }>
					<ToggleControl
						label={ __( 'Enable Border', 'adaire-blocks' ) }
						checked={ borderEnabled }
						onChange={ ( val ) => setAttributes( { borderEnabled: val } ) }
					/>
					{ borderEnabled && (
						<>
							<RangeControl
								label={ __( 'Border Width (px)', 'adaire-blocks' ) }
								value={ borderWidth }
								onChange={ ( val ) => setAttributes( { borderWidth: val } ) }
								min={ 1 } max={ 10 }
							/>
							<SelectControl
								label={ __( 'Border Style', 'adaire-blocks' ) }
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
							<AdaireColorControl
								label={ __( 'Border Color', 'adaire-blocks' ) }
								value={ borderColor }
								onChange={ ( value ) => setAttributes( { borderColor: value } ) }
							/>
						</>
					) }
				</PanelBody>

				{ /* â”€â”€ Right Image â”€â”€ */ }
				<PanelBody section="style" priority="medium" title={ __( 'Right Image', 'adaire-blocks' ) } initialOpen={ false }>
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
										{ imageUrl ? __( 'Replace Image', 'adaire-blocks' ) : __( 'Select Image', 'adaire-blocks' ) }
									</Button>
									{ imageUrl && (
										<Button variant="tertiary" isDestructive onClick={ () => setAttributes( { imageId: 0, imageUrl: '', imageAlt: '' } ) } style={ { width: '100%' } }>
											{ __( 'Remove Image', 'adaire-blocks' ) }
										</Button>
									) }
								</>
							) }
						/>
					</MediaUploadCheck>
				</PanelBody>

				{ /* â”€â”€ Colors â”€â”€ */ }
				<PanelColorSettings
					section="style"
					priority="high"
					title={ __( 'Colors', 'adaire-blocks' ) }
					initialOpen={ false }
					colorSettings={ [
						{ value: backgroundColor, onChange: ( val ) => setAttributes( { backgroundColor: val || '#ffffff' } ), label: __( 'Card Background', 'adaire-blocks' ) },
						{ value: titleColor,       onChange: ( val ) => setAttributes( { titleColor: val || '#111111' } ),       label: __( 'Title',           'adaire-blocks' ) },
						{ value: textColor,        onChange: ( val ) => setAttributes( { textColor: val || '#555555' } ),        label: __( 'Body Text',       'adaire-blocks' ) },
					] }
				/>
			</InspectorTabs>

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
						placeholder={ __( 'Card titleâ€¦', 'adaire-blocks' ) }
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
						placeholder={ __( 'Card descriptionâ€¦', 'adaire-blocks' ) }
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
											title={ __( 'Click to replace image', 'adaire-blocks' ) }
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
											aria-label={ __( 'Upload image', 'adaire-blocks' ) }
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
												<rect x="3" y="3" width="18" height="18" rx="2" />
												<circle cx="8.5" cy="8.5" r="1.5" />
												<polyline points="21 15 16 10 5 21" />
											</svg>
											<span>{ __( 'Click to add image', 'adaire-blocks' ) }</span>
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
