import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockProps, PanelColorSettings } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    ColorPicker,
    BaseControl,
    Button,
    TextControl,
    SelectControl,
    ButtonGroup,
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { createElement } from '@wordpress/element';
import { plus, trash } from '@wordpress/icons';
import BootstrapIconPicker from './BootstrapIconPicker';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import './editor.scss';

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
    { name: 'mobile', icon: mobile, label: __('Mobile', 'social-banner-block') },
    { name: 'tablet', icon: tablet, label: __('Tablet', 'social-banner-block') },
    { name: 'smallLaptop', icon: smallLaptopIcon, label: __('Small Laptop', 'social-banner-block') },
    { name: 'desktop', icon: desktop, label: __('Desktop', 'social-banner-block') },
    { name: 'bigDesktop', icon: bigDesktopIcon, label: __('Big Desktop', 'social-banner-block') }
];

export default function Edit({ attributes, setAttributes, clientId }) {
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [deviceType, setDeviceType] = useState('desktop');
    const [activeZone, setActiveZone] = useState(null);

    const {
        blockId,
        positionType,
        displayType,
        layoutDirection,
        offsetFrom,
        offset,
        offsetUnit,
        horizontalOffsetFrom,
        horizontalOffset,
        horizontalOffsetUnit,
        iconEntries,
        iconSize,
        spacing,
        borderRadius,
        backgroundColor,
        backgroundBorderRadius,
        responsivePadding,
        hoverAnimation,
        animationDuration,
        animationEasing,
    } = attributes;

    if (!blockId) {
        setAttributes({ blockId: clientId });
    }

    const blockProps = useBlockProps({
        className: `adaire-social-banner adaire-social-banner--hover-${hoverAnimation || 'up'} adaire-social-banner--position-${positionType || 'fixed'} adaire-social-banner--display-${displayType || 'block'} adaire-social-banner--layout-${layoutDirection || 'column'}`,
        style: {
            '--banner-offset-from': offsetFrom,
            '--banner-offset': `${offset}${offsetUnit || 'px'}`,
            '--banner-horizontal-offset-from': horizontalOffsetFrom || 'left',
            '--banner-horizontal-offset': `${horizontalOffset || 0}${horizontalOffsetUnit || 'px'}`,
            '--icon-size': `${iconSize}px`,
            '--icon-spacing': `${spacing}px`,
            '--icon-border-radius': `${borderRadius}px`,
            '--animation-duration': `${animationDuration || 0.3}s`,
            '--animation-easing': animationEasing || 'ease',
            '--banner-background-color': (backgroundColor && backgroundColor.trim() !== '') ? backgroundColor : 'transparent',
            '--banner-background-border-radius': `${backgroundBorderRadius || 0}px`,
            '--banner-padding-top-mobile': responsivePadding?.mobile?.top || '0px',
            '--banner-padding-right-mobile': responsivePadding?.mobile?.right || '0px',
            '--banner-padding-bottom-mobile': responsivePadding?.mobile?.bottom || '0px',
            '--banner-padding-left-mobile': responsivePadding?.mobile?.left || '0px',
            '--banner-padding-top-tablet': responsivePadding?.tablet?.top || responsivePadding?.mobile?.top || '0px',
            '--banner-padding-right-tablet': responsivePadding?.tablet?.right || responsivePadding?.mobile?.right || '0px',
            '--banner-padding-bottom-tablet': responsivePadding?.tablet?.bottom || responsivePadding?.mobile?.bottom || '0px',
            '--banner-padding-left-tablet': responsivePadding?.tablet?.left || responsivePadding?.mobile?.left || '0px',
            '--banner-padding-top-small-laptop': responsivePadding?.smallLaptop?.top || responsivePadding?.desktop?.top || '0px',
            '--banner-padding-right-small-laptop': responsivePadding?.smallLaptop?.right || responsivePadding?.desktop?.right || '0px',
            '--banner-padding-bottom-small-laptop': responsivePadding?.smallLaptop?.bottom || responsivePadding?.desktop?.bottom || '0px',
            '--banner-padding-left-small-laptop': responsivePadding?.smallLaptop?.left || responsivePadding?.desktop?.left || '0px',
            '--banner-padding-top-desktop': responsivePadding?.desktop?.top || '0px',
            '--banner-padding-right-desktop': responsivePadding?.desktop?.right || '0px',
            '--banner-padding-bottom-desktop': responsivePadding?.desktop?.bottom || '0px',
            '--banner-padding-left-desktop': responsivePadding?.desktop?.left || '0px',
            '--banner-padding-top-big-desktop': responsivePadding?.bigDesktop?.top || responsivePadding?.desktop?.top || '0px',
            '--banner-padding-right-big-desktop': responsivePadding?.bigDesktop?.right || responsivePadding?.desktop?.right || '0px',
            '--banner-padding-bottom-big-desktop': responsivePadding?.bigDesktop?.bottom || responsivePadding?.desktop?.bottom || '0px',
            '--banner-padding-left-big-desktop': responsivePadding?.bigDesktop?.left || responsivePadding?.desktop?.left || '0px',
        },
    });

    const addIconEntry = () => {
        const newEntry = {
            id: Date.now().toString(),
            icon: '',
            iconColor: '#ffffff',
            backgroundColor: '#000000',
            linkUrl: '',
            linkTarget: '_blank',
        };
        setAttributes({
            iconEntries: [...iconEntries, newEntry],
        });
        setEditingIndex(iconEntries.length);
        setIsIconPickerOpen(true);
    };

    const removeIconEntry = (index) => {
        const newEntries = iconEntries.filter((_, i) => i !== index);
        setAttributes({ iconEntries: newEntries });
    };

    const updateIconEntry = (index, field, value) => {
        const newEntries = [...iconEntries];
        newEntries[index] = { ...newEntries[index], [field]: value };
        setAttributes({ iconEntries: newEntries });
    };

    const handleIconSelect = (iconClass) => {
        if (editingIndex !== null) {
            updateIconEntry(editingIndex, 'icon', iconClass);
            setIsIconPickerOpen(false);
            setEditingIndex(null);
        }
    };

    return (
        <>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
                <PanelBody title={__('Position Settings', 'social-banner-block')} initialOpen={true}>
                    <SelectControl
                        label={__('Position Type', 'social-banner-block')}
                        value={positionType || 'fixed'}
                        options={[
                            { label: __('Fixed', 'social-banner-block'), value: 'fixed' },
                            { label: __('Absolute', 'social-banner-block'), value: 'absolute' },
                            { label: __('Relative', 'social-banner-block'), value: 'relative' },
                        ]}
                        onChange={(value) => setAttributes({ positionType: value })}
                        help={__('Fixed: stays in place when scrolling. Absolute: positioned relative to nearest positioned ancestor. Relative: positioned relative to its normal position.', 'social-banner-block')}
                    />

                    <SelectControl
                        label={__('Display Type', 'social-banner-block')}
                        value={displayType || 'block'}
                        options={[
                            { label: __('Block', 'social-banner-block'), value: 'block' },
                            { label: __('Inline', 'social-banner-block'), value: 'inline' },
                        ]}
                        onChange={(value) => setAttributes({ displayType: value })}
                        help={__('Block: takes full width. Inline: only takes necessary width, allows easier positioning.', 'social-banner-block')}
                    />

                    <SelectControl
                        label={__('Layout Direction', 'social-banner-block')}
                        value={layoutDirection || 'column'}
                        options={[
                            { label: __('Column (Vertical)', 'social-banner-block'), value: 'column' },
                            { label: __('Row (Horizontal)', 'social-banner-block'), value: 'row' },
                        ]}
                        onChange={(value) => setAttributes({ layoutDirection: value })}
                    />

                    <SelectControl
                        label={__('Offset From', 'social-banner-block')}
                        value={offsetFrom}
                        options={[
                            { label: __('Top', 'social-banner-block'), value: 'top' },
                            { label: __('Bottom', 'social-banner-block'), value: 'bottom' },
                        ]}
                        onChange={(value) => setAttributes({ offsetFrom: value })}
                    />

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <RangeControl
                                label={offsetFrom === 'top' ? __('Top Offset', 'social-banner-block') : __('Bottom Offset', 'social-banner-block')}
                                value={offset}
                                onChange={(value) => setAttributes({ offset: value })}
                                min={0}
                                max={offsetUnit === '%' ? 100 : 500}
                            />
                        </div>
                        <SelectControl
                            label={__('Unit', 'social-banner-block')}
                            value={offsetUnit || 'px'}
                            options={[
                                { label: __('px', 'social-banner-block'), value: 'px' },
                                { label: __('%', 'social-banner-block'), value: '%' },
                            ]}
                            onChange={(value) => setAttributes({ offsetUnit: value })}
                            style={{ width: '80px' }}
                        />
                    </div>

                    <SelectControl
                        label={__('Horizontal Offset From', 'social-banner-block')}
                        value={horizontalOffsetFrom || 'left'}
                        options={[
                            { label: __('Left', 'social-banner-block'), value: 'left' },
                            { label: __('Right', 'social-banner-block'), value: 'right' },
                        ]}
                        onChange={(value) => setAttributes({ horizontalOffsetFrom: value })}
                    />

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <RangeControl
                                label={horizontalOffsetFrom === 'left' ? __('Left Offset', 'social-banner-block') : __('Right Offset', 'social-banner-block')}
                                value={horizontalOffset || 0}
                                onChange={(value) => setAttributes({ horizontalOffset: value })}
                                min={0}
                                max={horizontalOffsetUnit === '%' ? 100 : 500}
                            />
                        </div>
                        <SelectControl
                            label={__('Unit', 'social-banner-block')}
                            value={horizontalOffsetUnit || 'px'}
                            options={[
                                { label: __('px', 'social-banner-block'), value: 'px' },
                                { label: __('%', 'social-banner-block'), value: '%' },
                            ]}
                            onChange={(value) => setAttributes({ horizontalOffsetUnit: value })}
                            style={{ width: '80px' }}
                        />
                    </div>
                </PanelBody>

                <PanelBody title={__('Background & Padding', 'social-banner-block')} initialOpen={false}>
                  
                <div style={{ marginTop: '20px' }}>
                        <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                            {__('Current Breakpoint:', 'social-banner-block')}{' '}
                            {BREAKPOINTS.find(bp => bp.name === deviceType)?.label || deviceType}
                        </p>
                        <ButtonGroup style={{ marginBottom: '12px', flexWrap: 'wrap' }}>
                            {BREAKPOINTS.map((bp) => (
                                <Button
                                    key={bp.name}
                                    icon={bp.icon}
                                    isPrimary={deviceType === bp.name}
                                    onClick={() => setDeviceType(bp.name)}
                                    aria-label={bp.label}
                                />
                            ))}
                        </ButtonGroup>

                        <BoxControl
                            label={__('Padding', 'social-banner-block')}
                            values={responsivePadding?.[deviceType] || { top: '0px', right: '0px', bottom: '0px', left: '0px' }}
                            onChange={(val) => {
                                setAttributes({
                                    responsivePadding: {
                                        ...(responsivePadding || {}),
                                        [deviceType]: val
                                    }
                                });
                            }}
                        />
                    </div>
                    <PanelColorSettings
                        title={__('Background Color', 'social-banner-block')}
                        colorSettings={[
                            {
                                label: __('Background Color', 'social-banner-block'),
                                value: backgroundColor || '',
                                onChange: (value) => setAttributes({ backgroundColor: value || '' }),
                            },
                        ]}
                    />

                    <RangeControl
                        label={__('Background Border Radius', 'social-banner-block')}
                        value={backgroundBorderRadius || 0}
                        onChange={(value) => setAttributes({ backgroundBorderRadius: value })}
                        min={0}
                        max={50}
                    />


                </PanelBody>

                <PanelBody title={__('Icon Settings', 'social-banner-block')} initialOpen={true}>
                    <RangeControl
                        label={__('Icon Size', 'social-banner-block')}
                        value={iconSize}
                        onChange={(value) => setAttributes({ iconSize: value })}
                        min={16}
                        max={64}
                    />

                    <RangeControl
                        label={__('Spacing Between Icons', 'social-banner-block')}
                        value={spacing}
                        onChange={(value) => setAttributes({ spacing: value })}
                        min={0}
                        max={30}
                    />

                    <RangeControl
                        label={__('Border Radius', 'social-banner-block')}
                        value={borderRadius}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0}
                        max={50}
                    />

                    <SelectControl
                        label={__('Hover Animation', 'social-banner-block')}
                        value={hoverAnimation || 'up'}
                        options={[
                            { label: __('Up', 'social-banner-block'), value: 'up' },
                            { label: __('Down', 'social-banner-block'), value: 'down' },
                            { label: __('Left', 'social-banner-block'), value: 'left' },
                            { label: __('Right', 'social-banner-block'), value: 'right' },
                            { label: __('Pulse', 'social-banner-block'), value: 'pulse' },
                            { label: __('Scale Up', 'social-banner-block'), value: 'scale-up' },
                            { label: __('Scale Down', 'social-banner-block'), value: 'scale-down' },
                            { label: __('Rotate', 'social-banner-block'), value: 'rotate' },
                            { label: __('Shake', 'social-banner-block'), value: 'shake' },
                            { label: __('Bounce', 'social-banner-block'), value: 'bounce' },
                            { label: __('Glow', 'social-banner-block'), value: 'glow' },
                            { label: __('None', 'social-banner-block'), value: 'none' },
                        ]}
                        onChange={(value) => setAttributes({ hoverAnimation: value })}
                    />

                    <RangeControl
                        label={__('Animation Duration', 'social-banner-block')}
                        value={animationDuration || 0.3}
                        onChange={(value) => setAttributes({ animationDuration: value })}
                        min={0.1}
                        max={2}
                        step={0.1}
                        help={__('Duration in seconds', 'social-banner-block')}
                    />

                    <SelectControl
                        label={__('Animation Easing', 'social-banner-block')}
                        value={animationEasing || 'ease'}
                        options={[
                            { label: __('Ease', 'social-banner-block'), value: 'ease' },
                            { label: __('Ease In', 'social-banner-block'), value: 'ease-in' },
                            { label: __('Ease Out', 'social-banner-block'), value: 'ease-out' },
                            { label: __('Ease In Out', 'social-banner-block'), value: 'ease-in-out' },
                            { label: __('Linear', 'social-banner-block'), value: 'linear' },
                            { label: __('Cubic Bezier (Smooth)', 'social-banner-block'), value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
                            { label: __('Cubic Bezier (Bounce)', 'social-banner-block'), value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
                        ]}
                        onChange={(value) => setAttributes({ animationEasing: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Icon Entries', 'social-banner-block')} initialOpen={true}>
                    <Button
                        onClick={addIconEntry}
                        variant="primary"
                        icon={plus}
                        style={{ width: '100%', marginBottom: '16px' }}
                    >
                        {__('Add Icon Entry', 'social-banner-block')}
                    </Button>

                    {iconEntries.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>
                            {__('No icon entries yet. Click "Add Icon Entry" to get started.', 'social-banner-block')}
                        </p>
                    ) : (
                        iconEntries.map((entry, index) => (
                            <PanelBody
                                key={entry.id || index}
                                title={entry.icon 
                                    ? `${__('Icon Entry', 'social-banner-block')} #${index + 1} - ${entry.icon.replace('bi bi-', '')}`
                                    : `${__('Icon Entry', 'social-banner-block')} #${index + 1}`
                                }
                                initialOpen={false}
                                style={{ marginBottom: '8px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                        <Button
                                        onClick={() => removeIconEntry(index)}
                                        variant="link"
                                        isDestructive
                                        icon={trash}
                                    >
                                        {__('Remove', 'social-banner-block')}
                                    </Button>
                                </div>

                                <BaseControl label={__('Bootstrap Icon', 'social-banner-block')}>
                        <Button
                                        onClick={() => {
                                            setEditingIndex(index);
                                            setIsIconPickerOpen(true);
                                        }}
                                        variant="secondary"
                                        style={{ width: '100%', marginBottom: '8px' }}
                                    >
                                        {entry.icon ? (
                                            <>
                                                <i className={entry.icon} style={{ marginRight: '8px' }}></i>
                                                {entry.icon}
                                            </>
                                        ) : (
                                            __('Choose Icon', 'social-banner-block')
                                        )}
                                    </Button>
                                </BaseControl>

                                <BaseControl label={__('Icon Color', 'social-banner-block')}>
                                    <ColorPicker
                                        color={entry.iconColor || '#ffffff'}
                                        onChangeComplete={(color) => updateIconEntry(index, 'iconColor', color.hex)}
                                        disableAlpha
                                    />
                                </BaseControl>

                                <BaseControl label={__('Background Color', 'social-banner-block')}>
                                    <ColorPicker
                                        color={entry.backgroundColor || '#000000'}
                                        onChangeComplete={(color) => updateIconEntry(index, 'backgroundColor', color.hex)}
                                        disableAlpha
                                    />
                                </BaseControl>

                                <TextControl
                                    label={__('Link URL', 'social-banner-block')}
                                    value={entry.linkUrl || ''}
                                    onChange={(value) => updateIconEntry(index, 'linkUrl', value)}
                                    placeholder="https://example.com"
                                />

                                <SelectControl
                                    label={__('Link Target', 'social-banner-block')}
                                    value={entry.linkTarget || '_blank'}
                                    options={[
                                        { label: __('Same Window', 'social-banner-block'), value: '_self' },
                                        { label: __('New Window', 'social-banner-block'), value: '_blank' },
                                    ]}
                                    onChange={(value) => updateIconEntry(index, 'linkTarget', value)}
                                />
                            </PanelBody>
                        ))
                    )}
                </PanelBody>
            </InspectorTabs>

            <BootstrapIconPicker
                isOpen={isIconPickerOpen}
                onClose={() => {
                    setIsIconPickerOpen(false);
                    setEditingIndex(null);
                }}
                onSelect={handleIconSelect}
                currentIcon={editingIndex !== null ? iconEntries[editingIndex]?.icon : ''}
            />

            <div {...blockProps}>
                {iconEntries.length === 0 ? (
                    <div className="adaire-social-banner__placeholder">
                        <p>{__('Add icon entries from the settings panel to display the social banner.', 'social-banner-block')}</p>
                    </div>
                ) : (
                    <div className="adaire-social-banner__list">
                        {iconEntries.map((entry, index) => {
                            const IconWrapper = entry.linkUrl ? 'a' : 'div';
                            const linkProps = entry.linkUrl ? {
                                href: entry.linkUrl,
                                target: entry.linkTarget === '_blank' ? '_blank' : undefined,
                                rel: entry.linkTarget === '_blank' ? 'noopener noreferrer' : undefined,
                            } : {};

                            return (
                        <QuickZone
                            key={entry.id || index}
                            id={`social-icon-${index}`}
                            label="Social Icon"
                            activeZone={activeZone}
                            setActiveZone={setActiveZone}
                            content={
                                <>
                                    <BaseControl label={__('Bootstrap Icon', 'social-banner-block')}>
                                        <Button
                                            onClick={() => {
                                                setEditingIndex(index);
                                                setIsIconPickerOpen(true);
                                            }}
                                            variant="secondary"
                                            style={{ width: '100%', marginBottom: '8px' }}
                                        >
                                            {entry.icon ? (
                                                <>
                                                    <i className={entry.icon} style={{ marginRight: '8px' }}></i>
                                                    {entry.icon}
                                                </>
                                            ) : (
                                                __('Choose Icon', 'social-banner-block')
                                            )}
                                        </Button>
                                    </BaseControl>
                                    <BaseControl label={__('Icon Color', 'social-banner-block')}>
                                        <ColorPicker
                                            color={entry.iconColor || '#ffffff'}
                                            onChangeComplete={(color) => updateIconEntry(index, 'iconColor', color.hex)}
                                            disableAlpha
                                        />
                                    </BaseControl>
                                    <BaseControl label={__('Background Color', 'social-banner-block')}>
                                        <ColorPicker
                                            color={entry.backgroundColor || '#000000'}
                                            onChangeComplete={(color) => updateIconEntry(index, 'backgroundColor', color.hex)}
                                            disableAlpha
                                        />
                                    </BaseControl>
                                    <TextControl
                                        label={__('Link URL', 'social-banner-block')}
                                        value={entry.linkUrl || ''}
                                        onChange={(value) => updateIconEntry(index, 'linkUrl', value)}
                                        placeholder="https://example.com"
                                    />
                                    <SelectControl
                                        label={__('Link Target', 'social-banner-block')}
                                        value={entry.linkTarget || '_blank'}
                                        options={[
                                            { label: __('Same Window', 'social-banner-block'), value: '_self' },
                                            { label: __('New Window', 'social-banner-block'), value: '_blank' },
                                        ]}
                                        onChange={(value) => updateIconEntry(index, 'linkTarget', value)}
                                    />
                                </>
                            }
                        >
                        <IconWrapper
                                    className="adaire-social-banner__item"
                            {...linkProps}
                                    style={{
                                        backgroundColor: entry.backgroundColor || '#000000',
                                        borderRadius: `${borderRadius}px`,
                                        '--icon-color': entry.iconColor || '#ffffff',
                                    }}
                                >
                                    {entry.icon && (
                                        <i
                                            className={`adaire-social-banner__icon ${entry.icon}`}
                                    style={{
                                        fontSize: `${iconSize}px`,
                                                color: entry.iconColor || '#ffffff',
                                    }}
                                        ></i>
                                    )}
                        </IconWrapper>
                        </QuickZone>
                            );
                        })}
                        </div>
                    )}
            </div>
        </>
    );
}



