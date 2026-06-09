import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
// No save import needed for dynamic blocks!
import metadata from './block.json';
import CounterIcon from '../icons/counter';

/**
 * Register the block
 * Dynamic block - rendered server-side with PHP
 * 
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType(metadata.name, {
    edit: Edit,
    // No save function = dynamic block (rendered by PHP)
    icon: CounterIcon
});




