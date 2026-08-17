import React from "react";

const svgMarkup = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="5" fill="#F0F0F1"/>
<path d="M7 3.5C7 2.94772 7.44772 2.5 8 2.5H14L18 6.5V20.5C18 21.0523 17.5523 21.5 17 21.5H8C7.44772 21.5 7 21.0523 7 20.5V3.5Z" fill="white" stroke="#111827" stroke-width="1.2"/>
<path d="M14 2.5V6C14 6.27614 14.2239 6.5 14.5 6.5H18" stroke="#111827" stroke-width="1.2" stroke-linejoin="round"/>
<rect x="9" y="10.6" width="6.5" height="4.2" rx="0.9" fill="#D52940"/>
<path d="M10 11.9H14.5M10 12.9H13.2" stroke="white" stroke-width="0.6" stroke-linecap="round"/>
<path d="M9 16.9H15.5" stroke="#111827" stroke-width="1" stroke-linecap="round"/>
<path d="M9 18.4H12.8" stroke="#111827" stroke-width="1" stroke-linecap="round"/>
</svg>`;

const PdfReaderIcon = () => (
	<span
		className="adaire-block-icon"
		dangerouslySetInnerHTML={{ __html: svgMarkup }}
	/>
);

export default PdfReaderIcon;
