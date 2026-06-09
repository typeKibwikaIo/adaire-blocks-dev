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

  const particlesSection = document.querySelector('.ad-particles-block');
  if (!particlesSection) return;

  const textSections = particlesSection.querySelectorAll('.ad-particles-block__text-section');
  const textOverlay = particlesSection.querySelector('.ad-particles-block__text-content-overlay');
  const particles = particlesSection.querySelectorAll('.ad-particles-block__particle');

  // Read configurable text animation duration (seconds)
  const textAnimDuration = parseFloat(particlesSection.dataset.textAnimDuration || '0.35') || 0.35;

  // Set mobile sizes for particles
  particles.forEach((particle) => {
    const mobileSize = particle.dataset.mobileSize;
    if (mobileSize) {
      particle.style.setProperty('--mobile-size', `${mobileSize}px`);
    }
  });



  // Text content animations - use individual ScrollTriggers for each text section
  if (textSections.length > 0 && textOverlay) {
    // Set initial state
    textSections.forEach((section, index) => {
      const title = section.querySelector('h2');
      const desc = section.querySelector('p');
             if (index === 0) {
         gsap.set(section, { opacity: 1, display: 'block' });
         gsap.set([title, desc], { opacity: 0, x: 100 });
       } else {
        gsap.set(section, { opacity: 0, display: 'none' });
        gsap.set([title, desc], { opacity: 0, x: 100 });
      }
    });

    // Hide all text sections except the first
    let lastActive = 0;

    textSections.forEach((section, index) => {
      const title = section.querySelector('h2');
      const desc = section.querySelector('p');
      // Read per-section appear/disappear percentages; fallback to evenly spaced if missing
      const appearAttr = section.getAttribute('data-appear');
      const disappearAttr = section.getAttribute('data-disappear');
      const totalSections = textSections.length;
      const defaultStartPct = (index / totalSections) * 100;
      const defaultEndPct = ((index + 0.8) / totalSections) * 100;
      const appearPct = appearAttr !== null && appearAttr !== '' ? parseFloat(appearAttr) : defaultStartPct;
      const disappearPct = disappearAttr !== null && disappearAttr !== '' ? parseFloat(disappearAttr) : defaultEndPct;
      const startPct = Math.min(appearPct, disappearPct);
      const endPct = Math.max(appearPct, disappearPct);
      const sectionStart = `top+=${startPct}% center`;
      const sectionEnd = `top+=${endPct}% center`;
      ScrollTrigger.create({
        trigger: particlesSection,
        start: sectionStart,
        end: sectionEnd,
        scrub: false,
        ...(locoInstance ? { scroller: document.body } : {}),
                 onEnter: () => {
           // Prevent animation if modal is closing
           if (window.isModalClosing) return;
           
           // Hide all other sections immediately
           textSections.forEach((other, i) => {
             if (i !== index) {
               gsap.set(other, { display: 'none', opacity: 0 });
               const oTitle = other.querySelector('h2');
               const oDesc = other.querySelector('p');
               gsap.set([oTitle, oDesc], { x: 100, opacity: 0 });
             }
           });
           // Animate in this section
           gsap.set(section, { display: 'block', opacity: 1 });
           gsap.to([title, desc], { x: 0, opacity: 1, duration: textAnimDuration, stagger: 0.15, ease: 'power2.out' });
           lastActive = index;
         },
                 onEnterBack: function() {
           // Prevent animation if modal is closing
           if (window.isModalClosing) return;
           
           // Hide all other sections immediately
           textSections.forEach((other, i) => {
             if (i !== index) {
               gsap.set(other, { display: 'none', opacity: 0 });
               const oTitle = other.querySelector('h2');
               const oDesc = other.querySelector('p');
               gsap.set([oTitle, oDesc], { x: 100, opacity: 0 });
             }
           });
           // Animate in this section
           gsap.set(section, { display: 'block', opacity: 1 });
           gsap.to([title, desc], { x: 0, opacity: 1, duration: textAnimDuration, stagger: 0.15, ease: 'power2.out' });
           lastActive = index;
         },
        onLeave: () => {
          // Animate out this section (down)
          gsap.to([title, desc], { x: -100, opacity: 0, duration: textAnimDuration, stagger: 0.15, ease: 'power2.in', onComplete: () => {
            gsap.set(section, { display: 'none', opacity: 0 });
            gsap.set([title, desc], { x: 100, opacity: 0 });
          }});
        },
        onLeaveBack: () => {
          // Animate out this section (up)
          gsap.to([title, desc], { x: 100, opacity: 0, duration: textAnimDuration, stagger: 0.15, ease: 'power2.in', onComplete: () => {
            gsap.set(section, { display: 'none', opacity: 0 });
            gsap.set([title, desc], { x: 100, opacity: 0 });
          }});
        }
      });
    });

    // Show/hide overlay based on section visibility
    ScrollTrigger.create({
      trigger: particlesSection,
      start: 'top 60%',
      end: 'bottom center',
      scrub: 1,
      ...(locoInstance ? { scroller: document.body } : {}),
             onEnter: () => {
         // Prevent animation if modal is closing
         if (window.isModalClosing) return;
         textOverlay.classList.add('active');
       },
      onLeave: () => {
        // Animate out the currently visible text section
        const visibleSection = Array.from(textSections).find(sec => sec.style.display === 'block');
        if (visibleSection) {
          const title = visibleSection.querySelector('h2');
          const desc = visibleSection.querySelector('p');
          gsap.to([title, desc], {
            x: -100,
            opacity: 0,
            duration: textAnimDuration,
            stagger: 0.15,
            ease: 'power2.in',
            onComplete: () => {
              gsap.set(visibleSection, { display: 'none', opacity: 0 });
              gsap.set([title, desc], { x: 100, opacity: 0 });
              textOverlay.classList.remove('active');
            }
          });
        } else {
          textOverlay.classList.remove('active');
        }
      },
             onEnterBack: () => {
         // Prevent animation if modal is closing
         if (window.isModalClosing) return;
         textOverlay.classList.add('active');
       },
      onLeaveBack: () => {
        // Animate out the currently visible text section
        const visibleSection = Array.from(textSections).find(sec => sec.style.display === 'block');
        if (visibleSection) {
          const title = visibleSection.querySelector('h2');
          const desc = visibleSection.querySelector('p');
          gsap.to([title, desc], {
            x: -100,
            opacity: 0,
            duration: textAnimDuration,
            stagger: 0.15,
            ease: 'power2.in',
            onComplete: () => {
              gsap.set(visibleSection, { display: 'none', opacity: 0 });
              gsap.set([title, desc], { x: 100, opacity: 0 });
              textOverlay.classList.remove('active');
            }
          });
        } else {
          textOverlay.classList.remove('active');
        }
      }
    });
  }

  // Particle animations with enhanced parallax effect - X and Y movements only
  // Apply animations on all screen sizes for consistent behavior
  particles.forEach((particle, index) => {
    const particleType = particle.dataset.particleType || 'normal';
    const speed = parseFloat(particle.dataset.speed) || 1;
    
    // Handle dynamic particles with special behavior (always animate regardless of animationEnabled)
    if (particleType === 'dynamic') {
      const overlay = particle.querySelector('.dynamic-particle-overlay');
      
      // Set initial scale for dynamic particles
      gsap.set(particle, { scale: 0.8 });
      
      // Dynamic particle size and overlay animation based on screen position
      ScrollTrigger.create({
        trigger: particlesSection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        ...(locoInstance ? { scroller: document.body } : {}),
        onUpdate: (self) => {
          // Calculate particle's position relative to viewport center
          const rect = particle.getBoundingClientRect();
          const viewportCenter = window.innerHeight / 2;
          const particleCenter = rect.top + rect.height / 2;
          const distanceFromCenter = Math.abs(particleCenter - viewportCenter);
          const maxDistance = window.innerHeight / 2;
          const centerProgress = 1 - (distanceFromCenter / maxDistance);
          
          // Scale based on center proximity (biggest at center)
          const scale = 0.8 + (centerProgress * 0.4); // 0.8 to 1.2
          gsap.set(particle, { scale: scale });
          
          // Overlay opacity based on screen position - more sophisticated
          if (overlay) {
            // Calculate how far the particle is from the center of the viewport
            const viewportCenter = window.innerHeight / 2;
            const particleCenter = rect.top + rect.height / 2;
            const distanceFromCenter = Math.abs(particleCenter - viewportCenter);
            const maxDistance = window.innerHeight / 2;
            
            // Create a smooth opacity curve: 0 at center (fully visible), 1 at edges (overlay visible)
            const centerProgress = distanceFromCenter / maxDistance;
            const overlayOpacity = Math.max(0, Math.min(1, centerProgress));
            
            // Also adjust particle brightness/opacity - more visible when closer to center
            const particleOpacity = 1 - (centerProgress * 0.3); // 1.0 at center, 0.7 at edges
            const particleBrightness = 1 + (1 - centerProgress) * 0.2; // 1.2 at center, 1.0 at edges
            
            gsap.set(overlay, { opacity: overlayOpacity });
            gsap.set(particle, { 
              opacity: particleOpacity,
              filter: `brightness(${particleBrightness})`
            });
          }
        }
      });
      
      // Basic movement for dynamic particles
      gsap.fromTo(particle, 
        { y: 0 },
        {
          y: `${-100 * speed}px`,
          ease: 'none',
          scrollTrigger: {
            trigger: particlesSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            ...(locoInstance ? { scroller: document.body } : {}),
          }
        }
      );
    } else {
      // Regular particle animations - only if animation is enabled
      const animationEnabled = particle.dataset.animationEnabled !== 'false';
      if (!animationEnabled) return; // Skip animation for normal particles
      
      const movementType = index % 6; // 6 different movement types for more variety
      switch (movementType) {
        case 0:
          // Strong vertical movement (up) - opposite to scroll direction
          gsap.fromTo(particle, 
            { y: 0 },
            {
              y: `${200 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: particlesSection,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
        case 1:
          // Enhanced horizontal movement (left to right)
          gsap.fromTo(particle,
            { x: 0 },
            {
              x: `${120 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: particlesSection,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
        case 2:
          // Strong vertical movement (down) - same as scroll direction
          gsap.fromTo(particle,
            { y: 0 },
            {
              y: `${-200 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: particlesSection,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
        case 3:
          // Enhanced horizontal movement (right to left)
          gsap.fromTo(particle,
            { x: 0 },
            {
              x: `${-120 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: particlesSection,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
        case 4:
          // Diagonal movement (top-left to bottom-right)
          gsap.fromTo(particle,
            { x: 0, y: 0 },
            {
              x: `${80 * speed}px`,
              y: `${-80 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: particlesSection,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
        case 5:
          // Diagonal movement (top-right to bottom-left)
          gsap.fromTo(particle,
            { x: 0, y: 0 },
            {
              x: `${-60 * speed}px`,
              y: `${150 * speed}px`,
              ease: 'none',
              scrollTrigger: {
                trigger: particlesSection,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
                ...(locoInstance ? { scroller: document.body } : {}),
              }
            }
          );
          break;
      }
    }
  });
});



