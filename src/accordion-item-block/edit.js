import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { useSelect, useDispatch, useRegistry } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import {
    PanelBody,
    SelectControl,
    __experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import './style.scss';

const TEXT_TRANSFORM_OPTIONS = [
    { label: __( 'None', 'adaire-blocks' ), value: 'none' },
    { label: __( 'Uppercase', 'adaire-blocks' ), value: 'uppercase' },
    { label: __( 'Lowercase', 'adaire-blocks' ), value: 'lowercase' },
    { label: __( 'Capitalize', 'adaire-blocks' ), value: 'capitalize' },
];

const FONT_FAMILY_OPTIONS = [
    { label: __( 'Default (inherit theme)', 'adaire-blocks' ), value: '' },
    { label: __( 'Arial', 'adaire-blocks' ), value: 'Arial, Helvetica, sans-serif' },
    { label: __( 'Helvetica', 'adaire-blocks' ), value: 'Helvetica, Arial, sans-serif' },
    { label: __( 'Georgia', 'adaire-blocks' ), value: 'Georgia, serif' },
    { label: __( 'Times New Roman', 'adaire-blocks' ), value: "'Times New Roman', Times, serif" },
    { label: __( 'Verdana', 'adaire-blocks' ), value: 'Verdana, Geneva, sans-serif' },
    { label: __( 'Trebuchet MS', 'adaire-blocks' ), value: "'Trebuchet MS', sans-serif" },
    { label: __( 'Courier New', 'adaire-blocks' ), value: "'Courier New', Courier, monospace" },
    { label: __( 'System UI', 'adaire-blocks' ), value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

const FONT_WEIGHT_OPTIONS = [
    { label: __( 'Default (inherit)', 'adaire-blocks' ), value: '' },
    { label: '300', value: '300' },
    { label: '400', value: '400' },
    { label: '500', value: '500' },
    { label: '600', value: '600' },
    { label: '700', value: '700' },
    { label: '800', value: '800' },
];

export default function Edit({ attributes, clientId, setAttributes }) {
    const {
        title,
        itemId,
        itemIndex,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        textTransform,
        fontFamily,
    } = attributes;

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
        style: {
            ...(fontSize ? { '--acc-title-size': fontSize } : {}),
            ...(fontWeight ? { '--acc-title-weight': fontWeight } : {}),
            '--acc-item-title-line-height': lineHeight || '1.4',
            '--acc-item-title-letter-spacing': letterSpacing || 'normal',
            '--acc-item-title-text-transform': textTransform || 'none',
            '--acc-item-title-font-family': fontFamily || 'inherit',
        },
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-accordion__panel' },
        {
            template: [
                ['core/group', {}, [
                    ['core/paragraph', { 
                        placeholder: __('Add content for this accordion item...', 'adaire-blocks')
                    }]
                ]]
            ],
            templateLock: false,
            renderAppender: isOpen ? undefined : false,
        }
    );

    return (
        <>
            <InspectorControls>
                <PanelBody title={__( 'Title Typography', 'adaire-blocks' )} initialOpen={false}>
                    <UnitControl
                        label={__( 'Font Size', 'adaire-blocks' )}
                        value={fontSize}
                        onChange={(value) => setAttributes({ fontSize: value })}
                        help={__( 'Leave blank to use the accordion block\'s title size.', 'adaire-blocks' )}
                    />
                    <SelectControl
                        label={__( 'Font Weight', 'adaire-blocks' )}
                        value={fontWeight || ''}
                        options={FONT_WEIGHT_OPTIONS}
                        onChange={(value) => setAttributes({ fontWeight: value })}
                        help={__( 'Leave blank to use the accordion block\'s title weight.', 'adaire-blocks' )}
                    />
                    <UnitControl
                        label={__( 'Line Height', 'adaire-blocks' )}
                        value={lineHeight}
                        onChange={(value) => setAttributes({ lineHeight: value })}
                    />
                    <UnitControl
                        label={__( 'Letter Spacing', 'adaire-blocks' )}
                        value={letterSpacing}
                        onChange={(value) => setAttributes({ letterSpacing: value })}
                    />
                    <SelectControl
                        label={__( 'Text Transform', 'adaire-blocks' )}
                        value={textTransform}
                        options={TEXT_TRANSFORM_OPTIONS}
                        onChange={(value) => setAttributes({ textTransform: value })}
                    />
                    <SelectControl
                        label={__( 'Font Family', 'adaire-blocks' )}
                        value={fontFamily || ''}
                        options={FONT_FAMILY_OPTIONS}
                        onChange={(value) => setAttributes({ fontFamily: value })}
                        help={__( 'Applies to this item\'s title only.', 'adaire-blocks' )}
                    />
                </PanelBody>
            </InspectorControls>
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
                    placeholder={__('Titleâ€¦', 'adaire-blocks')}
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
        </>
    );
}




