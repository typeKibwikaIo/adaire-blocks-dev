import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save() {
    const blockProps = useBlockProps.save({
        className: 'adaire-flipcard-back',
    });

    return (
        <div {...blockProps}>
            <div className="adaire-flipcard-back__content">
                <InnerBlocks.Content />
            </div>
        </div>
    );
}




