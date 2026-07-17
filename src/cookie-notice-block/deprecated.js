/**
 * Cookie Notice (cookie-notice-block) deprecations — most recent first.
 *
 * v2  Frozen copy of the save() that shipped before per-category consent
 *     (Necessary/Preferences/Analytics/Marketing toggles behind a
 *     "Customize" button) added a `data-consent-version` attribute plus a
 *     `.adaire-cookie-notice__prefs` panel to the block wrapper,
 *     unconditionally, for every instance. Posts saved before that change
 *     don't have that attribute or markup in their stored HTML, so
 *     re-running the *current* save() against them would produce different
 *     markup than what's stored, and Gutenberg would flag them as invalid
 *     content. The new attributes are purely additive with safe defaults
 *     (version "1", customize enabled with standard category labels), so
 *     `migrate` is a no-op identity function and this entry doesn't need
 *     its own `attributes` key (Gutenberg falls back to the current
 *     block.json attributes when parsing a deprecated entry that omits
 *     one).
 *
 * v1  Frozen copy of the save() that shipped before the "Remember Choice
 *     For (days)" expiration control added a `data-expiration-days`
 *     attribute to the block wrapper. Same reasoning as v2, one attribute
 *     earlier.
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

const CookieIcon = () => (
	<svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M12 3a9 9 0 1 0 9 9c0-.34-.02-.67-.06-1a2.5 2.5 0 0 1-3.44-2.94A2.5 2.5 0 0 1 15 4.6 9 9 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
		<circle cx="9" cy="10" r="1" fill="currentColor" />
		<circle cx="13" cy="8.5" r="1" fill="currentColor" />
		<circle cx="15.5" cy="13" r="1" fill="currentColor" />
		<circle cx="10" cy="14.5" r="1" fill="currentColor" />
	</svg>
);

const deprecatedV2 = {
	migrate( attributes ) {
		return attributes;
	},

	save( { attributes: a } ) {
		const blockProps = useBlockProps.save( {
			className: 'adaire-cookie-notice-block',
			'data-position': a.position || 'floating-bottom-right',
			'data-expiration-days': a.expirationDays ?? 365,
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

						<div className="adaire-cookie-notice__actions">
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
	},
};

const deprecatedV1 = {
	migrate( attributes ) {
		return attributes;
	},

	save( { attributes: a } ) {
		const blockProps = useBlockProps.save( {
			className: 'adaire-cookie-notice-block',
			'data-position': a.position || 'floating-bottom-right',
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

						<div className="adaire-cookie-notice__actions">
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
	},
};

export default [ deprecatedV2, deprecatedV1 ];
