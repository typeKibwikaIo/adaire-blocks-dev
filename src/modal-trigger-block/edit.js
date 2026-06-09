import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import './editor.scss';

const TEMPLATE = [[ 'core/button', { text: __('Open Modal', 'modal-block') } ]];

export default function Edit() {
    const blockProps = useBlockProps({
        className: 'adaire-modal-trigger-block',
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        template: TEMPLATE,
        templateLock: false,
    });

    return <div {...innerBlocksProps} />;
}





