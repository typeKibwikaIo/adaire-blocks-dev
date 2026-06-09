import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
	const megaMenuBlocks = document.querySelectorAll(".adaire-mega-menu");

	megaMenuBlocks.forEach((block) => {
		const navbar = block.querySelector(".adaire-mega-menu__navbar");
		const ribbon = block.querySelector(".adaire-mega-menu__ribbon");
		const canvas = block.querySelector(".adaire-mega-menu__canvas");
		const scrollBgColor = block.dataset.scrollBgColor || "#ffffff";
		const menuItemTopColor = block.dataset.menuItemColorTop;
		const menuItemScrollColor = block.dataset.menuItemsColorScroll;
		const menuItemUnderlineTopColor =
			block.dataset.menuItemsUnderlineColorTop || menuItemTopColor;
		const menuItemUnderlineScrollColor =
			block.dataset.menuItemsUnderlineColorScroll || menuItemScrollColor;
		const dropdownHeaders = block.querySelectorAll(
			".adaire-mega-menu__dropdown-header",
		);
		const keepCanvasOpen = block.dataset.keepCanvasOpen === "true";

		const setHeaderStyles = (color, underlineColor) => {
			dropdownHeaders.forEach((header) => {
				if (color) {
					header.style.setProperty("color", color);
				}
				if (underlineColor) {
					header.style.setProperty(
						"--item-underline-color",
						underlineColor,
					);
				}
			});
		};
		const menuImageAtTop = block.dataset.menuImageAtTop;
		const menuImageOnScroll = block.dataset.menuImageOnScroll;

		// Get menu image elements
		const menuImageTopEl = block.querySelector(".adaire-mega-menu__menu-image--top");
		const menuImageScrollEl = block.querySelector(".adaire-mega-menu__menu-image--scroll");

		if (!navbar) return;

		const supportsHover = window.matchMedia
			? window.matchMedia("(hover: hover)").matches
			: true;

		if (keepCanvasOpen && supportsHover) {
			block.classList.add("adaire-mega-menu--persistent");
			const dropdowns = block.querySelectorAll(".adaire-mega-menu__dropdown");

			const closePersistentState = () => {
				dropdowns.forEach((dropdown) => {
					dropdown.classList.remove(
						"adaire-mega-menu__dropdown--persistent-open",
					);
					const menu = dropdown.querySelector(".adaire-mega-menu__menu");
					if (menu) {
						menu.classList.remove("menu-show");
					}
				});
			};

			const openPersistentDropdown = (dropdown) => {
				if (!dropdown) return;
				dropdowns.forEach((item) => {
					if (item !== dropdown) {
						item.classList.remove("adaire-mega-menu__dropdown--persistent-open");
						const itemMenu = item.querySelector(".adaire-mega-menu__menu");
						if (itemMenu) {
							itemMenu.classList.remove("menu-show");
						}
					}
				});

				const menu = dropdown.querySelector(".adaire-mega-menu__menu");
				if (menu) {
					menu.classList.add("menu-show");
				}
				dropdown.classList.add("adaire-mega-menu__dropdown--persistent-open");
			};

			dropdowns.forEach((dropdown) => {
				const menu = dropdown.querySelector(".adaire-mega-menu__menu");
				if (!menu) {
					return;
				}
				const activate = () => openPersistentDropdown(dropdown);
				dropdown.addEventListener("mouseenter", activate);
				dropdown.addEventListener("focusin", activate);
			});

			const handleFocusOut = (event) => {
				if (!block.contains(event.relatedTarget)) {
					closePersistentState();
				}
			};

			const handleDocumentClick = (event) => {
				if (!block.contains(event.target)) {
					closePersistentState();
				}
			};

			const handleEscape = (event) => {
				if (event.key === "Escape") {
					closePersistentState();
				}
			};

			block.addEventListener("mouseleave", closePersistentState);
			block.addEventListener("focusout", handleFocusOut);
			document.addEventListener("click", handleDocumentClick);
			document.addEventListener("keyup", handleEscape);
		}

		// Optional: opacity-on-scroll only when enabled
		const enableOpacity = block.dataset.increaseOpacity === "true";

		const updateRibbonOffset = () => {
			if (ribbon && !ribbon.classList.contains("adaire-mega-menu__ribbon--hidden")) {
				const height = ribbon.offsetHeight;
				block.style.setProperty("--mega-menu-navbar-offset", `${height}px`);
			} else {
				block.style.setProperty("--mega-menu-navbar-offset", "0px");
			}
		};

		if (ribbon) {
			updateRibbonOffset();
			window.addEventListener("resize", updateRibbonOffset);

		}

		let lastScrollY = window.scrollY;
		let navbarHidden = false;
		const hideThreshold = 80;
		const colorThreshold = enableOpacity ? 20 : hideThreshold;

		const getVarValue = (variableName) => {
			const inlineValue = block.style.getPropertyValue(variableName);
			if (inlineValue && inlineValue.trim().length) {
				return inlineValue.trim();
			}
			return window
				.getComputedStyle(block)
				.getPropertyValue(variableName)
				.trim();
		};

		const buttonVarMap = [
			{
				target: "--cta-button-color-current",
				top: "--cta-button-color-top",
				scroll: "--cta-button-color-scroll",
			},
			{
				target: "--cta-button-bg-current",
				top: "--cta-button-bg-top",
				scroll: "--cta-button-bg-scroll",
			},
			{
				target: "--cta-button-border-color-current",
				top: "--cta-button-border-color-top",
				scroll: "--cta-button-border-color-scroll",
			},
			{
				target: "--cta-button-hover-color-current",
				top: "--cta-button-hover-color-top",
				scroll: "--cta-button-hover-color-scroll",
			},
			{
				target: "--cta-button-hover-bg-current",
				top: "--cta-button-hover-bg-top",
				scroll: "--cta-button-hover-bg-scroll",
			},
			{
				target: "--cta-button-hover-border-color-current",
				top: "--cta-button-hover-border-color-top",
				scroll: "--cta-button-hover-border-color-scroll",
			},
			{
				target: "--cta-button-font-weight-current",
				top: "--cta-button-font-weight-top",
				scroll: "--cta-button-font-weight-scroll",
			},
		];

		const buttonStates = {
			top: {},
			scroll: {},
		};

		const mobileIconState = {
			top:
				getVarValue("--mobile-menu-icon-color") ||
				getVarValue("--mega-menu-text-color") ||
				"#111111",
			scroll:
				getVarValue("--mobile-menu-icon-color-scroll") ||
				getVarValue("--mobile-menu-icon-color") ||
				getVarValue("--mega-menu-text-color") ||
				"#111111",
		};

		buttonVarMap.forEach(({ target, top, scroll }) => {
			const topValue = getVarValue(top);
			const scrollValue = getVarValue(scroll) || topValue;
			buttonStates.top[target] = topValue;
			buttonStates.scroll[target] = scrollValue;
		});

		const applyButtonState = (isScrolled) => {
			const state = isScrolled ? buttonStates.scroll : buttonStates.top;
			Object.entries(state).forEach(([variable, value]) => {
				if (value) {
					block.style.setProperty(variable, value);
				}
			});
			const mobileColor = isScrolled
				? mobileIconState.scroll
				: mobileIconState.top;
			if (mobileColor) {
				block.style.setProperty("--mobile-menu-icon-color-current", mobileColor);
			}
		};

		const handleNavbarVisibility = () => {
			const currentScroll = window.scrollY;
			if (currentScroll > lastScrollY && currentScroll > hideThreshold) {
				if (!navbarHidden) {
					navbar.classList.add("adaire-mega-menu__navbar--hidden");
					navbarHidden = true;
				}
			} else {
				if (navbarHidden) {
					navbar.classList.remove("adaire-mega-menu__navbar--hidden");
					navbarHidden = false;
				}
			}

			const isScrolled = currentScroll > colorThreshold;
			if (isScrolled) {
				block.classList.add("adaire-mega-menu--scrolled");
			} else {
				block.classList.remove("adaire-mega-menu--scrolled");
			}
			applyButtonState(isScrolled);

			lastScrollY = currentScroll;
		};

		window.addEventListener("scroll", handleNavbarVisibility);
		handleNavbarVisibility();

		if (enableOpacity) {
			const style = document.createElement("style");
			const style2 = document.createElement("style");

			style.textContent = `
				.adaire-mega-menu__menu.menu{
					background: ${scrollBgColor}
				}

			.adaire-mega-menu__dropdown-header{
					color: ${menuItemTopColor} !important;
					--item-underline-color: ${menuItemUnderlineTopColor};
				}
		   `;

			style2.textContent = `
				.adaire-mega-menu__menu.menu{
					background: ${scrollBgColor}
				}
				.adaire-mega-menu__dropdown-header{
						color: ${menuItemScrollColor} !important;
						--item-underline-color: ${menuItemUnderlineScrollColor};
				}
			`;

			document.head.appendChild(style);
			setHeaderStyles(menuItemTopColor, menuItemUnderlineTopColor);
			// Set initial transparent background
			navbar.style.background = "rgba(255, 255, 255, 0)";
			navbar.style.boxShadow = "none ";

			// Set initial menu image visibility (only if both images exist)
			if (menuImageTopEl && menuImageScrollEl) {
				menuImageTopEl.style.display = "block";
				menuImageTopEl.style.opacity = "1";
				menuImageScrollEl.style.display = "none";
				menuImageScrollEl.style.opacity = "0";
			} else if (menuImageTopEl) {
				// Only top image exists
				menuImageTopEl.style.display = "block";
				menuImageTopEl.style.opacity = "1";
			} else if (menuImageScrollEl) {
				// Only scroll image exists
				menuImageScrollEl.style.display = "block";
				menuImageScrollEl.style.opacity = "1";
			}

			let scrolled = false;
			window.addEventListener("scroll", () => {
				if (window.scrollY > 20) {
					if (!scrolled) {
						navbar.style.background = scrollBgColor;
						navbar.style.boxShadow = " 0 2px 10px rgba(0, 0, 0, 0.1)";
						scrolled = true;
						// Check if style exists and is a child before removing
						if (style.parentNode === document.head) {
							document.head.removeChild(style);
						}
						// Check if style2 is not already appended before adding
						if (style2.parentNode !== document.head) {
							document.head.appendChild(style2);
						}
						setHeaderStyles(
							menuItemScrollColor,
							menuItemUnderlineScrollColor,
						);

						// Switch menu images (only if both exist)
						if (menuImageTopEl && menuImageScrollEl) {
							menuImageTopEl.style.opacity = "0";
							menuImageScrollEl.style.display = "block";
							menuImageScrollEl.style.opacity = "0";
							// Use requestAnimationFrame for smooth transition
							requestAnimationFrame(() => {
								menuImageTopEl.style.display = "none";
								menuImageScrollEl.style.opacity = "1";
							});
						}
					}
				} else if (window.scrollY < 5) {
					if (scrolled) {
						navbar.style.background = "rgba(255, 255, 255, 0)";
						navbar.style.boxShadow = "none ";
						// Check if style2 exists and is a child before removing
						if (style2.parentNode === document.head) {
							document.head.removeChild(style2);
						}
						// Check if style is not already appended before adding
						if (style.parentNode !== document.head) {
							document.head.appendChild(style);
						}
						setHeaderStyles(
							menuItemTopColor,
							menuItemUnderlineTopColor,
						);

						// Switch menu images back (only if both exist)
						if (menuImageTopEl && menuImageScrollEl) {
							menuImageScrollEl.style.opacity = "0";
							menuImageTopEl.style.display = "block";
							menuImageTopEl.style.opacity = "0";
							// Use requestAnimationFrame for smooth transition
							requestAnimationFrame(() => {
								menuImageScrollEl.style.display = "none";
								menuImageTopEl.style.opacity = "1";
							});
						}

						scrolled = false;
					}
				}
			});
		} else {
			// increaseOpacity is disabled, but still handle menu images if they exist
			if (menuImageTopEl && menuImageScrollEl) {
				// Both images exist, show top one by default
				menuImageTopEl.style.display = "block";
				menuImageTopEl.style.opacity = "1";
				menuImageScrollEl.style.display = "none";
				menuImageScrollEl.style.opacity = "0";
			} else if (menuImageTopEl) {
				// Only top image exists
				menuImageTopEl.style.display = "block";
				menuImageTopEl.style.opacity = "1";
			} else if (menuImageScrollEl) {
				// Only scroll image exists
				menuImageScrollEl.style.display = "block";
				menuImageScrollEl.style.opacity = "1";
			}
		}

		// Mobile/Tablet overlay menu logic
		const menuButton = block.querySelector(".adaire-mega-menu__menu-btn");
		const overlay = block.querySelector(".adaire-mega-menu__mobile-overlay");
		const overlayContainer = block.querySelector(
			".adaire-mega-menu__mobile-container",
		);
		const overlayContent = block.querySelector(
			".adaire-mega-menu__mobile-content",
		);
		const desktopMenu = block.querySelector(".adaire-mega-menu__mega-menu");

		if (
			menuButton &&
			overlay &&
			overlayContainer &&
			overlayContent &&
			desktopMenu
		) {
			// Extract menu structure from desktop DOM
			const parseMenu = () => {
				const level1Items = Array.from(desktopMenu.children);
				return level1Items.map((li) => {
					const header = li.querySelector(".adaire-mega-menu__dropdown-header");
					const titleSpan = header?.querySelector("span");
					const title =
						titleSpan?.textContent?.trim() || header?.textContent?.trim() || "";
					const rawUrl = header?.getAttribute("href") || "#";
					const url = rawUrl.startsWith("http")
						? rawUrl
						: rawUrl.startsWith("/")
						? window.location.origin + rawUrl
						: rawUrl;
					const isBold =
						header?.querySelector(".adaire-mega-menu__bold") != null;
					const openInNewTab = header?.getAttribute("target") === "_blank";
					// level 2 - support both legacy (direct li) and current (.adaire-mega-menu__menu__list) markup
					const level2Container =
						li.querySelector(".adaire-mega-menu__menu__list") ||
						li.querySelector(".adaire-mega-menu__menu");
					const level2 = level2Container
						? Array.from(
								level2Container.querySelectorAll(
									":scope > li.adaire-mega-menu__sub-dropdown",
								),
						  )
						: [];
					const children = level2.map((subLi) => {
						const subHeader = subLi.querySelector(
							".adaire-mega-menu__sub-dropdown-header",
						);
						const subTitleSpan = subHeader?.querySelector("span");
						const subTitle =
							subTitleSpan?.textContent?.trim() ||
							subHeader?.textContent?.trim() ||
							"";
						const subRawUrl = subHeader?.getAttribute("href") || "#";
						const subUrl = subRawUrl.startsWith("http")
							? subRawUrl
							: subRawUrl.startsWith("/")
							? window.location.origin + subRawUrl
							: subRawUrl;
						const subBold =
							subHeader?.querySelector(".adaire-mega-menu__bold") != null;
						const subOpenInNewTab =
							subHeader?.getAttribute("target") === "_blank";
						const level3Container = subLi.querySelector(
							".adaire-mega-menu__sub-menu",
						);
						const level3Lis = level3Container
							? Array.from(level3Container.children)
							: [];
						const grandChildren = level3Lis.map((gc) => {
							const a = gc.querySelector("a");
							const rawUrl = a?.getAttribute("href") || "#";
							const url = rawUrl.startsWith("http")
								? rawUrl
								: rawUrl.startsWith("/")
								? window.location.origin + rawUrl
								: rawUrl;
							const openInNewTab = a?.getAttribute("target") === "_blank";
							return {
								title: a?.textContent?.trim() || "",
								url: url,
								isBold:
									a?.classList?.contains("adaire-mega-menu__bold") || false,
								openInNewTab: openInNewTab,
								children: [],
							};
						});
						return {
							title: subTitle,
							url: subUrl,
							isBold: subBold,
							openInNewTab: subOpenInNewTab,
							children: grandChildren,
						};
					});
					return { title, url, isBold, openInNewTab, children };
				});
			};

			let stack = [];
			let currentItems = [];

			const renderTier = (items, level, titleText = "", parentUrl = null, parentOpenInNewTab = false) => {
				const tier = document.createElement("div");
				tier.className =
					"adaire-mobile-menu__tier adaire-mobile-menu__tier--active";
				
				// Check if immersive mode is enabled
				const isImmersive = overlayContainer.classList.contains("immersive-mode");
				
				const headerEl = document.createElement("div");
				headerEl.className = "adaire-mobile-menu__header";
				const leftControls = document.createElement("div");
				const rightControls = document.createElement("div");
				const titleEl = document.createElement("h3");
				// Make title clickable if it has a URL
				if (parentUrl && parentUrl !== "#") {
					titleEl.classList.add("adaire-mobile-menu__title-clickable");
					titleEl.addEventListener("click", () => {
						if (parentOpenInNewTab) {
							window.open(parentUrl, "_blank", "noopener,noreferrer");
						} else {
							window.location.href = parentUrl;
						}
						closeOverlaySmoothly();
					});
				}
				titleEl.textContent = titleText || "Menu";
				const closeBtn = document.createElement("button");
				closeBtn.className = "adaire-mobile-menu__close-btn";
				closeBtn.setAttribute("aria-label", "Close");
				closeBtn.innerHTML = "&times;";
				closeBtn.addEventListener("click", closeOverlay);
				if (level > 1) {
					const backBtn = document.createElement("button");
					backBtn.className = "adaire-mobile-menu__back-btn";
					backBtn.setAttribute("aria-label", "Back");
					backBtn.innerHTML = "â†";
					backBtn.addEventListener("click", goBack);
					leftControls.appendChild(backBtn);
				}
				rightControls.appendChild(closeBtn);
				headerEl.appendChild(leftControls);
				headerEl.appendChild(titleEl);
				headerEl.appendChild(rightControls);

				// Create button row for immersive mode
				let buttonRow = null;
				if (isImmersive) {
					buttonRow = document.createElement("div");
					buttonRow.className = "adaire-mobile-menu__button-row";
					
					// Left side - back button (if not root level)
					const leftSide = document.createElement("div");
					leftSide.className = "adaire-mobile-menu__button-row-left";
					if (level > 1) {
						const backBtnClone = document.createElement("button");
						backBtnClone.className = "adaire-mobile-menu__back-btn";
						backBtnClone.setAttribute("aria-label", "Back");
						backBtnClone.innerHTML = "â†";
						backBtnClone.addEventListener("click", goBack);
						leftSide.appendChild(backBtnClone);
					}
					buttonRow.appendChild(leftSide);
					
					// Right side - close button (always shown)
					const rightSide = document.createElement("div");
					rightSide.className = "adaire-mobile-menu__button-row-right";
					const closeBtnClone = document.createElement("button");
					closeBtnClone.className = "adaire-mobile-menu__close-btn";
					closeBtnClone.setAttribute("aria-label", "Close");
					closeBtnClone.innerHTML = "&times;";
					closeBtnClone.addEventListener("click", closeOverlay);
					rightSide.appendChild(closeBtnClone);
					buttonRow.appendChild(rightSide);
				}

				const list = document.createElement("div");
				list.className = "adaire-mobile-menu__items";
				
				// Add title as first item in immersive mode
				if (isImmersive && titleText) {
					const titleRow = document.createElement("div");
					let titleClass = "adaire-mobile-menu__item adaire-mobile-menu__item--title";
					// Make title row clickable if it has a URL
					if (parentUrl && parentUrl !== "#") {
						titleClass += " adaire-mobile-menu__item--clickable";
						titleRow.addEventListener("click", () => {
							if (parentOpenInNewTab) {
								window.open(parentUrl, "_blank", "noopener,noreferrer");
							} else {
								window.location.href = parentUrl;
							}
							closeOverlaySmoothly();
						});
					}
					titleRow.className = titleClass;
					const titleContent = document.createElement("div");
					titleContent.className = "adaire-mobile-menu__item-content";
					const titleLink = document.createElement("span");
					titleLink.className = "adaire-mobile-menu__item-title level-1";
					titleLink.textContent = titleText;
					titleContent.appendChild(titleLink);
					titleRow.appendChild(titleContent);
					list.appendChild(titleRow);
				}
				items.forEach((itm) => {
					const row = document.createElement("div");
					row.className =
						"adaire-mobile-menu__item" +
						(itm.children && itm.children.length ? " has-children" : "");
					const content = document.createElement("div");
					content.className = "adaire-mobile-menu__item-content";
					const a = document.createElement("a");
					a.href = itm.url || "#";
					a.className =
						"adaire-mobile-menu__item-title level-" +
						level +
						(itm.isBold ? " bold" : "");
					a.textContent = itm.title;
					if (itm.openInNewTab) {
						a.target = "_blank";
						a.rel = "noopener noreferrer";
					}
					content.appendChild(a);

					// Add chevron for items with children
					if (itm.children && itm.children.length) {
						const chevron = document.createElement("span");
						chevron.className = "adaire-mobile-menu__chevron";
						chevron.textContent = "â€º";
						content.appendChild(chevron);
					}

					// Make entire row clickable
					row.addEventListener("click", (e) => {
						if (itm.children && itm.children.length) {
							e.preventDefault();
							navigateForward(itm.title, itm.children, level + 1, itm.url, itm.openInNewTab);
						} else if (itm.url && itm.url !== "#") {
							if (itm.openInNewTab) {
								window.open(itm.url, "_blank", "noopener,noreferrer");
							} else {
								window.location.href = itm.url;
							}
							closeOverlaySmoothly();
						}
					});

					row.appendChild(content);
					list.appendChild(row);
				});

				// Only append header if not in immersive mode
				if (!isImmersive) {
					tier.appendChild(headerEl);
				}
				if (buttonRow) {
					tier.appendChild(buttonRow);
				}
				tier.appendChild(list);
				return tier;
			};

			const openOverlay = () => {
				// build root
				currentItems = parseMenu();
				stack = [{ title: "Menu", items: currentItems, level: 1, parentUrl: null, parentOpenInNewTab: false }];
				overlayContent.innerHTML = "";
				const tier = renderTier(currentItems, 1, "Menu");
				overlayContent.appendChild(tier);
				overlay.classList.add("mobile-overlay-show");
			};

			const closeOverlay = () => {
				overlay.classList.remove("mobile-overlay-show");
				// clear after animation
				setTimeout(() => (overlayContent.innerHTML = ""), 300);
			};

			const closeOverlaySmoothly = () => {
				overlay.classList.add("mobile-overlay-closing");
				overlay.classList.remove("mobile-overlay-show");
				// clear after animation
				setTimeout(() => {
					overlayContent.innerHTML = "";
					overlay.classList.remove("mobile-overlay-closing");
				}, 400);
			};

			const navigateForward = (title, items, level, parentUrl = null, parentOpenInNewTab = false) => {
				const currentTier = overlayContent.lastElementChild;
				if (currentTier) {
					currentTier.classList.add(
						"adaire-mobile-menu__tier--exiting-forward",
					);
					setTimeout(() => {
						// Check if currentTier is still a child before removing
						if (currentTier && currentTier.parentNode === overlayContent) {
							overlayContent.removeChild(currentTier);
						}
					}, 600);
				}
				stack.push({ title, items, level, parentUrl, parentOpenInNewTab });
				const nextTier = renderTier(items, level, title, parentUrl, parentOpenInNewTab);
				nextTier.classList.add("adaire-mobile-menu__tier--entering-forward");
				overlayContent.appendChild(nextTier);
				setTimeout(() => {
					nextTier.classList.remove(
						"adaire-mobile-menu__tier--entering-forward",
					);
				}, 600);
			};

			const goBack = () => {
				if (stack.length <= 1) {
					// go back to root
					const currentTier = overlayContent.lastElementChild;
					if (currentTier)
						currentTier.classList.add(
							"adaire-mobile-menu__tier--exiting-backward",
						);
					setTimeout(() => {
						openOverlay();
					}, 600);
					return;
				}
				stack.pop();
				const prev = stack[stack.length - 1];
				const currentTier = overlayContent.lastElementChild;
				if (currentTier) {
					currentTier.classList.add(
						"adaire-mobile-menu__tier--exiting-backward",
					);
					setTimeout(() => {
						// Check if currentTier is still a child before removing
						if (currentTier && currentTier.parentNode === overlayContent) {
							overlayContent.removeChild(currentTier);
						}
					}, 600);
				}
				const prevTier = renderTier(prev.items, prev.level, prev.title, prev.parentUrl, prev.parentOpenInNewTab);
				prevTier.classList.add("adaire-mobile-menu__tier--entering-backward");
				overlayContent.appendChild(prevTier);
				setTimeout(() => {
					prevTier.classList.remove(
						"adaire-mobile-menu__tier--entering-backward",
					);
				}, 600);
			};

			menuButton.addEventListener("click", (e) => {
				e.preventDefault();
				openOverlay();
			});

			overlay.addEventListener("click", (e) => {
				if (e.target === overlay) {
					closeOverlay();
				}
			});
		}
	});
});



