/**
 * Block Icons Admin Script
 * Replaces dashicon spans with custom SVG icons in the block management admin page
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Function to replace dashicon spans with custom SVG icons
        function replaceBlockIcons() {
            // Find all block items in the admin page
            const blockItems = document.querySelectorAll('.block-editor-block-types-list__item, .block-editor-inserter__item, .wp-block');
            
            blockItems.forEach(function(item) {
                // Find the icon span within each block item
                const iconSpan = item.querySelector('.dashicon, .block-editor-block-icon, .wp-block-icon');
                
                if (iconSpan) {
                    // Get the block name from the item
                    const blockName = item.getAttribute('data-wp-block') || 
                                    item.querySelector('[data-wp-block]')?.getAttribute('data-wp-block') ||
                                    item.className.match(/wp-block-([a-z-]+)/)?.[1];
                    
                    if (blockName) {
                        // Get the custom icon for this block
                        const customIcon = getCustomBlockIcon(blockName);
                        
                        if (customIcon) {
                            console.log("testtting")
                            // Replace the span content with the SVG
                            iconSpan.innerHTML = customIcon;
                            iconSpan.className = iconSpan.className.replace('dashicon', 'custom-block-icon');
                        }
                    }
                }
            });
        }

        // Function to get custom icon for a block
        function getCustomBlockIcon(blockName) {
            const blockIcons = {
                'accordion-block': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 5C0 2.23858 2.23858 0 5 0H19C21.7614 0 24 2.23858 24 5V19C24 21.7614 21.7614 24 19 24H5C2.23858 24 0 21.7614 0 19V5Z" fill="#F0F0F1"/><path d="M19.2083 2.375H5.79167C3.93921 2.375 2.4375 3.81142 2.4375 5.58333V18.4167C2.4375 20.1886 3.93921 21.625 5.79167 21.625H19.2083C21.0608 21.625 22.5625 20.1886 22.5625 18.4167V5.58333C22.5625 3.81142 21.0608 2.375 19.2083 2.375Z" fill="#F0F0F1" stroke="black"/><path opacity="0.92" d="M18.7785 5.125H6.22151C5.57937 5.125 5.05882 5.56472 5.05882 6.10714V6.89286C5.05882 7.43528 5.57937 7.875 6.22151 7.875H18.7785C19.4206 7.875 19.9412 7.43528 19.9412 6.89286V6.10714C19.9412 5.56472 19.4206 5.125 18.7785 5.125Z" fill="#FF0000"/><path opacity="0.92" d="M18.7785 10.625H6.22151C5.57937 10.625 5.05882 11.0647 5.05882 11.6071V12.3929C5.05882 12.9353 5.57937 13.375 6.22151 13.375H18.7785C19.4206 13.375 19.9412 12.9353 19.9412 12.3929V11.6071C19.9412 11.0647 19.4206 10.625 18.7785 10.625Z" fill="black"/><path opacity="0.92" d="M18.7785 16.125H6.22151C5.57937 16.125 5.05882 16.5647 5.05882 17.1071V17.8929C5.05882 18.4353 5.57937 18.875 6.22151 18.875H18.7785C19.4206 18.875 19.9412 18.4353 19.9412 17.8929V17.1071C19.9412 16.5647 19.4206 16.125 18.7785 16.125Z" fill="black"/></svg>',
                'button-block': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 5C0 2.23858 2.23858 0 5 0H19C21.7614 0 24 2.23858 24 5V19C24 21.7614 21.7614 24 19 24H5C2.23858 24 0 21.7614 0 19V5Z" fill="#F0F0F1"/><rect x="1.5" y="7.5" width="21" height="8" rx="1.5" fill="#F0F0F1" stroke="black"/><path opacity="0.92" d="M20.7656 10H18.2344C18.1049 10 18 10.4797 18 11.0714V11.9286C18 12.5203 18.1049 13 18.2344 13H20.7656C20.8951 13 21 12.5203 21 11.9286V11.0714C21 10.4797 20.8951 10 20.7656 10Z" fill="#FF0000" stroke="#FF0000"/><path opacity="0.92" d="M14.9844 10H4.01562C3.45471 10 3 10.4797 3 11.0714V11.9286C3 12.5203 3.45471 13 4.01562 13H14.9844C15.5453 13 16 12.5203 16 11.9286V11.0714C16 10.4797 15.5453 10 14.9844 10Z" fill="black" stroke="black"/></svg>',
                'counter-block': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 5C0 2.23858 2.23858 0 5 0H19C21.7614 0 24 2.23858 24 5V19C24 21.7614 21.7614 24 19 24H5C2.23858 24 0 21.7614 0 19V5Z" fill="#F0F0F1"/><path d="M7 10H17C17.5523 10 18 10.4477 18 11V13C18 13.5523 17.5523 14 17 14H7C6.44772 14 6 13.5523 6 13V11C6 10.4477 6.44772 10 7 10Z" fill="#F0F0F1" stroke="black"/><path d="M10 10V14" stroke="#FF0000" stroke-width="2" stroke-linecap="round"/><path d="M14 10V14" stroke="#FF0000" stroke-width="2" stroke-linecap="round"/></svg>',
                'questions-block': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 5C0 2.23858 2.23858 0 5 0H19C21.7614 0 24 2.23858 24 5V19C24 21.7614 21.7614 24 19 24H5C2.23858 24 0 21.7614 0 19V5Z" fill="#F0F0F1"/><path d="M7 6.3383C7.40327 5.22525 8.19923 4.28668 9.24692 3.68883C10.2946 3.09099 11.5264 2.87245 12.7241 3.07193C13.9219 3.2714 15.0083 3.87601 15.7909 4.77868C16.5735 5.68135 17.0018 6.82381 17 8.00373C17 11.3346 11.8542 13 11.8542 13" fill="#F0F0F1"/><path d="M7 6.3383C7.40327 5.22525 8.19923 4.28668 9.24692 3.68883C10.2946 3.09099 11.5264 2.87245 12.7241 3.07193C13.9219 3.2714 15.0083 3.87601 15.7909 4.77868C16.5735 5.68135 17.0018 6.82381 17 8.00373C17 11.3346 11.8542 13 11.8542 13" stroke="#FF0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="18" r="2" fill="black"/></svg>',
                'testimonial-block': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 5C0 2.23858 2.23858 0 5 0H19C21.7614 0 24 2.23858 24 5V19C24 21.7614 21.7614 24 19 24H5C2.23858 24 0 21.7614 0 19V5Z" fill="#F0F0F1"/><path d="M7 6H17C17.5523 6 18 6.44772 18 7V17C18 17.5523 17.5523 18 17 18H7C6.44772 18 6 17.5523 6 17V7C6 6.44772 6.44772 6 7 6Z" fill="#F0F0F1" stroke="black"/><path d="M10 10H14" stroke="#FF0000" stroke-width="2" stroke-linecap="round"/><path d="M10 13H14" stroke="#FF0000" stroke-width="2" stroke-linecap="round"/></svg>',
                'tabs-block': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 5C0 2.23858 2.23858 0 5 0H19C21.7614 0 24 2.23858 24 5V19C24 21.7614 21.7614 24 19 24H5C2.23858 24 0 21.7614 0 19V5Z" fill="#F0F0F1"/><path d="M7 6H17C17.5523 6 18 6.44772 18 7V17C18 17.5523 17.5523 18 17 18H7C6.44772 18 6 17.5523 6 17V7C6 6.44772 6.44772 6 7 6Z" fill="#F0F0F1" stroke="black"/><path d="M10 10H14" stroke="#FF0000" stroke-width="2" stroke-linecap="round"/><path d="M10 13H14" stroke="#FF0000" stroke-width="2" stroke-linecap="round"/></svg>',
                'portfolio-block': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 5C0 2.23858 2.23858 0 5 0H19C21.7614 0 24 2.23858 24 5V19C24 21.7614 21.7614 24 19 24H5C2.23858 24 0 21.7614 0 19V5Z" fill="#F0F0F1"/><path d="M7 6H17C17.5523 6 18 6.44772 18 7V17C18 17.5523 17.5523 18 17 18H7C6.44772 18 6 17.5523 6 17V7C6 6.44772 6.44772 6 7 6Z" fill="#F0F0F1" stroke="black"/><path d="M10 10H14" stroke="#FF0000" stroke-width="2" stroke-linecap="round"/><path d="M10 13H14" stroke="#FF0000" stroke-width="2" stroke-linecap="round"/></svg>'
            };

            return blockIcons[blockName] || null;
        }

        // Run the replacement function
        replaceBlockIcons();

        // Also run when new content is added (for dynamic content)
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    setTimeout(replaceBlockIcons, 100);
                }
            });
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
})();