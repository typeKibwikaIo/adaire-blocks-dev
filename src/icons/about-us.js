import React from "react";

const svgMarkup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="5" fill="#F0F0F1"/>
<circle cx="12" cy="9.2" r="3.2" fill="#D52940"/>
<path d="M5.5 19.2C5.5 15.66 8.42 13 12 13C15.58 13 18.5 15.66 18.5 19.2C18.5 19.63 18.16 19.9 17.75 19.9H6.25C5.84 19.9 5.5 19.63 5.5 19.2Z" fill="#D52940"/>
</svg>`;

const AboutUsIcon = () => (
	<span
		className="adaire-block-icon"
		dangerouslySetInnerHTML={{ __html: svgMarkup }}
	/>
);

export default AboutUsIcon;
