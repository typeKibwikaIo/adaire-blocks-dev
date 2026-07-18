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
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { createElement } from '@wordpress/element';
import { plus, trash } from '@wordpress/icons';
import BootstrapIconPicker from './BootstrapIconPicker';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher from '../components/DeviceSwitcher';
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
    { key: 'mobile', icon: mobile, label: __('Mobile', 'adaire-blocks') },
    { key: 'tablet', icon: tablet, label: __('Tablet', 'adaire-blocks') },
    { key: 'smallLaptop', icon: smallLaptopIcon, label: __('Small Laptop', 'adaire-blocks') },
    { key: 'desktop', icon: desktop, label: __('Desktop', 'adaire-blocks') },
    { key: 'bigDesktop', icon: bigDesktopIcon, label: __('Big Desktop', 'adaire-blocks') }
];

const FONT_FAMILY_OPTIONS = [
    { label: 'Default (inherit theme)', value: '' },
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
    { label: 'Courier New', value: "'Courier New', Courier, monospace" },
    { label: 'System UI', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
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
        fontFamily,
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
            '--banner-font-family': fontFamily || 'inherit',
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
                <PanelBody section="layout" title={__('Position Settings', 'adaire-blocks')} initialOpen={true}>
                    <SelectControl
                        label={__('Position Type', 'adaire-blocks')}
                        value={positionType || 'fixed'}
                        options={[
                            { label: __('Fixed', 'adaire-blocks'), value: 'fixed' },
                            { label: __('Absolute', 'adaire-blocks'), value: 'absolute' },
                            { label: __('Relative', 'adaire-blocks'), value: 'relative' },
                        ]}
                        onChange={(value) => setAttributes({ positionType: value })}
                        help={__('Fixed: stays in place when scrolling. Absolute: positioned relative to nearest positioned ancestor. Relative: positioned relative to its normal position.', 'adaire-blocks')}
                    />

                    <SelectControl
                        label={__('Display Type', 'adaire-blocks')}
                        value={displayType || 'block'}
                        options={[
                            { label: __('Block', 'adaire-blocks'), value: 'block' },
                            { label: __('Inline', 'adaire-blocks'), value: 'inline' },
                        ]}
                        onChange={(value) => setAttributes({ displayType: value })}
                        help={__('Block: takes full width. Inline: only takes necessary width, allows easier positioning.', 'adaire-blocks')}
                    />

                    <SelectControl
                        label={__('Layout Direction', 'adaire-blocks')}
                        value={layoutDirection || 'column'}
                        options={[
                            { label: __('Column (Vertical)', 'adaire-blocks'), value: 'column' },
                            { label: __('Row (Horizontal)', 'adaire-blocks'), value: 'row' },
                        ]}
                        onChange={(value) => setAttributes({ layoutDirection: value })}
                    />

                    <SelectControl
                        label={__('Offset From', 'adaire-blocks')}
                        value={offsetFrom}
                        options={[
                            { label: __('Top', 'adaire-blocks'), value: 'top' },
                            { label: __('Bottom', 'adaire-blocks'), value: 'bottom' },
                        ]}
                        onChange={(value) => setAttributes({ offsetFrom: value })}
                    />

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <RangeControl
                                label={offsetFrom === 'top' ? __('Top Offset', 'adaire-blocks') : __('Bottom Offset', 'adaire-blocks')}
                                value={offset}
                                onChange={(value) => setAttributes({ offset: value })}
                                min={0}
                                max={offsetUnit === '%' ? 100 : 500}
                            />
                        </div>
                        <SelectControl
                            label={__('Unit', 'adaire-blocks')}
                            value={offsetUnit || 'px'}
                            options={[
                                { label: __('px', 'adaire-blocks'), value: 'px' },
                                { label: __('%', 'adaire-blocks'), value: '%' },
                            ]}
                            onChange={(value) => setAttributes({ offsetUnit: value })}
                            style={{ width: '80px' }}
                        />
                    </div>

                    <SelectControl
                        label={__('Horizontal Offset From', 'adaire-blocks')}
                        value={horizontalOffsetFrom || 'left'}
                        options={[
                            { label: __('Left', 'adaire-blocks'), value: 'left' },
                            { label: __('Right', 'adaire-blocks'), value: 'right' },
                        ]}
                        onChange={(value) => setAttributes({ horizontalOffsetFrom: value })}
                    />

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <RangeControl
                                label={horizontalOffsetFrom === 'left' ? __('Left Offset', 'adaire-blocks') : __('Right Offset', 'adaire-blocks')}
                                value={horizontalOffset || 0}
                                onChange={(value) => setAttributes({ horizontalOffset: value })}
                                min={0}
                                max={horizontalOffsetUnit === '%' ? 100 : 500}
                            />
                        </div>
                        <SelectControl
                            label={__('Unit', 'adaire-blocks')}
                            value={horizontalOffsetUnit || 'px'}
                            options={[
                                { label: __('px', 'adaire-blocks'), value: 'px' },
                                { label: __('%', 'adaire-blocks'), value: '%' },
                            ]}
                            onChange={(value) => setAttributes({ horizontalOffsetUnit: value })}
                            style={{ width: '80px' }}
                        />
                    </div>
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Background & Padding', 'adaire-blocks')} initialOpen={false}>
                  
                <div style={{ marginTop: '20px' }}>
                        <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                            {__('Current Breakpoint:', 'adaire-blocks')}{' '}
                            {BREAKPOINTS.find(bp => bp.key === deviceType)?.label || deviceType}
                        </p>
                        <DeviceSwitcher
                            deviceType={deviceType}
                            setDeviceType={setDeviceType}
                            tiers={BREAKPOINTS}
                        />

                        <BoxControl
                            label={__('Padding', 'adaire-blocks')}
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
                        title={__('Background Color', 'adaire-blocks')}
                        colorSettings={[
                            {
                                label: __('Background Color', 'adaire-blocks'),
                                value: backgroundColor || '',
                                onChange: (value) => setAttributes({ backgroundColor: value || '' }),
                            },
                        ]}
                    />

                    <RangeControl
                        label={__('Background Border Radius', 'adaire-blocks')}
                        value={backgroundBorderRadius || 0}
                        onChange={(value) => setAttributes({ backgroundBorderRadius: value })}
                        min={0}
                        max={50}
                    />


                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Typography', 'adaire-blocks')} initialOpen={false}>
                    <SelectControl
                        label={__('Font Family', 'adaire-blocks')}
                        value={fontFamily || ''}
                        options={FONT_FAMILY_OPTIONS}
                        onChange={(value) => setAttributes({ fontFamily: value })}
                        help={__('This block has no text content of its own; the font family applies to any inherited text (e.g. ARIA labels rendered by assistive tech) within it.', 'adaire-blocks')}
                    />
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Icon Settings', 'adaire-blocks')} initialOpen={true}>
                    <RangeControl
                        label={__('Icon Size', 'adaire-blocks')}
                        value={iconSize}
                        onChange={(value) => setAttributes({ iconSize: value })}
                        min={16}
                        max={64}
                    />

                    <RangeControl
                        label={__('Spacing Between Icons', 'adaire-blocks')}
                        value={spacing}
                        onChange={(value) => setAttributes({ spacing: value })}
                        min={0}
                        max={30}
                    />

                    <RangeControl
                        label={__('Border Radius', 'adaire-blocks')}
                        value={borderRadius}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0}
                        max={50}
                    />

                    <SelectControl
                        label={__('Hover Animation', 'adaire-blocks')}
                        value={hoverAnimation || 'up'}
                        options={[
                            { label: __('Up', 'adaire-blocks'), value: 'up' },
                            { label: __('Down', 'adaire-blocks'), value: 'down' },
                            { label: __('Left', 'adaire-blocks'), value: 'left' },
                            { label: __('Right', 'adaire-blocks'), value: 'right' },
                            { label: __('Pulse', 'adaire-blocks'), value: 'pulse' },
                            { label: __('Scale Up', 'adaire-blocks'), value: 'scale-up' },
                            { label: __('Scale Down', 'adaire-blocks'), value: 'scale-down' },
                            { label: __('Rotate', 'adaire-blocks'), value: 'rotate' },
                            { label: __('Shake', 'adaire-blocks'), value: 'shake' },
                            { label: __('Bounce', 'adaire-blocks'), value: 'bounce' },
                            { label: __('Glow', 'adaire-blocks'), value: 'glow' },
                            { label: __('None', 'adaire-blocks'), value: 'none' },
                        ]}
                        onChange={(value) => setAttributes({ hoverAnimation: value })}
                    />

                    <RangeControl
                        label={__('Animation Duration', 'adaire-blocks')}
                        value={animationDuration || 0.3}
                        onChange={(value) => setAttributes({ animationDuration: value })}
                        min={0.1}
                        max={2}
                        step={0.1}
                        help={__('Duration in seconds', 'adaire-blocks')}
                    />

                    <SelectControl
                        label={__('Animation Easing', 'adaire-blocks')}
                        value={animationEasing || 'ease'}
                        options={[
                            { label: __('Ease', 'adaire-blocks'), value: 'ease' },
                            { label: __('Ease In', 'adaire-blocks'), value: 'ease-in' },
                            { label: __('Ease Out', 'adaire-blocks'), value: 'ease-out' },
                            { label: __('Ease In Out', 'adaire-blocks'), value: 'ease-in-out' },
                            { label: __('Linear', 'adaire-blocks'), value: 'linear' },
                            { label: __('Cubic Bezier (Smooth)', 'adaire-blocks'), value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
                            { label: __('Cubic Bezier (Bounce)', 'adaire-blocks'), value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
                        ]}
                        onChange={(value) => setAttributes({ animationEasing: value })}
                    />
                </PanelBody>

                <PanelBody section="content" title={__('Icon Entries', 'adaire-blocks')} initialOpen={true}>
                    <Button
                        onClick={addIconEntry}
                        variant="primary"
                        icon={plus}
                        style={{ width: '100%', marginBottom: '16px' }}
                    >
                        {__('Add Icon Entry', 'adaire-blocks')}
                    </Button>

                    {iconEntries.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>
                            {__('No icon entries yet. Click "Add Icon Entry" to get started.', 'adaire-blocks')}
                        </p>
                    ) : (
                        iconEntries.map((entry, index) => (
                            <PanelBody
                                key={entry.id || index}
                                title={entry.icon 
                                    ? `${__('Icon Entry', 'adaire-blocks')} #${index + 1} - ${entry.icon.replace('bi bi-', '')}`
                                    : `${__('Icon Entry', 'adaire-blocks')} #${index + 1}`
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
                                        {__('Remove', 'adaire-blocks')}
                                    </Button>
                                </div>

                                <BaseControl label={__('Bootstrap Icon', 'adaire-blocks')}>
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
                                            __('Choose Icon', 'adaire-blocks')
                                        )}
                                    </Button>
                                </BaseControl>

                                <BaseControl label={__('Icon Color', 'adaire-blocks')}>
                                    <ColorPicker
                                        color={entry.iconColor || '#ffffff'}
                                        onChangeComplete={(color) => updateIconEntry(index, 'iconColor', color.hex)}
                                        disableAlpha
                                    />
                                </BaseControl>

                                <BaseControl label={__('Background Color', 'adaire-blocks')}>
                                    <ColorPicker
                                        color={entry.backgroundColor || '#000000'}
                                        onChangeComplete={(color) => updateIconEntry(index, 'backgroundColor', color.hex)}
                                        disableAlpha
                                    />
                                </BaseControl>

                                <TextControl
                                    label={__('Link URL', 'adaire-blocks')}
                                    value={entry.linkUrl || ''}
                                    onChange={(value) => updateIconEntry(index, 'linkUrl', value)}
                                    placeholder="https://example.com"
                                />

                                <SelectControl
                                    label={__('Link Target', 'adaire-blocks')}
                                    value={entry.linkTarget || '_blank'}
                                    options={[
                                        { label: __('Same Window', 'adaire-blocks'), value: '_self' },
                                        { label: __('New Window', 'adaire-blocks'), value: '_blank' },
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
                        <p>{__('Add icon entries from the settings panel to display the social banner.', 'adaire-blocks')}</p>
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
                                    <BaseControl label={__('Bootstrap Icon', 'adaire-blocks')}>
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
                                                __('Choose Icon', 'adaire-blocks')
                                            )}
                                        </Button>
                                    </BaseControl>
                                    <BaseControl label={__('Icon Color', 'adaire-blocks')}>
                                        <ColorPicker
                                            color={entry.iconColor || '#ffffff'}
                                            onChangeComplete={(color) => updateIconEntry(index, 'iconColor', color.hex)}
                                            disableAlpha
                                        />
                                    </BaseControl>
                                    <BaseControl label={__('Background Color', 'adaire-blocks')}>
                                        <ColorPicker
                                            color={entry.backgroundColor || '#000000'}
                                            onChangeComplete={(color) => updateIconEntry(index, 'backgroundColor', color.hex)}
                                            disableAlpha
                                        />
                                    </BaseControl>
                                    <TextControl
                                        label={__('Link URL', 'adaire-blocks')}
                                        value={entry.linkUrl || ''}
                                        onChange={(value) => updateIconEntry(index, 'linkUrl', value)}
                                        placeholder="https://example.com"
                                    />
                                    <SelectControl
                                        label={__('Link Target', 'adaire-blocks')}
                                        value={entry.linkTarget || '_blank'}
                                        options={[
                                            { label: __('Same Window', 'adaire-blocks'), value: '_self' },
                                            { label: __('New Window', 'adaire-blocks'), value: '_blank' },
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



