import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, RichText } from '@wordpress/block-editor';
import { useSelect, useDispatch, useRegistry } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import './style.scss';

export default function Edit({ attributes, clientId, setAttributes }) {
    const { title, itemId, itemIndex } = attributes;

    // Get parent accordion block state
        const { parentClientId, parentItems, parentAllowMultiple, isOpen, currentItem } = useSelect((select) => {
        const { getBlockParents, getBlock } = select('core/block-editor');
        const parents = getBlockParents(clientId);
        
        // Find the accordion block in the parent chain
        let accordionBlock = null;
        for (let i = 0; i < parents.length; i++) {
            const parent = getBlock(parents[i]);
            if (parent && parent.name === 'create-block/accordion-block') {
                accordionBlock = parent;
                break;
            }
        }
        
        const items = accordionBlock?.attributes?.items || [];
        const item = items.find(it => it.id === itemId) || items[itemIndex] || {};
        
        return {
            parentClientId: accordionBlock?.clientId,
            parentItems: items,
            parentAllowMultiple: accordionBlock?.attributes?.allowMultipleOpen || false,
            isOpen: item.open || false,
            currentItem: item,
        };
    }, [clientId, itemId, itemIndex]);

    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const registry = useRegistry();
    
    const updateTitle = useCallback((newTitle) => {
        setAttributes({ title: newTitle });
        
        if (parentClientId) {
            // Get fresh parent block data from store registry
            const parentBlock = registry.select('core/block-editor').getBlock(parentClientId);
            if (parentBlock) {
                const items = [...(parentBlock.attributes.items || [])];
                const itemToUpdate = items.find(it => it.id === itemId) || items[itemIndex];
                
                if (itemToUpdate) {
                    itemToUpdate.title = newTitle;
                    updateBlockAttributes(parentClientId, { items });
                }
            }
        }
    }, [parentClientId, itemId, itemIndex, setAttributes, updateBlockAttributes, registry]);

    const toggleOpen = useCallback(() => {
        if (parentClientId) {
            // Get fresh parent block data from store registry
            const parentBlock = registry.select('core/block-editor').getBlock(parentClientId);
            if (parentBlock) {
                const items = [...(parentBlock.attributes.items || [])];
                const allowMultiple = parentBlock.attributes.allowMultipleOpen || false;
                
                // Find the current item by ID first, then fall back to index
                let currentItemIndex = -1;
                if (itemId) {
                    currentItemIndex = items.findIndex(it => it.id === itemId);
                }
                if (currentItemIndex === -1 && itemIndex !== undefined) {
                    currentItemIndex = itemIndex;
                }
                
                if (currentItemIndex === -1 || currentItemIndex >= items.length) return;
                
                const currentItem = items[currentItemIndex];
                const isCurrentlyOpen = currentItem.open === true;
                const newOpenState = !isCurrentlyOpen;
                
                // Update items - ensure only one item is open if allowMultiple is false
                const updatedItems = items.map((it, idx) => {
                    if (idx === currentItemIndex) {
                        return { ...it, open: newOpenState };
                    }
                    // If multiple open is disabled, close all other items
                    if (!allowMultiple && newOpenState) {
                        return { ...it, open: false };
                    }
                    return it;
                });
                
                updateBlockAttributes(parentClientId, { items: updatedItems });
            }
        }
    }, [parentClientId, itemId, itemIndex, updateBlockAttributes, registry]);

    const blockProps = useBlockProps({
        className: `adaire-accordion__item${isOpen ? ' is-open' : ''}`,
        'data-item-id': itemId,
        'data-item-index': itemIndex,
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-accordion__panel' },
        {
            template: [
                ['core/group', {}, [
                    ['core/paragraph', { 
                        placeholder: __('Add content for this accordion item...', 'accordion-item-block')
                    }]
                ]]
            ],
            templateLock: false,
            renderAppender: isOpen ? undefined : false,
        }
    );

    return (
        <div {...blockProps}>
            <button 
                type="button" 
                className="adaire-accordion__header" 
                onClick={toggleOpen}
            >
                <RichText
                    tagName="span"
                    className="adaire-accordion__title"
                    value={title || currentItem?.title || ''}
                    onChange={updateTitle}
                    placeholder={__('Titleâ€¦', 'accordion-item-block')}
                    allowedFormats={['core/bold', 'core/italic', 'core/strikethrough']}
                />
                <span className="adaire-accordion__chevron" aria-hidden="true">
                    <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            d="M6 9L12 15L18 9" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </button>
            <div {...innerBlocksProps} />
        </div>
    );
}




