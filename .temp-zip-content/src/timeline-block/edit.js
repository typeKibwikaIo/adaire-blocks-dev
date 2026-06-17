import { RichText, useBlockProps } from '@wordpress/block-editor';
import InspectorTabs from '../components/InspectorTabs';
import AdaireColorControl from '../components/AdaireColorControl';
import QuickZone from '../components/QuickZone';
import {
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { ICON_SVGS, ICON_OPTIONS } from './icons';

// ─── Helpers ────────────────────────────────────────────────────────────────

function ColorPicker( { label, value, onChange } ) {
	return (
		<AdaireColorControl label={ label } value={ value } onChange={ onChange } />
	);
}

function NodeIcon( { iconKey, size } ) {
	const icon = ICON_SVGS[ iconKey ] || ICON_SVGS.shield;
	return (
		<span style={ { display: 'flex', width: size, height: size } }>
			{ icon }
		</span>
	);
}

// ─── Edit ───────────────────────────────────────────────────────────────────

export default function Edit( { attributes: a, setAttributes } ) {
	const {
		items        = [],
		orientation  = 'vertical',
		showArrows   = true,
		showConnector= true,
	} = a;

	const set = ( key ) => ( value ) => setAttributes( { [ key ]: value } );
	const [activeZone, setActiveZone] = useState(null);

	const addItem = () =>
		setAttributes( {
			items: [
				...items,
				{ title: 'New Step', description: 'Describe what happens in this step.', icon: 'check' },
			],
		} );

	const removeItem = ( i ) =>
		setAttributes( { items: items.filter( ( _, idx ) => idx !== i ) } );

	const updateItem = ( i, field, value ) =>
		setAttributes( {
			items: items.map( ( item, idx ) =>
				idx === i ? { ...item, [ field ]: value } : item
			),
		} );

	const blockProps = useBlockProps( {
		className: `adaire-timeline is-${ orientation }`,
		style: {
			'--tl-bg'       : a.backgroundColor  || '#0a1628',
			'--tl-accent'   : a.accentColor      || '#00bcd4',
			'--tl-eyebrow'  : a.eyebrowColor     || a.accentColor || '#00bcd4',
			'--tl-text'     : a.textColor        || '#ffffff',
			'--tl-desc'     : a.descriptionColor || 'rgba(255,255,255,0.65)',
			'--tl-line'     : a.lineColor        || '#1e3a5f',
			'--tl-node-size': `${ a.nodeSize || 52 }px`,
			backgroundColor : a.backgroundColor  || '#0a1628',
			paddingTop      : `${ a.paddingTop   ?? 80 }px`,
			paddingBottom   : `${ a.paddingBottom ?? 80 }px`,
			color           : a.textColor        || '#ffffff',
		},
	} );

	const nodeSize = a.nodeSize || 52;

	return (
		<>
			{ /* ── Sidebar ─────────────────────────────────────── */ }
			<InspectorTabs attributes={a} setAttributes={setAttributes}>
				<PanelBody title={ __( 'Layout', 'timeline-block' ) } initialOpen>
					<SelectControl
						label={ __( 'Orientation' ) }
						value={ orientation }
						options={ [
							{ label: 'Vertical (alternating)', value: 'vertical' },
							{ label: 'Horizontal', value: 'horizontal' },
						] }
						onChange={ set( 'orientation' ) }
					/>
					<ToggleControl
						label={ __( 'Show connector line' ) }
						checked={ showConnector }
						onChange={ set( 'showConnector' ) }
					/>
					{ orientation === 'vertical' && (
						<ToggleControl
							label={ __( 'Show arrow indicators' ) }
							checked={ showArrows }
							onChange={ set( 'showArrows' ) }
						/>
					) }
					<RangeControl
						label={ __( 'Node size (px)' ) }
						value={ nodeSize }
						onChange={ set( 'nodeSize' ) }
						min={ 28 }
						max={ 88 }
					/>
					<RangeControl
						label={ __( 'Padding top (px)' ) }
						value={ a.paddingTop ?? 80 }
						onChange={ set( 'paddingTop' ) }
						min={ 0 }
						max={ 240 }
					/>
					<RangeControl
						label={ __( 'Padding bottom (px)' ) }
						value={ a.paddingBottom ?? 80 }
						onChange={ set( 'paddingBottom' ) }
						min={ 0 }
						max={ 240 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Colors' ) } initialOpen={ false }>
					<ColorPicker label="Background"       value={ a.backgroundColor  || '#0a1628' }                        onChange={ set( 'backgroundColor' ) } />
					<ColorPicker label="Accent / nodes"   value={ a.accentColor      || '#00bcd4' }                        onChange={ set( 'accentColor' ) } />
					<ColorPicker label="Eyebrow"          value={ a.eyebrowColor     || a.accentColor || '#00bcd4' }       onChange={ set( 'eyebrowColor' ) } />
					<ColorPicker label="Heading / titles" value={ a.textColor        || '#ffffff' }                        onChange={ set( 'textColor' ) } />
					<ColorPicker label="Description"      value={ a.descriptionColor || 'rgba(255,255,255,0.65)' }         onChange={ set( 'descriptionColor' ) } />
					<ColorPicker label="Connector line"   value={ a.lineColor        || '#1e3a5f' }                        onChange={ set( 'lineColor' ) } />
				</PanelBody>

				<PanelBody title={ __( `Items (${ items.length })` ) } initialOpen={ false }>
					<p style={ { fontSize: 12, color: '#757575', margin: '0 0 12px' } }>
						{ __( 'Edit item text directly in the preview. Use this panel to change icons or add / remove items.' ) }
					</p>
					{ items.map( ( item, i ) => (
						<div
							key={ i }
							style={ {
								borderTop   : i > 0 ? '1px solid #eee' : 'none',
								paddingTop  : i > 0 ? 12 : 0,
								marginBottom: 12,
							} }
						>
							<p style={ { margin: '0 0 6px', fontWeight: 600, fontSize: 12 } }>
								#{ i + 1 }: { item.title }
							</p>
							<SelectControl
								label={ __( 'Icon' ) }
								value={ item.icon || 'shield' }
								options={ ICON_OPTIONS }
								onChange={ ( v ) => updateItem( i, 'icon', v ) }
							/>
							<Button
								isDestructive
								variant="link"
								onClick={ () => removeItem( i ) }
								style={ { marginTop: 4 } }
							>
								{ __( 'Remove item' ) }
							</Button>
						</div>
					) ) }
					<Button
						variant="secondary"
						onClick={ addItem }
						style={ { width: '100%', justifyContent: 'center', marginTop: 8 } }
					>
						{ __( '+ Add Item' ) }
					</Button>
				</PanelBody>
			</InspectorTabs>

			{ /* ── Canvas ─────────────────────────────────────── */ }
			<section { ...blockProps }>
				{ /* Section header */ }
				<div className="adaire-timeline__header">
					<RichText
						tagName="p"
						className="adaire-timeline__eyebrow"
						value={ a.eyebrow }
						onChange={ set( 'eyebrow' ) }
						placeholder={ __( 'EYEBROW LABEL' ) }
						allowedFormats={ [] }
					/>
					<RichText
						tagName="h2"
						className="adaire-timeline__section-title"
						value={ a.sectionTitle }
						onChange={ set( 'sectionTitle' ) }
						placeholder={ __( 'Section Title' ) }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
					/>
					<RichText
						tagName="p"
						className="adaire-timeline__section-desc"
						value={ a.sectionDescription }
						onChange={ set( 'sectionDescription' ) }
						placeholder={ __( 'Optional section description…' ) }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
					/>
				</div>

				{ /* Track */ }
				<div className="adaire-timeline__track">
					{ showConnector && <div className="adaire-timeline__line" /> }

					{ items.map( ( item, i ) => {
						const side = orientation === 'vertical'
							? ( i % 2 === 0 ? 'right' : 'left' )
							: 'bottom';

						const nodeEl = (
							<QuickZone
								id={ `item-${ i }-icon` }
								label={ `Item ${ i + 1 } Icon` }
								activeZone={activeZone}
								setActiveZone={setActiveZone}
								content={
									<SelectControl
										label={ __( 'Icon' ) }
										value={ item.icon || 'shield' }
										options={ ICON_OPTIONS }
										onChange={ ( v ) => updateItem( i, 'icon', v ) }
									/>
								}
							>
							<div
								className="adaire-timeline__node"
								style={ { width: nodeSize, height: nodeSize } }
							>
								<NodeIcon iconKey={ item.icon || 'shield' } size={ nodeSize } />
							</div>
							</QuickZone>
						);

						const contentEl = (
							<div className="adaire-timeline__content">
								<RichText
									tagName="h3"
									className="adaire-timeline__item-title"
									value={ item.title }
									onChange={ ( v ) => updateItem( i, 'title', v ) }
									placeholder={ __( 'Step title' ) }
									allowedFormats={ [ 'core/bold' ] }
								/>
								<RichText
									tagName="p"
									className="adaire-timeline__item-desc"
									value={ item.description }
									onChange={ ( v ) => updateItem( i, 'description', v ) }
									placeholder={ __( 'Describe this step…' ) }
									allowedFormats={ [ 'core/bold', 'core/italic' ] }
								/>
							</div>
						);

						if ( orientation === 'horizontal' ) {
							return (
								<div key={ i } className="adaire-timeline__item">
									{ nodeEl }
									{ contentEl }
								</div>
							);
						}

						// Vertical alternating
						return (
							<div key={ i } className={ `adaire-timeline__item is-${ side }` }>
								{ /* Left slot — content when side===left, empty when side===right */ }
								<div className="adaire-timeline__slot">
									{ side === 'left' && contentEl }
								</div>

								{ /* Center: optional left-arrow, node, optional right-arrow */ }
								<div className="adaire-timeline__center">
									{ showArrows && (
										<span
											className={ `adaire-timeline__arrow${ side === 'left' ? '' : ' is-hidden' }` }
								>
									›
								</span>
							) }
							{ nodeEl }
							{ showArrows && (
								<span
									className={ `adaire-timeline__arrow${ side === 'right' ? '' : ' is-hidden' }` }
								>
									‹
								</span>
							) }
						</div>

						{ /* Right slot — content when side===right, empty when side===left */ }
						<div className="adaire-timeline__slot">
							{ side === 'right' && contentEl }
						</div>
					</div>
				);
			} ) }
		</div>
	</section>
</>
);
}