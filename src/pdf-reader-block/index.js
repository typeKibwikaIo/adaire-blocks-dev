import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import PdfReaderIcon from '../icons/pdf-reader';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
    icon: PdfReaderIcon,
});
