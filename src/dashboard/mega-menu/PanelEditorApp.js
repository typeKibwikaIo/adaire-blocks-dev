import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Button, Notice, SelectControl } from '@wordpress/components';
import LayoutPicker from './LayoutPicker';
import ItemList from './ItemList';
import LivePreview from './LivePreview';
import DynamicSourceFields from './DynamicSourceFields';
import { getChildren, emptyDynamicSource } from './utils';

const NESTING_LAYOUTS = [ 'tabbed', 'showcase' ];
const FLAT_LAYOUTS = [ 'gallery', 'link-list' ];

export default function PanelEditorApp( { config } ) {
	const [ layout, setLayout ] = useState( config.layout );
	const [ items, setItems ] = useState( config.items || [] );
	const [ defaultActiveId, setDefaultActiveId ] = useState(
		config.defaultActiveId || ''
	);
	const [ dynamicSource, setDynamicSource ] = useState( {
		...emptyDynamicSource(),
		...config.dynamicSource,
	} );
	const [ saveState, setSaveState ] = useState( 'idle' ); // idle | saving | saved | error
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ isDirty, setIsDirty ] = useState( false );
	const [ postTypeOptions, setPostTypeOptions ] = useState( [
		{ label: __( 'Posts', 'adaire-blocks' ), value: 'post' },
	] );
	const [ taxonomyOptions, setTaxonomyOptions ] = useState( [] );

	// Populates the dynamic-source pickers from what's actually registered
	// on this site — never hardcoded, so a source can never be offered that
	// doesn't exist. Both endpoints are core REST routes, always present.
	useEffect( () => {
		apiFetch( { path: '/wp/v2/types?context=view' } )
			.then( ( types ) => {
				const options = Object.values( types || {} )
					.filter( ( type ) => type.rest_base )
					.map( ( type ) => ( {
						label: type.name,
						value: type.slug,
					} ) );
				if ( options.length ) {
					setPostTypeOptions( options );
				}
			} )
			.catch( () => {} );

		apiFetch( { path: '/wp/v2/taxonomies?context=view' } )
			.then( ( taxonomies ) => {
				setTaxonomyOptions(
					Object.values( taxonomies || {} ).map( ( tax ) => ( {
						label: tax.name,
						value: tax.slug,
					} ) )
				);
			} )
			.catch( () => {} );
	}, [] );

	const markDirty = ( setter ) => ( value ) => {
		setter( value );
		setIsDirty( true );
		setSaveState( 'idle' );
	};

	const handleSave = () => {
		setSaveState( 'saving' );
		setErrorMessage( '' );

		apiFetch( {
			url: config.restUrl,
			method: 'POST',
			data: {
				meta: {
					_adaire_mega_panel_layout: layout,
					_adaire_mega_panel_items: items,
					_adaire_mega_panel_default_active_id: defaultActiveId,
					_adaire_mega_panel_dynamic_source: dynamicSource,
				},
			},
		} )
			.then( ( response ) => {
				setSaveState( 'saved' );
				setIsDirty( false );
				// Reflect back whatever the server actually stored (it
				// re-sanitizes independently of the client) so the editor
				// never drifts from what's really saved.
				const savedLayout = response?.meta?._adaire_mega_panel_layout;
				const savedItems = response?.meta?._adaire_mega_panel_items;
				const savedSource =
					response?.meta?._adaire_mega_panel_dynamic_source;
				if ( savedLayout ) {
					setLayout( savedLayout );
				}
				if ( Array.isArray( savedItems ) ) {
					setItems( savedItems );
				}
				if ( savedSource ) {
					setDynamicSource( {
						...emptyDynamicSource(),
						...savedSource,
					} );
				}
			} )
			.catch( ( error ) => {
				setSaveState( 'error' );
				setErrorMessage(
					error?.message ||
						__(
							'Something went wrong while saving.',
							'adaire-blocks'
						)
				);
			} );
	};

	const topLevelOptions = [
		{ label: __( '— First item —', 'adaire-blocks' ), value: '' },
		...getChildren( items, '' ).map( ( item ) => ( {
			label: item.title || __( '(untitled)', 'adaire-blocks' ),
			value: item.id,
		} ) ),
	];

	return (
		<div className="adaire-mpe">
			{ 'error' === saveState && (
				<Notice status="error" isDismissible={ false }>
					{ errorMessage }
				</Notice>
			) }
			{ 'saved' === saveState && ! isDirty && (
				<Notice status="success" isDismissible={ false }>
					{ __( 'Saved.', 'adaire-blocks' ) }
				</Notice>
			) }

			<h3>{ __( 'Layout', 'adaire-blocks' ) }</h3>
			<LayoutPicker
				value={ layout }
				onChange={ markDirty( setLayout ) }
			/>

			{ 'standard' !== layout && (
				<>
					{ [ 'tabbed', 'showcase' ].includes( layout ) && (
						<SelectControl
							label={ __(
								'Default active category',
								'adaire-blocks'
							) }
							value={ defaultActiveId }
							options={ topLevelOptions }
							onChange={ markDirty( setDefaultActiveId ) }
						/>
					) }

					{ FLAT_LAYOUTS.includes( layout ) && (
						<>
							<h3>
								{ __( 'Dynamic content', 'adaire-blocks' ) }
							</h3>
							<p className="adaire-mpe-help">
								{ __(
									'Populate this layout from a live source instead of manually adding items below.',
									'adaire-blocks'
								) }
							</p>
							<DynamicSourceFields
								value={ dynamicSource }
								onChange={ markDirty( setDynamicSource ) }
								postTypeOptions={ postTypeOptions }
								taxonomyOptions={ taxonomyOptions }
								wooCommerceActive={
									!! config.wooCommerceActive
								}
							/>
						</>
					) }

					<h3>{ __( 'Items', 'adaire-blocks' ) }</h3>
					<ItemList
						items={ items }
						onChange={ markDirty( setItems ) }
						allowNesting={ NESTING_LAYOUTS.includes( layout ) }
						postTypeOptions={ postTypeOptions }
						taxonomyOptions={ taxonomyOptions }
						wooCommerceActive={ !! config.wooCommerceActive }
					/>

					<h3>{ __( 'Preview', 'adaire-blocks' ) }</h3>
					<LivePreview
						layout={ layout }
						items={ items }
						defaultActiveId={ defaultActiveId }
					/>
				</>
			) }

			<div className="adaire-mpe-save-bar">
				<Button
					variant="primary"
					onClick={ handleSave }
					isBusy={ 'saving' === saveState }
					disabled={ 'saving' === saveState || ! isDirty }
				>
					{ 'saving' === saveState
						? __( 'Saving…', 'adaire-blocks' )
						: __( 'Save panel layout & items', 'adaire-blocks' ) }
				</Button>
				{ isDirty && 'saving' !== saveState && (
					<span className="adaire-mpe-unsaved-note">
						{ __( 'Unsaved changes', 'adaire-blocks' ) }
					</span>
				) }
			</div>
		</div>
	);
}
