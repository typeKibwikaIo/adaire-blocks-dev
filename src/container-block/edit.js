import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl, ColorPicker, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import InspectorTabs from '../components/InspectorTabs';
import QuickZone from '../components/QuickZone';

export default function Edit({ attributes, setAttributes }) {
    const [activeZone, setActiveZone] = useState(null);
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
        overflow
    } = attributes;

    const blockProps = useBlockProps({
        className: 'container-block',
        style: {
            maxWidth: maxWidth || '1200px',
            marginLeft: alignContainer === 'center' ? 'auto' : alignContainer === 'left' ? '0' : alignContainer === 'right' ? 'auto' : 'auto',
            marginRight: alignContainer === 'center' ? 'auto' : alignContainer === 'right' ? '0' : alignContainer === 'left' ? 'auto' : 'auto',
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingBottom}px`,
            paddingLeft: `${paddingLeft}px`,
            paddingRight: `${paddingRight}px`,
            marginTop: `${marginTop}px`,
            marginBottom: `${marginBottom}px`,
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
                <PanelBody title={__('Container Settings', 'container-block')} initialOpen={true}>
                    <TextControl
                        label={__('Max Width', 'container-block')}
                        value={maxWidth}
                        onChange={(value) => setAttributes({ maxWidth: value })}
                        placeholder="1200px"
                    />
                    <SelectControl
                        label={__('Alignment', 'container-block')}
                        value={alignContainer}
                        options={[
                            { label: __('Center', 'container-block'), value: 'center' },
                            { label: __('Left', 'container-block'), value: 'left' },
                            { label: __('Right', 'container-block'), value: 'right' },
                            { label: __('Full Width', 'container-block'), value: 'full' }
                        ]}
                        onChange={(value) => setAttributes({ alignContainer: value })}
                    />
                    <TextControl
                        label={__('Min Height', 'container-block')}
                        value={minHeight}
                        onChange={(value) => setAttributes({ minHeight: value })}
                        placeholder="auto"
                    />
                    <SelectControl
                        label={__('Overflow', 'container-block')}
                        value={overflow}
                        options={[
                            { label: __('Visible', 'container-block'), value: 'visible' },
                            { label: __('Hidden', 'container-block'), value: 'hidden' },
                            { label: ('Auto', 'container-block'), value: 'auto' },
                            { label: ('Scroll', 'container-block'), value: 'scroll' }
                        ]}
                        onChange={(value) => setAttributes({ overflow: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Padding', 'container-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Padding Top (px)', 'container-block')}
                        value={paddingTop}
                        onChange={(value) => setAttributes({ paddingTop: value })}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Padding Bottom (px)', 'container-block')}
                        value={paddingBottom}
                        onChange={(value) => setAttributes({ paddingBottom: value })}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Padding Left (px)', 'container-block')}
                        value={paddingLeft}
                        onChange={(value) => setAttributes({ paddingLeft: value })}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Padding Right (px)', 'container-block')}
                        value={paddingRight}
                        onChange={(value) => setAttributes({ paddingRight: value })}
                        min={0}
                        max={200}
                    />
                </PanelBody>

                <PanelBody title={__('Margin', 'container-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Margin Top (px)', 'container-block')}
                        value={marginTop}
                        onChange={(value) => setAttributes({ marginTop: value })}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Margin Bottom (px)', 'container-block')}
                        value={marginBottom}
                        onChange={(value) => setAttributes({ marginBottom: value })}
                        min={0}
                        max={200}
                    />
                </PanelBody>

                <PanelBody title={__('Background', 'container-block')} initialOpen={false}>
                    <SelectControl
                        label={__('Background Type', 'container-block')}
                        value={backgroundType}
                        options={[
                            { label: __('Solid Color', 'container-block'), value: 'solid' },
                            { label: __('Gradient', 'container-block'), value: 'gradient' },
                            { label: __('Image', 'container-block'), value: 'image' }
                        ]}
                        onChange={(value) => setAttributes({ backgroundType: value })}
                    />
                    {backgroundType === 'solid' && (
                        <div style={{ marginBottom: '16px' }}>
                            <label>{__('Background Color', 'container-block')}</label>
                            <ColorPicker
                                color={backgroundColor}
                                onChangeComplete={(color) => setAttributes({ backgroundColor: color.hex })}
                                disableAlpha
                            />
                        </div>
                    )}
                    {backgroundType === 'gradient' && (
                        <div style={{ marginBottom: '16px' }}>
                            <label>{__('Gradient', 'container-block')}</label>
                            <ColorPicker
                                color={backgroundGradient}
                                onChangeComplete={(color) => setAttributes({ backgroundGradient: color.hex })}
                                enableAlpha
                            />
                        </div>
                    )}
                    {backgroundType === 'image' && (
                        <TextControl
                            label={__('Background Image URL', 'container-block')}
                            value={backgroundImage}
                            onChange={(value) => setAttributes({ backgroundImage: value })}
                            placeholder="https://example.com/image.jpg"
                        />
                    )}
                </PanelBody>

                <PanelBody title={__('Border', 'container-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Border Radius (px)', 'container-block')}
                        value={borderRadius}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0}
                        max={100}
                    />
                    <RangeControl
                        label={__('Border Width (px)', 'container-block')}
                        value={borderWidth}
                        onChange={(value) => setAttributes({ borderWidth: value })}
                        min={0}
                        max= {20}
                    />
                    <div style={{ marginBottom: '16px' }}>
                        <label>{__('Border Color', 'container-block')}</label>
                        <ColorPicker
                            color={borderColor}
                            onChangeComplete={(color) => setAttributes({ borderColor: color.hex })}
                            disableAlpha
                        />
                    </div>
                    <SelectControl
                        label={__('Box Shadow', 'container-block')}
                        value={boxShadow}
                        options={[
                            { label: __('None', 'container-block'), value: 'none' },
                            { label: __('Small', 'container-block'), value: '0 2px 4px rgba(0,0,0,0.1)' },
                            { label: __('Medium', 'container-block'), value: '0 4px 8px rgba(0,0,0,0.15)' },
                            { label: __('Large', 'container-block'), value: '0 8px 16px rgba(0,0,0,0.2)' },
                            { label: __('Custom', 'container-block'), value: 'custom' }
                        ]}
                        onChange={(value) => setAttributes({ boxShadow: value })}
                    />
                </PanelBody>
            </InspectorTabs>

            <div {...blockProps}>
                <QuickZone
                    id="background"
                    label={__('Background', 'container-block')}
                    activeZone={activeZone}
                    setActiveZone={setActiveZone}
                    content={
                        <>
                            <SelectControl
                                label={__('Background Type', 'container-block')}
                                value={backgroundType}
                                options={[
                                    { label: __('Solid Color', 'container-block'), value: 'solid' },
                                    { label: __('Gradient', 'container-block'), value: 'gradient' },
                                    { label: __('Image', 'container-block'), value: 'image' }
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
                                label={__('Border Radius (px)', 'container-block')}
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