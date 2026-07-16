import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { triggerType, floatingPosition, floatingOffsetX, floatingOffsetY } = attributes;

    const isFloating = triggerType === 'floating';

    const blockProps = useBlockProps.save({
        className: 'adaire-modal-trigger-block',
        'data-modal-role': 'trigger',
        'data-trigger-type': triggerType || 'button',
        tabIndex: 0,
        role: 'button',
        'aria-haspopup': 'dialog',
        ...(isFloating && {
            'data-floating-position': floatingPosition || 'bottom-right',
            style: {
                '--floating-offset-x': `${floatingOffsetX ?? 24}px`,
                '--floating-offset-y': `${floatingOffsetY ?? 24}px`,
            },
        }),
    });

    return (
        <div {...blockProps}>
            <InnerBlocks.Content />
        </div>
    );
}
