import { SVG, Path, Rect } from '@wordpress/components';

const HeaderIcon = () => (
    <SVG width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Rect x="3" y="5" width="18" height="14" rx="2" fill="#F0F0F1" />
        <Rect x="5" y="7" width="14" height="3" rx="1" fill="#D52940" />
        <Path d="M6 13H10" stroke="#1D2327" strokeWidth="1.5" strokeLinecap="round" />
        <Path d="M12 13H18" stroke="#1D2327" strokeWidth="1.5" strokeLinecap="round" />
        <Path d="M6 16H18" stroke="#1D2327" strokeWidth="1.5" strokeLinecap="round" />
    </SVG>
);

export default HeaderIcon;
