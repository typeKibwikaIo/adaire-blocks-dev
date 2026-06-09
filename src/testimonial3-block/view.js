document.addEventListener('DOMContentLoaded', function() {
    const testimonial3Blocks = document.querySelectorAll('.adaire-testimonial3');
    
    if (testimonial3Blocks.length === 0) {
        return;
    }
    
    testimonial3Blocks.forEach(testimonial3 => {
        const blockId = testimonial3.getAttribute('data-block-id');
        const testimonialsData = JSON.parse(testimonial3.getAttribute('data-testimonials') || '[]');
        const slidesPerView = JSON.parse(testimonial3.getAttribute('data-slides-per-view') || '{"desktop":3,"tablet":2,"mobile":1}');
        const showPagination = testimonial3.getAttribute('data-show-pagination') === 'true';
        const loop = testimonial3.getAttribute('data-loop') === 'true';
        const dragCursorText = testimonial3.getAttribute('data-drag-cursor-text') || 'Drag';
        const dragCursor = testimonial3.querySelector('.adaire-testimonial3__drag-cursor');
        
        // Carousel-specific variables
        let carouselWrapper = null;
        let carouselTrack = null;
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        let velocity = 0;
        let lastX = 0;
        let lastTime = 0;
        let touchLastX = 0;
        let touchLastTime = 0;
        let touchVelocity = 0;
        let isMomentumScrolling = false;
        let rafId = null;
        let momentumRafId = null;
        
        // Initialize the testimonial carousel
        initTestimonialCarousel();
        
        function initTestimonialCarousel() {
            try {
                renderTestimonials();
                setupCarouselDrag();
                setupPagination();
                if (dragCursor) {
                    setupDragCursor();
                }
            } catch (error) {
                console.error('Error initializing testimonial carousel:', error);
            }
        }
        
        function renderTestimonials() {
            const track = testimonial3.querySelector('.adaire-testimonial3__track');
            if (!track) return;
            
            track.innerHTML = '';
            
            // If loop is enabled, duplicate testimonials for seamless looping
            const itemsToRender = loop && testimonialsData.length > 1 
                ? [...testimonialsData, ...testimonialsData, ...testimonialsData]
                : testimonialsData;
            
            itemsToRender.forEach((testimonial, index) => {
                const slide = document.createElement('div');
                slide.className = 'adaire-testimonial3__slide';
                slide.setAttribute('data-testimonial-id', testimonial.id);
                
                const card = document.createElement('div');
                card.className = 'adaire-testimonial3__card';
                
                // Quote icon
                const quoteIcon = document.createElement('div');
                quoteIcon.className = 'adaire-testimonial3__quote-icon';
                const iconSize = testimonial3.getAttribute('data-quote-icon-size') || '60';
                const iconColor = testimonial3.getAttribute('data-quote-icon-color') || '#6B46C1';
                quoteIcon.innerHTML = `
                    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" fill="${iconColor}"/>
                    </svg>
                `;
                
                // Quote text
                const quote = document.createElement('div');
                quote.className = 'adaire-testimonial3__quote';
                quote.textContent = testimonial.quote || '';
                
                // Author section
                const author = document.createElement('div');
                author.className = 'adaire-testimonial3__author';
                
                if (testimonial.profileImage?.url) {
                    const profileImg = document.createElement('img');
                    profileImg.src = testimonial.profileImage.url;
                    profileImg.alt = testimonial.profileImage.alt || testimonial.name || '';
                    profileImg.className = 'adaire-testimonial3__profile-image';
                    author.appendChild(profileImg);
                }
                
                const authorInfo = document.createElement('div');
                authorInfo.className = 'adaire-testimonial3__author-info';
                
                const name = document.createElement('div');
                name.className = 'adaire-testimonial3__name';
                name.textContent = testimonial.name || '';
                
                const title = document.createElement('div');
                title.className = 'adaire-testimonial3__title';
                title.textContent = testimonial.title || '';
                
                authorInfo.appendChild(name);
                authorInfo.appendChild(title);
                author.appendChild(authorInfo);
                
                card.appendChild(quoteIcon);
                card.appendChild(quote);
                card.appendChild(author);
                slide.appendChild(card);
                track.appendChild(slide);
            });
        }
        
        function setupCarouselDrag() {
            const wrapper = testimonial3.querySelector('.adaire-testimonial3__wrapper');
            const track = testimonial3.querySelector('.adaire-testimonial3__track');
            
            if (!wrapper || !track) {
                return;
            }
            
            if (carouselWrapper === wrapper && carouselTrack === track && carouselWrapper.dataset.dragInitialized === 'true') {
                return;
            }
            
            carouselWrapper = wrapper;
            carouselTrack = track;
            carouselWrapper.dataset.dragInitialized = 'true';
            
            let wrapperLeft = 0;
            
            // Momentum scrolling function
            const applyMomentum = () => {
                const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
                const currentScroll = carouselTrack.scrollLeft;
                
                if (currentScroll <= 0 && velocity < 0) {
                    isMomentumScrolling = false;
                    velocity = 0;
                    return;
                }
                
                if (currentScroll >= maxScroll && velocity > 0) {
                    isMomentumScrolling = false;
                    velocity = 0;
                    return;
                }
                
                if (Math.abs(velocity) < 0.5) {
                    isMomentumScrolling = false;
                    velocity = 0;
                    return;
                }
                
                carouselTrack.scrollLeft += velocity;
                velocity *= 0.92;
                
                momentumRafId = requestAnimationFrame(applyMomentum);
            };
            
            // Mouse events
            const handleMouseDown = (e) => {
                isDragging = true;
                isMomentumScrolling = false;
                velocity = 0;
                lastX = e.clientX;
                lastTime = Date.now();
                
                if (momentumRafId) {
                    cancelAnimationFrame(momentumRafId);
                    momentumRafId = null;
                }
                
                const rect = carouselWrapper.getBoundingClientRect();
                wrapperLeft = rect.left;
                startX = e.clientX - wrapperLeft;
                scrollLeft = carouselTrack.scrollLeft;
                carouselWrapper.style.cursor = 'grabbing';
                carouselWrapper.style.userSelect = 'none';
                carouselTrack.style.scrollBehavior = 'auto';
                carouselTrack.style.scrollSnapType = 'none';
                e.preventDefault();
            };
            
            const handleMouseMove = (e) => {
                if (!isDragging) return;
                
                const currentX = e.clientX;
                const currentTime = Date.now();
                const deltaX = currentX - lastX;
                const deltaTime = currentTime - lastTime;
                
                if (deltaTime > 0) {
                    velocity = -(deltaX * 2) / deltaTime * 16;
                }
                
                lastX = currentX;
                lastTime = currentTime;
                
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
                
                rafId = requestAnimationFrame(() => {
                    const x = e.clientX - wrapperLeft;
                    const walk = (x - startX) * 2;
                    const currentScroll = carouselTrack.scrollLeft;
                    const targetScroll = scrollLeft - walk;
                    const diff = targetScroll - currentScroll;
                    carouselTrack.scrollLeft = currentScroll + diff * 0.6;
                });
                
                e.preventDefault();
            };
            
            const handleMouseUp = () => {
                isDragging = false;
                carouselWrapper.style.cursor = 'grab';
                carouselWrapper.style.userSelect = '';
                
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
                
                if (Math.abs(velocity) > 1) {
                    isMomentumScrolling = true;
                    carouselTrack.style.scrollBehavior = 'auto';
                    carouselTrack.style.scrollSnapType = 'none';
                    applyMomentum();
                } else {
                    // No snapping - just stop where it is
                    carouselTrack.style.scrollBehavior = 'auto';
                    carouselTrack.style.scrollSnapType = 'none';
                }
            };
            
            const handleMouseLeave = () => {
                if (isDragging) {
                    handleMouseUp();
                }
                carouselWrapper.style.cursor = 'grab';
            };
            
            carouselWrapper.addEventListener('mousedown', handleMouseDown);
            carouselWrapper.addEventListener('mouseleave', handleMouseLeave);
            carouselWrapper.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mousemove', handleMouseMove);
            
            // Touch events
            let touchStartX = 0;
            let touchScrollLeft = 0;
            let touchWrapperLeft = 0;
            
            const handleTouchStart = (e) => {
                touchVelocity = 0;
                touchLastX = e.touches[0].clientX;
                touchLastTime = Date.now();
                
                if (momentumRafId) {
                    cancelAnimationFrame(momentumRafId);
                    momentumRafId = null;
                }
                
                const rect = carouselWrapper.getBoundingClientRect();
                touchWrapperLeft = rect.left;
                touchStartX = e.touches[0].clientX - touchWrapperLeft;
                touchScrollLeft = carouselTrack.scrollLeft;
                carouselTrack.style.scrollBehavior = 'auto';
                carouselTrack.style.scrollSnapType = 'none';
            };
            
            const handleTouchMove = (e) => {
                if (!touchStartX) return;
                
                const currentX = e.touches[0].clientX;
                const currentTime = Date.now();
                const deltaX = currentX - touchLastX;
                const deltaTime = currentTime - touchLastTime;
                
                if (deltaTime > 0) {
                    touchVelocity = -(deltaX * 2) / deltaTime * 16;
                }
                
                touchLastX = currentX;
                touchLastTime = currentTime;
                
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
                
                rafId = requestAnimationFrame(() => {
                    const x = e.touches[0].clientX - touchWrapperLeft;
                    const walk = (x - touchStartX) * 2;
                    const currentScroll = carouselTrack.scrollLeft;
                    const targetScroll = touchScrollLeft - walk;
                    const diff = targetScroll - currentScroll;
                    carouselTrack.scrollLeft = currentScroll + diff * 0.6;
                });
                
                e.preventDefault();
            };
            
            const handleTouchEnd = () => {
                if (Math.abs(touchVelocity) > 1) {
                    velocity = touchVelocity;
                    isMomentumScrolling = true;
                    carouselTrack.style.scrollBehavior = 'auto';
                    carouselTrack.style.scrollSnapType = 'none';
                    applyMomentum();
                } else {
                    // No snapping - just stop where it is
                    carouselTrack.style.scrollBehavior = 'auto';
                    carouselTrack.style.scrollSnapType = 'none';
                }
                
                touchStartX = 0;
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            };
            
            carouselWrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
            carouselWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
            carouselWrapper.addEventListener('touchend', handleTouchEnd);
            
            carouselWrapper.style.cursor = 'grab';
        }

        function setupPagination() {
            if (!showPagination) return;
            
            const pagination = testimonial3.querySelector('.adaire-testimonial3__pagination');
            if (!pagination) return;
            
            pagination.innerHTML = '';
            
            testimonialsData.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = 'adaire-testimonial3__pagination-dot';
                if (index === 0) {
                    dot.classList.add('is-active');
                }
                pagination.appendChild(dot);
            });
            
            // Update active dot on scroll
            const track = testimonial3.querySelector('.adaire-testimonial3__track');
            if (track) {
                track.addEventListener('scroll', () => {
                    const slides = track.querySelectorAll('.adaire-testimonial3__slide');
                    const dots = pagination.querySelectorAll('.adaire-testimonial3__pagination-dot');
                    
                    slides.forEach((slide, index) => {
                        const slideRect = slide.getBoundingClientRect();
                        const trackRect = track.getBoundingClientRect();
                        
                        if (slideRect.left <= trackRect.left + trackRect.width / 2 && 
                            slideRect.right >= trackRect.left + trackRect.width / 2) {
                            dots.forEach(dot => dot.classList.remove('is-active'));
                            if (dots[index]) {
                                dots[index].classList.add('is-active');
                            }
                        }
                    });
                });
            }
        }
        
        function setupDragCursor() {
            if (!dragCursor) return;
            
            const wrapper = testimonial3.querySelector('.adaire-testimonial3__wrapper');
            if (!wrapper) return;
            
            let mouseX = 0;
            let mouseY = 0;
            let cursorX = 0;
            let cursorY = 0;
            let isHovering = false;
            let isDraggingCursor = false;
            let overInteractive = false;
            
            // Initialize cursor styles
            dragCursor.style.opacity = '0';
            dragCursor.style.transform = 'translate(-50%, -50%) scale(0)';
            dragCursor.style.pointerEvents = 'none';
            
            const updateCursorPosition = (e) => {
                const rect = testimonial3.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
            };
            
            const handleMouseEnter = (e) => {
                isHovering = true;
                updateCursorPosition(e);
                cursorX = mouseX;
                cursorY = mouseY;
                dragCursor.style.left = mouseX + 'px';
                dragCursor.style.top = mouseY + 'px';
                dragCursor.style.opacity = '1';
                dragCursor.style.transform = 'translate(-50%, -50%) scale(1)';
                dragCursor.style.transition = 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            };
            
            const handleMouseMove = (e) => {
                updateCursorPosition(e);
            };
            
            const handleMouseLeave = () => {
                isHovering = false;
                isDraggingCursor = false;
                dragCursor.style.opacity = '0';
                dragCursor.style.transform = 'translate(-50%, -50%) scale(0)';
                dragCursor.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            };
            
            const animateCursor = () => {
                const lerp = isDraggingCursor ? 0.3 : 0.15;
                cursorX += (mouseX - cursorX) * lerp;
                cursorY += (mouseY - cursorY) * lerp;
                
                if ((isHovering || isDraggingCursor) && !overInteractive) {
                    dragCursor.style.left = cursorX + 'px';
                    dragCursor.style.top = cursorY + 'px';
                    // Keep translate(-50%, -50%) in transform to center the cursor
                    dragCursor.style.transform = 'translate(-50%, -50%) scale(1)';
                }
                
                requestAnimationFrame(animateCursor);
            };
            
            wrapper.addEventListener('mouseenter', handleMouseEnter);
            wrapper.addEventListener('mousemove', handleMouseMove);
            wrapper.addEventListener('mouseleave', handleMouseLeave);
            
            // Track drag state
            const track = testimonial3.querySelector('.adaire-testimonial3__track');
            if (track) {
                track.addEventListener('mousedown', () => {
                    isDraggingCursor = true;
                });
                track.addEventListener('mouseup', () => {
                    isDraggingCursor = false;
                });
                track.addEventListener('mouseleave', () => {
                    isDraggingCursor = false;
                });
            }
            
            animateCursor();
        }
        
        // Handle loop scrolling
        if (loop && testimonialsData.length > 1) {
            const track = testimonial3.querySelector('.adaire-testimonial3__track');
            if (track) {
                const slideWidth = track.querySelector('.adaire-testimonial3__slide')?.offsetWidth || 0;
                const gap = parseInt(getComputedStyle(track).gap) || 24;
                const totalWidth = (slideWidth + gap) * testimonialsData.length;
                
                track.addEventListener('scroll', () => {
                    const scrollLeft = track.scrollLeft;
                    // If scrolled past the middle set (original testimonials), jump to start
                    if (scrollLeft >= totalWidth * 2) {
                        track.scrollLeft = totalWidth + (scrollLeft - totalWidth * 2);
                    }
                    // If scrolled before the middle set, jump to end
                    else if (scrollLeft < totalWidth) {
                        track.scrollLeft = totalWidth * 2 - (totalWidth - scrollLeft);
                    }
                });
            }
        }
        
        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                    setupCarouselDrag();
            }, 250);
        });
    });
});



