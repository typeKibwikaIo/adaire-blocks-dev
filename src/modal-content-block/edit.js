import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import './editor.scss';

const TEMPLATE = [
    ['core/heading', { level: 3, placeholder: __('Modal titleâ€¦', 'modal-block') }],
    ['core/paragraph', { placeholder: __('Add description, media, or any other blocksâ€¦', 'modal-block') }],
];

export default function Edit() {
    const blockProps = useBlockProps({
        className: 'adaire-modal-content-block',
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        template: TEMPLATE,
        templateLock: false,
    });

    return <div {...innerBlocksProps} />;
}






