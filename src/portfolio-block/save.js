import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getDeviceValue } from '../components/DeviceSwitcher';

export default function save({ attributes }) {
	const {
		agencyTitle,
		agencyDescription,
		slides,
		backgroundColor,
		textColor,
		titleFontSize,
		textFontSize,
		slideTitleFontSize,
		slideDescriptionFontSize,
		slideTagFontSize,
		agencyTitleColor,
		agencyTitleFontWeight,
		agencyDescriptionColor,
		agencyDescriptionFontWeight,
		modalTitleColor,
		modalTitleFontWeight,
		modalDescriptionColor,
		modalDescriptionFontWeight,
		modalTagColor,
		modalTagFontWeight,
		// Button styling attributes
		buttonColor,
		buttonBackgroundColor,
		buttonHoverColor,
		buttonHoverBackgroundColor,
		buttonStyle,
		underlineColor,
		blurAmount,
		fontSize,
		showIcon,
		hoverAnimation,
		buttonPadding,
		buttonMargin,
		zIndex,
		borderRadius,
		fontWeight,
	} = attributes;

	// Debug log in development
	if (typeof console !== 'undefined' && process.env.NODE_ENV === 'development') {
	}

	const blockProps = useBlockProps.save({
		className: 'ad-portfolio-block',
		style: {
			color: textColor || '#ffffff',
			'--title-font-size': `${titleFontSize}px`,
			'--text-font-size': `${textFontSize}px`,
			'--slide-title-font-size': `${slideTitleFontSize}px`,
			'--slide-description-font-size': `${slideDescriptionFontSize}px`,
			'--slide-tag-font-size': `${slideTagFontSize}px`,
			'--agency-title-color': agencyTitleColor || '#ffffff',
			'--agency-title-font-weight': agencyTitleFontWeight || '600',
			'--agency-description-color': agencyDescriptionColor || '#ffffff',
			'--agency-description-font-weight': agencyDescriptionFontWeight || '400',
			'--modal-title-color': modalTitleColor || '#ffffff',
			'--modal-title-font-weight': modalTitleFontWeight || '700',
			'--modal-description-color': modalDescriptionColor || '#ffffff',
			'--modal-description-font-weight': modalDescriptionFontWeight || '400',
			'--modal-tag-color': modalTagColor || '#ffffff',
			'--modal-tag-font-weight': modalTagFontWeight || '400',
			// Button styling variables
			'--button-color': buttonColor || '#ffffff',
			'--button-bg-color': buttonBackgroundColor || 'transparent',
			'--button-hover-color': buttonHoverColor || '#ffffff',
			'--button-hover-bg-color': buttonHoverBackgroundColor || 'transparent',
			'--button-underline-color': underlineColor || '#ff4242',
			'--button-blur': blurAmount ? `${blurAmount}px` : '0px',
			'--button-font-size': fontSize ? `${fontSize}px` : '1.1rem',
			'--button-padding': buttonPadding && typeof buttonPadding === 'object' 
				? `${buttonPadding.top || '0.2em'} ${buttonPadding.right || '0'} ${buttonPadding.bottom || '0.2em'} ${buttonPadding.left || '0'}`
				: (buttonPadding || '0.2em 0'),
			'--button-margin': buttonMargin && typeof buttonMargin === 'object'
				? `${buttonMargin.top || '20px'} ${buttonMargin.right || '0'} ${buttonMargin.bottom || '20px'} ${buttonMargin.left || '0'}`
				: (buttonMargin || '20px 0'),
			'--button-z-index': zIndex || '1',
			'--button-border-radius': borderRadius ? `${borderRadius}px` : '0px',
			'--button-font-weight': fontWeight || '500',
		},
		'data-slides': JSON.stringify(slides),
		'data-button-style': buttonStyle || 'underline',
		'data-hover-animation': hoverAnimation || 'slide-underline'
	});

	return (
		<div {...blockProps}>
			<section 
				className="ad-portfolio-block__agency-section"
				style={{
					background: backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
				}}
			>
				<div className="ad-portfolio-block__agency-container">
					<div className="ad-portfolio-block__agency-content">
						<div className="ad-portfolio-block__agency-text">
							<div className="ad-portfolio-block__agency-description">
								<h2 className="ad-portfolio-block__agency-description-title">{agencyTitle}</h2>
								<p className="ad-portfolio-block__agency-description-text">
									{agencyDescription}
								</p>
							</div>
							<div className="ad-portfolio-block__agency-cta">
								<InnerBlocks.Content />
							</div>
						</div>
						
						<div className="ad-portfolio-block__agency-gallery">
							<div className="ad-portfolio-block__gallery-grid">
								{slides.map((slide, index) => (
									<div key={slide.id} className="ad-portfolio-block__gallery-item" data-slide-index={index}>
										{slide.slideImg ? (
										<img 
											className="ad-portfolio-block__gallery-img"
												src={slide.slideImg} 
												alt={slide.slideTitle} 
												style={{ width: '100%', height: '100%', objectFit: 'cover' }}
											/>
										) : (
											<div className="ad-portfolio-block__gallery-placeholder">
												<span>No Image</span>
											</div>
										)}
										<div className="ad-portfolio-block__gallery-overlay">
											<span className="ad-portfolio-block__gallery-overlay-text">{slide.slideTitle}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Modal Structure - Hidden by default, shown by JavaScript */}
				<div className="ad-portfolio-block__modal-overlay" style={{ display: 'none' }}>
					<div className="ad-portfolio-block__modal-content">
						<button className="ad-portfolio-block__modal-close-btn">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</button>
						<div className="ad-portfolio-block__slider">
						{/* Initial slide will be created by JavaScript */}
					</div>
				</div>
			</div>
		</div>
	);
}


