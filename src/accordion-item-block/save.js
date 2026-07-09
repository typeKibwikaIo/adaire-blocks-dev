import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        title,
        itemId,
        itemIndex,
        open,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        textTransform,
        fontFamily,
    } = attributes;

    const blockProps = useBlockProps.save({
        className: `adaire-accordion__item${open ? ' is-open' : ''}`,
        'data-item-id': itemId,
        'data-item-index': itemIndex,
        style: {
            ...(fontSize ? { '--acc-title-size': fontSize } : {}),
            ...(fontWeight ? { '--acc-title-weight': fontWeight } : {}),
            '--acc-item-title-line-height': lineHeight || '1.4',
            '--acc-item-title-letter-spacing': letterSpacing || 'normal',
            '--acc-item-title-text-transform': textTransform || 'none',
            '--acc-item-title-font-family': fontFamily || 'inherit',
        },
    });

    return (
        <div {...blockProps}>
            <button 
                type="button" 
                className="adaire-accordion__header" 
                aria-expanded={open ? 'true' : 'false'}
            >
                <span className="adaire-accordion__title">{title}</span>
                <span className="adaire-accordion__chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                            d="M6 9L12 15L18 9" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </button>
            <div className="adaire-accordion__panel">
                <div className="adaire-accordion__content">
                    <InnerBlocks.Content />
                </div>
            </div>
        </div>
    );
}




