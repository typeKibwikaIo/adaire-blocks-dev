/**
 * Starting-point variation for the Video Player block, surfaced in the
 * inserter.
 *
 * There is deliberately only ONE variation here, with the same title as the
 * block itself ("Video Player (Free)") — a block with exactly one
 * scope:['inserter'] variation shows a single inserter card (that
 * variation's card replaces the base block's), so this does not create a
 * second, confusing entry next to it. Earlier this shipped as two separate
 * cards ("Hero (Headline + Overlay)" and "Plain Embed"); per feedback this
 * was collapsed back down to one card using the hero design, which is the
 * confirmed default look for newly-inserted blocks. (jeremie-prelaunch
 * still carried the old two-card version when this was merged in — keeping
 * this single-card version here intentionally, not a merge artifact.)
 *
 * It replicates the design of the now-removed "Video Banner: Single Video"
 * variation (see video-hero-block/variations.js) — full-bleed video with a
 * headline, description, and color overlay — but built on top of Video
 * Player's own plain-embed foundation instead of Video Banner's separate
 * videos-array/view.js machinery. This is the "merge the Single Video
 * variant into Video Player, use the Single Video design" consolidation.
 *
 * Every attribute this variation sets (showOverlayContent, headline,
 * description, overlayOpacity, containerHeight) is a new, optional
 * attribute that defaults to false/off in block.json — so any block saved
 * before this variation existed simply never had them set and keeps its
 * old plain-embed appearance. Only *new* insertions via the inserter pick
 * up this variation's attributes.
 */
import { __ } from '@wordpress/i18n';

const variations = [
	{
		name: 'single-video-hero',
		title: __( 'Video Player (Free)', 'adaire-blocks' ),
		description: __( 'Embed and play videos from YouTube, Vimeo, or upload your own video files with customizable controls.', 'adaire-blocks' ),
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
];

export default variations;
