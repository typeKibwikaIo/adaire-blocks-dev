# Particles Block Documentation

## Overview

In this article, we look at the Particles Block, an immersive storytelling section that scatters images (“particles”) across the viewport while synchronizing descriptive text with scroll progress. Powered by GSAP, the block is perfect for team intros, timelines, or brand narratives that benefit from motion and layered imagery.

## Adding the Particles Block to your page

### Locate and add the Particles Block

1. Type "/" and then type in "particles"
2. Select the Particles Block
3. The block appears with default particles, gradient overlay, and step-by-step text entries

## Content Settings

### Text Content

**Text Entries** - Ordered list of titles and descriptions that fade in/out as you scroll  
- Fields: title, description, appear at %, disappear at %  
- Default entries introduce team members with personalized descriptions  
- Adjust percentages to control when each entry appears relative to scroll

**Typography**  
- Title font size (default 65px) and weight configurable for dramatic headings  
- Body font size (default 22px) and weight keep copy readable over dark backgrounds  
- Margin controls manage spacing between titles and descriptions

### Particles

**Particle Properties** - Define scattered images or shapes  
- Fields: image URL, X/Y position (percent of viewport), size, mobile size, speed, animation toggle, type  
- Normal particles animate subtly; dynamic particles remain stationary and can act as background panels  
- Default configuration includes multiple empty image slots ready for custom uploads

**Animation**  
- `speed` controls parallax intensity; higher values move faster relative to scroll  
- `animationEnabled` toggles motion for individual particles  
- `type` can differentiate particle behavior (“normal” vs “dynamic”)

## Visual Styling

### Background & Overlay

**Section Height** - Overall height in pixels (default 950) to stage the animation  
- Increase for longer stories or more text entries

**Background Color** - Base color behind particles (default #0a0a0a)  
- Combine with particles that have transparent backgrounds for layered effects

**Gradient Overlay** - Adds depth and readability via an overlay object  
- Controls: start/end color, opacity, direction, angle, stop positions  
- Default provides a subtle vertical fade to keep text legible

**Text Color** - Global color for titles and descriptions (default #ffffff)

## Responsive Behavior

### Desktop (> 1024px)
- Full-height canvas with parallax motion as users scroll  
- Text entries appear sequentially, creating a storyboard effect  
- Particles leverage large sizes (up to 420px) for dramatic imagery

### Tablet (768px - 1024px)
- Mobile size attribute reduces particle dimensions to maintain balance  
- Text remains centered; adjust appear/disappear ranges if pacing feels fast  
- Touch scrolling maintains GSAP-driven animation smoothly

### Mobile (< 768px)
- Mobile particle sizes ensure images fit within narrow screens  
- Consider reducing section height to avoid excessive scroll length  
- Keep text concise to maintain readability on small displays

## Technical Features

### CSS Custom Properties

- Text colors, font sizes, and margins exposed as CSS variables  
- Overlay gradient values available for theme overrides  
- Section height accessible for custom media queries

### JavaScript Integration

- GSAP timelines handle particle movement, opacity changes, and text transitions  
- Unique `blockId` prevents animation conflicts across multiple instances  
- `textAnimationDuration` (default 0.35s) controls fade transitions

## Usage Tips

1. **Upload Transparent Images** - PNG or SVG assets create layered effects without hard edges.
2. **Balance Motion** - Mix animated and static particles to avoid overwhelming viewers.
3. **Curate Story Flow** - Align appear/disappear percentages with the narrative you want to tell.
4. **Optimize Performance** - Use compressed images to keep the section lightweight.
5. **Preview on Devices** - Verify that particles don’t obscure important text on small screens.

## Best Practices

- **Maintain Contrast** - Ensure text remains readable against imagery underneath.
- **Limit Particle Count** - Start with 6–8 particles; add more only if the design still feels spacious.
- **Consider Reduced Motion** - Offer alternate layouts or disable animations for users sensitive to motion.
- **Use Tags/Icons** - Combine text entries with icons or badges to reinforce messaging.
- **Test Scroll Speed** - Adjust section height and appear percentages to achieve comfortable pacing.

## Accessibility

- **Descriptive Text** - Ensure each entry communicates the story independently of visuals.
- **Keyboard Navigation** - Section remains scrollable with keyboard controls; no interactive traps.
- **Motion Sensitivity** - Consider a reduced-motion variant if your theme supports prefers-reduced-motion queries.
- **Alt Text** - Provide descriptive alt text for particle images if they convey meaningful information.

## Browser Compatibility

- **Modern Browsers** - Works in Chrome, Firefox, Safari, Edge with hardware-accelerated transforms.
- **Mobile Browsers** - GSAP animations perform smoothly on iOS and Android.
- **Fallback** - Without JavaScript, particles and text remain static, preserving narrative content.

## Screenshots

### Desktop View
- Dark background with scattered imagery and central headline
- Scroll-triggered text transitions introducing team members
- Particles drifting subtly to create depth

### Tablet View
- Reduced particle sizes and balanced spacing
- Text entries remain legible with modified pacing
- Touch scrolling retains parallax feel

### Mobile View
- Single-column storytelling with simplified particle positions
- Readable typography and shorter section height
- Smooth scrolling with minimal performance overhead



