import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save() {
    const blockProps = useBlockProps.save({
        className: 'adaire-flipcard-front',
    });

    return (
        <div {...blockProps}>
            <div className="adaire-flipcard-front__content">
                <InnerBlocks.Content />
            </div>
        </div>
    );
}




