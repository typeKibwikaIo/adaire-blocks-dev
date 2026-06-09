import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import './editor.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import InfoGrid3Icon from '../icons/info-grid-3';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    icon: InfoGrid3Icon,
});



