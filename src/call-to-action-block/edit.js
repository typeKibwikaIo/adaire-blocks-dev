import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InspectorControls,
	RichText,
	MediaUpload,
	MediaUploadCheck,
	InnerBlocks,
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
	ButtonGroup,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import { desktop, tablet, mobile } from "@wordpress/icons";
import { useState, useEffect, createElement } from "@wordpress/element";
import "./editor.scss";

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

export default function Edit({ attributes, setAttributes }) {
	const [deviceType, setDeviceType] = useState("desktop");

	const {
		layout,
		minHeight,
		backgroundImage,
		backgroundSize,
		backgroundPosition,
		imageWidth,
		contentJustify,
		contentAlign,
		contentPadding,
		responsivePadding = {
			mobile: { top: "40px", right: "20px", bottom: "40px", left: "20px" },
			tablet: { top: "60px", right: "40px", bottom: "60px", left: "40px" },
			smallLaptop: { top: "80px", right: "60px", bottom: "80px", left: "60px" },
			desktop: { top: "100px", right: "80px", bottom: "100px", left: "80px" },
			bigDesktop: { top: "100px", right: "80px", bottom: "100px", left: "80px" }
		},
		contentBackgroundColor,
		headerText,
		headerFontSize,
		headerColor,
		headerMarginBottom,
		headerTextAlign,
		headerFontWeight,
		bodyText,
		bodyFontSize,
		bodyColor,
		bodyMarginBottom,
		bodyTextAlign,
		bodyFontWeight,
		stackedImageHeight,
		stackedContentWidth,
		overlayBackgroundColor,
		overlayOpacity,
		overlayContentWidth,
		overlayTextColor,
		overlayHeaderColor,
		overlayBodyColor,
		marginTop,
		marginRight,
		marginBottom,
		marginLeft,
		gradientType,
		gradientColor1,
		gradientColor2,
		gradientDirection,
		gradientOpacity,
		contentGradientType,
		contentGradientColor1,
		contentGradientColor2,
		contentGradientDirection,
		contentGradientOpacity,
		contentGradientOrigin,
		overlayGradientType,
		overlayGradientColor1,
		overlayGradientColor2,
		overlayGradientDirection,
		overlayGradientOpacity,
		overlayGradientOrigin,
		containerMode = "full",
		containerMaxWidth = {
			mobile: { value: 100, unit: "%" },
			tablet: { value: 100, unit: "%" },
			smallLaptop: { value: 1200, unit: "px" },
			desktop: { value: 1200, unit: "px" },
			bigDesktop: { value: 1200, unit: "px" },
		},
		contentBorderRadius = 0,
	} = attributes;

	// Enforce limits for free version
	useEffect(() => {
	const blockConfig = window.adaireBlocksConfig?.blocks?.['call-to-action-block'] || {};
		const blockLimits = blockConfig.limits || {};
		const isFree = !window.adaireBlocksConfig?.isPremium;

		if (isFree && blockLimits.layoutType === 'horizontal') {
			const allowedLayouts = ['split-left', 'split-right'];
			if (!allowedLayouts.includes(layout)) {
				setAttributes({ layout: 'split-left' });
			}
		}
	}, [layout]);

	// Helper to build CSS gradient string with alpha in hex
	const toAlphaHex = (val) =>
		Math.round((val || 0) * 255)
			.toString(16)
			.padStart(2, "0");
	const buildGradient = (type, dir, c1, c2, opacity, origin) => {
		if (type === "linear") {
			return `linear-gradient(${dir || "135deg"}, ${c1 || "#000000"
				}${toAlphaHex(opacity)}, ${c2 || "#000000"}${toAlphaHex(opacity)})`;
		}
		if (type === "radial") {
			return `radial-gradient(ellipse at ${origin || "center"}, ${c1 || "#000000"
				}${toAlphaHex(opacity)}, ${c2 || "#000000"}${toAlphaHex(opacity)})`;
		}
		return "none";
	};

	const computedContentBackground =
		contentGradientType && contentGradientType !== "none"
			? buildGradient(
				contentGradientType,
				contentGradientDirection,
				contentGradientColor1,
				contentGradientColor2,
				contentGradientOpacity ?? 0.1,
				contentGradientOrigin,
			)
			: contentBackgroundColor || "#f5f5f5";

	const computedOverlayBackground =
		overlayGradientType && overlayGradientType !== "none"
			? buildGradient(
				overlayGradientType,
				overlayGradientDirection,
				overlayGradientColor1,
				overlayGradientColor2,
				overlayOpacity ?? 0.5,
				overlayGradientOrigin,
			)
			: overlayBackgroundColor || "#000000";

	const blockProps = useBlockProps({
		className: "call-to-action-block-editor",
		style: {
			"--min-height": `${minHeight || 400}px`,
			"--background-image": backgroundImage
				? `url(${backgroundImage.url})`
				: "none",
			"--background-size": backgroundSize || "cover",
			"--background-position": backgroundPosition || "center",
			"--image-width": `${imageWidth}%`,
			"--content-justify": contentJustify || "center",
			"--content-align": contentAlign || "flex-start",
			"--content-padding-top": `${contentPadding?.top || 20}px`,
			"--content-padding-right": `${contentPadding?.right || 20}px`,
			"--content-padding-bottom": `${contentPadding?.bottom || 20}px`,
			"--content-padding-left": `${contentPadding?.left || 20}px`,
			"--content-background": computedContentBackground,
			"--header-font-size-desktop": `${headerFontSize?.desktop || 40}px`,
			"--header-font-size-tablet": `${headerFontSize?.tablet || 32}px`,
			"--header-font-size-mobile": `${headerFontSize?.mobile || 24}px`,
			"--header-color": headerColor || "#333333",
			"--header-margin-bottom-desktop": `${headerMarginBottom?.desktop || 20
				}px`,
			"--header-margin-bottom-tablet": `${headerMarginBottom?.tablet || 16}px`,
			"--header-margin-bottom-mobile": `${headerMarginBottom?.mobile || 12}px`,
			"--header-text-align": headerTextAlign || "left",
			"--header-font-weight": headerFontWeight || "300",
			"--body-font-size-desktop": `${bodyFontSize?.desktop || 16}px`,
			"--body-font-size-tablet": `${bodyFontSize?.tablet || 14}px`,
			"--body-font-size-mobile": `${bodyFontSize?.mobile || 12}px`,
			"--body-color": bodyColor || "#666666",
			"--body-margin-bottom-desktop": `${bodyMarginBottom?.desktop || 20}px`,
			"--body-margin-bottom-tablet": `${bodyMarginBottom?.tablet || 16}px`,
			"--body-margin-bottom-mobile": `${bodyMarginBottom?.mobile || 12}px`,
			"--body-text-align": bodyTextAlign || "left",
			"--body-font-weight": bodyFontWeight || "300",
			"--stacked-image-height-desktop": `${stackedImageHeight?.desktop?.value || 500
				}${stackedImageHeight?.desktop?.unit || "px"}`,
			"--stacked-image-height-tablet": `${stackedImageHeight?.tablet?.value || 400
				}${stackedImageHeight?.tablet?.unit || "px"}`,
			"--stacked-image-height-mobile": `${stackedImageHeight?.mobile?.value || 300
				}${stackedImageHeight?.mobile?.unit || "px"}`,
			"--stacked-content-width-desktop": `${stackedContentWidth?.desktop || 50
				}%`,
			"--stacked-content-width-tablet": `${stackedContentWidth?.tablet || 70}%`,
			"--stacked-content-width-mobile": `${stackedContentWidth?.mobile || 90}%`,
			"--overlay-background": computedOverlayBackground,
			"--overlay-opacity": `${overlayGradientType && overlayGradientType !== "none"
					? 1
					: overlayOpacity ?? 0.5
				}`,
			"--overlay-content-width-desktop": `${overlayContentWidth?.desktop || 50
				}%`,
			"--overlay-content-width-tablet": `${overlayContentWidth?.tablet || 70}%`,
			"--overlay-content-width-mobile": `${overlayContentWidth?.mobile || 90}%`,
			"--overlay-text-color": overlayTextColor || "#ffffff",
			"--overlay-header-color": overlayHeaderColor || "#ffffff",
			"--overlay-body-color": overlayBodyColor || "#ffffff",
			// Default button colors for nested button block within CTA
			"--button-background-color": "#000000",
			"--button-text-color": "#ffffff",
			"--margin-top-desktop": `${marginTop?.desktop || 0}px`,
			"--margin-right-desktop": `${marginRight?.desktop || 0}px`,
			"--margin-bottom-desktop": `${marginBottom?.desktop || 0}px`,
			"--margin-left-desktop": `${marginLeft?.desktop || 0}px`,
			"--margin-top-tablet": `${marginTop?.tablet || 0}px`,
			"--margin-right-tablet": `${marginRight?.tablet || 0}px`,
			"--margin-bottom-tablet": `${marginBottom?.tablet || 0}px`,
			"--margin-left-tablet": `${marginLeft?.tablet || 0}px`,
			"--margin-top-mobile": `${marginTop?.mobile || 0}px`,
			"--margin-right-mobile": `${marginRight?.mobile || 0}px`,
			"--margin-bottom-mobile": `${marginBottom?.mobile || 0}px`,
			"--margin-left-mobile": `${marginLeft?.mobile || 0}px`,
			// Deprecated single gradient kept for backward compat but not used in styles
			"--gradient-type": gradientType || "none",
			"--gradient-color-1": gradientColor1 || "#ff4444",
			"--gradient-color-2": gradientColor2 || "#ff6666",
			"--gradient-direction": gradientDirection || "135deg",
			"--gradient-opacity": gradientOpacity || 0.1,
			// Container settings
			"--container-max-width": `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? "px"
				}`,
			"--container-max-width-mobile": `${containerMaxWidth?.mobile?.value ?? 100
				}${containerMaxWidth?.mobile?.unit ?? "%"}`,
			"--container-max-width-tablet": `${containerMaxWidth?.tablet?.value ?? 100
				}${containerMaxWidth?.tablet?.unit ?? "%"}`,
			"--container-max-width-small-laptop": `${containerMaxWidth?.smallLaptop?.value ?? 1200}${containerMaxWidth?.smallLaptop?.unit ?? "px"}`,
			"--container-max-width-big-desktop": `${containerMaxWidth?.bigDesktop?.value ?? 1200}${containerMaxWidth?.bigDesktop?.unit ?? "px"}`,
			"--content-border-radius": `${contentBorderRadius || 0}px`,
			// Responsive Padding
			"--cta-padding-top-mobile": responsivePadding?.mobile?.top || "40px",
			"--cta-padding-right-mobile": responsivePadding?.mobile?.right || "20px",
			"--cta-padding-bottom-mobile": responsivePadding?.mobile?.bottom || "40px",
			"--cta-padding-left-mobile": responsivePadding?.mobile?.left || "20px",
			"--cta-padding-top-tablet": responsivePadding?.tablet?.top || "60px",
			"--cta-padding-right-tablet": responsivePadding?.tablet?.right || "40px",
			"--cta-padding-bottom-tablet": responsivePadding?.tablet?.bottom || "60px",
			"--cta-padding-left-tablet": responsivePadding?.tablet?.left || "40px",
			"--cta-padding-top-small-laptop": responsivePadding?.smallLaptop?.top || "80px",
			"--cta-padding-right-small-laptop": responsivePadding?.smallLaptop?.right || "60px",
			"--cta-padding-bottom-small-laptop": responsivePadding?.smallLaptop?.bottom || "80px",
			"--cta-padding-left-small-laptop": responsivePadding?.smallLaptop?.left || "60px",
			"--cta-padding-top-desktop": responsivePadding?.desktop?.top || "100px",
			"--cta-padding-right-desktop": responsivePadding?.desktop?.right || "80px",
			"--cta-padding-bottom-desktop": responsivePadding?.desktop?.bottom || "100px",
			"--cta-padding-left-desktop": responsivePadding?.desktop?.left || "80px",
			"--cta-padding-top-big-desktop": responsivePadding?.bigDesktop?.top || "100px",
			"--cta-padding-right-big-desktop": responsivePadding?.bigDesktop?.right || "80px",
			"--cta-padding-bottom-big-desktop": responsivePadding?.bigDesktop?.bottom || "100px",
			"--cta-padding-left-big-desktop": responsivePadding?.bigDesktop?.left || "80px",
		},
	});

	const setAttributesFunc = (field, value) => {
		setAttributes({ [field]: value });
	};

	// Sanitize padding values coming from BoxControl to prevent breaking styles when typing
	const sanitizePadding = (pad) => {
		const toNum = (val, fallback) => {
			const n = parseInt(val, 10);
			if (Number.isFinite(n)) {
				// clamp to 0-200px reasonable bounds
				return Math.max(0, Math.min(200, n));
			}
			return fallback;
		};
		return {
			top: toNum(pad?.top, contentPadding?.top ?? 20),
			right: toNum(pad?.right, contentPadding?.right ?? 20),
			bottom: toNum(pad?.bottom, contentPadding?.bottom ?? 20),
			left: toNum(pad?.left, contentPadding?.left ?? 20),
		};
	};

	return (
		<>
			<InspectorControls>
				{/* Container Settings */}
				<PanelBody
					title={__("Container Settings", "call-to-action")}
					initialOpen={true}
				>
					<ButtonGroup>
						{[
							{ label: __("Full Width", "call-to-action"), value: "full" },
							{
								label: __("Constrained", "call-to-action"),
								value: "constrained",
							},
						].map((opt) => (
							<Button
								key={opt.value}
								isPrimary={containerMode === opt.value}
								isSecondary={containerMode !== opt.value}
								onClick={() => setAttributes({ containerMode: opt.value })}
							>
								{opt.label}
							</Button>
						))}
					</ButtonGroup>
					<p
						style={{
							marginTop: "16px",
							marginBottom: "8px",
							fontWeight: 600,
						}}
					>
						{__("Layout Settings", "call-to-action")}
					</p>
					<ButtonGroup style={{ marginBottom: "12px" }}>
						<Button
							icon={mobile}
							isPrimary={deviceType === "mobile"}
							onClick={() => setDeviceType("mobile")}
							label={__("Mobile", "call-to-action")}
						/>
						<Button
							icon={tablet}
							isPrimary={deviceType === "tablet"}
							onClick={() => setDeviceType("tablet")}
							label={__("Tablet", "call-to-action")}
						/>
						<Button
							icon={smallLaptopIcon}
							isPrimary={deviceType === "smallLaptop"}
							onClick={() => setDeviceType("smallLaptop")}
							label={__("Small Laptop", "call-to-action")}
						/>
						<Button
							icon={desktop}
							isPrimary={deviceType === "desktop"}
							onClick={() => setDeviceType("desktop")}
							label={__("Desktop", "call-to-action")}
						/>
						<Button
							icon={bigDesktopIcon}
							isPrimary={deviceType === "bigDesktop"}
							onClick={() => setDeviceType("bigDesktop")}
							label={__("Big Desktop", "call-to-action")}
						/>
					</ButtonGroup>
					{containerMode === "constrained" && (
						<>
							<div style={{ marginBottom: "16px" }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
									<strong>{__("Max Width", "call-to-action")}</strong>
								</div>
								<div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
									<div style={{ flex: 1 }}>
										{(() => {
											const currentValObj = containerMaxWidth?.[deviceType] || {};
											const unit = currentValObj.unit ?? (deviceType === "desktop" || deviceType === "smallLaptop" || deviceType === "bigDesktop" ? "px" : "%");
											const rawValue = currentValObj.value ?? (unit === "%" ? 100 : 1200);
											const min = unit === "px" ? 200 : 10;
											const max = unit === "px" ? 10000 : 100;
											
											return (
												<RangeControl
													value={rawValue}
													onChange={(val) =>
														setAttributes({
															containerMaxWidth: {
																...(containerMaxWidth || {}),
																[deviceType]: {
																	...(containerMaxWidth?.[deviceType] || {}),
																	value: Number(val),
																},
															},
														})
													}
													min={min}
													max={max}
													step={unit === "px" ? 10 : 1}
												/>
											);
										})()}
									</div>
									<ButtonGroup>
										{["px", "%"].map((u) => (
											<Button
												key={u}
												isSmall
												isPrimary={
													(containerMaxWidth?.[deviceType]?.unit ??
														(deviceType === "desktop" || deviceType === "smallLaptop" || deviceType === "bigDesktop" ? "px" : "%")) === u
												}
												onClick={() =>
													setAttributes({
														containerMaxWidth: {
															...(containerMaxWidth || {}),
															[deviceType]: {
																...(containerMaxWidth?.[deviceType] || {}),
																unit: u,
															},
														},
													})
												}
											>
												{u}
											</Button>
										))}
									</ButtonGroup>
								</div>
							</div>
						</>
					)}
					<BoxControl
						label={__("Block Padding", "call-to-action")}
						values={responsivePadding[deviceType]}
						onChange={(val) =>
							setAttributes({
								responsivePadding: {
									...(responsivePadding || {}),
									[deviceType]: val,
								},
							})
						}
					/>
					<br />
					<RangeControl
						label="CTA Border Radius"
						value={contentBorderRadius}
						onChange={(value) => setAttributes({ contentBorderRadius: value })}
						min={0}
						max={50}
						step={1}
						help="Border radius for the content area"
					/>
				</PanelBody>

				<PanelBody title="Layout Settings" initialOpen={false}>
					{(() => {
						const blockConfig = window.adaireBlocksConfig?.blocks?.['call-to-action-block'] || {};
						const blockLimits = blockConfig.limits || {};
						const isFree = !window.adaireBlocksConfig?.isPremium;
						const isHorizontalOnly = isFree && blockLimits.layoutType === 'horizontal';

						return (
							<SelectControl
								label="Choose a layout"
								value={layout || "split-left"}
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
										label: "Stacked: Image Top, Text Bottom" + (isHorizontalOnly ? " (Premium)" : ""),
										value: "stacked-top",
										disabled: isHorizontalOnly
									},
									{
										label: "Stacked: Image Bottom, Text Top" + (isHorizontalOnly ? " (Premium)" : ""),
										value: "stacked-bottom",
										disabled: isHorizontalOnly
									},
									{
										label: "Overlay: Text Bottom Left" + (isHorizontalOnly ? " (Premium)" : ""),
										value: "overlay-bottom-left",
										disabled: isHorizontalOnly
									},
									{
										label: "Overlay: Text Bottom Right" + (isHorizontalOnly ? " (Premium)" : ""),
										value: "overlay-bottom-right",
										disabled: isHorizontalOnly
									},
									{
										label: "Overlay: Text Top Left" + (isHorizontalOnly ? " (Premium)" : ""),
										value: "overlay-top-left",
										disabled: isHorizontalOnly
									},
									{
										label: "Overlay: Text Top Right" + (isHorizontalOnly ? " (Premium)" : ""),
										value: "overlay-top-right",
										disabled: isHorizontalOnly
									},
									{
										label: "Overlay: Text Center" + (isHorizontalOnly ? " (Premium)" : ""),
										value: "overlay-center",
										disabled: isHorizontalOnly
									},
								]}
								onChange={(val) => setAttributes({ layout: val })}
								help={isHorizontalOnly ? (blockConfig.upgradeMessage || "Upgrade to Premium for Stacked and Overlay layouts") : ""}
							/>
						);
					})()}
					<RangeControl
						label="Minimum Height"
						value={minHeight}
						onChange={(value) => setAttributes({ minHeight: value })}
						min={200}
						max={1000}
						step={10}
					/>
				</PanelBody >

				<PanelBody title="Background Image" initialOpen={false}>
					<p style={{ fontSize: "12px", opacity: 0.75, marginTop: 0 }}>
						Applies to all layouts (Split, Stacked, Overlay).
					</p>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={(media) => setAttributes({ backgroundImage: media })}
							allowedTypes={["image"]}
							value={backgroundImage?.id}
							render={({ open }) => (
								<Button onClick={open} variant="secondary">
									{backgroundImage ? "Change Image" : "Select Background Image"}
								</Button>
							)}
						/>
					</MediaUploadCheck>
					{backgroundImage && (
						<Button
							onClick={() => setAttributes({ backgroundImage: null })}
							variant="link"
							isDestructive
						>
							Remove Image
						</Button>
					)}
					<SelectControl
						label="Background Size"
						value={backgroundSize}
						options={[
							{ label: "Cover", value: "cover" },
							{ label: "Contain", value: "contain" },
							{ label: "Auto", value: "auto" },
							{ label: "100%", value: "100%" },
						]}
						onChange={(value) => setAttributes({ backgroundSize: value })}
					/>
					<SelectControl
						label="Background Position"
						value={backgroundPosition}
						options={[
							{ label: "Center", value: "center" },
							{ label: "Top", value: "top" },
							{ label: "Bottom", value: "bottom" },
							{ label: "Left", value: "left" },
							{ label: "Right", value: "right" },
							{ label: "Top Left", value: "top left" },
							{ label: "Top Right", value: "top right" },
							{ label: "Bottom Left", value: "bottom left" },
							{ label: "Bottom Right", value: "bottom right" },
						]}
						onChange={(value) => setAttributes({ backgroundPosition: value })}
					/>
				</PanelBody>

				<PanelBody title="Content Settings" initialOpen={false}>
					<p style={{ fontSize: "12px", opacity: 0.75, marginTop: 0 }}>
						Applies to Split layouts.
					</p>
					{(layout === "split-left" || layout === "split-right") && (
						<RangeControl
							label="Image Width (%)"
							value={imageWidth}
							onChange={(value) => setAttributes({ imageWidth: value })}
							min={20}
							max={80}
							step={5}
						/>
					)}
					<SelectControl
						label="Content Justify"
						value={contentJustify}
						options={[
							{ label: "Center", value: "center" },
							{ label: "Flex Start", value: "flex-start" },
							{ label: "Flex End", value: "flex-end" },
							{ label: "Space Between", value: "space-between" },
							{ label: "Space Around", value: "space-around" },
						]}
						onChange={(value) => setAttributes({ contentJustify: value })}
					/>
					<SelectControl
						label="Content Align"
						value={contentAlign}
						options={[
							{ label: "Flex Start", value: "flex-start" },
							{ label: "Center", value: "center" },
							{ label: "Flex End", value: "flex-end" },
							{ label: "Stretch", value: "stretch" },
						]}
						onChange={(value) => setAttributes({ contentAlign: value })}
					/>
					<BoxControl
						label="Content Padding"
						values={contentPadding}
						onChange={(value) =>
							setAttributes({ contentPadding: sanitizePadding(value) })
						}
					/>
					<div>
						<label>Content Background Color</label>
						<ColorPicker
							color={contentBackgroundColor}
							onChangeComplete={(color) =>
								setAttributes({ contentBackgroundColor: color.hex })
							}
							disableAlpha
						/>
					</div>
				</PanelBody>

				<PanelBody title="Header Settings" initialOpen={false}>
					<p style={{ fontSize: "12px", opacity: 0.75, marginTop: 0 }}>
						Applies to all layouts.
					</p>
					<TextControl
						label="Header Text"
						value={headerText}
						onChange={(value) => setAttributes({ headerText: value })}
					/>
					<RangeControl
						label="Header Font Size (Desktop)"
						value={headerFontSize?.desktop || 40}
						onChange={(value) =>
							setAttributes({
								headerFontSize: { ...headerFontSize, desktop: value },
							})
						}
						min={12}
						max={80}
						step={2}
					/>
					<RangeControl
						label="Header Font Size (Tablet)"
						value={headerFontSize?.tablet || 32}
						onChange={(value) =>
							setAttributes({
								headerFontSize: { ...headerFontSize, tablet: value },
							})
						}
						min={12}
						max={60}
						step={2}
					/>
					<RangeControl
						label="Header Font Size (Mobile)"
						value={headerFontSize?.mobile || 24}
						onChange={(value) =>
							setAttributes({
								headerFontSize: { ...headerFontSize, mobile: value },
							})
						}
						min={12}
						max={40}
						step={2}
					/>
					<div>
						<label>Header Color</label>
						<ColorPicker
							color={headerColor}
							onChangeComplete={(color) =>
								setAttributes({ headerColor: color.hex })
							}
							disableAlpha
						/>
					</div>
					<RangeControl
						label="Header Margin Bottom (Desktop)"
						value={headerMarginBottom?.desktop || 20}
						onChange={(value) =>
							setAttributes({
								headerMarginBottom: { ...headerMarginBottom, desktop: value },
							})
						}
						min={0}
						max={100}
						step={2}
					/>
					<RangeControl
						label="Header Margin Bottom (Tablet)"
						value={headerMarginBottom?.tablet || 16}
						onChange={(value) =>
							setAttributes({
								headerMarginBottom: { ...headerMarginBottom, tablet: value },
							})
						}
						min={0}
						max={80}
						step={2}
					/>
					<RangeControl
						label="Header Margin Bottom (Mobile)"
						value={headerMarginBottom?.mobile || 12}
						onChange={(value) =>
							setAttributes({
								headerMarginBottom: { ...headerMarginBottom, mobile: value },
							})
						}
						min={0}
						max={60}
						step={2}
					/>
					<SelectControl
						label="Header Text Align"
						value={headerTextAlign}
						options={[
							{ label: "Left", value: "left" },
							{ label: "Center", value: "center" },
							{ label: "Right", value: "right" },
						]}
						onChange={(value) => setAttributes({ headerTextAlign: value })}
					/>
					<SelectControl
						label="Header Font Weight"
						value={headerFontWeight}
						options={[
							{ label: "Light (300)", value: "300" },
							{ label: "Normal (400)", value: "400" },
							{ label: "Medium (500)", value: "500" },
							{ label: "Semi Bold (600)", value: "600" },
							{ label: "Bold (700)", value: "700" },
						]}
						onChange={(value) => setAttributes({ headerFontWeight: value })}
					/>
				</PanelBody>

				<PanelBody title="Body Text Settings" initialOpen={false}>
					<p style={{ fontSize: "12px", opacity: 0.75, marginTop: 0 }}>
						Applies to all layouts.
					</p>
					<TextareaControl
						label="Body Text"
						value={bodyText}
						onChange={(value) => setAttributes({ bodyText: value })}
						rows={4}
					/>
					<RangeControl
						label="Body Font Size (Desktop)"
						value={bodyFontSize?.desktop || 16}
						onChange={(value) =>
							setAttributes({
								bodyFontSize: { ...bodyFontSize, desktop: value },
							})
						}
						min={10}
						max={30}
						step={1}
					/>
					<RangeControl
						label="Body Font Size (Tablet)"
						value={bodyFontSize?.tablet || 14}
						onChange={(value) =>
							setAttributes({
								bodyFontSize: { ...bodyFontSize, tablet: value },
							})
						}
						min={10}
						max={24}
						step={1}
					/>
					<RangeControl
						label="Body Font Size (Mobile)"
						value={bodyFontSize?.mobile || 12}
						onChange={(value) =>
							setAttributes({
								bodyFontSize: { ...bodyFontSize, mobile: value },
							})
						}
						min={10}
						max={20}
						step={1}
					/>
					<div>
						<label>Body Text Color</label>
						<ColorPicker
							color={bodyColor}
							onChangeComplete={(color) =>
								setAttributes({ bodyColor: color.hex })
							}
							disableAlpha
						/>
					</div>
					<RangeControl
						label="Body Margin Bottom (Desktop)"
						value={bodyMarginBottom?.desktop || 20}
						onChange={(value) =>
							setAttributes({
								bodyMarginBottom: { ...bodyMarginBottom, desktop: value },
							})
						}
						min={0}
						max={100}
						step={2}
					/>
					<RangeControl
						label="Body Margin Bottom (Tablet)"
						value={bodyMarginBottom?.tablet || 16}
						onChange={(value) =>
							setAttributes({
								bodyMarginBottom: { ...bodyMarginBottom, tablet: value },
							})
						}
						min={0}
						max={80}
						step={2}
					/>
					<RangeControl
						label="Body Margin Bottom (Mobile)"
						value={bodyMarginBottom?.mobile || 12}
						onChange={(value) =>
							setAttributes({
								bodyMarginBottom: { ...bodyMarginBottom, mobile: value },
							})
						}
						min={0}
						max={60}
						step={2}
					/>
					<SelectControl
						label="Body Text Align"
						value={bodyTextAlign}
						options={[
							{ label: "Left", value: "left" },
							{ label: "Center", value: "center" },
							{ label: "Right", value: "right" },
						]}
						onChange={(value) => setAttributes({ bodyTextAlign: value })}
					/>
					<SelectControl
						label="Body Font Weight"
						value={bodyFontWeight}
						options={[
							{ label: "Light (300)", value: "300" },
							{ label: "Normal (400)", value: "400" },
							{ label: "Medium (500)", value: "500" },
							{ label: "Semi Bold (600)", value: "600" },
							{ label: "Bold (700)", value: "700" },
						]}
						onChange={(value) => setAttributes({ bodyFontWeight: value })}
					/>
				</PanelBody>

				<PanelBody title="Content Gradient" initialOpen={false}>
					<p style={{ fontSize: "12px", opacity: 0.75, marginTop: 0 }}>
						Applies to Split and Stacked content containers.
					</p>
					<SelectControl
						label="Type"
						value={contentGradientType}
						options={[
							{ label: "None", value: "none" },
							{ label: "Linear", value: "linear" },
							{ label: "Radial", value: "radial" },
						]}
						onChange={(value) => setAttributes({ contentGradientType: value })}
					/>
					{contentGradientType !== "none" ? (
						<>
							<div>
								<label>Color 1</label>
								<ColorPicker
									color={contentGradientColor1}
									onChangeComplete={(color) =>
										setAttributes({ contentGradientColor1: color.hex })
									}
									disableAlpha
								/>
							</div>
							<div>
								<label>Color 2</label>
								<ColorPicker
									color={contentGradientColor2}
									onChangeComplete={(color) =>
										setAttributes({ contentGradientColor2: color.hex })
									}
									disableAlpha
								/>
							</div>
							<SelectControl
								label="Direction"
								value={contentGradientDirection}
								options={[
									{ label: "0Â° (Top to Bottom)", value: "0deg" },
									{ label: "45Â°", value: "45deg" },
									{ label: "90Â°", value: "90deg" },
									{ label: "135Â°", value: "135deg" },
									{ label: "180Â°", value: "180deg" },
									{ label: "225Â°", value: "225deg" },
									{ label: "270Â°", value: "270deg" },
									{ label: "315Â°", value: "315deg" },
								]}
								onChange={(value) =>
									setAttributes({ contentGradientDirection: value })
								}
							/>
							{contentGradientType === "radial" && (
								<SelectControl
									label="Radial Origin"
									value={contentGradientOrigin}
									options={[
										{ label: "Center", value: "center" },
										{ label: "Top Left", value: "top left" },
										{ label: "Top", value: "top" },
										{ label: "Top Right", value: "top right" },
										{ label: "Left", value: "left" },
										{ label: "Right", value: "right" },
										{ label: "Bottom Left", value: "bottom left" },
										{ label: "Bottom", value: "bottom" },
										{ label: "Bottom Right", value: "bottom right" },
									]}
									onChange={(value) =>
										setAttributes({ contentGradientOrigin: value })
									}
								/>
							)}
							<RangeControl
								label="Gradient Opacity"
								value={contentGradientOpacity ?? 0.1}
								onChange={(value) =>
									setAttributes({ contentGradientOpacity: value })
								}
								min={0}
								max={1}
								step={0.1}
								help="Controls the transparency of the gradient colors"
							/>
						</>
					) : (
						<div>
							<label>Content Background Color</label>
							<ColorPicker
								color={contentBackgroundColor}
								onChangeComplete={(color) =>
									setAttributes({ contentBackgroundColor: color.hex })
								}
								disableAlpha
							/>
						</div>
					)}
				</PanelBody>

				<PanelBody
					title="Stacked Layout Settings"
					initialOpen={layout === "stacked-top" || layout === "stacked-bottom"}
				>
					<p style={{ fontSize: "12px", opacity: 0.75, marginTop: 0 }}>
						Applies to Stacked Top and Stacked Bottom layouts.
					</p>
					<RangeControl
						label="Stacked Image Height (Desktop)"
						value={stackedImageHeight?.desktop?.value || 500}
						onChange={(value) =>
							setAttributes({
								stackedImageHeight: {
									...stackedImageHeight,
									desktop: { value, unit: "px" },
								},
							})
						}
						min={200}
						max={800}
						step={10}
					/>
					<RangeControl
						label="Stacked Image Height (Tablet)"
						value={stackedImageHeight?.tablet?.value || 400}
						onChange={(value) =>
							setAttributes({
								stackedImageHeight: {
									...stackedImageHeight,
									tablet: { value, unit: "px" },
								},
							})
						}
						min={200}
						max={600}
						step={10}
					/>
					<RangeControl
						label="Stacked Image Height (Mobile)"
						value={stackedImageHeight?.mobile?.value || 300}
						onChange={(value) =>
							setAttributes({
								stackedImageHeight: {
									...stackedImageHeight,
									mobile: { value, unit: "px" },
								},
							})
						}
						min={150}
						max={500}
						step={10}
					/>
					<RangeControl
						label="Stacked Content Width (Desktop)"
						value={stackedContentWidth?.desktop || 50}
						onChange={(value) =>
							setAttributes({
								stackedContentWidth: { ...stackedContentWidth, desktop: value },
							})
						}
						min={30}
						max={100}
						step={5}
					/>
					<RangeControl
						label="Stacked Content Width (Tablet)"
						value={stackedContentWidth?.tablet || 70}
						onChange={(value) =>
							setAttributes({
								stackedContentWidth: { ...stackedContentWidth, tablet: value },
							})
						}
						min={40}
						max={100}
						step={5}
					/>
					<RangeControl
						label="Stacked Content Width (Mobile)"
						value={stackedContentWidth?.mobile || 90}
						onChange={(value) =>
							setAttributes({
								stackedContentWidth: { ...stackedContentWidth, mobile: value },
							})
						}
						min={50}
						max={100}
						step={5}
					/>
				</PanelBody>

				<PanelBody title="Overlay Layout Settings" initialOpen={false}>
					<p style={{ fontSize: "12px", opacity: 0.75, marginTop: 0 }}>
						Applies to Overlay layouts. Overlay Gradient affects image overlays
						in all layouts.
					</p>
					<div>
						<label>Overlay Gradient</label>
						<SelectControl
							label="Type"
							value={overlayGradientType}
							options={[
								{ label: "None", value: "none" },
								{ label: "Linear", value: "linear" },
								{ label: "Radial", value: "radial" },
							]}
							onChange={(value) =>
								setAttributes({ overlayGradientType: value })
							}
						/>
						{overlayGradientType !== "none" ? (
							<>
								<div>
									<label>Color 1</label>
									<ColorPicker
										color={overlayGradientColor1}
										onChangeComplete={(color) =>
											setAttributes({ overlayGradientColor1: color.hex })
										}
										disableAlpha
									/>
								</div>
								<div>
									<label>Color 2</label>
									<ColorPicker
										color={overlayGradientColor2}
										onChangeComplete={(color) =>
											setAttributes({ overlayGradientColor2: color.hex })
										}
										disableAlpha
									/>
								</div>
								<SelectControl
									label="Direction"
									value={overlayGradientDirection}
									options={[
										{ label: "0Â°", value: "0deg" },
										{ label: "45Â°", value: "45deg" },
										{ label: "90Â°", value: "90deg" },
										{ label: "135Â°", value: "135deg" },
										{ label: "180Â°", value: "180deg" },
										{ label: "225Â°", value: "225deg" },
										{ label: "270Â°", value: "270deg" },
										{ label: "315Â°", value: "315deg" },
									]}
									onChange={(value) =>
										setAttributes({ overlayGradientDirection: value })
									}
								/>
								{overlayGradientType === "radial" && (
									<SelectControl
										label="Radial Origin"
										value={overlayGradientOrigin}
										options={[
											{ label: "Center", value: "center" },
											{ label: "Top Left", value: "top left" },
											{ label: "Top", value: "top" },
											{ label: "Top Right", value: "top right" },
											{ label: "Left", value: "left" },
											{ label: "Right", value: "right" },
											{ label: "Bottom Left", value: "bottom left" },
											{ label: "Bottom", value: "bottom" },
											{ label: "Bottom Right", value: "bottom right" },
										]}
										onChange={(value) =>
											setAttributes({ overlayGradientOrigin: value })
										}
									/>
								)}
							</>
						) : (
							<ColorPicker
								color={overlayBackgroundColor}
								onChangeComplete={(color) =>
									setAttributes({ overlayBackgroundColor: color.hex })
								}
								disableAlpha
							/>
						)}
					</div>
					<RangeControl
						label="Overlay Opacity"
						value={overlayOpacity}
						onChange={(value) => {
							setAttributes({ overlayOpacity: value });
						}}
						min={0}
						max={1}
						step={0.1}
						help="Controls the opacity of the overlay (both solid colors and gradients)"
					/>
					<RangeControl
						label="Overlay Content Width (Desktop)"
						value={overlayContentWidth?.desktop || 50}
						onChange={(value) =>
							setAttributes({
								overlayContentWidth: { ...overlayContentWidth, desktop: value },
							})
						}
						min={30}
						max={100}
						step={5}
					/>
					<RangeControl
						label="Overlay Content Width (Tablet)"
						value={overlayContentWidth?.tablet || 70}
						onChange={(value) =>
							setAttributes({
								overlayContentWidth: { ...overlayContentWidth, tablet: value },
							})
						}
						min={40}
						max={100}
						step={5}
					/>
					<RangeControl
						label="Overlay Content Width (Mobile)"
						value={overlayContentWidth?.mobile || 90}
						onChange={(value) =>
							setAttributes({
								overlayContentWidth: { ...overlayContentWidth, mobile: value },
							})
						}
						min={50}
						max={100}
						step={5}
					/>
					<div>
						<label>Overlay Header Color</label>
						<ColorPicker
							color={overlayHeaderColor}
							onChangeComplete={(color) =>
								setAttributes({ overlayHeaderColor: color.hex })
							}
							disableAlpha
						/>
					</div>
					<div>
						<label>Overlay Body Color</label>
						<ColorPicker
							color={overlayBodyColor}
							onChangeComplete={(color) =>
								setAttributes({ overlayBodyColor: color.hex })
							}
							disableAlpha
						/>
					</div>
				</PanelBody>

				<PanelBody title="Block Margins" initialOpen={false}>
					<p style={{ fontSize: "12px", opacity: 0.75, marginTop: 0 }}>
						Applies to all layouts (responsive overrides included).
					</p>
					<RangeControl
						label="Margin Top (Desktop)"
						value={marginTop?.desktop || 0}
						onChange={(value) =>
							setAttributes({
								marginTop: { ...marginTop, desktop: value },
							})
						}
						min={0}
						max={200}
						step={5}
					/>
					<RangeControl
						label="Margin Top (Tablet)"
						value={marginTop?.tablet || 0}
						onChange={(value) =>
							setAttributes({
								marginTop: { ...marginTop, tablet: value },
							})
						}
						min={0}
						max={150}
						step={5}
					/>
					<RangeControl
						label="Margin Top (Mobile)"
						value={marginTop?.mobile || 0}
						onChange={(value) =>
							setAttributes({
								marginTop: { ...marginTop, mobile: value },
							})
						}
						min={0}
						max={100}
						step={5}
					/>
					<RangeControl
						label="Margin Right (Desktop)"
						value={marginRight?.desktop || 0}
						onChange={(value) =>
							setAttributes({
								marginRight: { ...marginRight, desktop: value },
							})
						}
						min={0}
						max={200}
						step={5}
					/>
					<RangeControl
						label="Margin Right (Tablet)"
						value={marginRight?.tablet || 0}
						onChange={(value) =>
							setAttributes({
								marginRight: { ...marginRight, tablet: value },
							})
						}
						min={0}
						max={150}
						step={5}
					/>
					<RangeControl
						label="Margin Right (Mobile)"
						value={marginRight?.mobile || 0}
						onChange={(value) =>
							setAttributes({
								marginRight: { ...marginRight, mobile: value },
							})
						}
						min={0}
						max={100}
						step={5}
					/>
					<RangeControl
						label="Margin Bottom (Desktop)"
						value={marginBottom?.desktop || 0}
						onChange={(value) =>
							setAttributes({
								marginBottom: { ...marginBottom, desktop: value },
							})
						}
						min={0}
						max={200}
						step={5}
					/>
					<RangeControl
						label="Margin Bottom (Tablet)"
						value={marginBottom?.tablet || 0}
						onChange={(value) =>
							setAttributes({
								marginBottom: { ...marginBottom, tablet: value },
							})
						}
						min={0}
						max={150}
						step={5}
					/>
					<RangeControl
						label="Margin Bottom (Mobile)"
						value={marginBottom?.mobile || 0}
						onChange={(value) =>
							setAttributes({
								marginBottom: { ...marginBottom, mobile: value },
							})
						}
						min={0}
						max={100}
						step={5}
					/>
					<RangeControl
						label="Margin Left (Desktop)"
						value={marginLeft?.desktop || 0}
						onChange={(value) =>
							setAttributes({
								marginLeft: { ...marginLeft, desktop: value },
							})
						}
						min={0}
						max={200}
						step={5}
					/>
					<RangeControl
						label="Margin Left (Tablet)"
						value={marginLeft?.tablet || 0}
						onChange={(value) =>
							setAttributes({
								marginLeft: { ...marginLeft, tablet: value },
							})
						}
						min={0}
						max={150}
						step={5}
					/>
					<RangeControl
						label="Margin Left (Mobile)"
						value={marginLeft?.mobile || 0}
						onChange={(value) =>
							setAttributes({
								marginLeft: { ...marginLeft, mobile: value },
							})
						}
						min={0}
						max={100}
						step={5}
					/>
				</PanelBody>
			</InspectorControls >

			<div {...blockProps}>
				<div
				className={`cta-block__container ${containerMode === "constrained" ? "is-constrained" : ""
						}`}
				>
					{layout === "split-left" && (
						<div className="ad-cta2-container ad-split">
							<div
								className="ad-split__image"
								style={{
									backgroundImage: backgroundImage
										? `url(${backgroundImage.url})`
										: "none",
									backgroundSize: backgroundSize || "cover",
									backgroundPosition: backgroundPosition || "center",
									width: `${imageWidth}%`,
								}}
							>
								<div className="ad-image-overlay"></div>
							</div>
							<div
								className="ad-split__content"
								style={{
									width: `${100 - imageWidth}%`,
									justifyContent: contentJustify || "center",
									alignItems: contentAlign || "flex-start",
									paddingTop: `${contentPadding?.top || 20}px`,
									paddingRight: `${contentPadding?.right || 20}px`,
									paddingBottom: `${contentPadding?.bottom || 20}px`,
									paddingLeft: `${contentPadding?.left || 20}px`,
									backgroundColor: contentBackgroundColor || "#f5f5f5",
								}}
							>
								<RichText
									tagName="h1"
									className="ad-split__content__header"
									value={headerText}
									onChange={(value) => setAttributes({ headerText: value })}
									placeholder="Enter header text..."
								/>
								<RichText
									tagName="p"
									className="ad-split__content__text"
									value={bodyText}
									onChange={(value) => setAttributes({ bodyText: value })}
									placeholder="Enter body text..."
								/>
								<div className="ad-split__content__button">
									<InnerBlocks
										allowedBlocks={["create-block/button-block"]}
										template={[
											[
												"create-block/button-block",
												{ buttonText: "Click Here" },
											],
										]}
									/>
								</div>
							</div>
						</div>
					)}
					{layout === "split-right" && (
						<div className="ad-cta2-container ad-split">
							<div
								className="ad-split__content"
								style={{
									width: `${100 - imageWidth}%`,
									justifyContent: contentJustify || "center",
									alignItems: contentAlign || "flex-start",
									paddingTop: `${contentPadding?.top || 20}px`,
									paddingRight: `${contentPadding?.right || 20}px`,
									paddingBottom: `${contentPadding?.bottom || 20}px`,
									paddingLeft: `${contentPadding?.left || 20}px`,
									backgroundColor: contentBackgroundColor || "#f5f5f5",
								}}
							>
								<RichText
									tagName="h1"
									className="ad-split__content__header"
									value={headerText}
									onChange={(value) => setAttributes({ headerText: value })}
									placeholder="Enter header text..."
								/>
								<RichText
									tagName="p"
									className="ad-split__content__text"
									value={bodyText}
									onChange={(value) => setAttributes({ bodyText: value })}
									placeholder="Enter body text..."
								/>
								<div className="ad-split__content__button">
									<InnerBlocks
										allowedBlocks={["create-block/button-block"]}
										template={[
											[
												"create-block/button-block",
												{ buttonText: "Click Here" },
											],
										]}
									/>
								</div>
							</div>
							<div
								className="ad-split__image"
								style={{
									backgroundImage: backgroundImage
										? `url(${backgroundImage.url})`
										: "none",
									backgroundSize: backgroundSize || "cover",
									backgroundPosition: backgroundPosition || "center",
									width: `${imageWidth}%`,
								}}
							>
								<div className="ad-image-overlay"></div>
							</div>
						</div>
					)}

					{layout === "stacked-top" && (
						<div className="ad-cta2-container ad-stacked">
							<div
								className="ad-stacked__image"
								style={{
									backgroundImage: backgroundImage
										? `url(${backgroundImage.url})`
										: "none",
									backgroundSize: backgroundSize || "cover",
									backgroundPosition: backgroundPosition || "center",
									height: `${stackedImageHeight?.desktop || 500}px`,
								}}
							>
								<div className="ad-image-overlay"></div>
							</div>
							<div
								className="ad-stacked__content-container"
								style={{
									backgroundColor: contentBackgroundColor || "#f5f5f5",
								}}
							>
								<div
									className="ad-stacked__content"
									style={{
										justifyContent: contentJustify || "center",
										alignItems: contentAlign || "center",
										paddingTop: `${contentPadding?.top || 20}px`,
										paddingRight: `${contentPadding?.right || 20}px`,
										paddingBottom: `${contentPadding?.bottom || 20}px`,
										paddingLeft: `${contentPadding?.left || 20}px`,
									}}
								>
									<RichText
										tagName="h1"
										className="ad-stacked__content__header"
										value={headerText}
										onChange={(value) => setAttributes({ headerText: value })}
										placeholder="Enter header text..."
									/>
									<RichText
										tagName="p"
										className="ad-stacked__content__text"
										value={bodyText}
										onChange={(value) => setAttributes({ bodyText: value })}
										placeholder="Enter body text..."
									/>
									<div className="ad-stacked__content__button">
										<InnerBlocks
											allowedBlocks={["create-block/button-block"]}
											template={[
												[
													"create-block/button-block",
													{ buttonText: "Click Here" },
												],
											]}
										/>
									</div>
								</div>
							</div>
						</div>
					)}

					{layout === "stacked-bottom" && (
						<div className="ad-cta2-container ad-stacked">
							<div
								className="ad-stacked__content-container"
								style={{
									backgroundColor: contentBackgroundColor || "#f5f5f5",
								}}
							>
								<div
									className="ad-stacked__content"
									style={{
										justifyContent: contentJustify || "center",
										alignItems: contentAlign || "center",
										paddingTop: `${contentPadding?.top || 20}px`,
										paddingRight: `${contentPadding?.right || 20}px`,
										paddingBottom: `${contentPadding?.bottom || 20}px`,
										paddingLeft: `${contentPadding?.left || 20}px`,
									}}
								>
									<RichText
										tagName="h1"
										className="ad-stacked__content__header"
										value={headerText}
										onChange={(value) => setAttributes({ headerText: value })}
										placeholder="Enter header text..."
									/>
									<RichText
										tagName="p"
										className="ad-stacked__content__text"
										value={bodyText}
										onChange={(value) => setAttributes({ bodyText: value })}
										placeholder="Enter body text..."
									/>
									<div className="ad-stacked__content__button">
										<InnerBlocks
											allowedBlocks={["create-block/button-block"]}
											template={[
												[
													"create-block/button-block",
													{ buttonText: "Click Here" },
												],
											]}
										/>
									</div>
								</div>
							</div>
							<div
								className="ad-stacked__image"
								style={{
									backgroundImage: backgroundImage
										? `url(${backgroundImage.url})`
										: "none",
									backgroundSize: backgroundSize || "cover",
									backgroundPosition: backgroundPosition || "center",
									height: `${stackedImageHeight?.desktop || 500}px`,
								}}
							>
								<div className="ad-image-overlay"></div>
							</div>
						</div>
					)}

					{(layout === "overlay-top-left" ||
						layout === "overlay-top-right" ||
						layout === "overlay-bottom-left" ||
						layout === "overlay-bottom-right" ||
						layout === "overlay-center") && (
							<div
								className="ad-cta2-container ad-overlay"
								style={{
									backgroundImage: backgroundImage
										? `url(${backgroundImage.url})`
										: "none",
									backgroundSize: backgroundSize || "cover",
									backgroundPosition: backgroundPosition || "center",
								}}
							>
								<div
									className={`ad-overlay__overlay ad-${layout}`}
								// Background and opacity come from CSS variables
								></div>
								<div
									className={`ad-overlay__content ad-${layout}__content`}
									style={{
										width: `${overlayContentWidth?.desktop || 50}%`,
										justifyContent: contentJustify || "center",
										paddingTop: `${contentPadding?.top || 20}px`,
										paddingRight: `${contentPadding?.right || 20}px`,
										paddingBottom: `${contentPadding?.bottom || 20}px`,
										paddingLeft: `${contentPadding?.left || 20}px`,
									}}
								>
									<RichText
										tagName="h1"
										className={`ad-overlay__content__header ad-${layout}__header`}
										value={headerText}
										onChange={(value) => setAttributes({ headerText: value })}
										placeholder="Enter header text..."
										style={{
											color: overlayHeaderColor || "#ffffff",
											fontSize: `${headerFontSize?.desktop || 40}px`,
											fontWeight: headerFontWeight || "300",
											marginBottom: `${headerMarginBottom?.desktop || 20}px`,
										}}
									/>
									<RichText
										tagName="p"
										className={`ad-overlay__content__text ad-${layout}__text`}
										value={bodyText}
										onChange={(value) => setAttributes({ bodyText: value })}
										placeholder="Enter body text..."
										style={{
											color: overlayBodyColor || "#ffffff",
											fontSize: `${bodyFontSize?.desktop || 16}px`,
											fontWeight: bodyFontWeight || "300",
											marginBottom: `${bodyMarginBottom?.desktop || 20}px`,
										}}
									/>
									<div className="ad-overlay__content__button">
										<InnerBlocks
											allowedBlocks={["create-block/button-block"]}
											template={[
												[
													"create-block/button-block",
													{ buttonText: "Click Here" },
												],
											]}
										/>
									</div>
								</div>
							</div>
						)}
				</div>
			</div>
		</>
	);
}



