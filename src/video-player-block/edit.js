import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import {
MediaUpload,
MediaUploadCheck,
useBlockProps, ColorPalette,
} from '@wordpress/block-editor';
import {
__experimentalBoxControl as BoxControl,
BaseControl,
Button,
ButtonGroup,
PanelBody,
Placeholder,
RangeControl,
SelectControl,
TextControl,
ToggleControl,
} from '@wordpress/components';
import DeviceSwitcher from '../components/DeviceSwitcher';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import {
getBoxAttributes,
getBoxValues,
getContainerHeightForDevice,
getVimeoId,
getVimeoSrc,
getVideoPlayerStyles,
getYouTubeId,
getYouTubeSrc,
} from './helpers';
import './editor.scss';

const UNITS = [ 'px', '%', 'rem', 'vw' ];
const HEIGHT_UNITS = [ 'px', 'rem', 'vw' ];

const UnitButtons = ( { units = UNITS, value, onChange } ) => (
<ButtonGroup>
{ units.map( ( unit ) => (
<Button
key={ unit }
isPrimary={ value === unit }
isSecondary={ value !== unit }
onClick={ () => onChange( unit ) }
>
{ unit }
</Button>
) ) }
</ButtonGroup>
);

const VideoPreview = ( { attributes } ) => {
const {
autoplay,
controls,
loop,
mediaFileUrl,
mediaKind,
mute,
videoFileUrl,
videoType,
} = attributes;

if ( videoType === 'upload' && mediaKind === 'video' ) {
return (
<video
width="100%"
height="100%"
src={ mediaFileUrl || videoFileUrl }
controls={ !! controls }
muted={ !! mute }
autoPlay={ !! autoplay }
loop={ !! loop }
playsInline
preload="metadata"
/>
);
}

if ( videoType === 'upload' && mediaKind === 'image' ) {
return (
<img
src={ mediaFileUrl || videoFileUrl }
alt=""
loading="lazy"
style={ { width: '100%', height: 'auto' } }
/>
);
}

if ( videoType === 'youtube' ) {
return (
<iframe
width="100%"
height="100%"
src={ getYouTubeSrc( attributes ) }
title="YouTube video player"
allow="autoplay; fullscreen;"
frameBorder="0"
allowFullScreen
loading="lazy"
/>
);
}

return (
<iframe
src={ getVimeoSrc( attributes ) }
width="100%"
height="100%"
frameBorder="0"
allow="autoplay; fullscreen; picture-in-picture"
allowFullScreen
loading="lazy"
/>
);
};

export default function Edit( { attributes, setAttributes, clientId } ) {
const [ deviceType, setDeviceType ] = useState( 'desktop' );
const [ activeZone, setActiveZone ] = useState( null );
const {
blockId,
dimensionsConfigured,
containerBorderRadius,
containerBackgroundColor,
containerBorderColor,
containerBorderWidth,
containerShadowIntensity,
containerHeight,
containerMaxWidth,
containerMode,
mediaKind,
mediaRemoteUrl,
videoType,
vimeoVideoUrl,
ytVideoUrl,
autoplay,
mute,
controls,
loop,
} = attributes;

useEffect( () => {
if ( ! blockId ) {
// First time this block instance is ever mounted (freshly inserted,
// never saved before) — flag it so the initial size prompt shows once.
setAttributes( { blockId: clientId, dimensionsConfigured: false } );
}
}, [ blockId, clientId, setAttributes ] );

const blockProps = useBlockProps( {
className: 'ad-video-player',
style: getVideoPlayerStyles( attributes ),
} );
const currentMaxWidth = containerMaxWidth?.[ deviceType ] || {};
const maxWidthDefault = deviceType === 'desktop' ? 1200 : 100;
const currentHeight = getContainerHeightForDevice( containerHeight, deviceType );
const heightDefault = deviceType === 'desktop' || deviceType === 'tablet' ? 315 : deviceType === 'mobile' ? 250 : 200;

const sideloadMedia = async () => {
if ( ! mediaRemoteUrl ) {
return;
}

const form = new FormData();
form.append( 'action', 'adaire_sideload_media' );
form.append( 'url', mediaRemoteUrl );
form.append( 'media_kind', mediaKind || 'video' );

const response = await fetch(
window.ajaxurl || '/wp-admin/admin-ajax.php',
{ method: 'POST', body: form, credentials: 'same-origin' }
);
const json = await response.json();

if ( json?.success ) {
setAttributes( {
mediaFileId: json.data.id,
mediaFileUrl: json.data.url,
} );
return;
}

window.alert( 'Download failed. Check console for details.' );
};

const renderSpacingControl = ( label, names ) => {
const currentValues = {
top: attributes[ names.top ],
right: attributes[ names.right ],
bottom: attributes[ names.bottom ],
left: attributes[ names.left ],
};

return (
<PanelBody title={ __( label, 'video-player-block' ) } initialOpen={ false }>
<DeviceSwitcher
label={ __( 'Device', 'video-player-block' ) }
deviceType={ deviceType }
setDeviceType={ setDeviceType }
/>
<BoxControl
label={ __( label, 'video-player-block' ) }
values={ getBoxValues( currentValues, deviceType ) }
onChange={ ( value ) =>
setAttributes(
getBoxAttributes( names, currentValues, deviceType, value )
)
}
/>
</PanelBody>
);
};

if ( ! dimensionsConfigured ) {
const desktopMaxWidth = containerMaxWidth?.desktop || {};

return (
<div { ...blockProps } data-block-id={ blockId }>
<div
className={ `ad-video-player__container ad-video-player__setup-container ${ containerMode === 'constrained' ? 'is-constrained' : '' }` }
>
<Placeholder
label={ __( 'Video Player', 'video-player-block' ) }
instructions={ __(
'Set the initial width and height for your video. You can change these anytime from the Container Settings panel.',
'video-player-block'
) }
>
<div className="ad-video-player__setup">
<BaseControl label={ __( 'Width', 'video-player-block' ) } __nextHasNoMarginBottom>
<ButtonGroup>
{ [
{ label: __( 'Full Width', 'video-player-block' ), value: 'full' },
{ label: __( 'Constrained', 'video-player-block' ), value: 'constrained' },
].map( ( option ) => (
<Button
key={ option.value }
isPrimary={ containerMode === option.value }
isSecondary={ containerMode !== option.value }
onClick={ () => setAttributes( { containerMode: option.value } ) }
>
{ option.label }
</Button>
) ) }
</ButtonGroup>
{ containerMode === 'constrained' && (
<div className="ad-video-player__control-row">
<TextControl
type="number"
value={ desktopMaxWidth.value ?? 1200 }
onChange={ ( value ) =>
setAttributes( {
containerMaxWidth: {
...( containerMaxWidth || {} ),
desktop: { ...desktopMaxWidth, value: Number( value ) },
},
} )
}
/>
<UnitButtons
value={ desktopMaxWidth.unit || 'px' }
onChange={ ( unit ) =>
setAttributes( {
containerMaxWidth: {
...( containerMaxWidth || {} ),
desktop: { ...desktopMaxWidth, unit },
},
} )
}
/>
</div>
) }
</BaseControl>
<BaseControl label={ __( 'Height', 'video-player-block' ) } __nextHasNoMarginBottom>
<div className="ad-video-player__control-row">
<TextControl
type="number"
value={ currentHeight.value ?? heightDefault }
onChange={ ( value ) =>
setAttributes( {
containerHeight: {
...( containerHeight || {} ),
desktop: { ...currentHeight, value: Number( value ) },
},
} )
}
/>
<UnitButtons
units={ HEIGHT_UNITS }
value={ currentHeight.unit || 'px' }
onChange={ ( unit ) =>
setAttributes( {
containerHeight: {
...( containerHeight || {} ),
desktop: { ...currentHeight, unit },
},
} )
}
/>
</div>
</BaseControl>
<Button
variant="primary"
onClick={ () => setAttributes( { dimensionsConfigured: true } ) }
>
{ __( 'Continue', 'video-player-block' ) }
</Button>
</div>
</Placeholder>
</div>
</div>
);
}

return (
<>
<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
<PanelBody title={ __( 'Container Settings', 'video-player-block' ) } initialOpen>
<RangeControl
label={ __( 'Border Radius (px)', 'video-player-block' ) }
value={ containerBorderRadius }
onChange={ ( value ) => setAttributes( { containerBorderRadius: Number( value ) } ) }
min={ 0 }
max={ 100 }
/>
<BaseControl label={ __( 'Background Color', 'video-player-block' ) } __nextHasNoMarginBottom>
<ColorPalette
value={containerBackgroundColor || ""}
onChange={ ( v ) => setAttributes( { containerBackgroundColor: v || '' } ) }
/>
<Button onClick={ () => setAttributes( { containerBackgroundColor: '' } ) } isSmall style={ { marginTop: '8px' } }>
{ __( 'Reset (transparent)', 'video-player-block' ) }
</Button>
</BaseControl>
<BaseControl label={ __( 'Border Color', 'video-player-block' ) } __nextHasNoMarginBottom>
<ColorPalette
value={containerBorderColor || ""}
onChange={ ( v ) => setAttributes( { containerBorderColor: v || '' } ) }
/>
<Button onClick={ () => setAttributes( { containerBorderColor: '' } ) } isSmall style={ { marginTop: '8px' } }>
{ __( 'Reset (none)', 'video-player-block' ) }
</Button>
</BaseControl>
<RangeControl
label={ __( 'Border Width (px)', 'video-player-block' ) }
value={ containerBorderWidth ?? 0 }
onChange={ ( value ) => setAttributes( { containerBorderWidth: Number( value ) } ) }
min={ 0 }
max={ 20 }
/>
<RangeControl
label={ __( 'Shadow Intensity', 'video-player-block' ) }
value={ containerShadowIntensity ?? 0 }
onChange={ ( value ) => setAttributes( { containerShadowIntensity: value } ) }
min={ 0 }
max={ 1 }
step={ 0.05 }
/>
<div className="ad-video-player__control-group">
<DeviceSwitcher
label={ __( 'Container Height', 'video-player-block' ) }
deviceType={ deviceType }
setDeviceType={ setDeviceType }
/>
<TextControl
type="number"
value={ currentHeight.value ?? heightDefault }
onChange={ ( value ) =>
setAttributes( {
containerHeight: {
...( containerHeight || {} ),
[ deviceType ]: { ...currentHeight, value: Number( value ) },
},
} )
}
/>
<UnitButtons
units={ HEIGHT_UNITS }
value={ currentHeight.unit || 'px' }
onChange={ ( unit ) =>
setAttributes( {
containerHeight: {
...( containerHeight || {} ),
[ deviceType ]: { ...currentHeight, unit },
},
} )
}
/>
</div>
<ButtonGroup>
{ [
{ label: __( 'Full Width', 'video-player-block' ), value: 'full' },
{ label: __( 'Constrained', 'video-player-block' ), value: 'constrained' },
].map( ( option ) => (
<Button
key={ option.value }
isPrimary={ containerMode === option.value }
isSecondary={ containerMode !== option.value }
onClick={ () => setAttributes( { containerMode: option.value } ) }
>
{ option.label }
</Button>
) ) }
</ButtonGroup>
{ containerMode === 'constrained' && (
<div className="ad-video-player__control-group">
<DeviceSwitcher
label={ __( 'Max Width', 'video-player-block' ) }
deviceType={ deviceType }
setDeviceType={ setDeviceType }
/>
<TextControl
type="number"
value={ currentMaxWidth.value ?? maxWidthDefault }
onChange={ ( value ) =>
setAttributes( {
containerMaxWidth: {
...( containerMaxWidth || {} ),
[ deviceType ]: { ...currentMaxWidth, value: Number( value ) },
},
} )
}
/>
<UnitButtons
value={ currentMaxWidth.unit || ( deviceType === 'desktop' ? 'px' : '%' ) }
onChange={ ( unit ) =>
setAttributes( {
containerMaxWidth: {
...( containerMaxWidth || {} ),
[ deviceType ]: { ...currentMaxWidth, unit },
},
} )
}
/>
</div>
) }
</PanelBody>
<PanelBody title={ __( 'Video Settings', 'video-player-block' ) } initialOpen={ false }>
<SelectControl
label={ __( 'Insert As', 'video-player-block' ) }
value={ mediaKind || 'video' }
options={ [ { label: 'Video', value: 'video' }, { label: 'Image', value: 'image' } ] }
onChange={ ( value ) => setAttributes( { mediaKind: value } ) }
/>
<SelectControl
label={ __( 'Video Type', 'video-player-block' ) }
value={ videoType }
options={ [
{ label: 'YouTube', value: 'youtube' },
{ label: 'Vimeo', value: 'vimeo' },
{ label: 'Upload/Local', value: 'upload' },
] }
onChange={ ( value ) => setAttributes( { videoType: value } ) }
/>
{ videoType === 'youtube' && (
<TextControl
label={ __( 'Youtube Video URL (or ID)', 'video-player-block' ) }
value={ ytVideoUrl }
onChange={ ( value ) => setAttributes( { ytVideoId: getYouTubeId( value ), ytVideoUrl: value } ) }
/>
) }
{ videoType === 'vimeo' && (
<TextControl
label={ __( 'Vimeo Video URL (or ID)', 'video-player-block' ) }
value={ vimeoVideoUrl }
onChange={ ( value ) => setAttributes( { vimeoVideoId: getVimeoId( value ), vimeoVideoUrl: value } ) }
/>
) }
{ videoType === 'upload' && (
<>
<TextControl
label={ __( 'Remote URL', 'video-player-block' ) }
value={ mediaRemoteUrl || '' }
onChange={ ( value ) => setAttributes( { mediaRemoteUrl: value } ) }
placeholder={ mediaKind === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/video.mp4' }
/>
<div className="ad-video-player__control-row">
<MediaUploadCheck>
<MediaUpload
allowedTypes={ mediaKind === 'image' ? [ 'image' ] : [ 'video' ] }
onSelect={ ( media ) => setAttributes( {
mediaFileId: media?.id || 0,
mediaFileUrl: media?.url || '',
videoFileId: media?.id || 0,
videoFileUrl: media?.url || '',
} ) }
render={ ( { open } ) => (
<Button isSecondary onClick={ open }>
{ attributes.mediaFileUrl ? __( 'Replace file', 'video-player-block' ) : __( 'Upload/select file', 'video-player-block' ) }
</Button>
) }
/>
</MediaUploadCheck>
<Button isSecondary onClick={ sideloadMedia }>
{ __( 'Download locally', 'video-player-block' ) }
</Button>
</div>
</>
) }
{ [
[ 'autoplay', 'Autoplay', autoplay ],
[ 'mute', 'Mute', mute ],
[ 'controls', 'Controls', controls ],
[ 'loop', 'Loop', loop ],
].map( ( [ key, label, checked ] ) => (
<ToggleControl
key={ key }
label={ __( label, 'video-player-block' ) }
checked={ checked }
onChange={ ( value ) => setAttributes( { [ key ]: value } ) }
/>
) ) }
</PanelBody>
{ renderSpacingControl( 'Margins', { top: 'marginTop', right: 'marginRight', bottom: 'marginBottom', left: 'marginLeft' } ) }
{ renderSpacingControl( 'Padding', { top: 'paddingTop', right: 'paddingRight', bottom: 'paddingBottom', left: 'paddingLeft' } ) }
</InspectorTabs>
<div { ...blockProps } data-block-id={ blockId }>
<div className={ `ad-video-player__container ${ containerMode === 'constrained' ? 'is-constrained' : '' }` }>
<QuickZone
id="video-media"
label="Video"
activeZone={ activeZone }
setActiveZone={ setActiveZone }
content={
<>
<SelectControl
label={ __( 'Video Type', 'video-player-block' ) }
value={ videoType }
options={ [
{ label: 'YouTube', value: 'youtube' },
{ label: 'Vimeo', value: 'vimeo' },
{ label: 'Upload/Local', value: 'upload' },
] }
onChange={ ( value ) => setAttributes( { videoType: value } ) }
/>
{ videoType === 'youtube' && (
<TextControl
label={ __( 'Youtube Video URL (or ID)', 'video-player-block' ) }
value={ ytVideoUrl }
onChange={ ( value ) => setAttributes( { ytVideoId: getYouTubeId( value ), ytVideoUrl: value } ) }
/>
) }
{ videoType === 'vimeo' && (
<TextControl
label={ __( 'Vimeo Video URL (or ID)', 'video-player-block' ) }
value={ vimeoVideoUrl }
onChange={ ( value ) => setAttributes( { vimeoVideoId: getVimeoId( value ), vimeoVideoUrl: value } ) }
/>
) }
{ videoType === 'upload' && (
<MediaUploadCheck>
<MediaUpload
allowedTypes={ mediaKind === 'image' ? [ 'image' ] : [ 'video' ] }
onSelect={ ( media ) => setAttributes( {
mediaFileId: media?.id || 0,
mediaFileUrl: media?.url || '',
videoFileId: media?.id || 0,
videoFileUrl: media?.url || '',
} ) }
render={ ( { open } ) => (
<Button isSecondary onClick={ open }>
{ attributes.mediaFileUrl ? __( 'Replace file', 'video-player-block' ) : __( 'Upload/select file', 'video-player-block' ) }
</Button>
) }
/>
</MediaUploadCheck>
) }
</>
}
>
<div className="ad-video-player__content">
<VideoPreview attributes={ attributes } />
</div>
</QuickZone>
</div>
</div>
</>
);
}


