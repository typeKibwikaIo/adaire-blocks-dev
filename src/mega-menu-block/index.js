import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import Save from './save'; // Import Save to handle InnerBlocks content
import metadata from './block.json';

// Import icon component
import MegaMenuIcon from '../icons/mega-menu';

import './style.scss';
import './editor.scss';


/**
 * Register the block
 * Dynamic block - rendered server-side with PHP
 * But we still need Save to handle InnerBlocks content
 */
registerBlockType(metadata.name, {
    edit: Edit,
    save: Save, // WordPress needs this to save InnerBlocks even for dynamic blocks
    icon: MegaMenuIcon
});





