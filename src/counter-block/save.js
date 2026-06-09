import { useBlockProps } from '@wordpress/block-editor';
import { getDeviceValue } from '../components/DeviceSwitcher';

export default function save({ attributes }) {
    const {
        blockId,
        containerMode,
        containerMaxWidth,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        startingNumber,
        endingNumber,
        duration,
        delayBool,
        delayTime,
        fontSize,
        captionFontSize
    } = attributes;

    const blockProps = useBlockProps.save({
        className: 'ab-counter-block',
        style: {
            // Container max width CSS variables
            '--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
            '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
            '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
            '--container-max-width-watch': `${containerMaxWidth?.smartwatch?.value ?? 100}${containerMaxWidth?.smartwatch?.unit ?? '%'}`,

            // Desktop margins
            marginTop: `${marginTop?.desktop ?? 0}px`,
            marginRight: `${marginRight?.desktop ?? 0}px`,
            marginBottom: `${marginBottom?.desktop ?? 0}px`,
            marginLeft: `${marginLeft?.desktop ?? 0}px`,

            // Responsive margin CSS variables
            '--margin-top-tablet': `${marginTop?.tablet ?? 0}px`,
            '--margin-right-tablet': `${marginRight?.tablet ?? 0}px`,
            '--margin-bottom-tablet': `${marginBottom?.tablet ?? 0}px`,
            '--margin-left-tablet': `${marginLeft?.tablet ?? 0}px`,

            '--margin-top-mobile': `${marginTop?.mobile ?? 0}px`,
            '--margin-right-mobile': `${marginRight?.mobile ?? 0}px`,
            '--margin-bottom-mobile': `${marginBottom?.mobile ?? 0}px`,
            '--margin-left-mobile': `${marginLeft?.mobile ?? 0}px`,

            '--margin-top-watch': `${marginTop?.smartwatch ?? 0}px`,
            '--margin-right-watch': `${marginRight?.smartwatch ?? 0}px`,
            '--margin-bottom-watch': `${marginBottom?.smartwatch ?? 0}px`,
            '--margin-left-watch': `${marginLeft?.smartwatch ?? 0}px`,

            // Desktop padding
            paddingTop: `${paddingTop?.desktop ?? 0}px`,
            paddingRight: `${paddingRight?.desktop ?? 0}px`,
            paddingBottom: `${paddingBottom?.desktop ?? 0}px`,
            paddingLeft: `${paddingLeft?.desktop ?? 0}px`,

            // Responsive padding CSS variables
            '--padding-top-tablet': `${paddingTop?.tablet ?? 0}px`,
            '--padding-right-tablet': `${paddingRight?.tablet ?? 0}px`,
            '--padding-bottom-tablet': `${paddingBottom?.tablet ?? 0}px`,
            '--padding-left-tablet': `${paddingLeft?.tablet ?? 0}px`,

            '--padding-top-mobile': `${paddingTop?.mobile ?? 0}px`,
            '--padding-right-mobile': `${paddingRight?.mobile ?? 0}px`,
            '--padding-bottom-mobile': `${paddingBottom?.mobile ?? 0}px`,
            '--padding-left-mobile': `${paddingLeft?.mobile ?? 0}px`,

            '--padding-top-watch': `${paddingTop?.smartwatch ?? 0}px`,
            '--padding-right-watch': `${paddingRight?.smartwatch ?? 0}px`,
            '--padding-bottom-watch': `${paddingBottom?.smartwatch ?? 0}px`,
            '--padding-left-watch': `${paddingLeft?.smartwatch ?? 0}px`,

            // Font size CSS variables
            '--counter-font-size': `${getDeviceValue(fontSize, 'desktop', 48)}px`,
            '--counter-font-size-tablet': `${getDeviceValue(fontSize, 'tablet', 42)}px`,
            '--counter-font-size-mobile': `${getDeviceValue(fontSize, 'mobile', 36)}px`,
            '--counter-font-size-watch': `${getDeviceValue(fontSize, 'smartwatch', 28)}px`,

            '--caption-font-size': `${getDeviceValue(captionFontSize, 'desktop', 16)}px`,
            '--caption-font-size-tablet': `${getDeviceValue(captionFontSize, 'tablet', 14)}px`,
            '--caption-font-size-mobile': `${getDeviceValue(captionFontSize, 'mobile', 12)}px`,
            '--caption-font-size-watch': `${getDeviceValue(captionFontSize, 'smartwatch', 10)}px`,
        }
    });

    return (
        <div {...blockProps} 
             data-block-id={blockId}
             data-starting-number={startingNumber}
             data-ending-number={endingNumber}
             data-duration={duration}
             data-delay-bool={delayBool}
             data-delay-time={delayTime}>
            <div className={`ab-counter-block__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                <div className="ab-counter-block__content">
                    <span className="displayNumber">{startingNumber}</span>
                </div>
            </div>
        </div>
    );
}




