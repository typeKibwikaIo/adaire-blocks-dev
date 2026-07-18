import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	PanelColorSettings,
	useInnerBlocksProps,
	RichText,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	Button,
	__experimentalUnitControl as UnitControl,
	__experimentalBoxControl as BoxControl,
	Notice,
} from '@wordpress/components';
import { useState, useEffect, useCallback, useRef, createElement } from '@wordpress/element';
import { desktop, tablet, mobile } from '@wordpress/icons';

// â”€â”€â”€ Breakpoint icons (matching infogrid-4 / project standard) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
	{ name: 'mobile',      icon: mobile,          label: __( 'Mobile',       'adaire-blocks' ) },
	{ name: 'tablet',      icon: tablet,          label: __( 'Tablet',       'adaire-blocks' ) },
	{ name: 'smallLaptop', icon: smallLaptopIcon, label: __( 'Small Laptop', 'adaire-blocks' ) },
	{ name: 'desktop',     icon: desktop,         label: __( 'Desktop',      'adaire-blocks' ) },
	{ name: 'bigDesktop',  icon: bigDesktopIcon,  label: __( 'Big Desktop',  'adaire-blocks' ) },
];

// â”€â”€â”€ Inner-blocks template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ALLOWED_BLOCKS = [ 'create-block/horizontal-scroll-card-block' ];

const TEMPLATE = [
	[ 'create-block/horizontal-scroll-card-block', { cardTitle: 'Multi-currency accounts', cardText: 'Our multi-currency account enables you to receive payment, do bank transfers and e-wallets without creating overseas bank accounts.', backgroundColor: '#ffffff' } ],
	[ 'create-block/horizontal-scroll-card-block', { cardTitle: 'Exotic FX Liquidity',     cardText: 'Our exchange service provides you access across all 49 markets from popular liquidity discovery and trade settlement â€” direct network of partners worldwide.', backgroundColor: '#f4f0ff' } ],
	[ 'create-block/horizontal-scroll-card-block', { cardTitle: 'Global Payments',          cardText: 'Send and receive money in over 100 currencies with real-time exchange rates and zero hidden fees.', backgroundColor: '#fff9f0' } ],
];

// â”€â”€â”€ Helper: build CSS-variable map for all 5 breakpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const buildCssVars = ( attrs ) => {
	const { responsivePadding: rp, responsiveCardWidth: rcw, responsiveCardGap: rcg, responsiveTrackPaddingX: rtx, sectionBackground } = attrs;

	return {
		backgroundColor: sectionBackground,
		// Section padding
		'--hsc-pt-mobile':       rp?.mobile?.top      || '40px',
		'--hsc-pr-mobile':       rp?.mobile?.right     || '0px',
		'--hsc-pb-mobile':       rp?.mobile?.bottom    || '40px',
		'--hsc-pl-mobile':       rp?.mobile?.left      || '0px',
		'--hsc-pt-tablet':       rp?.tablet?.top       || '60px',
		'--hsc-pr-tablet':       rp?.tablet?.right     || '0px',
		'--hsc-pb-tablet':       rp?.tablet?.bottom    || '60px',
		'--hsc-pl-tablet':       rp?.tablet?.left      || '0px',
		'--hsc-pt-small-laptop': rp?.smallLaptop?.top  || '80px',
		'--hsc-pr-small-laptop': rp?.smallLaptop?.right || '0px',
		'--hsc-pb-small-laptop': rp?.smallLaptop?.bottom || '80px',
		'--hsc-pl-small-laptop': rp?.smallLaptop?.left  || '0px',
		'--hsc-pt-desktop':      rp?.desktop?.top      || '80px',
		'--hsc-pr-desktop':      rp?.desktop?.right    || '0px',
		'--hsc-pb-desktop':      rp?.desktop?.bottom   || '80px',
		'--hsc-pl-desktop':      rp?.desktop?.left     || '0px',
		'--hsc-pt-big-desktop':  rp?.bigDesktop?.top   || '80px',
		'--hsc-pr-big-desktop':  rp?.bigDesktop?.right  || '0px',
		'--hsc-pb-big-desktop':  rp?.bigDesktop?.bottom || '80px',
		'--hsc-pl-big-desktop':  rp?.bigDesktop?.left   || '0px',
		// Card width
		'--hsc-card-width-mobile':       rcw?.mobile      || '85vw',
		'--hsc-card-width-tablet':       rcw?.tablet      || '60vw',
		'--hsc-card-width-small-laptop': rcw?.smallLaptop || '480px',
		'--hsc-card-width-desktop':      rcw?.desktop     || '560px',
		'--hsc-card-width-big-desktop':  rcw?.bigDesktop  || '600px',
		// Card gap
		'--hsc-gap-mobile':       rcg?.mobile      || '16px',
		'--hsc-gap-tablet':       rcg?.tablet      || '20px',
		'--hsc-gap-small-laptop': rcg?.smallLaptop || '24px',
		'--hsc-gap-desktop':      rcg?.desktop     || '24px',
		'--hsc-gap-big-desktop':  rcg?.bigDesktop  || '32px',
		// Track horizontal padding
		'--hsc-track-px-mobile':       rtx?.mobile      || '16px',
		'--hsc-track-px-tablet':       rtx?.tablet      || '30px',
		'--hsc-track-px-small-laptop': rtx?.smallLaptop || '60px',
		'--hsc-track-px-desktop':      rtx?.desktop     || '80px',
		'--hsc-track-px-big-desktop':  rtx?.bigDesktop  || '80px',
	};
};

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FONT_WEIGHTS = [
	{ label: __( '100 â€” Thin',        'adaire-blocks' ), value: '100' },
	{ label: __( '200 â€” Extra Light', 'adaire-blocks' ), value: '200' },
	{ label: __( '300 â€” Light',       'adaire-blocks' ), value: '300' },
	{ label: __( '400 â€” Regular',     'adaire-blocks' ), value: '400' },
	{ label: __( '500 â€” Medium',      'adaire-blocks' ), value: '500' },
	{ label: __( '600 â€” Semi Bold',   'adaire-blocks' ), value: '600' },
	{ label: __( '700 â€” Bold',        'adaire-blocks' ), value: '700' },
	{ label: __( '800 â€” Extra Bold',  'adaire-blocks' ), value: '800' },
	{ label: __( '900 â€” Black',       'adaire-blocks' ), value: '900' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		blockId,
		sectionBackground,
		scrubSpeed,
		responsivePadding,
		responsiveCardWidth,
		responsiveCardGap,
		responsiveTrackPaddingX,
		headingText,
		headingFontSize,
		headingColor,
		headingFontWeight,
	} = attributes;

	const [ deviceType, setDeviceType ] = useState( 'desktop' );

	// Keep a ref so updateResponsive never captures stale attrs
	const attributesRef = useRef( attributes );
	useEffect( () => { attributesRef.current = attributes; }, [ attributes ] );

	useEffect( () => {
		if ( ! blockId ) {
			setAttributes( { blockId: `hsc-${ clientId.slice( 0, 8 ) }` } );
		}
	}, [] );

	const updateResponsive = useCallback( ( attr, bp, value ) => {
		setAttributes( {
			[ attr ]: {
				...( attributesRef.current[ attr ] || {} ),
				[ bp ]: value,
			},
		} );
	}, [ setAttributes ] );

	const blockProps = useBlockProps( {
		className: 'adaire-hsc',
		style: buildCssVars( attributes ),
	} );

	// Editor track â€” horizontally scrollable, cards shown at configured width
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'adaire-hsc__track adaire-hsc__track--editor',
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
			orientation: 'horizontal',
		}
	);

	const activeLabel = BREAKPOINTS.find( ( b ) => b.name === deviceType )?.label;

	return (
		<>
			<InspectorControls>
				{ /* â”€â”€ Device toggle (project standard) â”€â”€ */ }
				<div className="adaire-device-toggle">
					<p className="adaire-device-toggle-label">
						{ __( 'Device View', 'adaire-blocks' ) }
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
						{ __( 'Configuring:', 'adaire-blocks' ) }{ ' ' }
						<strong>{ activeLabel }</strong>
					</p>
				</div>

				{ /* â”€â”€ Layout Settings â”€â”€ */ }
				<PanelBody
					title={ __( 'Layout Settings', 'adaire-blocks' ) }
					initialOpen={ true }
				>
					<BoxControl
						label={ `${ __( 'Section Padding', 'adaire-blocks' ) } (${ activeLabel })` }
						values={ responsivePadding?.[ deviceType ] || {} }
						onChange={ ( val ) => updateResponsive( 'responsivePadding', deviceType, val ) }
					/>

					<UnitControl
						label={ `${ __( 'Card Width', 'adaire-blocks' ) } (${ activeLabel })` }
						value={ responsiveCardWidth?.[ deviceType ] || '560px' }
						onChange={ ( val ) => updateResponsive( 'responsiveCardWidth', deviceType, val ) }
						help={ __( 'Width of each card. Supports px, vw, %', 'adaire-blocks' ) }
					/>

					<UnitControl
						label={ `${ __( 'Card Gap', 'adaire-blocks' ) } (${ activeLabel })` }
						value={ responsiveCardGap?.[ deviceType ] || '24px' }
						onChange={ ( val ) => updateResponsive( 'responsiveCardGap', deviceType, val ) }
					/>

					<UnitControl
						label={ `${ __( 'Track Side Padding', 'adaire-blocks' ) } (${ activeLabel })` }
						value={ responsiveTrackPaddingX?.[ deviceType ] || '80px' }
						onChange={ ( val ) => updateResponsive( 'responsiveTrackPaddingX', deviceType, val ) }
						help={ __( 'Left/right breathing room before first and after last card.', 'adaire-blocks' ) }
					/>
				</PanelBody>

				{ /* â”€â”€ Animation â”€â”€ */ }
				<PanelBody
					title={ __( 'Animation', 'adaire-blocks' ) }
					initialOpen={ false }
				>
					<RangeControl
						label={ __( 'Scrub Speed', 'adaire-blocks' ) }
						value={ scrubSpeed }
						onChange={ ( val ) => setAttributes( { scrubSpeed: val } ) }
						min={ 0.1 }
						max={ 5 }
						step={ 0.1 }
						help={ __( 'Lower = snappier. Higher = more lag/smoothness.', 'adaire-blocks' ) }
					/>
				</PanelBody>

				{ /* â”€â”€ Heading Typography â”€â”€ */ }
				<PanelBody
					title={ __( 'Heading Typography', 'adaire-blocks' ) }
					initialOpen={ false }
				>
					<UnitControl
						label={ __( 'Font Size', 'adaire-blocks' ) }
						value={ headingFontSize }
						onChange={ ( val ) => setAttributes( { headingFontSize: val || '2.5rem' } ) }
						help={ __( 'Supports rem, px, em, vw', 'adaire-blocks' ) }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'adaire-blocks' ) }
						value={ headingFontWeight }
						options={ FONT_WEIGHTS }
						onChange={ ( val ) => setAttributes( { headingFontWeight: val } ) }
					/>
				</PanelBody>

			{ /* â”€â”€ Colors â”€â”€ */ }
				<PanelColorSettings
					title={ __( 'Colors', 'adaire-blocks' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							value: sectionBackground,
							onChange: ( val ) => setAttributes( { sectionBackground: val || '#f8f8f8' } ),
							label: __( 'Section Background', 'adaire-blocks' ),
						},
						{
							value: headingColor,
							onChange: ( val ) => setAttributes( { headingColor: val || '#111111' } ),
							label: __( 'Heading Color', 'adaire-blocks' ),
						},
					] }
				/>
			</InspectorControls>

		<div { ...blockProps }>
			<Notice
				status="info"
				isDismissible={ false }
				className="adaire-hsc__editor-notice"
			>
				{ __( 'Horizontal Scroll Carousel â€” scroll the cards below to preview. Scroll animation only runs on the frontend.', 'adaire-blocks' ) }
			</Notice>
			<RichText
				tagName="h2"
				className="adaire-hsc__heading"
				value={ headingText }
				onChange={ ( val ) => setAttributes( { headingText: val } ) }
				placeholder={ __( 'Section headingâ€¦', 'adaire-blocks' ) }
				style={ {
					fontSize:   headingFontSize,
					color:      headingColor,
					fontWeight: headingFontWeight,
				} }
			/>
			<div { ...innerBlocksProps } />
		</div>
		</>
	);
}



