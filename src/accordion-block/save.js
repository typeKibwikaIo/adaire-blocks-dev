import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getDeviceValue } from '../components/DeviceSwitcher';

export default function save( { attributes } ) {
    const {
        blockId,
        items,
        titleColor,
        contentColor,
        backgroundColor,
        chevronColor,
        chevronSize,
        titleFontSize,
        contentFontSize,
        gap,
        radius,
        padding,
        animationDuration,
        animationEasing,
        allowMultipleOpen,
        firstItemOpenByDefault,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        marginHorizontal,
        titleFontWeight,
        contentFontWeight,
        shadowIntensity,
        contentBackgroundColor,
        dividerColor,
        dividerThickness,
        containerMode,
        containerMaxWidth,
    } = attributes;

    const blockProps = useBlockProps.save( {
        className: 'adaire-accordion',
        style: {
            '--acc-title-color': titleColor,
            '--acc-content-color': contentColor,
            '--acc-bg': backgroundColor,
            '--acc-chevron': chevronColor,
            '--acc-chevron-size': `${ getDeviceValue(chevronSize, 'desktop', 16) }px`,
            '--acc-chevron-size-tablet': `${ getDeviceValue(chevronSize, 'tablet', 14) }px`,
            '--acc-chevron-size-mobile': `${ getDeviceValue(chevronSize, 'mobile', 12) }px`,
            '--acc-title-size': `${ getDeviceValue(titleFontSize, 'desktop', 20) }px`,
            '--acc-title-size-tablet': `${ getDeviceValue(titleFontSize, 'tablet', 18) }px`,
            '--acc-title-size-mobile': `${ getDeviceValue(titleFontSize, 'mobile', 16) }px`,
            '--acc-content-size': `${ getDeviceValue(contentFontSize, 'desktop', 16) }px`,
            '--acc-content-size-tablet': `${ getDeviceValue(contentFontSize, 'tablet', 14) }px`,
            '--acc-content-size-mobile': `${ getDeviceValue(contentFontSize, 'mobile', 12) }px`,
            '--acc-gap': `${ getDeviceValue(gap, 'desktop', 12) }px`,
            '--acc-gap-tablet': `${ getDeviceValue(gap, 'tablet', 10) }px`,
            '--acc-gap-mobile': `${ getDeviceValue(gap, 'mobile', 8) }px`,
            '--acc-radius': `${ getDeviceValue(radius, 'desktop', 12) }px`,
            '--acc-radius-tablet': `${ getDeviceValue(radius, 'tablet', 10) }px`,
            '--acc-radius-mobile': `${ getDeviceValue(radius, 'mobile', 8) }px`,
            '--acc-padding-top': `${ padding?.desktop?.top ?? 20 }px`,
            '--acc-padding-right': `${ padding?.desktop?.right ?? 20 }px`,
            '--acc-padding-bottom': `${ padding?.desktop?.bottom ?? 20 }px`,
            '--acc-padding-left': `${ padding?.desktop?.left ?? 20 }px`,
            '--acc-padding-top-tablet': `${ padding?.tablet?.top ?? padding?.desktop?.top ?? 20 }px`,
            '--acc-padding-right-tablet': `${ padding?.tablet?.right ?? padding?.desktop?.right ?? 20 }px`,
            '--acc-padding-bottom-tablet': `${ padding?.tablet?.bottom ?? padding?.desktop?.bottom ?? 20 }px`,
            '--acc-padding-left-tablet': `${ padding?.tablet?.left ?? padding?.desktop?.left ?? 20 }px`,
            '--acc-padding-top-mobile': `${ padding?.mobile?.top ?? padding?.tablet?.top ?? padding?.desktop?.top ?? 20 }px`,
            '--acc-padding-right-mobile': `${ padding?.mobile?.right ?? padding?.tablet?.right ?? padding?.desktop?.right ?? 20 }px`,
            '--acc-padding-bottom-mobile': `${ padding?.mobile?.bottom ?? padding?.tablet?.bottom ?? padding?.desktop?.bottom ?? 20 }px`,
            '--acc-padding-left-mobile': `${ padding?.mobile?.left ?? padding?.tablet?.left ?? padding?.desktop?.left ?? 20 }px`,
            '--acc-duration': `${ animationDuration }ms`,
            '--acc-easing': animationEasing,
            '--acc-margin-top': `${ getDeviceValue(marginTop, 'desktop', 0) }px`,
            '--acc-margin-top-tablet': `${ getDeviceValue(marginTop, 'tablet', 0) }px`,
            '--acc-margin-top-mobile': `${ getDeviceValue(marginTop, 'mobile', 0) }px`,
            '--acc-margin-right': `${ getDeviceValue(marginRight, 'desktop', 0) }px`,
            '--acc-margin-right-tablet': `${ getDeviceValue(marginRight, 'tablet', 0) }px`,
            '--acc-margin-right-mobile': `${ getDeviceValue(marginRight, 'mobile', 0) }px`,
            '--acc-margin-bottom': `${ getDeviceValue(marginBottom, 'desktop', 0) }px`,
            '--acc-margin-bottom-tablet': `${ getDeviceValue(marginBottom, 'tablet', 0) }px`,
            '--acc-margin-bottom-mobile': `${ getDeviceValue(marginBottom, 'mobile', 0) }px`,
            '--acc-margin-left': `${ getDeviceValue(marginLeft, 'desktop', 0) }px`,
            '--acc-margin-left-tablet': `${ getDeviceValue(marginLeft, 'tablet', 0) }px`,
            '--acc-margin-left-mobile': `${ getDeviceValue(marginLeft, 'mobile', 0) }px`,
            '--acc-margin-h-desktop': `${ marginHorizontal?.desktop ?? 0 }px`,
            '--acc-margin-h-tablet': `${ marginHorizontal?.tablet ?? 0 }px`,
            '--acc-margin-h-mobile': `${ marginHorizontal?.mobile ?? 0 }px`,
            '--acc-title-weight': titleFontWeight,
            '--acc-content-weight': contentFontWeight,
            '--acc-shadow-intensity': shadowIntensity,
            '--acc-shadow-alpha': shadowIntensity,
            '--acc-shadow-alpha-hover': (typeof shadowIntensity === 'number' ? shadowIntensity * 0.5 : 0.04),
            '--acc-shadow-alpha-base': (typeof shadowIntensity === 'number' ? shadowIntensity * 0.25 : 0.02),
            // Ensure margins render on frontend regardless of theme CSS
            marginTop: `${ getDeviceValue(marginTop, 'desktop', 0) }px`,
            marginRight: `${ getDeviceValue(marginRight, 'desktop', 0) }px`,
            marginBottom: `${ getDeviceValue(marginBottom, 'desktop', 0) }px`,
            marginLeft: `${ getDeviceValue(marginLeft, 'desktop', 0) }px`,
            '--acc-content-bg': contentBackgroundColor,
            '--acc-divider-color': dividerColor,
            '--acc-divider-thickness': `${dividerThickness}px`,
            '--acc-container-mode': containerMode || 'full',
            '--acc-container-max-width': `${ containerMaxWidth?.desktop?.value ?? 1200 }${ containerMaxWidth?.desktop?.unit ?? 'px' }`,
            '--acc-container-max-width-tablet': `${ containerMaxWidth?.tablet?.value ?? 100 }${ containerMaxWidth?.tablet?.unit ?? '%' }`,
            '--acc-container-max-width-mobile': `${ containerMaxWidth?.mobile?.value ?? 100 }${ containerMaxWidth?.mobile?.unit ?? '%' }`,
        },
        'data-allow-multiple': allowMultipleOpen ? 'true' : 'false',
        'data-first-open': firstItemOpenByDefault ? 'true' : 'false',
        'data-block-id': blockId,
    } );

    return (
        <div { ...blockProps }>

            <div className={`adaire-accordion__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                <div className="adaire-accordion__list">
                    <InnerBlocks.Content />
                </div>
            </div>
        </div>
    );
}





