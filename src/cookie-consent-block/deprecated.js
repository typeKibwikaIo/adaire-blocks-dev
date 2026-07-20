/**
 * Cookie Banner block deprecations — most recent first.
 *
 * v1  Frozen copy of the static save() that shipped before this block became
 *     a dynamic block (block.json "render": "file:./render.php"). Categories
 *     came from the block's own `categories` attribute back then; the new
 *     render.php always reads the site-wide list from the Cookie Categories
 *     admin page instead (see admin/cookie-categories-page.php), so any
 *     already-saved `categories` value is preserved for validation but no
 *     longer affects frontend output. migrate() is a no-op since the
 *     attribute set itself hasn't changed, only how the frontend uses it.
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

const CookieIcon = () => (
	<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M12 3a9 9 0 1 0 9 9c0-.34-.02-.67-.06-1a2.5 2.5 0 0 1-3.44-2.94A2.5 2.5 0 0 1 15 4.6 9 9 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
		<circle cx="9" cy="10" r="1" fill="currentColor" />
		<circle cx="13" cy="8.5" r="1" fill="currentColor" />
		<circle cx="15.5" cy="13" r="1" fill="currentColor" />
		<circle cx="10" cy="14.5" r="1" fill="currentColor" />
	</svg>
);

const SlidersIcon = () => (
	<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M4 7h9M17 7h3M4 17h3M11 17h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		<circle cx="14" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
		<circle cx="8" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
	</svg>
);

function responsiveVarsV1( obj, name, fallbackUnit = 'px' ) {
	const d = obj?.desktop ?? {};
	const t = obj?.tablet ?? d;
	const m = obj?.mobile ?? t;
	return {
		[ `--ccb-${ name }` ]: `${ d.value ?? 0 }${ d.unit || fallbackUnit }`,
		[ `--ccb-${ name }-tablet` ]: `${ t.value ?? d.value ?? 0 }${ t.unit || d.unit || fallbackUnit }`,
		[ `--ccb-${ name }-mobile` ]: `${ m.value ?? t.value ?? d.value ?? 0 }${ m.unit || t.unit || d.unit || fallbackUnit }`,
	};
}

function getStyleVarsV1( a ) {
	return {
		'--ccb-bg': a.backgroundColor || '#ffffff',
		'--ccb-text': a.textColor || '#5f6368',
		'--ccb-heading': a.headingColor || '#202124',
		'--ccb-accent': a.accentColor || '#1a73e8',
		'--ccb-btn-text': a.primaryButtonTextColor || '#ffffff',
		'--ccb-btn2-bg': a.secondaryButtonBg || 'transparent',
		'--ccb-btn2-text': a.secondaryButtonTextColor || '#1a73e8',
		'--ccb-border-color': a.borderColor || '#e5e7eb',
		'--ccb-border-width': `${ a.showBorder ? ( a.borderWidth ?? 1 ) : 0 }px`,
		'--ccb-radius': `${ a.borderRadius ?? 10 }px`,
		'--ccb-gap': `${ a.gap ?? 14 }px`,
		'--ccb-max-width': `${ a.maxWidth ?? 440 }px`,
		'--ccb-font-family': a.fontFamily || 'inherit',
		'--ccb-font-weight': a.fontWeight || '400',
		'--ccb-line-height': a.lineHeight || '1.6',
		'--ccb-anim-duration': `${ a.animationDuration ?? 400 }ms`,
		'--ccb-overlay': a.overlayColor || 'rgba(15,23,42,0.55)',
		'--ccb-z-index': a.zIndex ?? 999999,
		...responsiveVarsV1( a.headingFontSize, 'heading-fs' ),
		...responsiveVarsV1( a.bodyFontSize, 'body-fs' ),
		...responsiveVarsV1( a.padding, 'padding' ),
	};
}

const deprecatedV1 = {
	migrate( attributes ) {
		return attributes;
	},

	save( { attributes: a } ) {
		const blockProps = useBlockProps.save( {
			className: 'adaire-cookie-banner',
			style: getStyleVarsV1( a ),
			'data-layout': a.layoutType || 'bar-bottom',
			'data-density': a.displayDensity || 'expanded',
			'data-align': a.alignment || 'center',
			'data-shadow': a.showShadow ? ( a.shadowIntensity || 'medium' ) : 'none',
			'data-shape': a.buttonShape || 'pill',
			'data-btn-size': a.buttonSize || 'md',
			'data-anim': a.entranceAnimation || 'none',
			'data-width': a.bannerWidth || 'full',
			'data-consent-version': a.consentVersion || '1',
			'data-consent-days': a.consentExpirationDays ?? 180,
			'data-auto-hide': a.autoHide ? '1' : '0',
			'data-auto-hide-delay': a.autoHideDelay ?? 300,
			'data-google-consent-mode': a.googleConsentMode ? '1' : '0',
			'data-block-scripts': a.blockScriptsUntilConsent ? '1' : '0',
			'data-categories': JSON.stringify(
				( a.categories || [] ).map( ( c ) => ( {
					key: c.key,
					required: !! c.required,
					defaultChecked: !! c.defaultChecked,
				} ) )
			),
		} );

		const categories = a.categories || [];

		return (
			<div { ...blockProps }>
				{ a.showOverlay && <div className="adaire-cookie-banner__overlay" data-cookie-action="dismiss-overlay" /> }

				<div
					className="adaire-cookie-banner__panel"
					role="dialog"
					aria-live="polite"
					aria-label="Cookie consent"
				>
					{ a.closeButtonEnabled && (
						<button type="button" className="adaire-cookie-banner__close" data-cookie-action="dismiss" aria-label="Close">×</button>
					) }

					<div className="adaire-cookie-banner__header">
						{ a.showIcon && <span className="adaire-cookie-banner__icon" aria-hidden="true"><CookieIcon /></span> }
						<RichText.Content tagName="p" className="adaire-cookie-banner__title" value={ a.bannerTitle } />
					</div>

					<RichText.Content tagName="p" className="adaire-cookie-banner__description" value={ a.description } />

					<div className="adaire-cookie-banner__prefs" hidden>
						{ categories.map( ( cat ) => (
							<label className="adaire-cookie-banner__pref-row" key={ cat.key }>
								<input
									type="checkbox"
									data-category={ cat.key }
									defaultChecked={ !! cat.defaultChecked }
									disabled={ !! cat.required }
								/>
								<span>
									<strong>{ cat.label }</strong>{ cat.required ? ' (always active)' : '' }
									{ cat.description ? <em className="adaire-cookie-banner__cat-desc">{ cat.description }</em> : null }
								</span>
							</label>
						) ) }
						<div className="adaire-cookie-banner__prefs-actions">
							<button type="button" className="adaire-cookie-banner__btn adaire-cookie-banner__btn--primary" data-cookie-action="save-prefs">
								{ a.savePreferencesText }
							</button>
						</div>
					</div>

					{ a.additionalInfo && (
						<RichText.Content tagName="p" className="adaire-cookie-banner__additional" value={ a.additionalInfo } />
					) }

					{ ( a.cookiePolicyUrl || a.privacyPolicyUrl || a.termsUrl ) && (
						<div className="adaire-cookie-banner__links">
							{ !! a.cookiePolicyUrl && <a href={ a.cookiePolicyUrl }>{ a.cookiePolicyText }</a> }
							{ !! a.privacyPolicyUrl && <a href={ a.privacyPolicyUrl }>{ a.privacyPolicyText }</a> }
							{ !! a.termsUrl && <a href={ a.termsUrl }>{ a.termsText }</a> }
						</div>
					) }

					<div className="adaire-cookie-banner__actions">
						<button type="button" className="adaire-cookie-banner__btn adaire-cookie-banner__btn--ghost" data-cookie-action="manage">
							{ a.manageText }
						</button>
						<div className="adaire-cookie-banner__actions-primary">
							<button type="button" className="adaire-cookie-banner__btn adaire-cookie-banner__btn--outline" data-cookie-action="reject">
								{ a.rejectAllText }
							</button>
							<button type="button" className="adaire-cookie-banner__btn adaire-cookie-banner__btn--primary" data-cookie-action="accept">
								{ a.acceptAllText }
							</button>
						</div>
					</div>
				</div>

				{ a.reopenButtonEnabled && (
					<button
						type="button"
						className="adaire-cookie-banner__reopen"
						data-cookie-action="reopen"
						data-reopen-position={ a.reopenButtonPosition || 'bottom-left' }
						aria-label={ a.reopenButtonText }
					>
						<SlidersIcon /> { a.reopenButtonText }
					</button>
				) }
			</div>
		);
	},
};

// Most recent first
export default [ deprecatedV1 ];
