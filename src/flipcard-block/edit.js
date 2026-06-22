import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl, ButtonGroup, Button, TextControl, BaseControl, ColorPicker } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { useEffect, useState } from '@wordpress/element';
import InspectorTabs from '../components/InspectorTabs';
import QuickZone from '../components/QuickZone';
import './editor.scss';

const ALLOWED_BLOCKS = ['create-block/flipcard-front-block', 'create-block/flipcard-back-block'];

const TEMPLATE = [
    ['create-block/flipcard-front-block'],
    ['create-block/flipcard-back-block'],
];

export default function Edit({ attributes, setAttributes, clientId }) {
    const [deviceType, setDeviceType] = useState('desktop');
    const [activeZone, setActiveZone] = useState(null);
    const { 
        blockId, 
        width, 
        height, 
        flipDirection, 
        animationDuration, 
        animationEasing,
        frontBackgroundColor,
        backBackgroundColor,
        borderRadius,
        padding,
        shadowIntensity,
        frontBorderColor,
        frontBorderWidth,
        backBorderColor,
        backBorderWidth
    } = attributes;

    // Ensure blockId is set
    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: clientId });
        }
    }, [blockId, clientId, setAttributes]);

    // Handle legacy width/height (number) and convert to object format
    const normalizedWidth = typeof width === 'object' ? width : {
        desktop: { value: width || 300, unit: 'px' },
        tablet: { value: 100, unit: '%' },
        mobile: { value: 100, unit: '%' }
    };
    
    const normalizedHeight = typeof height === 'object' ? height : {
        desktop: { value: height || 300, unit: 'px' },
        tablet: { value: height || 300, unit: 'px' },
        mobile: { value: 250, unit: 'px' }
    };

    const blockProps = useBlockProps({
        className: `adaire-flipcard adaire-flipcard--${flipDirection}`,
        style: {
            '--flipcard-width-desktop': `${normalizedWidth?.desktop?.value ?? 300}${normalizedWidth?.desktop?.unit ?? 'px'}`,
            '--flipcard-width-tablet': `${normalizedWidth?.tablet?.value ?? 100}${normalizedWidth?.tablet?.unit ?? '%'}`,
            '--flipcard-width-mobile': `${normalizedWidth?.mobile?.value ?? 100}${normalizedWidth?.mobile?.unit ?? '%'}`,
            '--flipcard-height-desktop': `${normalizedHeight?.desktop?.value ?? 300}${normalizedHeight?.desktop?.unit ?? 'px'}`,
            '--flipcard-height-tablet': `${normalizedHeight?.tablet?.value ?? 300}${normalizedHeight?.tablet?.unit ?? 'px'}`,
            '--flipcard-height-mobile': `${normalizedHeight?.mobile?.value ?? 250}${normalizedHeight?.mobile?.unit ?? 'px'}`,
            '--flipcard-duration': `${animationDuration}s`,
            '--flipcard-easing': animationEasing,
            '--flipcard-front-bg': frontBackgroundColor || '#ffffff',
            '--flipcard-back-bg': backBackgroundColor || '#f5f5f5',
            '--flipcard-front-border-color': frontBorderColor || '#e0e0e0',
            '--flipcard-front-border-width': `${frontBorderWidth ?? 1}px`,
            '--flipcard-back-border-color': backBorderColor || '#e0e0e0',
            '--flipcard-back-border-width': `${backBorderWidth ?? 1}px`,
            '--flipcard-border-radius': `${borderRadius ?? 8}px`,
            '--flipcard-padding': `${padding ?? 20}px`,
            '--flipcard-shadow-intensity': shadowIntensity ?? 0.1,
        },
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-flipcard__inner-blocks' },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            template: TEMPLATE,
            templateLock: 'insert', // Prevent adding/removing front/back blocks, but allow editing their content
            orientation: 'vertical',
        }
    );

    return (
        <>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
                <PanelBody title={__('Card Dimensions', 'flipcard-block')} initialOpen={true}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Device', 'flipcard-block')}
                    </p>
                    <ButtonGroup style={{ marginBottom: '16px' }}>
                        <Button
                            icon={desktop}
                            isPrimary={deviceType === 'desktop'}
                            onClick={() => setDeviceType('desktop')}
                            label={__('Desktop', 'flipcard-block')}
                        />
                        <Button
                            icon={tablet}
                            isPrimary={deviceType === 'tablet'}
                            onClick={() => setDeviceType('tablet')}
                            label={__('Tablet', 'flipcard-block')}
                        />
                        <Button
                            icon={mobile}
                            isPrimary={deviceType === 'mobile'}
                            onClick={() => setDeviceType('mobile')}
                            label={__('Mobile', 'flipcard-block')}
                        />
                    </ButtonGroup>

                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Card Width', 'flipcard-block')}
                    </p>
                    <div style={{ marginBottom: '16px' }}>
                        <TextControl
                            type="number"
                            value={normalizedWidth?.[deviceType]?.value ?? (deviceType === 'desktop' ? 300 : (deviceType === 'tablet' ? 100 : 100))}
                            onChange={(v) =>
                                setAttributes({
                                    width: {
                                        ...(normalizedWidth || {}),
                                        [deviceType]: {
                                            ...(normalizedWidth?.[deviceType] || {}),
                                            value: Number(v),
                                        },
                                    },
                                })
                            }
                            min={0}
                            step={deviceType === 'desktop' ? 10 : 1}
                        />
                        <ButtonGroup style={{ marginTop: '8px' }}>
                            {['px', '%', 'rem', 'vw'].map(u => (
                                <Button
                                    key={u}
                                    isPrimary={
                                        (normalizedWidth?.[deviceType]?.unit ?? (deviceType === 'desktop' ? 'px' : '%')) === u
                                    }
                                    isSecondary={
                                        (normalizedWidth?.[deviceType]?.unit ?? (deviceType === 'desktop' ? 'px' : '%')) !== u
                                    }
                                    onClick={() =>
                                        setAttributes({
                                            width: {
                                                ...(normalizedWidth || {}),
                                                [deviceType]: {
                                                    ...(normalizedWidth?.[deviceType] || {}),
                                                    unit: u,
                                                },
                                            },
                                        })
                                    }
                                >{u}</Button>
                            ))}
                        </ButtonGroup>
                    </div>

                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Card Height', 'flipcard-block')}
                    </p>
                    <div style={{ marginBottom: '16px' }}>
                        <TextControl
                            type="number"
                            value={normalizedHeight?.[deviceType]?.value ?? (deviceType === 'desktop' ? 300 : (deviceType === 'tablet' ? 300 : 250))}
                            onChange={(v) =>
                                setAttributes({
                                    height: {
                                        ...(normalizedHeight || {}),
                                        [deviceType]: {
                                            ...(normalizedHeight?.[deviceType] || {}),
                                            value: Number(v),
                                        },
                                    },
                                })
                            }
                            min={0}
                            step={10}
                        />
                        <ButtonGroup style={{ marginTop: '8px' }}>
                            {['px', '%', 'rem', 'vh'].map(u => (
                                <Button
                                    key={u}
                                    isPrimary={
                                        (normalizedHeight?.[deviceType]?.unit ?? 'px') === u
                                    }
                                    isSecondary={
                                        (normalizedHeight?.[deviceType]?.unit ?? 'px') !== u
                                    }
                                    onClick={() =>
                                        setAttributes({
                                            height: {
                                                ...(normalizedHeight || {}),
                                                [deviceType]: {
                                                    ...(normalizedHeight?.[deviceType] || {}),
                                                    unit: u,
                                                },
                                            },
                                        })
                                    }
                                >{u}</Button>
                            ))}
                        </ButtonGroup>
                    </div>
                </PanelBody>

                <PanelBody title={__('Card Styling', 'flipcard-block')} initialOpen={false}>
                    <BaseControl label={__('Front Background Color', 'flipcard-block')}>
                        <ColorPicker
                            color={frontBackgroundColor || '#ffffff'}
                            onChangeComplete={(color) => {
                                const alpha = color.rgb.a !== undefined ? color.rgb.a : 1;
                                const colorValue = alpha < 1 
                                    ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`
                                    : color.hex;
                                setAttributes({ frontBackgroundColor: colorValue });
                            }}
                            enableAlpha={true}
                        />
                        <Button
                            onClick={() => setAttributes({ frontBackgroundColor: '#ffffff' })}
                            isSmall
                            style={{ marginTop: '8px' }}
                        >
                            {__('Reset', 'flipcard-block')}
                        </Button>
                    </BaseControl>

                    <BaseControl label={__('Back Background Color', 'flipcard-block')} style={{ marginTop: '16px' }}>
                        <ColorPicker
                            color={backBackgroundColor || '#f5f5f5'}
                            onChangeComplete={(color) => {
                                const alpha = color.rgb.a !== undefined ? color.rgb.a : 1;
                                const colorValue = alpha < 1 
                                    ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`
                                    : color.hex;
                                setAttributes({ backBackgroundColor: colorValue });
                            }}
                            enableAlpha={true}
                        />
                        <Button
                            onClick={() => setAttributes({ backBackgroundColor: '#f5f5f5' })}
                            isSmall
                            style={{ marginTop: '8px' }}
                        >
                            {__('Reset', 'flipcard-block')}
                        </Button>
                    </BaseControl>

                    <p style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>
                        {__('Front Face Border', 'flipcard-block')}
                    </p>
                    <BaseControl label={__('Front Border Color', 'flipcard-block')}>
                        <ColorPicker
                            color={frontBorderColor || '#e0e0e0'}
                            onChangeComplete={(color) => {
                                const alpha = color.rgb.a !== undefined ? color.rgb.a : 1;
                                const colorValue = alpha < 1 
                                    ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`
                                    : color.hex;
                                setAttributes({ frontBorderColor: colorValue });
                            }}
                            enableAlpha={true}
                        />
                        <Button
                            onClick={() => setAttributes({ frontBorderColor: '#e0e0e0' })}
                            isSmall
                            style={{ marginTop: '8px' }}
                        >
                            {__('Reset', 'flipcard-block')}
                        </Button>
                    </BaseControl>

                    <RangeControl
                        label={__('Front Border Width (px)', 'flipcard-block')}
                        value={frontBorderWidth ?? 1}
                        onChange={(value) => setAttributes({ frontBorderWidth: value })}
                        min={0}
                        max={10}
                        step={1}
                    />

                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Back Face Border', 'flipcard-block')}
                    </p>
                    <BaseControl label={__('Back Border Color', 'flipcard-block')}>
                        <ColorPicker
                            color={backBorderColor || '#e0e0e0'}
                            onChangeComplete={(color) => {
                                const alpha = color.rgb.a !== undefined ? color.rgb.a : 1;
                                const colorValue = alpha < 1 
                                    ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`
                                    : color.hex;
                                setAttributes({ backBorderColor: colorValue });
                            }}
                            enableAlpha={true}
                        />
                        <Button
                            onClick={() => setAttributes({ backBorderColor: '#e0e0e0' })}
                            isSmall
                            style={{ marginTop: '8px' }}
                        >
                            {__('Reset', 'flipcard-block')}
                        </Button>
                    </BaseControl>

                    <RangeControl
                        label={__('Back Border Width (px)', 'flipcard-block')}
                        value={backBorderWidth ?? 1}
                        onChange={(value) => setAttributes({ backBorderWidth: value })}
                        min={0}
                        max={10}
                        step={1}
                    />

                    <RangeControl
                        label={__('Border Radius (px)', 'flipcard-block')}
                        value={borderRadius ?? 8}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0}
                        max={50}
                        step={1}
                    />

                    <RangeControl
                        label={__('Padding (px)', 'flipcard-block')}
                        value={padding ?? 20}
                        onChange={(value) => setAttributes({ padding: value })}
                        min={0}
                        max={60}
                        step={5}
                    />

                    <RangeControl
                        label={__('Shadow Intensity', 'flipcard-block')}
                        value={shadowIntensity ?? 0.1}
                        onChange={(value) => setAttributes({ shadowIntensity: value })}
                        min={0}
                        max={1}
                        step={0.05}
                    />
                </PanelBody>

                <PanelBody title={__('Flip Animation', 'flipcard-block')} initialOpen={false}>
                    <SelectControl
                        label={__('Flip Direction', 'flipcard-block')}
                        value={flipDirection}
                        options={[
                            { label: __('Horizontal', 'flipcard-block'), value: 'horizontal' },
                            { label: __('Vertical', 'flipcard-block'), value: 'vertical' },
                        ]}
                        onChange={(value) => setAttributes({ flipDirection: value })}
                    />
                    <RangeControl
                        label={__('Animation Duration (s)', 'flipcard-block')}
                        value={animationDuration}
                        onChange={(value) => setAttributes({ animationDuration: value })}
                        min={0.3}
                        max={2.0}
                        step={0.1}
                    />
                    <SelectControl
                        label={__('Animation Easing', 'flipcard-block')}
                        value={animationEasing}
                        options={[
                            { label: __('Ease In Out', 'flipcard-block'), value: 'ease-in-out' },
                            { label: __('Ease In', 'flipcard-block'), value: 'ease-in' },
                            { label: __('Ease Out', 'flipcard-block'), value: 'ease-out' },
                            { label: __('Linear', 'flipcard-block'), value: 'linear' },
                        ]}
                        onChange={(value) => setAttributes({ animationEasing: value })}
                    />
                </PanelBody>
            </InspectorTabs>

            <div {...blockProps}>
                <QuickZone
                    id="colors"
                    label={__('Colors', 'flipcard-block')}
                    activeZone={activeZone}
                    setActiveZone={setActiveZone}
                    content={
                        <>
                            <p>{__('Front Background', 'flipcard-block')}</p>
                            <ColorPicker
                                color={frontBackgroundColor || '#ffffff'}
                                onChangeComplete={(color) => {
                                    const alpha = color.rgb.a !== undefined ? color.rgb.a : 1;
                                    const colorValue = alpha < 1
                                        ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`
                                        : color.hex;
                                    setAttributes({ frontBackgroundColor: colorValue });
                                }}
                                enableAlpha={true}
                            />
                            <p>{__('Back Background', 'flipcard-block')}</p>
                            <ColorPicker
                                color={backBackgroundColor || '#f5f5f5'}
                                onChangeComplete={(color) => {
                                    const alpha = color.rgb.a !== undefined ? color.rgb.a : 1;
                                    const colorValue = alpha < 1
                                        ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`
                                        : color.hex;
                                    setAttributes({ backBackgroundColor: colorValue });
                                }}
                                enableAlpha={true}
                            />
                        </>
                    }
                >
                    <div className="adaire-flipcard__container">
                        <div className="adaire-flipcard__inner">
                            <div {...innerBlocksProps} />
                        </div>
                    </div>
                </QuickZone>
            </div>
        </>
    );
}



