import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    useInnerBlocksProps,
    InnerBlocks,
} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    ButtonGroup,
    Button,
    RangeControl,
    __experimentalUnitControl as UnitControl,
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { useState, useEffect, useCallback, useRef } from '@wordpress/element';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { createBlock } from '@wordpress/blocks';
import { useDispatch } from '@wordpress/data';
import InspectorTabs from '../components/InspectorTabs';

const BREAKPOINTS = [
    { name: 'mobile', icon: mobile, label: __('Mobile', 'adaire-blocks-dev2') },
    { name: 'tablet', icon: tablet, label: __('Tablet', 'adaire-blocks-dev2') },
    { name: 'smallLaptop', icon: desktop, label: __('Small Laptop', 'adaire-blocks-dev2') },
    { name: 'desktop', icon: desktop, label: __('Desktop', 'adaire-blocks-dev2') },
    { name: 'bigDesktop', icon: desktop, label: __('Big Desktop', 'adaire-blocks-dev2') },
];

const Edit = ({ attributes, setAttributes, clientId }) => {
    const {
        blockId,
        cards, // Deprecated, used for migration
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

    const [deviceType, setDeviceType] = useState('desktop');
    const { replaceInnerBlocks } = useDispatch('core/block-editor');

    // Generate block ID
    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: `card-scroll-${clientId}` });
        }
    }, [blockId, clientId, setAttributes]);

    // MIGRATION LOGIC
    useEffect(() => {
        if (cards && cards.length > 0) {
            const innerBlocks = cards.map(card => createBlock('create-block/card-scroll-item-block', {
                title: card.title,
                description: card.description,
                mediaType: card.mediaType,
                mediaId: card.mediaId,
                mediaUrl: card.mediaUrl,
                backgroundColor: card.backgroundColor,
                headerTextColor: card.headerTextColor,
                textColor: card.textColor,
                shadowColor: card.shadowColor,
                shadowBlur: card.shadowBlur,
            }));

            replaceInnerBlocks(clientId, innerBlocks);
            setAttributes({ cards: [] });
        }
    }, [cards, clientId, replaceInnerBlocks, setAttributes]);

    // Responsive Handlers
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
        if (typeof dimension === 'string') return dimension;
        const value = dimension?.value ?? fallbackValue;
        const unit = dimension?.unit ?? fallbackUnit;
        return `${value}${unit}`;
    };

    // Reads the numeric portion out of a "NN%" string for the width drag
    // slider. Non-percent values (px/em/etc, set via the unit field below)
    // fall back to 100 so the handle still sits somewhere sensible —
    // dragging it always writes a fresh percent value.
    const parsePercent = (val, fallback = 100) => {
        if (typeof val !== 'string') return fallback;
        const match = val.match(/^(-?\d+(?:\.\d+)?)%$/);
        return match ? parseFloat(match[1]) : fallback;
    };

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

    const blockProps = useBlockProps({
        className: `adaire-card-scroll ${containerMode === 'constrained' ? 'is-constrained' : ''}`,
        style: {
            '--intro-height': introHeight,
            '--outro-height': outroHeight,
            // Don't force viewport - let CSS handle responsive behavior
            ...generateVars('mobile'),
            ...generateVars('tablet'),
            ...generateVars('smallLaptop'),
            ...generateVars('desktop'),
            ...generateVars('bigDesktop'),
        }
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-card-scroll__cards' },
        {
            allowedBlocks: ['create-block/card-scroll-item-block'],
            template: [['create-block/card-scroll-item-block', {}]],
            renderAppender: () => <InnerBlocks.ButtonBlockAppender />,
        }
    );

    return (
        <>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
                <div className="adaire-device-toggle" style={{ padding: '16px 16px 0', borderBottom: '1px solid #e0e0e0', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                    <ButtonGroup>
                        {BREAKPOINTS.map((bp) => (
                            <Button
                                key={bp.name}
                                isPrimary={deviceType === bp.name}
                                onClick={() => setDeviceType(bp.name)}
                                icon={bp.icon}
                                label={bp.label}
                                showTooltip
                            />
                        ))}
                    </ButtonGroup>
                </div>

                <PanelBody title={__('Layout Settings', 'adaire-blocks-dev2')}>
                    <SelectControl
                        label="Container Mode"
                        value={containerMode}
                        options={[
                            { label: 'Constrained', value: 'constrained' },
                            { label: 'Full Width', value: 'full' }
                        ]}
                        onChange={(val) => setAttributes({ containerMode: val })}
                    />
                    <UnitControl
                        label={`Max Width (${deviceType})`}
                        value={responsiveMaxWidth?.[deviceType]?.value ?? 1200}
                        unit={responsiveMaxWidth?.[deviceType]?.unit ?? 'px'}
                        onChange={(newVal) => {
                            // UnitControl passes just the numeric value as a string or number
                            const numericValue = typeof newVal === 'string' ? parseFloat(newVal) : newVal;
                            const currentUnit = responsiveMaxWidth?.[deviceType]?.unit || 'px';
                            
                            if (!isNaN(numericValue) && numericValue !== null && numericValue !== undefined) {
                                updateContainerDimension(deviceType, 'value', numericValue);
                            }
                        }}
                        onUnitChange={(newUnit) => {
                            updateContainerDimension(deviceType, 'unit', newUnit);
                        }}
                    />
                    <UnitControl
                        label="Intro Height"
                        value={introHeight}
                        onChange={(val) => setAttributes({ introHeight: val })}
                    />
                    <UnitControl
                        label="Outro Height"
                        value={outroHeight}
                        onChange={(val) => setAttributes({ outroHeight: val })}
                    />
                    <UnitControl
                        label={`Global Card Min Height (${deviceType})`}
                        value={responsiveCardMinHeight?.[deviceType]}
                        onChange={(val) => updateResponsive('responsiveCardMinHeight', deviceType, val)}
                    />
                    <RangeControl
                        label={__('Card Width — drag to resize', 'adaire-blocks-dev2')}
                        value={parsePercent(responsiveCardWidth?.[deviceType], 100)}
                        min={10}
                        max={100}
                        step={1}
                        onChange={(val) => updateResponsive('responsiveCardWidth', deviceType, `${val}%`)}
                    />
                    <UnitControl
                        label={`Card Width (${deviceType})`}
                        value={responsiveCardWidth?.[deviceType] || '100%'}
                        onChange={(val) => updateResponsive('responsiveCardWidth', deviceType, val)}
                        help={__('Width of each card relative to the slider container. 100% fills the available space; narrower values center the card automatically. Type an exact value in any unit instead of dragging.', 'adaire-blocks-dev2')}
                    />
                    <UnitControl
                        label={`Last Card Bottom Height (${deviceType})`}
                        value={responsiveLastCardBottomHeight?.[deviceType] || '0px'}
                        onChange={(val) => updateResponsive('responsiveLastCardBottomHeight', deviceType, val)}
                        help={__('Adds spacing at the bottom of the last card. This ensures the last card appears above other cards.', 'adaire-blocks-dev2')}
                    />
                </PanelBody>

                <PanelBody title={__('Spacing', 'adaire-blocks-dev2')} initialOpen={false}>
                    <BoxControl
                        label={__('Container Padding', 'adaire-blocks-dev2')}
                        values={responsivePadding?.[deviceType] || {}}
                        onChange={(value) => updateResponsive('responsivePadding', deviceType, value)}
                    />
                    <BoxControl
                        label={__('Card Padding', 'adaire-blocks-dev2')}
                        values={responsiveCardPadding?.[deviceType] || {}}
                        onChange={(value) => updateResponsive('responsiveCardPadding', deviceType, value)}
                    />
                </PanelBody>

                <PanelBody title={__('Global Media Dimensions', 'adaire-blocks-dev2')} initialOpen={false}>
                    <UnitControl
                        label={`Width (${deviceType})`}
                        value={responsiveImageDimensions?.[deviceType]?.width}
                        onChange={(val) => {
                            const next = { ...responsiveImageDimensions };
                            next[deviceType] = { ...next[deviceType], width: val };
                            setAttributes({ responsiveImageDimensions: next });
                        }}
                    />
                    <UnitControl
                        label={`Height (${deviceType})`}
                        value={responsiveImageDimensions?.[deviceType]?.height}
                        onChange={(val) => {
                            const next = { ...responsiveImageDimensions };
                            next[deviceType] = { ...next[deviceType], height: val };
                            setAttributes({ responsiveImageDimensions: next });
                        }}
                    />
                </PanelBody>

                <PanelBody title={__('Global Header Typography', 'adaire-blocks-dev2')}>
                    <UnitControl
                        label={`Font Size (${deviceType})`}
                        value={responsiveTitleFontSize?.[deviceType]}
                        onChange={(val) => updateResponsive('responsiveTitleFontSize', deviceType, val)}
                    />
                    <SelectControl
                        label={`Font Weight (${deviceType})`}
                        value={responsiveTitleFontWeight?.[deviceType]}
                        options={[
                            { label: '300', value: '300' },
                            { label: '400', value: '400' },
                            { label: '500', value: '500' },
                            { label: '600', value: '600' },
                            { label: '700', value: '700' },
                            { label: '800', value: '800' },
                        ]}
                        onChange={(val) => updateResponsive('responsiveTitleFontWeight', deviceType, val)}
                    />
                    <UnitControl
                        label={`Line Height (${deviceType})`}
                        value={responsiveTitleLineHeight?.[deviceType]}
                        onChange={(val) => updateResponsive('responsiveTitleLineHeight', deviceType, val)}
                    />
                </PanelBody>

                <PanelBody title={__('Global Description Typography', 'adaire-blocks-dev2')}>
                    <UnitControl
                        label={`Font Size (${deviceType})`}
                        value={responsiveDescriptionFontSize?.[deviceType]}
                        onChange={(val) => updateResponsive('responsiveDescriptionFontSize', deviceType, val)}
                    />
                    <SelectControl
                        label={`Font Weight (${deviceType})`}
                        value={responsiveDescriptionFontWeight?.[deviceType]}
                        options={[
                            { label: '300', value: '300' },
                            { label: '400', value: '400' },
                            { label: '500', value: '500' },
                            { label: '600', value: '600' },
                            { label: '700', value: '700' },
                            { label: '800', value: '800' },
                        ]}
                        onChange={(val) => updateResponsive('responsiveDescriptionFontWeight', deviceType, val)}
                    />
                    <UnitControl
                        label={`Line Height (${deviceType})`}
                        value={responsiveDescriptionLineHeight?.[deviceType]}
                        onChange={(val) => updateResponsive('responsiveDescriptionLineHeight', deviceType, val)}
                    />
                </PanelBody>
            </InspectorTabs>

            <div {...blockProps}>
                <div 
                    className={`adaire-card-scroll__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}
                >
                    <div className="adaire-card-scroll__intro" style={{ border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ opacity: 0.5 }}>Intro Spacer</p>
                    </div>

                    <div {...innerBlocksProps} />

                    <div className="adaire-card-scroll__outro" style={{ border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ opacity: 0.5 }}>Outro Spacer</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Edit;



