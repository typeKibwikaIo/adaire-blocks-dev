import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    PanelColorSettings,
    RichText,
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    Button,
    ButtonGroup,
    SelectControl,
    BaseControl,
    GradientPicker,
    RangeControl,
    ToggleControl,
    __experimentalUnitControl as UnitControl,
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { useState, useEffect, createElement, useMemo, useCallback, useRef } from '@wordpress/element';
import {
    desktop,
    tablet,
    mobile,
    alignLeft,
    alignCenter,
    alignRight,
} from '@wordpress/icons';

// Custom icons for small laptop and big desktop
const smallLaptopIcon = createElement('svg', {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
},
    createElement('path', {
        d: 'M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        fill: 'none'
    }),
    createElement('path', {
        d: 'M2 19H22',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        strokeLinecap: 'round'
    })
);

const bigDesktopIcon = createElement('svg', {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
},
    createElement('rect', {
        x: '3',
        y: '4',
        width: '18',
        height: '12',
        rx: '1',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        fill: 'none'
    }),
    createElement('path', {
        d: 'M8 20H16',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        strokeLinecap: 'round'
    }),
    createElement('rect', {
        x: '10',
        y: '20',
        width: '4',
        height: '2',
        rx: '0.5',
        fill: 'currentColor'
    })
);

const BREAKPOINTS = [
    { name: 'mobile', icon: mobile, label: __('Mobile', 'adaire-blocks') },
    { name: 'tablet', icon: tablet, label: __('Tablet', 'adaire-blocks') },
    { name: 'smallLaptop', icon: smallLaptopIcon, label: __('Small Laptop', 'adaire-blocks') },
    { name: 'desktop', icon: desktop, label: __('Desktop', 'adaire-blocks') },
    { name: 'bigDesktop', icon: bigDesktopIcon, label: __('Big Desktop', 'adaire-blocks') }
];

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
        mainHeading,
        mainDescription,
        cell1Title,
        cell1Content,
        cell2Title,
        cell2Content,
        cell3Title,
        cell3Content,
        sub1Title,
        sub1Content,
        sub2Title,
        sub2Content,
        sub3Title,
        sub3Content,
        showBackgroundImage,
        backgroundImageUrl,
        backgroundImageId,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat,
        overlayType,
        overlayColor,
        overlayOpacity,
        overlayGradient,
        responsiveWidth,
        responsiveMaxWidth,
        responsivePadding,
        responsiveGridBorderColor,
        responsiveGridThickness
    } = attributes;

    const [deviceType, setDeviceType] = useState('desktop');

    const CONTAINER_MODES = [
        { label: __('Full Width', 'adaire-blocks'), value: 'full' },
        { label: __('Constrained', 'adaire-blocks'), value: 'constrained' },
    ];

    const UNIT_OPTIONS = ['px', '%', 'rem', 'vw'];

    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: `infogrid-3-${clientId}` });
        }
    }, [clientId, blockId, setAttributes]);

    const attributesRef = useRef(attributes);
    useEffect(() => {
        attributesRef.current = attributes;
    }, [attributes]);

    const updateResponsiveAttribute = useCallback((attrName, device, value) => {
        setAttributes({
            [attrName]: {
                ...(attributesRef.current[attrName] || {}),
                [device]: value
            }
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
        // If it's still a string (old format), return it directly or parse it if needed
        if (typeof dimension === 'string') return dimension;

        const value = dimension?.value ?? fallbackValue;
        const unit = dimension?.unit ?? fallbackUnit;
        return `${value}${unit}`;
    };

    const generateVariables = () => {
        const vars = {
            '--infogrid-3-bg-image': showBackgroundImage && backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
            '--infogrid-3-overlay-bg-solid': overlayColor || 'rgba(31, 0, 87, 0.6)',
            '--infogrid-3-overlay-opacity': overlayOpacity !== undefined ? overlayOpacity : 0.6,
            '--infogrid-3-overlay-bg-gradient': overlayGradient || 'none',
            '--infogrid-3-bg-size': backgroundSize || 'cover',
            '--infogrid-3-bg-position': backgroundPosition || 'center',
            '--infogrid-3-bg-repeat': backgroundRepeat || 'no-repeat',
            '--infogrid-3-container-max-width': formatDimensionValue(responsiveMaxWidth?.desktop, 1200, 'px'),
            '--infogrid-3-container-max-width-tablet': formatDimensionValue(responsiveMaxWidth?.tablet, 100, '%'),
            '--infogrid-3-container-max-width-mobile': formatDimensionValue(responsiveMaxWidth?.mobile, 100, '%'),
            '--infogrid-3-container-max-width-small-laptop': formatDimensionValue(responsiveMaxWidth?.smallLaptop, 1200, 'px'),
            '--infogrid-3-container-max-width-big-desktop': formatDimensionValue(responsiveMaxWidth?.bigDesktop, 1200, 'px'),
        };

        const devices = {
            mobile: 'mobile',
            tablet: 'tablet',
            smallLaptop: 'small-laptop',
            desktop: 'desktop',
            bigDesktop: 'big-desktop'
        };

        Object.keys(attributes).forEach(key => {
            if (key.startsWith('responsive') && key !== 'responsiveMaxWidth' && typeof attributes[key] === 'object' && attributes[key] !== null) {
                const baseKey = key.replace('responsive', 'infogrid-3').replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

                Object.entries(devices).forEach(([deviceAttr, deviceClass]) => {
                    const val = attributes[key][deviceAttr];
                    if (val !== undefined && val !== null) {
                        if (typeof val === 'object' && !Array.isArray(val)) {
                            // Handle BoxControl objects (padding, etc.)
                            Object.entries(val).forEach(([side, sideVal]) => {
                                if (sideVal !== undefined && sideVal !== null) {
                                    vars[`--${baseKey}-${side}-${deviceClass}`] = sideVal;
                                }
                            });
                        } else {
                            vars[`--${baseKey}-${deviceClass}`] = val;
                        }
                    }
                });
            }
        });

        return vars;
    };

    const styleVariables = useMemo(() => generateVariables(), [attributes]);

    const blockProps = useBlockProps({
        className: `adaire-infogrid-3-container ${containerMode === 'constrained' ? 'is-constrained' : ''}`,
        style: styleVariables
    });

    return (
        <>
            <InspectorControls>
                <div className="adaire-device-toggle">
                    <p className="adaire-device-toggle-label">{__('Device View', 'adaire-blocks')}</p>
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
                        {__('Configuring:', 'adaire-blocks')} <strong>{BREAKPOINTS.find(b => b.name === deviceType).label}</strong>
                    </p>
                </div>

                <PanelBody title={__('Layout Settings', 'adaire-blocks')}>
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

                    <UnitControl
                        label={__('Block Width', 'adaire-blocks')}
                        value={responsiveWidth[deviceType]}
                        onChange={(val) => updateResponsiveAttribute('responsiveWidth', deviceType, val)}
                    />

                    {/* Max Width Controls using RangeControl + Unit Selection similar to content-toggle */}
                    <div className="adaire-infogrid-3__dimension-control" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong>{__('Max Width', 'adaire-blocks')}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                {(() => {
                                    const currentValObj = responsiveMaxWidth?.[deviceType] || {};
                                    // Handle legacy string format or missing object
                                    const unit = currentValObj.unit ?? (typeof currentValObj === 'string' && currentValObj.includes('%') ? '%' : 'px');
                                    const rawValue = currentValObj.value ?? (typeof currentValObj === 'string' ? parseInt(currentValObj) : (unit === '%' ? 100 : 1200));

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
                        label={__('Block Padding', 'adaire-blocks')}
                        values={responsivePadding[deviceType]}
                        onChange={(val) => updateResponsiveAttribute('responsivePadding', deviceType, val)}
                    />
                </PanelBody>

                <PanelBody title={__('Background & Overlay', 'adaire-blocks')}>
                    <ToggleControl
                        label={__('Show Background Image', 'adaire-blocks')}
                        checked={showBackgroundImage}
                        onChange={(val) => setAttributes({ showBackgroundImage: val })}
                    />
                    {showBackgroundImage && (
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={(media) => setAttributes({ backgroundImageId: media.id, backgroundImageUrl: media.url })}
                                allowedTypes={['image']}
                                value={backgroundImageId}
                                render={({ open }) => (
                                    <Button onClick={open} variant="secondary" style={{ width: '100%', marginBottom: '12px' }}>
                                        {backgroundImageUrl ? __('Replace Image', 'adaire-blocks') : __('Select Image', 'adaire-blocks')}
                                    </Button>
                                )}
                            />
                        </MediaUploadCheck>
                    )}

                    <SelectControl
                        label={__('Overlay Type', 'adaire-blocks')}
                        value={overlayType}
                        options={[
                            { label: __('None', 'adaire-blocks'), value: 'none' },
                            { label: __('Solid', 'adaire-blocks'), value: 'solid' },
                            { label: __('Gradient', 'adaire-blocks'), value: 'gradient' }
                        ]}
                        onChange={(val) => setAttributes({ overlayType: val })}
                    />

                    {overlayType === 'solid' && (
                        <>
                            <PanelColorSettings
                                title={__('Overlay Color', 'adaire-blocks')}
                                initialOpen={true}
                                colorSettings={[
                                    {
                                        value: overlayColor,
                                        onChange: (val) => setAttributes({ overlayColor: val }),
                                        label: __('Color', 'adaire-blocks'),
                                    }
                                ]}
                            />
                            <RangeControl
                                label={__('Overlay Opacity', 'adaire-blocks')}
                                value={overlayOpacity}
                                onChange={(val) => setAttributes({ overlayOpacity: val })}
                                min={0}
                                max={1}
                                step={0.1}
                            />
                        </>
                    )}

                    {overlayType === 'gradient' && (
                        <BaseControl label={__('Overlay Gradient', 'adaire-blocks')}>
                            <GradientPicker
                                value={overlayGradient}
                                onChange={(val) => setAttributes({ overlayGradient: val })}
                            />
                        </BaseControl>
                    )}
                </PanelBody>

                <PanelBody title={__('Grid Styles', 'adaire-blocks')} initialOpen={false}>
                    <UnitControl
                        label={__('Grid Border Width', 'adaire-blocks')}
                        value={responsiveGridThickness[deviceType]}
                        onChange={(val) => updateResponsiveAttribute('responsiveGridThickness', deviceType, val)}
                    />
                    <PanelColorSettings
                        title={__('Grid Border Color', 'adaire-blocks')}
                        initialOpen={false}
                        colorSettings={[
                            {
                                value: responsiveGridBorderColor[deviceType],
                                onChange: (val) => updateResponsiveAttribute('responsiveGridBorderColor', deviceType, val),
                                label: __('Border Color', 'adaire-blocks'),
                            }
                        ]}
                    />
                </PanelBody>

                <PanelBody title={__('Typography Settings', 'adaire-blocks')} initialOpen={false}>
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Main Heading', 'adaire-blocks')}
                        fontSizeAttr="responsiveMainHeadingFontSize"
                        fontWeightAttr="responsiveMainHeadingFontWeight"
                        lineHeightAttr="responsiveMainHeadingLineHeight"
                        colorAttr="responsiveMainHeadingColor"
                    />
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Main Description', 'adaire-blocks')}
                        fontSizeAttr="responsiveMainDescriptionFontSize"
                        lineHeightAttr="responsiveMainDescriptionLineHeight"
                        colorAttr="responsiveMainDescriptionColor"
                    />
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Cell Label', 'adaire-blocks')}
                        fontSizeAttr="responsiveCellLabelFontSize"
                        colorAttr="responsiveCellLabelColor"
                    />
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Cell Text', 'adaire-blocks')}
                        fontSizeAttr="responsiveCellTextFontSize"
                        colorAttr="responsiveCellTextColor"
                    />
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Sub-Column Label', 'adaire-blocks')}
                        fontSizeAttr="responsiveSubLabelFontSize"
                        colorAttr="responsiveSubLabelColor"
                    />
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Sub-Column Text', 'adaire-blocks')}
                        fontSizeAttr="responsiveSubTextFontSize"
                        colorAttr="responsiveSubTextColor"
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                {overlayType !== 'none' && (
                    <div className={`adaire-infogrid-3-overlay is-type-${overlayType}`} />
                )}
                <div className="adaire-infogrid-3-wrapper">
                    <div className="adaire-infogrid-3__header">
                        <RichText
                            tagName="h2"
                            className="adaire-infogrid-3__main-heading"
                            value={mainHeading}
                            onChange={(val) => setAttributes({ mainHeading: val })}
                            placeholder={__('Enter heading...', 'adaire-blocks')}
                        />
                        <RichText
                            tagName="p"
                            className="adaire-infogrid-3__main-description"
                            value={mainDescription}
                            onChange={(val) => setAttributes({ mainDescription: val })}
                            placeholder={__('Enter description...', 'adaire-blocks')}
                        />
                    </div>

                    <div className="adaire-infogrid-3__grid">
                        <div className="adaire-infogrid-3__cell adaire-infogrid-3__cell-1">
                            <RichText
                                tagName="div"
                                className="adaire-infogrid-3__cell-label"
                                value={cell1Title}
                                onChange={(val) => setAttributes({ cell1Title: val })}
                                placeholder={__('Label...', 'adaire-blocks')}
                            />
                            <RichText
                                tagName="div"
                                className="adaire-infogrid-3__cell-text"
                                value={cell1Content}
                                onChange={(val) => setAttributes({ cell1Content: val })}
                                placeholder={__('Content...', 'adaire-blocks')}
                            />
                        </div>
                        <div className="adaire-infogrid-3__cell adaire-infogrid-3__cell-2">
                            <RichText
                                tagName="div"
                                className="adaire-infogrid-3__cell-label"
                                value={cell2Title}
                                onChange={(val) => setAttributes({ cell2Title: val })}
                                placeholder={__('Label...', 'adaire-blocks')}
                            />
                            <RichText
                                tagName="div"
                                className="adaire-infogrid-3__cell-text"
                                value={cell2Content}
                                onChange={(val) => setAttributes({ cell2Content: val })}
                                placeholder={__('Content...', 'adaire-blocks')}
                            />
                        </div>
                        <div className="adaire-infogrid-3__cell adaire-infogrid-3__cell-3">
                            <RichText
                                tagName="div"
                                className="adaire-infogrid-3__cell-label"
                                value={cell3Title}
                                onChange={(val) => setAttributes({ cell3Title: val })}
                                placeholder={__('Label...', 'adaire-blocks')}
                            />
                            <RichText
                                tagName="div"
                                className="adaire-infogrid-3__cell-text"
                                value={cell3Content}
                                onChange={(val) => setAttributes({ cell3Content: val })}
                                placeholder={__('Content...', 'adaire-blocks')}
                            />
                        </div>
                        <div className="adaire-infogrid-3__cell adaire-infogrid-3__cell-4">
                            <div className="adaire-infogrid-3__sub-columns">
                                <div className="adaire-infogrid-3__sub-column adaire-infogrid-3__sub-column-1">
                                    <RichText
                                        tagName="div"
                                        className="adaire-infogrid-3__sub-label"
                                        value={sub1Title}
                                        onChange={(val) => setAttributes({ sub1Title: val })}
                                        placeholder={__('Label...', 'adaire-blocks')}
                                    />
                                    <RichText
                                        tagName="div"
                                        className="adaire-infogrid-3__sub-text"
                                        value={sub1Content}
                                        onChange={(val) => setAttributes({ sub1Content: val })}
                                        placeholder={__('Content...', 'adaire-blocks')}
                                    />
                                </div>
                                <div className="adaire-infogrid-3__sub-column adaire-infogrid-3__sub-column-2">
                                    <RichText
                                        tagName="div"
                                        className="adaire-infogrid-3__sub-label"
                                        value={sub2Title}
                                        onChange={(val) => setAttributes({ sub2Title: val })}
                                        placeholder={__('Label...', 'adaire-blocks')}
                                    />
                                    <RichText
                                        tagName="div"
                                        className="adaire-infogrid-3__sub-text"
                                        value={sub2Content}
                                        onChange={(val) => setAttributes({ sub2Content: val })}
                                        placeholder={__('Content...', 'adaire-blocks')}
                                    />
                                </div>
                                <div className="adaire-infogrid-3__sub-column adaire-infogrid-3__sub-column-3">
                                    <RichText
                                        tagName="div"
                                        className="adaire-infogrid-3__sub-label"
                                        value={sub3Title}
                                        onChange={(val) => setAttributes({ sub3Title: val })}
                                        placeholder={__('Label...', 'adaire-blocks')}
                                    />
                                    <RichText
                                        tagName="div"
                                        className="adaire-infogrid-3__sub-text"
                                        value={sub3Content}
                                        onChange={(val) => setAttributes({ sub3Content: val })}
                                        placeholder={__('Content...', 'adaire-blocks')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Edit;



