import { useBlockProps } from "@wordpress/block-editor";
import Logo1 from "./base/logoipsum.png";
import Logo2 from "./base/logoipsum2.png";
import Logo3 from "./base/logoipsum3.png";
import Logo4 from "./base/logoipsum4.png";

export default function save({ attributes }) {
	const { 
		partnerLogos = [], 
		sliderSpeed = 0.5, 
		slidesPerView = 4, 
		gap = "1rem", 
		pauseOnHover = true, 
		logoHeight = 60, 
		backgroundColor = "#ffffff",
		titleText = "Our Partners",
		titleFontSize = 24,
		titleFontWeight = "600",
		titleColor = "#333333",
		titlePaddingTop = 20,
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

	const blockProps = useBlockProps.save({
		className: "logos-block",
		style: {
			backgroundColor: backgroundColor || "#ffffff",
			paddingTop: `${blockPaddingTop}px`,
			paddingBottom: `${blockPaddingBottom}px`,
			"--container-max-width": `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? "px"}`,
			"--container-max-width-tablet": `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? "%"}`,
			"--container-max-width-mobile": `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? "%"}`,
		},
		"data-slider-speed": sliderSpeed,
		"data-slides-per-view": slidesPerView,
		"data-gap": gap,
		"data-pause-on-hover": pauseOnHover,
		id: blockId || undefined
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
				<section
					className="splide"
					aria-label="Partner Logos Slider"
				>
					<div className="splide__track">
						<ul className="splide__list">
							{logosToDisplay.map((logo, index) => (
								<li key={logo.id || index} className="splide__slide">
									<img
										src={logo.imageUrl || logo.image}
										alt={logo.companyName}
										style={{
											maxHeight: `${logoHeight}px`,
											maxWidth: "200px",
											objectFit: "contain",
										}}
									/>
								</li>
							))}
						</ul>
					</div>
				</section>
			</div>
		</div>
	);
}


