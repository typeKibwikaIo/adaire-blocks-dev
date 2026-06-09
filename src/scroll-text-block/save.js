import { useBlockProps, RichText } from "@wordpress/block-editor";

// Helper function to convert hex to RGB
function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? 
		`${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
		'255, 255, 255';
}

export default function save({ attributes }) {
	const {
		heroText,
		backgroundColor,
		backgroundColorOpacity,
		containerWidth,
		containerWidthUnit,
		containerHeight,
		containerHeightUnit,
		pinHeight,
		pinHeightUnit,
		fontSize,
		fontWeight,
		textColor,
		fontSizeUnit,
		animationSpeed,
		scrollDirection,
		blockId,
		marginTop,
		marginBottom,
		marginLeft,
		marginRight,
		paddingTop,
		paddingBottom,
		paddingLeft,
		paddingRight,
	} = attributes;

  const blockProps = useBlockProps.save({
    className: "ad-scroll-text-block",
    style: {
      backgroundColor: backgroundColor ? `rgba(${hexToRgb(backgroundColor)}, ${backgroundColorOpacity !== undefined ? backgroundColorOpacity : 1})` : undefined,
      width: `${containerWidth || 100}${containerWidthUnit || "vw"}`,
      height: `${containerHeight || 100}${containerHeightUnit || "vh"}`,
      "--padding-top": `${paddingTop}px`,
      "--padding-bottom": `${paddingBottom}px`,
      "--padding-left": `${paddingLeft}px`,
      "--padding-right": `${paddingRight}px`,
      "--margin-top": `${marginTop}px`,
      "--margin-bottom": `${marginBottom}px`,
      "--margin-left": `${marginLeft}px`,
      "--margin-right": `${marginRight}px`,
      "--font-weight": fontWeight || "400"
    },
    id: blockId || undefined
  });

	return (
		<section
			{...blockProps}
			data-animation-speed={animationSpeed}
			data-scroll-direction={scrollDirection}
			data-pin-height={pinHeight}
			data-pin-height-unit={pinHeightUnit}
		>
			<div
				className="ad-scroll-text-block__content"
				style={{ overflow: "hidden" }}
			>
				<RichText.Content
					tagName="h1"
					value={heroText}
					style={{
						whiteSpace: "nowrap",
						fontSize: fontSize + (fontSizeUnit || "px"),
						color: textColor || undefined,
					}}
				/>
			</div>
		</section>
	);
}



