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
} from '@wordpress/components';
import { image as imageIcon } from '@wordpress/icons';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher from '../components/DeviceSwitcher';
import UpgradeNotice from '../components/UpgradeNotice';
import { useBlockLimits } from '../components/useBlockLimits';
import { getGalleryStyles, getColumnsForDevice, mediaToImageItem } from './helpers';

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
			{ __( 'Add Images', 'gallery-block' ) }
		</Button>
	);

	return (
		<>
			<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
				<PanelBody title={ __( 'Images', 'gallery-block' ) } initialOpen={ true }>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ onSelectImages }
							allowedTypes={ [ 'image' ] }
							multiple
							gallery
							render={ renderAddImagesButton }
						/>
					</MediaUploadCheck>
					<p className="gallery-block__count-hint">
						{ sprintf(
							/* translators: 1: current image count, 2: max images allowed (or unlimited) */
							__( '%1$d of %2$s images used', 'gallery-block' ),
							images?.length || 0,
							maxItems === Infinity ? __( 'unlimited', 'gallery-block' ) : maxItems
						) }
					</p>
					{ showUpgradeNotice && (
						<UpgradeNotice variant="inline" itemType="image" message={ upgradeMessage } />
					) }
				</PanelBody>

				<PanelBody title={ __( 'Layout', 'gallery-block' ) } initialOpen={ true }>
					<p style={ { fontWeight: 600, marginBottom: 8 } }>
						{ __( 'Layout Mode', 'gallery-block' ) }
					</p>
					<ButtonGroup style={ { display: 'flex', marginBottom: 16 } }>
						<Button
							isPrimary={ layoutMode === 'grid' }
							isSecondary={ layoutMode !== 'grid' }
							onClick={ () => setAttributes( { layoutMode: 'grid' } ) }
						>
							{ __( 'Grid', 'gallery-block' ) }
						</Button>
						<Button
							isPrimary={ layoutMode === 'masonry' }
							isSecondary={ layoutMode !== 'masonry' }
							onClick={ () => setAttributes( { layoutMode: 'masonry' } ) }
						>
							{ __( 'Masonry', 'gallery-block' ) }
						</Button>
					</ButtonGroup>

					<DeviceSwitcher
						deviceType={ device }
						setDeviceType={ setDevice }
						label={ __( 'Columns', 'gallery-block' ) }
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
							'gallery-block'
						) }
					/>

					<RangeControl
						label={ __( 'Gap', 'gallery-block' ) }
						value={ gap }
						min={ 0 }
						max={ 60 }
						onChange={ ( value ) => setAttributes( { gap: value } ) }
					/>

					{ layoutMode === 'grid' && (
						<SelectControl
							label={ __( 'Image Aspect Ratio', 'gallery-block' ) }
							value={ aspectRatio }
							options={ [
								{ label: __( 'Square (1:1)', 'gallery-block' ), value: '1/1' },
								{ label: __( 'Landscape (4:3)', 'gallery-block' ), value: '4/3' },
								{ label: __( 'Portrait (3:4)', 'gallery-block' ), value: '3/4' },
								{ label: __( 'Widescreen (16:9)', 'gallery-block' ), value: '16/9' },
								{ label: __( 'Original', 'gallery-block' ), value: 'auto' },
							] }
							onChange={ ( value ) => setAttributes( { aspectRatio: value } ) }
						/>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Hover Effect', 'gallery-block' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Hover Effect', 'gallery-block' ) }
						value={ hoverEffect }
						options={ [
							{ label: __( 'Zoom', 'gallery-block' ), value: 'zoom' },
							{ label: __( 'Fade', 'gallery-block' ), value: 'fade' },
							{ label: __( 'Lift', 'gallery-block' ), value: 'lift' },
							{ label: __( 'None', 'gallery-block' ), value: 'none' },
						] }
						onChange={ ( value ) => setAttributes( { hoverEffect: value } ) }
					/>
					<RangeControl
						label={ __( 'Image Corner Radius', 'gallery-block' ) }
						value={ imageBorderRadius }
						min={ 0 }
						max={ 40 }
						onChange={ ( value ) => setAttributes( { imageBorderRadius: value } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Captions & Lightbox', 'gallery-block' ) } initialOpen={ false }>
					<ToggleControl
						label={ __( 'Enable click-to-enlarge lightbox', 'gallery-block' ) }
						checked={ !! lightboxEnabled }
						onChange={ ( value ) => setAttributes( { lightboxEnabled: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show image captions', 'gallery-block' ) }
						checked={ !! captionsEnabled }
						onChange={ ( value ) => setAttributes( { captionsEnabled: value } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Container Settings', 'gallery-block' ) } initialOpen={ false }>
					<p style={ { fontWeight: 600, marginBottom: 8 } }>
						{ __( 'Width', 'gallery-block' ) }
					</p>
					<ButtonGroup style={ { display: 'flex', marginBottom: 16 } }>
						<Button
							isPrimary={ containerMode === 'full' }
							isSecondary={ containerMode !== 'full' }
							onClick={ () => setAttributes( { containerMode: 'full' } ) }
						>
							{ __( 'Full Width', 'gallery-block' ) }
						</Button>
						<Button
							isPrimary={ containerMode === 'constrained' }
							isSecondary={ containerMode !== 'constrained' }
							onClick={ () => setAttributes( { containerMode: 'constrained' } ) }
						>
							{ __( 'Constrained', 'gallery-block' ) }
						</Button>
					</ButtonGroup>
					{ containerMode === 'constrained' && (
						<TextControl
							type="number"
							label={ __( 'Max Width (px)', 'gallery-block' ) }
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
						label={ __( 'Block ID', 'gallery-block' ) }
						value={ blockId }
						onChange={ ( value ) => setAttributes( { blockId: value } ) }
						help={ __( 'Optional. Add a custom ID for CSS targeting or anchor links.', 'gallery-block' ) }
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
							label={ __( 'Gallery', 'gallery-block' ) }
							instructions={ __(
								'Add one or more images to build your gallery. Use a single image for a hero-style layout, or add many for a full grid or masonry wall — change this anytime from the sidebar.',
								'gallery-block'
							) }
						>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ onSelectImages }
									allowedTypes={ [ 'image' ] }
									multiple
									gallery
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
													label={ __( 'Move earlier', 'gallery-block' ) }
													onClick={ () => moveImage( index, -1 ) }
													disabled={ index === 0 }
												/>
												<Button
													icon="arrow-right-alt2"
													label={ __( 'Move later', 'gallery-block' ) }
													onClick={ () => moveImage( index, 1 ) }
													disabled={ index === images.length - 1 }
												/>
												<Button
													icon="trash"
													label={ __( 'Remove image', 'gallery-block' ) }
													isDestructive
													onClick={ () => removeImage( index ) }
												/>
											</div>
										</div>
										{ captionsEnabled && (
											<TextControl
												className="gallery-block__caption-input"
												placeholder={ __( 'Add a caption…', 'gallery-block' ) }
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
										gallery
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
