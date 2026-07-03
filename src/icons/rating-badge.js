import React from "react";

const svgMarkup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="5" fill="#6366F1"/>
<path d="M12 4.5L14.12 9.3L19.5 9.9L15.5 13.47L16.62 18.75L12 16.05L7.38 18.75L8.5 13.47L4.5 9.9L9.88 9.3L12 4.5Z" fill="white"/>
</svg>`;

const RatingBadgeIcon = () => (
	<span
		className="adaire-block-icon"
		dangerouslySetInnerHTML={{ __html: svgMarkup }}
	/>
);

export default RatingBadgeIcon;
