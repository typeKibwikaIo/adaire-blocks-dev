import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import './editor.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

// Import icon component
import InfoGridIcon from '../icons/info-grid';

// Register the block
registerBlockType(metadata.name, {
    ...metadata,
    edit: Edit,
    save,
    icon: InfoGridIcon,
});




