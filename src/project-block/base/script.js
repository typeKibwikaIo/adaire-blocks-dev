import { galleryItems } from "./data.js";

document.addEventListener("DOMContentLoaded", function () {
  const body = document.querySelector('.cgwego-body');
  const gallery = document.querySelector(".gallery");
  const galleryGrid = document.querySelector(".gallery-grid");
  const blurryPrev = document.querySelector(".blurry-prev");
  const projectPreview = document.querySelector(".project-preview");
  const itemCount = galleryItems.length;

  let activeItemIndex = 0;
  let isAnimating = false;
  let isScrolling = false;
  let scrollTimeout;

  function createSplitText(element) {
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

  const initialInfoText = document.querySelector(".info .cgwego-p");
  if (initialInfoText) {
    createSplitText(initialInfoText);
  }

  const elementsToAnimate = document.querySelectorAll(
    ".title .cgwego-h1, .info .cgwego-p .line span, .credits .cgwego-p, .director .cgwego-p"
  );
  gsap.set(elementsToAnimate, {
    y: 0,
  });

  // Create gallery items
  for (let i = 0; i < itemCount; i++) {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    if (i === 0) itemDiv.classList.add("active");

    const img = document.createElement("img");
    img.classList.add("cgwego-img");
    img.src = `./assets/${galleryItems[i].img}`;
    img.alt = galleryItems[i].title;

    itemDiv.appendChild(img);
    itemDiv.dataset.index = i;
    itemDiv.addEventListener("click", () => handleItemClick(i));
    gallery.appendChild(itemDiv);
  }

  // Prevent scroll events from bubbling up from the gallery
  galleryGrid.addEventListener("wheel", function(e) {
    e.stopPropagation();
  }, { passive: false });

  galleryGrid.addEventListener("scroll", function(e) {
    e.stopPropagation();
  });

  // Add scroll event listener to body
  body.addEventListener("wheel", handleWheel, { passive: false });

  function handleWheel(e) {
    e.preventDefault();
    
    if (isAnimating || isScrolling) return;
    
    isScrolling = true;
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 500); // Debounce scroll events

    const delta = e.deltaY;
    
    if (delta > 0 && activeItemIndex < itemCount - 1) {
      // Scrolling down - go to next image
      handleItemChange(activeItemIndex + 1);
    } else if (delta < 0 && activeItemIndex > 0) {
      // Scrolling up - go to previous image
      handleItemChange(activeItemIndex - 1);
    }
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
    
    // Trigger open animation
    requestAnimationFrame(() => {
      fullscreenOverlay.classList.add("active");
      fullscreenOverlay.querySelector(".fullscreen-content").classList.add("active");
    });
    
    // Add event listeners
    fullscreenOverlay.addEventListener("click", function(e) {
      if (e.target === fullscreenOverlay || e.target.classList.contains("close-fullscreen")) {
        closeFullscreen(fullscreenOverlay);
      }
    });
    
    // Close on escape key
    document.addEventListener("keydown", function closeOnEscape(e) {
      if (e.key === "Escape") {
        closeFullscreen(fullscreenOverlay);
        document.removeEventListener("keydown", closeOnEscape);
      }
    });
  }

  function closeFullscreen(fullscreenOverlay) {
    const fullscreenContent = fullscreenOverlay.querySelector(".fullscreen-content");
    
    // Trigger close animation
    fullscreenOverlay.classList.remove("active");
    fullscreenContent.classList.remove("active");
    
    // Remove element after animation completes
    setTimeout(() => {
      if (fullscreenOverlay.parentNode) {
        document.body.removeChild(fullscreenOverlay);
      }
    }, 300); // Match the CSS transition duration
  }

  function createElementWithClass(tag, className) {
    const element = document.createElement(tag);
    element.classList.add(className);
    return element;
  }

  function createProjectDetails(activeItem, index) {
    const newProjectDetails = createElementWithClass("div", "project-details");

    const detailsStructure = [
      { className: "title", tag: "h1", content: activeItem.title, extraClass: "cgwego-h1" },
      { className: "info", tag: "p", content: activeItem.copy, extraClass: "cgwego-p" },
      { className: "credits", tag: "p", content: "Credits", extraClass: "cgwego-p" },
      {
        className: "director",
        tag: "p",
        content: `Director: ${activeItem.director}`,
        extraClass: "cgwego-p"
      },
    ];

    detailsStructure.forEach(({ className, tag, content, extraClass }) => {
      const div = createElementWithClass("div", className);
      const element = document.createElement(tag);
      if (extraClass) element.classList.add(extraClass);
      element.textContent = content;
      div.appendChild(element);
      newProjectDetails.appendChild(div);
    });

    const newProjectImg = createElementWithClass("div", "project-img");
    const newImg = document.createElement("img");
    newImg.classList.add("cgwego-img");
    newImg.src = `./assets/${activeItem.img}`;
    newImg.alt = activeItem.title;
    newImg.style.cursor = "pointer";
    newImg.addEventListener("click", () => openFullscreen(`./assets/${activeItem.img}`));
    newProjectImg.appendChild(newImg);

    return {
      newProjectDetails,
      newProjectImg,
      infoP: newProjectDetails.querySelector(".info .cgwego-p"),
    };
  }

  function handleItemChange(index) {
    if (index === activeItemIndex || isAnimating) return;

    isAnimating = true;

    const activeItem = galleryItems[index];

    // Update active state in gallery
    gallery.children[activeItemIndex].classList.remove("active");
    gallery.children[index].classList.add("active");
    activeItemIndex = index;

    const elementsToAnimate = document.querySelectorAll(
      ".title .cgwego-h1, .info .cgwego-p .line span, .credits .cgwego-p, .director .cgwego-p"
    );

    const currentProjectImg = document.querySelector(".project-img");
    const currentProjectImgElem = currentProjectImg.querySelector("img");

    const newBlurryImg = document.createElement("img");
    newBlurryImg.src = `./assets/${activeItem.img}`;
    newBlurryImg.alt = activeItem.title;
    gsap.set(newBlurryImg, {
      opacity: 0,
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
    });
    blurryPrev.insertBefore(newBlurryImg, blurryPrev.firstChild);

    const currentBlurryImg = blurryPrev.querySelector("img:nth-child(2)");
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

    gsap.to(currentProjectImg, {
      onStart: () => {
        gsap.to(currentProjectImgElem, {
          scale: 2,
          duration: 1,
          ease: "power4.in",
        });
      },
      scale: 0,
      bottom: "10em",
      duration: 1,
      ease: "power4.in",
      onComplete: function () {
        document.querySelector(".project-details")?.remove();
        currentProjectImg.remove();

        const { newProjectDetails, newProjectImg, infoP } =
          createProjectDetails(activeItem, index);

        projectPreview.appendChild(newProjectDetails);
        projectPreview.appendChild(newProjectImg);

        createSplitText(infoP);

        const newElementsToAnimate = newProjectDetails.querySelectorAll(
          ".title .cgwego-h1, .info .cgwego-p .line span, .credits .cgwego-p, .director .cgwego-p"
        );

        gsap.fromTo(
          newElementsToAnimate,
          { y: 40 },
          {
            y: 0,
            duration: 1,
            ease: "power4.out",
            stagger: 0.05,
          }
        );

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
          { scale: 2 },
          {
            scale: 1,
            duration: 1,
            ease: "power4.out",
            onComplete: () => {
              isAnimating = false;
            },
          }
        );
      },
    });
  }

  // Add click event to initial project image
  const initialProjectImg = document.querySelector(".project-img .cgwego-img");
  if (initialProjectImg) {
    initialProjectImg.style.cursor = "pointer";
    // Use the first item's image for fullscreen
    initialProjectImg.addEventListener("click", () => openFullscreen(`./assets/${galleryItems[0].img}`));
  }
});



