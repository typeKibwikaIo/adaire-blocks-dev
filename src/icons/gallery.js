import React from "react";

const svgMarkup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="5" fill="#F0F0F1"/>
<rect x="4" y="4" width="11" height="9" rx="1.2" fill="none" stroke="#D52940" stroke-width="1.3"/>
<rect x="8" y="9" width="12" height="10" rx="1.2" fill="#D52940"/>
<circle cx="11.3" cy="12.4" r="1" fill="#F0F0F1"/>
<path d="M8.8 16.6L11.6 13.6L13.6 15.4L16 12.6L19.2 16.6" stroke="#F0F0F1" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const GalleryIcon = () => (
	<span
		className="adaire-block-icon"
		dangerouslySetInnerHTML={{ __html: svgMarkup }}
	/>
);

export default GalleryIcon;
