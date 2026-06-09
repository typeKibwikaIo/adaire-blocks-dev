import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const {
		blockId,
		cardGap,
		slidesPerView,
		loop,
		mobilePeekPercent,
		slideHeight,
		listPaddingLeft,
		containerMode,
		containerMaxWidth,
		marginTop,
		marginBottom,
		dragCursorText,
		dragCursorSize,
		dragCursorFontSize,
		dragCursorFontWeight,
		dragCursorColor,
		dragCursorBgColor,
		dragCursorTextTransform,
		borderRadius,
		paginationVisible,
		paginationActiveColor,
		paginationInactiveColor,
	} = attributes;

	// Supports legacy numeric values and new { value, unit } values.
	const normalizeResponsiveDimension = (dimension, defaults) => {
		if (typeof dimension === 'number') {
			return {
				mobile: { value: dimension, unit: 'px' },
				tablet: { value: dimension, unit: 'px' },
				smallLaptop: { value: dimension, unit: 'px' },
				desktop: { value: dimension, unit: 'px' },
				bigDesktop: { value: dimension, unit: 'px' },
			};
		}

		if (typeof dimension === 'object' && dimension !== null) {
			const looksLikeNumberMap =
				typeof dimension.mobile === 'number' ||
				typeof dimension.tablet === 'number' ||
				typeof dimension.desktop === 'number';
			if (looksLikeNumberMap) {
				return {
					mobile: { value: dimension.mobile ?? defaults.mobile.value, unit: 'px' },
					tablet: { value: dimension.tablet ?? defaults.tablet.value, unit: 'px' },
					smallLaptop: { value: dimension.smallLaptop ?? defaults.smallLaptop.value, unit: 'px' },
					desktop: { value: dimension.desktop ?? defaults.desktop.value, unit: 'px' },
					bigDesktop: { value: dimension.bigDesktop ?? defaults.bigDesktop.value, unit: 'px' },
				};
			}

			return {
				mobile: {
					value: dimension?.mobile?.value ?? defaults.mobile.value,
					unit: dimension?.mobile?.unit ?? defaults.mobile.unit,
				},
				tablet: {
					value: dimension?.tablet?.value ?? defaults.tablet.value,
					unit: dimension?.tablet?.unit ?? defaults.tablet.unit,
				},
				smallLaptop: {
					value: dimension?.smallLaptop?.value ?? defaults.smallLaptop.value,
					unit: dimension?.smallLaptop?.unit ?? defaults.smallLaptop.unit,
				},
				desktop: {
					value: dimension?.desktop?.value ?? defaults.desktop.value,
					unit: dimension?.desktop?.unit ?? defaults.desktop.unit,
				},
				bigDesktop: {
					value: dimension?.bigDesktop?.value ?? defaults.bigDesktop.value,
					unit: dimension?.bigDesktop?.unit ?? defaults.bigDesktop.unit,
				},
			};
		}

		return defaults;
	};

	const slideHeightDefaults = {
		mobile: { value: 300, unit: 'px' },
		tablet: { value: 400, unit: 'px' },
		smallLaptop: { value: 450, unit: 'px' },
		desktop: { value: 500, unit: 'px' },
		bigDesktop: { value: 500, unit: 'px' },
	};

	const normalizedSlideHeight = normalizeResponsiveDimension(slideHeight, slideHeightDefaults);

	const blockProps = useBlockProps.save({
		className: 'adaire-swiper-carousel',
		'data-block-id': blockId,
		'data-drag-cursor-text': dragCursorText,
		'data-slides-per-view-big-desktop': slidesPerView?.bigDesktop ?? slidesPerView?.desktop ?? 5,
		'data-slides-per-view-desktop': slidesPerView?.desktop ?? 4,
		'data-slides-per-view-small-laptop': slidesPerView?.smallLaptop ?? slidesPerView?.desktop ?? 4,
		'data-slides-per-view-tablet': slidesPerView?.tablet ?? 3,
		'data-slides-per-view-mobile': slidesPerView?.mobile ?? 1,
		'data-card-gap': cardGap,
		'data-loop': loop ? 'true' : 'false',
		'data-mobile-peek': mobilePeekPercent ?? 20,
		'data-pagination-visible': paginationVisible === true ? 'true' : 'false',
		style: {
			'--adaire-swiper-carousel-gap': `${cardGap}px`,
			'--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
			'--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
			'--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
			'--container-max-width-small-laptop': `${containerMaxWidth?.smallLaptop?.value ?? 1200}${containerMaxWidth?.smallLaptop?.unit ?? 'px'}`,
			'--container-max-width-big-desktop': `${containerMaxWidth?.bigDesktop?.value ?? 1200}${containerMaxWidth?.bigDesktop?.unit ?? 'px'}`,
			'--slide-height-mobile': `${normalizedSlideHeight.mobile.value}${normalizedSlideHeight.mobile.unit}`,
			'--slide-height-tablet': `${normalizedSlideHeight.tablet.value}${normalizedSlideHeight.tablet.unit}`,
			'--slide-height-small-laptop': `${normalizedSlideHeight.smallLaptop.value}${normalizedSlideHeight.smallLaptop.unit}`,
			'--slide-height-desktop': `${normalizedSlideHeight.desktop.value}${normalizedSlideHeight.desktop.unit}`,
			'--slide-height-big-desktop': `${normalizedSlideHeight.bigDesktop.value}${normalizedSlideHeight.bigDesktop.unit}`,
			'--list-padding-left-mobile': `${listPaddingLeft?.mobile ?? 10}px`,
			'--list-padding-left-tablet': `${listPaddingLeft?.tablet ?? listPaddingLeft?.mobile ?? 10}px`,
			'--list-padding-left-small-laptop': `${listPaddingLeft?.smallLaptop ?? listPaddingLeft?.desktop ?? 10}px`,
			'--list-padding-left-desktop': `${listPaddingLeft?.desktop ?? 10}px`,
			'--list-padding-left-big-desktop': `${listPaddingLeft?.bigDesktop ?? listPaddingLeft?.desktop ?? 10}px`,
			marginTop: `${marginTop}px`,
			marginBottom: `${marginBottom}px`,
			'--adaire-swiper-carousel-drag-cursor-size': `${dragCursorSize}px`,
			'--adaire-swiper-carousel-drag-cursor-font-size': `${dragCursorFontSize}px`,
			'--adaire-swiper-carousel-drag-cursor-font-weight': dragCursorFontWeight,
			'--adaire-swiper-carousel-drag-cursor-color': dragCursorColor,
			'--adaire-swiper-carousel-drag-cursor-bg': dragCursorBgColor,
			'--adaire-swiper-carousel-drag-cursor-text-transform': dragCursorTextTransform,
			'--slide-border-radius': borderRadius > 0 ? `${borderRadius}px` : '0',
			'--pagination-active-color': paginationActiveColor || '#000000',
			'--pagination-inactive-color': paginationInactiveColor || 'rgba(0, 0, 0, 0.5)',
		},
	});

	return (
		<div {...blockProps}>
			<div
				className={`adaire-swiper-carousel__container ${
					containerMode === 'constrained' ? 'is-constrained' : ''
				}`}
			>
				<div className="adaire-swiper-carousel__wrapper">
					<div className="adaire-swiper-carousel__swiper swiper">
						<div className="adaire-swiper-carousel__list swiper-wrapper">
							<InnerBlocks.Content />
						</div>
						{paginationVisible === true && (
							<div className="swiper-pagination adaire-swiper-carousel__pagination" />
						)}
					</div>
				</div>
			</div>

			<div className="adaire-swiper-carousel__drag-cursor">
				{dragCursorText}
			</div>
		</div>
	);
}



