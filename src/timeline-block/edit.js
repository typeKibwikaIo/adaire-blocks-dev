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
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute } from '../components/DeviceSwitcher';
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

function NodeIcon( { icon } ) {
	const svg = ICON_SVGS[ icon ] || ICON_SVGS.circle;
	return (
		<span
			className="adaire-timeline__node-icon"
			dangerouslySetInnerHTML={ { __html: svg } }
		/>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		items,
		orientation,
		showArrows,
		showConnector,
	} = attributes;
	const a = attributes;

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
			'--tl-padding-top'           : `${ a.responsivePaddingTop?.desktop      ?? a.paddingTop    ?? 80 }px`,
			'--tl-padding-top-tablet'    : `${ a.responsivePaddingTop?.tablet       ?? 60 }px`,
			'--tl-padding-top-mobile'    : `${ a.responsivePaddingTop?.mobile       ?? 40 }px`,
			'--tl-padding-top-watch'     : `${ a.responsivePaddingTop?.smartwatch   ?? 24 }px`,
			'--tl-padding-bottom'        : `${ a.responsivePaddingBottom?.desktop    ?? a.paddingBottom ?? 80 }px`,
			'--tl-padding-bottom-tablet' : `${ a.responsivePaddingBottom?.tablet     ?? 60 }px`,
			'--tl-padding-bottom-mobile' : `${ a.responsivePaddingBottom?.mobile     ?? 40 }px`,
			'--tl-padding-bottom-watch'  : `${ a.responsivePaddingBottom?.smartwatch ?? 24 }px`,
			'--tl-title-size'            : `${ a.responsiveTitleSize?.desktop      ?? 20 }px`,
			'--tl-title-size-tablet'     : `${ a.responsiveTitleSize?.tablet       ?? 18 }px`,
			'--tl-title-size-mobile'     : `${ a.responsiveTitleSize?.mobile       ?? 16 }px`,
			'--tl-title-size-watch'      : `${ a.responsiveTitleSize?.smartwatch   ?? 14 }px`,
			'--tl-desc-size'             : `${ a.responsiveDescSize?.desktop       ?? 15 }px`,
			'--tl-desc-size-tablet'      : `${ a.responsiveDescSize?.tablet        ?? 14 }px`,
			'--tl-desc-size-mobile'      : `${ a.responsiveDescSize?.mobile        ?? 13 }px`,
			'--tl-desc-size-watch'       : `${ a.responsiveDescSize?.smartwatch    ?? 12 }px`,
			'--tl-section-title-size'    : `${ a.responsiveSectionTitleSize?.desktop    ?? 42 }px`,
			'--tl-section-title-tablet'  : `${ a.responsiveSectionTitleSize?.tablet     ?? 34 }px`,
			'--tl-section-title-mobile'  : `${ a.responsiveSectionTitleSize?.mobile     ?? 26 }px`,
			'--tl-section-title-watch'   : `${ a.responsiveSectionTitleSize?.smartwatch ?? 22 }px`,
			backgroundColor : a.backgroundColor  || '#0a1628',
			color           : a.textColor        || '#ffffff',
		},
	} );

	const [ activeZone, setActiveZone ] = useState( null );
	const [ deviceType, setDeviceType ] = useState( 'desktop' );

	const addItem = () => {
		const newItems = [
			...items,
			{
				icon: 'circle',
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
					<DeviceSwitcher deviceType={ deviceType } setDeviceType={ setDeviceType } label={ __( 'Device' ) } />
					<RangeControl
						label={ __( 'Padding top (px)', 'timeline-block' ) }
						value={ getDeviceValue( a.responsivePaddingTop, deviceType, deviceType === 'desktop' ? ( a.paddingTop ?? 80 ) : deviceType === 'tablet' ? 60 : deviceType === 'mobile' ? 40 : 24 ) }
						onChange={ ( v ) => setAttributes( { responsivePaddingTop: updateDeviceAttribute( a.responsivePaddingTop, deviceType, v ) } ) }
						min={ 0 }
						max={ 200 }
					/>
					<RangeControl
						label={ __( 'Padding bottom (px)', 'timeline-block' ) }
						value={ getDeviceValue( a.responsivePaddingBottom, deviceType, deviceType === 'desktop' ? ( a.paddingBottom ?? 80 ) : deviceType === 'tablet' ? 60 : deviceType === 'mobile' ? 40 : 24 ) }
						onChange={ ( v ) => setAttributes( { responsivePaddingBottom: updateDeviceAttribute( a.responsivePaddingBottom, deviceType, v ) } ) }
						min={ 0 }
						max={ 200 }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Typography', 'timeline-block' ) } initialOpen={ false }>
					<DeviceSwitcher deviceType={ deviceType } setDeviceType={ setDeviceType } label={ __( 'Device' ) } />
					<RangeControl
						label={ __( 'Section title (px)', 'timeline-block' ) }
						value={ getDeviceValue( a.responsiveSectionTitleSize, deviceType, deviceType === 'desktop' ? 42 : deviceType === 'tablet' ? 34 : deviceType === 'mobile' ? 26 : 22 ) }
						onChange={ ( v ) => setAttributes( { responsiveSectionTitleSize: updateDeviceAttribute( a.responsiveSectionTitleSize, deviceType, v ) } ) }
						min={ 16 }
						max={ 72 }
					/>
					<RangeControl
						label={ __( 'Item title (px)', 'timeline-block' ) }
						value={ getDeviceValue( a.responsiveTitleSize, deviceType, deviceType === 'desktop' ? 20 : deviceType === 'tablet' ? 18 : deviceType === 'mobile' ? 16 : 14 ) }
						onChange={ ( v ) => setAttributes( { responsiveTitleSize: updateDeviceAttribute( a.responsiveTitleSize, deviceType, v ) } ) }
						min={ 10 }
						max={ 40 }
					/>
					<RangeControl
						label={ __( 'Description (px)', 'timeline-block' ) }
						value={ getDeviceValue( a.responsiveDescSize, deviceType, deviceType === 'desktop' ? 15 : deviceType === 'tablet' ? 14 : deviceType === 'mobile' ? 13 : 12 ) }
						onChange={ ( v ) => setAttributes( { responsiveDescSize: updateDeviceAttribute( a.responsiveDescSize, deviceType, v ) } ) }
						min={ 10 }
						max={ 28 }
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
				<div className={ `adaire-timeline__track ${ showConnector ? 'has-connector' : '' }` }>
					{ (items || []).map( ( item, index ) => {
						const side = index % 2 === 0 ? 'left' : 'right';
						return (
							<div
								className={ `adaire-timeline__item is-${ side }` }
								key={ index }
							>
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
									<NodeIcon icon={ item.icon } />
								</QuickZone>
								<div className="adaire-timeline__content">
									<RichText
										tagName="h3"
										className="adaire-timeline__title"
										value={ item.title }
										onChange={ ( value ) => updateItem( index, 'title', value ) }
										placeholder={ __( 'Milestone title', 'timeline-block' ) }
									/>
									<RichText
										tagName="p"
										className="adaire-timeline__description"
										value={ item.description }
										onChange={ ( value ) => updateItem( index, 'description', value ) }
										placeholder={ __( 'Milestone description', 'timeline-block' ) }
									/>
								</div>
								{ showArrows && (
									<span
										className={ `adaire-timeline__arrow${ side === 'left' ? '' : ' is-hidden' }` }
									/>
								) }
							</div>
						);
					} ) }
				</div>
			</div>
		</>
	);
}
