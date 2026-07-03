import { InspectorControls, MediaUpload, MediaUploadCheck, useBlockProps } from '@wordpress/block-editor';
import { BaseControl, Button, ButtonGroup, PanelBody, RangeControl, SelectControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import AdaireColorControl from '../components/AdaireColorControl';
import BootstrapIconPicker from './BootstrapIconPicker';
import { getStyleVars, resolveRatingIcon, RatingBadgeView } from './shared';

const CONTAINER_MODES = [
	{ label: __( 'Full Width', 'rating-badge-block' ), value: 'full' },
	{ label: __( 'Constrained', 'rating-badge-block' ), value: 'constrained' },
];

const set = ( setAttributes, key ) => ( value ) => setAttributes( { [ key ]: value } );
const media = ( label, value, onChange, allowedTypes = [ 'image' ] ) => (
	<MediaUploadCheck>
		<MediaUpload
			allowedTypes={ allowedTypes }
			value={ value }
			onSelect={ ( m ) => onChange( m.url ) }
			render={ ( { open } ) => (
				<Button variant="secondary" onClick={ open }>
					{ value ? __( 'Change ', 'rating-badge-block' ) : __( 'Select ', 'rating-badge-block' ) }{ label }
				</Button>
			) }
		/>
	</MediaUploadCheck>
);

// ─── Generic add/remove/reorder list editor for the badges panel. ────────
function RepeaterField( { items, onChange, renderItem, addLabel, newItem } ) {
	const list = Array.isArray( items ) ? items : [];
	const update = ( i, patch ) => {
		const next = list.slice();
		next[ i ] = { ...next[ i ], ...patch };
		onChange( next );
	};
	const remove = ( i ) => onChange( list.filter( ( _, idx ) => idx !== i ) );
	const move = ( i, dir ) => {
		const j = i + dir;
		if ( j < 0 || j >= list.length ) return;
		const next = list.slice();
		const tmp = next[ i ];
		next[ i ] = next[ j ];
		next[ j ] = tmp;
		onChange( next );
	};
	const add = () => onChange( [ ...list, { ...newItem } ] );

	return (
		<div className="adaire-repeater">
			{ list.map( ( item, i ) => (
				<div className="adaire-repeater__item" key={ i }>
					<div className="adaire-repeater__row-head">
						<span className="adaire-repeater__index">{ i + 1 }</span>
						<Button variant="tertiary" size="small" onClick={ () => move( i, -1 ) } disabled={ i === 0 }>↑</Button>
						<Button variant="tertiary" size="small" onClick={ () => move( i, 1 ) } disabled={ i === list.length - 1 }>↓</Button>
						<Button variant="tertiary" size="small" isDestructive onClick={ () => remove( i ) }>{ __( 'Remove', 'rating-badge-block' ) }</Button>
					</div>
					{ renderItem( item, ( patch ) => update( i, patch ), i ) }
				</div>
			) ) }
			<Button variant="secondary" onClick={ add }>{ addLabel }</Button>
		</div>
	);
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const [ iconPickerIndex, setIconPickerIndex ] = useState( null );
	const a = attributes;

	useEffect( () => {
		if ( ! a.blockId ) {
			setAttributes( { blockId: clientId } );
		}
	}, [ a.blockId, clientId, setAttributes ] );

	const blockProps = useBlockProps( {
		id: a.blockId || undefined,
		className: 'adaire-rating-badge-block',
		style: {
			...getStyleVars( a ),
			'--container-max-width': `${ a.containerMaxWidth?.desktop?.value ?? 1200 }${ a.containerMaxWidth?.desktop?.unit ?? 'px' }`,
			'--container-max-width-tablet': `${ a.containerMaxWidth?.tablet?.value ?? 100 }${ a.containerMaxWidth?.tablet?.unit ?? '%' }`,
			'--container-max-width-mobile': `${ a.containerMaxWidth?.mobile?.value ?? 100 }${ a.containerMaxWidth?.mobile?.unit ?? '%' }`,
		},
	} );

	const containerClasses = [
		'adaire-rating-badge-block__container',
		a.containerMode === 'constrained' ? 'is-constrained' : '',
	].filter( Boolean ).join( ' ' );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'rating-badge-block' ) } initialOpen={ true }>
					<p>{ __( 'Container Width', 'rating-badge-block' ) }</p>
					<ButtonGroup>
						{ CONTAINER_MODES.map( ( mode ) => (
							<Button
								key={ mode.value }
								isPrimary={ a.containerMode === mode.value }
								onClick={ () => setAttributes( { containerMode: mode.value } ) }
							>
								{ mode.label }
							</Button>
						) ) }
					</ButtonGroup>
					{ a.containerMode === 'constrained' && (
						<RangeControl
							label={ __( 'Max Width (Desktop)', 'rating-badge-block' ) }
							value={ a.containerMaxWidth?.desktop?.value ?? 1200 }
							onChange={ ( value ) => setAttributes( {
								containerMaxWidth: { ...a.containerMaxWidth, desktop: { value, unit: 'px' } },
							} ) }
							min={ 400 }
							max={ 2000 }
							step={ 10 }
						/>
					) }
					<SelectControl
						label={ __( 'Alignment', 'rating-badge-block' ) }
						value={ a.alignment || 'center' }
						options={ [
							{ label: __( 'Left', 'rating-badge-block' ), value: 'left' },
							{ label: __( 'Center', 'rating-badge-block' ), value: 'center' },
							{ label: __( 'Right', 'rating-badge-block' ), value: 'right' },
						] }
						onChange={ set( setAttributes, 'alignment' ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Colors', 'rating-badge-block' ) } initialOpen={ false }>
					<AdaireColorControl label={ __( 'Accent color', 'rating-badge-block' ) } value={ a.accentColor } onChange={ ( v ) => setAttributes( { accentColor: v || '#6366f1' } ) } />
					<AdaireColorControl label={ __( 'Text color', 'rating-badge-block' ) } value={ a.textColor } onChange={ ( v ) => setAttributes( { textColor: v || '#111827' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Badges', 'rating-badge-block' ) } initialOpen={ true }>
					<RepeaterField
						items={ a.badges }
						onChange={ ( items ) => setAttributes( { badges: items } ) }
						addLabel={ __( 'Add badge', 'rating-badge-block' ) }
						newItem={ { icon: 'bi bi-star-fill', imageUrl: '', text: '5.0/5', subtext: __( 'Reviews', 'rating-badge-block' ) } }
						renderItem={ ( item, update, idx ) => (
							<>
								<BaseControl label={ __( 'Icon', 'rating-badge-block' ) } __nextHasNoMarginBottom>
									<Button
										variant="secondary"
										onClick={ () => setIconPickerIndex( idx ) }
										style={ { width: '100%', justifyContent: 'flex-start', marginBottom: '8px' } }
										disabled={ !! item.imageUrl }
									>
										<i className={ resolveRatingIcon( item ) } style={ { marginRight: '8px' } } aria-hidden="true" />
										{ item.imageUrl ? __( 'Using uploaded image below', 'rating-badge-block' ) : __( 'Choose icon', 'rating-badge-block' ) }
									</Button>
								</BaseControl>
								<div className="adaire-repeater__media-row">
									{ media( __( 'badge image', 'rating-badge-block' ), item.imageUrl, ( url ) => update( { imageUrl: url } ) ) }
									{ item.imageUrl && (
										<Button variant="tertiary" isDestructive size="small" onClick={ () => update( { imageUrl: '' } ) }>
											{ __( 'Remove image (use icon instead)', 'rating-badge-block' ) }
										</Button>
									) }
								</div>
								<p className="adaire-help-note">{ __( 'An uploaded image, if set, replaces the icon for this badge.', 'rating-badge-block' ) }</p>
								<TextControl label={ __( 'Text', 'rating-badge-block' ) } value={ item.text || '' } onChange={ ( v ) => update( { text: v } ) } />
								<TextControl label={ __( 'Subtext', 'rating-badge-block' ) } value={ item.subtext || '' } onChange={ ( v ) => update( { subtext: v } ) } />
							</>
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<BootstrapIconPicker
				isOpen={ iconPickerIndex !== null }
				onClose={ () => setIconPickerIndex( null ) }
				onSelect={ ( iconClass ) => {
					if ( iconPickerIndex !== null ) {
						const next = ( a.badges || [] ).slice();
						next[ iconPickerIndex ] = { ...next[ iconPickerIndex ], icon: iconClass };
						setAttributes( { badges: next } );
					}
				} }
				currentIcon={ iconPickerIndex !== null ? ( a.badges || [] )[ iconPickerIndex ]?.icon : '' }
			/>

			<div { ...blockProps }>
				<div className={ containerClasses }>
					<div className="adaire-rating-badge-block__list">
						{ ( a.badges || [] ).map( ( badge, i ) => <RatingBadgeView key={ i } badge={ badge } /> ) }
					</div>
				</div>
			</div>
		</>
	);
}
