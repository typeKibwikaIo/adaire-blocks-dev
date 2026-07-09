import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        blockId,
        showHeading,
        headingText,
        headingResponsiveAlign,
        headingResponsiveTextAlign,
        headingResponsiveFontSize,
        headingResponsiveFontWeight,
        headingColor,
        headingUnderlineColor,
        headingResponsiveUnderlineWidth,
        headingResponsiveMarginBottom,
        headingResponsiveLineHeight,
        headingResponsiveLetterSpacing,
        headingTextTransform,
        fontFamily,
        postsPerPage,
        enablePagination,
        paginationStyle,
        selectedCategories,
        selectedPosts,
        postType,
        excludeCurrentPost,
        showCategories,
        showDate,
        showAuthor,
        showReadTime,
        showExcerpt,
        excerptLength,
        layoutType,
        columns,
        enableFiltering,
        filterPosition,
        filterStyle,
        cardBorderRadius,
        cardPadding,
        cardGap,
        imageHeight,
        imageFit,
        titleColor,
        titleFontSize,
        titleFontWeight,
        excerptColor,
        excerptFontSize,
        excerptFontWeight,
        metaColor,
        metaFontSize,
        metaFontWeight,
        categoryColor,
        categoryBackgroundColor,
        categoryBorderRadius,
        filterBorderRadius,
        paginationBorderRadius,
        enableAnimations,
        animationType,
        transitionAnimation,
        animationDuration,
        animationDelay,
        animationEase,
        enableHoverEffects,
        hoverScale,
        hoverShadow,
        overlayOpacity,
        overlayGradient,
        textAlign,
        containerMode,
        containerMaxWidth,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft
    } = attributes;

    const blockProps = useBlockProps.save({
        className: `adaire-posts-grid adaire-posts-grid--${layoutType}`,
        'data-block-id': blockId,
        'data-posts-per-page': postsPerPage,
        'data-enable-pagination': enablePagination,
        'data-pagination-style': paginationStyle,
        'data-selected-categories': JSON.stringify(selectedCategories),
        'data-selected-posts': JSON.stringify(selectedPosts),
        'data-post-type': postType,
        'data-exclude-current-post': excludeCurrentPost,
        'data-show-categories': showCategories,
        'data-show-date': showDate,
        'data-show-author': showAuthor,
        'data-show-read-time': showReadTime,
        'data-show-excerpt': showExcerpt,
        'data-excerpt-length': excerptLength,
        'data-layout-type': layoutType,
        'data-columns': columns,
        'data-enable-filtering': enableFiltering,
        'data-filter-position': filterPosition,
        'data-filter-style': filterStyle,
        'data-card-border-radius': cardBorderRadius,
        'data-card-padding': cardPadding,
        'data-card-gap': cardGap,
        'data-image-height': imageHeight,
        'data-image-fit': imageFit,
        'data-title-color': titleColor,
        'data-title-font-size': titleFontSize,
        'data-title-font-weight': titleFontWeight,
        'data-excerpt-color': excerptColor,
        'data-excerpt-font-size': excerptFontSize,
        'data-excerpt-font-weight': excerptFontWeight,
        'data-meta-color': metaColor,
        'data-meta-font-size': metaFontSize,
        'data-meta-font-weight': metaFontWeight,
        'data-category-color': categoryColor,
        'data-category-background-color': categoryBackgroundColor,
        'data-category-border-radius': categoryBorderRadius,
        'data-enable-animations': enableAnimations,
        'data-animation-type': animationType,
        'data-transition-animation': transitionAnimation,
        'data-animation-duration': animationDuration,
        'data-animation-delay': animationDelay,
        'data-animation-ease': animationEase,
        'data-enable-hover-effects': enableHoverEffects,
        'data-hover-scale': hoverScale,
        'data-hover-shadow': hoverShadow,
        'data-overlay-opacity': overlayOpacity,
        'data-overlay-gradient': overlayGradient,
        'data-text-align': textAlign,
        'data-container-mode': containerMode,
        'data-container-max-width': JSON.stringify(containerMaxWidth),
        'data-margin-top': JSON.stringify(marginTop),
        'data-margin-right': JSON.stringify(marginRight),
        'data-margin-bottom': JSON.stringify(marginBottom),
        'data-margin-left': JSON.stringify(marginLeft),
        'data-container-width': JSON.stringify(containerMaxWidth),
        style: {
            '--adaire-posts-grid-columns': `${columns}`,
            '--adaire-posts-grid-gap': `${cardGap}px`,
            '--adaire-posts-grid-border-radius': `${cardBorderRadius}px`,
            '--adaire-posts-grid-padding': `${cardPadding}px`,
            '--adaire-posts-grid-image-height': `${imageHeight}px`,
            '--adaire-posts-grid-title-color': titleColor,
            '--adaire-posts-grid-title-font-size': `${titleFontSize}px`,
            '--adaire-posts-grid-title-font-weight': titleFontWeight,
            '--adaire-posts-grid-excerpt-color': excerptColor,
            '--adaire-posts-grid-excerpt-font-size': `${excerptFontSize}px`,
            '--adaire-posts-grid-excerpt-font-weight': excerptFontWeight,
            '--adaire-posts-grid-meta-color': metaColor,
            '--adaire-posts-grid-meta-font-size': `${metaFontSize}px`,
            '--adaire-posts-grid-meta-font-weight': metaFontWeight,
            '--adaire-posts-grid-category-color': categoryColor,
            '--adaire-posts-grid-category-background': categoryBackgroundColor,
            '--adaire-posts-grid-category-border-radius': `${categoryBorderRadius}px`,
            '--adaire-posts-grid-filter-border-radius': `${filterBorderRadius}px`,
            '--adaire-posts-grid-pagination-border-radius': `${paginationBorderRadius}px`,
            '--adaire-posts-grid-hover-scale': `${hoverScale}`,
            '--adaire-posts-grid-overlay-opacity': `${overlayOpacity}`,
            '--adaire-posts-grid-overlay-gradient': overlayGradient,
            '--container-max-width': `${containerMaxWidth?.desktop?.value ?? containerMaxWidth?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? containerMaxWidth?.unit ?? 'px'}`,
            '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
            '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
            marginTop: `${marginTop?.desktop ?? marginTop ?? 0}px`,
            marginRight: `${marginRight?.desktop ?? marginRight ?? 0}px`,
            marginBottom: `${marginBottom?.desktop ?? marginBottom ?? 0}px`,
            marginLeft: `${marginLeft?.desktop ?? marginLeft ?? 0}px`,
            '--margin-top-tablet': `${marginTop?.tablet ?? marginTop?.desktop ?? marginTop ?? 0}px`,
            '--margin-right-tablet': `${marginRight?.tablet ?? marginRight?.desktop ?? marginRight ?? 0}px`,
            '--margin-bottom-tablet': `${marginBottom?.tablet ?? marginBottom?.desktop ?? marginBottom ?? 0}px`,
            '--margin-left-tablet': `${marginLeft?.tablet ?? marginLeft?.desktop ?? marginLeft ?? 0}px`,
            '--margin-top-mobile': `${marginTop?.mobile ?? marginTop?.desktop ?? marginTop ?? 0}px`,
            '--margin-right-mobile': `${marginRight?.mobile ?? marginRight?.desktop ?? marginRight ?? 0}px`,
            '--margin-bottom-mobile': `${marginBottom?.mobile ?? marginBottom?.desktop ?? marginBottom ?? 0}px`,
            '--margin-left-mobile': `${marginLeft?.mobile ?? marginLeft?.desktop ?? marginLeft ?? 0}px`,
            textAlign: textAlign,

            // Heading vars (responsive + underline)
            '--adaire-posts-grid-heading-color': headingColor,
            '--adaire-posts-grid-heading-underline-color': headingUnderlineColor,
            '--adaire-posts-grid-heading-align-mobile': headingResponsiveAlign?.mobile || 'flex-start',
            '--adaire-posts-grid-heading-align-tablet': headingResponsiveAlign?.tablet || 'flex-start',
            '--adaire-posts-grid-heading-align-smallLaptop': headingResponsiveAlign?.smallLaptop || 'flex-start',
            '--adaire-posts-grid-heading-align-desktop': headingResponsiveAlign?.desktop || 'flex-start',
            '--adaire-posts-grid-heading-align-bigDesktop': headingResponsiveAlign?.bigDesktop || 'flex-start',
            '--adaire-posts-grid-heading-text-align-mobile': headingResponsiveTextAlign?.mobile || 'left',
            '--adaire-posts-grid-heading-text-align-tablet': headingResponsiveTextAlign?.tablet || 'left',
            '--adaire-posts-grid-heading-text-align-smallLaptop': headingResponsiveTextAlign?.smallLaptop || 'left',
            '--adaire-posts-grid-heading-text-align-desktop': headingResponsiveTextAlign?.desktop || 'left',
            '--adaire-posts-grid-heading-text-align-bigDesktop': headingResponsiveTextAlign?.bigDesktop || 'left',
            '--adaire-posts-grid-heading-font-size-mobile': headingResponsiveFontSize?.mobile || '28px',
            '--adaire-posts-grid-heading-font-size-tablet': headingResponsiveFontSize?.tablet || '32px',
            '--adaire-posts-grid-heading-font-size-smallLaptop': headingResponsiveFontSize?.smallLaptop || '36px',
            '--adaire-posts-grid-heading-font-size-desktop': headingResponsiveFontSize?.desktop || '40px',
            '--adaire-posts-grid-heading-font-size-bigDesktop': headingResponsiveFontSize?.bigDesktop || '48px',
            '--adaire-posts-grid-heading-font-weight-mobile': headingResponsiveFontWeight?.mobile || '600',
            '--adaire-posts-grid-heading-font-weight-tablet': headingResponsiveFontWeight?.tablet || '600',
            '--adaire-posts-grid-heading-font-weight-smallLaptop': headingResponsiveFontWeight?.smallLaptop || '600',
            '--adaire-posts-grid-heading-font-weight-desktop': headingResponsiveFontWeight?.desktop || '600',
            '--adaire-posts-grid-heading-font-weight-bigDesktop': headingResponsiveFontWeight?.bigDesktop || '600',
            '--adaire-posts-grid-heading-underline-width-mobile': headingResponsiveUnderlineWidth?.mobile || '6px',
            '--adaire-posts-grid-heading-underline-width-tablet': headingResponsiveUnderlineWidth?.tablet || '6px',
            '--adaire-posts-grid-heading-underline-width-smallLaptop': headingResponsiveUnderlineWidth?.smallLaptop || '7px',
            '--adaire-posts-grid-heading-underline-width-desktop': headingResponsiveUnderlineWidth?.desktop || '8px',
            '--adaire-posts-grid-heading-underline-width-bigDesktop': headingResponsiveUnderlineWidth?.bigDesktop || '10px',
            '--adaire-posts-grid-heading-margin-bottom-mobile': headingResponsiveMarginBottom?.mobile || '24px',
            '--adaire-posts-grid-heading-margin-bottom-tablet': headingResponsiveMarginBottom?.tablet || '24px',
            '--adaire-posts-grid-heading-margin-bottom-smallLaptop': headingResponsiveMarginBottom?.smallLaptop || '24px',
            '--adaire-posts-grid-heading-margin-bottom-desktop': headingResponsiveMarginBottom?.desktop || '24px',
            '--adaire-posts-grid-heading-margin-bottom-bigDesktop': headingResponsiveMarginBottom?.bigDesktop || '24px',
            '--adaire-posts-grid-heading-line-height-mobile': headingResponsiveLineHeight?.mobile || '1.15',
            '--adaire-posts-grid-heading-line-height-tablet': headingResponsiveLineHeight?.tablet || '1.15',
            '--adaire-posts-grid-heading-line-height-smallLaptop': headingResponsiveLineHeight?.smallLaptop || '1.15',
            '--adaire-posts-grid-heading-line-height-desktop': headingResponsiveLineHeight?.desktop || '1.15',
            '--adaire-posts-grid-heading-line-height-bigDesktop': headingResponsiveLineHeight?.bigDesktop || '1.15',
            '--adaire-posts-grid-heading-letter-spacing-mobile': headingResponsiveLetterSpacing?.mobile || 'normal',
            '--adaire-posts-grid-heading-letter-spacing-tablet': headingResponsiveLetterSpacing?.tablet || 'normal',
            '--adaire-posts-grid-heading-letter-spacing-smallLaptop': headingResponsiveLetterSpacing?.smallLaptop || 'normal',
            '--adaire-posts-grid-heading-letter-spacing-desktop': headingResponsiveLetterSpacing?.desktop || 'normal',
            '--adaire-posts-grid-heading-letter-spacing-bigDesktop': headingResponsiveLetterSpacing?.bigDesktop || 'normal',
            '--adaire-posts-grid-heading-text-transform': headingTextTransform || 'none',
            '--adaire-posts-grid-font-family': fontFamily || '',
        }
    });

    return (
        <div {...blockProps}>
            <div className={`adaire-posts-grid__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                {showHeading && headingText && (
                    <div className="adaire-posts-grid__heading-wrap">
                        <RichText.Content
                            tagName="div"
                            className="adaire-posts-grid__heading"
                            value={headingText}
                        />
                    </div>
                )}
                {enableFiltering && filterPosition === 'top' && (
                    <div className="adaire-posts-grid__filters">
                        <div className="adaire-posts-grid__filter-list">
                            {/* Filter buttons will be populated by JavaScript */}
                        </div>
                    </div>
                )}
                <div className="adaire-posts-grid__grid">
                    {/* Posts will be populated by JavaScript */}
                </div>
                {enableFiltering && filterPosition === 'bottom' && (
                    <div className="adaire-posts-grid__filters">
                        <div className="adaire-posts-grid__filter-list">
                            {/* Filter buttons will be populated by JavaScript */}
                        </div>
                    </div>
                )}
                {enablePagination && (
                    <div className="adaire-posts-grid__pagination ">
                        {/* Pagination will be populated by JavaScript */}
                    </div>
                )}
            </div>
        </div>
    );
}



