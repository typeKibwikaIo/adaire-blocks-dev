import Splide from "@splidejs/splide";
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';

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
			const gap = blockElement.dataset.gap || "1rem";
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
						gap: '0.8rem',
					},
					768: {
						perPage: slidesPerViewMobile,
						gap: '0.5rem',
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


