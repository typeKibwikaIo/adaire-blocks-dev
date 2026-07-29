import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	TextControl,
	TextareaControl,
	ToggleControl,
	Button,
	ColorPicker,
	Dropdown,
} from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import DynamicSourceFields from './DynamicSourceFields';

function MediaField( { label, value, onChange } ) {
	return (
		<div className="adaire-mpe-media-field">
			<span className="adaire-mpe-field-label">{ label }</span>
			{ value?.url ? (
				<div className="adaire-mpe-media-preview">
					<img src={ value.url } alt={ value.alt || '' } />
				</div>
			) : null }
			<MediaUploadCheck>
				<MediaUpload
					onSelect={ ( media ) =>
						onChange( {
							id: media.id,
							url: media.url,
							alt: media.alt || '',
						} )
					}
					allowedTypes={ [ 'image' ] }
					value={ value?.id }
					render={ ( { open } ) => (
						<div className="adaire-mpe-media-actions">
							<Button variant="secondary" onClick={ open }>
								{ value?.url
									? __( 'Replace', 'adaire-blocks' )
									: __( 'Select image', 'adaire-blocks' ) }
							</Button>
							{ value?.url && (
								<Button
									variant="link"
									isDestructive
									onClick={ () =>
										onChange( { id: 0, url: '', alt: '' } )
									}
								>
									{ __( 'Remove', 'adaire-blocks' ) }
								</Button>
							) }
						</div>
					) }
				/>
			</MediaUploadCheck>
		</div>
	);
}

function ColorField( { label, value, onChange } ) {
	return (
		<Dropdown
			className="adaire-mpe-color-field"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					variant="secondary"
					onClick={ onToggle }
					aria-expanded={ isOpen }
					className="adaire-mpe-color-swatch-button"
				>
					<span
						className="adaire-mpe-color-swatch"
						style={ { backgroundColor: value || 'transparent' } }
					/>
					{ label }
				</Button>
			) }
			renderContent={ () => (
				<ColorPicker
					color={ value || undefined }
					onChange={ onChange }
					enableAlpha={ false }
				/>
			) }
		/>
	);
}

/**
 * The full field editor for one item, grouped into sections matching the
 * spec's field list. Parent picker is intentionally not here — reparenting
 * happens in ItemList (drag-and-drop / explicit "Move to" control) so it
 * stays visible next to the tree it affects.
 * @param {Object}   root0                   Props.
 * @param {Object}   root0.item              The item being edited.
 * @param {Function} root0.onChange          Called with the updated item on any field change.
 * @param {boolean}  root0.allowNesting      Whether this layout supports drill-down children (tabbed/showcase) — the dynamic-children section only makes sense there.
 * @param {Array}    root0.postTypeOptions   [{ label, value }] options for the dynamic source's post type picker.
 * @param {Array}    root0.taxonomyOptions   [{ label, value }] options for the dynamic source's taxonomy picker.
 * @param {boolean}  root0.wooCommerceActive Whether WooCommerce dynamic source types should be offered.
 */
export default function ItemEditForm( {
	item,
	onChange,
	allowNesting,
	postTypeOptions,
	taxonomyOptions,
	wooCommerceActive,
} ) {
	const set = ( field ) => ( value ) =>
		onChange( { ...item, [ field ]: value } );
	const setSub = ( field, subField ) => ( value ) =>
		onChange( {
			...item,
			[ field ]: { ...item[ field ], [ subField ]: value },
		} );

	return (
		<div className="adaire-mpe-item-form">
			<PanelBody
				title={ __( 'Content', 'adaire-blocks' ) }
				initialOpen={ true }
			>
				<TextControl
					label={ __( 'Title', 'adaire-blocks' ) }
					value={ item.title }
					onChange={ set( 'title' ) }
				/>
				<TextControl
					label={ __( 'Eyebrow text', 'adaire-blocks' ) }
					value={ item.eyebrow }
					onChange={ set( 'eyebrow' ) }
				/>
				<TextareaControl
					label={ __( 'Description', 'adaire-blocks' ) }
					value={ item.description }
					onChange={ set( 'description' ) }
				/>
				<TextControl
					label={ __( 'Badge', 'adaire-blocks' ) }
					value={ item.badge }
					onChange={ set( 'badge' ) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Link', 'adaire-blocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'URL', 'adaire-blocks' ) }
					value={ item.url }
					onChange={ set( 'url' ) }
				/>
				<TextControl
					label={ __( 'Link label', 'adaire-blocks' ) }
					help={ __(
						'Shown on the link/button itself — leave blank to use the title.',
						'adaire-blocks'
					) }
					value={ item.linkLabel }
					onChange={ set( 'linkLabel' ) }
				/>
				<ToggleControl
					label={ __( 'Open in new tab', 'adaire-blocks' ) }
					checked={ item.openInNewTab }
					onChange={ set( 'openInNewTab' ) }
				/>
				<ToggleControl
					label={ __( 'Nofollow', 'adaire-blocks' ) }
					checked={ item.nofollow }
					onChange={ set( 'nofollow' ) }
				/>
				<TextControl
					label={ __(
						'Additional rel attribute(s)',
						'adaire-blocks'
					) }
					value={ item.rel }
					onChange={ set( 'rel' ) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Media & Icon', 'adaire-blocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Icon slug', 'adaire-blocks' ) }
					help={ __(
						'A registered Adaire Blocks icon identifier.',
						'adaire-blocks'
					) }
					value={ item.icon }
					onChange={ set( 'icon' ) }
				/>
				<MediaField
					label={ __( 'Image', 'adaire-blocks' ) }
					value={ item.image }
					onChange={ set( 'image' ) }
				/>
				<MediaField
					label={ __(
						'Mobile image (optional override)',
						'adaire-blocks'
					) }
					value={ item.mobileImage }
					onChange={ set( 'mobileImage' ) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Call to action', 'adaire-blocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'CTA label', 'adaire-blocks' ) }
					value={ item.cta.label }
					onChange={ setSub( 'cta', 'label' ) }
				/>
				<TextControl
					label={ __( 'CTA URL', 'adaire-blocks' ) }
					value={ item.cta.url }
					onChange={ setSub( 'cta', 'url' ) }
				/>
				<ToggleControl
					label={ __( 'CTA opens in new tab', 'adaire-blocks' ) }
					checked={ item.cta.openInNewTab }
					onChange={ setSub( 'cta', 'openInNewTab' ) }
				/>
				<hr />
				<TextControl
					label={ __( 'Secondary CTA label', 'adaire-blocks' ) }
					value={ item.secondaryCta.label }
					onChange={ setSub( 'secondaryCta', 'label' ) }
				/>
				<TextControl
					label={ __( 'Secondary CTA URL', 'adaire-blocks' ) }
					value={ item.secondaryCta.url }
					onChange={ setSub( 'secondaryCta', 'url' ) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Style & visibility', 'adaire-blocks' ) }
				initialOpen={ false }
			>
				<div className="adaire-mpe-color-row">
					<ColorField
						label={ __( 'Background', 'adaire-blocks' ) }
						value={ item.colors.background }
						onChange={ setSub( 'colors', 'background' ) }
					/>
					<ColorField
						label={ __( 'Text', 'adaire-blocks' ) }
						value={ item.colors.text }
						onChange={ setSub( 'colors', 'text' ) }
					/>
					<ColorField
						label={ __( 'Accent', 'adaire-blocks' ) }
						value={ item.colors.accent }
						onChange={ setSub( 'colors', 'accent' ) }
					/>
				</div>
				<TextControl
					label={ __( 'Custom CSS class', 'adaire-blocks' ) }
					value={ item.cssClass }
					onChange={ set( 'cssClass' ) }
				/>
				<ToggleControl
					label={ __( 'Featured', 'adaire-blocks' ) }
					checked={ item.featured }
					onChange={ set( 'featured' ) }
				/>
				<ToggleControl
					label={ __( 'Visible', 'adaire-blocks' ) }
					checked={ item.visible }
					onChange={ set( 'visible' ) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Accessibility', 'adaire-blocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Accessible label', 'adaire-blocks' ) }
					help={ __(
						'Overrides the visible title for screen readers — leave blank unless the title alone is ambiguous out of context.',
						'adaire-blocks'
					) }
					value={ item.ariaLabel }
					onChange={ set( 'ariaLabel' ) }
				/>
			</PanelBody>

			{ allowNesting && (
				<PanelBody
					title={ __( 'Dynamic children', 'adaire-blocks' ) }
					initialOpen={ false }
				>
					<p className="adaire-mpe-help">
						{ __(
							"Instead of manually adding items below this one, pull them from a live source (e.g. this category's latest posts).",
							'adaire-blocks'
						) }
					</p>
					<DynamicSourceFields
						value={ item.dynamicSource }
						onChange={ set( 'dynamicSource' ) }
						postTypeOptions={ postTypeOptions }
						taxonomyOptions={ taxonomyOptions }
						wooCommerceActive={ wooCommerceActive }
					/>
				</PanelBody>
			) }
		</div>
	);
}
