import { useState, useEffect, useRef, useLayoutEffect } from "react";
import "./App.css";
import Img from "./assets/slideimg1.png";
import Img2 from "./assets/slideimg2.jpg";
import Img3 from "./assets/slideimg3.jpg";
import Img4 from "./assets/slideimg4.jpg";
import Img5 from "./assets/slideimg5.png";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const slides = [
  {
    slideTitle: "Digital Innovation",
    slideDescription:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit accusantium consequatur alias sequi tenetur ratione odio quis vitae ab id dolores quas quidem ipsam nesciunt, quam sed minus nihil molestiae?",
    slideUrl: "https://link.com",
    slideTags: ["Digital", "Innovation", "Technology", "Design"],
    slideImg: Img,
  },
  {
    slideTitle: "Startup Nights",
    slideDescription:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit accusantium consequatur alias sequi tenetur ratione odio quis vitae ab id dolores quas quidem ipsam nesciunt, quam sed minus nihil molestiae?",
    slideUrl: "https://link.com",
    slideTags: ["Client 1", "Editorial", "Fashion", "Visual Identity"],
    slideImg: Img2,
  },
  {
    slideTitle: "APST Research",
    slideDescription:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit accusantium consequatur alias sequi tenetur ratione odio quis vitae ab id dolores quas quidem ipsam nesciunt, quam sed minus nihil molestiae?",
    slideUrl: "https://link.com",
    slideTags: ["Monochrome", "Editorial", "Fashion", "Visual Identity"],
    slideImg: Img3,
  },
  {
    slideTitle: "Future Tree",
    slideDescription:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit accusantium consequatur alias sequi tenetur ratione odio quis vitae ab id dolores quas quidem ipsam nesciunt, quam sed minus nihil molestiae?",
    slideUrl: "https://link.com",
    slideTags: ["Monochrome", "Editorial", "Fashion", "Visual Identity"],
    slideImg: Img4,
  },
  {
    slideTitle: "Physio Und Sport",
    slideDescription:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit accusantium consequatur alias sequi tenetur ratione odio quis vitae ab id dolores quas quidem ipsam nesciunt, quam sed minus nihil molestiae?",
    slideUrl: "https://link.com",
    slideTags: ["Monochrome", "Editorial", "Fashion", "Visual Identity"],
    slideImg: Img5,
  },
];

function App() {
  const [count, setCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const slideRef = useRef(null);
  const modalRef = useRef(null);
  const eventListenersRef = useRef([]);
  const galleryRef = useRef(null);
  const agencySectionRef = useRef(null);

  const openModal = () => {
    setIsModalOpen(true);
    setIsModalClosing(false);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalClosing(true);
    
    // Clean up all event listeners immediately
    eventListenersRef.current.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    eventListenersRef.current = [];
    
    // Wait for animation to complete before hiding modal
    setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
      document.body.style.overflow = 'unset';
    }, 300); // Match the CSS transition duration
  };

  // Gallery animations
  useEffect(() => {
    if (!galleryRef.current) return;

    // Initial setup - hide gallery items
    gsap.set(".gallery-item", {
      y: 100,
      opacity: 0,
      scale: 0.8,
      rotation: 15,
      transformOrigin: "center center"
    });

    gsap.set(".gallery-overlay", {
      y: "100%",
      opacity: 0
    });

               gsap.set(".agency-description-text", {
        y: 30,
        opacity: 0
      });

    gsap.set(".view-portfolio-btn", {
      y: 30,
      opacity: 0,
      scale: 0.9
    });

    // Create timeline for agency section animations
    const agencyTl = gsap.timeline({
      scrollTrigger: {
        trigger: agencySectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });

                   agencyTl
        .to(".agency-description-text", {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out"
        })
      .to(".view-portfolio-btn", {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "back.out(1.7)"
      }, "-=0.6");

    // Gallery animations with creative effects
    const galleryItems = gsap.utils.toArray(".gallery-item");
    
    galleryItems.forEach((item, index) => {
      const overlay = item.querySelector(".gallery-overlay");
      const img = item.querySelector("img");
      
      // Set initial states
      gsap.set(img, {
        scale: 1.2,
        filter: "brightness(0.7) contrast(1.2)"
      });

      // Create individual timeline for each gallery item
      const itemTl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse"
        }
      });

      // Staggered entrance animation
      itemTl
        .to(item, {
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1.5,
          ease: "power4.out",
          delay: index * 0.2
        })
        .to(img, {
          scale: 1,
          filter: "brightness(1) contrast(1)",
          duration: 1.2,
          ease: "power2.out"
        }, "-=1.2")
        .to(overlay, {
          y: "0%",
          opacity: 1,
          duration: 0.8,
          ease: "power3.out"
        }, "-=0.8");

      // Hover animations
      item.addEventListener("mouseenter", () => {
        gsap.to(item, {
          scale: 1.05,
          rotation: 2,
          duration: 0.4,
          ease: "power2.out"
        });
        
        gsap.to(img, {
          scale: 1.1,
          filter: "brightness(1.1) contrast(1.1)",
          duration: 0.4,
          ease: "power2.out"
        });
        
        gsap.to(overlay, {
          y: "0%",
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      item.addEventListener("mouseleave", () => {
        gsap.to(item, {
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: "power2.out"
        });
        
        gsap.to(img, {
          scale: 1,
          filter: "brightness(1) contrast(1)",
          duration: 0.4,
          ease: "power2.out"
        });
        
        gsap.to(overlay, {
          y: "100%",
          opacity: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

    // Parallax effect for gallery container
    gsap.to(".agency-gallery", {
      yPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: ".agency-gallery",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

         

    // Magnetic effect for CTA button
    const ctaBtn = document.querySelector(".view-portfolio-btn");
    if (ctaBtn) {
      ctaBtn.addEventListener("mousemove", (e) => {
        const rect = ctaBtn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(ctaBtn, {
          x: x * 0.1,
          y: y * 0.1,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      ctaBtn.addEventListener("mouseleave", () => {
        gsap.to(ctaBtn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)"
        });
      });
    }

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    console.log("Starting animation with class selector");

    // Use a longer delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      const totalSlides = slides.length;
      let currentSlide = 1;

      let isAnimating = false;
      let scrollAllowed = true;
      let lastScrollTime = 0;

      function createSlide(slideIndex) {
        const slideData = slides[slideIndex - 1];

        const slide = document.createElement("div");
        slide.className = "slide";

        const slideImg = document.createElement("div");
        slideImg.className = "slide-img";
        const img = document.createElement("img");
        img.className = "slide-img-element";
        img.src = slideData.slideImg;
        img.alt = "";
        slideImg.appendChild(img);

        const slideOverlay = document.createElement("div");
        slideOverlay.className = "slide-overlay";

        const slideHeader = document.createElement("div");
        slideHeader.className = "slide-header";

        const slideTitle = document.createElement("div");
        slideTitle.className = "slide-title";
        const h1 = document.createElement("h1");
        h1.className = "slide-title-text";
        h1.textContent = slideData.slideTitle;
        slideTitle.appendChild(h1);

        const slideDescription = document.createElement("div");
        slideDescription.className = "slide-description";
        const p = document.createElement("p");
        p.className = "slide-description-text";
        p.textContent = slideData.slideDescription;
        slideDescription.appendChild(p);

        const slideLink = document.createElement("div");
        slideLink.className = "slide-link";
        const a = document.createElement("a");
        a.className = "slide-link-text";
        a.href = slideData.slideUrl;
        a.textContent = "View Project";
        slideLink.appendChild(a);

        slideHeader.appendChild(slideTitle);
        slideHeader.appendChild(slideDescription);
        slideHeader.appendChild(slideLink);

        const sliderInfo = document.createElement("div");
        sliderInfo.className = "slide-info";

        const slideTags = document.createElement("div");
        slideTags.className = "slide-tags";

        slideData.slideTags.forEach((tag) => {
          const tagP = document.createElement("p");
          tagP.className = "slide-tag-text";
          tagP.textContent = tag;
          slideTags.appendChild(tagP);
        });

        const slideIndexWrapper = document.createElement("div");
        slideIndexWrapper.className = "slide-info-wrapper";
        const slideIndexCopy = document.createElement("p");
        slideIndexCopy.className = "slide-index";
        slideIndexCopy.textContent = `${slideIndex
          .toString()
          .padStart(2, "0")}`;

        const slideIndexSeperator = document.createElement("p");
        slideIndexSeperator.textContent = "/";

        const slidesTotalCount = document.createElement("p");
        slidesTotalCount.className = "total-slides";
        slidesTotalCount.textContent = `${totalSlides
          .toString()
          .padStart(2, "0")}`;

        slideIndexWrapper.appendChild(slideIndexCopy);
        slideIndexWrapper.appendChild(slideIndexSeperator);
        slideIndexWrapper.appendChild(slidesTotalCount);

        sliderInfo.appendChild(slideTags);

        slide.appendChild(slideImg);
        slide.appendChild(slideOverlay);
        slide.appendChild(slideHeader);
        slide.appendChild(sliderInfo);

        return slide;
      }

      function splitText(slide) {
        const slideHeader = slide.querySelector(".slide-title h1");

        if (slideHeader) {
          SplitText.create(slideHeader, {
            type: "words",
            wordsClass: "word",
            mask: "worrds",
          });
        }

        const slideContent = slide.querySelectorAll("p, a");
        slideContent.forEach((element) => {
            SplitText.create(element, {
                type: "lines",
                linesClass: "line",
                mask: "lines",
                reduceWhiteSpace: false,
            });
        });
      }

      function animateSlide(direction){
        if(isAnimating || !scrollAllowed) return;

        isAnimating = true;
        scrollAllowed = false;

       const slider = document.querySelector(".slider");
       const currentSlideElement = slider.querySelector(".slide");

       if(direction === "down"){
        currentSlide = currentSlide === totalSlides ? 1 : currentSlide + 1;
       }else{
        currentSlide = currentSlide === 1 ? totalSlides : currentSlide - 1;
       }

       const exitY = direction === "down" ? "-200vh": "200vh";
       const entryY = direction === "down" ? "100vh": "-100vh";

       const entryClipPath = 
       direction === "down" ? 
       "polygon(20% 20%, 80% 20%, 80% 100%, 20% 100%)" :
        "polygon(20% 0%, 80% 0%, 80% 80%, 20% 80%)";

        gsap.to(currentSlideElement, {
            scale: 0.25,
            opacity: 0,
            rotation: 30,
            y: exitY,
            duration: 2,
            ease: "power4.inOut",
            force3D: true,
            onComplete: ()=>{
                currentSlideElement.remove();
            }
        })

        setTimeout(()=>{
            const newSlide = createSlide(currentSlide);

            gsap.set(newSlide, {
                y: entryY,
                clipPath: entryClipPath,
                force3D: true,
            })

            slider.appendChild(newSlide);

            splitText(newSlide);

            const words = newSlide.querySelectorAll(".word");
            const lines = newSlide.querySelectorAll(".line");

            gsap.set([...words,...lines], {
                y: "100%",
                force3D: true
            });

            gsap.to(newSlide, {
                y: 0,
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 1.5,
                ease: "power4.inOut",
                force3D: true,
                onStart: ()=>{
                    const tl = gsap.timeline();

                    const headerWords = newSlide.querySelectorAll(".slide-title .word");

                    tl.to(headerWords, {
                        y: "0%",
                        duration: 1,
                        ease: "power4.inOut",
                        stagger: 0.1,
                        force3D: true,
                    }, .75)

                    const tagsLines = newSlide.querySelectorAll(".slide-tags .line");

                    const indexLines = newSlide.querySelectorAll(".slide-index-wrapper .line");

                    const descriptionLines = newSlide.querySelectorAll(".slide-description .line");

                    tl.to(
                        tagsLines,
                        {
                            y: "0%",
                            duration: 1,
                            ease: "power4.inOut",
                            stagger: 0.1,
                        },
                        "-=0.75"
                    );

                    tl.to(
                        indexLines,
                        {
                            y: "0%",
                            duration: 1,
                            ease: "power4.inOut",
                            stagger: 0.1,
                        },
                        "<"
                    );
                    tl.to(
                        descriptionLines,
                        {
                            y: "0%",
                            duration: 1,
                            ease: "power4.inOut",
                            stagger: 0.1,
                        },
                        "<"
                    );

                    const linkLines = newSlide.querySelectorAll(".slide-link .line");

                    tl.to(
                        linkLines,
                        {
                            y: "0%",
                            duration: 1,
                            ease: "power4.inOut",
                            
                        },
                        "-=1"
                    );
                },
                onComplete: ()=>{
                    isAnimating = false;
                    setTimeout(()=>{
                        scrollAllowed = true;
                        lastScrollTime = Date.now();
                    }, 100);
                },
            });
            
        }, 750);
      }

      function handleScroll(direction){
        const now = Date.now();

        if(isAnimating || !scrollAllowed) return;
        if(now - lastScrollTime < 1000) return;

        lastScrollTime = now;

        animateSlide(direction);
    }

    // Create event handler functions
    const wheelHandler = (e) => {
        e.preventDefault();
        const direction = e.deltaY > 0 ? "down" : "up";
        handleScroll(direction);
    };

    let touchStartY = 0;
    let isTouchActive = false;

    const touchStartHandler = (e) => {
        touchStartY = e.touches[0].clientY;
        isTouchActive = true;
        console.log("Touch start detected at Y:", touchStartY);
    };

    const touchMoveHandler = (e) => {
        e.preventDefault();
        if(!isTouchActive || isAnimating || !scrollAllowed) return;

        const touchCurrentY = e.touches[0].clientY;
        const difference = touchCurrentY - touchStartY;

        if(Math.abs(difference) > 50){
            isTouchActive = false;
            const direction = difference > 0 ? "up" : "down";
            console.log("Touch scroll detected:", direction, "difference:", difference);
            handleScroll(direction);
        }
    };

    const touchEndHandler = () => {
        isTouchActive = false;
        console.log("Touch end detected");
    };

    const keydownHandler = (e) => {
        if (isAnimating || !scrollAllowed) return;
        
        const now = Date.now();
        if (now - lastScrollTime < 1000) return;
        
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            handleScroll("down");
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            handleScroll("up");
        }
    };

    const spacebarHandler = (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            const now = Date.now();
            if (now - lastScrollTime < 1000) return;
            handleScroll("down");
        }
    };

    const escapeHandler = (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    };

    // Add event listeners to the modal content instead of window
    const modalContent = document.querySelector('.modal-content');
    
    if (modalContent) {
        // Wheel event
        modalContent.addEventListener("wheel", wheelHandler, {passive: false});
        eventListenersRef.current.push({ element: modalContent, type: "wheel", handler: wheelHandler });

        // Touch events
        modalContent.addEventListener("touchstart", touchStartHandler, {passive: false});
        eventListenersRef.current.push({ element: modalContent, type: "touchstart", handler: touchStartHandler });

        modalContent.addEventListener("touchmove", touchMoveHandler, {passive: false});
        eventListenersRef.current.push({ element: modalContent, type: "touchmove", handler: touchMoveHandler });

        modalContent.addEventListener("touchend", touchEndHandler, {passive: false});
        eventListenersRef.current.push({ element: modalContent, type: "touchend", handler: touchEndHandler });

        // Keyboard events
        modalContent.addEventListener("keydown", keydownHandler);
        eventListenersRef.current.push({ element: modalContent, type: "keydown", handler: keydownHandler });

        modalContent.addEventListener("keydown", spacebarHandler);
        eventListenersRef.current.push({ element: modalContent, type: "keydown", handler: spacebarHandler });

        modalContent.addEventListener("keydown", escapeHandler);
        eventListenersRef.current.push({ element: modalContent, type: "keydown", handler: escapeHandler });
    }

    // Add global escape key listener (only when modal is open)
    document.addEventListener("keydown", escapeHandler);
    eventListenersRef.current.push({ element: document, type: "keydown", handler: escapeHandler });

    }, 200); // Longer delay

    return () => {
      clearTimeout(timer);
    };
  }, [isModalOpen]); // Run when modal opens

  return (
    <div className="animation-component">
      {/* Agency Section */}
      <section className="agency-section" ref={agencySectionRef}>
        <div className="agency-container">
          
          
          <div className="agency-content" ref={galleryRef}>
            <div className="agency-text">
              <div className="agency-description">
                <h2 className="agency-description-title">Our Work</h2>
                <p className="agency-description-text">
                  We've collaborated with innovative brands and startups to create 
                  compelling visual narratives that drive engagement and deliver results. 
                  Our portfolio showcases our expertise in branding, digital design, 
                  and creative storytelling.
                </p>
                
              </div>
              <div className="agency-cta">
            <button className="view-portfolio-btn" onClick={openModal}>
              View Full Portfolio
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
              
            </div>
            
            <div className="agency-gallery">
              <div className="gallery-grid">
                <div className="gallery-item">
                  <img className="gallery-img" src={Img} alt="Project 1" />
                  <div className="gallery-overlay">
                    <span className="gallery-overlay-text">Digital Innovation</span>
                  </div>
                </div>
                <div className="gallery-item">
                  <img className="gallery-img" src={Img2} alt="Project 2" />
                  <div className="gallery-overlay">
                    <span className="gallery-overlay-text">Startup Nights</span>
                  </div>
                </div>
                <div className="gallery-item">
                  <img className="gallery-img" src={Img3} alt="Project 3" />
                  <div className="gallery-overlay">
                    <span className="gallery-overlay-text">APST Research</span>
                  </div>
                </div>
                <div className="gallery-item">
                  <img className="gallery-img" src={Img4} alt="Project 4" />
                  <div className="gallery-overlay">
                    <span className="gallery-overlay-text">Future Tree</span>
                  </div>
                </div>
                <div className="gallery-item">
                  <img className="gallery-img" src={Img5} alt="Project 5" />
                  <div className="gallery-overlay">
                    <span className="gallery-overlay-text">Physio Und Sport</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
         
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className={`modal-overlay ${isModalClosing ? 'modal-closing' : ''}`} onClick={closeModal}>
          <div className={`modal-content ${isModalClosing ? 'modal-closing' : ''}`} onClick={(e) => e.stopPropagation()} tabIndex={0}>
            <button className="modal-close-btn" onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="slider" ref={slideRef}>
              <div className="slide">
                <div className="slide-img">
                  <img className="slide-img-element" src={Img} alt="" />
                </div>
                <div className="slide-overlay"></div>
                <div className="slide-header">
                  <div className="slide-title">
                    <h1 className="slide-title-text">{slides[0].slideTitle}</h1>
                  </div>
                  <div className="slide-description">
                    <p className="slide-description-text">
                      {slides[0].slideDescription}
                    </p>
                  </div>
                  <div className="slide-link">
                    <a className="slide-link-text" href={slides[0].slideUrl}>View Project</a>
                  </div>
                </div>
                <div className="slide-info">
                  <div className="slide-tags">
                    {slides[0].slideTags.map((tag, index) => (
                      <p className="slide-tag-text" key={index}>{tag}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
