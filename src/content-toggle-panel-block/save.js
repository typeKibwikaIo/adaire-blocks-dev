import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { toggleIndex, isActive } = attributes;

    const blockProps = useBlockProps.save({
        className: `adaire-content-toggle-panel ${isActive ? 'is-active' : ''}`,
        'data-toggle-index': toggleIndex,
        role: 'tabpanel',
    });

    return (
        <div {...blockProps}>
            <div className="adaire-content-toggle-panel__content">
                <InnerBlocks.Content />
            </div>
        </div>
    );
}




