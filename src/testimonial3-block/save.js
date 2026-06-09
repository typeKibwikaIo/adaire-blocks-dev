import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        blockId,
        testimonials,
        slidesPerView,
        backgroundColor,
        cardBackgroundColor,
        cardBorderRadius,
        cardGap,
        cardPadding,
        quoteIconSize,
        quoteIconColor,
        quoteColor,
        quoteFontSize,
        quoteFontWeight,
        nameColor,
        nameFontSize,
        nameFontWeight,
        titleColor,
        titleFontSize,
        titleFontWeight,
        profileImageSize,
        showPagination,
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
        loop,
        cardHeight,
        mobilePeekPercent,
        listPaddingLeft,
        dragCursorText,
        dragCursorSize,
        dragCursorFontSize,
        dragCursorFontWeight,
        dragCursorColor,
        dragCursorBgColor,
        dragCursorTextTransform
    } = attributes;

    const normalizeDimension = (dimension, defaults) => {
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

    const normalizedCardHeight = normalizeDimension(cardHeight, { value: 460, unit: 'px' });

    const blockProps = useBlockProps.save({
        className: 'adaire-testimonial3',
        'data-block-id': blockId,
        'data-testimonials': JSON.stringify(testimonials),
        'data-slides-per-view': JSON.stringify(slidesPerView),
        'data-slides-per-view-big-desktop': slidesPerView?.bigDesktop ?? slidesPerView?.desktop ?? 5,
        'data-slides-per-view-desktop': slidesPerView?.desktop ?? 3,
        'data-slides-per-view-small-laptop': slidesPerView?.smallLaptop ?? slidesPerView?.desktop ?? 3,
        'data-slides-per-view-tablet': slidesPerView?.tablet ?? 2,
        'data-slides-per-view-mobile': slidesPerView?.mobile ?? 1,
        'data-show-pagination': showPagination,
        'data-loop': loop ? 'true' : 'false',
        'data-mobile-peek': mobilePeekPercent ?? 20,
        'data-drag-cursor-text': dragCursorText,
        'data-background-color': backgroundColor,
        'data-card-background-color': cardBackgroundColor,
        'data-card-border-radius': cardBorderRadius,
        'data-card-gap': cardGap,
        'data-card-padding': JSON.stringify(cardPadding),
        'data-quote-icon-size': quoteIconSize,
        'data-quote-icon-color': quoteIconColor,
        'data-quote-color': quoteColor,
        'data-quote-font-size': JSON.stringify(quoteFontSize),
        'data-quote-font-weight': quoteFontWeight,
        'data-name-color': nameColor,
        'data-name-font-size': JSON.stringify(nameFontSize),
        'data-name-font-weight': nameFontWeight,
        'data-title-color': titleColor,
        'data-title-font-size': JSON.stringify(titleFontSize),
        'data-title-font-weight': titleFontWeight,
        'data-profile-image-size': profileImageSize,
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
        style: {
            '--testimonial3-bg-color': backgroundColor,
            '--testimonial3-card-bg': cardBackgroundColor,
            '--testimonial3-card-radius': `${cardBorderRadius}px`,
            '--testimonial3-card-gap': `${cardGap}px`,
            '--testimonial3-card-padding-desktop': `${cardPadding?.desktop ?? cardPadding ?? 40}px`,
            '--testimonial3-card-padding-tablet': `${cardPadding?.tablet ?? cardPadding?.desktop ?? cardPadding ?? 30}px`,
            '--testimonial3-card-padding-mobile': `${cardPadding?.mobile ?? cardPadding?.tablet ?? cardPadding?.desktop ?? cardPadding ?? 20}px`,
            '--testimonial3-quote-icon-size': `${quoteIconSize}px`,
            '--testimonial3-quote-icon-color': quoteIconColor,
            '--testimonial3-quote-color': quoteColor,
            '--testimonial3-quote-font-size-desktop': `${quoteFontSize?.desktop ?? quoteFontSize ?? 16}px`,
            '--testimonial3-quote-font-size-tablet': `${quoteFontSize?.tablet ?? quoteFontSize?.desktop ?? quoteFontSize ?? 15}px`,
            '--testimonial3-quote-font-size-mobile': `${quoteFontSize?.mobile ?? quoteFontSize?.tablet ?? quoteFontSize?.desktop ?? quoteFontSize ?? 14}px`,
            '--testimonial3-quote-font-weight': quoteFontWeight,
            '--testimonial3-name-color': nameColor,
            '--testimonial3-name-font-size-desktop': `${nameFontSize?.desktop ?? nameFontSize ?? 18}px`,
            '--testimonial3-name-font-size-tablet': `${nameFontSize?.tablet ?? nameFontSize?.desktop ?? nameFontSize ?? 17}px`,
            '--testimonial3-name-font-size-mobile': `${nameFontSize?.mobile ?? nameFontSize?.tablet ?? nameFontSize?.desktop ?? nameFontSize ?? 16}px`,
            '--testimonial3-name-font-weight': nameFontWeight,
            '--testimonial3-title-color': titleColor,
            '--testimonial3-title-font-size-desktop': `${titleFontSize?.desktop ?? titleFontSize ?? 14}px`,
            '--testimonial3-title-font-size-tablet': `${titleFontSize?.tablet ?? titleFontSize?.desktop ?? titleFontSize ?? 13}px`,
            '--testimonial3-title-font-size-mobile': `${titleFontSize?.mobile ?? titleFontSize?.tablet ?? titleFontSize?.desktop ?? titleFontSize ?? 12}px`,
            '--testimonial3-title-font-weight': titleFontWeight,
            '--testimonial3-profile-size': `${profileImageSize}px`,
            '--testimonial3-slides-per-view-desktop': slidesPerView?.desktop ?? 3,
            '--testimonial3-slides-per-view-tablet': slidesPerView?.tablet ?? 2,
            '--testimonial3-slides-per-view-mobile': slidesPerView?.mobile ?? 1,
            '--testimonial3-card-height': `${normalizedCardHeight.value}${normalizedCardHeight.unit}`,
            '--container-max-width': containerMaxWidth?.desktop?.value ? `${containerMaxWidth.desktop.value}${containerMaxWidth.desktop.unit}` : '1200px',
            '--container-max-width-tablet': containerMaxWidth?.tablet?.value ? `${containerMaxWidth.tablet.value}${containerMaxWidth.tablet.unit}` : '100%',
            '--container-max-width-mobile': containerMaxWidth?.mobile?.value ? `${containerMaxWidth.mobile.value}${containerMaxWidth.mobile.unit}` : '100%',
            '--container-max-width-small-laptop': containerMaxWidth?.smallLaptop?.value ? `${containerMaxWidth.smallLaptop.value}${containerMaxWidth.smallLaptop.unit}` : '1200px',
            '--container-max-width-big-desktop': containerMaxWidth?.bigDesktop?.value ? `${containerMaxWidth.bigDesktop.value}${containerMaxWidth.bigDesktop.unit}` : '1200px',
            '--list-padding-left-mobile': `${listPaddingLeft?.mobile ?? 10}px`,
            '--list-padding-left-tablet': `${listPaddingLeft?.tablet ?? listPaddingLeft?.mobile ?? 10}px`,
            '--list-padding-left-small-laptop': `${listPaddingLeft?.smallLaptop ?? listPaddingLeft?.desktop ?? 10}px`,
            '--list-padding-left-desktop': `${listPaddingLeft?.desktop ?? 10}px`,
            '--list-padding-left-big-desktop': `${listPaddingLeft?.bigDesktop ?? listPaddingLeft?.desktop ?? 10}px`,
            '--testimonial3-drag-cursor-size-mobile': `${dragCursorSize?.mobile ?? 80}px`,
            '--testimonial3-drag-cursor-size-tablet': `${dragCursorSize?.tablet ?? dragCursorSize?.mobile ?? 80}px`,
            '--testimonial3-drag-cursor-size-small-laptop': `${dragCursorSize?.smallLaptop ?? dragCursorSize?.desktop ?? 80}px`,
            '--testimonial3-drag-cursor-size-desktop': `${dragCursorSize?.desktop ?? 80}px`,
            '--testimonial3-drag-cursor-size-big-desktop': `${dragCursorSize?.bigDesktop ?? dragCursorSize?.desktop ?? 80}px`,
            '--testimonial3-drag-cursor-font-size-mobile': `${dragCursorFontSize?.mobile ?? 16}px`,
            '--testimonial3-drag-cursor-font-size-tablet': `${dragCursorFontSize?.tablet ?? dragCursorFontSize?.mobile ?? 16}px`,
            '--testimonial3-drag-cursor-font-size-small-laptop': `${dragCursorFontSize?.smallLaptop ?? dragCursorFontSize?.desktop ?? 16}px`,
            '--testimonial3-drag-cursor-font-size-desktop': `${dragCursorFontSize?.desktop ?? 16}px`,
            '--testimonial3-drag-cursor-font-size-big-desktop': `${dragCursorFontSize?.bigDesktop ?? dragCursorFontSize?.desktop ?? 16}px`,
            '--testimonial3-drag-cursor-font-weight-mobile': dragCursorFontWeight?.mobile ?? '500',
            '--testimonial3-drag-cursor-font-weight-tablet': dragCursorFontWeight?.tablet ?? dragCursorFontWeight?.mobile ?? '500',
            '--testimonial3-drag-cursor-font-weight-small-laptop': dragCursorFontWeight?.smallLaptop ?? dragCursorFontWeight?.desktop ?? '500',
            '--testimonial3-drag-cursor-font-weight-desktop': dragCursorFontWeight?.desktop ?? '500',
            '--testimonial3-drag-cursor-font-weight-big-desktop': dragCursorFontWeight?.bigDesktop ?? dragCursorFontWeight?.desktop ?? '500',
            '--testimonial3-drag-cursor-color-mobile': dragCursorColor?.mobile ?? '#ffffff',
            '--testimonial3-drag-cursor-color-tablet': dragCursorColor?.tablet ?? dragCursorColor?.mobile ?? '#ffffff',
            '--testimonial3-drag-cursor-color-small-laptop': dragCursorColor?.smallLaptop ?? dragCursorColor?.desktop ?? '#ffffff',
            '--testimonial3-drag-cursor-color-desktop': dragCursorColor?.desktop ?? '#ffffff',
            '--testimonial3-drag-cursor-color-big-desktop': dragCursorColor?.bigDesktop ?? dragCursorColor?.desktop ?? '#ffffff',
            '--testimonial3-drag-cursor-bg-mobile': dragCursorBgColor?.mobile ?? '#7c3aed',
            '--testimonial3-drag-cursor-bg-tablet': dragCursorBgColor?.tablet ?? dragCursorBgColor?.mobile ?? '#7c3aed',
            '--testimonial3-drag-cursor-bg-small-laptop': dragCursorBgColor?.smallLaptop ?? dragCursorBgColor?.desktop ?? '#7c3aed',
            '--testimonial3-drag-cursor-bg-desktop': dragCursorBgColor?.desktop ?? '#7c3aed',
            '--testimonial3-drag-cursor-bg-big-desktop': dragCursorBgColor?.bigDesktop ?? dragCursorBgColor?.desktop ?? '#7c3aed',
            '--testimonial3-drag-cursor-text-transform-mobile': dragCursorTextTransform?.mobile ?? 'uppercase',
            '--testimonial3-drag-cursor-text-transform-tablet': dragCursorTextTransform?.tablet ?? dragCursorTextTransform?.mobile ?? 'uppercase',
            '--testimonial3-drag-cursor-text-transform-small-laptop': dragCursorTextTransform?.smallLaptop ?? dragCursorTextTransform?.desktop ?? 'uppercase',
            '--testimonial3-drag-cursor-text-transform-desktop': dragCursorTextTransform?.desktop ?? 'uppercase',
            '--testimonial3-drag-cursor-text-transform-big-desktop': dragCursorTextTransform?.bigDesktop ?? dragCursorTextTransform?.desktop ?? 'uppercase',
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
        }
    });

    return (
        <div {...blockProps}>
            <div className={`adaire-testimonial3__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                <div className="adaire-testimonial3__wrapper">
                    <div className="adaire-testimonial3__track">
                        {/* Testimonials will be populated by JavaScript */}
                    </div>
                </div>
                {showPagination && (
                    <div className="adaire-testimonial3__pagination">
                        {/* Pagination dots will be populated by JavaScript */}
                    </div>
                )}
            </div>
            <div className="adaire-testimonial3__drag-cursor">
                {dragCursorText}
            </div>
        </div>
    );
}



