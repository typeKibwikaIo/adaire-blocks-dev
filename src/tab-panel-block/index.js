import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

// Import icon component
import TabsIcon from '../icons/tabs';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    icon: TabsIcon,
});




