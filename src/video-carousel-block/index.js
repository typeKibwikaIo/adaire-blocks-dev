import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import VideoCarouselIcon from '../icons/video-carousel';

registerBlockType(metadata.name, {
	...metadata,
	icon: VideoCarouselIcon,
	edit: Edit,
	save,
});





