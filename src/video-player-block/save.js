import { RichText, useBlockProps } from '@wordpress/block-editor';
import { getOverlayColorRgba, getVimeoSrc, getVideoPlayerStyles, getYouTubeSrc } from './helpers';

const VideoOutput = ( { attributes } ) => {
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

export default function save( { attributes } ) {
const {
blockId,
containerMode,
showOverlayContent,
headline,
description,
overlayColor,
overlayOpacity,
headlineColor,
descriptionColor,
} = attributes;
const blockProps = useBlockProps.save( {
className: 'ad-video-player',
style: getVideoPlayerStyles( attributes ),
} );

// showOverlayContent defaults to false in block.json, so any block saved
// before this attribute existed resolves it to false here too — existing
// published Video Player content keeps rendering exactly as before, with
// no overlay/headline markup added.
return (
<div { ...blockProps } data-block-id={ blockId }>
<div className={ `ad-video-player__container ${ containerMode === 'constrained' ? 'is-constrained' : '' }${ showOverlayContent ? ' has-overlay' : '' }` }>
<div className="ad-video-player__content">
<VideoOutput attributes={ attributes } />
</div>
{ showOverlayContent && (
<>
<div
className="ad-video-player__overlay"
style={ { backgroundColor: getOverlayColorRgba( overlayColor, overlayOpacity ) } }
/>
<div className="ad-video-player__text">
{ ! RichText.isEmpty( headline ) && (
<RichText.Content
tagName="h2"
className="ad-video-player__headline"
value={ headline }
style={ { color: headlineColor || '#ffffff' } }
/>
) }
{ ! RichText.isEmpty( description ) && (
<RichText.Content
tagName="p"
className="ad-video-player__description"
value={ description }
style={ { color: descriptionColor || '#ffffff' } }
/>
) }
</div>
</>
) }
</div>
</div>
);
}


