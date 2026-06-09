/**
 * Block Template - Index File
 * 
 * This is the main entry point for your WordPress block.
 */

import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

/**
 * Register the block
 * 
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType(metadata.name, {
    /**
     * Edit function
     * 
     * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
     */
    edit: Edit,

    /**
     * Save function
     * 
     * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
     */
    save,
});

