import { useBlockProps } from '@wordpress/block-editor';
import { getDeviceValue } from '../components/DeviceSwitcher';

export default function save({ attributes }) {
	const {
		agencyTitle,
		agencyDescription,
		ctaButtonText,
		slides,
		backgroundColor,
		textColor,
		titleFontSize,
		textFontSize,
		slideTitleFontSize,
		slideDescriptionFontSize,
		slideTagFontSize,
		previewText,
		linkText,
		blockId,
		containerHeight
	} = attributes;

	// Process slides to ensure image URLs are properly stored
	// If we have image IDs, we'll let PHP handle the URL conversion, but we store the URL if available
	const processedSlides = (slides || []).map(slide => ({
		...slide,
		// Ensure slideImg is a valid URL or empty string
		slideImg: slide.slideImg || '',
		// Ensure slideImgId is a valid number or 0
		slideImgId: slide.slideImgId || 0
	}));

	// Get the first slide's image for initial display, or use a placeholder
	const firstSlideImage = processedSlides.length > 0 && processedSlides[0].slideImg 
		? processedSlides[0].slideImg 
		: '';
	const firstSlideTitle = processedSlides.length > 0 && processedSlides[0].slideTitle
		? processedSlides[0].slideTitle
		: 'Build';

	const blockProps = useBlockProps.save({
		className: 'animation-component ad-services-block-body',
		style: {
			color: textColor || '#ffffff',
			'--title-font-size': `${getDeviceValue(titleFontSize, 'desktop', 40)}px`,
			'--title-font-size-tablet': `${getDeviceValue(titleFontSize, 'tablet', 36)}px`,
			'--title-font-size-mobile': `${getDeviceValue(titleFontSize, 'mobile', 32)}px`,
			'--title-font-size-watch': `${getDeviceValue(titleFontSize, 'smartwatch', 28)}px`,
			'--text-font-size': `${getDeviceValue(textFontSize, 'desktop', 18)}px`,
			'--text-font-size-tablet': `${getDeviceValue(textFontSize, 'tablet', 16)}px`,
			'--text-font-size-mobile': `${getDeviceValue(textFontSize, 'mobile', 14)}px`,
			'--text-font-size-watch': `${getDeviceValue(textFontSize, 'smartwatch', 12)}px`,
			'--slide-title-font-size': `${getDeviceValue(slideTitleFontSize, 'desktop', 112)}px`,
			'--slide-title-font-size-tablet': `${getDeviceValue(slideTitleFontSize, 'tablet', 96)}px`,
			'--slide-title-font-size-mobile': `${getDeviceValue(slideTitleFontSize, 'mobile', 80)}px`,
			'--slide-title-font-size-watch': `${getDeviceValue(slideTitleFontSize, 'smartwatch', 64)}px`,
			'--slide-description-font-size': `${getDeviceValue(slideDescriptionFontSize, 'desktop', 20)}px`,
			'--slide-description-font-size-tablet': `${getDeviceValue(slideDescriptionFontSize, 'tablet', 18)}px`,
			'--slide-description-font-size-mobile': `${getDeviceValue(slideDescriptionFontSize, 'mobile', 16)}px`,
			'--slide-description-font-size-watch': `${getDeviceValue(slideDescriptionFontSize, 'smartwatch', 14)}px`,
			'--slide-tag-font-size': `${getDeviceValue(slideTagFontSize, 'desktop', 20)}px`,
			'--slide-tag-font-size-tablet': `${getDeviceValue(slideTagFontSize, 'tablet', 18)}px`,
			'--slide-tag-font-size-mobile': `${getDeviceValue(slideTagFontSize, 'mobile', 16)}px`,
			'--slide-tag-font-size-watch': `${getDeviceValue(slideTagFontSize, 'smartwatch', 14)}px`,
			'--container-height': `${getDeviceValue(containerHeight, 'desktop', 70)}vh`,
			'--container-height-tablet': `${getDeviceValue(containerHeight, 'tablet', 60)}vh`,
			'--container-height-mobile': `${getDeviceValue(containerHeight, 'mobile', 55)}vh`,
			'--container-height-watch': `${getDeviceValue(containerHeight, 'smartwatch', 50)}vh`,
		},
		id: blockId || undefined,
		'data-slides': JSON.stringify(processedSlides),
		'data-preview-text': previewText || 'We:',
		'data-link-text': linkText || 'Read More'
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
					<h1>{previewText || "We:"} </h1>
					{/* Dynamic overview items will be injected here by view.js */}
					<div className="overview-placeholder">
						{/* Dynamic overview items will be injected here by view.js */}
					</div>
				</div>
		
				<div className="ad-services-block-story-content">
					<div className="ad-services-block-row">
						<div className="ad-services-block-indices">
							{/* Dynamic index indicators will be injected here by view.js */}
						</div>
		
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
						<div className="title">
							{/* Dynamic title content will be injected here by view.js */}
						</div>
		
						<div className="link">
							<a className="link-text" href={processedSlides.length > 0 ? (processedSlides[0].slideUrl || '#') : '#'} target="_blank" rel="noopener noreferrer">
								{linkText || "Read More"}
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}


