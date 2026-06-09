import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const {
		blockId,
		items,
		cardHeight,
		cardGap,
		slidesPerView,
		loop,
		mobilePeekPercent,
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
		metaTextAlign,
		responsiveMetaTextAlign,
		nameFontSize,
		responsiveNameFontSize,
		positionFontSize,
		responsivePositionFontSize,
		nameColor,
		positionColor,
		metaBgColor,
		socialIconSize,
		responsiveSocialIconSize,
		socialIconColor,
		socialIconHoverColor,
	} = attributes;

	const normalizeDimension = (dimension, defaults) => {
		// Legacy: number => px
		if (typeof dimension === 'number') {
			return { value: dimension, unit: 'px' };
		}
		if (typeof dimension === 'object' && dimension !== null) {
			return {
				value: dimension?.value ?? defaults.value,
				unit: dimension?.unit ?? defaults.unit,
			};
		}
		return defaults;
	};

	// Supports legacy numeric values and new { value, unit } values for responsive dimensions
	const normalizeResponsiveDimension = (dimension, defaults) => {
		if (typeof dimension === 'number') {
			return {
				desktop: { value: dimension, unit: 'px' },
				tablet: { value: dimension, unit: 'px' },
				mobile: { value: dimension, unit: 'px' },
				smartwatch: { value: dimension, unit: 'px' },
			};
		}

		if (typeof dimension === 'object' && dimension !== null) {
			const looksLikeNumberMap =
				typeof dimension.mobile === 'number' ||
				typeof dimension.tablet === 'number' ||
				typeof dimension.desktop === 'number';
			if (looksLikeNumberMap) {
				return {
					desktop: { value: dimension.desktop ?? defaults.desktop.value, unit: 'px' },
					tablet: { value: dimension.tablet ?? defaults.tablet.value, unit: 'px' },
					mobile: { value: dimension.mobile ?? defaults.mobile.value, unit: 'px' },
					smartwatch: { value: dimension.smartwatch ?? defaults.smartwatch.value, unit: 'px' },
				};
			}

			return {
				desktop: {
					value: dimension?.desktop?.value ?? defaults.desktop.value,
					unit: dimension?.desktop?.unit ?? defaults.desktop.unit,
				},
				tablet: {
					value: dimension?.tablet?.value ?? defaults.tablet.value,
					unit: dimension?.tablet?.unit ?? defaults.tablet.unit,
				},
				mobile: {
					value: dimension?.mobile?.value ?? defaults.mobile.value,
					unit: dimension?.mobile?.unit ?? defaults.mobile.unit,
				},
				smartwatch: {
					value: dimension?.smartwatch?.value ?? defaults.smartwatch.value,
					unit: dimension?.smartwatch?.unit ?? defaults.smartwatch.unit,
				},
			};
		}

		return defaults;
	};

	const cardHeightDefaults = {
		desktop: { value: 460, unit: 'px' },
		tablet: { value: 400, unit: 'px' },
		mobile: { value: 350, unit: 'px' },
		smartwatch: { value: 300, unit: 'px' },
	};
	const normalizedCardHeight = normalizeResponsiveDimension(cardHeight, cardHeightDefaults);

	const blockProps = useBlockProps.save({
		className: 'adaire-video-carousel splide adaire-video-carousel--splide',
		'data-block-id': blockId,
		'data-drag-cursor-text': dragCursorText,
		'data-slides-per-view-desktop': slidesPerView?.desktop ?? 4,
		'data-slides-per-view-tablet': slidesPerView?.tablet ?? 3,
		'data-slides-per-view-mobile': slidesPerView?.mobile ?? 2,
		'data-slides-per-view-watch': slidesPerView?.smartwatch ?? 1,
		'data-card-gap': cardGap,
		'data-loop': loop ? 'true' : 'false',
		'data-mobile-peek': mobilePeekPercent ?? 20,
		style: {
			'--adaire-video-carousel-card-height': `${normalizedCardHeight.desktop.value}${normalizedCardHeight.desktop.unit}`,
			'--adaire-video-carousel-card-height-tablet': `${normalizedCardHeight.tablet.value}${normalizedCardHeight.tablet.unit}`,
			'--adaire-video-carousel-card-height-mobile': `${normalizedCardHeight.mobile.value}${normalizedCardHeight.mobile.unit}`,
			'--adaire-video-carousel-card-height-watch': `${normalizedCardHeight.smartwatch.value}${normalizedCardHeight.smartwatch.unit}`,
			'--adaire-video-carousel-gap': `${cardGap?.desktop ?? 24}px`,
			'--adaire-video-carousel-gap-tablet': `${cardGap?.tablet ?? 20}px`,
			'--adaire-video-carousel-gap-mobile': `${cardGap?.mobile ?? 16}px`,
			'--adaire-video-carousel-gap-watch': `${cardGap?.smartwatch ?? 12}px`,
			'--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
			'--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
			'--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
			'--container-max-width-watch': `${containerMaxWidth?.smartwatch?.value ?? 100}${containerMaxWidth?.smartwatch?.unit ?? '%'}`,
			'--list-padding-left': `${listPaddingLeft?.desktop ?? 10}px`,
			'--list-padding-left-tablet': `${listPaddingLeft?.tablet ?? 10}px`,
			'--list-padding-left-mobile': `${listPaddingLeft?.mobile ?? 10}px`,
			'--list-padding-left-watch': `${listPaddingLeft?.smartwatch ?? 5}px`,
			marginTop: `${marginTop?.desktop ?? 0}px`,
			marginBottom: `${marginBottom?.desktop ?? 0}px`,
			'--margin-top-tablet': `${marginTop?.tablet ?? 0}px`,
			'--margin-bottom-tablet': `${marginBottom?.tablet ?? 0}px`,
			'--margin-top-mobile': `${marginTop?.mobile ?? 0}px`,
			'--margin-bottom-mobile': `${marginBottom?.mobile ?? 0}px`,
			'--margin-top-watch': `${marginTop?.smartwatch ?? 0}px`,
			'--margin-bottom-watch': `${marginBottom?.smartwatch ?? 0}px`,
			'--adaire-video-carousel-drag-cursor-size': `${dragCursorSize?.desktop ?? 80}px`,
			'--adaire-video-carousel-drag-cursor-size-tablet': `${dragCursorSize?.tablet ?? 70}px`,
			'--adaire-video-carousel-drag-cursor-size-mobile': `${dragCursorSize?.mobile ?? 60}px`,
			'--adaire-video-carousel-drag-cursor-size-watch': `${dragCursorSize?.smartwatch ?? 50}px`,
			'--adaire-video-carousel-drag-cursor-font-size': `${dragCursorFontSize?.desktop ?? 16}px`,
			'--adaire-video-carousel-drag-cursor-font-size-tablet': `${dragCursorFontSize?.tablet ?? 14}px`,
			'--adaire-video-carousel-drag-cursor-font-size-mobile': `${dragCursorFontSize?.mobile ?? 12}px`,
			'--adaire-video-carousel-drag-cursor-font-size-watch': `${dragCursorFontSize?.smartwatch ?? 10}px`,
			'--adaire-video-carousel-drag-cursor-font-weight': dragCursorFontWeight,
			'--adaire-video-carousel-drag-cursor-color': dragCursorColor,
			'--adaire-video-carousel-drag-cursor-bg': dragCursorBgColor,
			'--adaire-video-carousel-drag-cursor-text-transform': dragCursorTextTransform,
			'--adaire-video-carousel-meta-align-desktop': responsiveMetaTextAlign?.desktop || metaTextAlign || 'left',
			'--adaire-video-carousel-meta-align-tablet': responsiveMetaTextAlign?.tablet || metaTextAlign || 'left',
			'--adaire-video-carousel-meta-align-mobile': responsiveMetaTextAlign?.mobile || metaTextAlign || 'left',
			'--adaire-video-carousel-meta-align-watch': responsiveMetaTextAlign?.smartwatch || metaTextAlign || 'left',
			'--adaire-video-carousel-name-font-size-desktop': `${responsiveNameFontSize?.desktop ?? nameFontSize ?? 20}px`,
			'--adaire-video-carousel-name-font-size-tablet': `${responsiveNameFontSize?.tablet ?? nameFontSize ?? 18}px`,
			'--adaire-video-carousel-name-font-size-mobile': `${responsiveNameFontSize?.mobile ?? nameFontSize ?? 16}px`,
			'--adaire-video-carousel-name-font-size-watch': `${responsiveNameFontSize?.smartwatch ?? nameFontSize ?? 14}px`,
			'--adaire-video-carousel-position-font-size-desktop': `${responsivePositionFontSize?.desktop ?? positionFontSize ?? 18}px`,
			'--adaire-video-carousel-position-font-size-tablet': `${responsivePositionFontSize?.tablet ?? positionFontSize ?? 16}px`,
			'--adaire-video-carousel-position-font-size-mobile': `${responsivePositionFontSize?.mobile ?? positionFontSize ?? 14}px`,
			'--adaire-video-carousel-position-font-size-watch': `${responsivePositionFontSize?.smartwatch ?? positionFontSize ?? 12}px`,
			'--adaire-video-carousel-name-color': nameColor || '#ffffff',
			'--adaire-video-carousel-position-color': positionColor || '#d1d5db',
			'--adaire-video-carousel-meta-bg': metaBgColor || 'rgba(15, 23, 42, 0.9)',
			'--adaire-video-carousel-social-icon-size-desktop': `${responsiveSocialIconSize?.desktop ?? socialIconSize ?? 20}px`,
			'--adaire-video-carousel-social-icon-size-tablet': `${responsiveSocialIconSize?.tablet ?? socialIconSize ?? 18}px`,
			'--adaire-video-carousel-social-icon-size-mobile': `${responsiveSocialIconSize?.mobile ?? socialIconSize ?? 18}px`,
			'--adaire-video-carousel-social-icon-size-watch': `${responsiveSocialIconSize?.smartwatch ?? socialIconSize ?? 16}px`,
			'--adaire-video-carousel-social-icon-color': socialIconColor || '#ffffff',
			'--adaire-video-carousel-social-icon-hover-color': socialIconHoverColor || '#e5e7eb',
		},
	});

	return (
		<div {...blockProps}>
			<div
				className={`adaire-video-carousel__container ${
					containerMode === 'constrained' ? 'is-constrained' : ''
				}`}
			>
				<div className="adaire-video-carousel__wrapper">
					<div className="adaire-video-carousel__swiper swiper">
						<div className="adaire-video-carousel__list swiper-wrapper">
						{items.map((item, index) => (
							<div
								key={`${item.id}-${index}`}
								className="adaire-video-carousel__slide swiper-slide"
								data-video-id={item.id}
							>
								<div className="adaire-video-carousel__card">
									<div className="adaire-video-carousel__video">
										{item.useImageOnly && item.imageUrl ? (
											<img
												src={item.imageUrl}
												alt={item.title || ''}
											/>
										) : item.videoUrl ? (
											<>
												<video
													src={item.videoUrl}
													poster={item.posterUrl || undefined}
													controls
												/>
												<button
													className="adaire-video-carousel__video-overlay-play"
													type="button"
													aria-label="Play video"
												>
													<span className="adaire-video-carousel__video-overlay-play-icon" />
												</button>
											</>
										) : (
											<div className="adaire-video-carousel__placeholder">
												<span>Video URL not set</span>
											</div>
										)}
									</div>
									{(item.title || item.position || item.social1Url || item.social2Url || item.social3Url) && (
										<div className="adaire-video-carousel__meta">
											<div className="adaire-video-carousel__meta-text">
												{item.title && (
													<p className="adaire-video-carousel__title">
														{item.title}
													</p>
												)}
												{item.position && (
													<p className="adaire-video-carousel__position">
														{item.position}
													</p>
												)}
											</div>
											<div className="adaire-video-carousel__meta-icons">
												{item.social1Url && item.social1IconClass && (
													<a
														href={item.social1Url}
														target="_blank"
														rel="noopener noreferrer"
													>
														<i className={item.social1IconClass} />
													</a>
												)}
												{item.social2Url && item.social2IconClass && (
													<a
														href={item.social2Url}
														target="_blank"
														rel="noopener noreferrer"
													>
														<i className={item.social2IconClass} />
													</a>
												)}
												{item.social3Url && item.social3IconClass && (
													<a
														href={item.social3Url}
														target="_blank"
														rel="noopener noreferrer"
													>
														<i className={item.social3IconClass} />
													</a>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						))}
						</div>
						<div className="swiper-pagination adaire-video-carousel__pagination" />
					</div>
				</div>
			</div>

			<div className="adaire-video-carousel__drag-cursor">
				{dragCursorText}
			</div>
		</div>
	);
}





