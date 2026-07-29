import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { Button, SelectControl, ToggleControl } from '@wordpress/components';
import ItemEditForm from './ItemEditForm';
import {
	emptyItem,
	generateId,
	getChildren,
	getDescendantIds,
	normalizeItems,
} from './utils';

const MAX_DEPTH = 5;

/**
 * Simple destructive-action confirmation; no custom modal exists in this
 * admin context yet, so this is the pragmatic choice for now.
 *
 * @param {string} message Confirmation prompt text.
 * @return {boolean} Whether the user confirmed.
 */
function confirmDelete( message ) {
	// eslint-disable-next-line no-alert
	return window.confirm( message );
}

function ItemRow( {
	item,
	items,
	depth,
	expandedId,
	setExpandedId,
	onUpdateItem,
	onDeleteItem,
	onDuplicateItem,
	onAddChild,
	onReparent,
	dragState,
	setDragState,
	allowNesting,
	postTypeOptions,
	taxonomyOptions,
	wooCommerceActive,
} ) {
	const isExpanded = expandedId === item.id;
	const children = getChildren( items, item.id );
	const descendantIds = getDescendantIds( items, item.id );

	// Anything an item could be reparented under: not itself, not one of
	// its own descendants (that would create a cycle a drill-down renderer
	// could loop on forever), and not past the max nesting depth.
	const parentOptions = [
		{ label: __( '— Top level —', 'adaire-blocks' ), value: '' },
		...items
			.filter(
				( candidate ) =>
					candidate.id !== item.id &&
					! descendantIds.includes( candidate.id ) &&
					candidate.depth < MAX_DEPTH - 1
			)
			.map( ( candidate ) => ( {
				label: `${ '— '.repeat( candidate.depth ) }${
					candidate.title || __( '(untitled)', 'adaire-blocks' )
				}`,
				value: candidate.id,
			} ) ),
	];

	const handleDragStart = ( event ) => {
		event.dataTransfer.effectAllowed = 'move';
		setDragState( { draggedId: item.id, overId: null } );
	};

	const handleDragOver = ( event ) => {
		event.preventDefault();
		if ( dragState.draggedId && dragState.draggedId !== item.id ) {
			setDragState( { ...dragState, overId: item.id } );
		}
	};

	const handleDrop = ( event ) => {
		event.preventDefault();
		if ( ! dragState.draggedId || dragState.draggedId === item.id ) {
			setDragState( { draggedId: null, overId: null } );
			return;
		}
		// Only reorder within the same sibling group — cross-group moves
		// use the explicit "Parent" dropdown instead of drag, which keeps
		// the drop target unambiguous (no guessing "before" vs "as a
		// child of" from pointer position alone).
		const dragged = items.find(
			( candidate ) => candidate.id === dragState.draggedId
		);
		if (
			! dragged ||
			( dragged.parentId || '' ) !== ( item.parentId || '' )
		) {
			setDragState( { draggedId: null, overId: null } );
			return;
		}

		const siblings = getChildren( items, item.parentId || '' );
		const fromIndex = siblings.findIndex(
			( sib ) => sib.id === dragged.id
		);
		const toIndex = siblings.findIndex( ( sib ) => sib.id === item.id );
		const reordered = [ ...siblings ];
		reordered.splice( fromIndex, 1 );
		reordered.splice( toIndex, 0, dragged );

		const reorderedIds = reordered.map( ( sib ) => sib.id );
		const untouched = items.filter(
			( candidate ) => ! reorderedIds.includes( candidate.id )
		);
		onUpdateItem( null, [
			...untouched,
			...reordered.map( ( sib, index ) => ( { ...sib, order: index } ) ),
		] );
		setDragState( { draggedId: null, overId: null } );
	};

	return (
		<div className="adaire-mpe-item" style={ { marginLeft: depth * 24 } }>
			<div
				className={
					'adaire-mpe-item-row' +
					( dragState.overId === item.id ? ' is-drag-over' : '' ) +
					( ! item.visible ? ' is-hidden' : '' )
				}
				draggable
				onDragStart={ handleDragStart }
				onDragOver={ handleDragOver }
				onDrop={ handleDrop }
			>
				<span
					className="adaire-mpe-drag-handle"
					aria-hidden="true"
					title={ __( 'Drag to reorder', 'adaire-blocks' ) }
				>
					⠿
				</span>
				<Button
					className="adaire-mpe-item-toggle"
					onClick={ () =>
						setExpandedId( isExpanded ? null : item.id )
					}
					aria-expanded={ isExpanded }
				>
					{ item.title || __( '(untitled item)', 'adaire-blocks' ) }
				</Button>
				{ item.featured && (
					<span className="adaire-mpe-badge">
						{ __( 'Featured', 'adaire-blocks' ) }
					</span>
				) }
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Visible', 'adaire-blocks' ) }
					checked={ item.visible }
					onChange={ ( value ) =>
						onUpdateItem( { ...item, visible: value } )
					}
				/>
				<Button
					variant="tertiary"
					size="small"
					onClick={ () => onDuplicateItem( item.id ) }
				>
					{ __( 'Duplicate', 'adaire-blocks' ) }
				</Button>
				{ allowNesting && depth < MAX_DEPTH - 1 && (
					<Button
						variant="tertiary"
						size="small"
						onClick={ () => onAddChild( item.id ) }
					>
						{ __( 'Add child', 'adaire-blocks' ) }
					</Button>
				) }
				<Button
					variant="tertiary"
					size="small"
					isDestructive
					onClick={ () => {
						const confirmed = confirmDelete(
							__(
								'Delete this item and everything nested under it?',
								'adaire-blocks'
							)
						);
						if ( confirmed ) {
							onDeleteItem( item.id );
						}
					} }
				>
					{ __( 'Delete', 'adaire-blocks' ) }
				</Button>
			</div>

			{ isExpanded && (
				<div className="adaire-mpe-item-details">
					{ allowNesting && (
						<SelectControl
							label={ __( 'Parent item', 'adaire-blocks' ) }
							value={ item.parentId || '' }
							options={ parentOptions }
							onChange={ ( value ) =>
								onReparent( item.id, value )
							}
						/>
					) }
					<ItemEditForm
						item={ item }
						onChange={ ( updated ) => onUpdateItem( updated ) }
						allowNesting={ allowNesting }
						postTypeOptions={ postTypeOptions }
						taxonomyOptions={ taxonomyOptions }
						wooCommerceActive={ wooCommerceActive }
					/>
				</div>
			) }

			{ children.map( ( child ) => (
				<ItemRow
					key={ child.id }
					item={ child }
					items={ items }
					depth={ depth + 1 }
					expandedId={ expandedId }
					setExpandedId={ setExpandedId }
					onUpdateItem={ onUpdateItem }
					onDeleteItem={ onDeleteItem }
					onDuplicateItem={ onDuplicateItem }
					onAddChild={ onAddChild }
					onReparent={ onReparent }
					dragState={ dragState }
					setDragState={ setDragState }
					allowNesting={ allowNesting }
					postTypeOptions={ postTypeOptions }
					taxonomyOptions={ taxonomyOptions }
					wooCommerceActive={ wooCommerceActive }
				/>
			) ) }
		</div>
	);
}

/**
 * The item/column tree editor. `allowNesting` controls whether the
 * "Add child" / "Parent item" controls appear — flat layouts (gallery,
 * link-list) hide them entirely so there's nothing there to misuse.
 * @param {Object}   root0                   Props.
 * @param {Array}    root0.items             Flat array of all items in this panel.
 * @param {Function} root0.onChange          Called with the updated items array on any change.
 * @param {boolean}  root0.allowNesting      Whether "Add child" / "Parent item" controls are shown.
 * @param {Array}    root0.postTypeOptions   [{ label, value }] options for the dynamic source's post type picker.
 * @param {Array}    root0.taxonomyOptions   [{ label, value }] options for the dynamic source's taxonomy picker.
 * @param {boolean}  root0.wooCommerceActive Whether WooCommerce dynamic source types should be offered.
 */
export default function ItemList( {
	items,
	onChange,
	allowNesting,
	postTypeOptions,
	taxonomyOptions,
	wooCommerceActive,
} ) {
	const [ expandedId, setExpandedId ] = useState( null );
	const [ dragState, setDragState ] = useState( {
		draggedId: null,
		overId: null,
	} );

	const topLevel = getChildren( items, '' );

	const updateItem = ( updatedItem, replacementArray ) => {
		if ( replacementArray ) {
			onChange( normalizeItems( replacementArray ) );
			return;
		}
		onChange(
			normalizeItems(
				items.map( ( item ) =>
					item.id === updatedItem.id ? updatedItem : item
				)
			)
		);
	};

	const addItem = ( parentId = '' ) => {
		const item = { ...emptyItem(), parentId };
		onChange( normalizeItems( [ ...items, item ] ) );
		setExpandedId( item.id );
	};

	const deleteItem = ( id ) => {
		const toRemove = new Set( [ id, ...getDescendantIds( items, id ) ] );
		onChange(
			normalizeItems(
				items.filter( ( item ) => ! toRemove.has( item.id ) )
			)
		);
	};

	const duplicateItem = ( id ) => {
		const source = items.find( ( item ) => item.id === id );
		if ( ! source ) {
			return;
		}
		const copy = {
			...source,
			id: generateId(),
			title: source.title + ' ' + __( '(copy)', 'adaire-blocks' ),
		};
		onChange( normalizeItems( [ ...items, copy ] ) );
	};

	const reparentItem = ( id, newParentId ) => {
		onChange(
			normalizeItems(
				items.map( ( item ) =>
					item.id === id ? { ...item, parentId: newParentId } : item
				)
			)
		);
	};

	return (
		<div className="adaire-mpe-item-list">
			{ topLevel.length === 0 && (
				<p className="adaire-mpe-empty">
					{ __(
						'No items yet — add the first one below.',
						'adaire-blocks'
					) }
				</p>
			) }
			{ topLevel.map( ( item ) => (
				<ItemRow
					key={ item.id }
					item={ item }
					items={ items }
					depth={ 0 }
					expandedId={ expandedId }
					setExpandedId={ setExpandedId }
					onUpdateItem={ updateItem }
					onDeleteItem={ deleteItem }
					onDuplicateItem={ duplicateItem }
					onAddChild={ addItem }
					onReparent={ reparentItem }
					dragState={ dragState }
					setDragState={ setDragState }
					allowNesting={ allowNesting }
					postTypeOptions={ postTypeOptions }
					taxonomyOptions={ taxonomyOptions }
					wooCommerceActive={ wooCommerceActive }
				/>
			) ) }
			<Button variant="primary" onClick={ () => addItem( '' ) }>
				{ __( '+ Add item', 'adaire-blocks' ) }
			</Button>
		</div>
	);
}
