import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	RangeControl,
	ToggleControl,
	TextControl,
	ExternalLink,
	Notice,
	Spinner,
} from '@wordpress/components';
import InspectorTabs from '../components/InspectorTabs';

export default function Edit( { attributes, setAttributes } ) {
	const {
		menuId,
		menuItemId,
		panelId,
		layout,
		maxWidth,
		alignment,
		trigger,
		breakpoint,
		animation,
		animationDuration,
		openDelay,
		closeDelay,
		panelPadding,
		closeOnOutsideClick,
		closeOnEscape,
		closeOnLinkSelect,
		keepOnlyOneOpen,
		mobileMode,
		mobilePanelPadding,
		mobileSubmenuIndent,
		lockBodyScroll,
		mobileLabel,
	} = attributes;

	const blockProps = useBlockProps( {
		className: 'adaire-mega-menu-item-editor',
	} );

	const [ menus, setMenus ] = useState( [] );
	const [ menusLoading, setMenusLoading ] = useState( true );
	const [ menuItems, setMenuItems ] = useState( [] );
	const [ itemsLoading, setItemsLoading ] = useState( false );
	const [ panels, setPanels ] = useState( [] );
	const [ panelsLoading, setPanelsLoading ] = useState( true );

	// Load the site's registered WordPress menus (Appearance > Menus) once.
	useEffect( () => {
		apiFetch( { path: '/wp/v2/menus?per_page=100&_fields=id,name' } )
			.then( ( results ) => {
				setMenus( Array.isArray( results ) ? results : [] );
				setMenusLoading( false );
			} )
			.catch( () => {
				setMenus( [] );
				setMenusLoading( false );
			} );
	}, [] );

	// Load top-level items for whichever menu is currently selected, so the
	// item picker always reflects the real, live menu structure — nothing
	// here is ever typed in manually.
	useEffect( () => {
		if ( ! menuId ) {
			setMenuItems( [] );
			return;
		}
		setItemsLoading( true );
		apiFetch( {
			path: `/wp/v2/menu-items?menus=${ menuId }&per_page=100&_fields=id,title,parent,menu_order`,
		} )
			.then( ( results ) => {
				const items = Array.isArray( results ) ? results : [];
				const topLevel = items
					.filter( ( item ) => ! item.parent )
					.sort( ( a, b ) => a.menu_order - b.menu_order );
				setMenuItems( topLevel );
				setItemsLoading( false );
			} )
			.catch( () => {
				setMenuItems( [] );
				setItemsLoading( false );
			} );
	}, [ menuId ] );

	useEffect( () => {
		apiFetch( {
			path: '/wp/v2/adaire-mega-panels?status=publish,draft&per_page=100&_fields=id,title,status',
		} )
			.then( ( results ) => {
				setPanels( Array.isArray( results ) ? results : [] );
				setPanelsLoading( false );
			} )
			.catch( () => {
				setPanels( [] );
				setPanelsLoading( false );
			} );
	}, [] );

	const menuOptions = [
		{ label: __( '— Select a menu —', 'adaire-blocks' ), value: 0 },
		...menus.map( ( menu ) => ( {
			label: menu.name,
			value: menu.id,
		} ) ),
	];

	const menuItemOptions = [
		{ label: __( '— Select a menu item —', 'adaire-blocks' ), value: 0 },
		...menuItems.map( ( item ) => ( {
			label:
				item.title && item.title.rendered
					? item.title.rendered
					: __( '(no label)', 'adaire-blocks' ),
			value: item.id,
		} ) ),
	];

	const panelOptions = [
		{ label: __( '— Select a mega panel —', 'adaire-blocks' ), value: 0 },
		...panels.map( ( panel ) => ( {
			label:
				( panel.title && panel.title.rendered
					? panel.title.rendered
					: __( '(no title)', 'adaire-blocks' ) ) +
				( panel.status !== 'publish' ? ` (${ panel.status })` : '' ),
			value: panel.id,
		} ) ),
	];

	const selectedMenuItem = menuItems.find(
		( item ) => item.id === menuItemId
	);
	const selectedPanel = panels.find( ( panel ) => panel.id === panelId );
	const managePanelsUrl =
		'/wp-admin/admin.php?page=adaire-blocks-mega-menu&tab=panels';
	const manageMenusUrl = '/wp-admin/nav-menus.php';

	return (
		<>
			<InspectorTabs
				attributes={ attributes }
				setAttributes={ setAttributes }
			>
				<PanelBody
					section="content"
					title={ __( 'Menu Source', 'adaire-blocks' ) }
					initialOpen={ true }
				>
					<p className="adaire-mega-menu-item-help">
						{ __(
							'Pick an existing top-level item from one of your WordPress menus — its label and link come from there, so editing the menu keeps this in sync.',
							'adaire-blocks'
						) }
					</p>
					<SelectControl
						label={ __( 'Menu', 'adaire-blocks' ) }
						value={ menuId }
						options={ menuOptions }
						onChange={ ( value ) => {
							const nextMenuId = parseInt( value, 10 );
							setAttributes( {
								menuId: nextMenuId,
								menuItemId: 0,
							} );
						} }
						help={
							! menusLoading && menus.length === 0
								? __(
										'No menus found — create one under Appearance > Menus.',
										'adaire-blocks'
								  )
								: undefined
						}
					/>
					{ !! menuId && itemsLoading && <Spinner /> }
					{ !! menuId && ! itemsLoading && (
						<SelectControl
							label={ __( 'Menu item', 'adaire-blocks' ) }
							value={ menuItemId }
							options={ menuItemOptions }
							onChange={ ( value ) =>
								setAttributes( {
									menuItemId: parseInt( value, 10 ),
								} )
							}
							help={
								menuItems.length === 0
									? __(
											'This menu has no top-level items yet.',
											'adaire-blocks'
									  )
									: undefined
							}
						/>
					) }
					<p>
						<ExternalLink href={ manageMenusUrl }>
							{ __( 'Manage menus', 'adaire-blocks' ) }
						</ExternalLink>
					</p>

					<SelectControl
						label={ __( 'Mega panel', 'adaire-blocks' ) }
						value={ panelId }
						options={ panelOptions }
						onChange={ ( value ) =>
							setAttributes( { panelId: parseInt( value, 10 ) } )
						}
						help={
							! panelsLoading && panels.length === 0
								? __(
										'No mega panels exist yet — create one from the Mega Menu dashboard.',
										'adaire-blocks'
								  )
								: undefined
						}
					/>
					<p>
						<ExternalLink href={ managePanelsUrl }>
							{ __( 'Manage mega panels', 'adaire-blocks' ) }
						</ExternalLink>
					</p>
				</PanelBody>

				<PanelBody
					section="layout"
					title={ __( 'Desktop Layout', 'adaire-blocks' ) }
					initialOpen={ false }
				>
					<SelectControl
						label={ __( 'Dropdown width', 'adaire-blocks' ) }
						value={ layout }
						options={ [
							{
								label: __( 'Contained', 'adaire-blocks' ),
								value: 'contained',
							},
							{
								label: __( 'Wide', 'adaire-blocks' ),
								value: 'wide',
							},
							{
								label: __( 'Full viewport', 'adaire-blocks' ),
								value: 'full',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { layout: value } )
						}
					/>
					{ layout === 'contained' && (
						<RangeControl
							label={ __(
								'Maximum width (px)',
								'adaire-blocks'
							) }
							value={ maxWidth }
							onChange={ ( value ) =>
								setAttributes( { maxWidth: value } )
							}
							min={ 320 }
							max={ 1600 }
						/>
					) }
					<SelectControl
						label={ __( 'Dropdown alignment', 'adaire-blocks' ) }
						value={ alignment }
						options={ [
							{
								label: __( 'Left', 'adaire-blocks' ),
								value: 'left',
							},
							{
								label: __( 'Centre', 'adaire-blocks' ),
								value: 'center',
							},
							{
								label: __( 'Right', 'adaire-blocks' ),
								value: 'right',
							},
							{
								label: __(
									'Stretch to container',
									'adaire-blocks'
								),
								value: 'stretch',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { alignment: value } )
						}
					/>
					<RangeControl
						label={ __( 'Panel padding (px)', 'adaire-blocks' ) }
						value={ panelPadding }
						onChange={ ( value ) =>
							setAttributes( { panelPadding: value } )
						}
						min={ 0 }
						max={ 80 }
					/>
				</PanelBody>

				<PanelBody
					section="layout"
					title={ __( 'Behaviour', 'adaire-blocks' ) }
					initialOpen={ false }
				>
					<SelectControl
						label={ __( 'Activation trigger', 'adaire-blocks' ) }
						value={ trigger }
						options={ [
							{
								label: __( 'Hover', 'adaire-blocks' ),
								value: 'hover',
							},
							{
								label: __( 'Click', 'adaire-blocks' ),
								value: 'click',
							},
							{
								label: __(
									'Hover and keyboard focus',
									'adaire-blocks'
								),
								value: 'hover-focus',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { trigger: value } )
						}
					/>
					{ trigger !== 'click' && (
						<>
							<RangeControl
								label={ __(
									'Open delay (ms)',
									'adaire-blocks'
								) }
								value={ openDelay }
								onChange={ ( value ) =>
									setAttributes( { openDelay: value } )
								}
								min={ 0 }
								max={ 1000 }
								step={ 50 }
							/>
							<RangeControl
								label={ __(
									'Close delay (ms)',
									'adaire-blocks'
								) }
								value={ closeDelay }
								onChange={ ( value ) =>
									setAttributes( { closeDelay: value } )
								}
								min={ 0 }
								max={ 1000 }
								step={ 50 }
							/>
						</>
					) }
					<RangeControl
						label={ __(
							'Mobile breakpoint (px)',
							'adaire-blocks'
						) }
						value={ breakpoint }
						onChange={ ( value ) =>
							setAttributes( { breakpoint: value } )
						}
						min={ 320 }
						max={ 1600 }
					/>
					<ToggleControl
						label={ __(
							'Close when clicking outside',
							'adaire-blocks'
						) }
						checked={ closeOnOutsideClick }
						onChange={ ( value ) =>
							setAttributes( { closeOnOutsideClick: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Close with Escape', 'adaire-blocks' ) }
						checked={ closeOnEscape }
						onChange={ ( value ) =>
							setAttributes( { closeOnEscape: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Close when a link inside is selected',
							'adaire-blocks'
						) }
						checked={ closeOnLinkSelect }
						onChange={ ( value ) =>
							setAttributes( { closeOnLinkSelect: value } )
						}
					/>
					<ToggleControl
						label={ __(
							'Keep only one mega menu open at a time',
							'adaire-blocks'
						) }
						checked={ keepOnlyOneOpen }
						onChange={ ( value ) =>
							setAttributes( { keepOnlyOneOpen: value } )
						}
					/>
				</PanelBody>

				<PanelBody
					section="layout"
					title={ __( 'Mobile', 'adaire-blocks' ) }
					initialOpen={ false }
				>
					<SelectControl
						label={ __( 'Mobile mode', 'adaire-blocks' ) }
						value={ mobileMode }
						options={ [
							{
								label: __( 'Accordion', 'adaire-blocks' ),
								value: 'accordion',
							},
							{
								label: __( 'Drill-down', 'adaire-blocks' ),
								value: 'drilldown',
							},
							{
								label: __(
									'Full-screen drawer',
									'adaire-blocks'
								),
								value: 'drawer',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { mobileMode: value } )
						}
					/>
					<RangeControl
						label={ __(
							'Mobile panel padding (px)',
							'adaire-blocks'
						) }
						value={ mobilePanelPadding }
						onChange={ ( value ) =>
							setAttributes( { mobilePanelPadding: value } )
						}
						min={ 0 }
						max={ 60 }
					/>
					<RangeControl
						label={ __(
							'Mobile submenu indent (px)',
							'adaire-blocks'
						) }
						value={ mobileSubmenuIndent }
						onChange={ ( value ) =>
							setAttributes( { mobileSubmenuIndent: value } )
						}
						min={ 0 }
						max={ 48 }
					/>
					{ 'drawer' === mobileMode && (
						<ToggleControl
							label={ __(
								'Lock body scroll while open',
								'adaire-blocks'
							) }
							checked={ lockBodyScroll }
							onChange={ ( value ) =>
								setAttributes( { lockBodyScroll: value } )
							}
						/>
					) }
					<TextControl
						label={ __( 'Mobile label override', 'adaire-blocks' ) }
						help={ __(
							'Optional — shown instead of the menu label below the configured breakpoint.',
							'adaire-blocks'
						) }
						value={ mobileLabel }
						onChange={ ( value ) =>
							setAttributes( { mobileLabel: value } )
						}
					/>
				</PanelBody>

				<PanelBody
					section="style"
					priority="medium"
					title={ __( 'Animation', 'adaire-blocks' ) }
					initialOpen={ false }
				>
					<SelectControl
						label={ __( 'Animation', 'adaire-blocks' ) }
						value={ animation }
						options={ [
							{
								label: __( 'None', 'adaire-blocks' ),
								value: 'none',
							},
							{
								label: __( 'Fade', 'adaire-blocks' ),
								value: 'fade',
							},
							{
								label: __( 'Fade and slide', 'adaire-blocks' ),
								value: 'fade-slide',
							},
							{
								label: __( 'Scale', 'adaire-blocks' ),
								value: 'scale',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { animation: value } )
						}
					/>
					{ animation !== 'none' && (
						<RangeControl
							label={ __( 'Duration (ms)', 'adaire-blocks' ) }
							value={ animationDuration }
							onChange={ ( value ) =>
								setAttributes( { animationDuration: value } )
							}
							min={ 0 }
							max={ 800 }
							step={ 50 }
						/>
					) }
					<Notice status="info" isDismissible={ false }>
						{ __(
							'Animation is automatically disabled for visitors who prefer reduced motion.',
							'adaire-blocks'
						) }
					</Notice>
				</PanelBody>
			</InspectorTabs>

			<div { ...blockProps }>
				<span className="adaire-mega-menu-item-editor__trigger">
					<span>
						{ selectedMenuItem
							? selectedMenuItem.title.rendered
							: __( 'Menu Item', 'adaire-blocks' ) }
					</span>
					<span
						className="adaire-mega-menu-item-editor__chevron"
						aria-hidden="true"
					>
						▾
					</span>
				</span>
				{ ! menuItemId && (
					<Notice status="warning" isDismissible={ false }>
						{ __(
							'Select a menu and menu item in the sidebar — nothing renders on the front end until one is chosen.',
							'adaire-blocks'
						) }
					</Notice>
				) }
				{ !! menuItemId && ! panelId && (
					<Notice status="warning" isDismissible={ false }>
						{ __(
							'No mega panel assigned yet — this item will render as a plain link until one is selected.',
							'adaire-blocks'
						) }
					</Notice>
				) }
				{ panelId && selectedPanel && (
					<div className="adaire-mega-menu-item-editor__preview">
						{ __( 'Mega Panel:', 'adaire-blocks' ) }{ ' ' }
						<strong>
							{ selectedPanel.title &&
							selectedPanel.title.rendered
								? selectedPanel.title.rendered
								: __( '(no title)', 'adaire-blocks' ) }
						</strong>
						{ selectedPanel.status !== 'publish' && (
							<span className="adaire-mega-menu-item-editor__status-badge">
								{ selectedPanel.status }
							</span>
						) }
					</div>
				) }
				{ panelId && ! panelsLoading && ! selectedPanel && (
					<Notice status="error" isDismissible={ false }>
						{ __(
							'The assigned mega panel could not be found — it may have been deleted.',
							'adaire-blocks'
						) }
					</Notice>
				) }
			</div>
		</>
	);
}
