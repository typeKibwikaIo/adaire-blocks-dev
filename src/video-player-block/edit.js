import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import {
MediaUpload,
MediaUploadCheck,
RichText,
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
import DeviceSwitcher, { THREE_TIERS } from '../components/DeviceSwitcher';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import {
getBoxAttributes,
getBoxValues,
getContainerHeightForDevice,
getOverlayColorRgba,
getVimeoId,
getVimeoSrc,
getVideoPlayerStyles,
getYouTubeId,
getYouTubeSrc,
} from './helpers';
import './editor.scss';
import BoundColorPalette from '../components/BoundColorPalette';

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

// Whether the block currently has an actual video/media source selected.
// Mirrors what would end up in the iframe/video `src` for each videoType —
// used to decide when to show the "choose a video" placeholder instead of
// a blank/broken embed (no ID yet means an embed URL like
// "youtube.com/embed/?mute=0..." with nothing to play).
const isMediaConfigured = ( attributes ) => {
const { videoType, ytVideoId, vimeoVideoId, mediaFileUrl, videoFileUrl } = attributes;

if ( videoType === 'youtube' ) {
return !! ytVideoId;
}
if ( videoType === 'vimeo' ) {
return !! vimeoVideoId;
}
return !! ( mediaFileUrl || videoFileUrl );
};

// Editor-only empty state shown until a video/image source is chosen —
// mirrors the "Choose Your Video" placeholder pattern (badge + centered
// play button) instead of leaving the canvas showing a blank/broken embed.
const VideoChoosePlaceholder = () => (
<div className="ad-video-player__choose-placeholder">
<span className="ad-video-player__choose-badge">
<span className="ad-video-player__choose-badge-dot" aria-hidden="true" />
{ __( 'Video Placeholder', 'adaire-blocks' ) }
</span>
<div className="ad-video-player__choose-center">
<span className="ad-video-player__choose-play" aria-hidden="true">
<svg width="20" height="20" viewBox="0 0 24 24" fill="#111827"><path d="M8 5v14l11-7z" /></svg>
</span>
<p className="ad-video-player__choose-text">{ __( 'Choose your video', 'adaire-blocks' ) }</p>
</div>
</div>
);

// YouTube/Vimeo iframes routinely fail to load inside the block editor's own
// canvas iframe — YouTube throws "Error 153 / Video player configuration
// error" there specifically, while the exact same embed URL works fine once
// the page is published (a real embed can't reliably tell "editor sandbox
// iframe" from "an untrusted site framing us" from the outside, so YouTube
// blocks it defensively). Rather than fight that, the editor shows a static
// thumbnail preview instead of a live third-party iframe — YouTube's
// thumbnail URL is a predictable, no-auth image; Vimeo has no such pattern,
// so its thumbnail is fetched once via their public oEmbed endpoint.
const EditorRemotePreview = ( { attributes } ) => {
const { videoType, ytVideoId, vimeoVideoId } = attributes;
const [ vimeoThumb, setVimeoThumb ] = useState( '' );

useEffect( () => {
if ( videoType !== 'vimeo' || ! vimeoVideoId ) {
return;
}
let cancelled = false;
setVimeoThumb( '' );
fetch( `https://vimeo.com/api/oembed.json?url=${ encodeURIComponent( `https://vimeo.com/${ vimeoVideoId }` ) }` )
.then( ( res ) => ( res.ok ? res.json() : null ) )
.then( ( data ) => {
if ( ! cancelled && data?.thumbnail_url ) {
setVimeoThumb( data.thumbnail_url );
}
} )
.catch( () => {} );
return () => { cancelled = true; };
}, [ videoType, vimeoVideoId ] );

const thumbUrl = videoType === 'youtube' && ytVideoId
? `https://img.youtube.com/vi/${ ytVideoId }/hqdefault.jpg`
: videoType === 'vimeo'
? vimeoThumb
: '';

return (
<div className="ad-video-player__editor-remote-preview">
{ thumbUrl && (
<img
className="ad-video-player__editor-remote-thumb"
src={ thumbUrl }
alt=""
/>
) }
<div className="ad-video-player__choose-center">
<span className="ad-video-player__choose-play" aria-hidden="true">
<svg width="20" height="20" viewBox="0 0 24 24" fill="#111827"><path d="M8 5v14l11-7z" /></svg>
</span>
<p className="ad-video-player__choose-text">
{ __( 'Preview unavailable in the editor — plays normally once published', 'adaire-blocks' ) }
</p>
</div>
</div>
);
};

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

if ( ! isMediaConfigured( attributes ) ) {
return <VideoChoosePlaceholder />;
}

if ( videoType === 'youtube' || videoType === 'vimeo' ) {
return <EditorRemotePreview attributes={ attributes } />;
}

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

return (
<img
src={ mediaFileUrl || videoFileUrl }
alt=""
loading="lazy"
style={ { width: '100%', height: 'auto' } }
/>
);
};

// Editor-canvas overlay + headline/description, shown over the video preview
// when showOverlayContent is on — mirrors what save.js renders on the front
// end, but with RichText (editable) fields instead of RichText.Content.
const OverlayContent = ( { attributes, setAttributes } ) => {
const {
showOverlayContent,
headline,
description,
overlayColor,
overlayOpacity,
headlineColor,
descriptionColor,
} = attributes;

if ( ! showOverlayContent ) {
return null;
}

return (
<>
<div
className="ad-video-player__overlay"
style={ { backgroundColor: getOverlayColorRgba( overlayColor, overlayOpacity ) } }
/>
<div className="ad-video-player__text">
<RichText
tagName="h2"
className="ad-video-player__headline"
style={ { color: headlineColor || '#ffffff' } }
placeholder={ __( 'Your headline here', 'adaire-blocks' ) }
value={ headline }
onChange={ ( value ) => setAttributes( { headline: value } ) }
allowedFormats={ [] }
/>
<RichText
tagName="p"
className="ad-video-player__description"
style={ { color: descriptionColor || '#ffffff' } }
placeholder={ __( 'A short supporting line that introduces your video.', 'adaire-blocks' ) }
value={ description }
onChange={ ( value ) => setAttributes( { description: value } ) }
allowedFormats={ [] }
/>
</div>
</>
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
containerBorderEnabled,
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
showOverlayContent,
overlayColor,
overlayOpacity,
headlineColor,
descriptionColor,
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
const heightDefault = deviceType === 'desktop' || deviceType === 'tablet' ? 315 : 250;

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
<PanelBody section="style" priority="medium" title={ __( label, 'adaire-blocks' ) } initialOpen={ false }>
<DeviceSwitcher
label={ __( 'Device', 'adaire-blocks' ) }
deviceType={ deviceType }
setDeviceType={ setDeviceType }
tiers={ THREE_TIERS }
/>
<BoxControl
label={ __( label, 'adaire-blocks' ) }
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
label={ __( 'Video Player', 'adaire-blocks' ) }
instructions={ __(
'Set the initial width and height for your video. You can change these anytime from the Container Settings panel.',
'adaire-blocks'
) }
>
<div className="ad-video-player__setup">
<BaseControl label={ __( 'Width', 'adaire-blocks' ) } __nextHasNoMarginBottom>
<ButtonGroup>
{ [
{ label: __( 'Full Width', 'adaire-blocks' ), value: 'full' },
{ label: __( 'Constrained', 'adaire-blocks' ), value: 'constrained' },
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
<BaseControl label={ __( 'Height', 'adaire-blocks' ) } __nextHasNoMarginBottom>
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
{ __( 'Continue', 'adaire-blocks' ) }
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
<PanelBody section="layout" title={ __( 'Container Settings', 'adaire-blocks' ) } initialOpen>
<RangeControl
label={ __( 'Border Radius (px)', 'adaire-blocks' ) }
value={ containerBorderRadius }
onChange={ ( value ) => setAttributes( { containerBorderRadius: Number( value ) } ) }
min={ 0 }
max={ 100 }
/>
<BaseControl label={ __( 'Background Color', 'adaire-blocks' ) } __nextHasNoMarginBottom>
<BoundColorPalette
value={containerBackgroundColor || ""}
onChange={ ( v ) => setAttributes( { containerBackgroundColor: v || '' } ) }
/>
<Button onClick={ () => setAttributes( { containerBackgroundColor: '' } ) } isSmall style={ { marginTop: '8px' } }>
{ __( 'Reset (transparent)', 'adaire-blocks' ) }
</Button>
</BaseControl>
<ToggleControl
label={ __( 'Show Border', 'adaire-blocks' ) }
checked={ !! containerBorderEnabled }
onChange={ ( value ) => setAttributes( { containerBorderEnabled: value } ) }
help={ __( 'Off by default so an old Border Width/Color value never shows unexpectedly.', 'adaire-blocks' ) }
/>
{ containerBorderEnabled && (
<>
<BaseControl label={ __( 'Border Color', 'adaire-blocks' ) } __nextHasNoMarginBottom>
<BoundColorPalette
value={containerBorderColor || ""}
onChange={ ( v ) => setAttributes( { containerBorderColor: v || '' } ) }
/>
<Button onClick={ () => setAttributes( { containerBorderColor: '' } ) } isSmall style={ { marginTop: '8px' } }>
{ __( 'Reset (none)', 'adaire-blocks' ) }
</Button>
</BaseControl>
<RangeControl
label={ __( 'Border Width (px)', 'adaire-blocks' ) }
value={ containerBorderWidth ?? 0 }
onChange={ ( value ) => setAttributes( { containerBorderWidth: Number( value ) } ) }
min={ 0 }
max={ 20 }
/>
</>
) }
<RangeControl
label={ __( 'Shadow Intensity', 'adaire-blocks' ) }
value={ containerShadowIntensity ?? 0 }
onChange={ ( value ) => setAttributes( { containerShadowIntensity: value } ) }
min={ 0 }
max={ 1 }
step={ 0.05 }
/>
<div className="ad-video-player__control-group">
<DeviceSwitcher
label={ __( 'Container Height', 'adaire-blocks' ) }
deviceType={ deviceType }
setDeviceType={ setDeviceType }
tiers={ THREE_TIERS }
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
{ label: __( 'Full Width', 'adaire-blocks' ), value: 'full' },
{ label: __( 'Constrained', 'adaire-blocks' ), value: 'constrained' },
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
label={ __( 'Max Width', 'adaire-blocks' ) }
deviceType={ deviceType }
setDeviceType={ setDeviceType }
tiers={ THREE_TIERS }
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
<PanelBody section="content" title={ __( 'Video Settings', 'adaire-blocks' ) } initialOpen={ false }>
<SelectControl
label={ __( 'Insert As', 'adaire-blocks' ) }
value={ mediaKind || 'video' }
options={ [ { label: 'Video', value: 'video' }, { label: 'Image', value: 'image' } ] }
onChange={ ( value ) => setAttributes( { mediaKind: value } ) }
/>
<SelectControl
label={ __( 'Video Type', 'adaire-blocks' ) }
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
label={ __( 'Youtube Video URL (or ID)', 'adaire-blocks' ) }
value={ ytVideoUrl }
onChange={ ( value ) => setAttributes( { ytVideoId: getYouTubeId( value ), ytVideoUrl: value } ) }
/>
) }
{ videoType === 'vimeo' && (
<TextControl
label={ __( 'Vimeo Video URL (or ID)', 'adaire-blocks' ) }
value={ vimeoVideoUrl }
onChange={ ( value ) => setAttributes( { vimeoVideoId: getVimeoId( value ), vimeoVideoUrl: value } ) }
/>
) }
{ videoType === 'upload' && (
<>
<TextControl
label={ __( 'Remote URL', 'adaire-blocks' ) }
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
{ attributes.mediaFileUrl ? __( 'Replace file', 'adaire-blocks' ) : __( 'Upload/select file', 'adaire-blocks' ) }
</Button>
) }
/>
</MediaUploadCheck>
<Button isSecondary onClick={ sideloadMedia }>
{ __( 'Download locally', 'adaire-blocks' ) }
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
label={ __( label, 'adaire-blocks' ) }
checked={ checked }
onChange={ ( value ) => setAttributes( { [ key ]: value } ) }
/>
) ) }
</PanelBody>
<PanelBody section="content" title={ __( 'Overlay Content', 'adaire-blocks' ) } initialOpen={ false }>
<ToggleControl
label={ __( 'Show Headline & Overlay', 'adaire-blocks' ) }
checked={ !! showOverlayContent }
onChange={ ( value ) => setAttributes( { showOverlayContent: value } ) }
help={ __( 'Off by default so existing videos are unaffected. Adds a headline, description, and color overlay on top of the video — useful for a hero-style banner.', 'adaire-blocks' ) }
/>
{ showOverlayContent && (
<>
<TextControl
label={ __( 'Headline', 'adaire-blocks' ) }
value={ attributes.headline }
onChange={ ( value ) => setAttributes( { headline: value } ) }
/>
<TextControl
label={ __( 'Description', 'adaire-blocks' ) }
value={ attributes.description }
onChange={ ( value ) => setAttributes( { description: value } ) }
/>
<BaseControl label={ __( 'Overlay Color', 'adaire-blocks' ) } __nextHasNoMarginBottom>
<BoundColorPalette
value={ overlayColor || '#000000' }
onChange={ ( v ) => setAttributes( { overlayColor: v || '#000000' } ) }
/>
</BaseControl>
<RangeControl
label={ __( 'Overlay Opacity', 'adaire-blocks' ) }
value={ overlayOpacity ?? 0.4 }
onChange={ ( value ) => setAttributes( { overlayOpacity: value } ) }
min={ 0 }
max={ 1 }
step={ 0.05 }
/>
<BaseControl label={ __( 'Headline Color', 'adaire-blocks' ) } __nextHasNoMarginBottom>
<BoundColorPalette
value={ headlineColor || '#ffffff' }
onChange={ ( v ) => setAttributes( { headlineColor: v || '#ffffff' } ) }
/>
</BaseControl>
<BaseControl label={ __( 'Description Color', 'adaire-blocks' ) } __nextHasNoMarginBottom>
<BoundColorPalette
value={ descriptionColor || '#ffffff' }
onChange={ ( v ) => setAttributes( { descriptionColor: v || '#ffffff' } ) }
/>
</BaseControl>
</>
) }
</PanelBody>
{ renderSpacingControl( 'Margins', { top: 'marginTop', right: 'marginRight', bottom: 'marginBottom', left: 'marginLeft' } ) }
{ renderSpacingControl( 'Padding', { top: 'paddingTop', right: 'paddingRight', bottom: 'paddingBottom', left: 'paddingLeft' } ) }
</InspectorTabs>
<div { ...blockProps } data-block-id={ blockId }>
<div className={ `ad-video-player__container ${ containerMode === 'constrained' ? 'is-constrained' : '' }${ showOverlayContent ? ' has-overlay' : '' }` }>
<QuickZone
id="video-media"
label="Video"
activeZone={ activeZone }
setActiveZone={ setActiveZone }
content={
<>
<SelectControl
label={ __( 'Video Type', 'adaire-blocks' ) }
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
label={ __( 'Youtube Video URL (or ID)', 'adaire-blocks' ) }
value={ ytVideoUrl }
onChange={ ( value ) => setAttributes( { ytVideoId: getYouTubeId( value ), ytVideoUrl: value } ) }
/>
) }
{ videoType === 'vimeo' && (
<TextControl
label={ __( 'Vimeo Video URL (or ID)', 'adaire-blocks' ) }
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
{ attributes.mediaFileUrl ? __( 'Replace file', 'adaire-blocks' ) : __( 'Upload/select file', 'adaire-blocks' ) }
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
<OverlayContent attributes={ attributes } setAttributes={ setAttributes } />
</div>
</div>
</>
);
}


