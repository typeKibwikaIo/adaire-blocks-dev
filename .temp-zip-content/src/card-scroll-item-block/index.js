import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import CardScrollIcon from '../icons/card-scroll';

registerBlockType(metadata.name, {
    ...metadata,
    edit: Edit,
    save,
    icon: CardScrollIcon,
});



