import { registerBlockType } from '@wordpress/blocks';
import { getBlockType, unregisterBlockType } from '@wordpress/blocks';
import metadata from './block.json';

// Import icon component
import FlipCardIcon from '../icons/flip-card';
import Edit from './edit';
import save from './save';

// Unregister if already registered to avoid conflicts
if (getBlockType(metadata.name)) {
    unregisterBlockType(metadata.name);
}

registerBlockType(metadata.name, {edit: Edit,
    save: save,
		icon: FlipCardIcon,});




