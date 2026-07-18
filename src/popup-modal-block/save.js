import { useBlockProps, InnerBlocks, RichText } from '@wordpress/block-editor';

const formatSize = (size, fallbackValue, fallbackUnit) => {
    if (!size) return `${fallbackValue}${fallbackUnit}`;
    const { value, unit } = size;
    if (unit === 'auto') return 'auto';
    return `${typeof value === 'number' ? value : fallbackValue}${unit || fallbackUnit}`;
};

const normalizeDimension = (dimension, defaults) => {
    if (typeof dimension === 'object' && dimension !== null) {
        return {
            mobile:      { value: dimension?.mobile?.value      ?? defaults.mobile.value,      unit: dimension?.mobile?.unit      ?? defaults.mobile.unit },
            tablet:      { value: dimension?.tablet?.value      ?? defaults.tablet.value,      unit: dimension?.tablet?.unit      ?? defaults.tablet.unit },
            smallLaptop: { value: dimension?.smallLaptop?.value ?? defaults.smallLaptop?.value ?? defaults.desktop.value, unit: dimension?.smallLaptop?.unit ?? defaults.smallLaptop?.unit ?? defaults.desktop.unit },
            desktop:     { value: dimension?.desktop?.value     ?? defaults.desktop.value,     unit: dimension?.desktop?.unit     ?? defaults.desktop.unit },
            bigDesktop:  { value: dimension?.bigDesktop?.value  ?? defaults.bigDesktop?.value  ?? defaults.desktop.value, unit: dimension?.bigDesktop?.unit  ?? defaults.bigDesktop?.unit  ?? defaults.desktop.unit },
        };
    }
    return defaults;
};

export default function save({ attributes }) {
    const {
        blockId,
        modalWidth, modalHeight,
        backgroundColor, overlayColor,
        borderColor, borderWidth, borderRadius, padding,
        closeButtonColor, closeButtonBackground, closeButtonSize,
        animationType, animationDuration, animationEasing,
        modalPosition,
        closeButtonPosition, closeButtonShape, showCloseButton,
        boxShadowEnabled,
        backdropBlurEnabled, backdropBlurAmount,
        autoOpen, autoOpenDelay,
        overlayClickClose,
        contentPadding,
        triggerText, triggerType, floatingPosition, floatingOffsetX, floatingOffsetY,
        triggerTextColor, triggerBackgroundColor, triggerBorderRadius,
        triggerPaddingX, triggerPaddingY, triggerFontSize, triggerFontWeight,
        autoOpenScrollPercent, autoOpenInactivitySeconds, autoOpenEventName, autoOpenElementSelector,
        showFrequency,
        countdownEnabled, countdownMinutes,
        glassmorphismEnabled,
        overlayGradientEnabled, overlayGradientColor2,
    } = attributes;

    const defaults = {
        width: {
            mobile:      { value: 90,  unit: 'vw' },
            tablet:      { value: 90,  unit: 'vw' },
            smallLaptop: { value: 600, unit: 'px' },
            desktop:     { value: 600, unit: 'px' },
            bigDesktop:  { value: 600, unit: 'px' },
        },
        height: {
            mobile:      { value: 360, unit: 'px' },
            tablet:      { value: 400, unit: 'px' },
            smallLaptop: { value: 400, unit: 'px' },
            desktop:     { value: 400, unit: 'px' },
            bigDesktop:  { value: 400, unit: 'px' },
        },
    };

    const normalizedWidth  = normalizeDimension(modalWidth,  defaults.width);
    const normalizedHeight = normalizeDimension(modalHeight, defaults.height);

    const pad = {
        top:    contentPadding?.top    ?? 24,
        right:  contentPadding?.right  ?? 24,
        bottom: contentPadding?.bottom ?? 24,
        left:   contentPadding?.left   ?? 24,
    };

    const isFloating = triggerType === 'floating';

    const blockProps = useBlockProps.save({
        className: [
            'adaire-popup-modal-block',
            glassmorphismEnabled ? 'has-glassmorphism' : '',
            overlayGradientEnabled ? 'has-overlay-gradient' : '',
        ].filter(Boolean).join(' '),
        style: {
            '--modal-width-mobile':        formatSize(normalizedWidth.mobile,      90,  'vw'),
            '--modal-width-tablet':        formatSize(normalizedWidth.tablet,      90,  'vw'),
            '--modal-width-small-laptop':  formatSize(normalizedWidth.smallLaptop, 600, 'px'),
            '--modal-width-desktop':       formatSize(normalizedWidth.desktop,     600, 'px'),
            '--modal-width-big-desktop':   formatSize(normalizedWidth.bigDesktop,  600, 'px'),
            '--modal-height-mobile':       formatSize(normalizedHeight.mobile,      360, 'px'),
            '--modal-height-tablet':       formatSize(normalizedHeight.tablet,      400, 'px'),
            '--modal-height-small-laptop': formatSize(normalizedHeight.smallLaptop, 400, 'px'),
            '--modal-height-desktop':      formatSize(normalizedHeight.desktop,     400, 'px'),
            '--modal-height-big-desktop':  formatSize(normalizedHeight.bigDesktop,  400, 'px'),
            '--modal-background':       backgroundColor       || '#ffffff',
            '--modal-overlay-color':    overlayColor          || 'rgba(0, 0, 0, 0.6)',
            '--modal-border-color':     borderColor           || '#e0e0e0',
            '--modal-border-width':    `${borderWidth         ?? 1}px`,
            '--modal-border-radius':   `${borderRadius        ?? 16}px`,
            '--modal-padding':         `${padding             ?? 24}px`,
            '--modal-close-color':      closeButtonColor      || '#111111',
            '--modal-close-bg':         closeButtonBackground || 'rgba(255,255,255,0.9)',
            '--modal-close-size':      `${closeButtonSize     ?? 36}px`,
            '--modal-animation-duration': `${animationDuration ?? 300}ms`,
            '--modal-animation-easing':   animationEasing     || 'ease-out',
            '--modal-backdrop-blur':      backdropBlurEnabled  ? `${backdropBlurAmount ?? 8}px` : '0px',
            '--modal-box-shadow':         boxShadowEnabled !== false ? '0 32px 80px rgba(15, 23, 42, 0.35)' : 'none',
            '--content-padding-top':    `${pad.top}px`,
            '--content-padding-right':  `${pad.right}px`,
            '--content-padding-bottom': `${pad.bottom}px`,
            '--content-padding-left':  `${pad.left}px`,
            '--trigger-color':          triggerTextColor       || '#ffffff',
            '--trigger-bg':             triggerBackgroundColor || '#111827',
            '--trigger-radius':        `${triggerBorderRadius  ?? 8}px`,
            '--trigger-padding-x':     `${triggerPaddingX      ?? 20}px`,
            '--trigger-padding-y':     `${triggerPaddingY      ?? 12}px`,
            '--trigger-font-size':     `${triggerFontSize      ?? 16}px`,
            '--trigger-font-weight':    triggerFontWeight      || '600',
            '--modal-overlay-gradient-2': overlayGradientColor2 || '#7c3aed',
        },
        'data-modal-block':     true,
        'data-modal-open':      'false',
        'data-modal-anim':      animationType       || 'fade',
        'data-modal-position':  modalPosition       || 'center',
        'data-close-pos':       closeButtonPosition || 'top-right',
        'data-close-shape':     closeButtonShape    || 'circle',
        'data-auto-open':       autoOpen            || 'none',
        'data-auto-open-delay': String(autoOpenDelay ?? 3),
        'data-scroll-percent':  String(autoOpenScrollPercent ?? 50),
        'data-inactivity-seconds': String(autoOpenInactivitySeconds ?? 30),
        'data-event-name':      autoOpenEventName   || 'adaire-modal-open',
        'data-element-selector': autoOpenElementSelector || '',
        'data-show-frequency':  showFrequency       || 'always',
        'data-overlay-close':   overlayClickClose !== false ? 'true' : 'false',
        'data-show-close':      showCloseButton   !== false ? 'true' : 'false',
        'data-countdown-enabled': countdownEnabled ? 'true' : 'false',
        'data-countdown-minutes': String(countdownMinutes ?? 15),
        id: blockId || undefined,
    });

    return (
        <div {...blockProps}>
            <button
                type="button"
                className="adaire-popup-modal-block__trigger"
                data-modal-role="trigger"
                data-trigger-type={triggerType || 'button'}
                {...(isFloating && { 'data-floating-position': floatingPosition || 'bottom-right' })}
                aria-haspopup="dialog"
                style={isFloating ? {
                    '--floating-offset-x': `${floatingOffsetX ?? 24}px`,
                    '--floating-offset-y': `${floatingOffsetY ?? 24}px`,
                } : undefined}
            >
                <RichText.Content tagName="span" value={triggerText} />
            </button>
            {countdownEnabled && (
                <div className="adaire-popup-modal-block__countdown" data-countdown-display></div>
            )}
            <div className="adaire-popup-modal-block__body" data-modal-role="content">
                <InnerBlocks.Content />
            </div>
        </div>
    );
}
