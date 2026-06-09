import gsap from "gsap";

// Class to handle each video hero block instance independently
class VideoHeroBlock {
	constructor(blockElement) {
		this.blockElement = blockElement;
		this.videos = [];
		this.currentVideoIndex = 0;
		this.transitionDuration = 8000;
		this.autoPlay = true;
		this.showControls = true;
		this.videoTimeout = null;
		this.direction = "next";
		this.cursor = null;
		this.cursorText = null;

		this.init();
	}

	async init() {
		await this.initializeVideos();
		if (this.videos.length > 0) {
			this.setupEventListeners();
			this.startVideoSlider();
		}
	}

	async initializeVideos() {
		if (!this.blockElement) return;

    try {
      // Get data from WordPress block attributes passed via wp_add_inline_script
      if (window.videoHeroBlockData) {
				const blockId =
					this.blockElement.id || Object.keys(window.videoHeroBlockData)[0];
        const blockData = window.videoHeroBlockData[blockId];
        
        if (blockData) {
					this.videos = blockData.videos || [];
					this.transitionDuration = blockData.transitionDuration || 8000;
					this.autoPlay = blockData.autoPlay !== false;
					this.showControls = blockData.showControls !== false;
        } else {
					console.warn("No block data found for ID:", blockId);
					this.videos = [];
        }
      } else {
				console.warn("No videoHeroBlockData found for block");
				this.videos = [];
          }
        } catch (error) {
			console.error("Error parsing videos data for block:", error);
			this.videos = [];
		}

		if (this.videos.length === 0) {
			console.warn("No videos found for block");
    return;
  }
}

// Helper function to get video ID from URL
	getVideoId(url, type) {
		if (type === "youtube") {
			const match = url.match(
				/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
			);
			return match ? match[1] : "";
		} else if (type === "vimeo") {
    const match = url.match(/(?:vimeo\.com\/)([0-9]+)/);
			return match ? match[1] : "";
  }
		return "";
}

// Helper function to get embed URL
	getEmbedUrl(url, type, autoplay = true, muted = true) {
		const videoId = this.getVideoId(url, type);
		if (!videoId) return "";

		if (type === "youtube") {
    const params = new URLSearchParams({
				autoplay: autoplay ? "1" : "0",
				mute: muted ? "1" : "0",
				controls: this.showControls ? "1" : "0",
				loop: "1",
      playlist: videoId,
				rel: "0",
				modestbranding: "1",
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
		} else if (type === "vimeo") {
    const params = new URLSearchParams({
				autoplay: autoplay ? "1" : "0",
				muted: muted ? "1" : "0",
				controls: this.showControls ? "1" : "0",
				loop: "1",
				background: "1",
    });
    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  }
		return "";
	}

	resetVideoIndicator(index) {
		const indicators = this.blockElement.querySelectorAll(
			".ad-video-hero-block__video-indicator",
		);
  if (indicators[index]) {
			const progressFill = indicators[index].querySelector(
				".ad-video-hero-block__progress-fill",
			);
    gsap.killTweensOf(progressFill);
    gsap.set(progressFill, {
				width: "0%",
			});
			indicators[index].classList.remove("active");
		}
	}

	startProgressAnimation(index) {
		const indicators = this.blockElement.querySelectorAll(
			".ad-video-hero-block__video-indicator",
		);
  
  if (indicators[index]) {
			const progressFill = indicators[index].querySelector(
				".ad-video-hero-block__progress-fill",
			);

			indicators[index].classList.add("active");

			gsap.fromTo(
				progressFill,
				{ width: "0%" },
				{
					width: "100%",
					duration: this.transitionDuration / 1000,
					ease: "none",
				},
			);
		}
	}

	createTextContent(videoIndex) {
		if (!this.videos || !this.videos[videoIndex]) {
    return null;
  }
  
		const video = this.videos[videoIndex];
		const contentPlaceholder = this.blockElement.querySelector(
			".ad-video-hero-block__video-content-placeholder",
		);
  
  if (!contentPlaceholder) {
    return null;
  }
  
		const textContent = document.createElement("div");
		textContent.className = "ad-video-hero-block__video-content";
		textContent.setAttribute("data-video-index", videoIndex);
		textContent.style.zIndex = "3";

		const videoInfo = document.createElement("div");
		videoInfo.className = "ad-video-hero-block__video-info";

		const description = document.createElement("p");
		description.className = "ad-video-hero-block__video-description";
  description.textContent = video.description;
  
		const titleScroller = document.createElement("div");
		titleScroller.className = "ad-video-hero-block__video-title-scroller";
  
		const scrollingText = document.createElement("div");
		scrollingText.className = "scrolling-text ad-video-hero-block__video-title";
  scrollingText.textContent = video.title;
  
  titleScroller.appendChild(scrollingText);
  videoInfo.appendChild(description);
  videoInfo.appendChild(titleScroller);
  textContent.appendChild(videoInfo);
  
  contentPlaceholder.appendChild(textContent);
  
  return textContent;
}

	startTitleScrolling() {
		const titleScrollers = this.blockElement.querySelectorAll(
			".ad-video-hero-block__video-content.active .ad-video-hero-block__video-title-scroller .scrolling-text",
		);

		titleScrollers.forEach((scrollingText) => {
			scrollingText.dataset.scrollingStarted = "true";
    gsap.killTweensOf(scrollingText);
    
    let originalText;
    if (scrollingText.children.length > 0) {
      originalText = scrollingText.children[0].textContent;
    } else {
      originalText = scrollingText.textContent;
    }
    
			const copies = 4;
			let spacing = 300;
    
			if (this.blockElement) {
				const computedStyle = getComputedStyle(this.blockElement);
    
      if (window.innerWidth <= 480) {
					spacing =
						parseInt(
							computedStyle.getPropertyValue("--title-scrolling-gap-mobile"),
						) || 150;
      } else if (window.innerWidth <= 768) {
					spacing =
						parseInt(
							computedStyle.getPropertyValue("--title-scrolling-gap-tablet"),
						) || 200;
      } else {
					spacing =
						parseInt(computedStyle.getPropertyValue("--title-scrolling-gap")) ||
						300;
      }
    }
    
			scrollingText.innerHTML = "";
    for (let i = 0; i < copies; i++) {
				const span = document.createElement("span");
      span.textContent = originalText;
				span.style.display = "inline-block";
				span.style.marginRight = `${spacing}px`;
      scrollingText.appendChild(span);
    }
    
    scrollingText.offsetHeight;
    
    const firstSpan = scrollingText.children[0];
			const singleTextWidth = firstSpan.offsetWidth + spacing;
    const animationDistance = singleTextWidth;
    
			const baseSpeed = this.blockElement
				? parseInt(
						getComputedStyle(this.blockElement).getPropertyValue(
							"--title-scrolling-speed",
						),
				  ) || 100
				: 100;
			const duration = Math.max(animationDistance / baseSpeed, 2);

    gsap.set(scrollingText, { x: 0 });
    gsap.to(scrollingText, {
      x: -animationDistance,
      duration: duration,
      ease: "none",
      repeat: -1,
      onComplete: () => {
        gsap.set(scrollingText, { x: 0 });
				},
    });
  });
}

	stopTitleScrolling() {
		const scrollingTexts =
			this.blockElement.querySelectorAll(".scrolling-text");
		scrollingTexts.forEach((text) => {
    gsap.killTweensOf(text);
    delete text.dataset.scrollingStarted;
    gsap.set(text, { x: 0 });
  });
}

	animateVideoTransition(
		currentVideoSlide,
		newVideoSlide,
		currentDirection,
		currentVideo,
		previousVideoIndex,
	) {
		const isGoingNext = currentDirection === "next";
  const currentVideoExitY = isGoingNext ? "-100%" : "100%";
  const newVideoStartY = isGoingNext ? "100%" : "-100%";

  gsap.set(newVideoSlide, {
    y: newVideoStartY,
    opacity: 0,
			scale: 1,
  });

		newVideoSlide.classList.add("active");
  
  const tl = gsap.timeline({
    onComplete: () => {
				currentVideoSlide.classList.remove("active");
			},
  });

		tl.to(
			currentVideoSlide,
			{
    y: currentVideoExitY,
    opacity: 0,
    duration: 1.2,
				ease: "power3.inOut",
			},
			0,
		).to(
			newVideoSlide,
			{
    y: "0%",
    opacity: 1,
    duration: 1.2,
				ease: "power3.inOut",
			},
			0,
		);

		let currentTextContent = this.blockElement.querySelector(
			`.ad-video-hero-block__video-content[data-video-index="${previousVideoIndex}"]`,
		);
		let newTextContent = this.blockElement.querySelector(
			`.ad-video-hero-block__video-content[data-video-index="${this.currentVideoIndex}"]`,
		);

  if (!currentTextContent) {
			currentTextContent = this.createTextContent(previousVideoIndex);
    if (currentTextContent) {
      gsap.set(currentTextContent, {
        y: "0%",
					opacity: 1,
      });
    }
  }
  
  if (!newTextContent) {
			newTextContent = this.createTextContent(this.currentVideoIndex);
    if (newTextContent) {
      gsap.set(newTextContent, {
        y: newVideoStartY,
					opacity: 0,
      });
    }
  }
  
  if (currentTextContent && newTextContent) {
			tl.to(
				currentTextContent,
				{
      y: currentVideoExitY,
      opacity: 0,
      duration: 1.2,
					ease: "power3.inOut",
				},
				0,
			)
				.fromTo(
					newTextContent,
      { 
        y: newVideoStartY,
						opacity: 0,
      },
      { 
        y: "0%",
      opacity: 1,
        duration: 1.2,
						ease: "power3.inOut",
					},
					0,
				)
				.call(
					() => {
						currentTextContent.classList.remove("active");
						newTextContent.classList.add("active");

						this.stopTitleScrolling();
      setTimeout(() => {
							this.startTitleScrolling();
      }, 100);
      
      setTimeout(() => {
        if (currentTextContent && currentTextContent.parentNode) {
								const allTextElements = this.blockElement.querySelectorAll(
									".ad-video-hero-block__video-content",
								);
          if (allTextElements.length > 2) {
            currentTextContent.remove();
          }
        }
						}, 200);
					},
					null,
					0.6,
				);
		}
	}

	changeVideo(
		isAutomatic = true,
		targetIndex = null,
		directionOverride = null,
	) {
		if (this.videos.length === 0) return;

		const previousVideoIndex = this.currentVideoIndex;
  let currentDirection;
  
  if (targetIndex !== null) {
			this.currentVideoIndex = targetIndex;
    currentDirection = targetIndex > previousVideoIndex ? "next" : "prev";
  } else {
			currentDirection =
				directionOverride || (isAutomatic ? "next" : this.direction);
  if (currentDirection === "next") {
				this.currentVideoIndex =
					(this.currentVideoIndex + 1) % this.videos.length;
  } else {
				this.currentVideoIndex =
					(this.currentVideoIndex - 1 + this.videos.length) %
					this.videos.length;
			}
		}

		const currentVideo = this.videos[this.currentVideoIndex];
		const currentVideoSlide = this.blockElement.querySelector(
			`.ad-video-hero-block__video-slide[data-video-index="${previousVideoIndex}"]`,
		);
		const newVideoSlide = this.blockElement.querySelector(
			`.ad-video-hero-block__video-slide[data-video-index="${this.currentVideoIndex}"]`,
		);

  if (!currentVideoSlide || !newVideoSlide) {
    return;
  }

		this.resetVideoIndicator(previousVideoIndex);
		this.startProgressAnimation(this.currentVideoIndex);

		this.animateVideoTransition(
			currentVideoSlide,
			newVideoSlide,
			currentDirection,
			currentVideo,
			previousVideoIndex,
		);

		if (this.autoPlay) {
			clearTimeout(this.videoTimeout);
			this.videoTimeout = setTimeout(() => {
				this.changeVideo(true);
			}, this.transitionDuration);
		}
	}

	createVideoSlides() {
		const videoBackground = this.blockElement.querySelector(
			".ad-video-hero-block__video-background",
		);
		if (!videoBackground || this.videos.length === 0) return;

		videoBackground.innerHTML = "";

		this.videos.forEach((video, index) => {
			const embedUrl = this.getEmbedUrl(
      video.videoUrl,
      video.videoType,
      video.autoplay,
      video.muted,
    );
    
			const videoSlide = document.createElement("div");
			videoSlide.className = `ad-video-hero-block__video-slide ${
				index === 0 ? "active" : ""
			}`;
			videoSlide.setAttribute("data-video-index", index);
    
    if (video.useImage && video.imageUrl) {
				const imageBackground = document.createElement("div");
				imageBackground.className = "image-background";
      imageBackground.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url(${video.imageUrl});
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        z-index: 1;
      `;
      videoSlide.appendChild(imageBackground);
    } else if (embedUrl) {
				const iframe = document.createElement("iframe");
      iframe.src = embedUrl;
      iframe.title = video.title;
				iframe.frameBorder = "0";
				iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.allowFullScreen = true;
      iframe.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100vw;
        height: 56.25vw;
        min-height: 100vh;
        min-width: 177.77vh;
        transform: translate(-50%, -50%);
        z-index: 1;
        pointer-events: none;
      `;
      videoSlide.appendChild(iframe);
    } else {
				const placeholder = document.createElement("div");
				placeholder.className = "ad-video-hero-block__video-placeholder";
      placeholder.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #333, #666);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 24px;
      `;
				placeholder.textContent = `${
					video.videoType === "youtube" ? "ðŸ“º" : "ðŸŽ¬"
				} ${video.title}`;
      videoSlide.appendChild(placeholder);
    }
    
    videoBackground.appendChild(videoSlide);
  });
	}

	createVideoContent() {
		const contentPlaceholder = this.blockElement.querySelector(
			".ad-video-hero-block__video-content-placeholder",
		);
		if (!contentPlaceholder || this.videos.length === 0) return;

		contentPlaceholder.innerHTML = "";

		this.videos.forEach((video, index) => {
			const contentDiv = document.createElement("div");
			contentDiv.className = `ad-video-hero-block__video-content ${
				index === 0 ? "active" : ""
			}`;
			contentDiv.setAttribute("data-video-index", index);
			contentDiv.style.zIndex = "3";

			const videoInfo = document.createElement("div");
			videoInfo.className = "ad-video-hero-block__video-info";

			const description = document.createElement("p");
			description.className = "ad-video-hero-block__video-description";
    description.textContent = video.description;
    
			const titleScroller = document.createElement("div");
			titleScroller.className = "ad-video-hero-block__video-title-scroller";
    
			const scrollingText = document.createElement("div");
			scrollingText.className =
				"scrolling-text ad-video-hero-block__video-title";
    scrollingText.textContent = video.title;
    
    titleScroller.appendChild(scrollingText);
    videoInfo.appendChild(description);
    videoInfo.appendChild(titleScroller);
    contentDiv.appendChild(videoInfo);
    
    contentPlaceholder.appendChild(contentDiv);
  });
	}

	initializeVideoIndicators() {
		if (window.videoHeroBlockData) {
			const blockId =
				this.blockElement.id || Object.keys(window.videoHeroBlockData)[0];

			const indicatorsContainer = this.blockElement.querySelector(
				".ad-video-hero-block__video-indicators",
			);
			const progressIndicatorsContainer = this.blockElement.querySelector(
				".ad-video-hero-block__progress-indicators",
			);

			if (
				!indicatorsContainer ||
				!progressIndicatorsContainer ||
				this.videos.length <= 1
			)
				return;

			const existingIndicators = this.blockElement.querySelectorAll(
				".ad-video-hero-block__video-indicator",
			);
			existingIndicators.forEach((indicator) => indicator.remove());

			this.videos.forEach((video, index) => {
				const indicator = document.createElement("div");
				indicator.classList.add("ad-video-hero-block__video-indicator");
				indicator.style.setProperty(
					"width",
					`${100 / window.videoHeroBlockData[blockId].videos.length - 2}vw`,
					"important",
				);
    indicator.dataset.videoIndex = index;
    
				const progressFill = document.createElement("div");
				progressFill.classList.add("ad-video-hero-block__progress-fill");

				const chevronIcon = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"svg",
				);
				chevronIcon.classList.add("chevron-icon");
				chevronIcon.setAttribute("viewBox", "0 0 24 24");

				const path = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"path",
				);
				path.setAttribute(
					"d",
					"M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z",
				);
    
    chevronIcon.appendChild(path);
    
    indicator.appendChild(progressFill);
    indicator.appendChild(chevronIcon);
    
    if (index === 0) {
					indicator.classList.add("active");
    }
    
    progressIndicatorsContainer.appendChild(indicator);
  });
		}
	}

	initializeFirstVideo() {
		if (this.videos.length === 0) return;

		const firstVideoSlide = this.blockElement.querySelector(
			'.ad-video-hero-block__video-slide[data-video-index="0"]',
		);
		if (firstVideoSlide) {
			firstVideoSlide.classList.add("active");
			gsap.set(firstVideoSlide, { opacity: 1 });
		}

		const firstTextContent = this.blockElement.querySelector(
			'.ad-video-hero-block__video-content[data-video-index="0"]',
		);
		if (firstTextContent) {
			firstTextContent.classList.add("active");
		}

		setTimeout(() => {
			this.startTitleScrolling();
		}, 100);
	}

	startVideoSlider() {
		if (this.videos.length === 0) return;

		this.createVideoSlides();
		this.createVideoContent();
		this.initializeVideoIndicators();
		this.initializeFirstVideo();

		if (this.autoPlay) {
			this.videoTimeout = setTimeout(
				() => this.changeVideo(true),
				this.transitionDuration,
			);
		}

		this.startProgressAnimation(this.currentVideoIndex);
	}

	setupEventListeners() {
		// Mouse move for cursor
		this.blockElement.addEventListener("mousemove", (event) => {
			const container = this.blockElement.querySelector(
				".ad-video-hero-block__container",
			);
			if (!container || !this.cursor) return;

			const rect = container.getBoundingClientRect();
			const isInside =
				event.clientX >= rect.left &&
				event.clientX <= rect.right &&
				event.clientY >= rect.top &&
				event.clientY <= rect.bottom;

			if (!isInside) {
				gsap.to(this.cursor, {
					opacity: 0,
        duration: 0.2,
				});
				return;
			}

			const target = event.target;
			const isOverIndicator = target.closest(
				".ad-video-hero-block__video-indicator",
			);
			const isOverNavArrow = target.closest(".ad-video-hero-block__nav-arrow");

			if (isOverIndicator || isOverNavArrow) {
				gsap.to(this.cursor, {
					opacity: 0,
        duration: 0.2,
				});
				return;
			}

			gsap.to(this.cursor, {
				opacity: 1,
				duration: 0.2,
			});

			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			gsap.to(this.cursor, {
				left: x,
				top: y,
				ease: "power2.out",
				duration: 0.3,
			});

			const viewportWidth = rect.width;
			const newDirection =
				event.clientX - rect.left < viewportWidth / 2 ? "prev" : "next";
			const newText = newDirection === "prev" ? "<" : ">";

			if (
				newDirection !== this.direction ||
				this.cursorText.textContent !== newText
			) {
				this.direction = newDirection;

				gsap.to(this.cursorText, {
					opacity: 0,
					duration: 0.2,
					ease: "power1.out",
					onComplete: () => {
						this.cursorText.textContent = newText;
						gsap.to(this.cursorText, {
							opacity: 1,
							duration: 0.3,
							ease: "power1.out",
						});
					},
				});
			}
		});

		// Mouse leave for cursor
		this.blockElement.addEventListener("mouseleave", (event) => {
			if (!this.cursor) return;
			
			gsap.to(this.cursor, {
				opacity: 0,
				duration: 0.2,
			});
		});

		// Click events
		this.blockElement.addEventListener("click", (event) => {
			const container = this.blockElement.querySelector(
				".ad-video-hero-block__container",
			);
			if (!container) return;

			const rect = container.getBoundingClientRect();
			const isInside =
				event.clientX >= rect.left &&
				event.clientX <= rect.right &&
				event.clientY >= rect.top &&
				event.clientY <= rect.bottom;

			const target = event.target;
			const indicator = target.closest(".ad-video-hero-block__video-indicator");
			const navArrow = target.closest(".ad-video-hero-block__nav-arrow");

			if (indicator) {
				const videoIndex = parseInt(indicator.dataset.videoIndex);
				if (videoIndex !== this.currentVideoIndex) {
					clearTimeout(this.videoTimeout);
					this.changeVideo(false, videoIndex);
				}
				return;
			}

			if (navArrow) {
				const direction = navArrow.dataset.direction;
				clearTimeout(this.videoTimeout);
				this.changeVideo(false, null, direction);
				return;
			}

			if (isInside) {
				clearTimeout(this.videoTimeout);
				this.changeVideo(false);
        }
      });
    }
  }

// Initialize all video hero blocks on the page
document.addEventListener("DOMContentLoaded", function () {
	const videoHeroBlocks = document.querySelectorAll(".ad-video-hero-block");

	videoHeroBlocks.forEach((blockElement, index) => {
		// Initialize cursor elements for this specific block
		const cursor = blockElement.querySelector(
			".ad-video-hero-block__video-cursor",
		);
		const cursorText = cursor
			? cursor.querySelector(".ad-video-hero-block__cursor-text")
			: null;

		// Create new instance
		const videoHeroInstance = new VideoHeroBlock(blockElement);

		// Set cursor references for this instance
		videoHeroInstance.cursor = cursor;
		videoHeroInstance.cursorText = cursorText;
	});
});



