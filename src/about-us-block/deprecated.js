/**
 * About Us (about-us-block) deprecations — most recent first.
 *
 * v2  Frozen copy of the save() that shipped after line-height/letter-
 *     spacing/text-transform were added (v1 below) but before ADAB-010's
 *     Font Family control added a `--ab-font-family` custom property to
 *     every instance unconditionally. Same reasoning as v1: purely additive
 *     attribute with a safe default, so `migrate` is a no-op identity
 *     function.
 *
 * v1  Frozen copy of the save() that shipped before ADAB-010 added full
 *     typography controls (line-height, letter-spacing, text-transform)
 *     for every text role — unconditionally, for every instance, regardless
 *     of whether the user ever opens the new "Typography" panel. Posts saved
 *     before that change don't have those custom properties in their stored
 *     markup, so re-running the *current* save() against them would produce
 *     a style attribute with extra declarations that don't match what's
 *     stored, and Gutenberg would flag them as invalid content. No attribute
 *     schema changed shape (the new attributes are purely additive with safe
 *     defaults that reproduce the original hardcoded SCSS values), so
 *     `migrate` is a no-op identity function and this entry doesn't need its
 *     own `attributes` key (Gutenberg falls back to the current block.json
 *     attributes when parsing a deprecated entry that omits one).
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

const deprecatedV2 = {
	migrate( attributes ) {
		return attributes;
	},

	save( { attributes: a } ) {
		const blockProps = useBlockProps.save( {
			className: 'adaire-about',
			style: {
				'--ab-bg'     : a.backgroundColor || '#ffffff',
				'--ab-text'   : a.textColor       || '#6366f1',
				'--ab-muted'  : a.mutedColor      || 'rgba(99,102,241,0.65)',
				'--ab-divider': a.dividerColor    || 'rgba(99,102,241,0.15)',
				backgroundColor: a.backgroundColor || '#ffffff',
				paddingTop    : `${ a.paddingTop    ?? 64 }px`,
				paddingBottom : `${ a.paddingBottom ?? 64 }px`,
				color         : a.textColor       || '#6366f1',

				'--ab-heading-line-height'    : a.headingLineHeight    || '1.0',
				'--ab-heading-letter-spacing' : a.headingLetterSpacing || '-0.03em',
				'--ab-heading-text-transform' : a.headingTextTransform || 'none',

				'--ab-tagline-line-height'    : a.taglineLineHeight    || '1.65',
				'--ab-tagline-letter-spacing' : a.taglineLetterSpacing || 'normal',
				'--ab-tagline-text-transform' : a.taglineTextTransform || 'none',

				'--ab-mission-line-height'    : a.missionLineHeight    || '1.75',
				'--ab-mission-letter-spacing' : a.missionLetterSpacing || 'normal',
				'--ab-mission-text-transform' : a.missionTextTransform || 'none',

				'--ab-statement-line-height'    : a.statementLineHeight    || '1.38',
				'--ab-statement-letter-spacing' : a.statementLetterSpacing || 'normal',
				'--ab-statement-text-transform' : a.statementTextTransform || 'none',

				'--ab-caption-line-height'    : a.captionLineHeight    || '1.72',
				'--ab-caption-letter-spacing' : a.captionLetterSpacing || 'normal',
				'--ab-caption-text-transform' : a.captionTextTransform || 'none',

				'--ab-body-line-height'    : a.bodyLineHeight    || '1.8',
				'--ab-body-letter-spacing' : a.bodyLetterSpacing || 'normal',
				'--ab-body-text-transform' : a.bodyTextTransform || 'none',

				'--ab-closing-line-height'    : a.closingLineHeight    || '1.12',
				'--ab-closing-letter-spacing' : a.closingLetterSpacing || '-0.02em',
				'--ab-closing-text-transform' : a.closingTextTransform || 'none',
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
	},
};

const deprecatedV1 = {
	migrate( attributes ) {
		return attributes;
	},

	save( { attributes: a } ) {
		const blockProps = useBlockProps.save( {
			className: 'adaire-about',
			style: {
				'--ab-bg'     : a.backgroundColor || '#ffffff',
				'--ab-text'   : a.textColor       || '#6366f1',
				'--ab-muted'  : a.mutedColor      || 'rgba(99,102,241,0.65)',
				'--ab-divider': a.dividerColor    || 'rgba(99,102,241,0.15)',
				backgroundColor: a.backgroundColor || '#ffffff',
				paddingTop    : `${ a.paddingTop    ?? 64 }px`,
				paddingBottom : `${ a.paddingBottom ?? 64 }px`,
				color         : a.textColor       || '#6366f1',
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
	},
};

export default [ deprecatedV2, deprecatedV1 ];
