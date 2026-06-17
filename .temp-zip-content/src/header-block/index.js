import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import './editor.scss';
import Edit from './edit';
import save from './save';
import deprecated from './deprecated';
import metadata from './block.json';
import HeaderIcon from '../icons/header';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    deprecated,
    icon: HeaderIcon,
});
