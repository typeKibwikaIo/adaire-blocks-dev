import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [
    'core/paragraph',
    'core/heading',
    'core/image',
    'core/button',
    'core/list',
    'core/quote',
    'core/group',
    'core/columns',
    'core/column',
];

const TEMPLATE = [
    ['core/group', {}, [
        ['core/heading', { level: 3, placeholder: __('Back Card Title', 'adaire-blocks') }],
        ['core/paragraph', { placeholder: __('Add content for the back of the card...', 'adaire-blocks') }]
    ]]
];

export default function Edit() {
    const blockProps = useBlockProps({
        className: 'adaire-flipcard-back',
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-flipcard-back__content' },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            template: TEMPLATE,
            templateLock: false,
            orientation: 'vertical',
        }
    );

    return (
        <div {...blockProps}>
            <div {...innerBlocksProps} />
        </div>
    );
}




