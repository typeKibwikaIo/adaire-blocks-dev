import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import deprecated from './deprecated';
import metadata from './block.json';
import CookieBannerIcon from '../icons/cookie-banner';

// block.json's "icon" is a raw SVG markup string, not one of the icon
// formats Gutenberg actually knows how to render (dashicon slug / SVG
// React element) — left unoverridden, WordPress falls back to that raw
// string and dumps it out as literal text in the inserter/list view instead
// of an icon glyph. Every other block in this plugin already avoids this by
// passing an explicit icon component (see src/icons/*.js); this one didn't.
registerBlockType(metadata.name, { edit: Edit, save, deprecated, icon: CookieBannerIcon });
