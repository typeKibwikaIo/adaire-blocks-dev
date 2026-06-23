import { useBlockProps } from '@wordpress/block-editor';
import { getGalleryStyles } from './helpers';

export default function save( { attributes } ) {
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
		style: getGalleryStyles( attributes ),
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
}
