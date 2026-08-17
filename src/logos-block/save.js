import { useBlockProps } from "@wordpress/block-editor";
import Logo1 from "./base/logoipsum.png";
import Logo2 from "./base/logoipsum2.png";
import Logo3 from "./base/logoipsum3.png";
import Logo4 from "./base/logoipsum4.png";

// Minimum number of slides needed for Splide's continuous auto-scroll loop
// to feel seamless — below this, the belt is too short and visibly stutters.
// Only relevant in carousel mode; grid mode renders every logo once.
const MIN_SLIDES_FOR_SMOOTH_LOOP = 8;

export default function save({ attributes }) {
	const {
		partnerLogos = [],
		displayMode = "carousel",
		sliderSpeed = 0.5,
		slidesPerViewDesktop = 4,
		slidesPerViewTablet = 3,
		slidesPerViewMobile = 2,
		gap = "1rem",
		pauseOnHover = true,
		logoHeight = 60,
		backgroundColor = "#ffffff",
		titleText = "Our Partners",
		titleFontSize = 24,
		titleFontWeight = "600",
		titleColor = "#333333",
		titlePaddingTop = 20,
		anchor,
		blockId,
		titlePaddingBottom = 30,
		blockPaddingTop = 40,
		blockPaddingBottom = 40,
		containerMode = "full",
		containerMaxWidth = {
			desktop: { value: 1200, unit: "px" },
			tablet: { value: 100, unit: "%" },
			mobile: { value: 100, unit: "%" }
		}
	} = attributes;

	// Fallback to default logos if no custom logos are set
	const defaultLogos = [
		{ id: 1, image: Logo1, companyName: "logoIpsum" },
		{ id: 2, image: Logo2, companyName: "logoIpsum" },
		{ id: 3, image: Logo3, companyName: "logoIpsum" },
		{ id: 4, image: Logo4, companyName: "logoIpsum" },
	];

	const logosToDisplay = partnerLogos.length > 0 && partnerLogos.some(logo => logo.imageUrl)
		? partnerLogos.filter(logo => logo.imageUrl)
		: defaultLogos;

	// Repeat the logo set when there are too few to fill a smooth continuous
	// loop — otherwise the same one or two logos visibly stutter in place.
	// Grid mode is static, so it always renders each logo exactly once.
	const slidesToRender = displayMode === "grid"
		? logosToDisplay.map((logo, i) => ({ ...logo, _renderKey: logo.id ?? i }))
		: logosToDisplay.length > 0 && logosToDisplay.length < MIN_SLIDES_FOR_SMOOTH_LOOP
			? Array.from({ length: Math.ceil(MIN_SLIDES_FOR_SMOOTH_LOOP / logosToDisplay.length) }).flatMap((_, repeatIndex) =>
				logosToDisplay.map((logo, i) => ({ ...logo, _renderKey: `${logo.id ?? i}-${repeatIndex}` }))
			)
			: logosToDisplay.map((logo, i) => ({ ...logo, _renderKey: logo.id ?? i }));

	const renderLogo = (logo) => {
		const img = (
			<img
				className="logos-block__logo-img"
				src={logo.imageUrl || logo.image}
				alt={logo.companyName}
				style={{
					maxHeight: `${logoHeight}px`,
					maxWidth: "200px",
					objectFit: "contain",
				}}
			/>
		);
		return logo.link ? (
			<a className="logos-block__logo-link" href={logo.link} target="_blank" rel="noreferrer">
				{img}
			</a>
		) : img;
	};

	const blockProps = useBlockProps.save({
		className: `logos-block logos-block--${displayMode}`,
		style: {
			backgroundColor: backgroundColor || "#ffffff",
			paddingTop: `${blockPaddingTop}px`,
			paddingBottom: `${blockPaddingBottom}px`,
			"--container-max-width": `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? "px"}`,
			"--container-max-width-tablet": `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? "%"}`,
			"--container-max-width-mobile": `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? "%"}`,
			"--items-per-row": slidesPerViewDesktop,
			"--items-per-row-tablet": slidesPerViewTablet,
			"--items-per-row-mobile": slidesPerViewMobile,
			"--logos-gap": gap,
		},
		"data-display-mode": displayMode,
		"data-slider-speed": sliderSpeed,
		"data-slides-per-view": slidesPerViewDesktop,
		"data-slides-per-view-tablet": slidesPerViewTablet,
		"data-slides-per-view-mobile": slidesPerViewMobile,
		"data-gap": gap,
		"data-pause-on-hover": pauseOnHover,
		// Native HTML Anchor (supports.anchor) takes priority; blockId is a
		// legacy fallback kept only so already-published content that set a
		// custom Block ID via the old (now removed) sidebar field keeps
		// rendering with the same id and doesn't fail block validation.
		id: anchor || blockId || undefined
	});

	return (
		<div {...blockProps}>
			<div className={`logos-block__container ${containerMode === "constrained" ? "is-constrained" : ""}`}>
				{titleText && (
					<div style={{
						paddingTop: `${titlePaddingTop}px`,
						paddingBottom: `${titlePaddingBottom}px`,
						textAlign: "center"
					}}>
						<h2 style={{
							fontSize: `${titleFontSize}px`,
							fontWeight: titleFontWeight,
							color: titleColor,
							margin: 0,
							fontFamily: "inherit"
						}}>
							{titleText}
						</h2>
					</div>
				)}

				{displayMode === "grid" ? (
					<ul className="logos-block__grid">
						{slidesToRender.map((logo) => (
							<li key={logo._renderKey} className="logos-block__grid-item">
								{renderLogo(logo)}
							</li>
						))}
					</ul>
				) : (
					<section
						className="splide"
						aria-label="Partner Logos Slider"
					>
						<div className="splide__track">
							<ul className="splide__list">
								{slidesToRender.map((logo) => (
									<li key={logo._renderKey} className="splide__slide">
										{renderLogo(logo)}
									</li>
								))}
							</ul>
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
