import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { contentPadding } = attributes;

    const pad = {
        top:    contentPadding?.top    ?? 24,
        right:  contentPadding?.right  ?? 24,
        bottom: contentPadding?.bottom ?? 24,
        left:   contentPadding?.left   ?? 24,
    };

    const blockProps = useBlockProps.save({
        className: 'adaire-modal-content-block',
        'data-modal-role': 'content',
        tabIndex: -1,
        style: {
            '--content-padding-top':    `${pad.top}px`,
            '--content-padding-right':  `${pad.right}px`,
            '--content-padding-bottom': `${pad.bottom}px`,
            '--content-padding-left':   `${pad.left}px`,
        },
    });

    return (
        <div {...blockProps}>
            <InnerBlocks.Content />
        </div>
    );
}
