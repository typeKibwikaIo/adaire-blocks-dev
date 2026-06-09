import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import CallToActionIcon from '../icons/call-to-action';

registerBlockType(metadata.name, {
	edit: Edit,
	save,
	icon: CallToActionIcon,
});



