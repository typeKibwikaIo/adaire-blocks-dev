import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import TabsIcon from '../icons/tabs';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    icon: TabsIcon,
});




