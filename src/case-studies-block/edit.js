import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    PanelColorSettings
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    TextareaControl,
    Button,
    ButtonGroup,
    RangeControl,
    SelectControl,
    ToggleControl,
    BaseControl,
    __experimentalNumberControl as NumberControl
} from '@wordpress/components';
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';
import { arrowUp, arrowDown } from '@wordpress/icons';

import './editor.scss';

const CONTAINER_MODES = [
    { label: __('Full Width', 'adaire-blocks'), value: 'full' },
    { label: __('Constrained', 'adaire-blocks'), value: 'constrained' }
];

const DEVICE_TYPES = [
    { key: 'bigDesktop', label: __('Big Desktop', 'adaire-blocks') },
    { key: 'desktop', label: __('Desktop', 'adaire-blocks') },
    { key: 'smallLaptop', label: __('Small Laptop', 'adaire-blocks') },
    { key: 'tablet', label: __('Tablet', 'adaire-blocks') },
    { key: 'mobile', label: __('Mobile', 'adaire-blocks') }
];

const UNIT_OPTIONS = ['px', '%', 'rem', 'vw'];

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
    const value = dimension?.value ?? fallbackValue;
    const unit = dimension?.unit ?? fallbackUnit;
    return `${value}${unit}`;
};

export default function Edit({ attributes, setAttributes, clientId }) {
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
        dragCursorBgColor
    } = attributes;

    const [expandedStudy, setExpandedStudy] = useState(null);
    const [newIndustryInput, setNewIndustryInput] = useState('');
    const [newCapabilityInputs, setNewCapabilityInputs] = useState({});

    // Generate block ID on mount
    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: `case-studies-${clientId}` });
        }
    }, [clientId, blockId, setAttributes]);

    // Get unique industries from ALL case studies (for suggestions)
    const industries = useMemo(() => {
        const allIndustries = caseStudies
            .map(study => study.industry)
            .filter(industry => industry && industry.trim() !== '');
        return [...new Set(allIndustries)].sort();
    }, [caseStudies]);

    // Get unique capabilities from ALL case studies (for suggestions)
    const capabilities = useMemo(() => {
        const allCapabilities = caseStudies
            .flatMap(study => study.capabilities || [])
            .filter(cap => cap && cap.trim() !== '');
        return [...new Set(allCapabilities)].sort();
    }, [caseStudies]);

    // Get capability input value for a specific study
    const getCapabilityInput = useCallback((index) => {
        return newCapabilityInputs[index] || '';
    }, [newCapabilityInputs]);

    // Set capability input value for a specific study
    const setCapabilityInput = useCallback((index, value) => {
        setNewCapabilityInputs(prev => ({ ...prev, [index]: value }));
    }, []);

    // Update container max width dimension
    const updateContainerDimension = (device, property, value) => {
        const next = {
            ...containerMaxWidth,
            [device]: {
                ...containerMaxWidth?.[device],
                [property]: value
            }
        };
        setAttributes({ containerMaxWidth: next });
    };

    // Update responsive dimension (for card height, font sizes, etc.)
    const updateResponsiveDimension = (attrName, device, property, value) => {
        const current = attributes[attrName] || {};
        const next = {
            ...current,
            [device]: {
                ...current[device],
                [property]: value
            }
        };
        setAttributes({ [attrName]: next });
    };

    const blockProps = useBlockProps({
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
        }
    });

    const containerClasses = [
        'ad-case-studies__container',
        containerMode === 'constrained' ? 'is-constrained' : ''
    ].filter(Boolean).join(' ');

    const updateCaseStudy = (index, field, value) => {
        const newStudies = [...caseStudies];
        newStudies[index] = { ...newStudies[index], [field]: value };
        setAttributes({ caseStudies: newStudies });
    };

    const addCaseStudy = () => {
        const maxId = caseStudies.length > 0 
            ? Math.max(...caseStudies.map(study => study.id)) 
            : 0;
        const newStudy = {
            id: maxId + 1,
            title: `New Case Study ${maxId + 1}`,
            description: 'Add your case study description here...',
            backgroundImage: '',
            backgroundImageId: 0,
            linkUrl: '',
            openInNewTab: true,
            industry: '',
            capabilities: []
        };
        setAttributes({ caseStudies: [...caseStudies, newStudy] });
    };

    const removeCaseStudy = (index) => {
        const newStudies = caseStudies.filter((_, i) => i !== index);
        setAttributes({ caseStudies: newStudies });
    };

    const duplicateCaseStudy = (index) => {
        const maxId = Math.max(...caseStudies.map(study => study.id));
        const studyToDuplicate = { ...caseStudies[index], id: maxId + 1 };
        const newStudies = [...caseStudies];
        newStudies.splice(index + 1, 0, studyToDuplicate);
        setAttributes({ caseStudies: newStudies });
    };

    const moveCaseStudyUp = (index) => {
        if (index === 0) return;
        const newStudies = [...caseStudies];
        [newStudies[index - 1], newStudies[index]] = [newStudies[index], newStudies[index - 1]];
        setAttributes({ caseStudies: newStudies });
    };

    const moveCaseStudyDown = (index) => {
        if (index === caseStudies.length - 1) return;
        const newStudies = [...caseStudies];
        [newStudies[index], newStudies[index + 1]] = [newStudies[index + 1], newStudies[index]];
        setAttributes({ caseStudies: newStudies });
    };

    const onSelectImage = (index, media) => {
        if (media && media.id) {
            updateCaseStudy(index, 'backgroundImageId', media.id);
            if (media.url) {
                updateCaseStudy(index, 'backgroundImage', media.url);
            }
        }
    };

    const removeImage = (index) => {
        updateCaseStudy(index, 'backgroundImage', '');
        updateCaseStudy(index, 'backgroundImageId', 0);
    };

    const addCapability = (index, capability) => {
        if (!capability || !capability.trim()) return;
        const currentCapabilities = caseStudies[index].capabilities || [];
        if (!currentCapabilities.includes(capability.trim())) {
            updateCaseStudy(index, 'capabilities', [...currentCapabilities, capability.trim()]);
        }
    };

    const removeCapability = (index, capability) => {
        const currentCapabilities = caseStudies[index].capabilities || [];
        updateCaseStudy(index, 'capabilities', currentCapabilities.filter(c => c !== capability));
    };

    const easeOptions = [
        { label: 'Power2 InOut', value: 'power2.inOut' },
        { label: 'Power2 Out', value: 'power2.out' },
        { label: 'Power3 InOut', value: 'power3.inOut' },
        { label: 'Back Out', value: 'back.out(1.7)' },
        { label: 'Elastic Out', value: 'elastic.out(1, 0.3)' },
        { label: 'Circ InOut', value: 'circ.inOut' }
    ];

    const fontWeightOptions = [
        { label: 'Light (300)', value: '300' },
        { label: 'Normal (400)', value: '400' },
        { label: 'Medium (500)', value: '500' },
        { label: 'Semi-Bold (600)', value: '600' },
        { label: 'Bold (700)', value: '700' }
    ];

    // Get industries used by OTHER case studies (for suggestions)
    const getIndustrySuggestions = useCallback((currentIndex) => {
        return industries.filter(ind => ind !== caseStudies[currentIndex]?.industry);
    }, [industries, caseStudies]);

    // Get capabilities used by OTHER case studies that aren't already on this one
    const getCapabilitySuggestions = useCallback((currentIndex) => {
        const currentCaps = caseStudies[currentIndex]?.capabilities || [];
        return capabilities.filter(cap => !currentCaps.includes(cap));
    }, [capabilities, caseStudies]);

    // Add a new industry (from text input)
    const handleAddIndustry = useCallback((index, value) => {
        if (value && value.trim()) {
            updateCaseStudy(index, 'industry', value.trim());
        }
    }, []);

    // Add a new capability (from text input)
    const handleAddCapability = useCallback((index) => {
        const value = getCapabilityInput(index);
        if (value && value.trim()) {
            addCapability(index, value.trim());
            setCapabilityInput(index, '');
        }
    }, [getCapabilityInput, setCapabilityInput]);

    return (
        <>
            <InspectorControls>
                {/* Layout Settings */}
                <PanelBody title={__('Layout Settings', 'adaire-blocks')} initialOpen={true}>
                    <p style={{ marginBottom: '8px' }}>{__('Container Width', 'adaire-blocks')}</p>
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

                    {containerMode === 'constrained' && (
                        <div className="ad-case-studies__dimension-controls" style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
                            {DEVICE_TYPES.map((device) => (
                                <div
                                    key={device.key}
                                    style={{ marginBottom: '16px' }}
                                >
                                    <strong style={{ display: 'block', marginBottom: '8px' }}>{device.label}</strong>
                                    <div>
                                        {(() => {
                                            const defaultUnit = (device.key === 'tablet' || device.key === 'mobile') ? '%' : 'px';
                                            const unit = containerMaxWidth?.[device.key]?.unit ?? defaultUnit;
                                            const defaultPx = device.key === 'bigDesktop'
                                                ? 1400
                                                : device.key === 'desktop'
                                                    ? 1200
                                                    : device.key === 'smallLaptop'
                                                        ? 1200
                                                        : 600;
                                            const value = containerMaxWidth?.[device.key]?.value ?? (unit === 'px' ? defaultPx : 100);
                                            const min = unit === 'px' ? 200 : 10;
                                            const max = unit === 'px' ? 2400 : 100;

                                            return (
                                                <RangeControl
                                                    label={__('Max Width', 'adaire-blocks')}
                                                    value={value}
                                                    onChange={(rangeValue) => updateContainerDimension(device.key, 'value', rangeValue)}
                                                    min={min}
                                                    max={max}
                                                    step={unit === 'px' ? 10 : 1}
                                                />
                                            );
                                        })()}
                                        <ButtonGroup>
                                            {UNIT_OPTIONS.map((unit) => (
                                                <Button
                                                    key={unit}
                                                    isSmall
                                                    isPrimary={containerMaxWidth?.[device.key]?.unit === unit}
                                                    onClick={() => updateContainerDimension(device.key, 'unit', unit)}
                                                >
                                                    {unit}
                                                </Button>
                                            ))}
                                        </ButtonGroup>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <RangeControl
                        label={__('Desktop Columns', 'adaire-blocks')}
                        value={columns}
                        onChange={(value) => setAttributes({ columns: value })}
                        min={1}
                        max={6}
                    />
                    <RangeControl
                        label={__('Big Desktop Columns', 'adaire-blocks')}
                        value={columnsBigDesktop}
                        onChange={(value) => setAttributes({ columnsBigDesktop: value })}
                        min={1}
                        max={8}
                    />
                    <RangeControl
                        label={__('Small Laptop Columns', 'adaire-blocks')}
                        value={columnsSmallLaptop}
                        onChange={(value) => setAttributes({ columnsSmallLaptop: value })}
                        min={1}
                        max={6}
                    />
                    <RangeControl
                        label={__('Tablet Columns', 'adaire-blocks')}
                        value={columnsTablet}
                        onChange={(value) => setAttributes({ columnsTablet: value })}
                        min={1}
                        max={4}
                    />
                    <RangeControl
                        label={__('Mobile Columns', 'adaire-blocks')}
                        value={columnsMobile}
                        onChange={(value) => setAttributes({ columnsMobile: value })}
                        min={1}
                        max={2}
                    />
                    <RangeControl
                        label={__('Gap (px)', 'adaire-blocks')}
                        value={gap}
                        onChange={(value) => setAttributes({ gap: value })}
                        min={0}
                        max={60}
                    />
                </PanelBody>

                {/* Carousel Settings */}
                <PanelBody title={__('Carousel Settings', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl
                        label={__('Enable Draggable Carousel', 'adaire-blocks')}
                        checked={enableCarousel}
                        onChange={(value) => setAttributes({ enableCarousel: value })}
                        help={enableCarousel ? __('Cards will be displayed in a horizontal draggable carousel.', 'adaire-blocks') : __('Cards will be displayed in a grid layout.', 'adaire-blocks')}
                    />

                    {enableCarousel && (
                        <>
                            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                <strong style={{ display: 'block', marginBottom: '12px' }}>{__('Card Width', 'adaire-blocks')}</strong>
                                {DEVICE_TYPES.map((device) => (
                                    <div key={device.key} style={{ marginBottom: '16px' }}>
                                        <span style={{ fontSize: '12px', color: '#666' }}>{device.label}</span>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                            {(() => {
                                                const unit = carouselCardWidth?.[device.key]?.unit ?? 'px';
                                                const value = carouselCardWidth?.[device.key]?.value ?? (
                                                    device.key === 'bigDesktop'
                                                        ? 440
                                                        : device.key === 'desktop'
                                                            ? 400
                                                            : device.key === 'smallLaptop'
                                                                ? 360
                                                                : device.key === 'tablet'
                                                                    ? 320
                                                                    : 280
                                                );
                                                
                                                return (
                                                    <RangeControl
                                                        value={value}
                                                        onChange={(rangeValue) => updateResponsiveDimension('carouselCardWidth', device.key, 'value', rangeValue)}
                                                        min={150}
                                                        max={800}
                                                        step={10}
                                                        withInputField={true}
                                                        __nextHasNoMarginBottom
                                                    />
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px', marginTop: '20px' }}>
                                <strong style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>{__('Drag Cursor Indicator', 'adaire-blocks')}</strong>
                                
                                <TextControl
                                    label={__('Text', 'adaire-blocks')}
                                    value={dragCursorText}
                                    onChange={(value) => setAttributes({ dragCursorText: value })}
                                />

                                <RangeControl
                                    label={__('Circle Size (px)', 'adaire-blocks')}
                                    value={dragCursorSize}
                                    onChange={(value) => setAttributes({ dragCursorSize: value })}
                                    min={40}
                                    max={150}
                                />

                                <RangeControl
                                    label={__('Font Size (px)', 'adaire-blocks')}
                                    value={dragCursorFontSize}
                                    onChange={(value) => setAttributes({ dragCursorFontSize: value })}
                                    min={10}
                                    max={24}
                                />

                                <SelectControl
                                    label={__('Font Weight', 'adaire-blocks')}
                                    value={dragCursorFontWeight}
                                    options={fontWeightOptions}
                                    onChange={(value) => setAttributes({ dragCursorFontWeight: value })}
                                />

                                <SelectControl
                                    label={__('Text Case', 'adaire-blocks')}
                                    value={dragCursorTextTransform}
                                    options={[
                                        { label: __('None (Sentence case)', 'adaire-blocks'), value: 'none' },
                                        { label: __('Uppercase', 'adaire-blocks'), value: 'uppercase' },
                                        { label: __('Lowercase', 'adaire-blocks'), value: 'lowercase' },
                                        { label: __('Capitalize', 'adaire-blocks'), value: 'capitalize' }
                                    ]}
                                    onChange={(value) => setAttributes({ dragCursorTextTransform: value })}
                                />
                            </div>
                        </>
                    )}
                </PanelBody>

                {/* Card Settings */}
                <PanelBody title={__('Card Settings', 'adaire-blocks')} initialOpen={false}>
                    <div style={{ marginBottom: '20px' }}>
                        <strong style={{ display: 'block', marginBottom: '12px' }}>{__('Card Height', 'adaire-blocks')}</strong>
                        {DEVICE_TYPES.map((device) => (
                            <div key={device.key} style={{ marginBottom: '16px' }}>
                                <span style={{ fontSize: '12px', color: '#666' }}>{device.label}</span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                    {(() => {
                                        const unit = cardHeight?.[device.key]?.unit ?? 'px';
                                        const value = cardHeight?.[device.key]?.value ?? (
                                            device.key === 'bigDesktop'
                                                ? 340
                                                : device.key === 'desktop'
                                                    ? 320
                                                    : device.key === 'smallLaptop'
                                                        ? 300
                                                        : device.key === 'tablet'
                                                            ? 280
                                                            : 240
                                        );
                                        
                                        return (
                                            <>
                                                <RangeControl
                                                    value={value}
                                                    onChange={(rangeValue) => updateResponsiveDimension('cardHeight', device.key, 'value', rangeValue)}
                                                    min={100}
                                                    max={600}
                                                    step={10}
                                                    withInputField={true}
                                                    __nextHasNoMarginBottom
                                                />
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>

                    <RangeControl
                        label={__('Border Radius (px)', 'adaire-blocks')}
                        value={cardBorderRadius}
                        onChange={(value) => setAttributes({ cardBorderRadius: value })}
                        min={0}
                        max={48}
                    />

                    <RangeControl
                        label={__('Content Padding (px)', 'adaire-blocks')}
                        value={contentPadding}
                        onChange={(value) => setAttributes({ contentPadding: value })}
                        min={8}
                        max={60}
                    />

                    <SelectControl
                        label={__('Card Shadow', 'adaire-blocks')}
                        value={cardShadow}
                        options={[
                            { label: __('None', 'adaire-blocks'), value: 'none' },
                            { label: __('Small', 'adaire-blocks'), value: '0 2px 8px rgba(0, 0, 0, 0.1)' },
                            { label: __('Medium', 'adaire-blocks'), value: '0 4px 16px rgba(0, 0, 0, 0.12)' },
                            { label: __('Large', 'adaire-blocks'), value: '0 8px 32px rgba(0, 0, 0, 0.15)' },
                            { label: __('Extra Large', 'adaire-blocks'), value: '0 16px 48px rgba(0, 0, 0, 0.2)' }
                        ]}
                        onChange={(value) => setAttributes({ cardShadow: value })}
                    />

                    <SelectControl
                        label={__('Card Hover Shadow', 'adaire-blocks')}
                        value={cardHoverShadow}
                        options={[
                            { label: __('None', 'adaire-blocks'), value: 'none' },
                            { label: __('Small', 'adaire-blocks'), value: '0 4px 12px rgba(0, 0, 0, 0.1)' },
                            { label: __('Medium', 'adaire-blocks'), value: '0 10px 40px rgba(0, 0, 0, 0.15)' },
                            { label: __('Large', 'adaire-blocks'), value: '0 16px 48px rgba(0, 0, 0, 0.2)' },
                            { label: __('Extra Large', 'adaire-blocks'), value: '0 24px 64px rgba(0, 0, 0, 0.25)' }
                        ]}
                        onChange={(value) => setAttributes({ cardHoverShadow: value })}
                    />
                </PanelBody>

                {/* Filter Settings */}
                <PanelBody title={__('Filter Settings', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl
                        label={__('Show Filters', 'adaire-blocks')}
                        checked={showFilters}
                        onChange={(value) => setAttributes({ showFilters: value })}
                    />
                    {showFilters && (
                        <>
                            <TextControl
                                label={__('Industry Filter Label', 'adaire-blocks')}
                                value={industryFilterLabel}
                                onChange={(value) => setAttributes({ industryFilterLabel: value })}
                            />
                            <TextControl
                                label={__('Capability Filter Label', 'adaire-blocks')}
                                value={capabilityFilterLabel}
                                onChange={(value) => setAttributes({ capabilityFilterLabel: value })}
                            />
                            <RangeControl
                                label={__('Filter Label Font Size', 'adaire-blocks')}
                                value={filterLabelFontSize}
                                onChange={(value) => setAttributes({ filterLabelFontSize: value })}
                                min={10}
                                max={24}
                            />
                            <RangeControl
                                label={__('Filter Border Radius', 'adaire-blocks')}
                                value={filterBorderRadius}
                                onChange={(value) => setAttributes({ filterBorderRadius: value })}
                                min={0}
                                max={16}
                            />
                        </>
                    )}
                </PanelBody>

                {/* Load More Settings */}
                <PanelBody title={__('Load More Settings', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl
                        label={__('Show Load More Button', 'adaire-blocks')}
                        checked={showLoadMore}
                        onChange={(value) => setAttributes({ showLoadMore: value })}
                    />
                    {showLoadMore && (
                        <>
                            <TextControl
                                label={__('Button Text', 'adaire-blocks')}
                                value={loadMoreText}
                                onChange={(value) => setAttributes({ loadMoreText: value })}
                            />
                            <RangeControl
                                label={__('Initial Items to Show', 'adaire-blocks')}
                                value={initialCount}
                                onChange={(value) => setAttributes({ initialCount: value })}
                                min={1}
                                max={24}
                            />
                            <RangeControl
                                label={__('Items to Load Per Click', 'adaire-blocks')}
                                value={loadMoreCount}
                                onChange={(value) => setAttributes({ loadMoreCount: value })}
                                min={1}
                                max={12}
                            />
                            <RangeControl
                                label={__('Button Font Size', 'adaire-blocks')}
                                value={loadMoreFontSize}
                                onChange={(value) => setAttributes({ loadMoreFontSize: value })}
                                min={12}
                                max={24}
                            />
                            <SelectControl
                                label={__('Button Font Weight', 'adaire-blocks')}
                                value={loadMoreFontWeight}
                                options={fontWeightOptions}
                                onChange={(value) => setAttributes({ loadMoreFontWeight: value })}
                            />
                        </>
                    )}
                </PanelBody>

                {/* Card Typography */}
                <PanelBody title={__('Card Typography', 'adaire-blocks')} initialOpen={false}>
                    {/* Title Typography */}
                    <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
                        <strong style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>{__('Title', 'adaire-blocks')}</strong>
                        
                        <p style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>{__('Font Size', 'adaire-blocks')}</p>
                        {DEVICE_TYPES.map((device) => (
                            <div key={device.key} style={{ marginBottom: '12px' }}>
                                <span style={{ fontSize: '11px', color: '#888' }}>{device.label}</span>
                                {(() => {
                                    const value = titleFontSize?.[device.key]?.value ?? (
                                        device.key === 'bigDesktop'
                                            ? 22
                                            : device.key === 'desktop'
                                                ? 20
                                                : device.key === 'smallLaptop'
                                                    ? 19
                                                    : device.key === 'tablet'
                                                        ? 18
                                                        : 16
                                    );
                                    return (
                                        <RangeControl
                                            value={value}
                                            onChange={(rangeValue) => updateResponsiveDimension('titleFontSize', device.key, 'value', rangeValue)}
                                            min={12}
                                            max={48}
                                            __nextHasNoMarginBottom
                                        />
                                    );
                                })()}
                            </div>
                        ))}

                        <SelectControl
                            label={__('Font Weight', 'adaire-blocks')}
                            value={titleFontWeight}
                            options={fontWeightOptions}
                            onChange={(value) => setAttributes({ titleFontWeight: value })}
                        />

                        <RangeControl
                            label={__('Line Height', 'adaire-blocks')}
                            value={titleLineHeight}
                            onChange={(value) => setAttributes({ titleLineHeight: value })}
                            min={1}
                            max={2.5}
                            step={0.1}
                        />

                        <RangeControl
                            label={__('Letter Spacing (px)', 'adaire-blocks')}
                            value={titleLetterSpacing}
                            onChange={(value) => setAttributes({ titleLetterSpacing: value })}
                            min={-2}
                            max={10}
                            step={0.5}
                        />
                    </div>

                    {/* Description Typography */}
                    <div>
                        <strong style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>{__('Description', 'adaire-blocks')}</strong>
                        
                        <p style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>{__('Font Size', 'adaire-blocks')}</p>
                        {DEVICE_TYPES.map((device) => (
                            <div key={device.key} style={{ marginBottom: '12px' }}>
                                <span style={{ fontSize: '11px', color: '#888' }}>{device.label}</span>
                                {(() => {
                                    const value = descriptionFontSize?.[device.key]?.value ?? (
                                        device.key === 'bigDesktop'
                                            ? 14
                                            : device.key === 'desktop'
                                                ? 14
                                                : device.key === 'smallLaptop'
                                                    ? 13
                                                    : device.key === 'tablet'
                                                        ? 13
                                                        : 12
                                    );
                                    return (
                                        <RangeControl
                                            value={value}
                                            onChange={(rangeValue) => updateResponsiveDimension('descriptionFontSize', device.key, 'value', rangeValue)}
                                            min={10}
                                            max={24}
                                            __nextHasNoMarginBottom
                                        />
                                    );
                                })()}
                            </div>
                        ))}

                        <SelectControl
                            label={__('Font Weight', 'adaire-blocks')}
                            value={descriptionFontWeight}
                            options={fontWeightOptions}
                            onChange={(value) => setAttributes({ descriptionFontWeight: value })}
                        />

                        <RangeControl
                            label={__('Line Height', 'adaire-blocks')}
                            value={descriptionLineHeight}
                            onChange={(value) => setAttributes({ descriptionLineHeight: value })}
                            min={1}
                            max={2.5}
                            step={0.1}
                        />

                        <RangeControl
                            label={__('Letter Spacing (px)', 'adaire-blocks')}
                            value={descriptionLetterSpacing}
                            onChange={(value) => setAttributes({ descriptionLetterSpacing: value })}
                            min={-1}
                            max={5}
                            step={0.25}
                        />

                        <RangeControl
                            label={__('Max Lines', 'adaire-blocks')}
                            value={descriptionMaxLines}
                            onChange={(value) => setAttributes({ descriptionMaxLines: value })}
                            min={1}
                            max={10}
                            help={__('Number of lines before text is truncated', 'adaire-blocks')}
                        />
                    </div>
                </PanelBody>

                {/* Color Settings */}
                <PanelColorSettings
                    title={__('Color Settings', 'adaire-blocks')}
                    initialOpen={false}
                    colorSettings={[
                        {
                            label: __('Card Background (fallback)', 'adaire-blocks'),
                            value: cardBackgroundColor,
                            onChange: (value) => setAttributes({ cardBackgroundColor: value })
                        },
                        {
                            label: __('Card Overlay Color', 'adaire-blocks'),
                            value: overlayColor,
                            onChange: (value) => setAttributes({ overlayColor: value })
                        },
                        {
                            label: __('Card Overlay Hover Color', 'adaire-blocks'),
                            value: overlayHoverColor,
                            onChange: (value) => setAttributes({ overlayHoverColor: value })
                        },
                        {
                            label: __('Title Color', 'adaire-blocks'),
                            value: titleColor,
                            onChange: (value) => setAttributes({ titleColor: value })
                        },
                        {
                            label: __('Description Color', 'adaire-blocks'),
                            value: descriptionColor,
                            onChange: (value) => setAttributes({ descriptionColor: value })
                        },
                        {
                            label: __('Filter Label Color', 'adaire-blocks'),
                            value: filterLabelColor,
                            onChange: (value) => setAttributes({ filterLabelColor: value })
                        },
                        {
                            label: __('Filter Border Color', 'adaire-blocks'),
                            value: filterBorderColor,
                            onChange: (value) => setAttributes({ filterBorderColor: value })
                        },
                        {
                            label: __('Filter Background Color', 'adaire-blocks'),
                            value: filterBackgroundColor,
                            onChange: (value) => setAttributes({ filterBackgroundColor: value })
                        },
                        {
                            label: __('Load More Button Color', 'adaire-blocks'),
                            value: loadMoreButtonColor,
                            onChange: (value) => setAttributes({ loadMoreButtonColor: value })
                        },
                        {
                            label: __('Load More Hover Color', 'adaire-blocks'),
                            value: loadMoreButtonHoverColor,
                            onChange: (value) => setAttributes({ loadMoreButtonHoverColor: value })
                        },
                        ...(enableCarousel ? [
                            {
                                label: __('Drag Cursor Background', 'adaire-blocks'),
                                value: dragCursorBgColor,
                                onChange: (value) => setAttributes({ dragCursorBgColor: value })
                            },
                            {
                                label: __('Drag Cursor Text Color', 'adaire-blocks'),
                                value: dragCursorColor,
                                onChange: (value) => setAttributes({ dragCursorColor: value })
                            }
                        ] : [])
                    ]}
                />

                {/* Animation Settings */}
                <PanelBody title={__('Animation Settings', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl
                        label={__('FLIP Animation Duration (s)', 'adaire-blocks')}
                        value={animationDuration}
                        onChange={(value) => setAttributes({ animationDuration: value })}
                        min={0.2}
                        max={2}
                        step={0.1}
                    />
                    <SelectControl
                        label={__('Animation Ease', 'adaire-blocks')}
                        value={animationEase}
                        options={easeOptions}
                        onChange={(value) => setAttributes({ animationEase: value })}
                    />
                    <RangeControl
                        label={__('Hover Scale', 'adaire-blocks')}
                        value={hoverScale}
                        onChange={(value) => setAttributes({ hoverScale: value })}
                        min={1}
                        max={1.2}
                        step={0.01}
                    />
                    <RangeControl
                        label={__('Hover Transition Duration (s)', 'adaire-blocks')}
                        value={hoverTransitionDuration}
                        onChange={(value) => setAttributes({ hoverTransitionDuration: value })}
                        min={0.1}
                        max={1}
                        step={0.05}
                    />
                </PanelBody>

                {/* Case Studies Management */}
                <PanelBody title={__('Case Studies', 'adaire-blocks')} initialOpen={false}>
                    <div style={{ marginBottom: '15px' }}>
                        <Button variant="primary" onClick={addCaseStudy}>
                            {__('+ Add Case Study', 'adaire-blocks')}
                        </Button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                        {__('Total:', 'adaire-blocks')} {caseStudies.length} {__('case studies', 'adaire-blocks')}
                    </div>

                    {caseStudies.map((study, index) => (
                        <div
                            key={study.id}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                overflow: 'hidden'
                            }}
                        >
                            <div
                                style={{
                                    padding: '12px',
                                    backgroundColor: '#f7f7f7',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <div
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        flex: 1
                                    }}
                                    onClick={() => setExpandedStudy(expandedStudy === index ? null : index)}
                                >
                                    <span style={{ fontWeight: 500 }}>
                                        {index + 1}. {study.title || 'Untitled'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    <Button
                                        icon={arrowUp}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moveCaseStudyUp(index);
                                        }}
                                        isSmall
                                        disabled={index === 0}
                                        label={__('Move Up', 'adaire-blocks')}
                                    />
                                    <Button
                                        icon={arrowDown}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moveCaseStudyDown(index);
                                        }}
                                        isSmall
                                        disabled={index === caseStudies.length - 1}
                                        label={__('Move Down', 'adaire-blocks')}
                                    />
                                    <span
                                        style={{
                                            cursor: 'pointer',
                                            padding: '4px',
                                            fontSize: '12px',
                                            color: '#666'
                                        }}
                                        onClick={() => setExpandedStudy(expandedStudy === index ? null : index)}
                                    >
                                        {expandedStudy === index ? 'â–¼' : 'â–¶'}
                                    </span>
                                </div>
                            </div>

                            {expandedStudy === index && (
                                <div style={{ padding: '15px' }}>
                                    {/* Background Image */}
                                    <BaseControl label={__('Background Image', 'adaire-blocks')}>
                                        <MediaUploadCheck>
                                            <MediaUpload
                                                onSelect={(media) => onSelectImage(index, media)}
                                                allowedTypes={['image']}
                                                value={study.backgroundImageId}
                                                render={({ open }) => (
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                        {study.backgroundImage ? (
                                                            <>
                                                                <img
                                                                    src={study.backgroundImage}
                                                                    alt=""
                                                                    style={{
                                                                        width: '100px',
                                                                        height: '60px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '4px'
                                                                    }}
                                                                />
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                    <Button variant="secondary" onClick={open}>
                                                                        {__('Change', 'adaire-blocks')}
                                                                    </Button>
                                                                    <Button variant="secondary" isDestructive onClick={() => removeImage(index)}>
                                                                        {__('Remove', 'adaire-blocks')}
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <Button variant="secondary" onClick={open}>
                                                                {__('Select Image', 'adaire-blocks')}
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                        </MediaUploadCheck>
                                    </BaseControl>

                                    <TextControl
                                        label={__('Title', 'adaire-blocks')}
                                        value={study.title}
                                        onChange={(value) => updateCaseStudy(index, 'title', value)}
                                    />

                                    <TextareaControl
                                        label={__('Description', 'adaire-blocks')}
                                        value={study.description}
                                        onChange={(value) => updateCaseStudy(index, 'description', value)}
                                        rows={3}
                                    />

                                    <TextControl
                                        label={__('Link URL', 'adaire-blocks')}
                                        value={study.linkUrl}
                                        onChange={(value) => updateCaseStudy(index, 'linkUrl', value)}
                                        placeholder="https://..."
                                    />

                                    <ToggleControl
                                        label={__('Open in New Tab', 'adaire-blocks')}
                                        checked={study.openInNewTab}
                                        onChange={(value) => updateCaseStudy(index, 'openInNewTab', value)}
                                    />

                                    {/* Industry Selection */}
                                    <BaseControl label={__('Industry', 'adaire-blocks')}>
                                        {/* Current industry display */}
                                        {study.industry && (
                                            <div style={{ marginBottom: '10px' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '6px 12px',
                                                        backgroundColor: '#10b981',
                                                        color: 'white',
                                                        borderRadius: '16px',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {study.industry}
                                                    <button
                                                        onClick={() => updateCaseStudy(index, 'industry', '')}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'white',
                                                            cursor: 'pointer',
                                                            fontSize: '16px',
                                                            padding: 0,
                                                            lineHeight: 1
                                                        }}
                                                        title={__('Remove industry', 'adaire-blocks')}
                                                    >
                                                        Ã—
                                                    </button>
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Industry input */}
                                        <TextControl
                                            placeholder={__('Type industry name...', 'adaire-blocks')}
                                            value={study.industry || ''}
                                            onChange={(value) => updateCaseStudy(index, 'industry', value)}
                                        />
                                        
                                        {/* Suggestions from other case studies */}
                                        {getIndustrySuggestions(index).length > 0 && (
                                            <div style={{ marginTop: '8px' }}>
                                                <p style={{ fontSize: '11px', color: '#666', marginBottom: '6px', marginTop: 0 }}>
                                                    {__('Use existing:', 'adaire-blocks')}
                                                </p>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {getIndustrySuggestions(index).map(ind => (
                                                        <Button
                                                            key={ind}
                                                            variant="secondary"
                                                            isSmall
                                                            onClick={() => updateCaseStudy(index, 'industry', ind)}
                                                        >
                                                            {ind}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </BaseControl>

                                    {/* Capabilities */}
                                    <BaseControl label={__('Capabilities', 'adaire-blocks')}>
                                        {/* Current capabilities display */}
                                        {(study.capabilities || []).length > 0 && (
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                                {(study.capabilities || []).map((cap, capIndex) => (
                                                    <span
                                                        key={capIndex}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '6px 12px',
                                                            backgroundColor: '#7c3aed',
                                                            color: 'white',
                                                            borderRadius: '16px',
                                                            fontSize: '13px',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        {cap}
                                                        <button
                                                            onClick={() => removeCapability(index, cap)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: 'white',
                                                                cursor: 'pointer',
                                                                fontSize: '16px',
                                                                padding: 0,
                                                                lineHeight: 1
                                                            }}
                                                            title={__('Remove capability', 'adaire-blocks')}
                                                        >
                                                            Ã—
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Add new capability input */}
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                            <TextControl
                                                placeholder={__('Type capability name...', 'adaire-blocks')}
                                                value={getCapabilityInput(index)}
                                                onChange={(value) => setCapabilityInput(index, value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddCapability(index);
                                                    }
                                                }}
                                                style={{ flex: 1 }}
                                            />
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleAddCapability(index)}
                                                disabled={!getCapabilityInput(index)?.trim()}
                                            >
                                                {__('Add', 'adaire-blocks')}
                                            </Button>
                                        </div>
                                        
                                        {/* Suggestions from other case studies */}
                                        {getCapabilitySuggestions(index).length > 0 && (
                                            <div>
                                                <p style={{ fontSize: '11px', color: '#666', marginBottom: '6px', marginTop: 0 }}>
                                                    {__('Use existing:', 'adaire-blocks')}
                                                </p>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {getCapabilitySuggestions(index).map(cap => (
                                                        <Button
                                                            key={cap}
                                                            variant="secondary"
                                                            isSmall
                                                            onClick={() => addCapability(index, cap)}
                                                        >
                                                            + {cap}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </BaseControl>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                                        <Button variant="secondary" onClick={() => duplicateCaseStudy(index)}>
                                            {__('Duplicate', 'adaire-blocks')}
                                        </Button>
                                        <Button variant="secondary" isDestructive onClick={() => removeCaseStudy(index)}>
                                            {__('Delete', 'adaire-blocks')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div className={containerClasses}>
                    {/* Filter Section */}
                    {showFilters && (
                        <div className="ad-case-studies__filters">
                            <div className="ad-case-studies__filter-group">
                                <select className="ad-case-studies__filter-select" disabled>
                                    <option value="">{industryFilterLabel}</option>
                                    <option value="">{__('All Industries', 'adaire-blocks')}</option>
                                    {industries.map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>
                                <svg className="ad-case-studies__filter-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="ad-case-studies__filter-group">
                                <select className="ad-case-studies__filter-select" disabled>
                                    <option value="">{capabilityFilterLabel}</option>
                                    <option value="">{__('All Capabilities', 'adaire-blocks')}</option>
                                    {capabilities.map(cap => (
                                        <option key={cap} value={cap}>{cap}</option>
                                    ))}
                                </select>
                                <svg className="ad-case-studies__filter-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Case Studies Grid / Carousel */}
                    <div className={`ad-case-studies__grid${enableCarousel ? ' ad-case-studies__carousel' : ''}`}>
                        {(enableCarousel ? caseStudies : caseStudies.slice(0, initialCount)).map((study, index) => (
                            <div
                                key={study.id}
                                className="ad-case-studies__card"
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
                                {!study.backgroundImage && (
                                    <div className="ad-case-studies__card-placeholder">
                                        <span>{__('Click to add image', 'adaire-blocks')}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Load More Button (hidden in carousel mode) */}
                    {!enableCarousel && showLoadMore && caseStudies.length > initialCount && (
                        <div className="ad-case-studies__load-more-wrapper">
                            <button className="ad-case-studies__load-more-btn" disabled>
                                {loadMoreText}
                            </button>
                        </div>
                    )}

                    {/* Helper text */}
                    {caseStudies.length === 0 && (
                        <div className="ad-case-studies__empty">
                            <p>{__('No case studies yet. Add one from the sidebar.', 'adaire-blocks')}</p>
                            <Button variant="primary" onClick={addCaseStudy}>
                                {__('+ Add Case Study', 'adaire-blocks')}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Drag Cursor Preview (Editor only) */}
                {enableCarousel && (
                    <div className="ad-case-studies__drag-cursor-preview">
                        <span>{dragCursorText}</span>
                    </div>
                )}
            </div>
        </>
    );
}



