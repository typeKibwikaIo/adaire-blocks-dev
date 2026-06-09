import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Save({ attributes }) {
    const {
        blockId,
        breadcrumbsText,
        breadcrumbsItems,
        headingText,
        textContent,
        showBreadcrumbs,
        iconImageUrl,
        showIcon,
        iconPosition,
        iconVerticalPosition,
        backgroundGradient,
        breadcrumbsColor,
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
        responsiveBreadcrumbTopOffset,
        responsiveBreadcrumbLeftOffset,
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

	const isRadialGradient = (gradient) =>
		typeof gradient === "string" &&
		gradient.trim().toLowerCase().startsWith("radial-gradient(");

	const withRadialCenter = (gradient, x, y) => {
		if (!isRadialGradient(gradient)) return gradient;
		const safeX = Number.isFinite(Number(x)) ? Number(x) : 50;
		const safeY = Number.isFinite(Number(y)) ? Number(y) : 50;
		const pos = `${safeX}% ${safeY}%`;

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

	const renderTextWithLineBreaks = (text) => {
		const lines = String(text ?? "").split(/\r?\n/);
		return lines.flatMap((line, i) =>
			i === lines.length - 1 ? [line] : [line, <br key={`br-${i}`} />],
		);
	};

    // Helper function to extract video ID from URL
    const getVideoId = (url, type) => {
        if (!url) return '';
        if (type === 'youtube') {
            const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
            return match ? match[1] : '';
        } else if (type === 'vimeo') {
            const match = url.match(/(?:vimeo\.com\/)([0-9]+)/);
            return match ? match[1] : '';
        }
        return '';
    };

    // Helper function to get embed URL
    const getEmbedUrl = (url, type) => {
        const videoId = getVideoId(url, type);
        if (!videoId) return '';
        if (type === 'youtube') {
            return `https://www.youtube.com/embed/${videoId}`;
        } else if (type === 'vimeo') {
            return `https://player.vimeo.com/video/${videoId}`;
        }
        return '';
    };

    const blockProps = useBlockProps.save({
        className: 'adaire-hero-1-container',
        id: blockId || undefined,
        style: {
            // Background (responsive)
            '--hero-bg-gradient-mobile': getBackgroundGradientForBreakpoint('mobile'),
            '--hero-bg-gradient-tablet': getBackgroundGradientForBreakpoint('tablet'),
            '--hero-bg-gradient-small-laptop': getBackgroundGradientForBreakpoint('smallLaptop'),
            '--hero-bg-gradient-desktop': getBackgroundGradientForBreakpoint('desktop'),
            '--hero-bg-gradient-big-desktop': getBackgroundGradientForBreakpoint('bigDesktop'),
            '--hero-breadcrumbs-color': breadcrumbsColor || '#ffffff',
            '--hero-heading-color': headingColor || '#ffffff',
            '--hero-text-color': textColor || '#ffffff',
            '--hero-heading-font-weight': headingFontWeight || '500',
            '--hero-text-font-weight': textFontWeight || '300',

            // Container - Min Height
            '--hero-min-height-mobile': responsiveMinHeight?.mobile || 'auto',
            '--hero-min-height-tablet': responsiveMinHeight?.tablet || 'auto',
            '--hero-min-height-small-laptop': responsiveMinHeight?.smallLaptop || 'auto',
            '--hero-min-height-desktop': responsiveMinHeight?.desktop || '100vh',
            '--hero-min-height-big-desktop': responsiveMinHeight?.bigDesktop || '100vh',

            // Container - Width
            '--hero-width-mobile': responsiveWidth?.mobile || '100%',
            '--hero-width-tablet': responsiveWidth?.tablet || '100%',
            '--hero-width-small-laptop': responsiveWidth?.smallLaptop || '100%',
            '--hero-width-desktop': responsiveWidth?.desktop || '100vw',
            '--hero-width-big-desktop': responsiveWidth?.bigDesktop || '100vw',

            // Container - Flex Direction
            '--hero-flex-direction-mobile': responsiveFlexDirection?.mobile || 'column',
            '--hero-flex-direction-tablet': responsiveFlexDirection?.tablet || 'row',
            '--hero-flex-direction-small-laptop': responsiveFlexDirection?.smallLaptop || 'row',
            '--hero-flex-direction-desktop': responsiveFlexDirection?.desktop || 'row',
            '--hero-flex-direction-big-desktop': responsiveFlexDirection?.bigDesktop || 'row',

            // Container - Justify Content
            '--hero-justify-content-mobile': responsiveJustifyContent?.mobile || 'center',
            '--hero-justify-content-tablet': responsiveJustifyContent?.tablet || 'flex-start',
            '--hero-justify-content-small-laptop': responsiveJustifyContent?.smallLaptop || 'flex-start',
            '--hero-justify-content-desktop': responsiveJustifyContent?.desktop || 'flex-start',
            '--hero-justify-content-big-desktop': responsiveJustifyContent?.bigDesktop || 'flex-start',

            // Container - Align Items
            '--hero-align-items-mobile': responsiveAlignItems?.mobile || 'flex-start',
            '--hero-align-items-tablet': responsiveAlignItems?.tablet || 'center',
            '--hero-align-items-small-laptop': responsiveAlignItems?.smallLaptop || 'center',
            '--hero-align-items-desktop': responsiveAlignItems?.desktop || 'center',
            '--hero-align-items-big-desktop': responsiveAlignItems?.bigDesktop || 'center',

            // Container - Padding
            '--hero-padding-top-mobile': responsivePadding?.mobile?.top || '20px',
            '--hero-padding-right-mobile': responsivePadding?.mobile?.right || '16px',
            '--hero-padding-bottom-mobile': responsivePadding?.mobile?.bottom || '20px',
            '--hero-padding-left-mobile': responsivePadding?.mobile?.left || '16px',
            '--hero-padding-top-tablet': responsivePadding?.tablet?.top || '40px',
            '--hero-padding-right-tablet': responsivePadding?.tablet?.right || '30px',
            '--hero-padding-bottom-tablet': responsivePadding?.tablet?.bottom || '40px',
            '--hero-padding-left-tablet': responsivePadding?.tablet?.left || '40px',
            '--hero-padding-top-small-laptop': responsivePadding?.smallLaptop?.top || '40px',
            '--hero-padding-right-small-laptop': responsivePadding?.smallLaptop?.right || '60px',
            '--hero-padding-bottom-small-laptop': responsivePadding?.smallLaptop?.bottom || '40px',
            '--hero-padding-left-small-laptop': responsivePadding?.smallLaptop?.left || '80px',
            '--hero-padding-top-desktop': responsivePadding?.desktop?.top || '60px',
            '--hero-padding-right-desktop': responsivePadding?.desktop?.right || '150px',
            '--hero-padding-bottom-desktop': responsivePadding?.desktop?.bottom || '60px',
            '--hero-padding-left-desktop': responsivePadding?.desktop?.left || '200px',
            '--hero-padding-top-big-desktop': responsivePadding?.bigDesktop?.top || '60px',
            '--hero-padding-right-big-desktop': responsivePadding?.bigDesktop?.right || '150px',
            '--hero-padding-bottom-big-desktop': responsivePadding?.bigDesktop?.bottom || '60px',
            '--hero-padding-left-big-desktop': responsivePadding?.bigDesktop?.left || '200px',

            // CTA Container Width
            '--hero-cta-width-mobile': responsiveCtaWidth?.mobile || '100%',
            '--hero-cta-width-tablet': responsiveCtaWidth?.tablet || '100%',
            '--hero-cta-width-small-laptop': responsiveCtaWidth?.smallLaptop || '60%',
            '--hero-cta-width-desktop': responsiveCtaWidth?.desktop || '45%',
            '--hero-cta-width-big-desktop': responsiveCtaWidth?.bigDesktop || '45%',

            // CTA Container - Margin
            '--hero-cta-margin-top-mobile': responsiveCtaMargin?.mobile?.top || '0px',
            '--hero-cta-margin-right-mobile': responsiveCtaMargin?.mobile?.right || '0px',
            '--hero-cta-margin-bottom-mobile': responsiveCtaMargin?.mobile?.bottom || '0px',
            '--hero-cta-margin-left-mobile': responsiveCtaMargin?.mobile?.left || '0px',
            '--hero-cta-margin-top-tablet': responsiveCtaMargin?.tablet?.top || '0px',
            '--hero-cta-margin-right-tablet': responsiveCtaMargin?.tablet?.right || '0px',
            '--hero-cta-margin-bottom-tablet': responsiveCtaMargin?.tablet?.bottom || '0px',
            '--hero-cta-margin-left-tablet': responsiveCtaMargin?.tablet?.left || '0px',
            '--hero-cta-margin-top-small-laptop': responsiveCtaMargin?.smallLaptop?.top || '0px',
            '--hero-cta-margin-right-small-laptop': responsiveCtaMargin?.smallLaptop?.right || '0px',
            '--hero-cta-margin-bottom-small-laptop': responsiveCtaMargin?.smallLaptop?.bottom || '0px',
            '--hero-cta-margin-left-small-laptop': responsiveCtaMargin?.smallLaptop?.left || '0px',
            '--hero-cta-margin-top-desktop': responsiveCtaMargin?.desktop?.top || '0px',
            '--hero-cta-margin-right-desktop': responsiveCtaMargin?.desktop?.right || '0px',
            '--hero-cta-margin-bottom-desktop': responsiveCtaMargin?.desktop?.bottom || '0px',
            '--hero-cta-margin-left-desktop': responsiveCtaMargin?.desktop?.left || '0px',
            '--hero-cta-margin-top-big-desktop': responsiveCtaMargin?.bigDesktop?.top || '0px',
            '--hero-cta-margin-right-big-desktop': responsiveCtaMargin?.bigDesktop?.right || '0px',
            '--hero-cta-margin-bottom-big-desktop': responsiveCtaMargin?.bigDesktop?.bottom || '0px',
            '--hero-cta-margin-left-big-desktop': responsiveCtaMargin?.bigDesktop?.left || '0px',

            // Heading Typography
            '--hero-heading-font-size-mobile': responsiveHeadingFontSize?.mobile || '28px',
            '--hero-heading-font-size-tablet': responsiveHeadingFontSize?.tablet || '42px',
            '--hero-heading-font-size-small-laptop': responsiveHeadingFontSize?.smallLaptop || '52px',
            '--hero-heading-font-size-desktop': responsiveHeadingFontSize?.desktop || '72px',
            '--hero-heading-font-size-big-desktop': responsiveHeadingFontSize?.bigDesktop || '72px',
            '--hero-heading-line-height-mobile': responsiveHeadingLineHeight?.mobile || '36px',
            '--hero-heading-line-height-tablet': responsiveHeadingLineHeight?.tablet || '54px',
            '--hero-heading-line-height-small-laptop': responsiveHeadingLineHeight?.smallLaptop || '68px',
            '--hero-heading-line-height-desktop': responsiveHeadingLineHeight?.desktop || '92px',
            '--hero-heading-line-height-big-desktop': responsiveHeadingLineHeight?.bigDesktop || '92px',
            '--hero-heading-margin-bottom-mobile': responsiveHeadingMarginBottom?.mobile || '12px',
            '--hero-heading-margin-bottom-tablet': responsiveHeadingMarginBottom?.tablet || '18px',
            '--hero-heading-margin-bottom-small-laptop': responsiveHeadingMarginBottom?.smallLaptop || '20px',
            '--hero-heading-margin-bottom-desktop': responsiveHeadingMarginBottom?.desktop || '24px',
            '--hero-heading-margin-bottom-big-desktop': responsiveHeadingMarginBottom?.bigDesktop || '24px',
            '--hero-heading-margin-top-mobile': responsiveHeadingMarginTop?.mobile || '0px',
            '--hero-heading-margin-top-tablet': responsiveHeadingMarginTop?.tablet || '0px',
            '--hero-heading-margin-top-small-laptop': responsiveHeadingMarginTop?.smallLaptop || '0px',
            '--hero-heading-margin-top-desktop': responsiveHeadingMarginTop?.desktop || '0px',
            '--hero-heading-margin-top-big-desktop': responsiveHeadingMarginTop?.bigDesktop || '0px',

            // Text Typography
            '--hero-text-font-size-mobile': responsiveTextFontSize?.mobile || '14px',
            '--hero-text-font-size-tablet': responsiveTextFontSize?.tablet || '18px',
            '--hero-text-font-size-small-laptop': responsiveTextFontSize?.smallLaptop || '20px',
            '--hero-text-font-size-desktop': responsiveTextFontSize?.desktop || '26px',
            '--hero-text-font-size-big-desktop': responsiveTextFontSize?.bigDesktop || '26px',
            '--hero-text-margin-bottom-mobile': responsiveTextMarginBottom?.mobile || '16px',
            '--hero-text-margin-bottom-tablet': responsiveTextMarginBottom?.tablet || '20px',
            '--hero-text-margin-bottom-small-laptop': responsiveTextMarginBottom?.smallLaptop || '20px',
            '--hero-text-margin-bottom-desktop': responsiveTextMarginBottom?.desktop || '24px',
            '--hero-text-margin-bottom-big-desktop': responsiveTextMarginBottom?.bigDesktop || '24px',
            '--hero-text-margin-top-mobile': responsiveTextMarginTop?.mobile || '0px',
            '--hero-text-margin-top-tablet': responsiveTextMarginTop?.tablet || '0px',
            '--hero-text-margin-top-small-laptop': responsiveTextMarginTop?.smallLaptop || '0px',
            '--hero-text-margin-top-desktop': responsiveTextMarginTop?.desktop || '0px',
            '--hero-text-margin-top-big-desktop': responsiveTextMarginTop?.bigDesktop || '0px',

            // Button Container
            '--hero-button-container-flex-direction-mobile': responsiveButtonContainerFlexDirection?.mobile || 'column',
            '--hero-button-container-flex-direction-tablet': responsiveButtonContainerFlexDirection?.tablet || 'row',
            '--hero-button-container-flex-direction-small-laptop': responsiveButtonContainerFlexDirection?.smallLaptop || 'row',
            '--hero-button-container-flex-direction-desktop': responsiveButtonContainerFlexDirection?.desktop || 'row',
            '--hero-button-container-flex-direction-big-desktop': responsiveButtonContainerFlexDirection?.bigDesktop || 'row',
            '--hero-button-container-gap-mobile': responsiveButtonContainerGap?.mobile || '12px',
            '--hero-button-container-gap-tablet': responsiveButtonContainerGap?.tablet || '20px',
            '--hero-button-container-gap-small-laptop': responsiveButtonContainerGap?.smallLaptop || '25px',
            '--hero-button-container-gap-desktop': responsiveButtonContainerGap?.desktop || '35px',
            '--hero-button-container-gap-big-desktop': responsiveButtonContainerGap?.bigDesktop || '35px',
            '--hero-button-container-margin-top-mobile': responsiveButtonContainerMarginTop?.mobile || '0px',
            '--hero-button-container-margin-top-tablet': responsiveButtonContainerMarginTop?.tablet || '0px',
            '--hero-button-container-margin-top-small-laptop': responsiveButtonContainerMarginTop?.smallLaptop || '0px',
            '--hero-button-container-margin-top-desktop': responsiveButtonContainerMarginTop?.desktop || '0px',
            '--hero-button-container-margin-top-big-desktop': responsiveButtonContainerMarginTop?.bigDesktop || '0px',

            // Icon
            '--hero-icon-width-mobile': responsiveIconWidth?.mobile || '0px',
            '--hero-icon-width-tablet': responsiveIconWidth?.tablet || '0px',
            '--hero-icon-width-small-laptop': responsiveIconWidth?.smallLaptop || '500px',
            '--hero-icon-width-desktop': responsiveIconWidth?.desktop || '700px',
            '--hero-icon-width-big-desktop': responsiveIconWidth?.bigDesktop || '700px',
            '--hero-icon-transform-mobile': responsiveIconTransform?.mobile || 'none',
            '--hero-icon-transform-tablet': responsiveIconTransform?.tablet || 'none',
            '--hero-icon-transform-small-laptop': responsiveIconTransform?.smallLaptop || 'translateY(-50%)',
            '--hero-icon-transform-desktop': responsiveIconTransform?.desktop || 'translateY(-50%)',
            '--hero-icon-transform-big-desktop': responsiveIconTransform?.bigDesktop || 'translateY(-50%)',
            '--hero-icon-position': iconPosition || 'right',
            '--hero-icon-vertical-position': iconVerticalPosition || 'top',

            // Icon - Vertical Offset (conditional: top or bottom based on iconVerticalPosition)
            '--hero-icon-vertical-offset-mobile': responsiveIconVerticalOffset?.mobile || '0px',
            '--hero-icon-vertical-offset-tablet': responsiveIconVerticalOffset?.tablet || '0px',
            '--hero-icon-vertical-offset-small-laptop': responsiveIconVerticalOffset?.smallLaptop || '0px',
            '--hero-icon-vertical-offset-desktop': responsiveIconVerticalOffset?.desktop || '0px',
            '--hero-icon-vertical-offset-big-desktop': responsiveIconVerticalOffset?.bigDesktop || '0px',

            // Icon - Horizontal Offset (conditional: left or right based on iconPosition)
            '--hero-icon-horizontal-offset-mobile': responsiveIconHorizontalOffset?.mobile || '0px',
            '--hero-icon-horizontal-offset-tablet': responsiveIconHorizontalOffset?.tablet || '0px',
            '--hero-icon-horizontal-offset-small-laptop': responsiveIconHorizontalOffset?.smallLaptop || '0px',
            '--hero-icon-horizontal-offset-desktop': responsiveIconHorizontalOffset?.desktop || '0px',
            '--hero-icon-horizontal-offset-big-desktop': responsiveIconHorizontalOffset?.bigDesktop || '0px',

            // Preheader - Font Size
            '--hero-preheader-font-size-mobile': responsivePreheaderFontSize?.mobile || '14px',
            '--hero-preheader-font-size-tablet': responsivePreheaderFontSize?.tablet || '16px',
            '--hero-preheader-font-size-small-laptop': responsivePreheaderFontSize?.smallLaptop || '18px',
            '--hero-preheader-font-size-desktop': responsivePreheaderFontSize?.desktop || '18px',
            '--hero-preheader-font-size-big-desktop': responsivePreheaderFontSize?.bigDesktop || '18px',

            // Preheader - Line Height
            '--hero-preheader-line-height-mobile': responsivePreheaderLineHeight?.mobile || '20px',
            '--hero-preheader-line-height-tablet': responsivePreheaderLineHeight?.tablet || '24px',
            '--hero-preheader-line-height-small-laptop': responsivePreheaderLineHeight?.smallLaptop || '28px',
            '--hero-preheader-line-height-desktop': responsivePreheaderLineHeight?.desktop || '28px',
            '--hero-preheader-line-height-big-desktop': responsivePreheaderLineHeight?.bigDesktop || '28px',

            // Preheader - Margin Bottom
            '--hero-preheader-margin-bottom-mobile': responsivePreheaderMarginBottom?.mobile || '8px',
            '--hero-preheader-margin-bottom-tablet': responsivePreheaderMarginBottom?.tablet || '12px',
            '--hero-preheader-margin-bottom-small-laptop': responsivePreheaderMarginBottom?.smallLaptop || '12px',
            '--hero-preheader-margin-bottom-desktop': responsivePreheaderMarginBottom?.desktop || '12px',
            '--hero-preheader-margin-bottom-big-desktop': responsivePreheaderMarginBottom?.bigDesktop || '12px',

            // Preheader - Style
            '--hero-preheader-color': preheaderColor || '#ffffff',
            '--hero-preheader-font-weight': preheaderFontWeight || '500',

            // Breadcrumb - Top Offset
            '--hero-breadcrumb-top-offset-mobile': responsiveBreadcrumbTopOffset?.mobile || '20px',
            '--hero-breadcrumb-top-offset-tablet': responsiveBreadcrumbTopOffset?.tablet || '40px',
            '--hero-breadcrumb-top-offset-small-laptop': responsiveBreadcrumbTopOffset?.smallLaptop || '60px',
            '--hero-breadcrumb-top-offset-desktop': responsiveBreadcrumbTopOffset?.desktop || '90px',
            '--hero-breadcrumb-top-offset-big-desktop': responsiveBreadcrumbTopOffset?.bigDesktop || '90px',

            // Breadcrumb - Left Offset
            '--hero-breadcrumb-left-offset-mobile': responsiveBreadcrumbLeftOffset?.mobile || '16px',
            '--hero-breadcrumb-left-offset-tablet': responsiveBreadcrumbLeftOffset?.tablet || '40px',
            '--hero-breadcrumb-left-offset-small-laptop': responsiveBreadcrumbLeftOffset?.smallLaptop || '80px',
            '--hero-breadcrumb-left-offset-desktop': responsiveBreadcrumbLeftOffset?.desktop || '200px',
            '--hero-breadcrumb-left-offset-big-desktop': responsiveBreadcrumbLeftOffset?.bigDesktop || '200px',

            // Background Image (conditional)
            '--hero-bg-image': showBackgroundImage && backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
            '--hero-bg-size': backgroundSize || 'cover',
            '--hero-bg-position': backgroundPosition || 'center',
            '--hero-bg-repeat': backgroundRepeat || 'no-repeat',

            // Overlay
            '--hero-overlay-bg-solid': overlayColor || 'transparent',
            '--hero-overlay-opacity': overlayOpacity !== undefined ? overlayOpacity : 0.5,
            '--hero-overlay-bg-gradient': overlayGradient || 'none',

            // Text Alignment
            '--hero-text-alignment-mobile': responsiveTextAlignment?.mobile || 'left',
            '--hero-text-alignment-tablet': responsiveTextAlignment?.tablet || 'left',
            '--hero-text-alignment-small-laptop': responsiveTextAlignment?.smallLaptop || 'left',
            '--hero-text-alignment-desktop': responsiveTextAlignment?.desktop || 'left',
            '--hero-text-alignment-big-desktop': responsiveTextAlignment?.bigDesktop || 'left',

            // Button Alignment
            '--hero-button-alignment-mobile': responsiveButtonAlignment?.mobile === 'center' ? 'center' : responsiveButtonAlignment?.mobile === 'right' ? 'flex-end' : 'flex-start',
            '--hero-button-alignment-tablet': responsiveButtonAlignment?.tablet === 'center' ? 'center' : responsiveButtonAlignment?.tablet === 'right' ? 'flex-end' : 'flex-start',
            '--hero-button-alignment-small-laptop': responsiveButtonAlignment?.smallLaptop === 'center' ? 'center' : responsiveButtonAlignment?.smallLaptop === 'right' ? 'flex-end' : 'flex-start',
            '--hero-button-alignment-desktop': responsiveButtonAlignment?.desktop === 'center' ? 'center' : responsiveButtonAlignment?.desktop === 'right' ? 'flex-end' : 'flex-start',
            '--hero-button-alignment-big-desktop': responsiveButtonAlignment?.bigDesktop === 'center' ? 'center' : responsiveButtonAlignment?.bigDesktop === 'right' ? 'flex-end' : 'flex-start',

            // Video Player Dimensions
            '--hero-video-width-mobile': responsiveVideoWidth?.mobile || '100%',
            '--hero-video-width-tablet': responsiveVideoWidth?.tablet || '100%',
            '--hero-video-width-small-laptop': responsiveVideoWidth?.smallLaptop || '50%',
            '--hero-video-width-desktop': responsiveVideoWidth?.desktop || '50%',
            '--hero-video-width-big-desktop': responsiveVideoWidth?.bigDesktop || '50%',
            '--hero-video-height-mobile': responsiveVideoHeight?.mobile || '300px',
            '--hero-video-height-tablet': responsiveVideoHeight?.tablet || '400px',
            '--hero-video-height-small-laptop': responsiveVideoHeight?.smallLaptop || '500px',
            '--hero-video-height-desktop': responsiveVideoHeight?.desktop || '600px',
            '--hero-video-height-big-desktop': responsiveVideoHeight?.bigDesktop || '600px',
            '--hero-video-border-radius-mobile': responsiveVideoBorderRadius?.mobile || '8px',
            '--hero-video-border-radius-tablet': responsiveVideoBorderRadius?.tablet || '8px',
            '--hero-video-border-radius-small-laptop': responsiveVideoBorderRadius?.smallLaptop || '12px',
            '--hero-video-border-radius-desktop': responsiveVideoBorderRadius?.desktop || '16px',
            '--hero-video-border-radius-big-desktop': responsiveVideoBorderRadius?.bigDesktop || '16px',

            // Content & Video Container Alignment (uses same values as main container when media is present)
            '--hero-content-video-justify-mobile': mediaType === 'image' || mediaType === 'video' ? responsiveJustifyContent?.mobile || 'center' : responsiveContentVideoJustify?.mobile || 'flex-start',
            '--hero-content-video-justify-tablet': mediaType === 'image' || mediaType === 'video' ? responsiveJustifyContent?.tablet || 'flex-start' : responsiveContentVideoJustify?.tablet || 'flex-start',
            '--hero-content-video-justify-small-laptop': mediaType === 'image' || mediaType === 'video' ? responsiveJustifyContent?.smallLaptop || 'flex-start' : responsiveContentVideoJustify?.smallLaptop || 'space-between',
            '--hero-content-video-justify-desktop': mediaType === 'image' || mediaType === 'video' ? responsiveJustifyContent?.desktop || 'flex-start' : responsiveContentVideoJustify?.desktop || 'space-between',
            '--hero-content-video-justify-big-desktop': mediaType === 'image' || mediaType === 'video' ? responsiveJustifyContent?.bigDesktop || 'flex-start' : responsiveContentVideoJustify?.bigDesktop || 'space-between',
            '--hero-content-video-align-mobile': mediaType === 'image' || mediaType === 'video' ? responsiveAlignItems?.mobile || 'flex-start' : responsiveContentVideoAlign?.mobile || 'flex-start',
            '--hero-content-video-align-tablet': mediaType === 'image' || mediaType === 'video' ? responsiveAlignItems?.tablet || 'center' : responsiveContentVideoAlign?.tablet || 'center',
            '--hero-content-video-align-small-laptop': mediaType === 'image' || mediaType === 'video' ? responsiveAlignItems?.smallLaptop || 'center' : responsiveContentVideoAlign?.smallLaptop || 'center',
            '--hero-content-video-align-desktop': mediaType === 'image' || mediaType === 'video' ? responsiveAlignItems?.desktop || 'center' : responsiveContentVideoAlign?.desktop || 'center',
            '--hero-content-video-align-big-desktop': mediaType === 'image' || mediaType === 'video' ? responsiveAlignItems?.bigDesktop || 'center' : responsiveContentVideoAlign?.bigDesktop || 'center',
        },
    });

    const innerBlocksProps = useInnerBlocksProps.save({
        className: 'adaire-hero-1__button-container',
    });


    return (
        <div {...blockProps}>
            {overlayType !== 'none' && (
                <div
                    className={`adaire-hero-1-overlay is-type-${overlayType}`}
                />
            )}
            {showBreadcrumbs && (
                <nav className="adaire-hero-1__breadcrumbs" aria-label={__('Breadcrumb', 'hero-1-block')}>
                    {(breadcrumbsItems || []).map((item, index) => (
                        <span key={index}>
                            {item.url ? (
                                <a href={item.url} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {item.text}
                                </a>
                            ) : (
                                <span>{item.text}</span>
                            )}
                            {index < (breadcrumbsItems || []).length - 1 && <span style={{ margin: '0 8px' }}>/</span>}
                        </span>
                    ))}
                </nav>
            )}
            {mediaType === 'video' || mediaType === 'image' ? (
                <div className="adaire-hero-1__content-video-wrapper">
                    <div className="adaire-hero-1__cta-container">
                        {showPreheader && (
                            <div className="adaire-hero-1__preheader">
                                {preheaderText}
                            </div>
                        )}
                        <h2 className="adaire-hero-1__heading">
                            {renderTextWithLineBreaks(headingText)}
                        </h2>
                        <p className="adaire-hero-1__text">
                            {textContent}
                        </p>
                        <div {...innerBlocksProps} />
                    </div>
                    {mediaType === 'image' ? (
                        <div className="adaire-hero-1__video-player">
                            {mediaImageUrl ? (
                                <img
                                    src={mediaImageUrl}
                                    alt=""
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : null}
                        </div>
                    ) : (
                    <div className="adaire-hero-1__video-player">
                    {videoType === 'wp' && wpVideoUrl ? (
                        <video
                            src={wpVideoUrl}
                            controls
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : videoType === 'youtube' && videoUrl ? (
                        <iframe
                            src={getEmbedUrl(videoUrl, 'youtube')}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube video player"
                        />
                    ) : videoType === 'vimeo' && videoUrl ? (
                        <iframe
                            src={getEmbedUrl(videoUrl, 'vimeo')}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title="Vimeo video player"
                        />
                    ) : null}
                    </div>
                    )}
                </div>
            ) : (
            <div className="adaire-hero-1__cta-container">
                {showPreheader && (
                    <div className="adaire-hero-1__preheader">
                        {preheaderText}
                    </div>
                )}
                <h2 className="adaire-hero-1__heading">
                    {renderTextWithLineBreaks(headingText)}
                </h2>
                <p className="adaire-hero-1__text">
                    {textContent}
                </p>
                <div {...innerBlocksProps} />
            </div>
            )}
            {showIcon && iconImageUrl && (
                <div className="adaire-hero-1__icon" data-icon-position={iconPosition} data-icon-vertical-position={iconVerticalPosition}>
                    <img src={iconImageUrl} alt="" className="adaire-hero-1__icon" />
                </div>
            )}
        </div>
    );
}




