import { __ } from '@wordpress/i18n';

const LAYOUTS = [
	{
		value: 'standard',
		label: __( 'Standard columns', 'adaire-blocks' ),
		description: __(
			'Freeform content built with the block editor below — the classic approach.',
			'adaire-blocks'
		),
	},
	{
		value: 'tabbed',
		label: __( 'Tabbed / showcase', 'adaire-blocks' ),
		description: __(
			'A category list on the left; hovering or selecting a category swaps a grid of cards on the right.',
			'adaire-blocks'
		),
	},
	{
		value: 'showcase',
		label: __( 'Interactive drill-down', 'adaire-blocks' ),
		description: __(
			'One panel that slides through nested levels, with a breadcrumb trail back to any previous level.',
			'adaire-blocks'
		),
	},
	{
		value: 'gallery',
		label: __( 'Visual gallery', 'adaire-blocks' ),
		description: __( 'A flat grid of image cards.', 'adaire-blocks' ),
	},
	{
		value: 'link-list',
		label: __( 'Simple link list', 'adaire-blocks' ),
		description: __(
			'A flat, lightweight list of links.',
			'adaire-blocks'
		),
	},
];

export default function LayoutPicker( { value, onChange } ) {
	return (
		<div className="adaire-mpe-layout-picker">
			{ LAYOUTS.map( ( layout ) => (
				<label
					key={ layout.value }
					htmlFor={ `adaire-mpe-layout-${ layout.value }` }
					className={
						'adaire-mpe-layout-option' +
						( value === layout.value ? ' is-selected' : '' )
					}
				>
					<input
						id={ `adaire-mpe-layout-${ layout.value }` }
						type="radio"
						name="adaire-mpe-layout"
						value={ layout.value }
						checked={ value === layout.value }
						onChange={ () => onChange( layout.value ) }
					/>
					<span className="adaire-mpe-layout-option__label">
						{ layout.label }
					</span>
					<span className="adaire-mpe-layout-option__desc">
						{ layout.description }
					</span>
				</label>
			) ) }
		</div>
	);
}
