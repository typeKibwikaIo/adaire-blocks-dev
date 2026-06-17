import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import './style.scss';

export default function Edit({ attributes, clientId }) {
    const { toggleIndex } = attributes;

    // Get the parent content-toggle block's active toggle
    const { parentActiveToggle } = useSelect((select) => {
        const { getBlockParents, getBlock } = select('core/block-editor');
        const parents = getBlockParents(clientId);
        
        // Find the content-toggle block in the parent chain
        let contentToggleBlock = null;
        for (let i = 0; i < parents.length; i++) {
            const parent = getBlock(parents[i]);
            if (parent && parent.name === 'create-block/content-toggle-block') {
                contentToggleBlock = parent;
                break;
            }
        }
        
        return {
            parentActiveToggle: contentToggleBlock?.attributes?.activeToggle ?? 0,
        };
    }, [clientId]);

    const isActive = toggleIndex === parentActiveToggle;

    const blockProps = useBlockProps({
        className: `adaire-content-toggle-panel ${isActive ? 'is-active' : ''}`,
        'data-toggle-index': toggleIndex,
        style: {
            display: isActive ? 'block' : 'none',
        },
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-content-toggle-panel__content' },
        {
            template: [
                ['core/group', {}, [
                    ['core/paragraph', { 
                        placeholder: __('Add content for this toggle...', 'content-toggle-panel-block')
                    }]
                ]]
            ],
            templateLock: false,
            renderAppender: isActive ? undefined : false,
        }
    );

    return (
        <div {...blockProps}>
            <div {...innerBlocksProps} />
        </div>
    );
}




