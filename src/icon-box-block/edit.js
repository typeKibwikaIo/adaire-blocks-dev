import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    BaseControl,
    Button,
    TextControl,
    SelectControl,
    ToggleControl,
    ButtonGroup,
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { getBlockType } from '@wordpress/blocks';
import BootstrapIconPicker from './BootstrapIconPicker';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher from '../components/DeviceSwitcher';
import BoundColorPalette from '../components/BoundColorPalette';
import './editor.scss';

const THREE_TIERS = [
    { key: 'desktop', label: __('Desktop', 'adaire-blocks'), icon: desktop },
    { key: 'tablet', label: __('Tablet', 'adaire-blocks'), icon: tablet },
    { key: 'mobile', label: __('Mobile', 'adaire-blocks'), icon: mobile },
];

export default function Edit({ attributes, setAttributes, clientId }) {
    const [deviceType, setDeviceType] = useState('desktop');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [activeZone, setActiveZone] = useState(null);

    const {
        blockId,
        iconSvg,
        iconName,
        chosenIcon,
        responsiveIconSize,
        iconColor,
        iconView,
        iconShape,
        iconFrameColor,
        backgroundColor,
        backgroundHoverColor,
        textColor,
        borderRadius,
        borderWidth,
        borderColor,
        alignment,
        linkUrl,
        linkTarget,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        title,
        description,
        showButton,
        buttonText,
        buttonBgColor,
        buttonTextColor,
    } = attributes;

    if (!blockId) {
        setAttributes({ blockId: clientId });
    }

    // Resets the given responsive attributes back to their block.json defaults —
    // existing values only, nothing new is added.
    const resetToDefaults = (keys) => {
        const blockType = getBlockType('create-block/icon-box-block');
        const defaults = blockType?.attributes || {};
        const resetValues = {};
        keys.forEach((key) => {
            if (defaults[key] && 'default' in defaults[key]) {
                resetValues[key] = defaults[key].default;
            }
        });
        setAttributes(resetValues);
    };

    const pt = paddingTop?.desktop ?? 40;
    const pr = paddingRight?.desktop ?? 40;
    const pb = paddingBottom?.desktop ?? 40;
    const pl = paddingLeft?.desktop ?? 40;

    const iconSizeDesktop = responsiveIconSize?.desktop ?? 64;
    const iconSizeTablet  = responsiveIconSize?.tablet  ?? iconSizeDesktop;
    const iconSizeMobile  = responsiveIconSize?.mobile  ?? iconSizeTablet;
    const currentIconSize = responsiveIconSize?.[deviceType] ?? iconSizeDesktop;
    const updateIconSize = (v) => setAttributes({
        responsiveIconSize: { ...responsiveIconSize, [deviceType]: v },
    });

    const blockProps = useBlockProps({
        className: `adaire-icon-box adaire-icon-box--align-${alignment}`,
        style: {
            '--icon-card-bg'      : backgroundColor || '#503AA8',
            '--icon-card-bg-hover': backgroundHoverColor || '#3d2c8d',
            '--icon-card-radius'  : `${borderRadius ?? 16}px`,
            '--icon-card-pt'      : `${paddingTop?.desktop  ?? 40}px`,
            '--icon-card-pr'      : `${paddingRight?.desktop ?? 40}px`,
            '--icon-card-pb'      : `${paddingBottom?.desktop ?? 40}px`,
            '--icon-card-pl'      : `${paddingLeft?.desktop  ?? 40}px`,
            '--icon-card-pt-t'    : `${paddingTop?.tablet  ?? pt}px`,
            '--icon-card-pr-t'    : `${paddingRight?.tablet ?? pr}px`,
            '--icon-card-pb-t'    : `${paddingBottom?.tablet ?? pb}px`,
            '--icon-card-pl-t'    : `${paddingLeft?.tablet  ?? pl}px`,
            '--icon-card-pt-m'    : `${paddingTop?.mobile  ?? paddingTop?.tablet  ?? pt}px`,
            '--icon-card-pr-m'    : `${paddingRight?.mobile ?? paddingRight?.tablet ?? pr}px`,
            '--icon-card-pb-m'    : `${paddingBottom?.mobile ?? paddingBottom?.tablet ?? pb}px`,
            '--icon-card-pl-m'    : `${paddingLeft?.mobile  ?? paddingLeft?.tablet  ?? pl}px`,
            '--icon-color'        : iconColor || '#ffffff',
            '--icon-size'         : `${iconSizeDesktop}px`,
            '--icon-size-t'       : `${iconSizeTablet}px`,
            '--icon-size-m'       : `${iconSizeMobile}px`,
            '--icon-frame-color'  : iconFrameColor || '#503AA8',
            '--icon-border-width' : `${borderWidth ?? 0}px`,
            '--icon-border-color' : borderColor || 'transparent',
            color                 : textColor || '#ffffff',
            marginTop             : `${marginTop?.desktop ?? 0}px`,
            marginRight           : `${marginRight?.desktop ?? 0}px`,
            marginBottom          : `${marginBottom?.desktop ?? 0}px`,
            marginLeft            : `${marginLeft?.desktop ?? 0}px`,
        },
    });

    const hasIcon = (chosenIcon && chosenIcon.trim()) || (iconSvg && iconSvg.trim());

    return (
        <>
            <InspectorTabs attributes={attributes} setAttributes={setAttributes}>
                <PanelBody section="content" title={__('Icon', 'adaire-blocks')} initialOpen={true}>
                    <BaseControl label={__('Bootstrap Icon', 'adaire-blocks')}>
                        <Button
                            onClick={() => setIsIconPickerOpen(true)}
                            variant="secondary"
                            style={{ width: '100%', marginBottom: '12px' }}
                        >
                            {chosenIcon ? (
                                <>
                                    <i className={chosenIcon} style={{ marginRight: '8px' }}></i>
                                    {chosenIcon}
                                </>
                            ) : (
                                __('Choose Bootstrap Icon', 'adaire-blocks')
                            )}
                        </Button>
                        {chosenIcon && (
                            <Button
                                onClick={() => setAttributes({ chosenIcon: '' })}
                                variant="link"
                                isDestructive
                                style={{ width: '100%' }}
                            >
                                {__('Remove Icon', 'adaire-blocks')}
                            </Button>
                        )}
                    </BaseControl>
                </PanelBody>

                <PanelBody section="layout" title={__('Layout', 'adaire-blocks')} initialOpen={false}>
                    <SelectControl
                        label={__('Alignment', 'adaire-blocks')}
                        value={alignment}
                        options={[
                            { label: __('Left', 'adaire-blocks'), value: 'left' },
                            { label: __('Center', 'adaire-blocks'), value: 'center' },
                            { label: __('Right', 'adaire-blocks'), value: 'right' },
                        ]}
                        onChange={(v) => setAttributes({ alignment: v })}
                    />
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Icon Style', 'adaire-blocks')} initialOpen={false}>
                    <SelectControl
                        label={__('Icon View', 'adaire-blocks')}
                        value={iconView || 'default'}
                        options={[
                            { label: __('Default', 'adaire-blocks'), value: 'default' },
                            { label: __('Framed', 'adaire-blocks'), value: 'framed' },
                            { label: __('Stacked', 'adaire-blocks'), value: 'stacked' },
                        ]}
                        onChange={(v) => setAttributes({ iconView: v })}
                        help={__('Framed outlines a shape around the icon; Stacked fills it with a solid background.', 'adaire-blocks')}
                    />

                    {iconView && iconView !== 'default' && (
                        <>
                            <SelectControl
                                label={__('Icon Shape', 'adaire-blocks')}
                                value={iconShape || 'circle'}
                                options={[
                                    { label: __('Circle', 'adaire-blocks'), value: 'circle' },
                                    { label: __('Square', 'adaire-blocks'), value: 'square' },
                                ]}
                                onChange={(v) => setAttributes({ iconShape: v })}
                            />
                            <BaseControl label={__('Icon Frame Color', 'adaire-blocks')}>
                                <BoundColorPalette
                                    value={iconFrameColor}
                                    onChange={(v) => setAttributes({ iconFrameColor: v || "" })}
                                />
                            </BaseControl>
                        </>
                    )}

                    <DeviceSwitcher
                        deviceType={deviceType}
                        setDeviceType={setDeviceType}
                        tiers={THREE_TIERS}
                        onReset={() => resetToDefaults(['responsiveIconSize'])}
                    />


                    <RangeControl
                        label={__('Icon Size', 'adaire-blocks')}
                        value={currentIconSize}
                        onChange={updateIconSize}
                        min={16}
                        max={200}
                    />

                    <BaseControl label={__('Icon Color', 'adaire-blocks')}>
                        <BoundColorPalette
                            value={iconColor}
                            onChange={(v) => setAttributes({ iconColor: v || "" })}
                        />
                    </BaseControl>
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Card Style', 'adaire-blocks')} initialOpen={false}>
                    <BaseControl label={__('Background Color', 'adaire-blocks')}>
                        <BoundColorPalette
                            value={backgroundColor || ""}
                            onChange={(v) => setAttributes({ backgroundColor: v || "" })}
                        />
                    </BaseControl>
                    <BaseControl label={__('Background Hover Color', 'adaire-blocks')}>
                        <BoundColorPalette
                            value={backgroundHoverColor || ""}
                            onChange={(v) => setAttributes({ backgroundHoverColor: v || "" })}
                        />
                    </BaseControl>
                    <BaseControl label={__('Text Color', 'adaire-blocks')}>
                        <BoundColorPalette
                            value={textColor || ""}
                            onChange={(v) => setAttributes({ textColor: v || "" })}
                        />
                    </BaseControl>
                    <RangeControl
                        label={__('Border Radius (px)', 'adaire-blocks')}
                        value={borderRadius}
                        onChange={(v) => setAttributes({ borderRadius: v })}
                        min={0}
                        max={60}
                    />
                    <RangeControl
                        label={__('Border Width (px)', 'adaire-blocks')}
                        value={borderWidth}
                        onChange={(v) => setAttributes({ borderWidth: v })}
                        min={0}
                        max={10}
                    />
                    {borderWidth > 0 && (
                        <BaseControl label={__('Border Color', 'adaire-blocks')}>
                            <BoundColorPalette
                                value={borderColor || ""}
                                onChange={(v) => setAttributes({ borderColor: v || "" })}
                            />
                        </BaseControl>
                    )}
                </PanelBody>

                <PanelBody section="content" title={__('Button', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl
                        label={__('Show Button', 'adaire-blocks')}
                        checked={showButton !== false}
                        onChange={(v) => setAttributes({ showButton: v })}
                    />
                    {showButton !== false && (
                        <>
                            <TextControl
                                label={__('Button Text', 'adaire-blocks')}
                                value={buttonText || ''}
                                onChange={(v) => setAttributes({ buttonText: v })}
                            />
                            <TextControl
                                label={__('Button URL', 'adaire-blocks')}
                                value={linkUrl || ''}
                                onChange={(v) => setAttributes({ linkUrl: v })}
                                placeholder="https://"
                            />
                            <SelectControl
                                label={__('Open in', 'adaire-blocks')}
                                value={linkTarget}
                                options={[
                                    { label: __('Same window', 'adaire-blocks'), value: '_self' },
                                    { label: __('New window', 'adaire-blocks'), value: '_blank' },
                                ]}
                                onChange={(v) => setAttributes({ linkTarget: v })}
                            />
                        </>
                    )}
                </PanelBody>

                {showButton !== false && (
                    <PanelBody section="style" priority="high" title={__('Button Style', 'adaire-blocks')} initialOpen={false}>
                        <BaseControl label={__('Button Background', 'adaire-blocks')}>
                            <BoundColorPalette
                                value={buttonBgColor || ""}
                                onChange={(v) => setAttributes({ buttonBgColor: v || "" })}
                            />
                        </BaseControl>
                        <BaseControl label={__('Button Text Color', 'adaire-blocks')}>
                            <BoundColorPalette
                                value={buttonTextColor || ""}
                                onChange={(v) => setAttributes({ buttonTextColor: v || "" })}
                            />
                        </BaseControl>
                    </PanelBody>
                )}

                <PanelBody section="style" priority="medium" title={__('Spacing', 'adaire-blocks')} initialOpen={false}>
                    <DeviceSwitcher
                        deviceType={deviceType}
                        setDeviceType={setDeviceType}
                        tiers={THREE_TIERS}
                        onReset={() => resetToDefaults(['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'])}
                    />

                    <BoxControl
                        label={__('Padding', 'adaire-blocks')}
                        values={{
                            top:    paddingTop?.[deviceType]    ?? paddingTop?.desktop    ?? 40,
                            right:  paddingRight?.[deviceType]  ?? paddingRight?.desktop  ?? 40,
                            bottom: paddingBottom?.[deviceType] ?? paddingBottom?.desktop ?? 40,
                            left:   paddingLeft?.[deviceType]   ?? paddingLeft?.desktop   ?? 40,
                        }}
                        onChange={(v) => setAttributes({
                            paddingTop:    { ...paddingTop,    [deviceType]: parseInt(v.top)    || 0 },
                            paddingRight:  { ...paddingRight,  [deviceType]: parseInt(v.right)  || 0 },
                            paddingBottom: { ...paddingBottom, [deviceType]: parseInt(v.bottom) || 0 },
                            paddingLeft:   { ...paddingLeft,   [deviceType]: parseInt(v.left)   || 0 },
                        })}
                    />

                    <BoxControl
                        label={__('Margin', 'adaire-blocks')}
                        values={{
                            top:    marginTop?.[deviceType]    ?? marginTop?.desktop    ?? 0,
                            right:  marginRight?.[deviceType]  ?? marginRight?.desktop  ?? 0,
                            bottom: marginBottom?.[deviceType] ?? marginBottom?.desktop ?? 0,
                            left:   marginLeft?.[deviceType]   ?? marginLeft?.desktop   ?? 0,
                        }}
                        onChange={(v) => setAttributes({
                            marginTop:    { ...marginTop,    [deviceType]: parseInt(v.top)    || 0 },
                            marginRight:  { ...marginRight,  [deviceType]: parseInt(v.right)  || 0 },
                            marginBottom: { ...marginBottom, [deviceType]: parseInt(v.bottom) || 0 },
                            marginLeft:   { ...marginLeft,   [deviceType]: parseInt(v.left)   || 0 },
                        })}
                    />
                </PanelBody>
            </InspectorTabs>

            <BootstrapIconPicker
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                onSelect={(iconClass) => setAttributes({ chosenIcon: iconClass })}
                currentIcon={chosenIcon}
            />

            <div {...blockProps}>
                {hasIcon && (
                    <QuickZone
                        id="icon"
                        label="Icon"
                        activeZone={activeZone}
                        setActiveZone={setActiveZone}
                        content={
                            <>
                                <Button
                                    onClick={() => setIsIconPickerOpen(true)}
                                    variant="secondary"
                                    style={{ width: '100%', marginBottom: '8px' }}
                                >
                                    {__('Change Icon', 'adaire-blocks')}
                                </Button>
                                <SelectControl
                                    label={__('Icon View', 'adaire-blocks')}
                                    value={iconView || 'default'}
                                    options={[
                                        { label: __('Default', 'adaire-blocks'), value: 'default' },
                                        { label: __('Framed', 'adaire-blocks'), value: 'framed' },
                                        { label: __('Stacked', 'adaire-blocks'), value: 'stacked' },
                                    ]}
                                    onChange={(v) => setAttributes({ iconView: v })}
                                />
                                <RangeControl
                                    label={__('Icon Size', 'adaire-blocks') + ` (${THREE_TIERS.find(t => t.key === deviceType)?.label})`}
                                    value={currentIconSize}
                                    onChange={updateIconSize}
                                    min={16}
                                    max={200}
                                />
                            </>
                        }
                    >
                        <div className="adaire-icon-box__icon-area">
                            <div className={`adaire-icon-box__icon-frame is-view-${iconView || 'default'} is-shape-${iconShape || 'circle'}`}>
                                {chosenIcon && chosenIcon.trim() ? (
                                    <i className={`adaire-icon-box__icon ${chosenIcon}`}></i>
                                ) : iconSvg ? (
                                    <span
                                        className="adaire-icon-box__icon"
                                        dangerouslySetInnerHTML={{ __html: iconSvg }}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </QuickZone>
                )}

                {!hasIcon && (
                    <button
                        className="adaire-icon-box__add-icon"
                        onClick={() => setIsIconPickerOpen(true)}
                        type="button"
                    >
                        {__('+ Add Icon', 'adaire-blocks')}
                    </button>
                )}

                <RichText
                    tagName="h3"
                    className="adaire-icon-box__title"
                    value={title}
                    onChange={(v) => setAttributes({ title: v })}
                    placeholder={__('Card title…', 'adaire-blocks')}
                />

                <RichText
                    tagName="p"
                    className="adaire-icon-box__description"
                    value={description}
                    onChange={(v) => setAttributes({ description: v })}
                    placeholder={__('Description…', 'adaire-blocks')}
                />

                {showButton !== false && (
                    <span
                        className="adaire-icon-box__btn"
                        style={{
                            backgroundColor: buttonBgColor || '#ffffff',
                            color: buttonTextColor || '#503AA8',
                        }}
                    >
                        {buttonText || __('Learn More', 'adaire-blocks')}
                    </span>
                )}
            </div>
        </>
    );
}
