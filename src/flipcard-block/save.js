import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { 
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
        backBorderWidth
    } = attributes;

    // Card behaviour: 'flip' (default) reveals the back face on hover/tap,
    // 'static' renders the front face only and never transforms.
    const isStatic = cardBehaviour === 'static';


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

    const blockProps = useBlockProps.save({
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

    return (
        <div {...blockProps}>
            <div className="adaire-flipcard__container">
                <div className="adaire-flipcard__inner">
                    <InnerBlocks.Content />
                </div>
            </div>
        </div>
    );
}




