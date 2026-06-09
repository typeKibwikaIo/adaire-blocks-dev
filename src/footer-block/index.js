import './editor.scss';
import './style.scss';
import './edit';
import './save';

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import ContainerIcon from '../icons/container';

registerBlockType(metadata.name, {
    edit: Edit,
    save: Save,
    icon: ContainerIcon,
});




