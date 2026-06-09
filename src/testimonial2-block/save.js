import { useBlockProps, RichText } from '@wordpress/block-editor';

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
    const value = dimension?.value ?? fallbackValue;
    const unit = dimension?.unit ?? fallbackUnit;
    return `${value}${unit}`;
};

const Testimonial2Save = ({ attributes }) => {
    const {
        blockId,
        containerMode,
        containerMaxWidth,
        testimonials,
        quoteImage,
        backgroundColor,
        cardBackgroundColor,
        navButtonBackground,
        navButtonHoverBackground,
        navButtonSize,
        navArrowSize,
        quoteImageWidth,
        quoteImageOpacity,
        logoWidth,
        personImageSize,
        personImageBorderRadius,
        descriptionFontSize,
        descriptionFontWeight,
        descriptionColor,
        nameFontSize,
        nameFontWeight,
        nameColor,
        titleFontSize,
        titleFontWeight,
        titleColor,
        carouselSpeed,
        spaceBetween,
    } = attributes;

    const blockProps = useBlockProps.save({
        id: blockId || undefined,
        className: 'ad-testimonial-block',
        'data-carousel-speed': carouselSpeed,
        'data-space-between': spaceBetween,
        style: {
            '--testimonial-bg-color': backgroundColor,
            '--card-bg-color': cardBackgroundColor,
            '--nav-btn-bg': navButtonBackground,
            '--nav-btn-hover-bg': navButtonHoverBackground,
            '--nav-btn-size': `${navButtonSize}px`,
            '--nav-arrow-size': `${navArrowSize}px`,
            '--quote-img-width': `${quoteImageWidth}px`,
            '--quote-img-opacity': quoteImageOpacity,
            '--logo-width': `${logoWidth}px`,
            '--person-img-size': formatDimensionValue(personImageSize?.desktop, 300, 'px'),
            '--person-img-size-tablet': formatDimensionValue(personImageSize?.tablet, 200, 'px'),
            '--person-img-size-mobile': formatDimensionValue(personImageSize?.mobile, 150, 'px'),
            '--person-img-radius': `${personImageBorderRadius}%`,
            '--description-font-size': formatDimensionValue(descriptionFontSize?.desktop, 18, 'px'),
            '--description-font-size-tablet': formatDimensionValue(descriptionFontSize?.tablet, 16, 'px'),
            '--description-font-size-mobile': formatDimensionValue(descriptionFontSize?.mobile, 14, 'px'),
            '--description-font-weight': descriptionFontWeight,
            '--description-color': descriptionColor,
            '--name-font-size': formatDimensionValue(nameFontSize?.desktop, 22, 'px'),
            '--name-font-size-tablet': formatDimensionValue(nameFontSize?.tablet, 20, 'px'),
            '--name-font-size-mobile': formatDimensionValue(nameFontSize?.mobile, 18, 'px'),
            '--name-font-weight': nameFontWeight,
            '--name-color': nameColor,
            '--title-font-size': formatDimensionValue(titleFontSize?.desktop, 16, 'px'),
            '--title-font-size-tablet': formatDimensionValue(titleFontSize?.tablet, 14, 'px'),
            '--title-font-size-mobile': formatDimensionValue(titleFontSize?.mobile, 12, 'px'),
            '--title-font-weight': titleFontWeight,
            '--title-color': titleColor,
            '--container-max-width': containerMode === 'constrained' ? formatDimensionValue(containerMaxWidth?.desktop, 1200, 'px') : '100%',
            '--container-max-width-tablet': containerMode === 'constrained' ? formatDimensionValue(containerMaxWidth?.tablet, 100, '%') : '100%',
            '--container-max-width-mobile': containerMode === 'constrained' ? formatDimensionValue(containerMaxWidth?.mobile, 100, '%') : '100%',
        },
    });

    const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];

    return (
        <div {...blockProps}>
            <div className={`ad-testimonial-block__wrapper ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                {/* Mobile Navigation */}
                <div className="ad-testimonial-block__nav-tabrow">
                    <button
                        className="ad-testimonial-block__nav ad-testimonial-block__nav--prev"
                        aria-label="Previous slide"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button
                        className="ad-testimonial-block__nav ad-testimonial-block__nav--next"
                        aria-label="Next slide"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                {/* Desktop Previous Button */}
                <button
                    className="ad-testimonial-block__nav ad-testimonial-block__nav-desktop ad-testimonial-block__nav--prev"
                    aria-label="Previous slide"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                {/* Swiper Container */}
                <div className="ad-testimonial-block__swiper swiper">
                    <div className="swiper-wrapper">
                        {safeTestimonials.map((testimonial, index) => (
                            <div key={testimonial.id || index} className="swiper-slide">
                                <div className="ad-testimonial-block__card">
                                    <div className="ad-testimonial-block__first">
                                        <div
                                            className="ad-testimonial-block__first__picture"
                                            style={{
                                                backgroundImage: testimonial.personImage?.url
                                                    ? `url(${testimonial.personImage.url})`
                                                    : 'none',
                                            }}
                                        />
                                    </div>
                                    <div className="ad-testimonial-block__second">
                                        <div className="ad-testimonial-block__second__top">
                                            <div className="ad-testimonial-block__second__top__quote">
                                                {quoteImage?.url && (
                                                    <img
                                                        src={quoteImage.url}
                                                        alt={quoteImage.alt || 'Quote'}
                                                        className="ad-testimonial-block__second__top__quote__img"
                                                    />
                                                )}
                                            </div>
                                            <div className="ad-testimonial-block__second__top__logo">
                                                {testimonial.logoImage?.url && (
                                                    <img src={testimonial.logoImage.url} alt={testimonial.logoImage.alt || ''} />
                                                )}
                                            </div>
                                        </div>
                                        <div className="ad-testimonial-block__second__bottom">
                                            <RichText.Content
                                                tagName="p"
                                                className="ad-testimonial-block__second__bottom__description"
                                                value={testimonial.description}
                                            />
                                            <RichText.Content
                                                tagName="h4"
                                                className="ad-testimonial-block__second__bottom__name"
                                                value={testimonial.name}
                                            />
                                            <RichText.Content
                                                tagName="p"
                                                className="ad-testimonial-block__second__bottom__title"
                                                value={testimonial.title}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop Next Button */}
                <button
                    className="ad-testimonial-block__nav ad-testimonial-block__nav-desktop ad-testimonial-block__nav--next"
                    aria-label="Next slide"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Testimonial2Save;




