import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener('DOMContentLoaded', function() {
    const portfolioBlocks = document.querySelectorAll('.ad-portfolio-block');
    
    portfolioBlocks.forEach(block => {
        initPortfolioBlock(block);
    });
});

function initPortfolioBlock(block) {
    // Get slides data from block attributes
    const slidesData = JSON.parse(block.getAttribute('data-slides') || '[]');
    if (!slidesData.length) return;

    // State management
    let isModalOpen = false;
    let isModalClosing = false;
    let currentSlide = 1;
    let isAnimating = false;
    let scrollAllowed = true;
    let lastScrollTime = 0;
    const eventListeners = [];

    // DOM elements
    const modalOverlay = block.querySelector('.ad-portfolio-block__modal-overlay');
    const modalContent = block.querySelector('.ad-portfolio-block__modal-content');
    const slider = block.querySelector('.ad-portfolio-block__slider');
    const closeBtn = block.querySelector('.ad-portfolio-block__modal-close-btn');
    const CTA_SELECTOR = '.ad-portfolio-block__agency-cta .adaire-button-block__link';
    let viewPortfolioBtn = block.querySelector(CTA_SELECTOR);
    const modalButtonClassNames = viewPortfolioBtn
        ? Array.from(viewPortfolioBtn.classList).filter((className) =>
              className.startsWith('ad-portfolio-block__') || className.startsWith('adaire-button-block__')
          )
        : [];
    const galleryRef = block.querySelector('.ad-portfolio-block__agency-gallery');
    const agencySectionRef = block.querySelector('.ad-portfolio-block__agency-section');

    // Initialize
    initGalleryAnimations();
    initEventListeners();

    function initGalleryAnimations() {
        if (!galleryRef) return;

        // Initial setup - hide gallery items
        gsap.set(".ad-portfolio-block__gallery-item", {
            y: 60,
            opacity: 0,
            scale: 0.95,
            transformOrigin: "center center"
        });

        gsap.set(".ad-portfolio-block__gallery-overlay", {
            y: "100%",
            opacity: 0,
            pointerEvents: "none"
        });

        gsap.set(".ad-portfolio-block__agency-description-text", {
            y: 30,
            opacity: 0
        });

        gsap.set(".ad-portfolio-block__modal-button", {
            y: 30,
            opacity: 0,
            scale: 0.9
        });

        // Create timeline for agency section animations
        const agencyTl = gsap.timeline({
            scrollTrigger: {
                trigger: agencySectionRef,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
                onEnter: () => {
                    // Prevent animation if modal is opening/closing
                    if (window.isModalOpen || window.isModalClosing) return;
                },
                onEnterBack: () => {
                    // Prevent animation if modal is opening/closing
                    if (window.isModalOpen || window.isModalClosing) return;
                }
            }
        });

        agencyTl
            .to(".ad-portfolio-block__agency-description-text", {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out"
            })
            .to(".ad-portfolio-block__modal-button", {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: "back.out(1.7)"
            }, "-=0.6");

        // Gallery animations with creative effects
        const galleryItems = gsap.utils.toArray(".ad-portfolio-block__gallery-item");
        
        galleryItems.forEach((item, index) => {
            const overlay = item.querySelector(".ad-portfolio-block__gallery-overlay");
            const img = item.querySelector("img");
            
            // Set initial states
            gsap.set(img, {
                scale: 1.2,
                filter: "brightness(0.7) contrast(1.2)"
            });

            // Create individual timeline for each gallery item
            const itemTl = gsap.timeline({
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    end: "bottom 15%",
                    toggleActions: "play none none reverse",
                    onEnter: () => {
                        // Prevent animation if modal is opening/closing
                        if (window.isModalOpen || window.isModalClosing) return;
                    },
                    onEnterBack: () => {
                        // Prevent animation if modal is opening/closing
                        if (window.isModalOpen || window.isModalClosing) return;
                    }
                }
            });

            // Staggered entrance animation
            itemTl
                .to(item, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1.2,
                    ease: "power4.inOut",
                    delay: index * 0.15
                })
                .to(img, {
                    scale: 1,
                    filter: "brightness(1) contrast(1)",
                    duration: 1.2,
                    ease: "power2.out"
                }, "-=1.2");

            // Hover animations
            item.addEventListener("mouseenter", () => {
                gsap.to(item, {
                    scale: 1.03,
                    duration: 0.4,
                    ease: "power4.inOut"
                });
                
                gsap.to(img, {
                    scale: 1.1,
                    filter: "brightness(1.1) contrast(1.1)",
                    duration: 0.4,
                    ease: "power2.out"
                });
                
                gsap.to(overlay, {
                    y: "0%",
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out",
                    pointerEvents: "auto"
                });
            });

            item.addEventListener("mouseleave", () => {
                gsap.to(item, {
                    scale: 1,
                    duration: 0.4,
                    ease: "power4.inOut"
                });
                
                gsap.to(img, {
                    scale: 1,
                    filter: "brightness(1) contrast(1)",
                    duration: 0.4,
                    ease: "power2.out"
                });
                
                gsap.to(overlay, {
                    y: "100%",
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.out",
                    pointerEvents: "none"
                });
            });
        });



        // Magnetic effect for CTA button
        if (viewPortfolioBtn) {
            viewPortfolioBtn.addEventListener("mousemove", (e) => {
                const rect = viewPortfolioBtn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(viewPortfolioBtn, {
                    x: x * 0.1,
                    y: y * 0.1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            viewPortfolioBtn.addEventListener("mouseleave", () => {
                gsap.to(viewPortfolioBtn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        }
    }

    function initEventListeners() {
        // Open modal from CTA button (starts from first slide)
        if (viewPortfolioBtn) {
            viewPortfolioBtn.addEventListener('click', (event) => {
                event.preventDefault();
                openModal(0);
            });
        }

        // Add click listeners to gallery items
        const galleryItems = block.querySelectorAll('.ad-portfolio-block__gallery-item');
        galleryItems.forEach((item) => {
            item.addEventListener('click', () => {
                const slideIndex = parseInt(item.getAttribute('data-slide-index'));
                openModal(slideIndex);
            });
        });

        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Close modal on overlay click
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });
        }
    }

    function openModal(startSlideIndex = 0) {
        isModalOpen = true;
        isModalClosing = false;
        
        // Set the starting slide
        currentSlide = startSlideIndex + 1; // Convert to 1-based index
        
        // Set global flag to prevent gallery animations
        window.isModalOpen = true;
        
        // Store current scroll position
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        
        if (modalOverlay) {
            // Set initial state for smooth animation
            gsap.set(modalOverlay, { opacity: 0 });
            modalOverlay.style.display = 'flex';
            
            // Create initial slide immediately (don't wait for overlay animation)
            createInitialSlide(startSlideIndex);
            initModalAnimations();
            
            // Smooth fade in animation (runs in parallel)
            gsap.to(modalOverlay, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.inOut"
            });
        } else {
            // Fallback if modalOverlay is not found
            setTimeout(() => {
                createInitialSlide(startSlideIndex);
                initModalAnimations();
            }, 100);
        }
    }

    function closeModal() {
        isModalClosing = true;
        
        // Clean up all event listeners
        eventListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        eventListeners.length = 0;
        
        // Smooth fade out animation
        if (modalOverlay) {
            gsap.to(modalOverlay, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    isModalOpen = false;
                    isModalClosing = false;
                    
                    // Clear global flags
                    window.isModalOpen = false;
                    window.isModalClosing = false;
                    
                    // Restore scroll position without triggering scroll events
                    const scrollY = document.body.style.top;
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';
                    
                    // Use a flag to prevent ScrollTrigger from firing during modal close
                    window.isModalClosing = true;
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                    
                    // Remove the flag after a short delay
                    setTimeout(() => {
                        window.isModalClosing = false;
                    }, 100);
                    
                    modalOverlay.style.display = 'none';
                    
                    // Clear slider content
                    if (slider) {
                        slider.innerHTML = '';
                    }
                }
            });
        } else {
            // Fallback if modalOverlay is not found
            setTimeout(() => {
                isModalOpen = false;
                isModalClosing = false;
                
                // Clear global flags
                window.isModalOpen = false;
                window.isModalClosing = false;
                
                // Restore scroll position without triggering scroll events
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                
                // Use a flag to prevent ScrollTrigger from firing during modal close
                window.isModalClosing = true;
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
                
                // Remove the flag after a short delay
                setTimeout(() => {
                    window.isModalClosing = false;
                }, 100);
                
                if (modalOverlay) {
                    modalOverlay.style.display = 'none';
                }
                
                // Clear slider content
                if (slider) {
                    slider.innerHTML = '';
                }
            }, 300);
        }
    }

    function createInitialSlide(startSlideIndex = 0) {
        if (!slider) return;

        const slideData = slidesData[startSlideIndex];
        const slide = createSlideElement(slideData, startSlideIndex + 1);
        
        // Set initial state for entrance animation (same as slide switching)
        gsap.set(slide, {
            y: "100vh",
            clipPath: "polygon(20% 20%, 80% 20%, 80% 100%, 20% 100%)",
            force3D: true,
        });
        
        slider.appendChild(slide);
        
        // Split text for animations
        splitText(slide);
        
        // Get elements for animation
        const words = slide.querySelectorAll(".word");
        const lines = slide.querySelectorAll(".line");
        const button = slide.querySelector(".ad-portfolio-block__modal-button");
        
        // Set initial state for text elements
        gsap.set([...words, ...lines], {
            y: "100%",
            opacity: 0,
            force3D: true
        });
        
        // Set initial state for the button
        if (button) {
            gsap.set(button, {
                y: 30,
                opacity: 0,
                scale: 0.9
            });
        }
        
        // Animate the slide entrance immediately (no delay for initial load)
        gsap.to(slide, {
            y: 0,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.5,
            ease: "power4.inOut",
            force3D: true,
            delay: 0, // No delay for initial slide
            onStart: () => {
                // Add subtle zoom effect to background image
                const slideImg = slide.querySelector('.slide-img');
                if (slideImg) {
                    gsap.fromTo(slideImg, 
                        { scale: 1.1 },
                        { 
                            scale: 1,
                            duration: 1.5,
                            ease: "power4.inOut",
                            force3D: true
                        }
                    );
                }

                const tl = gsap.timeline();

                const headerWords = slide.querySelectorAll(".slide-title .word");

                tl.to(headerWords, {
                    y: "0%",
                    opacity: 1,
                    duration: 1,
                    ease: "power4.inOut",
                    stagger: 0.1,
                    force3D: true,
                }, .75);

                const tagsLines = slide.querySelectorAll(".slide-tags .line");
                const descriptionLines = slide.querySelectorAll(".slide-description .line");

                tl.to(tagsLines, {
                    y: "0%",
                    opacity: 1,
                    duration: 1,
                    ease: "power4.inOut",
                    stagger: 0.1,
                }, "-=0.75");

                tl.to(descriptionLines, {
                    y: "0%",
                    opacity: 1,
                    duration: 1,
                    ease: "power4.inOut",
                    stagger: 0.1,
                }, "<")
                .to(button, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: "back.out(1.7)"
                }, "-=1");
            }
        });
    }

    function createSlideElement(slideData, slideIndex) {
        const slide = document.createElement("div");
        slide.className = "slide";

        const slideImg = document.createElement("div");
        slideImg.className = "slide-img";
        const img = document.createElement("img");
        img.className = "slide-img-element";
        img.src = slideData.slideImg || '';
        img.alt = slideData.slideTitle || '';
        slideImg.appendChild(img);

        const slideOverlay = document.createElement("div");
        slideOverlay.className = "slide-overlay";

        const slideHeader = document.createElement("div");
        slideHeader.className = "slide-header";

        const slideTitle = document.createElement("div");
        slideTitle.className = "slide-title";
        const h1 = document.createElement("h1");
        h1.className = "slide-title-text";
        h1.textContent = slideData.slideTitle || '';
        slideTitle.appendChild(h1);

        const slideDescription = document.createElement("div");
        slideDescription.className = "slide-description";
        const p = document.createElement("p");
        p.className = "slide-description-text";
        p.textContent = slideData.slideDescription || '';
        slideDescription.appendChild(p);

        const slideLink = document.createElement("div");
        slideLink.className = "slide-link";
        const button = document.createElement("button");
        button.type = "button";
        const buttonStyle = block.getAttribute('data-button-style') || 'underline';
        const hoverAnimation = block.getAttribute('data-hover-animation') || 'slide-underline';
        if (modalButtonClassNames.length) {
            modalButtonClassNames.forEach((className) => button.classList.add(className));
        }
        button.classList.add(
            'ad-portfolio-block__modal-button',
            `ad-portfolio-block__modal-button--${buttonStyle}`,
            `ad-portfolio-block__modal-button--${hoverAnimation}`
        );
        button.innerHTML = `
          <span class="ad-portfolio-block__button-text">View Project</span>
          <svg class="ad-portfolio-block__button-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        `;
        
        // Add hover animation for the arrow
        const arrow = button.querySelector('svg');
        button.addEventListener('mouseenter', () => {
          if (arrow) {
            arrow.style.transform = 'translateX(4px)';
            arrow.style.transition = 'transform 0.3s ease';
          }
        });
        button.addEventListener('mouseleave', () => {
          if (arrow) {
            arrow.style.transform = 'translateX(0)';
          }
        });
        
        button.addEventListener('click', () => {
          if (slideData.slideUrl && slideData.slideUrl !== '#') {
            window.open(slideData.slideUrl, '_blank');
          }
        });
        slideLink.appendChild(button);

        slideHeader.appendChild(slideTitle);
        slideHeader.appendChild(slideDescription);
        slideHeader.appendChild(slideLink);

        const sliderInfo = document.createElement("div");
        sliderInfo.className = "slide-info";

        const slideTags = document.createElement("div");
        slideTags.className = "slide-tags";

        if (slideData.slideTags && Array.isArray(slideData.slideTags)) {
            slideData.slideTags.forEach((tag) => {
                const tagP = document.createElement("p");
                tagP.className = "slide-tag-text";
                tagP.textContent = tag;
                slideTags.appendChild(tagP);
            });
        }

        sliderInfo.appendChild(slideTags);

        // Create scroll indicator
        const scrollIndicator = document.createElement("div");
        scrollIndicator.className = "scroll-indicator";
        
        const scrollText = document.createElement("div");
        scrollText.className = "scroll-text";
        scrollText.textContent = "Scroll";
        
        const scrollArrow = document.createElement("div");
        scrollArrow.className = "scroll-arrow";
        
        scrollIndicator.appendChild(scrollText);
        scrollIndicator.appendChild(scrollArrow);

        slide.appendChild(slideImg);
        slide.appendChild(slideOverlay);
        slide.appendChild(slideHeader);
        slide.appendChild(sliderInfo);
        slide.appendChild(scrollIndicator);

        return slide;
    }

    function splitText(slide) {
        const slideHeader = slide.querySelector(".slide-title h1");

        if (slideHeader) {
            SplitText.create(slideHeader, {
                type: "words",
                wordsClass: "word",
                mask: "worrds",
            });
        }

        const slideContent = slide.querySelectorAll("p, a");
        slideContent.forEach((element) => {
            SplitText.create(element, {
                type: "lines",
                linesClass: "line",
                mask: "lines",
                reduceWhiteSpace: false,
            });
        });

        // Don't split text for the button to prevent distortion
        // The button will be animated as a whole element
    }

    function initModalAnimations() {
        const totalSlides = slidesData.length;

        function animateSlide(direction) {
            if (isAnimating || !scrollAllowed) return;

            isAnimating = true;
            scrollAllowed = false;

            const currentSlideElement = slider.querySelector(".slide");

            if (direction === "down") {
                currentSlide = currentSlide === totalSlides ? 1 : currentSlide + 1;
            } else {
                currentSlide = currentSlide === 1 ? totalSlides : currentSlide - 1;
            }

            const exitY = direction === "down" ? "-200vh" : "200vh";
            const entryY = direction === "down" ? "100vh" : "-100vh";

            const entryClipPath = direction === "down" ? 
                "polygon(20% 20%, 80% 20%, 80% 100%, 20% 100%)" :
                "polygon(20% 0%, 80% 0%, 80% 80%, 20% 80%)";

            // Animate background zoom out effect for exiting slide
            const slideImg = currentSlideElement.querySelector('.slide-img');
            if (slideImg) {
                gsap.to(slideImg, {
                    scale: 1.5,
                    duration: 2,
                    ease: "power4.inOut",
                    force3D: true
                });
            }

            gsap.to(currentSlideElement, {
                scale: 0.25,
                opacity: 0,
                rotation: 30,
                y: exitY,
                duration: 2,
                ease: "power4.inOut",
                force3D: true,
                onComplete: () => {
                    currentSlideElement.remove();
                }
            });

            setTimeout(() => {
                const slideData = slidesData[currentSlide - 1];
                const newSlide = createSlideElement(slideData, currentSlide);

                gsap.set(newSlide, {
                    y: entryY,
                    clipPath: entryClipPath,
                    force3D: true,
                });

                // Set initial zoom state for entering slide
                const newSlideImg = newSlide.querySelector('.slide-img');
                if (newSlideImg) {
                    gsap.set(newSlideImg, {
                        scale: 1.5,
                        force3D: true
                    });
                }

                slider.appendChild(newSlide);

                splitText(newSlide);

                const words = newSlide.querySelectorAll(".word");
                const lines = newSlide.querySelectorAll(".line");

                const button = newSlide.querySelector(".ad-portfolio-block__modal-button");
                
                gsap.set([...words, ...lines], {
                    y: "100%",
                    opacity: 0,
                    force3D: true
                });
                
                // Set initial state for the button itself
                if (button) {
                    gsap.set(button, {
                        y: 30,
                        opacity: 0,
                        scale: 0.9
                    });
                }

                gsap.to(newSlide, {
                    y: 0,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    duration: 1.5,
                    ease: "power4.inOut",
                    force3D: true,
                    onStart: () => {
                        // Animate zoom effect for entering slide background image
                        const slideImg = newSlide.querySelector('.slide-img');
                        if (slideImg) {
                            gsap.to(slideImg, {
                                scale: 1,
                                duration: 1.5,
                                ease: "power4.inOut",
                                force3D: true
                            });
                        }

                        const tl = gsap.timeline();

                        const headerWords = newSlide.querySelectorAll(".slide-title .word");

                        tl.to(headerWords, {
                            y: "0%",
                            opacity: 1,
                            duration: 1,
                            ease: "power4.inOut",
                            stagger: 0.1,
                            force3D: true,
                        }, .75);

                        const tagsLines = newSlide.querySelectorAll(".slide-tags .line");
                        const descriptionLines = newSlide.querySelectorAll(".slide-description .line");

                        tl.to(tagsLines, {
                            y: "0%",
                            opacity: 1,
                            duration: 1,
                            ease: "power4.inOut",
                            stagger: 0.1,
                        }, "-=0.75");

                        tl.to(descriptionLines, {
                            y: "0%",
                            opacity: 1,
                            duration: 1,
                            ease: "power4.inOut",
                            stagger: 0.1,
                        }, "<")
                        .to(button, {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 1,
                            ease: "back.out(1.7)"
                        }, "-=1");
                    },
                    onComplete: () => {
                        isAnimating = false;
                        setTimeout(() => {
                            scrollAllowed = true;
                            lastScrollTime = Date.now();
                        }, 100);
                    },
                });
            }, 600);
        }

        function handleScroll(direction) {
            const now = Date.now();
            if (isAnimating || !scrollAllowed) return;
            if (now - lastScrollTime < 1000) return;

            lastScrollTime = now;
            animateSlide(direction);
        }

        // Event handler functions
        const wheelHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const direction = e.deltaY > 0 ? "down" : "up";
            handleScroll(direction);
        };

        let touchStartY = 0;
        let isTouchActive = false;

        const touchStartHandler = (e) => {
            touchStartY = e.touches[0].clientY;
            isTouchActive = true;
        };

        const touchMoveHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isTouchActive || isAnimating || !scrollAllowed) return;

            const touchCurrentY = e.touches[0].clientY;
            const difference = touchCurrentY - touchStartY;

            if (Math.abs(difference) > 50) {
                isTouchActive = false;
                const direction = difference > 0 ? "up" : "down";
                handleScroll(direction);
            }
        };

        const touchEndHandler = () => {
            isTouchActive = false;
        };

        const keydownHandler = (e) => {
            if (isAnimating || !scrollAllowed) return;
            
            const now = Date.now();
            if (now - lastScrollTime < 1000) return;
            
            if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                e.stopPropagation();
                handleScroll("down");
            } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                e.stopPropagation();
                handleScroll("up");
            }
        };

        const spacebarHandler = (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                e.stopPropagation();
                const now = Date.now();
                if (now - lastScrollTime < 1000) return;
                handleScroll("down");
            }
        };

        const escapeHandler = (e) => {
            if (e.key === "Escape") {
                closeModal();
            }
        };

        // Add event listeners to the modal content
        if (modalContent) {
            // Make modal content focusable for keyboard events
            modalContent.setAttribute('tabindex', '0');
            modalContent.focus();
            
            // Wheel event
            modalContent.addEventListener("wheel", wheelHandler, { passive: false });
            eventListeners.push({ element: modalContent, type: "wheel", handler: wheelHandler });

            // Touch events
            modalContent.addEventListener("touchstart", touchStartHandler, { passive: false });
            eventListeners.push({ element: modalContent, type: "touchstart", handler: touchStartHandler });

            modalContent.addEventListener("touchmove", touchMoveHandler, { passive: false });
            eventListeners.push({ element: modalContent, type: "touchmove", handler: touchMoveHandler });

            modalContent.addEventListener("touchend", touchEndHandler, { passive: false });
            eventListeners.push({ element: modalContent, type: "touchend", handler: touchEndHandler });

            // Keyboard events
            modalContent.addEventListener("keydown", keydownHandler);
            eventListeners.push({ element: modalContent, type: "keydown", handler: keydownHandler });

            modalContent.addEventListener("keydown", spacebarHandler);
            eventListeners.push({ element: modalContent, type: "keydown", handler: spacebarHandler });

            modalContent.addEventListener("keydown", escapeHandler);
            eventListeners.push({ element: modalContent, type: "keydown", handler: escapeHandler });
        } else {
        }

        // Add global escape key listener
        document.addEventListener("keydown", escapeHandler);
        eventListeners.push({ element: document, type: "keydown", handler: escapeHandler });
    }

    // Cleanup function
    return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        eventListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
    };
}


