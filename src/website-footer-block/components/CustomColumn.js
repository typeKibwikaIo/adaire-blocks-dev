import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function CustomColumn({ attributes, setAttributes, isSelected }) {
    const { textAlign } = attributes;

    const columnProps = useBlockProps({
        className: 'website-footer-block__column website-footer-block__column--custom',
        style: { textAlign }
    });

    const ALLOWED_BLOCKS = ['core/paragraph', 'core/heading', 'core/image', 'core/buttons', 'core/spacer', 'core/separator', 'core/html'];

    return (
        <div {...columnProps}>
            <InnerBlocks
                allowedBlocks={ALLOWED_BLOCKS}
                templateLock={false}
                renderAppender={isSelected ? InnerBlocks.ButtonBlockAppender : () => null}
            />
        </div>
    );
}