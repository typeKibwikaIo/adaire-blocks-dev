import { useBlockProps } from '@wordpress/block-editor';

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
    const value = dimension?.value ?? fallbackValue;
    const unit = dimension?.unit ?? fallbackUnit;
    return `${value}${unit}`;
};

export default function save({ attributes }) {
    const {
        blockId,
        containerMode,
        containerMaxWidth,
        caseStudies,
        columns,
        columnsBigDesktop,
        columnsSmallLaptop,
        columnsMobile,
        columnsTablet,
        gap,
        initialCount,
        loadMoreCount,
        showFilters,
        showLoadMore,
        loadMoreText,
        cardHeight,
        cardBorderRadius,
        cardBackgroundColor,
        cardShadow,
        cardHoverShadow,
        overlayColor,
        overlayHoverColor,
        titleColor,
        titleFontSize,
        titleFontWeight,
        titleLineHeight,
        titleLetterSpacing,
        descriptionColor,
        descriptionFontSize,
        descriptionFontWeight,
        descriptionLineHeight,
        descriptionLetterSpacing,
        descriptionMaxLines,
        filterLabelColor,
        filterLabelFontSize,
        filterBorderColor,
        filterBackgroundColor,
        filterBorderRadius,
        loadMoreButtonColor,
        loadMoreButtonBgColor,
        loadMoreButtonHoverColor,
        loadMoreFontSize,
        loadMoreFontWeight,
        animationDuration,
        animationEase,
        hoverScale,
        hoverTransitionDuration,
        contentPadding,
        industryFilterLabel,
        capabilityFilterLabel,
        enableCarousel,
        carouselCardWidth,
        dragCursorText,
        dragCursorFontSize,
        dragCursorFontWeight,
        dragCursorColor,
        dragCursorSize,
        dragCursorTextTransform,
        dragCursorBgColor,
        nextLabel
    } = attributes;

    // Get unique industries and capabilities for filter dropdowns
    const industries = [...new Set(
        caseStudies
            .map(study => study.industry)
            .filter(industry => industry && industry.trim() !== '')
    )].sort();

    const capabilities = [...new Set(
        caseStudies
            .flatMap(study => study.capabilities || [])
            .filter(cap => cap && cap.trim() !== '')
    )].sort();

    const blockProps = useBlockProps.save({
        className: `ad-case-studies-block${enableCarousel ? ' is-carousel-mode' : ''}`,
        style: {
            '--cs-columns': columns,
            '--cs-columns-big-desktop': columnsBigDesktop ?? columns,
            '--cs-columns-small-laptop': columnsSmallLaptop ?? columns,
            '--cs-columns-tablet': columnsTablet,
            '--cs-columns-mobile': columnsMobile,
            '--cs-gap': `${gap}px`,
            '--cs-card-height-big-desktop': formatDimensionValue(cardHeight?.bigDesktop, 340, 'px'),
            '--cs-card-height': formatDimensionValue(cardHeight?.desktop, 320, 'px'),
            '--cs-card-height-small-laptop': formatDimensionValue(cardHeight?.smallLaptop, 300, 'px'),
            '--cs-card-height-tablet': formatDimensionValue(cardHeight?.tablet, 280, 'px'),
            '--cs-card-height-mobile': formatDimensionValue(cardHeight?.mobile, 240, 'px'),
            '--cs-card-border-radius': `${cardBorderRadius}px`,
            '--cs-card-bg-color': cardBackgroundColor,
            '--cs-card-shadow': cardShadow,
            '--cs-card-hover-shadow': cardHoverShadow,
            '--cs-overlay-color': overlayColor,
            '--cs-overlay-hover-color': overlayHoverColor,
            '--cs-title-color': titleColor,
            '--cs-title-font-size-big-desktop': formatDimensionValue(titleFontSize?.bigDesktop, 22, 'px'),
            '--cs-title-font-size': formatDimensionValue(titleFontSize?.desktop, 20, 'px'),
            '--cs-title-font-size-small-laptop': formatDimensionValue(titleFontSize?.smallLaptop, 19, 'px'),
            '--cs-title-font-size-tablet': formatDimensionValue(titleFontSize?.tablet, 18, 'px'),
            '--cs-title-font-size-mobile': formatDimensionValue(titleFontSize?.mobile, 16, 'px'),
            '--cs-title-font-weight': titleFontWeight,
            '--cs-title-line-height': titleLineHeight,
            '--cs-title-letter-spacing': `${titleLetterSpacing}px`,
            '--cs-description-color': descriptionColor,
            '--cs-description-font-size-big-desktop': formatDimensionValue(descriptionFontSize?.bigDesktop, 14, 'px'),
            '--cs-description-font-size': formatDimensionValue(descriptionFontSize?.desktop, 14, 'px'),
            '--cs-description-font-size-small-laptop': formatDimensionValue(descriptionFontSize?.smallLaptop, 13, 'px'),
            '--cs-description-font-size-tablet': formatDimensionValue(descriptionFontSize?.tablet, 13, 'px'),
            '--cs-description-font-size-mobile': formatDimensionValue(descriptionFontSize?.mobile, 12, 'px'),
            '--cs-description-font-weight': descriptionFontWeight,
            '--cs-description-line-height': descriptionLineHeight,
            '--cs-description-letter-spacing': `${descriptionLetterSpacing}px`,
            '--cs-description-max-lines': descriptionMaxLines,
            '--cs-filter-label-color': filterLabelColor,
            '--cs-filter-label-font-size': `${filterLabelFontSize}px`,
            '--cs-filter-border-color': filterBorderColor,
            '--cs-filter-bg-color': filterBackgroundColor,
            '--cs-filter-border-radius': `${filterBorderRadius}px`,
            '--cs-load-more-color': loadMoreButtonColor,
            '--cs-load-more-bg-color': loadMoreButtonBgColor,
            '--cs-load-more-hover-color': loadMoreButtonHoverColor,
            '--cs-load-more-font-size': `${loadMoreFontSize}px`,
            '--cs-load-more-font-weight': loadMoreFontWeight,
            '--cs-hover-scale': hoverScale,
            '--cs-hover-transition': `${hoverTransitionDuration}s`,
            '--cs-content-padding': `${contentPadding}px`,
            '--container-max-width-big-desktop': formatDimensionValue(containerMaxWidth?.bigDesktop, 1400, 'px'),
            '--container-max-width': formatDimensionValue(containerMaxWidth?.desktop, 1200, 'px'),
            '--container-max-width-small-laptop': formatDimensionValue(containerMaxWidth?.smallLaptop, 1200, 'px'),
            '--container-max-width-tablet': formatDimensionValue(containerMaxWidth?.tablet, 100, '%'),
            '--container-max-width-mobile': formatDimensionValue(containerMaxWidth?.mobile, 100, '%'),
            '--cs-carousel-card-width-big-desktop': formatDimensionValue(carouselCardWidth?.bigDesktop, 440, 'px'),
            '--cs-carousel-card-width': formatDimensionValue(carouselCardWidth?.desktop, 400, 'px'),
            '--cs-carousel-card-width-small-laptop': formatDimensionValue(carouselCardWidth?.smallLaptop, 360, 'px'),
            '--cs-carousel-card-width-tablet': formatDimensionValue(carouselCardWidth?.tablet, 320, 'px'),
            '--cs-carousel-card-width-mobile': formatDimensionValue(carouselCardWidth?.mobile, 280, 'px'),
            '--cs-drag-cursor-size': `${dragCursorSize}px`,
            '--cs-drag-cursor-bg': dragCursorBgColor,
            '--cs-drag-cursor-color': dragCursorColor,
            '--cs-drag-cursor-font-size': `${dragCursorFontSize}px`,
            '--cs-drag-cursor-font-weight': dragCursorFontWeight,
            '--cs-drag-cursor-text-transform': dragCursorTextTransform
        },
        'data-case-studies': JSON.stringify(caseStudies),
        'data-initial-count': initialCount,
        'data-load-more-count': loadMoreCount,
        'data-animation-duration': animationDuration,
        'data-animation-ease': animationEase,
        'data-show-filters': showFilters,
        'data-show-load-more': showLoadMore,
        'data-enable-carousel': enableCarousel,
        'data-drag-cursor-text': dragCursorText,
        'data-next-label': nextLabel
    });

    const containerClasses = [
        'ad-case-studies__container',
        containerMode === 'constrained' ? 'is-constrained' : ''
    ].filter(Boolean).join(' ');

    return (
        <div {...blockProps}>
            <div className={containerClasses}>
                {/* Filter Section */}
                {showFilters && (
                    <div className="ad-case-studies__filters">
                        <div className="ad-case-studies__filter-group">
                            <select 
                                className="ad-case-studies__filter-select" 
                                data-filter-type="industry"
                                aria-label={industryFilterLabel}
                            >
                                <option value="">All Industries</option>
                                {industries.map(ind => (
                                    <option key={ind} value={ind}>{ind}</option>
                                ))}
                            </select>
                            <svg className="ad-case-studies__filter-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="ad-case-studies__filter-group">
                            <select 
                                className="ad-case-studies__filter-select" 
                                data-filter-type="capability"
                                aria-label={capabilityFilterLabel}
                            >
                                <option value="">All Capabilities</option>
                                {capabilities.map(cap => (
                                    <option key={cap} value={cap}>{cap}</option>
                                ))}
                            </select>
                            <svg className="ad-case-studies__filter-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                )}

                {/* Case Studies Grid / Carousel */}
                <div className={`ad-case-studies__grid${enableCarousel ? ' ad-case-studies__carousel' : ''}`}>
                    {caseStudies.map((study, index) => {
                        // In carousel mode, show all cards. In grid mode, hide cards beyond initialCount
                        const isInitiallyHidden = !enableCarousel && index >= initialCount;
                        const cardClasses = [
                            'ad-case-studies__card',
                            isInitiallyHidden ? 'ad-case-studies__card--hidden' : ''
                        ].filter(Boolean).join(' ');

                        return (
                            <div
                                key={study.id}
                                className={cardClasses}
                                data-id={study.id}
                                data-industry={study.industry || ''}
                                data-capabilities={JSON.stringify(study.capabilities || [])}
                                data-index={index}
                                role="button"
                                tabIndex={0}
                                aria-label={study.title}
                                style={{
                                    backgroundImage: study.backgroundImage ? `url(${study.backgroundImage})` : 'none',
                                    backgroundColor: study.backgroundImage ? 'transparent' : 'var(--cs-card-bg-color, #374151)'
                                }}
                            >
                                <div className="ad-case-studies__card-overlay">
                                    <div className="ad-case-studies__card-content">
                                        <h3 className="ad-case-studies__card-title">{study.title}</h3>
                                        <p className="ad-case-studies__card-description">{study.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Load More Button (hidden in carousel mode) */}
                {!enableCarousel && showLoadMore && caseStudies.length > initialCount && (
                    <div className="ad-case-studies__load-more-wrapper">
                        <button className="ad-case-studies__load-more-btn" type="button">
                            {loadMoreText}
                        </button>
                        <div className="ad-case-studies__loading-spinner" style={{ display: 'none' }}>
                            <svg className="ad-case-studies__spinner-svg" viewBox="0 0 50 50">
                                <circle className="ad-case-studies__spinner-circle" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Drag Cursor (for carousel mode) - positioned relative to block */}
            {enableCarousel && (
                <div className="ad-case-studies__drag-cursor" aria-hidden="true">
                    <span>{dragCursorText}</span>
                </div>
            )}
        </div>
    );
}




