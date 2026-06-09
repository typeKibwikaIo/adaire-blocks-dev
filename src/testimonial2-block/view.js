import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

document.addEventListener('DOMContentLoaded', () => {
    const testimonialBlocks = document.querySelectorAll('.ad-testimonial-block');

    testimonialBlocks.forEach((block) => {
        const swiperContainer = block.querySelector('.ad-testimonial-block__swiper');
        if (!swiperContainer) return;

        // Get settings from data attributes
        const carouselSpeed = parseInt(block.dataset.carouselSpeed) || 600;
        const spaceBetween = parseInt(block.dataset.spaceBetween) || 40;

        // Get navigation buttons
        const prevButtons = block.querySelectorAll('.ad-testimonial-block__nav--prev');
        const nextButtons = block.querySelectorAll('.ad-testimonial-block__nav--next');

        // Initialize Swiper
        const swiper = new Swiper(swiperContainer, {
            modules: [Navigation],
            slidesPerView: 1,
            slidesPerGroup: 1,
            spaceBetween: spaceBetween,
            speed: carouselSpeed,
            loop: false,
            navigation: {
                nextEl: '.ad-testimonial-block__nav--next',
                prevEl: '.ad-testimonial-block__nav--prev',
                disabledClass: 'swiper-button-disabled',
            },
            on: {
                init: function () {
                    updateNavigationState(this);
                },
                slideChange: function () {
                    updateNavigationState(this);
                },
            },
        });

        // Update navigation button states
        function updateNavigationState(swiperInstance) {
            const isBeginning = swiperInstance.isBeginning;
            const isEnd = swiperInstance.isEnd;

            prevButtons.forEach((btn) => {
                if (isBeginning) {
                    btn.classList.add('swiper-button-disabled');
                    btn.disabled = true;
                } else {
                    btn.classList.remove('swiper-button-disabled');
                    btn.disabled = false;
                }
            });

            nextButtons.forEach((btn) => {
                if (isEnd) {
                    btn.classList.add('swiper-button-disabled');
                    btn.disabled = true;
                } else {
                    btn.classList.remove('swiper-button-disabled');
                    btn.disabled = false;
                }
            });
        }

        // Add click handlers for all navigation buttons
        prevButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                swiper.slidePrev();
            });
        });

        nextButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                swiper.slideNext();
            });
        });
    });
});




