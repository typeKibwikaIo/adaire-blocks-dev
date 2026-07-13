import React from "react";

const svgMarkup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="5" fill="#F0F0F1"/>
<circle cx="12" cy="11" r="7" fill="#D52940"/>
<path d="M12 7.2L13.2 9.9L16.1 10.3L14 12.3L14.6 15.2L12 13.7L9.4 15.2L10 12.3L7.9 10.3L10.8 9.9L12 7.2Z" fill="#F0F0F1"/>
<path d="M9 16.8L7.6 21.2L12 19.4L16.4 21.2L15 16.8Z" fill="#D52940"/>
</svg>`;

const RatingBadgeIcon = () => (
	<span
		className="adaire-block-icon"
		dangerouslySetInnerHTML={{ __html: svgMarkup }}
	/>
);

export default RatingBadgeIcon;
