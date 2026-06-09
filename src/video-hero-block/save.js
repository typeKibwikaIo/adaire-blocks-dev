import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const {
		videos,
		transitionDuration,
		autoPlay,
		showControls,
		backgroundColor,
		textColor,
		titleFontSize,
		titleFontSizeUnit,
		titleFontWeight,
		descriptionFontSize,
		descriptionFontSizeUnit,
		overlayOpacity,
		navArrowLeftColor,
		navArrowLeftColorHover,
		navArrowRightColor,
		navArrowRightColorHover,
		blockId,
		navArrowLeftBgColor,
		navArrowLeftBgColorHover,
		navArrowRightBgColor,
		navArrowRightBgColorHover,
		navArrowLeftBgOpacity,
		navArrowLeftBgOpacityHover,
		navArrowRightBgOpacity,
		navArrowRightBgOpacityHover,
		navArrowLeftBgBlur,
		navArrowLeftBgBlurHover,
		navArrowRightBgBlur,
		navArrowRightBgBlurHover,
		titleScrollingGap,
		titleScrollingGapTablet,
		titleScrollingGapMobile,
		titleScrollingSpeed,
		titleFontSizeTablet,
		titleFontSizeMobile,
		descriptionFontSizeTablet,
		descriptionFontSizeMobile,
		overlayType,
		overlayGradientStart,
		overlayGradientEnd,
		overlayGradientDirection,
		overlayGradientStartOpacity,
		overlayGradientEndOpacity,
	} = attributes;

	// Helper function to convert hex color to RGB and apply opacity
	const applyOpacityToColor = (colorString, opacity) => {
		if (!colorString) return `rgba(255, 255, 255, ${opacity})`;
		
		// Handle hex colors (e.g., #ff0000 or #f00)
		if (colorString.startsWith('#')) {
			const hex = colorString.replace('#', '');
			let r, g, b;
			
			if (hex.length === 3) {
				// Short hex format (#f00)
				r = parseInt(hex[0] + hex[0], 16);
				g = parseInt(hex[1] + hex[1], 16);
				b = parseInt(hex[2] + hex[2], 16);
			} else if (hex.length === 6) {
				// Full hex format (#ff0000)
				r = parseInt(hex.substr(0, 2), 16);
				g = parseInt(hex.substr(2, 2), 16);
				b = parseInt(hex.substr(4, 2), 16);
			} else {
				// Invalid hex, fallback
				return `rgba(255, 255, 255, ${opacity})`;
			}
			
			return `rgba(${r}, ${g}, ${b}, ${opacity})`;
		}
		
		// Handle existing rgba/rgb strings
		const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		if (match) {
			const r = match[1];
			const g = match[2];
			const b = match[3];
			return `rgba(${r}, ${g}, ${b}, ${opacity})`;
		}
		
		// Fallback if parsing fails
		return `rgba(255, 255, 255, ${opacity})`;
	};

	// Helper function to generate overlay background
	const getOverlayBackground = () => {
		if (overlayType === 'gradient') {
			const startColor = applyOpacityToColor(overlayGradientStart, overlayGradientStartOpacity || 0.5);
			const endColor = applyOpacityToColor(overlayGradientEnd, overlayGradientEndOpacity || 0.3);
			return `linear-gradient(${overlayGradientDirection || 'to bottom'}, ${startColor}, ${endColor})`;
		} else {
			return `rgba(0, 0, 0, ${overlayOpacity || 0.3})`;
		}
	};

	// Helper function to extract video ID from URL
	const getVideoId = (url, type) => {
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
	const getEmbedUrl = (url, type, autoplay = true, muted = true) => {
		const videoId = getVideoId(url, type);
		if (!videoId) return "";

		if (type === "youtube") {
			const params = new URLSearchParams({
				autoplay: autoplay ? "1" : "0",
				mute: muted ? "1" : "0",
				controls: showControls ? "1" : "0",
				loop: "1",
				playlist: videoId,
				rel: "0",
				modestbranding: "1",
			});
			return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
		} else if (type === "vimeo") {
			const params = new URLSearchParams({
				autoplay: autoplay ? "1" : "0",
				muted: muted ? "1" : "0",
				controls: showControls ? "1" : "0",
				loop: "1",
				background: "1",
			});
			return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
		}
		return "";
	};

		const blockProps = useBlockProps.save({
			className: "ad-video-hero-block",
			"data-videos": JSON.stringify(videos),
			"data-transition-duration": transitionDuration,
			"data-autoplay": autoPlay,
			"data-show-controls": showControls,
			style: {
			backgroundColor: backgroundColor || "#000000",
			color: textColor || "#ffffff",
			"--text-color": textColor || "#ffffff",
			"--title-font-size": `${titleFontSize || 48}${titleFontSizeUnit || "px"}`,
			"--title-font-weight": titleFontWeight || "700",
			"--description-font-size": `${descriptionFontSize || 18}${
				descriptionFontSizeUnit || "px"
			}`,
			"--overlay-opacity": overlayOpacity || 0.3,
			"--nav-arrow-left-color": navArrowLeftColor || "rgba(255, 255, 255, 0.7)",
			"--nav-arrow-left-color-hover":
				navArrowLeftColorHover || "rgba(255, 255, 255, 1)",
			"--nav-arrow-right-color":
				navArrowRightColor || "rgba(138, 43, 226, 0.8)",
			"--nav-arrow-right-color-hover":
				navArrowRightColorHover || "rgba(138, 43, 226, 1)",
			"--nav-arrow-left-bg-color": applyOpacityToColor(
				navArrowLeftBgColor,
				navArrowLeftBgOpacity || 0.1,
			),
			"--nav-arrow-left-bg-color-hover": applyOpacityToColor(
				navArrowLeftBgColorHover,
				navArrowLeftBgOpacityHover || 0.2,
			),
			"--nav-arrow-right-bg-color": applyOpacityToColor(
				navArrowRightBgColor,
				navArrowRightBgOpacity || 0.1,
			),
			"--nav-arrow-right-bg-color-hover": applyOpacityToColor(
				navArrowRightBgColorHover,
				navArrowRightBgOpacityHover || 0.2,
			),
			"--nav-arrow-left-bg-blur": `${navArrowLeftBgBlur || 0}px`,
			"--nav-arrow-left-bg-blur-hover": `${navArrowLeftBgBlurHover || 0}px`,
			"--nav-arrow-right-bg-blur": `${navArrowRightBgBlur || 0}px`,
			"--nav-arrow-right-bg-blur-hover": `${navArrowRightBgBlurHover || 0}px`,
			"--title-scrolling-gap": `${titleScrollingGap || 300}px`,
			"--title-scrolling-gap-tablet": `${titleScrollingGapTablet || 200}px`,
			"--title-scrolling-gap-mobile": `${titleScrollingGapMobile || 150}px`,
			"--title-scrolling-speed": titleScrollingSpeed || 100,
			"--title-font-size-tablet": `${titleFontSizeTablet || 36}px`,
			"--title-font-size-mobile": `${titleFontSizeMobile || 28}px`,
			"--description-font-size-tablet": `${descriptionFontSizeTablet || 16}px`,
			"--description-font-size-mobile": `${descriptionFontSizeMobile || 14}px`,
			"--overlay-type": overlayType || "solid",
			"--overlay-gradient-start": overlayGradientStart || "rgba(0, 0, 0, 0.5)",
			"--overlay-gradient-end": overlayGradientEnd || "rgba(0, 0, 0, 0.3)",
			"--overlay-gradient-direction": overlayGradientDirection || "to bottom",
		},
		id: blockId || undefined
	});

	return (
		<div {...blockProps}>
			<div className="ad-video-hero-block__container">
				{/* Video Background - placeholder for dynamic content */}
				<div className="ad-video-hero-block__video-background">
					{/* Dynamic video slides will be injected here by view.js */}
				</div>

				{/* Overlay */}
				<div
					className="ad-video-hero-block__video-overlay"
					style={{
						"--overlay-background": getOverlayBackground(),
					}}
				></div>

				{/* Content placeholder - dynamic content will be injected here by view.js */}
				<div className="ad-video-hero-block__video-content-placeholder" style={{ zIndex: 3 }}>
					{/* Dynamic video content will be injected here by view.js */}
				</div>

				{/* Navigation Indicators - placeholder for dynamic content */}
				{videos && videos.length > 1 && (
					<div className="ad-video-hero-block__video-indicators">
						{/* Navigation Arrows */}
						<div className="ad-video-hero-block__navigation-arrows">
							<button
								className="ad-video-hero-block__nav-arrow ad-video-hero-block__nav-arrow-left"
								data-direction="prev"
							>
								<svg viewBox="0 0 24 24">
									<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
								</svg>
							</button>
							<button
								className="ad-video-hero-block__nav-arrow ad-video-hero-block__nav-arrow-right"
								data-direction="next"
							>
								<svg viewBox="0 0 24 24">
									<path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
								</svg>
							</button>
						</div>
						{/* Progress Indicators - placeholder for dynamic content */}
						<div className="ad-video-hero-block__progress-indicators">
							{/* Dynamic indicators will be injected here by view.js */}
						</div>
					</div>
				)}
				{/* Navigation Cursor - positioned outside content for better z-index control */}
				{videos && videos.length > 0 && (
					<div className="ad-video-hero-block__video-cursor" style={{ zIndex: 10 }}>
						<span className="ad-video-hero-block__cursor-text">{">"}</span>
					</div>
				)}
			</div>
		</div>
	);
}





