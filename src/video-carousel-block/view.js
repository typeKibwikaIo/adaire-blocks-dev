import { gsap } from 'gsap';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

document.addEventListener('DOMContentLoaded', () => {
	const carousels = document.querySelectorAll('.adaire-video-carousel');
	if (!carousels.length) return;

	carousels.forEach((carousel) => {
		const wrapper = carousel.querySelector('.adaire-video-carousel__wrapper');
		const swiperEl = carousel.querySelector('.adaire-video-carousel__swiper');
		const dragCursor = carousel.querySelector('.adaire-video-carousel__drag-cursor');
		const videos = Array.from(carousel.querySelectorAll('video'));

		if (!wrapper || !swiperEl) return;

		// Initialize Swiper for this carousel
		const slidesPerViewBigDesktop =
			parseInt(carousel.dataset.slidesPerViewBigDesktop, 10) || 5;
		const slidesPerViewDesktop =
			parseInt(carousel.dataset.slidesPerViewDesktop, 10) || slidesPerViewBigDesktop || 4;
		const slidesPerViewSmallLaptop =
			parseInt(carousel.dataset.slidesPerViewSmallLaptop, 10) || slidesPerViewDesktop;
		const slidesPerViewTablet =
			parseInt(carousel.dataset.slidesPerViewTablet, 10) || 3;
		const slidesPerViewMobile =
			parseInt(carousel.dataset.slidesPerViewMobile, 10) || 1;
		const gap = parseInt(carousel.dataset.cardGap, 10) || 24;
		const loop = carousel.dataset.loop === 'true';
		const mobilePeekPercent =
			parseFloat(carousel.dataset.mobilePeek || '20') || 20;
		const mobilePeekFraction = Math.max(0, Math.min(0.5, mobilePeekPercent / 100));

		// If mobile slidesPerView is 1, show a bit of the next card using the peek percentage.
		// If it's > 1, respect the explicit slidesPerView setting.
		const baseMobileSlidesPerView =
			slidesPerViewMobile <= 1
				? 1 + mobilePeekFraction
				: slidesPerViewMobile;

		// When slidesPerView is 1 and we want to center, use a decimal value to show peek of both sides
		// This ensures both previous and next cards are visible when centered
		const mobileSlidesPerViewForCentering = slidesPerViewMobile <= 1 ? 1.2 : baseMobileSlidesPerView;
		const shouldCenterMobile = slidesPerViewMobile <= 1;

		// Basic Swiper init (like your snippet), but driven by the block's responsive settings
		// and using min-width breakpoints to override up.
		// On mobile, use a decimal slidesPerView to show partial next/prev cards (controlled by mobilePeekPercent)
		const totalSlides = swiperEl.querySelectorAll('.swiper-slide').length;

		// Calculate the maximum slides per view across all breakpoints
		// When centering with slidesPerView: 1, we use 1.2, so account for that in max calculation
		const maxSlidesPerView = Math.max(
			Math.ceil(shouldCenterMobile ? mobileSlidesPerViewForCentering : baseMobileSlidesPerView),
			slidesPerViewTablet === 1 ? 1.2 : slidesPerViewTablet,
			slidesPerViewSmallLaptop === 1 ? 1.2 : slidesPerViewSmallLaptop,
			slidesPerViewDesktop === 1 ? 1.2 : slidesPerViewDesktop,
			slidesPerViewBigDesktop === 1 ? 1.2 : slidesPerViewBigDesktop
		);

		// Swiper requires: totalSlides >= slidesPerView * 2 for perfect loop in both directions
		// However, we can still enable loop with fewer slides - Swiper will duplicate them
		const canLoop = loop && totalSlides > 1;

		// For loop to work in BOTH directions, loopedSlides must be at least equal to
		// the maximum number of visible slides at any breakpoint
		// This ensures Swiper duplicates enough slides for seamless forward and backward scrolling
		// Rule: loopedSlides should be >= maxSlidesPerView for proper bidirectional looping
		const swiperConfig = {
			modules: [Pagination],
			loop: canLoop,
			// loopedSlides: number of slides to duplicate for seamless loop
			// Critical: Must be >= maxSlidesPerView to ensure loop works in BOTH directions
			// If totalSlides < maxSlidesPerView * 2, we still enable loop but Swiper will duplicate all slides
			loopedSlides: canLoop ? Math.max(maxSlidesPerView, totalSlides) : undefined,
			// Only watch overflow when not looping
			watchOverflow: !canLoop,
			// When centering with slidesPerView: 1, use 1.2 to show peek of both previous and next cards
			slidesPerView: shouldCenterMobile ? mobileSlidesPerViewForCentering : baseMobileSlidesPerView,
			spaceBetween: Math.max(8, gap - 8),
			// Center slides horizontally when slidesPerView setting is 1
			centeredSlides: shouldCenterMobile,
			pagination: {
				el: swiperEl.querySelector('.swiper-pagination'),
				clickable: true,
			},
			breakpoints: {
				// Tablet: 601px - 1024px (standard breakpoint)
				601: {
					// When slidesPerView is 1, use 1.2 to show peek of both sides when centered
					slidesPerView: slidesPerViewTablet === 1 ? 1.2 : slidesPerViewTablet,
					spaceBetween: Math.max(12, gap - 4),
					// Center slides when showing only 1 slide
					centeredSlides: slidesPerViewTablet === 1,
				},
				// Small Laptop: 1025px - 1300px (standard breakpoint)
				1025: {
					// When slidesPerView is 1, use 1.2 to show peek of both sides when centered
					slidesPerView: slidesPerViewSmallLaptop === 1 ? 1.2 : slidesPerViewSmallLaptop,
					spaceBetween: gap,
					// Center slides when showing only 1 slide
					centeredSlides: slidesPerViewSmallLaptop === 1,
				},
				// Desktop: 1301px - 1920px (standard breakpoint)
				1301: {
					// When slidesPerView is 1, use 1.2 to show peek of both sides when centered
					slidesPerView: slidesPerViewDesktop === 1 ? 1.2 : slidesPerViewDesktop,
					spaceBetween: gap,
					// Center slides when showing only 1 slide
					centeredSlides: slidesPerViewDesktop === 1,
				},
				// Big Desktop: â‰¥ 1921px (standard breakpoint)
				1921: {
					// When slidesPerView is 1, use 1.2 to show peek of both sides when centered
					slidesPerView: slidesPerViewBigDesktop === 1 ? 1.2 : slidesPerViewBigDesktop,
					spaceBetween: gap,
					// Center slides when showing only 1 slide
					centeredSlides: slidesPerViewBigDesktop === 1,
				},
			},
		};

		const swiper = new Swiper(swiperEl, swiperConfig);

		// After initialization, verify and fix loop if needed
		if (canLoop && swiper) {
			// Ensure loopedSlides is properly set (Swiper might adjust it)
			// Recreate loop to guarantee it works in both directions
			if (swiper.params.loop && swiper.loopedSlides !== undefined) {
				// Update loopedSlides if it's less than required
				const requiredLoopedSlides = Math.max(maxSlidesPerView, totalSlides);
				if (swiper.params.loopedSlides < requiredLoopedSlides) {
					swiper.params.loopedSlides = requiredLoopedSlides;
					swiper.loopDestroy();
					swiper.loopCreate();
					swiper.update();
				}
			}
		}

		// Play overlay helpers
		const getOverlayForVideo = (video) =>
			video.closest('.adaire-video-carousel__video')?.querySelector(
				'.adaire-video-carousel__video-overlay-play'
			);

		const updateOverlayState = (video) => {
			const overlay = getOverlayForVideo(video);
			if (!overlay) return;
			if (video.paused) {
				overlay.classList.remove('is-hidden');
			} else {
				overlay.classList.add('is-hidden');
			}
		};

		// Ensure only one video plays at a time and manage overlays
		videos.forEach((video) => {
			const overlay = getOverlayForVideo(video);

			if (overlay) {
				const iconButton = overlay.querySelector(
					'.adaire-video-carousel__video-overlay-play-icon'
				);
				if (iconButton) {
					iconButton.addEventListener('click', (e) => {
						e.preventDefault();
						e.stopPropagation();
						if (video.paused) {
							video.play();
						} else {
							video.pause();
						}
					});
				}
			}

			video.addEventListener('play', () => {
				videos.forEach((other) => {
					if (other !== video && !other.paused) {
						other.pause();
					}
					updateOverlayState(other);
				});
				updateOverlayState(video);
			});

			video.addEventListener('pause', () => updateOverlayState(video));
			video.addEventListener('ended', () => updateOverlayState(video));

			// Initial state
			updateOverlayState(video);
		});

		// Drag cursor setup (visual only, Swiper handles actual dragging)
		let mouseX = 0;
		let mouseY = 0;
		let cursorX = 0;
		let cursorY = 0;
		let isHovering = false;
		let isDragging = false;
		let overInteractive = false;

		if (dragCursor) {
			gsap.set(dragCursor, {
				opacity: 0,
				scale: 0,
				xPercent: -50,
				yPercent: -50,
				pointerEvents: 'none',
			});

			const updateCursorPosition = (e) => {
				const rect = carousel.getBoundingClientRect();
				mouseX = e.clientX - rect.left;
				mouseY = e.clientY - rect.top;
			};

			const handleMouseEnter = (e) => {
				isHovering = true;
				updateCursorPosition(e);

				cursorX = mouseX;
				cursorY = mouseY;

				gsap.set(dragCursor, { x: mouseX, y: mouseY });
				gsap.to(dragCursor, {
					opacity: 1,
					scale: 1,
					duration: 0.25,
					ease: 'back.out(1.7)',
					overwrite: true,
				});
			};

			const handleMouseMove = (e) => {
				updateCursorPosition(e);
			};

			const handleMouseLeave = () => {
				isHovering = false;
				isDragging = false;
				gsap.to(dragCursor, {
					opacity: 0,
					scale: 0,
					duration: 0.2,
					ease: 'power2.in',
					overwrite: true,
				});
			};

			// Track drag state from Swiper
			const handleDragStart = () => {
				isDragging = true;
			};

			const handleDragMove = (swiper, event) => {
				if (event && event.clientX !== undefined && event.clientY !== undefined) {
					updateCursorPosition(event);
				}
			};

			const handleDragEnd = () => {
				isDragging = false;
			};

			const animateCursor = () => {
				const lerp = isDragging ? 0.3 : 0.15; // Faster follow during drag
				cursorX += (mouseX - cursorX) * lerp;
				cursorY += (mouseY - cursorY) * lerp;

				if ((isHovering || isDragging) && !overInteractive) {
					gsap.set(dragCursor, {
						x: cursorX,
						y: cursorY,
					});
				}

				requestAnimationFrame(animateCursor);
			};

			wrapper.addEventListener('mouseenter', handleMouseEnter);
			wrapper.addEventListener('mousemove', handleMouseMove);
			wrapper.addEventListener('mouseleave', handleMouseLeave);

			// Listen to Swiper drag events
			swiper.on('sliderFirstMove', handleDragStart);
			swiper.on('touchMove', handleDragMove);
			swiper.on('touchEnd', handleDragEnd);
			swiper.on('slideChangeTransitionEnd', handleDragEnd);

			animateCursor();

			// Hide drag cursor when hovering interactive elements (video controls, overlay button, social icons)
			const interactiveSelectors = [
				'.adaire-video-carousel__video-overlay-play-icon',
				'.adaire-video-carousel__meta-icons a',
				'.adaire-video-carousel__meta-icons span',
			];
			const interactiveElements = carousel.querySelectorAll(
				interactiveSelectors.join(',')
			);

			interactiveElements.forEach((el) => {
				el.addEventListener('mouseenter', () => {
					overInteractive = true;
					gsap.to(dragCursor, {
						opacity: 0,
						scale: 0,
						duration: 0.15,
						ease: 'power2.inOut',
						overwrite: true,
					});
				});

				el.addEventListener('mouseleave', () => {
					overInteractive = false;
					if (isHovering) {
						gsap.to(dragCursor, {
							opacity: 1,
							scale: 1,
							duration: 0.2,
							ease: 'back.out(1.7)',
							overwrite: true,
						});
					}
				});
			});
		}

		// Swiper handles drag/looping; no custom drag mechanics needed
	});
});





