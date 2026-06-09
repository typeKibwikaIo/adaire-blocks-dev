import { useBlockProps } from '@wordpress/block-editor';
import { getVimeoSrc, getVideoPlayerStyles, getYouTubeSrc } from './helpers';

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
const { blockId, containerMode } = attributes;
const blockProps = useBlockProps.save( {
className: 'ad-video-player',
style: getVideoPlayerStyles( attributes ),
} );

return (
<div { ...blockProps } data-block-id={ blockId }>
<div className={ `ad-video-player__container ${ containerMode === 'constrained' ? 'is-constrained' : '' }` }>
<div className="ad-video-player__content">
<VideoOutput attributes={ attributes } />
</div>
</div>
</div>
);
}


