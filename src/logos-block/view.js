import Splide from "@splidejs/splide";
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';

// The "Gap Between Items" attribute used to be a free-text CSS length
// (e.g. "1rem"); it's now a plain px number driving a RangeControl. Blocks
// saved before that change still emit the old string via data-gap, and
// parseFloat("1rem") alone would silently truncate that to 1 instead of 16.
function remToPx(value, fallback = 16) {
	if (typeof value === "string" && value.trim().endsWith("rem")) {
		const parsed = parseFloat(value);
		return Number.isFinite(parsed) ? parsed * 16 : fallback;
	}
	const parsed = parseFloat(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

document.addEventListener("DOMContentLoaded", () => {
	// Find all logos-block sliders
	const sliderElements = document.querySelectorAll(".logos-block .splide");
	sliderElements.forEach((splideElement, index) => {
		const blockElement = splideElement.closest(".logos-block");
		
		if (blockElement) {
			// Get settings from data attributes
			const sliderSpeed = parseFloat(blockElement.dataset.sliderSpeed) || 0.5;
			const slidesPerView = parseInt(blockElement.dataset.slidesPerView) || 4;
			const slidesPerViewTablet = parseInt(blockElement.dataset.slidesPerViewTablet) || 3;
			const slidesPerViewMobile = parseInt(blockElement.dataset.slidesPerViewMobile) || 2;
			const gap = `${remToPx(blockElement.dataset.gap)}px`;
			const pauseOnHover = blockElement.dataset.pauseOnHover === "true";

			const splide = new Splide(splideElement, {
				type: "loop",
				perPage: slidesPerView,
				gap: gap,
				pagination: false,
				arrows: false,
				// Responsive breakpoints — matches the plugin's 3-tier
				// desktop/tablet/mobile convention (same 1024/768 cutoffs
				// this block already uses for its container max-width).
				breakpoints: {
					1024: {
						perPage: slidesPerViewTablet,
					},
					768: {
						perPage: slidesPerViewMobile,
					},
				},
				// Continuous smooth scrolling settings
				autoScroll: {
					speed: sliderSpeed,
					pauseOnHover: pauseOnHover,
					pauseOnFocus: false,
				},
			});
			
			// Mount with AutoScroll extension
			splide.mount({ AutoScroll });
		}
	});
});


