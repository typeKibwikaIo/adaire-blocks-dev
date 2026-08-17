/**
 * Starting-point templates for the Video Banner block, surfaced as block
 * variations in the inserter. Each seeds `videos` (and, where relevant, overlay
 * styling) so authors begin from a finished-looking layout instead of a blank
 * slate.
 */
import { __ } from '@wordpress/i18n';

const vid = (id, title, description, videoUrl, videoType, extra = {}) => ({
	id,
	title,
	description,
	videoUrl,
	videoType,
	thumbnail: '',
	thumbnailId: 0,
	autoplay: true,
	muted: true,
	useImage: false,
	imageUrl: '',
	imageId: 0,
	...extra,
});

const variations = [
	{
		name: 'three-video-showcase',
		title: __('Video Banner: 3-Video Showcase', 'adaire-blocks'),
		description: __('Rotating hero with three background videos and a solid overlay.', 'adaire-blocks'),
		scope: ['inserter'],
		isDefault: true,
		attributes: {
			overlayType: 'solid',
			overlayOpacity: 0.3,
			videos: [
				vid(1, 'Premium whitelabel design', 'Watch this incredible video showcasing our latest work and creative process.', 'https://vimeo.com/1118056227', 'vimeo'),
				vid(2, 'Bring your ideas to life', 'Explore our creative journey and see how we bring ideas to life through innovative design.', 'https://youtu.be/vhpOhHEhVOg', 'youtube'),
				vid(3, 'Award Winning Design', 'Get an exclusive look behind the scenes of our creative process and team collaboration.', 'https://youtu.be/iUtnZpzkbG8', 'youtube'),
			],
		},
	},
	// The former "single-video" variation (one full-bleed background video,
	// no slider indicators) has been removed from here and merged into the
	// Video Player (Free) block instead — see
	// src/video-player-block/variations.js's `single-video-hero` entry,
	// which replicates this exact design (headline + description + overlay
	// over one video) on top of Video Player's simpler single-video
	// foundation, rather than Video Banner's multi-video/view.js machinery.
	// Removing the duplicate here satisfies the "redundant Single Video
	// variant is fully removed" requirement.
	{
		name: 'gradient-spotlight',
		title: __('Video Banner: Gradient Spotlight', 'adaire-blocks'),
		description: __('Video hero with a dark-to-transparent gradient overlay for readable text.', 'adaire-blocks'),
		scope: ['inserter'],
		attributes: {
			overlayType: 'gradient',
			overlayGradientStart: '#000000',
			overlayGradientEnd: '#000000',
			overlayGradientDirection: 'to top',
			overlayGradientStartOpacity: 0.8,
			overlayGradientEndOpacity: 0.1,
			videos: [
				vid(1, 'Premium whitelabel design', 'Watch this incredible video showcasing our latest work.', 'https://vimeo.com/1118056227', 'vimeo'),
				vid(2, 'Bring your ideas to life', 'Explore our creative journey through innovative design.', 'https://youtu.be/vhpOhHEhVOg', 'youtube'),
			],
		},
	},
	{
		name: 'image-slideshow',
		title: __('Video Banner: Image Slideshow', 'adaire-blocks'),
		description: __('Same layout driven by static background images instead of video.', 'adaire-blocks'),
		scope: ['inserter'],
		attributes: {
			overlayType: 'solid',
			overlayOpacity: 0.35,
			videos: [
				vid(1, 'Add your first slide', 'Pick a background image in the block settings.', '', 'youtube', { useImage: true }),
				vid(2, 'Add your second slide', 'Pick a background image in the block settings.', '', 'youtube', { useImage: true }),
				vid(3, 'Add your third slide', 'Pick a background image in the block settings.', '', 'youtube', { useImage: true }),
			],
		},
	},
];

export default variations;
