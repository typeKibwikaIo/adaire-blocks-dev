/**
 * Timeline (timeline-block) deprecations — most recent first.
 *
 * v1  Frozen copy of the save() that shipped before ADAB-010 added full
 *     typography controls (font size, font weight, line-height, letter-
 *     spacing, text-transform) for every text role, plus a Font Family
 *     control — unconditionally, for every instance, regardless of whether
 *     the user ever opens the new "Typography" panel. Posts saved before
 *     that change don't have those custom properties in their stored markup,
 *     so re-running the *current* save() against them would produce a style
 *     attribute with extra declarations that don't match what's stored, and
 *     Gutenberg would flag them as invalid content. No attribute schema
 *     changed shape (the new attributes are purely additive with safe
 *     defaults that reproduce the original hardcoded SCSS values), so
 *     `migrate` is a no-op identity function and this entry doesn't need its
 *     own `attributes` key (Gutenberg falls back to the current block.json
 *     attributes when parsing a deprecated entry that omits one).
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';
import { ICON_SVGS } from './icons';

const deprecatedV1 = {
	migrate( attributes ) {
		return attributes;
	},

	save( { attributes: a } ) {
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
	},
};

export default [ deprecatedV1 ];
