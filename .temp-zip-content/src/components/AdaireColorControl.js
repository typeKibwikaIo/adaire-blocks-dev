/**
 * AdaireColorControl — shared modern color control for every AdaireBlocks block.
 *
 * Wraps WordPress core <ColorPalette> so every "Appearance" color field gets the
 * same modern UI: a row of preset swatches, a "Custom color" button that opens the
 * full gradient/hex picker, the selected-color summary, and a "Clear" link.
 *
 * Drop-in replacement for the old hand-rolled `<input type="color">` pickers.
 *
 *   <AdaireColorControl
 *       label="Background"
 *       value={ attributes.backgroundColor }
 *       onChange={ ( v ) => setAttributes( { backgroundColor: v } ) }
 *   />
 */

import { ColorPalette } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './AdaireColorControl.scss';

// Shared preset palette shown as the swatch dots (matches the reference design).
export const ADAIRE_COLOR_PALETTE = [
	{ name: __( 'White' ),  color: '#ffffff' },
	{ name: __( 'Black' ),  color: '#000000' },
	{ name: __( 'Yellow' ), color: '#facc15' },
	{ name: __( 'Pink' ),   color: '#f0abfc' },
	{ name: __( 'Purple' ), color: '#4f46e5' },
	{ name: __( 'Gray' ),   color: '#6b7280' },
	{ name: __( 'Cream' ),  color: '#f5f5f0' },
	{ name: __( 'Slate' ),  color: '#1e293b' },
];

export default function AdaireColorControl( {
	label,
	value,
	onChange = () => {},
	clearable = true,
	enableAlpha = true,
	colors = ADAIRE_COLOR_PALETTE,
} ) {
	return (
		<div className="adaire-color-control">
			{ label ? (
				<span className="adaire-color-control__label">{ label }</span>
			) : null }
			<ColorPalette
				colors={ colors }
				value={ value }
				onChange={ ( next ) => onChange( next ?? '' ) }
				enableAlpha={ enableAlpha }
				clearable={ clearable }
				__experimentalIsRenderedInSidebar
			/>
		</div>
	);
}

