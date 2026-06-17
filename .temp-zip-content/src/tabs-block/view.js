import { gsap } from 'gsap';

document.addEventListener('DOMContentLoaded', function() {
    const tabBlocks = document.querySelectorAll('.adaire-tabs');
    
    tabBlocks.forEach(tabBlock => {
        const tabs = tabBlock.querySelectorAll('.adaire-tabs__tab');
        const underline = tabBlock.querySelector('.adaire-tabs__underline');
        const contentPanels = tabBlock.querySelectorAll('.adaire-tab-panel');
        
        // Get animation settings from data attributes
        const duration = parseFloat(tabBlock.getAttribute('data-animation-duration')) || 0.6;
        const ease = tabBlock.getAttribute('data-animation-ease') || 'power2.out';
        const initialActiveTab = parseInt(tabBlock.getAttribute('data-active-tab')) || 0;
        
        let currentActiveIndex = initialActiveTab;
        
        // Calculate and set minimum height based on tallest panel
        const panelsWrapper = tabBlock.querySelector('.adaire-tabs__panels');
        let maxHeight = 0;
        
        // Temporarily show all panels to measure their heights
        contentPanels.forEach((panel) => {
            gsap.set(panel, { display: 'block', position: 'relative', opacity: 0, visibility: 'hidden' });
            const height = panel.scrollHeight;
            if (height > maxHeight) {
                maxHeight = height;
            }
        });
        
        // Set minimum height on the wrapper
        if (panelsWrapper && maxHeight > 0) {
            panelsWrapper.style.minHeight = `${maxHeight}px`;
        }
        
        // Now hide all panels except the active one
        contentPanels.forEach((panel, index) => {
            if (index !== initialActiveTab) {
                gsap.set(panel, { 
                    display: 'none', 
                    opacity: 0,
                    position: 'absolute',
                    visibility: 'hidden',
                    pointerEvents: 'none'
                });
                panel.classList.remove('is-active');
            } else {
                gsap.set(panel, { 
                    display: 'block', 
                    opacity: 1,
                    position: 'relative',
                    visibility: 'visible',
                    pointerEvents: 'auto'
                });
                panel.classList.add('is-active');
            }
        });
        
        // Initialize underline position
        function updateUnderline(tabElement, immediate = false) {
            if (!tabElement) return;
            
            // Check if we're in vertical layout
            const tabLayout = tabBlock.getAttribute('data-tab-layout');
            if (tabLayout === 'vertical') {
                // In vertical layout, we don't use the moving underline
                return;
            }
            
            const tabRect = tabElement.getBoundingClientRect();
            const listRect = tabElement.parentElement.getBoundingClientRect();
            const offsetLeft = tabRect.left - listRect.left;
            const width = tabRect.width;
            
            // Calculate vertical offset for wrapped tabs
            const offsetTop = tabRect.top - listRect.top;
            
            if (immediate) {
                gsap.set(underline, {
                    x: offsetLeft,
                    y: offsetTop,
                    width: width,
                });
            } else {
                gsap.to(underline, {
                    x: offsetLeft,
                    y: offsetTop,
                    width: width,
                    duration: duration,
                    ease: ease,
                });
            }
        }
        
        // Switch to a specific tab
        function switchToTab(index, immediate = false) {
            if (index === currentActiveIndex && !immediate) return;
            if (index < 0 || index >= contentPanels.length) return;
            
            const oldPanel = contentPanels[currentActiveIndex];
            const newPanel = contentPanels[index];
            const newTab = tabs[index];
            
            // Update tab buttons
            tabs.forEach((tab, i) => {
                if (i === index) {
                    tab.classList.add('is-active');
                    tab.setAttribute('aria-selected', 'true');
                } else {
                    tab.classList.remove('is-active');
                    tab.setAttribute('aria-selected', 'false');
                }
            });
            
            // Animate underline
            updateUnderline(newTab, immediate);
            
            // Fade out old content and fade in new content
            const tl = gsap.timeline();
            
            if (!immediate && oldPanel && oldPanel !== newPanel) {
                // Fade out old panel smoothly
                tl.to(oldPanel, {
                    opacity: 0,
                    y: -20,
                    duration: duration * 0.5,
                    ease: 'power2.in',
                    onComplete: () => {
                        oldPanel.classList.remove('is-active');
                        gsap.set(oldPanel, { 
                            display: 'none',
                            position: 'absolute',
                            visibility: 'hidden',
                            pointerEvents: 'none'
                        });
                    }
                });
            }
            
            // Hide all other panels immediately
            contentPanels.forEach((panel, i) => {
                if (i !== index && panel !== oldPanel) {
                    panel.classList.remove('is-active');
                    gsap.set(panel, { 
                        display: 'none', 
                        opacity: 0,
                        position: 'absolute',
                        visibility: 'hidden',
                        pointerEvents: 'none'
                    });
                }
            });
            
            // Fade in new content with stagger effect
            tl.set(newPanel, { 
                display: 'block', 
                opacity: 0, 
                y: 20,
                position: 'relative',
                visibility: 'visible',
                pointerEvents: 'auto'
            });
            tl.add(() => {
                newPanel.classList.add('is-active');
            });
            
            if (!immediate) {
                tl.to(newPanel, {
                    opacity: 1,
                    y: 0,
                    duration: duration * 0.6,
                    ease: ease,
                });
                
                // Animate children with stagger
                const panelContent = newPanel.querySelector('.adaire-tab-panel__content');
                if (panelContent) {
                    const children = panelContent.children;
                    if (children.length > 0) {
                        gsap.fromTo(children, 
                            {
                                opacity: 0,
                                y: 30,
                            },
                            {
                                opacity: 1,
                                y: 0,
                                duration: duration * 0.7,
                                stagger: 0.08,
                                ease: ease,
                                delay: duration * 0.3,
                            }
                        );
                    }
                }
            } else {
                tl.set(newPanel, { opacity: 1, y: 0 });
            }
            
            currentActiveIndex = index;
        }
        
        // Initialize on page load
        switchToTab(initialActiveTab, true);
        
        // Add click handlers
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                switchToTab(index);
            });
        });
        
        // Handle window resize - update underline position
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                updateUnderline(tabs[currentActiveIndex], true);
            }, 100);
        });
        
        // Keyboard navigation
        tabBlock.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('adaire-tabs__tab')) {
                const currentIndex = parseInt(e.target.getAttribute('data-tab-index'));
                let newIndex = currentIndex;
                
                switch(e.key) {
                    case 'ArrowLeft':
                        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                        e.preventDefault();
                        break;
                    case 'ArrowRight':
                        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                        e.preventDefault();
                        break;
                    case 'Home':
                        newIndex = 0;
                        e.preventDefault();
                        break;
                    case 'End':
                        newIndex = tabs.length - 1;
                        e.preventDefault();
                        break;
                }
                
                if (newIndex !== currentIndex) {
                    tabs[newIndex].focus();
                    switchToTab(newIndex);
                }
            }
        });
    });
});



