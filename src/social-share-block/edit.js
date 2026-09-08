import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockProps, ColorPalette } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    BaseControl,
    Button,
    TextControl,
    SelectControl,
    ToggleControl,
    __experimentalBoxControl as BoxControl,
    __experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import BootstrapIconPicker from './BootstrapIconPicker';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import './editor.scss';
import BoundColorPalette from '../components/BoundColorPalette';
import DeviceSwitcher, { BreakpointNote, THREE_TIERS } from '../components/DeviceSwitcher';
import useEditorDevice, { hasCanvasPreset } from '../components/useEditorDevice';

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

const PLATFORMS = [
    { key: 'facebook', defaultIcon: 'bi bi-facebook', defaultLabel: 'Facebook' },
    { key: 'x', defaultIcon: 'bi bi-twitter-x', defaultLabel: 'X (Twitter)' },
    { key: 'linkedin', defaultIcon: 'bi bi-linkedin', defaultLabel: 'LinkedIn' },
    { key: 'whatsapp', defaultIcon: 'bi bi-whatsapp', defaultLabel: 'WhatsApp' },
    { key: 'telegram', defaultIcon: 'bi bi-telegram', defaultLabel: 'Telegram' },
    { key: 'reddit', defaultIcon: 'bi bi-reddit', defaultLabel: 'Reddit' },
    { key: 'pinterest', defaultIcon: 'bi bi-pinterest', defaultLabel: 'Pinterest' },
    { key: 'email', defaultIcon: 'bi bi-envelope', defaultLabel: 'Email' },
];

export default function Edit({ attributes, setAttributes, clientId }) {
    const [isButtonIconPickerOpen, setIsButtonIconPickerOpen] = useState(false);
    const [platformIconPickerOpen, setPlatformIconPickerOpen] = useState(null);
    const [activeZone, setActiveZone] = useState(null);
    const [deviceType, setDeviceType] = useState('desktop');
    useEditorDevice(deviceType, setDeviceType);

    const {
        blockId,
        buttonIcon,
        iconColor,
        iconSize,
        buttonBackgroundColor,
        buttonHoverBackgroundColor,
        buttonPadding,
        borderRadius,
        borderWidth,
        borderColor,
        alignment,
        enabledPlatforms,
        platformIcons,
        platformLabels,
        tooltipPosition,
        fontFamily,
        platformFontSize,
        platformFontWeight,
        platformLineHeight,
        platformLetterSpacing,
        platformTextTransform,
        responsiveIconSize,
        responsivePlatformFontSize,
    } = attributes;

    if (!blockId) {
        setAttributes({ blockId: clientId });
    }

    const updateResponsive = (attrName, value) => setAttributes({
        [attrName]: { ...(attributes[attrName] || {}), [deviceType]: value },
    });

    const rIconSize = responsiveIconSize || {};
    const rPlatformFontSize = responsivePlatformFontSize || {};

    const blockProps = useBlockProps({
        className: `adaire-social-share adaire-social-share--align-${alignment}`,
        style: {
            '--share-icon-size-desktop': `${rIconSize.desktop ?? iconSize}px`,
            '--share-icon-size-tablet': `${rIconSize.tablet ?? rIconSize.desktop ?? iconSize}px`,
            '--share-icon-size-mobile': `${rIconSize.mobile ?? rIconSize.tablet ?? rIconSize.desktop ?? iconSize}px`,
            '--share-icon-color': iconColor,
            '--share-button-bg': buttonBackgroundColor,
            '--share-button-bg-hover': buttonHoverBackgroundColor,
            '--share-button-padding-top': buttonPadding?.top || '12px',
            '--share-button-padding-right': buttonPadding?.right || '12px',
            '--share-button-padding-bottom': buttonPadding?.bottom || '12px',
            '--share-button-padding-left': buttonPadding?.left || '12px',
            '--share-border-radius': `${borderRadius}px`,
            '--share-border-width': `${borderWidth}px`,
            '--share-border-color': borderColor,
            '--share-font-family': fontFamily || '',
            '--share-platform-font-size-desktop': `${rPlatformFontSize.desktop ?? platformFontSize ?? 14}px`,
            '--share-platform-font-size-tablet': `${rPlatformFontSize.tablet ?? rPlatformFontSize.desktop ?? platformFontSize ?? 14}px`,
            '--share-platform-font-size-mobile': `${rPlatformFontSize.mobile ?? rPlatformFontSize.tablet ?? rPlatformFontSize.desktop ?? platformFontSize ?? 14}px`,
            '--share-platform-font-weight': platformFontWeight || '400',
            '--share-platform-line-height': platformLineHeight || '1.4',
            '--share-platform-letter-spacing': platformLetterSpacing || 'normal',
            '--share-platform-text-transform': platformTextTransform || 'none',
        },
    });

    const handlePlatformToggle = (platformKey) => {
        setAttributes({
            enabledPlatforms: {
                ...enabledPlatforms,
                [platformKey]: !enabledPlatforms[platformKey],
            },
        });
    };

    const handlePlatformIconSelect = (platformKey, iconClass) => {
        setAttributes({
            platformIcons: {
                ...platformIcons,
                [platformKey]: iconClass,
            },
        });
        setPlatformIconPickerOpen(null);
    };

    const handlePlatformLabelChange = (platformKey, label) => {
        setAttributes({
            platformLabels: {
                ...platformLabels,
                [platformKey]: label,
            },
        });
    };

    return (
        <>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
                <PanelBody section="layout" title={__('Button Settings', 'adaire-blocks')} initialOpen={true}>
                    <BaseControl label={__('Button Icon', 'adaire-blocks')}>
                        <Button
                            onClick={() => setIsButtonIconPickerOpen(true)}
                            variant="secondary"
                            style={{ width: '100%', marginBottom: '12px' }}
                        >
                            {buttonIcon ? (
                                <>
                                    <i className={buttonIcon} style={{ marginRight: '8px' }}></i>
                                    {buttonIcon}
                                </>
                            ) : (
                                __('Choose Icon', 'adaire-blocks')
                            )}
                        </Button>
                        {buttonIcon && (
                            <Button
                                onClick={() => setAttributes({ buttonIcon: 'bi bi-share' })}
                                variant="link"
                                isDestructive
                                style={{ width: '100%' }}
                            >
                                {__('Reset to Default', 'adaire-blocks')}
                            </Button>
                        )}
                    </BaseControl>

                    <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} tiers={THREE_TIERS} />
                    <BreakpointNote deviceType={deviceType} tiers={THREE_TIERS} />
                    {!hasCanvasPreset(deviceType) && (
                        <p className="components-base-control__help">{__('This breakpoint has no matching canvas preview width — the editor canvas will not resize to match while you edit it.', 'adaire-blocks')}</p>
                    )}
                    <RangeControl
                        label={__('Icon Size', 'adaire-blocks')}
                        value={rIconSize[deviceType] ?? rIconSize.desktop ?? iconSize}
                        onChange={(value) => updateResponsive('responsiveIconSize', value)}
                        min={16}
                        max={64}
                    />

                    <BaseControl label={__('Icon Color', 'adaire-blocks')}>
                        <BoundColorPalette
                            value={iconColor}
                            onChange={(v) => setAttributes({ iconColor: v || "" })}
                        />
                    </BaseControl>

                    <SelectControl
                        label={__('Alignment', 'adaire-blocks')}
                        value={alignment}
                        options={[
                            { label: __('Left', 'adaire-blocks'), value: 'left' },
                            { label: __('Center', 'adaire-blocks'), value: 'center' },
                            { label: __('Right', 'adaire-blocks'), value: 'right' },
                        ]}
                        onChange={(value) => setAttributes({ alignment: value })}
                    />
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Button Styling', 'adaire-blocks')} initialOpen={false}>
                    <BaseControl label={__('Background Color', 'adaire-blocks')}>
                        <BoundColorPalette
                            value={buttonBackgroundColor || ""}
                            onChange={(v) => setAttributes({ buttonBackgroundColor: v || "" })}
                        />
                    </BaseControl>

                    <BaseControl label={__('Hover Background Color', 'adaire-blocks')}>
                        <BoundColorPalette
                            value={buttonHoverBackgroundColor || ""}
                            onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || "" })}
                        />
                    </BaseControl>

                    <BoxControl
                        label={__('Button Padding', 'adaire-blocks')}
                        values={buttonPadding}
                        onChange={(value) => setAttributes({ buttonPadding: value })}
                        units={[
                            { value: 'px', label: 'px', default: 12 },
                            { value: 'em', label: 'em', default: 0 },
                            { value: 'rem', label: 'rem', default: 0 },
                        ]}
                    />

                    <RangeControl
                        label={__('Border Radius', 'adaire-blocks')}
                        value={borderRadius}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0}
                        max={50}
                    />

                    <RangeControl
                        label={__('Border Width', 'adaire-blocks')}
                        value={borderWidth}
                        onChange={(value) => setAttributes({ borderWidth: value })}
                        min={0}
                        max={10}
                    />

                    {borderWidth > 0 && (
                        <BaseControl label={__('Border Color', 'adaire-blocks')}>
                            <BoundColorPalette
                                value={borderColor}
                                onChange={(v) => setAttributes({ borderColor: v || "" })}
                            />
                        </BaseControl>
                    )}
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Typography', 'adaire-blocks')} initialOpen={false}>
                    <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} tiers={THREE_TIERS} />
                    <BreakpointNote deviceType={deviceType} tiers={THREE_TIERS} />
                    <RangeControl
                        label={__('Platform Label Font Size (px)', 'adaire-blocks')}
                        value={rPlatformFontSize[deviceType] ?? rPlatformFontSize.desktop ?? platformFontSize}
                        onChange={(value) => updateResponsive('responsivePlatformFontSize', value)}
                        min={8}
                        max={32}
                        step={1}
                    />

                    <SelectControl
                        label={__('Platform Label Font Weight', 'adaire-blocks')}
                        value={platformFontWeight}
                        options={[
                            { label: 'Thin (100)', value: '100' },
                            { label: 'Extra Light (200)', value: '200' },
                            { label: 'Light (300)', value: '300' },
                            { label: 'Normal (400)', value: '400' },
                            { label: 'Medium (500)', value: '500' },
                            { label: 'Semi Bold (600)', value: '600' },
                            { label: 'Bold (700)', value: '700' },
                            { label: 'Extra Bold (800)', value: '800' },
                            { label: 'Black (900)', value: '900' },
                        ]}
                        onChange={(value) => setAttributes({ platformFontWeight: value })}
                    />

                    <UnitControl
                        label={__('Platform Label Line Height', 'adaire-blocks')}
                        value={platformLineHeight}
                        onChange={(value) => setAttributes({ platformLineHeight: value })}
                    />

                    <UnitControl
                        label={__('Platform Label Letter Spacing', 'adaire-blocks')}
                        value={platformLetterSpacing}
                        onChange={(value) => setAttributes({ platformLetterSpacing: value })}
                    />

                    <SelectControl
                        label={__('Platform Label Text Transform', 'adaire-blocks')}
                        value={platformTextTransform}
                        options={[
                            { label: 'None', value: 'none' },
                            { label: 'Uppercase', value: 'uppercase' },
                            { label: 'Lowercase', value: 'lowercase' },
                            { label: 'Capitalize', value: 'capitalize' },
                        ]}
                        onChange={(value) => setAttributes({ platformTextTransform: value })}
                    />

                    <SelectControl
                        label={__('Font Family', 'adaire-blocks')}
                        value={fontFamily || ''}
                        options={FONT_FAMILY_OPTIONS}
                        onChange={(value) => setAttributes({ fontFamily: value })}
                        help={__('Applies to the share platform labels.', 'adaire-blocks')}
                    />
                </PanelBody>

                <PanelBody section="content" title={__('Platform Settings', 'adaire-blocks')} initialOpen={true}>
                    <SelectControl
                        label={__('Tooltip Position', 'adaire-blocks')}
                        value={tooltipPosition}
                        options={[
                            { label: __('Top', 'adaire-blocks'), value: 'top' },
                            { label: __('Bottom', 'adaire-blocks'), value: 'bottom' },
                            { label: __('Left', 'adaire-blocks'), value: 'left' },
                            { label: __('Right', 'adaire-blocks'), value: 'right' },
                        ]}
                        onChange={(value) => setAttributes({ tooltipPosition: value })}
                    />

                    {PLATFORMS.map((platform) => (
                        <div key={platform.key} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <ToggleControl
                                label={platform.defaultLabel}
                                checked={enabledPlatforms[platform.key] || false}
                                onChange={() => handlePlatformToggle(platform.key)}
                            />

                            {enabledPlatforms[platform.key] && (
                                <>
                                    <BaseControl label={__('Icon', 'adaire-blocks')} style={{ marginTop: '12px' }}>
                                        <Button
                                            onClick={() => setPlatformIconPickerOpen(platform.key)}
                                            variant="secondary"
                                            isSmall
                                            style={{ width: '100%', marginBottom: '8px' }}
                                        >
                                            {platformIcons[platform.key] ? (
                                                <>
                                                    <i className={platformIcons[platform.key]} style={{ marginRight: '8px' }}></i>
                                                    {platformIcons[platform.key]}
                                                </>
                                            ) : (
                                                __('Choose Icon', 'adaire-blocks')
                                            )}
                                        </Button>
                                    </BaseControl>

                                    <TextControl
                                        label={__('Label', 'adaire-blocks')}
                                        value={platformLabels[platform.key] || platform.defaultLabel}
                                        onChange={(value) => handlePlatformLabelChange(platform.key, value)}
                                    />
                                </>
                            )}
                        </div>
                    ))}
                </PanelBody>
            </InspectorTabs>

            <BootstrapIconPicker
                isOpen={isButtonIconPickerOpen}
                onClose={() => setIsButtonIconPickerOpen(false)}
                onSelect={(iconClass) => {
                    setAttributes({ buttonIcon: iconClass });
                    setIsButtonIconPickerOpen(false);
                }}
                currentIcon={buttonIcon}
            />

            {platformIconPickerOpen && (
                <BootstrapIconPicker
                    isOpen={true}
                    onClose={() => setPlatformIconPickerOpen(null)}
                    onSelect={(iconClass) => handlePlatformIconSelect(platformIconPickerOpen, iconClass)}
                    currentIcon={platformIcons[platformIconPickerOpen]}
                />
            )}

            <div {...blockProps}>
                <QuickZone
                    id="share-button"
                    label="Share Button"
                    activeZone={activeZone}
                    setActiveZone={setActiveZone}
                    content={
                        <BaseControl label={__('Button Icon', 'adaire-blocks')}>
                            <Button
                                onClick={() => setIsButtonIconPickerOpen(true)}
                                variant="secondary"
                                style={{ width: '100%' }}
                            >
                                {buttonIcon ? (
                                    <>
                                        <i className={buttonIcon} style={{ marginRight: '8px' }}></i>
                                        {buttonIcon}
                                    </>
                                ) : (
                                    __('Choose Icon', 'adaire-blocks')
                                )}
                            </Button>
                        </BaseControl>
                    }
                >
                <button
                    className="adaire-social-share__button"
                    type="button"
                    aria-label={__('Share', 'adaire-blocks')}
                >
                    <i className={buttonIcon || 'bi bi-share'}></i>
                </button>
                </QuickZone>
                <div className="adaire-social-share__tooltip" style={{ display: 'none' }}>
                    <div className="adaire-social-share__platforms">
                        {PLATFORMS.map((platform) => {
                            if (!enabledPlatforms[platform.key]) return null;
                            return (
                                <QuickZone
                                    key={platform.key}
                                    id={`social-platform-${platform.key}`}
                                    label={platformLabels[platform.key] || platform.defaultLabel}
                                    activeZone={activeZone}
                                    setActiveZone={setActiveZone}
                                    content={
                                        <>
                                            <BaseControl label={__('Platform Icon', 'adaire-blocks')}>
                                                <Button
                                                    onClick={() => setPlatformIconPickerOpen(platform.key)}
                                                    variant="secondary"
                                                    style={{ width: '100%', marginBottom: '8px' }}
                                                >
                                                    {platformIcons[platform.key] ? (
                                                        <>
                                                            <i className={platformIcons[platform.key]} style={{ marginRight: '8px' }}></i>
                                                            {platformIcons[platform.key]}
                                                        </>
                                                    ) : (
                                                        __('Choose Icon', 'adaire-blocks')
                                                    )}
                                                </Button>
                                            </BaseControl>
                                            <TextControl
                                                label={__('Label', 'adaire-blocks')}
                                                value={platformLabels[platform.key] || platform.defaultLabel}
                                                onChange={(value) => handlePlatformLabelChange(platform.key, value)}
                                            />
                                        </>
                                    }
                                >
                                <a
                                    href="#"
                                    className="adaire-social-share__platform"
                                    data-platform={platform.key}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <i className={platformIcons[platform.key] || platform.defaultIcon}></i>
                                    <span>{platformLabels[platform.key] || platform.defaultLabel}</span>
                                </a>
                                </QuickZone>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
