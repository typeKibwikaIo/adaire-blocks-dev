import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    InspectorControls,
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
import { useState, useEffect, createElement, useCallback, useRef } from '@wordpress/element';
import { dragHandle, trash, plus, chevronUp, chevronDown, desktop, tablet, mobile } from '@wordpress/icons';
import BootstrapIconPicker from './BootstrapIconPicker';

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
    { name: 'mobile', icon: mobile, label: __('Mobile', 'infogrid-block') },
    { name: 'tablet', icon: tablet, label: __('Tablet', 'infogrid-block') },
    { name: 'smallLaptop', icon: smallLaptopIcon, label: __('Small Laptop', 'infogrid-block') },
    { name: 'desktop', icon: desktop, label: __('Desktop', 'infogrid-block') },
    { name: 'bigDesktop', icon: bigDesktopIcon, label: __('Big Desktop', 'infogrid-block') }
];

const CONTAINER_MODES = [
    { label: __('Full Width', 'infogrid-block'), value: 'full' },
    { label: __('Constrained', 'infogrid-block'), value: 'constrained' },
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
        items,
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
        responsivePadding
    } = attributes;

    const [expandedItem, setExpandedItem] = useState(null);
    const [deviceType, setDeviceType] = useState('desktop');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [iconPickerTargetId, setIconPickerTargetId] = useState(null);

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
            '--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
            '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
            '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
            '--container-max-width-small-laptop': `${containerMaxWidth?.smallLaptop?.value ?? 1200}${containerMaxWidth?.smallLaptop?.unit ?? 'px'}`,
            '--container-max-width-big-desktop': `${containerMaxWidth?.bigDesktop?.value ?? 1200}${containerMaxWidth?.bigDesktop?.unit ?? 'px'}`,
            // Responsive padding
            '--infogrid-padding-top-mobile': responsivePadding?.mobile?.top || '40px',
            '--infogrid-padding-right-mobile': responsivePadding?.mobile?.right || '20px',
            '--infogrid-padding-bottom-mobile': responsivePadding?.mobile?.bottom || '40px',
            '--infogrid-padding-left-mobile': responsivePadding?.mobile?.left || '20px',
            '--infogrid-padding-top-tablet': responsivePadding?.tablet?.top || '60px',
            '--infogrid-padding-right-tablet': responsivePadding?.tablet?.right || '40px',
            '--infogrid-padding-bottom-tablet': responsivePadding?.tablet?.bottom || '60px',
            '--infogrid-padding-left-tablet': responsivePadding?.tablet?.left || '40px',
            '--infogrid-padding-top-small-laptop': responsivePadding?.smallLaptop?.top || '80px',
            '--infogrid-padding-right-small-laptop': responsivePadding?.smallLaptop?.right || '60px',
            '--infogrid-padding-bottom-small-laptop': responsivePadding?.smallLaptop?.bottom || '80px',
            '--infogrid-padding-left-small-laptop': responsivePadding?.smallLaptop?.left || '60px',
            '--infogrid-padding-top-desktop': responsivePadding?.desktop?.top || '100px',
            '--infogrid-padding-right-desktop': responsivePadding?.desktop?.right || '80px',
            '--infogrid-padding-bottom-desktop': responsivePadding?.desktop?.bottom || '100px',
            '--infogrid-padding-left-desktop': responsivePadding?.desktop?.left || '80px',
            '--infogrid-padding-top-big-desktop': responsivePadding?.bigDesktop?.top || '100px',
            '--infogrid-padding-right-big-desktop': responsivePadding?.bigDesktop?.right || '80px',
            '--infogrid-padding-bottom-big-desktop': responsivePadding?.bigDesktop?.bottom || '100px',
            '--infogrid-padding-left-big-desktop': responsivePadding?.bigDesktop?.left || '80px'
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
            <InspectorControls>
                <div className="adaire-device-toggle">
                    <p className="adaire-device-toggle-label">{__('Device View', 'infogrid-block')}</p>
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
                        {__('Configuring:', 'infogrid-block')} <strong>{BREAKPOINTS.find(b => b.name === deviceType).label}</strong>
                    </p>
                </div>

                {/* Items Management */}
                <PanelBody title={__('Manage Items', 'infogrid-block')} initialOpen={true}>
                    <Button
                        variant="primary"
                        icon={plus}
                        onClick={addItem}
                        style={{ marginBottom: '16px', width: '100%', justifyContent: 'center' }}
                    >
                        {__('Add New Item', 'infogrid-block')}
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
                                                label={__('Move Up', 'infogrid-block')}
                                            />
                                            <Button
                                                icon={chevronDown}
                                                size="small"
                                                onClick={() => moveItem(index, 1)}
                                                disabled={index === items.length - 1}
                                                label={__('Move Down', 'infogrid-block')}
                                            />
                                            <Button
                                                icon={trash}
                                                size="small"
                                                isDestructive
                                                onClick={() => deleteItem(item.id)}
                                                label={__('Delete', 'infogrid-block')}
                                            />
                                        </Flex>
                                    </FlexItem>
                                </Flex>
                            </CardHeader>
                            <CardBody>
                                <TextControl
                                    label={__('Title', 'infogrid-block')}
                                    value={item.title}
                                    onChange={(value) => updateItem(item.id, 'title', value)}
                                />
                                <TextControl
                                    label={__('Tagline', 'infogrid-block')}
                                    value={item.tagline}
                                    onChange={(value) => updateItem(item.id, 'tagline', value)}
                                />
                                <TextareaControl
                                    label={__('Description', 'infogrid-block')}
                                    value={item.description}
                                    onChange={(value) => updateItem(item.id, 'description', value)}
                                    rows={3}
                                />

                                <ToggleControl
                                    label={__('Use icon instead of title', 'infogrid-block')}
                                    checked={!!item.useIcon}
                                    onChange={(value) => updateItem(item.id, 'useIcon', value)}
                                />

                                {item.useIcon && (
                                    <BaseControl label={__('Item Icon', 'infogrid-block')}>
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
                                                __('Choose Bootstrap Icon', 'infogrid-block')
                                            )}
                                        </Button>
                                        {item.iconClass && (
                                            <Button
                                                variant="link"
                                                isDestructive
                                                onClick={() => updateItem(item.id, 'iconClass', '')}
                                            >
                                                {__('Remove Icon', 'infogrid-block')}
                                            </Button>
                                        )}
                                    </BaseControl>
                                )}
                            </CardBody>
                        </Card>
                    ))}
                </PanelBody>

                {/* Typography Settings */}
                <PanelBody title={__('Typography', 'infogrid-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Title Font Size', 'infogrid-block')}
                        value={titleFontSize}
                        onChange={(value) => setAttributes({ titleFontSize: value })}
                        min={10}
                        max={24}
                        step={1}
                    />
                    <RangeControl
                        label={__('Tagline Font Size', 'infogrid-block')}
                        value={taglineFontSize}
                        onChange={(value) => setAttributes({ taglineFontSize: value })}
                        min={16}
                        max={48}
                        step={1}
                    />
                    <RangeControl
                        label={__('Description Font Size', 'infogrid-block')}
                        value={descriptionFontSize}
                        onChange={(value) => setAttributes({ descriptionFontSize: value })}
                        min={12}
                        max={24}
                        step={1}
                    />
                    <RangeControl
                        label={__('Icon Size', 'infogrid-block')}
                        value={iconSize}
                        onChange={(value) => setAttributes({ iconSize: value })}
                        min={12}
                        max={80}
                        step={1}
                    />
                </PanelBody>

                {/* Layout Settings */}
                <PanelBody title={__('Layout', 'infogrid-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Item Padding', 'infogrid-block')}
                        value={itemPadding}
                        onChange={(value) => setAttributes({ itemPadding: value })}
                        min={16}
                        max={64}
                        step={4}
                    />
                    <RangeControl
                        label={__('Gap Between Items', 'infogrid-block')}
                        value={gap}
                        onChange={(value) => setAttributes({ gap: value })}
                        min={0}
                        max={16}
                        step={1}
                    />

                    <p style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>
                        {__('Layout Style', 'infogrid-block')}
                    </p>
                    <ButtonGroup>
                        <Button
                            isPrimary={layoutStyle === 'default'}
                            isSecondary={layoutStyle !== 'default'}
                            onClick={() => setAttributes({ layoutStyle: 'default' })}
                        >
                            {__('Default', 'infogrid-block')}
                        </Button>
                        <Button
                            isPrimary={layoutStyle === 'alt'}
                            isSecondary={layoutStyle !== 'alt'}
                            onClick={() => setAttributes({ layoutStyle: 'alt' })}
                        >
                            {__('Alternate', 'infogrid-block')}
                        </Button>
                    </ButtonGroup>
                </PanelBody>

                {/* Color Settings */}
                <PanelColorSettings
                    title={__('Colors', 'infogrid-block')}
                    colorSettings={[
                        {
                            label: __('Background Color', 'infogrid-block'),
                            value: backgroundColor,
                            onChange: (value) => setAttributes({ backgroundColor: value })
                        },
                        {
                            label: __('Title Color', 'infogrid-block'),
                            value: titleColor,
                            onChange: (value) => setAttributes({ titleColor: value })
                        },
                        {
                            label: __('Tagline Color', 'infogrid-block'),
                            value: taglineColor,
                            onChange: (value) => setAttributes({ taglineColor: value })
                        },
                        {
                            label: __('Icon Color', 'infogrid-block'),
                            value: iconColor,
                            onChange: (value) => setAttributes({ iconColor: value })
                        },
                        {
                            label: __('Hover Icon Color', 'infogrid-block'),
                            value: hoverIconColor,
                            onChange: (value) => setAttributes({ hoverIconColor: value })
                        },
                        {
                            label: __('Border Color', 'infogrid-block'),
                            value: borderColor,
                            onChange: (value) => setAttributes({ borderColor: value })
                        },
                        {
                            label: __('Container Background', 'infogrid-block'),
                            value: containerBackgroundColor,
                            onChange: (value) => setAttributes({ containerBackgroundColor: value })
                        },
                        {
                            label: __('Hover Background', 'infogrid-block'),
                            value: hoverBackgroundColor,
                            onChange: (value) => setAttributes({ hoverBackgroundColor: value })
                        },
                        {
                            label: __('Hover Title Color', 'infogrid-block'),
                            value: hoverTitleColor,
                            onChange: (value) => setAttributes({ hoverTitleColor: value })
                        },
                        {
                            label: __('Hover Tagline Color', 'infogrid-block'),
                            value: hoverTaglineColor,
                            onChange: (value) => setAttributes({ hoverTaglineColor: value })
                        },
                        {
                            label: __('Hover Description Color', 'infogrid-block'),
                            value: hoverDescriptionColor,
                            onChange: (value) => setAttributes({ hoverDescriptionColor: value })
                        }
                    ]}
                />

                {/* Layout Settings */}
                <PanelBody title={__('Layout Settings', 'infogrid-block')}>
                    <p>{__('Container Width', 'infogrid-block')}</p>
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
                            <strong>{__('Max Width', 'infogrid-block')}</strong>
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

                    <BoxControl
                        label={__('Block Padding', 'infogrid-block')}
                        values={responsivePadding?.[deviceType] || {}}
                        onChange={(val) => updateResponsiveAttribute('responsivePadding', deviceType, val)}
                    />
                </PanelBody>
            </InspectorControls>

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
                            <div className="adaire-infogrid__item-content">
                                <div className="adaire-infogrid__item-header">
                                    {item.useIcon && item.iconClass ? (
                                        <span
                                            className="adaire-infogrid__item-title adaire-infogrid__item-title--icon"
                                            aria-label={item.title}
                                        >
                                            <i className={item.iconClass}></i>
                                        </span>
                                    ) : (
                                        <span className="adaire-infogrid__item-title">{item.title}</span>
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
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </>
    );
};

export default Edit;




