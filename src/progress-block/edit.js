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
import { useState } from "@wordpress/element";
import InspectorTabs from "../components/InspectorTabs";
import AdaireColorControl from "../components/AdaireColorControl";
import DeviceSwitcher, { BreakpointNote, THREE_TIERS } from "../components/DeviceSwitcher";
import useEditorDevice, { hasCanvasPreset } from "../components/useEditorDevice";
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
		responsivePaddingTop,
		responsivePaddingBottom,
	} = attributes;

	const set = (key) => (value) => setAttributes({ [key]: value });

	const [deviceType, setDeviceType] = useState("desktop");
	useEditorDevice(deviceType, setDeviceType);

	const updateResponsive = (attrName, value) => setAttributes({
		[attrName]: { ...(attributes[attrName] || {}), [deviceType]: value },
	});

	const rPaddingTop = responsivePaddingTop || {};
	const rPaddingBottom = responsivePaddingBottom || {};

	const addItem = () => {
		setAttributes({
			items: [
				...items,
				{ label: __("New item", "adaire-blocks"), value: 50, color: "" },
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
			"--pb-padding-top-desktop": `${rPaddingTop.desktop ?? paddingTop}px`,
			"--pb-padding-top-tablet": `${rPaddingTop.tablet ?? rPaddingTop.desktop ?? paddingTop}px`,
			"--pb-padding-top-mobile": `${rPaddingTop.mobile ?? rPaddingTop.tablet ?? rPaddingTop.desktop ?? paddingTop}px`,
			"--pb-padding-bottom-desktop": `${rPaddingBottom.desktop ?? paddingBottom}px`,
			"--pb-padding-bottom-tablet": `${rPaddingBottom.tablet ?? rPaddingBottom.desktop ?? paddingBottom}px`,
			"--pb-padding-bottom-mobile": `${rPaddingBottom.mobile ?? rPaddingBottom.tablet ?? rPaddingBottom.desktop ?? paddingBottom}px`,
			backgroundColor: backgroundColor || undefined,
		},
	});

	return (
		<>
			<InspectorTabs attributes={attributes} setAttributes={setAttributes}>
				<PanelBody title={__("Layout", "adaire-blocks")} initialOpen={true}>
					<SelectControl
						label={__("Layout Style", "adaire-blocks")}
						value={layout}
						options={[
							{ label: __("Bar", "adaire-blocks"), value: "bar" },
							{ label: __("Circle", "adaire-blocks"), value: "circle" },
						]}
						onChange={set("layout")}
						help={__(
							"Switch between a stacked list of bars or a grid of progress rings.",
							"adaire-blocks"
						)}
					/>
					{layout === "circle" && (
						<RangeControl
							label={__("Columns", "adaire-blocks")}
							value={columns}
							min={1}
							max={6}
							onChange={set("columns")}
						/>
					)}
					<ToggleControl
						label={__("Show Heading", "adaire-blocks")}
						checked={showHeading}
						onChange={set("showHeading")}
					/>
					{showHeading && (
						<SelectControl
							label={__("Heading Alignment", "adaire-blocks")}
							value={headingAlign}
							options={[
								{ label: __("Left", "adaire-blocks"), value: "left" },
								{ label: __("Center", "adaire-blocks"), value: "center" },
							]}
							onChange={set("headingAlign")}
						/>
					)}
					<ToggleControl
						label={__("Show Percentage Value", "adaire-blocks")}
						checked={showValue}
						onChange={set("showValue")}
					/>
					<RangeControl
						label={__("Animation Duration (ms)", "adaire-blocks")}
						value={animationDuration}
						min={200}
						max={3000}
						step={100}
						onChange={set("animationDuration")}
						help={__(
							"How long the bar/ring takes to fill when it scrolls into view.",
							"adaire-blocks"
						)}
					/>
				</PanelBody>

				<PanelBody title={__("Items", "adaire-blocks")} initialOpen={true}>
					{items.map((item, index) => (
						<div className="adaire-progress-bar__item-control" key={index}>
							<TextControl
								label={__("Label", "adaire-blocks") + ` #${index + 1}`}
								value={item.label}
								onChange={(value) => updateItem(index, "label", value)}
							/>
							<RangeControl
								label={__("Value (%)", "adaire-blocks")}
								value={item.value}
								min={0}
								max={100}
								onChange={(value) => updateItem(index, "value", value)}
							/>
							<AdaireColorControl
								label={__("Color override (optional)", "adaire-blocks")}
								value={item.color}
								onChange={(value) => updateItem(index, "color", value)}
							/>
							<div className="adaire-progress-bar__item-actions">
								<Button
									icon="arrow-up-alt2"
									label={__("Move up", "adaire-blocks")}
									onClick={() => moveItem(index, -1)}
									disabled={index === 0}
								/>
								<Button
									icon="arrow-down-alt2"
									label={__("Move down", "adaire-blocks")}
									onClick={() => moveItem(index, 1)}
									disabled={index === items.length - 1}
								/>
								<Button
									isDestructive
									variant="secondary"
									onClick={() => removeItem(index)}
								>
									{__("Remove", "adaire-blocks")}
								</Button>
							</div>
						</div>
					))}
					<Button variant="primary" onClick={addItem}>
						{__("Add Item", "adaire-blocks")}
					</Button>
				</PanelBody>

				<PanelBody title={__("Colors", "adaire-blocks")} initialOpen={false}>
					<AdaireColorControl
						label={__(
							layout === "circle" ? "Ring Fill Color" : "Bar Fill Color",
							"adaire-blocks"
						)}
						value={fillColor}
						onChange={set("fillColor")}
					/>
					{layout === "bar" && (
						<>
							<ToggleControl
								label={__("Use Gradient Fill", "adaire-blocks")}
								checked={useGradient}
								onChange={set("useGradient")}
							/>
							{useGradient && (
								<AdaireColorControl
									label={__("Gradient End Color", "adaire-blocks")}
									value={fillColorEnd}
									onChange={set("fillColorEnd")}
								/>
							)}
						</>
					)}
					<AdaireColorControl
						label={__(
							layout === "circle" ? "Ring Track Color" : "Track Color",
							"adaire-blocks"
						)}
						value={layout === "circle" ? ringTrackColor : trackColor}
						onChange={set(layout === "circle" ? "ringTrackColor" : "trackColor")}
					/>
					<AdaireColorControl
						label={__("Label Color", "adaire-blocks")}
						value={layout === "circle" ? ringLabelColor : labelColor}
						onChange={set(layout === "circle" ? "ringLabelColor" : "labelColor")}
					/>
					<AdaireColorControl
						label={__("Value Color", "adaire-blocks")}
						value={layout === "circle" ? ringTextColor : valueColor}
						onChange={set(layout === "circle" ? "ringTextColor" : "valueColor")}
					/>
					{showHeading && (
						<>
							<AdaireColorControl
								label={__("Heading Color", "adaire-blocks")}
								value={headingColor}
								onChange={set("headingColor")}
							/>
							<AdaireColorControl
								label={__("Subheading Color", "adaire-blocks")}
								value={subheadingColor}
								onChange={set("subheadingColor")}
							/>
						</>
					)}
					<AdaireColorControl
						label={__("Background Color", "adaire-blocks")}
						value={backgroundColor}
						onChange={set("backgroundColor")}
					/>
				</PanelBody>

				{layout === "bar" && (
					<PanelBody title={__("Bar Styling", "adaire-blocks")} initialOpen={false}>
						<RangeControl
							label={__("Bar Height", "adaire-blocks")}
							value={barHeight}
							min={2}
							max={40}
							onChange={set("barHeight")}
						/>
						<RangeControl
							label={__("Bar Radius", "adaire-blocks")}
							value={barRadius}
							min={0}
							max={999}
							onChange={set("barRadius")}
						/>
					</PanelBody>
				)}

				{layout === "circle" && (
					<PanelBody title={__("Ring Styling", "adaire-blocks")} initialOpen={false}>
						<RangeControl
							label={__("Ring Size", "adaire-blocks")}
							value={ringSize}
							min={60}
							max={280}
							onChange={set("ringSize")}
						/>
						<RangeControl
							label={__("Ring Stroke Width", "adaire-blocks")}
							value={ringStrokeWidth}
							min={2}
							max={30}
							onChange={set("ringStrokeWidth")}
						/>
					</PanelBody>
				)}

				<PanelBody title={__("Spacing", "adaire-blocks")} initialOpen={false}>
					<DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} tiers={THREE_TIERS} />
					<BreakpointNote deviceType={deviceType} tiers={THREE_TIERS} />
					{!hasCanvasPreset(deviceType) && (
						<p className="components-base-control__help">{__("This breakpoint has no matching canvas preview width — the editor canvas will not resize to match while you edit it.", "adaire-blocks")}</p>
					)}
					<RangeControl
						label={__("Top Padding", "adaire-blocks")}
						value={rPaddingTop[deviceType] ?? rPaddingTop.desktop ?? paddingTop}
						min={0}
						max={160}
						onChange={(value) => updateResponsive("responsivePaddingTop", value)}
					/>
					<RangeControl
						label={__("Bottom Padding", "adaire-blocks")}
						value={rPaddingBottom[deviceType] ?? rPaddingBottom.desktop ?? paddingBottom}
						min={0}
						max={160}
						onChange={(value) => updateResponsive("responsivePaddingBottom", value)}
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
							placeholder={__("Heading…", "adaire-blocks")}
							allowedFormats={[]}
						/>
						<RichText
							tagName="p"
							className="adaire-progress-bar__subheading"
							value={subheading}
							onChange={set("subheading")}
							placeholder={__("Subheading…", "adaire-blocks")}
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
