import React from "react";

const svgMarkup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="5" fill="#F0F0F1"/>
<rect x="3" y="6" width="18" height="4" rx="1.2" fill="#D52940"/>
<rect x="3" y="12" width="8" height="1.6" rx="0.8" fill="#D52940"/>
<rect x="13" y="12" width="8" height="1.6" rx="0.8" fill="#D52940"/>
<rect x="3" y="16" width="18" height="1.6" rx="0.8" fill="#D52940"/>
</svg>`;

const HeaderIcon = () => (
	<span
		className="adaire-block-icon"
		dangerouslySetInnerHTML={{ __html: svgMarkup }}
	/>
);

export default HeaderIcon;
