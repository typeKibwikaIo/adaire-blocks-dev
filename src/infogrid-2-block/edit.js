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
    TextareaControl,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    Flex,
    FlexItem,
    SelectControl,
    ToggleControl,
    BaseControl,
    ColorPalette,
    GradientPicker,
    RangeControl,
    __experimentalUnitControl as UnitControl,
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { useState, useEffect, createElement, useMemo, useCallback, useRef } from '@wordpress/element';
import {
    trash,
    plus,
    chevronUp,
    chevronDown,
    desktop,
    tablet,
    mobile,
    alignLeft,
    alignCenter,
    alignRight,
} from '@wordpress/icons';
import BootstrapIconPicker from '../icon-box-block/BootstrapIconPicker';

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
    { name: 'mobile', icon: mobile, label: __('Mobile', 'adaire-blocks-dev2') },
    { name: 'tablet', icon: tablet, label: __('Tablet', 'adaire-blocks-dev2') },
    { name: 'smallLaptop', icon: smallLaptopIcon, label: __('Small Laptop', 'adaire-blocks-dev2') },
    { name: 'desktop', icon: desktop, label: __('Desktop', 'adaire-blocks-dev2') },
    { name: 'bigDesktop', icon: bigDesktopIcon, label: __('Big Desktop', 'adaire-blocks-dev2') }
];

// Helper function to format dimension values
const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
    if (typeof dimension === 'string') return dimension;
    const value = dimension?.value ?? fallbackValue;
    const unit = dimension?.unit ?? fallbackUnit;
    return `${value}${unit}`;
};

// Helper components moved outside Edit to prevent focus loss during rerenders
const TypographySection = ({ attributes, updateResponsiveAttribute, deviceType, label, fontSizeAttr, fontWeightAttr, lineHeightAttr, letterSpacingAttr, textTransformAttr, colorAttr, marginAttr }) => (
    <div className="adaire-typography-section" style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
        <p className="adaire-typography-section-name" style={{ fontWeight: 600, marginBottom: '12px' }}>{label}</p>
        <UnitControl
            label={__('Font Size', 'adaire-blocks-dev2')}
            value={attributes[fontSizeAttr][deviceType]}
            onChange={(val) => updateResponsiveAttribute(fontSizeAttr, deviceType, val)}
        />
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
        <UnitControl
            label={__('Line Height', 'adaire-blocks-dev2')}
            value={attributes[lineHeightAttr][deviceType]}
            onChange={(val) => updateResponsiveAttribute(lineHeightAttr, deviceType, val)}
        />
        <UnitControl
            label={__('Letter Spacing', 'adaire-blocks-dev2')}
            value={attributes[letterSpacingAttr][deviceType]}
            onChange={(val) => updateResponsiveAttribute(letterSpacingAttr, deviceType, val)}
        />
        <SelectControl
            label={__('Text Transform', 'adaire-blocks-dev2')}
            value={attributes[textTransformAttr][deviceType]}
            options={[
                { label: __('None', 'adaire-blocks-dev2'), value: 'none' },
                { label: __('Uppercase', 'adaire-blocks-dev2'), value: 'uppercase' },
                { label: __('Lowercase', 'adaire-blocks-dev2'), value: 'lowercase' },
                { label: __('Capitalize', 'adaire-blocks-dev2'), value: 'capitalize' }
            ]}
            onChange={(val) => updateResponsiveAttribute(textTransformAttr, deviceType, val)}
        />
        <PanelColorSettings
            title={__('Text Color', 'adaire-blocks-dev2')}
            initialOpen={false}
            colorSettings={[
                {
                    value: attributes[colorAttr][deviceType],
                    onChange: (val) => updateResponsiveAttribute(colorAttr, deviceType, val),
                    label: __('Color', 'adaire-blocks-dev2'),
                }
            ]}
        />
        {marginAttr && (
            <UnitControl
                label={__('Margin Bottom', 'adaire-blocks-dev2')}
                value={attributes[marginAttr][deviceType]}
                onChange={(val) => updateResponsiveAttribute(marginAttr, deviceType, val)}
            />
        )}
    </div>
);

const Edit = ({ attributes, setAttributes, clientId }) => {
    const {
        blockId,
        items,
        backgroundImage,
        backgroundImageUrl,
        overlayType,
        overlayColor,
        overlayOpacity,
        overlayGradient,
        showHeading,
        headingText,
        responsiveHeadingAlignment,
        responsiveIconColor,
        responsiveContentAlignment,
        responsivePadding,
        responsiveMargin,
        responsiveMinHeight,
        responsiveGridWidth,
        responsiveGridColumns,
        responsiveGridGap,
        responsiveItemPadding,
        responsiveItemBorderWidth,
        responsiveItemBorderStyle,
        responsiveItemBorderColor,
        responsiveIconSize,
        responsiveBlockWidth,
        containerMode = 'constrained',
        responsiveMaxWidth = {
            mobile: { value: 100, unit: "%" },
            tablet: { value: 100, unit: "%" },
            smallLaptop: { value: 1200, unit: "px" },
            desktop: { value: 1200, unit: "px" },
            bigDesktop: { value: 1200, unit: "px" }
        },
        backgroundSize,
        backgroundPosition,
        backgroundRepeat
    } = attributes;

    const [deviceType, setDeviceType] = useState('desktop');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [activeIconItem, setActiveIconItem] = useState(null);

    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: `infogrid-2-${clientId}` });
        }
    }, [clientId, blockId, setAttributes]);

    const attributesRef = useRef(attributes);
    const itemsRef = useRef(items);

    useEffect(() => {
        attributesRef.current = attributes;
        itemsRef.current = items;
    }, [attributes, items]);

    const updateResponsiveAttribute = useCallback((attrName, device, value) => {
        setAttributes({
            [attrName]: {
                ...(attributesRef.current[attrName] || {}),
                [device]: value
            }
        });
    }, [setAttributes]);

    const CONTAINER_MODES = [
        { label: __('Full Width', 'adaire-blocks-dev2'), value: 'full' },
        { label: __('Constrained', 'adaire-blocks-dev2'), value: 'constrained' },
    ];

    const UNIT_OPTIONS = ['px', '%'];

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

    const addItem = useCallback(() => {
        const currentItems = itemsRef.current;
        const newId = currentItems.length > 0 ? Math.max(...currentItems.map(item => item.id)) + 1 : 1;
        setAttributes({
            items: [...currentItems, {
                id: newId,
                icon: 'bi bi-lightning-charge',
                title: 'New Item',
                text: 'Description goes here.'
            }]
        });
    }, [setAttributes]);

    const updateItem = useCallback((id, field, value) => {
        setAttributes({
            items: itemsRef.current.map(item => item.id === id ? { ...item, [field]: value } : item)
        });
    }, [setAttributes]);

    const deleteItem = useCallback((id) => {
        setAttributes({ items: itemsRef.current.filter(item => item.id !== id) });
    }, [setAttributes]);

    const moveItem = useCallback((index, direction) => {
        const currentItems = [...itemsRef.current];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= currentItems.length) return;
        [currentItems[index], currentItems[newIndex]] = [currentItems[newIndex], currentItems[index]];
        setAttributes({ items: currentItems });
    }, [setAttributes]);

    const getFlexAlignment = (align) => {
        if (align === 'left') return 'flex-start';
        if (align === 'right') return 'flex-end';
        return 'center';
    };

    const getMarginAlignment = (align) => {
        if (align === 'left') return { ml: '0', mr: 'auto' };
        if (align === 'right') return { ml: 'auto', mr: '0' };
        return { ml: 'auto', mr: 'auto' };
    };

    const styleVariables = useMemo(() => {
        const vars = {
            '--infogrid-2-bg-image': backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
            '--infogrid-2-overlay-bg-solid': overlayColor || '#000000',
            '--infogrid-2-overlay-opacity': overlayOpacity !== undefined ? overlayOpacity : 0.5,
            '--infogrid-2-overlay-bg-gradient': overlayGradient || 'none',
            '--infogrid-2-bg-size': backgroundSize || 'cover',
            '--infogrid-2-bg-position': backgroundPosition || 'center',
            '--infogrid-2-bg-repeat': backgroundRepeat || 'no-repeat',
            // Container max-width
            '--infogrid-2-container-max-width': formatDimensionValue(responsiveMaxWidth?.desktop, 1200, 'px'),
            '--infogrid-2-container-max-width-tablet': formatDimensionValue(responsiveMaxWidth?.tablet, 100, '%'),
            '--infogrid-2-container-max-width-mobile': formatDimensionValue(responsiveMaxWidth?.mobile, 100, '%'),
            '--infogrid-2-container-max-width-small-laptop': formatDimensionValue(responsiveMaxWidth?.smallLaptop, 1200, 'px'),
            '--infogrid-2-container-max-width-big-desktop': formatDimensionValue(responsiveMaxWidth?.bigDesktop, 1200, 'px'),
        };

        const devicesMap = {
            mobile: 'mobile',
            tablet: 'tablet',
            smallLaptop: 'small-laptop',
            desktop: 'desktop',
            bigDesktop: 'big-desktop'
        };

        Object.keys(attributes).forEach(key => {
            if (key.startsWith('responsive') && typeof attributes[key] === 'object' && attributes[key] !== null) {
                let baseKey = key.replace('responsive', 'infogrid-2').replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
                // Avoid WordPress core selector `:where([style*=border-width])` which will apply default borders.
                // Sanitize all border-related substrings to prevent WordPress from detecting them in inline styles.
                baseKey = baseKey
                    .replace('border-width', 'bw')
                    .replace('borderWidth', 'bw')
                    .replace('border-style', 'bs')
                    .replace('borderStyle', 'bs')
                    .replace('border-color', 'bc')
                    .replace('borderColor', 'bc');

                Object.entries(devicesMap).forEach(([deviceAttr, deviceClass]) => {
                    const val = attributes[key][deviceAttr];
                    if (val !== undefined && val !== null) {
                        if (typeof val === 'object') {
                            Object.entries(val).forEach(([side, sideVal]) => {
                                if (sideVal !== undefined && sideVal !== null) {
                                    vars[`--${baseKey}-${side}-${deviceClass}`] = sideVal;
                                }
                            });
                        } else {
                            vars[`--${baseKey}-${deviceClass}`] = val;

                            if (key === 'responsiveHeadingAlignment') {
                                vars[`--infogrid-2-heading-alignment-flex-${deviceClass}`] = getFlexAlignment(val);
                            }
                            if (key === 'responsiveContentAlignment') {
                                const margins = getMarginAlignment(val);
                                vars[`--infogrid-2-content-ml-${deviceClass}`] = margins.ml;
                                vars[`--infogrid-2-content-mr-${deviceClass}`] = margins.mr;
                                vars[`--infogrid-2-content-alignment-flex-${deviceClass}`] = getFlexAlignment(val);
                            }
                        }
                    }
                });
            }
        });

        return vars;
    }, [attributes, backgroundImageUrl, overlayColor, overlayOpacity, overlayGradient, responsiveMaxWidth]);

    const blockProps = useBlockProps({
        className: `adaire-infogrid-2-container ${containerMode === 'constrained' ? 'is-constrained' : ''}`,
        style: styleVariables
    });

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

                <PanelBody title={__('Background & Overlay', 'adaire-blocks-dev2')}>
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={(media) => setAttributes({ backgroundImage: media, backgroundImageUrl: media.url })}
                            allowedTypes={['image']}
                            value={backgroundImage?.id}
                            render={({ open }) => (
                                <Button
                                    onClick={open}
                                    variant="secondary"
                                    style={{ width: '100%', marginBottom: '12px', height: '100px', border: '1px dashed #ccc' }}
                                >
                                    {backgroundImageUrl ? (
                                        <img src={backgroundImageUrl} alt="Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        __('Upload Background Image', 'adaire-blocks-dev2')
                                    )}
                                </Button>
                            )}
                        />
                    </MediaUploadCheck>
                    {backgroundImageUrl && (
                        <>
                            <Button onClick={() => setAttributes({ backgroundImage: null, backgroundImageUrl: '' })} isDestructive variant="link">
                                {__('Remove Image', 'adaire-blocks-dev2')}
                            </Button>
                            <SelectControl
                                label={__('Background Size', 'adaire-blocks-dev2')}
                                value={backgroundSize}
                                options={[
                                    { label: __('Cover', 'adaire-blocks-dev2'), value: 'cover' },
                                    { label: __('Contain', 'adaire-blocks-dev2'), value: 'contain' },
                                    { label: __('Auto', 'adaire-blocks-dev2'), value: 'auto' }
                                ]}
                                onChange={(val) => setAttributes({ backgroundSize: val })}
                            />
                            <SelectControl
                                label={__('Background Position', 'adaire-blocks-dev2')}
                                value={backgroundPosition}
                                options={[
                                    { label: __('Top Left', 'adaire-blocks-dev2'), value: 'top left' },
                                    { label: __('Top Center', 'adaire-blocks-dev2'), value: 'top center' },
                                    { label: __('Top Right', 'adaire-blocks-dev2'), value: 'top right' },
                                    { label: __('Center Left', 'adaire-blocks-dev2'), value: 'center left' },
                                    { label: __('Center Center', 'adaire-blocks-dev2'), value: 'center' },
                                    { label: __('Center Right', 'adaire-blocks-dev2'), value: 'center right' },
                                    { label: __('Bottom Left', 'adaire-blocks-dev2'), value: 'bottom left' },
                                    { label: __('Bottom Center', 'adaire-blocks-dev2'), value: 'bottom center' },
                                    { label: __('Bottom Right', 'adaire-blocks-dev2'), value: 'bottom right' }
                                ]}
                                onChange={(val) => setAttributes({ backgroundPosition: val })}
                            />
                            <SelectControl
                                label={__('Background Repeat', 'adaire-blocks-dev2')}
                                value={backgroundRepeat}
                                options={[
                                    { label: __('No Repeat', 'adaire-blocks-dev2'), value: 'no-repeat' },
                                    { label: __('Repeat', 'adaire-blocks-dev2'), value: 'repeat' },
                                    { label: __('Repeat X', 'adaire-blocks-dev2'), value: 'repeat-x' },
                                    { label: __('Repeat Y', 'adaire-blocks-dev2'), value: 'repeat-y' }
                                ]}
                                onChange={(val) => setAttributes({ backgroundRepeat: val })}
                            />
                        </>
                    )}

                    <SelectControl
                        label={__('Overlay Type', 'adaire-blocks-dev2')}
                        value={overlayType}
                        options={[
                            { label: __('None', 'adaire-blocks-dev2'), value: 'none' },
                            { label: __('Solid', 'adaire-blocks-dev2'), value: 'solid' },
                            { label: __('Gradient', 'adaire-blocks-dev2'), value: 'gradient' }
                        ]}
                        onChange={(val) => setAttributes({ overlayType: val })}
                    />

                    {overlayType === 'solid' && (
                        <>
                            <PanelColorSettings
                                title={__('Overlay Color', 'adaire-blocks-dev2')}
                                initialOpen={true}
                                colorSettings={[
                                    {
                                        value: overlayColor,
                                        onChange: (val) => setAttributes({ overlayColor: val }),
                                        label: __('Solid Color', 'adaire-blocks-dev2'),
                                    }
                                ]}
                            />
                            <RangeControl
                                label={__('Overlay Opacity', 'adaire-blocks-dev2')}
                                value={overlayOpacity}
                                onChange={(val) => setAttributes({ overlayOpacity: val })}
                                min={0}
                                max={1}
                                step={0.1}
                            />
                        </>
                    )}

                    {overlayType === 'gradient' && (
                        <BaseControl label={__('Overlay Gradient', 'adaire-blocks-dev2')}>
                            <GradientPicker
                                value={overlayGradient}
                                onChange={(val) => setAttributes({ overlayGradient: val })}
                            />
                        </BaseControl>
                    )}
                </PanelBody>

                <PanelBody title={__('Layout Settings', 'adaire-blocks-dev2')}>
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

                    <UnitControl
                        label={__('Block Width', 'adaire-blocks-dev2')}
                        value={responsiveBlockWidth[deviceType]}
                        onChange={(val) => updateResponsiveAttribute('responsiveBlockWidth', deviceType, val)}
                    />

                    {/* Max Width Controls using RangeControl + Unit Selection */}
                    <div className="adaire-infogrid-2__dimension-control" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong>{__('Max Width', 'adaire-blocks-dev2')}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                {(() => {
                                    const currentValObj = responsiveMaxWidth?.[deviceType] || {};
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
                        label={__('Block Padding', 'adaire-blocks-dev2')}
                        values={responsivePadding[deviceType]}
                        onChange={(val) => updateResponsiveAttribute('responsivePadding', deviceType, val)}
                    />

                    <UnitControl
                        label={__('Grid Width', 'adaire-blocks-dev2')}
                        value={responsiveGridWidth[deviceType]}
                        onChange={(val) => updateResponsiveAttribute('responsiveGridWidth', deviceType, val)}
                    />
                </PanelBody>

                <PanelBody title={__('Typography Settings', 'adaire-blocks-dev2')} initialOpen={false}>
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Main Heading', 'adaire-blocks-dev2')}
                        fontSizeAttr="responsiveHeadingFontSize"
                        fontWeightAttr="responsiveHeadingFontWeight"
                        lineHeightAttr="responsiveHeadingLineHeight"
                        letterSpacingAttr="responsiveHeadingLetterSpacing"
                        textTransformAttr="responsiveHeadingTextTransform"
                        colorAttr="responsiveHeadingColor"
                        marginAttr="responsiveHeadingMarginBottom"
                    />
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Item Title', 'adaire-blocks-dev2')}
                        fontSizeAttr="responsiveTitleFontSize"
                        fontWeightAttr="responsiveTitleFontWeight"
                        lineHeightAttr="responsiveTitleLineHeight"
                        letterSpacingAttr="responsiveTitleLetterSpacing"
                        textTransformAttr="responsiveTitleTextTransform"
                        colorAttr="responsiveTitleColor"
                        marginAttr="responsiveTitleMarginBottom"
                    />
                    <TypographySection
                        attributes={attributes}
                        updateResponsiveAttribute={updateResponsiveAttribute}
                        deviceType={deviceType}
                        label={__('Item Text', 'adaire-blocks-dev2')}
                        fontSizeAttr="responsiveTextFontSize"
                        fontWeightAttr="responsiveTextFontWeight"
                        lineHeightAttr="responsiveTextLineHeight"
                        letterSpacingAttr="responsiveTextLetterSpacing"
                        textTransformAttr="responsiveTextTextTransform"
                        colorAttr="responsiveTextColor"
                        marginAttr="responsiveTextMarginBottom"
                    />
                </PanelBody>

                <PanelBody title={__('Item Styles', 'adaire-blocks-dev2')} initialOpen={false}>
                    <UnitControl
                        label={__('Icon Size', 'adaire-blocks-dev2')}
                        value={responsiveIconSize[deviceType]}
                        onChange={(val) => updateResponsiveAttribute('responsiveIconSize', deviceType, val)}
                    />
                    <PanelColorSettings
                        title={__('Icon Color', 'adaire-blocks-dev2')}
                        initialOpen={false}
                        colorSettings={[
                            {
                                value: responsiveIconColor[deviceType],
                                onChange: (val) => updateResponsiveAttribute('responsiveIconColor', deviceType, val),
                                label: __('Color', 'adaire-blocks-dev2'),
                            }
                        ]}
                    />
                    <BoxControl
                        label={__('Item Padding', 'adaire-blocks-dev2')}
                        values={responsiveItemPadding[deviceType]}
                        onChange={(val) => updateResponsiveAttribute('responsiveItemPadding', deviceType, val)}
                    />
                    <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ccc' }} />
                    <p style={{ fontWeight: 600, fontSize: '12px', marginBottom: '12px' }}>{__('Item Border', 'adaire-blocks-dev2')}</p>
                    <UnitControl
                        label={__('Border Width', 'adaire-blocks-dev2')}
                        value={responsiveItemBorderWidth[deviceType]}
                        onChange={(val) => updateResponsiveAttribute('responsiveItemBorderWidth', deviceType, val)}
                    />
                    <SelectControl
                        label={__('Border Style', 'adaire-blocks-dev2')}
                        value={responsiveItemBorderStyle[deviceType]}
                        options={[
                            { label: __('Solid', 'adaire-blocks-dev2'), value: 'solid' },
                            { label: __('Dashed', 'adaire-blocks-dev2'), value: 'dashed' },
                            { label: __('Dotted', 'adaire-blocks-dev2'), value: 'dotted' },
                            { label: __('Double', 'adaire-blocks-dev2'), value: 'double' },
                            { label: __('None', 'adaire-blocks-dev2'), value: 'none' }
                        ]}
                        onChange={(val) => updateResponsiveAttribute('responsiveItemBorderStyle', deviceType, val)}
                    />
                    <PanelColorSettings
                        title={__('Border Color', 'adaire-blocks-dev2')}
                        initialOpen={false}
                        colorSettings={[
                            {
                                value: responsiveItemBorderColor[deviceType],
                                onChange: (val) => updateResponsiveAttribute('responsiveItemBorderColor', deviceType, val),
                                label: __('Color', 'adaire-blocks-dev2'),
                            }
                        ]}
                    />
                </PanelBody>

                <PanelBody title={__('Manage Grid Items', 'adaire-blocks-dev2')} initialOpen={false}>
                    <Button
                        variant="primary"
                        icon={plus}
                        onClick={addItem}
                        style={{ width: '100%', marginBottom: '20px', justifyContent: 'center' }}
                    >
                        {__('Add New Item', 'adaire-blocks-dev2')}
                    </Button>

                    <div className="adaire-infogrid-2-controls">
                        {items.map((item, index) => (
                            <Card key={item.id}>
                                <CardHeader>
                                    <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                                        <FlexItem>
                                            <strong>{__('Item', 'adaire-blocks-dev2')} #{index + 1}</strong>
                                        </FlexItem>
                                        <FlexItem>
                                            <ButtonGroup>
                                                <Button icon={chevronUp} onClick={() => moveItem(index, -1)} disabled={index === 0} size="small" />
                                                <Button icon={chevronDown} onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} size="small" />
                                                <Button icon={trash} onClick={() => deleteItem(item.id)} isDestructive size="small" />
                                            </ButtonGroup>
                                        </FlexItem>
                                    </Flex>
                                </CardHeader>
                                <CardBody>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setActiveIconItem(item.id);
                                            setIsIconPickerOpen(true);
                                        }}
                                        style={{ width: '100%', marginBottom: '12px' }}
                                    >
                                        <i className={item.icon} style={{ marginRight: '8px' }}></i>
                                        {item.icon ? item.icon : __('Select Icon', 'adaire-blocks-dev2')}
                                    </Button>
                                    <TextControl
                                        label={__('Title', 'adaire-blocks-dev2')}
                                        value={item.title}
                                        onChange={(val) => updateItem(item.id, 'title', val)}
                                    />
                                    <TextareaControl
                                        label={__('Text', 'adaire-blocks-dev2')}
                                        value={item.text}
                                        onChange={(val) => updateItem(item.id, 'text', val)}
                                    />
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </PanelBody>
            </InspectorControls>

            <BootstrapIconPicker
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                onSelect={(iconClass) => {
                    if (activeIconItem) {
                        updateItem(activeIconItem, 'icon', iconClass);
                    }
                }}
                currentIcon={activeIconItem ? items.find(i => i.id === activeIconItem)?.icon : ''}
            />

            <div {...blockProps}>
                {overlayType !== 'none' && (
                    <div className={`adaire-infogrid-2-overlay is-type-${overlayType}`} />
                )}
                <div className="adaire-infogrid-2-wrapper">
                    {showHeading && (
                        <RichText
                            tagName="h2"
                            className="adaire-infogrid-2-heading"
                            value={headingText}
                            onChange={(val) => setAttributes({ headingText: val })}
                            placeholder={__('Enter heading...', 'adaire-blocks-dev2')}
                        />
                    )}
                    <div className="adaire-infogrid-2-content">
                        {items.map((item) => (
                            <div key={item.id} className="adaire-infogrid-2-item">
                                {item.icon && (
                                    <div className="adaire-infogrid-2-item-icon">
                                        <i className={item.icon}></i>
                                    </div>
                                )}
                                <RichText
                                    tagName="h3"
                                    className="adaire-infogrid-2-item-title"
                                    value={item.title}
                                    onChange={(val) => updateItem(item.id, 'title', val)}
                                    placeholder={__('Enter title...', 'adaire-blocks-dev2')}
                                />
                                <RichText
                                    tagName="p"
                                    className="adaire-infogrid-2-item-text"
                                    value={item.text}
                                    onChange={(val) => updateItem(item.id, 'text', val)}
                                    placeholder={__('Enter text...', 'adaire-blocks-dev2')}
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



