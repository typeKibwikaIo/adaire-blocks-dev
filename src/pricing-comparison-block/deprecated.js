/**
 * Pricing Comparison (pricing-comparison-block) deprecations — most recent first.
 *
 * v1  Frozen copy of the save() that shipped before ADAB-010 added full
 *     typography controls (font size, font weight, line-height, letter-
 *     spacing, text-transform for every text role, plus a block-level
 *     Font Family control) — unconditionally, for every instance, regardless
 *     of whether the user ever opens the new "Typography" panel. Posts saved
 *     before that change don't have those custom properties in their stored
 *     markup, so re-running the *current* save() against them would produce
 *     a style attribute with extra declarations that don't match what's
 *     stored, and Gutenberg would flag them as invalid content. No attribute
 *     schema changed shape (the new attributes are purely additive with safe
 *     defaults that reproduce the original hardcoded SCSS values), so
 *     `migrate` is a no-op identity function and this entry doesn't need its
 *     own `attributes` key (Gutenberg falls back to the current block.json
 *     attributes when parsing a deprecated entry that omits one).
 */
import { useBlockProps, RichText } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";

const createCell = (type = "dash", text = "") => ({ type, text });

const normalizeRowValues = (values = [], planCount) => {
	const normalized = [...values];
	while (normalized.length < planCount) {
		normalized.push(createCell());
	}
	return normalized.slice(0, planCount);
};

const renderCell = (cell) => {
	if (cell.type === "check") {
		return (
			<span className="pc-cell-icon pc-cell-icon--check">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
			</span>
		);
	}
	if (cell.type === "cross") {
		return (
			<span className="pc-cell-icon pc-cell-icon--cross">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</span>
		);
	}
	if (cell.type === "text") {
		return <span className="pc-cell-text">{cell.text}</span>;
	}
	return <span className="pc-cell-text">—</span>;
};

const renderFeatureEntry = (cell, label, key) => {
	if (cell.type === "dash") {
		return null;
	}

	const hasIcon = cell.type === "check" || cell.type === "cross";

	return (
		<li className="pc-feature-list__item" key={key}>
			{hasIcon && (
				<span
					className={`pc-feature-list__icon pc-feature-list__icon--${cell.type}`}
					aria-hidden="true"
				>
					{cell.type === "check" ? (
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					) : (
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					)}
				</span>
			)}
			<span className="pc-feature-list__content">
				{cell.text && (
					<span className="pc-feature-list__value">{cell.text}</span>
				)}
				<span className="pc-feature-list__label">{label}</span>
			</span>
		</li>
	);
};

const deprecatedV1 = {
	migrate( attributes ) {
		return attributes;
	},

	save({ attributes }) {
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
		} = attributes;

		const activeGroup =
			planGroups.find((group) => group.id === activeGroupId) || planGroups[0];

		const blockProps = useBlockProps.save({
			className: `adaire-pricing-compare adaire-pricing-compare--layout-${displayMode}`,
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
				"--pc-container-max-width-tablet": `${
					containerMaxWidth?.tablet?.value ?? 100
				}${containerMaxWidth?.tablet?.unit ?? "%"}`,
				"--pc-container-max-width-mobile": `${
					containerMaxWidth?.mobile?.value ?? 100
				}${containerMaxWidth?.mobile?.unit ?? "%"}`,
			},
			"data-block-id": blockId,
		});

		return (
			<div {...blockProps}>
				<div
					className={`pc-container ${
						containerMode === "constrained" ? "is-constrained" : ""
					}`}
				>
					<div className="pc-header">
						<RichText.Content
							tagName="p"
							className="pc-subheading"
							value={subheadingText}
						/>
						<RichText.Content
							tagName="h2"
							className="pc-heading"
							value={headingText}
						/>
						{linkText && (
							<a className="pc-link" href={linkUrl || "#"}>
								{linkText}
							</a>
						)}
						{planGroups.length > 1 && (
							<div className="pc-tabs" data-active-tab={activeGroup?.id || ""}>
								{planGroups.map((group) => (
									<button
										className={`pc-tab ${
											group.id === activeGroupId ? "is-active" : ""
										}`}
										type="button"
										data-tab={group.id}
										key={group.id}
									>
										{group.label}
									</button>
								))}
							</div>
						)}
						{showGuarantee && (
							<p className="pc-guarantee">{guaranteeText}</p>
						)}
					</div>

					{planGroups.map((group) => {
						const plans = group.plans || [];
						const isActive = group.id === (activeGroupId || activeGroup?.id);
						return (
							<div
								className={`pc-group ${isActive ? "is-active" : ""}`}
								data-group-id={group.id}
								key={group.id}
								style={{ "--pc-plan-columns": plans.length }}
							>
								<div className="pc-cards">
									{plans.map((plan) => (
										<div
											className={`pc-card ${plan.highlight ? "is-highlight" : ""}`}
											key={plan.id}
										>
											<div className="pc-card__header">
												<span className="pc-card__title">{plan.name}</span>
												{plan.badgeText && (
													<span className="pc-card__badge">{plan.badgeText}</span>
												)}
											</div>
											<p className="pc-card__description">{plan.description}</p>
											<div className="pc-card__pricing-area">
												<div className="pc-card__price">
													<RichText.Content
														tagName="span"
														className="pc-card__amount"
														value={plan.price}
													/>
													<RichText.Content
														tagName="span"
														className="pc-card__period"
														value={plan.pricePeriod}
													/>
												</div>
												{plan.oldPrice && (
													<div className="pc-card__savings">
														<RichText.Content
															tagName="span"
															className="pc-card__old"
															value={plan.oldPrice}
														/>
														{plan.savingsText && (
															<RichText.Content
																tagName="span"
																className="pc-card__save"
																value={plan.savingsText}
															/>
														)}
													</div>
												)}
												<RichText.Content
													tagName="p"
													className="pc-card__billing"
													value={plan.billingText}
												/>
											</div>
											<div className={`pc-card__button-wrapper ${plan.highlight ? "is-solid" : ""}`}>
												<a className={`pc-card__button ${plan.highlight ? "is-solid" : ""}`} href={plan.ctaUrl}>
													<RichText.Content
														tagName="span"
														value={plan.ctaText}
													/>
												</a>
											</div>
											<ul className="pc-card__meta">
												{(plan.metaItems || []).map((item, metaIndex) => (
													<li key={metaIndex}>{item}</li>
												))}
											</ul>
											{displayMode === "cards" && (
												<div className="pc-card__details">
													{(group.featureSections || []).map((section) => {
														const featureItems = section.rows
															.map((row, rowIndex) =>
																renderFeatureEntry(
																	normalizeRowValues(row.values, plans.length)[
																		plans.findIndex((currentPlan) => currentPlan.id === plan.id)
																	] || createCell(),
																	row.label,
																	`${section.id}-${row.id}-${rowIndex}`
																)
															)
															.filter(Boolean);

														if (!featureItems.length) {
															return null;
														}

														return (
															<div className="pc-feature-section" key={section.id}>
																<h3 className="pc-feature-section__title">
																	{section.title}
																</h3>
																<ul className="pc-feature-list">{featureItems}</ul>
															</div>
														);
													})}
												</div>
											)}
										</div>
									))}
								</div>

								<div className="pc-comparison-toggle-wrapper">
									<button className="pc-comparison-toggle" type="button">
										<span>{__("Compare features", "adaire-blocks")}</span>
										<span className="pc-toggle-icon">+</span>
									</button>
								</div>

								<div className="pc-comparison is-hidden">
									<div className="pc-row pc-row--header">
										<div className="pc-cell pc-cell--label" />
										{plans.map((plan) => (
											<div className="pc-cell pc-cell--plan" key={plan.id}>
												{plan.name}
											</div>
										))}
									</div>
									{(group.featureSections || []).map((section) => (
										<div
											key={section.id}
											className={`pc-section ${
												section.open ? "is-open" : ""
											}`}
										>
											<button
												type="button"
												className="pc-section__header"
												data-section-toggle
											>
												<span>{section.title}</span>
												<span className="pc-section__icon">
													<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
														<polyline points="6 9 12 15 18 9"></polyline>
													</svg>
												</span>
											</button>
											<div className="pc-section__body">
												{section.rows.map((row) => (
													<div className="pc-row" key={row.id}>
														<div className="pc-cell pc-cell--label">
															{row.label}
														</div>
														{normalizeRowValues(row.values, plans.length).map(
															(cell, cellIndex) => (
																<div className="pc-cell" key={cellIndex}>
																	{renderCell(cell)}
																</div>
															)
														)}
													</div>
												))}
											</div>
										</div>
									))}
								</div>

								{showSticky && (
									<div className="pc-sticky" style={{ "--pc-plan-columns": plans.length }}>
										<div className="pc-sticky__label">{stickyLabel}</div>
										{plans.map((plan) => (
											<div className="pc-sticky__plan" key={plan.id}>
												<div className="pc-sticky__price">
													{plan.price}
													{plan.pricePeriod}
												</div>
												<a className="pc-sticky__button is-ghost" href={plan.ctaUrl}>
													{plan.ctaText}
												</a>
											</div>
										))}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		);
	},
};

export default [ deprecatedV1 ];
