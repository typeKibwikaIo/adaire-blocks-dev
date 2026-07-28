import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	PanelColorSettings,
	useInnerBlocksProps,
	RichText,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	__experimentalUnitControl as UnitControl,
	__experimentalBoxControl as BoxControl,
	Notice,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher, { FIVE_TIERS } from '../components/DeviceSwitcher';
import useResponsiveAttribute from '../components/useResponsiveAttribute';
import { FONT_WEIGHTS } from '../components/FontWeights';

//  ”€ ”€ ”€ Inner-blocks template  ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€ ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// Per-tier fallbacks for the Inspector's UnitControls below — kept in sync
// with block.json's schema defaults (and with buildCssVars' own fallbacks)
// so switching device tiers always displays that tier's real default
// instead of silently falling back to a single (desktop) value.
const CARD_WIDTH_DEFAULTS = { mobile: '85vw', tablet: '60vw', smallLaptop: '480px', desktop: '560px', bigDesktop: '600px' };
const CARD_GAP_DEFAULTS = { mobile: '16px', tablet: '20px', smallLaptop: '24px', desktop: '24px', bigDesktop: '32px' };
const TRACK_PADDING_DEFAULTS = { mobile: '16px', tablet: '30px', smallLaptop: '60px', desktop: '80px', bigDesktop: '80px' };

export default function Edit( { attributes, setAttributes } ) {
	const {
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

	const updateResponsive = useResponsiveAttribute( attributes, setAttributes );

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

	const activeLabel = FIVE_TIERS.find( ( t ) => t.key === deviceType )?.label;

	return (
		<>
			<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
				{ /* â”€â”€ Layout Settings â”€â”€ */ }
				<PanelBody
					section="layout"
					title={ __( 'Layout Settings', 'adaire-blocks' ) }
					initialOpen={ true }
				>
					<DeviceSwitcher
						deviceType={ deviceType }
						setDeviceType={ setDeviceType }
						tiers={ FIVE_TIERS }
						label={ __( 'Configuring', 'adaire-blocks' ) }
					/>

					<BoxControl
						label={ `${ __( 'Section Padding', 'adaire-blocks' ) } (${ activeLabel })` }
						sides={ [ 'top', 'bottom' ] }
						values={ responsivePadding?.[ deviceType ] || {} }
						onChange={ ( val ) => updateResponsive( 'responsivePadding', deviceType, val ) }
						help={ __( 'Left/right spacing is controlled separately by Track Side Padding, below.', 'adaire-blocks' ) }
					/>

					<UnitControl
						label={ `${ __( 'Card Width', 'adaire-blocks' ) } (${ activeLabel })` }
						value={ responsiveCardWidth?.[ deviceType ] || CARD_WIDTH_DEFAULTS[ deviceType ] }
						onChange={ ( val ) => updateResponsive( 'responsiveCardWidth', deviceType, val ) }
						help={ __( 'Width of each card. Supports px, vw, %', 'adaire-blocks' ) }
					/>

					<UnitControl
						label={ `${ __( 'Card Gap', 'adaire-blocks' ) } (${ activeLabel })` }
						value={ responsiveCardGap?.[ deviceType ] || CARD_GAP_DEFAULTS[ deviceType ] }
						onChange={ ( val ) => updateResponsive( 'responsiveCardGap', deviceType, val ) }
					/>

					<UnitControl
						label={ `${ __( 'Track Side Padding', 'adaire-blocks' ) } (${ activeLabel })` }
						value={ responsiveTrackPaddingX?.[ deviceType ] || TRACK_PADDING_DEFAULTS[ deviceType ] }
						onChange={ ( val ) => updateResponsive( 'responsiveTrackPaddingX', deviceType, val ) }
						help={ __( 'Left/right breathing room before first and after last card.', 'adaire-blocks' ) }
					/>
				</PanelBody>

				{ /* â”€â”€ Animation â”€â”€ */ }
				<PanelBody
					section="style"
					priority="medium"
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
					section="style"
					priority="high"
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

			{ /* â”€ ”€ Colors  ”€ ”€ */ }
				<PanelColorSettings
					section="style"
					priority="high"
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
			</InspectorTabs>

		<div { ...blockProps }>
			<Notice
				status="info"
				isDismissible={ false }
				className="adaire-hsc__editor-notice"
			>
				{ __( 'Horizontal Scroll Carousel scroll the cards below to preview. Scroll animation only runs on the frontend.', 'adaire-blocks' ) }
			</Notice>
			<RichText
				tagName="h2"
				className="adaire-hsc__heading"
				value={ headingText }
				onChange={ ( val ) => setAttributes( { headingText: val } ) }
				placeholder={ __( 'Section heading...', 'adaire-blocks' ) }
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



