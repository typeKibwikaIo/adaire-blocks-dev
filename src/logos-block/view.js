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
			const gap = blockElement.dataset.gap || "1rem";
			const pauseOnHover = blockElement.dataset.pauseOnHover === "true";

			const splide = new Splide(splideElement, {
				type: "loop",
				perPage: slidesPerView,
				gap: gap,
				pagination: false,
				arrows: false,
				// Responsive breakpoints
				breakpoints: {
					1024: {
						perPage: Math.min(slidesPerView, 4), // Max 4 on small desktop
					},
					768: {
						perPage: Math.min(slidesPerView, 3), // Max 3 on tablet
						gap: '0.8rem',
					},
					640: {
						perPage: Math.min(slidesPerView, 2), // Max 2 on small tablet
						gap: '0.6rem',
					},
					480: {
						perPage: Math.min(slidesPerView, 2), // Max 2 on mobile
						gap: '0.5rem',
					},
					375: {
						perPage: 1, // Only 1 on iPhone size
						gap: '0.3rem',
					},
					320: {
						perPage: 1, // Only 1 on very small screens
						gap: '0.2rem',
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


