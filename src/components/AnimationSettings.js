/**
 * AnimationSettings — shared scroll-entrance animation panel.
 *
 * Drop into any block's InspectorTabs as a Layout-tab panel:
 *   <AnimationSettings attributes={ attributes } setAttributes={ setAttributes } />
 *
 * Expects the block's own block.json to declare the attributes below
 * (animationEnabled, animationType, animationDuration, animationDelay,
 * animationEasing, animationDistance, animationThreshold, animationOnce,
 * animationReverseOnScrollOut), its save.js to emit them as
 * `data-animation-*` attributes on an element carrying the
 * `adaire-scroll-animate` class, and its view.js to call
 * `initScrollAnimation()` from `../components/scroll-animation-runtime`.
 * See row-block for the reference wiring.
 *
 * If the block already has its own `animationDuration`/`animationEasing`/etc.
 * attributes for something unrelated (e.g. flipcard-block's card-flip
 * mechanic), pass a `prefix` (e.g. `prefix="entrance"`) so this panel reads
 * and writes `entranceAnimationEnabled`, `entranceAnimationType`, … instead,
 * avoiding any collision. The `data-animation-*` attributes save.js emits on
 * the front end are unaffected either way — the runtime only cares about the
 * DOM, not the React attribute names.
 */
import { PanelBody, ToggleControl, SelectControl, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const ANIMATION_TYPE_OPTIONS = [
	{ label: __( 'Fade In', 'adaire-blocks' ), value: 'fade-in' },
	{ label: __( 'Fade From Left', 'adaire-blocks' ), value: 'fade-left' },
	{ label: __( 'Fade From Right', 'adaire-blocks' ), value: 'fade-right' },
	{ label: __( 'Fly Up', 'adaire-blocks' ), value: 'fly-up' },
	{ label: __( 'Fly Down', 'adaire-blocks' ), value: 'fly-down' },
	{ label: __( 'Fly From Left', 'adaire-blocks' ), value: 'fly-left' },
	{ label: __( 'Fly From Right', 'adaire-blocks' ), value: 'fly-right' },
	{ label: __( 'Grow In', 'adaire-blocks' ), value: 'grow' },
	{ label: __( 'Shrink In', 'adaire-blocks' ), value: 'shrink' },
	{ label: __( 'Bounce In', 'adaire-blocks' ), value: 'bounce' },
	{ label: __( 'Blur In', 'adaire-blocks' ), value: 'blur-in' },
];

const EASING_OPTIONS = [
	{ label: __( 'Ease Out', 'adaire-blocks' ), value: 'ease-out' },
	{ label: __( 'Ease In', 'adaire-blocks' ), value: 'ease-in' },
	{ label: __( 'Ease In Out', 'adaire-blocks' ), value: 'ease-in-out' },
	{ label: __( 'Linear', 'adaire-blocks' ), value: 'linear' },
	{ label: __( 'Bounce (overshoot)', 'adaire-blocks' ), value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
	{ label: __( 'Smooth', 'adaire-blocks' ), value: 'cubic-bezier(0.25, 1, 0.5, 1)' },
];

const FIELD_NAMES = [
	'animationEnabled',
	'animationType',
	'animationDuration',
	'animationDelay',
	'animationEasing',
	'animationDistance',
	'animationThreshold',
	'animationOnce',
	'animationReverseOnScrollOut',
];

const DEFAULTS = {
	animationEnabled: false,
	animationType: 'fade-in',
	animationDuration: 1000,
	animationDelay: 0,
	animationEasing: 'ease-out',
	animationDistance: 50,
	animationThreshold: 0.2,
	animationOnce: false,
	animationReverseOnScrollOut: false,
};

function prefixedKey( name, prefix ) {
	if ( ! prefix ) {
		return name;
	}
	return `${ prefix }${ name.charAt( 0 ).toUpperCase() }${ name.slice( 1 ) }`;
}

export default function AnimationSettings( {
	attributes,
	setAttributes,
	title,
	initialOpen = false,
	prefix = '',
} ) {
	// Build { animationEnabled: <value>, … } read from the (possibly
	// prefixed) attribute keys, falling back to this panel's own defaults.
	const values = {};
	FIELD_NAMES.forEach( ( name ) => {
		const attrKey = prefixedKey( name, prefix );
		values[ name ] = attributes[ attrKey ] ?? DEFAULTS[ name ];
	} );

	const set = ( name, value ) => {
		setAttributes( { [ prefixedKey( name, prefix ) ]: value } );
	};

	const {
		animationEnabled,
		animationType,
		animationDuration,
		animationDelay,
		animationEasing,
		animationDistance,
		animationThreshold,
		animationOnce,
		animationReverseOnScrollOut,
	} = values;

	return (
		<PanelBody section="layout" title={ title || __( 'Animation', 'adaire-blocks' ) } initialOpen={ initialOpen }>
			<ToggleControl
				label={ __( 'Animate on scroll', 'adaire-blocks' ) }
				checked={ animationEnabled }
				onChange={ ( value ) => set( 'animationEnabled', value ) }
				help={ __( 'Plays an entrance animation the first time this block scrolls into view.', 'adaire-blocks' ) }
			/>
			{ animationEnabled && (
				<>
					<SelectControl
						label={ __( 'Animation Type', 'adaire-blocks' ) }
						value={ animationType }
						options={ ANIMATION_TYPE_OPTIONS }
						onChange={ ( value ) => set( 'animationType', value ) }
					/>
					<RangeControl
						label={ __( 'Duration (ms)', 'adaire-blocks' ) }
						value={ animationDuration }
						onChange={ ( value ) => set( 'animationDuration', value ) }
						min={ 100 }
						max={ 3000 }
						step={ 50 }
					/>
					<RangeControl
						label={ __( 'Delay (ms)', 'adaire-blocks' ) }
						value={ animationDelay }
						onChange={ ( value ) => set( 'animationDelay', value ) }
						min={ 0 }
						max={ 2000 }
						step={ 50 }
					/>
					<SelectControl
						label={ __( 'Easing', 'adaire-blocks' ) }
						value={ animationEasing }
						options={ EASING_OPTIONS }
						onChange={ ( value ) => set( 'animationEasing', value ) }
					/>
					<RangeControl
						label={ __( 'Distance (px)', 'adaire-blocks' ) }
						value={ animationDistance }
						onChange={ ( value ) => set( 'animationDistance', value ) }
						min={ 10 }
						max={ 200 }
						help={ __( 'How far the block travels for slide/fly animation types.', 'adaire-blocks' ) }
					/>
					<RangeControl
						label={ __( 'Scroll Trigger Threshold', 'adaire-blocks' ) }
						value={ animationThreshold }
						onChange={ ( value ) => set( 'animationThreshold', value ) }
						min={ 0 }
						max={ 1 }
						step={ 0.05 }
						help={ __( 'How much of the block must be visible before it animates in (0 = as soon as it appears, 1 = fully visible).', 'adaire-blocks' ) }
					/>
					<ToggleControl
						label={ __( 'Only animate once', 'adaire-blocks' ) }
						checked={ animationOnce }
						onChange={ ( value ) => set( 'animationOnce', value ) }
						help={ __( 'When off, the animation can replay every time the block re-enters the viewport.', 'adaire-blocks' ) }
					/>
					{ ! animationOnce && (
						<ToggleControl
							label={ __( 'Reverse when scrolled out of view', 'adaire-blocks' ) }
							checked={ animationReverseOnScrollOut }
							onChange={ ( value ) => set( 'animationReverseOnScrollOut', value ) }
						/>
					) }
				</>
			) }
		</PanelBody>
	);
}
