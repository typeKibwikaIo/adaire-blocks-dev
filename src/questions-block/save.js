import { useBlockProps, RichText } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const {
		question1Title,
		question1Content,
		question2Title,
		question2Content,
		question3Title,
		question3Content,
		backgroundColor,
		textColor,
		titleColor,
		inactiveTitleColor,
		blockId,
		showProgressIndicator = true,
		progressIndicatorColor = "#ffffff",
		progressIndicatorActiveColor = "#ff0000",
		progressIndicatorFillColor = "#ff0000",
		progressIndicatorWidth = 3,
		scrollDistance = 250,
		scrollDistanceMobile = 170,
	} = attributes;

	return (
		<section
			{...useBlockProps.save({
				style: {
					backgroundColor: backgroundColor || "#25232c",
					"--title-color": titleColor || "#ffffff",
					"--inactive-title-color": inactiveTitleColor || "#666666",
					"--progress-indicator-color": progressIndicatorColor,
					"--progress-indicator-active-color": progressIndicatorActiveColor,
					"--progress-indicator-fill-color": progressIndicatorFillColor,
					"--progress-indicator-width": `${progressIndicatorWidth}px`,
					"--scroll-distance": `${scrollDistance}%`,
					"--scroll-distance-mobile": `${scrollDistanceMobile}%`,
				},
				id: blockId || undefined,
				"data-scroll-distance": scrollDistance,
				"data-scroll-distance-mobile": scrollDistanceMobile,
				"data-show-progress": showProgressIndicator,
			})}
			className="animated-section"
		>
			<div className="section-container">
				<div style={{display: "flex", flexDirection: "row"}}>
					{/* Progress Indicator */}
					{showProgressIndicator && (
						<div className="progress-indicator">
							<div className="progress-line">
								<div className="progress-fill"></div>
							</div>
						</div>
					)}

					{/* Left side - Titles */}
					<div className="titles-column">
						<div className="title-item">
							<span className="section-number">01</span>
							<RichText.Content tagName="h2" value={question1Title} />
						</div>
						<div className="title-item">
							<span className="section-number">02</span>
							<RichText.Content tagName="h2" value={question2Title} />
						</div>
						<div className="title-item">
							<span className="section-number">03</span>
							<RichText.Content tagName="h2" value={question3Title} />
						</div>
					</div>
				</div>

				{/* Right side - Content */}
				<div className="content-column">
					<div className="content-item" data-section="what">
						<RichText.Content
							tagName="div"
							value={question1Content}
							style={{ color: textColor || undefined }}
						/>
					</div>
					<div className="content-item" data-section="why">
						<RichText.Content
							tagName="div"
							value={question2Content}
							style={{ color: textColor || undefined }}
						/>
					</div>
					<div className="content-item" data-section="who">
						<RichText.Content
							tagName="div"
							value={question3Content}
							style={{ color: textColor || undefined }}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}



