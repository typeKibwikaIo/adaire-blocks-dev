import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	ButtonGroup,
	RangeControl,
	SelectControl,
	ToggleControl,
	TextControl,
	Placeholder,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { image as imageIcon } from '@wordpress/icons';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher from '../components/DeviceSwitcher';
import UpgradeNotice from '../components/UpgradeNotice';
import { useBlockLimits } from '../components/useBlockLimits';
import { getGalleryStyles, getColumnsForDevice, mediaToImageItem } from './helpers';

const FONT_FAMILY_OPTIONS = [
	{ label: 'Default (inherit theme)', value: '' },
	{ label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
	{ label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
	{ label: 'Georgia', value: 'Georgia, serif' },
	{ label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
	{ label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
	{ label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
	{ label: 'Courier New', value: "'Courier New', Courier, monospace" },
	{ label: 'System UI', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

export default function Edit( { attributes, setAttributes } ) {
	const {
		blockId,
		images,
		layoutMode,
		columns,
		gap,
		aspectRatio,
		imageBorderRadius,
		hoverEffect,
		lightboxEnabled,
		captionsEnabled,
		containerMode,
		containerMaxWidth,
		fontFamily,
		captionFontSize,
		captionFontWeight,
		captionLineHeight,
		captionLetterSpacing,
		captionTextTransform,
	} = attributes;

	const [ device, setDevice ] = useState( 'desktop' );

	const { isLimitReached, showUpgradeNotice, upgradeMessage, maxItems } = useBlockLimits(
		'gallery-block',
		images || [],
		'image'
	);

	const blockProps = useBlockProps( {
		className: 'gallery-block',
		style: getGalleryStyles( attributes ),
	} );

	const onSelectImages = ( media ) => {
		const list = Array.isArray( media ) ? media : [ media ];
		const currentCount = images?.length || 0;
		const room = maxItems === Infinity ? list.length : Math.max( 0, maxItems - currentCount );

		if ( room <= 0 ) {
			return;
		}

		const accepted = list.slice( 0, room ).map( mediaToImageItem );
		setAttributes( { images: [ ...( images || [] ), ...accepted ] } );
	};

	const updateImage = ( index, changes ) => {
		const next = [ ...images ];
		next[ index ] = { ...next[ index ], ...changes };
		setAttributes( { images: next } );
	};

	const removeImage = ( index ) => {
		setAttributes( { images: images.filter( ( _, i ) => i !== index ) } );
	};

	const moveImage = ( index, direction ) => {
		const target = index + direction;
		if ( target < 0 || target >= images.length ) {
			return;
		}
		const next = [ ...images ];
		[ next[ index ], next[ target ] ] = [ next[ target ], next[ index ] ];
		setAttributes( { images: next } );
	};

	const hasImages = images && images.length > 0;

	const renderAddImagesButton = ( { open } ) => (
		<Button variant="primary" onClick={ open } disabled={ isLimitReached }>
			{ __( 'Add Images', 'adaire-blocks' ) }
		</Button>
	);

	return (
		<>
			<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
				<PanelBody title={ __( 'Images', 'adaire-blocks' ) } initialOpen={ true }>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ onSelectImages }
							allowedTypes={ [ 'image' ] }
							multiple
							render={ renderAddImagesButton }
						/>
					</MediaUploadCheck>
					<p className="gallery-block__count-hint">
						{ sprintf(
							/* translators: 1: current image count, 2: max images allowed (or unlimited) */
							__( '%1$d of %2$s images used', 'adaire-blocks' ),
							images?.length || 0,
							maxItems === Infinity ? __( 'unlimited', 'adaire-blocks' ) : maxItems
						) }
					</p>
					{ showUpgradeNotice && (
						<UpgradeNotice variant="inline" itemType="image" message={ upgradeMessage } />
					) }
				</PanelBody>

				<PanelBody title={ __( 'Layout', 'adaire-blocks' ) } initialOpen={ true }>
					<p style={ { fontWeight: 600, marginBottom: 8 } }>
						{ __( 'Layout Mode', 'adaire-blocks' ) }
					</p>
					<ButtonGroup style={ { display: 'flex', marginBottom: 16 } }>
						<Button
							isPrimary={ layoutMode === 'grid' }
							isSecondary={ layoutMode !== 'grid' }
							onClick={ () => setAttributes( { layoutMode: 'grid' } ) }
						>
							{ __( 'Grid', 'adaire-blocks' ) }
						</Button>
						<Button
							isPrimary={ layoutMode === 'masonry' }
							isSecondary={ layoutMode !== 'masonry' }
							onClick={ () => setAttributes( { layoutMode: 'masonry' } ) }
						>
							{ __( 'Masonry', 'adaire-blocks' ) }
						</Button>
					</ButtonGroup>

					<DeviceSwitcher
						deviceType={ device }
						setDeviceType={ setDevice }
						label={ __( 'Columns', 'adaire-blocks' ) }
					/>
					<RangeControl
						value={ getColumnsForDevice( columns, device ) }
						min={ 1 }
						max={ 6 }
						onChange={ ( value ) =>
							setAttributes( { columns: { ...columns, [ device ]: value } } )
						}
						help={ __(
							'Set columns to 1 for a single stacked image layout, or higher for a multi-image grid.',
							'adaire-blocks'
						) }
					/>

					<RangeControl
						label={ __( 'Gap', 'adaire-blocks' ) }
						value={ gap }
						min={ 0 }
						max={ 60 }
						onChange={ ( value ) => setAttributes( { gap: value } ) }
					/>

					{ layoutMode === 'grid' && (
						<SelectControl
							label={ __( 'Image Aspect Ratio', 'adaire-blocks' ) }
							value={ aspectRatio }
							options={ [
								{ label: __( 'Square (1:1)', 'adaire-blocks' ), value: '1/1' },
								{ label: __( 'Landscape (4:3)', 'adaire-blocks' ), value: '4/3' },
								{ label: __( 'Portrait (3:4)', 'adaire-blocks' ), value: '3/4' },
								{ label: __( 'Widescreen (16:9)', 'adaire-blocks' ), value: '16/9' },
								{ label: __( 'Original', 'adaire-blocks' ), value: 'auto' },
							] }
							onChange={ ( value ) => setAttributes( { aspectRatio: value } ) }
						/>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Hover Effect', 'adaire-blocks' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Hover Effect', 'adaire-blocks' ) }
						value={ hoverEffect }
						options={ [
							{ label: __( 'Zoom', 'adaire-blocks' ), value: 'zoom' },
							{ label: __( 'Fade', 'adaire-blocks' ), value: 'fade' },
							{ label: __( 'Lift', 'adaire-blocks' ), value: 'lift' },
							{ label: __( 'None', 'adaire-blocks' ), value: 'none' },
						] }
						onChange={ ( value ) => setAttributes( { hoverEffect: value } ) }
					/>
					<RangeControl
						label={ __( 'Image Corner Radius', 'adaire-blocks' ) }
						value={ imageBorderRadius }
						min={ 0 }
						max={ 40 }
						onChange={ ( value ) => setAttributes( { imageBorderRadius: value } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Captions & Lightbox', 'adaire-blocks' ) } initialOpen={ false }>
					<ToggleControl
						label={ __( 'Enable click-to-enlarge lightbox', 'adaire-blocks' ) }
						checked={ !! lightboxEnabled }
						onChange={ ( value ) => setAttributes( { lightboxEnabled: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show image captions', 'adaire-blocks' ) }
						checked={ !! captionsEnabled }
						onChange={ ( value ) => setAttributes( { captionsEnabled: value } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Typography', 'adaire-blocks' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Caption Font Size (px)', 'adaire-blocks' ) }
						value={ captionFontSize }
						onChange={ ( value ) => setAttributes( { captionFontSize: value } ) }
						min={ 8 }
						max={ 32 }
						step={ 1 }
					/>

					<SelectControl
						label={ __( 'Caption Font Weight', 'adaire-blocks' ) }
						value={ captionFontWeight }
						options={ [
							{ label: 'Thin (100)', value: '100' },
							{ label: 'Extra Light (200)', value: '200' },
							{ label: 'Light (300)', value: '300' },
							{ label: 'Normal (400)', value: '400' },
							{ label: 'Medium (500)', value: '500' },
							{ label: 'Semi Bold (600)', value: '600' },
							{ label: 'Bold (700)', value: '700' },
							{ label: 'Extra Bold (800)', value: '800' },
							{ label: 'Black (900)', value: '900' },
						] }
						onChange={ ( value ) => setAttributes( { captionFontWeight: value } ) }
					/>

					<UnitControl
						label={ __( 'Caption Line Height', 'adaire-blocks' ) }
						value={ captionLineHeight }
						onChange={ ( value ) => setAttributes( { captionLineHeight: value } ) }
					/>

					<UnitControl
						label={ __( 'Caption Letter Spacing', 'adaire-blocks' ) }
						value={ captionLetterSpacing }
						onChange={ ( value ) => setAttributes( { captionLetterSpacing: value } ) }
					/>

					<SelectControl
						label={ __( 'Caption Text Transform', 'adaire-blocks' ) }
						value={ captionTextTransform }
						options={ [
							{ label: 'None', value: 'none' },
							{ label: 'Uppercase', value: 'uppercase' },
							{ label: 'Lowercase', value: 'lowercase' },
							{ label: 'Capitalize', value: 'capitalize' },
						] }
						onChange={ ( value ) => setAttributes( { captionTextTransform: value } ) }
					/>

					<SelectControl
						label={ __( 'Font Family', 'adaire-blocks' ) }
						value={ fontFamily || '' }
						options={ FONT_FAMILY_OPTIONS }
						onChange={ ( value ) => setAttributes( { fontFamily: value } ) }
						help={ __( 'Applies to the gallery block (e.g. captions).', 'adaire-blocks' ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Container Settings', 'adaire-blocks' ) } initialOpen={ false }>
					<p style={ { fontWeight: 600, marginBottom: 8 } }>
						{ __( 'Width', 'adaire-blocks' ) }
					</p>
					<ButtonGroup style={ { display: 'flex', marginBottom: 16 } }>
						<Button
							isPrimary={ containerMode === 'full' }
							isSecondary={ containerMode !== 'full' }
							onClick={ () => setAttributes( { containerMode: 'full' } ) }
						>
							{ __( 'Full Width', 'adaire-blocks' ) }
						</Button>
						<Button
							isPrimary={ containerMode === 'constrained' }
							isSecondary={ containerMode !== 'constrained' }
							onClick={ () => setAttributes( { containerMode: 'constrained' } ) }
						>
							{ __( 'Constrained', 'adaire-blocks' ) }
						</Button>
					</ButtonGroup>
					{ containerMode === 'constrained' && (
						<TextControl
							type="number"
							label={ __( 'Max Width (px)', 'adaire-blocks' ) }
							value={ containerMaxWidth?.desktop?.value ?? 1200 }
							onChange={ ( value ) =>
								setAttributes( {
									containerMaxWidth: {
										...containerMaxWidth,
										desktop: { value: Number( value ) || 0, unit: 'px' },
									},
								} )
							}
						/>
					) }
					<TextControl
						label={ __( 'Block ID', 'adaire-blocks' ) }
						value={ blockId }
						onChange={ ( value ) => setAttributes( { blockId: value } ) }
						help={ __( 'Optional. Add a custom ID for CSS targeting or anchor links.', 'adaire-blocks' ) }
					/>
				</PanelBody>
			</InspectorTabs>

			<div { ...blockProps } data-block-id={ blockId }>
				<div
					className={ `gallery-block__container ${
						containerMode === 'constrained' ? 'is-constrained' : ''
					}` }
				>
					{ ! hasImages ? (
						<Placeholder
							icon={ imageIcon }
							label={ __( 'Gallery', 'adaire-blocks' ) }
							instructions={ __(
								'Add one or more images to build your gallery. Use a single image for a hero-style layout, or add many for a full grid or masonry wall — change this anytime from the sidebar.',
								'adaire-blocks'
							) }
						>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ onSelectImages }
									allowedTypes={ [ 'image' ] }
									multiple
									render={ renderAddImagesButton }
								/>
							</MediaUploadCheck>
						</Placeholder>
					) : (
						<>
							<div
								className={ `gallery-block__grid ${
									layoutMode === 'masonry' ? 'is-masonry' : ''
								} gallery-block__grid--hover-${ hoverEffect }` }
							>
								{ images.map( ( image, index ) => (
									<div className="gallery-block__item" key={ image.id }>
										<div className="gallery-block__item-inner">
											<img src={ image.url } alt={ image.alt || '' } />
											<div className="gallery-block__item-controls">
												<Button
													icon="arrow-left-alt2"
													label={ __( 'Move earlier', 'adaire-blocks' ) }
													onClick={ () => moveImage( index, -1 ) }
													disabled={ index === 0 }
												/>
												<Button
													icon="arrow-right-alt2"
													label={ __( 'Move later', 'adaire-blocks' ) }
													onClick={ () => moveImage( index, 1 ) }
													disabled={ index === images.length - 1 }
												/>
												<Button
													icon="trash"
													label={ __( 'Remove image', 'adaire-blocks' ) }
													isDestructive
													onClick={ () => removeImage( index ) }
												/>
											</div>
										</div>
										{ captionsEnabled && (
											<TextControl
												className="gallery-block__caption-input"
												placeholder={ __( 'Add a caption…', 'adaire-blocks' ) }
												value={ image.caption || '' }
												onChange={ ( value ) => updateImage( index, { caption: value } ) }
											/>
										) }
									</div>
								) ) }
							</div>
							<div className="gallery-block__toolbar">
								<MediaUploadCheck>
									<MediaUpload
										onSelect={ onSelectImages }
										allowedTypes={ [ 'image' ] }
										multiple
										render={ renderAddImagesButton }
									/>
								</MediaUploadCheck>
							</div>
							{ showUpgradeNotice && (
								<UpgradeNotice variant="inline" itemType="image" message={ upgradeMessage } />
							) }
						</>
					) }
				</div>
			</div>
		</>
	);
}
