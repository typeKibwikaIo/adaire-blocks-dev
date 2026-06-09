import { __, sprintf } from "@wordpress/i18n";
import {
	useBlockProps,
	RichText,
	InspectorControls,
	PanelColorSettings,
	MediaUpload,
	MediaUploadCheck,
} from "@wordpress/block-editor";
import {
	PanelBody,
	ButtonGroup,
	Button,
	RangeControl,
	TextControl,
	BaseControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl,
} from "@wordpress/components";
import { useEffect, useState, createElement } from "@wordpress/element";
import { plus, trash, arrowUp, arrowDown, desktop, tablet, mobile } from "@wordpress/icons";
import BootstrapIconPicker from "./BootstrapIconPicker";
import "./editor.scss";

const DEFAULT_COLORS = [
	{
		name: __("Adaire Red", "industries-block"),
		slug: "adaire-red",
		color: "#ff4e4e",
	},
	{
		name: __("Midnight", "industries-block"),
		slug: "adaire-midnight",
		color: "#0f172a",
	},
	{ name: __("Ink", "industries-block"), slug: "adaire-ink", color: "#111111" },
	{
		name: __("Ocean", "industries-block"),
		slug: "adaire-ocean",
		color: "#2563eb",
	},
	{
		name: __("White", "industries-block"),
		slug: "adaire-white",
		color: "#ffffff",
	},
	{
		name: __("Slate", "industries-block"),
		slug: "adaire-slate",
		color: "#7e7c8a",
	},
];

const CONTAINER_MODES = [
	{ label: __("Full Width", "industries-block"), value: "full" },
	{ label: __("Constrained", "industries-block"), value: "constrained" },
];

const DEVICE_TYPES = [
	{ key: "desktop", label: __("Desktop", "industries-block") },
	{ key: "tablet", label: __("Tablet", "industries-block") },
	{ key: "mobile", label: __("Mobile", "industries-block") },
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
	{ name: 'mobile', icon: mobile, label: __("Mobile", "industries-block") },
	{ name: 'tablet', icon: tablet, label: __("Tablet", "industries-block") },
	{ name: 'smallLaptop', icon: smallLaptopIcon, label: __("Small Laptop", "industries-block") },
	{ name: 'desktop', icon: desktop, label: __("Desktop", "industries-block") },
	{ name: 'bigDesktop', icon: bigDesktopIcon, label: __("Big Desktop", "industries-block") }
];

const UNIT_OPTIONS = ["px", "%", "rem", "vw"];

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
	const value = dimension?.value ?? fallbackValue;
	const unit = dimension?.unit ?? fallbackUnit;
	return `${value}${unit}`;
};

const IndustriesEdit = ({ attributes, setAttributes, clientId }) => {
	const [iconPickerOpenFor, setIconPickerOpenFor] = useState(null); // Track which industry's icon picker is open
	const [deviceType, setDeviceType] = useState("desktop");

	const {
		blockId,
		containerMode,
		containerMaxWidth,
		headerLines,
		introText,
		descriptionText,
		featureImage,
		imageWidth,
		imageHeight,
		industries,
		backgroundColor,
		headerColor,
		headerAccentColor,
		headerFontWeight,
		headerFontSize,
		headerAccentFontSize,
		headerAccentWidth,
		introFontSize,
		descriptionFontSize,
		chevronColor,
		chevronSize,
		tilePadding,
		tilePaddingMobile,
		tileBorderRadius,
		tileBorderColor,
		tileIconColor,
		tileIconBackground,
		tileIconSize,
		tileTitleFontSize,
		tileTextColor,
		tileHoverBackground,
		tileHoverTextColor,
		showTitle,
		showIntroText,
		showImage,
		hideFirstTwoIndustries,
		containerPaddingTop,
		containerPaddingRight,
		containerPaddingBottom,
		containerPaddingLeft,
	} = attributes;

	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [blockId, clientId, setAttributes]);

	// Add a new industry
	const addIndustry = () => {
		const newIndustry = {
			id: `industry-${Date.now()}`,
			icon: "bi bi-star",
			label: __("New Industry", "industries-block"),
			linkUrl: "",
			openInNewTab: false,
		};
		setAttributes({ industries: [...(industries || []), newIndustry] });
	};

	// Remove an industry
	const removeIndustry = (index) => {
		if (industries && industries.length > 1) {
			const newIndustries = industries.filter((_, i) => i !== index);
			setAttributes({ industries: newIndustries });
		}
	};

	// Move industry up
	const moveIndustryUp = (index) => {
		if (index > 0 && industries) {
			const newIndustries = [...industries];
			[newIndustries[index], newIndustries[index - 1]] = [
				newIndustries[index - 1],
				newIndustries[index],
			];
			setAttributes({ industries: newIndustries });
		}
	};

	// Move industry down
	const moveIndustryDown = (index) => {
		if (index < industries.length - 1 && industries) {
			const newIndustries = [...industries];
			[newIndustries[index], newIndustries[index + 1]] = [
				newIndustries[index + 1],
				newIndustries[index],
			];
			setAttributes({ industries: newIndustries });
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
		className: "adaire-industries",
		style: {
			"--industries-bg": backgroundColor,
			"--industries-header-color": headerColor,
			"--industries-header-accent-color": headerAccentColor,
			"--industries-header-weight": headerFontWeight,
			"--industries-header-size": formatDimensionValue(
				headerFontSize?.desktop,
				60,
				"px",
			),
			"--industries-header-size-tablet": formatDimensionValue(
				headerFontSize?.tablet,
				40,
				"px",
			),
			"--industries-header-size-mobile": formatDimensionValue(
				headerFontSize?.mobile,
				36,
				"px",
			),
			"--industries-header-accent-size": formatDimensionValue(
				headerAccentFontSize?.desktop,
				60,
				"px",
			),
			"--industries-header-accent-size-tablet": formatDimensionValue(
				headerAccentFontSize?.tablet,
				40,
				"px",
			),
			"--industries-header-accent-size-mobile": formatDimensionValue(
				headerAccentFontSize?.mobile,
				36,
				"px",
			),
			"--industries-header-accent-width": formatDimensionValue(
				headerAccentWidth?.desktop,
				100,
				"%",
			),
			"--industries-header-accent-width-tablet": formatDimensionValue(
				headerAccentWidth?.tablet,
				100,
				"%",
			),
			"--industries-header-accent-width-mobile": formatDimensionValue(
				headerAccentWidth?.mobile,
				100,
				"%",
			),
			"--industries-intro-size": formatDimensionValue(
				introFontSize?.desktop,
				20,
				"px",
			),
			"--industries-intro-size-tablet": formatDimensionValue(
				introFontSize?.tablet,
				18,
				"px",
			),
			"--industries-intro-size-mobile": formatDimensionValue(
				introFontSize?.mobile,
				16,
				"px",
			),
			"--industries-description-size": formatDimensionValue(
				descriptionFontSize?.desktop,
				24,
				"px",
			),
			"--industries-description-size-tablet": formatDimensionValue(
				descriptionFontSize?.tablet,
				20,
				"px",
			),
			"--industries-description-size-mobile": formatDimensionValue(
				descriptionFontSize?.mobile,
				18,
				"px",
			),
			"--industries-chevron-color": chevronColor,
			"--industries-chevron-size": `${chevronSize}px`,
			"--industries-tile-padding": `${tilePadding}px`,
			"--industries-tile-padding-mobile": `${tilePaddingMobile}px`,
			"--industries-tile-radius": `${tileBorderRadius}px`,
			"--industries-tile-border-color": tileBorderColor,
			"--industries-icon-color": tileIconColor,
			"--industries-icon-size": `${tileIconSize}px`,
			"--industries-icon-bg": tileIconBackground,
			"--industries-title-color": tileTextColor,
			"--industries-title-size": `${tileTitleFontSize}px`,
			"--industries-tile-hover-bg": tileHoverBackground,
			"--industries-tile-hover-text": tileHoverTextColor,
			"--industries-image-width": (() => {
				const val = imageWidth?.desktop?.value;
				return val === "auto" || !val ? "auto" : formatDimensionValue(imageWidth?.desktop, 100, "%");
			})(),
			"--industries-image-width-tablet": (() => {
				const val = imageWidth?.tablet?.value;
				return val === "auto" || !val ? "auto" : formatDimensionValue(imageWidth?.tablet, 100, "%");
			})(),
			"--industries-image-width-mobile": (() => {
				const val = imageWidth?.mobile?.value;
				return val === "auto" || !val ? "auto" : formatDimensionValue(imageWidth?.mobile, 100, "%");
			})(),
			"--industries-image-height": (() => {
				const val = imageHeight?.desktop?.value;
				return val === "auto" || !val ? "auto" : formatDimensionValue(imageHeight?.desktop, 300, "px");
			})(),
			"--industries-image-height-tablet": (() => {
				const val = imageHeight?.tablet?.value;
				return val === "auto" || !val ? "auto" : formatDimensionValue(imageHeight?.tablet, 300, "px");
			})(),
			"--industries-image-height-mobile": (() => {
				const val = imageHeight?.mobile?.value;
				return val === "auto" || !val ? "auto" : formatDimensionValue(imageHeight?.mobile, 300, "px");
			})(),
			"--container-max-width": formatDimensionValue(
				containerMaxWidth?.desktop,
				1200,
				"px",
			),
			"--container-max-width-tablet": formatDimensionValue(
				containerMaxWidth?.tablet,
				100,
				"%",
			),
			"--container-max-width-mobile": formatDimensionValue(
				containerMaxWidth?.mobile,
				100,
				"%",
			),
			"--container-padding-top": `${containerPaddingTop?.desktop ?? 80}px`,
			"--container-padding-right": `${containerPaddingRight?.desktop ?? 0}px`,
			"--container-padding-bottom": `${containerPaddingBottom?.desktop ?? 80}px`,
			"--container-padding-left": `${containerPaddingLeft?.desktop ?? 0}px`,
			"--container-padding-top-tablet": `${containerPaddingTop?.tablet ?? containerPaddingTop?.desktop ?? 80}px`,
			"--container-padding-right-tablet": `${containerPaddingRight?.tablet ?? containerPaddingRight?.desktop ?? 0}px`,
			"--container-padding-bottom-tablet": `${containerPaddingBottom?.tablet ?? containerPaddingBottom?.desktop ?? 80}px`,
			"--container-padding-left-tablet": `${containerPaddingLeft?.tablet ?? containerPaddingLeft?.desktop ?? 0}px`,
			"--container-padding-top-small-laptop": `${containerPaddingTop?.smallLaptop ?? containerPaddingTop?.desktop ?? 80}px`,
			"--container-padding-right-small-laptop": `${containerPaddingRight?.smallLaptop ?? containerPaddingRight?.desktop ?? 0}px`,
			"--container-padding-bottom-small-laptop": `${containerPaddingBottom?.smallLaptop ?? containerPaddingBottom?.desktop ?? 80}px`,
			"--container-padding-left-small-laptop": `${containerPaddingLeft?.smallLaptop ?? containerPaddingLeft?.desktop ?? 0}px`,
			"--container-padding-top-mobile": `${containerPaddingTop?.mobile ?? containerPaddingTop?.tablet ?? containerPaddingTop?.desktop ?? 80}px`,
			"--container-padding-right-mobile": `${containerPaddingRight?.mobile ?? containerPaddingRight?.tablet ?? containerPaddingRight?.desktop ?? 0}px`,
			"--container-padding-bottom-mobile": `${containerPaddingBottom?.mobile ?? containerPaddingBottom?.tablet ?? containerPaddingBottom?.desktop ?? 80}px`,
			"--container-padding-left-mobile": `${containerPaddingLeft?.mobile ?? containerPaddingLeft?.tablet ?? containerPaddingLeft?.desktop ?? 0}px`,
			"--container-padding-top-big-desktop": `${containerPaddingTop?.bigDesktop ?? containerPaddingTop?.desktop ?? 80}px`,
			"--container-padding-right-big-desktop": `${containerPaddingRight?.bigDesktop ?? containerPaddingRight?.desktop ?? 0}px`,
			"--container-padding-bottom-big-desktop": `${containerPaddingBottom?.bigDesktop ?? containerPaddingBottom?.desktop ?? 80}px`,
			"--container-padding-left-big-desktop": `${containerPaddingLeft?.bigDesktop ?? containerPaddingLeft?.desktop ?? 0}px`,
		},
	});

	const containerClasses = [
		"adaire-industries__container",
		containerMode === "constrained" ? "is-constrained" : "",
	]
		.filter(Boolean)
		.join(" ");

	const renderIndustryItem = (item, index, className = "") => {
		const hasLink = item.linkUrl && item.linkUrl.trim() !== "";
		const linkProps = hasLink
			? {
					href: item.linkUrl,
					target: item.openInNewTab ? "_blank" : "_self",
					rel: item.openInNewTab ? "noopener noreferrer" : undefined,
			  }
			: {};

		const industryContent = (
			<>
				<div>
					<span className="adaire-industries__industry-icon">
						<i className={item.icon || "bi bi-star"} aria-hidden="true" />
					</span>
				</div>
				<div className="adaire-industries__industry-row">
					<RichText
						tagName="p"
						value={item.label}
						onChange={(value) => {
							const nextItems = [...industries];
							nextItems[index] = { ...nextItems[index], label: value };
							setAttributes({ industries: nextItems });
						}}
						placeholder={__("Industry nameâ€¦", "industries-block")}
						allowedFormats={[]}
					/>
					<i
						className="bi bi-chevron-right adaire-industries__chevron"
						aria-hidden="true"
					/>
				</div>
			</>
		);

		const classes = `adaire-industries__industry${
			className ? ` ${className}` : ""
		}`;

		if (hasLink) {
			return (
				<a key={item.id || index} className={classes} {...linkProps}>
					{industryContent}
				</a>
			);
		}

		return (
			<div key={item.id || index} className={classes}>
				{industryContent}
			</div>
		);
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Layout", "industries-block")} initialOpen={true}>
					<p>{__("Container Width", "industries-block")}</p>
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
					<div
						style={{
							marginTop: "20px",
							paddingTop: "20px",
							borderTop: "1px solid #ddd",
						}}
					>
						<ToggleControl
							label={__("Show Title", "industries-block")}
							checked={showTitle !== false}
							onChange={(value) => setAttributes({ showTitle: value })}
							help={
								showTitle !== false
									? __("Title is visible", "industries-block")
									: __("Title is hidden (space preserved)", "industries-block")
							}
						/>
						<ToggleControl
							label={__("Show Intro Text", "industries-block")}
							checked={showIntroText !== false}
							onChange={(value) => setAttributes({ showIntroText: value })}
							help={
								showIntroText !== false
									? __("Intro text is visible", "industries-block")
									: __(
											"Intro text is hidden (space preserved)",
											"industries-block",
									  )
							}
						/>
						<ToggleControl
							label={__("Show Image", "industries-block")}
							checked={showImage !== false}
							onChange={(value) => setAttributes({ showImage: value })}
							help={
								showImage !== false
									? __("Image is visible", "industries-block")
									: __("Image is hidden (space preserved)", "industries-block")
							}
						/>
					</div>
					<div
						style={{
							marginTop: "20px",
							paddingTop: "20px",
							borderTop: "1px solid #ddd",
						}}
					>
						<ToggleControl
							label={__("Hide First Two Industries", "industries-block")}
							checked={hideFirstTwoIndustries === true}
							onChange={(value) =>
								setAttributes({ hideFirstTwoIndustries: value })
							}
							help={
								hideFirstTwoIndustries
									? __(
											"First two industries are hidden from layout",
											"industries-block",
									  )
									: __(
											"First two industries are visible in layout",
											"industries-block",
									  )
							}
						/>
					</div>
					<div className="adaire-industries__dimension-controls">
						{DEVICE_TYPES.map((device) => (
							<div
								key={device.key}
								className="adaire-industries__dimension-row"
							>
								<strong>{device.label}</strong>
								<div className="adaire-industries__dimension-inputs">
									{(() => {
										const unit =
											containerMaxWidth?.[device.key]?.unit ??
											(device.key === "desktop" ? "px" : "%");
										const value =
											containerMaxWidth?.[device.key]?.value ??
											(unit === "px"
												? device.key === "desktop"
													? 1200
													: 600
												: 100);
										const min =
											unit === "px"
												? device.key === "desktop"
													? 400
													: 200
												: 10;
										const max =
											unit === "px"
												? device.key === "desktop"
													? 2000
													: 1200
												: 100;

										return (
											<RangeControl
												label={__("Max Width", "industries-block")}
												value={value}
												onChange={(rangeValue) =>
													updateContainerDimension(
														device.key,
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
													containerMaxWidth?.[device.key]?.unit === unit
												}
												onClick={() =>
													updateContainerDimension(device.key, "unit", unit)
												}
											>
												{unit}
											</Button>
										))}
									</ButtonGroup>
								</div>
							</div>
						))}
					</div>
				</PanelBody>

				<PanelBody
					title={__("Container Padding", "industries-block")}
					initialOpen={false}
				>
					<p style={{ marginBottom: "8px", fontWeight: 600 }}>
						{__("Device", "industries-block")}
					</p>
					<ButtonGroup style={{ marginBottom: "12px" }}>
						{BREAKPOINTS.map((breakpoint) => (
							<Button
								key={breakpoint.name}
								icon={breakpoint.icon}
								isPrimary={deviceType === breakpoint.name}
								onClick={() => setDeviceType(breakpoint.name)}
								label={breakpoint.label}
							/>
						))}
					</ButtonGroup>
					<BoxControl
						label={__("Padding", "industries-block")}
						values={{
							top: `${containerPaddingTop?.[deviceType] ?? (deviceType === "desktop" ? 80 : 80)}px`,
							right: `${containerPaddingRight?.[deviceType] ?? 0}px`,
							bottom: `${containerPaddingBottom?.[deviceType] ?? (deviceType === "desktop" ? 80 : 80)}px`,
							left: `${containerPaddingLeft?.[deviceType] ?? 0}px`,
						}}
						onChange={(value) => {
							setAttributes({
								containerPaddingTop: {
									...(containerPaddingTop || {}),
									[deviceType]: parseInt(value.top) || 0,
								},
								containerPaddingRight: {
									...(containerPaddingRight || {}),
									[deviceType]: parseInt(value.right) || 0,
								},
								containerPaddingBottom: {
									...(containerPaddingBottom || {}),
									[deviceType]: parseInt(value.bottom) || 0,
								},
								containerPaddingLeft: {
									...(containerPaddingLeft || {}),
									[deviceType]: parseInt(value.left) || 0,
								},
							});
						}}
					/>
				</PanelBody>

				<PanelBody title={__("Image", "industries-block")} initialOpen={false}>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={(media) =>
								setAttributes({
									featureImage: {
										id: media.id,
										url: media.url,
										alt: media.alt || "",
									},
								})
							}
							allowedTypes={["image"]}
							value={featureImage?.id}
							render={({ open }) => (
								<Button variant="primary" onClick={open}>
									{featureImage?.url
										? __("Change Image", "industries-block")
										: __("Select Image", "industries-block")}
								</Button>
							)}
						/>
					</MediaUploadCheck>
					{featureImage?.url && (
						<Button
							style={{ marginTop: "12px" }}
							variant="secondary"
							onClick={() =>
								setAttributes({
									featureImage: { id: 0, url: "", alt: "" },
								})
							}
						>
							{__("Remove Image", "industries-block")}
						</Button>
					)}

					{featureImage?.url && (
						<>
							<div style={{ marginTop: "24px" }}>
								<strong>{__("Image Width", "industries-block")}</strong>
								<div className="adaire-industries__dimension-controls" style={{ marginTop: "8px" }}>
									{DEVICE_TYPES.map((device) => (
										<div
											key={device.key}
											className="adaire-industries__dimension-row"
										>
											<strong>{device.label}</strong>
											<div className="adaire-industries__dimension-inputs">
												{(() => {
													const unit = imageWidth?.[device.key]?.unit ?? "%";
													const value = imageWidth?.[device.key]?.value ?? 100;
													const min = 10;
													const max = unit === "%" ? 100 : (device.key === "desktop" ? 800 : device.key === "tablet" ? 600 : 400);

													return (
														<>
															<RangeControl
																label={__("Width", "industries-block")}
																value={value === "auto" ? 100 : value}
																onChange={(rangeValue) =>
																	updateFontSize("imageWidth", device.key, "value", rangeValue)
																}
																min={min}
																max={max}
																step={unit === "%" ? 1 : 10}
																disabled={value === "auto"}
															/>
															<ToggleControl
																label={__("Auto", "industries-block")}
																checked={value === "auto"}
																onChange={(checked) =>
																	updateFontSize("imageWidth", device.key, "value", checked ? "auto" : 100)
																}
																style={{ marginTop: "8px" }}
															/>
														</>
													);
												})()}
												<ButtonGroup>
													{["px", "%", "rem", "vw"].map((unit) => (
														<Button
															key={unit}
															isSmall
															isPrimary={imageWidth?.[device.key]?.unit === unit}
															onClick={() =>
																updateFontSize("imageWidth", device.key, "unit", unit)
															}
															disabled={imageWidth?.[device.key]?.value === "auto"}
														>
															{unit}
														</Button>
													))}
												</ButtonGroup>
											</div>
										</div>
									))}
								</div>
							</div>

							<div style={{ marginTop: "24px" }}>
								<strong>{__("Image Height", "industries-block")}</strong>
								<div className="adaire-industries__dimension-controls" style={{ marginTop: "8px" }}>
									{DEVICE_TYPES.map((device) => (
										<div
											key={device.key}
											className="adaire-industries__dimension-row"
										>
											<strong>{device.label}</strong>
											<div className="adaire-industries__dimension-inputs">
												{(() => {
													const unit = imageHeight?.[device.key]?.unit ?? "";
													const value = imageHeight?.[device.key]?.value ?? "auto";
													const min = 50;
													const max = device.key === "desktop" ? 800 : device.key === "tablet" ? 600 : 400;

													return (
														<>
															<RangeControl
																label={__("Height", "industries-block")}
																value={value === "auto" ? 300 : value}
																onChange={(rangeValue) =>
																	updateFontSize("imageHeight", device.key, "value", rangeValue)
																}
																min={min}
																max={max}
																step={10}
																disabled={value === "auto"}
															/>
															<ToggleControl
																label={__("Auto", "industries-block")}
																checked={value === "auto"}
																onChange={(checked) =>
																	updateFontSize("imageHeight", device.key, "value", checked ? "auto" : 300)
																}
																style={{ marginTop: "8px" }}
															/>
														</>
													);
												})()}
												<ButtonGroup>
													{["px", "%", "rem", "vh"].map((unit) => (
														<Button
															key={unit}
															isSmall
															isPrimary={imageHeight?.[device.key]?.unit === unit}
															onClick={() =>
																updateFontSize("imageHeight", device.key, "unit", unit)
															}
															disabled={imageHeight?.[device.key]?.value === "auto"}
														>
															{unit}
														</Button>
													))}
												</ButtonGroup>
											</div>
										</div>
									))}
								</div>
							</div>
						</>
					)}
				</PanelBody>

				<PanelBody title={__("Copy", "industries-block")} initialOpen={false}>
					{headerLines?.map((line, index) => (
						<TextControl
							key={line.id || index}
							label={sprintf(__("Headline %d", "industries-block"), index + 1)}
							value={line.text}
							onChange={(value) => {
								const nextLines = [...headerLines];
								nextLines[index] = { ...nextLines[index], text: value };
								setAttributes({ headerLines: nextLines });
							}}
						/>
					))}
					<TextControl
						label={__("Intro Text", "industries-block")}
						value={descriptionText}
						onChange={(value) => setAttributes({ descriptionText: value })}
					/>
					<TextControl
						label={__("Description Text", "industries-block")}
						value={descriptionText}
						onChange={(value) => setAttributes({ descriptionText: value })}
					/>
				</PanelBody>

				<PanelBody
					title={__("Industries", "industries-block")}
					initialOpen={false}
				>
					<p className="adaire-industries__panel-help">
						{__(
							"Update the icon and label for each industry tile. Use the buttons to reorder or remove industries.",
							"industries-block",
						)}
					</p>
					{industries?.map((item, index) => (
						<div
							key={item.id || index}
							className="adaire-industries__industry-control"
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
									{sprintf(__("Industry %d", "industries-block"), index + 1)}
								</strong>
								<div style={{ display: "flex", gap: "4px" }}>
									<Button
										icon={arrowUp}
										onClick={() => moveIndustryUp(index)}
										isSmall
										disabled={index === 0}
										label={__("Move Up", "industries-block")}
									/>
									<Button
										icon={arrowDown}
										onClick={() => moveIndustryDown(index)}
										isSmall
										disabled={index === industries.length - 1}
										label={__("Move Down", "industries-block")}
									/>
									{industries.length > 1 && (
										<Button
											icon={trash}
											onClick={() => removeIndustry(index)}
											isSmall
											isDestructive
											label={__("Remove", "industries-block")}
										/>
									)}
								</div>
							</div>
							<BaseControl label={__("Icon", "industries-block")}>
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
										__("Choose Bootstrap Icon", "industries-block")
									)}
								</Button>
								{item.icon && (
									<Button
										onClick={() => {
											const nextItems = [...industries];
											nextItems[index] = { ...nextItems[index], icon: "" };
											setAttributes({ industries: nextItems });
										}}
										variant="link"
										isDestructive
										style={{ width: "100%" }}
									>
										{__("Remove Icon", "industries-block")}
									</Button>
								)}
							</BaseControl>
							<TextControl
								label={__("Label", "industries-block")}
								value={item.label}
								onChange={(value) => {
									const nextItems = [...industries];
									nextItems[index] = { ...nextItems[index], label: value };
									setAttributes({ industries: nextItems });
								}}
							/>
							<TextControl
								label={__("Link URL", "industries-block")}
								value={item.linkUrl || ""}
								onChange={(value) => {
									const nextItems = [...industries];
									nextItems[index] = { ...nextItems[index], linkUrl: value };
									setAttributes({ industries: nextItems });
								}}
								placeholder="https://example.com"
								help={__(
									"Optional: Add a URL to make this industry clickable.",
									"industries-block",
								)}
							/>
							<ToggleControl
								label={__("Open in new tab", "industries-block")}
								checked={item.openInNewTab || false}
								onChange={(value) => {
									const nextItems = [...industries];
									nextItems[index] = {
										...nextItems[index],
										openInNewTab: value,
									};
									setAttributes({ industries: nextItems });
								}}
								help={
									item.openInNewTab
										? __("Link will open in a new tab", "industries-block")
										: __("Link will open in the same tab", "industries-block")
								}
							/>
						</div>
					))}
					<div
						style={{
							marginTop: "16px",
							paddingTop: "16px",
							borderTop: "1px solid #ddd",
						}}
					>
						<Button
							icon={plus}
							onClick={addIndustry}
							variant="primary"
							style={{ width: "100%" }}
						>
							{__("Add Industry", "industries-block")}
						</Button>
					</div>
				</PanelBody>

				<PanelColorSettings
					title={__("Colors", "industries-block")}
					initialOpen={false}
					colorSettings={[
						{
							label: __("Background", "industries-block"),
							value: backgroundColor,
							onChange: (value) => setAttributes({ backgroundColor: value }),
							colors: DEFAULT_COLORS,
						},
						{
							label: __("Headline Color", "industries-block"),
							value: headerColor,
							onChange: (value) => setAttributes({ headerColor: value }),
							colors: DEFAULT_COLORS,
						},
						{
							label: __("Headline Accent Color", "industries-block"),
							value: headerAccentColor,
							onChange: (value) => setAttributes({ headerAccentColor: value }),
							colors: DEFAULT_COLORS,
						},
						{
							label: __("Chevron Color", "industries-block"),
							value: chevronColor,
							onChange: (value) => setAttributes({ chevronColor: value }),
							colors: DEFAULT_COLORS,
						},
						{
							label: __("Tile Border Color", "industries-block"),
							value: tileBorderColor,
							onChange: (value) => setAttributes({ tileBorderColor: value }),
							colors: DEFAULT_COLORS,
						},
						{
							label: __("Tile Icon Color", "industries-block"),
							value: tileIconColor,
							onChange: (value) => setAttributes({ tileIconColor: value }),
							colors: DEFAULT_COLORS,
						},
						{
							label: __("Tile Icon Background", "industries-block"),
							value: tileIconBackground,
							onChange: (value) => setAttributes({ tileIconBackground: value }),
							colors: DEFAULT_COLORS,
						},
						{
							label: __("Tile Hover Background", "industries-block"),
							value: tileHoverBackground,
							onChange: (value) =>
								setAttributes({ tileHoverBackground: value }),
							colors: DEFAULT_COLORS,
						},
						{
							label: __("Tile Text Color", "industries-block"),
							value: tileTextColor,
							onChange: (value) => setAttributes({ tileTextColor: value }),
							colors: DEFAULT_COLORS,
						},
						{
							label: __("Tile Hover Text", "industries-block"),
							value: tileHoverTextColor,
							onChange: (value) => setAttributes({ tileHoverTextColor: value }),
							colors: DEFAULT_COLORS,
						},
					]}
				/>

				<PanelBody
					title={__("Typography & Spacing", "industries-block")}
					initialOpen={false}
				>
					<TextControl
						label={__("Headline Font Weight", "industries-block")}
						value={headerFontWeight}
						onChange={(value) => setAttributes({ headerFontWeight: value })}
					/>
					
					<div style={{ marginTop: "16px" }}>
						<strong>{__("Headline Font Size", "industries-block")}</strong>
						<div className="adaire-industries__dimension-controls" style={{ marginTop: "8px" }}>
							{DEVICE_TYPES.map((device) => (
								<div
									key={device.key}
									className="adaire-industries__dimension-row"
								>
									<strong>{device.label}</strong>
									<div className="adaire-industries__dimension-inputs">
										{(() => {
											const unit = headerFontSize?.[device.key]?.unit ?? "px";
											const value = headerFontSize?.[device.key]?.value ?? (device.key === "desktop" ? 60 : device.key === "tablet" ? 40 : 36);
											const min = 12;
											const max = 120;

											return (
												<RangeControl
													label={__("Font Size", "industries-block")}
													value={value}
													onChange={(rangeValue) =>
														updateFontSize("headerFontSize", device.key, "value", rangeValue)
													}
													min={min}
													max={max}
													step={1}
												/>
											);
										})()}
										<ButtonGroup>
											{["px", "rem", "em", "vw"].map((unit) => (
												<Button
													key={unit}
													isSmall
													isPrimary={headerFontSize?.[device.key]?.unit === unit}
													onClick={() =>
														updateFontSize("headerFontSize", device.key, "unit", unit)
													}
												>
													{unit}
												</Button>
											))}
										</ButtonGroup>
									</div>
								</div>
							))}
						</div>
					</div>

					<div style={{ marginTop: "24px" }}>
						<strong>{__("Headline Accent Font Size", "industries-block")}</strong>
						<div className="adaire-industries__dimension-controls" style={{ marginTop: "8px" }}>
							{DEVICE_TYPES.map((device) => (
								<div
									key={device.key}
									className="adaire-industries__dimension-row"
								>
									<strong>{device.label}</strong>
									<div className="adaire-industries__dimension-inputs">
										{(() => {
											const unit = headerAccentFontSize?.[device.key]?.unit ?? "px";
											const value = headerAccentFontSize?.[device.key]?.value ?? (device.key === "desktop" ? 60 : device.key === "tablet" ? 40 : 36);
											const min = 12;
											const max = 120;

											return (
												<RangeControl
													label={__("Font Size", "industries-block")}
													value={value}
													onChange={(rangeValue) =>
														updateFontSize("headerAccentFontSize", device.key, "value", rangeValue)
													}
													min={min}
													max={max}
													step={1}
												/>
											);
										})()}
										<ButtonGroup>
											{["px", "rem", "em", "vw"].map((unit) => (
												<Button
													key={unit}
													isSmall
													isPrimary={headerAccentFontSize?.[device.key]?.unit === unit}
													onClick={() =>
														updateFontSize("headerAccentFontSize", device.key, "unit", unit)
													}
												>
													{unit}
												</Button>
											))}
										</ButtonGroup>
									</div>
								</div>
							))}
						</div>
					</div>

					<div style={{ marginTop: "24px" }}>
						<strong>{__("Headline Accent Width", "industries-block")}</strong>
						<div className="adaire-industries__dimension-controls" style={{ marginTop: "8px" }}>
							{DEVICE_TYPES.map((device) => (
								<div
									key={device.key}
									className="adaire-industries__dimension-row"
								>
									<strong>{device.label}</strong>
									<div className="adaire-industries__dimension-inputs">
										{(() => {
											const unit = headerAccentWidth?.[device.key]?.unit ?? "%";
											const value = headerAccentWidth?.[device.key]?.value ?? 100;
											const min = 10;
											const max = unit === "%" ? 100 : (device.key === "desktop" ? 800 : device.key === "tablet" ? 600 : 400);

											return (
												<RangeControl
													label={__("Width", "industries-block")}
													value={value}
													onChange={(rangeValue) =>
														updateFontSize("headerAccentWidth", device.key, "value", rangeValue)
													}
													min={min}
													max={max}
													step={unit === "%" ? 1 : 10}
												/>
											);
										})()}
										<ButtonGroup>
											{["px", "%", "rem", "vw"].map((unit) => (
												<Button
													key={unit}
													isSmall
													isPrimary={headerAccentWidth?.[device.key]?.unit === unit}
													onClick={() =>
														updateFontSize("headerAccentWidth", device.key, "unit", unit)
													}
												>
													{unit}
												</Button>
											))}
										</ButtonGroup>
									</div>
								</div>
							))}
						</div>
					</div>

					<div style={{ marginTop: "24px" }}>
						<strong>{__("Intro Font Size", "industries-block")}</strong>
						<div className="adaire-industries__dimension-controls" style={{ marginTop: "8px" }}>
							{DEVICE_TYPES.map((device) => (
								<div
									key={device.key}
									className="adaire-industries__dimension-row"
								>
									<strong>{device.label}</strong>
									<div className="adaire-industries__dimension-inputs">
										{(() => {
											const unit = introFontSize?.[device.key]?.unit ?? "px";
											const value = introFontSize?.[device.key]?.value ?? (device.key === "desktop" ? 20 : device.key === "tablet" ? 18 : 16);
											const min = 10;
											const max = 48;

											return (
												<RangeControl
													label={__("Font Size", "industries-block")}
													value={value}
													onChange={(rangeValue) =>
														updateFontSize("introFontSize", device.key, "value", rangeValue)
													}
													min={min}
													max={max}
													step={1}
												/>
											);
										})()}
										<ButtonGroup>
											{["px", "rem", "em", "vw"].map((unit) => (
												<Button
													key={unit}
													isSmall
													isPrimary={introFontSize?.[device.key]?.unit === unit}
													onClick={() =>
														updateFontSize("introFontSize", device.key, "unit", unit)
													}
												>
													{unit}
												</Button>
											))}
										</ButtonGroup>
									</div>
								</div>
							))}
						</div>
					</div>

					<div style={{ marginTop: "24px" }}>
						<strong>{__("Description Font Size", "industries-block")}</strong>
						<div className="adaire-industries__dimension-controls" style={{ marginTop: "8px" }}>
							{DEVICE_TYPES.map((device) => (
								<div
									key={device.key}
									className="adaire-industries__dimension-row"
								>
									<strong>{device.label}</strong>
									<div className="adaire-industries__dimension-inputs">
										{(() => {
											const unit = descriptionFontSize?.[device.key]?.unit ?? "px";
											const value = descriptionFontSize?.[device.key]?.value ?? (device.key === "desktop" ? 24 : device.key === "tablet" ? 20 : 18);
											const min = 10;
											const max = 48;

											return (
												<RangeControl
													label={__("Font Size", "industries-block")}
													value={value}
													onChange={(rangeValue) =>
														updateFontSize("descriptionFontSize", device.key, "value", rangeValue)
													}
													min={min}
													max={max}
													step={1}
												/>
											);
										})()}
										<ButtonGroup>
											{["px", "rem", "em", "vw"].map((unit) => (
												<Button
													key={unit}
													isSmall
													isPrimary={descriptionFontSize?.[device.key]?.unit === unit}
													onClick={() =>
														updateFontSize("descriptionFontSize", device.key, "unit", unit)
													}
												>
													{unit}
												</Button>
											))}
										</ButtonGroup>
									</div>
								</div>
							))}
						</div>
					</div>
					<RangeControl
						label={__("Chevron Size", "industries-block")}
						value={chevronSize}
						onChange={(value) => setAttributes({ chevronSize: value })}
						min={12}
						max={48}
					/>
					<RangeControl
						label={__("Tile Padding (desktop, px)", "industries-block")}
						value={tilePadding}
						onChange={(value) => setAttributes({ tilePadding: value })}
						min={20}
						max={120}
					/>
					<RangeControl
						label={__("Tile Padding (mobile, px)", "industries-block")}
						value={tilePaddingMobile}
						onChange={(value) => setAttributes({ tilePaddingMobile: value })}
						min={0}
						max={40}
					/>
					<RangeControl
						label={__("Tile Border Radius", "industries-block")}
						value={tileBorderRadius}
						onChange={(value) => setAttributes({ tileBorderRadius: value })}
						min={0}
						max={48}
					/>
					<RangeControl
						label={__("Tile Icon Size", "industries-block")}
						value={tileIconSize}
						onChange={(value) => setAttributes({ tileIconSize: value })}
						min={16}
						max={64}
					/>
					<RangeControl
						label={__("Tile Title Font Size", "industries-block")}
						value={tileTitleFontSize}
						onChange={(value) => setAttributes({ tileTitleFontSize: value })}
						min={16}
						max={48}
					/>
				</PanelBody>
			</InspectorControls>

			{/* Icon Picker Modal - One for each industry */}
			{industries?.map((item, index) => (
				<BootstrapIconPicker
					key={`icon-picker-${item.id || index}`}
					isOpen={iconPickerOpenFor === index}
					onClose={() => setIconPickerOpenFor(null)}
					onSelect={(iconClass) => {
						const nextItems = [...industries];
						nextItems[index] = { ...nextItems[index], icon: iconClass };
						setAttributes({ industries: nextItems });
						setIconPickerOpenFor(null);
					}}
					currentIcon={item.icon}
				/>
			))}

			<div {...blockProps}>
				<div className={containerClasses}>
					<div className="adaire-industries__first">
						<div className="adaire-industries__copy">
							{headerLines?.map((line, index) => (
								<RichText
									key={line.id || index}
									tagName="h2"
									className={`adaire-industries__copy-heading${
										showTitle === false
											? " adaire-industries__copy-heading--hidden"
											: ""
									}`}
									value={line.text}
									onChange={(value) => {
										const nextLines = [...headerLines];
										nextLines[index] = { ...nextLines[index], text: value };
										setAttributes({ headerLines: nextLines });
									}}
									allowedFormats={[]}
								/>
							))}
							<RichText
								tagName="p"
								className={`adaire-industries__copy-intro${
									showIntroText === false
										? " adaire-industries__copy-intro--hidden"
										: ""
								}`}
								value={descriptionText}
								onChange={(value) => setAttributes({ descriptionText: value })}
								allowedFormats={[]}
							/>
						</div>
						{/* Mobile Grid - All industries, visible on mobile/tablet */}
						<div className="adaire-industries__mobile-grid">
							{(hideFirstTwoIndustries
								? industries?.slice(2)
								: industries
							)?.map((item, index) => {
								const actualIndex = hideFirstTwoIndustries ? index + 2 : index;
								return renderIndustryItem(item, actualIndex);
							})}
						</div>
						{/* Desktop First Squares - Same industries as mobile, visible on desktop */}
						{!hideFirstTwoIndustries && (
							<div className="adaire-industries__first-squares adaire-industries__first-squares--desktop">
								{industries?.[1] &&
									renderIndustryItem(
										industries[1],
										1,
										"adaire-industries__industry--large",
									)}
								{industries?.[0] &&
									renderIndustryItem(
										industries[0],
										0,
										"adaire-industries__industry--large",
									)}
							</div>
						)}
					</div>

					<div className="adaire-industries__second">
						<div className="adaire-industries__description-group">
							<div
								className={`adaire-industries__description${
									showIntroText === false
										? " adaire-industries__description--hidden"
										: ""
								}`}
							>
								<RichText
									tagName="p"
									value={descriptionText}
									onChange={(value) =>
										setAttributes({ descriptionText: value })
									}
									allowedFormats={[]}
								/>
							</div>
							<div
								className={`adaire-industries__visual${
									showImage === false
										? " adaire-industries__visual--hidden"
										: ""
								}`}
							>
								{featureImage?.url ? (
									<img
										className="adaire-industries__img"
										src={featureImage.url}
										alt={featureImage.alt || ""}
									/>
								) : (
									<div className="adaire-industries__image-placeholder">
										<span>{__("Select an image", "industries-block")}</span>
									</div>
								)}
							</div>
						</div>

						{/* Desktop Second Grid - Industries from index 2 onwards (or from index 0 if first two are hidden), visible on desktop */}
						{(() => {
							const displayIndustries = hideFirstTwoIndustries
								? industries
								: industries?.length > 2
								? industries.slice(2)
								: [];
							const startIndex = hideFirstTwoIndustries ? 0 : 2;

							if (!displayIndustries || displayIndustries.length === 0)
								return null;

							return (
								<div className="adaire-industries__second-grid adaire-industries__second-grid--desktop">
									{(() => {
										const firstColumn = [];
										const secondColumn = [];

										// Distribute industries into two columns
										displayIndustries.forEach((item, index) => {
											const originalIndex = startIndex + index;
											if (index % 2 === 0) {
												firstColumn.push({ item, originalIndex });
											} else {
												secondColumn.push({ item, originalIndex });
											}
										});

										return (
											<>
												<div className="adaire-industries__column">
													{firstColumn.map(({ item, originalIndex }) =>
														renderIndustryItem(item, originalIndex),
													)}
												</div>
												{secondColumn.length > 0 && (
													<div className="adaire-industries__column adaire-industries__column--spaced">
														{secondColumn.map(({ item, originalIndex }) =>
															renderIndustryItem(item, originalIndex),
														)}
													</div>
												)}
											</>
										);
									})()}
								</div>
							);
						})()}
					</div>
				</div>
			</div>
		</>
	);
};

export default IndustriesEdit;



