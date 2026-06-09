import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

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

export default function save({ attributes }) {
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

    const defaults = {
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
    };

    const normalizedWidth = normalizeDimension(modalWidth, defaults.width);
    const normalizedHeight = normalizeDimension(modalHeight, defaults.height);

    const blockProps = useBlockProps.save({
        className: 'adaire-modal-block',
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
        'data-modal-open': 'false',
        id: blockId || undefined,
    });

    return (
        <div {...blockProps}>
            <InnerBlocks.Content />
        </div>
    );
}




