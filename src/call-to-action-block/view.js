// Call-to-Action Block Frontend JavaScript
// This file handles any frontend interactions for the call-to-action block

document.addEventListener("DOMContentLoaded", () => {
	// Find all call-to-action blocks
	const ctaBlocks = document.querySelectorAll('.cta-block');
	
	if (ctaBlocks.length === 0) return;
	ctaBlocks.forEach((block, index) => {
		// Add any frontend interactions here
		// For example, button click handlers, animations, etc.
		
		// Example: Add smooth scroll to buttons if they have href="#"
		const buttons = block.querySelectorAll('button, .ad-split__content__button button, .ad-stacked__content__button button, .ad-overlay__content__button button');
		
		buttons.forEach(button => {
			// Add hover effects
			button.addEventListener('mouseenter', () => {
				button.style.transform = 'translateY(-2px)';
				button.style.transition = 'all 0.3s ease';
			});
			
			button.addEventListener('mouseleave', () => {
				button.style.transform = 'translateY(0)';
			});
			
			// Add click effects
			button.addEventListener('mousedown', () => {
				button.style.transform = 'translateY(0) scale(0.98)';
			});
			
			button.addEventListener('mouseup', () => {
				button.style.transform = 'translateY(-2px) scale(1)';
			});
		});
		
		// Add entrance animations if needed
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.style.opacity = '1';
					entry.target.style.transform = 'translateY(0)';
				}
			});
		}, {
			threshold: 0.1
		});
		
		// Observe the block for entrance animations
		observer.observe(block);
		
		// Set initial state for animation
		block.style.opacity = '0';
		block.style.transform = 'translateY(30px)';
		block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
	});
});


