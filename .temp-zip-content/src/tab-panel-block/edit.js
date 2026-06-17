import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import './style.scss';

export default function Edit({ attributes, clientId }) {
    const { tabIndex } = attributes;

    // Get the parent tabs block's active tab
    const { parentActiveTab } = useSelect((select) => {
        const { getBlockParents, getBlock } = select('core/block-editor');
        const parents = getBlockParents(clientId);
        
        // Find the tabs block in the parent chain
        let tabsBlock = null;
        for (let i = 0; i < parents.length; i++) {
            const parent = getBlock(parents[i]);
            if (parent && parent.name === 'create-block/tabs-block') {
                tabsBlock = parent;
                break;
            }
        }
        
        return {
            parentActiveTab: tabsBlock?.attributes?.activeTab ?? 0,
        };
    }, [clientId]);

    const isActive = tabIndex === parentActiveTab;

    // Debug logging
    const blockProps = useBlockProps({
        className: `adaire-tab-panel ${isActive ? 'is-active' : ''}`,
        'data-tab-index': tabIndex,
        style: {
            display: isActive ? 'block' : 'none',
            height: isActive ? 'auto' : '0',
            overflow: isActive ? 'visible' : 'hidden',
            opacity: isActive ? 1 : 0,
            visibility: isActive ? 'visible' : 'hidden',
            position: isActive ? 'relative' : 'absolute',
            top: isActive ? 'auto' : 0,
            left: isActive ? 'auto' : 0,
            right: isActive ? 'auto' : 0,
        },
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-tab-panel__content' },
        {
            template: [
                ['core/group', {}, [
                    ['core/paragraph', { 
                        placeholder: __('Add content for this tab...', 'tab-panel-block')
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




