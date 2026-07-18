import { __, sprintf } from "@wordpress/i18n";
import { useCallback, useState } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	ColorPalette,
	ColorPicker,
	Button,
	ButtonGroup,
	TextControl,
	TextareaControl,
	SelectControl,
	ToggleControl,
	BaseControl,
	__experimentalBoxControl as BoxControl,
} from "@wordpress/components";
import {
	desktop,
	tablet,
	mobile,
	plus,
	trash,
	arrowUp,
	arrowDown,
} from "@wordpress/icons";
import UpgradeNotice from "../components/UpgradeNotice";
import { useBlockLimits } from "../components/useBlockLimits";
import "./editor.scss";

const hexToRgba = (hex, alpha = 1) => {
	if (!hex) {
		return `rgba(0, 0, 0, ${alpha})`;
	}

	let sanitized = hex.replace("#", "");
	if (sanitized.length === 3) {
		sanitized = sanitized
			.split("")
			.map((char) => char + char)
			.join("");
	}

	const int = parseInt(sanitized, 16);
	if (Number.isNaN(int)) {
		return `rgba(0, 0, 0, ${alpha})`;
	}

	const r = (int >> 16) & 255;
	const g = (int >> 8) & 255;
	const b = int & 255;

	return `rgba(${r}, ${g}, ${b}, ${Math.min(Math.max(alpha, 0), 1)})`;
};

const navigationSourceOptions = [
	{ label: __("Custom (manual)", "adaire-blocks"), value: "legacy" },
	{ label: __("Primary Menu", "adaire-blocks"), value: "primary" },
	{ label: __("Footer Menu", "adaire-blocks"), value: "footer" },
	{ label: __("Select existing menu", "adaire-blocks"), value: "menu" },
];

// Same two plugin-owned locations header-block and website-footer-block
// already resolve against (see adaire_mega_menu_register_nav_menu_locations()
// in adaire-blocks.php) — a menu already assigned there for the header can
// power the mega menu too, with nothing new to configure.
const NAV_MENU_LOCATION_SLUGS = {
	primary: "adaire-blocks-primary",
	footer: "adaire-blocks-footer",
};

/**
 * Resolves just the connected menu's name (not its items — the live
 * frontend renders the real content via the PHP render callback; the
 * editor only needs enough to show a "connected to X" status line here)
 * for the Navigation Source status text below.
 */
function useResolvedMenuName(navigationSource, selectedMenuId) {
	const isDynamic = !!navigationSource && navigationSource !== "legacy";

	const menus = useSelect(
		(select) => {
			if (!isDynamic) {
				return null;
			}
			const coreStore = select("core");
			return coreStore && coreStore.getMenus
				? coreStore.getMenus({ per_page: -1, context: "view" })
				: null;
		},
		[isDynamic],
	);

	if (!isDynamic) {
		return { isLoading: false, menuName: null, hasMenu: false, menus: null };
	}
	if (menus === null) {
		return { isLoading: true, menuName: null, hasMenu: false, menus: null };
	}

	let resolved = null;
	if (navigationSource === "menu") {
		resolved = (menus || []).find((m) => m.id === selectedMenuId) || null;
	} else {
		const slug = NAV_MENU_LOCATION_SLUGS[navigationSource];
		resolved =
			(menus || []).find(
				(m) => Array.isArray(m.locations) && m.locations.includes(slug),
			) || null;
	}

	return {
		isLoading: false,
		menuName: resolved ? resolved.name : null,
		hasMenu: !!resolved,
		menus,
	};
}

export default function Edit({ attributes, setAttributes, clientId }) {
	const [deviceType, setDeviceType] = useState("desktop");
	const [openDropdowns, setOpenDropdowns] = useState(new Set());

	// Check block limits
	const { isLimitReached, showUpgradeNotice, upgradeMessage } = useBlockLimits(
		"mega-menu-block",
		attributes.menuItems || [],
		"menu item",
	);

	const resolvedMenuStatus = useResolvedMenuName(
		attributes.navigationSource,
		attributes.selectedMenuId,
	);
	const isUsingWpMenu =
		!!attributes.navigationSource && attributes.navigationSource !== "legacy";

	const {
		blockId,
		navigationSource,
		selectedMenuId,
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
		level2HoverTextColorEnabled,
		level2ShowHoverUnderline,
		level2HoverBgColor,
		level2HoverPadding,
		level2HeaderSpacing,
		level3HoverColor,
		level3ShowHoverUnderline,
		level3HoverBgColor,
		level3HoverPadding,
		level3UnderlineWidth,
		level3UnderlineColor,
		level3ItemSpacing,
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
		menuItemsUnderlineColorTop,
		menuItemsUnderlineColorScroll,
		menuImageAtTop,
		menuImageAtTopAlt,
		menuImageOnScroll,
		menuImageOnScrollAlt,
		logoLinkUrl,
		menuImageSize,
		centerMenu,
		ribbonEnabled,
		ribbonText,
		ribbonBackgroundColor,
		ribbonTextColor,
		ribbonFontSize,
		ribbonFontWeight,
		ribbonLinkLabel,
		ribbonLinkUrl,
		ribbonLinkColor,
		ribbonLinkFontWeight,
		ribbonLinkOpenInNewTab,
		ribbonLinkUnderline,
		ribbonLinkUnderlineColor,
		ribbonLinkUnderlineWidth,
		ribbonHeight,
		ribbonPaddingTop,
		ribbonPaddingBottom,
		ribbonLinkArrowEnabled = false,
		ribbonLinkArrowColor = "",
		ribbonLinkArrowSize = 16,
		ribbonLinkArrowRotation = 0,
		ctaButtonEnabled,
		ctaButtonText,
		ctaButtonLink,
		ctaButtonOpenInNewTab,
		ctaButtonShowIcon,
		ctaButtonStyle,
		ctaButtonHoverAnimation,
		ctaButtonFontSize,
		ctaButtonFontWeight,
		ctaButtonColor,
		ctaButtonBackgroundColor,
		ctaButtonHoverColor,
		ctaButtonHoverBackgroundColor,
		ctaButtonUnderlineColor,
		ctaButtonBlurAmount,
		ctaButtonBorderRadius,
		ctaButtonBorderWidth,
		ctaButtonBorderColor,
		ctaButtonHoverBorderColor,
		ctaButtonBorderStyle,
		ctaButtonPadding,
	ctaButtonMargin,
	ctaButtonColorScroll,
	ctaButtonBackgroundColorScroll,
	ctaButtonBorderColorScroll,
	ctaButtonHoverColorScroll,
	ctaButtonHoverBackgroundColorScroll,
	ctaButtonHoverBorderColorScroll,
	ctaMobileUseSeparateStyles,
	ctaMobileButtonColor,
	ctaMobileButtonBackgroundColor,
	ctaMobileButtonBorderColor,
	ctaMobileButtonHoverColor,
	ctaMobileButtonHoverBackgroundColor,
	ctaMobileButtonHoverBorderColor,
	ctaMobileButtonBorderRadius,
	ctaMobileButtonBorderWidth,
	ctaMobileButtonPadding,
	ctaMobileButtonFontSize,
	ctaMobileButtonFontWeight,
	ctaMobileButtonShowIcon,
	ctaMobileButtonStyle,
	ctaMobileButtonHoverAnimation,
	menuPanelGap,
	menuPanelPaddingBottom,
	canvasBannerBackgroundColor,
	canvasBannerWidth,
	canvasBannerPaddingTop,
	canvasBannerPaddingBottom,
	canvasBannerPaddingLeft,
	canvasBannerPaddingRight,
	canvasBannerTitleFontSize,
	canvasBannerTitleColor,
	canvasBannerTitleFontWeight,
	canvasBannerDescriptionFontSize,
	canvasBannerDescriptionColor,
	canvasBannerDescriptionFontWeight,
		canvasListPaddingLeft,
		canvasListPaddingRight,
		canvasStoryTitleFontSize,
		canvasStoryTitleFontWeight,
		canvasStoryTitleColor,
		canvasStoryTitleMarginTop,
		canvasStoryTitleMarginBottom,
		canvasStoryDescriptionFontSize,
		canvasStoryDescriptionFontWeight,
		canvasStoryDescriptionColor,
		canvasStoryDescriptionMarginTop,
		canvasStoryDescriptionMarginBottom,
		canvasStoryLinkFontSize,
		canvasStoryLinkFontWeight,
		canvasStoryLinkColor,
		canvasStoryLinkMarginTop,
		canvasStoryLinkMarginBottom,
		canvasStoryLinkHoverColor,
		canvasStoryLinkUnderlineColor,
		canvasStoryLinkUnderlineHeight,
		canvasStoryLinkUnderlineBorderRadius,
		canvasStoryDividerEnabled,
		canvasStoryDividerWidth,
		canvasStoryDividerHeight,
		canvasStoryDividerColor,
		canvasStoryDividerAlpha,
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
		mobileMenuIconColor,
		mobileMenuIconColorScroll,
		menuDropdownOffset,
		mobileImmersiveMode,
		mobileImmersiveBgType,
		mobileImmersiveBgColor,
		mobileImmersiveGradientType,
		mobileImmersiveGradientAngle,
		mobileImmersiveGradientColor1,
		mobileImmersiveGradientColor2,
		mobileImmersiveGradientStartStop,
		mobileImmersiveGradientEndStop,
		mobileImmersiveBgImage,
		mobileImmersiveBgImageSize,
		mobileImmersiveBgImagePosition,
		mobileImmersiveOverlayColor,
		mobileImmersiveOverlayOpacity,
		mobileImmersiveIconSize,
		mobileImmersiveIconColor,
		mobileImmersiveButtonRowPadding,
	} = attributes;

	if (!blockId) {
		setAttributes({ blockId: clientId });
	}

const pickValue = (...values) =>
	values.find(
		(value) => value !== undefined && value !== null && value !== "",
	);

const mobileStyleVars = ctaMobileUseSeparateStyles
	? {
			"--cta-mobile-button-color": pickValue(
				ctaMobileButtonColor,
				ctaButtonColorScroll,
				ctaButtonColor,
				"#111111",
			),
			"--cta-mobile-button-bg": pickValue(
				ctaMobileButtonBackgroundColor,
				ctaButtonBackgroundColorScroll,
				ctaButtonBackgroundColor,
				"transparent",
			),
			"--cta-mobile-button-border-color": pickValue(
				ctaMobileButtonBorderColor,
				ctaButtonBorderColorScroll,
				ctaButtonBorderColor,
				"#111111",
			),
			"--cta-mobile-button-hover-color": pickValue(
				ctaMobileButtonHoverColor,
				ctaButtonHoverColorScroll,
				ctaButtonHoverColor,
				"#ffffff",
			),
			"--cta-mobile-button-hover-bg": pickValue(
				ctaMobileButtonHoverBackgroundColor,
				ctaButtonHoverBackgroundColorScroll,
				ctaButtonHoverBackgroundColor,
				ctaButtonBackgroundColor,
				"transparent",
			),
			"--cta-mobile-button-hover-border-color": pickValue(
				ctaMobileButtonHoverBorderColor,
				ctaButtonHoverBorderColorScroll,
				ctaButtonHoverBorderColor,
				ctaButtonBorderColor,
			),
			"--cta-mobile-button-border-radius": `${
				pickValue(ctaMobileButtonBorderRadius, ctaButtonBorderRadius, 999) ??
				999
			}px`,
			"--cta-mobile-button-border-width": `${
				pickValue(ctaMobileButtonBorderWidth, ctaButtonBorderWidth, 1) ?? 1
			}px`,
			"--cta-mobile-button-padding-top": pickValue(
				ctaMobileButtonPadding?.top,
				ctaButtonPadding?.top,
				"10px",
			),
			"--cta-mobile-button-padding-right": pickValue(
				ctaMobileButtonPadding?.right,
				ctaButtonPadding?.right,
				"24px",
			),
			"--cta-mobile-button-padding-bottom": pickValue(
				ctaMobileButtonPadding?.bottom,
				ctaButtonPadding?.bottom,
				"10px",
			),
			"--cta-mobile-button-padding-left": pickValue(
				ctaMobileButtonPadding?.left,
				ctaButtonPadding?.left,
				"24px",
			),
			"--cta-mobile-button-font-size": `${
				pickValue(ctaMobileButtonFontSize, ctaButtonFontSize, 16) ?? 16
			}px`,
			"--cta-mobile-button-font-weight": pickValue(
				ctaMobileButtonFontWeight,
				ctaButtonFontWeight,
				"600",
			),
	  }
	: {};

	const computedDividerColor = hexToRgba(
		canvasStoryDividerColor || "#d7d7d7",
		canvasStoryDividerAlpha ?? 0.4,
	);

	const blockClassNames = [
		"adaire-mega-menu",
		level2HoverTextColorEnabled ? "adaire-mega-menu--level2-hover-text" : "",
	]
		.filter(Boolean)
		.join(" ");

	const blockProps = useBlockProps({
		className: blockClassNames,
		style: {
			"--mega-menu-bg-color": backgroundColor,
			"--mega-menu-text-color": textColor,
			"--mega-menu-hover-color": hoverColor,
			"--mega-menu-active-color": activeColor,
			"--mega-menu-font-size": `${fontSize}px`,
			"--mega-menu-font-weight": fontWeight,
			"--mega-menu-bold-weight": boldWeight,
			"--mega-menu-font-family": fontFamily,
			"--mega-menu-underline-color": underlineColor,
			"--mega-menu-padding-top": `${padding.top}px`,
			"--mega-menu-padding-right": `${padding.right}px`,
			"--mega-menu-padding-bottom": `${padding.bottom}px`,
			"--mega-menu-padding-left": `${padding.left}px`,
			"--mega-menu-margin-top": `${margin.top}px`,
			"--mega-menu-margin-right": `${margin.right}px`,
			"--mega-menu-margin-bottom": `${margin.bottom}px`,
			"--mega-menu-margin-left": `${margin.left}px`,
			"--mega-menu-border-radius": `${menuCanvasBorderRadius}px`,
			"--mega-menu-menu-border-radius": `${menuBorderRadius}px`,
			"--canvas-image-tablet-width":
				menuItems.find((item) => item.canvasImageWidth?.tablet)
					?.canvasImageWidth?.tablet?.value +
					(menuItems.find((item) => item.canvasImageWidth?.tablet)
						?.canvasImageWidth?.tablet?.unit || "px") || "250px",
			"--canvas-image-desktop-height":
				menuItems.find((item) => item.canvasImageHeight?.desktop)
					?.canvasImageHeight?.desktop?.value +
					(menuItems.find((item) => item.canvasImageHeight?.desktop)
						?.canvasImageHeight?.desktop?.unit || "px") || "200px",
			"--canvas-image-tablet-height":
				menuItems.find((item) => item.canvasImageHeight?.tablet)
					?.canvasImageHeight?.tablet?.value +
					(menuItems.find((item) => item.canvasImageHeight?.tablet)
						?.canvasImageHeight?.tablet?.unit || "px") || "150px",
			"--canvas-image-mobile-height":
				menuItems.find((item) => item.canvasImageHeight?.mobile)
					?.canvasImageHeight?.mobile?.value +
					(menuItems.find((item) => item.canvasImageHeight?.mobile)
						?.canvasImageHeight?.mobile?.unit || "px") || "120px",
			"--mega-menu-logo-size": `${logoSize}px`,
			"--container-max-width": `${containerMaxWidth?.desktop?.value ?? 1200}${
				containerMaxWidth?.desktop?.unit ?? "px"
			}`,
			"--container-max-width-tablet": `${
				containerMaxWidth?.tablet?.value ?? 100
			}${containerMaxWidth?.tablet?.unit ?? "%"}`,
			"--container-max-width-mobile": `${
				containerMaxWidth?.mobile?.value ?? 100
			}${containerMaxWidth?.mobile?.unit ?? "%"}`,
			"--mobile-menu-bg": mobileMenuBgColor,
			"--mobile-level1-font-size": `${mobileLevel1FontSize}px`,
			"--mobile-level1-font-weight": mobileLevel1FontWeight,
			"--mobile-level1-font-color": mobileLevel1FontColor,
			"--mobile-level2-font-size": `${mobileLevel2FontSize}px`,
			"--mobile-level2-font-weight": mobileLevel2FontWeight,
			"--mobile-level2-font-color": mobileLevel2FontColor,
			"--mobile-level3-font-size": `${mobileLevel3FontSize}px`,
			"--mobile-level3-font-weight": mobileLevel3FontWeight,
			"--mobile-level3-font-color": mobileLevel3FontColor,
			"--mobile-menu-item-bg": mobileMenuItemBgColor,
			"--mobile-menu-item-hover-bg": mobileMenuItemHoverBgColor,
			"--mobile-chevron-size": `${mobileChevronSize}px`,
			"--mobile-chevron-color": mobileChevronColor,
			"--mobile-menu-icon-color": mobileMenuIconColor || textColor,
			"--mobile-menu-icon-color-scroll":
				mobileMenuIconColorScroll || mobileMenuIconColor || textColor,
			"--mobile-menu-icon-color-current": mobileMenuIconColor || textColor,
			"--level1-hover-bg-color": level1HoverBgColor,
			"--level1-hover-padding-top": `${level1HoverPadding?.top ?? 10}px`,
			"--level1-hover-padding-right": `${level1HoverPadding?.right ?? 5}px`,
			"--level1-hover-padding-bottom": `${level1HoverPadding?.bottom ?? 10}px`,
			"--level1-hover-padding-left": `${level1HoverPadding?.left ?? 5}px`,
			"--level1-hover-border-radius": `${level1HoverBorderRadius ?? 0}px`,
			"--level2-hover-bg-color": level2HoverBgColor,
			"--level2-hover-padding-top": `${level2HoverPadding?.top || 8}px`,
			"--level2-hover-padding-right": `${level2HoverPadding?.right || 12}px`,
			"--level2-hover-padding-bottom": `${level2HoverPadding?.bottom || 8}px`,
			"--level2-hover-padding-left": `${level2HoverPadding?.left || 12}px`,
			"--level2-header-spacing": `${level2HeaderSpacing ?? 16}px`,
			"--level3-hover-bg-color": level3HoverBgColor,
			"--level3-hover-padding-top": `${level3HoverPadding?.top || 8}px`,
			"--level3-hover-padding-right": `${level3HoverPadding?.right || 12}px`,
			"--level3-hover-padding-bottom": `${level3HoverPadding?.bottom || 8}px`,
			"--level3-hover-padding-left": `${level3HoverPadding?.left || 12}px`,
			"--level3-item-spacing": `${level3ItemSpacing ?? 8}px`,
			"--menu-items-underline-color-top": menuItemsUnderlineColorTop || level1UnderlineColor,
			"--menu-items-underline-color-scroll": menuItemsUnderlineColorScroll || level1UnderlineColor,
			"--ribbon-bg-color": ribbonBackgroundColor,
			"--ribbon-text-color": ribbonTextColor,
			"--ribbon-font-size": `${ribbonFontSize || 14}px`,
			"--ribbon-font-weight": ribbonFontWeight || "500",
			"--ribbon-link-color": ribbonLinkColor || ribbonTextColor || "#ffffff",
			"--ribbon-link-font-weight": ribbonLinkFontWeight || "600",
			"--ribbon-link-underline": ribbonLinkUnderline !== false ? "underline" : "none",
			"--ribbon-link-underline-color": ribbonLinkUnderlineColor || "#ffffff",
			"--ribbon-link-underline-width": ribbonLinkUnderlineWidth ? `${ribbonLinkUnderlineWidth}px` : "1px",
			"--ribbon-height": ribbonHeight ? `${ribbonHeight}px` : "48px",
			"--mega-menu-navbar-offset": ribbonEnabled ? `${ribbonHeight || 48}px` : "0px",
			"--ribbon-padding-top": ribbonPaddingTop !== undefined ? `${ribbonPaddingTop}px` : undefined,
			"--ribbon-padding-bottom": ribbonPaddingBottom !== undefined ? `${ribbonPaddingBottom}px` : undefined,
			"--ribbon-link-arrow-color":
				ribbonLinkArrowColor || ribbonLinkColor || ribbonTextColor || "#ffffff",
			"--ribbon-link-arrow-size": `${ribbonLinkArrowSize !== undefined && ribbonLinkArrowSize !== null ? ribbonLinkArrowSize : 16}px`,
			"--ribbon-link-arrow-rotate": `${ribbonLinkArrowRotation !== undefined && ribbonLinkArrowRotation !== null ? ribbonLinkArrowRotation : 0}deg`,
			"--mega-menu-dropdown-top": menuDropdownOffset !== undefined ? `${menuDropdownOffset}px` : undefined,
			"--cta-button-color-top": ctaButtonColor || "#111111",
			"--cta-button-color-scroll": ctaButtonColorScroll || ctaButtonColor || "#111111",
			"--cta-button-bg-top": ctaButtonBackgroundColor || "transparent",
			"--cta-button-bg-scroll":
				ctaButtonBackgroundColorScroll ||
				ctaButtonBackgroundColor ||
				"transparent",
			"--cta-button-border-color-top": ctaButtonBorderColor || "#111111",
			"--cta-button-border-color-scroll":
				ctaButtonBorderColorScroll || ctaButtonBorderColor || "#111111",
			"--cta-button-hover-color-top": ctaButtonHoverColor || "#ffffff",
			"--cta-button-hover-color-scroll":
				ctaButtonHoverColorScroll || ctaButtonHoverColor || "#ffffff",
			"--cta-button-hover-bg-top":
				ctaButtonHoverBackgroundColor ||
				ctaButtonBackgroundColor ||
				"transparent",
			"--cta-button-hover-bg-scroll":
				ctaButtonHoverBackgroundColorScroll ||
				ctaButtonHoverBackgroundColor ||
				ctaButtonBackgroundColor ||
				"transparent",
			"--cta-button-hover-border-color-top":
				ctaButtonHoverBorderColor || ctaButtonBorderColor || "#111111",
			"--cta-button-hover-border-color-scroll":
				ctaButtonHoverBorderColorScroll ||
				ctaButtonHoverBorderColor ||
				ctaButtonBorderColor ||
				"#111111",
			"--cta-button-underline-color": ctaButtonUnderlineColor || "#111111",
			"--cta-button-font-size": `${ctaButtonFontSize || 16}px`,
			"--cta-button-font-weight-top": ctaButtonFontWeight || "600",
			"--cta-button-font-weight-scroll": ctaButtonFontWeight || "600",
			"--cta-button-blur": ctaButtonBlurAmount ? `${ctaButtonBlurAmount}px` : "0px",
			"--cta-button-border-radius":
				ctaButtonBorderRadius !== undefined
					? `${ctaButtonBorderRadius}px`
					: "999px",
			"--cta-button-border-width": `${ctaButtonBorderWidth ?? 1}px`,
			"--cta-button-border-style": ctaButtonBorderStyle || "solid",
			"--cta-button-padding-top": ctaButtonPadding?.top || "10px",
			"--cta-button-padding-right": ctaButtonPadding?.right || "24px",
			"--cta-button-padding-bottom": ctaButtonPadding?.bottom || "10px",
			"--cta-button-padding-left": ctaButtonPadding?.left || "24px",
			"--cta-button-margin-top": ctaButtonMargin?.top || "0px",
			"--cta-button-margin-right": ctaButtonMargin?.right || "0px",
			"--cta-button-margin-bottom": ctaButtonMargin?.bottom || "0px",
			"--cta-button-margin-left": ctaButtonMargin?.left || "0px",
			"--cta-button-color-current": ctaButtonColor || "#111111",
			"--cta-button-bg-current": ctaButtonBackgroundColor || "transparent",
			"--cta-button-border-color-current": ctaButtonBorderColor || "#111111",
			"--cta-button-hover-color-current": ctaButtonHoverColor || "#ffffff",
			"--cta-button-hover-bg-current":
				ctaButtonHoverBackgroundColor ||
				ctaButtonBackgroundColor ||
				"transparent",
			"--cta-button-hover-border-color-current":
				ctaButtonHoverBorderColor || ctaButtonBorderColor || "#111111",
			"--menu-panel-gap": `${
				menuPanelGap !== undefined ? menuPanelGap : 16
			}px`,
			"--menu-panel-padding-bottom": `${
				menuPanelPaddingBottom !== undefined ? menuPanelPaddingBottom : 16
			}px`,
			"--canvas-banner-bg-color": canvasBannerBackgroundColor || "#ff3131",
			"--canvas-banner-width": `${
				canvasBannerWidth !== undefined ? canvasBannerWidth : 100
			}%`,
			"--canvas-banner-padding-top": `${
				canvasBannerPaddingTop !== undefined ? canvasBannerPaddingTop : 10
			}px`,
			"--canvas-banner-padding-bottom": `${
				canvasBannerPaddingBottom !== undefined
					? canvasBannerPaddingBottom
					: 10
			}px`,
			"--canvas-banner-padding-left": `${
				canvasBannerPaddingLeft !== undefined ? canvasBannerPaddingLeft : 20
			}px`,
			"--canvas-banner-padding-right": `${
				canvasBannerPaddingRight !== undefined ? canvasBannerPaddingRight : 20
			}px`,
			"--canvas-banner-title-font-size": `${
				canvasBannerTitleFontSize !== undefined
					? canvasBannerTitleFontSize
					: 30
			}px`,
			"--canvas-banner-title-color": canvasBannerTitleColor || "#ffffff",
			"--canvas-banner-title-font-weight":
				canvasBannerTitleFontWeight || "300",
			"--canvas-banner-description-font-size": `${
				canvasBannerDescriptionFontSize !== undefined
					? canvasBannerDescriptionFontSize
					: 20
			}px`,
			"--canvas-banner-description-color":
				canvasBannerDescriptionColor || "#ffffff",
			"--canvas-banner-description-font-weight":
				canvasBannerDescriptionFontWeight || "300",
			"--canvas-list-padding-left": `${
				canvasListPaddingLeft !== undefined ? canvasListPaddingLeft : 20
			}px`,
			"--canvas-list-padding-right": `${
				canvasListPaddingRight !== undefined ? canvasListPaddingRight : 20
			}px`,
			"--canvas-story-title-font-size": `${canvasStoryTitleFontSize}px`,
			"--canvas-story-title-font-weight": canvasStoryTitleFontWeight,
			"--canvas-story-title-color": canvasStoryTitleColor,
			"--canvas-story-title-margin-top": `${canvasStoryTitleMarginTop}px`,
			"--canvas-story-title-margin-bottom": `${canvasStoryTitleMarginBottom}px`,
			"--canvas-story-description-font-size": `${canvasStoryDescriptionFontSize}px`,
			"--canvas-story-description-font-weight":
				canvasStoryDescriptionFontWeight,
			"--canvas-story-description-color": canvasStoryDescriptionColor,
			"--canvas-story-description-margin-top": `${canvasStoryDescriptionMarginTop}px`,
			"--canvas-story-description-margin-bottom": `${canvasStoryDescriptionMarginBottom}px`,
			"--canvas-story-link-font-size": `${canvasStoryLinkFontSize}px`,
			"--canvas-story-link-font-weight": canvasStoryLinkFontWeight,
			"--canvas-story-link-color": canvasStoryLinkColor,
			"--canvas-story-link-margin-top": `${canvasStoryLinkMarginTop}px`,
			"--canvas-story-link-margin-bottom": `${canvasStoryLinkMarginBottom}px`,
			"--canvas-story-link-hover-color": canvasStoryLinkHoverColor || canvasStoryLinkColor,
			"--canvas-story-link-underline-color":
				canvasStoryLinkUnderlineColor || canvasStoryLinkColor,
			"--canvas-story-link-underline-height": `${
				canvasStoryLinkUnderlineHeight || 2
			}px`,
			"--canvas-story-link-underline-radius": `${
				canvasStoryLinkUnderlineBorderRadius || 0
			}px`,
			"--canvas-story-divider-width": `${canvasStoryDividerWidth}px`,
			"--canvas-story-divider-height": `${canvasStoryDividerHeight}%`,
			"--canvas-story-divider-color": computedDividerColor,
		...mobileStyleVars,
		},
	});

	const handleSolidColorChange = (attribute) => (colorValue) => {
		if (!colorValue) {
			return;
		}
		const value =
			typeof colorValue === "string"
				? colorValue
				: colorValue?.hex || colorValue;
		setAttributes({ [attribute]: value });
	};

	const handleAlphaColorChange = (attribute) => (colorValue) => {
		if (!colorValue) {
			return;
		}
		if (typeof colorValue === "string") {
			setAttributes({ [attribute]: colorValue });
			return;
		}
		const alpha = colorValue.rgb?.a ?? 1;
		const formatted =
			alpha < 1
				? `rgba(${colorValue.rgb.r}, ${colorValue.rgb.g}, ${colorValue.rgb.b}, ${alpha})`
				: colorValue.hex;
		setAttributes({ [attribute]: formatted });
	};

	const renderCtaButtonPreview = (extraClass = "") => {
		if (!ctaButtonEnabled) {
			return null;
		}

		const classes = [
			"adaire-mega-menu__action-button",
			ctaButtonStyle
				? `adaire-mega-menu__action-button--${ctaButtonStyle}`
				: "adaire-mega-menu__action-button--underline",
		];

		if (ctaButtonHoverAnimation && ctaButtonHoverAnimation !== "none") {
			classes.push(
				`adaire-mega-menu__action-button--${ctaButtonHoverAnimation}`,
			);
		}

		if (extraClass) {
			classes.push(extraClass);
		}

		return (
			<a
				className={classes.join(" ")}
				href={ctaButtonLink || "#"}
				target={ctaButtonOpenInNewTab ? "_blank" : undefined}
				rel={
					ctaButtonOpenInNewTab ? "noopener noreferrer" : undefined
				}
				onClick={(event) => event.preventDefault()}
			>
				<span className="adaire-mega-menu__action-button-label">
					{ctaButtonText}
				</span>
				{ctaButtonShowIcon !== false && (
					<span
						className="adaire-mega-menu__action-button-icon"
						aria-hidden="true"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M7 17L17 7M17 7H7M17 7V17"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</span>
				)}
			</a>
		);
	};

	// Helper function to find and update a specific menu item
	const updateMenuItemInTree = useCallback(
		(items, targetId, updates, parentId = null) => {
			return items.map((item) => {
				if (item.id === targetId) {
					return { ...item, ...updates };
				}
				if (item.children && item.children.length > 0) {
					return {
						...item,
						children: updateMenuItemInTree(
							item.children,
							targetId,
							updates,
							item.id,
						),
					};
				}
				return item;
			});
		},
		[],
	);

	// Helper function to add a child to a specific menu item
	const addChildToMenuItem = useCallback((items, parentId, newChild) => {
		return items.map((item) => {
			if (item.id === parentId) {
				return { ...item, children: [...(item.children || []), newChild] };
			}
			if (item.children && item.children.length > 0) {
				return {
					...item,
					children: addChildToMenuItem(item.children, parentId, newChild),
				};
			}
			return item;
		});
	}, []);

	// Helper function to remove a menu item
	const removeMenuItemFromTree = useCallback(
		(items, targetId, parentId = null) => {
			if (parentId) {
				return items.map((item) => {
					if (item.id === parentId) {
						return {
							...item,
							children: (item.children || []).filter(
								(child) => child.id !== targetId,
							),
						};
					}
					if (item.children && item.children.length > 0) {
						return {
							...item,
							children: removeMenuItemFromTree(
								item.children,
								targetId,
								parentId,
							),
						};
					}
					return item;
				});
			} else {
				return items.filter((item) => item.id !== targetId);
			}
		},
		[],
	);

	// Helper function to move a menu item
	const moveMenuItemInTree = useCallback(
		(items, targetId, direction, parentId = null) => {
			if (parentId) {
				return items.map((item) => {
					if (item.id === parentId) {
						const children = [...(item.children || [])];
						const index = children.findIndex((child) => child.id === targetId);
						if (index !== -1) {
							const newIndex = index + direction;
							if (newIndex >= 0 && newIndex < children.length) {
								[children[index], children[newIndex]] = [
									children[newIndex],
									children[index],
								];
							}
						}
						return { ...item, children };
					}
					if (item.children && item.children.length > 0) {
						return {
							...item,
							children: moveMenuItemInTree(
								item.children,
								targetId,
								direction,
								parentId,
							),
						};
					}
					return item;
				});
			} else {
				const index = items.findIndex((item) => item.id === targetId);
				if (index !== -1) {
					const newIndex = index + direction;
					if (newIndex >= 0 && newIndex < items.length) {
						const newItems = [...items];
						[newItems[index], newItems[newIndex]] = [
							newItems[newIndex],
							newItems[index],
						];
						return newItems;
					}
				}
				return items;
			}
		},
		[],
	);

	const updateMenuItem = useCallback(
		(itemId, updates, parentId = null) => {
			const updatedItems = updateMenuItemInTree(
				menuItems,
				itemId,
				updates,
				parentId,
			);
			setAttributes({ menuItems: updatedItems });
		},
		[menuItems, setAttributes, updateMenuItemInTree],
	);

	// Helper function to get the depth of a menu item
	const getItemDepth = useCallback((items, targetId, currentDepth = 0) => {
		for (const item of items) {
			if (item.id === targetId) {
				return currentDepth;
			}
			if (item.children && item.children.length > 0) {
				const childDepth = getItemDepth(
					item.children,
					targetId,
					currentDepth + 1,
				);
				if (childDepth !== -1) {
					return childDepth;
				}
			}
		}
		return -1;
	}, []);

	const getLevelColors = useCallback(
		(level) => {
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
						underlineWidth: level3UnderlineWidth,
						underlineColor: level3UnderlineColor,
						underlineBorderRadius: 0,
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
		},
		[
			level1HoverColor,
			level1ShowHoverUnderline,
			level1UnderlineWidth,
			level1UnderlineColor,
			level1UnderlineBorderRadius,
			level1FontSize,
			level1FontWeight,
			level1FontColor,
			level2HoverColor,
			level2ShowHoverUnderline,
			level2FontSize,
			level2FontWeight,
			level2FontColor,
			level3HoverColor,
			level3ShowHoverUnderline,
			level3UnderlineWidth,
			level3UnderlineColor,
			level3FontSize,
			level3FontWeight,
			level3FontColor,
		],
	);

	const addMenuItem = useCallback(
		(parentId = null) => {
			if (isLimitReached && !parentId) {
				return;
			}

			// Check if adding a child would exceed 3 levels
			let level = 0;
			if (parentId) {
				const parentDepth = getItemDepth(menuItems, parentId);
				if (parentDepth >= 2) {
					// Level 3 is the maximum (0-indexed, so 2 is level 3)
					return;
				}
				level = parentDepth + 1;
			}

			const newId = `menu-item-${Date.now()}`;
			const newItem = {
				id: newId,
				title: __("New Menu Item", "adaire-blocks"),
				url: "#",
				isBold: false,
				openInNewTab: false,
				bannerDescription: level === 0 ? "" : undefined,
				canvasStoryTitle: level === 0 ? "" : undefined,
				canvasStoryDescription: level === 0 ? "" : undefined,
				canvasStoryLinkLabel: level === 0 ? "" : undefined,
				canvasStoryLinkUrl: level === 0 ? "" : undefined,
				canvasStoryLinkOpenInNewTab: level === 0 ? false : undefined,
				canvasImageUrl: level === 0 ? "" : undefined,
				canvasImageAlt: level === 0 ? "Canvas Image" : undefined,
				canvasImagePosition: level === 0 ? "left" : undefined,
				canvasBannerEnabled: level === 0 ? true : undefined,
				canvasIsSmallest: level === 0 ? false : undefined,
				canvasImageWidth:
					level === 0
						? {
								desktop: { value: 300, unit: "px" },
								tablet: { value: 250, unit: "px" },
						  }
						: undefined,
				canvasImageHeight:
					level === 0
						? {
								desktop: { value: 200, unit: "px" },
								tablet: { value: 150, unit: "px" },
								mobile: { value: 120, unit: "px" },
						  }
						: undefined,
				children: [],
			};

			if (parentId) {
				const updatedItems = addChildToMenuItem(menuItems, parentId, newItem);
				setAttributes({ menuItems: updatedItems });
			} else {
				setAttributes({ menuItems: [...menuItems, newItem] });
			}
		},
		[menuItems, setAttributes, addChildToMenuItem, getItemDepth],
	);

	const removeMenuItem = useCallback(
		(itemId, parentId = null) => {
			const updatedItems = removeMenuItemFromTree(menuItems, itemId, parentId);
			setAttributes({ menuItems: updatedItems });
		},
		[menuItems, setAttributes, removeMenuItemFromTree],
	);

	const moveMenuItem = useCallback(
		(itemId, direction, parentId = null) => {
			const updatedItems = moveMenuItemInTree(
				menuItems,
				itemId,
				direction,
				parentId,
			);
			setAttributes({ menuItems: updatedItems });
		},
		[menuItems, setAttributes, moveMenuItemInTree],
	);

	const toggleDropdown = useCallback((itemId) => {
		setOpenDropdowns((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(itemId)) {
				newSet.delete(itemId);
			} else {
				newSet.add(itemId);
			}
			return newSet;
		});
	}, []);

	const renderMenuItem = (item, level = 0, parentId = null) => {
		const hasChildren = item.children && item.children.length > 0;
		const isTopLevel = level === 0;
		const actualDepth = getItemDepth(menuItems, item.id);

		return (
			<div
				key={item.id}
				style={{
					marginBottom: "12px",
					padding: "12px",
					border: "1px solid #ddd",
					borderRadius: "4px",
					backgroundColor: isTopLevel ? "#f9f9f9" : "#fff",
					borderLeft:
						level > 0
							? `4px solid ${
									level === 1 ? "#0073aa" : level === 2 ? "#00a32a" : "#d63638"
							  }`
							: "1px solid #ddd",
					position: "relative",
				}}
			>
				{level > 0 && (
					<div
						style={{
							position: "absolute",
							top: "0",
							left: "-4px",
							width: "4px",
							height: "100%",
							backgroundColor:
								level === 1 ? "#0073aa" : level === 2 ? "#00a32a" : "#d63638",
							borderRadius: "2px 0 0 2px",
						}}
					/>
				)}
				<div style={{ marginBottom: "8px" }}>
					<div
						style={{ marginBottom: "8px", alignItems: "center", gap: "8px" }}
					>
						<span
							style={{
								fontSize: "12px",
								color: "#666",
								fontWeight: "bold",
								minWidth: "60px",
							}}
						>
							Level {level + 1}
						</span>
						<TextControl
							value={item.title}
							onChange={(value) =>
								updateMenuItem(item.id, { title: value }, parentId)
							}
							placeholder="Menu Item Title"
							style={{ flex: 1 }}
						/>
					</div>
					<div style={{ marginBottom: "8px" }}>
						<TextControl
							value={item.url}
							onChange={(value) =>
								updateMenuItem(item.id, { url: value }, parentId)
							}
							placeholder="URL"
						/>
					</div>
					{isTopLevel && (
						<>
							<div style={{ marginBottom: "8px" }}>
								<TextareaControl
									label={__("Banner Description", "adaire-blocks")}
									value={item.bannerDescription || ""}
									onChange={(value) =>
										updateMenuItem(item.id, { bannerDescription: value }, parentId)
									}
									placeholder={__(
										"Add supporting copy that appears alongside this dropdown.",
										"mega-menu-block",
									)}
								/>
							</div>
							<div style={{ marginBottom: "8px" }}>
								<ToggleControl
									label={__("Show Canvas Banner", "adaire-blocks")}
									checked={item.canvasBannerEnabled !== false}
									onChange={(value) =>
										updateMenuItem(
											item.id,
											{ canvasBannerEnabled: value },
											parentId,
										)
									}
									help={__(
										"Disable to remove the red hero banner panel for this dropdown.",
										"mega-menu-block",
									)}
								/>
							</div>
						</>
					)}
					<div style={{ marginBottom: "8px" }}>
						<ToggleControl
							checked={item.isBold}
							onChange={(value) =>
								updateMenuItem(item.id, { isBold: value }, parentId)
							}
							label="Bold"
						/>
					</div>
					<div style={{ marginBottom: "8px" }}>
						<ToggleControl
							checked={item.openInNewTab || false}
							onChange={(value) =>
								updateMenuItem(item.id, { openInNewTab: value }, parentId)
							}
							label="Open in New Tab"
						/>
					</div>

					{/* Canvas Image Controls - Only for Level 1 items */}
					{level === 0 && (
						<div
							style={{
								marginBottom: "8px",
								padding: "8px",
								border: "1px solid #ddd",
								borderRadius: "4px",
								backgroundColor: "#f9f9f9",
							}}
						>
							<h4
								style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}
							>
								{__("Canvas Story", "adaire-blocks")}
							</h4>

							<ToggleControl
								label={__("Mark Canvas as Smaller", "adaire-blocks")}
								help={__(
									"Adds a .smaller class to this canvas dropdown",
									"mega-menu-block",
								)}
								checked={item.canvasIsSmaller || false}
								onChange={(value) =>
									updateMenuItem(
										item.id,
										{
											canvasIsSmaller: value,
											canvasIsSmallest: value ? false : item.canvasIsSmallest,
										},
										parentId,
									)
								}
							/>

							<ToggleControl
								label={__("Mark Canvas as Smallest", "adaire-blocks")}
								help={__(
									"Applies a .smallest class with the tightest layout. Cannot be combined with the smaller option.",
									"mega-menu-block",
								)}
								checked={item.canvasIsSmallest || false}
								onChange={(value) =>
									updateMenuItem(
										item.id,
										{
											canvasIsSmallest: value,
											canvasIsSmaller: value ? false : item.canvasIsSmaller,
										},
										parentId,
									)
								}
							/>

							<TextControl
								label={__("Story Title", "adaire-blocks")}
								value={item.canvasStoryTitle || ""}
								onChange={(value) =>
									updateMenuItem(item.id, { canvasStoryTitle: value }, parentId)
								}
							/>

							<TextareaControl
								label={__("Story Description", "adaire-blocks")}
								value={item.canvasStoryDescription || ""}
								onChange={(value) =>
									updateMenuItem(
										item.id,
										{ canvasStoryDescription: value },
										parentId,
									)
								}
							/>

							<TextControl
								label={__("Learn More Label", "adaire-blocks")}
								value={item.canvasStoryLinkLabel || ""}
								onChange={(value) =>
									updateMenuItem(
										item.id,
										{ canvasStoryLinkLabel: value },
										parentId,
									)
								}
							/>

							<TextControl
								label={__("Learn More URL", "adaire-blocks")}
								value={item.canvasStoryLinkUrl || ""}
								onChange={(value) =>
									updateMenuItem(
										item.id,
										{ canvasStoryLinkUrl: value },
										parentId,
									)
								}
							/>

							<ToggleControl
								label={__("Open Story Link in New Tab", "adaire-blocks")}
								checked={item.canvasStoryLinkOpenInNewTab || false}
								onChange={(value) =>
									updateMenuItem(
										item.id,
										{ canvasStoryLinkOpenInNewTab: value },
										parentId,
									)
								}
							/>

							<BaseControl label={__("Story Image", "adaire-blocks")}>
								<MediaUploadCheck>
									<MediaUpload
										onSelect={(media) =>
											updateMenuItem(
												item.id,
												{
													canvasImageUrl: media.url,
													canvasImageAlt: media.alt || "Canvas Image",
												},
												parentId,
											)
										}
										allowedTypes={["image"]}
										value={item.canvasImageUrl}
										render={({ open }) => (
											<div>
												{item.canvasImageUrl && (
													<div style={{ marginBottom: "8px" }}>
														<img
															src={item.canvasImageUrl}
															alt={item.canvasImageAlt}
															style={{
																maxWidth: "100px",
																height: "auto",
																borderRadius: `${canvasImageBorderRadius}px`,
															}}
														/>
													</div>
												)}
												<Button onClick={open} isSecondary isSmall>
													{item.canvasImageUrl
														? __("Change", "adaire-blocks")
														: __("Select Image", "adaire-blocks")}
												</Button>
												{item.canvasImageUrl && (
													<Button
														onClick={() =>
															updateMenuItem(
																item.id,
																{
																	canvasImageUrl: "",
																	canvasImageAlt: "Canvas Image",
																},
																parentId,
															)
														}
														isDestructive
														isSmall
														style={{ marginLeft: "8px" }}
													>
														{__("Remove", "adaire-blocks")}
													</Button>
												)}
											</div>
										)}
									/>
								</MediaUploadCheck>
							</BaseControl>

							<SelectControl
								label={__("Position", "adaire-blocks")}
								value={item.canvasImagePosition}
								options={[
									{ label: __("Left", "adaire-blocks"), value: "left" },
									{ label: __("Right", "adaire-blocks"), value: "right" },
								]}
								onChange={(value) =>
									updateMenuItem(
										item.id,
										{ canvasImagePosition: value },
										parentId,
									)
								}
							/>

							<div style={{ display: "flex", gap: "8px" }}>
								<RangeControl
									label={__("Width (Desktop)", "adaire-blocks")}
									value={item.canvasImageWidth?.desktop?.value || 300}
									onChange={(value) =>
										updateMenuItem(
											item.id,
											{
												canvasImageWidth: {
													...item.canvasImageWidth,
													desktop: { ...item.canvasImageWidth?.desktop, value },
												},
											},
											parentId,
										)
									}
									min={100}
									max={600}
								/>
								<SelectControl
									label={__("Desktop Unit", "adaire-blocks")}
									value={item.canvasImageWidth?.desktop?.unit || "px"}
									options={[
										{ label: "px", value: "px" },
										{ label: "%", value: "%" },
										{ label: "rem", value: "rem" },
										{ label: "vw", value: "vw" },
									]}
									onChange={(value) =>
										updateMenuItem(
											item.id,
											{
												canvasImageWidth: {
													...item.canvasImageWidth,
													desktop: {
														...item.canvasImageWidth?.desktop,
														unit: value,
													},
												},
											},
											parentId,
										)
									}
								/>
							</div>

							<div style={{ display: "flex", gap: "8px" }}>
								<RangeControl
									label={__("Width (Tablet)", "adaire-blocks")}
									value={item.canvasImageWidth?.tablet?.value || 250}
									onChange={(value) =>
										updateMenuItem(
											item.id,
											{
												canvasImageWidth: {
													...item.canvasImageWidth,
													tablet: { ...item.canvasImageWidth?.tablet, value },
												},
											},
											parentId,
										)
									}
									min={100}
									max={500}
								/>
								<SelectControl
									label={__("Tablet Unit", "adaire-blocks")}
									value={item.canvasImageWidth?.tablet?.unit || "px"}
									options={[
										{ label: "px", value: "px" },
										{ label: "%", value: "%" },
										{ label: "rem", value: "rem" },
										{ label: "vw", value: "vw" },
									]}
									onChange={(value) =>
										updateMenuItem(
											item.id,
											{
												canvasImageWidth: {
													...item.canvasImageWidth,
													tablet: {
														...item.canvasImageWidth?.tablet,
														unit: value,
													},
												},
											},
											parentId,
										)
									}
								/>
							</div>

							<div style={{ display: "flex", gap: "8px" }}>
								<RangeControl
									label={__("Height (Desktop)", "adaire-blocks")}
									value={item.canvasImageHeight?.desktop?.value || 200}
									onChange={(value) =>
										updateMenuItem(
											item.id,
											{
												canvasImageHeight: {
													...item.canvasImageHeight,
													desktop: {
														...item.canvasImageHeight?.desktop,
														value,
													},
												},
											},
											parentId,
										)
									}
									min={50}
									max={800}
								/>
								<SelectControl
									label={__("Desktop Unit", "adaire-blocks")}
									value={item.canvasImageHeight?.desktop?.unit || "px"}
									options={[
										{ label: "px", value: "px" },
										{ label: "%", value: "%" },
										{ label: "rem", value: "rem" },
										{ label: "vh", value: "vh" },
									]}
									onChange={(value) =>
										updateMenuItem(
											item.id,
											{
												canvasImageHeight: {
													...item.canvasImageHeight,
													desktop: {
														...item.canvasImageHeight?.desktop,
														unit: value,
													},
												},
											},
											parentId,
										)
									}
								/>
							</div>

							<div style={{ display: "flex", gap: "8px" }}>
								<RangeControl
									label={__("Height (Tablet)", "adaire-blocks")}
									value={item.canvasImageHeight?.tablet?.value || 150}
									onChange={(value) =>
										updateMenuItem(
											item.id,
											{
												canvasImageHeight: {
													...item.canvasImageHeight,
													tablet: { ...item.canvasImageHeight?.tablet, value },
												},
											},
											parentId,
										)
									}
									min={50}
									max={600}
								/>
								<SelectControl
									label={__("Tablet Unit", "adaire-blocks")}
									value={item.canvasImageHeight?.tablet?.unit || "px"}
									options={[
										{ label: "px", value: "px" },
										{ label: "%", value: "%" },
										{ label: "rem", value: "rem" },
										{ label: "vh", value: "vh" },
									]}
									onChange={(value) =>
										updateMenuItem(
											item.id,
											{
												canvasImageHeight: {
													...item.canvasImageHeight,
													tablet: {
														...item.canvasImageHeight?.tablet,
														unit: value,
													},
												},
											},
											parentId,
										)
									}
								/>
							</div>

							<div style={{ display: "flex", gap: "8px" }}>
								<RangeControl
									label={__("Height (Mobile)", "adaire-blocks")}
									value={item.canvasImageHeight?.mobile?.value || 120}
									onChange={(value) =>
										updateMenuItem(
											item.id,
											{
												canvasImageHeight: {
													...item.canvasImageHeight,
													mobile: { ...item.canvasImageHeight?.mobile, value },
												},
											},
											parentId,
										)
									}
									min={50}
									max={400}
								/>
								<SelectControl
									label={__("Mobile Unit", "adaire-blocks")}
									value={item.canvasImageHeight?.mobile?.unit || "px"}
									options={[
										{ label: "px", value: "px" },
										{ label: "%", value: "%" },
										{ label: "rem", value: "rem" },
										{ label: "vh", value: "vh" },
									]}
									onChange={(value) =>
										updateMenuItem(
											item.id,
											{
												canvasImageHeight: {
													...item.canvasImageHeight,
													mobile: {
														...item.canvasImageHeight?.mobile,
														unit: value,
													},
												},
											},
											parentId,
										)
									}
								/>
							</div>
						</div>
					)}
					<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
						<Button
							icon={plus}
							onClick={() => addMenuItem(item.id)}
							isSmall
							disabled={actualDepth >= 2}
							label={actualDepth >= 2 ? "Max depth reached" : "Add Sub-item"}
						/>
						<Button
							icon={arrowUp}
							onClick={() => moveMenuItem(item.id, -1, parentId)}
							isSmall
							disabled={isTopLevel && menuItems.indexOf(item) === 0}
							label="Move Up"
						/>
						<Button
							icon={arrowDown}
							onClick={() => moveMenuItem(item.id, 1, parentId)}
							isSmall
							disabled={
								isTopLevel && menuItems.indexOf(item) === menuItems.length - 1
							}
							label="Move Down"
						/>
						<Button
							icon={trash}
							onClick={() => removeMenuItem(item.id, parentId)}
							isSmall
							isDestructive
							label="Remove"
						/>
					</div>
				</div>

				{hasChildren && (
					<div style={{ marginTop: "8px" }}>
						<h4
							style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}
						>
							{__("Sub-items:", "adaire-blocks")}
						</h4>
						{item.children.map((child) =>
							renderMenuItem(child, level + 1, item.id),
						)}
					</div>
				)}
			</div>
		);
	};

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__("Container Settings", "adaire-blocks")}
					initialOpen={true}
				>
					<ButtonGroup>
						{[
							{ label: __("Full width", "adaire-blocks"), value: "full" },
							{
								label: __("Constrained", "adaire-blocks"),
								value: "constrained",
							},
						].map((opt) => (
							<Button
								key={opt.value}
								isPrimary={containerMode === opt.value}
								isSecondary={containerMode !== opt.value}
								onClick={() => setAttributes({ containerMode: opt.value })}
							>
								{opt.label}
							</Button>
						))}
					</ButtonGroup>
					{containerMode === "constrained" && (
						<>
							<p
								style={{
									marginTop: "16px",
									marginBottom: "8px",
									fontWeight: 600,
								}}
							>
								{__("Max Width", "adaire-blocks")}
							</p>
							<ButtonGroup style={{ marginBottom: "12px" }}>
								<Button
									icon={desktop}
									isPrimary={deviceType === "desktop"}
									onClick={() => setDeviceType("desktop")}
									label={__("Desktop", "adaire-blocks")}
								/>
								<Button
									icon={tablet}
									isPrimary={deviceType === "tablet"}
									onClick={() => setDeviceType("tablet")}
									label={__("Tablet", "adaire-blocks")}
								/>
								<Button
									icon={mobile}
									isPrimary={deviceType === "mobile"}
									onClick={() => setDeviceType("mobile")}
									label={__("Mobile", "adaire-blocks")}
								/>
							</ButtonGroup>
							<div style={{ display: "flex", gap: "8px" }}>
								<TextControl
									type="number"
									value={
										containerMaxWidth?.[deviceType]?.value ??
										(deviceType === "desktop"
											? containerMaxWidth?.value ?? 1200
											: 100)
									}
									onChange={(v) =>
										setAttributes({
											containerMaxWidth: {
												...(containerMaxWidth || {}),
												[deviceType]: {
													...(containerMaxWidth?.[deviceType] || {}),
													value: Number(v),
												},
											},
										})
									}
								/>
								<ButtonGroup>
									{["px", "%", "rem", "vw"].map((u) => (
										<Button
											key={u}
											isPrimary={
												(containerMaxWidth?.[deviceType]?.unit ??
													(deviceType === "desktop"
														? containerMaxWidth?.unit ?? "px"
														: "%")) === u
											}
											isSecondary={
												(containerMaxWidth?.[deviceType]?.unit ??
													(deviceType === "desktop"
														? containerMaxWidth?.unit ?? "px"
														: "%")) !== u
											}
											onClick={() =>
												setAttributes({
													containerMaxWidth: {
														...(containerMaxWidth || {}),
														[deviceType]: {
															...(containerMaxWidth?.[deviceType] || {}),
															unit: u,
														},
													},
												})
											}
										>
											{u}
										</Button>
									))}
								</ButtonGroup>
							</div>
						</>
					)}

					{containerMode === "constrained" && (
						<ToggleControl
							label={__("Center horizontally", "adaire-blocks")}
							checked={centerMenu}
							onChange={(value) => setAttributes({ centerMenu: value })}
							help={__(
								"Make the menu centered when constrained",
								"mega-menu-block",
							)}
						/>
					)}
				</PanelBody>

				<PanelBody title={__("Ribbon", "adaire-blocks")} initialOpen={true}>
					<ToggleControl
						label={__("Enable Ribbon", "adaire-blocks")}
						checked={ribbonEnabled}
						onChange={(value) => setAttributes({ ribbonEnabled: value })}
					/>

					{ribbonEnabled && (
						<>
							<TextControl
								label={__("Ribbon Text", "adaire-blocks")}
								value={ribbonText}
								onChange={(value) => setAttributes({ ribbonText: value })}
							/>

							<BaseControl label={__("Background Color", "adaire-blocks")}>
								<ColorPalette
									value={ribbonBackgroundColor}
									onChange={(value) =>
										setAttributes({ ribbonBackgroundColor: value })
									}
								/>
							</BaseControl>

							<BaseControl label={__("Text Color", "adaire-blocks")}>
								<ColorPalette
									value={ribbonTextColor}
									onChange={(value) => setAttributes({ ribbonTextColor: value })}
								/>
							</BaseControl>

							<RangeControl
								label={__("Font Size (px)", "adaire-blocks")}
								value={ribbonFontSize}
								onChange={(value) => setAttributes({ ribbonFontSize: value })}
								min={10}
								max={32}
							/>

							<SelectControl
								label={__("Font Weight", "adaire-blocks")}
								value={ribbonFontWeight}
								options={[
									{ label: __("Light (300)", "adaire-blocks"), value: "300" },
									{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
									{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
									{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
									{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
									{ label: __("Extra Bold (800)", "adaire-blocks"), value: "800" },
								]}
								onChange={(value) => setAttributes({ ribbonFontWeight: value })}
							/>

							<TextControl
								label={__("Link Label", "adaire-blocks")}
								value={ribbonLinkLabel}
								onChange={(value) => setAttributes({ ribbonLinkLabel: value })}
							/>

							<TextControl
								label={__("Link URL", "adaire-blocks")}
								value={ribbonLinkUrl}
								onChange={(value) => setAttributes({ ribbonLinkUrl: value })}
								type="url"
							/>

							<BaseControl label={__("Link Color", "adaire-blocks")}>
								<ColorPalette
									value={ribbonLinkColor}
									onChange={(value) => setAttributes({ ribbonLinkColor: value })}
								/>
							</BaseControl>

							<SelectControl
								label={__("Link Font Weight", "adaire-blocks")}
								value={ribbonLinkFontWeight}
								options={[
									{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
									{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
									{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
									{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
									{ label: __("Extra Bold (800)", "adaire-blocks"), value: "800" },
								]}
								onChange={(value) => setAttributes({ ribbonLinkFontWeight: value })}
							/>

							<ToggleControl
								label={__("Open Link in New Tab", "adaire-blocks")}
								checked={ribbonLinkOpenInNewTab}
								onChange={(value) =>
									setAttributes({ ribbonLinkOpenInNewTab: value })
								}
							/>

							<ToggleControl
								label={__("Underline Link", "adaire-blocks")}
								checked={ribbonLinkUnderline !== false}
								onChange={(value) =>
									setAttributes({ ribbonLinkUnderline: value })
								}
							/>

							{ribbonLinkUnderline !== false && (
								<>
									<BaseControl label={__("Underline Color", "adaire-blocks")}>
										<ColorPalette
											value={ribbonLinkUnderlineColor}
											onChange={(value) =>
												setAttributes({ ribbonLinkUnderlineColor: value })
											}
										/>
									</BaseControl>
									<RangeControl
										label={__("Underline Width (px)", "adaire-blocks")}
										value={ribbonLinkUnderlineWidth || 1}
										onChange={(value) =>
											setAttributes({ ribbonLinkUnderlineWidth: value })
										}
										min={1}
										max={5}
										step={1}
									/>
								</>
							)}

							<RangeControl
								label={__("Ribbon Height (px)", "adaire-blocks")}
								value={ribbonHeight}
								onChange={(value) => setAttributes({ ribbonHeight: value })}
								min={24}
								max={120}
							/>

							<RangeControl
								label={__("Padding Top (px)", "adaire-blocks")}
								value={ribbonPaddingTop}
								onChange={(value) => setAttributes({ ribbonPaddingTop: value })}
								min={0}
								max={60}
							/>

							<RangeControl
								label={__("Padding Bottom (px)", "adaire-blocks")}
								value={ribbonPaddingBottom}
								onChange={(value) => setAttributes({ ribbonPaddingBottom: value })}
								min={0}
								max={60}
							/>
						</>
					)}
				</PanelBody>

				<PanelBody
					title={__("Ribbon link arrow", "adaire-blocks")}
					initialOpen={true}
				>
					{!ribbonEnabled ? (
						<p style={{ fontSize: "13px", margin: 0, color: "#757575" }}>
							{__(
								'Turn on "Enable Ribbon" in the Ribbon panel first, then you can add an arrow next to the ribbon link.',
								"mega-menu-block",
							)}
						</p>
					) : (
						<>
							<p
								style={{
									margin: "0 0 12px",
									fontSize: "12px",
									color: "#757575",
								}}
							>
								{__(
									"Icon after the ribbon link label. Set Link URL in the Ribbon panel.",
									"mega-menu-block",
								)}
							</p>
							<ToggleControl
								label={__("Show arrow next to link", "adaire-blocks")}
								checked={ribbonLinkArrowEnabled}
								onChange={(value) =>
									setAttributes({ ribbonLinkArrowEnabled: value })
								}
							/>
							{ribbonLinkArrowEnabled && (
								<>
									<BaseControl
										label={__("Arrow color", "adaire-blocks")}
										help={__(
											"Leave empty to match the link color.",
											"mega-menu-block",
										)}
									>
										<ColorPalette
											value={ribbonLinkArrowColor}
											onChange={(value) =>
												setAttributes({ ribbonLinkArrowColor: value || "" })
											}
										/>
									</BaseControl>
									<RangeControl
										label={__("Arrow size (px)", "adaire-blocks")}
										value={
											ribbonLinkArrowSize !== undefined &&
											ribbonLinkArrowSize !== null
												? ribbonLinkArrowSize
												: 16
										}
										onChange={(value) =>
											setAttributes({ ribbonLinkArrowSize: value })
										}
										min={8}
										max={48}
										step={1}
									/>
									<RangeControl
										label={__("Arrow rotation (degrees)", "adaire-blocks")}
										value={
											ribbonLinkArrowRotation !== undefined &&
											ribbonLinkArrowRotation !== null
												? ribbonLinkArrowRotation
												: 0
										}
										onChange={(value) =>
											setAttributes({ ribbonLinkArrowRotation: value })
										}
										min={-180}
										max={180}
										step={1}
									/>
								</>
							)}
						</>
					)}
				</PanelBody>

				<PanelBody title={__("Menu Button", "adaire-blocks")} initialOpen={false}>
					<ToggleControl
						label={__("Show Menu Button", "adaire-blocks")}
						checked={ctaButtonEnabled}
						onChange={(value) => setAttributes({ ctaButtonEnabled: value })}
					/>

					{ctaButtonEnabled && (
						<>
							<TextControl
								label={__("Button Text", "adaire-blocks")}
								value={ctaButtonText}
								onChange={(value) => setAttributes({ ctaButtonText: value })}
							/>

							<TextControl
								label={__("Button Link", "adaire-blocks")}
								value={ctaButtonLink}
								onChange={(value) => setAttributes({ ctaButtonLink: value })}
								type="url"
							/>

							<ToggleControl
								label={__("Open in new tab", "adaire-blocks")}
								checked={ctaButtonOpenInNewTab}
								onChange={(value) =>
									setAttributes({ ctaButtonOpenInNewTab: value })
								}
							/>

							<ToggleControl
								label={__("Show icon", "adaire-blocks")}
								checked={ctaButtonShowIcon !== false}
								onChange={(value) => setAttributes({ ctaButtonShowIcon: value })}
							/>

							<BaseControl label={__("Button Text Color", "adaire-blocks")}>
								<ColorPicker
									color={ctaButtonColor}
									onChangeComplete={handleSolidColorChange("ctaButtonColor")}
									disableAlpha
								/>
							</BaseControl>

							<BaseControl
								label={__("Button Background Color", "adaire-blocks")}
							>
								<ColorPicker
									color={
										ctaButtonBackgroundColor &&
										ctaButtonBackgroundColor !== "transparent"
											? ctaButtonBackgroundColor
											: "#000000"
									}
									onChangeComplete={handleAlphaColorChange(
										"ctaButtonBackgroundColor",
									)}
									enableAlpha
								/>
								{ctaButtonBackgroundColor &&
									ctaButtonBackgroundColor !== "transparent" && (
										<Button
											isSmall
											isDestructive
											onClick={() =>
												setAttributes({
													ctaButtonBackgroundColor: "transparent",
												})
											}
											style={{ marginTop: "8px" }}
										>
											{__("Clear Background", "adaire-blocks")}
										</Button>
									)}
							</BaseControl>

							<BaseControl label={__("Hover Text Color", "adaire-blocks")}>
								<ColorPicker
									color={ctaButtonHoverColor}
									onChangeComplete={handleSolidColorChange(
										"ctaButtonHoverColor",
									)}
									disableAlpha
								/>
							</BaseControl>

							<BaseControl
								label={__("Hover Background Color", "adaire-blocks")}
							>
								<ColorPicker
									color={
										ctaButtonHoverBackgroundColor &&
										ctaButtonHoverBackgroundColor !== "transparent"
											? ctaButtonHoverBackgroundColor
											: "#000000"
									}
									onChangeComplete={handleAlphaColorChange(
										"ctaButtonHoverBackgroundColor",
									)}
									enableAlpha
								/>
								{ctaButtonHoverBackgroundColor &&
									ctaButtonHoverBackgroundColor !== "transparent" && (
										<Button
											isSmall
											isDestructive
											onClick={() =>
												setAttributes({
													ctaButtonHoverBackgroundColor: "transparent",
												})
											}
											style={{ marginTop: "8px" }}
										>
											{__("Clear Hover Background", "adaire-blocks")}
										</Button>
									)}
							</BaseControl>

							<BaseControl label={__("Underline Color", "adaire-blocks")}>
								<ColorPicker
									color={ctaButtonUnderlineColor}
									onChangeComplete={handleSolidColorChange(
										"ctaButtonUnderlineColor",
									)}
									disableAlpha
								/>
							</BaseControl>

							<SelectControl
								label={__("Button Style", "adaire-blocks")}
								value={ctaButtonStyle}
								options={[
									{ label: __("Underline", "adaire-blocks"), value: "underline" },
									{ label: __("Background Fill", "adaire-blocks"), value: "fill" },
									{ label: __("Border", "adaire-blocks"), value: "border" },
									{ label: __("Gradient", "adaire-blocks"), value: "gradient" },
									{ label: __("Glass Effect", "adaire-blocks"), value: "glass" },
								]}
								onChange={(value) => setAttributes({ ctaButtonStyle: value })}
							/>

							{ctaButtonStyle === "border" && (
								<>
									<RangeControl
										label={__("Border Width (px)", "adaire-blocks")}
										value={ctaButtonBorderWidth}
										onChange={(value) =>
											setAttributes({ ctaButtonBorderWidth: value })
										}
										min={1}
										max={10}
										step={1}
									/>

									<BaseControl label={__("Border Color", "adaire-blocks")}>
										<ColorPicker
											color={ctaButtonBorderColor}
											onChangeComplete={handleSolidColorChange(
												"ctaButtonBorderColor",
											)}
											disableAlpha
										/>
									</BaseControl>

									<BaseControl label={__("Hover Border Color", "adaire-blocks")}>
										<ColorPicker
											color={ctaButtonHoverBorderColor || ctaButtonBorderColor}
											onChangeComplete={handleSolidColorChange(
												"ctaButtonHoverBorderColor",
											)}
											disableAlpha
										/>
									</BaseControl>

									<SelectControl
										label={__("Border Style", "adaire-blocks")}
										value={ctaButtonBorderStyle}
										options={[
											{ label: __("Solid", "adaire-blocks"), value: "solid" },
											{ label: __("Dashed", "adaire-blocks"), value: "dashed" },
											{ label: __("Dotted", "adaire-blocks"), value: "dotted" },
											{ label: __("Double", "adaire-blocks"), value: "double" },
											{ label: __("Groove", "adaire-blocks"), value: "groove" },
											{ label: __("Ridge", "adaire-blocks"), value: "ridge" },
											{ label: __("Inset", "adaire-blocks"), value: "inset" },
											{ label: __("Outset", "adaire-blocks"), value: "outset" },
										]}
										onChange={(value) =>
											setAttributes({ ctaButtonBorderStyle: value })
										}
									/>
								</>
							)}

							<RangeControl
								label={__("Font Size (px)", "adaire-blocks")}
								value={ctaButtonFontSize}
								onChange={(value) => setAttributes({ ctaButtonFontSize: value })}
								min={12}
								max={48}
								step={1}
							/>

							<SelectControl
								label={__("Font Weight", "adaire-blocks")}
								value={ctaButtonFontWeight}
								options={[
									{ label: __("Thin (100)", "adaire-blocks"), value: "100" },
									{ label: __("Extra Light (200)", "adaire-blocks"), value: "200" },
									{ label: __("Light (300)", "adaire-blocks"), value: "300" },
									{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
									{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
									{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
									{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
									{ label: __("Extra Bold (800)", "adaire-blocks"), value: "800" },
									{ label: __("Black (900)", "adaire-blocks"), value: "900" },
								]}
								onChange={(value) => setAttributes({ ctaButtonFontWeight: value })}
							/>

							<RangeControl
								label={__("Blur Amount (px)", "adaire-blocks")}
								value={ctaButtonBlurAmount}
								onChange={(value) => setAttributes({ ctaButtonBlurAmount: value })}
								min={0}
								max={20}
								step={1}
							/>

							<RangeControl
								label={__("Border Radius (px)", "adaire-blocks")}
								value={ctaButtonBorderRadius}
								onChange={(value) => setAttributes({ ctaButtonBorderRadius: value })}
								min={0}
								max={100}
							/>

							<SelectControl
								label={__("Hover Animation", "adaire-blocks")}
								value={ctaButtonHoverAnimation}
								options={[
									{ label: __("None", "adaire-blocks"), value: "none" },
									{ label: __("Slide Underline", "adaire-blocks"), value: "slide-underline" },
									{ label: __("Scale", "adaire-blocks"), value: "scale" },
									{ label: __("Bounce", "adaire-blocks"), value: "bounce" },
									{ label: __("Glow", "adaire-blocks"), value: "glow" },
									{ label: __("Shake", "adaire-blocks"), value: "shake" },
								]}
								onChange={(value) =>
									setAttributes({ ctaButtonHoverAnimation: value })
								}
							/>

							<BoxControl
								label={__("Button Padding", "adaire-blocks")}
								values={ctaButtonPadding}
								onChange={(value) => setAttributes({ ctaButtonPadding: value })}
								units={[
									{ value: "px", label: "px", default: 0 },
									{ value: "em", label: "em", default: 0 },
									{ value: "rem", label: "rem", default: 0 },
								]}
							/>

							<BoxControl
								label={__("Button Margin", "adaire-blocks")}
								values={ctaButtonMargin}
								onChange={(value) => setAttributes({ ctaButtonMargin: value })}
								units={[
									{ value: "px", label: "px", default: 0 },
									{ value: "em", label: "em", default: 0 },
									{ value: "rem", label: "rem", default: 0 },
								]}
							/>

							<h4 style={{ margin: "16px 0 8px", fontSize: "14px", fontWeight: 600 }}>
								{__("Scroll Overrides", "adaire-blocks")}
							</h4>

							<BaseControl
								label={__("Text Color (Scroll)", "adaire-blocks")}
							>
								<ColorPicker
									color={ctaButtonColorScroll || ctaButtonColor}
									onChangeComplete={handleSolidColorChange(
										"ctaButtonColorScroll",
									)}
									disableAlpha
								/>
							</BaseControl>

							<BaseControl
								label={__("Background Color (Scroll)", "adaire-blocks")}
							>
								<ColorPicker
									color={
										ctaButtonBackgroundColorScroll &&
										ctaButtonBackgroundColorScroll !== "transparent"
											? ctaButtonBackgroundColorScroll
											: ctaButtonBackgroundColor || "#000000"
									}
									onChangeComplete={handleAlphaColorChange(
										"ctaButtonBackgroundColorScroll",
									)}
									enableAlpha
								/>
								{ctaButtonBackgroundColorScroll &&
									ctaButtonBackgroundColorScroll !== "transparent" && (
										<Button
											isSmall
											isDestructive
											onClick={() =>
												setAttributes({
													ctaButtonBackgroundColorScroll: "transparent",
												})
											}
											style={{ marginTop: "8px" }}
										>
											{__("Clear Scroll Background", "adaire-blocks")}
										</Button>
									)}
							</BaseControl>

							<BaseControl
								label={__("Border Color (Scroll)", "adaire-blocks")}
							>
								<ColorPicker
									color={ctaButtonBorderColorScroll || ctaButtonBorderColor}
									onChangeComplete={handleSolidColorChange(
										"ctaButtonBorderColorScroll",
									)}
									disableAlpha
								/>
							</BaseControl>

							<BaseControl
								label={__("Hover Text Color (Scroll)", "adaire-blocks")}
							>
								<ColorPicker
									color={
										ctaButtonHoverColorScroll || ctaButtonHoverColor || "#ffffff"
									}
									onChangeComplete={handleSolidColorChange(
										"ctaButtonHoverColorScroll",
									)}
									disableAlpha
								/>
							</BaseControl>

							<BaseControl
								label={__("Hover Background (Scroll)", "adaire-blocks")}
							>
								<ColorPicker
									color={
										ctaButtonHoverBackgroundColorScroll &&
										ctaButtonHoverBackgroundColorScroll !== "transparent"
											? ctaButtonHoverBackgroundColorScroll
											: ctaButtonHoverBackgroundColor || "#000000"
									}
									onChangeComplete={handleAlphaColorChange(
										"ctaButtonHoverBackgroundColorScroll",
									)}
									enableAlpha
								/>
								{ctaButtonHoverBackgroundColorScroll &&
									ctaButtonHoverBackgroundColorScroll !== "transparent" &&
									(
										<Button
											isSmall
											isDestructive
											onClick={() =>
												setAttributes({
													ctaButtonHoverBackgroundColorScroll: "transparent",
												})
											}
											style={{ marginTop: "8px" }}
										>
											{__("Clear Scroll Hover Background", "adaire-blocks")}
										</Button>
									)}
							</BaseControl>

							<BaseControl
								label={__("Hover Border Color (Scroll)", "adaire-blocks")}
							>
								<ColorPicker
									color={
										ctaButtonHoverBorderColorScroll ||
										ctaButtonHoverBorderColor ||
										ctaButtonBorderColor
									}
									onChangeComplete={handleSolidColorChange(
										"ctaButtonHoverBorderColorScroll",
									)}
									disableAlpha
								/>
							</BaseControl>
						</>
					)}
				</PanelBody>

				{ctaButtonEnabled && (
					<PanelBody
						title={__("Mobile Menu Button", "adaire-blocks")}
						initialOpen={false}
					>
						<ToggleControl
							label={__("Use separate mobile styles", "adaire-blocks")}
							checked={ctaMobileUseSeparateStyles}
							onChange={(value) =>
								setAttributes({ ctaMobileUseSeparateStyles: value })
							}
							help={__(
								"Enable to override the desktop button colors, spacing, and effects for the mobile drawer.",
								"mega-menu-block",
							)}
						/>

						{ctaMobileUseSeparateStyles && (
							<>
								<ToggleControl
									label={__("Show icon on mobile", "adaire-blocks")}
									checked={ctaMobileButtonShowIcon !== false}
									onChange={(value) =>
										setAttributes({ ctaMobileButtonShowIcon: value })
									}
								/>

								<BaseControl
									label={__("Button Text Color", "adaire-blocks")}
								>
									<ColorPicker
										color={ctaMobileButtonColor}
										onChangeComplete={handleSolidColorChange(
											"ctaMobileButtonColor",
										)}
										disableAlpha
									/>
								</BaseControl>

								<BaseControl
									label={__("Button Background Color", "adaire-blocks")}
								>
									<ColorPicker
										color={
											ctaMobileButtonBackgroundColor &&
											ctaMobileButtonBackgroundColor !== "transparent"
												? ctaMobileButtonBackgroundColor
												: "#000000"
										}
										onChangeComplete={handleAlphaColorChange(
											"ctaMobileButtonBackgroundColor",
										)}
										enableAlpha
									/>
									{ctaMobileButtonBackgroundColor &&
										ctaMobileButtonBackgroundColor !== "transparent" && (
											<Button
												isSmall
												isDestructive
												onClick={() =>
													setAttributes({
														ctaMobileButtonBackgroundColor: "transparent",
													})
												}
												style={{ marginTop: "8px" }}
											>
												{__("Clear Background", "adaire-blocks")}
											</Button>
										)}
								</BaseControl>

								<BaseControl label={__("Border Color", "adaire-blocks")}>
									<ColorPicker
										color={ctaMobileButtonBorderColor}
										onChangeComplete={handleSolidColorChange(
											"ctaMobileButtonBorderColor",
										)}
										disableAlpha
									/>
								</BaseControl>

								<BaseControl
									label={__("Hover Text Color", "adaire-blocks")}
								>
									<ColorPicker
										color={ctaMobileButtonHoverColor}
										onChangeComplete={handleSolidColorChange(
											"ctaMobileButtonHoverColor",
										)}
										disableAlpha
									/>
								</BaseControl>

								<BaseControl
									label={__("Hover Background Color", "adaire-blocks")}
								>
									<ColorPicker
										color={
											ctaMobileButtonHoverBackgroundColor &&
											ctaMobileButtonHoverBackgroundColor !== "transparent"
												? ctaMobileButtonHoverBackgroundColor
												: "#000000"
										}
										onChangeComplete={handleAlphaColorChange(
											"ctaMobileButtonHoverBackgroundColor",
										)}
										enableAlpha
									/>
									{ctaMobileButtonHoverBackgroundColor &&
										ctaMobileButtonHoverBackgroundColor !==
											"transparent" && (
											<Button
												isSmall
												isDestructive
												onClick={() =>
													setAttributes({
														ctaMobileButtonHoverBackgroundColor: "transparent",
													})
												}
												style={{ marginTop: "8px" }}
											>
												{__("Clear Hover Background", "adaire-blocks")}
											</Button>
										)}
								</BaseControl>

								<BaseControl
									label={__("Hover Border Color", "adaire-blocks")}
								>
									<ColorPicker
										color={ctaMobileButtonHoverBorderColor}
										onChangeComplete={handleSolidColorChange(
											"ctaMobileButtonHoverBorderColor",
										)}
										disableAlpha
									/>
								</BaseControl>

								<RangeControl
									label={__("Font Size (px)", "adaire-blocks")}
									value={ctaMobileButtonFontSize}
									onChange={(value) =>
										setAttributes({ ctaMobileButtonFontSize: value })
									}
									min={12}
									max={40}
								/>

								<SelectControl
									label={__("Font Weight", "adaire-blocks")}
									value={ctaMobileButtonFontWeight}
									options={[
										{ label: __("Inherit desktop", "adaire-blocks"), value: "" },
										{ label: __("Thin (100)", "adaire-blocks"), value: "100" },
										{
											label: __("Extra Light (200)", "adaire-blocks"),
											value: "200",
										},
										{ label: __("Light (300)", "adaire-blocks"), value: "300" },
										{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
										{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
										{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
										{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
										{
											label: __("Extra Bold (800)", "adaire-blocks"),
											value: "800",
										},
										{ label: __("Black (900)", "adaire-blocks"), value: "900" },
									]}
									onChange={(value) =>
										setAttributes({ ctaMobileButtonFontWeight: value })
									}
								/>

								<RangeControl
									label={__("Border Radius (px)", "adaire-blocks")}
									value={ctaMobileButtonBorderRadius}
									onChange={(value) =>
										setAttributes({ ctaMobileButtonBorderRadius: value })
									}
									min={0}
									max={100}
								/>

								<RangeControl
									label={__("Border Width (px)", "adaire-blocks")}
									value={ctaMobileButtonBorderWidth}
									onChange={(value) =>
										setAttributes({ ctaMobileButtonBorderWidth: value })
									}
									min={0}
									max={10}
									step={1}
								/>

								<SelectControl
									label={__("Button Style", "adaire-blocks")}
									value={ctaMobileButtonStyle || "inherit"}
									options={[
										{ label: __("Match desktop", "adaire-blocks"), value: "inherit" },
										{ label: __("Underline", "adaire-blocks"), value: "underline" },
										{ label: __("Background Fill", "adaire-blocks"), value: "fill" },
										{ label: __("Border", "adaire-blocks"), value: "border" },
										{ label: __("Gradient", "adaire-blocks"), value: "gradient" },
										{ label: __("Glass Effect", "adaire-blocks"), value: "glass" },
									]}
									onChange={(value) =>
										setAttributes({ ctaMobileButtonStyle: value })
									}
								/>

								<SelectControl
									label={__("Hover Animation", "adaire-blocks")}
									value={ctaMobileButtonHoverAnimation || "inherit"}
									options={[
										{ label: __("Match desktop", "adaire-blocks"), value: "inherit" },
										{ label: __("None", "adaire-blocks"), value: "none" },
										{
											label: __("Slide Underline", "adaire-blocks"),
											value: "slide-underline",
										},
										{ label: __("Scale", "adaire-blocks"), value: "scale" },
										{ label: __("Bounce", "adaire-blocks"), value: "bounce" },
										{ label: __("Glow", "adaire-blocks"), value: "glow" },
										{ label: __("Shake", "adaire-blocks"), value: "shake" },
									]}
									onChange={(value) =>
										setAttributes({ ctaMobileButtonHoverAnimation: value })
									}
								/>

								<BoxControl
									label={__("Button Padding", "adaire-blocks")}
									values={ctaMobileButtonPadding}
									onChange={(value) =>
										setAttributes({ ctaMobileButtonPadding: value })
									}
									units={[
										{ value: "px", label: "px", default: 0 },
										{ value: "em", label: "em", default: 0 },
										{ value: "rem", label: "rem", default: 0 },
									]}
								/>
							</>
						)}
					</PanelBody>
				)}

				<PanelBody
					title={__("Logo Settings", "adaire-blocks")}
					initialOpen={true}
				>
					<BaseControl label={__("Logo", "adaire-blocks")}>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={(media) =>
									setAttributes({
										logoUrl: media.url,
										logoAlt: media.alt || "Logo",
									})
								}
								allowedTypes={["image"]}
								value={logoUrl}
								render={({ open }) => (
									<div>
										{logoUrl && (
											<div style={{ marginBottom: "8px" }}>
												<img
													src={logoUrl}
													alt={logoAlt}
													style={{ maxWidth: "100px", height: "auto" }}
												/>
											</div>
										)}
										<Button onClick={open} isSecondary>
											{logoUrl
												? __("Change Logo", "adaire-blocks")
												: __("Select Logo", "adaire-blocks")}
										</Button>
										{logoUrl && (
											<Button
												onClick={() =>
													setAttributes({ logoUrl: "", logoAlt: "Logo" })
												}
												isDestructive
												isSmall
												style={{ marginLeft: "8px" }}
											>
												{__("Remove", "adaire-blocks")}
											</Button>
										)}
									</div>
								)}
							/>
						</MediaUploadCheck>
					</BaseControl>
					<TextControl
						label={__("Logo Link URL", "adaire-blocks")}
						value={logoLinkUrl}
						onChange={(value) =>
							setAttributes({ logoLinkUrl: value || "/" })
						}
						help={__(
							"Set where the brand logo links to. Defaults to the site home.",
							"mega-menu-block",
						)}
					/>

					<RangeControl
						label={__("Logo Size", "adaire-blocks")}
						value={logoSize}
						onChange={(value) => setAttributes({ logoSize: value })}
						min={20}
						max={100}
						help={__(
							"Control the maximum height of the logo in pixels",
							"mega-menu-block",
						)}
					/>

					<h4 style={{ margin: "16px 0 8px", fontSize: "14px", fontWeight: 600 }}>
						{__("Logos (Optional)", "adaire-blocks")}
					</h4>

					<BaseControl label={__("Logo at Top", "adaire-blocks")}>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={(media) =>
									setAttributes({
										menuImageAtTop: media.url,
										menuImageAtTopAlt: media.alt || "Logo at Top",
									})
								}
								allowedTypes={["image"]}
								value={menuImageAtTop}
								render={({ open }) => (
									<div>
										{menuImageAtTop && (
											<div style={{ marginBottom: "8px" }}>
												<img
													src={menuImageAtTop}
													alt={menuImageAtTopAlt}
													style={{ maxWidth: "100px", height: "auto" }}
												/>
											</div>
										)}
										<Button onClick={open} isSecondary>
											{menuImageAtTop
												? __("Change Image", "adaire-blocks")
												: __("Select Image", "adaire-blocks")}
										</Button>
										{menuImageAtTop && (
											<Button
												onClick={() =>
													setAttributes({
														menuImageAtTop: "",
														menuImageAtTopAlt: "Logo at Top",
													})
												}
												isDestructive
												isSmall
												style={{ marginLeft: "8px" }}
											>
												{__("Remove", "adaire-blocks")}
											</Button>
										)}
									</div>
								)}
							/>
						</MediaUploadCheck>
					</BaseControl>

					<BaseControl label={__("Logo on Scroll", "adaire-blocks")}>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={(media) =>
									setAttributes({
										menuImageOnScroll: media.url,
										menuImageOnScrollAlt: media.alt || "Logo on Scroll",
									})
								}
								allowedTypes={["image"]}
								value={menuImageOnScroll}
								render={({ open }) => (
									<div>
										{menuImageOnScroll && (
											<div style={{ marginBottom: "8px" }}>
												<img
													src={menuImageOnScroll}
													alt={menuImageOnScrollAlt}
													style={{ maxWidth: "100px", height: "auto" }}
												/>
											</div>
										)}
										<Button onClick={open} isSecondary>
											{menuImageOnScroll
												? __("Change Image", "adaire-blocks")
												: __("Select Image", "adaire-blocks")}
										</Button>
										{menuImageOnScroll && (
											<Button
												onClick={() =>
													setAttributes({
														menuImageOnScroll: "",
														menuImageOnScrollAlt: "Logo on Scroll",
													})
												}
												isDestructive
												isSmall
												style={{ marginLeft: "8px" }}
											>
												{__("Remove", "adaire-blocks")}
											</Button>
										)}
									</div>
								)}
							/>
						</MediaUploadCheck>
					</BaseControl>

					<RangeControl
						label={__("Logo Size", "adaire-blocks")}
						value={menuImageSize}
						onChange={(value) => setAttributes({ menuImageSize: value })}
						min={20}
						max={100}
						help={__(
							"Control the maximum height of the Logos in pixels",
							"mega-menu-block",
						)}
					/>
				</PanelBody>

				<PanelBody
					title={__("Menu Items", "adaire-blocks")}
					initialOpen={true}
				>
					<SelectControl
						label={__("Navigation Source", "adaire-blocks")}
						value={navigationSource || "legacy"}
						options={navigationSourceOptions}
						onChange={(v) => setAttributes({ navigationSource: v })}
						help={__(
							"Pull items live from a WordPress menu, or enter them manually below.",
							"mega-menu-block",
						)}
					/>
					{navigationSource === "menu" && (
						<SelectControl
							label={__("Menu", "adaire-blocks")}
							value={selectedMenuId || 0}
							options={[
								{ label: __("Select a menu…", "adaire-blocks"), value: 0 },
								...(resolvedMenuStatus.menus || []).map((menu) => ({
									label: menu.name,
									value: menu.id,
								})),
							]}
							onChange={(v) => setAttributes({ selectedMenuId: Number(v) })}
						/>
					)}
					{isUsingWpMenu && (
						<p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
							{resolvedMenuStatus.isLoading
								? __("Loading menu…", "adaire-blocks")
								: resolvedMenuStatus.hasMenu
									? sprintf(
											__(
												'Connected to "%s" — items are pulled live from this WordPress menu and shown on the live site. This editor preview does not re-render them; check the live page to see the result.',
												"mega-menu-block",
											),
											resolvedMenuStatus.menuName,
										)
									: navigationSource === "menu"
										? __(
												"No menu selected yet — choose one above.",
												"mega-menu-block",
											)
										: __(
												"No menu assigned to this location yet — assign one under Appearance → Menus.",
												"mega-menu-block",
											)}
						</p>
					)}

					{(!navigationSource || navigationSource === "legacy") && (
						<>
							<p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
								{__(
									"Maximum 3 hierarchy levels supported: Main Menu → Sub Menu → Sub Sub Menu",
									"mega-menu-block",
								)}
							</p>
							<Button
								isPrimary
								onClick={() => addMenuItem()}
								disabled={isLimitReached}
								icon={plus}
							>
								{__("Add Menu Item", "adaire-blocks")}
							</Button>
							{showUpgradeNotice && <UpgradeNotice message={upgradeMessage} />}
							<div
								style={{ marginTop: "16px", maxHeight: "400px", overflowY: "auto" }}
							>
								{menuItems.map((item) => renderMenuItem(item))}
							</div>
						</>
					)}
				</PanelBody>

				<PanelBody title={__("Colors", "adaire-blocks")} initialOpen={false}>
					<BaseControl label={__("Background Color", "adaire-blocks")}>
						<ColorPalette
							value={backgroundColor}
							onChange={(value) => setAttributes({ backgroundColor: value })}
						/>
					</BaseControl>

					<BaseControl label={__("Underline Color", "adaire-blocks")}>
						<ColorPalette
							value={underlineColor}
							onChange={(value) => setAttributes({ underlineColor: value })}
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody
					title={__("Mobile Menu", "adaire-blocks")}
					initialOpen={false}
				>
					<ToggleControl
						label={__("Immersive Mode", "adaire-blocks")}
						checked={mobileImmersiveMode}
						onChange={(value) => setAttributes({ mobileImmersiveMode: value })}
						help={__(
							"Enable full-screen mobile menu with enhanced styling",
							"mega-menu-block",
						)}
					/>

					{mobileImmersiveMode && (
						<>
							<h4
								style={{ margin: "16px 0 8px", fontSize: "14px", fontWeight: 600 }}
							>
								{__("Immersive Background", "adaire-blocks")}
							</h4>
							<SelectControl
								label={__("Background Type", "adaire-blocks")}
								value={mobileImmersiveBgType}
								options={[
									{ label: __("Solid Color", "adaire-blocks"), value: "solid" },
									{ label: __("Gradient", "adaire-blocks"), value: "gradient" },
									{ label: __("Image", "adaire-blocks"), value: "image" },
									{
										label: __("Image with Overlay", "adaire-blocks"),
										value: "image-overlay",
									},
								]}
								onChange={(value) =>
									setAttributes({ mobileImmersiveBgType: value })
								}
							/>

							{mobileImmersiveBgType === "solid" && (
								<BaseControl label={__("Background Color", "adaire-blocks")}>
									<ColorPalette
										value={mobileImmersiveBgColor}
										onChange={(value) =>
											setAttributes({ mobileImmersiveBgColor: value })
										}
									/>
								</BaseControl>
							)}

							{mobileImmersiveBgType === "gradient" && (
								<>
									<SelectControl
										label={__("Gradient Type", "adaire-blocks")}
										value={mobileImmersiveGradientType}
										options={[
											{ label: __("Linear", "adaire-blocks"), value: "linear" },
											{ label: __("Radial", "adaire-blocks"), value: "radial" },
										]}
										onChange={(value) =>
											setAttributes({ mobileImmersiveGradientType: value })
										}
									/>
									{mobileImmersiveGradientType === "linear" && (
										<RangeControl
											label={__("Gradient Angle", "adaire-blocks")}
											value={mobileImmersiveGradientAngle}
											onChange={(value) =>
												setAttributes({ mobileImmersiveGradientAngle: value })
											}
											min={0}
											max={360}
											step={1}
										/>
									)}
									<BaseControl
										label={__("Gradient Start Color", "adaire-blocks")}
									>
										<ColorPalette
											value={mobileImmersiveGradientColor1}
											onChange={(value) =>
												setAttributes({
													mobileImmersiveGradientColor1: value,
												})
											}
										/>
									</BaseControl>
									<BaseControl label={__("Gradient End Color", "adaire-blocks")}>
										<ColorPalette
											value={mobileImmersiveGradientColor2}
											onChange={(value) =>
												setAttributes({
													mobileImmersiveGradientColor2: value,
												})
											}
										/>
									</BaseControl>
									<RangeControl
										label={__("Start Stop (%)", "adaire-blocks")}
										value={mobileImmersiveGradientStartStop}
										onChange={(value) =>
											setAttributes({
												mobileImmersiveGradientStartStop: value,
											})
										}
										min={0}
										max={100}
										step={1}
									/>
									<RangeControl
										label={__("End Stop (%)", "adaire-blocks")}
										value={mobileImmersiveGradientEndStop}
										onChange={(value) =>
											setAttributes({
												mobileImmersiveGradientEndStop: value,
											})
										}
										min={0}
										max={100}
										step={1}
									/>
								</>
							)}

							{(mobileImmersiveBgType === "image" ||
								mobileImmersiveBgType === "image-overlay") && (
								<>
									<BaseControl label={__("Background Image", "adaire-blocks")}>
										<MediaUploadCheck>
											<MediaUpload
												onSelect={(media) =>
													setAttributes({
														mobileImmersiveBgImage: media.url,
													})
												}
												allowedTypes={["image"]}
												value={mobileImmersiveBgImage}
												render={({ open }) => (
													<div>
														{mobileImmersiveBgImage && (
															<img
																src={mobileImmersiveBgImage}
																alt=""
																style={{
																	maxWidth: "100%",
																	height: "auto",
																	marginBottom: "10px",
																}}
															/>
														)}
														<Button onClick={open} variant="secondary">
															{mobileImmersiveBgImage
																? __("Replace Image", "adaire-blocks")
																: __("Select Image", "adaire-blocks")}
														</Button>
														{mobileImmersiveBgImage && (
															<Button
																onClick={() =>
																	setAttributes({
																		mobileImmersiveBgImage: "",
																	})
																}
																variant="link"
																isDestructive
																style={{ marginLeft: "10px" }}
															>
																{__("Remove", "adaire-blocks")}
															</Button>
														)}
													</div>
												)}
											/>
										</MediaUploadCheck>
									</BaseControl>
									{mobileImmersiveBgImage && (
										<>
											<SelectControl
												label={__("Image Size", "adaire-blocks")}
												value={mobileImmersiveBgImageSize}
												options={[
													{ label: __("Cover", "adaire-blocks"), value: "cover" },
													{ label: __("Contain", "adaire-blocks"), value: "contain" },
													{ label: __("Auto", "adaire-blocks"), value: "auto" },
												]}
												onChange={(value) =>
													setAttributes({
														mobileImmersiveBgImageSize: value,
													})
												}
											/>
											<SelectControl
												label={__("Image Position", "adaire-blocks")}
												value={mobileImmersiveBgImagePosition}
												options={[
													{
														label: __("Center Center", "adaire-blocks"),
														value: "center center",
													},
													{
														label: __("Top Left", "adaire-blocks"),
														value: "top left",
													},
													{
														label: __("Top Center", "adaire-blocks"),
														value: "top center",
													},
													{
														label: __("Top Right", "adaire-blocks"),
														value: "top right",
													},
													{
														label: __("Center Left", "adaire-blocks"),
														value: "center left",
													},
													{
														label: __("Center Right", "adaire-blocks"),
														value: "center right",
													},
													{
														label: __("Bottom Left", "adaire-blocks"),
														value: "bottom left",
													},
													{
														label: __("Bottom Center", "adaire-blocks"),
														value: "bottom center",
													},
													{
														label: __("Bottom Right", "adaire-blocks"),
														value: "bottom right",
													},
												]}
												onChange={(value) =>
													setAttributes({
														mobileImmersiveBgImagePosition: value,
													})
												}
											/>
										</>
									)}
								</>
							)}

							{mobileImmersiveBgType === "image-overlay" && mobileImmersiveBgImage && (
								<>
									<h4
										style={{
											margin: "16px 0 8px",
											fontSize: "14px",
											fontWeight: 600,
										}}
									>
										{__("Overlay Settings", "adaire-blocks")}
									</h4>
									<BaseControl label={__("Overlay Color", "adaire-blocks")}>
										<ColorPalette
											value={mobileImmersiveOverlayColor}
											onChange={(value) =>
												setAttributes({ mobileImmersiveOverlayColor: value })
											}
										/>
									</BaseControl>
									<RangeControl
										label={__("Overlay Opacity", "adaire-blocks")}
										value={mobileImmersiveOverlayOpacity}
										onChange={(value) =>
											setAttributes({ mobileImmersiveOverlayOpacity: value })
										}
										min={0}
										max={1}
										step={0.1}
										help={__(
											"0 = transparent, 1 = opaque",
											"mega-menu-block",
										)}
									/>
								</>
							)}

							<h4
								style={{
									margin: "16px 0 8px",
									fontSize: "14px",
									fontWeight: 600,
								}}
							>
								{__("Button Row Settings", "adaire-blocks")}
							</h4>
							<RangeControl
								label={__("Icon Size", "adaire-blocks")}
								value={mobileImmersiveIconSize}
								onChange={(value) =>
									setAttributes({ mobileImmersiveIconSize: value })
								}
								min={16}
								max={48}
								step={1}
							/>
							<BaseControl label={__("Icon Color", "adaire-blocks")}>
								<ColorPalette
									value={mobileImmersiveIconColor}
									onChange={(value) =>
										setAttributes({ mobileImmersiveIconColor: value })
									}
								/>
							</BaseControl>
							<BaseControl
								label={__("Button Row Padding", "adaire-blocks")}
							>
								<BoxControl
									values={
										mobileImmersiveButtonRowPadding
											? {
													top:
														typeof mobileImmersiveButtonRowPadding.top ===
														"number"
															? `${mobileImmersiveButtonRowPadding.top}px`
															: mobileImmersiveButtonRowPadding.top || "0px",
													right:
														typeof mobileImmersiveButtonRowPadding.right ===
														"number"
															? `${mobileImmersiveButtonRowPadding.right}px`
															: mobileImmersiveButtonRowPadding.right || "0px",
													bottom:
														typeof mobileImmersiveButtonRowPadding.bottom ===
														"number"
															? `${mobileImmersiveButtonRowPadding.bottom}px`
															: mobileImmersiveButtonRowPadding.bottom || "32px",
													left:
														typeof mobileImmersiveButtonRowPadding.left ===
														"number"
															? `${mobileImmersiveButtonRowPadding.left}px`
															: mobileImmersiveButtonRowPadding.left || "0px",
											  }
											: {
													top: "0px",
													right: "0px",
													bottom: "32px",
													left: "0px",
											  }
									}
									onChange={(value) => {
										// Normalize values - extract numbers and store as numbers
										const normalizeValue = (val) => {
											if (typeof val === "number") {
												return val;
											}
											if (typeof val === "string") {
												const num = parseFloat(val.replace(/[^0-9.-]/g, ""));
												return isNaN(num) ? 0 : num;
											}
											return 0;
										};
										setAttributes({
											mobileImmersiveButtonRowPadding: {
												top: normalizeValue(value.top),
												right: normalizeValue(value.right),
												bottom: normalizeValue(value.bottom),
												left: normalizeValue(value.left),
											},
										});
									}}
									units={[
										{ value: "px", label: "px" },
										{ value: "em", label: "em" },
										{ value: "rem", label: "rem" },
									]}
								/>
							</BaseControl>
						</>
					)}

					{!mobileImmersiveMode && (
						<BaseControl label={__("Background Color", "adaire-blocks")}>
							<ColorPalette
								value={mobileMenuBgColor}
								onChange={(value) => setAttributes({ mobileMenuBgColor: value })}
							/>
						</BaseControl>
					)}

				

					<BaseControl
						label={__("Menu Item Hover Background Color", "adaire-blocks")}
					>
						<ColorPalette
							value={mobileMenuItemHoverBgColor}
							onChange={(value) =>
								setAttributes({ mobileMenuItemHoverBgColor: value })
							}
						/>
					</BaseControl>

					<h4
						style={{ margin: "16px 0 8px", fontSize: "14px", fontWeight: 600 }}
					>
						{__("Chevron Settings", "adaire-blocks")}
					</h4>
					<RangeControl
						label={__("Chevron Size", "adaire-blocks")}
						value={mobileChevronSize}
						onChange={(value) => setAttributes({ mobileChevronSize: value })}
						min={12}
						max={32}
					/>
					<BaseControl label={__("Chevron Color", "adaire-blocks")}>
						<ColorPalette
							value={mobileChevronColor}
							onChange={(value) => setAttributes({ mobileChevronColor: value })}
						/>
					</BaseControl>

					<BaseControl label={__("Hamburger Icon Color", "adaire-blocks")}>
						<ColorPalette
							value={mobileMenuIconColor}
							onChange={(value) => setAttributes({ mobileMenuIconColor: value })}
						/>
					</BaseControl>

					<BaseControl
						label={__("Hamburger Icon Color (Scroll)", "adaire-blocks")}
					>
						<ColorPalette
							value={mobileMenuIconColorScroll || mobileMenuIconColor}
							onChange={(value) =>
								setAttributes({ mobileMenuIconColorScroll: value })
							}
						/>
					</BaseControl>

					<h4 style={{ margin: "8px 0", fontSize: "14px", fontWeight: 600 }}>
						{__("Level 1 Typography", "adaire-blocks")}
					</h4>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={mobileLevel1FontSize}
						onChange={(value) => setAttributes({ mobileLevel1FontSize: value })}
						min={8}
						max={28}
					/>
					<SelectControl
						label={__("Font Weight", "adaire-blocks")}
						value={mobileLevel1FontWeight}
						options={[
							{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
							{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
							{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
							{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
							{
								label: __("Extra Bold (800)", "adaire-blocks"),
								value: "800",
							},
						]}
						onChange={(value) =>
							setAttributes({ mobileLevel1FontWeight: value })
						}
					/>
					<BaseControl label={__("Font Color", "adaire-blocks")}>
						<ColorPalette
							value={mobileLevel1FontColor}
							onChange={(value) =>
								setAttributes({ mobileLevel1FontColor: value })
							}
						/>
					</BaseControl>

					<h4
						style={{ margin: "16px 0 8px", fontSize: "14px", fontWeight: 600 }}
					>
						{__("Level 2 Typography", "adaire-blocks")}
					</h4>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={mobileLevel2FontSize}
						onChange={(value) => setAttributes({ mobileLevel2FontSize: value })}
						min={8}
						max={26}
					/>
					<SelectControl
						label={__("Font Weight", "adaire-blocks")}
						value={mobileLevel2FontWeight}
						options={[
							{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
							{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
							{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
							{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
						]}
						onChange={(value) =>
							setAttributes({ mobileLevel2FontWeight: value })
						}
					/>
					<BaseControl label={__("Font Color", "adaire-blocks")}>
						<ColorPalette
							value={mobileLevel2FontColor}
							onChange={(value) =>
								setAttributes({ mobileLevel2FontColor: value })
							}
						/>
					</BaseControl>

					<h4
						style={{ margin: "16px 0 8px", fontSize: "14px", fontWeight: 600 }}
					>
						{__("Level 3 Typography", "adaire-blocks")}
					</h4>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={mobileLevel3FontSize}
						onChange={(value) => setAttributes({ mobileLevel3FontSize: value })}
						min={8}
						max={24}
					/>
					<SelectControl
						label={__("Font Weight", "adaire-blocks")}
						value={mobileLevel3FontWeight}
						options={[
							{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
							{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
							{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
							{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
						]}
						onChange={(value) =>
							setAttributes({ mobileLevel3FontWeight: value })
						}
					/>
					<BaseControl label={__("Font Color", "adaire-blocks")}>
						<ColorPalette
							value={mobileLevel3FontColor}
							onChange={(value) =>
								setAttributes({ mobileLevel3FontColor: value })
							}
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody title={__("Layout", "adaire-blocks")} initialOpen={false}>
					<RangeControl
						label={__("Menu Border Radius", "adaire-blocks")}
						value={menuBorderRadius}
						onChange={(value) => setAttributes({ menuBorderRadius: value })}
						min={0}
						max={50}
						help={__(
							"Control the border radius of the navigation menu",
							"mega-menu-block",
						)}
					/>
					<RangeControl
						label={__("Dropdown Offset (px)", "adaire-blocks")}
						value={menuDropdownOffset}
						onChange={(value) => setAttributes({ menuDropdownOffset: value })}
						min={0}
						max={200}
						help={__(
							"Adjust the distance between level 1 items and the mega menu panel",
							"mega-menu-block",
						)}
					/>
					<ToggleControl
						label={__("Sticky Menu", "adaire-blocks")}
						checked={isSticky}
						onChange={(value) => setAttributes({ isSticky: value })}
						help={__(
							"Make the menu stick to the top when scrolling",
							"mega-menu-block",
						)}
					/>

					<ToggleControl
						label={__("Increase Opacity on Scroll", "adaire-blocks")}
						checked={increaseOpacity}
						onChange={(value) => setAttributes({ increaseOpacity: value })}
						help={__(
							"When enabled, the menu background will become more opaque as you scroll down.",
							"mega-menu-block",
						)}
					/>
					{increaseOpacity && (
						<>
							<BaseControl
								label={__("Scroll Background Color", "adaire-blocks")}
							>
								<ColorPalette
									value={scrollBackgroundColor}
									onChange={(value) =>
										setAttributes({ scrollBackgroundColor: value })
									}
									disableCustomColors={false}
									clearable={false}
								/>
							</BaseControl>

							<BaseControl
								label={__("Menu items color at top", "adaire-blocks")}
								initialOpen={false}
							>
								<ColorPalette
									value={menuItemsColorTop}
									onChange={(value) =>
										setAttributes({ menuItemsColorTop: value })
									}
									disableCustomColors={false}
									clearable={false}
								/>
							</BaseControl>
							<BaseControl
								label={__("Menu items color on scroll", "adaire-blocks")}
								initialOpen={false}
							>
								<ColorPalette
									value={menuItemsColorScroll}
									onChange={(value) =>
										setAttributes({ menuItemsColorScroll: value })
									}
									disableCustomColors={false}
									clearable={false}
								/>
							</BaseControl>

							<BaseControl
								label={__("Underline color at top", "adaire-blocks")}
							>
								<ColorPalette
									value={menuItemsUnderlineColorTop}
									onChange={(value) =>
										setAttributes({ menuItemsUnderlineColorTop: value })
									}
									disableCustomColors={false}
									clearable={false}
								/>
							</BaseControl>

							<BaseControl
								label={__("Underline color on scroll", "adaire-blocks")}
							>
								<ColorPalette
									value={menuItemsUnderlineColorScroll}
									onChange={(value) =>
										setAttributes({ menuItemsUnderlineColorScroll: value })
									}
									disableCustomColors={false}
									clearable={false}
								/>
							</BaseControl>
						</>
					)}

					<ToggleControl
						label={__("Persistent Canvas Mode", "adaire-blocks")}
						checked={keepCanvasOpenOnClick}
						onChange={(value) => setAttributes({ keepCanvasOpenOnClick: value })}
						help={__(
							"Keep dropdown canvases open after hover so visitors can move into the panel without holding the cursor on the trigger.",
							"mega-menu-block",
						)}
					/>
				</PanelBody>

				<PanelBody
					title={__("Canvas Banner", "adaire-blocks")}
					initialOpen={false}
				>
					<RangeControl
						label={__("Panel Gap (px)", "adaire-blocks")}
						value={menuPanelGap}
						onChange={(value) => setAttributes({ menuPanelGap: value })}
						min={0}
						max={80}
					/>
					<RangeControl
						label={__("Panel Padding Bottom (px)", "adaire-blocks")}
						value={menuPanelPaddingBottom}
						onChange={(value) =>
							setAttributes({ menuPanelPaddingBottom: value })
						}
						min={0}
						max={80}
					/>
					<BaseControl label={__("Banner Background Color", "adaire-blocks")}>
						<ColorPalette
							value={canvasBannerBackgroundColor}
							onChange={(value) =>
								setAttributes({ canvasBannerBackgroundColor: value })
							}
						/>
					</BaseControl>
					<RangeControl
						label={__("Banner Width (%)", "adaire-blocks")}
						value={canvasBannerWidth}
						onChange={(value) => setAttributes({ canvasBannerWidth: value })}
						min={40}
						max={100}
					/>
					<RangeControl
						label={__("Banner Padding Top (px)", "adaire-blocks")}
						value={canvasBannerPaddingTop}
						onChange={(value) =>
							setAttributes({ canvasBannerPaddingTop: value })
						}
						min={0}
						max={160}
					/>
					<RangeControl
						label={__("Banner Padding Bottom (px)", "adaire-blocks")}
						value={canvasBannerPaddingBottom}
						onChange={(value) =>
							setAttributes({ canvasBannerPaddingBottom: value })
						}
						min={0}
						max={160}
					/>
					<RangeControl
						label={__("Banner Padding Left (px)", "adaire-blocks")}
						value={canvasBannerPaddingLeft}
						onChange={(value) =>
							setAttributes({ canvasBannerPaddingLeft: value })
						}
						min={0}
						max={160}
					/>
					<RangeControl
						label={__("Banner Padding Right (px)", "adaire-blocks")}
						value={canvasBannerPaddingRight}
						onChange={(value) =>
							setAttributes({ canvasBannerPaddingRight: value })
						}
						min={0}
						max={160}
					/>
					<BaseControl label={__("Title Color", "adaire-blocks")}>
						<ColorPalette
							value={canvasBannerTitleColor}
							onChange={(value) =>
								setAttributes({ canvasBannerTitleColor: value })
							}
						/>
					</BaseControl>
					<RangeControl
						label={__("Title Font Size (px)", "adaire-blocks")}
						value={canvasBannerTitleFontSize}
						onChange={(value) =>
							setAttributes({ canvasBannerTitleFontSize: value })
						}
						min={12}
						max={80}
					/>
					<SelectControl
						label={__("Title Font Weight", "adaire-blocks")}
						value={canvasBannerTitleFontWeight}
						options={[
							{ label: __("Light (300)", "adaire-blocks"), value: "300" },
							{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
							{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
							{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
							{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
						]}
						onChange={(value) =>
							setAttributes({ canvasBannerTitleFontWeight: value })
						}
					/>
					<BaseControl label={__("Description Color", "adaire-blocks")}>
						<ColorPalette
							value={canvasBannerDescriptionColor}
							onChange={(value) =>
								setAttributes({ canvasBannerDescriptionColor: value })
							}
						/>
					</BaseControl>
					<RangeControl
						label={__("Description Font Size (px)", "adaire-blocks")}
						value={canvasBannerDescriptionFontSize}
						onChange={(value) =>
							setAttributes({ canvasBannerDescriptionFontSize: value })
						}
						min={10}
						max={60}
					/>
					<SelectControl
						label={__("Description Font Weight", "adaire-blocks")}
						value={canvasBannerDescriptionFontWeight}
						options={[
							{ label: __("Light (300)", "adaire-blocks"), value: "300" },
							{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
							{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
							{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
							{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
						]}
						onChange={(value) =>
							setAttributes({ canvasBannerDescriptionFontWeight: value })
						}
					/>
					<RangeControl
						label={__("List Padding Left (px)", "adaire-blocks")}
						value={canvasListPaddingLeft}
						onChange={(value) =>
							setAttributes({ canvasListPaddingLeft: value })
						}
						min={0}
						max={160}
					/>
					<RangeControl
						label={__("List Padding Right (px)", "adaire-blocks")}
						value={canvasListPaddingRight}
						onChange={(value) =>
							setAttributes({ canvasListPaddingRight: value })
						}
						min={0}
						max={160}
					/>
				</PanelBody>

				<PanelBody title={__("Spacing", "adaire-blocks")} initialOpen={false}>
					<RangeControl
						label={__("Padding Top", "adaire-blocks")}
						value={padding.top}
						onChange={(value) =>
							setAttributes({ padding: { ...padding, top: value } })
						}
						min={0}
						max={100}
					/>
					<RangeControl
						label={__("Padding Right", "adaire-blocks")}
						value={padding.right}
						onChange={(value) =>
							setAttributes({ padding: { ...padding, right: value } })
						}
						min={0}
						max={100}
					/>
					<RangeControl
						label={__("Padding Bottom", "adaire-blocks")}
						value={padding.bottom}
						onChange={(value) =>
							setAttributes({ padding: { ...padding, bottom: value } })
						}
						min={0}
						max={100}
					/>
					<RangeControl
						label={__("Padding Left", "adaire-blocks")}
						value={padding.left}
						onChange={(value) =>
							setAttributes({ padding: { ...padding, left: value } })
						}
						min={0}
						max={100}
					/>
					<RangeControl
						label={__("Margin Top", "adaire-blocks")}
						value={margin.top}
						onChange={(value) =>
							setAttributes({ margin: { ...margin, top: value } })
						}
						min={0}
						max={200}
					/>
					<RangeControl
						label={__("Margin Right", "adaire-blocks")}
						value={margin.right}
						onChange={(value) =>
							setAttributes({ margin: { ...margin, right: value } })
						}
						min={0}
						max={200}
					/>
					<RangeControl
						label={__("Margin Bottom", "adaire-blocks")}
						value={margin.bottom}
						onChange={(value) =>
							setAttributes({ margin: { ...margin, bottom: value } })
						}
						min={0}
						max={200}
					/>
					<RangeControl
						label={__("Margin Left", "adaire-blocks")}
						value={margin.left}
						onChange={(value) =>
							setAttributes({ margin: { ...margin, left: value } })
						}
						min={0}
						max={200}
					/>
				</PanelBody>

				{/* Level 1 Settings */}
				<PanelBody
					title={__("Level 1 Menu Settings", "adaire-blocks")}
					initialOpen={false}
				>
					<h4
						style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600" }}
					>
						{__("Font Settings", "adaire-blocks")}
					</h4>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={level1FontSize}
						onChange={(value) => setAttributes({ level1FontSize: value })}
						min={8}
						max={120}
					/>

					<SelectControl
						label={__("Font Weight", "adaire-blocks")}
						value={level1FontWeight}
						options={[
							{ label: __("Light (300)", "adaire-blocks"), value: "300" },
							{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
							{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
							{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
							{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
							{
								label: __("Extra Bold (800)", "adaire-blocks"),
								value: "800",
							},
						]}
						onChange={(value) => setAttributes({ level1FontWeight: value })}
					/>

					<BaseControl label={__("Font Color", "adaire-blocks")}>
						<ColorPalette
							value={level1FontColor}
							onChange={(value) => setAttributes({ level1FontColor: value })}
						/>
					</BaseControl>

					<BaseControl label={__("Hover Color", "adaire-blocks")}>
						<ColorPalette
							value={level1HoverColor}
							onChange={(value) => setAttributes({ level1HoverColor: value })}
						/>
					</BaseControl>

					<>
						<ToggleControl
							label={__("Show Hover Underline", "adaire-blocks")}
							checked={level1ShowHoverUnderline}
							onChange={(value) =>
								setAttributes({ level1ShowHoverUnderline: value })
							}
						/>

						<RangeControl
							label={__("Underline Width", "adaire-blocks")}
							value={level1UnderlineWidth}
							onChange={(value) =>
								setAttributes({ level1UnderlineWidth: value })
							}
							min={1}
							max={10}
						/>

						<BaseControl label={__("Underline Color", "adaire-blocks")}>
							<ColorPalette
								value={level1UnderlineColor}
								onChange={(value) =>
									setAttributes({ level1UnderlineColor: value })
								}
							/>
						</BaseControl>

						<RangeControl
							label={__("Underline Border Radius", "adaire-blocks")}
							value={level1UnderlineBorderRadius}
							onChange={(value) =>
								setAttributes({ level1UnderlineBorderRadius: value })
							}
							min={0}
							max={20}
						/>
					</>

					<h4
						style={{
							margin: "16px 0 8px 0",
							fontSize: "14px",
							fontWeight: "600",
						}}
					>
						{__("Hover Background", "adaire-blocks")}
					</h4>
					<BaseControl label={__("Hover Background Color", "adaire-blocks")}>
						<ColorPalette
							value={level1HoverBgColor}
							onChange={(value) =>
								setAttributes({ level1HoverBgColor: value ?? "transparent" })
							}
						/>
					</BaseControl>

					<h4
						style={{
							margin: "16px 0 8px 0",
							fontSize: "14px",
							fontWeight: "600",
						}}
					>
						{__("Hover Padding", "adaire-blocks")}
					</h4>
					<RangeControl
						label={__("Top Padding", "adaire-blocks")}
						value={level1HoverPadding?.top ?? 10}
						onChange={(value) =>
							setAttributes({
								level1HoverPadding: {
									...(level1HoverPadding || {}),
									top: value,
								},
							})
						}
						min={0}
						max={50}
					/>
					<RangeControl
						label={__("Right Padding", "adaire-blocks")}
						value={level1HoverPadding?.right ?? 5}
						onChange={(value) =>
							setAttributes({
								level1HoverPadding: {
									...(level1HoverPadding || {}),
									right: value,
								},
							})
						}
						min={0}
						max={50}
					/>
					<RangeControl
						label={__("Bottom Padding", "adaire-blocks")}
						value={level1HoverPadding?.bottom ?? 10}
						onChange={(value) =>
							setAttributes({
								level1HoverPadding: {
									...(level1HoverPadding || {}),
									bottom: value,
								},
							})
						}
						min={0}
						max={50}
					/>
					<RangeControl
						label={__("Left Padding", "adaire-blocks")}
						value={level1HoverPadding?.left ?? 5}
						onChange={(value) =>
							setAttributes({
								level1HoverPadding: {
									...(level1HoverPadding || {}),
									left: value,
								},
							})
						}
						min={0}
						max={50}
					/>

					<RangeControl
						label={__("Hover Border Radius", "adaire-blocks")}
						value={level1HoverBorderRadius ?? 0}
						onChange={(value) =>
							setAttributes({ level1HoverBorderRadius: value })
						}
						min={0}
						max={50}
					/>
				</PanelBody>

				{/* Level 2 Settings */}
				<PanelBody
					title={__("Level 2 Menu Settings", "adaire-blocks")}
					initialOpen={false}
				>
					<h4
						style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600" }}
					>
						{__("Font Settings", "adaire-blocks")}
					</h4>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={level2FontSize}
						onChange={(value) => setAttributes({ level2FontSize: value })}
						min={8}
						max={120}
					/>

					<SelectControl
						label={__("Font Weight", "adaire-blocks")}
						value={level2FontWeight}
						options={[
							{ label: __("Light (300)", "adaire-blocks"), value: "300" },
							{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
							{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
							{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
							{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
							{
								label: __("Extra Bold (800)", "adaire-blocks"),
								value: "800",
							},
						]}
						onChange={(value) => setAttributes({ level2FontWeight: value })}
					/>

					<BaseControl label={__("Font Color", "adaire-blocks")}>
						<ColorPalette
							value={level2FontColor}
							onChange={(value) => setAttributes({ level2FontColor: value })}
						/>
					</BaseControl>

					<h4
						style={{
							margin: "16px 0 8px 0",
							fontSize: "14px",
							fontWeight: "600",
						}}
					>
						{__("Hover Settings", "adaire-blocks")}
					</h4>
					<BaseControl label={__("Hover Color", "adaire-blocks")}>
						<ColorPalette
							value={level2HoverColor}
							onChange={(value) => setAttributes({ level2HoverColor: value })}
						/>
					</BaseControl>

					<ToggleControl
						label={__(
							"Enable Hover Text Color Transition",
							"mega-menu-block",
						)}
						help={__(
							"Applies the hover color to level 2 items with a 0.3s fade",
							"mega-menu-block",
						)}
						checked={level2HoverTextColorEnabled}
						onChange={(value) =>
							setAttributes({ level2HoverTextColorEnabled: value })
						}
					/>

					<ToggleControl
						label={__("Show Hover Underline", "adaire-blocks")}
						checked={level2ShowHoverUnderline}
						onChange={(value) =>
							setAttributes({ level2ShowHoverUnderline: value })
						}
					/>

					<BaseControl label={__("Hover Background Color", "adaire-blocks")}>
						<ColorPalette
							value={level2HoverBgColor}
							onChange={(value) => setAttributes({ level2HoverBgColor: value })}
						/>
					</BaseControl>

					<h4
						style={{
							margin: "16px 0 8px 0",
							fontSize: "14px",
							fontWeight: "600",
						}}
					>
						{__("Hover Padding", "adaire-blocks")}
					</h4>
					<RangeControl
						label={__("Top Padding", "adaire-blocks")}
						value={level2HoverPadding?.top || 8}
						onChange={(value) =>
							setAttributes({
								level2HoverPadding: {
									...level2HoverPadding,
									top: value,
								},
							})
						}
						min={0}
						max={50}
					/>
					<RangeControl
						label={__("Right Padding", "adaire-blocks")}
						value={level2HoverPadding?.right || 12}
						onChange={(value) =>
							setAttributes({
								level2HoverPadding: {
									...level2HoverPadding,
									right: value,
								},
							})
						}
						min={0}
						max={50}
					/>
					<RangeControl
						label={__("Bottom Padding", "adaire-blocks")}
						value={level2HoverPadding?.bottom || 8}
						onChange={(value) =>
							setAttributes({
								level2HoverPadding: {
									...level2HoverPadding,
									bottom: value,
								},
							})
						}
						min={0}
						max={50}
					/>
					<RangeControl
						label={__("Left Padding", "adaire-blocks")}
						value={level2HoverPadding?.left || 12}
						onChange={(value) =>
							setAttributes({
								level2HoverPadding: {
									...level2HoverPadding,
									left: value,
								},
							})
						}
						min={0}
						max={50}
					/>

					<RangeControl
						label={__("Sub-header Spacing (px)", "adaire-blocks")}
						value={level2HeaderSpacing ?? 16}
						onChange={(value) => setAttributes({ level2HeaderSpacing: value })}
						min={0}
						max={60}
					/>

				</PanelBody>

				{/* Level 3 Settings */}
				<PanelBody
					title={__("Level 3 Menu Settings", "adaire-blocks")}
					initialOpen={false}
				>
					<h4
						style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600" }}
					>
						{__("Font Settings", "adaire-blocks")}
					</h4>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={level3FontSize}
						onChange={(value) => setAttributes({ level3FontSize: value })}
						min={8}
						max={120}
					/>

					<SelectControl
						label={__("Font Weight", "adaire-blocks")}
						value={level3FontWeight}
						options={[
							{ label: __("Light (300)", "adaire-blocks"), value: "300" },
							{ label: __("Normal (400)", "adaire-blocks"), value: "400" },
							{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
							{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
							{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
							{
								label: __("Extra Bold (800)", "adaire-blocks"),
								value: "800",
							},
						]}
						onChange={(value) => setAttributes({ level3FontWeight: value })}
					/>

					<BaseControl label={__("Font Color", "adaire-blocks")}>
						<ColorPalette
							value={level3FontColor}
							onChange={(value) => setAttributes({ level3FontColor: value })}
						/>
					</BaseControl>

					<h4
						style={{
							margin: "16px 0 8px 0",
							fontSize: "14px",
							fontWeight: "600",
						}}
					>
						{__("Hover Settings", "adaire-blocks")}
					</h4>
					<BaseControl label={__("Hover Color", "adaire-blocks")}>
						<ColorPalette
							value={level3HoverColor}
							onChange={(value) => setAttributes({ level3HoverColor: value })}
						/>
					</BaseControl>

					<ToggleControl
						label={__("Show Hover Underline", "adaire-blocks")}
						checked={level3ShowHoverUnderline}
						onChange={(value) =>
							setAttributes({ level3ShowHoverUnderline: value })
						}
					/>

					{level3ShowHoverUnderline && (
						<>
							<RangeControl
								label={__("Underline Width", "adaire-blocks")}
								value={level3UnderlineWidth}
								onChange={(value) =>
									setAttributes({ level3UnderlineWidth: value })
								}
								min={1}
								max={10}
							/>

							<BaseControl label={__("Underline Color", "adaire-blocks")}>
								<ColorPalette
									value={level3UnderlineColor}
									onChange={(value) =>
										setAttributes({ level3UnderlineColor: value })
									}
								/>
							</BaseControl>
						</>
					)}

					<BaseControl label={__("Hover Background Color", "adaire-blocks")}>
						<ColorPalette
							value={level3HoverBgColor}
							onChange={(value) => setAttributes({ level3HoverBgColor: value })}
						/>
					</BaseControl>

					<h4
						style={{
							margin: "16px 0 8px 0",
							fontSize: "14px",
							fontWeight: "600",
						}}
					>
						{__("Hover Padding", "adaire-blocks")}
					</h4>
					<RangeControl
						label={__("Top Padding", "adaire-blocks")}
						value={level3HoverPadding?.top || 8}
						onChange={(value) =>
							setAttributes({
								level3HoverPadding: {
									...level3HoverPadding,
									top: value,
								},
							})
						}
						min={0}
						max={50}
					/>
					<RangeControl
						label={__("Right Padding", "adaire-blocks")}
						value={level3HoverPadding?.right || 12}
						onChange={(value) =>
							setAttributes({
								level3HoverPadding: {
									...level3HoverPadding,
									right: value,
								},
							})
						}
						min={0}
						max={50}
					/>
					<RangeControl
						label={__("Bottom Padding", "adaire-blocks")}
						value={level3HoverPadding?.bottom || 8}
						onChange={(value) =>
							setAttributes({
								level3HoverPadding: {
									...level3HoverPadding,
									bottom: value,
								},
							})
						}
						min={0}
						max={50}
					/>
					<RangeControl
						label={__("Left Padding", "adaire-blocks")}
						value={level3HoverPadding?.left || 12}
						onChange={(value) =>
							setAttributes({
								level3HoverPadding: {
									...level3HoverPadding,
									left: value,
								},
							})
						}
						min={0}
						max={50}
					/>

					<RangeControl
						label={__("Sub-item Spacing (px)", "adaire-blocks")}
						value={level3ItemSpacing ?? 8}
						onChange={(value) => setAttributes({ level3ItemSpacing: value })}
						min={0}
						max={40}
					/>

				</PanelBody>

				{/* Canvas Settings */}
				<PanelBody
					title={__("Canvas Settings", "adaire-blocks")}
					initialOpen={false}
				>
					<ToggleControl
						label={__("Show Canvas Title", "adaire-blocks")}
						checked={showCanvasTitle}
						onChange={(value) => setAttributes({ showCanvasTitle: value })}
					/>

					{showCanvasTitle && (
						<>
							<RangeControl
								label={__("Canvas Font Size", "adaire-blocks")}
								value={canvasFontSize}
								onChange={(value) => setAttributes({ canvasFontSize: value })}
								min={8}
								max={120}
							/>

							<SelectControl
								label={__("Canvas Font Weight", "adaire-blocks")}
								value={canvasFontWeight}
								options={[
									{ label: __("Light (300)", "adaire-blocks"), value: "300" },
									{
										label: __("Normal (400)", "adaire-blocks"),
										value: "400",
									},
									{
										label: __("Medium (500)", "adaire-blocks"),
										value: "500",
									},
									{
										label: __("Semi Bold (600)", "adaire-blocks"),
										value: "600",
									},
									{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
									{
										label: __("Extra Bold (800)", "adaire-blocks"),
										value: "800",
									},
								]}
								onChange={(value) => setAttributes({ canvasFontWeight: value })}
							/>

							<BaseControl label={__("Canvas Font Color", "adaire-blocks")}>
								<ColorPalette
									value={canvasFontColor}
									onChange={(value) =>
										setAttributes({ canvasFontColor: value })
									}
								/>
							</BaseControl>
						</>
					)}

					<RangeControl
						label={__("Canvas Border Radius", "adaire-blocks")}
						value={menuCanvasBorderRadius}
						onChange={(value) =>
							setAttributes({ menuCanvasBorderRadius: value })
						}
						min={0}
						max={50}
						help={__(
							"Control the border radius of the dropdown menu",
							"mega-menu-block",
						)}
					/>
				</PanelBody>

				<PanelBody
					title={__("Canvas Story Styling", "adaire-blocks")}
					initialOpen={false}
				>
					<strong style={{ display: "block", marginBottom: "8px" }}>
						{__("Story Image", "adaire-blocks")}
					</strong>
					<RangeControl
						label={__("Border Radius", "adaire-blocks")}
						value={canvasImageBorderRadius}
						onChange={(value) =>
							setAttributes({ canvasImageBorderRadius: value })
						}
						min={0}
						max={50}
					/>

					<strong style={{ display: "block", marginBottom: "8px" }}>
						{__("Story Title", "adaire-blocks")}
					</strong>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={canvasStoryTitleFontSize}
						onChange={(value) => setAttributes({ canvasStoryTitleFontSize: value })}
						min={12}
						max={72}
					/>
					<SelectControl
						label={__("Font Weight", "adaire-blocks")}
						value={canvasStoryTitleFontWeight}
						options={[
							{ label: __("Light (300)", "adaire-blocks"), value: "300" },
							{ label: __("Regular (400)", "adaire-blocks"), value: "400" },
							{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
							{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
							{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
							{ label: __("Extra Bold (800)", "adaire-blocks"), value: "800" },
						]}
						onChange={(value) =>
							setAttributes({
								canvasStoryTitleFontWeight: value,
							})
						}
					/>
					<BaseControl label={__("Color", "adaire-blocks")}>
						<ColorPalette
							value={canvasStoryTitleColor}
							onChange={(value) => setAttributes({ canvasStoryTitleColor: value })}
						/>
					</BaseControl>
					<RangeControl
						label={__("Margin Top", "adaire-blocks")}
						value={canvasStoryTitleMarginTop}
						onChange={(value) =>
							setAttributes({ canvasStoryTitleMarginTop: value })
						}
						min={-100}
						max={200}
					/>
					<RangeControl
						label={__("Margin Bottom", "adaire-blocks")}
						value={canvasStoryTitleMarginBottom}
						onChange={(value) =>
							setAttributes({ canvasStoryTitleMarginBottom: value })
						}
						min={-100}
						max={200}
					/>

					<strong style={{ display: "block", margin: "16px 0 8px" }}>
						{__("Story Description", "adaire-blocks")}
					</strong>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={canvasStoryDescriptionFontSize}
						onChange={(value) =>
							setAttributes({ canvasStoryDescriptionFontSize: value })
						}
						min={10}
						max={40}
					/>
					<SelectControl
						label={__("Font Weight", "adaire-blocks")}
						value={canvasStoryDescriptionFontWeight}
						options={[
							{ label: __("Regular (400)", "adaire-blocks"), value: "400" },
							{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
							{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
						]}
						onChange={(value) =>
							setAttributes({
								canvasStoryDescriptionFontWeight: value,
							})
						}
					/>
					<BaseControl label={__("Color", "adaire-blocks")}>
						<ColorPalette
							value={canvasStoryDescriptionColor}
							onChange={(value) =>
								setAttributes({ canvasStoryDescriptionColor: value })
							}
						/>
					</BaseControl>
					<RangeControl
						label={__("Margin Top", "adaire-blocks")}
						value={canvasStoryDescriptionMarginTop}
						onChange={(value) =>
							setAttributes({ canvasStoryDescriptionMarginTop: value })
						}
						min={-100}
						max={200}
					/>
					<RangeControl
						label={__("Margin Bottom", "adaire-blocks")}
						value={canvasStoryDescriptionMarginBottom}
						onChange={(value) =>
							setAttributes({ canvasStoryDescriptionMarginBottom: value })
						}
						min={-100}
						max={200}
					/>

					<strong style={{ display: "block", margin: "16px 0 8px" }}>
						{__("Learn More Link", "adaire-blocks")}
					</strong>
					<RangeControl
						label={__("Font Size", "adaire-blocks")}
						value={canvasStoryLinkFontSize}
						onChange={(value) =>
							setAttributes({ canvasStoryLinkFontSize: value })
						}
						min={10}
						max={32}
					/>
					<SelectControl
						label={__("Font Weight", "adaire-blocks")}
						value={canvasStoryLinkFontWeight}
						options={[
							{ label: __("Regular (400)", "adaire-blocks"), value: "400" },
							{ label: __("Medium (500)", "adaire-blocks"), value: "500" },
							{ label: __("Semi Bold (600)", "adaire-blocks"), value: "600" },
							{ label: __("Bold (700)", "adaire-blocks"), value: "700" },
						]}
						onChange={(value) =>
							setAttributes({
								canvasStoryLinkFontWeight: value,
							})
						}
					/>
					<BaseControl label={__("Color", "adaire-blocks")}>
						<ColorPalette
							value={canvasStoryLinkColor}
							onChange={(value) =>
								setAttributes({ canvasStoryLinkColor: value })
							}
						/>
					</BaseControl>
					<BaseControl label={__("Hover Color", "adaire-blocks")}>
						<ColorPalette
							value={canvasStoryLinkHoverColor}
							onChange={(value) =>
								setAttributes({ canvasStoryLinkHoverColor: value })
							}
						/>
					</BaseControl>
					<BaseControl label={__("Underline Color", "adaire-blocks")}>
						<ColorPalette
							value={canvasStoryLinkUnderlineColor}
							onChange={(value) =>
								setAttributes({ canvasStoryLinkUnderlineColor: value })
							}
						/>
					</BaseControl>
					<RangeControl
						label={__("Underline Thickness", "adaire-blocks")}
						value={canvasStoryLinkUnderlineHeight ?? 2}
						onChange={(value) =>
							setAttributes({ canvasStoryLinkUnderlineHeight: value })
						}
						min={1}
						max={8}
					/>
					<RangeControl
						label={__("Underline Radius", "adaire-blocks")}
						value={canvasStoryLinkUnderlineBorderRadius ?? 0}
						onChange={(value) =>
							setAttributes({ canvasStoryLinkUnderlineBorderRadius: value })
						}
						min={0}
						max={12}
					/>
					<RangeControl
						label={__("Margin Top", "adaire-blocks")}
						value={canvasStoryLinkMarginTop}
						onChange={(value) =>
							setAttributes({ canvasStoryLinkMarginTop: value })
						}
						min={-100}
						max={200}
					/>
					<RangeControl
						label={__("Margin Bottom", "adaire-blocks")}
						value={canvasStoryLinkMarginBottom}
						onChange={(value) =>
							setAttributes({ canvasStoryLinkMarginBottom: value })
						}
						min={-100}
						max={200}
					/>

					<div style={{ marginTop: "16px" }}>
						<ToggleControl
							label={__("Show Divider", "adaire-blocks")}
							checked={canvasStoryDividerEnabled}
							help={__(
								"Divider width, height, color and alpha controls live directly below this toggle.",
								"mega-menu-block",
							)}
							onChange={(value) =>
								setAttributes({ canvasStoryDividerEnabled: value })
							}
						/>

						{canvasStoryDividerEnabled && (
							<>
								<RangeControl
									label={__("Divider Width (px)", "adaire-blocks")}
									value={canvasStoryDividerWidth}
									onChange={(value) =>
										setAttributes({ canvasStoryDividerWidth: value })
									}
									min={1}
									max={12}
								/>
								<RangeControl
									label={__("Divider Height (%)", "adaire-blocks")}
									value={canvasStoryDividerHeight}
									onChange={(value) =>
										setAttributes({ canvasStoryDividerHeight: value })
									}
									min={10}
									max={100}
								/>
								<BaseControl label={__("Divider Color", "adaire-blocks")}>
									<ColorPalette
										value={canvasStoryDividerColor}
										onChange={(value) =>
											setAttributes({ canvasStoryDividerColor: value })
										}
									/>
								</BaseControl>
								<RangeControl
									label={__("Divider Alpha", "adaire-blocks")}
									value={canvasStoryDividerAlpha}
									onChange={(value) =>
										setAttributes({ canvasStoryDividerAlpha: value })
									}
									min={0}
									max={1}
									step={0.05}
								/>
							</>
						)}
					</div>
				</PanelBody>
			</InspectorControls>

			<div
				{...blockProps}
				data-block-id={blockId}
				data-sticky={isSticky}
				data-keep-canvas-open={keepCanvasOpenOnClick}
			>
				<div
					className={`adaire-mega-menu__container ${
						containerMode === "constrained" ? "is-constrained" : ""
					}`}
				>
					{ribbonEnabled && (
						<div className="adaire-mega-menu__ribbon">
							<div className="adaire-mega-menu__ribbon-content">
								<span className="adaire-mega-menu__ribbon-text">{ribbonText}</span>
								{ribbonLinkUrl && (
									<a
										className="adaire-mega-menu__ribbon-link"
										href={ribbonLinkUrl}
										target={ribbonLinkOpenInNewTab ? "_blank" : undefined}
										rel={ribbonLinkOpenInNewTab ? "noopener noreferrer" : undefined}
									>
										<span className="adaire-mega-menu__ribbon-link-label">
											{ribbonLinkLabel || __("Learn more", "adaire-blocks")}
										</span>
										{ribbonLinkArrowEnabled && (
											<span
												className="adaire-mega-menu__ribbon-link-arrow"
												aria-hidden="true"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M5 12h14M13 6l6 6-6 6" />
												</svg>
											</span>
										)}
									</a>
								)}
							</div>
						</div>
					)}

					<nav
						className={`adaire-mega-menu__navbar  ${
							containerMode === "constrained" ? "is-constrained" : ""
						}
						${containerMode === "constrained" && centerMenu ? "center-menu" : ""}
						`}
						style={{
							borderRadius: `${menuBorderRadius}px`,
						}}
					>
					<div className="adaire-mega-menu__brand">
					<a
						className="adaire-mega-menu__brand-link"
						href={logoLinkUrl || "/"}
					>
						{/* Logos - show if set, regardless of increaseOpacity */}
						{menuImageAtTop && (
							<img
								src={menuImageAtTop}
								alt={menuImageAtTopAlt}
								className="adaire-mega-menu__menu-image adaire-mega-menu__menu-image--top"
								style={{
									'--mega-menu-image-size': `${menuImageSize}px`,
								}}
							/>
						)}
						{menuImageOnScroll && (
							<img
								src={menuImageOnScroll}
								alt={menuImageOnScrollAlt}
								className="adaire-mega-menu__menu-image adaire-mega-menu__menu-image--scroll"
								style={{
									'--mega-menu-image-size': `${menuImageSize}px`,
								}}
							/>
						)}
						{/* Logo - show if no Logos are set */}
						{!menuImageAtTop && !menuImageOnScroll && (
							<>
								{logoUrl ? (
									<img
										src={logoUrl}
										alt={logoAlt}
										className="adaire-mega-menu__logo"
									/>
								) : (
									<span className="adaire-mega-menu__brand-text">Brand</span>
								)}
							</>
						)}
					</a>
					</div>

						<div className="adaire-mega-menu__menu-container">
							<ul className="adaire-mega-menu__mega-menu">
								{menuItems.map((item) => {
									const storyTitle = item.canvasStoryTitle || "";
									const storyDescription = item.canvasStoryDescription || "";
									const storyLinkLabel = item.canvasStoryLinkLabel || "";
									const shouldRenderCanvasStory =
										item.canvasImageUrl ||
										storyTitle.trim().length > 0 ||
										storyDescription.trim().length > 0 ||
										storyLinkLabel.trim().length > 0;
									const shouldRenderCanvasBanner =
										item.canvasBannerEnabled !== false;

									return (
										<li key={item.id} className="adaire-mega-menu__dropdown">
										<div
											className="adaire-mega-menu__dropdown-header"
											onClick={() =>
												item.children &&
												item.children.length > 0 &&
												toggleDropdown(item.id)
											}
											style={{
												cursor:
													item.children && item.children.length > 0
														? "pointer"
														: "default",
												fontSize: `${getLevelColors(0).fontSize}px`,
												fontWeight: getLevelColors(0).fontWeight,
												"--item-hover-color": getLevelColors(0).hoverColor,
												"--item-underline-color":
													getLevelColors(0).underlineColor,
												"--item-underline-width": `${
													getLevelColors(0).underlineWidth
												}px`,
												"--item-underline-border-radius": `${
													getLevelColors(0).underlineBorderRadius
												}px`,
												"--item-underline-enabled": level1ShowHoverUnderline ? 1 : 0,
												"--item-color": getLevelColors(0).fontColor,
											}}
										>
											<span
												className={item.isBold ? "adaire-mega-menu__bold" : ""}
											>
												{item.title}
											</span>
											{item.children && item.children.length > 0 && (
												<span className="adaire-mega-menu__chevron">â–¼</span>
											)}
										</div>
										{item.children && item.children.length > 0 && (
											<div
												className={[
													"adaire-mega-menu__menu",
													item.canvasIsSmaller ? "smaller" : "",
													item.canvasIsSmallest ? "smallest" : "",
													!shouldRenderCanvasBanner ? "no-banner" : "",
													openDropdowns.has(item.id) ? "menu-show" : "",
												]
													.filter(Boolean)
													.join(" ")}
											>
												{shouldRenderCanvasBanner && (
													<div className="adaire-mega-menu__menu__banner">
														<h1 className="adaire-mega-menu__menu__banner__title">
															{item.title}
														</h1>
														{item.bannerDescription && (
															<p className="adaire-mega-menu__menu__banner__description">
																{item.bannerDescription}
															</p>
														)}
													</div>
												)}
												<ul className="adaire-mega-menu__menu__list">
												{showCanvasTitle && (
													<li>
														<a
															href={item.url}
															style={{
																fontSize: `${canvasFontSize}px`,
																fontWeight: canvasFontWeight,
																color: canvasFontColor,
															}}
														>
															{item.title}
														</a>
													</li>
												)}

												{item.children.map((child) => (
													<li
														key={child.id}
														className="adaire-mega-menu__sub-dropdown"
													>
														<div
															className="adaire-mega-menu__sub-dropdown-header"
															style={{
																fontSize: `${getLevelColors(1).fontSize}px`,
																fontWeight: getLevelColors(1).fontWeight,
																"--item-hover-color":
																	getLevelColors(1).hoverColor,
																"--item-color": getLevelColors(1).fontColor,
															}}
														>
															<span
																className={
																	child.isBold ? "adaire-mega-menu__bold" : ""
																}
															>
																{child.title}
															</span>
														</div>
														{child.children && child.children.length > 0 && (
															<ul className="adaire-mega-menu__sub-menu">
																{child.children.map((grandChild) => (
																	<li key={grandChild.id}>
																		<a
																			href={grandChild.url}
																			className={
																				grandChild.isBold
																					? "adaire-mega-menu__bold"
																					: ""
																			}
																			style={{
																				fontSize: `${
																					getLevelColors(2).fontSize
																				}px`,
																				fontWeight:
																					getLevelColors(2).fontWeight,
																				"--item-hover-color":
																					getLevelColors(2).hoverColor,
																				"--item-underline-color":
																					getLevelColors(2).underlineColor,
																				"--item-underline-width": `${
																					getLevelColors(2).underlineWidth
																				}px`,
																				"--item-underline-border-radius": `${
																					getLevelColors(2)
																						.underlineBorderRadius ?? 0
																				}px`,
																				"--item-underline-enabled":
																					level3ShowHoverUnderline ? 1 : 0,
																				"--item-color": getLevelColors(2).fontColor,
																			}}
																		>
																			{grandChild.title}
																		</a>
																	</li>
																))}
															</ul>
														)}
													</li>
												))}
												{shouldRenderCanvasStory && (
													<>
														{canvasStoryDividerEnabled && (
															<li
																className={`adaire-mega-menu__canvas-divider adaire-mega-menu__canvas-divider--${item.canvasImagePosition}`}
																aria-hidden="true"
															/>
														)}
														<li
															className={`adaire-mega-menu__canvas-story adaire-mega-menu__canvas-story--${item.canvasImagePosition}`}
														>
															{storyTitle.trim().length > 0 && (
																<h3 className="adaire-mega-menu__canvas-story-title">
																	{storyTitle}
																</h3>
															)}

															{item.canvasImageUrl && (
																<div className="adaire-mega-menu__canvas-story-media">
																	<img
																		src={item.canvasImageUrl}
																		alt={item.canvasImageAlt}
																		style={{
																			width: `${
																				item.canvasImageWidth?.desktop?.value || 300
																			}${
																				item.canvasImageWidth?.desktop?.unit || "px"
																			}`,
																			height: `${
																				item.canvasImageHeight?.desktop?.value || 200
																			}${
																				item.canvasImageHeight?.desktop?.unit || "px"
																			}`,
																			borderRadius: `${canvasImageBorderRadius}px`,
																			objectFit: "cover",
																		}}
																	/>
																</div>
															)}

															{storyDescription.trim().length > 0 && (
																<p className="adaire-mega-menu__canvas-story-description">
																	{storyDescription}
																</p>
															)}

															{storyLinkLabel.trim().length > 0 && (
																<a
																	className="adaire-mega-menu__canvas-story-link"
																	href={
																		item.canvasStoryLinkUrl &&
																		item.canvasStoryLinkUrl.trim().length
																			? item.canvasStoryLinkUrl
																			: "#"
																	}
																	target={
																		item.canvasStoryLinkOpenInNewTab
																			? "_blank"
																			: undefined
																	}
																	rel={
																		item.canvasStoryLinkOpenInNewTab
																			? "noopener noreferrer"
																			: undefined
																	}
																>
																	{storyLinkLabel}
																</a>
															)}
														</li>
													</>
												)}
												</ul>
											</div>
										)}
									</li>
									);
								})}
							</ul>
						</div>

						<div className="adaire-mega-menu__buttons">
							{renderCtaButtonPreview()}
							<button className="adaire-mega-menu__menu-btn">
								<span className="adaire-mega-menu__menu-icon">â˜°</span>
							</button>
						</div>
					</nav>
				</div>
			</div>
		</>
	);
}



