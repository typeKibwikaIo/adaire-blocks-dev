// Project Block frontend logic: gallery navigation, blur, and animation (adapted from /base/script.js)
import gsap from "gsap";
import SplitType from "split-type";

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.cgwego-html').forEach(blockRoot => {
    const nextLabel = blockRoot.dataset.nextLabel;
    const gallery = blockRoot.querySelector(".gallery");
    const galleryGrid = blockRoot.querySelector(".gallery-grid");
    const blurryPrev = blockRoot.querySelector(".blurry-prev");
    const projectPreview = blockRoot.querySelector(".project-preview");
    // Read galleryItems from the JSON script tag
    const dataScript = blockRoot.querySelector('script[type="application/json"][id^="project-block-data-"]');
    let galleryItems = [];
    if (dataScript) {
      try {
        galleryItems = JSON.parse(dataScript.textContent);
      } catch (e) {
        galleryItems = [];
      }
    }
    const items = Array.from(gallery.querySelectorAll('.item'));
    let activeItemIndex = 0;
    let isAnimating = false;

    // Function to setup readmore button event listener
    function setupReadMoreButton() {
      const readmore = blockRoot.querySelector("#nextitem");
      if (readmore && !readmore.hasAttribute('data-event-attached')) {
        readmore.setAttribute('data-event-attached', 'true');
        readmore.addEventListener("click", (e) => {
          e.preventDefault();
          if (activeItemIndex === galleryItems.length - 1) {
            return;
          }
          readMore(activeItemIndex);
        });
      }
    }

    // Try to setup readmore button immediately
    setupReadMoreButton();

    // Watch for dynamic content changes and setup readmore button when it appears
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.id === 'nextitem' || node.querySelector('#nextitem')) {
                setupReadMoreButton();
              }
            }
          });
        }
      });
    });

    observer.observe(blockRoot, {
      childList: true,
      subtree: true
    });

    // Also setup using event delegation as fallback
    blockRoot.addEventListener("click", (e) => {
      if (e.target.closest("#nextitem")) {
        e.preventDefault();
        if (activeItemIndex === galleryItems.length - 1) {
          return;
        }
        readMore(activeItemIndex);
      }
    });

    function readMore(currentIndex){
      if(!isAnimating){
        handleItemChange(currentIndex+1);
      }
    }

    function createSplitText(element) {
      if (!SplitType) return;
      
      // If the element has multiple paragraphs (from line splitting), handle each one
      const paragraphs = element.querySelectorAll('p');
      if (paragraphs.length > 1) {
        paragraphs.forEach(paragraph => {
          const splitText = new SplitType(paragraph, { types: "lines" });
          paragraph.innerHTML = "";
          splitText.lines.forEach((line) => {
            const lineDiv = document.createElement("div");
            lineDiv.className = "line";
            const lineSpan = document.createElement("span");
            lineSpan.textContent = line.textContent;
            lineDiv.appendChild(lineSpan);
            paragraph.appendChild(lineDiv);
          });
        });
      } else {
        // Original single paragraph handling
        const splitText = new SplitType(element, { types: "lines" });
        element.innerHTML = "";
        splitText.lines.forEach((line) => {
          const lineDiv = document.createElement("div");
          lineDiv.className = "line";
          const lineSpan = document.createElement("span");
          lineSpan.textContent = line.textContent;
          lineDiv.appendChild(lineSpan);
          element.appendChild(lineDiv);
        });
      }
    }

    // Initial split text - handle all paragraphs
    const initialInfoParagraphs = blockRoot.querySelectorAll(".info .cgwego-p");
    if (initialInfoParagraphs.length > 0) {
      initialInfoParagraphs.forEach(paragraph => {
        createSplitText(paragraph);
      });
      // Animate in the lines on page load
      const lines = blockRoot.querySelectorAll('.info .cgwego-p .line span');
      gsap.fromTo(
        lines,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.05 }
      );
    }
    
    // Animate the title, credits, director, and read more on page load
    const initialTitle = blockRoot.querySelector(".title .cgwego-h1");
    const initialCredits = blockRoot.querySelector(".credits .cgwego-p");
    const initialDirector = blockRoot.querySelector(".director .cgwego-p");
    
    // Create array of elements to animate
    const elementsToAnimate = [initialTitle, initialCredits, initialDirector];
    
    // Debug logging
    // Create and add read more text if there are multiple items
    if (galleryItems.length > 1) {
      // Find the project-details container
      const projectDetails = blockRoot.querySelector(".project-details");
      if (projectDetails) {
        // Create the read more container
        const readMoreDiv = document.createElement("div");
        readMoreDiv.className = "read-more-text";
        readMoreDiv.id = "nextitem";
        
        // Create the read more text
        const readMoreP = document.createElement("p");
        readMoreP.className = "cgwego-p cgwego-read-more";
        readMoreP.textContent = nextLabel;
        
        // Append the text to the container
        readMoreDiv.appendChild(readMoreP);
        
        // Append the container to project-details
        projectDetails.appendChild(readMoreDiv);
        
        // Add to animation array
        elementsToAnimate.push(readMoreP);
      } else {
      }
    } else {
    }
    
    // Animate all elements
    setTimeout(() => {
      gsap.fromTo(
        elementsToAnimate,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.05 }
      );
    }, 100);

    // Set up click events for gallery items
    items.forEach((itemDiv, i) => {
      itemDiv.addEventListener("click", () => {
        // Defensive: clamp index to galleryItems length
        const safeIndex = Math.max(0, Math.min(i, galleryItems.length - 1));
        handleItemClick(safeIndex);
      });
    });

    // Prevent scroll events from bubbling up from the gallery
    if (galleryGrid) {
      galleryGrid.addEventListener("wheel", function(e) { e.stopPropagation(); }, { passive: false });
      galleryGrid.addEventListener("scroll", function(e) { e.stopPropagation(); });
    }

    function handleItemClick(index) {
      if (index === activeItemIndex || isAnimating) return;
      handleItemChange(index);
    }

    function openFullscreen(imageSrc) {
      // Create fullscreen overlay
      const fullscreenOverlay = document.createElement("div");
      fullscreenOverlay.className = "fullscreen-overlay";
      fullscreenOverlay.innerHTML = `
        <div class="fullscreen-content">
          <img src="${imageSrc}" alt="Fullscreen view" />
          <button class="close-fullscreen">&times;</button>
        </div>
      `;
      document.body.appendChild(fullscreenOverlay);
      requestAnimationFrame(() => {
        fullscreenOverlay.classList.add("active");
        fullscreenOverlay.querySelector(".fullscreen-content").classList.add("active");
      });
      fullscreenOverlay.addEventListener("click", function(e) {
        if (e.target === fullscreenOverlay || e.target.classList.contains("close-fullscreen")) {
          closeFullscreen(fullscreenOverlay);
        }
      });
      document.addEventListener("keydown", function closeOnEscape(e) {
        if (e.key === "Escape") {
          closeFullscreen(fullscreenOverlay);
          document.removeEventListener("keydown", closeOnEscape);
        }
      });
    }
    function closeFullscreen(fullscreenOverlay) {
      const fullscreenContent = fullscreenOverlay.querySelector(".fullscreen-content");
      fullscreenOverlay.classList.remove("active");
      fullscreenContent.classList.remove("active");
      setTimeout(() => {
        if (fullscreenOverlay.parentNode) {
          document.body.removeChild(fullscreenOverlay);
        }
      }, 300);
    }

    function createElementWithClass(tag, className) {
      const element = document.createElement(tag);
      element.className = className;
      return element;
    }

    function createProjectDetails(activeItem, isLastItem = false) {
      const newProjectDetails = createElementWithClass("div", "project-details");
      
      // Handle title
      const titleDiv = createElementWithClass("div", "title");
      const titleElement = document.createElement("h1");
      titleElement.classList.add("cgwego-h1");
      titleElement.textContent = activeItem.title;
      titleDiv.appendChild(titleElement);
      newProjectDetails.appendChild(titleDiv);
      
      // Handle copy content - split by line breaks and create separate paragraphs
      const infoDiv = createElementWithClass("div", "info");
      if (activeItem.copy && activeItem.copy.includes('\n')) {
        // Split by line breaks and create separate paragraphs for each line
        const lines = activeItem.copy.split('\n');
        lines.forEach((line, index) => {
          // Create paragraph for every line, including empty lines
          const lineElement = document.createElement("p");
          lineElement.classList.add("cgwego-p");
          lineElement.textContent = line; // Don't trim to preserve empty lines
          infoDiv.appendChild(lineElement);
        });
      } else {
        // Single paragraph if no line breaks
        const copyElement = document.createElement("p");
        copyElement.classList.add("cgwego-p");
        copyElement.textContent = activeItem.copy;
        infoDiv.appendChild(copyElement);
      }
      newProjectDetails.appendChild(infoDiv);
      
      // Create read more text only if not the last item
      let newReadMoreText = null;
      if (!isLastItem) {
        const readMoreDiv = createElementWithClass("div", "read-more-text");
        readMoreDiv.id = "nextitem";
        const readMoreP = document.createElement("p");
        readMoreP.className = "cgwego-p cgwego-read-more";
        readMoreP.textContent = nextLabel;
        readMoreDiv.appendChild(readMoreP);
        newProjectDetails.appendChild(readMoreDiv);
        newReadMoreText = readMoreDiv;
      }
      
      const newProjectImg = createElementWithClass("div", "project-img");
      const newImg = document.createElement("img");
      newImg.classList.add("cgwego-img");
      newImg.src = activeItem.img;
      newImg.alt = activeItem.title;
      newImg.style.cursor = "pointer";
      newImg.addEventListener("click", () => openFullscreen(activeItem.img));
      newProjectImg.appendChild(newImg);
      return {
        newProjectDetails,
        newProjectImg,
        newReadMoreText,
        infoP: newProjectDetails.querySelector(".info .cgwego-p"),
      };
    }

    function handleItemChange(index) {
      if (index === activeItemIndex || isAnimating) return;
      isAnimating = true;
      
             // Handle readmore button visibility
       const readmore = blockRoot.querySelector("#nextitem");
       if (readmore) {
         if (index === galleryItems.length - 1) {
           readmore.style.visibility = "hidden";
         } else {
           if (readmore.style.visibility === "hidden") {
             readmore.style.visibility = "visible";
           }
         }
         // Ensure event listener is attached to the button
         setupReadMoreButton();
       }
      const activeItem = galleryItems[index];
      // Update active state in gallery
      if (items[activeItemIndex]) items[activeItemIndex].classList.remove("active");
      if (items[index]) items[index].classList.add("active");
      activeItemIndex = index;
             const elementsToAnimate = blockRoot.querySelectorAll(
         ".title .cgwego-h1, .info .cgwego-p .line span, .info .cgwego-p, .credits .cgwego-p, .director .cgwego-p"
       );
      const currentProjectImg = blockRoot.querySelector(".project-img");
      const currentProjectImgElem = currentProjectImg?.querySelector("img");
      // Blur transition
      const newBlurryImg = document.createElement("img");
      newBlurryImg.src = activeItem.img;
      newBlurryImg.alt = activeItem.title;
      newBlurryImg.style.position = "absolute";
      newBlurryImg.style.width = "100%";
      newBlurryImg.style.height = "100%";
      newBlurryImg.style.objectFit = "cover";
      newBlurryImg.style.opacity = 0;
      blurryPrev.insertBefore(newBlurryImg, blurryPrev.firstChild);
      const currentBlurryImg = blurryPrev.querySelector("img:nth-child(2)");
      if (gsap) {
        if (currentBlurryImg) {
          gsap.to(currentBlurryImg, {
            opacity: 0,
            duration: 1,
            delay: 0.5,
            ease: "power2.inOut",
            onComplete: () => blurryPrev.removeChild(currentBlurryImg),
          });
        }
        gsap.to(newBlurryImg, {
          delay: 0.5,
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
        });
                 gsap.to(elementsToAnimate, {
           y: -60,
           duration: 1,
           ease: "power4.in",
           stagger: 0.05,
         });
         
         // Animate out the read more text separately with fade-out
         const currentReadMoreText = blockRoot.querySelector(".read-more-text .cgwego-read-more");
         if (currentReadMoreText) {
           gsap.to(currentReadMoreText, {
             opacity: 0,
             duration: 1,
             ease: "power4.in",
             delay: 0.2
           });
         }
        // Animate out the current image (zoom out and fade), then swap preview
        if (currentProjectImgElem && currentProjectImg) {
          gsap.to(currentProjectImgElem, {
            scale: 2,
            opacity: 0,
            duration: 1,
            ease: "power4.in",
          });
          gsap.to(currentProjectImg, {
            scale: 0,
            bottom: "10em",
            duration: 1,
            ease: "power4.in",
            onStart: () => {
              // nothing needed here
            },
                         onComplete: () => {
                               // Remove old preview
                blockRoot.querySelector(".project-details")?.remove();
                currentProjectImg?.remove();
                // Build new preview pane
                const isLastItem = index === galleryItems.length - 1;
                const { newProjectDetails, newProjectImg, newReadMoreText, infoP } = createProjectDetails(activeItem, isLastItem);
                projectPreview.appendChild(newProjectDetails);
                projectPreview.appendChild(newProjectImg);
               // Process all paragraphs in the info section
               const allInfoParagraphs = newProjectDetails.querySelectorAll('.info .cgwego-p');
               allInfoParagraphs.forEach(paragraph => {
                 createSplitText(paragraph);
               });
                                            const newElementsToAnimate = newProjectDetails.querySelectorAll(
                 ".title .cgwego-h1, .info .cgwego-p .line span, .info .cgwego-p, .credits .cgwego-p, .director .cgwego-p"
               );
               gsap.fromTo(
                 newElementsToAnimate,
                 { y: 40 },
                 {
                   y: 0,
                   duration: 1,
                   ease: "power4.out",
                   stagger: 0.05,
                   onComplete: () => {
                     isAnimating = false;
                   },
                 }
               );
               
               // Animate the read more text separately with a delay
               const newReadMoreTextElement = newProjectDetails.querySelector(".read-more-text .cgwego-read-more");
               if (newReadMoreTextElement) {
                 gsap.fromTo(
                   newReadMoreTextElement,
                   { opacity: 0 },
                   {
                     opacity: 1,
                     duration: 0.8,
                     ease: "power2.out",
                     delay: 0.5
                   }
                 );
               }
              gsap.fromTo(
                newProjectImg,
                { scale: 0, bottom: "-10em" },
                {
                  scale: 1,
                  bottom: "1em",
                  duration: 1,
                  ease: "power4.out",
                }
              );
              gsap.fromTo(
                newProjectImg.querySelector("img"),
                { scale: 2, opacity: 0 },
                {
                  scale: 1,
                  opacity: 1,
                  duration: 1,
                  ease: "power4.out"
                }
              );
              
            }
          });
                 } else {
           // Fallback: just swap content
           blockRoot.querySelector(".project-details")?.remove();
           currentProjectImg?.remove();
           const { newProjectDetails, newProjectImg } = createProjectDetails(activeItem);
           projectPreview.appendChild(newProjectDetails);
           projectPreview.appendChild(newProjectImg);
           isAnimating = false;
         }
             } else {
         // Fallback: just swap content
         if (currentBlurryImg) blurryPrev.removeChild(currentBlurryImg);
         newBlurryImg.style.opacity = 1;
         blockRoot.querySelector(".project-details")?.remove();
         currentProjectImg?.remove();
         const { newProjectDetails, newProjectImg } = createProjectDetails(activeItem);
         projectPreview.appendChild(newProjectDetails);
         projectPreview.appendChild(newProjectImg);
         isAnimating = false;
       }
    }

    // Add click event to initial project image
    const initialProjectImg = blockRoot.querySelector(".project-img .cgwego-img");
    if (initialProjectImg) {
      initialProjectImg.style.cursor = "pointer";
      initialProjectImg.addEventListener("click", () => openFullscreen(galleryItems[0]?.img));
    }


  });
});


