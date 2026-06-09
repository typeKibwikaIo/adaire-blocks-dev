document.addEventListener('DOMContentLoaded', function() {
    const animationBlocks = document.querySelectorAll('.ad-animation-scroll');
    
    if (!animationBlocks.length) return;
    
    animationBlocks.forEach(block => {
        // Get animation settings from data attributes
        const animationType = block.getAttribute('data-animation-type') || 'fade-in';
        const duration = parseInt(block.getAttribute('data-animation-duration')) || 1000;
        const delay = parseInt(block.getAttribute('data-animation-delay')) || 0;
        const easing = block.getAttribute('data-animation-easing') || 'ease-out';
        const distance = parseInt(block.getAttribute('data-animation-distance')) || 50;
        const flipAxis = block.getAttribute('data-flip-axis') || 'horizontal';
        const flipDirection = block.getAttribute('data-flip-direction') || 'clockwise';
        const reverseScroll = block.getAttribute('data-reverse-scroll') === 'true';
        const threshold = parseFloat(block.getAttribute('data-threshold')) || 0.2;
        const once = block.getAttribute('data-animate-once') === 'true';
        
        const content = block.querySelector('.ad-animation-scroll__content');
        if (!content) return;
        
        // Set initial state based on animation type
        const initialStyles = getInitialStyles(animationType, distance, flipAxis, flipDirection);
        applyStyles(content, initialStyles);
        
        let isAnimatedIn = false;
        let lastRatio = 0;
        let animationTimeout = null;
        
        // Create observer with custom threshold
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Don't process if "once" is enabled and already animated
                if (once && isAnimatedIn && entry.isIntersecting) {
                    return;
                }
                
                const currentRatio = entry.intersectionRatio;
                
                // Check if element crossed the threshold
                const wasAboveThreshold = lastRatio >= threshold;
                const isNowAboveThreshold = currentRatio >= threshold;
                if (isNowAboveThreshold && !wasAboveThreshold && !isAnimatedIn) {
                    // Just crossed INTO view - animate in
                    // Clear any pending animation timeout
                    if (animationTimeout) {
                        clearTimeout(animationTimeout);
                    }
                    
                    animationTimeout = setTimeout(() => {
                        // Check if still above threshold before animating (in case user scrolled away during delay)
                        if (entry.isIntersecting && currentRatio >= threshold) {
                            applyAnimation(content, animationType, 'in', duration, easing, distance, flipAxis, flipDirection);
                            block.classList.add('is-animated-in');
                            isAnimatedIn = true;
                        }
                        animationTimeout = null;
                    }, delay);
                } else if (!isNowAboveThreshold && wasAboveThreshold && isAnimatedIn && reverseScroll) {
                    // Just crossed OUT OF view - animate out (reverse)
                    // Clear any pending animation timeout
                    if (animationTimeout) {
                        clearTimeout(animationTimeout);
                        animationTimeout = null;
                    }
                    
                    applyAnimation(content, animationType, 'out', duration, easing, distance, flipAxis, flipDirection);
                    block.classList.remove('is-animated-in');
                    isAnimatedIn = false;
                } else {
                }
                
                lastRatio = currentRatio;
            });
        }, {
            root: null,
            rootMargin: '0px',
            // Use multiple thresholds to track progress
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        });
        
        observer.observe(block);
    });
    
    // Helper function to get initial styles based on animation type
    function getInitialStyles(animationType, distance, flipAxis, flipDirection) {
        switch(animationType) {
            case 'fade-in':
            case 'fade-out':
                return { opacity: '0' };
            case 'fade-left':
            case 'fly-left':
                return { opacity: '0', transform: `translateX(-${distance}px)` };
            case 'fade-right':
            case 'fly-right':
                return { opacity: '0', transform: `translateX(${distance}px)` };
            case 'fly-up':
                return { opacity: '0', transform: `translateY(${distance}px)` };
            case 'fly-down':
                return { opacity: '0', transform: `translateY(-${distance}px)` };
            case 'grow':
                return { opacity: '0', transform: 'scale(0.8)' };
            case 'shrink':
                return { opacity: '0', transform: 'scale(1.2)' };
            case 'bounce':
                return { opacity: '0', transform: 'scale(0.3)' };
            case 'flip':
                const axis = flipAxis === 'horizontal' ? 'Y' : 'X';
                const dir = flipDirection === 'clockwise' ? '90' : '-90';
                return { opacity: '0', transform: `perspective(100px) rotate${axis}(${dir}deg)` };
            case 'rotate':
                return { opacity: '0', transform: 'rotate(180deg)' };
            case 'blur-in':
                return { opacity: '0', filter: 'blur(10px)' };
            case 'blur-out':
                return { opacity: '0', filter: 'blur(0px)' };
            default:
                return { opacity: '0' };
        }
    }
    
    // Helper function to apply animation
    function applyAnimation(element, animationType, direction, duration, easing, distance, flipAxis, flipDirection) {
        const isOut = direction === 'out';
        const isIn = direction === 'in';
        
        switch(animationType) {
            case 'fade-in':
            case 'fade-out':
                element.style.transition = `opacity ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                break;
            case 'fade-left':
                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.transform = isIn ? 'translateX(0)' : `translateX(-${distance}px)`;
                break;
            case 'fade-right':
                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.transform = isIn ? 'translateX(0)' : `translateX(${distance}px)`;
                break;
            case 'fly-up':
                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.transform = isIn ? 'translateY(0)' : `translateY(${distance}px)`;
                break;
            case 'fly-down':
                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.transform = isIn ? 'translateY(0)' : `translateY(-${distance}px)`;
                break;
            case 'fly-left':
                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.transform = isIn ? 'translateX(0)' : `translateX(-${distance}px)`;
                break;
            case 'fly-right':
                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.transform = isIn ? 'translateX(0)' : `translateX(${distance}px)`;
                break;
            case 'grow':
                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.transform = isIn ? 'scale(1)' : 'scale(0.8)';
                break;
            case 'shrink':
                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.transform = isIn ? 'scale(1)' : 'scale(1.2)';
                break;
            case 'bounce':
                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.transform = isIn ? 'scale(1)' : 'scale(0.3)';
                break;
            case 'flip':
                const axis = flipAxis === 'horizontal' ? 'Y' : 'X';
                const dir = flipDirection === 'clockwise' ? '90' : '-90';
                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.transform = isIn ? `perspective(100px) rotate${axis}(0deg)` : `perspective(200px) rotate${axis}(${dir}deg)`;
                break;
            case 'rotate':
                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.transform = isIn ? 'rotate(0deg)' : 'rotate(180deg)';
                break;
            case 'blur-in':
                element.style.transition = `opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.filter = isIn ? 'blur(0px)' : 'blur(10px)';
                break;
            case 'blur-out':
                element.style.transition = `opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`;
                element.style.opacity = isIn ? '1' : '0';
                element.style.filter = isIn ? 'blur(0px)' : 'blur(0px)';
                break;
        }
    }
    
    // Helper function to apply styles
    function applyStyles(element, styles) {
        Object.keys(styles).forEach(key => {
            element.style[key] = styles[key];
        });
    }
});



