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
        overflow
    } = attributes;

    const blockProps = useBlockProps.save({
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
        <div {...blockProps}>
            <div className="container-block__inner">
                <InnerBlocks.Content />
            </div>
        </div>
    );
}