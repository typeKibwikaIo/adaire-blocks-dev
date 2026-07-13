import { useBlockProps, RichText } from "@wordpress/block-editor";

const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function save({ attributes }) {
	const {
		layout,
		columns,
		showHeading,
		heading,
		subheading,
		headingAlign,
		items,
		showValue,
		fillColor,
		useGradient,
		fillColorEnd,
		trackColor,
		labelColor,
		valueColor,
		barHeight,
		barRadius,
		ringSize,
		ringStrokeWidth,
		ringTrackColor,
		ringTextColor,
		ringLabelColor,
		headingColor,
		subheadingColor,
		backgroundColor,
		animationDuration,
		paddingTop,
		paddingBottom,
	} = attributes;

	const blockProps = useBlockProps.save({
		className: `adaire-progress-bar is-layout-${layout}`,
		style: {
			"--pb-fill-color": fillColor,
			"--pb-fill-color-end": useGradient ? fillColorEnd : fillColor,
			"--pb-track-color": trackColor,
			"--pb-label-color": labelColor,
			"--pb-value-color": valueColor,
			"--pb-bar-height": `${barHeight}px`,
			"--pb-bar-radius": `${barRadius}px`,
			"--pb-ring-size": `${ringSize}px`,
			"--pb-ring-stroke-width": `${ringStrokeWidth}px`,
			"--pb-ring-track-color": ringTrackColor,
			"--pb-ring-text-color": ringTextColor,
			"--pb-ring-label-color": ringLabelColor,
			"--pb-heading-color": headingColor,
			"--pb-subheading-color": subheadingColor,
			"--pb-columns": columns,
			backgroundColor: backgroundColor || undefined,
			paddingTop: `${paddingTop}px`,
			paddingBottom: `${paddingBottom}px`,
		},
		"data-animation-duration": animationDuration,
	});

	return (
		<div {...blockProps}>
			{showHeading && (
				<div className={`adaire-progress-bar__header is-align-${headingAlign}`}>
					<RichText.Content
						tagName="h3"
						className="adaire-progress-bar__heading"
						value={heading}
					/>
					<RichText.Content
						tagName="p"
						className="adaire-progress-bar__subheading"
						value={subheading}
					/>
				</div>
			)}

			{layout === "bar" && (
				<div className="adaire-progress-bar__list">
					{items.map((item, index) => (
						<div className="adaire-progress-bar__item" key={index}>
							<div className="adaire-progress-bar__row">
								<span className="adaire-progress-bar__label">{item.label}</span>
								{showValue && (
									<span className="adaire-progress-bar__value">{item.value}%</span>
								)}
							</div>
							<div className="adaire-progress-bar__track">
								<div
									className="adaire-progress-bar__fill"
									data-value={item.value}
									style={{
										width: "0%",
										background: item.color || undefined,
										transitionDuration: `${animationDuration}ms`,
									}}
								/>
							</div>
						</div>
					))}
				</div>
			)}

			{layout === "circle" && (
				<div className="adaire-progress-bar__grid">
					{items.map((item, index) => (
						<div className="adaire-progress-bar__ring-item" key={index}>
							<div className="adaire-progress-bar__ring">
								<svg viewBox="0 0 100 100" className="adaire-progress-bar__ring-svg">
									<circle
										className="adaire-progress-bar__ring-track"
										cx="50"
										cy="50"
										r={RING_RADIUS}
									/>
									<circle
										className="adaire-progress-bar__ring-fill"
										cx="50"
										cy="50"
										r={RING_RADIUS}
										data-value={item.value}
										style={{
											stroke: item.color || undefined,
											strokeDasharray: RING_CIRCUMFERENCE,
											strokeDashoffset: RING_CIRCUMFERENCE,
											transitionDuration: `${animationDuration}ms`,
										}}
									/>
								</svg>
								{showValue && (
									<div className="adaire-progress-bar__ring-text" data-value={item.value}>
										0%
									</div>
								)}
							</div>
							<div className="adaire-progress-bar__ring-label">{item.label}</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
