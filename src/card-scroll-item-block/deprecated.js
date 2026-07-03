/**
 * Card Scroll Item (card-scroll-item-block) deprecations — most recent first.
 *
 * v1  Frozen copy of the save() that shipped before ADAB-010 added per-card
 *     typography override controls (font size, font weight, line height,
 *     letter spacing, text transform for both the title and description,
 *     plus a block-level font family) — unconditionally, for every
 *     instance, regardless of whether the user ever opens the new
 *     "Typography" panel. Posts saved before that change don't have these
 *     CSS custom properties on this block's saved markup `style` attribute
 *     at all, so re-running the *current* save() against them would produce
 *     a style attribute that doesn't match what's stored, and Gutenberg
 *     would flag them as invalid content. No attribute schema changed shape
 *     (the new attributes are purely additive with safe defaults that
 *     reproduce the original parent-driven/hardcoded values), so `migrate`
 *     is a no-op identity function and this entry doesn't need its own
 *     `attributes` key (Gutenberg falls back to the current block.json
 *     attributes when parsing a deprecated entry that omits one).
 */
import { useBlockProps, RichText, useInnerBlocksProps } from '@wordpress/block-editor';

const deprecatedV1 = {
    migrate(attributes) {
        return attributes;
    },

    save({ attributes }) {
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
            responsiveCardWidth,
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
                ...Object.keys(responsiveCardWidth || {}).reduce((acc, br) => {
                    if (responsiveCardWidth[br]) acc[`--card-width-${br}`] = responsiveCardWidth[br];
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
    },
};

export default [deprecatedV1];
