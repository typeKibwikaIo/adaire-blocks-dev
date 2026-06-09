import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    BaseControl,
    ButtonGroup,
    Button,
    ToggleControl,
} from '@wordpress/components';
import { ColorPicker } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { useEffect, useMemo, useState, createElement } from '@wordpress/element';
import './editor.scss';

// Custom icons for small laptop and big desktop (standard breakpoints)
const smallLaptopIcon = createElement('svg', {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
},
    createElement('path', {
        d: 'M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        fill: 'none'
    }),
    createElement('path', {
        d: 'M2 19H22',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        strokeLinecap: 'round'
    })
);

const bigDesktopIcon = createElement('svg', {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
},
    createElement('rect', {
        x: '3',
        y: '4',
        width: '18',
        height: '12',
        rx: '1',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        fill: 'none'
    }),
    createElement('path', {
        d: 'M8 20H16',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        strokeLinecap: 'round'
    }),
    createElement('rect', {
        x: '10',
        y: '20',
        width: '4',
        height: '2',
        rx: '0.5',
        fill: 'currentColor'
    })
);

const TEMPLATE = [
    ['create-block/modal-trigger-block'],
    ['create-block/modal-content-block'],
];

const ALLOWED_BLOCKS = [
    'create-block/modal-trigger-block',
    'create-block/modal-content-block',
];

// Width units: removed '%' since modal is fixed/positioned, percentage doesn't have a meaningful parent reference
const unitOptionsWidth = ['px', 'vw', 'rem'];
const unitOptionsHeight = ['px', '%', 'vh', 'auto'];

const formatSize = (size, fallbackValue, fallbackUnit) => {
    if (!size) {
        return `${fallbackValue}${fallbackUnit}`;
    }

    const { value, unit } = size;

    if (unit === 'auto') {
        return 'auto';
    }

    const safeUnit = unit || fallbackUnit;
    const safeValue = typeof value === 'number' ? value : fallbackValue;
    return `${safeValue}${safeUnit}`;
};

const normalizeDimension = (dimension, defaults) => {
    if (typeof dimension === 'object' && dimension !== null) {
        return {
            mobile: {
                value: dimension?.mobile?.value ?? defaults.mobile.value,
                unit: dimension?.mobile?.unit ?? defaults.mobile.unit,
            },
            tablet: {
                value: dimension?.tablet?.value ?? defaults.tablet.value,
                unit: dimension?.tablet?.unit ?? defaults.tablet.unit,
            },
            smallLaptop: {
                value: dimension?.smallLaptop?.value ?? defaults.smallLaptop?.value ?? defaults.desktop.value,
                unit: dimension?.smallLaptop?.unit ?? defaults.smallLaptop?.unit ?? defaults.desktop.unit,
            },
            desktop: {
                value: dimension?.desktop?.value ?? defaults.desktop.value,
                unit: dimension?.desktop?.unit ?? defaults.desktop.unit,
            },
            bigDesktop: {
                value: dimension?.bigDesktop?.value ?? defaults.bigDesktop?.value ?? defaults.desktop.value,
                unit: dimension?.bigDesktop?.unit ?? defaults.bigDesktop?.unit ?? defaults.desktop.unit,
            },
        };
    }

    return defaults;
};

export default function Edit({ attributes, setAttributes, clientId }) {
    const {
        blockId,
        modalWidth,
        modalHeight,
        backgroundColor,
        overlayColor,
        borderColor,
        borderWidth,
        borderRadius,
        padding,
        closeButtonColor,
        closeButtonBackground,
        closeButtonSize,
    } = attributes;

    const [deviceType, setDeviceType] = useState('desktop');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: clientId });
        }
    }, [blockId, clientId, setAttributes]);

    const defaults = useMemo(
        () => ({
            width: {
                mobile: { value: 90, unit: 'vw' }, // Use vw instead of % for fixed positioning
                tablet: { value: 90, unit: 'vw' }, // Use vw instead of % for fixed positioning
                smallLaptop: { value: 600, unit: 'px' },
                desktop: { value: 600, unit: 'px' },
                bigDesktop: { value: 600, unit: 'px' },
            },
            height: {
                mobile: { value: 360, unit: 'px' },
                tablet: { value: 400, unit: 'px' },
                smallLaptop: { value: 400, unit: 'px' },
                desktop: { value: 400, unit: 'px' },
                bigDesktop: { value: 400, unit: 'px' },
            },
        }),
        []
    );

    const normalizedWidth = normalizeDimension(modalWidth, defaults.width);
    const normalizedHeight = normalizeDimension(modalHeight, defaults.height);

    const handleDimensionChange = (dimension, device, key, value) => {
        const current = dimension === 'width' ? normalizedWidth : normalizedHeight;
        const updated = {
            ...current,
            [device]: {
                ...current[device],
                [key]: value,
            },
        };

        setAttributes({
            [dimension === 'width' ? 'modalWidth' : 'modalHeight']: updated,
        });
    };

    const blockProps = useBlockProps({
        className: `adaire-modal-block${isPreviewOpen ? ' is-preview-open' : ''}`,
        style: {
            '--modal-width-mobile': formatSize(normalizedWidth.mobile, 90, 'vw'),
            '--modal-width-tablet': formatSize(normalizedWidth.tablet, 90, 'vw'),
            '--modal-width-small-laptop': formatSize(normalizedWidth.smallLaptop, 600, 'px'),
            '--modal-width-desktop': formatSize(normalizedWidth.desktop, 600, 'px'),
            '--modal-width-big-desktop': formatSize(normalizedWidth.bigDesktop, 600, 'px'),
            '--modal-height-mobile': formatSize(normalizedHeight.mobile, 360, 'px'),
            '--modal-height-tablet': formatSize(normalizedHeight.tablet, 400, 'px'),
            '--modal-height-small-laptop': formatSize(normalizedHeight.smallLaptop, 400, 'px'),
            '--modal-height-desktop': formatSize(normalizedHeight.desktop, 400, 'px'),
            '--modal-height-big-desktop': formatSize(normalizedHeight.bigDesktop, 400, 'px'),
            '--modal-background': backgroundColor || '#ffffff',
            '--modal-overlay-color': overlayColor || 'rgba(0, 0, 0, 0.6)',
            '--modal-border-color': borderColor || '#e0e0e0',
            '--modal-border-width': `${borderWidth ?? 1}px`,
            '--modal-border-radius': `${borderRadius ?? 16}px`,
            '--modal-padding': `${padding ?? 24}px`,
            '--modal-close-color': closeButtonColor || '#111111',
            '--modal-close-bg': closeButtonBackground || 'rgba(255,255,255,0.9)',
            '--modal-close-size': `${closeButtonSize ?? 36}px`,
        },
        'data-modal-block': true,
        'data-preview-open': isPreviewOpen,
    });

    const innerBlocksProps = useInnerBlocksProps(
        {
            className: 'adaire-modal-block__inner-blocks',
        },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            template: TEMPLATE,
            templateLock: 'insert',
            orientation: 'vertical',
        }
    );

    const currentWidthUnit = normalizedWidth?.[deviceType]?.unit ?? 
        (deviceType === 'mobile' || deviceType === 'tablet' ? 'vw' : 'px');
    const currentHeightUnit = normalizedHeight?.[deviceType]?.unit ?? 'px';

    const widthDisabled = currentWidthUnit === 'auto';
    const heightDisabled = currentHeightUnit === 'auto';

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Modal Dimensions', 'modal-block')} initialOpen={true}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>{__('Device', 'modal-block')}</p>
                    <ButtonGroup style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
                        <Button
                            icon={mobile}
                            isPrimary={deviceType === 'mobile'}
                            onClick={() => setDeviceType('mobile')}
                            label={__('Mobile', 'modal-block')}
                        />
                        <Button
                            icon={tablet}
                            isPrimary={deviceType === 'tablet'}
                            onClick={() => setDeviceType('tablet')}
                            label={__('Tablet', 'modal-block')}
                        />
                        <Button
                            icon={smallLaptopIcon}
                            isPrimary={deviceType === 'smallLaptop'}
                            onClick={() => setDeviceType('smallLaptop')}
                            label={__('Small Laptop', 'modal-block')}
                        />
                        <Button
                            icon={desktop}
                            isPrimary={deviceType === 'desktop'}
                            onClick={() => setDeviceType('desktop')}
                            label={__('Desktop', 'modal-block')}
                        />
                        <Button
                            icon={bigDesktopIcon}
                            isPrimary={deviceType === 'bigDesktop'}
                            onClick={() => setDeviceType('bigDesktop')}
                            label={__('Big Desktop', 'modal-block')}
                        />
                    </ButtonGroup>

                    <BaseControl label={__('Modal Width', 'modal-block')}>
                        <input
                            type="number"
                            className="adaire-modal-block__dimension-input"
                            value={normalizedWidth?.[deviceType]?.value ?? ''}
                            disabled={widthDisabled}
                            onChange={(event) =>
                                handleDimensionChange('width', deviceType, 'value', Number(event.target.value))
                            }
                            min={0}
                        />
                        <ButtonGroup style={{ marginTop: '8px' }}>
                            {unitOptionsWidth.map((unit) => (
                                <Button
                                    key={unit}
                                    isPrimary={currentWidthUnit === unit}
                                    isSecondary={currentWidthUnit !== unit}
                                    onClick={() =>
                                        handleDimensionChange('width', deviceType, 'unit', unit)
                                    }
                                >
                                    {unit}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </BaseControl>

                    <BaseControl label={__('Modal Height', 'modal-block')} style={{ marginTop: '16px' }}>
                        <input
                            type="number"
                            className="adaire-modal-block__dimension-input"
                            value={normalizedHeight?.[deviceType]?.value ?? ''}
                            disabled={heightDisabled}
                            onChange={(event) =>
                                handleDimensionChange('height', deviceType, 'value', Number(event.target.value))
                            }
                            min={0}
                        />
                        <ButtonGroup style={{ marginTop: '8px' }}>
                            {unitOptionsHeight.map((unit) => (
                                <Button
                                    key={unit}
                                    isPrimary={currentHeightUnit === unit}
                                    isSecondary={currentHeightUnit !== unit}
                                    onClick={() =>
                                        handleDimensionChange('height', deviceType, 'unit', unit)
                                    }
                                >
                                    {unit}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </BaseControl>
                </PanelBody>

                <PanelBody title={__('Modal Styling', 'modal-block')} initialOpen={false}>
                    <BaseControl label={__('Background Color', 'modal-block')}>
                        <ColorPicker
                            color={backgroundColor || '#ffffff'}
                            onChangeComplete={(value) => {
                                const alpha = value.rgb.a ?? 1;
                                const next = alpha < 1
                                    ? `rgba(${value.rgb.r}, ${value.rgb.g}, ${value.rgb.b}, ${alpha})`
                                    : value.hex;
                                setAttributes({ backgroundColor: next });
                            }}
                            enableAlpha
                        />
                    </BaseControl>

                    <BaseControl label={__('Overlay Color', 'modal-block')} style={{ marginTop: '16px' }}>
                        <ColorPicker
                            color={overlayColor || 'rgba(0,0,0,0.6)'}
                            onChangeComplete={(value) => {
                                const alpha = value.rgb.a ?? 1;
                                const next = `rgba(${value.rgb.r}, ${value.rgb.g}, ${value.rgb.b}, ${alpha})`;
                                setAttributes({ overlayColor: next });
                            }}
                            enableAlpha
                        />
                    </BaseControl>

                    <BaseControl label={__('Border Color', 'modal-block')} style={{ marginTop: '16px' }}>
                        <ColorPicker
                            color={borderColor || '#e0e0e0'}
                            onChangeComplete={(value) => {
                                const alpha = value.rgb.a ?? 1;
                                const next = alpha < 1
                                    ? `rgba(${value.rgb.r}, ${value.rgb.g}, ${value.rgb.b}, ${alpha})`
                                    : value.hex;
                                setAttributes({ borderColor: next });
                            }}
                            enableAlpha
                        />
                    </BaseControl>

                    <RangeControl
                        label={__('Border Width (px)', 'modal-block')}
                        value={borderWidth ?? 1}
                        onChange={(value) => setAttributes({ borderWidth: value })}
                        min={0}
                        max={12}
                        step={1}
                    />

                    <RangeControl
                        label={__('Border Radius (px)', 'modal-block')}
                        value={borderRadius ?? 16}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0}
                        max={48}
                        step={1}
                    />

                    <RangeControl
                        label={__('Padding (px)', 'modal-block')}
                        value={padding ?? 24}
                        onChange={(value) => setAttributes({ padding: value })}
                        min={0}
                        max={80}
                        step={2}
                    />
                </PanelBody>

                <PanelBody title={__('Close Button', 'modal-block')} initialOpen={false}>
                    <BaseControl label={__('Icon Color', 'modal-block')}>
                        <ColorPicker
                            color={closeButtonColor || '#111111'}
                            onChangeComplete={(value) => {
                                const alpha = value.rgb.a ?? 1;
                                const next = alpha < 1
                                    ? `rgba(${value.rgb.r}, ${value.rgb.g}, ${value.rgb.b}, ${alpha})`
                                    : value.hex;
                                setAttributes({ closeButtonColor: next });
                            }}
                            enableAlpha
                        />
                    </BaseControl>

                    <BaseControl label={__('Background', 'modal-block')} style={{ marginTop: '16px' }}>
                        <ColorPicker
                            color={closeButtonBackground || 'rgba(255,255,255,0.9)'}
                            onChangeComplete={(value) => {
                                const alpha = value.rgb.a ?? 1;
                                const next = `rgba(${value.rgb.r}, ${value.rgb.g}, ${value.rgb.b}, ${alpha})`;
                                setAttributes({ closeButtonBackground: next });
                            }}
                            enableAlpha
                        />
                    </BaseControl>

                    <RangeControl
                        label={__('Size (px)', 'modal-block')}
                        value={closeButtonSize ?? 36}
                        onChange={(value) => setAttributes({ closeButtonSize: value })}
                        min={24}
                        max={64}
                        step={2}
                    />
                </PanelBody>

                <PanelBody title={__('Preview', 'modal-block')} initialOpen={false}>
                    <ToggleControl
                        label={__('Preview modal overlay', 'modal-block')}
                        checked={isPreviewOpen}
                        onChange={(value) => setIsPreviewOpen(value)}
                        help={__('Toggle to see how the modal appears when opened.', 'modal-block')}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div {...innerBlocksProps} />
            </div>
        </>
    );
}




