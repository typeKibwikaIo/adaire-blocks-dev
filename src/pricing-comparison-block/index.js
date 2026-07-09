import { registerBlockType } from "@wordpress/blocks";
import "./style.scss";
import Edit from "./edit";
import save from "./save";
import deprecated from "./deprecated";
import metadata from "./block.json";

// Import icon component
import PricingComparisonIcon from "../icons/pricing-comparison";

registerBlockType(metadata.name, {
	edit: Edit,
	save,
	deprecated,
	icon: PricingComparisonIcon,
});



