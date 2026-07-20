import React from "react";

const svgMarkup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="5" fill="#6366F1"/>
<path d="M12 4C9 7 7 9.8 7 12.5A5 5 0 0 0 12 17.5A5 5 0 0 0 17 12.5C17 9.8 15 7 12 4Z" fill="white"/>
<circle cx="10.5" cy="11.5" r="0.9" fill="#6366F1"/>
<circle cx="13" cy="14" r="0.7" fill="#6366F1"/>
</svg>`;

const CookieBannerIcon = () => (
	<span
		className="adaire-block-icon"
		dangerouslySetInnerHTML={{ __html: svgMarkup }}
	/>
);

export default CookieBannerIcon;
