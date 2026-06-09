import { gsap } from 'gsap';

document.addEventListener('DOMContentLoaded', function () {
    const contentToggleBlocks = document.querySelectorAll('.adaire-content-toggle');

    contentToggleBlocks.forEach(toggleBlock => {
        const pills = toggleBlock.querySelectorAll('.adaire-content-toggle__pill');
        const panels = toggleBlock.querySelectorAll('.adaire-content-toggle-panel');

        // Get animation settings from data attributes
        const duration = parseFloat(toggleBlock.getAttribute('data-animation-duration')) || 0.5;
        const ease = toggleBlock.getAttribute('data-animation-ease') || 'power2.out';
        const initialActiveToggle = parseInt(toggleBlock.getAttribute('data-active-toggle')) || 0;

        let currentActiveIndex = initialActiveToggle;

        // Calculate and set minimum height based on tallest panel
        const contentWrapper = toggleBlock.querySelector('.adaire-content-toggle__content');
        let maxHeight = 0;

        // Temporarily show all panels to measure their heights
        panels.forEach((panel) => {
            gsap.set(panel, { display: 'block', position: 'relative', opacity: 0, visibility: 'hidden' });
            const height = panel.scrollHeight;
            if (height > maxHeight) {
                maxHeight = height;
            }
        });

        // Set minimum height on the wrapper
        if (contentWrapper && maxHeight > 0) {
            contentWrapper.style.minHeight = `${maxHeight}px`;
        }

        // Now hide all panels except the active one
        panels.forEach((panel, index) => {
            if (index !== initialActiveToggle) {
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

        // Switch to a specific toggle
        function switchToToggle(index, immediate = false) {
            if (index === currentActiveIndex && !immediate) return;
            if (index < 0 || index >= panels.length) return;

            const oldPanel = panels[currentActiveIndex];
            const newPanel = panels[index];

            // Update pill buttons
            pills.forEach((pill, i) => {
                if (i === index) {
                    pill.classList.add('is-active');
                    pill.setAttribute('aria-selected', 'true');
                } else {
                    pill.classList.remove('is-active');
                    pill.setAttribute('aria-selected', 'false');
                }
            });

            // Animate content transition
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
            panels.forEach((panel, i) => {
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

            // Fade in new content
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
                const children = newPanel.children;
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
            } else {
                tl.set(newPanel, { opacity: 1, y: 0 });
            }

            currentActiveIndex = index;
        }

        // Initialize on page load
        switchToToggle(initialActiveToggle, true);

        // Add click handlers
        pills.forEach((pill, index) => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                switchToToggle(index);
            });
        });

        // Keyboard navigation
        toggleBlock.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('adaire-content-toggle__pill')) {
                const currentIndex = parseInt(e.target.getAttribute('data-toggle-index'));
                let newIndex = currentIndex;

                switch (e.key) {
                    case 'ArrowLeft':
                        newIndex = currentIndex > 0 ? currentIndex - 1 : pills.length - 1;
                        e.preventDefault();
                        break;
                    case 'ArrowRight':
                        newIndex = currentIndex < pills.length - 1 ? currentIndex + 1 : 0;
                        e.preventDefault();
                        break;
                    case 'Home':
                        newIndex = 0;
                        e.preventDefault();
                        break;
                    case 'End':
                        newIndex = pills.length - 1;
                        e.preventDefault();
                        break;
                }

                if (newIndex !== currentIndex) {
                    pills[newIndex].focus();
                    switchToToggle(newIndex);
                }
            }
        });
    });
});



