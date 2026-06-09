import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

// Custom React icon component (mirrors the SVG used in block.json)
const VideoCarouselIcon = (props) => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<rect width="24" height="24" rx="5" fill="#D52940" />
		<path
			d="M6 5.5C5.17157 5.5 4.5 6.17157 4.5 7V17C4.5 17.8284 5.17157 18.5 6 18.5H18C18.8284 18.5 19.5 17.8284 19.5 17V7C19.5 6.17157 18.8284 5.5 18 5.5H6ZM11.5 9.134C11.5 8.43661 12.2521 8.0134 12.8487 8.37059L15.8487 10.1366C16.398 10.4652 16.398 11.259 15.8487 11.5876L12.8487 13.3536C12.2521 13.7108 11.5 13.2876 11.5 12.5902V9.134Z"
			fill="white"
		/>
	</svg>
);

// Merge metadata and override icon with our React component so it renders in the inserter
registerBlockType(metadata.name, {
	...metadata,
	icon: VideoCarouselIcon,
	edit: Edit,
	save,
});





