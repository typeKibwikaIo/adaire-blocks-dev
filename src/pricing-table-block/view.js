// Pricing Table Block Frontend JavaScript
document.addEventListener("DOMContentLoaded", () => {
	const blocks = document.querySelectorAll(".adaire-pricing-table");

	if (!blocks.length) return;

	blocks.forEach((block) => {
		const comparisonToggle = block.querySelector(
			".adaire-pricing-table__comparison-toggle",
		);
		const comparisonContent = block.querySelector(
			".adaire-pricing-table__comparison-content",
		);

		if (comparisonToggle && comparisonContent) {
			const setComparisonState = (expanded) => {
				comparisonToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
				comparisonContent.hidden = !expanded;
				block.classList.toggle("is-comparison-open", expanded);
			};

			comparisonToggle.addEventListener("click", (event) => {
				event.preventDefault();
				const isExpanded =
					comparisonToggle.getAttribute("aria-expanded") === "true";
				setComparisonState(!isExpanded);
			});

			setComparisonState(false);
		}
	});
});



