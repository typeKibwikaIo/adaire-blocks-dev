import { useBlockProps, RichText, useInnerBlocksProps } from '@wordpress/block-editor';

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Save â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function save( { attributes } ) {
	const {
		cardTitle,
		cardText,
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

	const boxShadow = buildBoxShadow(
		shadowType,
		shadowBlur,
		shadowSpread,
		shadowColor,
		shadowOpacity
	);
	const boxShadowHover = buildHoverBoxShadow(
		shadowType,
		shadowBlur,
		shadowSpread,
		shadowColor,
		shadowOpacity
	);

	const border = borderEnabled
		? `${ borderWidth }px ${ borderStyle } ${ borderColor }`
		: 'none';

	const blockProps = useBlockProps.save( {
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

	const buttonBlocksProps = useInnerBlocksProps.save( {
		className: 'adaire-hsc__card-cta',
		style: { marginTop: 0 },
	} );

	return (
		<div { ...blockProps }>
			<div
				className="adaire-hsc__card-inner"
				style={ { justifyContent: cardInnerJustify, gap: cardInnerGap } }
			>
				{ /* Left: text content + button */ }
				<div
					className="adaire-hsc__card-left"
					style={ { justifyContent: cardLeftJustify, gap: cardLeftGap } }
				>
					<RichText.Content
						tagName="h3"
						className="adaire-hsc__card-title"
						value={ cardTitle }
						style={ {
							color:      titleColor,
							fontSize:   titleFontSize,
							fontWeight: titleFontWeight,
						} }
					/>
					<RichText.Content
						tagName="p"
						className="adaire-hsc__card-text"
						value={ cardText }
						style={ {
							color:      textColor,
							fontSize:   textFontSize,
							fontWeight: textFontWeight,
						} }
					/>
					<div { ...buttonBlocksProps } />
				</div>

				{ /* Right: image â€” width driven by --hsc-img-w-* CSS vars */ }
				{ imageUrl && (
					<div className="adaire-hsc__card-right">
						<img
							src={ imageUrl }
							alt={ imageAlt || '' }
							className="adaire-hsc__card-image"
							loading="lazy"
						/>
					</div>
				) }
			</div>
		</div>
	);
}



