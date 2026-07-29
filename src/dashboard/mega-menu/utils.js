/**
 * Shared helpers for the Mega Panel item/layout editor.
 */

/**
 * A stable-enough client-side id generator. The server re-validates and
 * de-duplicates on save (AdaireMegaPanelItemSanitizer::sanitize_items), so
 * this only needs to avoid collisions within one editing session, not be
 * cryptographically unique.
 */
export function generateId() {
	return (
		'item-' +
		Date.now().toString( 36 ) +
		'-' +
		Math.random().toString( 36 ).slice( 2, 8 )
	);
}

export function emptyItem() {
	return {
		id: generateId(),
		title: '',
		description: '',
		url: '',
		linkLabel: '',
		openInNewTab: false,
		rel: '',
		nofollow: false,
		icon: '',
		image: { id: 0, url: '', alt: '' },
		mobileImage: { id: 0, url: '', alt: '' },
		badge: '',
		eyebrow: '',
		cta: { label: '', url: '', openInNewTab: false },
		secondaryCta: { label: '', url: '', openInNewTab: false },
		cssClass: '',
		featured: false,
		visible: true,
		order: 0,
		parentId: '',
		depth: 0,
		colors: { background: '', text: '', accent: '' },
		ariaLabel: '',
		dynamicSource: {
			type: 'none',
			postType: 'post',
			taxonomy: '',
			term: '',
			count: 6,
			orderby: 'date',
			order: 'DESC',
		},
	};
}

/**
 * The dynamicSource default shape, exported separately so components that
 * receive items which may pre-date this field (or the panel-level dynamic
 * source, which uses the same shape) can safely merge over `undefined`.
 */
export function emptyDynamicSource() {
	return {
		type: 'none',
		postType: 'post',
		taxonomy: '',
		term: '',
		count: 6,
		orderby: 'date',
		order: 'DESC',
	};
}

/**
 * Direct children of a given parent (or top-level items when parentId is
 * ''), sorted by their `order` field.
 * @param {Array}  items    Flat array of all items.
 * @param {string} parentId Parent id to find children of ('' for top level).
 */
export function getChildren( items, parentId ) {
	return items
		.filter( ( item ) => ( item.parentId || '' ) === parentId )
		.sort( ( a, b ) => ( a.order || 0 ) - ( b.order || 0 ) );
}

/**
 * All descendant ids of a given item — used to stop an item being made a
 * child of its own descendant, which would create a cycle the drill-down
 * renderer could loop on forever.
 * @param {Array}  items  Flat array of all items.
 * @param {string} itemId Item id to find descendants of.
 */
export function getDescendantIds( items, itemId ) {
	const direct = items.filter( ( item ) => item.parentId === itemId );
	let all = direct.map( ( item ) => item.id );
	direct.forEach( ( child ) => {
		all = all.concat( getDescendantIds( items, child.id ) );
	} );
	return all;
}

/**
 * Recomputes `order` (within each parent group) and `depth` (distance from
 * the root) for every item, from the current parentId relationships and
 * array order. Called after any add/remove/reparent/reorder so the saved
 * data always has internally consistent order/depth values rather than
 * relying on the client to keep them in sync by hand.
 * @param {Array} items Flat array of all items.
 */
export function normalizeItems( items ) {
	const byParent = {};
	items.forEach( ( item ) => {
		const key = item.parentId || '';
		byParent[ key ] = byParent[ key ] || [];
		byParent[ key ].push( item );
	} );

	const result = [];
	const visit = ( parentId, depth ) => {
		const siblings = byParent[ parentId ] || [];
		siblings.forEach( ( item, index ) => {
			result.push( { ...item, order: index, depth } );
			visit( item.id, depth + 1 );
		} );
	};
	visit( '', 0 );

	// Anything whose parentId didn't resolve to a real, visited item (e.g.
	// pointed at something since deleted) falls back to top-level rather
	// than silently vanishing from the saved array.
	const visitedIds = new Set( result.map( ( item ) => item.id ) );
	items.forEach( ( item ) => {
		if ( ! visitedIds.has( item.id ) ) {
			result.push( {
				...item,
				parentId: '',
				depth: 0,
				order: result.length,
			} );
		}
	} );

	return result;
}
