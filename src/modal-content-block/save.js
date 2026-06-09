import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save() {
    const blockProps = useBlockProps.save({
        className: 'adaire-modal-content-block',
        'data-modal-role': 'content',
        tabIndex: -1,
    });

    return (
        <div {...blockProps}>
            <InnerBlocks.Content />
        </div>
    );
}






