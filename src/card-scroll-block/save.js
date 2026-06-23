import { useBlockProps, RichText, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        blockId,
        containerMode,
        responsiveMaxWidth,
        responsivePadding,
        responsiveCardPadding,
        responsiveTitleFontSize,
        responsiveTitleFontWeight,
        responsiveTitleLineHeight,
        responsiveDescriptionFontSize,
        responsiveDescriptionFontWeight,
        responsiveDescriptionLineHeight,
        responsiveImageDimensions,
        responsiveCardMinHeight,
        responsiveCardWidth,
        introHeight,
        outroHeight,
        responsiveLastCardBottomHeight
    } = attributes;

    const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
        if (typeof dimension === 'string') return dimension;
        const value = dimension?.value ?? fallbackValue;
        const unit = dimension?.unit ?? fallbackUnit;
        return `${value}${unit}`;
    };

    const getResponsiveStyle = (device, attr, prop, fallback, unit = 'px') => {
        return attr?.[device]?.[prop] ? attr[device][prop] : fallback;
    };

    const getResponsiveValue = (device, attr, fallback) => {
        return attr?.[device] ? attr[device] : fallback;
    };

    // Helper to generate CSS vars for a specific device
    const generateVars = (device) => ({
        [`--container-max-width-${device}`]: formatDimensionValue(responsiveMaxWidth?.[device], '1200', 'px'),
        [`--padding-top-${device}`]: responsivePadding?.[device]?.top,
        [`--padding-right-${device}`]: responsivePadding?.[device]?.right,
        [`--padding-bottom-${device}`]: responsivePadding?.[device]?.bottom,
        [`--padding-left-${device}`]: responsivePadding?.[device]?.left,
        [`--card-padding-top-${device}`]: responsiveCardPadding?.[device]?.top,
        [`--card-padding-right-${device}`]: responsiveCardPadding?.[device]?.right,
        [`--card-padding-bottom-${device}`]: responsiveCardPadding?.[device]?.bottom,
        [`--card-padding-left-${device}`]: responsiveCardPadding?.[device]?.left,
        [`--title-font-size-${device}`]: responsiveTitleFontSize?.[device],
        [`--title-font-weight-${device}`]: responsiveTitleFontWeight?.[device],
        [`--title-line-height-${device}`]: responsiveTitleLineHeight?.[device],
        [`--desc-font-size-${device}`]: responsiveDescriptionFontSize?.[device],
        [`--desc-font-weight-${device}`]: responsiveDescriptionFontWeight?.[device],
        [`--desc-line-height-${device}`]: responsiveDescriptionLineHeight?.[device],
        [`--image-width-${device}`]: responsiveImageDimensions?.[device]?.width || '100%',
        [`--image-height-${device}`]: responsiveImageDimensions?.[device]?.height || 'auto',
        [`--card-min-height-${device}`]: responsiveCardMinHeight?.[device],
        [`--card-width-${device}`]: responsiveCardWidth?.[device] || '100%',
        [`--last-card-bottom-height-${device}`]: responsiveLastCardBottomHeight?.[device] || '0px',
    });

    const style = {
        '--intro-height': introHeight,
        '--outro-height': outroHeight,
        ...generateVars('mobile'),
        ...generateVars('tablet'),
        ...generateVars('smallLaptop'),
        ...generateVars('desktop'),
        ...generateVars('bigDesktop'),
    };

    const blockProps = useBlockProps.save({
        className: `adaire-card-scroll ${containerMode === 'constrained' ? 'is-constrained' : ''}`,
        id: blockId,
        style: style
    });

    return (
        <div {...blockProps}>
            <div className={`adaire-card-scroll__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                <div className="adaire-card-scroll__intro"></div>

                <div className="adaire-card-scroll__cards">
                    <InnerBlocks.Content />
                </div>

                <div className="adaire-card-scroll__outro"></div>
            </div>
        </div>
    );
}



