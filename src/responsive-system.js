import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
	Button,
	ButtonGroup,
} from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useMemo, useState } from '@wordpress/element';
import { desktop, tablet, mobile } from '@wordpress/icons';
import './responsive-system.scss';

const DEVICES = [
	{ key: 'desktop', label: 'Desktop', icon: desktop, width: 1440, height: 900 },
	{ key: 'tablet', label: 'Tablet', icon: tablet, width: 900, height: 1180 },
	{ key: 'mobile', label: 'Mobile', icon: mobile, width: 390, height: 844 },
	{ key: 'smartwatch', label: 'Smartwatch', icon: 'âŒš', width: 280, height: 320 },
];

const DEVICE_KEYS = DEVICES.map( ( { key } ) => key );
const RESPONSIVE_BLOCK_PREFIXES = [ 'create-block/', 'adaire/' ];
const STORE_KEY = 'adaireResponsiveDevice';
const VIEWPORT_STORE_KEY = 'adaireResponsiveViewport';
const ZOOM_OPTIONS = [ 50, 75, 90, 100, 125, 150 ];

const RESPONSIVE_STYLE_FIELDS = [
	[ 'width', 'Width' ],
	[ 'height', 'Height' ],
	[ 'minWidth', 'Min Width' ],
	[ 'maxWidth', 'Max Width' ],
	[ 'minHeight', 'Min Height' ],
	[ 'maxHeight', 'Max Height' ],
	[ 'margin', 'Margin' ],
	[ 'padding', 'Padding' ],
	[ 'gap', 'Gap' ],
	[ 'fontSize', 'Font Size' ],
	[ 'fontWeight', 'Font Weight' ],
	[ 'lineHeight', 'Line Height' ],
	[ 'letterSpacing', 'Letter Spacing' ],
	[ 'textAlign', 'Text Alignment' ],
	[ 'display', 'Display' ],
	[ 'position', 'Position' ],
	[ 'top', 'Top' ],
	[ 'bottom', 'Bottom' ],
	[ 'left', 'Left' ],
	[ 'right', 'Right' ],
	[ 'zIndex', 'Z-Index' ],
	[ 'backgroundColor', 'Background Color' ],
	[ 'backgroundImage', 'Background Image' ],
	[ 'border', 'Border' ],
	[ 'borderRadius', 'Border Radius' ],
	[ 'boxShadow', 'Box Shadow' ],
	[ 'opacity', 'Opacity' ],
];

const DEFAULT_RESPONSIVE = DEVICE_KEYS.reduce(
	( settings, device ) => ( {
		...settings,
		[ device ]: { visible: true },
	} ),
	{}
);

const getActiveDevice = () => {
	if ( typeof window === 'undefined' ) {
		return 'desktop';
	}

	const storedDevice = window.localStorage.getItem( STORE_KEY );

	return DEVICE_KEYS.includes( storedDevice ) ? storedDevice : 'desktop';
};

const setActiveDevice = ( device ) => {
	if ( typeof window === 'undefined' ) {
		return;
	}

	window.localStorage.setItem( STORE_KEY, device );
	window.dispatchEvent(
		new CustomEvent( 'adaire-responsive-device-change', {
			detail: { device },
		} )
	);
};

const getDeviceConfig = ( device ) =>
	DEVICES.find( ( { key } ) => key === device ) || DEVICES[ 0 ];

const getStoredViewport = ( device ) => {
	const deviceConfig = getDeviceConfig( device );

	if ( typeof window === 'undefined' ) {
		return { width: deviceConfig.width, height: deviceConfig.height, zoom: 100 };
	}

	try {
		const storedViewport = JSON.parse(
			window.localStorage.getItem( VIEWPORT_STORE_KEY ) || '{}'
		);

		return {
			width: Number( storedViewport.width ) || deviceConfig.width,
			height: Number( storedViewport.height ) || deviceConfig.height,
			zoom: Number( storedViewport.zoom ) || 100,
		};
	} catch ( error ) {
		return { width: deviceConfig.width, height: deviceConfig.height, zoom: 100 };
	}
};

const setStoredViewport = ( viewport ) => {
	if ( typeof window === 'undefined' ) {
		return;
	}

	window.localStorage.setItem(
		VIEWPORT_STORE_KEY,
		JSON.stringify( viewport )
	);
};

const getEditorIframes = () => {
	if ( typeof document === 'undefined' ) {
		return [];
	}

	return Array.from( document.querySelectorAll( 'iframe' ) ).filter(
		( iframe ) => iframe.contentDocument
	);
};

const getEditorDocuments = () => {
	if ( typeof document === 'undefined' ) {
		return [];
	}

	return [
		document,
		...getEditorIframes()
			.map( ( iframe ) => iframe.contentDocument )
			.filter( Boolean ),
	];
};

const applyDeviceToEditorDocument = ( editorDocument, device, viewport ) => {
	const deviceConfig = getDeviceConfig( device );
	const previewWidth = Number( viewport?.width ) || deviceConfig.width;
	const previewHeight = Number( viewport?.height ) || deviceConfig.height;
	const previewZoom = ( Number( viewport?.zoom ) || 100 ) / 100;
	const targets = [
		...Array.from(
			editorDocument.querySelectorAll(
				'.block-editor-writing-flow, .block-editor-block-list__layout.is-root-container, .is-root-container, .editor-styles-wrapper, .edit-post-visual-editor, .block-editor-iframe__body'
			)
		),
	].filter( Boolean );
	const playgroundTargets = [
		editorDocument.documentElement,
		editorDocument.body,
		...Array.from(
			editorDocument.querySelectorAll(
				'.interface-interface-skeleton__content, .edit-post-layout__content, .editor-visual-editor, .block-editor-iframe__html'
			)
		),
	].filter( Boolean );

	targets.forEach( ( target ) => {
		target.dataset.adaireResponsiveDevice = device;
		target.style.setProperty(
			'--adaire-responsive-preview-width',
			`${ previewWidth }px`
		);
		target.style.setProperty(
			'--adaire-responsive-preview-height',
			`${ previewHeight }px`
		);
		target.style.setProperty(
			'--adaire-responsive-preview-zoom',
			previewZoom
		);
	} );

	playgroundTargets.forEach( ( target ) => {
		target.dataset.adaireResponsiveDevice = device;
		target.style.setProperty(
			'--adaire-responsive-preview-width',
			`${ previewWidth }px`
		);
		target.style.setProperty(
			'--adaire-responsive-preview-height',
			`${ previewHeight }px`
		);
		target.style.setProperty(
			'--adaire-responsive-preview-zoom',
			previewZoom
		);
	} );
};

const applyDeviceToEditorIframes = ( device, viewport ) => {
	const deviceConfig = getDeviceConfig( device );
	const previewWidth = Number( viewport?.width ) || deviceConfig.width;
	const previewHeight = Number( viewport?.height ) || deviceConfig.height;
	const previewZoom = ( Number( viewport?.zoom ) || 100 ) / 100;

	getEditorIframes().forEach( ( iframe ) => {
		iframe.dataset.adaireResponsiveDevice = device;
		iframe.style.width = `${ previewWidth }px`;
		iframe.style.minHeight = `${ previewHeight }px`;
		iframe.style.maxWidth = '100%';
		iframe.style.marginRight = 'auto';
		iframe.style.marginLeft = 'auto';
		iframe.style.display = 'block';
		iframe.style.transform = `scale(${ previewZoom })`;
		iframe.style.transformOrigin = 'top center';
		iframe.style.transition = 'width 160ms ease';
	} );
};

const applyDeviceToEditor = ( device, viewport ) => {
	applyDeviceToEditorIframes( device, viewport );
	getEditorDocuments().forEach( ( editorDocument ) =>
		applyDeviceToEditorDocument( editorDocument, device, viewport )
	);
};

const isResponsiveBlock = ( name ) =>
	RESPONSIVE_BLOCK_PREFIXES.some( ( prefix ) => name?.startsWith( prefix ) );

const normalizeResponsive = ( responsive = {} ) =>
	DEVICE_KEYS.reduce(
		( settings, device ) => ( {
			...settings,
			[ device ]: {
				visible: true,
				...( responsive?.[ device ] || {} ),
			},
		} ),
		{}
	);

const getDeviceSettings = ( responsive, device ) =>
	normalizeResponsive( responsive )[ device ] || {};

const toCssProperty = ( property ) =>
	property.replace( /[A-Z]/g, ( match ) => `-${ match.toLowerCase() }` );

const getResponsiveStyle = ( responsive, device ) => {
	const settings = getDeviceSettings( responsive, device );

	return RESPONSIVE_STYLE_FIELDS.reduce( ( style, [ property ] ) => {
		if (
			property !== 'display' &&
			settings[ property ] !== undefined &&
			settings[ property ] !== ''
		) {
			style[ property ] = settings[ property ];
		}

		if ( property === 'display' && settings[ property ] ) {
			style.display = settings[ property ];
		}

		return style;
	}, {} );
};

const getResponsiveCssVariables = ( responsive ) => {
	const normalized = normalizeResponsive( responsive );
	const cssVars = {};

	DEVICE_KEYS.forEach( ( device ) => {
		RESPONSIVE_STYLE_FIELDS.forEach( ( [ property ] ) => {
			const value = normalized[ device ]?.[ property ];
			if ( value !== undefined && value !== '' ) {
				cssVars[
					`--adaire-${ device }-${ toCssProperty( property ) }`
				] = value;
			}
		} );
	} );

	return cssVars;
};

const ResponsiveDeviceButtons = ( { activeDevice, onChange } ) => (
	<ButtonGroup className="adaire-responsive-toolbar__buttons">
		{ DEVICES.map( ( { key, label, icon } ) => (
			<Button
				key={ key }
				icon={ typeof icon === 'string' ? undefined : icon }
				isPrimary={ activeDevice === key }
				isSecondary={ activeDevice !== key }
				onClick={ () => onChange( key ) }
				className="adaire-responsive-toolbar__button"
				aria-label={ `Switch to ${ label } preview` }
			>
				{ typeof icon === 'string' && (
					<span className="adaire-responsive-toolbar__emoji">
						{ icon }
					</span>
				) }
				<span className="adaire-responsive-toolbar__label">
					{ label }
				</span>
			</Button>
		) ) }
	</ButtonGroup>
);

const addResponsiveAttribute = ( settings, name ) => {
	if ( ! isResponsiveBlock( name ) ) {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...( settings.attributes || {} ),
			responsive: {
				type: 'object',
				default: DEFAULT_RESPONSIVE,
			},
		},
	};
};

addFilter(
	'blocks.registerBlockType',
	'adaire/responsive-attribute',
	addResponsiveAttribute
);

const withResponsiveInspector = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! isResponsiveBlock( props.name ) ) {
			return <BlockEdit { ...props } />;
		}

		const [ activeDevice, setActiveDeviceState ] = useState(
			getActiveDevice()
		);
		const responsive = normalizeResponsive( props.attributes.responsive );
		const currentSettings = getDeviceSettings( responsive, activeDevice );

		useEffect( () => {
			const handleDeviceChange = ( event ) =>
				setActiveDeviceState( event.detail.device );
			window.addEventListener(
				'adaire-responsive-device-change',
				handleDeviceChange
			);
			return () =>
				window.removeEventListener(
					'adaire-responsive-device-change',
					handleDeviceChange
				);
		}, [] );

		const updateActiveDevice = ( device ) => {
			setActiveDeviceState( device );
			setActiveDevice( device );
		};

		const updateDeviceSetting = ( property, value ) => {
			props.setAttributes( {
				responsive: {
					...responsive,
					[ activeDevice ]: {
						...currentSettings,
						[ property ]: value,
					},
				},
			} );
		};

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody title="Responsive View" initialOpen={ false }>
						<div className="adaire-responsive-indicator">
							<span>Editing:</span>
							<strong>
								{ DEVICES.find(
									( { key } ) => key === activeDevice
								)?.label || 'Desktop' }{ ' ' }
								â–¼
							</strong>
						</div>
						<ResponsiveDeviceButtons
							activeDevice={ activeDevice }
							onChange={ updateActiveDevice }
						/>
					</PanelBody>
					<PanelBody
						title="Responsive Visibility"
						initialOpen={ false }
					>
						{ DEVICES.map( ( { key, label } ) => (
							<ToggleControl
								key={ key }
								label={ `Show on ${ label }` }
								checked={ responsive[ key ]?.visible !== false }
								onChange={ ( visible ) =>
									props.setAttributes( {
										responsive: {
											...responsive,
											[ key ]: {
												...( responsive[ key ] || {} ),
												visible,
											},
										},
									} )
								}
							/>
						) ) }
					</PanelBody>
					<PanelBody
						title="Responsive Properties"
						initialOpen={ false }
					>
						<SelectControl
							label="Editing Device"
							value={ activeDevice }
							options={ DEVICES.map( ( { key, label } ) => ( {
								value: key,
								label,
							} ) ) }
							onChange={ updateActiveDevice }
						/>
						{ RESPONSIVE_STYLE_FIELDS.map(
							( [ property, label ] ) => (
								<TextControl
									key={ property }
									label={ label }
									value={ currentSettings[ property ] || '' }
									onChange={ ( value ) =>
										updateDeviceSetting( property, value )
									}
									placeholder="Use any valid CSS value"
								/>
							)
						) }
					</PanelBody>
				</InspectorControls>
			</>
		);
	},
	'withResponsiveInspector'
);

addFilter(
	'editor.BlockEdit',
	'adaire/responsive-inspector',
	withResponsiveInspector
);

const withResponsiveEditorProps = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		if ( ! isResponsiveBlock( props.name ) ) {
			return <BlockListBlock { ...props } />;
		}

		const [ activeDevice, setActiveDeviceState ] = useState(
			getActiveDevice()
		);
		const responsive = normalizeResponsive( props.attributes.responsive );
		const deviceSettings = getDeviceSettings( responsive, activeDevice );
		const hidden = deviceSettings.visible === false;

		useEffect( () => {
			const handleDeviceChange = ( event ) =>
				setActiveDeviceState( event.detail.device );
			window.addEventListener(
				'adaire-responsive-device-change',
				handleDeviceChange
			);
			return () =>
				window.removeEventListener(
					'adaire-responsive-device-change',
					handleDeviceChange
				);
		}, [] );

		return (
			<BlockListBlock
				{ ...props }
				className={ `${
					props.className || ''
				} adaire-responsive-block ${
					hidden ? 'adaire-responsive-block--hidden' : ''
				}` }
				wrapperProps={ {
					...( props.wrapperProps || {} ),
					'data-adaire-responsive-device': activeDevice,
					style: {
						...( props.wrapperProps?.style || {} ),
						...getResponsiveStyle( responsive, activeDevice ),
					},
				} }
			/>
		);
	},
	'withResponsiveEditorProps'
);

addFilter(
	'editor.BlockListBlock',
	'adaire/responsive-editor-props',
	withResponsiveEditorProps
);

const addResponsiveSaveProps = ( extraProps, blockType, attributes ) => {
	if ( ! isResponsiveBlock( blockType.name ) ) {
		return extraProps;
	}

	const responsive = normalizeResponsive( attributes.responsive );
	const hiddenDevices = DEVICE_KEYS.filter(
		( device ) => responsive[ device ]?.visible === false
	);

	return {
		...extraProps,
		className: `${
			extraProps.className || ''
		} adaire-responsive-front ${ hiddenDevices
			.map( ( device ) => `adaire-hide-${ device }` )
			.join( ' ' ) }`.trim(),
		style: {
			...( extraProps.style || {} ),
			...getResponsiveCssVariables( responsive ),
		},
		'data-adaire-responsive': JSON.stringify( responsive ),
	};
};

addFilter(
	'blocks.getSaveContent.extraProps',
	'adaire/responsive-save-props',
	addResponsiveSaveProps
);

function ResponsivePreviewPlugin() {
	const [ activeDevice, setActiveDeviceState ] = useState(
		getActiveDevice()
	);
	const [ toolbarTarget, setToolbarTarget ] = useState( null );
	const [ viewport, setViewportState ] = useState( () =>
		getStoredViewport( getActiveDevice() )
	);
	const device = useMemo(
		() =>
			DEVICES.find( ( { key } ) => key === activeDevice ) || DEVICES[ 0 ],
		[ activeDevice ]
	);
	const { savePost } = useDispatch( 'core/editor' );
	const isEditedPostDirty = useSelect(
		( select ) => select( 'core/editor' )?.isEditedPostDirty?.(),
		[]
	);

	useEffect( () => {
		const interval = window.setInterval( () => {
			const target = document.querySelector(
				'.edit-post-header-toolbar, .editor-header__toolbar, .interface-interface-skeleton__header'
			);
			if ( target ) {
				setToolbarTarget( target );
				window.clearInterval( interval );
			}
		}, 250 );

		return () => window.clearInterval( interval );
	}, [] );

	useEffect( () => {
		applyDeviceToEditor( activeDevice, viewport );
	}, [ activeDevice, viewport, device.width ] );

	useEffect( () => {
		const interval = window.setInterval(
			() => applyDeviceToEditor( activeDevice, viewport ),
			500
		);

		return () => window.clearInterval( interval );
	}, [ activeDevice, viewport ] );

	useEffect( () => {
		if ( isEditedPostDirty ) {
			const timeout = window.setTimeout( () => savePost(), 900 );
			return () => window.clearTimeout( timeout );
		}
	}, [ isEditedPostDirty, savePost ] );

	const updateActiveDevice = ( nextDevice ) => {
		const nextDeviceConfig = getDeviceConfig( nextDevice );
		const nextViewport = {
			width: nextDeviceConfig.width,
			height: nextDeviceConfig.height,
			zoom: viewport.zoom,
		};

		setActiveDeviceState( nextDevice );
		setActiveDevice( nextDevice );
		setViewportState( nextViewport );
		setStoredViewport( nextViewport );
	};

	const updateViewport = ( nextViewport ) => {
		const normalizedViewport = {
			width: Math.max( 240, Number( nextViewport.width ) || device.width ),
			height: Math.max( 240, Number( nextViewport.height ) || device.height ),
			zoom: Number( nextViewport.zoom ) || 100,
		};

		setViewportState( normalizedViewport );
		setStoredViewport( normalizedViewport );
	};

	const rotateViewport = () => {
		updateViewport( {
			...viewport,
			width: viewport.height,
			height: viewport.width,
		} );
	};

	const toolbar = (
		<div
			className="adaire-responsive-toolbar"
			aria-label="Adaire responsive preview toolbar"
		>
			<div className="adaire-responsive-toolbar__viewport">
				<select
					className="adaire-responsive-toolbar__select"
					value={ activeDevice }
					onChange={ ( event ) => updateActiveDevice( event.target.value ) }
					aria-label="Responsive preview device"
				>
					{ DEVICES.map( ( { key, label } ) => (
						<option key={ key } value={ key }>
							{ label }
						</option>
					) ) }
				</select>
				<input
					className="adaire-responsive-toolbar__dimension"
					type="number"
					min="240"
					value={ viewport.width }
					onChange={ ( event ) =>
						updateViewport( {
							...viewport,
							width: event.target.value,
						} )
					}
					aria-label="Preview width"
				/>
				<span className="adaire-responsive-toolbar__separator">Ã—</span>
				<input
					className="adaire-responsive-toolbar__dimension"
					type="number"
					min="240"
					value={ viewport.height }
					onChange={ ( event ) =>
						updateViewport( {
							...viewport,
							height: event.target.value,
						} )
					}
					aria-label="Preview height"
				/>
				<select
					className="adaire-responsive-toolbar__select adaire-responsive-toolbar__zoom"
					value={ viewport.zoom }
					onChange={ ( event ) =>
						updateViewport( {
							...viewport,
							zoom: event.target.value,
						} )
					}
					aria-label="Preview zoom"
				>
					{ ZOOM_OPTIONS.map( ( zoom ) => (
						<option key={ zoom } value={ zoom }>
							{ zoom }%
						</option>
					) ) }
				</select>
				<Button
					isSecondary
					className="adaire-responsive-toolbar__rotate"
					onClick={ rotateViewport }
					aria-label="Rotate responsive preview"
				>
					â†»
				</Button>
			</div>
			<ResponsiveDeviceButtons
				activeDevice={ activeDevice }
				onChange={ updateActiveDevice }
			/>
		</div>
	);

	return toolbarTarget ? createPortal( toolbar, toolbarTarget ) : toolbar;
}

registerPlugin( 'adaire-responsive-preview', {
	render: ResponsivePreviewPlugin,
} );



