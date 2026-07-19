import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import {
	__experimentalUnitControl as UnitControl,
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

const TEXT_TRANSFORM_OPTIONS = [
	{ label: __( 'None' ), value: 'none' },
	{ label: __( 'Uppercase' ), value: 'uppercase' },
	{ label: __( 'Lowercase' ), value: 'lowercase' },
	{ label: __( 'Capitalize' ), value: 'capitalize' },
];

const FONT_FAMILY_OPTIONS = [
	{ label: 'Default (inherit theme)', value: '' },
	{ label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
	{ label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
	{ label: 'Georgia', value: 'Georgia, serif' },
	{ label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
	{ label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
	{ label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
	{ label: 'Courier New', value: "'Courier New', Courier, monospace" },
	{ label: 'System UI', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

function TypographySubsection( { title, a, set, prefix } ) {
	return (
		<div className="adaire-typography-section" style={ { borderBottom: '1px solid #eee', paddingBottom: 16, marginBottom: 16 } }>
			{ title && (
				<p className="adaire-typography-section-name" style={ { fontWeight: 600, marginBottom: 12 } }>{ title }</p>
			) }
			<TextControlFontSize a={ a } set={ set } prefix={ prefix } />
			<SelectControl
				label={ __( 'Font weight' ) }
				value={ a[ `${ prefix }FontWeight` ] }
				options={ [
					{ label: __( 'Thin (100)' ), value: '100' },
					{ label: __( 'Extra Light (200)' ), value: '200' },
					{ label: __( 'Light (300)' ), value: '300' },
					{ label: __( 'Normal (400)' ), value: '400' },
					{ label: __( 'Medium (500)' ), value: '500' },
					{ label: __( 'Semi Bold (600)' ), value: '600' },
					{ label: __( 'Bold (700)' ), value: '700' },
					{ label: __( 'Extra Bold (800)' ), value: '800' },
					{ label: __( 'Black (900)' ), value: '900' },
				] }
				onChange={ set( `${ prefix }FontWeight` ) }
			/>
			<UnitControl
				label={ __( 'Line height' ) }
				value={ a[ `${ prefix }LineHeight` ] }
				onChange={ set( `${ prefix }LineHeight` ) }
			/>
			<UnitControl
				label={ __( 'Letter spacing' ) }
				value={ a[ `${ prefix }LetterSpacing` ] }
				onChange={ set( `${ prefix }LetterSpacing` ) }
			/>
			<SelectControl
				label={ __( 'Text transform' ) }
				value={ a[ `${ prefix }TextTransform` ] }
				options={ TEXT_TRANSFORM_OPTIONS }
				onChange={ set( `${ prefix }TextTransform` ) }
			/>
		</div>
	);
}

function TextControlFontSize( { a, set, prefix } ) {
	return (
		<UnitControl
			label={ __( 'Font size' ) }
			value={ a[ `${ prefix }FontSize` ] }
			onChange={ set( `${ prefix }FontSize` ) }
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
	const set = ( key ) => ( value ) => setAttributes( { [ key ]: value } );

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
			marginTop       : `${ a.marginTop     ?? 0  }px`,
			marginBottom    : `${ a.marginBottom  ?? 0  }px`,
			color           : a.textColor        || '#ffffff',

			'--tl-font-family' : a.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif",

			'--tl-eyebrow-font-size'      : a.eyebrowFontSize      || '11px',
			'--tl-eyebrow-font-weight'    : a.eyebrowFontWeight    || '700',
			'--tl-eyebrow-line-height'    : a.eyebrowLineHeight    || 'normal',
			'--tl-eyebrow-letter-spacing' : a.eyebrowLetterSpacing || '0.14em',
			'--tl-eyebrow-text-transform' : a.eyebrowTextTransform || 'uppercase',

			'--tl-section-title-font-size'      : a.sectionTitleFontSize      || 'clamp(26px, 3.5vw, 42px)',
			'--tl-section-title-font-weight'    : a.sectionTitleFontWeight    || '700',
			'--tl-section-title-line-height'    : a.sectionTitleLineHeight    || '1.18',
			'--tl-section-title-letter-spacing' : a.sectionTitleLetterSpacing || 'normal',
			'--tl-section-title-text-transform' : a.sectionTitleTextTransform || 'none',

			'--tl-section-desc-font-size'      : a.sectionDescFontSize      || '16px',
			'--tl-section-desc-font-weight'    : a.sectionDescFontWeight    || '400',
			'--tl-section-desc-line-height'    : a.sectionDescLineHeight    || '1.75',
			'--tl-section-desc-letter-spacing' : a.sectionDescLetterSpacing || 'normal',
			'--tl-section-desc-text-transform' : a.sectionDescTextTransform || 'none',

			'--tl-item-title-font-size'      : a.itemTitleFontSize      || '18px',
			'--tl-item-title-font-weight'    : a.itemTitleFontWeight    || '700',
			'--tl-item-title-line-height'    : a.itemTitleLineHeight    || '1.3',
			'--tl-item-title-letter-spacing' : a.itemTitleLetterSpacing || 'normal',
			'--tl-item-title-text-transform' : a.itemTitleTextTransform || 'none',
			// Milestone title (e.g. "Seamless Onboarding") used to share
			// --tl-text with the block's overall section title — falls back to
			// textColor so existing content keeps its current look.
			'--tl-item-title-color'         : a.itemTitleColor || a.textColor || '#ffffff',

			'--tl-item-desc-font-size'      : a.itemDescFontSize      || '15px',
			'--tl-item-desc-font-weight'    : a.itemDescFontWeight    || '400',
			'--tl-item-desc-line-height'    : a.itemDescLineHeight    || '1.75',
			'--tl-item-desc-letter-spacing' : a.itemDescLetterSpacing || 'normal',
			'--tl-item-desc-text-transform' : a.itemDescTextTransform || 'none',
		},
	} );

	const [ activeZone, setActiveZone ] = useState( null );

	const addItem = () => {
		const newItems = [
			...items,
			{
				icon: 'shield',
				title: __( 'New Milestone', 'adaire-blocks' ),
				description: __( 'Describe this milestone.', 'adaire-blocks' ),
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
			<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
				<PanelBody section="layout" title={ __( 'Layout', 'adaire-blocks' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'Orientation', 'adaire-blocks' ) }
						value={ orientation }
						options={ [
							{ label: __( 'Vertical', 'adaire-blocks' ), value: 'vertical' },
							{ label: __( 'Horizontal', 'adaire-blocks' ), value: 'horizontal' },
						] }
						onChange={ ( value ) => setAttributes( { orientation: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show Connector Line', 'adaire-blocks' ) }
						checked={ showConnector }
						onChange={ ( value ) => setAttributes( { showConnector: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show Arrows', 'adaire-blocks' ) }
						checked={ showArrows }
						onChange={ ( value ) => setAttributes( { showArrows: value } ) }
					/>
				</PanelBody>
				<PanelBody section="style" priority="high" title={ __( 'Colors', 'adaire-blocks' ) } initialOpen={ false }>
					<ColorPicker
						label={ __( 'Background Color', 'adaire-blocks' ) }
						value={ attributes.backgroundColor }
						onChange={ ( value ) => setAttributes( { backgroundColor: value } ) }
					/>
					<ColorPicker
						label={ __( 'Accent Color', 'adaire-blocks' ) }
						value={ attributes.accentColor }
						onChange={ ( value ) => setAttributes( { accentColor: value } ) }
					/>
					<ColorPicker
						label={ __( 'Section Header Color', 'adaire-blocks' ) }
						value={ attributes.textColor }
						onChange={ ( value ) => setAttributes( { textColor: value } ) }
					/>
					<ColorPicker
						label={ __( 'Milestone Title Color', 'adaire-blocks' ) }
						value={ attributes.itemTitleColor }
						onChange={ ( value ) => setAttributes( { itemTitleColor: value } ) }
					/>
					<ColorPicker
						label={ __( 'Description Color', 'adaire-blocks' ) }
						value={ attributes.descriptionColor }
						onChange={ ( value ) => setAttributes( { descriptionColor: value } ) }
					/>
				</PanelBody>
				<PanelBody section="style" priority="high" title={ __( 'Typography', 'adaire-blocks' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Font family' ) }
						value={ a.fontFamily || '' }
						options={ FONT_FAMILY_OPTIONS }
						onChange={ set( 'fontFamily' ) }
						help={ __( 'Applies to all text in this block.' ) }
					/>
					<TypographySubsection title={ __( 'Eyebrow' ) }        a={ a } set={ set } prefix="eyebrow" />
					<TypographySubsection title={ __( 'Section title' ) }  a={ a } set={ set } prefix="sectionTitle" />
					<TypographySubsection title={ __( 'Section description' ) } a={ a } set={ set } prefix="sectionDesc" />
					<TypographySubsection title={ __( 'Milestone title' ) } a={ a } set={ set } prefix="itemTitle" />
					<TypographySubsection title={ __( 'Milestone description' ) } a={ a } set={ set } prefix="itemDesc" />
				</PanelBody>
				<PanelBody section="style" priority="medium" title={ __( 'Spacing', 'adaire-blocks' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Padding top (px)', 'adaire-blocks' ) }
						value={ a.paddingTop ?? 80 }
						onChange={ ( v ) => setAttributes( { paddingTop: v } ) }
						min={ 0 }
						max={ 200 }
					/>
					<RangeControl
						label={ __( 'Padding bottom (px)', 'adaire-blocks' ) }
						value={ a.paddingBottom ?? 80 }
						onChange={ ( v ) => setAttributes( { paddingBottom: v } ) }
						min={ 0 }
						max={ 200 }
					/>
					<RangeControl
						label={ __( 'Margin top (px)', 'adaire-blocks' ) }
						value={ a.marginTop ?? 0 }
						onChange={ ( v ) => setAttributes( { marginTop: v } ) }
						min={ 0 }
						max={ 200 }
					/>
					<RangeControl
						label={ __( 'Margin bottom (px)', 'adaire-blocks' ) }
						value={ a.marginBottom ?? 0 }
						onChange={ ( v ) => setAttributes( { marginBottom: v } ) }
						min={ 0 }
						max={ 200 }
					/>
				</PanelBody>
				<PanelBody
					section="content"
					title={ `Items (${ items.length })` }
					initialOpen={ false }
				>
					{ (items || []).map( ( item, index ) => (
						<div className="adaire-timeline__item-control" key={ index }>
							<SelectControl
								label={ __( 'Icon', 'adaire-blocks' ) }
								value={ item.icon }
								options={ ICON_OPTIONS }
								onChange={ ( value ) => updateItem( index, 'icon', value ) }
							/>
							<Button isDestructive onClick={ () => removeItem( index ) }>
								{ __( 'Remove', 'adaire-blocks' ) }
							</Button>
						</div>
					) ) }
					<Button variant="primary" onClick={ addItem }>
						{ __( 'Add Item', 'adaire-blocks' ) }
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
						placeholder={ __( 'Eyebrow', 'adaire-blocks' ) }
					/>
					<RichText
						tagName="h2"
						className="adaire-timeline__section-title"
						value={ sectionTitle }
						onChange={ ( value ) => setAttributes( { sectionTitle: value } ) }
						placeholder={ __( 'Section title', 'adaire-blocks' ) }
					/>
					<RichText
						tagName="p"
						className="adaire-timeline__section-desc"
						value={ sectionDescription }
						onChange={ ( value ) => setAttributes( { sectionDescription: value } ) }
						placeholder={ __( 'Section description (optional)', 'adaire-blocks' ) }
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
								label={ item.title || __( 'Milestone', 'adaire-blocks' ) }
								activeZone={ activeZone }
								setActiveZone={ setActiveZone }
								content={
									<>
										<SelectControl
											label={ __( 'Icon', 'adaire-blocks' ) }
											value={ item.icon }
											options={ ICON_OPTIONS }
											onChange={ ( value ) => updateItem( index, 'icon', value ) }
										/>
										<Button isDestructive onClick={ () => removeItem( index ) }>
											{ __( 'Remove milestone', 'adaire-blocks' ) }
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
									placeholder={ __( 'Milestone title', 'adaire-blocks' ) }
								/>
								<RichText
									tagName="p"
									className="adaire-timeline__item-desc"
									value={ item.description }
									onChange={ ( value ) => updateItem( index, 'description', value ) }
									placeholder={ __( 'Milestone description', 'adaire-blocks' ) }
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
