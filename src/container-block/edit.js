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
                    <RangeControl
                        label={__('Padding Top (px)', 'adaire-blocks')}
                        value={paddingTop}
                        onChange={(value) => setAttributes({ paddingTop: value })}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Padding Bottom (px)', 'adaire-blocks')}
                        value={paddingBottom}
                        onChange={(value) => setAttributes({ paddingBottom: value })}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Padding Left (px)', 'adaire-blocks')}
                        value={paddingLeft}
                        onChange={(value) => setAttributes({ paddingLeft: value })}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Padding Right (px)', 'adaire-blocks')}
                        value={paddingRight}
                        onChange={(value) => setAttributes({ paddingRight: value })}
                        min={0}
                        max={200}
                    />
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Margin', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl
                        label={__('Margin Top (px)', 'adaire-blocks')}
                        value={marginTop}
                        onChange={(value) => setAttributes({ marginTop: value })}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Margin Bottom (px)', 'adaire-blocks')}
                        value={marginBottom}
                        onChange={(value) => setAttributes({ marginBottom: value })}
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