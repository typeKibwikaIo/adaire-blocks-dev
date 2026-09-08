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
		responsiveFontSize,
		responsivePaddingTop,
		responsivePaddingBottom,
		responsivePaddingLeft,
		responsivePaddingRight,
	} = attributes;

	const rFontSize = responsiveFontSize || {};
	const rPaddingTop = responsivePaddingTop || {};
	const rPaddingBottom = responsivePaddingBottom || {};
	const rPaddingLeft = responsivePaddingLeft || {};
	const rPaddingRight = responsivePaddingRight || {};
	const unit = fontSizeUnit || "px";

  const blockProps = useBlockProps.save({
    className: "ad-scroll-text-block",
    style: {
      backgroundColor: backgroundColor ? `rgba(${hexToRgb(backgroundColor)}, ${backgroundColorOpacity !== undefined ? backgroundColorOpacity : 1})` : undefined,
      width: `${containerWidth || 100}${containerWidthUnit || "vw"}`,
      height: `${containerHeight || 100}${containerHeightUnit || "vh"}`,
      "--font-size-desktop": `${rFontSize.desktop ?? fontSize}${unit}`,
      "--font-size-tablet": `${rFontSize.tablet ?? rFontSize.desktop ?? fontSize}${unit}`,
      "--font-size-mobile": `${rFontSize.mobile ?? rFontSize.tablet ?? rFontSize.desktop ?? fontSize}${unit}`,
      "--padding-top-desktop": `${rPaddingTop.desktop ?? paddingTop}px`,
      "--padding-top-tablet": `${rPaddingTop.tablet ?? rPaddingTop.desktop ?? paddingTop}px`,
      "--padding-top-mobile": `${rPaddingTop.mobile ?? rPaddingTop.tablet ?? rPaddingTop.desktop ?? paddingTop}px`,
      "--padding-bottom-desktop": `${rPaddingBottom.desktop ?? paddingBottom}px`,
      "--padding-bottom-tablet": `${rPaddingBottom.tablet ?? rPaddingBottom.desktop ?? paddingBottom}px`,
      "--padding-bottom-mobile": `${rPaddingBottom.mobile ?? rPaddingBottom.tablet ?? rPaddingBottom.desktop ?? paddingBottom}px`,
      "--padding-left-desktop": `${rPaddingLeft.desktop ?? paddingLeft}px`,
      "--padding-left-tablet": `${rPaddingLeft.tablet ?? rPaddingLeft.desktop ?? paddingLeft}px`,
      "--padding-left-mobile": `${rPaddingLeft.mobile ?? rPaddingLeft.tablet ?? rPaddingLeft.desktop ?? paddingLeft}px`,
      "--padding-right-desktop": `${rPaddingRight.desktop ?? paddingRight}px`,
      "--padding-right-tablet": `${rPaddingRight.tablet ?? rPaddingRight.desktop ?? paddingRight}px`,
      "--padding-right-mobile": `${rPaddingRight.mobile ?? rPaddingRight.tablet ?? rPaddingRight.desktop ?? paddingRight}px`,
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
						color: textColor || undefined,
					}}
				/>
			</div>
		</section>
	);
}



