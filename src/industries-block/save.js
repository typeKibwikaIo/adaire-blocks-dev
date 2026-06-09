import { useBlockProps, RichText } from "@wordpress/block-editor";

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
	const value = dimension?.value ?? fallbackValue;
	const unit = dimension?.unit ?? fallbackUnit;
	return `${value}${unit}`;
};

const IndustriesSave = ({ attributes }) => {
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

	const blockProps = useBlockProps.save({
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

	const safeIndustries = Array.isArray(industries) ? industries : [];

	// Helper function to render an industry item with optional link
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
					<RichText.Content tagName="p" value={item.label} />
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
		<div {...blockProps}>
			<div
				className={`adaire-industries__container ${
					containerMode === "constrained" ? "is-constrained" : ""
				}`}
			>
				<div className="adaire-industries__first">
					<div className="adaire-industries__copy">
						{headerLines?.map((line, index) => (
							<RichText.Content
								key={line.id || index}
								tagName="h2"
								className={`adaire-industries__copy-heading${
									showTitle === false
										? " adaire-industries__copy-heading--hidden"
										: ""
								}`}
								value={line.text}
							/>
						))}
						<RichText.Content
							tagName="p"
							className={`adaire-industries__copy-intro${
								showIntroText === false
									? " adaire-industries__copy-intro--hidden"
									: ""
							}`}
							value={descriptionText}
						/>
					</div>

					{/* Mobile Grid - All industries, visible on mobile/tablet */}
					<div className="adaire-industries__mobile-grid">
						{(hideFirstTwoIndustries
							? safeIndustries.slice(2)
							: safeIndustries
						).map((item, index) => {
							const actualIndex = hideFirstTwoIndustries ? index + 2 : index;
							return renderIndustryItem(item, actualIndex);
						})}
					</div>

					{/* Desktop First Squares - Same industries as mobile, visible on desktop */}
					{!hideFirstTwoIndustries && (
						<div className="adaire-industries__first-squares adaire-industries__first-squares--desktop">
							{safeIndustries[1] &&
								renderIndustryItem(
									safeIndustries[1],
									1,
									"adaire-industries__industry--large",
								)}
							{safeIndustries[0] &&
								renderIndustryItem(
									safeIndustries[0],
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
							<RichText.Content tagName="p" value={descriptionText} />
						</div>
						<div
							className={`adaire-industries__visual${
								showImage === false ? " adaire-industries__visual--hidden" : ""
							}`}
							aria-hidden={featureImage?.url ? undefined : "true"}
						>
							{featureImage?.url ? (
								<img
									className="adaire-industries__img"
									src={featureImage.url}
									alt={featureImage.alt || ""}
								/>
							) : (
								<div className="adaire-industries__image-placeholder">
									<span />
								</div>
							)}
						</div>
					</div>

					{/* Desktop Second Grid - Industries from index 2 onwards (or from index 0 if first two are hidden), visible on desktop */}
					{(() => {
						const displayIndustries = hideFirstTwoIndustries
							? safeIndustries
							: safeIndustries.length > 2
							? safeIndustries.slice(2)
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
										if (index % 2 === 0) {
											firstColumn.push(item);
										} else {
											secondColumn.push(item);
										}
									});

									return (
										<>
											<div className="adaire-industries__column">
												{firstColumn.map((item, colIndex) => {
													const originalIndex = startIndex + colIndex * 2;
													return renderIndustryItem(item, originalIndex);
												})}
											</div>
											{secondColumn.length > 0 && (
												<div className="adaire-industries__column adaire-industries__column--spaced">
													{secondColumn.map((item, colIndex) => {
														const originalIndex = startIndex + colIndex * 2 + 1;
														return renderIndustryItem(item, originalIndex);
													})}
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
	);
};

export default IndustriesSave;



