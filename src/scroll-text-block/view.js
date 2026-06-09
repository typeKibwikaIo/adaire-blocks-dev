import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  // Only run on frontend, not in the Gutenberg editor (including iframe canvas)
  const isInIframe = window.self !== window.top;
  const isEditorShell = document.body.classList.contains('block-editor-page') || document.body.classList.contains('wp-admin');
  const hasEditorRoots = !!document.querySelector('[data-block-editor-root]') || !!document.querySelector('.block-editor-block-list__layout');
  const hasWpEditorGlobals = !!(window.wp && (window.wp.data || window.wp.blockEditor || window.wp.blocks));

  if (isInIframe || isEditorShell || hasEditorRoots) {
    // Bail out entirely in editor to avoid intercepting selection
return;
  }
  
  // Get all scroll text blocks on the page
  const scrollTextSections = document.querySelectorAll('.ad-scroll-text-block');
  
  // Loop through each block instance
  scrollTextSections.forEach((scrollTextSection, index) => {
    // eslint-disable-next-line no-console
    const scrollTextContent = scrollTextSection.querySelector('.ad-scroll-text-block__content');
    const headline = scrollTextContent?.querySelector('h1');

    if (!headline || !scrollTextContent || !scrollTextSection) return;

    // Get animation speed, direction, and pin height from data attributes
    const animationSpeed = parseFloat(scrollTextSection.dataset.animationSpeed) || 1;
    const scrollDirection = scrollTextSection.dataset.scrollDirection || 'left';
    const pinHeight = parseFloat(scrollTextSection.dataset.pinHeight) || 100;
    const pinHeightUnit = scrollTextSection.dataset.pinHeightUnit || 'vh';
    
    // Calculate scroll distance based on animation speed
    // Slower speed = longer scroll distance, faster speed = shorter scroll distance
    const scrollDistance = Math.max(100, 250 / animationSpeed);

    // Create unique IDs for each instance to avoid conflicts
    const uniqueId = `scroll-text-${index}`;
    scrollTextSection.setAttribute('data-scroll-text-id', uniqueId);

    // Set initial position and animation properties based on direction
    let fromProps, toProps;
    
    switch (scrollDirection) {
      case 'left':
        // Text starts at normal position and moves left
        fromProps = { xPercent: 0 };
        toProps = { xPercent: -100 };
        break;
      case 'right':
        // Text starts with right edge at right edge of screen, then moves right
        // We need to position it so the right edge is at the screen edge
        fromProps = { xPercent: -50 }; // This positions the right edge at the right edge of screen
        toProps = { xPercent: 50 }; // This moves it right
        break;
      default:
        fromProps = { xPercent: 0 };
        toProps = { xPercent: -100 };
    }

    // Animate headline movement - pin the section instead of the content
    gsap.fromTo(
      headline,
      fromProps,
      {
        ...toProps,
        ease: 'none',
        scrollTrigger: {
          trigger: scrollTextSection, // Use the specific section instance
          start: 'top top',
          end: `+=${scrollDistance}%`,
          scrub: animationSpeed, // Use animation speed for scrub value
          pin: true,
          pinSpacing: true,
          id: `headline-${uniqueId}` // Unique ID for this ScrollTrigger
        },
      }
    );

    // Animate opacity of the section
    gsap.to(scrollTextContent, {
      opacity: 0.3, // or your desired value
      ease: 'none',
      scrollTrigger: {
        trigger: scrollTextContent, // Use the specific content instance
        start: 'top top',
        end: `+=${Math.max(20, 20 / animationSpeed)}%`,
        scrub: animationSpeed, // Use animation speed for scrub value
        id: `opacity-${uniqueId}` // Unique ID for this ScrollTrigger
      }
    });

         // Set the height of the .pin-spacer class using GSAP's onRefresh callback
         const setPinSpacerHeight = () => {
           const pinHeightElement = document.querySelector('.pin-spacer');
           if (pinHeightElement) {
             pinHeightElement.style.setProperty('height', `${pinHeight}${pinHeightUnit}`, 'important');
           }
         };

         // Set height immediately
         setPinSpacerHeight();

         // Use GSAP's onRefresh to set height when ScrollTrigger refreshes
         ScrollTrigger.addEventListener("refresh", setPinSpacerHeight);
  });
});



