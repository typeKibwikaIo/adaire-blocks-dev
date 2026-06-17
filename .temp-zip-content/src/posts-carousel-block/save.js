import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        blockId,
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
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        slidesPerView,
        dragCursorText,
        dragCursorFontSize,
        dragCursorFontWeight,
        dragCursorColor,
        dragCursorSize,
        dragCursorTextTransform,
        dragCursorBgColor
    } = attributes;

    const blockProps = useBlockProps.save({
        className: `adaire-posts-carousel`,
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
        'data-slides-per-view': JSON.stringify(slidesPerView),
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
        'data-padding-top': JSON.stringify(paddingTop),
        'data-padding-right': JSON.stringify(paddingRight),
        'data-padding-bottom': JSON.stringify(paddingBottom),
        'data-padding-left': JSON.stringify(paddingLeft),
        'data-container-width': JSON.stringify(containerMaxWidth),
        'data-drag-cursor-text': dragCursorText,
        style: {
            '--adaire-posts-carousel-columns': `${columns}`,
            '--adaire-posts-carousel-slides-per-view-desktop': `${slidesPerView?.desktop ?? 4}`,
            '--adaire-posts-carousel-slides-per-view-tablet': `${slidesPerView?.tablet ?? 3}`,
            '--adaire-posts-carousel-slides-per-view-mobile': `${slidesPerView?.mobile ?? 2}`,
            '--adaire-posts-carousel-gap': `${cardGap}px`,
            '--adaire-posts-carousel-border-radius': `${cardBorderRadius}px`,
            '--adaire-posts-carousel-padding': `${cardPadding}px`,
            '--adaire-posts-carousel-image-height': `${imageHeight}px`,
            '--adaire-posts-carousel-title-color': titleColor,
            '--adaire-posts-carousel-title-font-size': `${titleFontSize}px`,
            '--adaire-posts-carousel-title-font-weight': titleFontWeight,
            '--adaire-posts-carousel-excerpt-color': excerptColor,
            '--adaire-posts-carousel-excerpt-font-size': `${excerptFontSize}px`,
            '--adaire-posts-carousel-excerpt-font-weight': excerptFontWeight,
            '--adaire-posts-carousel-meta-color': metaColor,
            '--adaire-posts-carousel-meta-font-size': `${metaFontSize}px`,
            '--adaire-posts-carousel-meta-font-weight': metaFontWeight,
            '--adaire-posts-carousel-category-color': categoryColor,
            '--adaire-posts-carousel-category-background': categoryBackgroundColor,
            '--adaire-posts-carousel-category-border-radius': `${categoryBorderRadius}px`,
            '--adaire-posts-carousel-filter-border-radius': `${filterBorderRadius}px`,
            '--adaire-posts-carousel-pagination-border-radius': `${paginationBorderRadius}px`,
            '--adaire-posts-carousel-hover-scale': `${hoverScale}`,
            '--adaire-posts-carousel-overlay-opacity': `${overlayOpacity}`,
            '--adaire-posts-carousel-overlay-gradient': overlayGradient,
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
            '--padding-top': `${paddingTop?.desktop ?? paddingTop ?? 0}px`,
            '--padding-right': `${paddingRight?.desktop ?? paddingRight ?? 0}px`,
            '--padding-bottom': `${paddingBottom?.desktop ?? paddingBottom ?? 0}px`,
            '--padding-left': `${paddingLeft?.desktop ?? paddingLeft ?? 0}px`,
            '--padding-top-tablet': `${paddingTop?.tablet ?? paddingTop?.desktop ?? paddingTop ?? 0}px`,
            '--padding-right-tablet': `${paddingRight?.tablet ?? paddingRight?.desktop ?? paddingRight ?? 0}px`,
            '--padding-bottom-tablet': `${paddingBottom?.tablet ?? paddingBottom?.desktop ?? paddingBottom ?? 0}px`,
            '--padding-left-tablet': `${paddingLeft?.tablet ?? paddingLeft?.desktop ?? paddingLeft ?? 0}px`,
            '--padding-top-mobile': `${paddingTop?.mobile ?? paddingTop?.desktop ?? paddingTop ?? 0}px`,
            '--padding-right-mobile': `${paddingRight?.mobile ?? paddingRight?.desktop ?? paddingRight ?? 0}px`,
            '--padding-bottom-mobile': `${paddingBottom?.mobile ?? paddingBottom?.desktop ?? paddingBottom ?? 0}px`,
            '--padding-left-mobile': `${paddingLeft?.mobile ?? paddingLeft?.desktop ?? paddingLeft ?? 0}px`,
            '--adaire-posts-carousel-drag-cursor-size': `${dragCursorSize}px`,
            '--adaire-posts-carousel-drag-cursor-font-size': `${dragCursorFontSize}px`,
            '--adaire-posts-carousel-drag-cursor-font-weight': dragCursorFontWeight,
            '--adaire-posts-carousel-drag-cursor-color': dragCursorColor,
            '--adaire-posts-carousel-drag-cursor-bg': dragCursorBgColor,
            '--adaire-posts-carousel-drag-cursor-text-transform': dragCursorTextTransform,
            textAlign: textAlign
        }
    });

    return (
        <div {...blockProps}>
            <div className={`adaire-posts-carousel__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                {enableFiltering && filterPosition === 'top' && (
                    <div className="adaire-posts-carousel__filters">
                        <div className="adaire-posts-carousel__filter-list">
                            {/* Filter buttons will be populated by JavaScript */}
                        </div>
                    </div>
                )}
                <div className="adaire-posts-carousel__wrapper">
                    <div className="adaire-posts-carousel__track">
                    {/* Posts will be populated by JavaScript */}
                    </div>
                </div>
                {enableFiltering && filterPosition === 'bottom' && (
                    <div className="adaire-posts-carousel__filters">
                        <div className="adaire-posts-carousel__filter-list">
                            {/* Filter buttons will be populated by JavaScript */}
                        </div>
                    </div>
                )}
                {enablePagination && (
                    <div className="adaire-posts-carousel__pagination">
                        {/* Pagination will be populated by JavaScript */}
                    </div>
                )}
            </div>
            {/* Drag cursor element */}
            <div className="adaire-posts-carousel__drag-cursor">
                {dragCursorText}
            </div>
        </div>
    );
}



