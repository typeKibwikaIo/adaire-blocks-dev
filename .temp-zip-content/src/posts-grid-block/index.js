import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import './style.scss';
import './heading-underline-format';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import PostsGridIcon from '../icons/posts-grid';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    icon: PostsGridIcon,
});



