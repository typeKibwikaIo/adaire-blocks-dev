import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import './editor.scss';
import Edit from './edit';
import save from './save';
import deprecated from './deprecated';
import metadata from './block.json';
import InfoGrid4Icon from '../icons/info-grid-4';

registerBlockType(metadata.name, {
    ...metadata,
    edit: Edit,
    save,
    deprecated,
    icon: InfoGrid4Icon,
});





