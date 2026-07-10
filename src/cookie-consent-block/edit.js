import { RichText, useBlockProps } from '@wordpress/block-editor';
import {
	Button,
	ButtonGroup,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	TextareaControl,
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
	{ label: __( 'Default (inherit theme)', 'cookie-consent-block' ), value: '' },
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

// ─── Cookie-category repeater — shared between the Inspector panel and the
// on-canvas QuickZone popover so both stay in sync automatically. ──────────
function CategoriesEditor( { categories, onChange } ) {
	const list = Array.isArray( categories ) ? categories : [];
	const update = ( i, patch ) => {
		const next = list.slice();
		next[ i ] = { ...next[ i ], ...patch };
		onChange( next );
	};
	const remove = ( i ) => onChange( list.filter( ( _, idx ) => idx !== i ) );
	const move = ( i, dir ) => {
		const j = i + dir;
		if ( j < 0 || j >= list.length ) return;
		const next = list.slice();
		[ next[ i ], next[ j ] ] = [ next[ j ], next[ i ] ];
		onChange( next );
	};
	const add = () => onChange( [
		...list,
		{ key: `custom-${ Date.now() }`, label: __( 'New Category', 'cookie-consent-block' ), description: '', required: false, defaultChecked: false },
	] );

	return (
		<div className="adaire-repeater">
			{ list.map( ( cat, i ) => (
				<div className="adaire-repeater__item" key={ cat.key || i }>
					<div className="adaire-repeater__row-head">
						<span className="adaire-repeater__index">{ i + 1 }</span>
						<Button variant="tertiary" size="small" onClick={ () => move( i, -1 ) } disabled={ i === 0 }>↑</Button>
						<Button variant="tertiary" size="small" onClick={ () => move( i, 1 ) } disabled={ i === list.length - 1 }>↓</Button>
						{ ! cat.required && (
							<Button variant="tertiary" size="small" isDestructive onClick={ () => remove( i ) }>
								{ __( 'Remove', 'cookie-consent-block' ) }
							</Button>
						) }
					</div>
					<TextControl
						label={ __( 'Label', 'cookie-consent-block' ) }
						value={ cat.label || '' }
						onChange={ ( v ) => update( i, { label: v } ) }
					/>
					<TextareaControl
						label={ __( 'Description', 'cookie-consent-block' ) }
						value={ cat.description || '' }
						onChange={ ( v ) => update( i, { description: v } ) }
						rows={ 2 }
					/>
					<ToggleControl
						label={ __( 'Required (always active, locked)', 'cookie-consent-block' ) }
						checked={ !! cat.required }
						onChange={ ( v ) => update( i, { required: v, defaultChecked: v ? true : cat.defaultChecked } ) }
					/>
					{ ! cat.required && (
						<ToggleControl
							label={ __( 'On by default', 'cookie-consent-block' ) }
							checked={ !! cat.defaultChecked }
							onChange={ ( v ) => update( i, { defaultChecked: v } ) }
						/>
					) }
				</div>
			) ) }
			<Button variant="secondary" onClick={ add }>{ __( 'Add category', 'cookie-consent-block' ) }</Button>
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
		'data-layout': a.layoutType || 'bar-bottom',
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

				<PanelBody title={ __( 'Content', 'cookie-consent-block' ) } initialOpen={ true }>
					<p className="adaire-help-note">{ __( 'Title, description, category names, and button labels are editable directly on the banner in the canvas.', 'cookie-consent-block' ) }</p>
					<TextControl label={ __( 'Learn more label', 'cookie-consent-block' ) } value={ a.learnMoreText } onChange={ bind( 'learnMoreText' ) } />
					<TextControl label={ __( 'Cookie policy label', 'cookie-consent-block' ) } value={ a.cookiePolicyText } onChange={ bind( 'cookiePolicyText' ) } />
					<TextControl label={ __( 'Cookie policy URL', 'cookie-consent-block' ) } value={ a.cookiePolicyUrl } onChange={ bind( 'cookiePolicyUrl' ) } />
					<TextControl label={ __( 'Privacy policy label', 'cookie-consent-block' ) } value={ a.privacyPolicyText } onChange={ bind( 'privacyPolicyText' ) } />
					<TextControl label={ __( 'Privacy policy URL', 'cookie-consent-block' ) } value={ a.privacyPolicyUrl } onChange={ bind( 'privacyPolicyUrl' ) } />
					<TextControl label={ __( 'Terms & conditions label', 'cookie-consent-block' ) } value={ a.termsText } onChange={ bind( 'termsText' ) } />
					<TextControl label={ __( 'Terms & conditions URL', 'cookie-consent-block' ) } value={ a.termsUrl } onChange={ bind( 'termsUrl' ) } help={ __( 'Leave blank to hide this link.', 'cookie-consent-block' ) } />
				</PanelBody>

				<PanelBody title={ __( 'Cookie Categories', 'cookie-consent-block' ) } initialOpen={ false }>
					<CategoriesEditor categories={ a.categories } onChange={ ( categories ) => setAttributes( { categories } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Layout & Position', 'cookie-consent-block' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'Banner layout', 'cookie-consent-block' ) }
						value={ a.layoutType }
						options={ LAYOUT_OPTIONS }
						onChange={ bind( 'layoutType' ) }
					/>
					<SelectControl
						label={ __( 'Density', 'cookie-consent-block' ) }
						value={ a.displayDensity }
						options={ [
							{ label: __( 'Expanded', 'cookie-consent-block' ), value: 'expanded' },
							{ label: __( 'Compact', 'cookie-consent-block' ), value: 'compact' },
						] }
						onChange={ bind( 'displayDensity' ) }
					/>
					{ isBar && (
						<SelectControl
							label={ __( 'Banner width', 'cookie-consent-block' ) }
							value={ a.bannerWidth }
							options={ [
								{ label: __( 'Full width', 'cookie-consent-block' ), value: 'full' },
								{ label: __( 'Contained (use max width below)', 'cookie-consent-block' ), value: 'contained' },
							] }
							onChange={ bind( 'bannerWidth' ) }
						/>
					) }
					{ ( isFloating || isModal || ( isBar && a.bannerWidth === 'contained' ) ) && (
						<RangeControl
							label={ __( 'Max width (px)', 'cookie-consent-block' ) }
							value={ a.maxWidth }
							onChange={ bind( 'maxWidth' ) }
							min={ 280 }
							max={ 900 }
						/>
					) }
					{ ( isFloating || isModal ) && (
						<SelectControl
							label={ __( 'Content alignment', 'cookie-consent-block' ) }
							value={ a.alignment }
							options={ [
								{ label: __( 'Left', 'cookie-consent-block' ), value: 'left' },
								{ label: __( 'Center', 'cookie-consent-block' ), value: 'center' },
								{ label: __( 'Right', 'cookie-consent-block' ), value: 'right' },
							] }
							onChange={ bind( 'alignment' ) }
						/>
					) }
					<ToggleControl
						label={ __( 'Show dimmed overlay behind banner', 'cookie-consent-block' ) }
						checked={ !! a.showOverlay }
						onChange={ bind( 'showOverlay' ) }
						help={ __( 'Recommended for Center Modal layout.', 'cookie-consent-block' ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Behavior', 'cookie-consent-block' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Show close (×) button', 'cookie-consent-block' ) } checked={ !! a.closeButtonEnabled } onChange={ bind( 'closeButtonEnabled' ) } />
					<ToggleControl label={ __( 'Auto-hide after a choice is made', 'cookie-consent-block' ) } checked={ !! a.autoHide } onChange={ bind( 'autoHide' ) } />
					{ a.autoHide && (
						<RangeControl label={ __( 'Auto-hide delay (ms)', 'cookie-consent-block' ) } value={ a.autoHideDelay } onChange={ bind( 'autoHideDelay' ) } min={ 0 } max={ 3000 } step={ 50 } />
					) }
					<RangeControl label={ __( 'Consent expiration (days)', 'cookie-consent-block' ) } value={ a.consentExpirationDays } onChange={ bind( 'consentExpirationDays' ) } min={ 1 } max={ 730 } />
					<TextControl label={ __( 'Consent version', 'cookie-consent-block' ) } value={ a.consentVersion } onChange={ bind( 'consentVersion' ) } help={ __( 'Bump this to re-prompt everyone (e.g. after a policy change).', 'cookie-consent-block' ) } />
					<ToggleControl label={ __( 'Show floating "Cookie Settings" reopen tab', 'cookie-consent-block' ) } checked={ !! a.reopenButtonEnabled } onChange={ bind( 'reopenButtonEnabled' ) } />
					{ a.reopenButtonEnabled && (
						<>
							<TextControl label={ __( 'Reopen tab label', 'cookie-consent-block' ) } value={ a.reopenButtonText } onChange={ bind( 'reopenButtonText' ) } />
							<ButtonGroup style={ { marginBottom: 12 } }>
								<Button isPrimary={ a.reopenButtonPosition === 'bottom-left' } onClick={ () => setAttributes( { reopenButtonPosition: 'bottom-left' } ) }>{ __( 'Bottom left', 'cookie-consent-block' ) }</Button>
								<Button isPrimary={ a.reopenButtonPosition === 'bottom-right' } onClick={ () => setAttributes( { reopenButtonPosition: 'bottom-right' } ) }>{ __( 'Bottom right', 'cookie-consent-block' ) }</Button>
							</ButtonGroup>
						</>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Integrations & Scripts', 'cookie-consent-block' ) } initialOpen={ false }>
					<ToggleControl
						label={ __( 'Enable Google Consent Mode', 'cookie-consent-block' ) }
						checked={ !! a.googleConsentMode }
						onChange={ bind( 'googleConsentMode' ) }
						help={ __( 'Calls gtag("consent","update", …) whenever preferences change, if gtag.js is present (Google Analytics / Ads / Tag Manager).', 'cookie-consent-block' ) }
					/>
					<ToggleControl
						label={ __( 'Block scripts until consent', 'cookie-consent-block' ) }
						checked={ !! a.blockScriptsUntilConsent }
						onChange={ bind( 'blockScriptsUntilConsent' ) }
						help={ __( 'Give any script a type="text/plain" and data-cookie-consent="analytics" (or another category key) and it will only run after that category is accepted.', 'cookie-consent-block' ) }
					/>
					<RangeControl label={ __( 'Stacking order (z-index)', 'cookie-consent-block' ) } value={ a.zIndex } onChange={ bind( 'zIndex' ) } min={ 1 } max={ 2147483000 } />
				</PanelBody>

				<PanelBody title={ __( 'Colors', 'cookie-consent-block' ) } initialOpen={ false }>
					<p className="adaire-help-note">{ __( 'Defaults match a clean, light "Real Cookie Banner"-style theme — white card, dark text, blue accent.', 'cookie-consent-block' ) }</p>
					<AdaireColorControl label={ __( 'Background', 'cookie-consent-block' ) } value={ a.backgroundColor } onChange={ ( v ) => setAttributes( { backgroundColor: v || '#ffffff' } ) } />
					<AdaireColorControl label={ __( 'Heading color', 'cookie-consent-block' ) } value={ a.headingColor } onChange={ ( v ) => setAttributes( { headingColor: v || '#202124' } ) } />
					<AdaireColorControl label={ __( 'Text color', 'cookie-consent-block' ) } value={ a.textColor } onChange={ ( v ) => setAttributes( { textColor: v || '#5f6368' } ) } />
					<AdaireColorControl label={ __( 'Accent / primary button', 'cookie-consent-block' ) } value={ a.accentColor } onChange={ ( v ) => setAttributes( { accentColor: v || '#1a73e8' } ) } />
					<AdaireColorControl label={ __( 'Primary button text', 'cookie-consent-block' ) } value={ a.primaryButtonTextColor } onChange={ ( v ) => setAttributes( { primaryButtonTextColor: v || '#ffffff' } ) } />
					<AdaireColorControl label={ __( 'Secondary button background', 'cookie-consent-block' ) } value={ a.secondaryButtonBg } onChange={ ( v ) => setAttributes( { secondaryButtonBg: v || 'transparent' } ) } />
					<AdaireColorControl label={ __( 'Secondary button text', 'cookie-consent-block' ) } value={ a.secondaryButtonTextColor } onChange={ ( v ) => setAttributes( { secondaryButtonTextColor: v || '#1a73e8' } ) } />
					<AdaireColorControl label={ __( 'Border color', 'cookie-consent-block' ) } value={ a.borderColor } onChange={ ( v ) => setAttributes( { borderColor: v || '#e5e7eb' } ) } />
					<AdaireColorControl label={ __( 'Overlay color', 'cookie-consent-block' ) } value={ a.overlayColor } onChange={ ( v ) => setAttributes( { overlayColor: v || 'rgba(15,23,42,0.55)' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Typography', 'cookie-consent-block' ) } initialOpen={ false }>
					<SelectControl label={ __( 'Font family', 'cookie-consent-block' ) } value={ a.fontFamily } options={ FONT_FAMILY_OPTIONS } onChange={ bind( 'fontFamily' ) } />
					<SelectControl label={ __( 'Font weight', 'cookie-consent-block' ) } value={ a.fontWeight } options={ FONT_WEIGHT_OPTIONS } onChange={ bind( 'fontWeight' ) } />
					<TextControl label={ __( 'Line height', 'cookie-consent-block' ) } value={ a.lineHeight } onChange={ bind( 'lineHeight' ) } />
					<DeviceSwitcher deviceType={ device } setDeviceType={ setDevice } label={ __( 'Responsive font size', 'cookie-consent-block' ) } />
					<RangeControl
						label={ __( 'Heading size', 'cookie-consent-block' ) }
						value={ a.headingFontSize?.[ device ]?.value ?? 18 }
						onChange={ ( value ) => setAttributes( { headingFontSize: { ...a.headingFontSize, [ device ]: { value, unit: 'px' } } } ) }
						min={ 12 } max={ 40 }
					/>
					<RangeControl
						label={ __( 'Body size', 'cookie-consent-block' ) }
						value={ a.bodyFontSize?.[ device ]?.value ?? 14 }
						onChange={ ( value ) => setAttributes( { bodyFontSize: { ...a.bodyFontSize, [ device ]: { value, unit: 'px' } } } ) }
						min={ 10 } max={ 24 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Borders & Shadow', 'cookie-consent-block' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Show border', 'cookie-consent-block' ) } checked={ !! a.showBorder } onChange={ bind( 'showBorder' ) } />
					{ a.showBorder && (
						<RangeControl label={ __( 'Border width (px)', 'cookie-consent-block' ) } value={ a.borderWidth } onChange={ bind( 'borderWidth' ) } min={ 1 } max={ 6 } />
					) }
					<RangeControl label={ __( 'Border radius (px)', 'cookie-consent-block' ) } value={ a.borderRadius } onChange={ bind( 'borderRadius' ) } min={ 0 } max={ 48 } />
					<ToggleControl label={ __( 'Show box shadow', 'cookie-consent-block' ) } checked={ !! a.showShadow } onChange={ bind( 'showShadow' ) } />
					{ a.showShadow && (
						<SelectControl
							label={ __( 'Shadow intensity', 'cookie-consent-block' ) }
							value={ a.shadowIntensity }
							options={ [
								{ label: __( 'Soft', 'cookie-consent-block' ), value: 'soft' },
								{ label: __( 'Medium', 'cookie-consent-block' ), value: 'medium' },
								{ label: __( 'Strong', 'cookie-consent-block' ), value: 'strong' },
							] }
							onChange={ bind( 'shadowIntensity' ) }
						/>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Spacing & Buttons', 'cookie-consent-block' ) } initialOpen={ false }>
					<DeviceSwitcher deviceType={ device } setDeviceType={ setDevice } label={ __( 'Responsive padding', 'cookie-consent-block' ) } />
					<RangeControl
						label={ __( 'Padding', 'cookie-consent-block' ) }
						value={ a.padding?.[ device ]?.value ?? 24 }
						onChange={ ( value ) => setAttributes( { padding: { ...a.padding, [ device ]: { value, unit: 'px' } } } ) }
						min={ 0 } max={ 64 }
					/>
					<RangeControl label={ __( 'Gap between elements', 'cookie-consent-block' ) } value={ a.gap } onChange={ bind( 'gap' ) } min={ 4 } max={ 40 } />
					<SelectControl
						label={ __( 'Button shape', 'cookie-consent-block' ) }
						value={ a.buttonShape }
						options={ [
							{ label: __( 'Pill', 'cookie-consent-block' ), value: 'pill' },
							{ label: __( 'Rounded', 'cookie-consent-block' ), value: 'rounded' },
							{ label: __( 'Square', 'cookie-consent-block' ), value: 'square' },
						] }
						onChange={ bind( 'buttonShape' ) }
					/>
					<SelectControl
						label={ __( 'Button size', 'cookie-consent-block' ) }
						value={ a.buttonSize }
						options={ [
							{ label: __( 'Small', 'cookie-consent-block' ), value: 'sm' },
							{ label: __( 'Medium', 'cookie-consent-block' ), value: 'md' },
							{ label: __( 'Large', 'cookie-consent-block' ), value: 'lg' },
						] }
						onChange={ bind( 'buttonSize' ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Icon & Animation Effects', 'cookie-consent-block' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Show icon', 'cookie-consent-block' ) } checked={ !! a.showIcon } onChange={ bind( 'showIcon' ) } />
					<SelectControl
						label={ __( 'Entrance animation', 'cookie-consent-block' ) }
						value={ a.entranceAnimation }
						options={ [
							{ label: __( 'None', 'cookie-consent-block' ), value: 'none' },
							{ label: __( 'Fade', 'cookie-consent-block' ), value: 'fade' },
							{ label: __( 'Slide up', 'cookie-consent-block' ), value: 'slide-up' },
							{ label: __( 'Slide down', 'cookie-consent-block' ), value: 'slide-down' },
							{ label: __( 'Slide from left', 'cookie-consent-block' ), value: 'slide-left' },
							{ label: __( 'Slide from right', 'cookie-consent-block' ), value: 'slide-right' },
						] }
						onChange={ bind( 'entranceAnimation' ) }
					/>
					<RangeControl label={ __( 'Animation duration (ms)', 'cookie-consent-block' ) } value={ a.animationDuration } onChange={ bind( 'animationDuration' ) } min={ 100 } max={ 1200 } step={ 50 } />
				</PanelBody>

			</InspectorTabs>

			<div { ...blockProps }>
				{ a.showOverlay && <div className="adaire-cookie-banner__overlay" /> }

				<div className="adaire-cookie-banner__panel" role="dialog" aria-label={ __( 'Cookie consent', 'cookie-consent-block' ) }>
					{ a.closeButtonEnabled && (
						<button type="button" className="adaire-cookie-banner__close" aria-label={ __( 'Close', 'cookie-consent-block' ) }>×</button>
					) }

					<div className="adaire-cookie-banner__header">
						{ a.showIcon && <span className="adaire-cookie-banner__icon" aria-hidden="true"><CookieIcon /></span> }
						<RichText
							tagName="p"
							className="adaire-cookie-banner__title"
							value={ a.bannerTitle }
							onChange={ bind( 'bannerTitle' ) }
							placeholder={ __( 'Banner title…', 'cookie-consent-block' ) }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
						/>
					</div>

					<RichText
						tagName="p"
						className="adaire-cookie-banner__description"
						value={ a.description }
						onChange={ bind( 'description' ) }
						placeholder={ __( 'Describe how cookies are used on this site…', 'cookie-consent-block' ) }
						allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
					/>

					<QuickZone
						id="categories"
						label={ __( 'Cookie Categories', 'cookie-consent-block' ) }
						activeZone={ activeZone }
						setActiveZone={ setActiveZone }
						content={ <CategoriesEditor categories={ a.categories } onChange={ ( categories ) => setAttributes( { categories } ) } /> }
					>
						<div className="adaire-cookie-banner__categories">
							{ ( a.categories || [] ).map( ( cat ) => (
								<label className="adaire-cookie-banner__cat-row" key={ cat.key }>
									<input type="checkbox" defaultChecked={ !! cat.defaultChecked } disabled={ !! cat.required } readOnly />
									<span>
										<strong>{ cat.label }</strong>{ cat.required ? ` (${ __( 'always active', 'cookie-consent-block' ) })` : '' }
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
						placeholder={ __( 'Optional additional / legal-basis text…', 'cookie-consent-block' ) }
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
					<div className="adaire-cookie-banner__reopen">
						<SlidersIcon /> { a.reopenButtonText }
					</div>
				) }
			</div>
		</>
	);
}
