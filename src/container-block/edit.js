import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl, ColorPicker, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import InspectorTabs from '../components/InspectorTabs';
import QuickZone from '../components/QuickZone';
import DeviceSwitcher, { BreakpointNote, THREE_TIERS } from '../components/DeviceSwitcher';
import useEditorDevice, { hasCanvasPreset } from '../components/useEditorDevice';

export default function Edit({ attributes, setAttributes }) {
    const [activeZone, setActiveZone] = useState(null);
    const [deviceType, setDeviceType] = useState('desktop');
    useEditorDevice(deviceType, setDeviceType);
    const {
        maxWidth,
        alignContainer,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        marginTop,
        marginBottom,
        backgroundColor,
        backgroundImage,
        backgroundGradient,
        backgroundType,
        borderRadius,
        borderWidth,
        borderColor,
        boxShadow,
        minHeight,
        overflow,
        responsivePaddingTop,
        responsivePaddingBottom,
        responsivePaddingLeft,
        responsivePaddingRight,
        responsiveMarginTop,
        responsiveMarginBottom
    } = attributes;

    const rPaddingTop = responsivePaddingTop || {};
    const rPaddingBottom = responsivePaddingBottom || {};
    const rPaddingLeft = responsivePaddingLeft || {};
    const rPaddingRight = responsivePaddingRight || {};
    const rMarginTop = responsiveMarginTop || {};
    const rMarginBottom = responsiveMarginBottom || {};

    const updateResponsive = (attrName, value) => setAttributes({
        [attrName]: { ...(attributes[attrName] || {}), [deviceType]: value },
    });

    const blockProps = useBlockProps({
        className: 'container-block',
        style: {
            maxWidth: maxWidth || '1200px',
            marginLeft: alignContainer === 'center' ? 'auto' : alignContainer === 'left' ? '0' : alignContainer === 'right' ? 'auto' : 'auto',
            marginRight: alignContainer === 'center' ? 'auto' : alignContainer === 'right' ? '0' : alignContainer === 'left' ? 'auto' : 'auto',
            '--container-padding-top-desktop': `${rPaddingTop.desktop ?? paddingTop}px`,
            '--container-padding-top-tablet': `${rPaddingTop.tablet ?? rPaddingTop.desktop ?? paddingTop}px`,
            '--container-padding-top-mobile': `${rPaddingTop.mobile ?? rPaddingTop.tablet ?? rPaddingTop.desktop ?? paddingTop}px`,
            '--container-padding-bottom-desktop': `${rPaddingBottom.desktop ?? paddingBottom}px`,
            '--container-padding-bottom-tablet': `${rPaddingBottom.tablet ?? rPaddingBottom.desktop ?? paddingBottom}px`,
            '--container-padding-bottom-mobile': `${rPaddingBottom.mobile ?? rPaddingBottom.tablet ?? rPaddingBottom.desktop ?? paddingBottom}px`,
            '--container-padding-left-desktop': `${rPaddingLeft.desktop ?? paddingLeft}px`,
            '--container-padding-left-tablet': `${rPaddingLeft.tablet ?? rPaddingLeft.desktop ?? paddingLeft}px`,
            '--container-padding-left-mobile': `${rPaddingLeft.mobile ?? rPaddingLeft.tablet ?? rPaddingLeft.desktop ?? paddingLeft}px`,
            '--container-padding-right-desktop': `${rPaddingRight.desktop ?? paddingRight}px`,
            '--container-padding-right-tablet': `${rPaddingRight.tablet ?? rPaddingRight.desktop ?? paddingRight}px`,
            '--container-padding-right-mobile': `${rPaddingRight.mobile ?? rPaddingRight.tablet ?? rPaddingRight.desktop ?? paddingRight}px`,
            '--container-margin-top-desktop': `${rMarginTop.desktop ?? marginTop}px`,
            '--container-margin-top-tablet': `${rMarginTop.tablet ?? rMarginTop.desktop ?? marginTop}px`,
            '--container-margin-top-mobile': `${rMarginTop.mobile ?? rMarginTop.tablet ?? rMarginTop.desktop ?? marginTop}px`,
            '--container-margin-bottom-desktop': `${rMarginBottom.desktop ?? marginBottom}px`,
            '--container-margin-bottom-tablet': `${rMarginBottom.tablet ?? rMarginBottom.desktop ?? marginBottom}px`,
            '--container-margin-bottom-mobile': `${rMarginBottom.mobile ?? rMarginBottom.tablet ?? rMarginBottom.desktop ?? marginBottom}px`,
            backgroundColor: backgroundType === 'solid' ? (backgroundColor || 'transparent') : backgroundType === 'gradient' ? backgroundGradient : 'transparent',
            backgroundImage: backgroundType === 'image' ? `url(${backgroundImage})` : 'none',
            backgroundSize: backgroundType === 'image' ? 'cover' : 'auto',
            backgroundPosition: backgroundType === 'image' ? 'center' : 'auto',
            backgroundRepeat: backgroundType === 'image' ? 'no-repeat' : 'repeat',
            borderRadius: `${borderRadius}px`,
            borderWidth: `${borderWidth}px`,
            borderColor: borderColor,
            borderStyle: borderWidth > 0 ? 'solid' : 'none',
            boxShadow: boxShadow,
            minHeight: minHeight,
            overflow: overflow
        }
    });

    return (
        <>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
                <PanelBody section="layout" title={__('Container Settings', 'adaire-blocks')} initialOpen={true}>
                    <TextControl
                        label={__('Max Width', 'adaire-blocks')}
                        value={maxWidth}
                        onChange={(value) => setAttributes({ maxWidth: value })}
                        placeholder="1200px"
                    />
                    <SelectControl
                        label={__('Alignment', 'adaire-blocks')}
                        value={alignContainer}
                        options={[
                            { label: __('Center', 'adaire-blocks'), value: 'center' },
                            { label: __('Left', 'adaire-blocks'), value: 'left' },
                            { label: __('Right', 'adaire-blocks'), value: 'right' },
                            { label: __('Full Width', 'adaire-blocks'), value: 'full' }
                        ]}
                        onChange={(value) => setAttributes({ alignContainer: value })}
                    />
                    <TextControl
                        label={__('Min Height', 'adaire-blocks')}
                        value={minHeight}
                        onChange={(value) => setAttributes({ minHeight: value })}
                        placeholder="auto"
                    />
                    <SelectControl
                        label={__('Overflow', 'adaire-blocks')}
                        value={overflow}
                        options={[
                            { label: __('Visible', 'adaire-blocks'), value: 'visible' },
                            { label: __('Hidden', 'adaire-blocks'), value: 'hidden' },
                            { label: ('Auto', 'adaire-blocks'), value: 'auto' },
                            { label: ('Scroll', 'adaire-blocks'), value: 'scroll' }
                        ]}
                        onChange={(value) => setAttributes({ overflow: value })}
                    />
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Padding', 'adaire-blocks')} initialOpen={false}>
                    <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} tiers={THREE_TIERS} />
                    <BreakpointNote deviceType={deviceType} tiers={THREE_TIERS} />
                    {!hasCanvasPreset(deviceType) && (
                        <p className="components-base-control__help">{__('This breakpoint has no matching canvas preview width — the editor canvas will not resize to match while you edit it.', 'adaire-blocks')}</p>
                    )}
                    <RangeControl
                        label={__('Padding Top (px)', 'adaire-blocks')}
                        value={rPaddingTop[deviceType] ?? rPaddingTop.desktop ?? paddingTop}
                        onChange={(value) => updateResponsive('responsivePaddingTop', value)}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Padding Bottom (px)', 'adaire-blocks')}
                        value={rPaddingBottom[deviceType] ?? rPaddingBottom.desktop ?? paddingBottom}
                        onChange={(value) => updateResponsive('responsivePaddingBottom', value)}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Padding Left (px)', 'adaire-blocks')}
                        value={rPaddingLeft[deviceType] ?? rPaddingLeft.desktop ?? paddingLeft}
                        onChange={(value) => updateResponsive('responsivePaddingLeft', value)}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Padding Right (px)', 'adaire-blocks')}
                        value={rPaddingRight[deviceType] ?? rPaddingRight.desktop ?? paddingRight}
                        onChange={(value) => updateResponsive('responsivePaddingRight', value)}
                        min={0}
                        max={200}
                    />
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Margin', 'adaire-blocks')} initialOpen={false}>
                    <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} tiers={THREE_TIERS} />
                    <BreakpointNote deviceType={deviceType} tiers={THREE_TIERS} />
                    <RangeControl
                        label={__('Margin Top (px)', 'adaire-blocks')}
                        value={rMarginTop[deviceType] ?? rMarginTop.desktop ?? marginTop}
                        onChange={(value) => updateResponsive('responsiveMarginTop', value)}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Margin Bottom (px)', 'adaire-blocks')}
                        value={rMarginBottom[deviceType] ?? rMarginBottom.desktop ?? marginBottom}
                        onChange={(value) => updateResponsive('responsiveMarginBottom', value)}
                        min={0}
                        max={200}
                    />
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Background', 'adaire-blocks')} initialOpen={false}>
                    <SelectControl
                        label={__('Background Type', 'adaire-blocks')}
                        value={backgroundType}
                        options={[
                            { label: __('Solid Color', 'adaire-blocks'), value: 'solid' },
                            { label: __('Gradient', 'adaire-blocks'), value: 'gradient' },
                            { label: __('Image', 'adaire-blocks'), value: 'image' }
                        ]}
                        onChange={(value) => setAttributes({ backgroundType: value })}
                    />
                    {backgroundType === 'solid' && (
                        <div style={{ marginBottom: '16px' }}>
                            <label>{__('Background Color', 'adaire-blocks')}</label>
                            <ColorPicker
                                color={backgroundColor}
                                onChangeComplete={(color) => setAttributes({ backgroundColor: color.hex })}
                                disableAlpha
                            />
                        </div>
                    )}
                    {backgroundType === 'gradient' && (
                        <div style={{ marginBottom: '16px' }}>
                            <label>{__('Gradient', 'adaire-blocks')}</label>
                            <ColorPicker
                                color={backgroundGradient}
                                onChangeComplete={(color) => setAttributes({ backgroundGradient: color.hex })}
                                enableAlpha
                            />
                        </div>
                    )}
                    {backgroundType === 'image' && (
                        <TextControl
                            label={__('Background Image URL', 'adaire-blocks')}
                            value={backgroundImage}
                            onChange={(value) => setAttributes({ backgroundImage: value })}
                            placeholder="https://example.com/image.jpg"
                        />
                    )}
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Border', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl
                        label={__('Border Radius (px)', 'adaire-blocks')}
                        value={borderRadius}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0}
                        max={100}
                    />
                    <RangeControl
                        label={__('Border Width (px)', 'adaire-blocks')}
                        value={borderWidth}
                        onChange={(value) => setAttributes({ borderWidth: value })}
                        min={0}
                        max= {20}
                    />
                    <div style={{ marginBottom: '16px' }}>
                        <label>{__('Border Color', 'adaire-blocks')}</label>
                        <ColorPicker
                            color={borderColor}
                            onChangeComplete={(color) => setAttributes({ borderColor: color.hex })}
                            disableAlpha
                        />
                    </div>
                    <SelectControl
                        label={__('Box Shadow', 'adaire-blocks')}
                        value={boxShadow}
                        options={[
                            { label: __('None', 'adaire-blocks'), value: 'none' },
                            { label: __('Small', 'adaire-blocks'), value: '0 2px 4px rgba(0,0,0,0.1)' },
                            { label: __('Medium', 'adaire-blocks'), value: '0 4px 8px rgba(0,0,0,0.15)' },
                            { label: __('Large', 'adaire-blocks'), value: '0 8px 16px rgba(0,0,0,0.2)' },
                            { label: __('Custom', 'adaire-blocks'), value: 'custom' }
                        ]}
                        onChange={(value) => setAttributes({ boxShadow: value })}
                    />
                </PanelBody>
            </InspectorTabs>

            <div {...blockProps}>
                <QuickZone
                    id="background"
                    label={__('Background', 'adaire-blocks')}
                    activeZone={activeZone}
                    setActiveZone={setActiveZone}
                    content={
                        <>
                            <SelectControl
                                label={__('Background Type', 'adaire-blocks')}
                                value={backgroundType}
                                options={[
                                    { label: __('Solid Color', 'adaire-blocks'), value: 'solid' },
                                    { label: __('Gradient', 'adaire-blocks'), value: 'gradient' },
                                    { label: __('Image', 'adaire-blocks'), value: 'image' }
                                ]}
                                onChange={(value) => setAttributes({ backgroundType: value })}
                            />
                            {backgroundType === 'solid' && (
                                <ColorPicker
                                    color={backgroundColor}
                                    onChangeComplete={(color) => setAttributes({ backgroundColor: color.hex })}
                                    disableAlpha
                                />
                            )}
                            <RangeControl
                                label={__('Border Radius (px)', 'adaire-blocks')}
                                value={borderRadius}
                                onChange={(value) => setAttributes({ borderRadius: value })}
                                min={0}
                                max={100}
                            />
                        </>
                    }
                >
                    <div className="container-block__inner">
                        <InnerBlocks />
                    </div>
                </QuickZone>
            </div>
        </>
    );
}