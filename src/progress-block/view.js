document.addEventListener("DOMContentLoaded", function () {
	const blocks = document.querySelectorAll(".adaire-progress-bar");

	if (!blocks.length) return;

	const prefersReducedMotion =
		window.matchMedia &&
		window.matchMedia("(prefers-reduce-motion: reduce), (prefers-reduced-motion: reduce)").matches;

	const animateBlock = (block) => {
		const duration = parseInt(block.dataset.animationDuration, 10) || 1200;

		// Bar fills
		block.querySelectorAll(".adaire-progress-bar__fill").forEach((fill) => {
			const value = parseFloat(fill.dataset.value) || 0;
			if (prefersReducedMotion) {
				fill.style.transitionDuration = "0ms";
			}
			// Force layout before setting target so the transition actually runs.
			requestAnimationFrame(() => {
				fill.style.width = `${value}%`;
			});
		});

		// Ring fills
		block.querySelectorAll(".adaire-progress-bar__ring-fill").forEach((ring) => {
			const value = parseFloat(ring.dataset.value) || 0;
			const radius = ring.r ? ring.r.baseVal.value : 45;
			const circumference = 2 * Math.PI * radius;
			const offset = circumference - (value / 100) * circumference;
			if (prefersReducedMotion) {
				ring.style.transitionDuration = "0ms";
			}
			requestAnimationFrame(() => {
				ring.style.strokeDashoffset = `${offset}`;
			});
		});

		// Ring percentage text — count up in step with the fill animation.
		block.querySelectorAll(".adaire-progress-bar__ring-text").forEach((text) => {
			const target = parseFloat(text.dataset.value) || 0;
			if (prefersReducedMotion || !target) {
				text.textContent = `${target}%`;
				return;
			}
			const start = performance.now();
			const step = (now) => {
				const progress = Math.min((now - start) / duration, 1);
				text.textContent = `${Math.round(progress * target)}%`;
				if (progress < 1) {
					requestAnimationFrame(step);
				}
			};
			requestAnimationFrame(step);
		});
	};

	if (!("IntersectionObserver" in window)) {
		blocks.forEach(animateBlock);
		return;
	}

	const observer = new IntersectionObserver(
		(entries, obs) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					animateBlock(entry.target);
					obs.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.25 }
	);

	blocks.forEach((block) => observer.observe(block));
});
