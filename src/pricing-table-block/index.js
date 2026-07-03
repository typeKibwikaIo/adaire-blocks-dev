import { registerBlockType } from "@wordpress/blocks";
import "./style.scss";
import Edit from "./edit";
import save from "./save";
import metadata from "./block.json";
import deprecated from "./deprecated";

// Import icon component
import PricingTableIcon from '../icons/pricing-table';

registerBlockType(metadata.name, {
	edit: Edit,
	save,
	deprecated,
	icon: PricingTableIcon,
});





