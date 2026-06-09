import gsap from "gsap";

// Initialize stories data
let stories = [];

function initializeStories() {
  // Get stories data from WordPress block attributes
  // First try to get from data attribute (preferred method)
  const blockElement = document.querySelector('.ad-services-block-body');
  let slidesData = [];
  let previewText = 'We:';
  let linkText = 'Read More';
  
  // Method 1: Try to get data from data-slides attribute (most reliable)
  if (blockElement) {
    const dataSlides = blockElement.getAttribute('data-slides');
    const dataPreviewText = blockElement.getAttribute('data-preview-text');
    const dataLinkText = blockElement.getAttribute('data-link-text');
    
    if (dataSlides) {
      try {
        slidesData = JSON.parse(dataSlides);
        previewText = dataPreviewText || previewText;
        linkText = dataLinkText || linkText;
      } catch (e) {
        console.error('Error parsing data-slides attribute:', e);
      }
    }
  }
  
  // Method 2: Fallback to window.servicesBlockData (for backwards compatibility)
  if (slidesData.length === 0 && window.servicesBlockData) {
    const blockId = blockElement?.id || blockElement?.closest('.animation-component')?.id || Object.keys(window.servicesBlockData)[0];
    const blockData = window.servicesBlockData[blockId];
    
    if (blockData && blockData.slides && blockData.slides.length > 0) {
      slidesData = blockData.slides;
      previewText = blockData.previewText || blockData.linkText || previewText;
      linkText = blockData.linkText || linkText;
    }
  }
  
  // Convert slides to stories format
  if (slidesData && slidesData.length > 0) {
    stories = slidesData.map((slide, index) => {
      // Use the image URL if available
      // The URL should be properly stored in save.js and converted by PHP if needed
      const imageUrl = slide.slideImg && slide.slideImg.trim() !== "" 
        ? slide.slideImg 
        : '';
      
      // Only use placeholder if we truly have no image URL
      // PHP function should have converted ID to URL if needed
      const finalImageUrl = imageUrl || `./assets/build.jpg`;
      
      return {
        profileImg: finalImageUrl,
        profileName: slide.slideTitle || `Service ${index + 1}`,
        title: slide.slideDescription ? 
          slide.slideDescription.split(' ').reduce((lines, word, wordIndex) => {
            const lineIndex = Math.floor(wordIndex / 4);
            if (!lines[lineIndex]) lines[lineIndex] = [];
            lines[lineIndex].push(word);
            return lines;
          }, []).map(line => line.join(' ')) : 
          ["Service description will appear here"],
        linkLabel: linkText,
        linkSrc: slide.slideUrl || "#",
        storyImg: finalImageUrl
      };
    });
  } else {
    console.warn('No slides data found, using defaults');
    stories = getDefaultStories();
  }
  
  if (stories.length === 0) {
    console.warn('No stories found, using defaults');
    stories = getDefaultStories();
  }
}

function getDefaultStories() {
  return [
    {
      profileImg: "./assets/build.jpg",
      profileName: "Build",
      title: [
        "We design and develop custom websites",
        "and applications that are tailored",
        "to your specific needs and goals.",
      ],
      linkLabel: "Read More",
      linkSrc: "behance.net",
      storyImg: "./assets/build.jpg",
    },
    {
      profileImg: "./assets/maintain.jpg",
      profileName: "Maintain",
      title: [
        "We provide ongoing maintenance",
        " and support to ensure ",
        "your digital assets are always ",
      ],
      linkLabel: "Discover",
      linkSrc: "dribbble.com",
      storyImg: "./assets/maintain.jpg",
    },
    {
      profileImg: "./assets/support.jpg",
      profileName: "Support",
      title: ["Our dedicated support team",  "is always available to", "help you with any issues or questions", "you may have."],
      linkLabel: "Check It Out",
      linkSrc: "awwwards.com",
      storyImg: "./assets/support.jpg",
    },
    {
      profileImg: "./assets/host.jpg",
      profileName: "Host",
      title: ["We offer reliable and secure", " hosting solutions to ensure", "your website is always", "online and performing optimally."],
      linkLabel: "Adobe More",
      linkSrc: "adobe.com",
      storyImg: "./assets/host.jpg",
    },
  ];
}



let activeStory = 0;
const storyDuration = 8000;
const contentUpdateDelay = 0.4;
let direction = "next";
let storyTimeout;

let cursor;
let cursorText;

function resetIndexHighlight(index, currentDirection) {
  const highlight = document.querySelectorAll(".index .index-highlight")[index];
  gsap.killTweensOf(highlight);
  gsap.to(highlight, {
    width: currentDirection === "next" ? "100%" : "0%",
    duration: 0.3,
    onStart: () => {
      gsap.to(highlight, {
        transformOrigin: "right center",
        scaleX: 0,
                    duration: 0.3,
      });
    },
  });
}

function animateIndexHighlight(index) {
  const highlight = document.querySelectorAll(".index .index-highlight")[index];
  gsap.set(highlight, {
    width: "0%",
    scaleX: 1,
    transformOrigin: "right center",
  });
  gsap.to(highlight, {
    width: "100%",
    duration: storyDuration / 1000,
    ease: "none",
  });
}

function animateNewImage(imgContainer, currentDirection) {
  gsap.set(imgContainer, {
    clipPath:
      currentDirection === "next"
        ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"
        : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
  });
  gsap.to(imgContainer, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    duration: 1,
    ease: "power4.inOut",
  });
}

function animateImageScale(currentImg, upcomingImg, currentDirection) {
  gsap.fromTo(
    currentImg,
    { scale: 1, rotate: 0 },
    {
      scale: 1.3,
      rotate: currentDirection === "next" ? -4 : 4,
      duration: 1,
      ease: "power4.inOut",
      onComplete: () => {
        currentImg.parentElement.remove();
      },
    }
  );
  gsap.fromTo(
    upcomingImg,
    { scale: 1.3, rotate: currentDirection === "next" ? 4 : -4 },
    { scale: 1, rotate: 0, duration: 1, ease: "power4.inOut" }
  );
}

function cleanUpElements() {
  const servicesContainer = document.querySelector('.ad-services-block-body');
  if (!servicesContainer) return;
  
  const profileNameDiv = servicesContainer.querySelector(".profile-name");
  const titleContainer = servicesContainer.querySelector(".title");
  const storyImgDiv = servicesContainer.querySelector(".ad-services-block-story-img");

  // Remove all profile name paragraphs except the first one
  const profileParagraphs = profileNameDiv.querySelectorAll("p");
  for (let i = 1; i < profileParagraphs.length; i++) {
    profileParagraphs[i].remove();
  }

  // Remove all title rows completely
  const titleRows = servicesContainer.querySelectorAll(".title-row");
  titleRows.forEach(row => row.remove());

  // Smart cleanup: Keep only images needed for current and adjacent slides
  const imgContainers = storyImgDiv.querySelectorAll(".img");
  
  // Only remove images if we have more than 3 (current + previous + next for smooth transitions)
  if (imgContainers.length > 3) {
    // Remove the oldest images, keeping only the 3 most recent
    for (let i = 3; i < imgContainers.length; i++) {
      imgContainers[i].remove();
    }
  }
}

function changeStory(isAutomatic = true) {
  const previousStory = activeStory;
  const currentDirection = isAutomatic ? "next" : direction;

  if (currentDirection === "next") {
    activeStory = (activeStory + 1) % stories.length;
  } else {
    activeStory = (activeStory - 1 + stories.length) % stories.length;
  }



  document.getElementById(`overview-${previousStory}`).classList.remove("active");
  document.getElementById(`overview-${activeStory}`).classList.add("active");

  const story = stories[activeStory];

  // Get services container
  const servicesContainer = document.querySelector('.ad-services-block-body');
  if (!servicesContainer) return;

  // Get current image BEFORE cleanup
  const currentImgContainer = servicesContainer.querySelector(".ad-services-block-story-img .img");
  const currentImg = currentImgContainer ? currentImgContainer.querySelector("img") : null;

  // Clean up elements (but preserve current image for transition)
  cleanUpElements();

  // Fade out existing profile text
  const existingProfileText = servicesContainer.querySelector(".profile-name p");
  if (existingProfileText) {
    gsap.to(existingProfileText, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        // Change the text content
        existingProfileText.innerText = story.profileName;
        // Fade back in
        gsap.to(existingProfileText, {
                opacity: 1,
          duration: 0.3,
        });
      }
    });
  }

  gsap.to(servicesContainer.querySelectorAll(".title-row h1"), {
    y: currentDirection === "next" ? -48 : 48,
    duration: 0.5,
    delay: contentUpdateDelay,
  });

  setTimeout(() => {
    const titleContainer = servicesContainer.querySelector(".title");
    
    // Create title rows dynamically based on the story data
    story.title.forEach((line, index) => {
      // Always create a new title row
      const titleRow = document.createElement("div");
      titleRow.classList.add("title-row");
      titleContainer.appendChild(titleRow);
      
      const newTitle = document.createElement("h1");
      newTitle.innerText = line;
      newTitle.style.transform =
        currentDirection === "next"
          ? "translateY(48px)"
          : "translateY(-48px)";
      titleRow.appendChild(newTitle);

      gsap.to(newTitle, {
        y: 0,
        duration: 0.5,
        delay: contentUpdateDelay,
      });
    });

    const newImgContainer = document.createElement("div");
    newImgContainer.classList.add("img");
    const newStoryImg = document.createElement("img");
    newStoryImg.src = story.storyImg;
    newStoryImg.alt = story.profileName;
    newImgContainer.appendChild(newStoryImg);

    const storyImgDiv = servicesContainer.querySelector(".ad-services-block-story-img");
    storyImgDiv.appendChild(newImgContainer);

    animateNewImage(newImgContainer, currentDirection);

    const upcomingImg = newStoryImg;
    // Only animate if we have a current image to transition from
    if (currentImg) {
      animateImageScale(currentImg, upcomingImg, currentDirection);
    }

    resetIndexHighlight(previousStory, currentDirection);
    animateIndexHighlight(activeStory);

    clearTimeout(storyTimeout);
    storyTimeout = setTimeout(() => changeStory(true), storyDuration);
  }, 200);

  setTimeout(() => {
    const profileImg = servicesContainer.querySelector(".profile-icon img");
    profileImg.src = story.profileImg;

    const link = servicesContainer.querySelector(".link a");
    link.textContent = story.linkLabel;
    link.href = story.linkSrc;
  }, 600);
}

document.addEventListener("mousemove", (event) => {
  const container = document.querySelector(".ad-services-block-container");
  if (!container || !cursor) return;

  const rect = container.getBoundingClientRect();
  
  // Check if mouse is inside the container
  const isInside = event.clientX >= rect.left && 
                   event.clientX <= rect.right && 
                   event.clientY >= rect.top && 
                   event.clientY <= rect.bottom;

  if (!isInside) {
    // Hide cursor when outside the section
    gsap.to(cursor, {
      opacity: 0,
      duration: 0.2,
    });
    return;
  }

  // Check if mouse is over a service overview item
  const target = event.target;
  const isOverServiceItem = target.closest('.overview__item');
  
  if (isOverServiceItem) {
    // Hide cursor when hovering over service items
    gsap.to(cursor, {
      opacity: 0,
      duration: 0.2,
    });
    return;
  }

  // Show cursor when inside the section and not over service items
  gsap.to(cursor, {
    opacity: 1,
    duration: 0.2,
  });

  // Calculate mouse position relative to the container
  let x = event.clientX - rect.left - cursor.offsetWidth / 2;
  let y = event.clientY - rect.top - cursor.offsetHeight / 2;

  // Clamp the cursor position within the container
  x = Math.max(0, Math.min(x, rect.width - cursor.offsetWidth));
  y = Math.max(0, Math.min(y, rect.height - cursor.offsetHeight));

  gsap.to(cursor, {
    x: x,
    y: y,
    ease: "power2.out",
    duration: 0.3,
  });

  const viewportWidth = rect.width;
  if (event.clientX - rect.left < viewportWidth / 2) {
    cursorText.textContent = "Prev";
    direction = "prev";
  } else {
    cursorText.textContent = "Next";
    direction = "next";
  }
});

document.addEventListener("click", (event) => {
  // Check if the click is inside the services section
  const container = document.querySelector(".ad-services-block-container");
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const isInside = event.clientX >= rect.left && 
                   event.clientX <= rect.right && 
                   event.clientY >= rect.top && 
                   event.clientY <= rect.bottom;

  // Only change story if clicking inside the section
  if (isInside) {
    clearTimeout(storyTimeout);
    resetIndexHighlight(activeStory, direction);
    changeStory(false);
  }
});

// Initialize the first story
function initializeFirstStory() {
  const story = stories[0];
  const servicesContainer = document.querySelector('.ad-services-block-body');
  if (!servicesContainer) return;
  
  // Set initial profile name
  const profileNameDiv = servicesContainer.querySelector(".profile-name");
  const initialProfileName = profileNameDiv.querySelector("p");
  if (initialProfileName) {
    initialProfileName.innerText = story.profileName;
  }
  
  // Set initial title rows
  const titleContainer = servicesContainer.querySelector(".title");
  const existingTitleRows = servicesContainer.querySelectorAll(".title-row");
  
  // Remove existing title rows
  existingTitleRows.forEach(row => row.remove());
  
  // Create new title rows for the first story
  story.title.forEach((line, index) => {
    const titleRow = document.createElement("div");
    titleRow.classList.add("title-row");
    titleContainer.appendChild(titleRow);
    
    const newTitle = document.createElement("h1");
    newTitle.innerText = line;
    titleRow.appendChild(newTitle);
  });
  
  // Set initial profile image and link
  const profileImg = servicesContainer.querySelector(".profile-icon img");
  profileImg.src = story.profileImg;
  
  const link = servicesContainer.querySelector(".link a");
  link.textContent = story.linkLabel;
  link.href = story.linkSrc;
  
  // Set initial story image
  const storyImg = servicesContainer.querySelector(".ad-services-block-story-img .img img");
  storyImg.src = story.storyImg;
  storyImg.alt = story.profileName;
}

// Initialize index indicators dynamically
function initializeIndexIndicators() {
  const indicesContainer = document.querySelector(".ad-services-block-indices");
  
  // Remove existing index indicators
  const existingIndices = document.querySelectorAll(".index");
  existingIndices.forEach(index => index.remove());
  
  // Create new index indicators based on number of stories
  stories.forEach((story, index) => {
    const indexDiv = document.createElement("div");
    indexDiv.classList.add("index");
    
    const highlightDiv = document.createElement("div");
    highlightDiv.classList.add("index-highlight");
    
    indexDiv.appendChild(highlightDiv);
    indicesContainer.appendChild(indexDiv);
  });
}

// Create dynamic overview items
function createOverviewItems() {
  const overviewContainer = document.querySelector('.overview-placeholder');
  if (!overviewContainer || stories.length === 0) return;
  
  // Clear existing items
  overviewContainer.innerHTML = '';
  
  // Create overview items for each story
  stories.forEach((story, index) => {
    const overviewItem = document.createElement('p');
    overviewItem.setAttribute('index', index);
    overviewItem.id = `overview-${index}`;
    overviewItem.className = `overview__item ${index === 0 ? "active" : ""}`;
    overviewItem.textContent = story.profileName;
    
    // Add click event listener
    overviewItem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateToService(index);
    });
    
    overviewContainer.appendChild(overviewItem);
  });
}

// Create dynamic title content
function createTitleContent() {
  const titleContainer = document.querySelector('.title');
  if (!titleContainer || stories.length === 0) return;
  
  // Clear existing title rows
  const existingTitleRows = document.querySelectorAll('.title-row');
  existingTitleRows.forEach(row => row.remove());
  
  // Create title rows for the first story
  const firstStory = stories[0];
  firstStory.title.forEach((line, index) => {
    const titleRow = document.createElement('div');
    titleRow.classList.add('title-row');
    titleContainer.appendChild(titleRow);
    
    const titleHeading = document.createElement('h1');
    titleHeading.classList.add('title-heading');
    titleHeading.textContent = line;
    titleRow.appendChild(titleHeading);
  });
}

// Function to navigate to a specific service
function navigateToService(serviceIndex) {
  // Clear the current timeout
  clearTimeout(storyTimeout);
  
  // Reset the current story's index highlight
  resetIndexHighlight(activeStory, "next");
  
  // Update active story
  const previousStory = activeStory;
  activeStory = serviceIndex;
  
  // Update overview items
  document.getElementById(`overview-${previousStory}`).classList.remove("active");
  document.getElementById(`overview-${activeStory}`).classList.add("active");
  
  // Get the target story
  const story = stories[activeStory];
  const servicesContainer = document.querySelector('.ad-services-block-body');
  if (!servicesContainer) return;
  
  // Get current image BEFORE cleanup
  const currentImgContainer = servicesContainer.querySelector(".ad-services-block-story-img .img");
  const currentImg = currentImgContainer ? currentImgContainer.querySelector("img") : null;
  
  // Clean up elements (but preserve current image for transition)
  cleanUpElements();
  
  // Animate title content out
  gsap.to(servicesContainer.querySelectorAll(".title-row h1"), {
    y: -48,
    duration: 0.5,
  });
  
  // Update profile text with animation
  const existingProfileText = servicesContainer.querySelector(".profile-name p");
  if (existingProfileText) {
    gsap.to(existingProfileText, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        existingProfileText.innerText = story.profileName;
        gsap.to(existingProfileText, {
          opacity: 1,
          duration: 0.3,
        });
      }
    });
  }
  
  // Create new title content with animation
  setTimeout(() => {
    const titleContainer = servicesContainer.querySelector(".title");
    
    // Remove old title rows
    const existingTitleRows = servicesContainer.querySelectorAll(".title-row");
    existingTitleRows.forEach(row => row.remove());
    
    // Create new title rows
    story.title.forEach((line, index) => {
      const titleRow = document.createElement("div");
      titleRow.classList.add("title-row");
      titleContainer.appendChild(titleRow);
      
      const newTitle = document.createElement("h1");
      newTitle.innerText = line;
      newTitle.style.transform = "translateY(48px)";
      titleRow.appendChild(newTitle);
      
      // Animate title in
      gsap.to(newTitle, {
        y: 0,
        duration: 0.5,
        delay: 0.1 * index,
      });
    });
  }, 200);
  
  // Create and animate new story image
  setTimeout(() => {
    const newImgContainer = document.createElement("div");
    newImgContainer.classList.add("img");
    const newStoryImg = document.createElement("img");
    newStoryImg.src = story.storyImg;
    newStoryImg.alt = story.profileName;
    newImgContainer.appendChild(newStoryImg);
    
    const storyImgDiv = servicesContainer.querySelector(".ad-services-block-story-img");
    storyImgDiv.appendChild(newImgContainer);
    
    // Animate the new image
    animateNewImage(newImgContainer, "next");
    
    // Animate image scale if we have a current image
    if (currentImg) {
      const upcomingImg = newStoryImg;
      animateImageScale(currentImg, upcomingImg, "next");
    }
  }, 200);
  
  // Update profile image and link with delay
  setTimeout(() => {
    const profileImg = servicesContainer.querySelector(".profile-icon img");
    profileImg.src = story.profileImg;
    
    const link = servicesContainer.querySelector(".link a");
    link.textContent = story.linkLabel;
    link.href = story.linkSrc;
  }, 600);
  
  // Animate the index highlight
  animateIndexHighlight(activeStory);
  
  // Restart the automatic progression
  storyTimeout = setTimeout(() => changeStory(true), storyDuration);
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize cursor elements
  cursor = document.querySelector(".ad-services-block-cursor");
  if (cursor) {
    cursorText = cursor.querySelector("p");
  }

  // Initialize stories data first
  initializeStories();

  // Find the block's main container
  const blockElement = document.querySelector('.ad-services-block-body');

  let sliderInitialized = false;

  function startSlider() {
    if (sliderInitialized) return;
    sliderInitialized = true;
    
    // Create all dynamic content
    createOverviewItems();
    initializeIndexIndicators();
    createTitleContent();
    initializeFirstStory();
    
    storyTimeout = setTimeout(() => changeStory(true), storyDuration);
    animateIndexHighlight(activeStory);
  }

  if (blockElement) {
    const observer = new window.IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startSlider();
            observer.disconnect(); // Only trigger once
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(blockElement);
  }
});


