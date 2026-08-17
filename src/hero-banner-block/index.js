import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import './editor.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import HeroBannerIcon from '../icons/hero-1';

registerBlockType(metadata.name, {
    edit: Edit,
    save: Save,
    icon: HeroBannerIcon,
});




