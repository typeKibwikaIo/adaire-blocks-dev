import { __, sprintf } from "@wordpress/i18n";
import {
	useBlockProps,
	RichText,
	InspectorControls,
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
import "./editor.scss";

const DEVICE_TYPES = [
	{ key: "desktop", label: __("Desktop", "pricing-table-block") },
	{ key: "tablet", label: __("Tablet", "pricing-table-block") },
	{ key: "mobile", label: __("Mobile", "pricing-table-block") },
];

const CONTAINER_MODES = [
	{ label: __("Full Width", "pricing-table-block"), value: "full" },
	{ label: __("Constrained", "pricing-table-block"), value: "constrained" },
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
	{ label: __("None", "pricing-table-block"), value: "none" },
	{ label: __("Uppercase", "pricing-table-block"), value: "uppercase" },
	{ label: __("Lowercase", "pricing-table-block"), value: "lowercase" },
	{ label: __("Capitalize", "pricing-table-block"), value: "capitalize" },
];

const FONT_WEIGHT_OPTIONS = [
	{ label: __("Default", "pricing-table-block"), value: "" },
	{ label: __("Light (300)", "pricing-table-block"), value: "300" },
	{ label: __("Normal (400)", "pricing-table-block"), value: "400" },
	{ label: __("Medium (500)", "pricing-table-block"), value: "500" },
	{ label: __("Semi Bold (600)", "pricing-table-block"), value: "600" },
	{ label: __("Bold (700)", "pricing-table-block"), value: "700" },
	{ label: __("Extra Bold (800)", "pricing-table-block"), value: "800" },
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
				label={__("Font Weight", "pricing-table-block")}
				value={attributes[weightKey] || ""}
				options={FONT_WEIGHT_OPTIONS}
				onChange={(value) => setAttributes({ [weightKey]: value })}
			/>
			<UnitControl
				label={__("Line Height", "pricing-table-block")}
				value={attributes[lineHeightKey] || ""}
				onChange={(value) => setAttributes({ [lineHeightKey]: value })}
				units={[
					{ value: "", label: __("Default", "pricing-table-block") },
				]}
			/>
			<UnitControl
				label={__("Letter Spacing", "pricing-table-block")}
				value={attributes[letterSpacingKey] || ""}
				onChange={(value) => setAttributes({ [letterSpacingKey]: value })}
				units={[
					{ value: "em", label: "em" },
					{ value: "px", label: "px" },
				]}
			/>
			<SelectControl
				label={__("Text Transform", "pricing-table-block")}
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
		billingMode,
		monthlyLabel,
		yearlyLabel,
		yearlyBadgeText,
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
		yearlyBadgeBackgroundColor,
		buttonGlowColor,
		buttonGlowOpacity,
		headingFontSize,
		subheadingFontSize,
		planNameFontSize,
		priceFontSize,
		featureFontSize,
		buttonFontSize,
		priceSuffixFontSize,
		toggleFontSize,
		pricePrefixFontSize,
		badgeFontSize,
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
				name: __("New Plan", "pricing-table-block"),
				tagline: __("Describe this plan", "pricing-table-block"),
				currency: "$",
				monthlyPrice: "49",
				yearlyPrice: "490",
				priceSuffix: "/mo",
				features: [__("Add a feature", "pricing-table-block")],
				buttonLabel: __("Select Plan", "pricing-table-block"),
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
		features.push(__("New feature", "pricing-table-block"));
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
		className: `adaire-pricing-table adaire-pricing-table--billing-${billingMode}`,
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
			"--pricing-badge-bg": yearlyBadgeBackgroundColor,
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
			"--pricing-toggle-size": formatDimensionValue(
				toggleFontSize?.desktop,
				14,
				"px",
			),
			"--pricing-toggle-size-tablet": formatDimensionValue(
				toggleFontSize?.tablet,
				13,
				"px",
			),
			"--pricing-toggle-size-mobile": formatDimensionValue(
				toggleFontSize?.mobile,
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
			"--pricing-badge-font-size": formatDimensionValue(
				badgeFontSize?.desktop,
				11,
				"px",
			),
			"--pricing-badge-font-size-tablet": formatDimensionValue(
				badgeFontSize?.tablet,
				11,
				"px",
			),
			"--pricing-badge-font-size-mobile": formatDimensionValue(
				badgeFontSize?.mobile,
				10,
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
			"--pricing-badge-font-size": formatDimensionValue(
				badgeFontSize?.desktop,
				11,
				"px",
			),
			"--pricing-badge-font-size-tablet": formatDimensionValue(
				badgeFontSize?.tablet,
				10,
				"px",
			),
			"--pricing-badge-font-size-mobile": formatDimensionValue(
				badgeFontSize?.mobile,
				9,
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
			<InspectorControls>
				<PanelBody title={__("Layout", "pricing-table-block")} initialOpen={true}>
					<p>{__("Container Width", "pricing-table-block")}</p>
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

					<div className="adaire-pricing-table__dimension-controls">
						{DEVICE_TYPES.map((device) => {
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
								<div
									key={device.key}
									className="adaire-pricing-table__dimension-row"
								>
									<strong>{device.label}</strong>
									<RangeControl
										label={__("Max Width", "pricing-table-block")}
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
									<ButtonGroup>
										{["px", "%"].map((unitOption) => (
											<Button
												key={unitOption}
												isSmall
												isPrimary={unit === unitOption}
												onClick={() =>
													updateContainerDimension(
														device.key,
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
						})}
					</div>

					<RangeControl
						label={__("Grid Columns (Desktop)", "pricing-table-block")}
						value={gridColumnsDesktop}
						onChange={(value) =>
							setAttributes({
								gridColumns: { ...gridColumns, desktop: value },
							})
						}
						min={1}
						max={4}
					/>
					<RangeControl
						label={__("Grid Columns (Tablet)", "pricing-table-block")}
						value={gridColumnsTablet}
						onChange={(value) =>
							setAttributes({
								gridColumns: { ...gridColumns, tablet: value },
							})
						}
						min={1}
						max={3}
					/>
					<RangeControl
						label={__("Grid Columns (Mobile)", "pricing-table-block")}
						value={gridColumnsMobile}
						onChange={(value) =>
							setAttributes({
								gridColumns: { ...gridColumns, mobile: value },
							})
						}
						min={1}
						max={2}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Grid Gap", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<div key={device.key}>
							<RangeControl
								label={device.label}
								value={
									gridGap?.[device.key] ??
									(device.key === "desktop"
										? 32
										: gridGapDesktop)
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

				<PanelBody
					title={__("Billing Toggle", "pricing-table-block")}
					initialOpen={true}
				>
					<TextControl
						label={__("Monthly Label", "pricing-table-block")}
						value={monthlyLabel}
						onChange={(value) => setAttributes({ monthlyLabel: value })}
					/>
					<TextControl
						label={__("Yearly Label", "pricing-table-block")}
						value={yearlyLabel}
						onChange={(value) => setAttributes({ yearlyLabel: value })}
					/>
					<TextControl
						label={__("Yearly Badge Text", "pricing-table-block")}
						value={yearlyBadgeText}
						onChange={(value) => setAttributes({ yearlyBadgeText: value })}
						help={__("Optional badge shown beside yearly label.", "pricing-table-block")}
					/>
				</PanelBody>

				<PanelBody
					title={__("Cards", "pricing-table-block")}
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
										__("Card %d â€“ %s", "pricing-table-block"),
										index + 1,
										card.name || __("Untitled", "pricing-table-block"),
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
								label={__("Plan Name", "pricing-table-block")}
								value={card.name}
								onChange={(value) => updateCard(index, { name: value })}
							/>
							<TextControl
								label={__("Tagline", "pricing-table-block")}
								value={card.tagline}
								onChange={(value) => updateCard(index, { tagline: value })}
							/>

							<div className="adaire-pricing-table__card-prices">
								<TextControl
									label={__("Currency Symbol", "pricing-table-block")}
									value={card.currency}
									onChange={(value) => updateCard(index, { currency: value })}
									style={{ maxWidth: "80px" }}
								/>
								<TextControl
									label={__("Monthly Price", "pricing-table-block")}
									value={card.monthlyPrice}
									onChange={(value) =>
										updateCard(index, { monthlyPrice: value })
									}
								/>
								<TextControl
									label={__("Yearly Price", "pricing-table-block")}
									value={card.yearlyPrice}
									onChange={(value) =>
										updateCard(index, { yearlyPrice: value })
									}
								/>
								<TextControl
									label={__("Price Suffix", "pricing-table-block")}
									value={card.priceSuffix}
									onChange={(value) =>
										updateCard(index, { priceSuffix: value })
									}
									placeholder="/mo"
								/>
							</div>

							<BaseControl label={__("Features", "pricing-table-block")}>
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
											placeholder={__("Add feature", "pricing-table-block")}
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
									{__("Add Feature", "pricing-table-block")}
								</Button>
							</BaseControl>

							<TextControl
								label={__("Button Label", "pricing-table-block")}
								value={card.buttonLabel}
								onChange={(value) =>
									updateCard(index, { buttonLabel: value })
								}
							/>
							<TextControl
								label={__("Button URL", "pricing-table-block")}
								value={card.buttonUrl}
								onChange={(value) =>
									updateCard(index, { buttonUrl: value })
								}
								placeholder="https://example.com"
							/>
							<BaseControl label={__("Button Target", "pricing-table-block")}>
								<ButtonGroup>
									<Button
										isPrimary={card.buttonTarget !== "_blank"}
										onClick={() =>
											updateCard(index, { buttonTarget: "_self" })
										}
									>
										{__("Same Tab", "pricing-table-block")}
									</Button>
									<Button
										isPrimary={card.buttonTarget === "_blank"}
										onClick={() =>
											updateCard(index, { buttonTarget: "_blank" })
										}
									>
										{__("New Tab", "pricing-table-block")}
									</Button>
								</ButtonGroup>
							</BaseControl>

							<ToggleControl
								label={__("Highlight as Featured", "pricing-table-block")}
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
						{__("Add Card", "pricing-table-block")}
					</Button>
				</PanelBody>



				<PanelColorSettings
					title={__("Colors", "pricing-table-block")}
					initialOpen={false}
					colorSettings={[
						{
							value: backgroundColor,
							onChange: (value) => setAttributes({ backgroundColor: value }),
							label: __("Background", "pricing-table-block"),
						},
						{
							value: cardBackgroundColor,
							onChange: (value) =>
								setAttributes({ cardBackgroundColor: value }),
							label: __("Card Background", "pricing-table-block"),
						},
						{
							value: featuredCardBackgroundColor,
							onChange: (value) =>
								setAttributes({ featuredCardBackgroundColor: value }),
							label: __("Featured Card Background", "pricing-table-block"),
						},
						{
							value: featuredCardTextColor,
							onChange: (value) =>
								setAttributes({ featuredCardTextColor: value }),
							label: __("Featured Card Text", "pricing-table-block"),
						},
						{
							value: cardBorderColor,
							onChange: (value) =>
								setAttributes({ cardBorderColor: value }),
							label: __("Card Border", "pricing-table-block"),
						},
						{
							value: cardHoverBorderColor,
							onChange: (value) =>
								setAttributes({ cardHoverBorderColor: value }),
							label: __("Card Hover Border", "pricing-table-block"),
						},
						{
							value: cardHoverBackgroundColor,
							onChange: (value) =>
								setAttributes({ cardHoverBackgroundColor: value }),
							label: __("Card Hover Background", "pricing-table-block"),
						},
						{
							value: cardHoverTextColor,
							onChange: (value) =>
								setAttributes({ cardHoverTextColor: value }),
							label: __("Card Hover Text", "pricing-table-block"),
						},
						{
							value: headingColor,
							onChange: (value) => setAttributes({ headingColor: value }),
							label: __("Heading", "pricing-table-block"),
						},
						{
							value: subheadingColor,
							onChange: (value) => setAttributes({ subheadingColor: value }),
							label: __("Subheading", "pricing-table-block"),
						},
						{
							value: planNameColor,
							onChange: (value) => setAttributes({ planNameColor: value }),
							label: __("Plan Name", "pricing-table-block"),
						},
						{
							value: priceColor,
							onChange: (value) => setAttributes({ priceColor: value }),
							label: __("Price", "pricing-table-block"),
						},
						{
							value: featureTextColor,
							onChange: (value) => setAttributes({ featureTextColor: value }),
							label: __("Feature Text", "pricing-table-block"),
						},
						{
							value: buttonTextColor,
							onChange: (value) => setAttributes({ buttonTextColor: value }),
							label: __("Button Text", "pricing-table-block"),
						},
						{
							value: buttonBackgroundColor,
							onChange: (value) =>
								setAttributes({ buttonBackgroundColor: value }),
							label: __("Button Background", "pricing-table-block"),
						},
						{
							value: buttonHoverBackgroundColor,
							onChange: (value) =>
								setAttributes({ buttonHoverBackgroundColor: value }),
							label: __("Button Hover Background", "pricing-table-block"),
						},
						{
							value: buttonGlowColor,
							onChange: (value) => setAttributes({ buttonGlowColor: value }),
							label: __("Button Glow", "pricing-table-block"),
						},
						{
							value: yearlyBadgeBackgroundColor,
							onChange: (value) =>
								setAttributes({ yearlyBadgeBackgroundColor: value }),
							label: __("Yearly Badge Background", "pricing-table-block"),
						},
					]}
				/>

				<PanelBody
					title={__("Card Styling", "pricing-table-block")}
					initialOpen={false}
				>
					<BoxControl
						label={__("Card Padding", "pricing-table-block")}
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
						label={__("Card Border Radius", "pricing-table-block")}
						value={cardBorderRadius}
						onChange={(value) => setAttributes({ cardBorderRadius: value })}
						min={0}
						max={32}
					/>
					<RangeControl
						label={__("Card Border Width", "pricing-table-block")}
						value={cardBorderWidth}
						onChange={(value) => setAttributes({ cardBorderWidth: value })}
						min={0}
						max={6}
					/>
					<SelectControl
						label={__("Text Alignment", "pricing-table-block")}
						value={cardTextAlignment}
						options={[
							{ label: __("Left", "pricing-table-block"), value: "left" },
							{ label: __("Center", "pricing-table-block"), value: "center" },
							{ label: __("Right", "pricing-table-block"), value: "right" },
						]}
						onChange={(value) => setAttributes({ cardTextAlignment: value })}
					/>
					<SelectControl
						label={__("Button Alignment", "pricing-table-block")}
						value={cardButtonAlignment}
						options={[
							{ label: __("Left", "pricing-table-block"), value: "left" },
							{ label: __("Center", "pricing-table-block"), value: "center" },
							{ label: __("Right", "pricing-table-block"), value: "right" },
						]}
						onChange={(value) => setAttributes({ cardButtonAlignment: value })}
					/>
					<RangeControl
						label={__("Button Glow Opacity", "pricing-table-block")}
						value={buttonGlowOpacity ?? 25}
						onChange={(value) => setAttributes({ buttonGlowOpacity: value })}
						min={0}
						max={100}
					/>
				</PanelBody>

				<PanelBody
					title={__("Typography", "pricing-table-block")}
					initialOpen={false}
				>
					<SelectControl
						label={__("Font Family", "pricing-table-block")}
						value={fontFamily || ""}
						options={FONT_FAMILY_OPTIONS}
						onChange={(value) => setAttributes({ fontFamily: value })}
						help={__("Applies to all text in this block.", "pricing-table-block")}
					/>

					<p>
						<strong>{__("Heading", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`heading-${device.key}`}
							label={device.label}
							value={
								headingFontSize?.[device.key]?.value ||
								(device.key === "desktop" ? 40 : device.key === "tablet" ? 32 : 26)
							}
							onChange={(value) =>
								updateFontSize("headingFontSize", device.key, value)
							}
							min={20}
							max={96}
						/>
					))}
					<TypographySubsection
						label={__("Heading Style", "pricing-table-block")}
						prefix="heading"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Subheading", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`subheading-${device.key}`}
							label={device.label}
							value={
								subheadingFontSize?.[device.key]?.value ||
								(device.key === "desktop" ? 18 : device.key === "tablet" ? 16 : 14)
							}
							onChange={(value) =>
								updateFontSize("subheadingFontSize", device.key, value)
							}
							min={12}
							max={48}
						/>
					))}
					<TypographySubsection
						label={__("Subheading Style", "pricing-table-block")}
						prefix="subheading"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Plan Name", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`plan-name-${device.key}`}
							label={device.label}
							value={
								planNameFontSize?.[device.key]?.value ||
								(device.key === "desktop" ? 20 : device.key === "tablet" ? 18 : 16)
							}
							onChange={(value) =>
								updateFontSize("planNameFontSize", device.key, value)
							}
							min={12}
							max={48}
						/>
					))}
					<TypographySubsection
						label={__("Plan Name Style", "pricing-table-block")}
						prefix="planName"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Plan Tagline", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`plan-tagline-${device.key}`}
							label={device.label}
							value={
								planTaglineFontSize?.[device.key]?.value || 14
							}
							onChange={(value) =>
								updateFontSize("planTaglineFontSize", device.key, value)
							}
							min={10}
							max={32}
						/>
					))}
					<TypographySubsection
						label={__("Plan Tagline Style", "pricing-table-block")}
						prefix="planTagline"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Price", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`price-${device.key}`}
							label={device.label}
							value={
								priceFontSize?.[device.key]?.value ||
								(device.key === "desktop" ? 40 : device.key === "tablet" ? 32 : 28)
							}
							onChange={(value) =>
								updateFontSize("priceFontSize", device.key, value)
							}
							min={20}
							max={80}
						/>
					))}
					<TypographySubsection
						label={__("Price Style", "pricing-table-block")}
						prefix="price"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Features", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`feature-${device.key}`}
							label={device.label}
							value={
								featureFontSize?.[device.key]?.value ||
								(device.key === "desktop" ? 14 : 13)
							}
							onChange={(value) =>
								updateFontSize("featureFontSize", device.key, value)
							}
							min={10}
							max={32}
						/>
					))}
					<TypographySubsection
						label={__("Features Style", "pricing-table-block")}
						prefix="feature"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Button", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`button-${device.key}`}
							label={device.label}
							value={
								buttonFontSize?.[device.key]?.value ||
								(device.key === "desktop" ? 15 : 14)
							}
							onChange={(value) =>
								updateFontSize("buttonFontSize", device.key, value)
							}
							min={10}
							max={32}
						/>
					))}
					<TypographySubsection
						label={__("Button Style", "pricing-table-block")}
						prefix="button"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Price Suffix", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`price-suffix-${device.key}`}
							label={device.label}
							value={
								priceSuffixFontSize?.[device.key]?.value ||
								(device.key === "desktop"
									? 14
									: device.key === "tablet"
										? 13
										: 12)
							}
							onChange={(value) =>
								updateFontSize("priceSuffixFontSize", device.key, value)
							}
							min={10}
							max={32}
						/>
					))}
					<TypographySubsection
						label={__("Price Suffix Style", "pricing-table-block")}
						prefix="priceSuffix"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Price Prefix", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`price-prefix-${device.key}`}
							label={device.label}
							value={
								pricePrefixFontSize?.[device.key]?.value ||
								(device.key === "desktop"
									? 18
									: device.key === "tablet"
										? 16
										: 14)
							}
							onChange={(value) =>
								updateFontSize("pricePrefixFontSize", device.key, value)
							}
							min={10}
							max={32}
						/>
					))}
					<TypographySubsection
						label={__("Price Prefix Style", "pricing-table-block")}
						prefix="pricePrefix"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Badge Text", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`badge-${device.key}`}
							label={device.label}
							value={
								badgeFontSize?.[device.key]?.value ||
								(device.key === "desktop"
									? 11
									: device.key === "tablet"
										? 10
										: 9)
							}
							onChange={(value) =>
								updateFontSize("badgeFontSize", device.key, value)
							}
							min={8}
							max={24}
						/>
					))}
					<TypographySubsection
						label={__("Badge Text Style", "pricing-table-block")}
						prefix="badge"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Billing Toggle", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`toggle-${device.key}`}
							label={device.label}
							value={
								toggleFontSize?.[device.key]?.value ||
								(device.key === "desktop"
									? 14
									: device.key === "tablet"
										? 13
										: 12)
							}
							onChange={(value) =>
								updateFontSize("toggleFontSize", device.key, value)
							}
							min={10}
							max={32}
						/>
					))}
					<TypographySubsection
						label={__("Billing Toggle Style", "pricing-table-block")}
						prefix="toggle"
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Price Prefix", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`price-prefix-2-${device.key}`}
							label={device.label}
							value={
								pricePrefixFontSize?.[device.key]?.value ||
								(device.key === "desktop"
									? 18
									: device.key === "tablet"
										? 16
										: 14)
							}
							onChange={(value) =>
								updateFontSize("pricePrefixFontSize", device.key, value)
							}
							min={10}
							max={32}
						/>
					))}

					<p style={{ marginTop: "16px" }}>
						<strong>{__("Badge Text", "pricing-table-block")}</strong>
					</p>
					{DEVICE_TYPES.map((device) => (
						<RangeControl
							key={`badge-2-${device.key}`}
							label={device.label}
							value={
								badgeFontSize?.[device.key]?.value ||
								(device.key === "desktop"
									? 11
									: device.key === "tablet"
										? 11
										: 10)
							}
							onChange={(value) =>
								updateFontSize("badgeFontSize", device.key, value)
							}
							min={8}
							max={24}
						/>
					))}
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className={containerClasses}>
					<div className="adaire-pricing-table__header">
						<RichText
							tagName="h2"
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							placeholder={__("Enter headingâ€¦", "pricing-table-block")}
							className="adaire-pricing-table__heading"
						/>
						<RichText
							tagName="p"
							value={subheading}
							onChange={(value) => setAttributes({ subheading: value })}
							placeholder={__("Enter subheadingâ€¦", "pricing-table-block")}
							className="adaire-pricing-table__subheading"
						/>
					</div>

					<div className="adaire-pricing-table__billing-toggle" aria-label={__("Billing toggle", "pricing-table-block")}>
						<QuickZone
							id="billing-monthly-label"
							label="Monthly Label"
							activeZone={activeZone}
							setActiveZone={setActiveZone}
							content={
								<TextControl
									label={__("Monthly Label", "pricing-table-block")}
									value={monthlyLabel}
									onChange={(value) => setAttributes({ monthlyLabel: value })}
								/>
							}
						>
							<button
								type="button"
								className={`adaire-pricing-table__billing-option ${
									billingMode === "monthly" ? "is-active" : ""
								}`}
								onClick={() => setAttributes({ billingMode: "monthly" })}
							>
								{monthlyLabel}
							</button>
						</QuickZone>
						<QuickZone
							id="billing-yearly-label"
							label="Yearly Label"
							activeZone={activeZone}
							setActiveZone={setActiveZone}
							content={
								<>
									<TextControl
										label={__("Yearly Label", "pricing-table-block")}
										value={yearlyLabel}
										onChange={(value) => setAttributes({ yearlyLabel: value })}
									/>
									<TextControl
										label={__("Yearly Badge Text", "pricing-table-block")}
										value={yearlyBadgeText}
										onChange={(value) => setAttributes({ yearlyBadgeText: value })}
									/>
								</>
							}
						>
							<button
								type="button"
								className={`adaire-pricing-table__billing-option ${
									billingMode === "yearly" ? "is-active" : ""
								}`}
								onClick={() => setAttributes({ billingMode: "yearly" })}
							>
								<span>{yearlyLabel}</span>
								{yearlyBadgeText && (
									<span className="adaire-pricing-table__billing-badge">
										{yearlyBadgeText}
									</span>
								)}
							</button>
						</QuickZone>
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
										placeholder={__("Plan name", "pricing-table-block")}
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
										placeholder={__("Tagline", "pricing-table-block")}
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
												label={__("Currency Symbol", "pricing-table-block")}
												value={card.currency}
												onChange={(value) =>
													updateCard(cardIndex, { currency: value })
												}
											/>
											<TextControl
												label={__("Monthly Price", "pricing-table-block")}
												value={card.monthlyPrice}
												onChange={(value) =>
													updateCard(cardIndex, { monthlyPrice: value })
												}
											/>
											<TextControl
												label={__("Yearly Price", "pricing-table-block")}
												value={card.yearlyPrice}
												onChange={(value) =>
													updateCard(cardIndex, { yearlyPrice: value })
												}
											/>
											<TextControl
												label={__("Price Suffix", "pricing-table-block")}
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
										<span className="adaire-pricing-table__price-value adaire-pricing-table__price-value--monthly">
											{card.monthlyPrice}
										</span>
										<span className="adaire-pricing-table__price-value adaire-pricing-table__price-value--yearly">
											{card.yearlyPrice}
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
														label={__("Feature", "pricing-table-block")}
														value={feature}
														onChange={(value) =>
															updateFeature(cardIndex, featureIndex, value)
														}
														placeholder={__("Add feature", "pricing-table-block")}
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
													label={__("Button Label", "pricing-table-block")}
													value={card.buttonLabel}
													onChange={(value) =>
														updateCard(cardIndex, { buttonLabel: value })
													}
												/>
												<TextControl
													label={__("Button URL", "pricing-table-block")}
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



