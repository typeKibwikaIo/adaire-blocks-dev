import { useBlockProps } from '@wordpress/block-editor';

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
    } = attributes;

    const blockProps = useBlockProps.save({
        className: 'your-block',
        style: {
            // Container max width CSS variables
            '--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
            '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
            '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
            
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
        },
    });

    return (
        <div {...blockProps} data-block-id={blockId}>
            <div className={`your-block__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                {/* Your block content goes here */}
                <div className="your-block__content">
                    <p>Your Block Content</p>
                </div>
            </div>
        </div>
    );
}

