import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { getChildren } from './utils';

/**
 * A lightweight, client-side-only preview of the current layout/items —
 * not the real front-end render (that's server-side, per-theme, and styled
 * by the block's own Inspector settings), just enough for an editor to see
 * the structure and content they're building without saving + viewing the
 * real page first.
 * @param {Object} root0                 Props.
 * @param {string} root0.layout          Selected layout key.
 * @param {Array}  root0.items           Flat array of all items in this panel.
 * @param {string} root0.defaultActiveId Id of the item active by default.
 */
export default function LivePreview( { layout, items, defaultActiveId } ) {
	const topLevel = getChildren( items, '' ).filter(
		( item ) => item.visible
	);
	const [ activeId, setActiveId ] = useState(
		defaultActiveId || topLevel[ 0 ]?.id || null
	);

	useEffect( () => {
		if ( ! topLevel.find( ( item ) => item.id === activeId ) ) {
			setActiveId( defaultActiveId || topLevel[ 0 ]?.id || null );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ items, defaultActiveId ] );

	if ( 'standard' === layout ) {
		return (
			<p className="adaire-mpe-preview-note">
				{ __(
					'Standard layout uses the block editor content below — preview there.',
					'adaire-blocks'
				) }
			</p>
		);
	}

	if ( topLevel.length === 0 ) {
		return (
			<p className="adaire-mpe-preview-note">
				{ __( 'Add items above to see a preview.', 'adaire-blocks' ) }
			</p>
		);
	}

	if ( 'tabbed' === layout ) {
		const active =
			topLevel.find( ( item ) => item.id === activeId ) || topLevel[ 0 ];
		const cards = getChildren( items, active.id ).filter(
			( item ) => item.visible
		);
		return (
			<div className="adaire-mpe-preview adaire-mpe-preview--tabbed">
				<div className="adaire-mpe-preview-categories">
					{ topLevel.map( ( item ) => (
						<button
							key={ item.id }
							type="button"
							className={
								'adaire-mpe-preview-category' +
								( item.id === active.id ? ' is-active' : '' )
							}
							onClick={ () => setActiveId( item.id ) }
						>
							{ item.title ||
								__( '(untitled)', 'adaire-blocks' ) }
							{ item.eyebrow && (
								<span className="adaire-mpe-preview-eyebrow">
									{ item.eyebrow }
								</span>
							) }
						</button>
					) ) }
				</div>
				<div className="adaire-mpe-preview-cards">
					{ cards.length === 0 && (
						<p className="adaire-mpe-preview-note">
							{ __(
								'No cards under this category yet.',
								'adaire-blocks'
							) }
						</p>
					) }
					{ cards.map( ( card ) => (
						<div
							key={ card.id }
							className="adaire-mpe-preview-card"
						>
							{ card.image?.url && (
								<img src={ card.image.url } alt="" />
							) }
							<strong>{ card.title }</strong>
							<p>{ card.description }</p>
						</div>
					) ) }
				</div>
			</div>
		);
	}

	if ( 'showcase' === layout ) {
		const children = getChildren( items, activeId || '' );
		const trail = [];
		let cursor = activeId;
		while ( cursor ) {
			const node = items.find( ( item ) => item.id === cursor );
			if ( ! node ) {
				break;
			}
			trail.unshift( node );
			cursor = node.parentId || null;
		}
		const level = activeId ? children : topLevel;
		return (
			<div className="adaire-mpe-preview adaire-mpe-preview--showcase">
				<div className="adaire-mpe-preview-breadcrumb">
					<button type="button" onClick={ () => setActiveId( null ) }>
						{ __( 'Top', 'adaire-blocks' ) }
					</button>
					{ trail.map( ( node ) => (
						<span key={ node.id }>
							{ ' / ' }
							<button
								type="button"
								onClick={ () => setActiveId( node.id ) }
							>
								{ node.title ||
									__( '(untitled)', 'adaire-blocks' ) }
							</button>
						</span>
					) ) }
				</div>
				<div className="adaire-mpe-preview-level">
					{ level
						.filter( ( item ) => item.visible )
						.map( ( item ) => {
							const hasChildren =
								getChildren( items, item.id ).length > 0;
							return (
								<button
									key={ item.id }
									type="button"
									className="adaire-mpe-preview-drill-item"
									onClick={ () =>
										hasChildren
											? setActiveId( item.id )
											: null
									}
								>
									{ item.title ||
										__( '(untitled)', 'adaire-blocks' ) }
									{ hasChildren && (
										<span aria-hidden="true"> ›</span>
									) }
								</button>
							);
						} ) }
				</div>
			</div>
		);
	}

	if ( 'gallery' === layout ) {
		return (
			<div className="adaire-mpe-preview adaire-mpe-preview--gallery">
				{ topLevel.map( ( item ) => (
					<div
						key={ item.id }
						className="adaire-mpe-preview-gallery-item"
					>
						{ item.image?.url && (
							<img src={ item.image.url } alt="" />
						) }
						<strong>{ item.title }</strong>
					</div>
				) ) }
			</div>
		);
	}

	// link-list
	return (
		<ul className="adaire-mpe-preview adaire-mpe-preview--link-list">
			{ topLevel.map( ( item ) => (
				<li key={ item.id }>{ item.title || item.url }</li>
			) ) }
		</ul>
	);
}
