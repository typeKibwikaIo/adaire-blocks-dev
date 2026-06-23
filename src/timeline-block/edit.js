import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import {
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import InspectorTabs from '../components/InspectorTabs';
import AdaireColorControl from '../components/AdaireColorControl';
import QuickZone from '../components/QuickZone';
import { ICON_SVGS, ICON_OPTIONS } from './icons';

function ColorPicker( { label, value, onChange } ) {
	return (
		<AdaireColorControl
			label={ label }
			value={ value }
			onChange={ onChange }
		/>
	);
}

// Mirrors save.js's node markup exactly (same class + inline size) so the
// editor canvas and the front end render an identical circle/border/glyph.
//
// ICON_SVGS' entries are JSX elements, not HTML strings — the previous
// version passed one to dangerouslySetInnerHTML's __html, which silently
// stringifies a React element to the literal text "[object Object]" instead
// of rendering it. save.js never had this bug because it renders the icon
// directly as a JSX child; doing the same here fixes it.
function NodeIcon( { icon, nodeSize } ) {
	const svg = ICON_SVGS[ icon ] || ICON_SVGS.shield;
	return (
		<div
			className="adaire-timeline__node"
			style={ { width: nodeSize, height: nodeSize } }
		>
			{ svg }
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		items,
		orientation,
		showArrows,
		showConnector,
		eyebrow,
		sectionTitle,
		sectionDescription,
	} = attributes;
	const a = attributes;
	const nodeSize = a.nodeSize || 52;

	// Kept 1:1 with save.js's style object — this used to also carry a pile of
	// responsive padding/typography vars that referenced attributes which were
	// never registered in block.json and CSS vars that style.scss never
	// consumed, so they did nothing and have been dropped.
	const blockProps = useBlockProps( {
		className: `adaire-timeline is-${ orientation }`,
		style: {
			'--tl-bg'       : a.backgroundColor  || '#0a1628',
			'--tl-accent'   : a.accentColor      || '#00bcd4',
			'--tl-eyebrow'  : a.eyebrowColor     || a.accentColor || '#00bcd4',
			'--tl-text'     : a.textColor        || '#ffffff',
			'--tl-desc'     : a.descriptionColor || 'rgba(255,255,255,0.65)',
			'--tl-line'     : a.lineColor        || '#1e3a5f',
			'--tl-node-size': `${ nodeSize }px`,
			backgroundColor : a.backgroundColor  || '#0a1628',
			paddingTop      : `${ a.paddingTop    ?? 80 }px`,
			paddingBottom   : `${ a.paddingBottom ?? 80 }px`,
			color           : a.textColor        || '#ffffff',
		},
	} );

	const [ activeZone, setActiveZone ] = useState( null );

	const addItem = () => {
		const newItems = [
			...items,
			{
				icon: 'shield',
				title: __( 'New Milestone', 'timeline-block' ),
				description: __( 'Describe this milestone.', 'timeline-block' ),
			},
		];
		setAttributes( { items: newItems } );
	};

	const removeItem = ( index ) => {
		const newItems = items.filter( ( _, i ) => i !== index );
		setAttributes( { items: newItems } );
	};

	const updateItem = ( index, key, value ) => {
		const newItems = items.map( ( item, i ) =>
			i === index ? { ...item, [ key ]: value } : item
		);
		setAttributes( { items: newItems } );
	};

	return (
		<>
			<InspectorTabs>
				<PanelBody title={ __( 'Layout', 'timeline-block' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'Orientation', 'timeline-block' ) }
						value={ orientation }
						options={ [
							{ label: __( 'Vertical', 'timeline-block' ), value: 'vertical' },
							{ label: __( 'Horizontal', 'timeline-block' ), value: 'horizontal' },
						] }
						onChange={ ( value ) => setAttributes( { orientation: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show Connector Line', 'timeline-block' ) }
						checked={ showConnector }
						onChange={ ( value ) => setAttributes( { showConnector: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show Arrows', 'timeline-block' ) }
						checked={ showArrows }
						onChange={ ( value ) => setAttributes( { showArrows: value } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Colors', 'timeline-block' ) } initialOpen={ false }>
					<ColorPicker
						label={ __( 'Accent Color', 'timeline-block' ) }
						value={ attributes.accentColor }
						onChange={ ( value ) => setAttributes( { accentColor: value } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Spacing', 'timeline-block' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Padding top (px)', 'timeline-block' ) }
						value={ a.paddingTop ?? 80 }
						onChange={ ( v ) => setAttributes( { paddingTop: v } ) }
						min={ 0 }
						max={ 200 }
					/>
					<RangeControl
						label={ __( 'Padding bottom (px)', 'timeline-block' ) }
						value={ a.paddingBottom ?? 80 }
						onChange={ ( v ) => setAttributes( { paddingBottom: v } ) }
						min={ 0 }
						max={ 200 }
					/>
				</PanelBody>
				<PanelBody
					title={ `Items (${ items.length })` }
					initialOpen={ false }
				>
					{ (items || []).map( ( item, index ) => (
						<div className="adaire-timeline__item-control" key={ index }>
							<SelectControl
								label={ __( 'Icon', 'timeline-block' ) }
								value={ item.icon }
								options={ ICON_OPTIONS }
								onChange={ ( value ) => updateItem( index, 'icon', value ) }
							/>
							<Button isDestructive onClick={ () => removeItem( index ) }>
								{ __( 'Remove', 'timeline-block' ) }
							</Button>
						</div>
					) ) }
					<Button variant="primary" onClick={ addItem }>
						{ __( 'Add Item', 'timeline-block' ) }
					</Button>
				</PanelBody>
			</InspectorTabs>

			<div { ...blockProps }>
				{ /* Section header — was missing from the editor entirely even
				     though save.js always renders it on the front end. */ }
				<div className="adaire-timeline__header">
					<RichText
						tagName="p"
						className="adaire-timeline__eyebrow"
						value={ eyebrow }
						onChange={ ( value ) => setAttributes( { eyebrow: value } ) }
						placeholder={ __( 'Eyebrow', 'timeline-block' ) }
					/>
					<RichText
						tagName="h2"
						className="adaire-timeline__section-title"
						value={ sectionTitle }
						onChange={ ( value ) => setAttributes( { sectionTitle: value } ) }
						placeholder={ __( 'Section title', 'timeline-block' ) }
					/>
					<RichText
						tagName="p"
						className="adaire-timeline__section-desc"
						value={ sectionDescription }
						onChange={ ( value ) => setAttributes( { sectionDescription: value } ) }
						placeholder={ __( 'Section description (optional)', 'timeline-block' ) }
					/>
				</div>

				<div className="adaire-timeline__track">
					{ showConnector && <div className="adaire-timeline__line" /> }

					{ (items || []).map( ( item, index ) => {
						// Same parity as save.js — this used to run the opposite
						// direction in the editor, so every item swapped sides
						// the moment the page loaded on the front end.
						const side = orientation === 'vertical'
							? ( index % 2 === 0 ? 'right' : 'left' )
							: 'bottom';

						const nodeEl = (
							<QuickZone
								id={ `timeline-item-${ index }` }
								label={ item.title || __( 'Milestone', 'timeline-block' ) }
								activeZone={ activeZone }
								setActiveZone={ setActiveZone }
								content={
									<>
										<SelectControl
											label={ __( 'Icon', 'timeline-block' ) }
											value={ item.icon }
											options={ ICON_OPTIONS }
											onChange={ ( value ) => updateItem( index, 'icon', value ) }
										/>
										<Button isDestructive onClick={ () => removeItem( index ) }>
											{ __( 'Remove milestone', 'timeline-block' ) }
										</Button>
									</>
								}
							>
								<NodeIcon icon={ item.icon } nodeSize={ nodeSize } />
							</QuickZone>
						);

						const contentEl = (
							<div className="adaire-timeline__content">
								<RichText
									tagName="h3"
									className="adaire-timeline__item-title"
									value={ item.title }
									onChange={ ( value ) => updateItem( index, 'title', value ) }
									placeholder={ __( 'Milestone title', 'timeline-block' ) }
								/>
								<RichText
									tagName="p"
									className="adaire-timeline__item-desc"
									value={ item.description }
									onChange={ ( value ) => updateItem( index, 'description', value ) }
									placeholder={ __( 'Milestone description', 'timeline-block' ) }
								/>
							</div>
						);

						if ( orientation === 'horizontal' ) {
							return (
								<div key={ index } className="adaire-timeline__item">
									{ nodeEl }
									{ contentEl }
								</div>
							);
						}

						// Vertical alternating — same 3-column [slot][center][slot]
						// grid structure as save.js so style.scss's grid rules
						// (which only ever matched the front end before) now
						// apply on canvas too.
						return (
							<div key={ index } className={ `adaire-timeline__item is-${ side }` }>
								<div className="adaire-timeline__slot">
									{ side === 'left' && contentEl }
								</div>

								<div className="adaire-timeline__center">
									{ showArrows && (
										<span className={ `adaire-timeline__arrow${ side === 'left' ? '' : ' is-hidden' }` }>
											›
										</span>
									) }
									{ nodeEl }
									{ showArrows && (
										<span className={ `adaire-timeline__arrow${ side === 'right' ? '' : ' is-hidden' }` }>
											‹
										</span>
									) }
								</div>

								<div className="adaire-timeline__slot">
									{ side === 'right' && contentEl }
								</div>
							</div>
						);
					} ) }
				</div>
			</div>
		</>
	);
}
