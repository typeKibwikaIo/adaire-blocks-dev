import { __ } from '@wordpress/i18n';
import { useCallback, useState, useEffect } from '@wordpress/element';
import { useBlockProps, useInnerBlocksProps, store as blockEditorStore, ColorPalette } from '@wordpress/block-editor';
import { createBlock, getBlockType } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { PanelBody, RangeControl, ToggleControl, Button, ButtonGroup, TextControl, BaseControl } from '@wordpress/components';
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute, THREE_TIERS } from '../components/DeviceSwitcher';
import UpgradeNotice from '../components/UpgradeNotice';
import { useBlockLimits } from '../components/useBlockLimits';
import InspectorTabs from '../components/InspectorTabs';
import QuickZone from '../components/QuickZone';
import BoundColorPalette from '../components/BoundColorPalette';

const EASINGS = [ 'ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out' ];
const FREE_TIER_ITEM_LIMIT = 3;

// Builds the InnerBlocks template for a single accordion item's default
// content, seeded from that item's own `item.content` (the explanatory
// copy already defined per-item in block.json's default `items` array).
// Returns an empty template when there's no content to seed, matching the
// previous always-empty-paragraph behavior for items that don't have any.
const buildItemInnerBlocksTemplate = ( content ) =>
    content
        ? [ [ 'core/group', {}, [ [ 'core/paragraph', { content } ] ] ] ]
        : [];

export default function Edit( { attributes, setAttributes, clientId } ) {
    const [deviceType, setDeviceType] = useState('desktop');
    const [activeZone, setActiveZone] = useState(null);
    
    const { replaceInnerBlocks, insertBlock, updateBlockAttributes } = useDispatch(blockEditorStore);
    const innerBlocks = useSelect(
        (select) => select(blockEditorStore).getBlocks(clientId),
        [clientId]
    );
    
    // Check block limits
    const { isLimitReached, showUpgradeNotice, upgradeMessage } = useBlockLimits(
        'accordion-block', 
        attributes.items || [], 
        'accordion'
    );
    
    const {
        blockId,
        items,
        titleColor,
        contentColor,
        backgroundColor,
        chevronColor,
        chevronSize,
        titleFontSize,
        contentFontSize,
        gap,
        radius,
        padding,
        animationDuration,
        animationEasing,
        allowMultipleOpen,
        firstItemOpenByDefault,
        icon,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        marginHorizontal,
        titleFontWeight,
        contentFontWeight,
        shadowIntensity,
        contentBackgroundColor,
        dividerColor,
        dividerThickness,
        containerMode,
        containerMaxWidth,
    } = attributes;

    if ( !blockId ) {
        setAttributes( { blockId: clientId } );
    }

    // Initialize items with IDs and handle first item open state (only on mount)
    useEffect(() => {
        let needsUpdate = false;
        let updatedItems = items.map((item, index) => {
            // Ensure all items have unique IDs
            const currentId = item.id || '';
            if (!currentId || currentId === '') {
                needsUpdate = true;
                return { 
                    ...item, 
                    id: `accordion-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}` 
                };
            }
            return item;
        });
        
        // On initial load, set first item open state based on firstItemOpenByDefault
        // Only if no items are explicitly marked as open (avoid overriding user settings)
        if (items.length > 0 && updatedItems.length > 0) {
            const hasAnyExplicitlyOpen = updatedItems.some(item => item.open === true);
            
            // If firstItemOpenByDefault is true and no items are explicitly open, open the first one
            if (firstItemOpenByDefault !== false && !hasAnyExplicitlyOpen) {
                // Ensure first item is open
                if (updatedItems[0].open !== true) {
                    needsUpdate = true;
                    updatedItems[0] = { ...updatedItems[0], open: true };
                    // Close all others if multiple open is disabled
                    if (!allowMultipleOpen) {
                        updatedItems = updatedItems.map((item, idx) => 
                            idx === 0 ? updatedItems[0] : { ...item, open: false }
                        );
                    }
                }
            } else if (firstItemOpenByDefault === false) {
                // If disabled, ensure all items are closed
                const hasAnyOpen = updatedItems.some(item => item.open === true);
                if (hasAnyOpen) {
                    needsUpdate = true;
                    updatedItems = updatedItems.map(item => ({ ...item, open: false }));
                }
            }
        }
        
        if (needsUpdate) {
            setAttributes({ items: updatedItems });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const blockProps = useBlockProps( {
        className: 'adaire-accordion',
        style: {
            '--acc-title-color': titleColor,
            '--acc-content-color': contentColor,
            '--acc-bg': backgroundColor,
            '--acc-chevron': chevronColor,
            '--acc-chevron-size': `${ getDeviceValue(chevronSize, 'desktop', 16) }px`,
            '--acc-chevron-size-tablet': `${ getDeviceValue(chevronSize, 'tablet', 14) }px`,
            '--acc-chevron-size-mobile': `${ getDeviceValue(chevronSize, 'mobile', 12) }px`,
            '--acc-title-size': `${ getDeviceValue(titleFontSize, 'desktop', 20) }px`,
            '--acc-title-size-tablet': `${ getDeviceValue(titleFontSize, 'tablet', 18) }px`,
            '--acc-title-size-mobile': `${ getDeviceValue(titleFontSize, 'mobile', 16) }px`,
            '--acc-content-size': `${ getDeviceValue(contentFontSize, 'desktop', 16) }px`,
            '--acc-content-size-tablet': `${ getDeviceValue(contentFontSize, 'tablet', 14) }px`,
            '--acc-content-size-mobile': `${ getDeviceValue(contentFontSize, 'mobile', 12) }px`,
            '--acc-gap': `${ getDeviceValue(gap, 'desktop', 12) }px`,
            '--acc-gap-tablet': `${ getDeviceValue(gap, 'tablet', 10) }px`,
            '--acc-gap-mobile': `${ getDeviceValue(gap, 'mobile', 8) }px`,
            '--acc-radius': `${ getDeviceValue(radius, 'desktop', 12) }px`,
            '--acc-radius-tablet': `${ getDeviceValue(radius, 'tablet', 10) }px`,
            '--acc-radius-mobile': `${ getDeviceValue(radius, 'mobile', 8) }px`,
            '--acc-padding-top': `${ padding?.desktop?.top ?? 20 }px`,
            '--acc-padding-right': `${ padding?.desktop?.right ?? 20 }px`,
            '--acc-padding-bottom': `${ padding?.desktop?.bottom ?? 20 }px`,
            '--acc-padding-left': `${ padding?.desktop?.left ?? 20 }px`,
            '--acc-padding-top-tablet': `${ padding?.tablet?.top ?? padding?.desktop?.top ?? 20 }px`,
            '--acc-padding-right-tablet': `${ padding?.tablet?.right ?? padding?.desktop?.right ?? 20 }px`,
            '--acc-padding-bottom-tablet': `${ padding?.tablet?.bottom ?? padding?.desktop?.bottom ?? 20 }px`,
            '--acc-padding-left-tablet': `${ padding?.tablet?.left ?? padding?.desktop?.left ?? 20 }px`,
            '--acc-padding-top-mobile': `${ padding?.mobile?.top ?? padding?.tablet?.top ?? padding?.desktop?.top ?? 20 }px`,
            '--acc-padding-right-mobile': `${ padding?.mobile?.right ?? padding?.tablet?.right ?? padding?.desktop?.right ?? 20 }px`,
            '--acc-padding-bottom-mobile': `${ padding?.mobile?.bottom ?? padding?.tablet?.bottom ?? padding?.desktop?.bottom ?? 20 }px`,
            '--acc-padding-left-mobile': `${ padding?.mobile?.left ?? padding?.tablet?.left ?? padding?.desktop?.left ?? 20 }px`,
            '--acc-duration': `${ animationDuration }ms`,
            '--acc-easing': animationEasing,
            '--acc-margin-top': `${ getDeviceValue(marginTop, 'desktop', 0) }px`,
            '--acc-margin-top-tablet': `${ getDeviceValue(marginTop, 'tablet', 0) }px`,
            '--acc-margin-top-mobile': `${ getDeviceValue(marginTop, 'mobile', 0) }px`,
            '--acc-margin-right': `${ getDeviceValue(marginRight, 'desktop', 0) }px`,
            '--acc-margin-right-tablet': `${ getDeviceValue(marginRight, 'tablet', 0) }px`,
            '--acc-margin-right-mobile': `${ getDeviceValue(marginRight, 'mobile', 0) }px`,
            '--acc-margin-bottom': `${ getDeviceValue(marginBottom, 'desktop', 0) }px`,
            '--acc-margin-bottom-tablet': `${ getDeviceValue(marginBottom, 'tablet', 0) }px`,
            '--acc-margin-bottom-mobile': `${ getDeviceValue(marginBottom, 'mobile', 0) }px`,
            '--acc-margin-left': `${ getDeviceValue(marginLeft, 'desktop', 0) }px`,
            '--acc-margin-left-tablet': `${ getDeviceValue(marginLeft, 'tablet', 0) }px`,
            '--acc-margin-left-mobile': `${ getDeviceValue(marginLeft, 'mobile', 0) }px`,
            '--acc-margin-h-desktop': `${ marginHorizontal?.desktop ?? 0 }px`,
            '--acc-margin-h-tablet': `${ marginHorizontal?.tablet ?? 0 }px`,
            '--acc-margin-h-mobile': `${ marginHorizontal?.mobile ?? 0 }px`,
            '--acc-title-weight': titleFontWeight,
            '--acc-content-weight': contentFontWeight,
            '--acc-shadow-intensity': shadowIntensity,
            '--acc-shadow-alpha': shadowIntensity,
            '--acc-shadow-alpha-hover': (typeof shadowIntensity === 'number' ? shadowIntensity * 0.5 : 0.04),
            '--acc-shadow-alpha-base': (typeof shadowIntensity === 'number' ? shadowIntensity * 0.25 : 0.02),
            // Ensure margins render in editor regardless of theme CSS
            marginTop: `${ getDeviceValue(marginTop, 'desktop', 0) }px`,
            marginRight: `${ getDeviceValue(marginRight, 'desktop', 0) }px`,
            marginBottom: `${ getDeviceValue(marginBottom, 'desktop', 0) }px`,
            marginLeft: `${ getDeviceValue(marginLeft, 'desktop', 0) }px`,
            '--acc-content-bg': contentBackgroundColor,
            '--acc-divider-color': dividerColor,
            '--acc-divider-thickness': `${dividerThickness}px`,
            '--acc-container-mode': containerMode || 'full',
            '--acc-container-max-width': `${ containerMaxWidth?.desktop?.value ?? 1200 }${ containerMaxWidth?.desktop?.unit ?? 'px' }`,
            '--acc-container-max-width-tablet': `${ containerMaxWidth?.tablet?.value ?? 100 }${ containerMaxWidth?.tablet?.unit ?? '%' }`,
            '--acc-container-max-width-mobile': `${ containerMaxWidth?.mobile?.value ?? 100 }${ containerMaxWidth?.mobile?.unit ?? '%' }`,
        },
    } );

    const updateItem = useCallback( ( index, patch ) => {
        const next = [ ...items ];
        next[ index ] = { ...next[ index ], ...patch };
        setAttributes( { items: next } );
    }, [ items, setAttributes ] );

    const addItem = useCallback(() => {
        if (isLimitReached) {
            return; // Don't add if limit reached
        }
        const newId = `accordion-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // title is deliberately left empty, not "New Item" — accordion-item-
        // block's title RichText already has a proper placeholder ("Title…")
        // that only shows when the value is genuinely empty. Seeding real
        // "New Item" text here meant that placeholder never appeared: users
        // saw literal text they had to select and delete by hand instead of
        // a faded hint that disappears the moment they start typing.
        const newItem = { id: newId, title: '', open: false };

        // Close all other items if multiple open is disabled
        let updatedItems = [...items];
        if (!allowMultipleOpen) {
            updatedItems = items.map(item => ({ ...item, open: false }));
        }

        // Add new item
        updatedItems = [...updatedItems, newItem];

        // Insert just the ONE new inner block at the end, instead of the
        // previous approach of calling replaceInnerBlocks() with a fresh
        // createBlock() for every item in the list, including all the ones
        // that already existed. createBlock() always generates a brand-new
        // clientId and rebuilds InnerBlocks from buildItemInnerBlocksTemplate
        // (which only knows about items[].content, not whatever a user has
        // actually typed into an item's InnerBlocks tree since it was
        // created) — so clicking "Add Item" was silently discarding any
        // real edits made to existing items' content and replacing every
        // item's identity, which is what made the button feel broken/
        // destructive rather than simply "add one new item at the end."
        const newBlock = createBlock('create-block/accordion-item-block', {
            title: newItem.title,
            itemId: newItem.id,
            itemIndex: updatedItems.length - 1,
            open: newItem.open,
        });
        insertBlock(newBlock, innerBlocks.length, clientId, false);

        // Update items array
        setAttributes({ items: updatedItems });
    }, [isLimitReached, items, allowMultipleOpen, setAttributes, insertBlock, innerBlocks, clientId]);

    const removeItem = ( index ) => {
        const next = items.filter( ( _, i ) => i !== index );
        setAttributes( { items: next } );
    };

    const toggleItem = useCallback((index) => {
        const next = items.map((it, i) => {
            if (i === index) {
                const newOpenState = !it.open;
                return { ...it, open: newOpenState };
            }
            // If multiple open is disabled, close all other items
            // Also ensure at least one item stays open if we're closing the current one
            if (!allowMultipleOpen) {
                return { ...it, open: false };
            }
            return it;
        });
        
                // Note: We don't force an item to stay open - user can close all items
        
        setAttributes({ items: next });
    }, [items, allowMultipleOpen, setAttributes]);

    // Resets every responsive attribute back to its block.json default —
    // existing values only, nothing new is added.
    const RESPONSIVE_ATTRS = [
        'chevronSize', 'titleFontSize', 'contentFontSize', 'gap', 'radius',
        'padding', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
        'marginHorizontal', 'containerMaxWidth',
    ];
    const resetResponsiveDefaults = () => {
        const blockType = getBlockType( 'create-block/accordion-block' );
        const defaults = blockType?.attributes || {};
        const resetValues = {};
        RESPONSIVE_ATTRS.forEach( ( key ) => {
            if ( defaults[ key ] && 'default' in defaults[ key ] ) {
                resetValues[ key ] = defaults[ key ].default;
            }
        } );
        setAttributes( resetValues );
    };

    const updatePadding = (device, property, value) => {
        // Handle backward compatibility - if padding is in old format, convert it
        let currentPadding = padding;
        if (typeof padding === 'number' || (padding && !padding.desktop)) {
            // Old format detected - convert to new format
            const oldPaddingValue = typeof padding === 'number' ? padding : 20;
            currentPadding = {
                desktop: {
                    top: oldPaddingValue,
                    right: oldPaddingValue,
                    bottom: oldPaddingValue,
                    left: oldPaddingValue,
                },
                tablet: {
                    top: oldPaddingValue,
                    right: oldPaddingValue,
                    bottom: oldPaddingValue,
                    left: oldPaddingValue,
                },
                mobile: {
                    top: oldPaddingValue,
                    right: oldPaddingValue,
                    bottom: oldPaddingValue,
                    left: oldPaddingValue,
                },
            };
        }
        
        const next = {
            ...currentPadding,
            [device]: {
                ...currentPadding?.[device],
                [property]: value,
            },
        };
        setAttributes({ padding: next });
    };

    // Sync InnerBlocks when items array changes
    useEffect(() => {
        // Only sync if we have items and they all have IDs
        if (items.length === 0) return;
        
        const allItemsHaveIds = items.every(item => item.id && item.id !== '');
        if (!allItemsHaveIds) return;
        
        // Check if InnerBlocks need to be synced
        if (innerBlocks.length !== items.length) {
            const newTemplate = items.map((item, index) =>
                createBlock('create-block/accordion-item-block', {
                    title: item.title || '',
                    itemId: item.id,
                    itemIndex: index,
                    open: item.open || false,
                }, buildItemInnerBlocksTemplate( item.content ) )
            );
            replaceInnerBlocks(clientId, newTemplate, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length]); // Only sync when items count changes

    // Reconcile the OTHER direction too: InnerBlocks -> items. WordPress's
    // native InnerBlocks list ("+" appender between/after items, and each
    // item's own "Remove Block" toolbar option) is still fully available
    // here — templateLock stays false so drag-to-reorder keeps working —
    // which means a user can add or remove an accordion item without ever
    // touching the "Add Item" button above. Before this effect, doing so
    // left `items` out of sync with what's actually in the editor: a
    // natively-inserted item had no entry in `items` at all (breaking
    // title editing and open/close toggling for it, since
    // accordion-item-block looks itself up in the parent's `items` by
    // itemId), and a natively-removed item left a stale, orphaned entry
    // behind. This makes every way of adding or removing an item — the
    // button, or working directly with the InnerBlocks list — converge on
    // the same consistent `items` state, which is what actually makes the
    // two approaches "the same functionality" rather than two competing,
    // divergent ones.
    useEffect(() => {
        if (innerBlocks.length === items.length) return;

        if (innerBlocks.length > items.length) {
            // A block was inserted natively. Give any inner block that
            // doesn't already have a matching items[] entry a fresh one,
            // and write the resolved id back onto the block itself so a
            // block that was created with no itemId (or a colliding
            // default one) gets a unique id both sides agree on.
            const usedIds = new Set();
            const newItems = innerBlocks.map((block, index) => {
                const blockItemId = block.attributes.itemId;
                const existing = blockItemId && ! usedIds.has(blockItemId)
                    ? items.find((it) => it.id === blockItemId)
                    : undefined;

                if (existing) {
                    usedIds.add(existing.id);
                    return existing;
                }

                const freshId = `accordion-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`;
                usedIds.add(freshId);
                updateBlockAttributes(block.clientId, { itemId: freshId, itemIndex: index });
                return {
                    id: freshId,
                    title: block.attributes.title || '',
                    open: block.attributes.open || false,
                };
            });
            setAttributes({ items: newItems });
            return;
        }

        // innerBlocks.length < items.length: a block was removed natively.
        // Drop the items[] entries that no longer have a matching block.
        const survivingIds = new Set(innerBlocks.map((b) => b.attributes.itemId));
        setAttributes({ items: items.filter((it) => survivingIds.has(it.id)) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [innerBlocks.length]);

    // Template for accordion item blocks
    const ALLOWED_BLOCKS = ['create-block/accordion-item-block'];
    const TEMPLATE = items.map((item, index) => [
        'create-block/accordion-item-block',
        {
            title: item.title,
            itemId: item.id,
            itemIndex: index,
            open: item.open || false,
        },
        buildItemInnerBlocksTemplate( item.content ),
    ]);

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-accordion__list' },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            template: TEMPLATE,
            templateLock: false, // Unlocked to allow users to add/remove items freely
        }
    );

    return (
        <>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
                <PanelBody section="layout" title={ __('Responsive Settings', 'adaire-blocks') } initialOpen={ false }>
                    <DeviceSwitcher
                        deviceType={deviceType}
                        setDeviceType={setDeviceType}
                        label="Device Preview"
                        onReset={ resetResponsiveDefaults }
                        tiers={ THREE_TIERS }
                    />
                </PanelBody>
                <PanelBody section="layout" title={ __('Container Settings', 'adaire-blocks') } initialOpen={ true }>
                    <ButtonGroup>
                        { [
                            { label: __('Full width', 'adaire-blocks'), value: 'full' },
                            { label: __('Constrained', 'adaire-blocks'), value: 'constrained' },
                        ].map(opt => (
                            <Button
                                key={ opt.value }
                                isPrimary={ containerMode === opt.value }
                                isSecondary={ containerMode !== opt.value }
                                onClick={ () => setAttributes({ containerMode: opt.value }) }
                            >{ opt.label }</Button>
                        )) }
                    </ButtonGroup>
                    { containerMode === 'constrained' && (
                        <>
                            <p style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>
                                { __('Max Width', 'adaire-blocks') }
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <TextControl
                                    type="number"
                                    value={
                                        containerMaxWidth?.[deviceType]?.value ??
                                        (deviceType === 'desktop' ? (containerMaxWidth?.value ?? 1200) : 100)
                                    }
                                    onChange={(v) =>
                                        setAttributes({
                                            containerMaxWidth: {
                                                ...(containerMaxWidth || {}),
                                                [deviceType]: {
                                                    ...(containerMaxWidth?.[deviceType] || {}),
                                                    value: Number(v),
                                                },
                                            },
                                        })
                                    }
                                />
                                <ButtonGroup>
                                    { ['px','%','rem','vw'].map(u => (
                                        <Button
                                            key={u}
                                            isPrimary={
                                                (containerMaxWidth?.[deviceType]?.unit ??
                                                    (deviceType === 'desktop' ? (containerMaxWidth?.unit ?? 'px') : '%')) === u
                                            }
                                            isSecondary={
                                                (containerMaxWidth?.[deviceType]?.unit ??
                                                    (deviceType === 'desktop' ? (containerMaxWidth?.unit ?? 'px') : '%')) !== u
                                            }
                                            onClick={() =>
                                                setAttributes({
                                                    containerMaxWidth: {
                                                        ...(containerMaxWidth || {}),
                                                        [deviceType]: {
                                                            ...(containerMaxWidth?.[deviceType] || {}),
                                                            unit: u,
                                                        },
                                                    },
                                                })
                                            }
                                        >{u}</Button>
                                    )) }
                                </ButtonGroup>
                            </div>
                        </>
                    )}
                </PanelBody>
                <PanelBody section="content" title={ __('Items', 'adaire-blocks') } initialOpen={ true }>
                    <Button
                        isPrimary
                        onClick={ addItem }
                        disabled={ isLimitReached }
                    >
                        { __('Add Item', 'adaire-blocks') }
                    </Button>
                    { showUpgradeNotice && (
                        <UpgradeNotice
                            variant="inline"
                            itemType="accordion"
                            message={upgradeMessage}
                        />
                    ) }
                    <ToggleControl
                        label={ __('Allow multiple open', 'adaire-blocks') }
                        checked={ allowMultipleOpen }
                        onChange={ (v) => setAttributes( { allowMultipleOpen: v } ) }
                    />
                    <ToggleControl
                        label={ __('First item open by default', 'adaire-blocks') }
                        checked={ firstItemOpenByDefault !== false }
                        onChange={ (v) => setAttributes( { firstItemOpenByDefault: v } ) }
                        help={ __('When enabled, the first accordion item will be open when the page loads.', 'adaire-blocks') }
                    />
                </PanelBody>
                <PanelBody section="style" priority="medium" title={ __('Item Spacing', 'adaire-blocks') } initialOpen={ false }>
                    <RangeControl
                        label={ __('Gap', 'adaire-blocks') }
                        value={ getDeviceValue(gap, deviceType, deviceType === 'desktop' ? 12 : deviceType === 'tablet' ? 10 : deviceType === 'mobile' ? 8 : 6) }
                        onChange={ (v) => setAttributes( { gap: updateDeviceAttribute(gap, deviceType, v) } ) }
                        min={ 0 }
                        max={ 48 }
                    />
                    <BaseControl label={ __('Header Padding', 'adaire-blocks') }>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <RangeControl
                                label={ __('Top', 'adaire-blocks') }
                                value={ padding?.[deviceType]?.top ?? padding?.desktop?.top ?? 20 }
                                onChange={(value) => updatePadding(deviceType, 'top', value)}
                                min={0}
                                max={80}
                            />
                            <RangeControl
                                label={ __('Right', 'adaire-blocks') }
                                value={ padding?.[deviceType]?.right ?? padding?.desktop?.right ?? 20 }
                                onChange={(value) => updatePadding(deviceType, 'right', value)}
                                min={0}
                                max={80}
                            />
                            <RangeControl
                                label={ __('Bottom', 'adaire-blocks') }
                                value={ padding?.[deviceType]?.bottom ?? padding?.desktop?.bottom ?? 20 }
                                onChange={(value) => updatePadding(deviceType, 'bottom', value)}
                                min={0}
                                max={80}
                            />
                            <RangeControl
                                label={ __('Left', 'adaire-blocks') }
                                value={ padding?.[deviceType]?.left ?? padding?.desktop?.left ?? 20 }
                                onChange={(value) => updatePadding(deviceType, 'left', value)}
                                min={0}
                                max={80}
                            />
                        </div>
                    </BaseControl>
                    <RangeControl
                        label={ __('Radius', 'adaire-blocks') }
                        value={ getDeviceValue(radius, deviceType, deviceType === 'desktop' ? 12 : deviceType === 'tablet' ? 10 : deviceType === 'mobile' ? 8 : 6) }
                        onChange={ (v) => setAttributes( { radius: updateDeviceAttribute(radius, deviceType, v) } ) }
                        min={ 0 }
                        max={ 48 }
                    />
                </PanelBody>
                <PanelBody section="style" priority="high" title={ __('Typography', 'adaire-blocks') } initialOpen={ false }>
                    <RangeControl
                        label={ __('Title size', 'adaire-blocks') }
                        value={ getDeviceValue(titleFontSize, deviceType, deviceType === 'desktop' ? 20 : deviceType === 'tablet' ? 18 : deviceType === 'mobile' ? 16 : 14) }
                        onChange={ (v) => setAttributes( { titleFontSize: updateDeviceAttribute(titleFontSize, deviceType, v) } ) }
                        min={ 10 }
                        max={ 60 }
                    />
                    <RangeControl
                        label={ __('Content size', 'adaire-blocks') }
                        value={ getDeviceValue(contentFontSize, deviceType, deviceType === 'desktop' ? 16 : deviceType === 'tablet' ? 14 : deviceType === 'mobile' ? 12 : 10) }
                        onChange={ (v) => setAttributes( { contentFontSize: updateDeviceAttribute(contentFontSize, deviceType, v) } ) }
                        min={ 10 }
                        max={ 48 }
                    />
                    <p>{ __('Title weight', 'adaire-blocks') }</p>
                    <ButtonGroup>
                        { ['300', '400', '500', '600', '700', '800'].map( (weight) => (
                            <Button
                                key={ weight }
                                isPrimary={ titleFontWeight === weight }
                                isSecondary={ titleFontWeight !== weight }
                                onClick={ () => setAttributes( { titleFontWeight: weight } ) }
                            >{ weight }</Button>
                        ) ) }
                    </ButtonGroup>
                    <p>{ __('Content weight', 'adaire-blocks') }</p>
                    <ButtonGroup>
                        { ['300', '400', '500', '600', '700', "800"].map( (weight) => (
                            <Button
                                key={ weight }
                                isPrimary={ contentFontWeight === weight }
                                isSecondary={ contentFontWeight !== weight }
                                onClick={ () => setAttributes( { contentFontWeight: weight } ) }
                            >{ weight }</Button>
                        ) ) }
                    </ButtonGroup>
                </PanelBody>
                <PanelBody section="style" priority="high" title={ __('Colors', 'adaire-blocks') } initialOpen={ false }>
                    <p>{ __('Title', 'adaire-blocks') }</p>
                    <BoundColorPalette value={ titleColor } onChange={ (v)=> setAttributes({ titleColor: v }) } />
                    <p>{ __('Content', 'adaire-blocks') }</p>
                    <BoundColorPalette value={ contentColor } onChange={ (v)=> setAttributes({ contentColor: v }) } />
                    <p>{ __('Background', 'adaire-blocks') }</p>
                    <BoundColorPalette value={ backgroundColor } onChange={ (v)=> setAttributes({ backgroundColor: v }) } />
                    <p>{ __('Chevron', 'adaire-blocks') }</p>
                    <BoundColorPalette value={ chevronColor } onChange={ (v)=> setAttributes({ chevronColor: v }) } />
                    <RangeControl
                        label={ __('Chevron Size (px)', 'adaire-blocks') }
                        value={ getDeviceValue(chevronSize, deviceType, deviceType === 'desktop' ? 16 : deviceType === 'tablet' ? 14 : deviceType === 'mobile' ? 12 : 10) }
                        onChange={ (v) => setAttributes( { chevronSize: updateDeviceAttribute(chevronSize, deviceType, v) } ) }
                        min={ 8 }
                        max={ 80 }
                        step={ 1 }
                    />
                    <p>{ __('Content Background', 'adaire-blocks') }</p>
                    <BoundColorPalette value={ contentBackgroundColor } onChange={ (v)=> setAttributes({ contentBackgroundColor: v }) } />
                    <p>{ __('Divider Line Color', 'adaire-blocks') }</p>
                    <BoundColorPalette value={ dividerColor } onChange={ (v)=> setAttributes({ dividerColor: v }) } />
                    <RangeControl
                        label={ __('Divider Line Thickness (px)', 'adaire-blocks') }
                        value={ dividerThickness }
                        onChange={ (v) => setAttributes( { dividerThickness: v } ) }
                        min={ 0 }
                        max={ 10 }
                        step={ 1 }
                    />
                </PanelBody>
                <PanelBody section="style" priority="medium" title={ __('Spacing & Margins', 'adaire-blocks') } initialOpen={ false }>
                    <RangeControl
                        label={ __('Margin Top', 'adaire-blocks') }
                        value={ getDeviceValue(marginTop, deviceType, 0) }
                        onChange={ (v) => setAttributes( { marginTop: updateDeviceAttribute(marginTop, deviceType, v) } ) }
                        min={ 0 }
                        max={ 100 }
                    />
                    <RangeControl
                        label={ __('Margin Right', 'adaire-blocks') }
                        value={ getDeviceValue(marginRight, deviceType, 0) }
                        onChange={ (v) => setAttributes( { marginRight: updateDeviceAttribute(marginRight, deviceType, v) } ) }
                        min={ 0 }
                        max={ 100 }
                    />
                    <RangeControl
                        label={ __('Margin Bottom', 'adaire-blocks') }
                        value={ getDeviceValue(marginBottom, deviceType, 0) }
                        onChange={ (v) => setAttributes( { marginBottom: updateDeviceAttribute(marginBottom, deviceType, v) } ) }
                        min={ 0 }
                        max={ 100 }
                    />
                    <RangeControl
                        label={ __('Margin Left', 'adaire-blocks') }
                        value={ getDeviceValue(marginLeft, deviceType, 0) }
                        onChange={ (v) => setAttributes( { marginLeft: updateDeviceAttribute(marginLeft, deviceType, v) } ) }
                        min={ 0 }
                        max={ 100 }
                    />
                    <RangeControl
                        label={ __('Horizontal Margin (Legacy)', 'adaire-blocks') }
                        value={ marginHorizontal?.[deviceType] ?? 0 }
                        onChange={ (v) => setAttributes( { marginHorizontal: { ...marginHorizontal, [deviceType]: v } } ) }
                        min={ 0 }
                        max={ 100 }
                    />
                </PanelBody>
                <PanelBody section="style" priority="medium" title={ __('Effects', 'adaire-blocks') } initialOpen={ false }>
                    <RangeControl
                        label={ __('Shadow Intensity', 'adaire-blocks') }
                        value={ shadowIntensity }
                        onChange={ (v) => setAttributes( { shadowIntensity: v } ) }
                        min={ 0 }
                        max={ 0.5 }
                        step={ 0.01 }
                    />
                </PanelBody>
                <PanelBody section="style" priority="medium" title={ __('Animation', 'adaire-blocks') } initialOpen={ false }>
                    <RangeControl
                        label={ __('Duration (ms)', 'adaire-blocks') }
                        value={ animationDuration }
                        onChange={ (v) => setAttributes( { animationDuration: v } ) }
                        min={ 100 }
                        max={ 1500 }
                        step={ 50 }
                    />
                    <p>{ __('Easing', 'adaire-blocks') }</p>
                    <ButtonGroup>
                        { EASINGS.map( (e) => (
                            <Button
                                key={ e }
                                isPrimary={ animationEasing === e }
                                isSecondary={ animationEasing !== e }
                                onClick={ () => setAttributes( { animationEasing: e } ) }
                            >{ e }</Button>
                        ) ) }
                    </ButtonGroup>
                </PanelBody>
            </InspectorTabs>

            <div { ...blockProps } data-allow-multiple={ allowMultipleOpen }>
                <QuickZone
                    id="colors"
                    label={ __('Colors', 'adaire-blocks') }
                    activeZone={ activeZone }
                    setActiveZone={ setActiveZone }
                    content={
                        <>
                            <p>{ __('Background', 'adaire-blocks') }</p>
                            <BoundColorPalette value={ backgroundColor } onChange={ (v)=> setAttributes({ backgroundColor: v }) } />
                            <p>{ __('Chevron', 'adaire-blocks') }</p>
                            <BoundColorPalette value={ chevronColor } onChange={ (v)=> setAttributes({ chevronColor: v }) } />
                        </>
                    }
                >
                    <div className={`adaire-accordion__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                        <div {...innerBlocksProps} />
                    </div>
                </QuickZone>
            </div>
        </>
    );
}





