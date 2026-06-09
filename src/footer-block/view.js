document.addEventListener('DOMContentLoaded', function() {
    // Find all footer blocks on the page
    const footers = document.querySelectorAll('.adaire-footer');
    
    footers.forEach(footer => {
        const locationHeaders = footer.querySelectorAll('.adaire-footer__location-header');
        const locations = footer.querySelectorAll('.adaire-footer__location');
        
        // Initialize accordion state
        locations.forEach(location => {
            const panel = location.querySelector('.adaire-footer__location-panel');
            const isOpen = location.classList.contains('is-open');
            
            if (panel) {
                if (isOpen) {
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                } else {
                    panel.style.maxHeight = '0px';
                }
            }
        });
        
        // Add click handlers for accordion
        locationHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const location = this.closest('.adaire-footer__location');
                const panel = location.querySelector('.adaire-footer__location-panel');
                const icon = location.querySelector('.adaire-footer__location-icon');
                const isOpen = location.classList.contains('is-open');
                
                // Close all other locations (accordion behavior)
                locations.forEach(otherLocation => {
                    if (otherLocation !== location) {
                        otherLocation.classList.remove('is-open');
                        const otherPanel = otherLocation.querySelector('.adaire-footer__location-panel');
                        const otherIcon = otherLocation.querySelector('.adaire-footer__location-icon');
                        if (otherPanel) {
                            otherPanel.style.maxHeight = '0px';
                        }
                        if (otherIcon) {
                            otherIcon.textContent = '+';
                        }
                        const otherHeader = otherLocation.querySelector('.adaire-footer__location-header');
                        if (otherHeader) {
                            otherHeader.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
                
                // Toggle current location
                if (isOpen) {
                    location.classList.remove('is-open');
                    if (panel) {
                        panel.style.maxHeight = '0px';
                    }
                    if (icon) {
                        icon.textContent = '+';
                    }
                    this.setAttribute('aria-expanded', 'false');
                } else {
                    location.classList.add('is-open');
                    if (panel) {
                        // Force a reflow to ensure the transition works
                        panel.style.maxHeight = panel.scrollHeight + 'px';
                    }
                    if (icon) {
                        icon.textContent = 'âˆ’';
                    }
                    this.setAttribute('aria-expanded', 'true');
                }
            });
        });
    });
});




