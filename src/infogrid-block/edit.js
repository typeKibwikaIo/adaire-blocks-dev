import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    PanelColorSettings
} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    TextControl,
    TextareaControl,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    Flex,
    FlexItem,
    ToggleControl,
    BaseControl,
    __experimentalUnitControl as UnitControl,
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { normalizeBoxUnits } from '../components/spacing-utils';
import useEditorDevice, { hasCanvasPreset } from '../components/useEditorDevice';
import { useState, useEffect, createElement, useCallback, useRef } from '@wordpress/element';
import { dragHandle, trash, plus, chevronUp, chevronDown, desktop, tablet, mobile } from '@wordpress/icons';
import BootstrapIconPicker from './BootstrapIconPicker';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import { PANEL, LABEL } from '../components/inspector-vocabulary';
import DeviceSwitcher, { BreakpointNote } from '../components/DeviceSwitcher';

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

// Shared DeviceSwitcher tiers, derived from the same BREAKPOINTS list above,
// so the switcher and the responsive attribute keys can't drift apart.
const TIERS = BREAKPOINTS.map((bp) => ({ key: bp.name, label: bp.label, icon: bp.icon }));

const CONTAINER_MODES = [
    { label: __('Full Width', 'adaire-blocks'), value: 'full' },
    { label: __('Constrained', 'adaire-blocks'), value: 'constrained' },
];

const UNIT_OPTIONS = ['px', '%', 'rem', 'vw'];

// Helper function to format dimension values
const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
    if (typeof dimension === 'string') return dimension;
    const value = dimension?.value ?? fallbackValue;
    const unit = dimension?.unit ?? fallbackUnit;
    return `${value}${unit}`;
};

const Edit = ({ attributes, setAttributes, clientId }) => {
    const {
        blockId,
        items: rawItems,
        backgroundColor,
        titleColor,
        taglineColor,
        descriptionColor,
        hoverBackgroundColor,
        hoverTitleColor,
        hoverTaglineColor,
        hoverDescriptionColor,
        iconColor,
        iconSize,
        hoverIconColor,
        borderColor,
        containerBackgroundColor,
        titleFontSize,
        taglineFontSize,
        descriptionFontSize,
        itemPadding,
        gap,
        containerMode,
        containerMaxWidth,
        layoutStyle,
        itemsPerRow,
        responsivePadding,
        responsiveMargin
    } = attributes;

    // Content saved with an explicit `"items": null` bypasses the array
    // default (null is a value, not an absence), and every items.map() below
    // would throw and blank the editor. Normalise once here rather than
    // guarding seven call sites.
    const items = Array.isArray( rawItems ) ? rawItems : [];

    const [expandedItem, setExpandedItem] = useState(null);
    const [deviceType, setDeviceType] = useState('desktop');

    // Two-way sync with the responsive preview toolbar in the editor header.
    useEditorDevice(deviceType, setDeviceType);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [iconPickerTargetId, setIconPickerTargetId] = useState(null);
    const [activeZone, setActiveZone] = useState(null);

    const attributesRef = useRef(attributes);
    useEffect(() => {
        attributesRef.current = attributes;
    }, [attributes]);

    // Generate block ID on mount
    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: `infogrid-${clientId}` });
        }
    }, [clientId, blockId, setAttributes]);

    const updateResponsiveAttribute = useCallback((attrName, device, value) => {
        setAttributes({
            [attrName]: {
                ...(attributesRef.current[attrName] || {}),
                [device]: value
            }
        });
    }, [setAttributes]);

    const updateContainerDimension = (device, property, value) => {
        const current = attributesRef.current.containerMaxWidth || {};
        setAttributes({
            containerMaxWidth: {
                ...current,
                [device]: {
                    ...(current[device] || {}),
                    [property]: value
                }
            }
        });
    };


    // BoxControl can hand back a bare number ("60"); a unitless non-zero
    // length is invalid CSS, so the browser drops the whole declaration --
    // which is why these controls read as doing nothing. normalizeBoxUnits()
    // supplies the unit, and reading through it here also self-heals any
    // block already saved with an unnormalised value.
    const padBox = ( device ) => normalizeBoxUnits( responsivePadding?.[ device ] || {} );
    const marBox = ( device ) => normalizeBoxUnits( responsiveMargin?.[ device ] || {} );

    const pad = {
        mobile: padBox( 'mobile' ),
        tablet: padBox( 'tablet' ),
        smallLaptop: padBox( 'smallLaptop' ),
        desktop: padBox( 'desktop' ),
        bigDesktop: padBox( 'bigDesktop' ),
    };

    // Margin emits no custom property until the user sets one, so a block that
    // never touched it keeps byte-identical saved markup.
    const mar = {
        mobile: marBox( 'mobile' ),
        tablet: marBox( 'tablet' ),
        smallLaptop: marBox( 'smallLaptop' ),
        desktop: marBox( 'desktop' ),
        bigDesktop: marBox( 'bigDesktop' ),
    };

    const blockProps = useBlockProps({
        className: 'adaire-infogrid',
        style: {
            '--infogrid-bg': backgroundColor,
            '--infogrid-title-color': titleColor,
            '--infogrid-tagline-color': taglineColor,
            '--infogrid-description-color': descriptionColor,
            '--infogrid-hover-bg': hoverBackgroundColor,
            '--infogrid-hover-title-color': hoverTitleColor,
            '--infogrid-hover-tagline-color': hoverTaglineColor,
            '--infogrid-hover-description-color': hoverDescriptionColor,
            '--infogrid-icon-color': iconColor,
            '--infogrid-icon-size': `${iconSize}px`,
            '--infogrid-hover-icon-color': hoverIconColor,
            '--infogrid-border-color': borderColor,
            '--infogrid-container-bg': containerBackgroundColor,
            '--infogrid-title-font-size': `${titleFontSize}px`,
            '--infogrid-tagline-font-size': `${taglineFontSize}px`,
            '--infogrid-description-font-size': `${descriptionFontSize}px`,
            '--infogrid-item-padding': `${itemPadding}px`,
            '--infogrid-gap': `${gap}px`,
            '--infogrid-items-per-row': itemsPerRow || 3,
            '--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
            '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
            '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
            '--container-max-width-small-laptop': `${containerMaxWidth?.smallLaptop?.value ?? 1200}${containerMaxWidth?.smallLaptop?.unit ?? 'px'}`,
            '--container-max-width-big-desktop': `${containerMaxWidth?.bigDesktop?.value ?? 1200}${containerMaxWidth?.bigDesktop?.unit ?? 'px'}`,
            // Responsive padding
            '--infogrid-padding-top-mobile': pad.mobile.top || '40px',
            '--infogrid-padding-right-mobile': pad.mobile.right || '20px',
            '--infogrid-padding-bottom-mobile': pad.mobile.bottom || '40px',
            '--infogrid-padding-left-mobile': pad.mobile.left || '20px',
            '--infogrid-padding-top-tablet': pad.tablet.top || '60px',
            '--infogrid-padding-right-tablet': pad.tablet.right || '40px',
            '--infogrid-padding-bottom-tablet': pad.tablet.bottom || '60px',
            '--infogrid-padding-left-tablet': pad.tablet.left || '40px',
            '--infogrid-padding-top-small-laptop': pad.smallLaptop.top || '80px',
            '--infogrid-padding-right-small-laptop': pad.smallLaptop.right || '60px',
            '--infogrid-padding-bottom-small-laptop': pad.smallLaptop.bottom || '80px',
            '--infogrid-padding-left-small-laptop': pad.smallLaptop.left || '60px',
            '--infogrid-padding-top-desktop': pad.desktop.top || '100px',
            '--infogrid-padding-right-desktop': pad.desktop.right || '80px',
            '--infogrid-padding-bottom-desktop': pad.desktop.bottom || '100px',
            '--infogrid-padding-left-desktop': pad.desktop.left || '80px',
            '--infogrid-padding-top-big-desktop': pad.bigDesktop.top || '100px',
            '--infogrid-padding-right-big-desktop': pad.bigDesktop.right || '80px',
            '--infogrid-padding-bottom-big-desktop': pad.bigDesktop.bottom || '100px',
            '--infogrid-padding-left-big-desktop': pad.bigDesktop.left || '80px',
            '--infogrid-margin-top-mobile': mar.mobile.top || undefined,
            '--infogrid-margin-right-mobile': mar.mobile.right || undefined,
            '--infogrid-margin-bottom-mobile': mar.mobile.bottom || undefined,
            '--infogrid-margin-left-mobile': mar.mobile.left || undefined,
            '--infogrid-margin-top-tablet': mar.tablet.top || undefined,
            '--infogrid-margin-right-tablet': mar.tablet.right || undefined,
            '--infogrid-margin-bottom-tablet': mar.tablet.bottom || undefined,
            '--infogrid-margin-left-tablet': mar.tablet.left || undefined,
            '--infogrid-margin-top-small-laptop': mar.smallLaptop.top || undefined,
            '--infogrid-margin-right-small-laptop': mar.smallLaptop.right || undefined,
            '--infogrid-margin-bottom-small-laptop': mar.smallLaptop.bottom || undefined,
            '--infogrid-margin-left-small-laptop': mar.smallLaptop.left || undefined,
            '--infogrid-margin-top-desktop': mar.desktop.top || undefined,
            '--infogrid-margin-right-desktop': mar.desktop.right || undefined,
            '--infogrid-margin-bottom-desktop': mar.desktop.bottom || undefined,
            '--infogrid-margin-left-desktop': mar.desktop.left || undefined,
            '--infogrid-margin-top-big-desktop': mar.bigDesktop.top || undefined,
            '--infogrid-margin-right-big-desktop': mar.bigDesktop.right || undefined,
            '--infogrid-margin-bottom-big-desktop': mar.bigDesktop.bottom || undefined,
            '--infogrid-margin-left-big-desktop': mar.bigDesktop.left || undefined,
        }
    });

    // CRUD Operations
    const addItem = () => {
        const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
        const newItem = {
            id: newId,
            title: 'NEW CATEGORY',
            tagline: 'Your tagline here',
            description: 'Add your description here...',
            useIcon: false,
            iconClass: ''
        };
        setAttributes({ items: [...items, newItem] });
    };

    const updateItem = (id, field, value) => {
        const updatedItems = items.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        setAttributes({ items: updatedItems });
    };

    const deleteItem = (id) => {
        const updatedItems = items.filter(item => item.id !== id);
        setAttributes({ items: updatedItems });
    };

    const moveItem = (index, direction) => {
        const newItems = [...items];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= items.length) return;
        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
        setAttributes({ items: newItems });
    };

    return (
        <>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
                <PanelBody section="layout" title={ PANEL.RESPONSIVE } initialOpen={true}>
                    <DeviceSwitcher
                        deviceType={deviceType}
                        setDeviceType={setDeviceType}
                        label={ LABEL.BREAKPOINT }
                        tiers={TIERS}
                    />
                    <BreakpointNote deviceType={deviceType} tiers={TIERS} />
                    {!hasCanvasPreset(deviceType) && (
                        <p className="adaire-device-toggle-hint">
                            {__('The preview toolbar has no canvas size for this breakpoint, so the canvas stays on Desktop. Check this one on the front end.', 'adaire-blocks')}
                        </p>
                    )}
                </PanelBody>

                {/* Items Management */}
                <PanelBody section="content" title={ PANEL.ITEMS } initialOpen={true}>
                    <Button
                        variant="primary"
                        icon={plus}
                        onClick={addItem}
                        style={{ marginBottom: '16px', width: '100%', justifyContent: 'center' }}
                    >
                        {__('Add New Item', 'adaire-blocks')}
                    </Button>

                    {items.map((item, index) => (
                        <Card key={item.id} style={{ marginBottom: '12px' }}>
                            <CardHeader>
                                <Flex align="center" justify="space-between">
                                    <FlexItem>
                                        <strong style={{ fontSize: '12px' }}>{item.title}</strong>
                                    </FlexItem>
                                    <FlexItem>
                                        <Flex gap={1}>
                                            <Button
                                                icon={chevronUp}
                                                size="small"
                                                onClick={() => moveItem(index, -1)}
                                                disabled={index === 0}
                                                label={__('Move Up', 'adaire-blocks')}
                                            />
                                            <Button
                                                icon={chevronDown}
                                                size="small"
                                                onClick={() => moveItem(index, 1)}
                                                disabled={index === items.length - 1}
                                                label={__('Move Down', 'adaire-blocks')}
                                            />
                                            <Button
                                                icon={trash}
                                                size="small"
                                                isDestructive
                                                onClick={() => deleteItem(item.id)}
                                                label={__('Delete', 'adaire-blocks')}
                                            />
                                        </Flex>
                                    </FlexItem>
                                </Flex>
                            </CardHeader>
                            <CardBody>
                                <TextControl
                                    label={__('Title', 'adaire-blocks')}
                                    value={item.title}
                                    onChange={(value) => updateItem(item.id, 'title', value)}
                                />
                                <ToggleControl
                                    label={__('Show Title', 'adaire-blocks')}
                                    checked={item.showTitle !== false}
                                    onChange={(value) => updateItem(item.id, 'showTitle', value)}
                                />
                                <TextControl
                                    label={__('Tagline', 'adaire-blocks')}
                                    value={item.tagline}
                                    onChange={(value) => updateItem(item.id, 'tagline', value)}
                                />
                                <TextareaControl
                                    label={__('Description', 'adaire-blocks')}
                                    value={item.description}
                                    onChange={(value) => updateItem(item.id, 'description', value)}
                                    rows={3}
                                />

                                <ToggleControl
                                    label={__('Use icon instead of title', 'adaire-blocks')}
                                    checked={!!item.useIcon}
                                    onChange={(value) => updateItem(item.id, 'useIcon', value)}
                                />

                                {item.useIcon && (
                                    <BaseControl label={__('Item Icon', 'adaire-blocks')}>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setIconPickerTargetId(item.id);
                                                setIsIconPickerOpen(true);
                                            }}
                                            style={{ width: '100%', marginBottom: '8px' }}
                                        >
                                            {item.iconClass ? (
                                                <>
                                                    <i className={item.iconClass} style={{ marginRight: '8px' }}></i>
                                                    {item.iconClass}
                                                </>
                                            ) : (
                                                __('Choose Bootstrap Icon', 'adaire-blocks')
                                            )}
                                        </Button>
                                        {item.iconClass && (
                                            <Button
                                                variant="link"
                                                isDestructive
                                                onClick={() => updateItem(item.id, 'iconClass', '')}
                                            >
                                                {__('Remove Icon', 'adaire-blocks')}
                                            </Button>
                                        )}
                                    </BaseControl>
                                )}
                            </CardBody>
                        </Card>
                    ))}
                </PanelBody>

                {/* Typography */}
                <PanelBody section="style" title={ PANEL.TYPOGRAPHY } initialOpen={false}>
                    <RangeControl
                        label={__('Title Font Size', 'adaire-blocks')}
                        value={titleFontSize}
                        onChange={(value) => setAttributes({ titleFontSize: value })}
                        min={10}
                        max={24}
                        step={1}
                    />
                    <RangeControl
                        label={__('Tagline Font Size', 'adaire-blocks')}
                        value={taglineFontSize}
                        onChange={(value) => setAttributes({ taglineFontSize: value })}
                        min={16}
                        max={48}
                        step={1}
                    />
                    <RangeControl
                        label={__('Description Font Size', 'adaire-blocks')}
                        value={descriptionFontSize}
                        onChange={(value) => setAttributes({ descriptionFontSize: value })}
                        min={12}
                        max={24}
                        step={1}
                    />
                    <RangeControl
                        label={ LABEL.ICON_SIZE }
                        value={iconSize}
                        onChange={(value) => setAttributes({ iconSize: value })}
                        min={12}
                        max={80}
                        step={1}
                    />
                </PanelBody>

                {/* Structure — the grid's shape */}
                <PanelBody section="layout" title={ PANEL.STRUCTURE } initialOpen={false}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Layout Style', 'adaire-blocks')}
                    </p>
                    <ButtonGroup>
                        <Button
                            isPrimary={layoutStyle === 'default'}
                            isSecondary={layoutStyle !== 'default'}
                            onClick={() => setAttributes({ layoutStyle: 'default' })}
                        >
                            {__('Default', 'adaire-blocks')}
                        </Button>
                        <Button
                            isPrimary={layoutStyle === 'alt'}
                            isSecondary={layoutStyle !== 'alt'}
                            onClick={() => setAttributes({ layoutStyle: 'alt' })}
                        >
                            {__('Alternate', 'adaire-blocks')}
                        </Button>
                        <Button
                            isPrimary={layoutStyle === 'grid'}
                            isSecondary={layoutStyle !== 'grid'}
                            onClick={() => setAttributes({ layoutStyle: 'grid' })}
                        >
                            {__('Flexible Grid', 'adaire-blocks')}
                        </Button>
                    </ButtonGroup>

                    {layoutStyle === 'grid' && (
                        <RangeControl
                            label={ LABEL.COLUMNS }
                            help={__('Items are distributed evenly and wrap to new rows automatically — no fixed positions, so any number of items lays out cleanly. Tablet shows up to 2 per row and mobile stacks to 1.', 'adaire-blocks')}
                            value={itemsPerRow || 3}
                            onChange={(value) => setAttributes({ itemsPerRow: value })}
                            min={1}
                            max={6}
                            step={1}
                        />
                    )}
                </PanelBody>

                {/*
                  PanelColorSettings is nested inside a tagged PanelBody rather
                  than tagged itself — InspectorTabs classifies on the child's
                  own props, and only PanelBody is guaranteed to ignore the
                  extra `section` prop. Same shape feature-grid-free uses.
                */}
                <PanelBody section="style" title={ PANEL.COLORS } initialOpen={false}>
                <PanelColorSettings
                    title={__('Item Colors', 'adaire-blocks')}
                    colorSettings={[
                        {
                            label: __('Background Color', 'adaire-blocks'),
                            value: backgroundColor,
                            onChange: (value) => setAttributes({ backgroundColor: value })
                        },
                        {
                            label: __('Title Color', 'adaire-blocks'),
                            value: titleColor,
                            onChange: (value) => setAttributes({ titleColor: value })
                        },
                        {
                            label: __('Tagline Color', 'adaire-blocks'),
                            value: taglineColor,
                            onChange: (value) => setAttributes({ taglineColor: value })
                        },
                        {
                            label: __('Icon Color', 'adaire-blocks'),
                            value: iconColor,
                            onChange: (value) => setAttributes({ iconColor: value })
                        },
                        {
                            label: __('Hover Icon Color', 'adaire-blocks'),
                            value: hoverIconColor,
                            onChange: (value) => setAttributes({ hoverIconColor: value })
                        },
                        {
                            label: __('Border Color', 'adaire-blocks'),
                            value: borderColor,
                            onChange: (value) => setAttributes({ borderColor: value })
                        },
                        {
                            label: __('Container Background', 'adaire-blocks'),
                            value: containerBackgroundColor,
                            onChange: (value) => setAttributes({ containerBackgroundColor: value })
                        },
                        {
                            label: __('Hover Background', 'adaire-blocks'),
                            value: hoverBackgroundColor,
                            onChange: (value) => setAttributes({ hoverBackgroundColor: value })
                        },
                        {
                            label: __('Hover Title Color', 'adaire-blocks'),
                            value: hoverTitleColor,
                            onChange: (value) => setAttributes({ hoverTitleColor: value })
                        },
                        {
                            label: __('Hover Tagline Color', 'adaire-blocks'),
                            value: hoverTaglineColor,
                            onChange: (value) => setAttributes({ hoverTaglineColor: value })
                        },
                        {
                            label: __('Hover Description Color', 'adaire-blocks'),
                            value: hoverDescriptionColor,
                            onChange: (value) => setAttributes({ hoverDescriptionColor: value })
                        }
                    ]}
                />
                </PanelBody>

                {/* Container sizing */}
                <PanelBody section="layout" title={ PANEL.DIMENSIONS } initialOpen={false}>
                    <BreakpointNote deviceType={deviceType} tiers={TIERS} />

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

                    {/* Max Width Controls using RangeControl + Unit Selection */}
                    <div className="adaire-infogrid__dimension-control" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong>{__('Max Width', 'adaire-blocks')}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                {(() => {
                                    const currentValObj = containerMaxWidth?.[deviceType] || {};
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
                                        isPrimary={(containerMaxWidth?.[deviceType]?.unit || 'px') === u}
                                        onClick={() => updateContainerDimension(deviceType, 'unit', u)}
                                    >
                                        {u}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </div>
                    </div>

                </PanelBody>

                {/* Padding, margin and gap are Style, not Layout (spec §4). */}
                <PanelBody section="style" title={ PANEL.SPACING } initialOpen={false}>
                    <BreakpointNote deviceType={deviceType} tiers={TIERS} />

                    <BoxControl
                        label={ LABEL.PADDING }
                        values={responsivePadding?.[deviceType] || {}}
                        onChange={(val) => updateResponsiveAttribute('responsivePadding', deviceType, normalizeBoxUnits(val))}
                    />

                    <BoxControl
                        label={ LABEL.MARGIN }
                        values={responsiveMargin?.[deviceType] || {}}
                        onChange={(val) => updateResponsiveAttribute('responsiveMargin', deviceType, normalizeBoxUnits(val))}
                    />

                    <RangeControl
                        label={__('Item Padding', 'adaire-blocks')}
                        value={itemPadding}
                        onChange={(value) => setAttributes({ itemPadding: value })}
                        min={16}
                        max={64}
                        step={4}
                    />

                    <RangeControl
                        label={ LABEL.GAP }
                        value={gap}
                        onChange={(value) => setAttributes({ gap: value })}
                        min={0}
                        max={16}
                        step={1}
                    />
                </PanelBody>
            </InspectorTabs>

            <BootstrapIconPicker
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                currentIcon={
                    iconPickerTargetId
                        ? (items.find((item) => item.id === iconPickerTargetId)?.iconClass || '')
                        : ''
                }
                onSelect={(iconClass) => {
                    if (!iconPickerTargetId) return;
                    const targetItem = items.find((item) => item.id === iconPickerTargetId);
                    if (!targetItem) return;
                    const updatedItems = items.map((item) =>
                        item.id === iconPickerTargetId
                            ? { ...item, iconClass: iconClass, useIcon: true }
                            : item
                    );
                    setAttributes({ items: updatedItems });
                }}
            />

            <div
                {...blockProps}
                className={`${blockProps.className} adaire-infogrid--layout-${layoutStyle || 'default'}`}
            >
                <div className={`adaire-infogrid__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                <div className="adaire-infogrid__grid">
                    {items.map((item, index) => (
                        <div 
                            key={item.id}
                            className={`adaire-infogrid__item adaire-infogrid__item--${index + 1} ${expandedItem === item.id ? 'is-expanded' : ''}`}
                            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        >
                            <QuickZone
                                id={`infogrid-item-${item.id}`}
                                label="Item"
                                activeZone={activeZone}
                                setActiveZone={setActiveZone}
                                content={
                                    <>
                                        <TextControl
                                            label={__('Title', 'adaire-blocks')}
                                            value={item.title}
                                            onChange={(value) => updateItem(item.id, 'title', value)}
                                        />
                                        <ToggleControl
                                            label={__('Show Title', 'adaire-blocks')}
                                            checked={item.showTitle !== false}
                                            onChange={(value) => updateItem(item.id, 'showTitle', value)}
                                        />
                                        <TextControl
                                            label={__('Tagline', 'adaire-blocks')}
                                            value={item.tagline}
                                            onChange={(value) => updateItem(item.id, 'tagline', value)}
                                        />
                                        <TextareaControl
                                            label={__('Description', 'adaire-blocks')}
                                            value={item.description}
                                            onChange={(value) => updateItem(item.id, 'description', value)}
                                            rows={3}
                                        />
                                        <ToggleControl
                                            label={__('Use icon instead of title', 'adaire-blocks')}
                                            checked={!!item.useIcon}
                                            onChange={(value) => updateItem(item.id, 'useIcon', value)}
                                        />
                                        {item.useIcon && (
                                            <BaseControl label={__('Item Icon', 'adaire-blocks')}>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setIconPickerTargetId(item.id);
                                                        setIsIconPickerOpen(true);
                                                    }}
                                                    style={{ width: '100%', marginBottom: '8px' }}
                                                >
                                                    {item.iconClass ? (
                                                        <>
                                                            <i className={item.iconClass} style={{ marginRight: '8px' }}></i>
                                                            {item.iconClass}
                                                        </>
                                                    ) : (
                                                        __('Choose Bootstrap Icon', 'adaire-blocks')
                                                    )}
                                                </Button>
                                            </BaseControl>
                                        )}
                                    </>
                                }
                            >
                            <div className="adaire-infogrid__item-content">
                                <div className="adaire-infogrid__item-header">
                                    {item.showTitle !== false && (
                                        item.useIcon && item.iconClass ? (
                                            <span
                                                className="adaire-infogrid__item-title adaire-infogrid__item-title--icon"
                                                aria-label={item.title}
                                            >
                                                <i className={item.iconClass}></i>
                                            </span>
                                        ) : (
                                            <span className="adaire-infogrid__item-title">{item.title}</span>
                                        )
                                    )}
                                    <span className="adaire-infogrid__item-icon">
                                        {expandedItem === item.id ? 'Ã—' : '+'}
                                    </span>
                                </div>
                                <h3 className="adaire-infogrid__item-tagline">{item.tagline}</h3>
                                {expandedItem === item.id && (
                                    <p className="adaire-infogrid__item-description" style={{ whiteSpace: 'pre-line' }}>{item.description}</p>
                                )}
                            </div>
                            </QuickZone>
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </>
    );
};

export default Edit;




