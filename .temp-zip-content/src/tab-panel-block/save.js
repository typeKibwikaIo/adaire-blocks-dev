import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { tabIndex, isActive } = attributes;

    const blockProps = useBlockProps.save({
        className: `adaire-tab-panel ${isActive ? 'is-active' : ''}`,
        'data-tab-index': tabIndex,
        role: 'tabpanel',
    });

    return (
        <div {...blockProps}>
            <div className="adaire-tab-panel__content">
                <InnerBlocks.Content />
            </div>
        </div>
    );
}




