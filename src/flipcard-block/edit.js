import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl, ButtonGroup, Button, TextControl, BaseControl, ColorPicker } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { useEffect, useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { createBlocksFromInnerBlocksTemplate } from '@wordpress/blocks';
import InspectorTabs from '../components/InspectorTabs';
import QuickZone from '../components/QuickZone';
import { FLIPCARD_PRESETS } from './flipcard-presets';
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
        cardBehaviour,
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
        backBorderWidth,
        contentPreset
    } = attributes;

    // Card behaviour: 'flip' (default) reveals the back face on hover/tap,
    // 'static' renders the front face only and never transforms.
    const isStatic = cardBehaviour === 'static';


    // Ensure blockId is set
    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: clientId });
        }
    }, [blockId, clientId, setAttributes]);

    // Locate the front/back child blocks so a preset can seed each face's content.
    const { replaceInnerBlocks } = useDispatch('core/block-editor');
    const { frontClientId, backClientId } = useSelect((select) => {
        const children = select('core/block-editor').getBlock(clientId)?.innerBlocks || [];
        return {
            frontClientId: children.find((b) => b.name === 'create-block/flipcard-front-block')?.clientId,
            backClientId: children.find((b) => b.name === 'create-block/flipcard-back-block')?.clientId,
        };
    }, [clientId]);

    const applyPreset = (preset) => {
        setAttributes({ contentPreset: preset.id, ...(preset.defaultAttrs || {}) });
        if (frontClientId) {
            replaceInnerBlocks(frontClientId, createBlocksFromInnerBlocksTemplate(preset.front), false);
        }
        if (backClientId) {
            replaceInnerBlocks(backClientId, createBlocksFromInnerBlocksTemplate(preset.back), false);
        }
    };

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
        // The `--static` modifier is only appended when the user actually
        // picks Static Card, so every card left on the default (Flip Card)
        // keeps byte-identical saved markup and needs no block recovery.
        className: `adaire-flipcard adaire-flipcard--${flipDirection}${isStatic ? ' adaire-flipcard--static' : ''}`,
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
                <PanelBody section="content" title={__('Starter Templates', 'adaire-blocks')} initialOpen={true}>
                    <p className="adaire-flipcard-presets__intro">
                        {__('Pick a starting point to fill both faces. You can freely edit, add or remove blocks on each face afterward.', 'adaire-blocks')}
                    </p>
                    <div className="adaire-flipcard-presets" role="listbox" aria-label={__('Starter templates', 'adaire-blocks')}>
                        {FLIPCARD_PRESETS.map((preset) => {
                            const isActive = contentPreset === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    className={`adaire-flipcard-presets__card${isActive ? ' is-active' : ''}`}
                                    onClick={() => applyPreset(preset)}
                                >
                                    <span className="adaire-flipcard-presets__swatches" aria-hidden="true">
                                        <span
                                            className="adaire-flipcard-presets__swatch adaire-flipcard-presets__swatch--front"
                                            style={{ background: preset.defaultAttrs?.frontBackgroundColor || '#ffffff' }}
                                        />
                                        <span
                                            className="adaire-flipcard-presets__swatch adaire-flipcard-presets__swatch--back"
                                            style={{ background: preset.defaultAttrs?.backBackgroundColor || '#f5f5f5' }}
                                        />
                                    </span>
                                    <span className="adaire-flipcard-presets__text">
                                        <span className="adaire-flipcard-presets__label">{preset.label}</span>
                                        <span className="adaire-flipcard-presets__hint">{preset.bestFor}</span>
                                    </span>
                                    {isActive && (
                                        <span className="adaire-flipcard-presets__check" aria-hidden="true">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </PanelBody>

                <PanelBody section="layout" title={__('Card Behaviour', 'adaire-blocks')} initialOpen={true}>
                    <SelectControl
                        label={__('Behaviour', 'adaire-blocks')}
                        value={cardBehaviour || 'flip'}
                        options={[
                            { label: __('Flip Card', 'adaire-blocks'), value: 'flip' },
                            { label: __('Static Card', 'adaire-blocks'), value: 'static' },
                        ]}
                        onChange={(value) => setAttributes({ cardBehaviour: value })}
                        help={
                            isStatic
                                ? __('Only the front face is shown. The card never flips, on any device or screen size.', 'adaire-blocks')
                                : __('The back face is revealed on hover, or on tap where hover is unavailable.', 'adaire-blocks')
                        }
                    />
                </PanelBody>

                <PanelBody section="layout" title={__('Card Dimensions', 'adaire-blocks')} initialOpen={true}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Device', 'adaire-blocks')}
                    </p>
                    <ButtonGroup style={{ marginBottom: '16px' }}>
                        <Button
                            icon={desktop}
                            isPrimary={deviceType === 'desktop'}
                            onClick={() => setDeviceType('desktop')}
                            label={__('Desktop', 'adaire-blocks')}
                        />
                        <Button
                            icon={tablet}
                            isPrimary={deviceType === 'tablet'}
                            onClick={() => setDeviceType('tablet')}
                            label={__('Tablet', 'adaire-blocks')}
                        />
                        <Button
                            icon={mobile}
                            isPrimary={deviceType === 'mobile'}
                            onClick={() => setDeviceType('mobile')}
                            label={__('Mobile', 'adaire-blocks')}
                        />
                    </ButtonGroup>

                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Card Width', 'adaire-blocks')}
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
                        {__('Card Height', 'adaire-blocks')}
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

                <PanelBody section="style" priority="high" title={__('Card Styling', 'adaire-blocks')} initialOpen={false}>
                    <BaseControl label={__('Front Background Color', 'adaire-blocks')}>
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
                            {__('Reset', 'adaire-blocks')}
                        </Button>
                    </BaseControl>

                    <BaseControl label={__('Back Background Color', 'adaire-blocks')} style={{ marginTop: '16px' }}>
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
                            {__('Reset', 'adaire-blocks')}
                        </Button>
                    </BaseControl>

                    <p style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>
                        {__('Front Face Border', 'adaire-blocks')}
                    </p>
                    <BaseControl label={__('Front Border Color', 'adaire-blocks')}>
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
                            {__('Reset', 'adaire-blocks')}
                        </Button>
                    </BaseControl>

                    <RangeControl
                        label={__('Front Border Width (px)', 'adaire-blocks')}
                        value={frontBorderWidth ?? 1}
                        onChange={(value) => setAttributes({ frontBorderWidth: value })}
                        min={0}
                        max={10}
                        step={1}
                    />

                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Back Face Border', 'adaire-blocks')}
                    </p>
                    <BaseControl label={__('Back Border Color', 'adaire-blocks')}>
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
                            {__('Reset', 'adaire-blocks')}
                        </Button>
                    </BaseControl>

                    <RangeControl
                        label={__('Back Border Width (px)', 'adaire-blocks')}
                        value={backBorderWidth ?? 1}
                        onChange={(value) => setAttributes({ backBorderWidth: value })}
                        min={0}
                        max={10}
                        step={1}
                    />

                    <RangeControl
                        label={__('Border Radius (px)', 'adaire-blocks')}
                        value={borderRadius ?? 8}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0}
                        max={50}
                        step={1}
                    />

                    <RangeControl
                        label={__('Padding (px)', 'adaire-blocks')}
                        value={padding ?? 20}
                        onChange={(value) => setAttributes({ padding: value })}
                        min={0}
                        max={60}
                        step={5}
                    />

                    <RangeControl
                        label={__('Shadow Intensity', 'adaire-blocks')}
                        value={shadowIntensity ?? 0.1}
                        onChange={(value) => setAttributes({ shadowIntensity: value })}
                        min={0}
                        max={1}
                        step={0.05}
                    />
                </PanelBody>

                {!isStatic && (
                <PanelBody section="layout" title={__('Flip Animation', 'adaire-blocks')} initialOpen={false}>
                    <SelectControl
                        label={__('Flip Direction', 'adaire-blocks')}
                        value={flipDirection}
                        options={[
                            { label: __('Horizontal', 'adaire-blocks'), value: 'horizontal' },
                            { label: __('Vertical', 'adaire-blocks'), value: 'vertical' },
                        ]}
                        onChange={(value) => setAttributes({ flipDirection: value })}
                    />
                    <RangeControl
                        label={__('Animation Duration (s)', 'adaire-blocks')}
                        value={animationDuration}
                        onChange={(value) => setAttributes({ animationDuration: value })}
                        min={0.3}
                        max={2.0}
                        step={0.1}
                    />
                    <SelectControl
                        label={__('Animation Easing', 'adaire-blocks')}
                        value={animationEasing}
                        options={[
                            { label: __('Ease In Out', 'adaire-blocks'), value: 'ease-in-out' },
                            { label: __('Ease In', 'adaire-blocks'), value: 'ease-in' },
                            { label: __('Ease Out', 'adaire-blocks'), value: 'ease-out' },
                            { label: __('Linear', 'adaire-blocks'), value: 'linear' },
                        ]}
                        onChange={(value) => setAttributes({ animationEasing: value })}
                    />
                </PanelBody>
                )}
            </InspectorTabs>

            <div {...blockProps}>
                <QuickZone
                    id="colors"
                    label={__('Colors', 'adaire-blocks')}
                    activeZone={activeZone}
                    setActiveZone={setActiveZone}
                    content={
                        <>
                            <p>{__('Front Background', 'adaire-blocks')}</p>
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
                            <p>{__('Back Background', 'adaire-blocks')}</p>
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



