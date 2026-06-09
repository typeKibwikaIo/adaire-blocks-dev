import { Splide } from '@splidejs/splide';

// Frontend JavaScript for Carousel Text Block
document.addEventListener('DOMContentLoaded', function() {
    const carouselBlocks = document.querySelectorAll('.ad-carousel-text-block');
    
    carouselBlocks.forEach(function(block) {
        const splideContainer = block.querySelector(".splide");
        if (splideContainer) {
            // Get configuration from data attributes
            const slidesPerView = parseInt(block.dataset.slidesPerView) || 3;
            const slidesPerViewMobile = parseInt(block.dataset.slidesPerViewMobile) || 1;
            const slidesPerViewTablet = parseInt(block.dataset.slidesPerViewTablet) || 2;
            const slidesPerViewDesktop = parseInt(block.dataset.slidesPerViewDesktop) || 3;
            const spaceBetween = parseInt(block.dataset.spaceBetween) || 50;
            const cardGapDesktop = parseInt(block.dataset.cardGapDesktop) || 30;
            const cardGapTablet = parseInt(block.dataset.cardGapTablet) || 20;
            const cardGapMobile = parseInt(block.dataset.cardGapMobile) || 15;
            const loop = block.dataset.loop === 'true';
            const navigation = block.dataset.navigation === 'true';
            const pagination = block.dataset.pagination === 'true';
            const scrollbar = block.dataset.scrollbar === 'true';
            
            // Count actual slides
            const totalSlides = splideContainer.querySelectorAll('.splide__slide').length;
            
            // Splide loop works better with fewer restrictions
            const shouldLoop = loop && totalSlides > 1;
            
            try {
                // Determine current screen size and appropriate slides per view
                const getCurrentSlidesPerView = () => {
                    if (window.innerWidth >= 1024) {
                        return slidesPerViewDesktop;
                    } else if (window.innerWidth >= 768) {
                        return slidesPerViewTablet;
                    } else {
                        return slidesPerViewMobile;
                    }
                };

                const splideInstance = new Splide(splideContainer, {
                    type: shouldLoop ? 'loop' : 'slide',
                    perPage: getCurrentSlidesPerView(),
                    perMove: 1,
                    gap: cardGapDesktop,
                    padding: '0',
                    arrows: navigation,
                    pagination: pagination,
                    drag: 'free',
                    focus: 'center',
                    trimSpace: false,
                    updateOnMove: true,
                    resetProgress: false,
                    speed: 600,
                    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                    breakpoints: {
                        1023: {
                            perPage: slidesPerViewTablet,
                            gap: cardGapTablet,
                        },
                        767: {
                            perPage: slidesPerViewMobile,
                            gap: cardGapMobile,
                        }
                    }
                });
                
                // Mount the Splide instance
                splideInstance.mount();
                
                // Store the instance for potential cleanup
                splideContainer.splideInstance = splideInstance;
                
                // Add cleanup on page unload
                window.addEventListener('beforeunload', function() {
                    if (splideContainer.splideInstance) {
                        splideContainer.splideInstance.destroy();
                    }
                });
                
                // Handle window resize for responsive updates
                let resizeTimeout;
                window.addEventListener('resize', function() {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(function() {
                        if (splideContainer.splideInstance) {
                            // Update perPage and gap based on current screen size
                            const newPerPage = getCurrentSlidesPerView();
                            let newGap;
                            if (window.innerWidth >= 1024) {
                                newGap = cardGapDesktop;
                            } else if (window.innerWidth >= 768) {
                                newGap = cardGapTablet;
                            } else {
                                newGap = cardGapMobile;
                            }
                            splideContainer.splideInstance.options.perPage = newPerPage;
                            splideContainer.splideInstance.options.gap = newGap;
                            splideContainer.splideInstance.refresh();
                        }
                    }, 250);
                });

            } catch (error) {
                console.error('Error creating Splide:', error);
            }
        }
    });
});




