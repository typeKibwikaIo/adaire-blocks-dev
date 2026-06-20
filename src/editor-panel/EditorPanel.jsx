/**
 * GutenBlocks Editor Panel — Blockstudio-style sidebar
 * Two tabs: General | Advanced
 * Auto-groups attributes into sections by camelCase prefix detection.
 * Advanced tab always shows Margin / Padding / Z-Index / CSS ID / CSS Classes.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from '@wordpress/element';
import { useSelect, useDispatch }    from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { getBlockType }              from '@wordpress/blocks';
import { Button, Tooltip }           from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import AdaireColorControl from '../components/AdaireColorControl';

// ─── Section auto-grouping ───────────────────────────────────────────────────
// Ordered list of known section patterns checked first.
// Falls back to camelCase prefix detection for everything else.

const KNOWN_GROUPS = [
	{ label: 'Top Bar',    test: n => /^(show)?[Tt]op[Bb]ar/.test( n ) || n.startsWith( 'topBar' ) || n === 'showTopBar' },
	{ label: 'Logo',       test: n => n.startsWith( 'logo' ) || n.startsWith( 'tagline' ) || n === 'showTagline' || n === 'linkLogoHome' },
	{ label: 'Navigation', test: n => n.startsWith( 'nav' ) || n.startsWith( 'mobileMenu' ) || n.startsWith( 'hamburger' ) || n === 'showNav' },
	{ label: 'CTA',        test: n => n.startsWith( 'cta' ) || n === 'showCta' },
	{ label: 'Sign In',    test: n => n.startsWith( 'signIn' ) || n === 'showSignIn' },
	{ label: 'Sign Up',    test: n => n.startsWith( 'signUp' ) || n === 'showSignUp' },
	{ label: 'Search',     test: n => n.startsWith( 'search' ) || n === 'showSearch' },
	{ label: 'Social',     test: n => n.startsWith( 'social' ) || n === 'showSocial' },
	{ label: 'Pricing',    test: n => n.startsWith( 'pricing' ) || n.startsWith( 'plan' ) || n.startsWith( 'tier' ) },
	{ label: 'Card',       test: n => n.startsWith( 'card' ) || n === 'showCard' },
	{ label: 'Media',      test: n => n.startsWith( 'video' ) || n.startsWith( 'image' ) || n.startsWith( 'media' ) || n.startsWith( 'poster' ) },
	{ label: 'Form',       test: n => n.startsWith( 'form' ) || n.startsWith( 'field' ) || n.startsWith( 'submit' ) || n.startsWith( 'placeholder' ) },
	{ label: 'Animation',  test: n => n.startsWith( 'anim' ) || n.startsWith( 'scroll' ) || n.startsWith( 'transition' ) || n.startsWith( 'hover' ) },
	{ label: 'Colors',     test: n => /[Cc]olor/.test( n ) || /[Bb]ackground/.test( n ) || n.startsWith( 'bg' ) || /[Gg]radient/.test( n ) || n === 'transparentHeader' },
	{ label: 'Typography', test: n => /[Ff]ont/.test( n ) || n === 'letterSpacing' || n === 'textTransform' || n === 'lineHeight' || n.startsWith( 'text' ) },
	{ label: 'Border',     test: n => /[Bb]order/.test( n ) || /[Rr]adius/.test( n ) || /[Ss]hadow/.test( n ) },
	{ label: 'Spacing',    test: n => /[Pp]adding/.test( n ) || /[Mm]argin/.test( n ) || n.startsWith( 'gap' ) },
	{ label: 'Layout',     test: n => [ 'layout', 'sticky', 'maxWidth', 'maxWidthMode', 'zIndex', 'position',
	                                    'display', 'overflow', 'width', 'height', 'size', 'align',
	                                    'columns', 'rows', 'grid', 'flex' ].some( k => n.toLowerCase().includes( k.toLowerCase() ) ) },
];

// Attrs always managed in the Advanced tab built-ins — skip from General
const BUILTIN_ADVANCED = new Set( [ 'anchor', 'className', 'gutenblocksMargin', 'gutenblocksPadding', 'gutenblocksZIndex' ] );

function autoGroupAttrs( schema ) {
	const entries = Object.entries( schema ).filter( ( [ name, s ] ) =>
		s.type !== 'array' && ! BUILTIN_ADVANCED.has( name )
	);

	// Try each known group in order
	const groups   = [];
	const assigned = new Set();

	KNOWN_GROUPS.forEach( ( { label, test } ) => {
		const matched = entries.filter( ( [ name ] ) => ! assigned.has( name ) && test( name ) );
		if ( matched.length > 0 ) {
			matched.forEach( ( [ name ] ) => assigned.add( name ) );
			groups.push( { label, attrs: matched } );
		}
	} );

	// Anything left → auto-group by camelCase prefix
	const remaining = entries.filter( ( [ name ] ) => ! assigned.has( name ) );
	const prefixMap  = new Map();

	remaining.forEach( entry => {
		const prefix = camelPrefix( entry[ 0 ] );
		if ( ! prefixMap.has( prefix ) ) prefixMap.set( prefix, [] );
		prefixMap.get( prefix ).push( entry );
	} );

	prefixMap.forEach( ( attrs, prefix ) => {
		if ( attrs.length >= 2 ) {
			groups.push( { label: formatLabel( prefix ), attrs } );
		} else {
			// Merge singletons into a catch-all "General" at the front
			let general = groups.find( g => g.label === 'General' );
			if ( ! general ) {
				general = { label: 'General', attrs: [] };
				groups.unshift( general );
			}
			general.attrs.push( ...attrs );
		}
	} );

	return groups;
}

function camelPrefix( name ) {
	// Strip leading boolean verbs so "showTopBar" groups with "topBarLeft"
	const stripped = name.replace( /^(show|hide|enable|disable|use|has|is)([A-Z])/, ( _, _p, c ) => c.toLowerCase() );
	const words    = stripped.replace( /([A-Z])/g, ' $1' ).trim().split( /\s+/ );
	return ( words[ 0 ].length < 4 && words[ 1 ] )
		? ( words[ 0 ] + words[ 1 ] ).toLowerCase()
		: words[ 0 ].toLowerCase();
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatLabel( name ) {
	return name
		.replace( /([A-Z])/g, ' $1' )
		.replace( /^./, s => s.toUpperCase() )
		.replace( /_/g, ' ' )
		.trim();
}

function getControlType( schema, name ) {
	const lower = name.toLowerCase();
	if ( ! schema ) return 'text';
	if ( schema.type === 'boolean' )                                                        return 'toggle';
	if ( lower.includes( 'color' ) || lower.includes( 'background' ) || lower.includes( 'bg' ) ) return 'color';
	if ( lower.includes( 'imageurl' ) || lower.includes( 'image_url' ) || lower.includes( 'logoimage' ) ) return 'image';
	if ( lower.includes( 'url' ) || lower.includes( 'link' ) || lower.includes( 'href' ) ) return 'url';
	if ( schema.type === 'number' )                                                         return 'range';
	if ( schema.enum )                                                                      return 'select';
	if ( schema.type === 'array' || schema.type === 'object' )                              return null;
	return 'text';
}

function BlockIcon( { icon } ) {
	if ( ! icon ) return <span className="adaire-ep__block-icon-fallback">◻</span>;
	if ( typeof icon === 'string' ) {
		return <span className={ `dashicons dashicons-${ icon }` } style={ { fontSize: 18, width: 18, height: 18, lineHeight: '18px' } } />;
	}
	if ( icon.src ) {
		const Src = icon.src;
		if ( typeof Src === 'function' ) return <span className="adaire-ep__block-icon-wp"><Src /></span>;
		return <span className="adaire-ep__block-icon-wp">{ Src }</span>;
	}
	return <span className="adaire-ep__block-icon-fallback">◻</span>;
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function Accordion( { title, children, defaultOpen = false } ) {
	const [ open, setOpen ] = useState( defaultOpen );
	return (
		<div className={ `adaire-ep__acc ${ open ? 'is-open' : '' }` }>
			<button className="adaire-ep__acc-hd" onClick={ () => setOpen( o => ! o ) } type="button">
				<span className="adaire-ep__acc-title">{ title }</span>
				<svg className="adaire-ep__acc-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
					{ open ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" /> }
				</svg>
			</button>
			{ open && <div className="adaire-ep__acc-body">{ children }</div> }
		</div>
	);
}

// ─── Controls ─────────────────────────────────────────────────────────────────

/** LABEL style: uppercase, small, gray — above the control */
function CtrlLabel( { label } ) {
	return <div className="adaire-ep__ctrl-label">{ label.toUpperCase() }</div>;
}

/** Toggle: pill LEFT, label text RIGHT */
function ToggleCtrl( { label, value, onChange } ) {
	return (
		<div className="adaire-ep__toggle-row">
			<div
				className={ `adaire-ep__toggle ${ value ? 'is-on' : '' }` }
				onClick={ () => onChange( ! value ) }
				role="switch"
				aria-checked={ !! value }
				tabIndex={ 0 }
				onKeyDown={ e => e.key === 'Enter' && onChange( ! value ) }
			>
				<span className="adaire-ep__toggle-knob" />
			</div>
			<span className="adaire-ep__toggle-text">{ label }</span>
		</div>
	);
}

/** Select dropdown: label above, full-width select below */
function SelectCtrl( { label, value, schema, onChange } ) {
	const options = ( schema.enum || [] );
	return (
		<div className="adaire-ep__ctrl-block">
			<CtrlLabel label={ label } />
			<select
				value={ value ?? '' }
				onChange={ e => onChange( e.target.value ) }
				className="adaire-ep__select"
			>
				{ options.map( o => <option key={ o } value={ o }>{ formatLabel( o ) }</option> ) }
			</select>
		</div>
	);
}

/** Range: label above, slider left + editable number input right */
function RangeCtrl( { label, value, schema, onChange } ) {
	const min  = schema?.minimum ?? 0;
	const max  = schema?.maximum ?? 200;
	const unit = schema?.unit ?? '';
	const displayLabel = unit ? `${ label } (${ unit.toUpperCase() })` : label;

	return (
		<div className="adaire-ep__ctrl-block">
			<CtrlLabel label={ displayLabel } />
			<div className="adaire-ep__range-row">
				<input
					type="range"
					min={ min }
					max={ max }
					value={ value ?? 0 }
					onChange={ e => onChange( Number( e.target.value ) ) }
					className="adaire-ep__range-slider"
				/>
				<input
					type="number"
					min={ min }
					max={ max }
					value={ value ?? 0 }
					onChange={ e => onChange( Number( e.target.value ) ) }
					className="adaire-ep__range-num"
				/>
			</div>
		</div>
	);
}

/** Color: delegates to the shared modern AdaireColorControl */
function ColorCtrl( { label, value, onChange } ) {
	return <AdaireColorControl label={ label } value={ value } onChange={ onChange } />;
}

/** Text / URL / generic input */
function TextCtrl( { label, value, schema, name, onChange } ) {
	const lower   = name.toLowerCase();
	const isUrl   = lower.includes( 'url' ) || lower.includes( 'link' ) || lower.includes( 'href' );
	return (
		<div className="adaire-ep__ctrl-block">
			<CtrlLabel label={ label } />
			<input
				type={ isUrl ? 'url' : 'text' }
				value={ value ?? '' }
				onChange={ e => onChange( e.target.value ) }
				className="adaire-ep__text-input"
				placeholder={ isUrl ? 'https://' : '' }
			/>
		</div>
	);
}

/** Image upload */
function ImageCtrl( { label, value, onChange } ) {
	return (
		<div className="adaire-ep__ctrl-block">
			<CtrlLabel label={ label } />
			<MediaUploadCheck>
				<MediaUpload
					onSelect={ media => onChange( media.url ) }
					allowedTypes={ [ 'image' ] }
					render={ ( { open } ) => (
						<div className="adaire-ep__image-ctrl">
							{ value
								? <img src={ value } alt="" className="adaire-ep__image-thumb" />
								: null
							}
							<Button variant="secondary" onClick={ open } className="adaire-ep__image-btn">
								{ value ? __( 'Replace' ) : __( 'Upload Image' ) }
							</Button>
						</div>
					) }
				/>
			</MediaUploadCheck>
		</div>
	);
}

/** Dispatches to the right control based on type */
function AnyCtrl( { name, schema, value, onChange } ) {
	const type  = getControlType( schema, name );
	const label = formatLabel( name );

	if ( type === null )      return null;
	if ( type === 'toggle' )  return <ToggleCtrl  label={ label } value={ value } onChange={ onChange } />;
	if ( type === 'color' )   return <ColorCtrl   label={ label } value={ value } onChange={ onChange } />;
	if ( type === 'range' )   return <RangeCtrl   label={ label } value={ value } schema={ schema } onChange={ onChange } />;
	if ( type === 'select' )  return <SelectCtrl  label={ label } value={ value } schema={ schema } onChange={ onChange } />;
	if ( type === 'image' )   return <ImageCtrl   label={ label } value={ value } onChange={ onChange } />;
	return <TextCtrl label={ label } value={ value } schema={ schema } name={ name } onChange={ onChange } />;
}

// ─── Spacing control (Advanced tab) ──────────────────────────────────────────
// unit is a select dropdown ("px ▼"), 4-direction inputs, link toggle

const UNIT_OPTIONS = [ 'px', 'em', '%', 'rem' ];

function SpacingCtrl( { label, value = {}, onChange } ) {
	const unit   = value.unit   ?? 'px';
	const linked = value.linked ?? true;
	const update = patch => onChange( { top: '', right: '', bottom: '', left: '', unit: 'px', linked: true, ...value, ...patch } );
	const setDir = ( dir, v ) => linked
		? update( { top: v, right: v, bottom: v, left: v } )
		: update( { [ dir ]: v } );

	return (
		<div className="adaire-ep__spacing">
			<div className="adaire-ep__spacing-hd">
				<span className="adaire-ep__spacing-label">{ label }</span>
				<div className="adaire-ep__spacing-hd-right">
					{ /* responsive monitor icon */ }
					<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="adaire-ep__resp-icon" title="Desktop">
						<path d="M21 2H3a1 1 0 00-1 1v13a1 1 0 001 1h8v2H8v2h8v-2h-3v-2h8a1 1 0 001-1V3a1 1 0 00-1-1zm-1 13H4V4h16v11z"/>
					</svg>
					<select
						value={ unit }
						onChange={ e => update( { unit: e.target.value } ) }
						className="adaire-ep__unit-select"
					>
						{ UNIT_OPTIONS.map( u => <option key={ u } value={ u }>{ u }</option> ) }
					</select>
				</div>
			</div>
			<div className="adaire-ep__spacing-dirs">
				{ [ 'top', 'right', 'bottom', 'left' ].map( dir => (
					<div key={ dir } className="adaire-ep__spacing-cell">
						<input
							type="number"
							value={ value[ dir ] ?? '' }
							onChange={ e => setDir( dir, e.target.value ) }
							className="adaire-ep__spacing-input"
							placeholder="—"
						/>
						<span className="adaire-ep__spacing-lbl">{ dir.charAt(0).toUpperCase() + dir.slice(1) }</span>
					</div>
				) ) }
				<button
					type="button"
					className={ `adaire-ep__link-btn ${ linked ? 'is-linked' : '' }` }
					onClick={ () => update( { linked: ! linked } ) }
					title={ linked ? __( 'Unlink sides' ) : __( 'Link all sides' ) }
				>
					{ linked
						? <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
						: <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 7H7a5 5 0 000 10h2M15 7h2a5 5 0 010 10h-2M9 12h6"/></svg>
					}
				</button>
			</div>
		</div>
	);
}

// ─── Advanced tab built-ins ───────────────────────────────────────────────────

function AdvancedBuiltins( { attrs, setAttr, blockType } ) {
	const schema    = blockType?.attributes ?? {};
	const hasMargin  = 'gutenblocksMargin'  in schema;
	const hasPadding = 'gutenblocksPadding' in schema;
	const hasZIndex  = 'gutenblocksZIndex'  in schema || 'zIndex' in schema;
	const zKey       = 'gutenblocksZIndex'  in schema ? 'gutenblocksZIndex' : ( 'zIndex' in schema ? 'zIndex' : null );
	const hasAnchor  = 'anchor'        in schema;
	const hasClass   = 'className'     in schema;

	const parseSpacing = raw => {
		if ( ! raw ) return {};
		if ( typeof raw === 'object' ) return raw;
		try { return JSON.parse( raw ); } catch { return {}; }
	};

	return (
		<>
			<div className="adaire-ep__adv-label">{ __( 'ADVANCED STYLES' ) }</div>

			<Accordion title={ __( 'Layout' ) } defaultOpen>

				{ /* Margin */ }
				{ hasMargin ? (
					<SpacingCtrl
						label={ __( 'Margin' ) }
						value={ parseSpacing( attrs.gutenblocksMargin ) }
						onChange={ v => setAttr( 'gutenblocksMargin', JSON.stringify( v ) ) }
					/>
				) : (
					<div className="adaire-ep__spacing">
						<SpacingCtrl
							label={ __( 'Margin' ) }
							value={ {} }
							onChange={ () => {} }
						/>
						<p className="adaire-ep__hint-sm">{ __( 'Register gutenblocksMargin attribute to enable' ) }</p>
					</div>
				) }

				<div className="adaire-ep__spacing-gap" />

				{ /* Padding */ }
				{ hasPadding ? (
					<SpacingCtrl
						label={ __( 'Padding' ) }
						value={ parseSpacing( attrs.gutenblocksPadding ) }
						onChange={ v => setAttr( 'gutenblocksPadding', JSON.stringify( v ) ) }
					/>
				) : (
					<div className="adaire-ep__spacing">
						<SpacingCtrl
							label={ __( 'Padding' ) }
							value={ {} }
							onChange={ () => {} }
						/>
						<p className="adaire-ep__hint-sm">{ __( 'Register gutenblocksPadding attribute to enable' ) }</p>
					</div>
				) }

				<div className="adaire-ep__spacing-gap" />

				{ /* Z-Index */ }
				<div className="adaire-ep__adv-row">
					<span className="adaire-ep__adv-row-label">
						{ __( 'Z-Index' ) }
						<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style={ { marginLeft: 5, opacity: 0.5 } }>
							<path d="M21 2H3a1 1 0 00-1 1v13a1 1 0 001 1h8v2H8v2h8v-2h-3v-2h8a1 1 0 001-1V3a1 1 0 00-1-1zm-1 13H4V4h16v11z"/>
						</svg>
					</span>
					<input
						type="number"
						value={ zKey ? ( attrs[ zKey ] ?? '' ) : '' }
						onChange={ e => zKey && setAttr( zKey, e.target.value === '' ? undefined : Number( e.target.value ) ) }
						disabled={ ! hasZIndex }
						className="adaire-ep__adv-input"
						placeholder={ hasZIndex ? '' : __( 'n/a' ) }
					/>
				</div>

				{ /* CSS ID */ }
				<div className="adaire-ep__adv-row">
					<span className="adaire-ep__adv-row-label">{ __( 'CSS ID' ) }</span>
					<input
						type="text"
						value={ hasAnchor ? ( attrs.anchor ?? '' ) : '' }
						onChange={ e => hasAnchor && setAttr( 'anchor', e.target.value ) }
						disabled={ ! hasAnchor }
						className="adaire-ep__adv-input"
						placeholder={ hasAnchor ? '' : __( 'n/a' ) }
					/>
				</div>

				{ /* CSS Classes */ }
				<div className="adaire-ep__adv-row">
					<span className="adaire-ep__adv-row-label">{ __( 'CSS Classes' ) }</span>
					<input
						type="text"
						value={ hasClass ? ( attrs.className ?? '' ) : '' }
						onChange={ e => hasClass && setAttr( 'className', e.target.value ) }
						disabled={ ! hasClass }
						className="adaire-ep__adv-input"
						placeholder={ hasClass ? '' : __( 'n/a' ) }
					/>
				</div>

			</Accordion>
		</>
	);
}

// ─── Navigator ────────────────────────────────────────────────────────────────

function NavigatorPanel( { onClose } ) {
	const { blocks, selectedClientId } = useSelect( select => ( {
		blocks:           select( blockEditorStore ).getBlocks(),
		selectedClientId: select( blockEditorStore ).getSelectedBlockClientId(),
	} ), [] );
	const { selectBlock } = useDispatch( blockEditorStore );

	function renderBlock( block, depth = 0 ) {
		const type  = getBlockType( block.name );
		const title = type?.title ?? block.name;
		return (
			<div key={ block.clientId }>
				<button
					className={ `adaire-ep__nav-item ${ block.clientId === selectedClientId ? 'is-selected' : '' }` }
					style={ { paddingLeft: 12 + depth * 14 } }
					onClick={ () => { selectBlock( block.clientId ); onClose(); } }
					type="button"
				>
					<BlockIcon icon={ type?.icon } />
					<span className="adaire-ep__nav-item-label">{ title }</span>
				</button>
				{ block.innerBlocks?.map( c => renderBlock( c, depth + 1 ) ) }
			</div>
		);
	}

	return (
		<div className="adaire-ep__navigator">
			<div className="adaire-ep__navigator-header">
				<span>{ __( 'Navigator' ) }</span>
				<button className="adaire-ep__icon-btn" onClick={ onClose } type="button">
					<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
					</svg>
				</button>
			</div>
			<div className="adaire-ep__navigator-body">
				{ blocks.length === 0
					? <p className="adaire-ep__nav-empty">{ __( 'No blocks on this page.' ) }</p>
					: blocks.map( b => renderBlock( b ) )
				}
			</div>
		</div>
	);
}

// ─── General tab ─────────────────────────────────────────────────────────────

function GeneralTab( { attrs, setAttr, blockName } ) {
	const blockType = getBlockType( blockName );
	const schema    = blockType?.attributes ?? {};
	const groups    = useMemo( () => autoGroupAttrs( schema ), [ schema ] );

	if ( groups.length === 0 ) {
		return (
			<div className="adaire-ep__empty-tab">
				<p>{ __( 'Select a block to edit its settings.' ) }</p>
			</div>
		);
	}

	return (
		<div className="adaire-ep__tab-body">
			{ groups.map( ( group, gi ) => (
				<Accordion key={ gi } title={ group.label } defaultOpen={ gi === 0 }>
					{ group.attrs.map( ( [ name, s ] ) => (
						<AnyCtrl
							key={ name }
							name={ name }
							schema={ s }
							value={ attrs[ name ] }
							onChange={ v => setAttr( name, v ) }
						/>
					) ) }
				</Accordion>
			) ) }
		</div>
	);
}

// ─── Advanced tab ─────────────────────────────────────────────────────────────

function AdvancedTab( { attrs, setAttr, blockName } ) {
	const blockType = getBlockType( blockName );
	return (
		<div className="adaire-ep__tab-body">
			<AdvancedBuiltins attrs={ attrs } setAttr={ setAttr } blockType={ blockType } />
		</div>
	);
}

// ─── Search results ────────────────────────────────────────────────────────────

function SearchResults( { query, attrs, setAttr, blockName } ) {
	const blockType = getBlockType( blockName );
	const schema    = blockType?.attributes ?? {};

	const matches = Object.entries( schema ).filter( ( [ name, s ] ) => {
		if ( s.type === 'array' || s.type === 'object' ) return false;
		return formatLabel( name ).toLowerCase().includes( query.toLowerCase() );
	} );

	if ( matches.length === 0 ) {
		return <div className="adaire-ep__empty-tab"><p>{ __( 'No controls match your search.' ) }</p></div>;
	}

	return (
		<div className="adaire-ep__tab-body">
			<Accordion title={ `${ matches.length } ${ __( 'result(s)' ) }` } defaultOpen>
				{ matches.map( ( [ name, s ] ) => (
					<AnyCtrl key={ name } name={ name } schema={ s } value={ attrs[ name ] } onChange={ v => setAttr( name, v ) } />
				) ) }
			</Accordion>
		</div>
	);
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SidebarContent( { isCollapsed, onToggleCollapse } ) {
	const [ activeTab,     setActiveTab     ] = useState( 'general' );
	const [ showNavigator, setShowNavigator ] = useState( false );
	const [ searchQuery,   setSearchQuery   ] = useState( '' );
	const [ showSearch,    setShowSearch    ] = useState( false );
	const searchRef = useRef( null );

	const { selectedBlock, selectedClientId } = useSelect( select => ( {
		selectedBlock:    select( blockEditorStore ).getSelectedBlock(),
		selectedClientId: select( blockEditorStore ).getSelectedBlockClientId(),
	} ), [] );

	const { updateBlockAttributes } = useDispatch( blockEditorStore );

	const setAttr = useCallback( ( key, value ) => {
		if ( ! selectedClientId ) return;
		updateBlockAttributes( selectedClientId, { [ key ]: value } );
	}, [ selectedClientId, updateBlockAttributes ] );

	const blockType  = selectedBlock ? getBlockType( selectedBlock.name ) : null;
	const blockTitle = blockType?.title ?? __( 'Block Editor' );
	const blockDesc  = blockType?.description ?? '';
	const attrs      = selectedBlock?.attributes ?? {};

	useEffect( () => { if ( showSearch && searchRef.current ) searchRef.current.focus(); }, [ showSearch ] );
	useEffect( () => { setSearchQuery( '' ); setShowSearch( false ); setActiveTab( 'general' ); }, [ selectedClientId ] );

	const TABS = [
		{ key: 'general',  label: __( 'General'  ) },
		{ key: 'advanced', label: __( 'Advanced' ) },
	];

	return (
		<div className={ `adaire-ep ${ isCollapsed ? 'is-collapsed' : '' }` }>

			{ /* ── Header ─────────────────────────────────── */ }
			<div className="adaire-ep__header">
				<div className="adaire-ep__header-left">
					<Tooltip text={ __( 'Navigator' ) }>
						<button className={ `adaire-ep__icon-btn ${ showNavigator ? 'is-active' : '' }` }
							onClick={ () => setShowNavigator( n => ! n ) } type="button">
							<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
								<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
							</svg>
						</button>
					</Tooltip>
				</div>
				<div className="adaire-ep__header-center">
					<span className="adaire-ep__header-title">{ __( 'GutenBlocks' ) }</span>
				</div>
				<div className="adaire-ep__header-right">
					<Tooltip text={ __( 'Search settings' ) }>
						<button className={ `adaire-ep__icon-btn ${ showSearch ? 'is-active' : '' }` }
							onClick={ () => setShowSearch( s => ! s ) } type="button">
							<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
								<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
							</svg>
						</button>
					</Tooltip>
					<Tooltip text={ isCollapsed ? __( 'Expand' ) : __( 'Collapse' ) }>
						<button className="adaire-ep__icon-btn" onClick={ onToggleCollapse } type="button">
							{ isCollapsed
								? <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
								: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
							}
						</button>
					</Tooltip>
				</div>
			</div>

			{ ! isCollapsed && (
				<>
					{ /* ── Search bar ──────────────────────── */ }
					{ showSearch && (
						<div className="adaire-ep__search-bar">
							<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="adaire-ep__search-icon">
								<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
							</svg>
							<input ref={ searchRef } type="text" value={ searchQuery }
								onChange={ e => setSearchQuery( e.target.value ) }
								placeholder={ __( 'Search controls…' ) }
								className="adaire-ep__search-input"
							/>
							{ searchQuery && (
								<button className="adaire-ep__icon-btn" onClick={ () => setSearchQuery( '' ) } type="button">
									<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
										<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
									</svg>
								</button>
							) }
						</div>
					) }

					{ /* ── Navigator overlay ─────────────────── */ }
					{ showNavigator && <NavigatorPanel onClose={ () => setShowNavigator( false ) } /> }

					{ ! showNavigator && (
						<>
							{ ! selectedBlock && (
								<div className="adaire-ep__no-block">
									<svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor" style={ { opacity: 0.15 } }>
										<path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
									</svg>
									<p>{ __( 'Select a block to edit.' ) }</p>
								</div>
							) }

							{ selectedBlock && (
								<>
									{ /* ── Block info card ─────────────── */ }
									<div className="adaire-ep__block-card">
										<div className="adaire-ep__block-card-icon">
											<BlockIcon icon={ blockType?.icon } />
										</div>
										<div className="adaire-ep__block-card-info">
											<div className="adaire-ep__block-card-name">{ blockTitle }</div>
											{ blockDesc && <div className="adaire-ep__block-card-desc">{ blockDesc }</div> }
										</div>
									</div>

									{ /* ── Tabs ─────────────────────────── */ }
									<div className="adaire-ep__tabs">
										{ TABS.map( t => (
											<button
												key={ t.key }
												className={ `adaire-ep__tab ${ activeTab === t.key ? 'is-active' : '' }` }
												onClick={ () => setActiveTab( t.key ) }
												type="button"
											>{ t.label }</button>
										) ) }
									</div>

									{ /* ── Tab body ─────────────────────── */ }
									<div className="adaire-ep__body">
										{ searchQuery.trim() !== '' ? (
											<SearchResults query={ searchQuery } attrs={ attrs } setAttr={ setAttr } blockName={ selectedBlock.name } />
										) : activeTab === 'general' ? (
											<GeneralTab attrs={ attrs } setAttr={ setAttr } blockName={ selectedBlock.name } />
										) : (
											<AdvancedTab attrs={ attrs } setAttr={ setAttr } blockName={ selectedBlock.name } />
										) }
									</div>
								</>
							) }
						</>
					) }
				</>
			) }

			{ isCollapsed && (
				<div className="adaire-ep__collapsed-icons">
					<Tooltip text={ __( 'Expand' ) } position="right center">
						<button className="adaire-ep__icon-btn" onClick={ onToggleCollapse } type="button">
							<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
								<path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
							</svg>
						</button>
					</Tooltip>
					<Tooltip text={ __( 'Navigator' ) } position="right center">
						<button className="adaire-ep__icon-btn" onClick={ () => { onToggleCollapse(); setShowNavigator( true ); } } type="button">
							<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
								<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
							</svg>
						</button>
					</Tooltip>
				</div>
			) }
		</div>
	);
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function EditorPanel() {
	const [ isCollapsed, setIsCollapsed ] = useState( false );

	useEffect( () => {
		document.body.classList.add( 'adaire-ep-active' );
		return () => {
			document.body.classList.remove( 'adaire-ep-active' );
			document.body.classList.remove( 'adaire-ep-collapsed' );
		};
	}, [] );

	useEffect( () => {
		document.body.classList.toggle( 'adaire-ep-collapsed', isCollapsed );
	}, [ isCollapsed ] );

	return <SidebarContent isCollapsed={ isCollapsed } onToggleCollapse={ () => setIsCollapsed( c => ! c ) } />;
}
