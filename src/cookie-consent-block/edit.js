import { RichText, useBlockProps } from '@wordpress/block-editor';
import {
	Button,
	ButtonGroup,
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import InspectorTabs from '../components/InspectorTabs';
import AdaireColorControl from '../components/AdaireColorControl';
import QuickZone from '../components/QuickZone';
import DeviceSwitcher from '../components/DeviceSwitcher';
import { getStyleVars, LAYOUT_OPTIONS } from './shared';

const set = ( setAttributes ) => ( key ) => ( value ) => setAttributes( { [ key ]: value } );

const FONT_FAMILY_OPTIONS = [
	{ label: __( 'Default (inherit theme)', 'adaire-blocks' ), value: '' },
	{ label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
	{ label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
	{ label: 'Georgia', value: 'Georgia, serif' },
	{ label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
	{ label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
	{ label: 'System UI', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

const FONT_WEIGHT_OPTIONS = [ '300', '400', '500', '600', '700', '800' ].map( ( w ) => ( { label: w, value: w } ) );

// ─── Inline SVG icons (replace the old emoji glyphs) — self-contained, no
// external icon-font dependency, colored via `currentColor` so they inherit
// the surrounding text/accent color automatically. ──────────────────────
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

// Categories are managed site-wide on the Cookie Categories admin page (see
// admin/cookie-categories-page.php) so every Cookie Banner block on the site
// shares one definition — render.php always reads that shared list, never a
// per-block copy. window.adaireCookieCategoriesData is localized by that
// page's enqueue_block_editor_assets hook; the empty-array/'#' fallbacks only
// matter if this component somehow renders before that hook fires.
const COOKIE_CATEGORIES_DATA = typeof window !== 'undefined' ? window.adaireCookieCategoriesData : null;
const SITE_WIDE_CATEGORIES = COOKIE_CATEGORIES_DATA?.categories || [];
const COOKIE_CATEGORIES_MANAGE_URL = COOKIE_CATEGORIES_DATA?.manageUrl || '#';

// ─── Read-only category list — shared between the Inspector panel and the
// on-canvas QuickZone popover. Editing happens on the Cookie Categories
// admin page, not per-block, so every instance of this block stays in sync
// with each other automatically. ────────────────────────────────────────
function CategoriesPreview() {
	return (
		<div className="adaire-repeater">
			{ SITE_WIDE_CATEGORIES.map( ( cat ) => (
				<div className="adaire-repeater__item" key={ cat.key }>
					<strong>{ cat.label }</strong>
					{ cat.required ? ` (${ __( 'always active', 'adaire-blocks' ) })` : '' }
					{ cat.description ? <p className="adaire-help-note" style={ { margin: '2px 0 0' } }>{ cat.description }</p> : null }
				</div>
			) ) }
			<ExternalLink href={ COOKIE_CATEGORIES_MANAGE_URL }>
				{ __( 'Manage categories', 'adaire-blocks' ) }
			</ExternalLink>
		</div>
	);
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const a = attributes;
	const bind = set( setAttributes );
	const [ activeZone, setActiveZone ] = useState( null );
	const [ device, setDevice ] = useState( 'desktop' );

	useEffect( () => {
		if ( ! a.blockId ) {
			setAttributes( { blockId: clientId } );
		}
	}, [ a.blockId, clientId, setAttributes ] );

	const isBar = a.layoutType?.startsWith( 'bar-' );
	const isFloating = a.layoutType?.startsWith( 'floating-' );
	const isModal = a.layoutType === 'center-modal';

	const blockProps = useBlockProps( {
		className: 'adaire-cookie-banner',
		style: getStyleVars( a ),
		'data-layout': a.layoutType || 'floating-bottom-right',
		'data-density': a.displayDensity || 'expanded',
		'data-align': a.alignment || 'center',
		'data-shadow': a.showShadow ? ( a.shadowIntensity || 'medium' ) : 'none',
		'data-shape': a.buttonShape || 'pill',
		'data-btn-size': a.buttonSize || 'md',
		'data-anim': a.entranceAnimation || 'none',
		'data-width': a.bannerWidth || 'full',
	} );

	return (
		<>
			<InspectorTabs attributes={ a } setAttributes={ setAttributes }>

				<PanelBody title={ __( 'Content', 'adaire-blocks' ) } initialOpen={ true }>
					<p className="adaire-help-note">{ __( 'Title, description, category names, and button labels are editable directly on the banner in the canvas.', 'adaire-blocks' ) }</p>
					<TextControl label={ __( 'Learn more label', 'adaire-blocks' ) } value={ a.learnMoreText } onChange={ bind( 'learnMoreText' ) } />
					<TextControl label={ __( 'Cookie policy label', 'adaire-blocks' ) } value={ a.cookiePolicyText } onChange={ bind( 'cookiePolicyText' ) } />
					<TextControl label={ __( 'Cookie policy URL', 'adaire-blocks' ) } value={ a.cookiePolicyUrl } onChange={ bind( 'cookiePolicyUrl' ) } />
					<TextControl label={ __( 'Privacy policy label', 'adaire-blocks' ) } value={ a.privacyPolicyText } onChange={ bind( 'privacyPolicyText' ) } />
					<TextControl label={ __( 'Privacy policy URL', 'adaire-blocks' ) } value={ a.privacyPolicyUrl } onChange={ bind( 'privacyPolicyUrl' ) } />
					<TextControl label={ __( 'Terms & conditions label', 'adaire-blocks' ) } value={ a.termsText } onChange={ bind( 'termsText' ) } />
					<TextControl label={ __( 'Terms & conditions URL', 'adaire-blocks' ) } value={ a.termsUrl } onChange={ bind( 'termsUrl' ) } help={ __( 'Leave blank to hide this link.', 'adaire-blocks' ) } />
				</PanelBody>

				<PanelBody title={ __( 'Cookie Categories', 'adaire-blocks' ) } initialOpen={ false }>
					<p className="adaire-help-note">{ __( 'Shared site-wide — every Cookie Banner block uses this same list.', 'adaire-blocks' ) }</p>
					<CategoriesPreview />
				</PanelBody>

				<PanelBody title={ __( 'Layout & Position', 'adaire-blocks' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'Banner layout', 'adaire-blocks' ) }
						value={ a.layoutType }
						options={ LAYOUT_OPTIONS }
						onChange={ bind( 'layoutType' ) }
					/>
					<SelectControl
						label={ __( 'Density', 'adaire-blocks' ) }
						value={ a.displayDensity }
						options={ [
							{ label: __( 'Expanded', 'adaire-blocks' ), value: 'expanded' },
							{ label: __( 'Compact', 'adaire-blocks' ), value: 'compact' },
						] }
						onChange={ bind( 'displayDensity' ) }
					/>
					{ isBar && (
						<SelectControl
							label={ __( 'Banner width', 'adaire-blocks' ) }
							value={ a.bannerWidth }
							options={ [
								{ label: __( 'Full width', 'adaire-blocks' ), value: 'full' },
								{ label: __( 'Contained (use max width below)', 'adaire-blocks' ), value: 'contained' },
							] }
							onChange={ bind( 'bannerWidth' ) }
						/>
					) }
					{ ( isFloating || isModal || ( isBar && a.bannerWidth === 'contained' ) ) && (
						<RangeControl
							label={ __( 'Max width (px)', 'adaire-blocks' ) }
							value={ a.maxWidth }
							onChange={ bind( 'maxWidth' ) }
							min={ 280 }
							max={ 900 }
						/>
					) }
					{ ( isFloating || isModal ) && (
						<SelectControl
							label={ __( 'Content alignment', 'adaire-blocks' ) }
							value={ a.alignment }
							options={ [
								{ label: __( 'Left', 'adaire-blocks' ), value: 'left' },
								{ label: __( 'Center', 'adaire-blocks' ), value: 'center' },
								{ label: __( 'Right', 'adaire-blocks' ), value: 'right' },
							] }
							onChange={ bind( 'alignment' ) }
						/>
					) }
					<ToggleControl
						label={ __( 'Show dimmed overlay behind banner', 'adaire-blocks' ) }
						checked={ !! a.showOverlay }
						onChange={ bind( 'showOverlay' ) }
						help={ __( 'Recommended for Center Modal layout.', 'adaire-blocks' ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Behavior', 'adaire-blocks' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Show close (×) button', 'adaire-blocks' ) } checked={ !! a.closeButtonEnabled } onChange={ bind( 'closeButtonEnabled' ) } />
					<ToggleControl label={ __( 'Auto-hide after a choice is made', 'adaire-blocks' ) } checked={ !! a.autoHide } onChange={ bind( 'autoHide' ) } />
					{ a.autoHide && (
						<RangeControl label={ __( 'Auto-hide delay (ms)', 'adaire-blocks' ) } value={ a.autoHideDelay } onChange={ bind( 'autoHideDelay' ) } min={ 0 } max={ 3000 } step={ 50 } />
					) }
					<RangeControl label={ __( 'Consent expiration (days)', 'adaire-blocks' ) } value={ a.consentExpirationDays } onChange={ bind( 'consentExpirationDays' ) } min={ 1 } max={ 730 } />
					<TextControl label={ __( 'Consent version', 'adaire-blocks' ) } value={ a.consentVersion } onChange={ bind( 'consentVersion' ) } help={ __( 'Bump this to re-prompt everyone (e.g. after a policy change).', 'adaire-blocks' ) } />
					<ToggleControl label={ __( 'Show floating "Cookie Settings" reopen tab', 'adaire-blocks' ) } checked={ !! a.reopenButtonEnabled } onChange={ bind( 'reopenButtonEnabled' ) } />
					{ a.reopenButtonEnabled && (
						<>
							<TextControl label={ __( 'Reopen tab label', 'adaire-blocks' ) } value={ a.reopenButtonText } onChange={ bind( 'reopenButtonText' ) } />
							<ButtonGroup style={ { marginBottom: 12 } }>
								<Button isPrimary={ a.reopenButtonPosition === 'bottom-left' } onClick={ () => setAttributes( { reopenButtonPosition: 'bottom-left' } ) }>{ __( 'Bottom left', 'adaire-blocks' ) }</Button>
								<Button isPrimary={ a.reopenButtonPosition === 'bottom-right' } onClick={ () => setAttributes( { reopenButtonPosition: 'bottom-right' } ) }>{ __( 'Bottom right', 'adaire-blocks' ) }</Button>
							</ButtonGroup>
						</>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Integrations & Scripts', 'adaire-blocks' ) } initialOpen={ false }>
					<ToggleControl
						label={ __( 'Enable Google Consent Mode', 'adaire-blocks' ) }
						checked={ !! a.googleConsentMode }
						onChange={ bind( 'googleConsentMode' ) }
						help={ __( 'Calls gtag("consent","update", …) whenever preferences change, if gtag.js is present (Google Analytics / Ads / Tag Manager).', 'adaire-blocks' ) }
					/>
					<ToggleControl
						label={ __( 'Block scripts until consent', 'adaire-blocks' ) }
						checked={ !! a.blockScriptsUntilConsent }
						onChange={ bind( 'blockScriptsUntilConsent' ) }
						help={ __( 'Give any script a type="text/plain" and data-cookie-consent="analytics" (or another category key) and it will only run after that category is accepted.', 'adaire-blocks' ) }
					/>
					<RangeControl label={ __( 'Stacking order (z-index)', 'adaire-blocks' ) } value={ a.zIndex } onChange={ bind( 'zIndex' ) } min={ 1 } max={ 2147483000 } />
				</PanelBody>

				<PanelBody title={ __( 'Colors', 'adaire-blocks' ) } initialOpen={ false }>
					<p className="adaire-help-note">{ __( 'Defaults match the free Cookie Notice block — dark card, light text, indigo accent.', 'adaire-blocks' ) }</p>
					<AdaireColorControl label={ __( 'Background', 'adaire-blocks' ) } value={ a.backgroundColor } onChange={ ( v ) => setAttributes( { backgroundColor: v || '#111827' } ) } />
					<AdaireColorControl label={ __( 'Heading color', 'adaire-blocks' ) } value={ a.headingColor } onChange={ ( v ) => setAttributes( { headingColor: v || '#f9fafb' } ) } />
					<AdaireColorControl label={ __( 'Text color', 'adaire-blocks' ) } value={ a.textColor } onChange={ ( v ) => setAttributes( { textColor: v || '#f9fafb' } ) } />
					<AdaireColorControl label={ __( 'Accent / primary button', 'adaire-blocks' ) } value={ a.accentColor } onChange={ ( v ) => setAttributes( { accentColor: v || '#6366f1' } ) } />
					<AdaireColorControl label={ __( 'Primary button text', 'adaire-blocks' ) } value={ a.primaryButtonTextColor } onChange={ ( v ) => setAttributes( { primaryButtonTextColor: v || '#ffffff' } ) } />
					<AdaireColorControl label={ __( 'Secondary button background', 'adaire-blocks' ) } value={ a.secondaryButtonBg } onChange={ ( v ) => setAttributes( { secondaryButtonBg: v || 'transparent' } ) } />
					<AdaireColorControl label={ __( 'Secondary button text', 'adaire-blocks' ) } value={ a.secondaryButtonTextColor } onChange={ ( v ) => setAttributes( { secondaryButtonTextColor: v || '#a5b4fc' } ) } />
					<AdaireColorControl label={ __( 'Border color', 'adaire-blocks' ) } value={ a.borderColor } onChange={ ( v ) => setAttributes( { borderColor: v || '#e5e7eb' } ) } />
					<AdaireColorControl label={ __( 'Overlay color', 'adaire-blocks' ) } value={ a.overlayColor } onChange={ ( v ) => setAttributes( { overlayColor: v || 'rgba(15,23,42,0.55)' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Typography', 'adaire-blocks' ) } initialOpen={ false }>
					<SelectControl label={ __( 'Font family', 'adaire-blocks' ) } value={ a.fontFamily } options={ FONT_FAMILY_OPTIONS } onChange={ bind( 'fontFamily' ) } />
					<SelectControl label={ __( 'Font weight', 'adaire-blocks' ) } value={ a.fontWeight } options={ FONT_WEIGHT_OPTIONS } onChange={ bind( 'fontWeight' ) } />
					<TextControl label={ __( 'Line height', 'adaire-blocks' ) } value={ a.lineHeight } onChange={ bind( 'lineHeight' ) } />
					<DeviceSwitcher deviceType={ device } setDeviceType={ setDevice } label={ __( 'Responsive font size', 'adaire-blocks' ) } />
					<RangeControl
						label={ __( 'Heading size', 'adaire-blocks' ) }
						value={ a.headingFontSize?.[ device ]?.value ?? 18 }
						onChange={ ( value ) => setAttributes( { headingFontSize: { ...a.headingFontSize, [ device ]: { value, unit: 'px' } } } ) }
						min={ 12 } max={ 40 }
					/>
					<RangeControl
						label={ __( 'Body size', 'adaire-blocks' ) }
						value={ a.bodyFontSize?.[ device ]?.value ?? 14 }
						onChange={ ( value ) => setAttributes( { bodyFontSize: { ...a.bodyFontSize, [ device ]: { value, unit: 'px' } } } ) }
						min={ 10 } max={ 24 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Borders & Shadow', 'adaire-blocks' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Show border', 'adaire-blocks' ) } checked={ !! a.showBorder } onChange={ bind( 'showBorder' ) } />
					{ a.showBorder && (
						<RangeControl label={ __( 'Border width (px)', 'adaire-blocks' ) } value={ a.borderWidth } onChange={ bind( 'borderWidth' ) } min={ 1 } max={ 6 } />
					) }
					<RangeControl label={ __( 'Border radius (px)', 'adaire-blocks' ) } value={ a.borderRadius } onChange={ bind( 'borderRadius' ) } min={ 0 } max={ 48 } />
					<ToggleControl label={ __( 'Show box shadow', 'adaire-blocks' ) } checked={ !! a.showShadow } onChange={ bind( 'showShadow' ) } />
					{ a.showShadow && (
						<SelectControl
							label={ __( 'Shadow intensity', 'adaire-blocks' ) }
							value={ a.shadowIntensity }
							options={ [
								{ label: __( 'Soft', 'adaire-blocks' ), value: 'soft' },
								{ label: __( 'Medium', 'adaire-blocks' ), value: 'medium' },
								{ label: __( 'Strong', 'adaire-blocks' ), value: 'strong' },
							] }
							onChange={ bind( 'shadowIntensity' ) }
						/>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Spacing & Buttons', 'adaire-blocks' ) } initialOpen={ false }>
					<DeviceSwitcher deviceType={ device } setDeviceType={ setDevice } label={ __( 'Responsive padding', 'adaire-blocks' ) } />
					<RangeControl
						label={ __( 'Padding', 'adaire-blocks' ) }
						value={ a.padding?.[ device ]?.value ?? 24 }
						onChange={ ( value ) => setAttributes( { padding: { ...a.padding, [ device ]: { value, unit: 'px' } } } ) }
						min={ 0 } max={ 64 }
					/>
					<RangeControl label={ __( 'Gap between elements', 'adaire-blocks' ) } value={ a.gap } onChange={ bind( 'gap' ) } min={ 4 } max={ 40 } />
					<SelectControl
						label={ __( 'Button shape', 'adaire-blocks' ) }
						value={ a.buttonShape }
						options={ [
							{ label: __( 'Pill', 'adaire-blocks' ), value: 'pill' },
							{ label: __( 'Rounded', 'adaire-blocks' ), value: 'rounded' },
							{ label: __( 'Square', 'adaire-blocks' ), value: 'square' },
						] }
						onChange={ bind( 'buttonShape' ) }
					/>
					<SelectControl
						label={ __( 'Button size', 'adaire-blocks' ) }
						value={ a.buttonSize }
						options={ [
							{ label: __( 'Small', 'adaire-blocks' ), value: 'sm' },
							{ label: __( 'Medium', 'adaire-blocks' ), value: 'md' },
							{ label: __( 'Large', 'adaire-blocks' ), value: 'lg' },
						] }
						onChange={ bind( 'buttonSize' ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Icon & Animation Effects', 'adaire-blocks' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Show icon', 'adaire-blocks' ) } checked={ !! a.showIcon } onChange={ bind( 'showIcon' ) } />
					<SelectControl
						label={ __( 'Entrance animation', 'adaire-blocks' ) }
						value={ a.entranceAnimation }
						options={ [
							{ label: __( 'None', 'adaire-blocks' ), value: 'none' },
							{ label: __( 'Fade', 'adaire-blocks' ), value: 'fade' },
							{ label: __( 'Slide up', 'adaire-blocks' ), value: 'slide-up' },
							{ label: __( 'Slide down', 'adaire-blocks' ), value: 'slide-down' },
							{ label: __( 'Slide from left', 'adaire-blocks' ), value: 'slide-left' },
							{ label: __( 'Slide from right', 'adaire-blocks' ), value: 'slide-right' },
						] }
						onChange={ bind( 'entranceAnimation' ) }
					/>
					<RangeControl label={ __( 'Animation duration (ms)', 'adaire-blocks' ) } value={ a.animationDuration } onChange={ bind( 'animationDuration' ) } min={ 100 } max={ 1200 } step={ 50 } />
				</PanelBody>

			</InspectorTabs>

			<div { ...blockProps }>
				{ a.showOverlay && <div className="adaire-cookie-banner__overlay" /> }

				<div className="adaire-cookie-banner__panel" role="dialog" aria-label={ __( 'Cookie consent', 'adaire-blocks' ) }>
					{ a.closeButtonEnabled && (
						<button type="button" className="adaire-cookie-banner__close" aria-label={ __( 'Close', 'adaire-blocks' ) }>×</button>
					) }

					<div className="adaire-cookie-banner__header">
						{ a.showIcon && <span className="adaire-cookie-banner__icon" aria-hidden="true"><CookieIcon /></span> }
						<RichText
							tagName="p"
							className="adaire-cookie-banner__title"
							value={ a.bannerTitle }
							onChange={ bind( 'bannerTitle' ) }
							placeholder={ __( 'Banner title…', 'adaire-blocks' ) }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
						/>
					</div>

					<RichText
						tagName="p"
						className="adaire-cookie-banner__description"
						value={ a.description }
						onChange={ bind( 'description' ) }
						placeholder={ __( 'Describe how cookies are used on this site…', 'adaire-blocks' ) }
						allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
					/>

					<QuickZone
						id="categories"
						label={ __( 'Cookie Categories', 'adaire-blocks' ) }
						activeZone={ activeZone }
						setActiveZone={ setActiveZone }
						content={ <CategoriesPreview /> }
					>
						<div className="adaire-cookie-banner__categories">
							{ SITE_WIDE_CATEGORIES.map( ( cat ) => (
								<label className="adaire-cookie-banner__cat-row" key={ cat.key }>
									<input type="checkbox" defaultChecked={ !! cat.defaultChecked } disabled={ !! cat.required } readOnly />
									<span>
										<strong>{ cat.label }</strong>{ cat.required ? ` (${ __( 'always active', 'adaire-blocks' ) })` : '' }
										{ cat.description ? <em className="adaire-cookie-banner__cat-desc">{ cat.description }</em> : null }
									</span>
								</label>
							) ) }
						</div>
					</QuickZone>

					<RichText
						tagName="p"
						className="adaire-cookie-banner__additional"
						value={ a.additionalInfo }
						onChange={ bind( 'additionalInfo' ) }
						placeholder={ __( 'Optional additional / legal-basis text…', 'adaire-blocks' ) }
						allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
					/>

					<div className="adaire-cookie-banner__links">
						{ !! a.cookiePolicyUrl && <a href={ a.cookiePolicyUrl }>{ a.cookiePolicyText }</a> }
						{ !! a.privacyPolicyUrl && <a href={ a.privacyPolicyUrl }>{ a.privacyPolicyText }</a> }
						{ !! a.termsUrl && <a href={ a.termsUrl }>{ a.termsText }</a> }
					</div>

					<div className="adaire-cookie-banner__actions">
						<RichText
							tagName="span"
							className="adaire-cookie-banner__btn adaire-cookie-banner__btn--ghost"
							value={ a.manageText }
							onChange={ bind( 'manageText' ) }
						/>
						<div className="adaire-cookie-banner__actions-primary">
							<RichText
								tagName="span"
								className="adaire-cookie-banner__btn adaire-cookie-banner__btn--outline"
								value={ a.rejectAllText }
								onChange={ bind( 'rejectAllText' ) }
							/>
							<RichText
								tagName="span"
								className="adaire-cookie-banner__btn adaire-cookie-banner__btn--primary"
								value={ a.acceptAllText }
								onChange={ bind( 'acceptAllText' ) }
							/>
						</div>
					</div>
				</div>

				{ a.reopenButtonEnabled && (
					<div className="adaire-cookie-banner__reopen" aria-label={ a.reopenButtonText }>
						<SlidersIcon />
					</div>
				) }
			</div>
		</>
	);
}
