import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import VideoPlayerIcon from '../icons/video-player';
import variations from './variations';

registerBlockType( metadata.name, {
edit: Edit,
save,
icon: VideoPlayerIcon,
variations,
} );


