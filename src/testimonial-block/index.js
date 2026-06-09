import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './style.scss';
import './editor.scss';
import TestimonialIcon from '../icons/testimonial';

registerBlockType(metadata.name, {
	edit: Edit,
	save,
	icon: TestimonialIcon,
});



