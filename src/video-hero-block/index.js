/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './style.scss';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import VideoHeroIcon from '../icons/video-hero';

/**
 * Register the portfolio block
 */
registerBlockType(metadata.name, {
	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,
	icon: VideoHeroIcon,
	
	/**
	 * Provide block data to frontend
	 */
	providesContext: {
		'video-hero-block/videos': 'videos',
		'video-hero-block/transitionDuration': 'transitionDuration',
		'video-hero-block/autoPlay': 'autoPlay',
		'video-hero-block/showControls': 'showControls',
	},
});


