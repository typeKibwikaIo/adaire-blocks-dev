import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import './editor.scss';
import Edit from './edit';
import save from './save';
import deprecated from './deprecated';
import metadata from './block.json';
import HeaderIcon from '../icons/header';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    deprecated,
    icon: HeaderIcon,
});

// Backward-compatible alias: this block was renamed from header-block to
// header-menu-block so its slug matches its display name ("Header Menu
// (Free)"). Header Menu is a *dynamic* block (render.php-driven, save.js
// returns null) — WordPress identifies already-published block instances by
// the exact name string stored in post_content (`<!-- wp:create-block/
// header-block -->`), so simply renaming the registration would make every
// existing header on every site using this plugin unrender/error out on
// next load. Registering the OLD name here too, pointed at the same
// edit/save/deprecated, means existing content keeps resolving and
// rendering exactly as before. `supports.inserter: false` hides this alias
// from the block inserter so users only ever pick the new
// "header-menu-block" name when adding a fresh header — the alias exists
// solely to keep old content alive, not to be chosen again.
registerBlockType('create-block/header-block', {
    ...metadata,
    name: 'create-block/header-block',
    supports: {
        ...metadata.supports,
        inserter: false,
    },
    edit: Edit,
    save,
    deprecated,
    icon: HeaderIcon,
});
