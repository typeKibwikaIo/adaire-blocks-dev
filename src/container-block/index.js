import { registerBlockType } from '@wordpress/blocks';
import edit from './edit.js';
import save from './save.js';
import metadata from './block.json';

registerBlockType(metadata.name, {
    ...metadata,
    edit,
    save
});