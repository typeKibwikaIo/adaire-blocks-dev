import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

// Import icon component
import TestimonialPlusIcon from '../icons/testimonial-plus';
import './style.scss';
import './editor.scss';

registerBlockType(metadata.name, {
	edit: Edit,
	save,
	icon: TestimonialPlusIcon,
});




