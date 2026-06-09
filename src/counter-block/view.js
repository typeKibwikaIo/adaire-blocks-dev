document.addEventListener(
	"DOMContentLoaded",
	function () {
		// Select ALL counter block instances on the page
		const counterBlocks = document.querySelectorAll(".ab-counter-block");
		// Loop through each block instance separately
		counterBlocks.forEach((counterBlock) => {
			const startingNumber = parseFloat(counterBlock.dataset.startingNumber);
			const endingNumber = parseFloat(counterBlock.dataset.endingNumber);
			const duration = parseFloat(counterBlock.dataset.duration);
			let delayTime = parseFloat(counterBlock.dataset.delayTime);
			const delayEnabled = counterBlock.dataset.delayBool === 'true';
			const counterDirection = counterBlock.dataset.counterDirection || 'up';
			const prefix = counterBlock.dataset.prefix || '';
			const suffix = counterBlock.dataset.suffix || '';
			
			const displayNum = counterBlock.querySelector(".displayNumber");
			// Calculate interval based on the difference
			const diff = Math.abs(endingNumber - startingNumber);
			const interval = duration / diff;

			// Counter logic
			if (displayNum) {
				// Set initial value
				displayNum.textContent = startingNumber;
				
				// If delay is disabled, set delay to 0
				if (!delayEnabled) {
					delayTime = 0;
				}

				// Run counter after delay
				setTimeout(() => {
					let currentNum = startingNumber;
					
					const counterInterval = setInterval(() => {
						// Count up or down based on direction
						if (counterDirection === 'down') {
							currentNum--;
						} else {
							currentNum++;
						}
						
						// Update display
						displayNum.textContent = currentNum;
						
						// Stop when we reach the target
						if (counterDirection === 'down' && currentNum <= endingNumber) {
							displayNum.textContent = endingNumber;
							clearInterval(counterInterval);
						} else if (counterDirection === 'up' && currentNum >= endingNumber) {
							displayNum.textContent = endingNumber;
							clearInterval(counterInterval);
						}
					}, interval);
				}, delayTime);
			}
		});
	},
	{ once: true }
);



