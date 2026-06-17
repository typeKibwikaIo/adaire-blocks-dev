const DEVICES = [ 'desktop', 'tablet', 'mobile', 'smartwatch' ];
const SIDES = [ 'Top', 'Right', 'Bottom', 'Left' ];

export const getUnitValue = ( value, fallbackValue, fallbackUnit ) =>
	`${ value?.value ?? fallbackValue }${ value?.unit ?? fallbackUnit }`;

export const getVideoPlayerStyles = ( attributes ) => {
	const {
		containerMaxWidth,
		containerHeight,
		containerBorderRadius,
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
		'--container-height': getUnitValue( containerHeight, 315, 'px' ),
		'--container-border-radius': `${ containerBorderRadius ?? 20 }px`,
	};

	DEVICES.filter( ( device ) => device !== 'desktop' ).forEach( ( device ) => {
		styles[ `--container-max-width-${ device === 'smartwatch' ? 'watch' : device }` ] = getUnitValue(
			containerMaxWidth?.[ device ],
			100,
			'%'
		);
	} );

	SIDES.forEach( ( side ) => {
		const cssSide = side.toLowerCase();
		styles[ `margin${ side }` ] = `${ margins[ side ]?.desktop ?? 0 }px`;
		styles[ `padding${ side }` ] = `${ padding[ side ]?.desktop ?? 0 }px`;

		DEVICES.filter( ( device ) => device !== 'desktop' ).forEach( ( device ) => {
			const suffix = device === 'smartwatch' ? 'watch' : device;
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

export const getYouTubeSrc = ( { ytVideoId, mute, controls, loop, autoplay } ) =>
	`https://youtube.com/embed/${ ytVideoId }?mute=${ mute ? '1' : '0' }&controls=${ controls ? '1' : '0' }&loop=${ loop ? '1' : '0' }${ loop ? `&playlist=${ ytVideoId }` : '' }&autoplay=${ autoplay ? '1' : '0' }`;

export const getVimeoSrc = ( { vimeoVideoId, autoplay, mute, loop, controls } ) =>
	`https://player.vimeo.com/video/${ vimeoVideoId }?autoplay=${ autoplay ? '1' : '0' }&muted=${ mute ? '1' : '0' }&loop=${ loop ? '1' : '0' }&controls=${ controls ? '1' : '0' }&background=${ autoplay && mute && ! controls ? '1' : '0' }`;

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
