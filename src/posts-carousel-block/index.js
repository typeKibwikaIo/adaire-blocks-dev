import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

// Import icon component
import PostsCarouselIcon from '../icons/posts-carousel';


registerBlockType(metadata.name, {
    edit: Edit,
    save,
    icon: PostsCarouselIcon, // Reusing the same icon for now
});



