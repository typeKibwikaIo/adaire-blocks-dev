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
    { key: 'desktop', label: __('Desktop', 'icon-box-block'), icon: desktop },
    { key: 'tablet', label: __('Tablet', 'icon-box-block'), icon: tablet },
    { key: 'mobile', label: __('Mobile', 'icon-box-block'), icon: mobile },
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
        iconSize,
        iconColor,
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
            '--icon-size'         : `${iconSize ?? 64}px`,
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
                <PanelBody section="content" title={__('Icon', 'icon-box-block')} initialOpen={true}>
                    <BaseControl label={__('Bootstrap Icon', 'icon-box-block')}>
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
                                __('Choose Bootstrap Icon', 'icon-box-block')
                            )}
                        </Button>
                        {chosenIcon && (
                            <Button
                                onClick={() => setAttributes({ chosenIcon: '' })}
                                variant="link"
                                isDestructive
                                style={{ width: '100%' }}
                            >
                                {__('Remove Icon', 'icon-box-block')}
                            </Button>
                        )}
                    </BaseControl>
                </PanelBody>

                <PanelBody section="layout" title={__('Layout', 'icon-box-block')} initialOpen={false}>
                    <SelectControl
                        label={__('Alignment', 'icon-box-block')}
                        value={alignment}
                        options={[
                            { label: __('Left', 'icon-box-block'), value: 'left' },
                            { label: __('Center', 'icon-box-block'), value: 'center' },
                            { label: __('Right', 'icon-box-block'), value: 'right' },
                        ]}
                        onChange={(v) => setAttributes({ alignment: v })}
                    />
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Icon Style', 'icon-box-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Icon Size', 'icon-box-block')}
                        value={iconSize}
                        onChange={(v) => setAttributes({ iconSize: v })}
                        min={16}
                        max={200}
                    />

                    <BaseControl label={__('Icon Color', 'icon-box-block')}>
                        <BoundColorPalette
                            value={iconColor}
                            onChange={(v) => setAttributes({ iconColor: v || "" })}
                        />
                    </BaseControl>
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Card Style', 'icon-box-block')} initialOpen={false}>
                    <BaseControl label={__('Background Color', 'icon-box-block')}>
                        <BoundColorPalette
                            value={backgroundColor || ""}
                            onChange={(v) => setAttributes({ backgroundColor: v || "" })}
                        />
                    </BaseControl>
                    <BaseControl label={__('Background Hover Color', 'icon-box-block')}>
                        <BoundColorPalette
                            value={backgroundHoverColor || ""}
                            onChange={(v) => setAttributes({ backgroundHoverColor: v || "" })}
                        />
                    </BaseControl>
                    <BaseControl label={__('Text Color', 'icon-box-block')}>
                        <BoundColorPalette
                            value={textColor || ""}
                            onChange={(v) => setAttributes({ textColor: v || "" })}
                        />
                    </BaseControl>
                    <RangeControl
                        label={__('Border Radius (px)', 'icon-box-block')}
                        value={borderRadius}
                        onChange={(v) => setAttributes({ borderRadius: v })}
                        min={0}
                        max={60}
                    />
                    <RangeControl
                        label={__('Border Width (px)', 'icon-box-block')}
                        value={borderWidth}
                        onChange={(v) => setAttributes({ borderWidth: v })}
                        min={0}
                        max={10}
                    />
                    {borderWidth > 0 && (
                        <BaseControl label={__('Border Color', 'icon-box-block')}>
                            <BoundColorPalette
                                value={borderColor || ""}
                                onChange={(v) => setAttributes({ borderColor: v || "" })}
                            />
                        </BaseControl>
                    )}
                </PanelBody>

                <PanelBody section="content" title={__('Button', 'icon-box-block')} initialOpen={false}>
                    <ToggleControl
                        label={__('Show Button', 'icon-box-block')}
                        checked={showButton !== false}
                        onChange={(v) => setAttributes({ showButton: v })}
                    />
                    {showButton !== false && (
                        <>
                            <TextControl
                                label={__('Button Text', 'icon-box-block')}
                                value={buttonText || ''}
                                onChange={(v) => setAttributes({ buttonText: v })}
                            />
                            <TextControl
                                label={__('Button URL', 'icon-box-block')}
                                value={linkUrl || ''}
                                onChange={(v) => setAttributes({ linkUrl: v })}
                                placeholder="https://"
                            />
                            <SelectControl
                                label={__('Open in', 'icon-box-block')}
                                value={linkTarget}
                                options={[
                                    { label: __('Same window', 'icon-box-block'), value: '_self' },
                                    { label: __('New window', 'icon-box-block'), value: '_blank' },
                                ]}
                                onChange={(v) => setAttributes({ linkTarget: v })}
                            />
                        </>
                    )}
                </PanelBody>

                {showButton !== false && (
                    <PanelBody section="style" priority="high" title={__('Button Style', 'icon-box-block')} initialOpen={false}>
                        <BaseControl label={__('Button Background', 'icon-box-block')}>
                            <BoundColorPalette
                                value={buttonBgColor || ""}
                                onChange={(v) => setAttributes({ buttonBgColor: v || "" })}
                            />
                        </BaseControl>
                        <BaseControl label={__('Button Text Color', 'icon-box-block')}>
                            <BoundColorPalette
                                value={buttonTextColor || ""}
                                onChange={(v) => setAttributes({ buttonTextColor: v || "" })}
                            />
                        </BaseControl>
                    </PanelBody>
                )}

                <PanelBody section="style" priority="medium" title={__('Spacing', 'icon-box-block')} initialOpen={false}>
                    <DeviceSwitcher
                        deviceType={deviceType}
                        setDeviceType={setDeviceType}
                        tiers={THREE_TIERS}
                        onReset={() => resetToDefaults(['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'])}
                    />

                    <BoxControl
                        label={__('Padding', 'icon-box-block')}
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
                        label={__('Margin', 'icon-box-block')}
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
                                    {__('Change Icon', 'icon-box-block')}
                                </Button>
                                <RangeControl
                                    label={__('Icon Size', 'icon-box-block')}
                                    value={iconSize}
                                    onChange={(v) => setAttributes({ iconSize: v })}
                                    min={16}
                                    max={200}
                                />
                            </>
                        }
                    >
                        <div className="adaire-icon-box__icon-area">
                            {chosenIcon && chosenIcon.trim() ? (
                                <i className={`adaire-icon-box__icon ${chosenIcon}`}></i>
                            ) : iconSvg ? (
                                <span
                                    className="adaire-icon-box__icon"
                                    dangerouslySetInnerHTML={{ __html: iconSvg }}
                                />
                            ) : null}
                        </div>
                    </QuickZone>
                )}

                {!hasIcon && (
                    <button
                        className="adaire-icon-box__add-icon"
                        onClick={() => setIsIconPickerOpen(true)}
                        type="button"
                    >
                        {__('+ Add Icon', 'icon-box-block')}
                    </button>
                )}

                <RichText
                    tagName="h3"
                    className="adaire-icon-box__title"
                    value={title}
                    onChange={(v) => setAttributes({ title: v })}
                    placeholder={__('Card title…', 'icon-box-block')}
                />

                <RichText
                    tagName="p"
                    className="adaire-icon-box__description"
                    value={description}
                    onChange={(v) => setAttributes({ description: v })}
                    placeholder={__('Description…', 'icon-box-block')}
                />

                {showButton !== false && (
                    <span
                        className="adaire-icon-box__btn"
                        style={{
                            backgroundColor: buttonBgColor || '#ffffff',
                            color: buttonTextColor || '#503AA8',
                        }}
                    >
                        {buttonText || __('Learn More', 'icon-box-block')}
                    </span>
                )}
            </div>
        </>
    );
}
