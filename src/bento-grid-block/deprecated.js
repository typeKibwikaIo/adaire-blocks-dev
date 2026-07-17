/**
 * Bento Grid (bento-grid-block) deprecations — most recent first.
 *
 * v3  Frozen copy of the save() that shipped before item1Title..item4Description
 *     (four fixed cards) were replaced by a repeatable `cards` array attribute,
 *     enabling variable card counts for the new layout presets. `migrate`
 *     rebuilds `cards` from the four flat item fields.
 *
 * v2  Frozen copy of the save() that shipped before the `bentoLayout` preset
 *     selector added a `data-layout` attribute to the grid wrapper. Same flat
 *     item1-4 attribute shape as v3, so it needs the same `cards` migration.
 *
 * v1  Frozen copy of the save() that shipped before the Bento Grid visual
 *     refresh added `gridGap`/`cardShadow` attributes (individual cards with
 *     a gap between them, instead of one bordered box with shared edges).
 *     Same flat item1-4 attribute shape, so it also needs the `cards`
 *     migration.
 *
 * All three entries declare an explicit `attributes` schema matching the old
 * flat item1-4 shape — they can no longer fall back to the current
 * block.json attributes now that `cards` has replaced item1Title..item4Description
 * there.
 */
import { useBlockProps } from '@wordpress/block-editor';

const LEGACY_ATTRIBUTES = {
    blockId: { type: 'string', default: '' },
    containerMode: { type: 'string', default: 'constrained' },
    mainTitle: { type: 'string', default: 'The Lumenalta difference' },
    item1Title: { type: 'string', default: 'Fulfilling work' },
    item1Description: { type: 'string', default: 'Build cutting-edge tech with great client partners and team members. Solve complex problems in an environment where you have the freedom to optimize for possibilities.' },
    item2Title: { type: 'string', default: 'Remote from the start' },
    item2Description: { type: 'string', default: "Since the beginning we've been an office-less company so you can be as ambitious in your professional life as you are in your personal life." },
    item3Title: { type: 'string', default: 'Dedicated teams' },
    item3Description: { type: 'string', default: 'Brain space for one problem set at a time, no burdensome time sheets. High expectations for your professionalism, but total trust in you.' },
    item4Title: { type: 'string', default: 'Diverse' },
    item4Description: { type: 'string', default: 'We foster a culture of diversity and inclusion, valuing unique perspectives and empowering everyone to thrive and contribute fully.' },
    backgroundColor: { type: 'string', default: '#f3f4f6' },
    cardBackgroundColor: { type: 'string', default: '#ffffff' },
    cardBorderRadius: { type: 'number', default: 16 },
    gridBorderColor: { type: 'string', default: '#e5e7eb' },
    gridBorderWidth: { type: 'number', default: 1 },
    gridGap: { type: 'number', default: 24 },
    cardShadow: { type: 'boolean', default: true },
    bentoLayout: {
        type: 'string',
        default: 'even',
        enum: ['even', 'featured-left', 'featured-top', 'three-column'],
    },
    titleColor: { type: 'string', default: '#1f2937' },
    itemTitleColor: { type: 'string', default: '#1f2937' },
    itemDescriptionColor: { type: 'string', default: '#4b5563' },
    titleFontSize: { type: 'object', default: { mobile: '24px', tablet: '28px', smallLaptop: '32px', desktop: '36px', bigDesktop: '36px' } },
    titleFontWeight: { type: 'string', default: '600' },
    titleLineHeight: { type: 'object', default: { mobile: '1.2', tablet: '1.2', smallLaptop: '1.2', desktop: '1.2', bigDesktop: '1.2' } },
    itemTitleFontSize: { type: 'object', default: { mobile: '18px', tablet: '20px', smallLaptop: '22px', desktop: '24px', bigDesktop: '24px' } },
    itemTitleFontWeight: { type: 'string', default: '600' },
    itemTitleLineHeight: { type: 'object', default: { mobile: '1.3', tablet: '1.3', smallLaptop: '1.3', desktop: '1.3', bigDesktop: '1.3' } },
    itemDescriptionFontSize: { type: 'object', default: { mobile: '14px', tablet: '15px', smallLaptop: '16px', desktop: '16px', bigDesktop: '16px' } },
    itemDescriptionFontWeight: { type: 'string', default: '400' },
    itemDescriptionLineHeight: { type: 'object', default: { mobile: '1.5', tablet: '1.5', smallLaptop: '1.5', desktop: '1.5', bigDesktop: '1.5' } },
    responsivePadding: {
        type: 'object',
        default: {
            mobile: { top: '40px', right: '20px', bottom: '40px', left: '20px' },
            tablet: { top: '60px', right: '40px', bottom: '60px', left: '40px' },
            smallLaptop: { top: '80px', right: '60px', bottom: '80px', left: '60px' },
            desktop: { top: '100px', right: '80px', bottom: '100px', left: '80px' },
            bigDesktop: { top: '100px', right: '80px', bottom: '100px', left: '80px' },
        },
    },
    responsiveMaxWidth: {
        type: 'object',
        default: {
            mobile: { value: 100, unit: '%' },
            tablet: { value: 100, unit: '%' },
            smallLaptop: { value: 1200, unit: 'px' },
            desktop: { value: 1400, unit: 'px' },
            bigDesktop: { value: 1400, unit: 'px' },
        },
    },
    responsiveMainTitleFontSize: { type: 'object', default: { mobile: '24px', tablet: '28px', smallLaptop: '32px', desktop: '36px', bigDesktop: '36px' } },
    responsiveMainTitleFontWeight: { type: 'object', default: { mobile: '600', tablet: '600', smallLaptop: '600', desktop: '600', bigDesktop: '600' } },
    responsiveMainTitleLineHeight: { type: 'object', default: { mobile: '1.2', tablet: '1.2', smallLaptop: '1.2', desktop: '1.2', bigDesktop: '1.2' } },
    responsiveMainTitleColor: { type: 'object', default: { mobile: '#111827', tablet: '#111827', smallLaptop: '#111827', desktop: '#111827', bigDesktop: '#111827' } },
    responsiveItemTitleFontSize: { type: 'object', default: { mobile: '18px', tablet: '20px', smallLaptop: '22px', desktop: '24px', bigDesktop: '24px' } },
    responsiveItemTitleFontWeight: { type: 'object', default: { mobile: '600', tablet: '600', smallLaptop: '600', desktop: '600', bigDesktop: '600' } },
    responsiveItemTitleLineHeight: { type: 'object', default: { mobile: '1.3', tablet: '1.3', smallLaptop: '1.3', desktop: '1.3', bigDesktop: '1.3' } },
    responsiveItemTitleColor: { type: 'object', default: { mobile: '#111827', tablet: '#111827', smallLaptop: '#111827', desktop: '#111827', bigDesktop: '#111827' } },
    responsiveItemDescriptionFontSize: { type: 'object', default: { mobile: '14px', tablet: '15px', smallLaptop: '16px', desktop: '16px', bigDesktop: '16px' } },
    responsiveItemDescriptionFontWeight: { type: 'object', default: { mobile: '400', tablet: '400', smallLaptop: '400', desktop: '400', bigDesktop: '400' } },
    responsiveItemDescriptionLineHeight: { type: 'object', default: { mobile: '1.5', tablet: '1.5', smallLaptop: '1.5', desktop: '1.5', bigDesktop: '1.5' } },
    responsiveItemDescriptionColor: { type: 'object', default: { mobile: '#4b5563', tablet: '#4b5563', smallLaptop: '#4b5563', desktop: '#4b5563', bigDesktop: '#4b5563' } },
    responsiveCardPadding: {
        type: 'object',
        default: {
            mobile: { top: '30px', right: '20px', bottom: '30px', left: '20px' },
            tablet: { top: '40px', right: '30px', bottom: '40px', left: '30px' },
            smallLaptop: { top: '50px', right: '40px', bottom: '50px', left: '40px' },
            desktop: { top: '60px', right: '50px', bottom: '60px', left: '50px' },
            bigDesktop: { top: '60px', right: '50px', bottom: '60px', left: '50px' },
        },
    },
    showSvgIcon: { type: 'boolean', default: false },
    svgIconCode: { type: 'string', default: '' },
    svgIconColor: { type: 'string', default: '#d1d5db' },
    svgIconPosition: { type: 'string', default: 'right' },
    svgIconVerticalPosition: { type: 'string', default: 'top' },
    responsiveSvgIconWidth: { type: 'object', default: { mobile: '0px', tablet: '0px', smallLaptop: '400px', desktop: '500px', bigDesktop: '500px' } },
    responsiveSvgIconTransform: { type: 'object', default: { mobile: 'none', tablet: 'none', smallLaptop: 'translateY(-50%)', desktop: 'translateY(-50%)', bigDesktop: 'translateY(-50%)' } },
    responsiveSvgIconVerticalOffset: { type: 'object', default: { mobile: '0px', tablet: '0px', smallLaptop: '0px', desktop: '0px', bigDesktop: '0px' } },
    responsiveSvgIconHorizontalOffset: { type: 'object', default: { mobile: '0px', tablet: '0px', smallLaptop: '0px', desktop: '0px', bigDesktop: '0px' } },
};

function migrateItemsToCards(attributes) {
    const {
        item1Title, item1Description,
        item2Title, item2Description,
        item3Title, item3Description,
        item4Title, item4Description,
        ...rest
    } = attributes;

    return {
        ...rest,
        cards: [
            { title: item1Title, description: item1Description },
            { title: item2Title, description: item2Description },
            { title: item3Title, description: item3Description },
            { title: item4Title, description: item4Description },
        ],
    };
}

const deprecatedV3 = {
    attributes: LEGACY_ATTRIBUTES,
    migrate: migrateItemsToCards,

    save({ attributes }) {
        const {
            blockId,
            containerMode,
            mainTitle,
            item1Title,
            item1Description,
            item2Title,
            item2Description,
            item3Title,
            item3Description,
            item4Title,
            item4Description,
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

                    <div className="adaire-infogrid-4__grid" data-layout={bentoLayout || 'even'}>
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--1">
                            <h3 className="adaire-infogrid-4__item-title">{item1Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item1Description}</p>
                        </div>
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--2">
                            <h3 className="adaire-infogrid-4__item-title">{item2Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item2Description}</p>
                        </div>
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--3">
                            <h3 className="adaire-infogrid-4__item-title">{item3Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item3Description}</p>
                        </div>
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--4">
                            <h3 className="adaire-infogrid-4__item-title">{item4Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item4Description}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
};

const deprecatedV2 = {
    attributes: LEGACY_ATTRIBUTES,
    migrate: migrateItemsToCards,

    save({ attributes }) {
        const {
            blockId,
            containerMode,
            mainTitle,
            item1Title,
            item1Description,
            item2Title,
            item2Description,
            item3Title,
            item3Description,
            item4Title,
            item4Description,
            backgroundColor,
            cardBackgroundColor,
            cardBorderRadius,
            gridBorderColor,
            gridBorderWidth,
            gridGap,
            cardShadow,
            titleColor,
            itemTitleColor,
            itemDescriptionColor,
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
                '--infogrid4-container-max-width-mobile': formatDimensionValue(responsiveMaxWidth?.mobile, 100, '%'),
                '--infogrid4-container-max-width-tablet': formatDimensionValue(responsiveMaxWidth?.tablet, 100, '%'),
                '--infogrid4-container-max-width-small-laptop': formatDimensionValue(responsiveMaxWidth?.smallLaptop, 1200, 'px'),
                '--infogrid4-container-max-width-desktop': formatDimensionValue(responsiveMaxWidth?.desktop, 1400, 'px'),
                '--infogrid4-container-max-width-big-desktop': formatDimensionValue(responsiveMaxWidth?.bigDesktop, 1400, 'px'),
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

                    <div className="adaire-infogrid-4__grid">
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--1">
                            <h3 className="adaire-infogrid-4__item-title">{item1Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item1Description}</p>
                        </div>
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--2">
                            <h3 className="adaire-infogrid-4__item-title">{item2Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item2Description}</p>
                        </div>
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--3">
                            <h3 className="adaire-infogrid-4__item-title">{item3Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item3Description}</p>
                        </div>
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--4">
                            <h3 className="adaire-infogrid-4__item-title">{item4Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item4Description}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
};

const deprecatedV1 = {
    attributes: LEGACY_ATTRIBUTES,
    migrate: migrateItemsToCards,

    save({ attributes }) {
        const {
            blockId,
            containerMode,
            mainTitle,
            item1Title,
            item1Description,
            item2Title,
            item2Description,
            item3Title,
            item3Description,
            item4Title,
            item4Description,
            backgroundColor,
            cardBackgroundColor,
            cardBorderRadius,
            gridBorderColor,
            gridBorderWidth,
            titleColor,
            itemTitleColor,
            itemDescriptionColor,
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
            className: `adaire-infogrid-4 ${containerMode === 'constrained' ? 'is-constrained' : ''}`,
            id: blockId || undefined,
            style: {
                '--infogrid4-bg-color': backgroundColor,
                '--infogrid4-card-bg': cardBackgroundColor,
                '--infogrid4-card-radius': `${cardBorderRadius}px`,
                '--infogrid4-grid-border-color': gridBorderColor,
                '--infogrid4-grid-border-thickness': `${gridBorderWidth}px`,
                '--infogrid4-title-color': titleColor,
                '--infogrid4-item-title-color': itemTitleColor,
                '--infogrid4-item-text-color': itemDescriptionColor,
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
                '--infogrid4-container-max-width-mobile': formatDimensionValue(responsiveMaxWidth?.mobile, 100, '%'),
                '--infogrid4-container-max-width-tablet': formatDimensionValue(responsiveMaxWidth?.tablet, 100, '%'),
                '--infogrid4-container-max-width-small-laptop': formatDimensionValue(responsiveMaxWidth?.smallLaptop, 1200, 'px'),
                '--infogrid4-container-max-width-desktop': formatDimensionValue(responsiveMaxWidth?.desktop, 1400, 'px'),
                '--infogrid4-container-max-width-big-desktop': formatDimensionValue(responsiveMaxWidth?.bigDesktop, 1400, 'px'),
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

                    <div className="adaire-infogrid-4__grid">
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--1">
                            <h3 className="adaire-infogrid-4__item-title">{item1Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item1Description}</p>
                        </div>
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--2">
                            <h3 className="adaire-infogrid-4__item-title">{item2Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item2Description}</p>
                        </div>
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--3">
                            <h3 className="adaire-infogrid-4__item-title">{item3Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item3Description}</p>
                        </div>
                        <div className="adaire-infogrid-4__item adaire-infogrid-4__item--4">
                            <h3 className="adaire-infogrid-4__item-title">{item4Title}</h3>
                            <p className="adaire-infogrid-4__item-text">{item4Description}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
};

export default [deprecatedV3, deprecatedV2, deprecatedV1];
