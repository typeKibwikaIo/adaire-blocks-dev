document.addEventListener("DOMContentLoaded", () => {
	const blocks = document.querySelectorAll(".adaire-pricing-compare");

	blocks.forEach((block) => {
		const tabs = block.querySelectorAll(".pc-tab");
		const groups = block.querySelectorAll(".pc-group");
		const comparisonToggle = block.querySelector(".pc-comparison-toggle");
		const comparisonTable = block.querySelector(".pc-comparison");
		const stickyBar = block.querySelector(".pc-sticky");

		// 1. Tab Switching Logic
		tabs.forEach((tab) => {
			tab.addEventListener("click", () => {
				const targetGroup = tab.dataset.tab;

				// Update Tabs
				tabs.forEach((t) => t.classList.remove("is-active"));
				tab.classList.add("is-active");

				// Update Groups
				groups.forEach((group) => {
					if (group.dataset.groupId === targetGroup) {
						group.classList.add("is-active");
					} else {
						group.classList.remove("is-active");
					}
				});
			});
		});

		if (comparisonToggle && comparisonTable) {
			comparisonToggle.addEventListener("click", () => {
				const isHidden = comparisonTable.classList.contains("is-hidden");
				const textSpan = comparisonToggle.querySelector("span:not(.pc-toggle-icon)");
				const iconSpan = comparisonToggle.querySelector(".pc-toggle-icon");

				if (isHidden) {
					comparisonTable.classList.remove("is-hidden");
					if (textSpan) textSpan.textContent = "Compare features";
					if (iconSpan) iconSpan.textContent = "â€”";
				} else {
					comparisonTable.classList.add("is-hidden");
					if (textSpan) textSpan.textContent = "Compare features";
					if (iconSpan) iconSpan.textContent = "+";
				}
			});
		}

		// 3. Section Accordion Logic
		const sectionHeaders = block.querySelectorAll(".pc-section__header");
		sectionHeaders.forEach((header) => {
			header.addEventListener("click", () => {
				const section = header.closest(".pc-section");
				section.classList.toggle("is-open");
			});
		});

		// 4. Sticky Bar Visibility Logic (IntersectionObserver)
		if (stickyBar && comparisonTable) {
			const observerOptions = {
				root: null,
				threshold: 0.1,
				rootMargin: "0px 0px -10% 0px",
			};

			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					// Only show sticky bar if comparison table is visible AND it is being scrolled past
					if (entry.isIntersecting && !comparisonTable.classList.contains("is-hidden")) {
						stickyBar.classList.add("is-visible");
					} else {
						stickyBar.classList.remove("is-visible");
					}
				});
			}, observerOptions);

			observer.observe(comparisonTable);

			if (comparisonToggle) {
				comparisonToggle.addEventListener("click", () => {
					if (comparisonTable.classList.contains("is-hidden")) {
						stickyBar.classList.remove("is-visible");
					}
				});
			}
		}
	});
});



