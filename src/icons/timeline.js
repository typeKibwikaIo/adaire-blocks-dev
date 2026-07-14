import React from "react";

const svgMarkup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="5" fill="#F0F0F1"/>
<rect x="11.1" y="4" width="1.8" height="16" rx="0.9" fill="#D52940"/>
<circle cx="12" cy="6.5" r="2.3" fill="#D52940"/>
<circle cx="12" cy="12" r="2.3" fill="#D52940"/>
<circle cx="12" cy="17.5" r="2.3" fill="#D52940"/>
<circle cx="12" cy="6.5" r="1" fill="#F0F0F1"/>
<circle cx="12" cy="12" r="1" fill="#F0F0F1"/>
<circle cx="12" cy="17.5" r="1" fill="#F0F0F1"/>
</svg>`;

const TimelineIcon = () => (
	<span
		className="adaire-block-icon"
		dangerouslySetInnerHTML={{ __html: svgMarkup }}
	/>
);

export default TimelineIcon;
