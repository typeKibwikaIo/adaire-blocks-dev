import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        blockId,
        containerMode,
        mainTitle,
        cards,
        backgroundColor,
        cardBackgroundColor,
        cardBorderRadius,
        gridBorderColor,
        gridBorderWidth,
        gridGap,
        cardShadow,
        bentoLayout,
        titleColor,
        itemTitleColor,
        itemDescriptionColor,
        // Responsive Typography Attributes
        responsiveMainTitleFontSize,
        responsiveMainTitleFontWeight,
        responsiveMainTitleLineHeight,
        responsiveMainTitleColor,
        responsiveItemTitleFontSize,
        responsiveItemTitleFontWeight,
        responsiveItemTitleLineHeight,
        responsiveItemTitleColor,
        responsiveItemDescriptionFontSize,
        responsiveItemDescriptionFontWeight,
        responsiveItemDescriptionLineHeight,
        responsiveItemDescriptionColor,
        responsivePadding,
        responsiveMaxWidth,
        responsiveCardPadding,
        showSvgIcon,
        svgIconCode,
        svgIconColor,
        svgIconPosition,
        svgIconVerticalPosition,
        responsiveSvgIconWidth,
        responsiveSvgIconTransform,
        responsiveSvgIconVerticalOffset,
        responsiveSvgIconHorizontalOffset,
    } = attributes;

    const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
        if (typeof dimension === 'string') return dimension;
        const value = dimension?.value ?? fallbackValue;
        const unit = dimension?.unit ?? fallbackUnit;
        return `${value}${unit}`;
    };

    const blockProps = useBlockProps.save({
        className: `adaire-infogrid-4 ${containerMode === 'constrained' ? 'is-constrained' : ''} ${cardShadow ? 'has-card-shadow' : ''}`,
        id: blockId || undefined,
        style: {
            '--infogrid4-bg-color': backgroundColor,
            '--infogrid4-card-bg': cardBackgroundColor,
            '--infogrid4-card-radius': `${cardBorderRadius}px`,
            '--infogrid4-grid-border-color': gridBorderColor,
            '--infogrid4-grid-border-thickness': `${gridBorderWidth}px`,
            '--infogrid4-grid-gap': `${gridGap}px`,
            '--infogrid4-title-color': titleColor,
            '--infogrid4-item-title-color': itemTitleColor,
            '--infogrid4-item-text-color': itemDescriptionColor,
            // Title typography
            '--infogrid4-title-font-size-mobile': responsiveMainTitleFontSize?.mobile || '24px',
            '--infogrid4-title-font-size-tablet': responsiveMainTitleFontSize?.tablet || '28px',
            '--infogrid4-title-font-size-small-laptop': responsiveMainTitleFontSize?.smallLaptop || '32px',
            '--infogrid4-title-font-size-desktop': responsiveMainTitleFontSize?.desktop || '36px',
            '--infogrid4-title-font-size-big-desktop': responsiveMainTitleFontSize?.bigDesktop || '36px',
            '--infogrid4-title-font-weight-mobile': responsiveMainTitleFontWeight?.mobile || '600',
            '--infogrid4-title-font-weight-tablet': responsiveMainTitleFontWeight?.tablet || '600',
            '--infogrid4-title-font-weight-small-laptop': responsiveMainTitleFontWeight?.smallLaptop || '600',
            '--infogrid4-title-font-weight-desktop': responsiveMainTitleFontWeight?.desktop || '600',
            '--infogrid4-title-font-weight-big-desktop': responsiveMainTitleFontWeight?.bigDesktop || '600',
            '--infogrid4-title-line-height-mobile': responsiveMainTitleLineHeight?.mobile || '1.2',
            '--infogrid4-title-line-height-tablet': responsiveMainTitleLineHeight?.tablet || '1.2',
            '--infogrid4-title-line-height-small-laptop': responsiveMainTitleLineHeight?.smallLaptop || '1.2',
            '--infogrid4-title-line-height-desktop': responsiveMainTitleLineHeight?.desktop || '1.2',
            '--infogrid4-title-line-height-big-desktop': responsiveMainTitleLineHeight?.bigDesktop || '1.2',
            '--infogrid4-title-color-mobile': responsiveMainTitleColor?.mobile,
            '--infogrid4-title-color-tablet': responsiveMainTitleColor?.tablet,
            '--infogrid4-title-color-small-laptop': responsiveMainTitleColor?.smallLaptop,
            '--infogrid4-title-color-desktop': responsiveMainTitleColor?.desktop,
            '--infogrid4-title-color-big-desktop': responsiveMainTitleColor?.bigDesktop,

            // Item title typography
            '--infogrid4-item-title-font-size-mobile': responsiveItemTitleFontSize?.mobile || '18px',
            '--infogrid4-item-title-font-size-tablet': responsiveItemTitleFontSize?.tablet || '20px',
            '--infogrid4-item-title-font-size-small-laptop': responsiveItemTitleFontSize?.smallLaptop || '22px',
            '--infogrid4-item-title-font-size-desktop': responsiveItemTitleFontSize?.desktop || '24px',
            '--infogrid4-item-title-font-size-big-desktop': responsiveItemTitleFontSize?.bigDesktop || '24px',
            '--infogrid4-item-title-font-weight-mobile': responsiveItemTitleFontWeight?.mobile || '600',
            '--infogrid4-item-title-font-weight-tablet': responsiveItemTitleFontWeight?.tablet || '600',
            '--infogrid4-item-title-font-weight-small-laptop': responsiveItemTitleFontWeight?.smallLaptop || '600',
            '--infogrid4-item-title-font-weight-desktop': responsiveItemTitleFontWeight?.desktop || '600',
            '--infogrid4-item-title-font-weight-big-desktop': responsiveItemTitleFontWeight?.bigDesktop || '600',
            '--infogrid4-item-title-line-height-mobile': responsiveItemTitleLineHeight?.mobile || '1.3',
            '--infogrid4-item-title-line-height-tablet': responsiveItemTitleLineHeight?.tablet || '1.3',
            '--infogrid4-item-title-line-height-small-laptop': responsiveItemTitleLineHeight?.smallLaptop || '1.3',
            '--infogrid4-item-title-line-height-desktop': responsiveItemTitleLineHeight?.desktop || '1.3',
            '--infogrid4-item-title-line-height-big-desktop': responsiveItemTitleLineHeight?.bigDesktop || '1.3',
            '--infogrid4-item-title-color-mobile': responsiveItemTitleColor?.mobile,
            '--infogrid4-item-title-color-tablet': responsiveItemTitleColor?.tablet,
            '--infogrid4-item-title-color-small-laptop': responsiveItemTitleColor?.smallLaptop,
            '--infogrid4-item-title-color-desktop': responsiveItemTitleColor?.desktop,
            '--infogrid4-item-title-color-big-desktop': responsiveItemTitleColor?.bigDesktop,

            // Item description typography
            '--infogrid4-item-text-font-size-mobile': responsiveItemDescriptionFontSize?.mobile || '14px',
            '--infogrid4-item-text-font-size-tablet': responsiveItemDescriptionFontSize?.tablet || '15px',
            '--infogrid4-item-text-font-size-small-laptop': responsiveItemDescriptionFontSize?.smallLaptop || '16px',
            '--infogrid4-item-text-font-size-desktop': responsiveItemDescriptionFontSize?.desktop || '16px',
            '--infogrid4-item-text-font-size-big-desktop': responsiveItemDescriptionFontSize?.bigDesktop || '16px',
            '--infogrid4-item-text-font-weight-mobile': responsiveItemDescriptionFontWeight?.mobile || '400',
            '--infogrid4-item-text-font-weight-tablet': responsiveItemDescriptionFontWeight?.tablet || '400',
            '--infogrid4-item-text-font-weight-small-laptop': responsiveItemDescriptionFontWeight?.smallLaptop || '400',
            '--infogrid4-item-text-font-weight-desktop': responsiveItemDescriptionFontWeight?.desktop || '400',
            '--infogrid4-item-text-font-weight-big-desktop': responsiveItemDescriptionFontWeight?.bigDesktop || '400',
            '--infogrid4-item-text-line-height-mobile': responsiveItemDescriptionLineHeight?.mobile || '1.5',
            '--infogrid4-item-text-line-height-tablet': responsiveItemDescriptionLineHeight?.tablet || '1.5',
            '--infogrid4-item-text-line-height-small-laptop': responsiveItemDescriptionLineHeight?.smallLaptop || '1.5',
            '--infogrid4-item-text-line-height-desktop': responsiveItemDescriptionLineHeight?.desktop || '1.5',
            '--infogrid4-item-text-line-height-big-desktop': responsiveItemDescriptionLineHeight?.bigDesktop || '1.5',
            '--infogrid4-item-text-color-mobile': responsiveItemDescriptionColor?.mobile,
            '--infogrid4-item-text-color-tablet': responsiveItemDescriptionColor?.tablet,
            '--infogrid4-item-text-color-small-laptop': responsiveItemDescriptionColor?.smallLaptop,
            '--infogrid4-item-text-color-desktop': responsiveItemDescriptionColor?.desktop,
            '--infogrid4-item-text-color-big-desktop': responsiveItemDescriptionColor?.bigDesktop,

            // Container padding
            '--infogrid4-padding-top-mobile': responsivePadding?.mobile?.top || '40px',
            '--infogrid4-padding-right-mobile': responsivePadding?.mobile?.right || '20px',
            '--infogrid4-padding-bottom-mobile': responsivePadding?.mobile?.bottom || '40px',
            '--infogrid4-padding-left-mobile': responsivePadding?.mobile?.left || '20px',
            '--infogrid4-padding-top-tablet': responsivePadding?.tablet?.top || '60px',
            '--infogrid4-padding-right-tablet': responsivePadding?.tablet?.right || '40px',
            '--infogrid4-padding-bottom-tablet': responsivePadding?.tablet?.bottom || '60px',
            '--infogrid4-padding-left-tablet': responsivePadding?.tablet?.left || '40px',
            '--infogrid4-padding-top-small-laptop': responsivePadding?.smallLaptop?.top || '80px',
            '--infogrid4-padding-right-small-laptop': responsivePadding?.smallLaptop?.right || '60px',
            '--infogrid4-padding-bottom-small-laptop': responsivePadding?.smallLaptop?.bottom || '80px',
            '--infogrid4-padding-left-small-laptop': responsivePadding?.smallLaptop?.left || '60px',
            '--infogrid4-padding-top-desktop': responsivePadding?.desktop?.top || '100px',
            '--infogrid4-padding-right-desktop': responsivePadding?.desktop?.right || '80px',
            '--infogrid4-padding-bottom-desktop': responsivePadding?.desktop?.bottom || '100px',
            '--infogrid4-padding-left-desktop': responsivePadding?.desktop?.left || '80px',
            '--infogrid4-padding-top-big-desktop': responsivePadding?.bigDesktop?.top || '100px',
            '--infogrid4-padding-right-big-desktop': responsivePadding?.bigDesktop?.right || '80px',
            '--infogrid4-padding-bottom-big-desktop': responsivePadding?.bigDesktop?.bottom || '100px',
            '--infogrid4-padding-left-big-desktop': responsivePadding?.bigDesktop?.left || '80px',
            // Max width
            '--infogrid4-container-max-width-mobile': formatDimensionValue(responsiveMaxWidth?.mobile, 100, '%'),
            '--infogrid4-container-max-width-tablet': formatDimensionValue(responsiveMaxWidth?.tablet, 100, '%'),
            '--infogrid4-container-max-width-small-laptop': formatDimensionValue(responsiveMaxWidth?.smallLaptop, 1200, 'px'),
            '--infogrid4-container-max-width-desktop': formatDimensionValue(responsiveMaxWidth?.desktop, 1400, 'px'),
            '--infogrid4-container-max-width-big-desktop': formatDimensionValue(responsiveMaxWidth?.bigDesktop, 1400, 'px'),
            // Card padding
            '--infogrid4-card-padding-top-mobile': responsiveCardPadding?.mobile?.top || '30px',
            '--infogrid4-card-padding-right-mobile': responsiveCardPadding?.mobile?.right || '20px',
            '--infogrid4-card-padding-bottom-mobile': responsiveCardPadding?.mobile?.bottom || '30px',
            '--infogrid4-card-padding-left-mobile': responsiveCardPadding?.mobile?.left || '20px',
            '--infogrid4-card-padding-top-tablet': responsiveCardPadding?.tablet?.top || '40px',
            '--infogrid4-card-padding-right-tablet': responsiveCardPadding?.tablet?.right || '30px',
            '--infogrid4-card-padding-bottom-tablet': responsiveCardPadding?.tablet?.bottom || '40px',
            '--infogrid4-card-padding-left-tablet': responsiveCardPadding?.tablet?.left || '30px',
            '--infogrid4-card-padding-top-small-laptop': responsiveCardPadding?.smallLaptop?.top || '50px',
            '--infogrid4-card-padding-right-small-laptop': responsiveCardPadding?.smallLaptop?.right || '40px',
            '--infogrid4-card-padding-bottom-small-laptop': responsiveCardPadding?.smallLaptop?.bottom || '50px',
            '--infogrid4-card-padding-left-small-laptop': responsiveCardPadding?.smallLaptop?.left || '40px',
            '--infogrid4-card-padding-top-desktop': responsiveCardPadding?.desktop?.top || '60px',
            '--infogrid4-card-padding-right-desktop': responsiveCardPadding?.desktop?.right || '50px',
            '--infogrid4-card-padding-bottom-desktop': responsiveCardPadding?.desktop?.bottom || '60px',
            '--infogrid4-card-padding-left-desktop': responsiveCardPadding?.desktop?.left || '50px',
            '--infogrid4-card-padding-top-big-desktop': responsiveCardPadding?.bigDesktop?.top || '60px',
            '--infogrid4-card-padding-right-big-desktop': responsiveCardPadding?.bigDesktop?.right || '50px',
            '--infogrid4-card-padding-bottom-big-desktop': responsiveCardPadding?.bigDesktop?.bottom || '60px',
            '--infogrid4-card-padding-left-big-desktop': responsiveCardPadding?.bigDesktop?.left || '50px',
            // SVG icon
            '--infogrid4-svg-color': svgIconColor || '#d1d5db',
            '--infogrid4-svg-width-mobile': responsiveSvgIconWidth?.mobile || '0px',
            '--infogrid4-svg-width-tablet': responsiveSvgIconWidth?.tablet || '0px',
            '--infogrid4-svg-width-small-laptop': responsiveSvgIconWidth?.smallLaptop || '400px',
            '--infogrid4-svg-width-desktop': responsiveSvgIconWidth?.desktop || '500px',
            '--infogrid4-svg-width-big-desktop': responsiveSvgIconWidth?.bigDesktop || '500px',
            '--infogrid4-svg-transform-mobile': responsiveSvgIconTransform?.mobile || 'none',
            '--infogrid4-svg-transform-tablet': responsiveSvgIconTransform?.tablet || 'none',
            '--infogrid4-svg-transform-small-laptop': responsiveSvgIconTransform?.smallLaptop || 'translateY(-50%)',
            '--infogrid4-svg-transform-desktop': responsiveSvgIconTransform?.desktop || 'translateY(-50%)',
            '--infogrid4-svg-transform-big-desktop': responsiveSvgIconTransform?.bigDesktop || 'translateY(-50%)',
            '--infogrid4-svg-vertical-offset-mobile': responsiveSvgIconVerticalOffset?.mobile || '0px',
            '--infogrid4-svg-vertical-offset-tablet': responsiveSvgIconVerticalOffset?.tablet || '0px',
            '--infogrid4-svg-vertical-offset-small-laptop': responsiveSvgIconVerticalOffset?.smallLaptop || '0px',
            '--infogrid4-svg-vertical-offset-desktop': responsiveSvgIconVerticalOffset?.desktop || '0px',
            '--infogrid4-svg-vertical-offset-big-desktop': responsiveSvgIconVerticalOffset?.bigDesktop || '0px',
            '--infogrid4-svg-horizontal-offset-mobile': responsiveSvgIconHorizontalOffset?.mobile || '0px',
            '--infogrid4-svg-horizontal-offset-tablet': responsiveSvgIconHorizontalOffset?.tablet || '0px',
            '--infogrid4-svg-horizontal-offset-small-laptop': responsiveSvgIconHorizontalOffset?.smallLaptop || '0px',
            '--infogrid4-svg-horizontal-offset-desktop': responsiveSvgIconHorizontalOffset?.desktop || '0px',
            '--infogrid4-svg-horizontal-offset-big-desktop': responsiveSvgIconHorizontalOffset?.bigDesktop || '0px',
            '--infogrid4-svg-position': svgIconPosition || 'right',
            '--infogrid4-svg-vertical-position': svgIconVerticalPosition || 'top',
        },
    });

    return (
        <div {...blockProps}>
            <div className="adaire-infogrid-4__inner">
                {showSvgIcon && svgIconCode && (
                    <div
                        className="adaire-infogrid-4__svg-icon"
                        data-position={svgIconPosition}
                        data-vertical-position={svgIconVerticalPosition}
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: svgIconCode }}
                    />
                )}

                <div className="adaire-infogrid-4__header">
                    <h2 className="adaire-infogrid-4__title">
                        {mainTitle}
                    </h2>
                </div>

                <div className="adaire-infogrid-4__grid" data-layout={bentoLayout || 'symmetrical'}>
                    {cards.map((card, index) => (
                        <div key={index} className={`adaire-infogrid-4__item adaire-infogrid-4__item--${index + 1}`}>
                            <h3 className="adaire-infogrid-4__item-title">{card.title}</h3>
                            <p className="adaire-infogrid-4__item-text">{card.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}






