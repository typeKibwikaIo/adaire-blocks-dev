const DEVICES = [ 'desktop', 'tablet', 'mobile', 'smartwatch' ];

// CSS variable suffix convention shared across Adaire Blocks: "smartwatch" maps to "watch".
const suffixFor = ( device ) => ( device === 'smartwatch' ? 'watch' : device );

export const getUnitValue = ( value, fallbackValue, fallbackUnit ) =>
	`${ value?.value ?? fallbackValue }${ value?.unit ?? fallbackUnit }`;

// Resolves a per-device column count, staying backwards compatible with a
// possible legacy flat-number shape (a single number applied to every device).
export const getColumnsForDevice = ( columns, device, fallbackValue = 4 ) => {
	if ( columns === null || columns === undefined ) {
		return fallbackValue;
	}

	if ( typeof columns === 'number' ) {
		return columns;
	}

	const deviceValue = columns[ device ];
	if ( typeof deviceValue === 'number' ) {
		return deviceValue;
	}

	return fallbackValue;
};

const DEFAULT_COLUMNS = { desktop: 4, tablet: 3, mobile: 2, smartwatch: 1 };

export const getGalleryStyles = ( attributes ) => {
	const {
		columns,
		gap,
		aspectRatio,
		imageBorderRadius,
		containerMaxWidth,
		fontFamily,
		captionFontSize,
		captionFontWeight,
		captionLineHeight,
		captionLetterSpacing,
		captionTextTransform,
	} = attributes;

	const styles = {
		'--gb-columns': getColumnsForDevice( columns, 'desktop', DEFAULT_COLUMNS.desktop ),
		'--gb-gap': `${ gap ?? 16 }px`,
		'--gb-aspect-ratio': aspectRatio && aspectRatio !== 'auto' ? aspectRatio : 'auto',
		'--gb-radius': `${ imageBorderRadius ?? 8 }px`,
		'--container-max-width': getUnitValue( containerMaxWidth?.desktop, 1200, 'px' ),
		'--gb-font-family': fontFamily || 'inherit',
		'--gb-caption-font-size': `${ captionFontSize ?? 13 }px`,
		'--gb-caption-font-weight': captionFontWeight || '400',
		'--gb-caption-line-height': captionLineHeight || 'normal',
		'--gb-caption-letter-spacing': captionLetterSpacing || 'normal',
		'--gb-caption-text-transform': captionTextTransform || 'none',
	};

	DEVICES.filter( ( device ) => device !== 'desktop' ).forEach( ( device ) => {
		const suffix = suffixFor( device );
		styles[ `--gb-columns-${ suffix }` ] = getColumnsForDevice(
			columns,
			device,
			DEFAULT_COLUMNS[ device ]
		);
		styles[ `--container-max-width-${ suffix }` ] = getUnitValue(
			containerMaxWidth?.[ device ],
			100,
			'%'
		);
	} );

	return styles;
};

// Generates a reasonably unique id for a newly-added gallery image item
// (keyed off the media library attachment id, with a random suffix so two
// images added in the same tick — e.g. via a multi-select upload — never collide).
export const makeImageItemId = ( attachmentId ) =>
	`${ attachmentId }-${ Math.random().toString( 36 ).slice( 2, 8 ) }`;

export const mediaToImageItem = ( media ) => ( {
	id: makeImageItemId( media.id ),
	mediaId: media.id,
	url: media.url,
	alt: media.alt || '',
	caption: media.caption || '',
} );
