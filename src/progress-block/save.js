import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const {
		blockId,
		variant,
		barLength,
		barWidth,
		fillColor,
		trackColor,
		borderRadius,
		ringSize,
		ringStrokeWidth,
		ringFillColor,
		ringTrackColor,
		ringTextColor,
		ringFontSize,
		verticalPosition,
		verticalOffset,
		horizontalPosition,
		horizontalOffset,
		zIndex,
	} = attributes;

	const blockProps = useBlockProps.save({
		id: blockId || undefined,
		className: `adaire-progress-block adaire-progress-block--${variant}`,
		style: {
			"--progress-fill-color": fillColor,
			"--progress-track-color": trackColor,
			"--progress-bar-length": `${barLength}px`,
			"--progress-bar-width": `${barWidth}vw`,
			"--progress-border-radius": `${borderRadius}px`,
			"--progress-ring-size": `${ringSize}px`,
			"--progress-ring-stroke-width": `${ringStrokeWidth}px`,
			"--progress-ring-fill-color": ringFillColor,
			"--progress-ring-track-color": ringTrackColor,
			"--progress-ring-text-color": ringTextColor,
			"--progress-ring-font-size": `${ringFontSize}px`,
			position: "fixed",
			top: verticalPosition === "top" && verticalOffset > 0 ? `${verticalOffset}%` : "auto",
			bottom: verticalPosition === "bottom" && verticalOffset > 0 ? `${verticalOffset}%` : "auto",
			left: horizontalPosition === "left" && horizontalOffset > 0 ? `${horizontalOffset}%` : "auto",
			right: horizontalPosition === "right" && horizontalOffset > 0 ? `${horizontalOffset}%` : "auto",
			zIndex: zIndex,
		},
	});

	return (
		<div {...blockProps}>
			{variant === "bar" && (
				<div className="adaire-progress-block__bar">
					<div className="adaire-progress-block__track">
						<div className="adaire-progress-block__fill"></div>
					</div>
				</div>
			)}
			{variant === "ring" && (
				<div className="adaire-progress-block__ring">
					<svg className="adaire-progress-block__ring-svg" viewBox="0 0 100 100">
						<circle
							className="adaire-progress-block__ring-track"
							cx="50"
							cy="50"
							r="45"
						/>
						<circle
							className="adaire-progress-block__ring-fill"
							cx="50"
							cy="50"
							r="45"
						/>
					</svg>
					<div className="adaire-progress-block__ring-text">0%</div>
				</div>
			)}
		</div>
	);
}




