import { registerBlockType, getBlockType, unregisterBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import deprecated from './deprecated';
import metadata from './block.json';

// Import icon component
import SocialShareIcon from '../icons/social-share';

// WordPress 6.7+ auto-registers from block.json, so we only need to provide edit/save.
// If block is already registered, unregister it first to avoid duplicate registration errors.
if (getBlockType(metadata.name)) {
	unregisterBlockType(metadata.name);
}

// Register with only edit/save (metadata comes from block.json via PHP)
registerBlockType(metadata.name, {
	edit: Edit,
	save,
	deprecated,
	icon: SocialShareIcon,
});




