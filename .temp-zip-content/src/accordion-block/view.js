document.addEventListener('DOMContentLoaded', function() {
    // Find all accordion blocks on the page
    const accordions = document.querySelectorAll('.adaire-accordion');
    
    accordions.forEach(accordion => {
        const headers = accordion.querySelectorAll('.adaire-accordion__header');
        const items = accordion.querySelectorAll('.adaire-accordion__item');
        const allowMultiple = accordion.getAttribute('data-allow-multiple') === 'true';
        const firstOpen = accordion.getAttribute('data-first-open') === 'true';

        // Normalize initial open state based on settings:
        // - If firstOpen is true: only the first item should be open.
        // - If firstOpen is false: all items should start closed.
        if (items.length > 0) {
            if (firstOpen) {
                items.forEach((item, index) => {
                    const panel = item.querySelector('.adaire-accordion__panel');
                    if (!panel) return;

                    if (index === 0) {
                        item.classList.add('is-open');
                        panel.style.height = panel.scrollHeight + 'px';
                    } else {
                        item.classList.remove('is-open');
                        panel.style.height = '0px';
                    }
                });
            } else {
                items.forEach(item => {
                    const panel = item.querySelector('.adaire-accordion__panel');
                    if (!panel) return;

                    item.classList.remove('is-open');
                    panel.style.height = '0px';
                });
            }
        }

        // If heights weren't set above (e.g. no explicit config), ensure panels are normalized
        items.forEach(item => {
            const panel = item.querySelector('.adaire-accordion__panel');
            if (!panel) return;
            const isOpen = item.classList.contains('is-open');

            if (isOpen && !panel.style.height) {
                panel.style.height = panel.scrollHeight + 'px';
            } else if (!isOpen && !panel.style.height) {
                panel.style.height = '0px';
            }
        });
        
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const item = this.closest('.adaire-accordion__item');
                const panel = item.querySelector('.adaire-accordion__panel');
                const isOpen = item.classList.contains('is-open');
                
                if (!allowMultiple) {
                    // Close all other items
                    const allItems = accordion.querySelectorAll('.adaire-accordion__item');
                    allItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('is-open');
                            const otherPanel = otherItem.querySelector('.adaire-accordion__panel');
                            otherPanel.style.height = '0px';
                        }
                    });
                }
                
                // Toggle current item
                if (isOpen) {
                    item.classList.remove('is-open');
                    panel.style.height = '0px';
                } else {
                    item.classList.add('is-open');
                    // Force a reflow to ensure the transition works
                    panel.style.height = panel.scrollHeight + 'px';
                }
            });
        });
    });
});



