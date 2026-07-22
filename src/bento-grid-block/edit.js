import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    PanelColorSettings,
    RichText,
    MediaUpload,
    MediaUploadCheck,
} from '@wordpress/block-editor';
import {
    PanelBody,
    BaseControl,
    TextControl,
    TextareaControl,
    RangeControl,
    SelectControl,
    ToggleControl,
    Button,
    ButtonGroup,
    GradientPicker,
    __experimentalUnitControl as UnitControl,
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { useState, useEffect, useCallback, useRef } from '@wordpress/element';
import { BENTO_LAYOUTS, getBentoLayout, makeDefaultCard } from './bento-layouts';
import BentoPresetIcon from './BentoPresetIcon';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher, { THREE_TIERS } from '../components/DeviceSwitcher';
import BoundColorPalette from '../components/BoundColorPalette';

// Helper components moved outside Edit to prevent focus loss
const TypographySection = ({ attributes, updateResponsiveAttribute, deviceType, label, fontSizeAttr, fontWeightAttr, lineHeightAttr, colorAttr }) => (
    <div className="adaire-typography-section" style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
        <p className="adaire-typography-section-name" style={{ fontWeight: 600, marginBottom: '12px' }}>{label}</p>
        <UnitControl
            label={__('Font Size', 'adaire-blocks')}
            value={attributes[fontSizeAttr][deviceType]}
            onChange={(val) => updateResponsiveAttribute(fontSizeAttr, deviceType, val)}
        />
        {fontWeightAttr && (
            <SelectControl
                label={__('Font Weight', 'adaire-blocks')}
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
                label={__('Line Height', 'adaire-blocks')}
                value={attributes[lineHeightAttr][deviceType]}
                onChange={(val) => updateResponsiveAttribute(lineHeightAttr, deviceType, val)}
            />
        )}
        <PanelColorSettings
            title={__('Color', 'adaire-blocks')}
            initialOpen={false}
            colorSettings={[
                {
                    value: attributes[colorAttr][deviceType],
                    onChange: (val) => updateResponsiveAttribute(colorAttr, deviceType, val),
                    label: __('Text Color', 'adaire-blocks'),
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
    const [expandedCard, setExpandedCard] = useState(null);

    const CONTAINER_MODES = [
        { label: __('Full Width', 'adaire-blocks'), value: 'full' },
        { label: __('Constrained', 'adaire-blocks'), value: 'constrained' },
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

    const updateCardFields = (index, patch) => {
        const next = cards.map((card, i) => (i === index ? { ...card, ...patch } : card));
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
            // Renamed from --infogrid4-grid-border-color: WordPress core's
            // global styles add a blanket `[style*=border-color] { border-style:
            // solid }` rule that does a plain substring match on the whole
            // style attribute text — it was matching this custom property's
            // NAME (not a real border-color declaration) and forcing an
            // unwanted solid border onto the block wrapper itself.
            '--infogrid4-grid-line-color': gridBorderColor,
            '--infogrid4-grid-border-thickness': `${gridBorderWidth}px`,
            '--infogrid4-grid-gap': `${gridGap}px`,
            // Title typography
            '--infogrid4-title-font-size-mobile': responsiveMainTitleFontSize?.mobile,
            '--infogrid4-title-font-size-tablet': responsiveMainTitleFontSize?.tablet,
            '--infogrid4-title-font-size-desktop': responsiveMainTitleFontSize?.desktop,
            '--infogrid4-title-font-weight-mobile': responsiveMainTitleFontWeight?.mobile,
            '--infogrid4-title-font-weight-tablet': responsiveMainTitleFontWeight?.tablet,
            '--infogrid4-title-font-weight-desktop': responsiveMainTitleFontWeight?.desktop,
            '--infogrid4-title-line-height-mobile': responsiveMainTitleLineHeight?.mobile,
            '--infogrid4-title-line-height-tablet': responsiveMainTitleLineHeight?.tablet,
            '--infogrid4-title-line-height-desktop': responsiveMainTitleLineHeight?.desktop,
            '--infogrid4-title-color-mobile': responsiveMainTitleColor?.mobile,
            '--infogrid4-title-color-tablet': responsiveMainTitleColor?.tablet,
            '--infogrid4-title-color-desktop': responsiveMainTitleColor?.desktop,

            // Item title typography
            '--infogrid4-item-title-font-size-mobile': responsiveItemTitleFontSize?.mobile,
            '--infogrid4-item-title-font-size-tablet': responsiveItemTitleFontSize?.tablet,
            '--infogrid4-item-title-font-size-desktop': responsiveItemTitleFontSize?.desktop,
            '--infogrid4-item-title-font-weight-mobile': responsiveItemTitleFontWeight?.mobile,
            '--infogrid4-item-title-font-weight-tablet': responsiveItemTitleFontWeight?.tablet,
            '--infogrid4-item-title-font-weight-desktop': responsiveItemTitleFontWeight?.desktop,
            '--infogrid4-item-title-line-height-mobile': responsiveItemTitleLineHeight?.mobile,
            '--infogrid4-item-title-line-height-tablet': responsiveItemTitleLineHeight?.tablet,
            '--infogrid4-item-title-line-height-desktop': responsiveItemTitleLineHeight?.desktop,
            '--infogrid4-item-title-color-mobile': responsiveItemTitleColor?.mobile,
            '--infogrid4-item-title-color-tablet': responsiveItemTitleColor?.tablet,
            '--infogrid4-item-title-color-desktop': responsiveItemTitleColor?.desktop,

            // Item description typography
            '--infogrid4-item-text-font-size-mobile': responsiveItemDescriptionFontSize?.mobile,
            '--infogrid4-item-text-font-size-tablet': responsiveItemDescriptionFontSize?.tablet,
            '--infogrid4-item-text-font-size-desktop': responsiveItemDescriptionFontSize?.desktop,
            '--infogrid4-item-text-font-weight-mobile': responsiveItemDescriptionFontWeight?.mobile,
            '--infogrid4-item-text-font-weight-tablet': responsiveItemDescriptionFontWeight?.tablet,
            '--infogrid4-item-text-font-weight-desktop': responsiveItemDescriptionFontWeight?.desktop,
            '--infogrid4-item-text-line-height-mobile': responsiveItemDescriptionLineHeight?.mobile,
            '--infogrid4-item-text-line-height-tablet': responsiveItemDescriptionLineHeight?.tablet,
            '--infogrid4-item-text-line-height-desktop': responsiveItemDescriptionLineHeight?.desktop,
            '--infogrid4-item-text-color-mobile': responsiveItemDescriptionColor?.mobile,
            '--infogrid4-item-text-color-tablet': responsiveItemDescriptionColor?.tablet,
            '--infogrid4-item-text-color-desktop': responsiveItemDescriptionColor?.desktop,

            // Container padding
            '--infogrid4-padding-top-mobile': responsivePadding?.mobile?.top || '40px',
            '--infogrid4-padding-right-mobile': responsivePadding?.mobile?.right || '20px',
            '--infogrid4-padding-bottom-mobile': responsivePadding?.mobile?.bottom || '40px',
            '--infogrid4-padding-left-mobile': responsivePadding?.mobile?.left || '20px',
            '--infogrid4-padding-top-tablet': responsivePadding?.tablet?.top || '60px',
            '--infogrid4-padding-right-tablet': responsivePadding?.tablet?.right || '40px',
            '--infogrid4-padding-bottom-tablet': responsivePadding?.tablet?.bottom || '60px',
            '--infogrid4-padding-left-tablet': responsivePadding?.tablet?.left || '40px',
            '--infogrid4-padding-top-desktop': responsivePadding?.desktop?.top || '100px',
            '--infogrid4-padding-right-desktop': responsivePadding?.desktop?.right || '80px',
            '--infogrid4-padding-bottom-desktop': responsivePadding?.desktop?.bottom || '100px',
            '--infogrid4-padding-left-desktop': responsivePadding?.desktop?.left || '80px',
            // Max width
            '--infogrid4-container-max-width-mobile': formatDimensionValue(responsiveMaxWidth?.mobile, 100, '%'),
            '--infogrid4-container-max-width-tablet': formatDimensionValue(responsiveMaxWidth?.tablet, 100, '%'),
            '--infogrid4-container-max-width-desktop': formatDimensionValue(responsiveMaxWidth?.desktop, 1400, 'px'),
            // Card padding
            '--infogrid4-card-padding-top-mobile': responsiveCardPadding?.mobile?.top || '30px',
            '--infogrid4-card-padding-right-mobile': responsiveCardPadding?.mobile?.right || '20px',
            '--infogrid4-card-padding-bottom-mobile': responsiveCardPadding?.mobile?.bottom || '30px',
            '--infogrid4-card-padding-left-mobile': responsiveCardPadding?.mobile?.left || '20px',
            '--infogrid4-card-padding-top-tablet': responsiveCardPadding?.tablet?.top || '40px',
            '--infogrid4-card-padding-right-tablet': responsiveCardPadding?.tablet?.right || '30px',
            '--infogrid4-card-padding-bottom-tablet': responsiveCardPadding?.tablet?.bottom || '40px',
            '--infogrid4-card-padding-left-tablet': responsiveCardPadding?.tablet?.left || '30px',
            '--infogrid4-card-padding-top-desktop': responsiveCardPadding?.desktop?.top || '60px',
            '--infogrid4-card-padding-right-desktop': responsiveCardPadding?.desktop?.right || '50px',
            '--infogrid4-card-padding-bottom-desktop': responsiveCardPadding?.desktop?.bottom || '60px',
            '--infogrid4-card-padding-left-desktop': responsiveCardPadding?.desktop?.left || '50px',
            // SVG icon
            '--infogrid4-svg-color': svgIconColor || '#d1d5db',
            '--infogrid4-svg-width-mobile': responsiveSvgIconWidth?.mobile || '0px',
            '--infogrid4-svg-width-tablet': responsiveSvgIconWidth?.tablet || '0px',
            '--infogrid4-svg-width-desktop': responsiveSvgIconWidth?.desktop || '500px',
            '--infogrid4-svg-transform-mobile': responsiveSvgIconTransform?.mobile || 'none',
            '--infogrid4-svg-transform-tablet': responsiveSvgIconTransform?.tablet || 'none',
            '--infogrid4-svg-transform-desktop': responsiveSvgIconTransform?.desktop || 'translateY(-50%)',
            '--infogrid4-svg-vertical-offset-mobile': responsiveSvgIconVerticalOffset?.mobile || '0px',
            '--infogrid4-svg-vertical-offset-tablet': responsiveSvgIconVerticalOffset?.tablet || '0px',
            '--infogrid4-svg-vertical-offset-desktop': responsiveSvgIconVerticalOffset?.desktop || '0px',
            '--infogrid4-svg-horizontal-offset-mobile': responsiveSvgIconHorizontalOffset?.mobile || '0px',
            '--infogrid4-svg-horizontal-offset-tablet': responsiveSvgIconHorizontalOffset?.tablet || '0px',
            '--infogrid4-svg-horizontal-offset-desktop': responsiveSvgIconHorizontalOffset?.desktop || '0px',
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
            <InspectorTabs attributes={attributes} setAttributes={setAttributes}>
                <PanelBody section="layout" title={__('Responsive Settings', 'adaire-blocks')} initialOpen={true}>
                    <DeviceSwitcher
                        deviceType={deviceType}
                        setDeviceType={setDeviceType}
                        label={__('Device Preview', 'adaire-blocks')}
                        tiers={THREE_TIERS}
                    />
                </PanelBody>

                <PanelBody section="content" title={__('Content', 'adaire-blocks')} initialOpen={true}>
                    <TextControl
                        label={__('Main Title', 'adaire-blocks')}
                        value={mainTitle}
                        onChange={(value) => setAttributes({ mainTitle: value })}
                    />
                    {cards.map((card, index) => {
                        const isExpanded = expandedCard === index;
                        return (
                            <div
                                key={index}
                                className="adaire-bento-card-fields"
                                style={{ border: '1px solid #ddd', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}
                            >
                                <div
                                    role="button"
                                    tabIndex={0}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: '#f7f7f7', cursor: 'pointer' }}
                                    onClick={() => setExpandedCard(isExpanded ? null : index)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setExpandedCard(isExpanded ? null : index);
                                        }
                                    }}
                                >
                                    <strong style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {index + 1}. {card.title || __('Untitled', 'adaire-blocks')}
                                    </strong>
                                    <Button
                                        icon="trash"
                                        label={__('Remove Card', 'adaire-blocks')}
                                        isDestructive
                                        isSmall
                                        disabled={cards.length <= 1}
                                        onClick={(e) => { e.stopPropagation(); removeCard(index); }}
                                    />
                                    <span aria-hidden="true" style={{ fontSize: '11px', color: '#666' }}>
                                        {isExpanded ? '▼' : '▶'}
                                    </span>
                                </div>

                                {isExpanded && (
                                    <div style={{ padding: '12px' }}>
                                        <TextareaControl
                                            label={__('Title', 'adaire-blocks')}
                                            value={card.title}
                                            onChange={(value) => updateCard(index, 'title', value)}
                                        />
                                        <TextareaControl
                                            label={__('Description', 'adaire-blocks')}
                                            value={card.description}
                                            onChange={(value) => updateCard(index, 'description', value)}
                                        />

                                        <BaseControl label={__('Card Background Image', 'adaire-blocks')} style={{ marginTop: '8px' }}>
                                            <MediaUploadCheck>
                                                <MediaUpload
                                                    onSelect={(media) => updateCardFields(index, {
                                                        backgroundImageId: media.id,
                                                        backgroundImageUrl: media.url,
                                                        backgroundImageAlt: media.alt || '',
                                                    })}
                                                    allowedTypes={['image']}
                                                    value={card.backgroundImageId}
                                                    render={({ open }) => (
                                                        <Button
                                                            onClick={open}
                                                            variant="secondary"
                                                            style={{ width: '100%', height: card.backgroundImageUrl ? '80px' : 'auto', padding: card.backgroundImageUrl ? 0 : undefined, overflow: 'hidden' }}
                                                        >
                                                            {card.backgroundImageUrl ? (
                                                                <img
                                                                    src={card.backgroundImageUrl}
                                                                    alt=""
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                __('Select Background Image', 'adaire-blocks')
                                                            )}
                                                        </Button>
                                                    )}
                                                />
                                            </MediaUploadCheck>
                                            {card.backgroundImageUrl && (
                                                <Button
                                                    onClick={() => updateCardFields(index, {
                                                        backgroundImageId: 0,
                                                        backgroundImageUrl: '',
                                                        backgroundImageAlt: '',
                                                    })}
                                                    isDestructive
                                                    isSmall
                                                    variant="link"
                                                >
                                                    {__('Remove Image', 'adaire-blocks')}
                                                </Button>
                                            )}
                                        </BaseControl>

                                        {card.backgroundImageUrl && (
                                            <>
                                                <SelectControl
                                                    label={__('Overlay', 'adaire-blocks')}
                                                    value={card.overlayType || 'none'}
                                                    options={[
                                                        { label: __('None', 'adaire-blocks'), value: 'none' },
                                                        { label: __('Solid Color', 'adaire-blocks'), value: 'solid' },
                                                        { label: __('Gradient', 'adaire-blocks'), value: 'gradient' },
                                                    ]}
                                                    onChange={(value) => updateCard(index, 'overlayType', value)}
                                                />
                                                {card.overlayType === 'solid' && (
                                                    <>
                                                        <BaseControl label={__('Overlay Color', 'adaire-blocks')}>
                                                            <BoundColorPalette
                                                                value={card.overlayColor}
                                                                onChange={(value) => updateCard(index, 'overlayColor', value || '#000000')}
                                                            />
                                                        </BaseControl>
                                                        <RangeControl
                                                            label={__('Overlay Opacity', 'adaire-blocks')}
                                                            value={card.overlayOpacity ?? 0.5}
                                                            onChange={(value) => updateCard(index, 'overlayOpacity', value)}
                                                            min={0}
                                                            max={1}
                                                            step={0.1}
                                                        />
                                                    </>
                                                )}
                                                {card.overlayType === 'gradient' && (
                                                    <>
                                                        <BaseControl label={__('Overlay Gradient', 'adaire-blocks')}>
                                                            <GradientPicker
                                                                value={card.overlayGradient || undefined}
                                                                onChange={(value) => updateCard(index, 'overlayGradient', value || '')}
                                                            />
                                                        </BaseControl>
                                                        <RangeControl
                                                            label={__('Overlay Opacity', 'adaire-blocks')}
                                                            value={card.overlayOpacity ?? 0.5}
                                                            onChange={(value) => updateCard(index, 'overlayOpacity', value)}
                                                            min={0}
                                                            max={1}
                                                            step={0.1}
                                                        />
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <Button variant="secondary" icon="plus" onClick={addCard} style={{ marginTop: '8px' }}>
                        {__('Add Card', 'adaire-blocks')}
                    </Button>
                </PanelBody>

                <PanelBody section="layout" title={__('Layout Settings', 'adaire-blocks')} initialOpen={false}>
                    <p>{__('Grid Layout', 'adaire-blocks')}</p>
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
                    <p>{__('Container Width', 'adaire-blocks')}</p>
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
                            <strong>{__('Max Width', 'adaire-blocks')}</strong>
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
                </PanelBody>

                <PanelColorSettings
                    section="style"
                    priority="high"
                    title={__('Colors', 'adaire-blocks')}
                    initialOpen={false}
                    colorSettings={[
                        {
                            value: backgroundColor,
                            onChange: (value) => setAttributes({ backgroundColor: value }),
                            label: __('Background', 'adaire-blocks'),
                        },
                        {
                            value: cardBackgroundColor,
                            onChange: (value) => setAttributes({ cardBackgroundColor: value }),
                            label: __('Card Background', 'adaire-blocks'),
                        },
                        {
                            value: gridBorderColor,
                            onChange: (value) => setAttributes({ gridBorderColor: value }),
                            label: __('Grid Border', 'adaire-blocks'),
                        }
                    ].filter(Boolean)}
                />

                <PanelBody section="style" priority="high" title={__('Card & Border Style', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl
                        label={__('Card Border Radius', 'adaire-blocks')}
                        value={cardBorderRadius}
                        onChange={(value) => setAttributes({ cardBorderRadius: value })}
                        min={0}
                        max={40}
                    />
                    <RangeControl
                        label={__('Grid Border Width', 'adaire-blocks')}
                        value={gridBorderWidth}
                        onChange={(value) => setAttributes({ gridBorderWidth: value })}
                        min={0}
                        max={4}
                    />
                    <ToggleControl
                        label={__('Card Shadow', 'adaire-blocks')}
                        checked={cardShadow}
                        onChange={(value) => setAttributes({ cardShadow: value })}
                    />
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Spacing', 'adaire-blocks')} initialOpen={false}>
                    <BoxControl
                        label={__('Padding (Outer)', 'adaire-blocks')}
                        values={attributes.responsivePadding?.[deviceType] || {}}
                        onChange={(value) => updateResponsive('responsivePadding', deviceType, value)}
                    />

                    <BoxControl
                        label={__('Card Padding', 'adaire-blocks')}
                        values={attributes.responsiveCardPadding?.[deviceType] || {}}
                        onChange={(value) => updateResponsive('responsiveCardPadding', deviceType, value)}
                    />

                    <RangeControl
                        label={__('Grid Gap', 'adaire-blocks')}
                        value={gridGap}
                        onChange={(value) => setAttributes({ gridGap: value })}
                        min={0}
                        max={64}
                    />
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Typography Settings', 'adaire-blocks')} initialOpen={false}>
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Main Title', 'adaire-blocks')}
                        fontSizeAttr="responsiveMainTitleFontSize"
                        fontWeightAttr="responsiveMainTitleFontWeight"
                        lineHeightAttr="responsiveMainTitleLineHeight"
                        colorAttr="responsiveMainTitleColor"
                    />
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Item Title', 'adaire-blocks')}
                        fontSizeAttr="responsiveItemTitleFontSize"
                        fontWeightAttr="responsiveItemTitleFontWeight"
                        lineHeightAttr="responsiveItemTitleLineHeight"
                        colorAttr="responsiveItemTitleColor"
                    />
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Item Description', 'adaire-blocks')}
                        fontSizeAttr="responsiveItemDescriptionFontSize"
                        fontWeightAttr="responsiveItemDescriptionFontWeight"
                        lineHeightAttr="responsiveItemDescriptionLineHeight"
                        colorAttr="responsiveItemDescriptionColor"
                    />
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Background SVG Icon', 'adaire-blocks')} initialOpen={false}>
                    <SelectControl
                        label={__('Enable Icon', 'adaire-blocks')}
                        value={showSvgIcon ? 'yes' : 'no'}
                        options={[
                            { label: __('No', 'adaire-blocks'), value: 'no' },
                            { label: __('Yes', 'adaire-blocks'), value: 'yes' },
                        ]}
                        onChange={(value) => setAttributes({ showSvgIcon: value === 'yes' })}
                    />
                    {showSvgIcon && (
                        <>
                            <TextareaControl
                                label={__('SVG Markup', 'adaire-blocks')}
                                help={__('Paste inline SVG. Use currentColor for fills/strokes to inherit the configured color.', 'adaire-blocks')}
                                rows={6}
                                value={svgIconCode}
                                onChange={(value) => setAttributes({ svgIconCode: value })}
                            />
                            <SelectControl
                                label={__('Horizontal Position', 'adaire-blocks')}
                                value={svgIconPosition}
                                options={[
                                    { label: __('Left', 'adaire-blocks'), value: 'left' },
                                    { label: __('Right', 'adaire-blocks'), value: 'right' },
                                ]}
                                onChange={(value) => setAttributes({ svgIconPosition: value })}
                            />
                            <SelectControl
                                label={__('Vertical Position', 'adaire-blocks')}
                                value={svgIconVerticalPosition}
                                options={[
                                    { label: __('Top', 'adaire-blocks'), value: 'top' },
                                    { label: __('Bottom', 'adaire-blocks'), value: 'bottom' },
                                ]}
                                onChange={(value) => setAttributes({ svgIconVerticalPosition: value })}
                            />

                            {/* Responsive SVG Controls using global deviceType */}
                            <UnitControl
                                label={__('SVG Width', 'adaire-blocks')}
                                value={responsiveSvgIconWidth?.[deviceType]}
                                onChange={(value) => updateResponsive('responsiveSvgIconWidth', deviceType, value)}
                            />
                            <UnitControl
                                label={__('SVG Vertical Offset', 'adaire-blocks')}
                                value={responsiveSvgIconVerticalOffset?.[deviceType]}
                                onChange={(value) => updateResponsive('responsiveSvgIconVerticalOffset', deviceType, value)}
                            />
                            <UnitControl
                                label={__('SVG Horizontal Offset', 'adaire-blocks')}
                                value={responsiveSvgIconHorizontalOffset?.[deviceType]}
                                onChange={(value) => updateResponsive('responsiveSvgIconHorizontalOffset', deviceType, value)}
                            />
                        </>
                    )}
                </PanelBody>
            </InspectorTabs>

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
                            placeholder={__('Add main title...', 'adaire-blocks')}
                        />
                    </div>

                    <div className="adaire-infogrid-4__grid" data-layout={bentoLayout || 'symmetrical'}>
                        {cards.map((card, index) => (
                            <div
                                key={index}
                                className={`adaire-infogrid-4__item adaire-infogrid-4__item--${index + 1}${card.backgroundImageUrl ? ' has-bg-image' : ''}`}
                                style={card.backgroundImageUrl ? { backgroundImage: `url(${card.backgroundImageUrl})` } : undefined}
                            >
                                {card.backgroundImageUrl && card.overlayType && card.overlayType !== 'none' && (
                                    <div
                                        className="adaire-infogrid-4__item-overlay"
                                        aria-hidden="true"
                                        style={
                                            card.overlayType === 'gradient'
                                                ? { backgroundImage: card.overlayGradient || undefined, opacity: card.overlayOpacity ?? 0.5 }
                                                : { backgroundColor: card.overlayColor || '#000000', opacity: card.overlayOpacity ?? 0.5 }
                                        }
                                    />
                                )}
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


