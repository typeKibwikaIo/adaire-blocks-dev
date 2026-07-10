/**
 * Pricing Plans (pricing-table-block) deprecations — most recent first.
 *
 * v1  Frozen copy of the save() that shipped before ADAB-010 added full
 *     typography controls (font weight, line height, letter spacing, text
 *     transform for every text role, a new Plan Tagline font-size, and a
 *     single block-level Font Family control) — unconditionally, for every
 *     instance, regardless of whether the user ever opens the new
 *     "Typography" panel. Posts saved before that change don't have those
 *     custom properties in their stored markup, so re-running the *current*
 *     save() against them would produce a style attribute with extra
 *     declarations that don't match what's stored, and Gutenberg would flag
 *     them as invalid content. No attribute schema changed shape (the new
 *     attributes are purely additive with safe defaults that reproduce the
 *     original hardcoded SCSS values), so `migrate` is a no-op identity
 *     function and this entry doesn't need its own `attributes` key
 *     (Gutenberg falls back to the current block.json attributes when
 *     parsing a deprecated entry that omits one).
 */
import { useBlockProps, RichText } from "@wordpress/block-editor";

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
	const value = dimension?.value ?? fallbackValue;
	const unit = dimension?.unit ?? fallbackUnit;
	return `${value}${unit}`;
};

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

const createComparisonCell = (type = "dash", text = "") => ({ type, text });

const normalizeComparisonValues = (values = [], planCount) => {
	const normalizedValues = Array.isArray(values) ? [...values] : [];
	while (normalizedValues.length < planCount) {
		normalizedValues.push(createComparisonCell());
	}
	return normalizedValues.slice(0, planCount);
};

const renderComparisonCellContent = (cell) => {
	if (cell.type === "check") {
		return (
			<span className="adaire-pricing-table__comparison-icon adaire-pricing-table__comparison-icon--check">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			</span>
		);
	}

	if (cell.type === "cross") {
		return (
			<span className="adaire-pricing-table__comparison-icon adaire-pricing-table__comparison-icon--cross">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</span>
		);
	}

	if (cell.type === "text") {
		return (
			<span className="adaire-pricing-table__comparison-cell-text">
				{cell.text || "—"}
			</span>
		);
	}

	return <span className="adaire-pricing-table__comparison-cell-text">—</span>;
};

const deprecatedV1Typography = {
	migrate( attributes ) {
		return attributes;
	},

	save( { attributes } ) {
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
			showComparisonTable,
			comparisonDisclaimer,
			comparisonToggleLabel,
			comparisonSections = [],
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
			yearlyBadgeBackgroundColor,
			buttonGlowColor,
			buttonGlowOpacity,
		} = attributes;

		const gridColumnsDesktop = gridColumns?.desktop ?? 3;
		const gridColumnsTablet = gridColumns?.tablet ?? gridColumnsDesktop;
		const gridColumnsMobile = gridColumns?.mobile ?? 1;

		const gridGapDesktop = gridGap?.desktop ?? 32;
		const gridGapTablet = gridGap?.tablet ?? gridGapDesktop;
		const gridGapMobile = gridGap?.mobile ?? gridGapTablet;

		const blockProps = useBlockProps.save({
			id: blockId || undefined,
			className: `adaire-pricing-table adaire-pricing-table--billing-${billingMode}`,
			style: {
				"--pricing-bg": backgroundColor,
				"--pricing-card-bg": cardBackgroundColor,
				"--pricing-card-bg-featured": featuredCardBackgroundColor,
				"--pricing-card-text-featured": featuredCardTextColor,
				"--pricing-card-border": cardBorderColor,
				"--pricing-card-border-hover": cardHoverBorderColor,
				"--pricing-heading-color": headingColor,
				"--pricing-subheading-color": subheadingColor,
				"--pricing-plan-name-color": planNameColor,
				"--pricing-price-color": priceColor,
				"--pricing-feature-color": featureTextColor,
				"--pricing-button-text-color": buttonTextColor,
				"--pricing-button-bg": buttonBackgroundColor,
				"--pricing-button-bg-hover": buttonHoverBackgroundColor,
				"--pricing-card-hover-bg": cardHoverBackgroundColor,
				"--pricing-card-hover-text": cardHoverTextColor,
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
				"--pricing-grid-columns": `${gridColumnsDesktop}`,
				"--pricing-grid-columns-tablet": `${gridColumnsTablet}`,
				"--pricing-grid-columns-mobile": `${gridColumnsMobile}`,
				"--pricing-comparison-columns": `${cards.length || 1}`,
				"--pricing-grid-gap": `${gridGapDesktop}px`,
				"--pricing-grid-gap-tablet": `${gridGapTablet}px`,
				"--pricing-grid-gap-mobile": `${gridGapMobile}px`,
				"--pricing-card-padding-top": `${cardPadding?.top ?? 32}px`,
				"--pricing-card-padding-right": `${cardPadding?.right ?? 32}px`,
				"--pricing-card-padding-bottom": `${cardPadding?.bottom ?? 32}px`,
				"--pricing-card-padding-left": `${cardPadding?.left ?? 32}px`,
				"--pricing-card-radius": `${cardBorderRadius}px`,
				"--pricing-card-border-width": `${cardBorderWidth}px`,
				"--pricing-card-text-align": cardTextAlignment || "left",
				"--pricing-card-button-align": cardButtonAlignment || "center",
				"--pricing-button-glow": buttonGlowColor
					? convertColorToRgba(buttonGlowColor, buttonGlowOpacity ?? 25)
					: "",
				"--pricing-price-justify":
					(cardTextAlignment || "left") === "center"
						? "center"
						: (cardTextAlignment || "left") === "right"
							? "flex-end"
							: "flex-start",
				"--pricing-features-align":
					(cardTextAlignment || "left") === "center"
						? "center"
						: (cardTextAlignment || "left") === "right"
							? "flex-end"
							: "flex-start",
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
			},
		});

		const containerClasses = [
			"adaire-pricing-table__container",
			containerMode === "constrained" ? "is-constrained" : "",
		]
			.filter(Boolean)
			.join(" ");

		return (
			<div {...blockProps}>
				<div className={containerClasses}>
					<div className="adaire-pricing-table__header">
						<RichText.Content
							tagName="h2"
							value={heading}
							className="adaire-pricing-table__heading"
						/>
						<RichText.Content
							tagName="p"
							value={subheading}
							className="adaire-pricing-table__subheading"
						/>
					</div>

					<div
						className="adaire-pricing-table__billing-toggle"
						aria-label="Billing toggle"
					>
						<button
							type="button"
							className={`adaire-pricing-table__billing-option ${
								billingMode === "monthly" ? "is-active" : ""
							}`}
							data-billing="monthly"
						>
							{monthlyLabel}
						</button>
						<button
							type="button"
							className={`adaire-pricing-table__billing-option ${
								billingMode === "yearly" ? "is-active" : ""
							}`}
							data-billing="yearly"
						>
							<span>{yearlyLabel}</span>
							{yearlyBadgeText && (
								<span className="adaire-pricing-table__billing-badge">
									{yearlyBadgeText}
								</span>
							)}
						</button>
					</div>

					<div className="adaire-pricing-table__grid">
						{cards.map((card, index) => (
							<div
								key={card.id || index}
								className={`adaire-pricing-table__card ${
									card.isFeatured ? "is-featured" : ""
								}`}
							>
								<div className="adaire-pricing-table__card-header">
									<RichText.Content
										tagName="h3"
										value={card.name}
										className="adaire-pricing-table__plan-name"
									/>
									<RichText.Content
										tagName="p"
										value={card.tagline}
										className="adaire-pricing-table__plan-tagline"
									/>
								</div>

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

								<ul className="adaire-pricing-table__features">
									{(card.features || []).map((feature, featureIndex) => (
										<li key={`${card.id || index}-feature-${featureIndex}`}>
											{feature}
										</li>
									))}
								</ul>

								<div className="adaire-pricing-table__card-footer">
									<a
										href={card.buttonUrl || "#"}
										className="adaire-pricing-table__button"
										target={card.buttonTarget === "_blank" ? "_blank" : undefined}
										rel={
											card.buttonTarget === "_blank"
												? "noopener noreferrer"
												: undefined
										}
									>
										{card.buttonLabel}
									</a>
								</div>
							</div>
						))}
					</div>

				</div>
			</div>
		);
	},
};


// v1 (yearly pricing): pre-"remove yearly pricing" save — included a
// monthly/yearly billing toggle, a per-card yearlyPrice, and a yearly badge.
// Frozen here so pages saved with that markup still validate; migrate()
// drops the yearly-only attributes so upgraded blocks match the current
// (monthly-only) schema.
const v1AttributesYearlyPricing = {
	blockId: {
		type: "string",
		default: "",
	},
	containerMode: {
		type: "string",
		default: "constrained",
	},
	containerMaxWidth: {
		type: "object",
		default: {
			desktop: { value: 1200, unit: "px" },
			tablet: { value: 100, unit: "%" },
			mobile: { value: 100, unit: "%" },
		},
	},
	heading: {
		type: "string",
		default: "Simple, transparent pricing",
	},
	subheading: {
		type: "string",
		default:
			"Choose the plan that best fits your project, switch between monthly and yearly billing at any time.",
	},
	billingMode: {
		type: "string",
		default: "monthly",
	},
	monthlyLabel: {
		type: "string",
		default: "Monthly",
	},
	yearlyLabel: {
		type: "string",
		default: "Yearly",
	},
	yearlyBadgeText: {
		type: "string",
		default: "Save 20%",
	},
	cards: {
		type: "array",
		default: [
			{
				id: "plan-basic",
				name: "Basic",
				tagline: "For small projects",
				currency: "$",
				monthlyPrice: "19",
				yearlyPrice: "190",
				priceSuffix: "/mo",
				features: ["2GB Bandwidth", "50GB Storage", "5 Accounts", "Email Support"],
				buttonLabel: "Sign Up",
				buttonUrl: "#",
				buttonTarget: "_self",
				isFeatured: false,
			},
			{
				id: "plan-standard",
				name: "Standard",
				tagline: "Best for growing teams",
				currency: "$",
				monthlyPrice: "49",
				yearlyPrice: "490",
				priceSuffix: "/mo",
				features: ["10GB Bandwidth", "150GB Storage", "25 Accounts", "Priority Support"],
				buttonLabel: "Get Started",
				buttonUrl: "#",
				buttonTarget: "_self",
				isFeatured: true,
			},
			{
				id: "plan-unlimited",
				name: "Unlimited",
				tagline: "For large organizations",
				currency: "$",
				monthlyPrice: "99",
				yearlyPrice: "990",
				priceSuffix: "/mo",
				features: ["Unlimited Bandwidth", "1TB Storage", "Unlimited Accounts", "24/7 Support"],
				buttonLabel: "Contact Sales",
				buttonUrl: "#",
				buttonTarget: "_self",
				isFeatured: false,
			},
		],
	},
	backgroundColor: { type: "string", default: "#f5f5f7" },
	cardBackgroundColor: { type: "string", default: "#ffffff" },
	featuredCardBackgroundColor: { type: "string", default: "#503AA8" },
	featuredCardTextColor: { type: "string", default: "#ffffff" },
	cardBorderColor: { type: "string", default: "#e5e7eb" },
	cardHoverBorderColor: { type: "string", default: "#503AA8" },
	headingColor: { type: "string", default: "#111827" },
	subheadingColor: { type: "string", default: "#6b7280" },
	planNameColor: { type: "string", default: "#111827" },
	priceColor: { type: "string", default: "#111827" },
	featureTextColor: { type: "string", default: "#4b5563" },
	buttonTextColor: { type: "string", default: "#ffffff" },
	buttonBackgroundColor: { type: "string", default: "#503AA8" },
	buttonHoverBackgroundColor: { type: "string", default: "#3d2c8d" },
	headingFontSize: {
		type: "object",
		default: {
			desktop: { value: 40, unit: "px" },
			tablet: { value: 32, unit: "px" },
			mobile: { value: 26, unit: "px" },
		},
	},
	subheadingFontSize: {
		type: "object",
		default: {
			desktop: { value: 18, unit: "px" },
			tablet: { value: 16, unit: "px" },
			mobile: { value: 14, unit: "px" },
		},
	},
	planNameFontSize: {
		type: "object",
		default: {
			desktop: { value: 20, unit: "px" },
			tablet: { value: 18, unit: "px" },
			mobile: { value: 16, unit: "px" },
		},
	},
	priceFontSize: {
		type: "object",
		default: {
			desktop: { value: 40, unit: "px" },
			tablet: { value: 32, unit: "px" },
			mobile: { value: 28, unit: "px" },
		},
	},
	featureFontSize: {
		type: "object",
		default: {
			desktop: { value: 14, unit: "px" },
			tablet: { value: 14, unit: "px" },
			mobile: { value: 13, unit: "px" },
		},
	},
	buttonFontSize: {
		type: "object",
		default: {
			desktop: { value: 15, unit: "px" },
			tablet: { value: 15, unit: "px" },
			mobile: { value: 14, unit: "px" },
		},
	},
	pricePrefixFontSize: {
		type: "object",
		default: {
			desktop: { value: 18, unit: "px" },
			tablet: { value: 16, unit: "px" },
			mobile: { value: 14, unit: "px" },
		},
	},
	badgeFontSize: {
		type: "object",
		default: {
			desktop: { value: 11, unit: "px" },
			tablet: { value: 10, unit: "px" },
			mobile: { value: 9, unit: "px" },
		},
	},
	gridColumns: {
		type: "object",
		default: { desktop: 3, tablet: 3, mobile: 1 },
	},
	gridGap: {
		type: "object",
		default: { desktop: 32, tablet: 24, mobile: 20 },
	},
	cardPadding: {
		type: "object",
		default: { top: 32, right: 32, bottom: 32, left: 32 },
	},
	cardBorderRadius: { type: "number", default: 8 },
	cardBorderWidth: { type: "number", default: 1 },
	cardTextAlignment: { type: "string", default: "left" },
	cardButtonAlignment: { type: "string", default: "center" },
	cardHoverBackgroundColor: { type: "string", default: "" },
	cardHoverTextColor: { type: "string", default: "" },
	yearlyBadgeBackgroundColor: { type: "string", default: "#503AA8" },
	priceSuffixFontSize: {
		type: "object",
		default: {
			desktop: { value: 14, unit: "px" },
			tablet: { value: 13, unit: "px" },
			mobile: { value: 12, unit: "px" },
		},
	},
	toggleFontSize: {
		type: "object",
		default: {
			desktop: { value: 14, unit: "px" },
			tablet: { value: 13, unit: "px" },
			mobile: { value: 12, unit: "px" },
		},
	},
	buttonGlowColor: { type: "string", default: "" },
	buttonGlowOpacity: { type: "number", default: 25 },
};

const deprecatedV1YearlyPricing = {
		attributes: v1AttributesYearlyPricing,

		migrate(attributes) {
			const {
				billingMode,
				monthlyLabel,
				yearlyLabel,
				yearlyBadgeText,
				yearlyBadgeBackgroundColor,
				toggleFontSize,
				badgeFontSize,
				cards,
				...rest
			} = attributes;

			return {
				...rest,
				cards: (cards || []).map(({ yearlyPrice, ...card }) => card),
			};
		},

		save({ attributes }) {
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
				showComparisonTable,
				comparisonDisclaimer,
				comparisonToggleLabel,
				comparisonSections = [],
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
				yearlyBadgeBackgroundColor,
				buttonGlowColor,
				buttonGlowOpacity,
			} = attributes;

			const gridColumnsDesktop = gridColumns?.desktop ?? 3;
			const gridColumnsTablet = gridColumns?.tablet ?? gridColumnsDesktop;
			const gridColumnsMobile = gridColumns?.mobile ?? 1;

			const gridGapDesktop = gridGap?.desktop ?? 32;
			const gridGapTablet = gridGap?.tablet ?? gridGapDesktop;
			const gridGapMobile = gridGap?.mobile ?? gridGapTablet;

			const blockProps = useBlockProps.save({
				id: blockId || undefined,
				className: `adaire-pricing-table adaire-pricing-table--billing-${billingMode}`,
				style: {
					"--pricing-bg": backgroundColor,
					"--pricing-card-bg": cardBackgroundColor,
					"--pricing-card-bg-featured": featuredCardBackgroundColor,
					"--pricing-card-text-featured": featuredCardTextColor,
					"--pricing-card-border": cardBorderColor,
					"--pricing-card-border-hover": cardHoverBorderColor,
					"--pricing-heading-color": headingColor,
					"--pricing-subheading-color": subheadingColor,
					"--pricing-plan-name-color": planNameColor,
					"--pricing-price-color": priceColor,
					"--pricing-feature-color": featureTextColor,
					"--pricing-button-text-color": buttonTextColor,
					"--pricing-button-bg": buttonBackgroundColor,
					"--pricing-button-bg-hover": buttonHoverBackgroundColor,
					"--pricing-card-hover-bg": cardHoverBackgroundColor,
					"--pricing-card-hover-text": cardHoverTextColor,
					"--pricing-badge-bg": yearlyBadgeBackgroundColor,
					"--pricing-heading-size": formatDimensionValue(headingFontSize?.desktop, 40, "px"),
					"--pricing-heading-size-tablet": formatDimensionValue(headingFontSize?.tablet, 32, "px"),
					"--pricing-heading-size-mobile": formatDimensionValue(headingFontSize?.mobile, 26, "px"),
					"--pricing-subheading-size": formatDimensionValue(subheadingFontSize?.desktop, 18, "px"),
					"--pricing-subheading-size-tablet": formatDimensionValue(subheadingFontSize?.tablet, 16, "px"),
					"--pricing-subheading-size-mobile": formatDimensionValue(subheadingFontSize?.mobile, 14, "px"),
					"--pricing-plan-name-size": formatDimensionValue(planNameFontSize?.desktop, 20, "px"),
					"--pricing-plan-name-size-tablet": formatDimensionValue(planNameFontSize?.tablet, 18, "px"),
					"--pricing-plan-name-size-mobile": formatDimensionValue(planNameFontSize?.mobile, 16, "px"),
					"--pricing-price-size": formatDimensionValue(priceFontSize?.desktop, 40, "px"),
					"--pricing-price-size-tablet": formatDimensionValue(priceFontSize?.tablet, 32, "px"),
					"--pricing-price-size-mobile": formatDimensionValue(priceFontSize?.mobile, 28, "px"),
					"--pricing-feature-size": formatDimensionValue(featureFontSize?.desktop, 14, "px"),
					"--pricing-feature-size-tablet": formatDimensionValue(featureFontSize?.tablet, 14, "px"),
					"--pricing-feature-size-mobile": formatDimensionValue(featureFontSize?.mobile, 13, "px"),
					"--pricing-button-size": formatDimensionValue(buttonFontSize?.desktop, 15, "px"),
					"--pricing-button-size-tablet": formatDimensionValue(buttonFontSize?.tablet, 15, "px"),
					"--pricing-button-size-mobile": formatDimensionValue(buttonFontSize?.mobile, 14, "px"),
					"--pricing-price-suffix-size": formatDimensionValue(priceSuffixFontSize?.desktop, 14, "px"),
					"--pricing-price-suffix-size-tablet": formatDimensionValue(priceSuffixFontSize?.tablet, 13, "px"),
					"--pricing-price-suffix-size-mobile": formatDimensionValue(priceSuffixFontSize?.mobile, 12, "px"),
					"--pricing-toggle-size": formatDimensionValue(toggleFontSize?.desktop, 14, "px"),
					"--pricing-toggle-size-tablet": formatDimensionValue(toggleFontSize?.tablet, 13, "px"),
					"--pricing-toggle-size-mobile": formatDimensionValue(toggleFontSize?.mobile, 12, "px"),
					"--pricing-price-prefix-size": formatDimensionValue(pricePrefixFontSize?.desktop, 18, "px"),
					"--pricing-price-prefix-size-tablet": formatDimensionValue(pricePrefixFontSize?.tablet, 16, "px"),
					"--pricing-price-prefix-size-mobile": formatDimensionValue(pricePrefixFontSize?.mobile, 14, "px"),
					"--pricing-badge-font-size": formatDimensionValue(badgeFontSize?.desktop, 11, "px"),
					"--pricing-badge-font-size-tablet": formatDimensionValue(badgeFontSize?.tablet, 11, "px"),
					"--pricing-badge-font-size-mobile": formatDimensionValue(badgeFontSize?.mobile, 10, "px"),
					"--pricing-grid-columns": `${gridColumnsDesktop}`,
					"--pricing-grid-columns-tablet": `${gridColumnsTablet}`,
					"--pricing-grid-columns-mobile": `${gridColumnsMobile}`,
					"--pricing-comparison-columns": `${cards.length || 1}`,
					"--pricing-grid-gap": `${gridGapDesktop}px`,
					"--pricing-grid-gap-tablet": `${gridGapTablet}px`,
					"--pricing-grid-gap-mobile": `${gridGapMobile}px`,
					"--pricing-card-padding-top": `${cardPadding?.top ?? 32}px`,
					"--pricing-card-padding-right": `${cardPadding?.right ?? 32}px`,
					"--pricing-card-padding-bottom": `${cardPadding?.bottom ?? 32}px`,
					"--pricing-card-padding-left": `${cardPadding?.left ?? 32}px`,
					"--pricing-card-radius": `${cardBorderRadius}px`,
					"--pricing-card-border-width": `${cardBorderWidth}px`,
					"--pricing-card-text-align": cardTextAlignment || "left",
					"--pricing-card-button-align": cardButtonAlignment || "center",
					"--pricing-button-glow": buttonGlowColor
						? convertColorToRgba(buttonGlowColor, buttonGlowOpacity ?? 25)
						: "",
					"--pricing-price-justify":
						(cardTextAlignment || "left") === "center"
							? "center"
							: (cardTextAlignment || "left") === "right"
								? "flex-end"
								: "flex-start",
					"--pricing-features-align":
						(cardTextAlignment || "left") === "center"
							? "center"
							: (cardTextAlignment || "left") === "right"
								? "flex-end"
								: "flex-start",
					"--container-max-width": formatDimensionValue(containerMaxWidth?.desktop, 1200, "px"),
					"--container-max-width-tablet": formatDimensionValue(containerMaxWidth?.tablet, 100, "%"),
					"--container-max-width-mobile": formatDimensionValue(containerMaxWidth?.mobile, 100, "%"),
				},
			});

			const containerClasses = [
				"adaire-pricing-table__container",
				containerMode === "constrained" ? "is-constrained" : "",
			]
				.filter(Boolean)
				.join(" ");

			return (
				<div {...blockProps}>
					<div className={containerClasses}>
						<div className="adaire-pricing-table__header">
							<RichText.Content
								tagName="h2"
								value={heading}
								className="adaire-pricing-table__heading"
							/>
							<RichText.Content
								tagName="p"
								value={subheading}
								className="adaire-pricing-table__subheading"
							/>
						</div>

						<div
							className="adaire-pricing-table__billing-toggle"
							aria-label="Billing toggle"
						>
							<button
								type="button"
								className={`adaire-pricing-table__billing-option ${
									billingMode === "monthly" ? "is-active" : ""
								}`}
								data-billing="monthly"
							>
								{monthlyLabel}
							</button>
							<button
								type="button"
								className={`adaire-pricing-table__billing-option ${
									billingMode === "yearly" ? "is-active" : ""
								}`}
								data-billing="yearly"
							>
								<span>{yearlyLabel}</span>
								{yearlyBadgeText && (
									<span className="adaire-pricing-table__billing-badge">
										{yearlyBadgeText}
									</span>
								)}
							</button>
						</div>

						<div className="adaire-pricing-table__grid">
							{cards.map((card, index) => (
								<div
									key={card.id || index}
									className={`adaire-pricing-table__card ${
										card.isFeatured ? "is-featured" : ""
									}`}
								>
									<div className="adaire-pricing-table__card-header">
										<RichText.Content
											tagName="h3"
											value={card.name}
											className="adaire-pricing-table__plan-name"
										/>
										<RichText.Content
											tagName="p"
											value={card.tagline}
											className="adaire-pricing-table__plan-tagline"
										/>
									</div>

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

									<ul className="adaire-pricing-table__features">
										{(card.features || []).map((feature, featureIndex) => (
											<li key={`${card.id || index}-feature-${featureIndex}`}>
												{feature}
											</li>
										))}
									</ul>

									<div className="adaire-pricing-table__card-footer">
										<a
											href={card.buttonUrl || "#"}
											className="adaire-pricing-table__button"
											target={card.buttonTarget === "_blank" ? "_blank" : undefined}
											rel={
												card.buttonTarget === "_blank"
													? "noopener noreferrer"
													: undefined
											}
										>
											{card.buttonLabel}
										</a>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			);
		}
};

export default [ deprecatedV1Typography, deprecatedV1YearlyPricing ];
