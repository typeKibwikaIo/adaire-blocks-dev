import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    ColorPicker,
    BaseControl,
    Button,
    TextControl,
    SelectControl,
    ToggleControl,
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import BootstrapIconPicker from './BootstrapIconPicker';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import './editor.scss';

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
                        <ColorPicker
                            color={iconColor}
                            onChangeComplete={(color) => setAttributes({ iconColor: color.hex })}
                            disableAlpha
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
                        <ColorPicker
                            color={buttonBackgroundColor && buttonBackgroundColor !== 'transparent' ? buttonBackgroundColor : '#000000'}
                            onChangeComplete={(color) => {
                                const alpha = color.rgb.a !== undefined ? color.rgb.a : 1;
                                const colorValue = alpha < 1
                                    ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`
                                    : color.hex;
                                setAttributes({ buttonBackgroundColor: colorValue });
                            }}
                            enableAlpha={true}
                        />
                    </BaseControl>

                    <BaseControl label={__('Hover Background Color', 'social-share-block')}>
                        <ColorPicker
                            color={buttonHoverBackgroundColor && buttonHoverBackgroundColor !== 'transparent' ? buttonHoverBackgroundColor : '#000000'}
                            onChangeComplete={(color) => {
                                const alpha = color.rgb.a !== undefined ? color.rgb.a : 1;
                                const colorValue = alpha < 1
                                    ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`
                                    : color.hex;
                                setAttributes({ buttonHoverBackgroundColor: colorValue });
                            }}
                            enableAlpha={true}
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
                            <ColorPicker
                                color={borderColor}
                                onChangeComplete={(color) => setAttributes({ borderColor: color.hex })}
                                disableAlpha
                            />
                        </BaseControl>
                    )}
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




