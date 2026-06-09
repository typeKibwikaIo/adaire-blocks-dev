import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import './editor.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import Hero1Icon from '../icons/hero-1';

registerBlockType(metadata.name, {
    edit: Edit,
    save: Save,
    icon: Hero1Icon,
});




