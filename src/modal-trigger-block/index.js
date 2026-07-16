import { registerBlockType, getBlockType, unregisterBlockType } from '@wordpress/blocks';
import metadata from './block.json';

// Import icon component
import ModalIcon from '../icons/modal';
import Edit from './edit';
import save from './save';
import './style.scss';

const existing = getBlockType(metadata.name);

if (existing) {
    unregisterBlockType(metadata.name);
}

registerBlockType(metadata.name, {edit: Edit,
    save,
		icon: ModalIcon,});





