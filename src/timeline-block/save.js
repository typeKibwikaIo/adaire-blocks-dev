import { RichText, useBlockProps } from '@wordpress/block-editor';
import { ICON_SVGS } from './icons';

export default function save( { attributes: a } ) {
	const {
		items        = [],
		orientation  = 'vertical',
		showArrows   = true,
		showConnector= true,
	} = a;

	const nodeSize = a.nodeSize || 52;

	const blockProps = useBlockProps.save( {
		className: `adaire-timeline is-${ orientation }`,
		style: {
			'--tl-bg'       : a.backgroundColor  || '#0a1628',
			'--tl-accent'   : a.accentColor      || '#00bcd4',
			'--tl-eyebrow'  : a.eyebrowColor     || a.accentColor || '#00bcd4',
			'--tl-text'     : a.textColor        || '#ffffff',
			'--tl-desc'     : a.descriptionColor || 'rgba(255,255,255,0.65)',
			'--tl-line'     : a.lineColor        || '#1e3a5f',
			'--tl-node-size': `${ nodeSize }px`,
			backgroundColor : a.backgroundColor  || '#0a1628',
			paddingTop      : `${ a.paddingTop    ?? 80 }px`,
			paddingBottom   : `${ a.paddingBottom ?? 80 }px`,
			marginTop       : `${ a.marginTop     ?? 0  }px`,
			marginBottom    : `${ a.marginBottom  ?? 0  }px`,
			color           : a.textColor        || '#ffffff',

			'--tl-font-family' : a.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif",

			'--tl-eyebrow-font-size'      : a.eyebrowFontSize      || '11px',
			'--tl-eyebrow-font-weight'    : a.eyebrowFontWeight    || '700',
			'--tl-eyebrow-line-height'    : a.eyebrowLineHeight    || 'normal',
			'--tl-eyebrow-letter-spacing' : a.eyebrowLetterSpacing || '0.14em',
			'--tl-eyebrow-text-transform' : a.eyebrowTextTransform || 'uppercase',

			'--tl-section-title-font-size'      : a.sectionTitleFontSize      || 'clamp(26px, 3.5vw, 42px)',
			'--tl-section-title-font-weight'    : a.sectionTitleFontWeight    || '700',
			'--tl-section-title-line-height'    : a.sectionTitleLineHeight    || '1.18',
			'--tl-section-title-letter-spacing' : a.sectionTitleLetterSpacing || 'normal',
			'--tl-section-title-text-transform' : a.sectionTitleTextTransform || 'none',

			'--tl-section-desc-font-size'      : a.sectionDescFontSize      || '16px',
			'--tl-section-desc-font-weight'    : a.sectionDescFontWeight    || '400',
			'--tl-section-desc-line-height'    : a.sectionDescLineHeight    || '1.75',
			'--tl-section-desc-letter-spacing' : a.sectionDescLetterSpacing || 'normal',
			'--tl-section-desc-text-transform' : a.sectionDescTextTransform || 'none',

			'--tl-item-title-font-size'      : a.itemTitleFontSize      || '18px',
			'--tl-item-title-font-weight'    : a.itemTitleFontWeight    || '700',
			'--tl-item-title-line-height'    : a.itemTitleLineHeight    || '1.3',
			'--tl-item-title-letter-spacing' : a.itemTitleLetterSpacing || 'normal',
			'--tl-item-title-text-transform' : a.itemTitleTextTransform || 'none',

			'--tl-item-desc-font-size'      : a.itemDescFontSize      || '15px',
			'--tl-item-desc-font-weight'    : a.itemDescFontWeight    || '400',
			'--tl-item-desc-line-height'    : a.itemDescLineHeight    || '1.75',
			'--tl-item-desc-letter-spacing' : a.itemDescLetterSpacing || 'normal',
			'--tl-item-desc-text-transform' : a.itemDescTextTransform || 'none',
		},
	} );

	return (
		<section { ...blockProps }>
			{ /* Section header */ }
			<div className="adaire-timeline__header">
				<RichText.Content
					tagName="p"
					className="adaire-timeline__eyebrow"
					value={ a.eyebrow }
				/>
				<RichText.Content
					tagName="h2"
					className="adaire-timeline__section-title"
					value={ a.sectionTitle }
				/>
				{ a.sectionDescription && (
					<RichText.Content
						tagName="p"
						className="adaire-timeline__section-desc"
						value={ a.sectionDescription }
					/>
				) }
			</div>

			{ /* Track */ }
			<div className="adaire-timeline__track">
				{ showConnector && <div className="adaire-timeline__line" /> }

				{ ( items || [] ).map( ( item, i ) => {
					const side = orientation === 'vertical'
						? ( i % 2 === 0 ? 'right' : 'left' )
						: 'bottom';

					const nodeEl = (
						<div
							className="adaire-timeline__node"
							style={ { width: nodeSize, height: nodeSize } }
						>
							{ ICON_SVGS[ item.icon ] || ICON_SVGS.shield }
						</div>
					);

					const contentEl = (
						<div className="adaire-timeline__content">
							<RichText.Content
								tagName="h3"
								className="adaire-timeline__item-title"
								value={ item.title }
							/>
							<RichText.Content
								tagName="p"
								className="adaire-timeline__item-desc"
								value={ item.description }
							/>
						</div>
					);

					if ( orientation === 'horizontal' ) {
						return (
							<div key={ i } className="adaire-timeline__item">
								{ nodeEl }
								{ contentEl }
							</div>
						);
					}

					// Vertical alternating
					return (
						<div key={ i } className={ `adaire-timeline__item is-${ side }` }>
							<div className="adaire-timeline__slot">
								{ side === 'left' && contentEl }
							</div>

							<div className="adaire-timeline__center">
								{ showArrows && (
									<span
										className={ `adaire-timeline__arrow${ side === 'left' ? '' : ' is-hidden' }` }
									>
										›
									</span>
								) }
								{ nodeEl }
								{ showArrows && (
									<span
										className={ `adaire-timeline__arrow${ side === 'right' ? '' : ' is-hidden' }` }
									>
										‹
									</span>
								) }
							</div>

							<div className="adaire-timeline__slot">
								{ side === 'right' && contentEl }
							</div>
						</div>
					);
				} ) }
			</div>
		</section>
	);
}
