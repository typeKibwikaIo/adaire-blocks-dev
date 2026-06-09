# Services Block Documentation

## Overview

In this article, we look at the Services Block, a GSAP-powered showcase for highlighting service offerings or case studies. The block pairs a headline and description with an animated list of slides that react to scroll, creating a premium storytelling experience with gradients, typography controls, and tag metadata.

## Adding the Services Block to your page

### Locate and add the Services Block

1. Type "/" and then type in "services"
2. Select the Services Block
3. The block appears with sample slides, gradient background, and call-to-action link

## Content Settings

### Heading & Description

**Agency Title** - Main heading for the section  
- Default: "Our Work"  
- Adjust font family and size (default 40px) to match brand typography

**Agency Description** - Supporting copy beneath the title  
- Default describes portfolio highlights  
- Font size default: 18px; customize to improve readability

**CTA Button Text** - Text for the primary call-to-action link  
- Default: "View Full Portfolio"  
- Link target configured in the button inner block

### Slides

**Slide Repeater** - Manage individual service cards  
- Fields: title, description, URL, tags, image, image ID  
- Default dataset includes five example services  
- Tags display as badges; description offers a brief summary; URL points to more details

**Slide Typography**  
- Title font size (default 112px) creates bold oversized labels  
- Description font size (default 20px) balances readability  
- Tag font size (default 20px) controls badge text

## Visual Styling

### Background & Gradient

**Background Color** - Uses gradient or solid backgrounds  
- Default: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`  
- Customize gradient type (linear/radial), angle, color stops, and stop positions

**Text Color** - Global text color for the block  
- Default: #ffffff  
- Ensure contrast with chosen background

### Container Height

**Viewport Height Controls** - Different percentages for responsive breakpoints  
- Large Desktop: 80vh  
- Desktop: 70vh  
- Small Laptop: 65vh  
- Tablet Landscape: 60vh  
- Tablet Portrait: 55vh  
- Phone: 50vh  
- Adjust to control vertical space and scroll experience

## Animation Behaviour

- Powered by GSAP to create parallax-like motion as users scroll  
- Slides translate vertically while the active slide remains highlighted  
- Animation parameters are defined in `view.js`; enable smooth, hardware-accelerated transitions

## Responsive Behavior

### Desktop (> 1024px)
- Large typography and full-height gradient background create an immersive canvas  
- Scroll-triggered motion highlights each service sequentially  
- CTA button remains visible near the description

### Tablet (768px - 1024px)
- Container height reduces for comfortable viewing  
- Typography scales proportionally; consider lowering title size for shorter lines  
- Scroll animations remain smooth with touch gestures

### Mobile (< 768px)
- Vertical stacking keeps slides legible on narrow screens  
- Reduced viewport height prevents overwhelming users with oversized text  
- Ensure tags remain concise to avoid wrapping

## Technical Features

### CSS Custom Properties

- Background gradient colors and stops exposed for theme overrides  
- Typography variables for headline, description, slide content, and tags  
- Container height variables per breakpoint for fine-grained control

### JavaScript Integration

- GSAP timelines handle scroll animations and slide activation  
- `blockId` ensures multiple Services Blocks can coexist without conflicts  
- `view.js` calculates offsets and transforms for each slide

## Usage Tips

1. **Curate Slides Carefully** - Focus on 4–6 high-impact services to maintain pacing.
2. **Add Imagery** - Upload slide images to combine text with visual storytelling.
3. **Leverage Tags** - Use tags as quick descriptors (e.g., "Strategy", "UX", "Brand").
4. **Link Strategically** - Point slide URLs to case studies or service detail pages.
5. **Adjust Font Sizes** - Reduce title size if lines wrap on smaller laptops.

## Best Practices

- **Maintain Contrast** - Ensure text remains readable against gradient backgrounds.
- **Keep Copy Tight** - Short, punchy slide descriptions keep the animation engaging.
- **Test Performance** - GSAP animations are performant, but verify on older devices.
- **Consistent Imagery** - If using images, crop to similar aspect ratios for cohesion.
- **Preview Responsiveness** - Validate each breakpoint to confirm legible typography.

## Accessibility

- **Semantic Structure** - Slides render as structured HTML with headings and paragraphs.
- **Keyboard Navigation** - Content remains scrollable and accessible with standard keyboard controls.
- **Motion Sensitivity** - Consider providing alternate layouts or reduced motion CSS for sensitive users.
- **Readable Tags** - Ensure tag text meets contrast guidelines.

## Browser Compatibility

- **Modern Browsers** - Optimized for Chrome, Firefox, Safari, Edge with CSS transforms.
- **Mobile Browsers** - GSAP animations perform smoothly on iOS and Android.
- **Fallback** - If JavaScript is disabled, slides remain visible in a static vertical list.

## Screenshots

### Desktop View
- Full-height gradient background with large animated titles
- Slide stack with active item highlighted and tags displayed
- CTA button near descriptive text

### Tablet View
- Reduced typography and container height for balanced composition
- Scroll-triggered transitions remain fluid on touch devices
- Slides maintain spacing and readability

### Mobile View
- Vertical stack with single-column layout
- Titles and descriptions scaled for handheld screens
- CTA button prominently accessible below content



