import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);



document.addEventListener("DOMContentLoaded", () => {
  // Locomotive Scroll integration fallback
  const locoInstance = window.locomotiveScrollInstance;
  if (locoInstance) {
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        return arguments.length
          ? locoInstance.scrollTo(value, 0, 0)
          : locoInstance.scroll.instance.scroll.y;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });
    locoInstance.on("scroll", ScrollTrigger.update);
    ScrollTrigger.refresh();
  }

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const particlesSections = document.querySelectorAll('.ad-particles-block');
  if (!particlesSections.length) return;

  particlesSections.forEach((particlesSection) => {
    const introZone = particlesSection.querySelector('.ad-particles-block__intro-zone') || particlesSection;
    const entrySlices = particlesSection.querySelectorAll('.ad-particles-block__entry-slice');
    const backgroundImages = particlesSection.querySelectorAll('.ad-particles-block__background-image');
    const foregroundImages = particlesSection.querySelectorAll('.ad-particles-block__foreground-image');
    const allImages = [...backgroundImages, ...foregroundImages];

    // Read configurable text animation duration (seconds)
    const textAnimDuration = parseFloat(particlesSection.dataset.textAnimDuration || '0.6') || 0.6;

    // Set tablet/mobile sizes for images (sizing only, not motion — applies
    // regardless of the reduced-motion preference)
    allImages.forEach((image) => {
      const tabletSize = image.dataset.tabletSize;
      if (tabletSize) {
        image.style.setProperty('--tablet-size', `${tabletSize}px`);
      }
      const mobileSize = image.dataset.mobileSize;
      if (mobileSize) {
        image.style.setProperty('--mobile-size', `${mobileSize}px`);
      }
    });

    if (prefersReducedMotion) {
      // Respect prefers-reduced-motion: every entry gets its own dedicated
      // slice now, so there's no "only one can be shown at a time" overlap
      // problem — just settle all of them visible, no scroll-scrub at all.
      entrySlices.forEach((slice) => {
        const text = slice.querySelector('.ad-particles-block__entry-text');
        if (!text) return;
        const title = text.querySelector('h2');
        const desc = text.querySelector('p');
        gsap.set(text, { opacity: 1, display: 'block' });
        gsap.set([title, desc], { opacity: 1, x: 0 });
      });
      // Leave images at their natural (untransformed) position — no
      // scroll-scrubbed movement for this instance.
      return;
    }

    // Text reveal — one ScrollTrigger per entry slice, anchored directly to
    // that slice's own DOM element rather than a percentage of the whole
    // section's height. This is what actually prevents position/timing
    // drift: there's nothing to keep in sync, the trigger IS the entry.
    entrySlices.forEach((slice) => {
      const text = slice.querySelector('.ad-particles-block__entry-text');
      if (!text) return;
      const title = text.querySelector('h2');
      const desc = text.querySelector('p');

      // Set initial (pre-reveal) state for every entry uniformly — GSAP
      // evaluates each ScrollTrigger's start/end against the current scroll
      // position on creation, so an entry already in view at page load
      // fires onEnter immediately and animates in on its own.
      gsap.set(text, { opacity: 0, display: 'none' });
      gsap.set([title, desc], { opacity: 0, x: 100 });

      ScrollTrigger.create({
        trigger: slice,
        start: 'top 60%',
        end: 'bottom 40%',
        scrub: false,
        ...(locoInstance ? { scroller: document.body } : {}),
        onEnter: () => {
          // Prevent animation if modal is closing
          if (window.isModalClosing) return;
          gsap.set(text, { display: 'block', opacity: 1 });
          gsap.to([title, desc], { x: 0, opacity: 1, duration: textAnimDuration, stagger: 0.15, ease: 'power3.out' });
        },
        onEnterBack: () => {
          // Prevent animation if modal is closing
          if (window.isModalClosing) return;
          gsap.set(text, { display: 'block', opacity: 1 });
          gsap.to([title, desc], { x: 0, opacity: 1, duration: textAnimDuration, stagger: 0.15, ease: 'power3.out' });
        },
        onLeave: () => {
          gsap.to([title, desc], { x: -100, opacity: 0, duration: textAnimDuration, stagger: 0.15, ease: 'power3.in', onComplete: () => {
            gsap.set(text, { display: 'none', opacity: 0 });
            gsap.set([title, desc], { x: 100, opacity: 0 });
          }});
        },
        onLeaveBack: () => {
          gsap.to([title, desc], { x: 100, opacity: 0, duration: textAnimDuration, stagger: 0.15, ease: 'power3.in', onComplete: () => {
            gsap.set(text, { display: 'none', opacity: 0 });
            gsap.set([title, desc], { x: 100, opacity: 0 });
          }});
        }
      });
    });

    // Background images: parallax variety, one of 6 movement patterns per
    // entry (cycled by that image's own position among the backgrounds).
    backgroundImages.forEach((image, index) => {
      const speed = parseFloat(image.dataset.speed) || 1;
      const animationEnabled = image.dataset.animationEnabled !== 'false';
      if (!animationEnabled) return;

      const movementType = index % 6;
      switch (movementType) {
        case 0:
          // Strong vertical movement (up) - opposite to scroll direction
          gsap.fromTo(image,
            { y: 0 },
            {
              y: `${200 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: introZone,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
        case 1:
          // Enhanced horizontal movement (left to right)
          gsap.fromTo(image,
            { x: 0 },
            {
              x: `${120 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: introZone,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
        case 2:
          // Strong vertical movement (down) - same as scroll direction
          gsap.fromTo(image,
            { y: 0 },
            {
              y: `${-200 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: introZone,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
        case 3:
          // Enhanced horizontal movement (right to left)
          gsap.fromTo(image,
            { x: 0 },
            {
              x: `${-120 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: introZone,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
        case 4:
          // Diagonal movement (top-left to bottom-right)
          gsap.fromTo(image,
            { x: 0, y: 0 },
            {
              x: `${80 * speed}px`,
              y: `${-80 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: introZone,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
        case 5:
          // Diagonal movement (top-right to bottom-left)
          gsap.fromTo(image,
            { x: 0, y: 0 },
            {
              x: `${-60 * speed}px`,
              y: `${150 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: introZone,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
      }
    });

    // Foreground images: always animate (no animationEnabled toggle — it
    // never applied here) with the center-scale/overlay-fade effect plus a
    // speed-driven vertical drift.
    foregroundImages.forEach((image) => {
      const speed = parseFloat(image.dataset.speed) || 0;
      const overlay = image.querySelector('.ad-particles-block__foreground-image-overlay');

      // Set initial scale
      gsap.set(image, { scale: 0.8 });

      // Size and overlay animation based on screen position
      ScrollTrigger.create({
        trigger: particlesSection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
        ...(locoInstance ? { scroller: document.body } : {}),
        onUpdate: (self) => {
          // Calculate image's position relative to viewport center
          const rect = image.getBoundingClientRect();
          const viewportCenter = window.innerHeight / 2;
          const imageCenter = rect.top + rect.height / 2;
          const distanceFromCenter = Math.abs(imageCenter - viewportCenter);
          const maxDistance = window.innerHeight / 2;
          const centerProgress = 1 - (distanceFromCenter / maxDistance);

          // Scale based on center proximity (biggest at center)
          const scale = 0.8 + (centerProgress * 0.4); // 0.8 to 1.2
          gsap.set(image, { scale: scale });

          // Overlay opacity based on screen position - more sophisticated
          if (overlay) {
            const centerProgressForOverlay = distanceFromCenter / maxDistance;
            // Create a smooth opacity curve: 0 at center (fully visible), 1 at edges (overlay visible)
            const overlayOpacity = Math.max(0, Math.min(1, centerProgressForOverlay));

            // Also adjust image brightness/opacity - more visible when closer to center
            const imageOpacity = 1 - (centerProgressForOverlay * 0.3); // 1.0 at center, 0.7 at edges
            const imageBrightness = 1 + (1 - centerProgressForOverlay) * 0.2; // 1.2 at center, 1.0 at edges

            gsap.set(overlay, { opacity: overlayOpacity });
            gsap.set(image, {
              opacity: imageOpacity,
              filter: `brightness(${imageBrightness})`
            });
          }
        }
      });

      // Basic vertical drift
      gsap.fromTo(image,
        { y: 0 },
        {
          y: `${-100 * speed}px`,
          ease: 'none',
          scrollTrigger: {
            trigger: particlesSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
            ...(locoInstance ? { scroller: document.body } : {}),
          }
        }
      );
    });
  });
});
