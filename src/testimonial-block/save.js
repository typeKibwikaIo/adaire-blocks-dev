import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const {
		textColor,
		arrowColor,
		dotColor,
		fontSize,
		textToDisplay,
		slidesPerView,
		spaceBetween,
		gap,
		logoSize,
		loop,
		navigation,
		blockId,
		pagination,
		scrollbar,
		slides,
		testimonials,
		maxWidth,
		cardBackgroundColor,
		blockBackgroundColor,
		logoAlignment,
		containerMode,
		containerMaxWidth,
		cardWidth,
		slidesPerViewMobile,
		slidesPerViewTablet,
		slidesPerViewDesktop,
		cardGap,
		responsivePaddingTop,
		responsivePaddingBottom,
		headingFontSize,
		contentFontSize,
		quoteFontWeight,
		quoteLineHeight,
		quoteLetterSpacing,
		quoteTextTransform,
		authorNameFontWeight,
		authorNameLineHeight,
		authorNameLetterSpacing,
		authorNameTextTransform,
		authorTitleFontSize,
		authorTitleFontWeight,
		authorTitleLineHeight,
		authorTitleLetterSpacing,
		authorTitleTextTransform,
		companyNameFontSize,
		companyNameFontWeight,
		companyNameLineHeight,
		companyNameLetterSpacing,
		companyNameTextTransform,
		fontFamily,
	} = attributes;

	const blockProps = useBlockProps.save({
		className: "ad-carousel-text-block",
		style: {
			color: textColor || "#000000",
			fontSize: `${fontSize || 16}px`,
			"--text-color": textColor || "#000000",
			"--card-gap": `${gap || 30}px`,
			"--logo-size": `${logoSize || 60}px`,
			"--arrow-color": arrowColor,
			"--dot-color": dotColor,
			"--max-width": `${maxWidth || 1200}px`,
			"--card-bg-color": cardBackgroundColor || "#ffffff",
			"--logo-alignment": logoAlignment || "center",
			"--container-max-width": `${containerMaxWidth?.desktop?.value ?? containerMaxWidth?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? containerMaxWidth?.unit ?? 'px'}`,
			"--container-max-width-tablet": `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
			"--container-max-width-mobile": `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
			"--card-width-desktop": `${cardWidth?.desktop?.value ?? 100}${cardWidth?.desktop?.unit ?? '%'}`,
			"--card-width-tablet": `${cardWidth?.tablet?.value ?? 100}${cardWidth?.tablet?.unit ?? '%'}`,
			"--card-width-mobile": `${cardWidth?.mobile?.value ?? 100}${cardWidth?.mobile?.unit ?? '%'}`,
			"--card-gap-desktop": `${cardGap?.desktop?.value ?? 30}${cardGap?.desktop?.unit ?? 'px'}`,
			"--card-gap-tablet": `${cardGap?.tablet?.value ?? 20}${cardGap?.tablet?.unit ?? 'px'}`,
			"--card-gap-mobile": `${cardGap?.mobile?.value ?? 15}${cardGap?.mobile?.unit ?? 'px'}`,
			"--carousel-padding-top": `${responsivePaddingTop?.desktop ?? 60}px`,
			"--carousel-padding-top-tablet": `${responsivePaddingTop?.tablet ?? 48}px`,
			"--carousel-padding-top-mobile": `${responsivePaddingTop?.mobile ?? 36}px`,
			"--carousel-padding-top-watch": `${responsivePaddingTop?.smartwatch ?? 24}px`,
			"--carousel-padding-bottom": `${responsivePaddingBottom?.desktop ?? 60}px`,
			"--carousel-padding-bottom-tablet": `${responsivePaddingBottom?.tablet ?? 48}px`,
			"--carousel-padding-bottom-mobile": `${responsivePaddingBottom?.mobile ?? 36}px`,
			"--carousel-padding-bottom-watch": `${responsivePaddingBottom?.smartwatch ?? 24}px`,
			// Independent heading (author name) / content (quote) typography
			// layers — must mirror edit.js exactly since this block saves
			// static markup. See style.scss's &__name / &__quote.
			"--heading-font-size": `${headingFontSize?.desktop ?? 18}px`,
			"--heading-font-size-tablet": `${headingFontSize?.tablet ?? 18}px`,
			"--heading-font-size-mobile": `${headingFontSize?.mobile ?? 18}px`,
			"--heading-font-size-watch": `${headingFontSize?.smartwatch ?? 18}px`,
			"--content-font-size": `${contentFontSize?.desktop ?? 16}px`,
			"--content-font-size-tablet": `${contentFontSize?.tablet ?? 16}px`,
			"--content-font-size-mobile": `${contentFontSize?.mobile ?? 16}px`,
			"--content-font-size-watch": `${contentFontSize?.smartwatch ?? 16}px`,
			// Quote (content) typography — must mirror edit.js exactly since
			// this block saves static markup.
			"--quote-font-weight": `${quoteFontWeight?.desktop ?? '400'}`,
			"--quote-font-weight-tablet": `${quoteFontWeight?.tablet ?? '400'}`,
			"--quote-font-weight-mobile": `${quoteFontWeight?.mobile ?? '400'}`,
			"--quote-font-weight-watch": `${quoteFontWeight?.smartwatch ?? '400'}`,
			"--quote-line-height": `${quoteLineHeight?.desktop ?? '1.6'}`,
			"--quote-line-height-tablet": `${quoteLineHeight?.tablet ?? '1.6'}`,
			"--quote-line-height-mobile": `${quoteLineHeight?.mobile ?? '1.6'}`,
			"--quote-line-height-watch": `${quoteLineHeight?.smartwatch ?? '1.6'}`,
			"--quote-letter-spacing": quoteLetterSpacing || 'normal',
			"--quote-text-transform": quoteTextTransform || 'none',
			// Author name (heading) typography
			"--author-name-font-weight": `${authorNameFontWeight?.desktop ?? '700'}`,
			"--author-name-font-weight-tablet": `${authorNameFontWeight?.tablet ?? '700'}`,
			"--author-name-font-weight-mobile": `${authorNameFontWeight?.mobile ?? '700'}`,
			"--author-name-font-weight-watch": `${authorNameFontWeight?.smartwatch ?? '700'}`,
			"--author-name-line-height": `${authorNameLineHeight?.desktop ?? '1.5'}`,
			"--author-name-line-height-tablet": `${authorNameLineHeight?.tablet ?? '1.5'}`,
			"--author-name-line-height-mobile": `${authorNameLineHeight?.mobile ?? '1.5'}`,
			"--author-name-line-height-watch": `${authorNameLineHeight?.smartwatch ?? '1.5'}`,
			"--author-name-letter-spacing": authorNameLetterSpacing || 'normal',
			"--author-name-text-transform": authorNameTextTransform || 'none',
			// Author title — flat (no prior attribute/shape existed for this role)
			"--author-title-font-size": authorTitleFontSize || '14px',
			"--author-title-font-weight": authorTitleFontWeight || '400',
			"--author-title-line-height": authorTitleLineHeight || '1.5',
			"--author-title-letter-spacing": authorTitleLetterSpacing || 'normal',
			"--author-title-text-transform": authorTitleTextTransform || 'none',
			// Company name (logo placeholder fallback) — flat, fallback-only role
			"--company-name-font-size": companyNameFontSize || '18px',
			"--company-name-font-weight": companyNameFontWeight || '700',
			"--company-name-line-height": companyNameLineHeight || '1.5',
			"--company-name-letter-spacing": companyNameLetterSpacing || '1px',
			"--company-name-text-transform": companyNameTextTransform || 'none',
			"--testimonial-font-family": fontFamily || 'inherit',
			...(blockBackgroundColor && { background: blockBackgroundColor })
		},
		'data-slides-per-view': slidesPerView || 3,
		'data-slides-per-view-mobile': slidesPerViewMobile || 1,
		'data-slides-per-view-tablet': slidesPerViewTablet || 2,
		'data-slides-per-view-desktop': slidesPerViewDesktop || 3,
		'data-space-between': spaceBetween || 50,
		'data-card-gap-desktop': cardGap?.desktop?.value ?? 30,
		'data-card-gap-tablet': cardGap?.tablet?.value ?? 20,
		'data-card-gap-mobile': cardGap?.mobile?.value ?? 15,
		'data-loop': loop ? 'true' : 'false',
		'data-navigation': navigation ? 'true' : 'false',
		'data-pagination': pagination ? 'true' : 'false',
		'data-scrollbar': scrollbar ? 'true' : 'false',
		'data-container-mode': containerMode || 'full',
		"data-slides": slides || 3,
		"data-arrowcolor": arrowColor || "#ff0000",
		id: blockId || undefined
	});

	return (
		<div {...blockProps}>
			<div className="ad-carousel-text-block__testimonial-carousel">
				<div className="splide">
					<div className="splide__track">
						<div className="splide__list">
							{(testimonials || []).map((testimonial, index) => (
								<div key={index} className="splide__slide">
									<div 
										className="ad-carousel-text-block__testimonial-card"
										style={{
											"--logo-size": `${logoSize || 60}px`,
										}}
									>
										<div className="ad-carousel-text-block__company-logo">
										{testimonial.companyLogo ? (
											<>
												<img 
													src={testimonial.companyLogo} 
													alt={testimonial.companyName}
													style={{
														height: `${logoSize || 60}px`,
														objectFit: "contain",
														width: "auto"
													}}
													loading="lazy"
													onError={(e) => {
														e.target.style.display = 'none';
														e.target.nextSibling.style.display = 'block';
													}}
												/>
												<div 
													className="ad-carousel-text-block__logo-placeholder"
													style={{ display: 'none' }}
												>
													{testimonial.companyName}
												</div>
											</>
										) : (
												<div className="ad-carousel-text-block__logo-placeholder">{testimonial.companyName}</div>
										)}
										</div>
										<div className="ad-carousel-text-block__quote">
											"{testimonial.quote}"
										</div>
										<br/>
										<br/>
										<div className="ad-carousel-text-block__author">
											<div className="ad-carousel-text-block__name">{testimonial.authorName}</div>
											<div className="ad-carousel-text-block__title">{testimonial.authorTitle}</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}



