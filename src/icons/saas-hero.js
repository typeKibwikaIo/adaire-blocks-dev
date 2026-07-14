import React from "react";

const svgMarkup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="5" fill="#F0F0F1"/>
<rect x="5" y="6" width="14" height="2.4" rx="1.2" fill="#D52940"/>
<rect x="7" y="10" width="10" height="1.6" rx="0.8" fill="#D52940"/>
<rect x="8.5" y="14.2" width="7" height="3.6" rx="1.8" fill="#D52940"/>
</svg>`;

const SaasHeroIcon = () => (
	<span
		className="adaire-block-icon"
		dangerouslySetInnerHTML={{ __html: svgMarkup }}
	/>
);

export default SaasHeroIcon;
