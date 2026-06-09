// Pricing Table Block Frontend JavaScript
document.addEventListener("DOMContentLoaded", () => {
	const blocks = document.querySelectorAll(".adaire-pricing-table");

	if (!blocks.length) return;

	blocks.forEach((block) => {
		const toggle = block.querySelector(".adaire-pricing-table__billing-toggle");
		const options = toggle
			? toggle.querySelectorAll(".adaire-pricing-table__billing-option")
			: [];
		const comparisonToggle = block.querySelector(
			".adaire-pricing-table__comparison-toggle",
		);
		const comparisonContent = block.querySelector(
			".adaire-pricing-table__comparison-content",
		);

		const setBillingMode = (mode) => {
			if (!mode || (mode !== "monthly" && mode !== "yearly")) {
				mode = "monthly";
			}

			block.classList.remove(
				"adaire-pricing-table--billing-monthly",
				"adaire-pricing-table--billing-yearly",
			);
			block.classList.add(`adaire-pricing-table--billing-${mode}`);

			options.forEach((option) => {
				const billing = option.getAttribute("data-billing");
				option.classList.toggle("is-active", billing === mode);
				option.setAttribute("aria-pressed", billing === mode ? "true" : "false");
			});
		};

		if (toggle && options.length) {
			options.forEach((option) => {
				option.addEventListener("click", (event) => {
					event.preventDefault();
					const mode = option.getAttribute("data-billing");
					setBillingMode(mode);
				});
			});

			if (block.classList.contains("adaire-pricing-table--billing-yearly")) {
				setBillingMode("yearly");
			} else {
				setBillingMode("monthly");
			}
		}

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



