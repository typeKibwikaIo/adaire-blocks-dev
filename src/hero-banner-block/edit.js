import { __ } from "@wordpress/i18n";
import { useState, useEffect, createElement } from "@wordpress/element";
import {
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
	useInnerBlocksProps,
	PanelColorSettings,
} from "@wordpress/block-editor";
import {
    PanelBody,
    TextControl,
    TextareaControl,
    ToggleControl,
    ColorPicker,
    SelectControl,
    BaseControl,
    Button,
    ButtonGroup,
    GradientPicker,
    RangeControl,
    __experimentalBoxControl as BoxControl,
    __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import {
	alignTop,
	alignMiddle,
	alignBottom,
	alignLeft,
	alignCenter,
	alignRight,
	desktop,
	tablet,
	mobile,
} from "@wordpress/icons";
import { getBlockType } from "@wordpress/blocks";
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute, BreakpointNote } from '../components/DeviceSwitcher';
import InspectorTabs from '../components/InspectorTabs';
import { PANEL, LABEL } from '../components/inspector-vocabulary';
import QuickZone from '../components/QuickZone';
import "./editor.scss";

// 'laptop' is not exported by @wordpress/icons — custom icon for the
// "Small Laptop" breakpoint button (same shape used in infogrid-block/edit.js).
const laptop = createElement('svg', {
	width: 24,
	height: 24,
	viewBox: '0 0 24 24',
	fill: 'none',
	xmlns: 'http://www.w3.org/2000/svg'
},
	createElement('path', {
		d: 'M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z',
		stroke: 'currentColor',
		strokeWidth: '1.5',
		fill: 'none'
	}),
	createElement('path', {
		d: 'M2 19H22',
		stroke: 'currentColor',
		strokeWidth: '1.5',
		strokeLinecap: 'round'
	})
);

const ALLOWED_BLOCKS = ["create-block/button-block"];
// Seeds one CTA button on first insert — the button container previously
// started empty, so a new Hero Banner had no discoverable way to add the
// call-to-action the block's own description promises without knowing to
// open the inserter inside an invisible empty area.
const CTA_TEMPLATE = [["create-block/button-block", { buttonText: "Get Started" }]];

// The block's one and only breakpoint set — every responsive control in this
// block reads/writes the same `deviceType` state, so there is a single
// switcher (in the Layout tab's "Responsive" panel) rather than one per panel.
const BREAKPOINTS = ["mobile", "tablet", "smallLaptop", "desktop", "bigDesktop"];
const BREAKPOINT_LABELS = {
	mobile: __("Mobile", "adaire-blocks"),
	tablet: __("Tablet", "adaire-blocks"),
	smallLaptop: __("Small Laptop", "adaire-blocks"),
	desktop: __("Desktop", "adaire-blocks"),
	bigDesktop: __("Big Desktop", "adaire-blocks"),
};
const FIVE_TIERS = [
	{ key: "mobile", label: BREAKPOINT_LABELS.mobile, icon: mobile },
	{ key: "tablet", label: BREAKPOINT_LABELS.tablet, icon: tablet },
	{ key: "smallLaptop", label: BREAKPOINT_LABELS.smallLaptop, icon: laptop },
	{ key: "desktop", label: BREAKPOINT_LABELS.desktop, icon: desktop },
	{ key: "bigDesktop", label: BREAKPOINT_LABELS.bigDesktop, icon: desktop },
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const [deviceType, setDeviceType] = useState("desktop");
	const [activeZone, setActiveZone] = useState(null);

    const {
        blockId,
        breadcrumbsText,
        breadcrumbsItems,
        headingText,
        textContent,
        showBreadcrumbs,
        iconImageUrl,
        iconImageId,
        showIcon,
        iconPosition,
        iconVerticalPosition,
        backgroundGradient,
        breadcrumbsColor,
        responsiveBreadcrumbTopOffset,
        responsiveBreadcrumbLeftOffset,
        headingColor,
        textColor,
        headingFontWeight,
        textFontWeight,
        responsiveMinHeight,
        responsiveFlexDirection,
        responsiveAlignItems,
        responsivePadding,
        responsiveCtaWidth,
		responsiveCtaMargin,
        responsiveHeadingFontSize,
        responsiveHeadingLineHeight,
        responsiveHeadingMarginBottom,
		responsiveHeadingMarginTop,
        responsiveTextFontSize,
        responsiveTextMarginBottom,
		responsiveTextMarginTop,
        responsiveButtonContainerFlexDirection,
        responsiveButtonContainerGap,
		responsiveButtonContainerMarginTop,
        responsiveIconWidth,
        responsiveIconTransform,
        responsiveBackgroundGradient,
		responsiveRadialGradientCenterX,
		responsiveRadialGradientCenterY,
        responsiveJustifyContent,
        responsiveWidth,
        responsiveIconVerticalOffset,
        responsiveIconHorizontalOffset,
        preheaderText,
        showPreheader,
        preheaderColor,
        preheaderFontWeight,
        responsivePreheaderFontSize,
        responsivePreheaderLineHeight,
        responsivePreheaderMarginBottom,
        showBackgroundImage,
        backgroundImageUrl,
        backgroundImageId,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat,
        overlayType,
        overlayColor,
        overlayGradient,
        overlayOpacity,
        responsiveTextAlignment,
        responsiveButtonAlignment,
		mediaType,
		mediaImageUrl,
		mediaImageId,
        videoType,
        videoUrl,
        wpVideoId,
        wpVideoUrl,
        responsiveVideoWidth,
        responsiveVideoHeight,
        responsiveVideoBorderRadius,
		responsiveContentVideoJustify,
		responsiveContentVideoAlign,
    } = attributes;

	const renderTextWithLineBreaks = (text) => {
		const lines = String(text ?? "").split(/\r?\n/);
		return lines.flatMap((line, i) =>
			i === lines.length - 1 ? [line] : [line, <br key={`br-${i}`} />],
		);
	};

    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: `hero-banner-${clientId}` });
        }
    }, [blockId, clientId, setAttributes]);

    // Helper to get responsive value - for controls only
    const getResponsiveValue = (obj, breakpoint = deviceType) => {
		if (!obj || typeof obj !== "object") return obj;
		return obj[breakpoint] !== undefined
			? obj[breakpoint]
			: obj.desktop || obj.mobile || "";
    };

    // Helper to set responsive value
    const setResponsiveValue = (key, breakpoint, value) => {
        setAttributes({
            [key]: {
                ...(attributes[key] || {}),
                [breakpoint]: value,
            },
        });
    };

    // Resets every responsive attribute back to its block.json default —
    // existing values only, nothing new is added.
    const RESPONSIVE_ATTRS = [
        "responsiveMinHeight", "responsiveFlexDirection", "responsiveAlignItems",
        "responsivePadding", "responsiveCtaWidth", "responsiveCtaMargin",
        "responsiveHeadingFontSize", "responsiveHeadingLineHeight",
        "responsiveHeadingMarginBottom", "responsiveHeadingMarginTop",
        "responsiveTextFontSize", "responsiveTextMarginBottom", "responsiveTextMarginTop",
        "responsiveButtonContainerFlexDirection", "responsiveButtonContainerGap",
        "responsiveButtonContainerMarginTop", "responsiveIconWidth",
        "responsiveIconTransform", "responsiveBackgroundGradient",
        "responsiveRadialGradientCenterX", "responsiveRadialGradientCenterY",
        "responsiveJustifyContent", "responsiveWidth", "responsiveIconVerticalOffset",
        "responsiveIconHorizontalOffset", "responsivePreheaderFontSize",
        "responsivePreheaderLineHeight", "responsivePreheaderMarginBottom",
        "responsiveTextAlignment", "responsiveButtonAlignment",
        "responsiveVideoWidth", "responsiveVideoHeight", "responsiveVideoBorderRadius",
        "responsiveBreadcrumbTopOffset", "responsiveBreadcrumbLeftOffset",
        "responsiveContentVideoJustify", "responsiveContentVideoAlign",
    ];
    const resetResponsiveDefaults = () => {
        const blockType = getBlockType("create-block/hero-banner-block");
        const defaults = blockType?.attributes || {};
        const resetValues = {};
        RESPONSIVE_ATTRS.forEach((key) => {
            if (defaults[key] && "default" in defaults[key]) {
                resetValues[key] = defaults[key].default;
            }
        });
        setAttributes(resetValues);
    };

	const isRadialGradient = (gradient) =>
		typeof gradient === "string" &&
		gradient.trim().toLowerCase().startsWith("radial-gradient(");

	const withRadialCenter = (gradient, x, y) => {
		if (!isRadialGradient(gradient)) return gradient;
		const safeX = Number.isFinite(Number(x)) ? Number(x) : 50;
		const safeY = Number.isFinite(Number(y)) ? Number(y) : 50;
		const pos = `${safeX}% ${safeY}%`;

		// Insert/replace "at <pos>" inside the first argument of radial-gradient(...)
		const m = gradient.match(/^radial-gradient\(\s*([^,]*?)\s*,/i);
		if (!m) return gradient;
		const header = m[1] ?? "";
		const headerNoAt = header.replace(/\bat\s+[^,]+/i, "").trim();
		const newHeader = headerNoAt ? `${headerNoAt} at ${pos}` : `at ${pos}`;
		return gradient.replace(m[0], `radial-gradient(${newHeader},`);
	};

	const getBackgroundGradientForBreakpoint = (bp) => {
		const g =
			responsiveBackgroundGradient?.[bp] ||
			backgroundGradient ||
			"linear-gradient(90deg, rgb(3, 0, 46) 0%, rgb(31, 0, 87) 100%)";
		const x = responsiveRadialGradientCenterX?.[bp] ?? 50;
		const y = responsiveRadialGradientCenterY?.[bp] ?? 50;
		return withRadialCenter(g, x, y);
	};

    // The breadcrumb used to carry inline top/left pinned to the desktop
    // values. Inline styles beat the media queries in style.scss, so at any
    // canvas narrower than the desktop breakpoint the editor placed the
    // breadcrumb at 90px/200px while the front end used the small-laptop,
    // tablet or mobile offsets. Rendering it bare lets the same responsive
    // CSS variables drive it in both places, exactly like save.js.

    // Current values for selected breakpoint (for controls)
    const currentMinHeight = getResponsiveValue(responsiveMinHeight, deviceType);
	const currentFlexDirection = getResponsiveValue(
		responsiveFlexDirection,
		deviceType,
	);
	const currentAlignItems = getResponsiveValue(
		responsiveAlignItems,
		deviceType,
	);
    const currentPadding = getResponsiveValue(responsivePadding, deviceType);
    const currentCtaWidth = getResponsiveValue(responsiveCtaWidth, deviceType);
	const currentCtaMargin = getResponsiveValue(responsiveCtaMargin, deviceType);
	const currentHeadingFontSize = getResponsiveValue(
		responsiveHeadingFontSize,
		deviceType,
	);
	const currentHeadingLineHeight = getResponsiveValue(
		responsiveHeadingLineHeight,
		deviceType,
	);
	const currentHeadingMarginBottom = getResponsiveValue(
		responsiveHeadingMarginBottom,
		deviceType,
	);
	const currentHeadingMarginTop = getResponsiveValue(
		responsiveHeadingMarginTop,
		deviceType,
	);
	const currentTextFontSize = getResponsiveValue(
		responsiveTextFontSize,
		deviceType,
	);
	const currentTextMarginBottom = getResponsiveValue(
		responsiveTextMarginBottom,
		deviceType,
	);
	const currentTextMarginTop = getResponsiveValue(
		responsiveTextMarginTop,
		deviceType,
	);
	const currentButtonContainerFlexDirection = getResponsiveValue(
		responsiveButtonContainerFlexDirection,
		deviceType,
	);
	const currentButtonContainerGap = getResponsiveValue(
		responsiveButtonContainerGap,
		deviceType,
	);
	const currentButtonContainerMarginTop = getResponsiveValue(
		responsiveButtonContainerMarginTop,
		deviceType,
	);
    const currentIconWidth = getResponsiveValue(responsiveIconWidth, deviceType);
	const currentIconTransform = getResponsiveValue(
		responsiveIconTransform,
		deviceType,
	);
	const currentBackgroundGradient =
		getResponsiveValue(responsiveBackgroundGradient, deviceType) ||
		backgroundGradient;
	const currentRadialCenterX = getResponsiveValue(
		responsiveRadialGradientCenterX,
		deviceType,
	);
	const currentRadialCenterY = getResponsiveValue(
		responsiveRadialGradientCenterY,
		deviceType,
	);
	const currentJustifyContent = getResponsiveValue(
		responsiveJustifyContent,
		deviceType,
	);
    const currentWidth = getResponsiveValue(responsiveWidth, deviceType);
	const currentIconVerticalOffset = getResponsiveValue(
		responsiveIconVerticalOffset,
		deviceType,
	);
	const currentIconHorizontalOffset = getResponsiveValue(
		responsiveIconHorizontalOffset,
		deviceType,
	);
	const currentBreadcrumbTopOffset = getResponsiveValue(
		responsiveBreadcrumbTopOffset,
		deviceType,
	);
	const currentBreadcrumbLeftOffset = getResponsiveValue(
		responsiveBreadcrumbLeftOffset,
		deviceType,
	);
	const currentPreheaderFontSize = getResponsiveValue(
		responsivePreheaderFontSize,
		deviceType,
	);
	const currentPreheaderLineHeight = getResponsiveValue(
		responsivePreheaderLineHeight,
		deviceType,
	);
	const currentPreheaderMarginBottom = getResponsiveValue(
		responsivePreheaderMarginBottom,
		deviceType,
	);
	const currentTextAlignment = getResponsiveValue(
		responsiveTextAlignment,
		deviceType,
	);
	const currentButtonAlignment = getResponsiveValue(
		responsiveButtonAlignment,
		deviceType,
	);
	const currentVideoWidth = getResponsiveValue(
		responsiveVideoWidth,
		deviceType,
	);
	const currentVideoHeight = getResponsiveValue(
		responsiveVideoHeight,
		deviceType,
	);
	const currentVideoBorderRadius = getResponsiveValue(
		responsiveVideoBorderRadius,
		deviceType,
	);

    // Helper function to extract video ID from URL
    const getVideoId = (url, type) => {
		if (!url) return "";
		if (type === "youtube") {
			const match = url.match(
				/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
			);
			return match ? match[1] : "";
		} else if (type === "vimeo") {
            const match = url.match(/(?:vimeo\.com\/)([0-9]+)/);
			return match ? match[1] : "";
        }
		return "";
    };

    // Helper function to get embed URL
    const getEmbedUrl = (url, type) => {
        const videoId = getVideoId(url, type);
		if (!videoId) return "";
		if (type === "youtube") {
            return `https://www.youtube.com/embed/${videoId}`;
		} else if (type === "vimeo") {
            return `https://player.vimeo.com/video/${videoId}`;
        }
		return "";
    };

    // Build CSS variables for all breakpoints (like other blocks)
    const blockProps = useBlockProps({
		className: "adaire-hero-banner-container",
        style: {
            // Background (responsive)
			"--hero-bg-gradient-mobile":
				getBackgroundGradientForBreakpoint("mobile"),
			"--hero-bg-gradient-tablet":
				getBackgroundGradientForBreakpoint("tablet"),
			"--hero-bg-gradient-small-laptop":
				getBackgroundGradientForBreakpoint("smallLaptop"),
			"--hero-bg-gradient-desktop":
				getBackgroundGradientForBreakpoint("desktop"),
			"--hero-bg-gradient-big-desktop":
				getBackgroundGradientForBreakpoint("bigDesktop"),

            // Colors
			"--hero-breadcrumbs-color": breadcrumbsColor || "#ffffff",
			"--hero-heading-color": headingColor || "#ffffff",
			"--hero-text-color": textColor || "#ffffff",
			"--hero-heading-font-weight": headingFontWeight || "500",
			"--hero-text-font-weight": textFontWeight || "300",

            // Container - Min Height
			"--hero-min-height-mobile": responsiveMinHeight?.mobile || "auto",
			"--hero-min-height-tablet": responsiveMinHeight?.tablet || "auto",
			"--hero-min-height-small-laptop":
				responsiveMinHeight?.smallLaptop || "auto",
			"--hero-min-height-desktop": responsiveMinHeight?.desktop || "100vh",
			"--hero-min-height-big-desktop":
				responsiveMinHeight?.bigDesktop || "100vh",

            // Container - Width
			"--hero-width-mobile": responsiveWidth?.mobile || "100%",
			"--hero-width-tablet": responsiveWidth?.tablet || "100%",
			"--hero-width-small-laptop": responsiveWidth?.smallLaptop || "100%",
			"--hero-width-desktop": responsiveWidth?.desktop || "100vw",
			"--hero-width-big-desktop": responsiveWidth?.bigDesktop || "100vw",

            // Container - Flex Direction
			"--hero-flex-direction-mobile":
				responsiveFlexDirection?.mobile || "column",
			"--hero-flex-direction-tablet": responsiveFlexDirection?.tablet || "row",
			"--hero-flex-direction-small-laptop":
				responsiveFlexDirection?.smallLaptop || "row",
			"--hero-flex-direction-desktop":
				responsiveFlexDirection?.desktop || "row",
			"--hero-flex-direction-big-desktop":
				responsiveFlexDirection?.bigDesktop || "row",

            // Container - Justify Content
			"--hero-justify-content-mobile":
				responsiveJustifyContent?.mobile || "center",
			"--hero-justify-content-tablet":
				responsiveJustifyContent?.tablet || "flex-start",
			"--hero-justify-content-small-laptop":
				responsiveJustifyContent?.smallLaptop || "flex-start",
			"--hero-justify-content-desktop":
				responsiveJustifyContent?.desktop || "flex-start",
			"--hero-justify-content-big-desktop":
				responsiveJustifyContent?.bigDesktop || "flex-start",

            // Container - Align Items
			"--hero-align-items-mobile": responsiveAlignItems?.mobile || "flex-start",
			"--hero-align-items-tablet": responsiveAlignItems?.tablet || "center",
			"--hero-align-items-small-laptop":
				responsiveAlignItems?.smallLaptop || "center",
			"--hero-align-items-desktop": responsiveAlignItems?.desktop || "center",
			"--hero-align-items-big-desktop":
				responsiveAlignItems?.bigDesktop || "center",

            // Container - Padding
			"--hero-padding-top-mobile": responsivePadding?.mobile?.top || "20px",
			"--hero-padding-right-mobile": responsivePadding?.mobile?.right || "16px",
			"--hero-padding-bottom-mobile":
				responsivePadding?.mobile?.bottom || "20px",
			"--hero-padding-left-mobile": responsivePadding?.mobile?.left || "16px",
			"--hero-padding-top-tablet": responsivePadding?.tablet?.top || "40px",
			"--hero-padding-right-tablet": responsivePadding?.tablet?.right || "30px",
			"--hero-padding-bottom-tablet":
				responsivePadding?.tablet?.bottom || "40px",
			"--hero-padding-left-tablet": responsivePadding?.tablet?.left || "40px",
			"--hero-padding-top-small-laptop":
				responsivePadding?.smallLaptop?.top || "40px",
			"--hero-padding-right-small-laptop":
				responsivePadding?.smallLaptop?.right || "60px",
			"--hero-padding-bottom-small-laptop":
				responsivePadding?.smallLaptop?.bottom || "40px",
			"--hero-padding-left-small-laptop":
				responsivePadding?.smallLaptop?.left || "80px",
			"--hero-padding-top-desktop": responsivePadding?.desktop?.top || "60px",
			"--hero-padding-right-desktop":
				responsivePadding?.desktop?.right || "150px",
			"--hero-padding-bottom-desktop":
				responsivePadding?.desktop?.bottom || "60px",
			"--hero-padding-left-desktop":
				responsivePadding?.desktop?.left || "200px",
			"--hero-padding-top-big-desktop":
				responsivePadding?.bigDesktop?.top || "60px",
			"--hero-padding-right-big-desktop":
				responsivePadding?.bigDesktop?.right || "150px",
			"--hero-padding-bottom-big-desktop":
				responsivePadding?.bigDesktop?.bottom || "60px",
			"--hero-padding-left-big-desktop":
				responsivePadding?.bigDesktop?.left || "200px",

            // CTA Container - Width
			"--hero-cta-width-mobile": responsiveCtaWidth?.mobile || "100%",
			"--hero-cta-width-tablet": responsiveCtaWidth?.tablet || "100%",
			"--hero-cta-width-small-laptop": responsiveCtaWidth?.smallLaptop || "60%",
			"--hero-cta-width-desktop": responsiveCtaWidth?.desktop || "45%",
			"--hero-cta-width-big-desktop": responsiveCtaWidth?.bigDesktop || "45%",

			// CTA Container - Margin
			"--hero-cta-margin-top-mobile": responsiveCtaMargin?.mobile?.top || "0px",
			"--hero-cta-margin-right-mobile":
				responsiveCtaMargin?.mobile?.right || "0px",
			"--hero-cta-margin-bottom-mobile":
				responsiveCtaMargin?.mobile?.bottom || "0px",
			"--hero-cta-margin-left-mobile":
				responsiveCtaMargin?.mobile?.left || "0px",
			"--hero-cta-margin-top-tablet": responsiveCtaMargin?.tablet?.top || "0px",
			"--hero-cta-margin-right-tablet":
				responsiveCtaMargin?.tablet?.right || "0px",
			"--hero-cta-margin-bottom-tablet":
				responsiveCtaMargin?.tablet?.bottom || "0px",
			"--hero-cta-margin-left-tablet":
				responsiveCtaMargin?.tablet?.left || "0px",
			"--hero-cta-margin-top-small-laptop":
				responsiveCtaMargin?.smallLaptop?.top || "0px",
			"--hero-cta-margin-right-small-laptop":
				responsiveCtaMargin?.smallLaptop?.right || "0px",
			"--hero-cta-margin-bottom-small-laptop":
				responsiveCtaMargin?.smallLaptop?.bottom || "0px",
			"--hero-cta-margin-left-small-laptop":
				responsiveCtaMargin?.smallLaptop?.left || "0px",
			"--hero-cta-margin-top-desktop":
				responsiveCtaMargin?.desktop?.top || "0px",
			"--hero-cta-margin-right-desktop":
				responsiveCtaMargin?.desktop?.right || "0px",
			"--hero-cta-margin-bottom-desktop":
				responsiveCtaMargin?.desktop?.bottom || "0px",
			"--hero-cta-margin-left-desktop":
				responsiveCtaMargin?.desktop?.left || "0px",
			"--hero-cta-margin-top-big-desktop":
				responsiveCtaMargin?.bigDesktop?.top || "0px",
			"--hero-cta-margin-right-big-desktop":
				responsiveCtaMargin?.bigDesktop?.right || "0px",
			"--hero-cta-margin-bottom-big-desktop":
				responsiveCtaMargin?.bigDesktop?.bottom || "0px",
			"--hero-cta-margin-left-big-desktop":
				responsiveCtaMargin?.bigDesktop?.left || "0px",

            // Heading - Font Size
			"--hero-heading-font-size-mobile":
				responsiveHeadingFontSize?.mobile || "28px",
			"--hero-heading-font-size-tablet":
				responsiveHeadingFontSize?.tablet || "42px",
			"--hero-heading-font-size-small-laptop":
				responsiveHeadingFontSize?.smallLaptop || "52px",
			"--hero-heading-font-size-desktop":
				responsiveHeadingFontSize?.desktop || "72px",
			"--hero-heading-font-size-big-desktop":
				responsiveHeadingFontSize?.bigDesktop || "72px",

            // Heading - Line Height
			"--hero-heading-line-height-mobile":
				responsiveHeadingLineHeight?.mobile || "36px",
			"--hero-heading-line-height-tablet":
				responsiveHeadingLineHeight?.tablet || "54px",
			"--hero-heading-line-height-small-laptop":
				responsiveHeadingLineHeight?.smallLaptop || "68px",
			"--hero-heading-line-height-desktop":
				responsiveHeadingLineHeight?.desktop || "92px",
			"--hero-heading-line-height-big-desktop":
				responsiveHeadingLineHeight?.bigDesktop || "92px",

            // Heading - Margin Bottom
			"--hero-heading-margin-bottom-mobile":
				responsiveHeadingMarginBottom?.mobile || "12px",
			"--hero-heading-margin-bottom-tablet":
				responsiveHeadingMarginBottom?.tablet || "18px",
			"--hero-heading-margin-bottom-small-laptop":
				responsiveHeadingMarginBottom?.smallLaptop || "20px",
			"--hero-heading-margin-bottom-desktop":
				responsiveHeadingMarginBottom?.desktop || "24px",
			"--hero-heading-margin-bottom-big-desktop":
				responsiveHeadingMarginBottom?.bigDesktop || "24px",

			// Heading - Margin Top
			"--hero-heading-margin-top-mobile":
				responsiveHeadingMarginTop?.mobile || "0px",
			"--hero-heading-margin-top-tablet":
				responsiveHeadingMarginTop?.tablet || "0px",
			"--hero-heading-margin-top-small-laptop":
				responsiveHeadingMarginTop?.smallLaptop || "0px",
			"--hero-heading-margin-top-desktop":
				responsiveHeadingMarginTop?.desktop || "0px",
			"--hero-heading-margin-top-big-desktop":
				responsiveHeadingMarginTop?.bigDesktop || "0px",

            // Text - Font Size
			"--hero-text-font-size-mobile": responsiveTextFontSize?.mobile || "14px",
			"--hero-text-font-size-tablet": responsiveTextFontSize?.tablet || "18px",
			"--hero-text-font-size-small-laptop":
				responsiveTextFontSize?.smallLaptop || "20px",
			"--hero-text-font-size-desktop":
				responsiveTextFontSize?.desktop || "26px",
			"--hero-text-font-size-big-desktop":
				responsiveTextFontSize?.bigDesktop || "26px",

            // Text - Margin Bottom
			"--hero-text-margin-bottom-mobile":
				responsiveTextMarginBottom?.mobile || "16px",
			"--hero-text-margin-bottom-tablet":
				responsiveTextMarginBottom?.tablet || "20px",
			"--hero-text-margin-bottom-small-laptop":
				responsiveTextMarginBottom?.smallLaptop || "20px",
			"--hero-text-margin-bottom-desktop":
				responsiveTextMarginBottom?.desktop || "24px",
			"--hero-text-margin-bottom-big-desktop":
				responsiveTextMarginBottom?.bigDesktop || "24px",

			// Text - Margin Top
			"--hero-text-margin-top-mobile": responsiveTextMarginTop?.mobile || "0px",
			"--hero-text-margin-top-tablet": responsiveTextMarginTop?.tablet || "0px",
			"--hero-text-margin-top-small-laptop":
				responsiveTextMarginTop?.smallLaptop || "0px",
			"--hero-text-margin-top-desktop":
				responsiveTextMarginTop?.desktop || "0px",
			"--hero-text-margin-top-big-desktop":
				responsiveTextMarginTop?.bigDesktop || "0px",

            // Button Container - Flex Direction
			"--hero-button-container-flex-direction-mobile":
				responsiveButtonContainerFlexDirection?.mobile || "column",
			"--hero-button-container-flex-direction-tablet":
				responsiveButtonContainerFlexDirection?.tablet || "row",
			"--hero-button-container-flex-direction-small-laptop":
				responsiveButtonContainerFlexDirection?.smallLaptop || "row",
			"--hero-button-container-flex-direction-desktop":
				responsiveButtonContainerFlexDirection?.desktop || "row",
			"--hero-button-container-flex-direction-big-desktop":
				responsiveButtonContainerFlexDirection?.bigDesktop || "row",

            // Button Container - Gap
			"--hero-button-container-gap-mobile":
				responsiveButtonContainerGap?.mobile || "12px",
			"--hero-button-container-gap-tablet":
				responsiveButtonContainerGap?.tablet || "20px",
			"--hero-button-container-gap-small-laptop":
				responsiveButtonContainerGap?.smallLaptop || "25px",
			"--hero-button-container-gap-desktop":
				responsiveButtonContainerGap?.desktop || "35px",
			"--hero-button-container-gap-big-desktop":
				responsiveButtonContainerGap?.bigDesktop || "35px",

			// Button Container - Margin Top
			"--hero-button-container-margin-top-mobile":
				responsiveButtonContainerMarginTop?.mobile || "0px",
			"--hero-button-container-margin-top-tablet":
				responsiveButtonContainerMarginTop?.tablet || "0px",
			"--hero-button-container-margin-top-small-laptop":
				responsiveButtonContainerMarginTop?.smallLaptop || "0px",
			"--hero-button-container-margin-top-desktop":
				responsiveButtonContainerMarginTop?.desktop || "0px",
			"--hero-button-container-margin-top-big-desktop":
				responsiveButtonContainerMarginTop?.bigDesktop || "0px",

            // Icon - Width
			"--hero-icon-width-mobile": responsiveIconWidth?.mobile || "0px",
			"--hero-icon-width-tablet": responsiveIconWidth?.tablet || "0px",
			"--hero-icon-width-small-laptop":
				responsiveIconWidth?.smallLaptop || "500px",
			"--hero-icon-width-desktop": responsiveIconWidth?.desktop || "700px",
			"--hero-icon-width-big-desktop":
				responsiveIconWidth?.bigDesktop || "700px",

            // Icon - Transform
			"--hero-icon-transform-mobile": responsiveIconTransform?.mobile || "none",
			"--hero-icon-transform-tablet": responsiveIconTransform?.tablet || "none",
			"--hero-icon-transform-small-laptop":
				responsiveIconTransform?.smallLaptop || "translateY(-50%)",
			"--hero-icon-transform-desktop":
				responsiveIconTransform?.desktop || "translateY(-50%)",
			"--hero-icon-transform-big-desktop":
				responsiveIconTransform?.bigDesktop || "translateY(-50%)",

            // Icon - Position
			"--hero-icon-position": iconPosition === "left" ? "left" : "right",
			"--hero-icon-vertical-position":
				iconVerticalPosition === "top" ? "top" : "bottom",

            // Icon - Vertical Offset (conditional: top or bottom based on iconVerticalPosition)
			"--hero-icon-vertical-offset-mobile":
				responsiveIconVerticalOffset?.mobile || "0px",
			"--hero-icon-vertical-offset-tablet":
				responsiveIconVerticalOffset?.tablet || "0px",
			"--hero-icon-vertical-offset-small-laptop":
				responsiveIconVerticalOffset?.smallLaptop || "0px",
			"--hero-icon-vertical-offset-desktop":
				responsiveIconVerticalOffset?.desktop || "0px",
			"--hero-icon-vertical-offset-big-desktop":
				responsiveIconVerticalOffset?.bigDesktop || "0px",

            // Icon - Horizontal Offset (conditional: left or right based on iconPosition)
			"--hero-icon-horizontal-offset-mobile":
				responsiveIconHorizontalOffset?.mobile || "0px",
			"--hero-icon-horizontal-offset-tablet":
				responsiveIconHorizontalOffset?.tablet || "0px",
			"--hero-icon-horizontal-offset-small-laptop":
				responsiveIconHorizontalOffset?.smallLaptop || "0px",
			"--hero-icon-horizontal-offset-desktop":
				responsiveIconHorizontalOffset?.desktop || "0px",
			"--hero-icon-horizontal-offset-big-desktop":
				responsiveIconHorizontalOffset?.bigDesktop || "0px",

            // Breadcrumb - Top Offset
			"--hero-breadcrumb-top-offset-mobile":
				responsiveBreadcrumbTopOffset?.mobile || "20px",
			"--hero-breadcrumb-top-offset-tablet":
				responsiveBreadcrumbTopOffset?.tablet || "40px",
			"--hero-breadcrumb-top-offset-small-laptop":
				responsiveBreadcrumbTopOffset?.smallLaptop || "60px",
			"--hero-breadcrumb-top-offset-desktop":
				responsiveBreadcrumbTopOffset?.desktop || "90px",
			"--hero-breadcrumb-top-offset-big-desktop":
				responsiveBreadcrumbTopOffset?.bigDesktop || "90px",

            // Breadcrumb - Left Offset
			"--hero-breadcrumb-left-offset-mobile":
				responsiveBreadcrumbLeftOffset?.mobile || "16px",
			"--hero-breadcrumb-left-offset-tablet":
				responsiveBreadcrumbLeftOffset?.tablet || "40px",
			"--hero-breadcrumb-left-offset-small-laptop":
				responsiveBreadcrumbLeftOffset?.smallLaptop || "80px",
			"--hero-breadcrumb-left-offset-desktop":
				responsiveBreadcrumbLeftOffset?.desktop || "200px",
			"--hero-breadcrumb-left-offset-big-desktop":
				responsiveBreadcrumbLeftOffset?.bigDesktop || "200px",

            // Preheader - Font Size
			"--hero-preheader-font-size-mobile":
				responsivePreheaderFontSize?.mobile || "14px",
			"--hero-preheader-font-size-tablet":
				responsivePreheaderFontSize?.tablet || "16px",
			"--hero-preheader-font-size-small-laptop":
				responsivePreheaderFontSize?.smallLaptop || "18px",
			"--hero-preheader-font-size-desktop":
				responsivePreheaderFontSize?.desktop || "18px",
			"--hero-preheader-font-size-big-desktop":
				responsivePreheaderFontSize?.bigDesktop || "18px",

            // Preheader - Line Height
			"--hero-preheader-line-height-mobile":
				responsivePreheaderLineHeight?.mobile || "20px",
			"--hero-preheader-line-height-tablet":
				responsivePreheaderLineHeight?.tablet || "24px",
			"--hero-preheader-line-height-small-laptop":
				responsivePreheaderLineHeight?.smallLaptop || "28px",
			"--hero-preheader-line-height-desktop":
				responsivePreheaderLineHeight?.desktop || "28px",
			"--hero-preheader-line-height-big-desktop":
				responsivePreheaderLineHeight?.bigDesktop || "28px",

            // Preheader - Margin Bottom
			"--hero-preheader-margin-bottom-mobile":
				responsivePreheaderMarginBottom?.mobile || "8px",
			"--hero-preheader-margin-bottom-tablet":
				responsivePreheaderMarginBottom?.tablet || "12px",
			"--hero-preheader-margin-bottom-small-laptop":
				responsivePreheaderMarginBottom?.smallLaptop || "12px",
			"--hero-preheader-margin-bottom-desktop":
				responsivePreheaderMarginBottom?.desktop || "12px",
			"--hero-preheader-margin-bottom-big-desktop":
				responsivePreheaderMarginBottom?.bigDesktop || "12px",

            // Preheader - Style
			"--hero-preheader-color": preheaderColor || "#ffffff",
			"--hero-preheader-font-weight": preheaderFontWeight || "500",

            // Background Image (conditional)
			"--hero-bg-image":
				showBackgroundImage && backgroundImageUrl
					? `url(${backgroundImageUrl})`
					: "none",
			"--hero-bg-size": backgroundSize || "cover",
			"--hero-bg-position": backgroundPosition || "center",
			"--hero-bg-repeat": backgroundRepeat || "no-repeat",

            // Overlay
			"--hero-overlay-bg-solid": overlayColor || "transparent",
			"--hero-overlay-opacity":
				overlayOpacity !== undefined ? overlayOpacity : 0.5,
			"--hero-overlay-bg-gradient": overlayGradient || "none",

            // Text Alignment
			"--hero-text-alignment-mobile": responsiveTextAlignment?.mobile || "left",
			"--hero-text-alignment-tablet": responsiveTextAlignment?.tablet || "left",
			"--hero-text-alignment-small-laptop":
				responsiveTextAlignment?.smallLaptop || "left",
			"--hero-text-alignment-desktop":
				responsiveTextAlignment?.desktop || "left",
			"--hero-text-alignment-big-desktop":
				responsiveTextAlignment?.bigDesktop || "left",

            // Button Alignment
			"--hero-button-alignment-mobile":
				responsiveButtonAlignment?.mobile === "center"
					? "center"
					: responsiveButtonAlignment?.mobile === "right"
					? "flex-end"
					: "flex-start",
			"--hero-button-alignment-tablet":
				responsiveButtonAlignment?.tablet === "center"
					? "center"
					: responsiveButtonAlignment?.tablet === "right"
					? "flex-end"
					: "flex-start",
			"--hero-button-alignment-small-laptop":
				responsiveButtonAlignment?.smallLaptop === "center"
					? "center"
					: responsiveButtonAlignment?.smallLaptop === "right"
					? "flex-end"
					: "flex-start",
			"--hero-button-alignment-desktop":
				responsiveButtonAlignment?.desktop === "center"
					? "center"
					: responsiveButtonAlignment?.desktop === "right"
					? "flex-end"
					: "flex-start",
			"--hero-button-alignment-big-desktop":
				responsiveButtonAlignment?.bigDesktop === "center"
					? "center"
					: responsiveButtonAlignment?.bigDesktop === "right"
					? "flex-end"
					: "flex-start",

            // Video Player Dimensions
			"--hero-video-width-mobile": responsiveVideoWidth?.mobile || "100%",
			"--hero-video-width-tablet": responsiveVideoWidth?.tablet || "100%",
			"--hero-video-width-small-laptop":
				responsiveVideoWidth?.smallLaptop || "50%",
			"--hero-video-width-desktop": responsiveVideoWidth?.desktop || "50%",
			"--hero-video-width-big-desktop":
				responsiveVideoWidth?.bigDesktop || "50%",
			"--hero-video-height-mobile": responsiveVideoHeight?.mobile || "300px",
			"--hero-video-height-tablet": responsiveVideoHeight?.tablet || "400px",
			"--hero-video-height-small-laptop":
				responsiveVideoHeight?.smallLaptop || "500px",
			"--hero-video-height-desktop": responsiveVideoHeight?.desktop || "600px",
			"--hero-video-height-big-desktop":
				responsiveVideoHeight?.bigDesktop || "600px",
			"--hero-video-border-radius-mobile":
				responsiveVideoBorderRadius?.mobile || "8px",
			"--hero-video-border-radius-tablet":
				responsiveVideoBorderRadius?.tablet || "8px",
			"--hero-video-border-radius-small-laptop":
				responsiveVideoBorderRadius?.smallLaptop || "12px",
			"--hero-video-border-radius-desktop":
				responsiveVideoBorderRadius?.desktop || "16px",
			"--hero-video-border-radius-big-desktop":
				responsiveVideoBorderRadius?.bigDesktop || "16px",

			// Content & Video Container Alignment (uses same values as main container when media is present)
			"--hero-content-video-justify-mobile":
				mediaType === "image" || mediaType === "video"
					? responsiveJustifyContent?.mobile || "center"
					: responsiveContentVideoJustify?.mobile || "flex-start",
			"--hero-content-video-justify-tablet":
				mediaType === "image" || mediaType === "video"
					? responsiveJustifyContent?.tablet || "flex-start"
					: responsiveContentVideoJustify?.tablet || "flex-start",
			"--hero-content-video-justify-small-laptop":
				mediaType === "image" || mediaType === "video"
					? responsiveJustifyContent?.smallLaptop || "flex-start"
					: responsiveContentVideoJustify?.smallLaptop || "space-between",
			"--hero-content-video-justify-desktop":
				mediaType === "image" || mediaType === "video"
					? responsiveJustifyContent?.desktop || "flex-start"
					: responsiveContentVideoJustify?.desktop || "space-between",
			"--hero-content-video-justify-big-desktop":
				mediaType === "image" || mediaType === "video"
					? responsiveJustifyContent?.bigDesktop || "flex-start"
					: responsiveContentVideoJustify?.bigDesktop || "space-between",
			"--hero-content-video-align-mobile":
				mediaType === "image" || mediaType === "video"
					? responsiveAlignItems?.mobile || "flex-start"
					: responsiveContentVideoAlign?.mobile || "flex-start",
			"--hero-content-video-align-tablet":
				mediaType === "image" || mediaType === "video"
					? responsiveAlignItems?.tablet || "center"
					: responsiveContentVideoAlign?.tablet || "center",
			"--hero-content-video-align-small-laptop":
				mediaType === "image" || mediaType === "video"
					? responsiveAlignItems?.smallLaptop || "center"
					: responsiveContentVideoAlign?.smallLaptop || "center",
			"--hero-content-video-align-desktop":
				mediaType === "image" || mediaType === "video"
					? responsiveAlignItems?.desktop || "center"
					: responsiveContentVideoAlign?.desktop || "center",
			"--hero-content-video-align-big-desktop":
				mediaType === "image" || mediaType === "video"
					? responsiveAlignItems?.bigDesktop || "center"
					: responsiveContentVideoAlign?.bigDesktop || "center",
        },
    });

    const innerBlocksProps = useInnerBlocksProps(
        {
			className: "adaire-hero-banner__button-container",
        },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            template: CTA_TEMPLATE,
            templateInsertUpdatesSelection: false,
            templateLock: false,
			orientation: "horizontal",
		},
    );

    return (
        <>
			<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
				<PanelBody
					section="content"
					title={ PANEL.CONTENT }
					initialOpen={true}
				>
					{showPreheader && (
					    <TextControl
					        label={__("Preheader Text", "adaire-blocks")}
					        value={preheaderText}
					        onChange={(value) => setAttributes({ preheaderText: value })}
					    />
					)}
					{showBreadcrumbs && (
					    <>
					        <BaseControl
					            label={__("Breadcrumbs", "adaire-blocks")}
					            help={__(
					                "Configure breadcrumb items with text and URLs. Leave URL empty for the current page.",
					                "adaire-blocks",
					            )}
					        >
					            {(breadcrumbsItems || []).map((item, index) => (
					                <div
					                    key={index}
					                    style={{
					                        marginBottom: "12px",
					                        padding: "10px",
					                        border: "1px solid #ddd",
					                        borderRadius: "4px",
					                    }}
					                >
					                    <div
					                        style={{
					                            display: "flex",
					                            gap: "8px",
					                            marginBottom: "8px",
					                        }}
					                    >
					                        <TextControl
					                            label={__("Text", "adaire-blocks")}
					                            value={item.text || ""}
					                            onChange={(value) => {
					                                const updated = [...(breadcrumbsItems || [])];
					                                updated[index] = { ...updated[index], text: value };
					                                setAttributes({ breadcrumbsItems: updated });
					                            }}
					                            style={{ flex: 1 }}
					                        />
					                        <Button
					                            isDestructive
					                            isSmall
					                            onClick={() => {
					                                const updated = [...(breadcrumbsItems || [])];
					                                updated.splice(index, 1);
					                                setAttributes({ breadcrumbsItems: updated });
					                            }}
					                            label={__("Remove", "adaire-blocks")}
					                        >
					                            {__("Remove", "adaire-blocks")}
					                        </Button>
					                    </div>
					                    <TextControl
					                        label={__("URL", "adaire-blocks")}
					                        value={item.url || ""}
					                        onChange={(value) => {
					                            const updated = [...(breadcrumbsItems || [])];
					                            updated[index] = { ...updated[index], url: value };
					                            setAttributes({ breadcrumbsItems: updated });
					                        }}
					                        placeholder={__(
					                            "Leave empty for current page",
					                            "adaire-blocks",
					                        )}
					                    />
					                </div>
					            ))}
					            <Button
					                isSecondary
					                isSmall
					                onClick={() => {
					                    const updated = [
					                        ...(breadcrumbsItems || []),
					                        { text: "", url: "" },
					                    ];
					                    setAttributes({ breadcrumbsItems: updated });
					                }}
					                style={{ marginTop: "8px" }}
					            >
					                {__("Add Breadcrumb Item", "adaire-blocks")}
					            </Button>
					        </BaseControl>
					    </>
					)}
					<TextareaControl
					    label={__("Heading", "adaire-blocks")}
					    value={headingText}
					    onChange={(value) => setAttributes({ headingText: value })}
					/>
					<TextControl
					    label={__("Text Content", "adaire-blocks")}
					    value={textContent}
					    onChange={(value) => setAttributes({ textContent: value })}
					    multiline
					    rows={3}
					/>
				</PanelBody>
				<PanelBody
					section="content"
					title={ PANEL.ICON }
					initialOpen={false}
				>
					{showIcon && (
					    <>
					        <MediaUploadCheck>
					            <MediaUpload
					                onSelect={(media) => {
					                    setAttributes({
					                        iconImageUrl: media.url,
					                        iconImageId: media.id,
					                    });
					                }}
					                allowedTypes={["image"]}
					                value={iconImageId}
					                render={({ open }) => (
					                    <Button onClick={open} isSecondary>
					                        {iconImageUrl
					                            ? __("Replace Icon Image", "adaire-blocks")
					                            : __("Select Icon Image", "adaire-blocks")}
					                    </Button>
					                )}
					            />
					        </MediaUploadCheck>
					        {iconImageUrl && (
					            <div style={{ marginTop: "10px" }}>
					                <img
					                    src={iconImageUrl}
					                    alt=""
					                    style={{ maxWidth: "100%", height: "auto" }}
					                />
					                <Button
					                    onClick={() =>
					                        setAttributes({ iconImageUrl: "", iconImageId: 0 })
					                    }
					                    isDestructive
					                    isSmall
					                    style={{ marginTop: "10px" }}
					                >
					                    {__("Remove Image", "adaire-blocks")}
					                </Button>
					            </div>
					        )}
					    </>
					)}
				</PanelBody>
				<PanelBody
					section="content"
					title={ PANEL.MEDIA }
					initialOpen={false}
				>
					<SelectControl
					    label={__("Media Type", "adaire-blocks")}
					    value={mediaType}
					    options={[
					        { label: __("None", "adaire-blocks"), value: "none" },
					        { label: __("Image", "adaire-blocks"), value: "image" },
					        { label: __("Video", "adaire-blocks"), value: "video" },
					    ]}
					    onChange={(value) => setAttributes({ mediaType: value })}
					/>
					{mediaType === "image" && (
					    <BaseControl label={__("Media Image", "adaire-blocks")}>
					        <MediaUploadCheck>
					            <MediaUpload
					                onSelect={(media) => {
					                    setAttributes({
					                        mediaImageUrl: media.url,
					                        mediaImageId: media.id,
					                    });
					                }}
					                allowedTypes={["image"]}
					                value={mediaImageId}
					                render={({ open }) => (
					                    <div style={{ marginBottom: "10px" }}>
					                        {mediaImageUrl ? (
					                            <div
					                                style={{
					                                    marginBottom: "10px",
					                                    position: "relative",
					                                }}
					                            >
					                                <img
					                                    src={mediaImageUrl}
					                                    alt=""
					                                    style={{ width: "100%", borderRadius: "4px" }}
					                                />
					                                <Button
					                                    isDestructive
					                                    onClick={() =>
					                                        setAttributes({
					                                            mediaImageUrl: "",
					                                            mediaImageId: 0,
					                                        })
					                                    }
					                                    style={{
					                                        position: "absolute",
					                                        top: "5px",
					                                        right: "5px",
					                                    }}
					                                >
					                                    {__("Remove", "adaire-blocks")}
					                                </Button>
					                            </div>
					                        ) : (
					                            <Button isSecondary onClick={open}>
					                                {__("Select Image", "adaire-blocks")}
					                            </Button>
					                        )}
					                    </div>
					                )}
					            />
					        </MediaUploadCheck>
					    </BaseControl>
					)}
					{mediaType === "video" && (
					    <>
					        <SelectControl
					            label={__("Video Type", "adaire-blocks")}
					            value={videoType}
					            options={[
					                { label: __("YouTube", "adaire-blocks"), value: "youtube" },
					                { label: __("Vimeo", "adaire-blocks"), value: "vimeo" },
					                { label: __("WordPress Video", "adaire-blocks"), value: "wp" },
					            ]}
					            onChange={(value) => setAttributes({ videoType: value })}
					        />
					        {videoType === "wp" ? (
					            <>
					                <BaseControl label={__("WordPress Video", "adaire-blocks")}>
					                    <MediaUploadCheck>
					                        <MediaUpload
					                            onSelect={(media) => {
					                                setAttributes({
					                                    wpVideoUrl: media.url,
					                                    wpVideoId: media.id,
					                                });
					                            }}
					                            allowedTypes={["video"]}
					                            value={wpVideoId}
					                            render={({ open }) => (
					                                <div style={{ marginBottom: "10px" }}>
					                                    {wpVideoUrl ? (
					                                        <div style={{ marginBottom: "10px" }}>
					                                            <video
					                                                src={wpVideoUrl}
					                                                controls
					                                                style={{
					                                                    maxWidth: "100%",
					                                                    height: "auto",
					                                                    borderRadius: "4px",
					                                                }}
					                                            />
					                                            <Button
					                                                onClick={() =>
					                                                    setAttributes({
					                                                        wpVideoUrl: "",
					                                                        wpVideoId: 0,
					                                                    })
					                                                }
					                                                isDestructive
					                                                isSmall
					                                                style={{ marginTop: "10px" }}
					                                            >
					                                                {__("Remove Video", "adaire-blocks")}
					                                            </Button>
					                                        </div>
					                                    ) : (
					                                        <Button isSecondary onClick={open}>
					                                            {__("Select Video", "adaire-blocks")}
					                                        </Button>
					                                    )}
					                                </div>
					                            )}
					                        />
					                    </MediaUploadCheck>
					                </BaseControl>
					            </>
					        ) : (
					            <TextControl
					                label={
					                    videoType === "youtube"
					                        ? __("YouTube URL", "adaire-blocks")
					                        : __("Vimeo URL", "adaire-blocks")
					                }
					                value={videoUrl}
					                onChange={(value) => setAttributes({ videoUrl: value })}
					                placeholder={
					                    videoType === "youtube"
					                        ? "https://www.youtube.com/watch?v=..."
					                        : "https://vimeo.com/..."
					                }
					                help={
					                    videoType === "youtube"
					                        ? __("Enter a YouTube video URL", "adaire-blocks")
					                        : __("Enter a Vimeo video URL", "adaire-blocks")
					                }
					            />
					        )}
					    </>
					)}

					<TextControl
					    label={__("Block ID", "adaire-blocks")}
					    value={blockId}
					    onChange={(value) => setAttributes({ blockId: value })}
					    help={__(
					        "Add a custom ID to this block for CSS targeting or anchor links.",
					        "adaire-blocks",
					    )}
					/>
				</PanelBody>
				<PanelBody
					section="layout"
					title={ PANEL.RESPONSIVE }
					initialOpen={true}
				>
					<DeviceSwitcher
					    deviceType={deviceType}
					    setDeviceType={setDeviceType}
					    label={ LABEL.BREAKPOINT }
					    tiers={FIVE_TIERS}
					    onReset={resetResponsiveDefaults}
					/>
					    <p style={{ marginTop: "8px", fontSize: "12px", color: "#757575" }}>
					        {__(
					            "Select a breakpoint to configure its settings. The editor preview shows desktop view.",
					            "adaire-blocks",
					        )}
					    </p>
				</PanelBody>
				<PanelBody
					section="layout"
					title={ PANEL.STRUCTURE }
					initialOpen={false}
				>
					{/*
					  Show/hide toggles are Layout, not Content (spec §4): turning one
					  off removes the element from the DOM. The text, icon and media
					  they reveal stay in the Content tab. They apply to every
					  breakpoint, so the BreakpointNote sits below them, next to the
					  controls it actually describes.
					*/}
					<ToggleControl
					    label={__("Show Breadcrumbs", "adaire-blocks")}
					    checked={showBreadcrumbs}
					    onChange={(value) => setAttributes({ showBreadcrumbs: value })}
					/>
					<ToggleControl
					    label={__("Show Preheader", "adaire-blocks")}
					    checked={showPreheader}
					    onChange={(value) => setAttributes({ showPreheader: value })}
					/>
					<ToggleControl
					    label={__("Show Icon", "adaire-blocks")}
					    checked={showIcon}
					    onChange={(value) => setAttributes({ showIcon: value })}
					/>
					<ToggleControl
					    label={__("Show Background Image", "adaire-blocks")}
					    checked={showBackgroundImage}
					    onChange={(value) => setAttributes({ showBackgroundImage: value })}
					/>
					<BreakpointNote deviceType={deviceType} tiers={FIVE_TIERS} />

					<SelectControl
					    label={__("Flex Direction", "adaire-blocks")}
					    value={currentFlexDirection}
					    options={[
					        { label: __("Row", "adaire-blocks"), value: "row" },
					        { label: __("Column", "adaire-blocks"), value: "column" },
					    ]}
					    onChange={(value) =>
					        setResponsiveValue("responsiveFlexDirection", deviceType, value)
					    }
					/>
					<SelectControl
					    label={__("Justify Content", "adaire-blocks")}
					    value={currentJustifyContent}
					    options={[
					        { label: __("Flex Start", "adaire-blocks"), value: "flex-start" },
					        { label: __("Flex End", "adaire-blocks"), value: "flex-end" },
					        { label: __("Center", "adaire-blocks"), value: "center" },
					        {
					            label: __("Space Between", "adaire-blocks"),
					            value: "space-between",
					        },
					        {
					            label: __("Space Around", "adaire-blocks"),
					            value: "space-around",
					        },
					        {
					            label: __("Space Evenly", "adaire-blocks"),
					            value: "space-evenly",
					        },
					    ]}
					    onChange={(value) =>
					        setResponsiveValue("responsiveJustifyContent", deviceType, value)
					    }
					/>
					<SelectControl
					    label={__("Align Items", "adaire-blocks")}
					    value={currentAlignItems}
					    options={[
					        { label: __("Flex Start", "adaire-blocks"), value: "flex-start" },
					        { label: __("Flex End", "adaire-blocks"), value: "flex-end" },
					        { label: __("Center", "adaire-blocks"), value: "center" },
					        { label: __("Stretch", "adaire-blocks"), value: "stretch" },
					        { label: __("Baseline", "adaire-blocks"), value: "baseline" },
					    ]}
					    onChange={(value) =>
					        setResponsiveValue("responsiveAlignItems", deviceType, value)
					    }
					/>
					{showIcon && (
					    <>
					        <SelectControl
					            label={__("Horizontal Position", "adaire-blocks")}
					            value={iconPosition}
					            options={[
					                { label: __("Left", "adaire-blocks"), value: "left" },
					                { label: __("Right", "adaire-blocks"), value: "right" },
					            ]}
					            onChange={(value) => setAttributes({ iconPosition: value })}
					        />
					        <SelectControl
					            label={__("Vertical Position", "adaire-blocks")}
					            value={iconVerticalPosition}
					            options={[
					                { label: __("Top", "adaire-blocks"), value: "top" },
					                { label: __("Bottom", "adaire-blocks"), value: "bottom" },
					            ]}
					            onChange={(value) =>
					                setAttributes({ iconVerticalPosition: value })
					            }
					        />
					        <p
					            style={{
					                marginTop: "16px",
					                marginBottom: "8px",
					                fontWeight: 600,
					            }}
					        >
					            {__("Icon Settings (Responsive)", "adaire-blocks")}
					        </p>
					        <SelectControl
					            label={__("Transform", "adaire-blocks")}
					            value={currentIconTransform}
					            options={[
					                { label: __("None", "adaire-blocks"), value: "none" },
					                {
					                    label: __("Translate Y -50%", "adaire-blocks"),
					                    value: "translateY(-50%)",
					                },
					                {
					                    label: __("Translate Y 50%", "adaire-blocks"),
					                    value: "translateY(50%)",
					                },
					                {
					                    label: __("Translate X -50%", "adaire-blocks"),
					                    value: "translateX(-50%)",
					                },
					                {
					                    label: __("Translate X 50%", "adaire-blocks"),
					                    value: "translateX(50%)",
					                },
					            ]}
					            onChange={(value) =>
					                setResponsiveValue(
					                    "responsiveIconTransform",
					                    deviceType,
					                    value,
					                )
					            }
					        />
					        <UnitControl
					            label={
					                iconVerticalPosition === "top"
					                    ? __("Top Offset", "adaire-blocks")
					                    : __("Bottom Offset", "adaire-blocks")
					            }
					            value={currentIconVerticalOffset}
					            onChange={(value) =>
					                setResponsiveValue(
					                    "responsiveIconVerticalOffset",
					                    deviceType,
					                    value || "0px",
					                )
					            }
					            units={[
					                { value: "px", label: "px" },
					                { value: "%", label: "%" },
					                { value: "rem", label: "rem" },
					                { value: "em", label: "em" },
					            ]}
					        />
					        <UnitControl
					            label={
					                iconPosition === "left"
					                    ? __("Left Offset", "adaire-blocks")
					                    : __("Right Offset", "adaire-blocks")
					            }
					            value={currentIconHorizontalOffset}
					            onChange={(value) =>
					                setResponsiveValue(
					                    "responsiveIconHorizontalOffset",
					                    deviceType,
					                    value || "0px",
					                )
					            }
					            units={[
					                { value: "px", label: "px" },
					                { value: "%", label: "%" },
					                { value: "rem", label: "rem" },
					                { value: "em", label: "em" },
					            ]}
					        />
					    </>
					)}
					<SelectControl
					    label={__("Flex Direction", "adaire-blocks")}
					    value={currentButtonContainerFlexDirection}
					    options={[
					        { label: __("Row", "adaire-blocks"), value: "row" },
					        { label: __("Column", "adaire-blocks"), value: "column" },
					    ]}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveButtonContainerFlexDirection",
					            deviceType,
					            value,
					        )
					    }
					/>
				</PanelBody>
				<PanelBody
					section="layout"
					title={ PANEL.ALIGNMENT }
					initialOpen={false}
				>
					<BreakpointNote deviceType={deviceType} tiers={FIVE_TIERS} />
					<BaseControl
					    label={__("Text Alignment", "adaire-blocks")}
					    style={{ marginTop: "16px" }}
					>
					    <ButtonGroup>
					        <Button
					            isPrimary={currentTextAlignment === "left"}
					            onClick={() =>
					                setResponsiveValue(
					                    "responsiveTextAlignment",
					                    deviceType,
					                    "left",
					                )
					            }
					        >
					            {__("Left", "adaire-blocks")}
					        </Button>
					        <Button
					            isPrimary={currentTextAlignment === "center"}
					            onClick={() =>
					                setResponsiveValue(
					                    "responsiveTextAlignment",
					                    deviceType,
					                    "center",
					                )
					            }
					        >
					            {__("Center", "adaire-blocks")}
					        </Button>
					        <Button
					            isPrimary={currentTextAlignment === "right"}
					            onClick={() =>
					                setResponsiveValue(
					                    "responsiveTextAlignment",
					                    deviceType,
					                    "right",
					                )
					            }
					        >
					            {__("Right", "adaire-blocks")}
					        </Button>
					    </ButtonGroup>
					</BaseControl>
					<BaseControl
					    label={__("Button Alignment", "adaire-blocks")}
					    style={{ marginTop: "16px" }}
					>
					    <ButtonGroup>
					        <Button
					            isPrimary={currentButtonAlignment === "left"}
					            onClick={() =>
					                setResponsiveValue(
					                    "responsiveButtonAlignment",
					                    deviceType,
					                    "left",
					                )
					            }
					        >
					            {__("Left", "adaire-blocks")}
					        </Button>
					        <Button
					            isPrimary={currentButtonAlignment === "center"}
					            onClick={() =>
					                setResponsiveValue(
					                    "responsiveButtonAlignment",
					                    deviceType,
					                    "center",
					                )
					            }
					        >
					            {__("Center", "adaire-blocks")}
					        </Button>
					        <Button
					            isPrimary={currentButtonAlignment === "right"}
					            onClick={() =>
					                setResponsiveValue(
					                    "responsiveButtonAlignment",
					                    deviceType,
					                    "right",
					                )
					            }
					        >
					            {__("Right", "adaire-blocks")}
					        </Button>
					    </ButtonGroup>
					</BaseControl>
				</PanelBody>
				<PanelBody
					section="layout"
					title={ PANEL.DIMENSIONS }
					initialOpen={false}
				>
					<BreakpointNote deviceType={deviceType} tiers={FIVE_TIERS} />
					<UnitControl
					    label={__("Width", "adaire-blocks")}
					    value={currentWidth}
					    onChange={(value) =>
					        setResponsiveValue("responsiveWidth", deviceType, value || "100%")
					    }
					    units={[
					        { value: "vw", label: "vw" },
					        { value: "%", label: "%" },
					        { value: "px", label: "px" },
					        { value: "rem", label: "rem" },
					    ]}
					/>
					<UnitControl
					    label={__("Min Height", "adaire-blocks")}
					    value={currentMinHeight}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveMinHeight",
					            deviceType,
					            value || "auto",
					        )
					    }
					    units={[
					        { value: "vh", label: "vh" },
					        { value: "px", label: "px" },
					        { value: "rem", label: "rem" },
					        { value: "auto", label: "auto" },
					    ]}
					/>
					<UnitControl
					    label={__("CTA Container Width", "adaire-blocks")}
					    value={currentCtaWidth}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveCtaWidth",
					            deviceType,
					            value || "100%",
					        )
					    }
					    units={[
					        { value: "%", label: "%" },
					        { value: "px", label: "px" },
					        { value: "rem", label: "rem" },
					    ]}
					/>
					<UnitControl
					    label={__("Icon Width", "adaire-blocks")}
					    value={currentIconWidth}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveIconWidth",
					            deviceType,
					            value || "700px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "%", label: "%" },
					        { value: "rem", label: "rem" },
					    ]}
					/>
					<UnitControl
					    label={
					        mediaType === "image"
					            ? __("Image Width", "adaire-blocks")
					            : __("Video Width", "adaire-blocks")
					    }
					    value={currentVideoWidth}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveVideoWidth",
					            deviceType,
					            value || "50%",
					        )
					    }
					    units={[
					        { value: "%", label: "%" },
					        { value: "px", label: "px" },
					        { value: "rem", label: "rem" },
					    ]}
					/>
					<UnitControl
					    label={
					        mediaType === "image"
					            ? __("Image Height", "adaire-blocks")
					            : __("Video Height", "adaire-blocks")
					    }
					    value={currentVideoHeight}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveVideoHeight",
					            deviceType,
					            value || "600px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "rem", label: "rem" },
					        { value: "%", label: "%" },
					    ]}
					/>
				</PanelBody>
				<PanelBody
					section="style"
					title={ PANEL.SPACING }
					initialOpen={false}
				>
					<BreakpointNote deviceType={deviceType} tiers={FIVE_TIERS} />
					{/* Padding, margin and gap are Style, not Layout (spec §4). */}
					<BoxControl
					    label={ LABEL.PADDING }
					    values={currentPadding}
					    onChange={(value) =>
					        setResponsiveValue("responsivePadding", deviceType, value)
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "em", label: "em" },
					        { value: "rem", label: "rem" },
					        { value: "%", label: "%" },
					    ]}
					/>
					<BoxControl
					    label={__("CTA Container Margin", "adaire-blocks")}
					    values={currentCtaMargin}
					    onChange={(value) =>
					        setResponsiveValue("responsiveCtaMargin", deviceType, value)
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "em", label: "em" },
					        { value: "rem", label: "rem" },
					        { value: "%", label: "%" },
					    ]}
					/>
					<UnitControl
					    label={ LABEL.GAP }
					    value={currentButtonContainerGap}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveButtonContainerGap",
					            deviceType,
					            value || "35px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "em", label: "em" },
					        { value: "rem", label: "rem" },
					    ]}
					/>
					<UnitControl
					    label={__("Margin Top", "adaire-blocks")}
					    value={currentButtonContainerMarginTop}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveButtonContainerMarginTop",
					            deviceType,
					            value || "0px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "em", label: "em" },
					        { value: "rem", label: "rem" },
					    ]}
					/>
					{/* Preheader spacing only applies while the preheader is shown. */}
					{showPreheader && (
						<UnitControl
						    label={__("Margin Bottom", "adaire-blocks")}
						    value={currentPreheaderMarginBottom}
						    onChange={(value) =>
						        setResponsiveValue(
						            "responsivePreheaderMarginBottom",
						            deviceType,
						            value || "12px",
						        )
						    }
						    units={[
						        { value: "px", label: "px" },
						        { value: "rem", label: "rem" },
						        { value: "em", label: "em" },
						    ]}
						/>
					)}
					<UnitControl
					    label={__("Heading Margin Top", "adaire-blocks")}
					    value={currentHeadingMarginTop}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveHeadingMarginTop",
					            deviceType,
					            value || "0px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "em", label: "em" },
					        { value: "rem", label: "rem" },
					    ]}
					/>
					<UnitControl
					    label={__("Heading Margin Bottom", "adaire-blocks")}
					    value={currentHeadingMarginBottom}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveHeadingMarginBottom",
					            deviceType,
					            value || "24px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "em", label: "em" },
					        { value: "rem", label: "rem" },
					    ]}
					/>
					<UnitControl
					    label={__("Text Margin Top", "adaire-blocks")}
					    value={currentTextMarginTop}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveTextMarginTop",
					            deviceType,
					            value || "0px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "em", label: "em" },
					        { value: "rem", label: "rem" },
					    ]}
					/>
					<UnitControl
					    label={__("Text Margin Bottom", "adaire-blocks")}
					    value={currentTextMarginBottom}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveTextMarginBottom",
					            deviceType,
					            value || "24px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "em", label: "em" },
					        { value: "rem", label: "rem" },
					    ]}
					/>
					<UnitControl
					    label={__("Top Offset", "adaire-blocks")}
					    value={currentBreadcrumbTopOffset}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveBreadcrumbTopOffset",
					            deviceType,
					            value || "90px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "%", label: "%" },
					        { value: "rem", label: "rem" },
					        { value: "em", label: "em" },
					    ]}
					/>
					<UnitControl
					    label={__("Left Offset", "adaire-blocks")}
					    value={currentBreadcrumbLeftOffset}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveBreadcrumbLeftOffset",
					            deviceType,
					            value || "200px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "%", label: "%" },
					        { value: "rem", label: "rem" },
					        { value: "em", label: "em" },
					    ]}
					/>
				</PanelBody>
				<PanelBody
					section="style"
					title={ PANEL.BACKGROUND }
					initialOpen={false}
				>
					<BreakpointNote deviceType={deviceType} tiers={FIVE_TIERS} />
					<BaseControl label={__("Background Gradient", "adaire-blocks")}>
					    <GradientPicker
					        value={currentBackgroundGradient || backgroundGradient}
					        onChange={(value) =>
					            setResponsiveValue(
					                "responsiveBackgroundGradient",
					                deviceType,
					                withRadialCenter(
					                    value ||
					                        "linear-gradient(90deg,rgb(3,0,46) 0%,rgb(31,0,87) 100%)",
					                    currentRadialCenterX ?? 50,
					                    currentRadialCenterY ?? 50,
					                ),
					            )
					        }
					    />
					</BaseControl>
					{isRadialGradient(currentBackgroundGradient) && (
					    <>
					        <RangeControl
					            label={__("Radial center X (%)", "adaire-blocks")}
					            value={Number(currentRadialCenterX ?? 50)}
					            onChange={(value) => {
					                setResponsiveValue(
					                    "responsiveRadialGradientCenterX",
					                    deviceType,
					                    value ?? 50,
					                );
					                setResponsiveValue(
					                    "responsiveBackgroundGradient",
					                    deviceType,
					                    withRadialCenter(
					                        currentBackgroundGradient,
					                        value ?? 50,
					                        currentRadialCenterY ?? 50,
					                    ),
					                );
					            }}
					            min={0}
					            max={100}
					        />
					        <RangeControl
					            label={__("Radial center Y (%)", "adaire-blocks")}
					            value={Number(currentRadialCenterY ?? 50)}
					            onChange={(value) => {
					                setResponsiveValue(
					                    "responsiveRadialGradientCenterY",
					                    deviceType,
					                    value ?? 50,
					                );
					                setResponsiveValue(
					                    "responsiveBackgroundGradient",
					                    deviceType,
					                    withRadialCenter(
					                        currentBackgroundGradient,
					                        currentRadialCenterX ?? 50,
					                        value ?? 50,
					                    ),
					                );
					            }}
					            min={0}
					            max={100}
					        />
					    </>
					)}
					{showBackgroundImage && (
					    <>
					        <BaseControl label={__("Background Image", "adaire-blocks")}>
					            <MediaUploadCheck>
					                <MediaUpload
					                    onSelect={(media) =>
					                        setAttributes({
					                            backgroundImageUrl: media.url,
					                            backgroundImageId: media.id,
					                        })
					                    }
					                    allowedTypes={["image"]}
					                    value={backgroundImageId}
					                    render={({ open }) => (
					                        <div style={{ marginBottom: "10px" }}>
					                            {backgroundImageUrl ? (
					                                <div
					                                    style={{
					                                        marginBottom: "10px",
					                                        position: "relative",
					                                    }}
					                                >
					                                    <img
					                                        src={backgroundImageUrl}
					                                        alt=""
					                                        style={{ width: "100%", borderRadius: "4px" }}
					                                    />
					                                    <Button
					                                        isDestructive
					                                        onClick={() =>
					                                            setAttributes({
					                                                backgroundImageUrl: "",
					                                                backgroundImageId: 0,
					                                            })
					                                        }
					                                        style={{
					                                            position: "absolute",
					                                            top: "5px",
					                                            right: "5px",
					                                        }}
					                                    >
					                                        {__("Remove", "adaire-blocks")}
					                                    </Button>
					                                </div>
					                            ) : (
					                                <Button isSecondary onClick={open}>
					                                    {__("Select Image", "adaire-blocks")}
					                                </Button>
					                            )}
					                        </div>
					                    )}
					                />
					            </MediaUploadCheck>
					        </BaseControl>
					        <SelectControl
					            label={__("Background Size", "adaire-blocks")}
					            value={backgroundSize}
					            options={[
					                { label: __("Cover", "adaire-blocks"), value: "cover" },
					                { label: __("Contain", "adaire-blocks"), value: "contain" },
					                { label: __("Fixed", "adaire-blocks"), value: "fixed" },
					                { label: __("Original", "adaire-blocks"), value: "auto" },
					            ]}
					            onChange={(value) => setAttributes({ backgroundSize: value })}
					        />
					        <SelectControl
					            label={__("Background Position", "adaire-blocks")}
					            value={backgroundPosition}
					            options={[
					                { label: __("Top Left", "adaire-blocks"), value: "top left" },
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
					                    label: __("Center Center", "adaire-blocks"),
					                    value: "center center",
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
					                setAttributes({ backgroundPosition: value })
					            }
					        />
					        <SelectControl
					            label={__("Background Repeat", "adaire-blocks")}
					            value={backgroundRepeat}
					            options={[
					                {
					                    label: __("No Repeat", "adaire-blocks"),
					                    value: "no-repeat",
					                },
					                { label: __("Repeat", "adaire-blocks"), value: "repeat" },
					                { label: __("Repeat X", "adaire-blocks"), value: "repeat-x" },
					                { label: __("Repeat Y", "adaire-blocks"), value: "repeat-y" },
					            ]}
					            onChange={(value) => setAttributes({ backgroundRepeat: value })}
					        />
					    </>
					)}

					<SelectControl
					    label={__("Overlay Type", "adaire-blocks")}
					    value={overlayType}
					    options={[
					        { label: __("None", "adaire-blocks"), value: "none" },
					        { label: __("Solid", "adaire-blocks"), value: "solid" },
					        { label: __("Gradient", "adaire-blocks"), value: "gradient" },
					    ]}
					    onChange={(value) => setAttributes({ overlayType: value })}
					/>

					{overlayType === "solid" && (
					    <>
					        <PanelColorSettings
					            title={__("Overlay Color", "adaire-blocks")}
					            initialOpen={true}
					            colorSettings={[
					                {
					                    value: overlayColor,
					                    onChange: (value) => setAttributes({ overlayColor: value }),
					                    label: __("Solid Color", "adaire-blocks"),
					                },
					            ]}
					        />
					        <RangeControl
					            label={__("Overlay Opacity", "adaire-blocks")}
					            value={overlayOpacity}
					            onChange={(value) => setAttributes({ overlayOpacity: value })}
					            min={0}
					            max={1}
					            step={0.1}
					        />
					    </>
					)}

					{overlayType === "gradient" && (
					    <BaseControl label={__("Overlay Gradient", "adaire-blocks")}>
					        <GradientPicker
					            value={overlayGradient}
					            onChange={(value) => setAttributes({ overlayGradient: value })}
					        />
					    </BaseControl>
					)}
				</PanelBody>
				<PanelBody
					section="style"
					title={ PANEL.COLORS }
					initialOpen={false}
				>
					<BreakpointNote deviceType={deviceType} tiers={FIVE_TIERS} />
					{/* Preheader colour only applies while the preheader is shown. */}
					{showPreheader && (
						<BaseControl label={__("Preheader Color", "adaire-blocks")}>
						    <ColorPicker
						        color={preheaderColor}
						        onChangeComplete={(color) =>
						            setAttributes({ preheaderColor: color.hex })
						        }
						        disableAlpha
						    />
						</BaseControl>
					)}
					<BaseControl label={__("Breadcrumbs Color", "adaire-blocks")}>
					    <ColorPicker
					        color={breadcrumbsColor}
					        onChangeComplete={(color) =>
					            setAttributes({ breadcrumbsColor: color.hex })
					        }
					        disableAlpha
					    />
					</BaseControl>
					<BaseControl label={__("Heading Color", "adaire-blocks")}>
					    <ColorPicker
					        color={headingColor}
					        onChangeComplete={(color) =>
					            setAttributes({ headingColor: color.hex })
					        }
					        disableAlpha
					    />
					</BaseControl>
					<BaseControl label={__("Text Color", "adaire-blocks")}>
					    <ColorPicker
					        color={textColor}
					        onChangeComplete={(color) =>
					            setAttributes({ textColor: color.hex })
					        }
					        disableAlpha
					    />
					</BaseControl>
				</PanelBody>
				<PanelBody
					section="style"
					title={ PANEL.TYPOGRAPHY }
					initialOpen={false}
				>
					<BreakpointNote deviceType={deviceType} tiers={FIVE_TIERS} />
					{/* Preheader typography only applies while the preheader is shown. */}
					{showPreheader && (
						<UnitControl
						    label={__("Font Size", "adaire-blocks")}
						    value={currentPreheaderFontSize}
						    onChange={(value) =>
						        setResponsiveValue(
						            "responsivePreheaderFontSize",
						            deviceType,
						            value || "18px",
						        )
						    }
						    units={[
						        { value: "px", label: "px" },
						        { value: "rem", label: "rem" },
						        { value: "em", label: "em" },
						    ]}
						/>
					)}
					{/* Preheader typography only applies while the preheader is shown. */}
					{showPreheader && (
						<UnitControl
						    label={__("Line Height", "adaire-blocks")}
						    value={currentPreheaderLineHeight}
						    onChange={(value) =>
						        setResponsiveValue(
						            "responsivePreheaderLineHeight",
						            deviceType,
						            value || "28px",
						        )
						    }
						    units={[
						        { value: "px", label: "px" },
						        { value: "rem", label: "rem" },
						        { value: "em", label: "em" },
						    ]}
						/>
					)}
					<p
					    style={{ marginBottom: "12px", fontWeight: 600, fontSize: "13px" }}
					>
					    {__("Colors & Font Weights", "adaire-blocks")}
					</p>
					{showPreheader && (
					    <>
					        {/* Preheader typography only applies while the preheader is shown. */}
					        {showPreheader && (
						        <SelectControl
						            label={__("Preheader Font Weight", "adaire-blocks")}
						            value={preheaderFontWeight}
						            options={[
						                { label: __("Thin (100)", "adaire-blocks"), value: "100" },
						                {
						                    label: __("Extra Light (200)", "adaire-blocks"),
						                    value: "200",
						                },
						                { label: __("Light (300)", "adaire-blocks"), value: "300" },
						                { label: __("Normal (400)", "adaire-blocks"), value: "400" },
						                { label: __("Medium (500)", "adaire-blocks"), value: "500" },
						                {
						                    label: __("Semi Bold (600)", "adaire-blocks"),
						                    value: "600",
						                },
						                { label: __("Bold (700)", "adaire-blocks"), value: "700" },
						                {
						                    label: __("Extra Bold (800)", "adaire-blocks"),
						                    value: "800",
						                },
						                { label: __("Black (900)", "adaire-blocks"), value: "900" },
						            ]}
						            onChange={(value) =>
						                setAttributes({ preheaderFontWeight: value })
						            }
						        />
					        )}
					    </>
					)}
					<SelectControl
					    label={__("Heading Font Weight", "adaire-blocks")}
					    value={headingFontWeight}
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
					    onChange={(value) => setAttributes({ headingFontWeight: value })}
					/>
					<SelectControl
					    label={__("Text Font Weight", "adaire-blocks")}
					    value={textFontWeight}
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
					    onChange={(value) => setAttributes({ textFontWeight: value })}
					/>

					<p
					    style={{
					        marginTop: "24px",
					        marginBottom: "8px",
					        fontWeight: 600,
					        fontSize: "13px",
					    }}
					>
					    {__("Responsive Sizes", "adaire-blocks")}
					</p>
					<UnitControl
					    label={__("Heading Font Size", "adaire-blocks")}
					    value={currentHeadingFontSize}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveHeadingFontSize",
					            deviceType,
					            value || "72px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "em", label: "em" },
					        { value: "rem", label: "rem" },
					    ]}
					/>
					<UnitControl
					    label={__("Heading Line Height", "adaire-blocks")}
					    value={currentHeadingLineHeight}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveHeadingLineHeight",
					            deviceType,
					            value || "92px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "em", label: "em" },
					        { value: "rem", label: "rem" },
					    ]}
					/>

					<UnitControl
					    label={__("Text Font Size", "adaire-blocks")}
					    value={currentTextFontSize}
					    onChange={(value) =>
					        setResponsiveValue(
					            "responsiveTextFontSize",
					            deviceType,
					            value || "26px",
					        )
					    }
					    units={[
					        { value: "px", label: "px" },
					        { value: "em", label: "em" },
					        { value: "rem", label: "rem" },
					    ]}
					/>

				</PanelBody>
				<PanelBody
					section="style"
					title={ PANEL.BORDER }
					initialOpen={false}
				>
					<BreakpointNote deviceType={deviceType} tiers={FIVE_TIERS} />
					{/* Media styling only applies when the block renders media. */}
					{(mediaType === "image" || mediaType === "video") && (
						<UnitControl
						    label={ LABEL.BORDER_RADIUS }
						    value={currentVideoBorderRadius}
						    onChange={(value) =>
						        setResponsiveValue(
						            "responsiveVideoBorderRadius",
						            deviceType,
						            value || "16px",
						        )
						    }
						    units={[
						        { value: "px", label: "px" },
						        { value: "rem", label: "rem" },
						    ]}
						/>
					)}
				</PanelBody>
			</InspectorTabs>

            <div {...blockProps}>
				{overlayType !== "none" && (
					<div className={`adaire-hero-banner-overlay is-type-${overlayType}`} />
                )}
                {showBreadcrumbs && (
					<nav
						className="adaire-hero-banner__breadcrumbs"
						aria-label={__("Breadcrumb", "adaire-blocks")}
					>
                        {(breadcrumbsItems || []).map((item, index) => (
                            <span key={index}>
                                {item.url ? (
									<a
										href={item.url}
										style={{ textDecoration: "none", color: "inherit" }}
									>
                                        {item.text}
                                    </a>
                                ) : (
                                    <span>{item.text}</span>
                                )}
								{index < (breadcrumbsItems || []).length - 1 && (
									<span style={{ margin: "0 8px" }}>/</span>
								)}
                            </span>
                        ))}
                    </nav>
                )}
				{mediaType === "video" || mediaType === "image" ? (
                    <div className="adaire-hero-banner__content-video-wrapper">
                <QuickZone
                    id="content"
                    label={__("Content", "adaire-blocks")}
                    activeZone={activeZone}
                    setActiveZone={setActiveZone}
                    content={
                        <>
                            <TextareaControl
                                label={__("Heading", "adaire-blocks")}
                                value={headingText}
                                onChange={(value) => setAttributes({ headingText: value })}
                            />
                            <TextControl
                                label={__("Text Content", "adaire-blocks")}
                                value={textContent}
                                onChange={(value) => setAttributes({ textContent: value })}
                            />
                        </>
                    }
                >
                <div className="adaire-hero-banner__cta-container">
                    {showPreheader && (
								<div className="adaire-hero-banner__preheader">{preheaderText}</div>
							)}
							<h2 className="adaire-hero-banner__heading">
								{renderTextWithLineBreaks(headingText)}
							</h2>
							<p className="adaire-hero-banner__text">{textContent}</p>
							<div {...innerBlocksProps} />
						</div>
						</QuickZone>
						{mediaType === "image" ? (
							<div className="adaire-hero-banner__video-player">
								{mediaImageUrl ? (
									<img
										src={mediaImageUrl}
										alt=""
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
									/>
								) : (
									<div
										style={{
											padding: "20px",
											textAlign: "center",
											color: "#fff",
										}}
									>
										{__("Please select an image", "adaire-blocks")}
                        </div>
                    )}
                </div>
						) : (
                        <div className="adaire-hero-banner__video-player">
								{videoType === "wp" && wpVideoUrl ? (
                            <video
                                src={wpVideoUrl}
                                controls
                                style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
                                }}
                            />
								) : videoType === "youtube" && videoUrl ? (
                            <iframe
										src={getEmbedUrl(videoUrl, "youtube")}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="YouTube video player"
                            />
								) : videoType === "vimeo" && videoUrl ? (
                            <iframe
										src={getEmbedUrl(videoUrl, "vimeo")}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                title="Vimeo video player"
                            />
                        ) : (
									<div
										style={{
											padding: "20px",
											textAlign: "center",
											color: "#fff",
										}}
									>
										{__("Please configure your video", "adaire-blocks")}
                            </div>
                        )}
                        </div>
						)}
                    </div>
                ) : (
                    <QuickZone
                        id="content"
                        label={__("Content", "adaire-blocks")}
                        activeZone={activeZone}
                        setActiveZone={setActiveZone}
                        content={
                            <>
                                <TextareaControl
                                    label={__("Heading", "adaire-blocks")}
                                    value={headingText}
                                    onChange={(value) => setAttributes({ headingText: value })}
                                />
                                <TextControl
                                    label={__("Text Content", "adaire-blocks")}
                                    value={textContent}
                                    onChange={(value) => setAttributes({ textContent: value })}
                                />
                            </>
                        }
                    >
                    <div className="adaire-hero-banner__cta-container">
                        {showPreheader && (
							<div className="adaire-hero-banner__preheader">{preheaderText}</div>
                        )}
						<h2 className="adaire-hero-banner__heading">
							{renderTextWithLineBreaks(headingText)}
						</h2>
						<p className="adaire-hero-banner__text">{textContent}</p>
                        <div {...innerBlocksProps} />
                    </div>
                    </QuickZone>
                )}
                {showIcon && iconImageUrl && (
                    <div
                        className="adaire-hero-banner__icon"
                        data-icon-position={iconPosition}
                        data-icon-vertical-position={iconVerticalPosition}
                    >
                        <img src={iconImageUrl} alt="" className="adaire-hero-banner__icon" />
                    </div>
                )}
            </div>
        </>
    );
}




