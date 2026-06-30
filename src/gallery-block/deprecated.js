/**
 * Gallery (gallery-block) deprecations — most recent first.
 *
 * v1  Frozen copy of the save() that shipped before ADAB-010 added full
 *     typography controls (font size, font weight, line-height, letter-
 *     spacing, text-transform, font family) for the image captions —
 *     unconditionally, for every instance, regardless of whether the user
 *     ever opens the new "Typography" panel. Posts saved before that change
 *     don't have those custom properties in their stored markup, so
 *     re-running the *current* save() (which now sources its style object
 *     from the updated getGalleryStyles() helper) against them would
 *     produce a style attribute with extra declarations that don't match
 *     what's stored, and Gutenberg would flag them as invalid content. This
 *     entry inlines its own copy of the pre-edit getGalleryStyles() logic so
 *     it stays correct even though the live helpers.js has since changed.
 *     No attribute schema changed shape (the new attributes are purely
 *     additive with safe defaults that reproduce the original hardcoded
 *     SCSS values), so `migrate` is a no-op identity function and this
 *     entry doesn't need its own `attributes` key (Gutenberg falls back to
 *     the current block.json attributes when parsing a deprecated entry
 *     that omits one).
 */
import { useBlockProps } from '@wordpress/block-editor';

const DEVICES = [ 'desktop', 'tablet', 'mobile', 'smartwatch' ];

// CSS variable suffix convention shared across Adaire Blocks: "smartwatch" maps to "watch".
const suffixFor = ( device ) => ( device === 'smartwatch' ? 'watch' : device );

const getUnitValue = ( value, fallbackValue, fallbackUnit ) =>
	`${ value?.value ?? fallbackValue }${ value?.unit ?? fallbackUnit }`;

const getColumnsForDevice = ( columns, device, fallbackValue = 4 ) => {
	if ( columns === null || columns === undefined ) {
		return fallbackValue;
	}

	if ( typeof columns === 'number' ) {
		return columns;
	}

	const deviceValue = columns[ device ];
	if ( typeof deviceValue === 'number' ) {
		return deviceValue;
	}

	return fallbackValue;
};

const DEFAULT_COLUMNS = { desktop: 4, tablet: 3, mobile: 2, smartwatch: 1 };

// Pre-ADAB-010 copy of getGalleryStyles() — no typography custom properties.
const getGalleryStylesV1 = ( attributes ) => {
	const {
		columns,
		gap,
		aspectRatio,
		imageBorderRadius,
		containerMaxWidth,
	} = attributes;

	const styles = {
		'--gb-columns': getColumnsForDevice( columns, 'desktop', DEFAULT_COLUMNS.desktop ),
		'--gb-gap': `${ gap ?? 16 }px`,
		'--gb-aspect-ratio': aspectRatio && aspectRatio !== 'auto' ? aspectRatio : 'auto',
		'--gb-radius': `${ imageBorderRadius ?? 8 }px`,
		'--container-max-width': getUnitValue( containerMaxWidth?.desktop, 1200, 'px' ),
	};

	DEVICES.filter( ( device ) => device !== 'desktop' ).forEach( ( device ) => {
		const suffix = suffixFor( device );
		styles[ `--gb-columns-${ suffix }` ] = getColumnsForDevice(
			columns,
			device,
			DEFAULT_COLUMNS[ device ]
		);
		styles[ `--container-max-width-${ suffix }` ] = getUnitValue(
			containerMaxWidth?.[ device ],
			100,
			'%'
		);
	} );

	return styles;
};

const deprecatedV1 = {
	migrate( attributes ) {
		return attributes;
	},

	save( { attributes } ) {
		const {
			blockId,
			images,
			layoutMode,
			hoverEffect,
			lightboxEnabled,
			captionsEnabled,
			containerMode,
		} = attributes;

		const blockProps = useBlockProps.save( {
			className: 'gallery-block',
			style: getGalleryStylesV1( attributes ),
		} );

		const items = images || [];

		return (
			<div
				{ ...blockProps }
				data-block-id={ blockId }
				data-lightbox={ lightboxEnabled ? 'true' : 'false' }
			>
				<div
					className={ `gallery-block__container ${
						containerMode === 'constrained' ? 'is-constrained' : ''
					}` }
				>
					<div
						className={ `gallery-block__grid ${
							layoutMode === 'masonry' ? 'is-masonry' : ''
						} gallery-block__grid--hover-${ hoverEffect }` }
					>
						{ items.map( ( image, index ) => (
							<figure className="gallery-block__item" key={ image.id || index }>
								<div className="gallery-block__item-inner">
									<img
										src={ image.url }
										alt={ image.alt || '' }
										loading="lazy"
										data-index={ index }
										data-full={ image.url }
										data-caption={ image.caption || '' }
									/>
								</div>
								{ captionsEnabled && image.caption ? (
									<figcaption className="gallery-block__caption">{ image.caption }</figcaption>
								) : null }
							</figure>
						) ) }
					</div>
				</div>
			</div>
		);
	},
};

export default [ deprecatedV1 ];
