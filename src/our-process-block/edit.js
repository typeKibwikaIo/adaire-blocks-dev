import { __, sprintf } from "@wordpress/i18n";
import {
	useBlockProps,
	RichText,
	PanelColorSettings,
} from "@wordpress/block-editor";
import {
	PanelBody,
	ButtonGroup,
	Button,
	RangeControl,
	TextControl,
	BaseControl,
	SelectControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl,
} from "@wordpress/components";
import { useEffect, useState, createElement } from "@wordpress/element";
import { plus, trash, arrowUp, arrowDown, desktop, tablet, mobile } from "@wordpress/icons";
import BootstrapIconPicker from "./BootstrapIconPicker";
import InspectorTabs from "../components/InspectorTabs";
import QuickZone from "../components/QuickZone";
import "./editor.scss";

const DEFAULT_COLORS = [
	{
		name: __("Dark Navy", "our-process-block"),
		slug: "dark-navy",
		color: "#0a0e27",
	},
	{
		name: __("Dark Blue", "our-process-block"),
		slug: "dark-blue",
		color: "#1a1f3a",
	},
	{
		name: __("White", "our-process-block"),
		slug: "white",
		color: "#ffffff",
	},
	{
		name: __("Slate", "our-process-block"),
		slug: "slate",
		color: "#94a3b8",
	},
];

const CONTAINER_MODES = [
	{ label: __("Full Width", "our-process-block"), value: "full" },
	{ label: __("Constrained", "our-process-block"), value: "constrained" },
];

// Custom icons for small laptop and big desktop
const smallLaptopIcon = createElement('svg', {
	width: 24,
	height: 24,
	viewBox: '0 0 24 24',
	fill: 'none',
	xmlns: 'http://www.w3.org/2000/svg'
},
	createElement('path', {
		d: 'M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z',
		stroke: 'currentColor',
		strokeWidth: '1.5',
		fill: 'none'
	}),
	createElement('path', {
		d: 'M2 19H22',
		stroke: 'currentColor',
		strokeWidth: '1.5',
		strokeLinecap: 'round'
	})
);

const bigDesktopIcon = createElement('svg', {
	width: 24,
	height: 24,
	viewBox: '0 0 24 24',
	fill: 'none',
	xmlns: 'http://www.w3.org/2000/svg'
},
	createElement('rect', {
		x: '3',
		y: '4',
		width: '18',
		height: '12',
		rx: '1',
		stroke: 'currentColor',
		strokeWidth: '1.5',
		fill: 'none'
	}),
	createElement('path', {
		d: 'M8 20H16',
		stroke: 'currentColor',
		strokeWidth: '1.5',
		strokeLinecap: 'round'
	}),
	createElement('rect', {
		x: '10',
		y: '20',
		width: '4',
		height: '2',
		rx: '0.5',
		fill: 'currentColor'
	})
);

const BREAKPOINTS = [
	{ name: 'mobile', icon: mobile, label: __("Mobile", "our-process-block") },
	{ name: 'tablet', icon: tablet, label: __("Tablet", "our-process-block") },
	{ name: 'smallLaptop', icon: smallLaptopIcon, label: __("Small Laptop", "our-process-block") },
	{ name: 'desktop', icon: desktop, label: __("Desktop", "our-process-block") },
	{ name: 'bigDesktop', icon: bigDesktopIcon, label: __("Big Desktop", "our-process-block") }
];

const DEVICE_TYPES = [
	{ key: "desktop", label: __("Desktop", "our-process-block") },
	{ key: "tablet", label: __("Tablet", "our-process-block") },
	{ key: "mobile", label: __("Mobile", "our-process-block") },
];

const UNIT_OPTIONS = ["px", "%", "rem", "vw"];

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
	const value = dimension?.value ?? fallbackValue;
	const unit = dimension?.unit ?? fallbackUnit;
	return `${value}${unit}`;
};

const resolveStepLink = (rawLink) => {
	const trimmed = rawLink?.trim();
	if (!trimmed) {
		return "";
	}

	if (/^(https?:)?\/\//i.test(trimmed)) {
		return trimmed;
	}

	if (trimmed.startsWith("/")) {
		if (typeof window !== "undefined" && window.location?.origin) {
			return `${window.location.origin.replace(/\/$/, "")}${trimmed}`;
		}
		return trimmed;
	}

	return trimmed;
};

const OurProcessEdit = ({ attributes, setAttributes, clientId }) => {
	const [iconPickerOpenFor, setIconPickerOpenFor] = useState(null);
	const [deviceType, setDeviceType] = useState("desktop");
	const [activeZone, setActiveZone] = useState(null);

	const {
		blockId,
		containerMode,
		containerMaxWidth,
		heading,
		subheading,
		processSteps,
		backgroundColor,
		headingColor,
		subheadingColor,
		boxBackgroundColor,
		boxBorderColor,
		boxHoverBackgroundColor,
		boxHoverBorderColor,
		iconColor,
		titleColor,
		headingFontSize,
		subheadingFontSize,
		titleFontSize,
		iconSize,
		boxPadding,
		boxBorderRadius,
		boxBorderWidth,
		gridColumns,
		gridGap,
		paddingTop,
		paddingRight,
		paddingBottom,
		paddingLeft,
	} = attributes;

	const gridColumnsDesktop = gridColumns?.desktop ?? 3;
	const gridColumnsTablet =
		gridColumns?.tablet ?? Math.min(gridColumnsDesktop, 4);
	const gridColumnsMobile = gridColumns?.mobile ?? 1;

	const gridGapDesktop = gridGap?.desktop ?? 16;
	const gridGapTablet = gridGap?.tablet ?? gridGapDesktop;
	const gridGapMobile = gridGap?.mobile ?? gridGapTablet;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [blockId, clientId, setAttributes]);

	// Add a new process step
	const addProcessStep = () => {
		const newStep = {
			id: `step-${Date.now()}`,
			icon: "bi bi-star",
			title: __("New Step", "our-process-block"),
			description: "",
			linkUrl: "",
			openInNewTab: false,
		};
		setAttributes({ processSteps: [...(processSteps || []), newStep] });
	};

	// Remove a process step
	const removeProcessStep = (index) => {
		if (processSteps && processSteps.length > 1) {
			const newSteps = processSteps.filter((_, i) => i !== index);
			setAttributes({ processSteps: newSteps });
		}
	};

	// Move step up
	const moveStepUp = (index) => {
		if (index > 0 && processSteps) {
			const newSteps = [...processSteps];
			[newSteps[index], newSteps[index - 1]] = [
				newSteps[index - 1],
				newSteps[index],
			];
			setAttributes({ processSteps: newSteps });
		}
	};

	// Move step down
	const moveStepDown = (index) => {
		if (index < processSteps.length - 1 && processSteps) {
			const newSteps = [...processSteps];
			[newSteps[index], newSteps[index + 1]] = [
				newSteps[index + 1],
				newSteps[index],
			];
			setAttributes({ processSteps: newSteps });
		}
	};

	const updateContainerDimension = (device, property, value) => {
		const next = {
			...containerMaxWidth,
			[device]: {
				...containerMaxWidth?.[device],
				[property]: value,
			},
		};
		setAttributes({ containerMaxWidth: next });
	};

	const updateFontSize = (fontSizeAttr, device, property, value) => {
		const current = attributes[fontSizeAttr] || {};
		const next = {
			...current,
			[device]: {
				...current[device],
				[property]: value,
			},
		};
		setAttributes({ [fontSizeAttr]: next });
	};

	const blockProps = useBlockProps({
		id: blockId || undefined,
		className: "adaire-our-process",
		style: {
			"--process-bg": backgroundColor,
			"--process-heading-color": headingColor,
			"--process-subheading-color": subheadingColor,
			"--process-box-bg": boxBackgroundColor,
			"--process-box-border": boxBorderColor,
			"--process-box-hover-bg": boxHoverBackgroundColor,
			"--process-box-hover-border": boxHoverBorderColor,
			"--process-icon-color": iconColor,
			"--process-title-color": titleColor,
			"--process-heading-size": formatDimensionValue(
				headingFontSize?.desktop,
				48,
				"px",
			),
			"--process-heading-size-tablet": formatDimensionValue(
				headingFontSize?.tablet,
				36,
				"px",
			),
			"--process-heading-size-mobile": formatDimensionValue(
				headingFontSize?.mobile,
				28,
				"px",
			),
			"--process-subheading-size": formatDimensionValue(
				subheadingFontSize?.desktop,
				18,
				"px",
			),
			"--process-subheading-size-tablet": formatDimensionValue(
				subheadingFontSize?.tablet,
				16,
				"px",
			),
			"--process-subheading-size-mobile": formatDimensionValue(
				subheadingFontSize?.mobile,
				14,
				"px",
			),
			"--process-title-size": formatDimensionValue(
				titleFontSize?.desktop,
				18,
				"px",
			),
			"--process-title-size-tablet": formatDimensionValue(
				titleFontSize?.tablet,
				16,
				"px",
			),
			"--process-title-size-mobile": formatDimensionValue(
				titleFontSize?.mobile,
				14,
				"px",
			),
			"--process-icon-size": `${iconSize}px`,
			"--process-box-padding": `${boxPadding}px`,
			"--process-box-radius": `${boxBorderRadius}px`,
			"--process-box-border-width": `${boxBorderWidth}px`,
			"--process-grid-columns": `${gridColumnsDesktop}`,
			"--process-grid-columns-tablet": `${gridColumnsTablet}`,
			"--process-grid-columns-mobile": `${gridColumnsMobile}`,
			"--process-grid-gap": `${gridGapDesktop}px`,
			"--process-grid-gap-tablet": `${gridGapTablet}px`,
			"--process-grid-gap-mobile": `${gridGapMobile}px`,
			"--container-max-width-mobile": formatDimensionValue(
				containerMaxWidth?.mobile,
				100,
				"%",
			),
			"--container-max-width-tablet": formatDimensionValue(
				containerMaxWidth?.tablet,
				100,
				"%",
			),
			"--container-max-width-small-laptop": formatDimensionValue(
				containerMaxWidth?.smallLaptop,
				1200,
				"px",
			),
			"--container-max-width": formatDimensionValue(
				containerMaxWidth?.desktop,
				1200,
				"px",
			),
			"--container-max-width-big-desktop": formatDimensionValue(
				containerMaxWidth?.bigDesktop,
				1200,
				"px",
			),
			"--process-padding-top": `${paddingTop?.desktop ?? 80}px`,
			"--process-padding-right": `${paddingRight?.desktop ?? 20}px`,
			"--process-padding-bottom": `${paddingBottom?.desktop ?? 80}px`,
			"--process-padding-left": `${paddingLeft?.desktop ?? 20}px`,
			"--process-padding-top-tablet": `${paddingTop?.tablet ?? paddingTop?.desktop ?? 60}px`,
			"--process-padding-right-tablet": `${paddingRight?.tablet ?? paddingRight?.desktop ?? 20}px`,
			"--process-padding-bottom-tablet": `${paddingBottom?.tablet ?? paddingBottom?.desktop ?? 60}px`,
			"--process-padding-left-tablet": `${paddingLeft?.tablet ?? paddingLeft?.desktop ?? 20}px`,
			"--process-padding-top-mobile": `${paddingTop?.mobile ?? paddingTop?.tablet ?? paddingTop?.desktop ?? 40}px`,
			"--process-padding-right-mobile": `${paddingRight?.mobile ?? paddingRight?.tablet ?? paddingRight?.desktop ?? 20}px`,
			"--process-padding-bottom-mobile": `${paddingBottom?.mobile ?? paddingBottom?.tablet ?? paddingBottom?.desktop ?? 40}px`,
			"--process-padding-left-mobile": `${paddingLeft?.mobile ?? paddingLeft?.tablet ?? paddingLeft?.desktop ?? 20}px`,
		},
	});

	const containerClasses = [
		"adaire-our-process__container",
		containerMode === "constrained" ? "is-constrained" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<>
			<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
				<PanelBody title={__("Layout", "our-process-block")} initialOpen={true}>
					<p>{__("Container Width", "our-process-block")}</p>
					<ButtonGroup>
						{CONTAINER_MODES.map((mode) => (
							<Button
								key={mode.value}
								isPrimary={containerMode === mode.value}
								onClick={() => setAttributes({ containerMode: mode.value })}
							>
								{mode.label}
							</Button>
						))}
					</ButtonGroup>

					<div className="adaire-our-process__dimension-controls">
						<br />
						{BREAKPOINTS.map((breakpoint) => (
							<div
								key={breakpoint.name}
								className="adaire-our-process__dimension-row"
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
									<strong>{breakpoint.label}</strong>
								</div>
								<div className="adaire-our-process__dimension-inputs">
									{(() => {
										const isMobileOrTablet = breakpoint.name === "mobile" || breakpoint.name === "tablet";
										const unit =
											containerMaxWidth?.[breakpoint.name]?.unit ??
											(isMobileOrTablet ? "%" : "px");
										const value =
											containerMaxWidth?.[breakpoint.name]?.value ??
											(unit === "px"
												? 1200
												: 100);
										const min =
											unit === "px"
												? 400
												: 10;
										const max =
											unit === "px"
												? 10000
												: 100;

										return (
											<RangeControl
												label={__("Max Width", "our-process-block")}
												value={value}
												onChange={(rangeValue) =>
													updateContainerDimension(
														breakpoint.name,
														"value",
														rangeValue,
													)
												}
												min={min}
												max={max}
												step={unit === "px" ? 10 : 1}
											/>
										);
									})()}
									<ButtonGroup>
										{UNIT_OPTIONS.map((unit) => (
											<Button
												key={unit}
												isSmall
												isPrimary={
													containerMaxWidth?.[breakpoint.name]?.unit === unit
												}
												onClick={() =>
													updateContainerDimension(breakpoint.name, "unit", unit)
												}
											>
												{unit}
											</Button>
										))}
									</ButtonGroup>
								</div>
								<br />
							</div>
						))}
					</div>

					<RangeControl
						label={__("Grid Columns (Desktop)", "our-process-block")}
						value={gridColumns?.desktop || 3}
						onChange={(value) =>
							setAttributes({
								gridColumns: { ...gridColumns, desktop: value },
							})
						}
						min={1}
						max={6}
					/>

					<RangeControl
						label={__("Grid Columns (Tablet)", "our-process-block")}
						value={gridColumns?.tablet || 2}
						onChange={(value) =>
							setAttributes({
								gridColumns: { ...gridColumns, tablet: value },
							})
						}
						min={1}
						max={4}
					/>

					<RangeControl
						label={__("Grid Columns (Mobile)", "our-process-block")}
						value={gridColumns?.mobile || 1}
						onChange={(value) =>
							setAttributes({
								gridColumns: { ...gridColumns, mobile: value },
							})
						}
						min={1}
						max={2}
					/>

					<p style={{ marginTop: "16px" }}><strong>{__("Grid Gap", "our-process-block")}</strong></p>
					{DEVICE_TYPES.map((device) => (
						<div key={device.key}>
							<RangeControl
								label={device.label}
								value={
									gridGap?.[device.key] ?? (device.key === "desktop" ? 16 : gridGap?.desktop ?? 16)
								}
								onChange={(value) =>
									setAttributes({
										gridGap: { ...gridGap, [device.key]: value },
									})
								}
								min={0}
								max={64}
							/>
						</div>
					))}
				</PanelBody>

				<PanelBody title={__("Content", "our-process-block")} initialOpen={false}>
					<TextControl
						label={__("Heading", "our-process-block")}
						value={heading}
						onChange={(value) => setAttributes({ heading: value })}
					/>
					<TextControl
						label={__("Subheading", "our-process-block")}
						value={subheading}
						onChange={(value) => setAttributes({ subheading: value })}
					/>
				</PanelBody>

				<PanelBody
					title={__("Process Steps", "our-process-block")}
					initialOpen={false}
				>
					<p className="adaire-our-process__panel-help">
						{__(
							"Update the icon and title for each process step. Use the buttons to reorder or remove steps.",
							"our-process-block",
						)}
					</p>
					{processSteps?.map((item, index) => (
						<div
							key={item.id || index}
							className="adaire-our-process__step-control"
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "12px",
								}}
							>
								<strong>
									{sprintf(__("Step %d", "our-process-block"), index + 1)}
								</strong>
								<div style={{ display: "flex", gap: "4px" }}>
									<Button
										icon={arrowUp}
										onClick={() => moveStepUp(index)}
										isSmall
										disabled={index === 0}
										label={__("Move Up", "our-process-block")}
									/>
									<Button
										icon={arrowDown}
										onClick={() => moveStepDown(index)}
										isSmall
										disabled={index === processSteps.length - 1}
										label={__("Move Down", "our-process-block")}
									/>
									{processSteps.length > 1 && (
										<Button
											icon={trash}
											onClick={() => removeProcessStep(index)}
											isSmall
											isDestructive
											label={__("Remove", "our-process-block")}
										/>
									)}
								</div>
							</div>
							<BaseControl label={__("Icon", "our-process-block")}>
								<Button
									onClick={() => setIconPickerOpenFor(index)}
									variant="secondary"
									style={{ width: "100%", marginBottom: "12px" }}
								>
									{item.icon ? (
										<>
											<i
												className={item.icon}
												style={{ marginRight: "8px" }}
											></i>
											{item.icon}
										</>
									) : (
										__("Choose Bootstrap Icon", "our-process-block")
									)}
								</Button>
								{item.icon && (
									<Button
										onClick={() => {
											const nextSteps = [...processSteps];
											nextSteps[index] = { ...nextSteps[index], icon: "" };
											setAttributes({ processSteps: nextSteps });
										}}
										variant="link"
										isDestructive
										style={{ width: "100%" }}
									>
										{__("Remove Icon", "our-process-block")}
									</Button>
								)}
							</BaseControl>
							<TextControl
								label={__("Title", "our-process-block")}
								value={item.title}
								onChange={(value) => {
									const nextSteps = [...processSteps];
									nextSteps[index] = { ...nextSteps[index], title: value };
									setAttributes({ processSteps: nextSteps });
								}}
							/>
							<TextControl
								label={__("Link URL", "our-process-block")}
								help={__(
									"Supports full URLs or site-relative paths like /contact.",
									"our-process-block",
								)}
								value={item.linkUrl || ""}
								onChange={(value) => {
									const nextSteps = [...processSteps];
									nextSteps[index] = { ...nextSteps[index], linkUrl: value };
									setAttributes({ processSteps: nextSteps });
								}}
								placeholder="https://example.com"
							/>
							<ToggleControl
								label={__("Open link in new tab", "our-process-block")}
								checked={!!item.openInNewTab}
								disabled={!item.linkUrl}
								onChange={(value) => {
									const nextSteps = [...processSteps];
									nextSteps[index] = {
										...nextSteps[index],
										openInNewTab: value,
									};
									setAttributes({ processSteps: nextSteps });
								}}
							/>
						</div>
					))}
					<Button
						icon={plus}
						onClick={addProcessStep}
						variant="secondary"
						style={{ marginTop: "12px" }}
					>
						{__("Add Process Step", "our-process-block")}
					</Button>
				</PanelBody>

				<PanelColorSettings
					title={__("Colors", "our-process-block")}
					initialOpen={false}
					colorSettings={[
						{
							value: backgroundColor,
							onChange: (value) => setAttributes({ backgroundColor: value }),
							label: __("Background Color", "our-process-block"),
							colors: DEFAULT_COLORS,
						},
						{
							value: headingColor,
							onChange: (value) => setAttributes({ headingColor: value }),
							label: __("Heading Color", "our-process-block"),
							colors: DEFAULT_COLORS,
						},
						{
							value: subheadingColor,
							onChange: (value) => setAttributes({ subheadingColor: value }),
							label: __("Subheading Color", "our-process-block"),
							colors: DEFAULT_COLORS,
						},
						{
							value: boxBackgroundColor,
							onChange: (value) => setAttributes({ boxBackgroundColor: value }),
							label: __("Box Background", "our-process-block"),
							colors: DEFAULT_COLORS,
						},
						{
							value: boxBorderColor,
							onChange: (value) => setAttributes({ boxBorderColor: value }),
							label: __("Box Border", "our-process-block"),
							colors: DEFAULT_COLORS,
						},
						{
							value: boxHoverBackgroundColor,
							onChange: (value) =>
								setAttributes({ boxHoverBackgroundColor: value }),
							label: __("Box Hover Background", "our-process-block"),
							colors: DEFAULT_COLORS,
						},
						{
							value: boxHoverBorderColor,
							onChange: (value) =>
								setAttributes({ boxHoverBorderColor: value }),
							label: __("Box Hover Border", "our-process-block"),
							colors: DEFAULT_COLORS,
						},
						{
							value: iconColor,
							onChange: (value) => setAttributes({ iconColor: value }),
							label: __("Icon Color", "our-process-block"),
							colors: DEFAULT_COLORS,
						},
						{
							value: titleColor,
							onChange: (value) => setAttributes({ titleColor: value }),
							label: __("Title Color", "our-process-block"),
							colors: DEFAULT_COLORS,
						},
					]}
				/>

				<PanelBody title={__("Box Styling", "our-process-block")} initialOpen={false}>
					<RangeControl
						label={__("Box Padding", "our-process-block")}
						value={boxPadding}
						onChange={(value) => setAttributes({ boxPadding: value })}
						min={0}
						max={64}
					/>
					<RangeControl
						label={__("Box Border Radius", "our-process-block")}
						value={boxBorderRadius}
						onChange={(value) => setAttributes({ boxBorderRadius: value })}
						min={0}
						max={32}
					/>
					<RangeControl
						label={__("Box Border Width", "our-process-block")}
						value={boxBorderWidth}
						onChange={(value) => setAttributes({ boxBorderWidth: value })}
						min={0}
						max={8}
					/>
					<RangeControl
						label={__("Icon Size", "our-process-block")}
						value={iconSize}
						onChange={(value) => setAttributes({ iconSize: value })}
						min={16}
						max={64}
					/>
				</PanelBody>

				<PanelBody
					title={__("Padding", "our-process-block")}
					initialOpen={false}
				>
					<p style={{ marginBottom: "8px", fontWeight: 600 }}>
						{__("Device", "our-process-block")}
					</p>
					<ButtonGroup style={{ marginBottom: "12px", flexWrap: "wrap" }}>
						<Button
							icon={mobile}
							isPrimary={deviceType === "mobile"}
							onClick={() => setDeviceType("mobile")}
							label={__("Mobile", "our-process-block")}
						/>
						<Button
							icon={tablet}
							isPrimary={deviceType === "tablet"}
							onClick={() => setDeviceType("tablet")}
							label={__("Tablet", "our-process-block")}
						/>
						<Button
							icon={desktop}
							isPrimary={deviceType === "desktop"}
							onClick={() => setDeviceType("desktop")}
							label={__("Desktop", "our-process-block")}
						/>
					</ButtonGroup>
					<BoxControl
						label={__("Padding", "our-process-block")}
						values={{
							top: `${paddingTop?.[deviceType] ?? (deviceType === "desktop" ? 80 : deviceType === "tablet" ? 60 : 40)}px`,
							right: `${paddingRight?.[deviceType] ?? 20}px`,
							bottom: `${paddingBottom?.[deviceType] ?? (deviceType === "desktop" ? 80 : deviceType === "tablet" ? 60 : 40)}px`,
							left: `${paddingLeft?.[deviceType] ?? 20}px`,
						}}
						onChange={(value) => {
							setAttributes({
								paddingTop: {
									...(paddingTop || {}),
									[deviceType]: parseInt(value.top) || 0,
								},
								paddingRight: {
									...(paddingRight || {}),
									[deviceType]: parseInt(value.right) || 0,
								},
								paddingBottom: {
									...(paddingBottom || {}),
									[deviceType]: parseInt(value.bottom) || 0,
								},
								paddingLeft: {
									...(paddingLeft || {}),
									[deviceType]: parseInt(value.left) || 0,
								},
							});
						}}
					/>
				</PanelBody>

				<PanelBody
					title={__("Typography", "our-process-block")}
					initialOpen={false}
				>
					<p><strong>{__("Heading Font Size", "our-process-block")}</strong></p>
					{DEVICE_TYPES.map((device) => (
						<div key={device.key}>
							<RangeControl
								label={device.label}
								value={headingFontSize?.[device.key]?.value || (device.key === "desktop" ? 48 : device.key === "tablet" ? 36 : 28)}
								onChange={(value) =>
									updateFontSize("headingFontSize", device.key, "value", value)
								}
								min={16}
								max={96}
							/>
						</div>
					))}

					<p style={{ marginTop: "16px" }}><strong>{__("Subheading Font Size", "our-process-block")}</strong></p>
					{DEVICE_TYPES.map((device) => (
						<div key={device.key}>
							<RangeControl
								label={device.label}
								value={subheadingFontSize?.[device.key]?.value || (device.key === "desktop" ? 18 : device.key === "tablet" ? 16 : 14)}
								onChange={(value) =>
									updateFontSize("subheadingFontSize", device.key, "value", value)
								}
								min={12}
								max={32}
							/>
						</div>
					))}

					<p style={{ marginTop: "16px" }}><strong>{__("Title Font Size", "our-process-block")}</strong></p>
					{DEVICE_TYPES.map((device) => (
						<div key={device.key}>
							<RangeControl
								label={device.label}
								value={titleFontSize?.[device.key]?.value || (device.key === "desktop" ? 18 : device.key === "tablet" ? 16 : 14)}
								onChange={(value) =>
									updateFontSize("titleFontSize", device.key, "value", value)
								}
								min={12}
								max={32}
							/>
						</div>
					))}
				</PanelBody>
			</InspectorTabs>

			<BootstrapIconPicker
				isOpen={iconPickerOpenFor !== null}
				onClose={() => setIconPickerOpenFor(null)}
				onSelect={(iconClass) => {
					if (iconPickerOpenFor !== null) {
						const nextSteps = [...processSteps];
						nextSteps[iconPickerOpenFor] = {
							...nextSteps[iconPickerOpenFor],
							icon: iconClass,
						};
						setAttributes({ processSteps: nextSteps });
					}
				}}
				currentIcon={
					iconPickerOpenFor !== null
						? processSteps[iconPickerOpenFor]?.icon
						: ""
				}
			/>

			<div {...blockProps}>
				<div className={containerClasses}>
					<div className="adaire-our-process__header">
						<RichText
							tagName="h2"
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							placeholder={__("Enter heading...", "our-process-block")}
							className="adaire-our-process__heading"
						/>
						<RichText
							tagName="p"
							value={subheading}
							onChange={(value) => setAttributes({ subheading: value })}
							placeholder={__("Enter subheading...", "our-process-block")}
							className="adaire-our-process__subheading"
						/>
					</div>

					<QuickZone
						id="layout"
						label={__("Layout", "our-process-block")}
						activeZone={activeZone}
						setActiveZone={setActiveZone}
						content={
							<>
								<RangeControl
									label={__("Grid Columns (Desktop)", "our-process-block")}
									value={gridColumns?.desktop || 3}
									onChange={(value) =>
										setAttributes({
											gridColumns: { ...gridColumns, desktop: value },
										})
									}
									min={1}
									max={6}
								/>
								<RangeControl
									label={__("Grid Gap", "our-process-block")}
									value={gridGap?.desktop ?? 16}
									onChange={(value) =>
										setAttributes({
											gridGap: { ...gridGap, desktop: value },
										})
									}
									min={0}
									max={64}
								/>
							</>
						}
					>
					<div className="adaire-our-process__grid">
						{processSteps?.map((step, index) => (
							(() => {
								const href = resolveStepLink(step.linkUrl);
								const StepTag = href ? "a" : "div";
								const stepProps = {
									className: "adaire-our-process__step",
								};

								if (href) {
									stepProps.href = href;
									stepProps.target = step.openInNewTab ? "_blank" : undefined;
									stepProps.rel = step.openInNewTab
										? "noopener noreferrer"
										: undefined;
								}

								return (
									<StepTag key={step.id || index} {...stepProps}>
								<div className="adaire-our-process__step-icon">
											<i
												className={step.icon || "bi bi-star"}
												aria-hidden="true"
											/>
								</div>
								<RichText
									tagName="h3"
									value={step.title}
									onChange={(value) => {
										const nextSteps = [...processSteps];
										nextSteps[index] = { ...nextSteps[index], title: value };
										setAttributes({ processSteps: nextSteps });
									}}
									placeholder={__("Step title...", "our-process-block")}
									className="adaire-our-process__step-title"
									allowedFormats={[]}
								/>
									</StepTag>
								);
							})()
						))}
					</div>
					</QuickZone>
				</div>
			</div>
		</>
	);
};

export default OurProcessEdit;



