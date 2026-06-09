import { useBlockProps, InnerBlocks, RichText } from '@wordpress/block-editor';

// Mirrors buildCssVars from edit.js â€” keeps save output in sync.
const buildCssVars = ( attrs ) => {
	const { responsivePadding: rp, responsiveCardWidth: rcw, responsiveCardGap: rcg, responsiveTrackPaddingX: rtx, sectionBackground } = attrs;

	return {
		backgroundColor: sectionBackground,
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
		'--hsc-card-width-mobile':       rcw?.mobile      || '85vw',
		'--hsc-card-width-tablet':       rcw?.tablet      || '60vw',
		'--hsc-card-width-small-laptop': rcw?.smallLaptop || '480px',
		'--hsc-card-width-desktop':      rcw?.desktop     || '560px',
		'--hsc-card-width-big-desktop':  rcw?.bigDesktop  || '600px',
		'--hsc-gap-mobile':       rcg?.mobile      || '16px',
		'--hsc-gap-tablet':       rcg?.tablet      || '20px',
		'--hsc-gap-small-laptop': rcg?.smallLaptop || '24px',
		'--hsc-gap-desktop':      rcg?.desktop     || '24px',
		'--hsc-gap-big-desktop':  rcg?.bigDesktop  || '32px',
		'--hsc-track-px-mobile':       rtx?.mobile      || '16px',
		'--hsc-track-px-tablet':       rtx?.tablet      || '30px',
		'--hsc-track-px-small-laptop': rtx?.smallLaptop || '60px',
		'--hsc-track-px-desktop':      rtx?.desktop     || '80px',
		'--hsc-track-px-big-desktop':  rtx?.bigDesktop  || '80px',
	};
};

export default function save( { attributes } ) {
	const {
		blockId,
		scrubSpeed,
		headingText,
		headingFontSize,
		headingColor,
		headingFontWeight,
	} = attributes;

	const blockProps = useBlockProps.save( {
		className: 'adaire-hsc',
		'data-block-id': blockId,
		'data-scrub': scrubSpeed,
		style: buildCssVars( attributes ),
	} );

	return (
		<div { ...blockProps }>
			{ headingText && (
				<RichText.Content
					tagName="h2"
					className="adaire-hsc__heading"
					value={ headingText }
					style={ {
						fontSize:   headingFontSize,
						color:      headingColor,
						fontWeight: headingFontWeight,
					} }
				/>
			) }
			<div className="adaire-hsc__track">
				<InnerBlocks.Content />
			</div>
		</div>
	);
}



