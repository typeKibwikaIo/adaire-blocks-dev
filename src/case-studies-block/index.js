import { registerBlockType } from '@wordpress/blocks';
import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

// Import icon component
import CaseStudiesIcon from '../icons/case-studies';

registerBlockType(metadata.name, {
    ...metadata,
    icon: CaseStudiesIcon,
    edit: Edit,
    save
});




