import { useBlockProps } from '@wordpress/block-editor';
import { getDeviceValue } from '../components/DeviceSwitcher';

export default function save({ attributes }) {
	const {
		agencyTitle,
		agencyDescription,
		ctaButtonText,
		slides,
		textColor,
		titleFontSize,
		textFontSize,
		slideTitleFontSize,
		slideDescriptionFontSize,
		slideTagFontSize,
		previewText,
		linkText,
		blockId,
		containerHeight,
		layoutMode = 'legacy',
		storyDuration = 8000,
	} = attributes;

	// Process slides to ensure image URLs are properly stored
	const processedSlides = (slides || []).map((slide) => ({
		...slide,
		slideImg: slide.slideImg || '',
		slideImgId: slide.slideImgId || 0,
	}));

	const firstSlideImage =
		processedSlides.length > 0 && processedSlides[0].slideImg
			? processedSlides[0].slideImg
			: '';
	const firstSlideTitle =
		processedSlides.length > 0 && processedSlides[0].slideTitle
			? processedSlides[0].slideTitle
			: 'Build';

	const styleVars = {
		color: textColor || '#ffffff',
		'--title-font-size': `${getDeviceValue(titleFontSize, 'desktop', 40)}px`,
		'--title-font-size-tablet': `${getDeviceValue(titleFontSize, 'tablet', 36)}px`,
		'--title-font-size-mobile': `${getDeviceValue(titleFontSize, 'mobile', 32)}px`,
		'--text-font-size': `${getDeviceValue(textFontSize, 'desktop', 18)}px`,
		'--text-font-size-tablet': `${getDeviceValue(textFontSize, 'tablet', 16)}px`,
		'--text-font-size-mobile': `${getDeviceValue(textFontSize, 'mobile', 14)}px`,
		'--slide-title-font-size': `${getDeviceValue(slideTitleFontSize, 'desktop', 112)}px`,
		'--slide-title-font-size-tablet': `${getDeviceValue(slideTitleFontSize, 'tablet', 96)}px`,
		'--slide-title-font-size-mobile': `${getDeviceValue(slideTitleFontSize, 'mobile', 80)}px`,
		'--slide-description-font-size': `${getDeviceValue(slideDescriptionFontSize, 'desktop', 20)}px`,
		'--slide-description-font-size-tablet': `${getDeviceValue(slideDescriptionFontSize, 'tablet', 18)}px`,
		'--slide-description-font-size-mobile': `${getDeviceValue(slideDescriptionFontSize, 'mobile', 16)}px`,
		'--slide-tag-font-size': `${getDeviceValue(slideTagFontSize, 'desktop', 20)}px`,
		'--slide-tag-font-size-tablet': `${getDeviceValue(slideTagFontSize, 'tablet', 18)}px`,
		'--slide-tag-font-size-mobile': `${getDeviceValue(slideTagFontSize, 'mobile', 16)}px`,
		'--container-height': `${getDeviceValue(containerHeight, 'desktop', 70)}vh`,
		'--container-height-tablet': `${getDeviceValue(containerHeight, 'tablet', 60)}vh`,
		'--container-height-mobile': `${getDeviceValue(containerHeight, 'mobile', 55)}vh`,
	};

	// --- Legacy mode: original GSAP scroll showcase (untouched markup) ---
	if (layoutMode === 'legacy') {
		const blockProps = useBlockProps.save({
			className: 'animation-component ad-services-block-body',
			style: styleVars,
			id: blockId || undefined,
			'data-slides': JSON.stringify(processedSlides),
			'data-preview-text': previewText || 'We:',
			'data-link-text': linkText || 'Read More',
		});

		return (
			<div {...blockProps}>
				<div className="ad-services-block-container">
					<div className="ad-services-block-cursor">
						<p className="ad-services-block-cursor-text"></p>
					</div>

					<div className="ad-services-block-story-img">
						<div className="img">
							{firstSlideImage ? (
								<img className="story-image" src={firstSlideImage} alt={firstSlideTitle} />
							) : (
								<div className="placeholder-img">Story Image</div>
							)}
						</div>
					</div>
					<div className="ad-services-block-services-overview">
						<h1>{previewText || 'We:'} </h1>
						<div className="overview-placeholder"></div>
					</div>

					<div className="ad-services-block-story-content">
						<div className="ad-services-block-row">
							<div className="ad-services-block-indices"></div>

							<div className="profile">
								<div className="profile-icon">
									{firstSlideImage ? (
										<img className="profile-image" src={firstSlideImage} alt={firstSlideTitle} />
									) : (
										<div className="placeholder-img">Profile Image</div>
									)}
								</div>
								<div className="profile-name">
									<p className="profile-text">{firstSlideTitle}</p>
								</div>
							</div>
						</div>

						<div className="row">
							<div className="title"></div>

							<div className="link">
								<a
									className="link-text"
									href={processedSlides.length > 0 ? processedSlides[0].slideUrl || '#' : '#'}
									target="_blank"
									rel="noopener noreferrer"
								>
									{linkText || 'Read More'}
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// --- New layout modes: vertical / horizontal / fullscreen / split ---
	// Root uses a distinct class so the legacy engine ignores it; the
	// AnimatedCarousel controller in view.js drives navigation.
	const blockProps = useBlockProps.save({
		className: `ad-acc ad-acc--${layoutMode}`,
		style: styleVars,
		id: blockId || undefined,
		'data-layout-mode': layoutMode,
		'data-story-duration': storyDuration,
	});

	return (
		<div {...blockProps}>
			<noscript>
				<style>{`.ad-acc__content > *,.ad-acc__header > *{opacity:1;transform:none}`}</style>
			</noscript>
			<div className="ad-acc__cursor" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none">
					<path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
			{(agencyTitle || agencyDescription) && (
				<div className="ad-acc__header">
					{agencyTitle && <h2 className="ad-acc__heading">{agencyTitle}</h2>}
					{agencyDescription && <p className="ad-acc__intro">{agencyDescription}</p>}
				</div>
			)}

			<div className="ad-acc__viewport">
				<div className="ad-acc__track">
					{processedSlides.map((slide, index) => (
						<article
							key={slide.id ?? index}
							className={`ad-acc__slide ${index === 0 ? 'is-active' : ''}`}
							data-index={index}
						>
							<div className="ad-acc__media">
								{slide.slideImg ? (
									<img src={slide.slideImg} alt={slide.slideTitle || ''} loading="lazy" />
								) : (
									<div className="ad-acc__media-placeholder" aria-hidden="true"></div>
								)}
							</div>
							<div className="ad-acc__content">
								<span className="ad-acc__num">{String(index + 1).padStart(2, '0')}</span>
								<h3 className="ad-acc__title">{slide.slideTitle}</h3>
								<p className="ad-acc__desc">{slide.slideDescription}</p>
								{Array.isArray(slide.slideTags) && slide.slideTags.length > 0 && (
									<ul className="ad-acc__tags">
										{slide.slideTags.map((tag, t) => (
											<li key={t} className="ad-acc__tag">{tag}</li>
										))}
									</ul>
								)}
								<a
									className="ad-acc__link"
									href={slide.slideUrl || '#'}
									target="_blank"
									rel="noopener noreferrer"
								>
									{linkText || 'Read More'}
								</a>
							</div>
						</article>
					))}
				</div>
			</div>

			{processedSlides.length > 1 && (
				<div className="ad-acc__nav">
					<button type="button" className="ad-acc__arrow ad-acc__arrow--prev" data-dir="prev" aria-label="Previous">
						<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>
					<div className="ad-acc__dots" role="tablist">
						{processedSlides.map((slide, index) => (
							<button
								key={slide.id ?? index}
								type="button"
								className={`ad-acc__dot ${index === 0 ? 'is-active' : ''}`}
								data-index={index}
								aria-label={`Go to slide ${index + 1}`}
							>
								<span className="ad-acc__dot-fill"></span>
							</button>
						))}
					</div>
					<button type="button" className="ad-acc__arrow ad-acc__arrow--next" data-dir="next" aria-label="Next">
						<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>
				</div>
			)}

			{ctaButtonText && processedSlides.length > 0 && (
				<div className="ad-acc__cta">
					<a className="ad-acc__cta-link" href={processedSlides[0].slideUrl || '#'}>
						{ctaButtonText}
					</a>
				</div>
			)}
		</div>
	);
}
