import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

// Import icon component
import AnimationOnScrollIcon from '../icons/animation-on-scroll';

/**
 * Register the Animation on Scroll block
 */
registerBlockType(metadata.name, {
	edit: Edit,
	save,
	icon: AnimationOnScrollIcon,
});




