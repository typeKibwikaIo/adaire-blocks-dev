import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes: a } ) {
	const blockProps = useBlockProps.save( {
		className: 'adaire-about',
		style: {
			'--ab-bg'     : a.backgroundColor || '#0a0a0a',
			'--ab-text'   : a.textColor       || '#ffffff',
			'--ab-muted'  : a.mutedColor      || 'rgba(255,255,255,0.6)',
			'--ab-divider': a.dividerColor    || 'rgba(255,255,255,0.1)',
			backgroundColor: a.backgroundColor || '#0a0a0a',
			paddingTop    : `${ a.paddingTop    ?? 64 }px`,
			paddingBottom : `${ a.paddingBottom ?? 64 }px`,
			color         : a.textColor       || '#ffffff',
		},
	} );

	return (
		<section { ...blockProps }>

			{ /* 1 · Hero zone */ }
			<div className="adaire-about__hero">
				<div className="adaire-about__hero-copy">
					<RichText.Content tagName="h1" className="adaire-about__heading" value={ a.heading } />
					<RichText.Content tagName="p"  className="adaire-about__tagline" value={ a.tagline } />
					{ a.mission && (
						<RichText.Content tagName="p" className="adaire-about__mission" value={ a.mission } />
					) }
				</div>
				{ a.showScrollButton && (
					<div className="adaire-about__scroll-btn" aria-hidden="true">
						{ a.scrollButtonText || 'Scroll' }
					</div>
				) }
			</div>

			{ /* 2 · Statement zone */ }
			<div className="adaire-about__statement-zone">
				<RichText.Content tagName="p" className="adaire-about__statement" value={ a.statement } />
			</div>

			{ /* 3 · Media grid */ }
			<div className="adaire-about__media">
				<div className="adaire-about__zone-main-img">
					{ a.imageUrl1 && (
						<img className="adaire-about__img" src={ a.imageUrl1 } alt={ a.imageAlt1 || '' } loading="lazy" />
					) }
				</div>

				<div className="adaire-about__zone-caption">
					<RichText.Content tagName="p" className="adaire-about__caption" value={ a.caption } />
				</div>

				<div className="adaire-about__zone-body">
					<RichText.Content tagName="p" className="adaire-about__body" value={ a.bodyText } />
				</div>

				<div className="adaire-about__zone-sec-img">
					{ a.imageUrl2 && (
						<img className="adaire-about__img" src={ a.imageUrl2 } alt={ a.imageAlt2 || '' } loading="lazy" />
					) }
				</div>
			</div>

			{ /* 4 · Closing statement */ }
			<div className="adaire-about__closing-zone">
				<RichText.Content tagName="p" className="adaire-about__closing" value={ a.closingStatement } />
			</div>

		</section>
	);
}
