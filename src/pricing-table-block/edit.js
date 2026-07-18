import { __, sprintf } from "@wordpress/i18n";
import {
	useBlockProps,
	RichText,
	PanelColorSettings,
} from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	TextControl,
	BaseControl,
	Button,
	ButtonGroup,
	ToggleControl,
	SelectControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";
import { plus, trash, arrowUp, arrowDown } from "@wordpress/icons";
import QuickZone from "../components/QuickZone";
import InspectorTabs from "../components/InspectorTabs";
import DeviceSwitcher, { THREE_TIERS } from "../components/DeviceSwitcher";
import "./editor.scss";

const CONTAINER_MODES = [
	{ label: __("Full Width", "adaire-blocks"), value: "full" },
	{ label: __("Constrained", "adaire-blocks"), value: "constrained" },
];

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
	const value = dimension?.value ?? fallbackValue;
	const unit = dimension?.unit ?? fallbackUnit;
	return `${value}${unit}`;
};

const FONT_FAMILY_OPTIONS = [
	{ label: 'Default (inherit theme)', value: '' },
	{ label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
	{ label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
	{ label: 'Georgia', value: 'Georgia, serif' },
	{ label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
	{ label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
	{ label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
	{ label: 'Courier New', value: "'Courier New', Courier, monospace" },
	{ label: 'System UI', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

const TEXT_TRANSFORM_OPTIONS = [
	{ label: __("None", "adaire-blocks"), value: "none" },
	{ label: __("Uppercase", "adaire-blocks"), value: "uppercase" },
	{ label: __("Lowercase", "adaire-blocks"), value: "lowercase" },
	{ label: __("Capitalize", "adaire-blocks"), value: "capitalize" },
];

const FONT_WEIGHT_OPTIONS = [
	{ label: __("Default", "adaire-blocks"), value: "" },
	{ label: __("Light (300)", "adaire-blocks"), value: "300" },
	{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
	{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
	{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
	{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
	{ label: __("Extra Bold (800)", "adaire-blocks"), value: "800" },
];

/**
 * Renders the five non-font-size typography controls (font weight, line
 * height, letter spacing, text transform) shared by every text role in
 * this block. Font size keeps its existing per-breakpoint RangeControl UI
 * above each of these blocks; these four are flat (non-responsive)
 * attributes, matching the precedent set by button-block where categorical
 * typography values (weight/transform) stay flat even inside an otherwise
 * fully-responsive block.
 */
function TypographySubsection({ label, prefix, attributes, setAttributes }) {
	const weightKey = `${prefix}FontWeight`;
	const lineHeightKey = `${prefix}LineHeight`;
	const letterSpacingKey = `${prefix}LetterSpacing`;
	const textTransformKey = `${prefix}TextTransform`;

	return (
		<div className="adaire-pricing-table__typography-subsection" style={{ marginTop: "16px" }}>
			<p>
				<strong>{label}</strong>
			</p>
			<SelectControl
				label={__("Font Weight", "adaire-blocks")}
				value={attributes[weightKey] || ""}
				options={FONT_WEIGHT_OPTIONS}
				onChange={(value) => setAttributes({ [weightKey]: value })}
			/>
			<UnitControl
				label={__("Line Height", "adaire-blocks")}
				value={attributes[lineHeightKey] || ""}
				onChange={(value) => setAttributes({ [lineHeightKey]: value })}
				units={[
					{ value: "", label: __("Default", "adaire-blocks") },
				]}
			/>
			<UnitControl
				label={__("Letter Spacing", "adaire-blocks")}
				value={attributes[letterSpacingKey] || ""}
				onChange={(value) => setAttributes({ [letterSpacingKey]: value })}
				units={[
					{ value: "em", label: "em" },
					{ value: "px", label: "px" },
				]}
			/>
			<SelectControl
				label={__("Text Transform", "adaire-blocks")}
				value={attributes[textTransformKey] || "none"}
				options={TEXT_TRANSFORM_OPTIONS}
				onChange={(value) => setAttributes({ [textTransformKey]: value })}
			/>
		</div>
	);
}

const convertColorToRgba = (color, opacity) => {
	if (!color) return "";
	
	// If color is already rgba/rgb, extract the rgb values
	const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
	if (rgbaMatch) {
		return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity / 100})`;
	}
	
	// If color is hex, convert to rgba
	const hexMatch = color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
	if (hexMatch) {
		const hex = hexMatch[1];
		const r = hex.length === 3 
			? parseInt(hex[0] + hex[0], 16)
			: parseInt(hex.substring(0, 2), 16);
		const g = hex.length === 3
			? parseInt(hex[1] + hex[1], 16)
			: parseInt(hex.substring(2, 4), 16);
		const b = hex.length === 3
			? parseInt(hex[2] + hex[2], 16)
			: parseInt(hex.substring(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
	}
	
	// Fallback: return color as-is if we can't parse it
	return color;
};



export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		blockId,
		containerMode,
		containerMaxWidth,
		heading,
		subheading,
		cards = [],
		backgroundColor,
		cardBackgroundColor,
		featuredCardBackgroundColor,
		featuredCardTextColor,
		cardBorderColor,
		cardHoverBorderColor,
		headingColor,
		subheadingColor,
		planNameColor,
		priceColor,
		featureTextColor,
		buttonTextColor,
		buttonBackgroundColor,
		buttonHoverBackgroundColor,
		cardHoverBackgroundColor,
		cardHoverTextColor,
		buttonGlowColor,
		buttonGlowOpacity,
		headingFontSize,
		subheadingFontSize,
		planNameFontSize,
		priceFontSize,
		featureFontSize,
		buttonFontSize,
		priceSuffixFontSize,
		pricePrefixFontSize,
		gridColumns,
		gridGap,
		cardPadding,
		cardBorderRadius,
		cardBorderWidth,
		cardTextAlignment,
		cardButtonAlignment,
		fontFamily,
		headingFontWeight,
		headingLineHeight,
		headingLetterSpacing,
		headingTextTransform,
		subheadingFontWeight,
		subheadingLineHeight,
		subheadingLetterSpacing,
		subheadingTextTransform,
		toggleFontWeight,
		toggleLineHeight,
		toggleLetterSpacing,
		toggleTextTransform,
		badgeFontWeight,
		badgeLineHeight,
		badgeLetterSpacing,
		badgeTextTransform,
		planNameFontWeight,
		planNameLineHeight,
		planNameLetterSpacing,
		planNameTextTransform,
		planTaglineFontSize,
		planTaglineFontWeight,
		planTaglineLineHeight,
		planTaglineLetterSpacing,
		planTaglineTextTransform,
		pricePrefixFontWeight,
		pricePrefixLineHeight,
		pricePrefixLetterSpacing,
		pricePrefixTextTransform,
		priceFontWeight,
		priceLineHeight,
		priceLetterSpacing,
		priceTextTransform,
		priceSuffixFontWeight,
		priceSuffixLineHeight,
		priceSuffixLetterSpacing,
		priceSuffixTextTransform,
		featureFontWeight,
		featureLineHeight,
		featureLetterSpacing,
		featureTextTransform,
		buttonFontWeight,
		buttonLineHeight,
		buttonLetterSpacing,
		buttonTextTransform,
	} = attributes;


	useEffect(() => {
		if (!blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [blockId, clientId, setAttributes]);

	const [activeZone, setActiveZone] = useState(null);
	const [deviceType, setDeviceType] = useState('desktop');

	const gridColumnsDesktop = gridColumns?.desktop ?? 3;
	const gridColumnsTablet = gridColumns?.tablet ?? gridColumnsDesktop;
	const gridColumnsMobile = gridColumns?.mobile ?? 1;

	const gridGapDesktop = gridGap?.desktop ?? 32;
	const gridGapTablet = gridGap?.tablet ?? gridGapDesktop;
	const gridGapMobile = gridGap?.mobile ?? gridGapTablet;

	const updateContainerDimension = (device, property, value) => {
		const next = {
			...containerMaxWidth,
			[device]: {
				...(containerMaxWidth?.[device] || {}),
				[property]: value,
			},
		};
		setAttributes({ containerMaxWidth: next });
	};

	const updateFontSize = (fontSizeAttr, device, value) => {
		const current = attributes[fontSizeAttr] || {};
		const next = {
			...current,
			[device]: {
				...(current[device] || {}),
				value,
			},
		};
		setAttributes({ [fontSizeAttr]: next });
	};

	const addCard = () => {
		const id = `plan-${Date.now()}`;
		const nextCards = [
			...cards,
			{
				id,
				name: __("New Plan", "adaire-blocks"),
				tagline: __("Describe this plan", "adaire-blocks"),
				currency: "$",
				monthlyPrice: "49",
				priceSuffix: "/mo",
				features: [__("Add a feature", "adaire-blocks")],
				buttonLabel: __("Select Plan", "adaire-blocks"),
				buttonUrl: "#",
				buttonTarget: "_self",
				isFeatured: false,
			},
		];
		setAttributes({
			cards: nextCards,
		});
	};

	const removeCard = (index) => {
		if (cards.length <= 1) return;
		const nextCards = cards.filter((_, i) => i !== index);
		setAttributes({ cards: nextCards });
	};

	const moveCard = (index, direction) => {
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= cards.length) return;
		const nextCards = [...cards];
		[nextCards[index], nextCards[targetIndex]] = [
			nextCards[targetIndex],
			nextCards[index],
		];
		setAttributes({ cards: nextCards });
	};

	const updateCard = (index, patch) => {
		const nextCards = [...cards];
		nextCards[index] = { ...nextCards[index], ...patch };
		setAttributes({ cards: nextCards });
	};

	const updateFeature = (cardIndex, featureIndex, value) => {
		const card = cards[cardIndex];
		const features = Array.isArray(card.features) ? [...card.features] : [];
		features[featureIndex] = value;
		updateCard(cardIndex, { features });
	};

	const addFeature = (cardIndex) => {
		const card = cards[cardIndex];
		const features = Array.isArray(card.features) ? [...card.features] : [];
		features.push(__("New feature", "adaire-blocks"));
		updateCard(cardIndex, { features });
	};

	const removeFeature = (cardIndex, featureIndex) => {
		const card = cards[cardIndex];
		const features = Array.isArray(card.features) ? [...card.features] : [];
		if (features.length <= 1) return;
		features.splice(featureIndex, 1);
		updateCard(cardIndex, { features });
	};



	const blockProps = useBlockProps({
		id: blockId || undefined,
		className: "adaire-pricing-table",
		style: {
			"--pricing-bg": backgroundColor,
			"--pricing-card-bg": cardBackgroundColor,
			"--pricing-card-bg-featured": featuredCardBackgroundColor,
			"--pricing-card-text-featured": featuredCardTextColor,
			"--pricing-card-border": cardBorderColor,
			"--pricing-card-border-hover": cardHoverBorderColor,
			"--pricing-card-hover-bg": cardHoverBackgroundColor,
			"--pricing-card-hover-text": cardHoverTextColor,
			"--pricing-heading-color": headingColor,
			"--pricing-subheading-color": subheadingColor,
			"--pricing-plan-name-color": planNameColor,
			"--pricing-price-color": priceColor,
			"--pricing-feature-color": featureTextColor,
			"--pricing-button-text-color": buttonTextColor,
			"--pricing-button-bg": buttonBackgroundColor,
			"--pricing-button-bg-hover": buttonHoverBackgroundColor,
			"--pricing-button-glow": buttonGlowColor
				? convertColorToRgba(buttonGlowColor, buttonGlowOpacity ?? 25)
				: "",
			"--pricing-heading-size": formatDimensionValue(
				headingFontSize?.desktop,
				40,
				"px",
			),
			"--pricing-heading-size-tablet": formatDimensionValue(
				headingFontSize?.tablet,
				32,
				"px",
			),
			"--pricing-heading-size-mobile": formatDimensionValue(
				headingFontSize?.mobile,
				26,
				"px",
			),
			"--pricing-subheading-size": formatDimensionValue(
				subheadingFontSize?.desktop,
				18,
				"px",
			),
			"--pricing-subheading-size-tablet": formatDimensionValue(
				subheadingFontSize?.tablet,
				16,
				"px",
			),
			"--pricing-subheading-size-mobile": formatDimensionValue(
				subheadingFontSize?.mobile,
				14,
				"px",
			),
			"--pricing-plan-name-size": formatDimensionValue(
				planNameFontSize?.desktop,
				20,
				"px",
			),
			"--pricing-plan-name-size-tablet": formatDimensionValue(
				planNameFontSize?.tablet,
				18,
				"px",
			),
			"--pricing-plan-name-size-mobile": formatDimensionValue(
				planNameFontSize?.mobile,
				16,
				"px",
			),
			"--pricing-price-size": formatDimensionValue(
				priceFontSize?.desktop,
				40,
				"px",
			),
			"--pricing-price-size-tablet": formatDimensionValue(
				priceFontSize?.tablet,
				32,
				"px",
			),
			"--pricing-price-size-mobile": formatDimensionValue(
				priceFontSize?.mobile,
				28,
				"px",
			),
			"--pricing-feature-size": formatDimensionValue(
				featureFontSize?.desktop,
				14,
				"px",
			),
			"--pricing-feature-size-tablet": formatDimensionValue(
				featureFontSize?.tablet,
				14,
				"px",
			),
			"--pricing-feature-size-mobile": formatDimensionValue(
				featureFontSize?.mobile,
				13,
				"px",
			),
			"--pricing-button-size": formatDimensionValue(
				buttonFontSize?.desktop,
				15,
				"px",
			),
			"--pricing-button-size-tablet": formatDimensionValue(
				buttonFontSize?.tablet,
				15,
				"px",
			),
			"--pricing-button-size-mobile": formatDimensionValue(
				buttonFontSize?.mobile,
				14,
				"px",
			),
			"--pricing-price-suffix-size": formatDimensionValue(
				priceSuffixFontSize?.desktop,
				14,
				"px",
			),
			"--pricing-price-suffix-size-tablet": formatDimensionValue(
				priceSuffixFontSize?.tablet,
				13,
				"px",
			),
			"--pricing-price-suffix-size-mobile": formatDimensionValue(
				priceSuffixFontSize?.mobile,
				12,
				"px",
			),
			"--pricing-price-prefix-size": formatDimensionValue(
				pricePrefixFontSize?.desktop,
				18,
				"px",
			),
			"--pricing-price-prefix-size-tablet": formatDimensionValue(
				pricePrefixFontSize?.tablet,
				16,
				"px",
			),
			"--pricing-price-prefix-size-mobile": formatDimensionValue(
				pricePrefixFontSize?.mobile,
				14,
				"px",
			),
			"--pricing-price-justify":
				cardTextAlignment === "center"
					? "center"
					: cardTextAlignment === "right"
						? "flex-end"
						: "flex-start",
			"--pricing-features-align":
				cardTextAlignment === "center"
					? "center"
					: cardTextAlignment === "right"
						? "flex-end"
						: "flex-start",
			"--pricing-grid-columns": `${gridColumnsDesktop}`,
			"--pricing-grid-columns-tablet": `${gridColumnsTablet}`,
			"--pricing-grid-columns-mobile": `${gridColumnsMobile}`,

			"--pricing-grid-gap": `${gridGapDesktop}px`,
			"--pricing-grid-gap-tablet": `${gridGapTablet}px`,
			"--pricing-grid-gap-mobile": `${gridGapMobile}px`,
			"--pricing-card-padding-top": `${cardPadding?.top ?? 32}px`,
			"--pricing-card-padding-right": `${cardPadding?.right ?? 32}px`,
			"--pricing-card-padding-bottom": `${cardPadding?.bottom ?? 32}px`,
			"--pricing-card-padding-left": `${cardPadding?.left ?? 32}px`,
			"--pricing-card-radius": `${cardBorderRadius}px`,
			"--pricing-card-border-width": `${cardBorderWidth}px`,
			"--pricing-card-text-align": cardTextAlignment,
			"--pricing-card-button-align": cardButtonAlignment,
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

			"--pricing-font-family": fontFamily || "inherit",

			"--pricing-heading-font-weight": headingFontWeight || "600",
			"--pricing-heading-line-height": headingLineHeight || "1.1",
			"--pricing-heading-letter-spacing": headingLetterSpacing || "normal",
			"--pricing-heading-text-transform": headingTextTransform || "none",

			"--pricing-subheading-font-weight": subheadingFontWeight || "400",
			"--pricing-subheading-line-height": subheadingLineHeight || "1.6",
			"--pricing-subheading-letter-spacing": subheadingLetterSpacing || "normal",
			"--pricing-subheading-text-transform": subheadingTextTransform || "none",

			"--pricing-toggle-font-weight": toggleFontWeight || "400",
			"--pricing-toggle-line-height": toggleLineHeight || "1.2",
			"--pricing-toggle-letter-spacing": toggleLetterSpacing || "normal",
			"--pricing-toggle-text-transform": toggleTextTransform || "none",

			"--pricing-badge-font-weight": badgeFontWeight || "600",
			"--pricing-badge-line-height": badgeLineHeight || "normal",
			"--pricing-badge-letter-spacing": badgeLetterSpacing || "0.04em",
			"--pricing-badge-text-transform": badgeTextTransform || "uppercase",

			"--pricing-plan-name-font-weight": planNameFontWeight || "700",
			"--pricing-plan-name-line-height": planNameLineHeight || "1.08",
			"--pricing-plan-name-letter-spacing": planNameLetterSpacing || "-0.03em",
			"--pricing-plan-name-text-transform": planNameTextTransform || "none",

			"--pricing-plan-tagline-size": formatDimensionValue(
				planTaglineFontSize?.desktop,
				14,
				"px",
			),
			"--pricing-plan-tagline-size-tablet": formatDimensionValue(
				planTaglineFontSize?.tablet,
				14,
				"px",
			),
			"--pricing-plan-tagline-size-mobile": formatDimensionValue(
				planTaglineFontSize?.mobile,
				14,
				"px",
			),
			"--pricing-plan-tagline-font-weight": planTaglineFontWeight || "400",
			"--pricing-plan-tagline-line-height": planTaglineLineHeight || "1.45",
			"--pricing-plan-tagline-letter-spacing": planTaglineLetterSpacing || "normal",
			"--pricing-plan-tagline-text-transform": planTaglineTextTransform || "none",

			"--pricing-price-prefix-font-weight": pricePrefixFontWeight || "500",
			"--pricing-price-prefix-line-height": pricePrefixLineHeight || "normal",
			"--pricing-price-prefix-letter-spacing": pricePrefixLetterSpacing || "normal",
			"--pricing-price-prefix-text-transform": pricePrefixTextTransform || "none",

			"--pricing-price-font-weight": priceFontWeight || "700",
			"--pricing-price-line-height": priceLineHeight || "1",
			"--pricing-price-letter-spacing": priceLetterSpacing || "-0.05em",
			"--pricing-price-text-transform": priceTextTransform || "none",

			"--pricing-price-suffix-font-weight": priceSuffixFontWeight || "400",
			"--pricing-price-suffix-line-height": priceSuffixLineHeight || "normal",
			"--pricing-price-suffix-letter-spacing": priceSuffixLetterSpacing || "normal",
			"--pricing-price-suffix-text-transform": priceSuffixTextTransform || "none",

			"--pricing-feature-font-weight": featureFontWeight || "400",
			"--pricing-feature-line-height": featureLineHeight || "1.45",
			"--pricing-feature-letter-spacing": featureLetterSpacing || "normal",
			"--pricing-feature-text-transform": featureTextTransform || "none",

			"--pricing-button-font-weight": buttonFontWeight || "600",
			"--pricing-button-line-height": buttonLineHeight || "1",
			"--pricing-button-letter-spacing": buttonLetterSpacing || "normal",
			"--pricing-button-text-transform": buttonTextTransform || "none",
		},
	});

	const containerClasses = [
		"adaire-pricing-table__container",
		containerMode === "constrained" ? "is-constrained" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<>
			<InspectorTabs attributes={attributes} setAttributes={setAttributes}>
				<PanelBody section="layout" title={__("Layout", "adaire-blocks")} initialOpen={true}>
					<p>{__("Container Width", "adaire-blocks")}</p>
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

					<DeviceSwitcher
						deviceType={deviceType}
						setDeviceType={setDeviceType}
						label={__("Device Preview", "adaire-blocks")}
						tiers={THREE_TIERS}
					/>

					<div className="adaire-pricing-table__dimension-controls">
						{(() => {
							const unit =
								containerMaxWidth?.[deviceType]?.unit ??
								(deviceType === "desktop" ? "px" : "%");
							const value =
								containerMaxWidth?.[deviceType]?.value ??
								(unit === "px"
									? deviceType === "desktop"
										? 1200
										: 600
									: 100);
							const min =
								unit === "px"
									? deviceType === "desktop"
										? 400
										: 200
									: 10;
							const max =
								unit === "px"
									? deviceType === "desktop"
										? 2000
										: 1200
									: 100;

							return (
								<div className="adaire-pricing-table__dimension-row">
									<RangeControl
										label={__("Max Width", "adaire-blocks")}
										value={value}
										onChange={(rangeValue) =>
											updateContainerDimension(
												deviceType,
												"value",
												rangeValue,
											)
										}
										min={min}
										max={max}
										step={unit === "px" ? 10 : 1}
									/>
									<ButtonGroup>
										{["px", "%"].map((unitOption) => (
											<Button
												key={unitOption}
												isSmall
												isPrimary={unit === unitOption}
												onClick={() =>
													updateContainerDimension(
														deviceType,
														"unit",
														unitOption,
													)
												}
											>
												{unitOption}
											</Button>
										))}
									</ButtonGroup>
								</div>
							);
						})()}
					</div>

					<RangeControl
						label={__("Grid Columns", "adaire-blocks")}
						value={
							deviceType === "desktop"
								? gridColumnsDesktop
								: deviceType === "tablet"
									? gridColumnsTablet
									: gridColumnsMobile
						}
						onChange={(value) =>
							setAttributes({
								gridColumns: { ...gridColumns, [deviceType]: value },
							})
						}
						min={1}
						max={deviceType === "desktop" ? 4 : deviceType === "tablet" ? 3 : 2}
					/>

					<RangeControl
						label={__("Grid Gap", "adaire-blocks")}
						value={
							gridGap?.[deviceType] ??
							(deviceType === "desktop" ? 32 : gridGapDesktop)
						}
						onChange={(value) =>
							setAttributes({
								gridGap: { ...gridGap, [deviceType]: value },
							})
						}
						min={0}
						max={64}
					/>
				</PanelBody>

				<PanelBody
					section="content"
					title={__("Cards", "adaire-blocks")}
					initialOpen={false}
				>
					{cards.map((card, index) => (
						<div
							key={card.id || index}
							className="adaire-pricing-table__card-control"
						>
							<div className="adaire-pricing-table__card-control-header">
								<strong>
									{sprintf(
										__("Card %d â€“ %s", "adaire-blocks"),
										index + 1,
										card.name || __("Untitled", "adaire-blocks"),
									)}
								</strong>
								<div className="adaire-pricing-table__card-control-actions">
									<Button
										icon={arrowUp}
										onClick={() => moveCard(index, -1)}
										isSmall
										disabled={index === 0}
									/>
									<Button
										icon={arrowDown}
										onClick={() => moveCard(index, 1)}
										isSmall
										disabled={index === cards.length - 1}
									/>
									{cards.length > 1 && (
										<Button
											icon={trash}
											onClick={() => removeCard(index)}
											isSmall
											isDestructive
										/>
									)}
								</div>
							</div>

							<TextControl
								label={__("Plan Name", "adaire-blocks")}
								value={card.name}
								onChange={(value) => updateCard(index, { name: value })}
							/>
							<TextControl
								label={__("Tagline", "adaire-blocks")}
								value={card.tagline}
								onChange={(value) => updateCard(index, { tagline: value })}
							/>

							<div className="adaire-pricing-table__card-prices">
								<TextControl
									label={__("Currency Symbol", "adaire-blocks")}
									value={card.currency}
									onChange={(value) => updateCard(index, { currency: value })}
									style={{ maxWidth: "80px" }}
								/>
								<TextControl
									label={__("Monthly Price", "adaire-blocks")}
									value={card.monthlyPrice}
									onChange={(value) =>
										updateCard(index, { monthlyPrice: value })
									}
								/>
								<TextControl
									label={__("Price Suffix", "adaire-blocks")}
									value={card.priceSuffix}
									onChange={(value) =>
										updateCard(index, { priceSuffix: value })
									}
									placeholder="/mo"
								/>
							</div>

							<BaseControl label={__("Features", "adaire-blocks")}>
								{(card.features || []).map((feature, featureIndex) => (
									<div
										key={`${card.id}-feature-${featureIndex}`}
										className="adaire-pricing-table__feature-row"
									>
										<TextControl
											value={feature}
											onChange={(value) =>
												updateFeature(index, featureIndex, value)
											}
											placeholder={__("Add feature", "adaire-blocks")}
										/>
										<Button
											icon={trash}
											isSmall
											onClick={() => removeFeature(index, featureIndex)}
											disabled={(card.features || []).length <= 1}
										/>
									</div>
								))}
								<Button
									icon={plus}
									variant="secondary"
									onClick={() => addFeature(index)}
								>
									{__("Add Feature", "adaire-blocks")}
								</Button>
							</BaseControl>

							<TextControl
								label={__("Button Label", "adaire-blocks")}
								value={card.buttonLabel}
								onChange={(value) =>
									updateCard(index, { buttonLabel: value })
								}
							/>
							<TextControl
								label={__("Button URL", "adaire-blocks")}
								value={card.buttonUrl}
								onChange={(value) =>
									updateCard(index, { buttonUrl: value })
								}
								placeholder="https://example.com"
							/>
							<BaseControl label={__("Button Target", "adaire-blocks")}>
								<ButtonGroup>
									<Button
										isPrimary={card.buttonTarget !== "_blank"}
										onClick={() =>
											updateCard(index, { buttonTarget: "_self" })
										}
									>
										{__("Same Tab", "adaire-blocks")}
									</Button>
									<Button
										isPrimary={card.buttonTarget === "_blank"}
										onClick={() =>
											updateCard(index, { buttonTarget: "_blank" })
										}
									>
										{__("New Tab", "adaire-blocks")}
									</Button>
								</ButtonGroup>
							</BaseControl>

							<ToggleControl
								label={__("Highlight as Featured", "adaire-blocks")}
								checked={!!card.isFeatured}
								onChange={(value) => updateCard(index, { isFeatured: value })}
							/>
						</div>
					))}

					<Button
						icon={plus}
						variant="secondary"
						onClick={addCard}
						style={{ marginTop: "12px" }}
					>
						{__("Add Card", "adaire-blocks")}
					</Button>
				</PanelBody>



				<PanelColorSettings
					title={__("Colors", "adaire-blocks")}
					initialOpen={false}
					colorSettings={[
						{
							value: backgroundColor,
							onChange: (value) => setAttributes({ backgroundColor: value }),
							label: __("Background", "adaire-blocks"),
						},
						{
							value: cardBackgroundColor,
							onChange: (value) =>
								setAttributes({ cardBackgroundColor: value }),
							label: __("Card Background", "adaire-blocks"),
						},
						{
							value: featuredCardBackgroundColor,
							onChange: (value) =>
								setAttributes({ featuredCardBackgroundColor: value }),
							label: __("Featured Card Background", "adaire-blocks"),
						},
						{
							value: featuredCardTextColor,
							onChange: (value) =>
								setAttributes({ featuredCardTextColor: value }),
							label: __("Featured Card Text", "adaire-blocks"),
						},
						{
							value: cardBorderColor,
							onChange: (value) =>
								setAttributes({ cardBorderColor: value }),
							label: __("Card Border", "adaire-blocks"),
						},
						{
							value: cardHoverBorderColor,
							onChange: (value) =>
								setAttributes({ cardHoverBorderColor: value }),
							label: __("Card Hover Border", "adaire-blocks"),
						},
						{
							value: cardHoverBackgroundColor,
							onChange: (value) =>
								setAttributes({ cardHoverBackgroundColor: value }),
							label: __("Card Hover Background", "adaire-blocks"),
						},
						{
							value: cardHoverTextColor,
							onChange: (value) =>
								setAttributes({ cardHoverTextColor: value }),
							label: __("Card Hover Text", "adaire-blocks"),
						},
						{
							value: headingColor,
							onChange: (value) => setAttributes({ headingColor: value }),
							label: __("Heading", "adaire-blocks"),
						},
						{
							value: subheadingColor,
							onChange: (value) => setAttributes({ subheadingColor: value }),
							label: __("Subheading", "adaire-blocks"),
						},
						{
							value: planNameColor,
							onChange: (value) => setAttributes({ planNameColor: value }),
							label: __("Plan Name", "adaire-blocks"),
						},
						{
							value: priceColor,
							onChange: (value) => setAttributes({ priceColor: value }),
							label: __("Price", "adaire-blocks"),
						},
						{
							value: featureTextColor,
							onChange: (value) => setAttributes({ featureTextColor: value }),
							label: __("Feature Text", "adaire-blocks"),
						},
						{
							value: buttonTextColor,
							onChange: (value) => setAttributes({ buttonTextColor: value }),
							label: __("Button Text", "adaire-blocks"),
						},
						{
							value: buttonBackgroundColor,
							onChange: (value) =>
								setAttributes({ buttonBackgroundColor: value }),
							label: __("Button Background", "adaire-blocks"),
						},
						{
							value: buttonHoverBackgroundColor,
							onChange: (value) =>
								setAttributes({ buttonHoverBackgroundColor: value }),
							label: __("Button Hover Background", "adaire-blocks"),
						},
						{
							value: buttonGlowColor,
							onChange: (value) => setAttributes({ buttonGlowColor: value }),
							label: __("Button Glow", "adaire-blocks"),
						},
					]}
				/>

				<PanelBody
					section="style"
					priority="medium"
					title={__("Card Styling", "adaire-blocks")}
					initialOpen={false}
				>
					<BoxControl
						label={__("Card Padding", "adaire-blocks")}
						values={{
							top: cardPadding?.top ?? 32,
							right: cardPadding?.right ?? 32,
							bottom: cardPadding?.bottom ?? 32,
							left: cardPadding?.left ?? 32,
						}}
						onChange={(value) =>
							setAttributes({
								cardPadding: {
									top: Number(value.top) || 32,
									right: Number(value.right) || 32,
									bottom: Number(value.bottom) || 32,
									left: Number(value.left) || 32,
								},
							})
						}
					/>
					<RangeControl
						label={__("Card Border Radius", "adaire-blocks")}
						value={cardBorderRadius}
						onChange={(value) => setAttributes({ cardBorderRadius: value })}
						min={0}
						max={32}
					/>
					<RangeControl
						label={__("Card Border Width", "adaire-blocks")}
						value={cardBorderWidth}
						onChange={(value) => setAttributes({ cardBorderWidth: value })}
						min={0}
						max={6}
					/>
					<SelectControl
						label={__("Text Alignment", "adaire-blocks")}
						value={cardTextAlignment}
						options={[
							{ label: __("Left", "adaire-blocks"), value: "left" },
							{ label: __("Center", "adaire-blocks"), value: "center" },
							{ label: __("Right", "adaire-blocks"), value: "right" },
						]}
						onChange={(value) => setAttributes({ cardTextAlignment: value })}
					/>
					<SelectControl
						label={__("Button Alignment", "adaire-blocks")}
						value={cardButtonAlignment}
						options={[
							{ label: __("Left", "adaire-blocks"), value: "left" },
							{ label: __("Center", "adaire-blocks"), value: "center" },
							{ label: __("Right", "adaire-blocks"), value: "right" },
						]}
						onChange={(value) => setAttributes({ cardButtonAlignment: value })}
					/>
					<RangeControl
						label={__("Button Glow Opacity", "adaire-blocks")}
						value={buttonGlowOpacity ?? 25}
						onChange={(value) => setAttributes({ buttonGlowOpacity: value })}
						min={0}
						max={100}
					/>
				</PanelBody>

				<PanelBody
					section="style"
					priority="high"
					title={__("Typography", "adaire-blocks")}
					initialOpen={false}
				>
					<SelectControl
						label={__("Font Family", "adaire-blocks")}
						value={fontFamily || ""}
						options={FONT_FAMILY_OPTIONS}
						onChange={(value) => setAttributes({ fontFamily: value })}
						help={__("Applies to all text in this block.", "adaire-blocks")}
					/>

					<DeviceSwitcher
						deviceType={deviceType}
						setDeviceType={setDeviceType}
						label={__("Device Preview", "adaire-blocks")}
						tiers={THREE_TIERS}
					/>

					<p>
						<strong>{__("Heading", "adaire-blocks")}</strong>
					</p>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={
							headingFontSize?.[deviceType]?.value ||
							(deviceType === "desktop" ? 40 : deviceType === "tablet" ? 32 : 26)
						}
						onChange={(value) =>
							updateFontSize("headingFontSize", deviceType, value)
						}
						min={20}
						max={96}
					/>
					<TypographySubsection
						label={__("Heading Style", "adaire-blocks")}
						prefix="heading"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Subheading", "adaire-blocks")}</strong>
					</p>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={
							subheadingFontSize?.[deviceType]?.value ||
							(deviceType === "desktop" ? 18 : deviceType === "tablet" ? 16 : 14)
						}
						onChange={(value) =>
							updateFontSize("subheadingFontSize", deviceType, value)
						}
						min={12}
						max={48}
					/>
					<TypographySubsection
						label={__("Subheading Style", "adaire-blocks")}
						prefix="subheading"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Plan Name", "adaire-blocks")}</strong>
					</p>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={
							planNameFontSize?.[deviceType]?.value ||
							(deviceType === "desktop" ? 20 : deviceType === "tablet" ? 18 : 16)
						}
						onChange={(value) =>
							updateFontSize("planNameFontSize", deviceType, value)
						}
						min={12}
						max={48}
					/>
					<TypographySubsection
						label={__("Plan Name Style", "adaire-blocks")}
						prefix="planName"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Plan Tagline", "adaire-blocks")}</strong>
					</p>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={
							planTaglineFontSize?.[deviceType]?.value || 14
						}
						onChange={(value) =>
							updateFontSize("planTaglineFontSize", deviceType, value)
						}
						min={10}
						max={32}
					/>
					<TypographySubsection
						label={__("Plan Tagline Style", "adaire-blocks")}
						prefix="planTagline"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Price", "adaire-blocks")}</strong>
					</p>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={
							priceFontSize?.[deviceType]?.value ||
							(deviceType === "desktop" ? 40 : deviceType === "tablet" ? 32 : 28)
						}
						onChange={(value) =>
							updateFontSize("priceFontSize", deviceType, value)
						}
						min={20}
						max={80}
					/>
					<TypographySubsection
						label={__("Price Style", "adaire-blocks")}
						prefix="price"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Features", "adaire-blocks")}</strong>
					</p>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={
							featureFontSize?.[deviceType]?.value ||
							(deviceType === "desktop" ? 14 : 13)
						}
						onChange={(value) =>
							updateFontSize("featureFontSize", deviceType, value)
						}
						min={10}
						max={32}
					/>
					<TypographySubsection
						label={__("Features Style", "adaire-blocks")}
						prefix="feature"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Button", "adaire-blocks")}</strong>
					</p>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={
							buttonFontSize?.[deviceType]?.value ||
							(deviceType === "desktop" ? 15 : 14)
						}
						onChange={(value) =>
							updateFontSize("buttonFontSize", deviceType, value)
						}
						min={10}
						max={32}
					/>
					<TypographySubsection
						label={__("Button Style", "adaire-blocks")}
						prefix="button"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Price Suffix", "adaire-blocks")}</strong>
					</p>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={
							priceSuffixFontSize?.[deviceType]?.value ||
							(deviceType === "desktop"
								? 14
								: deviceType === "tablet"
									? 13
									: 12)
						}
						onChange={(value) =>
							updateFontSize("priceSuffixFontSize", deviceType, value)
						}
						min={10}
						max={32}
					/>
					<TypographySubsection
						label={__("Price Suffix Style", "adaire-blocks")}
						prefix="priceSuffix"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Price Prefix", "adaire-blocks")}</strong>
					</p>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={
							pricePrefixFontSize?.[deviceType]?.value ||
							(deviceType === "desktop"
								? 18
								: deviceType === "tablet"
									? 16
									: 14)
						}
						onChange={(value) =>
							updateFontSize("pricePrefixFontSize", deviceType, value)
						}
						min={10}
						max={32}
					/>
					<TypographySubsection
						label={__("Price Prefix Style", "adaire-blocks")}
						prefix="pricePrefix"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

				</PanelBody>
			</InspectorTabs>

			<div {...blockProps}>
				<div className={containerClasses}>
					<div className="adaire-pricing-table__header">
						<RichText
							tagName="h2"
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							placeholder={__("Enter headingâ€¦", "adaire-blocks")}
							className="adaire-pricing-table__heading"
						/>
						<RichText
							tagName="p"
							value={subheading}
							onChange={(value) => setAttributes({ subheading: value })}
							placeholder={__("Enter subheadingâ€¦", "adaire-blocks")}
							className="adaire-pricing-table__subheading"
						/>
					</div>

					<div className="adaire-pricing-table__grid">
						{cards.map((card, cardIndex) => (
							<div
								key={card.id}
								className={`adaire-pricing-table__card ${
									card.isFeatured ? "is-featured" : ""
								}`}
							>
								<div className="adaire-pricing-table__card-header">
									<RichText
										tagName="h3"
										value={card.name}
										onChange={(value) =>
											updateCard(
												cards.findIndex((c) => c.id === card.id),
												{ name: value },
											)
										}
										placeholder={__("Plan name", "adaire-blocks")}
										className="adaire-pricing-table__plan-name"
										allowedFormats={[]}
									/>
									<RichText
										tagName="p"
										value={card.tagline}
										onChange={(value) =>
											updateCard(
												cards.findIndex((c) => c.id === card.id),
												{ tagline: value },
											)
										}
										placeholder={__("Tagline", "adaire-blocks")}
										className="adaire-pricing-table__plan-tagline"
										allowedFormats={[]}
									/>
								</div>

								<QuickZone
									id={`price-${card.id}`}
									label="Price"
									activeZone={activeZone}
									setActiveZone={setActiveZone}
									content={
										<>
											<TextControl
												label={__("Currency Symbol", "adaire-blocks")}
												value={card.currency}
												onChange={(value) =>
													updateCard(cardIndex, { currency: value })
												}
											/>
											<TextControl
												label={__("Monthly Price", "adaire-blocks")}
												value={card.monthlyPrice}
												onChange={(value) =>
													updateCard(cardIndex, { monthlyPrice: value })
												}
											/>
											<TextControl
												label={__("Price Suffix", "adaire-blocks")}
												value={card.priceSuffix}
												onChange={(value) =>
													updateCard(cardIndex, { priceSuffix: value })
												}
												placeholder="/mo"
											/>
										</>
									}
								>
									<div className="adaire-pricing-table__price">
										<span className="adaire-pricing-table__price-currency">
											{card.currency}
										</span>
										<span className="adaire-pricing-table__price-value">
											{card.monthlyPrice}
										</span>
										<span className="adaire-pricing-table__price-suffix">
											{card.priceSuffix}
										</span>
									</div>
								</QuickZone>

								<ul className="adaire-pricing-table__features">
									{(card.features || []).map((feature, featureIndex) => (
										<li key={`${card.id}-feature-preview-${featureIndex}`}>
											<QuickZone
												id={`feature-${card.id}-${featureIndex}`}
												label="Feature"
												activeZone={activeZone}
												setActiveZone={setActiveZone}
												content={
													<TextControl
														label={__("Feature", "adaire-blocks")}
														value={feature}
														onChange={(value) =>
															updateFeature(cardIndex, featureIndex, value)
														}
														placeholder={__("Add feature", "adaire-blocks")}
													/>
												}
											>
												{feature}
											</QuickZone>
										</li>
									))}
								</ul>

								<div className="adaire-pricing-table__card-footer">
									<QuickZone
										id={`button-${card.id}`}
										label="Button"
										activeZone={activeZone}
										setActiveZone={setActiveZone}
										content={
											<>
												<TextControl
													label={__("Button Label", "adaire-blocks")}
													value={card.buttonLabel}
													onChange={(value) =>
														updateCard(cardIndex, { buttonLabel: value })
													}
												/>
												<TextControl
													label={__("Button URL", "adaire-blocks")}
													value={card.buttonUrl}
													onChange={(value) =>
														updateCard(cardIndex, { buttonUrl: value })
													}
													placeholder="https://example.com"
												/>
											</>
										}
									>
										<a
											href={card.buttonUrl || "#"}
											className="adaire-pricing-table__button"
											onClick={(e) => e.preventDefault()}
										>
											{card.buttonLabel}
										</a>
									</QuickZone>
								</div>
							</div>
						))}
					</div>


				</div>
			</div>
		</>
	);
}



