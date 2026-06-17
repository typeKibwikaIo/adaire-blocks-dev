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

	const blockProps = useBlockProps( {
		className: `adaire-timeline is-${ orientation }`,
	} );

	const [ activeZone, setActiveZone ] = useState( null );

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
				<PanelBody
					title={ `Items (${ items.length })` }
					initialOpen={ false }
				>
					{ items.map( ( item, index ) => (
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
					{ items.map( ( item, index ) => {
						const side = index % 2 === 0 ? 'left' : 'right';
						return (
							<div
								className={ `adaire-timeline__item is-${ side }` }
								key={ index }
							>
								<QuickZone
									isActive={ activeZone === index }
									onActivate={ () => setActiveZone( index ) }
									onDeactivate={ () => setActiveZone( null ) }
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
