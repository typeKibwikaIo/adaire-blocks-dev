import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    PanelColorSettings,
    RichText,
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    TextareaControl,
    RangeControl,
    SelectControl,
    ToggleControl,
    Button,
    ButtonGroup,
    __experimentalUnitControl as UnitControl,
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { useState, useEffect, createElement, useCallback, useRef } from '@wordpress/element';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { BENTO_LAYOUTS, getBentoLayout, makeDefaultCard } from './bento-layouts';
import BentoPresetIcon from './BentoPresetIcon';

// Custom icons for small laptop and big desktop (copied from other blocks for consistency)
const smallLaptopIcon = createElement('svg', {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
},
    createElement('path', {
        d: 'M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        fill: 'none',
    }),
    createElement('path', {
        d: 'M2 19H22',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        strokeLinecap: 'round',
    }),
);

const bigDesktopIcon = createElement('svg', {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
},
    createElement('rect', {
        x: '3',
        y: '4',
        width: '18',
        height: '12',
        rx: '1',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        fill: 'none',
    }),
    createElement('path', {
        d: 'M8 20H16',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        strokeLinecap: 'round',
    }),
    createElement('rect', {
        x: '10',
        y: '20',
        width: '4',
        height: '2',
        rx: '0.5',
        fill: 'currentColor',
    }),
);

const BREAKPOINTS = [
    { name: 'mobile', icon: mobile, label: __('Mobile', 'adaire-blocks-dev2') },
    { name: 'tablet', icon: tablet, label: __('Tablet', 'adaire-blocks-dev2') },
    { name: 'smallLaptop', icon: smallLaptopIcon, label: __('Small Laptop', 'adaire-blocks-dev2') },
    { name: 'desktop', icon: desktop, label: __('Desktop', 'adaire-blocks-dev2') },
    { name: 'bigDesktop', icon: bigDesktopIcon, label: __('Big Desktop', 'adaire-blocks-dev2') },
];

// Helper components moved outside Edit to prevent focus loss
const TypographySection = ({ attributes, updateResponsiveAttribute, deviceType, label, fontSizeAttr, fontWeightAttr, lineHeightAttr, colorAttr }) => (
    <div className="adaire-typography-section" style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
        <p className="adaire-typography-section-name" style={{ fontWeight: 600, marginBottom: '12px' }}>{label}</p>
        <UnitControl
            label={__('Font Size', 'adaire-blocks-dev2')}
            value={attributes[fontSizeAttr][deviceType]}
            onChange={(val) => updateResponsiveAttribute(fontSizeAttr, deviceType, val)}
        />
        {fontWeightAttr && (
            <SelectControl
                label={__('Font Weight', 'adaire-blocks-dev2')}
                value={attributes[fontWeightAttr][deviceType]}
                options={[
                    { label: '100', value: '100' }, { label: '200', value: '200' },
                    { label: '300', value: '300' }, { label: '400', value: '400' },
                    { label: '500', value: '500' }, { label: '600', value: '600' },
                    { label: '700', value: '700' }, { label: '800', value: '800' },
                    { label: '900', value: '900' }
                ]}
                onChange={(val) => updateResponsiveAttribute(fontWeightAttr, deviceType, val)}
            />
        )}
        {lineHeightAttr && (
            <UnitControl
                label={__('Line Height', 'adaire-blocks-dev2')}
                value={attributes[lineHeightAttr][deviceType]}
                onChange={(val) => updateResponsiveAttribute(lineHeightAttr, deviceType, val)}
            />
        )}
        <PanelColorSettings
            title={__('Color', 'adaire-blocks-dev2')}
            initialOpen={false}
            colorSettings={[
                {
                    value: attributes[colorAttr][deviceType],
                    onChange: (val) => updateResponsiveAttribute(colorAttr, deviceType, val),
                    label: __('Text Color', 'adaire-blocks-dev2'),
                }
            ]}
        />
    </div>
);

const Edit = ({ attributes, setAttributes, clientId }) => {
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

    const [deviceType, setDeviceType] = useState('desktop');

    const CONTAINER_MODES = [
        { label: __('Full Width', 'adaire-blocks-dev2'), value: 'full' },
        { label: __('Constrained', 'adaire-blocks-dev2'), value: 'constrained' },
    ];

    const UNIT_OPTIONS = ['px', '%', 'rem', 'vw'];

    // Generate block ID
    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: `infogrid-4-${clientId}` });
        }
    }, [blockId, clientId, setAttributes]);

    const attributesRef = useRef(attributes);
    useEffect(() => {
        attributesRef.current = attributes;
    }, [attributes]);

    const updateResponsive = useCallback((attr, breakpoint, value) => {
        setAttributes({
            [attr]: {
                ...(attributesRef.current[attr] || {}),
                [breakpoint]: value,
            },
        });
    }, [setAttributes]);

    // Alias used by TypographySection
    const updateResponsiveAttribute = updateResponsive;

    const updateCard = (index, field, value) => {
        const next = cards.map((card, i) => (i === index ? { ...card, [field]: value } : card));
        setAttributes({ cards: next });
    };

    const addCard = () => {
        setAttributes({ cards: [...cards, makeDefaultCard(cards.length)] });
    };

    const removeCard = (index) => {
        setAttributes({ cards: cards.filter((_, i) => i !== index) });
    };

    const selectBentoLayout = (layoutId) => {
        const layout = getBentoLayout(layoutId);
        const next = { bentoLayout: layoutId };
        if (cards.length < layout.cardCount) {
            const padded = [...cards];
            while (padded.length < layout.cardCount) {
                padded.push(makeDefaultCard(padded.length));
            }
            next.cards = padded;
        }
        setAttributes(next);
    };

    const updateContainerDimension = (device, property, value) => {
        const currentVal = responsiveMaxWidth?.[device] || {};
        const next = {
            ...responsiveMaxWidth,
            [device]: {
                ...currentVal,
                [property]: value
            }
        };
        setAttributes({ responsiveMaxWidth: next });
    };

    const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
        // If it's still a string (old format), return it directly or parse it if needed
        if (typeof dimension === 'string') return dimension;

        const value = dimension?.value ?? fallbackValue;
        const unit = dimension?.unit ?? fallbackUnit;
        return `${value}${unit}`;
    };

    const blockProps = useBlockProps({
        className: `adaire-infogrid-4 ${containerMode === 'constrained' ? 'is-constrained' : ''} ${cardShadow ? 'has-card-shadow' : ''}`,
        style: {
            '--infogrid4-bg-color': backgroundColor,
            '--infogrid4-card-bg': cardBackgroundColor,
            '--infogrid4-card-radius': `${cardBorderRadius}px`,
            '--infogrid4-grid-border-color': gridBorderColor,
            '--infogrid4-grid-border-thickness': `${gridBorderWidth}px`,
            '--infogrid4-grid-gap': `${gridGap}px`,
            // Title typography
            '--infogrid4-title-font-size-mobile': responsiveMainTitleFontSize?.mobile,
            '--infogrid4-title-font-size-tablet': responsiveMainTitleFontSize?.tablet,
            '--infogrid4-title-font-size-small-laptop': responsiveMainTitleFontSize?.smallLaptop,
            '--infogrid4-title-font-size-desktop': responsiveMainTitleFontSize?.desktop,
            '--infogrid4-title-font-size-big-desktop': responsiveMainTitleFontSize?.bigDesktop,
            '--infogrid4-title-font-weight-mobile': responsiveMainTitleFontWeight?.mobile,
            '--infogrid4-title-font-weight-tablet': responsiveMainTitleFontWeight?.tablet,
            '--infogrid4-title-font-weight-small-laptop': responsiveMainTitleFontWeight?.smallLaptop,
            '--infogrid4-title-font-weight-desktop': responsiveMainTitleFontWeight?.desktop,
            '--infogrid4-title-font-weight-big-desktop': responsiveMainTitleFontWeight?.bigDesktop,
            '--infogrid4-title-line-height-mobile': responsiveMainTitleLineHeight?.mobile,
            '--infogrid4-title-line-height-tablet': responsiveMainTitleLineHeight?.tablet,
            '--infogrid4-title-line-height-small-laptop': responsiveMainTitleLineHeight?.smallLaptop,
            '--infogrid4-title-line-height-desktop': responsiveMainTitleLineHeight?.desktop,
            '--infogrid4-title-line-height-big-desktop': responsiveMainTitleLineHeight?.bigDesktop,
            '--infogrid4-title-color-mobile': responsiveMainTitleColor?.mobile,
            '--infogrid4-title-color-tablet': responsiveMainTitleColor?.tablet,
            '--infogrid4-title-color-small-laptop': responsiveMainTitleColor?.smallLaptop,
            '--infogrid4-title-color-desktop': responsiveMainTitleColor?.desktop,
            '--infogrid4-title-color-big-desktop': responsiveMainTitleColor?.bigDesktop,

            // Item title typography
            '--infogrid4-item-title-font-size-mobile': responsiveItemTitleFontSize?.mobile,
            '--infogrid4-item-title-font-size-tablet': responsiveItemTitleFontSize?.tablet,
            '--infogrid4-item-title-font-size-small-laptop': responsiveItemTitleFontSize?.smallLaptop,
            '--infogrid4-item-title-font-size-desktop': responsiveItemTitleFontSize?.desktop,
            '--infogrid4-item-title-font-size-big-desktop': responsiveItemTitleFontSize?.bigDesktop,
            '--infogrid4-item-title-font-weight-mobile': responsiveItemTitleFontWeight?.mobile,
            '--infogrid4-item-title-font-weight-tablet': responsiveItemTitleFontWeight?.tablet,
            '--infogrid4-item-title-font-weight-small-laptop': responsiveItemTitleFontWeight?.smallLaptop,
            '--infogrid4-item-title-font-weight-desktop': responsiveItemTitleFontWeight?.desktop,
            '--infogrid4-item-title-font-weight-big-desktop': responsiveItemTitleFontWeight?.bigDesktop,
            '--infogrid4-item-title-line-height-mobile': responsiveItemTitleLineHeight?.mobile,
            '--infogrid4-item-title-line-height-tablet': responsiveItemTitleLineHeight?.tablet,
            '--infogrid4-item-title-line-height-small-laptop': responsiveItemTitleLineHeight?.smallLaptop,
            '--infogrid4-item-title-line-height-desktop': responsiveItemTitleLineHeight?.desktop,
            '--infogrid4-item-title-line-height-big-desktop': responsiveItemTitleLineHeight?.bigDesktop,
            '--infogrid4-item-title-color-mobile': responsiveItemTitleColor?.mobile,
            '--infogrid4-item-title-color-tablet': responsiveItemTitleColor?.tablet,
            '--infogrid4-item-title-color-small-laptop': responsiveItemTitleColor?.smallLaptop,
            '--infogrid4-item-title-color-desktop': responsiveItemTitleColor?.desktop,
            '--infogrid4-item-title-color-big-desktop': responsiveItemTitleColor?.bigDesktop,

            // Item description typography
            '--infogrid4-item-text-font-size-mobile': responsiveItemDescriptionFontSize?.mobile,
            '--infogrid4-item-text-font-size-tablet': responsiveItemDescriptionFontSize?.tablet,
            '--infogrid4-item-text-font-size-small-laptop': responsiveItemDescriptionFontSize?.smallLaptop,
            '--infogrid4-item-text-font-size-desktop': responsiveItemDescriptionFontSize?.desktop,
            '--infogrid4-item-text-font-size-big-desktop': responsiveItemDescriptionFontSize?.bigDesktop,
            '--infogrid4-item-text-font-weight-mobile': responsiveItemDescriptionFontWeight?.mobile,
            '--infogrid4-item-text-font-weight-tablet': responsiveItemDescriptionFontWeight?.tablet,
            '--infogrid4-item-text-font-weight-small-laptop': responsiveItemDescriptionFontWeight?.smallLaptop,
            '--infogrid4-item-text-font-weight-desktop': responsiveItemDescriptionFontWeight?.desktop,
            '--infogrid4-item-text-font-weight-big-desktop': responsiveItemDescriptionFontWeight?.bigDesktop,
            '--infogrid4-item-text-line-height-mobile': responsiveItemDescriptionLineHeight?.mobile,
            '--infogrid4-item-text-line-height-tablet': responsiveItemDescriptionLineHeight?.tablet,
            '--infogrid4-item-text-line-height-small-laptop': responsiveItemDescriptionLineHeight?.smallLaptop,
            '--infogrid4-item-text-line-height-desktop': responsiveItemDescriptionLineHeight?.desktop,
            '--infogrid4-item-text-line-height-big-desktop': responsiveItemDescriptionLineHeight?.bigDesktop,
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

    const renderResponsiveControls = (label, attr, asBox = false) => {
        // This function is deprecated in favor of inline controls using the global deviceType
        // But we might need similar logic for the SVG controls if we keep them separate.
        // For now, I'll inline the logic where needed to match infogrid-3 pattern.
        return null;
    };

    return (
        <>
            <InspectorControls>
                <div className="adaire-device-toggle">
                    <p className="adaire-device-toggle-label">{__('Device View', 'adaire-blocks-dev2')}</p>
                    <div className="adaire-device-toggle-group">
                        {BREAKPOINTS.map((bp) => (
                            <Button
                                key={bp.name}
                                isPrimary={deviceType === bp.name}
                                onClick={() => setDeviceType(bp.name)}
                                icon={bp.icon}
                            >
                                <span>{bp.label}</span>
                            </Button>
                        ))}
                    </div>
                    <p className="adaire-device-toggle-status">
                        {__('Configuring:', 'adaire-blocks-dev2')} <strong>{BREAKPOINTS.find(b => b.name === deviceType).label}</strong>
                    </p>
                </div>

                <PanelBody title={__('Content', 'adaire-blocks-dev2')} initialOpen={true}>
                    <TextControl
                        label={__('Main Title', 'adaire-blocks-dev2')}
                        value={mainTitle}
                        onChange={(value) => setAttributes({ mainTitle: value })}
                    />
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className="adaire-bento-card-fields"
                            style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '12px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong>{__('Card', 'adaire-blocks-dev2')} {index + 1}</strong>
                                <Button
                                    icon="trash"
                                    label={__('Remove Card', 'adaire-blocks-dev2')}
                                    isDestructive
                                    isSmall
                                    disabled={cards.length <= 1}
                                    onClick={() => removeCard(index)}
                                />
                            </div>
                            <TextareaControl
                                label={__('Title', 'adaire-blocks-dev2')}
                                value={card.title}
                                onChange={(value) => updateCard(index, 'title', value)}
                            />
                            <TextareaControl
                                label={__('Description', 'adaire-blocks-dev2')}
                                value={card.description}
                                onChange={(value) => updateCard(index, 'description', value)}
                            />
                        </div>
                    ))}
                    <Button variant="secondary" icon="plus" onClick={addCard} style={{ marginTop: '8px' }}>
                        {__('Add Card', 'adaire-blocks-dev2')}
                    </Button>
                </PanelBody>

                <PanelColorSettings
                    title={__('Colors', 'adaire-blocks-dev2')}
                    initialOpen={false}
                    colorSettings={[
                        {
                            value: backgroundColor,
                            onChange: (value) => setAttributes({ backgroundColor: value }),
                            label: __('Background', 'adaire-blocks-dev2'),
                        },
                        {
                            value: cardBackgroundColor,
                            onChange: (value) => setAttributes({ cardBackgroundColor: value }),
                            label: __('Card Background', 'adaire-blocks-dev2'),
                        },
                        {
                            value: gridBorderColor,
                            onChange: (value) => setAttributes({ gridBorderColor: value }),
                            label: __('Grid Border', 'adaire-blocks-dev2'),
                        }
                    ].filter(Boolean)}
                />

                <PanelBody title={__('Layout Settings', 'adaire-blocks-dev2')} initialOpen={false}>
                    <p>{__('Grid Layout', 'adaire-blocks-dev2')}</p>
                    <div className="adaire-bento-preset-grid" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                        {BENTO_LAYOUTS.map((layout) => (
                            <Button
                                key={layout.id}
                                className={`adaire-bento-preset-btn ${bentoLayout === layout.id ? 'is-active' : ''}`}
                                isPrimary={bentoLayout === layout.id}
                                onClick={() => selectBentoLayout(layout.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start', height: 'auto', padding: '6px 8px' }}
                            >
                                <BentoPresetIcon columns={layout.columns} rows={layout.rows} cells={layout.cells} />
                                <span style={{ textAlign: 'left' }}>
                                    <span style={{ display: 'block', fontWeight: 600 }}>{layout.label}</span>
                                    <span style={{ display: 'block', fontSize: '11px', opacity: 0.75 }}>{layout.bestFor}</span>
                                </span>
                            </Button>
                        ))}
                    </div>
                    <p>{__('Container Width', 'adaire-blocks-dev2')}</p>
                    <ButtonGroup style={{ marginBottom: '16px' }}>
                        {CONTAINER_MODES.map((mode) => (
                            <Button
                                key={mode.value}
                                isPrimary={containerMode === mode.value}
                                onClick={() => setAttributes({ containerMode: mode.value })}
                            >
                                {mode.label}
                            </Button>
                        ))}
                    </ButtonGroup>

                    <div className="adaire-infogrid-4__dimension-control" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong>{__('Max Width', 'adaire-blocks-dev2')}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                {(() => {
                                    const currentValObj = responsiveMaxWidth?.[deviceType] || {};
                                    // Handle legacy string format or missing object
                                    const unit = currentValObj.unit ?? (typeof currentValObj === 'string' && currentValObj.includes('%') ? '%' : 'px');
                                    const rawValue = currentValObj.value ?? (typeof currentValObj === 'string' ? parseInt(currentValObj) : (unit === '%' ? 100 : 1400));

                                    const min = unit === 'px' ? 200 : 10;
                                    const max = unit === 'px' ? 10000 : 100;

                                    return (
                                        <RangeControl
                                            value={rawValue}
                                            onChange={(newValue) => updateContainerDimension(deviceType, 'value', newValue)}
                                            min={min}
                                            max={max}
                                            step={unit === 'px' ? 10 : 1}
                                            withInputField={true}
                                        />
                                    );
                                })()}
                            </div>
                            <ButtonGroup>
                                {UNIT_OPTIONS.map((u) => (
                                    <Button
                                        key={u}
                                        isSmall
                                        isPrimary={(responsiveMaxWidth?.[deviceType]?.unit || 'px') === u}
                                        onClick={() => updateContainerDimension(deviceType, 'unit', u)}
                                    >
                                        {u}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </div>
                    </div>

                    <BoxControl
                        label={__('Padding (Outer)', 'adaire-blocks-dev2')}
                        values={attributes.responsivePadding?.[deviceType] || {}}
                        onChange={(value) => updateResponsive('responsivePadding', deviceType, value)}
                    />

                    <BoxControl
                        label={__('Card Padding', 'adaire-blocks-dev2')}
                        values={attributes.responsiveCardPadding?.[deviceType] || {}}
                        onChange={(value) => updateResponsive('responsiveCardPadding', deviceType, value)}
                    />

                    <RangeControl
                        label={__('Card Border Radius', 'adaire-blocks-dev2')}
                        value={cardBorderRadius}
                        onChange={(value) => setAttributes({ cardBorderRadius: value })}
                        min={0}
                        max={40}
                    />
                    <RangeControl
                        label={__('Grid Border Width', 'adaire-blocks-dev2')}
                        value={gridBorderWidth}
                        onChange={(value) => setAttributes({ gridBorderWidth: value })}
                        min={0}
                        max={4}
                    />
                    <RangeControl
                        label={__('Grid Gap', 'adaire-blocks-dev2')}
                        value={gridGap}
                        onChange={(value) => setAttributes({ gridGap: value })}
                        min={0}
                        max={64}
                    />
                    <ToggleControl
                        label={__('Card Shadow', 'adaire-blocks-dev2')}
                        checked={cardShadow}
                        onChange={(value) => setAttributes({ cardShadow: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Typography Settings', 'adaire-blocks-dev2')} initialOpen={false}>
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Main Title', 'adaire-blocks-dev2')}
                        fontSizeAttr="responsiveMainTitleFontSize"
                        fontWeightAttr="responsiveMainTitleFontWeight"
                        lineHeightAttr="responsiveMainTitleLineHeight"
                        colorAttr="responsiveMainTitleColor"
                    />
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Item Title', 'adaire-blocks-dev2')}
                        fontSizeAttr="responsiveItemTitleFontSize"
                        fontWeightAttr="responsiveItemTitleFontWeight"
                        lineHeightAttr="responsiveItemTitleLineHeight"
                        colorAttr="responsiveItemTitleColor"
                    />
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Item Description', 'adaire-blocks-dev2')}
                        fontSizeAttr="responsiveItemDescriptionFontSize"
                        fontWeightAttr="responsiveItemDescriptionFontWeight"
                        lineHeightAttr="responsiveItemDescriptionLineHeight"
                        colorAttr="responsiveItemDescriptionColor"
                    />
                </PanelBody>

                <PanelBody title={__('Background SVG Icon', 'adaire-blocks-dev2')} initialOpen={false}>
                    <SelectControl
                        label={__('Enable Icon', 'adaire-blocks-dev2')}
                        value={showSvgIcon ? 'yes' : 'no'}
                        options={[
                            { label: __('No', 'adaire-blocks-dev2'), value: 'no' },
                            { label: __('Yes', 'adaire-blocks-dev2'), value: 'yes' },
                        ]}
                        onChange={(value) => setAttributes({ showSvgIcon: value === 'yes' })}
                    />
                    {showSvgIcon && (
                        <>
                            <TextareaControl
                                label={__('SVG Markup', 'adaire-blocks-dev2')}
                                help={__('Paste inline SVG. Use currentColor for fills/strokes to inherit the configured color.', 'adaire-blocks-dev2')}
                                rows={6}
                                value={svgIconCode}
                                onChange={(value) => setAttributes({ svgIconCode: value })}
                            />
                            <SelectControl
                                label={__('Horizontal Position', 'adaire-blocks-dev2')}
                                value={svgIconPosition}
                                options={[
                                    { label: __('Left', 'adaire-blocks-dev2'), value: 'left' },
                                    { label: __('Right', 'adaire-blocks-dev2'), value: 'right' },
                                ]}
                                onChange={(value) => setAttributes({ svgIconPosition: value })}
                            />
                            <SelectControl
                                label={__('Vertical Position', 'adaire-blocks-dev2')}
                                value={svgIconVerticalPosition}
                                options={[
                                    { label: __('Top', 'adaire-blocks-dev2'), value: 'top' },
                                    { label: __('Bottom', 'adaire-blocks-dev2'), value: 'bottom' },
                                ]}
                                onChange={(value) => setAttributes({ svgIconVerticalPosition: value })}
                            />

                            {/* Responsive SVG Controls using global deviceType */}
                            <UnitControl
                                label={__('SVG Width', 'adaire-blocks-dev2')}
                                value={responsiveSvgIconWidth?.[deviceType]}
                                onChange={(value) => updateResponsive('responsiveSvgIconWidth', deviceType, value)}
                            />
                            <UnitControl
                                label={__('SVG Vertical Offset', 'adaire-blocks-dev2')}
                                value={responsiveSvgIconVerticalOffset?.[deviceType]}
                                onChange={(value) => updateResponsive('responsiveSvgIconVerticalOffset', deviceType, value)}
                            />
                            <UnitControl
                                label={__('SVG Horizontal Offset', 'adaire-blocks-dev2')}
                                value={responsiveSvgIconHorizontalOffset?.[deviceType]}
                                onChange={(value) => updateResponsive('responsiveSvgIconHorizontalOffset', deviceType, value)}
                            />
                        </>
                    )}
                </PanelBody>
            </InspectorControls>

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
                        <RichText
                            tagName="h2"
                            className="adaire-infogrid-4__title"
                            value={mainTitle}
                            onChange={(value) => setAttributes({ mainTitle: value })}
                            placeholder={__('Add main titleâ€¦', 'adaire-blocks-dev2')}
                        />
                    </div>

                    <div className="adaire-infogrid-4__grid" data-layout={bentoLayout || 'symmetrical'}>
                        {cards.map((card, index) => (
                            <div key={index} className={`adaire-infogrid-4__item adaire-infogrid-4__item--${index + 1}`}>
                                <RichText
                                    tagName="h3"
                                    className="adaire-infogrid-4__item-title"
                                    value={card.title}
                                    onChange={(value) => updateCard(index, 'title', value)}
                                />
                                <RichText
                                    tagName="p"
                                    className="adaire-infogrid-4__item-text"
                                    value={card.description}
                                    onChange={(value) => updateCard(index, 'description', value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Edit;


