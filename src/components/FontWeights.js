import { __ } from '@wordpress/i18n';

// Shared numeric font-weight option list used by SelectControl fields
// across blocks (currently horizontal-scroll-carousel-block and
// horizontal-scroll-card-block).
export const FONT_WEIGHTS = [
	{ label: __( '100 — Thin', 'adaire-blocks' ), value: '100' },
	{ label: __( '200 — Extra Light', 'adaire-blocks' ), value: '200' },
	{ label: __( '300 — Light', 'adaire-blocks' ), value: '300' },
	{ label: __( '400 — Regular', 'adaire-blocks' ), value: '400' },
	{ label: __( '500 — Medium', 'adaire-blocks' ), value: '500' },
	{ label: __( '600 — Semi Bold', 'adaire-blocks' ), value: '600' },
	{ label: __( '700 — Bold', 'adaire-blocks' ), value: '700' },
	{ label: __( '800 — Extra Bold', 'adaire-blocks' ), value: '800' },
	{ label: __( '900 — Black', 'adaire-blocks' ), value: '900' },
];

export default FONT_WEIGHTS;
