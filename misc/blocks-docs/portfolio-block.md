# Portfolio Block Documentation

## Overview

In this article, we look at the Portfolio Block, an immersive gallery section that blends large-format typography, GSAP-powered transitions, and a modal slider. It highlights projects with hero titles, descriptive copy, tags, and an optional call-to-action button, making it ideal for agency portfolios or case study showcases.

## Adding the Portfolio Block to your page

### Locate and add the Portfolio Block

1. Type "/" and then type in "portfolio"
2. Select the Portfolio Block
3. The block appears with sample slides, gradient background, and CTA button

## Content Settings

### Heading Area

**Agency Title** - Main heading introducing the portfolio section  
- Default: "Our Work"  
- Font size default 40px with controllable font family, weight, and color

**Agency Description** - Supporting paragraph that sets context  
- Default text describes the team’s approach  
- Customize font size (18px default), family, weight, and color

**CTA Button Text** - Label for optional call-to-action  
- Default: "View Full Portfolio"  
- Button styling (color, background, hover state, underline) available via inspector

### Slides

**Slide Repeater** - Manage individual portfolio entries  
- Fields: title, description, URL, tags array, image, image ID  
- Default dataset features Startup Nights, APST Research, and sample placeholders  
- Tags render as badges in the modal carousel, highlighting project attributes

**Slide Typography**  
- Title font size 112px (oversized headings)  
- Description font size 20px, Tag font size 20px  
- Adjust to balance hierarchy across breakpoints

## Visual Styling

### Background & Colors

**Gradient Controls** - Configure linear/radial gradients with multiple stops  
- Defaults: linear gradient 135°, colors `#667eea` and `#764ba2`  
- Text color default #ffffff for high contrast

**Blur & Overlay**  
- `blurAmount` softens background imagery, emphasizing text  
- Border radius and z-index options fine-tune canvas layering

### Button Styling

- Toggle icon display and choose hover animation (`slide-underline` by default)  
- Customize underline color (default #ff4242), padding, margin, and weights  
- Button background defaults to transparent for minimalist design

## Modal Slider

- Clicking a slide opens a modal carousel showcasing project imagery and copy  
- Modal typography controls mirror slide settings for consistency  
- Tags and descriptions display alongside the gallery navigation  
- GSAP animations provide smooth transitions between slides

## Responsive Behavior

### Desktop (> 1024px)
- Large hero layout with bold slide titles and full-height gradient background  
- Modal slider occupies most of the viewport for immersive storytelling  
- CTA button positioned near description for quick access

### Tablet (768px - 1024px)
- Typography scales down to keep titles readable  
- Slides stack vertically; modal slider adapts to smaller viewports  
- Consider reducing tag count per slide to avoid wrapping

### Mobile (< 768px)
- Single-column layout with condensed typography  
- Modal slider provides swipe support; ensure imagery is optimized for vertical screens  
- CTA button spans full width for easy tapping

## Technical Features

### CSS Custom Properties

- Gradient colors, text colors, typography values, and button styling exposed for theme overrides  
- Modal fonts and tag colors controlled via CSS variables for consistent branding  
- Container classes support additional custom CSS or theme integration

### JavaScript Enhancements

- GSAP handles scroll/hover transitions and modal animations  
- Unique `blockId` prevents conflicts across multiple portfolio sections  
- `view.js` orchestrates slide activation, modal state, and keyboard navigation

## Usage Tips

1. **Curate Standout Projects** - Feature 4–6 flagship pieces with strong imagery.
2. **Include Key Metrics** - Use tags to highlight services, industries, or outcomes.
3. **Optimize Imagery** - Upload high-quality but compressed images for performance.
4. **Link to Case Studies** - Set slide URLs to detailed pages for deeper exploration.
5. **Refine Typography** - Tweak title and description sizes to suit your brand voice.

## Best Practices

- **Maintain Consistent Tags** - Reuse tag labels to build mental models for visitors.
- **Balance Copy Length** - Keep descriptions punchy to encourage modal exploration.
- **Check Modal Accessibility** - Ensure the modal close button and navigation are obvious.
- **Test on Devices** - Preview on tablets and phones to verify slide readability.
- **Align CTA Placement** - Position the button where it naturally follows the description.

## Accessibility

- **Keyboard Navigation** - Users can tab through slides and modal controls.  
- **Focus Management** - Modal traps focus until closed, following accessibility guidelines.  
- **Descriptive Text** - Ensure titles and descriptions communicate value without imagery.  
- **Contrast** - Maintain readable color contrast for text and buttons across backgrounds.

## Browser Compatibility

- **Modern Browsers** - Supports Chrome, Firefox, Safari, Edge with hardware-accelerated animations.  
- **Mobile Browsers** - Modal slider supports touch interactions on iOS and Android.  
- **Fallback** - Without JavaScript, slides remain static and accessible as a stacked list.

## Screenshots

### Desktop View
- Gradient hero with oversized slide title and CTA button  
- Horizontal slide selector revealing modal gallery on click  
- Rich color palette and large typography

### Tablet View
- Reduced title scale with stacked slide cards  
- Modal fits snugly within tablet viewport  
- Tags and copy remain legible

### Mobile View
- Single-column layout with swipe-enabled modal  
- CTA button spans full width  
- High-contrast text for readability on small screens



