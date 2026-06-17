import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    ColorPicker,
    BaseControl,
    Button,
    TextControl,
    TextareaControl,
    SelectControl,
    ButtonGroup,
    __experimentalBoxControl as BoxControl,
} from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import BootstrapIconPicker from './BootstrapIconPicker';
import QuickZone from '../components/QuickZone';
import './editor.scss';

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
        iconHoverColor,
        backgroundColor,
        backgroundHoverColor,
        padding,
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
    } = attributes;

    if (!blockId) {
        setAttributes({ blockId: clientId });
    }

    const blockProps = useBlockProps({
        className: `adaire-icon-box adaire-icon-box--align-${alignment}`,
        style: {
            outline: 'none',
            border: 'none',
            boxShadow: 'none',
            '--icon-size': `${iconSize}px`,
            '--icon-color': iconColor,
            '--icon-hover-color': iconHoverColor,
            '--icon-bg': backgroundColor,
            '--icon-bg-hover': backgroundHoverColor,
            '--icon-padding-top': `${paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
            '--icon-padding-right': `${paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
            '--icon-padding-bottom': `${paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
            '--icon-padding-left': `${paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
            '--icon-padding-top-tablet': `${paddingTop?.tablet ?? paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
            '--icon-padding-right-tablet': `${paddingRight?.tablet ?? paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
            '--icon-padding-bottom-tablet': `${paddingBottom?.tablet ?? paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
            '--icon-padding-left-tablet': `${paddingLeft?.tablet ?? paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
            '--icon-padding-top-mobile': `${paddingTop?.mobile ?? paddingTop?.tablet ?? paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
            '--icon-padding-right-mobile': `${paddingRight?.mobile ?? paddingRight?.tablet ?? paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
            '--icon-padding-bottom-mobile': `${paddingBottom?.mobile ?? paddingBottom?.tablet ?? paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
            '--icon-padding-left-mobile': `${paddingLeft?.mobile ?? paddingLeft?.tablet ?? paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
            '--icon-border-radius': `${borderRadius}px`,
            '--icon-border-width': `${borderWidth}px`,
            '--icon-border-color': borderColor,
            marginTop: `${marginTop?.desktop ?? 0}px`,
            marginRight: `${marginRight?.desktop ?? 0}px`,
            marginBottom: `${marginBottom?.desktop ?? 0}px`,
            marginLeft: `${marginLeft?.desktop ?? 0}px`,
        },
    });

    const IconWrapper = linkUrl ? 'a' : 'div';
    const linkProps = linkUrl ? {
        href: linkUrl,
        target: linkTarget === '_blank' ? '_blank' : undefined,
        rel: linkTarget === '_blank' ? 'noopener noreferrer' : undefined,
    } : {};

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Icon Settings', 'icon-box-block')} initialOpen={true}>
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

                    <RangeControl
                        label={__('Icon Size', 'icon-box-block')}
                        value={iconSize}
                        onChange={(value) => setAttributes({ iconSize: value })}
                        min={16}
                        max={200}
                    />

                    <BaseControl label={__('Icon Color', 'icon-box-block')}>
                        <ColorPicker
                            color={iconColor}
                            onChangeComplete={(color) => setAttributes({ iconColor: color.hex })}
                            disableAlpha
                        />
                    </BaseControl>

                    <BaseControl label={__('Icon Hover Color', 'icon-box-block')}>
                        <ColorPicker
                            color={iconHoverColor}
                            onChangeComplete={(color) => setAttributes({ iconHoverColor: color.hex })}
                            disableAlpha
                        />
                    </BaseControl>

                    <SelectControl
                        label={__('Icon Alignment', 'icon-box-block')}
                        value={alignment}
                        options={[
                            { label: __('Left', 'icon-box-block'), value: 'left' },
                            { label: __('Center', 'icon-box-block'), value: 'center' },
                            { label: __('Right', 'icon-box-block'), value: 'right' }
                        ]}
                        onChange={(value) => setAttributes({ alignment: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Background Settings', 'icon-box-block')} initialOpen={false}>
                    <BaseControl label={__('Background Color', 'icon-box-block')}>
                        <ColorPicker
                            color={backgroundColor && backgroundColor !== 'transparent' ? backgroundColor : '#000000'}
                            onChangeComplete={(color) => {
                                const alpha = color.rgb.a !== undefined ? color.rgb.a : 1;
                                const colorValue = alpha < 1
                                    ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`
                                    : color.hex;
                                setAttributes({ backgroundColor: colorValue });
                            }}
                            enableAlpha={true}
                        />
                    </BaseControl>

                    <BaseControl label={__('Background Hover Color', 'icon-box-block')}>
                        <ColorPicker
                            color={backgroundHoverColor && backgroundHoverColor !== 'transparent' ? backgroundHoverColor : '#000000'}
                            onChangeComplete={(color) => {
                                const alpha = color.rgb.a !== undefined ? color.rgb.a : 1;
                                const colorValue = alpha < 1
                                    ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`
                                    : color.hex;
                                setAttributes({ backgroundHoverColor: colorValue });
                            }}
                            enableAlpha={true}
                        />
                    </BaseControl>

                    <RangeControl
                        label={__('Border Radius', 'icon-box-block')}
                        value={borderRadius}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0}
                        max={100}
                    />

                    <RangeControl
                        label={__('Border Width', 'icon-box-block')}
                        value={borderWidth}
                        onChange={(value) => setAttributes({ borderWidth: value })}
                        min={0}
                        max={10}
                    />

                    {borderWidth > 0 && (
                        <BaseControl label={__('Border Color', 'icon-box-block')}>
                            <ColorPicker
                                color={borderColor}
                                onChangeComplete={(color) => setAttributes({ borderColor: color.hex })}
                                disableAlpha
                            />
                        </BaseControl>
                    )}
                </PanelBody>

                <PanelBody title={__('Link Settings', 'icon-box-block')} initialOpen={false}>
                    <TextControl
                        label={__('Link URL', 'icon-box-block')}
                        value={linkUrl}
                        onChange={(value) => setAttributes({ linkUrl: value })}
                        placeholder="https://example.com"
                    />

                    <SelectControl
                        label={__('Link Target', 'icon-box-block')}
                        value={linkTarget}
                        options={[
                            { label: __('Same Window', 'icon-box-block'), value: '_self' },
                            { label: __('New Window', 'icon-box-block'), value: '_blank' },
                        ]}
                        onChange={(value) => setAttributes({ linkTarget: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Spacing', 'icon-box-block')} initialOpen={false}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>{__('Margin', 'icon-box-block')}</p>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        <Button
                            isPressed={deviceType === 'desktop'}
                            onClick={() => setDeviceType('desktop')}
                            icon={desktop}
                        />
                        <Button
                            isPressed={deviceType === 'tablet'}
                            onClick={() => setDeviceType('tablet')}
                            icon={tablet}
                        />
                        <Button
                            isPressed={deviceType === 'mobile'}
                            onClick={() => setDeviceType('mobile')}
                            icon={mobile}
                        />
                    </ButtonGroup>

                    <BoxControl
                        label={__('Margin', 'icon-box-block')}
                        values={{
                            top: marginTop?.[deviceType] ?? marginTop?.desktop ?? 0,
                            right: marginRight?.[deviceType] ?? marginRight?.desktop ?? 0,
                            bottom: marginBottom?.[deviceType] ?? marginBottom?.desktop ?? 0,
                            left: marginLeft?.[deviceType] ?? marginLeft?.desktop ?? 0,
                        }}
                        onChange={(value) => {
                            setAttributes({
                                marginTop: { ...marginTop, [deviceType]: value.top },
                                marginRight: { ...marginRight, [deviceType]: value.right },
                                marginBottom: { ...marginBottom, [deviceType]: value.bottom },
                                marginLeft: { ...marginLeft, [deviceType]: value.left },
                            });
                        }}
                    />

                    <p style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>{__('Padding', 'icon-box-block')}</p>
                    <BoxControl
                        label={__('Padding', 'icon-box-block')}
                        values={{
                            top: paddingTop?.[deviceType] ?? paddingTop?.desktop ?? 0,
                            right: paddingRight?.[deviceType] ?? paddingRight?.desktop ?? 0,
                            bottom: paddingBottom?.[deviceType] ?? paddingBottom?.desktop ?? 0,
                            left: paddingLeft?.[deviceType] ?? paddingLeft?.desktop ?? 0,
                        }}
                        onChange={(value) => {
                            setAttributes({
                                paddingTop: { ...paddingTop, [deviceType]: value.top },
                                paddingRight: { ...paddingRight, [deviceType]: value.right },
                                paddingBottom: { ...paddingBottom, [deviceType]: value.bottom },
                                paddingLeft: { ...paddingLeft, [deviceType]: value.left },
                            });
                        }}
                    />
                </PanelBody>
            </InspectorControls>

            <BootstrapIconPicker
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                onSelect={(iconClass) => setAttributes({ chosenIcon: iconClass })}
                currentIcon={chosenIcon}
            />




            <div {...blockProps}>
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
                                style={{ width: '100%', marginBottom: '12px' }}
                            >
                                {chosenIcon ? __('Change Icon', 'icon-box-block') : __('Choose Bootstrap Icon', 'icon-box-block')}
                            </Button>
                            <RangeControl
                                label={__('Icon Size', 'icon-box-block')}
                                value={iconSize}
                                onChange={(value) => setAttributes({ iconSize: value })}
                                min={16}
                                max={200}
                            />
                        </>
                    }
                >
                    {chosenIcon || iconSvg ? (
                        <IconWrapper
                            className="adaire-icon-box__wrapper"
                            {...linkProps}
                            style={{
                                '--icon-size': `${iconSize}px`,
                                '--icon-color': iconColor,
                                '--icon-hover-color': iconHoverColor,
                                '--icon-bg': backgroundColor,
                                '--icon-bg-hover': backgroundHoverColor,
                                '--icon-padding-top': `${paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
                                '--icon-padding-right': `${paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
                                '--icon-padding-bottom': `${paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
                                '--icon-padding-left': `${paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
                                '--icon-padding-top-tablet': `${paddingTop?.tablet ?? paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
                                '--icon-padding-right-tablet': `${paddingRight?.tablet ?? paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
                                '--icon-padding-bottom-tablet': `${paddingBottom?.tablet ?? paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
                                '--icon-padding-left-tablet': `${paddingLeft?.tablet ?? paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
                                '--icon-padding-top-mobile': `${paddingTop?.mobile ?? paddingTop?.tablet ?? paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
                                '--icon-padding-right-mobile': `${paddingRight?.mobile ?? paddingRight?.tablet ?? paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
                                '--icon-padding-bottom-mobile': `${paddingBottom?.mobile ?? paddingBottom?.tablet ?? paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
                                '--icon-padding-left-mobile': `${paddingLeft?.mobile ?? paddingLeft?.tablet ?? paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
                                '--icon-border-radius': `${borderRadius}px`,
                                '--icon-border-width': `${borderWidth}px`,
                                '--icon-border-color': borderColor,
                            }}
                        >
                            {chosenIcon ? (
                                <i
                                    className={`adaire-icon-box__icon ${chosenIcon}`}
                                    style={{
                                        fontSize: `${iconSize}px`,
                                    }}
                                ></i>
                            ) : iconSvg ? (
                                <span
                                    className="adaire-icon-box__icon"
                                    style={{
                                        width: `${iconSize}px`,
                                        height: `${iconSize}px`,
                                        fontSize: `${iconSize}px`,
                                    }}
                                    dangerouslySetInnerHTML={{ __html: iconSvg }}
                                />
                            ) : null}
                        </IconWrapper>
                    ) : (
                        <div className="adaire-icon-box__placeholder">
                            <p>{__('Choose an icon from the Icon Settings panel', 'icon-box-block')}</p>
                        </div>
                    )}
                </QuickZone>
            </div>
        </>
    );
}



