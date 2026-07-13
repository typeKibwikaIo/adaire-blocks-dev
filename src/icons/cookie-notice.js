import React from "react";

const svgMarkup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="5" fill="#F0F0F1"/>
<circle cx="12" cy="12" r="7.5" fill="#D52940"/>
<circle cx="9" cy="9" r="1.1" fill="#F0F0F1"/>
<circle cx="14.6" cy="8.6" r="1" fill="#F0F0F1"/>
<circle cx="15.6" cy="13.6" r="1.2" fill="#F0F0F1"/>
<circle cx="10" cy="15.2" r="0.9" fill="#F0F0F1"/>
<circle cx="12.6" cy="11.6" r="0.8" fill="#F0F0F1"/>
</svg>`;

const CookieNoticeIcon = () => (
	<span
		className="adaire-block-icon"
		dangerouslySetInnerHTML={{ __html: svgMarkup }}
	/>
);

export default CookieNoticeIcon;
