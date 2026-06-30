import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
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
    } = attributes;

    if (!blockId) {
        setAttributes({ blockId: clientId });
    }

    const blockProps = useBlockProps({
        className: `adaire-social-share adaire-social-share--align-${alignment}`,
        style: {
            '--share-icon-size': `${iconSize}px`,
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
            '--share-platform-font-size': `${platformFontSize ?? 14}px`,
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
                <PanelBody title={__('Button Settings', 'social-share-block')} initialOpen={true}>
                    <BaseControl label={__('Button Icon', 'social-share-block')}>
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
                                __('Choose Icon', 'social-share-block')
                            )}
                        </Button>
                        {buttonIcon && (
                            <Button
                                onClick={() => setAttributes({ buttonIcon: 'bi bi-share' })}
                                variant="link"
                                isDestructive
                                style={{ width: '100%' }}
                            >
                                {__('Reset to Default', 'social-share-block')}
                            </Button>
                        )}
                    </BaseControl>

                    <RangeControl
                        label={__('Icon Size', 'social-share-block')}
                        value={iconSize}
                        onChange={(value) => setAttributes({ iconSize: value })}
                        min={16}
                        max={64}
                    />

                    <BaseControl label={__('Icon Color', 'social-share-block')}>
                        <BoundColorPalette
                            value={iconColor}
                            onChange={(v) => setAttributes({ iconColor: v || "" })}
                        />
                    </BaseControl>

                    <SelectControl
                        label={__('Alignment', 'social-share-block')}
                        value={alignment}
                        options={[
                            { label: __('Left', 'social-share-block'), value: 'left' },
                            { label: __('Center', 'social-share-block'), value: 'center' },
                            { label: __('Right', 'social-share-block'), value: 'right' },
                        ]}
                        onChange={(value) => setAttributes({ alignment: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Button Styling', 'social-share-block')} initialOpen={false}>
                    <BaseControl label={__('Background Color', 'social-share-block')}>
                        <BoundColorPalette
                            value={buttonBackgroundColor || ""}
                            onChange={(v) => setAttributes({ buttonBackgroundColor: v || "" })}
                        />
                    </BaseControl>

                    <BaseControl label={__('Hover Background Color', 'social-share-block')}>
                        <BoundColorPalette
                            value={buttonHoverBackgroundColor || ""}
                            onChange={(v) => setAttributes({ buttonHoverBackgroundColor: v || "" })}
                        />
                    </BaseControl>

                    <BoxControl
                        label={__('Button Padding', 'social-share-block')}
                        values={buttonPadding}
                        onChange={(value) => setAttributes({ buttonPadding: value })}
                        units={[
                            { value: 'px', label: 'px', default: 12 },
                            { value: 'em', label: 'em', default: 0 },
                            { value: 'rem', label: 'rem', default: 0 },
                        ]}
                    />

                    <RangeControl
                        label={__('Border Radius', 'social-share-block')}
                        value={borderRadius}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0}
                        max={50}
                    />

                    <RangeControl
                        label={__('Border Width', 'social-share-block')}
                        value={borderWidth}
                        onChange={(value) => setAttributes({ borderWidth: value })}
                        min={0}
                        max={10}
                    />

                    {borderWidth > 0 && (
                        <BaseControl label={__('Border Color', 'social-share-block')}>
                            <BoundColorPalette
                                value={borderColor}
                                onChange={(v) => setAttributes({ borderColor: v || "" })}
                            />
                        </BaseControl>
                    )}
                </PanelBody>

                <PanelBody title={__('Typography', 'social-share-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Platform Label Font Size (px)', 'social-share-block')}
                        value={platformFontSize}
                        onChange={(value) => setAttributes({ platformFontSize: value })}
                        min={8}
                        max={32}
                        step={1}
                    />

                    <SelectControl
                        label={__('Platform Label Font Weight', 'social-share-block')}
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
                        label={__('Platform Label Line Height', 'social-share-block')}
                        value={platformLineHeight}
                        onChange={(value) => setAttributes({ platformLineHeight: value })}
                    />

                    <UnitControl
                        label={__('Platform Label Letter Spacing', 'social-share-block')}
                        value={platformLetterSpacing}
                        onChange={(value) => setAttributes({ platformLetterSpacing: value })}
                    />

                    <SelectControl
                        label={__('Platform Label Text Transform', 'social-share-block')}
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
                        label={__('Font Family', 'social-share-block')}
                        value={fontFamily || ''}
                        options={FONT_FAMILY_OPTIONS}
                        onChange={(value) => setAttributes({ fontFamily: value })}
                        help={__('Applies to the share platform labels.', 'social-share-block')}
                    />
                </PanelBody>

                <PanelBody title={__('Platform Settings', 'social-share-block')} initialOpen={true}>
                    <SelectControl
                        label={__('Tooltip Position', 'social-share-block')}
                        value={tooltipPosition}
                        options={[
                            { label: __('Top', 'social-share-block'), value: 'top' },
                            { label: __('Bottom', 'social-share-block'), value: 'bottom' },
                            { label: __('Left', 'social-share-block'), value: 'left' },
                            { label: __('Right', 'social-share-block'), value: 'right' },
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
                                    <BaseControl label={__('Icon', 'social-share-block')} style={{ marginTop: '12px' }}>
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
                                                __('Choose Icon', 'social-share-block')
                                            )}
                                        </Button>
                                    </BaseControl>

                                    <TextControl
                                        label={__('Label', 'social-share-block')}
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
                        <BaseControl label={__('Button Icon', 'social-share-block')}>
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
                                    __('Choose Icon', 'social-share-block')
                                )}
                            </Button>
                        </BaseControl>
                    }
                >
                <button
                    className="adaire-social-share__button"
                    type="button"
                    aria-label={__('Share', 'social-share-block')}
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
                                            <BaseControl label={__('Platform Icon', 'social-share-block')}>
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
                                                        __('Choose Icon', 'social-share-block')
                                                    )}
                                                </Button>
                                            </BaseControl>
                                            <TextControl
                                                label={__('Label', 'social-share-block')}
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
