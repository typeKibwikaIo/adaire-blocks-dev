import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import deprecated from './deprecated';
import CardScrollIcon from '../icons/card-scroll';

registerBlockType(metadata.name, {
    ...metadata,
    edit: Edit,
    save,
    deprecated,
    icon: CardScrollIcon,
});



