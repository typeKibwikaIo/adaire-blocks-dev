import { __ } from "@wordpress/i18n";
import { useBlockProps, RichText } from "@wordpress/block-editor";
import {
	PanelBody,
	ToggleControl,
	RangeControl,
	SelectControl,
	TextControl,
	Button,
} from "@wordpress/components";
import InspectorTabs from "../components/InspectorTabs";
import AdaireColorControl from "../components/AdaireColorControl";
import "./editor.scss";

const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function Edit({ attributes, setAttributes }) {
	const {
		layout,
		columns,
		showHeading,
		heading,
		subheading,
		headingAlign,
		items,
		showValue,
		fillColor,
		useGradient,
		fillColorEnd,
		trackColor,
		labelColor,
		valueColor,
		barHeight,
		barRadius,
		ringSize,
		ringStrokeWidth,
		ringTrackColor,
		ringTextColor,
		ringLabelColor,
		headingColor,
		subheadingColor,
		backgroundColor,
		animationDuration,
		paddingTop,
		paddingBottom,
	} = attributes;

	const set = (key) => (value) => setAttributes({ [key]: value });

	const addItem = () => {
		setAttributes({
			items: [
				...items,
				{ label: __("New item", "progress-block"), value: 50, color: "" },
			],
		});
	};

	const removeItem = (index) => {
		setAttributes({ items: items.filter((_, i) => i !== index) });
	};

	const updateItem = (index, key, value) => {
		setAttributes({
			items: items.map((item, i) =>
				i === index ? { ...item, [key]: value } : item
			),
		});
	};

	const moveItem = (index, direction) => {
		const target = index + direction;
		if (target < 0 || target >= items.length) return;
		const newItems = [...items];
		[newItems[index], newItems[target]] = [newItems[target], newItems[index]];
		setAttributes({ items: newItems });
	};

	const blockProps = useBlockProps({
		className: `adaire-progress-bar is-layout-${layout}`,
		style: {
			"--pb-fill-color": fillColor,
			"--pb-fill-color-end": useGradient ? fillColorEnd : fillColor,
			"--pb-track-color": trackColor,
			"--pb-label-color": labelColor,
			"--pb-value-color": valueColor,
			"--pb-bar-height": `${barHeight}px`,
			"--pb-bar-radius": `${barRadius}px`,
			"--pb-ring-size": `${ringSize}px`,
			"--pb-ring-stroke-width": `${ringStrokeWidth}px`,
			"--pb-ring-track-color": ringTrackColor,
			"--pb-ring-text-color": ringTextColor,
			"--pb-ring-label-color": ringLabelColor,
			"--pb-heading-color": headingColor,
			"--pb-subheading-color": subheadingColor,
			"--pb-columns": columns,
			backgroundColor: backgroundColor || undefined,
			paddingTop: `${paddingTop}px`,
			paddingBottom: `${paddingBottom}px`,
		},
	});

	return (
		<>
			<InspectorTabs attributes={attributes} setAttributes={setAttributes}>
				<PanelBody title={__("Layout", "progress-block")} initialOpen={true}>
					<SelectControl
						label={__("Layout Style", "progress-block")}
						value={layout}
						options={[
							{ label: __("Bar", "progress-block"), value: "bar" },
							{ label: __("Circle", "progress-block"), value: "circle" },
						]}
						onChange={set("layout")}
						help={__(
							"Switch between a stacked list of bars or a grid of progress rings.",
							"progress-block"
						)}
					/>
					{layout === "circle" && (
						<RangeControl
							label={__("Columns", "progress-block")}
							value={columns}
							min={1}
							max={6}
							onChange={set("columns")}
						/>
					)}
					<ToggleControl
						label={__("Show Heading", "progress-block")}
						checked={showHeading}
						onChange={set("showHeading")}
					/>
					{showHeading && (
						<SelectControl
							label={__("Heading Alignment", "progress-block")}
							value={headingAlign}
							options={[
								{ label: __("Left", "progress-block"), value: "left" },
								{ label: __("Center", "progress-block"), value: "center" },
							]}
							onChange={set("headingAlign")}
						/>
					)}
					<ToggleControl
						label={__("Show Percentage Value", "progress-block")}
						checked={showValue}
						onChange={set("showValue")}
					/>
					<RangeControl
						label={__("Animation Duration (ms)", "progress-block")}
						value={animationDuration}
						min={200}
						max={3000}
						step={100}
						onChange={set("animationDuration")}
						help={__(
							"How long the bar/ring takes to fill when it scrolls into view.",
							"progress-block"
						)}
					/>
				</PanelBody>

				<PanelBody title={__("Items", "progress-block")} initialOpen={true}>
					{items.map((item, index) => (
						<div className="adaire-progress-bar__item-control" key={index}>
							<TextControl
								label={__("Label", "progress-block") + ` #${index + 1}`}
								value={item.label}
								onChange={(value) => updateItem(index, "label", value)}
							/>
							<RangeControl
								label={__("Value (%)", "progress-block")}
								value={item.value}
								min={0}
								max={100}
								onChange={(value) => updateItem(index, "value", value)}
							/>
							<AdaireColorControl
								label={__("Color override (optional)", "progress-block")}
								value={item.color}
								onChange={(value) => updateItem(index, "color", value)}
							/>
							<div className="adaire-progress-bar__item-actions">
								<Button
									icon="arrow-up-alt2"
									label={__("Move up", "progress-block")}
									onClick={() => moveItem(index, -1)}
									disabled={index === 0}
								/>
								<Button
									icon="arrow-down-alt2"
									label={__("Move down", "progress-block")}
									onClick={() => moveItem(index, 1)}
									disabled={index === items.length - 1}
								/>
								<Button
									isDestructive
									variant="secondary"
									onClick={() => removeItem(index)}
								>
									{__("Remove", "progress-block")}
								</Button>
							</div>
						</div>
					))}
					<Button variant="primary" onClick={addItem}>
						{__("Add Item", "progress-block")}
					</Button>
				</PanelBody>

				<PanelBody title={__("Colors", "progress-block")} initialOpen={false}>
					<AdaireColorControl
						label={__(
							layout === "circle" ? "Ring Fill Color" : "Bar Fill Color",
							"progress-block"
						)}
						value={fillColor}
						onChange={set("fillColor")}
					/>
					{layout === "bar" && (
						<>
							<ToggleControl
								label={__("Use Gradient Fill", "progress-block")}
								checked={useGradient}
								onChange={set("useGradient")}
							/>
							{useGradient && (
								<AdaireColorControl
									label={__("Gradient End Color", "progress-block")}
									value={fillColorEnd}
									onChange={set("fillColorEnd")}
								/>
							)}
						</>
					)}
					<AdaireColorControl
						label={__(
							layout === "circle" ? "Ring Track Color" : "Track Color",
							"progress-block"
						)}
						value={layout === "circle" ? ringTrackColor : trackColor}
						onChange={set(layout === "circle" ? "ringTrackColor" : "trackColor")}
					/>
					<AdaireColorControl
						label={__("Label Color", "progress-block")}
						value={layout === "circle" ? ringLabelColor : labelColor}
						onChange={set(layout === "circle" ? "ringLabelColor" : "labelColor")}
					/>
					<AdaireColorControl
						label={__("Value Color", "progress-block")}
						value={layout === "circle" ? ringTextColor : valueColor}
						onChange={set(layout === "circle" ? "ringTextColor" : "valueColor")}
					/>
					{showHeading && (
						<>
							<AdaireColorControl
								label={__("Heading Color", "progress-block")}
								value={headingColor}
								onChange={set("headingColor")}
							/>
							<AdaireColorControl
								label={__("Subheading Color", "progress-block")}
								value={subheadingColor}
								onChange={set("subheadingColor")}
							/>
						</>
					)}
					<AdaireColorControl
						label={__("Background Color", "progress-block")}
						value={backgroundColor}
						onChange={set("backgroundColor")}
					/>
				</PanelBody>

				{layout === "bar" && (
					<PanelBody title={__("Bar Styling", "progress-block")} initialOpen={false}>
						<RangeControl
							label={__("Bar Height", "progress-block")}
							value={barHeight}
							min={2}
							max={40}
							onChange={set("barHeight")}
						/>
						<RangeControl
							label={__("Bar Radius", "progress-block")}
							value={barRadius}
							min={0}
							max={999}
							onChange={set("barRadius")}
						/>
					</PanelBody>
				)}

				{layout === "circle" && (
					<PanelBody title={__("Ring Styling", "progress-block")} initialOpen={false}>
						<RangeControl
							label={__("Ring Size", "progress-block")}
							value={ringSize}
							min={60}
							max={280}
							onChange={set("ringSize")}
						/>
						<RangeControl
							label={__("Ring Stroke Width", "progress-block")}
							value={ringStrokeWidth}
							min={2}
							max={30}
							onChange={set("ringStrokeWidth")}
						/>
					</PanelBody>
				)}

				<PanelBody title={__("Spacing", "progress-block")} initialOpen={false}>
					<RangeControl
						label={__("Top Padding", "progress-block")}
						value={paddingTop}
						min={0}
						max={160}
						onChange={set("paddingTop")}
					/>
					<RangeControl
						label={__("Bottom Padding", "progress-block")}
						value={paddingBottom}
						min={0}
						max={160}
						onChange={set("paddingBottom")}
					/>
				</PanelBody>
			</InspectorTabs>

			<div {...blockProps}>
				{showHeading && (
					<div className={`adaire-progress-bar__header is-align-${headingAlign}`}>
						<RichText
							tagName="h3"
							className="adaire-progress-bar__heading"
							value={heading}
							onChange={set("heading")}
							placeholder={__("Heading…", "progress-block")}
							allowedFormats={[]}
						/>
						<RichText
							tagName="p"
							className="adaire-progress-bar__subheading"
							value={subheading}
							onChange={set("subheading")}
							placeholder={__("Subheading…", "progress-block")}
							allowedFormats={[]}
						/>
					</div>
				)}

				{layout === "bar" && (
					<div className="adaire-progress-bar__list">
						{items.map((item, index) => (
							<div className="adaire-progress-bar__item" key={index}>
								<div className="adaire-progress-bar__row">
									<span className="adaire-progress-bar__label">{item.label}</span>
									{showValue && (
										<span className="adaire-progress-bar__value">{item.value}%</span>
									)}
								</div>
								<div className="adaire-progress-bar__track">
									<div
										className="adaire-progress-bar__fill"
										style={{
											width: `${item.value}%`,
											background: item.color || undefined,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				)}

				{layout === "circle" && (
					<div className="adaire-progress-bar__grid">
						{items.map((item, index) => {
							const offset =
								RING_CIRCUMFERENCE - (item.value / 100) * RING_CIRCUMFERENCE;
							return (
								<div className="adaire-progress-bar__ring-item" key={index}>
									<div className="adaire-progress-bar__ring">
										<svg viewBox="0 0 100 100" className="adaire-progress-bar__ring-svg">
											<circle
												className="adaire-progress-bar__ring-track"
												cx="50"
												cy="50"
												r={RING_RADIUS}
											/>
											<circle
												className="adaire-progress-bar__ring-fill"
												cx="50"
												cy="50"
												r={RING_RADIUS}
												style={{
													stroke: item.color || undefined,
													strokeDasharray: RING_CIRCUMFERENCE,
													strokeDashoffset: offset,
												}}
											/>
										</svg>
										{showValue && (
											<div className="adaire-progress-bar__ring-text">{item.value}%</div>
										)}
									</div>
									<div className="adaire-progress-bar__ring-label">{item.label}</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
}
