import { registerBlockType, getBlockType, unregisterBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import './style.scss';
import './editor.scss';
import ModalIcon from '../icons/modal';

const existingBlock = getBlockType(metadata.name);

if (existingBlock) {
    unregisterBlockType(metadata.name);
}

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    icon: ModalIcon,
});
