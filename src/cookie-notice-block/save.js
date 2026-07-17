import { RichText, useBlockProps } from '@wordpress/block-editor';

// Kept in sync with the matching icon in edit.js so the editor preview and
// the live "reopen" button that stays on screen after a decision never drift.
const CookieIcon = () => (
	<svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M12 3a9 9 0 1 0 9 9c0-.34-.02-.67-.06-1a2.5 2.5 0 0 1-3.44-2.94A2.5 2.5 0 0 1 15 4.6 9 9 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
		<circle cx="9" cy="10" r="1" fill="currentColor" />
		<circle cx="13" cy="8.5" r="1" fill="currentColor" />
		<circle cx="15.5" cy="13" r="1" fill="currentColor" />
		<circle cx="10" cy="14.5" r="1" fill="currentColor" />
	</svg>
);

export default function save( { attributes: a } ) {
	const blockProps = useBlockProps.save( {
		className: 'adaire-cookie-notice-block',
		'data-position': a.position || 'floating-bottom-right',
		'data-expiration-days': a.expirationDays ?? 365,
		'data-consent-version': a.consentVersion || '1',
	} );

	return (
		<div { ...blockProps }>
			<div className="adaire-cookie-notice-panel-wrap">
				<div
					className="adaire-cookie-notice"
					style={ {
						backgroundColor: a.backgroundColor,
						color: a.textColor,
						borderRadius: `${ a.borderRadius ?? 14 }px`,
					} }
					role="dialog"
					aria-live="polite"
					aria-label="Cookie consent"
				>
					<RichText.Content
						tagName="p"
						className="adaire-cookie-notice__message"
						value={ a.message }
					/>

					{ ( ( a.showPrivacyLink && !! a.privacyPolicyText && !! a.privacyPolicyUrl ) ||
						( a.showTermsLink && !! a.termsText && !! a.termsUrl ) ) && (
						<div className="adaire-cookie-notice__links">
							{ a.showPrivacyLink && !! a.privacyPolicyText && !! a.privacyPolicyUrl && (
								<a
									className="adaire-cookie-notice__privacy-link"
									style={ { color: a.linkColor } }
									href={ a.privacyPolicyUrl }
								>
									{ a.privacyPolicyText }
								</a>
							) }
							{ a.showTermsLink && !! a.termsText && !! a.termsUrl && (
								<a
									className="adaire-cookie-notice__privacy-link"
									style={ { color: a.linkColor } }
									href={ a.termsUrl }
								>
									{ a.termsText }
								</a>
							) }
						</div>
					) }

					<div className="adaire-cookie-notice__prefs" data-cookie-prefs>
						<label className="adaire-cookie-notice__pref-row">
							<span>{ a.necessaryLabel }</span>
							<input type="checkbox" checked disabled readOnly />
						</label>
						<label className="adaire-cookie-notice__pref-row">
							<span>{ a.preferencesLabel }</span>
							<input type="checkbox" data-cookie-category="preferences" />
						</label>
						<label className="adaire-cookie-notice__pref-row">
							<span>{ a.analyticsLabel }</span>
							<input type="checkbox" data-cookie-category="analytics" />
						</label>
						<label className="adaire-cookie-notice__pref-row">
							<span>{ a.marketingLabel }</span>
							<input type="checkbox" data-cookie-category="marketing" />
						</label>
						<button
							type="button"
							className="adaire-cookie-notice__btn adaire-cookie-notice__btn--accept adaire-cookie-notice__btn--save-prefs"
							style={ {
								backgroundColor: a.acceptButtonColor,
								color: a.acceptButtonTextColor,
							} }
							data-cookie-action="save-preferences"
						>
							{ a.savePreferencesText }
						</button>
					</div>

					<div className="adaire-cookie-notice__actions">
						{ a.showCustomize && (
							<button
								type="button"
								className="adaire-cookie-notice__btn adaire-cookie-notice__btn--customize"
								style={ { color: a.textColor } }
								data-cookie-action="customize"
							>
								{ a.customizeText }
							</button>
						) }
						<button
							type="button"
							className="adaire-cookie-notice__btn adaire-cookie-notice__btn--decline"
							style={ {
								backgroundColor: a.declineButtonColor,
								color: a.declineButtonTextColor,
								borderColor: a.declineButtonTextColor,
							} }
							data-cookie-action="decline"
						>
							{ a.declineText }
						</button>
						<button
							type="button"
							className="adaire-cookie-notice__btn adaire-cookie-notice__btn--accept"
							style={ {
								backgroundColor: a.acceptButtonColor,
								color: a.acceptButtonTextColor,
							} }
							data-cookie-action="accept"
						>
							{ a.acceptText }
						</button>
					</div>
				</div>
			</div>

			{ /* Stays on screen (hidden until a choice is made) so visitors can
			     reopen the notice later to review or change their decision. */ }
			<button
				type="button"
				className="adaire-cookie-notice__reopen"
				style={ {
					backgroundColor: a.acceptButtonColor,
					color: a.acceptButtonTextColor,
				} }
				data-cookie-action="reopen"
				aria-label="Cookie preferences"
			>
				<CookieIcon />
			</button>
		</div>
	);
}
