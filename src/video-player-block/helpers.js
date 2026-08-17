const DEVICES = [ 'desktop', 'tablet', 'mobile' ];
const SIDES = [ 'Top', 'Right', 'Bottom', 'Left' ];

export const getUnitValue = ( value, fallbackValue, fallbackUnit ) =>
	`${ value?.value ?? fallbackValue }${ value?.unit ?? fallbackUnit }`;

// Resolves a per-device height value, while staying backwards compatible with
// content saved before height became responsive (a flat { value, unit } object
// applied to every device instead of a per-device map).
export const getContainerHeightForDevice = ( containerHeight, device, fallbackValue = 315, fallbackUnit = 'px' ) => {
	if ( ! containerHeight ) {
		return { value: fallbackValue, unit: fallbackUnit };
	}

	const deviceValue = containerHeight[ device ];
	if ( deviceValue && typeof deviceValue === 'object' && 'value' in deviceValue ) {
		return deviceValue;
	}

	// Legacy shape: a single flat { value, unit } applied to every device.
	if ( 'value' in containerHeight ) {
		return containerHeight;
	}

	return { value: fallbackValue, unit: fallbackUnit };
};

export const getVideoPlayerStyles = ( attributes ) => {
	const {
		containerMaxWidth,
		containerHeight,
		containerBorderRadius,
		containerBackgroundColor,
		containerBorderColor,
		containerBorderWidth,
		containerBorderEnabled,
		containerShadowIntensity,
		marginTop,
		marginRight,
		marginBottom,
		marginLeft,
		paddingTop,
		paddingRight,
		paddingBottom,
		paddingLeft,
	} = attributes;
	const margins = { Top: marginTop, Right: marginRight, Bottom: marginBottom, Left: marginLeft };
	const padding = { Top: paddingTop, Right: paddingRight, Bottom: paddingBottom, Left: paddingLeft };
	const styles = {
		'--container-max-width': getUnitValue( containerMaxWidth?.desktop, 1200, 'px' ),
		'--container-height': getUnitValue( getContainerHeightForDevice( containerHeight, 'desktop' ), 315, 'px' ),
		'--container-border-radius': `${ containerBorderRadius ?? 20 }px`,
		'--container-background-color': containerBackgroundColor || 'transparent',
		// Border only renders when explicitly enabled via the 'Show Border'
		// toggle. This is deliberate, not redundant with the 0/'' defaults
		// above: this block saves static markup, so containerBorderWidth/
		// containerBorderColor values set (even briefly, e.g. during earlier
		// testing/dev) before those defaults were corrected are permanently
		// baked into already-published posts and survive any future default
		// change. Gating on a brand-new boolean (which is undefined -> false
		// on every pre-existing post, since it never existed to be saved)
		// retroactively turns the border off everywhere until a user
		// explicitly opts back in on a given block.
		'--container-border-color': containerBorderEnabled ? ( containerBorderColor || 'transparent' ) : 'transparent',
		'--container-border-width': `${ containerBorderEnabled ? ( containerBorderWidth ?? 0 ) : 0 }px`,
		'--container-shadow-intensity': containerShadowIntensity ?? 0,
	};

	DEVICES.filter( ( device ) => device !== 'desktop' ).forEach( ( device ) => {
		const suffix = device;

		styles[ `--container-max-width-${ suffix }` ] = getUnitValue(
			containerMaxWidth?.[ device ],
			100,
			'%'
		);
		styles[ `--container-height-${ suffix }` ] = getUnitValue(
			getContainerHeightForDevice( containerHeight, device ),
			315,
			'px'
		);
	} );

	SIDES.forEach( ( side ) => {
		const cssSide = side.toLowerCase();
		styles[ `margin${ side }` ] = `${ margins[ side ]?.desktop ?? 0 }px`;
		styles[ `padding${ side }` ] = `${ padding[ side ]?.desktop ?? 0 }px`;

		DEVICES.filter( ( device ) => device !== 'desktop' ).forEach( ( device ) => {
			const suffix = device;
			styles[ `--margin-${ cssSide }-${ suffix }` ] = `${ margins[ side ]?.[ device ] ?? 0 }px`;
			styles[ `--padding-${ cssSide }-${ suffix }` ] = `${ padding[ side ]?.[ device ] ?? 0 }px`;
		} );
	} );

	return styles;
};

export const getYouTubeId = ( value = '' ) => {
	if ( value.includes( 'youtu.be/' ) ) {
		return value.split( 'youtu.be/' )[ 1 ].slice( 0, 11 );
	}

	if ( value.includes( 'watch' ) ) {
		return value.split( 'v=' )[ 1 ]?.slice( 0, 11 ) || '';
	}

	if ( value.includes( 'embed' ) ) {
		return value.split( 'embed/' )[ 1 ]?.slice( 0, 11 ) || '';
	}

	return value;
};

export const getVimeoId = ( value = '' ) => {
	if ( value.includes( 'vimeo.com/album/' ) ) {
		return value.match( /\/video\/(\d+)/ )?.[ 1 ] || '';
	}

	if ( value.includes( 'vimeo.com/groups/' ) ) {
		return value.match( /videos\/(\d+)/ )?.[ 1 ] || '';
	}

	if ( value.includes( 'player.vimeo.com/video/' ) ) {
		return value.split( 'player.vimeo.com/video/' )[ 1 ].split( '?' )[ 0 ];
	}

	return value.split( '/' ).pop()?.split( '#' )[ 0 ] || value;
};

// NOTE: must be the "www" host — youtube.com/embed/... (no www) 302-redirects,
// and that redirect hop happening inside an <iframe> is what was silently
// breaking autoplay (the player loads fine, but the ?autoplay=1 param doesn't
// survive the redirect, so it sits there paused until clicked).
export const getYouTubeSrc = ( { ytVideoId, mute, controls, loop, autoplay } ) =>
	`https://www.youtube.com/embed/${ ytVideoId }?mute=${ mute ? '1' : '0' }&controls=${ controls ? '1' : '0' }&loop=${ loop ? '1' : '0' }${ loop ? `&playlist=${ ytVideoId }` : '' }&autoplay=${ autoplay ? '1' : '0' }&playsinline=1`;

export const getVimeoSrc = ( { vimeoVideoId, autoplay, mute, loop, controls } ) =>
	`https://player.vimeo.com/video/${ vimeoVideoId }?autoplay=${ autoplay ? '1' : '0' }&muted=${ mute ? '1' : '0' }&loop=${ loop ? '1' : '0' }&controls=${ controls ? '1' : '0' }&background=${ autoplay && mute && ! controls ? '1' : '0' }`;

// Converts a hex color + a 0-1 opacity into an rgba() string for the overlay
// background. Falls back to a plain black overlay if the hex value is
// missing/malformed rather than producing an invalid CSS value.
export const getOverlayColorRgba = ( hex = '#000000', opacity = 0.4 ) => {
	const normalized = ( hex || '#000000' ).replace( '#', '' );
	const isShort = normalized.length === 3;
	const r = parseInt( isShort ? normalized[ 0 ] + normalized[ 0 ] : normalized.substring( 0, 2 ), 16 );
	const g = parseInt( isShort ? normalized[ 1 ] + normalized[ 1 ] : normalized.substring( 2, 4 ), 16 );
	const b = parseInt( isShort ? normalized[ 2 ] + normalized[ 2 ] : normalized.substring( 4, 6 ), 16 );

	if ( Number.isNaN( r ) || Number.isNaN( g ) || Number.isNaN( b ) ) {
		return `rgba(0, 0, 0, ${ opacity ?? 0.4 })`;
	}

	return `rgba(${ r }, ${ g }, ${ b }, ${ opacity ?? 0.4 })`;
};

export const getBoxValues = ( values, device ) => ( {
	top: `${ values.top?.[ device ] ?? 0 }px`,
	right: `${ values.right?.[ device ] ?? 0 }px`,
	bottom: `${ values.bottom?.[ device ] ?? 0 }px`,
	left: `${ values.left?.[ device ] ?? 0 }px`,
} );

export const getBoxAttributes = ( names, currentValues, device, value ) => ( {
	[ names.top ]: { ...( currentValues.top || {} ), [ device ]: parseInt( value.top ) || 0 },
	[ names.right ]: { ...( currentValues.right || {} ), [ device ]: parseInt( value.right ) || 0 },
	[ names.bottom ]: { ...( currentValues.bottom || {} ), [ device ]: parseInt( value.bottom ) || 0 },
	[ names.left ]: { ...( currentValues.left || {} ), [ device ]: parseInt( value.left ) || 0 },
} );
