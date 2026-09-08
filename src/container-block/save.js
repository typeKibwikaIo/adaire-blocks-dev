import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
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

    const blockProps = useBlockProps.save({
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
        <div {...blockProps}>
            <div className="container-block__inner">
                <InnerBlocks.Content />
            </div>
        </div>
    );
}