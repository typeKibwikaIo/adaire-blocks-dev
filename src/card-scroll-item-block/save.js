import { useBlockProps, RichText, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        title,
        description,
        mediaType,
        mediaUrl,
        backgroundColor,
        headerTextColor,
        shadowColor,
        shadowBlur,
        buttonAlignment,
        videoLoop,
        videoType,
        externalVideoUrl,
        responsiveMinHeight,
        responsiveTitleMarginBottom,
        responsiveDescriptionMarginBottom,
        previewText,
        textColor,
        imageBackgroundSize,
        imageBackgroundPosition,
    } = attributes;

    const blockProps = useBlockProps.save({
        className: 'adaire-card-scroll__card',
        style: {
            backgroundColor: backgroundColor,
            boxShadow: `0 4px ${shadowBlur}px -1px ${shadowColor}`,
            // Responsive variable overrides (picked up by style.scss mixins)
            ...Object.keys(responsiveTitleMarginBottom || {}).reduce((acc, br) => {
                if (responsiveTitleMarginBottom[br]) acc[`--title-margin-bottom-${br}`] = responsiveTitleMarginBottom[br];
                return acc;
            }, {}),
            ...Object.keys(responsiveDescriptionMarginBottom || {}).reduce((acc, br) => {
                if (responsiveDescriptionMarginBottom[br]) acc[`--desc-margin-bottom-${br}`] = responsiveDescriptionMarginBottom[br];
                return acc;
            }, {}),
        }
    });

    const alignmentClasses = Object.keys(buttonAlignment || {}).map(br => {
        return `is-aligned-${br}-${buttonAlignment[br]}`;
    }).join(' ');

    const innerBlocksProps = useInnerBlocksProps.save({
        className: `adaire-card-scroll__card-buttons ${alignmentClasses}`
    });

    const getEmbedUrl = (url) => {
        if (!url) return '';
        let embedUrl = '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=${videoLoop ? 1 : 0}&playlist=${videoId}&controls=0`;
        } else if (url.includes('vimeo.com')) {
            const videoId = url.split('/').pop();
            embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=${videoLoop ? 1 : 0}&background=1`;
        }
        return embedUrl;
    };

    return (
        <div {...blockProps} data-preview-text={previewText || ''} data-text-color={textColor || '#000000'}>
            <div className="adaire-card-scroll__card-inner">
                <div className='adaire-card-scroll__card-row'>
                    <div className="adaire-card-scroll__card-text">
                        <RichText.Content
                            tagName="h2"
                            className="adaire-card-scroll__card-title"
                            value={title}
                            style={{ color: headerTextColor }}
                        />
                        <RichText.Content
                            tagName="p"
                            className="adaire-card-scroll__card-description"
                            value={description}
                            style={{ color: textColor }}
                        />
                        <div {...innerBlocksProps} />
                    </div>
                    <div className="adaire-card-scroll__card-media">
                        {videoType === 'external' && externalVideoUrl ? (
                            <iframe
                                src={getEmbedUrl(externalVideoUrl)}
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                                title="External Video"
                            ></iframe>
                        ) : (
                            mediaUrl && (
                                mediaType === 'image' ? (
                                    <img 
                                        src={mediaUrl} 
                                        alt={title}
                                        style={{
                                            objectFit: imageBackgroundSize || 'cover',
                                            objectPosition: imageBackgroundPosition || 'center'
                                        }}
                                    />
                                ) : (
                                    <video src={mediaUrl} muted loop={videoLoop} autoPlay playsInline />
                                )
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}



