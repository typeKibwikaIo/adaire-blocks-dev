import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector('.animated-section');
  const titlesColumn = section?.querySelector('.titles-column');
  const titleItems = section?.querySelectorAll('.title-item');
  const contentItems = section?.querySelectorAll('.content-item');
  const progressIndicator = section?.querySelector('.progress-indicator');
  const progressFill = section?.querySelector('.progress-fill');

  if (!section || !titlesColumn || !titleItems.length || !contentItems.length) return;

  // Get scroll distance from data attributes or use defaults
  const scrollDistance = parseInt(section.dataset.scrollDistance) || 250;
  const scrollDistanceMobile = parseInt(section.dataset.scrollDistanceMobile) || 170;
  const showProgress = section.dataset.showProgress === 'true';
  
  // Determine scroll distance based on screen size
  const getScrollDistance = () => {
    return window.innerWidth <= 1024 ? scrollDistanceMobile : scrollDistance;
  };

  // Pin the entire section
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: `+=${getScrollDistance()}%`,
    pin: true,
    pinSpacing: true
  });

  // Single ScrollTrigger to handle both title scaling, content visibility, and progress indicator
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: `+=${getScrollDistance()}%`,
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;
      
      // Remove active class from all items
      titleItems.forEach(item => item.classList.remove('active'));
      contentItems.forEach(item => item.classList.remove('active'));
      
      // Add active class based on scroll progress
      if (progress < 0.33) {
        titleItems[0].classList.add('active');
        contentItems[0].classList.add('active');
      } else if (progress < 0.66) {
        titleItems[1].classList.add('active');
        contentItems[1].classList.add('active');
      } else {
        titleItems[2].classList.add('active');
        contentItems[2].classList.add('active');
      }

      // Update progress indicator
      if (showProgress && progressFill) {
        gsap.set(progressFill, {
          scaleY: progress,
          transformOrigin: "top center"
        });
      }
    }
  });

  // Handle window resize to update scroll distance
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Refresh ScrollTrigger instances to recalculate with new dimensions
      ScrollTrigger.refresh();
    }, 150);
  });

  // Initialize progress indicator
  if (showProgress && progressFill) {
    // Progress indicator is ready
  }
}); 


