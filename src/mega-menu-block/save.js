import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

export default function Save({ attributes }) {
	const {
		blockId,
		logoUrl,
		logoAlt,
		logoSize,
		menuItems,
		backgroundColor,
		textColor,
		hoverColor,
		activeColor,
		level1HoverColor,
		level1ShowHoverUnderline,
		level1UnderlineWidth,
		level1UnderlineColor,
		level1UnderlineBorderRadius,
		level1HoverBgColor,
		level1HoverPadding,
		level2HoverColor,
		level2ShowHoverUnderline,
		level2HoverBgColor,
		level2HoverPadding,
		level3HoverColor,
		level3ShowHoverUnderline,
		level3HoverBgColor,
		level3HoverPadding,
		level1FontSize,
		level1FontWeight,
		level1FontColor,
		level1HoverBorderRadius,
		level2FontSize,
		level2FontWeight,
		level2FontColor,
		level3FontSize,
		level3FontWeight,
		level3FontColor,
		canvasFontSize,
		canvasFontWeight,
		canvasFontColor,
		canvasImageBorderRadius,
		menuCanvasBorderRadius,
		menuBorderRadius,
		showCanvasTitle,
		fontSize,
		fontWeight,
		boldWeight,
		fontFamily,
		underlineColor,
		isSticky,
		containerMode,
		containerMaxWidth,
		padding,
		margin,
		keepCanvasOpenOnClick,
		increaseOpacity,
		scrollBackgroundColor,
		menuItemsColorTop,
		menuItemsColorScroll,
		menuImageAtTop,
		menuImageAtTopAlt,
		menuImageOnScroll,
		menuImageOnScrollAlt,
		menuImageSize,
		centerMenu,
		mobileMenuBgColor,
		mobileLevel1FontSize,
		mobileLevel1FontWeight,
		mobileLevel1FontColor,
		mobileLevel2FontSize,
		mobileLevel2FontWeight,
		mobileLevel2FontColor,
		mobileLevel3FontSize,
		mobileLevel3FontWeight,
		mobileLevel3FontColor,
		mobileMenuItemBgColor,
		mobileMenuItemHoverBgColor,
		mobileChevronSize,
		mobileChevronColor,
	} = attributes;

	const getLevelColors = (level) => {
		switch (level) {
			case 0:
				return {
					hoverColor: level1HoverColor,
					showHoverUnderline: level1ShowHoverUnderline,
					underlineWidth: level1UnderlineWidth,
					underlineColor: level1UnderlineColor,
					underlineBorderRadius: level1UnderlineBorderRadius,
					fontSize: level1FontSize,
					fontWeight: level1FontWeight,
					fontColor: level1FontColor,
				};
			case 1:
			return {
				hoverColor: level2HoverColor,
				showHoverUnderline: level2ShowHoverUnderline,
				fontSize: level2FontSize,
				fontWeight: level2FontWeight,
				fontColor: level2FontColor,
			};
			case 2:
			return {
				hoverColor: level3HoverColor,
				showHoverUnderline: level3ShowHoverUnderline,
				fontSize: level3FontSize,
				fontWeight: level3FontWeight,
				fontColor: level3FontColor,
			};
			default:
				return {
					hoverColor: level1HoverColor,
					showHoverUnderline: level1ShowHoverUnderline,
					underlineWidth: level1UnderlineWidth,
					underlineColor: level1UnderlineColor,
					underlineBorderRadius: level1UnderlineBorderRadius,
					fontSize: level1FontSize,
					fontWeight: level1FontWeight,
					fontColor: level1FontColor,
				};
		}
	};

	// For dynamic blocks with inner blocks, we only save the inner blocks content
	// The full block structure is rendered by PHP render callback
	return <InnerBlocks.Content />;
}



