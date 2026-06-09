import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save() {
    const blockProps = useBlockProps.save({
        className: 'adaire-modal-trigger-block',
        'data-modal-role': 'trigger',
        tabIndex: 0,
        role: 'button',
        'aria-haspopup': 'dialog',
    });

    return (
        <div {...blockProps}>
            <InnerBlocks.Content />
        </div>
    );
}




