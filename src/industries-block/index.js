import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './style.scss';
import IndustriesIcon from '../icons/industries';

registerBlockType(metadata.name, {
	edit: Edit,
	save,
	icon: IndustriesIcon,
});




