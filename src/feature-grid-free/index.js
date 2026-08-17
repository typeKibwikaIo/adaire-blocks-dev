import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import deprecated from './deprecated';
import metadata from './block.json';
import InfoGrid2Icon from '../icons/info-grid-2';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    deprecated,
    icon: InfoGrid2Icon,
});



