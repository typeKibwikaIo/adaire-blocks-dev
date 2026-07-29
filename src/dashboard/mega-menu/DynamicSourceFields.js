import { __ } from '@wordpress/i18n';
import {
	SelectControl,
	RangeControl,
	TextControl,
} from '@wordpress/components';
import { emptyDynamicSource } from './utils';

/**
 * Shared "pull this content from a live query instead of authoring it by
 * hand" control set — used both per-item (tabbed category cards, showcase
 * drill-down children) and at the panel level (gallery/link-list top-level
 * items). Options are built from what's actually registered on this site
 * (postTypeOptions/taxonomyOptions come from the REST API; WooCommerce
 * options only appear when wooCommerceActive is true) so nothing offered
 * here can point at a source that doesn't exist.
 *
 * @param {Object}   root0                   Props.
 * @param {Object}   root0.value             Current dynamicSource value.
 * @param {Function} root0.onChange          Called with the updated dynamicSource.
 * @param {Array}    root0.postTypeOptions   [{ label, value }] from /wp/v2/types.
 * @param {Array}    root0.taxonomyOptions   [{ label, value }] from /wp/v2/taxonomies.
 * @param {boolean}  root0.wooCommerceActive Whether WooCommerce source types should be offered.
 */
export default function DynamicSourceFields( {
	value,
	onChange,
	postTypeOptions,
	taxonomyOptions,
	wooCommerceActive,
} ) {
	const source = { ...emptyDynamicSource(), ...value };
	const set = ( field ) => ( fieldValue ) =>
		onChange( { ...source, [ field ]: fieldValue } );

	const typeOptions = [
		{ label: __( 'None (manual)', 'adaire-blocks' ), value: 'none' },
		{ label: __( 'Latest posts', 'adaire-blocks' ), value: 'posts' },
		{ label: __( 'Taxonomy terms', 'adaire-blocks' ), value: 'terms' },
		...( wooCommerceActive
			? [
					{
						label: __( 'WooCommerce products', 'adaire-blocks' ),
						value: 'products',
					},
					{
						label: __(
							'WooCommerce product categories',
							'adaire-blocks'
						),
						value: 'product_categories',
					},
			  ]
			: [] ),
	];

	return (
		<div className="adaire-mpe-dynamic-source">
			<SelectControl
				label={ __( 'Populate from', 'adaire-blocks' ) }
				value={ source.type }
				options={ typeOptions }
				onChange={ set( 'type' ) }
				help={
					'none' !== source.type
						? __(
								'Manually-added items below are ignored while a live source is selected.',
								'adaire-blocks'
						  )
						: undefined
				}
			/>

			{ 'posts' === source.type && (
				<>
					<SelectControl
						label={ __( 'Post type', 'adaire-blocks' ) }
						value={ source.postType }
						options={ postTypeOptions }
						onChange={ set( 'postType' ) }
					/>
					<SelectControl
						label={ __(
							'Filter by taxonomy (optional)',
							'adaire-blocks'
						) }
						value={ source.taxonomy }
						options={ [
							{
								label: __( '— None —', 'adaire-blocks' ),
								value: '',
							},
							...taxonomyOptions,
						] }
						onChange={ set( 'taxonomy' ) }
					/>
					{ source.taxonomy && (
						<TextControl
							label={ __(
								'Filter by term slug (optional)',
								'adaire-blocks'
							) }
							value={ source.term }
							onChange={ set( 'term' ) }
						/>
					) }
				</>
			) }

			{ 'terms' === source.type && (
				<SelectControl
					label={ __( 'Taxonomy', 'adaire-blocks' ) }
					value={ source.taxonomy }
					options={ [
						{
							label: __( '— Select —', 'adaire-blocks' ),
							value: '',
						},
						...taxonomyOptions,
					] }
					onChange={ set( 'taxonomy' ) }
				/>
			) }

			{ 'products' === source.type && (
				<TextControl
					label={ __(
						'Filter by product category slug (optional)',
						'adaire-blocks'
					) }
					value={ source.term }
					onChange={ set( 'term' ) }
				/>
			) }

			{ 'none' !== source.type && (
				<>
					<RangeControl
						label={ __( 'Number of items', 'adaire-blocks' ) }
						value={ source.count }
						onChange={ set( 'count' ) }
						min={ 1 }
						max={ 50 }
					/>
					<SelectControl
						label={ __( 'Order by', 'adaire-blocks' ) }
						value={ source.orderby }
						options={ [
							{
								label: __( 'Date', 'adaire-blocks' ),
								value: 'date',
							},
							{
								label: __( 'Title', 'adaire-blocks' ),
								value: 'title',
							},
							{
								label: __( 'Menu order', 'adaire-blocks' ),
								value: 'menu_order',
							},
							{
								label: __( 'Random', 'adaire-blocks' ),
								value: 'rand',
							},
						] }
						onChange={ set( 'orderby' ) }
					/>
					<SelectControl
						label={ __( 'Order', 'adaire-blocks' ) }
						value={ source.order }
						options={ [
							{
								label: __( 'Descending', 'adaire-blocks' ),
								value: 'DESC',
							},
							{
								label: __( 'Ascending', 'adaire-blocks' ),
								value: 'ASC',
							},
						] }
						onChange={ set( 'order' ) }
					/>
				</>
			) }
		</div>
	);
}
