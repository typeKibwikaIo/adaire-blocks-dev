import { useBlockProps, RichText } from '@wordpress/block-editor';
import InspectorTabs from '../components/InspectorTabs';
import BoundColorPalette from '../components/BoundColorPalette';
import './editor.scss';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	SelectControl,
	RangeControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';

// Kept in sync with the matching icon in save.js.
const CookieIcon = () => (
	<svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M12 3a9 9 0 1 0 9 9c0-.34-.02-.67-.06-1a2.5 2.5 0 0 1-3.44-2.94A2.5 2.5 0 0 1 15 4.6 9 9 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
		<circle cx="9" cy="10" r="1" fill="currentColor" />
		<circle cx="13" cy="8.5" r="1" fill="currentColor" />
		<circle cx="15.5" cy="13" r="1" fill="currentColor" />
		<circle cx="10.6" cy="14" r="1" fill="currentColor" />
	</svg>
);

const POSITION_OPTIONS = [
	{ label: __( 'Bottom Right (floating)' ), value: 'floating-bottom-right' },
	{ label: __( 'Bottom Left (floating)' ), value: 'floating-bottom-left' },
	{ label: __( 'Bottom Center (full-width bar)' ), value: 'floating-bottom-center' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		blockId,
		message,
		acceptText,
		declineText,
		showPrivacyLink,
		privacyPolicyText,
		privacyPolicyUrl,
		showTermsLink,
		termsText,
		termsUrl,
		position,
		expirationDays,
		consentVersion,
		showCustomize,
		customizeText,
		necessaryLabel,
		preferencesLabel,
		analyticsLabel,
		marketingLabel,
		savePreferencesText,
		backgroundColor,
		textColor,
		acceptButtonColor,
		acceptButtonTextColor,
		declineButtonColor,
		declineButtonTextColor,
		linkColor,
		borderRadius,
	} = attributes;

	useEffect( () => {
		if ( ! blockId ) {
			setAttributes( { blockId: clientId } );
		}
	}, [ blockId, clientId, setAttributes ] );

	const blockProps = useBlockProps( {
		className: 'adaire-cookie-notice-editor',
	} );

	return (
		<>
			<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
				<PanelBody title={ __( 'Content' ) } initialOpen={ true }>
					<TextControl
						label={ __( 'Accept Button Text' ) }
						value={ acceptText }
						onChange={ ( v ) => setAttributes( { acceptText: v } ) }
					/>
					<TextControl
						label={ __( 'Decline Button Text' ) }
						value={ declineText }
						onChange={ ( v ) => setAttributes( { declineText: v } ) }
					/>
					<ToggleControl
						label={ __( 'Show Privacy Policy Link' ) }
						checked={ !! showPrivacyLink }
						onChange={ ( v ) => setAttributes( { showPrivacyLink: v } ) }
					/>
					{ showPrivacyLink && (
						<>
							<TextControl
								label={ __( 'Privacy Policy Link Text' ) }
								value={ privacyPolicyText }
								onChange={ ( v ) => setAttributes( { privacyPolicyText: v } ) }
							/>
							<TextControl
								label={ __( 'Privacy Policy URL' ) }
								value={ privacyPolicyUrl }
								placeholder="https://example.com/privacy-policy"
								onChange={ ( v ) => setAttributes( { privacyPolicyUrl: v } ) }
							/>
						</>
					) }
					<ToggleControl
						label={ __( 'Show Terms & Conditions Link' ) }
						checked={ !! showTermsLink }
						onChange={ ( v ) => setAttributes( { showTermsLink: v } ) }
					/>
					{ showTermsLink && (
						<>
							<TextControl
								label={ __( 'Terms & Conditions Link Text' ) }
								value={ termsText }
								onChange={ ( v ) => setAttributes( { termsText: v } ) }
							/>
							<TextControl
								label={ __( 'Terms & Conditions URL' ) }
								value={ termsUrl }
								placeholder="https://example.com/terms-and-conditions"
								onChange={ ( v ) => setAttributes( { termsUrl: v } ) }
							/>
						</>
					) }
					<RangeControl
						label={ __( 'Remember Choice For (days)' ) }
						help={ __( 'How long an accepted or declined choice is remembered before the notice shows again.' ) }
						value={ expirationDays }
						onChange={ ( v ) => setAttributes( { expirationDays: v ?? 365 } ) }
						min={ 1 }
						max={ 365 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Consent Categories' ) } initialOpen={ false }>
					<TextControl
						label={ __( 'Consent Policy Version' ) }
						help={ __( 'Change this after a material update to your cookie policy to make every visitor re-consent, even ones whose stored choice hasn\'t expired yet.' ) }
						value={ consentVersion }
						onChange={ ( v ) => setAttributes( { consentVersion: v || '1' } ) }
					/>
					<ToggleControl
						label={ __( 'Let visitors customize consent by category' ) }
						checked={ !! showCustomize }
						onChange={ ( v ) => setAttributes( { showCustomize: v } ) }
					/>
					{ showCustomize && (
						<>
							<TextControl
								label={ __( 'Customize Button Text' ) }
								value={ customizeText }
								onChange={ ( v ) => setAttributes( { customizeText: v } ) }
							/>
							<TextControl
								label={ __( 'Necessary Category Label' ) }
								value={ necessaryLabel }
								onChange={ ( v ) => setAttributes( { necessaryLabel: v } ) }
							/>
							<TextControl
								label={ __( 'Preferences Category Label' ) }
								value={ preferencesLabel }
								onChange={ ( v ) => setAttributes( { preferencesLabel: v } ) }
							/>
							<TextControl
								label={ __( 'Analytics Category Label' ) }
								value={ analyticsLabel }
								onChange={ ( v ) => setAttributes( { analyticsLabel: v } ) }
							/>
							<TextControl
								label={ __( 'Marketing Category Label' ) }
								value={ marketingLabel }
								onChange={ ( v ) => setAttributes( { marketingLabel: v } ) }
							/>
							<TextControl
								label={ __( 'Save Preferences Button Text' ) }
								value={ savePreferencesText }
								onChange={ ( v ) => setAttributes( { savePreferencesText: v } ) }
							/>
						</>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Position' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Floating Position' ) }
						value={ position }
						options={ POSITION_OPTIONS }
						onChange={ ( v ) => setAttributes( { position: v } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Colors' ) } initialOpen={ false }>
					<p className="adaire-cookie-notice-color-label">{ __( 'Background' ) }</p>
					<BoundColorPalette value={ backgroundColor } onChange={ ( v ) => setAttributes( { backgroundColor: v || '' } ) } />
					<p className="adaire-cookie-notice-color-label">{ __( 'Text' ) }</p>
					<BoundColorPalette value={ textColor } onChange={ ( v ) => setAttributes( { textColor: v || '' } ) } />
					<p className="adaire-cookie-notice-color-label">{ __( 'Accept Button Background' ) }</p>
					<BoundColorPalette value={ acceptButtonColor } onChange={ ( v ) => setAttributes( { acceptButtonColor: v || '' } ) } />
					<p className="adaire-cookie-notice-color-label">{ __( 'Accept Button Text' ) }</p>
					<BoundColorPalette value={ acceptButtonTextColor } onChange={ ( v ) => setAttributes( { acceptButtonTextColor: v || '' } ) } />
					<p className="adaire-cookie-notice-color-label">{ __( 'Decline Button Background' ) }</p>
					<BoundColorPalette value={ declineButtonColor } onChange={ ( v ) => setAttributes( { declineButtonColor: v || '' } ) } />
					<p className="adaire-cookie-notice-color-label">{ __( 'Decline Button Text' ) }</p>
					<BoundColorPalette value={ declineButtonTextColor } onChange={ ( v ) => setAttributes( { declineButtonTextColor: v || '' } ) } />
					<p className="adaire-cookie-notice-color-label">{ __( 'Privacy Link' ) }</p>
					<BoundColorPalette value={ linkColor } onChange={ ( v ) => setAttributes( { linkColor: v || '' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Border & Radius' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Corner Radius (px)' ) }
						value={ borderRadius }
						onChange={ ( v ) => setAttributes( { borderRadius: v ?? 0 } ) }
						min={ 0 }
						max={ 40 }
					/>
				</PanelBody>
			</InspectorTabs>

			<div { ...blockProps }>
				<div
					className="adaire-cookie-notice__preview-wrap"
					data-position={ position }
				>
					<div
						className="adaire-cookie-notice"
						style={ {
							backgroundColor,
							color: textColor,
							borderRadius: `${ borderRadius }px`,
						} }
					>
						<RichText
							tagName="p"
							className="adaire-cookie-notice__message"
							value={ message }
							onChange={ ( v ) => setAttributes( { message: v } ) }
							placeholder={ __( 'Cookie consent message…' ) }
						/>

						{ ( ( showPrivacyLink && !! privacyPolicyText ) || ( showTermsLink && !! termsText ) ) && (
							<div className="adaire-cookie-notice__links">
								{ showPrivacyLink && !! privacyPolicyText && (
									<a
										className="adaire-cookie-notice__privacy-link"
										style={ { color: linkColor } }
										href="#"
										onClick={ ( e ) => e.preventDefault() }
									>
										{ privacyPolicyText }
									</a>
								) }
								{ showTermsLink && !! termsText && (
									<a
										className="adaire-cookie-notice__privacy-link"
										style={ { color: linkColor } }
										href="#"
										onClick={ ( e ) => e.preventDefault() }
									>
										{ termsText }
									</a>
								) }
							</div>
						) }

						{ showCustomize && (
							<div className="adaire-cookie-notice__prefs adaire-cookie-notice__prefs--editor-preview">
								<label className="adaire-cookie-notice__pref-row">
									<span>{ necessaryLabel }</span>
									<input type="checkbox" checked disabled readOnly />
								</label>
								<label className="adaire-cookie-notice__pref-row">
									<span>{ preferencesLabel }</span>
									<input type="checkbox" disabled readOnly />
								</label>
								<label className="adaire-cookie-notice__pref-row">
									<span>{ analyticsLabel }</span>
									<input type="checkbox" disabled readOnly />
								</label>
								<label className="adaire-cookie-notice__pref-row">
									<span>{ marketingLabel }</span>
									<input type="checkbox" disabled readOnly />
								</label>
								<button
									type="button"
									className="adaire-cookie-notice__btn adaire-cookie-notice__btn--accept"
									style={ {
										backgroundColor: acceptButtonColor,
										color: acceptButtonTextColor,
									} }
									disabled
								>
									{ savePreferencesText }
								</button>
							</div>
						) }

						<div className="adaire-cookie-notice__actions">
							{ showCustomize && (
								<button
									type="button"
									className="adaire-cookie-notice__btn adaire-cookie-notice__btn--customize"
									style={ { color: textColor } }
									disabled
								>
									{ customizeText }
								</button>
							) }
							<button
								type="button"
								className="adaire-cookie-notice__btn adaire-cookie-notice__btn--decline"
								style={ {
									backgroundColor: declineButtonColor,
									color: declineButtonTextColor,
									borderColor: declineButtonTextColor,
								} }
							>
								{ declineText }
							</button>
							<button
								type="button"
								className="adaire-cookie-notice__btn adaire-cookie-notice__btn--accept"
								style={ {
									backgroundColor: acceptButtonColor,
									color: acceptButtonTextColor,
								} }
							>
								{ acceptText }
							</button>
						</div>
					</div>
				</div>
				<p className="adaire-cookie-notice-editor-hint">
					{ __( 'Preview only — on the live site this notice floats over the page and only shows to visitors who haven\'t made a choice yet. The preferences panel shown here is always visible in the editor for reference; on the live site it only appears after "Customize" is clicked.' ) }
				</p>

				<div className="adaire-cookie-notice-editor-reopen-preview" data-position={ position }>
					<button
						type="button"
						className="adaire-cookie-notice__reopen"
						style={ {
							backgroundColor: acceptButtonColor,
							color: acceptButtonTextColor,
						} }
						disabled
					>
						<CookieIcon />
					</button>
					<p className="adaire-cookie-notice-editor-hint">
						{ __( 'After a visitor accepts or declines, this icon stays on screen so they can reopen the notice later and change their choice.' ) }
					</p>
				</div>
			</div>
		</>
	);
}
