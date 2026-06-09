import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

// Import icon component
import TestimonialPremiumIcon from '../icons/testimonial-premium';
import './style.scss';

registerBlockType(metadata.name, {
	edit: Edit,
	save,
	icon: TestimonialPremiumIcon,
});



