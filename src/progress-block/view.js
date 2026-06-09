document.addEventListener("DOMContentLoaded", function () {
	const progressBlocks = document.querySelectorAll(".adaire-progress-block");

	if (!progressBlocks.length) return;

	const updateProgress = () => {
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollableHeight = documentHeight - windowHeight;
		const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

		progressBlocks.forEach((block) => {
			const variant = block.classList.contains("adaire-progress-block--ring")
				? "ring"
				: "bar";

			if (variant === "bar") {
				const fill = block.querySelector(".adaire-progress-block__fill");
				if (fill) {
					fill.style.width = `${progress}%`;
				}
			} else if (variant === "ring") {
				const fill = block.querySelector(".adaire-progress-block__ring-fill");
				const text = block.querySelector(".adaire-progress-block__ring-text");
				if (fill) {
					const radius = 45;
					const circumference = 2 * Math.PI * radius;
					const offset = circumference - (progress / 100) * circumference;
					fill.style.strokeDasharray = `${circumference}`;
					fill.style.strokeDashoffset = `${offset}`;
				}
				if (text) {
					text.textContent = `${Math.round(progress)}%`;
				}
			}
		});
	};

	// Initial update
	updateProgress();

	// Update on scroll
	let ticking = false;
	window.addEventListener("scroll", () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				updateProgress();
				ticking = false;
			});
			ticking = true;
		}
	});

	// Update on resize
	window.addEventListener("resize", () => {
		updateProgress();
	});
});





