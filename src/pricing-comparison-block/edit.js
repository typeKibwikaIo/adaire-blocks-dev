import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InspectorControls,
	RichText,
	ColorPalette,
} from "@wordpress/block-editor";
import {
	PanelBody,
	TextControl,
	ToggleControl,
	SelectControl,
	Button,
	RangeControl,
	BaseControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import { useState, useMemo } from "@wordpress/element";
import QuickZone from "../components/QuickZone";

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
	{ label: 'None', value: 'none' },
	{ label: 'Uppercase', value: 'uppercase' },
	{ label: 'Lowercase', value: 'lowercase' },
	{ label: 'Capitalize', value: 'capitalize' },
];

const FONT_WEIGHT_OPTIONS = [
	{ label: 'Thin (100)', value: '100' },
	{ label: 'Extra Light (200)', value: '200' },
	{ label: 'Light (300)', value: '300' },
	{ label: 'Normal (400)', value: '400' },
	{ label: 'Medium (500)', value: '500' },
	{ label: 'Semi Bold (600)', value: '600' },
	{ label: 'Bold (700)', value: '700' },
	{ label: 'Extra Bold (800)', value: '800' },
	{ label: 'Black (900)', value: '900' },
];

function TypographyControls( { attributes, setAttributes, prefix } ) {
	const set = ( key ) => ( value ) => setAttributes( { [ key ]: value } );
	const a = attributes;
	return (
		<>
			<TextControl
				label={ __( "Font size", "pricing-comparison-block" ) }
				value={ a[ `${ prefix }FontSize` ] }
				onChange={ set( `${ prefix }FontSize` ) }
			/>
			<SelectControl
				label={ __( "Font weight", "pricing-comparison-block" ) }
				value={ a[ `${ prefix }FontWeight` ] }
				options={ FONT_WEIGHT_OPTIONS }
				onChange={ set( `${ prefix }FontWeight` ) }
			/>
			<UnitControl
				label={ __( "Line height", "pricing-comparison-block" ) }
				value={ a[ `${ prefix }LineHeight` ] }
				onChange={ set( `${ prefix }LineHeight` ) }
			/>
			<UnitControl
				label={ __( "Letter spacing", "pricing-comparison-block" ) }
				value={ a[ `${ prefix }LetterSpacing` ] }
				onChange={ set( `${ prefix }LetterSpacing` ) }
			/>
			<SelectControl
				label={ __( "Text transform", "pricing-comparison-block" ) }
				value={ a[ `${ prefix }TextTransform` ] }
				options={ TEXT_TRANSFORM_OPTIONS }
				onChange={ set( `${ prefix }TextTransform` ) }
			/>
		</>
	);
}

export default function Edit({ attributes, setAttributes }) {
	const {
		blockId,
		headingText,
		subheadingText,
		linkText,
		linkUrl,
		showGuarantee,
		guaranteeText,
		activeGroupId,
		displayMode = "comparison",
		planGroups = [],
		containerMode = "full",
		containerMaxWidth,
		paddingTop,
		paddingBottom,
		backgroundColor,
		textColor,
		mutedTextColor,
		accentColor,
		borderColor,
		cardBackground,
		highlightBackground,
		cardRadius = 20,
		buttonBackground,
		buttonTextColor,
		buttonOutlineColor,
		stickyBackground,
		stickyBorderColor,
		stickyLabel,
		showSticky,
		tableStripedColor,
		fontFamily,
		headingFontSize,
		headingFontWeight,
		headingLineHeight,
		headingLetterSpacing,
		headingTextTransform,
		subheadingFontSize,
		subheadingFontWeight,
		subheadingLineHeight,
		subheadingLetterSpacing,
		subheadingTextTransform,
		cardTitleFontSize,
		cardTitleFontWeight,
		cardTitleLineHeight,
		cardTitleLetterSpacing,
		cardTitleTextTransform,
		cardDescriptionFontSize,
		cardDescriptionFontWeight,
		cardDescriptionLineHeight,
		cardDescriptionLetterSpacing,
		cardDescriptionTextTransform,
		priceFontSize,
		priceFontWeight,
		priceLineHeight,
		priceLetterSpacing,
		priceTextTransform,
		ctaFontSize,
		ctaFontWeight,
		ctaLineHeight,
		ctaLetterSpacing,
		ctaTextTransform,
		featureLabelFontSize,
		featureLabelFontWeight,
		featureLabelLineHeight,
		featureLabelLetterSpacing,
		featureLabelTextTransform,
		featureSectionTitleFontSize,
		featureSectionTitleFontWeight,
		featureSectionTitleLineHeight,
		featureSectionTitleLetterSpacing,
		featureSectionTitleTextTransform,
		guaranteeFontSize,
		guaranteeFontWeight,
		guaranteeLineHeight,
		guaranteeLetterSpacing,
		guaranteeTextTransform,
	} = attributes;

	// Use internal state for the active group in the editor
	const [activeTab, setActiveTab] = useState(activeGroupId || (planGroups[0]?.id || ""));
	const [activeZone, setActiveZone] = useState(null);

	const activeGroup = useMemo(() => {
		return planGroups.find((group) => group.id === activeTab) || planGroups[0];
	}, [planGroups, activeTab]);

	const activePlans = activeGroup?.plans || [];
	const activeSections = activeGroup?.featureSections || [];

	const blockProps = useBlockProps({
		className: `adaire-pricing-compare adaire-pricing-compare--layout-${displayMode} adaire-pricing-compare--editor`,
		style: {
			backgroundColor,
			color: textColor,
			paddingTop: `${paddingTop}px`,
			paddingBottom: `${paddingBottom}px`,
			"--pc-muted-text": mutedTextColor,
			"--pc-accent": accentColor,
			"--pc-border": borderColor,
			"--pc-card-bg": cardBackground,
			"--pc-highlight-bg": highlightBackground,
			"--pc-card-radius": `${cardRadius}px`,
			"--pc-button-bg": buttonBackground,
			"--pc-button-text": buttonTextColor,
			"--pc-button-outline": buttonOutlineColor,
			"--pc-sticky-bg": stickyBackground,
			"--pc-sticky-border": stickyBorderColor,
			"--pc-striped": tableStripedColor,
			"--pc-container-max-width": `${
				containerMaxWidth?.desktop?.value ?? 1200
			}${containerMaxWidth?.desktop?.unit ?? "px"}`,

			"--pc-font-family": fontFamily || "inherit",

			"--pc-heading-font-size": headingFontSize || "clamp(24px, 3vw, 40px)",
			"--pc-heading-font-weight": headingFontWeight || "700",
			"--pc-heading-line-height": headingLineHeight || "normal",
			"--pc-heading-letter-spacing": headingLetterSpacing || "normal",
			"--pc-heading-text-transform": headingTextTransform || "none",

			"--pc-subheading-font-size": subheadingFontSize || "12px",
			"--pc-subheading-font-weight": subheadingFontWeight || "400",
			"--pc-subheading-line-height": subheadingLineHeight || "normal",
			"--pc-subheading-letter-spacing": subheadingLetterSpacing || "0.08em",
			"--pc-subheading-text-transform": subheadingTextTransform || "uppercase",

			"--pc-card-title-font-size": cardTitleFontSize || "18px",
			"--pc-card-title-font-weight": cardTitleFontWeight || "600",
			"--pc-card-title-line-height": cardTitleLineHeight || "normal",
			"--pc-card-title-letter-spacing": cardTitleLetterSpacing || "normal",
			"--pc-card-title-text-transform": cardTitleTextTransform || "none",

			"--pc-card-description-font-size": cardDescriptionFontSize || "14px",
			"--pc-card-description-font-weight": cardDescriptionFontWeight || "400",
			"--pc-card-description-line-height": cardDescriptionLineHeight || "1.5",
			"--pc-card-description-letter-spacing": cardDescriptionLetterSpacing || "normal",
			"--pc-card-description-text-transform": cardDescriptionTextTransform || "none",

			"--pc-price-font-size": priceFontSize || "30px",
			"--pc-price-font-weight": priceFontWeight || "700",
			"--pc-price-line-height": priceLineHeight || "normal",
			"--pc-price-letter-spacing": priceLetterSpacing || "normal",
			"--pc-price-text-transform": priceTextTransform || "none",

			"--pc-cta-font-size": ctaFontSize || "14px",
			"--pc-cta-font-weight": ctaFontWeight || "600",
			"--pc-cta-line-height": ctaLineHeight || "normal",
			"--pc-cta-letter-spacing": ctaLetterSpacing || "normal",
			"--pc-cta-text-transform": ctaTextTransform || "none",

			"--pc-feature-label-font-size": featureLabelFontSize || "13px",
			"--pc-feature-label-font-weight": featureLabelFontWeight || "500",
			"--pc-feature-label-line-height": featureLabelLineHeight || "1.4",
			"--pc-feature-label-letter-spacing": featureLabelLetterSpacing || "normal",
			"--pc-feature-label-text-transform": featureLabelTextTransform || "none",

			"--pc-feature-section-title-font-size": featureSectionTitleFontSize || "11px",
			"--pc-feature-section-title-font-weight": featureSectionTitleFontWeight || "700",
			"--pc-feature-section-title-line-height": featureSectionTitleLineHeight || "normal",
			"--pc-feature-section-title-letter-spacing": featureSectionTitleLetterSpacing || "0.08em",
			"--pc-feature-section-title-text-transform": featureSectionTitleTextTransform || "uppercase",

			"--pc-guarantee-font-size": guaranteeFontSize || "14px",
			"--pc-guarantee-font-weight": guaranteeFontWeight || "400",
			"--pc-guarantee-line-height": guaranteeLineHeight || "1.5",
			"--pc-guarantee-letter-spacing": guaranteeLetterSpacing || "normal",
			"--pc-guarantee-text-transform": guaranteeTextTransform || "none",
		},
	});

	// Helper to update a single plan
	const updatePlan = (groupIndex, planId, newValues) => {
		const newGroups = [...planGroups];
		newGroups[groupIndex].plans = newGroups[groupIndex].plans.map((p) =>
			p.id === planId ? { ...p, ...newValues } : p
		);
		setAttributes({ planGroups: newGroups });
	};

	// Helper to add a new section
	const addSection = (groupIndex) => {
		const newGroups = [...planGroups];
		const sectionId = `section-${Date.now()}`;
		newGroups[groupIndex].featureSections = [
			...(newGroups[groupIndex].featureSections || []),
			{
				id: sectionId,
				title: __("New Section", "pricing-comparison-block"),
				open: true,
				rows: [
					{
						id: `row-${Date.now()}`,
						label: __("New Feature", "pricing-comparison-block"),
						values: Array(newGroups[groupIndex].plans.length).fill({
							type: "check",
							text: "",
						}),
					},
				],
			},
		];
		setAttributes({ planGroups: newGroups });
	};

	// Helper to add a row to a section
	const addRow = (groupIndex, sectionId) => {
		const newGroups = [...planGroups];
		newGroups[groupIndex].featureSections = newGroups[groupIndex].featureSections.map(
			(s) =>
				s.id === sectionId
					? {
							...s,
							rows: [
								...s.rows,
								{
									id: `row-${Date.now()}`,
									label: __("New Feature", "pricing-comparison-block"),
									values: Array(newGroups[groupIndex].plans.length).fill({
										type: "check",
										text: "",
									}),
								},
							],
					  }
					: s
		);
		setAttributes({ planGroups: newGroups });
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Audience Tabs", "pricing-comparison-block")}>
					<p className="description">{__("Manage the main audience segments (tabs) for your pricing table.", "pricing-comparison-block")}</p>
					{planGroups.map((group, index) => (
						<div key={group.id} className="pc-editor-sidebar-item">
							<div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '8px' }}>
								<div style={{ flex: 1 }}>
									<TextControl
										label={__("Tab Label", "pricing-comparison-block")}
										value={group.label}
										onChange={(label) => {
											const newGroups = [...planGroups];
											newGroups[index].label = label;
											setAttributes({ planGroups: newGroups });
										}}
									/>
								</div>
								<Button
									isDestructive
									icon="trash"
									onClick={() => {
										if (window.confirm(__("Are you sure you want to remove this audience tab?", "pricing-comparison-block"))) {
											const newGroups = planGroups.filter((_, i) => i !== index);
											setAttributes({ planGroups: newGroups });
										}
									}}
								/>
							</div>
						</div>
					))}
					<Button
						variant="secondary"
						icon="plus"
						onClick={() => {
							const newGroupId = `group-${Date.now()}`;
							const newGroups = [
								...planGroups,
								{
									id: newGroupId,
									label: __("New Audience", "pricing-comparison-block"),
									plans: [
										{
											id: `plan-${Date.now()}`,
											name: __("New Plan", "pricing-comparison-block"),
											price: "$10",
											pricePeriod: "/mo",
											ctaText: __("Buy Now", "pricing-comparison-block"),
											highlight: false,
											metaItems: [__("Feature 1", "pricing-comparison-block")]
										}
									],
									featureSections: []
								}
							];
							setAttributes({ planGroups: newGroups });
						}}
					>
						{__("Add Audience Tab", "pricing-comparison-block")}
					</Button>
				</PanelBody>

				<PanelBody title={__("Plan Management", "pricing-comparison-block")} initialOpen={false}>
					<p className="description">{__("Manage plans for the currently active tab.", "pricing-comparison-block")}</p>
					{activePlans.map((plan, index) => (
						<div key={plan.id} className="pc-editor-sidebar-item">
							<div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
								<div style={{ flex: 1 }}>
									<TextControl
										label={__("Plan Name", "pricing-comparison-block")}
										value={plan.name}
										onChange={(name) => updatePlan(planGroups.findIndex(g => g.id === activeTab), plan.id, { name })}
									/>
									<ToggleControl
										label={__("Highlight Plan", "pricing-comparison-block")}
										checked={plan.highlight}
										onChange={(highlight) => updatePlan(planGroups.findIndex(g => g.id === activeTab), plan.id, { highlight })}
									/>
								</div>
								<Button
									isDestructive
									icon="trash"
									onClick={() => {
										if (window.confirm(__("Remove this plan?", "pricing-comparison-block"))) {
											const groupIndex = planGroups.findIndex(g => g.id === activeTab);
											const newGroups = [...planGroups];
											newGroups[groupIndex].plans = newGroups[groupIndex].plans.filter(p => p.id !== plan.id);
											setAttributes({ planGroups: newGroups });
										}
									}}
								/>
							</div>
						</div>
					))}
					<Button
						variant="secondary"
						icon="plus"
						onClick={() => {
							const groupIndex = planGroups.findIndex(g => g.id === activeTab);
							const newPlan = {
								id: `plan-${Date.now()}`,
								name: __("New Plan", "pricing-comparison-block"),
								price: "$20",
								pricePeriod: "/mo",
								ctaText: __("Buy Now", "pricing-comparison-block"),
								highlight: false,
								metaItems: []
							};
							const newGroups = [...planGroups];
							newGroups[groupIndex].plans = [...newGroups[groupIndex].plans, newPlan];
							setAttributes({ planGroups: newGroups });
						}}
					>
						{__("Add New Plan", "pricing-comparison-block")}
					</Button>
				</PanelBody>

				<PanelBody title={__("Layout Settings", "pricing-comparison-block")} initialOpen={false}>
					<SelectControl
						label={__("Container Mode", "pricing-comparison-block")}
						value={containerMode}
						options={[
							{ label: "Full Width", value: "full" },
							{ label: "Constrained", value: "constrained" },
						]}
						onChange={(value) => setAttributes({ containerMode: value })}
					/>
					{containerMode === "constrained" && (
						<BaseControl label={__("Max Width (Desktop)", "pricing-comparison-block")}>
							<RangeControl
								value={containerMaxWidth?.desktop?.value || 1200}
								onChange={(value) =>
									setAttributes({
										containerMaxWidth: {
											...containerMaxWidth,
											desktop: { ...containerMaxWidth.desktop, value },
										},
									})
								}
								min={600}
								max={1600}
							/>
						</BaseControl>
					)}
					<SelectControl
						label={__("Display Mode", "pricing-comparison-block")}
						value={displayMode}
						options={[
							{ label: "Cards + Comparison", value: "comparison" },
							{ label: "Cards Only", value: "cards" },
						]}
						onChange={(value) => setAttributes({ displayMode: value })}
					/>
				</PanelBody>

				<PanelBody title={__("Typography", "pricing-comparison-block")} initialOpen={false}>
					<SelectControl
						label={__("Font Family", "pricing-comparison-block")}
						value={fontFamily || ''}
						options={FONT_FAMILY_OPTIONS}
						onChange={(value) => setAttributes({ fontFamily: value })}
						help={__("Applies to all text in this block.", "pricing-comparison-block")}
					/>

					<p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>{__("Heading", "pricing-comparison-block")}</p>
					<TypographyControls attributes={attributes} setAttributes={setAttributes} prefix="heading" />

					<p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>{__("Subheading", "pricing-comparison-block")}</p>
					<TypographyControls attributes={attributes} setAttributes={setAttributes} prefix="subheading" />

					<p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>{__("Plan Name", "pricing-comparison-block")}</p>
					<TypographyControls attributes={attributes} setAttributes={setAttributes} prefix="cardTitle" />

					<p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>{__("Plan Description", "pricing-comparison-block")}</p>
					<TypographyControls attributes={attributes} setAttributes={setAttributes} prefix="cardDescription" />

					<p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>{__("Price", "pricing-comparison-block")}</p>
					<TypographyControls attributes={attributes} setAttributes={setAttributes} prefix="price" />

					<p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>{__("CTA / Button Text", "pricing-comparison-block")}</p>
					<TypographyControls attributes={attributes} setAttributes={setAttributes} prefix="cta" />

					<p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>{__("Feature List Label", "pricing-comparison-block")}</p>
					<TypographyControls attributes={attributes} setAttributes={setAttributes} prefix="featureLabel" />

					<p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>{__("Feature Section Title", "pricing-comparison-block")}</p>
					<TypographyControls attributes={attributes} setAttributes={setAttributes} prefix="featureSectionTitle" />

					<p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>{__("Guarantee Text", "pricing-comparison-block")}</p>
					<TypographyControls attributes={attributes} setAttributes={setAttributes} prefix="guarantee" />
				</PanelBody>

				<PanelBody title={__("Spacing & Style", "pricing-comparison-block")} initialOpen={false}>
					<RangeControl
						label={__("Padding Top", "pricing-comparison-block")}
						value={paddingTop}
						onChange={(value) => setAttributes({ paddingTop: value })}
						min={0}
						max={200}
					/>
					<RangeControl
						label={__("Padding Bottom", "pricing-comparison-block")}
						value={paddingBottom}
						onChange={(value) => setAttributes({ paddingBottom: value })}
						min={0}
						max={200}
					/>
					<RangeControl
						label={__("Card Corner Radius", "pricing-comparison-block")}
						value={cardRadius}
						onChange={(value) => setAttributes({ cardRadius: value })}
						min={0}
						max={60}
					/>
				</PanelBody>

				<PanelBody title={__("Color Settings", "pricing-comparison-block")} initialOpen={false}>
					<BaseControl label={__("Background Color", "pricing-comparison-block")}>
						<ColorPalette
							value={backgroundColor}
							onChange={(value) => setAttributes({ backgroundColor: value })}
						/>
					</BaseControl>
					<BaseControl label={__("Text Color", "pricing-comparison-block")}>
						<ColorPalette
							value={textColor}
							onChange={(value) => setAttributes({ textColor: value })}
						/>
					</BaseControl>
					<BaseControl label={__("Accent Color", "pricing-comparison-block")}>
						<ColorPalette
							value={accentColor}
							onChange={(value) => setAttributes({ accentColor: value })}
						/>
					</BaseControl>
					<BaseControl label={__("Muted Text Color", "pricing-comparison-block")}>
						<ColorPalette
							value={mutedTextColor}
							onChange={(value) => setAttributes({ mutedTextColor: value })}
						/>
					</BaseControl>
					<BaseControl label={__("Border Color", "pricing-comparison-block")}>
						<ColorPalette
							value={borderColor}
							onChange={(value) => setAttributes({ borderColor: value })}
						/>
					</BaseControl>

					<hr />
					<p><strong>{__("Cards", "pricing-comparison-block")}</strong></p>
					<BaseControl label={__("Card Background", "pricing-comparison-block")}>
						<ColorPalette
							value={cardBackground}
							onChange={(value) => setAttributes({ cardBackground: value })}
						/>
					</BaseControl>
					<BaseControl label={__("Highlighted Card Background", "pricing-comparison-block")}>
						<ColorPalette
							value={highlightBackground}
							onChange={(value) => setAttributes({ highlightBackground: value })}
						/>
					</BaseControl>

					<hr />
					<p><strong>{__("Buttons", "pricing-comparison-block")}</strong></p>
					<BaseControl label={__("Button Background", "pricing-comparison-block")}>
						<ColorPalette
							value={buttonBackground}
							onChange={(value) => setAttributes({ buttonBackground: value })}
						/>
					</BaseControl>
					<BaseControl label={__("Button Text Color", "pricing-comparison-block")}>
						<ColorPalette
							value={buttonTextColor}
							onChange={(value) => setAttributes({ buttonTextColor: value })}
						/>
					</BaseControl>
					<BaseControl label={__("Button Outline Color", "pricing-comparison-block")}>
						<ColorPalette
							value={buttonOutlineColor}
							onChange={(value) => setAttributes({ buttonOutlineColor: value })}
						/>
					</BaseControl>

					<hr />
					<p><strong>{__("Table & Sticky", "pricing-comparison-block")}</strong></p>
					<BaseControl label={__("Table Striped Color", "pricing-comparison-block")}>
						<ColorPalette
							value={tableStripedColor}
							onChange={(value) => setAttributes({ tableStripedColor: value })}
						/>
					</BaseControl>
					<BaseControl label={__("Sticky Background", "pricing-comparison-block")}>
						<ColorPalette
							value={stickyBackground}
							onChange={(value) => setAttributes({ stickyBackground: value })}
						/>
					</BaseControl>
					<BaseControl label={__("Sticky Border", "pricing-comparison-block")}>
						<ColorPalette
							value={stickyBorderColor}
							onChange={(value) => setAttributes({ stickyBorderColor: value })}
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody title={__("Sticky Settings", "pricing-comparison-block")} initialOpen={false}>
					<ToggleControl
						label={__("Show Sticky Bar", "pricing-comparison-block")}
						checked={showSticky}
						onChange={(value) => setAttributes({ showSticky: value })}
					/>
					{showSticky && (
						<TextControl
							label={__("Sticky Label", "pricing-comparison-block")}
							value={stickyLabel}
							onChange={(value) => setAttributes({ stickyLabel: value })}
						/>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className={`pc-container ${containerMode === "constrained" ? "is-constrained" : ""}`}>
					<div className="pc-header">
						<RichText
							tagName="p"
							className="pc-subheading"
							value={subheadingText}
							onChange={(value) => setAttributes({ subheadingText: value })}
							placeholder={__("Subheading", "pricing-comparison-block")}
						/>
						<RichText
							tagName="h2"
							className="pc-heading"
							value={headingText}
							onChange={(value) => setAttributes({ headingText: value })}
							placeholder={__("Pricing Heading", "pricing-comparison-block")}
						/>
						{planGroups.length > 1 && (
							<div className="pc-tabs" data-active-tab={activeGroup?.id || ""}>
								{planGroups.map((group, groupIndex) => (
									<QuickZone
										key={group.id}
										id={`pc-tab-${group.id}`}
										label="Audience Tab"
										activeZone={activeZone}
										setActiveZone={setActiveZone}
										content={
											<TextControl
												label={__("Tab Label", "pricing-comparison-block")}
												value={group.label}
												onChange={(label) => {
													const newGroups = [...planGroups];
													newGroups[groupIndex].label = label;
													setAttributes({ planGroups: newGroups });
												}}
											/>
										}
									>
										<button
											className={`pc-tab ${
												group.id === activeTab ? "is-active" : ""
											}`}
											onClick={() => setAttributes({ activeTab: group.id })}
											type="button"
										>
											{group.label}
										</button>
									</QuickZone>
								))}
							</div>
						)}
						{showGuarantee && (
							<RichText
								tagName="p"
								className="pc-guarantee"
								value={guaranteeText}
								onChange={(value) => setAttributes({ guaranteeText: value })}
								placeholder={__("Guarantee Text", "pricing-comparison-block")}
							/>
						)}
					</div>

					<div className="pc-body">
						<div
							className="pc-group is-active"
							style={{ "--pc-plan-columns": activePlans.length }}
						>
							<div className="pc-cards">
								{activePlans.map((plan) => (
									<div
										className={`pc-card ${plan.highlight ? "is-highlight" : ""}`}
										key={plan.id}
									>
										<div className="pc-card__header">
											<RichText
												tagName="span"
												className="pc-card__title"
												value={plan.name}
												onChange={(val) => updatePlan(planGroups.indexOf(activeGroup), plan.id, { name: val })}
											/>
										</div>
										<RichText
											tagName="p"
											className="pc-card__description"
											value={plan.description}
											onChange={(val) => updatePlan(planGroups.indexOf(activeGroup), plan.id, { description: val })}
											placeholder={__("Plan description", "pricing-comparison-block")}
										/>
										<div className="pc-card__pricing-area">
											<div className="pc-card__price">
												<RichText
													tagName="span"
													className="pc-card__amount"
													value={plan.price}
													onChange={(val) => updatePlan(planGroups.indexOf(activeGroup), plan.id, { price: val })}
												/>
												<RichText
													tagName="span"
													className="pc-card__period"
													value={plan.pricePeriod}
													onChange={(val) => updatePlan(planGroups.indexOf(activeGroup), plan.id, { pricePeriod: val })}
												/>
											</div>
											<RichText
												tagName="p"
												className="pc-card__billing"
												value={plan.billingText}
												onChange={(val) => updatePlan(planGroups.indexOf(activeGroup), plan.id, { billingText: val })}
											/>
										</div>
										<div className={`pc-card__button-wrapper ${plan.highlight ? "is-solid" : ""}`}>
											<div className={`pc-card__button ${plan.highlight ? "is-solid" : ""}`}>
												<RichText
													tagName="span"
													value={plan.ctaText}
													onChange={(val) => updatePlan(planGroups.indexOf(activeGroup), plan.id, { ctaText: val })}
												/>
											</div>
										</div>

										{activeGroup?.featureSections?.length > 0 && (
											<div className="pc-card__features-summary">
												{activeGroup.featureSections.map((section) => (
													<div key={section.id} className="pc-feature-section">
														<h5 className="pc-feature-section__title">{section.title}</h5>
														<ul className="pc-feature-list">
															{section.rows.map((row) => {
																const planIndex = activePlans.findIndex(p => p.id === plan.id);
																const feature = row.values[planIndex];
																if (!feature || (feature.type === "text" && !feature.text && !row.label)) return null;

																const showTabIcon = feature.type === "check" || feature.type === "cross";

																return (
																	<li key={row.id} className="pc-feature-list__item">
																		{showTabIcon && (
																			<span className="pc-feature-list__icon">
																				{feature.type === "check" ? (
																					<span className="pc-feature-list__icon--check">
																						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
																							<polyline points="20 6 9 17 4 12"></polyline>
																						</svg>
																					</span>
																				) : (
																					<span className="pc-feature-list__icon--cross">
																						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
																							<line x1="18" y1="6" x2="6" y2="18"></line>
																							<line x1="6" y1="6" x2="18" y2="18"></line>
																						</svg>
																					</span>
																				)}
																			</span>
																		)}
																		<div className="pc-feature-list__content">
																			{feature.text && (
																				<span className="pc-feature-list__value">{feature.text}</span>
																			)}
																			<span className="pc-feature-list__label">{row.label}</span>
																		</div>
																	</li>
																);
															})}
														</ul>
													</div>
												))}
											</div>
										)}
									</div>
								))}
							</div>

							<div className="pc-comparison-toggle-wrapper">
								<button className="pc-comparison-toggle" type="button">
									<span>{__("Compare features", "pricing-comparison-block")}</span>
									<span className="pc-toggle-icon">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="6 9 12 15 18 9"></polyline>
										</svg>
									</span>
								</button>
							</div>

							<div className="pc-comparison is-visible">
								<div className="pc-row pc-row--header">
									<div className="pc-cell pc-cell--label" />
									{activePlans.map((plan) => (
										<div className="pc-cell pc-cell--plan" key={plan.id}>
											{plan.name}
										</div>
									))}
								</div>
								{activeSections.map((section) => (
									<div key={section.id} className="pc-section is-open">
										<div className="pc-section__header">
											<span>{section.title}</span>
											<span className="pc-section__icon">
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
													<polyline points="6 9 12 15 18 9"></polyline>
												</svg>
											</span>
										</div>
										<div className="pc-section__body" style={{ display: "block" }}>
											{section.rows.map((row) => (
												<div className="pc-row" key={row.id}>
													<div className="pc-cell pc-cell--label">{row.label}</div>
													{row.values.map((cell, cellIndex) => (
														<div className="pc-cell" key={cellIndex}>
															{cell.type === "check" && "âœ“"}
															{cell.type === "cross" && "Ã—"}
															{cell.type === "text" && cell.text}
														</div>
													))}
												</div>
											))}
										</div>
									</div>
								))}
							</div>

							{showSticky && (
								<div className="pc-sticky" style={{ "--pc-plan-columns": activePlans.length }}>
									<div className="pc-sticky__label">
										<RichText
											tagName="span"
											value={stickyLabel}
											onChange={(value) => setAttributes({ stickyLabel: value })}
											placeholder={__("Choose your plan", "pricing-comparison-block")}
										/>
									</div>
									{activePlans.map((plan) => (
										<div className="pc-sticky__plan" key={plan.id}>
											<div className="pc-sticky__price">
												{plan.price}
												{plan.pricePeriod}
											</div>
											<div className="pc-sticky__button is-ghost">{plan.ctaText}</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}



