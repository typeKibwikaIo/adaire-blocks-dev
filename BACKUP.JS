import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InspectorControls,
	RichText,
	MediaUpload,
	MediaUploadCheck,
} from "@wordpress/block-editor";
import {
	PanelBody,
	TextControl,
	RangeControl,
	ColorPicker,
	Button,
	TextareaControl,
	ToggleControl,
	SelectControl,
} from "@wordpress/components";
import "./editor.scss";

export default function Edit({ attributes, setAttributes }) {
	const { layout, minHeight } = attributes;

	const blockProps = useBlockProps({
		className: "call-to-action-block-editor",
		style: {
			"--min-height": `${minHeight}px`,
			// backgroundColor: backgroundColor || '#1a1a1a',
			// color: textColor || '#ffffff',
			// '--gradient-color-1': gradientColor1 || '#ff4444',
			// '--gradient-color-2': gradientColor2 || '#ff6666',
			// '--gradient-opacity': gradientOpacity || 0.1,
			// '--title-font-size': `${titleFontSize}px`,
			// '--subtitle-font-size': `${subtitleFontSize}px`,
			// '--carousel-font-size': `${carouselFontSize}px`,
			// '--title-font-weight': titleFontWeight || '700',
			// '--description-font-weight': descriptionFontWeight || '400',
			// '--main-title-font-weight': mainTitleFontWeight || '700',
			// '--subtitle-font-weight': subtitleFontWeight || '400',
			// '--title-color': titleColor || '#ffffff',
			// '--subtitle-color': subtitleColor || '#ffffff',
			// '--carousel-text-color': textColor || '#ffffff'
		},
	});

	const setAttributesFunc = (field, value) => {
		setAttributes({ [field]: value });
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title="Layout Settings" initialOpen={true}>
					<SelectControl
						label="Choose a layout"
						value={layout || "split-left"} // ensure it always has a valid option
						options={[
							{
								label: "Split Vertical: Image Left, Text Right",
								value: "split-left",
							},
							{
								label: "Split Vertical: Image Right, Text Left",
								value: "split-right",
							},
							{
								label: "Stacked: Image Top, Text Bottom",
								value: "stacked-top",
							},
							{
								label: "Stacked: Image Bottom, Text Top",
								value: "stacked-bottom",
							},
							{
								label: "Overlay: Text Bottom Left",
								value: "overlay-bottom-left",
							},
							{
								label: "Overlay: Text Bottom Right",
								value: "overlay-bottom-right",
							},
							{
								label: "Overlay: Text Top Left",
								value: "overlay-top-left",
							},
							{
								label: "Overlay: Text Top Right",
								value: "overlay-top-right",
							},
							{
								label: "Overlay: Text Center",
								value: "overlay-center",
							},
						]}
						onChange={(val) => {
							console.log("Selected:", val); // debug
							setAttributes({ layout: val });
						}}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{layout === "split-left" && (
					<div className="ad-cta2-container ad-split">
						<div className="ad-split__image"></div>
						<div className="ad-split__content">
							<h1 className="ad-split__content__header">Header Text</h1>
							<p className="ad-split__content__text">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
								ultrices est quam, sit amet sollicitudin nunc dapibus vitae.
								Donec congue, augue non pulvinar tempus, quam ipsum dignissim
								odio, id finibus neque nulla a velit. Suspendisse potenti.
							</p>
							<div>
								{/* put the actual button block here. try nesting */}
								<div className="ad-split__content__button">
									<button>Action Button</button>
								</div>
							</div>
						</div>
					</div>
				)}
				{layout === "split-right" && (
					<div className="ad-cta2-container ad-split">
						<div className="ad-split__content">
							<h1 className="ad-split__content__header">Header Text</h1>
							<p className="ad-split__content__text">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
								ultrices est quam, sit amet sollicitudin nunc dapibus vitae.
								Donec congue, augue non pulvinar tempus, quam ipsum dignissim
								odio, id finibus neque nulla a velit. Suspendisse potenti.
							</p>
							<div>
								{/* put the actual button block here. try nesting */}
								<div className="ad-split__content__button">
									<button>Action Button</button>
								</div>
							</div>
						</div>
						<div className="ad-split__image"></div>
					</div>
				)}
				{layout === "stacked-top" && (
					<div className="ad-cta2-container ad-stacked">
						<div className="ad-stacked__image"></div>
						<div className="ad-stacked__content-container">
							<div className="ad-stacked__content">
								<h1 className="ad-stacked__content__header">Header Text</h1>
								<p className="ad-stacked__content__text">
									Lorem ipsum dolor sit amet, consectetur adipiscing elit.
									Integer ultrices est quam, sit amet sollicitudin nunc dapibus
									vitae. Donec congue, augue non pulvinar tempus, quam ipsum
									dignissim odio, id finibus neque nulla a velit. Suspendisse
									potenti.
								</p>
								<div>
									{/* put the actual button block here. try nesting */}
									<div className="ad-stacked__content__button">
										<button>Action Button</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
				{layout === "stacked-bottom" && (
					<div className="ad-cta2-container ad-stacked">
						<div className="ad-stacked__content-container">
							<div className="ad-stacked__content">
								<h1 className="ad-stacked__content__header">Header Text</h1>
								<p className="ad-stacked__content__text">
									Lorem ipsum dolor sit amet, consectetur adipiscing elit.
									Integer ultrices est quam, sit amet sollicitudin nunc dapibus
									vitae. Donec congue, augue non pulvinar tempus, quam ipsum
									dignissim odio, id finibus neque nulla a velit. Suspendisse
									potenti.
								</p>
								<div>
									{/* put the actual button block here. try nesting */}
									<div className="ad-stacked__content__button">
										<button>Action Button</button>
									</div>
								</div>
							</div>
						</div>
						<div className="ad-stacked__image"></div>
					</div>
				)}
				{layout === "overlay-top-left" || "overlay-top-right" || "overlay-bottom-left" || "overlay-bottom-right" || "overlay-center" && (
					<div className="ad-cta2-container ad-overlay">
						<div className="ad-overlay__overlay">
							<div className="ad-overlay__content">
								<h1 className="ad-overlay__content__header">Header Text</h1>
								<p className="ad-overlay__content__text">
									Lorem ipsum dolor sit amet, consectetur adipiscing elit.
									Integer ultrices est quam, sit amet sollicitudin nunc dapibus
									vitae. Donec congue, augue non pulvinar tempus, quam ipsum
									dignissim odio, id finibus neque nulla a velit. Suspendisse
									potenti.
								</p>
								<div>
									{/* put the actual button block here. try nesting */}
									<div className="ad-overlay__content__button">
										<button>Action Button</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
