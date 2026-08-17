/**
 * Starting-point variations for the Video Player block, surfaced in the
 * inserter.
 *
 * `single-video-hero` is the new default for freshly-inserted Video Player
 * blocks: it replicates the design of the now-removed "Video Banner: Single
 * Video" variation (see video-hero-block/variations.js) — full-bleed video
 * with a headline, description, and color overlay — but built on top of
 * Video Player's own plain-embed foundation instead of Video Banner's
 * separate videos-array/view.js machinery. This is the "merge the Single
 * Video variant into Video Player, use the Single Video design" consolidation.
 *
 * Every attribute this variation sets (showOverlayContent, headline,
 * description, overlayOpacity, containerHeight) is a new, optional
 * attribute — none of them existed before this merge, so any block saved
 * before this variation was added simply never had them set and keeps its
 * old plain-embed appearance. Only *new* insertions via the inserter pick
 * up this variation's attributes.
 */
import { __ } from '@wordpress/i18n';

const variations = [
	{
		name: 'single-video-hero',
		title: __( 'Video Player: Hero (Headline + Overlay)', 'adaire-blocks' ),
		description: __( 'One full-bleed video with a headline, description, and color overlay.', 'adaire-blocks' ),
		scope: [ 'inserter' ],
		isDefault: true,
		attributes: {
			showOverlayContent: true,
			headline: __( 'Your headline here', 'adaire-blocks' ),
			description: __( 'A short supporting line that introduces your video.', 'adaire-blocks' ),
			overlayColor: '#000000',
			overlayOpacity: 0.4,
			headlineColor: '#ffffff',
			descriptionColor: '#ffffff',
			videoType: 'vimeo',
			vimeoVideoId: '1118056227',
			vimeoVideoUrl: 'https://vimeo.com/1118056227',
			containerHeight: {
				desktop: { value: 500, unit: 'px' },
				tablet: { value: 420, unit: 'px' },
				mobile: { value: 360, unit: 'px' },
				smartwatch: { value: 280, unit: 'px' },
			},
		},
	},
	{
		name: 'plain-video-player',
		title: __( 'Video Player: Plain Embed', 'adaire-blocks' ),
		description: __( 'Just the video, no headline or overlay — pick this for a simple embed.', 'adaire-blocks' ),
		scope: [ 'inserter' ],
		attributes: {
			showOverlayContent: false,
		},
	},
];

export default variations;
