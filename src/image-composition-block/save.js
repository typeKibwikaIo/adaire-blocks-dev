import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const {
		blockId,
		images = [],
		gap,
		borderRadius,
		containerMode,
		containerMaxWidth,
	} = attributes;

	const blockProps = useBlockProps.save({
		className: 'adaire-image-composition',
		id: blockId || undefined,
		style: {
			'--adaire-image-composition-gap': `${gap}px`,
			'--adaire-image-composition-radius': `${borderRadius}px`,
			'--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
			'--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
			'--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
		},
	});

	return (
		<div {...blockProps}>
			<div
				className={`adaire-image-composition__container ${
					containerMode === 'constrained' ? 'is-constrained' : ''
				}`}
			>
				<div className="adaire-image-composition__grid">
					{images.map((image, index) => (
						<div
							key={image.id || index}
							className={`adaire-image-composition__item adaire-image-composition__item--pattern-${(index % 4) + 1}`}
						>
							{image.url ? (
								<img src={image.url} alt={image.alt || ''} />
							) : null}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}





